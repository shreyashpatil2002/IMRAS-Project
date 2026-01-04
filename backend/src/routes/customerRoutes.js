const express = require('express');
const customerController = require('../controllers/customerController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Stats route
router.get('/stats/overview', customerController.getCustomerStats);

// Routes
router
  .route('/')
  .get(customerController.getAllCustomers)
  .post(customerController.createCustomer);

router
  .route('/:id')
  .get(customerController.getCustomer)
  .put(authorize('ADMIN', 'INVENTORY_MANAGER'), customerController.updateCustomer)
  .delete(authorize('ADMIN'), customerController.deleteCustomer);

module.exports = router;
