const WarehouseTransfer = require('../models/WarehouseTransfer');
const Batch = require('../models/Batch');
const stockService = require('../services/stockService');

// @desc    Get all transfers
// @route   GET /api/transfers
// @access  Private
exports.getAllTransfers = async (req, res, next) => {
  try {
    const { status, sourceWarehouse, destinationWarehouse } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (sourceWarehouse) query.sourceWarehouse = sourceWarehouse;
    if (destinationWarehouse) query.destinationWarehouse = destinationWarehouse;

    const transfers = await WarehouseTransfer.find(query)
      .populate('sourceWarehouse', 'code name')
      .populate('destinationWarehouse', 'code name')
      .populate('items.sku', 'skuCode name')
      .populate('requestedBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: transfers.length,
      data: { transfers }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single transfer
// @route   GET /api/transfers/:id
// @access  Private
exports.getTransfer = async (req, res, next) => {
  try {
    const transfer = await WarehouseTransfer.findById(req.params.id)
      .populate('sourceWarehouse')
      .populate('destinationWarehouse')
      .populate('items.sku', 'skuCode name unitCost')
      .populate('requestedBy approvedBy');

    if (!transfer) {
      return res.status(404).json({
        status: 'error',
        message: 'Transfer not found'
      });
    }

    // Fetch batch location for each item
    const Batch = require('../models/Batch');
    const itemsWithLocation = await Promise.all(transfer.items.map(async (item) => {
      if (item.batchNumber) {
        const batch = await Batch.findOne({
          batchNumber: item.batchNumber,
          warehouse: transfer.sourceWarehouse._id
        }).select('location');
        
        return {
          ...item.toObject(),
          location: batch?.location || null
        };
      }
      return item.toObject();
    }));

    const transferData = transfer.toObject();
    transferData.items = itemsWithLocation;

    res.status(200).json({
      status: 'success',
      data: { transfer: transferData }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create transfer request
// @route   POST /api/transfers
// @access  Private (Staff, Manager)
exports.createTransfer = async (req, res, next) => {
  try {
    // Generate transfer number
    const year = new Date().getFullYear();
    const lastTransfer = await WarehouseTransfer.findOne()
      .sort({ createdAt: -1 })
      .select('transferNumber');
    
    let nextNumber = 1;
    if (lastTransfer && lastTransfer.transferNumber) {
      const lastNumber = parseInt(lastTransfer.transferNumber.split('-')[1]);
      nextNumber = lastNumber + 1;
    }
    
    const transferNumber = `WT-${String(nextNumber).padStart(6, '0')}-${year}`;
    
    const transferData = {
      ...req.body,
      transferNumber,
      requestedBy: req.user._id
    };

    const transfer = await WarehouseTransfer.create(transferData);

    res.status(201).json({
      status: 'success',
      message: 'Transfer request created successfully',
      data: { transfer }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve transfer
// @route   POST /api/transfers/:id/approve
// @access  Private (Manager, Admin)
exports.approveTransfer = async (req, res, next) => {
  try {
    const transfer = await WarehouseTransfer.findById(req.params.id);

    if (!transfer) {
      return res.status(404).json({
        status: 'error',
        message: 'Transfer not found'
      });
    }

    if (transfer.status !== 'REQUESTED') {
      return res.status(400).json({
        status: 'error',
        message: 'Transfer must be in REQUESTED status'
      });
    }

    // Check stock availability
    for (const item of transfer.items) {
      const stock = await stockService.getCurrentStock(item.sku, transfer.sourceWarehouse);
      if (stock < item.quantity) {
        return res.status(400).json({
          status: 'error',
          message: `Insufficient stock for SKU ${item.sku}`
        });
      }
    }

    transfer.status = 'APPROVED';
    transfer.approvedBy = req.user._id;
    transfer.approvalDate = new Date();
    await transfer.save();

    res.status(200).json({
      status: 'success',
      message: 'Transfer approved successfully',
      data: { transfer }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Dispatch transfer
// @route   POST /api/transfers/:id/dispatch
// @access  Private (Staff, Manager)
exports.dispatchTransfer = async (req, res, next) => {
  try {
    const transfer = await WarehouseTransfer.findById(req.params.id)
      .populate('sourceWarehouse', 'name code')
      .populate('destinationWarehouse', 'name code');

    if (!transfer) {
      return res.status(404).json({
        status: 'error',
        message: 'Transfer not found'
      });
    }

    if (transfer.status !== 'APPROVED') {
      return res.status(400).json({
        status: 'error',
        message: 'Transfer must be approved first'
      });
    }

    // Process each item: update batch quantities and create stock movements
    for (const item of transfer.items) {
      // Find and update batch in source warehouse
      const batch = await Batch.findOne({
        batchNumber: item.batchNumber,
        warehouse: transfer.sourceWarehouse._id
      });

      if (!batch) {
        return res.status(404).json({
          status: 'error',
          message: `Batch ${item.batchNumber} not found in source warehouse`
        });
      }

      // Check if enough quantity is available
      if (batch.currentQuantity < item.quantity) {
        return res.status(400).json({
          status: 'error',
          message: `Insufficient quantity in batch ${item.batchNumber}. Available: ${batch.currentQuantity}, Required: ${item.quantity}`
        });
      }

      // Deduct quantity from source batch
      batch.currentQuantity -= item.quantity;
      await batch.save();

      // Parse location for stock ledger
      let locationObj = undefined;
      if (batch.location) {
        const parts = batch.location.split('-');
        if (parts.length >= 2) {
          locationObj = {
            aisle: parts[0],
            bin: parts.length > 2 ? parts[2] : parts[1]
          };
        }
      }

      // Create TRANSFER_OUT stock ledger entry
      await stockService.recordMovement({
        sku: item.sku,
        warehouse: transfer.sourceWarehouse._id,
        movementType: 'TRANSFER_OUT',
        quantity: item.quantity,
        referenceType: 'TRANSFER',
        referenceId: transfer._id,
        user: req.user._id,
        batchNumber: item.batchNumber,
        expiryDate: item.expiryDate,
        location: locationObj,
        remarks: `Transfer OUT to ${transfer.destinationWarehouse.name} (${transfer.destinationWarehouse.code}) - ${transfer.transferNumber}`
      });
    }

    transfer.status = 'IN_TRANSIT';
    transfer.dispatchedBy = req.user._id;
    transfer.dispatchedDate = new Date();
    await transfer.save();

    res.status(200).json({
      status: 'success',
      message: 'Transfer dispatched successfully',
      data: { transfer }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Receive transfer
// @route   POST /api/transfers/:id/receive
// @access  Private (Staff, Manager)
exports.receiveTransfer = async (req, res, next) => {
  try {
    const transfer = await WarehouseTransfer.findById(req.params.id)
      .populate('sourceWarehouse', 'name code')
      .populate('destinationWarehouse', 'name code')
      .populate('items.sku');

    if (!transfer) {
      return res.status(404).json({
        status: 'error',
        message: 'Transfer not found'
      });
    }

    if (transfer.status !== 'IN_TRANSIT') {
      return res.status(400).json({
        status: 'error',
        message: 'Transfer must be in transit'
      });
    }

    // Process each item: create/update batch in destination warehouse and create stock movements
    for (const item of transfer.items) {
      // Check if batch already exists in destination warehouse
      let destinationBatch = await Batch.findOne({
        batchNumber: item.batchNumber,
        warehouse: transfer.destinationWarehouse._id
      });

      if (destinationBatch) {
        // Batch exists, update quantity
        destinationBatch.currentQuantity += item.quantity;
        await destinationBatch.save();
      } else {
        // Create new batch in destination warehouse
        // Get the original batch info from source warehouse
        const sourceBatch = await Batch.findOne({
          batchNumber: item.batchNumber
        }).populate('product supplier');

        if (!sourceBatch) {
          return res.status(404).json({
            status: 'error',
            message: `Source batch ${item.batchNumber} not found`
          });
        }

        destinationBatch = await Batch.create({
          batchNumber: item.batchNumber,
          product: sourceBatch.product._id,
          initialQuantity: item.quantity,
          currentQuantity: item.quantity,
          receivedDate: new Date(),
          expiryDate: item.expiryDate || sourceBatch.expiryDate,
          location: `RECEIVING-${transfer.destinationWarehouse._id}`,
          warehouse: transfer.destinationWarehouse._id,
          supplier: sourceBatch.supplier,
          notes: `Transferred from ${transfer.sourceWarehouse.name} - ${transfer.transferNumber}`
        });
      }

      // Parse location for stock ledger
      let locationObj = undefined;
      if (destinationBatch.location) {
        const parts = destinationBatch.location.split('-');
        if (parts.length >= 2) {
          locationObj = {
            aisle: parts[0],
            bin: parts.length > 2 ? parts[2] : parts[1]
          };
        }
      }

      // Create TRANSFER_IN stock ledger entry
      await stockService.recordMovement({
        sku: item.sku._id || item.sku,
        warehouse: transfer.destinationWarehouse._id,
        movementType: 'TRANSFER_IN',
        quantity: item.quantity,
        referenceType: 'TRANSFER',
        referenceId: transfer._id,
        user: req.user._id,
        batchNumber: item.batchNumber,
        expiryDate: item.expiryDate,
        location: locationObj,
        remarks: `Transfer IN from ${transfer.sourceWarehouse.name} (${transfer.sourceWarehouse.code}) - ${transfer.transferNumber}`
      });
    }

    transfer.status = 'RECEIVED';
    transfer.receivedBy = req.user._id;
    transfer.receivedDate = new Date();
    await transfer.save();

    res.status(200).json({
      status: 'success',
      message: 'Transfer received successfully',
      data: { transfer }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject transfer
// @route   POST /api/transfers/:id/reject
// @access  Private (Manager, Admin)
exports.rejectTransfer = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const transfer = await WarehouseTransfer.findById(req.params.id);

    if (!transfer) {
      return res.status(404).json({
        status: 'error',
        message: 'Transfer not found'
      });
    }

    if (transfer.status !== 'REQUESTED') {
      return res.status(400).json({
        status: 'error',
        message: 'Can only reject transfer in REQUESTED status'
      });
    }

    transfer.status = 'REJECTED';
    transfer.rejectionReason = reason;
    await transfer.save();

    res.status(200).json({
      status: 'success',
      message: 'Transfer rejected',
      data: { transfer }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete transfer
// @route   DELETE /api/transfers/:id
// @access  Private (Admin only)
exports.deleteTransfer = async (req, res, next) => {
  try {
    const transfer = await WarehouseTransfer.findById(req.params.id);

    if (!transfer) {
      return res.status(404).json({
        status: 'error',
        message: 'Transfer not found'
      });
    }

    // Only allow deletion of APPROVED or REJECTED transfers
    if (transfer.status !== 'APPROVED' && transfer.status !== 'REJECTED') {
      return res.status(400).json({
        status: 'error',
        message: 'Can only delete transfers with APPROVED or REJECTED status'
      });
    }

    await WarehouseTransfer.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Transfer deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
