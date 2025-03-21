const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  }],
  messages: [{
    sender: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    content: { 
      type: String, 
      required: true 
    },
    read: { 
      type: Boolean, 
      default: false 
    },
    timestamp: { 
      type: Date, 
      default: Date.now 
    }
  }],
  lastMessage: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Conversation', ConversationSchema);
