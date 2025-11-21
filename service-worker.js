
const CACHE_NAME = 'bingo-musical-v4';
const OFFLINE_URL = '/offline.html';
const ASSETS = [
  '/',
  '/index.html',
  '/navidad.html',
  '/clasicos-pop.html',
  '/pop-latino.html',
  '/otono.html',
  '/cumpleanos.html',
  '/mix.html',
  '/assets/css/styles.css',
  '/assets/js/app.js',
  '/assets/js/app-category.js',
  '/manifest.json',
  '/offline.html',
  '/data/playlists.json',
  '/data/downloadable-cards.json',
  '/data/spotify-playlists.json',
  '/data/generated-cards-index.json'
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
  event.respondWith(
    fetch(event.request).then(resp => {
      // update cache
      const copy = resp.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      return resp;
    }).catch(() => caches.match(event.request).then(r => r || caches.match(OFFLINE_URL)))
  );
});
