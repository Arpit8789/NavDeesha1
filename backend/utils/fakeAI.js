const { translate } = require('./translation');

const responses = {
  en: {
    funding: "Here are funding options for startups: Angel investors, Crowdfunding, and Government grants.",
    marketing: "Digital marketing strategies include SEO, social media marketing, and email campaigns.",
    registration: "To register your startup in India, visit the Startup India portal and follow the steps for DPIIT recognition.",
  },
  hi: {
    funding: "स्टार्टअप्स के लिए फंडिंग विकल्प हैं: एंजेल निवेशक, क्राउडफंडिंग और सरकारी अनुदान।",
    marketing: "डिजिटल मार्केटिंग रणनीतियों में SEO, सोशल मीडिया मार्केटिंग और ईमेल अभियान शामिल हैं।",
    registration: "भारत में अपना स्टार्टअप पंजीकृत करने के लिए, स्टार्टअप इंडिया पोर्टल पर जाएं और DPIIT मान्यता के चरणों का पालन करें।",
  },
};

exports.chatbotHandler = async (query, lang = 'en') => {
  const translatedQuery = await translate(query, 'en');
  const keywords = Object.keys(responses[lang]);
  const matchedKeyword = keywords.find((keyword) => translatedQuery.includes(keyword));

  if (matchedKeyword) {
    return responses[lang][matchedKeyword];
  }

  return "Sorry, I couldn't find relevant information. Please rephrase your query.";
};
