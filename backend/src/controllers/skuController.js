const SKU = require('../models/SKU');
const stockService = require('../services/stockService');
const Batch = require('../models/Batch');
const Product = require('../models/Product');

// @desc    Get all SKUs
// @route   GET /api/skus
// @access  Private
exports.getAllSKUs = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    
    let query = {};
    
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { skuCode: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ];
    }

    const skus = await SKU.find(query)
      .populate('defaultWarehouse', 'code name')
      .populate('supplier', 'name')
      .sort({ skuCode: 1 });

    res.status(200).json({
      status: 'success',
      results: skus.length,
      data: { skus }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single SKU
// @route   GET /api/skus/:id
// @access  Private
exports.getSKU = async (req, res, next) => {
  try {
    const sku = await SKU.findById(req.params.id)
      .populate('defaultWarehouse', 'code name')
      .populate('supplier', 'name email phone');

    if (!sku) {
      return res.status(404).json({
        status: 'error',
        message: 'SKU not found'
      });
    }

    // Get current stock levels
    const totalStock = await stockService.getTotalStock(sku._id);
    const warehouseStock = sku.defaultWarehouse 
      ? await stockService.getCurrentStock(sku._id, sku.defaultWarehouse._id)
      : 0;

    res.status(200).json({
      status: 'success',
      data: {
        sku,
        stock: {
          total: totalStock,
          warehouse: warehouseStock
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new SKU
// @route   POST /api/skus
// @access  Private (Admin, Manager)
exports.createSKU = async (req, res, next) => {
  try {
    const sku = await SKU.create(req.body);

    res.status(201).json({
      status: 'success',
      message: 'SKU created successfully',
      data: { sku }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update SKU
// @route   PUT /api/skus/:id
// @access  Private (Admin, Manager)
exports.updateSKU = async (req, res, next) => {
  try {
    const sku = await SKU.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!sku) {
      return res.status(404).json({
        status: 'error',
        message: 'SKU not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'SKU updated successfully',
      data: { sku }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete SKU
// @route   DELETE /api/skus/:id
// @access  Private (Admin)
exports.deleteSKU = async (req, res, next) => {
  try {
    const sku = await SKU.findByIdAndDelete(req.params.id);

    if (!sku) {
      return res.status(404).json({
        status: 'error',
        message: 'SKU not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'SKU deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get stock levels for SKU
// @route   GET /api/skus/:id/stock
// @access  Private
exports.getSKUStock = async (req, res, next) => {
  try {
    const { warehouseId } = req.query;
    
    // Get SKU details
    const sku = await SKU.findById(req.params.id);
    if (!sku) {
      return res.status(404).json({
        status: 'error',
        message: 'SKU not found'
      });
    }

    let currentStock = 0;

    if (warehouseId) {
      // Find all products that have this SKU code
      const products = await Product.find({ sku: sku.skuCode });
      
      if (products.length > 0) {
        const productIds = products.map(p => p._id);
        
        // Sum up currentQuantity from all batches for these products at this warehouse
        const batches = await Batch.find({
          product: { $in: productIds },
          warehouse: warehouseId
        });
        
        currentStock = batches.reduce((sum, batch) => sum + (batch.currentQuantity || 0), 0);
      }
    } else {
      // Get total stock across all warehouses
      const products = await Product.find({ sku: sku.skuCode });
      
      if (products.length > 0) {
        const productIds = products.map(p => p._id);
        
        const batches = await Batch.find({
          product: { $in: productIds }
        });
        
        currentStock = batches.reduce((sum, batch) => sum + (batch.currentQuantity || 0), 0);
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        skuId: sku._id,
        skuCode: sku.skuCode,
        currentStock: currentStock,
        minStock: sku.minStock,
        maxStock: sku.maxStock,
        safetyStock: sku.safetyStock,
        needsReorder: currentStock <= sku.minStock
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get stock history for SKU
// @route   GET /api/skus/:id/history
// @access  Private
exports.getSKUStockHistory = async (req, res, next) => {
  try {
    const { warehouseId, limit } = req.query;
    
    const history = await stockService.getStockHistory(
      req.params.id,
      warehouseId,
      parseInt(limit) || 50
    );

    res.status(200).json({
      status: 'success',
      results: history.length,
      data: { history }
    });
  } catch (error) {
    next(error);
  }
};
