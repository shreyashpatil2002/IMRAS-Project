const express = require('express');
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Routes
router
  .route('/')
  .get(authorize('Admin', 'Manager'), userController.getAllUsers)
  .post(authorize('Admin'), userController.createUser);

router
  .route('/:id')
  .get(authorize('Admin', 'Manager'), userController.getUser)
  .put(authorize('Admin'), userController.updateUser)
  .delete(authorize('Admin'), userController.deleteUser);

module.exports = router;
