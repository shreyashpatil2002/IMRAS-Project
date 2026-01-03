const express = require('express');
const supplierController = require('../controllers/supplierController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Routes
router
  .route('/')
  .get(supplierController.getAllSuppliers)
  .post(authorize('ADMIN', 'INVENTORY_MANAGER'), supplierController.createSupplier);

router
  .route('/:id')
  .get(supplierController.getSupplier)
  .put(authorize('ADMIN', 'INVENTORY_MANAGER'), supplierController.updateSupplier)
  .delete(authorize('ADMIN'), supplierController.deleteSupplier);

module.exports = router;
