
/* =====================================================================
 * PulseTrack 2.38.0: "Each side or total?" for weights.
 *  Cable crossovers have two stacks, plate machines have plates on both sides, dumbbells come in pairs. Do you type 25 or 50?
 *  Now you pick, per exercise, and the label above the weight box always says which one the app expects:
 *    Each side · Reps   (type the weight of one stack, one side or one dumbbell; volume counts both)
 *    Total · Reps       (type everything together; volume counts it once)
 *  Tap the label on a cable, machine or dumbbell exercise to change it. Dumbbell moves still start as "Each hand".
 *  Only workouts you save from now on use the new choice; past sessions keep how they were logged.
 * Setting: settings.sideModes = { "Cable Crossover": "each" | "total" }.
 *
 * PulseTrack 2.60.3: the amber "Each stack or total?" now shows on EVERY cable and machine exercise that can have two sides (until you choose), not only
 *  crossovers, flyes and cable presses. Seated cable rows, pulldowns, cable curls, plate-loaded machines, leg presses and the rest ask too. Left out: one-handle and
 *  one-leg moves (single-arm, single-leg) and moves that are one load by nature (leg extensions and curls, calf raises, hip abductors, kickbacks, ab and
 *  woodchopper moves, pec decks, shrugs, pullover machines). Nothing is counted differently until you choose.
 *
 * PulseTrack 2.59.0 / 2.59.1: and are the REPS per hand or total?
 *  EVERY dumbbell exercise (also hammer curls, lateral raises, flyes, kickbacks and the like, whether or not "dumbbell" is in the name), the
 *  one-sided cable and machine moves (single-arm, single-leg, unilateral) and iso-lateral machines get a Reps button next to the weight one:
 *    Reps: per hand · per leg · per side   (10 on each arm: type 10; volume counts both hands)
 *    Reps: total                            (10 on each arm: type 20; volume counts every rep once)
 *  Not offered where there is nothing to split: goblet squats, pullovers, overhead extensions, leg curls (one dumbbell, both hands), barbell, bodyweight.
 *  Nothing chosen = counted exactly as before (the button says which of the two that is). The choice is saved with each set (set.rm = "t" for total)
 *  so volume, e1RM, PRs, strength levels and History read the reps the way you meant them.
 *  Setting: settings.repModes = { "Alternating Dumbbell Curls": "each" | "total" }.
 *  Volume = weights moving on each rep (implementsOf) x reps multiplier (repsMult): hands/legs that take turns add up, those that work together count once.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  const proto = ApplicationUI.prototype;
  const A = () => window.app;
  const esc = s => PT.esc(s);

  /* ================================================================ what the app knows */
  const keyOf = name => { try { const e = PT.exCanon && PT.exCanon(name); return e && e.name ? e.name : String(name || ""); } catch (e) { return String(name || ""); } };
  const modes = () => { const a = A(); const m = a && a.settings && a.settings.sideModes; return m && typeof m === "object" ? m : {}; };
  /** "each", "total" or "" (nothing chosen yet) */
  PT.sideMode = name => { const m = modes(), v = m[keyOf(name)] || m[name]; return v === "each" || v === "total" ? v : ""; };
  /** cable, machine and dumbbell exercises can have a side choice (not barbell, bodyweight or cardio) */
  PT.sideEligible = name => {
    try {
      if (PT.isBodyweightEx && PT.isBodyweightEx(name)) return false;
      if (PT.cardioKind && PT.cardioKind(name)) return false;
      const k = PT.equipKey ? PT.equipKey(name) : "none";
      return k === "cable" || k === "machine" || k === "dumbbell";
    } catch (e) { return false; }
  };
  const isDumbbell = name => { try { return PT.dbCount(name) === 2 || PT.equipKey(name) === "dumbbell"; } catch (e) { return false; } };
  /** one handle or one leg at a time: there is nothing to double */
  const ONE_SIDED = /single[- ]arm|one[- ]arm|single[- ]leg|one[- ]leg|unilateral|alternating|single[- ]hand/i;
  /** moves that are one load by nature (one pad, one strap, one pulley, one sled): "25 or 50?" never comes up */
  const ONE_LOAD = /leg extension|leg curl|calf|hip abduct|hip adduct|abductor|adductor|multi-hip|kickback|pull-?through|crunch|woodchop|side bend|torso|ab coaster|pec dec|shrug|pullover|sissy|y-raise|wrist curl|back extension|\(tabata\)/i;
  /** cable and machine moves that can have two stacks or plates on both sides, where "25 or 50?" really is a question (2.60.3: every one of them, not only crossovers) */
  const asks = name => {
    try {
      if (!PT.sideEligible(name) || isDumbbell(name)) return false;
      const n = String(name || "");
      if (ONE_SIDED.test(n)) return false;
      if (ISO.test(n) || /leg press/i.test(n)) return true;           // each side has its own plates, or a sled with plates on both sides
      return !ONE_LOAD.test(n);
    } catch (e) { return false; }
  };

  /* ================================================================ reps: per hand or total (2.59.0) */
  const repModes = () => { const a = A(); const m = a && a.settings && a.settings.repModes; return m && typeof m === "object" ? m : {}; };
  /** "each" (the reps of one hand or one side), "total" (both added up) or "" (nothing chosen: counted like before) */
  PT.repMode = name => { const m = repModes(), v = m[keyOf(name)] || m[name]; return v === "each" || v === "total" ? v : ""; };
  /** limbs that take turns (one arm, one leg, alternating...): "per hand" really is half of "total" */
  const SEQ = /single[- ]arm|one[- ]arm|single[- ]leg|one[- ]leg|alternating|unilateral|concentration|bulgarian|split squat|step[- ]?ups?|lunge/i;
  /** moves where the two legs take turns, so the reps are per leg rather than per hand */
  const LEGS = /single[- ]leg|one[- ]leg|bulgarian|split squat|step[- ]?ups?|lunge/i;
  /** machines that train each side on its own plates */
  const ISO = /iso-?lateral/i;
  /** one dumbbell held with both hands (or between the feet): no left and right, so nothing to choose */
  const SINGLE_HELD = /goblet|pull-?over|sumo squat|overhead (triceps? )?extension|overhead dumbbell extension|french press|leg curl|kettlebell|hip thrust/i;
  /** a dumbbell move: the app knows it as one (equipment), or "dumbbell"/"DB" is in the name */
  const dbLift = name => {
    try {
      const n = String(name || "");
      if (SINGLE_HELD.test(n)) return false;
      if (PT.equipKey(n) === "dumbbell") return true;
      return /dumbbell|dumbell|\bdbs?\b/i.test(n) && !/barbell|ez[- ]?bar|\bbands?\b|smith|machine|cable/i.test(n);
    } catch (e) { return false; }
  };
  /** every dumbbell move (hammer curls, lateral raises and flyes too, not only the ones with "dumbbell" in the name), one-sided cable moves and iso-lateral machines:
   *  the reps can be counted per hand, or per leg or side, or all together */
  PT.repEligible = name => {
    try {
      const n = String(name || "");
      if ((PT.isBodyweightEx && PT.isBodyweightEx(n)) || (PT.cardioKind && PT.cardioKind(n))) return false;
      if (dbLift(n)) return true;
      return PT.sideEligible(n) && (SEQ.test(n) || ISO.test(n));
    } catch (e) { return false; }
  };
  const handWord = name => (LEGS.test(String(name || "")) ? "leg" : (dbLift(name) || isDumbbell(name) ? "hand" : "side"));
  /** what the word is called in an example: 10 on each arm / leg / side */
  const limbWord = word => (word === "hand" ? "arm" : word);
  /** the weight side only, as it was before reps could be picked */
  function weightDbn(ex) {
    const m = PT.sideMode(ex.name); if (m) return m === "each" ? 2 : 1;
    return (oDbn ? oDbn(ex) : 0) || PT.dbCount(ex.name, ex.reps) || 1;
  }
  /** how many weights move on every rep: 2 for a pair of dumbbells (or "each side" weight), 1 for one dumbbell, one stack or a typed total */
  function implementsOf(ex, mOv) {
    const n = ex.name, m = mOv !== undefined ? mOv : PT.sideMode(n);
    if (LEGS.test(n)) return m ? (m === "each" ? 2 : 1) : (PT.dbCount(n, ex.reps) === 2 ? 2 : 1);
    if (SEQ.test(n)) return m === "total" && dbLift(n) ? 0.5 : 1;               // one dumbbell at a time (a typed total is split between the two)
    return m ? (m === "each" ? 2 : 1) : (isDumbbell(n) ? 2 : 1);
  }
  /** what the reps are multiplied by: limbs that take turns add up (per hand = both hands' reps), limbs that work together count once; "total" is already everything */
  const repsMult = (ex, r) => (SEQ.test(ex.name) ? (r === "total" ? 1 : 2) : (r === "total" ? 0.5 : 1));
  /** 2.63.0: the volume factor a saved exercise gets for a given weight choice ("each" / "total" / "") and reps choice ("each" / "total" / ""), used by Fix old workouts */
  PT.volFactor = (name, reps, side, repsChoice) => {
    const ex = { name, reps };
    if (repsChoice && PT.repEligible(name)) return implementsOf(ex, side) * repsMult(ex, repsChoice);
    return side === "each" ? 2 : side === "total" ? 1 : 0;
  };
  /** 2.63.0: what Fix old workouts needs to know about a name */
  PT.sideInfo = name => {
    const n = String(name || "");
    let side = false, reps = false;
    try { side = !!PT.sideEligible(n) && !ONE_SIDED.test(n); reps = !!PT.repEligible(n); } catch (e) { }
    return { side, reps, db: side && isDumbbell(n), hand: handWord(n) };
  };
  /** which choice matches how volume counts today when nothing was picked: "each", "total" or "" */
  function defaultRep(ex) {
    const legacy = weightDbn(ex), impl = implementsOf(ex);
    if (legacy === impl * repsMult(ex, "each")) return "each";
    if (legacy === impl * repsMult(ex, "total")) return "total";
    return "";
  }

  /** how the number in the weight box is read right now: "each" or "total" */
  function effective(a, ex) {
    const m = PT.sideMode(ex.name); if (m) return m;
    return weightDbn(ex) === 2 ? "each" : "total";
  }
  /** 2.62.0: how the weight box is read for this exercise right now: "e" (each side / each hand), "t" (total), "o" (one-armed or one-legged: nothing to match) or "" (barbell, bodyweight) */
  PT.sideSm = (name, ex) => {
    try {
      const a = A(); if (!a || !name || !PT.sideEligible(name)) return "";
      if (ONE_SIDED.test(String(name))) return "o";                  // one arm / one leg: nothing to match, the mark only says "checked"
      return effective(a, ex && ex.name ? ex : { name, reps: "" }) === "each" ? "e" : "t";
    } catch (e) { return ""; }
  };
  /** short tag for other screens (guided mode): " · each side", " · each hand", " · total", or "" when nothing is special */
  PT.sideTag = ex => {
    const a = A(); if (!a || !ex) return "";
    const se = PT.sideEligible(ex.name), r = PT.repEligible(ex.name) ? PT.repMode(ex.name) : "";
    const rt = r === "total" ? " · reps total" : r === "each" ? " · reps per " + handWord(ex.name) : "";
    if (!se) return rt;
    const m = PT.sideMode(ex.name);
    if (m === "total") return " · total" + rt;
    if (m === "each") return (isDumbbell(ex.name) ? " · each hand" : " · each side") + rt;
    return (isDumbbell(ex.name) ? " · each hand" : "") + rt;
  };

  /* ================================================================ the choice counts in volume (through the dumbbell count the app already has) */
  const oDbn = PT.exDbn;
  PT.exDbn = ex => {
    const m = ex && ex.name ? PT.sideMode(ex.name) : "";
    // reps picked on purpose: hands/sides the weight stands for × (every hand's reps, or the reps of all hands added up counted once → half)
    const r = ex && ex.name && PT.repEligible(ex.name) ? PT.repMode(ex.name) : "";
    if (r) return implementsOf(ex) * repsMult(ex, r);
    if (m === "each") return 2;
    if (m === "total") return 1;
    return oDbn ? oDbn(ex) : 0;
  };

  /* ================================================================ the label above the weight box */
  const oCol = proto.colLabel;
  proto.colLabel = function (ex, kind) {
    const base = oCol.apply(this, arguments);
    if (!ex || !kind || kind.cardio || kind.bw) return base;
    const both = PT.repEligible(ex.name), sideOk = PT.sideEligible(ex.name);
    if (!sideOk && !both) return base;
    const idx = this.activeDay && this.activeDay.exercises ? this.activeDay.exercises.indexOf(ex) : -1;
    const repBtn = () => {
      const r = PT.repMode(ex.name), word = handWord(ex.name), d = defaultRep(ex), shown = r || d;
      const rText = shown === "each" ? `Reps: per ${word}` : shown === "total" ? "Reps: total" : "Reps";
      return `<button type="button" class="pt-rep-lbl${r ? "" : " dflt"}" data-exindex="${idx}" aria-label="Are the reps for ${esc(ex.name)} per ${word} or total? Tap to change">${esc(rText)} <span aria-hidden="true">▾</span></button>`;
    };
    // no each-side/total choice for the weight (lunges, step-ups, chest-supported rows...): the plain label, then the reps button
    if (!sideOk) return `<span class="pt-lbl-grp"><span>${esc(String(base || "Weight · Reps").replace(/<[^>]*>/g, "").replace(/\s*·\s*Reps\s*$/i, "") || "Weight")}</span>${repBtn()}</span>`;
    const m = PT.sideMode(ex.name), db = isDumbbell(ex.name);
    let text, cls = "";
    if (m === "each") text = (db ? "Each hand" : "Each side") + " · Reps";
    else if (m === "total") text = "Total · Reps";
    else if (db) text = "Each hand · Reps";
    else if (asks(ex.name)) { text = "Each stack or total?"; cls = " ask"; }
    else text = String(base || "Weight · Reps");
    if (both) text = text.replace(/ · Reps$/, "");                       // the reps get a button of their own right next to it
    const wBtn = `<button type="button" class="pt-side-lbl${cls}" data-exindex="${idx}" aria-label="How do you enter the weight for ${esc(ex.name)}? Tap to change">${esc(text)} <span aria-hidden="true">▾</span></button>`;
    if (!both) return wBtn;
    return `<span class="pt-lbl-grp">` + wBtn + repBtn() + `</span>`;
  };

  /* ================================================================ the picker */
  /** save the weight choice (field "sideModes") or the reps choice (field "repModes") of an exercise: "each", "total", or "" to go back to the default */
  function saveMode(name, m, field) {
    const a = A(); if (!a) return;
    const next = Object.assign({}, field === "repModes" ? repModes() : modes()), k = keyOf(name);
    delete next[name];
    if (m === "each" || m === "total") next[k] = m; else delete next[k];
    a.settings[field] = next;
    try { WorkoutStorage.saveSettings(a.settings); } catch (e) { }
    try { a.renderWorkoutView(); } catch (e) { }
  }
  /** 2.64.0: the exercise sheet changes the same choices (PT.setSideMode(name, "each" | "total" | "")) and reads what counts right now */
  PT.setSideMode = (name, m) => saveMode(name, m, "sideModes");
  PT.setRepMode = (name, m) => saveMode(name, m, "repModes");
  PT.sideNow = name => { const a = A(); return a ? effective(a, { name, reps: "" }) : ""; };
  PT.repNow = name => PT.repMode(name) || defaultRep({ name, reps: "" });
  function openPicker(ex) {
    const a = A(); if (!a || !ex) return;
    const cur = PT.sideMode(ex.name), eff = effective(a, ex), db = isDumbbell(ex.name), u = (a.wLabel && a.wLabel()) || "lb";
    const side = db ? "hand" : "side";
    const opt = (m, title, line, ex2) => `<button type="button" class="pt-side-opt${cur === m ? " on" : ""}" data-m="${m}" aria-pressed="${cur === m}">
        <span class="pt-side-t">${title}${cur === m ? " ✓" : (!cur && eff === m ? ' <span class="pt-side-def">counted this way now</span>' : "")}</span><span class="pt-side-d">${line}</span><span class="pt-side-e">${ex2}</span></button>`;
    const el = a.openSheet(ex.name, "How do you enter the weight?", `<div class="space-y-2">
        ${opt("each", db ? "Each hand" : "Each side", db ? "The weight of ONE dumbbell. Volume counts both hands." : "One stack, one side of the machine, or the plates on one side. Volume counts both sides.", `Two 25 ${u} stacks: type <b>25</b>. Volume counts 50.`)}
        ${opt("total", "Total", "Everything together, as one number. Volume counts it once.", `Two 25 ${u} stacks: type <b>50</b>.`)}
      </div>
      <p class="text-[11px] text-zinc-400 leading-snug mt-3">Numbers already typed in today's workout stay as you typed them. Only workouts you save from now on use this; past sessions keep how they were logged.</p>
      ${cur ? `<button type="button" class="pt-side-reset" data-m="">Back to the app's default for this exercise</button>` : ""}`, "");
    el.querySelectorAll("[data-m]").forEach(b => b.addEventListener("click", () => {
      const m = b.dataset.m;
      a.closeSheet();
      saveMode(ex.name, m, "sideModes");
      a.toast(m === "each" ? `${ex.name}: type the weight of one ${side}` : m === "total" ? `${ex.name}: type the total weight` : `${ex.name}: back to the default`);
    }));
  }
  function openRepPicker(ex) {
    const a = A(); if (!a || !ex) return;
    const cur = PT.repMode(ex.name), word = handWord(ex.name), limb = limbWord(word), def = defaultRep(ex);
    const opt = (m, title, line, ex2) => `<button type="button" class="pt-side-opt${cur === m ? " on" : ""}" data-m="${m}" aria-pressed="${cur === m}">
        <span class="pt-side-t">${title}${cur === m ? " ✓" : (!cur && def === m ? ' <span class="pt-side-def">counted this way now</span>' : "")}</span><span class="pt-side-d">${line}</span><span class="pt-side-e">${ex2}</span></button>`;
    const el = a.openSheet(ex.name, "Are your reps per " + word + " or total?", `<div class="space-y-2">
        ${opt("each", "Per " + word, `The reps of ONE ${word}. Both ${word}s did that many, so volume counts both.`, `10 on each ${limb}: type <b>10</b>.`)}
        ${opt("total", "Total", "Both added together, as one number. Volume counts every rep once.", `10 on each ${limb}: type <b>20</b>.`)}
      </div>
      <p class="text-[11px] text-zinc-400 leading-snug mt-3">Numbers already typed in today's workout stay as you typed them. Only workouts you save from now on use this; past sessions keep how they were logged. Volume, estimated 1RM, records and strength levels all read your reps this way.</p>
      ${cur ? `<button type="button" class="pt-side-reset" data-m="">Back to the app's default for this exercise</button>` : ""}`, "");
    el.querySelectorAll("[data-m]").forEach(b => b.addEventListener("click", () => {
      const m = b.dataset.m;
      a.closeSheet();
      saveMode(ex.name, m, "repModes");
      a.toast(m === "each" ? `${ex.name}: type the reps of one ${word}` : m === "total" ? `${ex.name}: type the reps of both ${word}s together` : `${ex.name}: back to the default`);
    }));
  }
  document.addEventListener("click", e => {
    const rb = e.target.closest && e.target.closest(".pt-rep-lbl");
    if (rb) {
      const a = A(); if (!a || !a.activeDay) return;
      const ex = (a.activeDay.exercises || [])[parseInt(rb.dataset.exindex, 10)];
      if (ex) { e.preventDefault(); openRepPicker(ex); }
      return;
    }
    const b = e.target.closest && e.target.closest(".pt-side-lbl"); if (!b) return;
    const a = A(); if (!a || !a.activeDay) return;
    const ex = (a.activeDay.exercises || [])[parseInt(b.dataset.exindex, 10)];
    if (ex) { e.preventDefault(); openPicker(ex); }
  });

  /* ================================================================ the choice travels with each set */
  const oEts = proto.entryToSet;
  if (typeof oEts === "function") proto.entryToSet = function (ex, entry) {
    const st = oEts.apply(this, arguments);
    try { if (st && ex && ex.name && !PT.isCardioSet(st) && PT.repEligible(ex.name) && PT.repMode(ex.name) === "total") st.rm = "t"; } catch (e) { }
    // 2.62.0: how the weight was typed (e = each side / each hand, t = total), so strength levels can match it to the standard
    try { const sm = PT.sideSm(ex && ex.name, ex); if (sm && st && !PT.isCardioSet(st)) st.sm = sm; } catch (e) { }
    return st;
  };
  /** an estimated 1RM needs the reps of ONE hand: "total" reps are halved for it */
  const oE1 = proto.setE1rm;
  if (typeof oE1 === "function") proto.setE1rm = function (name, st, ds) {
    if (st && st.rm === "t") st = Object.assign({}, st, { r: (parseFloat(st.r) || 0) / 2 });
    return oE1.call(this, name, st, ds);
  };
  const oTxt = proto.setText;
  if (typeof oTxt === "function") proto.setText = function (name, st) {
    const t = oTxt.apply(this, arguments);
    return st && st.rm === "t" && typeof t === "string" ? t + " total" : t;
  };

  /* ================================================================ styles */
  const css = document.createElement("style"); css.id = "pt-v238-side-css";
  css.textContent = `
    .pt-side-lbl { display: inline-flex; align-items: center; gap: .25rem; padding: .1rem .45rem; margin: -.1rem 0; border-radius: .5rem; border: 1px dashed rgb(var(--z700)); background: transparent; color: rgb(var(--z300)); font: inherit; font-size: inherit; letter-spacing: inherit; text-transform: inherit; white-space: nowrap; }
    .pt-side-lbl:active, .pt-rep-lbl:active { background: rgb(var(--z800)); }
    .pt-rep-lbl { display: inline-flex; align-items: center; gap: .25rem; padding: .1rem .45rem; margin: -.1rem 0; border-radius: .5rem; border: 1px dashed rgb(var(--z700)); background: transparent; color: rgb(var(--z300)); font: inherit; font-size: inherit; letter-spacing: inherit; text-transform: inherit; font-weight: inherit; white-space: nowrap; }
    .pt-lbl-grp { display: inline-flex; align-items: center; gap: .35rem; flex-wrap: nowrap; }
    .pr-10:has(> .pt-lbl-grp) { padding-right: .25rem; }
    @media (max-width: 349px) { .pt-lbl-grp { flex-wrap: wrap; justify-content: center; row-gap: .3rem; } }
    .pt-rep-lbl:not(.dflt) { border-color: rgb(var(--a500) / .7); color: rgb(var(--a300)); }
    .pt-side-lbl.ask { border-color: rgb(251 191 36 / .7); color: rgb(251 191 36); font-weight: 700; }
    .pt-side-opt { display: flex; flex-direction: column; gap: .2rem; width: 100%; text-align: left; padding: .8rem .9rem; border-radius: .9rem; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); }
    .pt-side-opt.on { border-color: rgb(var(--a600)); background: rgb(var(--a600) / .12); }
    .pt-side-t { font-size: .9rem; font-weight: 800; color: rgb(var(--z100)); }
    .pt-side-def { font-size: .65rem; font-weight: 600; color: rgb(var(--z400)); margin-left: .35rem; }
    .pt-side-d { font-size: .75rem; color: rgb(var(--z400)); line-height: 1.3; }
    .pt-side-e { font-size: .75rem; color: rgb(var(--z300)); }
    .pt-side-reset { margin-top: .6rem; width: 100%; padding: .6rem; border-radius: .75rem; font-size: .75rem; font-weight: 700; color: rgb(var(--z400)); background: rgb(var(--z900)); border: 1px solid rgb(var(--z800)); }
  `;
  document.head.appendChild(css);
})();
  