/* =====================================================================
 * PulseTrack 3.25.0: the Week B Shoulders & Arms days, and every lift 3 sets, in Ilhaan's 3 Day Split.
 *  The owner, after 3.24.0: "redo the ez bar curl exercise and make everything 3 sets no 4 sets"; asked which curl goes in that spot,
 *  he said "put cable wrist curls", and "everything" = every 4-set exercise (the 5-set ab exercises stay). Then: "the vertical preacher
 *  thing put it in the exercise name and differ dumbbell/bar dont name it just preacher curl".
 *   - Day 15, 31, 47 and 63: Preacher Curls is called "Preacher Curls (Dumbbell/Bar)" (the "Vertical pad." / "Dumbbell/bar." line under
 *     it goes; exercises.js has it as its own entry with the Preacher Curls tips; drawings and muscles match it the same way);
 *   - the last exercise there (EZ-Bar Reverse Curls until 3.23.0, EZ-Bar Curls in 3.24.0) is now Cable Wrist Curls, 3 x 15-20, 45 s
 *     rest: the same wrist curls as Day 3, 19, 35 and 51;
 *   - every exercise in the split that had 4 sets has 3 (Lat Pulldown, Squat, Leg Press, Deadlift, the presses, shrugs, wrist curls ...).
 *  programs.js has the new days; a copy already on a phone is changed once here, the same way as 3.22.0/3.24.0 (modules 147, 148): sets
 *  you already ticked move with the exercise, your swaps and removals are kept (only what they swap back to changes), no second copy on a
 *  day that has one, a note you wrote yourself is kept. 4 sets become 3 everywhere in the split, also on exercises you added or swapped
 *  in, and in the copy of each day that the weekly reset goes back to (d.orig). A ticked 4th set is left in the logs.
 *  The preacher curls are the same exercise with a new name, so their history comes along like the exercise sheet's "Merge history"
 *  (005 mergeExercise): workouts saved from this split (pid) say the new name, last-time values follow, and the old name's note, PR
 *  base, rest time and favourite are copied over. Workouts from other programs or imports keep "Preacher Curls".
 *  Runs once (settings.threeSets), after 148. Only Ilhaan's 3 Day Split is changed.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  const proto = ApplicationUI.prototype;
  const MINE = "my_6day_chest_back_legs_sharms", DAYS = [15, 31, 47, 63];
  const FROM = ["EZ-Bar Curls", "EZ-Bar Reverse Curls"], TO = "Cable Wrist Curls", REPS = "15-20", OLD_REPS = "15";
  const PC_OLD = "Preacher Curls", PC_NEW = "Preacher Curls (Dumbbell/Bar)", OLD_NOTES = ["Vertical pad.", "Dumbbell/bar."];
  const idOf = dn => `${MINE}_d${dn}_cable-wrist-curls`, pcIdOf = dn => `${MINE}_d${dn}_preacher-curls-dumbbell-bar`;
  const isFrom = n => FROM.indexOf(n) >= 0;

  function change(app) {
    const p = app && app.data && Array.isArray(app.data.programs) ? app.data.programs.find(x => x && x.id === MINE) : null;
    if (!p || !Array.isArray(p.days)) return 0;
    const logs = app.logs || {};
    let n = 0;
    const three = e => { if (e && Number(e.sets) === 4) { e.sets = typeof e.sets === "string" ? "3" : 3; n++; } };
    p.days.forEach(d => {
      if (!d || !Array.isArray(d.exercises)) return;
      const dn = d.dayNumber, pre = `${MINE}_d${dn}_`;
      if (DAYS.indexOf(dn) >= 0) {
        // a ticked set is filed as program_dN_<exercise id>_s<set> (004 getLogKey)
        const moveLogs = (oldId, newId) => {
          if (!oldId || oldId === newId) return;
          const from = pre + oldId + "_s", to = pre + newId + "_s";
          Object.keys(logs).forEach(k => { if (k.startsWith(from)) { const t = to + k.slice(from.length); if (!(t in logs)) logs[t] = logs[k]; delete logs[k]; } });
        };
        const removed = Array.isArray(d.removed) ? d.removed : [], orig = Array.isArray(d.orig) ? d.orig : [];
        // swap(old names, new name, new id, fix(e)): the program's exercise in that spot gets the new name and id; yours stay yours
        const swap = (isOld, name, id, fix) => {
          const has = d.exercises.some(e => e && e.name === name && !e.origName);
          d.exercises = d.exercises.filter(e => {
            if (!e) return true;
            if (isOld(e.origName)) {   // swapped by you: keep the swap, change what it swaps back to
              e.origName = name; const old = e.id; e.id = id; moveLogs(old, id);
              if (e.name === name) delete e.origName;
              n++; return true;
            }
            if (!isOld(e.name) || e.origName || e.added) return true;
            if (has) { n++; return false; }
            const old = e.id; e.name = name; e.id = id; fix(e); moveLogs(old, id); n++;
            return true;
          });
          removed.forEach(r => { if (r && r.ex && isOld(r.ex.name) && !r.ex.origName && !r.ex.added) { r.ex.name = name; r.ex.id = id; fix(r.ex); n++; } });
          orig.forEach(e => { if (e && isOld(e.name)) { e.name = name; e.id = id; fix(e); n++; } });
        };
        swap(isFrom, TO, idOf(dn), e => { if (String(e.reps) === OLD_REPS) e.reps = REPS; });
        swap(nm => nm === PC_OLD, PC_NEW, pcIdOf(dn), e => { if (OLD_NOTES.indexOf(e.notes) >= 0) delete e.notes; });   // a note you wrote stays
      }
      d.exercises.forEach(three);
      (Array.isArray(d.removed) ? d.removed : []).forEach(r => r && three(r.ex));
      (Array.isArray(d.orig) ? d.orig : []).forEach(three);
    });
    return n;
  }

  // the preacher curls' history: like 005 mergeExercise, but only workouts saved from this split
  function history(app) {
    let hit = 0;
    (app.sessions || []).forEach(s => { if (s && s.pid === MINE) (s.ex || []).forEach(e => { if (e && e.name === PC_OLD) { e.name = PC_NEW; hit++; } }); });
    const copy = (o, cb) => { if (o && typeof o === "object" && o[PC_OLD] !== undefined && o[PC_NEW] === undefined) { o[PC_NEW] = o[PC_OLD]; if (cb) cb(); } };
    if (!hit) return 0;
    try { app.saveSessions(); } catch (e) { }
    copy(app.exNotes, () => { try { PT.save(STORAGE_KEY_EXNOTES, app.exNotes); } catch (e) { } });
    copy(app.prBase, () => { try { PT.save(STORAGE_KEY_PRBASE, app.prBase); } catch (e) { } });
    ["restOverrides", "bwModes", "sideModes"].forEach(k => copy(app.settings[k]));
    if (Array.isArray(app.settings.favEx) && app.settings.favEx.indexOf(PC_OLD) >= 0 && app.settings.favEx.indexOf(PC_NEW) < 0) app.settings.favEx.push(PC_NEW);
    try { app.recomputeSessionPRs && app.recomputeSessionPRs(); app.rebuildPRs && app.rebuildPRs(); app.rebuildLastPerfFor && app.rebuildLastPerfFor([PC_NEW]); } catch (e) { }
    if (app.lastPerf) { copy(app.lastPerf); try { WorkoutStorage.saveLastPerf(app.lastPerf); } catch (e) { } }
    return hit;
  }

  function run(app) {
    if (!app || !app.settings || app.settings.threeSets) return 0;
    const n = change(app), h = n ? history(app) : 0;
    app.settings.threeSets = Date.now();
    try { if (n) { WorkoutStorage.setData(app.data); WorkoutStorage.saveLogs(app.logs); } WorkoutStorage.saveSettings(app.settings); } catch (e) { }
    try { if (n && app.activeProgram && app.activeProgram.id === MINE) { app.activeDay = (app.activeProgram.days || []).find(d => app.activeDay && d.dayNumber === app.activeDay.dayNumber) || app.activeDay; app.renderWorkoutView && app.renderWorkoutView(); } } catch (e) { }
    return n + h;
  }
  PT.threeSets = { run: () => run(window.app), TO, DAYS, PC_OLD, PC_NEW };

  const oInit = proto.initExtras;
  proto.initExtras = function () {
    const r = oInit ? oInit.apply(this, arguments) : undefined;
    setTimeout(() => { try { run(this); } catch (e) { console.error("PulseTrack: Shoulders & Arms day / three sets change skipped", e); } }, 180);   // after 148 (170)
    return r;
  };
})();
