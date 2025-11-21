/**
 * i18n.js - Simple internationalization module for Bingo Musical
 * Supports: Spanish (es), Catalan (ca), English (en)
 */

const I18n = (() => {
  const STORAGE_KEY = 'bingo_musical_lang';
  const DEFAULT_LANG = 'es';
  const SUPPORTED_LANGS = ['es', 'ca', 'en'];
  
  let currentLang = DEFAULT_LANG;
  let translations = {};
  
  /**
   * Detect user's preferred language
   */
  function detectLanguage() {
    // 1. Check URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    if (urlLang && SUPPORTED_LANGS.includes(urlLang)) {
      return urlLang;
    }
    
    // 2. Check localStorage
    const storedLang = localStorage.getItem(STORAGE_KEY);
    if (storedLang && SUPPORTED_LANGS.includes(storedLang)) {
      return storedLang;
    }
    
    // 3. Check browser language
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang) {
      const langCode = browserLang.split('-')[0].toLowerCase();
      if (SUPPORTED_LANGS.includes(langCode)) {
        return langCode;
      }
    }
    
    // 4. Default to Spanish
    return DEFAULT_LANG;
  }
  
  /**
   * Load translations from JSON file
   */
  async function loadTranslations() {
    try {
      const response = await fetch('/data/i18n.json');
      if (!response.ok) throw new Error('Failed to load translations');
      translations = await response.json();
      return true;
    } catch (error) {
      console.error('Error loading translations:', error);
      return false;
    }
  }
  
  /**
   * Get translation by key path (e.g., "nav.home")
   */
  function t(keyPath, lang = currentLang) {
    if (!translations[lang]) return keyPath;
    
    const keys = keyPath.split('.');
    let value = translations[lang];
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return keyPath; // Return key if not found
      }
    }
    
    return value;
  }
  
  /**
   * Set current language
   */
  function setLanguage(lang) {
    if (!SUPPORTED_LANGS.includes(lang)) {
      console.warn(`Unsupported language: ${lang}`);
      return false;
    }
    
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
    
    // Update URL without reload
    const url = new URL(window.location);
    url.searchParams.set('lang', lang);
    window.history.replaceState({}, '', url);
    
    return true;
  }
  
  /**
   * Translate all elements with data-i18n attribute
   */
  function translatePage() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = t(key);
      
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.placeholder = translation;
      } else {
        element.textContent = translation;
      }
    });
    
    // Translate elements with data-i18n-html (allows HTML content)
    document.querySelectorAll('[data-i18n-html]').forEach(element => {
      const key = element.getAttribute('data-i18n-html');
      const translation = t(key);
      element.innerHTML = translation;
    });
    
    // Translate aria-label attributes
    document.querySelectorAll('[data-i18n-aria]').forEach(element => {
      const key = element.getAttribute('data-i18n-aria');
      const translation = t(key);
      element.setAttribute('aria-label', translation);
    });
    
    // Translate title attributes
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
      const key = element.getAttribute('data-i18n-title');
      const translation = t(key);
      element.setAttribute('title', translation);
    });
  }
  
  /**
   * Initialize i18n system
   */
  async function init() {
    currentLang = detectLanguage();
    document.documentElement.lang = currentLang;
    
    const loaded = await loadTranslations();
    if (loaded) {
      translatePage();
      
      // Update language selector if present
      const langSelector = document.getElementById('lang-selector');
      if (langSelector) {
        langSelector.value = currentLang;
      }
    }
    
    return loaded;
  }
  
  /**
   * Get current language
   */
  function getCurrentLanguage() {
    return currentLang;
  }
  
  /**
   * Get supported languages
   */
  function getSupportedLanguages() {
    return [...SUPPORTED_LANGS];
  }
  
  /**
   * Get language name for display
   */
  function getLanguageName(lang) {
    const names = {
      es: 'Español',
      ca: 'Català',
      en: 'English'
    };
    return names[lang] || lang;
  }
  
  // Public API
  return {
    init,
    t,
    setLanguage,
    translatePage,
    getCurrentLanguage,
    getSupportedLanguages,
    getLanguageName
  };
})();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => I18n.init());
} else {
  I18n.init();
}
