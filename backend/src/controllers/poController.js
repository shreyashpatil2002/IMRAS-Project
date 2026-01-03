const PurchaseOrder = require('../models/PurchaseOrder');
const Batch = require('../models/Batch');
const SKU = require('../models/SKU');
const Product = require('../models/Product');
const stockService = require('../services/stockService');

// @desc    Get all POs
// @route   GET /api/purchase-orders
// @access  Private
exports.getAllPOs = async (req, res, next) => {
  try {
    const { status, supplier, warehouse } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (supplier) query.supplier = supplier;
    if (warehouse) query.warehouse = warehouse;

    const pos = await PurchaseOrder.find(query)
      .populate('supplier', 'name email phone')
      .populate('warehouse', 'code name')
      .populate('items.sku', 'skuCode name')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .populate('requisition', 'prNumber')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: pos.length,
      data: { pos }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single PO
// @route   GET /api/purchase-orders/:id
// @access  Private
exports.getPO = async (req, res, next) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id)
      .populate('supplier', 'name email phone address contact')
      .populate('warehouse', 'code name address')
      .populate('items.sku', 'skuCode name unitCost')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .populate('requisition');

    if (!po) {
      return res.status(404).json({
        status: 'error',
        message: 'Purchase Order not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { po }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new PO
// @route   POST /api/purchase-orders
// @access  Private (Manager, Admin)
exports.createPO = async (req, res, next) => {
  try {
    const poData = {
      ...req.body,
      createdBy: req.user._id
    };

    const po = await PurchaseOrder.create(poData);

    res.status(201).json({
      status: 'success',
      message: 'Purchase Order created successfully',
      data: { po }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update PO
// @route   PUT /api/purchase-orders/:id
// @access  Private (Manager, Admin)
exports.updatePO = async (req, res, next) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);

    if (!po) {
      return res.status(404).json({
        status: 'error',
        message: 'Purchase Order not found'
      });
    }

    // Only allow updates if PO is CREATED
    if (po.status !== 'CREATED') {
      return res.status(400).json({
        status: 'error',
        message: 'Can only update PO in CREATED status'
      });
    }

    Object.assign(po, req.body);
    await po.save();

    res.status(200).json({
      status: 'success',
      message: 'Purchase Order updated successfully',
      data: { po }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve PO
// @route   POST /api/purchase-orders/:id/approve
// @access  Private (Admin)
exports.approvePO = async (req, res, next) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);

    if (!po) {
      return res.status(404).json({
        status: 'error',
        message: 'Purchase Order not found'
      });
    }

    if (po.status !== 'CREATED') {
      return res.status(400).json({
        status: 'error',
        message: 'PO must be in CREATED status to approve'
      });
    }

    po.status = 'APPROVED';
    po.approvedBy = req.user._id;
    po.approvalDate = new Date();
    await po.save();

    res.status(200).json({
      status: 'success',
      message: 'Purchase Order approved successfully',
      data: { po }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send PO to supplier
// @route   POST /api/purchase-orders/:id/send
// @access  Private (Admin, Manager)
exports.sendPO = async (req, res, next) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);

    if (!po) {
      return res.status(404).json({
        status: 'error',
        message: 'Purchase Order not found'
      });
    }

    if (po.status !== 'APPROVED') {
      return res.status(400).json({
        status: 'error',
        message: 'PO must be approved before sending'
      });
    }

    po.status = 'SENT';
    po.sentDate = new Date();
    await po.save();

    // TODO: Implement email sending logic here using Nodemailer

    res.status(200).json({
      status: 'success',
      message: 'Purchase Order sent to supplier',
      data: { po }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Receive PO items
// @route   POST /api/purchase-orders/:id/receive
// @access  Private (Staff, Manager)
exports.receivePO = async (req, res, next) => {
  try {
    const { items, receivedDate } = req.body;
    // items format: [{ skuId, receivedQuantity, batchNumber, expiryDate }]

    const po = await PurchaseOrder.findById(req.params.id)
      .populate('warehouse', 'name code')
      .populate('supplier', 'name');

    if (!po) {
      return res.status(404).json({
        status: 'error',
        message: 'Purchase Order not found'
      });
    }

    if (po.status !== 'SENT' && po.status !== 'PARTIALLY_RECEIVED') {
      return res.status(400).json({
        status: 'error',
        message: 'PO must be in SENT or PARTIALLY_RECEIVED status'
      });
    }

    // Update received quantities and create stock ledger entries
    for (const receivedItem of items) {
      // Extract warehouse and supplier IDs at the start (handle both ObjectId and populated object)
      const warehouseId = po.warehouse?._id || po.warehouse;
      const supplierId = po.supplier?._id || po.supplier;
      
      const poItem = po.items.find(i => i.sku.toString() === receivedItem.skuId);
      
      if (!poItem) {
        return res.status(400).json({
          status: 'error',
          message: `SKU ${receivedItem.skuId} not found in PO`
        });
      }

      // Update received quantity
      poItem.receivedQuantity += receivedItem.receivedQuantity;

      // Get SKU details for batch creation
      const sku = await SKU.findById(receivedItem.skuId);

      // Create or update batch record for tracking
      if (receivedItem.batchNumber && sku) {
        const existingBatch = await Batch.findOne({ batchNumber: receivedItem.batchNumber });
        
        if (existingBatch) {
          // Update existing batch
          existingBatch.currentQuantity += receivedItem.receivedQuantity;
          existingBatch.initialQuantity += receivedItem.receivedQuantity;
          await existingBatch.save();
        } else {
          // Find or create product for this SKU
          let product = await Product.findOne({ sku: sku.skuCode });
          
          if (!product) {
            // Create product if it doesn't exist with all required fields
            product = await Product.create({
              name: sku.name,
              sku: sku.skuCode,
              category: sku.category || 'Other',
              description: `Product for SKU ${sku.skuCode}`,
              unitCost: 0,
              sellingPrice: 0,
              quantity: 0,
              location: 'WAREHOUSE',
              batchTrackingEnabled: true
            });
          }

          // Create new batch record
          await Batch.create({
            batchNumber: receivedItem.batchNumber,
            product: product._id,
            initialQuantity: receivedItem.receivedQuantity,
            currentQuantity: receivedItem.receivedQuantity,
            receivedDate: receivedDate || new Date(),
            expiryDate: receivedItem.expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            location: `RECEIVING-${warehouseId}`,
            warehouse: warehouseId,
            supplier: supplierId,
            status: 'Active',
            notes: `Received via PO ${po.poNumber}`
          });
        }
      }

      // Record stock inward movement
      await stockService.recordMovement({
        sku: receivedItem.skuId,
        warehouse: warehouseId,
        movementType: 'INWARD',
        quantity: receivedItem.receivedQuantity,
        referenceType: 'PO',
        referenceId: po._id,
        user: req.user._id,
        batchNumber: receivedItem.batchNumber,
        expiryDate: receivedItem.expiryDate,
        remarks: `Received from PO ${po.poNumber}`
      });
    }

    // Check if all items fully received
    const allReceived = po.items.every(item => item.receivedQuantity >= item.orderedQuantity);
    
    if (allReceived) {
      po.status = 'RECEIVED';
      po.actualDeliveryDate = receivedDate || new Date();
    } else {
      po.status = 'PARTIALLY_RECEIVED';
    }

    await po.save();

    res.status(200).json({
      status: 'success',
      message: 'Purchase Order items received successfully',
      data: { po }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel PO
// @route   POST /api/purchase-orders/:id/cancel
// @access  Private (Admin)
exports.cancelPO = async (req, res, next) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);

    if (!po) {
      return res.status(404).json({
        status: 'error',
        message: 'Purchase Order not found'
      });
    }

    if (['RECEIVED', 'CLOSED', 'CANCELLED'].includes(po.status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot cancel PO in current status'
      });
    }

    po.status = 'CANCELLED';
    await po.save();

    res.status(200).json({
      status: 'success',
      message: 'Purchase Order cancelled successfully',
      data: { po }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Close PO
// @route   POST /api/purchase-orders/:id/close
// @access  Private (Admin, Manager)
exports.closePO = async (req, res, next) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);

    if (!po) {
      return res.status(404).json({
        status: 'error',
        message: 'Purchase Order not found'
      });
    }

    if (po.status !== 'RECEIVED') {
      return res.status(400).json({
        status: 'error',
        message: 'PO must be fully received before closing'
      });
    }

    po.status = 'CLOSED';
    await po.save();

    res.status(200).json({
      status: 'success',
      message: 'Purchase Order closed successfully',
      data: { po }
    });
  } catch (error) {
    next(error);
  }
};
