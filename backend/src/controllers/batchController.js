const Batch = require('../models/Batch');
const Product = require('../models/Product');
const StockLedger = require('../models/StockLedger');
const SKU = require('../models/SKU');

// @desc    Get all batches
// @route   GET /api/batches
// @access  Private
exports.getAllBatches = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let query = {};

    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Search by batch number or product
    if (search) {
      query.batchNumber = { $regex: search, $options: 'i' };
    }

    const batches = await Batch.find(query)
      .populate('product', 'name sku category')
      .populate('supplier', 'name email phone')
      .populate('warehouse', 'name code location')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: batches.length,
      data: { batches }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single batch
// @route   GET /api/batches/:id
// @access  Private
exports.getBatch = async (req, res, next) => {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate('product', 'name sku category image')
      .populate('supplier', 'name email phone address')
      .populate('warehouse', 'name code location address');

    if (!batch) {
      return res.status(404).json({
        status: 'error',
        message: 'Batch not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { batch }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new batch
// @route   POST /api/batches
// @access  Private (Admin, Manager)
exports.createBatch = async (req, res, next) => {
  try {
    const { product: productId, initialQuantity } = req.body;

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    // Create batch
    const batch = await Batch.create({
      ...req.body,
      currentQuantity: initialQuantity
    });

    // Update product quantity
    product.quantity += initialQuantity;
    await product.save();

    res.status(201).json({
      status: 'success',
      message: 'Batch created successfully',
      data: { batch }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update batch
// @route   PUT /api/batches/:id
// @access  Private (Admin, Manager)
exports.updateBatch = async (req, res, next) => {
  try {
    const batch = await Batch.findById(req.params.id).populate('product');

    if (!batch) {
      return res.status(404).json({
        status: 'error',
        message: 'Batch not found'
      });
    }

    const oldLocation = batch.location;
    const newLocation = req.body.location;

    // Check if this is a putaway operation (location change from RECEIVING)
    const isPutaway = newLocation && 
                      oldLocation && 
                      oldLocation.startsWith('RECEIVING') && 
                      !newLocation.startsWith('RECEIVING');

    // Update batch
    Object.assign(batch, req.body);
    await batch.save();

    // If putaway, update the location in the most recent stock ledger entry for this batch
    if (isPutaway) {
      const StockLedger = require('../models/StockLedger');
      
      // Parse the new location
      const locationParts = newLocation.split('-');
      const locationObj = {
        aisle: locationParts[0],
        bin: locationParts.length > 2 ? locationParts[2] : locationParts[1]
      };

      // Find the most recent stock ledger entry for this batch and warehouse
      const ledgerEntry = await StockLedger.findOne({
        batchNumber: batch.batchNumber,
        warehouse: batch.warehouse,
        movementType: { $in: ['INWARD', 'TRANSFER_IN'] }
      }).sort({ transactionDate: -1 });

      if (ledgerEntry) {
        // Update the location in the existing entry
        ledgerEntry.location = locationObj;
        ledgerEntry.remarks = ledgerEntry.remarks 
          ? `${ledgerEntry.remarks} | Putaway: ${newLocation}` 
          : `Putaway: Moved to ${newLocation}`;
        await ledgerEntry.save();
        
        console.log(`Updated stock ledger location for batch ${batch.batchNumber} to ${newLocation}`);
      }
    }

    res.status(200).json({
      status: 'success',
      message: 'Batch updated successfully',
      data: { batch }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Adjust batch quantity
// @route   PATCH /api/batches/:id/adjust
// @access  Private (Admin, Manager)
exports.adjustBatchQuantity = async (req, res, next) => {
  try {
    const { adjustment, reason, notes } = req.body;
    
    const batch = await Batch.findById(req.params.id)
      .populate('product')
      .populate('warehouse', 'name code');

    if (!batch) {
      return res.status(404).json({
        status: 'error',
        message: 'Batch not found'
      });
    }

    // Update batch quantity
    const oldQuantity = batch.currentQuantity;
    const adjustmentValue = parseInt(adjustment);
    batch.currentQuantity += adjustmentValue;

    if (batch.currentQuantity < 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Insufficient batch quantity'
      });
    }

    // Add notes if provided
    if (notes) {
      batch.notes = notes;
    }
    
    await batch.save();

    // Update product quantity
    const product = batch.product;
    product.quantity += adjustmentValue;
    await product.save();

    // Find the SKU ObjectId from the SKU code
    const skuDoc = await SKU.findOne({ skuCode: product.sku });
    
    if (!skuDoc) {
      return res.status(404).json({
        status: 'error',
        message: `SKU not found for code: ${product.sku}`
      });
    }

    // Get the current balance from the latest stock ledger entry
    const latestLedgerEntry = await StockLedger.findOne({
      sku: skuDoc._id,
      warehouse: batch.warehouse._id
    }).sort({ transactionDate: -1 });

    const previousBalance = latestLedgerEntry ? latestLedgerEntry.balanceQuantity : 0;
    const newBalance = previousBalance + adjustmentValue;

    // Create stock ledger entry
    const reasonMap = {
      'damaged': 'Damaged/Lost Stock',
      'returned': 'Customer Return',
      'adjustment': 'Manual Stock Adjustment'
    };

    const stockLedgerEntry = await StockLedger.create({
      sku: skuDoc._id,
      warehouse: batch.warehouse._id,
      location: batch.location ? {
        aisle: batch.location.split('-')[0],
        bin: batch.location.split('-').length > 2 ? batch.location.split('-')[2] : batch.location.split('-')[1]
      } : undefined,
      movementType: 'ADJUSTMENT',
      quantity: adjustmentValue,
      batchNumber: batch.batchNumber,
      expiryDate: batch.expiryDate,
      referenceType: 'ADJUSTMENT',
      referenceId: batch._id,
      balanceQuantity: newBalance,
      user: req.user._id,
      remarks: `${reasonMap[reason] || 'Stock Adjustment'}: ${adjustmentValue > 0 ? 'Added' : 'Removed'} ${Math.abs(adjustmentValue)} units. ${notes || ''}`.trim(),
      transactionDate: new Date()
    });

    // Populate the stock ledger entry for response
    await stockLedgerEntry.populate([
      { path: 'user', select: 'name email role' },
      { path: 'warehouse', select: 'name code' },
      { path: 'sku', select: 'skuCode' }
    ]);

    res.status(200).json({
      status: 'success',
      message: 'Batch quantity adjusted successfully',
      data: { 
        batch,
        adjustment: {
          oldQuantity,
          newQuantity: batch.currentQuantity,
          change: adjustmentValue,
          reason: reasonMap[reason] || reason
        },
        stockLedger: stockLedgerEntry
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete batch
// @route   DELETE /api/batches/:id
// @access  Private (Admin)
exports.deleteBatch = async (req, res, next) => {
  try {
    const batch = await Batch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({
        status: 'error',
        message: 'Batch not found'
      });
    }

    await batch.deleteOne();

    res.status(200).json({
      status: 'success',
      message: 'Batch deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get batch statistics
// @route   GET /api/batches/stats/overview
// @access  Private
exports.getBatchStats = async (req, res, next) => {
  try {
    const totalBatches = await Batch.countDocuments();
    const active = await Batch.countDocuments({ status: 'Active' });
    const lowStock = await Batch.countDocuments({ status: 'Low Stock' });
    const expiringSoon = await Batch.countDocuments({ status: 'Expiring Soon' });
    const depleted = await Batch.countDocuments({ status: 'Depleted' });
    const expired = await Batch.countDocuments({ status: 'Expired' });

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          totalBatches,
          active,
          lowStock,
          expiringSoon,
          depleted,
          expired
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
