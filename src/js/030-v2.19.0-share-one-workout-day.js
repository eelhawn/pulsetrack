
/* =====================================================================
 * PulseTrack 2.19.0 (part 1): share one workout day.
 *  - "Share day" on the workout screen sends the day exactly as you have it (your edits included) as a link or a file.
 *  - The other person opens the link (or pastes it under Programs -> Paste a share link) and picks which day of which
 *    program it should replace. Their own day is kept underneath, like any other edit:
 *    Clear Progress on that day puts their original day back (exercises, name and length). Reset All Days does too.
 *  - Or they can do it once, as a Freestyle workout, without touching a program.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  const proto = ApplicationUI.prototype;
  const A = () => window.app;
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const clone = o => JSON.parse(JSON.stringify(o));
  const clean = t => String(t === undefined || t === null ? "" : t).replace(/[<>]/g, "").trim();
  const FREE = typeof FREESTYLE_ID !== "undefined" ? FREESTYLE_ID : "freestyle";
  const MAX_LINK = 7000;
  const K = () => PT.kit;

  const css = document.createElement("style");
  css.id = "pt-v37a-css";
  css.textContent = `
    #btn-share-day { font-size: .75rem; font-weight: 700; padding: .4rem .7rem; border-radius: .5rem; background: rgb(var(--z800)); color: rgb(var(--z100)); border: 1px solid rgb(var(--z700)); white-space: nowrap; text-align: center; }
    #btn-share-day:active { background: rgb(var(--a600)); color: #fff; }
    #pt-shared-note { margin-top: .35rem; font-size: .68rem; line-height: 1.3; color: rgb(251 191 36); }
    .pt-dayimp-list { border: 1px solid rgb(var(--z800)); background: rgb(var(--z950)); border-radius: .75rem; padding: .25rem .75rem; max-height: 30vh; overflow-y: auto; }
    .pt-dayimp-list > div { display: flex; justify-content: space-between; gap: .75rem; padding: .3rem 0; font-size: .75rem; border-bottom: 1px solid rgb(var(--z900)); }
    .pt-dayimp-list > div:last-child { border-bottom: 0; }
    .pt-dayimp-list span:first-child { color: rgb(var(--z100)); font-weight: 600; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .pt-dayimp-list span:last-child { color: rgb(var(--z400)); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; flex: none; }
    .pt-pickrow { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: .5rem; padding: .65rem .8rem; border-radius: .75rem; border: 1px solid rgb(var(--z800)); background: rgb(var(--z950)); text-align: left; }
    .pt-pickrow b { display: block; font-size: .8rem; color: #fff; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .pt-pickrow small { display: block; font-size: .6rem; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: rgb(var(--z400)); }
  `;
  document.head.appendChild(css);

  /* ------------------------------------------------------------------ what is sent */
  const EX_KEYS = ["name", "sets", "reps", "restSeconds", "restAuto", "type", "notes", "link", "workSeconds"];

  /** The day as the person has it right now, with the change markers taken off. */
  proto.dayShareObject = function (prog, day) {
    const exercises = (day.exercises || []).filter(e => e && e.name).map(e => {
      const o = {};
      EX_KEYS.forEach(k => { if (e[k] !== undefined && e[k] !== null && e[k] !== "") o[k] = e[k]; });
      return o;
    });
    return {
      pulsetrackDay: 1,
      program: { id: prog.id, title: prog.title },
      day: {
        dayNumber: day.dayNumber,
        title: this.shortDayTitle ? this.shortDayTitle(prog, day) : (day.title || ("Day " + day.dayNumber)),
        estimatedMinutes: day.estimatedMinutes || 45,
        exercises
      }
    };
  };

  proto.shareActiveDay = async function () {
    const prog = this.activeProgram, day = this.activeDay;
    if (!prog || !day) return;
    if (!(day.exercises || []).length) { await PT.alert("This day has no exercises to share yet."); return; }
    const payload = this.dayShareObject(prog, day), json = JSON.stringify(payload), title = payload.day.title;
    const link = location.origin + location.pathname + "#day=" + PT.b64urlEncode(json);
    if (link.length <= MAX_LINK) {
      try {
        if (navigator.share) { await navigator.share({ title, text: `PulseTrack workout: ${title}`, url: link }); return; }
      } catch (err) { if (err && err.name === "AbortError") return; }
      try { await navigator.clipboard.writeText(link); this.toast("Link copied. Send it to anyone with PulseTrack"); return; } catch (err) { }
      await PT.prompt("Share link", link, { readonly: true, copy: true, ok: "Copy link", cancel: "Close", title: "Share this workout", body: "Copy this link and send it to anyone who has PulseTrack." });
      return;
    }
    const slug = String(title || "workout").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "workout";
    const file = new File([json], `${slug}.pulsetrack.json`, { type: "application/json" });
    const ok = await this.shareFile(file, title);
    if (ok) this.toast("This workout is big, so it was shared as a file. Open it in PulseTrack -> Programs -> Import.", null, null, 6000);
  };

  /* ------------------------------------------------------------------ what is received */
  function cleanDay(obj) {
    const d = obj && obj.pulsetrackDay ? obj.day : null;
    if (!d || !Array.isArray(d.exercises)) return null;
    const exercises = d.exercises.filter(e => e && e.name).slice(0, 40).map(e => {
      const ex = {
        name: clean(e.name).slice(0, 80),
        sets: Math.max(1, Math.min(50, parseInt(e.sets, 10) || 3)),
        reps: clean(e.reps).slice(0, 40) || "10",
        restSeconds: Number.isFinite(parseInt(e.restSeconds, 10)) ? Math.max(0, Math.min(1800, parseInt(e.restSeconds, 10))) : 60,
        type: clean(e.type).slice(0, 20) || "standard"
      };
      if (e.restAuto) ex.restAuto = true;
      if (e.notes) ex.notes = clean(e.notes).slice(0, 400);
      if (e.link) ex.link = true;
      if (e.workSeconds) ex.workSeconds = Math.max(1, Math.min(600, parseInt(e.workSeconds, 10) || 20));
      return ex;
    });
    if (!exercises.length) return null;
    const p = obj.program || {};
    return {
      from: { id: clean(p.id).slice(0, 80), title: clean(p.title).slice(0, 80) },
      dayNumber: parseInt(d.dayNumber, 10) || 0,
      title: clean(d.title).slice(0, 60) || "Shared workout",
      estimatedMinutes: Math.max(5, Math.min(240, parseInt(d.estimatedMinutes, 10) || Math.max(20, exercises.length * 9))),
      exercises
    };
  }

  /** Link text, a bare code or JSON -> the object inside, or null. */
  function decodeShare(text) {
    text = String(text || "").trim();
    if (!text) return null;
    const m = text.match(/#(?:day|import)=([A-Za-z0-9_\-+/=%]+)/);
    const code = m ? m[1] : text;
    try { const o = JSON.parse(PT.b64urlDecode(decodeURIComponent(code))); if (o && typeof o === "object") return o; } catch (e) { }
    try { const o = JSON.parse(text); if (o && typeof o === "object") return o; } catch (e) { }
    return null;
  }
  PT.decodeShare = decodeShare;

  proto.openSharedText = async function (text) {
    const obj = decodeShare(text);
    if (obj && obj.pulsetrackDay) return this.importDayObject(obj);
    if (obj && obj.pulsetrackProgram) return this.importProgramObject(obj.program);
    await PT.alert("That doesn't look like a PulseTrack share link. Copy the whole link (or file) that was sent to you and try again.");
    return false;
  };

  proto.pasteShareLink = async function () {
    const v = await PT.prompt("Paste a share link", "", { ok: "Open", cancel: "Cancel", title: "Paste a share link", body: "Paste the link someone sent you. It can be one workout day or a whole program." });
    if (v === null || v === undefined || !String(v).trim()) return;
    await this.openSharedText(v);
  };

  /* ------------------------------------------------------------------ pick where it goes */
  function dayLabel(app, prog, day) {
    const t = app.shortDayTitle ? app.shortDayTitle(prog, day) : (day.title || "");
    let w = 0;
    try { w = app.progWeeks(prog) ? app.dayWeek(prog, day) : 0; } catch (e) { w = 0; }
    return `${w ? `Week ${w} · ` : ""}Day ${PT.dayNo(prog, day)}: ${t}${(day.exercises || []).length ? "" : " (rest day)"}`;
  }
  function defaultTarget(app, sd) {
    const progs = ((app.data && app.data.programs) || []).filter(p => p && p.id !== FREE && Array.isArray(p.days) && p.days.length);
    if (!progs.length) return null;
    let prog = progs.find(p => p.id === sd.from.id) || progs.find(p => p.id === PT.currentProgramId()) || progs[0];
    let day = null;
    if (prog.id === sd.from.id && sd.dayNumber) day = prog.days.find(d => d.dayNumber === sd.dayNumber);
    if (!day) { try { day = app.nextDayOf(prog); } catch (e) { day = null; } }
    if (!day) day = prog.days[0];
    return { prog, day };
  }

  proto.importDayObject = function (obj) {
    const app = this, sd = cleanDay(obj);
    if (!sd) return PT.alert("That doesn't look like a PulseTrack workout.").then(() => false);
    const progs = ((app.data && app.data.programs) || []).filter(p => p && p.id !== FREE && Array.isArray(p.days) && p.days.length);
    let target = defaultTarget(app, sd);
    return new Promise(resolve => {
      const k = K(), el = k.sheet("pt-dayimp", 82);
      const total = sd.exercises.reduce((n, e) => n + e.sets, 0);
      const draw = () => {
        const prog = target && target.prog, day = target && target.day;
        const card = k.openSheet(el, `${k.head("Shared workout", sd.from.title ? `From "${sd.from.title}"` : "Someone sent you a workout")}
          <div class="space-y-1.5">
            <div class="flex items-baseline justify-between gap-3"><h4 class="text-sm font-bold text-white min-w-0 truncate">${esc(sd.title)}</h4><span class="text-[11px] text-zinc-400 shrink-0">${sd.exercises.length} exercise${sd.exercises.length === 1 ? "" : "s"} · ${total} set${total === 1 ? "" : "s"}</span></div>
            <div class="pt-dayimp-list">${sd.exercises.map(e => `<div><span>${esc(e.name)}</span><span>${e.sets} × ${esc(e.reps)}</span></div>`).join("")}</div>
          </div>
          ${target ? `<div class="space-y-2">
            <span class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Put it on</span>
            <button type="button" id="pt-di-prog" class="pt-pickrow tap-active"><span class="min-w-0"><small>Program</small><b>${esc(prog.title)}</b></span><span class="text-zinc-500">▾</span></button>
            <button type="button" id="pt-di-day" class="pt-pickrow tap-active"><span class="min-w-0"><small>Day to replace</small><b>${esc(dayLabel(app, prog, day))}</b></span><span class="text-zinc-500">▾</span></button>
            <p class="text-[11px] leading-relaxed text-zinc-400">This day's exercises are swapped for the ones above (sets you logged on it today are cleared; saved workouts in History stay). <b class="text-zinc-200">Clear Progress</b> on that day puts the original back.</p>
          </div>` : ""}
          <div class="space-y-2">
            ${target ? `<button type="button" id="pt-di-go" class="w-full py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold tap-active">Replace Day ${day.dayNumber}</button>` : ""}
            <button type="button" id="pt-di-once" class="w-full py-3 rounded-xl bg-zinc-800 text-zinc-100 text-sm font-bold tap-active">Just do it once (Freestyle)</button>
          </div>`);
        let finished = false;
        const done = v => { if (finished) return; finished = true; el.__onClose = null; resolve(v); };
        el.__onClose = () => done(false);
        const q = s => card.querySelector(s);
        if (target) {
          q("#pt-di-prog").addEventListener("click", async () => {
            const v = await PT.pickList("Which program?", progs.map(p => ({ value: p.id, label: p.title })), prog.id);
            if (!v || v === prog.id) return;
            const p = progs.find(x => x.id === v); if (!p) return;
            let d = p.id === sd.from.id && sd.dayNumber ? p.days.find(x => x.dayNumber === sd.dayNumber) : null;
            if (!d) { try { d = app.nextDayOf(p); } catch (e) { d = null; } }
            target = { prog: p, day: d || p.days[0] }; draw();
          });
          q("#pt-di-day").addEventListener("click", async () => {
            const v = await PT.pickList("Which day should it replace?", prog.days.map(d => ({ value: d.dayNumber, label: dayLabel(app, prog, d) })), day.dayNumber);
            if (v === null || v === undefined) return;
            const d = prog.days.find(x => x.dayNumber === v); if (!d) return;
            target = { prog, day: d }; draw();
          });
          q("#pt-di-go").addEventListener("click", async () => {
            if (!await PT.confirm(`Replace "${app.shortDayTitle(prog, day)}" (Day ${PT.dayNo(prog, day)}) in "${prog.title}" with "${sd.title}"?`, { ok: "Replace" })) return;
            done(true); k.closeSheet(el);
            await app.applySharedDay(prog, day, sd);
          });
        }
        q("#pt-di-once").addEventListener("click", async () => {
          done(true); k.closeSheet(el);
          await app.startFreestyleWith(sd.exercises, { title: "Freestyle", ask: true });
        });
      };
      draw();
    });
  };

  /* ------------------------------------------------------------------ put it on the day */
  proto.applySharedDay = async function (prog, day, sd) {
    // keep the person's own day underneath, so Clear Progress can bring it back
    if (!day.sharedFrom) {
      day.origTitle = day.title; day.origMinutes = day.estimatedMinutes;
      if (!(day.exercises || []).length) day.sharedEmpty = true;
    }
    if (!this.builtinDay(prog, day) && !(Array.isArray(day.orig) && day.orig.length)) {
      const o = this.originalExercises(prog, day);
      if (o && o.length) day.orig = clone(o);
    }
    this.clearDayLogs(prog, day);
    const stamp = Date.now().toString(36);
    day.exercises = sd.exercises.map((e, i) => Object.assign({ id: `sd${stamp}_${i + 1}` }, clone(e)));
    day.title = sd.title; day.estimatedMinutes = sd.estimatedMinutes;
    delete day.removed;
    day.sharedFrom = { title: sd.title, program: sd.from.title || "", at: Date.now() };
    WorkoutStorage.saveLogs(this.logs);
    WorkoutStorage.setData(this.data);
    this.activeProgram = prog; this.activeDay = day;
    try { AppStateMemory.saveActive(prog.id, day.dayNumber); } catch (e) { }
    this.showView("workout");
    try { this.renderWorkoutView(); } catch (e) { }
    this.toast(`Day ${PT.dayNo(prog, day)} is now "${sd.title}". Clear Progress puts yours back.`, null, null, 6000);
  };

  // Clear Progress / Reset All Days: a shared day goes back to the person's own
  const oRestore = proto.restoreDay;
  proto.restoreDay = function (prog, day) {
    const shared = !!(day && day.sharedFrom);
    let changed = oRestore.apply(this, arguments);
    if (shared) {
      if (day.sharedEmpty && (day.exercises || []).length) day.exercises = [];
      if (day.origTitle !== undefined) day.title = day.origTitle;
      if (day.origMinutes !== undefined) day.estimatedMinutes = day.origMinutes;
      delete day.sharedFrom; delete day.origTitle; delete day.origMinutes; delete day.sharedEmpty;
      changed = true;
    }
    return changed;
  };

  /* ------------------------------------------------------------------ a one-off Freestyle workout from a list of exercises (also used by "Build me a workout") */
  proto.startFreestyleWith = async function (list, o) {
    o = o || {};
    if (!Array.isArray(list) || !list.length) return false;
    if (!this.data || !Array.isArray(this.data.programs)) this.data = { programs: [] };
    let prog = this.data.programs.find(p => p.id === FREE);
    if (!prog) {
      prog = {
        id: FREE, title: "Freestyle Workouts",
        description: "Empty workouts you build on the fly. Add any exercise from the library.",
        tags: ["Custom"],
        days: [{ dayNumber: 1, title: "Freestyle", estimatedMinutes: 45, exercises: [] }]
      };
      this.data.programs.push(prog);
    }
    const day = prog.days[0];
    if ((day.exercises || []).length && o.ask !== false && !await PT.confirm("Replace your last Freestyle workout with this one? (Anything you finished is already saved in History.)", { ok: "Replace" })) return false;
    this.clearDayLogs(prog, day);
    const stamp = Date.now().toString(36);
    day.exercises = list.map((e, i) => {
      const ex = Object.assign({ id: `fs${stamp}_${i + 1}`, type: "standard" }, clone(e));
      delete ex.region; delete ex.why;
      return ex;
    });
    day.title = "Freestyle";
    day.estimatedMinutes = o.minutes || Math.max(20, list.length * 9);
    delete day.removed;
    WorkoutStorage.saveLogs(this.logs);
    WorkoutStorage.setData(this.data);
    this.activeProgram = prog; this.activeDay = day;
    try { AppStateMemory.saveActive(prog.id, day.dayNumber); } catch (e) { }
    this.showView("workout");
    return true;
  };

  /* ------------------------------------------------------------------ buttons and links */
  function syncButtons(app) {
    const box = document.getElementById("pt-wk-actions"), clear = document.getElementById("btn-reset-day-progress");
    if (box && clear && !document.getElementById("btn-share-day")) {
      const b = document.createElement("button");
      b.type = "button"; b.id = "btn-share-day"; b.className = "tap-active"; b.textContent = "Share day";
      clear.before(b);
    }
    const sb = document.getElementById("btn-share-day");
    if (sb) sb.classList.toggle("hidden", !(app.activeDay && (app.activeDay.exercises || []).length));
    // a note under the title when this day came from someone else
    const t = document.getElementById("workout-day-title");
    if (t && t.parentElement) {
      let n = document.getElementById("pt-shared-note");
      const sf = app.activeDay && app.activeDay.sharedFrom;
      if (sf) {
        if (!n) { n = document.createElement("p"); n.id = "pt-shared-note"; t.parentElement.appendChild(n); }
        n.textContent = `Shared workout${sf.program ? ` from "${sf.program}"` : ""}. Clear Progress puts your own day back.`;
      } else if (n) n.remove();
    }
  }
  const oWk = proto.renderWorkoutView;
  proto.renderWorkoutView = function () { const r = oWk.apply(this, arguments); try { syncButtons(this); } catch (e) { console.error("PulseTrack share day", e); } return r; };

  function ensurePasteButton() {
    const imp = document.getElementById("btn-import-program");
    if (!imp || document.getElementById("btn-paste-share")) return;
    const b = document.createElement("button");
    b.type = "button"; b.id = "btn-paste-share";
    b.className = "w-full py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 font-semibold text-xs rounded-xl tap-active";
    b.textContent = "🔗 Paste a Share Link (workout day or program)";
    (document.getElementById("input-import-program") || imp).after(b);
  }

  document.addEventListener("click", e => {
    const a = e.target.closest && e.target.closest("#btn-share-day, #btn-paste-share"); if (!a) return;
    const app = A(); if (!app) return;
    if (a.id === "btn-share-day") app.shareActiveDay(); else app.pasteShareLink();
  });

  // a file with a shared day (Programs -> Import) opens the same sheet
  const oFile = proto.importProgramFile;
  proto.importProgramFile = function (file) {
    const app = this, reader = new FileReader();
    reader.onerror = () => oFile.call(app, file);
    reader.onload = () => {
      let obj = null;
      try { obj = JSON.parse(reader.result); } catch (e) { obj = null; }
      if (obj && obj.pulsetrackDay) app.importDayObject(obj); else oFile.call(app, file);
    };
    reader.readAsText(file);
  };

  // a link: #day=...  (the old #import=... for whole programs is untouched)
  async function openDayHash(app) {
    const h = location.hash || "";
    if (!h.startsWith("#day=")) return false;
    const obj = decodeShare(h);
    try { history.replaceState(null, "", location.pathname + location.search); } catch (e) { }
    if (!obj || !obj.pulsetrackDay) { setTimeout(async () => await PT.alert("That workout link is broken or incomplete."), 300); return true; }
    setTimeout(async () => {
      // iPhone: a link opened in Safari does not see the app on the Home Screen (they keep separate data)
      if (PT.isIOS() && !PT.isStandalone() && (app.sessions || []).length === 0 && !localStorage.getItem("pt_day_here")) {
        const i = await PT.choose("This workout was sent to you. If you use PulseTrack from the icon on your Home Screen, copy the link, open the icon and use Programs -> Paste a Share Link. (Safari and the icon keep separate data.)", ["Copy link", "Use it in Safari anyway"]);
        if (i === 0) {
          const link = location.origin + location.pathname + "#day=" + PT.b64urlEncode(JSON.stringify(obj));
          try { await navigator.clipboard.writeText(link); app.toast("Link copied"); } catch (e) { await PT.prompt("Share link", link, { readonly: true, copy: true, ok: "Copy link", cancel: "Close", title: "Copy this link" }); }
          return;
        }
        if (i !== 1) return;
        try { localStorage.setItem("pt_day_here", "1"); } catch (e) { }
      }
      app.importDayObject(obj);
    }, 500);
    return true;
  }
  const oHash = proto.checkImportHash;
  proto.checkImportHash = function () {
    if ((location.hash || "").startsWith("#day=")) { openDayHash(this); return; }
    return typeof oHash === "function" ? oHash.apply(this, arguments) : undefined;
  };
  window.addEventListener("hashchange", () => { const a = A(); if (a && (location.hash || "").startsWith("#day=")) openDayHash(a); });

  const oInit = proto.initExtras;
  proto.initExtras = function () {
    const r = typeof oInit === "function" ? oInit.apply(this, arguments) : undefined;
    try { ensurePasteButton(); } catch (e) { console.error("PulseTrack paste share", e); }
    return r;
  };
})();
  