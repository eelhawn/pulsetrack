/* =====================================================================
 * PulseTrack 3.13.0: stars on the program screen and Home, and the rest timer on an iPhone.
 *  - A program's own screen (its list of days) has a star next to Reset All Days, the same star as in the Programs list (057).
 *  - Home shows "Starred plans" under the current program when you have starred any: tap one to open it.
 *  - iPhone and iPad: while you type a set (the keyboard is up), the floating rest timer would slide up the screen like the Finish bar
 *    did (3.11.1). It hides then, and the countdown shows on the exercise card you are typing in instead, which moves with the page.
 *  (The moving drawings and machine names of 3.13.0 are in modules 134, 137 and 138.)
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined" || !PT.progList) return;
  const proto = ApplicationUI.prototype, A = () => window.app, $ = id => document.getElementById(id), esc = s => PT.esc(s);
  const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.4l2.65 5.45 5.95.82-4.33 4.12 1.06 5.92L12 16.9l-5.33 2.81 1.06-5.92L3.4 9.67l5.95-.82z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';
  const starred = () => { const a = A(), v = a && a.settings && a.settings.starredPrograms; return Array.isArray(v) ? v : []; };

  /* ================================================================ the star on a program's screen */
  function dayStar() {
    const a = A(), p = a && a.activeProgram, reset = $("btn-reset-program"); if (!p || !reset) return;
    let b = $("pt-days-star");
    if (!b) {
      const wrap = document.createElement("div"); wrap.className = "pt-days-acts";
      reset.parentNode.insertBefore(wrap, reset);
      b = document.createElement("button"); b.type = "button"; b.id = "pt-days-star"; b.className = "pgx-star pt-days-star tap-active";
      wrap.appendChild(b); wrap.appendChild(reset);
    }
    const on = starred().includes(p.id);
    b.dataset.pid = p.id; b.setAttribute("aria-pressed", String(on)); b.setAttribute("aria-label", (on ? "Remove star from " : "Star ") + p.title); b.innerHTML = STAR;
  }
  const oDays = proto.renderDaysView;
  proto.renderDaysView = function () { const r = oDays.apply(this, arguments); try { dayStar(); } catch (e) { console.error("PulseTrack star", e); } return r; };

  /* ================================================================ Home: starred plans */
  function homeStars() {
    const a = A(), host = $("home-routine"); if (!a || !host) return;
    let box = $("pt-home-stars");
    const ps = starred().map(id => (a.data.programs || []).find(p => p && p.id === id)).filter(Boolean);
    if (!ps.length) { if (box) box.remove(); return; }
    if (!box) { box = document.createElement("section"); box.id = "pt-home-stars"; box.className = "pt-hstars"; box.setAttribute("aria-label", "Starred plans"); host.insertAdjacentElement("afterend", box); }
    try { box.style.order = host.style.order || getComputedStyle(host).order; } catch (e) { }   // Home lays its cards out by order (flex): right under the program
    const sub = p => {
      const cur = PT.isCurrentProgram && PT.isCurrentProgram(p.id), n = (p.days || []).length;
      let next = null; try { next = cur && a.nextDayOf ? a.nextDayOf(p) : null; } catch (e) { }
      return (cur ? "Current · " : "") + (next ? `Up next: Day ${next.dayNumber}` : `${n} day${n === 1 ? "" : "s"}`);
    };
    box.innerHTML = `<div class="pt-hstars-h"><span>Starred plans</span><button type="button" class="pt-hstars-all tap-active" data-hs-all="1">All programs</button></div>
      <div class="pt-hstars-l">${ps.map(p => `<button type="button" class="pt-hstar tap-active" data-hs="${esc(p.id)}" aria-label="Open ${esc(p.title)}">
        <span class="pt-hstar-ic">${STAR}</span><span class="pt-hstar-t"><b>${esc(p.title)}</b><span>${esc(sub(p))}</span></span><span class="pt-chev" aria-hidden="true">›</span></button>`).join("")}</div>`;
  }
  const oHome = proto.renderHomeView;
  proto.renderHomeView = function () { const r = oHome.apply(this, arguments); try { homeStars(); } catch (e) { console.error("PulseTrack home stars", e); } return r; };

  document.addEventListener("click", e => {
    const t = e.target.closest && e.target.closest("#pt-days-star, #pt-home-stars [data-hs], #pt-home-stars [data-hs-all]"); if (!t) return;
    const a = A(); if (!a) return;
    if (t.id === "pt-days-star") {
      const on = PT.progList.star(t.dataset.pid); dayStar(); a.toast(on ? "Starred" : "Star removed");
      const nb = $("pt-days-star"); if (nb) nb.focus({ preventScroll: true });
    } else if (t.dataset.hsAll) a.showView("programs");
    else PT.progList.open(t.dataset.hs);
  });

  /* ================================================================ iPhone: the rest timer while you type */
  const isIOS = () => document.documentElement.classList.contains("pt-ios");
  const timerUp = () => { const t = $("floating-rest-timer"); return !!t && t.classList.contains("translate-y-0") && !t.classList.contains("opacity-0"); };
  function restChip() {
    const act = document.activeElement, card = act && act.closest ? act.closest("[data-ex-card]") : null;
    let c = $("pt-rest-inline");
    if (!(isIOS() && document.body.classList.contains("pt-kb") && timerUp() && card)) { if (c) c.remove(); return; }
    if (!c || c.parentNode !== card) { if (c) c.remove(); c = document.createElement("div"); c.id = "pt-rest-inline"; c.className = "pt-rest-inline"; c.setAttribute("role", "timer"); c.setAttribute("aria-live", "off"); card.appendChild(c); }
    const d = (($("rest-timer-display") || {}).textContent || "").trim(), sub = (($("rest-timer-subtext") || {}).textContent || "").trim();
    c.innerHTML = `<span class="pt-ri-dot" aria-hidden="true"></span><span>Rest <b>${esc(d)}</b></span>${sub ? `<span class="pt-ri-sub">${esc(sub)}</span>` : ""}`;
  }
  let pend = 0;
  const soon = () => { clearTimeout(pend); pend = setTimeout(restChip, 90); };   // after module 042 has set or cleared pt-kb
  document.addEventListener("focusin", soon); document.addEventListener("focusout", soon);
  function watch() {
    const d = $("rest-timer-display"), t = $("floating-rest-timer");
    if (d) new MutationObserver(() => { if ($("pt-rest-inline") || (isIOS() && document.body.classList.contains("pt-kb"))) restChip(); }).observe(d, { childList: true, characterData: true, subtree: true });
    if (t) new MutationObserver(soon).observe(t, { attributes: true, attributeFilter: ["class"] });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", watch); else watch();

  const css = document.createElement("style"); css.id = "pt-v3130-css";
  css.textContent = `
    .pt-days-acts { display: flex; align-items: center; gap: .375rem; flex: none; }
    .pt-days-star { width: 2.25rem; height: 2.25rem; margin-right: 0; }
    .pt-hstars { background: rgb(var(--z900)); border: 1px solid rgb(var(--z800)); border-radius: 1rem; padding: .75rem .875rem; }
    .pt-hstars-h { display: flex; align-items: center; justify-content: space-between; gap: .5rem; font-size: .8125rem; font-weight: 700; color: rgb(var(--z100)); }
    .pt-hstars-all { font-size: .75rem; font-weight: 600; color: rgb(var(--z300)); padding: .5rem .25rem; min-height: 2.25rem; }
    .pt-hstars-l { display: flex; flex-direction: column; margin-top: .25rem; }
    .pt-hstar { display: flex; align-items: center; gap: .65rem; width: 100%; text-align: left; padding: .55rem 0; min-height: 2.75rem; border-top: 1px solid rgb(var(--z800)); }
    .pt-hstar:first-child { border-top: 0; }
    .pt-hstar-ic { flex: none; width: 1.1rem; height: 1.1rem; color: #f5b301; }
    html[data-mode="light"] .pt-hstar-ic { color: #c47f00; }
    .pt-hstar-ic svg { width: 100%; height: 100%; fill: currentColor; }
    .pt-hstar-t { flex: 1; min-width: 0; display: flex; flex-direction: column; }
    .pt-hstar-t b { font-size: .8125rem; color: rgb(var(--z100)); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .pt-hstar-t span { font-size: .6875rem; color: rgb(var(--z400)); }
    html.pt-ios body.pt-kb #floating-rest-timer { display: none !important; }
    [data-ex-card] { position: relative; }
    .pt-rest-inline { position: absolute; top: -.8rem; left: 50%; transform: translateX(-50%); z-index: 3; display: inline-flex; align-items: center; gap: .4rem; white-space: nowrap;
      padding: .25rem .7rem; border-radius: 999px; background: rgb(var(--z900)); border: 1px solid rgb(var(--a600)); color: rgb(var(--z100)); font-size: .75rem; box-shadow: 0 2px 8px rgb(0 0 0 / .35); }
    .pt-rest-inline b { font-variant-numeric: tabular-nums; }
    .pt-ri-dot { width: .45rem; height: .45rem; border-radius: 999px; background: rgb(var(--a500)); }
    .pt-ri-sub { color: rgb(var(--z400)); }
  `;
  document.head.appendChild(css);
  PT.homeStars = homeStars;
})();
