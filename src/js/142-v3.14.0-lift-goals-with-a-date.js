/* =====================================================================
 * PulseTrack 3.14.0: lift goals with a date.
 *  The goals themselves (Progress > Strength > Lift goals) are in module 041: a weight for some reps, an optional date, the pace you need
 *  against the pace you are on. This module puts an exercise's goal on its own sheet ("Goal: 225 lb × 1 by Mar 1 · 91% · on track",
 *  or "Set a goal") and converts the goals when you switch between lb and kg (they were left as they were before).
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined" || !PT.goalStatus || !PT.openGoal) return;
  const proto = ApplicationUI.prototype, A = () => window.app, $ = id => document.getElementById(id), esc = s => PT.esc(s);
  const goals = () => { const a = A(); return Array.isArray(a && a.settings.liftGoals) ? a.settings.liftGoals : []; };

  /* ================================================================ the goal on an exercise's sheet */
  let curName = null;
  function rowHtml(name) {
    const a = A(), gs = goals(), i = gs.findIndex(g => g.name === name), has = a.prs && a.prs[name];
    if (i < 0) return has ? `<div id="pt-exgoal" class="pt-exgoal"><span class="pt-exgoal-t">No goal for this lift yet.</span><button type="button" class="pt-opt tap-active" data-exgoal="add">Set a goal</button></div>` : "";
    const g = gs[i], st = PT.goalStatus(a, g);
    return `<div id="pt-exgoal" class="pt-exgoal" data-state="${st.state}"><div class="pt-exgoal-h"><span><b>Goal:</b> ${esc(PT.goalLabel(g, st.u))}${g.by ? " by " + esc(PT.fmtDate(g.by, { month: "short", day: "numeric" })) : ""}</span>
        <button type="button" class="pt-exgoal-e tap-active" data-exgoal="edit" data-i="${i}">Edit</button></div>
      <div class="pt-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${st.pc}" aria-label="Goal progress"><span style="width:${st.pc}%"></span></div>
      <span class="pt-exgoal-s">${st.pc}% · ${esc(st.text)}</span></div>`;
  }
  function goalRow() {
    const old = $("pt-exgoal"); if (!curName || !$("sheet-body")) return;
    const html = rowHtml(curName);
    if (old) { if (html) old.outerHTML = html; else old.remove(); return; }
    if (!html) return;
    const anchor = $("ex-equip") || $("ex-steps") || $("ex-muscles");
    if (anchor) anchor.insertAdjacentHTML("beforebegin", html);
  }
  const oEx = proto.openExerciseSheet;
  proto.openExerciseSheet = function (name) {
    const r = oEx.apply(this, arguments);
    try { curName = name; if (!$("pt-exgoal")) goalRow(); } catch (e) { console.error("PulseTrack goal row", e); }
    return r;
  };
  document.addEventListener("click", e => {
    const b = e.target.closest && e.target.closest("#pt-exgoal [data-exgoal]"); if (!b || !curName) return;
    if (b.dataset.exgoal === "edit") PT.openGoal(parseInt(b.dataset.i, 10)); else PT.openGoal(null, curName);
  });
  PT.goalRow = goalRow;

  /* ================================================================ lb <-> kg */
  const oConv = proto.convertAllWeights;
  if (typeof oConv === "function") proto.convertAllWeights = function (f) {
    const r = oConv.apply(this, arguments);
    try {
      const l = Array.isArray(this.settings.liftGoals) ? this.settings.liftGoals : [];
      l.forEach(g => { if (g.target) g.target = Math.round(g.target * f); if (g.w) g.w = Math.round(g.w * f * 2) / 2; });
    } catch (e) { }
    return r;
  };

  const css = document.createElement("style"); css.id = "pt-v3140-css";
  css.textContent = `
    .pt-exgoal { display: flex; flex-direction: column; gap: .4rem; padding: .7rem .8rem; border-radius: .9rem; background: rgb(var(--z900)); border: 1px solid rgb(var(--z800)); margin-bottom: .75rem; }
    .pt-exgoal:has(.pt-exgoal-t) { flex-direction: row; align-items: center; justify-content: space-between; }
    .pt-exgoal-t { font-size: .75rem; color: rgb(var(--z300)); }
    .pt-exgoal-h { display: flex; align-items: center; justify-content: space-between; gap: .5rem; font-size: .8125rem; color: rgb(var(--z200)); }
    .pt-exgoal-h b { color: rgb(var(--z100)); }
    .pt-exgoal-e, .pt-gl-b { font-size: .75rem; font-weight: 600; color: rgb(var(--z300)); padding: .4rem .55rem; min-height: 2.25rem; border-radius: .6rem; background: rgb(var(--z800)); }
    .pt-exgoal-s { font-size: .6875rem; line-height: 1.4; color: rgb(var(--z300)); }
    .pt-exgoal[data-state="behind"] .pt-exgoal-s, .pt-exgoal[data-state="late"] .pt-exgoal-s { color: rgb(252 211 77); }
    html[data-mode="light"] .pt-exgoal[data-state="behind"] .pt-exgoal-s, html[data-mode="light"] .pt-exgoal[data-state="late"] .pt-exgoal-s { color: rgb(146 64 14); }
  `;
  document.head.appendChild(css);
})();
