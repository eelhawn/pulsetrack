
/* =====================================================================
 * PulseTrack 2.60.1: Russian twists (and the other body-loaded core moves) work like sit-ups: 0 is your body, a number is extra weight.
 *
 * Sit-ups, decline sit-ups, weighted sit-ups, push-ups, planks and the rest of the Library's "Bodyweight" exercises already read the weight box as
 * "0 = just your body, a number = extra weight on top" (2.54.0). Russian Twists, Decline Russian Twists and Weighted Russian Twists were filed under
 * "no equipment" instead, so their box said "Weight" and a 25 counted as only 25 lb. Now these count as bodyweight exercises too, so one exercise
 * does for the plain and the weighted version: type 0 for just your body, or the weight you hold / wear.
 *   Russian Twists, Decline Russian Twists, Weighted Russian Twists, Bent-Over Twists, Broomstick Twists, Seated Twists, Ab Wheel Rollouts,
 *   Stability Ball Rollouts, Leg Pull-Ins, Incline Leg Pull-Ins, Stability Ball Pull-Ins, Bent-Knee Hip Raises, Bottoms Up.
 * Past sets on these exercises that had a number typed are read the same way as in 2.54.0 (a number of half your body weight or more is taken as the
 * whole load), and their totals are worked out again once. Sets typed as 0 already counted your body weight and do not change. Your own exercises
 * keep the kind you picked. Pallof presses, woodchoppers and bear crawls are not on the list.
 * Setting: settings.bwCoreVer = 1 once the old totals have been worked out.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined" || typeof PT.isBwMove !== "function" || typeof PT.equipKey !== "function") return;
  const proto = ApplicationUI.prototype;
  const LIST = /russian twist|^(bent-over|broomstick|seated) twists?$|^ab wheel rollouts?$|^stability ball (rollouts?|pull-ins?)$|^(incline )?leg pull-ins?$|^bent-knee hip raises?$|^bottoms up$/i;
  const memo = new Map();
  /** true for the exercises that are loaded by your own body but were filed under "no equipment" */
  const core = name => {
    const n = String(name || ""); if (!n) return false;
    let v = memo.get(n);
    if (v === undefined) {
      v = false;
      try {
        if (!/\(tabata\)/i.test(n) && !(PT.isCustomEx && PT.isCustomEx(n)) && !(PT.isBodyweightEx && PT.isBodyweightEx(n))) {
          const e = PT.exCanon ? PT.exCanon(n) : null;
          v = LIST.test(n) || !!(e && LIST.test(e.name));
        }
      } catch (err) { v = false; }
      memo.set(n, v);
    }
    return v;
  };
  PT.isBodyweightCore = core;

  const oKey = PT.equipKey;
  PT.equipKey = function (name) { const k = oKey.apply(this, arguments); return k === "none" && core(name) ? "bodyweight" : k; };
  const oMove = PT.isBwMove;
  PT.isBwMove = function (name) { return oMove.apply(this, arguments) || (core(name) && !/\(tabata\)/i.test(String(name))); };

  /* old totals, worked out again once (only when a past set on one of these exercises had a number typed) */
  const hasNumber = list => (list || []).some(s => (s.ex || []).some(e => core(e.name) && (e.sets || []).some(st => st && !(PT.isCardioSet && PT.isCardioSet(st)) && (parseFloat(st.w) || 0) > 0)));
  const oInit = proto.initV4;
  if (typeof oInit === "function") proto.initV4 = function () {
    const r = oInit.apply(this, arguments);
    try {
      const s = this.settings;
      if (s.bwCoreVer !== 1) {
        s.bwCoreVer = 1;
        if (hasNumber(this.sessions)) { this.recomputeVolumes(); this.recomputeSessionPRs(); this.rebuildPRs(); }
        WorkoutStorage.saveSettings(s);
      }
    } catch (e) { console.error("PulseTrack twists bodyweight", e); }
    return r;
  };
})();
  