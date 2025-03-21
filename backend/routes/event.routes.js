const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');
const { authenticate } = require('../middlewares/auth');

// Routes for events management
router.post('/', authenticate, eventController.createEvent); // Create a new event
router.get('/', eventController.getEvents); // Get all events
router.get('/:id', eventController.getEvent); // Get a specific event by ID

module.exports = router;
