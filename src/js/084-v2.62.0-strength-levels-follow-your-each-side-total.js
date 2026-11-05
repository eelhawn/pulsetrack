
/* =====================================================================
 * PulseTrack 2.62.0: strength levels follow your "each side / total" and "per hand / total" choices.
 *  StrengthLevel.com counts a dumbbell move PER HAND and a machine or cable move as the TOTAL load. Your level now compares the same thing:
 *    machine or cable, weight "Each side" -> doubled (a 30 lb stack on each side is graded as 60 lb)
 *    dumbbells, weight "Total" -> halved (both dumbbells together are graded per hand)
 *    reps "Total" -> halved to the reps of one hand (this part already worked, now it is on the screen)
 *  Barbell, bodyweight, one-arm and one-leg moves are never changed. Sets saved from now on remember how the weight was typed (set.sm); older sets use the
 *  dumbbell count saved with the exercise. Estimated 1RM, records, volume and History still show the number you typed.
 *  Also: ~15 more exercises get their own StrengthLevel.com table (cable crunch, reverse curl, wrist curls, upright row, farmer's walk) and every
 *  machine added in 2.61.0 has a level. Cardio, stretches, mobility, bands, jumps and sleds have no 1RM, so they have no level.
 *  Setting: settings.slConv = false (only when turned off). Settings -> "Match strength levels".
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  const proto = ApplicationUI.prototype;
  const A = () => window.app;
  const $ = id => document.getElementById(id);

  const oEx = proto.renderSettingsExtras;
  if (typeof oEx === "function") proto.renderSettingsExtras = async function () {
    const r = await oEx.apply(this, arguments);
    try {
      if (!$("pt-slconv-row")) {
        const ref = $("pt-typo-row") || $("pt-dbpair-row") || $("pt-simple-row") || $("pt-resume-row") || $("pt-tabs-row") || $("pt-gym-row") || $("pt-textsize");
        if (ref) {
          const row = document.createElement("label");
          row.id = "pt-slconv-row"; row.className = "flex items-center justify-between gap-3 mt-3 cursor-pointer";
          row.innerHTML = '<span><span class="block text-xs font-bold text-zinc-100">Match strength levels</span><span class="block text-[11px] text-zinc-400">Dumbbells are graded per hand, machines and cables as both sides together, using your Each side / Total choice.</span></span><input type="checkbox" id="setting-toggle-slconv" class="accent-emerald-500 w-5 h-5 shrink-0">';
          ref.insertAdjacentElement("afterend", row);
          row.querySelector("input").addEventListener("change", ev => {
            const a = A(); if (ev.target.checked) delete a.settings.slConv; else a.settings.slConv = false;
            WorkoutStorage.saveSettings(a.settings);
            try { if (a.renderProgressView && $("progress-body")) a.renderProgressView(); } catch (e) { }
          });
        }
      }
      const t = $("setting-toggle-slconv"), a = A(); if (t && a) t.checked = a.settings.slConv !== false;
    } catch (e) { console.error("PulseTrack strength level match setting", e); }
    return r;
  };
})();
  