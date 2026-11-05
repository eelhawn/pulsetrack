
/* =====================================================================
 * PulseTrack 2.44.0: a heavy work day reshuffles your week.
 *  When you mark work as Heavy on Home and the workout that is up next hits the same muscles your job just beat up (legs, back, grip,
 *  shoulders), the Work card offers a lighter day from the same program to do today instead, for example Push (chest and arms) instead
 *  of Legs. Nothing else moves: the days stay in order, the day you swapped out stays up next, and one tap puts it back.
 *  - How hard a day is on you: for every hard set, the muscle it works is scored with the same weights the work check-in uses for the
 *    recovery map (lower back and forearms 4, legs 3, shoulders, traps and back 2, chest, arms, calves and abs 0). The day's score is
 *    the average per set, 0 to 4. A day is only worth swapping out at 1.5 or more, and the day offered has to score at least 1 point lower.
 *  - Only for programs (not Freestyle), only before you have trained today, and only when "Go easier after heavy work days" is on.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined" || !PT.workHeavyToday) return;
  const proto = ApplicationUI.prototype, A = () => window.app, $ = id => document.getElementById(id), esc = s => PT.esc(String(s == null ? "" : s));
  const FREE = "freestyle", NEXT_MIN = 1.5, GAP_MIN = 1;
  const save = a => WorkoutStorage.saveSettings(a.settings);

  /** how hard a day is on the muscles a work day beats up: average weight per hard set, 0 to 4 */
  function load(day) {
    const W = PT.workWeights || {}; let sets = 0, sum = 0;
    ((day && day.exercises) || []).forEach(e => {
      const n = Math.max(0, e.sets | 0); if (!n) return;
      let regs = {}; try { regs = PT.regionsFor(e.name, false) || {}; } catch (x) { regs = {}; }
      const r = Object.keys(regs)[0]; sets += n; sum += n * (W[r] || 0);
    });
    return sets ? sum / sets : 0;
  }
  const rs = a => (a.settings.reshuffle && typeof a.settings.reshuffle === "object" ? a.settings.reshuffle : null);
  const trainedToday = a => (a.sessions || []).some(s => s.date === PT.ds());
  const dayByNum = (prog, n) => ((prog && prog.days) || []).find(d => d.dayNumber === n) || null;

  /** { moved:false, next, alt, ln, la } to offer a swap, { moved:true, from, to } once swapped, or null */
  PT.reshuffle = function (a) {
    a = a || A();
    if (!a || !a.settings || !PT.opt) return null;
    const prog = a.activeProgram, day = a.activeDay;
    if (!prog || !day || prog.id === FREE || !Array.isArray(prog.days) || trainedToday(a)) return null;
    const st = rs(a), today = PT.ds();
    // once swapped, the way back stays on Home for the rest of the day, even if work gets marked Normal again
    if (st && st.ds === today && st.pid === prog.id) {
      if (st.dismissed) return null;
      if (st.to === day.dayNumber) { const from = dayByNum(prog, st.from); if (from) return { moved: true, from, to: day, prog }; }
    }
    if (!PT.opt("workEase") || !PT.workHeavyToday(a)) return null;
    const ln = load(day); if (ln < NEXT_MIN) return null;
    const done = (a.getProgState(prog).done || []), W = a.progWeeks ? a.progWeeks(prog) : 0, wk = W && a.dayWeek ? a.dayWeek(prog, day) : 0;
    let best = null;
    prog.days.forEach(d => {
      if (d.dayNumber === day.dayNumber || done.includes(d.dayNumber) || (a.isRestDay && a.isRestDay(d))) return;
      if (W && a.dayWeek(prog, d) !== wk) return;
      const l = load(d); if (l > ln - GAP_MIN) return;
      if (!best || l < best.l - 1e-9) best = { d, l };
    });
    return best ? { moved: false, next: day, alt: best.d, ln, la: best.l, prog } : null;
  };

  function swap(a, r) {
    a.activeProgram = r.prog; a.activeDay = r.alt;
    try { AppStateMemory.saveActive(r.prog.id, r.alt.dayNumber); } catch (e) { }
    a.settings.reshuffle = { ds: PT.ds(), pid: r.prog.id, from: r.next.dayNumber, to: r.alt.dayNumber }; save(a);
    try { a.updateDrawerStatus && a.updateDrawerStatus(); } catch (e) { }
    a.renderHomeView();
  }
  function putBack(a, r) {
    a.activeProgram = r.prog; a.activeDay = r.from;
    try { AppStateMemory.saveActive(r.prog.id, r.from.dayNumber); } catch (e) { }
    delete a.settings.reshuffle; save(a);
    try { a.updateDrawerStatus && a.updateDrawerStatus(); } catch (e) { }
    a.renderHomeView();
  }

  /* ---------------------------------------------------------------- the block inside the Work card */
  function draw(a) {
    const box = $("home-work"); if (!box) return;
    const old = box.querySelector("#pt-reshuffle"); if (old) old.remove();
    const h = box.querySelector("h4"); if (h && /yesterday/i.test(h.textContent)) return;
    const r = PT.reshuffle(a); if (!r) return;
    const t = d => a.shortDayTitle ? a.shortDayTitle(r.prog, d) : d.title;
    const el = document.createElement("div"); el.id = "pt-reshuffle"; el.className = "pt-rs";
    el.innerHTML = r.moved
      ? `<p>Today's workout is <b>${esc(t(r.to))}</b>, moved up because of heavy work. <b>${esc(t(r.from))}</b> stays up next after it.</p>
         <div class="pt-rs-b"><button type="button" class="pt-rs-ghost tap-active" data-rs="back">Back to ${esc(t(r.from))}</button></div>`
      : `<p>Heavy work today, and <b>${esc(t(r.next))}</b> is hard on the same muscles. <b>${esc(t(r.alt))}</b> is easier on them.</p>
         <div class="pt-rs-b"><button type="button" class="pt-rs-go tap-active" data-rs="go">Do ${esc(t(r.alt))} today</button><button type="button" class="pt-rs-ghost tap-active" data-rs="no">Keep ${esc(t(r.next))}</button></div>
         <p class="pt-rs-f">${esc(t(r.next))} stays up next after that. The days keep their order.</p>`;
    box.appendChild(el);
  }
  const oHome = proto.renderHomeView;
  proto.renderHomeView = function () {
    const r = oHome.apply(this, arguments);
    try { draw(this); } catch (e) { console.error("PulseTrack reshuffle", e); }
    return r;
  };
  document.addEventListener("click", e => {
    const a = A(); if (!a || !e.target || !e.target.closest) return;
    const b = e.target.closest("#pt-reshuffle [data-rs]");
    if (b) {
      const r = PT.reshuffle(a); if (!r) { draw(a); return; }
      if (b.dataset.rs === "go" && !r.moved) { swap(a, r); a.toast(`Today: ${a.shortDayTitle(r.prog, r.alt)}. ${a.shortDayTitle(r.prog, r.next)} stays up next.`, undefined, undefined, 5000); }
      else if (b.dataset.rs === "back" && r.moved) putBack(a, r);
      else if (b.dataset.rs === "no") { a.settings.reshuffle = { ds: PT.ds(), pid: r.prog.id, dismissed: true }; save(a); draw(a); }
      return;
    }
  });
  // the work card redraws itself when the level changes (and the tapped button is gone by the time a normal listener runs), so look first, in the capture phase, and put the block back afterwards
  document.addEventListener("click", e => {
    if (e.target && e.target.closest && e.target.closest("#home-work [data-wl], #pt-work-day")) setTimeout(() => { try { draw(A()); } catch (x) { } }, 0);
  }, true);

  const css = document.createElement("style");
  css.id = "pt-v244-rs-css";
  css.textContent = `
    .pt-rs { margin-top: .6rem; padding: .7rem .8rem; border-radius: .9rem; background: rgb(var(--z950)); border: 1px solid rgb(251 191 36 / .35); display: grid; gap: .5rem; }
    .pt-rs p { font-size: .78rem; line-height: 1.4; color: rgb(var(--z200)); } .pt-rs p b { color: rgb(var(--z50)); }
    .pt-rs .pt-rs-f { font-size: .68rem; color: rgb(var(--z500)); }
    .pt-rs-b { display: flex; gap: .5rem; flex-wrap: wrap; }
    .pt-rs-b button { flex: 1 1 40%; padding: .6rem .7rem; border-radius: .7rem; font-size: .78rem; font-weight: 800; }
    .pt-rs-go { background: rgb(var(--a600)); color: #fff; } .pt-rs-ghost { background: rgb(var(--z800)); color: rgb(var(--z100)); }
    html[data-mode="light"] .pt-rs { border-color: rgb(217 119 6 / .45); }
  `;
  document.head.appendChild(css);
})();
  