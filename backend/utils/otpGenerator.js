const speakeasy = require('speakeasy');
const { OTP_SECRET, OTP_EXPIRY_MINUTES } = require('../config/constants');

// Generate OTP
exports.generateOTP = () => {
  return speakeasy.totp({
    secret: OTP_SECRET,
    encoding: 'base32',
    step: OTP_EXPIRY_MINUTES * 60,
  });
};

// Verify OTP
exports.verifyOTP = (otp, userOtp) => {
  return otp === userOtp;
};
