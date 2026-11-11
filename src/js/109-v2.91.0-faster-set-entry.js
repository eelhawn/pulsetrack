/* =====================================================================
 * PulseTrack 2.91.0: faster set entry.
 *  - One-tap log: tap ✓ on a set whose boxes are still empty and it is logged with the grey numbers in the boxes, which are
 *    what you did on that set last time (set 4 with only 3 sets last time uses the last one). A box you typed in keeps your number.
 *    Before, an empty ✓ saved an empty set that counted for nothing. With no last time it works as before.
 *    Warm-up sets only copy a last-time warm-up, cardio rows are left alone. Settings → Workout screen → "One-tap log".
 *  - Quick change buttons: while you type in a weight or reps box, a slim row under that set has −/+ your weight step and −/+ 1 rep,
 *    so going up 5 or down a rep is one tap and the keyboard stays open. Starts from the number in the box (or the grey one).
 *    Settings → Workout screen → "Quick +/− buttons".
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined" || !PT.opt || !PT.WSCREEN_DEFAULTS) return;
  const proto = ApplicationUI.prototype;
  const A = () => window.app;
  const blank = v => v === undefined || v === null || String(v).trim() === "";
  const num = v => { const n = parseFloat(v); return isFinite(n) ? n : NaN; };
  const r2 = n => Math.round(n * 100) / 100;
  Object.assign(PT.WSCREEN_DEFAULTS, { oneTap: true, quickAdj: true });

  function where(a, el) {
    const list = a && a.dom && a.dom.exercisesList; if (!list || !list.contains(el)) return null;
    const card = el.closest("[data-ex-card]"), row = el.closest(".set-row"); if (!card || !row || !a.activeDay) return null;
    const ex = (a.activeDay.exercises || [])[parseInt(card.dataset.exCard, 10)]; if (!ex) return null;
    return { ex, row, s: parseInt(row.dataset.setIndex, 10) || 0, kind: a.exKind(ex) };
  }

  /* ============================================================== one-tap log */
  /** fills the blank boxes of a set from last time; returns what it filled, or null */
  function fillFromLast(a, key, ex, s) {
    const kind = a.exKind(ex); if (kind.cardio) return null;
    const e = a.logs[key] || { completed: false, weight: "", reps: "", tag: "R" };
    if (e.completed || (!blank(e.weight) && !blank(e.reps))) return null;
    const prevs = (a.lastPerf && a.lastPerf[ex.name]) || [];
    let p = prevs[s] || null;
    if (!p && prevs.length && (e.tag || "R") !== "W") p = prevs.filter(x => x && x.tag !== "W").slice(-1)[0] || null;
    if (!p) return null;
    if ((e.tag || "R") === "W" && p.tag !== "W") return null;
    const pw = p.bz && !(num(p.weight) > 0) ? "0" : (blank(p.weight) ? "" : String(p.weight)), pr = blank(p.reps) ? "" : String(p.reps);
    const w = blank(e.weight) ? pw : String(e.weight), r = blank(e.reps) ? pr : String(e.reps);
    if (blank(r) || !(num(r) > 0) || (blank(w) && !kind.bw)) return null;
    const out = { key, w: blank(e.weight) ? w : null, r: blank(e.reps) ? r : null };
    e.weight = w; e.reps = r; a.logs[key] = e;
    try { WorkoutStorage.saveLogs(a.logs); } catch (err) { }
    return out;
  }
  // window, capture: runs before every other ✓ handler (typo check, fill the next set, PRs), so they all see the filled numbers
  window.addEventListener("click", e => {
    try {
      const a = A(); if (!a || !PT.opt("oneTap") || !e.target.closest) return;
      const btn = e.target.closest(".btn-check-set"); if (!btn || btn.dataset.completed === "1") return;
      const w = where(a, btn); if (!w) return;
      const got = fillFromLast(a, btn.dataset.key, w.ex, w.s); if (!got) return;
      const iw = w.row.querySelector('input.input-set-field[data-field="weight"]'), ir = w.row.querySelector('input.input-set-field[data-field="reps"]');
      if (iw && got.w !== null) iw.value = got.w;
      if (ir && got.r !== null) ir.value = got.r;
      const n = a.settings.oneTapTold || 0;
      if (n < 2) {
        a.settings.oneTapTold = n + 1; try { WorkoutStorage.saveSettings(a.settings); } catch (err) { }
        const e2 = a.logs[btn.dataset.key], wt = e2.weight === "0" && w.kind.bw ? "BW" : e2.weight;
        setTimeout(() => { try { a.toast(`Logged last time's numbers: ${wt ? wt + " × " : ""}${e2.reps}. Tap a box to change them.`); } catch (err) { } }, 350);
      }
    } catch (err) { console.error("PulseTrack one-tap log", err); }
  }, true);

  /* ============================================================== quick +/- buttons */
  const stepOf = a => { const s = num(a.increment ? a.increment() : 5); return s > 0 ? s : (a.unit && a.unit() === "kg" ? 2.5 : 5); };
  const valOf = inp => { const v = num(inp.value); if (isFinite(v)) return v; if (/^BW$/i.test(inp.placeholder)) return 0; const p = num(inp.placeholder); return isFinite(p) ? p : 0; };
  function barHtml(a, kind) {
    const st = stepOf(a), s = PT.num(st, st % 1 ? 2 : 0), u = kind.bw ? "+" + a.wLabel() : a.wLabel();
    return `<div class="pt-qa" role="group" aria-label="Change weight and reps">
      <span class="pt-qa-g"><button type="button" data-qa="w" data-d="-1" aria-label="${s} ${u} less">−${s}</button><i>${u}</i><button type="button" data-qa="w" data-d="1" aria-label="${s} ${u} more">+${s}</button></span>
      <span class="pt-qa-g"><button type="button" data-qa="r" data-d="-1" aria-label="One rep less">−1</button><i>reps</i><button type="button" data-qa="r" data-d="1" aria-label="One rep more">+1</button></span>
    </div>`;
  }
  function clearBars(except) { document.querySelectorAll(".pt-qa").forEach(b => { if (b.parentElement !== except) b.remove(); }); }
  document.addEventListener("focusin", e => {
    try {
      const inp = e.target; if (!inp || !inp.matches || !inp.matches("input.input-set-field")) return;
      const a = A(), f = inp.dataset.field;
      if (!a || !PT.opt("quickAdj") || (f !== "weight" && f !== "reps")) { clearBars(null); return; }
      const w = where(a, inp); if (!w || w.kind.cardio) { clearBars(null); return; }
      clearBars(w.row);
      if (!w.row.querySelector(".pt-qa")) {
        const top = w.row.firstElementChild;
        top.insertAdjacentHTML("afterend", barHtml(a, w.kind));
      }
    } catch (err) { console.error("PulseTrack quick buttons", err); }
  });
  document.addEventListener("focusout", e => {
    const row = e.target && e.target.closest && e.target.closest(".set-row"); if (!row || !row.querySelector(".pt-qa")) return;
    setTimeout(() => { const ae = document.activeElement; if (!(ae && row.contains(ae))) { const b = row.querySelector(".pt-qa"); if (b) b.remove(); } }, 0);
  });
  // keep the keyboard up: the buttons never take the focus
  ["pointerdown", "mousedown"].forEach(t => document.addEventListener(t, e => { if (e.target.closest && e.target.closest(".pt-qa")) e.preventDefault(); }));
  function nudge(row, which, d) {
    const a = A(), inp = row.querySelector(`input.input-set-field[data-field="${which === "w" ? "weight" : "reps"}"]`); if (!a || !inp) return null;
    const v = which === "w" ? Math.max(0, r2(valOf(inp) + d * stepOf(a))) : Math.max(0, Math.round(valOf(inp)) + d);
    inp.value = String(v);
    inp.dispatchEvent(new Event("input", { bubbles: true }));
    return v;
  }
  document.addEventListener("click", e => {
    const b = e.target.closest && e.target.closest(".pt-qa button"); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    const row = b.closest(".set-row"); if (!row) return;
    nudge(row, b.dataset.qa, parseInt(b.dataset.d, 10));
    const f = row.querySelector(`input.input-set-field[data-field="${b.dataset.qa === "w" ? "weight" : "reps"}"]`);
    if (f && document.activeElement !== f && document.activeElement && row.contains(document.activeElement) === false) { try { f.focus({ preventScroll: true }); } catch (err) { } }
  });

  /* ============================================================== Settings → Workout screen */
  const SW = (k, on) => `<label class="relative inline-flex items-center cursor-pointer flex-shrink-0"><input type="checkbox" data-opt="${k}" class="sr-only peer" ${on ? "checked" : ""}><div class="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div></label>`;
  const ROW = (k, title, sub) => `<div class="flex items-center justify-between p-3.5 gap-3" data-v291="${k}"><div class="pr-3 min-w-0"><span class="text-xs font-bold text-white block">${title}</span><span class="text-[11px] text-zinc-400 block mt-0.5">${sub}</span></div>${SW(k, PT.opt(k))}</div>`;
  function rows() {
    const box = document.getElementById("pt-wscreen"); if (!box || box.querySelector("[data-v291]")) return;
    const html = ROW("oneTap", "One-tap log", "Tap ✓ on an empty set to log the grey numbers, which are what you did last time. Boxes you typed in keep your numbers.")
      + ROW("quickAdj", "Quick +/− buttons", "While you type a weight or reps, a row under the set has −/+ your weight step and −/+ 1 rep.");
    const after = box.querySelector('[data-opt="autoFill"]'), row = after && after.closest(".flex.items-center.justify-between");
    if (row) row.insertAdjacentHTML("afterend", html); else box.insertAdjacentHTML("beforeend", html);
  }
  let mo = null;
  const oOpen = proto.openSettings;
  proto.openSettings = function () {
    const r = oOpen.apply(this, arguments);
    try {
      rows();
      const box = document.getElementById("pt-wscreen");
      if (box && !mo && window.MutationObserver) { mo = new MutationObserver(() => rows()); mo.observe(box, { childList: true }); }
    } catch (e) { console.error("PulseTrack 2.91 settings", e); }
    return r;
  };

  PT.fastEntry = { fill: (key, ex, s, a) => fillFromLast(a || A(), key, ex, s), nudge };

  const css = document.createElement("style"); css.id = "pt-v291f-css";
  css.textContent = `
    .pt-qa { display: flex; justify-content: flex-end; gap: .5rem; padding: 0 2.75rem .4rem 0; }
    body.pt-lefty .pt-qa { padding: 0 0 .4rem 2.75rem; justify-content: flex-start; }
    .pt-qa-g { display: inline-flex; align-items: center; border-radius: .6rem; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); overflow: hidden; }
    .pt-qa-g i { font-style: normal; font-size: .6rem; font-weight: 700; color: rgb(var(--z500)); padding: 0 .2rem; }
    .pt-qa button { min-width: 2.6rem; height: 2rem; padding: 0 .45rem; font-size: .75rem; font-weight: 800; font-family: ui-monospace, monospace; color: rgb(var(--a300)); }
    .pt-qa button:active { background: rgb(var(--a500) / .2); }
    body.pt-gym #view-workout .pt-qa button { height: 2.6rem; min-width: 3.2rem; font-size: .95rem; }
    body.pt-gym #view-workout .pt-qa { padding-right: 3.6rem; }
    @media (max-width: 360px) { .pt-qa { padding-right: 2.5rem; gap: .35rem; } .pt-qa button { min-width: 2.3rem; } }
  `;
  document.head.appendChild(css);
})();
