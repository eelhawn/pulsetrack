
/* =====================================================================
 * PulseTrack 2.44.0: form clips.
 *  Film a short clip of a set, keep it on the phone with the exercise, and watch it back later, slowed down, a frame at a time, or
 *  next to an older clip of the same lift.
 *  - On a workout's exercise card a "🎥 Clips" button (next to Form tips, with the count when there are some) opens that exercise's clips. Workout screen ⋯ More →
 *    "Form clips" and Body → "Form clips" open the whole collection.
 *  - Record with the phone's camera, or pick a video you already filmed. The video file itself is saved (nothing is re-encoded or uploaded).
 *  - Clips live in this phone's IndexedDB ("pulsetrack-clips"), like the progress photos: they stay on the phone, are NOT part of the
 *    backup file (too big), and "Reset everything" removes them. Nothing leaves the phone unless you tap Share.
 *  - Player: slow motion (0.25x, 0.5x, 1x), step one frame back or forward, a note, Share, Delete. Compare plays two clips side by side
 *    with one set of controls.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined" || !PT.kit) return;
  const proto = ApplicationUI.prototype, A = () => window.app, K = PT.kit, esc = K.esc, $ = id => document.getElementById(id);
  const DB = "pulsetrack-clips", STORE = "clips", MB = 1048576, WARN_MB = 120, MAX_MB = 400, FPS = 30;
  const norm = s => String(s || "").trim().toLowerCase().replace(/\s+/g, " ");

  /* ---------------------------------------------------------------- storage */
  const ClipDB = {
    _db: null,
    open() {
      return new Promise((resolve, reject) => {
        if (this._db) return resolve(this._db);
        if (!("indexedDB" in window)) return reject(new Error("This browser cannot store clips."));
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
    all() { return this._tx("readonly", s => s.getAll()).then(r => r || []); },
    put(rec) { return this._tx("readwrite", s => s.put(rec)); },
    del(id) { return this._tx("readwrite", s => s.delete(id)); },
    clear() { return this._tx("readwrite", s => s.clear()); }
  };
  // "Reset everything" already clears the photos; clear the clips in the same step
  try {
    if (typeof PhotoDB !== "undefined" && PhotoDB && typeof PhotoDB.clear === "function") {
      const oClear = PhotoDB.clear;
      PhotoDB.clear = function () { return Promise.all([oClear.apply(this, arguments), ClipDB.clear().catch(() => { })]).then(() => undefined); };
    }
  } catch (e) { }

  let cache = [], loaded = false, loading = null;
  function load() {
    if (loaded) return Promise.resolve(cache);
    if (!loading) loading = ClipDB.all().then(r => { cache = r.sort((x, y) => (y.ts || 0) - (x.ts || 0)); loaded = true; return cache; }).catch(() => { cache = []; loaded = true; return cache; });
    return loading;
  }
  const forEx = name => cache.filter(c => c.exk === norm(name));
  const byId = id => cache.find(c => c.id === id) || null;
  const totalBytes = () => cache.reduce((n, c) => n + (c.size || 0), 0);
  const sizeTxt = n => (n >= 10 * MB ? Math.round(n / MB) : Math.round(n / MB * 10) / 10) + " MB";
  const mmss = s => { s = Math.max(0, Math.round(s || 0)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
  const when = c => PT.fmtDate(c.date, { month: "short", day: "numeric", year: c.date.slice(0, 4) === PT.ds().slice(0, 4) ? undefined : "numeric" });
  PT.clips = {
    db: ClipDB, load, count: name => forEx(name).length, all: () => cache.slice(),
    get: id => byId(id), norm, liftOf: (a, ex) => liftOf(a, ex),
    /** a clip made inside the app (the bar-path camera) */
    add: async rec => { await load(); await ClipDB.put(rec); cache.unshift(rec); refreshCards(); rerender(); },
    /** a clip that was changed (its bar-path numbers) */
    save: async rec => { await ClipDB.put(rec); rerender(rec.id); },
    refresh: () => refreshCards()
  };
  /** if the clips sheet is open, show it again so it reflects a change made elsewhere */
  function rerender(id) {
    try {
      if (!el || el.classList.contains("hidden")) return;
      if (S.view === "play") { if (!id || id === S.id) showPlay(S.id); } else if (S.view === "ex") showEx(S.name); else if (S.view === "home") showHome();
    } catch (e) { }
  }

  /* ---------------------------------------------------------------- the file pickers */
  let pending = null, urls = [];
  function ensureInputs() {
    if ($("pt-clip-cam")) return;
    const mk = (id, cam) => { const i = document.createElement("input"); i.type = "file"; i.accept = "video/*"; if (cam) i.setAttribute("capture", "environment"); i.id = id; i.hidden = true; i.addEventListener("change", onFile); document.body.appendChild(i); };
    mk("pt-clip-cam", true); mk("pt-clip-lib", false);
  }
  /** has to be called straight from a tap, or the phone will not open the camera */
  function pick(cam, ctx) { ensureInputs(); pending = ctx || null; const i = $(cam ? "pt-clip-cam" : "pt-clip-lib"); i.value = ""; i.click(); }

  function probe(file) {
    return new Promise(resolve => {
      const v = document.createElement("video"), u = URL.createObjectURL(file); let done = false;
      const end = d => { if (done) return; done = true; try { URL.revokeObjectURL(u); } catch (e) { } v.removeAttribute("src"); resolve(d); };
      v.preload = "metadata"; v.muted = true; v.onloadedmetadata = () => end(isFinite(v.duration) ? v.duration : null); v.onerror = () => end(null);
      setTimeout(() => end(null), 4000); v.src = u;
    });
  }
  /** the heaviest set logged today for this exercise, as { w, r } (so two clips can say "205 x 5" and "225 x 5") */
  function liftOf(a, ex) {
    try {
      if (!ex || !a.activeProgram || !a.activeDay) return null;
      const pre = `${a.activeProgram.id}_d${a.activeDay.dayNumber}_${ex.id}_s`; let best = null;
      Object.keys(a.logs || {}).forEach(k => {
        if (!k.startsWith(pre)) return; const l = a.logs[k]; if (!l || l.tag === "W") return; const w = parseFloat(l.weight), r = parseFloat(l.reps);
        if (w > 0 && r > 0 && (!best || w > best.w || (w === best.w && r > best.r))) best = { w, r };
      });
      return best;
    } catch (e) { return null; }
  }
  async function askName(a) {
    const seen = new Set(), items = [];
    const add = n => { const k = norm(n); if (!k || seen.has(k)) return; seen.add(k); items.push({ value: n, label: n }); };
    ((a.activeDay && a.activeDay.exercises) || []).forEach(e => add(e.name));
    (a.sessions || []).slice().sort((x, y) => (y.ts || 0) - (x.ts || 0)).slice(0, 40).forEach(s => (s.ex || []).forEach(e => add(e.name)));
    cache.forEach(c => add(c.ex));
    items.splice(40); items.push({ value: "\u0000other", label: "Another exercise…" });
    let v = await PT.pickList("Which exercise is this clip of?", items, items[0] ? items[0].value : "");
    if (v === "\u0000other") v = await PT.prompt("Name the exercise", "");
    v = String(v || "").trim().slice(0, 80);
    return v || null;
  }
  async function onFile(e) {
    const f = e.target.files && e.target.files[0]; e.target.value = ""; if (!f) return;
    const a = A(), ctx = pending; pending = null;
    if (!/^video\//i.test(f.type || "") && !/\.(mp4|m4v|mov|webm|3gp|mkv)$/i.test(f.name || "")) { await PT.alert("That is not a video file."); return; }
    if (f.size > MAX_MB * MB) { await PT.alert(`That clip is ${sizeTxt(f.size)}, too big to keep on the phone. Film 10 to 20 seconds of one set, or trim it first.`); return; }
    if (f.size > WARN_MB * MB && !await PT.confirm(`That clip is ${sizeTxt(f.size)}. Clips stay on this phone and use its storage. Keep it?`)) return;
    try { if (navigator.storage && navigator.storage.estimate) { const q = await navigator.storage.estimate(); if (q && q.quota && q.usage != null && q.quota - q.usage < f.size * 1.5) { await PT.alert("The phone does not have room for this clip. Free some space, or delete older clips first."); return; } } } catch (x) { }
    await load();
    let name = ctx && ctx.name; if (!name) name = await askName(a); if (!name) return;
    const dur = await probe(f), lift = ctx && ctx.ex ? liftOf(a, ctx.ex) : null;
    const rec = { id: PT.uid(), ts: Date.now(), date: PT.ds(), ex: name, exk: norm(name), note: "", type: f.type || "video/mp4", size: f.size, dur, lift, blob: f.slice(0, f.size, f.type || "video/mp4") };
    try { await ClipDB.put(rec); } catch (err) { await PT.alert("Could not save the clip. " + (err && err.message ? err.message : "The phone may be out of space.")); return; }
    cache.unshift(rec); refreshCards();
    A().toast(`Saved a clip of ${name}`, undefined, undefined, 3500);
    showEx(name);
  }

  /* ---------------------------------------------------------------- the sheet */
  let el = null, S = { view: "", name: "", sel: [], cmp: false }, nextUrls = [];
  const revokeAll = () => { urls.forEach(u => { try { URL.revokeObjectURL(u); } catch (e) { } }); urls = []; };
  // a view's video addresses are made while its HTML is built, and the previous view's are released only when the new one is painted
  const urlOf = c => { const u = URL.createObjectURL(c.blob); nextUrls.push(u); return u; };
  function open(opts) {
    opts = opts || {}; ensureInputs();
    el = K.sheet("pt-clips", 58); S = { view: "", name: "", sel: [], cmp: false };
    load().then(() => { if (opts.name) showEx(opts.name, opts.ex); else showHome(); });
  }
  function paint(html) { revokeAll(); urls = nextUrls; nextUrls = []; const c = K.openSheet(el, html); el.__onClose = revokeAll; c.addEventListener("click", clicks); return c; }
  /** the index of this exercise in the workout on screen, so a clip filmed from the list can still carry the set you just did */
  const idxIn = (a, name) => { try { const i = ((a.activeDay && a.activeDay.exercises) || []).findIndex(e => norm(e.name) === norm(name)); return i >= 0 ? i : null; } catch (e) { return null; } };
  const recBtns = (name, exIdx) => `<div class="pt-fc-rec"><button type="button" class="pt-st-b" data-fc="cam" data-n="${esc(name || "")}" data-i="${exIdx == null ? "" : exIdx}">🎥 Record a clip</button><button type="button" class="pt-st-b ghost" data-fc="lib" data-n="${esc(name || "")}" data-i="${exIdx == null ? "" : exIdx}">Choose a video</button>${PT.bar ? `<button type="button" class="pt-st-b ghost pt-bar-new" data-fc="bar-rec" data-n="${esc(name || "")}" data-i="${exIdx == null ? "" : exIdx}">🎯 Record with bar tracking</button>` : ""}</div>`;
  const keepNote = `<p class="pt-fc-fine">Clips stay on this phone only. They are not in the backup file, and nothing is uploaded.</p>`;

  function showHome() {
    S.view = "home";
    const groups = {}; cache.forEach(c => { (groups[c.exk] = groups[c.exk] || { name: c.ex, list: [] }).list.push(c); });
    const rows = Object.values(groups).sort((x, y) => (y.list[0].ts || 0) - (x.list[0].ts || 0));
    paint(`${K.head("Form clips", cache.length ? `${cache.length} clip${cache.length === 1 ? "" : "s"} · ${sizeTxt(totalBytes())} on this phone` : "Film a set, watch it back")}
      ${cache.length ? "" : `<p class="pt-fc-p">Film a set with your phone. The clip is kept with the exercise, so next month you can play it next to this one, slowed down, one frame at a time.</p>`}
      ${recBtns("", null)}
      ${rows.length ? `<div class="pt-st-rows">${rows.map(g => `<button type="button" class="pt-st-row" data-fc="ex" data-n="${esc(g.name)}"><span class="pt-st-t">${esc(g.name)}</span><span class="pt-st-s">${g.list.length} clip${g.list.length === 1 ? "" : "s"} · latest ${esc(when(g.list[0]))}</span></button>`).join("")}</div>` : ""}
      ${keepNote}`);
  }

  function showEx(name, exIdx) {
    S.view = "ex"; S.name = name; S.sel = []; S.cmp = S.cmp && forEx(name).length > 1;
    if (exIdx == null) exIdx = idxIn(A(), name);
    const list = forEx(name);
    const c = paint(`${K.head(name, list.length ? `${list.length} clip${list.length === 1 ? "" : "s"}` : "No clips yet")}
      ${recBtns(name, exIdx)}
      ${list.length > 1 ? `<div class="pt-fc-cmp"><button type="button" class="pt-fc-cmpb${S.cmp ? " on" : ""}" data-fc="cmp" aria-pressed="${S.cmp}">${S.cmp ? "Pick two clips" : "Compare two clips"}</button><span id="pt-fc-hint">${S.cmp ? "0 of 2 picked" : ""}</span></div>` : ""}
      <div class="pt-fc-grid">${list.map(cl => `<button type="button" class="pt-fc-card" data-fc="${S.cmp ? "pick" : "play"}" data-id="${esc(cl.id)}" aria-pressed="false">
          <video muted playsinline preload="metadata" src="${urlOf(cl)}#t=0.1"></video>
          <span class="pt-fc-d">${esc(when(cl))}${cl.dur ? " · " + mmss(cl.dur) : ""}</span>
          ${cl.lift ? `<span class="pt-fc-l">${esc(String(cl.lift.w))} × ${esc(String(cl.lift.r))}</span>` : ""}
          ${cl.bar && cl.bar.summary ? `<span class="pt-fc-bar">🎯 ${(Math.round(cl.bar.summary.avgMcv * 100) / 100).toFixed(2)} m/s</span>` : ""}
          ${cl.note ? `<span class="pt-fc-n">${esc(cl.note)}</span>` : ""}</button>`).join("")}</div>
      ${list.length ? "" : `<p class="pt-fc-p">Nothing filmed for this exercise yet.</p>`}
      <button type="button" class="pt-st-back" data-fc="home">‹ All clips</button>${keepNote}`);
    c.querySelectorAll(".pt-fc-card video").forEach(v => { v.addEventListener("error", () => { v.classList.add("bad"); }); });
  }

  /* one player; the speed chips and the frame buttons drive it */
  function playerControls(id) {
    return `<div class="pt-fc-ctl" id="${id}">
      <div class="pt-fc-speed" role="group" aria-label="Speed">${[0.25, 0.5, 1].map(s => `<button type="button" data-fc="spd" data-s="${s}" aria-pressed="${s === 1}">${s === 1 ? "1×" : s + "×"}</button>`).join("")}</div>
      <div class="pt-fc-step"><button type="button" data-fc="fb" aria-label="Back one frame">◀ frame</button><button type="button" data-fc="pp" class="pt-fc-pp" aria-label="Play or pause">▶ Play</button><button type="button" data-fc="ff" aria-label="Forward one frame">frame ▶</button></div>
      <input type="range" min="0" max="1000" value="0" data-fc="seek" aria-label="Position"><div class="pt-fc-time"><span data-fc="t">0:00</span><span data-fc="dur">0:00</span></div></div>`;
  }
  function showPlay(id) {
    const cl = byId(id); if (!cl) { showEx(S.name); return; }
    S.view = "play"; S.id = id;
    const c = paint(`${K.head(cl.ex, when(cl) + (cl.lift ? ` · ${cl.lift.w} × ${cl.lift.r}` : ""))}
      <video id="pt-fc-v" class="pt-fc-video" playsinline controls preload="auto" src="${urlOf(cl)}"></video>
      ${playerControls("pt-fc-c")}
      ${PT.bar ? PT.bar.rowHtml(cl) : ""}
      <p class="pt-fc-note ${cl.note ? "" : "empty"}">${cl.note ? esc(cl.note) : "No note"}</p>
      <div class="pt-fc-acts"><button type="button" class="pt-st-b ghost" data-fc="note">${cl.note ? "Edit note" : "Add a note"}</button><button type="button" class="pt-st-b ghost" data-fc="share">Share</button><button type="button" class="pt-st-b ghost danger" data-fc="del">Delete</button></div>
      <button type="button" class="pt-st-back" data-fc="ex" data-n="${esc(cl.ex)}">‹ ${esc(cl.ex)}</button>`);
    wire(c, [c.querySelector("#pt-fc-v")], c.querySelector("#pt-fc-c"));
  }
  function showCompare(ids) {
    const cls = ids.map(byId).filter(Boolean); if (cls.length < 2) { showEx(S.name); return; }
    S.view = "cmp";
    const c = paint(`${K.head("Compare", cls[0].ex)}
      <div class="pt-fc-two">${cls.map((cl, i) => `<figure><video class="pt-fc-video" playsinline muted preload="auto" src="${urlOf(cl)}" data-k="${i}"></video><figcaption>${esc(when(cl))}${cl.lift ? ` · ${esc(String(cl.lift.w))} × ${esc(String(cl.lift.r))}` : ""}</figcaption></figure>`).join("")}</div>
      ${playerControls("pt-fc-c")}
      <p class="pt-fc-fine">Both clips play together at the same speed. The scrubber follows the longer one.</p>
      <button type="button" class="pt-st-back" data-fc="ex" data-n="${esc(cls[0].ex)}">‹ ${esc(cls[0].ex)}</button>`);
    wire(c, [...c.querySelectorAll("video.pt-fc-video")], c.querySelector("#pt-fc-c"));
  }

  /** shared controls for one or two <video> elements */
  function wire(card, vids, ctl) {
    const seek = ctl.querySelector('[data-fc="seek"]'), tEl = ctl.querySelector('[data-fc="t"]'), dEl = ctl.querySelector('[data-fc="dur"]'), pp = ctl.querySelector('[data-fc="pp"]');
    const dur = () => Math.max(0, ...vids.map(v => (isFinite(v.duration) ? v.duration : 0)));
    const anyPlaying = () => vids.some(v => !v.paused && !v.ended);
    let rate = 1, dragging = false;
    const sync = () => {
      const d = dur(), t = Math.max(...vids.map(v => v.currentTime || 0));
      if (!dragging) seek.value = d ? String(Math.round(t / d * 1000)) : "0";
      tEl.textContent = mmss(t); dEl.textContent = mmss(d); pp.textContent = anyPlaying() ? "❚❚ Pause" : "▶ Play";
    };
    vids.forEach(v => { ["timeupdate", "loadedmetadata", "play", "pause", "ended", "seeked"].forEach(ev => v.addEventListener(ev, sync)); v.defaultPlaybackRate = 1; });
    vids.forEach(v => v.addEventListener("error", () => { card.querySelector(".pt-fc-note, .pt-fc-fine") && 0; v.classList.add("bad"); }));
    const play = () => { vids.forEach(v => { if (v.ended || (v.duration && v.currentTime >= v.duration - 0.05)) v.currentTime = 0; v.playbackRate = rate; const p = v.play(); if (p && p.catch) p.catch(() => { }); }); };
    const pause = () => vids.forEach(v => v.pause());
    ctl.addEventListener("click", e => {
      const b = e.target.closest("[data-fc]"); if (!b) return; const k = b.dataset.fc;
      if (k === "spd") { rate = parseFloat(b.dataset.s); vids.forEach(v => { v.playbackRate = rate; }); ctl.querySelectorAll('[data-fc="spd"]').forEach(x => x.setAttribute("aria-pressed", String(x === b))); }
      else if (k === "pp") { if (anyPlaying()) pause(); else play(); }
      else if (k === "fb" || k === "ff") { pause(); const d = (k === "ff" ? 1 : -1) / FPS; vids.forEach(v => { v.currentTime = Math.min(Math.max(0, v.currentTime + d), isFinite(v.duration) ? v.duration : v.currentTime + 1); }); }
    });
    seek.addEventListener("input", () => { dragging = true; pause(); const t = parseFloat(seek.value) / 1000 * dur(); vids.forEach(v => { v.currentTime = Math.min(t, isFinite(v.duration) ? v.duration : t); }); tEl.textContent = mmss(t); });
    seek.addEventListener("change", () => { dragging = false; sync(); });
    // the single player has its own native controls: keep the speed in step with them
    if (vids.length === 1) vids[0].addEventListener("ratechange", () => { const r = vids[0].playbackRate; ctl.querySelectorAll('[data-fc="spd"]').forEach(x => x.setAttribute("aria-pressed", String(parseFloat(x.dataset.s) === r))); });
    sync();
  }

  async function share(cl) {
    const ext = /webm/.test(cl.type) ? "webm" : /quicktime/.test(cl.type) ? "mov" : "mp4";
    const file = new File([cl.blob], `${cl.ex.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-${cl.date}.${ext}`, { type: cl.type });
    try { if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: cl.ex }); return; } } catch (e) { if (e && e.name === "AbortError") return; }
    const u = URL.createObjectURL(file), a = document.createElement("a"); a.href = u; a.download = file.name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000);
    A().toast("Saved the clip to your downloads");
  }

  async function clicks(e) {
    const b = e.target.closest("[data-fc]"); if (!b) return; const k = b.dataset.fc;
    if (["spd", "pp", "fb", "ff", "seek", "t", "dur"].includes(k)) return;      // the player handles these itself
    const a = A();
    if (k === "cam" || k === "lib") { const i = b.dataset.i; pick(k === "cam", { name: b.dataset.n || "", ex: i !== "" && a.activeDay ? (a.activeDay.exercises || [])[parseInt(i, 10)] : null }); return; }
    if (k === "bar-rec") {
      let nm = b.dataset.n || ""; const i = b.dataset.i;
      if (!nm) { nm = await askName(a); if (!nm) return; }
      PT.bar.record({ name: nm, ex: i !== "" && a.activeDay ? (a.activeDay.exercises || [])[parseInt(i, 10)] : null }); return;
    }
    if (k === "bar") { const c = byId(S.id); if (c && PT.bar) PT.bar.clipAction(c, b.dataset.v); return; }
    if (k === "home") { S.cmp = false; showHome(); return; }
    if (k === "ex") { S.cmp = false; showEx(b.dataset.n); return; }
    if (k === "cmp") { S.cmp = !S.cmp; showEx(S.name); return; }
    if (k === "play") { showPlay(b.dataset.id); return; }
    if (k === "pick") {
      const id = b.dataset.id, i = S.sel.indexOf(id);
      if (i >= 0) S.sel.splice(i, 1); else if (S.sel.length < 2) S.sel.push(id); else { S.sel.shift(); S.sel.push(id); }
      el.querySelectorAll(".pt-fc-card").forEach(x => x.setAttribute("aria-pressed", String(S.sel.includes(x.dataset.id))));
      const h = el.querySelector("#pt-fc-hint"); if (h) h.textContent = `${S.sel.length} of 2 picked`;
      if (S.sel.length === 2) { const ids = S.sel.slice(); S.cmp = false; setTimeout(() => showCompare(ids), 150); }
      return;
    }
    const cl = byId(S.id);
    if (k === "note" && cl) { const v = await PT.prompt("A note for this clip (optional)", cl.note || ""); if (v === null || v === undefined) return; cl.note = String(v).trim().slice(0, 120); try { await ClipDB.put(cl); } catch (x) { } showPlay(cl.id); return; }
    if (k === "share" && cl) { await share(cl); return; }
    if (k === "del" && cl) {
      if (!await PT.confirm(`Delete this clip of ${cl.ex} from ${when(cl)}? This cannot be undone.`)) return;
      try { await ClipDB.del(cl.id); } catch (x) { }
      cache = cache.filter(c => c.id !== cl.id); refreshCards(); showEx(cl.ex);
    }
  }

  /* ---------------------------------------------------------------- the exercise cards, More sheet and Body card */
  function decorate(a) {
    const list = $("exercises-list") || (a.dom && a.dom.exercisesList); if (!list || !a.activeDay) return;
    list.querySelectorAll("[data-ex-card]").forEach(card => {
      const i = parseInt(card.dataset.exCard, 10), ex = (a.activeDay.exercises || [])[i]; if (!ex) return;
      const old = card.querySelector(".pt-fc-btn"); if (old) old.remove();
      if (ex.type === "tabata" || (a.exKind && a.exKind(ex).cardio)) return;
      const anchor = card.querySelector(".btn-cues"); if (!anchor) return;      // sits beside "Form tips ›"
      const n = loaded ? forEx(ex.name).length : 0;
      const b = document.createElement("button"); b.type = "button"; b.className = "pt-fc-btn shrink-0 text-[11px] font-semibold tap-active px-1 py-0.5"; b.dataset.fcx = String(i);
      b.setAttribute("aria-label", n ? `Form clips for ${ex.name} (${n})` : `Film a form clip of ${ex.name}`); b.title = "Form clips";
      b.innerHTML = `<span aria-hidden="true">🎥</span> Clips${n ? ` (${n})` : ""}`;
      anchor.insertAdjacentElement("afterend", b);
    });
    try { if (PT.bar) PT.bar.decorate(a); } catch (e) { }
  }
  function refreshCards() { try { const a = A(); if (a && !$("view-workout").classList.contains("hidden")) decorate(a); const c = $("pt-fc-card-body"); if (c) c.remove(); addBodyCard(a); } catch (e) { } }
  const oRW = proto.renderWorkoutView;
  proto.renderWorkoutView = function () {
    const r = oRW.apply(this, arguments);
    try {
      decorate(this); if (!loaded) load().then(() => { try { decorate(A()); } catch (e) { } });
      const box = $("pt-wk-actions");
      if (box && !$("pt-clips-open")) { const b = document.createElement("button"); b.type = "button"; b.id = "pt-clips-open"; b.textContent = "Form clips"; box.appendChild(b); }
    } catch (e) { console.error("PulseTrack clips cards", e); }
    return r;
  };
  function addBodyCard(a) {
    const root = $("body-root"); if (!root || !a) return; let card = $("pt-fc-card-body");
    if (card) card.remove();
    const photos = [...root.querySelectorAll("h3")].find(x => /^Progress photos/.test(x.textContent.trim())), after = photos ? photos.closest("div.bg-zinc-900, div") : null;
    card = document.createElement("div"); card.id = "pt-fc-card-body"; card.className = "bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-2";
    const n = cache.length;
    card.innerHTML = `<h3 class="text-xs font-bold text-white">Form clips</h3><p class="text-[11px] leading-relaxed text-zinc-400">${n ? `${n} clip${n === 1 ? "" : "s"} on this phone (${sizeTxt(totalBytes())}).` : "Film a set, then play it back slowed down or next to an older clip."}</p>
      <button type="button" id="pt-fc-open" class="w-full py-2.5 bg-zinc-800 text-zinc-100 text-xs font-bold rounded-xl tap-active">${n ? "Open form clips" : "Film a form clip"}</button>`;
    if (after && after.parentElement === root) after.insertAdjacentElement("afterend", card); else root.appendChild(card);
  }
  const oBody = proto.renderBodyView;
  proto.renderBodyView = function () {
    const r = oBody.apply(this, arguments);
    try { addBodyCard(this); if (!loaded) load().then(() => { try { addBodyCard(A()); } catch (e) { } }); } catch (e) { console.error("PulseTrack clips body card", e); }
    return r;
  };
  document.addEventListener("click", e => {
    const t = e.target && e.target.closest ? e.target : null; if (!t) return; const a = A();
    const x = t.closest(".pt-fc-btn");
    if (x && a && a.activeDay) { const i = parseInt(x.dataset.fcx, 10), ex = (a.activeDay.exercises || [])[i]; if (ex) open({ name: ex.name, ex: i }); return; }
    if (t.closest("#pt-clips-open") || t.closest("#pt-fc-open")) open({});
  });
  load();

  /* ---------------------------------------------------------------- styles */
  const css = document.createElement("style");
  css.id = "pt-v244-clips-css";
  css.textContent = `
    #pt-clips-open { display: none !important; }
    .pt-fc-btn { color: rgb(var(--z400)); }
    .pt-fc-p, .pt-fc-fine { font-size: .75rem; line-height: 1.45; color: rgb(var(--z400)); } .pt-fc-fine { font-size: .66rem; color: rgb(var(--z500)); }
    .pt-fc-rec { display: flex; flex-wrap: wrap; gap: .5rem; } .pt-fc-rec button { flex: 1 1 45%; } .pt-fc-rec .pt-bar-new { flex: 1 1 100%; }
    .pt-fc-cmp { display: flex; align-items: center; gap: .6rem; font-size: .72rem; color: rgb(var(--z400)); }
    .pt-fc-cmpb { padding: .5rem .8rem; border-radius: .7rem; font-size: .75rem; font-weight: 700; background: rgb(var(--z800)); color: rgb(var(--z100)); } .pt-fc-cmpb.on { background: rgb(var(--a600)); color: #fff; }
    .pt-fc-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .55rem; }
    .pt-fc-card { position: relative; display: grid; text-align: left; border-radius: .85rem; overflow: hidden; background: rgb(var(--z950)); border: 2px solid rgb(var(--z800)); }
    .pt-fc-card[aria-pressed="true"] { border-color: rgb(var(--a500)); }
    .pt-fc-card video { width: 100%; aspect-ratio: 3 / 4; object-fit: cover; background: #000; pointer-events: none; }
    .pt-fc-card video.bad { opacity: .25; }
    .pt-fc-d { padding: .4rem .55rem 0; font-size: .7rem; font-weight: 700; color: rgb(var(--z200)); }
    .pt-fc-l { padding: .05rem .55rem 0; font-size: .68rem; font-family: ui-monospace, monospace; color: rgb(var(--a400)); }
    .pt-fc-n { padding: .05rem .55rem .45rem; font-size: .66rem; color: rgb(var(--z400)); } .pt-fc-card > span:last-child { padding-bottom: .45rem; }
    .pt-fc-video { width: 100%; max-height: 52vh; border-radius: .85rem; background: #000; }
    .pt-fc-two { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .5rem; } .pt-fc-two figure { margin: 0; display: grid; gap: .3rem; }
    .pt-fc-two video { max-height: 46vh; width: 100%; object-fit: contain; } .pt-fc-two figcaption { font-size: .68rem; text-align: center; color: rgb(var(--z400)); }
    .pt-fc-video.bad { outline: 2px solid rgb(251 113 133 / .6); }
    .pt-fc-ctl { display: grid; gap: .5rem; }
    .pt-fc-speed { display: flex; gap: .4rem; } .pt-fc-speed button { flex: 1; padding: .5rem; border-radius: .7rem; font-size: .78rem; font-weight: 800; background: rgb(var(--z800)); color: rgb(var(--z100)); }
    .pt-fc-speed button[aria-pressed="true"] { background: rgb(var(--a600)); color: #fff; }
    .pt-fc-step { display: flex; gap: .4rem; } .pt-fc-step button { flex: 1; padding: .6rem .4rem; border-radius: .7rem; font-size: .75rem; font-weight: 700; background: rgb(var(--z800)); color: rgb(var(--z100)); }
    .pt-fc-step .pt-fc-pp { flex: 1.4; background: rgb(var(--a600)); color: #fff; font-weight: 800; }
    .pt-fc-ctl input[type=range] { width: 100%; accent-color: rgb(var(--a500)); }
    .pt-fc-time { display: flex; justify-content: space-between; font-size: .68rem; font-family: ui-monospace, monospace; color: rgb(var(--z500)); }
    .pt-fc-note { font-size: .78rem; color: rgb(var(--z200)); } .pt-fc-note.empty { color: rgb(var(--z500)); }
    .pt-fc-acts { display: flex; gap: .5rem; } .pt-fc-acts button { flex: 1; } .pt-st-b.danger { color: rgb(251 113 133); }
    html[data-mode="light"] .pt-fc-l { color: rgb(var(--a600)); }
  `;
  document.head.appendChild(css);
})();
  