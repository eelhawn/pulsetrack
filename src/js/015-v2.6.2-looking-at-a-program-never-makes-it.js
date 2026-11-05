
    /* =====================================================================
     * PulseTrack 2.6.2: looking at a program never makes it your current one.
     * You pick it yourself with "Select". Until then, whatever you open
     * is only being viewed; Home, the menu and "Start Workout" keep using
     * the program you selected.
     * ===================================================================== */
    (function () {
      "use strict";
      const proto = ApplicationUI.prototype;
      const FREE = typeof FREESTYLE_ID !== "undefined" ? FREESTYLE_ID : "freestyle";
      let force = false;

      /** The program you picked yourself (null if none, or if it has been deleted). */
      const selOf = app => {
        const s = AppStateMemory.getActive();
        if (!s || !s.progId) return null;
        const p = ((app.data && app.data.programs) || []).find(x => x.id === s.progId);
        return p ? { prog: p, dayNum: s.dayNum } : null;
      };
      const isCurrent = (app, p) => { const s = selOf(app); return !!(s && p && s.prog.id === p.id); };
      PT.currentProgramId = () => { const a = window.app; const s = a && selOf(a); return s ? s.prog.id : null; };

      /* ---- saving the "current program" now only happens for the program that already is current, or when you tap Select ---- */
      const oSave = AppStateMemory.saveActive;
      AppStateMemory.saveActive = function (progId) {
        const app = window.app;
        if (!force && app) {
          const s = selOf(app);
          if (!s || s.prog.id !== progId) { app._browsed = true; return; }   // just looking: remember nothing
        }
        return oSave.apply(this, arguments);
      };

      /** Put the screen state back to your own program (or "none") after looking around. */
      proto.restoreSelection = function () {
        const s = selOf(this);
        this._browsed = false;
        if (!s) { this.activeProgram = null; this.activeDay = null; return; }
        this.activeProgram = s.prog;
        this.activeDay = (s.prog.days || []).find(d => d.dayNumber === s.dayNum) || (s.prog.days || [])[0] || null;
      };

      /** Make a program the current one. */
      proto.selectProgram = function (prog, day, quiet) {
        if (!prog) return;
        const d = day || this.nextDayOf(prog) || (prog.days || [])[0] || null;
        force = true;
        try { AppStateMemory.saveActive(prog.id, d ? d.dayNumber : null); } finally { force = false; }
        this._browsed = false; this._offerSel = null;
        this.activeProgram = prog; this.activeDay = d;
        this.updateDrawerStatus();
        refreshSel(this);
        if (!quiet) this.toast(`"${prog.title}" is now your current program`);
      };

      const oShow = proto.showView;
      proto.showView = function (v) {
        if (this._browsed && v !== "days" && v !== "workout") this.restoreSelection();
        const r = oShow.apply(this, arguments);
        try {
          if (v === "home" && this._offerSel) {
            const p = (this.data.programs || []).find(x => x.id === this._offerSel); this._offerSel = null;
            if (p && !selOf(this)) setTimeout(() => this.toast(`Make "${p.title}" your current program?`, "Select it", () => this.selectProgram(p), 9000), 500);
          }
        } catch (e) { console.error("PulseTrack 2.6.2 offer", e); }
        return r;
      };

      // the side menu always shows your program, not the one you are looking at
      const oDrawer = proto.updateDrawerStatus;
      proto.updateDrawerStatus = function () {
        if (!this._browsed) return oDrawer.apply(this, arguments);
        const a = this.activeProgram, d = this.activeDay, s = selOf(this);
        this.activeProgram = s ? s.prog : null;
        this.activeDay = s ? ((s.prog.days || []).find(x => x.dayNumber === s.dayNum) || null) : null;
        try { return oDrawer.apply(this, arguments); } finally { this.activeProgram = a; this.activeDay = d; }
      };

      // deleting a program you were only looking at must not forget your own
      const oDelete = proto.deleteProgram;
      proto.deleteProgram = function (id) {
        const s = selOf(this), keep = s && s.prog.id !== id ? { id: s.prog.id, dayNum: s.dayNum } : null;
        const r = oDelete.apply(this, arguments);
        if (keep) { force = true; try { AppStateMemory.saveActive(keep.id, keep.dayNum); } finally { force = false; } }
        if (this._browsed) this.restoreSelection();
        return r;
      };

      // "Jump to week" is you starting that program, so it counts as choosing it
      const oJump = proto.jumpToWeek;
      if (oJump) proto.jumpToWeek = function () {
        force = true;
        try { return oJump.apply(this, arguments); } finally { force = false; this._browsed = false; try { refreshSel(this); } catch (e) { } }
      };

      // finishing a workout when you have no current program: offer it (after the summary is closed)
      const oAdvance = proto.advanceToNextDay;
      proto.advanceToNextDay = function (prog) {
        try { if (prog && prog.id !== FREE && !selOf(this)) this._offerSel = prog.id; } catch (e) { }
        return oAdvance.apply(this, arguments);
      };

      /* ---- what you see ---- */
      function daysBar(app) {
        const host = document.getElementById("view-days"); if (!host) return;
        let bar = document.getElementById("pt-sel-days");
        if (!bar) { bar = document.createElement("div"); bar.id = "pt-sel-days"; host.firstElementChild.after(bar); }
        const p = app.activeProgram;
        if (!p || p.id === FREE) { bar.className = "hidden"; bar.innerHTML = ""; return; }
        const cur = isCurrent(app, p);
        bar.className = "pt-sel-bar " + (cur ? "pt-sel-yes" : "pt-sel-no");
        bar.innerHTML = cur ? `<span>✓ This is your current program</span>`
          : `<span>Just looking. This isn't your current program yet.</span><button type="button" id="pt-sel-btn">Select</button>`;
      }
      function workoutBar(app) {
        const host = document.getElementById("view-workout"); if (!host) return;
        let bar = document.getElementById("pt-sel-wk");
        if (!bar) { bar = document.createElement("div"); bar.id = "pt-sel-wk"; host.insertBefore(bar, host.firstElementChild); }
        const p = app.activeProgram;
        if (!p || p.id === FREE || isCurrent(app, p)) { bar.className = "hidden"; bar.innerHTML = ""; return; }
        bar.className = "pt-sel-bar pt-sel-no";
        bar.innerHTML = `<span>Not your current program.</span><button type="button" id="pt-sel-wk-btn">Select it</button>`;
      }
      function refreshSel(app) {
        const vis = id => { const e = document.getElementById(id); return e && !e.classList.contains("hidden"); };
        if (vis("view-programs")) app.renderProgramsView();
        if (vis("view-days")) daysBar(app);
        if (vis("view-workout")) workoutBar(app);
        if (vis("view-home")) app.renderHomeView();
      }
      const oDays = proto.renderDaysView;
      proto.renderDaysView = function () { const r = oDays.apply(this, arguments); try { daysBar(this); } catch (e) { console.error("PulseTrack 2.6.2 days", e); } return r; };
      const oWk = proto.renderWorkoutView;
      proto.renderWorkoutView = function () { const r = oWk.apply(this, arguments); try { workoutBar(this); } catch (e) { console.error("PulseTrack 2.6.2 workout", e); } return r; };

      document.addEventListener("click", e => {
        const b = e.target.closest("#pt-sel-btn, #pt-sel-wk-btn"); if (!b) return;
        const app = window.app; if (!app || !app.activeProgram) return;
        app.selectProgram(app.activeProgram, b.id === "pt-sel-wk-btn" ? app.activeDay : null);
      });
      PT.isCurrentProgram = id => PT.currentProgramId() === id;
    })();
  