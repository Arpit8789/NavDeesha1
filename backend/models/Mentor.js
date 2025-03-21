const mongoose = require('mongoose');
const User = require('./User');

const MentorSchema = new mongoose.Schema({
  professionalDetails: {
    currentRole: String,
    company: String,
    linkedinProfile: String,
    experience: { type: Number, required: true },
    industries: [String],
  },
  expertise: [String],
  bio: { 
    type: String,
    maxlength: 500 
  },
  mentorshipPreferences: {
    available: { type: Boolean, default: true },
    availableHours: { type: Number, default: 5 },
    preferredBusinessStages: [String],
    preferredIndustries: [String]
  },
  entrepreneurs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Entrepreneur'
  }],
  mentorshipRequests: [{
    entrepreneur: { type: mongoose.Schema.Types.ObjectId, ref: 'Entrepreneur' },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    requestedAt: { type: Date, default: Date.now }
  }],
  isVerified: { 
    type: Boolean, 
    default: false 
  }
});

module.exports = User.discriminator('Mentor', MentorSchema);
