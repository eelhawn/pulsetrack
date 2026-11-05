
/* =====================================================================
 * PulseTrack 2.36.0: guided mobility flows.
 *  - Timed, hands-free routines (Back relief, Hips and legs, Shoulders and upper back, Hands and grip,
 *    After-work reset, Pre-lift warm-up). A big countdown, auto-advance, left/right sides, beeps for the last
 *    three seconds, pause / skip / back / +10 s. The screen stays awake. It pauses if you leave the app.
 *  - A suggestion picks one for you from a heavy work day, a flagged injury or what you trained last.
 *  - A finished routine is saved in settings.mobLog. For the areas it covers it counts as active recovery on
 *    the recovery map (about 15% less waiting), and Home offers one on a heavy work day.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  const proto = ApplicationUI.prototype;
  const A = () => window.app;
  const $ = id => document.getElementById(id);
  const esc = s => PT.esc(s);
  const DAY = 86400000;
  const save = () => { try { WorkoutStorage.saveSettings(A().settings); } catch (e) { } };
  const snd = () => { try { return typeof sound !== "undefined" ? sound : window.sound; } catch (e) { return window.sound; } };
  const beep = k => { try { const s = snd(); if (s && s[k]) s[k](); } catch (e) { } };

  /* [name, seconds, both sides (1) or not (0), cue] */
  const ROUTINES = [
    { id: "back", icon: "🪑", name: "Back relief", blurb: "Lower back, hips and glutes", regs: ["lowerback", "glutes", "back"], steps: [
      ["Cat-Cow", 45, 0, "On hands and knees. Round your back, then arch it, slowly with your breath."],
      ["Child's Pose", 45, 0, "Sit your hips back toward your heels and reach your arms long."],
      ["Knee-to-Chest", 30, 1, "Pull one knee in. Keep the other leg long on the floor."],
      ["Lying Twist", 30, 1, "Let both knees fall to one side. Keep your shoulders down."],
      ["Figure-4 Glute Stretch", 40, 1, "Ankle over the opposite knee. Pull that thigh toward you."],
      ["Sphinx Pose", 30, 0, "Forearms down, chest tall. Gentle only. Stop if it pinches."]] },
    { id: "hips", icon: "🦵", name: "Hips and legs", blurb: "Hips, hamstrings, quads and calves", regs: ["glutes", "hamstrings", "quads", "calves"], steps: [
      ["90/90 Hip Switches", 45, 0, "Sit tall. Rotate both knees from one side to the other."],
      ["Hip Flexor Stretch", 40, 1, "Half kneeling. Squeeze the back glute and shift forward."],
      ["Pigeon Stretch", 45, 1, "Front shin across, hips square. Fold forward slowly."],
      ["Hamstring Stretch", 35, 1, "Heel out front, hinge at the hips with a flat back."],
      ["Standing Quad Stretch", 30, 1, "Pull your heel to your glute. Keep your knees together."],
      ["Calf Stretch", 30, 1, "Hands on a wall, back heel down, leg straight."],
      ["Ankle Rocks", 30, 0, "Half kneeling. Drive the knee over your toes, heel stays down."]] },
    { id: "shoulders", icon: "💪", name: "Shoulders and upper back", blurb: "Shoulders, chest, lats and upper back", regs: ["shoulders", "chest", "traps", "back", "biceps", "triceps"], steps: [
      ["Arm Circles", 30, 0, "Big, slow circles. Switch direction halfway."],
      ["Doorway Chest Stretch", 40, 1, "Forearm on the frame, step through until you feel the chest open."],
      ["Cross-Body Shoulder Stretch", 30, 1, "Pull the arm across your chest. Keep your shoulder down."],
      ["Thread the Needle", 35, 1, "On all fours, slide one arm under and rotate. Rest your shoulder down."],
      ["Overhead Triceps Stretch", 30, 1, "Elbow up by your ear, gently press it back."],
      ["Neck Side Stretch", 25, 1, "Ear toward your shoulder. Let the weight of your hand do the work."]] },
    { id: "hands", icon: "✋", name: "Hands and grip", blurb: "Forearms and wrists. Good after tool and hose work", regs: ["forearms"], steps: [
      ["Wrist Flexor Stretch", 30, 1, "Arm straight, palm up. Pull your fingers back gently."],
      ["Wrist Extensor Stretch", 30, 1, "Arm straight, palm down. Press the back of the hand toward you."],
      ["Fist and Spread", 30, 0, "Squeeze both hands into fists, then spread the fingers wide."],
      ["Prayer Stretch", 30, 0, "Palms together at your chest. Lower your hands until your wrists stretch."],
      ["Wrist Circles", 30, 0, "Slow circles each way. Keep your forearms still."]] },
    { id: "reset", icon: "🌤", name: "After-work reset", blurb: "A full-body unwind", regs: ["lowerback", "glutes", "hamstrings", "quads", "shoulders", "chest", "back", "traps"], steps: [
      ["Cat-Cow", 40, 0, "On hands and knees. Round, then arch, slowly with your breath."],
      ["Child's Pose", 40, 0, "Hips back, arms long. Let your back relax."],
      ["Hip Flexor Stretch", 30, 1, "Half kneeling. Squeeze the back glute and shift forward."],
      ["Pigeon Stretch", 30, 1, "Front shin across, fold forward slowly."],
      ["Doorway Chest Stretch", 30, 1, "Forearm on the frame, step through."],
      ["Cross-Body Shoulder Stretch", 25, 1, "Pull the arm across your chest."],
      ["Knee-to-Chest", 25, 1, "Hug one knee in. Keep the other leg long."],
      ["Box Breathing", 60, 0, "Lie back. In for 4, hold 4, out for 4, hold 4."]] },
    { id: "warm", icon: "🔥", name: "Pre-lift warm-up", blurb: "A short dynamic warm-up before you lift", regs: [], warm: true, steps: [
      ["Arm Circles", 30, 0, "Big circles, forward then back."],
      ["Leg Swings", 30, 1, "Hold a wall. Swing the leg forward and back, loose and easy."],
      ["Hip Circles", 30, 0, "Hands on hips, big slow circles. Switch direction halfway."],
      ["Inchworm", 45, 0, "Walk your hands out to a plank, then walk your feet in."],
      ["World's Greatest Stretch", 30, 1, "Deep lunge, elbow to the floor, then rotate and reach up."],
      ["Bodyweight Squats", 30, 0, "Sit deep, chest up, smooth and controlled."]] }
  ];
  const byId = id => ROUTINES.find(r => r.id === id);

  /** the timeline: a short "get ready" before each move and before each switch of sides, then the hold */
  function build(r) {
    const items = []; let first = true;
    r.steps.forEach(([n, s, two, cue], i) => {
      const sides = two ? ["Left side", "Right side"] : [""];
      sides.forEach((side, k) => {
        items.push({ k: "prep", n, side, s: first ? 5 : k ? 2 : 4, step: i });
        items.push({ k: "hold", n, side, s, cue, step: i });
        first = false;
      });
    });
    return items;
  }
  const holdSecs = r => r.steps.reduce((t, s) => t + s[1] * (s[2] ? 2 : 1), 0);
  const totalSecs = items => items.reduce((t, x) => t + x.s, 0);
  const mins = r => Math.max(1, Math.round(totalSecs(build(r)) / 60));

  /* ---------------------------------------------------------------- log, stats, suggestion */
  const log = a => (Array.isArray(a.settings.mobLog) ? a.settings.mobLog : []);
  PT.mobLog = log;
  function stats(a) {
    const now = Date.now(), wk = log(a).filter(x => x.ts > now - 7 * DAY);
    return { week: wk.length, minutes: Math.round(wk.reduce((t, x) => t + (x.secs || 0), 0) / 60), last: log(a).length ? log(a)[log(a).length - 1] : null, today: log(a).some(x => x.d === PT.ds()) };
  }
  const REGION_ROUTINE = { lowerback: "back", back: "shoulders", glutes: "hips", quads: "hips", hamstrings: "hips", calves: "hips", chest: "shoulders", shoulders: "shoulders", traps: "shoulders", biceps: "shoulders", triceps: "shoulders", forearms: "hands" };
  const REGION_WORD = { lowerback: "lower back", back: "back", glutes: "glutes", quads: "quads", hamstrings: "hamstrings", calves: "calves", chest: "chest", shoulders: "shoulders", traps: "traps", biceps: "biceps", triceps: "triceps", forearms: "forearms" };
  PT.mobSuggest = function (a) {
    a = a || A(); const inj = Array.isArray(a.settings.injuries) ? a.settings.injuries : [];
    try { if (PT.workHeavyToday && PT.workHeavyToday(a)) return { id: "back", why: "Heavy work day. Your back and hips took a beating." }; } catch (e) { }
    if (inj.includes("back")) return { id: "back", why: "You flagged your lower back." };
    if (inj.includes("shoulder") || inj.includes("elbow")) return { id: "shoulders", why: "You flagged a shoulder or elbow." };
    if (inj.includes("wrist")) return { id: "hands", why: "You flagged a wrist." };
    if (inj.includes("knee") || inj.includes("hip")) return { id: "hips", why: "You flagged a knee or hip." };
    try {
      const rec = PT.recovery(), hit = Object.keys(rec).filter(r => REGION_ROUTINE[r] && rec[r].since < 48 && rec[r].pct < 90 && !rec[r].work).sort((x, y) => rec[x].pct - rec[y].pct)[0];
      if (hit) return { id: REGION_ROUTINE[hit], why: "Your " + REGION_WORD[hit] + " is still recovering." };
    } catch (e) { }
    return { id: "reset", why: "" };
  };

  /* mobility for an area, done after the last hard work there, shortens the wait on the recovery map by 15% */
  const oRec = PT.recovery;
  if (typeof oRec === "function") PT.recovery = function (now, appArg) {
    const out = oRec.apply(this, arguments);
    try {
      const a = appArg || A(), lg = a && log(a); if (!lg || !lg.length) return out;
      now = now || Date.now();
      Object.keys(out).forEach(r => {
        const o = out[r]; if (!o || o.pct >= 100) return;
        const m = lg.find(x => x.regs && x.regs.indexOf(r) >= 0 && x.ts > o.last && x.ts <= now + 3600000); if (!m) return;
        o.left = o.left * 0.85; o.pct = Math.max(0, Math.min(100, Math.round((o.need - o.left) / o.need * 100))); o.mob = true;
      });
    } catch (e) { console.error("PulseTrack mobility recovery", e); }
    return out;
  };

  /* ---------------------------------------------------------------- the picker */
  function openPicker() {
    const a = A(); if (!a) return;
    const sg = PT.mobSuggest(a), st = stats(a);
    const line = st.week ? `${st.week} session${st.week === 1 ? "" : "s"} this week · ${st.minutes} min` : "None yet this week";
    const card = r => `<button type="button" class="pt-mob-card tap-active${sg.id === r.id && sg.why ? " sug" : ""}" data-mob="${r.id}">
        <span class="pt-mob-ic">${r.icon}</span>
        <span class="min-w-0 flex-1 text-left"><b class="block text-sm text-white">${esc(r.name)}</b><span class="block text-[11px] text-zinc-400">${esc(r.blurb)}</span>
        <span class="block text-[10px] text-zinc-500 mt-0.5">${mins(r)} min · ${r.steps.length} moves${sg.id === r.id && sg.why ? ` · <span class="text-amber-300 font-bold">Suggested: ${esc(sg.why)}</span>` : ""}</span></span>
        <span class="text-zinc-500">▶</span></button>`;
    const order = [byId(sg.id)].concat(ROUTINES.filter(r => r.id !== sg.id));
    const body = `<div class="space-y-3">
      <p class="text-xs text-zinc-400 leading-snug">Pick one and put the phone down. It counts the holds, switches sides and beeps for you. The screen stays awake. ${esc(line)}.</p>
      <div class="space-y-2">${order.map(card).join("")}</div>
      <p class="text-[10px] text-zinc-500 leading-relaxed">A routine you finish counts as active recovery for the areas it covers, so the recovery map shows a bit less waiting. Stop any move that hurts instead of pushing through it.</p>
      <button type="button" id="pt-mob-list" class="w-full py-2.5 rounded-xl bg-zinc-800 text-zinc-200 text-xs font-bold tap-active">Prefer a checklist? Stretch and mobility list</button></div>`;
    a.openSheet("Guided mobility", "Hands-free flows", body, "");
  }
  PT.openMobility = openPicker;

  /* ---------------------------------------------------------------- the player */
  const M = { open: false, r: null, items: [], i: 0, endAt: 0, itemMs: 0, left: 0, paused: false, t: null, lastSec: -1, cum: [], total: 0, confirm: false };
  function clearTick() { if (M.t) { clearInterval(M.t); M.t = null; } }
  function overlay() {
    let o = $("pt-mob"); if (!o) { o = document.createElement("div"); o.id = "pt-mob"; o.setAttribute("role", "dialog"); o.setAttribute("aria-label", "Guided mobility"); document.body.appendChild(o); }
    return o;
  }
  const RING = 2 * Math.PI * 96;
  function startRoutine(id) {
    const a = A(), r = byId(id); if (!a || !r) return;
    try { a.closeSheet(); } catch (e) { }
    M.open = true; M.r = r; M.items = build(r); M.cum = []; let c = 0; M.items.forEach(x => { M.cum.push(c); c += x.s * 1000; }); M.total = c; M.confirm = false;
    document.body.classList.add("pt-mob-on");
    try { a.acquireWakeLock && a.acquireWakeLock(); } catch (e) { }
    const o = overlay();
    o.innerHTML = `<div class="pt-m-in">
      <div class="pt-m-top"><button type="button" class="pt-g-x" id="pt-m-x" aria-label="End the routine">✕</button><span class="pt-g-n">${esc(r.name)}</span><span class="pt-g-n" id="pt-m-count"></span></div>
      <div class="pt-g-bar"><span id="pt-m-bar"></span></div>
      <div class="pt-m-body">
        <div class="pt-m-tag" id="pt-m-tag"></div>
        <div class="pt-m-ring"><svg viewBox="0 0 220 220" aria-hidden="true"><circle cx="110" cy="110" r="96" class="bg"/><circle cx="110" cy="110" r="96" class="fg" id="pt-m-fg" stroke-dasharray="${RING.toFixed(1)}" stroke-dashoffset="0"/></svg><div class="pt-m-num" id="pt-m-num" aria-live="off"></div></div>
        <h2 class="pt-m-name" id="pt-m-name"></h2>
        <p class="pt-m-cue" id="pt-m-cue"></p>
        <p class="pt-m-next" id="pt-m-next"></p>
      </div>
      <div class="pt-m-ctl"><button type="button" id="pt-m-back" aria-label="Back">◀◀</button><button type="button" id="pt-m-pp" class="big" aria-label="Pause">⏸</button><button type="button" id="pt-m-skip" aria-label="Skip">▶▶</button><button type="button" id="pt-m-plus" aria-label="Add ten seconds">+10 s</button></div>
      <div class="pt-m-confirm hidden" id="pt-m-confirm"><div><b>End this routine?</b><p>Your progress is kept if you got most of the way through.</p><button type="button" id="pt-m-keep" class="keep">Keep going</button><button type="button" id="pt-m-end">End</button></div></div>
    </div>`;
    go(0);
  }
  function go(i) {
    if (!M.open) return;
    if (i >= M.items.length) { finish(); return; }
    M.i = Math.max(0, i); const it = M.items[M.i];
    M.itemMs = it.s * 1000; M.endAt = Date.now() + M.itemMs; M.left = M.itemMs; M.paused = false; M.lastSec = -1;
    paint(); beep(it.k === "hold" ? "highBeep" : (it.side && it.side !== "Left side" ? "lowBeep" : "shortBeep"));
    clearTick(); M.t = setInterval(tick, 200); tick();
  }
  function paint() {
    const it = M.items[M.i], hold = it.k === "hold", o = $("pt-mob"); if (!o) return;
    const stepNo = it.step + 1, steps = M.r.steps.length;
    $("pt-m-count").textContent = stepNo + " / " + steps;
    $("pt-m-tag").textContent = hold ? (it.side || "Hold") : "Get ready";
    $("pt-m-tag").className = "pt-m-tag" + (hold ? "" : " prep");
    $("pt-m-name").textContent = it.n;
    $("pt-m-cue").textContent = hold ? it.cue : (it.side === "Right side" ? "Switch sides." : "Get into position.");
    const nx = M.items.slice(M.i + 1).find(x => x.k === "hold");
    $("pt-m-next").textContent = hold ? (nx ? "Up next: " + nx.n + (nx.side ? " · " + nx.side : "") : "Last one") : "";
    $("pt-m-fg").setAttribute("class", "fg" + (hold ? "" : " prep"));
    $("pt-m-pp").textContent = M.paused ? "▶" : "⏸"; $("pt-m-pp").setAttribute("aria-label", M.paused ? "Resume" : "Pause");
  }
  function tick() {
    if (!M.open || M.paused) return;
    const left = M.endAt - Date.now();
    if (left <= 0) { go(M.i + 1); return; }
    update(left);
  }
  function update(left) {
    const sec = Math.ceil(left / 1000), num = $("pt-m-num"), fg = $("pt-m-fg"), bar = $("pt-m-bar"); if (!num || !fg) return;
    if (sec !== M.lastSec) { M.lastSec = sec; num.textContent = sec; if (sec <= 3 && sec > 0) beep("shortBeep"); }
    fg.setAttribute("stroke-dashoffset", (RING * (1 - left / M.itemMs)).toFixed(1));
    if (bar) bar.style.width = Math.min(100, (M.cum[M.i] + (M.itemMs - left)) / M.total * 100).toFixed(1) + "%";
  }
  function pause() { if (!M.open || M.paused) return; M.left = Math.max(0, M.endAt - Date.now()); M.paused = true; paint(); }
  function resume() { if (!M.open || !M.paused) return; M.endAt = Date.now() + M.left; M.paused = false; paint(); tick(); }
  function elapsedMs() { return M.itemMs - (M.paused ? M.left : Math.max(0, M.endAt - Date.now())); }
  function back() {
    const it = M.items[M.i]; let j = M.i - 1;
    if (it.k === "hold" && elapsedMs() > 3000) j = M.i;
    else while (j > 0 && M.items[j].k !== "hold") j--;
    go(Math.max(0, j));
  }
  /** seconds of holds that were finished (and part of the one in progress) */
  const doneSecs = () => M.items.slice(0, M.i).reduce((t, x) => t + (x.k === "hold" ? x.s : 0), 0);
  function record(secs) {
    const a = A(), r = M.r; if (!a || !r || secs < 30) return;
    const lg = log(a).concat([{ ts: Date.now(), d: PT.ds(), id: r.id, secs: Math.round(secs), regs: (r.regs || []).slice() }]);
    a.settings.mobLog = lg.slice(-120); save();
    try { a.renderHomeView && a.renderHomeView(); } catch (e) { }
  }
  function leave() {
    clearTick(); M.open = false; M.confirm = false;
    const o = $("pt-mob"); if (o) o.remove(); document.body.classList.remove("pt-mob-on");
    try { A().releaseWakeLock && A().releaseWakeLock(); } catch (e) { }
  }
  function finish() {
    clearTick(); const a = A(), r = M.r, secs = holdSecs(r); M.i = M.items.length;
    record(secs); beep("completeChime"); try { navigator.vibrate && navigator.vibrate([120, 80, 150]); } catch (e) { }
    try { a.releaseWakeLock && a.releaseWakeLock(); } catch (e) { }
    const st = stats(a), o = overlay();
    o.innerHTML = `<div class="pt-m-in"><div class="pt-m-top"><button type="button" class="pt-g-x" id="pt-m-close" aria-label="Close">✕</button><span class="pt-g-n">${esc(r.name)}</span><span></span></div>
      <div class="pt-m-body" style="text-align:center"><div style="font-size:4rem">🧘</div><h2 class="pt-m-name">Nicely done</h2>
      <p class="pt-m-cue">${Math.max(1, Math.round(secs / 60))} minute${Math.round(secs / 60) === 1 ? "" : "s"} of ${esc(r.name.toLowerCase())}. ${st.week} session${st.week === 1 ? "" : "s"} this week.${r.regs && r.regs.length ? " The recovery map gives your " + esc(r.regs.slice(0, 3).map(x => REGION_WORD[x] || x).join(", ")) + " a little credit." : ""}</p>
      <button type="button" class="pt-g-log" id="pt-m-close2">Done</button><button type="button" class="pt-g-ghost" id="pt-m-again">Pick another</button></div></div>`;
  }
  function ask() { if (!M.open || M.i >= M.items.length) { leave(); return; } pause(); const c = $("pt-m-confirm"); if (c) c.classList.remove("hidden"); M.confirm = true; }
  function endNow() {
    if (M.open && M.i < M.items.length && M.i / M.items.length >= 0.6) record(doneSecs());
    leave();
  }

  document.addEventListener("click", e => {
    const a = A(); if (!a || !e.target.closest) return; const t = id => e.target.closest("#" + id);
    const m = e.target.closest("[data-mob]"); if (m) { startRoutine(m.dataset.mob); return; }
    if (t("pt-mob-open") || t("pt-prog-mob")) { openPicker(); return; }
    if (t("pt-mob-list")) { try { a.closeSheet(); } catch (x) { } PT.openStretch && PT.openStretch(); return; }
    if (!M.open) return;
    if (t("pt-m-x")) { ask(); return; }
    if (t("pt-m-keep")) { const c = $("pt-m-confirm"); if (c) c.classList.add("hidden"); M.confirm = false; resume(); return; }
    if (t("pt-m-end")) { endNow(); return; }
    if (t("pt-m-pp")) { if (M.paused) resume(); else pause(); return; }
    if (t("pt-m-skip")) { go(M.i + 1); return; }
    if (t("pt-m-back")) { back(); return; }
    if (t("pt-m-plus")) { M.itemMs += 10000; if (M.paused) M.left += 10000; else M.endAt += 10000; M.lastSec = -1; return; }
    if (t("pt-m-close") || t("pt-m-close2")) { leave(); return; }
    if (t("pt-m-again")) { leave(); openPicker(); return; }
  });
  document.addEventListener("visibilitychange", () => { if (document.hidden && M.open && M.i < M.items.length && !M.paused) pause(); });
  PT.mobState = () => ({ open: M.open, i: M.i, paused: M.paused, items: M.items.length });
  PT.startMobility = startRoutine;

  /* ---------------------------------------------------------------- where it shows up */
  function ensureProgBtn() {
    const box = $("pt-prog-tools"); if (!box || $("pt-prog-mob")) return;
    const b = document.createElement("button"); b.type = "button"; b.id = "pt-prog-mob"; b.style.gridColumn = "1 / -1"; b.textContent = "⏱ Guided mobility (hands-free)";
    const s = $("pt-prog-stretch"); if (s) s.insertAdjacentElement("beforebegin", b); else box.appendChild(b);
  }
  const oRP = proto.renderProgramsView;
  if (oRP) proto.renderProgramsView = function () { const r = oRP.apply(this, arguments); try { ensureProgBtn(); } catch (e) { } return r; };

  /** Home: on a heavy work day with no mobility yet today */
  function homeChip(a) {
    const host = $("home-work"); let b = $("pt-mob-chip");
    let show = false; try { show = !!(host && PT.workHeavyToday && PT.workHeavyToday(a) && !stats(a).today); } catch (e) { }
    if (!show) { if (b) b.remove(); return; }
    if (!b) { b = document.createElement("button"); b.type = "button"; b.id = "pt-mob-chip"; b.className = "tap-active"; b.dataset.mob = "back"; }
    b.innerHTML = `🧘 Heavy work day <span>${mins(byId("back"))} min of back relief · Start</span>`;
    if (host.nextElementSibling !== b) host.insertAdjacentElement("afterend", b);
  }
  const oHome = proto.renderHomeView;
  if (oHome) proto.renderHomeView = function () { const r = oHome.apply(this, arguments); try { homeChip(this); } catch (e) { console.error("PulseTrack mobility chip", e); } return r; };

  /** after a workout, next to the stretch list button */
  const oFin = proto.finishWorkoutV2;
  if (oFin) proto.finishWorkoutV2 = async function () {
    const r = await oFin.apply(this, arguments);
    try {
      const s = $("pt-summary-stretch"); if (!s) return r;
      let b = $("pt-summary-mob");
      if (!b) { b = document.createElement("button"); b.id = "pt-summary-mob"; b.type = "button"; b.className = s.className; s.insertAdjacentElement("afterend", b); }
      const g = s.dataset.group, id = g === "upper" ? "shoulders" : g === "lower" ? "hips" : "reset";
      b.dataset.mob = id; b.textContent = "⏱ Guided mobility · " + mins(byId(id)) + " min";
    } catch (e) { console.error("PulseTrack mobility summary", e); }
    return r;
  };

  /* ---------------------------------------------------------------- CSS */
  const css = document.createElement("style"); css.id = "pt-v236-mob-css";
  css.textContent = `
    .pt-mob-card { display: flex; align-items: center; gap: .75rem; width: 100%; padding: .75rem .85rem; border-radius: .9rem; background: rgb(var(--z900)); border: 1px solid rgb(var(--z800)); }
    .pt-mob-card.sug { border-color: rgb(245 158 11 / .5); background: rgb(245 158 11 / .06); }
    .pt-mob-ic { flex: none; width: 2.4rem; height: 2.4rem; display: grid; place-items: center; font-size: 1.3rem; border-radius: .7rem; background: rgb(var(--z800)); }
    #pt-mob { position: fixed; inset: 0; z-index: 60; background: rgb(var(--z950)); overflow-y: auto; }
    body.pt-mob-on { overflow: hidden; }
    .pt-m-in { max-width: 32rem; margin: 0 auto; min-height: 100%; display: flex; flex-direction: column; padding: calc(env(safe-area-inset-top, 0px) + .75rem) 1rem calc(1rem + env(safe-area-inset-bottom, 0px)); position: relative; }
    .pt-m-top { display: flex; align-items: center; justify-content: space-between; gap: .5rem; }
    .pt-m-body { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .7rem; text-align: center; padding: .5rem 0; }
    .pt-m-tag { font-size: .75rem; font-weight: 900; letter-spacing: .12em; text-transform: uppercase; color: rgb(var(--a400)); min-height: 1rem; }
    .pt-m-tag.prep { color: rgb(251 191 36); }
    .pt-m-ring { position: relative; width: min(64vw, 15rem); aspect-ratio: 1; }
    .pt-m-ring svg { width: 100%; height: 100%; transform: rotate(-90deg); }
    .pt-m-ring circle { fill: none; stroke-width: 12; }
    .pt-m-ring .bg { stroke: rgb(var(--z800)); }
    .pt-m-ring .fg { stroke: rgb(var(--a500)); stroke-linecap: round; transition: stroke-dashoffset .25s linear; }
    .pt-m-ring .fg.prep { stroke: rgb(251 191 36); }
    .pt-m-num { position: absolute; inset: 0; display: grid; place-items: center; font-size: 4.2rem; font-weight: 900; color: #fff; font-variant-numeric: tabular-nums; }
    .pt-m-name { font-size: 1.6rem; font-weight: 900; color: #fff; line-height: 1.15; }
    .pt-m-cue { font-size: .95rem; color: rgb(var(--z300)); line-height: 1.45; max-width: 26rem; min-height: 2.8rem; }
    .pt-m-next { font-size: .78rem; color: rgb(var(--z500)); font-weight: 700; min-height: 1.1rem; }
    .pt-m-ctl { display: grid; grid-template-columns: 1fr 1.4fr 1fr 1fr; gap: .5rem; }
    .pt-m-ctl button { padding: 1rem .5rem; border-radius: 1rem; background: rgb(var(--z800)); color: #fff; font-weight: 800; font-size: .95rem; }
    .pt-m-ctl button.big { background: rgb(var(--a600)); font-size: 1.4rem; }
    .pt-m-confirm { position: absolute; inset: 0; display: grid; place-items: center; background: rgb(var(--z950) / .92); z-index: 2; text-align: center; }
    .pt-m-confirm.hidden { display: none; }
    .pt-m-confirm b { display: block; font-size: 1.2rem; color: #fff; }
    .pt-m-confirm p { font-size: .8rem; color: rgb(var(--z400)); margin: .4rem 0 1rem; }
    .pt-m-confirm button { display: block; width: 14rem; margin: .5rem auto 0; padding: .9rem; border-radius: 1rem; background: rgb(var(--z800)); color: #fff; font-weight: 800; }
    .pt-m-confirm button.keep { background: rgb(var(--a600)); }
    #pt-mob-chip { display: flex; align-items: center; justify-content: space-between; gap: .5rem; width: 100%; padding: .6rem .85rem; border-radius: .9rem; font-size: .8rem; font-weight: 700; background: rgb(23 37 84 / .35); border: 1px solid rgb(30 64 175 / .55); color: #bfdbfe; text-align: left; }
    #pt-mob-chip span { font-size: .68rem; font-weight: 500; color: #93c5fd; text-align: right; }
  `;
  document.head.appendChild(css);
})();
  