/* =====================================================================
 * PulseTrack 2.93.0: My 6-Day Split runs 8 weeks (it was 6).
 *  Week A is now weeks 1, 3, 5 and 7, Week B weeks 2, 4, 6 and 8: the same 12 workouts, 48 in all.
 *  8 weeks of 8 days is 64 days, nine weeks and a day, so the last rest day (Day 8 of week 8) falls on the same weekday you started on:
 *  start on a Saturday or Sunday and the program ends on a Saturday or Sunday. The program doesn't look at the calendar, so this is up to
 *  the day you start (the description says so).
 *  A copy already on a phone is changed once: its length, the two week groups, the tag and the description (only while the description is
 *  still the one that came with the program). Exercises, swaps, ticked sets, history and records are not touched, and your progress
 *  (week 3, 2 days done) carries on. Runs once (settings.split8wk). Only My 6-Day Split is changed.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  const proto = ApplicationUI.prototype;
  const MINE = "my_6day_chest_back_legs_sharms";
  const clone = o => JSON.parse(JSON.stringify(o));
  const builtin = id => (typeof BUILTIN_PROGRAMS !== "undefined" && Array.isArray(BUILTIN_PROGRAMS)) ? BUILTIN_PROGRAMS.find(x => x && x.id === id) : null;

  function upgrade(app) {
    const p = app && app.data && Array.isArray(app.data.programs) ? app.data.programs.find(x => x && x.id === MINE) : null;
    const b = builtin(MINE);
    if (!p || !b || !Array.isArray(b.weekPlan) || !Array.isArray(p.weekPlan) || p.weekPlan.length < 2) return { done: false };   // 096 / 112 bring an old copy up first
    if (p.weeks === b.weeks && p.weekPlan.every((g, i) => b.weekPlan[i] && String(g.weeks) === String(b.weekPlan[i].weeks))) return { done: false };
    p.weeks = b.weeks;
    p.weekPlan.forEach((g, i) => { if (b.weekPlan[i]) g.weeks = clone(b.weekPlan[i].weeks); });
    if (Array.isArray(p.tags)) p.tags = p.tags.map(t => t === "6 Weeks" ? "8 Weeks" : t);
    if (/over 6 weeks of 8 days/.test(String(p.description || ""))) p.description = b.description;
    app.settings.split8wk = Date.now();
    WorkoutStorage.setData(app.data);
    try { WorkoutStorage.saveSettings(app.settings); } catch (e) { }
    try { app.saveProgState(); } catch (e) { }
    return { done: true };
  }
  PT.split8 = { upgrade: () => upgrade(window.app) };

  const oInit = proto.initExtras;
  proto.initExtras = function () {
    const r = oInit ? oInit.apply(this, arguments) : undefined;
    setTimeout(() => {   // after 096 and 112
      try {
        if (this.settings.split8wk) return;
        if (upgrade(this).done) setTimeout(() => { try { this.toast("Your 6-day split now runs 8 weeks", null, null, 6000); } catch (e) { } }, 3600);
      } catch (e) { console.error("PulseTrack: 8 week split skipped", e); }
    }, 40);
    return r;
  };
})();
