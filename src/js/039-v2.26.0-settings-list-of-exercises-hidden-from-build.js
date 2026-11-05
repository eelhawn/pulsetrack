
/* =====================================================================
 * PulseTrack 2.26.0: Settings list of exercises hidden from "Build me a workout" (with Show again).
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  const proto = ApplicationUI.prototype;
  const A = () => window.app;
  const $ = id => document.getElementById(id);
  function draw() {
    const a = A(); if (!a) return;
    const list = Array.isArray(a.settings.hiddenEx) ? a.settings.hiddenEx : [];
    let box = $("pt-hiddenex");
    if (!list.length) { if (box) box.remove(); return; }
    if (!box) {
      const ref = $("pt-gym-row") || $("pt-textsize"); if (!ref) return;
      box = document.createElement("details");
      box.id = "pt-hiddenex"; box.className = "mt-3 rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2";
      ref.insertAdjacentElement("afterend", box);
      box.addEventListener("click", e => {
        const b = e.target.closest("[data-show]"); if (!b) return;
        PT.showExercise(b.dataset.show, A()); draw();
      });
    }
    const open = box.open;
    box.innerHTML = `<summary class="text-xs font-bold text-zinc-100 cursor-pointer">Hidden exercises (${list.length})</summary>
      <p class="text-[11px] text-zinc-400 mt-1.5">These never come up in Build me a workout.</p>
      <div class="mt-2 space-y-1">${list.map(n => `<div class="flex items-center justify-between gap-2 text-xs text-zinc-200"><span class="min-w-0 truncate">${PT.esc(n)}</span><button type="button" data-show="${PT.esc(n)}" class="shrink-0 px-2.5 py-1 rounded-lg bg-zinc-800 text-emerald-400 font-semibold tap-active">Show again</button></div>`).join("")}</div>`;
    box.open = open;
  }
  const oExtras = proto.renderSettingsExtras;
  proto.renderSettingsExtras = async function () {
    const r = oExtras ? await oExtras.apply(this, arguments) : undefined;
    try { draw(); } catch (e) { console.error("PulseTrack hidden exercises", e); }
    return r;
  };
})();
  