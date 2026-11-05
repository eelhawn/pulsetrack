
/* =====================================================================
 * PulseTrack 2.19.0 (part 3): Build me a workout. 2.21.0: a different mix every time (weighted draw, steers away from what it
 *  gave you last time and what you did lately), lock / swap / remove / add per exercise, and more options (variety, equipment,
 *  number of exercises, supersets, core finisher, endurance goal, more muscle groups and times).
 *  Pick what to train (or let it pick the freshest muscles), how long you have and a goal. It builds a session from the
 *  exercise library using: the muscle of every exercise, what the active gym can do, your recovery map (heavy work days
 *  included), what you have actually done before, and a time budget. No account, no AI, works offline.
 *  The result starts as a normal Freestyle workout, so Swap, add, delete and Share day all work on it.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined" || typeof EXERCISE_DATABASE === "undefined" || typeof PTSIM === "undefined") return;
  const proto = ApplicationUI.prototype;
  const A = () => window.app;
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const DAY = 86400000;

  const REGIONS = [
    { id: "chest", label: "Chest", size: 1, cap: 4, lead: true },
    { id: "back", label: "Back", size: 1, cap: 4, lead: true },
    { id: "shoulders", label: "Shoulders", size: 0.75, cap: 3, lead: true },
    { id: "biceps", label: "Biceps", size: 0.5, cap: 3 },
    { id: "triceps", label: "Triceps", size: 0.5, cap: 3 },
    { id: "quads", label: "Quads", size: 1, cap: 3, lead: true },
    { id: "hamstrings", label: "Hamstrings", size: 0.8, cap: 3, lead: true },
    { id: "glutes", label: "Glutes", size: 0.8, cap: 3, lead: true },
    { id: "calves", label: "Calves", size: 0.4, cap: 2 },
    { id: "abs", label: "Abs & core", size: 0.5, cap: 2 },
    { id: "traps", label: "Traps", size: 0.4, cap: 2 },
    { id: "forearms", label: "Forearms", size: 0.4, cap: 2 },
    { id: "lowerback", label: "Lower back", size: 0.4, cap: 2 }
  ];
  const RMAP = {}; REGIONS.forEach(r => { RMAP[r.id] = r; });
  const PRESETS = [
    { id: "auto", label: "Pick for me" },
    { id: "push", label: "Push", r: ["chest", "shoulders", "triceps"] },
    { id: "pull", label: "Pull", r: ["back", "biceps", "traps"] },
    { id: "legs", label: "Legs", r: ["quads", "hamstrings", "glutes", "calves"] },
    { id: "upper", label: "Upper body", r: ["chest", "back", "shoulders", "biceps", "triceps"] },
    { id: "lower", label: "Lower body", r: ["quads", "hamstrings", "glutes", "calves", "abs"] },
    { id: "full", label: "Full body", r: ["chest", "back", "quads", "hamstrings", "shoulders", "abs"] },
    { id: "chestback", label: "Chest & back", r: ["chest", "back", "biceps", "triceps"] },
    { id: "shoulderarms", label: "Shoulders & arms", r: ["shoulders", "biceps", "triceps", "forearms"] },
    { id: "arms", label: "Arms", r: ["biceps", "triceps", "forearms"] },
    { id: "glutes", label: "Glutes", r: ["glutes", "hamstrings", "quads"] },
    { id: "core", label: "Core", r: ["abs", "lowerback"] }
  ];
  const MINUTES = [15, 20, 30, 45, 60, 75, 90];
  const EXCL = /\b(jump|jumps|plyo|clean|cleans|snatch|jerk|swing|swings|sled|rope|bosu|stability ball|wheel|rollout|rollouts|crawl|crawls|banded|band|isometric|hold|plank|wall sit|stretch|foam|mobility|test|1rm|negative|towel|burpee|walk|carry|carries|adductor|abductor|adduction|abduction|tibialis|neck)\b/i;
  // well-known lifts get a bonus, odd variations a small penalty, so a new user is not handed "Row Curls" on day one
  const STAPLE = /\b(bench press|incline (dumbbell |barbell )?press|chest press|pec deck|chest fly|cable (crossover|fly)|dumbbell fly|pull-?ups?|chin-?ups?|lat pulldown|(barbell|dumbbell|cable|machine|t-bar|seated|bent[- ]over) rows?|seated cable row|shoulder press|overhead press|military press|arnold press|lateral raises?|rear delt (fly|raise)|reverse (pec deck|fly)|face pulls?|(barbell|dumbbell|ez-?bar|cable|preacher|incline|hammer|concentration) curls?|pushdowns?|skull ?crushers?|overhead (triceps |tricep )?extensions?|close-grip bench|squats?|leg press|hack squat|leg extensions?|lunges?|romanian deadlift|rdl|leg curls?|hip thrust|glute bridge|calf raises?|crunch|crunches|leg raises?|shrugs?|wrist curls?|deadlift|dips?|back extensions?)\b/i;
  const ODD = /\b(iso-lateral|single[- ]arm|one[- ]arm|squeeze|rockers?|high pulls?|row curls?|knee tucks?|sit-ups?|nautilus|rotary|reverse[- ]grip|behind[- ]the[- ]neck|landmine|slider|spider|zottman|drag|crush|guillotine|svend|cuban|jefferson|sissy|nordic|pause|tempo|deficit|partial|dead-stop|hatfield|finger|pull-?throughs?|frog|ghr|glute-ham|weighted|assisted)\b/i;
  const EASE_AVOID = /deadlift|good ?morning|bent[- ]?over|barbell row|pendlay|t-bar|back extension|hyperextension|rack pull|farmer|carry|suitcase|shrug/i;
  const COMP = /\b(bench|press|row|pull-?ups?|chin-?ups?|pulldown|pull-?down|squat|squats|deadlift|lunge|lunges|dips?|thrust|good ?morning|step-?ups?|hack|clean)\b/i;
  const ISO = /\b(straight[- ]arm|raise|raises|fly|flye|flyes|flies|extension|extensions|curl|curls|pushdown|push-?down|kickback|kickbacks|shrug|shrugs|crunch|crunches|twist|pullover|pull-?over|face pull|calf|calves|wrist|abduction|adduction|crossover)\b/i;
  const isComp = n => COMP.test(n) && !ISO.test(n);

  function rng(seed) {      // small seeded generator, so Shuffle gives a different but repeatable result
    let a = (seed >>> 0) || 1;
    return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }

  /* ------------------------------------------------------------------ what to train when you say "pick for me" */
  function autoFocus(app) {
    const sessions = app.sessions || [];
    if (!sessions.length) return { id: "full", why: "Full body is a good place to start." };
    let rec = {}, week = {};
    try { rec = PT.recovery(); } catch (e) { rec = {}; }
    try { week = app.regionSetsForMode("this") || {}; } catch (e) { week = {}; }
    const ready = r => (rec[r] ? rec[r].pct : 100);
    const scored = ["push", "pull", "legs"].map(id => {
      const p = PRESETS.find(x => x.id === id);
      const fresh = p.r.reduce((n, r) => n + ready(r), 0) / p.r.length;
      const need = p.r.map(r => { const lo = PT.targetFor ? PT.targetFor(r)[0] : 0; return lo > 0 ? Math.min(1.5, (week[r] || 0) / lo) : null; }).filter(v => v !== null);
      const done = need.length ? need.reduce((n, v) => n + v, 0) / need.length : 0;
      return { id, p, score: fresh - 25 * done };
    }).sort((a, b) => b.score - a.score);
    const top = scored[0], keep = top.p.r.filter(r => ready(r) >= 45), skip = top.p.r.filter(r => ready(r) < 45);
    const regs = keep.length >= 2 ? keep : top.p.r;
    const names = regs.map(r => RMAP[r].label.toLowerCase());
    let why = `${top.p.label} looks best today: ${names.join(", ")} ${names.length > 1 ? "are" : "is"} the most rested.`;
    if (keep.length >= 2 && skip.length) why += ` Leaving out ${skip.map(r => RMAP[r].label.toLowerCase()).join(", ")} (still recovering).`;
    return { id: top.id, regs, why };
  }

  /* ------------------------------------------------------------------ the builder */
  // how adventurous the pick is: "Favourites" leans on lifts you already do, "Mix it up" goes for fresh ones
  const VARIETY = [
    { id: "familiar", label: "Favourites", T: 0.8, top: 6, famW: 1, novel: 0, recW: 0.5, lateW: 0.3 },
    { id: "balanced", label: "Balanced", T: 1.5, top: 9, famW: 0.6, novel: 1, recW: 1, lateW: 0.7 },
    { id: "mix", label: "Mix it up", T: 2.4, top: 14, famW: 0.25, novel: 2.2, recW: 1.4, lateW: 1 }
  ];
  const EQUIP = [
    { id: "any", label: "Anything my gym has" },
    { id: "dumbbell", label: "Dumbbells", eq: ["dumbbell"] },
    { id: "machine", label: "Machines & cables", eq: ["machine", "cable", "smith"] },
    { id: "barbell", label: "Barbell", eq: ["barbell", "ezbar", "trapbar"] },
    { id: "bodyweight", label: "Bodyweight", eq: ["bodyweight"] }
  ];
  const GOALS = [
    { id: "muscle", label: "Build muscle" },
    { id: "strength", label: "Get stronger" },
    { id: "endurance", label: "Tone & endurance" },
    { id: "hyper", label: "Muscle size (volume)" },
    { id: "strend", label: "Strength-endurance" },
    { id: "pump", label: "Pump day" }
  ];
  const COUNTS = [0, 3, 4, 5, 6, 8];       // 0 = work it out from the time
  const ANTAG = { chest: "back", back: "chest", biceps: "triceps", triceps: "biceps", quads: "hamstrings", hamstrings: "quads", shoulders: "back", glutes: "quads", abs: "lowerback", lowerback: "abs" };
  const pickBy = (list, id, dflt) => list.find(x => x.id === id) || list.find(x => x.id === dflt) || list[0];

  function buildPool(app, equip) {
    const out = [], hid = new Set(Array.isArray(app.settings.hiddenEx) ? app.settings.hiddenEx : []);
    EXERCISE_DATABASE.forEach(e => {
      if (!e || !e.name || /^(Cardio|Warm-Up)/i.test(e.category || "") || EXCL.test(e.name) || hid.has(e.name)) return;
      if (PT.gymAllows && !PT.gymAllows(e.name)) return;
      let regs = {}; try { regs = PT.regionsFor(e.name, false) || {}; } catch (x) { regs = {}; }
      const region = Object.keys(regs)[0];
      if (!region || !RMAP[region]) return;
      let info = null; try { info = PTSIM.info(e.name, e.category || "Other"); } catch (x) { info = null; }
      if (info && info.hard) return;
      if (equip && equip.eq && !equip.eq.includes(info ? info.equip : "")) return;
      out.push({ name: e.name, region, fam: info ? info.fam : e.name, equip: info ? info.equip : "", sub: e.muscle || "", comp: isComp(e.name) });
    });
    return out;
  }
  /** how many times each exercise shows up in the last 150 days of saved workouts */
  function history(app) {
    const cut = Date.now() - 150 * DAY, m = new Map();
    (app.sessions || []).forEach(s => {
      const t = s.ts || (PT.fromDs(s.date) ? PT.fromDs(s.date).getTime() : 0);
      if (t < cut) return;
      (s.ex || []).forEach(e => { if (e && e.name) m.set(e.name, (m.get(e.name) || 0) + 1); });
    });
    return m;
  }
  /** exercises from your last three saved workouts: the newest counts most, so a repeat build does not hand them back */
  function lately(app) {
    const m = new Map(), list = (app.sessions || []).slice().sort((a, b) => (b.ts || 0) - (a.ts || 0)).slice(0, 3);
    list.forEach((s, i) => (s.ex || []).forEach(e => { if (e && e.name && !m.has(e.name)) m.set(e.name, 3 - i); }));
    return m;
  }
  /** exercises handed out by the last few builds (and ones you swapped away): the newest build counts most */
  function recentBuilds(app) {
    const m = new Map(), list = Array.isArray(app.settings.buildRecent) ? app.settings.buildRecent : [];
    const w = [4, 2.5, 1.5, 0.8, 0.8, 0.8];
    list.slice().reverse().slice(0, w.length).forEach((names, i) => (Array.isArray(names) ? names : []).forEach(n => { m.set(n, Math.min(6, (m.get(n) || 0) + w[i])); }));
    return m;
  }
  /** remember a build, so the next one (or Shuffle) leans away from it */
  PT.noteBuild = (names, appArg) => {
    const app = appArg || A(); if (!app || !Array.isArray(names) || !names.length) return;
    const list = Array.isArray(app.settings.buildRecent) ? app.settings.buildRecent : [];
    list.push(names.slice(0, 14)); while (list.length > 8) list.shift();
    app.settings.buildRecent = list;
    try { WorkoutStorage.saveSettings(app.settings); } catch (e) { }
  };

  /** How many exercises each muscle gets. */
  function allocate(regs, total, avail) {
    const act = regs.filter(r => avail[r.id] > 0);
    const out = {}; act.forEach(r => { out[r.id] = 0; });
    if (!act.length) return out;
    let left = Math.min(total, act.reduce((n, r) => n + Math.min(r.cap, avail[r.id]), 0));
    const sum = act.reduce((n, r) => n + r.size, 0);
    act.slice().sort((a, b) => b.size - a.size).forEach(r => { if (left > 0) { out[r.id] = 1; left--; } });
    while (left > 0) {
      let best = null, gap = -1e9;
      act.forEach(r => {
        if (out[r.id] === 0 || out[r.id] >= Math.min(r.cap, avail[r.id])) return;
        const g = (r.size / sum) * total - out[r.id];
        if (g > gap) { gap = g; best = r; }
      });
      if (!best) break;
      out[best.id]++; left--;
    }
    return out;
  }

  function scoreOf(c, picks, ctx, wantComp) {
    const V = ctx.v, nComp = picks.filter(p => p.comp).length, hist = ctx.done.get(c.name) || 0;
    let s = Math.min(4, Math.log2(1 + hist) * 1.6) * V.famW;
    if (ctx.fav.has(c.name)) s += 1.5 * V.famW;
    if (!hist && !ODD.test(c.name) && c.name.length <= 38) s += V.novel;      // something you have not done lately is a plus when mixing it up
    if (c.name.length > 38) s -= 1;
    if (STAPLE.test(c.name)) s += 2.5;
    if (ODD.test(c.name)) s -= 3.5;
    if (ctx.ease && /machine|cable|smith|supported/i.test(c.name + " " + c.equip)) s += 1.2;
    if (ctx.goal === "pump" && /machine|cable|smith/i.test(c.name + " " + c.equip)) s += 1.5;
    if (c.comp) s += nComp < wantComp ? 4 : -2; else if (nComp >= wantComp) s += 1;
    if (c.sub && picks.some(p => p.sub === c.sub)) s -= 1.5; else if (c.sub) s += 1.5;
    if (c.equip && picks.some(p => p.equip === c.equip)) s -= 0.6;
    if (picks.some(p => p.fam === c.fam)) s -= 3;       // the same movement twice is a last resort
    s -= (ctx.recent.get(c.name) || 0) * V.recW;
    s -= (ctx.lately.get(c.name) || 0) * V.lateW;
    return s;
  }
  /** every candidate with its score, best first. The same movement twice (two kinds of squat) is only allowed once nothing else is left. */
  function rank(cands, picks, ctx, wantComp) {
    const all = cands.map(c => ({ c, s: scoreOf(c, picks, ctx, wantComp), dup: picks.some(p => p.fam === c.fam) })).sort((a, b) => b.s - a.s);
    const fresh = all.filter(x => !x.dup);
    return fresh.length && !ctx.loose ? fresh : all;      // (2.50.0: with an exact number per muscle a second curl beats a strange one, so the penalty alone decides)
  }
  /** a weighted draw from the best few: good picks are likely, but not the same ones every time */
  function sample(scored, ctx) {
    const top = scored.slice(0, ctx.v.top), m = top[0].s, T = ctx.v.T;
    const w = top.map(x => Math.exp((x.s - m) / T));
    let r = ctx.rnd() * w.reduce((a, b) => a + b, 0);
    for (let i = 0; i < top.length; i++) { r -= w[i]; if (r <= 0) return top[i].c; }
    return top[0].c;
  }
  const candsFor = (region, ctx) => ctx.pool.filter(c => c.region === region && !(ctx.ease && EASE_AVOID.test(c.name)) && !ctx.ban.has(c.name));

  /** `have` are exercises already kept for this muscle (locked); the rest are drawn until there are k */
  function pickRegion(region, k, ctx, have) {
    const R = RMAP[region], picks = (have || []).slice(), cands = candsFor(region, ctx);
    const wantComp = R.lead && ctx.goal !== "pump" ? (k >= 3 ? 2 : 1) : 0;
    while (picks.length < k) {
      const scored = rank(cands.filter(c => !picks.some(p => p.name === c.name)), picks, ctx, wantComp);
      if (!scored.length) break;
      picks.push(sample(scored, ctx));
    }
    return picks;
  }

  function makeCtx(app, opts, heavy) {
    const V = pickBy(VARIETY, opts.variety, "balanced"), eq = pickBy(EQUIP, opts.equip, "any");
    return {
      pool: buildPool(app, eq), done: history(app), lately: lately(app), recent: recentBuilds(app),
      fav: new Set(Array.isArray(app.settings.favEx) ? app.settings.favEx : []),
      goal: pickBy(GOALS, opts.goal, "muscle").id,
      rnd: rng(opts.seed || Math.floor(Math.random() * 4294967296)), ease: !!heavy, v: V, ban: new Set(Array.isArray(opts.avoid) ? opts.avoid : []), loose: !!(opts.perRegion && typeof opts.perRegion === "object")
    };
  }
  function shape(c, region, goal, first) {
    const comp = !!c.comp, bw = !!(PT.isBodyweightEx && PT.isBodyweightEx(c.name));
    let rest = 90; try { rest = A().smartRest(c.name) || 90; } catch (e) { }
    if (goal === "strength" && comp) rest = Math.max(rest, 150);
    if (goal === "endurance") rest = Math.min(rest, 60);
    if (goal === "strend") rest = Math.min(rest, 75);
    if (goal === "pump") rest = Math.min(rest, 45);
    if (goal === "hyper" && comp) rest = Math.max(rest, 120);
    const reps = region === "abs" || region === "calves" ? "12-20"
      : goal === "strength" ? (comp ? "3-6" : "6-10")
      : goal === "endurance" ? (comp ? "12-15" : "15-20")
      : goal === "strend" ? (comp ? "8-12" : "12-15")
      : goal === "hyper" ? (comp ? "6-10" : "8-12")
      : goal === "pump" ? (comp ? "12-15" : "15-20")
      : (comp ? "6-10" : (bw ? "8-12" : "10-15"));
    let sets = comp ? (goal === "strength" || goal === "hyper" ? 4 : 3) : (goal === "hyper" ? 4 : 3);
    if (first && comp && goal !== "endurance" && goal !== "pump") sets++;
    return { name: c.name, sets, reps, restSeconds: rest, restAuto: true, type: "standard", region, comp, fam: c.fam };
  }
  /** minutes for a list: about 40 s a set, plus the rest; a superset skips the rest after its first exercise */
  const sumOf = list => list.reduce((n, e) => n + (e.extra === "cardio" ? (parseInt(e.reps, 10) || 10) : e.extra ? 0.9 : e.sets * ((e.link ? 40 : 40 + e.restSeconds) / 60)), 0);
  PT.buildMinutes = list => Math.round(sumOf(list || []) + 4);

  const LBL = { warm: "Warm-up", cool: "Cool-down", cardio: "Cardio" };
  const regLabel = r => (RMAP[r] ? RMAP[r].label : LBL[r] || r);
  const UPPER = ["chest", "back", "shoulders", "biceps", "triceps", "traps", "forearms"], LOWER = ["quads", "hamstrings", "glutes", "calves", "lowerback"];
  const WARM = { upper: ["Arm Circles", "Band Shoulder Dislocates", "Banded Pull-Aparts", "Scapular Push-Ups", "Thoracic Rotations"], lower: ["Front and Lateral Leg Swings", "Inchworms", "90/90 Hip Switches", "World's Greatest Stretch", "Ankle Mobility Rocks"], any: ["Cat-Cow", "Inchworms", "World's Greatest Stretch"] };
  const COOL = { chest: "Doorway Chest Stretch", back: "Kneeling Lat Stretch", shoulders: "Cross-Body Shoulder Stretch", triceps: "Overhead Triceps Stretch", biceps: "Doorway Chest Stretch", quads: "Standing Quad Stretch", hamstrings: "Hamstring Stretch", glutes: "Pigeon Stretch", calves: "Calf Stretch", abs: "Child's Pose", lowerback: "Knee-to-Chest Stretch", traps: "Cross-Body Shoulder Stretch", forearms: "Cross-Body Shoulder Stretch" };
  const CARDIO = ["Rowing Machine", "Stationary Bike", "Assault Bike / Air Bike", "Elliptical", "Incline Treadmill Walk", "Jump Rope", "Stairmaster", "SkiErg", "Treadmill", "Battle Ropes"];
  const inDb = (() => { let s = null; return n => { if (!s) s = new Set(EXERCISE_DATABASE.map(e => e && e.name)); return s.has(n); }; })();
  const extraItem = (name, kind, reps, rest) => ({ name, sets: 1, reps, restSeconds: rest, restAuto: false, type: "standard", region: kind, extra: kind });
  const shuffle = (a, ctx) => a.map(x => [ctx.rnd(), x]).sort((p, q) => p[0] - q[0]).map(p => p[1]);
  function hiddenSet(app) { return new Set(Array.isArray(app.settings.hiddenEx) ? app.settings.hiddenEx : []); }
  function warmUp(used, ctx, app) {
    const hid = hiddenSet(app), up = used.some(r => UPPER.includes(r)), lo = used.some(r => LOWER.includes(r));
    const take = (list, n) => shuffle(list, ctx).filter(x => inDb(x) && !hid.has(x)).slice(0, n);
    let names = up && lo ? take(WARM.upper, 1).concat(take(WARM.lower, 1)) : up ? take(WARM.upper, 2) : lo ? take(WARM.lower, 2) : take(WARM.any, 2);
    names = names.filter((n, i) => names.indexOf(n) === i);
    return names.map(n => extraItem(n, "warm", "30s", 15));
  }
  function coolDown(used, ctx, app) {
    const hid = hiddenSet(app), names = [];
    used.slice().sort((a, b) => ((RMAP[b] || {}).size || 0) - ((RMAP[a] || {}).size || 0)).forEach(r => { const n = COOL[r]; if (n && inDb(n) && !hid.has(n) && !names.includes(n) && names.length < 3) names.push(n); });
    return names.map(n => extraItem(n, "cool", "30s", 10));
  }
  function pickCardio(mins, ctx, app) {
    const hid = hiddenSet(app);
    const ok = CARDIO.filter(n => inDb(n) && !hid.has(n) && (!PT.gymAllows || PT.gymAllows(n)));
    if (!ok.length) return null;
    const best = ok.map(n => [ctx.rnd() * 2 - (ctx.recent.get(n) || 0) - (ctx.lately.get(n) || 0) * 0.5, n]).sort((a, b) => b[0] - a[0])[0][1];
    return extraItem(best, "cardio", mins + " min", 60);
  }
  /** the muscle with the fewest hard sets for its size over the last four weeks ("" when there is no history) */
  function weakest(app) {
    const cut = Date.now() - 28 * DAY, c = {}, list = ["chest", "back", "shoulders", "quads", "hamstrings", "glutes", "biceps", "triceps", "calves", "abs"];
    list.forEach(r => { c[r] = 0; });
    let any = false;
    (app.sessions || []).forEach(s => {
      const t = s.ts || (PT.fromDs(s.date) ? PT.fromDs(s.date).getTime() : 0); if (t < cut) return;
      (s.ex || []).forEach(e => { let regs = {}; try { regs = PT.regionsFor(e.name, false) || {}; } catch (x) { regs = {}; } const r = Object.keys(regs)[0]; if (r in c) { c[r] += (e.sets || []).filter(st => st && st.t !== "W").length; any = true; } });
    });
    if (!any) return "";
    return list.slice().sort((a, b) => (c[a] / RMAP[a].size) - (c[b] / RMAP[b].size))[0];
  }
  /** a circuit: everything back to back, no rest until the last one, repeated for N rounds */
  function circuitize(list, style, budget, goal) {
    const left = list.slice(), seq = [];
    while (left.length) { const prev = seq[seq.length - 1]; let j = left.findIndex(x => !prev || x.region !== prev.region); if (j < 0) j = 0; seq.push(left.splice(j, 1)[0]); }
    const n = seq.length, rounds = Math.max(2, Math.min(5, Math.floor(budget / (n * 0.75 + 1.5))));
    seq.forEach((e, i) => {
      e.sets = rounds; e.reps = style === "hiit" ? "40s" : (goal === "strength" ? "6-8" : "12-15");
      e.restSeconds = i === n - 1 ? (style === "hiit" ? 60 : 90) : 15; e.restAuto = false;
      if (i < n - 1) e.link = true; else delete e.link;
    });
    return seq;
  }
  PT.hideExercise = (name, appArg) => { const a = appArg || A(); if (!a || !name) return; const l = Array.isArray(a.settings.hiddenEx) ? a.settings.hiddenEx : []; if (!l.includes(name)) l.push(name); a.settings.hiddenEx = l; try { WorkoutStorage.saveSettings(a.settings); } catch (e) { } };
  PT.showExercise = (name, appArg) => { const a = appArg || A(); if (!a) return; a.settings.hiddenEx = (a.settings.hiddenEx || []).filter(n => n !== name); try { WorkoutStorage.saveSettings(a.settings); } catch (e) { } };

  /** put exercises two by two: opposite muscles first (chest and back, biceps and triceps), else the next one along */
  function pairUp(list) {
    const left = list.slice(), out = [];
    while (left.length) {
      const a = left.shift();
      let j = left.findIndex(b => ANTAG[a.region] === b.region);
      if (j < 0) j = left.findIndex(b => b.region !== a.region);
      if (j < 0) j = left.length ? 0 : -1;
      if (j < 0) { out.push(a); break; }
      const b = left.splice(j, 1)[0];
      a.link = true; delete b.link; out.push(a, b);
    }
    return out;
  }

  /** 2.50.0: opposite muscles take turns, one exercise each, and run as supersets (chest and back the way Arnold did it). The longer list starts, so the turns last as long as they can.
   *  keys: which pairs to alternate ("chestback", "bitri", "quadham"), and "abs" to run the abs exercises two by two. true = the three muscle pairs. */
  const ALT_PAIRS = [{ id: "chestback", r: ["chest", "back"] }, { id: "bitri", r: ["biceps", "triceps"] }, { id: "quadham", r: ["quads", "hamstrings"] }];
  PT.altKeys = ["chestback", "bitri", "quadham", "abs"];
  function alternate(list, alt) {
    const keys = alt === true ? ["chestback", "bitri", "quadham"] : (Array.isArray(alt) ? alt : []);
    const by = {}, order = [];
    list.forEach(e => { if (!by[e.region]) { by[e.region] = []; order.push(e.region); } by[e.region].push(e); });
    const done = new Set(), out = [];
    order.forEach(reg => {
      if (done.has(reg)) return;
      done.add(reg);
      const pair = ALT_PAIRS.find(p => keys.includes(p.id) && p.r.includes(reg)), other = pair ? pair.r.find(x => x !== reg) : null;
      if (other && by[other] && !done.has(other)) {
        done.add(other);
        let a = by[reg], b = by[other];
        if (b.length > a.length) { const t = a; a = b; b = t; }
        for (let i = 0; i < a.length; i++) {
          out.push(a[i]);
          if (b[i]) { a[i].link = true; a[i].type = "superset"; b[i].type = "superset"; delete b[i].link; out.push(b[i]); }
        }
      } else {
        const l = by[reg];
        if (reg === "abs" && keys.includes("abs")) for (let i = 0; i + 1 < l.length; i += 2) { l[i].link = true; l[i].type = "superset"; l[i + 1].type = "superset"; delete l[i + 1].link; }
        l.forEach(e => out.push(e));
      }
    });
    return out;
  }

  /**
   * opts: { regions:[ids] | focus:"auto", minutes, goal:"muscle"|"strength"|"endurance", variety:"familiar"|"balanced"|"mix",
   *         equip:"any"|"dumbbell"|"machine"|"barbell"|"bodyweight", count:0|3..8, style:"straight"|"super", core:bool,
   *         keep:[names to hold on to], avoid:[names to leave out], seed,
 *         perRegion:{muscleId: number of exercises} (2.50.0: exactly that many for each muscle, no time budget), alt:bool (with perRegion:
 *         opposite muscles alternate one by one and run as supersets: chest/back, biceps/triceps, quads/hamstrings) }
   * -> { title, items:[{name, sets, reps, restSeconds, restAuto, type, region, comp, link?}], minutes, asked, note, regions, ids, heavy }
   */
  PT.buildWorkout = function (opts, appArg) {
    const app = appArg || A(); opts = opts || {};
    const minutes = MINUTES.includes(opts.minutes) ? opts.minutes : (parseInt(opts.minutes, 10) || 45);
    const goal = pickBy(GOALS, opts.goal, "muscle").id, style = ["super", "circuit", "hiit"].includes(opts.style) ? opts.style : "straight";
    const circ = style === "circuit" || style === "hiit";
    const eq = pickBy(EQUIP, opts.equip, "any"), count = COUNTS.includes(parseInt(opts.count, 10)) ? parseInt(opts.count, 10) : 0;
    const notes = [];
    const exact = opts.perRegion && typeof opts.perRegion === "object" ? opts.perRegion : null;      // 2.50.0: an exact number of exercises per muscle
    let ids = exact ? REGIONS.filter(r => (parseInt(exact[r.id], 10) || 0) > 0).map(r => r.id) : (Array.isArray(opts.regions) ? opts.regions.filter(r => RMAP[r]) : []), title = "Custom workout";
    if (!ids.length) {
      const p = PRESETS.find(x => x.id === opts.focus);
      if (p && p.r) { ids = p.r.slice(); title = p.label; }
      else { const f = autoFocus(app); const pp = PRESETS.find(x => x.id === f.id); ids = (f.regs || pp.r).slice(); title = pp.label; notes.push(f.why); }
    } else {
      const same = PRESETS.find(p => p.r && p.r.length === ids.length && p.r.every(r => ids.includes(r)));
      if (same) title = same.label;
    }
    let weak = exact ? "" : (opts.weak === "auto" ? weakest(app) : (RMAP[opts.weak] ? opts.weak : ""));
    if (weak && !ids.includes(weak)) { ids = ids.concat(weak); if (title !== "Custom workout") title += " + " + RMAP[weak].label.toLowerCase(); }
    if (weak) notes.push(`Extra focus on ${RMAP[weak].label.toLowerCase()}${opts.weak === "auto" ? " (your least-trained muscle lately)" : ""}.`);
    const heavy = !!(PT.opt && PT.opt("workEase") && PT.workHeavyToday && PT.workHeavyToday(app));
    const ctx = makeCtx(app, opts, heavy);
    const cardioMin = [5, 10, 15].includes(parseInt(opts.cardio, 10)) ? parseInt(opts.cardio, 10) : 0;
    const reserve = (opts.core && !ids.includes("abs") ? 3.5 : 0) + (opts.warm ? 2 : 0) + (opts.cool ? 3 : 0) + cardioMin;      // room for the finishers
    const budget = Math.max(12, minutes - 4 - reserve);
    const per = style === "super" ? 4.9 : 6.3;
    let total = count || Math.max(2, Math.min(style === "super" ? 12 : 10, Math.round(budget / per)));
    if (circ && !count) total = Math.max(4, Math.min(8, Math.round(budget / 7)));
    if (heavy && !count && !exact) { total = Math.max(2, total - 1); notes.push("Heavy work day: lighter on back and grip, and one exercise fewer."); }
    const regs = REGIONS.filter(r => ids.includes(r.id)).map(r => r.id === weak ? Object.assign({}, r, { size: r.size * 1.8, cap: r.cap + 1 }) : r);
    const lookup = n => ctx.pool.find(c => c.name === n);
    const kept = (Array.isArray(opts.keep) ? opts.keep : []).map(k => lookup(typeof k === "string" ? k : k && k.name)).filter(c => c && ids.includes(c.region));
    total = Math.max(total, kept.length);
    const avail = {}; regs.forEach(r => { avail[r.id] = candsFor(r.id, ctx).length + kept.filter(c => c.region === r.id).length; });
    let counts;
    if (exact) {
      counts = {};
      regs.forEach(r => {
        const want = Math.max(0, Math.min(10, parseInt(exact[r.id], 10) || 0)), have = avail[r.id] || 0;
        counts[r.id] = Math.min(want, have);
        if (have > 0 && want > have) notes.push(`Only ${have} ${r.label.toLowerCase()} exercise${have === 1 ? "" : "s"} fit${have === 1 ? "s" : ""} ${eq.id === "any" ? "your gym" : "\"" + eq.label.toLowerCase() + "\""}.`);
      });
    } else counts = allocate(regs, total, avail);
    regs.forEach(r => { const k = kept.filter(c => c.region === r.id).length; if (k > (counts[r.id] || 0)) counts[r.id] = k; });
    const none = regs.filter(r => !avail[r.id]).map(r => r.label.toLowerCase());
    if (none.length) notes.push(`Nothing for ${none.join(", ")} fits ${eq.id === "any" ? (PT.gym && PT.gym() ? PT.gym().name : "your gym") + "'s equipment" : "\"" + eq.label.toLowerCase() + "\""}.`);

    let items = [];
    regs.forEach(r => {
      if (!counts[r.id]) return;
      pickRegion(r.id, counts[r.id], ctx, kept.filter(c => c.region === r.id)).forEach((c, i) => items.push({ c, region: r.id, first: i === 0 }));
    });
    // the big lifts first, bigger muscles before smaller ones
    if (exact) {
      // exact plan: one muscle after another (the big ones first, then the small ones), the heaviest lifts first within each
      const rank0 = id => { const k = REGIONS.findIndex(x => x.id === id); return (RMAP[id].lead ? 0 : 100) + k; };
      items = items.map((it, i) => Object.assign(it, { i })).sort((a, b) => (rank0(a.region) - rank0(b.region)) || (b.c.comp - a.c.comp) || (a.i - b.i));
    } else items = items.map((it, i) => Object.assign(it, { i })).sort((a, b) => (b.c.comp - a.c.comp) || (RMAP[b.region].size - RMAP[a.region].size) || (a.i - b.i));
    let out = items.map(it => shape(it.c, it.region, goal, it.first));
    if (exact && opts.alt) out = alternate(out, opts.alt);
    if (style === "super") out = pairUp(out);
    if (circ) out = circuitize(out, style, budget, goal);
    let guard = 60;
    while (!circ && !exact && sum(out) > budget * 1.06 && guard--) {
      const floor = e => (out.length > 2 && e.comp ? 3 : 2);      // trim isolation sets first; with room for more than two lifts, the big ones keep 3
      const t = out.slice().reverse().find(e => e.sets > floor(e));
      if (t) t.sets--; else if (!count && out.length > 2) { const x = out.pop(); if (out.length && out[out.length - 1].link && !x.link) delete out[out.length - 1].link; } else break;
    }
    guard = 60;
    while (!circ && !exact && sum(out) < budget * 0.9 && guard--) {
      const c = out.filter(e => e.sets < (e.comp ? 5 : 4)).sort((a, b) => a.sets - b.sets || out.indexOf(a) - out.indexOf(b))[0];
      if (!c) break; c.sets++;
    }
    const used = new Set(out.map(e => e.region));
    const dropped = regs.filter(r => avail[r.id] > 0 && !used.has(r.id)).map(r => r.label.toLowerCase());
    if (dropped.length) notes.push(`Short on time, so ${dropped.join(", ")} ${dropped.length > 1 ? "are" : "is"} left out.`);
    if (opts.core && !ids.includes("abs")) {
      const a = pickRegion("abs", 1, ctx, [])[0];
      if (a) { const e = shape(a, "abs", goal, false); e.sets = 3; out.push(e); used.add("abs"); notes.push("Core finisher added at the end."); }
      else notes.push("No core exercise fits that equipment, so no finisher.");
    }
    if (cardioMin) { const cx = pickCardio(cardioMin, ctx, app); if (cx) { out.push(cx); notes.push(`${cardioMin} min of ${cx.name.toLowerCase()} to finish.`); } else notes.push("No cardio machine fits your gym, so no cardio finisher."); }
    if (opts.cool) { const c = coolDown(Array.from(used), ctx, app); if (c.length) { c.forEach(x => out.push(x)); notes.push("Cool-down stretches at the end."); } }
    if (opts.warm) { const w = warmUp(Array.from(used), ctx, app); if (w.length) { out.unshift(...w); notes.push("Warm-up first."); } }
    if (count && sum(out) > minutes * 1.15) notes.push(`${out.length} exercises take about ${Math.round(sum(out) + 4)} min. Pick fewer, or more time, to fit ${minutes}.`);
    if (style === "super") notes.push("Supersets: do the linked pair back to back, then rest.");
    if (circ) notes.push(style === "hiit" ? "HIIT circuit: 40 seconds on each, straight into the next, rest after the last one, repeat for the rounds shown." : "Circuit: do every exercise back to back, rest only after the last one, then go again for the rounds shown.");
    const mins = Math.round(sum(out) + 4);
    return { title, items: out, minutes: mins, asked: minutes, style, note: notes.join(" "), regions: regs.filter(r => used.has(r.id)).map(r => r.id), ids: regs.filter(r => avail[r.id] > 0).map(r => r.id), heavy };
    function sum(l) { return sumOf(l); }
  };

  /** swap one exercise for another that trains the same muscle (not one already in the list) */
  PT.buildSwap = function (items, i, opts, appArg) {
    const app = appArg || A(); opts = opts || {};
    const old = items[i]; if (!old) return items;
    const ctx = makeCtx(app, opts, !!(PT.opt && PT.opt("workEase") && PT.workHeavyToday && PT.workHeavyToday(app)));
    items.forEach(e => ctx.ban.add(e.name));
    const others = items.filter((e, k) => k !== i && e.region === old.region).map(e => ctx.pool.find(c => c.name === e.name) || { name: e.name, region: e.region, fam: e.fam || e.name, equip: "", sub: "", comp: !!e.comp });
    const nComp = others.filter(p => p.comp).length;
    const cands = candsFor(old.region, ctx).filter(c => !others.some(p => p.name === c.name));
    const scored = rank(cands, others, ctx, nComp + (old.comp ? 1 : 0));
    if (!scored.length) return null;
    const c = sample(scored, ctx), goal = pickBy(GOALS, opts.goal, "muscle").id;
    const e = shape(c, old.region, goal, false);
    e.sets = old.sets; if (old.link) e.link = true;
    if (opts.style === "circuit" || opts.style === "hiit") { e.reps = old.reps; e.restSeconds = old.restSeconds; e.restAuto = false; }
    const out = items.slice(); out[i] = e;
    return out;
  };
  /** one more exercise, for the muscle that has the fewest compared with its size */
  PT.buildAdd = function (items, ids, opts, appArg) {
    const app = appArg || A(); opts = opts || {};
    const ctx = makeCtx(app, opts, false);
    items.forEach(e => ctx.ban.add(e.name));
    const regs = REGIONS.filter(r => (ids || []).includes(r.id) && candsFor(r.id, ctx).length);
    if (!regs.length) return null;
    const sum = regs.reduce((n, r) => n + r.size, 0), total = items.length + 1;
    let best = null, gap = -1e9;
    regs.forEach(r => {
      const have = items.filter(e => e.region === r.id).length;
      if (have >= r.cap) return;
      const g = (r.size / sum) * total - have;
      if (g > gap) { gap = g; best = r; }
    });
    if (!best) return null;
    const have = items.filter(e => e.region === best.id).map(e => ctx.pool.find(c => c.name === e.name) || { name: e.name, region: e.region, fam: e.fam || e.name, equip: "", sub: "", comp: !!e.comp });
    const c = pickRegion(best.id, have.length + 1, ctx, have).pop();
    if (!c) return null;
    const out = items.slice(); const e = shape(c, best.id, pickBy(GOALS, opts.goal, "muscle").id, false); e.sets = 3;
    let at = out.findIndex(x => x.extra === "cool" || x.extra === "cardio"); if (at < 0) at = out.length;
    if ((opts.style === "circuit" || opts.style === "hiit") && at > 0 && out.slice(0, at).some(x => x.link)) {
      const prev = out[at - 1]; e.sets = prev.sets; e.reps = prev.reps; e.restSeconds = prev.restSeconds; prev.restSeconds = 15; prev.link = true;
    } else if (at > 0 && out[at - 1].link) delete out[at - 1].link;      // an odd one out stays on its own
    out.splice(at, 0, e);
    return out;
  };

  /* ------------------------------------------------------------------ the sheet */
  const DEF = { focus: "auto", regions: [], minutes: 45, goal: "muscle", variety: "mix", equip: "any", count: 0, style: "straight", core: false, weak: "", warm: false, cool: false, cardio: 0 };
  const prefs = a => Object.assign({}, DEF, a.settings.buildPrefs || {});
  function open(app, pre) {
    const K = PT.kit, el = K.sheet("pt-build", 86);
    const st = prefs(app); if (pre) Object.assign(st, pre); let res = null; const locked = new Set(), avoid = [];
    const gym = (PT.gym && PT.gym()) ? PT.gym().name : "your gym";
    const save = () => { app.settings.buildPrefs = { focus: st.focus, regions: st.regions, minutes: st.minutes, goal: st.goal, variety: st.variety, equip: st.equip, count: st.count, style: st.style, core: st.core, weak: st.weak, warm: st.warm, cool: st.cool, cardio: st.cardio }; WorkoutStorage.saveSettings(app.settings); };
    const chip = (attr, label, on) => `<button type="button" ${attr} aria-pressed="${on}" class="pt-opt tap-active">${esc(label)}</button>`;
    const lab = t => `<span class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">${t}</span>`;
    const opts = () => ({ focus: st.focus === "custom" ? "" : st.focus, regions: st.focus === "custom" ? st.regions : [], minutes: st.minutes, goal: st.goal, variety: st.variety, equip: st.equip, count: st.count, style: st.style, core: st.core, weak: st.weak, warm: st.warm, cool: st.cool, cardio: st.cardio, avoid });
    const moreSummary = () => {
      const bits = [];
      if (st.equip !== "any") bits.push(pickBy(EQUIP, st.equip).label);
      if (st.count) bits.push(st.count + " exercises");
      if (st.style === "super") bits.push("supersets");
      if (st.style === "circuit") bits.push("circuit");
      if (st.style === "hiit") bits.push("HIIT");
      if (st.weak) bits.push("focus: " + (st.weak === "auto" ? "weak spot" : RMAP[st.weak].label.toLowerCase()));
      if (st.warm) bits.push("warm-up");
      if (st.core) bits.push("core finisher");
      if (st.cardio) bits.push(st.cardio + " min cardio");
      if (st.cool) bits.push("cool-down");
      return bits.length ? bits.join(" · ") : "Equipment, style, weak spot, warm-up, cardio";
    };
    const drawOptions = () => {
      const heavy = PT.opt("workEase") && PT.workHeavyToday(app);
      const card = K.openSheet(el, `${K.head("Build me a workout", "Pick what to train and how long you have.")}
        <div>${lab("What to train")}
          <div class="flex flex-wrap gap-1.5">${PRESETS.map(p => chip(`data-f="${p.id}"`, p.label, st.focus === p.id)).join("")}</div>
          <span class="text-[11px] text-zinc-500 block mt-2 mb-1.5">Or tap the muscles yourself</span>
          <div class="flex flex-wrap gap-1.5">${REGIONS.map(r => chip(`data-r="${r.id}"`, r.label, st.focus === "custom" && st.regions.includes(r.id))).join("")}</div></div>
        <div>${lab("How long")}<div class="flex flex-wrap gap-1.5">${MINUTES.map(m => chip(`data-m="${m}"`, m + " min", st.minutes === m)).join("")}</div></div>
        <div>${lab("Goal")}<div class="flex flex-wrap gap-1.5">${GOALS.map(g => chip(`data-g="${g.id}"`, g.label, st.goal === g.id)).join("")}</div></div>
        <div>${lab("Variety")}<div class="flex flex-wrap gap-1.5">${VARIETY.map(v => chip(`data-v="${v.id}"`, v.label, st.variety === v.id)).join("")}</div>
          <span class="text-[11px] text-zinc-500 block mt-1.5">${st.variety === "mix" ? "Fresh picks each time, steering away from what it gave you and what you did lately." : st.variety === "familiar" ? "Leans on lifts you already do and the classics." : "A bit of both."}</span></div>
        <details class="pt-sub" ${st.__more ? "open" : ""} id="pt-bd-more"><summary><span class="min-w-0 flex-1 text-xs font-bold text-white">More options</span><span class="pt-sum">${esc(moreSummary())}</span></summary>
          <div class="space-y-3 pt-2">
            <div>${lab("Equipment")}<div class="flex flex-wrap gap-1.5">${EQUIP.map(q => chip(`data-q="${q.id}"`, q.id === "any" ? "My gym" : q.label, st.equip === q.id)).join("")}</div>
              <span class="text-[11px] text-zinc-500 block mt-1.5">${st.equip === "any" ? "Uses what " + esc(gym) + " has." : "Only exercises with that equipment, and still only what " + esc(gym) + " has."}</span></div>
            <div>${lab("Number of exercises")}<div class="flex flex-wrap gap-1.5">${COUNTS.map(n => chip(`data-n="${n}"`, n ? String(n) : "Auto", st.count === n)).join("")}</div></div>
            <div>${lab("Style")}<div class="flex flex-wrap gap-1.5">${chip('data-s="straight"', "Straight sets", st.style === "straight")}${chip('data-s="super"', "Supersets (saves time)", st.style === "super")}${chip('data-s="circuit"', "Circuit", st.style === "circuit")}${chip('data-s="hiit"', "HIIT (timed)", st.style === "hiit")}</div></div>
            <div>${lab("Focus on a weak spot")}<div class="flex flex-wrap gap-1.5">${chip('data-w=""', "None", !st.weak)}${chip('data-w="auto"', "Least trained lately", st.weak === "auto")}${REGIONS.filter(r => !["traps", "forearms", "lowerback"].includes(r.id)).map(r => chip(`data-w="${r.id}"`, r.label, st.weak === r.id)).join("")}</div>
              <span class="text-[11px] text-zinc-500 block mt-1.5">Adds that muscle to the workout and gives it an extra exercise.</span></div>
            <div>${lab("Extras")}<div class="flex flex-wrap gap-1.5">${chip('data-x="warm"', "Warm-up", st.warm)}${chip('data-x="core"', "Core finisher", st.core)}${chip('data-x="cool"', "Cool-down stretches", st.cool)}</div></div>
            <div>${lab("Cardio finisher")}<div class="flex flex-wrap gap-1.5">${[0, 5, 10, 15].map(m => chip(`data-c="${m}"`, m ? m + " min" : "None", st.cardio === m)).join("")}</div></div>
          </div></details>
        ${PT.feelHtml ? PT.feelHtml() : ""}
        ${heavy ? '<p class="text-[11px] leading-relaxed text-amber-300">Heavy work day logged, so it goes easy on back and grip.</p>' : ""}
        <div class="sticky bottom-[calc(-1.25rem-env(safe-area-inset-bottom,0px))] -mx-5 -mb-5 px-5 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] space-y-2 bg-zinc-900 border-t border-zinc-800"><button type="button" id="pt-bd-go" class="w-full py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold tap-active">Build it</button></div>`);
      const more = card.querySelector("#pt-bd-more"); if (more) more.addEventListener("toggle", () => { st.__more = more.open; });
      card.addEventListener("click", ev => {
        const b = ev.target.closest("button"); if (!b) return;
        if (b.dataset.f) { st.focus = b.dataset.f; }
        else if (b.dataset.r) {
          if (st.focus !== "custom") { st.focus = "custom"; st.regions = []; }
          const i = st.regions.indexOf(b.dataset.r); if (i >= 0) st.regions.splice(i, 1); else st.regions.push(b.dataset.r);
          if (!st.regions.length) st.focus = "auto";
        }
        else if (b.dataset.m) st.minutes = parseInt(b.dataset.m, 10);
        else if (b.dataset.g) st.goal = b.dataset.g;
        else if (b.dataset.v) st.variety = b.dataset.v;
        else if (b.dataset.q) st.equip = b.dataset.q;
        else if (b.dataset.n !== undefined) st.count = parseInt(b.dataset.n, 10) || 0;
        else if (b.dataset.s) st.style = b.dataset.s;
        else if (b.dataset.x) st[b.dataset.x] = !st[b.dataset.x];
        else if (b.dataset.w !== undefined) st.weak = b.dataset.w;
        else if (b.dataset.c !== undefined) st.cardio = parseInt(b.dataset.c, 10) || 0;
        else if (b.id === "pt-bd-go") { save(); locked.clear(); avoid.length = 0; build(false); return; }
        else return;
        drawOptions();
      });
    };
    const note = () => { if (res && res.items.length) PT.noteBuild(res.items.map(e => e.name), app); };
    const build = keep => {
      res = PT.buildWorkout(Object.assign(opts(), { keep: keep ? res.items.filter(e => locked.has(e.name)).map(e => e.name) : [] }), app);
      note(); drawResult();
    };
    const drawResult = () => {
      const n = res.items.length, sets = res.items.reduce((t, e) => t + e.sets, 0), mins = PT.buildMinutes(res.items);
      const rows = res.items.map((e, i) => `<div class="flex items-center gap-1.5 rounded-xl border ${locked.has(e.name) ? "border-emerald-700/60" : "border-zinc-800"} bg-zinc-950 pl-1.5 pr-1 py-1.5" data-i="${i}">
          <button type="button" data-lock="${i}" aria-pressed="${locked.has(e.name)}" aria-label="${locked.has(e.name) ? "Unlock" : "Keep"} ${esc(e.name)}" class="w-9 h-9 shrink-0 rounded-lg text-base tap-active ${locked.has(e.name) ? "bg-emerald-950 text-emerald-300" : "bg-zinc-900 text-zinc-500"}">${locked.has(e.name) ? "🔒" : "🔓"}</button>
          <div class="min-w-0 flex-1"><span class="block text-[13px] font-semibold text-zinc-100 leading-snug">${esc(e.name)}</span>
            <small class="block text-[10px] text-zinc-500">${esc(regLabel(e.region))} · ${e.extra === "cardio" ? esc(e.reps) : e.sets + " × " + esc(e.reps)}${e.link ? ` · <span class="text-purple-300">${res.style === "super" ? "superset with next" : "circuit"}</span>` : ""}</small></div>
          ${e.extra ? "" : `<button type="button" data-swap="${i}" aria-label="Swap ${esc(e.name)} for another" class="w-9 h-9 shrink-0 rounded-lg bg-zinc-900 text-zinc-300 text-base tap-active">↻</button>`}
          <button type="button" data-del="${i}" aria-label="Remove ${esc(e.name)}" class="w-9 h-9 shrink-0 rounded-lg bg-zinc-900 text-zinc-500 text-sm tap-active">✕</button></div>`).join("");
      const card = K.openSheet(el, `${K.head(res.title, n ? `${n} exercise${n === 1 ? "" : "s"} · ${sets} set${sets === 1 ? "" : "s"} · about ${mins} min` : "Nothing to build")}
        ${res.note ? `<p class="text-[11px] leading-relaxed text-zinc-300 bg-zinc-950 border border-zinc-800 rounded-xl p-2.5">${esc(res.note)}</p>` : ""}
        ${n ? `<div class="space-y-1.5" id="pt-bd-list">${rows}</div>
        <p class="text-[10px] text-zinc-500 leading-snug">🔒 keeps an exercise when you Shuffle. ↻ swaps just that one for another for the same muscle.</p>` : ""}
        <div class="sticky bottom-[calc(-1.25rem-env(safe-area-inset-bottom,0px))] -mx-5 -mb-5 px-5 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] space-y-2 bg-zinc-900 border-t border-zinc-800"><div class="grid grid-cols-2 gap-2">
          <button type="button" id="pt-bd-shuffle" class="py-3 rounded-xl bg-zinc-800 text-zinc-100 text-sm font-bold tap-active">Shuffle${locked.size ? " the rest" : ""}</button>
          ${n ? '<button type="button" id="pt-bd-start" class="py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold tap-active">Start workout</button>' : '<button type="button" id="pt-bd-back" class="py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold tap-active">Change options</button>'}
        </div>
        ${n ? '<div class="flex items-center justify-between"><button type="button" id="pt-bd-add" class="text-[11px] font-semibold text-emerald-400 tap-active">＋ Add an exercise</button><button type="button" id="pt-bd-back" class="text-[11px] font-semibold text-zinc-400 underline tap-active">Change options</button></div>' : ""}</div>`);
      card.addEventListener("click", async ev => {
        const b = ev.target.closest("button"); if (!b) return;
        if (b.id === "pt-bd-shuffle") { build(true); }
        else if (b.id === "pt-bd-back") drawOptions();
        else if (b.id === "pt-bd-add") {
          const next = PT.buildAdd(res.items, res.ids, opts(), app);
          if (!next) { app.toast("Nothing more fits those muscles"); return; }
          res.items = next; note(); drawResult();
        }
        else if (b.dataset.lock !== undefined) { const e = res.items[parseInt(b.dataset.lock, 10)]; if (e) { if (locked.has(e.name)) locked.delete(e.name); else locked.add(e.name); drawResult(); } }
        else if (b.dataset.del !== undefined) {
          const i = parseInt(b.dataset.del, 10), e = res.items[i]; if (!e) return;
          locked.delete(e.name); avoid.push(e.name);
          const out = res.items.filter((x, k) => k !== i);
          if (i > 0 && res.items[i - 1].link) delete res.items[i - 1].link;      // its partner stands on its own now
          res.items = out; res.minutes = PT.buildMinutes(out); drawResult();
          if (!e.extra) app.toast(e.name + " removed", "Never show it", () => { PT.hideExercise(e.name, app); app.toast("Hidden. You can bring it back in Settings."); }, 6000);
        }
        else if (b.dataset.swap !== undefined) {
          const i = parseInt(b.dataset.swap, 10), old = res.items[i]; if (!old) return;
          const next = PT.buildSwap(res.items, i, opts(), app);
          if (!next) { app.toast("No other exercise for that muscle fits"); return; }
          locked.delete(old.name); avoid.push(old.name); PT.noteBuild([old.name], app);
          res.items = next; note(); drawResult();
          app.toast("Swapped for another", "Never show " + old.name.slice(0, 22), () => { PT.hideExercise(old.name, app); app.toast("Hidden. You can bring it back in Settings."); }, 6000);
        }
        else if (b.id === "pt-bd-start") {
          const list = res.items.map(e => { const x = Object.assign({}, e); delete x.comp; delete x.fam; return x; });
          const ok = await app.startFreestyleWith(list, { minutes: PT.buildMinutes(res.items), ask: true });
          if (ok) K.closeSheet(el);
        }
      });
    };
    drawOptions();
  }
  PT.openBuildWorkout = pre => { const a = A(); if (a) open(a, pre && typeof pre === "object" && !pre.target ? pre : undefined); };
  PT.autoFocus = autoFocus; PT.buildPresets = PRESETS; PT.buildIsComp = isComp;

  /* ------------------------------------------------------------------ Home card and menu */
  /* the Build button lives in the "Start training" row of the Home page itself (index.html), next to Empty Workout and Cardio */
  function buildCard(a) { const box = document.getElementById("home-build"); if (box) box.classList.remove("hidden"); }
  const oHome = proto.renderHomeView;
  proto.renderHomeView = function () {
    const r = oHome.apply(this, arguments);
    try { buildCard(this); } catch (e) { console.error("PulseTrack build card", e); }
    return r;
  };
  document.addEventListener("click", e => {
    const t = e.target && e.target.closest ? e.target.closest("#pt-build-open, #pt-drawer-build") : null;
    if (!t) return;
    e.preventDefault();
    const a = A(); if (!a) return;
    if (t.id === "pt-drawer-build") a.closeDrawer();
    open(a);
  });
})();
  