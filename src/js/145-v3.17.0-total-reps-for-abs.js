/* =====================================================================
 * PulseTrack 3.17.0 / 3.18.0: total reps for abs.
 *  Ab sets on the Core & Cardio days are 5 x 40-60, "200-300 reps in all". Every ab exercise done for reps (abs or obliques as a main
 *  muscle, not a hold, not timed, not cardio) shows the total of the reps you have logged so far, against the total the sets add up
 *  to: "Total: 95 of 200-300 reps", with a bar. On its workout card (under the name and sets) and at the top of Guided mode.
 *  3.17.0 had a counting sheet (tap or pace the reps); the owner did not want that ("I'll log the sets in guided mode, just put the
 *  total reps"), so 3.18.0 took it out. settings.rcPace / rcVoice from 3.17.0 are left unused.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  const proto = ApplicationUI.prototype, A = () => window.app, $ = id => document.getElementById(id), esc = s => PT.esc(s);
  const TIMED = /\b(s|sec|secs|second|seconds|min|mins|minute|minutes)\b|\d:\d\d|hold/i;

  /** an ab exercise done for reps (not a hold, not cardio) */
  function isAbs(name, ex) {
    if (!name) return false;
    try { const a = A(); if (ex && (ex.type === "tabata" || ex.type === "cardio" || (a && a.exKind && a.exKind(ex).cardio))) return false; } catch (e) { }
    if (ex && TIMED.test(String(ex.reps || ""))) return false;
    let m = null; try { m = PT.musclesOf ? PT.musclesOf(name) : null; } catch (e) { m = null; }
    if (!m || m.kind !== "worked" || !(m.muscles || []).some(x => x.role === "primary" && (x.muscle_id === "abs" || x.muscle_id === "obliques"))) return false;
    try { const c = PT.figure && PT.figure.classify(name), p = c && PT.figure.PATTERNS[c.draw || c.id]; if (p && (p.hold || p.frames.length < 2)) return false; } catch (e) { }
    return true;
  }
  /** "40-60" -> { lo: 40, hi: 60 }; "12" -> { lo: 12, hi: 12 }; anything else -> null */
  function goalOf(reps) {
    const m = /(\d+)\s*(?:-|–|to)\s*(\d+)/.exec(String(reps || "")) || /^\s*(\d+)\s*$/.exec(String(reps || ""));
    if (!m) return null;
    const lo = parseInt(m[1], 10), hi = parseInt(m[2] || m[1], 10);
    return lo > 0 ? { lo: Math.min(lo, hi), hi: Math.max(lo, hi) } : null;
  }
  /** { done: reps logged (ticked sets), sets: ticked sets, of: sets, lo, hi (the sets' reps added up, or null) } */
  function totalOf(a, ex) {
    if (!a || !a.activeProgram || !a.activeDay || !ex) return null;
    const n = ex.sets || 0, g = goalOf(ex.reps); let done = 0, sets = 0;
    for (let s = 0; s < n; s++) {
      const e = a.logs[a.getLogKey(a.activeProgram.id, a.activeDay.dayNumber, ex.id, s)];
      if (e && e.completed) { sets++; done += Math.max(0, parseInt(e.reps, 10) || 0); }
    }
    return { done, sets, of: n, lo: g ? g.lo * n : null, hi: g ? g.hi * n : null };
  }
  const goalTxt = t => t.lo == null ? "" : t.lo === t.hi ? String(t.lo) : `${t.lo}-${t.hi}`;
  function lineHtml(t, cls) {
    const pc = t.hi ? Math.min(100, Math.round(t.done / t.hi * 100)) : 0, ok = t.lo != null && t.done >= t.lo;
    return `<div class="pt-abt ${cls || ""}${ok ? " pt-abt-ok" : ""}" data-abt="${t.done}"><span class="pt-abt-t">Total: <b>${t.done}</b>${t.lo != null ? ` of ${goalTxt(t)}` : ""} reps${t.sets ? ` · ${t.sets} of ${t.of} sets` : ""}</span>
      ${t.hi ? `<span class="pt-abt-bar" role="progressbar" aria-label="Reps done" aria-valuemin="0" aria-valuemax="${t.hi}" aria-valuenow="${t.done}"><span style="width:${pc}%"></span></span>` : ""}</div>`;
  }

  /* ================================================================ on the workout cards */
  function decorate(a) {
    const list = $("exercises-list") || (a.dom && a.dom.exercisesList); if (!list) return;
    list.querySelectorAll("[data-ex-card]").forEach(card => {
      const old = card.querySelector(".pt-abt"); if (old) old.remove();
      const i = parseInt(card.dataset.exCard, 10), ex = a.activeDay && (a.activeDay.exercises || [])[i];
      const chk = card.querySelector(".btn-check-set"), name = (chk && chk.dataset.exname) || (ex && ex.name);
      if (!ex || !chk || !isAbs(name, ex)) return;
      const anchor = card.querySelector(".btn-cues") || card.querySelector(".btn-ex-info"), line = anchor && anchor.parentElement; if (!line) return;
      const t = totalOf(a, ex); if (!t) return;
      line.insertAdjacentHTML("afterend", lineHtml(t, "pt-abt-card"));
    });
  }
  const oRW = proto.renderWorkoutView;
  proto.renderWorkoutView = function () {
    const r = oRW.apply(this, arguments);
    try { decorate(this); } catch (e) { console.error("PulseTrack ab totals", e); }
    return r;
  };

  /* ================================================================ at the top of Guided mode (module 045 draws #pt-guided) */
  function guided() {
    const o = $("pt-guided"), a = A(); if (!o || !a || !a.activeDay) return;
    const title = o.querySelector(".pt-g-title"), old = o.querySelector(".pt-abt");
    const ex = title && (a.activeDay.exercises || []).find(x => x.name === title.textContent.trim());
    const t = ex && isAbs(ex.name, ex) ? totalOf(a, ex) : null;
    if (!t) { if (old) old.remove(); return; }
    if (old && old.dataset.abt === String(t.done)) return;     // already right: do not touch the DOM (the observer would loop)
    if (old) old.remove();
    const sub = o.querySelector(".pt-g-sub") || title; sub.insertAdjacentHTML("afterend", lineHtml(t, "pt-abt-g"));
  }
  let obs = null;
  function watch() {
    const o = $("pt-guided"); if (!o || o.__abt) return; o.__abt = true;
    obs = new MutationObserver(() => { try { guided(); } catch (e) { } });
    obs.observe(o, { childList: true, subtree: true });
    guided();
  }
  new MutationObserver(() => { if ($("pt-guided")) watch(); }).observe(document.body, { childList: true });
  if ($("pt-guided")) watch();

  PT.abTotals = { isAbs, goalOf, totalOf };

  const css = document.createElement("style"); css.id = "pt-v3170-css";
  css.textContent = `
    .pt-abt { display: flex; flex-direction: column; gap: .3rem; margin-top: .45rem; }
    .pt-abt-t { font-size: .8125rem; color: rgb(var(--z300)); }
    .pt-abt-t b { font-size: 1rem; color: rgb(var(--z100)); font-variant-numeric: tabular-nums; }
    .pt-abt-ok .pt-abt-t b { color: rgb(52 211 153); }
    html[data-mode="light"] .pt-abt-ok .pt-abt-t b { color: rgb(4 120 87); }
    .pt-abt-bar { display: block; height: .375rem; border-radius: 1rem; background: rgb(var(--z800)); overflow: hidden; max-width: 16rem; }
    .pt-abt-bar span { display: block; height: 100%; background: rgb(16 185 129); }
    .pt-abt-g { align-items: center; margin: .35rem 0 .1rem; }
    .pt-abt-g .pt-abt-bar { width: 100%; }
  `;
  document.head.appendChild(css);
})();
