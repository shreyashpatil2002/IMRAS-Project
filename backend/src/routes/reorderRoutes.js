const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const reorderController = require('../controllers/reorderController');

// Protect all routes and require Manager or Admin role
router.use(protect);
router.use(authorize('INVENTORY_MANAGER', 'ADMIN'));

// Reorder suggestions
router.get('/suggestions', reorderController.getReorderSuggestions);
router.post('/create-pr', reorderController.createDraftPR);

// Reports
router.get('/reports/abc-analysis', reorderController.getABCAnalysis);
router.get('/reports/stock-ageing', reorderController.getStockAgeingReport);
router.get('/reports/turnover-ratio', reorderController.getTurnoverRatio);
router.get('/reports/stock-value', reorderController.getStockValueReport);
router.get('/reports/supplier-performance', reorderController.getSupplierPerformance);
router.get('/reports/order-fulfillment', reorderController.getOrderFulfillmentReport);

module.exports = router;
