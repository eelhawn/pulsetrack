/* =====================================================================
 * PulseTrack 2.91.3: "Machine Chest Dips" is now "Iso-Lateral Plate-Loaded Machine Dip".
 *  The exercise library has the new name (Chest, with a description and tips) and still knows the old names (Machine Chest Dips,
 *  Chest Dip Machine, Seated Chest Dip Machine) so they count as the same lift. My 6-Day Split's Day 4 uses it.
 *  A workout, program or history that still says "Machine Chest Dips" is renamed once, here: saved programs and swapped exercises,
 *  saved workouts, PRs, notes and last-time weights all move over to the new name, the same way Settings → Clean Up Exercise Names does.
 *  Runs once (settings.isoDip). Other exercise names are not touched.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  const proto = ApplicationUI.prototype;
  const FROM = "Machine Chest Dips", TO = "Iso-Lateral Plate-Loaded Machine Dip";

  function run(app) {
    if (app.settings.isoDip || !PT.cleanup || !PT.cleanup.scan || !PT.cleanup.apply) return 0;
    let n = 0;
    try {
      const row = PT.cleanup.scan().rows.find(r => r.from === FROM && r.to === TO);
      if (row) { PT.cleanup.apply({ [FROM]: TO }); n = 1; }
    } catch (e) { console.error("PulseTrack: machine dip rename skipped", e); return 0; }
    app.settings.isoDip = Date.now();
    try { WorkoutStorage.saveSettings(app.settings); } catch (e) { }
    if (n) try { ["renderHomeView", "renderDaysView", "renderWorkoutView", "renderLibraryView", "renderHistoryView"].forEach(f => { if (typeof app[f] === "function") { const el = document.getElementById("view-" + f.replace(/^render|View$/g, "").toLowerCase()); if (el && !el.classList.contains("hidden")) app[f](); } }); } catch (e) { }
    return n;
  }
  PT.isoDip = { run: () => run(window.app), FROM, TO };

  const oInit = proto.initExtras;
  proto.initExtras = function () {
    const r = oInit ? oInit.apply(this, arguments) : undefined;
    setTimeout(() => { try { run(this); } catch (e) { console.error("PulseTrack: machine dip rename skipped", e); } }, 50);
    return r;
  };
})();
