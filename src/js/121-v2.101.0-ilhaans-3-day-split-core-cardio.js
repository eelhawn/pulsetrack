/* =====================================================================
 * PulseTrack 2.101.0: "Ilhaan's 3 Day Split", with Core & Cardio days.
 *  My 6-Day Split is renamed Ilhaan's 3 Day Split. The ab work leaves the leg days (now "Legs & Calves") and moves to the day after the
 *  next Sharms day, which used to be a rest day and is now "Core & Cardio": the two ab exercises, then 20-30 minutes of Incline Treadmill
 *  Walk. So Day 4, 8, 12 ... 64 are Core & Cardio days and there are no plain rest days left.
 *  A copy already on a phone is changed once:
 *   - the name, tags and description (only where they are still the ones that came with the program; your own name stays);
 *   - on each leg day, the Core exercises go to the Core & Cardio day after it, with the treadmill walk added. An ab exercise with sets you
 *     already ticked on that leg day stays there, so a logged workout doesn't change; an empty unticked box of a moved exercise is cleared;
 *   - Core & Cardio days you are already past stay ticked (they were rest days you had), the ones still ahead are not, so they come up.
 *  History, records and last-time weights are not touched. Runs once (settings.coreCardio).
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  const proto = ApplicationUI.prototype;
  const MINE = "my_6day_chest_back_legs_sharms", NEWTITLE = "Ilhaan's 3 Day Split";
  const clone = o => JSON.parse(JSON.stringify(o));
  const builtin = () => (typeof BUILTIN_PROGRAMS !== "undefined" && Array.isArray(BUILTIN_PROGRAMS)) ? BUILTIN_PROGRAMS.find(x => x && x.id === MINE) : null;
  const isCore = name => { try { return PT.category(name) === "Core"; } catch (e) { return false; } };
  const ticked = (app, dn, ex) => { for (let s = 0; s < (ex.sets || 0); s++) { const e = app.logs[app.getLogKey(MINE, dn, ex.id, s)]; if (e && e.completed) return true; } return false; };
  const rid = (id, from, to) => (typeof id === "string" && id.startsWith(`${MINE}_d${from}_`)) ? `${MINE}_d${to}_` + id.slice(`${MINE}_d${from}_`.length) : id;

  function upgrade(app) {
    const p = app && app.data && Array.isArray(app.data.programs) ? app.data.programs.find(x => x && x.id === MINE) : null;
    const b = builtin();
    if (!p || !b || p.weekPlan || !Array.isArray(p.days) || p.days.length < 64) return { done: false };
    const day = n => p.days.find(x => x && x.dayNumber === n);
    if (/^My 6-Day Split/.test(String(p.title || ""))) p.title = b.title;
    if ((p.tags || []).includes("6 Training Days") || (p.tags || []).includes("3 On 1 Off")) p.tags = clone(b.tags);
    if (/six-day bodybuilding split run as one long program/.test(String(p.description || ""))) p.description = b.description;
    let moved = 0;
    const st = app.getProgState(p), done = new Set(st.done || []);
    for (let k = 0; k < 8; k++) {
      [[8 * k + 2, 8 * k + 4], [8 * k + 6, 8 * k + 8]].forEach(([ln, cn]) => {
        const L = day(ln), C = day(cn), B = b.days.find(x => x.dayNumber === cn); if (!L || !C) return;
        const go = (L.exercises || []).filter(e => e && isCore(e.name) && !ticked(app, ln, e));
        if (go.length) {
          L.exercises = L.exercises.filter(e => go.indexOf(e) < 0);
          if (Array.isArray(L.orig)) L.orig = L.orig.filter(e => !(e && go.some(g => g.id === e.id)));
          go.forEach(e => {
            Object.keys(app.logs || {}).forEach(key => { if (key.startsWith(`${MINE}_d${ln}_${e.id}_s`) && !(app.logs[key] && app.logs[key].completed)) delete app.logs[key]; });
            e.id = rid(e.id, ln, cn);
          });
        }
        if (/Legs, Abs & Calves/.test(String(L.title || ""))) L.title = L.title.replace("Legs, Abs & Calves", "Legs & Calves");
        const was = (C.exercises || []).length;
        C.exercises = (C.exercises || []).concat(go.filter(e => !(C.exercises || []).some(x => x && x.name === e.name)));
        const walk = B && B.exercises.find(e => e.type === "cardio");
        if (walk && !C.exercises.some(e => e && e.name === walk.name)) C.exercises.push(clone(walk));
        if (/Rest Day/i.test(String(C.title || "")) || !was) C.title = `Day ${cn}: Core & Cardio`;
        if (!C.estimatedMinutes && B) C.estimatedMinutes = B.estimatedMinutes;
        moved += go.length;
      });
    }
    // Core & Cardio days still ahead of you come up; the ones you are past stay ticked
    const idx = n => p.days.findIndex(d => d.dayNumber === n);
    const last = Math.max(-1, ...[...done].filter(n => { const d = day(n); return d && !(n % 4 === 0 && n <= 64); }).map(idx));
    p.days.forEach((d, i) => { if (d.dayNumber % 4 === 0 && i > last && done.has(d.dayNumber) && !(d.exercises || []).some(e => ticked(app, d.dayNumber, e))) done.delete(d.dayNumber); });
    st.done = [...done];
    app.settings.coreCardio = Date.now();
    WorkoutStorage.setData(app.data);
    try { WorkoutStorage.saveLogs(app.logs); } catch (e) { }
    try { WorkoutStorage.saveSettings(app.settings); } catch (e) { }
    try { app.saveProgState(); } catch (e) { }
    return { done: true, moved };
  }
  PT.coreCardio = { upgrade: () => upgrade(window.app) };

  const oInit = proto.initExtras;
  proto.initExtras = function () {
    const r = oInit ? oInit.apply(this, arguments) : undefined;
    setTimeout(() => {   // after the 2.94-2.99 changes (60-150 ms)
      try {
        if (this.settings.coreCardio) return;
        const res = upgrade(this);
        if (res.done && this.activeProgram && this.activeProgram.id === MINE) {
          this.activeDay = (this.activeProgram.days || []).find(d => this.activeDay && d.dayNumber === this.activeDay.dayNumber) || this.activeDay;
          try { this.renderWorkoutView && this.renderWorkoutView(); } catch (e) { }
        }
      } catch (e) { console.error("PulseTrack: core & cardio days skipped", e); }
    }, 170);
    return r;
  };
})();
