const reorderService = require('../services/reorderService');
const reportService = require('../services/reportService');

// @desc    Get automatic reorder suggestions
// @route   GET /api/reorder/suggestions
// @access  Private (Manager, Admin)
exports.getReorderSuggestions = async (req, res, next) => {
  try {
    const { warehouseId } = req.query;
    
    const suggestions = await reorderService.generateReorderSuggestions(warehouseId);

    res.status(200).json({
      status: 'success',
      results: suggestions.length,
      data: { suggestions }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create draft PR from reorder suggestions
// @route   POST /api/reorder/create-pr
// @access  Private (Manager, Admin)
exports.createDraftPR = async (req, res, next) => {
  try {
    const { suggestions, warehouseId } = req.body;

    const pr = await reorderService.createDraftPRFromSuggestions(
      suggestions,
      warehouseId,
      req.user._id
    );

    res.status(201).json({
      status: 'success',
      message: 'Draft PR created from suggestions',
      data: { pr }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get ABC analysis report
// @route   GET /api/reports/abc-analysis
// @access  Private (Manager, Admin)
exports.getABCAnalysis = async (req, res, next) => {
  try {
    const analysis = await reportService.abcAnalysis();

    res.status(200).json({
      status: 'success',
      data: analysis
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get stock ageing report
// @route   GET /api/reports/stock-ageing
// @access  Private (Manager, Admin)
exports.getStockAgeingReport = async (req, res, next) => {
  try {
    const { warehouseId } = req.query;
    
    const ageingData = await reportService.stockAgeingReport(warehouseId);

    res.status(200).json({
      status: 'success',
      results: ageingData.length,
      data: { ageingData }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get inventory turnover ratio
// @route   GET /api/reports/turnover-ratio
// @access  Private (Manager, Admin)
exports.getTurnoverRatio = async (req, res, next) => {
  try {
    const { skuId, months } = req.query;
    
    const turnover = await reportService.inventoryTurnoverRatio(skuId, parseInt(months) || 12);

    res.status(200).json({
      status: 'success',
      data: turnover
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get stock value report
// @route   GET /api/reports/stock-value
// @access  Private (Manager, Admin)
exports.getStockValueReport = async (req, res, next) => {
  try {
    const { warehouseId } = req.query;
    
    const stockValue = await reportService.stockValueReport(warehouseId);

    res.status(200).json({
      status: 'success',
      data: stockValue
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get supplier performance report
// @route   GET /api/reports/supplier-performance
// @access  Private (Manager, Admin)
exports.getSupplierPerformance = async (req, res, next) => {
  try {
    const performance = await reportService.supplierPerformanceReport();

    res.status(200).json({
      status: 'success',
      results: performance.length,
      data: { performance }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order fulfillment report
// @route   GET /api/reports/order-fulfillment
// @access  Private (Manager, Admin)
exports.getOrderFulfillmentReport = async (req, res, next) => {
  try {
    const { days } = req.query;
    
    const fulfillment = await reportService.orderFulfillmentReport(parseInt(days) || 30);

    res.status(200).json({
      status: 'success',
      data: fulfillment
    });
  } catch (error) {
    next(error);
  }
};
