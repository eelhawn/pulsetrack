
/* =====================================================================
 * PulseTrack 2.35.0: what to do with your strength levels.
 *  - Closest to leveling up: the exercises nearest their next level, tap one to plan it.
 *  - Goal planner: pick a level to reach, see the gap, a rough date and week-by-week targets.
 *  - Weak points: your muscle groups ranked by strength level, and what to add for the weakest.
 *  - Level-ups: after a workout, any exercise that reached a new level is called out.
 *  - Level badges: Intermediate, Advanced and Elite counts, All-Rounder and No Weak Link.
 * Everything is worked out on the phone from the levels in m55a.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined" || !PT.lvKit || !PT.exLevels) return;
  const proto = ApplicationUI.prototype;
  const K = PT.lvKit;
  const A = () => window.app;
  const $ = id => document.getElementById(id);
  const esc = s => PT.esc(s);
  const DAY = 86400000, LB = 2.2046226;
  const save = () => { try { WorkoutStorage.saveSettings(A().settings); } catch (e) { } };
  const card = "bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3";
  const hasBw = a => K.bwOf(a) > 0;

  /* ---------------------------------------------------------------- how far to the next level */
  function toGo(a, st, d) {
    const u = K.unitOfStd(st);
    if (u === "reps") { const n = Math.max(1, Math.ceil(d - 1e-6)); return n + (n === 1 ? " rep" : " reps"); }
    if (u === "sec") return Math.max(1, Math.ceil(d - 1e-6)) + " s";
    const g = K.fromLb(a, d), lab = a.wLabel();
    if (g < 1) return (Math.max(0.1, Math.round(g * 10) / 10)) + " " + lab;
    const n = Math.round(g); return K.num(n) + " " + (n === 1 && lab === "lbs" ? "lb" : lab);
  }
  /** "now" and "needed" as text; when they would round to the same number, show one decimal so the gap makes sense */
  function pair(a, st, v, need) {
    const x = K.fmtV(a, st, v), y = K.fmtV(a, st, need);
    if (x !== y || K.unitOfStd(st) !== "lb") return [x, y];
    const d = n => (Math.round(K.fromLb(a, n) * 10) / 10).toLocaleString(undefined, { maximumFractionDigits: 1 }) + " " + a.wLabel();
    return [d(v), d(need)];
  }
  function nextUps(a, n) {
    return PT.exLevels(a).filter(r => r.lv && r.lv.next).sort((x, y) => (1 - x.lv.frac) - (1 - y.lv.frac) || y.ts - x.ts).slice(0, n || 5);
  }
  function nextCardHtml(a) {
    let html = `<h3 class="text-xs font-bold text-white">Closest to leveling up</h3>`;
    if (!hasBw(a)) return html + `<p class="text-xs text-zinc-400">Log your body weight and this shows which exercises are about to level up.</p>`;
    const rows = nextUps(a, 5);
    if (!rows.length) return html + `<p class="text-xs text-zinc-400">Log some sets and the exercises closest to their next level show up here.</p>`;
    html += `<div class="space-y-1.5">${rows.map(r => {
      const c = K.COLS[r.lv.idx + 1], gap = r.th[r.lv.idx + 1] - r.v;
      return `<button type="button" class="pt-lv-row tap-active" data-plan="${esc(r.name)}"><div class="flex items-center justify-between gap-2"><span class="text-xs font-bold text-white truncate">${esc(r.name)}</span><span class="shrink-0 text-[11px] font-black" style="color:${c}">${esc(r.lv.level)} → ${esc(r.lv.nextLevel)}</span></div>${K.bar(r.lv.frac, c)}<span class="block text-[10px] text-zinc-400"><b class="text-zinc-200">${esc(toGo(a, r.st, gap))}</b> to go · ${esc(pair(a, r.st, r.v, r.th[r.lv.idx + 1])[0])} now, ${esc(pair(a, r.st, r.v, r.th[r.lv.idx + 1])[1])} needed${K.isEst(r.st, r.name) ? " · est." : ""}</span></button>`;
    }).join("")}</div><p class="text-[10px] text-zinc-500">Tap one to plan how to get there.</p>`;
    return html;
  }

  /* ---------------------------------------------------------------- goal planner */
  const RATE = [0.02, 0.012, 0.007, 0.004, 0.002];
  /** per-week gain from the last 12 weeks of this exercise, or null when there is not enough to go on */
  function pace(a, name) {
    const since = Date.now() - 84 * DAY, wk = new Map();
    PT.exSeries(a, name).forEach(p => { if (p.t < since) return; const w = Math.floor(p.t / (7 * DAY)); wk.set(w, Math.max(wk.get(w) || 0, p.v)); });
    const pts = [...wk.entries()].sort((x, y) => x[0] - y[0]); if (pts.length < 3) return null;
    const n = pts.length, mx = pts.reduce((t, p) => t + p[0], 0) / n, my = pts.reduce((t, p) => t + p[1], 0) / n, den = pts.reduce((t, p) => t + (p[0] - mx) ** 2, 0);
    if (!den) return null; const slope = pts.reduce((t, p) => t + (p[0] - mx) * (p[1] - my), 0) / den;
    return slope > 0 ? slope : null;
  }
  function plan(a, name, tIdx) {
    const nm = K.canon(name), st = K.std(nm), o = K.bests(a).get(nm); if (!st || !o) return null;
    const sc = K.scored(st, o), th = K.thresholds(sc.st, K.sexOf(a), K.bwOf(a)), lv = K.levelOf(th, sc.v); if (!lv) return null;
    const t = Math.max(lv.idx + 1, Math.min(4, tIdx == null ? lv.idx + 1 : tIdx)); if (lv.idx >= 4) return { nm, st: sc.st, v: sc.v, th, lv, top: true };
    const target = th[t], gap = target - sc.v, u = K.unitOfStd(sc.st);
    const def = u === "reps" || u === "sec" ? Math.max(0.5, sc.v * 0.03) : sc.v * RATE[lv.idx], measured = pace(a, nm);
    const rate = measured && measured > def * 0.4 ? measured : def, weeks = Math.max(1, Math.ceil(gap / rate));
    return { nm, st: sc.st, v: sc.v, th, lv, t, target, gap, rate, weeks, measured: !!(measured && measured > def * 0.4), u };
  }
  function rounded(a, lb) { const step = a.unit() === "kg" ? 2.5 : 5; return Math.round(K.fromLb(a, lb) / step) * step; }
  function milestones(a, p) {
    const n = p.weeks, rows = [], marks = Math.min(6, n);
    for (let i = 1; i <= marks; i++) {
      const w = i === marks ? n : Math.round(n * i / marks), v = Math.min(p.target, p.v + p.rate * w);
      let txt;
      if (p.u === "reps") txt = Math.ceil(v - 1e-6) + " reps";
      else if (p.u === "sec" || p.u === "max") txt = K.fmtV(a, p.st, v);
      else {
        const w5 = v / (1 + 5 / 30) / (p.u === "lb" && PT.slFactor ? PT.slFactor(a, p.nm) : 1), shown = p.u === "add" ? w5 - K.bwOf(a) : w5;
        txt = (p.u === "add" ? (shown < 0 ? "−" : "+") : "") + K.num(Math.abs(rounded(a, shown))) + " " + a.wLabel() + " × 5";
      }
      rows.push(`<div class="pt-lv-t"><span class="text-zinc-400">Week ${w}</span><span class="font-mono text-zinc-100">${esc(txt)}</span></div>`);
    }
    return rows.join("");
  }
  function openPlan(a, name, tIdx) {
    const p = plan(a, name, tIdx); if (!p) { a.toast("Log this exercise first"); return; }
    if (p.top) { a.openSheet(p.nm, "Goal planner", `<p class="text-sm text-zinc-300">You are already at the top level (${esc(p.lv.level)}) here. Nothing left to chase on the chart.</p>`, ""); return; }
    const chips = K.LEVELS.map((L, i) => i > p.lv.idx ? `<button type="button" data-plan-lv="${i}" data-plan="${esc(p.nm)}" aria-pressed="${i === p.t}" class="pt-opt tap-active" style="${i === p.t ? "border-color:" + K.COLS[i] + ";color:" + K.COLS[i] : ""}">${L}</button>` : "").join("");
    const long = p.weeks > 104;
    const date = new Date(Date.now() + p.weeks * 7 * DAY);
    const when = long ? "Over two years at this pace. Pick a nearer level to aim at first." : `About <b class="text-white">${p.weeks} week${p.weeks === 1 ? "" : "s"}</b> (around ${esc(PT.fmtDate(PT.ds(date), { month: "short", day: "numeric", year: "numeric" }))}).`;
    const paceTxt = p.measured ? "Based on how fast you have been improving lately." : "Based on typical progress at your level, since there is not enough history yet.";
    const goalOk = (p.u === "lb") && a.prs && a.prs[p.nm] > 0;
    const body = `<div class="space-y-3"><div class="flex flex-wrap gap-1.5">${chips}</div>
      <div class="grid grid-cols-3 gap-2 text-center"><div class="pt-lv-t flex-col"><span class="text-[10px] text-zinc-500">NOW</span><b class="text-white">${esc(pair(a, p.st, p.v, p.target)[0])}</b></div><div class="pt-lv-t flex-col"><span class="text-[10px] text-zinc-500">${esc(K.LEVELS[p.t]).toUpperCase()}</span><b style="color:${K.COLS[p.t]}">${esc(pair(a, p.st, p.v, p.target)[1])}</b></div><div class="pt-lv-t flex-col"><span class="text-[10px] text-zinc-500">TO GO</span><b class="text-white">${esc(toGo(a, p.st, p.gap))}</b></div></div>
      <p class="text-xs text-zinc-300 leading-relaxed">${when} ${esc(paceTxt)}</p>
      ${long ? "" : `<div class="space-y-1.5"><span class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Targets along the way</span>${milestones(a, p)}</div>
      <p class="text-[10px] text-zinc-500 leading-relaxed">${p.u === "reps" || p.u === "sec" || p.u === "max" ? "Your best single set in that week." : "A good top set that week, shown for five reps. Estimates, not promises: sleep, food and bad weeks all move it."}</p>`}</div>`;
    const footer = `<div class="grid gap-2">${goalOk ? `<button type="button" data-plan-goal="${esc(p.nm)}" data-plan-t="${p.t}" class="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm tap-active">Set as a lift goal</button>` : ""}<button type="button" data-lv-open="${esc(p.nm)}" class="w-full py-3 rounded-xl bg-zinc-800 text-zinc-100 font-bold text-sm tap-active">Open exercise</button></div>`;
    a.openSheet(p.nm, "Goal planner · " + p.lv.level + " → " + K.LEVELS[p.t], body, footer);
  }
  function setGoal(a, name, tIdx) {
    const p = plan(a, name, tIdx); if (!p || !p.target) return;
    const l = Array.isArray(a.settings.liftGoals) ? a.settings.liftGoals : [];
    const target = Math.ceil(K.fromLb(a, p.target / (PT.slFactor ? PT.slFactor(a, p.nm) : 1)));
    if (l.some(g => g.name === p.nm)) { l.forEach(g => { if (g.name === p.nm) g.target = target; }); } else l.push({ name: p.nm, target });
    a.settings.liftGoals = l; save(); try { a.closeSheet(); } catch (e) { }
    a.toast(`Goal set: ${p.nm} to ${target} ${a.wLabel()} (${K.LEVELS[p.t]})`); try { a.renderProgressView(); } catch (e) { }
  }

  /* ---------------------------------------------------------------- weak points */
  const TRY = {
    Chest: ["Incline Dumbbell Press", "Dumbbell Bench Press", "Barbell Incline Press", "Dips", "Push-Ups"],
    Back: ["Barbell Bent-Over Rows", "Lat Pulldown", "Seated Cable Row", "Pull-Ups", "Chin-Ups"],
    Shoulders: ["Overhead Press", "Dumbbell Shoulder Press", "Arnold Press", "Machine Shoulder Press"],
    Arms: ["Barbell Curl", "Close-Grip Bench Press", "Triceps Pushdown", "Dumbbell Curl", "Skull Crushers"],
    Legs: ["Barbell Back Squat", "Romanian Deadlift", "Leg Press", "Walking Lunges", "Bulgarian Split Squat"],
    Core: ["Hanging Leg Raises", "Cable Crunch", "Ab Wheel Rollouts", "Plank", "Sit-Ups"]
  };
  function groupScores(a) {
    const rows = PT.exLevels(a), by = {};
    rows.forEach(r => { if (r.group === "Other" || !r.lv) return; (by[r.group] = by[r.group] || []).push({ s: r.lv.idx + r.lv.frac * 0.999, name: r.name }); });
    const list = K.GROUPS.map(g => {
      const xs = (by[g] || []).sort((x, y) => y.s - x.s), top = xs.slice(0, 3);
      return { g, n: xs.length, score: top.length ? top.reduce((t, x) => t + x.s, 0) / top.length : null, names: new Set(xs.map(x => x.name)) };
    });
    const have = list.filter(x => x.score !== null), avg = have.length ? have.reduce((t, x) => t + x.score, 0) / have.length : 0;
    return { list, have, avg };
  }
  PT.weakPoints = a => {
    const gs = groupScores(a); if (gs.have.length < 2) return { ok: false, list: gs.list, have: gs.have.length };
    const sorted = gs.have.slice().sort((x, y) => x.score - y.score), weak = sorted[0], gap = gs.avg - weak.score;
    const untested = gs.list.filter(x => x.score === null).map(x => x.g);
    return { ok: true, list: gs.list, avg: gs.avg, weak: gap >= 0.5 ? weak : null, gap, untested, best: sorted[sorted.length - 1] };
  };
  function suggestions(a, g, have) {
    const dbs = K.db(), out = [];
    (TRY[g] || []).forEach(n => { const c = dbs.byName.get(n.toLowerCase()); if (c && K.std(c) && !have.has(c) && !out.includes(c)) out.push(c); });
    return out.slice(0, 3);
  }
  function weakCardHtml(a) {
    let html = `<h3 class="text-xs font-bold text-white">Weak points</h3>`;
    if (!hasBw(a)) return html + `<p class="text-xs text-zinc-400">Log your body weight and this compares your muscle groups by strength level.</p>`;
    const w = PT.weakPoints(a);
    if (!w.ok) return html + `<p class="text-xs text-zinc-400">Log exercises for at least two muscle groups (say chest and legs) and this shows which one is behind.</p>`;
    const rows = w.list.map(x => {
      if (x.score === null) return `<div class="flex items-center gap-2 text-[11px]"><span class="w-20 shrink-0 font-bold text-zinc-400">${x.g}</span><span class="flex-1 text-zinc-500">nothing logged yet</span></div>`;
      const i = Math.min(4, Math.floor(x.score)), c = K.COLS[i], isW = w.weak && w.weak.g === x.g;
      return `<div class="space-y-1"><div class="flex items-center justify-between text-[11px]"><span class="font-bold ${isW ? "text-amber-300" : "text-zinc-100"}">${x.g}${isW ? " · behind" : ""}</span><span class="font-black" style="color:${c}">${K.LEVELS[i]}</span></div>${K.bar(x.score / 5, isW ? "#f59e0b" : c)}</div>`;
    }).join("");
    html += `<div class="space-y-2.5">${rows}</div>`;
    if (w.weak) {
      const sug = suggestions(a, w.weak.g, w.weak.names), names = w.weak.g.toLowerCase();
      html += `<div class="rounded-xl border border-amber-800/50 bg-amber-950/30 p-3 space-y-2"><p class="text-xs text-amber-200 leading-snug"><b>${w.weak.g}</b> is about ${w.gap.toFixed(1)} levels behind your average. Bringing it up balances your strength and usually helps your other lifts.</p>${sug.length ? `<p class="text-[11px] text-zinc-400">Try adding:</p><div class="flex flex-wrap gap-1.5">${sug.map(n => `<button type="button" data-lv-open="${esc(n)}" class="pt-opt tap-active">${esc(n)}</button>`).join("")}</div>` : `<p class="text-[11px] text-zinc-400">Two or three more ${esc(names)} sets each week would help.</p>`}</div>`;
    } else html += `<p class="text-xs text-emerald-300">No clear weak link. Your muscle groups are within half a level of each other.</p>`;
    if (w.untested.length) html += `<p class="text-[11px] text-zinc-500">Not graded yet: ${esc(w.untested.join(", "))}.</p>`;
    html += `<p class="text-[10px] text-zinc-500 leading-relaxed">Each bar is the average of your three best graded exercises for that group. Estimates for most lifts.</p>`;
    return html;
  }

  /* ---------------------------------------------------------------- level-ups after a workout */
  function baseline(a) {
    if (!a.settings.lvSeen || typeof a.settings.lvSeen !== "object") a.settings.lvSeen = {};
    const seen = a.settings.lvSeen; let changed = false;
    PT.exLevels(a).forEach(r => { if (seen[r.name] === undefined) { seen[r.name] = r.lv.idx; changed = true; } });
    if (changed) save();
  }
  function levelUps(a) {
    baseline0(a);
    const seen = a.settings.lvSeen, ups = []; let changed = false;
    PT.exLevels(a).forEach(r => {
      const prev = seen[r.name];
      if (prev === undefined) { seen[r.name] = r.lv.idx; changed = true; return; }
      if (r.lv.idx > prev) { ups.push({ name: r.name, from: prev, to: r.lv.idx }); seen[r.name] = r.lv.idx; changed = true; }
    });
    if (changed) save();
    return ups;
  }
  const baseline0 = a => { if (!a.settings.lvSeen || typeof a.settings.lvSeen !== "object") { a.settings.lvSeen = {}; } };
  function summaryBlock(a, ups) {
    const t = $("btn-summary-template"); if (!t || !t.parentElement) return;
    let b = $("pt-lvup"); if (b) b.remove(); if (!ups.length) return;
    b = document.createElement("div"); b.id = "pt-lvup";
    b.innerHTML = `<span class="pt-lvup-h">⬆ Level up${ups.length === 1 ? "" : "s"}</span>${ups.slice(0, 5).map(u => `<span class="pt-lvup-r"><b>${esc(u.name)}</b><span style="color:${K.COLS[u.to]}">${K.LEVELS[u.from]} → ${K.LEVELS[u.to]}</span></span>`).join("")}${ups.length > 5 ? `<span class="pt-lvup-r">and ${ups.length - 5} more</span>` : ""}`;
    t.parentElement.insertBefore(b, t.parentElement.firstChild);
  }
  const oFin = proto.finishWorkoutV2;
  if (typeof oFin === "function") proto.finishWorkoutV2 = async function () {
    const r = await oFin.apply(this, arguments);
    try { const ups = levelUps(this); this.lastLevelUps = ups; summaryBlock(this, ups); if (ups.length && PT.confetti) PT.confetti(40); } catch (e) { console.error("PulseTrack level-ups", e); }
    return r;
  };
  const oHome = proto.renderHomeView;
  if (typeof oHome === "function") proto.renderHomeView = function () {
    const r = oHome.apply(this, arguments);
    try { if (hasBw(this) && !(this.settings.lvSeen && Object.keys(this.settings.lvSeen).length)) baseline(this); } catch (e) { }
    return r;
  };

  /* ---------------------------------------------------------------- level badges */
  const basePB = PT.badges;
  /** when each graded exercise first reached level k (ms), oldest first, for exercises that are at level k or better today */
  function reachTimes(a, rows, k) {
    const out = [];
    rows.forEach(r => {
      if (r.lv.idx < k) return;
      let t = 0; try { const hit = PT.exSeries(a, r.name).find(p => p.v >= r.th[k]); t = hit ? hit.t : 0; } catch (e) { }
      out.push({ name: r.name, group: r.group, t: t || r.ts || 0 });
    });
    return out.sort((x, y) => x.t - y.t);
  }
  const dsOfT = t => (t > 0 ? PT.ds(new Date(t)) : "");
  /** the day a "first seen" badge was noticed, kept in settings so it does not move */
  function stamp(a, id, got) {
    const st = a.settings || (a.settings = {}), m = st.lvBadgeWhen || (st.lvBadgeWhen = {});
    if (got && !m[id]) { m[id] = PT.ds(); try { WorkoutStorage.saveSettings(st); } catch (e) { } }
    return got ? m[id] || "" : "";
  }
  PT.badges = function (a) {
    const out = basePB.apply(this, arguments);
    try {
      a = a || A(); const T = PT.badgeKit.tierOf, rows = PT.exLevels(a), cnt = k => rows.filter(r => r.lv.idx >= k).length, memo = {};
      const reach = k => memo[k] || (memo[k] = reachTimes(a, rows, k));
      const series = (key, icon, k, steps, names, word) => steps.forEach((st, i, l) => { const got = cnt(k) >= st; out.push({ id: key + st, cat: "strength", series: key, step: i, steps: l.length, tier: T(i, l.length), icon, name: names[i], desc: `Reach ${word} on ${st} exercise${st === 1 ? "" : "s"}`, got, cur: cnt(k), goal: st, date: got ? dsOfT((reach(k)[st - 1] || {}).t) : "" }); });
      series("lvint", "🟢", 2, [1, 5, 10, 20], ["First Intermediate", "Five Intermediates", "Ten Intermediates", "Twenty Intermediates"], "Intermediate or better");
      series("lvadv", "🟣", 3, [1, 3, 6, 10], ["Advanced Lifter", "Triple Advanced", "Six Advanced", "Ten Advanced"], "Advanced or better");
      series("lvelite", "👑", 4, [1, 2, 3, 5], ["Elite Lift", "Double Elite", "Triple Elite", "Elite Five"], "Elite");
      const gs = groupScores(a), have = gs.list.filter(x => x.score !== null), all6 = have.length === 6;
      const roundGot = all6 && have.every(x => x.score >= 1);
      let roundDate = "";
      if (roundGot) {   // the day the last of the six groups got its first Novice lift
        const first = {}; reach(1).forEach(x => { if (!(x.group in first) || x.t < first[x.group]) first[x.group] = x.t; });
        const ts = Object.keys(first).map(g => first[g]); roundDate = ts.length >= 6 ? dsOfT(Math.max(...ts)) : stamp(a, "lvround", true);
      }
      out.push({ id: "lvround", cat: "strength", icon: "🧩", tier: 1, name: "All-Rounder", desc: "Have a graded exercise at Novice or better in all six muscle groups", got: roundGot, cur: have.filter(x => x.score >= 1).length, goal: 6, date: roundDate });
      const mn = have.length ? Math.min(...have.map(x => x.score)) : 0, mx = have.length ? Math.max(...have.map(x => x.score)) : 0;
      const nwGot = all6 && mn >= 2 && mx - mn <= 0.75;
      out.push({ id: "lvnoweak", cat: "strength", icon: "⚖️", tier: 2, name: "No Weak Link", desc: "All six muscle groups at Intermediate or better, within 0.75 of a level of each other", got: nwGot, cur: have.filter(x => x.score >= 2).length, goal: 6, date: stamp(a, "lvnoweak", nwGot) });
    } catch (e) { console.error("PulseTrack level badges", e); }
    return out;
  };

  /* ---------------------------------------------------------------- put the cards on the Strength tab */
  const oPV = proto.renderProgressView;
  proto.renderProgressView = function () {
    const r = oPV.apply(this, arguments);
    try {
      const root = $("progress-body"); if (!root) return r;
      const panel = root.querySelector('[data-ptab="strength"]') || root, anchor = panel.querySelector("#strength-card");
      [["pt-next-card", nextCardHtml], ["pt-weak-card", weakCardHtml]].forEach(([id, fn]) => {
        const old = $(id); if (old) old.remove();
        const c = document.createElement("div"); c.id = id; c.className = card; c.innerHTML = fn(this);
        if (anchor) anchor.insertAdjacentElement("afterend", c); else panel.appendChild(c);
      });
    } catch (e) { console.error("PulseTrack strength tools", e); }
    return r;
  };
  document.addEventListener("click", e => {
    const a = A(); if (!a || !e.target.closest) return;
    const pg = e.target.closest("[data-plan-goal]"); if (pg) { setGoal(a, pg.dataset.planGoal, parseInt(pg.dataset.planT, 10)); return; }
    const pl = e.target.closest("[data-plan-lv]"); if (pl) { openPlan(a, pl.dataset.plan, parseInt(pl.dataset.planLv, 10)); return; }
    const p = e.target.closest("[data-plan]"); if (p) openPlan(a, p.dataset.plan);
  });
  PT.planLevel = (name, idx) => { const a = A(); return plan(a, name, idx); };
  PT.levelUps = levelUps;

  const css = document.createElement("style"); css.id = "pt-v235-lv-css";
  css.textContent = `
    #pt-lvup { display: flex; flex-direction: column; gap: .3rem; margin: 0 0 .6rem; padding: .7rem .85rem; border-radius: .9rem; background: rgb(var(--a600) / .12); border: 1px solid rgb(var(--a500) / .5); }
    .pt-lvup-h { font-size: .65rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: rgb(var(--a300)); }
    .pt-lvup-r { display: flex; justify-content: space-between; gap: .5rem; font-size: .8rem; color: rgb(var(--z100)); }
    .pt-lvup-r b { font-weight: 800; color: #fff; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .pt-lvup-r > span { font-weight: 800; flex: none; }
  `;
  document.head.appendChild(css);
})();
  