/* =====================================================================
 * PulseTrack 3.16.0: phone shortcuts and a Today screen.
 *  manifest.json has "shortcuts" (long-press the app icon on Android): Start today's workout (?go=start), Log a set (?go=set) and Today
 *  (?go=today); ?go=cardio also works but is not in the manifest (Chrome on Android shows 3, and each icon adds to the manifest). This module reads ?go= once the app is up (after the terms sheet, if it is open), takes
 *  it out of the address so a reload does not do it again, and does it. sw.js already answers any ?query with the saved page offline.
 *  Today (side menu > Today, or the shortcut) is a short sheet: what you did today, your next workout with Start/Continue and Log a set,
 *  and this week against your weekly goal.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  const proto = ApplicationUI.prototype, A = () => window.app, $ = id => document.getElementById(id), esc = s => PT.esc(s);
  const FREE = "freestyle";
  const fmtN = n => Math.round(n || 0).toLocaleString();

  /** your current program and its day, without changing what you are looking at */
  function current(a) {
    const s = typeof AppStateMemory !== "undefined" && AppStateMemory.getActive ? AppStateMemory.getActive() : null;
    const p = s && (a.data.programs || []).find(x => x.id === s.progId);
    if (!p) return null;
    const day = (p.days || []).find(d => d.dayNumber === s.dayNum) || (a.nextDayOf ? a.nextDayOf(p) : null) || (p.days || [])[0] || null;
    return { p, day };
  }
  function setsOf(a, p, day) {
    let tot = 0, done = 0;
    (day && day.exercises || []).forEach(ex => { for (let i = 0; i < (ex.sets || 0); i++) { tot++; const e = a.logs[a.getLogKey(p.id, day.dayNumber, ex.id, i)]; if (e && e.completed) done++; } });
    return { tot, done };
  }

  /* ================================================================ the Today sheet */
  function todayHtml(a) {
    const today = PT.ds(), done = (a.sessions || []).filter(s => s && s.date === today), cur = current(a);
    const parts = [];
    if (done.length) parts.push(`<div class="pt-td-c" id="pt-td-done"><span class="pt-td-h">Done today</span>${done.map(s => {
      const min = s.dur ? Math.max(1, Math.round(s.dur / 60)) : 0;
      return `<div class="pt-td-r"><b>${esc(s.dtitle || s.ptitle || "Workout")}</b><span>${[min ? min + " min" : "", s.sets ? s.sets + (s.sets === 1 ? " set" : " sets") : "", s.vol ? fmtN(s.vol) + " " + esc(s.unit || "lb") : ""].filter(Boolean).join(" · ")}</span></div>`;
    }).join("")}</div>`);
    if (cur && cur.day) {
      const { p, day } = cur, free = p.id === FREE, n = (day.exercises || []).length, st = setsOf(a, p, day);
      let badge = ""; try { badge = free ? "Freestyle" : String(a.weekBadge(p, day) || ""); } catch (e) { }
      const due = PT.startDate && PT.startDate.due ? PT.startDate.due(p, day.dayNumber) : ""; if (due && badge) badge += " · " + due;
      const title = a.shortDayTitle ? a.shortDayTitle(p, day) : day.title, names = (day.exercises || []).slice(0, 3).map(e => e.name);
      const head = done.some(s => s.pid === p.id) ? "Up next" : "Today's workout";
      parts.push(`<div class="pt-td-c" id="pt-td-next"><span class="pt-td-h">${head}</span>
        <div class="pt-td-p">${esc(p.title)}${badge ? `<span>${esc(badge)}</span>` : ""}</div>
        ${(() => { const q = PT.dayTitleParts ? PT.dayTitleParts(title) : { main: title, sub: "" }; return `<b class="pt-td-n">${esc(q.main)}</b>${q.sub ? `<span class="pt-td-x">${esc(q.sub)}</span>` : ""}`; })()}
        ${n ? `<span class="pt-td-s">${n} ${n === 1 ? "exercise" : "exercises"}${day.estimatedMinutes ? ` · about ${day.estimatedMinutes} min` : ""}${st.done ? ` · ${st.done} of ${st.tot} sets done` : ""}</span>
        <span class="pt-td-x">${esc(names.join(", "))}${n > 3 ? ", …" : ""}</span>` : `<span class="pt-td-s">A rest day.</span>`}
        <div class="pt-td-a"><button type="button" class="pt-td-go bg-emerald-600 text-white tap-active" data-td="start">${!n ? "Open day" : st.done ? "Continue workout" : "Start workout"}</button>${n ? `<button type="button" class="pt-td-b tap-active" data-td="set">Log a set</button>` : ""}</div></div>`);
    } else parts.push(`<div class="pt-td-c" id="pt-td-next"><span class="pt-td-h">Today's workout</span><span class="pt-td-s">No program chosen yet.</span><div class="pt-td-a"><button type="button" class="pt-td-go bg-emerald-600 text-white tap-active" data-td="programs">Choose a program</button></div></div>`);
    let wk = null; try { wk = a.renderStreak(); } catch (e) { }
    if (wk) parts.push(`<div class="pt-td-c pt-td-w" id="pt-td-week"><span class="pt-td-h">This week</span><span class="pt-td-s"><b>${wk.thisCount} of ${wk.goal}</b> workouts${wk.streak ? ` · ${wk.streak}-week streak` : ""}</span></div>`);
    parts.push(`<div class="pt-td-q"><button type="button" class="pt-td-b tap-active" data-td="cardio">Cardio &amp; Sports</button><button type="button" class="pt-td-b tap-active" data-td="empty">Empty workout</button></div>`);
    return parts.join("");
  }
  let sheetEl = null;
  function openToday() {
    const a = A(), K = PT.kit; if (!a || !K) return;
    sheetEl = K.sheet("pt-today-sheet", 55);
    const c = K.openSheet(sheetEl, `${K.head("Today", new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }))}<div id="pt-today-box" class="space-y-2.5">${todayHtml(a)}</div>`);
    c.addEventListener("click", e => {
      const b = e.target.closest("[data-td]"); if (!b) return;
      K.closeSheet(sheetEl);
      act(b.dataset.td);
    });
  }

  /* ================================================================ what the buttons and shortcuts do */
  function startWorkout(a) {
    a.showView("home");                        // back on your own program (and its day), like Home's Start Workout
    const b = $("btn-home-resume"); if (b) b.click();
  }
  function nextSet(a) {
    const btn = [...document.querySelectorAll("#view-workout .btn-check-set")].find(x => x.dataset.completed !== "1");
    if (!btn) { a.toast("Every set is ticked. Finish the workout when you're ready."); return false; }
    const row = btn.closest(".set-row") || btn;
    row.scrollIntoView({ block: "center", behavior: "smooth" });
    row.classList.add("pt-go-hi"); setTimeout(() => row.classList.remove("pt-go-hi"), 2600);
    const card = row.closest("[data-ex-card]"), n = parseInt(row.dataset.setIndex, 10);
    a.toast(`Next: ${btn.dataset.exname || "set"}${n >= 0 ? `, set ${n + 1}` : ""}`);
    return !!card;
  }
  function act(what) {
    const a = A(); if (!a) return;
    if (what === "today") openToday();
    else if (what === "start") startWorkout(a);
    else if (what === "set") {
      const cur = current(a);
      if (!cur || !cur.day || !(cur.day.exercises || []).length) { startWorkout(a); return; }
      startWorkout(a); setTimeout(() => nextSet(a), 450);
    }
    else if (what === "cardio") a.showView("cardio");
    else if (what === "empty") a.startEmptyWorkout();
    else if (what === "programs") a.showView("programs");
  }
  PT.today = { open: openToday, act, nextSet, current: () => current(A()) };

  /* ================================================================ ?go= from a shortcut */
  const GO = ["today", "start", "set", "cardio"];
  function takeGo() {
    let go = null;
    try {
      const u = new URL(location.href); go = u.searchParams.get("go");
      if (go !== null) { u.searchParams.delete("go"); history.replaceState(history.state, "", u.pathname + (u.search || "") + u.hash); }
    } catch (e) { }
    return GO.includes(go) ? go : null;
  }
  const pending = takeGo();
  const oInit = proto.initExtras;
  proto.initExtras = function () {
    const r = oInit ? oInit.apply(this, arguments) : undefined;
    if (pending) {
      let tries = 0;
      const run = () => {
        if ($("pt-legal") && tries++ < 1200) { setTimeout(run, 500); return; }   // first launch: after the terms
        try { act(pending); } catch (e) { console.error("PulseTrack shortcut", e); }
      };
      setTimeout(run, 400);                                                   // after the start-up clean-ups
    }
    return r;
  };

  /* ================================================================ side menu: Today */
  function addMenu() {
    const home = document.querySelector('#drawer [data-nav="home"], .drawer-nav[data-nav="home"]');
    if (!home || $("pt-drawer-today")) return;
    home.insertAdjacentHTML("afterend", `<button type="button" id="pt-drawer-today" class="pt-dr tap-active"><span class="pt-dr-i">📅</span><span class="pt-dr-l">Today</span><span class="pt-dr-c" aria-hidden="true">›</span></button>`);
    $("pt-drawer-today").addEventListener("click", () => { const a = A(); try { a.closeDrawer(); } catch (e) { } openToday(); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", addMenu); else addMenu();

  const css = document.createElement("style"); css.id = "pt-v3160-css";
  css.textContent = `
    .pt-td-c { display: flex; flex-direction: column; gap: .3rem; padding: .8rem .9rem; border-radius: .9rem; background: rgb(var(--z950, 9 9 11)); border: 1px solid rgb(var(--z800)); }
    .pt-td-h { font-size: .75rem; font-weight: 700; color: rgb(var(--z300)); }
    .pt-td-r { display: flex; flex-direction: column; font-size: .8125rem; color: rgb(var(--z100)); }
    .pt-td-r span, .pt-td-s, .pt-td-x { font-size: .75rem; color: rgb(var(--z300)); line-height: 1.4; }
    .pt-td-s b { color: rgb(var(--z100)); }
    .pt-td-p { font-size: .75rem; color: rgb(var(--z300)); }
    .pt-td-p span { display: block; color: rgb(var(--z200)); }
    .pt-td-n { font-size: 1rem; color: rgb(var(--z100)); line-height: 1.3; }
    .pt-td-a { display: flex; gap: .5rem; margin-top: .4rem; }
    .pt-td-go { flex: 1; padding: .75rem; min-height: 2.75rem; border-radius: .8rem; font-size: .875rem; font-weight: 800; }
    .pt-td-b { padding: .65rem .8rem; min-height: 2.75rem; border-radius: .8rem; background: rgb(var(--z800)); color: rgb(var(--z100)); font-size: .8125rem; font-weight: 700; }
    .pt-td-q { display: grid; grid-template-columns: 1fr 1fr; gap: .5rem; }
    .set-row.pt-go-hi { outline: 2px solid rgb(16 185 129); outline-offset: 2px; border-radius: .5rem; }
  `;
  document.head.appendChild(css);
})();
