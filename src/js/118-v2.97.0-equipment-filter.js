/* =====================================================================
 * PulseTrack 2.97.0: equipment filter, more kit.
 *  Each gym (Settings → Gyms → edit) already says which equipment it has, and the exercise picker leaves out what it can't do. Now:
 *  - More kit to tick: Bench, Pull-up bar, Suspension trainer (TRX), Stability ball, Medicine ball, Foam roller and Sled.
 *  - Bench and pull-up bar are kit an exercise needs on top of its weights: a dumbbell bench press needs dumbbells AND a bench, a hanging
 *    leg raise a pull-up bar. Read off the name (bench, incline, decline, pull-up, chin-up, hanging, muscle-up) as openGym does, or from
 *    openGym's own "needs". Machines bring their own seat or handles, so they don't need one (a Smith or cable incline press still does).
 *  - openGym exercises use openGym's exact equipment (resistance band, suspension trainer, stability ball ...), not a guess from the name.
 *  - "Show all" in the picker still shows everything, and the workout card says what is missing ("No bench at Home gym").
 *  Nothing is switched off by itself: new kit counts as there until you untick it.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined" || !Array.isArray(PT.EQUIP) || typeof PT.gymAllows !== "function") return;
  const NEW = [["bench", "Bench"], ["pullup", "Pull-up bar"], ["suspension", "Suspension trainer (TRX)"], ["ball", "Stability ball"], ["medball", "Medicine ball"], ["roller", "Foam roller"], ["sled", "Sled"]];
  NEW.forEach(x => { if (!PT.EQUIP.some(y => y[0] === x[0])) PT.EQUIP.push(x); });
  // openGym's equipment words → a gym's kit ("none" = needs no kit)
  const OGMAP = {
    "body weight": "bodyweight", "weighted": "bodyweight", "assisted": "machine",
    "dumbbell": "dumbbell", "cable": "cable", "barbell": "barbell", "olympic barbell": "barbell", "trap bar": "barbell", "landmine": "barbell", "weight plate": "barbell",
    "ez barbell": "ezbar", "leverage machine": "machine", "smith machine": "smith", "kettlebell": "kettlebell", "band": "band", "resistance band": "band",
    "suspension trainer": "suspension", "stability ball": "ball", "bosu ball": "ball", "medicine ball": "medball", "roller": "roller", "massage ball": "roller", "wheel roller": "roller",
    "sled machine": "sled", "elliptical machine": "machine", "stationary bike": "machine", "stepmill machine": "machine", "skierg machine": "machine", "upper body ergometer": "machine",
    "rope": "none", "sandbag": "none", "tire": "none", "hammer": "none", "macebell": "none"
  };
  const entryOf = name => { let e = null; try { e = PT.exCanon(String(name || "")); } catch (err) { } return e || (PT.og && PT.og.get ? PT.og.get(name) : null); };

  const oKey = PT.equipKey;
  PT.equipKey = function (name) {
    const e = entryOf(name);
    if (e && e.eq && OGMAP[e.eq]) return OGMAP[e.eq];
    return oKey.apply(this, arguments);
  };
  /** extra kit the exercise needs besides its weights: "bench", "pullup" */
  PT.equipNeeds = function (name) {
    const e = entryOf(name), out = new Set(), n = String((e && e.name) || name || "").toLowerCase(), k = PT.equipKey(name);
    ((e && e.needs) || []).forEach(x => out.add(x === "pull-up bar" ? "pullup" : x));
    const ownSeat = k === "machine" || (/machine|hammer strength|leverage/.test(n) && !/smith/.test(n));   // a machine has its own seat; a Smith or cable incline still needs a bench
    if (!ownSeat && /\bbench\b|\bincline\b|\bdecline\b/.test(n) && !/bench dip|off bench|bench jump|bench hop|step[- ]up/.test(n)) out.add("bench");
    if (/pull[- ]?ups?\b|chin[- ]?ups?\b|\bhanging\b|muscle[- ]?ups?\b|toes[- ]to[- ]bar|dead hang/.test(n) && !ownSeat && !/band assisted|lat pulldown/.test(n)) out.add("pullup");
    return [...out];
  };
  const gymNow = () => { try { return PT.gym(); } catch (e) { return null; } };
  const pickerOpen = () => { const m = document.getElementById("modal-ex-selector"); return !!m && !m.classList.contains("hidden"); };
  /** the kit this gym lacks for the exercise (its own kit first, then a bench / bar), or "" */
  PT.gymLacks = function (name) {
    const g = gymNow(); if (!g || !g.equip) return "";
    if (PT.isCustomEx && PT.isCustomEx(name)) return "";
    const k = PT.equipKey(name);
    if (k !== "none" && g.equip[k] === false) return k;
    return PT.equipNeeds(name).find(x => g.equip[x] === false) || "";
  };
  const oAllows = PT.gymAllows;
  PT.gymAllows = function (name) {
    if (!oAllows.apply(this, arguments)) return false;
    if (PT._gymOff && pickerOpen()) return true;
    const g = gymNow(); if (!g || !g.equip || (PT.isCustomEx && PT.isCustomEx(name))) return true;
    return !PT.equipNeeds(name).some(x => g.equip[x] === false);
  };
  /** for an openGym entry not in the list yet (the picker's openGym results) */
  PT.eqAllows = e => !e || PT.gymAllows(e.name);
})();
