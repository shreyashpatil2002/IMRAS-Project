const Batch = require('../models/Batch');
const Product = require('../models/Product');

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
    
    const batch = await Batch.findById(req.params.id).populate('product');

    if (!batch) {
      return res.status(404).json({
        status: 'error',
        message: 'Batch not found'
      });
    }

    // Update batch quantity
    const oldQuantity = batch.currentQuantity;
    batch.currentQuantity += adjustment;

    if (batch.currentQuantity < 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Insufficient batch quantity'
      });
    }

    batch.notes = notes || batch.notes;
    await batch.save();

    // Update product quantity
    const product = batch.product;
    product.quantity += adjustment;
    await product.save();

    res.status(200).json({
      status: 'success',
      message: 'Batch quantity adjusted successfully',
      data: { 
        batch,
        adjustment: {
          oldQuantity,
          newQuantity: batch.currentQuantity,
          change: adjustment,
          reason
        }
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
