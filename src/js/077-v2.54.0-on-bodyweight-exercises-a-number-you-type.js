
/* =====================================================================
 * PulseTrack 2.54.0: on bodyweight exercises, a number you type is EXTRA weight on top of your body.
 *
 * Before: pull-ups and dips already worked that way, but push-ups, sit-ups, planks, hanging leg raises, back extensions, bench dips, bodyweight squats
 * and the rest of the bodyweight exercises did not. A 0 counted your whole body (say 180 lb) and a 30 counted as only 30 lb, so adding weight made the
 * set worth LESS than none.
 *
 * Now, on every exercise that is just your body (the same list the Library calls "Bodyweight"):
 *   0  = just your body       -> counts your body weight (unchanged)
 *   30 = 30 lb on top of you  -> counts body weight + 30 (180 + 30 = 210)
 *   (blank still counts as nothing)
 * Volume, estimated 1RM, PRs, charts, strength levels and the History text ("BW+30 x 12") all use it. The box says +lbs, the column says "Added",
 * and a one-line note shows the sum as you type. Older sets are read the same way, unless the number was clearly the whole load (half your body weight
 * or more, from before this version), and old totals are worked out again once.
 *
 * Also: the bottom Workout tab opens the Programs page (a running workout still opens when you come from another tab; tapping the tab you are on goes
 * to the Programs page).
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  const proto = ApplicationUI.prototype;
  const A = () => window.app;
  const esc = s => PT.esc(s);
  const num = (v, d) => PT.num(v, d == null ? 1 : d);

  /** exercises that are your own body, other than the pull-up/dip family (those already add weight to your body their own way) */
  const memo = new Map();
  PT.isBwMove = function (name) {
    const n = String(name || ""); if (!n) return false;
    try {
      if (PT.isBodyweightEx && PT.isBodyweightEx(n)) return false;
      if (/\(tabata\)/i.test(n)) return false;
      if (!PT.equipKey) return false;
      let v = memo.get(n); if (v === undefined) { v = PT.equipKey(n) === "bodyweight"; memo.set(n, v); }
      return v;
    } catch (e) { return false; }
  };

  const bwFor = (a, st, ds) => parseFloat(st && st.bw) || (a.bwOn ? a.bwOn(ds) : 0) || 0;
  /** a set from before this version whose number was clearly the whole load, not extra weight */
  const wholeLoad = (a, st, ds) => { const x = parseFloat(st && st.w) || 0, bw = bwFor(a, st, ds); return !st.bx && bw > 0 && x >= bw * 0.5; };
  /** the extra weight in one set of a bodyweight exercise (0 when none, or when it was the whole load) */
  PT.bwAdded = function (name, st, ds) {
    const a = A(); const x = parseFloat(st && st.w) || 0;
    if (!a || !st || !(x > 0) || !PT.isBwMove(name) || PT.isCardioSet(st)) return 0;
    return wholeLoad(a, st, ds) ? 0 : x;
  };
  const hasAdded = st => st && !PT.isCardioSet(st) && (parseFloat(st.w) || 0) > 0;

  /* ---------------------------------------------------------- the maths */
  const oLoad = proto.setLoad;
  proto.setLoad = function (name, st, ds) {
    try {
      if (hasAdded(st) && PT.isBwMove(name)) {
        const x = parseFloat(st.w) || 0, bw = bwFor(this, st, ds);
        if (!(bw > 0)) return x;                 // no body weight logged yet: the extra weight alone, like pull-ups
        if (wholeLoad(this, st, ds)) return x;   // an older entry that already was the whole load
        return bw + x;
      }
    } catch (e) { console.error("PulseTrack added weight", e); }
    return oLoad.apply(this, arguments);
  };

  // new sets remember that the number is extra weight, and the body weight of the day
  const oEntry = proto.entryToSet;
  proto.entryToSet = function (ex, entry) {
    const st = oEntry.apply(this, arguments);
    try {
      if (st && hasAdded(st) && !this.exKind(ex).bw && PT.isBwMove(ex && ex.name)) {
        st.bx = 1;
        const bw = this.bwOn(PT.ds()); if (bw > 0) st.bw = bw;
      }
    } catch (e) { console.error("PulseTrack added weight set", e); }
    return st;
  };

  // History and share cards: BW+30 x 12
  const oText = proto.setText;
  proto.setText = function (name, st) {
    try {
      if (hasAdded(st) && PT.isBwMove(name) && !wholeLoad(this, st, null)) return "BW+" + PT.num(st.w, 2) + " × " + PT.num(st.r, 0);
    } catch (e) { }
    return oText.apply(this, arguments);
  };

  // strength levels: the extra weight is what the standards compare
  // (m55a reads PT.bwAdded when it is there)

  /* ---------------------------------------------------------- old totals, worked out again */
  const anyAdded = list => (list || []).some(s => (s.ex || []).some(e => PT.isBwMove(e.name) && (e.sets || []).some(hasAdded)));
  const recompute = a => { a.recomputeVolumes(); a.recomputeSessionPRs(); a.rebuildPRs(); };
  const oBody = proto.onBodyChanged;
  proto.onBodyChanged = function () {
    const r = oBody.apply(this, arguments);
    try { if (anyAdded(this.sessions)) recompute(this); } catch (e) { console.error("PulseTrack added weight recompute", e); }
    return r;
  };
  const oInit = proto.initV4;
  if (oInit) proto.initV4 = function () {
    const r = oInit.apply(this, arguments);
    try {
      const s = this.settings;
      if (s.bwAddVer !== 1) {
        if (anyAdded(this.sessions)) recompute(this);
        s.bwAddVer = 1; WorkoutStorage.saveSettings(s);
      }
    } catch (e) { console.error("PulseTrack added weight init", e); }
    return r;
  };

  /* ---------------------------------------------------------- what the screen says */
  const kindOf = (a, ex) => { try { return a.exKind(ex); } catch (e) { return {}; } };
  const isMoveEx = (a, ex) => { const k = kindOf(a, ex); return !!(ex && !k.cardio && !k.bw && ex.type !== "tabata" && PT.isBwMove(ex.name)); };

  const oCol = proto.colLabel;
  proto.colLabel = function (ex, kind) {
    const base = oCol.apply(this, arguments);
    try { if (ex && kind && !kind.cardio && !kind.bw && ex.type !== "tabata" && PT.isBwMove(ex.name) && typeof base === "string" && base.indexOf("<") < 0) return "Added · Reps"; } catch (e) { }
    return base;
  };

  /** one line about what counts, from the weights typed in the boxes (strings) */
  function noteFor(a, vals) {
    const nums = vals.filter(v => String(v == null ? "" : v).trim() !== "").map(parseFloat).filter(isFinite);
    if (!nums.length) return "";
    const bw = a.bwOn(PT.ds()), u = esc(a.wLabel()), pos = nums.find(n => n > 0);
    if (!(bw > 0)) return `<button type="button" data-bwlog="1" class="w-full text-left text-[11px] text-amber-300 font-semibold tap-active">⚠ Your body counts too. Log your body weight in Body &amp; Photos so these sets count it (tap)</button>`;
    return pos
      ? `<p class="text-[11px] text-zinc-400 leading-snug">Your body counts too: <b class="font-mono text-zinc-200">${esc(num(bw))} + ${esc(num(pos, 2))} = ${esc(num(bw + pos))} ${u}</b>. A 0 is just your body.</p>`
      : `<p class="text-[11px] text-zinc-400 leading-snug">A 0 is just your body, <b class="font-mono text-zinc-200">${esc(num(bw))} ${u}</b>. A number is extra weight on top (vest, plate, dumbbell).</p>`;
  }
  const oBar = proto.kindBarHtml;
  proto.kindBarHtml = function (ex, exIndex) {
    try {
      if (ex && this.settings.showLogger !== false && this.activeProgram && this.activeDay && isMoveEx(this, ex)) {
        const vals = [];
        for (let s = 0; s < (ex.sets || 0); s++) { const e = this.logs[this.getLogKey(this.activeProgram.id, this.activeDay.dayNumber, ex.id, s)]; vals.push(e ? e.weight : ""); }
        const t = noteFor(this, vals);
        return `<div data-bwnote="${exIndex}" class="bg-zinc-950/70 border border-zinc-800 rounded-lg px-2.5 py-2 ${t ? "" : "hidden"}">${t}</div>`;
      }
    } catch (e) { console.error("PulseTrack added weight note", e); }
    return oBar.apply(this, arguments);
  };

  /** the unit next to the weight box: BW for a 0, +lbs for anything else */
  function unitLabel(inp) {
    const a = A(); if (!a || !inp || inp.dataset.field !== "weight") return;
    const span = inp.nextElementSibling; if (!span || span.tagName !== "SPAN") return;
    const card = inp.closest("[data-ex-card]"); if (!card) return;
    const ex = a.activeDay && (a.activeDay.exercises || [])[parseInt(card.dataset.exCard, 10)]; if (!ex || !isMoveEx(a, ex)) return;
    if (!span.dataset.u) span.dataset.u = span.textContent.replace(/^\+/, "");
    const base = span.dataset.u.replace(/^\+/, "");
    span.textContent = String(inp.value).trim() !== "" && parseFloat(inp.value) === 0 ? "BW" : "+" + base;
  }
  function liveNote(inp) {
    const a = A(); if (!a || !inp || inp.dataset.field !== "weight") return;
    const card = inp.closest("[data-ex-card]"); if (!card) return;
    const idx = parseInt(card.dataset.exCard, 10), ex = a.activeDay && (a.activeDay.exercises || [])[idx]; if (!ex || !isMoveEx(a, ex)) return;
    const box = card.querySelector('[data-bwnote="' + idx + '"]'); if (!box) return;
    const vals = Array.from(card.querySelectorAll('input.input-set-field[data-field="weight"]')).map(i => i.value);
    const t = noteFor(a, vals);
    if (box.dataset.t !== t) { box.dataset.t = t; box.innerHTML = t; }
    box.classList.toggle("hidden", !t);
  }
  document.addEventListener("input", e => {
    try { const inp = e.target && e.target.closest && e.target.closest(".input-set-field"); if (inp) { unitLabel(inp); liveNote(inp); } } catch (err) { }
  }, true);
  document.addEventListener("click", e => {
    try { if (e.target.closest && e.target.closest("[data-bwlog]")) { const a = A(); if (a) a.showView("body"); } } catch (err) { }
  });
  const oRender = proto.renderWorkoutView;
  proto.renderWorkoutView = function () {
    const r = oRender.apply(this, arguments);
    try { this.dom.exercisesList.querySelectorAll('.input-set-field[data-field="weight"]').forEach(unitLabel); } catch (e) { }
    return r;
  };
})();
  