
/* =====================================================================
 * PulseTrack 2.58.0: works offline, and tells you so.
 *
 * The app has always been built to run with no internet (no accounts, no servers: even the family board is just codes you send each other),
 * but nothing on screen said whether this phone really had its own copy. Now:
 *   - Settings → App: "Works offline ✓" (or "Not saved for offline yet" with a Save now button), and a small "offline ✓" next to the version
 *     at the bottom of the side menu.
 *   - If the copy is missing (the browser cleaned it up, or the first save never finished), it saves it again by itself the next time you
 *     are online, and Save now does the same on demand.
 *   - On an installed (home screen) app it asks the browser to keep the saved copy and your data from being cleaned up automatically. Browsers
 *     grant this without a prompt for installed apps.
 * The service worker (sw.js) got the matching fixes: a weak connection that never answers opens the saved copy after 4 seconds instead of
 * hanging, and a public-wifi login page can no longer be saved in place of the app.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  const proto = ApplicationUI.prototype, $ = id => document.getElementById(id);
  const FILES = ["./index.html", "./exercises.js", "./programs.js"];
  let last = null, busy = false;

  /** is there a service worker, and has it saved all three files? */
  async function status() {
    try {
      if (!("serviceWorker" in navigator) || !window.caches) return { ok: false, why: "unsupported" };
      const reg = await navigator.serviceWorker.getRegistration();
      const keys = (await caches.keys()).filter(k => /^pulsetrack-offline-/.test(k));
      if (!reg || !reg.active) return { ok: false, why: "none" };
      for (const k of keys) {
        const c = await caches.open(k), hits = await Promise.all(FILES.map(f => c.match(f)));
        if (hits.every(Boolean)) return { ok: true };
      }
      return { ok: false, why: "empty" };
    } catch (e) { return { ok: false, why: "error" }; }
  }

  /** the service worker saves the files again (they are gone but it is still registered, so installing it again would do nothing) */
  function askWorker(reg) {
    return new Promise(resolve => {
      const w = reg && (reg.active || reg.waiting || reg.installing); if (!w) return resolve(false);
      const ch = new MessageChannel(), t = setTimeout(() => resolve(false), 30000);
      ch.port1.onmessage = e => { clearTimeout(t); resolve(!!(e.data && e.data.ok)); };
      try { w.postMessage({ type: "precache" }, [ch.port2]); } catch (e) { clearTimeout(t); resolve(false); }
    });
  }

  /** (re)install the service worker and wait until the files are saved */
  async function save() {
    if (!("serviceWorker" in navigator)) return false;
    try {
      const reg = await navigator.serviceWorker.register("./sw.js");
      try { await reg.update(); } catch (e) { }
      await Promise.race([navigator.serviceWorker.ready, new Promise(r => setTimeout(r, 15000))]);
      if (!(await status()).ok) await askWorker(reg);
    } catch (e) { }
    for (let i = 0; i < 24; i++) {
      const s = await status(); if (s.ok) return true;
      await new Promise(r => setTimeout(r, 750));
    }
    return false;
  }

  function paint(s) {
    last = s; hint();
    const dot = $("pt-off-dot");
    if (dot) {
      dot.textContent = s.ok ? " · offline ✓" : (s.why === "unsupported" ? "" : " · not saved offline");
      dot.className = s.ok ? "pt-off-ok" : "pt-off-no";
    }
    const t = $("pt-off-txt"), b = $("pt-off-btn");
    if (t) t.innerHTML = s.ok ? `<b class="pt-off-ok">Works offline ✓</b> The whole app is saved on this phone.`
      : s.why === "unsupported" ? `This browser can't keep the app for offline use. Try Chrome, or Safari on iPhone.`
        : `<b class="pt-off-no">Not saved for offline yet.</b> Open the app once with internet.`;
    if (b) b.classList.toggle("hidden", s.ok || s.why === "unsupported");
  }
  const refresh = () => status().then(paint).catch(() => { });
  /** the "App" line in the Settings list shows it too, so it can be seen without opening anything */
  function hint() {
    try {
      const h = document.querySelector('[data-hint="app"]'), ver = $("app-version"); if (!h || !last || last.why === "unsupported") return;
      const v = ver && ver.textContent.trim().length > 1 ? ver.textContent.trim().replace(/^v/i, "") : "";
      h.textContent = (v ? "Version " + v + " · " : "") + (last.ok ? "works offline ✓" : "not saved offline");
    } catch (e) { }
  }
  PT.offline = { status, save, refresh };

  function ensureUi() {
    const dv = $("drawer-version");
    if (dv && !$("pt-off-dot")) dv.insertAdjacentHTML("afterend", '<span id="pt-off-dot"></span>');
    const hint = $("install-hint"), head = hint && hint.parentElement;
    if (head && !$("pt-off-row")) head.insertAdjacentHTML("afterend",
      '<div id="pt-off-row" class="flex items-center justify-between gap-2 text-[11px] text-zinc-400"><span id="pt-off-txt" class="min-w-0"></span>' +
      '<button id="pt-off-btn" type="button" class="hidden shrink-0 px-3 bg-emerald-600 text-white font-bold text-xs rounded-xl tap-active" style="min-height:44px">Save now</button></div>');
  }

  document.addEventListener("click", e => {
    const b = e.target && e.target.closest ? e.target.closest("#pt-off-btn") : null; if (!b || busy) return;
    busy = true; b.disabled = true; b.textContent = "Saving…";
    const a = window.app;
    save().then(ok => {
      busy = false; b.disabled = false; b.textContent = "Save now"; refresh();
      if (a && a.toast) a.toast(ok ? "Saved. The app now works offline." : (navigator.onLine === false ? "You're offline. Open the app once with internet to save it." : "Couldn't save it yet. Check your connection and try again."));
    });
  });

  // back online and the copy is missing: save it again without being asked
  window.addEventListener("online", () => { status().then(s => { paint(s); if (!s.ok && s.why !== "unsupported" && !busy) { busy = true; save().then(() => { busy = false; refresh(); }); } }); });

  // an installed app asks the browser to keep its saved copy and data (granted without a prompt for installed apps)
  async function keep() {
    try {
      if (!(PT.isStandalone && PT.isStandalone())) return;
      if (navigator.storage && navigator.storage.persist && !(await navigator.storage.persisted())) await navigator.storage.persist();
    } catch (e) { }
  }

  const oUA = proto.updateAppearanceUI;
  if (typeof oUA === "function") proto.updateAppearanceUI = function () { const r = oUA.apply(this, arguments); hint(); return r; };
  const oOS = proto.openSettings;
  if (typeof oOS === "function") proto.openSettings = function () { const r = oOS.apply(this, arguments); hint(); return r; };
  const oSE = proto.renderSettingsExtras;
  if (typeof oSE === "function") proto.renderSettingsExtras = async function () {
    const r = await oSE.apply(this, arguments);
    try { ensureUi(); refresh(); } catch (e) { console.error("PulseTrack offline row", e); }
    return r;
  };

  const css = document.createElement("style"); css.id = "pt-v258-off-css";
  css.textContent = `
    .pt-off-ok { color: rgb(52 211 153); font-weight: 700; }
    .pt-off-no { color: rgb(252 211 77); font-weight: 700; }
    html[data-mode="light"] .pt-off-ok { color: rgb(4 120 87); }
    html[data-mode="light"] .pt-off-no { color: rgb(180 83 9); }
  `;
  document.head.appendChild(css);

  ensureUi();
  // a missing copy is saved again at launch too, not only when the connection comes back
  setTimeout(() => {
    ensureUi(); keep();
    status().then(s => { paint(s); if (!s.ok && s.why !== "unsupported" && navigator.onLine !== false && !busy) { busy = true; save().then(() => { busy = false; refresh(); }); } });
  }, 2500);
})();
  