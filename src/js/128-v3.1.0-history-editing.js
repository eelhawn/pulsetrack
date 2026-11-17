/* =====================================================================
 * PulseTrack 3.1.0: history editing.
 *  - Edit on a past workout opens a full editor: its name, the day and the time it started, how long it took, every set (weight and
 *    reps, or minutes and distance for cardio), + Add set on each exercise, + Add exercise (the usual exercise list), remove an
 *    exercise, and the notes.
 *  - History has "+ Add a past workout" for one you forgot to log. It opens the same editor, empty.
 *  - How long it took: type the minutes, or leave "Work it out from the sets" on. Then the time is estimated from what is in the
 *    workout (about 40 s per set, your own rest times between sets, 1.5 min to change exercise, cardio minutes as logged) and it
 *    follows along as sets are added or removed. A workout saved that way keeps the estimate on (s.durEst), so adding sets later
 *    moves its time too; a time you typed, or one the workout timer measured, is never changed unless you change it.
 *  - The workout's sheet shows when it was ("Tue, Nov 17 · 6:10 to 7:25 PM"), with "about" in front of an estimate.
 *  - Saving works records, volume and "last time" out again, so the next workout's suggestions follow the edit.
 *  PT.histEdit = { estimate(exList), open(id), add() } for the tests.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  const proto = ApplicationUI.prototype;
  const A = () => window.app, esc = s => PT.esc(s), $ = id => document.getElementById(id);
  const pad = n => String(n).padStart(2, "0");
  const hhmm = d => pad(d.getHours()) + ":" + pad(d.getMinutes());
  const isCardio = st => !!st && (PT.isCardioSet ? PT.isCardioSet(st) : st.min !== undefined);
  const num = v => { const n = parseFloat(v); return isFinite(n) ? n : 0; };

  /* ================================================================ how long it probably took */
  function estimate(app, exList) {
    let secs = 0, blocks = 0;
    (exList || []).forEach(e => {
      const sets = (e.sets || []).filter(Boolean);
      if (!sets.length) return;
      blocks++;
      let rest = 90;
      try { rest = Math.max(30, Math.min(600, app.smartRest(e.name) || 90)); } catch (er) { }
      sets.forEach((st, i) => {
        if (isCardio(st)) secs += Math.max(60, num(st.min) * 60);
        else {
          secs += st.t === "W" ? 30 : 40;
          if (i < sets.length - 1) secs += st.t === "W" ? 45 : rest;
        }
      });
    });
    if (blocks > 1) secs += (blocks - 1) * 90;
    return blocks ? Math.max(60, Math.round(secs / 60) * 60) : 0;
  }

  /* ================================================================ when */
  const startOf = s => {
    const end = num(s.ts), dur = num(s.dur);
    if (end > 0) return new Date(end - dur * 1000);
    const d = PT.fromDs(s.date); d.setHours(12, 0, 0, 0); return d;
  };
  function whenText(s) {
    const st = startOf(s), en = new Date(st.getTime() + num(s.dur) * 1000);
    const t = d => d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
    const day = PT.fmtDate(s.date, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
    if (!(num(s.dur) > 0)) return `${day} · started ${t(st)}`;
    return `${day} · ${t(st)} to ${t(en)}${s.durEst ? " (about)" : ""}`;
  }

  /* ================================================================ the editor */
  let ED = null;   // { id (null for a new workout), d: { title, date, time, dur, auto, note, unit, ex: [{ name, dbn, k, sets }] } }

  const setFor = (app, name, date, from) => {
    if (from) { const c = JSON.parse(JSON.stringify(from)); if (c.t === "W" || c.t === "D") c.t = "R"; return c; }
    const ghost = (app.lastPerf && app.lastPerf[name] || []).find(x => x && x.tag !== "W");
    const ex = { name };
    let st;
    try { st = app.entryToSet(ex, ghost ? { weight: ghost.weight, reps: ghost.reps, tag: "R", min: ghost.min, dist: ghost.dist } : { weight: "", reps: "", tag: "R", min: "", dist: "" }); }
    catch (e) { st = { w: 0, r: 0, t: "R" }; }
    if (st.bw !== undefined) { const bw = app.bwOn(date); if (bw > 0) st.bw = bw; else delete st.bw; }
    return st;
  };

  function readInputs(body) {
    const d = ED.d;
    const v = id => { const el = body.querySelector("#" + id); return el ? el.value : ""; };
    d.title = v("he-title").trim();
    d.date = v("he-date") || d.date;
    d.time = v("he-time") || d.time;
    d.note = v("he-note");
    const au = body.querySelector("#he-auto"); d.auto = !!(au && au.checked);
    if (!d.auto) { const m = num(v("he-dur")); d.dur = Math.round(Math.max(0, m) * 60); }
    body.querySelectorAll("[data-he]").forEach(inp => {
      const [ei, si, f] = inp.dataset.he.split(":"), st = d.ex[+ei] && d.ex[+ei].sets[+si];
      if (!st) return;
      const x = Math.max(0, num(inp.value));
      if (f === "w") st.w = x; else if (f === "r") st.r = x; else if (f === "min") st.min = x;
      else if (f === "dist") { if (x > 0) st.dist = x; else delete st.dist; }
    });
  }

  function editorHtml(app) {
    const d = ED.d, mini = "pt-he-in";
    const est = estimate(app, d.ex), mins = d.auto ? Math.round(est / 60) : Math.round(d.dur / 60);
    let h = `<div class="pt-he">
      <label class="pt-he-l">Name<input id="he-title" type="text" maxlength="60" class="pt-he-f" value="${esc(d.title)}" placeholder="Workout"></label>
      <div class="pt-he-row">
        <label class="pt-he-l">Day<input id="he-date" type="date" class="pt-he-f" value="${esc(d.date)}" max="${esc(PT.ds())}"></label>
        <label class="pt-he-l">Started<input id="he-time" type="time" class="pt-he-f" value="${esc(d.time)}"></label>
      </div>
      <div class="pt-he-dur">
        <label class="pt-he-l">How long (minutes)<input id="he-dur" type="number" inputmode="numeric" min="0" max="600" class="pt-he-f" value="${mins || ""}" ${d.auto ? "disabled" : ""}></label>
        <label class="pt-he-ck"><input id="he-auto" type="checkbox" ${d.auto ? "checked" : ""}><span>I don't know. Work it out from the sets${d.auto && est ? ` (about ${Math.round(est / 60)} min)` : ""}</span></label>
      </div>`;
    d.ex.forEach((e, ei) => {
      const bw = PT.isBodyweightEx && PT.isBodyweightEx(e.name);
      h += `<div class="pt-he-ex" data-ei="${ei}">
        <div class="pt-he-exh"><span>${esc(e.name)}</span><button type="button" class="pt-he-x" data-he-rmex="${ei}" aria-label="Remove ${esc(e.name)}">Remove</button></div>`;
      e.sets.forEach((st, si) => {
        const tag = st.t && st.t !== "R" ? `<span class="pt-he-tag">${esc(st.t)}</span>` : `<span class="pt-he-tag"></span>`;
        if (isCardio(st)) {
          h += `<div class="pt-he-set">${tag}<span class="pt-he-n">${si + 1}</span>
            <input type="number" inputmode="decimal" step="any" min="0" class="${mini}" data-he="${ei}:${si}:min" value="${st.min || ""}" aria-label="Set ${si + 1} minutes"><span class="pt-he-u">min</span>
            <input type="number" inputmode="decimal" step="any" min="0" class="${mini}" data-he="${ei}:${si}:dist" value="${st.dist || ""}" aria-label="Set ${si + 1} distance"><span class="pt-he-u">${esc(app.distLabel(d.unit))}</span>
            <button type="button" class="pt-he-del" data-he-rm="${ei}:${si}" aria-label="Delete set ${si + 1}">✕</button></div>`;
        } else {
          const pre = bw && (st.bx || st.a) ? (st.a ? "−" : "+") : "";
          h += `<div class="pt-he-set">${tag}<span class="pt-he-n">${si + 1}</span>
            ${pre ? `<span class="pt-he-u">${pre}</span>` : ""}<input type="number" inputmode="decimal" step="any" min="0" class="${mini}" data-he="${ei}:${si}:w" value="${st.w || st.w === 0 && st.r ? st.w : ""}" aria-label="Set ${si + 1} weight"><span class="pt-he-u">${d.unit === "kg" ? "kg" : "lbs"}</span>
            <input type="number" inputmode="numeric" min="0" class="${mini}" data-he="${ei}:${si}:r" value="${st.r || ""}" aria-label="Set ${si + 1} reps"><span class="pt-he-u">reps</span>
            <button type="button" class="pt-he-del" data-he-rm="${ei}:${si}" aria-label="Delete set ${si + 1}">✕</button></div>`;
        }
      });
      h += `<button type="button" class="pt-he-add" data-he-addset="${ei}">+ Add set</button></div>`;
    });
    h += `<button type="button" class="pt-he-addex" id="he-addex">+ Add exercise</button>
      <label class="pt-he-l">Notes<textarea id="he-note" rows="2" class="pt-he-f">${esc(d.note || "")}</textarea></label></div>`;
    return h;
  }

  function draw(app) {
    const body = $("sheet-body"); if (!body || !ED) return;
    const y = body.scrollTop;
    body.innerHTML = editorHtml(app);
    body.scrollTop = y;
  }

  function open(app, id) {
    const isNew = !id, s = id ? (app.sessions || []).find(x => x.id === id) : null;
    if (id && !s) return;
    const now = new Date();
    if (s) {
      const st = startOf(s);
      ED = { id, d: { title: s.dtitle || "", date: s.date, time: hhmm(st), dur: num(s.dur), auto: !!s.durEst || !(num(s.dur) > 0), note: s.note || "", unit: s.unit === "kg" ? "kg" : "lb",
        ex: JSON.parse(JSON.stringify(s.ex || [])).map(e => Object.assign(e, { sets: (e.sets || []).filter(Boolean) })) } };
    } else {
      const st0 = new Date(now.getTime() - 3600 * 1000);   // an hour ago, on that hour's own day
      ED = { id: null, d: { title: "", date: PT.ds(st0), time: hhmm(st0), dur: 0, auto: true, note: "", unit: app.unit() === "kg" ? "kg" : "lb", ex: [] } };
    }
    const btn = "py-3 rounded-xl text-xs font-bold tap-active";
    const footer = `<div class="flex gap-2"><button type="button" id="he-cancel" class="${btn} px-4 bg-zinc-800 text-zinc-200">Cancel</button><button type="button" id="he-save" class="${btn} flex-1 bg-emerald-600 text-white">${isNew ? "Add workout" : "Save changes"}</button></div>`;
    app.openSheet(isNew ? "Add a past workout" : "Edit workout", isNew ? "For a workout you did but didn't log" : (s.ptitle || ""), editorHtml(app), footer);
    const sb = $("sheet-body"); if (sb) sb.dataset.he = "1";
    if (isNew) setTimeout(() => { const t = $("he-title"); if (t) t.focus(); }, 60);
  }

  function pickExercise(app) {
    app._heAdd = true;
    app.openExerciseSelector("add");
    app.exerciseModalTarget = { action: "hist", index: -1 };
    try { app.dom.exSelectorTitle.innerText = "Add Exercise"; app.dom.exSelectorSub.textContent = "Pick an exercise to add to this workout"; } catch (e) { }
    const m = app.dom.modalExSelector; if (m) m.style.zIndex = "60";   // above the sheet
  }

  const oSel = proto.handleExerciseSelection;
  proto.handleExerciseSelection = function (name, btn) {
    const t = this.exerciseModalTarget;
    if (!t || t.action !== "hist") return oSel.apply(this, arguments);
    const m = this.dom.modalExSelector; if (m) { m.classList.add("hidden"); m.style.zIndex = ""; }
    this.exerciseModalTarget = null;
    if (!ED) return;
    const body = $("sheet-body"); if (body) readInputs(body);
    const rec = { name, sets: [setFor(this, name, ED.d.date, null)] };
    try { if (PT.cardioKind(name)) rec.k = "c"; else if (/dumbbell|\bdb\b|arnold/i.test(name)) rec.dbn = PT.dbCount(name, "10"); } catch (e) { }
    ED.d.ex.push(rec);
    draw(this);
    setTimeout(() => { const b = $("sheet-body"), last = b && b.querySelector(`.pt-he-ex[data-ei="${ED.d.ex.length - 1}"]`); if (last) last.scrollIntoView({ block: "nearest" }); }, 30);
  };
  const oOpenSel = proto.openExerciseSelector;
  proto.openExerciseSelector = function () { const m = this.dom && this.dom.modalExSelector; if (m) m.style.zIndex = ""; return oOpenSel.apply(this, arguments); };

  async function save(app) {
    const body = $("sheet-body"); if (!body || !ED) return;
    readInputs(body);
    const d = ED.d;
    const ex = d.ex.map(e => Object.assign({}, e, { sets: e.sets.filter(st => isCardio(st) ? num(st.min) > 0 || num(st.dist) > 0 : num(st.r) > 0 || num(st.w) > 0) })).filter(e => e.sets.length);
    if (!ex.length) { await PT.alert(ED.id ? "A workout needs at least one set with weight or reps. Use Delete Workout to remove it." : "Add an exercise and at least one set with weight or reps."); return; }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d.date)) { await PT.alert("Pick the day of the workout."); return; }
    if (d.date > PT.ds()) { await PT.alert("That day hasn't happened yet. Pick today or an earlier day."); return; }
    const dur = d.auto ? estimate(app, ex) : d.dur;
    if (!d.auto && !(dur > 0)) { await PT.alert("Type how many minutes it took, or tick \"I don't know\" to work it out from the sets."); return; }
    if (dur > 10 * 3600) { await PT.alert("That's more than 10 hours. Check the minutes."); return; }
    const [hh, mm] = (d.time || "12:00").split(":").map(n => parseInt(n, 10) || 0);
    const start = PT.fromDs(d.date); start.setHours(hh, mm, 0, 0);
    const now = Date.now();
    if (start.getTime() > now + 60000) { await PT.alert("That start time hasn't happened yet. Pick an earlier time."); return; }
    let s = ED.id ? app.sessions.find(x => x.id === ED.id) : null;
    const before = s ? (s.ex || []).map(e => e.name) : [];
    if (!s) {
      s = { id: PT.uid(), v: 1, pid: "manual", ptitle: "Added by hand", day: 0, week: null, unit: d.unit, prs: [], man: 1 };
      app.sessions.push(s);
    }
    s.dtitle = d.title || s.dtitle || "Workout";
    s.date = d.date;
    s.dur = dur;
    if (d.auto) s.durEst = 1; else delete s.durEst;
    s.ts = start.getTime() + dur * 1000;
    s.ex = ex;
    s.sets = ex.reduce((n, e) => n + e.sets.length, 0);
    s.vol = Math.round(app.sessionVolume(s));
    s.note = (d.note || "").trim();
    s.upd = now;
    app.sessions.sort((x, y) => (x.ts || 0) - (y.ts || 0));
    if (!app.saveSessions()) { await PT.alert("Couldn't save. The phone's storage may be full."); return; }
    const names = [...new Set(before.concat(ex.map(e => e.name)))];
    try { app.recomputeSessionPRs(); app.rebuildPRs(); app.rebuildLastPerfFor(names); } catch (e) { console.error("PulseTrack history edit", e); }
    // a name that is gone from every workout: its "last time" goes too
    names.forEach(n => { if (!app.sessions.some(x => (x.ex || []).some(e => e.name === n))) delete app.lastPerf[n]; });
    try { WorkoutStorage.saveLastPerf(app.lastPerf); } catch (e) { }
    PT._catMap = null;
    const wasNew = !ED.id, id = s.id;
    ED = null;
    app.toast(wasNew ? "Workout added to your history" : "Workout updated");
    app.openSessionSheet(id);
    try { if (!$("view-history").classList.contains("hidden")) app.renderHistoryView(); } catch (e) { }
    try { app.renderStreak && app.renderStreak(); } catch (e) { }
  }

  /* ================================================================ taps inside the editor */
  document.addEventListener("click", e => {
    const app = A(); if (!app || !ED || !e.target.closest) return;
    const body = $("sheet-body"); if (!body || body.dataset.he !== "1") return;
    const t = e.target;
    if (t.closest("#he-cancel")) { const id = ED.id; ED = null; if (id) app.openSessionSheet(id); else app.closeSheet(); return; }
    if (t.closest("#he-save")) { save(app); return; }
    if (!body.contains(t)) return;
    const rm = t.closest("[data-he-rm]"), rmx = t.closest("[data-he-rmex]"), add = t.closest("[data-he-addset]");
    if (rm) { readInputs(body); const [ei, si] = rm.dataset.heRm.split(":").map(Number); const ex = ED.d.ex[ei]; if (ex) { ex.sets.splice(si, 1); if (!ex.sets.length) ED.d.ex.splice(ei, 1); } draw(app); return; }
    if (rmx) { readInputs(body); ED.d.ex.splice(+rmx.dataset.heRmex, 1); draw(app); return; }
    if (add) { readInputs(body); const ex = ED.d.ex[+add.dataset.heAddset]; if (ex) ex.sets.push(setFor(app, ex.name, ED.d.date, ex.sets[ex.sets.length - 1])); draw(app); const n = $("sheet-body").querySelector(`[data-he="${add.dataset.heAddset}:${ex.sets.length - 1}:${ex.sets[ex.sets.length - 1] && isCardio(ex.sets[ex.sets.length - 1]) ? "min" : "w"}"]`); if (n) n.focus({ preventScroll: false }); return; }
    if (t.closest("#he-addex")) { readInputs(body); pickExercise(app); return; }
  });
  // the estimate follows along as you type
  document.addEventListener("change", e => {
    const app = A(), body = $("sheet-body"); if (!app || !ED || !body || body.dataset.he !== "1" || !body.contains(e.target)) return;
    if (e.target.id === "he-auto") { readInputs(body); if (!ED.d.auto && !(ED.d.dur > 0)) ED.d.dur = estimate(app, ED.d.ex); draw(app); }
    else if (ED.d.auto && e.target.matches("[data-he]")) { readInputs(body); const est = estimate(app, ED.d.ex), lab = body.querySelector(".pt-he-ck span"), du = $("he-dur"); if (lab) lab.textContent = `I don't know. Work it out from the sets${est ? ` (about ${Math.round(est / 60)} min)` : ""}`; if (du) du.value = Math.round(est / 60) || ""; }
  });

  /* ================================================================ hooks */
  const oSession = proto.openSessionSheet;
  proto.openSessionSheet = function (id, editing) {
    const sb = $("sheet-body"); if (sb) delete sb.dataset.he;
    if (editing) { open(this, id); return; }
    ED = null;
    const r = oSession.call(this, id, false);
    try {
      const s = (this.sessions || []).find(x => x.id === id), grid = document.querySelector("#sheet-body .grid.grid-cols-3");
      if (s && grid && !document.getElementById("pt-he-when")) {
        grid.insertAdjacentHTML("afterend", `<p id="pt-he-when" class="pt-he-when">${esc(whenText(s))}</p>`);
        if (s.durEst) { const v = grid.querySelector("div .font-mono"); if (v) v.textContent = "~" + v.textContent; }
      }
    } catch (e) { console.error("PulseTrack history when", e); }
    return r;
  };
  const oClose = proto.closeSheet;
  proto.closeSheet = function () { ED = null; const sb = $("sheet-body"); if (sb) delete sb.dataset.he; return oClose.apply(this, arguments); };

  const addBtn = $("btn-history-add");
  if (addBtn) addBtn.addEventListener("click", () => { const a = A(); if (a) open(a, null); });

  PT.histEdit = { estimate: ex => estimate(A(), ex), open: id => open(A(), id), add: () => open(A(), null), whenText };

  const css = document.createElement("style"); css.id = "pt-v310-css";
  css.textContent = `
    .pt-he { display: flex; flex-direction: column; gap: .75rem; }
    .pt-he-row { display: grid; grid-template-columns: 1fr 1fr; gap: .5rem; }
    .pt-he-l { display: flex; flex-direction: column; gap: .3rem; font-size: .75rem; font-weight: 700; color: rgb(var(--z300)); min-width: 0; }
    .pt-he-f { width: 100%; min-width: 0; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); border-radius: .75rem; padding: .6rem .7rem; font-size: .875rem; font-weight: 500; color: rgb(var(--z100)); }
    .pt-he-f:focus { outline: none; border-color: rgb(var(--a500)); }
    .pt-he-f:disabled { color: rgb(var(--z400)); }
    .pt-he-dur { display: flex; flex-direction: column; gap: .4rem; }
    .pt-he-ck { display: flex; gap: .55rem; align-items: flex-start; font-size: .78rem; line-height: 1.35; color: rgb(var(--z200)); cursor: pointer; }
    .pt-he-ck input { width: 1.1rem; height: 1.1rem; flex: none; margin-top: .05rem; accent-color: rgb(var(--a600)); }
    .pt-he-ex { background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); border-radius: .85rem; padding: .7rem; display: flex; flex-direction: column; gap: .4rem; }
    .pt-he-exh { display: flex; align-items: center; justify-content: space-between; gap: .5rem; font-size: .875rem; font-weight: 700; color: rgb(var(--z100)); }
    .pt-he-exh span { min-width: 0; overflow-wrap: anywhere; }
    .pt-he-x { flex: none; font-size: .72rem; font-weight: 700; color: rgb(var(--z300)); padding: .3rem .55rem; border-radius: .5rem; background: rgb(var(--z800)); }
    .pt-he-set { display: flex; align-items: center; gap: .35rem; font-size: .75rem; }
    .pt-he-tag { width: .9rem; font-size: .65rem; font-weight: 700; color: rgb(var(--z400)); }
    .pt-he-n { width: 1.1rem; color: rgb(var(--z400)); font-variant-numeric: tabular-nums; }
    .pt-he-in { width: 3.9rem; min-width: 0; background: rgb(var(--z900)); border: 1px solid rgb(var(--z700)); border-radius: .45rem; padding: .35rem .4rem; text-align: right; font-family: ui-monospace, monospace; color: rgb(var(--z100)); }
    .pt-he-in:focus { outline: none; border-color: rgb(var(--a500)); }
    .pt-he-u { font-size: .68rem; color: rgb(var(--z400)); }
    .pt-he-del { margin-left: auto; padding: .3rem .5rem; color: rgb(var(--z400)); border-radius: .4rem; }
    .pt-he-add { align-self: flex-start; font-size: .75rem; font-weight: 700; color: rgb(var(--z100)); padding: .4rem .7rem; border-radius: .6rem; background: rgb(var(--z800)); }
    .pt-he-addex { width: 100%; padding: .75rem; border-radius: .85rem; border: 1px dashed rgb(var(--z600)); font-size: .8rem; font-weight: 700; color: rgb(var(--z100)); }
    .pt-he-when { font-size: .75rem; color: rgb(var(--z300)); text-align: center; margin: -.25rem 0 0; }
    #btn-history-add { width: 100%; padding: .7rem; border-radius: .85rem; border: 1px dashed rgb(var(--z700)); font-size: .8rem; font-weight: 700; color: rgb(var(--z100)); background: transparent; }
    @media (max-width: 370px) { .pt-he-in { width: 3.4rem; } .pt-he-set { gap: .25rem; } }
  `;
  document.head.appendChild(css);
})();
