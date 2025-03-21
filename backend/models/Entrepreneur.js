const mongoose = require('mongoose');
const User = require('./User');

const EntrepreneurSchema = new mongoose.Schema({
  businessDetails: {
    name: String,
    stage: {
      type: String,
      enum: ['Ideation', 'Validation', 'Early Growth', 'Scaling', 'Established'],
    },
    industry: String,
    description: String,
    website: String,
    founded: Date,
    teamSize: Number
  },
  challenges: [String],
  interests: [String],
  mentorsConnected: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mentor'
  }],
  mentorshipRequests: [{
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor' },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    requestedAt: { type: Date, default: Date.now }
  }]
});

module.exports = User.discriminator('Entrepreneur', EntrepreneurSchema);
