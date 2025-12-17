/**
 * 🎯 SIDEBAR ADS - JavaScript para comportamiento sticky inteligente
 * 
 * Gestiona la posición de los anuncios laterales según el scroll,
 * inicializa AdSense/Monetag y maneja el cierre de ads.
 */

(function() {
  'use strict';
  
  // Configuración
  const CONFIG = {
    showAdsAfterScroll: 200, // Mostrar ads después de 200px de scroll
    hideOnTopScroll: false, // Opcional: ocultar cuando vuelve arriba
    enableCloseButton: false, // Permitir cerrar ads (no recomendado para monetización)
    stickyOffset: 120, // Offset desde el top
    animationDelay: 500 // Delay antes de mostrar (ms)
  };
  
  // Estado
  let lastScrollTop = 0;
  let adsInitialized = false;
  let leftAdClosed = false;
  let rightAdClosed = false;
  
  // Elementos
  let leftAd, rightAd, footer;

  function slotHasAdContent(slotEl) {
    if (!slotEl) return false;

    // Any iframe usually means a filled ad.
    if (slotEl.querySelector('iframe')) return true;

    // AdSense marks unfilled ads with data-ad-status="unfilled".
    const adsbygoogle = slotEl.querySelector('ins.adsbygoogle');
    if (adsbygoogle) {
      const status = (adsbygoogle.getAttribute('data-ad-status') || '').toLowerCase();
      if (status === 'unfilled') return false;
      return true;
    }

    // Monetag native may inject DOM nodes (not always if blocked).
    const elementChildren = Array.from(slotEl.children).filter(el => el.tagName !== 'SCRIPT');
    if (elementChildren.length === 0) return false;

    // If all children are empty containers without iframe/text, treat as empty.
    const hasVisible = elementChildren.some(el => {
      if (el.querySelector && el.querySelector('iframe')) return true;
      const text = (el.textContent || '').trim();
      if (text.length > 0) return true;
      const rect = el.getBoundingClientRect ? el.getBoundingClientRect() : { width: 0, height: 0 };
      return (rect.width > 10 && rect.height > 10);
    });

    return hasVisible;
  }

  function setEmptyState(containerEl, slotEl) {
    if (!containerEl) return true;
    const hasContent = slotHasAdContent(slotEl);
    if (hasContent) {
      containerEl.classList.remove('is-empty');
      return false;
    }
    containerEl.classList.add('is-empty');
    return true;
  }

  function refreshSidebarVisibility() {
    const leftSlot = document.getElementById('sidebar-left-ad');
    const rightSlot = document.getElementById('sidebar-right-ad');

    const leftEmpty = setEmptyState(leftAd, leftSlot);
    const rightEmpty = setEmptyState(rightAd, rightSlot);

    // If both are empty, remove reserved padding (CSS uses this class).
    if (leftEmpty && rightEmpty) {
      document.body.classList.add('no-sidebar-ads');
    } else {
      document.body.classList.remove('no-sidebar-ads');
    }

    // Re-run scroll opacity rules with the new empty state.
    handleScroll();
  }
  
  /**
   * Inicializar sidebar ads
   */
  function initSidebarAds() {
    leftAd = document.querySelector('.sidebar-ad-left');
    rightAd = document.querySelector('.sidebar-ad-right');
    footer = document.querySelector('footer') || document.querySelector('.footer');
    
    if (!leftAd && !rightAd) {
      console.log('ℹ️ No hay contenedores de sidebar ads en esta página');
      return;
    }
    
    // Añadir animación de entrada
    setTimeout(() => {
      if (leftAd) leftAd.classList.add('animated');
      if (rightAd) rightAd.classList.add('animated');
    }, CONFIG.animationDelay);
    
    // Configurar botones de cierre si están habilitados
    if (CONFIG.enableCloseButton) {
      setupCloseButtons();
    }
    
    // Escuchar scroll para comportamiento sticky
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    
    // Ejecutar una vez al cargar
    handleScroll();

    // Hide empty placeholders, but allow late-fill (AdSense/Monetag can inject after a delay).
    refreshSidebarVisibility();
    setTimeout(refreshSidebarVisibility, 1500);
    setTimeout(refreshSidebarVisibility, 4500);
    setTimeout(refreshSidebarVisibility, 12000);

    const leftSlot = document.getElementById('sidebar-left-ad');
    const rightSlot = document.getElementById('sidebar-right-ad');
    const observer = new MutationObserver(() => refreshSidebarVisibility());
    if (leftSlot) observer.observe(leftSlot, { childList: true, subtree: true, attributes: true });
    if (rightSlot) observer.observe(rightSlot, { childList: true, subtree: true, attributes: true });
    
    // Marcar como inicializado
    adsInitialized = true;
    console.log('✅ Sidebar ads inicializados');
  }
  
  /**
   * Manejar scroll para sticky behavior
   */
  function handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // Determinar si mostrar u ocultar ads según scroll
    if (CONFIG.showAdsAfterScroll > 0) {
      const shouldShow = scrollTop > CONFIG.showAdsAfterScroll;
      
      if (leftAd && !leftAdClosed) {
        leftAd.style.opacity = (shouldShow && !leftAd.classList.contains('is-empty')) ? '1' : '0';
      }
      
      if (rightAd && !rightAdClosed) {
        rightAd.style.opacity = (shouldShow && !rightAd.classList.contains('is-empty')) ? '1' : '0';
      }
    }
    
    // Sticky behavior: detener ads al llegar al footer
    if (footer) {
      const footerTop = footer.offsetTop;
      const adBottom = scrollTop + windowHeight - CONFIG.stickyOffset;
      
      if (adBottom > footerTop) {
        // Detener ads cuando lleguen al footer
        if (leftAd) leftAd.classList.add('bottom-reached');
        if (rightAd) rightAd.classList.add('bottom-reached');
      } else {
        // Mantener sticky
        if (leftAd) leftAd.classList.remove('bottom-reached');
        if (rightAd) rightAd.classList.remove('bottom-reached');
      }
    }
    
    lastScrollTop = scrollTop;
  }
  
  /**
   * Configurar botones de cierre
   */
  function setupCloseButtons() {
    const leftClose = leftAd?.querySelector('.sidebar-ad-close');
    const rightClose = rightAd?.querySelector('.sidebar-ad-close');
    
    if (leftClose) {
      leftClose.addEventListener('click', () => {
        if (leftAd) {
          leftAd.style.display = 'none';
          leftAdClosed = true;
          sessionStorage.setItem('sidebar_ad_left_closed', 'true');
        }
      });
    }
    
    if (rightClose) {
      rightClose.addEventListener('click', () => {
        if (rightAd) {
          rightAd.style.display = 'none';
          rightAdClosed = true;
          sessionStorage.setItem('sidebar_ad_right_closed', 'true');
        }
      });
    }
    
    // Recordar estado de cierre
    if (sessionStorage.getItem('sidebar_ad_left_closed') === 'true') {
      if (leftAd) leftAd.style.display = 'none';
      leftAdClosed = true;
    }
    
    if (sessionStorage.getItem('sidebar_ad_right_closed') === 'true') {
      if (rightAd) rightAd.style.display = 'none';
      rightAdClosed = true;
    }
  }
  
  /**
   * Cargar AdSense en slots específicos
   * 
   * @param {string} slotId - ID del elemento donde cargar el ad
   * @param {string} adClient - Tu ad-client de AdSense (ca-pub-XXXXXXXXXXXXXXXX)
   * @param {string} adSlot - Tu ad-slot ID
   * @param {string} format - Formato del ad (auto, rectangle, vertical, horizontal)
   */
  function loadAdSense(slotId, adClient, adSlot, format = 'auto') {
    const slot = document.getElementById(slotId);
    if (!slot) return;
    
    const ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.display = 'block';
    ins.setAttribute('data-ad-client', adClient);
    ins.setAttribute('data-ad-slot', adSlot);
    ins.setAttribute('data-ad-format', format);
    ins.setAttribute('data-full-width-responsive', 'true');
    
    slot.appendChild(ins);
    
    // Inicializar AdSense
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('Error cargando AdSense:', e);
    }
  }
  
  /**
   * Cargar Vignette Banner (Mejor CPM para sidebars)
   * 
   * @param {string} location - Ubicación ('top', 'sidebar', etc)
   * @param {string} zoneId - Zone ID de Vignette
   */
  function loadVignetteBanner(location, zoneId) {
    // Crear y ejecutar script de Vignette
    const script = document.createElement('script');
    script.innerHTML = `(function(s){s.dataset.zone='${zoneId}',s.src='https://gizokraijaw.net/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`;
    
    document.body.appendChild(script);
    
    console.log(`📢 Vignette Banner (${location}) cargado - Zone: ${zoneId}`);
  }
  
  /**
   * Cargar Monetag Native Banner (estructura corregida)
   * 
   * @param {string} slotId - ID del elemento donde cargar el ad
   * @param {string} zoneId - Tu Zone ID de Monetag
   */
  function loadMonetagNative(slotId, zoneId) {
    const slot = document.getElementById(slotId);
    if (!slot) return;
    
    // Crear contenedor para el ad
    const container = document.createElement('div');
    container.id = `monetag-${zoneId}`;
    container.style.minHeight = '600px';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    
    slot.appendChild(container);
    
    // Cargar script de Monetag
    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.type = 'text/javascript';
    script.src = `//www.topcreativeformat.com/${zoneId}/invoke.js`;
    
    slot.appendChild(script);
    
    console.log(`📢 Monetag zone ${zoneId} cargando en ${slotId}`);
  }
  
  /**
   * API pública para cargar ads desde HTML
   */
  window.SidebarAds = {
    init: initSidebarAds,
    loadAdSense: loadAdSense,
    loadMonetagNative: loadMonetagNative,
    loadVignetteBanner: loadVignetteBanner,
    show: function() {
      if (leftAd) leftAd.style.display = 'block';
      if (rightAd) rightAd.style.display = 'block';
    },
    hide: function() {
      if (leftAd) leftAd.style.display = 'none';
      if (rightAd) rightAd.style.display = 'none';
    }
  };
  
  // Auto-inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSidebarAds);
  } else {
    initSidebarAds();
  }
  
})();
