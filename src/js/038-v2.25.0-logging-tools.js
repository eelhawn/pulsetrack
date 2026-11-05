
/* =====================================================================
 * PulseTrack 2.25.0: logging tools.
 *  - Finish screen: "vs last time" (volume and lifts up/down against the last time you did this same day).
 *  - Gym mode: huge buttons, high contrast, only what you need while lifting (Settings, or the Gym button on the workout screen).
 *  - Timed sets: a timer button on holds (planks, hangs, carries) counts up, or down from a target like "45s", and fills the reps box.
 *  - Drop set button: one tap adds a drop set at about 80% of your last weight.
 *  - Repeat last workout: from the menu and the finish screen.
 *  - (Voice logging moved to m62a.js in 2.37.0.)
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  const proto = ApplicationUI.prototype;
  const A = () => window.app;
  const $ = id => document.getElementById(id);
  const esc = s => PT.esc(s);

  const css = document.createElement("style");
  css.id = "pt-v225-css";
  css.textContent = `
    #pt-wtools { display: flex; gap: .5rem; }
    #pt-wtools button { flex: 1 1 0; padding: .55rem .5rem; border-radius: .75rem; font-size: .75rem; font-weight: 700; background: rgb(var(--z900)); border: 1px solid rgb(var(--z800)); color: rgb(var(--z200)); }
    #pt-wtools button[aria-pressed="true"] { background: rgb(var(--a950)); border-color: rgb(var(--a600)); color: rgb(var(--a300)); }
    #pt-wtools button.pt-listen { background: rgb(var(--a600)); color: #fff; }
    .pt-tset { min-width: 2.6rem; padding: .3rem .4rem; border-radius: .6rem; font-size: .7rem; font-weight: 700; font-family: ui-monospace, monospace; background: rgb(var(--z800)); color: rgb(var(--z200)); border: 1px solid rgb(var(--z700)); flex-shrink: 0; margin-right: .35rem; }
    .pt-tset.on { background: rgb(var(--a600)); color: #fff; border-color: rgb(var(--a500)); }
    .pt-drop { padding: .25rem .6rem; border-radius: .5rem; font-size: .75rem; font-weight: 600; background: rgb(88 28 135 / .35); color: rgb(216 180 254); border: 1px solid rgb(107 33 168 / .6); }
    #pt-summary-vs { font-size: .8rem; font-weight: 600; text-align: center; }
    /* gym mode */
    body.pt-gym #view-workout .set-row { padding-top: .35rem; padding-bottom: .35rem; }
    body.pt-gym #view-workout .input-set-field { width: 5rem !important; height: 3.1rem; font-size: 1.35rem; font-weight: 700; color: rgb(var(--z50)); border-width: 2px; border-color: rgb(var(--z600)); }
    body.pt-gym #view-workout .input-set-field[data-field="reps"] { width: 4rem !important; }
    body.pt-gym #view-workout .btn-check-set { width: 3.4rem; height: 3.4rem; border-radius: 1rem; }
    body.pt-gym #view-workout .btn-cycle-tag { padding: .5rem .7rem; font-size: .85rem; }
    body.pt-gym #view-workout .set-row .text-xs, body.pt-gym #view-workout .set-row span.font-bold { font-size: 1rem; }
    body.pt-gym #view-workout .set-row .text-\\[10px\\] { font-size: .75rem; color: rgb(var(--z300)); }
    body.pt-gym #view-workout .plate-viz, body.pt-gym #view-workout .btn-link-ex { display: none !important; }
    body.pt-gym #view-workout .btn-ex-info { display: block !important; color: #fff; }
    body.pt-gym #view-workout .btn-add-set, body.pt-gym #view-workout .btn-remove-set, body.pt-gym #view-workout .pt-drop { padding: .6rem 1rem; font-size: 1rem; }
    body.pt-gym #view-workout [data-ex-card] h3 { font-size: 1.15rem; color: #fff; }
  `;
  document.head.appendChild(css);

  const gym = () => !!(A() && A().settings && A().settings.gymMode);
  function applyGym() { document.body.classList.toggle("pt-gym", gym()); const b = $("pt-gym-btn"); if (b) b.setAttribute("aria-pressed", gym() ? "true" : "false"); }
  function setGym(on) { const a = A(); a.settings.gymMode = !!on; WorkoutStorage.saveSettings(a.settings); applyGym(); const t = $("setting-toggle-gym"); if (t) t.checked = !!on; }

  /* ------------------------------------------------------------- vs last time */
  function bestByEx(a, s) {
    const m = {};
    (s.ex || []).forEach(e => { let b = 0; (e.sets || []).forEach(st => { if (st.t !== "W") b = Math.max(b, a.setE1rm(e.name, st, s.date) || 0); }); m[e.name] = b; });
    return m;
  }
  function vsLast(a) {
    const cur = a.lastSummary && a.lastSummary.session;
    let p = $("pt-summary-vs");
    if (!p) { const l = $("summary-pr-list"); if (!l) return; p = document.createElement("p"); p.id = "pt-summary-vs"; l.parentElement.insertBefore(p, l); }
    p.classList.add("hidden");
    if (!cur) return;
    const prev = (a.sessions || []).filter(s => s.id !== cur.id && s.pid === cur.pid && s.day === cur.day && (s.ts || 0) < (cur.ts || Infinity))
      .sort((x, y) => (y.ts || 0) - (x.ts || 0))[0];
    if (!prev || !(prev.vol > 0)) return;
    const diff = (cur.vol || 0) - prev.vol, pct = Math.round(diff / prev.vol * 100);
    const c = bestByEx(a, cur), o = bestByEx(a, prev);
    let up = 0, down = 0;
    Object.keys(c).forEach(n => { if (o[n] > 0 && c[n] > 0) { if (c[n] > o[n] * 1.005) up++; else if (c[n] < o[n] * 0.995) down++; } });
    const same = Math.abs(pct) < 1;
    p.className = "text-center " + (same ? "text-zinc-300" : diff > 0 ? "text-emerald-400" : "text-amber-300");
    p.innerHTML = (same ? "Same volume as last time" : `${diff > 0 ? "▲" : "▼"} ${Math.abs(pct)}% ${diff > 0 ? "more" : "less"} volume than last time (${diff > 0 ? "+" : "−"}${Math.abs(Math.round(diff)).toLocaleString()} ${esc(a.wLabel())})`)
      + (up || down ? `<br><span class="text-xs font-normal text-zinc-400">${up} lift${up === 1 ? "" : "s"} up${down ? ", " + down + " down" : ""}</span>` : "");
  }
  const oFin = proto.finishWorkoutV2;
  proto.finishWorkoutV2 = async function () {
    const r = await oFin.apply(this, arguments);
    try { vsLast(this); ensureSummaryBtn(); } catch (e) { console.error("PulseTrack vs last time", e); }
    return r;
  };

  /* ------------------------------------------------------------- repeat last workout */
  function lastSession(a) { return (a.sessions || []).slice().sort((x, y) => (y.ts || 0) - (x.ts || 0))[0]; }
  function again() {
    const a = A(), s = a && lastSession(a);
    if (!s) { a.toast("No saved workout to repeat yet"); return; }
    if (a.dom.modalSummary) a.dom.modalSummary.classList.add("hidden");
    if (a.closeDrawer) a.closeDrawer();
    a.repeatSession(s);
  }
  function ensureSummaryBtn() {
    if ($("pt-summary-again")) return;
    const t = $("btn-summary-template"); if (!t) return;
    const b = document.createElement("button");
    b.id = "pt-summary-again"; b.type = "button";
    b.className = "w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold rounded-xl tap-active text-sm";
    b.textContent = "↻ Do this workout again";
    t.parentElement.insertBefore(b, t);
  }
  function ensureDrawerRow() {
    if ($("pt-drawer-again")) return;
    const ref = $("pt-drawer-build"); const grid = ref && ref.parentElement; if (!grid) return;
    const b = document.createElement("button");
    b.id = "pt-drawer-again"; b.type = "button"; b.className = "pt-dr tap-active mt-1.5";
    b.innerHTML = '<span class="pt-dr-i">↻</span><span class="pt-dr-l">Repeat last workout</span><span class="pt-dr-c">›</span>';
    grid.insertAdjacentElement("afterend", b);
  }

  /* ------------------------------------------------------------- timed sets */
  const TIMED = /plank|hold|hang|wall sit|l-sit|isometric|carry|farmer|hollow|static|stretch|bridge/i;
  let run = null, tick = null;
  const mmss = s => Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0");
  const SECS = /(\d+)\s*(?:s|sec|secs|seconds)\b/i;
  function targetOf(ex) { const m = String((ex && ex.reps) || "").match(SECS); return m ? parseInt(m[1], 10) : 0; }
  /** 2.42.0: "8-10, 8-10, 40 sec, 40 sec" is one target per set. When the list has exactly one entry per set, set i reads entry i;
   *  a single target ("40 sec") covers every set; any other shape falls back to the first time found. Returns {target, piece}. */
  function pieces(ex) { const p = String((ex && ex.reps) || "").split(","), n = p.map(x => x.trim()); return n.length > 1 && n.length === (ex.sets | 0) && n.every(x => x.length <= 12) ? n : null; }
  function targetForSet(ex, i) {
    const p = pieces(ex);
    if (p) { const m = (p[Math.min(i, p.length - 1)] || "").match(SECS); return m ? parseInt(m[1], 10) : 0; }
    return targetOf(ex);
  }
  PT.timedTarget = targetForSet;
  function beep() { try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch (e) { } try { const s = window.sound; s && s.completeChime && s.completeChime(); } catch (e) { } }
  function paint() {
    document.querySelectorAll(".pt-tset").forEach(b => {
      const on = run && run.key === b.dataset.key;
      b.classList.toggle("on", !!on);
      if (!on) { b.textContent = "⏱"; return; }
      const el = (Date.now() - run.start) / 1000;
      b.textContent = run.target ? mmss(Math.max(0, run.target - el)) : mmss(el);
    });
  }
  function stopRun(auto) {
    const a = A(); if (!run) return;
    const el = Math.round((Date.now() - run.start) / 1000), secs = auto && run.target ? run.target : el, key = run.key, loaded = run.loaded;
    clearInterval(tick); tick = null; run = null;
    if (!a.logs[key]) a.logs[key] = { completed: false, weight: "", reps: "", tag: "R" };
    if (loaded) a.logs[key].secs = Math.max(1, secs);                       // weighted set: seconds are NOT reps (they would fake a 1-rep-max)
    else a.logs[key].reps = String(Math.max(1, secs));
    WorkoutStorage.saveLogs(a.logs);
    a.renderWorkoutView();
    a.toast(loaded ? (auto ? "Time. " : secs + " s. ") + "Add the reps you got, then check the set off." : "Held " + secs + " s");
  }
  function startRun(key, target, loaded) {
    if (run) stopRun(false);
    run = { key, start: Date.now(), target, loaded: !!loaded };
    tick = setInterval(() => {
      if (!run) return;
      if (run.target && (Date.now() - run.start) / 1000 >= run.target) { beep(); stopRun(true); return; }
      paint();
    }, 250);
    paint();
  }

  /* ------------------------------------------------------------- draw on the workout screen */
  function decorate() {
    const a = A(); if (!a || !a.dom || !a.dom.exercisesList) return;
    const list = a.dom.exercisesList;
    if (!$("pt-wtools")) {
      const bar = document.createElement("div");
      bar.id = "pt-wtools";
      bar.innerHTML = '<button type="button" id="pt-gym-btn" aria-pressed="false">🏋️ Gym mode</button>';
      list.parentElement.insertBefore(bar, list);
    }
    applyGym();
    const day = a.activeDay; if (!day) return;
    list.querySelectorAll("[data-ex-card]").forEach(card => {
      const ex = (day.exercises || [])[parseInt(card.dataset.exCard, 10)]; if (!ex) return;
      if (ex.type !== "tabata" && !a.exKind(ex).cardio) {
        const add = card.querySelector(".btn-add-set");
        if (add && !card.querySelector(".pt-drop")) {
          const d = document.createElement("button");
          d.type = "button"; d.className = "pt-drop tap-active"; d.dataset.exindex = add.dataset.exindex; d.textContent = "↓ Drop";
          d.setAttribute("aria-label", "Add a drop set"); add.parentElement.insertBefore(d, add);
        }
      }
      const named = TIMED.test(ex.name), per = pieces(ex);
      card.querySelectorAll(".set-row").forEach((row, si) => {
        const tgt = targetForSet(ex, si), chk = row.querySelector(".btn-check-set");
        if (per) {                                                  // one entry per set: show this set's own entry in the reps box
          const inp = row.querySelector('input[data-field="reps"]');
          if (inp && inp.placeholder === String(ex.reps)) inp.placeholder = per[si] || per[per.length - 1];
        }
        if (!(named || tgt) || !chk || row.querySelector(".pt-tset")) return;
        const b = document.createElement("button");
        b.type = "button"; b.className = "pt-tset tap-active"; b.dataset.key = chk.dataset.key; b.dataset.target = tgt; if (!named) b.dataset.loaded = "1";
        b.setAttribute("aria-label", named ? "Time this set" : "Start the " + tgt + " second timer"); b.textContent = "⏱";
        chk.parentElement.insertBefore(b, chk);
      });
    });
    paint();
  }
  const oRW = proto.renderWorkoutView;
  proto.renderWorkoutView = function () {
    const r = oRW.apply(this, arguments);
    try { decorate(); } catch (e) { console.error("PulseTrack workout tools", e); }
    return r;
  };

  /* ------------------------------------------------------------- drop set */
  function dropSet(btn) {
    const a = A(), idx = parseInt(btn.dataset.exindex, 10), ex = a.activeDay.exercises[idx]; if (!ex) return;
    let w = 0;
    for (let s = (ex.sets || 0) - 1; s >= 0; s--) {
      const e = a.logs[a.getLogKey(a.activeProgram.id, a.activeDay.dayNumber, ex.id, s)];
      if (e && parseFloat(e.weight) > 0) { w = parseFloat(e.weight); break; }
    }
    const step = a.settings && a.settings.unit === "kg" ? 2.5 : 5;
    const dw = w > 0 ? Math.max(step, Math.round(w * 0.8 / step) * step) : 0;
    const n = a.changeSets(ex, 1);
    a.logs[a.getLogKey(a.activeProgram.id, a.activeDay.dayNumber, ex.id, n - 1)] = { completed: false, weight: dw ? String(dw) : "", reps: "", tag: "D" };
    a.pendingEnter = { exIndex: idx, setIndex: n - 1 };
    WorkoutStorage.saveLogs(a.logs); WorkoutStorage.setData(a.data);
    a.renderWorkoutView();
    a.toast(dw ? "Drop set added at " + dw + " " + a.wLabel() : "Drop set added");
  }

  /* ------------------------------------------------------------- clicks */
  document.addEventListener("click", e => {
    const a = A(); if (!a || !e.target.closest) return;
    let t;
    if ((t = e.target.closest(".pt-tset"))) { e.preventDefault(); if (run && run.key === t.dataset.key) stopRun(false); else startRun(t.dataset.key, parseInt(t.dataset.target, 10) || 0, t.dataset.loaded === "1"); return; }
    if ((t = e.target.closest(".pt-drop"))) { dropSet(t); return; }
    if (e.target.closest("#pt-gym-btn")) { setGym(!gym()); return; }
    if (e.target.closest("#pt-summary-again") || e.target.closest("#pt-drawer-again")) { again(); return; }
  });

  /* ------------------------------------------------------------- settings + start-up */
  const oExtras = proto.renderSettingsExtras;
  proto.renderSettingsExtras = async function () {
    const r = oExtras ? await oExtras.apply(this, arguments) : undefined;
    try {
      const seg = $("pt-textsize");
      if (seg && !$("pt-gym-row")) {
        const row = document.createElement("label");
        row.id = "pt-gym-row"; row.className = "flex items-center justify-between gap-3 mt-3 cursor-pointer";
        row.innerHTML = '<span><span class="block text-xs font-bold text-zinc-100">Gym mode</span><span class="block text-[11px] text-zinc-400">Huge buttons and high contrast on the workout screen.</span></span><input type="checkbox" id="setting-toggle-gym" class="w-5 h-5 accent-emerald-500">';
        seg.insertAdjacentElement("afterend", row);
        row.querySelector("input").addEventListener("change", ev => setGym(ev.target.checked));
      }
      const g = $("setting-toggle-gym"); if (g) g.checked = gym();
    } catch (e) { console.error("PulseTrack settings 2.25", e); }
    return r;
  };
  const oSD = proto.updateDrawerStatus;
  proto.updateDrawerStatus = function () {
    const r = oSD.apply(this, arguments);
    try { ensureDrawerRow(); } catch (e) { }
    return r;
  };
  setTimeout(() => { try { applyGym(); ensureDrawerRow(); } catch (e) { } }, 500);
})();
  