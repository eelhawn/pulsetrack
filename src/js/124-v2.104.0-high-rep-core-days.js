/* =====================================================================
 * PulseTrack 2.104.0: high-rep Core & Cardio days in Ilhaan's 3 Day Split.
 *  Every Core & Cardio day (Day 4, 8, 12 ... 64) is now 200-300 reps each of Weighted Decline Sit-Ups, Captain's Chair Leg Raises and
 *  Russian Twists (5 sets of 40-60, 45 s rest), then the StairMaster as before (20 min on Day 4, +2.5 min a Core & Cardio day).
 *  A copy already on a phone is changed once: on each Core & Cardio day the ab exercises are replaced by the three, the StairMaster row is
 *  kept. A Core & Cardio day you already ticked sets on is left as it is, so a logged workout doesn't change. Runs once (settings.coreHighRep).
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  const proto = ApplicationUI.prototype;
  const MINE = "my_6day_chest_back_legs_sharms";
  const clone = o => JSON.parse(JSON.stringify(o));
  const builtin = () => (typeof BUILTIN_PROGRAMS !== "undefined" && Array.isArray(BUILTIN_PROGRAMS)) ? BUILTIN_PROGRAMS.find(x => x && x.id === MINE) : null;
  const isCardio = (app, e) => { try { return !!app.exKind(e).cardio; } catch (err) { return e && e.type === "cardio"; } };
  const anyTicked = (app, d) => (d.exercises || []).some(ex => { for (let s = 0; s < (ex.sets || 0); s++) { const e = app.logs[app.getLogKey(MINE, d.dayNumber, ex.id, s)]; if (e && e.completed) return true; } return false; });

  function upgrade(app) {
    const p = app && app.data && Array.isArray(app.data.programs) ? app.data.programs.find(x => x && x.id === MINE) : null, b = builtin();
    if (!p || !b || p.weekPlan || !Array.isArray(p.days) || p.days.length < 64) return 0;
    let n = 0;
    p.days.forEach(d => {
      if (!d || d.dayNumber % 4 || !/Core & Cardio/.test(String(d.title || "")) || anyTicked(app, d)) return;
      const bd = b.days.find(x => x.dayNumber === d.dayNumber); if (!bd) return;
      const three = bd.exercises.filter(e => !isCardio(app, e)).map(clone);
      const old = (d.exercises || []).filter(e => e && !isCardio(app, e));
      if (old.length === three.length && old.every((e, i) => e.name === three[i].name && e.sets === three[i].sets && e.reps === three[i].reps)) return;
      old.forEach(e => Object.keys(app.logs || {}).forEach(k => { if (k.startsWith(`${MINE}_d${d.dayNumber}_${e.id}_s`)) delete app.logs[k]; }));
      d.exercises = three.concat((d.exercises || []).filter(e => e && isCardio(app, e)));
      if (Array.isArray(d.orig)) d.orig = clone(d.exercises);
      delete d.removed;
      d.estimatedMinutes = bd.estimatedMinutes;
      n++;
    });
    if (/the ab work from the leg day before, then/.test(String(p.description || "")) && b.description) p.description = b.description;
    return n;
  }
  function run(app) {
    if (app.settings.coreHighRep) return 0;
    const n = upgrade(app);
    app.settings.coreHighRep = Date.now();
    try { if (n) { WorkoutStorage.setData(app.data); WorkoutStorage.saveLogs(app.logs); } WorkoutStorage.saveSettings(app.settings); } catch (e) { }
    try { if (n && app.activeProgram && app.activeProgram.id === MINE) { app.activeDay = (app.activeProgram.days || []).find(d => app.activeDay && d.dayNumber === app.activeDay.dayNumber) || app.activeDay; app.renderWorkoutView && app.renderWorkoutView(); } } catch (e) { }
    return n;
  }
  PT.coreHighRep = { run: () => run(window.app) };

  const oInit = proto.initExtras;
  proto.initExtras = function () {
    const r = oInit ? oInit.apply(this, arguments) : undefined;
    setTimeout(() => { try { run(this); } catch (e) { console.error("PulseTrack: high-rep core days skipped", e); } }, 210);   // after 123 (190)
    return r;
  };
})();
