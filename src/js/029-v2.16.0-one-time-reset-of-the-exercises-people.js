
/* =====================================================================
 * PulseTrack 2.16.0: one-time reset of the exercises people added themselves.
 *  The library now has many more exercises (each with its own form tips), so the exercises added through
 *  "Create your own exercise" are cleared once, on every phone, the first time this version opens.
 *  - The Create your own exercise feature is untouched. Anything you add after this stays.
 *  - Workouts you already logged keep their exercise names, records and history.
 *  - A hidden copy of what was cleared is kept in the settings (settings.customExOld), so it is in backups and nothing is lost for good.
 *  - It runs once per phone (a flag is saved), so restoring a backup later does not wipe exercises again.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PTLS === "undefined") return;
  const FLAG = "pt_custom_reset_v216";   // not "pulsetrack_*", so Erase data does not clear it and run the reset a second time
  const proto = ApplicationUI.prototype;
  const origInit = proto.initExtras;
  if (typeof origInit !== "function") return;

  /** Clears settings.customEx once. Returns how many exercises were cleared (0 when there was nothing or it already ran). */
  function resetOnce(app) {
    let done = null;
    try { done = PTLS.getItem(FLAG); } catch (e) { done = null; }
    if (done) return 0;
    const s = app.settings || (app.settings = {});
    const list = Array.isArray(s.customEx) ? s.customEx.filter(e => e && e.name) : [];
    if (list.length) {
      s.customExOld = { clearedAt: new Date().toISOString(), version: "2.16.0", exercises: list };
      s.customEx = [];
      try { WorkoutStorage.saveSettings(s); } catch (e) { console.error("PulseTrack 2.16 reset", e); return 0; }
    }
    try { PTLS.setItem(FLAG, String(Date.now())); } catch (e) { }
    return list.length;
  }
  if (typeof PT !== "undefined") PT.resetCustomOnce = resetOnce;

  proto.initExtras = function () {
    let n = 0;
    try { n = resetOnce(this); } catch (e) { console.error("PulseTrack 2.16 reset", e); }
    const r = origInit.apply(this, arguments);
    if (n > 0) {
      setTimeout(() => {
        try { this.toast(`Your own exercises were cleared (${n}). The list has many new ones, each with its own tips.`, null, null, 9000); } catch (e) { }
      }, 1200);
    }
    return r;
  };
})();
  