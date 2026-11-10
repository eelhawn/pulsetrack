/* =====================================================================
 * PulseTrack 2.76.0: every day of My 6-Day Split that has a Lat Pulldown now opens with it.
 *  - Only Week A's Day 1 was different (Lat Pulldown was the third exercise); Days 4, 8 and 11 already opened with it.
 *  - A copy that already has the 2.75.0 order is moved once: if Day 1 still has exactly the 2.75.0 exercises in the 2.75.0 order
 *    (nothing swapped, added, deleted or edited), the exercises are re-ordered. Their ids do not change, so ticked sets stay where they are.
 *    A Day 1 you changed is left alone and is put right when its week comes round again.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  const proto = ApplicationUI.prototype;
  const MINE = "my_6day_chest_back_legs_sharms";
  const builtin = id => (typeof BUILTIN_PROGRAMS !== "undefined" && Array.isArray(BUILTIN_PROGRAMS)) ? BUILTIN_PROGRAMS.find(x => x && x.id === id) : null;

  // Day 1 of Week A as it was in 2.75.0
  const V275_DAY1 = ["Incline Bench Press", "Decline Bench Press", "Lat Pulldown", "Neutral-Grip (V-Bar) Lat Pulldown", "Dumbbell Bench Press",
    "Dumbbell Row", "Chest Dips", "Barbell Row", "Pec Deck"];

  function upgrade(app) {
    const p = app && app.data && Array.isArray(app.data.programs) ? app.data.programs.find(x => x && x.id === MINE) : null;
    const b = builtin(MINE);
    if (!p || !b || !Array.isArray(p.days) || !Array.isArray(b.days)) return { done: false };
    const d = p.days.find(x => x && x.dayNumber === 1), bd = b.days.find(x => x && x.dayNumber === 1);
    if (!d || !bd || d.removed || d.sharedFrom || !Array.isArray(d.exercises)) return { done: false };
    const want = bd.exercises.map(e => e.name);
    if (d.exercises.length !== want.length || d.exercises.map(e => e && e.name).join("|") !== V275_DAY1.join("|")) return { done: false };   // already new, or changed by hand
    const by = new Map(bd.exercises.map(e => [e.name, e]));
    // nothing swapped, added, deleted or edited: same sets and reps as the program
    const clean = d.exercises.every(e => e && !e.origName && !e.added && e.origSets === undefined && !/^custom_/.test(String(e.id || ""))
      && by.has(e.name) && String(e.sets) === String(by.get(e.name).sets) && String(e.reps) === String(by.get(e.name).reps));
    if (!clean) return { done: false };
    const mine = new Map(d.exercises.map(e => [e.name, e]));
    d.exercises = want.map(n => mine.get(n));
    WorkoutStorage.setData(app.data);
    return { done: true };
  }
  PT.latFirst = { upgrade: () => upgrade(window.app) };

  const oInit = proto.initExtras;
  proto.initExtras = function () {
    const r = oInit ? oInit.apply(this, arguments) : undefined;
    // after 096 has brought an old copy up to date, and once window.app exists
    setTimeout(() => {
      try {
        const res = upgrade(this);
        if (res.done) setTimeout(() => { try { this.toast("Day 1 of your 6-day split now opens with the Lat Pulldown", null, null, 5000); } catch (e) { } }, 2800);
      } catch (e) { console.error("PulseTrack: lat pulldown order skipped", e); }
    }, 0);
    return r;
  };
})();
