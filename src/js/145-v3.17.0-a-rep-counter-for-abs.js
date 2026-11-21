/* =====================================================================
 * PulseTrack 3.17.0: a rep counter for abs.
 *  Ab sets are long (the Core & Cardio days are 5 x 40-60), and it is easy to lose count. Every ab exercise in a workout (abs or obliques
 *  as a main muscle, done for reps, not a hold) gets "Count reps" next to Form tips. It opens a sheet with the moving drawing of the
 *  exercise and a big number:
 *   - tap the number for each rep (the drawing does one rep each tap), or
 *   - "Pace me": the drawing does the reps at a steady speed (slow 3 s, steady 2 s, quick 1.5 s) and counts them, out loud if you like;
 *  then "Save set" puts the count in the reps of the next set that is not ticked and ticks it (the rest timer starts as usual).
 *  settings.rcPace (ms a rep) and settings.rcVoice (say the count) are kept. The screen stays on while the sheet is open.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  const proto = ApplicationUI.prototype, A = () => window.app, $ = id => document.getElementById(id), esc = s => PT.esc(s);
  const PACES = [[3000, "Slow", "3 s"], [2000, "Steady", "2 s"], [1500, "Quick", "1.5 s"]];
  const TIMED = /\b(s|sec|secs|second|seconds|min|mins|minute|minutes)\b|\d:\d\d|hold/i;

  /** an ab exercise done for reps (not a hold, not cardio) */
  function isAbs(name, ex) {
    if (!name) return false;
    try { const a = A(); if (ex && (ex.type === "tabata" || ex.type === "cardio" || (a && a.exKind && a.exKind(ex).cardio))) return false; } catch (e) { }
    if (ex && TIMED.test(String(ex.reps || ""))) return false;
    let m = null; try { m = PT.musclesOf ? PT.musclesOf(name) : null; } catch (e) { m = null; }
    if (!m || m.kind !== "worked" || !(m.muscles || []).some(x => x.role === "primary" && (x.muscle_id === "abs" || x.muscle_id === "obliques"))) return false;
    try { const c = PT.figure && PT.figure.classify(name), p = c && PT.figure.PATTERNS[c.draw || c.id]; if (p && (p.hold || p.frames.length < 2)) return false; } catch (e) { }
    return true;
  }
  /** "40-60" -> { lo: 40, hi: 60 }; "12" -> { lo: 12, hi: 12 }; anything else -> null */
  function goalOf(reps) {
    const m = /(\d+)\s*(?:-|–|to)\s*(\d+)/.exec(String(reps || "")) || /^\s*(\d+)\s*$/.exec(String(reps || ""));
    if (!m) return null;
    const lo = parseInt(m[1], 10), hi = parseInt(m[2] || m[1], 10);
    return lo > 0 ? { lo: Math.min(lo, hi), hi: Math.max(lo, hi) } : null;
  }
  const frames = name => { try { return PT.figure && PT.figure.motion ? PT.figure.motion(name, 8, true) : null; } catch (e) { return null; } };
  const vibrate = p => { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) { } };

  /* ================================================================ the "Count reps" buttons on the cards */
  function decorate(a) {
    const list = $("exercises-list") || (a.dom && a.dom.exercisesList); if (!list) return;
    list.querySelectorAll("[data-ex-card]").forEach(card => {
      const old = card.querySelector(".pt-rc-btn"); if (old) old.remove();
      const i = parseInt(card.dataset.exCard, 10), ex = a.activeDay && (a.activeDay.exercises || [])[i];
      const chk = card.querySelector(".btn-check-set"), name = (chk && chk.dataset.exname) || (ex && ex.name);
      if (!chk || !isAbs(name, ex)) return;
      // its own full-width button under the exercise's name and sets line (beside Form tips it squeezed "5 Sets × 40-60")
      const anchor = card.querySelector(".btn-cues") || card.querySelector(".btn-ex-info"), line = anchor && anchor.parentElement; if (!line) return;
      const b = document.createElement("button"); b.type = "button"; b.className = "pt-rc-btn tap-active"; b.dataset.rcx = String(i);
      b.setAttribute("aria-label", `Count reps of ${name}`); b.textContent = "Count reps";
      line.insertAdjacentElement("afterend", b);
    });
  }
  const oRW = proto.renderWorkoutView;
  proto.renderWorkoutView = function () {
    const r = oRW.apply(this, arguments);
    try { decorate(this); } catch (e) { console.error("PulseTrack rep counter", e); }
    return r;
  };
  document.addEventListener("click", e => {
    const b = e.target.closest && e.target.closest(".pt-rc-btn"); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    open(parseInt(b.dataset.rcx, 10));
  }, true);

  /* ================================================================ the counter */
  let C = null;   // { i, name, el, n, goal, pace, voice, play (token), pacing, wl }
  function nextSet(i) {
    const card = document.querySelector(`#view-workout [data-ex-card="${i}"]`); if (!card) return null;
    const all = [...card.querySelectorAll(".set-row")], row = all.find(r => { const b = r.querySelector(".btn-check-set"); return b && b.dataset.completed !== "1"; });
    return row ? { row, k: all.indexOf(row), of: all.length } : { row: null, k: -1, of: all.length };
  }
  function say(t) {
    const a = A(); if (!C || !C.voice || !a || a.settings.voice === false || !("speechSynthesis" in window)) return;
    try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(String(t)); u.rate = 1.15; speechSynthesis.speak(u); } catch (e) { }
  }
  function show() {
    if (!C) return;
    const num = $("pt-rc-n"), bar = $("pt-rc-bar"), save = $("pt-rc-save"), sub = $("pt-rc-sub"); if (!num) return;
    num.textContent = String(C.n);
    const g = C.goal, at = g && C.n >= g.lo;
    $("pt-rc-tap").classList.toggle("pt-rc-ok", !!at);
    if (bar) bar.style.width = g ? Math.min(100, Math.round(C.n / g.hi * 100)) + "%" : "0%";
    if (sub) sub.textContent = g ? (C.n >= g.hi ? `Goal done: ${g.lo === g.hi ? g.hi : g.lo + "-" + g.hi}` : at ? `In your goal (${g.lo}-${g.hi}). Keep going or save.` : `Goal ${g.lo === g.hi ? g.hi : g.lo + "-" + g.hi} · ${g.lo - C.n} to go`) : "Tap the number for each rep";
    const s = nextSet(C.i);
    if (save) {
      save.disabled = !C.n || !s || !s.row;
      save.textContent = !s || !s.row ? "Every set is ticked" : `Save set ${s.k + 1}: ${C.n} rep${C.n === 1 ? "" : "s"}`;
    }
    const pb = $("pt-rc-pace"); if (pb) { pb.textContent = C.pacing ? "Stop" : "Pace me"; pb.setAttribute("aria-pressed", C.pacing ? "true" : "false"); }
  }
  function count(by) {
    if (!C) return;
    const was = C.n; C.n = Math.max(0, C.n + by); show();
    if (by > 0) {
      const g = C.goal;
      if (g && was < g.lo && C.n >= g.lo) { vibrate([70, 50, 70]); say(`${C.n}. Goal.`); }
      else if (g && was < g.hi && C.n >= g.hi && g.hi !== g.lo) { vibrate([70, 50, 70, 50, 70]); say(`${C.n}. That's the top of your goal.`); }
      else { vibrate(12); say(C.n); }
    }
  }
  /** play one rep of the drawing over ms; calls done at the end */
  function oneRep(ms, done) {
    const fr = C && C.fr, im = $("pt-rc-img"); if (!fr || !im) { if (done) setTimeout(done, ms); return; }
    const me = ++C.play, seq = []; for (let i = 0; i < fr.length; i++) seq.push(i); for (let i = fr.length - 2; i >= 0; i--) seq.push(i);
    const step = ms / (seq.length - 1); let k = 0;
    const tick = () => { if (!C || me !== C.play) return; const el = $("pt-rc-img"); if (!el) return; el.src = fr[seq[k]]; k++; if (k < seq.length) setTimeout(tick, step); else if (done) done(); };
    tick();
  }
  function pace(on) {
    if (!C) return;
    C.pacing = on; show();
    if (!on) { C.play++; return; }
    say("Go");
    const run = () => { if (!C || !C.pacing) return; oneRep(C.pace, () => { if (!C || !C.pacing) return; count(1); run(); }); };
    setTimeout(run, 700);
  }
  async function wake(on) {
    try {
      if (on && "wakeLock" in navigator && C && !C.wl) C.wl = await navigator.wakeLock.request("screen");
      else if (!on && C && C.wl) { const w = C.wl; C.wl = null; await w.release(); }
    } catch (e) { }
  }
  function open(i) {
    const a = A(), K = PT.kit; if (!a || !K) return;
    const card = document.querySelector(`#view-workout [data-ex-card="${i}"]`), chk = card && card.querySelector(".btn-check-set"); if (!chk) return;
    const ex = a.activeDay && (a.activeDay.exercises || [])[i], name = chk.dataset.exname || (ex && ex.name);
    const reps = (card.querySelector('.input-set-field[data-field="reps"]') || {}).placeholder || (ex && ex.reps) || "";
    const s = a.settings, pv = PACES.some(p => p[0] === s.rcPace) ? s.rcPace : 2000;
    if (C) close();
    const el = K.sheet("pt-rc-sheet", 58), fr = frames(name), st = nextSet(i);
    C = { i, name, el, n: 0, goal: goalOf(reps), pace: pv, voice: s.rcVoice !== false, play: 0, pacing: false, wl: null, fr };
    const c = K.openSheet(el, `${K.head("Count reps", `${name}${st && st.row ? ` · set ${st.k + 1} of ${st.of}` : ""}`)}
      ${fr ? `<img id="pt-rc-img" class="pt-rc-img" src="${fr[0]}" alt="${esc(name)}, drawn">` : ""}
      <button type="button" id="pt-rc-tap" class="pt-rc-tap tap-active" aria-label="Add a rep"><span id="pt-rc-n" class="pt-rc-n" aria-live="polite">0</span>
        <span class="pt-rc-l">Tap here for each rep</span><span class="pt-rc-track"><span id="pt-rc-bar"></span></span><span id="pt-rc-sub" class="pt-rc-l"></span></button>
      <div class="pt-rc-row"><button type="button" class="pt-rc-b tap-active" data-rc="minus" aria-label="One rep less">−1</button>
        <button type="button" id="pt-rc-pace" class="pt-rc-b pt-rc-p tap-active" data-rc="pace" aria-pressed="false">Pace me</button>
        <button type="button" class="pt-rc-b tap-active" data-rc="reset">Start over</button></div>
      <div class="pt-rc-sp" role="group" aria-label="Pace">${PACES.map(([ms, l, t]) => `<button type="button" class="pt-rc-c tap-active" data-rcp="${ms}" aria-pressed="${ms === pv}">${l} <span>${t}</span></button>`).join("")}</div>
      <label class="pt-rc-v"><input type="checkbox" id="pt-rc-voice" ${C.voice ? "checked" : ""}> Say the count out loud</label>
      <div class="sticky bottom-[calc(-1.25rem-env(safe-area-inset-bottom,0px))] -mx-5 -mb-5 px-5 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] bg-zinc-900 border-t border-zinc-800"><button type="button" id="pt-rc-save" class="w-full py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold tap-active">Save set</button></div>`);
    el.__onClose = () => { if (C && C.el === el) { C.pacing = false; C.play++; wake(false); try { speechSynthesis.cancel(); } catch (e) { } C = null; } };
    wake(true); show();
    c.addEventListener("click", e => {
      if (!C) return;
      if (e.target.closest("#pt-rc-tap")) { if (C.pacing) return; count(1); oneRep(650); return; }
      const b = e.target.closest("[data-rc]"), p = e.target.closest("[data-rcp]");
      if (p) {
        C.pace = parseInt(p.dataset.rcp, 10); a.settings.rcPace = C.pace; try { WorkoutStorage.saveSettings(a.settings); } catch (er) { }
        c.querySelectorAll("[data-rcp]").forEach(x => x.setAttribute("aria-pressed", x === p ? "true" : "false")); return;
      }
      if (!b) return;
      if (b.dataset.rc === "minus") count(-1);
      else if (b.dataset.rc === "reset") { pace(false); C.n = 0; show(); }
      else if (b.dataset.rc === "pace") pace(!C.pacing);
    });
    c.querySelector("#pt-rc-voice").addEventListener("change", e => { C.voice = e.target.checked; a.settings.rcVoice = C.voice; try { WorkoutStorage.saveSettings(a.settings); } catch (er) { } });
    c.querySelector("#pt-rc-save").addEventListener("click", () => saveSet());
  }
  function saveSet() {
    if (!C || !C.n) return;
    const s = nextSet(C.i); if (!s || !s.row) return;
    const n = C.n, name = C.name, k = s.k, inp = s.row.querySelector('.input-set-field[data-field="reps"]'), btn = s.row.querySelector(".btn-check-set");
    if (!inp || !btn) return;
    inp.value = String(n); inp.dispatchEvent(new Event("input", { bubbles: true })); inp.dispatchEvent(new Event("change", { bubbles: true }));
    const el = C.el; PT.kit.closeSheet(el);
    btn.click();
    const a = A(); if (a) a.toast(`Set ${k + 1} of ${name}: ${n} reps saved`);
  }
  function close() { if (C && C.el) PT.kit.closeSheet(C.el); }

  PT.repCounter = { isAbs, goalOf, open, close, state: () => C && { n: C.n, pacing: C.pacing, pace: C.pace, goal: C.goal, name: C.name } };

  const css = document.createElement("style"); css.id = "pt-v3170-css";
  css.textContent = `
    .pt-rc-btn { display: block; width: 100%; margin-top: .5rem; min-height: 2.5rem; border-radius: .75rem; font-size: .8125rem; font-weight: 700; color: rgb(52 211 153); background: rgb(16 185 129 / .1); border: 1px solid rgb(16 185 129 / .45); }
    html[data-mode="light"] .pt-rc-btn { color: rgb(4 120 87); }
    .pt-rc-img { display: block; width: 100%; max-height: 11.5rem; object-fit: contain; border-radius: .9rem; }
    .pt-rc-tap { width: 100%; display: flex; flex-direction: column; align-items: center; gap: .35rem; padding: .9rem .9rem 1rem; border-radius: 1.1rem; background: rgb(var(--z800)); border: 2px solid rgb(var(--z700)); }
    .pt-rc-tap.pt-rc-ok { border-color: rgb(16 185 129); }
    .pt-rc-n { font-size: 4.25rem; line-height: 1; font-weight: 900; color: rgb(var(--z100)); font-variant-numeric: tabular-nums; }
    .pt-rc-ok .pt-rc-n { color: rgb(52 211 153); }
    html[data-mode="light"] .pt-rc-ok .pt-rc-n { color: rgb(4 120 87); }
    .pt-rc-l { font-size: .75rem; color: rgb(var(--z300)); }
    .pt-rc-track { width: 100%; height: .4rem; border-radius: 1rem; background: rgb(var(--z900)); overflow: hidden; }
    .pt-rc-track span { display: block; height: 100%; width: 0; background: rgb(16 185 129); transition: width .2s; }
    .pt-rc-row { display: grid; grid-template-columns: 1fr 1.4fr 1fr; gap: .5rem; }
    .pt-rc-b { min-height: 2.75rem; border-radius: .8rem; background: rgb(var(--z800)); color: rgb(var(--z100)); font-size: .875rem; font-weight: 700; }
    .pt-rc-p[aria-pressed="true"] { background: rgb(5 150 105); color: #fff; }
    .pt-rc-sp { display: flex; gap: .4rem; }
    .pt-rc-c { flex: 1; min-height: 2.5rem; border-radius: .7rem; background: rgb(var(--z900)); border: 1px solid rgb(var(--z700)); color: rgb(var(--z200)); font-size: .75rem; font-weight: 700; }
    .pt-rc-c span { font-weight: 500; color: rgb(var(--z300)); }
    .pt-rc-c[aria-pressed="true"] { border-color: rgb(16 185 129); color: rgb(var(--z100)); }
    .pt-rc-v { display: flex; align-items: center; gap: .5rem; font-size: .8125rem; color: rgb(var(--z200)); min-height: 2.25rem; }
    .pt-rc-v input { width: 1.1rem; height: 1.1rem; accent-color: rgb(16 185 129); }
    @media (prefers-reduced-motion: reduce) { .pt-rc-track span { transition: none; } }
  `;
  document.head.appendChild(css);
})();
