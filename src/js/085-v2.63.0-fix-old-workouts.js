
/* =====================================================================
 * PulseTrack 2.63.0: "Fix old workouts".
 *  Sets saved before 2.62.0 do not say whether the weight was typed per side / per hand or as a total, so the app guessed (from the dumbbell count saved with the
 *  exercise). This screen lets you say what you did, per exercise:
 *    Weight   Each side (each hand for dumbbells) | Total
 *    Reps     Per hand / leg / side | Total          (only where the reps button exists)
 *  Apply stamps those sets (set.sm = "e" / "t", set.rm = "t" for total reps), works the volume of those workouts out again, and the strength levels, records and
 *  volume follow. Home says what changed, with Undo. Nothing is touched until you tap Apply; only exercises you tapped on are changed.
 *  Where: Settings -> Fix old workouts, the detail sheet of an exercise's strength level, and one Home line (once) when old cable and machine sets exist.
 *  Settings: settings.fixOldAsked (the Home line was answered), settings.fixOldNote ({n, ex, from, to}) + settings.fixOldUndo (what Undo puts back), until OK.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined" || typeof PT.sideInfo !== "function" || typeof PT.volFactor !== "function") return;
  const proto = ApplicationUI.prototype;
  const $ = id => document.getElementById(id), A = () => window.app, esc = s => PT.esc(s);
  const S = a => a.sessions || [];
  const save = a => { try { WorkoutStorage.saveSettings(a.settings); } catch (e) { } };
  const isWork = st => !!st && st.t !== "W" && !(PT.isCardioSet && PT.isCardioSet(st));
  const keyOf = name => { try { const e = PT.exCanon && PT.exCanon(name); return e && e.name ? e.name : String(name || ""); } catch (e) { return String(name || ""); } };

  /* ================================================================ what is old */
  /** how the weight of an old record is read right now: "e" (each side / each hand) or "t" (total), the same way strength levels read it */
  function reading(e, info) {
    if (info.db) return "e";
    const d = parseFloat(e.dbn) || 0, rmT = (e.sets || []).some(x => x && x.rm === "t");
    return (rmT ? d * 2 : d) >= 2 ? "e" : "t";
  }
  PT.fixOldReading = reading;   // 2.64.0: the exercise sheet reads records the same way
  let memo = null;
  /** the exercises that have records without an "sm" yet: [{ key, name, info, sets, recs, w }] */
  function scan(a) {
    const mk = S(a).length + ":" + S(a).reduce((m, s) => Math.max(m, s.upd || s.ts || 0), 0);
    if (memo && memo.mk === mk) return memo.rows;
    const by = new Map();
    S(a).forEach(s => (s.ex || []).forEach((e, ei) => {
      if (!e || !e.name || !Array.isArray(e.sets)) return;
      const work = e.sets.filter(isWork); if (!work.length || work.every(x => x.sm)) return;
      const info = PT.sideInfo(e.name); if (!info.side && !info.reps) return;
      const k = keyOf(e.name); let o = by.get(k);
      if (!o) { o = { key: k, name: k, info, sets: 0, recs: 0, e: 0, t: 0, rt: 0 }; by.set(k, o); }
      o.sets += work.length; o.recs++; o[reading(e, info)]++; if (e.sets.some(x => x && x.rm === "t")) o.rt++;
    }));
    const rows = [...by.values()].map(o => Object.assign(o, { w: o.t > o.e ? "t" : "e", r: o.rt * 2 > o.recs ? "total" : "each" })).sort((x, y) => y.sets - x.sets);
    memo = { mk, rows }; return rows;
  }
  PT.fixOldHas = name => { try { const a = A(), k = keyOf(name); return !!a && scan(a).some(r => r.key === k); } catch (e) { return false; } };

  /* ================================================================ the sheet */
  const view = { rows: [], pick: {}, more: 1, focus: "" };
  const wordOf = r => (r.info.db ? "Each hand" : "Each side");
  const btn = (k, f, v, label, on) => `<button type="button" class="pt-opt tap-active" data-fx="${esc(k)}" data-f="${f}" data-v="${v}" aria-pressed="${on}">${esc(label)}</button>`;
  function rowHtml(r) {
    const p = view.pick[r.key] || {}, w = p.w || r.w, rp = p.r || r.r, n = r.sets;
    const wl = r.info.side ? `<div class="pt-fx-line"><span>Weight</span><div class="flex gap-1.5">${btn(r.key, "w", "e", wordOf(r), w === "e")}${btn(r.key, "w", "t", "Total", w === "t")}</div></div>` : "";
    const rl = r.info.reps ? `<div class="pt-fx-line"><span>Reps</span><div class="flex gap-1.5">${btn(r.key, "r", "each", "Per " + r.info.hand, rp === "each")}${btn(r.key, "r", "total", "Total", rp === "total")}</div></div>` : "";
    return `<div class="pt-fx-row${p.t ? " on" : ""}"><div class="flex items-baseline justify-between gap-2"><span class="min-w-0 truncate text-xs font-bold text-white">${esc(r.name)}</span><span class="shrink-0 text-[10px] text-zinc-500">${n} old set${n === 1 ? "" : "s"}</span></div>${wl}${rl}</div>`;
  }
  const touched = () => Object.keys(view.pick).filter(k => view.pick[k] && view.pick[k].t);
  function paint(a) {
    const body = $("sheet-body"); if (!body) return;
    const rows = view.rows.slice().sort((x, y) => (x.key === view.focus ? -1 : 0) - (y.key === view.focus ? -1 : 0)), n = view.more * 8, show = rows.slice(0, n);
    body.innerHTML = rows.length
      ? `<p class="text-[11px] text-zinc-400 leading-snug">Older sets do not say if you typed each side or the total. Tap what you did, then Apply. Levels, volume and records follow. You can undo.</p>
         <div class="space-y-2">${show.map(rowHtml).join("")}</div>${rows.length > n ? `<button type="button" id="pt-fx-more" class="w-full py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] font-bold text-zinc-300 tap-active">Show more (${rows.length - n})</button>` : ""}`
      : `<p class="text-sm text-zinc-300">Nothing to fix. Every old set has been checked.</p>`;
    const c = touched().length, foot = $("sheet-footer");
    if (foot) { foot.classList.toggle("hidden", !rows.length); foot.innerHTML = rows.length ? `<button type="button" id="pt-fx-apply" class="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm tap-active" ${c ? "" : 'disabled style="opacity:.45"'}>${c ? `Apply to ${c} exercise${c === 1 ? "" : "s"}` : "Tap an answer to change it"}</button>` : ""; }
  }
  function open(a, focus) {
    view.rows = scan(a); view.pick = {}; view.more = 1; view.focus = focus ? keyOf(focus) : "";
    a.openSheet("Fix old workouts", view.rows.length ? view.rows.length + " exercise" + (view.rows.length === 1 ? "" : "s") + " with older sets" : "", "", "");
    paint(a);
  }
  PT.fixOldOpen = name => { const a = A(); if (a) open(a, name); };

  /* ================================================================ apply, and undo */
  const volumeOf = (a, list) => list.reduce((t, s) => t + (a.sessionVolume(s) || 0), 0);
  function apply(a) {
    const keys = touched(); if (!keys.length) return;
    const sel = new Map(keys.map(k => [k, view.pick[k]])), undo = [], hit = new Set(), ex = new Set();
    const sessions = S(a), before = [];
    sessions.forEach((s, si) => (s.ex || []).forEach((e, ei) => {
      if (!e || !e.name || !Array.isArray(e.sets)) return;
      const k = keyOf(e.name), p = sel.get(k); if (!p) return;
      const work = e.sets.filter(isWork); if (!work.length || work.every(x => x.sm)) return;
      const r = view.rows.find(x => x.key === k); if (!r) return;
      if (!hit.has(s)) { hit.add(s); before.push(a.sessionVolume(s) || 0); }
      ex.add(k);
      undo.push([s.id, ei, e.dbn == null ? null : e.dbn, e.sets.map((x, i) => (x && x.rm === "t" ? i : -1)).filter(i => i >= 0)]);
      const w = p.w || r.w, rep = r.info.reps ? (p.r || r.r) : "";
      const sm = r.info.side ? w : "o";
      // volume is only worked out again where the answer differs from how the record was read
      const cw = r.info.side && w !== reading(e, r.info), cr = r.info.reps && ((rep === "total") !== e.sets.some(x => x && x.rm === "t"));
      e.sets.forEach(x => { if (!x) return; x.sm = sm; if (r.info.reps) { if (rep === "total") x.rm = "t"; else delete x.rm; } });
      if (cw || cr) { const f = PT.volFactor(e.name, e.reps, r.info.side ? (w === "e" ? "each" : "total") : "", r.info.reps ? rep : ""); if (f > 0) e.dbn = f; }
    }));
    if (!hit.size) { a.toast("Nothing to change"); return; }
    const now = Date.now(); hit.forEach(s => { s.upd = now; });
    const from = Math.round(before.reduce((t, v) => t + v, 0));
    try { a.recomputeVolumes(); a.recomputeSessionPRs && a.recomputeSessionPRs(); a.rebuildPRs && a.rebuildPRs(); } catch (e) { console.error("PulseTrack fix old workouts", e); }
    const to = Math.round(volumeOf(a, [...hit]));
    a.settings.fixOldUndo = undo; a.settings.fixOldNote = { n: hit.size, ex: ex.size, from, to }; a.settings.fixOldAsked = Date.now(); save(a);
    memo = null; try { a.closeSheet(); } catch (e) { }
    a.toast(`Updated ${hit.size} workout${hit.size === 1 ? "" : "s"}`);
    try { a.renderHomeView && a.renderHomeView(); a.renderProgressView && $("progress-body") && a.renderProgressView(); } catch (e) { }
  }
  function undo(a) {
    const u = a.settings.fixOldUndo; if (!Array.isArray(u)) return;
    const byId = new Map(S(a).map(s => [s.id, s]));
    u.forEach(([sid, ei, dbn, rmIdx]) => {
      const s = byId.get(sid), e = s && s.ex && s.ex[ei]; if (!e || !Array.isArray(e.sets)) return;
      e.sets.forEach((x, i) => { if (!x) return; delete x.sm; if (rmIdx.indexOf(i) >= 0) x.rm = "t"; else delete x.rm; });
      if (dbn == null) delete e.dbn; else e.dbn = dbn;
      s.upd = Date.now();
    });
    delete a.settings.fixOldUndo; delete a.settings.fixOldNote; save(a); memo = null;
    try { a.recomputeVolumes(); a.recomputeSessionPRs && a.recomputeSessionPRs(); a.rebuildPRs && a.rebuildPRs(); } catch (e) { }
    a.toast("Back to how they were"); try { a.renderHomeView && a.renderHomeView(); } catch (e) { }
  }

  document.addEventListener("click", e => {
    const a = A(); if (!a || !e.target.closest) return;
    const b = e.target.closest("[data-fx]");
    if (b) {
      const k = b.dataset.fx, p = view.pick[k] || (view.pick[k] = {}); p[b.dataset.f] = b.dataset.v; p.t = 1; paint(a); return;
    }
    if (e.target.closest("#pt-fx-more")) { view.more++; paint(a); return; }
    if (e.target.closest("#pt-fx-apply")) { apply(a); return; }
    const o = e.target.closest("[data-fixold]"); if (o) { open(a, o.dataset.fixold); return; }
    if (e.target.closest("#pt-fixold-btn")) { try { a.closeSettings && a.closeSettings(); } catch (x) { } setTimeout(() => open(a), 150); }
  });

  /* ================================================================ Settings */
  const oEx = proto.renderSettingsExtras;
  if (typeof oEx === "function") proto.renderSettingsExtras = async function () {
    const r = await oEx.apply(this, arguments);
    try {
      if (!$("pt-fixold-row")) {
        const ref = $("pt-slconv-row") || $("pt-typo-row") || $("pt-dbpair-row") || $("pt-simple-row") || $("pt-resume-row") || $("pt-tabs-row") || $("pt-gym-row") || $("pt-textsize");
        if (ref) {
          const row = document.createElement("div");
          row.id = "pt-fixold-row"; row.className = "flex items-center justify-between gap-3 mt-3";
          row.innerHTML = '<span><span class="block text-xs font-bold text-zinc-100">Fix old workouts</span><span class="block text-[11px] text-zinc-400">Tell the app if older sets were each side or total, per hand or total.</span></span><button type="button" id="pt-fixold-btn" class="shrink-0 px-3 py-2 rounded-lg bg-zinc-800 text-zinc-100 text-xs font-bold tap-active">Open</button>';
          ref.insertAdjacentElement("afterend", row);
        }
      }
    } catch (e) { console.error("PulseTrack fix old workouts setting", e); }
    return r;
  };

  /* ================================================================ Home: the result with Undo, or one question (once) */
  const oBan = proto.renderHomeBanners;
  if (typeof oBan === "function") proto.renderHomeBanners = function () {
    const r = oBan.apply(this, arguments);
    try {
      const a = this, s = a.settings, box = $("home-banners"); if (!box) return r;
      const mk = (type, html) => { const el = document.createElement("div"); el.className = "border border-emerald-800/60 bg-emerald-950/30 rounded-xl p-3 text-xs text-zinc-300 flex items-start gap-3"; el.setAttribute("data-banner", type); el.innerHTML = html; box.insertBefore(el, box.firstChild); return el; };
      const note = s.fixOldNote;
      if (note && note.n) {
        const pct = note.from > 0 ? Math.round((note.to - note.from) / note.from * 100) : 0;
        const el = mk("fixold", `<div class="flex-grow leading-relaxed"><b class="text-white">Old workouts updated.</b> ${note.n} workout${note.n === 1 ? "" : "s"}, ${note.ex} exercise${note.ex === 1 ? "" : "s"}${pct ? ` (volume ${pct > 0 ? "+" : ""}${pct}%)` : ""}.</div>
          <div class="flex flex-col gap-1.5 shrink-0"><button type="button" class="pt-fxn-undo px-2.5 py-1.5 bg-zinc-800 text-zinc-300 rounded-lg tap-active">Undo</button><button type="button" class="pt-fxn-ok px-2.5 py-1.5 bg-emerald-600 text-white font-bold rounded-lg tap-active">OK</button></div>`);
        el.querySelector(".pt-fxn-ok").addEventListener("click", () => { delete s.fixOldNote; delete s.fixOldUndo; save(a); a.renderHomeBanners(); });
        el.querySelector(".pt-fxn-undo").addEventListener("click", () => undo(a));
        return r;
      }
      if (!s.fixOldAsked && S(a).length) {
        const machine = scan(a).filter(x => x.info.side && !x.info.db).length;
        if (machine) {
          const el = mk("fixold-ask", `<div class="flex-grow leading-relaxed"><b class="text-white">Old cable and machine sets.</b> Did you type each side or the total? Your levels use your answer.</div>
            <div class="flex flex-col gap-1.5 shrink-0"><button type="button" class="pt-fxa-go px-2.5 py-1.5 bg-emerald-600 text-white font-bold rounded-lg tap-active">Check</button><button type="button" class="pt-fxa-no px-2.5 py-1.5 bg-zinc-800 text-zinc-300 rounded-lg tap-active">Not now</button></div>`);
          el.querySelector(".pt-fxa-no").addEventListener("click", () => { s.fixOldAsked = Date.now(); save(a); a.renderHomeBanners(); });
          el.querySelector(".pt-fxa-go").addEventListener("click", () => { s.fixOldAsked = Date.now(); save(a); a.renderHomeBanners(); open(a); });
        }
      }
    } catch (e) { console.error("PulseTrack fix old workouts banner", e); }
    return r;
  };

  const css = document.createElement("style"); css.id = "pt-v263-fix-css";
  css.textContent = `
    .pt-fx-row { display: flex; flex-direction: column; gap: .45rem; padding: .65rem .7rem; border-radius: .8rem; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); }
    .pt-fx-row.on { border-color: rgb(var(--a600) / .7); }
    .pt-fx-line { display: flex; align-items: center; justify-content: space-between; gap: .5rem; }
    .pt-fx-line > span { font-size: .68rem; font-weight: 700; color: rgb(var(--z400)); }
  `;
  document.head.appendChild(css);
})();
  