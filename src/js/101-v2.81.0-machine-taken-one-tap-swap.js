/* =====================================================================
 * PulseTrack 2.81.0: "machine's taken" one tap swap.
 *  Someone is on the lat pulldown. Instead of opening the swap list, tap the small "🔁 Taken?" button on the exercise:
 *  - it swaps in the closest match from Similar exercises, one that is not already in today's workout and, when there is one, on
 *    different equipment (a second machine of the same kind is usually taken too). Sets, reps and the order of your day stay as they are.
 *  - the numbers on that card are refilled from the new exercise's own history (the suggested weights), and Undo is in the toast.
 *  - "🔁" next to it tries the next closest, "↩ <the original>" goes back.
 *  - it is a loan for one day: the next day you open the app the original is back by itself (unless you already ticked a set on the swap).
 *    Swapping with the normal swap button is still permanent, and a normal swap after a "Taken?" cancels the automatic switch back.
 *  - Settings → Workout screen has a switch: "Machine taken? button" (on by default). It shows on machines, cables, barbells and the Smith machine.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined" || !PT.nextTarget || !PT.equipKey) return;
  const proto = ApplicationUI.prototype;
  const A = () => window.app;
  const esc = s => PT.esc(s);
  const blank = v => v === undefined || v === null || String(v).trim() === "";
  const GEAR = new Set(["machine", "cable", "barbell", "ezbar", "smith"]);
  const isFree = prog => typeof FREESTYLE_ID !== "undefined" && prog && prog.id === FREESTYLE_ID;
  const logKey = (app, prog, day, ex, s) => app.getLogKey(prog.id, day.dayNumber, ex.id, s);
  const prefixOf = (prog, day, ex) => `${prog.id}_d${day.dayNumber}_${ex.id}_s`;
  const tried = {};                                   // names offered so far for one exercise, so "Another" does not repeat itself
  let busy = false;                                   // true while this module is swapping (so the normal-swap rule below ignores it)
  const triedKey = (prog, day, ex) => prefixOf(prog, day, ex);

  /** the log keys of this exercise's sets */
  const keysOf = (app, prog, day, ex) => { const pre = prefixOf(prog, day, ex); return Object.keys(app.logs || {}).filter(k => k.startsWith(pre) && /^\d+$/.test(k.slice(pre.length))); };
  /** a set was ticked off, so the exercise is under way and is left alone */
  const started = (app, prog, day, ex) => keysOf(app, prog, day, ex).some(k => app.logs[k] && app.logs[k].completed);
  /** numbers typed or pre-filled but not ticked belong to the old exercise, so they go; returns what was removed (for Undo) */
  function dropOpen(app, prog, day, ex) {
    const out = [];
    keysOf(app, prog, day, ex).forEach(k => { const e = app.logs[k]; if (e && !e.completed) { out.push({ key: k, prev: JSON.stringify(e) }); delete app.logs[k]; } });
    return out;
  }
  /** the suggested weights of the exercise as it is now, into its empty sets (same step up as the card's "Last time ... try ..." line) */
  function refill(app, prog, day, ex) {
    if (!PT.opt("autoPrefill") || isFree(prog)) return 0;
    let t = null; try { t = PT.nextTarget(ex); } catch (e) { t = null; }
    if (!t || !t.per || !t.per.length) return 0;
    let n = 0;
    for (let s = 0; s < Math.min(ex.sets || 0, t.cap || 99); s++) {
      const k = logKey(app, prog, day, ex, s), e = app.logs[k];
      if (e && (e.completed || !blank(e.weight) || !blank(e.reps))) continue;
      const p = t.per[s] || t.per[t.per.length - 1];
      app.logs[k] = { completed: false, weight: p.w ? String(p.w) : (p.bz ? "0" : ""), reps: String(p.r), tag: "R" }; n++;
    }
    return n;
  }
  const saveAll = app => { try { WorkoutStorage.saveLogs(app.logs); } catch (e) { } try { WorkoutStorage.setData(app.data); } catch (e) { } };

  /** the closest matches for what was planned, not already in this day: different equipment first, then the same kind */
  function candidates(app, ex) {
    const orig = ex.origName || ex.name, base = PT.equipKey(orig);
    const inDay = new Set((app.activeDay.exercises || []).map(e => e.name));
    let list = [];
    try { list = app.swapSuggestions(orig, 16) || []; } catch (e) { list = []; }
    list = list.filter(s => s && s.name && s.name !== orig && !inDay.has(s.name) && !(PT.cardioKind && PT.cardioKind(s.name)));
    const diff = list.filter(s => PT.equipKey(s.name) !== base), same = list.filter(s => PT.equipKey(s.name) === base);
    return diff.concat(same);
  }
  function pick(app, prog, day, ex) {
    const list = candidates(app, ex); if (!list.length) return null;
    const key = triedKey(prog, day, ex), seen = tried[key] || (tried[key] = []);
    let c = list.find(s => !seen.includes(s.name));
    if (!c) { seen.length = 0; c = list[0]; }
    seen.push(c.name);
    return c;
  }

  /* ----------------------------------------------------------------- the swap, its Undo and the way back */
  function snapshot(app, prog, day, ex) {
    return { name: ex.name, origName: ex.origName, takenOn: ex.takenOn, logs: keysOf(app, prog, day, ex).map(k => ({ key: k, prev: JSON.stringify(app.logs[k]) })) };
  }
  function undo(app, ex, snap, prog, day) {
    ex.name = snap.name;
    ["origName", "takenOn"].forEach(f => { if (snap[f] === undefined) delete ex[f]; else ex[f] = snap[f]; });
    keysOf(app, prog, day, ex).forEach(k => { delete app.logs[k]; });
    snap.logs.forEach(x => { app.logs[x.key] = JSON.parse(x.prev); });
    saveAll(app); app.renderWorkoutView();
  }
  function swapTo(app, ex, index, name) {
    const prog = app.activeProgram, day = app.activeDay, snap = snapshot(app, prog, day, ex);
    dropOpen(app, prog, day, ex);
    ex.takenOn = PT.ds();
    app.exerciseModalTarget = { action: "swap", index };
    const render = app.renderWorkoutView;
    busy = true; app.renderWorkoutView = function () { };        // swap, but draw the card once, after the numbers are in
    try { app.handleExerciseSelection(name); } finally { delete app.renderWorkoutView; busy = false; }
    if (ex.name === (ex.origName || "")) { delete ex.origName; delete ex.takenOn; }     // picked the original again: nothing is on loan
    const n = refill(app, prog, day, ex);
    saveAll(app); app.renderWorkoutView();
    app.toast(`${ex.name}${n ? " · numbers filled in" : ""}`, "Undo", () => undo(app, ex, snap, prog, day), 6500);
  }
  function taken(app, index, another) {
    const prog = app.activeProgram, day = app.activeDay, ex = day && day.exercises[index];
    if (!ex || started(app, prog, day, ex)) return;
    const c = pick(app, prog, day, ex);
    if (!c) { app.toast("No other exercise fits here"); return; }
    swapTo(app, ex, index, c.name);
  }
  function back(app, index) {
    const prog = app.activeProgram, day = app.activeDay, ex = day && day.exercises[index];
    if (!ex || !ex.origName || started(app, prog, day, ex)) return;
    const snap = snapshot(app, prog, day, ex);
    dropOpen(app, prog, day, ex);
    ex.name = ex.origName; delete ex.origName; delete ex.takenOn; delete tried[triedKey(prog, day, ex)];
    refill(app, prog, day, ex);
    saveAll(app); app.renderWorkoutView();
    app.toast(`Back to ${ex.name}`, "Undo", () => undo(app, ex, snap, prog, day), 5000);
  }

  /* ----------------------------------------------------------------- the card's button */
  const shortName = n => (n.length > 22 ? n.slice(0, 21).trimEnd() + "…" : n);
  PT.takenChip = function (app, ex, i) {
    try {
      if (!PT.opt("takenBtn") || !app || !ex || ex.type === "tabata" || isFree(app.activeProgram) || !app.activeDay) return "";
      if (started(app, app.activeProgram, app.activeDay, ex)) return "";
      if (ex.takenOn && ex.origName) {
        return `<button type="button" class="pt-taken pt-taken-back tap-active" data-exindex="${i}" data-act="back" title="Go back to ${esc(ex.origName)}" aria-label="Go back to ${esc(ex.origName)}">↩ ${esc(shortName(ex.origName))}</button>`
          + `<button type="button" class="pt-taken tap-active" data-exindex="${i}" data-act="taken" title="Try the next closest exercise" aria-label="Try another exercise">🔁</button>`;
      }
      if (!GEAR.has(PT.equipKey(ex.name)) || (PT.cardioKind && PT.cardioKind(ex.name, ex.reps, ex.type))) return "";
      return `<button type="button" class="pt-taken tap-active" data-exindex="${i}" data-act="taken" title="Machine taken? Swap in the closest match for today" aria-label="Machine taken, swap in the closest match">🔁 Taken?</button>`;
    } catch (e) { return ""; }
  };
  document.addEventListener("click", e => {
    const b = e.target.closest && e.target.closest(".pt-taken"); if (!b) return;
    const a = A(); if (!a || !a.activeDay) return;
    const i = parseInt(b.dataset.exindex, 10); if (!(i >= 0)) return;
    e.preventDefault(); e.stopPropagation();
    try { if (b.dataset.act === "back") back(a, i); else taken(a, i); } catch (err) { console.error("PulseTrack machine taken", err); }
  }, true);

  /* a normal swap is on purpose, so it stays: it cancels the switch back */
  const oSel = proto.handleExerciseSelection;
  proto.handleExerciseSelection = function () {
    try {
      const t = this.exerciseModalTarget;
      if (!busy && t && t.action === "swap" && this.activeDay) { const ex = this.activeDay.exercises[t.index]; if (ex) delete ex.takenOn; }
    } catch (e) { }
    return oSel.apply(this, arguments);
  };

  /* ----------------------------------------------------------------- back by itself the next day */
  /** puts every swap from an earlier day back to the exercise the program has; returns the names that came back */
  function sweep(app) {
    const today = PT.ds(), restored = [];
    ((app.data && app.data.programs) || []).forEach(prog => (prog.days || []).forEach(day => (day.exercises || []).forEach(ex => {
      if (!ex || !ex.takenOn) return;
      if (!ex.origName) { delete ex.takenOn; return; }
      if (String(ex.takenOn) >= today) return;                                       // still the same day
      if (app.activeDay === day && app.sessionStartTime) return;                     // a workout that ran past midnight
      if (started(app, prog, day, ex)) return;                                       // a set was ticked on it: leave the record straight
      dropOpen(app, prog, day, ex);
      ex.name = ex.origName; delete ex.origName; delete ex.takenOn; delete tried[triedKey(prog, day, ex)];
      refill(app, prog, day, ex);
      restored.push(ex.name);
    })));
    if (restored.length) saveAll(app);
    return restored;
  }
  PT.taken = { sweep: () => sweep(A()), candidates: ex => candidates(A(), ex), swap: i => taken(A(), i), back: i => back(A(), i) };

  const oRender = proto.renderWorkoutView;
  proto.renderWorkoutView = function () {
    try { const b = sweep(this); if (b.length && this.activeDay) setTimeout(() => { try { this.toast(b.length === 1 ? `Back to ${b[0]}` : `${b.length} exercises are back to your program`); } catch (e) { } }, 300); } catch (e) { console.error("PulseTrack machine taken sweep", e); }
    return oRender.apply(this, arguments);
  };
  setTimeout(() => { try { const a = A(); if (a && a.data) sweep(a); } catch (e) { } }, 0);

  const css = document.createElement("style"); css.id = "pt-v281-css";
  css.textContent = `
    .pt-taken { padding: .25rem .5rem; border-radius: .5rem; background: rgb(var(--z800) / .7); border: 1px solid rgb(var(--a500) / .45); color: rgb(var(--a400)); font-size: .75rem; font-weight: 700; line-height: 1rem; max-width: 11rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .pt-taken-back { border-color: rgb(var(--z700)); color: rgb(var(--z300)); }
  `;
  document.head.appendChild(css);
})();
