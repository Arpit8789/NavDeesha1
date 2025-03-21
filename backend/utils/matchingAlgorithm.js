const Mentor = require('../models/Mentor');
const Entrepreneur = require('../models/Entrepreneur');

// Match mentors based on tags and preferences
exports.matchMentorToUser = async (userId) => {
  try {
    const userProfile = await Entrepreneur.findById(userId);

    if (!userProfile) throw new Error("User profile not found");

    const matchedMentors = await Mentor.find({
      expertise: { $in: userProfile.challenges },
      industries: userProfile.businessDetails.industry,
      mentorshipPreferences: { availableHours: { $gt: 0 }, available: true },
    });

    return matchedMentors;
  } catch (error) {
    console.error("Matching error:", error);
    return [];
  }
};
