/**
 * Bingo Musical Security Framework
 * Provides client-side security utilities and protection mechanisms.
 */

const BingoSecurity = (function() {
  'use strict';

  // Configuración privada
  const config = {
    allowIframes: false,
    reportingEndpoint: null
  };

  /**
   * Sanitiza una cadena para prevenir XSS simple.
   * @param {string} str - Cadena a sanitizar
   * @returns {string} - Cadena sanitizada
   */
  function sanitize(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Establece HTML de forma segura en un elemento.
   * @param {HTMLElement} element - Elemento DOM
   * @param {string} htmlContent - Contenido HTML (será sanitizado si no es de confianza)
   * @param {boolean} trusted - Si es true, permite HTML (usar con precaución)
   */
  function setSafeHTML(element, htmlContent, trusted = false) {
    if (!element) return;
    if (trusted) {
        // En un entorno real, usaríamos Trusted Types aquí
        element.innerHTML = htmlContent;
    } else {
        element.textContent = htmlContent;
    }
  }

  /**
   * Protección contra Clickjacking (Frame Busting)
   */
  function preventFraming() {
    if (window.self !== window.top) {
      console.warn('Bingo Security: Intento de iframe detectado.');
      try {
        if (!config.allowIframes) {
          window.top.location = window.self.location;
        }
      } catch (e) {
        // Navegador bloqueó el acceso a top (cross-origin)
        console.error('Bingo Security: No se pudo romper el iframe.', e);
      }
    }
  }

  /**
   * Valida URLs externas para evitar Open Redirects
   * @param {string} url 
   * @returns {boolean}
   */
  function isSafeUrl(url) {
    try {
      const parsed = new URL(url, window.location.origin);
      // Lista blanca de dominios permitidos
      const allowedDomains = [
        'bingomusicalgratis.es',
        'bingomusical.com',
        'open.spotify.com',
        'youtube.com',
        'youtu.be',
        'google.com'
      ];
      
      return allowedDomains.some(d => parsed.hostname.endsWith(d));
    } catch (e) {
      return false;
    }
  }

  /**
   * Inicializa el framework de seguridad
   */
  function init(options = {}) {
    Object.assign(config, options);
    
    // 1. Frame Guard
    preventFraming();
    
    // 2. Freeze native prototypes (basic tampering protection)
    // Object.freeze(Object.prototype); // Puede romper librerías de terceros (ads)
    
    console.log('🛡️ Bingo Security Framework activado');
  }

  // API Pública
  return {
    init,
    sanitize,
    setSafeHTML,
    isSafeUrl
  };

})();

// Auto-inicializar si se carga en el navegador
if (typeof window !== 'undefined') {
  window.BingoSecurity = BingoSecurity;
  // Inicialización básica
  window.addEventListener('DOMContentLoaded', () => {
    BingoSecurity.init();
  });
}
