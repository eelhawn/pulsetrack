
/* =====================================================================
 * PulseTrack 2.64.0: change "Each side / Total" from the exercise itself.
 *  Tap an exercise (Progress, records, search, History) and its sheet now has a small "How you type it" card:
 *    Weight   Each side (Each hand on dumbbells) | Total
 *    Reps     Per hand / leg / side | Total        (only where the exercise has that choice)
 *  It changes the same choice as the label in a workout (settings.sideModes / settings.repModes), so new sets use it.
 *  Right after you change it, if older workouts of that exercise are counted the other way, the card says how many and offers "Change them too":
 *  those sets get the new answer (set.sm / set.rm), their volume is worked out again, and records and strength levels follow. Undo puts them back.
 *  Nothing about past workouts changes unless you tap "Change them too".
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined" || typeof PT.setSideMode !== "function" || typeof PT.fixOldReading !== "function" || typeof PT.sideInfo !== "function") return;
  const proto = ApplicationUI.prototype;
  const $ = id => document.getElementById(id), A = () => window.app, esc = s => PT.esc(s);
  const keyOf = name => { try { const e = PT.exCanon && PT.exCanon(name); return e && e.name ? e.name : String(name || ""); } catch (e) { return String(name || ""); } };
  const isWork = st => !!st && st.t !== "W" && !(PT.isCardioSet && PT.isCardioSet(st));
  let st = { name: "" }, lastArgs = null;

  /* ================================================================ the exercise's saved records */
  function recs(a, name) {
    const k = keyOf(name), out = [];
    (a.sessions || []).forEach(s => (s.ex || []).forEach(e => {
      if (!e || !e.name || !Array.isArray(e.sets) || keyOf(e.name) !== k) return;
      if (e.sets.some(isWork)) out.push({ s, e });
    }));
    return out;
  }
  /** how the weight of a record is counted: "e" (each side / each hand) or "t" (total) */
  const wOf = (e, info) => { const x = (e.sets || []).find(v => v && (v.sm === "e" || v.sm === "t")); return x ? x.sm : PT.fixOldReading(e, info); };
  const rOf = e => ((e.sets || []).some(v => v && v.rm === "t") ? "total" : "each");
  /** the answers the person picked for this exercise: weight "e" / "t" and reps "each" / "total" ("" = not picked) */
  function target(name, info) {
    const m = info.side ? PT.sideMode(name) : "", r = info.reps ? PT.repMode(name) : "";
    return { w: m === "each" ? "e" : m === "total" ? "t" : "", r };
  }
  const differs = (rec, info, t) => (!!t.w && wOf(rec.e, info) !== t.w) || (!!t.r && rOf(rec.e) !== t.r);

  /* ================================================================ change the past ones too, and undo */
  function convert(a, name, info) {
    const t = target(name, info), list = recs(a, name).filter(r => differs(r, info, t)), snap = [], now = Date.now();
    list.forEach(({ s, e }) => {
      snap.push({ s, e, dbn: Object.prototype.hasOwnProperty.call(e, "dbn") ? e.dbn : undefined, sets: e.sets.map(x => (x ? [x.sm, x.rm] : null)) });
      const w0 = info.side ? wOf(e, info) : "", r0 = info.reps ? rOf(e) : "";
      const w = info.side ? (t.w || w0) : "", rep = info.reps ? (t.r || r0) : "";
      e.sets.forEach(x => { if (!x) return; x.sm = info.side ? w : "o"; if (info.reps) { if (rep === "total") x.rm = "t"; else delete x.rm; } });
      if (w !== w0 || rep !== r0) { const f = PT.volFactor(e.name, e.reps, info.side ? (w === "e" ? "each" : "total") : "", info.reps ? rep : ""); if (f > 0) e.dbn = f; }
      s.upd = now;
    });
    return snap;
  }
  function restore(a, snap) {
    const now = Date.now();
    snap.forEach(({ s, e, dbn, sets }) => {
      e.sets.forEach((x, i) => { if (!x || !sets[i]) return; if (sets[i][0] === undefined) delete x.sm; else x.sm = sets[i][0]; if (sets[i][1] === undefined) delete x.rm; else x.rm = sets[i][1]; });
      if (dbn === undefined) delete e.dbn; else e.dbn = dbn;
      s.upd = now;
    });
  }
  function refresh(a) {
    try { a.recomputeVolumes(); a.recomputeSessionPRs && a.recomputeSessionPRs(); a.rebuildPRs && a.rebuildPRs(); } catch (e) { console.error("PulseTrack side / total", e); }
    st.keep = true;
    try { if (lastArgs) a.openExerciseSheet.apply(a, lastArgs); else a.openExerciseSheet(st.name); } catch (e) { }
    try { a.renderHomeView && a.renderHomeView(); } catch (e) { }
  }

  /* ================================================================ the card */
  const btn = (f, v, label, on) => `<button type="button" class="pt-opt pt-xs-b tap-active" data-xs-f="${f}" data-xs-v="${v}" aria-pressed="${on}">${esc(label)}</button>`;
  function paint(a) {
    const card = $("pt-xs-card"); if (!card) return;
    const name = st.name, info = PT.sideInfo(name);
    const wCh = info.side ? PT.sideMode(name) : "", wEff = wCh || (info.side ? PT.sideNow(name) : "");
    const rCh = info.reps ? PT.repMode(name) : "", rEff = rCh || (info.reps ? PT.repNow(name) : "");
    const auto = '<small class="pt-xs-auto"> · auto</small>';
    const wl = info.side ? `<div class="pt-xs-line"><span>Weight${wCh ? "" : auto}</span><div class="flex gap-1.5">${btn("w", "each", info.db ? "Each hand" : "Each side", wEff === "each")}${btn("w", "total", "Total", wEff === "total")}</div></div>` : "";
    const rl = info.reps ? `<div class="pt-xs-line"><span>Reps${rCh ? "" : auto}</span><div class="flex gap-1.5">${btn("r", "each", "Per " + info.hand, rEff === "each")}${btn("r", "total", "Total", rEff === "total")}</div></div>` : "";
    let note = "";
    if (st.done) note = `<div class="pt-xs-note"><span>Changed ${st.done} past workout${st.done === 1 ? "" : "s"}. Levels and records follow.</span><button type="button" data-xs-undo class="tap-active">Undo</button></div>`;
    else if (st.asked) {
      const n = recs(a, name).filter(r => differs(r, info, target(name, info))).length;
      if (n) note = `<div class="pt-xs-note"><span>${n} past workout${n === 1 ? " is" : "s are"} counted the other way.</span><button type="button" data-xs-fix class="tap-active">Change them too</button></div>`;
    }
    card.innerHTML = `<div class="text-xs font-bold text-white">How you type it</div>${wl}${rl}
      <p class="text-[11px] text-zinc-500 leading-snug">${info.side ? (info.db ? "Each hand: the weight of one dumbbell. Total: both together." : "Each side: one stack or one side. Total: everything together.") : "Per " + esc(info.hand) + ": the reps of one " + esc(info.hand) + ". Total: both added up."}</p>${note}`;
  }
  function inject(a, name) {
    const info = PT.sideInfo(name); if (!info.side && !info.reps) return;
    const nb = $("ex-note-edit"), anchor = nb && nb.closest(".bg-zinc-950"); if (!anchor || !anchor.parentNode) return;
    const old = $("pt-xs-card"); if (old) old.remove();
    if (!st.keep || st.name !== name) st = { name };
    st.keep = false;
    const card = document.createElement("div"); card.id = "pt-xs-card"; card.className = "bg-zinc-950 border border-zinc-800 rounded-xl p-3 space-y-2";
    anchor.parentNode.insertBefore(card, anchor);
    paint(a);
  }
  const oEx = proto.openExerciseSheet;
  proto.openExerciseSheet = function (name) {
    lastArgs = Array.prototype.slice.call(arguments);
    const r = oEx.apply(this, arguments);
    try { inject(this, name); } catch (e) { console.error("PulseTrack how you type it", e); }
    return r;
  };

  document.addEventListener("click", e => {
    const a = A(); if (!a || !e.target.closest) return;
    const b = e.target.closest("[data-xs-f]");
    if (b) {
      const v = b.dataset.xsV;
      if (b.dataset.xsF === "w") PT.setSideMode(st.name, v); else PT.setRepMode(st.name, v);
      st.done = 0; st.undo = null; st.asked = true; paint(a); return;
    }
    if (e.target.closest("[data-xs-fix]")) {
      const snap = convert(a, st.name, PT.sideInfo(st.name));
      st.undo = snap; st.done = snap.length; st.asked = false;
      if (snap.length) a.toast("Changed " + snap.length + " workout" + (snap.length === 1 ? "" : "s"));
      refresh(a); return;
    }
    if (e.target.closest("[data-xs-undo]")) {
      if (st.undo) restore(a, st.undo);
      st.undo = null; st.done = 0; st.asked = false;
      a.toast("Back to how they were"); refresh(a);
    }
  });

  const css = document.createElement("style"); css.id = "pt-v264-css";
  css.textContent = `
    .pt-xs-line { display: flex; align-items: center; justify-content: space-between; gap: .5rem; }
    .pt-xs-line > span { font-size: .72rem; font-weight: 700; color: rgb(var(--z300)); }
    .pt-xs-auto { font-size: .62rem; font-weight: 600; color: rgb(var(--z500)); }
    .pt-xs-note { display: flex; align-items: center; justify-content: space-between; gap: .6rem; padding: .5rem .6rem; border-radius: .7rem; background: rgb(var(--a600) / .12); border: 1px solid rgb(var(--a600) / .5); font-size: .72rem; color: rgb(var(--z200)); line-height: 1.25; }
    .pt-xs-note button { flex: 0 0 auto; padding: .4rem .65rem; border-radius: .6rem; background: rgb(var(--a600)); color: #fff; font-weight: 800; font-size: .72rem; }
  `;
  document.head.appendChild(css);
})();
  