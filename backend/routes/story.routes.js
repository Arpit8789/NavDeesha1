const express = require('express');
const router = express.Router();
const storyController = require('../controllers/story.controller');
const { authenticate } = require('../middlewares/auth');

// Routes for startup stories
router.post('/', authenticate, storyController.createStory); // Create a new story
router.get('/', storyController.getStories); // Get all stories
router.get('/:id', storyController.getStory); // Get a specific story by ID

module.exports = router;
