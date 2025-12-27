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
  .post(authorize('Admin', 'Manager'), productController.createProduct);

router
  .route('/:id')
  .get(productController.getProduct)
  .put(authorize('Admin', 'Manager'), productController.updateProduct)
  .delete(authorize('Admin'), productController.deleteProduct);

module.exports = router;
