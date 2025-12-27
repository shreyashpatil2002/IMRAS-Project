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
      .populate('supplier', 'name email phone address');

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
    const batch = await Batch.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!batch) {
      return res.status(404).json({
        status: 'error',
        message: 'Batch not found'
      });
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
