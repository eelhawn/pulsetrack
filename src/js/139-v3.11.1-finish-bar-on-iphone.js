/* =====================================================================
 * PulseTrack 3.11.1: the Finish Workout bar stays put on an iPhone.
 *  On an iPhone (or iPad) the page does not get shorter when the keyboard opens. A bar fixed to the bottom of the page then sits
 *  behind the keyboard, and as you scroll it slides up with the page and ends up in the middle of the screen. While you type (the
 *  keyboard is up: body.pt-kb, set by module 042) the Finish Workout bar is hidden on iPhone and iPad; it comes back when you tap
 *  Done or tap away. The bottom tab bar already hides while you type. Other phones and computers are unchanged.
 *  html.pt-ios marks an iPhone, iPod or iPad (iPadOS says "Macintosh" but has a touch screen).
 * ===================================================================== */
(function () {
  "use strict";
  const ua = navigator.userAgent || "";
  const ios = /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && (navigator.maxTouchPoints || 0) > 1);
  if (!ios) return;
  document.documentElement.classList.add("pt-ios");
  const css = document.createElement("style"); css.id = "pt-v3111-css";
  css.textContent = `html.pt-ios body.pt-kb #finish-bar { display: none !important; }`;
  document.head.appendChild(css);
})();
