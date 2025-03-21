const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Routes for authentication
router.post('/register', authController.register); // Register with OTP generation
router.post('/verify-otp', authController.verifyOTP); // Verify OTP and complete registration
router.post('/login', authController.login); // Login and get JWT

module.exports = router;
