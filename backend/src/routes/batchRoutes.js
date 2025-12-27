const express = require('express');
const batchController = require('../controllers/batchController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Stats route
router.get('/stats/overview', batchController.getBatchStats);

// Adjust quantity route
router.patch('/:id/adjust', authorize('Admin', 'Manager'), batchController.adjustBatchQuantity);

// Routes
router
  .route('/')
  .get(batchController.getAllBatches)
  .post(authorize('Admin', 'Manager'), batchController.createBatch);

router
  .route('/:id')
  .get(batchController.getBatch)
  .put(authorize('Admin', 'Manager'), batchController.updateBatch)
  .delete(authorize('Admin'), batchController.deleteBatch);

module.exports = router;
