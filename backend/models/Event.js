const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  eventType: {
    type: String,
    enum: ['Webinar', 'Seminar', 'Workshop', 'Conference', 'Networking'],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: String,
  endTime: String,
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  speakers: [{
    name: String,
    designation: String,
    company: String
  }],
  location: {
    isVirtual: {
      type: Boolean,
      default: true
    },
    meetingLink: String,
    city: String,
    address: String
  },
  registrationLink: String,
  category: {
    type: String,
    enum: ['Funding', 'Marketing', 'Legal', 'Technology', 'General', 'Growth']
  },
  attendees: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    registrationDate: {
      type: Date,
      default: Date.now
    }
  }],
  maxAttendees: Number,
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema);
