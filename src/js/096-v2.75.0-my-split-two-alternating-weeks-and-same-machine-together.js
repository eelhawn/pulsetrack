/* =====================================================================
 * PulseTrack 2.75.0: My 6-Day Split runs as two alternating weeks, and exercises on the same machine sit together.
 *  - Week A (weeks 1, 3, 5) is days 1-7 and Week B (weeks 2, 4, 6) is days 8-14 (a week plan with two groups).
 *  - A copy of the split that is already on a phone has only the old 7 days. It is brought up to date once:
 *      days you never changed take the new order (and the sets you already logged on them follow their exercise),
 *      days you changed (a swap, an added or deleted exercise, other sets or reps) are left exactly as they are
 *      until the next new week puts them back, and the 7 days of Week B are added with the new week plan.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  const proto = ApplicationUI.prototype;
  const MINE = "my_6day_chest_back_legs_sharms";
  const clone = o => JSON.parse(JSON.stringify(o));
  const builtin = id => (typeof BUILTIN_PROGRAMS !== "undefined" && Array.isArray(BUILTIN_PROGRAMS)) ? BUILTIN_PROGRAMS.find(x => x && x.id === id) : null;
  const canon = n => { try { const e = PT.exCanon(n); return e && e.name ? e.name : n; } catch (er) { return n; } };

  /** a day nobody has touched: the same exercises as the program's day (in any order), nothing swapped, added, deleted or edited */
  function untouched(d, bd) {
    if (!d || !bd || d.removed || d.sharedFrom) return false;
    const a = d.exercises || [], b = bd.exercises || [];
    if (a.length !== b.length) return false;
    const want = new Map(b.map(e => [canon(e.name), e]));
    return a.every(e => {
      if (!e || e.origName || e.added || e.origSets !== undefined || /^custom_/.test(String(e.id || ""))) return false;
      const w = want.get(canon(e.name));
      return !!w && String(e.sets) === String(w.sets) && String(e.reps) === String(w.reps);
    });
  }

  function upgrade(app) {
    const p = app && app.data && Array.isArray(app.data.programs) ? app.data.programs.find(x => x && x.id === MINE) : null;
    const b = builtin(MINE);
    if (!p || !b || !Array.isArray(b.weekPlan) || b.weekPlan.length < 2 || !Array.isArray(p.days) || !Array.isArray(b.days)) return { done: false };
    if (Array.isArray(p.weekPlan) && p.weekPlan.length >= 2) return { done: false };              // already two weeks
    const base = b.baseDays || 7;
    if (p.days.length !== base || !p.days.every((d, i) => d && d.dayNumber === i + 1)) return { done: false };   // rebuilt by hand: leave alone
    const bd = n => b.days.find(d => d.dayNumber === n);

    let renamedLogs = 0, replaced = 0, kept = 0;
    p.days.forEach(d => {
      const nd = bd(d.dayNumber);
      if (!nd) return;
      // the day title in the new style, unless it was renamed by hand
      if (/^Day \d+: /.test(String(d.title || ""))) d.title = nd.title;
      if (!(d.exercises || []).length && !(nd.exercises || []).length) return;                    // the rest day
      if (!untouched(d, nd)) { kept++; return; }
      // sets already ticked on this day follow their exercise to its new id
      const byName = new Map(nd.exercises.map(e => [canon(e.name), e.id]));
      const pre = `${p.id}_d${d.dayNumber}_`, moves = [];
      Object.keys(app.logs || {}).forEach(k => {
        if (!k.startsWith(pre)) return;
        const m = k.slice(pre.length).match(/^(.*)_s(\d+)$/);
        if (!m) return;
        const old = d.exercises.find(e => String(e.id) === m[1]);
        const to = old && byName.get(canon(old.name));
        if (to && to !== m[1]) moves.push([k, pre + to + "_s" + m[2]]);
      });
      const taken = {};
      moves.forEach(([from]) => { taken[from] = app.logs[from]; delete app.logs[from]; });
      moves.forEach(([from, to]) => { app.logs[to] = taken[from]; renamedLogs++; });
      d.exercises = clone(nd.exercises);
      d.estimatedMinutes = nd.estimatedMinutes;
      replaced++;
    });
    // Week B
    b.days.forEach(nd => { if (nd.dayNumber > base && !p.days.some(d => d.dayNumber === nd.dayNumber)) p.days.push(clone(nd)); });
    p.weekPlan = clone(b.weekPlan);
    p.weeks = b.weeks; p.baseDays = b.baseDays;
    if (b.weekReset && p.weekReset === undefined) p.weekReset = true;
    // the longer description only while it is still the one that came with the program
    if (/the same workouts every week/.test(String(p.description || ""))) p.description = b.description;
    if (Array.isArray(b.tags)) p.tags = clone(b.tags);

    WorkoutStorage.setData(app.data);
    if (renamedLogs) WorkoutStorage.saveLogs(app.logs);
    try { app.saveProgState(); } catch (e) { }
    return { done: true, replaced, kept, renamedLogs };
  }
  PT.split2 = { upgrade: () => upgrade(window.app) };

  const oInit = proto.initExtras;
  proto.initExtras = function () {
    const r = oInit ? oInit.apply(this, arguments) : undefined;
    // after the names were made standard (095) and once window.app exists
    setTimeout(() => {
      try {
        const res = upgrade(this);
        if (res.done) {
          try { if (this.activeProgram && this.activeProgram.id === MINE) this.activeDay = this.nextDayOf(this.activeProgram) || this.activeDay; } catch (e) { }
          setTimeout(() => { try { this.toast("Your 6-day split now has two alternating weeks (A and B)", null, null, 6000); } catch (e) { } }, 2800);
        }
      } catch (e) { console.error("PulseTrack: split weeks skipped", e); }
    }, 0);
    return r;
  };
})();
