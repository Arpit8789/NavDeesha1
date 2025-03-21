const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { authenticate } = require('../middlewares/auth');

// Route for chatbot interaction (AI simulation)
router.post('/chatbot', authenticate, async (req, res) => {
  const { query, language } = req.body;

  try {
    const response = await aiController.chatbotHandler(query, language || 'en');
    res.status(200).json({ response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
