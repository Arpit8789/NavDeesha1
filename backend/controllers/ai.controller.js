const { translate } = require('../utils/translation');
const responses = {
  en: {
    "funding": "Here are funding options...",
    "marketing": "Digital marketing strategies..."
  },
  hi: {
    "funding": "वित्तपोषण विकल्प...",
    "marketing": "डिजिटल मार्केटिंग रणनीतियाँ..."
  }
};

exports.chatbotHandler = async (query, lang = 'en') => {
  const translatedQuery = await translate(query, 'en');
  // Simple keyword matching logic
  return responses[lang][translatedQuery] || "I can help with...";
};
