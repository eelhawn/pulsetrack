/* =====================================================================
 * PulseTrack 3.5.0: step by step, with pictures and arrows.
 *  - An exercise's sheet has "Step by step": one step at a time (Back / Next, "Step 2 of 3"), each with a picture, the movement
 *    arrows drawn over it, and the step's words.
 *  - Pictures: PulseTrack's own line drawings for the exercises in exercise-guides.js (img/ex/*.svg, made by
 *    tools/make_guide_drawings.py), a photo you take, or a placeholder ("No picture yet"). Under every picture it says whose it is
 *    and its licence. Every step has "Add my photo" (or "Change" / "Remove"). No picture is ever downloaded from anywhere else.
 *  - Exercises without a guide still get their steps (their form tips), each with a placeholder and "Add my photo".
 *  - Arrows are data (exercise-guides.js: from and to as fractions of the picture, and a label), drawn over the picture, never baked
 *    into it. "Move arrows" lets you drag their ends to fit your own photo; "Reset arrows" puts them back.
 *  - What you add is kept on this phone and laid over the built-in guide (settings.exGuideLocal[name].photos / .arrows), so an update
 *    never overwrites it. Photos live in their own IndexedDB ("pulsetrack-guide-photos"), like form clips: not in the backup file
 *    (too big), and "Reset everything" removes them.
 *  - The built-in drawings are fetched once while online so the offline copy has them too.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined" || !PT.exGuide) return;
  const proto = ApplicationUI.prototype, A = () => window.app, esc = s => PT.esc(s), $ = id => document.getElementById(id);
  const VW = 320, VH = 240;   // every picture is shown 4:3; arrows are fractions of that box

  /* ================================================================ photo storage */
  const GDB = {
    _db: null,
    open() {
      return new Promise((res, rej) => {
        if (this._db) return res(this._db);
        if (!("indexedDB" in window)) return rej(new Error("This browser can't store photos."));
        const r = indexedDB.open("pulsetrack-guide-photos", 1);
        r.onupgradeneeded = () => { if (!r.result.objectStoreNames.contains("photos")) r.result.createObjectStore("photos", { keyPath: "id" }); };
        r.onsuccess = () => { this._db = r.result; res(this._db); };
        r.onerror = () => rej(r.error);
      });
    },
    async _tx(mode, fn) {
      const db = await this.open();
      return new Promise((res, rej) => { const tx = db.transaction("photos", mode), st = tx.objectStore("photos"); let out; const q = fn(st); if (q) q.onsuccess = () => { out = q.result; }; tx.oncomplete = () => res(out); tx.onerror = () => rej(tx.error); tx.onabort = () => rej(tx.error); });
    },
    get(id) { return this._tx("readonly", s => s.get(id)); },
    put(rec) { return this._tx("readwrite", s => s.put(rec)); },
    del(id) { return this._tx("readwrite", s => s.delete(id)); },
    clear() { return this._tx("readwrite", s => s.clear()); }
  };
  try {   // "Reset everything" clears progress photos and clips; the guide photos go with them
    if (typeof PhotoDB !== "undefined" && PhotoDB && typeof PhotoDB.clear === "function") {
      const oClear = PhotoDB.clear;
      PhotoDB.clear = function () { return Promise.all([oClear.apply(this, arguments), GDB.clear().catch(() => { })]).then(() => undefined); };
    }
  } catch (e) { }
  function shrink(file, max = 1280) {
    return new Promise((res, rej) => {
      const url = URL.createObjectURL(file), img = new Image();
      img.onload = () => {
        try {
          const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight)), c = document.createElement("canvas");
          c.width = Math.max(1, Math.round(img.naturalWidth * k)); c.height = Math.max(1, Math.round(img.naturalHeight * k));
          c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
          c.toBlob(b => b ? res(b) : rej(new Error("Couldn't save that photo.")), "image/jpeg", .82);
        } catch (er) { URL.revokeObjectURL(url); rej(er); }
      };
      img.onerror = () => { URL.revokeObjectURL(url); rej(new Error("Couldn't read that picture.")); };
      img.src = url;
    });
  }

  /* ================================================================ the steps of an exercise: guide + this phone */
  function stepsOf(name) {
    const g = PT.exGuide(name) || {}, l = g.local || {};
    let e = null; try { e = (PT.exCanon && PT.exCanon(name)) || null; } catch (er) { }
    const own = (g.steps || []).length;
    let base = own ? g.steps : ((e && Array.isArray(e.tips) ? e.tips : []).map(t => ({ text: t })));
    // 3.8.0: no pictures of its own: the app draws the movement (module 137), the start or finish pose for each step
    if (!own && PT.figure) { try { const drawn = PT.figure.forSteps(name, base); if (drawn) base = drawn; } catch (er) { console.warn("PulseTrack drawing", er); } }
    return base.map((st, i) => ({
      text: st.text, image: st.image || null, builtArrows: st.arrows || [],
      arrows: (l.arrows && Array.isArray(l.arrows[i])) ? l.arrows[i] : (st.arrows || []), moved: !!(l.arrows && l.arrows[i]),
      photo: l.photos && l.photos[i] ? l.photos[i] : null
    }));
  }

  /* ================================================================ drawing one step */
  let V = null;   // the open viewer: { name, i, steps, edit, url }
  // 3.13.0: a drawn exercise plays its move (Start to Halfway and back, module 137 motion()); Pause shows the step's picture with its
  // arrows. Kept per phone (localStorage "pt-sv-play"); off to start with when the phone asks for less motion.
  let PLAY = (() => { try { const v = localStorage.getItem("pt-sv-play"); if (v === "1" || v === "0") return v === "1"; } catch (e) { }
    try { return !matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return true; } })();
  let anim = 0;   // the running loop (a token: a new one stops the old)
  // 3.19.0: every exercise plays (PT.figure.demo): a move, a cycle (running, bikes ...), or a hold with its seconds counting; also the
  // exercises with their own pictures (the drawn figure plays, Pause shows their pictures). Your own photo of a step never plays.
  const movesOf = st => st && !st.photo && PT.figure && PT.figure.demo ? PT.figure.demo(V.name) : null;
  function loop(d) {
    const me = ++anim, frames = d.frames, seq = d.seq, t0 = Date.now();
    let k = 0;
    const tick = () => {
      if (me !== anim) return;
      const im = $("pt-sv-anim"); if (!im) return;
      const [f, ms] = seq[k % seq.length]; if (im.getAttribute("src") !== frames[f]) im.src = frames[f]; k++;
      const h = $("pt-sv-hold"); if (h) { const s = Math.floor((Date.now() - t0) / 1000) % 31; h.textContent = `Hold · 0:${String(s).padStart(2, "0")}`; }
      setTimeout(tick, ms);
    };
    tick();
  }
  const pct = v => Math.round(v * 1000) / 1000;
  function arrowsSvg(arrows, edit) {
    const col = PT.muscleFill ? PT.muscleFill(100) : "rgb(52 211 153)";
    const parts = arrows.map((a, k) => {
      const x1 = a.from[0] * VW, y1 = a.from[1] * VH, x2 = a.to[0] * VW, y2 = a.to[1] * VH;
      const ang = Math.atan2(y2 - y1, x2 - x1), hx = x2 - 13 * Math.cos(ang), hy = y2 - 13 * Math.sin(ang);
      const head = `M${x2} ${y2} L${hx - 7 * Math.sin(ang)} ${hy + 7 * Math.cos(ang)} L${hx + 7 * Math.sin(ang)} ${hy - 7 * Math.cos(ang)} Z`;
      // the label never covers the arrow
      const ux = Math.cos(ang), uy = Math.sin(ang), side = Math.abs(ux) > Math.abs(uy);
      const anchor = "middle";   // across: above the middle of the arrow; up or down: just past its tail
      const lx = Math.max(34, Math.min(VW - 34, side ? (x1 + x2) / 2 : x1)), ly = Math.max(14, Math.min(VH - 6, side ? Math.min(y1, y2) - 10 : (uy > 0 ? y1 - 7 : y1 + 18)));
      return `<g class="pt-sv-a" data-a="${k}">
        <line x1="${x1}" y1="${y1}" x2="${hx}" y2="${hy}" stroke="#09090b" stroke-width="9" stroke-linecap="round"/>
        <path d="${head}" fill="#09090b" stroke="#09090b" stroke-width="5" stroke-linejoin="round"/>
        <line x1="${x1}" y1="${y1}" x2="${hx}" y2="${hy}" stroke="${col}" stroke-width="5" stroke-linecap="round"/>
        <path d="${head}" fill="${col}"/>
        ${a.label ? `<text x="${lx}" y="${ly}" text-anchor="${anchor}" font-size="14" font-weight="800" fill="#fff" stroke="#09090b" stroke-width="4" paint-order="stroke">${esc(a.label)}</text>` : ""}
        ${edit ? `<circle class="pt-sv-h" data-a="${k}" data-end="from" cx="${x1}" cy="${y1}" r="11"/><circle class="pt-sv-h" data-a="${k}" data-end="to" cx="${x2}" cy="${y2}" r="11"/>` : ""}
      </g>`;
    }).join("");
    return `<svg class="pt-sv-ov" viewBox="0 0 ${VW} ${VH}" preserveAspectRatio="none" aria-hidden="true">${parts}</svg>`;
  }
  function credit(st) {
    if (st.photo) return "Your photo · kept on this phone";
    if (!st.image) return "";
    const im = st.image, lic = { original: "original drawing", "public-domain": "public domain", "own-photo": "own photo" }[im.license] || im.license;
    if (im.generated) return `Drawing: PulseTrack, ${lic} made by the app for this kind of movement (${im.movement})`;
    return `${im.author === "PulseTrack" ? "Drawing: PulseTrack" : "By " + im.author}, ${lic}${im.attribution && im.author !== "PulseTrack" ? " · " + im.attribution : ""}`;
  }
  function stepHtml() {
    const st = V.steps[V.i], n = V.steps.length, moves = V.edit ? null : movesOf(st), playing = !!(moves && PLAY);
    let pic;
    if (st.photo && V.url) pic = `<img class="pt-sv-img pt-sv-photo" src="${V.url}" alt="Your photo of step ${V.i + 1}">`;
    else if (playing) pic = `<img class="pt-sv-img" id="pt-sv-anim" src="${moves.frames[0]}" alt="${moves.kind === "hold" ? "The position to hold" : moves.kind === "cycle" ? "The movement, playing over and over" : "The whole move, playing: from the start to halfway and back"}">${moves.kind === "hold" ? '<span class="pt-sv-hold" id="pt-sv-hold" aria-hidden="true">Hold · 0:00</span>' : ""}`;
    else if (st.image) pic = `<img class="pt-sv-img" src="${esc(st.image.src)}" alt="${esc(st.image.alt || "Step " + (V.i + 1))}" data-fallback="1">`;
    else pic = `<div class="pt-sv-ph"><span>No picture yet</span></div>`;
    const showArrows = !playing && st.arrows.length && (st.image || st.photo);
    const playBtn = moves ? `<button type="button" class="pt-sv-play tap-active" data-sv="play" aria-pressed="${playing}" aria-label="${playing ? "Pause the move" : "Play the move"}">${playing
      ? '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3.5" y="3" width="3" height="10" rx="1"/><rect x="9.5" y="3" width="3" height="10" rx="1"/></svg>Pause'
      : '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 2.8v10.4L13 8z"/></svg>Play the move'}</button>` : "";
    return `<div class="pt-sv-box" id="pt-sv-box">${pic}${showArrows ? arrowsSvg(st.arrows, V.edit) : ""}${playBtn}</div>
      ${(() => { const cr = playing && st.image && !st.image.generated ? "Moving drawing: PulseTrack, made by the app for this kind of movement. Pause for the step's own picture." : credit(st); return cr ? `<p class="pt-sv-cr">${esc(cr)}</p>` : ""; })()}
      <p class="pt-sv-n">Step ${V.i + 1} of ${n}</p>
      <p class="pt-sv-t">${esc(st.text)}</p>
      <div class="pt-sv-row">
        <label class="pt-sv-btn tap-active" for="pt-sv-file">${st.photo ? "Change my photo" : "Add my photo"}</label>
        <input id="pt-sv-file" type="file" accept="image/*" capture="environment" class="pt-sv-file">
        ${st.photo ? `<button type="button" class="pt-sv-btn tap-active" data-sv="rmphoto">Remove my photo</button>` : ""}
        ${st.arrows.length && (st.image || st.photo) ? `<button type="button" class="pt-sv-btn tap-active" data-sv="edit" aria-pressed="${V.edit}">${V.edit ? "Done moving" : "Move arrows"}</button>` : ""}
        ${st.moved ? `<button type="button" class="pt-sv-btn tap-active" data-sv="resetarrows">Reset arrows</button>` : ""}
      </div>
      ${V.edit ? `<p class="pt-sv-cr">Drag the round ends of each arrow. Your arrows are kept on this phone.</p>` : ""}
      ${n > 1 ? `<div class="pt-sv-nav"><button type="button" class="pt-sv-go tap-active" data-sv="prev" ${V.i ? "" : "disabled"}>Back</button>
        <span class="pt-sv-dots" aria-hidden="true">${V.steps.map((x, k) => `<i class="${k === V.i ? "on" : ""}"></i>`).join("")}</span>
        <button type="button" class="pt-sv-go tap-active" data-sv="next" ${V.i < n - 1 ? "" : "disabled"}>Next</button></div>` : ""}`;
  }
  async function draw() {
    const box = $("pt-sv"); if (!box || !V) return;
    V.steps = stepsOf(V.name);
    const st = V.steps[V.i];
    if (V.url) { URL.revokeObjectURL(V.url); V.url = null; }
    if (st && st.photo) { try { const r = await GDB.get(st.photo); if (r && r.blob) V.url = URL.createObjectURL(r.blob); } catch (e) { } }
    if (!$("pt-sv")) return;
    anim++;
    box.innerHTML = stepHtml();
    const moves = PLAY && !V.edit ? movesOf(st) : null;
    if (moves && $("pt-sv-anim")) loop(moves);
    const im = box.querySelector("img[data-fallback]");
    if (im) im.addEventListener("error", () => { const b = $("pt-sv-box"); if (b) b.innerHTML = `<div class="pt-sv-ph"><span>Picture not saved on this phone yet. It shows next time you're online.</span></div>`; }, { once: true });
  }

  function sectionHtml(name) {
    const steps = stepsOf(name); if (!steps.length) return "";
    const pics = steps.filter(s => s.image || s.photo).length;
    return `<details id="ex-steps" class="pt-mw pt-sv-sec" ${pics ? "open" : ""}><summary><span class="pt-mw-h">Step by step</span><span class="pt-mw-s">${steps.length} step${steps.length === 1 ? "" : "s"}${pics ? "" : " · no pictures yet"}</span><span class="pt-chev">›</span></summary>
      <div class="pt-mw-b"><div id="pt-sv" class="pt-sv" data-name="${esc(name)}"></div></div></details>`;
  }

  const oEx = proto.openExerciseSheet;
  proto.openExerciseSheet = function (name) {
    const r = oEx.apply(this, arguments);
    try {
      const body = $("sheet-body"); if (!body || $("ex-steps")) return r;
      const html = sectionHtml(name); if (!html) return r;
      const anchor = $("ex-muscles") || body.querySelector(".pt-cues");
      if (anchor) anchor.insertAdjacentHTML(anchor.id === "ex-muscles" ? "beforebegin" : "afterend", html); else body.insertAdjacentHTML("afterbegin", html);
      if (V && V.url) URL.revokeObjectURL(V.url);
      V = { name, i: 0, steps: [], edit: false, url: null };
      draw();
    } catch (e) { console.error("PulseTrack steps", e); }
    return r;
  };

  /* ================================================================ taps, photos and dragging arrows */
  const local = name => { const g = PT.exGuide(name); return (g && g.local) || {}; };
  document.addEventListener("click", async e => {
    const b = e.target.closest && e.target.closest("#pt-sv [data-sv]"); if (!b || !V) return;
    const k = b.dataset.sv, a = A();
    if (k === "prev" && V.i > 0) { V.i--; V.edit = false; draw(); }
    else if (k === "next" && V.i < V.steps.length - 1) { V.i++; V.edit = false; draw(); }
    else if (k === "edit") { V.edit = !V.edit; draw(); }
    else if (k === "play") { PLAY = !PLAY; try { localStorage.setItem("pt-sv-play", PLAY ? "1" : "0"); } catch (er) { } await draw(); const nb = document.querySelector("#pt-sv [data-sv=play]"); if (nb) nb.focus({ preventScroll: true }); }
    else if (k === "resetarrows") {
      const ar = Object.assign({}, local(V.name).arrows || {}); delete ar[V.i];
      PT.exGuideLocal(V.name, { arrows: Object.keys(ar).length ? ar : null }); V.edit = false; draw(); if (a) a.toast("Arrows put back");
    } else if (k === "rmphoto") {
      const ph = Object.assign({}, local(V.name).photos || {}), id = ph[V.i]; delete ph[V.i];
      PT.exGuideLocal(V.name, { photos: Object.keys(ph).length ? ph : null });
      try { if (id) await GDB.del(id); } catch (er) { }
      draw(); if (a) a.toast("Photo removed");
    }
  });
  document.addEventListener("change", async e => {
    if (!e.target || e.target.id !== "pt-sv-file" || !V) return;
    const f = e.target.files && e.target.files[0]; if (!f) return;
    const a = A(), name = V.name, i = V.i;
    try {
      const blob = await shrink(f), id = "g" + PT.uid();
      await GDB.put({ id, name, step: i, ts: Date.now(), blob, license: "own-photo", author: "you" });
      const ph = Object.assign({}, local(name).photos || {}), old = ph[i]; ph[i] = id;
      PT.exGuideLocal(name, { photos: ph });
      if (old) GDB.del(old).catch(() => { });
      if (V && V.name === name) { V.i = i; draw(); }
      if (a) a.toast("Photo added to step " + (i + 1));
    } catch (er) { if (a) a.toast(er.message || "Couldn't add that photo"); }
    e.target.value = "";
  });
  let drag = null;
  document.addEventListener("pointerdown", e => {
    const h = e.target.closest && e.target.closest("#pt-sv .pt-sv-h"); if (!h || !V || !V.edit) return;
    e.preventDefault();
    const svg = h.ownerSVGElement; drag = { k: +h.dataset.a, end: h.dataset.end, svg, arrows: JSON.parse(JSON.stringify(V.steps[V.i].arrows)) };
    try { h.setPointerCapture(e.pointerId); } catch (er) { }
  });
  document.addEventListener("pointermove", e => {
    if (!drag) return;
    const r = drag.svg.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)), y = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height));
    drag.arrows[drag.k][drag.end] = [pct(x), pct(y)];
    V.steps[V.i].arrows = drag.arrows;
    const box = $("pt-sv-box"), ov = box && box.querySelector(".pt-sv-ov");
    if (ov) ov.outerHTML = arrowsSvg(drag.arrows, true);
    drag.svg = $("pt-sv-box").querySelector(".pt-sv-ov");
  });
  const endDrag = () => {
    if (!drag || !V) { drag = null; return; }
    const ar = Object.assign({}, local(V.name).arrows || {}); ar[V.i] = drag.arrows;
    PT.exGuideLocal(V.name, { arrows: ar }); drag = null; draw();
  };
  document.addEventListener("pointerup", endDrag);
  document.addEventListener("pointercancel", endDrag);

  /* ================================================================ the drawings, saved for offline once */
  function prefetch() {
    try {
      if (!navigator.onLine || !navigator.serviceWorker || !navigator.serviceWorker.controller) return;
      const G = (typeof EXERCISE_GUIDES !== "undefined" && EXERCISE_GUIDES) || {}, src = new Set();
      Object.values(G).forEach(g => (g.steps || []).forEach(s => { if (s.image && s.image.src && !/^photo:/.test(s.image.src)) src.add(s.image.src); }));
      const key = "pt-guide-pics", sig = [...src].sort().join("|");
      let had = ""; try { had = sessionStorage.getItem(key) || ""; } catch (er) { }
      if (had === sig) return;
      Promise.all([...src].map(u => fetch(u).catch(() => null))).then(() => { try { sessionStorage.setItem(key, sig); } catch (er) { } });
    } catch (e) { }
  }
  window.addEventListener("load", () => setTimeout(prefetch, 4000));
  PT.guideSteps = { stepsOf, prefetch, db: GDB, shrink, playing: () => PLAY, setPlay: v => { PLAY = !!v; } };   // 3.10.0: shrink is used by the equipment photos (module 138)

  const css = document.createElement("style"); css.id = "pt-v350-css";
  css.textContent = `
    .pt-sv { display: flex; flex-direction: column; gap: .5rem; }
    .pt-sv-box { position: relative; width: 100%; aspect-ratio: 4 / 3; border-radius: .75rem; overflow: hidden; background: #18181b; touch-action: none; }
    .pt-sv-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
    .pt-sv-play { position: absolute; top: .5rem; right: .5rem; z-index: 2; display: inline-flex; align-items: center; gap: .35rem; min-height: 2.25rem; padding: 0 .8rem .0 .65rem;
      border-radius: 999px; background: rgb(24 24 27 / .88); border: 1px solid rgb(63 63 70); color: #f4f4f5; font-size: .75rem; font-weight: 700; }
    .pt-sv-play svg { width: .85rem; height: .85rem; fill: currentColor; }
    .pt-sv-hold { position: absolute; left: .5rem; top: .5rem; z-index: 2; padding: .35rem .7rem; border-radius: 999px; background: rgb(24 24 27 / .88); border: 1px solid rgb(16 185 129 / .6); color: #f4f4f5; font-size: .8125rem; font-weight: 800; font-variant-numeric: tabular-nums; }
    .pt-sv-play:focus-visible { outline: 2px solid rgb(var(--a500)); outline-offset: 2px; }
    .pt-sv-ov { position: absolute; inset: 0; width: 100%; height: 100%; }
    .pt-sv-h { fill: rgb(255 255 255 / .9); stroke: #09090b; stroke-width: 3; cursor: grab; }
    .pt-sv-ph { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; text-align: center; padding: 1rem; border: 2px dashed #3f3f46; border-radius: .75rem; color: #a1a1aa; font-size: .8rem; font-weight: 600; }
    .pt-sv-cr { font-size: .68rem; color: rgb(var(--z400)); margin: 0; }
    .pt-sv-n { font-size: .7rem; font-weight: 700; color: rgb(var(--z400)); margin: .15rem 0 0; }
    .pt-sv-t { font-size: .85rem; line-height: 1.45; color: rgb(var(--z100)); margin: 0; }
    .pt-sv-row { display: flex; flex-wrap: wrap; gap: .4rem; }
    .pt-sv-btn { padding: .45rem .75rem; border-radius: .65rem; background: rgb(var(--z800)); color: rgb(var(--z100)); font-size: .75rem; font-weight: 700; cursor: pointer; }
    .pt-sv-btn[aria-pressed="true"] { background: rgb(var(--a600)); color: #fff; }
    .pt-sv-file { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }
    .pt-sv-nav { display: flex; align-items: center; justify-content: space-between; gap: .5rem; margin-top: .15rem; }
    .pt-sv-go { min-width: 5rem; padding: .55rem .9rem; border-radius: .7rem; background: rgb(var(--z800)); color: rgb(var(--z100)); font-size: .8rem; font-weight: 800; }
    .pt-sv-go:disabled { opacity: .35; }
    .pt-sv-dots { display: flex; gap: .3rem; }
    .pt-sv-dots i { width: .45rem; height: .45rem; border-radius: 999px; background: rgb(var(--z700)); }
    .pt-sv-dots i.on { background: rgb(var(--a500)); }
  `;
  document.head.appendChild(css);
})();
