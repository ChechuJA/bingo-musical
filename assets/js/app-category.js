/**
 * app-category.js - JavaScript para páginas individuales de categorías
 * Carga solo los cartones de la categoría especificada en data-category
 */

// Detectar categoría desde data attribute del script
const currentScript = document.currentScript || document.querySelector('script[data-category]');
const CATEGORY_KEY = currentScript ? currentScript.dataset.category : null;

if (!CATEGORY_KEY) {
  console.error('No se especificó data-category en el script');
}

// Sanitización
const sanitize = s => (typeof s === 'string') ? s.replaceAll('<','&lt;').replaceAll('>','&gt;') : '';

// ===== COOKIE CONSENT =====
(function setupCookieConsent(){
  const banner = document.getElementById('cookie-banner');
  const acceptBtn = document.getElementById('cookie-accept');
  const declineBtn = document.getElementById('cookie-decline');

  const consent = localStorage.getItem('cookie_consent');
  if(consent === 'accepted' || consent === 'declined'){
    banner.hidden = true;
  } else {
    banner.hidden = false;
  }

  acceptBtn?.addEventListener('click', ()=>{
    localStorage.setItem('cookie_consent','accepted');
    banner.hidden = true;
  });

  declineBtn?.addEventListener('click', ()=>{
    localStorage.setItem('cookie_consent','declined');
    banner.hidden = true;
  });
})();

// ===== OFFLINE DETECTION =====
(function setupOfflineDetection(){
  const banner = document.getElementById('offline-banner');
  const check = ()=> banner.hidden = navigator.onLine;
  check();
  window.addEventListener('online', check);
  window.addEventListener('offline', check);
})();

// ===== MOBILE MENU =====
(function setupMobileMenu(){
  const btn = document.querySelector('.menu-btn');
  const menu = document.querySelector('.menu');
  btn?.addEventListener('click', ()=>{
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', !expanded);
    menu.classList.toggle('open');
  });
})();

// ===== SPOTIFY MODAL =====
let spotifyData = {};

async function loadSpotifyData(){
  try {
    const resp = await fetch('/data/spotify-playlists.json');
    spotifyData = await resp.json();
  } catch(e){
    console.error('Error cargando spotify-playlists.json:', e);
  }
}

function setupSpotifyModal(){
  const modal = document.getElementById('spotify-modal');
  const closeBtn = modal?.querySelector('.modal-close');
  const openBtn = document.getElementById('btn-spotify-modal');

  if(!modal) return;

  const openModal = ()=>{
    if(!spotifyData[CATEGORY_KEY]){
      alert('No hay playlists de Spotify para esta categoría');
      return;
    }

    const data = spotifyData[CATEGORY_KEY];
    document.getElementById('modal-title').textContent = data.nombre || CATEGORY_KEY;
    document.getElementById('modal-desc').textContent = data.descripcion || '';

    const container = document.getElementById('modal-playlists');
    container.innerHTML = '';

    if(data.playlists && data.playlists.length > 0){
      data.playlists.forEach(pl => {
        const div = document.createElement('div');
        div.className = 'playlist-item';
        div.innerHTML = `
          <h4>${sanitize(pl.nombre)}</h4>
          <p>${sanitize(pl.descripcion || '')}</p>
          <a href="${sanitize(pl.url)}" target="_blank" rel="noopener" class="btn primary" style="margin-top:.5rem;">
            🎧 Abrir en Spotify
          </a>
        `;
        container.appendChild(div);
      });
    } else {
      container.innerHTML = '<p style="text-align:center;color:var(--muted);">No hay playlists disponibles</p>';
    }

    modal.hidden = false;
    modal.setAttribute('aria-hidden','false');
    modal.focus();
  };

  const closeModal = ()=>{
    modal.hidden = true;
    modal.setAttribute('aria-hidden','true');
  };

  openBtn?.addEventListener('click', (e)=>{
    e.preventDefault();
    e.stopPropagation();
    openModal();
  });

  closeBtn?.addEventListener('click', (e)=>{
    e.preventDefault();
    e.stopPropagation();
    closeModal();
  });

  modal?.addEventListener('click', (e)=>{
    if(e.target === modal){
      e.preventDefault();
      e.stopPropagation();
      closeModal();
    }
  });

  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape' && !modal.hidden){
      e.preventDefault();
      closeModal();
    }
  });
}

// ===== RENDER CARDS =====
function createDownloadCard(file){
  const card = document.createElement('div');
  card.className = 'download-card card';

  const title = document.createElement('h4');
  title.textContent = sanitize(file.nombre);
  card.appendChild(title);

  if(file.canciones > 0){
    const info = document.createElement('div');
    info.className = 'card-info';
    info.textContent = `${file.canciones} canciones`;
    card.appendChild(info);
  } else {
    const info = document.createElement('div');
    info.className = 'card-info';
    info.textContent = 'En preparación';
    card.appendChild(info);
  }

  const actions = document.createElement('div');
  actions.className = 'card-actions';

  if(file.ruta && file.ruta !== '#'){
    const downloadBtn = document.createElement('a');
    downloadBtn.href = file.ruta;
    downloadBtn.download = file.ruta.split('/').pop();
    downloadBtn.className = 'btn primary';
    downloadBtn.textContent = '⬇ Descargar';
    downloadBtn.setAttribute('aria-label', `Descargar ${sanitize(file.nombre)}`);
    actions.appendChild(downloadBtn);
  }

  if(file.solicitar === true){
    const requestBtn = document.createElement('a');
    requestBtn.href = 'index.html#about';
    requestBtn.className = 'btn ghost';
    requestBtn.textContent = '📧 Solicitar cartones';
    actions.appendChild(requestBtn);
  }

  card.appendChild(actions);
  return card;
}

async function renderCategoryCards(){
  const featuredContainer = document.getElementById('featured-cards');
  const allContainer = document.getElementById('all-cards');

  if(!featuredContainer || !allContainer) return;

  try {
    const resp = await fetch('/data/downloadable-cards.json');
    const data = await resp.json();

    const categoryData = data[CATEGORY_KEY];
    if(!categoryData){
      featuredContainer.innerHTML = `<p style="text-align:center;color:var(--muted);">Categoría "${CATEGORY_KEY}" no encontrada</p>`;
      allContainer.innerHTML = '';
      return;
    }

    // Renderizar archivos (con o sin subcategorías)
    let files = [];
    
    if(categoryData.subcategorias){
      // Tiene subcategorías (ej: Mix)
      Object.values(categoryData.subcategorias).forEach(subcat => {
        if(subcat.archivos) files.push(...subcat.archivos);
      });
    } else if(categoryData.archivos){
      // Archivos directos
      files = categoryData.archivos;
    }

    // Top 3 featured (los primeros 3 con más canciones)
    const sorted = [...files].sort((a,b) => (b.canciones || 0) - (a.canciones || 0));
    const top3 = sorted.slice(0, 3);

    featuredContainer.innerHTML = '';
    top3.forEach(file => {
      featuredContainer.appendChild(createDownloadCard(file));
    });

    if(top3.length === 0){
      featuredContainer.innerHTML = '<p style="text-align:center;color:var(--muted);">No hay cartones destacados</p>';
    }

    // Todos los cartones
    allContainer.innerHTML = '';
    files.forEach(file => {
      allContainer.appendChild(createDownloadCard(file));
    });

    if(files.length === 0){
      allContainer.innerHTML = '<p style="text-align:center;color:var(--muted);">No hay cartones disponibles</p>';
    }

  } catch(e){
    console.error('Error cargando cartones:', e);
    featuredContainer.innerHTML = '<p style="text-align:center;color:var(--muted);">Error al cargar cartones</p>';
    allContainer.innerHTML = '';
  }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', async ()=>{
  await loadSpotifyData();
  setupSpotifyModal();
  await renderCategoryCards();
});
