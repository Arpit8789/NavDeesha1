const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const User = require('../models/User');
const Mentor = require('../models/Mentor');
const { JWT_SECRET, OTP_SECRET, OTP_EXPIRY_MINUTES } = require('../config/constants');

// Generate OTP for registration
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already exists' });

    const otp = speakeasy.totp({
      secret: OTP_SECRET,
      encoding: 'base32',
      step: OTP_EXPIRY_MINUTES * 60,
    });

    const userData = new User({
      name,
      email,
      password,
      role,
      otp,
      otpExpiry: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
    });

    await userData.save();
    res.status(201).json({ message: 'OTP sent successfully', otp }); // Send OTP (simulated)
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify OTP and complete registration
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.otp = null; // Clear OTP after successful verification
    user.otpExpiry = null;
    await user.save();

    res.status(200).json({ message: 'Registration completed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login and generate JWT token
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Invalid credentials' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
