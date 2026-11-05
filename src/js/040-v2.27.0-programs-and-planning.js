
/* =====================================================================
 * PulseTrack 2.27.0: programs and planning.
 *  - Build me a program: pick a split (Push/Pull/Legs, Upper/Lower, Full body), 1 or 4 weeks, time and goal. It fills every day with the
 *    workout builder and saves it in Programs. 4 weeks = a wave: week 2 +1 rep, week 3 +1 set on the big lifts, week 4 a deload.
 *    2.50.0: "Pick my own muscles": you set every day yourself (which muscles, and exactly how many exercises for each), copy a day to repeat it
 *    with the same exercises, add rest days, and let opposite muscles alternate as supersets (chest and back, biceps and triceps, quads and hamstrings).
 *  - Make any of your own programs 4 weeks with progression.
 *  - Paste a program as text ("Push / Bench Press 4x8 / ...") and check it before saving.
 *  - Copy a day (workout screen) and drag the grip on an exercise card to reorder.
 *  - Deload suggestion on Home after several hard weeks, and an easy-week mode (builds use fewer sets).
 *  - Suggested today on Home when you have no program.
 *  - Training days (Settings): Home shows a rest day with recovery, or the next workout.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  const proto = ApplicationUI.prototype;
  const A = () => window.app;
  const $ = id => document.getElementById(id);
  const esc = s => PT.esc(s);
  const DAY = 86400000;
  const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const chip = (attr, label, on) => `<button type="button" ${attr} aria-pressed="${on}" class="pt-opt tap-active">${esc(label)}</button>`;
  const lab = t => `<span class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">${t}</span>`;
  const card = "bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5 space-y-2";

  const css = document.createElement("style");
  css.id = "pt-v227-css";
  css.textContent = `
    #pt-home-extra { display: flex; flex-direction: column; gap: .75rem; }
    #pt-home-extra:empty { display: none; }
    #pt-home-extra button.pt-b { padding: .45rem .8rem; border-radius: .6rem; font-size: .75rem; font-weight: 700; background: rgb(var(--z800)); color: rgb(var(--z100)); }
    #pt-home-extra button.pt-b.go { background: rgb(var(--a600)); color: #fff; }
    #pt-prog-tools { display: grid; grid-template-columns: 1fr 1fr; gap: .5rem; }
    #pt-prog-tools button { padding: .7rem .5rem; border-radius: .75rem; font-size: .75rem; font-weight: 700; background: rgb(var(--z900)); border: 1px solid rgb(var(--z800)); color: rgb(var(--z100)); }
    .pt-grip { background: transparent !important; padding: .4rem; color: rgb(var(--z500)); touch-action: none; cursor: grab; border-radius: .75rem; }
    [data-ex-card].pt-dragging { position: relative; z-index: 20; box-shadow: 0 8px 24px rgb(0 0 0 / .5); opacity: .95; }
    [data-ex-card].pt-droptarget { outline: 2px dashed rgb(var(--a500)); outline-offset: 2px; }
    .pt-ud { background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); border-radius: .9rem; padding: .7rem; display: flex; flex-direction: column; gap: .6rem; }
    .pt-ud b.t { font-size: .85rem; color: #fff; }
    .pt-ud small { font-size: .68rem; color: rgb(var(--z500)); }
    .pt-ud .pt-udb { min-width: 2.25rem; height: 2.25rem; padding: 0 .55rem; border-radius: .6rem; background: rgb(var(--z800)); color: rgb(var(--z100)); font-size: .72rem; font-weight: 700; }
    .pt-ud .pt-stp { display: flex; align-items: center; gap: .35rem; }
    .pt-ud .pt-stp button { width: 2.25rem; height: 2.25rem; border-radius: .6rem; background: rgb(var(--z800)); color: #fff; font-size: 1rem; font-weight: 800; line-height: 1; }
    .pt-ud .pt-stp b { min-width: 1.4rem; text-align: center; color: #fff; font-size: .9rem; }
    .pt-ud .pt-urow { display: flex; align-items: center; justify-content: space-between; gap: .5rem; }
    .pt-ud .pt-quick { display: flex; gap: .35rem; overflow-x: auto; padding-bottom: .15rem; }
    .pt-ud .pt-quick button { flex: none; }
    #pt-pb-name { width: 100%; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); border-radius: .75rem; padding: .6rem .75rem; font-size: .85rem; color: rgb(var(--z100)); }
    #pt-paste-text { width: 100%; min-height: 11rem; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); border-radius: .75rem; padding: .75rem; font-size: .8rem; color: rgb(var(--z100)); font-family: ui-monospace, monospace; }
  `;
  document.head.appendChild(css);

  /* ============================================================== saving programs */
  const clean = t => String(t || "").replace(/[<>]/g, "").trim();
  /** Adds a finished program ({title, description, days:[{title, exercises:[{name, sets, reps, restSeconds?, link?}]}]}) to Programs. */
  PT.saveProgram = function (def, appArg) {
    const a = appArg || A(); const id = "custom_" + Date.now().toString(36) + Math.floor(Math.random() * 1000);
    const prog = {
      id, title: clean(def.title) || "My program", description: clean(def.description) || "Custom program", tags: ["Custom"],
      days: (def.days || []).filter(d => (d.exercises || []).length || d.rest).map((d, di) => ({
        dayNumber: di + 1, title: clean(d.title) || ("Day " + (di + 1)),
        estimatedMinutes: d.rest ? 0 : (d.estimatedMinutes || Math.max(20, d.exercises.length * 9)),
        exercises: (d.exercises || []).map((ex, ei) => {
          const o = { id: `${id}_d${di + 1}_e${ei + 1}`, name: ex.name, sets: Math.max(1, parseInt(ex.sets, 10) || 3), reps: clean(ex.reps) || "10",
            restSeconds: ex.restSeconds || a.smartRest(ex.name), restAuto: ex.restAuto !== false && !ex.restSeconds, type: ex.type || "standard" };
          if (ex.link) o.link = true;
          return o;
        })
      }))
    };
    if (!prog.days.some(d => d.exercises.length)) return null;
    if (!a.data || !Array.isArray(a.data.programs)) a.data = { programs: [] };
    prog.days.forEach(d => { d.orig = JSON.parse(JSON.stringify(d.exercises)); });
    a.data.programs.push(prog);
    WorkoutStorage.setData(a.data);
    try { a.renderProgramsView(); a.updateDrawerStatus(); } catch (e) { }
    return prog;
  };
  function openAfter(a, prog, note) {
    a.toast(`Saved "${prog.title}" to your programs${note ? ". " + note : ""}`, "Open", () => {
      a.activeProgram = prog; a.activeDay = a.nextDayOf ? (a.nextDayOf(prog) || prog.days[0]) : prog.days[0];
      AppStateMemory.saveActive(prog.id, a.activeDay.dayNumber); a.showView("days");
    }, 7000);
  }

  /* ============================================================== weeks with progression */
  function bumpReps(reps, add) {
    const s = String(reps || "");
    let m = s.match(/^(\d+)\s*-\s*(\d+)$/); if (m) return `${+m[1] + add}-${+m[2] + add}`;
    m = s.match(/^(\d+)$/); if (m) return String(+m[1] + add);
    return s;
  }
  /** Four weeks from one: 1 as written, 2 one more rep, 3 one more set on the big lifts, 4 an easy week (a set fewer, stop short). */
  PT.progressionWeeks = function (days, weeks) {
    weeks = weeks || 4; const out = [];
    for (let w = 1; w <= weeks; w++) {
      days.forEach(d => {
        const deload = weeks >= 4 && w === weeks;
        out.push({
          rest: !!d.rest, estimatedMinutes: d.keepMin ? d.estimatedMinutes : undefined,
          title: `Week ${w} · ${String(d.title || "Day").replace(/^\s*Week\s+\d+\s*[·:,\-–]\s*/i, "")}${deload && !d.rest ? " (easy week)" : ""}`,
          exercises: d.exercises.map(e => {
            const x = Object.assign({}, e); let sets = parseInt(e.sets, 10) || 3, reps = e.reps;
            if (w === 2) reps = bumpReps(reps, 1);
            else if (w === 3) { reps = bumpReps(reps, 1); if (sets >= 3 && sets < 5 && PT.buildIsComp && PT.buildIsComp(e.name)) sets++; }
            else if (deload) sets = Math.max(2, sets - 1);
            x.sets = sets; x.reps = reps; return x;
          })
        });
      });
    }
    return out;
  };

  /* ============================================================== Build me a program */
  const SPLITS = [
    { id: "ppl3", label: "Push / Pull / Legs", note: "3 days a week", days: ["push", "pull", "legs"] },
    { id: "ppl6", label: "Push / Pull / Legs twice", note: "6 days a week", days: ["push", "pull", "legs", "push", "pull", "legs"] },
    { id: "ul4", label: "Upper / Lower", note: "4 days a week", days: ["upper", "lower", "upper", "lower"] },
    { id: "full3", label: "Full body", note: "3 days a week", days: ["full", "full", "full"] },
    { id: "custom", label: "Pick my own muscles", note: "you set every day", days: [] }
  ];
  const LBL = { push: "Push", pull: "Pull", legs: "Legs", upper: "Upper", lower: "Lower", full: "Full body" };
  const PD = { split: "ppl3", weeks: 4, minutes: 45, goal: "muscle", equip: "any", variety: "balanced", cvar: "familiar", alt: [], name: "", days: null };
  const ALTS = [["chestback", "Chest ↔ back"], ["bitri", "Biceps ↔ triceps"], ["quadham", "Quads ↔ hamstrings"], ["abs", "Abs in pairs"]];
  const ALT_SAY = { chestback: "Chest and back take turns, one exercise each, as supersets (the Arnold way).", bitri: "Biceps and triceps take turns as supersets.", quadham: "Quads and hamstrings take turns as supersets.", abs: "The abs exercises run two by two as supersets." };
  const cleanAlt = a => a === true ? ["chestback", "bitri", "quadham"] : (Array.isArray(a) ? ALTS.map(x => x[0]).filter(k => a.includes(k)) : []);

  /* ---------------------------------------------------------- 2.50.0: pick the muscles for every day */
  const MUS = [["chest", "Chest"], ["back", "Back"], ["shoulders", "Shoulders"], ["biceps", "Biceps"], ["triceps", "Triceps"], ["forearms", "Forearms"],
    ["quads", "Quads"], ["hamstrings", "Hamstrings"], ["glutes", "Glutes"], ["calves", "Calves"], ["abs", "Abs & core"], ["traps", "Traps"], ["lowerback", "Lower back"]];
  const MLAB = {}; MUS.forEach(m => { MLAB[m[0]] = m[1]; });
  const MAXN = 8, MAXDAYS = 14;
  const DEFN = { chest: 4, back: 4, shoulders: 3, biceps: 3, triceps: 3, forearms: 1, quads: 3, hamstrings: 2, glutes: 2, calves: 2, abs: 2, traps: 2, lowerback: 1 };
  const QUICK = [
    ["Push", { chest: 3, shoulders: 3, triceps: 2 }], ["Pull", { back: 4, biceps: 2, traps: 1 }], ["Legs", { quads: 3, hamstrings: 2, glutes: 1, calves: 2 }],
    ["Upper", { chest: 2, back: 2, shoulders: 2, biceps: 1, triceps: 1 }], ["Lower", { quads: 3, hamstrings: 2, glutes: 1, calves: 2, abs: 2 }],
    ["Chest & back", { chest: 4, back: 4 }], ["Shoulders & arms", { shoulders: 4, biceps: 3, triceps: 3 }], ["Arms", { biceps: 3, triceps: 3, forearms: 1 }], ["Core", { abs: 3, lowerback: 1 }]
  ];
  let uidN = 0;
  const newUid = () => "d" + Date.now().toString(36) + (uidN++).toString(36);
  const clonePlan = p => { const o = {}; Object.keys(p || {}).forEach(k => { o[k] = p[k]; }); return o; };
  const defaultDays = () => [
    { uid: newUid(), plan: { chest: 4, back: 4 } },
    { uid: newUid(), plan: { quads: 3, hamstrings: 2, glutes: 1, calves: 2, abs: 2 } },
    { uid: newUid(), plan: { shoulders: 4, biceps: 3, triceps: 3 } }
  ];
  /** whatever was saved (or typed in a test) becomes a clean list: known muscles only, 1 to 8 exercises each, twins pointing at an earlier real day */
  function cleanDays(list) {
    const out = [], seen = new Set();
    (Array.isArray(list) ? list : []).slice(0, MAXDAYS).forEach(d => {
      if (!d || typeof d !== "object") return;
      let uid = typeof d.uid === "string" && /^[\w-]{1,40}$/.test(d.uid) && !seen.has(d.uid) ? d.uid : newUid();
      seen.add(uid);
      if (d.rest) { out.push({ uid, rest: true, plan: {} }); return; }
      const twin = typeof d.twin === "string" && out.some(x => x.uid === d.twin && !x.rest && !x.twin) ? d.twin : null;
      const plan = {};
      if (!twin) MUS.forEach(m => { const n = Math.round(+(d.plan || {})[m[0]]); if (n >= 1) plan[m[0]] = Math.min(MAXN, n); });
      out.push({ uid, twin, plan });
    });
    return out.some(d => !d.rest) ? out : defaultDays();
  }
  const planOf = (d, list) => (d.twin ? ((list.find(x => x.uid === d.twin) || {}).plan || {}) : d.plan) || {};
  const totalOf = plan => Object.keys(plan).reduce((n, k) => n + (plan[k] > 0 ? plan[k] : 0), 0);
  /** "Chest & Back", "Legs & Abs", "Shoulders, Arms & Forearms" */
  function dayName(plan) {
    const has = id => plan[id] > 0, parts = [], used = new Set();
    const legs = has("quads") && has("hamstrings"), arms = has("biceps") && has("triceps");
    MUS.forEach(m => {
      const id = m[0]; if (!has(id) || used.has(id)) return;
      if (legs && ["quads", "hamstrings", "glutes", "calves"].includes(id)) { ["quads", "hamstrings", "glutes", "calves"].forEach(x => used.add(x)); parts.push("Legs"); return; }
      if (arms && (id === "biceps" || id === "triceps")) { used.add("biceps"); used.add("triceps"); parts.push("Arms"); return; }
      used.add(id); parts.push(id === "abs" ? "Abs" : m[1]);
    });
    if (!parts.length) return "Day";
    return parts.length > 1 ? parts.slice(0, -1).join(", ") + " & " + parts[parts.length - 1] : parts[0];
  }
  const planLine = plan => MUS.filter(m => plan[m[0]] > 0).map(m => `${m[1].toLowerCase()} ${plan[m[0]]}`).join(", ");
  /** the exercises for one day: exactly the number you asked for per muscle. Keeps region, comp and fam on each item so a swap or a reshuffle can use them. */
  function buildDay(app, o, plan, seed, avoid) {
    const r = PT.buildWorkout({ perRegion: plan, alt: cleanAlt(o.alt), goal: o.goal, equip: o.equip, variety: ["familiar", "balanced", "mix"].includes(o.cvar) ? o.cvar : "familiar", seed, avoid }, app);
    return { items: r.items.map((e, k, arr) => Object.assign({}, e, { restAuto: true, type: e.link || (arr[k - 1] && arr[k - 1].link) ? "superset" : "standard" })), note: r.note };
  }
  /** week one of every day, not saved yet (the preview lets you swap, remove and shuffle before it is) */
  function buildCustomDays(app, o) {
    const list = cleanDays(o.days), out = [], built = new Map(), notes = [], base = Math.floor(Math.random() * 1e9);
    list.forEach((d, i) => {
      if (d.rest) { out.push({ rest: true, title: "Rest", exercises: [], key: d.uid, uid: d.uid }); return; }
      if (d.twin && built.has(d.twin)) { const s = built.get(d.twin); out.push({ twin: true, title: s.title, plan: s.plan, regs: s.regs, key: s.key, uid: d.uid, exercises: [] }); return; }
      const plan = clonePlan(planOf(d, list)), regs = MUS.map(m => m[0]).filter(id => plan[id] > 0);
      if (!regs.length) return;
      const prior = []; out.forEach(x => { if (x.regs && !x.twin && x.regs.some(r => regs.includes(r))) x.exercises.forEach(e => prior.push(e.name)); });
      const r = buildDay(app, o, plan, base + i * 7919, prior);
      if (!r.items.length) return;
      PT.noteBuild(r.items.map(e => e.name), app);
      if (r.note) notes.push(r.note);
      const day = { title: dayName(plan), plan, regs, key: d.uid, uid: d.uid, exercises: r.items };
      built.set(d.uid, day); out.push(day);
    });
    // two different workouts with the same name get A and B; a copied day keeps its twin's name
    const names = {}; out.forEach(d => { if (d.rest) return; const a = names[d.title] = names[d.title] || []; if (!a.includes(d.key)) a.push(d.key); });
    out.forEach(d => { if (!d.rest && names[d.title].length > 1) d.title += " " + String.fromCharCode(65 + names[d.title].indexOf(d.key)); });
    return { out, notes, list };
  }
  /** the finished program definition, with the 4-week wave when asked for */
  function assembleCustom(o, b) {
    const out = b.out, list = b.list;
    const wk1 = out.map(d => {
      if (d.rest) return { title: d.title, rest: true, exercises: [] };
      const src = d.twin ? out.find(x => !x.twin && !x.rest && x.key === d.key) : d, ex = (src ? src.exercises : []).map(e => Object.assign({}, e));
      return { title: d.title, keepMin: true, estimatedMinutes: PT.buildMinutes(ex), exercises: ex };
    }).filter(d => d.rest || d.exercises.length);
    const all = o.weeks > 1 ? PT.progressionWeeks(wk1, o.weeks) : wk1;
    const goalName = { muscle: "muscle", strength: "strength", endurance: "endurance", hyper: "size", strend: "strength-endurance", pump: "pump" }[o.goal] || "muscle";
    const seen = new Set(), lines = [];
    out.forEach(d => { if (d.rest || seen.has(d.key)) return; seen.add(d.key); lines.push(`${d.title}: ${planLine(d.plan)}.`); });
    const nm = String(o.name || "").replace(/[<>]/g, "").trim().slice(0, 40) || "My split", alt = cleanAlt(o.alt);
    return { title: `${nm} · ${o.weeks > 1 ? o.weeks + " weeks" : "1 week"}`, notes: b.notes,
      description: `Built from the muscles you picked, for ${goalName}. ${lines.join(" ")}${alt.length ? " " + alt.map(k => ALT_SAY[k]).join(" ") : ""}${o.weeks > 1 ? " Week 2: one more rep. Week 3: one more set on the big lifts. Week 4: easy week." : ""}`.trim(), days: all };
  }
  const makeCustom = (app, o) => assembleCustom(o, buildCustomDays(app, o));
  const esc0 = t => String(t == null ? "" : t).replace(/[<>&"']/g, "").trim();
  PT.cleanProgramDays = cleanDays;
  function makeProgram(app, o) {
    if (o.split === "custom") return makeCustom(app, o);
    const sp = SPLITS.find(s => s.id === o.split) || SPLITS[0], seen = {}, days = [];
    const base = Math.floor(Math.random() * 1e9);
    sp.days.forEach((f, i) => {
      seen[f] = (seen[f] || 0) + 1;
      const same = sp.days.filter(x => x === f).length;
      const letter = same > 1 ? " " + String.fromCharCode(64 + seen[f]) : "";
      const prior = days.filter(d => d.f === f).reduce((l, d) => l.concat(d.exercises.map(e => e.name)), []);
      const r = PT.buildWorkout({ focus: f, minutes: o.minutes, goal: o.goal, equip: o.equip, variety: o.variety, seed: base + i * 7919, avoid: prior, core: f === "lower" || f === "legs" ? false : false }, app);
      if (!r.items.length) return;
      PT.noteBuild(r.items.map(e => e.name), app);
      days.push({ f, title: LBL[f] + letter, estimatedMinutes: r.minutes, exercises: r.items.map(e => ({ name: e.name, sets: e.sets, reps: e.reps, restSeconds: e.restSeconds, restAuto: true, link: e.link })) });
    });
    const wk1 = days.map(d => ({ title: d.title, estimatedMinutes: d.estimatedMinutes, exercises: d.exercises }));
    const all = o.weeks > 1 ? PT.progressionWeeks(wk1, o.weeks) : wk1;
    const goalName = { muscle: "muscle", strength: "strength", endurance: "endurance", hyper: "size", strend: "strength-endurance", pump: "pump" }[o.goal] || "muscle";
    return { title: `${sp.label} · ${o.weeks > 1 ? o.weeks + " weeks" : "1 week"}`, description: `Built for ${goalName}, about ${o.minutes} min a session. ${o.weeks > 1 ? "Week 2: one more rep. Week 3: one more set on the big lifts. Week 4: easy week." : ""}`.trim(), days: all };
  }
  PT.makeProgram = (o, appArg) => makeProgram(appArg || A(), Object.assign({}, PD, o));
  PT.programDayName = dayName;
  function openProgramBuilder() {
    const app = A(), K = PT.kit, el = K.sheet("pt-pb", 80);
    const st = Object.assign({}, PD, app.settings.progPrefs || {});
    st.days = cleanDays(st.days); st.alt = cleanAlt(st.alt); st.name = String(st.name || "");
    const GL = [["muscle", "Build muscle"], ["strength", "Get stronger"], ["hyper", "Muscle size"], ["strend", "Strength-endurance"], ["endurance", "Tone & endurance"], ["pump", "Pump"]];
    const custom = () => st.split === "custom";
    const dayCard = (d, i) => {
      const n = i + 1, rm = `<button type="button" data-cd="rm" data-u="${d.uid}" aria-label="Remove day ${n}" class="pt-udb">✕</button>`;
      if (d.rest) return `<div class="pt-ud" data-u="${d.uid}"><div class="pt-urow"><b class="t">Day ${n} · Rest</b>${rm}</div></div>`;
      const src = d.twin ? st.days.find(x => x.uid === d.twin) : null, plan = planOf(d, st.days), tot = totalOf(plan);
      const head = `<div class="pt-urow"><div class="min-w-0"><b class="t">Day ${n} · ${esc(tot ? dayName(plan) : "Pick muscles")}</b> <small>${tot} exercise${tot === 1 ? "" : "s"}</small></div><div class="flex gap-1.5">${d.twin ? "" : `<button type="button" data-cd="dup" data-u="${d.uid}" aria-label="Copy day ${n} with the same exercises" class="pt-udb">Copy</button>`}${rm}</div></div>`;
      if (d.twin && src) return `<div class="pt-ud" data-u="${d.uid}">${head}<small>Same exercises as day ${st.days.indexOf(src) + 1}: ${esc(planLine(plan))}. <button type="button" data-cd="detach" data-u="${d.uid}" class="underline text-zinc-300">Make it different</button></small></div>`;
      return `<div class="pt-ud" data-u="${d.uid}">${head}
        <div class="flex flex-wrap gap-1.5">${MUS.map(m => chip(`data-cm="${m[0]}" data-u="${d.uid}"`, m[1], plan[m[0]] > 0)).join("")}</div>
        ${tot ? MUS.filter(m => plan[m[0]] > 0).map(m => `<div class="pt-urow"><span class="text-[13px] text-zinc-200">${esc(m[1])}</span><span class="pt-stp"><button type="button" data-cn="-1" data-mu="${m[0]}" data-u="${d.uid}" aria-label="Fewer ${esc(m[1])} exercises">−</button><b aria-live="polite">${plan[m[0]]}</b><button type="button" data-cn="1" data-mu="${m[0]}" data-u="${d.uid}" aria-label="More ${esc(m[1])} exercises">＋</button></span></div>`).join("") : '<small>Tap the muscles this day trains, or start from one of these.</small>'}
        <div class="pt-quick" role="group" aria-label="Start from">${QUICK.map((q, k) => chip(`data-cq="${k}" data-u="${d.uid}"`, q[0], false)).join("")}</div></div>`;
    };
    const customHtml = () => `<div>${lab("Your days")}<div class="space-y-2" id="pt-cds">${st.days.map(dayCard).join("")}</div>
        <div class="flex flex-wrap gap-1.5 mt-2">${chip('data-cd="add"', "＋ Training day", false)}${chip('data-cd="addrest"', "＋ Rest day", false)}</div>
        <span class="text-[11px] text-zinc-500 block mt-1.5">Set how many exercises each muscle gets. Copy a day to repeat it with the very same exercises. A rest day is just a day in the list, so put it where you want it.</span></div>
      <div>${lab("Supersets")}<div class="flex flex-wrap gap-1.5">${ALTS.map(a => chip(`data-al="${a[0]}"`, a[1], st.alt.includes(a[0]))).join("")}</div>
        <span class="text-[11px] text-zinc-500 block mt-1.5">${st.alt.length ? st.alt.map(k => ALT_SAY[k]).join(" ") + " Everything else runs as normal." : "Tap a pair to run it as supersets. With none ticked, every exercise is on its own, one muscle after another."}</span></div>
      <div>${lab("Exercise choice")}<div class="flex flex-wrap gap-1.5">${[["familiar", "Classics"], ["balanced", "Balanced"], ["mix", "Mix it up"]].map(v => chip(`data-vr="${v[0]}"`, v[1], st.cvar === v[0])).join("")}</div>
        <span class="text-[11px] text-zinc-500 block mt-1.5">${st.cvar === "familiar" ? "The well-known lifts and what you already do." : st.cvar === "mix" ? "Fresher picks, steering away from what you did lately." : "A bit of both."}</span></div>
      <div>${lab("Program name")}<input id="pt-pb-name" type="text" maxlength="40" value="${esc(st.name)}" placeholder="My split" aria-label="Program name"></div>`;
    const draw = () => {
      const prevCard = el.querySelector("[data-card]"), keep = prevCard ? prevCard.scrollTop : 0;
      const c = K.openSheet(el, `${K.head("Build me a program", custom() ? "You pick the muscles for every day. The exercises are filled in." : "Every day is filled in for you. You can edit it afterwards.")}
        <div>${lab("Split")}<div class="flex flex-wrap gap-1.5">${SPLITS.map(s => chip(`data-sp="${s.id}"`, s.label + " · " + s.note, st.split === s.id)).join("")}</div></div>
        <div>${lab("Length")}<div class="flex flex-wrap gap-1.5">${chip('data-wk="1"', "1 week (repeat it)", st.weeks === 1)}${chip('data-wk="4"', "4 weeks with progression", st.weeks === 4)}</div></div>
        ${custom() ? customHtml() : `<div>${lab("Time per workout")}<div class="flex flex-wrap gap-1.5">${[30, 45, 60, 75].map(m => chip(`data-mn="${m}"`, m + " min", st.minutes === m)).join("")}</div></div>`}
        <div>${lab("Goal")}<div class="flex flex-wrap gap-1.5">${GL.map(g => chip(`data-gl="${g[0]}"`, g[1], st.goal === g[0])).join("")}</div></div>
        <div>${lab("Equipment")}<div class="flex flex-wrap gap-1.5">${[["any", "My gym"], ["dumbbell", "Dumbbells"], ["machine", "Machines & cables"], ["barbell", "Barbell"], ["bodyweight", "Bodyweight"]].map(q => chip(`data-eq="${q[0]}"`, q[1], st.equip === q[0])).join("")}</div></div>
        <div class="sticky bottom-[calc(-1.25rem-env(safe-area-inset-bottom,0px))] -mx-5 -mb-5 px-5 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] bg-zinc-900 border-t border-zinc-800"><button type="button" id="pt-pb-go" class="w-full py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold tap-active">Build the program</button></div>`);
      c.scrollTop = keep;
      const nm = c.querySelector("#pt-pb-name"); if (nm) nm.addEventListener("input", () => { st.name = nm.value; });
      c.addEventListener("click", ev => {
        const b = ev.target.closest("button"); if (!b) return;
        if (b.dataset.sp) st.split = b.dataset.sp; else if (b.dataset.wk) st.weeks = parseInt(b.dataset.wk, 10);
        else if (b.dataset.mn) st.minutes = parseInt(b.dataset.mn, 10); else if (b.dataset.gl) st.goal = b.dataset.gl; else if (b.dataset.eq) st.equip = b.dataset.eq;
        else if (b.dataset.al !== undefined) { const k = b.dataset.al, i = st.alt.indexOf(k); if (i >= 0) st.alt.splice(i, 1); else st.alt.push(k); }
        else if (b.dataset.vr) st.cvar = b.dataset.vr;
        else if (b.dataset.cd || b.dataset.cm || b.dataset.cn || b.dataset.cq) { if (!editDay(b)) return; }
        else if (b.id === "pt-pb-go") { go(); return; } else return;
        draw();
      });
    };
    /** one tap in the day editor: add or remove a day, copy it, tick a muscle, change its count, or start from a ready-made day */
    const editDay = b => {
      const days = st.days, at = days.findIndex(x => x.uid === b.dataset.u), d = days[at], ds = b.dataset;
      if (ds.cd === "add") { if (days.length >= MAXDAYS) { app.toast("That is the most days a program can have here."); return false; } days.push({ uid: newUid(), plan: {} }); return true; }
      if (ds.cd === "addrest") { if (days.length >= MAXDAYS) { app.toast("That is the most days a program can have here."); return false; } days.push({ uid: newUid(), rest: true, plan: {} }); return true; }
      if (!d) return false;
      if (ds.cd === "rm") {
        const kids = days.filter(x => x.twin === d.uid);
        if (kids.length) { kids[0].plan = clonePlan(d.plan); kids[0].twin = null; kids.slice(1).forEach(x => { x.twin = kids[0].uid; }); }
        days.splice(at, 1);
        if (!days.some(x => !x.rest)) days.push({ uid: newUid(), plan: {} });
        return true;
      }
      if (ds.cd === "dup") { if (days.length >= MAXDAYS) { app.toast("That is the most days a program can have here."); return false; } if (!totalOf(d.plan)) { app.toast("Pick some muscles for that day first."); return false; } days.splice(at + 1, 0, { uid: newUid(), twin: d.uid, plan: {} }); return true; }
      if (ds.cd === "detach") { const src = days.find(x => x.uid === d.twin); d.plan = clonePlan(src ? src.plan : {}); d.twin = null; return true; }
      if (d.twin || d.rest) return false;
      if (ds.cm) { if (d.plan[ds.cm] > 0) delete d.plan[ds.cm]; else d.plan[ds.cm] = DEFN[ds.cm] || 3; return true; }
      if (ds.cn) { const m = ds.mu, v = (d.plan[m] || 0) + (parseInt(ds.cn, 10) || 0); if (v < 1 || v > MAXN) return false; d.plan[m] = v; return true; }
      if (ds.cq !== undefined) { const q = QUICK[parseInt(ds.cq, 10)]; if (!q) return false; d.plan = clonePlan(q[1]); return true; }
      return false;
    };
    const go = () => {
      st.name = String(st.name || "").slice(0, 40);
      if (custom() && !st.days.some(d => !d.rest && !d.twin && totalOf(d.plan) > 0)) { app.toast("Pick the muscles for at least one day first."); return; }
      app.settings.progPrefs = { split: st.split, weeks: st.weeks, minutes: st.minutes, goal: st.goal, equip: st.equip, cvar: st.cvar, alt: st.alt, name: st.name, days: st.days }; WorkoutStorage.saveSettings(app.settings);
      if (custom()) {
        try { prev = buildCustomDays(app, st); } catch (e) { console.error(e); app.toast("Couldn't build that. Try other muscles or equipment."); return; }
        if (!prev.out.some(d => !d.rest && !d.twin && d.exercises.length)) { prev = null; app.toast("Nothing fits that equipment. Try \"My gym\"."); return; }
        drawPreview(); return;
      }
      let def; try { def = makeProgram(app, st); } catch (e) { console.error(e); app.toast("Couldn't build that. Try another split or equipment."); return; }
      if (!def.days.length || !def.days.some(d => (d.exercises || []).length)) { app.toast("Nothing fits that equipment. Try \"My gym\"."); return; }
      const prog = PT.saveProgram(def, app); K.closeSheet(el); if (prog) openAfter(app, prog, def.notes && def.notes[0]);
    };
    /* the preview: every day with its exercises. Swap one for another of the same muscle, remove one, shuffle a day, then save. */
    let prev = null;
    const regName = r => (MLAB[r] || r);
    const dayMinutes = d => PT.buildMinutes(d.exercises);
    const drawPreview = () => {
      const prevCard = el.querySelector("[data-card]"), keep = prevCard ? prevCard.scrollTop : 0;
      const out = prev.out, n = out.length, work = out.filter(d => !d.rest).length;
      const rows = out.map((d, di) => {
        const label = `Day ${di + 1} · ${esc(d.title)}`;
        if (d.rest) return `<div class="pt-ud"><div class="pt-urow"><b class="t">${label}</b></div></div>`;
        if (d.twin) { const si = out.findIndex(x => !x.twin && !x.rest && x.key === d.key); return `<div class="pt-ud"><div class="pt-urow"><b class="t">${label}</b></div><small>Same exercises as day ${si + 1}.</small></div>`; }
        const mins = dayMinutes(d);
        return `<div class="pt-ud" data-pvd="${di}"><div class="pt-urow"><div class="min-w-0"><b class="t">${label}</b><small class="block">${d.exercises.length} exercises · about ${mins} min</small></div>
          <button type="button" data-pv="shuffle" data-d="${di}" aria-label="Shuffle day ${di + 1}" class="pt-udb">Shuffle</button></div>
          ${d.exercises.map((e, k) => `<div class="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 pl-2.5 pr-1 py-1.5">
            <div class="min-w-0 flex-1"><span class="block text-[13px] font-semibold text-zinc-100 leading-snug">${esc(e.name)}</span>
              <small class="block">${esc(regName(e.region))} · ${e.sets} × ${esc(e.reps)}${e.link ? ' · <span class="text-purple-300">superset with next</span>' : ""}</small></div>
            <button type="button" data-pv="swap" data-d="${di}" data-i="${k}" aria-label="Swap ${esc(e.name)} for another" class="w-9 h-9 shrink-0 rounded-lg bg-zinc-800 text-zinc-300 text-base tap-active">↻</button>
            <button type="button" data-pv="del" data-d="${di}" data-i="${k}" aria-label="Remove ${esc(e.name)}" class="w-9 h-9 shrink-0 rounded-lg bg-zinc-800 text-zinc-500 text-sm tap-active">✕</button></div>`).join("")}</div>`;
      }).join("");
      const c = K.openSheet(el, `${K.head(esc0(st.name) || "My split", `${work} training day${work === 1 ? "" : "s"}${n > work ? " and " + (n - work) + " rest" : ""}${st.weeks > 1 ? " · " + st.weeks + " weeks with progression" : " · repeat the week"}`)}
        ${prev.notes.length ? `<p class="text-[11px] leading-relaxed text-zinc-300 bg-zinc-950 border border-zinc-800 rounded-xl p-2.5">${esc(prev.notes.join(" "))}</p>` : ""}
        <div class="space-y-2" id="pt-pv-days">${rows}</div>
        <p class="text-[10px] text-zinc-500 leading-snug">↻ swaps one exercise for another that trains the same muscle. Copied days follow the day they were copied from.</p>
        <div class="sticky bottom-[calc(-1.25rem-env(safe-area-inset-bottom,0px))] -mx-5 -mb-5 px-5 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] space-y-2 bg-zinc-900 border-t border-zinc-800"><div class="grid grid-cols-2 gap-2">
          <button type="button" data-pv="all" class="py-3 rounded-xl bg-zinc-800 text-zinc-100 text-sm font-bold tap-active">Shuffle everything</button>
          <button type="button" data-pv="save" id="pt-pv-save" class="py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold tap-active">Save program</button></div>
          <div class="text-center"><button type="button" data-pv="back" class="text-[11px] font-semibold text-zinc-400 underline tap-active">Change the days</button></div></div>`);
      c.scrollTop = keep;
      c.addEventListener("click", ev => {
        const b = ev.target.closest("button"); if (!b || !b.dataset.pv) return;
        const act = b.dataset.pv, di = parseInt(b.dataset.d, 10), k = parseInt(b.dataset.i, 10), d = prev.out[di];
        const sopts = { goal: st.goal, equip: st.equip, variety: ["familiar", "balanced", "mix"].includes(st.cvar) ? st.cvar : "familiar" };
        if (act === "back") { prev = null; draw(); return; }
        if (act === "save") {
          let def; try { def = assembleCustom(st, prev); } catch (e) { console.error(e); app.toast("Couldn't save that."); return; }
          const prog = PT.saveProgram(def, app); K.closeSheet(el); prev = null; if (prog) openAfter(app, prog, def.notes && def.notes[0]); return;
        }
        if (act === "all") { try { prev = buildCustomDays(app, st); } catch (e) { console.error(e); } drawPreview(); return; }
        if (!d || d.rest || d.twin) return;
        if (act === "shuffle") {
          const names = d.exercises.map(e => e.name); PT.noteBuild(names, app);
          const prior = []; prev.out.forEach(x => { if (x !== d && !x.twin && x.regs && x.regs.some(r => d.regs.includes(r))) x.exercises.forEach(e => prior.push(e.name)); });
          const r = buildDay(app, st, d.plan, Math.floor(Math.random() * 1e9), prior);
          if (r.items.length) { d.exercises = r.items; PT.noteBuild(r.items.map(e => e.name), app); }
        } else if (act === "swap") {
          const next = PT.buildSwap(d.exercises, k, sopts, app);
          if (!next) { app.toast("Nothing else fits for that muscle."); return; }
          next[k].type = d.exercises[k].type || next[k].type; next[k].restAuto = true; PT.noteBuild([d.exercises[k].name], app); d.exercises = next;
        } else if (act === "del") {
          if (d.exercises.length <= 1) { app.toast("A day needs at least one exercise. Remove the day instead."); return; }
          const x = d.exercises[k], ex = d.exercises.slice();
          if (x.link && ex[k + 1]) { ex[k + 1] = Object.assign({}, ex[k + 1], { type: "standard" }); }
          if (ex[k - 1] && ex[k - 1].link) { ex[k - 1] = Object.assign({}, ex[k - 1], { type: "standard" }); delete ex[k - 1].link; }
          ex.splice(k, 1); d.exercises = ex;
        } else return;
        drawPreview();
      });
    };
    draw();
  }
  PT.openProgramBuilder = openProgramBuilder;

  /* ============================================================== make an existing program 4 weeks */
  PT.expandProgram = function (prog, appArg) {
    const a = appArg || A(); if (!prog || prog.id === FREESTYLE_ID) return null;
    const base = (prog.days || []).filter(d => (d.exercises || []).length);
    if (!base.length) return null;
    const days = PT.progressionWeeks(base.map(d => ({ title: d.title, estimatedMinutes: d.estimatedMinutes, exercises: d.exercises.map(e => ({ name: e.name, sets: e.sets, reps: e.reps, restSeconds: e.restSeconds, restAuto: e.restAuto, link: e.link, type: e.type })) })), 4);
    return PT.saveProgram({ title: prog.title.replace(/\s*\(4 weeks\)$/, "") + " (4 weeks)", description: "Your program over 4 weeks: one more rep, one more set, then an easy week.", days }, a);
  };

  /* ============================================================== paste a program */
  const LINE = /^(.*?)[\s\-–:,|@(]*?\b(\d{1,2})\s*(?:x|×|sets?\s*(?:of|x|×)?)\s*(\d{1,3}(?:\s*[-–]\s*\d{1,3})?)\b/i;
  function lookup(name) {
    const n = name.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim(); if (!n) return null;
    const db = EXERCISE_DATABASE.map(e => ({ e, k: e.name.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim() }));
    let hit = db.find(x => x.k === n) || db.find(x => x.k === n + "s" || x.k + "s" === n);
    if (!hit) { const words = n.split(" "); const cand = db.filter(x => words.every(w => x.k.includes(w))); if (cand.length) hit = cand.sort((p, q) => p.k.length - q.k.length)[0]; }
    return hit ? hit.e.name : null;
  }
  PT.parseProgramText = function (text) {
    const days = []; let cur = null;
    String(text || "").split(/\r?\n/).forEach(raw => {
      let line = raw.replace(/^[\s•*\-–·]+/, "").replace(/^\d+[.)]\s+/, "").trim(); if (!line) return;
      const m = line.match(LINE);
      if (m && m[1].trim().length >= 2) {
        if (!cur) { cur = { title: "Day 1", exercises: [] }; days.push(cur); }
        const nm = m[1].replace(/[\s\-–:,|@(]+$/, "").trim(), found = lookup(nm);
        cur.exercises.push({ name: found || nm, sets: parseInt(m[2], 10), reps: m[3].replace(/\s+/g, ""), matched: !!found });
      } else {
        const t = line.replace(/[:\-–]+$/, "").replace(/^day\s*\d+\s*[:\-–.]?\s*/i, m2 => m2).trim();
        if (t.length > 40) return;      // a stray sentence, not a heading
        cur = { title: t || ("Day " + (days.length + 1)), exercises: [] }; days.push(cur);
      }
    });
    return days.filter(d => d.exercises.length);
  };
  function openPaste() {
    const app = A(), K = PT.kit, el = K.sheet("pt-paste", 85);
    let title = "";
    const draw = (text, days) => {
      const c = K.openSheet(el, `${K.head("Paste a program", "One exercise per line, like \"Bench Press 4x8\". A line without sets x reps starts a new day.")}
        <textarea id="pt-paste-text" placeholder="Push&#10;Bench Press 4x8&#10;Incline Dumbbell Press 3x10-12&#10;&#10;Pull&#10;Lat Pulldown 3x10" aria-label="Program text">${esc(text || "")}</textarea>
        <input id="pt-paste-title" value="${esc(title)}" placeholder="Program name" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white">
        ${days ? `<div id="pt-paste-preview" class="space-y-2">${days.length ? days.map(d => `<div class="bg-zinc-950 border border-zinc-800 rounded-xl p-2.5"><span class="text-xs font-bold text-white block">${esc(d.title)}</span>${d.exercises.map(e => `<span class="block text-[11px] ${e.matched ? "text-zinc-300" : "text-amber-300"}">${esc(e.name)} · ${e.sets} × ${esc(e.reps)}${e.matched ? "" : " (not in the library, kept as typed)"}</span>`).join("")}</div>`).join("") : '<p class="text-xs text-amber-300">Couldn\'t find any exercises. Each needs sets x reps, like 3x10.</p>'}</div>` : ""}
        <div class="sticky bottom-[calc(-1.25rem-env(safe-area-inset-bottom,0px))] -mx-5 -mb-5 px-5 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] bg-zinc-900 border-t border-zinc-800 grid grid-cols-2 gap-2">
          <button type="button" id="pt-paste-check" class="py-3 rounded-xl bg-zinc-800 text-zinc-100 text-sm font-bold tap-active">Check it</button>
          <button type="button" id="pt-paste-save" class="py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold tap-active">Save program</button></div>`);
      c.addEventListener("click", ev => {
        const b = ev.target.closest("button"); if (!b) return;
        const t = $("pt-paste-text").value; title = $("pt-paste-title").value;
        if (b.id === "pt-paste-check") { draw(t, PT.parseProgramText(t)); }
        else if (b.id === "pt-paste-save") {
          const ds = PT.parseProgramText(t);
          if (!ds.length) { draw(t, ds); return; }
          const prog = PT.saveProgram({ title: title || "Pasted program", description: "Pasted from text", days: ds }, app);
          K.closeSheet(el); if (prog) openAfter(app, prog);
        }
      });
    };
    draw("", null);
  }
  PT.openPasteProgram = openPaste;

  /* ============================================================== Programs screen buttons */
  function ensureProgButtons() {
    const b = $("btn-create-program"); if (!b || $("pt-prog-tools")) return;
    const box = document.createElement("div");
    box.id = "pt-prog-tools";
    box.innerHTML = '<button type="button" id="pt-prog-build">🛠 Build me a program</button><button type="button" id="pt-prog-paste">📋 Paste a program</button>';
    b.insertAdjacentElement("afterend", box);
  }
  const oRP = proto.renderProgramsView;
  proto.renderProgramsView = function () {
    const r = oRP.apply(this, arguments);
    try { ensureProgButtons(); } catch (e) { console.error("PulseTrack programs tools", e); }
    return r;
  };

  /* ============================================================== workout screen: copy a day, drag to reorder */
  function copyDay() {
    const a = A(), prog = a.activeProgram, day = a.activeDay; if (!prog || !day || !(day.exercises || []).length) return;
    const exs = day.exercises.map(e => ({ name: e.name, sets: e.sets, reps: e.reps, restSeconds: e.restSeconds, restAuto: e.restAuto, link: e.link, type: e.type }));
    if (prog.tags && prog.tags.includes("Custom") && prog.id !== FREESTYLE_ID) {
      const n = Math.max(0, ...prog.days.map(d => d.dayNumber)) + 1, id = prog.id;
      const nd = { dayNumber: n, title: (day.title || "Day") + " (copy)", estimatedMinutes: day.estimatedMinutes || 45,
        exercises: exs.map((e, i) => Object.assign({}, e, { id: `${id}_d${n}_e${i + 1}`, restAuto: e.restAuto !== false })) };
      nd.orig = JSON.parse(JSON.stringify(nd.exercises));
      prog.days.push(nd); WorkoutStorage.setData(a.data);
      a.toast(`Copied to "${nd.title}"`, "Open", () => { a.activeDay = nd; AppStateMemory.saveActive(prog.id, n); a.showView("days"); }, 6000);
    } else {
      const p = PT.saveProgram({ title: (day.title || "Day") + " (copy)", description: "Copied from " + prog.title, days: [{ title: day.title || "Day 1", exercises: exs }] }, a);
      if (p) openAfter(a, p);
    }
  }
  function ensureCopyBtn() {
    const share = $("btn-share-day"); if (!share || $("btn-copy-day")) return;
    const b = document.createElement("button");
    b.type = "button"; b.id = "btn-copy-day"; b.className = "tap-active"; b.textContent = "Copy day";
    share.after(b);
  }
  const oRW = proto.renderWorkoutView;
  proto.renderWorkoutView = function () {
    const r = oRW.apply(this, arguments);
    try {
      ensureCopyBtn();
      const list = this.dom.exercisesList, exs = (this.activeDay && this.activeDay.exercises) || [];
      if (false && list && exs.length > 1) list.querySelectorAll(":scope > [data-ex-card]").forEach(c => {
        if (c.querySelector(".pt-grip")) return;
        const anchor = c.querySelector(".btn-mv-up") || c.querySelector(".btn-swap-ex"); if (!anchor) return;
        const g = document.createElement("button");
        g.type = "button"; g.className = "pt-grip"; g.setAttribute("aria-label", "Drag to reorder"); g.title = "Drag to reorder";
        g.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg>';
        anchor.before(g);
      });
    } catch (e) { console.error("PulseTrack workout tools 2.27", e); }
    return r;
  };
  let drag = null;
  document.addEventListener("pointerdown", e => {
    const g = e.target.closest && e.target.closest(".pt-grip"); if (!g) return;
    const cardEl = g.closest("[data-ex-card]"); if (!cardEl) return;
    e.preventDefault();
    drag = { card: cardEl, from: parseInt(cardEl.dataset.exCard, 10), y0: e.clientY, target: null };
    cardEl.classList.add("pt-dragging");
    try { g.setPointerCapture(e.pointerId); } catch (x) { }
  });
  document.addEventListener("pointermove", e => {
    if (!drag) return;
    drag.card.style.transform = `translateY(${e.clientY - drag.y0}px)`;
    const cards = [...A().dom.exercisesList.querySelectorAll(":scope > [data-ex-card]")].filter(c => c !== drag.card);
    let t = null;
    cards.forEach(c => { const r = c.getBoundingClientRect(); if (e.clientY >= r.top && e.clientY <= r.bottom) t = c; });
    cards.forEach(c => c.classList.toggle("pt-droptarget", c === t));
    drag.target = t ? parseInt(t.dataset.exCard, 10) : null;
  });
  function endDrag() {
    if (!drag) return;
    const d = drag; drag = null;
    d.card.classList.remove("pt-dragging"); d.card.style.transform = "";
    const a = A(); a.dom.exercisesList.querySelectorAll(".pt-droptarget").forEach(c => c.classList.remove("pt-droptarget"));
    if (d.target === null || d.target === d.from) return;
    const B = PT.exerciseBlocks(a.activeDay.exercises), bf = B.findIndex(b => d.from >= b[0] && d.from <= b[1]), bt = B.findIndex(b => d.target >= b[0] && d.target <= b[1]);
    if (bf < 0 || bt < 0 || bf === bt) return;
    let idx = d.from; const step = bt > bf ? 1 : -1;
    for (let k = 0; k < Math.abs(bt - bf); k++) { const ni = a.moveExercise(idx, step); if (ni < 0) break; idx = ni; }
    a.renderWorkoutView();
  }
  document.addEventListener("pointerup", endDrag);
  document.addEventListener("pointercancel", endDrag);
  PT._endDrag = endDrag;

  /* ============================================================== deload */
  /* PT.deloadCheck (and the running-deload helpers) live in m58a, so Home and Progress share one deload system */
  PT.deloadActive = appArg => { const a = appArg || A(); return !!(a && a.settings && a.settings.deloadUntil > Date.now()); };
  const oBW = PT.buildWorkout;
  PT.buildWorkout = function (opts, appArg) {
    const r = oBW.apply(this, arguments);
    try {
      const a = appArg || A();
      if (r && r.items && PT.deloadActive(a) && !(opts && opts.noDeload)) { r.items.forEach(e => { if (!e.extra && e.sets > 2) e.sets--; }); r.minutes = PT.buildMinutes(r.items); r.note = (r.note ? r.note + " " : "") + "Easy week: one set fewer on each."; }
    } catch (e) { }
    return r;
  };

  /* ============================================================== Home cards */
  function recoveryLine() {
    try {
      const rec = PT.recovery(); const vals = ["chest", "back", "shoulders", "quads", "hamstrings", "glutes", "biceps", "triceps"].map(r => rec[r] ? rec[r].pct : 100);
      return Math.round(vals.reduce((x, y) => x + y, 0) / vals.length);
    } catch (e) { return null; }
  }
  function homeExtra(a) {
    const home = $("view-home"); if (!home) return;
    let box = $("pt-home-extra");
    if (!box) { box = document.createElement("div"); box.id = "pt-home-extra"; home.insertBefore(box, home.firstChild); }
    const parts = [], now = Date.now(), s = a.settings || {};
    // training days
    const sched = Array.isArray(s.schedule) ? s.schedule : [];
    if (sched.length) {
      const dow = new Date().getDay(), train = sched.includes(dow), pct = recoveryLine();
      let next = ""; for (let i = 1; i <= 7; i++) { const d = (dow + i) % 7; if (sched.includes(d)) { next = i === 1 ? "tomorrow" : DOW[d]; break; } }
      const doneToday = (a.sessions || []).some(x => x.date === PT.ds());
      parts.push(`<div class="${card}" id="pt-sched-card"><span class="text-xs font-bold ${train ? "text-emerald-400" : "text-sky-300"}">${doneToday ? "✅ Done for today" : train ? "🏋️ Training day" : "🛌 Rest day"}</span>
        <p class="text-[12px] text-zinc-300 leading-snug">${doneToday ? "Nice work. " : train ? "" : "Let your body recover. "}${pct !== null ? `Your muscles are about ${pct}% recovered. ` : ""}${!train || doneToday ? (next ? `Next training day: ${next}.` : "") : ""}</p>
        ${!train && !doneToday ? '<button type="button" class="pt-b" id="pt-sched-anyway">Train anyway</button>' : ""}</div>`);
    }
    // deload
    if (PT.deloadActive(a)) {
      const on = PT.deloadOn(a), left = Math.max(1, Math.round((PT.fromDs(on.end).getTime() - PT.fromDs(PT.ds()).getTime()) / DAY) + 1);
      parts.push(`<div class="${card}" id="pt-home-deload"><span class="text-xs font-bold text-sky-300">💤 Easy week · ${left} day${left === 1 ? "" : "s"} left</span><p class="text-[12px] text-zinc-300 leading-snug">About 10% less weight and a set fewer. Stop with 3 reps left in the tank. The Last time hint and built workouts follow this.</p><button type="button" class="pt-b" id="pt-deload-end">End easy week</button></div>`);
    } else if (!(s.deloadSnooze > now) && PT.deloadCheck) {
      let dc = null; try { dc = PT.deloadCheck(a); } catch (e) { }
      if (dc && (dc.due || dc.streak >= 4)) parts.push(`<div class="${card}" id="pt-home-deload"><span class="text-xs font-bold text-sky-300">💤 Time for an easy week?</span><p class="text-[11px] text-zinc-400 leading-snug">${dc.streak} steady weeks in a row${dc.reasons && dc.reasons[0] ? ", and " + esc(dc.reasons[0]) : ""}. A lighter week helps you come back stronger.</p><div class="flex gap-2"><button type="button" class="pt-b go" id="pt-deload-start">Start easy week</button><button type="button" class="pt-b" id="pt-deload-later">Not now</button></div></div>`);
    }
    // suggested today
    const noProg = !a.activeProgram || a.activeProgram.id === FREESTYLE_ID;
    if (noProg && PT.autoFocus) {
      try {
        const f = PT.autoFocus(a), p = (PT.buildPresets || []).find(x => x.id === f.id);
        if (p) parts.push(`<div class="${card} !flex-row !flex !items-center !justify-between !space-y-0 gap-2" id="pt-suggest-card"><span class="text-xs font-bold text-emerald-400 min-w-0">✨ Suggested today: ${esc(p.label)}</span><button type="button" class="pt-b go shrink-0" id="pt-suggest-go" data-f="${esc(f.id)}">Build it</button></div>`);
      } catch (e) { }
    }
    box.innerHTML = parts.join("");
  }
  const oHome = proto.renderHomeView;
  proto.renderHomeView = function () {
    const r = oHome.apply(this, arguments);
    try { homeExtra(this); } catch (e) { console.error("PulseTrack home extras 2.27", e); }
    return r;
  };

  /* ============================================================== Settings: training days */
  function drawSchedule() {
    const a = A(); if (!a) return;
    let box = $("pt-sched-set");
    if (!box) {
      const ref = $("pt-hiddenex") || $("pt-gym-row") || $("pt-textsize"); if (!ref) return;
      box = document.createElement("div"); box.id = "pt-sched-set"; box.className = "mt-3";
      ref.insertAdjacentElement("afterend", box);
    }
    const sel = Array.isArray(a.settings.schedule) ? a.settings.schedule : [];
    const order = [1, 2, 3, 4, 5, 6, 0];
    box.innerHTML = `<span class="block text-xs font-bold text-zinc-100">Training days</span><span class="block text-[11px] text-zinc-400 mb-1.5">Home shows a rest day (with recovery) or a training day.</span>
      <div class="flex flex-wrap gap-1.5">${order.map(d => chip(`data-sd="${d}"`, DOW[d], sel.includes(d))).join("")}</div>`;
  }
  const oEx = proto.renderSettingsExtras;
  proto.renderSettingsExtras = async function () {
    const r = oEx ? await oEx.apply(this, arguments) : undefined;
    try { drawSchedule(); } catch (e) { console.error("PulseTrack schedule", e); }
    return r;
  };

  /* ============================================================== clicks */
  document.addEventListener("click", async e => {
    const a = A(); if (!a || !e.target.closest) return;
    const t = id => e.target.closest("#" + id);
    if (t("pt-prog-build")) { openProgramBuilder(); return; }
    if (t("pt-prog-paste")) { openPaste(); return; }
    if (t("btn-copy-day")) { copyDay(); return; }
    if (t("pt-sched-anyway")) { PT.openBuildWorkout && PT.openBuildWorkout(); return; }
    if (t("pt-deload-start")) { if (PT.deloadStart) PT.deloadStart(a); else { a.settings.deloadUntil = Date.now() + 7 * DAY; WorkoutStorage.saveSettings(a.settings); a.renderHomeView(); a.toast("Easy week started"); } return; }
    if (t("pt-deload-later")) { a.settings.deloadSnooze = Date.now() + 10 * DAY; WorkoutStorage.saveSettings(a.settings); a.renderHomeView(); return; }
    if (t("pt-deload-end")) { if (PT.deloadStop) PT.deloadStop(a); else { a.settings.deloadUntil = 0; a.settings.deloadSnooze = Date.now() + 21 * DAY; WorkoutStorage.saveSettings(a.settings); a.renderHomeView(); } return; }
    if (t("pt-suggest-go")) { const f = t("pt-suggest-go").dataset.f; PT.openBuildWorkout && PT.openBuildWorkout({ focus: f }); return; }
    const sd = e.target.closest("[data-sd]");
    if (sd) {
      const d = parseInt(sd.dataset.sd, 10), l = Array.isArray(a.settings.schedule) ? a.settings.schedule.slice() : [], i = l.indexOf(d);
      if (i >= 0) l.splice(i, 1); else l.push(d);
      a.settings.schedule = l; WorkoutStorage.saveSettings(a.settings); drawSchedule(); try { a.renderHomeView(); } catch (x) { }
    }
  });

  /* "Make it 4 weeks" lives on the day list of your own programs */
  const oDays = proto.renderDaysView;
  if (typeof oDays === "function") proto.renderDaysView = function () {
    const r = oDays.apply(this, arguments);
    try {
      const p = this.activeProgram, host = $("view-days"); if (!p || !host) return r;
      let b = $("pt-expand4");
      const ok = p.tags && p.tags.includes("Custom") && p.id !== FREESTYLE_ID && !this.progWeeks(p) && (p.days || []).length && (p.days || []).length < 8;
      if (!ok) { if (b) b.remove(); return r; }
      if (!b) {
        b = document.createElement("button"); b.type = "button"; b.id = "pt-expand4";
        b.className = "w-full py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-200 tap-active";
        b.textContent = "📈 Make a 4-week version with progression";
        b.addEventListener("click", () => { const np = PT.expandProgram(A().activeProgram, A()); if (np) openAfter(A(), np); });
        (this.dom.daysList || host).insertAdjacentElement("afterend", b);
      }
    } catch (e) { console.error("PulseTrack expand", e); }
    return r;
  };
})();
  