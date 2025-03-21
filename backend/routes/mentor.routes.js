const express = require('express');
const router = express.Router();
const mentorController = require('../controllers/mentor.controller');
const { authenticate } = require('../middlewares/auth');

// Routes for mentor management
router.get('/', authenticate, mentorController.getMentors); // Get all mentors
router.get('/:id', authenticate, mentorController.getMentorProfile); // Get mentor profile by ID
router.put('/:id', authenticate, mentorController.updateMentorProfile); // Update mentor profile

module.exports = router;
