/* =====================================================================
 * PulseTrack 2.106.0: speed-ups.
 *  Some questions about an exercise ("is it a bodyweight move?") only depend on its name and your exercise list, but were worked out again
 *  for every set of every past workout each time a screen was drawn: the Progress page asked them hundreds of thousands of times. The answers
 *  are now remembered per name and forgotten whenever your settings or the exercise list change (a new or edited exercise of your own,
 *  the openGym library arriving), so nothing can go stale. Nothing you see changes, it is just quicker.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  let ver = 0;
  const dbLen = () => (typeof EXERCISE_DATABASE !== "undefined" && Array.isArray(EXERCISE_DATABASE)) ? EXERCISE_DATABASE.length : 0;
  PT.memoVer = () => ver + ":" + dbLen();
  PT.memoForget = () => { ver++; };
  try {
    const oSave = WorkoutStorage.saveSettings;
    WorkoutStorage.saveSettings = function () { ver++; return oSave.apply(this, arguments); };
  } catch (e) { }
  /** remembers fn(name) per name; the memory is dropped when PT.memoVer() changes */
  PT.memoByName = function (fn) {
    let atV = -1, atL = -1, atS = null, atX = null, m = new Map();
    return function (name) {
      if (arguments.length !== 1) return fn.apply(this, arguments);
      // forgotten when settings are saved, the list grows or shrinks, or your own exercises / the settings are swapped out (a restore)
      const l = dbLen(), st = window.app && window.app.settings, cx = st && st.customEx;
      if (ver !== atV || l !== atL || st !== atS || cx !== atX) { atV = ver; atL = l; atS = st; atX = cx; m = new Map(); }
      const k = String(name == null ? "" : name);
      if (m.has(k)) return m.get(k);
      const r = fn.call(this, name); m.set(k, r); return r;
    };
  };
  // the accent colour was read from the page's styles for every point of every chart; it only changes with your settings (or theme)
  try {
    const P = ApplicationUI.prototype, oAcc = PT.accent;
    if (typeof oAcc === "function") {
      let at = -1, raw = null;
      PT.accent = function (alpha) {
        if (at !== ver || raw === null) { at = ver; raw = getComputedStyle(document.documentElement).getPropertyValue("--a500").trim() || "16 185 129"; }
        const [r, g, b] = raw.split(/\s+/).map(Number);
        return alpha === undefined ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${alpha})`;
      };
      const oTheme = P.applyTheme;
      if (typeof oTheme === "function") P.applyTheme = function () { const r = oTheme.apply(this, arguments); ver++; return r; };
    }
  } catch (e) { }

  // the answers that depend on the name only
  ["isBwMove", "isBodyweightEx", "equipKey", "category", "dbCount"].forEach(k => { if (typeof PT[k] === "function") PT[k] = PT.memoByName(PT[k]); });
})();
