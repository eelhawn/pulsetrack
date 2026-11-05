
/* =====================================================================
 * PulseTrack 2.28.0: body, recovery and progress.
 *  - How do you feel? (sleep, soreness) in Build me a workout, and injury flags (Settings and the build sheet): builds go easier / steer around them.
 *  - Stretch & mobility routines (Programs screen, and after a workout).
 *  - Progress page: weekly report card (shareable image), badges, lift goals with a projected date, year heatmap, PR timeline,
 *    and a family leaderboard (swap weekly codes, no accounts).
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  const proto = ApplicationUI.prototype;
  const A = () => window.app;
  const $ = id => document.getElementById(id);
  const esc = s => PT.esc(s);
  const DAY = 86400000, LB = 2.2046226;
  const chip = (attr, label, on) => `<button type="button" ${attr} aria-pressed="${on}" class="pt-opt tap-active">${esc(label)}</button>`;
  const lab = t => `<span class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">${t}</span>`;
  const save = () => { try { WorkoutStorage.saveSettings(A().settings); } catch (e) { } };
  const mondayOf = t => { const d = new Date(t); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d.getTime(); };
  const dsOf = t => PT.ds(new Date(t));
  const sessTime = s => s.ts || (PT.fromDs && PT.fromDs(s.date) ? PT.fromDs(s.date).getTime() : 0);
  const unitKg = () => A().unit() === "kg";
  const toUser = (v, from) => { const f = from === "kg" ? "kg" : "lb", t = unitKg() ? "kg" : "lb"; return f === t ? v : (t === "kg" ? v / LB : v * LB); };
  const toLb = (v, from) => (from === "kg" ? v * LB : v);
  const fmt = v => Math.round(v).toLocaleString();

  const css = document.createElement("style");
  css.id = "pt-v228-css";
  css.textContent = `
    .pt-pg { background: rgb(var(--z900)); border: 1px solid rgb(var(--z800)); border-radius: 1rem; }
    .pt-pg > summary { display: flex; align-items: center; justify-content: space-between; gap: .5rem; padding: .9rem 1rem; cursor: pointer; min-height: 3rem; }
    .pt-pg > div { padding: 0 1rem 1rem; display: flex; flex-direction: column; gap: .75rem; }
    .pt-pg .pt-b { padding: .5rem .85rem; border-radius: .65rem; font-size: .75rem; font-weight: 700; background: rgb(var(--z800)); color: rgb(var(--z100)); }
    .pt-pg .pt-b.go { background: rgb(var(--a600)); color: #fff; }
    .pt-badge { display: flex; flex-direction: column; align-items: center; gap: .15rem; padding: .55rem .25rem; border-radius: .75rem; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); text-align: center; font-size: .625rem; line-height: 1.15; color: rgb(var(--z300)); }
    .pt-badge i { font-style: normal; font-size: 1.4rem; }
    .pt-badge.off { opacity: .35; filter: grayscale(1); }
    .pt-bar { height: .45rem; border-radius: 9999px; background: rgb(var(--z800)); overflow: hidden; }
    .pt-bar > span { display: block; height: 100%; background: rgb(var(--a500)); }
    .pt-pg input[type=text], .pt-pg input[type=number], .pt-pg select, #pt-goal-sheet input, #pt-goal-sheet select { background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); border-radius: .65rem; padding: .55rem .7rem; font-size: .8rem; color: rgb(var(--z100)); width: 100%; }
  `;
  document.head.appendChild(css);

  /* ============================================================== injuries and "how do you feel" */
  const INJ = {
    shoulder: { label: "Shoulder", re: /overhead|military|shoulder press|arnold|upright row|\bdips?\b|behind[- ]the[- ]neck|snatch|jerk|push press|handstand|front raise/i },
    elbow: { label: "Elbow", re: /skull|extension|pushdown|push-?down|close[- ]grip|\bdips?\b|preacher|french|kickback|chin-?up/i },
    wrist: { label: "Wrist", re: /barbell curl|front squat|clean|wrist|push-?up|handstand|farmer/i },
    back: { label: "Lower back", re: /deadlift|good ?morning|bent[- ]?over|barbell row|pendlay|t-bar|back extension|hyperextension|rack pull|romanian|stiff/i, regions: ["lowerback"] },
    knee: { label: "Knee", re: /squat|lunge|leg extension|step-?up|jump|hack|leg press|sissy|split/i },
    hip: { label: "Hip", re: /hip thrust|lunge|sumo|abduct|adduct|bulgarian|split squat/i }
  };
  PT.injuryTypes = INJ;
  const injuries = a => (Array.isArray(a.settings.injuries) ? a.settings.injuries : []).filter(k => INJ[k]);
  const injuryNames = a => {
    const res = injuries(a).map(k => INJ[k].re); if (!res.length) return [];
    return EXERCISE_DATABASE.filter(e => e && e.name && res.some(re => re.test(e.name))).map(e => e.name);
  };
  const feel = a => { const c = a.settings.checkin; return c && c.ds === PT.ds() ? c : { ds: PT.ds(), sleep: "", sore: "", regions: [] }; };
  const SORE_REG = [["chest", "Chest"], ["back", "Back"], ["shoulders", "Shoulders"], ["biceps", "Biceps"], ["triceps", "Triceps"], ["quads", "Quads"], ["hamstrings", "Hamstrings"], ["glutes", "Glutes"], ["calves", "Calves"]];
  PT.feelHtml = function () {
    const a = A(), c = feel(a), inj = injuries(a);
    const bits = [];
    if (c.sleep === "poor") bits.push("poor sleep"); if (c.sore === "very") bits.push("very sore");
    if (c.regions.length) bits.push("sore: " + c.regions.join(", "));
    if (inj.length) bits.push(inj.map(k => INJ[k].label.toLowerCase()).join(", ") + " flagged");
    return `<details class="pt-sub" id="pt-bd-feel"><summary><span class="min-w-0 flex-1 text-xs font-bold text-white">How do you feel today?</span><span class="pt-sum">${esc(bits.join(" · ") || "Sleep, soreness, injuries")}</span></summary>
      <div class="space-y-3 pt-2">
        <div>${lab("Sleep last night")}<div class="flex flex-wrap gap-1.5">${[["poor", "😴 Poor"], ["ok", "😐 OK"], ["great", "😀 Great"]].map(x => chip(`data-fs="${x[0]}"`, x[1], c.sleep === x[0])).join("")}</div></div>
        <div>${lab("Sore overall")}<div class="flex flex-wrap gap-1.5">${[["none", "Fresh"], ["some", "A bit"], ["very", "Very sore"]].map(x => chip(`data-fo="${x[0]}"`, x[1], c.sore === x[0])).join("")}</div></div>
        <div>${lab("Skip these muscles today")}<div class="flex flex-wrap gap-1.5">${SORE_REG.map(x => chip(`data-fr="${x[0]}"`, x[1], c.regions.includes(x[0]))).join("")}</div></div>
        <div>${lab("Injuries (stay until you turn them off)")}<div class="flex flex-wrap gap-1.5">${Object.keys(INJ).map(k => chip(`data-fi="${k}"`, INJ[k].label, inj.includes(k))).join("")}</div>
          <span class="text-[11px] text-zinc-500 block mt-1.5">Exercises that load that joint are left out of builds. Poor sleep or very sore means one set fewer on each.</span></div>
      </div></details>`;
  };
  function setFeel(fn) { const a = A(), c = feel(a); fn(c); a.settings.checkin = c; save(); }
  document.addEventListener("click", e => {
    const a = A(); if (!a || !e.target.closest) return;
    const b = e.target.closest("[data-fs],[data-fo],[data-fr],[data-fi]"); if (!b || !b.closest("#pt-bd-feel, #pt-inj-set")) return;
    if (b.dataset.fs !== undefined) { setFeel(c => { c.sleep = c.sleep === b.dataset.fs ? "" : b.dataset.fs; }); }
    else if (b.dataset.fo !== undefined) { setFeel(c => { c.sore = c.sore === b.dataset.fo ? "" : b.dataset.fo; }); }
    else if (b.dataset.fr !== undefined) { setFeel(c => { const i = c.regions.indexOf(b.dataset.fr); if (i >= 0) c.regions.splice(i, 1); else c.regions.push(b.dataset.fr); }); }
    else if (b.dataset.fi !== undefined) { const l = injuries(a).slice(), i = l.indexOf(b.dataset.fi); if (i >= 0) l.splice(i, 1); else l.push(b.dataset.fi); a.settings.injuries = l; save(); }
    // redraw the pressed state of every chip in the open block
    const c = feel(a), inj = injuries(a);
    document.querySelectorAll("#pt-bd-feel [data-fs], #pt-inj-set [data-fs]").forEach(x => x.setAttribute("aria-pressed", String(c.sleep === x.dataset.fs)));
    document.querySelectorAll("#pt-bd-feel [data-fo]").forEach(x => x.setAttribute("aria-pressed", String(c.sore === x.dataset.fo)));
    document.querySelectorAll("#pt-bd-feel [data-fr]").forEach(x => x.setAttribute("aria-pressed", String(c.regions.includes(x.dataset.fr))));
    document.querySelectorAll("#pt-bd-feel [data-fi], #pt-inj-set [data-fi]").forEach(x => x.setAttribute("aria-pressed", String(inj.includes(x.dataset.fi))));
    const sum = document.querySelector("#pt-bd-feel .pt-sum");
    if (sum) { const bits = []; if (c.sleep === "poor") bits.push("poor sleep"); if (c.sore === "very") bits.push("very sore"); if (c.regions.length) bits.push("sore: " + c.regions.join(", ")); if (inj.length) bits.push(inj.map(k => INJ[k].label.toLowerCase()).join(", ") + " flagged"); sum.textContent = bits.join(" · ") || "Sleep, soreness, injuries"; }
  });

  // the three builder entry points take the check-in and injuries into account
  const oBW = PT.buildWorkout, oBS = PT.buildSwap, oBA = PT.buildAdd;
  const withAvoid = (a, o) => Object.assign({}, o || {}, { avoid: ((o && o.avoid) || []).concat(injuryNames(a)) });
  PT.buildWorkout = function (opts, appArg) {
    const a = appArg || A(); opts = withAvoid(a, opts);
    const c = feel(a), drop = new Set(c.regions);
    injuries(a).forEach(k => (INJ[k].regions || []).forEach(r => drop.add(r)));
    let label = "", removed = [];
    if (drop.size) {
      const presets = PT.buildPresets || [];
      let ids = Array.isArray(opts.regions) && opts.regions.length ? opts.regions.slice() : null;
      if (!ids) {
        const p = presets.find(x => x.id === opts.focus);
        if (p && p.r) { ids = p.r.slice(); label = p.label; }
        else if (!opts.focus || opts.focus === "auto") { try { const f = PT.autoFocus(a), pp = presets.find(x => x.id === f.id); ids = (f.regs || pp.r).slice(); label = pp.label; } catch (e) { } }
      }
      if (ids) { const keep = ids.filter(r => !drop.has(r)); if (keep.length && keep.length < ids.length) { removed = ids.filter(r => drop.has(r)); opts.regions = keep; opts.focus = ""; } }
    }
    const r = oBW.call(this, opts, a);
    try {
      if (removed.length) { if (label) r.title = label; r.note = (r.note ? r.note + " " : "") + `Left out ${removed.join(", ")} (sore or injured).`; }
      if ((c.sleep === "poor" || c.sore === "very") && !(opts && opts.noEase)) {
        r.items.forEach(e => { if (!e.extra && e.sets > 2) e.sets--; }); r.minutes = PT.buildMinutes(r.items);
        r.note = (r.note ? r.note + " " : "") + "Going easy today: a set fewer on each.";
      }
      if (injuries(a).length) r.note = (r.note ? r.note + " " : "") + "Avoiding exercises that load: " + injuries(a).map(k => INJ[k].label.toLowerCase()).join(", ") + ".";
    } catch (e) { }
    return r;
  };
  if (oBS) PT.buildSwap = function (items, i, opts, appArg) { const a = appArg || A(); return oBS.call(this, items, i, withAvoid(a, opts), a); };
  if (oBA) PT.buildAdd = function (items, ids, opts, appArg) { const a = appArg || A(); return oBA.call(this, items, ids, withAvoid(a, opts), a); };

  /* ============================================================== stretch & mobility */
  const STRETCH = {
    upper: ["Arm Circles", "Band Shoulder Dislocates", "Doorway Chest Stretch", "Cross-Body Shoulder Stretch", "Overhead Triceps Stretch", "Kneeling Lat Stretch", "Thoracic Rotations", "Cat-Cow", "Child's Pose"],
    lower: ["Standing Quad Stretch", "Hamstring Stretch", "Hip Flexor Stretch", "Pigeon Stretch", "Calf Stretch", "90/90 Hip Switches", "Ankle Mobility Rocks", "Lying Hip Twist", "Knee-to-Chest Stretch", "World's Greatest Stretch"]
  };
  const UPPER = ["chest", "back", "shoulders", "biceps", "triceps", "traps", "forearms"];
  const dbHas = (() => { let s = null; return n => { if (!s) s = new Set(EXERCISE_DATABASE.map(e => e && e.name)); return s.has(n); }; })();
  PT.stretchList = function (group, mins) {
    const pick = group === "upper" ? STRETCH.upper : group === "lower" ? STRETCH.lower : STRETCH.upper.slice(0, 5).concat(STRETCH.lower.slice(0, 5));
    const n = mins >= 10 ? 10 : 6, names = pick.filter(dbHas).slice(0, n);
    return names.map(nm => ({ name: nm, sets: 1, reps: mins >= 10 ? "45s" : "30s", restSeconds: 10, restAuto: false, type: "standard", extra: "cool" }));
  };
  function openStretch(preGroup) {
    const a = A(), K = PT.kit, el = K.sheet("pt-stretch", 60); const st = { g: preGroup || "full", m: 5 };
    const draw = () => {
      const c = K.openSheet(el, `${K.head("Stretch & mobility", "A guided list of holds. Tap the timer button on each one.")}
        <div>${lab("Where")}<div class="flex flex-wrap gap-1.5">${[["full", "Full body"], ["upper", "Upper body"], ["lower", "Lower body"]].map(x => chip(`data-sg="${x[0]}"`, x[1], st.g === x[0])).join("")}</div></div>
        <div>${lab("How long")}<div class="flex flex-wrap gap-1.5">${[5, 10].map(m => chip(`data-sm="${m}"`, m + " min", st.m === m)).join("")}</div></div>
        <div class="sticky bottom-[calc(-1.25rem-env(safe-area-inset-bottom,0px))] -mx-5 -mb-5 px-5 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] bg-zinc-900 border-t border-zinc-800"><button type="button" id="pt-sg-go" class="w-full py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold tap-active">Start</button></div>`);
      c.addEventListener("click", async ev => {
        const b = ev.target.closest("button"); if (!b) return;
        if (b.dataset.sg) st.g = b.dataset.sg; else if (b.dataset.sm) st.m = parseInt(b.dataset.sm, 10);
        else if (b.id === "pt-sg-go") { const ok = await a.startFreestyleWith(PT.stretchList(st.g, st.m), { minutes: st.m, ask: true }); if (ok) K.closeSheet(el); return; } else return;
        draw();
      });
    };
    draw();
  }
  PT.openStretch = openStretch;
  function ensureStretchBtn() {
    const box = $("pt-prog-tools"); if (!box || $("pt-prog-stretch")) return;
    const b = document.createElement("button"); b.type = "button"; b.id = "pt-prog-stretch"; b.style.gridColumn = "1 / -1"; b.textContent = "🧘 Stretch & mobility routine";
    box.appendChild(b);
  }
  const oRP = proto.renderProgramsView;
  proto.renderProgramsView = function () { const r = oRP.apply(this, arguments); try { ensureStretchBtn(); } catch (e) { } return r; };
  const oFin = proto.finishWorkoutV2;
  proto.finishWorkoutV2 = async function () {
    const r = await oFin.apply(this, arguments);
    try {
      const s = this.lastSummary && this.lastSummary.session;
      let b = $("pt-summary-stretch");
      if (!b) { const t = $("btn-summary-template"); if (t) { b = document.createElement("button"); b.id = "pt-summary-stretch"; b.type = "button"; b.className = "w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold rounded-xl tap-active text-sm"; b.textContent = "🧘 Stretch for 5 min"; t.parentElement.insertBefore(b, t); } }
      if (b && s) {
        const regs = new Set(); (s.ex || []).forEach(e => { try { Object.keys(PT.regionsFor(e.name, false) || {}).slice(0, 1).forEach(x => regs.add(x)); } catch (x) { } });
        const up = [...regs].some(x => UPPER.includes(x)), lo = [...regs].some(x => !UPPER.includes(x) && x !== "abs");
        b.dataset.group = up && lo ? "full" : up ? "upper" : lo ? "lower" : "full";
      }
      checkBadges(this, true);
    } catch (e) { console.error("PulseTrack finish extras 2.28", e); }
    return r;
  };
  document.addEventListener("click", e => {
    const a = A(); if (!a || !e.target.closest) return;
    if (e.target.closest("#pt-prog-stretch")) { openStretch(); return; }
    const sb = e.target.closest("#pt-summary-stretch");
    if (sb) { if (a.dom.modalSummary) a.dom.modalSummary.classList.add("hidden"); a.startFreestyleWith(PT.stretchList(sb.dataset.group || "full", 5), { minutes: 5, ask: false }); }
  });

  /* ============================================================== Progress page extras */
  const S = a => a.sessions || [];
  const bestE1 = (a, s) => { const m = {}; (s.ex || []).forEach(e => { let b = 0; (e.sets || []).forEach(st => { if (st.t !== "W") b = Math.max(b, a.setE1rm(e.name, st, s.date) || 0); }); if (b > 0) m[e.name] = b; }); return m; };
  const weekStats = (a, startT, endT) => {
    const out = { k: 0, v: 0, s: 0, p: 0, names: [], best: {}, days: new Set() };
    S(a).forEach(s => {
      const t = sessTime(s); if (t < startT || t >= endT) return;
      out.k++; out.v += toLb(s.vol || 0, s.unit); out.s += s.sets || 0; out.p += (s.prs || []).length; (s.prs || []).forEach(n => out.names.push(n)); out.days.add(s.date);
      const m = bestE1(a, s); Object.keys(m).forEach(n => { out.best[n] = Math.max(out.best[n] || 0, toLb(m[n], s.unit)); });
    });
    return out;
  };
  function reportData(a) {
    const end = new Date(); end.setHours(0, 0, 0, 0); const e1 = end.getTime() + DAY, s1 = e1 - 7 * DAY, s0 = s1 - 7 * DAY;
    const cur = weekStats(a, s1, e1), prev = weekStats(a, s0, s1);
    return { cur, prev, from: s1, to: e1 - DAY };
  }
  const pct = (c, p) => (p > 0 ? Math.round((c - p) / p * 100) : null);
  const arrow = d => (d === null ? "" : d > 0 ? `▲ ${d}%` : d < 0 ? `▼ ${Math.abs(d)}%` : "same");
  function reportHtml(a) {
    const R = reportData(a), c = R.cur, p = R.prev, u = unitKg() ? "kg" : "lbs", V = x => fmt(unitKg() ? x / LB : x);
    if (!c.k && !p.k) return '<p class="text-xs text-zinc-400">Finish a workout and your weekly report card shows up here.</p>';
    const top = Object.keys(c.best).sort((x, y) => c.best[y] - c.best[x]).slice(0, 3);
    const tile = (k, v, d) => `<div class="rounded-xl bg-zinc-950 border border-zinc-800 p-2.5"><span class="block text-[10px] font-bold text-zinc-500">${k}</span><span class="block text-base font-black text-white font-mono">${v}</span><span class="block text-[10px] ${d && d.startsWith("▲") ? "text-emerald-400" : d && d.startsWith("▼") ? "text-amber-300" : "text-zinc-500"}">${d || "&nbsp;"}</span></div>`;
    return `<p class="text-[11px] text-zinc-400">Last 7 days vs the 7 before.</p>
      <div class="grid grid-cols-2 gap-2">${tile("WORKOUTS", c.k, arrow(pct(c.k, p.k)))}${tile("VOLUME", V(c.v) + " " + u, arrow(pct(c.v, p.v)))}${tile("SETS", c.s, arrow(pct(c.s, p.s)))}${tile("PRs", c.p, "")}</div>
      ${top.length ? `<div class="text-[11px] text-zinc-300">${top.map(n => `<span class="block">${esc(n)} <b class="text-white">${V(c.best[n])} ${u}</b> est. 1RM</span>`).join("")}</div>` : ""}
      <div class="flex gap-2"><button type="button" class="pt-b go" id="pt-report-share">Share as picture</button></div>`;
  }
  async function shareReport() {
    const a = A(), R = reportData(a), c = R.cur, p = R.prev, W = 1080, H = 1350, u = unitKg() ? "kg" : "lbs", V = x => fmt(unitKg() ? x / LB : x);
    const cv = document.createElement("canvas"); cv.width = W; cv.height = H; const g = cv.getContext("2d"), acc = PT.accent();
    const grad = g.createLinearGradient(0, 0, 0, H); grad.addColorStop(0, "#18181b"); grad.addColorStop(1, "#09090b"); g.fillStyle = grad; g.fillRect(0, 0, W, H);
    g.fillStyle = acc; g.fillRect(0, 0, W, 14);
    const font = (w, s) => `${w} ${s}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;
    g.fillStyle = acc; g.font = font(900, 44); g.fillText("PULSETRACK", 80, 120);
    g.fillStyle = "#ffffff"; g.font = font(900, 84); g.fillText("Weekly report", 80, 245);
    g.fillStyle = "#a1a1aa"; g.font = font(600, 34);
    const range = `${PT.fmtDate(dsOf(R.from), { month: "short", day: "numeric" })} – ${PT.fmtDate(dsOf(R.to), { month: "short", day: "numeric" })}`;
    g.fillText((a.settings.myName ? a.settings.myName + " · " : "") + range, 80, 305);
    const tiles = [["WORKOUTS", String(c.k), arrow(pct(c.k, p.k))], ["VOLUME", V(c.v) + " " + u, arrow(pct(c.v, p.v))], ["SETS", String(c.s), arrow(pct(c.s, p.s))], ["PRs", String(c.p), ""]];
    tiles.forEach(([k, v, d], i) => {
      const x = 80 + (i % 2) * 470, y = 360 + Math.floor(i / 2) * 230;
      g.fillStyle = "#18181b"; g.strokeStyle = "#27272a"; g.lineWidth = 3; if (g.roundRect) { g.beginPath(); g.roundRect(x, y, 440, 200, 28); g.fill(); g.stroke(); } else g.fillRect(x, y, 440, 200);
      g.fillStyle = "#71717a"; g.font = font(800, 28); g.fillText(k, x + 36, y + 58);
      g.fillStyle = k === "PRs" ? "#fbbf24" : k === "VOLUME" ? acc : "#ffffff"; let s = 64; g.font = font(900, s); while (g.measureText(v).width > 370 && s > 28) { s -= 4; g.font = font(900, s); } g.fillText(v, x + 36, y + 130);
      g.fillStyle = d.startsWith("▲") ? "#34d399" : d.startsWith("▼") ? "#fcd34d" : "#71717a"; g.font = font(700, 30); g.fillText(d, x + 36, y + 176);
    });
    let y = 880; g.fillStyle = "#71717a"; g.font = font(800, 28); g.fillText("TOP LIFTS (EST. 1RM)", 80, y);
    Object.keys(c.best).sort((x, z) => c.best[z] - c.best[x]).slice(0, 5).forEach(n => {
      y += 62; g.fillStyle = "#e4e4e7"; g.font = font(700, 36); let t = n; while (g.measureText(t).width > 640 && t.length > 8) t = t.slice(0, -2); g.fillText(t === n ? n : t + "…", 80, y);
      g.fillStyle = "#a1a1aa"; g.font = font(800, 36); g.textAlign = "right"; g.fillText(V(c.best[n]) + " " + u, W - 80, y); g.textAlign = "left";
    });
    g.fillStyle = "#52525b"; g.font = font(600, 26); g.fillText("Tracked with PulseTrack", 80, H - 60);
    try {
      const blob = await new Promise((res, rej) => cv.toBlob(b => b ? res(b) : rej(new Error("toBlob")), "image/png"));
      await a.shareFile(new File([blob], `pulsetrack-week-${dsOf(R.to)}.png`, { type: "image/png" }), "PulseTrack weekly report");
    } catch (e) { a.toast("Could not create the picture"); }
  }

  /* ---- badges: tiers (bronze to platinum), medal artwork, progress rings, categories, detail sheet and an unlock celebration */
  const TIERS = [
    { name: "Bronze", a: "#f0b27a", b: "#a0522d", glow: "rgb(205 127 50 / .55)" },
    { name: "Silver", a: "#f3f4f6", b: "#8b93a1", glow: "rgb(203 213 225 / .5)" },
    { name: "Gold", a: "#fde68a", b: "#d97706", glow: "rgb(251 191 36 / .6)" },
    { name: "Platinum", a: "#a5f3fc", b: "#8b5cf6", glow: "rgb(167 139 250 / .65)" }
  ];
  const CATS = [["all", "All"], ["earned", "Earned"], ["training", "Training"], ["streak", "Streaks"], ["strength", "Strength"], ["volume", "Volume"], ["records", "Records"], ["habits", "Habits"], ["variety", "Variety"], ["milestones", "Milestones"], ["secret", "Secret"]];
  const vis = b => (b.secret && !b.got ? Object.assign({}, b, { name: "Secret badge", desc: "Keep training and you might find it.", icon: "❔", cur: 0 }) : b);
  const lbl = (lb, big) => unitKg() ? fmt(Math.round(lb / LB / (big ? 50 : 5)) * (big ? 50 : 5)) + " kg" : fmt(lb) + " lb";
  const SERIES = [
    { cat: "training", key: "workouts", icon: "🏋️", steps: [1, 10, 25, 50, 100, 250, 500, 1000], names: ["First Rep", "Warming Up", "Regular", "Committed", "Centurion", "Iron Veteran", "Half-Thousand", "Legend"], desc: v => v === 1 ? "Finish your first workout" : `Finish ${v} workouts` },
    { cat: "training", key: "hours", icon: "⏱️", steps: [5, 10, 25, 50, 100, 250], names: ["Putting In Time", "Ten Hours", "Quarter Century", "Fifty Hours", "Century of Hours", "Gym Rat"], desc: v => `Train for ${v} hours in total`, fmtCur: v => v.toFixed(1) + " h" },
    { cat: "training", key: "sessSets", icon: "🔥", steps: [20, 30, 40], names: ["Long Haul", "Marathon Session", "Ultra Session"], desc: v => `Do ${v}+ sets in one workout` },
    { cat: "training", key: "sessVol", icon: "🦾", steps: [10000, 20000, 40000], names: ["Heavy Day", "Monster Session", "Tonnage King"], desc: v => `Lift ${lbl(v, true)} in one workout`, lb: true },
    { cat: "streak", key: "streak", icon: "📅", steps: [2, 4, 8, 12, 26, 52], names: ["Back-to-Back", "Monthly", "Two Months", "A Full Season", "Half a Year", "Year of Iron"], desc: v => `Train every week for ${v} weeks in a row`, fmtCur: v => v + " wk" },
    { cat: "volume", key: "volume", icon: "🚛", steps: [10000, 50000, 100000, 250000, 500000, 1000000, 2500000], names: ["Heavy Hauler", "Crane Operator", "Dock Worker", "Freight Train", "Cargo Ship", "Million Pound Club", "Titan"], desc: v => `Lift ${lbl(v, true)} in total`, lb: true },
    { cat: "records", key: "prs", icon: "🏅", steps: [5, 10, 25, 50, 100, 200], names: ["Record Breaker", "Double Digits", "Quarter Hundred", "Fifty Records", "Hundred Records", "Record Machine"], desc: v => `Set ${v} personal records` },
    { cat: "strength", key: "bench", icon: "💪", steps: [135, 185, 225, 275, 315, 405], lift: "Bench", re: /^(smith machine (flat |bench )?press|(barbell )?bench press)$/i },
    { cat: "strength", key: "squat", icon: "🦵", steps: [135, 225, 315, 405, 495], lift: "Squat", re: /^(smith machine squats?|(barbell )?(back )?squat)$/i },
    { cat: "strength", key: "dead", icon: "🏗️", steps: [225, 315, 405, 495, 585], lift: "Deadlift", re: /^(barbell )?(conventional )?deadlift$/i },
    { cat: "strength", key: "ohp", icon: "🙌", steps: [95, 135, 185, 225], lift: "Press", re: /^(barbell )?(standing )?(overhead|military|shoulder) press$/i },
    { cat: "habits", key: "early", icon: "🌅", steps: [5, 25, 50], names: ["Early Bird", "Dawn Patrol", "Sunrise Club"], desc: v => `Start ${v} workouts before 7 am` },
    { cat: "habits", key: "owl", icon: "🌙", steps: [5, 25, 50], names: ["Night Owl", "Moonlighter", "After Hours"], desc: v => `Start ${v} workouts after 8 pm` },
    { cat: "habits", key: "weekend", icon: "🎽", steps: [10, 25, 50], names: ["Weekend Warrior", "Saturday Regular", "No Days Off"], desc: v => `Train on ${v} weekend days` },
    { cat: "habits", key: "bodylog", icon: "⚖️", steps: [1, 10, 30], names: ["Weigh-In", "Scale Regular", "Body Tracker"], desc: v => v === 1 ? "Log your body weight" : `Log your body ${v} times` },
    { cat: "variety", key: "variety", icon: "🧭", steps: [10, 25, 50, 100, 150], names: ["Trying Things", "Well Rounded", "Variety Pack", "Exercise Collector", "Encyclopedia"], desc: v => `Log ${v} different exercises` }
  ];
  const tierOf = (i, n) => Math.min(3, Math.floor(i * 4 / n));
  /** every badge with: got, cur, goal, date earned (YYYY-MM-DD) */
  PT.badges = function (a) {
    a = a || A();
    const list = S(a).slice().sort((x, y) => sessTime(x) - sessTime(y)), M = { workouts: 0, hours: 0, sessSets: 0, sessVol: 0, streak: 0, volume: 0, prs: 0, bench: 0, squat: 0, dead: 0, ohp: 0, early: 0, owl: 0, weekend: 0, bodylog: 0, variety: 0 };
    const when = {}; const names = new Set(); let lastWk = 0, run = 0;
    const stamp = date => SERIES.forEach(se => se.steps.forEach(st => { const id = se.key + st; if (when[id] === undefined && M[se.key] >= st) when[id] = date; }));
    list.forEach(s => {
      const t = sessTime(s), vol = toLb(s.vol || 0, s.unit);
      M.workouts++; M.hours += (s.dur || 0) / 3600; M.volume += vol; M.prs += (s.prs || []).length;
      M.sessSets = Math.max(M.sessSets, s.sets || 0); M.sessVol = Math.max(M.sessVol, vol);
      (s.ex || []).forEach(e => { if (e && e.name) names.add(e.name); }); M.variety = names.size;
      const wk = mondayOf(t); if (wk !== lastWk) { run = lastWk && Math.round((wk - lastWk) / (7 * DAY)) === 1 ? run + 1 : 1; lastWk = wk; } M.streak = Math.max(M.streak, run);
      const start = new Date(t - (s.dur || 0) * 1000), hr = start.getHours(), dw = new Date(t).getDay();
      if (s.dur && hr < 7) M.early++; if (s.dur && hr >= 20) M.owl++; if (dw === 0 || dw === 6) M.weekend++;
      const be = bestE1(a, s); Object.keys(be).forEach(n => SERIES.forEach(se => { if (se.re && se.re.test(n)) M[se.key] = Math.max(M[se.key], toLb(be[n], s.unit)); }));
      stamp(s.date);
    });
    const body = (a.body || []).slice().sort((x, y) => String(x.date).localeCompare(String(y.date)));
    body.forEach((b, i) => { M.bodylog = i + 1; stamp(b.date); });
    const out = [];
    SERIES.forEach(se => se.steps.forEach((st, i) => {
      const id = se.key + st, n = se.steps.length, name = se.lift ? `${se.lift} ${lbl(st)}` : se.names[i];
      const desc = se.lift ? `Bench-style estimate: lift ${lbl(st)} for one rep (estimated 1RM) on ${se.lift.toLowerCase()}` .replace("Bench-style estimate: lift", "Reach an estimated 1RM of") + "" : se.desc(st);
      const cur = M[se.key], goal = st;
      out.push({ id, cat: se.cat, series: se.key, step: i, steps: n, tier: tierOf(i, n), name, desc: se.lift ? `Reach an estimated one-rep max of ${lbl(st)} on ${se.lift.toLowerCase()}` : desc, icon: se.icon, got: cur >= goal, cur, goal, date: when[id] || null, lb: !!(se.lb || se.lift), fmtCur: se.fmtCur });
    }));
    return out;
  };
  function checkBadges(a, announce) {
    const list = PT.badges(a), got = list.filter(b => b.got).map(b => b.id), seen = a.settings.badgesSeen2;
    if (!Array.isArray(seen)) { a.settings.badgesSeen2 = got; save(); return; }
    const fresh = list.filter(b => b.got && !seen.includes(b.id));
    if (fresh.length) { a.settings.badgesSeen2 = seen.concat(fresh.map(b => b.id)); save(); if (announce) setTimeout(() => showUnlock(fresh), 1400); }
  }
  PT.checkBadges = checkBadges;

  let defsDone = false;
  function ensureDefs() {
    if (defsDone || $("pt-bdg-defs")) return; defsDone = true;
    const s = document.createElement("div"); s.id = "pt-bdg-defs"; s.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
    s.innerHTML = `<svg width="0" height="0" aria-hidden="true"><defs>${TIERS.map((t, i) => `<linearGradient id="pt-bg${i}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${t.a}"/><stop offset="1" stop-color="${t.b}"/></linearGradient>`).join("")}<radialGradient id="pt-bgs" cx=".35" cy=".25" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs></svg>`;
    document.body.appendChild(s);
  }
  /** medal: hexagon in tier colours with a ring that fills as you get closer; locked ones are dim */
  function medal(b, px) {
    ensureDefs();
    const pct = b.got ? 1 : Math.max(0, Math.min(1, b.cur / b.goal)), C = 2 * Math.PI * 47, t = TIERS[b.tier];
    return `<svg class="pt-medal ${b.got ? "on" : "off"}" viewBox="0 0 100 100" width="${px}" height="${px}" role="img" aria-label="${esc(b.name)}, ${t.name}${b.got ? ", earned" : ""}" style="--g:${t.glow}">
      <circle cx="50" cy="50" r="47" fill="none" stroke="rgb(var(--z800))" stroke-width="3"/>
      <circle cx="50" cy="50" r="47" fill="none" stroke="url(#pt-bg${b.tier})" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="${(C * pct).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 50 50)" opacity="${b.got ? 1 : .75}"/>
      <polygon points="50,12 82,30 82,70 50,88 18,70 18,30" fill="${b.got ? `url(#pt-bg${b.tier})` : "rgb(var(--z850))"}" stroke="${b.got ? t.b : "rgb(var(--z700))"}" stroke-width="2" stroke-linejoin="round"/>
      <polygon points="50,19 76,34 76,66 50,81 24,66 24,34" fill="${b.got ? "rgb(0 0 0 / .22)" : "rgb(var(--z950))"}"/>
      ${b.got ? '<polygon points="50,12 82,30 82,70 50,88 18,70 18,30" fill="url(#pt-bgs)"/>' : ""}
      <text x="50" y="62" text-anchor="middle" font-size="30" ${b.got ? "" : 'opacity=".35" style="filter:grayscale(1)"'}>${b.icon}</text></svg>`;
  }
  const curText = b => (b.lb ? lbl(b.cur, true) : b.fmtCur ? b.fmtCur(b.cur) : fmt(b.cur));
  const goalText = b => (b.lb ? lbl(b.goal, true) : b.fmtCur ? b.fmtCur(b.goal).replace(/\.0/, "") : fmt(b.goal));
  const dateText = d => (d ? PT.fmtDate(d, { month: "short", day: "numeric", year: "numeric" }) : "");
  function badgesHtml(a) {
    const l = PT.badges(a), n = l.filter(b => b.got).length, cat = a.__bdgCat || "all";
    const firstOpen = {}; l.forEach(b => { if (!b.got && !b.secret && firstOpen[b.series] === undefined) firstOpen[b.series] = b; });
    const next = Object.values(firstOpen).filter(b => b.cur > 0).sort((x, y) => y.cur / y.goal - x.cur / x.goal)[0];
    const shown = l.filter(b => cat === "all" ? true : cat === "earned" ? b.got : b.cat === cat).sort((x, y) => (cat === "earned" ? (y.date || "").localeCompare(x.date || "") : (y.got - x.got) || x.tier - y.tier)).map(vis);
    const tiers = TIERS.map((t, i) => `<span class="pt-tcount"><i style="background:linear-gradient(135deg,${t.a},${t.b})"></i>${l.filter(b => b.got && b.tier === i).length}</span>`).join("");
    return `<div class="pt-bhead"><div><span class="block text-sm font-black text-white">${n} <span class="text-zinc-500 font-bold">of ${l.length}</span></span><span class="block text-[10px] text-zinc-500">badges earned</span></div><div class="pt-tcounts">${tiers}</div></div>
      ${next ? `<button type="button" class="pt-next tap-active" data-bid="${next.id}">${medal(next, 56)}<span class="min-w-0 flex-1 text-left"><span class="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Next up</span><span class="block text-sm font-bold text-white truncate">${esc(next.name)}</span><span class="block text-[11px] text-zinc-400">${esc(curText(next))} of ${esc(goalText(next))}</span><span class="pt-bar mt-1.5"><span style="width:${Math.round(next.cur / next.goal * 100)}%"></span></span></span></button>` : ""}
      <div class="pt-cats" role="group" aria-label="Badge categories">${CATS.map(c => chip(`data-bc="${c[0]}"`, c[1], cat === c[0])).join("")}</div>
      ${shown.length ? `<div class="pt-bgrid">${shown.map(b => `<button type="button" class="pt-badge tap-active ${b.got ? "" : "off"}" data-bid="${b.id}">${medal(b, 64)}<span class="pt-bn">${esc(b.name)}</span><span class="pt-bs">${b.got ? esc(dateText(b.date)) : esc(curText(b)) + " / " + esc(goalText(b))}</span></button>`).join("")}</div>` : '<p class="text-xs text-zinc-400">Nothing here yet. Keep training!</p>'}`;
  }
  function openBadge(id) {
    const a = A(), K = PT.kit, b0 = PT.badges(a).find(x => x.id === id); if (!b0) return; const b = vis(b0);
    const t = TIERS[b.tier], pct = Math.round(Math.min(1, b.cur / b.goal) * 100);
    const sib = PT.badges(a).filter(x => x.series === b.series), nx = sib.find(x => x.step === b.step + 1);
    const el = K.sheet("pt-bdg", 62);
    K.openSheet(el, `<div class="pt-bdetail"><div class="pt-bbig ${b.got ? "on" : ""}" style="--g:${t.glow}">${medal(b, 150)}</div>
      <span class="pt-tier" style="background:linear-gradient(135deg,${t.a},${t.b})">${t.name}</span>
      <h3 class="text-lg font-black text-white">${esc(b.name)}</h3>
      <p class="text-sm text-zinc-300">${esc(b.desc)}</p>
      ${b.got ? `<p class="text-xs font-bold text-emerald-400">Earned${b.date ? " " + esc(dateText(b.date)) : ""}</p>` : `<div class="w-full"><div class="pt-bar"><span style="width:${pct}%"></span></div><p class="text-xs text-zinc-400 mt-1.5">${esc(curText(b))} of ${esc(goalText(b))} · ${pct}%</p></div>`}
      ${b.got ? `<button type="button" class="pt-link" data-share-badge="${b.id}">Share this badge</button>` : ""}
      ${nx ? `<p class="text-[11px] text-zinc-500">Next in this line: ${esc(nx.name)}</p>` : '<p class="text-[11px] text-zinc-500">Top of this line.</p>'}</div>`);
  }
  /* unlock celebration: one medal at a time */
  let queue = [], showing = false;
  function showUnlock(list) { queue = queue.concat(list.slice(0, 5)); if (!showing) nextUnlock(); }
  function nextUnlock() {
    const b = queue.shift(); if (!b) { showing = false; return; } showing = true;
    const t = b.custom ? b : TIERS[b.tier], o = document.createElement("div"); o.id = "pt-unlock"; o.setAttribute("role", "dialog"); o.setAttribute("aria-label", b.custom ? "Reward" : "New badge");
    PT.__unlockCur = b;
    const chip = b.custom ? "" : `<span class="pt-tier" style="background:linear-gradient(135deg,${t.a},${t.b})">${t.name}</span>`;
    const shareBtn = b.custom ? (b.share ? '<button type="button" class="pt-link" data-share-card="1">Share</button>' : "") : `<button type="button" class="pt-link" data-share-badge="${b.id}">Share this badge</button>`;
    o.innerHTML = `<div class="pt-ucard"><div class="pt-rays" style="--g:${t.glow}"></div><span class="pt-ulabel">${esc(b.custom ? b.label : "New badge")}</span><div class="pt-ubig" style="--g:${t.glow}">${b.custom ? b.big : medal(b, 170)}</div>${chip}<h3 class="text-xl font-black text-white">${esc(b.name)}</h3><p class="text-sm text-zinc-300">${esc(b.desc)}</p>${[...Array(14)].map((_, i) => `<i class="pt-spark" style="--a:${i * 25.7}deg;--d:${(i % 5) * .08}s;background:${i % 2 ? t.a : t.b}"></i>`).join("")}<button type="button" id="pt-unlock-ok" class="pt-b go">${queue.length ? "Next" : "Nice!"}</button>${shareBtn}</div>`;
    document.body.appendChild(o);
    try { navigator.vibrate && navigator.vibrate(60); } catch (e) { }
    if (b.confetti && PT.confetti) PT.confetti();
    o.querySelector("#pt-unlock-ok").addEventListener("click", () => { o.remove(); nextUnlock(); });
  }
  PT.showBadgeUnlock = showUnlock;
  PT.badgeKit = { TIERS, medal, tierOf, lbl };
  const bcss = document.createElement("style");
  bcss.id = "pt-v2291b-css";
  bcss.textContent = `
    .pt-link { font-size: .72rem; font-weight: 700; color: rgb(var(--a400)); padding: .35rem .6rem; }
    #pt-unlock .pt-b { margin-top: .4rem; padding: .7rem 2.5rem; border-radius: .8rem; font-size: .85rem; font-weight: 800; background: rgb(var(--a600)); color: #fff; }
    .pt-bhead { display: flex; align-items: center; justify-content: space-between; gap: .75rem; }
    .pt-tcounts { display: flex; gap: .6rem; }
    .pt-tcount { display: inline-flex; align-items: center; gap: .3rem; font-size: .7rem; font-weight: 800; color: rgb(var(--z300)); }
    .pt-tcount i { width: .8rem; height: .8rem; border-radius: 50%; display: inline-block; }
    .pt-next { display: flex; align-items: center; gap: .8rem; width: 100%; padding: .7rem .8rem; border-radius: .9rem; background: linear-gradient(135deg, rgb(var(--z950)), rgb(var(--z900))); border: 1px solid rgb(var(--z800)); }
    .pt-cats { display: flex; gap: .4rem; overflow-x: auto; padding-bottom: .15rem; scrollbar-width: none; }
    .pt-cats::-webkit-scrollbar { display: none; }
    .pt-cats .pt-opt { flex: 0 0 auto; }
    .pt-bgrid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .5rem; }
    .pt-badge { display: flex; flex-direction: column; align-items: center; gap: .2rem; padding: .65rem .3rem .55rem; border-radius: .9rem; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); min-width: 0; }
    .pt-badge:not(.off) { background: linear-gradient(180deg, rgb(var(--z900)), rgb(var(--z950))); }
    .pt-badge.off { opacity: 1; filter: none; }
    .pt-bn { font-size: .68rem; font-weight: 800; line-height: 1.15; color: rgb(var(--z100)); text-align: center; min-height: 1.6em; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .pt-badge.off .pt-bn { color: rgb(var(--z400)); }
    .pt-bs { font-size: .6rem; font-weight: 600; color: rgb(var(--z500)); text-align: center; }
    .pt-medal.on { filter: drop-shadow(0 0 7px var(--g)); }
    .pt-bdetail { display: flex; flex-direction: column; align-items: center; gap: .6rem; text-align: center; padding: .25rem 0 .5rem; }
    .pt-tier { padding: .15rem .65rem; border-radius: 9999px; font-size: .65rem; font-weight: 900; letter-spacing: .08em; text-transform: uppercase; color: #18181b; }
    #pt-unlock { position: fixed; inset: 0; z-index: 80; display: flex; align-items: center; justify-content: center; padding: 1.5rem; background: rgb(0 0 0 / .78); backdrop-filter: blur(6px); animation: pt-fade .25s ease-out; }
    .pt-ucard { position: relative; width: 100%; max-width: 20rem; display: flex; flex-direction: column; align-items: center; gap: .6rem; text-align: center; padding: 1.5rem 1.25rem 1.25rem; border-radius: 1.5rem; background: rgb(var(--z900)); border: 1px solid rgb(var(--z700)); overflow: hidden; animation: pt-pop .5s cubic-bezier(.2,1.4,.4,1); }
    .pt-ulabel { font-size: .7rem; font-weight: 900; letter-spacing: .18em; text-transform: uppercase; color: rgb(var(--a400)); }
    .pt-ubig { animation: pt-medalin .8s cubic-bezier(.2,1.5,.4,1) .1s both; filter: drop-shadow(0 0 18px var(--g)); }
    .pt-rays { position: absolute; left: 50%; top: 8.5rem; width: 22rem; height: 22rem; margin: -11rem 0 0 -11rem; background: conic-gradient(from 0deg, transparent 0 8%, var(--g) 10%, transparent 12% 20%, var(--g) 22%, transparent 24% 32%, var(--g) 34%, transparent 36% 44%, var(--g) 46%, transparent 48% 56%, var(--g) 58%, transparent 60% 68%, var(--g) 70%, transparent 72% 80%, var(--g) 82%, transparent 84% 92%, var(--g) 94%, transparent 96%); opacity: .35; border-radius: 50%; animation: pt-spin 14s linear infinite; -webkit-mask: radial-gradient(circle, #000 15%, transparent 68%); mask: radial-gradient(circle, #000 15%, transparent 68%); pointer-events: none; }
    .pt-ucard > *:not(.pt-rays):not(.pt-spark) { position: relative; z-index: 1; }
    .pt-spark { position: absolute; left: 50%; top: 8.5rem; width: .45rem; height: .45rem; border-radius: 50%; opacity: 0; animation: pt-burst .9s ease-out var(--d) both; }
    @keyframes pt-fade { from { opacity: 0; } }
    @keyframes pt-pop { from { transform: scale(.85); opacity: 0; } }
    @keyframes pt-medalin { from { transform: scale(.2) rotate(-40deg); opacity: 0; } }
    @keyframes pt-spin { to { transform: rotate(360deg); } }
    @keyframes pt-burst { 0% { transform: rotate(var(--a)) translateY(0); opacity: 1; } 100% { transform: rotate(var(--a)) translateY(-7rem); opacity: 0; } }
    @media (prefers-reduced-motion: reduce) { .pt-ucard, .pt-ubig, .pt-spark, .pt-rays, #pt-unlock { animation: none !important; } .pt-spark { display: none; } }
  `;
  document.head.appendChild(bcss);

  /* ---- lift goals */
  function weeklyBest(a, name) {
    const m = new Map();
    S(a).forEach(s => { const e = (s.ex || []).find(x => x.name === name); if (!e) return; let b = 0; (e.sets || []).forEach(st => { if (st.t !== "W") b = Math.max(b, a.setE1rm(name, st, s.date) || 0); }); if (b > 0) { const w = mondayOf(sessTime(s)); m.set(w, Math.max(m.get(w) || 0, toUser(b, s.unit))); } });
    return [...m.entries()].sort((x, y) => x[0] - y[0]);
  }
  /** { cur, slope (per week), weeks, date } */
  PT.goalProjection = function (a, name, target) {
    const pts = weeklyBest(a, name).filter(p => p[0] >= Date.now() - 84 * DAY), cur = (a.prs && a.prs[name]) || (pts.length ? Math.max(...pts.map(p => p[1])) : 0);
    let slope = 0;
    if (pts.length >= 3) { const xs = pts.map(p => (p[0] - pts[0][0]) / (7 * DAY)), ys = pts.map(p => p[1]), n = xs.length, mx = xs.reduce((x, y) => x + y, 0) / n, my = ys.reduce((x, y) => x + y, 0) / n; const den = xs.reduce((t, x) => t + (x - mx) ** 2, 0); slope = den ? xs.reduce((t, x, i) => t + (x - mx) * (ys[i] - my), 0) / den : 0; }
    const out = { cur, slope, weeks: null, date: null, done: cur >= target };
    if (!out.done && slope > 0.05) { out.weeks = Math.ceil((target - cur) / slope); if (out.weeks <= 260) out.date = new Date(Date.now() + out.weeks * 7 * DAY); }
    return out;
  };
  function goalsHtml(a) {
    const gs = Array.isArray(a.settings.liftGoals) ? a.settings.liftGoals : [], u = unitKg() ? "kg" : "lb";
    const rows = gs.map((g, i) => {
      const p = PT.goalProjection(a, g.name, g.target), pc = Math.max(0, Math.min(100, Math.round(p.cur / g.target * 100)));
      const when = p.done ? "🎉 Reached!" : p.date ? `On track for about ${PT.fmtDate(dsOf(p.date.getTime()), { month: "short", day: "numeric", year: "numeric" })} (${p.weeks} week${p.weeks === 1 ? "" : "s"})` : "Not trending up yet. Keep logging.";
      return `<div class="rounded-xl bg-zinc-950 border border-zinc-800 p-2.5 space-y-1.5"><div class="flex items-center justify-between gap-2"><span class="text-xs font-bold text-white min-w-0">${esc(g.name)}</span><button type="button" data-goal-del="${i}" class="text-[11px] text-zinc-500 tap-active" aria-label="Remove goal">✕</button></div>
        <div class="pt-bar"><span style="width:${pc}%"></span></div><span class="block text-[11px] text-zinc-300">${fmt(p.cur)} of ${fmt(g.target)} ${u} est. 1RM · ${pc}%</span><span class="block text-[11px] ${p.done ? "text-emerald-400" : "text-zinc-400"}">${when}</span></div>`;
    }).join("");
    return `${rows || '<p class="text-xs text-zinc-400">Pick a lift and a target and see roughly when you will get there, based on your last 12 weeks.</p>'}<div><button type="button" class="pt-b go" id="pt-goal-add">＋ Add a goal</button></div>`;
  }
  function openGoal() {
    const a = A(), K = PT.kit, el = K.sheet("pt-goal-sheet", 55);
    const names = Object.keys(a.prs || {}).sort((x, y) => a.prs[y] - a.prs[x]).slice(0, 40);
    if (!names.length) { a.toast("Log a few workouts first, then set a goal"); return; }
    const c = K.openSheet(el, `${K.head("Lift goal", "Estimated 1RM you want to reach.")}
      <div>${lab("Lift")}<select id="pt-goal-name">${names.map(n => `<option value="${esc(n)}">${esc(n)} · now ${fmt(a.prs[n])}</option>`).join("")}</select></div>
      <div>${lab("Target (" + (unitKg() ? "kg" : "lb") + ")")}<input id="pt-goal-target" type="number" inputmode="decimal"></div>
      <div class="sticky bottom-[calc(-1.25rem-env(safe-area-inset-bottom,0px))] -mx-5 -mb-5 px-5 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] bg-zinc-900 border-t border-zinc-800"><button type="button" id="pt-goal-save" class="w-full py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold tap-active">Save goal</button></div>`);
    const sel = c.querySelector("#pt-goal-name"), tg = c.querySelector("#pt-goal-target");
    const def = () => { tg.value = String(Math.ceil(a.prs[sel.value] * 1.1 / 5) * 5); };
    def(); sel.addEventListener("change", def);
    c.querySelector("#pt-goal-save").addEventListener("click", () => {
      const t = parseFloat(tg.value); if (!(t > 0)) return;
      const l = Array.isArray(a.settings.liftGoals) ? a.settings.liftGoals : []; l.push({ name: sel.value, target: t }); a.settings.liftGoals = l; save(); K.closeSheet(el); a.renderProgressView();
    });
  }

  /* ---- training year (2.35.0: big month calendars, or a scrollable year strip) */
  function heatData(a) {
    const by = {};
    S(a).forEach(s => { const o = by[s.date] || (by[s.date] = { k: 0, v: 0, sets: 0, dur: 0, t: [], ids: [] }); o.k++; o.v += toLb(s.vol || 0, s.unit); o.sets += s.sets || 0; o.dur += s.dur || 0; o.t.push(s.dtitle || "Workout"); o.ids.push(s.id); });
    const vals = Object.values(by).map(o => o.v).filter(v => v > 0).sort((x, y) => x - y), q = f => vals.length ? vals[Math.min(vals.length - 1, Math.floor(vals.length * f))] : 0;
    const q25 = q(0.25), q50 = q(0.5), q75 = q(0.75);
    const lvl = o => { if (!o) return 0; if (!(o.v > 0)) return 1; return o.v >= q75 ? 4 : o.v >= q50 ? 3 : o.v >= q25 ? 2 : 1; };
    return { by, lvl };
  }
  const HOP = [0, 0.4, 0.6, 0.82, 1];
  const heatFill = L => L ? `rgb(var(--a500) / ${HOP[L]})` : "rgb(var(--z800))";
  const monthName = (y, m, long) => new Date(y, m, 1).toLocaleString("en", { month: long ? "long" : "short" });
  function heatStats(by, today) {
    let days = 0, workouts = 0, run = 0, best = 0; const months = {};
    for (let i = 364; i >= 0; i--) {
      const dt = new Date(today); dt.setDate(dt.getDate() - i); const o = by[PT.ds(dt)];
      if (o) { days++; workouts += o.k; run++; if (run > best) best = run; const k = dt.getFullYear() + "-" + dt.getMonth(); months[k] = (months[k] || 0) + 1; } else run = 0;
    }
    let bm = null; Object.keys(months).forEach(k => { if (!bm || months[k] > months[bm]) bm = k; });
    return { days, workouts, run: best, bestMonth: bm ? { label: monthName(+bm.split("-")[0], +bm.split("-")[1]) + " " + bm.split("-")[0].slice(2), n: months[bm] } : null };
  }
  function calMonth(by, lvl, y, m, today) {
    const n = new Date(y, m + 1, 0).getDate(), lead = (new Date(y, m, 1).getDay() + 6) % 7;
    let days = 0, sets = 0, cells = "";
    for (let i = 0; i < lead; i++) cells += '<span class="pt-cd pt-blank"></span>';
    for (let d = 1; d <= n; d++) {
      const dt = new Date(y, m, d), ds = PT.ds(dt), o = by[ds], fut = dt > today, isT = dt.getTime() === today.getTime();
      if (fut) { cells += `<span class="pt-cd fut"><b>${d}</b></span>`; continue; }
      if (o) { days++; sets += o.sets; }
      cells += `<button type="button" data-hd="${ds}" aria-label="${monthName(y, m)} ${d}${o ? ", trained" : ", rest day"}" class="pt-cd${o ? " on" : ""}${isT ? " today" : ""}"${o ? ` style="background:${heatFill(lvl(o))}"` : ""}><b>${d}</b>${o && o.k > 1 ? `<i>×${o.k}</i>` : ""}</button>`;
    }
    return `<div class="pt-cm"><div class="pt-cm-h"><span>${monthName(y, m, true)} ${y}</span><span>${days ? `${days} day${days === 1 ? "" : "s"} · ${fmt(sets)} sets` : "Rest month"}</span></div>
      <div class="pt-cdow">${["M", "T", "W", "T", "F", "S", "S"].map(x => `<span>${x}</span>`).join("")}</div><div class="pt-cgrid">${cells}</div></div>`;
  }
  function yearStrip(by, lvl, today) {
    const P = 24, C = 20, start = new Date(mondayOf(today.getTime())); start.setDate(start.getDate() - 52 * 7);
    let cells = "", months = "";
    const tds = PT.ds(today);
    for (let w = 0; w < 53; w++) {
      for (let d = 0; d < 7; d++) {
        const dt = new Date(start); dt.setDate(start.getDate() + w * 7 + d);
        if (dt.getDate() === 1 && (w > 0 || d === 0)) months += `<text x="${w * P}" y="12" font-size="11" font-weight="700" style="fill:rgb(var(--z400))">${monthName(dt.getFullYear(), dt.getMonth())}</text>`;
        if (dt > today) continue;
        const ds = PT.ds(dt);
        cells += `<rect data-hd="${ds}" class="pt-hr${ds === tds ? " today" : ""}" x="${w * P}" y="${d * P + 18}" width="${C}" height="${C}" rx="5" style="fill:${heatFill(lvl(by[ds]))}"/>`;
      }
    }
    const W = 53 * P, H = 18 + 7 * P;
    return `<div class="pt-heat-y"><div class="pt-heat-dow">${["Mon", "", "Wed", "", "Fri", "", ""].map(t => `<span>${t}</span>`).join("")}</div><div class="pt-heat-scroll" data-scrollend="1"><svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Training days over the last year">${months}${cells}</svg></div></div>`;
  }
  function heatHtml(a) {
    const { by, lvl } = heatData(a), today = new Date(); today.setHours(0, 0, 0, 0);
    const st = heatStats(by, today), mode = a.__heatMode === "year" ? "year" : "cal";
    const tile = (l, v, sub) => `<div class="pt-heat-tile"><span>${l}</span><b>${v}</b><em>${sub}</em></div>`;
    const tiles = `<div class="pt-heat-tiles">${tile("Active days", st.days, "last 12 months")}${tile("Longest run", st.run + (st.run === 1 ? " day" : " days"), "in a row")}${tile("Best month", st.bestMonth ? st.bestMonth.n + " days" : "-", st.bestMonth ? st.bestMonth.label : "no workouts yet")}</div>`;
    const toggle = `<div class="flex gap-2">${chip('data-heatm="cal"', "Calendar", mode === "cal")}${chip('data-heatm="year"', "Year view", mode === "year")}</div>`;
    let body;
    if (mode === "year") body = yearStrip(by, lvl, today);
    else {
      const count = Math.min(12, a.__heatMonths || 3); let list = "";
      for (let i = 0; i < count; i++) { const d = new Date(today.getFullYear(), today.getMonth() - i, 1); list += calMonth(by, lvl, d.getFullYear(), d.getMonth(), today); }
      body = `<div class="pt-cms">${list}</div>${count < 12 ? `<button type="button" class="pt-b w-full" data-heatmore="1">Show earlier months</button>` : ""}`;
    }
    const legend = `<div class="pt-heat-leg"><span>Less</span>${[0, 1, 2, 3, 4].map(L => `<i style="background:${heatFill(L)}"></i>`).join("")}<span>More volume</span></div>`;
    return `${tiles}${toggle}${body}${legend}<p id="pt-heat-note" class="pt-heat-note">Tap a day to open that workout.</p>`;
  }
  /* the year strip opens scrolled to today (the right-hand end) */
  let heatIO = null;
  function pinHeat(root) {
    if (!root || !("IntersectionObserver" in window)) return;
    heatIO = heatIO || new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting && e.target.dataset.pinned !== "1") { e.target.scrollLeft = e.target.scrollWidth; e.target.dataset.pinned = "1"; } }));
    root.querySelectorAll("[data-scrollend]").forEach(el => heatIO.observe(el));
  }
  (function () {
    const st = document.createElement("style"); st.id = "pt-v235-heat-css";
    st.textContent = `
      .pt-heat-tiles { display: grid; grid-template-columns: repeat(3, 1fr); gap: .5rem; }
      .pt-heat-tile { background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); border-radius: .85rem; padding: .6rem .7rem; min-width: 0; }
      .pt-heat-tile span { display: block; font-size: .58rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: rgb(var(--z500)); }
      .pt-heat-tile b { display: block; margin-top: .2rem; font-size: 1.05rem; line-height: 1.1; font-weight: 800; color: #fff; }
      .pt-heat-tile em { display: block; margin-top: .15rem; font-style: normal; font-size: .62rem; color: rgb(var(--z500)); }
      .pt-cms { display: flex; flex-direction: column; gap: .75rem; }
      .pt-cm { background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); border-radius: 1rem; padding: .75rem; }
      .pt-cm-h { display: flex; align-items: baseline; justify-content: space-between; gap: .5rem; margin-bottom: .55rem; }
      .pt-cm-h span:first-child { font-size: .95rem; font-weight: 800; color: #fff; }
      .pt-cm-h span:last-child { font-size: .68rem; color: rgb(var(--z400)); }
      .pt-cdow, .pt-cgrid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: .28rem; }
      .pt-cdow span { text-align: center; font-size: .62rem; font-weight: 700; color: rgb(var(--z500)); padding-bottom: .25rem; }
      .pt-cd { position: relative; aspect-ratio: 1; border-radius: .7rem; background: rgb(var(--z900)); border: 1px solid transparent; display: flex; flex-direction: column; align-items: center; justify-content: center; color: rgb(var(--z400)); line-height: 1; padding: 0; }
      .pt-cd b { font-size: .82rem; font-weight: 700; }
      .pt-cd i { font-style: normal; font-size: .55rem; margin-top: .12rem; opacity: .9; }
      .pt-cd.pt-blank { background: none; }
      .pt-cd.on { color: #fff; border-color: rgb(var(--a500) / .4); }
      .pt-cd.on b { font-weight: 800; }
      .pt-cd.fut { opacity: .3; }
      .pt-cd.today { box-shadow: 0 0 0 2px rgb(var(--a400)); }
      .pt-cd.sel { box-shadow: 0 0 0 2px #fff; }
      .pt-heat-y { display: flex; gap: .4rem; }
      .pt-heat-dow { flex: none; padding-top: 18px; display: flex; flex-direction: column; gap: 4px; }
      .pt-heat-dow span { height: 20px; line-height: 20px; width: 1.7rem; font-size: .62rem; font-weight: 700; color: rgb(var(--z500)); }
      .pt-heat-scroll { flex: 1; min-width: 0; overflow-x: auto; -webkit-overflow-scrolling: touch; padding-bottom: .4rem; }
      .pt-heat-scroll svg { display: block; max-width: none; }
      .pt-hr { cursor: pointer; }
      .pt-hr.today { stroke: rgb(var(--a400)); stroke-width: 2; }
      .pt-hr.sel { stroke: #fff; stroke-width: 2; }
      .pt-heat-leg { display: flex; align-items: center; justify-content: flex-end; gap: .3rem; font-size: .62rem; color: rgb(var(--z500)); }
      .pt-heat-leg i { width: .85rem; height: .85rem; border-radius: .25rem; display: inline-block; }
      .pt-heat-note { font-size: .75rem; color: rgb(var(--z300)); min-height: 1rem; }
    `;
    document.head.appendChild(st);
  })();

  /* ---- PR timeline */
  function prsHtml(a) {
    const limit = a.__prLimit || 12, ev = [];
    S(a).slice().sort((x, y) => sessTime(y) - sessTime(x)).forEach(s => { const m = bestE1(a, s); (s.prs || []).forEach(n => ev.push({ s, n, v: toUser(m[n] || 0, s.unit) })); });
    if (!ev.length) return '<p class="text-xs text-zinc-400">New personal records show up here as you set them.</p>';
    let html = "", last = "";
    ev.slice(0, limit).forEach(e => {
      const mo = PT.fmtDate(e.s.date, { month: "long", year: "numeric" }); if (mo !== last) { last = mo; html += `<span class="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 pt-1">${esc(mo)}</span>`; }
      html += `<div class="flex items-center justify-between gap-2 text-xs"><span class="min-w-0 text-zinc-200">🏅 ${esc(e.n)}</span><span class="shrink-0 font-mono text-amber-300">${e.v ? fmt(e.v) + " " + (unitKg() ? "kg" : "lb") : ""} <span class="text-zinc-500">${esc(PT.fmtDate(e.s.date, { month: "short", day: "numeric" }))}</span></span></div>`;
    });
    if (ev.length > limit) html += `<button type="button" class="pt-b" id="pt-pr-more">Show more (${ev.length - limit} older)</button>`;
    return html;
  }

  /* ---- family leaderboard */
  const weekId = t => dsOf(mondayOf(t));
  const myEntry = (a, weekT) => { const st = weekStats(a, mondayOf(weekT), mondayOf(weekT) + 7 * DAY); return { n: a.settings.myName || "Me", w: weekId(weekT), k: st.k, v: Math.round(st.v), s: st.s, p: st.p }; };
  const encode = o => "PT1." + btoa(unescape(encodeURIComponent(JSON.stringify(o))));
  const decode = t => { try { const m = String(t).trim().match(/PT1\.[A-Za-z0-9+/=_-]+/); if (!m) return null; const o = JSON.parse(decodeURIComponent(escape(atob(m[0].slice(4))))); return o && o.n && o.w ? { n: String(o.n).slice(0, 24), w: String(o.w), k: +o.k || 0, v: +o.v || 0, s: +o.s || 0, p: +o.p || 0 } : null; } catch (e) { return null; } };
  PT.familyCode = (a, weekT) => encode(myEntry(a || A(), weekT || Date.now()));
  PT.familyAdd = function (text, appArg) {
    const a = appArg || A(); let n = 0;
    String(text || "").split(/\s+/).forEach(tok => { const e = decode(tok); if (!e) return; const l = Array.isArray(a.settings.family) ? a.settings.family : []; const i = l.findIndex(x => x.n === e.n && x.w === e.w); if (i >= 0) l[i] = e; else l.push(e); a.settings.family = l.slice(-80); n++; });
    if (n) save(); return n;
  };
  function familyHtml(a) {
    const wk = a.__famWeek === "last" ? weekId(Date.now() - 7 * DAY) : weekId(Date.now()), me = myEntry(a, a.__famWeek === "last" ? Date.now() - 7 * DAY : Date.now());
    const others = (Array.isArray(a.settings.family) ? a.settings.family : []).filter(x => x.w === wk && x.n !== me.n);
    const rows = [Object.assign({ me: true }, me)].concat(others).sort((x, y) => y.k - x.k || y.v - x.v);
    const V = x => fmt(unitKg() ? x / LB : x) + (unitKg() ? " kg" : " lb");
    return `<div class="flex gap-1.5">${chip('data-fw="this"', "This week", a.__famWeek !== "last")}${chip('data-fw="last"', "Last week", a.__famWeek === "last")}</div>
      <div class="space-y-1">${rows.map((r, i) => `<div class="flex items-center gap-2 rounded-xl ${r.me ? "bg-zinc-800" : "bg-zinc-950"} border border-zinc-800 px-2.5 py-2 text-xs"><span class="w-5 text-center font-black ${i === 0 ? "text-amber-300" : "text-zinc-500"}">${i + 1}</span><span class="min-w-0 flex-1 truncate font-bold text-white">${esc(r.n)}${r.me ? " (you)" : ""}</span><span class="font-mono text-zinc-300">${r.k}×</span><span class="font-mono text-zinc-400 w-20 text-right">${V(r.v)}</span><span class="font-mono text-amber-300 w-8 text-right">${r.p}🏅</span>${r.me ? '<span class="w-4"></span>' : `<button type="button" data-fam-del="${esc(r.n)}" class="text-zinc-500 tap-active w-4" aria-label="Remove ${esc(r.n)}">✕</button>`}</div>`).join("")}</div>
      <p class="text-[10px] text-zinc-500">Workouts, volume, PRs. Ranked by workouts, then volume.</p>
      <input type="text" id="pt-fam-name" placeholder="Your name for the board" value="${esc(a.settings.myName || "")}" maxlength="24" aria-label="Your name">
      <div class="flex gap-2"><button type="button" class="pt-b go" id="pt-fam-copy">Copy my code</button><button type="button" class="pt-b" id="pt-fam-share">Share my code</button></div>
      <input type="text" id="pt-fam-paste" placeholder="Paste a code from someone (PT1.…)" aria-label="Paste a code"><button type="button" class="pt-b" id="pt-fam-add">Add to the board</button>`;
  }

  /* ---- put it all on the Progress page */
  const OPEN = { report: true };
  const section = (id, icon, title, body) => `<details class="pt-pg" id="pt-pg-${id}" ${OPEN[id] ? "open" : ""}><summary><span class="text-xs font-bold text-white">${icon} ${title}</span><span class="pt-chev">›</span></summary><div>${body}</div></details>`;
  function drawExtras(a) {
    const root = $("progress-body"); if (!root) return;
    let box = $("pt-pg-extra");
    if (!box) { box = document.createElement("div"); box.id = "pt-pg-extra"; box.className = "space-y-3"; root.appendChild(box); }
    box.innerHTML = section("report", "📊", "Weekly report card", reportHtml(a)) + section("badges", "🏅", "Badges", badgesHtml(a)) + section("goals", "🎯", "Lift goals", goalsHtml(a))
      + section("heat", "🗓", "Training year", heatHtml(a)) + section("prs", "📈", "PR timeline", prsHtml(a)) + section("fam", "👨‍👩‍👦", "Family board", familyHtml(a));
    box.querySelectorAll("details").forEach(d => d.addEventListener("toggle", () => { OPEN[d.id.replace("pt-pg-", "")] = d.open; }));
    pinHeat(box);
  }
  const oPV = proto.renderProgressView;
  proto.renderProgressView = function () {
    const r = oPV.apply(this, arguments);
    try { drawExtras(this); } catch (e) { console.error("PulseTrack progress extras 2.28", e); }
    return r;
  };

  document.addEventListener("click", async e => {
    const a = A(); if (!a || !e.target.closest) return;
    const t = id => e.target.closest("#" + id);
    const bc = e.target.closest("[data-bc]"); if (bc) { a.__bdgCat = bc.dataset.bc; OPEN.badges = true; a.renderProgressView(); return; }
    const bd = e.target.closest("[data-bid]"); if (bd) { openBadge(bd.dataset.bid); return; }
    if (t("pt-report-share")) { shareReport(); return; }
    if (t("pt-goal-add")) { openGoal(); return; }
    const gd = e.target.closest("[data-goal-del]");
    if (gd) { a.settings.liftGoals.splice(parseInt(gd.dataset.goalDel, 10), 1); save(); a.renderProgressView(); return; }
    const hm = e.target.closest("[data-heatm]"); if (hm) { a.__heatMode = hm.dataset.heatm; OPEN.heat = true; a.renderProgressView(); return; }
    if (e.target.closest("[data-heatmore]")) { a.__heatMonths = (a.__heatMonths || 3) + 3; OPEN.heat = true; a.renderProgressView(); return; }
    const ho = e.target.closest("[data-heat-open]"); if (ho) { const id = ho.dataset.heatOpen; try { a.closeSheet(); } catch (x) { } setTimeout(() => { try { a.openSessionSheet(id); } catch (x) { } }, 150); return; }
    const hd = e.target.closest("[data-hd]");
    if (hd) {
      const ds = hd.dataset.hd, ss = S(a).filter(s => s.date === ds), n = $("pt-heat-note"), label = PT.fmtDate(ds, { weekday: "short", month: "short", day: "numeric" });
      document.querySelectorAll("#pt-pg-heat .sel").forEach(x => x.classList.remove("sel")); hd.classList.add("sel");
      if (n) n.textContent = label + (ss.length ? " · " + ss.map(s => s.dtitle || "Workout").join(", ") : " · rest day");
      if (ss.length === 1) { try { a.openSessionSheet(ss[0].id); } catch (x) { } }
      else if (ss.length > 1) {
        const u = unitKg() ? "kg" : "lb";
        a.openSheet(label, ss.length + " workouts", `<div class="space-y-2">${ss.map(s => `<button type="button" data-heat-open="${esc(s.id)}" class="w-full text-left p-3 rounded-xl bg-zinc-950 border border-zinc-800 tap-active"><span class="block text-sm font-bold text-white">${esc(s.dtitle || "Workout")}</span><span class="block text-[11px] text-zinc-400 mt-0.5">${s.sets || 0} set${(s.sets || 0) === 1 ? "" : "s"} · ${fmt(toUser(s.vol || 0, s.unit))} ${u}${s.dur ? " · " + esc(PT.fmtDur(s.dur)) : ""}</span></button>`).join("")}</div>`, "");
      }
      return;
    }
    if (t("pt-pr-more")) { a.__prLimit = (a.__prLimit || 12) + 20; a.renderProgressView(); return; }
    const fw = e.target.closest("[data-fw]");
    if (fw) { a.__famWeek = fw.dataset.fw; a.renderProgressView(); return; }
    const fd = e.target.closest("[data-fam-del]");
    if (fd) { a.settings.family = (a.settings.family || []).filter(x => x.n !== fd.dataset.famDel); save(); a.renderProgressView(); return; }
    const nm = () => { const i = $("pt-fam-name"); if (i && i.value.trim()) { a.settings.myName = i.value.trim().slice(0, 24); save(); } };
    if (t("pt-fam-copy") || t("pt-fam-share")) {
      nm(); const code = PT.familyCode(a, a.__famWeek === "last" ? Date.now() - 7 * DAY : Date.now());
      if (t("pt-fam-share") && navigator.share) { try { await navigator.share({ title: "PulseTrack code", text: code }); return; } catch (x) { if (x && x.name === "AbortError") return; } }
      try { await navigator.clipboard.writeText(code); a.toast("Code copied. Send it to your family."); } catch (x) { await PT.alert("Copy this code:\n\n" + code); }
      a.renderProgressView(); return;
    }
    if (t("pt-fam-add")) { nm(); const n = PT.familyAdd(($("pt-fam-paste") || {}).value, a); a.toast(n ? `Added ${n} ${n === 1 ? "person" : "people"}` : "That doesn't look like a PulseTrack code"); a.renderProgressView(); }
  });

  /* ============================================================== Settings: injuries */
  function drawInj() {
    const a = A(); if (!a) return; let box = $("pt-inj-set");
    if (!box) { const ref = $("pt-sched-set") || $("pt-hiddenex") || $("pt-gym-row") || $("pt-textsize"); if (!ref) return; box = document.createElement("div"); box.id = "pt-inj-set"; box.className = "mt-3"; ref.insertAdjacentElement("afterend", box); }
    const inj = injuries(a);
    box.innerHTML = `<span class="block text-xs font-bold text-zinc-100">Injuries</span><span class="block text-[11px] text-zinc-400 mb-1.5">Built workouts leave out exercises that load these joints.</span><div class="flex flex-wrap gap-1.5">${Object.keys(INJ).map(k => chip(`data-fi="${k}"`, INJ[k].label, inj.includes(k))).join("")}</div>`;
  }
  const oEx = proto.renderSettingsExtras;
  proto.renderSettingsExtras = async function () { const r = oEx ? await oEx.apply(this, arguments) : undefined; try { drawInj(); } catch (e) { console.error(e); } return r; };
  setTimeout(() => { try { checkBadges(A(), false); } catch (e) { } }, 2500);
})();
  