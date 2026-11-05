
/* =====================================================================
 * PulseTrack 2.60.0: dumbbells count both hands, everywhere.
 *
 * The weight button on a dumbbell exercise has always said "Each hand", but the volume only counted two dumbbells when the NAME had the word
 * "dumbbell" in it. Hammer curls, lateral raises, front raises, rear delt flyes, flyes, kickbacks, Zottman curls and the like (the app knows they are
 * dumbbell exercises, the name just doesn't say so) counted one dumbbell, so their volume was half of what you lifted.
 *   - PT.dbCount now says 2 for every dumbbell exercise the app knows by its equipment, except one-dumbbell moves (goblet squat, pullover, overhead
 *     extension, side bend, single-arm...), barbell, cable, machine, plate and band moves, and your own exercises (those keep the kind you picked).
 *   - Old workouts are worked out again once, at the first launch of this version. Home says so, in one line, with Undo.
 *   - Settings: "Count both dumbbells" turns it off again (volume goes back to counting one for those exercises). Sets saved with an explicit
 *     choice (Each hand / Total, set.dbn) are never touched.
 * Setting: settings.dbPair = "legacy" (only when turned off), settings.dbPairVer (migration done), settings.dbPairNote ({n, from, to} until dismissed).
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined" || typeof PT.dbCount !== "function") return;
  const proto = ApplicationUI.prototype, $ = id => document.getElementById(id), A = () => window.app;

  /** one dumbbell (held with both hands, or one arm at a time), or not a dumbbell at all, even if the app files it under dumbbells */
  const SINGLE = /single[- ]?arm|one[- ]?arm|single[- ]?leg|one[- ]?leg|goblet|concentration|pull-?over|kettlebell|hip thrust|sumo squat|leg curl|side bend|cross-?body triceps|pronation|overhead (triceps? )?extension|overhead dumbbell extension|french press|barbell|ez[- ]?bar|\bcable\b|machine|smith|\bplates?\b|\bbands?\b|meadow|landmine|lying lateral/i;
  const ARM = /\/\s*arm|per arm|each arm|one arm/;

  let force = "";          // "legacy" or "both" while before and after are compared
  const mode = () => { if (force) return force; const a = A(); return a && a.settings && a.settings.dbPair === "legacy" ? "legacy" : "both"; };

  const O = PT.dbCount;
  PT.dbCount = function (name, reps) {
    const n = O.apply(this, arguments);
    if (n === 2 || mode() === "legacy") return n;
    try {
      if (PT.isCustomEx && PT.isCustomEx(name)) return n;                    // your own exercises keep the kind you picked
      if (ARM.test(String(reps || "").toLowerCase())) return n;
      if (PT.equipKey && PT.equipKey(name) === "dumbbell" && !SINGLE.test(String(name || ""))) return 2;
    } catch (e) { }
    return n;
  };

  /* ================================================================ old totals, worked out again once */
  const volumes = (a, m) => { force = m; try { return (a.sessions || []).map(s => a.sessionVolume(s)); } finally { force = ""; } };
  function migrate(a) {
    const s = a.settings;
    if (s.dbPairVer === 1) return;
    s.dbPairVer = 1;
    try {
      const list = a.sessions || [];
      if (list.length) {
        const before = volumes(a, "legacy"), after = volumes(a, "both");
        let n = 0, from = 0, to = 0;
        before.forEach((v, i) => { from += v; to += after[i]; if (Math.abs(after[i] - v) > 0.5) n++; });
        if (n) {
          a.recomputeVolumes();
          s.dbPairNote = { n, from: Math.round(from), to: Math.round(to) };
        }
      }
    } catch (e) { console.error("PulseTrack dumbbell volume", e); }
    try { WorkoutStorage.saveSettings(s); } catch (e) { }
  }
  const oInit = proto.initV4;
  if (typeof oInit === "function") proto.initV4 = function () {
    const r = oInit.apply(this, arguments);
    migrate(this);
    return r;
  };

  /* ================================================================ one line on Home, with Undo */
  const oBan = proto.renderHomeBanners;
  if (typeof oBan === "function") proto.renderHomeBanners = function () {
    const r = oBan.apply(this, arguments);
    try {
      const a = this, note = a.settings.dbPairNote, box = $("home-banners");
      if (!box || !note || !note.n) return r;
      const pct = note.from > 0 ? Math.round((note.to - note.from) / note.from * 100) : 0;
      const el = document.createElement("div");
      el.className = "border border-emerald-800/60 bg-emerald-950/30 rounded-xl p-3 text-xs text-zinc-300 flex items-start gap-3";
      el.setAttribute("data-banner", "dbpair");
      el.innerHTML = `<div class="flex-grow leading-relaxed"><b class="text-white">Dumbbell volume fixed.</b> Hammer curls, raises, flyes and similar now count both dumbbells. ${note.n} past workout${note.n === 1 ? "" : "s"} updated${pct > 0 ? " (+" + pct + "% volume)" : ""}.</div>
        <div class="flex flex-col gap-1.5 shrink-0"><button type="button" class="pt-dbp-undo px-2.5 py-1.5 bg-zinc-800 text-zinc-300 rounded-lg tap-active">Undo</button><button type="button" class="pt-dbp-ok px-2.5 py-1.5 bg-emerald-600 text-white font-bold rounded-lg tap-active">Got it</button></div>`;
      box.insertBefore(el, box.firstChild);
      el.querySelector(".pt-dbp-ok").addEventListener("click", () => { delete a.settings.dbPairNote; WorkoutStorage.saveSettings(a.settings); a.renderHomeBanners(); });
      el.querySelector(".pt-dbp-undo").addEventListener("click", () => { setPair(a, false); a.toast("Back to counting one dumbbell on those exercises"); a.renderHomeBanners(); });
    } catch (e) { console.error("PulseTrack dumbbell volume note", e); }
    return r;
  };

  /** turn the fix on or off and work every old total out again */
  function setPair(a, on) {
    const s = a.settings;
    if (on) delete s.dbPair; else s.dbPair = "legacy";
    delete s.dbPairNote;
    try { WorkoutStorage.saveSettings(s); } catch (e) { }
    try { a.recomputeVolumes(); } catch (e) { console.error("PulseTrack dumbbell volume", e); }
    try { a.renderHomeView && a.renderHomeView(); } catch (e) { }
    try { const t = $("setting-toggle-dbpair"); if (t) t.checked = on; } catch (e) { }
  }

  /* ================================================================ the switch in Settings */
  const oEx = proto.renderSettingsExtras;
  if (typeof oEx === "function") proto.renderSettingsExtras = async function () {
    const r = await oEx.apply(this, arguments);
    try {
      if (!$("pt-dbpair-row")) {
        const ref = $("pt-simple-row") || $("pt-resume-row") || $("pt-tabs-row") || $("pt-gym-row") || $("pt-textsize");
        if (ref) {
          const row = document.createElement("label");
          row.id = "pt-dbpair-row"; row.className = "flex items-center justify-between gap-3 mt-3 cursor-pointer";
          row.innerHTML = '<span><span class="block text-xs font-bold text-zinc-100">Count both dumbbells</span><span class="block text-[11px] text-zinc-400">Volume counts two dumbbells on every dumbbell exercise, hammer curls and raises too. Off: one dumbbell on those.</span></span><input type="checkbox" id="setting-toggle-dbpair" class="accent-emerald-500 w-5 h-5 shrink-0">';
          ref.insertAdjacentElement("afterend", row);
          row.querySelector("input").addEventListener("change", ev => { const a = A(); setPair(a, ev.target.checked); a.toast(ev.target.checked ? "Dumbbell volume counts both hands" : "Back to counting one dumbbell on those exercises"); });
        }
      }
      const t = $("setting-toggle-dbpair"), a = A(); if (t && a) t.checked = a.settings.dbPair !== "legacy";
    } catch (e) { console.error("PulseTrack dumbbell volume setting", e); }
    return r;
  };
})();
  