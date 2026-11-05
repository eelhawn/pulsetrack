
/* =====================================================================
 * PulseTrack 2.23.0: fixes from a full run through the app.
 *  - The rep range in the box on the workout screen ("10-12") was cut off to "10-". The box now fits it.
 *  - Buttons that were too small to hit reliably (set type, move / swap / remove, rest +-15, Select, month arrows, Skip, Calendar,
 *    Yesterday?, delete a body entry) keep their look but are easier to tap.
 *  - Small grey text in dark mode is a little brighter, so it can be read in a bright gym (patch_v23.py, the dark text scale).
 *  - A workout you start before midnight and finish after is saved on the day you started it (see patch_v23.py).
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;

  // elements whose tap area grows by a few pixels in every direction (their look does not change)
  const HIT = [".btn-cycle-tag", "#btn-timer-sub15", "#btn-timer-add15", ".body-del", "#btn-cal-prev", "#btn-cal-next", "#pm-prev", "#pm-next",
    "#pt-sel-btn", "#pt-sel-wk-btn", '#view-programs button[aria-label^="Select "]', ".body-range", "#pt-nudge-x"];
  // small text buttons in a row (Form tips, Clips, Bar path, Rest): they grow up and down only, so they never reach into their neighbours (2.51.1)
  const HIT_Y = [".btn-cues", ".pt-fc-btn", ".pt-bar-btn", ".btn-rest-edit", ".btn-rest-ex"];
  // the move / swap / remove buttons sit close together, so they grow less
  const HIT_TIGHT = ['#view-workout button[aria-label^="Move "]', ".btn-swap-ex", ".btn-delete-ex"];
  const grow = (list, inset) => list.map(s => s + "::after").join(",\n    ") + " { content: \"\"; position: absolute; inset: " + inset + "; }\n    " + list.join(",\n    ") + " { position: relative; }";

  const css = document.createElement("style");
  css.id = "pt-v223-css";
  css.textContent = `
    #view-workout input.input-set-field[data-field="reps"] { padding-left: .125rem; padding-right: .3rem; }
    ${grow(HIT, "-6px")}
    ${grow(HIT_TIGHT, "-3px -2px")}
    ${grow(HIT_Y, "-6px 0")}
    #view-home #btn-home-skip { padding: .55rem .9rem; }
    #view-home #pt-work-day { padding: .5rem .6rem; margin: -.4rem -.6rem -.5rem 0; }
    #view-home #pt-week-cal { padding: .5rem .85rem; }
    #pm-prev, #pm-next, #btn-cal-prev, #btn-cal-next { min-width: 2rem; }
  `;
  document.head.appendChild(css);
})();
  