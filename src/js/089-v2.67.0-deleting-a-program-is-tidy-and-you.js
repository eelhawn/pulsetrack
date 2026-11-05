
/* =====================================================================
 * PulseTrack 2.67.0: deleting a program is tidy, and you can take it back.
 *  The question is now the app's own dialog (in m63a.js), not the grey browser pop-up.
 *  Right after a program is deleted, a toast says so and offers Undo for 10 seconds: the program comes back in the same place in the list,
 *  with the week and day you were on, and as your current program again if it was. Saved workouts in History were never touched.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined" || typeof WorkoutStorage === "undefined") return;
  const proto = ApplicationUI.prototype, oDel = proto.deleteProgram;
  if (typeof oDel !== "function") return;
  const clone = x => { try { return JSON.parse(JSON.stringify(x)); } catch (e) { return undefined; } };

  function restore(a, snap) {
    const progs = a.data.programs = a.data.programs || [];
    if (progs.some(p => p && p.id === snap.prog.id)) { a.toast("It is already back"); return; }
    progs.splice(Math.min(snap.i, progs.length), 0, snap.prog);
    WorkoutStorage.setData(a.data);
    if (snap.st !== undefined) { a.progState = a.progState || {}; a.progState[snap.prog.id] = snap.st; try { a.saveProgState(); } catch (e) { } }
    // the program that was your current one, and the one you had open, only go back if you have not picked something else in the meantime
    const day = (snap.prog.days || []).find(d => d.dayNumber === snap.dayNo) || null;
    if (snap.wasCurrent && typeof a.selectProgram === "function" && !(PT.currentProgramId && PT.currentProgramId())) a.selectProgram(snap.prog, day, true);
    else if (snap.wasActive && a.activeProgram === snap.afterActive) { a.activeProgram = snap.prog; a.activeDay = day || (snap.prog.days || [])[0] || null; }
    try { a.renderProgramsView(); } catch (e) { }
    try { a.updateDrawerStatus(); } catch (e) { }
    try { a.renderHomeView && a.renderHomeView(); } catch (e) { }
    a.toast("Brought back “" + snap.prog.title + "”");
  }

  proto.deleteProgram = function (id) {
    const a = this, progs = (a.data && a.data.programs) || [], i = progs.findIndex(p => p && p.id === id);
    if (i < 0) return oDel.apply(this, arguments);
    const snap = {
      i, prog: progs[i], st: a.progState && a.progState[id] ? clone(a.progState[id]) : undefined,
      wasActive: !!(a.activeProgram && a.activeProgram.id === id), dayNo: a.activeDay ? a.activeDay.dayNumber : null,
      wasCurrent: !!(PT.currentProgramId && PT.currentProgramId() === id)
    };
    const r = oDel.apply(this, arguments);
    snap.afterActive = a.activeProgram;
    try { a.toast("Deleted “" + snap.prog.title + "”", "Undo", () => restore(a, snap), 10000); } catch (e) { }
    return r;
  };
})();
  