const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const prController = require('../controllers/prController');

// Protect all routes
router.use(protect);

router.route('/')
  .get(prController.getAllPRs)
  .post(authorize('WAREHOUSE_STAFF', 'INVENTORY_MANAGER', 'ADMIN'), prController.createPR);

router.route('/:id')
  .get(prController.getPR)
  .put(authorize('WAREHOUSE_STAFF', 'INVENTORY_MANAGER', 'ADMIN'), prController.updatePR)
  .delete(authorize('ADMIN'), prController.deletePR);

router.post('/:id/submit', authorize('WAREHOUSE_STAFF', 'INVENTORY_MANAGER', 'ADMIN'), prController.submitPR);
router.post('/:id/approve', authorize('INVENTORY_MANAGER', 'ADMIN'), prController.approvePR);
router.post('/:id/reject', authorize('INVENTORY_MANAGER', 'ADMIN'), prController.rejectPR);
router.post('/:id/convert-to-po', authorize('INVENTORY_MANAGER', 'ADMIN'), prController.convertToPO);

module.exports = router;
