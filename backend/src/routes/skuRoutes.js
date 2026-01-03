const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const skuController = require('../controllers/skuController');

// Protect all routes
router.use(protect);

router.route('/')
  .get(skuController.getAllSKUs)
  .post(authorize('ADMIN', 'INVENTORY_MANAGER'), skuController.createSKU);

router.route('/:id')
  .get(skuController.getSKU)
  .put(authorize('ADMIN', 'INVENTORY_MANAGER'), skuController.updateSKU)
  .delete(authorize('ADMIN'), skuController.deleteSKU);

router.get('/:id/stock', skuController.getSKUStock);
router.get('/:id/history', skuController.getSKUStockHistory);

module.exports = router;
