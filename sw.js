const CACHE_NAME = 'stadiumiq-v1';
const ASSETS = [
  './',
  './index.html',
  './css/style.min.css',
  './js/app.min.js',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Orbitron:wght@600;700;900&display=swap'
];

// Install Event - cache core static assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - clear old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - network first, falling back to cache
self.addEventListener('fetch', e => {
  // Only handle GET requests and avoid extension or unsupported schemes (like chrome-extension)
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin) && !e.request.url.startsWith('https://fonts.')) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Clone response and cache it
        const resClone = res.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(e.request, resClone);
        });
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
