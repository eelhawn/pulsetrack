
/* =====================================================================
 * PulseTrack 2.31.0: things to chase.
 *  - XP and levels (titles + profile frames you unlock), a weekly goal ring, a goal streak with monthly freezes,
 *    weekly quests, strength ranks per lift, milestone + secret badges, family head-to-head, share cards,
 *    confetti, and a year in review.
 *  Everything is worked out from your saved workouts, so nothing needs a server.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined" || !PT.badges || !PT.badgeKit) return;
  const proto = ApplicationUI.prototype;
  const A = () => window.app;
  const $ = id => document.getElementById(id);
  const esc = s => PT.esc(s);
  const DAY = 86400000, LB = 2.2046226;
  const save = () => { try { WorkoutStorage.saveSettings(A().settings); } catch (e) { } };
  const mondayOf = t => { const d = new Date(t); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d.getTime(); };
  const nextMon = t => mondayOf(t + 3.5 * DAY + 4 * DAY);
  const prevMon = t => mondayOf(t - 3.5 * DAY);
  const dsOf = t => PT.ds(new Date(t));
  const sessTime = s => s.ts || (PT.fromDs && PT.fromDs(s.date) ? PT.fromDs(s.date).getTime() : 0);
  const unitKg = () => A().unit() === "kg";
  const toLb = (v, from) => (from === "kg" ? v * LB : v);
  const fmt = v => Math.round(v).toLocaleString();
  const V = lb => fmt(unitKg() ? lb / LB : lb) + (unitKg() ? " kg" : " lb");
  const S = a => a.sessions || [];
  const card = "bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5 space-y-2";
  const chip = (attr, label, on) => `<button type="button" ${attr} aria-pressed="${on}" class="pt-opt tap-active">${esc(label)}</button>`;
  const bestE1 = (a, s) => { const m = {}; (s.ex || []).forEach(e => { let b = 0; (e.sets || []).forEach(st => { if (st.t !== "W") b = Math.max(b, a.setE1rm(e.name, st, s.date) || 0); }); if (b > 0) m[e.name] = b; }); return m; };
  const K = () => PT.badgeKit;

  /* ============================================================== weekly goal and streak (with freezes) */
  function weeksOf(a) {
    const m = new Map();
    S(a).forEach(s => {
      const w = mondayOf(sessTime(s)); let o = m.get(w); if (!o) { o = { k: 0, v: 0, s: 0, p: 0, days: new Set() }; m.set(w, o); }
      o.k++; o.v += toLb(s.vol || 0, s.unit); o.s += s.sets || 0; o.p += (s.prs || []).length; o.days.add(s.date);
    });
    return m;
  }
  function goalFor(a, wkT) {
    const st = a.settings || {}, log = Array.isArray(st.weekGoalLog) ? st.weekGoalLog : [];
    let g = null; log.slice().sort((x, y) => x.t - y.t).forEach(e => { if (e.t <= wkT) g = e.g; });
    return Math.max(1, Math.min(7, g || st.weekGoal || 3));
  }
  PT.setWeekGoal = function (g, appArg) {
    const a = appArg || A(); g = Math.max(1, Math.min(7, parseInt(g, 10) || 3));
    const st = a.settings, log = Array.isArray(st.weekGoalLog) ? st.weekGoalLog : [];
    if (!log.length) log.push({ t: 0, g: st.weekGoal || 3 });
    const now = mondayOf(Date.now()); const i = log.findIndex(e => e.t === now);
    if (i >= 0) log[i].g = g; else log.push({ t: now, g });
    st.weekGoalLog = log.slice(-60); st.weekGoal = g; save();
  };
  function streakInfo(a, W) {
    const goal = goalFor(a, mondayOf(Date.now())), now = mondayOf(Date.now());
    const cur = W.get(now), k = cur ? cur.days.size : 0;
    let streak = 0, best = 0, bank = 0, lastM = -1, frozen = [];
    if (W.size) {
      const first = Math.min(...W.keys());
      for (let t = first; t < now; t = nextMon(t)) {
        const d = new Date(t), mk = d.getFullYear() * 12 + d.getMonth();
        if (mk !== lastM) { lastM = mk; bank = Math.min(2, bank + 1); }
        const o = W.get(t), hit = o && o.days.size >= goalFor(a, t);
        if (hit) { streak++; if (streak > best) best = streak; }
        else if (streak > 0 && bank > 0) { bank--; frozen.push(t); }
        else streak = 0;
      }
    }
    const dn = new Date(now), mk = dn.getFullYear() * 12 + dn.getMonth(); if (mk !== lastM) bank = Math.min(2, bank + 1);
    const hitNow = k >= goal, total = streak + (hitNow ? 1 : 0);
    return { cur: total, best: Math.max(best, total), bank, hitNow, goal, k, frozen };
  }

  /* ============================================================== XP and levels */
  const TITLES = [[1, "Rookie"], [5, "Regular"], [10, "Grinder"], [15, "Iron Hand"], [20, "Veteran"], [30, "Beast"], [40, "Legend"], [50, "Immortal"]];
  const titleOf = L => { let t = TITLES[0][1]; TITLES.forEach(x => { if (L >= x[0]) t = x[1]; }); return t; };
  const nextTitle = L => TITLES.find(x => x[0] > L);
  const FRAMES = [
    { id: "classic", lvl: 1, name: "Classic", c: ["#d4d4d8", "#52525b"] },
    { id: "ember", lvl: 5, name: "Ember", c: ["#fdba74", "#ea580c"] },
    { id: "aurora", lvl: 10, name: "Aurora", c: ["#5eead4", "#6366f1"] },
    { id: "gold", lvl: 15, name: "Gold", c: ["#fde68a", "#d97706"] },
    { id: "platinum", lvl: 25, name: "Platinum", c: ["#a5f3fc", "#8b5cf6"] },
    { id: "prism", lvl: 35, name: "Prism", c: ["#f472b6", "#facc15", "#22d3ee"] }
  ];
  const levelOf = xp => {
    const L = Math.max(1, Math.floor((1 + Math.sqrt(1 + xp / 12.5)) / 2)), cur = 50 * L * (L - 1), nxt = 50 * (L + 1) * L;
    return { L, cur, nxt, into: xp - cur, span: nxt - cur, pct: Math.max(0, Math.min(1, (xp - cur) / (nxt - cur))) };
  };
  const TIER_XP = [20, 40, 80, 150], QUEST_XP = 100;
  let memo = null;
  /** everything the reward screens need, cached until a workout or the day changes */
  function state(a, fresh) {
    a = a || A();
    const ss = S(a), key = ss.length + "|" + ss.reduce((m, s) => Math.max(m, s.upd || s.ts || 0), 0) + "|" + (a.body || []).length + "|" + PT.ds() + "|" + JSON.stringify(a.settings.weekGoalLog || "") + "|" + Object.keys(a.settings.questDone || {}).length + "|" + (a.settings.myName || "") + "|" + (PT.xpKey ? PT.xpKey(a) : "");
    if (!fresh && memo && memo.key === key) return memo.v;
    const W = weeksOf(a), st = streakInfo(a, W), badges = PT.badges(a);
    let w = 0, sets = 0, prs = 0, vol = 0;
    ss.forEach(s => { w++; sets += s.sets || 0; prs += (s.prs || []).length; vol += Math.floor(toLb(s.vol || 0, s.unit) / 500); });
    let hits = 0; W.forEach((o, t) => { if (o.days.size >= goalFor(a, t)) hits++; });
    const qd = a.settings.questDone || {}, quests = Object.keys(qd).reduce((n, k) => n + (qd[k] || []).length, 0);
    const parts = { workouts: w * 50, sets: sets * 3, prs: prs * 60, volume: vol, weeks: hits * 50, badges: badges.filter(b => b.got).reduce((n, b) => n + TIER_XP[b.tier], 0), quests: quests * QUEST_XP };
    if (PT.xpExtras) try { Object.assign(parts, PT.xpExtras(a)); } catch (e) { }
    const total = Object.keys(parts).reduce((n, k) => n + parts[k], 0), lv = levelOf(total);
    const v = { W, streak: st, xp: total, parts, lv, title: titleOf(lv.L), badges };
    memo = { key, v }; return v;
  }
  PT.rewards = state;
  PT.goalFor = goalFor; PT.weeksOf = weeksOf; PT.sessionXpOf = s => 50 + 3 * (s.sets || 0) + 60 * (s.prs || []).length + Math.floor(toLb(s.vol || 0, s.unit) / 500);
  const sessionXp = s => 50 + 3 * (s.sets || 0) + 60 * (s.prs || []).length + Math.floor(toLb(s.vol || 0, s.unit) / 500);

  /* ============================================================== weekly quests */
  const regionCache = {};
  function regionOf(name) { if (name in regionCache) return regionCache[name]; let r = ""; try { r = Object.keys(PT.regionsFor(name, false) || {})[0] || ""; } catch (e) { } return (regionCache[name] = r); }
  function weekCtx(a, W) {
    const c = { days: new Set(), v: 0, sets: 0, prs: 0, regs: {}, ex: new Set(), bw: false };
    S(a).forEach(s => {
      if (mondayOf(sessTime(s)) !== W) return;
      c.days.add(s.date); c.v += toLb(s.vol || 0, s.unit); c.prs += (s.prs || []).length;
      (s.ex || []).forEach(e => { const n = (e.sets || []).filter(x => x.t !== "W").length; if (!n) return; c.sets += n; c.ex.add(e.name); const r = regionOf(e.name); if (r) c.regs[r] = (c.regs[r] || 0) + n; });
    });
    c.bw = (a.body || []).some(b => b.bw > 0 && PT.fromDs(b.date) && mondayOf(PT.fromDs(b.date).getTime()) === W);
    c.reg = Object.keys(c.regs).length;
    return c;
  }
  const sumRegs = (c, list) => list.reduce((n, r) => n + (c.regs[r] || 0), 0);
  function rng(seed) { let t = seed >>> 0; return () => { t = (t + 0x6D2B79F5) >>> 0; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; }; }
  function questList(a, wk) {
    wk = wk || mondayOf(Date.now());
    const c = weekCtx(a, wk), p = weekCtx(a, prevMon(wk)), goal = goalFor(a, wk), W = state(a).W;
    const recent = [1, 2, 3, 4].map(i => W.get(wk - i * 7 * DAY - 0)).filter(Boolean), avgSets = recent.length ? recent.reduce((n, o) => n + o.s, 0) / recent.length : 30;
    const setsGoal = Math.max(20, Math.min(120, Math.round(avgSets * 1.1 / 5) * 5));
    const pool = [
      { id: "vol", ok: p.v > 0, text: "Beat last week's volume", cur: c.v, goal: p.v + 1, fmtGoal: V(p.v), fmtCur: V(c.v) },
      { id: "sets", ok: true, text: `Do ${setsGoal} working sets`, cur: c.sets, goal: setsGoal },
      { id: "pr", ok: true, text: "Set a personal record", cur: c.prs, goal: 1 },
      { id: "reg", ok: true, text: "Train 4 different muscle groups", cur: c.reg, goal: 4 },
      { id: "var", ok: true, text: "Use 8 different exercises", cur: c.ex.size, goal: 8 },
      { id: "legs", ok: true, text: "Do 12 sets of legs", cur: sumRegs(c, ["quads", "hamstrings", "glutes", "calves"]), goal: 12 },
      { id: "back", ok: true, text: "Do 12 sets for your back", cur: sumRegs(c, ["back", "lowerback"]), goal: 12 },
      { id: "push", ok: true, text: "Do 15 sets of pushing", cur: sumRegs(c, ["chest", "shoulders", "triceps"]), goal: 15 },
      { id: "bw", ok: true, text: "Log your body weight", cur: c.bw ? 1 : 0, goal: 1 }
    ].filter(q => q.ok);
    const r = rng(Math.round(wk / DAY / 7) * 7919 + 13), picked = [];
    while (picked.length < 2 && pool.length) picked.push(pool.splice(Math.floor(r() * pool.length), 1)[0]);
    const list = [{ id: "goal", text: `Train ${goal} day${goal === 1 ? "" : "s"}`, cur: c.days.size, goal }].concat(picked);
    return list.map(q => Object.assign(q, { done: q.cur >= q.goal, xp: QUEST_XP }));
  }
  PT.quests = questList;
  /** remember finished quests (they are worth XP). Returns the ones that just finished */
  function syncQuests(a) {
    const wk = mondayOf(Date.now()), key = String(wk), qd = a.settings.questDone && typeof a.settings.questDone === "object" ? a.settings.questDone : (a.settings.questDone = {});
    const have = Array.isArray(qd[key]) ? qd[key] : [], fresh = questList(a, wk).filter(q => q.done && !have.includes(q.id));
    if (fresh.length) { qd[key] = have.concat(fresh.map(q => q.id)); save(); memo = null; }
    return fresh;
  }

  /* ============================================================== lift ranks */
  const LIFTS = [
    { key: "bench", label: "Bench Press", icon: "💪", re: /^(smith machine (flat |bench )?press|(barbell )?bench press)$/i, r: [0.5, 0.75, 1.25, 1.75, 2.0] },
    { key: "squat", label: "Squat", icon: "🦵", re: /^(smith machine squats?|(barbell )?(back )?squat)$/i, r: [0.75, 1.25, 1.5, 2.25, 2.75] },
    { key: "dead", label: "Deadlift", icon: "🏗️", re: /^(barbell )?(conventional )?deadlift$/i, r: [1.0, 1.5, 2.0, 2.5, 3.0] },
    { key: "ohp", label: "Overhead Press", icon: "🙌", re: /^(barbell )?(standing )?(overhead|military|shoulder) press$/i, r: [0.35, 0.55, 0.8, 1.1, 1.4] }
  ];
  const RANKS = ["Untrained", "Beginner", "Novice", "Intermediate", "Advanced", "Elite"];
  const RANK_COL = ["#71717a", "#a3e635", "#38bdf8", "#c084fc", "#fbbf24", "#f472b6"];
  const bwLb = a => {
    const l = (a.body || []).filter(b => b.bw > 0).sort((x, y) => String(y.date).localeCompare(String(x.date)))[0];
    if (l) return unitKg() ? l.bw * LB : l.bw;
    return a.settings.rankBw > 0 ? a.settings.rankBw : 0;
  };
  function bestLifts(a) {
    const best = {}; LIFTS.forEach(l => { best[l.key] = 0; });
    S(a).forEach(s => { const m = bestE1(a, s); Object.keys(m).forEach(n => LIFTS.forEach(l => { if (l.re.test(n)) best[l.key] = Math.max(best[l.key], toLb(m[n], s.unit)); })); });
    return best;
  }
  /* 2.53.0: the ranks use the SAME standards as the Strength level card: StrengthLevel.com tables for your body weight, the Men / Women switch on that card, and the same best-lift
   * matching (bench, squat and deadlift variations are counted or left out exactly the same way). Before, this section used its own rough ratios, so one lift showed two different targets. */
  const SEX_OF = a => (a.settings.strengthSex === "female" ? "female" : "male");
  const BASE_KEY = { bench: "bench", squat: "squat", dead: "deadlift", ohp: "ohp" };
  const BASE_MATCH = {
    bench: { match: /bench press/i, exclude: /dumbbell|incline|decline|close|wide|reverse|smith|machine|floor|single|hammer|iso-lateral|board|pin|spoto|landmine/i, also: /^smith machine flat press$/i },
    squat: { match: /squat/i, exclude: /split|goblet|dumbbell|smith|hack|machine|front|sumo|zercher|box|pistol|jump|belt|sissy|bulgarian|overhead|safety|cyclist|heel|pendulum|v-squat|landmine|kettlebell|wall|plie|bodyweight|cossack|pause|jefferson|air squat/i, also: /^smith machine squats?$/i },
    dead: { match: /deadlift/i, exclude: /romanian|stiff|single|rdl|dumbbell|deficit|trap|hex|kettlebell|b-stance|snatch|smith|machine/i }
  };
  function bestFor(a, key, scanned) {
    const d = BASE_MATCH[key];
    if (d && typeof a.bestLift === "function" && a.prs) { const b = a.bestLift(d).best; if (b > 0) return unitKg() ? b * LB : b; }
    return scanned || 0;
  }
  /** best estimated 1RM in lb for bench / squat / dead / ohp, counted exactly like the Strength level card */
  PT.bigBest = function (a, key) { a = a || A(); return bestFor(a, key, bestLifts(a)[key] || 0); };
  PT.liftRanks = function (appArg) {
    const a = appArg || A(), bw = bwLb(a), sex = SEX_OF(a), best = bestLifts(a);
    return LIFTS.filter(l => l.key !== "ohp").map(l => { // the overhead press stays only as a badge line
      const e1 = bestFor(a, l.key, best[l.key]), th = bw ? PT.strengthThresholds(BASE_KEY[l.key], sex, bw) : null;
      const idx = th && e1 > 0 ? Math.max(1, th.filter(t => e1 >= t).length) : 0; // the card calls anything under Novice "Beginner", so does this
      const nxt = th && idx < 5 && idx > 0 ? th[idx] : 0;
      return { key: l.key, label: l.label, icon: l.icon, e1, idx, rank: RANKS[idx], next: th && idx > 0 && idx < 5 ? RANKS[idx + 1] : null, toNext: nxt ? Math.max(0, nxt - e1) : 0, base: th && idx > 1 ? th[idx - 1] : 0, target: th ? (idx < 5 ? th[Math.max(idx, 1)] : th[4]) : 0, ratio: bw ? e1 / bw : 0, bw };
    });
  };

  /* ============================================================== extra badges: milestones + secret */
  const MS = [
    { key: "total", icon: "🔱", steps: [500, 750, 1000, 1250, 1500], names: ["Five Hundred", "Three-Quarter Ton", "The Thousand", "Twelve-Fifty", "Fifteen Hundred"], lb: true },
    { key: "bwbench", icon: "💪", lift: "bench", label: "Bench", steps: [0.5, 0.75, 1, 1.25, 1.5] },
    { key: "bwsquat", icon: "🦵", lift: "squat", label: "Squat", steps: [1, 1.25, 1.5, 2, 2.5] },
    { key: "bwdead", icon: "🏗️", lift: "dead", label: "Deadlift", steps: [1.25, 1.5, 2, 2.5, 3] },
    { key: "bwohp", icon: "🙌", lift: "ohp", label: "Press", steps: [0.5, 0.65, 0.8, 1] }
  ];
  const SECRETS = [
    { k: "night", icon: "🦇", name: "Night Shift", desc: "Start a workout between 10 pm and 4 am", tier: 2 },
    { k: "dawn", icon: "🌄", name: "Dawn Raid", desc: "Start a workout between 4 and 6 am", tier: 2 },
    { k: "comeback", icon: "🔁", name: "Comeback Kid", desc: "Train again after 30 or more days away", tier: 2 },
    { k: "holiday", icon: "🎄", name: "Holiday Hero", desc: "Train on Christmas, New Year's Day, New Year's Eve or the 4th of July", tier: 3 },
    { k: "double", icon: "✌️", name: "Two-a-Day", desc: "Finish two workouts on the same day", tier: 2 },
    { k: "marathon", icon: "⌛", name: "Iron Marathon", desc: "One workout that lasts 2 hours or more", tier: 2 },
    { k: "quick", icon: "⚡", name: "Speed Run", desc: "8 or more sets in 25 minutes or less", tier: 2 },
    { k: "seven", icon: "7️⃣", name: "Seven Days a Week", desc: "Train on all 7 days of a single week", tier: 3 },
    { k: "hundred", icon: "💯", name: "Hundred Club", desc: "Do 100 or more reps in a single set", tier: 3 }
  ];
  const ratioTxt = x => (Math.round(x * 100) / 100).toString() + "×";
  function extraBadges(a) {
    const list = S(a).slice().sort((x, y) => sessTime(x) - sessTime(y)), bodies = (a.body || []).filter(b => b.bw > 0).sort((x, y) => String(x.date).localeCompare(String(y.date)));
    const bwAt = ds => { let v = 0; for (const b of bodies) { if (b.date <= ds) v = b.bw; else break; } if (!v && bodies.length) v = bodies[0].bw; return v ? (unitKg() ? v * LB : v) : 0; };
    const best = {}; LIFTS.forEach(l => { best[l.key] = 0; });
    const when = {}, M = { total: 0, bwbench: 0, bwsquat: 0, bwdead: 0, bwohp: 0 }, sec = {}, secWhen = {};
    const days = new Map(), perDay = {}; let prevT = 0;
    const mark = (k, ds) => { if (!sec[k]) { sec[k] = 1; secWhen[k] = ds; } };
    list.forEach(s => {
      const t = sessTime(s), ds = s.date, hr = new Date(t - (s.dur || 0) * 1000).getHours(), d = new Date(t);
      const m = bestE1(a, s); Object.keys(m).forEach(n => LIFTS.forEach(l => { if (l.re.test(n)) best[l.key] = Math.max(best[l.key], toLb(m[n], s.unit)); }));
      M.total = best.bench + best.squat + best.dead;
      const bw = bwAt(ds); MS.forEach(se => { if (se.lift) M[se.key] = bw ? best[se.lift] / bw : 0; });
      MS.forEach(se => se.steps.forEach(st => { const id = se.key + st; if (when[id] === undefined && M[se.key] >= st) when[id] = ds; }));
      if (s.dur && (hr >= 22 || hr < 4)) mark("night", ds);
      if (s.dur && (hr === 4 || hr === 5)) mark("dawn", ds);
      if (prevT && t - prevT >= 30 * DAY) mark("comeback", ds);
      prevT = t;
      const md = d.getMonth() * 100 + d.getDate(); if ([1225, 101, 1231, 704].includes(md)) mark("holiday", ds);
      perDay[ds] = (perDay[ds] || 0) + 1; if (perDay[ds] >= 2) mark("double", ds);
      if ((s.dur || 0) >= 7200) mark("marathon", ds);
      if ((s.sets || 0) >= 8 && s.dur > 0 && s.dur <= 1500) mark("quick", ds);
      const wk = mondayOf(t); if (!days.has(wk)) days.set(wk, new Set()); days.get(wk).add(ds); if (days.get(wk).size >= 7) mark("seven", ds);
      (s.ex || []).forEach(e => (e.sets || []).forEach(st => { if ((parseFloat(st.r) || 0) >= 100) mark("hundred", ds); }));
    });
    const curBw = bwAt("9999-12-31"), out = [];
    MS.forEach(se => {
      const n = se.steps.length, cur = se.key === "total" ? M.total : (curBw ? best[se.lift] / curBw : 0);
      se.steps.forEach((st, i) => {
        const id = se.key + st, tier = K().tierOf(i, n);
        out.push({
          id, cat: "milestones", series: se.key, step: i, steps: n, tier, icon: se.icon,
          name: se.key === "total" ? se.names[i] : `${se.label} ${ratioTxt(st)} bodyweight`,
          desc: se.key === "total" ? `Add up your best bench, squat and deadlift (estimated 1RM) to reach ${K().lbl(st, true)}` : `Reach an estimated one-rep max of ${ratioTxt(st)} your bodyweight on ${se.label.toLowerCase()}${curBw ? "" : ". Log your body weight to track it"}`,
          got: cur >= st, cur, goal: st, date: when[id] || "", lb: se.key === "total", fmtCur: se.key === "total" ? undefined : v => ratioTxt(v)
        });
      });
    });
    SECRETS.forEach(x => out.push({ id: "sx_" + x.k, cat: "secret", secret: true, series: "sx_" + x.k, step: 0, steps: 1, tier: x.tier, icon: x.icon, name: x.name, desc: x.desc, got: !!sec[x.k], cur: sec[x.k] ? 1 : 0, goal: 1, date: secWhen[x.k] || "" }));
    return out;
  }
  const baseBadges = PT.badges;
  PT.badges = function (a) {
    const out = baseBadges.apply(this, arguments);
    try { return out.concat(extraBadges(a || A())); } catch (e) { console.error("PulseTrack extra badges", e); return out; }
  };

  /* ============================================================== confetti + share cards */
  PT.confetti = function (n) {
    try {
      if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const box = document.createElement("div"); box.className = "pt-conf"; box.setAttribute("aria-hidden", "true");
      const sty = (A() && A().settings.fxStyle) || "classic", EM = { fire: "🔥", bolt: "⚡", stars: "⭐" }[sty];
      const cols = sty === "gold" ? ["#fde68a", "#fbbf24", "#f59e0b", "#d97706", "#fff7ed"] : sty === "fire" ? ["#fb923c", "#f97316", "#ef4444", "#fbbf24"] : ["#fbbf24", "#34d399", "#60a5fa", "#f472b6", "#a78bfa", "#fb923c"];
      for (let i = 0; i < (n || 60); i++) {
        const p = document.createElement("i"), em = EM && i % 2 === 0;
        p.style.cssText = `left:${Math.random() * 100}%;${em ? "font-style:normal;font-size:" + (14 + Math.random() * 10).toFixed(0) + "px;background:none" : "background:" + cols[i % cols.length] + ";width:" + (5 + Math.random() * 5) + "px;height:" + (8 + Math.random() * 7) + "px"};--x:${(Math.random() * 160 - 80).toFixed(0)}px;--r:${(Math.random() * 720 - 360).toFixed(0)}deg;animation-delay:${(Math.random() * .5).toFixed(2)}s;animation-duration:${(1.8 + Math.random() * 1.4).toFixed(2)}s`;
        if (em) p.textContent = EM;
        box.appendChild(p);
      }
      document.body.appendChild(box); setTimeout(() => box.remove(), 3600);
    } catch (e) { }
  };
  /** a picture to send to the group chat. o = { icon, kicker, title, sub, lines:[[label,value]], c:[a,b] } */
  PT.shareCard = async function (o) {
    const a = A();
    try {
      const W = 1080, H = 1350, cv = document.createElement("canvas"); cv.width = W; cv.height = H; const g = cv.getContext("2d"), acc = PT.accent();
      const c = o.c || ["#fde68a", "#d97706"], font = (w, s) => `${w} ${s}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;
      const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, "#1c1c20"); bg.addColorStop(1, "#09090b"); g.fillStyle = bg; g.fillRect(0, 0, W, H);
      const glow = g.createRadialGradient(W / 2, 430, 20, W / 2, 430, 520); glow.addColorStop(0, c[c.length - 1]); glow.addColorStop(1, "rgba(0,0,0,0)"); g.globalAlpha = 0.4; g.fillStyle = glow; g.fillRect(0, 0, W, 960); g.globalAlpha = 1;
      g.fillStyle = acc; g.fillRect(0, 0, W, 14);
      g.fillStyle = acc; g.font = font(900, 44); g.textAlign = "left"; g.fillText("PULSETRACK", 80, 120);
      g.textAlign = "center";
      const ring = g.createLinearGradient(W / 2 - 230, 200, W / 2 + 230, 660); c.forEach((x, i) => ring.addColorStop(c.length === 1 ? 0 : i / (c.length - 1), x));
      g.lineWidth = 18; g.strokeStyle = ring; g.beginPath(); g.arc(W / 2, 430, 230, 0, Math.PI * 2); g.stroke();
      g.fillStyle = "#18181b"; g.beginPath(); g.arc(W / 2, 430, 212, 0, Math.PI * 2); g.fill();
      g.font = font(400, 250); g.fillStyle = "#fff"; g.fillText(o.icon || "🏅", W / 2, 520);
      g.fillStyle = c[0]; g.font = font(800, 34); g.fillText(String(o.kicker || "").toUpperCase(), W / 2, 760);
      g.fillStyle = "#fff"; let sz = 88; g.font = font(900, sz); while (g.measureText(o.title || "").width > 920 && sz > 40) { sz -= 4; g.font = font(900, sz); } g.fillText(o.title || "", W / 2, 860);
      g.fillStyle = "#a1a1aa"; g.font = font(600, 34);
      const words = String(o.sub || "").split(" "); let line = "", y = 920; words.forEach(w => { const t = line ? line + " " + w : w; if (g.measureText(t).width > 880 && line) { g.fillText(line, W / 2, y); y += 46; line = w; } else line = t; }); if (line) g.fillText(line, W / 2, y);
      g.textAlign = "left"; y = Math.max(y + 70, 1040);
      (o.lines || []).slice(0, 3).forEach(([k, v]) => { g.fillStyle = "#71717a"; g.font = font(800, 30); g.fillText(String(k).toUpperCase(), 120, y); g.fillStyle = "#fff"; g.font = font(900, 40); g.textAlign = "right"; g.fillText(String(v), W - 120, y); g.textAlign = "left"; y += 70; });
      g.fillStyle = "#52525b"; g.font = font(600, 26); g.fillText((a.settings.myName ? a.settings.myName + " · " : "") + "Tracked with PulseTrack", 80, H - 60);
      const blob = await new Promise((res, rej) => cv.toBlob(b => b ? res(b) : rej(new Error("toBlob")), "image/png"));
      await a.shareFile(new File([blob], `pulsetrack-${String(o.title || "card").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30)}.png`, { type: "image/png" }), o.title || "PulseTrack");
    } catch (e) { console.error("share card", e); a.toast("Could not create the picture"); }
  };

  /* ============================================================== small pieces of UI */
  let uid = 0;
  const allFrames = a => FRAMES.concat((PT.extraFrames && PT.extraFrames(a)) || []);
  const frameOf = a => allFrames(a).find(f => f.id === a.settings.frame) || FRAMES[0];
  const unlockedFrame = (a, f) => (f.have !== undefined ? !!f.have : state(a).lv.L >= f.lvl);
  const frameReq = f => f.req || "Lv " + f.lvl;
  function frameRing(a, st, px, frame) {
    const f = frame || (unlockedFrame(a, frameOf(a)) ? frameOf(a) : FRAMES[0]), id = "pt-lr" + (++uid), C = 2 * Math.PI * 44;
    return `<svg viewBox="0 0 100 100" width="${px}" height="${px}" role="img" aria-label="Level ${st.lv.L}"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">${f.c.map((x, i) => `<stop offset="${f.c.length === 1 ? 0 : i / (f.c.length - 1)}" stop-color="${x}"/>`).join("")}</linearGradient></defs>
      <circle cx="50" cy="50" r="44" fill="rgb(var(--z950))" stroke="rgb(var(--z800))" stroke-width="7"/>
      <circle cx="50" cy="50" r="44" fill="none" stroke="url(#${id})" stroke-width="7" stroke-linecap="round" stroke-dasharray="${(C * st.lv.pct).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 50 50)"/>
      <text x="50" y="45" text-anchor="middle" font-size="11" font-weight="800" fill="rgb(var(--z400))" letter-spacing="1">LEVEL</text>
      <text x="50" y="70" text-anchor="middle" font-size="30" font-weight="900" fill="#fff">${st.lv.L}</text></svg>`;
  }
  function weekRing(k, goal, px) {
    const C = 2 * Math.PI * 44, hit = k >= goal, pct = Math.min(1, k / goal);
    return `<svg viewBox="0 0 100 100" width="${px}" height="${px}" role="img" aria-label="${k} of ${goal} days this week"><circle cx="50" cy="50" r="44" fill="none" stroke="rgb(var(--z800))" stroke-width="9"/>
      <circle cx="50" cy="50" r="44" fill="none" stroke="${hit ? "#fbbf24" : "rgb(var(--a500))"}" stroke-width="9" stroke-linecap="round" stroke-dasharray="${(C * pct).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 50 50)"/>
      <text x="50" y="${hit ? 60 : 58}" text-anchor="middle" font-size="${hit ? 34 : 30}" font-weight="900" fill="${hit ? "#fbbf24" : "#fff"}">${hit ? "✓" : k + "/" + goal}</text></svg>`;
  }
  const bar = p => `<div class="pt-bar"><span style="width:${Math.round(Math.max(0, Math.min(1, p)) * 100)}%"></span></div>`;

  const css = document.createElement("style"); css.id = "pt-v231-css";
  css.textContent = `
    #pt-you-card { display: flex; align-items: center; gap: .75rem; width: 100%; text-align: left; }
    #pt-you-card .pt-you-mid { flex: 1 1 auto; min-width: 0; }
    #pt-you-card .pt-bar { height: .35rem; margin-top: .3rem; }
    .pt-you-r { display: flex; flex-direction: column; align-items: flex-end; gap: .05rem; flex: 0 0 auto; }
    .pt-conf { position: fixed; inset: 0; z-index: 95; pointer-events: none; overflow: hidden; }
    .pt-conf i { position: absolute; top: -20px; border-radius: 2px; opacity: 0; animation: pt-conf 2.4s ease-in forwards; }
    @keyframes pt-conf { 0% { transform: translate(0, 0) rotate(0); opacity: 1; } 100% { transform: translate(var(--x), 105vh) rotate(var(--r)); opacity: .9; } }
    .pt-lvhead { display: flex; align-items: center; gap: 1rem; }
    .pt-frames { display: flex; flex-wrap: wrap; gap: .4rem; }
    .pt-frame { display: inline-flex; align-items: center; gap: .35rem; padding: .35rem .6rem; border-radius: .7rem; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); font-size: .7rem; font-weight: 700; color: rgb(var(--z200)); }
    .pt-frame i { width: .75rem; height: .75rem; border-radius: 50%; display: inline-block; }
    .pt-frame[aria-pressed=true] { border-color: rgb(var(--a500)); color: #fff; }
    .pt-frame.lock { opacity: .5; }
    .pt-qrow { display: flex; flex-direction: column; gap: .3rem; padding: .6rem .7rem; border-radius: .8rem; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); }
    .pt-qrow.done { border-color: rgb(52 211 153 / .5); }
    .pt-wks { display: flex; gap: .3rem; justify-content: space-between; }
    .pt-wks svg { flex: 1 1 0; min-width: 0; max-width: 1.7rem; height: auto; }
    .pt-rk { display: flex; align-items: center; gap: .7rem; padding: .6rem .7rem; border-radius: .8rem; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); }
    .pt-rk .pt-rn { font-size: .72rem; font-weight: 900; }
    .pt-tiles { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .5rem; }
    .pt-tile { padding: .65rem .75rem; border-radius: .85rem; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); min-width: 0; }
    .pt-tile b { display: block; font-size: 1.15rem; font-weight: 900; color: #fff; line-height: 1.15; overflow-wrap: anywhere; }
    .pt-tile span { display: block; font-size: .62rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: rgb(var(--z500)); margin-top: .15rem; }
    .pt-h2h { display: flex; flex-direction: column; gap: .4rem; padding-bottom: .5rem; border-bottom: 1px solid rgb(var(--z800)); }
    @media (prefers-reduced-motion: reduce) { .pt-conf { display: none; } }
  `;
  document.head.appendChild(css);

  /* ============================================================== Home: one compact card */
  function homeCard(a) {
    const home = $("view-home"); if (!home) return;
    let box = $("pt-home-extra");
    if (!box) { box = document.createElement("div"); box.id = "pt-home-extra"; home.insertBefore(box, home.firstChild); }
    const st = state(a), sk = st.streak, qs = questList(a), qd = qs.filter(q => q.done).length;
    let c = $("pt-you-card");
    if (!c) { c = document.createElement("button"); c.type = "button"; c.id = "pt-you-card"; c.className = card + " tap-active !space-y-0 !p-2.5"; box.insertBefore(c, box.firstChild); }
    const crown = PT.familyWon && PT.familyWon(a) ? " · 👑" : "";
    c.setAttribute("aria-label", `Level ${st.lv.L}, ${st.title}. ${sk.k} of ${sk.goal} days this week. Open rewards.`);
    c.innerHTML = `${weekRing(sk.k, sk.goal, 40)}<span class="pt-you-mid"><span class="flex items-baseline justify-between gap-2"><span class="text-xs font-black text-white truncate">Level ${st.lv.L} · ${esc(st.title)}${crown}</span><span class="shrink-0 text-[10px] text-zinc-400">${fmt(st.lv.into)}/${fmt(st.lv.span)} XP</span></span>${bar(st.lv.pct)}</span>
      <span class="pt-you-r"><span class="text-xs font-black ${sk.cur ? "text-amber-300" : "text-zinc-500"}">🔥 ${sk.cur}${sk.bank ? ' <span class="text-sky-300">❄️' + sk.bank + "</span>" : ""}</span><span class="text-[10px] text-zinc-400">Quests ${qd}/${qs.length}</span></span>`;
  }
  const oHome = proto.renderHomeView;
  proto.renderHomeView = function () {
    const r = oHome.apply(this, arguments);
    try { if (!window.app) window.app = this; homeCard(this); } catch (e) { console.error("PulseTrack home card 2.31", e); }
    return r;
  };

  /* ============================================================== Progress: rewards sections */
  const OPEN = { lvl: true };
  const section = (id, icon, title, body) => `<details class="pt-pg" id="pt-pg-${id}" ${OPEN[id] ? "open" : ""}><summary><span class="text-xs font-bold text-white">${icon} ${title}</span><span class="pt-chev">›</span></summary><div>${body}</div></details>`;

  function levelHtml(a) {
    const st = state(a), nt = nextTitle(st.lv.L), f = frameOf(a), p = st.parts;
    const frames = allFrames(a).map(x => { const ok = unlockedFrame(a, x); return `<button type="button" class="pt-frame tap-active ${ok ? "" : "lock"}" data-frame="${x.id}" aria-pressed="${f.id === x.id && ok}"><i style="background:linear-gradient(135deg,${x.c.join(",")})"></i>${esc(x.name)}${ok ? "" : " · " + esc(frameReq(x))}</button>`; }).join("");
    return `<div class="pt-lvhead">${frameRing(a, st, 96)}<div class="min-w-0 flex-1"><span class="block text-base font-black text-white">${esc(st.title)}</span><span class="block text-[11px] text-zinc-400">${fmt(st.xp)} XP total</span>
      <div class="mt-1.5">${bar(st.lv.pct)}</div><span class="block text-[11px] text-zinc-300 mt-1">${fmt(st.lv.nxt - st.xp)} XP to level ${st.lv.L + 1}${nt ? ` · ${esc(nt[1])} at level ${nt[0]}` : ""}</span></div></div>
      <p class="text-[11px] text-zinc-400 leading-snug">XP: ${fmt(p.workouts)} workouts · ${fmt(p.sets)} sets · ${fmt(p.prs)} records · ${fmt(p.weeks)} goal weeks · ${fmt(p.badges)} badges · ${fmt(p.quests)} quests${p.volume ? " · " + fmt(p.volume) + " weight" : ""}.</p>
      <div><span class="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Profile frame</span><div class="pt-frames">${frames}</div></div>
      <div><button type="button" class="pt-b" id="pt-share-lvl">Share my level</button></div>`;
  }
  function goalHtml(a) {
    const st = state(a), sk = st.streak, now = mondayOf(Date.now());
    let mini = ""; for (let i = 11; i >= 0; i--) {
      const t = i === 0 ? now : (() => { let x = now; for (let j = 0; j < i; j++) x = prevMon(x); return x; })(), o = st.W.get(t), k = o ? o.days.size : 0, g = goalFor(a, t), hit = k >= g, frozen = sk.frozen.includes(t);
      const C = 2 * Math.PI * 14, pc = Math.min(1, k / g);
      mini += `<svg viewBox="0 0 36 36" role="img" aria-label="${esc(dsOf(t))}: ${k} of ${g}${frozen ? ", freeze used" : ""}"><title>${esc(PT.fmtDate(dsOf(t), { month: "short", day: "numeric" }))}: ${k}/${g}${frozen ? " (freeze)" : ""}</title><circle cx="18" cy="18" r="14" fill="${hit ? "#fbbf2433" : "none"}" stroke="rgb(var(--z800))" stroke-width="5"/>
        <circle cx="18" cy="18" r="14" fill="none" stroke="${hit ? "#fbbf24" : frozen ? "#7dd3fc" : "rgb(var(--a500))"}" stroke-width="5" stroke-linecap="round" stroke-dasharray="${frozen ? C.toFixed(1) : (C * pc).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 18 18)"/></svg>`;
    }
    return `<div class="flex items-center gap-4">${weekRing(sk.k, sk.goal, 88)}<div class="min-w-0 flex-1"><span class="block text-sm font-black text-white">${sk.hitNow ? "Weekly goal hit 🎉" : `${sk.goal - sk.k} more day${sk.goal - sk.k === 1 ? "" : "s"} to hit your goal`}</span>
      <span class="block text-[11px] text-zinc-300 mt-0.5">🔥 ${sk.cur} week${sk.cur === 1 ? "" : "s"} in a row · best ${sk.best}</span><span class="block text-[11px] text-sky-300">❄️ ${sk.bank} freeze${sk.bank === 1 ? "" : "s"} saved</span></div></div>
      <div><span class="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Days per week</span><div class="flex flex-wrap gap-1.5">${[1, 2, 3, 4, 5, 6, 7].map(n => chip(`data-wg="${n}"`, String(n), sk.goal === n)).join("")}</div></div>
      <div><span class="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Last 12 weeks</span><div class="pt-wks">${mini}</div></div>
      <p class="text-[11px] text-zinc-400 leading-snug">Hit your goal every week to grow the streak. You earn a freeze each month (up to 2) and one is used automatically if you miss a week, so a sick week does not end it.</p>`;
  }
  function questsHtml(a) {
    const qs = questList(a), done = qs.filter(q => q.done).length, left = Math.max(1, Math.ceil((nextMon(mondayOf(Date.now())) - Date.now()) / DAY));
    return `<p class="text-[11px] text-zinc-400">${done} of ${qs.length} done · new quests in ${left} day${left === 1 ? "" : "s"} · ${QUEST_XP} XP each</p>` + qs.map(q => {
      const pc = Math.min(1, q.cur / q.goal), txt = q.fmtGoal ? `${q.fmtCur} of more than ${q.fmtGoal}` : `${fmt(q.cur)} of ${fmt(q.goal)}`;
      return `<div class="pt-qrow ${q.done ? "done" : ""}"><div class="flex items-center justify-between gap-2"><span class="text-xs font-bold text-white min-w-0">${q.done ? "✅ " : "🎯 "}${esc(q.text)}</span><span class="shrink-0 text-[10px] font-bold ${q.done ? "text-emerald-400" : "text-zinc-500"}">+${q.xp} XP</span></div>${bar(pc)}<span class="block text-[10px] text-zinc-400">${q.done ? "Complete" : txt}</span></div>`;
    }).join("");
  }
  function ranksHtml(a) {
    const rk = PT.liftRanks(a), bw = rk[0].bw, u = unitKg() ? "kg" : "lb", sex = SEX_OF(a) === "female";
    const head = `<div class="flex flex-wrap items-center gap-1.5">${chip('data-rsex="m"', "Men's standards", !sex)}${chip('data-rsex="w"', "Women's standards", sex)}</div>
      <div class="flex items-center justify-between gap-2 text-[11px] text-zinc-400"><span>${bw ? "Body weight " + V(bw) + ((a.body || []).some(b => b.bw > 0) ? " (from your log)" : "") : "Needs your body weight to rank you"}</span><button type="button" class="pt-b" id="pt-rank-bw">${bw ? "Change" : "Set body weight"}</button></div>`;
    if (!bw) return head;
    return head + rk.map(r => {
      const col = RANK_COL[r.idx], pc = r.next ? (r.e1 - r.base) / Math.max(1, r.target - r.base) : 1;
      return `<div class="pt-rk"><span class="text-2xl">${r.icon}</span><div class="min-w-0 flex-1"><div class="flex items-center justify-between gap-2"><span class="text-xs font-bold text-white truncate">${esc(r.label)}</span><span class="pt-rn" style="color:${col}">${r.e1 ? esc(r.rank) : "No data"}</span></div>
        ${r.e1 ? bar(pc) : ""}<span class="block text-[10px] text-zinc-400 mt-0.5">${r.e1 ? `${V(r.e1)} est. 1RM · ${r.ratio.toFixed(2)}× bodyweight` : "Log it to get ranked"}${r.next && r.e1 ? ` · ${V(r.toNext)} to ${esc(r.next)}` : r.e1 ? " · top rank" : ""}</span></div></div>`;
    }).join("") + `<div><button type="button" class="pt-b" id="pt-share-rank">Share my ranks</button></div><p class="text-[10px] text-zinc-500">Same StrengthLevel.com standards for your body weight as the Strength level card above, so the targets match. Estimated 1RM, not a tested max.</p>`;
  }

  /* year in review */
  function recap(a, year) {
    const ss = S(a).filter(s => String(s.date).slice(0, 4) === String(year)); if (!ss.length) return null;
    const o = { year, k: ss.length, hours: 0, vol: 0, sets: 0, reps: 0, prs: 0, ex: {}, months: Array(12).fill(0), dow: Array(7).fill(0), days: new Set() };
    const before = {}; S(a).forEach(s => { if (String(s.date).slice(0, 4) < String(year)) { const m = bestE1(a, s); Object.keys(m).forEach(n => { before[n] = Math.max(before[n] || 0, toLb(m[n], s.unit)); }); } });
    const top = {};
    ss.forEach(s => {
      o.hours += (s.dur || 0) / 3600; o.vol += toLb(s.vol || 0, s.unit); o.sets += s.sets || 0; o.prs += (s.prs || []).length; o.days.add(s.date);
      const d = PT.fromDs(s.date); o.months[d.getMonth()]++; o.dow[d.getDay()]++;
      (s.ex || []).forEach(e => { const n = (e.sets || []).filter(x => x.t !== "W"); o.ex[e.name] = (o.ex[e.name] || 0) + n.length; n.forEach(x => { o.reps += parseFloat(x.r) || 0; }); });
      const m = bestE1(a, s); Object.keys(m).forEach(n => { top[n] = Math.max(top[n] || 0, toLb(m[n], s.unit)); });
    });
    const fav = Object.keys(o.ex).sort((x, y) => o.ex[y] - o.ex[x])[0];
    let big = null; Object.keys(top).forEach(n => { if (before[n] > 0 && top[n] > before[n]) { const g = top[n] - before[n]; if (!big || g > big.g) big = { n, g, to: top[n] }; } });
    if (!big) { const n = Object.keys(top).sort((x, y) => top[y] - top[x])[0]; if (n) big = { n, g: 0, to: top[n] }; }
    const MON = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], DOWN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const mx = arr => arr.indexOf(Math.max(...arr));
    let streak = 0, run = 0, lastW = 0; [...new Set(ss.map(s => mondayOf(sessTime(s))))].sort((x, y) => x - y).forEach(w => { run = lastW && Math.round((w - lastW) / (7 * DAY)) === 1 ? run + 1 : 1; lastW = w; streak = Math.max(streak, run); });
    const trucks = o.vol / 5000, badgesYr = PT.badges(a).filter(b => b.got && String(b.date).slice(0, 4) === String(year) && !b.secret).length;
    return Object.assign(o, { fav, favSets: fav ? o.ex[fav] : 0, big, month: MON[mx(o.months)], monthK: Math.max(...o.months), day: DOWN[mx(o.dow)], streak, trucks, badgesYr, nDays: o.days.size });
  }
  function recapHtml(a) {
    const years = [...new Set(S(a).map(s => String(s.date).slice(0, 4)))].sort().reverse();
    if (!years.length) return '<p class="text-xs text-zinc-400">Finish a workout and your year in review shows up here.</p>';
    const y = years.includes(a.__recapYear) ? a.__recapYear : years[0], r = recap(a, y);
    const truck = r.trucks >= 1 ? `That is about ${r.trucks >= 10 ? Math.round(r.trucks) : r.trucks.toFixed(1)} pickup truck${Math.round(r.trucks) === 1 ? "" : "s"} 🛻` : "A solid start. Keep stacking it up";
    return `${years.length > 1 ? `<div class="flex gap-1.5">${years.map(x => chip(`data-ry="${x}"`, x, x === y)).join("")}</div>` : ""}
      <div class="pt-tiles"><div class="pt-tile"><b>${fmt(r.k)}</b><span>Workouts</span></div><div class="pt-tile"><b>${fmt(r.hours)} h</b><span>In the gym</span></div>
      <div class="pt-tile"><b>${V(r.vol)}</b><span>Lifted</span></div><div class="pt-tile"><b>${fmt(r.reps)}</b><span>Reps</span></div>
      <div class="pt-tile"><b>${r.prs}</b><span>Records</span></div><div class="pt-tile"><b>${r.streak} wk</b><span>Longest streak</span></div></div>
      <p class="text-xs text-amber-300 font-bold">${truck}</p>
      <div class="space-y-1 text-xs text-zinc-300">${r.fav ? `<div>⭐ Favorite lift: <b class="text-white">${esc(r.fav)}</b> (${r.favSets} set${r.favSets === 1 ? "" : "s"})</div>` : ""}${r.big ? `<div>🚀 ${r.big.g > 0 ? "Biggest jump" : "Top lift"}: <b class="text-white">${esc(r.big.n)}</b> ${r.big.g > 0 ? "+" + V(r.big.g) + " to " : ""}${V(r.big.to)} est. 1RM</div>` : ""}<div>📅 Busiest month: <b class="text-white">${esc(r.month)}</b> (${r.monthK}) · Favorite day: <b class="text-white">${esc(r.day)}</b></div>${r.badgesYr ? `<div>🏅 Badges earned: <b class="text-white">${r.badgesYr}</b></div>` : ""}</div>
      <div><button type="button" class="pt-b go" id="pt-share-recap">Share my ${esc(y)} recap</button></div>`;
  }

  /* family head to head */
  const famMine = (a, t) => { const w = weeksOf(a).get(mondayOf(t)); return { k: w ? w.k : 0, v: w ? Math.round(w.v) : 0, p: w ? w.p : 0 }; };
  const cmp = (x, y) => y.k - x.k || y.v - x.v || y.p - x.p;
  function famRounds(a) {
    const fam = Array.isArray(a.settings.family) ? a.settings.family : [], me = a.settings.myName || "Me", thisW = dsOf(mondayOf(Date.now()));
    const weeks = [...new Set(fam.map(x => x.w))].filter(w => w < thisW).sort().slice(-8), wins = {}, rows = [];
    weeks.forEach(w => {
      const t = PT.fromDs(w); if (!t) return; const m = famMine(a, t.getTime());
      const parts = fam.filter(x => x.w === w && x.n !== me).map(x => ({ n: x.n, k: x.k, v: x.v, p: x.p })); parts.push({ n: me, k: m.k, v: m.v, p: m.p });
      if (parts.length < 2) return; parts.sort(cmp); if (parts[0].k === 0) return;
      const tie = cmp(parts[0], parts[1]) === 0; if (!tie) wins[parts[0].n] = (wins[parts[0].n] || 0) + 1;
      rows.push({ w, parts, tie });
    });
    return { rows, wins, me };
  }
  /** true when you won last week's family round */
  PT.familyWon = function (appArg) { try { const a = appArg || A(), r = famRounds(a), last = r.rows[r.rows.length - 1]; return !!(last && !last.tie && last.parts[0].n === r.me && last.w === dsOf(prevMon(mondayOf(Date.now())))); } catch (e) { return false; } };
  function h2hHtml(a) {
    const fam = Array.isArray(a.settings.family) ? a.settings.family : []; if (!fam.length) return "";
    const R = famRounds(a), me = R.me, thisW = dsOf(mondayOf(Date.now()));
    const rivals = fam.filter(x => x.w === thisW && x.n !== me).sort(cmp), mine = famMine(a, Date.now());
    let out = "";
    if (rivals.length) {
      const r = rivals[0], row = (lab, x, y, f) => `<div class="flex items-center justify-between text-xs"><span class="w-1/3 font-mono ${x > y ? "text-emerald-400 font-black" : "text-zinc-300"}">${f(x)}</span><span class="text-[10px] uppercase tracking-wider text-zinc-500">${lab}</span><span class="w-1/3 text-right font-mono ${y > x ? "text-emerald-400 font-black" : "text-zinc-300"}">${f(y)}</span></div>`;
      out += `<div class="flex items-center justify-between text-xs font-bold text-white"><span>${esc(me)}</span><span class="text-zinc-500">vs</span><span>${esc(r.n)}</span></div>${row("Workouts", mine.k, r.k, x => String(x))}${row("Volume", mine.v, r.v, x => V(x))}${row("Records", mine.p, r.p, x => String(x))}`;
    }
    const names = Object.keys(R.wins).sort((x, y) => R.wins[y] - R.wins[x]);
    if (names.length) out += `<div class="flex flex-wrap gap-1.5">${names.map(n => `<span class="pt-frame">👑 ${esc(n)} <b class="text-white">${R.wins[n]}</b></span>`).join("")}</div>`;
    R.rows.slice(-4).reverse().forEach(x => { out += `<div class="text-[11px] text-zinc-400">${esc(PT.fmtDate(x.w, { month: "short", day: "numeric" }))} · ${x.tie ? "Tie" : "👑 <b class='text-zinc-200'>" + esc(x.parts[0].n) + "</b> (" + x.parts[0].k + ")"} vs ${esc(x.parts.slice(1).map(p => p.n + " " + p.k).join(", "))}</div>`; });
    return out ? `<div class="pt-h2h"><span class="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Head to head</span>${out}</div>` : "";
  }
  // a code now carries this week and the 3 before it, so weekly winners can be worked out
  const baseCode = PT.familyCode;
  if (baseCode) PT.familyCode = (a, weekT) => [0, 1, 2, 3].map(i => baseCode(a, (weekT || Date.now()) - i * 7 * DAY)).join("\n");

  function drawRew(a) {
    const root = $("progress-body"); if (!root) return;
    let box = $("pt-pg-rew");
    if (!box) { box = document.createElement("div"); box.id = "pt-pg-rew"; box.className = "space-y-3"; const ex = $("pt-pg-extra"); if (ex && ex.parentNode === root) root.insertBefore(box, ex); else root.appendChild(box); }
    const st = state(a);
    box.innerHTML = section("lvl", "⚡", `Level ${st.lv.L} · ${esc(st.title)}`, levelHtml(a)) + section("wk", "🔥", "Weekly goal & streak", goalHtml(a)) + section("qst", "🎯", "Weekly quests", questsHtml(a))
      + section("rank", "🏆", "Lift ranks", ranksHtml(a)) + section("recap", "🎬", "Year in review", recapHtml(a));
    box.querySelectorAll("details").forEach(d => d.addEventListener("toggle", () => { OPEN[d.id.replace("pt-pg-", "")] = d.open; }));
    const fam = document.querySelector("#pt-pg-fam > div"); if (fam && !fam.querySelector(".pt-h2h")) { const h = h2hHtml(a); if (h) fam.insertAdjacentHTML("afterbegin", h); }
  }
  const oPV = proto.renderProgressView;
  proto.renderProgressView = function () {
    const r = oPV.apply(this, arguments);
    try { drawRew(this); } catch (e) { console.error("PulseTrack rewards 2.31", e); }
    return r;
  };

  /* ============================================================== after a workout: XP, quests, level ups, ranks, streaks */
  function ringBig(a, st, frame) { return `<div style="width:170px;height:170px">${frameRing(a, st, 170, frame)}</div>`; }
  function afterFinish(a) {
    const s = a.lastSummary && a.lastSummary.session; if (!s) return;
    const q = syncQuests(a), st = state(a, true), sk = st.streak, items = [], stt = a.settings;
    // XP line on the finish screen
    const t = $("btn-summary-template");
    if (t && t.parentElement) {
      let l = $("pt-xp-line"); if (!l) { l = document.createElement("div"); l.id = "pt-xp-line"; l.className = "text-center text-xs font-bold text-amber-300"; t.parentElement.insertBefore(l, t.parentElement.firstChild); }
      l.textContent = `+${sessionXp(s) + q.length * QUEST_XP} XP · Level ${st.lv.L} · ${sk.k}/${sk.goal} days this week`;
    }
    // quests
    if (q.length) a.toast(q.length === 1 ? `Quest done: ${q[0].text} (+${QUEST_XP} XP)` : `${q.length} quests done (+${q.length * QUEST_XP} XP)`);
    // level up
    if (stt.lvlSeen === undefined) stt.lvlSeen = st.lv.L - 1;
    if (st.lv.L > stt.lvlSeen) {
      const nf = FRAMES.find(f => f.lvl > stt.lvlSeen && f.lvl <= st.lv.L), nt = TITLES.find(x => x[0] > stt.lvlSeen && x[0] <= st.lv.L);
      items.push({ custom: true, label: "Level up", name: `Level ${st.lv.L}`, desc: `${st.title}${nt ? ". New title unlocked" : ""}${nf ? `. New profile frame: ${nf.name}` : ""}`, big: ringBig(a, Object.assign({}, st, { lv: Object.assign({}, st.lv, { pct: 1 }) }), nf || (unlockedFrame(a, frameOf(a)) ? frameOf(a) : FRAMES[0])), glow: "rgb(251 191 36 / .6)", a: "#fde68a", b: "#d97706", confetti: true,
        share: { icon: "⚡", kicker: "Level up", title: `Level ${st.lv.L}`, sub: st.title, lines: [["Total XP", fmt(st.xp)], ["Workouts", String(S(a).length)]], c: ["#fde68a", "#d97706"] } });
      stt.lvlSeen = st.lv.L;
    }
    // rank ups
    const rk = PT.liftRanks(a), seen = stt.rankSeen && typeof stt.rankSeen === "object" ? stt.rankSeen : null, up = [];
    /* 2.53.0 changed the standards, so the first workout after the update only re-records where everyone stands (no rank-up pop-ups for a change in the yardstick) */
    if (rk[0].bw) { if (stt.rankStd === 2 && seen) rk.forEach(r => { if (seen[r.key] !== undefined && r.idx > seen[r.key] && r.idx >= 1) up.push(r); }); stt.rankStd = 2; stt.rankSeen = rk.reduce((o, r) => (o[r.key] = r.idx, o), {}); }
    up.slice(0, 2).forEach(r => items.push({ custom: true, label: "Rank up", name: `${r.label}: ${r.rank}`, desc: `${V(r.e1)} est. 1RM · ${r.ratio.toFixed(2)}× bodyweight`, big: `<div class="pt-rkbig" style="font-size:96px;line-height:1">${r.icon}</div>`, glow: RANK_COL[r.idx] + "99", a: RANK_COL[r.idx], b: "#52525b", confetti: true,
      share: { icon: r.icon, kicker: "Rank up", title: `${r.label}: ${r.rank}`, sub: `${V(r.e1)} estimated 1RM, ${r.ratio.toFixed(2)}× bodyweight`, lines: [["Lift", r.label], ["Rank", r.rank]], c: [RANK_COL[r.idx], "#52525b"] } }));
    // weekly goal
    const wk = dsOf(mondayOf(Date.now()));
    if (sk.hitNow && stt.goalHitWk !== wk) {
      stt.goalHitWk = wk;
      items.push({ custom: true, label: "Weekly goal", name: "Goal hit! 🎉", desc: `${sk.k} days this week${sk.cur > 1 ? ` · ${sk.cur} weeks in a row` : ""}`, big: `<div style="width:150px;height:150px">${weekRing(sk.goal, sk.goal, 150)}</div>`, glow: "rgb(251 191 36 / .6)", a: "#fde68a", b: "#d97706", confetti: true,
        share: { icon: "🔥", kicker: "Weekly goal hit", title: `${sk.cur} week streak`, sub: `${sk.k} workout days this week`, lines: [["Streak", sk.cur + " weeks"], ["Best", sk.best + " weeks"]], c: ["#fde68a", "#d97706"] } });
    }
    // streak milestones
    const MIL = [4, 8, 12, 26, 52], hit = MIL.filter(m => sk.cur >= m).pop() || 0;
    if (stt.streakSeen === undefined) stt.streakSeen = 0;
    if (hit > stt.streakSeen) {
      stt.streakSeen = hit;
      items.push({ custom: true, label: "Streak", name: `${hit} weeks in a row`, desc: hit >= 26 ? "That is real dedication." : "Keep the chain going.", big: `<div style="font-size:96px;line-height:1">🔥</div>`, glow: "rgb(251 146 60 / .6)", a: "#fdba74", b: "#ea580c", confetti: true,
        share: { icon: "🔥", kicker: "Streak", title: `${hit} weeks in a row`, sub: "Hitting my weekly goal", lines: [["Best", sk.best + " weeks"]], c: ["#fdba74", "#ea580c"] } });
    } else if (sk.cur < stt.streakSeen) stt.streakSeen = MIL.filter(m => sk.cur >= m).pop() || 0;
    save();
    if (items.length && PT.showBadgeUnlock) setTimeout(() => PT.showBadgeUnlock(items), 1400);
  }
  const oFin = proto.finishWorkoutV2;
  proto.finishWorkoutV2 = async function () {
    const n0 = (this.sessions || []).length;
    const r = await oFin.apply(this, arguments);
    try { if ((this.sessions || []).length > n0) afterFinish(this); } catch (e) { console.error("PulseTrack rewards finish 2.31", e); }
    return r;
  };

  /* first run after the update: remember where everything stands so nothing pops up for old progress */
  function initSeen(a) {
    const st = state(a, true), s = a.settings; let ch = false;
    if (s.lvlSeen === undefined) { s.lvlSeen = st.lv.L; ch = true; }
    if (s.streakSeen === undefined) { s.streakSeen = [4, 8, 12, 26, 52].filter(m => st.streak.cur >= m).pop() || 0; ch = true; }
    if (s.goalHitWk === undefined) { s.goalHitWk = st.streak.hitNow ? dsOf(mondayOf(Date.now())) : ""; ch = true; }
    /* one switch for Men / Women: anyone who had picked Women's standards in the ranks keeps them on the Strength level card too */
    if (!s.sexUnified) { s.sexUnified = true; if (s.rankSex === "w" && s.strengthSex !== "female") s.strengthSex = "female"; ch = true; }
    const rk = PT.liftRanks(a); if ((!s.rankSeen || s.rankStd !== 2) && rk[0].bw) { s.rankSeen = rk.reduce((o, r) => (o[r.key] = r.idx, o), {}); s.rankStd = 2; ch = true; }
    if (ch) save();
    syncQuests(a);
  }

  /* ============================================================== clicks */
  document.addEventListener("click", async e => {
    const a = A(); if (!a || !e.target.closest) return;
    const t = id => e.target.closest("#" + id), on = sel => e.target.closest(sel);
    if (t("pt-you-card")) { OPEN.lvl = true; OPEN.wk = true; a.showView("progress"); setTimeout(() => { const d = $("pt-pg-lvl"); if (d && d.scrollIntoView) d.scrollIntoView({ block: "start" }); }, 150); return; }
    const wg = on("[data-wg]"); if (wg) { PT.setWeekGoal(wg.dataset.wg, a); memo = null; a.renderProgressView(); try { a.renderHomeView(); } catch (x) { } return; }
    const fr = on("[data-frame]"); if (fr) { const f = allFrames(a).find(x => x.id === fr.dataset.frame); if (f && unlockedFrame(a, f)) { a.settings.frame = f.id; save(); a.renderProgressView(); try { a.renderHomeView(); } catch (x) { } } else if (f) a.toast(`Unlocks: ${frameReq(f)}`); return; }
    const ry = on("[data-ry]"); if (ry) { a.__recapYear = ry.dataset.ry; OPEN.recap = true; a.renderProgressView(); return; }
    const rs = on("[data-rsex]"); if (rs) { a.settings.strengthSex = rs.dataset.rsex === "w" ? "female" : "male"; a.settings.rankSex = rs.dataset.rsex; save(); OPEN.rank = true; a.renderProgressView(); return; }
    if (t("pt-rank-bw")) {
      const v = parseFloat(await PT.prompt(`Your body weight (${unitKg() ? "kg" : "lb"})?`, "", { type: "number", title: "Body weight", ok: "Save" }));
      if (v > 0) { a.settings.rankBw = unitKg() ? v * LB : v; save(); memo = null; OPEN.rank = true; a.renderProgressView(); }
      return;
    }
    const sb = on("[data-share-badge]");
    if (sb) { const b = PT.badges(a).find(x => x.id === sb.dataset.shareBadge); if (!b) return; const tr = K().TIERS[b.tier]; PT.shareCard({ icon: b.icon, kicker: `${tr.name} badge`, title: b.name, sub: b.desc, lines: b.date ? [["Earned", PT.fmtDate(b.date, { month: "short", day: "numeric", year: "numeric" })]] : [], c: [tr.a, tr.b] }); return; }
    if (on("[data-share-card]")) { const b = PT.__unlockCur; if (b && b.share) PT.shareCard(b.share); return; }
    if (t("pt-share-lvl")) { const st = state(a), f = unlockedFrame(a, frameOf(a)) ? frameOf(a) : FRAMES[0]; PT.shareCard({ icon: "⚡", kicker: "My level", title: `Level ${st.lv.L}`, sub: st.title, lines: [["Total XP", fmt(st.xp)], ["Streak", st.streak.cur + " weeks"], ["Workouts", String(S(a).length)]], c: f.c }); return; }
    if (t("pt-share-rank")) { const rk = PT.liftRanks(a); PT.shareCard({ icon: "🏆", kicker: "Strength ranks", title: "My lift ranks", sub: "Estimated 1RM vs bodyweight", lines: rk.slice(0, 3).map(r => [r.label, r.e1 ? r.rank : "-"]), c: ["#fbbf24", "#a855f7"] }); return; }
    if (t("pt-share-recap")) {
      const years = [...new Set(S(a).map(s => String(s.date).slice(0, 4)))].sort().reverse(), y = years.includes(a.__recapYear) ? a.__recapYear : years[0], r = recap(a, y); if (!r) return;
      PT.shareCard({ icon: "🎬", kicker: `${y} in review`, title: `${r.k} workouts`, sub: `${V(r.vol)} lifted${r.fav ? " · favorite lift: " + r.fav : ""}`, lines: [["Hours", fmt(r.hours)], ["Records", String(r.prs)], ["Best streak", r.streak + " weeks"]], c: ["#fde68a", "#d97706"] }); return;
    }
  });

  setTimeout(() => { try { initSeen(A()); } catch (e) { console.error("PulseTrack rewards init", e); } }, 2200);
})();
  