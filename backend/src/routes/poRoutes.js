const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const poController = require('../controllers/poController');

// Protect all routes
router.use(protect);

router.route('/')
  .get(poController.getAllPOs)
  .post(authorize('INVENTORY_MANAGER', 'ADMIN'), poController.createPO);

router.route('/:id')
  .get(poController.getPO)
  .put(authorize('INVENTORY_MANAGER', 'ADMIN'), poController.updatePO);

router.post('/:id/approve', authorize('ADMIN'), poController.approvePO);
router.post('/:id/send', authorize('ADMIN', 'INVENTORY_MANAGER'), poController.sendPO);
router.post('/:id/receive', authorize('WAREHOUSE_STAFF', 'INVENTORY_MANAGER', 'ADMIN'), poController.receivePO);
router.post('/:id/cancel', authorize('ADMIN'), poController.cancelPO);
router.post('/:id/close', authorize('ADMIN', 'INVENTORY_MANAGER'), poController.closePO);

module.exports = router;
