
/* =====================================================================
 * PulseTrack 2.50.1: reopen where you left off.
 * When the phone closes the app (screen off for a while, low memory, a swipe away) the workout timer and your sets were already safe,
 * but the app itself started again on Home and you had to find your workout again. Now the screen you were on is remembered, with
 * how far down you had scrolled, and the app opens straight back on it:
 *   - a workout (or the list of days, or any other page): for 12 hours while you are in a workout, 3 hours for the other pages;
 *     after that it opens on Home like a fresh start.
 *   - if you had just finished a workout (the summary was up), it opens on Home.
 *   - it only goes back to a workout if it is still the same program and day, so it never shows you somebody else's workout.
 * Settings -> Reopen where I left off switches it off.
 * The note is kept under "pt_resume_v1" (not a pulsetrack_ key on purpose: it is scratch, so it is not part of backups).
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined") return;
  const proto = ApplicationUI.prototype, KEY = "pt_resume_v1", HR = 3600000;
  const VIEWS = ["home", "programs", "days", "workout", "library", "history", "progress", "body", "cardio"];
  const $ = id => document.getElementById(id);
  const A = () => window.app;
  const free = () => (typeof FREESTYLE_ID !== "undefined" ? FREESTYLE_ID : "freestyle");
  const on = () => { const a = A(); return !(a && a.settings && a.settings.resumeView === false); };
  const read = () => { try { const o = JSON.parse(localStorage.getItem(KEY)); return o && typeof o === "object" ? o : null; } catch (e) { return null; } };
  const write = o => { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { } };
  const current = () => VIEWS.find(n => { const e = $("view-" + n); return e && !e.classList.contains("hidden"); }) || "home";
  const scrollY = () => Math.round(window.pageYOffset || document.documentElement.scrollTop || 0);

  let armed = false;                       // recording starts once the restore has run, so Home at start-up never overwrites the note
  function snap(y) {
    if (!armed || !on()) return;
    const a = A(); if (!a) return;
    let v = current();
    const sum = $("modal-workout-summary");
    if (v === "workout" && sum && !sum.classList.contains("hidden")) v = "home";      // just finished: nothing to go back to
    write({ v, y: v === "home" ? 0 : (typeof y === "number" ? y : scrollY()), t: Date.now(), p: a.activeProgram ? a.activeProgram.id : null, d: a.activeDay ? a.activeDay.dayNumber : null });
  }

  /** the screen to open on, or null for Home */
  function target(a) {
    const o = read(); if (!o || !on()) return null;
    const v = VIEWS.includes(o.v) ? o.v : "home";
    if (v === "home") return null;
    const age = Date.now() - (+o.t || 0);
    if (!(age >= 0) || age > (v === "workout" ? 12 * HR : 3 * HR)) return null;
    if (v === "workout" || v === "days") {
      const p = a.activeProgram, d = a.activeDay;
      if (!p || p.id !== o.p) return null;
      if (v === "workout" && (!d || d.dayNumber !== o.d)) return null;
      if (v === "workout" && !(d.exercises || []).length && p.id !== free()) return null;
    }
    return { v, y: Math.max(0, +o.y || 0) };
  }

  function boot() {
    const a = A();
    let t = null;
    try {
      t = a && target(a);
      if (t) {
        a.showView(t.v);
        if (t.y > 0) {                                                  // showView scrolls to the top gently; put it back, unless you have already started scrolling
          let stop = false;
          const off = () => { stop = true; };
          ["touchstart", "wheel", "keydown", "mousedown"].forEach(n => window.addEventListener(n, off, { once: true, passive: true }));
          const go = () => { if (stop) return; try { window.scrollTo({ top: t.y, left: 0, behavior: "instant" }); } catch (e) { window.scrollTo(0, t.y); } };
          requestAnimationFrame(go); setTimeout(go, 160); setTimeout(go, 520);
        }
      }
    } catch (e) { console.error("PulseTrack reopen", e); }
    armed = true;
    snap(t ? t.y : 0);
  }

  // record: every change of screen, scrolling (a moment after it stops), and the moment the app is hidden or put to sleep
  const oShow = proto.showView;
  proto.showView = function () {
    const r = oShow.apply(this, arguments);
    try { snap(0); } catch (e) { }
    return r;
  };
  let tm = 0;
  window.addEventListener("scroll", () => { if (!armed) return; clearTimeout(tm); tm = setTimeout(() => snap(), 350); }, { passive: true });
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") { clearTimeout(tm); snap(); } });
  window.addEventListener("pagehide", () => { clearTimeout(tm); snap(); });
  document.addEventListener("freeze", () => { clearTimeout(tm); snap(); });

  // start: after the app has built itself (its last step in the constructor draws the calendar)
  let started = false;
  const oCal = proto.renderCalendar;
  proto.renderCalendar = function () {
    const r = oCal.apply(this, arguments);
    if (!started) { started = true; setTimeout(boot, 0); }
    return r;
  };

  // Settings switch
  const oEx = proto.renderSettingsExtras;
  proto.renderSettingsExtras = async function () {
    const r = oEx ? await oEx.apply(this, arguments) : undefined;
    try {
      if (!$("pt-resume-row")) {
        const ref = $("pt-tabs-row") || $("pt-gym-row") || $("pt-textsize");
        if (ref) {
          const row = document.createElement("label");
          row.id = "pt-resume-row"; row.className = "flex items-center justify-between gap-3 mt-3 cursor-pointer";
          row.innerHTML = '<span><span class="block text-xs font-bold text-zinc-100">Reopen where I left off</span><span class="block text-[11px] text-zinc-400">If your phone closes the app, it opens on the screen you were on, a few hours at most. During a workout it keeps your place for 12 hours.</span></span><input type="checkbox" id="setting-toggle-resume" class="w-5 h-5 accent-emerald-500">';
          ref.insertAdjacentElement("afterend", row);
          row.querySelector("input").addEventListener("change", ev => {
            const a = A(); a.settings.resumeView = ev.target.checked; WorkoutStorage.saveSettings(a.settings);
            if (ev.target.checked) snap(); else { try { localStorage.removeItem(KEY); } catch (e) { } }
          });
        }
      }
      const t = $("setting-toggle-resume"); if (t) t.checked = on();
    } catch (e) { console.error("PulseTrack reopen setting", e); }
    return r;
  };
})();
  