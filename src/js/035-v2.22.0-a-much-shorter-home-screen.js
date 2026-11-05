
/* =====================================================================
 * PulseTrack 2.22.0: a much shorter Home screen.
 *  Home now shows only the daily things: today's workout, Start training (Build, Empty, Cardio), This week and Work today.
 *  Last workout, PRs, Search, the Train / Track / Tools tiles and the Trophy Room are off by default. They are all in the menu
 *  (1RM Calculator and My Exercises were added there) and each one can be switched back on in Settings > Home screen.
 *  Every phone gets the shorter Home once, and a short note says where things went.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  const proto = ApplicationUI.prototype;
  const A = () => window.app;
  const $ = id => document.getElementById(id);

  const css = document.createElement("style");
  css.id = "pt-v222-css";
  css.textContent = `
    /* the workout card: no long description, a text link for Skip */
    #view-home #home-routine #home-program-desc { display: none; }
    #view-home #home-routine #home-up-next { padding: .5rem .75rem; }
    #view-home #home-routine #btn-home-resume { padding-top: .85rem; padding-bottom: .85rem; }
    #view-home #btn-home-skip { background: none; border: 0; padding: .2rem .5rem; width: auto; margin: 0 auto; font-size: .6875rem; font-weight: 600; color: rgb(var(--z400)); text-decoration: underline; }
    #view-home #btn-home-skip:not(.hidden) { display: block; }
    /* Start training: three small buttons in a row */
    #view-home #home-build > h4 { display: none; }
    #view-home #home-build .pt-hg { gap: .5rem; }
    #view-home #home-build .pt-hg > button { flex-direction: row; align-items: center; gap: .5rem; padding: .6rem .55rem; border-radius: .875rem; }
    #view-home #home-build .pt-hg > button > span:first-child { width: 1.75rem; height: 1.75rem; flex-shrink: 0; font-size: .95rem; }
    #view-home #home-build .pt-hg > button > span:last-child { font-size: .6875rem; line-height: 1.15; }
    /* Work today: one row */
    #view-home #home-work { padding-top: .6rem; padding-bottom: .6rem; }
    #view-home #home-work .pt-opt { padding: .5rem .15rem; font-size: .6875rem; line-height: 1.1; display: flex; align-items: center; justify-content: center; min-height: 2.5rem; }
  `;
  document.head.appendChild(css);

  // what the Home tiles used to open, from the menu
  document.addEventListener("click", e => {
    const a = A(); if (!a || !e.target.closest) return;
    const t = e.target.closest("#pt-drawer-1rm, #pt-drawer-myex"); if (!t) return;
    a.closeDrawer();
    const tile = $(t.id === "pt-drawer-1rm" ? "tile-rm" : "tile-myex");
    setTimeout(() => {
      if (tile) tile.click();
      else if (t.id === "pt-drawer-1rm" && PT.openRmCalc) PT.openRmCalc();
    }, 180);
  });

  // one short note after the update, for phones that already have workouts
  const oHome = proto.renderHomeView;
  proto.renderHomeView = function () {
    const r = oHome.apply(this, arguments);
    try {
      const a = this;
      if (a.settings && a.settings.homeNote === 1) {
        a.settings.homeNote = 2;
        try { WorkoutStorage.saveSettings(a.settings); } catch (e) { }
        if ((a.sessions || []).length || a.activeProgram) {
          setTimeout(() => a.toast("Home is shorter now. Programs, History, Progress and the rest are in the menu. Settings > Home screen turns any card back on.", "Open menu", () => a.openDrawer(), 9000), 900);
        }
      }
    } catch (e) { console.error("PulseTrack home note", e); }
    return r;
  };
})();
  