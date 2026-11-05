
/* =====================================================================
 * PulseTrack 2.57.0: Weak points, muscle by muscle, and harder to fool.
 *
 * Before: six groups (chest, back, shoulders, ARMS, legs, core), each scored from its three BEST graded exercises. So biceps, triceps and forearms were
 * one blob, and a single amazing lift (or a group with just one lift logged) could make a whole group look strong.
 *
 * Now: 16 muscles, the same ones the muscle map uses but with the delts and the back split up:
 *   chest · front, side and rear delts · lats, upper back, traps, lower back · biceps, triceps, forearms · abs · quads, hamstrings, glutes, calves
 * Every graded exercise that trains a muscle counts toward it (not only the best three):
 *   - the muscle it mainly trains counts in full, a helper muscle only 20% (and a muscle needs at least one exercise that mainly trains it)
 *   - lifts graded with a scaled ("est.") standard count 70%, and lifts you have not done for 12 weeks / 26 weeks count 75% / 50%
 *   - one standout lift cannot carry a muscle: every lift is held to within one level of that muscle's typical level, and a muscle with little
 *     evidence is pulled toward your overall level (one exercise counts for about 40%, two for two thirds, three for 80%) and never lands more than a
 *     level away from it
 *   - a muscle is only called "behind" when at least two exercises back it up; with one it just says so
 * The six-group scores behind the All-Rounder and No Weak Link badges are untouched.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined" || !PT.lvKit || !PT.exLevels || !PT.regionsFor) return;
  const proto = ApplicationUI.prototype;
  const K = PT.lvKit;
  const $ = id => document.getElementById(id);
  const esc = s => PT.esc(s);
  const DAY = 86400000;

  /* ---------------------------------------------------------------- the muscles */
  const MUSCLES = [
    ["chest", "Chest"], ["fdelt", "Front delts"], ["sdelt", "Side delts"], ["rdelt", "Rear delts"],
    ["lats", "Lats"], ["mback", "Upper back"], ["traps", "Traps"], ["lback", "Lower back"],
    ["biceps", "Biceps"], ["triceps", "Triceps"], ["forearms", "Forearms"], ["abs", "Abs & core"],
    ["quads", "Quads"], ["hams", "Hamstrings"], ["glutes", "Glutes"], ["calves", "Calves"]
  ];
  const LABEL = Object.fromEntries(MUSCLES);
  const TRY = {
    chest: ["Incline Dumbbell Press", "Dumbbell Bench Press", "Barbell Incline Press", "Dips", "Push-Ups"],
    fdelt: ["Overhead Press", "Dumbbell Shoulder Press", "Arnold Press", "Machine Shoulder Press", "Barbell Front Raises"],
    sdelt: ["Lateral Raises", "Cable Lateral Raises", "Seated Dumbbell Lateral Raises", "Machine Lateral Raises", "Dumbbell Upright Rows"],
    rdelt: ["Face Pulls", "Dumbbell Reverse Flyes", "Reverse Pec Deck", "Cable Rear Delt Flyes"],
    lats: ["Lat Pulldown", "Pull-Ups", "Chin-Ups", "Wide-Grip Lat Pulldown", "Straight-Arm Pulldown"],
    mback: ["Barbell Bent-Over Rows", "Seated Cable Row", "T-Bar Rows", "Chest-Supported Dumbbell Rows", "Dumbbell Rows"],
    traps: ["Barbell Shrugs", "Dumbbell Shrugs", "Trap Bar Shrugs", "Cable Shrugs"],
    lback: ["Back Extensions", "Good Mornings", "Rack Pulls", "Deadlift", "Reverse Hyperextensions"],
    biceps: ["Barbell Curls", "Hammer Curls", "Incline Dumbbell Curls", "EZ-Bar Preacher Curls", "Cable Curls"],
    triceps: ["Close-Grip Bench Press", "Rope Pushdown", "EZ-Bar Skull Crushers", "Cable Overhead Extension", "Triceps Dips"],
    forearms: ["Reverse Curls", "Barbell Wrist Curls", "Zottman Curls", "Reverse Wrist Curls", "Dead Hangs"],
    abs: ["Hanging Leg Raises", "Cable Crunches", "Ab Wheel Rollouts", "Plank", "Sit-Ups"],
    quads: ["Squat", "Leg Press", "Hack Squat", "Bulgarian Split Squats", "Leg Extensions"],
    hams: ["Romanian Deadlift", "Lying Leg Curls", "Seated Leg Curls", "Stiff-Leg Deadlift", "Nordic Hamstring Curls"],
    glutes: ["Barbell Hip Thrusts", "Hip Thrusts", "Bulgarian Split Squats", "Cable Kickbacks", "Glute Bridges"],
    calves: ["Standing Calf Raises", "Seated Calf Raises", "Leg Press Calf Raises", "Donkey Calf Raises"]
  };
  PT.weakMuscles = MUSCLES.map(m => ({ id: m[0], label: m[1] }));

  /** which muscles an exercise trains: { muscleId: weight } with 1 for the muscle it mainly trains and 0.2 for helpers */
  const HELP = 0.2, cache = new Map();
  function musclesOf(name) {
    const n0 = String(name || ""); if (cache.has(n0)) return cache.get(n0);
    const n = n0.toLowerCase(), out = {}, add = (k, w) => { if (!(out[k] >= w)) out[k] = w; };
    if (/\bclean|snatch|swing|burpee|thruster|jerk/.test(n)) { cache.set(n0, out); return out; }   // full-body lifts: not a clean read of any one muscle
    const nl = n.replace(/iso-?lateral/g, "iso");
    let prim = {}, all = {};
    try { prim = PT.regionsFor(n0, false) || {}; all = PT.regionsFor(n0, true) || {}; } catch (e) { }
    const main = Object.keys(prim)[0];
    Object.keys(all).forEach(r => {
      const isMain = r === main, w = isMain ? 1 : HELP;
      switch (r) {
        case "chest": add("chest", w); break;
        case "biceps": add("biceps", w); break;
        case "triceps": add("triceps", w); break;
        case "forearms": add("forearms", w); break;
        case "traps": add("traps", w); break;
        case "lowerback": add("lback", w); break;
        case "abs": add("abs", w); break;
        case "quads": add("quads", w); break;
        case "hamstrings": add("hams", w); break;
        case "glutes": add("glutes", w); break;
        case "calves": add("calves", w); break;
        case "shoulders":
          if (!isMain) { add("fdelt", w); break; }
          if (/rear|reverse (fl|pec|cable)|face pull|y-?raise|prone/.test(n) && !/front/.test(n)) add("rdelt", 1);
          else if (/lateral|side raise|upright|lu raise|scaption|cuban/.test(nl)) { add("sdelt", 1); if (/upright/.test(n)) add("traps", HELP); }
          else if (/front raise|shoulder raise/.test(n)) { add("fdelt", 1); add("sdelt", HELP); }
          else { add("fdelt", 1); add("sdelt", HELP); }       // presses
          break;
        case "back":
          if (!isMain) { add("mback", w); break; }
          if (/pulldown|pull-?down|pull-?up|chin-?up|pullover|straight-arm|muscle-?up|\blat\b/.test(n)) { add("lats", 1); add("mback", HELP); }
          else if (/row|seal|meadows|pendlay|t-?bar|inverted|rowing/.test(n)) { add("mback", 1); add("lats", HELP); }
          else add("lats", 1);
          break;
        default: break;
      }
    });
    cache.set(n0, out); return out;
  }
  PT.musclesOf = musclesOf;

  /* ---------------------------------------------------------------- the scoring */
  const recency = (ts, now) => { const d = (now - (ts || 0)) / DAY; return !ts ? 0.5 : d <= 84 ? 1 : d <= 182 ? 0.75 : 0.5; };
  const median = items => {
    const xs = items.slice().sort((p, q) => p.s - q.s), tot = xs.reduce((t, x) => t + x.w, 0); let run = 0;
    for (let i = 0; i < xs.length; i++) {
      run += xs[i].w;
      if (run >= tot / 2 - 1e-9) return Math.abs(run - tot / 2) < 1e-9 && xs[i + 1] ? (xs[i].s + xs[i + 1].s) / 2 : xs[i].s;
    }
    return xs.length ? xs[xs.length - 1].s : 0;
  };
  const BAND = 1.0, PRIOR = n => (n >= 3 ? 0.75 : n === 2 ? 1 : 1.5);
  function scoreMuscles(a) {
    const rows = PT.exLevels(a), now = Date.now(), by = {}, every = [];
    rows.forEach(r => {
      if (!r.lv) return;
      const ms = musclesOf(r.name); if (!Object.keys(ms).length) return;
      const conf = K.isEst(r.st, r.name) ? 0.7 : 1, rec = recency(r.ts, now), s = r.lv.idx + r.lv.frac * 0.999;
      let counted = false;
      Object.keys(ms).forEach(k => {
        const main = ms[k] >= 1;
        (by[k] = by[k] || []).push({ s, w: ms[k] * conf * rec, main, name: r.name, idx: r.lv.idx, est: conf < 1, stale: rec < 1 });
        if (main) counted = true;
      });
      if (counted) every.push({ s, w: conf * rec });
    });
    const totW = every.reduce((t, x) => t + x.w, 0), prior = totW ? every.reduce((t, x) => t + x.w * x.s, 0) / totW : 0;
    const list = MUSCLES.map(([id, label]) => {
      const items = (by[id] || []).filter(x => x.w > 0), nMain = items.filter(x => x.main).length;
      if (!nMain) return { id, g: label, label, score: null, n: 0, items: [], names: new Set() };
      const med = median(items), lo = med - BAND, hi = med + BAND;
      const sw = items.reduce((t, x) => t + x.w, 0), sv = items.reduce((t, x) => t + x.w * Math.max(lo, Math.min(hi, x.s)), 0);
      const raw = sv / sw, k = PRIOR(nMain);
      let score = (sv + k * prior) / (sw + k);
      if (nMain === 1) score = Math.max(prior - BAND, Math.min(prior + BAND, score));     // one exercise can never move a muscle more than a level from your overall level
      const shown = items.slice().sort((x, y) => (y.main - x.main) || (y.s - x.s));
      return { id, g: label, label, score, raw, n: nMain, items: shown, names: new Set(items.map(x => x.name)), prior };
    });
    const have = list.filter(x => x.score !== null), avg = have.length ? have.reduce((t, x) => t + x.score, 0) / have.length : 0;
    return { list, have, avg };
  }
  PT.muscleScores = scoreMuscles;
  const GAP = 0.4;
  PT.weakPoints = a => {
    const gs = scoreMuscles(a); if (gs.have.length < 2) return { ok: false, list: gs.list, have: gs.have.length };
    const sorted = gs.have.slice().sort((x, y) => x.score - y.score);
    const solid = sorted.filter(x => x.n >= 2), weak0 = solid[0] || null, gap = weak0 ? gs.avg - weak0.score : 0;
    const thin = sorted.find(x => x.n < 2 && gs.avg - x.raw >= 0.6) || null;
    const untested = gs.list.filter(x => x.score === null).map(x => x.label);
    return { ok: true, list: gs.list, avg: gs.avg, weak: weak0 && gap >= GAP ? weak0 : null, gap, thin, untested, best: sorted[sorted.length - 1], sorted };
  };

  /* ---------------------------------------------------------------- the card */
  const hasBw = a => K.bwOf(a) > 0;
  function suggestions(id, names) {
    const dbs = K.db(), out = [];
    (TRY[id] || []).forEach(n => { const c = dbs.byName.get(n.toLowerCase()); if (c && K.std(c) && !names.has(c) && !out.includes(c)) out.push(c); });
    return out.slice(0, 3);
  }
  const lvIdx = s => Math.max(0, Math.min(4, Math.floor(s)));
  function rowHtml(x, weak) {
    const i = lvIdx(x.score), c = K.COLS[i], isW = !!weak && weak.id === x.id;
    const items = x.items.map(it => `<div class="flex items-center justify-between gap-2 text-[11px]"><span class="min-w-0 truncate ${it.main ? "text-zinc-200" : "text-zinc-500"}">${esc(it.name)}${it.main ? "" : " · helper"}${it.est ? " · est." : ""}</span><span class="shrink-0 font-bold" style="color:${K.COLS[it.idx]}">${K.LEVELS[it.idx]}</span></div>`).join("");
    return `<details class="pt-wk-row"><summary class="tap-active"><span class="flex items-center justify-between gap-2 text-[11px]"><span class="font-bold ${isW ? "text-amber-300" : "text-zinc-100"}">${esc(x.label)}${isW ? " · behind" : ""}<span class="pt-wk-n"> ${x.n} exercise${x.n === 1 ? "" : "s"}</span></span><span class="font-black" style="color:${c}">${K.LEVELS[i]}</span></span>${K.bar(x.score / 5, isW ? "#f59e0b" : c)}</summary><div class="pt-wk-ex space-y-1">${items}</div></details>`;
  }
  function weakCardHtml(a) {
    let html = `<h3 class="text-xs font-bold text-white">Weak points</h3>`;
    if (!hasBw(a)) return html + `<p class="text-xs text-zinc-400">Log your body weight and this compares your muscles by strength level.</p>`;
    const w = PT.weakPoints(a);
    if (!w.ok) return html + `<p class="text-xs text-zinc-400">Log exercises for at least two muscles (say chest and quads) and this shows which one is behind.</p>`;
    if (w.weak) {
      const x = w.weak, sug = suggestions(x.id, x.names), i = lvIdx(x.score), low = LABEL[x.id].toLowerCase();
      html += `<div class="rounded-xl border border-amber-800/50 bg-amber-950/30 p-3 space-y-2"><p class="text-xs text-amber-200 leading-snug"><b>${esc(x.label)}</b> is your weakest muscle: ${K.LEVELS[i]}, about ${w.gap.toFixed(1)} levels behind your average. Bringing it up balances your strength${/delt|lats|back|traps/.test(low) ? "" : " and usually helps your other lifts"}.</p>${sug.length ? `<p class="text-[11px] text-zinc-400">Try adding:</p><div class="flex flex-wrap gap-1.5">${sug.map(n => `<button type="button" data-lv-open="${esc(n)}" class="pt-opt tap-active">${esc(n)}</button>`).join("")}</div>` : `<p class="text-[11px] text-zinc-400">Two or three more ${esc(low)} sets each week would help.</p>`}<button type="button" id="pt-weak-find" data-group="${esc(x.label)}" class="pt-st-weak tap-active">Find a day for ${esc(low)}</button></div>`;
    } else html += `<p class="text-xs text-emerald-300">No clear weak link. Every muscle is close to your average level.</p>`;
    if (w.thin && (!w.weak || w.thin.id !== w.weak.id)) html += `<p class="text-[11px] text-zinc-400">${esc(w.thin.label)} looks low, but only one exercise trains it so far. Log another to be sure.</p>`;
    const cut = w.sorted.length > 8 ? 6 : w.sorted.length, first = w.sorted.slice(0, cut), rest = w.sorted.slice(cut);
    html += `<div class="space-y-1 pt-wk-list"><span class="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Weakest first · tap one to see why</span>${first.map(x => rowHtml(x, w.weak)).join("")}${rest.length ? `<div class="pt-wk-more" hidden>${rest.map(x => rowHtml(x, w.weak)).join("")}</div><button type="button" class="pt-wk-toggle tap-active" aria-expanded="false" data-n="${rest.length}">Show the other ${rest.length} muscles</button>` : ""}</div>`;
    if (w.untested.length) html += `<p class="text-[11px] text-zinc-500">Not graded yet: ${esc(w.untested.join(", "))}.</p>`;
    html += `<p class="text-[10px] text-zinc-500 leading-relaxed">Each bar uses every graded exercise for that muscle, not just the best: recent lifts count more, helper muscles count a little, and one standout lift cannot carry a muscle. A muscle needs two exercises before it is called behind. Estimates for most lifts.</p>`;
    return html;
  }
  // "Show the other N muscles": the rows open ABOVE the button, so the button moves down to the end of the list ("Show fewer muscles" there)
  document.addEventListener("click", e => {
    const b = e.target && e.target.closest ? e.target.closest(".pt-wk-toggle") : null; if (!b) return;
    const box = b.previousElementSibling; if (!box || !box.classList.contains("pt-wk-more")) return;
    const open = box.hidden; box.hidden = !open;
    b.setAttribute("aria-expanded", String(open));
    b.textContent = open ? "Show fewer muscles" : "Show the other " + b.dataset.n + " muscles";
    if (!open) { try { b.scrollIntoView({ block: "nearest" }); } catch (err) { } }       // closing: the button jumps back up, keep it in sight
  });
  const oPV = proto.renderProgressView;
  proto.renderProgressView = function () {
    const r = oPV.apply(this, arguments);
    try { const c = $("pt-weak-card"); if (c) c.innerHTML = weakCardHtml(this); } catch (e) { console.error("PulseTrack weak points", e); }
    return r;
  };

  const css = document.createElement("style"); css.id = "pt-v257-weak-css";
  css.textContent = `
    .pt-wk-row > summary { list-style: none; cursor: pointer; }
    .pt-wk-more[hidden] { display: none; }
    .pt-wk-row > summary::-webkit-details-marker { display: none; }
    .pt-wk-row { border-radius: .6rem; }
    .pt-wk-row > summary { display: block; padding: .5rem .1rem .15rem; min-height: 2.75rem; }
    .pt-wk-row > summary .pt-lv-bar { margin-top: .3rem; }
    .pt-wk-n { font-weight: 600; color: rgb(var(--z500)); margin-left: .3rem; }
    .pt-wk-ex { padding: .2rem .5rem .6rem; border-left: 2px solid rgb(var(--z800)); margin-left: .25rem; }
    .pt-wk-toggle { display: flex; align-items: center; justify-content: center; width: 100%; min-height: 2.75rem; margin-top: .25rem; border: 1px dashed rgb(var(--z700)); border-radius: .85rem; font-size: .72rem; font-weight: 700; color: rgb(var(--z400)); background: transparent; }
  `;
  document.head.appendChild(css);
})();
  