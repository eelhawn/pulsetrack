// Bump this number every time you change index.html, exercises.js or programs.js
const CACHE = 'pulsetrack-offline-v12';
const CORE = ['./', './index.html', './exercises.js', './programs.js', './manifest.json'];
const CDN = 'https://cdn.tailwindcss.com';

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then(async (c) => {
      await c.addAll(CORE.map((u) => new Request(u, { cache: 'reload' })));
      // Cache Tailwind so styling works offline from the first install
      try { await c.add(new Request(CDN, { mode: 'no-cors' })); } catch (err) {}
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const sameOrigin = new URL(req.url).origin === self.location.origin;

  if (sameOrigin) {
    // Your own files: network first (fresh when online), cache when offline
    e.respondWith(
      fetch(req, { cache: 'no-cache' })
        .then((res) => {
          if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
          return res;
        })
        .catch(() =>
          caches.match(req, { ignoreSearch: true }).then((hit) => hit || caches.match('./index.html'))
        )
    );
  } else {
    // CDN files: cache first
    e.respondWith(
      caches.match(req).then((hit) =>
        hit || fetch(req).then((res) => {
          if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
          return res;
        })
      )
    );
  }
});
