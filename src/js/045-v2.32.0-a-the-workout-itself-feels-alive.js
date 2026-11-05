
/* =====================================================================
 * PulseTrack 2.32.0 (A): the workout itself feels alive.
 *  - Set feedback: "+5 lb vs last time", a pulse on the button, and a PR moment (banner, confetti, sting) right when you set one.
 *  - Sound packs (Soft, Arcade, Off) for set ticks, rest beeps and the PR sting.
 *  - Rest timer: bigger ring and a "Next: exercise, set, weight x reps" line.
 *  - Live session bar: sets done out of planned and a running XP count.
 *  - Guided mode: one exercise at a time, big steppers, one big Log set button.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  const proto = ApplicationUI.prototype;
  const A = () => window.app;
  const $ = id => document.getElementById(id);
  const esc = s => PT.esc(s);
  const save = () => { try { WorkoutStorage.saveSettings(A().settings); } catch (e) { } };
  const unitTxt = () => (A().unit() === "kg" ? "kg" : "lb");
  const stepW = () => (A().unit() === "kg" ? 2.5 : 5);
  const num = v => { const n = parseFloat(v); return isFinite(n) ? n : 0; };
  const fx = a => a.settings.fx !== false;
  const pack = () => (A() && A().settings.pack) || "soft";
  const chip = (attr, label, on) => `<button type="button" ${attr} aria-pressed="${on}" class="pt-opt tap-active">${esc(label)}</button>`;

  /* ============================================================== sound packs */
  function patchSound() {
    if (typeof sound === "undefined" || sound.__pt) return; sound.__pt = 1;
    const sb = sound.shortBeep.bind(sound), cc = sound.completeChime.bind(sound);
    sound.shortBeep = function () {
      const p = pack(); if (p === "off") return;
      if (p === "arcade") { this.playTone(660, "square", 0.06, 0.1); setTimeout(() => this.playTone(990, "square", 0.06, 0.1), 55); if (this.vibrate) this.vibrate(40); return; }
      sb();
    };
    sound.completeChime = function () {
      const p = pack(); if (p === "off") { if (this.vibrate) this.vibrate([120, 80, 150]); return; }
      if (p === "arcade") { [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => setTimeout(() => this.playTone(f, "square", 0.09, 0.1), i * 70)); if (this.vibrate) this.vibrate([120, 80, 150]); return; }
      cc();
    };
    sound.prSting = function () {
      const p = pack(); if (this.vibrate) this.vibrate([80, 40, 80, 40, 160]); if (p === "off") return;
      [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => setTimeout(() => this.playTone(f, p === "arcade" ? "square" : "triangle", 0.2, p === "arcade" ? 0.12 : 0.22), i * 85));
    };
  }

  /* ============================================================== set feedback */
  let flashT = null;
  function flash(text, kind) {
    let el = $("pt-flash");
    if (!el) { el = document.createElement("div"); el.id = "pt-flash"; el.setAttribute("role", "status"); document.body.appendChild(el); }
    el.className = "pt-flash " + (kind || "up"); el.textContent = text; el.style.animation = "none"; void el.offsetWidth; el.style.animation = "";
    clearTimeout(flashT); flashT = setTimeout(() => { if (el.parentNode) el.remove(); }, 1900);
  }
  function prMoment(name, w, r) {
    const b = document.createElement("div"); b.id = "pt-prbanner"; b.setAttribute("role", "status");
    b.innerHTML = `<span class="pt-prmedal">🏅</span><span class="pt-prt">NEW PR</span><span class="pt-prn">${esc(name)}</span><span class="pt-prv">${w ? esc(String(w)) + " " + unitTxt() : ""}${r ? " × " + esc(String(r)) : ""}</span>`;
    document.body.appendChild(b); setTimeout(() => b.remove(), 2300);
    if (PT.confetti) PT.confetti(42);
    try { sound.prSting(); } catch (e) { }
  }
  document.addEventListener("click", e => {
    const a = A(); const btn = e.target.closest && e.target.closest(".btn-check-set");
    if (!a || !btn || btn.dataset.completed === "1") return;
    const key = btn.dataset.key, name = btn.dataset.exname, ent = (a.logs && a.logs[key]) || {};
    const before = (a.prs && a.prs[name]) || 0, w = num(ent.weight), r = num(ent.reps), tag = ent.tag || "R";
    const idx = parseInt(String(key).split("_s").pop(), 10), prev = ((a.lastPerf || {})[name] || [])[idx];
    setTimeout(() => {
      try {
        const b2 = document.querySelector(`.btn-check-set[data-key="${key}"]`); if (b2) { b2.classList.remove("pt-pulse"); void b2.offsetWidth; b2.classList.add("pt-pulse"); }
        if (!fx(a) || tag === "W" || tag === "D") return;
        const after = (a.prs && a.prs[name]) || 0;
        if (before > 0 && after > before) { prMoment(name, w, r); return; }
        if (prev && num(prev.weight) > 0) {
          const dw = Math.round((w - num(prev.weight)) * 100) / 100, dr = r - num(prev.reps);
          if (dw > 0) flash(`+${dw} ${unitTxt()} vs last time`, "up");
          else if (dw === 0 && dr > 0) flash(`+${dr} rep${dr === 1 ? "" : "s"} vs last time`, "up");
          else if (dw === 0 && dr === 0 && w > 0) flash("Matched last time", "same");
        }
      } catch (x) { console.error("PulseTrack set feedback", x); }
    }, 60);
  }, true);

  /* ============================================================== rest timer: next up */
  function planned(a) { const out = []; ((a.activeDay && a.activeDay.exercises) || []).forEach((ex, ei) => { for (let s = 0; s < (ex.sets || 0); s++) out.push({ ex, ei, s, key: a.getLogKey(a.activeProgram.id, a.activeDay.dayNumber, ex.id, s) }); }); return out; }
  function nextUp(a) {
    if (!a || !a.activeDay || !a.activeProgram) return "";
    const list = planned(a); if (!list.length) return "";
    for (const p of list) {
      const e = a.logs[p.key]; if (e && e.completed) continue;
      const prev = (a.lastPerf[p.ex.name] || [])[p.s], w = (e && num(e.weight)) || (prev && num(prev.weight)) || 0, rp = (e && num(e.reps)) || (prev && num(prev.reps)) || 0;
      return `Next: ${p.ex.name} · set ${p.s + 1}${w ? " · " + w + " " + unitTxt() : ""}${rp ? " × " + rp : ""}`;
    }
    return "Last set done. Finish strong";
  }
  PT.nextUp = nextUp;
  function patchRest(a) {
    const rt = a && a.restTimer; if (!rt || rt.__pt) return; rt.__pt = 1;
    const o = rt.updateUI.bind(rt);
    rt.updateUI = function () { o(); try { if (!this.isPaused && (this.remainingSeconds || 0) > 0) { const t = nextUp(A()); if (t) this.subtextEl.innerText = t; } } catch (e) { } };
  }

  /* ============================================================== live session bar */
  let shownXp = 0, tweenRaf = 0;
  function tweenTo(el, to) {
    cancelAnimationFrame(tweenRaf); const from = shownXp, t0 = performance.now();
    const step = t => { const k = Math.min(1, (t - t0) / 500); shownXp = Math.round(from + (to - from) * k); el.textContent = "+" + shownXp + " XP"; if (k < 1) tweenRaf = requestAnimationFrame(step); };
    tweenRaf = requestAnimationFrame(step);
  }
  function sbar(a) {
    const list = a.dom && a.dom.exercisesList; if (!list || !a.activeDay || !a.activeProgram) return;
    const ps = planned(a), done = ps.filter(p => { const e = a.logs[p.key]; return e && e.completed; }).length;
    let el = $("pt-sbar");
    if (!ps.length) { if (el) el.remove(); return; }
    if (!el) { el = document.createElement("div"); el.id = "pt-sbar"; list.parentElement.insertBefore(el, list); } else if (el.nextElementSibling !== list) list.parentElement.insertBefore(el, list);
    const pct = Math.round(done / ps.length * 100), xp = done ? 50 + 3 * done : 0;
    el.innerHTML = `<div class="pt-sbar-in"><div class="pt-sbar-top"><span class="pt-sbar-t">${done} / ${ps.length} sets</span><span class="pt-sbar-x" id="pt-sbar-xp">+${shownXp} XP</span><button type="button" class="pt-gbtn tap-active" id="pt-guided-go">🎯 Guided</button></div><div class="pt-bar"><span style="width:${pct}%"></span></div></div>`;
    const xe = $("pt-sbar-xp"); if (xe && xp !== shownXp) tweenTo(xe, xp);
  }
  const oRW = proto.renderWorkoutView;
  proto.renderWorkoutView = function () {
    const r = oRW.apply(this, arguments);
    try { if (!window.app) window.app = this; patchSound(); patchRest(this); sbar(this); ensureGuidedHook(); if (G.open) setTimeout(renderG, 30); } catch (e) { console.error("PulseTrack workout feel", e); }
    return r;
  };

  /* ============================================================== guided mode */
  const G = { open: false, ei: 0, vals: {} };
  function ensureGuidedHook() { const box = $("pt-wk-actions"); if (box && !$("pt-guided-open")) { const b = document.createElement("button"); b.type = "button"; b.id = "pt-guided-open"; b.textContent = "Guided mode"; box.appendChild(b); } }
  function exs(a) { return (a.activeDay && a.activeDay.exercises) || []; }
  const keyOf = (a, ex, s) => a.getLogKey(a.activeProgram.id, a.activeDay.dayNumber, ex.id, s);
  const doneSet = (a, ex, s) => { const e = a.logs[keyOf(a, ex, s)]; return !!(e && e.completed); };
  const firstOpen = (a, ex) => { for (let s = 0; s < (ex.sets || 0); s++) if (!doneSet(a, ex, s)) return s; return -1; };
  /** sets from this number on were added on top of the program's own (ex.origSets is the program's count) */
  const extraFrom = ex => { const n = ex.sets || 0; return ex.origSets !== undefined && n > ex.origSets ? ex.origSets : n; };
  /** remove set s of an exercise; sets logged after it move up one, so nothing that was logged is lost */
  function dropSet(a, ex, s) {
    const n = ex.sets || 0; if (n <= 1 || s < 0 || s >= n) return false;
    for (let i = s; i < n - 1; i++) { const nx = a.logs[keyOf(a, ex, i + 1)]; if (nx) a.logs[keyOf(a, ex, i)] = nx; else delete a.logs[keyOf(a, ex, i)]; }
    delete a.logs[keyOf(a, ex, n - 1)];
    for (let i = s; i < n; i++) delete G.vals[keyOf(a, ex, i)];
    a.changeSets(ex, -1);
    WorkoutStorage.saveLogs(a.logs); WorkoutStorage.setData(a.data);
    return true;
  }
  /** the exercise's own screen redraws (the guided view follows it) */
  const refresh = a => { try { a.renderWorkoutView(); } catch (e) { } renderG(); };
  /** 2.51.0: a superset, tri-set, giant set or circuit is a run of exercises linked with "Superset with next" (the same rule as the A1 / A2 labels).
   *  Guided mode shows the whole run on one screen: a weight and reps for each exercise, and one button that logs the round. A lone exercise gives [i, i]. */
  function blockAt(list, i) { let x = i, y = i; while (x > 0 && list[x - 1] && list[x - 1].link) x--; while (y < list.length - 1 && list[y] && list[y].link) y++; return [x, y]; }
  /** the Log round button sticks above the bottom bar; while the rest timer card is up it sits above that too (the card pops up right after you log a round, and would cover the button) */
  let lobs = null, robs = null, lint = 0;
  function liftLog() {
    const o = $("pt-guided"); if (!o) return;
    const nav = o.querySelector(".pt-g-nav"), t = $("floating-rest-timer"), H = window.innerHeight;
    let up = nav ? H - nav.getBoundingClientRect().top : 80;
    if (t && t.classList.contains("opacity-100") && getComputedStyle(t).display !== "none") up = Math.max(up, H - t.offsetTop);
    const v = Math.round(up + 10) + "px"; if (o.style.getPropertyValue("--gb-bottom") !== v) o.style.setProperty("--gb-bottom", v);
  }
  function watchTimer() {
    const t = $("floating-rest-timer"); if (!t || lobs || typeof MutationObserver === "undefined") return;
    lobs = new MutationObserver(() => { try { liftLog(); } catch (e) { } }); lobs.observe(t, { attributes: true, attributeFilter: ["class", "style"] });
    if (typeof ResizeObserver !== "undefined") { robs = new ResizeObserver(() => { try { liftLog(); } catch (e) { } }); robs.observe(t); }     // the card grows when its "Next:" line wraps
    lint = setInterval(() => { try { liftLog(); } catch (e) { } }, 150);     // and it moves up when the Finish bar appears after the first set, which none of the above sees
  }
  window.addEventListener("resize", () => { if (G.open) { try { liftLog(); } catch (e) { } } });
  const qf = (k, f) => document.querySelector(`input.input-set-field[data-key="${k}"][data-field="${f}"]`);
  const blockName = (list, b0, b1) => { const t = list.slice(b0, b1 + 1); return t.some(e => e.type === "giantset") ? "Giant set" : t.length === 2 ? "Superset" : t.length === 3 ? "Tri-set" : t.length === 4 ? "Giant set" : "Circuit"; };
  const blockNames = (list, b0, b1) => { const t = list.slice(b0, b1 + 1).map(e => e.name); return t.length > 3 ? t[0] + " + " + (t.length - 1) + " more" : t.join(" + "); };
  /** where each exercise of the group is: its next open set, and whether the weight and reps boxes exist for it (timed ones do not).
   *  The round is the lowest next set among those you can log here; parts are the exercises that take part in it. */
  function roundInfo(a, list, b0, b1) {
    const rows = [];
    for (let i = b0; i <= b1; i++) {
      const ex = list[i], n = ex.sets || 0, s = firstOpen(a, ex), k = s >= 0 ? keyOf(a, ex, s) : "";
      rows.push({ i, ex, n, s, k, has: s >= 0 && !!qf(k, "weight") && !!qf(k, "reps") });
    }
    const act = rows.filter(r => r.has), r0 = act.length ? Math.min.apply(null, act.map(r => r.s)) : -1;
    return { rows, r0, parts: act.filter(r => r.s === r0) };
  }
  function addSetG() {
    const a = A(), list = exs(a), ex = list[G.ei]; if (!ex) return;
    const bl = blockAt(list, G.ei);
    for (let i = bl[0]; i <= bl[1]; i++) a.changeSets(list[i], 1);       // a group gets one more round: one more set for each of its exercises
    WorkoutStorage.setData(a.data); refresh(a);
  }
  /** takes off the last set you have not logged yet */
  function removeSetG() {
    const a = A(), list = exs(a), ex = list[G.ei]; if (!ex) return;
    const bl = blockAt(list, G.ei);
    if (bl[1] > bl[0]) {
      let gone = 0;
      for (let j = bl[0]; j <= bl[1]; j++) { const e = list[j]; if ((e.sets || 0) <= 1) continue; let i = (e.sets || 0) - 1; while (i >= 0 && doneSet(a, e, i)) i--; if (i >= 0 && dropSet(a, e, i)) gone++; }
      if (!gone) { a.toast("Every round is logged, or each exercise is down to one set. Uncheck one in the normal view to remove it."); return; }
      refresh(a); return;
    }
    if ((ex.sets || 0) <= 1) { a.toast("An exercise needs at least one set"); return; }
    let i = (ex.sets || 0) - 1; while (i >= 0 && doneSet(a, ex, i)) i--;
    if (i < 0) { a.toast("Every set is logged. Uncheck one in the normal view to remove it."); return; }
    dropSet(a, ex, i); refresh(a);
  }
  /** Skip on an extra set just deletes it (and moves on when the exercise has nothing left to log) */
  function skipExtraG() {
    const a = A(), list = exs(a), ex = list[G.ei]; if (!ex) return;
    const bl = blockAt(list, G.ei);
    if (bl[1] > bl[0]) {      // a group: skip the extra round, one set off each exercise that was in it
      const info = roundInfo(a, list, bl[0], bl[1]);
      if (!info.parts.length || !info.parts.every(p => p.s >= extraFrom(p.ex))) return;
      info.parts.forEach(p => dropSet(a, p.ex, p.s));
      if (list.slice(bl[0], bl[1] + 1).every(e => firstOpen(a, e) < 0) && bl[1] < list.length - 1) G.ei = bl[1] + 1;
      refresh(a); return;
    }
    const s = firstOpen(a, ex); if (s < 0 || s < extraFrom(ex)) return;
    dropSet(a, ex, s);
    if (firstOpen(a, ex) < 0 && G.ei < list.length - 1) G.ei++;
    refresh(a);
  }
  function openGuided() {
    const a = A(); if (!a || !a.activeDay || !exs(a).length) { a && a.toast("Open a workout first"); return; }
    if (a.dom.viewWorkout && a.dom.viewWorkout.classList.contains("hidden")) a.showView("workout");
    G.open = true; G.vals = {};
    const list = exs(a); let i = list.findIndex(ex => (ex.sets || 0) > 0 && firstOpen(a, ex) >= 0); G.ei = i >= 0 ? i : 0;
    let o = $("pt-guided"); if (!o) { o = document.createElement("div"); o.id = "pt-guided"; o.setAttribute("role", "dialog"); o.setAttribute("aria-label", "Guided mode"); document.body.appendChild(o); }
    document.body.classList.add("pt-guided-on"); watchTimer(); renderG();
  }
  function closeGuided() { G.open = false; if (lobs) { lobs.disconnect(); lobs = null; } if (robs) { robs.disconnect(); robs = null; } if (lint) { clearInterval(lint); lint = 0; } const o = $("pt-guided"); if (o) o.remove(); document.body.classList.remove("pt-guided-on"); }
  function startVals(a, ex, s) {
    const k = keyOf(a, ex, s), e = a.logs[k] || {}, prev = (a.lastPerf[ex.name] || [])[s], lastDone = (() => { for (let j = s - 1; j >= 0; j--) { const x = a.logs[keyOf(a, ex, j)]; if (x && x.completed && num(x.weight) > 0) return x; } return null; })();
    const rr = a.parseRepRange ? a.parseRepRange(ex.reps) : null;
    return { w: e.weight !== undefined && e.weight !== "" ? num(e.weight) : lastDone ? num(lastDone.weight) : prev ? num(prev.weight) : 0, r: e.reps !== undefined && e.reps !== "" ? num(e.reps) : lastDone ? num(lastDone.reps) : prev ? num(prev.reps) : rr ? (rr.lo || rr[0] || 8) : 8 };
  }
  function renderG() {
    const a = A(), o = $("pt-guided"); if (!G.open || !o || !a || !a.activeDay) return;
    const list = exs(a), ps = planned(a), done = ps.filter(p => doneSet(a, p.ex, p.s)).length, pct = ps.length ? Math.round(done / ps.length * 100) : 0;
    if (G.ei >= list.length) G.ei = list.length - 1; if (G.ei < 0) G.ei = 0;
    const bl = blockAt(list, G.ei); G.ei = bl[0];            // a superset or giant set is one screen, it starts at its first exercise
    const ex = list[G.ei], allDone = ps.length > 0 && done === ps.length, isBlock = bl[1] > bl[0];
    if (allDone) { o.innerHTML = `<div class="pt-g-in"><div class="pt-g-top"><button type="button" class="pt-g-x" id="pt-g-close" aria-label="Close guided mode">✕</button><span class="pt-g-n">All sets done</span><span></span></div><div class="pt-g-body" style="text-align:center"><div style="font-size:4rem">🎉</div><h2 class="text-2xl font-black text-white">That is the workout</h2><p class="text-sm text-zinc-300">${done} set${done === 1 ? "" : "s"} logged. Nice work.</p><button type="button" class="pt-g-log" id="pt-g-finish">Finish workout</button><button type="button" class="pt-g-ghost" id="pt-g-addset">＋ One more ${isBlock ? "round" : "set"} of ${esc(isBlock ? blockNames(list, bl[0], bl[1]) : ex.name)}</button></div></div>`; return; }
    if (isBlock) { o.innerHTML = blockHtml(a, list, bl[0], bl[1], pct); try { liftLog(); } catch (e) { } return; }
    const n = ex.sets || 0, cur = firstOpen(a, ex), s = cur >= 0 ? cur : n - 1, k = keyOf(a, ex, s);
    const hasW = !!document.querySelector(`input.input-set-field[data-key="${k}"][data-field="weight"]`) && !!document.querySelector(`input.input-set-field[data-key="${k}"][data-field="reps"]`);
    const vv = G.vals[k] || (G.vals[k] = startVals(a, ex, s)), last = (a.lastWorkingSets ? a.lastWorkingSets(ex.name) : []).slice(0, 4);
    const xf = extraFrom(ex), isExtra = cur >= 0 && cur >= xf;
    const chips = Array.from({ length: n }, (_, i) => { const e = a.logs[keyOf(a, ex, i)] || {}, d = doneSet(a, ex, i); return `<span class="pt-g-chip ${d ? "done" : i === s ? "cur" : ""}${i >= xf ? " extra" : ""}">${d ? "✓ " + (num(e.weight) ? esc(String(e.weight)) + "×" : "") + esc(String(e.reps || "")) : "S" + (i + 1) + (i >= xf ? "+" : "")}</span>`; }).join("");
    const stepper = (id, label, val, step) => `<div class="pt-g-fld"><span>${label}</span><div><button type="button" class="pt-g-st" data-gs="${id}" data-d="${-step}" aria-label="Less ${label}">−</button><input type="number" inputmode="decimal" id="pt-g-${id}" value="${val}" aria-label="${label}"><button type="button" class="pt-g-st" data-gs="${id}" data-d="${step}" aria-label="More ${label}">+</button></div></div>`;
    o.innerHTML = `<div class="pt-g-in">
      <div class="pt-g-top"><button type="button" class="pt-g-x" id="pt-g-close" aria-label="Close guided mode">✕</button><span class="pt-g-n">Exercise ${G.ei + 1} of ${list.length}</span><span class="pt-g-n">${pct}%</span></div>
      <div class="pt-g-bar"><span style="width:${pct}%"></span></div>
      <div class="pt-g-body">
        <h2 class="pt-g-title">${esc(ex.name)}</h2>
        <p class="pt-g-sub">${n} set${n === 1 ? "" : "s"}${ex.reps ? " · target " + esc(String(ex.reps)) : ""} · ${cur >= 0 ? "Set " + (s + 1) + " of " + n + (isExtra ? " · extra set" : "") : "all sets done"}</p>
        ${(() => { const su = PT.setupNote ? PT.setupNote(a, ex.name) : ""; return su ? `<p class="pt-g-sub">⚙ ${esc(su)}</p>` : ""; })()}
        ${last.length ? `<p class="pt-g-last">Last time: ${last.map(x => esc(String(x.weight)) + "×" + esc(String(x.reps))).join(", ")}</p>` : ""}
        <div class="pt-g-chips">${chips}</div>
        <div class="pt-g-setctl"><button type="button" id="pt-g-rmset" aria-label="Remove the last unlogged set">− Set</button><button type="button" id="pt-g-addset" aria-label="Add a set">＋ Set</button></div>
        ${hasW ? `<div class="pt-g-flds">${stepper("w", "Weight (" + unitTxt() + ")" + (PT.sideTag ? PT.sideTag(ex) : ""), vv.w, stepW())}${stepper("r", "Reps", vv.r, 1)}</div><button type="button" class="pt-g-log" id="pt-g-log" data-k="${k}">${cur >= 0 ? "✔ Log set " + (s + 1) : "Next exercise ▶"}</button>` : `<p class="text-sm text-zinc-300 text-center">This one is timed or tracked differently. Log it in the normal view.</p><button type="button" class="pt-g-log" id="pt-g-normal">Open in normal view</button>`}
      </div>
      <div class="pt-g-nav"><button type="button" id="pt-g-prev" ${G.ei === 0 ? "disabled" : ""}>◀ Prev</button><button type="button" id="pt-g-swap">🔄 Swap</button>${isExtra ? `<button type="button" id="pt-g-skipset" aria-label="Skip this extra set and remove it">✕ Skip set</button>` : `<button type="button" id="pt-g-next" ${G.ei >= list.length - 1 ? "disabled" : ""}>Skip ▶</button>`}</div></div>`;
  }
  /** the screen for a superset / tri-set / giant set / circuit: every exercise of the group with its own weight and reps, one button for the round */
  function blockHtml(a, list, b0, b1, pct) {
    const info = roundInfo(a, list, b0, b1), rows = info.rows, parts = info.parts, r0 = info.r0, labs = a.supersetLabels ? a.supersetLabels(list) : [];
    const maxN = Math.max.apply(null, rows.map(r => r.n)), blkDone = rows.every(r => r.s < 0);
    const isExtra = parts.length > 0 && parts.every(p => p.s >= extraFrom(p.ex));
    const chips = Array.from({ length: maxN }, (_, j) => {
      const have = rows.filter(r => j < r.n), d = have.length > 0 && have.every(r => doneSet(a, r.ex, j)), x = have.length > 0 && have.every(r => j >= extraFrom(r.ex));
      return `<span class="pt-g-chip ${d ? "done" : j === r0 ? "cur" : ""}${x ? " extra" : ""}">${d ? "✓ " : ""}R${j + 1}${x ? "+" : ""}</span>`;
    }).join("");
    const fld = (id, i, label, plain, val, step) => `<div class="pt-gb-fld"><span>${label}</span><div><button type="button" class="pt-gb-st" data-gs="${id}" data-ex="${i}" data-d="${-step}" aria-label="Less ${plain} for ${esc(list[i].name)}">−</button><input type="number" inputmode="decimal" id="pt-g-${id}-${i}" value="${val}" aria-label="${plain} for ${esc(list[i].name)}"><button type="button" class="pt-gb-st" data-gs="${id}" data-ex="${i}" data-d="${step}" aria-label="More ${plain} for ${esc(list[i].name)}">+</button></div></div>`;
    const panels = rows.map(r => {
      const ex = r.ex, lb = labs[r.i] || "";
      if (parts.indexOf(r) < 0) {
        const why = r.s < 0 ? "✓ all " + r.n + " set" + (r.n === 1 ? "" : "s") + " done" : !r.has ? "timed or tracked differently, log it in the normal view" : "set " + (r.s + 1) + " is next";
        return `<div class="pt-gb-o"><b class="pt-gb-l">${esc(lb)}</b><span class="pt-gb-n">${esc(ex.name)}</span><i>${why}</i></div>`;
      }
      const vv = G.vals[r.k] || (G.vals[r.k] = startVals(a, ex, r.s)), last = (a.lastWorkingSets ? a.lastWorkingSets(ex.name) : []).slice(0, 4), su = PT.setupNote ? PT.setupNote(a, ex.name) : "";
      return `<section class="pt-gb-p" data-ex="${r.i}"><div class="pt-gb-h"><b class="pt-gb-l">${esc(lb)}</b><span class="pt-gb-n">${esc(ex.name)}</span><button type="button" class="pt-gb-sw" data-gx="swap" data-ex="${r.i}" aria-label="Swap ${esc(ex.name)}">🔄</button></div>
        <p class="pt-gb-sub">Set ${r.s + 1} of ${r.n}${ex.reps ? " · target " + esc(String(ex.reps)) : ""}${r.s >= extraFrom(ex) ? " · extra" : ""}</p>
        ${su ? `<p class="pt-gb-sub">⚙ ${esc(su)}</p>` : ""}${last.length ? `<p class="pt-gb-last">Last time: ${last.map(x => esc(String(x.weight)) + "×" + esc(String(x.reps))).join(", ")}</p>` : ""}
        <div class="pt-gb-f">${fld("w", r.i, "Weight (" + unitTxt() + ")" + (PT.sideTag ? PT.sideTag(ex) : ""), "weight", vv.w, stepW())}${fld("r", r.i, "Reps", "reps", vv.r, 1)}</div></section>`;
    }).join("");
    const act = parts.length
      ? `<button type="button" class="pt-g-log pt-gb-log" id="pt-g-log">✔ Log round ${r0 + 1}</button>`
      : blkDone ? `<button type="button" class="pt-g-log pt-gb-log" id="pt-g-log">Next exercise ▶</button>`
      : `<p class="text-sm text-zinc-300 text-center">Nothing left here that can be logged on this screen. Log it in the normal view.</p><button type="button" class="pt-g-log" id="pt-g-normal">Open in normal view</button>`;
    return `<div class="pt-g-in pt-gb-in">
      <div class="pt-g-top"><button type="button" class="pt-g-x" id="pt-g-close" aria-label="Close guided mode">✕</button><span class="pt-g-n">Exercises ${b0 + 1}–${b1 + 1} of ${list.length}</span><span class="pt-g-n">${pct}%</span></div>
      <div class="pt-g-bar"><span style="width:${pct}%"></span></div>
      <div class="pt-g-body">
        <h2 class="pt-g-title">${blockName(list, b0, b1)}</h2>
        <p class="pt-g-sub">${rows.map(r => esc(labs[r.i] || "")).join(" + ")} · ${parts.length ? "Round " + (r0 + 1) + " of " + maxN + (isExtra ? " · extra round" : "") : "all rounds done"}</p>
        <p class="pt-g-sub">Back to back, no rest between them. Rest after the last one.</p>
        <div class="pt-g-chips">${chips}</div>
        <div class="pt-g-setctl"><button type="button" id="pt-g-rmset" aria-label="Remove the last unlogged round">− Round</button><button type="button" id="pt-g-addset" aria-label="Add a round">＋ Round</button></div>
        ${panels}
        ${act}
      </div>
      <div class="pt-g-nav"><button type="button" id="pt-g-prev" ${b0 === 0 ? "disabled" : ""}>◀ Prev</button>${isExtra ? `<button type="button" id="pt-g-skipset" aria-label="Skip this extra round and remove it">✕ Skip round</button>` : `<button type="button" id="pt-g-next" ${b1 >= list.length - 1 ? "disabled" : ""}>Skip ▶</button>`}</div></div>`;
  }
  /** logs the round: set N of every exercise in the group that is on that round, in order, through the same check buttons as the normal view (so the rest timer, PRs and history all work the same) */
  function logBlock(a, list, b0, b1) {
    const info = roundInfo(a, list, b0, b1);
    if (!info.parts.length) {
      if (info.rows.every(r => r.s < 0)) { if (b1 < list.length - 1) { G.ei = b1 + 1; renderG(); } return; }
      a.toast("Use the normal view for this one"); return;
    }
    const vals = info.parts.map(p => { const w = $("pt-g-w-" + p.i), r = $("pt-g-r-" + p.i); return { k: p.k, w: w ? w.value : "", r: r ? r.value : "" }; });
    let missed = 0;
    vals.forEach(v => {
      const iw = qf(v.k, "weight"), ir = qf(v.k, "reps"), cb = document.querySelector(`.btn-check-set[data-key="${v.k}"]`);     // looked up each time: logging one set can redraw the others
      if (!iw || !ir || !cb) { missed++; return; }
      iw.value = v.w; iw.dispatchEvent(new Event("input", { bubbles: true })); ir.value = v.r; ir.dispatchEvent(new Event("input", { bubbles: true }));
      cb.click(); delete G.vals[v.k];
    });
    if (missed) a.toast("Log " + (missed === 1 ? "one of them" : missed + " of them") + " in the normal view");
    setTimeout(() => {
      const a2 = A(), l2 = exs(a2); if (!G.open || !a2) return;
      if (l2.slice(b0, b1 + 1).every(e => firstOpen(a2, e) < 0) && b1 < l2.length - 1) G.ei = b1 + 1;
      renderG(); const o = $("pt-guided"); if (o) o.scrollTop = 0;
    }, 120);
  }
  function logG() {
    const a = A(), list = exs(a), ex = list[G.ei]; if (!ex) return;
    const bl = blockAt(list, G.ei); if (bl[1] > bl[0]) { logBlock(a, list, bl[0], bl[1]); return; }
    const s = firstOpen(a, ex); if (s < 0) { if (G.ei < list.length - 1) { G.ei++; renderG(); } return; }
    const k = keyOf(a, ex, s), w = $("pt-g-w"), r = $("pt-g-r"); const vw = w ? w.value : "", vr = r ? r.value : "";
    const iw = document.querySelector(`input.input-set-field[data-key="${k}"][data-field="weight"]`), ir = document.querySelector(`input.input-set-field[data-key="${k}"][data-field="reps"]`), cb = document.querySelector(`.btn-check-set[data-key="${k}"]`);
    if (!iw || !ir || !cb) { a.toast("Use the normal view for this one"); return; }
    iw.value = vw; iw.dispatchEvent(new Event("input", { bubbles: true })); ir.value = vr; ir.dispatchEvent(new Event("input", { bubbles: true }));
    cb.click(); delete G.vals[k];
    setTimeout(() => { const nx = firstOpen(A(), ex); if (nx < 0 && G.ei < list.length - 1) G.ei++; renderG(); }, 120);
  }
  document.addEventListener("click", e => {
    const a = A(); if (!a || !e.target.closest) return; const t = id => e.target.closest("#" + id);
    if (t("pt-guided-go") || t("pt-guided-open")) { openGuided(); return; }
    if (!G.open) return;
    if (t("pt-g-close")) { closeGuided(); return; }
    if (t("pt-g-finish")) { closeGuided(); const f = $("btn-finish-workout"); if (f) f.click(); return; }
    if (t("pt-g-log")) { logG(); return; }
    if (t("pt-g-normal")) { closeGuided(); return; }
    if (t("pt-g-prev")) { G.ei = Math.max(0, G.ei - 1); renderG(); return; }
    if (t("pt-g-addset")) { addSetG(); return; }
    if (t("pt-g-rmset")) { removeSetG(); return; }
    if (t("pt-g-skipset")) { skipExtraG(); return; }
    if (t("pt-g-next")) {
      const list = exs(a), bl = blockAt(list, G.ei);   // leaving an exercise (or a whole superset): unlogged extra sets would only sit there unchecked, so they go
      let gone = false;
      for (let j = bl[0]; j <= bl[1]; j++) { const ex = list[j]; if (ex) { let i = (ex.sets || 0) - 1; while (i >= extraFrom(ex) && i > 0 && !doneSet(a, ex, i)) { if (!dropSet(a, ex, i)) break; gone = true; i--; } } }
      if (gone) { try { a.renderWorkoutView(); } catch (e) { } }
      G.ei = Math.min(list.length - 1, bl[1] + 1); renderG(); return;
    }
    if (t("pt-g-swap")) { const i = G.ei; closeGuided(); a.openExerciseSelector("swap", i); return; }
    const sw = e.target.closest("[data-gx=\"swap\"]");
    if (sw) { const i = parseInt(sw.dataset.ex, 10); if (i >= 0) { closeGuided(); a.openExerciseSelector("swap", i); } return; }
    const st = e.target.closest("[data-gs]");
    if (st) {                                   // a stepper; inside a superset each exercise has its own (data-ex is its place in the day)
      const ix = st.dataset.ex !== undefined ? parseInt(st.dataset.ex, 10) : G.ei, inp = $("pt-g-" + st.dataset.gs + (st.dataset.ex !== undefined ? "-" + st.dataset.ex : "")), d = parseFloat(st.dataset.d) || 0;
      if (inp) { const v = Math.max(0, Math.round((num(inp.value) + d) * 100) / 100); inp.value = v; const ex = exs(a)[ix], s = ex ? firstOpen(a, ex) : -1; if (ex && s >= 0) { const vv = G.vals[keyOf(a, ex, s)]; if (vv) vv[st.dataset.gs] = v; } }
    }
  });
  document.addEventListener("input", e => {
    if (!G.open || !e.target.id || e.target.id.indexOf("pt-g-") !== 0) return;
    const m = /^pt-g-([wr])(?:-(\d+))?$/.exec(e.target.id); if (!m) return;      // pt-g-w / pt-g-r, or pt-g-w-3 (the weight of the 4th exercise in a superset)
    const a = A(), ex = exs(a)[m[2] !== undefined ? +m[2] : G.ei], s = ex ? firstOpen(a, ex) : -1; if (s < 0) return;
    const vv = G.vals[keyOf(a, ex, s)]; if (vv) vv[m[1]] = num(e.target.value);
  });
  PT.openGuided = openGuided; PT.closeGuided = closeGuided;

  /* ============================================================== Settings */
  function drawSettings() {
    const a = A(); if (!a) return; let box = $("pt-feel-set");
    if (!box) { const ref = $("pt-inj-set") || $("pt-sched-set") || $("pt-hiddenex") || $("pt-gym-row") || $("pt-textsize"); if (!ref) return; box = document.createElement("div"); box.id = "pt-feel-set"; box.className = "mt-3"; ref.insertAdjacentElement("afterend", box); }
    box.innerHTML = `<span class="block text-xs font-bold text-zinc-100">Workout feel</span><span class="block text-[11px] text-zinc-400 mb-1.5">Set feedback, PR moments and sound style.</span>
      <div class="flex flex-wrap gap-1.5 mb-1.5">${chip('data-fx="on"', "Set feedback on", fx(a))}${chip('data-fx="off"', "Off", !fx(a))}</div>
      <div class="flex flex-wrap gap-1.5">${chip('data-pack="soft"', "Soft", pack() === "soft")}${chip('data-pack="arcade"', "Arcade", pack() === "arcade")}${chip('data-pack="off"', "Silent", pack() === "off")}<button type="button" class="pt-opt tap-active" id="pt-pack-test">▶ Test</button></div>`;
  }
  const oEx = proto.renderSettingsExtras;
  proto.renderSettingsExtras = async function () { const r = oEx ? await oEx.apply(this, arguments) : undefined; try { drawSettings(); } catch (e) { console.error(e); } return r; };
  document.addEventListener("click", e => {
    const a = A(); if (!a || !e.target.closest) return;
    const f = e.target.closest("[data-fx]"); if (f) { a.settings.fx = f.dataset.fx === "on"; save(); drawSettings(); return; }
    const p = e.target.closest("[data-pack]"); if (p) { a.settings.pack = p.dataset.pack; save(); drawSettings(); try { sound.shortBeep(); setTimeout(() => sound.prSting(), 250); } catch (x) { } return; }
    if (e.target.closest("#pt-pack-test")) { try { patchSound(); sound.shortBeep(); setTimeout(() => sound.completeChime(), 250); setTimeout(() => sound.prSting(), 800); } catch (x) { } }
  });

  /* ============================================================== styles */
  const css = document.createElement("style"); css.id = "pt-v232a-css";
  css.textContent = `
    #floating-rest-timer .w-11 { width: 3.6rem !important; height: 3.6rem !important; }
    #rest-timer-display { font-size: .95rem !important; }
    #rest-timer-subtext { max-width: 10.5rem; line-height: 1.25; }
    #pt-sbar { margin-bottom: .6rem; }
    .pt-sbar-in { background: rgb(var(--z900)); border: 1px solid rgb(var(--z800)); border-radius: .9rem; padding: .55rem .75rem; }
    .pt-sbar-top { display: flex; align-items: center; gap: .6rem; margin-bottom: .4rem; }
    .pt-sbar-t { font-size: .72rem; font-weight: 800; color: #fff; }
    .pt-sbar-x { font-size: .72rem; font-weight: 800; color: rgb(251 191 36); margin-right: auto; font-variant-numeric: tabular-nums; }
    .pt-gbtn { font-size: .72rem; font-weight: 800; padding: .3rem .65rem; border-radius: .6rem; background: rgb(var(--a600)); color: #fff; }
    .pt-pulse { animation: pt-pulse .55s ease-out; }
    @keyframes pt-pulse { 0% { transform: scale(1); box-shadow: 0 0 0 0 rgb(52 211 153 / .7); } 40% { transform: scale(1.25); } 100% { transform: scale(1); box-shadow: 0 0 0 14px rgb(52 211 153 / 0); } }
    .pt-flash { position: fixed; left: 50%; top: calc(env(safe-area-inset-top, 0px) + 4.6rem); transform: translateX(-50%); z-index: 90; padding: .5rem 1rem; border-radius: 9999px; font-size: .85rem; font-weight: 800; color: #052e16; background: #34d399; box-shadow: 0 8px 24px rgb(0 0 0 / .4); pointer-events: none; animation: pt-flash 1.9s ease-out forwards; white-space: nowrap; }
    .pt-flash.same { background: rgb(var(--z700)); color: #fff; }
    @keyframes pt-flash { 0% { opacity: 0; transform: translate(-50%, -10px) scale(.9); } 12% { opacity: 1; transform: translate(-50%, 0) scale(1.05); } 20% { transform: translate(-50%, 0) scale(1); } 80% { opacity: 1; } 100% { opacity: 0; transform: translate(-50%, -6px); } }
    #pt-prbanner { position: fixed; left: 50%; top: 32%; transform: translate(-50%, -50%); z-index: 92; display: flex; flex-direction: column; align-items: center; gap: .15rem; padding: 1.1rem 1.8rem; border-radius: 1.4rem; background: linear-gradient(160deg, #422006, #18181b); border: 1px solid #f59e0b; box-shadow: 0 0 40px rgb(245 158 11 / .55); pointer-events: none; animation: pt-prb 2.3s ease-out forwards; text-align: center; }
    .pt-prmedal { font-size: 3rem; line-height: 1; animation: pt-medalin .6s cubic-bezier(.2,1.5,.4,1) both; }
    .pt-prt { font-size: .7rem; font-weight: 900; letter-spacing: .22em; color: #fbbf24; }
    .pt-prn { font-size: 1.05rem; font-weight: 900; color: #fff; max-width: 14rem; }
    .pt-prv { font-size: .85rem; font-weight: 700; color: #fde68a; }
    @keyframes pt-prb { 0% { opacity: 0; transform: translate(-50%, -40%) scale(.7); } 12% { opacity: 1; transform: translate(-50%, -50%) scale(1.06); } 20% { transform: translate(-50%, -50%) scale(1); } 80% { opacity: 1; } 100% { opacity: 0; transform: translate(-50%, -56%) scale(1); } }
    #pt-guided { position: fixed; inset: 0; z-index: 35; background: rgb(var(--z950)); overflow-y: auto; }
    .pt-g-in { max-width: 32rem; margin: 0 auto; min-height: 100%; display: flex; flex-direction: column; padding: calc(env(safe-area-inset-top, 0px) + .75rem) 1rem 9.5rem; }
    .pt-g-top { display: flex; align-items: center; justify-content: space-between; gap: .5rem; }
    .pt-g-x { width: 2.5rem; height: 2.5rem; border-radius: .75rem; background: rgb(var(--z800)); color: rgb(var(--z50)); font-size: 1.1rem; }
    .pt-g-n { font-size: .72rem; font-weight: 800; color: rgb(var(--z400)); letter-spacing: .06em; text-transform: uppercase; }
    .pt-g-bar { height: .35rem; border-radius: 9999px; background: rgb(var(--z800)); overflow: hidden; margin: .6rem 0; }
    .pt-g-bar span { display: block; height: 100%; background: rgb(var(--a500)); transition: width .3s; }
    .pt-g-body { flex: 1; display: flex; flex-direction: column; gap: .8rem; padding-top: .6rem; }
    .pt-g-title { font-size: 1.7rem; font-weight: 900; color: rgb(var(--z50)); line-height: 1.15; }
    .pt-g-sub { font-size: .8rem; color: rgb(var(--z400)); font-weight: 600; }
    .pt-g-last { font-size: .8rem; color: rgb(var(--a400)); font-weight: 700; }
    .pt-g-chips { display: flex; flex-wrap: wrap; gap: .4rem; }
    .pt-g-chip { padding: .3rem .65rem; border-radius: .6rem; font-size: .72rem; font-weight: 800; background: rgb(var(--z900)); color: rgb(var(--z400)); border: 1px solid rgb(var(--z800)); }
    .pt-g-chip.done { color: rgb(52 211 153); border-color: rgb(52 211 153 / .4); }
    .pt-g-chip.cur { color: rgb(var(--z50)); border-color: rgb(var(--a500)); }
    .pt-g-chip.extra { border-style: dashed; }
    .pt-g-setctl { display: flex; gap: .5rem; }
    .pt-g-setctl button, .pt-g-ghost { padding: .4rem .85rem; border-radius: .7rem; font-size: .78rem; font-weight: 800; background: rgb(var(--z900)); color: rgb(var(--z300)); border: 1px solid rgb(var(--z800)); }
    .pt-g-ghost { margin-top: .75rem; }
    .pt-g-flds { display: grid; grid-template-columns: 1fr; gap: .7rem; }
    .pt-g-fld > span { display: block; font-size: .68rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: rgb(var(--z500)); margin-bottom: .3rem; }
    .pt-g-fld > div { display: flex; align-items: center; gap: .5rem; }
    .pt-g-fld input { flex: 1 1 0; width: 0; min-width: 0; text-align: center; font-size: 2.2rem; font-weight: 900; color: rgb(var(--z50)); background: rgb(var(--z900)); border: 1px solid rgb(var(--z800)); border-radius: 1rem; padding: .5rem; font-variant-numeric: tabular-nums; }
    .pt-g-st { width: 4rem; height: 4rem; border-radius: 1rem; background: rgb(var(--z800)); color: rgb(var(--z50)); font-size: 1.8rem; font-weight: 800; }
    .pt-g-log { width: 100%; padding: 1.1rem; border-radius: 1.1rem; background: rgb(var(--a600)); color: #fff; font-size: 1.1rem; font-weight: 900; margin-top: .4rem; }
    .pt-gb-p { display: flex; flex-direction: column; gap: .3rem; padding: .7rem .75rem .8rem; border-radius: 1rem; background: rgb(var(--z900)); border: 1px solid rgb(var(--z800)); border-left: 3px solid rgb(147 51 234); }
    .pt-gb-h, .pt-gb-o { display: flex; align-items: center; gap: .5rem; }
    .pt-gb-l { flex: none; font-size: .68rem; font-weight: 900; letter-spacing: .04em; padding: .18rem .45rem; border-radius: .45rem; background: rgb(147 51 234); color: #fff; }
    .pt-gb-n { flex: 1 1 auto; min-width: 0; font-size: 1.05rem; font-weight: 900; line-height: 1.2; color: rgb(var(--z50)); overflow-wrap: anywhere; }
    .pt-gb-sw { flex: none; width: 2.2rem; height: 2.2rem; border-radius: .6rem; background: rgb(var(--z800)); font-size: .9rem; }
    .pt-gb-sub { font-size: .74rem; font-weight: 600; color: rgb(var(--z400)); }
    .pt-gb-last { font-size: .74rem; font-weight: 700; color: rgb(var(--a400)); }
    .pt-gb-f { display: grid; grid-template-columns: 1fr 1fr; gap: .6rem; margin-top: .2rem; }
    .pt-gb-fld > span { display: block; font-size: .62rem; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: rgb(var(--z500)); margin-bottom: .25rem; }
    .pt-gb-fld > div { display: flex; align-items: center; gap: .3rem; }
    .pt-gb-fld input { flex: 1 1 0; width: 0; min-width: 0; text-align: center; font-size: 1.45rem; font-weight: 900; color: rgb(var(--z50)); background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); border-radius: .8rem; padding: .35rem .1rem; font-variant-numeric: tabular-nums; }
    .pt-gb-st { flex: none; width: 2.5rem; height: 2.9rem; border-radius: .8rem; background: rgb(var(--z800)); color: rgb(var(--z50)); font-size: 1.4rem; font-weight: 800; }
    .pt-gb-o { padding: .45rem .7rem; border-radius: .8rem; background: rgb(var(--z900)); border: 1px dashed rgb(var(--z800)); opacity: .75; }
    .pt-gb-o .pt-gb-n { font-size: .85rem; font-weight: 800; }
    .pt-gb-o i { flex: none; font-style: normal; font-size: .68rem; font-weight: 700; color: rgb(var(--z400)); text-align: right; max-width: 9rem; }
    .pt-gb-in { padding-bottom: calc(var(--gb-bottom, 4.9rem) + .75rem); }
    .pt-gb-log { position: sticky; bottom: var(--gb-bottom, calc(4.9rem + env(safe-area-inset-bottom, 0px))); z-index: 2; box-shadow: 0 -10px 18px 4px rgb(var(--z950)); }
    .pt-g-nav { position: fixed; left: 0; right: 0; bottom: 0; display: flex; gap: .5rem; max-width: 32rem; margin: 0 auto; padding: .7rem 1rem calc(.7rem + env(safe-area-inset-bottom, 0px)); background: linear-gradient(to top, rgb(var(--z950)) 70%, transparent); z-index: 1; }
    .pt-g-nav button { flex: 1; padding: .8rem; border-radius: .9rem; background: rgb(var(--z800)); color: rgb(var(--z50)); font-size: .8rem; font-weight: 800; }
    .pt-g-nav button:disabled { opacity: .35; }
    body.pt-guided-on #floating-rest-timer { bottom: 4.6rem !important; }
    body.pt-guided-on #finish-bar { display: none !important; }
    @media (prefers-reduced-motion: reduce) { .pt-pulse, .pt-flash, #pt-prbanner, .pt-prmedal { animation: none !important; } }
  `;
  document.head.appendChild(css);
  setTimeout(() => { try { patchSound(); patchRest(A()); } catch (e) { } }, 1200);
})();
  