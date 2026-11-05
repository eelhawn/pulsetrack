
/* =====================================================================
 * PulseTrack 2.20.0: a weight of 0 means bodyweight.
 *  Type 0 (not an empty box) as the weight of a set on any exercise and the set counts your own body weight as the load:
 *  volume, estimated 1RM, PRs, the e1RM chip and the charts all use your body weight from Body & Photos, like pull-ups and dips.
 *  - Saved sets get bz:1 (and bw: your body weight that day, when one is logged). A blank weight still counts as nothing.
 *  - The unit next to the box says BW, History and share cards show "BW x 12", and the suggestion says "bodyweight x 12".
 *  - Pull-ups, chin-ups, muscle-ups and dips already work this way (0 = just your body), so they are left alone.
 *  - Log a new body weight and the volumes and PRs of old bodyweight sets are worked out again.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  const proto = ApplicationUI.prototype;
  const A = () => window.app;
  const esc = s => PT.esc(s);
  /** True for a typed zero ("0", "0.0"), false for an empty box. */
  const isZero = v => v !== undefined && v !== null && String(v).trim() !== "" && parseFloat(v) === 0;
  PT.isZeroWeight = isZero;
  /** A saved bodyweight set (typed 0) on an exercise that is not pull-up style or cardio. */
  const isBz = (name, st) => !!(st && st.bz && !(parseFloat(st.w) > 0) && !PT.isCardioSet(st) && !PT.isBodyweightEx(name));
  PT.isBodyweightSet = isBz;

  // the weight moved in a bodyweight set is the person's body weight
  const oLoad = proto.setLoad;
  proto.setLoad = function (name, st, ds) {
    if (isBz(name, st)) return parseFloat(st.bw) || this.bwOn(ds) || 0;
    return oLoad.apply(this, arguments);
  };

  // a set typed as 0 is remembered as a bodyweight set
  const oEntry = proto.entryToSet;
  proto.entryToSet = function (ex, entry) {
    const st = oEntry.apply(this, arguments);
    try {
      if (st && !PT.isCardioSet(st) && !this.exKind(ex).bw && isZero(entry && entry.weight)) {
        st.bz = 1;
        const bw = this.bwOn(PT.ds());
        if (bw > 0) st.bw = bw;
      }
    } catch (e) { console.error("PulseTrack bodyweight set", e); }
    return st;
  };

  // "last time" remembers it too
  const oPerf = proto.perfFromSet;
  proto.perfFromSet = function (st) {
    const p = oPerf.apply(this, arguments);
    if (st && st.bz) p.bz = 1;
    return p;
  };

  // History, share cards and charts say BW instead of 0
  const oText = proto.setText;
  proto.setText = function (name, st) {
    if (isBz(name, st)) return "BW × " + PT.num(st.r, 0);
    return oText.apply(this, arguments);
  };

  // a new body weight changes what old bodyweight sets were worth
  const oBody = proto.onBodyChanged;
  proto.onBodyChanged = function () {
    const r = oBody.apply(this, arguments);
    try {
      const list = this.sessions || [];
      const has = list.some(s => (s.ex || []).some(e => (e.sets || []).some(st => st && st.bz)));
      const did = list.some(s => (s.ex || []).some(e => PT.isBodyweightEx(e.name)));
      if (has && !did) { this.recomputeVolumes(); this.recomputeSessionPRs(); this.rebuildPRs(); }
    } catch (e) { console.error("PulseTrack bodyweight recompute", e); }
    return r;
  };

  // a small note under an exercise that has a typed 0: what counts, or a nudge to log a body weight
  const oBar = proto.kindBarHtml;
  proto.kindBarHtml = function (ex, exIndex) {
    const html = oBar.apply(this, arguments);
    try {
      if (html || !ex || this.settings.showLogger === false || ex.type === "tabata" || !this.activeProgram || !this.activeDay) return html;
      const kind = this.exKind(ex);
      if (kind.cardio || kind.bw) return html;
      let any = false;
      for (let s = 0; s < (ex.sets || 0); s++) {
        const e = this.logs[this.getLogKey(this.activeProgram.id, this.activeDay.dayNumber, ex.id, s)];
        if (e && isZero(e.weight)) { any = true; break; }
      }
      if (!any) return html;
      const bw = this.bwOn(PT.ds()), u = this.wLabel();
      return `<div class="bg-zinc-950/70 border border-zinc-800 rounded-lg px-2.5 py-2">${bw
        ? `<p class="text-[11px] text-zinc-400 leading-snug">A weight of 0 is <b class="text-zinc-200">bodyweight</b>. Those sets count your body weight, <b class="font-mono text-zinc-200">${esc(PT.num(bw, 1))} ${esc(u)}</b>, for volume and PRs.</p>`
        : `<button class="btn-log-bw w-full text-left text-[11px] text-amber-300 font-semibold tap-active">⚠ A weight of 0 is bodyweight. Log your body weight in Body &amp; Photos so it counts (tap)</button>`}</div>`;
    } catch (e) { console.error("PulseTrack bodyweight note", e); }
    return html;
  };

  // the unit next to the weight box reads BW while it says 0
  function unitLabel(inp) {
    const a = A(); if (!a || !inp || inp.dataset.field !== "weight") return;
    const span = inp.nextElementSibling; if (!span || span.tagName !== "SPAN") return;
    const card = inp.closest("[data-ex-card]"); if (!card) return;
    const ex = a.activeDay && (a.activeDay.exercises || [])[parseInt(card.dataset.exCard, 10)]; if (!ex) return;
    const kind = a.exKind(ex); if (kind.cardio || kind.bw) return;
    if (!span.dataset.u) span.dataset.u = span.textContent;
    span.textContent = isZero(inp.value) ? "BW" : span.dataset.u;
  }
  document.addEventListener("input", e => {
    try { const inp = e.target && e.target.closest && e.target.closest(".input-set-field"); if (inp) unitLabel(inp); } catch (err) { }
  }, true);

  // one nudge per visit when a bodyweight set is checked off and no body weight is logged yet
  let nudged = false;
  document.addEventListener("click", e => {
    try {
      const a = A(); if (!a || nudged || !e.target.closest) return;
      const btn = e.target.closest(".btn-check-set"); if (!btn || btn.dataset.completed === "1") return;
      const ent = a.logs && a.logs[btn.dataset.key];
      if (!ent || !isZero(ent.weight) || (ent.tag || "R") === "W") return;
      const ex = a.activeDay && (a.activeDay.exercises || []).find(x => x.name === btn.dataset.exname);
      if (!ex || a.exKind(ex).bw || a.exKind(ex).cardio) return;
      if (a.bwOn(PT.ds()) > 0) return;
      nudged = true;
      setTimeout(() => a.toast("0 means bodyweight. Log your body weight in Body & Photos so these sets count.", "Open", () => a.showView("body"), 6000), 400);
    } catch (err) { }
  }, true);

  // after every redraw of the workout screen, set the BW label for boxes that already say 0
  const oRender = proto.renderWorkoutView;
  proto.renderWorkoutView = function () {
    const r = oRender.apply(this, arguments);
    try { this.dom.exercisesList.querySelectorAll('.input-set-field[data-field="weight"]').forEach(unitLabel); } catch (e) { }
    return r;
  };
})();
  