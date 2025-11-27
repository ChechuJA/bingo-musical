/**
 * Google Consent Mode v2 + CMP Integration
 * GDPR/RGPD Compliance for AdSense
 * Bingo Musical - 2025
 */

// Default consent state (denied for EEA users)
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }

// Set default consent BEFORE any ads/analytics load
gtag('consent', 'default', {
  'ad_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied',
  'analytics_storage': 'denied',
  'functionality_storage': 'granted', // Always allowed for site functionality
  'personalization_storage': 'denied',
  'security_storage': 'granted', // Always allowed for security
  'wait_for_update': 500 // Wait 500ms for user choice
});

// Detect if user is in EEA/UK/CH (required regions)
function isEEAUser() {
  // This is a simplified check. In production, use geolocation API or server-side detection
  // For now, show to everyone to be safe
  return true;
}

// Check if user has already consented
function getStoredConsent() {
  const consent = localStorage.getItem('google_consent_v2');
  if (consent) {
    try {
      return JSON.parse(consent);
    } catch (e) {
      return null;
    }
  }
  return null;
}

// Save consent choice
function saveConsent(choice) {
  const consentData = {
    timestamp: new Date().toISOString(),
    choice: choice, // 'all' or 'essential'
    version: 2
  };
  localStorage.setItem('google_consent_v2', JSON.stringify(consentData));
}

// Update Google Consent Mode
function updateConsent(grantAll) {
  if (grantAll) {
    gtag('consent', 'update', {
      'ad_storage': 'granted',
      'ad_user_data': 'granted',
      'ad_personalization': 'granted',
      'analytics_storage': 'granted',
      'personalization_storage': 'granted'
    });
    saveConsent('all');

    // Load external ad providers (e.g., Monetag) only after ads consent
    loadAdProvidersIfConsented();
  } else {
    // Keep defaults (denied), only essential cookies
    gtag('consent', 'update', {
      'ad_storage': 'denied',
      'ad_user_data': 'denied',
      'ad_personalization': 'denied',
      'analytics_storage': 'denied',
      'personalization_storage': 'denied'
    });
    saveConsent('essential');
  }
}

// Show consent banner
function showConsentBanner() {
  const banner = document.getElementById('google-cmp-banner');
  if (banner) {
    banner.hidden = false;
    banner.style.display = 'flex';
  }
}

// Hide consent banner
function hideConsentBanner() {
  const banner = document.getElementById('google-cmp-banner');
  if (banner) {
    banner.hidden = true;
    banner.style.display = 'none';
  }
}

// Show manage options modal
function showManageOptions() {
  const modal = document.getElementById('consent-modal');
  if (modal) {
    modal.hidden = false;
    modal.style.display = 'flex';
  }
}

// Hide manage options modal
function hideManageOptions() {
  const modal = document.getElementById('consent-modal');
  if (modal) {
    modal.hidden = true;
    modal.style.display = 'none';
  }
}

// Initialize CMP
function initGoogleCMP() {
  // Check stored consent
  const storedConsent = getStoredConsent();
  
  if (storedConsent) {
    // User has already made a choice
    if (storedConsent.choice === 'all') {
      updateConsent(true);
    } else {
      updateConsent(false);
    }
    hideConsentBanner();
    return;
  }

  // Show banner if user hasn't consented yet (only for EEA users)
  if (isEEAUser()) {
    showConsentBanner();
  } else {
    // Non-EEA users: grant all by default
    updateConsent(true);
  }
}

// Event handlers
document.addEventListener('DOMContentLoaded', () => {
  // Initialize CMP
  initGoogleCMP();

  // "Consentir" button - Accept all
  const acceptBtn = document.getElementById('cmp-accept-all');
  if (acceptBtn) {
    acceptBtn.addEventListener('click', () => {
      updateConsent(true);
      hideConsentBanner();
      hideManageOptions();
      
      // Optional: Reload ads after consent
      if (window.adsbygoogle) {
        try { (adsbygoogle = window.adsbygoogle || []).push({}); window.adsenseInitialized = true; } catch (e) { console.warn('AdSense already initialized'); }
      }

      // Ensure external ad providers load now if registered
      loadAdProvidersIfConsented();
    });
  }

  // "Gestionar opciones" button - Show modal
  const manageBtn = document.getElementById('cmp-manage-options');
  if (manageBtn) {
    manageBtn.addEventListener('click', () => {
      hideConsentBanner();
      showManageOptions();
    });
  }

  // Modal: "Aceptar Todo" button
  const modalAcceptAll = document.getElementById('modal-accept-all');
  if (modalAcceptAll) {
    modalAcceptAll.addEventListener('click', () => {
      updateConsent(true);
      hideManageOptions();
      
      if (window.adsbygoogle) {
        try { (adsbygoogle = window.adsbygoogle || []).push({}); window.adsenseInitialized = true; } catch (e) { console.warn('AdSense already initialized'); }
      }

      loadAdProvidersIfConsented();
    });
  }

  // Modal: "Solo Esenciales" button
  const modalEssentialOnly = document.getElementById('modal-essential-only');
  if (modalEssentialOnly) {
    modalEssentialOnly.addEventListener('click', () => {
      updateConsent(false);
      hideManageOptions();
    });
  }

  // Modal: Close button
  const modalClose = document.getElementById('modal-close');
  if (modalClose) {
    modalClose.addEventListener('click', () => {
      // If no choice made yet, keep banner visible
      const storedConsent = getStoredConsent();
      if (!storedConsent) {
        showConsentBanner();
      }
      hideManageOptions();
    });
  }

  // Settings link in footer - reopen modal
  const settingsLink = document.getElementById('consent-settings-link');
  if (settingsLink) {
    settingsLink.addEventListener('click', (e) => {
      e.preventDefault();
      showManageOptions();
    });
  }
});

// Export for potential manual calls
window.googleCMP = {
  show: showConsentBanner,
  hide: hideConsentBanner,
  manage: showManageOptions,
  accept: () => updateConsent(true),
  reject: () => updateConsent(false),
  reset: () => {
    localStorage.removeItem('google_consent_v2');
    location.reload();
  }
};

/**
 * External Ad Providers Registry
 * Allows registering third-party ad scripts (e.g., Monetag) to load only
 * when user has granted ads consent. Scripts are loaded with defer and once.
 */

const adProviders = [];

/**
 * Register an ad provider script
 * @param {{id:string, src:string, attrs?:Object}} provider
 */
function registerAdProvider(provider) {
  if (!provider || !provider.id || !provider.src) return;
  // Prevent duplicates
  if (adProviders.some(p => p.id === provider.id)) return;
  adProviders.push(provider);
}

function hasAdsConsent() {
  const stored = getStoredConsent();
  return stored && stored.choice === 'all';
}

function loadScriptDeferred(src, attrs) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-external-src="${src}"]`);
    if (existing) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src;
    s.defer = true;
    s.async = true;
    s.setAttribute('data-external-src', src);
    if (attrs && typeof attrs === 'object') {
      Object.entries(attrs).forEach(([k,v]) => {
        try { s.setAttribute(k, v); } catch (e) {}
      });
    }
    s.onload = () => resolve();
    s.onerror = (e) => reject(e);
    document.head.appendChild(s);
  });
}

async function loadAdProvidersIfConsented() {
  if (!hasAdsConsent()) return;
  for (const p of adProviders) {
    try {
      await loadScriptDeferred(p.src, p.attrs || {});
      // Optionally call init callback
      if (typeof p.onLoad === 'function') {
        try { p.onLoad(); } catch(_) {}
      }
    } catch (e) {
      // Swallow to avoid breaking UX
      console.warn('Failed to load ad provider', p.id, e);
    }
  }
}

// Expose registry globally for simple integration in HTML pages
window.registerAdProvider = registerAdProvider;
window.loadAdProvidersIfConsented = loadAdProvidersIfConsented;
