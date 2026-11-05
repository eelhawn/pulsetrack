
/* =====================================================================
 * PulseTrack 2.12.0: Skip a workout.
 *  - "Skip this workout" on the Home card and "Skip day" on the workout screen. The day counts as done, so Up next moves on to the
 *    following day (and to the next week when the week is finished), exactly like after finishing a workout, but:
 *      · nothing is saved to History, so no stats, volume or streak days are added
 *      · whatever was typed in for that day is cleared, so it comes back fresh next round
 *      · a skipped day shows "SKIPPED" instead of "DONE" in the days list
 *      · an Undo button stays on screen for a few seconds, and the day can still be opened and done later
 *  - nothing is deleted from the program: no need to turn the workouts into a rest day
 * ===================================================================== */
(function () {
  "use strict";
  const proto = ApplicationUI.prototype;
  const FREE = typeof FREESTYLE_ID !== "undefined" ? FREESTYLE_ID : "freestyle";
  const clone = o => JSON.parse(JSON.stringify(o));
  const $ = id => document.getElementById(id);

  /* ------------------------------------------------------ remembering which done days were skipped */
  // st.skipped = [dayNumbers]: only days that are still "done" count, so it tidies itself when a new round starts
  const oGet = proto.getProgState;
  proto.getProgState = function (prog) {
    const st = oGet.apply(this, arguments);
    try {
      if (st && Array.isArray(st.skipped)) {
        const keep = st.skipped.filter(n => Array.isArray(st.done) && st.done.includes(n));
        if (!keep.length) delete st.skipped; else if (keep.length !== st.skipped.length) st.skipped = keep;
      }
    } catch (e) { /* ignore */ }
    return st;
  };
  // finishing a workout on a day you had skipped makes it a normal "done" day again
  const oMark = proto.markDayDone;
  proto.markDayDone = function (prog, dayNumber) {
    if (!this._skipping) {
      try { const st = this.getProgState(prog); if (st && Array.isArray(st.skipped) && st.skipped.includes(dayNumber)) { st.skipped = st.skipped.filter(n => n !== dayNumber); if (!st.skipped.length) delete st.skipped; } } catch (e) { /* ignore */ }
    }
    return oMark.apply(this, arguments);
  };
  const oExtras = proto.dayCardExtras;
  proto.dayCardExtras = function (day) {
    const r = oExtras.apply(this, arguments);
    try {
      const st = this.activeProgram && this.getProgState(this.activeProgram);
      if (st && Array.isArray(st.skipped) && st.skipped.includes(day.dayNumber) && /DONE/.test(r))
        return '<span class="px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-800/60 text-amber-300 text-[10px] font-bold">SKIPPED</span>';
    } catch (e) { /* ignore */ }
    return r;
  };

  /* ---------------------------------------------------------------------------------- skipping */
  const visible = id => { const e = $(id); return !!e && !e.classList.contains("hidden"); };
  function redraw(app) {
    if (visible("view-home")) app.renderHomeView();
    else if (visible("view-days")) app.renderDaysView();
    else if (visible("view-workout")) app.renderWorkoutView();
    if (app.updateDrawerStatus) app.updateDrawerStatus();
  }
  const dayTitle = (app, prog, day) => (app.shortDayTitle ? app.shortDayTitle(prog, day) : "") || day.title || ("Day " + day.dayNumber);
  function enteredCount(app, prog, day) {
    let n = 0;
    (day.exercises || []).forEach(ex => {
      for (let s = 0; s < (ex.sets || 0); s++) {
        const e = (app.logs || {})[app.getLogKey(prog.id, day.dayNumber, ex.id, s)];
        if (e && e.completed) n++;
      }
    });
    return n;
  }
  /** Can this day be skipped? Only a day of a real program (not Freestyle) that has something to do. */
  proto.canSkipDay = function (prog, day) {
    return !!(prog && day && prog.id !== FREE && Array.isArray(day.exercises) && day.exercises.length);
  };

  proto.skipDay = async function (prog, day) {
    prog = prog || this.activeProgram; day = day || this.activeDay;
    if (!this.canSkipDay(prog, day) || this._skipBusy) return false;
    this._skipBusy = true;
    try {
      const title = dayTitle(this, prog, day), typed = enteredCount(this, prog, day);
      const body = `"${title}" will count as done, so Up next moves on to the following day. Nothing is saved to History and your streak isn't touched.`
        + (typed ? ` The ${typed} set${typed === 1 ? "" : "s"} you checked off for this day will be cleared.` : "") + " You can undo it right after.";
      if (!await PT.confirm("Skip this workout?", { title: "Skip this workout?", body, ok: "Skip it", cancel: "Not now", danger: false })) return false;

      // what we need to put everything back if you tap Undo
      const pre = `${prog.id}_d${day.dayNumber}_`, noteKey = `${prog.id}_d${day.dayNumber}`;
      const logSnap = {}; Object.keys(this.logs || {}).forEach(k => { if (k.startsWith(pre)) logSnap[k] = clone(this.logs[k]); });
      const noteSnap = this.dayNotes ? this.dayNotes[noteKey] : undefined;
      const stBefore = clone(this.getProgState(prog));
      const wasActive = this.activeDay === day;
      const onWorkout = visible("view-workout");

      this._skipping = true;
      try {
        this.clearDayLogs(prog, day);
        WorkoutStorage.saveLogs(this.logs);
        this.markDayDone(prog, day.dayNumber);
        const st = this.getProgState(prog);
        if (Array.isArray(st.done) && st.done.includes(day.dayNumber)) { st.skipped = Array.from(new Set([...(Array.isArray(st.skipped) ? st.skipped : []), day.dayNumber])); this.saveProgState(); }
        if (wasActive && this.stopStopwatch) { try { this.stopStopwatch(); } catch (e) { /* ignore */ } }     // the workout timer starts fresh for the next day
        const next = this.nextDayOf(prog);
        if (this.selectProgram) this.selectProgram(prog, next, true);
        else { this.activeProgram = prog; this.activeDay = next; if (next) AppStateMemory.saveActive(prog.id, next.dayNumber); }
      } finally { this._skipping = false; }

      if (onWorkout) this.showView("home");
      redraw(this);
      const next = this.activeDay;
      const undo = () => {
        try {
          this.progState[prog.id] = clone(stBefore); this.saveProgState();
          Object.assign(this.logs, logSnap); WorkoutStorage.saveLogs(this.logs);
          if (noteSnap !== undefined && this.dayNotes && typeof STORAGE_KEY_DAYNOTES !== "undefined") { this.dayNotes[noteKey] = noteSnap; PT.save(STORAGE_KEY_DAYNOTES, this.dayNotes); }
          if (this.selectProgram) this.selectProgram(prog, day, true);
          else { this.activeProgram = prog; this.activeDay = day; AppStateMemory.saveActive(prog.id, day.dayNumber); }
          redraw(this);
          this.toast(`Undone. "${title}" is up next again.`);
        } catch (e) { console.error("PulseTrack skip undo", e); }
      };
      this.toast(`Skipped "${title}".${next && next !== day ? ` Up next: ${dayTitle(this, prog, next)}.` : ""}`, "Undo", undo, 9000);
      return true;
    } finally { this._skipBusy = false; }
  };

  /* ------------------------------------------------------------------------------- the buttons */
  const css = document.createElement("style");
  css.id = "pt-m31a-css";
  css.textContent = `
    #btn-home-skip { width: 100%; padding: .6rem; border-radius: .75rem; font-size: .75rem; font-weight: 700; color: rgb(var(--z300)); background: rgb(var(--z950) / .6); border: 1px solid rgb(var(--z800)); }
    #btn-home-skip:active { background: rgb(var(--z800)); }
    #pt-wk-actions { display: flex; flex-direction: column; align-items: stretch; gap: .4rem; flex: none; }
    #pt-wk-actions button { white-space: nowrap; text-align: center; }
    #btn-skip-day { font-size: .75rem; font-weight: 700; padding: .4rem .7rem; border-radius: .5rem; background: rgb(var(--z800)); color: rgb(var(--z100)); border: 1px solid rgb(var(--z700)); }
    #btn-skip-day:active { background: rgb(var(--a600)); color: #fff; }
  `;
  document.head.appendChild(css);

  function ensureButtons() {
    const resume = $("btn-home-resume");
    if (resume && !$("btn-home-skip")) {
      const b = document.createElement("button");
      b.type = "button"; b.id = "btn-home-skip"; b.className = "tap-active hidden"; b.textContent = "Skip this workout";
      resume.after(b);
    }
    const clear = $("btn-reset-day-progress");
    if (clear && !$("btn-skip-day")) {
      const box = document.createElement("div"); box.id = "pt-wk-actions";
      clear.before(box);
      const b = document.createElement("button");
      b.type = "button"; b.id = "btn-skip-day"; b.className = "tap-active hidden"; b.textContent = "Skip day";
      box.append(b, clear);
    }
  }
  function syncButtons(app) {
    ensureButtons();
    const ok = app.canSkipDay(app.activeProgram, app.activeDay);
    const hb = $("btn-home-skip"); if (hb) hb.classList.toggle("hidden", !ok);
    const cur = !!(app.activeProgram && (!PT.isCurrentProgram || PT.isCurrentProgram(app.activeProgram.id)));
    const wb = $("btn-skip-day"); if (wb) wb.classList.toggle("hidden", !(ok && cur));
  }
  const oHome = proto.renderHomeExtras;
  proto.renderHomeExtras = function () { const r = oHome.apply(this, arguments); try { syncButtons(this); } catch (e) { console.error("PulseTrack skip home", e); } return r; };
  const oWk = proto.renderWorkoutView;
  proto.renderWorkoutView = function () { const r = oWk.apply(this, arguments); try { syncButtons(this); } catch (e) { console.error("PulseTrack skip workout", e); } return r; };

  document.addEventListener("click", e => {
    const b = e.target.closest && e.target.closest("#btn-home-skip, #btn-skip-day"); if (!b) return;
    const app = window.app; if (app) app.skipDay(app.activeProgram, app.activeDay);
  });
})();
  