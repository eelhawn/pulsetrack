/* =====================================================================
 * PulseTrack 2.91.2: no front raises on the shoulder days of My 6-Day Split.
 *  The three Sharms shoulder days (Day 3, Day 6 and Day 10) no longer have front raises: programs.js doesn't list them, and
 *  a copy of the program already on a phone is cleaned once, here: the front raise is taken out of those days, out of the
 *  "put it back the way the program has it" copy (day.orig) and out of the deleted-exercise list (day.removed), so it can't
 *  come back when the week changes. Day 13 never had one. Your logged workouts, records and last-time weights are not touched,
 *  and you can still add a front raise by hand any time.
 *  Runs once (settings.noFrontRaises). Only front raises in those three days of that program are removed.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  const proto = ApplicationUI.prototype;
  const MINE = "my_6day_chest_back_legs_sharms";
  const DAYS = [3, 6, 10];
  const isFront = ex => !!ex && /front[\s-]*raise/i.test(String(ex.name || "")) || !!ex && /_d\d+_[^_]*front-raise/i.test(String(ex.id || ""));
  const keep = ex => !isFront(ex);

  function clean(app) {
    const p = app && app.data && Array.isArray(app.data.programs) ? app.data.programs.find(x => x && x.id === MINE) : null;
    if (!p || !Array.isArray(p.days)) return 0;
    let n = 0;
    p.days.forEach(d => {
      if (!d || DAYS.indexOf(d.dayNumber) < 0) return;
      [["exercises", x => x], ["orig", x => x], ["removed", x => x && x.ex]].forEach(([k, get]) => {
        if (!Array.isArray(d[k])) return;
        const before = d[k].length;
        d[k] = d[k].filter(x => keep(get(x)));
        n += before - d[k].length;
      });
      if (Array.isArray(d.removed) && !d.removed.length) delete d.removed;
      // logged sets of a front raise that is gone (a half-logged day) would hang around with no row
      const pre = MINE + "_d" + d.dayNumber + "_";
      Object.keys(app.logs || {}).forEach(k => { if (k.startsWith(pre) && /^[^_]*front-raise/i.test(k.slice(pre.length)) && !app.logs[k].completed) { delete app.logs[k]; } });
    });
    return n;
  }
  function run(app) {
    if (app.settings.noFrontRaises) return 0;
    const n = clean(app);
    app.settings.noFrontRaises = Date.now();
    try { if (n) WorkoutStorage.setData(app.data); WorkoutStorage.saveSettings(app.settings); WorkoutStorage.saveLogs(app.logs); } catch (e) { }
    try { if (n && app.activeProgram && app.activeProgram.id === MINE) { app.activeDay = (app.activeProgram.days || []).find(d => app.activeDay && d.dayNumber === app.activeDay.dayNumber) || app.activeDay; app.renderWorkoutView && app.renderWorkoutView(); } } catch (e) { }
    return n;
  }
  PT.noFront = { run: () => run(window.app), clean: () => clean(window.app) };

  const oInit = proto.initExtras;
  proto.initExtras = function () {
    const r = oInit ? oInit.apply(this, arguments) : undefined;
    setTimeout(() => { try { run(this); } catch (e) { console.error("PulseTrack: front raise clean-up skipped", e); } }, 0);
    return r;
  };
})();
