
/* =====================================================================
 * PulseTrack 2.29.1: tidier buttons.
 *  - Workout screen: Share day, Copy day, Skip day and Clear progress move behind one "⋯ More" button.
 *  - Programs screen: Build me a program on top, then a neat 2 x 2 grid (Create, Paste, Import, Stretch).
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  const proto = ApplicationUI.prototype;
  const A = () => window.app;
  const $ = id => document.getElementById(id);

  const css = document.createElement("style");
  css.id = "pt-v2291-css";
  css.textContent = `
    #pt-wk-actions { flex-direction: row !important; align-items: center; }
    #pt-wk-actions > button:not(#pt-wk-more) { display: none !important; }
    [data-ex-card] .btn-add-set, [data-ex-card] .btn-remove-set, [data-ex-card] .pt-drop { white-space: nowrap; display: inline-flex; align-items: center; gap: .25rem; }
    #pt-wk-more { font-size: .8rem; font-weight: 700; padding: .5rem .85rem; border-radius: .65rem; background: rgb(var(--z800)); color: rgb(var(--z100)); border: 1px solid rgb(var(--z700)); white-space: nowrap; }
    .pt-morerow { display: flex; align-items: center; gap: .75rem; width: 100%; padding: .8rem .9rem; border-radius: .85rem; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); font-size: .85rem; font-weight: 600; color: rgb(var(--z100)); text-align: left; }
    .pt-morerow.danger { color: rgb(251 113 133); }
    .pt-morerow span:first-child { width: 1.5rem; text-align: center; }
    #pt-prog-tools { display: grid !important; grid-template-columns: 1fr 1fr; gap: .5rem; }
    #pt-prog-tools > button { margin: 0 !important; width: 100% !important; min-height: 3rem; padding: .65rem .5rem !important; border-radius: .85rem !important; font-size: .78rem !important; font-weight: 700 !important; line-height: 1.2; background: rgb(var(--z900)) !important; border: 1px solid rgb(var(--z800)) !important; color: rgb(var(--z100)) !important; box-shadow: none !important; display: flex; align-items: center; justify-content: center; gap: .35rem; text-align: center; }
    #pt-prog-tools > #pt-prog-build { grid-column: 1 / -1; min-height: 3.4rem; background: rgb(var(--a600)) !important; border-color: transparent !important; color: #fff !important; font-size: .9rem !important; }
    #pt-prog-tools > #pt-prog-stretch { grid-column: auto !important; }
    #pt-prog-tools > button span { display: inline; }
  `;
  document.head.appendChild(css);

  /* ---------------------------------------------------------- workout: one More button */
  function ensureMore() {
    const box = $("pt-wk-actions"); if (!box) return;
    let b = $("pt-wk-more");
    if (!b) { b = document.createElement("button"); b.type = "button"; b.id = "pt-wk-more"; b.className = "tap-active"; b.textContent = "⋯ More"; b.setAttribute("aria-label", "More actions"); }
    if (b.parentElement !== box || box.lastElementChild !== b) box.appendChild(b);
  }
  function openMore() {
    const a = A(), K = PT.kit, el = K.sheet("pt-wkmore", 50);
    const rows = [["pt-guided-open", "🎯", "Guided mode", ""], ["btn-share-day", "📤", "Share day", ""], ["btn-copy-day", "📑", "Copy day", ""], ["pt-steal-day", "🧩", "Steal this day…", ""], ["pt-clips-open", "🎥", "Form clips", ""], ["pt-fuel-open", "🍌", "Pre-workout protocol", ""], ["btn-skip-day", "⏭", "Skip day", ""], ["btn-reset-day-progress", "🧹", "Clear progress", "danger"]]
      .filter(r => { const e = $(r[0]); return e && !e.classList.contains("hidden"); });
    const c = K.openSheet(el, `${K.head("Workout options", (a.activeDay && a.activeDay.title) || "")}
      <div class="space-y-2">${rows.map(r => `<button type="button" class="pt-morerow ${r[3]}" data-real="${r[0]}"><span>${r[1]}</span><span>${r[2]}</span></button>`).join("")}</div>`);
    c.addEventListener("click", ev => {
      const b = ev.target.closest("[data-real]"); if (!b) return;
      K.closeSheet(el);
      const real = $(b.dataset.real); if (real) setTimeout(() => real.click(), 120);
    });
  }
  document.addEventListener("click", e => { if (e.target.closest && e.target.closest("#pt-wk-more")) openMore(); });

  const oRW = proto.renderWorkoutView;
  proto.renderWorkoutView = function () {
    const r = oRW.apply(this, arguments);
    try { ensureMore(); } catch (e) { console.error("PulseTrack more button", e); }
    return r;
  };

  /* ---------------------------------------------------------- programs: tidy grid */
  function tidyPrograms() {
    const box = $("pt-prog-tools"); if (!box) return;
    const create = $("btn-create-program"), imp = $("btn-import-program");
    const order = [$("pt-prog-build"), create, $("pt-prog-paste"), imp, $("pt-prog-mob"), $("pt-prog-stretch")];
    if (create && !create.dataset.t) { create.dataset.t = "1"; create.innerHTML = "<span>＋ Create your own</span>"; }
    if (imp && !imp.dataset.t) { imp.dataset.t = "1"; imp.innerHTML = "<span>⤓ Import a file</span>"; }
    order.forEach(b => { if (b && b.parentElement !== box) box.appendChild(b); });
    order.forEach(b => { if (b) box.appendChild(b); });      // settle the order
  }
  const oRP = proto.renderProgramsView;
  proto.renderProgramsView = function () {
    const r = oRP.apply(this, arguments);
    try { tidyPrograms(); } catch (e) { console.error("PulseTrack programs tidy", e); }
    return r;
  };
})();
  