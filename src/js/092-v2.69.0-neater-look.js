/* =====================================================================
 * PulseTrack 2.69.0: the Neater look (the styles are in css/11-pt-neat.css, the switch is in 009's Appearance block).
 *  - A long program description on the day list shows two lines with a small More button, so the days start higher.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined") return;
  const $ = id => document.getElementById(id);
  let timer = 0;
  function tidyDesc() {
    const p = $("days-view-program-desc"); if (!p) return;
    let b = $("pt-desc-more");
    if (!b) {
      b = document.createElement("button"); b.type = "button"; b.id = "pt-desc-more"; b.className = "tap-active"; b.hidden = true;
      p.insertAdjacentElement("afterend", b);
      b.addEventListener("click", () => { const open = p.classList.toggle("pt-open"); b.textContent = open ? "Less ▴" : "More ▾"; });
    }
    p.classList.remove("pt-open"); b.textContent = "More ▾";
    b.hidden = !(p.scrollHeight > p.clientHeight + 2);        // a short description needs no button
  }
  const later = () => { clearTimeout(timer); timer = setTimeout(tidyDesc, 30); };
  const proto = ApplicationUI.prototype, orig = proto.showView;
  if (typeof orig === "function") proto.showView = function (name) { const r = orig.apply(this, arguments); if (name === "days") later(); return r; };
  const p = $("days-view-program-desc");
  if (p && window.MutationObserver) new MutationObserver(later).observe(p, { childList: true, characterData: true, subtree: true });
})();
