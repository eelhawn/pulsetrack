/* =====================================================================
 * PulseTrack 3.24.0: the Week B Shoulders & Arms curls in Ilhaan's 3 Day Split (Day 15, 31, 47 and 63).
 *  The owner: "day 15 sharms: change the preacher curl vertical pad into a name like dumbbell/bar, and sub ez bar reverse curl for
 *  standard ez bar curl and make it 3 sets".
 *   - Preacher Curls: the line under the name says "Dumbbell/bar." instead of "Vertical pad." (same exercise, so its history and
 *     last-time weights stay together);
 *   - EZ-Bar Reverse Curls (4 x 15) is now EZ-Bar Curls, 3 sets (same 15 reps and 45 s rest).
 *  programs.js has the new days; a copy already on a phone is changed once here, the same way as 3.22.0 (module 147): sets you already
 *  ticked move with the exercise, your swaps and removals are kept (only what they swap back to changes), no second EZ-Bar Curls on a
 *  day that has one, a note you wrote yourself is kept, sets you changed yourself are kept. History of the reverse curls is not touched.
 *  Runs once (settings.sharmsCurls). Only Ilhaan's 3 Day Split is changed.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  const proto = ApplicationUI.prototype;
  const MINE = "my_6day_chest_back_legs_sharms", DAYS = [15, 31, 47, 63];
  const FROM = "EZ-Bar Reverse Curls", TO = "EZ-Bar Curls", PREACHER = "Preacher Curls", OLD_NOTE = "Vertical pad.", NEW_NOTE = "Dumbbell/bar.";
  const idOf = dn => `${MINE}_d${dn}_ez-bar-curls`;

  function change(app) {
    const p = app && app.data && Array.isArray(app.data.programs) ? app.data.programs.find(x => x && x.id === MINE) : null;
    if (!p || !Array.isArray(p.days)) return 0;
    const logs = app.logs || {};
    let n = 0;
    p.days.forEach(d => {
      if (!d || !Array.isArray(d.exercises) || DAYS.indexOf(d.dayNumber) < 0) return;
      const dn = d.dayNumber, pre = `${MINE}_d${dn}_`;
      // a ticked set is filed as program_dN_<exercise id>_s<set> (004 getLogKey)
      const moveLogs = (oldId, newId) => {
        if (!oldId || oldId === newId) return;
        const from = pre + oldId + "_s", to = pre + newId + "_s";
        Object.keys(logs).forEach(k => { if (k.startsWith(from)) { const t = to + k.slice(from.length); if (!(t in logs)) logs[t] = logs[k]; delete logs[k]; } });
      };
      const sets3 = e => { if (e.sets === 4) e.sets = 3; };   // the program's 4; a number you set yourself stays
      const note = e => { if (e && (e.name === PREACHER || e.origName === PREACHER) && e.notes === OLD_NOTE) { e.notes = NEW_NOTE; n++; } };
      d.exercises.forEach(note);
      (Array.isArray(d.removed) ? d.removed : []).forEach(r => r && note(r.ex));
      const hasTo = d.exercises.some(e => e && e.name === TO && !e.origName);
      d.exercises = d.exercises.filter(e => {
        if (!e) return true;
        if (e.origName === FROM) {   // swapped by you: keep the swap, change what it swaps back to
          e.origName = TO; const old = e.id; e.id = idOf(dn); moveLogs(old, e.id); sets3(e);
          if (e.name === TO) delete e.origName;
          n++; return true;
        }
        if (e.name !== FROM || e.added) return true;
        if (hasTo) { n++; return false; }
        const old = e.id; e.name = TO; e.id = idOf(dn); sets3(e); moveLogs(old, e.id); n++;
        return true;
      });
      (Array.isArray(d.removed) ? d.removed : []).forEach(r => { if (r && r.ex && r.ex.name === FROM) { r.ex.name = TO; r.ex.id = idOf(dn); sets3(r.ex); n++; } });
      (Array.isArray(d.orig) ? d.orig : []).forEach(e => { if (e && e.name === FROM) { e.name = TO; e.id = idOf(dn); sets3(e); n++; } else note(e); });
    });
    return n;
  }
  function run(app) {
    if (!app || !app.settings || app.settings.sharmsCurls) return 0;
    const n = change(app);
    app.settings.sharmsCurls = Date.now();
    try { if (n) { WorkoutStorage.setData(app.data); WorkoutStorage.saveLogs(app.logs); } WorkoutStorage.saveSettings(app.settings); } catch (e) { }
    try { if (n && app.activeProgram && app.activeProgram.id === MINE) { app.activeDay = (app.activeProgram.days || []).find(d => app.activeDay && d.dayNumber === app.activeDay.dayNumber) || app.activeDay; app.renderWorkoutView && app.renderWorkoutView(); } } catch (e) { }
    return n;
  }
  PT.sharmsCurls = { run: () => run(window.app), FROM, TO, DAYS };

  const oInit = proto.initExtras;
  proto.initExtras = function () {
    const r = oInit ? oInit.apply(this, arguments) : undefined;
    setTimeout(() => { try { run(this); } catch (e) { console.error("PulseTrack: Shoulders & Arms curls change skipped", e); } }, 170);   // after 147 (160)
    return r;
  };
})();
