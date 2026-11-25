/* =====================================================================
 * PulseTrack 3.27.0: security, and fixes from going through the whole app.
 *  The owner: "add stuff so i cant get hacked like protection and stuff". What 3.27.0 adds (docs/SECURITY.md has the whole list):
 *   - a Content-Security-Policy in the page (tools/build.py): only the app's own scripts run, so text that sneaks into the page from a
 *     shared link, a backup file or a friend's code can never run as a program;
 *   - text from those places is escaped in the workout cards (004, 007), ids from shared links keep only letters, digits, _ and - (005,
 *     030);
 *   - here (1): PulseTrack refuses to run inside another website's frame. A site that put the app in an invisible frame over its own page
 *     could trick taps into it (clickjacking). The policy that would block that (frame-ancestors) only works as a server header and
 *     GitHub Pages cannot send one, so the page checks for itself: inside a frame from another site it hides itself and shows a link
 *     that opens PulseTrack on its own. A frame from PulseTrack's own address (none today) is allowed.
 *   - here (2): a very long word no longer pushes the workout and day screens sideways.
 *   - here (3): the workout screen with no program or day picked goes to the program (or day) list instead of a blank screen, and the
 *     exercise picker with no day open says so instead of an error.
 *  Other fixes from the run-through are in place: the "3 Sets × 6-8" line wraps its links instead of squeezing (004), and the reps box
 *  is wide enough for "10-12" (004).
 * ===================================================================== */
(function () {
  "use strict";
  let framed = false, foreign = false;
  try { framed = window.top !== window.self; } catch (e) { framed = true; }
  if (framed) { try { foreign = window.top.location.origin !== location.origin; } catch (e) { foreign = true; } }   // reading another site's address throws
  if (foreign) {
    document.documentElement.style.visibility = "hidden";   // nothing to tap while the page is still loading
    const show = () => {
      const url = location.origin + location.pathname;
      document.body.innerHTML = "";
      const box = document.createElement("div");
      box.setAttribute("style", "font:16px/1.5 system-ui,sans-serif;color:#e4e4e7;background:#09090b;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:24px;text-align:center");
      const p = document.createElement("p"); p.textContent = "PulseTrack only runs on its own page, not inside another website.";
      const a = document.createElement("a"); a.href = url; a.target = "_blank"; a.rel = "noopener noreferrer"; a.textContent = "Open PulseTrack";
      a.setAttribute("style", "color:#09090b;background:#34d399;padding:10px 18px;border-radius:12px;font-weight:700;text-decoration:none");
      box.append(p, a); document.body.appendChild(box);
      document.documentElement.style.visibility = "visible";
    };
    if (document.body && document.readyState !== "loading") show(); else document.addEventListener("DOMContentLoaded", show);
  }
  if (typeof PT !== "undefined") PT.security = { framed, foreign };

  // Fix: a very long word with no spaces (an exercise or day name typed that way or from a link) pushed the workout and day screens
  // sideways (280 px at 360 px wide). It now breaks onto the next line; normal names are not affected (they only break where they
  // would have stuck out).
  const css = document.createElement("style"); css.id = "pt-fix-css";
  css.textContent = "#view-workout, #view-days { overflow-wrap: anywhere; }";
  document.head.appendChild(css);

  // Fix: opening the workout screen with no program or no day picked (a fresh app, or a coach nudge's Start button, 049) threw an error
  // half way and left a blank screen. It now goes to the program list (or the day list) and says what to pick.
  if (typeof ApplicationUI !== "undefined") {
    const proto = ApplicationUI.prototype, oShow = proto.showView, oRender = proto.renderWorkoutView;
    if (oShow) proto.showView = function (v) {
      if (v === "workout" && !(this.activeProgram && this.activeDay && Array.isArray(this.activeDay.exercises))) {
        const to = this.activeProgram ? "days" : "programs";
        try { this.toast(to === "days" ? "Pick a day first." : "Pick a program first."); } catch (e) { }
        return oShow.call(this, to);
      }
      return oShow.apply(this, arguments);
    };
    // the exercise picker adds to (or swaps on) the open day; with no day open (it was closed meanwhile) it says so instead of an error
    const oPick = proto.handleExerciseSelection;
    if (oPick) proto.handleExerciseSelection = function () {
      const t = this.exerciseModalTarget || {};
      if ((t.action === "add" || t.action === "swap") && !(this.activeDay && Array.isArray(this.activeDay.exercises))) {   // "builder" and "hist" need no day
        try { document.getElementById("modal-ex-selector").classList.add("hidden"); } catch (e) { }
        try { this.toast("Open a workout day first."); } catch (e) { }
        return;
      }
      return oPick.apply(this, arguments);
    };
    if (oRender) proto.renderWorkoutView = function () {
      if (!(this.activeProgram && this.activeDay && Array.isArray(this.activeDay.exercises))) return;   // nothing to draw yet (timers call this too)
      return oRender.apply(this, arguments);
    };
  }
})();
