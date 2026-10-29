// Bump this number every time you change index.html, exercises.js or programs.js
const CACHE = 'pulsetrack-offline-v77';
// Web fonts a Mod imports (fonts.googleapis.com / fonts.gstatic.com) are kept here the first time they load, so they work offline afterwards
const FONTS = 'pulsetrack-fonts-v1';
// Styling is built into index.html now, so these files are everything the app needs offline.
// Only files that exist: cache.addAll fails the whole install if any one of them is missing, and then nothing is saved for offline.
const CORE = ['./', './index.html', './exercises.js', './programs.js', './manifest.json'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(CORE.map((u) => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE && k !== FONTS).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) {
    // nothing outside the app is needed, except web fonts a Mod asked for: saved on first use, then served from the phone
    if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
      e.respondWith(
        caches.open(FONTS).then((c) =>
          c.match(req).then((hit) => {
            const net = fetch(req).then((res) => { if (res && (res.ok || res.type === 'opaque')) c.put(req, res.clone()); return res; }).catch(() => hit);
            return hit || net;
          })
        )
      );
    }
    return;
  }

  // Your own files: network first (fresh when online), saved copy when offline
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
});
