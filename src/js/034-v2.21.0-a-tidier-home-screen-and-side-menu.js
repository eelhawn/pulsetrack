
/* =====================================================================
 * PulseTrack 2.21.0: a tidier Home screen and side menu.
 *  Home, top to bottom: today's workout, Start training (Build, Empty, Cardio), This week (with the streak and a Calendar link),
 *  Work check-in, Last workout / PRs, Search, then the shortcuts in three labelled groups (Train, Track, Tools), 1RM Trophy Room.
 *  Side menu: the current program first, three quick actions, one short list of pages with the page you are on marked,
 *  gym tools, and the calendar folded away until you open it.
 *  The tiles that other scripts create (1RM, Plate calculator, My Exercises, Cardio & Sports) are moved into their group here.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  const proto = ApplicationUI.prototype;
  const A = () => window.app;
  const $ = id => document.getElementById(id);

  /* ------------------------------------------------------------------ look */
  const css = document.createElement("style");
  css.id = "pt-v221-css";
  css.textContent = `
    #view-home .pt-hg { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .625rem; }
    #view-home .pt-hg > button { min-width: 0; }
    #view-home .pt-hg > button > span:first-child { background: rgb(var(--z800)) !important; border-color: transparent !important; }
    #view-home #pt-build-open { border-color: rgb(var(--a800)); }
    #view-home #pt-build-open > span:first-child { background: rgb(var(--a950)) !important; }
    #pt-week-foot { display: flex; align-items: center; justify-content: space-between; gap: .5rem; padding-top: .6rem; border-top: 1px solid rgb(var(--z800)); font-size: .6875rem; color: rgb(var(--z400)); }
    #pt-week-foot button { flex-shrink: 0; padding: .3rem .65rem; border-radius: .5rem; background: rgb(var(--z800)); color: rgb(var(--z200)); font-weight: 600; }
    #side-drawer .pt-dh { font-size: .625rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: rgb(var(--z400)); }
    #side-drawer .pt-dcard { display: block; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); border-radius: .875rem; padding: .85rem .95rem; }
    #side-drawer #drawer-active-program-card { border-color: rgb(var(--a800)); }
    #side-drawer #drawer-active-program-card > * + * { margin-top: .35rem; }
    #side-drawer .pt-dq { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .3rem; padding: .7rem .3rem; border-radius: .875rem; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); font-size: .6875rem; font-weight: 700; color: rgb(var(--z100)); text-align: center; line-height: 1.15; min-width: 0; }
    #side-drawer .pt-dq-i { font-size: 1.15rem; line-height: 1; }
    #side-drawer .pt-dr { display: flex; align-items: center; gap: .7rem; width: 100%; padding: .38rem .5rem; border-radius: .75rem; border: 1px solid transparent; text-align: left; font-size: .8125rem; font-weight: 600; color: rgb(var(--z100)); }
    #side-drawer .pt-dr:hover, #side-drawer .pt-dr:active { background: rgb(var(--z850)); }
    #side-drawer .pt-dr-i { width: 1.75rem; height: 1.75rem; border-radius: .5rem; background: rgb(var(--z800)); display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0; }
    #side-drawer .pt-dr-l { flex: 1 1 auto; min-width: 0; }
    #side-drawer .pt-dr-c { color: rgb(var(--z500)); font-size: 1.1rem; line-height: 1; }
    #side-drawer .pt-dr[aria-current="page"] { background: rgb(var(--a950)); border-color: rgb(var(--a800)); color: rgb(var(--a300)); }
    #side-drawer .pt-dr[aria-current="page"] .pt-dr-i { background: rgb(var(--a800)); }
    #side-drawer .pt-dcal > summary { display: flex; align-items: center; justify-content: space-between; gap: .5rem; cursor: pointer; list-style: none; padding: .35rem 0; }
    #side-drawer .pt-dcal > summary::-webkit-details-marker { display: none; }
  `;
  document.head.appendChild(css);

  /* ------------------------------------------------------------------ Home: put every tile in its group */
  const put = (id, boxId, beforeId) => {
    const el = $(id), box = $(boxId); if (!el || !box) return;
    const ref = beforeId ? $(beforeId) : null;
    if (el.parentElement === box && (!ref || el.nextElementSibling === ref)) return;
    if (ref && ref.parentElement === box) box.insertBefore(el, ref); else box.appendChild(el);
  };
  function tidyHome() {
    put("tile-cardio", "pt-hg-quick");                       // Build · Empty · Cardio
    put("tile-myex", "pt-hg-train");                         // Programs · Library · My Exercises
    put("tile-rm", "pt-hg-tools", "tile-tabata");            // 1RM · Plates · Tabata
    put("tile-plates", "pt-hg-tools", "tile-tabata");
  }

  /* ------------------------------------------------------------------ Home: This week also carries the streak and a Calendar link */
  function weekFoot() {
    const box = $("home-week"); if (!box || box.classList.contains("hidden") || !box.children.length) return;
    const old = $("pt-week-foot"); if (old) old.remove();
    const title = ($("home-streak-title") || {}).textContent || "", sub = ($("home-monthly-streak") || {}).textContent || "";
    const sm = title.match(/(\d+)-week streak/), am = sub.match(/(\d+) active days? this month/);
    const bits = [];
    if (sm) bits.push("🔥 " + sm[1] + "-week streak");
    if (am) bits.push(am[1] + " active day" + (am[1] === "1" ? "" : "s") + " this month");
    const foot = document.createElement("div");
    foot.id = "pt-week-foot";
    foot.innerHTML = `<span class="min-w-0">${PT.esc(bits.join(" · ") || "Tap a day to see what you did")}</span><button type="button" id="pt-week-cal" class="tap-active">Calendar ›</button>`;
    box.appendChild(foot);
  }
  const oHome = proto.renderHomeView;
  proto.renderHomeView = function () {
    const r = oHome.apply(this, arguments);
    try { tidyHome(); weekFoot(); } catch (e) { console.error("PulseTrack home tidy", e); }
    return r;
  };

  document.addEventListener("click", e => {
    const a = A(); if (!a || !e.target.closest) return;
    if (e.target.closest("#pt-week-cal")) {
      const d = $("pt-drawer-cal"); if (d) d.open = true;
      const b = $("btn-home-open-drawer-cal"); if (b) b.click(); else a.openDrawer();
      return;
    }
    if (e.target.closest("#tile-tabata")) { const b = $("btn-drawer-quick-tabata"); if (b) b.click(); }
  });

  /* ------------------------------------------------------------------ side menu */
  const GREEN = "px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60";
  const GREY = "px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700";
  const oUds = proto.updateDrawerStatus;
  proto.updateDrawerStatus = function () {
    const r = oUds.apply(this, arguments);
    try {
      const b = $("drawer-active-badge"), s = $("drawer-active-subtext");
      if (b && s) {
        if (!this.activeProgram) { b.textContent = "NO PROGRAM"; b.className = GREY; s.textContent = "Tap to choose a program"; }
        else { b.textContent = "ACTIVE"; b.className = GREEN; s.textContent = this.activeDay ? "Tap to continue this workout" : "Tap to pick a day"; }
      }
    } catch (e) { console.error("PulseTrack drawer status", e); }
    return r;
  };
  const oCal = proto.renderCalendar;
  if (typeof oCal === "function") {
    proto.renderCalendar = function () {
      const r = oCal.apply(this, arguments);
      try {
        const s = $("pt-drawer-cal-sum"), l = $("cal-month-year-label"), c = $("cal-month-active-count");
        if (s && l) s.textContent = l.textContent + (c ? " · " + c.textContent : "");
      } catch (e) { }
      return r;
    };
  }
  // the page you are on is marked in the menu
  const oShow = proto.showView;
  proto.showView = function (name) {
    const r = oShow.apply(this, arguments);
    try {
      const cur = name === "days" ? "programs" : name;
      document.querySelectorAll("#side-drawer .pt-dr").forEach(b => { if (b.dataset.nav === cur) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current"); });
    } catch (e) { }
    return r;
  };
})();
  