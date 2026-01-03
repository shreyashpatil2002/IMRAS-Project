const express = require('express');
const batchController = require('../controllers/batchController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Stats route
router.get('/stats/overview', batchController.getBatchStats);

// Adjust quantity route
router.patch('/:id/adjust', authorize('ADMIN', 'INVENTORY_MANAGER'), batchController.adjustBatchQuantity);

// Routes
router
  .route('/')
  .get(batchController.getAllBatches)
  .post(authorize('ADMIN', 'INVENTORY_MANAGER'), batchController.createBatch);

router
  .route('/:id')
  .get(batchController.getBatch)
  .put(authorize('ADMIN', 'INVENTORY_MANAGER', 'WAREHOUSE_STAFF'), batchController.updateBatch)
  .delete(authorize('ADMIN'), batchController.deleteBatch);

module.exports = router;
