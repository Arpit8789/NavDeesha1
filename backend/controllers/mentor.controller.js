const Mentor = require('../models/Mentor');

// Get all mentors
exports.getMentors = async (req, res) => {
  try {
    const mentors = await Mentor.find().select('-password');
    res.status(200).json(mentors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get mentor profile
exports.getMentorProfile = async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id).select('-password');
    if (!mentor) return res.status(404).json({ message: 'Mentor not found' });
    res.status(200).json(mentor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update mentor profile
exports.updateMentorProfile = async (req, res) => {
  try {
    const mentor = await Mentor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!mentor) return res.status(404).json({ message: 'Mentor not found' });
    res.status(200).json(mentor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
