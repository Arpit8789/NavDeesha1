const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middlewares/auth');

// Routes for user management
router.get('/', authenticate, userController.getUsers); // Get all users
router.get('/:id', authenticate, userController.getUserProfile); // Get user profile by ID
router.put('/:id', authenticate, userController.updateUserProfile); // Update user profile

module.exports = router;
