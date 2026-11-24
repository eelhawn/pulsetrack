/* =====================================================================
 * PulseTrack 3.26.0: vertical preacher curls, bar and dumbbell apart, in Ilhaan's 3 Day Split (Day 15, 31, 47 and 63).
 *  The owner, after 3.25.0: "for the preacher curls u added put dumbell and bar separate breh and add vertical in the name and do the
 *  drawing correcrly"; asked, he wants the bar on the day with the dumbbells as a swap, and he does them standing at the pad.
 *   - "Preacher Curls (Dumbbell/Bar)" is now "Vertical Preacher Curls (Bar)" on those days; "Vertical Preacher Curls (Dumbbell)" is its
 *     own exercise in the list (exercises.js), the first swap offered for it, with its own history;
 *   - the drawing (137 preacher_vertical, 138 preacher_vertical): standing, chest on an upright pad, upper arms straight down its front.
 *  programs.js has the new days; a copy already on a phone is changed once here, the same way as 3.25.0 (module 149): sets you already
 *  ticked move with it, your swaps and removals are kept (only what they swap back to changes), a note you wrote yourself is kept.
 *  Its history moves too: workouts saved from this split (pid) with "Preacher Curls (Dumbbell/Bar)" (or "Preacher Curls") say
 *  "Vertical Preacher Curls (Bar)", like 005 mergeExercise; last-time values follow and the note, PR base, rest time and favourite are
 *  copied over. Runs once (settings.verticalPreacher), after 149. Only Ilhaan's 3 Day Split is changed.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  const proto = ApplicationUI.prototype;
  const MINE = "my_6day_chest_back_legs_sharms", DAYS = [15, 31, 47, 63];
  const OLD = ["Preacher Curls (Dumbbell/Bar)", "Preacher Curls"], TO = "Vertical Preacher Curls (Bar)", DB = "Vertical Preacher Curls (Dumbbell)";
  const OLD_NOTES = ["Vertical pad.", "Dumbbell/bar."];
  const idOf = dn => `${MINE}_d${dn}_vertical-preacher-curls-bar`, isOld = n => OLD.indexOf(n) >= 0;
  const fix = e => { if (OLD_NOTES.indexOf(e.notes) >= 0) delete e.notes; };   // a note you wrote stays

  function change(app) {
    const p = app && app.data && Array.isArray(app.data.programs) ? app.data.programs.find(x => x && x.id === MINE) : null;
    if (!p || !Array.isArray(p.days)) return 0;
    const logs = app.logs || {};
    let n = 0;
    p.days.forEach(d => {
      if (!d || !Array.isArray(d.exercises) || DAYS.indexOf(d.dayNumber) < 0) return;
      const dn = d.dayNumber, pre = `${MINE}_d${dn}_`, id = idOf(dn);
      // a ticked set is filed as program_dN_<exercise id>_s<set> (004 getLogKey)
      const moveLogs = (oldId, newId) => {
        if (!oldId || oldId === newId) return;
        const from = pre + oldId + "_s", to = pre + newId + "_s";
        Object.keys(logs).forEach(k => { if (k.startsWith(from)) { const t = to + k.slice(from.length); if (!(t in logs)) logs[t] = logs[k]; delete logs[k]; } });
      };
      const has = d.exercises.some(e => e && e.name === TO && !e.origName);
      d.exercises = d.exercises.filter(e => {
        if (!e) return true;
        if (isOld(e.origName)) {   // swapped by you: keep the swap, change what it swaps back to
          e.origName = TO; const old = e.id; e.id = id; moveLogs(old, id);
          if (e.name === TO) delete e.origName;
          n++; return true;
        }
        if (!isOld(e.name) || e.origName || e.added) return true;
        if (has) { n++; return false; }
        const old = e.id; e.name = TO; e.id = id; fix(e); moveLogs(old, id); n++;
        return true;
      });
      (Array.isArray(d.removed) ? d.removed : []).forEach(r => { if (r && r.ex && isOld(r.ex.name) && !r.ex.origName && !r.ex.added) { r.ex.name = TO; r.ex.id = id; fix(r.ex); n++; } });
      (Array.isArray(d.orig) ? d.orig : []).forEach(e => { if (e && isOld(e.name)) { e.name = TO; e.id = id; fix(e); n++; } });
    });
    return n;
  }

  // its history: like 005 mergeExercise, but only workouts saved from this split
  function history(app) {
    let hit = 0;
    (app.sessions || []).forEach(s => { if (s && s.pid === MINE) (s.ex || []).forEach(e => { if (e && isOld(e.name)) { e.name = TO; hit++; } }); });
    if (!hit) return 0;
    const copy = (o, cb) => { if (!o || typeof o !== "object" || o[TO] !== undefined) return; const from = OLD.find(k => o[k] !== undefined); if (from) { o[TO] = o[from]; if (cb) cb(); } };
    try { app.saveSessions(); } catch (e) { }
    copy(app.exNotes, () => { try { PT.save(STORAGE_KEY_EXNOTES, app.exNotes); } catch (e) { } });
    copy(app.prBase, () => { try { PT.save(STORAGE_KEY_PRBASE, app.prBase); } catch (e) { } });
    ["restOverrides", "bwModes", "sideModes"].forEach(k => copy(app.settings[k]));
    if (Array.isArray(app.settings.favEx) && OLD.some(k => app.settings.favEx.indexOf(k) >= 0) && app.settings.favEx.indexOf(TO) < 0) app.settings.favEx.push(TO);
    try { app.recomputeSessionPRs && app.recomputeSessionPRs(); app.rebuildPRs && app.rebuildPRs(); app.rebuildLastPerfFor && app.rebuildLastPerfFor([TO]); } catch (e) { }
    if (app.lastPerf) { copy(app.lastPerf); try { WorkoutStorage.saveLastPerf(app.lastPerf); } catch (e) { } }
    return hit;
  }

  function run(app) {
    if (!app || !app.settings || app.settings.verticalPreacher) return 0;
    const n = change(app), h = n ? history(app) : 0;
    app.settings.verticalPreacher = Date.now();
    try { if (n) { WorkoutStorage.setData(app.data); WorkoutStorage.saveLogs(app.logs); } WorkoutStorage.saveSettings(app.settings); } catch (e) { }
    try { if (n && app.activeProgram && app.activeProgram.id === MINE) { app.activeDay = (app.activeProgram.days || []).find(d => app.activeDay && d.dayNumber === app.activeDay.dayNumber) || app.activeDay; app.renderWorkoutView && app.renderWorkoutView(); } } catch (e) { }
    return n + h;
  }
  PT.verticalPreacher = { run: () => run(window.app), TO, DB, DAYS };

  const oInit = proto.initExtras;
  proto.initExtras = function () {
    const r = oInit ? oInit.apply(this, arguments) : undefined;
    setTimeout(() => { try { run(this); } catch (e) { console.error("PulseTrack: vertical preacher curls change skipped", e); } }, 190);   // after 149 (180)
    return r;
  };
})();
