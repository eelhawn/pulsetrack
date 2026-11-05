
/* =====================================================================
 * PulseTrack 2.45.0: hype track for the PR attempt planner.
 *  PR attempt plan → Hype track → pick a song from your phone. In the plan, tick Attempt 2 and the rest timer starts for the wait
 *  before Attempt 3 (the ladder's own rest time). The moment it reaches zero, your song starts, from the second you chose (skip an
 *  intro straight to the drop). Tick Attempt 3 and it fades out. A "Stop" button stays on screen while it plays.
 *  - The song is copied into this phone's app storage (IndexedDB), up to 60 MB. It is not uploaded and not in backups; "Reset
 *    everything" removes it. Only the name, start time and volume are saved in settings.
 *  - "Start the rest timer when I tick a step" (on by default) does the same for every step in the ladder, using the rest shown on it.
 *  - Phones only let a page start sound after you have tapped it. Ticking a step is that tap, so the song is made ready then; if the
 *    phone still refuses, a "Play the hype track" button appears.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  const A = () => window.app, $ = id => document.getElementById(id), esc = s => PT.esc(String(s == null ? "" : s));
  const DB = "pulsetrack-hype", STORE = "tracks", KEY = "main", MAX_BYTES = 60 * 1024 * 1024, TEST_S = 10;
  const save = a => { try { WorkoutStorage.saveSettings(a.settings); } catch (e) { } };

  /* ---------------------------------------------------------------- storage */
  const HypeDB = {
    _db: null,
    open() {
      return new Promise((resolve, reject) => {
        if (this._db) return resolve(this._db);
        if (!("indexedDB" in window)) return reject(new Error("no indexedDB"));
        const req = indexedDB.open(DB, 1);
        req.onupgradeneeded = () => { if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE, { keyPath: "id" }); };
        req.onsuccess = () => { this._db = req.result; this._db.onversionchange = () => { try { this._db.close(); } catch (e) { } this._db = null; }; resolve(this._db); };
        req.onerror = () => reject(req.error);
      });
    },
    async _tx(mode, fn) {
      const db = await this.open();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, mode), store = tx.objectStore(STORE); let result;
        const r = fn(store); if (r) r.onsuccess = () => { result = r.result; };
        tx.oncomplete = () => resolve(result); tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error);
      });
    },
    get() { return this._tx("readonly", s => s.get(KEY)); },
    put(rec) { return this._tx("readwrite", s => s.put(Object.assign({ id: KEY }, rec))); },
    del() { return this._tx("readwrite", s => s.delete(KEY)); },
    clear() { return this._tx("readwrite", s => s.clear()); }
  };
  try {
    if (typeof PhotoDB !== "undefined" && PhotoDB && typeof PhotoDB.clear === "function") {
      const oClear = PhotoDB.clear;
      PhotoDB.clear = function () { return Promise.all([oClear.apply(this, arguments), HypeDB.clear().catch(() => { })]).then(() => undefined); };
    }
  } catch (e) { }

  /* ---------------------------------------------------------------- settings */
  const hy = a => (a.settings.hype && typeof a.settings.hype === "object" ? a.settings.hype : null);
  const hyw = a => (hy(a) || (a.settings.hype = {}));
  let have = false;                 // the song file is on this phone
  let audio = null, url = null, ready = false, armed = false, playing = false, starting = false, stopTimer = null, liveTimer = null, testTimer = null;
  const linked = () => { const a = A(); return !!(a && hy(a) && hy(a).name && have); };
  const fmtT = s => { s = Math.max(0, Math.round(s || 0)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
  const parseT = v => { v = String(v || "").trim(); if (!v) return 0; const m = /^(\d+):(\d{1,2})$/.exec(v); if (m) return (+m[1]) * 60 + Math.min(59, +m[2]); const n = parseFloat(v); return n > 0 ? n : 0; };
  const mb = b => (b / 1048576).toFixed(b >= 10485760 ? 0 : 1) + " MB";
  /** "1–2 min" → 90, "30 s" → 30 */
  function restSecs(txt) {
    const m = /(\d+(?:\.\d+)?)(?:\s*[–-]\s*(\d+(?:\.\d+)?))?\s*(s|sec|min)/i.exec(String(txt || "")); if (!m) return 0;
    const lo = parseFloat(m[1]), hi = m[2] ? parseFloat(m[2]) : lo, u = /^min/i.test(m[3]) ? 60 : 1;
    return Math.round(((lo + hi) / 2) * u);
  }

  /* ---------------------------------------------------------------- the audio element */
  const make = () => {
    if (audio) return audio;
    audio = new Audio(); audio.preload = "auto"; audio.loop = false;
    audio.addEventListener("ended", () => { playing = false; chip(); });
    audio.addEventListener("pause", () => { if (!audio.ended) { playing = false; chip(); } });
    return audio;
  };
  async function prepare() {
    try {
      const rec = await HypeDB.get(); have = !!(rec && rec.blob);
      if (!have) { ready = false; return false; }
      if (url) { try { URL.revokeObjectURL(url); } catch (e) { } }
      url = URL.createObjectURL(rec.blob); const au = make(); au.src = url; au.load(); ready = true; return true;
    } catch (e) { have = false; ready = false; return false; }
  }
  /** inside a tap: lets a phone that is strict about autoplay start this element later without another tap */
  function unlock() {
    if (!ready || !audio) return;
    if (playing) return;
    try { audio.muted = true; const p = audio.play(); if (p && p.then) p.then(() => { if (audio.muted && !playing) { audio.pause(); audio.currentTime = 0; } audio.muted = false; }).catch(() => { audio.muted = false; }); } catch (e) { }
  }
  async function play(opts) {
    opts = opts || {}; const a = A(); if (!a || !ready) { if (!(await prepare())) throw new Error("no song"); }
    const au = make(), h = hy(a) || {};
    clearTimeout(stopTimer); clearTimeout(testTimer);
    au.muted = false; au.volume = Math.min(1, Math.max(0.05, (h.vol || 1)));
    try { au.currentTime = Math.min(h.start || 0, Math.max(0, (au.duration || 1e9) - 1)); } catch (e) { }
    await au.play(); playing = true; chip();
    if (opts.test) testTimer = setTimeout(() => stop(true), TEST_S * 1000);
  }
  function stop(fade) {
    clearTimeout(testTimer); armed = false;
    if (!audio || (!playing && audio.paused)) { playing = false; chip(); return; }
    if (!fade) { audio.pause(); playing = false; chip(); return; }
    const au = audio, v0 = au.volume; let n = 0;
    const iv = setInterval(() => { n++; au.volume = Math.max(0, v0 * (1 - n / 12)); if (n >= 12) { clearInterval(iv); au.pause(); au.volume = v0; playing = false; chip(); } }, 100);
  }

  /* ---------------------------------------------------------------- the floating Stop button */
  function chip(failed) {
    let c = $("pt-hype-chip");
    if (!playing && !failed) { if (c) c.remove(); return; }
    if (!c) { c = document.createElement("button"); c.type = "button"; c.id = "pt-hype-chip"; c.className = "tap-active"; document.body.appendChild(c); }
    c.dataset.hy = failed ? "playnow" : "stop";
    c.textContent = failed ? "▶ Play the hype track" : "🔊 Hype track · Stop";
    c.classList.toggle("fail", !!failed);
  }

  /* ---------------------------------------------------------------- the rest timer hook */
  function hook(a) {
    const rt = a && a.restTimer; if (!rt || rt.__hype) return; rt.__hype = true;
    const oStart = rt.start.bind(rt), oFinish = rt.finish.bind(rt), oDismiss = rt.dismiss ? rt.dismiss.bind(rt) : null;
    rt.start = function (sec) { if (!starting) armed = false; return oStart(sec); };
    rt.finish = function () {
      const was = armed; armed = false;
      if (!was) return oFinish();
      const app = A(), oa = app.announceNextSet; app.announceNextSet = () => { };       // no "Rest complete" voice over the song
      try { oFinish(); } finally { app.announceNextSet = oa; }
      setTimeout(() => { play().then(() => { try { app.toast("🔊 Hype track. Go get it.", undefined, undefined, 4000); } catch (e) { } }).catch(() => chip(true)); }, 350);
    };
    if (oDismiss) rt.dismiss = function () { if (armed && rt.running) armed = false; return oDismiss(); };
  }

  /* ---------------------------------------------------------------- ticking the ladder (called by the PR planner) */
  function onTick(a, p, id, nowDone) {
    try {
      hook(a);
      if (!nowDone) return;
      if (id === "a3") { stop(true); return; }
      const pl = PT.attemptPlan(a, p), i = pl.ladder.findIndex(r => r.id === id); if (i < 0) return;
      const r = pl.ladder[i], next = pl.ladder[i + 1], secs = restSecs(r.rest); if (!secs) return;
      const final = !!(next && next.id === "a3" && linked()), want = (hy(a) || {}).timer !== false;
      if (!want && !final) return;
      unlock();
      starting = true; try { a.restTimer.start(secs); } finally { starting = false; }
      armed = final;
      if (final) { try { a.acquireWakeLock && a.acquireWakeLock(); } catch (e) { } }
      live();
    } catch (e) { console.error("PulseTrack hype", e); }
  }

  /* ---------------------------------------------------------------- the block in the plan sheet */
  function block(a) {
    const h = hy(a), has = h && h.name && have;
    if (!has) {
      return `<div class="pt-hy" id="pt-hy"><div class="pt-hy-h"><b>🔊 Hype track</b><span>Your song starts when the rest before Attempt 3 hits zero</span></div>
        ${h && h.name && !have ? `<p class="pt-hy-f">“${esc(h.name)}” is not on this phone. Songs are not part of backups, so choose it again.</p>` : ""}
        <button type="button" class="pt-hy-go tap-active" data-hy="choose">Choose a song from this phone</button>
        <p class="pt-hy-f">Pick any audio file, for example from Samsung Music or your downloads. It is copied into the app and stays on this phone. Tick Attempt 2 to start the rest; tick Attempt 3 to fade it out.</p></div>`;
    }
    return `<div class="pt-hy on" id="pt-hy"><div class="pt-hy-h"><b>🔊 ${esc(h.name)}</b><span>${fmtT(h.dur)}${h.size ? " · " + mb(h.size) : ""}</span></div>
      <div class="pt-hy-row"><label>Start at <input id="pt-hy-start" type="text" inputmode="numeric" value="${fmtT(h.start || 0)}" aria-label="Start at, minutes and seconds"></label>
        <label>Volume <input id="pt-hy-vol" type="range" min="10" max="100" value="${Math.round((h.vol || 1) * 100)}" aria-label="Volume"></label></div>
      <div class="pt-hy-b"><button type="button" class="pt-hy-ghost tap-active" data-hy="test">▶ Test</button><button type="button" class="pt-hy-ghost tap-active" data-hy="choose">Change</button><button type="button" class="pt-hy-ghost tap-active" data-hy="remove">Remove</button></div>
      <label class="pt-hy-t"><input type="checkbox" data-hy-timer ${h.timer === false ? "" : "checked"}> <span>Start the rest timer when I tick a step</span></label>
      <p class="pt-hy-f">Tick Attempt 2 and the rest timer starts. At zero the song plays; tick Attempt 3 to fade it out. Your phone volume still decides how loud it is.</p></div>`;
  }
  /** the strip at the top of the plan sheet (the floating rest timer sits behind the sheet, so the countdown is repeated here) */
  const liveHtml = () => `<div class="pt-hy-live" id="pt-hy-live"></div>`;
  function live() {
    clearInterval(liveTimer); liveTimer = null;
    const draw = () => {
      const a = A(), el = $("pt-hy-live"), sheet = $("modal-sheet");
      if (!el || !sheet || sheet.classList.contains("hidden")) { clearInterval(liveTimer); liveTimer = null; return; }
      const rt = a && a.restTimer;
      let html = "";
      if (rt && rt.isRunning() && !rt.isPaused) html = `<span>Resting <b>${fmtT(rt.remaining())}</b>${armed ? " · then your hype track 🔊" : ""}</span><button type="button" data-hy="skip" class="tap-active">Skip</button>`;
      else if (armed) html = `<span>Your hype track is armed</span>`;
      if (el.innerHTML !== html) el.innerHTML = html;
      el.classList.toggle("on", !!html);
    };
    draw(); liveTimer = setInterval(draw, 500);
  }
  function afterRender(a) { prepare().then(() => { /* the song may have appeared since the sheet opened */ }); live(); }

  /* ---------------------------------------------------------------- picking the file */
  function chooser() {
    let f = $("pt-hy-file");
    if (!f) { f = document.createElement("input"); f.type = "file"; f.id = "pt-hy-file"; f.accept = "audio/*,.mp3,.m4a,.aac,.wav,.ogg,.flac,.opus"; f.className = "hidden"; document.body.appendChild(f); }
    return f;
  }
  function duration(file) {
    return new Promise(res => {
      const t = new Audio(), u = URL.createObjectURL(file); let done = false;
      const end = d => { if (done) return; done = true; try { URL.revokeObjectURL(u); } catch (e) { } res(isFinite(d) ? d : 0); };
      t.preload = "metadata"; t.onloadedmetadata = () => end(t.duration); t.onerror = () => end(0); setTimeout(() => end(0), 4000); t.src = u;
    });
  }
  async function onFile(file) {
    const a = A(); if (!a || !file) return;
    const okType = /^audio\//.test(file.type) || /\.(mp3|m4a|aac|wav|ogg|oga|flac|opus|weba)$/i.test(file.name);
    if (!okType) { a.toast("That does not look like an audio file"); return; }
    if (file.size > MAX_BYTES) { a.toast("That file is over 60 MB. Pick a shorter version."); return; }
    const dur = await duration(file);
    if (!dur) { a.toast("This phone could not play that file. Try an mp3 or m4a."); return; }
    try { await HypeDB.put({ name: file.name, type: file.type, size: file.size, blob: file }); } catch (e) { a.toast("Could not save the song on this phone"); return; }
    const h = hyw(a), old = h.name; h.name = file.name.replace(/\.[a-z0-9]{2,5}$/i, ""); h.size = file.size; h.dur = Math.round(dur); if (!old) { h.start = 0; h.vol = 1; } if (h.start > dur) h.start = 0;
    save(a); have = true; await prepare(); a.toast("Hype track ready"); if (typeof PT.openAttempt === "function") PT.openAttempt();
  }

  /* ---------------------------------------------------------------- clicks */
  document.addEventListener("click", async e => {
    const a = A(); if (!a || !e.target || !e.target.closest) return;
    const b = e.target.closest("[data-hy]"); if (!b) return;
    const k = b.dataset.hy;
    if (k === "choose") { chooser().click(); return; }
    if (k === "stop") { stop(true); return; }
    if (k === "skip") { try { a.restTimer.dismiss(); } catch (x) { } armed = false; return; }
    if (k === "playnow") { try { await play(); } catch (x) { a.toast("Could not play it. Open the plan and tap Test."); } return; }
    if (k === "test") { try { if (!ready) await prepare(); await play({ test: true }); a.toast("Playing for " + TEST_S + " seconds"); } catch (x) { chip(true); a.toast("Your phone would not play it. Check the volume and the file."); } return; }
    if (k === "remove") {
      if (!(await PT.confirm("Remove the hype track?", { title: "Remove song?", body: "The copy inside PulseTrack is deleted. The file on your phone is not touched.", ok: "Remove" }))) return;
      try { await HypeDB.del(); } catch (x) { } stop(false); have = false; ready = false;
      const h = hyw(a); ["name", "size", "dur", "start", "vol"].forEach(x => delete h[x]); save(a); if (typeof PT.openAttempt === "function") PT.openAttempt();
    }
  });
  document.addEventListener("change", e => {
    const a = A(); if (!a || !e.target) return;
    if (e.target.id === "pt-hy-file") { const f = e.target.files && e.target.files[0]; e.target.value = ""; if (f) onFile(f); return; }
    if (e.target.id === "pt-hy-start") { const h = hyw(a); h.start = Math.min(parseT(e.target.value), Math.max(0, (h.dur || 0) - 5)); e.target.value = fmtT(h.start); save(a); return; }
    if (e.target.id === "pt-hy-vol") { const h = hyw(a); h.vol = Math.min(1, Math.max(0.1, (parseInt(e.target.value, 10) || 100) / 100)); save(a); if (audio && playing) audio.volume = h.vol; return; }
    if (e.target.matches && e.target.matches("[data-hy-timer]")) { hyw(a).timer = !!e.target.checked; save(a); }
  });
  document.addEventListener("input", e => { if (e.target && e.target.id === "pt-hy-vol" && audio && playing) audio.volume = Math.min(1, Math.max(0.1, (parseInt(e.target.value, 10) || 100) / 100)); });

  PT.hype = { linked, block, liveHtml, afterRender, onTick, play, stop, prepare, restSecs, unlock, db: HypeDB, state: () => ({ have, ready, armed, playing }), audio: () => audio };
  const oHome = ApplicationUI.prototype.renderHomeView;      // find out whether a song is saved as soon as the app is up
  ApplicationUI.prototype.renderHomeView = function () { const r = oHome.apply(this, arguments); try { if (!ready && !have && hy(this) && hy(this).name) prepare(); hook(this); } catch (e) { } return r; };

  const css = document.createElement("style");
  css.id = "pt-v245-hype-css";
  css.textContent = `
    .pt-hy { padding: .8rem .85rem; border-radius: .95rem; background: rgb(var(--z900)); border: 1px solid rgb(var(--z800)); display: grid; gap: .6rem; }
    .pt-hy.on { border-color: rgb(var(--a500) / .5); }
    .pt-hy-h { display: grid; gap: .1rem; } .pt-hy-h b { font-size: .85rem; color: rgb(var(--z50)); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } .pt-hy-h span { font-size: .68rem; color: rgb(var(--z400)); }
    .pt-hy-f { font-size: .66rem; line-height: 1.45; color: rgb(var(--z500)); }
    .pt-hy-go { padding: .7rem .9rem; border-radius: .8rem; background: rgb(var(--a600)); color: #fff; font-size: .8rem; font-weight: 800; }
    .pt-hy-row { display: grid; grid-template-columns: auto 1fr; gap: .75rem; align-items: center; } .pt-hy-row label { display: flex; align-items: center; gap: .45rem; font-size: .7rem; font-weight: 700; color: rgb(var(--z300)); }
    .pt-hy-row input[type=text] { width: 3.6rem; text-align: center; padding: .45rem .3rem; border-radius: .6rem; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); color: rgb(var(--z100)); font-family: ui-monospace, Menlo, monospace; }
    .pt-hy-row input[type=range] { width: 100%; min-width: 0; accent-color: rgb(var(--a500)); }
    .pt-hy-b { display: flex; gap: .4rem; } .pt-hy-ghost { flex: 1 1 0; padding: .55rem .5rem; border-radius: .7rem; background: rgb(var(--z800)); color: rgb(var(--z100)); font-size: .75rem; font-weight: 800; }
    .pt-hy-t { display: flex; align-items: center; gap: .5rem; font-size: .72rem; color: rgb(var(--z300)); } .pt-hy-t input { accent-color: rgb(var(--a500)); width: 1.1rem; height: 1.1rem; }
    .pt-hy-live { display: none; position: sticky; top: 0; z-index: 5; align-items: center; justify-content: space-between; gap: .6rem; padding: .6rem .8rem; border-radius: .8rem; background: rgb(var(--z900)); border: 1px solid rgb(251 191 36 / .6); box-shadow: 0 6px 18px rgba(0,0,0,.45); font-size: .8rem; font-weight: 700; color: rgb(252 211 77); }
    .pt-hy-live.on { display: flex; } .pt-hy-live b { font-family: ui-monospace, Menlo, monospace; font-size: 1rem; }
    .pt-hy-live button { padding: .4rem .75rem; border-radius: .6rem; background: rgb(var(--z800)); color: rgb(var(--z100)); font-size: .72rem; font-weight: 800; flex: none; }
    #pt-hype-chip { position: fixed; left: 50%; transform: translateX(-50%); bottom: calc(1rem + env(safe-area-inset-bottom, 0px)); z-index: 90; padding: .8rem 1.2rem; border-radius: 999px; background: rgb(var(--a600)); color: #fff; font-size: .9rem; font-weight: 800; box-shadow: 0 10px 30px rgba(0,0,0,.5); }
    #pt-hype-chip.fail { background: rgb(217 119 6); }
  `;
  document.head.appendChild(css);
})();
  