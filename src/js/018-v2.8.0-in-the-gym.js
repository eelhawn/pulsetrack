
/* =====================================================================
 * PulseTrack 2.8.0 (part 1): in the gym.
 *  - a suggested weight for next time, one tap to fill it in
 *  - the next set is filled in for you once a set is done
 *  - the workout timer starts on your first logged set
 *  - a look-over screen before a workout is saved
 *  - favourite and recent exercises pinned in the picker
 *  - choose which columns a set row shows, and a left-hand mode
 * Nothing here changes what is saved in a workout. Your sets, volume and
 * records are worked out exactly as before.
 * ===================================================================== */
(function () {
  "use strict";
  const proto = ApplicationUI.prototype;
  const A = () => window.app;
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const num = (v, d) => PT.num(v, d == null ? (Math.abs(v % 1) > 0.001 ? 2 : 0) : d);
  const blank = v => v === undefined || v === null || String(v).trim() === "";

  /* ------------------------------------------------------------ options */
  const DEF = { nextHint: true, autoFill: true, autoPrefill: false, takenBtn: true, timerFirstSet: true, finishReview: true, colPrev: false, colTag: true, col1rm: false, lefty: false, workEase: true };
  const opt = k => { const a = A(), v = a && a.settings ? a.settings[k] : undefined; return v === undefined ? DEF[k] : !!v; };
  PT.opt = opt;
  PT.setOpt = (k, v) => { const a = A(); if (!a) return; a.settings[k] = !!v; WorkoutStorage.saveSettings(a.settings); };
  PT.WSCREEN_DEFAULTS = DEF;

  const css = document.createElement("style");
  css.id = "pt-v28a-css";
  css.textContent = `
    .pt-next { display: flex; align-items: center; gap: .6rem; padding: .5rem .55rem .5rem .7rem; border-radius: .8rem; border: 1px solid rgb(var(--z700)); background: rgb(var(--z950)); }
    .pt-next[data-k="up"] { border-color: rgb(var(--a500) / .45); background: rgb(var(--a500) / .08); }
    .pt-next-t { min-width: 0; flex: 1 1 auto; font-size: .72rem; line-height: 1.35; color: rgb(var(--z400)); }
    .pt-next-t b { color: rgb(var(--z100)); font-weight: 800; }
    .pt-next[data-k="up"] .pt-next-t b { color: rgb(var(--a300)); }
    .pt-next-t .pt-next-why { display: block; font-size: .66rem; color: rgb(var(--z500)); }
    .pt-next-use { flex: none; padding: .45rem .75rem; border-radius: .6rem; font-size: .72rem; font-weight: 800; background: rgb(var(--z800)); color: rgb(var(--z100)); border: 1px solid rgb(var(--z700)); }
    .pt-next[data-k="up"] .pt-next-use { background: rgb(var(--a600)); color: #fff; border-color: transparent; }
    .pt-next-use:active { opacity: .8; }
    .pt-rowsub { display: flex; flex-wrap: wrap; gap: .3rem; padding: 0 0 .35rem .25rem; }
    .pt-rowsub:empty { display: none; }
    .pt-chip { font-size: .62rem; font-weight: 700; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; padding: .1rem .4rem; border-radius: .4rem; background: rgb(var(--z800)); color: rgb(var(--z300)); }
    .pt-chip-1rm { background: rgb(var(--a500) / .14); color: rgb(var(--a300)); }
    body.pt-hide-tag .btn-cycle-tag { display: none; }
    body.pt-lefty .set-row > div:first-child { flex-direction: row-reverse; }
    body.pt-lefty .set-row > div:first-child > .btn-check-set { margin-right: .35rem; }
    body.pt-lefty [data-ex-card] .pt-hdr { flex-direction: row-reverse; }
    body.pt-lefty [data-ex-card] .pt-acts { flex-direction: row-reverse; }
    body.pt-lefty [data-ex-card] .pt-acts > .mr-auto { margin-right: 0; margin-left: auto; }
    .pt-star { flex: none; display: inline-flex; align-items: center; justify-content: center; min-width: 2rem; height: 2rem; margin: -.25rem 0; font-size: 1.05rem; line-height: 1; color: rgb(var(--z500)); border-radius: .6rem; }
    .pt-star[aria-pressed="true"] { color: #fbbf24; }
    html[data-mode="light"] .pt-star[aria-pressed="true"] { color: #d97706; }
    .pt-pin-h { display: flex; align-items: center; justify-content: space-between; padding: .375rem 1rem; border-bottom: 1px solid rgb(var(--z800)); background: rgb(var(--z900) / .95); }
    .pt-pin-h span:first-child { font-size: .6875rem; font-weight: 900; letter-spacing: .1em; text-transform: uppercase; }
    .pt-fin-row { display: flex; align-items: center; justify-content: space-between; gap: .75rem; padding: .55rem .75rem; border-radius: .75rem; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); font-size: .75rem; }
    .pt-armed .pt-ic { background: currentColor; }
  `;
  document.head.appendChild(css);

  /* ------------------------------------------------------------ helpers */
  // The exercise list knows the equipment of its own names ("Overhead Press" is a barbell lift, "Lateral Raises" a dumbbell one);
  // the word patterns are the fallback for names it has never heard of.
  const eqk = n => { try { return PT.equipKey ? PT.equipKey(n) : "none"; } catch (e) { return "none"; } };
  const isBarLift = n => {
    const k = eqk(n);
    if (k === "barbell" || k === "ezbar") return true;
    if (k !== "none") return false;
    return /barbell|squat|deadlift|bench press|rack pull|hip thrust|military|good morning|pendlay|yates|ez-bar/i.test(n)
      && !/dumbbell|machine|cable|smith|goblet|kettlebell|leg press|hack|sissy|split/i.test(n);
  };
  const isDbLift = n => /dumbbell|\bdb\b|arnold/i.test(n) || eqk(n) === "dumbbell";
  /** How many dumbbells an exercise counts for when the clean-up renamed it from a name that said so (0 = go by the name). */
  PT.exDbn = ex => (ex && ex.dbn > 0 && ex.dbnFor === ex.name ? ex.dbn : 0);
  const oKind = proto.exKind;
  proto.exKind = function (ex) {
    const k = oKind.apply(this, arguments), d = PT.exDbn(ex);
    return d && k && !k.cardio ? Object.assign({}, k, { dbn: d }) : k;
  };
  const keyOf = (app, ex, s) => app.getLogKey(app.activeProgram.id, app.activeDay.dayNumber, ex.id, s);
  const canon = n => { try { const e = PT.exCanon && PT.exCanon(n); return e ? e.name : n; } catch (e) { return n; } };
  const gymOk = n => { try { return !PT.gymAllows || PT.gymAllows(n); } catch (e) { return true; } };

  /* ============================================================ 1. suggested weight */
  /** The next loadable weight at or above `target`, or null when this gym cannot make one. */
  function snapUp(app, name, target, from) {
    target = Math.round(target * 100) / 100;
    if (isBarLift(name)) {
      const bar = app.selectedBarWeight || 0;
      if (target <= bar) return target;
      const r = app.solvePlates((target - bar) / 2);
      const t = r.exact ? target : (r.over != null ? bar + 2 * r.over : null);
      return t != null && t > from ? Math.round(t * 100) / 100 : null;
    }
    if (isDbLift(name) && PT.gymDb) {
      const g = PT.gymDb();
      if (g && g.step > 0) {
        let v = Math.ceil(target / g.step - 1e-9) * g.step;
        if (v < g.min) v = g.min;
        if (v > g.max + 1e-9) return null;
        return v > from ? Math.round(v * 100) / 100 : null;
      }
    }
    return target > from ? target : null;
  }
  const fmtLast = list => {
    let out = "", lastW = null, n = 0;
    for (const x of list) {
      if (n >= 6) { out += ", …"; break; }
      const w = parseFloat(x.weight) || 0, r = parseFloat(x.reps) || 0;
      out += (n ? ", " : "") + (w !== lastW ? (w ? num(w) + "×" : (x.bz ? "BW×" : "")) : "") + num(r);
      lastW = w; n++;
    }
    return out;
  };
  /**
   * What to try next time, from the last time you did this exercise and the rep range in the program.
   * Hit the top of the range on every top set: go heavier and start at the bottom of the range.
   * Missed the bottom on a set: stay at that weight. Otherwise: same weight, one more rep.
   * Returns null when there is nothing to compare, or the reps are not a range (AMRAP, pyramids, times).
   */
  function nextTarget(app, ex) {
    if (!app || !ex || ex.type === "tabata" || !ex.name) return null;
    const kind = app.exKind(ex);
    if (kind.cardio) return null;
    const range = app.parseRepRange(ex.reps);
    if (!range) return null;
    const prev = (app.lastPerf[ex.name] || []).filter(x => x && x.tag !== "W" && x.tag !== "D" && x.min === undefined);
    if (!prev.length) return null;
    const W = x => parseFloat(x.weight) || 0, R = x => parseFloat(x.reps) || 0;
    const assist = kind.bw && app.bwMode(ex.name) === "assist";
    const ws = prev.map(W);
    const bz = !kind.bw && !Math.max(...ws) && prev.some(x => x.bz);     // typed 0 = bodyweight
    if (!kind.bw && !Math.max(...ws) && !bz) return null;
    const topW = assist ? Math.min(...ws) : Math.max(...ws);
    const atTop = prev.filter(x => W(x) === topW);
    const reps = atTop.map(R);
    const inc = app.increment(), u = app.wLabel();
    const lo = range.lo, hi = range.hi;
    // a deload week (Progress > Overview > Deload check): lighter weight, fewer sets
    const dl = PT.deloadOn && PT.deloadOn(app);
    if (dl && !bz) {
      const dn = Math.max(1, (ex.sets || 1) - (dl.sets || 1)), r = Math.max(lo, Math.min(hi, Math.round(reps.reduce((t, x) => t + x, 0) / (reps.length || 1)) || lo));
      const lighter = kind.bw || assist ? topW : Math.max(inc, Math.round(topW * (1 - (dl.pct || 0.1)) / inc) * inc);
      const wTxt0 = lighter ? num(lighter) + " " + u : (kind.bw ? "bodyweight" : "");
      const per0 = []; for (let i = 0; i < dn; i++) per0.push({ w: lighter, r, bz: false });
      return { kind: "deload", w: lighter, per: per0, cap: dn, last: fmtLast(prev), tryTxt: `deload: ${wTxt0}${wTxt0 ? " " : ""}× ${r}, ${dn} set${dn === 1 ? "" : "s"}`, why: "Deload week: lighter and one set fewer. Stop with 3 or more reps left in the tank.", lo, hi };
    }
    let k, nextW = topW, why = "", capped = false;
    if (reps.every(r => r >= hi)) {
      if (bz) {
        k = "reps"; capped = true; why = `You hit ${hi}+ on every set. Add reps, or hold a weight to make it harder.`;
      } else if (assist) {
        if (topW > 0) { nextW = Math.max(0, Math.round((topW - inc) * 100) / 100); k = "up"; why = `You hit ${hi}+ on every top set, so use less help.`; }
        else { k = "reps"; why = "No help needed. Add reps."; }
      } else {
        const t = snapUp(app, ex.name, topW + inc, topW);
        if (t == null) { k = "reps"; capped = true; why = "That's the heaviest this gym has, so add reps."; }
        else { nextW = t; k = "up"; why = `You hit ${hi}+ on every top set last time.`; }
      }
    } else if (reps.some(r => r < lo)) {
      k = "hold"; why = `A set was under ${lo} reps, so stay here until every set reaches ${lo}.`;
    } else { k = "reps"; why = "Same weight. One more rep on each set is progress."; }
    // a heavy work day (Home check-in): keep the weight for lifts that work beats up, add reps instead
    if (k === "up" && !assist && PT.workEaseFor && PT.workEaseFor(ex.name)) { k = "reps"; nextW = topW; why = "Heavy work day, so keep this weight and add a rep or two."; }
    const per = [];
    for (let i = 0; i < (ex.sets || 0); i++) {
      let r;
      if (k === "up") r = lo;
      else if (k === "hold") r = lo;
      else r = Math.min(hi, (reps.length ? reps[i % reps.length] : lo) + 1);
      per.push({ w: nextW, r, bz: !!bz });
    }
    const rangeTxt = lo === hi ? `${hi}` : `${lo}–${hi}`;
    const wTxt = nextW ? num(nextW) + " " + u : (kind.bw || bz ? "bodyweight" : "");
    let tryTxt;
    if (k === "up") tryTxt = `try ${wTxt} × ${rangeTxt}`;
    else if (k === "hold") tryTxt = `stay at ${wTxt}, reach ${lo}+ on every set`;
    else tryTxt = `${wTxt}${wTxt ? " " : ""}× ${Math.min(hi, Math.max(...reps, lo) + 1)}${capped ? "+" : ""}`.trim();
    return { kind: k, w: nextW, per, last: fmtLast(prev), tryTxt, why, lo, hi };
  }
  PT.nextTarget = ex => nextTarget(A(), ex);

  function nextCardHtml(app, ex, exIndex) {
    if (!opt("nextHint") || app.settings.showLogger === false) return "";
    const t = nextTarget(app, ex);
    if (!t) return "";
    const allDone = app.activeProgram && app.activeDay && (() => {
      for (let s = 0; s < (ex.sets || 0); s++) { const e = app.logs[keyOf(app, ex, s)]; if (!e || !e.completed) return false; }
      return (ex.sets || 0) > 0;
    })();
    if (allDone) return "";
    return `<div class="pt-next" data-k="${t.kind}" data-pt-next="${exIndex}">
      <div class="pt-next-t">Last time <b>${esc(t.last)}</b> → ${esc(t.tryTxt)}<span class="pt-next-why">${esc(t.why)}</span></div>
      <button type="button" class="pt-next-use tap-active" data-exindex="${exIndex}" aria-label="Fill in the suggested weight and reps">Fill in</button></div>`;
  }
  const oSug = proto.suggestionFor;
  proto.suggestionFor = function (ex) { return this._skipSug ? null : oSug.apply(this, arguments); };
  const oExtras = proto.workoutCardExtrasHtml;
  proto.workoutCardExtrasHtml = function (exercise, exIndex) {
    let html = "";
    const mine = opt("nextHint");
    this._skipSug = mine;
    try { html = oExtras.apply(this, arguments); } finally { this._skipSug = false; }
    try { html += nextCardHtml(this, exercise, exIndex); } catch (e) { console.error("PulseTrack next hint", e); }
    return html;
  };
  function fillNext(app, exIndex) {
    const ex = app.activeDay && app.activeDay.exercises[exIndex];
    const t = ex && nextTarget(app, ex);
    if (!t) return;
    const saved = [];
    let n = 0;
    for (let s = 0; s < Math.min(ex.sets || 0, t.cap || 99); s++) {
      const key = keyOf(app, ex, s);
      const e = app.logs[key] || { completed: false, weight: "", reps: "", tag: "R" };
      if (e.completed || e.tag === "W") continue;
      saved.push([key, app.logs[key] ? JSON.stringify(app.logs[key]) : null]);
      const p = t.per[s] || t.per[t.per.length - 1];
      e.weight = p.w ? String(p.w) : (p.bz ? "0" : "");
      e.reps = String(p.r);
      app.logs[key] = e; n++;
    }
    if (!n) { app.toast("All the sets are already done"); return; }
    WorkoutStorage.saveLogs(app.logs);
    app.renderWorkoutView();
    const p0 = t.per[0];
    app.toast(`Filled ${n} set${n > 1 ? "s" : ""}: ${p0.w ? num(p0.w) + " × " : (p0.bz ? "BW × " : "")}${p0.r}${t.per.some(p => p.r !== p0.r) ? "+" : ""}`, "Undo", () => {
      saved.forEach(([k, v]) => { if (v === null) delete app.logs[k]; else app.logs[k] = JSON.parse(v); });
      WorkoutStorage.saveLogs(app.logs);
      app.renderWorkoutView();
    }, 6000);
  }

  /* ============================================================ 2. fill the next set; 7. timer on the first set */
  function dayHasDone(app) {
    if (!app.activeProgram || !app.activeDay) return false;
    return (app.activeDay.exercises || []).some(ex => {
      for (let s = 0; s < (ex.sets || 0); s++) { const e = app.logs[keyOf(app, ex, s)]; if (e && e.completed) return true; }
      return false;
    });
  }
  function onSetDone(app, btn) {
    // the timer starts with the first set you log
    if (app._tmArmed) beginTimer(app, true);
    if (!opt("autoFill")) return;
    const card = btn.closest("[data-ex-card]"), row = btn.closest(".set-row");
    if (!card || !row) return;
    const ex = app.activeDay.exercises[parseInt(card.dataset.exCard, 10)];
    const s = parseInt(row.dataset.setIndex, 10);
    if (!ex || !(s + 1 < (ex.sets || 0)) || ex.type === "tabata" || app.exKind(ex).cardio) return;
    const cur = app.logs[btn.dataset.key];
    if (!cur || (cur.tag || "R") === "W" || (blank(cur.weight) && blank(cur.reps))) return;
    const nk = keyOf(app, ex, s + 1);
    const nx = app.logs[nk] || { completed: false, weight: "", reps: "", tag: "R" };
    if (nx.completed || (nx.tag || "R") === "W" || !blank(nx.weight) || !blank(nx.reps)) return;
    if (!blank(cur.weight)) nx.weight = String(cur.weight);
    if (!blank(cur.reps)) nx.reps = String(cur.reps);
    app.logs[nk] = nx;
    WorkoutStorage.saveLogs(app.logs);
  }
  document.addEventListener("click", e => {
    try {
      const a = A(); if (!a || !a.dom || !a.dom.exercisesList) return;
      const t = e.target;
      const btn = t.closest && t.closest(".btn-check-set");
      if (btn && a.dom.exercisesList.contains(btn) && btn.dataset.completed !== "1") onSetDone(a, btn);
      const use = t.closest && t.closest(".pt-next-use");
      if (use && a.dom.exercisesList.contains(use)) fillNext(a, parseInt(use.dataset.exindex, 10));
      if (t.closest && t.closest("#session-stopwatch-badge") && a._tmArmed) beginTimer(a, false);
    } catch (err) { console.error("PulseTrack 2.8 click", err); }
  }, true);

  const oStart = proto.startStopwatch;
  function freshSaved() {
    let raw = null; try { raw = PTLS.getItem(STORAGE_KEY_SESSION_START); } catch (e) { }
    if (!raw) return false;
    const now = Date.now();
    let ok = false;
    try {
      if (/^\d+$/.test(String(raw).trim())) ok = now - parseInt(raw, 10) < 12 * 3600 * 1000;
      else { const o = JSON.parse(raw); ok = !!o && now - Math.max(+o.la || 0, +o.r || 0, +o.t0 || 0) <= 12 * 3600 * 1000; }
    } catch (e) { ok = false; }
    if (!ok) { try { PTLS.removeItem(STORAGE_KEY_SESSION_START); } catch (e) { } }
    return ok;
  }
  function showArmed(app) {
    const b = app.dom.stopwatchBadge, d = app.dom.stopwatchDisplay;
    if (!b || !d) return;
    clearInterval(app.sessionInterval);
    b.classList.remove("hidden"); b.classList.add("flex");
    b.dataset.st = "armed"; b.classList.add("pt-armed");
    const ic = b.querySelector(".pt-ic"); if (ic) ic.className = "pt-ic pt-ic-stop";
    d.textContent = "Ready";
    b.setAttribute("aria-label", "Workout timer. It starts when you log your first set. Tap to start it now.");
  }
  function hideArmed(app) {
    const b = app.dom && app.dom.stopwatchBadge; if (!b) return;
    b.classList.remove("pt-armed");
    if (b.dataset.st === "armed") { delete b.dataset.st; b.classList.add("hidden"); b.classList.remove("flex"); }
  }
  function beginTimer(app, auto) {
    app._tmArmed = false;
    const b = app.dom.stopwatchBadge; if (b) b.classList.remove("pt-armed");
    oStart.call(app);
    if (!auto) app.toast("Workout timer started");
  }
  proto.startStopwatch = function () {
    if (this._tm || !opt("timerFirstSet") || freshSaved() || dayHasDone(this)) {
      this._tmArmed = false; hideArmed(this);
      return oStart.apply(this, arguments);
    }
    this._tmArmed = true;
    showArmed(this);
  };
  const oStop = proto.stopStopwatch;
  proto.stopStopwatch = function () {
    this._tmArmed = false;
    const r = oStop.apply(this, arguments);
    const b = this.dom && this.dom.stopwatchBadge; if (b) b.classList.remove("pt-armed");
    return r;
  };
  const oShowView = proto.showView;
  proto.showView = function (v) {
    const r = oShowView.apply(this, arguments);
    try { if (v !== "workout" && this._tmArmed) { this._tmArmed = false; hideArmed(this); } } catch (e) { }
    return r;
  };

  /* ============================================================ 6. look it over before it is saved */
  function reviewInfo(app) {
    const prog = app.activeProgram, day = app.activeDay;
    let vol = 0, sets = 0, total = 0, exN = 0;
    const prs = [];
    (day.exercises || []).forEach(ex => {
      total += ex.sets || 0;
      const done = [];
      for (let s = 0; s < (ex.sets || 0); s++) {
        const e = app.logs[keyOf(app, ex, s)];
        if (e && e.completed) done.push(app.entryToSet(ex, e));
      }
      if (!done.length) return;
      exN++; sets += done.length;
      const dbn = PT.exDbn(ex) || (isDbLift(ex.name) ? PT.dbCount(ex.name, ex.reps) : undefined);
      vol += done.reduce((a, st) => a + app.setVolume(ex.name, st, PT.ds(), dbn), 0);
      const best = Math.max(0, ...done.filter(st => st.t !== "W").map(st => app.setE1rm(ex.name, st, PT.ds())));
      const was = app.priorBest(ex.name);
      if (best > 0 && best > was) prs.push({ name: ex.name, value: best, was });
    });
    let last = null;
    if (prog.id !== FREESTYLE_ID) {
      const title = app.shortDayTitle(prog, day);
      last = (app.sessions || []).filter(s => s.pid === prog.id && (s.day === day.dayNumber || (title && s.dtitle === title)))
        .sort((a, b) => (b.ts || 0) - (a.ts || 0))[0] || null;
    }
    return { vol, sets, total, exN, prs, last };
  }
  function openReview(app, info) {
    return new Promise(resolve => {
      const K = PT.kit, el = K.sheet("pt-fin", 70), u = app.wLabel();
      const sec = app.timerSeconds ? app.timerSeconds() : 0;
      const st = app.timerState ? app.timerState() : null;
      const timeTxt = app._tm ? PT.fmtDur(sec) : (app._tmArmed ? "—" : PT.fmtDur(sec));
      const timeNote = st === "pause" ? "Timer is paused" : st === "stop" ? "Timer is stopped" : "";
      let cmp = `<span class="text-zinc-400">${app.activeProgram.id === FREESTYLE_ID ? "Freestyle workout" : "First time on this day"}</span>`;
      if (info.last && info.last.vol > 0 && info.vol > 0) {
        const d = info.vol - info.last.vol, pct = Math.round(d / info.last.vol * 100);
        const when = PT.fmtDate(info.last.date, { month: "short", day: "numeric" });
        cmp = d === 0 || pct === 0
          ? `<span class="text-zinc-200 font-bold">Same volume</span> <span class="text-zinc-500">as ${esc(when)}</span>`
          : `<span class="${d > 0 ? "text-emerald-400" : "text-amber-300"} font-bold">${d > 0 ? "▲" : "▼"} ${Math.abs(pct)}% ${d > 0 ? "more" : "less"}</span> <span class="text-zinc-500">than ${esc(when)} (${Math.round(info.last.vol).toLocaleString()} → ${Math.round(info.vol).toLocaleString()} ${u})</span>`;
      }
      const left = info.total - info.sets;
      const card = K.openSheet(el, `${K.head("Ready to save?", "Look it over, then save it to History.")}
        <div class="grid grid-cols-3 gap-2 text-center">
          <div class="bg-zinc-950 border border-zinc-800 rounded-xl p-2"><span class="block text-[10px] text-zinc-500 uppercase font-bold">Time</span><span class="font-mono font-bold text-white text-sm">${esc(timeTxt)}</span></div>
          <div class="bg-zinc-950 border border-zinc-800 rounded-xl p-2"><span class="block text-[10px] text-zinc-500 uppercase font-bold">Sets</span><span class="font-mono font-bold text-white text-sm">${info.sets}<span class="text-zinc-500">/${info.total}</span></span></div>
          <div class="bg-zinc-950 border border-zinc-800 rounded-xl p-2"><span class="block text-[10px] text-zinc-500 uppercase font-bold">Volume</span><span class="font-mono font-bold text-emerald-400 text-sm">${Math.round(info.vol).toLocaleString()}</span></div>
        </div>
        ${timeNote ? `<p class="text-[11px] text-amber-300 -mt-2">${esc(timeNote)}. That's the time that will be saved.</p>` : ""}
        <div class="pt-fin-row"><span class="text-zinc-400 font-semibold">Volume</span><span class="text-right">${cmp}</span></div>
        ${info.prs.length ? `<div class="rounded-xl border border-amber-800/50 bg-amber-950/30 px-3 py-2.5 space-y-1">
          <span class="block text-[10px] font-black uppercase tracking-wider text-amber-300">🏅 ${info.prs.length} new record${info.prs.length > 1 ? "s" : ""}</span>
          ${info.prs.slice(0, 6).map(p => `<div class="flex items-baseline justify-between gap-2 text-xs"><span class="font-semibold text-white truncate">${esc(p.name)}</span><span class="font-mono text-amber-300 shrink-0">${num(p.value, 0)} ${u}${p.was ? ` <span class="text-zinc-500">was ${num(p.was, 0)}</span>` : ""}</span></div>`).join("")}
        </div>` : `<div class="pt-fin-row"><span class="text-zinc-400 font-semibold">Records</span><span class="text-zinc-500">No new records today</span></div>`}
        ${left > 0 ? `<p class="text-[11px] text-zinc-400">${left} set${left > 1 ? "s are" : " is"} not checked off. Unchecked sets are not saved.</p>` : ""}
        <div class="grid grid-cols-2 gap-2 pt-1">
          <button type="button" data-fin="no" class="py-3 rounded-xl bg-zinc-800 text-zinc-100 text-sm font-bold tap-active">Keep going</button>
          <button type="button" data-fin="yes" class="py-3 rounded-xl bg-emerald-600 text-white text-sm font-extrabold tap-active" style="pointer-events:none;opacity:.45;transition:opacity .2s">Save workout</button>
        </div>`);
      let done = false;
      el.__onClose = () => { if (!done) { done = true; resolve(false); } };
      // "Save workout" wakes up a moment after the sheet opens, so a second tap meant for Finish Workout (or a strap
      // brushing the screen) can't land on it
      setTimeout(() => { const y = card.querySelector('[data-fin="yes"]'); if (y) { y.style.pointerEvents = ""; y.style.opacity = ""; } }, 700);
      card.addEventListener("click", e => {
        const b = e.target.closest("[data-fin]"); if (!b) return;
        done = true; resolve(b.dataset.fin === "yes"); K.closeSheet(el);
      });
    });
  }
  const oFinish = proto.finishWorkout;
  proto.finishWorkout = async function () {
    if (this._finReview) return;
    try {
      if (this.activeProgram && this.activeDay) {
        const info = reviewInfo(this);
        if (info.sets > 0) {            // (a workout with nothing checked off already asks "Finish anyway?")
          this._finReview = true;
          let go = false;
          try {
            go = opt("finishReview")
              ? await openReview(this, info)
              : await PT.confirm("Finish this workout?", { title: "Finish workout?", body: `${info.sets} of ${info.total} set${info.total === 1 ? "" : "s"} checked off. They will be saved to History.`, ok: "Finish workout", cancel: "Not yet", danger: false });
          } finally { this._finReview = false; }
          if (!go) return;
        }
      }
    } catch (e) { console.error("PulseTrack finish review", e); this._finReview = false; }
    return oFinish.apply(this, arguments);
  };

  /* ============================================================ 4. favourites and recent in the picker */
  const favs = () => { const a = A(); const f = a && a.settings && a.settings.favEx; return Array.isArray(f) ? f : []; };
  PT.isFav = n => favs().includes(canon(n));
  PT.toggleFav = n => {
    const a = A(); if (!a) return false;
    const c = canon(n), f = favs().slice(), i = f.indexOf(c);
    if (i >= 0) f.splice(i, 1); else f.unshift(c);
    a.settings.favEx = f; WorkoutStorage.saveSettings(a.settings);
    return i < 0;
  };
  function recentNames(app, limit) {
    const out = [], seen = new Set();
    const list = (app.sessions || []).slice().sort((a, b) => (b.ts || 0) - (a.ts || 0));
    for (const s of list) for (const e of (s.ex || [])) {
      if (!e || !e.name) continue;
      const c = canon(e.name);
      if (seen.has(c) || !PT.exCanon(c)) continue;
      seen.add(c); out.push(c);
      if (out.length >= limit) return out;
    }
    return out;
  }
  function pinRow(app, name, icon, isSwap) {
    const btn = document.createElement("button");
    const isCur = isSwap && PT.sameEx(name, app.exCurrent);
    btn.className = `w-full flex items-center gap-3 px-4 min-h-[52px] py-2 border-b border-zinc-800/60 border-l-2 text-left tap-active transition ${isCur ? "border-l-emerald-500 bg-emerald-950/30" : "border-l-transparent hover:bg-zinc-900"}`;
    btn.dataset.pin = "1";
    btn.innerHTML = `<span class="flex-grow min-w-0"><span class="block text-sm font-semibold ${isCur ? "text-emerald-300" : "text-zinc-100"} leading-snug">${esc(name)}</span></span>
      ${isCur ? '<span class="shrink-0 text-[10px] font-bold uppercase tracking-wide text-emerald-400">Current</span>' : ""}
      <span class="pt-star" role="button" aria-label="Favorite" data-name="${esc(name)}" aria-pressed="${PT.isFav(name)}">${PT.isFav(name) ? "★" : "☆"}</span>
      <svg class="w-4 h-4 shrink-0 ${isCur ? "text-emerald-400" : "text-zinc-600"}" fill="none" stroke="currentColor" viewBox="0 0 24 24">${icon}</svg>`;
    btn.addEventListener("click", () => app.handleExerciseSelection(name, btn));
    return btn;
  }
  function buildPins(app) {
    const box = app.dom.exListContainer; if (!box) return;
    box.querySelectorAll("[data-pt-pins]").forEach(n => n.remove());
    const q = (app.dom.exSearchInput && app.dom.exSearchInput.value || "").trim();
    if (q) return;
    const tgt = app.exerciseModalTarget || {};
    const isSwap = tgt.action === "swap";
    const cat = app.exCat && app.exCat !== "All" ? app.exCat : null;
    const ok = n => PT.exCanon(n) && gymOk(n) && (!cat || PT.category(n) === cat);
    const fav = favs().filter(ok);
    const rec = recentNames(app, 12).filter(n => ok(n) && !fav.includes(n)).slice(0, 8);
    if (!fav.length && !rec.length) return;
    const icon = isSwap ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4M16 17H4m0 0l4-4m-4 4l4 4"/>' : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 5v14m7-7H5"/>';
    const wrap = document.createElement("div");
    wrap.dataset.ptPins = "1";
    const sec = (title, color, list) => {
      const h = document.createElement("div");
      h.className = "pt-pin-h sticky top-0 z-10 backdrop-blur";
      h.innerHTML = `<span class="${color}">${title}</span><span class="text-[10px] font-bold text-zinc-500">${list.length}</span>`;
      wrap.appendChild(h);
      list.forEach(n => wrap.appendChild(pinRow(app, n, icon, isSwap)));
    };
    if (fav.length) sec("★ Favorites", "text-amber-300", fav);
    if (rec.length) sec("Recent", "text-sky-300", rec);
    const sim = box.querySelector(".pt-sim");
    const anchor = sim || box.firstElementChild;
    if (anchor && box.contains(anchor)) anchor.after(wrap); else box.prepend(wrap);
  }
  function addStars(app) {
    const box = app.dom.exListContainer; if (!box) return;
    box.querySelectorAll("button").forEach(b => {
      if (b.dataset.pin || b.classList.contains("sugg-item") || b.querySelector(".pt-star")) return;
      const nm = b.querySelector(".flex-grow > span"); if (!nm) return;
      const name = nm.textContent.trim(); if (!name) return;
      const svg = b.querySelector("svg"); if (!svg) return;
      const star = document.createElement("span");
      star.className = "pt-star"; star.setAttribute("role", "button"); star.setAttribute("aria-label", "Favorite");
      star.dataset.name = name; star.setAttribute("aria-pressed", String(PT.isFav(name))); star.textContent = PT.isFav(name) ? "★" : "☆";
      b.insertBefore(star, svg);
    });
    if (!box.__ptStar) {
      box.__ptStar = true;
      box.addEventListener("click", e => {
        const st = e.target.closest && e.target.closest(".pt-star"); if (!st) return;
        e.stopPropagation(); e.preventDefault();
        const on = PT.toggleFav(st.dataset.name);
        const c = canon(st.dataset.name);
        box.querySelectorAll(".pt-star").forEach(s => { if (canon(s.dataset.name) === c) { s.textContent = on ? "★" : "☆"; s.setAttribute("aria-pressed", String(on)); } });
        const a = A(); if (a) { const keep = box.scrollTop; buildPins(a); box.scrollTop = keep; }
      }, true);
    }
  }
  const oList = proto.renderExerciseList;
  proto.renderExerciseList = function (query) {
    const r = oList.apply(this, arguments);
    try { buildPins(this); addStars(this); } catch (e) { console.error("PulseTrack picker pins", e); }
    return r;
  };
  // ☆ on the exercise page
  const oExSheet = proto.exSheetExtrasHtml;
  proto.exSheetExtrasHtml = function (name) {
    let html = oExSheet.apply(this, arguments);
    try { html += `<button type="button" id="ex-fav" class="w-full py-2.5 rounded-xl bg-zinc-800/70 text-zinc-200 text-xs font-bold tap-active" data-name="${esc(name)}">${PT.isFav(name) ? "★ Favorite · tap to remove" : "☆ Add to favorites"}</button>`; } catch (e) { }
    return html;
  };
  const oBindSheet = proto.bindExSheetV4;
  proto.bindExSheetV4 = function (name) {
    const r = oBindSheet.apply(this, arguments);
    try {
      const b = document.getElementById("ex-fav");
      if (b) b.addEventListener("click", () => { const on = PT.toggleFav(name); b.textContent = on ? "★ Favorite · tap to remove" : "☆ Add to favorites"; });
    } catch (e) { }
    return r;
  };

  /* ============================================================ 10. what a set row shows */
  function subHtml(app, ex, s, entry) {
    const bits = [];
    if (opt("colPrev")) {
      const p = (app.lastPerf[ex.name] || [])[s];
      if (p && p.min === undefined) bits.push(`<span class="pt-chip">Last ${p.bz && !(parseFloat(p.weight) > 0) ? "BW" : esc(num(p.weight))}×${esc(num(p.reps))}</span>`);
    }
    if (opt("col1rm")) {
      const v = app.liveE1rm(ex, entry || {});
      if (v > 0) bits.push(`<span class="pt-chip pt-chip-1rm">e1RM ${esc(num(v, 0))}</span>`);
    }
    return bits.join("");
  }
  function exOfCard(app, card) { return app.activeDay && app.activeDay.exercises[parseInt(card.dataset.exCard, 10)]; }
  function decorate(app) {
    document.body.classList.toggle("pt-lefty", opt("lefty"));
    document.body.classList.toggle("pt-hide-tag", !opt("colTag"));
    const list = app.dom.exercisesList; if (!list) return;
    list.querySelectorAll("[data-ex-card]").forEach(card => {
      const hdr = card.querySelector(".pt-2.border-t > div:first-child"); if (hdr) hdr.classList.add("pt-hdr");
      const acts = card.querySelector(".pt-2.border-t > div:last-child"); if (acts) acts.classList.add("pt-acts");
      const ex = exOfCard(app, card); if (!ex || app.exKind(ex).cardio || ex.type === "tabata") return;
      card.querySelectorAll(".set-row").forEach(row => {
        const inp = row.querySelector(".input-set-field"); if (!inp) return;
        const s = parseInt(row.dataset.setIndex, 10);
        let sub = row.querySelector(":scope > .pt-rowsub");
        if (!sub) { sub = document.createElement("div"); sub.className = "pt-rowsub"; row.appendChild(sub); }
        sub.innerHTML = subHtml(app, ex, s, app.logs[inp.dataset.key]);
      });
    });
    if (!list.__ptSub) {
      list.__ptSub = true;
      list.addEventListener("input", e => {
        if (!opt("col1rm")) return;
        const inp = e.target.closest && e.target.closest(".input-set-field"); if (!inp) return;
        const row = inp.closest(".set-row"), card = inp.closest("[data-ex-card]"); if (!row || !card) return;
        const a = A(), ex = exOfCard(a, card), sub = row.querySelector(":scope > .pt-rowsub"); if (!ex || !sub) return;
        sub.innerHTML = subHtml(a, ex, parseInt(row.dataset.setIndex, 10), a.logs[inp.dataset.key]);
      });
    }
  }
  PT.refreshRows = () => { const a = A(); if (a && a.dom && a.dom.viewWorkout && !a.dom.viewWorkout.classList.contains("hidden")) a.renderWorkoutView(); else if (a) { document.body.classList.toggle("pt-lefty", opt("lefty")); document.body.classList.toggle("pt-hide-tag", !opt("colTag")); } };
  const oRender = proto.renderWorkoutView;
  proto.renderWorkoutView = function () {
    const r = oRender.apply(this, arguments);
    try { decorate(this); } catch (e) { console.error("PulseTrack row options", e); }
    return r;
  };
  // the look is applied as soon as the app is up, even before a workout is opened
  const oInit = proto.initExtras;
  if (oInit) proto.initExtras = function () {
    const r = oInit.apply(this, arguments);
    try { const st = this.settings || {}; document.body.classList.toggle("pt-lefty", st.lefty === undefined ? DEF.lefty : !!st.lefty); document.body.classList.toggle("pt-hide-tag", !(st.colTag === undefined ? DEF.colTag : !!st.colTag)); } catch (e) { }
    return r;
  };
})();
  