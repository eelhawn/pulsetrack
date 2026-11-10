// Bump this number every time you change index.html, exercises.js or programs.js
const CACHE = 'pulsetrack-offline-v115';
// Web fonts a Mod imports (fonts.googleapis.com / fonts.gstatic.com) are kept here the first time they load, so they work offline afterwards
const FONTS = 'pulsetrack-fonts-v1';
// These three are the whole app (styling is built into index.html). All three must save or the install is refused and the copy you already have
// stays in use: a half-saved app is worse than the old one. Only files that exist: if any one of them is missing nothing is saved for offline.
const CORE = ['./', './index.html', './exercises.js', './programs.js'];
// Nice to have, never blocks the install
const EXTRA = ['./manifest.json'];
// A weak or dead connection can leave a request hanging for a minute or more without ever failing, which is not the same as being offline.
// After this long without an answer the saved copy is opened instead (the late answer still refreshes the saved copy).
const WAIT = 4000;

// Is this really the app's file? A hotel, gym or airport wifi can answer every address with its own login page and a happy 200.
// Saving that would replace the app with a login page, so a reply of the wrong kind or the wrong size is treated like no reply.
function sane(res, reqUrl, isPage) {
  try {
    if (!res || !res.ok || res.type === 'opaqueredirect') return false;
    if (new URL(res.url || reqUrl).origin !== self.location.origin) return false;
    const type = (res.headers.get('content-type') || '').toLowerCase();
    const len = parseInt(res.headers.get('content-length') || '0', 10) || 0;
    const path = new URL(reqUrl).pathname;
    if (/\.js$/.test(path)) return /javascript|ecmascript/.test(type) && (!len || len > 20000);
    if (/\.json$/.test(path)) return /json/.test(type);
    if (isPage || /\.html?$/.test(path) || /\/$/.test(path)) return /html/.test(type) && (!len || len > 20000);
    return true;
  } catch (e) { return false; }
}
const abs = (u) => new URL(u, self.location).href;

// Save every file (all of CORE or nothing, then the optional ones)
async function precache() {
  const c = await caches.open(CACHE);
  await Promise.all(CORE.map(async (u) => {
    const res = await fetch(new Request(u, { cache: 'reload' }));
    if (!sane(res, abs(u), u === './')) throw new Error('PulseTrack: ' + u + ' did not come back as the app');
    await c.put(u, res);
  }));
  await Promise.all(EXTRA.map(async (u) => {
    try { const res = await fetch(new Request(u, { cache: 'reload' })); if (sane(res, abs(u))) await c.put(u, res); } catch (err) { /* optional */ }
  }));
}

self.addEventListener('install', (e) => {
  e.waitUntil(precache().then(() => self.skipWaiting()));
});

// The app asks for a fresh save when the browser has cleaned the saved files up but the service worker itself is still registered
self.addEventListener('message', (e) => {
  if (!e.data || e.data.type !== 'precache') return;
  const reply = (ok) => { try { (e.ports && e.ports[0] ? e.ports[0] : e.source).postMessage({ type: 'precache', ok }); } catch (err) { /* page gone */ } };
  e.waitUntil(precache().then(() => reply(true), () => reply(false)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE && k !== FONTS).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Your own files: the network when it answers (so an update shows up straight away), otherwise the saved copy
function ownFile(e) {
  const req = e.request, url = new URL(req.url), isPage = req.mode === 'navigate';
  // saved under the plain address: ?source=pwa, ?x=1 and the like must not pile up as separate copies
  const key = url.origin + url.pathname;
  const saved = () => caches.match(req, { ignoreSearch: true }).then((hit) => hit || (isPage ? caches.match('./index.html') : undefined));
  const net = fetch(req, { cache: 'no-cache' }).then((res) => {
    if (!res.ok || res.type === 'opaqueredirect') return res;                       // a real 404, or a redirect for the browser to follow: pass it on, save nothing
    if (!sane(res, req.url, isPage)) throw new Error('not the app');                // a wifi login page and the like: act as if offline
    if (!res.redirected) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(key, copy)).catch(() => {}); }
    return res;
  });
  e.waitUntil(net.catch(() => {}));                                                 // keep going after the saved copy is shown, so the late answer is still saved
  return new Promise((resolve) => {
    let done = false;
    const finish = (r) => { if (done || !r) return false; done = true; resolve(r); return true; };
    const timer = setTimeout(() => { saved().then((hit) => { finish(hit); }); }, WAIT);   // no answer: open what is saved (nothing saved yet: keep waiting)
    net.then(
      (res) => { clearTimeout(timer); finish(res); },
      () => { clearTimeout(timer); saved().then((hit) => { if (!finish(hit) && !done) { done = true; resolve(Response.error()); } }); }
    );
  });
}

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
  e.respondWith(ownFile(e));
});
