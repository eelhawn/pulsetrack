/* =====================================================================
 * PulseTrack 2.79.0: fill in the whole workout with the suggested weights.
 *  Every exercise already shows "Last time ... try ..." with a Fill in button. Now:
 *  - with the switch on (it is OFF by default since 2.83.1), the first time you open a day in a week every set is filled in with that suggestion
 *    (weight and reps), so a repeating week (your A/B weeks, or any program) starts from last time's numbers plus the usual step up. Nothing is checked off for you.
 *  - a "Fill in suggested weights" button at the top of the workout does it on demand, with Undo.
 *  - Settings → Workout screen has a switch: "Pre-fill the whole workout" (off by default).
 *  Numbers you already typed or checked off are never changed. The suggestion is exactly the one on each exercise card
 *  (same step up, deload week and heavy-work-day rules).
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined" || !PT.nextTarget || !PT.opt) return;
  const proto = ApplicationUI.prototype;
  const A = () => window.app;
  const blank = v => v === undefined || v === null || String(v).trim() === "";
  const keyOf = (app, ex, s) => app.getLogKey(app.activeProgram.id, app.activeDay.dayNumber, ex.id, s);
  const isFree = prog => typeof FREESTYLE_ID !== "undefined" && prog && prog.id === FREESTYLE_ID;

  /** the sets that would be filled: empty, not a warm-up, not checked off */
  function plan(app) {
    const out = [], prog = app.activeProgram, day = app.activeDay;
    if (!prog || !day || isFree(prog)) return out;
    (day.exercises || []).forEach(ex => {
      let t = null; try { t = PT.nextTarget(ex); } catch (e) { t = null; }
      if (!t || !t.per || !t.per.length) return;
      for (let s = 0; s < Math.min(ex.sets || 0, t.cap || 99); s++) {
        const key = keyOf(app, ex, s), e = app.logs[key];
        if (e && (e.completed || e.tag === "W" || !blank(e.weight) || !blank(e.reps))) continue;
        const p = t.per[s] || t.per[t.per.length - 1];
        out.push({ key, id: ex.id, w: p.w ? String(p.w) : (p.bz ? "0" : ""), r: String(p.r), prev: e ? JSON.stringify(e) : null });
      }
    });
    return out;
  }
  function fill(app, items) {
    items.forEach(it => { const e = app.logs[it.key] || { completed: false, weight: "", reps: "", tag: "R" }; e.weight = it.w; e.reps = it.r; app.logs[it.key] = e; });
    WorkoutStorage.saveLogs(app.logs);
  }
  function undo(app, items) {
    items.forEach(it => { if (it.prev === null) delete app.logs[it.key]; else app.logs[it.key] = JSON.parse(it.prev); });
    WorkoutStorage.saveLogs(app.logs);
    app.renderWorkoutView();
  }
  const count = items => new Set(items.map(x => x.id)).size;
  const visible = () => { const v = document.getElementById("view-workout"); return !!v && !v.classList.contains("hidden"); };
  /** one stamp per program week, so a day is pre-filled once a week and not again if you clear it */
  const token = app => { try { const st = app.getProgState(app.activeProgram); return st.week + ":" + (st.round || 1); } catch (e) { return PT.ds(); } };
  const touched = (app, day) => (day.exercises || []).some(ex => {
    for (let s = 0; s < (ex.sets || 0); s++) { const e = app.logs[keyOf(app, ex, s)]; if (e && (e.completed || !blank(e.weight) || !blank(e.reps))) return true; }
    return false;
  });

  function prefill(app) {
    if (!PT.opt("autoPrefill")) return false;
    const prog = app.activeProgram, day = app.activeDay;
    if (!prog || !day || isFree(prog) || !(day.exercises || []).length) return false;
    const gk = prog.id + "_d" + day.dayNumber, tk = token(app), g = app.settings.prefilled || {};
    if (g[gk] === tk) return false;
    const items = touched(app, day) ? [] : plan(app);
    if (!items.length && !touched(app, day)) return false;           // no history yet: try again next time
    const stamp = () => { app.settings.prefilled = Object.assign({}, app.settings.prefilled || {}); app.settings.prefilled[gk] = tk; try { WorkoutStorage.saveSettings(app.settings); } catch (e) { } };
    if (!items.length) { stamp(); return false; }                       // already typed or ticked: leave it
    fill(app, items); stamp();
    if (visible()) setTimeout(() => { try { app.toast(`Filled in ${items.length} sets with the suggested weights`, "Undo", () => undo(app, items), 7000); } catch (e) { } }, 250);
    return true;
  }

  function button(app) {
    const list = app.dom && app.dom.exercisesList; if (!list) return;
    const old = list.querySelector("#pt-fillall"); if (old) old.remove();
    if (app.settings.showLogger === false || !PT.opt("nextHint")) return;
    const items = plan(app); if (!items.length) return;
    const n = count(items), b = document.createElement("button");
    b.type = "button"; b.id = "pt-fillall"; b.className = "pt-fillall tap-active";
    b.innerHTML = `⚡ Fill in suggested weights <span>${n} exercise${n === 1 ? "" : "s"}</span>`;
    list.insertBefore(b, list.firstChild);
  }

  const oRender = proto.renderWorkoutView;
  proto.renderWorkoutView = function () {
    let r = oRender.apply(this, arguments);
    try {
      if (this.activeDay && prefill(this)) r = oRender.apply(this, arguments);
      button(this);
    } catch (e) { console.error("PulseTrack fill in workout", e); }
    return r;
  };

  document.addEventListener("click", e => {
    const a = A(); if (!a || !e.target.closest || !e.target.closest("#pt-fillall")) return;
    const items = plan(a); if (!items.length) { a.toast("Nothing left to fill in"); return; }
    fill(a, items); a.renderWorkoutView();
    a.toast(`Filled in ${items.length} sets with the suggested weights`, "Undo", () => undo(a, items), 7000);
  });
  PT.fillAll = { plan: () => plan(A()), prefill: () => prefill(A()) };

  const css = document.createElement("style"); css.id = "pt-v279-css";
  css.textContent = `
    #pt-fillall { display: flex; align-items: center; justify-content: space-between; gap: .5rem; width: 100%; padding: .65rem .9rem; border-radius: .9rem; background: rgb(var(--z900)); border: 1px dashed rgb(var(--a500) / .6); color: rgb(var(--a400)); font-size: .8rem; font-weight: 800; text-align: left; }
    #pt-fillall span { font-size: .68rem; font-weight: 700; color: rgb(var(--z400)); }
  `;
  document.head.appendChild(css);
})();
