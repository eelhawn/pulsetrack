const CACHE_NAME = 'pulsetrack-offline-v9';

// Force the offline engine to download the NEWEST html and exercise database immediately
const coreFiles = [
  './',
  './index.html',
  './exercises.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(coreFiles))
      .then(() => self.skipWaiting()) 
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName); 
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Dynamic Network-First Caching
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then(cachedResponse => {
          if (!cachedResponse && event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
          return cachedResponse;
        });
      })
  );
});
