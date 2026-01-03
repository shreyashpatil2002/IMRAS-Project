const express = require('express');
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Routes
router
  .route('/')
  .get(authorize('ADMIN', 'INVENTORY_MANAGER'), userController.getAllUsers)
  .post(authorize('ADMIN'), userController.createUser);

router
  .route('/:id')
  .get(authorize('ADMIN', 'INVENTORY_MANAGER'), userController.getUser)
  .put(authorize('ADMIN'), userController.updateUser)
  .delete(authorize('ADMIN'), userController.deleteUser);

module.exports = router;
