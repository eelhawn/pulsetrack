/* =====================================================================
 * PulseTrack 2.74.0: each week starts with the original exercises, and the personal split uses the database's names.
 *  - A program with "weekReset: true" (My 6-Day Split) puts every exercise of the new week's days back the way the program has
 *    them when the week changes: finishing a week, "Switch week", or starting over after the last week. Swapped exercises
 *    come back, deleted ones come back, ones you added go, and edited sets and reps return to the program's.
 *    Staying in the same week never touches anything, so a swap made on Monday is still there on Friday.
 *  - The split's exercises are named exactly like the exercise database, so the weight you used last time (kept per exercise
 *    name) shows up for them. A copy already on a phone is renamed once on start-up (history, PRs, notes and last-time
 *    weights follow, the same way Settings → Clean Up Exercise Names does it).
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  const proto = ApplicationUI.prototype;
  const FREE = typeof FREESTYLE_ID !== "undefined" ? FREESTYLE_ID : "freestyle";
  const MINE = "my_6day_chest_back_legs_sharms";
  const builtin = id => (typeof BUILTIN_PROGRAMS !== "undefined" && Array.isArray(BUILTIN_PROGRAMS)) ? BUILTIN_PROGRAMS.find(x => x && x.id === id) : null;

  /* ------------------------------------------------ a new week = the program's own exercises again */
  let busy = false;
  function weekDays(prog, st) {
    const P = PT.weeks && PT.weeks.planOf ? PT.weeks.planOf(prog) : null;
    const all = Array.isArray(prog.days) ? prog.days : [];
    if (P && P.byWeek[st.week]) return P.byWeek[st.week].days.map(n => all.find(d => d && d.dayNumber === n)).filter(Boolean);
    return all;
  }
  function freshWeek(app, prog, st) {
    const sig = st.week + ":" + (st.round || 1);
    if (st.rw === sig) return;
    if (st.rw === undefined) { st.rw = sig; return; }                            // the first time this phone sees it: count from here, change nothing (saved with the next progress save)
    busy = true;
    try {
      st.rw = sig;
      const clear = app.settings.resetAfterFinish !== false;                       // the same switch as "Finish keeps logged sets or not"
      let changed = false;
      weekDays(prog, st).forEach(d => {
        if (clear) app.clearDayLogs(prog, d);
        if (app.restoreDay(prog, d)) changed = true;
        if (clear) app.clearDayLogs(prog, d);
      });
      if (clear) WorkoutStorage.saveLogs(app.logs);
      if (changed) WorkoutStorage.setData(app.data);
      app.saveProgState();
      if (changed) { try { app.toast(`Week ${st.week}: the original exercises are back`); } catch (e) { } }
    } finally { busy = false; }
  }
  const oGet = proto.getProgState;
  proto.getProgState = function (prog) {
    const st = oGet.apply(this, arguments);
    if (prog && prog.weekReset && !busy && prog.id !== FREE && st) {
      try { freshWeek(this, prog, st); } catch (e) { busy = false; console.error("PulseTrack: new week", e); }
    }
    return st;
  };

  /* ------------------------------------------------ a copy of the split already on this phone */
  function namesIn(prog) {
    const out = new Set();
    const add = e => { if (e && typeof e === "object") { if (typeof e.name === "string") out.add(e.name); if (typeof e.origName === "string") out.add(e.origName); } };
    (prog.days || []).forEach(d => {
      if (!d) return;
      (d.exercises || []).forEach(add); (d.orig || []).forEach(add); (d.removed || []).forEach(r => r && add(r.ex));
    });
    return out;
  }
  function upgrade(app) {
    const p = app && app.data && Array.isArray(app.data.programs) ? app.data.programs.find(x => x && x.id === MINE) : null;
    const b = builtin(MINE);
    if (!p || !b) return { flag: false, renamed: 0 };
    let flag = false;
    if (b.weekReset && p.weekReset === undefined) { p.weekReset = true; flag = true; WorkoutStorage.setData(app.data); }
    const map = {};
    namesIn(p).forEach(n => {
      let c = null;
      try { c = PT.exCanon(n); } catch (e) { }
      if (c && c.name && c.name !== n) map[n] = c.name;
    });
    const n = Object.keys(map).length;
    if (n && PT.cleanup && PT.cleanup.apply) PT.cleanup.apply(map);
    return { flag, renamed: n, map };
  }
  PT.split = { upgrade: () => upgrade(window.app), fresh: (prog, st) => freshWeek(window.app, prog, st) };

  const oInit = proto.initExtras;
  proto.initExtras = function () {
    const r = oInit ? oInit.apply(this, arguments) : undefined;
    // window.app does not exist yet while the app is being built, and the rename needs it: do it a moment later
    setTimeout(() => {
      try {
        const res = upgrade(this);
        if (res.renamed) setTimeout(() => { try { this.toast("Your 6-day split now uses the standard exercise names, so earlier weights show up", null, null, 6000); } catch (e) { } }, 1200);
      } catch (e) { console.error("PulseTrack: split upgrade skipped", e); }
    }, 0);
    return r;
  };
})();
