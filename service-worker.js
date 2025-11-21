
const CACHE_NAME = 'bingo-musical-v7';
const OFFLINE_URL = '/offline.html';
const ASSETS = [
  '/',
  '/index.html',
  '/online.html',
  '/navidad.html',
  '/clasicos-pop.html',
  '/pop-latino.html',
  '/otono.html',
  '/cumpleanos.html',
  '/mix.html',
  '/rock.html',
  '/musica-ingles.html',
  '/musica-espanol.html',
  '/generador.html',
  '/assets/css/styles.css',
  '/assets/css/online.css',
  '/assets/js/app.js',
  '/assets/js/app-category.js',
  '/assets/js/i18n.js',
  '/assets/js/online.js',
  '/manifest.json',
  '/offline.html',
  '/data/playlists.json',
  '/data/downloadable-cards.json',
  '/data/spotify-playlists.json',
  '/data/generated-cards-index.json',
  '/data/i18n.json'
];

// Install - cache files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate - cleanup
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

// Fetch - network first, fallback to cache
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  
  // Don't cache Firebase or external API requests
  // Use URL object for more precise hostname checking
  try {
    const requestUrl = new URL(event.request.url);
    const hostname = requestUrl.hostname;
    
    if (hostname.endsWith('.firebaseio.com') || 
        hostname.endsWith('.googleapis.com') ||
        hostname.endsWith('.gstatic.com') ||
        hostname === 'firebaseio.com' ||
        hostname === 'googleapis.com' ||
        hostname === 'gstatic.com') {
      event.respondWith(fetch(event.request));
      return;
    }
  } catch (e) {
    // Invalid URL, let it pass through to normal handling
  }
  
  event.respondWith(
    fetch(event.request).then(resp => {
      // update cache
      const copy = resp.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      return resp;
    }).catch(() => caches.match(event.request).then(r => r || caches.match(OFFLINE_URL)))
  );
});
