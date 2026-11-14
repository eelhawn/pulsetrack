/* =====================================================================
 * PulseTrack 2.102.0: cardio in a workout counts as cardio, not as the workout.
 *  A cardio row in a workout (a treadmill walk, the bike, the stairs: anything you log in minutes, and distance) is still logged where it is,
 *  but when you finish the workout it goes to Cardio & Sports as its own session (the activity, the minutes and distance, an estimated
 *  calorie count, "From your workout: Day 4: Core & Cardio") and is taken out of the workout: it doesn't count toward its sets, the set bar
 *  and XP while you train, or the days list's set count. A workout that was only cardio is saved only as cardio.
 *  Settings → Workout screen → "Cardio goes to Cardio & Sports" (on). Off, cardio rows count as sets, as before.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined" || !PT.opt || !PT.WSCREEN_DEFAULTS) return;
  const proto = ApplicationUI.prototype;
  Object.assign(PT.WSCREEN_DEFAULTS, { cardioApart: true });
  const MI = 1609.344;
  PT.cardioApart = (a, ex) => { try { return !!(PT.opt("cardioApart") && PT.cardio && a && ex && a.exKind(ex).cardio); } catch (e) { return false; } };

  /** the Cardio & Sports activity for a workout row's name */
  function actFor(name) {
    const n = String(name || "").toLowerCase(), acts = (PT.cardio.BUILTIN_ACTS ? PT.cardio.BUILTIN_ACTS() : PT.cardio.BUILTIN) || [];
    const exact = acts.find(x => x.name.toLowerCase() === n); if (exact) return exact;
    const by = id => acts.find(x => x.id === id);
    const rules = [[/incline.*(treadmill|walk)|treadmill.*incline/, "incline"], [/treadmill/, "tread"], [/stair|step ?mill|stepper/, "stairs"], [/ellip/, "ellip"], [/arc trainer|cross trainer/, "arc"],
      [/recumbent/, "recumbent"], [/air ?bike|assault|echo bike/, "airbike"], [/spin class/, "spinclass"], [/bike|cycl/, "spin"], [/row(ing)? ?(machine|erg)|\berg\b|concept/, "row"], [/ski ?erg/, "skierg"],
      [/jump ?rope|skipping/, "rope"], [/battle rope/, "ropes"], [/sled/, "sled"], [/swim/, "swim"], [/hike/, "hike"], [/walk/, "walk"], [/jog|run|sprint/, "run"], [/hiit|interval/, "hiit"]];
    for (const [re, id] of rules) if (re.test(n) && by(id)) return by(id);
    return { id: "other", name: name, met: 6, cat: "cardio" };
  }
  /** this workout's ticked cardio rows: [{ ex, min, dist (in your lb/kg distance unit) }] */
  function cardioRows(a) {
    const prog = a.activeProgram, day = a.activeDay; if (!prog || !day) return [];
    const out = [];
    (day.exercises || []).forEach(ex => {
      if (!PT.cardioApart(a, ex)) return;
      let min = 0, dist = 0, any = false;
      for (let s = 0; s < (ex.sets || 0); s++) { const e = a.logs[a.getLogKey(prog.id, day.dayNumber, ex.id, s)]; if (!e || !e.completed) continue; any = true; min += parseFloat(e.min) || 0; dist += parseFloat(e.dist) || 0; }
      if (any) out.push({ ex, min, dist });
    });
    return out;
  }
  function toLogs(a, rows, session) {
    const made = [], skipped = [];
    rows.forEach(r => {
      const sec = Math.round(r.min * 60);
      if (!(sec > 0)) { skipped.push(r.ex.name); return; }
      const act = actFor(r.ex.name);
      const log = { id: PT.uid(), date: session.date, ts: session.ts, act: act.id, name: act.id === "other" ? r.ex.name : act.name, cat: "cardio", sec, int: 2, wid: session.id, note: "From your workout: " + (session.dtitle || "workout") };
      if (r.dist > 0 && (act.dist || act.id === "other")) log.dist = Math.round(r.dist * (a.unit() === "kg" ? 1000 : MI) * 10) / 10;
      try { const k = PT.cardio.estKcal(act.met ? act : { met: 6 }, 2, sec); if (k) { log.kcal = k; log.kest = true; } } catch (e) { }
      if (PT.cardio.addLog(log)) made.push(log);
    });
    return { made, skipped };
  }

  // finishing: the session is changed just before it is saved, so the summary, XP and streaks only see the lifting
  const oFinish = proto.finishWorkout;
  proto.finishWorkout = async function () {
    if (!PT.opt("cardioApart") || !PT.cardio) return oFinish.apply(this, arguments);
    const rows = cardioRows(this);
    if (!rows.length) return oFinish.apply(this, arguments);
    const before = new Set((this.sessions || []).map(s => s && s.id)), oSave = this.saveSessions, self = this;
    let done = null;
    this.saveSessions = function () {
      try {
        const s = (self.sessions || []).find(x => x && !before.has(x.id));
        if (s && !done) {
          const names = new Set(rows.map(r => r.ex.name));
          s.ex = (s.ex || []).filter(e => !(e.k === "c" && names.has(e.name)));
          s.sets = s.ex.reduce((n, e) => n + (e.sets || []).length, 0);
          done = { s, res: toLogs(self, rows, s) };
          s.cardio = done.res.made.map(l => l.id);
        }
      } catch (e) { console.error("PulseTrack cardio apart", e); }
      return oSave.apply(this, arguments);
    };
    let r;
    try { r = await oFinish.apply(this, arguments); } finally { this.saveSessions = oSave; }
    if (done) {
      // a workout that was only cardio is only cardio
      if (!done.s.ex.length) { const i = this.sessions.indexOf(done.s); if (i >= 0) { this.sessions.splice(i, 1); this.saveSessions(); try { this.renderHistoryView && this.renderHistoryView(); } catch (e) { } } }
      const m = done.res.made;
      if (m.length || done.res.skipped.length) setTimeout(() => {
        try {
          const txt = m.map(l => `${l.name} (${Math.round(l.sec / 60)} min)`).join(", ");
          this.toast(m.length ? `${txt} saved to Cardio & Sports${done.res.skipped.length ? `; ${done.res.skipped.join(", ")} had no minutes` : ""}` : `${done.res.skipped.join(", ")} had no minutes, so nothing went to Cardio & Sports`);
        } catch (e) { }
      }, 2600);
    }
    return r;
  };

  // the workout card says where the row goes
  const oRender = proto.renderWorkoutView;
  proto.renderWorkoutView = function () {
    const r = oRender.apply(this, arguments);
    try {
      const list = this.dom && this.dom.exercisesList, day = this.activeDay; if (!list || !day) return r;
      list.querySelectorAll("[data-ex-card]").forEach(card => {
        const ex = (day.exercises || [])[parseInt(card.dataset.exCard, 10)];
        if (!ex || !PT.cardioApart(this, ex) || card.querySelector(".pt-cardio-apart")) return;
        const h = card.querySelector("h3, .ex-name, [data-ex-name]") || card.querySelector("span.font-bold, div.font-bold");
        const tag = document.createElement("div");
        tag.className = "pt-cardio-apart text-[10px] font-bold text-emerald-400 mt-1";
        tag.textContent = "💓 Goes to Cardio & Sports, not your sets";
        (h && h.parentElement ? h.parentElement : card).appendChild(tag);
      });
    } catch (e) { console.error("PulseTrack cardio apart tag", e); }
    return r;
  };

  /* Settings → Workout screen */
  const SW = (k, on) => `<label class="relative inline-flex items-center cursor-pointer flex-shrink-0"><input type="checkbox" data-opt="${k}" class="sr-only peer" ${on ? "checked" : ""}><div class="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div></label>`;
  function row() {
    const box = document.getElementById("pt-wscreen"); if (!box || box.querySelector('[data-v2102="cardioApart"]')) return;
    const html = `<div class="flex items-center justify-between p-3.5 gap-3" data-v2102="cardioApart"><div class="pr-3 min-w-0"><span class="text-xs font-bold text-white block">Cardio goes to Cardio & Sports</span><span class="text-[11px] text-zinc-400 block mt-0.5">A treadmill, bike or stairs row in a workout is saved as cardio when you finish, and doesn't count toward the workout's sets.</span></div>${SW("cardioApart", PT.opt("cardioApart"))}</div>`;
    const after = box.querySelector('[data-v291="quickAdj"]') || box.querySelector('[data-opt="autoFill"]');
    const r = after && (after.matches("[data-v291]") ? after : after.closest(".flex.items-center.justify-between"));
    if (r) r.insertAdjacentHTML("afterend", html); else box.insertAdjacentHTML("beforeend", html);
  }
  const oOpen = proto.openSettings;
  proto.openSettings = function () { const r = oOpen.apply(this, arguments); try { row(); setTimeout(row, 0); } catch (e) { } return r; };

  PT.cardioApartOf = { actFor, rows: () => cardioRows(window.app) };
})();
