
/* =====================================================================
 * PulseTrack 2.9.0: switch week from the very top of the Days screen, for every multi-week program.
 *  - the week bar ("Week 3 of 12 · Switch week") is pinned under the header, so it never scrolls away
 *  - "Switch week" opens a grid of weeks: one tap and you are there (earlier weeks count as done)
 *  - programs that repeat a few days over several weeks (Kai Greene 6 weeks, FST-7 Level 1) now know which
 *    days belong to which weeks, so "Up next" stays on week 1's days until week 1 is done, and so on
 *  - built-in programs you already have on your phone get their week info added the next time the app opens
 *    (only the missing week numbers are filled in; your exercises, edits and history are never touched)
 * ===================================================================== */
(function () {
  "use strict";
  const proto = ApplicationUI.prototype;
  const FREE = typeof FREESTYLE_ID !== "undefined" ? FREESTYLE_ID : "freestyle";
  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ------------------------------------------------------------ week plans */
  // prog.weekPlan = [{ weeks: [1,2,3], days: [1,2,3,4,5,6] }, { weeks: [4,5,6], days: [7,...,12] }]
  // = "these days are the workouts of these weeks". Used by programs that repeat a few days for several weeks.
  const cache = new WeakMap();
  function planOf(prog) {
    if (!prog || prog.id === FREE || !Array.isArray(prog.weekPlan) || !prog.weekPlan.length || !Array.isArray(prog.days)) return null;
    let sig;
    try { sig = prog.days.length + "|" + JSON.stringify(prog.weekPlan); } catch (e) { return null; }
    const c = cache.get(prog);
    if (c && c.sig === sig) return c.plan;
    let plan = null;
    try {
      const nums = new Set(prog.days.map(d => d.dayNumber));
      const byWeek = {}; let W = 0, ok = true;
      const groups = prog.weekPlan.map((g, gi) => {
        if (!g || !Array.isArray(g.weeks) || !Array.isArray(g.days) || !g.weeks.length || !g.days.length) { ok = false; return null; }
        const days = g.days.map(n => parseInt(n, 10)), weeks = g.weeks.map(n => parseInt(n, 10)).sort((a, b) => a - b);
        if (!days.every(n => nums.has(n))) ok = false;
        const name = typeof g.name === "string" ? g.name : "";
        weeks.forEach(w => { if (!(w >= 1) || byWeek[w]) { ok = false; return; } byWeek[w] = { gi, days, name }; if (w > W) W = w; });
        return { gi, weeks, days, name };
      });
      for (let w = 1; w <= W; w++) if (!byWeek[w]) ok = false;
      if (ok && W > 1) plan = { W, byWeek, groups };
    } catch (e) { plan = null; }
    cache.set(prog, { sig, plan });
    return plan;
  }
  const dayObj = (prog, n) => (prog.days || []).find(d => d.dayNumber === n);
  const weekDays = (prog, P, w) => P.byWeek[w].days.map(n => dayObj(prog, n)).filter(Boolean);
  const advance = (st, P) => {
    if (st.week < P.W) st.week += 1; else { st.week = 1; st.round = (st.round || 1) + 1; }
    st.done = [];
  };
  function weeksLabel(weeks) {
    if (weeks.length === 1) return "Week " + weeks[0];
    const run = weeks.every((w, i) => i === 0 || w === weeks[i - 1] + 1);
    if (run) return `Weeks ${weeks[0]}–${weeks[weeks.length - 1]}`;
    if (weeks.length === 2) return `Weeks ${weeks[0]} & ${weeks[1]}`;
    return "Weeks " + weeks.slice(0, -1).join(", ") + " & " + weeks[weeks.length - 1];
  }
  /** How many weeks this program has (0 = it has no week structure, just a repeating week). */
  function weeksOf(app, prog) {
    const P = planOf(prog);
    return P ? P.W : (app.progWeeks ? app.progWeeks(prog) : 0);
  }

  /* ------------------------------- fill in week info on programs already on this phone */
  // Programs that only now learn their week numbers used "Week N" as a plain counter before. Their saved progress is
  // converted once (see convertCounter), so a phone that said "Week 3" still says week 3.
  const MIG_KEY = "pulsetrack_wkmig_v1";
  let pending = null;
  const loadPending = () => {
    if (pending) return pending;
    try { pending = JSON.parse(PTLS.getItem(MIG_KEY) || "[]"); } catch (e) { pending = []; }
    if (!Array.isArray(pending)) pending = [];
    return pending;
  };
  const savePending = () => { try { safeSetItem(MIG_KEY, JSON.stringify(pending || [])); } catch (e) { } };
  /* 2.48.0: programs that used to repeat one week now run for several weeks (a weekPlan). A phone that already has the old
     one-week copy gets the extra days added and the week plan switched on. Nothing is replaced: your own edits to the
     original days stay, and only a copy that still has exactly its original days (1..n) is upgraded. */
  const REST_NAME = /^(rest day|active recovery)/i;
  function upgradeProgram(p, b) {
    let changed = false;
    // a rest day that was stored as an "exercise" counted as a workout
    if (Array.isArray(b.days)) {
      b.days.forEach(bd => {
        if (!bd || (bd.exercises || []).length) return;
        const d = p.days.find(x => x && x.dayNumber === bd.dayNumber);
        if (d && Array.isArray(d.exercises) && d.exercises.length === 1 && REST_NAME.test(String(d.exercises[0] && d.exercises[0].name || ""))) { d.exercises = []; d.estimatedMinutes = 0; changed = true; }
      });
    }
    if (!Array.isArray(b.weekPlan) || !b.weekPlan.length || Array.isArray(p.weekPlan) || !(b.baseDays > 0)) return changed;
    const seq = p.days.length === b.baseDays && p.days.every((d, i) => d && d.dayNumber === i + 1);
    if (!seq) return changed;
    const have = new Set(p.days.map(d => d.dayNumber));
    b.days.forEach(bd => { if (!have.has(bd.dayNumber)) p.days.push(JSON.parse(JSON.stringify(bd))); });
    p.weekPlan = JSON.parse(JSON.stringify(b.weekPlan));
    if (b.weeks) p.weeks = b.weeks;
    p.baseDays = b.baseDays;
    // the longer description only when it is still the original one
    const od = String(p.description || "");
    if (od && String(b.description || "").indexOf(od.trim()) === 0) p.description = b.description;
    if (Array.isArray(b.tags)) { p.tags = Array.isArray(p.tags) ? p.tags : []; b.tags.forEach(t => { if (!p.tags.includes(t) && /^\d+ Weeks$/.test(t)) p.tags.push(t); }); }
    return true;
  }
  function stampWeeks(data) {
    if (typeof BUILTIN_PROGRAMS === "undefined" || !Array.isArray(BUILTIN_PROGRAMS) || !data || !Array.isArray(data.programs)) return false;
    let changed = false;
    data.programs.forEach(p => {
      if (!p || !Array.isArray(p.days)) return;
      const b = BUILTIN_PROGRAMS.find(x => x && x.id === p.id);
      if (!b || !Array.isArray(b.days)) return;
      try { if (upgradeProgram(p, b)) changed = true; } catch (e) { console.warn("PulseTrack: program upgrade skipped", e); }
      // only when it is still the same program (same days); something you rebuilt yourself is left alone
      const have = new Set(p.days.map(d => d && d.dayNumber));
      if (b.days.length !== p.days.length || !b.days.every(d => have.has(d.dayNumber))) return;
      // already week-by-week before (a "week" number or "Week 3 …" in every title)? then its saved "week" was a round counter, not a week
      const hadWeeks = p.days.every(d => d && (parseInt(d.week, 10) > 0 || /^\s*Week\s+\d+\b/i.test(String(d.title || ""))));
      let stamped = false;
      b.days.forEach(bd => {
        if (!(parseInt(bd.week, 10) > 0)) return;
        const d = p.days.find(x => x && x.dayNumber === bd.dayNumber);
        if (d && !(parseInt(d.week, 10) > 0)) { d.week = bd.week; changed = true; stamped = true; }
      });
      if (stamped && !hadWeeks) { const l = loadPending(); if (!l.includes(p.id)) { l.push(p.id); savePending(); } }
      if (Array.isArray(b.weekPlan) && !Array.isArray(p.weekPlan)) { p.weekPlan = JSON.parse(JSON.stringify(b.weekPlan)); changed = true; }
    });
    return changed;
  }
  const oSeed = WorkoutStorage.seedBuiltins;
  WorkoutStorage.seedBuiltins = function (data) {
    const out = oSeed.apply(this, arguments);
    try { if (stampWeeks(out)) this.setData(out); } catch (e) { console.warn("PulseTrack: week info skipped", e); }
    return out;
  };

  /* ------------------------------------------------- progress for list-type weeks */
  // st = { week, done:[dayNumbers of THIS week], round }
  function normalize(app, prog, P, st) {
    let changed = false;
    let wk = Math.max(1, Math.floor(+st.week) || 1);
    if (wk > P.W) { st.round = (st.round || 1) + Math.floor((wk - 1) / P.W); wk = ((wk - 1) % P.W) + 1; st.done = []; changed = true; }   // a plain "Week 14" counter from before the program had weeks
    if (wk !== st.week) { st.week = wk; changed = true; }
    const S = P.byWeek[st.week].days;
    const keep = st.done.filter(n => S.includes(n));
    if (keep.length !== st.done.length) { st.done = keep; changed = true; }
    const work = weekDays(prog, P, st.week).filter(d => !app.isRestDay(d));
    // a week whose workouts are all done moves on (this also repairs progress saved by the older engine)
    if (work.length && work.every(d => st.done.includes(d.dayNumber))) { advance(st, P); changed = true; }
    if (changed) app.saveProgState();
  }
  function convertCounter(app, prog, st) {
    const W = app.progWeeks(prog);
    if (W && st.week > 1 && st.week <= W) {
      const w = st.week, wk = n => { const d = dayObj(prog, n); return d ? app.dayWeek(prog, d) : 0; };
      const earlier = (prog.days || []).filter(d => app.dayWeek(prog, d) < w).map(d => d.dayNumber);
      const later = st.done.filter(n => wk(n) >= w);
      st.done = [...new Set([...earlier, ...later])];
      st.week = 1;
    }
  }
  const oGet = proto.getProgState;
  proto.getProgState = function (prog) {
    const st = oGet.apply(this, arguments);
    if (prog && loadPending().includes(prog.id)) {
      try { convertCounter(this, prog, st); this.saveProgState(); } catch (e) { console.error("PulseTrack weeks", e); }
      pending.splice(pending.indexOf(prog.id), 1); savePending();
    }
    const P = planOf(prog);
    if (P) { try { normalize(this, prog, P, st); } catch (e) { console.error("PulseTrack weeks", e); } }
    return st;
  };

  const oNext = proto.nextDayOf;
  proto.nextDayOf = function (prog) {
    const P = planOf(prog);
    if (!P) return oNext.apply(this, arguments);
    const st = this.getProgState(prog), S = weekDays(prog, P, st.week);
    return S.find(d => !st.done.includes(d.dayNumber) && !this.isRestDay(d))
      || S.find(d => !st.done.includes(d.dayNumber))
      || S.find(d => !this.isRestDay(d)) || S[0] || oNext.apply(this, arguments);
  };

  const oMark = proto.markDayDone;
  proto.markDayDone = function (prog, dayNumber) {
    const P = planOf(prog);
    if (!P || prog.id === FREE) return oMark.apply(this, arguments);
    const st = this.getProgState(prog), S = weekDays(prog, P, st.week), nums = S.map(d => d.dayNumber);
    if (!nums.includes(dayNumber)) return;                      // a day that belongs to another week: it does not tick this week
    if (!st.done.includes(dayNumber)) st.done.push(dayNumber);
    S.slice(0, nums.indexOf(dayNumber)).forEach(d => { if (this.isRestDay(d) && !st.done.includes(d.dayNumber)) st.done.push(d.dayNumber); });
    const work = S.filter(d => !this.isRestDay(d)).map(d => d.dayNumber), need = work.length ? work : nums;
    if (need.every(n => st.done.includes(n))) advance(st, P);
    this.saveProgState();
  };

  // while jumping in a list-type program no day may look "earlier" than the week we are jumping to
  const oDayWeek = proto.dayWeek;
  proto.dayWeek = function (prog, day) {
    if (this.__listJump && planOf(prog)) return 1e9;
    return oDayWeek.apply(this, arguments);
  };
  const oJump = proto.jumpToWeek;
  proto.jumpToWeek = function (prog, week) {
    const P = planOf(prog);
    if (!P) return oJump.apply(this, arguments);
    week = Math.max(1, Math.min(P.W, parseInt(week, 10) || 1));
    const st = this.getProgState(prog); st.week = week; st.done = []; if (week === 1) st.round = st.round || 1;
    this.__listJump = true;
    try { return oJump.apply(this, arguments); } finally { this.__listJump = false; }
  };

  // "Reset All Days" starts a list-type program over from week 1
  const oReset = proto.resetWholeProgram;
  if (oReset) proto.resetWholeProgram = async function () {
    const prog = this.activeProgram, P = planOf(prog);
    if (!P) return oReset.apply(this, arguments);
    let confirmed = false;
    const oSave = this.saveProgState;
    this.saveProgState = function () { confirmed = true; return oSave.apply(this, arguments); };
    try { await oReset.apply(this, arguments); } finally { delete this.saveProgState; }
    if (!confirmed) return;
    const st = this.getProgState(prog); st.week = 1; st.round = 1; st.done = [];
    this.saveProgState();
    this.activeDay = this.nextDayOf(prog) || this.activeDay;
    this.renderDaysView();
  };

  /* ------------------------------------------------------------ wording */
  const oBadge = proto.weekBadge;
  proto.weekBadge = function (prog, day) {
    const P = planOf(prog);
    if (!P || !day) return oBadge.apply(this, arguments);
    return `Week ${this.getProgState(prog).week} of ${P.W} · Day ${day.dayNumber}`;
  };
  const oUp = proto.upNextText;
  proto.upNextText = function (prog, day) {
    const P = planOf(prog);
    if (!P || !day) return oUp.apply(this, arguments);
    return `Up next: Week ${this.getProgState(prog).week} of ${P.W} · ${this.shortDayTitle(prog, day)}`;
  };
  const oShort = proto.shortDayTitle;
  proto.shortDayTitle = function (prog, day) {
    let t = oShort.apply(this, arguments);
    if (!t) return t;
    if (planOf(prog)) t = t.replace(/^\s*\[W[\d\s\-–&,]+\]\s*(?:Day\s+\d+\s*[:\-–]\s*)?/i, "").replace(/^\s*W\d+(?:\s*&\s*W\d+)*\s*[-–:]\s*/i, "");
    else if (this.progWeeks(prog)) t = t.replace(/^\s*Phase\s+\d+\s*[:\-–]\s*Week\s+\d+\s*[-–:·,]\s*/i, "");
    return t || oShort.apply(this, arguments);
  };

  /* ------------------------------------------------------------ the pinned week bar */
  const css = document.createElement("style");
  css.id = "pt-v29a-css";
  css.textContent = `
    #days-week-row.pt-weekbar { position: sticky; top: 4rem; z-index: 25; display: flex; align-items: center; justify-content: space-between; gap: .6rem;
      margin: 0 -1rem; padding: .5rem 1rem; border: 0; border-bottom: 1px solid rgb(var(--z800) / .9);
      background: rgb(var(--z950) / .985); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); }
    #days-week-row.pt-weekbar.hidden { display: none; }
    #view-days > #days-week-row.pt-weekbar.hidden + * { margin-top: 0; }
    #days-week-row.pt-weekbar > div { font-size: .75rem; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    #days-week-row.pt-weekbar #btn-set-week { flex: none; padding: .4rem .8rem; border-radius: .65rem; font-size: .72rem; font-weight: 800;
      background: rgb(var(--a500) / .16); color: rgb(var(--a300)); border: 1px solid rgb(var(--a500) / .35); }
    .pt-wkg { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .5rem; }
    .pt-wkb { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .12rem; min-height: 3.6rem; padding: .5rem .2rem;
      border-radius: .85rem; border: 1px solid rgb(var(--z800)); background: rgb(var(--z950)); color: rgb(var(--z200)); }
    .pt-wkb b { font-size: 1.1rem; font-weight: 800; line-height: 1; }
    .pt-wkb small { font-size: .62rem; line-height: 1; color: rgb(var(--z500)); font-variant-numeric: tabular-nums; }
    .pt-wkb.done small { color: rgb(var(--a300)); }
    .pt-wkb.now { border-color: rgb(var(--a500) / .65); background: rgb(var(--a500) / .14); color: #fff; }
    .pt-wkb.now small { color: rgb(var(--a300)); }
    .pt-wk-note { font-size: .7rem; color: rgb(var(--z500)); margin-top: .75rem; line-height: 1.35; }
  `;
  document.head.appendChild(css);

  /** The week row lives right under the header and stays there while the day list scrolls. */
  function placeBar() {
    const host = $("view-days"), row = $("days-week-row");
    if (!host || !row) return;
    if (!$("pt-sel-days")) {            // keep the "Just looking" bar where it always was: right under the program card
      const first = [...host.children].find(c => c !== row);
      const s = document.createElement("div"); s.id = "pt-sel-days"; s.className = "hidden";
      if (first) first.after(s); else host.appendChild(s);
    }
    if (host.firstElementChild !== row) host.insertBefore(row, host.firstElementChild);
    if (!row.classList.contains("pt-weekbar")) row.className = "pt-weekbar" + (row.classList.contains("hidden") || !row.innerHTML.trim() ? " hidden" : "");
    const hd = document.querySelector("header");
    if (hd && hd.offsetHeight) row.style.top = hd.offsetHeight + "px";
  }
  window.addEventListener("resize", () => { try { placeBar(); } catch (e) { } });
  placeBar();

  function weekStatus(app, prog) {
    const P = planOf(prog), st = app.getProgState(prog), W = weeksOf(app, prog), out = [];
    let cur;
    if (P) cur = st.week; else cur = app.dayWeek(prog, app.nextDayOf(prog)) || 1;
    for (let w = 1; w <= W; w++) {
      if (P) { out.push({ w, state: w < cur ? "done" : w === cur ? "now" : "todo", note: w < cur ? "✓" : w === cur ? "now" : "" }); continue; }
      const days = (prog.days || []).filter(d => app.dayWeek(prog, d) === w && !app.isRestDay(d));
      const n = days.filter(d => st.done.includes(d.dayNumber)).length;
      const all = days.length && n === days.length;
      out.push({ w, state: w === cur ? "now" : all ? "done" : "todo", note: all ? "✓" : n ? `${n}/${days.length}` : w === cur ? "now" : "" });
    }
    return { cur, list: out };
  }

  function openWeekSheet(app, prog) {
    const K = PT.kit, el = K.sheet("pt-wks", 66), S = weekStatus(app, prog);
    const notCurrent = typeof PT.currentProgramId === "function" && PT.currentProgramId() !== prog.id;
    const card = K.openSheet(el, `${K.head("Switch week", "Tap the week you're on. Weeks before it count as done.")}
      <div class="pt-wkg">${S.list.map(x => `<button type="button" data-w="${x.w}" class="pt-wkb tap-active ${x.state}"><b>${x.w}</b><small>${esc(x.note) || "&nbsp;"}</small></button>`).join("")}</div>
      <p class="pt-wk-note">Your saved workouts and PRs are never changed.${notCurrent ? " Switching week also makes this your current program." : ""}</p>`);
    card.addEventListener("click", e => {
      const b = e.target.closest("[data-w]"); if (!b) return;
      const w = parseInt(b.dataset.w, 10);
      K.closeSheet(el);
      if (w === S.cur && !notCurrent) return;
      app.jumpToWeek(prog, w);
      app.renderDaysView();
      app.toast(`Switched to week ${w}`);
    });
  }

  const oRow = proto.renderDaysWeekRow;
  proto.renderDaysWeekRow = function () {
    const prog = this.activeProgram, P = planOf(prog), W = weeksOf(this, prog);
    const row = $("days-week-row");
    if (!row || !prog || prog.id === FREE || !W) {        // counter-type program (or Freestyle): original row, pinned and relabelled
      const r = oRow.apply(this, arguments);
      try {
        placeBar();
        const b = $("btn-set-week"); if (b) b.textContent = "Switch week";
      } catch (e) { console.error("PulseTrack week bar", e); }
      return r;
    }
    const st = this.getProgState(prog);
    let cur, done, total, extra = "";
    if (P) {
      cur = st.week;
      const work = weekDays(prog, P, cur).filter(d => !this.isRestDay(d));
      total = work.length; done = work.filter(d => st.done.includes(d.dayNumber)).length;
      if ((st.round || 1) > 1) extra = ` · round ${st.round}`;
    } else {
      cur = this.dayWeek(prog, this.nextDayOf(prog)) || 1;
      const work = (prog.days || []).filter(d => !this.isRestDay(d));
      total = work.length; done = work.filter(d => st.done.includes(d.dayNumber)).length;
      if (st.week > 1) extra = ` · round ${st.week}`;
    }
    row.classList.remove("hidden");
    const phase = P && P.byWeek[cur] && P.byWeek[cur].name ? ` · ${esc(P.byWeek[cur].name)}` : "";
    row.innerHTML = `<div class="text-zinc-400"><span class="font-black text-white">Week ${cur} of ${W}</span>${phase} · ${done}/${total} done${extra}</div>
      <button id="btn-set-week" type="button" class="tap-active">Switch week</button>`;
    $("btn-set-week").addEventListener("click", () => openWeekSheet(this, prog));
    placeBar();
  };

  /* ------------------------------------------------------------ day list for list-type weeks */
  const oDec = proto.decorateDaysList;
  proto.decorateDaysList = function () {
    const prog = this.activeProgram, P = planOf(prog), list = this.dom.daysList;
    if (!P || !list) return oDec.apply(this, arguments);
    const st = this.getProgState(prog), next = this.nextDayOf(prog), curG = P.byWeek[st.week].gi;
    let last = -2;
    [...list.children].forEach(card => {
      const dn = parseInt(card.dataset.day, 10), day = dayObj(prog, dn);
      if (!day) return;
      const g = P.groups.findIndex(G => G.days.includes(dn));
      if (g !== last) {
        last = g;
        if (g >= 0) {
          const G = P.groups[g], isCur = g === curG;
          const work = weekDays(prog, P, st.week).filter(d => !this.isRestDay(d));
          const done = work.filter(d => st.done.includes(d.dayNumber)).length;
          const hd = document.createElement("div");
          hd.className = "pt-3 pb-0.5 px-1 flex items-baseline justify-between";
          hd.dataset.weekHeader = G.weeks[0];
          hd.innerHTML = `<span class="text-xs font-black uppercase tracking-widest ${isCur ? "text-emerald-400" : "text-zinc-400"}">${esc(weeksLabel(G.weeks))}${G.name ? " · " + esc(G.name) : ""}</span>`
            + `<span class="text-[10px] text-zinc-500 font-mono">${isCur ? `now: week ${st.week} · ${done}/${work.length} done` : ""}</span>`;
          list.insertBefore(hd, card);
        }
      }
      if (this.isRestDay(day)) {
        card.className = "bg-zinc-900/50 border border-zinc-800/70 rounded-xl px-4 py-2.5 tap-active cursor-pointer flex items-center justify-between";
        const sub = card.querySelector(".text-xs.text-zinc-400"); if (sub) sub.remove();
        const lab = card.querySelector(".uppercase"); if (lab) lab.remove();
        const h4 = card.querySelector("h4"); if (h4) h4.className = "text-xs font-semibold text-zinc-400";
      }
    });
    const el = next && list.querySelector(`[data-day="${next.dayNumber}"]`);
    if (el && el.scrollIntoView) requestAnimationFrame(() => el.scrollIntoView({ block: "center" }));
  };

  PT.weeks = { planOf, stampWeeks, weeksOf, openWeekSheet: () => openWeekSheet(window.app, window.app.activeProgram) };
})();
  