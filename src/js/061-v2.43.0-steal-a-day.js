
/* =====================================================================
 * PulseTrack 2.43.0: steal a day.
 *  - Programs screen → "Steal a day": pick a muscle (Chest, Back, Shoulders, Arms, Quads, Hams & glutes, Calves, Abs), or search an
 *    athlete or program, and see the best days for it from every program in the library plus your own. Days are ranked by how many
 *    of their hard sets hit that muscle. Tap one to see its exercises, then:
 *      Do it now        a one-off Freestyle workout with those exercises (your program is not changed),
 *      Add to my current program   a new day at the end of it,
 *      Add to one of my programs   a new day at the end of a program you made,
 *      Start a new program         a program of your own with just this day.
 *  - The same sheet opens from: a program's ⋯ menu ("Steal a day from it"), the workout screen's ⋯ More ("Steal this day…"), and
 *    the Weak points card on Progress ("Find a day for it", already set to your weakest muscle group).
 *  - Nothing in a built-in program is ever edited. Days are copied with new ids and no week numbers.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined" || !PT.kit) return;
  const proto = ApplicationUI.prototype, A = () => window.app, K = PT.kit, esc = K.esc, $ = id => document.getElementById(id);
  const FREESTYLE = "freestyle";
  const CHIPS = [
    ["chest", "Chest", ["chest"]], ["back", "Back", ["back", "lowerback"]], ["shoulders", "Shoulders", ["shoulders", "traps"]],
    ["arms", "Arms", ["biceps", "triceps", "forearms"]], ["quads", "Quads", ["quads"]], ["hams", "Hams & glutes", ["hamstrings", "glutes"]],
    ["calves", "Calves", ["calves"]], ["abs", "Abs", ["abs"]]
  ];
  const RLAB = { chest: "Chest", back: "Back", lowerback: "Lower back", shoulders: "Shoulders", traps: "Traps", biceps: "Biceps", triceps: "Triceps", forearms: "Forearms", quads: "Quads", hamstrings: "Hamstrings", glutes: "Glutes", calves: "Calves", abs: "Abs" };
  const EX_KEYS = ["name", "sets", "reps", "restSeconds", "restAuto", "type", "notes", "link", "workSeconds"];
  const norm = s => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const MAX = 30;

  /** a weak-point group name ("Chest", "Legs", "Core"...) or a body-map region → one of the chip keys */
  function chipFor(x) {
    const s = norm(x);
    if (/chest|pec/.test(s)) return "chest";
    if (/back|lat|lower/.test(s)) return "back";
    if (/shoulder|delt|trap/.test(s)) return "shoulders";
    if (/arm|bicep|tricep|forearm/.test(s)) return "arms";
    if (/ham|glute/.test(s)) return "hams";
    if (/calf|calves/.test(s)) return "calves";
    if (/abs|core/.test(s)) return "abs";
    if (/leg|quad/.test(s)) return "quads";
    return "";
  }

  /* ---------------------------------------------------------------- what a day trains */
  const PROF = new WeakMap();
  function profile(day) {
    let p = PROF.get(day); if (p) return p;
    const by = {}; let total = 0;
    (day.exercises || []).forEach(e => {
      let regs = {}; try { regs = PT.regionsFor(e.name, false) || {}; } catch (x) { regs = {}; }
      const r = Object.keys(regs)[0]; if (!r) return;
      const n = Math.max(0, e.sets | 0); by[r] = (by[r] || 0) + n; total += n;
    });
    p = { by, total }; PROF.set(day, p); return p;
  }
  const cleanTitle = t => String(t || "Day").replace(/^\s*\[W[\d\s\-–&,]+\]\s*/i, "").replace(/^\s*Week\s+\d+\s*[·\-–:]\s*/i, "").replace(/^\s*Phase\s+\d+\s*[·\-–:]\s*/i, "").replace(/^\s*Day\s+\d+\s*[:\-–]\s*/i, "").trim() || "Day";
  function whoOf(p) { return p && p.pro ? p.pro : ""; }

  /** every day worth stealing: the whole built-in library plus the programs you made, one copy of each distinct day */
  function sources() {
    const a = A(), out = [], seenP = new Set();
    const add = (p, mine) => {
      if (!p || !Array.isArray(p.days) || p.id === FREESTYLE) return;
      const keys = new Set();
      p.days.forEach(d => {
        if (d.derived) return;                           // a progressed copy of a day (weeks 5+ of a longer program): the plain day is already listed
        const ex = d.exercises || []; if (ex.length < 3) return;
        const key = ex.map(e => e.name + "×" + e.sets).join("|"); if (keys.has(key)) return; keys.add(key);
        out.push({ p, d, mine });
      });
    };
    const shipped = builtinIds();
    (typeof BUILTIN_PROGRAMS !== "undefined" ? BUILTIN_PROGRAMS : []).forEach(p => { seenP.add(p.id); add(p, false); });
    ((a.data && a.data.programs) || []).forEach(p => { if (!seenP.has(p.id)) add(p, !shipped.has(p.id)); });
    return out;
  }

  function rank(list, st) {
    const chip = CHIPS.find(c => c[0] === st.chip), toks = norm(st.q).split(" ").filter(Boolean);
    let rows = list;
    if (st.prog) rows = rows.filter(x => x.p.id === st.prog);
    rows = rows.map(x => {
      const pr = profile(x.d); let sets = 0;
      if (chip) chip[2].forEach(r => { sets += pr.by[r] || 0; });
      const share = pr.total ? sets / pr.total : 0;
      return Object.assign({}, x, { pr, sets, share, score: sets * share });
    });
    if (chip) rows = rows.filter(x => x.sets >= 5 && x.share >= 0.4);
    if (toks.length) rows = rows.filter(x => { const blob = norm([x.p.title, whoOf(x.p), x.d.title, (x.p.tags || []).join(" ")].join(" ")); return toks.every(t => blob.includes(t)); });
    if (chip) rows.sort((a, b) => b.score - a.score);
    return rows;
  }
  const focusLine = pr => Object.entries(pr.by).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([r, n]) => `${RLAB[r] || r} ${n}`).join(" · ");

  /* ---------------------------------------------------------------- copying a day */
  function titleFor(src) {
    let t = cleanTitle(src.d.title);
    const s = PT.sessionOf && PT.sessionOf(src.d.title);
    if (s && s.topic) t = s.topic;
    const who = whoOf(src.p), last = who ? who.split(" ").pop() : "";
    if (last && !norm(t).includes(norm(last))) t += " (" + last + ")";
    return t.slice(0, 64);
  }
  function cloneDay(src, dayNumber) {
    const base = Date.now().toString(36) + Math.floor(Math.random() * 1296).toString(36);
    const exs = (src.d.exercises || []).map((e, i) => {
      const o = { id: `st_${base}_${i}` };
      EX_KEYS.forEach(k => { if (e[k] !== undefined && e[k] !== null && e[k] !== "") o[k] = k === "reps" ? String(e[k]) : e[k]; });
      if (!(o.sets > 0)) o.sets = 3;
      if (!o.reps) o.reps = "10";
      if (typeof o.restSeconds !== "number") o.restSeconds = parseInt(o.restSeconds, 10) || 60;
      return o;
    });
    if (exs.length && exs[exs.length - 1].link) delete exs[exs.length - 1].link;
    return { dayNumber, title: titleFor(src), estimatedMinutes: src.d.estimatedMinutes || 45, exercises: exs };
  }
  /** programs that ship with the app: the whole library, plus the one inside the app itself (6 Weeks to Massive Arms) */
  const builtinIds = () => {
    const s = new Set((typeof BUILTIN_PROGRAMS !== "undefined" ? BUILTIN_PROGRAMS : []).map(p => p.id));
    s.add("kaged_massive_arms_6wk");   // (not read from DEFAULT_WORKOUT_DATA: on a fresh install the app edits that very object, so programs you add would count as shipped)
    return s;
  };
  const hasWeeks = p => !!(p && ((Array.isArray(p.weekPlan) && p.weekPlan.length) || p.weeks));
  const currentProgram = () => { const a = A(); let id = null; try { id = PT.currentProgramId && PT.currentProgramId(); } catch (e) { } return id ? (a.data.programs || []).find(p => p.id === id) || null : null; };
  const ownPrograms = () => { const b = builtinIds(); return (A().data.programs || []).filter(p => p.id !== FREESTYLE && !b.has(p.id) && !hasWeeks(p)); };

  function addDay(prog, src) {
    const a = A(); prog.days = prog.days || [];
    const nums = prog.days.map(d => d.dayNumber | 0), day = cloneDay(src, (nums.length ? Math.max(...nums) : 0) + 1);
    prog.days.push(day);
    if (!WorkoutStorage.setData(a.data)) { prog.days.pop(); a.toast("Could not save. Is your phone storage full?"); return null; }
    return day;
  }
  function freestyleHasProgress() {
    const a = A(), prog = (a.data.programs || []).find(p => p.id === FREESTYLE); if (!prog || !prog.days || !prog.days[0]) return false;
    const pre = `${prog.id}_d${prog.days[0].dayNumber}_`;
    return (prog.days[0].exercises || []).length > 0 && Object.keys(a.logs || {}).some(k => k.startsWith(pre) && (a.logs[k].completed || a.logs[k].weight || a.logs[k].reps));
  }
  function doNow(src) {
    const a = A();
    let prog = (a.data.programs || []).find(p => p.id === FREESTYLE);
    if (!prog) {
      prog = { id: FREESTYLE, title: "Freestyle Workouts", description: "Empty workouts you build on the fly. Add any exercise from the library.", tags: ["Custom"], days: [{ dayNumber: 1, title: "Freestyle", estimatedMinutes: 45, exercises: [] }] };
      a.data.programs.push(prog);
    }
    const day = prog.days[0];
    a.clearDayLogs(prog, day);
    const c = cloneDay(src, day.dayNumber);
    day.exercises = c.exercises; day.title = c.title; day.estimatedMinutes = c.estimatedMinutes; delete day.removed;
    WorkoutStorage.saveLogs(a.logs); WorkoutStorage.setData(a.data);
    a.activeProgram = prog; a.activeDay = day;
    AppStateMemory.saveActive(prog.id, day.dayNumber);
    a.showView("workout");
  }
  // an empty Freestyle workout afterwards should say "Freestyle" again, not the name of the day you stole last
  const oEmpty = proto.startEmptyWorkout;
  if (oEmpty) proto.startEmptyWorkout = function () {
    try { const p = ((this.data && this.data.programs) || []).find(x => x.id === FREESTYLE); if (p && p.days && p.days[0] && p.days[0].title !== "Freestyle") p.days[0].title = "Freestyle"; } catch (e) { }
    return oEmpty.apply(this, arguments);
  };

  /* ---------------------------------------------------------------- the sheet */
  let el = null, ST = { chip: "", q: "", prog: "", more: 0, rows: [], src: null, from: "finder", warn: false, pickMine: false };

  function finderHtml() {
    const p = ST.prog ? (A().data.programs || []).find(x => x.id === ST.prog) || (typeof BUILTIN_PROGRAMS !== "undefined" ? BUILTIN_PROGRAMS : []).find(x => x.id === ST.prog) : null;
    return `${K.head("Steal a day", p ? "From " + p.title : "Take one day from any program")}
      <div class="pt-st-find"><input id="pt-st-q" type="search" enterkeyhint="search" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${p ? "Search this program's days" : "Search an athlete, program or day"}" value="${esc(ST.q)}" aria-label="Search days"></div>
      ${ST.prog ? "" : `<div class="pt-st-chips" id="pt-st-chips" role="group" aria-label="Muscle">${CHIPS.map(c => `<button type="button" data-chip="${c[0]}" aria-pressed="${ST.chip === c[0]}">${c[1]}</button>`).join("")}</div>`}
      <div id="pt-st-list"></div>`;
  }
  function listHtml() {
    const hint = !ST.chip && !ST.q && !ST.prog;
    if (hint) return `<p class="pt-st-hint">Pick a muscle to see the best days for it, or search an athlete (try "Cutler") or a program.</p>`;
    const rows = ST.rows, shown = rows.slice(0, MAX + ST.more * MAX);
    if (!rows.length) return `<p class="pt-st-hint">No days match. ${ST.chip ? "Try another muscle or clear the search." : "Try a shorter search."}</p>`;
    const chipName = (CHIPS.find(c => c[0] === ST.chip) || [])[1];
    return `<div class="pt-st-count">${rows.length} day${rows.length === 1 ? "" : "s"}${chipName ? " for " + esc(chipName.toLowerCase()) + ", best first" : ""}</div>
      <div class="pt-st-rows">${shown.map((r, i) => {
        const who = whoOf(r.p) || r.p.title, n = (r.d.exercises || []).length, m = r.d.estimatedMinutes;
        return `<button type="button" class="pt-st-row" data-i="${i}"><span class="pt-st-t">${esc(cleanTitle(r.d.title))}</span>
          <span class="pt-st-s">${esc(who)}${whoOf(r.p) ? " · " + esc(r.p.title.replace(who + ":", "").trim()) : ""}${r.mine ? " · mine" : ""}</span>
          <span class="pt-st-f">${esc(focusLine(r.pr))} <i>${n} exercises${m ? " · ~" + m + " min" : ""}</i></span></button>`;
      }).join("")}</div>
      ${rows.length > shown.length ? `<button type="button" class="pt-st-more" id="pt-st-more">Show ${Math.min(MAX, rows.length - shown.length)} more</button>` : ""}`;
  }
  function refreshList() {
    const box = el && el.querySelector("#pt-st-list"); if (!box) return;
    ST.rows = rank(ST.all, ST);
    box.innerHTML = listHtml();
    el.querySelectorAll("#pt-st-chips [data-chip]").forEach(b => b.setAttribute("aria-pressed", String(ST.chip === b.dataset.chip)));
  }
  function showFinder() {
    ST.view = "finder"; ST.warn = false; ST.pickMine = false;
    const c = K.openSheet(el, finderHtml()); bind(c); refreshList();
    return c;
  }

  function destHtml() {
    const src = ST.src, cur = currentProgram(), mine = ownPrograms();
    const canCur = !!(cur && cur.id !== FREESTYLE && !builtinIds().has(cur.id) && !hasWeeks(cur) && cur.id !== src.p.id);
    const exs = (src.d.exercises || []);
    const row = (go, ico, t, s, extra) => `<button type="button" class="pt-morerow pt-st-go" data-go="${go}" ${extra || ""}><span>${ico}</span><span class="pt-st-gt"><b>${t}</b><em>${s}</em></span></button>`;
    const nowRow = src.p.id === FREESTYLE ? "" : row("now", "▶", "Do it now", "A one-off Freestyle workout with these exercises. Your program is not changed.");
    const warn = ST.warn ? `<div class="pt-st-warn"><p>Your current Freestyle workout has sets in it. Doing this replaces it.</p><div><button type="button" class="pt-st-b" data-go="now-yes">Replace it</button><button type="button" class="pt-st-b ghost" data-go="now-no">Cancel</button></div></div>` : "";
    const mineList = ST.pickMine ? `<div class="pt-st-mine">${mine.map(p => `<button type="button" class="pt-morerow" data-go="to" data-pid="${esc(p.id)}"><span>📁</span><span class="pt-st-gt"><b>${esc(p.title)}</b><em>${(p.days || []).length} day${(p.days || []).length === 1 ? "" : "s"}</em></span></button>`).join("")}</div>` : "";
    return `${K.head(cleanTitle(src.d.title), `${whoOf(src.p) || src.p.title}${whoOf(src.p) ? " · " + src.p.title.replace(whoOf(src.p) + ":", "").trim() : ""}`)}
      <div class="pt-st-ex">${exs.map(e => `<div><span>${esc(e.name)}${e.link ? ' <i title="Superset with the next one">⛓</i>' : ""}</span><b>${esc(String(e.sets))} × ${esc(String(e.reps))}</b></div>`).join("")}</div>
      <div class="space-y-2">${nowRow}${warn}
        ${canCur ? row("cur", "＋", "Add to my current program", `A new day at the end of ${esc(cur.title)}.`) : ""}
        ${mine.length ? row("mine", "📁", "Add to one of my programs", "A new day at the end of a program you made.") : ""}${mineList}
        ${row("new", "✨", "Start a new program from it", "A program of your own with just this day.")}
        ${ST.from === "finder" ? `<button type="button" class="pt-st-back" data-go="back">‹ Back to the list</button>` : ""}
      </div>`;
  }
  function showDest() { ST.view = "dest"; const c = K.openSheet(el, destHtml()); bind(c); return c; }

  function finish(msg, undo) { K.closeSheet(el); const a = A(); a.toast(msg, undo ? "Open" : undefined, undo, 5000); }
  function go(kind, pid) {
    const a = A(), src = ST.src; if (!src) return;
    if (kind === "back") { showFinder(); return; }
    if (kind === "mine") { ST.pickMine = !ST.pickMine; showDest(); return; }
    if (kind === "now") { if (freestyleHasProgress()) { ST.warn = true; showDest(); return; } K.closeSheet(el); doNow(src); return; }
    if (kind === "now-no") { ST.warn = false; showDest(); return; }
    if (kind === "now-yes") { K.closeSheet(el); doNow(src); return; }
    if (kind === "cur" || kind === "to") {
      const prog = kind === "cur" ? currentProgram() : (a.data.programs || []).find(p => p.id === pid); if (!prog) return;
      const day = addDay(prog, src); if (!day) return;
      try { if (a.renderDaysView && !$("view-days").classList.contains("hidden")) a.renderDaysView(); if (a.renderProgramsView && !$("view-programs").classList.contains("hidden")) a.renderProgramsView(); } catch (e) { }
      finish(`Added "${day.title}" to ${prog.title}`, () => { a.activeProgram = prog; a.activeDay = day; a.showView("days"); });
      return;
    }
    if (kind === "new") {
      const day = cloneDay(src, 1), id = "custom_" + Date.now().toString(36);
      const prog = { id, title: day.title, description: "A program built from one day taken from " + src.p.title + ". Add more days from Steal a day, or edit it from the Programs screen.", tags: ["Custom"], days: [day] };
      a.data.programs.push(prog);
      if (!WorkoutStorage.setData(a.data)) { a.data.programs.pop(); a.toast("Could not save. Is your phone storage full?"); return; }
      try { if (a.renderProgramsView && !$("view-programs").classList.contains("hidden")) a.renderProgramsView(); } catch (e) { }
      finish(`Made the program "${prog.title}"`, () => { a.activeProgram = prog; a.activeDay = day; a.showView("days"); });
    }
  }
  function bind(c) {
    c.addEventListener("click", e => {
      if (e.target.closest("[data-close]")) return;
      const chip = e.target.closest("#pt-st-chips [data-chip]");
      if (chip) { ST.chip = ST.chip === chip.dataset.chip ? "" : chip.dataset.chip; ST.more = 0; refreshList(); return; }
      if (e.target.closest("#pt-st-more")) { ST.more++; refreshList(); return; }
      const row = e.target.closest(".pt-st-row");
      if (row) { const r = ST.rows[parseInt(row.dataset.i, 10)]; if (r) { ST.src = r; ST.from = "finder"; showDest(); } return; }
      const g = e.target.closest("[data-go]"); if (g) go(g.dataset.go, g.dataset.pid);
    });
    const q = c.querySelector("#pt-st-q");
    if (q) q.addEventListener("input", () => { ST.q = q.value; ST.more = 0; refreshList(); });
  }

  /** opts: { chip, q, program (a program object: only its days), day + program (jump straight to what to do with that day) } */
  function open(opts) {
    opts = opts || {};
    el = K.sheet("pt-steal", 58);
    ST = { chip: opts.chip || "", q: opts.q || "", prog: opts.program ? opts.program.id : "", more: 0, rows: [], src: null, from: "finder", warn: false, pickMine: false, view: "finder", all: sources() };
    if (opts.day && opts.program) {
      ST.src = { p: opts.program, d: opts.day, mine: true }; ST.from = "direct"; showDest(); return;
    }
    showFinder();
  }
  PT.steal = { open, chipFor, profile, rank: (st) => rank(sources(), Object.assign({ chip: "", q: "", prog: "" }, st)), cloneDay, titleFor };

  /* ---------------------------------------------------------------- entry points */
  document.addEventListener("click", e => {
    const t = e.target && e.target.closest ? e.target : null; if (!t) return;
    if (t.closest("#pt-prog-steal")) { open({}); return; }
    if (t.closest("#pt-steal-day")) { const a = A(); if (a.activeProgram && a.activeDay) open({ program: a.activeProgram, day: a.activeDay }); return; }
    const w = t.closest("#pt-weak-find"); if (w) { open({ chip: chipFor(w.dataset.group) }); return; }
  });

  function ensureTool() {
    const box = $("pt-prog-tools"); if (!box || $("pt-prog-steal")) return;
    const b = document.createElement("button"); b.type = "button"; b.id = "pt-prog-steal"; b.title = "Steal a day from any program"; b.setAttribute("aria-label", "Steal a day from any program");
    b.innerHTML = '<span class="pgx-ti">🧩</span><span class="pgx-tl">Steal a day</span>'; b.dataset.pgx = "Steal a day";
    box.appendChild(b);
  }
  const oRP = proto.renderProgramsView;
  proto.renderProgramsView = function () {
    const r = oRP.apply(this, arguments);
    try { ensureTool(); if (PT.programsScreen && PT.programsScreen.tools) PT.programsScreen.tools(); } catch (e) { console.error("PulseTrack steal tool", e); }
    return r;
  };
  const oRW = proto.renderWorkoutView;
  proto.renderWorkoutView = function () {
    const r = oRW.apply(this, arguments);
    try {
      const box = $("pt-wk-actions");
      if (box && !$("pt-steal-day")) { const b = document.createElement("button"); b.type = "button"; b.id = "pt-steal-day"; b.textContent = "Steal this day"; box.appendChild(b); }
    } catch (e) { console.error("PulseTrack steal row", e); }
    return r;
  };
  const oRPV = proto.renderProgressView;
  proto.renderProgressView = function () {
    const r = oRPV.apply(this, arguments);
    try {
      const card = $("pt-weak-card"), box = card && card.querySelector(".border-amber-800\\/50"); const a = this;
      if (box && !box.querySelector("#pt-weak-find")) {
        const w = PT.weakPoints && PT.weakPoints(a); if (w && w.ok && w.weak) {
          const b = document.createElement("button"); b.type = "button"; b.id = "pt-weak-find"; b.dataset.group = w.weak.g; b.className = "pt-st-weak tap-active"; b.textContent = "Find a day for " + w.weak.g.toLowerCase();
          box.appendChild(b);
        }
      }
    } catch (e) { console.error("PulseTrack weak find", e); }
    return r;
  };

  /* ---------------------------------------------------------------- styles */
  const css = document.createElement("style");
  css.id = "pt-v243-steal-css";
  css.textContent = `
    .pt-st-find input { width: 100%; padding: .7rem .85rem; border-radius: .8rem; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); color: rgb(var(--z100)); font-size: .85rem; }
    .pt-st-find input:focus { outline: none; border-color: rgb(var(--a500)); }
    .pt-st-chips { display: flex; flex-wrap: wrap; gap: .4rem; }
    .pt-st-chips button { padding: .45rem .8rem; border-radius: 999px; font-size: .75rem; font-weight: 700; background: rgb(var(--z800)); color: rgb(var(--z200)); border: 1px solid transparent; }
    .pt-st-chips button[aria-pressed="true"] { background: rgb(var(--a600)); color: #fff; }
    .pt-st-hint { font-size: .8rem; color: rgb(var(--z400)); padding: .4rem .1rem; }
    .pt-st-count { font-size: .68rem; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: rgb(var(--z500)); margin-bottom: .4rem; }
    .pt-st-rows { display: grid; gap: .5rem; }
    .pt-st-row { text-align: left; display: grid; gap: .15rem; padding: .7rem .85rem; border-radius: .85rem; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); width: 100%; }
    .pt-st-row:active { background: rgb(var(--z800)); }
    .pt-st-t { font-size: .85rem; font-weight: 800; color: rgb(var(--z50)); }
    .pt-st-s { font-size: .72rem; color: rgb(var(--z400)); }
    .pt-st-f { font-size: .7rem; color: rgb(var(--a400)); font-weight: 700; }
    .pt-st-f i { font-style: normal; color: rgb(var(--z500)); font-weight: 600; margin-left: .35rem; }
    .pt-st-more, .pt-st-back { margin-top: .6rem; width: 100%; padding: .7rem; border-radius: .8rem; font-size: .8rem; font-weight: 700; background: rgb(var(--z800)); color: rgb(var(--z100)); }
    .pt-st-back { background: transparent; color: rgb(var(--z400)); margin-top: .2rem; }
    .pt-st-ex { display: grid; gap: .1rem; padding: .5rem .75rem; border-radius: .85rem; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); max-height: 38vh; overflow-y: auto; }
    .pt-st-ex > div { display: flex; justify-content: space-between; gap: .75rem; font-size: .76rem; padding: .22rem 0; color: rgb(var(--z200)); }
    .pt-st-ex > div + div { border-top: 1px solid rgb(var(--z900)); }
    .pt-st-ex b { font-family: ui-monospace, monospace; font-weight: 700; color: rgb(var(--z400)); white-space: nowrap; }
    .pt-st-ex i { font-style: normal; color: rgb(var(--a400)); }
    .pt-st-go { align-items: flex-start !important; text-align: left; }
    .pt-st-gt { display: grid; gap: .1rem; }
    .pt-st-gt b { font-size: .85rem; font-weight: 800; }
    .pt-st-gt em { font-style: normal; font-size: .7rem; font-weight: 500; color: rgb(var(--z400)); }
    .pt-st-mine { display: grid; gap: .4rem; padding-left: .75rem; }
    .pt-st-warn { padding: .75rem; border-radius: .85rem; background: rgb(var(--z950)); border: 1px solid rgb(251 191 36 / .45); }
    .pt-st-warn p { font-size: .78rem; color: rgb(253 230 138); margin-bottom: .55rem; }
    .pt-st-warn div { display: flex; gap: .5rem; }
    .pt-st-b { flex: 1; padding: .6rem; border-radius: .7rem; font-size: .8rem; font-weight: 800; background: rgb(var(--a600)); color: #fff; }
    .pt-st-b.ghost { background: rgb(var(--z800)); color: rgb(var(--z100)); }
    .pt-st-weak { margin-top: .6rem; padding: .55rem .9rem; border-radius: .7rem; font-size: .75rem; font-weight: 800; background: rgb(var(--a600)); color: #fff; }
    #pt-steal-day { display: none !important; }
    html[data-mode="light"] .pt-st-f { color: rgb(var(--a600)); }
    html[data-mode="light"] .pt-st-warn p { color: rgb(146 64 14); }
  `;
  document.head.appendChild(css);
})();
  