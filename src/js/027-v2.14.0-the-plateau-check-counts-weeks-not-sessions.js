
/* =====================================================================
 * PulseTrack 2.14.0: the plateau check counts weeks, not sessions.
 *  Before: a lift was "stuck" after 3 saved sessions without a new best, however long (or short) those 3 sessions took.
 *  Now: a lift is stuck when you have trained it at least 3 times in the last N weeks and none of those sessions beat the best
 *  you had before that. N is your choice on the Plateau check card: 2, 3, 4, 6 or 8 weeks (4 to start).
 *  - lifts you stopped doing drop off by themselves (fewer than 3 sessions in the window)
 *  - the card, the tip on the workout screen and the one on the exercise page all say how many weeks the lift has been stuck
 * ===================================================================== */
(function () {
  "use strict";
  const A = () => window.app;
  const DAY = 86400000, WEEK = 7 * DAY;
  const OPTIONS = [2, 3, 4, 6, 8], DEFAULT_WEEKS = 4, MIN_SESSIONS = 3;
  const esc = s => PT.esc(s);
  const num = (v, d) => PT.num(v, d == null ? (v % 1 ? 1 : 0) : d);
  const jump = () => (A().unit() === "kg" ? "1 kg" : "2.5 lb");
  const card = "bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3";

  /** How many weeks without a new best before a lift is flagged. */
  PT.plateauWeeks = function () {
    const a = A(), v = parseInt(a && a.settings && a.settings.plateauWeeks, 10);
    return OPTIONS.includes(v) ? v : DEFAULT_WEEKS;
  };

  /** null when the lift is moving (or not trained enough lately); otherwise how long it has been stuck and what to try. */
  PT.plateau = function (name, weeksArg, nowArg) {
    const app = A(); if (!app) return null;
    const W = OPTIONS.includes(weeksArg) ? weeksArg : PT.plateauWeeks(), now = nowArg || Date.now(), cut = now - W * WEEK;
    const s = app.exerciseSeries(name).filter(p => p.best > 0 && p.x <= now + DAY);
    const win = s.filter(p => p.x > cut), before = s.filter(p => p.x <= cut);
    if (win.length < MIN_SESSIONS || !before.length) return null;                        // not enough recent training, or no history to compare with
    const bestBefore = Math.max(...before.map(p => p.best));
    if (Math.max(...win.map(p => p.best)) > bestBefore + 1e-9) return null;               // you beat your best inside the window: not stuck
    const peak = s.find(p => p.best >= bestBefore - 1e-9);                                 // the first time you hit that best
    const weeks = Math.max(W, Math.floor((now - peak.x) / WEEK));
    const last = win[win.length - 1], drop = last.best < bestBefore * 0.95;
    const tw = win.map(p => p.topW), twMax = Math.max(...tw), sameW = twMax > 0 && (twMax - Math.min(...tw)) <= twMax * 0.01;
    const repsAt = p => Math.max(0, ...(p.sets || []).filter(st => st.t !== "W" && (parseFloat(st.w) || 0) >= twMax * 0.97).map(st => parseFloat(st.r) || 0));
    const reps = win.map(repsAt), r0 = reps[0], r1 = reps[reps.length - 1], w0 = tw[0], w1 = tw[tw.length - 1];
    let kind, tip;
    if (drop) { kind = "drop"; tip = `Down ${Math.round((1 - last.best / bestBefore) * 100)}% from your best. Check sleep and food, and consider a lighter week.`; }
    else if (sameW && r1 > r0) { kind = "reps"; tip = "Same weight, but reps are climbing. Keep going, then add weight when you reach the top of the rep range."; }
    else if (sameW) { kind = "same"; tip = `Same weight for ${win.length} sessions in a row. Add a rep to every set before adding weight, or try a smaller jump (${jump()}).`; }
    else if (w1 > w0 && r1 < r0) { kind = "heavier"; tip = "You added weight but lost reps. Stay at this weight until the reps come back."; }
    else { kind = "flat"; tip = "Try a small weight drop, a different rep range, or a similar exercise for a few weeks."; }
    return { kind, tip, weeks, stuck: weeks, sessions: win.length, best: bestBefore, now: last.best };
  };
  PT.plateauTip = name => { const p = PT.plateau(name); return p ? `No new best in ${p.weeks} weeks. ${p.tip}` : `No new best lately. Consider a lighter week or a variation.`; };
  ApplicationUI.prototype.isStalled = function (name) { return !!PT.plateau(name); };

  /* ---------------------------------------------------------------- the card on Progress > Overview */
  ApplicationUI.prototype.plateauCardHtml = function (stalled) {
    const u = this.wLabel(), W = PT.plateauWeeks();
    const items = (stalled || []).map(n => ({ n, p: PT.plateau(n) })).filter(x => x.p).sort((a, b) => b.p.weeks - a.p.weeks);
    const seg = `<div class="grid grid-cols-5 gap-1" role="group" aria-label="Weeks without a new best before a lift is flagged">${OPTIONS.map(w =>
      `<button type="button" class="pt-plw py-1.5 rounded-lg text-[11px] font-bold tap-active ${w === W ? "bg-emerald-600 text-white" : "bg-zinc-950 border border-zinc-800 text-zinc-400"}" data-w="${w}" aria-pressed="${w === W}">${w} wk</button>`).join("")}</div>`;
    let body;
    if (!items.length) body = `<p class="text-xs text-zinc-400">Nothing is stuck right now. A lift is flagged when you've done it ${MIN_SESSIONS} or more times in the last ${W} weeks without beating your best.</p>`;
    else body = `<div class="space-y-2">${items.map(({ n, p }) => `<button type="button" class="pr-ex w-full text-left rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2.5 tap-active" data-name="${esc(n)}">
        <span class="flex items-center justify-between gap-2"><span class="text-xs font-bold text-amber-300 truncate">⚠ ${esc(n)}</span><span class="text-[10px] font-mono text-zinc-500 shrink-0">${p.weeks} weeks</span></span>
        <span class="block text-[11px] text-zinc-400 mt-1 leading-snug">${esc(p.tip)}</span>
        <span class="block text-[10px] text-zinc-500 mt-1 font-mono">best est. 1RM ${num(p.best)} ${u} · last ${num(p.now)} ${u}</span></button>`).join("")}</div>
      ${items.length >= 3 ? `<p class="text-xs text-zinc-300 bg-zinc-950 border border-zinc-800 rounded-xl p-2.5">Several lifts are stuck at once. A <b>deload week</b> (same exercises, about half the sets, lighter weights) often helps you come back stronger.</p>` : ""}`;
    return `<div class="${card}" id="pt-plateau-card"><h3 class="text-xs font-bold text-white">Plateau check</h3>
      <div class="space-y-1.5"><p class="text-[11px] text-zinc-500">Flag a lift after this many weeks without a new best:</p>${seg}</div>${body}</div>`;
  };
  document.addEventListener("click", e => {
    const b = e.target.closest && e.target.closest(".pt-plw"); if (!b) return;
    const a = A(), v = parseInt(b.dataset.w, 10); if (!a || !OPTIONS.includes(v)) return;
    a.settings.plateauWeeks = v; WorkoutStorage.saveSettings(a.settings);
    const y = window.scrollY; a.renderProgressView(); window.scrollTo({ top: y, left: 0, behavior: "instant" });
  });
})();
  