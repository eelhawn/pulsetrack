/* =====================================================================
 * PulseTrack 2.76.0: every day of My 6-Day Split that has a Lat Pulldown now opens with it. (2.78.0: the Straight-Arm Pulldown goes last on Day 4.)
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

  // days of Week A as they were before they were re-ordered: Day 1 in 2.75.0 (lat pulldown third), Day 4 up to 2.77.0 (straight-arm pulldown second)
  const MOVES = [
    { day: 1, from: ["Incline Bench Press", "Decline Bench Press", "Lat Pulldown", "Neutral-Grip (V-Bar) Lat Pulldown", "Dumbbell Bench Press", "Dumbbell Row", "Chest Dips", "Barbell Row", "Pec Deck"] },
    { day: 4, from: ["Lat Pulldown", "Straight-Arm Pulldown", "Incline Dumbbell Press", "Deadlift", "Smith Machine Flat Press", "Iso-Lateral Plate-Loaded Low Row", "Decline Bench Press", "Cable Seated Rows (Wide Bar)", "Machine Chest Dips", "Incline Dumbbell Flyes"] }
  ];

  // 2.91.3: Machine Chest Dips is now Iso-Lateral Plate-Loaded Machine Dip: a copy with either name counts as the old order
  const norm = n => n === "Machine Chest Dips" ? "Iso-Lateral Plate-Loaded Machine Dip" : n;
  function reorder(app, p, b, mv) {
    const d = p.days.find(x => x && x.dayNumber === mv.day), bd = b.days.find(x => x && x.dayNumber === mv.day);
    if (!d || !bd || d.removed || d.sharedFrom || !Array.isArray(d.exercises)) return false;
    const want = bd.exercises.map(e => e.name);
    if (d.exercises.length !== want.length || d.exercises.map(e => e && norm(e.name)).join("|") !== mv.from.map(norm).join("|")) return false;   // already new, or changed by hand
    const by = new Map(bd.exercises.map(e => [e.name, e]));
    // nothing swapped, added, deleted or edited: same sets and reps as the program
    const clean = d.exercises.every(e => e && !e.origName && !e.added && e.origSets === undefined && !/^custom_/.test(String(e.id || ""))
      && by.has(norm(e.name)) && String(e.sets) === String(by.get(norm(e.name)).sets) && String(e.reps) === String(by.get(norm(e.name)).reps));
    if (!clean) return false;
    const mine = new Map(d.exercises.map(e => [norm(e.name), e]));
    d.exercises = want.map(n => mine.get(n));
    return true;
  }
  function upgrade(app) {
    const p = app && app.data && Array.isArray(app.data.programs) ? app.data.programs.find(x => x && x.id === MINE) : null;
    const b = builtin(MINE);
    if (!p || !b || !Array.isArray(p.days) || !Array.isArray(b.days)) return { done: false };
    const days = MOVES.filter(mv => reorder(app, p, b, mv)).map(mv => mv.day);
    if (!days.length) return { done: false };
    WorkoutStorage.setData(app.data);
    return { done: true, days };
  }
  PT.latFirst = { upgrade: () => upgrade(window.app) };

  const oInit = proto.initExtras;
  proto.initExtras = function () {
    const r = oInit ? oInit.apply(this, arguments) : undefined;
    // after 096 has brought an old copy up to date, and once window.app exists
    setTimeout(() => {
      try {
        const res = upgrade(this);
        if (res.done) setTimeout(() => { try { this.toast(`Day ${res.days.join(" and ")} of your 6-day split ${res.days.length > 1 ? "were" : "was"} re-ordered`, null, null, 5000); } catch (e) { } }, 2800);
      } catch (e) { console.error("PulseTrack: lat pulldown order skipped", e); }
    }, 0);
    return r;
  };
})();
