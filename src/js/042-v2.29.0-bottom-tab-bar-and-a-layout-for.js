
/* =====================================================================
 * PulseTrack 2.29.0: bottom tab bar, and a layout for landscape and tablets. (2.54.0: the Workout tab opens the Programs page.)
 *  - Home / Workout / History / Progress along the bottom of the screen (the ☰ menu stays at the top). Hidden while you type.
 *  - Wide screens and landscape phones: the bar becomes a rail down the left side, the page gets wider, and on a big tablet the
 *    exercise cards and Home cards sit in two columns.
 *  - Settings → Bottom tab bar turns it off.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  const proto = ApplicationUI.prototype;
  const A = () => window.app;
  const $ = id => document.getElementById(id);
  const save = () => { try { WorkoutStorage.saveSettings(A().settings); } catch (e) { } };
  const on = () => !(A() && A().settings && A().settings.tabBar === false);

  const TABS = [
    { id: "home", label: "Home", svg: '<path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10"/>' },
    { id: "workout", label: "Workout", svg: '<path d="M3 9v6M6 6v12M18 6v12M21 9v6M6 12h12"/>' },
    { id: "history", label: "History", svg: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>' },
    { id: "progress", label: "Progress", svg: '<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>' }
  ];
  const GROUP = { home: "home", workout: "workout", days: "workout", programs: "workout", library: "workout", cardio: "workout", history: "history", progress: "progress" };

  const css = document.createElement("style");
  css.id = "pt-v229-css";
  css.textContent = `
    #pt-tabbar { display: none; }
    #btn-copy-day { font-size: .75rem; font-weight: 700; padding: .4rem .7rem; border-radius: .5rem; background: rgb(var(--z800)); color: rgb(var(--z100)); border: 1px solid rgb(var(--z700)); white-space: nowrap; }
    body.pt-tabs #pt-tabbar { display: flex; position: fixed; left: 0; right: 0; bottom: 0; z-index: 30; height: calc(3.5rem + env(safe-area-inset-bottom, 0px)); padding-bottom: env(safe-area-inset-bottom, 0px); background: rgb(var(--z900) / .96); backdrop-filter: blur(10px); border-top: 1px solid rgb(var(--z800)); }
    #pt-tabbar button { flex: 1 1 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .15rem; font-size: .625rem; font-weight: 700; color: rgb(var(--z400)); min-width: 0; }
    #pt-tabbar button svg { width: 1.35rem; height: 1.35rem; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; pointer-events: none; }
    #pt-tabbar button[aria-current="page"] { color: rgb(var(--a400)); }
    body.pt-tabs main { padding-bottom: calc(9.5rem + env(safe-area-inset-bottom, 0px)); }
    body.pt-tabs #finish-bar { bottom: calc(3.5rem + env(safe-area-inset-bottom, 0px)) !important; }
    body.pt-tabs #floating-rest-timer { bottom: calc(4.5rem + env(safe-area-inset-bottom, 0px)) !important; }
    body.pt-tabs:has(#finish-bar:not(.hidden)) #floating-rest-timer { bottom: calc(9rem + env(safe-area-inset-bottom, 0px)) !important; }
    body.pt-tabs.pt-kb #pt-tabbar { display: none; }
    body.pt-tabs.pt-kb #finish-bar { bottom: env(safe-area-inset-bottom, 0px) !important; }
    body.pt-tabs.pt-kb:has(#finish-bar:not(.hidden)) #floating-rest-timer, body.pt-tabs.pt-kb #floating-rest-timer { bottom: 5.5rem !important; }
    /* wide screens and landscape phones: a rail on the left */
    @media (min-width: 768px), (orientation: landscape) and (max-height: 520px) {
      body.pt-tabs { padding-left: 4.25rem; }
      body.pt-tabs > header { margin-left: -4.25rem; padding-left: 5.25rem; }
      body.pt-tabs #pt-tabbar { left: 0; right: auto; top: var(--pt-hdr, 3.6rem); bottom: 0; width: 4.25rem; height: auto; flex-direction: column; justify-content: flex-start; gap: .25rem; padding: .5rem 0; border-top: 0; border-right: 1px solid rgb(var(--z800)); }
      body.pt-tabs #pt-tabbar button { flex: 0 0 auto; height: 3.75rem; }
      body.pt-tabs main { padding-bottom: 8rem; }
      body.pt-tabs #finish-bar { bottom: env(safe-area-inset-bottom, 0px) !important; left: 4.25rem; }
      body.pt-tabs #floating-rest-timer { bottom: 1rem !important; }
      body.pt-tabs:has(#finish-bar:not(.hidden)) #floating-rest-timer { bottom: calc(5.75rem + env(safe-area-inset-bottom, 0px)) !important; }
      body.pt-tabs.pt-kb #pt-tabbar { display: flex; }
      main.max-w-xl, header > .max-w-xl, #finish-bar > .max-w-xl { max-width: 44rem; }
      #floating-rest-timer { max-width: 44rem; }
    }
    @media (min-width: 1024px) {
      main.max-w-xl, header > .max-w-xl, #finish-bar > .max-w-xl { max-width: 64rem; }
      #floating-rest-timer { max-width: 40rem; }
      #exercises-list-container { display: block; column-count: 2; column-gap: 1rem; }
      #exercises-list-container > * { break-inside: avoid; margin: 0 0 1rem !important; }
      #view-home:not(.hidden) { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; align-items: start; }
      #view-home > * { margin: 0 !important; }
      #view-home > #pt-home-extra, #view-home > #home-banners { grid-column: 1 / -1; }
      #pt-pg-extra { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; align-items: start; }
      #progress-body { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; align-items: start; }
      #progress-body > * { margin: 0 !important; }
      #progress-body > #pt-pg-extra { grid-column: 1 / -1; }
    }
  `;
  document.head.appendChild(css);

  function build() {
    if ($("pt-tabbar")) return;
    const nav = document.createElement("nav");
    nav.id = "pt-tabbar"; nav.setAttribute("aria-label", "Main");
    nav.innerHTML = TABS.map(t => `<button type="button" data-tab="${t.id}" aria-label="${t.label}"><svg viewBox="0 0 24 24" aria-hidden="true">${t.svg}</svg><span>${t.label}</span></button>`).join("");
    document.body.appendChild(nav);
  }
  function apply() {
    build();
    document.body.classList.toggle("pt-tabs", on());
    const h = document.querySelector("header"); if (h) document.documentElement.style.setProperty("--pt-hdr", h.offsetHeight + "px");
    mark();
  }
  function current() {
    const ids = ["home", "programs", "days", "workout", "library", "history", "progress", "body", "cardio"];
    const v = ids.find(n => { const e = $("view-" + n); return e && !e.classList.contains("hidden"); });
    return v || "home";
  }
  function mark(name) {
    const g = GROUP[name || current()] || "";
    document.querySelectorAll("#pt-tabbar button").forEach(b => { if (b.dataset.tab === g) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current"); });
  }
  const oShow = proto.showView;
  proto.showView = function (name) {
    const r = oShow.apply(this, arguments);
    try { mark(name === "empty" ? "workout" : name); } catch (e) { }
    return r;
  };

  function go(tab) {
    const a = A(); if (!a) return;
    if (tab === "home") a.showView("home");
    else if (tab === "history") a.showView("history");
    else if (tab === "progress") a.showView("progress");
    else {
      /* the Workout tab opens the page with all the programs. Coming from another tab with a workout running it opens that workout instead, and tapping
         the tab you are already on (the workout, the day list, the library...) goes up to the programs page. */
      const p = a.activeProgram, here = GROUP[current()] === "workout";
      if (!here && p && a.activeDay && (a.sessionStartTime || p.id === FREESTYLE_ID)) a.showView("workout");
      else a.showView("programs");
    }
    window.scrollTo(0, 0);
  }
  document.addEventListener("click", e => { const b = e.target.closest && e.target.closest("#pt-tabbar button"); if (b) go(b.dataset.tab); });

  // hide the bar while a keyboard is up
  const typing = el => el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) && !/^(checkbox|radio|button|range)$/.test(el.type || "");
  document.addEventListener("focusin", e => { if (typing(e.target)) document.body.classList.add("pt-kb"); });
  document.addEventListener("focusout", () => setTimeout(() => { if (!typing(document.activeElement)) document.body.classList.remove("pt-kb"); }, 60));
  window.addEventListener("resize", () => { try { apply(); } catch (e) { } });

  // Settings switch
  const oEx = proto.renderSettingsExtras;
  proto.renderSettingsExtras = async function () {
    const r = oEx ? await oEx.apply(this, arguments) : undefined;
    try {
      if (!$("pt-tabs-row")) {
        const ref = $("pt-gym-row") || $("pt-textsize");
        if (ref) {
          const row = document.createElement("label");
          row.id = "pt-tabs-row"; row.className = "flex items-center justify-between gap-3 mt-3 cursor-pointer";
          row.innerHTML = '<span><span class="block text-xs font-bold text-zinc-100">Bottom tab bar</span><span class="block text-[11px] text-zinc-400">Home, Workout, History and Progress along the bottom. A side rail on tablets and in landscape.</span></span><input type="checkbox" id="setting-toggle-tabs" class="w-5 h-5 accent-emerald-500">';
          ref.insertAdjacentElement("afterend", row);
          row.querySelector("input").addEventListener("change", ev => { A().settings.tabBar = ev.target.checked; save(); apply(); });
        }
      }
      const t = $("setting-toggle-tabs"); if (t) t.checked = on();
    } catch (e) { console.error("PulseTrack tabs setting", e); }
    return r;
  };

  const start = () => { try { apply(); } catch (e) { console.error("PulseTrack tab bar", e); } };
  if (window.app) start(); else setTimeout(start, 400);
  setTimeout(start, 1200);
})();
  