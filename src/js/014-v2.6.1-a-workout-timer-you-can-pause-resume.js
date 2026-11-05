
    /* =====================================================================
     * PulseTrack 2.6.1: a workout timer you can pause, resume, stop and fix.
     * The state is kept as "time already counted" + "when it last started",
     * so it keeps the right time even while the app is closed, and a paused or
     * stopped timer does not count. It is stored under the same key the old
     * timer used (which backups already skip).
     * ===================================================================== */
    (function () {
      "use strict";
      const proto = ApplicationUI.prototype;
      const MIN = 60000, HR = 3600000;
      const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
      const clock = sec => { sec = Math.max(0, Math.floor(sec)); const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60, p = n => String(n).padStart(2, "0"); return h ? `${h}:${p(m)}:${p(s)}` : `${p(m)}:${p(s)}`; };
      const KEY = () => STORAGE_KEY_SESSION_START;
      const LABEL = { run: "Running", pause: "Paused", stop: "Stopped" };

      /* ---------------------------------------------------------------- state */
      let lastWrite = 0;
      function persist(app, force) {
        const T = app._tm, now = Date.now();
        if (!T) return;
        if (!force && now - lastWrite < 10000) return;
        lastWrite = now;
        try { PTLS.setItem(KEY(), JSON.stringify({ v: 2, a: T.a, r: T.r, s: T.s, la: T.la, t0: T.t0 })); } catch (e) { }
      }
      function load() {
        let raw = null; try { raw = PTLS.getItem(KEY()); } catch (e) { }
        if (!raw) return null;
        const now = Date.now();
        if (/^\d+$/.test(String(raw).trim())) {                       // timer saved by an older version: a start time
          const t = parseInt(raw, 10);
          return t > 0 && now - t < 12 * HR ? { a: 0, r: t, s: "run", la: t, t0: t } : null;
        }
        try {
          const o = JSON.parse(raw);
          if (!o || o.v !== 2 || !/^(run|pause|stop)$/.test(o.s)) return null;
          const T = { a: Math.max(0, +o.a || 0), r: +o.r || 0, s: o.s, la: +o.la || 0, t0: +o.t0 || 0 };
          if (T.s === "run" && !(T.r > 0)) return null;
          if (now - Math.max(T.la, T.r, T.t0) > 12 * HR && T.s !== "run") return null;   // an old paused or stopped timer is a forgotten workout
          if (T.s === "run" && now - Math.max(T.la, T.t0) > 12 * HR) return null;
          return T;
        } catch (e) { return null; }
      }
      const elapsedMs = T => T ? T.a + (T.s === "run" && T.r ? Date.now() - T.r : 0) : 0;
      proto.timerSeconds = function () { return Math.floor(elapsedMs(this._tm) / 1000); };
      proto.timerState = function () { return this._tm ? this._tm.s : null; };
      function syncCompat(app) { app.sessionStartTime = app._tm ? Date.now() - elapsedMs(app._tm) : null; }

      /* ---------------------------------------------------------------- the header button */
      function drawBadge(app) {
        const b = app.dom && app.dom.stopwatchBadge, d = app.dom && app.dom.stopwatchDisplay, T = app._tm;
        if (!b || !d || !T) return;
        const sec = Math.floor(elapsedMs(T) / 1000), txt = clock(sec);
        if (d.textContent !== txt) d.textContent = txt;
        if (b.dataset.st !== T.s) {
          b.dataset.st = T.s;
          const ic = b.querySelector(".pt-ic"); if (ic) ic.className = "pt-ic " + (T.s === "run" ? "pt-ic-run" : T.s === "pause" ? "pt-ic-pause" : "pt-ic-stop");
          b.setAttribute("aria-label", `Workout timer, ${LABEL[T.s].toLowerCase()}. Tap to pause, resume or stop.`);
        }
        const big = document.getElementById("pt-wt-time"); if (big) big.textContent = txt;
      }

      proto.startStopwatch = function () {
        if (!this._tm) {
          this._tm = load() || { a: 0, r: Date.now(), s: "run", la: 0, t0: Date.now() };
          persist(this, true);
        }
        syncCompat(this);
        const b = this.dom.stopwatchBadge;
        b.classList.remove("hidden"); b.classList.add("flex");
        delete b.dataset.st; drawBadge(this);
        clearInterval(this.sessionInterval);
        this.sessionInterval = setInterval(() => { drawBadge(this); syncCompat(this); }, 1000);
      };
      /** Called by Finish Workout: returns the counted seconds and clears the timer. */
      proto.stopStopwatch = function () {
        clearInterval(this.sessionInterval);
        const b = this.dom.stopwatchBadge; b.classList.add("hidden"); b.classList.remove("flex"); delete b.dataset.st;
        const sec = this._tm ? Math.floor(elapsedMs(this._tm) / 1000) : 0;
        this._tm = null; this.sessionStartTime = null;
        try { PTLS.removeItem(KEY()); } catch (e) { }
        const sh = document.getElementById("pt-wt"); if (sh && !sh.classList.contains("hidden")) PT.kit.closeSheet(sh);
        return sec;
      };

      /** pause | resume | stop | reset | set (seconds) */
      proto.timerAction = function (act, secs) {
        const T = this._tm; if (!T) return;
        const now = Date.now();
        const bank = () => { if (T.s === "run" && T.r) T.a += now - T.r; T.r = 0; };
        if (act === "pause") { if (T.s === "run") { bank(); T.s = "pause"; } }
        else if (act === "stop") { if (T.s !== "stop") { bank(); T.s = "stop"; } }
        else if (act === "resume") { if (T.s !== "run") { T.s = "run"; T.r = now; T.la = now; } }
        else if (act === "reset") { T.a = 0; T.s = "run"; T.r = now; T.la = 0; T.t0 = now; }
        else if (act === "set") { T.a = Math.max(0, secs) * 1000; if (T.s === "run") T.r = now; }
        persist(this, true); syncCompat(this); drawBadge(this);
      };

      // A set being checked or a number typed counts as "still working out"
      (function () {
        const o = WorkoutStorage.saveLogs;
        WorkoutStorage.saveLogs = function () {
          try { const app = window.app; if (app && app._tm) { app._tm.la = Date.now(); persist(app, false); } } catch (e) { }
          return o.apply(this, arguments);
        };
      })();
      document.addEventListener("visibilitychange", () => { const app = window.app; if (app && app._tm) { drawBadge(app); if (document.visibilityState === "hidden") persist(app, true); } });

      /* ---------------------------------------------------------------- the timer sheet */
      function parseTime(v) {                          // "75" or "1:15" -> seconds
        v = String(v == null ? "" : v).trim().replace(",", ".");
        let m = /^(\d+):(\d{1,2})$/.exec(v); if (m) return (+m[1]) * 3600 + (+m[2]) * 60;
        m = /^(\d+(?:\.\d+)?)\s*(?:m|min|mins|minutes)?$/i.exec(v); if (m) return Math.round(parseFloat(m[1]) * 60);
        return NaN;
      }
      async function askMinutes(title, body, def) {
        const v = await PT.prompt("Workout length", def, { type: "text", title, body, ok: "Save" });
        if (v === null) return null;
        const s = parseTime(v);
        if (!(s >= 0 && s <= 24 * 3600)) { await PT.alert("Type the minutes, like 75, or hours and minutes, like 1:15."); return null; }
        return s;
      }
      function renderSheet(app) {
        const K = PT.kit, el = K.sheet("pt-wt", 70), T = app._tm; if (!T) return;
        const st = T.s, sec = Math.floor(elapsedMs(T) / 1000);
        const status = st === "run" ? "Counting your workout time."
          : st === "pause" ? "Paused. This time is not counted."
          : "Stopped. Finish Workout will save this time.";
        const primary = st === "run"
          ? `<button type="button" data-wt="pause" class="py-3.5 rounded-xl bg-amber-500 text-zinc-950 text-sm font-extrabold tap-active">❚❚ Pause</button>`
          : `<button type="button" data-wt="resume" class="py-3.5 rounded-xl bg-emerald-600 text-white text-sm font-extrabold tap-active">▶ ${st === "stop" ? "Start again" : "Resume"}</button>`;
        const stopBtn = st === "stop"
          ? `<button type="button" disabled class="py-3.5 rounded-xl bg-zinc-800 text-zinc-500 text-sm font-extrabold opacity-60">■ Stopped</button>`
          : `<button type="button" data-wt="stop" class="py-3.5 rounded-xl bg-zinc-800 text-zinc-100 text-sm font-extrabold tap-active">■ Stop</button>`;
        const card = K.openSheet(el, `${K.head("Workout timer", "Time spent on this workout")}
          <div class="text-center space-y-2 py-1">
            <div id="pt-wt-time" class="pt-wt-time font-mono font-extrabold text-5xl text-white">${clock(sec)}</div>
            <div><span data-st-pill="${st}"><span class="pt-ic ${st === "run" ? "pt-ic-run" : st === "pause" ? "pt-ic-pause" : "pt-ic-stop"}"></span>${LABEL[st]}</span></div>
            <p class="text-xs text-zinc-400">${status}</p>
          </div>
          <div class="grid grid-cols-2 gap-2">${primary}${stopBtn}</div>
          <div class="grid grid-cols-2 gap-2">
            <button type="button" data-wt="adjust" class="py-2.5 rounded-xl bg-zinc-800/70 text-zinc-300 text-xs font-bold tap-active">Fix the time</button>
            <button type="button" data-wt="reset" class="py-2.5 rounded-xl bg-zinc-800/70 text-zinc-300 text-xs font-bold tap-active">Start over (0:00)</button>
          </div>
          <p class="text-[11px] text-zinc-500 leading-relaxed">Tap <b>Pause</b> for a long break or a phone call. <b>Stop</b> freezes the time so it can't keep running after you're done. Your logged sets are never changed by the timer.</p>`);
        card.addEventListener("click", async e => {
          const b = e.target.closest("[data-wt]"); if (!b) return;
          const act = b.dataset.wt;
          if (act === "adjust") {
            const cur = Math.round(app.timerSeconds() / 60);
            const s = await askMinutes("Fix the workout time", "Type how long the workout really took. Minutes (75) or hours and minutes (1:15).", String(cur));
            if (s !== null) app.timerAction("set", s);
          } else if (act === "reset") {
            if (!await PT.confirm("Start the timer over from 0:00?\n\nYour logged sets are not affected.", { title: "Start over?", ok: "Start over" })) return;
            app.timerAction("reset");
          } else app.timerAction(act);
          if (app._tm) renderSheet(app);
        });
      }
      PT.openTimer = () => { const app = window.app; if (app && app._tm) renderSheet(app); };
      document.addEventListener("click", e => { if (e.target.closest("#session-stopwatch-badge")) PT.openTimer(); });

      /* ---------------------------------------------------------------- Finish Workout: catch a timer that was left running */
      const oFinish = proto.finishWorkout;
      proto.finishWorkout = async function () {
        try {
          const T = this._tm;
          if (T && T.s === "run" && T.la > T.t0) {
            const now = Date.now(), idle = now - T.la, total = elapsedMs(T);
            if (idle > 30 * MIN && total - idle >= MIN) {
              const trimmed = Math.floor((total - idle) / 1000), full = Math.floor(total / 1000);
              const gap = idle >= 2 * HR ? Math.round(idle / HR * 10) / 10 + " hours" : Math.round(idle / MIN) + " minutes";
              const pick = await PT.choose("Timer was still running", [`Use ${clock(trimmed)} (up to your last set)`, `Keep ${clock(full)}`], {
                title: "Timer was still running",
                body: `The last set you logged was ${gap} ago, and the timer says ${clock(full)}.\n\nSave the time up to your last set instead?`,
                cancel: "Cancel"
              });
              if (pick === -1) return;
              if (pick === 0) this.timerAction("set", trimmed), this.timerAction("stop");
            }
          }
        } catch (e) { console.error("PulseTrack timer check", e); }
        return oFinish.apply(this, arguments);
      };

      /* ---------------------------------------------------------------- History: fix the time of a past workout */
      const oSession = proto.openSessionSheet;
      proto.openSessionSheet = function (id, editing) {
        const r = oSession.apply(this, arguments);
        try {
          if (editing) return r;
          const s = (this.sessions || []).find(x => x.id === id);
          const tile = document.querySelector("#sheet-body .grid.grid-cols-3 > div");
          if (s && tile && !tile.dataset.wt) {
            tile.dataset.wt = "1"; tile.classList.add("tap-active"); tile.style.cursor = "pointer"; tile.setAttribute("role", "button"); tile.setAttribute("aria-label", "Workout time. Tap to fix it.");
            const lab = tile.querySelector("span"); if (lab) lab.insertAdjacentHTML("beforeend", ' <span class="normal-case" aria-hidden="true">✎</span>');
            tile.addEventListener("click", async () => {
              const secs = await askMinutes("Fix the workout time", "Type how long this workout really took. Minutes (75) or hours and minutes (1:15).", String(Math.round((s.dur || 0) / 60)));
              if (secs === null) return;
              s.dur = secs; s.upd = Date.now();
              this.saveSessions();
              this.openSessionSheet(id);
              if (!document.getElementById("view-history").classList.contains("hidden")) this.renderHistoryView();
              this.toast("Workout time updated");
            });
          }
        } catch (e) { console.error("PulseTrack history time", e); }
        return r;
      };
    })();
  