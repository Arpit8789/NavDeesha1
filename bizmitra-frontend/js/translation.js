// js/translation.js
import { api } from './api.js';
import { storage } from './utils/storage.js';

class TranslationService {
  constructor() {
    this.currentLanguage = storage.get('language') || 'en';
    this.translations = {};
    this.supportedLanguages = [
      { code: 'en', name: 'English' },
      { code: 'hi', name: 'हिन्दी' },
      { code: 'gu', name: 'ગુજરાતી' },
      { code: 'bn', name: 'বাংলা' },
      { code: 'ta', name: 'தமிழ்' },
      { code: 'te', name: 'తెలుగు' },
      { code: 'mr', name: 'मराठी' }
    ];
    this.isLoaded = false;
    this.languageChangeListeners = [];
  }

  async init() {
    // Load current language translations
    await this.loadLanguage(this.currentLanguage);
    
    // Initialize language selectors
    this.initLanguageSelectors();
    
    // Apply translations
    this.applyTranslations();
    
    return this;
  }

  async loadLanguage(langCode) {
    try {
      // Try to load from cache first
      const cachedTranslations = storage.get(`translations_${langCode}`);
      
      if (cachedTranslations) {
        this.translations = JSON.parse(cachedTranslations);
        this.isLoaded = true;
        return;
      }
      
      // Fetch from API if not in cache
      const translations = await api.get(`/translations/${langCode}`);
      this.translations = translations;
      
      // Cache translations (expires after 1 day)
      storage.set(`translations_${langCode}`, JSON.stringify(translations), 86400);
      
      this.isLoaded = true;
    } catch (error) {
      console.error(`Failed to load translations for ${langCode}:`, error);
      
      // Fallback to English if loading fails
      if (langCode !== 'en') {
        await this.loadLanguage('en');
      }
    }
  }

  async changeLanguage(langCode) {
    if (langCode === this.currentLanguage) return;
    
    try {
      await this.loadLanguage(langCode);
      this.currentLanguage = langCode;
      
      // Save preference
      storage.set('language', langCode);
      
      // Apply translations
      this.applyTranslations();
      
      // Notify listeners
      this.notifyLanguageChanged();
      
      return true;
    } catch (error) {
      console.error(`Failed to change language to ${langCode}:`, error);
      return false;
    }
  }

  translate(key, params = {}) {
    if (!this.isLoaded) return key;
    
    // Get nested translation using dot notation
    const getValue = (obj, path) => {
      const keys = path.split('.');
      return keys.reduce((o, k) => (o || {})[k], obj);
    };
    
    let text = getValue(this.translations, key) || key;
    
    // Replace parameters
    Object.entries(params).forEach(([param, value]) => {
      text = text.replace(new RegExp(`{{${param}}}`, 'g'), value);
    });
    
    return text;
  }

  initLanguageSelectors() {
    document.querySelectorAll('.language-selector').forEach(selector => {
      // Clear existing options
      selector.innerHTML = '';
      
      // Add options for each supported language
      this.supportedLanguages.forEach(lang => {
        const option = document.createElement('option');
        option.value = lang.code;
        option.textContent = lang.name;
        option.selected = lang.code === this.currentLanguage;
        selector.appendChild(option);
      });
      
      // Add change event listener
      selector.addEventListener('change', (e) => {
        this.changeLanguage(e.target.value);
      });
    });
  }

  applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = this.translate(key);
    });
    
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      el.placeholder = this.translate(key);
    });
    
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      el.title = this.translate(key);
    });
    
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      el.innerHTML = this.translate(key);
    });
  }

  onLanguageChanged(callback) {
    this.languageChangeListeners.push(callback);
  }

  notifyLanguageChanged() {
    this.languageChangeListeners.forEach(callback => {
      callback(this.currentLanguage);
    });
  }

  getDirection() {
    // RTL languages
    const rtlLanguages = ['ar', 'ur'];
    return rtlLanguages.includes(this.currentLanguage) ? 'rtl' : 'ltr';
  }
}

export const translation = new TranslationService();
