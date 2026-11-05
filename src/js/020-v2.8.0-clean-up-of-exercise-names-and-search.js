
/* =====================================================================
 * PulseTrack 2.8.0 (part 3): clean-up of exercise names, and search.
 *  - Clean Up Exercise Names: programs use ~220 other spellings ("Barbell Bench Press"). One tap renames
 *    them to the standard name and merges history, PRs, notes and last-time weights. Undo keeps a copy.
 *  - Search: one box that looks through exercises, programs, finished workouts, notes and cardio.
 * ===================================================================== */
(function () {
  "use strict";
  const proto = ApplicationUI.prototype;
  const A = () => window.app;
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const clone = o => JSON.parse(JSON.stringify(o));
  const save = a => WorkoutStorage.saveSettings(a.settings);
  const UNDO_KEY = "pulsetrack_cleanup_undo_v1";
  const SNAP_KEYS = [STORAGE_KEY_DATA, STORAGE_KEY_SESSIONS, STORAGE_KEY_PRS, STORAGE_KEY_PRBASE, STORAGE_KEY_LASTPERF, STORAGE_KEY_EXNOTES, STORAGE_KEY_SETTINGS];
  const plural = (n, w, ws) => n + " " + (n === 1 ? w : (ws || w + "s"));

  const css = document.createElement("style");
  css.id = "pt-v28c-css";
  css.textContent = `
    .pt-pc-row { display: flex; align-items: flex-start; gap: .65rem; width: 100%; text-align: left; border-radius: .8rem; border: 1px solid rgb(var(--z800)); background: rgb(var(--z950)); padding: .55rem .7rem; }
    .pt-pc-row[aria-pressed="false"] { opacity: .5; }
    .pt-pc-chk { flex: none; width: 1.15rem; height: 1.15rem; margin-top: .1rem; border-radius: .35rem; border: 1.5px solid rgb(var(--z600)); display: flex; align-items: center; justify-content: center; font-size: .7rem; font-weight: 900; color: transparent; }
    .pt-pc-row[aria-pressed="true"] .pt-pc-chk { background: rgb(var(--a600)); border-color: transparent; color: #fff; }
    .pt-pc-old { display: block; font-size: .68rem; color: rgb(var(--z500)); text-decoration: line-through; overflow-wrap: anywhere; }
    .pt-pc-new { display: block; font-size: .78rem; font-weight: 800; color: rgb(var(--z100)); overflow-wrap: anywhere; }
    .pt-pc-meta { display: block; font-size: .63rem; color: rgb(var(--z500)); margin-top: .1rem; }
    .pt-sbar { display: flex; align-items: center; gap: .6rem; width: 100%; text-align: left; border-radius: 1rem; border: 1px solid rgb(var(--z800)); background: rgb(var(--z900)); padding: .65rem .9rem; color: rgb(var(--z400)); font-size: .78rem; font-weight: 600; }
    .pt-sbar svg { flex: none; width: 1rem; height: 1rem; color: rgb(var(--z500)); }
    .pt-sbar span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .pt-sin { -webkit-appearance: none; appearance: none; width: 100%; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); border-radius: .9rem; padding: .75rem .9rem .75rem 2.4rem; font-size: 1rem; color: rgb(var(--z100)); }
    .pt-sin:focus { outline: none; border-color: rgb(var(--a500)); }
    .pt-sico { position: absolute; left: .8rem; top: 50%; transform: translateY(-50%); width: 1.1rem; height: 1.1rem; color: rgb(var(--z500)); pointer-events: none; }
    .pt-sres { display: block; width: 100%; text-align: left; border-radius: .8rem; border: 1px solid rgb(var(--z800)); background: rgb(var(--z950)); padding: .55rem .75rem; }
    .pt-sres .pt-st { display: block; font-size: .8rem; font-weight: 700; color: rgb(var(--z100)); overflow-wrap: anywhere; }
    .pt-sres .pt-ss { display: block; font-size: .68rem; color: rgb(var(--z400)); margin-top: .1rem; overflow-wrap: anywhere; }
    .pt-sres .pt-sn { display: block; font-size: .7rem; color: rgb(var(--z300)); margin-top: .15rem; overflow-wrap: anywhere; }
    mark.pt-mk { background: rgb(var(--a500) / .28); color: inherit; border-radius: .2rem; padding: 0 .08rem; }
  `;
  document.head.appendChild(css);
  const SEARCH_SVG = '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"/></svg>';

  /* ======================================================================== clean up names */
  /** every spot in the programs that holds an exercise name: cb(holder, key, program) */
  function eachProgName(data, cb) {
    const fix = (e, p) => {
      if (!e || typeof e !== "object") return;
      if (typeof e.name === "string") cb(e, "name", p);
      if (typeof e.origName === "string") cb(e, "origName", p);
    };
    ((data && data.programs) || []).forEach(p => (p && p.days || []).forEach(d => {
      if (!d) return;
      (d.exercises || []).forEach(e => fix(e, p));
      (d.orig || []).forEach(e => fix(e, p));
      (d.removed || []).forEach(r => r && fix(r.ex, p));
    }));
  }

  /** The renamed exercise keeps counting as many dumbbells as the old name did ("Dumbbell Lunges" counts both hands, "Lunges" does not). */
  const nDb = (n, r) => { try { return PT.dbCount(n, r); } catch (e) { return 1; } };
  function keepDb(h, from, to) {
    if (!h || h.dbn) return;
    const x = nDb(from, h.reps), y = nDb(to, h.reps);
    if (x !== y) { h.dbn = x; h.dbnFor = to; }
  }

  /** names that differ from the standard list: { map:{old:new}, rows:[{from,to,progs,sess}] } */
  function scan() {
    const a = A(), seen = new Map();
    const ensure = n => {
      if (typeof n !== "string" || !n.trim()) return null;
      let r = seen.get(n);
      if (!r) {
        let to = null;
        try { const e = PT.exCanon(n); if (e && e.name && e.name !== n) to = e.name; } catch (err) { }
        r = { from: n, to, progs: new Set(), sess: 0 };
        seen.set(n, r);
      }
      return r;
    };
    eachProgName(a.data, (h, k, p) => { const r = ensure(h[k]); if (r && p) r.progs.add(p.id); });
    (a.sessions || []).forEach(s => {
      const here = new Set();
      (s.ex || []).forEach(e => { const r = ensure(e && e.name); if (r && !here.has(r)) { here.add(r); r.sess++; } });
    });
    [a.prBase, a.prs, a.lastPerf, a.exNotes].forEach(o => Object.keys(o || {}).forEach(ensure));
    const rows = [...seen.values()].filter(r => r.to).map(r => ({ from: r.from, to: r.to, progs: r.progs.size, sess: r.sess }));
    rows.sort((x, y) => (y.sess - x.sess) || (y.progs - x.progs) || x.from.localeCompare(y.from));
    const map = {}; rows.forEach(r => { map[r.from] = r.to; });
    return { map, rows };
  }

  function undoInfo() {
    const a = A();
    let raw = null; try { raw = PTLS.getItem(UNDO_KEY); } catch (e) { }
    if (!raw) return null;
    try {
      const s = JSON.parse(raw);
      if (!s || !s.keys) return null;
      // saving a workout since then would be lost by an undo, so it is no longer offered
      if ((a.sessions || []).length !== s.n) return null;
      return s;
    } catch (e) { return null; }
  }

  /** rename everything in the map; returns counts */
  function applyRenames(map) {
    const a = A(), pairs = Object.keys(map);
    const snap = { t: Date.now(), n: (a.sessions || []).length, count: pairs.length, ver: APP_VERSION, keys: {} };
    SNAP_KEYS.forEach(k => { const v = PTLS.getItem(k); if (v != null) snap.keys[k] = v; });
    PTLS.setItem(UNDO_KEY, JSON.stringify(snap));          // throws if there is no room: nothing has changed yet

    let progHits = 0, sessHits = 0;
    eachProgName(a.data, (h, k) => { const to = map[h[k]]; if (to) { if (k === "name") keepDb(h, h[k], to); h[k] = to; progHits++; } });
    (a.sessions || []).forEach(s => {
      let hit = false;
      (s.ex || []).forEach(e => {
        const to = e && map[e.name]; if (!to) return;
        if (e.dbn === undefined) { const x = nDb(e.name), y = nDb(to); if (x !== y) e.dbn = x; }
        e.name = to; hit = true;
      });
      if (hit) sessHits++;
    });

    const targets = new Set();
    pairs.forEach(from => {
      const to = map[from]; targets.add(to);
      if (a.prBase && a.prBase[from] !== undefined) { a.prBase[to] = Math.max(parseFloat(a.prBase[to]) || 0, parseFloat(a.prBase[from]) || 0); delete a.prBase[from]; }
      if (a.lastPerf && a.lastPerf[from]) { if (!a.lastPerf[to]) a.lastPerf[to] = a.lastPerf[from]; delete a.lastPerf[from]; }
      if (a.exNotes && a.exNotes[from]) {
        if (!a.exNotes[to]) a.exNotes[to] = a.exNotes[from];
        else if (a.exNotes[to] !== a.exNotes[from]) a.exNotes[to] = a.exNotes[to] + "\n" + a.exNotes[from];
        delete a.exNotes[from];
      }
      if (a.prs) delete a.prs[from];
      ["restOverrides", "bwModes", "sideModes"].forEach(k => { const o = a.settings[k]; if (o && typeof o === "object" && o[from] !== undefined) { if (o[to] === undefined) o[to] = o[from]; delete o[from]; } });
    });
    if (Array.isArray(a.settings.favEx)) {
      const seen = new Set();
      a.settings.favEx = a.settings.favEx.map(n => map[n] || n).filter(n => !seen.has(n) && seen.add(n));
    }
    // "Reset day" on a built-in program goes back to programs.js, so it has to know about the new names
    a.settings.nameMap = Object.assign({}, a.settings.nameMap || {}, map);

    WorkoutStorage.setData(a.data);
    a.saveSessions();
    PT.save(STORAGE_KEY_PRBASE, a.prBase);
    PT.save(STORAGE_KEY_EXNOTES, a.exNotes);
    WorkoutStorage.saveLastPerf(a.lastPerf);
    save(a);
    a.recomputeSessionPRs();
    a.rebuildPRs();
    a.rebuildLastPerfFor([...targets]);
    return { progHits, sessHits };
  }

  // a built-in program's original day comes from programs.js: show the new names there too
  const oOrig = proto.originalExercises;
  proto.originalExercises = function (prog, day) {
    const r = oOrig.apply(this, arguments);
    const nm = this.settings && this.settings.nameMap;
    if (!nm || !Array.isArray(r) || !r.length || !this.builtinDay(prog, day)) return r;
    if (!r.some(e => e && (nm[e.name] || nm[e.origName]))) return r;
    const c = clone(r);
    c.forEach(e => {
      if (!e) return;
      if (nm[e.name]) { keepDb(e, e.name, nm[e.name]); e.name = nm[e.name]; }
      if (e.origName && nm[e.origName]) e.origName = nm[e.origName];
    });
    return c;
  };

  function refreshScreens(a) {
    const shown = id => { const e = document.getElementById("view-" + id); return e && !e.classList.contains("hidden"); };
    const call = (fn) => { try { if (typeof a[fn] === "function") a[fn](); } catch (e) { console.error("PulseTrack refresh", fn, e); } };
    if (shown("home")) call("renderHomeView");
    if (shown("programs")) call("renderProgramsView");
    if (shown("days")) call("renderDaysView");
    if (shown("workout")) call("renderWorkoutView");
    if (shown("library")) call("renderLibraryView");
    if (shown("history")) call("renderHistoryView");
    if (shown("progress")) call("renderProgressView");
    call("updateDrawerStatus");
  }

  function openCleanup() {
    const a = A(), K = PT.kit, el = K.sheet("pt-clean", 70);
    const { rows } = scan(), off = new Set(), undo = undoInfo();
    const noteTxt = undo ? `Last clean-up: ${plural(undo.count, "name")} renamed on ${PT.fmtDate(PT.ds(new Date(undo.t)))}.` : "";
    const undoBox = undo ? `<div class="rounded-xl border border-zinc-800 bg-zinc-950 p-3 flex items-center justify-between gap-3"><span class="text-[11px] text-zinc-400">${esc(noteTxt)}</span><button type="button" data-act="undo" class="shrink-0 px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-200 text-[11px] font-bold tap-active">Undo it</button></div>` : "";
    const head = K.head("Clean up exercise names", "Some programs spell exercises differently from the standard list, so the same lift can end up in two places.");
    if (!rows.length) {
      const card = K.openSheet(el, `${head}${undoBox}
        <div class="rounded-2xl bg-zinc-950 border border-zinc-800 p-5 text-center"><span class="text-2xl" aria-hidden="true">✅</span><p class="text-sm font-bold text-white mt-1">Everything already uses the standard names.</p><p class="text-[11px] text-zinc-400 mt-1">If you add a program later that spells things differently, come back here and run it again.</p></div>
        <button type="button" data-act="close" class="w-full py-3 rounded-xl bg-zinc-800 text-zinc-200 text-xs font-bold tap-active">Done</button>`);
      card.addEventListener("click", e => { const b = e.target.closest("[data-act]"); if (!b) return; if (b.dataset.act === "close") K.closeSheet(el); else if (b.dataset.act === "undo") doUndo(el); });
      return;
    }
    const withHist = rows.filter(r => r.sess > 0).length;
    const row = (r, i) => `<button type="button" class="pt-pc-row tap-active" data-i="${i}" aria-pressed="true"><span class="pt-pc-chk" aria-hidden="true">✓</span><span class="min-w-0 flex-1"><span class="pt-pc-old">${esc(r.from)}</span><span class="pt-pc-new">${esc(r.to)}</span><span class="pt-pc-meta">${[r.progs ? "in " + plural(r.progs, "program") : "", r.sess ? plural(r.sess, "saved workout") : ""].filter(Boolean).join(" · ") || "only in your records"}</span></span></button>`;
    const card = K.openSheet(el, `${head}${undoBox}
      <p class="text-[11px] text-zinc-400 leading-relaxed">Pick what to rename. Saved workouts, PRs, notes and last-time weights move over to the standard name, so nothing is lost${withHist ? ` (${withHist} of them already ${withHist === 1 ? "has" : "have"} saved workouts)` : ""}. Tap a name to leave it out.</p>
      <div class="flex items-center justify-between"><span id="pc-count" class="text-[11px] font-bold text-zinc-300"></span><button type="button" data-act="toggle" class="text-[11px] font-semibold text-zinc-400 underline tap-active">Select none</button></div>
      <div id="pc-list" class="space-y-1.5 overflow-y-auto" style="max-height:42vh">${rows.map(row).join("")}</div>
      <button type="button" data-act="go" class="w-full py-3 rounded-xl bg-emerald-600 text-white text-xs font-bold tap-active"></button>
      <button type="button" data-act="backup" class="w-full py-2.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold tap-active">Export a backup first</button>
      <p class="text-[10px] text-zinc-500 text-center">You can undo this until you save your next workout.</p>`);
    const $ = s => card.querySelector(s);
    const upd = () => {
      const n = rows.length - off.size;
      $("#pc-count").textContent = `${n} of ${rows.length} selected`;
      const go = $('[data-act="go"]'); go.textContent = n ? `Rename ${plural(n, "name")}` : "Nothing selected"; go.disabled = !n; go.style.opacity = n ? "" : ".5";
      $('[data-act="toggle"]').textContent = n ? "Select none" : "Select all";
    };
    upd();
    card.addEventListener("click", async e => {
      const rb = e.target.closest(".pt-pc-row");
      if (rb) { const i = +rb.dataset.i; if (off.has(i)) off.delete(i); else off.add(i); rb.setAttribute("aria-pressed", off.has(i) ? "false" : "true"); upd(); return; }
      const b = e.target.closest("[data-act]"); if (!b) return;
      const act = b.dataset.act;
      if (act === "toggle") {
        const none = rows.length - off.size > 0;
        off.clear(); if (none) rows.forEach((r, i) => off.add(i));
        card.querySelectorAll(".pt-pc-row").forEach(x => x.setAttribute("aria-pressed", none ? "false" : "true")); upd();
      } else if (act === "backup") { a.exportBackup(); }
      else if (act === "undo") { doUndo(el); }
      else if (act === "go") {
        const map = {}; rows.forEach((r, i) => { if (!off.has(i)) map[r.from] = r.to; });
        const n = Object.keys(map).length; if (!n) return;
        let res;
        try { res = applyRenames(map); }
        catch (err) { console.error("PulseTrack clean-up", err); await PT.alert("PulseTrack could not make a safety copy first (the phone's storage may be full), so nothing was changed. Export a backup, free up some space and try again."); return; }
        K.closeSheet(el);
        refreshScreens(a);
        try { a.renderSettingsExtras && a.renderSettingsExtras(); } catch (err) { }
        paintCleanBtn();
        a.toast(`Renamed ${plural(n, "name")}. History and PRs were merged.`, "Undo", () => doUndo(null), 12000);
      }
    });
  }

  async function doUndo(sheetEl) {
    const a = A(), s = undoInfo();
    if (!s) { a.toast("Too late to undo: a workout was saved since."); return; }
    if (!await PT.confirm("Undo the clean-up?\n\nYour programs, history, PRs and notes go back to how they were just before. Anything you changed in them since then is lost.")) return;
    try {
      Object.keys(s.keys).forEach(k => PTLS.setItem(k, s.keys[k]));
      PTLS.removeItem(UNDO_KEY);
    } catch (err) { await PT.alert("Could not restore: the phone's storage is full. Nothing was changed."); return; }
    if (sheetEl) PT.kit.closeSheet(sheetEl);
    a.toast("Undone. Reloading…");
    setTimeout(() => location.reload(), 700);
  }

  function paintCleanBtn() {
    const b = document.getElementById("btn-clean-names"); if (!b) return;
    let n = 0; try { n = scan().rows.length; } catch (e) { }
    b.innerHTML = `Clean Up Exercise Names${n ? ` <span class="font-mono text-emerald-400">· ${n}</span>` : ""}`;
    b.title = n ? `${plural(n, "name")} can be tidied` : "All names are standard";
  }
  const oSettings = proto.openSettings;
  proto.openSettings = function () {
    const r = oSettings.apply(this, arguments);
    try { paintCleanBtn(); } catch (e) { console.error(e); }
    return r;
  };
  document.addEventListener("click", e => {
    if (e.target.closest && e.target.closest("#btn-clean-names")) { e.preventDefault(); openCleanup(); }
  });
  PT.cleanup = { scan, apply: applyRenames, undoInfo, open: openCleanup };

  /* ======================================================================== search */
  const STOP = new Set();
  const tokens = q => String(q || "").toLowerCase().split(/[\s,]+/).filter(t => t && !STOP.has(t));
  const reEsc = t => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  function hl(text, toks) {
    const s = String(text == null ? "" : text);
    if (!toks.length) return esc(s);
    const re = new RegExp("(" + toks.map(reEsc).join("|") + ")", "ig");
    return s.split(re).map((p, i) => (i % 2 ? `<mark class="pt-mk">${esc(p)}</mark>` : esc(p))).join("");
  }
  function snip(text, toks, n) {
    const t = String(text || "").replace(/\s+/g, " ").trim(), low = t.toLowerCase();
    let at = -1; for (const k of toks) { const i = low.indexOf(k); if (i >= 0 && (at < 0 || i < at)) at = i; }
    const st = Math.max(0, (at < 0 ? 0 : at) - 28), len = n || 110;
    return (st ? "…" : "") + t.slice(st, st + len) + (st + len < t.length ? "…" : "");
  }
  const all = (hay, toks) => toks.every(t => hay.includes(t));
  const dateCache = new Map();
  const dateWords = ds => {
    let v = dateCache.get(ds);
    if (v === undefined) { try { v = (ds + " " + PT.fmtDate(ds, { weekday: "long", month: "long", day: "numeric", year: "numeric" })).toLowerCase(); } catch (e) { v = String(ds); } dateCache.set(ds, v); }
    return v;
  };
  const dbList = () => (typeof EXERCISE_DATABASE !== "undefined" && Array.isArray(EXERCISE_DATABASE)) ? EXERCISE_DATABASE : [];
  let lastQ = "", lastAt = 0;

  /** collect everything searchable once per open: history counts per exercise, etc. */
  function index() {
    const a = A(), hist = new Map();
    (a.sessions || []).forEach(s => (s.ex || []).forEach(e => {
      if (!e || !e.name) return;
      const key = PT.exName(e.name);
      let h = hist.get(key); if (!h) { h = { n: 0, last: "" }; hist.set(key, h); }
      h.n++; if (!h.last || s.date > h.last) h.last = s.date;
    }));
    const dbNames = new Set(dbList().map(e => e.name));
    const extra = []; hist.forEach((h, name) => { if (!dbNames.has(name)) extra.push({ name, category: PT.category(name) }); });
    return { hist, extra };
  }

  function runSearch(q, ix) {
    const a = A(), toks = tokens(q), out = [];
    if (!toks.length) return out;

    // exercises
    const ex = dbList().concat(ix.extra).filter(e => PT.exMatch(e, q));
    ex.sort((x, y) => (PT.exRank(x, q) - PT.exRank(y, q)) || ((ix.hist.get(y.name) || { n: 0 }).n - (ix.hist.get(x.name) || { n: 0 }).n) || x.name.localeCompare(y.name));
    out.push({ id: "ex", title: "Exercises", items: ex.slice(0, 60).map(e => {
      const h = ix.hist.get(e.name), hint = PT.exHint(e, q);
      return { kind: "ex", name: e.name, html: `<span class="pt-st">${hl(e.name, toks)}</span><span class="pt-ss">${esc(e.category || "")}${hint ? " · also called " + hl(hint, toks) : ""}${h ? ` · ${plural(h.n, "workout")}, last ${esc(PT.fmtDate(h.last, { month: "short", day: "numeric", year: "2-digit" }))}` : ""}</span>` };
    }), total: ex.length });

    // programs
    const progs = [];
    (a.data.programs || []).forEach(p => {
      if (!p || p.id === FREESTYLE_ID) return;
      const days = p.days || [];
      const head = ((p.title || "") + " " + (p.description || "") + " " + days.map(d => d.title || "").join(" ")).toLowerCase();
      const exs = days.flatMap(d => (d.exercises || []).map(e => e && e.name).filter(Boolean));
      const hayAll = head + " " + exs.join(" ").toLowerCase();
      if (!all(hayAll, toks)) return;
      const inTitle = all(head, toks);
      const via = inTitle ? "" : (() => { const hit = exs.find(n => toks.some(t => n.toLowerCase().includes(t))); return hit ? "has " + hit : ""; })();
      progs.push({ p, inTitle, via, days: days.length });
    });
    progs.sort((x, y) => (y.inTitle - x.inTitle) || String(x.p.title).localeCompare(String(y.p.title)));
    out.push({ id: "prog", title: "Programs", items: progs.slice(0, 30).map(r => ({ kind: "prog", id: r.p.id, html: `<span class="pt-st">${hl(r.p.title || "Program", toks)}</span><span class="pt-ss">${plural(r.days, "day")}${r.via ? " · " + hl(r.via, toks) : ""}</span>` })), total: progs.length });

    // finished workouts (title, program, exercises, date)
    const ses = [];
    (a.sessions || []).slice().sort((x, y) => (y.ts || 0) - (x.ts || 0)).forEach(s => {
      const names = (s.ex || []).map(e => e && e.name).filter(Boolean);
      const hay = ((s.dtitle || "") + " " + (s.ptitle || "") + " " + names.join(" ") + " " + names.map(n => PT.exName(n)).join(" ") + " " + dateWords(s.date || "")).toLowerCase();
      if (!all(hay, toks)) return;
      const nameHit = names.find(n => toks.some(t => n.toLowerCase().includes(t)) && !all(((s.dtitle || "") + " " + (s.ptitle || "")).toLowerCase(), toks));
      ses.push({ s, nameHit });
    });
    out.push({ id: "ses", title: "Workouts", items: ses.slice(0, 60).map(r => {
      const s = r.s;
      return { kind: "ses", id: s.id, html: `<span class="pt-st">${hl(s.dtitle || "Workout", toks)}</span><span class="pt-ss">${esc(PT.fmtDate(s.date, { weekday: "short", month: "short", day: "numeric", year: "numeric" }))}${s.ptitle ? " · " + hl(s.ptitle, toks) : ""} · ${plural(s.sets || 0, "set")}</span>${r.nameHit ? `<span class="pt-sn">${hl(r.nameHit, toks)}</span>` : ""}` };
    }), total: ses.length });

    // notes
    const notes = [];
    Object.keys(a.exNotes || {}).forEach(n => {
      const t = String(a.exNotes[n] || ""); if (!t) return;
      if (all((n + " " + t).toLowerCase(), toks)) notes.push({ kind: "ex", name: n, ord: 0, html: `<span class="pt-st">📌 ${hl(n, toks)}</span><span class="pt-sn">${hl(snip(t, toks), toks)}</span>` });
    });
    Object.keys(a.dayNotes || {}).forEach(k => {
      const t = String(a.dayNotes[k] || ""); if (!t) return;
      const m = k.match(/^(.*)_d(\d+)$/); if (!m) return;
      const p = (a.data.programs || []).find(x => x.id === m[1]);
      const d = p && (p.days || []).find(x => String(x.dayNumber) === m[2]);
      const label = p ? `${p.title || "Program"} · ${(d && d.title) || "Day " + m[2]}` : "Workout note";
      if (all((label + " " + t).toLowerCase(), toks)) notes.push({ kind: p && d ? "day" : "none", pid: m[1], day: m[2], ord: 1, html: `<span class="pt-st">📝 ${hl(label, toks)}</span><span class="pt-sn">${hl(snip(t, toks), toks)}</span><span class="pt-ss">Note for the workout in progress</span>` });
    });
    (a.sessions || []).slice().sort((x, y) => (y.ts || 0) - (x.ts || 0)).forEach(s => {
      const t = String(s.note || ""); if (!t) return;
      if (all(t.toLowerCase(), toks)) notes.push({ kind: "ses", id: s.id, ord: 2, html: `<span class="pt-st">📝 ${hl(s.dtitle || "Workout", toks)} <span class="font-normal text-zinc-400">· ${esc(PT.fmtDate(s.date, { month: "short", day: "numeric", year: "2-digit" }))}</span></span><span class="pt-sn">${hl(snip(t, toks), toks)}</span>` });
    });
    try {
      const C = PT.cardio, logs = C && C.data ? C.data().logs : [];
      (logs || []).slice().sort((x, y) => (y.date < x.date ? -1 : 1)).forEach(l => {
        const t = String(l.note || ""); if (!t) return;
        const act = C.actOf(l.act, l);
        if (all((t + " " + act.name).toLowerCase(), toks)) notes.push({ kind: "card", id: l.id, ord: 3, html: `<span class="pt-st">${esc(act.icon || "💓")} ${hl(act.name, toks)} <span class="font-normal text-zinc-400">· ${esc(PT.fmtDate(l.date, { month: "short", day: "numeric", year: "2-digit" }))}</span></span><span class="pt-sn">${hl(snip(t, toks), toks)}</span>` });
      });
    } catch (e) { }
    notes.sort((x, y) => x.ord - y.ord);
    out.push({ id: "note", title: "Notes", items: notes.slice(0, 60), total: notes.length });

    // cardio sessions by activity name
    try {
      const C = PT.cardio, logs = C && C.data ? C.data().logs : [];
      const hits = [];
      (logs || []).slice().sort((x, y) => (y.date < x.date ? -1 : y.date > x.date ? 1 : 0)).forEach(l => {
        const act = C.actOf(l.act, l);
        if (all((act.name + " " + dateWords(l.date)).toLowerCase(), toks)) hits.push({ l, act });
      });
      const km = a.unit() === "kg";
      out.push({ id: "card", title: "Cardio & Sports", items: hits.slice(0, 40).map(r => {
        const l = r.l, bits = [PT.fmtDate(l.date, { month: "short", day: "numeric", year: "numeric" })];
        if (l.sec) bits.push(Math.max(1, Math.round(l.sec / 60)) + " min");
        if (l.dist > 0) bits.push(km ? PT.num(l.dist / 1000, 2) + " km" : PT.num(l.dist / 1609.344, 2) + " mi");
        return { kind: "card", id: l.id, html: `<span class="pt-st">${esc(r.act.icon || "💓")} ${hl(r.act.name, toks)}</span><span class="pt-ss">${esc(bits.join(" · "))}</span>` };
      }), total: hits.length });
    } catch (e) { }
    return out.filter(g => g.total > 0);
  }

  function openSearch(initial) {
    const a = A(), K = PT.kit, el = K.sheet("pt-find", 74);
    const ix = index(), open = new Set();
    let q = initial != null ? initial : (Date.now() - lastAt < 10 * 60000 ? lastQ : ""), timer = null, res = [];
    const nEx = dbList().length + ix.extra.length, nSes = (a.sessions || []).length;
    const card = K.openSheet(el, `${K.head("Search", "Exercises, programs, workouts, notes and cardio.")}
      <div class="relative">${SEARCH_SVG.replace("<svg ", '<svg class="pt-sico" ')}<input id="pt-sq" type="search" enterkeyhint="search" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Try: bench, shoulder, march, sore knee" class="pt-sin" value="${esc(q)}" aria-label="Search"></div>
      <div id="pt-sout" class="space-y-4" aria-live="polite"></div>`);
    const inp = card.querySelector("#pt-sq"), box = card.querySelector("#pt-sout");
    const LIMIT = 5;
    const render = () => {
      const toks = tokens(q);
      if (!toks.length) {
        box.innerHTML = `<div class="rounded-2xl bg-zinc-950 border border-zinc-800 p-4 space-y-1.5"><p class="text-xs font-bold text-white">Find anything you've logged</p>
          <p class="text-[11px] text-zinc-400 leading-relaxed">Searches ${plural(nEx, "exercise")}, ${plural(nSes, "saved workout")}, your notes and your cardio. Several words narrow it down: <span class="text-zinc-300">"incline press"</span>, <span class="text-zinc-300">"march 2026"</span>, <span class="text-zinc-300">"shoulder"</span>.</p></div>`;
        return;
      }
      if (!res.length) { box.innerHTML = `<div class="rounded-2xl bg-zinc-950 border border-zinc-800 p-4 text-center"><p class="text-sm font-bold text-white">Nothing found for "${esc(q.trim())}"</p><p class="text-[11px] text-zinc-400 mt-1">Check the spelling or try fewer words.</p></div>`; return; }
      box.innerHTML = res.map(g => {
        const shown = open.has(g.id) ? g.items : g.items.slice(0, LIMIT);
        return `<section class="space-y-1.5" data-g="${g.id}"><h4 class="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-0.5">${esc(g.title)} · ${g.total}</h4>
          ${shown.map(it => `<button type="button" class="pt-sres tap-active" data-g="${g.id}" data-i="${g.items.indexOf(it)}">${it.html}</button>`).join("")}
          ${g.items.length > LIMIT ? `<button type="button" data-more="${g.id}" class="w-full py-2 rounded-xl bg-zinc-800/70 text-zinc-300 text-[11px] font-bold tap-active">${open.has(g.id) ? "Show fewer" : `Show all ${g.total}${g.total > g.items.length ? "+" : ""}`}</button>` : ""}</section>`;
      }).join("");
    };
    const go = () => { q = inp.value; lastQ = q; lastAt = Date.now(); res = runSearch(q, ix); open.clear(); render(); };
    inp.addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(go, 140); });
    inp.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); clearTimeout(timer); go(); inp.blur(); } });
    card.addEventListener("click", e => {
      const more = e.target.closest("[data-more]");
      if (more) { const id = more.dataset.more; if (open.has(id)) open.delete(id); else open.add(id); render(); return; }
      const b = e.target.closest(".pt-sres"); if (!b) return;
      const g = res.find(x => x.id === b.dataset.g), it = g && g.items[+b.dataset.i]; if (!it) return;
      lastQ = q; lastAt = Date.now();
      const back = () => openSearch(q);
      back.ptLabel = "Back to search";
      K.closeSheet(el);
      if (it.kind === "ex") a.openExerciseSheet(it.name, back);
      else if (it.kind === "ses") a.openSessionSheet(it.id);
      else if (it.kind === "card") { try { PT.cardio.openLog({ log: PT.cardio.data().logs.find(l => l.id === it.id) }); } catch (err) { console.error(err); } }
      else if (it.kind === "prog" || it.kind === "day") {
        const p = (a.data.programs || []).find(x => x.id === (it.kind === "prog" ? it.id : it.pid)); if (!p) return;
        const d = it.kind === "day" ? (p.days || []).find(x => String(x.dayNumber) === String(it.day)) : (a.nextDayOf(p) || (p.days || [])[0] || null);
        a.activeProgram = p; a.activeDay = d;
        try { AppStateMemory.saveActive(p.id, d ? d.dayNumber : null); } catch (err) { }
        a.showView(it.kind === "day" ? "workout" : "days");
      }
    });
    if (q.trim()) { res = runSearch(q, ix); }
    render();
    setTimeout(() => { try { inp.focus(); inp.select(); } catch (e) { } }, 120);
  }
  PT.search = { open: openSearch, run: (q) => runSearch(q, index()) };

  /* ---- ways in: Home bar, side menu */
  function paintSearchBar() {
    const box = document.getElementById("home-search"); if (!box || box.dataset.ready) return;
    box.dataset.ready = "1";
    box.className = "";
    box.innerHTML = `<button type="button" class="pt-sbar tap-active" id="pt-home-search" aria-label="Search">${SEARCH_SVG}<span>Search exercises, workouts, notes</span></button>`;
  }
  const oHome = proto.renderHomeView;
  proto.renderHomeView = function () {
    const r = oHome.apply(this, arguments);
    try { paintSearchBar(); } catch (e) { console.error("PulseTrack search bar", e); }
    return r;
  };
  document.addEventListener("click", e => {
    const t = e.target && e.target.closest ? e.target.closest("#pt-home-search, #pt-drawer-search") : null;
    if (!t) return;
    e.preventDefault();
    const a = A(); if (!a) return;
    if (t.id === "pt-drawer-search") a.closeDrawer();
    openSearch();
  });
})();
  