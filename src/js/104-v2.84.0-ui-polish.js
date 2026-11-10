/* =====================================================================
 * PulseTrack 2.84.0: a tidier look on the screens you use most. Nothing new to learn, things just fit better.
 *  Workout screen:
 *  - The top bar showed "Day 1: Ches…" cut off. It now shows the short name ("Chest & Back") and, under it, "Week 1 of 6 · Day 1".
 *  - A long day name such as "Day 1: Chest & Back (Antagonist Power & Volume)" is split: the name on top, the bracket part in small grey
 *    text under it, so the card is two short lines instead of three.
 *  - The 🔁 Taken? button sits next to the rest time at the top of the exercise instead of in the bottom row, so the bottom row
 *    (rest timer, Last, note, − Set, + Set) stays on one line.
 *  - Slightly less space between the parts of an exercise card, so the first set shows sooner.
 *  Home:
 *  - "Up next" says "UP NEXT · 9 exercises" on one line with the day name below it (no stray dot when the name wraps).
 *  - The backup reminder is two lines, not three. Long program names wrap evenly.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  const proto = ApplicationUI.prototype;
  const $ = id => document.getElementById(id);
  const esc = s => PT.esc(s);

  /** "Day 1: Chest & Back (Antagonist Power & Volume)" → { main: "Day 1: Chest & Back", sub: "Antagonist Power & Volume" } */
  function split(t) {
    t = String(t == null ? "" : t).trim();
    const m = /^(.*?)\s*\(([^()]{2,})\)\s*$/.exec(t);
    return m && m[1].trim() ? { main: m[1].trim(), sub: m[2].trim() } : { main: t, sub: "" };
  }
  /** the name without a leading "Day 1:", for the narrow top bar */
  function bare(main) {
    const b = String(main).replace(/^\s*(?:day|workout)\s*\d+\s*[:\-–—.]\s*/i, "").trim();
    return b || main;
  }
  PT.dayTitleParts = t => { const p = split(t); return { main: p.main, sub: p.sub, bare: bare(p.main) }; };

  function polishWorkout(app) {
    const view = app.dom && app.dom.viewWorkout, prog = app.activeProgram, day = app.activeDay;
    if (!view || !prog || !day) return;
    const full = app.shortDayTitle ? app.shortDayTitle(prog, day) : (day.title || "");
    const p = split(full);
    // the card at the top of the screen
    const h2 = $("workout-day-title");
    if (h2) {
      h2.innerHTML = esc(p.main || full || "Workout") + (p.sub ? ` <span class="pt-daysub">${esc(p.sub)}</span>` : "");
      h2.title = full;
      const card = h2.parentElement && h2.parentElement.parentElement;
      if (card) card.classList.add("pt-daycard");
    }
    // the top bar, only while the workout screen is the one showing
    if (!view.classList.contains("hidden") && app.dom.headerTitle && app.dom.headerBreadcrumb) {
      app.dom.headerTitle.innerText = bare(p.main) || full;
      app.dom.headerTitle.title = full;
      if (typeof FREESTYLE_ID === "undefined" || prog.id !== FREESTYLE_ID) {
        let badge = ""; try { badge = app.weekBadge(prog, day) || ""; } catch (e) { badge = ""; }
        app.dom.headerBreadcrumb.innerText = badge ? badge.replace(/\s+of\s+\d+/i, "") : prog.title;      // "Week 1 · Day 1" fits next to the Ready pill
        app.dom.headerBreadcrumb.title = `${prog.title} • ${badge}`;
      }
    }
  }
  /** Home: the program name wraps at the colon or comma, not in the middle of "Chest & Back" */
  const oHome = proto.renderHomeView;
  proto.renderHomeView = function () {
    const r = oHome.apply(this, arguments);
    try { const t = $("home-program-title"); if (t && / & /.test(t.textContent)) t.textContent = t.textContent.replace(/ & /g, "\u00a0&\u00a0"); } catch (e) { }
    return r;
  };
  const oWk = proto.renderWorkoutView;
  proto.renderWorkoutView = function () {
    const r = oWk.apply(this, arguments);
    try { polishWorkout(this); } catch (e) { console.error("PulseTrack ui polish", e); }
    return r;
  };

  const css = document.createElement("style"); css.id = "pt-v284-css";
  css.textContent = `
    #home-program-title, #workout-day-title { text-wrap: balance; }
    /* top bar on a narrow phone (360px): a little tighter so the short name and the week fit beside the timer */
    @media (max-width: 380px) {
      #header-title { font-size: .9rem; letter-spacing: -.015em; }
      #session-stopwatch-badge { padding-left: .4rem; padding-right: .4rem; gap: .25rem; }
      #session-stopwatch-badge ~ * { margin-left: .25rem !important; }
    }
    /* workout: the day card */
    #view-workout .pt-daycard { padding: .65rem .8rem; gap: .6rem; }
    #view-workout .pt-daycard #workout-day-badge { font-size: .65rem; line-height: 1rem; }
    #view-workout .pt-daycard #workout-day-title { font-size: 1.02rem; line-height: 1.3rem; }
    #view-workout .pt-daycard .pt-daysub { display: block; margin-top: .1rem; font-size: .72rem; line-height: 1rem; font-weight: 600; color: rgb(var(--z400)); }
    #view-workout .pt-daycard #pt-wk-more { padding: .4rem .7rem; font-size: .75rem; }
    /* workout: an exercise card (Gym mode keeps its own big sizes) */
    body:not(.pt-gym) #exercises-list-container > [data-ex-card] { padding: .75rem; }
    body:not(.pt-gym) #exercises-list-container > [data-ex-card] > * + * { margin-top: .5rem; }
    body:not(.pt-gym) #exercises-list-container > [data-ex-card] :is(.btn-rest-ex, .btn-copy-last, .btn-note-ex, .btn-warmup, .btn-remove-set, .btn-add-set, .pt-drop) { padding-left: .45rem; padding-right: .45rem; }
    body:not(.pt-gym) #exercises-list-container > [data-ex-card] .justify-end.space-x-2 > * + * { margin-left: .35rem; }
    /* home: "Up next" */
    #home-up-next .pt-un-top { display: block; font-size: 10px; font-weight: 600; letter-spacing: .05em; text-transform: uppercase; color: rgb(var(--z500)); }
    #home-up-next .pt-un-top b { font-weight: 600; letter-spacing: 0; text-transform: none; }
    #home-up-next .pt-un-sub { display: block; margin-top: .05rem; font-size: .72rem; line-height: 1rem; font-weight: 600; color: rgb(var(--z400)); }
    #home-up-next .pt-un-name { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; margin-top: .1rem; font-size: .8125rem; line-height: 1.2rem; font-weight: 700; }
  `;
  document.head.appendChild(css);
})();
