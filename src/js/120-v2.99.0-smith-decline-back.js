/* =====================================================================
 * PulseTrack 2.99.0: the Smith Machine Decline Press is back on Day 13 of My 6-Day Split and on its repeats (Day 29, 45 and 61).
 *  2.95.0 took it out; a copy already on a phone gets it back once, in its old place (after the Barbell Row, or at the end if that isn't
 *  there), with 3 sets of 8-10. A day that already has it (you added it back by hand) is left alone. Runs once (settings.smithDeclineBack).
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  const proto = ApplicationUI.prototype;
  const MINE = "my_6day_chest_back_legs_sharms", NAME = "Smith Machine Decline Press", DAYS = [13, 29, 45, 61];

  function add(app) {
    const p = app && app.data && Array.isArray(app.data.programs) ? app.data.programs.find(x => x && x.id === MINE) : null;
    if (!p || p.weekPlan || !Array.isArray(p.days) || p.days.length < 64) return 0;
    let n = 0;
    DAYS.forEach(dn => {
      const d = p.days.find(x => x && x.dayNumber === dn); if (!d || !Array.isArray(d.exercises)) return;
      if (d.exercises.some(e => e && (e.name === NAME || (PT.sameEx && PT.sameEx(e.name, NAME))))) return;
      const ex = { id: `${MINE}_d${dn}_smith-machine-decline-press`, name: NAME, sets: 3, reps: "8-10", restSeconds: 90, type: "standard" };
      const at = d.exercises.findIndex(e => e && e.name === "Barbell Row");
      d.exercises.splice(at >= 0 ? at + 1 : d.exercises.length, 0, ex);
      if (Array.isArray(d.orig) && !d.orig.some(e => e && e.name === NAME)) { const j = d.orig.findIndex(e => e && e.name === "Barbell Row"); d.orig.splice(j >= 0 ? j + 1 : d.orig.length, 0, JSON.parse(JSON.stringify(ex))); }
      if (Array.isArray(d.removed)) { d.removed = d.removed.filter(r => !(r && r.ex && r.ex.name === NAME)); if (!d.removed.length) delete d.removed; }
      n++;
    });
    return n;
  }
  function run(app) {
    if (app.settings.smithDeclineBack) return 0;
    const n = add(app);
    app.settings.smithDeclineBack = Date.now();
    try { if (n) WorkoutStorage.setData(app.data); WorkoutStorage.saveSettings(app.settings); } catch (e) { }
    try { if (n && app.activeProgram && app.activeProgram.id === MINE) { app.activeDay = (app.activeProgram.days || []).find(d => app.activeDay && d.dayNumber === app.activeDay.dayNumber) || app.activeDay; app.renderWorkoutView && app.renderWorkoutView(); } } catch (e) { }
    return n;
  }
  PT.smithBack = { run: () => run(window.app) };

  const oInit = proto.initExtras;
  proto.initExtras = function () {
    const r = oInit ? oInit.apply(this, arguments) : undefined;
    setTimeout(() => { try { run(this); } catch (e) { console.error("PulseTrack: Smith decline put-back skipped", e); } }, 150);   // after 116 (130)
    return r;
  };
})();
