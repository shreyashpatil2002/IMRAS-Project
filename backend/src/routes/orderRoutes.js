const express = require('express');
const orderController = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Stats route
router.get('/stats/overview', orderController.getOrderStats);

// Update order status
router.patch('/:id/status', authorize('ADMIN', 'INVENTORY_MANAGER'), orderController.updateOrderStatus);

// Routes
router
  .route('/')
  .get(orderController.getAllOrders)
  .post(orderController.createOrder);

router
  .route('/:id')
  .get(orderController.getOrder)
  .put(authorize('ADMIN', 'INVENTORY_MANAGER'), orderController.updateOrder)
  .delete(authorize('ADMIN'), orderController.deleteOrder);

module.exports = router;
