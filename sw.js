const CACHE_NAME = 'pulsetrack-offline-v5';

self.addEventListener('install', event => {
  self.skipWaiting(); // Instantly turns on
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim()); // Instantly takes control
});

// Dynamic Network-First Caching
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // App is online: copy the data and save it
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // App is offline: load it from the phone's memory
        return caches.match(event.request);
      })
  );
});
