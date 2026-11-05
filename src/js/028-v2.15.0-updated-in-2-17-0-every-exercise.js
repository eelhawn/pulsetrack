
/* =====================================================================
 * PulseTrack 2.15.0 (updated in 2.17.0): every exercise has its own form tips.
 *  Each exercise in exercises.js carries its own `tips` (3 or 4 cues) and `avoid` (the usual mistake).
 *  - names and "aka" names both find the same tips (e.g. "Barbell Bench Press" shows the Bench Press tips)
 *  - since 2.17.0 every exercise the built-in programs use is in the list too, so each one has tips of its own
 *    ("FST-7 Leg Press" is another name for Leg Press, "Neutral Grip Low Cable Row" is its own exercise, and so on)
 *  - exercises you add yourself have no tips of their own, so they keep using the old general groups when one matches
 *  - the Form tips button and sheet look the same as before
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof PT === "undefined" || typeof PTSIM === "undefined" || typeof EXERCISE_DATABASE === "undefined") return;
  const generalCue = PT.cueFor;
  const db = () => (Array.isArray(EXERCISE_DATABASE) ? EXERCISE_DATABASE : []);
  let IDX = null, SIG = "";
  const sig = () => {
    const d = db();
    let s = d.length + ":";
    for (let i = d.length - 1; i >= 0 && d[i] && d[i].custom; i--) s += d[i].name + ";";
    return s;
  };
  const index = () => {
    const s = sig();
    if (!IDX || s !== SIG) { IDX = PTSIM.makeIndex(db()); SIG = s; }
    return IDX;
  };
  const made = new WeakMap();
  const fromEntry = e => {
    let c = made.get(e);
    if (!c) { c = { id: "ex:" + e.name, own: true, name: e.name, title: e.category || "This exercise", do: e.tips, avoid: e.avoid, desc: e.desc || "" }; made.set(e, c); }
    return c;
  };

  /** Tips for this exercise; library exercises each have their own, anything unknown falls back to the general groups. */
  PT.cueFor = function (name) {
    let e = null;
    try { e = index().canon(String(name || "")); } catch (err) { e = null; }
    if (e && Array.isArray(e.tips) && e.tips.length && e.avoid) return fromEntry(e);
    return generalCue(String(name || ""));
  };
})();
  