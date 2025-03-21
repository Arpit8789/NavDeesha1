module.exports = {
    JWT_SECRET: process.env.JWT_SECRET || 'bizmitra_secret_key_for_jwt',
    OTP_SECRET: process.env.OTP_SECRET || 'bizmitra_secret_key_for_otp',
    OTP_EXPIRY_MINUTES: 10,
    ROLES: ['user', 'mentor', 'admin'],
    EXPERTISE_AREAS: [
      'Marketing', 'Finance', 'Technology', 'Operations', 
      'Legal', 'Product Development', 'Sales', 'Strategy',
      'Fundraising', 'Human Resources', 'Business Development'
    ],
    DEFAULT_LANGUAGE: 'en',
    SUPPORTED_LANGUAGES: ['en', 'hi', 'gu', 'bn', 'ta', 'te', 'mr', 'kn'],
    MAX_CONNECTIONS_PER_USER: 10,
    MAX_UNREAD_MESSAGES: 100
  };
  