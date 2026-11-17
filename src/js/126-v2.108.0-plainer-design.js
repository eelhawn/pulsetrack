/* =====================================================================
 * PulseTrack 2.108.0: a plainer, clearer design. The default look loses the stock "generated app" habits:
 *  - No frosted glass: the header, tab bar, Finish bar and the picker's sticky headings are solid (the opt-in "Glass" card look keeps its blur).
 *  - No coloured stripe down the left of cards (reminders, tips, AM/PM sessions, supersets, grouped exercises, picker rows): a plain full border
 *    or a tint does the job, and the label already says what it is.
 *  - No badge above the program name on Home ("ACTIVE ROUTINE"): the day count sits under the name instead.
 *  - The three icon tiles on Home (Build a workout / Empty workout / Cardio & sports) are one plain bar of three buttons, and the program
 *    tools on the Programs screen are plain labels, without emoji boxes.
 *  - Small all-caps tracked labels ("THIS WEEK", "UP NEXT") are in normal case.
 *  - More readable grey text in dark mode: the dimmest greys used for text are lifted to at least 4.5:1 against the background.
 *  - No purple-to-blue gradients (AM/PM badges, the two-sessions note): plain tints.
 *  - Home's cards are evenly spaced (an empty reminder slot no longer doubles the gap).
 *  The headings lost their emojis and the em dashes in the app's text are gone (those were edited where the text lives).
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  const proto = ApplicationUI.prototype;

  // the day count moves under the program name; the "ACTIVE ROUTINE" badge row goes
  function homeCard() {
    const t = document.getElementById("home-program-title"), b = document.getElementById("home-active-day-badge"), chip = document.getElementById("home-chip");
    if (!t || !b || b.dataset.moved) return;
    const row = b.parentElement;
    b.dataset.moved = "1";
    b.className = "block text-xs text-zinc-400 mt-1";
    t.insertAdjacentElement("afterend", b);
    if (chip) chip.hidden = true;
    if (row && row !== t.parentElement && !row.querySelector(":scope > :not([hidden])")) row.hidden = true;
  }
  const oHome = proto.renderHomeView;
  proto.renderHomeView = function () { const r = oHome.apply(this, arguments); try { homeCard(); } catch (e) { console.error("PulseTrack 2.108 home card", e); } return r; };

  const css = document.createElement("style"); css.id = "pt-v2108-css";
  css.textContent = `
    /* no frosted glass (the opt-in Glass card look keeps it) */
    html:not([data-card="glass"]) *, html:not([data-card="glass"]) *::before, html:not([data-card="glass"]) *::after { -webkit-backdrop-filter: none !important; backdrop-filter: none !important; }
    html:not([data-card="glass"]) header.sticky, html:not([data-card="glass"]) #finish-bar, html:not([data-card="glass"]) #ex-list-container .sticky, html:not([data-card="glass"]) .pt-pin-h { background-color: rgb(var(--z900)) !important; }
    html:not([data-card="glass"]) body.pt-tabs #pt-tabbar { background: rgb(var(--z900)) !important; }
    html:not([data-card="glass"]) #days-week-row { background: rgb(var(--z950)) !important; }

    /* no coloured stripe down the left of a card or row */
    html[data-neat="1"] #home-banners [data-banner], #home-banners [data-banner] { box-shadow: none !important; border: 1px solid rgb(var(--a500) / .35) !important; }
    .pt-tip-line, .pt-note-line { border-left: 0 !important; padding-left: 0 !important; }
    #days-list-container > .pt-ses-card { border-left-width: 1px !important; border-left-color: rgb(var(--z800)) !important; }
    [data-ex-card].pt-gfold-head { border-left-color: rgb(var(--z800)) !important; }
    [data-ex-card].border-l-4 { border-left-width: 1px !important; border-left-color: rgb(var(--z800)) !important; }
    #ex-list-container button.border-l-2, .sugg-item.border-l-2 { border-left-color: transparent !important; }

    /* Home: one plain bar of three buttons instead of three icon tiles */
    #view-home #pt-hg-quick { display: flex !important; gap: 0 !important; border: 1px solid rgb(var(--z800)); border-radius: 1rem; background: rgb(var(--z900)); overflow: hidden; }
    #view-home #pt-hg-quick > button { flex: 1 1 0; min-width: 0; min-height: 3rem; margin: 0 !important; padding: .75rem .4rem !important; border: 0 !important; border-radius: 0 !important; background: transparent !important; box-shadow: none !important;
      display: flex !important; flex-direction: row !important; align-items: center !important; justify-content: center !important; text-align: center !important; }
    #view-home #pt-hg-quick > button + button { border-left: 1px solid rgb(var(--z800)) !important; }
    #view-home #pt-hg-quick > button > span:first-child:not(:last-child) { display: none !important; }
    #view-home #pt-hg-quick > button > span:last-child { font-size: .78rem; font-weight: 700; line-height: 1.2; color: rgb(var(--z100)); }
    #view-home #pt-hg-quick > button:active { background: rgb(var(--z800)) !important; }
    /* Programs: the tools are plain labels */
    #view-programs #pt-prog-tools .pgx-ti { display: none !important; }

    /* normal-case labels instead of small tracked capitals */
    html body *:not(input):not(textarea) { text-transform: none !important; }
    .uppercase, .tracking-wide, .tracking-wider, .tracking-widest, #home-streak-card #home-streak-title, #home-up-next .pt-un-top, #side-drawer .pt-dh, .pgx-h, .pgx-lab, .pt-bar-rh, .pt-bp-f span, .pt-bp-wt span, .pt-co-h4, .pt-eyebrow, .pt-f2h, .pt-g-fld > span, .pt-g-n, .pt-gb-fld > span, .pt-grp, .pt-haul-h, .pt-heat-tile span, .pt-lvup-h, .pt-m-tag, .pt-md-f > span, .pt-pickrow small, .pt-pin-h span:first-child, .pt-pl-lab, .pt-pl-sh, .pt-st-count, .pt-stl-h, .pt-tab-phase, .pt-tier, .pt-tile span, .pt-ulabel, .pt-wd .pt-wl { letter-spacing: 0 !important; }
    .pt-eyebrow, .pt-haul-h { font-size: .75rem !important; font-weight: 700 !important; color: rgb(var(--z400)) !important; }

    /* readable greys in dark mode (at least 4.5:1 for small text) */
    .text-zinc-500, .text-zinc-600 { color: color-mix(in srgb, rgb(var(--z500)) 70%, rgb(var(--z400))) !important; }

    /* one solid colour for the Finish button, like Start workout (it was an emerald-to-teal gradient) */
    #finish-bar button.bg-gradient-to-r { background-image: none !important; background-color: rgb(var(--a600)) !important; }

    /* plain tints instead of purple-to-blue gradients */
    .pgx-ap { background: rgb(251 191 36 / .14) !important; }
    html[data-mode="light"] .pgx-ap { background: rgb(251 191 36 / .22) !important; }
    #pt-dbl-note { background: rgb(251 191 36 / .08) !important; }
    html[data-mode="light"] .pgx-ap { color: rgb(146 64 14) !important; }
    /* colours made for a dark page are darkened on the light one so they stay readable */
    html[data-mode="light"] .pt-ltag { color: color-mix(in srgb, var(--tc) 50%, #000) !important; }
    .ex-chip.bg-emerald-500 span { color: rgb(0 0 0 / .72) !important; }

    /* even spacing on Home: an empty slot takes no room */
    #view-home > :empty { display: none !important; }
  `;
  document.head.appendChild(css);
})();
