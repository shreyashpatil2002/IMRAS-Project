const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const warehouseController = require('../controllers/warehouseController');

// Protect all routes
router.use(protect);

router.route('/')
  .get(warehouseController.getAllWarehouses)
  .post(authorize('ADMIN'), warehouseController.createWarehouse);

router.route('/:id')
  .get(warehouseController.getWarehouse)
  .put(authorize('ADMIN'), warehouseController.updateWarehouse)
  .delete(authorize('ADMIN'), warehouseController.deleteWarehouse);

router.post('/:id/locations', authorize('ADMIN', 'INVENTORY_MANAGER'), warehouseController.addLocation);
router.put('/:id/locations/:locationId', authorize('ADMIN', 'INVENTORY_MANAGER'), warehouseController.updateLocation);

module.exports = router;
