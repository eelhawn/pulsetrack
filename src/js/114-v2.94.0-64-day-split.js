/* =====================================================================
 * PulseTrack 2.94.0: My 6-Day Split is one long program: Day 1 to Day 64, no weeks.
 *  3 days on, 1 off, 3 on, 1 off, round and round for 64 days (8 blocks of 8; the odd blocks use the free-weight days, the even blocks
 *  the machine days). 64 days is nine weeks and a day: start on a Saturday or Sunday and Day 64, the last rest day, is one too.
 *  The program has no week plan any more: one list of 64 days numbered 1 to 64, and "Up next" goes down the list like any other program.
 *  A copy already on a phone is changed once. The days it has (the 16 days of the two old weeks) are renumbered to their place in the list
 *  and keep your swaps, sets and reps; Day 17 to 64 are added. Everything filed under a day number moves with it: ticked sets and their weights,
 *  day notes, finished and skipped days. Where you were is kept: the days of the weeks you finished are ticked, so "up next" is where
 *  you left off. History, records and last-time weights are not touched. Runs once (settings.split64). Only My 6-Day Split is changed.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  const proto = ApplicationUI.prototype;
  const MINE = "my_6day_chest_back_legs_sharms";
  // old day number at each place of the two old 8-day weeks (Day 7 / Day 14 were the rest days that sit 4th; 15 and 16 the 8th)
  const ORDER = [1, 2, 3, 7, 4, 5, 6, 15, 8, 9, 10, 14, 11, 12, 13, 16];
  const clone = o => JSON.parse(JSON.stringify(o));
  const builtin = id => (typeof BUILTIN_PROGRAMS !== "undefined" && Array.isArray(BUILTIN_PROGRAMS)) ? BUILTIN_PROGRAMS.find(x => x && x.id === id) : null;
  const AUTO = /^(W\d[W\d &]* - )?Day \d+: /;
  const rid = (id, from, to) => (typeof id === "string" && id.startsWith(`${MINE}_d${from}_`)) ? `${MINE}_d${to}_` + id.slice(`${MINE}_d${from}_`.length) : id;

  function upgrade(app) {
    const p = app && app.data && Array.isArray(app.data.programs) ? app.data.programs.find(x => x && x.id === MINE) : null;
    const b = builtin(MINE);
    if (!p || !b || b.weekPlan || !Array.isArray(b.days) || b.days.length < 64 || !Array.isArray(p.days)) return { done: false };
    if (!p.weekPlan && p.days.length >= b.days.length && p.days.every((d, i) => d && d.dayNumber === i + 1)) return { done: false };   // already the flat list
    const st = app.getProgState(p), plan = Array.isArray(p.weekPlan) ? p.weekPlan : [];
    const toNew = {}; ORDER.forEach((o, i) => { toNew[o] = i + 1; });
    // ---- the days
    const days = b.days.map((bd, i) => {
      const n = i + 1, old = n <= 16 ? ORDER[i] : null;
      const mine = old ? p.days.find(x => x && x.dayNumber === old) : null;
      if (!mine) return clone(bd);
      const d = clone(mine);
      d.dayNumber = n;
      if (AUTO.test(String(d.title || "")) && d.title !== bd.title) d.title = bd.title;
      const fix = e => { if (e && typeof e === "object") e.id = rid(e.id, old, n); };
      (d.exercises || []).forEach(fix); (d.orig || []).forEach(fix); (d.removed || []).forEach(r => fix(r && r.ex));
      return d;
    });
    // ---- everything filed under a day number
    const logs = app.logs || {}, out = {}, pre = `${MINE}_d`;
    Object.keys(logs).forEach(k => {
      const m = k.startsWith(pre) ? /^(\d+)_(.*)$/.exec(k.slice(pre.length)) : null, nn = m && toNew[+m[1]];
      if (!m || !nn) { out[k] = logs[k]; return; }
      out[`${pre}${nn}_` + rid(m[2], +m[1], nn)] = logs[k];
    });
    Object.keys(logs).forEach(k => delete logs[k]); Object.assign(logs, out);
    const notes = app.dayNotes || {}, nout = {};
    Object.keys(notes).forEach(k => { const m = k.startsWith(pre) ? /^(\d+)$/.exec(k.slice(pre.length)) : null; if (m && toNew[+m[1]]) nout[`${pre}${toNew[+m[1]]}`] = notes[k]; else nout[k] = notes[k]; });
    Object.keys(notes).forEach(k => delete notes[k]); Object.assign(notes, nout);
    // ---- where you were
    const w = st.week >= 1 && st.week <= 8 ? st.week : 1;
    const G = plan.find(g => (g.weeks || []).includes(w));
    const oldDone = (st.done || []).slice();
    let done;
    if (G) {
      done = days.slice(0, (w - 1) * 8).map(d => d.dayNumber);
      oldDone.forEach(n => { const k = G.days.indexOf(n); if (k >= 0 && days[(w - 1) * 8 + k]) done.push(days[(w - 1) * 8 + k].dayNumber); });
    } else done = oldDone.map(n => toNew[n]).filter(Boolean);
    const skipped = (Array.isArray(st.skipped) ? st.skipped : []).map(n => G ? null : toNew[n]).filter(Boolean);
    p.days = days;
    delete p.weekPlan; delete p.weeks; delete p.baseDays; delete p.dayLabels;
    p.weekReset = false;
    if (Array.isArray(b.tags)) p.tags = clone(b.tags);
    if (/two alternating weeks|8 weeks of 8 days|over 6 weeks/.test(String(p.description || ""))) p.description = b.description;
    st.week = 1; st.done = Array.from(new Set(done)); st.skipped = Array.from(new Set(skipped)); delete st.byWeek; delete st.rw;
    app.settings.split64 = Date.now();
    WorkoutStorage.setData(app.data);
    try { WorkoutStorage.saveLogs(app.logs); } catch (e) { }
    try { PT.save("pulsetrack_daynotes_v1", app.dayNotes); } catch (e) { }
    try { WorkoutStorage.saveSettings(app.settings); } catch (e) { }
    try { app.saveProgState(); } catch (e) { }
    return { done: true, days: days.length };
  }
  PT.split64 = { upgrade: () => upgrade(window.app), ORDER };

  // wording for this program only: no "Week N" anywhere, it is Day 1 to Day 64 (the week row says how many days are done)
  const mine = prog => !!prog && prog.id === MINE && !prog.weekPlan;
  const oBadge = proto.weekBadge;
  proto.weekBadge = function (prog, day) {
    if (!mine(prog) || !day) return oBadge.apply(this, arguments);
    return `Day ${day.dayNumber} of ${(prog.days || []).length}`;
  };
  const oUp = proto.upNextText;
  proto.upNextText = function (prog, day) {
    if (!mine(prog) || !day) return oUp.apply(this, arguments);
    return `Up next: ${this.shortDayTitle ? this.shortDayTitle(prog, day) : day.title}`;
  };
  const oDays = proto.renderDaysView;
  proto.renderDaysView = function () {
    const r = oDays.apply(this, arguments);
    try {
      const prog = this.activeProgram, row = document.getElementById("days-week-row");
      if (mine(prog) && row) {
        const st = this.getProgState(prog), work = (prog.days || []).filter(d => !this.isRestDay(d));
        const n = work.filter(d => st.done.includes(d.dayNumber)).length;
        row.innerHTML = `<div class="text-xs text-zinc-400 min-w-0"><span class="font-black text-white">${n}/${work.length}</span> workouts done${st.week > 1 ? ` · round ${st.week}` : ""}</div>`;
      }
    } catch (e) { console.error("PulseTrack 2.94 days row", e); }
    return r;
  };

  const oInit = proto.initExtras;
  proto.initExtras = function () {
    const r = oInit ? oInit.apply(this, arguments) : undefined;
    setTimeout(() => {   // last: after the older clean-ups
      try {
        if (this.settings.split64) return;
        if (upgrade(this).done) {
          try { if (this.activeProgram && this.activeProgram.id === MINE) { this.activeDay = this.nextDayOf(this.activeProgram) || this.activeDay; } } catch (e) { }
          setTimeout(() => { try { this.toast("Your 6-day split is now one program: Day 1 to Day 64", null, null, 6000); } catch (e) { } }, 3800);
        }
      } catch (e) { console.error("PulseTrack: 64 day split skipped", e); }
    }, 60);
    return r;
  };
})();
