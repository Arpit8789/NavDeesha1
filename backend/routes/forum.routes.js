const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forum.controller');
const { authenticate } = require('../middlewares/auth');

// Routes for forum posts
router.post('/', authenticate, forumController.createPost); // Create a new post
router.get('/', forumController.getPosts); // Get all posts
router.get('/:id', forumController.getPost); // Get a specific post by ID

module.exports = router;
