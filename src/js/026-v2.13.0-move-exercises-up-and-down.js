
/* =====================================================================
 * PulseTrack 2.13.0: move exercises up and down.
 *  - Every exercise card has an up arrow and a down arrow next to Swap and Delete. Tap one and the exercise changes places with
 *    the one above or below it. The card stays under your thumb, so you can keep tapping to carry it several places.
 *  - A superset (A1/A2) moves as one block, so it can never get split up by accident. To change the order inside a superset,
 *    unlink it, move the exercise, and link it again.
 *  - Sets you already typed or checked off move with their exercise. Nothing else changes.
 *  - It works in every program, including Freestyle. Clear Progress puts the program's original order back.
 * ===================================================================== */
(function () {
  "use strict";
  const proto = ApplicationUI.prototype;

  /** Splits the list into blocks: a single exercise, or a run of exercises linked as a superset. Returns [[first, last], ...]. */
  function blocks(exs) {
    const out = []; let s = 0;
    for (let i = 0; i < exs.length; i++) {
      if (!(exs[i] && exs[i].link) || i === exs.length - 1) { out.push([s, i]); s = i + 1; }
    }
    return out;
  }
  PT.exerciseBlocks = blocks;

  /** Moves the block holding exercise `idx` one place up (dir -1) or down (+1). Returns the exercise's new index, or -1 if it can't move. */
  proto.moveExercise = function (idx, dir) {
    const day = this.activeDay, exs = day && day.exercises;
    if (!Array.isArray(exs) || !(idx >= 0 && idx < exs.length) || (dir !== -1 && dir !== 1)) return -1;
    const B = blocks(exs);
    const bi = B.findIndex(b => idx >= b[0] && idx <= b[1]), ti = bi + dir;
    if (bi < 0 || ti < 0 || ti >= B.length) return -1;
    const me = exs[idx];
    const order = B.slice(); order[bi] = B[ti]; order[ti] = B[bi];
    const next = [];
    order.forEach(b => { const seg = exs.slice(b[0], b[1] + 1); delete seg[seg.length - 1].link; next.push(...seg); });   // the last one of a block is never "linked to next"
    exs.splice(0, exs.length, ...next);                      // same array, new order, so everything that holds on to it stays valid
    WorkoutStorage.setData(this.data);
    return exs.indexOf(me);
  };

  /* ---------------------------------------------------------------------------------------- the arrows */
  const css = document.createElement("style");
  css.id = "pt-m33a-css";
  css.textContent = `
    [data-ex-card] .btn-mv { background: transparent !important; padding: .4rem; color: rgb(var(--z400)); border-radius: .75rem; }
    [data-ex-card] .btn-mv:active:not(:disabled) { background: rgb(var(--z800)) !important; color: rgb(var(--z100)); }
    [data-ex-card] .btn-mv:disabled { opacity: .25; }
    [data-ex-card] .btn-mv svg { width: 1rem; height: 1rem; pointer-events: none; display: block; margin: 0 auto; }
    /* up/down on the first row, swap/delete on the second, so the name and set line keep all their room on small phones */
    [data-ex-card] .pt-actgrid { display: grid !important; grid-template-columns: repeat(2, 2.1rem); gap: .2rem .3rem; align-content: start; justify-items: stretch; }
    [data-ex-card] .pt-actgrid > * { margin: 0 !important; }
    @keyframes pt-moved { 0% { box-shadow: 0 0 0 2px rgb(var(--a500) / .9); } 100% { box-shadow: 0 0 0 2px rgb(var(--a500) / 0); } }
    [data-ex-card].pt-moved { animation: pt-moved .8s ease-out; }
    @media (prefers-reduced-motion: reduce) { [data-ex-card].pt-moved { animation: none; } }
  `;
  document.head.appendChild(css);
  const UP = '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.6" d="M5 15l7-7 7 7"/></svg>';
  const DOWN = '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.6" d="M19 9l-7 7-7-7"/></svg>';

  function drawArrows(app) {
    const list = app.dom && app.dom.exercisesList; if (!list) return;
    const exs = (app.activeDay && app.activeDay.exercises) || [];
    list.querySelectorAll(".btn-mv").forEach(b => b.remove());
    if (exs.length < 2) return;
    const B = blocks(exs);
    list.querySelectorAll(":scope > [data-ex-card]").forEach(card => {
      const i = parseInt(card.getAttribute("data-ex-card"), 10), swap = card.querySelector(".btn-swap-ex");
      if (!(i >= 0 && i < exs.length) || !swap) return;
      const bi = B.findIndex(b => i >= b[0] && i <= b[1]), grouped = bi >= 0 && B[bi][1] > B[bi][0];
      const name = (exs[i].name || "exercise"), what = grouped ? "superset" : name;
      const mk = (cls, dir, svg, dis) => {
        const b = document.createElement("button");
        b.type = "button"; b.className = "btn-mv " + cls + " tap-active"; b.dataset.exindex = String(i); b.dataset.dir = String(dir);
        b.setAttribute("aria-label", `Move ${what} ${dir < 0 ? "up" : "down"}`); b.title = grouped ? `Move this superset ${dir < 0 ? "up" : "down"}` : `Move ${dir < 0 ? "up" : "down"}`;
        b.innerHTML = svg; if (dis) b.disabled = true;
        return b;
      };
      swap.before(mk("btn-mv-up", -1, UP, bi <= 0), mk("btn-mv-down", 1, DOWN, bi >= B.length - 1));
      if (swap.parentElement) swap.parentElement.classList.add("pt-actgrid");
    });
    if (!list.__ptMv) {
      list.__ptMv = true;
      list.addEventListener("click", e => {
        const btn = e.target.closest && e.target.closest(".btn-mv"); if (!btn || btn.disabled) return;
        const a = window.app; if (!a || a.animating) return;
        const i = parseInt(btn.dataset.exindex, 10), dir = parseInt(btn.dataset.dir, 10);
        const card = btn.closest("[data-ex-card]"), before = card ? card.getBoundingClientRect().top : null;
        const ni = a.moveExercise(i, dir); if (ni < 0) return;
        a.renderWorkoutView();
        const el = a.dom.exercisesList.querySelector(`:scope > [data-ex-card="${ni}"]`);
        if (el) {
          if (before !== null) { const d = el.getBoundingClientRect().top - before; if (d) window.scrollBy({ top: d, left: 0, behavior: "instant" }); }   // keep it under your thumb
          const exs2 = a.activeDay.exercises, bl = blocks(exs2), b2 = bl.find(b => ni >= b[0] && ni <= b[1]) || [ni, ni];
          for (let k = b2[0]; k <= b2[1]; k++) { const c = a.dom.exercisesList.querySelector(`:scope > [data-ex-card="${k}"]`); if (c) c.classList.add("pt-moved"); }
        }
      });
    }
  }
  const oRender = proto.renderWorkoutView;
  proto.renderWorkoutView = function () {
    const r = oRender.apply(this, arguments);
    try { drawArrows(this); } catch (e) { console.error("PulseTrack 2.13.0 move arrows", e); }
    return r;
  };
})();
  