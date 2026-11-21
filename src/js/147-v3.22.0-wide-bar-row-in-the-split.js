/* =====================================================================
 * PulseTrack 3.22.0: the wide-bar cable row in Ilhaan's 3 Day Split.
 *  The owner: "for my split make sure you don't make new exercises, like the neutral cable row: use the wide bar cable row that was
 *  already in exercises". Day 13, 29, 45 and 61 had Neutral-Grip Seated Cable Row (2.75.0 matched his Week B wording to that database
 *  exercise); they now use Cable Seated Rows (Wide Bar), the row he already does on Day 5, 21, 37 and 53, with the same 3 x 10-12 and
 *  75 s rest. programs.js has the new day; a copy already on a phone is changed once here:
 *   - the exercise is renamed and gets the id programs.js uses (..._dN_cable-seated-rows-wide-bar), and sets you already ticked on it
 *     move with it;
 *   - if you had swapped it for something else, your swap stays (only what it swaps back to changes); if you had removed it from the
 *     day, it stays removed (the removed copy is renamed, so putting it back gives the wide-bar row);
 *   - a day that already has the wide-bar row does not get a second one (the neutral row is just taken off).
 *  History, records, notes and last-time weights of the neutral-grip row are not touched: those were neutral-grip rows.
 *  Runs once (settings.wideRowSplit). Only Ilhaan's 3 Day Split is changed.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  const proto = ApplicationUI.prototype;
  const MINE = "my_6day_chest_back_legs_sharms", FROM = "Neutral-Grip Seated Cable Row", TO = "Cable Seated Rows (Wide Bar)";
  const idOf = dn => `${MINE}_d${dn}_cable-seated-rows-wide-bar`;

  function swap(app) {
    const p = app && app.data && Array.isArray(app.data.programs) ? app.data.programs.find(x => x && x.id === MINE) : null;
    if (!p || !Array.isArray(p.days)) return 0;
    const logs = app.logs || {};
    let n = 0;
    p.days.forEach(d => {
      if (!d || !Array.isArray(d.exercises)) return;
      const dn = d.dayNumber, pre = `${MINE}_d${dn}_`;
      // a ticked set is filed as program_dN_<exercise id>_s<set> (004 getLogKey)
      const moveLogs = (oldId, newId) => {
        if (!oldId || oldId === newId) return;
        const from = pre + oldId + "_s", to = pre + newId + "_s";
        Object.keys(logs).forEach(k => { if (k.startsWith(from)) { const t = to + k.slice(from.length); if (!(t in logs)) logs[t] = logs[k]; delete logs[k]; } });
      };
      const hasTo = d.exercises.some(e => e && e.name === TO && !e.origName);
      d.exercises = d.exercises.filter(e => {
        if (!e) return true;
        if (e.origName === FROM) {   // swapped by you: keep the swap, change what it swaps back to
          e.origName = TO; const old = e.id; e.id = idOf(dn); moveLogs(old, e.id);
          if (e.name === TO) delete e.origName;
          n++; return true;
        }
        if (e.name !== FROM || e.added) return true;
        if (hasTo) { n++; return false; }
        const old = e.id; e.name = TO; e.id = idOf(dn); moveLogs(old, e.id); n++;
        return true;
      });
      (Array.isArray(d.removed) ? d.removed : []).forEach(r => { if (r && r.ex && r.ex.name === FROM) { r.ex.name = TO; r.ex.id = idOf(dn); n++; } });
      (Array.isArray(d.orig) ? d.orig : []).forEach(e => { if (e && e.name === FROM) { e.name = TO; e.id = idOf(dn); n++; } });
    });
    return n;
  }
  function run(app) {
    if (!app || !app.settings || app.settings.wideRowSplit) return 0;
    const n = swap(app);
    app.settings.wideRowSplit = Date.now();
    try { if (n) { WorkoutStorage.setData(app.data); WorkoutStorage.saveLogs(app.logs); } WorkoutStorage.saveSettings(app.settings); } catch (e) { }
    try { if (n && app.activeProgram && app.activeProgram.id === MINE) { app.activeDay = (app.activeProgram.days || []).find(d => app.activeDay && d.dayNumber === app.activeDay.dayNumber) || app.activeDay; app.renderWorkoutView && app.renderWorkoutView(); } } catch (e) { }
    return n;
  }
  PT.wideRowSplit = { run: () => run(window.app), FROM, TO };

  const oInit = proto.initExtras;
  proto.initExtras = function () {
    const r = oInit ? oInit.apply(this, arguments) : undefined;
    setTimeout(() => { try { run(this); } catch (e) { console.error("PulseTrack: wide-bar row swap skipped", e); } }, 160);   // after 120 (150)
    return r;
  };
})();
