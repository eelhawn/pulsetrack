
/* =====================================================================
 * PulseTrack 2.35.0: deload helper and busy-season mode.
 *  - Deload check (Progress, Overview): counts your hard weeks in a row and looks for signs of fatigue
 *    (lifts that stopped going up, a jump in weekly sets, a lift slipping). When it is time it offers a
 *    deload week: for 7 days the "Last time" hint on every exercise suggests about 10% less weight and
 *    one set fewer, and Home shows a small reminder. It never changes your program.
 *  - Busy-season version (Programs, on the day list): turns any program into 2 to 4 full-body days that
 *    fit 30 to 60 minutes, built from the exercises that program leans on most, saved as a new program.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  const proto = ApplicationUI.prototype;
  const A = () => window.app;
  const $ = id => document.getElementById(id);
  const esc = s => PT.esc(s);
  const DAY = 86400000;
  const S = a => a.sessions || [];
  const save = () => { try { WorkoutStorage.saveSettings(A().settings); } catch (e) { } };
  const mondayOf = t => { const d = new Date(t); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d.getTime(); };
  const sessTime = s => s.ts || (PT.fromDs && PT.fromDs(s.date) ? PT.fromDs(s.date).getTime() : 0);
  const card = "bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3";
  const chip = (attr, label, on) => `<button type="button" ${attr} aria-pressed="${on}" class="pt-opt tap-active">${esc(label)}</button>`;

  /* ================================================================ deload */
  const todayDs = () => PT.ds(new Date());
  /** the running deload week, or null. The older "easy week" switch (settings.deloadUntil) counts too, so one system covers Home and Progress. */
  PT.deloadOn = a => {
    a = a || A(); const st = a && a.settings; if (!st) return null;
    const t = todayDs(), d = st.deload;
    if (d && d.start && d.end && t >= d.start && t <= d.end) return d;
    if (st.deloadUntil > Date.now()) return { start: t, end: PT.ds(new Date(st.deloadUntil - DAY)), pct: 0.1, sets: 1, legacy: true };
    return null;
  };
  PT.deloadActive = a => !!PT.deloadOn(a);
  function weekStats(a) {
    const mon = mondayOf(Date.now()), out = [];
    for (let i = 9; i >= 0; i--) {
      const t0 = mon - i * 7 * DAY, t1 = t0 + 7 * DAY, ss = S(a).filter(s => { const t = sessTime(s); return t >= t0 && t < t1; });
      let sets = 0; ss.forEach(s => { let n = 0; (s.ex || []).forEach(e => (e.sets || []).forEach(x => { if (x.t !== "W" && !PT.isCardioSet(x)) n++; })); sets += n || (+s.sets > 0 ? +s.sets : 0); });
      out.push({ t0, n: ss.length, sets });
    }
    return out;
  }
  const isLight = (w, i, arr) => {
    if (w.n === 0) return true;
    const prev = arr.slice(Math.max(0, i - 3), i).filter(x => x.n > 0); if (prev.length < 2) return false;
    return w.sets < 0.65 * (prev.reduce((t, x) => t + x.sets, 0) / prev.length);
  };
  PT.deloadCheck = function (a) {
    a = a || A(); const wk = weekStats(a), cur = wk[wk.length - 1];
    let i = wk.length - 1; if (cur.n < 2) i--;               // this week has barely started: count from last week
    let streak = 0; for (; i >= 0; i--) { const w = wk[i]; if (w.n >= 2 && (i === wk.length - 1 || !isLight(w, i, wk))) streak++; else break; }   // a week still in progress can not be judged "light" yet
    const reasons = [], recent = S(a).filter(s => sessTime(s) > Date.now() - 56 * DAY);
    // 1) lifts that have stopped going up
    const names = {}; recent.forEach(s => (s.ex || []).forEach(e => { if (e.name) names[e.name] = (names[e.name] || 0) + 1; }));
    let stuck = 0; Object.keys(names).forEach(n => { try { if (names[n] >= 3 && PT.plateau(n)) stuck++; } catch (e) { } });
    if (stuck >= 1) reasons.push(`${stuck} lift${stuck === 1 ? " has" : "s have"} stopped going up`);
    // 2) a jump in weekly sets
    const last3 = wk.slice(-4, -1), prev3 = wk.slice(-7, -4), avg = x => x.reduce((t, w) => t + w.sets, 0) / (x.length || 1);
    if (prev3.length === 3 && prev3.every(w => w.n > 0) && avg(last3) >= avg(prev3) * 1.15) {   // only against a real 3-week baseline, so ramping up from nothing is not counted
      const up = Math.round((avg(last3) / avg(prev3) - 1) * 100);
      reasons.push(up >= 100 ? "weekly sets have more than doubled over the last 3 weeks" : `weekly sets are up ${up}% over the last 3 weeks`);
    }
    // 3) a main lift slipping
    const top = Object.keys(names).sort((x, y) => names[y] - names[x]).slice(0, 3); let dips = [];
    top.forEach(n => {
      try {
        const sr = PT.exSeries ? PT.exSeries(a, n) : []; if (sr.length < 4) return;
        const r = Math.max(0, ...sr.filter(p => p.t > Date.now() - 14 * DAY).map(p => p.v)), b = Math.max(0, ...sr.filter(p => p.t <= Date.now() - 14 * DAY && p.t > Date.now() - 56 * DAY).map(p => p.v));
        if (r > 0 && b > 0 && r < b * 0.95) dips.push(n);
      } catch (e) { }
    });
    if (dips.length) reasons.push(`${dips[0]}${dips.length > 1 ? " and others are" : " is"} a little below your recent best`);
    const on = PT.deloadOn(a);
    const due = !on && (streak >= 6 || (streak >= 4 && reasons.length >= 1) || (streak >= 3 && reasons.length >= 2));
    return { streak, reasons, due, on, wk, building: !on && !due && streak >= 3 };
  };
  function deloadCardHtml(a) {
    const d = PT.deloadCheck(a), on = d.on;
    let head, tone, btn = "";
    if (on) {
      const left = Math.max(0, Math.round((PT.fromDs(on.end).getTime() - PT.fromDs(todayDs()).getTime()) / DAY)) + 1;
      head = `<b>Deload week is on</b> · ${left} day${left === 1 ? "" : "s"} left`; tone = "blue";
      btn = `<button type="button" data-dl="stop" class="pt-b w-full">End it early</button>`;
    } else if (d.due) {
      head = `<b>Good time for a lighter week</b>`; tone = "amber";
      btn = `<button type="button" data-dl="start" class="pt-b go w-full">Start a deload week</button>`;
    } else if (d.building) {
      head = `<b>Building up</b> · a lighter week is worth planning soon`; tone = "zinc";
      btn = `<button type="button" data-dl="start" class="pt-b w-full">Start a deload week anyway</button>`;
    } else {
      head = `<b>No deload needed yet</b>`; tone = "emerald";
      btn = `<button type="button" data-dl="start" class="pt-b w-full">Start a deload week anyway</button>`;
    }
    const max = Math.max(1, ...d.wk.slice(-8).map(w => w.sets));
    const bars = d.wk.slice(-8).map((w, i, arr) => `<span class="pt-dl-col" title="${w.sets} hard sets"><i style="height:${Math.max(4, Math.round(w.sets / max * 100))}%" class="${i === arr.length - 1 ? "cur" : ""}"></i></span>`).join("");
    const why = d.reasons.length ? `<ul class="text-[11px] text-zinc-300 space-y-0.5 list-disc pl-4">${d.reasons.map(r => `<li>${esc(r)}</li>`).join("")}</ul>` : "";
    const how = on ? `<p class="text-[11px] text-zinc-400 leading-relaxed">The <b class="text-zinc-200">Last time</b> hint on each exercise now suggests about ${Math.round((on.pct || 0.1) * 100)}% less weight and ${on.sets === 1 ? "one set" : (on.sets || 1) + " sets"} fewer. Leave plenty of reps in the tank and sleep well.</p>`
      : `<p class="text-[11px] text-zinc-400 leading-relaxed">A deload week keeps you training but easier: about 10% less weight and one set fewer on each exercise, for 7 days. It lets tired muscles and joints catch up so the next block goes better. Your program is not changed.</p>`;
    return `<h3 class="text-xs font-bold text-white">Deload check</h3>
      <div class="pt-dl-head pt-dl-${tone}"><span class="text-lg">${on ? "🧘" : d.due ? "😮‍💨" : "💪"}</span><span class="text-xs">${head}</span></div>
      <div class="flex items-end gap-3"><div class="shrink-0"><span class="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Hard weeks in a row</span><span class="block text-2xl font-black text-white">${d.streak}</span></div><div class="flex-1"><div class="pt-dl-bars">${bars}</div><span class="block text-[10px] text-zinc-500 mt-1">Hard sets per week, last 8 weeks</span></div></div>
      ${why}${how}${btn}`;
  }
  function startDeload(a) {
    a = a || A(); const s = todayDs(), e = new Date(); e.setDate(e.getDate() + 6);
    a.settings.deload = { start: s, end: PT.ds(e), pct: 0.1, sets: 1 }; a.settings.deloadUntil = 0; a.settings.deloadSnooze = 0; save();
    a.toast("Deload week on. Suggestions are about 10% lighter with one set fewer.");
    try { a.renderProgressView(); a.renderHomeView(); } catch (x) { }
  }
  function stopDeload(a) {
    a = a || A(); a.settings.deload = null; a.settings.deloadUntil = 0; a.settings.deloadSnooze = Date.now() + 21 * DAY; save(); a.toast("Deload week ended");
    try { a.renderProgressView(); a.renderHomeView(); } catch (x) { }
  }
  PT.deloadStart = startDeload; PT.deloadStop = stopDeload;
  const oPV = proto.renderProgressView;
  proto.renderProgressView = function () {
    const r = oPV.apply(this, arguments);
    try {
      const root = $("progress-body"); if (!root) return r;
      const panel = root.querySelector('[data-ptab="overview"]') || root;
      const old = $("pt-dlcheck-card"); if (old) old.remove();
      const c = document.createElement("div"); c.id = "pt-dlcheck-card"; c.className = card; c.innerHTML = deloadCardHtml(this);
      panel.appendChild(c);
    } catch (e) { console.error("PulseTrack deload card", e); }
    return r;
  };

  /* ================================================================ busy-season version */
  const GROUPOF = { Chest: "Chest", Back: "Back", Traps: "Back", Shoulders: "Shoulders", Biceps: "Arms", Triceps: "Arms", Forearms: "Arms", Legs: "Legs", Core: "Core" };
  let EDB = null;
  function edb() {
    if (EDB) return EDB; EDB = new Map();
    (typeof EXERCISE_DATABASE !== "undefined" ? EXERCISE_DATABASE : []).forEach(e => { EDB.set(e.name.toLowerCase(), e); (e.aka || []).forEach(k => { if (!EDB.has(k.toLowerCase())) EDB.set(k.toLowerCase(), e); }); });
    return EDB;
  }
  const COMPOUND = /squat|deadlift|press|row|pull-?up|chin-?up|pulldown|dip|lunge|thrust|clean|snatch|good morning|step-?up/i;
  const ORDER = ["Legs", "Back", "Chest", "Shoulders", "Arms", "Core"];
  /** { title, description, days:[{ title, exercises:[…] }], preview } or null when the program has too little to build from */
  PT.busyPlan = function (prog, nDays, minutes) {
    if (!prog || !Array.isArray(prog.days)) return null;
    nDays = Math.max(2, Math.min(4, nDays || 3)); minutes = [30, 45, 60].includes(minutes) ? minutes : 45;
    const pool = new Map();
    prog.days.forEach(d => (d.exercises || []).forEach((e, i) => {
      if (!e || !e.name || e.type === "tabata") return;
      const en = edb().get(String(e.name).toLowerCase()); if (!en || !GROUPOF[en.category]) return;
      let o = pool.get(en.name); if (!o) { o = { name: en.name, group: GROUPOF[en.category], n: 0, pos: 99, reps: e.reps, rest: e.restSeconds, type: e.type }; pool.set(en.name, o); }
      o.n++; o.pos = Math.min(o.pos, i); if (!o.reps) o.reps = e.reps;
    }));
    const byGroup = {}; pool.forEach(o => { o.score = o.n * 2 - o.pos * 0.4 + (COMPOUND.test(o.name) ? 1.5 : 0); (byGroup[o.group] = byGroup[o.group] || []).push(o); });
    Object.keys(byGroup).forEach(g => byGroup[g].sort((x, y) => y.score - x.score));
    const groups = ORDER.filter(g => byGroup[g] && byGroup[g].length); if (groups.length < 3) return null;
    const secs = o => (COMPOUND.test(o.name) ? 45 : 35), restOf = o => Math.max(45, Math.min(150, o.rest || (COMPOUND.test(o.name) ? 90 : 60)));
    const days = [], letters = "ABCD";
    for (let di = 0; di < nDays; di++) {
      const picks = []; const seen = new Set();
      const take = (g, k) => { const l = byGroup[g]; if (!l || !l.length) return; const o = l[(di + (k || 0)) % l.length]; if (!seen.has(o.name)) { seen.add(o.name); picks.push(o); } };
      take("Legs"); take("Back"); take("Chest"); take("Shoulders"); take("Arms"); take("Core");
      if (minutes >= 60) { take("Legs", 1); take("Back", 1); take("Arms", 1); }
      const sets = o => (o === picks[0] && minutes >= 45 ? 4 : 3);
      const est = () => 5 + Math.round(picks.reduce((t, o) => t + sets(o) * (secs(o) + restOf(o)), 0) / 60);
      while (picks.length > 3 && est() > minutes) picks.pop();
      days.push({ title: "Full body " + letters[di], estimatedMinutes: est(), exercises: picks.map(o => ({ name: o.name, sets: sets(o), reps: o.reps || "8-12", restSeconds: restOf(o), restAuto: false, type: "standard" })) });
    }
    if (days.some(d => d.exercises.length < 3)) return null;
    return { title: String(prog.title || "Program").replace(/\s*·\s*Busy season$/, "") + " · Busy season", description: `${nDays} full-body days of about ${minutes} minutes, built from ${prog.title}.`, days };
  };
  const busy = { d: 3, m: 45 };
  function busySheet(a) {
    const prog = a.activeProgram; if (!prog) return;
    const plan = PT.busyPlan(prog, busy.d, busy.m);
    const prev = plan ? plan.days.map(d => `<div class="rounded-xl bg-zinc-950 border border-zinc-800 p-2.5"><span class="block text-xs font-bold text-white">${esc(d.title)} <span class="font-normal text-zinc-500">· about ${d.estimatedMinutes} min</span></span><span class="block text-[11px] text-zinc-400 mt-0.5 leading-snug">${d.exercises.map(e => esc(e.name) + " " + e.sets + "×").join(" · ")}</span></div>`).join("") : `<p class="text-xs text-amber-300">This program does not have enough different muscle groups to build a full-body version from.</p>`;
    const lab = t => `<span class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">${t}</span>`;
    const body = `<div class="space-y-3"><p class="text-xs text-zinc-400 leading-relaxed">Slammed at work? This keeps the exercises <b class="text-zinc-200">${esc(prog.title)}</b> leans on most and packs them into full-body days. It is saved as a new program, so your own stays as it is.</p>
      <div>${lab("Days a week")}<div class="flex gap-1.5">${[2, 3, 4].map(n => chip(`data-busy-d="${n}"`, n + " days", busy.d === n)).join("")}</div></div>
      <div>${lab("Time per workout")}<div class="flex gap-1.5">${[30, 45, 60].map(n => chip(`data-busy-m="${n}"`, n + " min", busy.m === n)).join("")}</div></div>
      <div class="space-y-1.5">${prev}</div></div>`;
    a.openSheet("Busy-season version", "Full-body days that fit a short week", body, plan ? `<button type="button" data-busy-go="1" class="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm tap-active">Create this program</button>` : "");
  }
  function busyCreate(a) {
    const plan = PT.busyPlan(a.activeProgram, busy.d, busy.m); if (!plan) return;
    const prog = PT.saveProgram(plan, a); try { a.closeSheet(); } catch (e) { }
    if (!prog) { a.toast("Could not save that program"); return; }
    a.toast(`Saved "${prog.title}" to your programs`, "Open", () => {
      a.activeProgram = prog; a.activeDay = a.nextDayOf ? (a.nextDayOf(prog) || prog.days[0]) : prog.days[0];
      try { AppStateMemory.saveActive(prog.id, a.activeDay.dayNumber); } catch (e) { }
      a.showView("days");
    }, 7000);
  }
  const oDays = proto.renderDaysView;
  if (typeof oDays === "function") proto.renderDaysView = function () {
    const r = oDays.apply(this, arguments);
    try {
      const p = this.activeProgram, host = $("view-days"); if (!p || !host) return r;
      let b = $("pt-busy");
      const ok = p.id !== "freestyle" && (p.days || []).filter(d => (d.exercises || []).length).length >= 2 && !/·\s*Busy season$/.test(p.title || "");
      if (!ok) { if (b) b.remove(); return r; }
      if (!b) {
        b = document.createElement("button"); b.type = "button"; b.id = "pt-busy";
        b.className = "w-full py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-200 tap-active";
        b.textContent = "⚡ Busy-season version (fewer, shorter days)";
        b.addEventListener("click", () => busySheet(A()));
        (this.dom.daysList || host).insertAdjacentElement("afterend", b);
      }
    } catch (e) { console.error("PulseTrack busy season", e); }
    return r;
  };

  document.addEventListener("click", e => {
    const a = A(); if (!a || !e.target.closest) return;
    const dl = e.target.closest("[data-dl]"); if (dl) { if (dl.dataset.dl === "start") startDeload(a); else stopDeload(a); return; }
    const bd = e.target.closest("[data-busy-d]"); if (bd) { busy.d = parseInt(bd.dataset.busyD, 10); busySheet(a); return; }
    const bm = e.target.closest("[data-busy-m]"); if (bm) { busy.m = parseInt(bm.dataset.busyM, 10); busySheet(a); return; }
    if (e.target.closest("[data-busy-go]")) busyCreate(a);
  });

  const css = document.createElement("style"); css.id = "pt-v235-dl-css";
  css.textContent = `
    .pt-dl-head { display: flex; align-items: center; gap: .6rem; padding: .65rem .8rem; border-radius: .85rem; border: 1px solid rgb(var(--z800)); background: rgb(var(--z950)); color: rgb(var(--z100)); }
    .pt-dl-amber { border-color: rgb(180 83 9 / .6); background: rgb(69 26 3 / .4); color: #fcd34d; }
    .pt-dl-blue { border-color: rgb(30 64 175 / .6); background: rgb(23 37 84 / .4); color: #93c5fd; }
    .pt-dl-emerald { color: #6ee7b7; }
    .pt-dl-bars { display: flex; align-items: flex-end; gap: .25rem; height: 2.6rem; }
    .pt-dl-col { flex: 1; height: 100%; display: flex; align-items: flex-end; }
    .pt-dl-col i { display: block; width: 100%; border-radius: .2rem; background: rgb(var(--z700)); }
    .pt-dl-col i.cur { background: rgb(var(--a500)); }
    #pt-dlcheck-card .pt-b { padding: .6rem .85rem; border-radius: .7rem; font-size: .78rem; font-weight: 700; background: rgb(var(--z800)); color: rgb(var(--z100)); }
    #pt-dlcheck-card .pt-b.go { background: rgb(var(--a600)); color: #fff; }
    .pt-next[data-k="deload"] { border-color: rgb(30 64 175 / .6); }
  `;
  document.head.appendChild(css);
})();
  