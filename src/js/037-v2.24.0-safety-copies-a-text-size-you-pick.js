
/* =====================================================================
 * PulseTrack 2.24.0: safety copies, a text size you pick, and a few tidy-ups.
 *  - Automatic safety copies: once a day (when you open the app) a copy of everything is kept on the phone. The newest 8 are kept.
 *    Settings > Data & Backup lists them and can put any one back (a copy of how things are now is saved first).
 *  - Text size: Normal, Large or Extra large (Settings > Workout screen).
 *  - Progress: the Plateau check card folds to one line when nothing is stuck.
 *  - Header: the plate calculator icon steps aside while the workout timer shows, so page titles are not cut off.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  const proto = ApplicationUI.prototype;
  const A = () => window.app;
  const $ = id => document.getElementById(id);
  const esc = s => PT.esc(s);

  /* ------------------------------------------------------------------ safety copies (IndexedDB, separate from the app data) */
  const DB = "pulsetrack-safety", ST = "snaps", KEEP = 8, DAY = 86400000;
  const open = () => new Promise((res, rej) => {
    try {
      if (!window.indexedDB) return rej(new Error("no idb"));
      const r = indexedDB.open(DB, 1);
      r.onupgradeneeded = () => { r.result.createObjectStore(ST, { keyPath: "id" }); };
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    } catch (e) { rej(e); }
  });
  const run = (mode, fn) => open().then(db => new Promise((res, rej) => {
    const t = db.transaction(ST, mode), s = t.objectStore(ST); let out;
    try { out = fn(s); } catch (e) { db.close(); return rej(e); }
    t.oncomplete = () => { db.close(); res(out && "result" in out ? out.result : undefined); };
    t.onerror = t.onabort = () => { db.close(); rej(t.error); };
  }));
  const getAll = () => run("readonly", s => s.getAll());
  const getOne = id => run("readonly", s => s.get(id));
  const put = rec => run("readwrite", s => s.put(rec));
  const del = id => run("readwrite", s => s.delete(id));
  const SKIP = () => ["pulsetrack_cardio_timer_v1", "pulsetrack_cleanup_undo_v1", typeof STORAGE_KEY_SESSION_START !== "undefined" ? STORAGE_KEY_SESSION_START : ""];
  const keysNow = () => {
    const out = {}, skip = SKIP();
    for (let i = 0; i < PTLS.length; i++) { const k = PTLS.key(i); if (k && k.startsWith("pulsetrack_") && !skip.includes(k)) out[k] = PTLS.getItem(k); }
    return out;
  };
  async function take(reason, force) {
    const a = A(); if (!a) return null;
    if (!force && !(a.sessions || []).length) return null;
    const keys = keysNow(), size = Object.values(keys).reduce((n, v) => n + (v ? v.length : 0), 0);
    if (size > 40e6) return null;
    const rec = { id: String(Date.now()), ts: Date.now(), reason, version: typeof APP_VERSION !== "undefined" ? APP_VERSION : "", workouts: (a.sessions || []).length, size, keys };
    await put(rec);
    const all = (await getAll()).sort((x, y) => y.ts - x.ts);
    for (const old of all.slice(KEEP)) await del(old.id);
    return rec;
  }
  PT.safety = { take, list: async () => (await getAll()).sort((x, y) => y.ts - x.ts), restore: restoreCopy };

  async function restoreCopy(id) {
    const a = A(); const snap = await getOne(id); if (!snap) return;
    const when = new Date(snap.ts).toLocaleString();
    if (!await PT.confirm(`Go back to the copy from ${when}?\n\nThis REPLACES everything on this phone with that copy (${snap.workouts} workout${snap.workouts === 1 ? "" : "s"}). A copy of how things are right now is saved first, so you can undo this.`)) return;
    await take("before going back", true);
    const skip = SKIP(), old = [];
    for (let i = 0; i < PTLS.length; i++) { const k = PTLS.key(i); if (k && k.startsWith("pulsetrack_") && !skip.includes(k)) old.push(k); }
    old.forEach(k => PTLS.removeItem(k));
    let failed = 0;
    Object.entries(snap.keys || {}).forEach(([k, v]) => { if (typeof v === "string" && !safeSetItem(k, v)) failed++; });
    await PT.alert(failed ? `Restored with ${failed} item(s) that did not fit.` : "Done. The app will reload.");
    location.reload();
  }

  const fmt = ts => { const d = new Date(ts), t = new Date(); const same = d.toDateString() === t.toDateString(); const y = new Date(t - DAY).toDateString() === d.toDateString();
    return (same ? "Today" : y ? "Yesterday" : d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })) + ", " + d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }); };
  async function drawSafety() {
    const box = $("pt-safety"); if (!box) return;
    let list = [];
    try { list = await PT.safety.list(); } catch (e) { $("pt-safety-sum").textContent = "Not available in this browser."; return; }
    $("pt-safety-sum").textContent = list.length ? `${list.length} cop${list.length === 1 ? "y" : "ies"} kept on this phone. Newest: ${fmt(list[0].ts)}.` : "None yet. The first one is made the next time you open the app after a workout.";
    $("pt-safety-list").innerHTML = list.map(s => `<div class="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2">
        <div class="min-w-0 flex-1"><span class="block text-xs font-semibold text-zinc-100">${esc(fmt(s.ts))}</span><span class="block text-[10px] text-zinc-500">${s.workouts} workout${s.workouts === 1 ? "" : "s"} · ${esc(s.reason)} · v${esc(s.version)}</span></div>
        <button type="button" data-restore="${esc(s.id)}" class="shrink-0 px-3 py-2 rounded-lg bg-zinc-800 text-xs font-bold text-zinc-200 tap-active">Restore</button></div>`).join("");
  }
  function ensureSafety() {
    if ($("pt-safety")) return;
    const st = $("backup-status"); if (!st) return;
    const el = document.createElement("div");
    el.id = "pt-safety"; el.className = "mt-3 space-y-2 border-t border-zinc-800 pt-3";
    el.innerHTML = `<div class="flex items-start justify-between gap-2"><div class="min-w-0"><span class="text-xs font-bold text-white block">Automatic safety copies</span><span id="pt-safety-sum" class="text-[11px] text-zinc-400 block mt-0.5"></span></div>
      <button type="button" id="pt-safety-now" class="shrink-0 px-3 py-2 rounded-lg bg-zinc-800 text-xs font-bold text-zinc-200 tap-active">Make one now</button></div>
      <details class="rounded-xl"><summary class="text-[11px] font-semibold text-zinc-400 cursor-pointer py-1">See the copies</summary><div id="pt-safety-list" class="space-y-1.5 mt-1.5"></div></details>
      <p class="text-[10px] text-zinc-500 leading-snug">These stay on this phone, so they protect against a mistake or a bad update. They do not replace a backup file: clearing the browser's data removes them too.</p>`;
    st.insertAdjacentElement("afterend", el);
  }
  document.addEventListener("click", async e => {
    if (!e.target.closest) return;
    if (e.target.closest("#pt-safety-now")) { const r = await take("made by you", true).catch(() => null); A().toast(r ? "Safety copy saved." : "Could not save a copy here."); drawSafety(); return; }
    const b = e.target.closest("[data-restore]"); if (b) restoreCopy(b.dataset.restore).catch(err => console.error("PulseTrack restore", err));
  });

  const oExtras = proto.renderSettingsExtras;
  proto.renderSettingsExtras = async function () {
    const r = oExtras ? await oExtras.apply(this, arguments) : undefined;
    try { ensureSafety(); drawSafety(); ensureTextSize(); } catch (e) { console.error("PulseTrack settings 2.24", e); }
    return r;
  };

  async function daily() {
    try {
      const a = A(); if (!a || !(a.sessions || []).length) return;
      const list = await PT.safety.list();
      if (!list.length || Date.now() - list[0].ts > 20 * 3600 * 1000) await take("daily");
    } catch (e) { /* no storage for copies: nothing to do */ }
  }
  setTimeout(daily, 6000);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") setTimeout(daily, 3000); });

  /* ------------------------------------------------------------------ text size */
  const SIZES = ["", "112.5%", "125%"], NAMES = ["Normal", "Large", "Extra large"];
  const scale = s => (s && s.textScale !== undefined) ? Math.max(0, Math.min(2, parseInt(s.textScale, 10) || 0)) : (s && s.largeText ? 1 : 0);
  proto.applyTextSize = function () { document.documentElement.style.fontSize = SIZES[scale(this.settings)]; };
  function ensureTextSize() {
    const inp = $("setting-toggle-largetext"); if (!inp) return;
    const label = inp.closest("label"), row = label && label.parentElement;
    if (row && !$("pt-textsize")) {
      label.style.display = "none";
      const t = row.querySelector(".text-xs.font-bold"); if (t) t.textContent = "Text size";
      const d = row.querySelector(".text-\\[11px\\]"); if (d) d.textContent = "Bigger text and buttons for easier reading mid-set.";
      const seg = document.createElement("div");
      seg.id = "pt-textsize"; seg.className = "grid grid-cols-3 gap-1.5 mt-2"; seg.setAttribute("role", "group"); seg.setAttribute("aria-label", "Text size");
      row.insertAdjacentElement("afterend", seg);
    }
    const seg = $("pt-textsize"); if (!seg) return;
    const cur = scale(A().settings);
    seg.innerHTML = NAMES.map((n, i) => `<button type="button" data-ts="${i}" aria-pressed="${cur === i}" class="py-2 rounded-lg text-xs font-bold tap-active ${cur === i ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-400"}">${n}</button>`).join("");
  }
  document.addEventListener("click", e => {
    const b = e.target.closest && e.target.closest("#pt-textsize [data-ts]"); const a = A(); if (!b || !a) return;
    const v = parseInt(b.dataset.ts, 10);
    a.settings.textScale = v; a.settings.largeText = v > 0;
    WorkoutStorage.saveSettings(a.settings); a.applyTextSize(); ensureTextSize();
  });
  try { const a = A(); if (a && a.applyTextSize) a.applyTextSize(); } catch (e) { }
  setTimeout(() => { try { A().applyTextSize(); } catch (e) { } }, 0);

  /* ------------------------------------------------------------------ Progress: Plateau check folds when nothing is stuck */
  const oPlat = proto.plateauCardHtml;
  if (typeof oPlat === "function") {
    proto.plateauCardHtml = function (stalled) {
      const html = oPlat.apply(this, arguments);
      try { if (!(stalled || []).some(n => PT.plateau(n))) return `<details class="pt-pcfold"><summary>Plateau check<span> · nothing is stuck</span></summary>${html}</details>`; } catch (e) { }
      return html;
    };
  }

  const css = document.createElement("style");
  css.id = "pt-v224-css";
  css.textContent = `
    .pt-pcfold { border: 1px solid rgb(var(--z800)); background: rgb(var(--z900)); border-radius: 1rem; padding: 0 1rem; }
    .pt-pcfold > summary { list-style: none; cursor: pointer; padding: .8rem 0; font-size: .75rem; font-weight: 700; color: rgb(var(--z50)); }
    .pt-pcfold > summary::-webkit-details-marker { display: none; }
    .pt-pcfold > summary span { font-weight: 500; color: rgb(var(--z400)); }
    .pt-pcfold > summary::after { content: "›"; float: right; color: rgb(var(--z500)); font-size: 1rem; line-height: 1; }
    .pt-pcfold[open] > summary::after { content: "⌄"; }
    .pt-pcfold #pt-plateau-card { border: 0; background: none; padding: 0 0 1rem; }
    body:has(#session-stopwatch-badge:not(.hidden)):not(:has(#view-workout:not(.hidden))) #btn-header-plate-calc { display: none; }
    #home-week .pt-wd.pt-future .pt-wn { color: rgb(var(--z500)); }
  `;
  document.head.appendChild(css);
})();
  