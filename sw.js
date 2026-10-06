const CACHE_NAME = 'pulsetrack-offline-v7';

// Force the offline engine to download the NEWEST html file immediately
const coreFiles = [
  './',
  './index.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(coreFiles))
      .then(() => self.skipWaiting()) // Instantly turns on
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // This deletes the old vault that has the broken memory code
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName); 
          }
        })
      );
    }).then(() => self.clients.claim()) // Instantly takes control
  );
});

// Dynamic Network-First Caching
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // App is online: copy the newest data and save it
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // App is offline: load it from the phone's memory
        return caches.match(event.request).then(cachedResponse => {
          // Fallback safeguard to ensure the UI always loads
          if (!cachedResponse && event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
          return cachedResponse;
        });
      })
  );
});
