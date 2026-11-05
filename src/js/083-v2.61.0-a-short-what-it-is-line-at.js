
/* =====================================================================
 * PulseTrack 2.61.0: a short "What it is" line at the top of Form tips.
 *
 * Exercises can carry a "desc" in exercises.js (one or two sentences on what the exercise or machine is and what it trains). The Form tips sheet shows it
 * above the numbered steps. The machines added in 2.61.0 (the ones LA Fitness and other big gyms have: dual-axis chest press and pulldown, Hammer Strength
 * super incline press, super fly, wide pulldown, D.Y. row and T-bar row, back extension machine, triceps press, plate-loaded lateral raise, standing hip
 * abductor, iso-lateral leg extension, linear leg press, squat press, glute-ham raise, Precor AMT, and three Smith machine moves) all have one. Exercises
 * without a desc look exactly as before.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof PT === "undefined" || typeof PT.cuesHtml !== "function" || typeof PT.cueFor !== "function") return;
  const esc = s => PT.esc(s);
  const O = PT.cuesHtml;
  PT.cuesHtml = function (name, open) {
    const h = O.apply(this, arguments);
    try {
      const c = h && PT.cueFor(name);
      if (c && c.desc && h.indexOf('<ol class="space-y-1.5">') >= 0)
        return h.replace('<ol class="space-y-1.5">', `<p class="pt-cue-desc text-xs text-zinc-400 leading-snug"><b class="text-zinc-200">What it is:</b> ${esc(c.desc)}</p><ol class="space-y-1.5">`);
    } catch (e) { console.error("PulseTrack form tips description", e); }
    return h;
  };
})();
  