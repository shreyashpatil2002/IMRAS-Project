const express = require('express');
const productController = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Stats route
router.get('/stats/overview', productController.getProductStats);

// Routes
router
  .route('/')
  .get(productController.getAllProducts)
  .post(authorize('ADMIN', 'INVENTORY_MANAGER'), productController.createProduct);

router
  .route('/:id')
  .get(productController.getProduct)
  .put(authorize('ADMIN', 'INVENTORY_MANAGER'), productController.updateProduct)
  .delete(authorize('ADMIN'), productController.deleteProduct);

module.exports = router;
