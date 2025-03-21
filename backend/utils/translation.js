const i18next = require('i18next');
const { SUPPORTED_LANGUAGES } = require('../config/constants');

// Initialize i18next with translations
i18next.init({
  resources: {
    en: { translation: { welcome: "Welcome to BizMitra!" } },
    hi: { translation: { welcome: "बिजमित्र में आपका स्वागत है!" } },
    gu: { translation: { welcome: "બિઝમિત્રમાં આપનું સ્વાગત છે!" } },
  },
  lng: 'en',
  fallbackLng: 'en',
});

// Translate function
exports.translate = async (text, targetLang) => {
  if (!SUPPORTED_LANGUAGES.includes(targetLang)) {
    targetLang = 'en'; // Fallback to English
  }
  
  try {
    const translatedText = i18next.t(text, { lng: targetLang });
    return translatedText || text; // Return original text if no translation found
  } catch (error) {
    console.error("Translation error:", error);
    return text; // Return original text on error
  }
};
