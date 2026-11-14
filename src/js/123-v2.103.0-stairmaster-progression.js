/* =====================================================================
 * PulseTrack 2.103.0: a StairMaster climb on the Core & Cardio days of Ilhaan's 3 Day Split.
 *  The cardio on Day 4, 8, 12 ... 64 is now the StairMaster instead of the incline treadmill walk: 20 minutes on Day 4, then 2.5 minutes more
 *  on every Core & Cardio day after it (22.5 on Day 8, 25 on Day 12 ...), up to 57.5 minutes on Day 64. The minutes box shows that day's
 *  target (not last time's), ✓ on an empty box logs that target (with One-tap log on), and it still goes to Cardio & Sports when you finish.
 *  A copy already on a phone is changed once: on each Core & Cardio day the treadmill walk (or a StairMaster row you already have) becomes
 *  that day's StairMaster target; a day without a cardio row gets one. A cardio row you already ticked stays as it is. Runs once
 *  (settings.stairClimb).
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  const proto = ApplicationUI.prototype;
  const MINE = "my_6day_chest_back_legs_sharms";
  const target = n => { const v = 20 + 2.5 * (n / 4 - 1); return (v % 1 ? String(v) : String(v | 0)) + " min"; };
  const ticked = (app, dn, ex) => { for (let s = 0; s < (ex.sets || 0); s++) { const e = app.logs[app.getLogKey(MINE, dn, ex.id, s)]; if (e && e.completed) return true; } return false; };

  function upgrade(app) {
    const p = app && app.data && Array.isArray(app.data.programs) ? app.data.programs.find(x => x && x.id === MINE) : null;
    if (!p || p.weekPlan || !Array.isArray(p.days) || p.days.length < 64) return 0;
    let n = 0;
    p.days.forEach(d => {
      if (!d || d.dayNumber % 4 || !/Core & Cardio/.test(String(d.title || ""))) return;
      const dn = d.dayNumber, row = { id: `${MINE}_d${dn}_stairmaster`, name: "Stairmaster", sets: 1, reps: target(dn), restSeconds: 60, type: "cardio" };
      const ex = d.exercises || (d.exercises = []);
      const i = ex.findIndex(e => e && (e.name === "Incline Treadmill Walk" || e.name === "Stairmaster"));
      if (i >= 0) {
        if (ticked(app, dn, ex[i])) return;
        const old = ex[i];
        Object.keys(app.logs || {}).forEach(k => { if (k.startsWith(`${MINE}_d${dn}_${old.id}_s`)) delete app.logs[k]; });
        ex[i] = row;
        if (Array.isArray(d.orig)) { const j = d.orig.findIndex(e => e && e.id === old.id); if (j >= 0) d.orig[j] = JSON.parse(JSON.stringify(row)); }
      } else if (!ex.some(e => { try { return app.exKind(e).cardio; } catch (err) { return false; } })) ex.push(row);
      else return;
      d.estimatedMinutes = Math.round(15 + 20 + 2.5 * (dn / 4 - 1));
      n++;
    });
    if (/then 20-30 minutes on the incline treadmill\./.test(String(p.description || ""))) p.description = p.description.replace("then 20-30 minutes on the incline treadmill.", "then the StairMaster: 20 minutes on Day 4, 2.5 minutes more on every Core & Cardio day after it, up to 57.5 minutes on Day 64.");
    return n;
  }
  function run(app) {
    if (app.settings.stairClimb) return 0;
    const n = upgrade(app);
    app.settings.stairClimb = Date.now();
    try { if (n) { WorkoutStorage.setData(app.data); WorkoutStorage.saveLogs(app.logs); } WorkoutStorage.saveSettings(app.settings); } catch (e) { }
    try { if (n && app.activeProgram && app.activeProgram.id === MINE) { app.activeDay = (app.activeProgram.days || []).find(d => app.activeDay && d.dayNumber === app.activeDay.dayNumber) || app.activeDay; app.renderWorkoutView && app.renderWorkoutView(); } } catch (e) { }
    return n;
  }
  PT.stairClimb = { run: () => run(window.app), target };

  // ✓ on a cardio row with an empty minutes box logs the minutes it asks for ("25 min"), like One-tap log does for lifts
  window.addEventListener("click", e => {
    try {
      const a = window.app; if (!a || !PT.opt || !PT.opt("oneTap") || !e.target.closest) return;
      const btn = e.target.closest(".btn-check-set"); if (!btn || btn.dataset.completed === "1") return;
      const list = a.dom && a.dom.exercisesList, card = btn.closest("[data-ex-card]"), row = btn.closest(".set-row"); if (!list || !card || !row || !list.contains(btn) || !a.activeDay) return;
      const ex = (a.activeDay.exercises || [])[parseInt(card.dataset.exCard, 10)]; if (!ex || !a.exKind(ex).cardio) return;
      const m = /^\s*(\d+(?:\.\d+)?)\s*min\s*$/i.exec(String(ex.reps || "")); if (!m) return;
      const key = btn.dataset.key, en = a.logs[key] || { completed: false, tag: "R" };
      if (en.completed || parseFloat(en.min) > 0) return;
      en.min = m[1]; a.logs[key] = en;
      const inp = row.querySelector('input[data-field="min"]'); if (inp) inp.value = m[1];
      try { WorkoutStorage.saveLogs(a.logs); } catch (err) { }
    } catch (err) { console.error("PulseTrack cardio one-tap", err); }
  }, true);

  const oInit = proto.initExtras;
  proto.initExtras = function () {
    const r = oInit ? oInit.apply(this, arguments) : undefined;
    setTimeout(() => { try { run(this); } catch (e) { console.error("PulseTrack: StairMaster climb skipped", e); } }, 190);   // after 121 (170)
    return r;
  };
})();
