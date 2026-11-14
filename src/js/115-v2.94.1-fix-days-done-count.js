/* =====================================================================
 * PulseTrack 2.94.1: My 6-Day Split said 57 days were done when you had done 4.
 *  The 2.94.0 update turned "week 8, 1 day done" of the old week plan into 56 + 1 finished days. Now the finished days are the ones the app
 *  can see you finished: a day counts when all its sets are ticked (the COMPLETED badge on the days list), plus the rest days before the
 *  last of them and the days you skipped. Runs once (settings.split64fix), only for My 6-Day Split.
 *  New: "Jump to day" on the days list (where "Switch week" used to be): type the day you are on and the days before it are marked done, the
 *  ones after it are not. Fixes the count any time, and lets you start the program part-way.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  const proto = ApplicationUI.prototype;
  const MINE = "my_6day_chest_back_legs_sharms";
  const flat = p => !!p && p.id === MINE && !p.weekPlan && Array.isArray(p.days) && p.days.length >= 64;

  function dayDone(app, prog, day) {
    let tot = 0, ok = 0;
    (day.exercises || []).forEach(ex => { for (let s = 0; s < (ex.sets || 0); s++) { tot++; const e = app.logs[app.getLogKey(prog.id, day.dayNumber, ex.id, s)]; if (e && e.completed) ok++; } });
    return tot > 0 && ok === tot;
  }
  function repair(app) {
    const p = app && app.data && Array.isArray(app.data.programs) ? app.data.programs.find(x => x && x.id === MINE) : null;
    if (!flat(p)) return { done: false };
    const st = app.getProgState(p), days = p.days;
    let last = -1; const done = [];
    days.forEach((d, i) => { if (!app.isRestDay(d) && dayDone(app, p, d)) { done.push(d.dayNumber); last = i; } });
    days.forEach((d, i) => { if (app.isRestDay(d) && i < last) done.push(d.dayNumber); });
    (Array.isArray(st.skipped) ? st.skipped : []).forEach(n => { if (!done.includes(n) && (st.done || []).includes(n)) done.push(n); });
    const was = (st.done || []).length;
    st.done = Array.from(new Set(done));
    app.settings.split64fix = Date.now();
    try { WorkoutStorage.saveSettings(app.settings); } catch (e) { }
    try { app.saveProgState(); } catch (e) { }
    return { done: true, was, now: st.done.length };
  }
  function jump(app, prog, n) {
    const st = app.getProgState(prog);
    st.done = prog.days.filter(d => d.dayNumber < n).map(d => d.dayNumber);
    st.skipped = (Array.isArray(st.skipped) ? st.skipped : []).filter(x => st.done.includes(x));
    app.saveProgState();
    app.activeProgram = prog; app.activeDay = app.nextDayOf(prog);
    try { if (app.activeDay && window.AppStateMemory) AppStateMemory.saveActive(prog.id, app.activeDay.dayNumber); app.updateDrawerStatus && app.updateDrawerStatus(); } catch (e) { }
  }
  PT.split64fix = { repair: () => repair(window.app), jump: (n) => jump(window.app, window.app.activeProgram, n) };

  const oDays = proto.renderDaysView;
  proto.renderDaysView = function () {
    const r = oDays.apply(this, arguments);
    try {
      const prog = this.activeProgram, row = document.getElementById("days-week-row");
      if (flat(prog) && row && !row.querySelector("#btn-jump-day")) {
        row.insertAdjacentHTML("beforeend", `<button id="btn-jump-day" class="shrink-0 text-[11px] px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700/60 tap-active">Jump to day</button>`);
        row.querySelector("#btn-jump-day").addEventListener("click", async () => {
          const next = this.nextDayOf(prog), v = parseInt(await PT.prompt(`Jump to which day (1–${prog.days.length})? The days before it are marked done, the days after it are not.`, next ? next.dayNumber : 1), 10);
          if (!(v >= 1 && v <= prog.days.length)) return;
          jump(this, prog, v); this.renderDaysView(); this.toast(`Jumped to Day ${v}`);
        });
      }
    } catch (e) { console.error("PulseTrack 2.94.1 jump", e); }
    return r;
  };

  const oInit = proto.initExtras;
  proto.initExtras = function () {
    const r = oInit ? oInit.apply(this, arguments) : undefined;
    setTimeout(() => { try { if (!this.settings.split64fix) repair(this); } catch (e) { console.error("PulseTrack: days done repair skipped", e); } }, 90);
    return r;
  };
})();
