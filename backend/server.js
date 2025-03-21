// Load environment variables
require('dotenv').config();

// Import dependencies
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ extended: false }));

// Serve static files from the public directory (if needed)
app.use(express.static(path.join(__dirname, 'public')));

// Welcome route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to BizMitra API - Your Business Friend!' });
});

// Configure API routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/mentors', require('./routes/mentor.routes'));
app.use('/api/ai', require('./routes/ai.routes'));
app.use('/api/forum', require('./routes/forum.routes'));
app.use('/api/stories', require('./routes/story.routes'));
app.use('/api/events', require('./routes/event.routes'));

// Error handling for undefined routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server Error', error: process.env.NODE_ENV === 'development' ? err.message : undefined });
});

// Define port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`=================================`);
  console.log(`🚀 BizMitra Server running on port ${PORT}`);
  console.log(`=================================`);
  console.log(`📝 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`⚙️ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`=================================`);
});
