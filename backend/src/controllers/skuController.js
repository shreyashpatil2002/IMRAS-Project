const SKU = require('../models/SKU');
const stockService = require('../services/stockService');

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
    
    let stock;
    if (warehouseId) {
      stock = await stockService.getCurrentStock(req.params.id, warehouseId);
    } else {
      stock = await stockService.getTotalStock(req.params.id);
    }

    // Check reorder point
    const sku = await SKU.findById(req.params.id);
    if (!sku) {
      return res.status(404).json({
        status: 'error',
        message: 'SKU not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        skuId: sku._id,
        skuCode: sku.skuCode,
        currentStock: stock,
        minStock: sku.minStock,
        maxStock: sku.maxStock,
        safetyStock: sku.safetyStock,
        needsReorder: stock <= sku.minStock
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
