/* =====================================================================
 * PulseTrack 2.92.0: My 6-Day Split runs as 3 days on, 1 day off, all in one program.
 *  Every week is now 8 days: Day 1-3 train, Day 4 rest, Day 5-7 train, Day 8 rest. It still runs 6 weeks with Week A (1, 3, 5) and
 *  Week B (2, 4, 6), so you do the same 36 workouts as before, with two rest days in every week instead of one.
 *  - The program has two new rest days (15 and 16) and Day 7 / Day 14 moved to the middle of the week (the 4th day).
 *  - Each week is labelled Day 1 to Day 8 (the program's dayLabels), also on the Home card, the week badge, sharing and the calendar.
 *  - A copy of the program already on a phone is brought up to date once: the week plan, the two new rest days, the new day names and the
 *    description. Your exercises, swaps, sets and reps, ticked sets, history and records are not touched. Day names you changed by hand
 *    stay as you wrote them. Progress ("week 3, 2 days done") carries on from where it was.
 *  Runs once (settings.split3on1). Only My 6-Day Split is changed.
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
    if (!p || !b || !Array.isArray(p.days) || !Array.isArray(b.days) || !Array.isArray(b.weekPlan)) return { done: false };
    if (!Array.isArray(p.weekPlan) || p.weekPlan.length < 2) return { done: false };           // still the 7-day copy: 096 brings it up first
    if (p.days.some(d => d && d.dayNumber === 15) && p.baseDays === b.baseDays) return { done: false };   // already 3 on, 1 off
    let titles = 0, added = 0;
    b.days.forEach(nd => {
      const d = p.days.find(x => x && x.dayNumber === nd.dayNumber);
      if (!d) { p.days.push(clone(nd)); added++; return; }
      // the day name in the new numbering, unless you renamed the day yourself
      if (/^W\d[W\d &]* - Day \d+: /.test(String(d.title || "")) && d.title !== nd.title) { d.title = nd.title; titles++; }
    });
    // the days list shows the days in the order of the array, a week after the other: Week A's 8 days, then Week B's 8
    const order = [].concat(...b.weekPlan.map(g => g.days)), at = n => { const i = order.indexOf(n); return i < 0 ? 999 + n : i; };
    p.days.sort((x, y) => at(x.dayNumber) - at(y.dayNumber));
    p.weekPlan = clone(b.weekPlan);
    p.baseDays = b.baseDays;
    p.dayLabels = b.dayLabels;                    // "Day 1" to "Day 8" in each week, whatever the stored number
    if (Array.isArray(b.tags)) p.tags = clone(b.tags);
    // the new description only while it is still the one that came with the program
    if (/two alternating weeks/.test(String(p.description || "")) && !/3 days|three training days/.test(String(p.description || ""))) p.description = b.description;
    app.settings.split3on1 = Date.now();
    WorkoutStorage.setData(app.data);
    try { WorkoutStorage.saveSettings(app.settings); } catch (e) { }
    try { app.saveProgState(); } catch (e) { }
    return { done: true, added, titles };
  }
  PT.split3 = { upgrade: () => upgrade(window.app) };

  const oInit = proto.initExtras;
  proto.initExtras = function () {
    const r = oInit ? oInit.apply(this, arguments) : undefined;
    setTimeout(() => {   // after 096 has added Week B to an old copy
      try {
        if (this.settings.split3on1) return;
        const res = upgrade(this);
        if (res.done) {
          try { if (this.activeProgram && this.activeProgram.id === MINE) { this.activeDay = this.nextDayOf(this.activeProgram) || this.activeDay; } } catch (e) { }
          setTimeout(() => { try { this.toast("Your 6-day split is now 3 days on, 1 day off", null, null, 6000); } catch (e) { } }, 3200);
        }
      } catch (e) { console.error("PulseTrack: 3 on 1 off skipped", e); }
    }, 20);
    return r;
  };
})();
