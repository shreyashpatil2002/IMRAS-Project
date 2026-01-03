const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const transferController = require('../controllers/transferController');

// Protect all routes
router.use(protect);

router.route('/')
  .get(transferController.getAllTransfers)
  .post(authorize('WAREHOUSE_STAFF', 'INVENTORY_MANAGER', 'ADMIN'), transferController.createTransfer);

router.route('/:id')
  .get(transferController.getTransfer)
  .delete(authorize('ADMIN'), transferController.deleteTransfer);

router.post('/:id/approve', authorize('INVENTORY_MANAGER', 'ADMIN'), transferController.approveTransfer);
router.post('/:id/dispatch', authorize('WAREHOUSE_STAFF', 'INVENTORY_MANAGER', 'ADMIN'), transferController.dispatchTransfer);
router.post('/:id/receive', authorize('WAREHOUSE_STAFF', 'INVENTORY_MANAGER', 'ADMIN'), transferController.receiveTransfer);
router.post('/:id/reject', authorize('INVENTORY_MANAGER', 'ADMIN'), transferController.rejectTransfer);

module.exports = router;
