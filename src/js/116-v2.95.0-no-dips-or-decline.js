/* =====================================================================
 * PulseTrack 2.95.0: one of dips / decline on every Chest & Back day of My 6-Day Split.
 *  The first Chest & Back day of each free-weight block (Day 1, 17, 33, 49) has no Chest Dips; the second (Day 5, 21, 37, 53) has no
 *  Decline Bench Press. The machine blocks (Day 9, 25, 41, 57 / Day 13, 29, 45, 61): Day 9 and its copies never had dips, so they keep their
 *  decline press, and since 2.99.0 Day 13 and its copies keep their Smith Machine Decline Press too.
 *  A copy already on a phone is cleaned once: the exercise is taken out of the day (and out of its "put it back" copy and the deleted list).
 *  If you already ticked sets of that exercise on that day, it stays so your logged workout is not changed. Logged history, records and
 *  last-time weights are not touched, and you can still add either lift by hand. Runs once (settings.noDipsDecline).
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  const proto = ApplicationUI.prototype;
  const MINE = "my_6day_chest_back_legs_sharms";
  const LIST = [];
  for (let k = 0; k < 8; k++) {
    if (k % 2 === 0) LIST.push([8 * k + 1, "Chest Dips"], [8 * k + 5, "Decline Bench Press"]);
    // 2.99.0: the Smith Machine Decline Press stays on Day 13 and its repeats (module 120 puts it back where this took it out)
  }
  const hasTicked = (app, day, ex) => { for (let s = 0; s < (ex.sets || 0); s++) { const e = app.logs[app.getLogKey(MINE, day.dayNumber, ex.id, s)]; if (e && e.completed) return true; } return false; };

  function clean(app) {
    const p = app && app.data && Array.isArray(app.data.programs) ? app.data.programs.find(x => x && x.id === MINE) : null;
    if (!p || p.weekPlan || !Array.isArray(p.days) || p.days.length < 64) return 0;
    let n = 0;
    LIST.forEach(([dn, name]) => {
      const d = p.days.find(x => x && x.dayNumber === dn); if (!d) return;
      const ex = (d.exercises || []).find(e => e && e.name === name); if (!ex || hasTicked(app, d, ex)) return;
      const id = ex.id;
      d.exercises = d.exercises.filter(e => e !== ex);
      if (Array.isArray(d.orig)) d.orig = d.orig.filter(e => !e || e.id !== id);
      if (Array.isArray(d.removed)) { d.removed = d.removed.filter(r => !(r && r.ex && r.ex.id === id)); if (!d.removed.length) delete d.removed; }
      Object.keys(app.logs || {}).forEach(k => { if (k.startsWith(`${MINE}_d${dn}_${id}_s`)) delete app.logs[k]; });
      n++;
    });
    return n;
  }
  function run(app) {
    if (app.settings.noDipsDecline) return 0;
    const n = clean(app);
    app.settings.noDipsDecline = Date.now();
    try { if (n) { WorkoutStorage.setData(app.data); WorkoutStorage.saveLogs(app.logs); } WorkoutStorage.saveSettings(app.settings); } catch (e) { }
    try { if (n && app.activeProgram && app.activeProgram.id === MINE) { app.activeDay = (app.activeProgram.days || []).find(d => app.activeDay && d.dayNumber === app.activeDay.dayNumber) || app.activeDay; app.renderWorkoutView && app.renderWorkoutView(); } } catch (e) { }
    return n;
  }
  PT.noDips = { run: () => run(window.app), LIST };

  const oInit = proto.initExtras;
  proto.initExtras = function () {
    const r = oInit ? oInit.apply(this, arguments) : undefined;
    setTimeout(() => { try { run(this); } catch (e) { console.error("PulseTrack: dips / decline clean-up skipped", e); } }, 130);   // after the 2.94 clean-ups
    return r;
  };
})();
