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
  .post(authorize('Admin', 'Manager'), supplierController.createSupplier);

router
  .route('/:id')
  .get(supplierController.getSupplier)
  .put(authorize('Admin', 'Manager'), supplierController.updateSupplier)
  .delete(authorize('Admin'), supplierController.deleteSupplier);

module.exports = router;
