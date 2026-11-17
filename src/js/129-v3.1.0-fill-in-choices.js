/* =====================================================================
 * PulseTrack 3.1.0: what Fill in puts in.
 *  Settings > Workout screen > "Fill in uses" picks the numbers that every Fill in button (on an exercise, "Fill in" at the top of the
 *  workout, and Pre-fill the whole workout) puts into empty sets:
 *    Suggested    last time plus the usual step up (what it always did, and still the default)
 *    Last time    exactly last time's sets, set by set: the grey numbers already showing in the boxes
 *    Heaviest     every set gets last time's heaviest set (its weight and its reps; the lightest help on assisted moves)
 *    Most reps    every set gets last time's set with the most reps (and its weight)
 *  Warm-up and drop sets of last time are left out of Heaviest and Most reps. Sets you typed or checked off are never changed.
 *  Stored in settings.fillMode. PT.fillTarget(ex) gives { per: [{ w, r, bz }], cap } for one exercise; PT.fillWords() the wording.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined" || !PT.nextTarget) return;
  const A = () => window.app;
  const MODES = [["suggest", "Suggested"], ["last", "Last time"], ["heaviest", "Heaviest set"], ["reps", "Most reps"]];
  const WORDS = {
    suggest: { button: "Fill in suggested weights", what: "the suggested weights" },
    last: { button: "Fill in last time's numbers", what: "last time's numbers" },
    heaviest: { button: "Fill in your heaviest set", what: "last time's heaviest set" },
    reps: { button: "Fill in your most-reps set", what: "last time's most-reps set" }
  };
  const mode = () => { const a = A(), m = a && a.settings && a.settings.fillMode; return WORDS[m] ? m : "suggest"; };
  const W = x => parseFloat(x && x.weight) || 0, R = x => parseFloat(x && x.reps) || 0;

  function fillTarget(ex) {
    const app = A(), m = mode();
    if (!app || !ex || !ex.name) return null;
    if (m === "suggest") return PT.nextTarget(ex);
    let kind; try { kind = app.exKind(ex); } catch (e) { kind = {}; }
    if (kind.cardio || ex.type === "tabata") return null;
    const prev = (app.lastPerf && app.lastPerf[ex.name] || []).filter(x => x && x.min === undefined);
    if (!prev.length) return null;
    const one = x => ({ w: W(x), r: R(x), bz: !!x.bz });
    if (m === "last") return { kind: "last", per: prev.map(one), cap: prev.length };
    const work = prev.filter(x => x.tag !== "W" && x.tag !== "D" && R(x) > 0);
    if (!work.length) return null;
    const assist = kind.bw && app.bwMode && app.bwMode(ex.name) === "assist";
    const better = m === "heaviest"
      ? (x, y) => (assist ? W(y) - W(x) : W(x) - W(y)) || R(x) - R(y)
      : (x, y) => R(x) - R(y) || (assist ? W(y) - W(x) : W(x) - W(y));
    const top = work.reduce((b, x) => better(x, b) > 0 ? x : b, work[0]);
    const per = []; for (let i = 0; i < Math.max(1, ex.sets || 0); i++) per.push(one(top));
    return { kind: m, per, cap: ex.sets || per.length };
  }
  PT.fillTarget = fillTarget;
  PT.fillWords = () => WORDS[mode()];

  /* the row in Settings > Workout screen (drawn by module 019) */
  PT.fillModeRow = () => {
    const m = mode();
    return `<div class="p-3.5 space-y-2" id="pt-fillmode"><span class="text-xs font-bold text-white block">Fill in uses</span>
      <div class="flex flex-wrap gap-1.5" role="group" aria-label="What Fill in puts in">${MODES.map(([k, l]) => `<button type="button" data-fillmode="${k}" aria-pressed="${m === k}" class="pt-opt tap-active">${l}</button>`).join("")}</div>
      <span class="text-[11px] text-zinc-400 block">${{
        suggest: "Last time plus the usual step up.",
        last: "Exactly last time's sets, the grey numbers already in the boxes.",
        heaviest: "Every set gets last time's heaviest set, with its reps.",
        reps: "Every set gets last time's set with the most reps, with its weight."
      }[m]}</span></div>`;
  };
  document.addEventListener("click", e => {
    const b = e.target.closest && e.target.closest("[data-fillmode]"); if (!b) return;
    const a = A(); if (!a) return;
    a.settings.fillMode = b.dataset.fillmode;
    try { WorkoutStorage.saveSettings(a.settings); } catch (er) { }
    const box = document.getElementById("pt-fillmode");
    if (box) box.outerHTML = PT.fillModeRow();
    try { if (a.activeDay) a.renderWorkoutView(); } catch (er) { }
  });

})();
