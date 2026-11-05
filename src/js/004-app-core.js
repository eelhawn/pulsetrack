
    /**
     * Complete Workout Dataset Catalog
     */
    const DEFAULT_WORKOUT_DATA = {
      programs: [
        {
          id: "kaged_massive_arms_6wk",
          title: "6-Weeks to Massive Arms",
          description: "Kaged Muscle 6-week biceps hypertrophy protocol. Emphasizes biceps twice weekly utilizing varying shoulder angles, unilateral tension, and cable movements.",
          tags: ["Biceps Mass", "Hypertrophy", "6 Weeks", "Arm Focus"],
          days: [
            {
              dayNumber: 1,
              title: "Monday: Biceps Primary Blast & Triceps",
              estimatedMinutes: 55,
              exercises: [
                { id: "ma6_d1_e1", name: "Standing Barbell Curls", sets: 4, reps: "10, 8, 6, 4", restSeconds: 75, type: "standard", notes: "Mass Builder (Inner Biceps). Shoulder-width grip. Keep upper arms pinned." },
                { id: "ma6_d1_e2", name: "EZ-Bar Preacher Curls", sets: 4, reps: "12, 10, 8, 6", restSeconds: 60, type: "standard", notes: "Shoulder Positioner (Outer Biceps). Avoid leveraging shoulders." },
                { id: "ma6_d1_e3", name: "Standing Alternating Dumbbell Curls", sets: 4, reps: "10, 10, 8, 6", restSeconds: 60, type: "standard", notes: "Supinate wrist outward at top; control negative." },
                { id: "ma6_d1_e4", name: "Low Cable Curls", sets: 3, reps: "15, 12, 10", restSeconds: 45, type: "standard", notes: "Constant tension; slow negative on every repetition." }
              ]
            },
            {
              dayNumber: 2,
              title: "Tuesday: Legs & Calves",
              estimatedMinutes: 60,
              exercises: [
                { id: "ma6_d2_e1", name: "Barbell Back Squat", sets: 4, reps: "8-10", restSeconds: 90, type: "standard", notes: "Full depth below parallel." },
                { id: "ma6_d2_e2", name: "Romanian Deadlift", sets: 3, reps: "10-12", restSeconds: 75, type: "standard", notes: "Hinge at hips, maintaining slight knee bend." },
                { id: "ma6_d2_e3", name: "Leg Press", sets: 3, reps: "12-15", restSeconds: 60, type: "standard", notes: "Continuous tension without locking knees." },
                { id: "ma6_d2_e4", name: "Standing Calf Raise", sets: 4, reps: "15-20", restSeconds: 45, type: "standard", notes: "2-second stretch at bottom, peak contraction." }
              ]
            },
            {
              dayNumber: 3,
              title: "Wednesday: Cardio & Abs",
              estimatedMinutes: 35,
              exercises: [
                { id: "ma6_d3_e1", name: "Hanging Knee / Leg Raises", sets: 4, reps: "15-20", restSeconds: 45, type: "standard", notes: "Tilt pelvis upward; eliminate swing." },
                { id: "ma6_d3_e2", name: "Cable Crunches", sets: 4, reps: "15-20", restSeconds: 45, type: "standard", notes: "Focus strictly on abdominal curl." }
              ]
            },
            {
              dayNumber: 4,
              title: "Thursday: Back & Biceps Secondary Detail",
              estimatedMinutes: 65,
              exercises: [
                { id: "ma6_d4_e1", name: "Chin-Ups (Underhand Grip)", sets: 4, reps: "8-10", restSeconds: 75, type: "standard", notes: "Palms facing you; dead hang to chin over bar." },
                { id: "ma6_d4_e2", name: "Reverse-Grip Bent-Over Barbell Rows", sets: 4, reps: "8-10", restSeconds: 75, type: "standard", notes: "Supinated grip engages lats and biceps." },
                { id: "ma6_d4_e3", name: "Standing EZ-Bar Curls", sets: 3, reps: "10, 8, 6", restSeconds: 60, type: "standard", notes: "Narrow grip; roll shoulders back." },
                { id: "ma6_d4_e4", name: "Incline Bench Dumbbell Curls", sets: 3, reps: "10, 8, 6", restSeconds: 60, type: "standard", notes: "Elbows remain behind torso." },
                { id: "ma6_d4_e5", name: "Hammer Curls", sets: 3, reps: "10, 10, 10", restSeconds: 60, type: "standard", notes: "Neutral grip targets brachialis." }
              ]
            },
            {
              dayNumber: 5,
              title: "Friday: Chest & Shoulders",
              estimatedMinutes: 55,
              exercises: [
                { id: "ma6_d5_e1", name: "Incline Dumbbell Bench Press", sets: 4, reps: "8-10", restSeconds: 75, type: "standard", notes: "Clavicular upper-pec focus." },
                { id: "ma6_d5_e2", name: "Flat Barbell Bench Press", sets: 3, reps: "8-10", restSeconds: 75, type: "standard", notes: "Drive through heels, scapular retraction." },
                { id: "ma6_d5_e3", name: "Seated Dumbbell Shoulder Press", sets: 4, reps: "8-10", restSeconds: 60, type: "standard", notes: "Press smoothly to lockout." },
                { id: "ma6_d5_e4", name: "Dumbbell Lateral Raises", sets: 4, reps: "12-15", restSeconds: 45, type: "standard", notes: "Lead with elbows for side delts." }
              ]
            },
            {
              dayNumber: 6,
              title: "Saturday: Cardio & Abs",
              estimatedMinutes: 35,
              exercises: [
                { id: "ma6_d6_e1", name: "Abdominal Planks", sets: 3, reps: "45-60s", restSeconds: 45, type: "standard", notes: "Maintain neutral spine brace." },
                { id: "ma6_d6_e2", name: "Russian Twists", sets: 3, reps: "20 total", restSeconds: 45, type: "standard", notes: "Control rotation through torso." }
              ]
            }
          ]
        }
      ]
    };

    /**
     * Storage and State Registry Manager
     */
    function safeSetItem(key, value) {
      try {
        PTLS.setItem(key, value);
        return true;
      } catch (e) {
        console.error("Storage write failed:", key, e);
        if (!window.__ptQuotaWarned) {
          window.__ptQuotaWarned = true;
          if (window.PT && PT.alert) PT.alert("PulseTrack could not save your last change because this phone's storage is full.\n\nGo to Settings → Data & Backup → Export Backup, then free up space on your phone.");
        }
        return false;
      }
    }

    const STORAGE_KEY_DATA = "pulsetrack_data_v1";
    const STORAGE_KEY_LOGS = "pulsetrack_logs_v1";
    const STORAGE_KEY_SETTINGS = "pulsetrack_settings_v1";
    const STORAGE_KEY_HISTORY = "pulsetrack_history_v1";
    const STORAGE_KEY_PRS = "pulsetrack_prs_v1";
    const STORAGE_KEY_LASTPERF = "pulsetrack_lastperf_v1";
    const STORAGE_KEY_ACTIVE_STATE = "pulsetrack_active_state_v1";
    const STORAGE_KEY_SEEDED = "pulsetrack_seeded_v1";

    const THEMES = {
      emerald:  { 300:"110 231 183", 400:"52 211 153",  500:"16 185 129", 600:"5 150 105",  800:"6 95 70",    950:"2 44 34" },
      crimson:  { 300:"253 164 175", 400:"251 113 133", 500:"244 63 94",  600:"225 29 72",  800:"159 18 57",  950:"76 5 25" },
      sapphire: { 300:"147 197 253", 400:"96 165 250",  500:"59 130 246", 600:"37 99 235",  800:"30 64 175",  950:"23 37 84" },
      amethyst: { 300:"196 181 253", 400:"167 139 250", 500:"139 92 246", 600:"124 58 237", 800:"91 33 182",  950:"46 16 101" }
    };
    const BIG_LIFTS = [
      { key: "Squat",          match: /squat/i,                          exclude: /split|goblet/i,         goal: 405 },
      { key: "Bench Press",    match: /bench press|smith machine flat press/i,                   exclude: /dumbbell|incline/i,     goal: 315 },
      { key: "Deadlift",       match: /deadlift/i,                       exclude: /romanian|stiff|single/i, goal: 495 }
    ];

    // Built-in programs that were replaced (the 15 per-phase versions became 7 full 12-week programs)
    const RETIRED_BUILTINS = ["phil_heath_12wk_p1", "phil_heath_12wk_p2", "phil_heath_12wk_p3", "lou_ferrigno_12wk_p1", "lou_ferrigno_12wk_p2",
      "arnold_routine1_muscle_split", "arnold_routine2_twice_week", "arnold_routine3_hybrid", "arnold_routine4_twice_a_day",
      "dorian_yates_blood_guts", "mountain_dog_200_rep", "jay_cutler_routine1_split", "jay_cutler_routine2_cut_like_cutler",
      "jay_cutler_routine3_olympia", "ronnie_coleman_12wk",
      "arnold_superset_chest_back", "larry_scott_20inch_arms", "mentzer_hd_abc_rotation", "jay_cutler_modern_back_delts", "kris_gethin_signature_days",
      "mike_mentzer_heavy_duty", "frank_zane_3_workout_rotation", "steve_reeves_classic_3day", "mentzer_hd_ideal_routine",
      "custom_6day_chestback_legs_sharms"];

    class AppStateMemory {
      static getActive() {
        try { const state = PTLS.getItem(STORAGE_KEY_ACTIVE_STATE); return state ? JSON.parse(state) : null; } catch (e) { return null; }
      }
      static saveActive(progId, dayNum) {
        safeSetItem(STORAGE_KEY_ACTIVE_STATE, JSON.stringify({ progId, dayNum }));
      }
    }

    class WorkoutStorage {
      static getData() {
        const stored = PTLS.getItem(STORAGE_KEY_DATA);
        if (!stored) {
          this.setData(DEFAULT_WORKOUT_DATA);
          return DEFAULT_WORKOUT_DATA;
        }
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error("Storage parsing exception, reverting to defaults", e);
          return DEFAULT_WORKOUT_DATA;
        }
      }

      // Adds every program from programs.js that this device has not received yet.
      // Programs a user deleted stay deleted; programs you add to programs.js later arrive automatically.
      static seedBuiltins(data) {
        if (typeof BUILTIN_PROGRAMS === "undefined" || !Array.isArray(BUILTIN_PROGRAMS)) return data;
        if (!data || !Array.isArray(data.programs)) data = { programs: [] };
        let seeded = [];
        try { seeded = JSON.parse(PTLS.getItem(STORAGE_KEY_SEEDED) || "[]"); } catch (e) { seeded = []; }
        let changed = false;
        const before = data.programs.length;
        data.programs = data.programs.filter(p => !(p && RETIRED_BUILTINS.includes(p.id)));
        if (data.programs.length !== before) changed = true;
        BUILTIN_PROGRAMS.forEach(p => {
          if (!p || !p.id || !Array.isArray(p.days) || seeded.includes(p.id)) return;
          if (!data.programs.some(x => x.id === p.id)) data.programs.push(JSON.parse(JSON.stringify(p)));
          seeded.push(p.id);
          changed = true;
        });
        // 2.6.4: tidy the wording of built-in programs that were added before
        try { if (this.tidyBuiltinText(data)) changed = true; } catch (e) { console.warn("PulseTrack: text tidy skipped", e); }
        // Only remember programs as added once they're really saved, so a full phone retries next time
        if (changed && this.setData(data)) safeSetItem(STORAGE_KEY_SEEDED, JSON.stringify(seeded));
        return data;
      }

      /**
       * Older copies of a built-in program carried notes like "the PDF says..." and website names.
       * Swap in the cleaned wording, but ONLY for text that still has one of those old mentions,
       * so anything you wrote or edited yourself is never touched. Exercises, sets, reps and logs are not changed.
       */
      static tidyBuiltinText(data) {
        if (typeof BUILTIN_PROGRAMS === "undefined" || !data || !Array.isArray(data.programs)) return false;
        const OLD = /PDF|Thefitnessphantom|Encyclopedia of Modern|\(Exact 36 Workouts\)/;
        let changed = false;
        data.programs.forEach(p => {
          if (!p) return;
          const b = BUILTIN_PROGRAMS.find(x => x && x.id === p.id);
          if (!b) return;
          if (typeof p.title === "string" && OLD.test(p.title) && b.title) { p.title = b.title; changed = true; }
          if (typeof p.description === "string" && OLD.test(p.description) && b.description) { p.description = b.description; changed = true; }
          if (!Array.isArray(p.days)) return;
          let bex = null;
          p.days.forEach(d => {
            (d && d.exercises || []).forEach(e => {
              if (!e || typeof e.notes !== "string" || !OLD.test(e.notes)) return;
              if (!bex) {
                bex = {};
                (b.days || []).forEach(bd => (bd.exercises || []).forEach(be => { bex[bd.dayNumber + "|" + be.id] = be; }));
              }
              const be = bex[d.dayNumber + "|" + e.id];
              if (!be) return;
              if (be.notes) e.notes = be.notes; else delete e.notes;
              changed = true;
            });
          });
        });
        return changed;
      }

      static setData(data) {
        return safeSetItem(STORAGE_KEY_DATA, JSON.stringify(data));
      }

      static getLogs() {
        try { const logs = PTLS.getItem(STORAGE_KEY_LOGS); return logs ? (JSON.parse(logs) || {}) : {}; } catch (e) { return {}; }
      }

      static saveLogs(logs) {
        return safeSetItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
      }

      static getSettings() {
        try { const st = PTLS.getItem(STORAGE_KEY_SETTINGS); return st ? (JSON.parse(st) || { showLogger: true }) : { showLogger: true }; } catch (e) { return { showLogger: true }; }
      }

      static saveSettings(settings) {
        return safeSetItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
      }

      static getHistory() {
        try { const hist = PTLS.getItem(STORAGE_KEY_HISTORY); return hist ? (JSON.parse(hist) || {}) : {}; } catch (e) { return {}; }
      }

      static saveHistory(hist) {
        return safeSetItem(STORAGE_KEY_HISTORY, JSON.stringify(hist));
      }

      static getPRs() {
        try { const prs = PTLS.getItem(STORAGE_KEY_PRS); return prs ? (JSON.parse(prs) || {}) : {}; } catch (e) { return {}; }
      }

      static savePRs(prs) {
        return safeSetItem(STORAGE_KEY_PRS, JSON.stringify(prs));
      }

      static getLastPerf() {
        try { const lp = PTLS.getItem(STORAGE_KEY_LASTPERF); return lp ? (JSON.parse(lp) || {}) : {}; } catch (e) { return {}; }
      }

      static saveLastPerf(lp) {
        return safeSetItem(STORAGE_KEY_LASTPERF, JSON.stringify(lp));
      }

      static logDayActivity(dateStr, increment = true) {
        const hist = this.getHistory();
        if (increment) {
          hist[dateStr] = (hist[dateStr] || 0) + 1;
        } else {
          if (hist[dateStr]) {
            hist[dateStr] = Math.max(0, hist[dateStr] - 1);
            if (hist[dateStr] === 0) delete hist[dateStr];
          }
        }
        this.saveHistory(hist);
        return hist;
      }

      static resetDefaults() {
        const keys = [];
        for (let i = 0; i < PTLS.length; i++) {
          const k = PTLS.key(i);
          if (k && k.startsWith("pulsetrack_") && k !== STORAGE_KEY_SETTINGS) keys.push(k);
        }
        keys.forEach(k => PTLS.removeItem(k));
        return this.seedBuiltins(this.getData());
      }
    }

    /**
     * Web Audio API Sound Synthesizer & Haptic Controller
     */
    class SoundEngine {
      constructor() {
        this.ctx = null;
        this.enabled = true;
      }

      init() {
        if (!this.ctx) {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          this.ctx = new AudioContextClass();
        }
        if (this.ctx.state === "suspended") {
          this.ctx.resume();
        }
      }

      vibrate(pattern = 50) {
        if (this.vibrateEnabled === false) return;
        if ("vibrate" in navigator) {
          try { navigator.vibrate(pattern); } catch (e) {}
        }
      }

      playTone(freq, type, duration, gainLevel = 0.15) {
        if (!this.enabled) return;
        try {
          this.init();
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = type;
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

          gain.gain.setValueAtTime(gainLevel, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start();
          osc.stop(this.ctx.currentTime + duration);
        } catch (e) {
          console.warn("Audio playback prevented:", e);
        }
      }

      shortBeep() { 
        this.playTone(800, "sine", 0.08, 0.2); 
        this.vibrate(40);
      }

      highBeep() { 
        this.playTone(1300, "triangle", 0.35, 0.25); 
        this.vibrate([100, 50, 100]);
      }

      lowBeep() { 
        this.playTone(400, "sine", 0.45, 0.25); 
        this.vibrate([80, 50, 80]);
      }

      completeChime() {
        this.playTone(523.25, "sine", 0.15, 0.2);
        this.vibrate([120, 80, 150]);
        setTimeout(() => this.playTone(1046.5, "sine", 0.4, 0.25), 120);
      }
    }

    const sound = new SoundEngine();

    /**
     * Zero-Dependency Lightweight Canvas Confetti Engine
     */
    class ConfettiEngine {
      constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext("2d");
        this.particles = [];
        this.animId = null;
      }

      fire() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.particles = [];
        const colors = ["#10b981", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6", "#ffffff"];

        for (let i = 0; i < 90; i++) {
          this.particles.push({
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            vx: (Math.random() - 0.5) * 16,
            vy: (Math.random() - 0.7) * 16,
            size: Math.random() * 7 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360,
            vRot: (Math.random() - 0.5) * 10,
            life: 1
          });
        }

        cancelAnimationFrame(this.animId);
        this.loop();
      }

      loop() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        let activeCount = 0;

        this.particles.forEach(p => {
          if (p.life > 0) {
            activeCount++;
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.35; // gravity
            p.rotation += p.vRot;
            p.life -= 0.012;

            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate((p.rotation * Math.PI) / 180);
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = Math.max(0, p.life);
            this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
            this.ctx.restore();
          }
        });

        if (activeCount > 0) {
          this.animId = requestAnimationFrame(() => this.loop());
        } else {
          this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
      }
    }

    /**
     * Floating Rest Timer Controller
     */
    class RestTimerController {
      constructor() {
        this.el = document.getElementById("floating-rest-timer");
        this.displayEl = document.getElementById("rest-timer-display");
        this.progressSvg = document.getElementById("rest-timer-progress-svg");
        this.subtextEl = document.getElementById("rest-timer-subtext");
        this.toggleBtn = document.getElementById("btn-timer-toggle");
        
        this.totalDuration = 60;
        this.remainingSeconds = 0;
        this.timerInterval = null;
        this.isPaused = false;

        this.bindEvents();
      }

      bindEvents() {
        document.getElementById("btn-timer-sub15").addEventListener("click", () => this.adjustTime(-15));
        document.getElementById("btn-timer-add15").addEventListener("click", () => this.adjustTime(15));
        this.toggleBtn.addEventListener("click", () => this.togglePause());
        document.getElementById("btn-timer-dismiss").addEventListener("click", () => this.dismiss());
      }

      start(seconds) {
        sound.init();
        try { if ("speechSynthesis" in window && window.app && window.app.settings.voice !== false) speechSynthesis.speak(new SpeechSynthesisUtterance("")); } catch (e) {}
        clearInterval(this.timerInterval);
        clearTimeout(this.dismissTimer);
        this.totalDuration = seconds > 0 ? seconds : 60;
        this.endsAt = Date.now() + this.totalDuration * 1000;
        this.pausedRemaining = null;
        this.isPaused = false;
        this.running = true;
        this.lastBeep = null;

        this.el.classList.remove("translate-y-32", "opacity-0", "pointer-events-none");
        this.el.classList.add("translate-y-0", "opacity-100");
        this.tick();
        this.timerInterval = setInterval(() => this.tick(), 250);
      }

      isRunning() { return !!this.running; }

      remaining() {
        if (this.isPaused) return this.pausedRemaining;
        return Math.max(0, Math.ceil((this.endsAt - Date.now()) / 1000));
      }

      tick() {
        if (!this.running) return;
        this.remainingSeconds = this.remaining();
        this.updateUI();
        if (this.isPaused) return;
        if (this.remainingSeconds <= 3 && this.remainingSeconds > 0 && this.lastBeep !== this.remainingSeconds) {
          this.lastBeep = this.remainingSeconds;
          sound.shortBeep();
        }
        if (this.remainingSeconds <= 0) this.finish();
      }

      finish() {
        this.running = false;
        clearInterval(this.timerInterval);
        sound.completeChime();
        this.subtextEl.innerText = "Rest complete! Begin set.";
        if (window.app) {
          window.app.announceNextSet();
          if (document.visibilityState !== "visible" && window.app.settings.restNotify && "Notification" in window && Notification.permission === "granted" && "serviceWorker" in navigator) {
            navigator.serviceWorker.ready.then(reg => reg.showNotification("Rest complete", { body: "Time for your next set 💪", tag: "pulsetrack-rest", renotify: true, vibrate: [200, 100, 200] })).catch(() => {});
          }
        }
        this.dismissTimer = setTimeout(() => this.dismiss(), 3500);
      }

      updateUI() {
        const rem = Math.max(0, this.remainingSeconds || 0);
        this.displayEl.innerText = rem >= 100 ? `${Math.floor(rem / 60)}:${String(rem % 60).padStart(2, "0")}` : `${rem}s`;
        const percentage = Math.max(0, (rem / this.totalDuration) * 100);
        this.progressSvg.setAttribute("stroke-dashoffset", 100 - percentage);
        this.subtextEl.innerText = this.isPaused ? "Timer paused" : "Catch your breath";
      }

      adjustTime(amount) {
        if (!this.running) return;
        if (this.isPaused) {
          this.pausedRemaining = Math.max(5, this.pausedRemaining + amount);
        } else {
          const next = Math.max(5, this.remaining() + amount);
          this.endsAt = Date.now() + next * 1000;
        }
        const rem = this.remaining();
        if (rem > this.totalDuration) this.totalDuration = rem;
        this.tick();
      }

      togglePause() {
        if (!this.running) return;
        if (!this.isPaused) {
          this.pausedRemaining = this.remaining();
          this.isPaused = true;
        } else {
          this.endsAt = Date.now() + this.pausedRemaining * 1000;
          this.isPaused = false;
        }
        this.tick();
      }

      dismiss() {
        this.running = false;
        clearInterval(this.timerInterval);
        clearTimeout(this.dismissTimer);
        this.el.classList.add("translate-y-32", "opacity-0", "pointer-events-none");
        this.el.classList.remove("translate-y-0", "opacity-100");
      }
    }

    /**
     * Tabata / interval timer (2.6.3).
     * Times itself from the clock (not by counting ticks), so it stays right if the phone
     * slows the page down, and it catches up if you come back to the app late.
     */
    class TabataEngine {
      constructor() {
        const $ = id => document.getElementById(id);
        this.overlayEl = this.el = $("overlay-tabata");
        this.titleEl = $("tabata-exercise-title");
        this.subEl = $("tabata-phase-subtitle");
        this.counterEl = $("tabata-interval-count");
        this.leftEl = $("tabata-left");
        this.cardEl = $("tabata-visual-card");
        this.arcEl = $("tabata-arc");
        this.phaseLabelEl = $("tabata-phase-label");
        this.secondsEl = $("tabata-seconds-display");
        this.nextEl = $("tabata-next");
        this.cueEl = $("tabata-cue-text");
        this.segsEl = $("tabata-segs");
        this.pauseBtn = $("btn-tabata-toggle-pause");
        this.skipBtn = $("btn-tabata-skip");
        this.restartBtn = $("btn-tabata-restart");

        this.cfg = { work: 20, rest: 10, rounds: 8, prep: 3 };
        this.draft = null;
        this.quick = false;
        this.sched = [];
        this.idx = 0;
        this.end = 0;
        this.left = 0;
        this.paused = false;
        this.timer = null;
        this.beeped = -1;
        this.segKey = "";
        this.isOpen = false;
        this.wl = null;
        this.CIRC = 565.49;
        this.bindEvents();
      }

      static get KEY() { return "pulsetrack_tabata_v1"; }
      static get PRESETS() {
        return [
          { n: "Classic", work: 20, rest: 10, rounds: 8 },
          { n: "30 / 15", work: 30, rest: 15, rounds: 8 },
          { n: "40 / 20", work: 40, rest: 20, rounds: 8 },
          { n: "45 / 15", work: 45, rest: 15, rounds: 6 },
          { n: "30 / 30", work: 30, rest: 30, rounds: 10 }
        ];
      }
      static get LIMITS() {
        return { work: [5, 600, 5], rest: [0, 600, 5], rounds: [1, 50, 1], prep: [0, 30, 1] };
      }

      bindEvents() {
        const $ = id => document.getElementById(id);
        $("btn-tabata-close").addEventListener("click", () => this.stop());
        this.pauseBtn.addEventListener("click", () => this.togglePause());
        this.restartBtn.addEventListener("click", () => this.restart());
        this.skipBtn.addEventListener("click", () => this.skip());
        $("btn-tabata-adjust").addEventListener("click", () => this.openAdjust());
        $("tabata-scrim").addEventListener("click", () => this.closeAdjust(false));
        $("tabata-adj-cancel").addEventListener("click", () => this.closeAdjust(false));
        $("tabata-adj-go").addEventListener("click", () => this.closeAdjust(true));
        $("tabata-panel").addEventListener("click", e => {
          const b = e.target.closest("button[data-k]"); if (b) { this.step(b.dataset.k, parseInt(b.dataset.d, 10)); return; }
          const p = e.target.closest("button[data-p]"); if (p) {
            const pr = TabataEngine.PRESETS[parseInt(p.dataset.p, 10)];
            if (pr) { this.draft.work = pr.work; this.draft.rest = pr.rest; this.draft.rounds = pr.rounds; this.paintPanel(); }
          }
        });
        document.addEventListener("keydown", e => {
          if (e.key !== "Escape" || !this.isOpen) return;
          if (this.el.classList.contains("adj")) this.closeAdjust(false); else this.stop();
        });
        document.addEventListener("visibilitychange", () => {
          if (!this.isOpen || document.visibilityState !== "visible") return;
          this.lock();
          this.tick();
        });
      }

      /* ---------- opening, starting, finishing ---------- */
      open(exercise) {
        sound.init();
        const ex = exercise || { name: "Tabata Burnout" };
        this.quick = !!ex.quick;
        let c = { work: ex.workSeconds || 20, rest: ex.restSeconds === 0 ? 0 : (ex.restSeconds || 10), rounds: ex.sets || 8, prep: 3 };
        if (this.quick) {
          try { const s = JSON.parse(PTLS.getItem(TabataEngine.KEY) || "null"); if (s) c = this.clean(s); } catch (e) { }
        }
        this.cfg = this.clean(c);
        this.exercise = ex;
        this.titleEl.innerText = ex.name || "Tabata Burnout";
        this.isOpen = true;
        this.el.classList.add("on");
        this.el.classList.remove("adj");
        this.el.setAttribute("aria-hidden", "false");
        this.lock();
        this.begin();
      }

      clean(c) {
        const L = TabataEngine.LIMITS, o = {};
        Object.keys(L).forEach(k => {
          let v = parseInt(c[k], 10); if (isNaN(v)) v = { work: 20, rest: 10, rounds: 8, prep: 3 }[k];
          o[k] = Math.max(L[k][0], Math.min(L[k][1], v));
        });
        return o;
      }

      build() {
        const { work, rest, rounds, prep } = this.cfg, s = [];
        if (prep > 0) s.push({ k: "prep", ms: prep * 1000, r: 1 });
        for (let r = 1; r <= rounds; r++) {
          s.push({ k: "work", ms: work * 1000, r });
          if (r < rounds && rest > 0) s.push({ k: "rest", ms: rest * 1000, r });
        }
        s.push({ k: "done", ms: 0, r: rounds });
        this.sched = s;
        this.subEl.innerText = `${work}s work · ${rest > 0 ? rest + "s rest · " : ""}${rounds} round${rounds === 1 ? "" : "s"}`;
        this.segsEl.innerHTML = "<i></i>".repeat(rounds);
        this.segKey = "";
      }

      begin() {
        clearInterval(this.timer);
        this.build();
        this.idx = 0;
        this.paused = false;
        this.beeped = -1;
        this.end = Date.now() + this.sched[0].ms;
        this.pauseBtn.setAttribute("aria-pressed", "false");
        if (this.sched[0].k === "work") sound.highBeep();
        this.render(true);
        this.timer = setInterval(() => this.tick(), 100);
      }

      restart() { this.begin(); }

      cur() { return this.sched[this.idx] || { k: "done", ms: 0, r: this.cfg.rounds }; }

      /** Move on to the next part. `lag` = how many ms late we are (to skip stale beeps). */
      enter(lag) {
        const k = this.cur().k;
        this.beeped = -1;
        if (lag < 1500) {
          if (k === "work") sound.highBeep();
          else if (k === "rest") sound.lowBeep();
          else if (k === "done") sound.completeChime();
        }
        if (k === "done") { clearInterval(this.timer); this.paused = false; }
        this.el.classList.remove("pop"); void this.el.offsetWidth; this.el.classList.add("pop");
      }

      tick() {
        if (!this.isOpen || this.paused || this.cur().k === "done") return;
        const now = Date.now();
        if (now >= this.end) {
          const lag = now - this.end;
          while (now >= this.end && this.cur().k !== "done") { this.idx++; this.end += this.cur().ms; }
          this.enter(lag);
        } else {
          const sec = Math.ceil((this.end - now) / 1000), c = this.cur();
          if (sec <= 3 && sec >= 1 && sec !== this.beeped && c.ms / 1000 > sec) { this.beeped = sec; sound.shortBeep(); }
        }
        this.render();
      }

      skip() {
        if (this.cur().k === "done") return;
        if (this.paused) { this.paused = false; this.pauseBtn.setAttribute("aria-pressed", "false"); }
        this.idx++; this.end = Date.now() + this.cur().ms;
        this.enter(0);
        this.render(true);
      }

      togglePause() {
        if (this.cur().k === "done") { this.begin(); return; }
        if (this.paused) this.resume(); else this.pause();
      }
      pause() {
        if (this.paused || this.cur().k === "done") return;
        this.left = Math.max(0, this.end - Date.now());
        this.paused = true;
        this.pauseBtn.setAttribute("aria-pressed", "true");
        this.render();
      }
      resume() {
        if (!this.paused) return;
        this.end = Date.now() + this.left;
        this.paused = false;
        this.pauseBtn.setAttribute("aria-pressed", "false");
        this.render();
      }

      stop() {
        clearInterval(this.timer);
        this.isOpen = false;
        this.paused = false;
        this.unlock();
        this.el.classList.remove("on", "adj");
        this.el.setAttribute("aria-hidden", "true");
      }

      /* ---------- what you see ---------- */
      fmt(sec) { sec = Math.max(0, Math.round(sec)); return Math.floor(sec / 60) + ":" + String(sec % 60).padStart(2, "0"); }

      render(force) {
        const c = this.cur(), rounds = this.cfg.rounds;
        const msLeft = c.k === "done" ? 0 : (this.paused ? this.left : Math.max(0, this.end - Date.now()));
        const sec = Math.ceil(msLeft / 1000);
        const el = this.el;
        el.dataset.phase = c.k;
        el.dataset.paused = this.paused ? "1" : "0";

        // the number (or a tick when finished)
        if (c.k === "done") {
          this.secondsEl.className = "pt-tab-num";
          this.secondsEl.innerHTML = '<svg fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
        } else {
          const t = sec >= 60 ? this.fmt(sec) : String(sec);
          this.secondsEl.className = "pt-tab-num" + (t.length >= 3 ? " long" : "");
          if (this.secondsEl.textContent !== t || this.secondsEl.querySelector("svg")) this.secondsEl.textContent = t;
        }

        // the ring drains over the length of this part
        const frac = c.k === "done" || !c.ms ? 1 : Math.max(0, Math.min(1, msLeft / c.ms));
        this.arcEl.style.strokeDashoffset = String(this.CIRC * (1 - frac));

        // words
        const label = { prep: "GET READY", work: "WORK", rest: "REST", done: "COMPLETE" }[c.k];
        this.phaseLabelEl.textContent = this.paused && c.k !== "done" ? "PAUSED" : label;
        this.counterEl.textContent = c.k === "done" ? `All ${rounds} round${rounds === 1 ? "" : "s"} done` : `Round ${c.r} of ${rounds}`;
        let rest = msLeft;
        for (let i = this.idx + 1; i < this.sched.length; i++) rest += this.sched[i].ms;
        this.leftEl.textContent = c.k === "done" ? "Great work" : this.fmt(rest / 1000) + " left";
        this.nextEl.textContent = this.nextText();
        this.cueEl.textContent = this.cueText();
        this.pauseBtn.textContent = c.k === "done" ? "Go again" : (this.paused ? "Resume" : "Pause");
        this.skipBtn.disabled = c.k === "done";

        // round bars
        const key = c.k + ":" + c.r;
        if (force || key !== this.segKey) {
          this.segKey = key;
          const segs = this.segsEl.children;
          for (let i = 0; i < segs.length; i++) {
            const n = i + 1;
            segs[i].className = c.k === "done" || n < c.r || (n === c.r && c.k === "rest") ? "done" : (n === c.r && c.k === "work" ? "cur" : "");
          }
        }
      }

      nextText() {
        const c = this.cur(), nx = this.sched[this.idx + 1], { work, rest } = this.cfg;
        if (c.k === "done" || !nx) return "";
        if (nx.k === "work") return `Next: Work ${work}s`;
        if (nx.k === "rest") return `Next: Rest ${rest}s`;
        return "Next: Finish";
      }

      cueText() {
        const c = this.cur();
        if (c.k === "prep") return "Get into position and breathe.";
        if (c.k === "work") return c.r === this.cfg.rounds ? "Last one. Give it everything." : "All out. As hard as you can.";
        if (c.k === "rest") return "Breathe. Shake it out.";
        return `Nice work. ${this.fmt(this.cfg.work * this.cfg.rounds)} of hard work done.`;
      }

      /* ---------- change the timing ---------- */
      openAdjust() {
        this.adjWasPaused = this.paused;
        this.pause();
        this.draft = Object.assign({}, this.cfg);
        this.paintPanel();
        this.el.classList.add("adj");
      }

      closeAdjust(apply) {
        if (!this.el.classList.contains("adj")) return;
        this.el.classList.remove("adj");
        if (apply) {
          this.cfg = this.clean(this.draft);
          if (this.quick) { try { safeSetItem(TabataEngine.KEY, JSON.stringify(this.cfg)); } catch (e) { } }
          this.begin();
        } else if (!this.adjWasPaused) {
          this.resume();
        }
      }

      step(k, dir) {
        const L = TabataEngine.LIMITS[k]; if (!L || !this.draft) return;
        let v = this.draft[k];
        if (dir > 0) v = Math.min(L[1], (k === "work" || k === "rest") ? Math.floor(v / L[2]) * L[2] + L[2] : v + L[2]);
        else v = Math.max(L[0], (k === "work" || k === "rest") ? Math.ceil(v / L[2]) * L[2] - L[2] : v - L[2]);
        this.draft[k] = v;
        this.paintPanel();
      }

      paintPanel() {
        const d = this.draft, $ = id => document.getElementById(id);
        $("tabata-v-work").textContent = d.work + "s";
        $("tabata-v-rest").textContent = d.rest + "s";
        $("tabata-v-rounds").textContent = String(d.rounds);
        $("tabata-v-prep").textContent = d.prep + "s";
        $("tabata-presets").innerHTML = TabataEngine.PRESETS.map((p, i) =>
          `<button type="button" data-p="${i}" class="${p.work === d.work && p.rest === d.rest && p.rounds === d.rounds ? "sel" : ""}">${p.n}${i ? "" : " 20/10"} ×${p.rounds}</button>`).join("");
      }

      /* ---------- keep the screen on while it runs ---------- */
      async lock() {
        try {
          if ("wakeLock" in navigator && !this.wl && this.isOpen) {
            this.wl = await navigator.wakeLock.request("screen");
            this.wl.addEventListener("release", () => { this.wl = null; });
          }
        } catch (e) { this.wl = null; }
      }
      unlock() { try { if (this.wl) this.wl.release(); } catch (e) { } this.wl = null; }
    }

    /**
     * Application User Interface and Navigation Controller
     */
    class ApplicationUI {
      constructor() {
        this.data = WorkoutStorage.seedBuiltins(WorkoutStorage.getData());
        this.logs = WorkoutStorage.getLogs();
        this.settings = WorkoutStorage.getSettings();
        sound.enabled = this.settings.sound !== false;
        this.history = WorkoutStorage.getHistory();
        this.prs = WorkoutStorage.getPRs();
        this.lastPerf = WorkoutStorage.getLastPerf();

        // --- SAFELY LOAD ACTIVE PROGRAM & DAY ---
        this.activeProgram = null;
        this.activeDay = null;

        if (this.data && Array.isArray(this.data.programs) && this.data.programs.length > 0) {
          const savedState = AppStateMemory.getActive();
          
          // The app never picks a program for you. Only one you chose yourself stays selected.
          if (savedState && savedState.progId) {
            this.activeProgram = this.data.programs.find(p => p.id === savedState.progId) || null;
          }

          if (this.activeProgram && Array.isArray(this.activeProgram.days) && this.activeProgram.days.length > 0) {
            if (savedState && savedState.dayNum !== undefined) {
              this.activeDay = this.activeProgram.days.find(d => d.dayNumber === savedState.dayNum) || this.activeProgram.days[0];
            } else {
              this.activeDay = this.activeProgram.days[0];
            }
          }
        }

        // Calendar state
        const now = new Date();
        this.calYear = now.getFullYear();
        this.calMonth = now.getMonth();

        // Active Session Stopwatch State
        this.sessionStartTime = null;
        this.sessionInterval = null;
        this.wakeLock = null;

        // Controllers
        this.restTimer = new RestTimerController();
        this.tabata = new TabataEngine();
        this.confetti = new ConfettiEngine("canvas-confetti");

        this.dom = {
          headerTitle: document.getElementById("header-title"),
          headerBreadcrumb: document.getElementById("header-breadcrumb"),
          backBtn: document.getElementById("nav-back-btn"),
          viewHome: document.getElementById("view-home"),
          viewPrograms: document.getElementById("view-programs"),
          viewDays: document.getElementById("view-days"),
          viewWorkout: document.getElementById("view-workout"),
          programsList: document.getElementById("programs-list-container"),
          daysList: document.getElementById("days-list-container"),
          exercisesList: document.getElementById("exercises-list-container"),
          programCountLabel: document.getElementById("program-count-label"),
          modalSettings: document.getElementById("modal-settings"),
          toggleLogger: document.getElementById("setting-toggle-logger"),
          daysProgramTitle: document.getElementById("days-view-program-title"),
          daysProgramDesc: document.getElementById("days-view-program-desc"),
          workoutDayBadge: document.getElementById("workout-day-badge"),
          workoutDayTitle: document.getElementById("workout-day-title"),
          
          // Home Dashboard Elements
          homeProgramTitle: document.getElementById("home-program-title"),
          homeProgramDesc: document.getElementById("home-program-desc"),
          homeActiveDayBadge: document.getElementById("home-active-day-badge"),
          homeMonthlyStreak: document.getElementById("home-monthly-streak"),
          btnHomeResume: document.getElementById("btn-home-resume"),
          btnHomeViewPrograms: document.getElementById("btn-home-view-programs"),
          btnHomeOpenDrawerCal: document.getElementById("btn-home-open-drawer-cal"),

          // Drawer & Calendar elements
          sideDrawer: document.getElementById("side-drawer"),
          drawerBackdrop: document.getElementById("drawer-backdrop"),
          btnOpenDrawer: document.getElementById("btn-open-drawer"),
          btnCloseDrawer: document.getElementById("btn-close-drawer"),
          drawerProgramCard: document.getElementById("drawer-active-program-card"),
          drawerActiveTitle: document.getElementById("drawer-active-program-title"),
          drawerActiveDayLabel: document.getElementById("drawer-active-day-label"),
          calMonthYearLabel: document.getElementById("cal-month-year-label"),
          calDaysGrid: document.getElementById("calendar-days-grid"),
          calMonthActiveCount: document.getElementById("cal-month-active-count"),
          calLifetimeBadge: document.getElementById("cal-total-lifetime-badge"),
          btnCalPrev: document.getElementById("btn-cal-prev"),
          btnCalNext: document.getElementById("btn-cal-next"),
          btnQuickTabata: document.getElementById("btn-drawer-quick-tabata"),

          // Stopwatch & Finish & Modals
          stopwatchBadge: document.getElementById("session-stopwatch-badge"),
          stopwatchDisplay: document.getElementById("session-stopwatch-display"),
          btnFinishWorkout: document.getElementById("btn-finish-workout"),
          finishBar: document.getElementById("finish-bar"),
          restTimerEl: document.getElementById("floating-rest-timer"),
          modalSummary: document.getElementById("modal-workout-summary"),
          btnCloseSummary: document.getElementById("btn-close-summary"),
          summaryWorkoutName: document.getElementById("summary-workout-name"),
          summaryDuration: document.getElementById("summary-duration"),
          summaryVolume: document.getElementById("summary-volume"),
          summarySets: document.getElementById("summary-sets"),
          summaryPRs: document.getElementById("summary-prs"),

          // Plate Calculator
          modalPlateCalc: document.getElementById("modal-plate-calc"),
          btnClosePlateCalc: document.getElementById("btn-close-plate-calc"),
          btnHeaderPlateCalc: document.getElementById("btn-header-plate-calc"),
          btnDrawerPlateCalc: document.getElementById("btn-drawer-plate-calc"),
          plateTargetInput: document.getElementById("plate-target-input"),
          plateWeightPerSide: document.getElementById("plate-weight-per-side"),
          plateBadgesContainer: document.getElementById("plate-badges-container"),
          plateBarSelector: document.getElementById("plate-bar-selector"),

          // Exercise Selector
          modalExSelector: document.getElementById("modal-ex-selector"),
          btnCloseExSelector: document.getElementById("btn-close-ex-selector"),
          exSearchInput: document.getElementById("ex-search-input"),
          exListContainer: document.getElementById("ex-list-container"),
          exSelectorTitle: document.getElementById("ex-selector-title"),
          exSelectorSub: document.getElementById("ex-selector-sub"),
          exChips: document.getElementById("ex-chips")
        };

        this.selectedBarWeight = 45;
        this.exerciseModalTarget = null; 

        this.applyTheme();
        this.bindEvents();
        this.initExtras();
        this.showView("home");
        this.updateDrawerStatus();
        this.renderCalendar();
      }

      bindEvents() {
        window.addEventListener("touchstart", () => sound.init(), { once: true });
        window.addEventListener("click", () => sound.init(), { once: true });

        this.dom.backBtn.addEventListener("click", () => this.navigateBack());

        // Home View Actions
        this.dom.btnHomeViewPrograms.addEventListener("click", () => this.showView("programs"));
        document.querySelectorAll(".drawer-nav").forEach(b => b.addEventListener("click", () => {
          this.closeDrawer();
          const t = b.dataset.nav;
          if (t === "settings") this.openSettings();
          else if (t === "empty") this.startEmptyWorkout();
          else { if (t === "history") this.historyFilter = null; this.showView(t); }
        }));
        this.dom.btnHomeResume.addEventListener("click", () => {
          if (this.activeProgram && this.activeDay) {
            this.showView("workout");
          } else if (this.activeProgram) {
            this.showView("days");
          } else {
            this.showView("programs");
          }
        });
        this.dom.btnHomeOpenDrawerCal.addEventListener("click", () => this.openDrawer());

        document.getElementById("btn-open-settings").addEventListener("click", () => this.openSettings());
        document.getElementById("btn-close-settings").addEventListener("click", () => this.closeSettings());
        document.getElementById("btn-reset-defaults").addEventListener("click", () => this.resetDefaults());
        document.getElementById("btn-reset-day-progress").addEventListener("click", () => this.resetActiveDayLogs());
        document.getElementById("btn-reset-program").addEventListener("click", () => this.resetWholeProgram());

        this.bindBuilder();

        // Theme / voice / library
        document.querySelectorAll(".btn-theme").forEach(btn => {
          btn.addEventListener("click", () => {
            this.settings.accent = btn.dataset.theme;
            WorkoutStorage.saveSettings(this.settings);
            this.applyTheme();
          });
        });
        document.getElementById("setting-toggle-sound").addEventListener("change", (e) => {
          this.settings.sound = e.target.checked;
          sound.enabled = e.target.checked;
          WorkoutStorage.saveSettings(this.settings);
        });
        document.getElementById("setting-toggle-voice").addEventListener("change", (e) => {
          this.settings.voice = e.target.checked;
          WorkoutStorage.saveSettings(this.settings);
        });
        document.getElementById("btn-home-library").addEventListener("click", () => this.showView("library"));
        document.getElementById("lib-search").addEventListener("input", () => this.renderLibraryView());
        document.getElementById("lib-only-data").addEventListener("change", () => this.renderLibraryView());

        // Logger toggle
        this.dom.toggleLogger.addEventListener("change", (e) => {
          this.settings.showLogger = e.target.checked;
          WorkoutStorage.saveSettings(this.settings);
          if (!this.dom.viewWorkout.classList.contains("hidden")) {
            this.renderWorkoutView();
          }
        });

        // Drawer
        this.dom.btnOpenDrawer.addEventListener("click", () => this.openDrawer());
        this.dom.btnCloseDrawer.addEventListener("click", () => this.closeDrawer());
        this.dom.drawerBackdrop.addEventListener("click", () => this.closeDrawer());

        this.dom.btnQuickTabata.addEventListener("click", () => {
          this.closeDrawer();
          this.tabata.open({ name: "Tabata Timer", quick: true });
        });

        document.querySelectorAll(".btn-quick-rest").forEach(btn => {
          btn.addEventListener("click", () => {
            const sec = parseInt(btn.dataset.sec, 10);
            this.closeDrawer();
            this.restTimer.start(sec);
          });
        });

        this.dom.drawerProgramCard.addEventListener("click", () => {
          this.closeDrawer();
          if (this.activeProgram && this.activeDay) {
            this.showView("workout");
          } else if (this.activeProgram) {
            this.showView("days");
          } else {
            this.showView("programs");
          }
        });

        // Calendar controls
        this.dom.btnCalPrev.addEventListener("click", () => {
          this.calMonth--;
          if (this.calMonth < 0) {
            this.calMonth = 11;
            this.calYear--;
          }
          this.renderCalendar();
        });

        this.dom.btnCalNext.addEventListener("click", () => {
          this.calMonth++;
          if (this.calMonth > 11) {
            this.calMonth = 0;
            this.calYear++;
          }
          this.renderCalendar();
        });

        // Plate Calculator Listeners
        this.dom.btnHeaderPlateCalc.addEventListener("click", () => this.openPlateCalc());
        this.dom.btnDrawerPlateCalc.addEventListener("click", () => {
          this.closeDrawer();
          this.openPlateCalc();
        });
        this.dom.btnClosePlateCalc.addEventListener("click", () => this.closePlateCalc());
        this.dom.plateTargetInput.addEventListener("input", () => this.calculatePlates());

        document.querySelectorAll(".btn-plate-adjust").forEach(btn => {
          btn.addEventListener("click", () => {
            const val = parseFloat(btn.dataset.val) || 0;
            let current = parseFloat(this.dom.plateTargetInput.value) || 0;
            current = Math.max(0, current + val);
            this.dom.plateTargetInput.value = current;
            this.calculatePlates();
          });
        });

        this.dom.plateBarSelector.querySelectorAll(".btn-bar-select").forEach(btn => {
          btn.addEventListener("click", () => this.pickBar(btn.dataset.bar));
        });

        // Exercise Selector
        this.dom.btnCloseExSelector.addEventListener("click", () => {
          this.dom.modalExSelector.classList.add("hidden");
        });
        this.dom.exSearchInput.addEventListener("input", (e) => {
          this.renderExerciseList(e.target.value);
        });

        // Workout Completion & Summary
        this.dom.btnFinishWorkout.addEventListener("click", () => this.finishWorkout());
        this.dom.btnCloseSummary.addEventListener("click", () => {
          this.dom.modalSummary.classList.add("hidden");
          this.showView("home");
        });
      }

      openExerciseSelector(action, index = -1) {
        this.exerciseModalTarget = { action, index };
        const db = (typeof EXERCISE_DATABASE !== 'undefined' && Array.isArray(EXERCISE_DATABASE)) ? EXERCISE_DATABASE : [];
        this.exCat = 'All';
        this.exCurrent = '';
        if (action === 'swap') {
          const cur = this.activeDay && this.activeDay.exercises[index];
          this.exCurrent = cur ? cur.name : '';
          const hit = (typeof PT.exCanon === 'function' && PT.exCanon(this.exCurrent)) || db.find(e => e.name === this.exCurrent);
          this.exCat = (hit && hit.category) || PT.category(this.exCurrent) || 'All';   // start on the same muscle group
        }
        this.dom.exSelectorTitle.innerText = action === 'swap' ? 'Swap Exercise' : (action === 'builder' ? 'Add to Program' : 'Add Exercise');
        this.dom.exSelectorSub.innerHTML = action === 'swap'
          ? `Replacing <span class="font-bold text-emerald-400">${this.esc(this.exCurrent)}</span>`
          : (action === 'builder' ? 'Tap to add. The list stays open.' : 'Pick an exercise to add to this day');
        this.dom.exSearchInput.placeholder = `Search ${db.length} exercises...`;
        this.dom.exSearchInput.value = '';
        this.renderExerciseList('');
        this.dom.modalExSelector.classList.remove("hidden");
      }

      renderExerciseList(query) {
        const container = this.dom.exListContainer;
        container.innerHTML = '';
        container.scrollTop = 0;
        const q = (query || '').trim().toLowerCase();
        const db = (typeof EXERCISE_DATABASE !== 'undefined' && Array.isArray(EXERCISE_DATABASE)) ? EXERCISE_DATABASE : [];

        if (db.length === 0) {
          this.dom.exChips.innerHTML = '';
          container.innerHTML = `<p class="text-rose-400 text-sm text-center pt-6 px-4">exercises.js did not load (or has a syntax error). Check the browser console.</p>`;
          return;
        }

        // Searching looks across every category
        // every word you type has to be in the name, one of its other names ("aka"), or its category
        const matches = (q ? db.filter(ex => PT.exMatch(ex, q)) : db).filter(ex => !PT.gymAllows || PT.gymAllows(ex.name));

        // Category chips (with counts for what the search matched)
        const counts = {};
        matches.forEach(ex => { const c = ex.category || 'Other'; counts[c] = (counts[c] || 0) + 1; });
        // Category order = order they first appear in exercises.js (so you control it from that file)
        const catOrder = []; db.forEach(e => { const c = e.category || 'Other'; if (!catOrder.includes(c)) catOrder.push(c); });
        const catRank = c => { const i = catOrder.indexOf(c); return i === -1 ? 999 : i; };
        const byCat = (a, b) => catRank(a) - catRank(b) || a.localeCompare(b);
        const cats = Object.keys(counts).sort(byCat);
        const activeCat = (q || !counts[this.exCat]) ? 'All' : this.exCat;
        const chip = (label, count, on) => `
          <button data-cat="${this.esc(label)}" class="ex-chip shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border tap-active transition whitespace-nowrap ${on
            ? 'bg-emerald-500 border-emerald-500 text-zinc-950'
            : 'bg-zinc-950 border-zinc-800 text-zinc-300'}">${this.esc(label)} <span class="${on ? 'text-zinc-800' : 'text-zinc-500'} font-semibold">${count}</span></button>`;
        this.dom.exChips.innerHTML = chip('All', matches.length, activeCat === 'All') + cats.map(c => chip(c, counts[c], activeCat === c)).join('');
        this.dom.exChips.querySelectorAll('.ex-chip').forEach(b => b.addEventListener('click', () => {
          this.exCat = b.dataset.cat;
          this.renderExerciseList(this.dom.exSearchInput.value);
        }));
        const activeChip = this.dom.exChips.querySelector('.bg-emerald-500');
        if (activeChip && activeChip.scrollIntoView) activeChip.scrollIntoView({ inline: 'center', block: 'nearest' });

        const shown = activeCat === 'All' ? matches : matches.filter(ex => (ex.category || 'Other') === activeCat);
        if (shown.length === 0) {
          container.innerHTML = `<p class="text-zinc-500 text-sm text-center pt-8">No exercises found.</p>`;
          return;
        }

        const isSwap = this.exerciseModalTarget && this.exerciseModalTarget.action === 'swap';
        const icon = isSwap
          ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4M16 17H4m0 0l4-4m-4 4l4 4"/>'
          : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 5v14m7-7H5"/>';

        const groups = {};
        shown.forEach(ex => { const c = ex.category || 'Other'; (groups[c] = groups[c] || []).push(ex); });

        const frag = document.createDocumentFragment();
        if (isSwap && !q && (activeCat === 'All' || activeCat === PT.category(this.exCurrent))) {
          const sec = this.swapSuggestionsSection(this.exCurrent, (name, b) => this.handleExerciseSelection(name, b));
          if (sec) {
            frag.appendChild(sec);
            if (activeCat !== 'All') {
              const h = document.createElement('div');
              h.className = 'px-4 py-1.5 bg-zinc-900 border-b border-zinc-800 text-[11px] font-black uppercase tracking-widest text-emerald-400';
              h.textContent = 'All ' + activeCat;
              frag.appendChild(h);
            }
          }
        }
        Object.keys(groups).sort(byCat).forEach(cat => {
          const items = groups[cat].slice().sort((a, b) => (q ? PT.exRank(a, q) - PT.exRank(b, q) : 0) || a.name.localeCompare(b.name));
          const section = document.createElement('div');

          if (activeCat === 'All') {
            const header = document.createElement('div');
            header.className = 'sticky top-0 z-10 px-4 py-1.5 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 flex items-center justify-between';
            header.innerHTML = `<span class="text-[11px] font-black uppercase tracking-widest text-emerald-400">${this.esc(cat)}</span><span class="text-[10px] font-bold text-zinc-500">${items.length}</span>`;
            section.appendChild(header);
          }

          items.forEach(ex => {
            const isCur = isSwap && PT.sameEx(ex.name, this.exCurrent);
            const hint = q ? PT.exHint(ex, q) : '';
            const btn = document.createElement('button');
            btn.className = `w-full flex items-center gap-3 px-4 min-h-[52px] py-2 border-b border-zinc-800/60 border-l-2 text-left tap-active transition ${isCur ? 'border-l-emerald-500 bg-emerald-950/30' : 'border-l-transparent hover:bg-zinc-900'}`;
            btn.innerHTML = `
              <span class="flex-grow min-w-0"><span class="block text-sm font-semibold ${isCur ? 'text-emerald-300' : 'text-zinc-100'} leading-snug">${this.esc(ex.name)}</span>${hint ? `<span class="block text-[10px] text-zinc-500 mt-0.5">also called ${this.esc(hint)}</span>` : ''}</span>
              ${isCur ? '<span class="shrink-0 text-[10px] font-bold uppercase tracking-wide text-emerald-400">Current</span>' : ''}
              <svg class="w-4 h-4 shrink-0 ${isCur ? 'text-emerald-400' : 'text-zinc-600'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">${icon}</svg>`;
            btn.addEventListener('click', () => this.handleExerciseSelection(ex.name, btn));
            section.appendChild(btn);
          });
          frag.appendChild(section);
        });
        container.appendChild(frag);
      }

      handleExerciseSelection(selectedName, btn) {
        if (this.exerciseModalTarget.action === 'builder') {
          const di = this.exerciseModalTarget.index;
          const day = this.builder.days[di];
          if (!day.exercises.some(e => e.name === selectedName)) {
            day.exercises.push(PT.cardioKind(selectedName) ? { name: selectedName, sets: 1, reps: "20 min" } : { name: selectedName, sets: 3, reps: "10" });
            this.renderBuilder();
            if (btn) btn.classList.add('border-l-emerald-500', 'bg-emerald-950/40');
          }
          this.dom.exSelectorTitle.innerText = `Day ${di + 1} · ${day.exercises.length} added`;
          return; // keep the picker open so you can tap several exercises
        }
        if (this.exerciseModalTarget.action === 'swap') {
          const swEx = this.activeDay.exercises[this.exerciseModalTarget.index];
          if (!swEx.origName) swEx.origName = swEx.name;      // remember the original once
          swEx.name = selectedName;
          if (swEx.name === swEx.origName) delete swEx.origName;
        } else if (this.exerciseModalTarget.action === 'add') {
          this.activeDay.exercises.push({
            id: "custom_" + Date.now(),
            name: selectedName,
            sets: PT.cardioKind(selectedName) ? 1 : 3,
            reps: PT.cardioKind(selectedName) ? "20 min" : "10",
            restSeconds: this.smartRest(selectedName),
            restAuto: true,
            added: true,
            type: "standard"
          });
        }
        WorkoutStorage.setData(this.data);
        this.dom.modalExSelector.classList.add("hidden");
        this.renderWorkoutView();
      }

      async acquireWakeLock() {
        if ("wakeLock" in navigator) {
          try {
            this.wakeLock = await navigator.wakeLock.request("screen");
          } catch (e) {
            console.warn("Screen wake lock request failed:", e);
          }
        }
      }

      releaseWakeLock() {
        if (this.wakeLock) {
          this.wakeLock.release().then(() => { this.wakeLock = null; });
        }
      }

      startStopwatch() {
        if (!this.sessionStartTime) {
          const saved = parseInt(PTLS.getItem(STORAGE_KEY_SESSION_START), 10);
          this.sessionStartTime = (saved > 0 && Date.now() - saved < 12 * 3600 * 1000) ? saved : Date.now();
          safeSetItem(STORAGE_KEY_SESSION_START, String(this.sessionStartTime));
        }
        this.dom.stopwatchBadge.classList.remove("hidden");
        this.dom.stopwatchBadge.classList.add("flex");

        clearInterval(this.sessionInterval);
        this.sessionInterval = setInterval(() => {
          const diffSec = Math.floor((Date.now() - this.sessionStartTime) / 1000);
          const m = String(Math.floor(diffSec / 60)).padStart(2, "0");
          const s = String(diffSec % 60).padStart(2, "0");
          this.dom.stopwatchDisplay.innerText = `${m}:${s}`;
        }, 1000);
      }

      stopStopwatch() {
        clearInterval(this.sessionInterval);
        this.dom.stopwatchBadge.classList.add("hidden");
        this.dom.stopwatchBadge.classList.remove("flex");
        const elapsed = this.sessionStartTime ? Math.floor((Date.now() - this.sessionStartTime) / 1000) : 0;
        this.sessionStartTime = null;
        PTLS.removeItem(STORAGE_KEY_SESSION_START);
        return elapsed;
      }

      openPlateCalc(initialWeight = null) {
        if (initialWeight) {
          this.dom.plateTargetInput.value = initialWeight;
        }
        this.calculatePlates();
        this.dom.modalPlateCalc.classList.remove("hidden");
      }

      closePlateCalc() {
        this.dom.modalPlateCalc.classList.add("hidden");
      }

      platesForUnit() {
        const list = this.gymPlates();
        const colors = {};
        list.forEach(p => { colors[p] = this.plateColor(p); });
        return { list, colors };
      }

      calculatePlates() {
        const total = parseFloat(this.dom.plateTargetInput.value) || 0;
        const bar = this.selectedBarWeight;
        const u = this.unit();
        const perSide = Math.max(0, (total - bar) / 2);
        this.dom.plateWeightPerSide.innerText = `${PT.num(perSide, 2)} ${this.wLabel()}`;
        const box = this.dom.plateBadgesContainer;
        const near = document.getElementById("plate-near");
        box.innerHTML = "";
        if (near) { near.classList.add("hidden"); near.innerText = ""; }
        if (total > 0 && total < bar) {
          box.innerHTML = `<span class="text-xs text-rose-400">That's lighter than the bar (${bar} ${u}).</span>`;
          return;
        }
        const res = this.solvePlates(perSide);
        if (!res.plates.length) {
          box.innerHTML = `<span class="text-xs text-zinc-500 italic">No plates needed (bar only)</span>`;
        }
        res.plates.forEach(p => {
          const badge = document.createElement("span");
          badge.className = `px-2 py-1 rounded-md text-xs font-bold border ${this.plateColor(p)}`;
          badge.innerText = `${p} ${u}`;
          box.appendChild(badge);
        });
        if (!res.exact && near) {
          const lo = bar + res.under * 2;
          const hi = res.over === null ? null : bar + res.over * 2;
          near.innerText = `Can't make ${PT.num(total, 2)} ${u} exactly with your plates. Shown: ${PT.num(lo, 2)} ${u}` + (hi !== null ? ` · next up: ${PT.num(hi, 2)} ${u}` : "") + ".";
          near.classList.remove("hidden");
        }
      }

      openDrawer() {
        this.updateDrawerStatus();
        this.renderCalendar();
        this.dom.drawerBackdrop.classList.remove("pointer-events-none");
        this.dom.drawerBackdrop.classList.add("opacity-100");
        this.dom.sideDrawer.classList.remove("-translate-x-full");
      }

      closeDrawer() {
        this.dom.drawerBackdrop.classList.remove("opacity-100");
        this.dom.drawerBackdrop.classList.add("pointer-events-none");
        this.dom.sideDrawer.classList.add("-translate-x-full");
      }

      updateDrawerStatus() {
        if (this.activeProgram) {
          this.dom.drawerActiveTitle.innerText = this.activeProgram.title;
          this.dom.drawerActiveDayLabel.innerText = this.activeDay
            ? this.weekBadge(this.activeProgram, this.activeDay)
            : "All Days";
        } else {
          this.dom.drawerActiveTitle.innerText = "No Program Selected";
          this.dom.drawerActiveDayLabel.innerText = "Browse";
        }

        this.dom.calLifetimeBadge.innerText = `${(this.sessions || []).length} saved workouts`;
      }

      renderCalendar() {
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        this.dom.calMonthYearLabel.innerText = `${months[this.calMonth]} ${this.calYear}`;
        this.dom.calDaysGrid.innerHTML = "";

        const firstDayIndex = new Date(this.calYear, this.calMonth, 1).getDay();
        const totalDaysInMonth = new Date(this.calYear, this.calMonth + 1, 0).getDate();

        for (let i = 0; i < firstDayIndex; i++) {
          const emptyCell = document.createElement("div");
          emptyCell.className = "h-7 w-7";
          this.dom.calDaysGrid.appendChild(emptyCell);
        }

        const today = new Date();
        const isCurrentMonth = today.getFullYear() === this.calYear && today.getMonth() === this.calMonth;
        let monthActiveDaysCount = 0;

        for (let d = 1; d <= totalDaysInMonth; d++) {
          const dayCell = document.createElement("div");
          const dateStr = `${this.calYear}-${String(this.calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const isTrained = this.history[dateStr] && this.history[dateStr] > 0;
          const isToday = isCurrentMonth && today.getDate() === d;

          if (isTrained) monthActiveDaysCount++;

          dayCell.className = `h-7 w-7 mx-auto flex items-center justify-center rounded-lg text-xs font-semibold transition ${
            isTrained 
              ? "bg-emerald-600 text-white font-bold shadow-sm shadow-emerald-950" 
              : isToday 
                ? "border border-zinc-500 text-white" 
                : "text-zinc-400 hover:text-zinc-200"
          }`;

          dayCell.innerText = d;
          if (isTrained) {
            dayCell.classList.add("cursor-pointer", "tap-active");
            dayCell.setAttribute("role", "button");
            dayCell.addEventListener("click", () => this.openHistoryForDate(dateStr));
          }
          this.dom.calDaysGrid.appendChild(dayCell);
        }

        this.dom.calMonthActiveCount.innerText = `${monthActiveDaysCount} Days Active`;
        if (isCurrentMonth) this.renderStreak(monthActiveDaysCount);
      }

      navigateBack() {
        if (["library", "history", "progress", "body", "cardio"].some(v => !document.getElementById("view-" + v).classList.contains("hidden"))) { this.showView("home"); return; }
        if (!this.dom.viewWorkout.classList.contains("hidden")) {
          this.showView("days");
        } else if (!this.dom.viewDays.classList.contains("hidden")) {
          this.showView("programs");
        } else if (!this.dom.viewPrograms.classList.contains("hidden")) {
          this.showView("home");
        }
      }

      showView(viewName) {
        this.dom.viewHome.classList.add("hidden");
        this.dom.viewPrograms.classList.add("hidden");
        this.dom.viewDays.classList.add("hidden");
        this.dom.viewWorkout.classList.add("hidden");

        ["library", "history", "progress", "body", "cardio"].forEach(v => document.getElementById("view-" + v).classList.add("hidden"));
        const inWorkout = viewName === "workout";
        this.dom.finishBar.classList.toggle("hidden", !inWorkout);
        this.dom.restTimerEl.style.bottom = inWorkout ? "calc(5.5rem + env(safe-area-inset-bottom, 0px))" : "";

        if (viewName === "home") {
          this.releaseWakeLock();
          this.dom.viewHome.classList.remove("hidden");
          this.dom.backBtn.classList.add("hidden");
          this.dom.headerTitle.innerText = "PulseTrack";
          this.dom.headerBreadcrumb.innerText = "Dashboard";
          this.renderHomeView();
        } else if (viewName === "programs") {
          this.releaseWakeLock();
          this.dom.viewPrograms.classList.remove("hidden");
          this.dom.backBtn.classList.remove("hidden");
          this.dom.headerTitle.innerText = "Training Programs";
          this.dom.headerBreadcrumb.innerText = "Catalog";
          this.renderProgramsView();
        } else if (viewName === "days") {
          this.releaseWakeLock();
          this.dom.viewDays.classList.remove("hidden");
          this.dom.backBtn.classList.remove("hidden");
          this.dom.headerTitle.innerText = this.activeProgram ? this.activeProgram.title : "";
          this.dom.headerBreadcrumb.innerText = "Select Workout Day";
          this.renderDaysView();
        } else if (viewName === "library") {
          this.releaseWakeLock();
          document.getElementById("view-library").classList.remove("hidden");
          this.dom.backBtn.classList.remove("hidden");
          this.dom.headerTitle.innerText = "Exercise Library";
          this.dom.headerBreadcrumb.innerText = "PRs & History";
          this.renderLibraryView();
        } else if (viewName === "workout") {
          this.acquireWakeLock();
          this.startStopwatch();
          this.dom.viewWorkout.classList.remove("hidden");
          this.dom.backBtn.classList.remove("hidden");
          this.dom.headerTitle.innerText = this.activeDay ? this.shortDayTitle(this.activeProgram, this.activeDay) : "";
          this.dom.headerBreadcrumb.innerText = this.activeProgram.id === FREESTYLE_ID ? "Freestyle"
            : `${this.activeProgram.title} • ${this.weekBadge(this.activeProgram, this.activeDay).replace(/ · /g, " • ")}`;
          this.renderWorkoutView();
        } else if (["history", "progress", "body", "cardio"].includes(viewName)) {
          this.releaseWakeLock();
          this.showExtraView(viewName);
        }
        this.updateDrawerStatus();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      renderHomeView() {
        this.renderTrophyRoom();
        if (this.activeProgram) {
          this.dom.homeProgramTitle.innerText = this.activeProgram.title;
          this.dom.homeProgramDesc.innerText = this.activeProgram.description;
          this.dom.homeActiveDayBadge.innerText = this.activeDay ? `Day ${this.activeDay.dayNumber}` : "Day 1";
        } else {
          this.dom.homeProgramTitle.innerText = "No Active Program";
          this.dom.homeProgramDesc.innerText = "Pick a program or start an empty workout.";
          this.dom.homeActiveDayBadge.innerText = "Inactive";
        }
        this.renderHomeExtras();
      }

      // Built-in programs (programs.js) that are not on this phone, e.g. because they were deleted.
      missingBuiltins() {
        if (typeof BUILTIN_PROGRAMS === "undefined" || !Array.isArray(BUILTIN_PROGRAMS)) return [];
        const have = new Set((this.data.programs || []).map(p => p.id));
        return BUILTIN_PROGRAMS.filter(b => b && b.id && Array.isArray(b.days) && !have.has(b.id));
      }

      openAddBackBuiltins() {
        const missing = this.missingBuiltins();
        if (!missing.length) { this.closeSheet(); return; }
        const body = `
          <p class="text-[11px] text-zinc-500">These come straight from the app's program list, so you always get the newest version. Your saved workouts in History stay as they are.</p>
          ${missing.slice().sort((a, b) => String(a.title).localeCompare(String(b.title), undefined, { sensitivity: "base", numeric: true })).map(b => {
            const days = (b.days || []).filter(d => (d.exercises || []).length).length;
            return `<div class="bg-zinc-950 border border-zinc-800 rounded-xl p-3 flex items-center gap-3">
              <div class="flex-grow min-w-0">
                <span class="block text-sm font-bold text-white">${this.esc(b.title)}</span>
                <span class="block text-[10px] text-zinc-500 mt-0.5">${days} workout day${days === 1 ? "" : "s"}${(b.tags || []).length ? " · " + this.esc(b.tags.slice(0, 3).join(" · ")) : ""}</span>
              </div>
              <button class="addback-one shrink-0 px-3 py-2 rounded-lg text-xs font-bold bg-emerald-600 text-white tap-active" data-id="${this.esc(b.id)}">Add</button>
            </div>`;
          }).join("")}`;
        const el = this.openSheet("Add Back a Built-in Program", `${missing.length} not on this phone`, body, "");
        el.querySelectorAll(".addback-one").forEach(btn => btn.addEventListener("click", () => {
          const b = this.missingBuiltins().find(x => x.id === btn.dataset.id);
          if (!b) return;
          if (!this.data || !Array.isArray(this.data.programs)) this.data = { programs: [] };
          const prog = JSON.parse(JSON.stringify(b));
          this.data.programs.push(prog);
          if (!WorkoutStorage.setData(this.data)) { this.data.programs.pop(); return; }
          this.renderProgramsView();
          this.updateDrawerStatus();
          if (this.missingBuiltins().length) this.openAddBackBuiltins(); else this.closeSheet();
          this.toast(`Added "${prog.title}"`, "Open", () => {
            this.closeSheet();
            this.activeProgram = prog;
            this.activeDay = this.nextDayOf ? (this.nextDayOf(prog) || prog.days[0]) : prog.days[0];
            if (this.activeDay) AppStateMemory.saveActive(prog.id, this.activeDay.dayNumber);
            this.showView("days");
          }, 6000);
        }));
      }

      renderProgramsView() {
        const missingN = this.missingBuiltins().length;
        const addBack = document.getElementById("btn-addback-builtin");
        if (addBack) {
          addBack.classList.toggle("hidden", !missingN);
          const c = document.getElementById("addback-count");
          if (c) c.innerText = missingN ? `(${missingN})` : "";
        }
        this.dom.programsList.innerHTML = "";
        const list = (this.data.programs || []).slice().sort((x, y) =>
          String(x.title || "").localeCompare(String(y.title || ""), undefined, { sensitivity: "base", numeric: true }));
        this.dom.programCountLabel.innerText = `${list.length} Available`;

        if (list.length === 0) {
          this.dom.programsList.innerHTML = `
            <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center space-y-2">
              <p class="text-sm font-semibold text-zinc-300">No workout programs found</p>
              <p class="text-xs text-zinc-500">Create a custom program or import a shared one.</p>
            </div>
          `;
          return;
        }

        list.forEach(program => {
          const card = document.createElement("div");
          const isCur = !!(typeof PT !== "undefined" && PT.isCurrentProgram && PT.isCurrentProgram(program.id));
          card.className = `bg-zinc-900 border ${isCur ? "border-emerald-600/70" : "border-zinc-800/90"} rounded-2xl p-4 tap-active cursor-pointer hover:border-zinc-700 transition`;
          
          const tagsHtml = (program.tags || []).map(t => 
            `<span class="px-2 py-0.5 rounded-md bg-zinc-800 text-[10px] font-semibold text-zinc-300 mr-1.5">${this.esc(t)}</span>`
          ).join("");

          card.innerHTML = `
            <div class="flex items-start justify-between">
              <div class="pr-2 flex-grow">
                <h3 class="text-base font-bold text-white">${this.esc(program.title)}</h3>
                <p class="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">${this.esc(program.description || "")}</p>
              </div>
              <div class="flex items-center space-x-1 flex-shrink-0">
                <button class="btn-share-prog p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 rounded-xl tap-active transition" aria-label="Share Program" title="Share with someone">
                  <svg class="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                </button>
                <button class="btn-delete-prog p-2 bg-zinc-800 hover:bg-rose-950/80 text-zinc-400 hover:text-rose-400 rounded-xl tap-active transition" data-id="${program.id}" aria-label="Delete Program">
                  <svg class="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
                <span class="p-2 bg-zinc-800 text-zinc-400 rounded-xl">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/></svg>
                </span>
              </div>
            </div>
            <div class="flex items-center gap-2 mt-3 pt-3 border-t border-zinc-800/60">
              <div class="flex flex-wrap gap-1 flex-1 min-w-0">${tagsHtml}</div>
              <span class="text-[11px] text-zinc-500 font-medium shrink-0">${program.days ? program.days.length : 0} days</span>
              ${isCur ? `<span class="pt-cur-chip">✓ Current</span>` : `<button type="button" class="btn-use-prog" aria-label="Select ${this.esc(program.title)} as my current program">Select</button>`}
            </div>
          `;

          card.querySelector(".btn-share-prog").addEventListener("click", (e) => {
            e.stopPropagation();
            this.shareProgram(program);
          });
          const useBtn = card.querySelector(".btn-use-prog");
          if (useBtn) useBtn.addEventListener("click", (e) => { e.stopPropagation(); this.selectProgram(program); });

          card.addEventListener("click", () => {
            this.activeProgram = program;
            this.activeDay = this.nextDayOf(program) || (program.days ? program.days[0] : null);
            AppStateMemory.saveActive(this.activeProgram.id, this.activeDay ? this.activeDay.dayNumber : null);
            this.showView("days");
          });

          const deleteBtn = card.querySelector(".btn-delete-prog");
          deleteBtn.addEventListener("click", async (e) => {
            e.stopPropagation();
            const isBuiltin = typeof BUILTIN_PROGRAMS !== "undefined" && Array.isArray(BUILTIN_PROGRAMS) && BUILTIN_PROGRAMS.some(b => b.id === program.id);
            if (await PT.confirm(isBuiltin
                ? `Delete "${program.title}" from this phone?\n\nYou can add it back any time with "Add Back a Built-in Program". Saved workouts in History are kept.`
                : `Delete "${program.title}"? This cannot be undone. Saved workouts in History are kept.`)) {
              this.deleteProgram(program.id);
            }
          });

          this.dom.programsList.appendChild(card);
        });
      }

      deleteProgram(programId) {
        this.data.programs = (this.data.programs || []).filter(p => p.id !== programId);
        WorkoutStorage.setData(this.data);
        if (this.progState && this.progState[programId]) { delete this.progState[programId]; this.saveProgState(); }
        if (this.activeProgram && this.activeProgram.id === programId) {
          this.activeProgram = null;
          this.activeDay = null;
          PTLS.removeItem(STORAGE_KEY_ACTIVE_STATE);
        }
        this.renderProgramsView();
        this.updateDrawerStatus();
      }

      renderDaysView() {
        if (!this.activeProgram) return;
        this.dom.daysProgramTitle.innerText = this.activeProgram.title;
        this.dom.daysProgramDesc.innerText = this.activeProgram.description || "";
        this.dom.daysList.innerHTML = "";
        this.renderDaysWeekRow();

        const daysList = this.activeProgram.days || [];
        daysList.forEach(day => {
          const card = document.createElement("div");
          card.className = "bg-zinc-900 border border-zinc-800 rounded-xl p-4 tap-active cursor-pointer hover:border-zinc-700 flex items-center justify-between";
          card.dataset.day = day.dayNumber;

          let totalSets = 0;
          let completedSets = 0;

          const exList = day.exercises || [];
          exList.forEach(ex => {
            totalSets += (ex.sets || 0);
            for (let s = 0; s < (ex.sets || 0); s++) {
              const key = this.getLogKey(this.activeProgram.id, day.dayNumber, ex.id, s);
              if (this.logs[key] && this.logs[key].completed) completedSets++;
            }
          });

          const isAllCompleted = totalSets > 0 && completedSets === totalSets;
          const statusBadge = isAllCompleted 
            ? `<span class="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 text-[10px] font-bold">COMPLETED</span>`
            : completedSets > 0 
              ? `<span class="px-2 py-0.5 rounded-full bg-amber-950 border border-amber-800 text-amber-400 text-[10px] font-bold">${completedSets}/${totalSets} SETS</span>`
              : `<span class="text-[11px] text-zinc-500 font-medium">${day.estimatedMinutes || 45} mins</span>`;

          card.innerHTML = `
            <div class="flex flex-col pr-3">
              <span class="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Day ${day.dayNumber}</span>
              <h4 class="text-sm font-bold text-white mt-0.5">${this.esc(this.shortDayTitle(this.activeProgram, day))}</h4>
              <span class="text-xs text-zinc-400 mt-1">${exList.length} Exercises</span>
            </div>
            <div class="flex items-center space-x-2 flex-shrink-0">
              ${this.dayCardExtras(day)}
              ${exList.length ? statusBadge : `<span class="text-[11px] text-zinc-500 font-medium">Rest day</span>`}
              <svg class="w-4 h-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </div>
          `;

          card.addEventListener("click", () => {
            if (!exList.length && this.activeProgram.id !== FREESTYLE_ID) { this.handleRestDay(day); return; }
            this.activeDay = day;
            AppStateMemory.saveActive(this.activeProgram.id, this.activeDay.dayNumber);
            this.showView("workout");
          });

          this.dom.daysList.appendChild(card);
        });
        this.decorateDaysList();
      }

      bindBuilder() {
        document.getElementById("btn-create-program").addEventListener("click", () => this.openBuilder());
        document.getElementById("btn-addback-builtin").addEventListener("click", () => this.openAddBackBuiltins());
        document.getElementById("btn-close-builder").addEventListener("click", () => this.closeBuilder());
        document.getElementById("btn-save-builder").addEventListener("click", () => this.saveBuilder());
        const body = document.getElementById("builder-body");
        body.addEventListener("input", (e) => {
          const t = e.target, f = t.dataset.f;
          if (!f || !this.builder) return;
          const d = parseInt(t.dataset.d, 10), x = parseInt(t.dataset.e, 10);
          if (f === "title") this.builder.title = t.value;
          else if (f === "desc") this.builder.description = t.value;
          else if (f === "dayTitle") this.builder.days[d].title = t.value;
          else if (f === "sets") this.builder.days[d].exercises[x].sets = t.value;
          else if (f === "reps") this.builder.days[d].exercises[x].reps = t.value;
        });
        body.addEventListener("click", (e) => {
          const el = e.target.closest("[data-act]");
          if (!el || !this.builder) return;
          const d = parseInt(el.dataset.d, 10), x = parseInt(el.dataset.e, 10), act = el.dataset.act;
          if (act === "addEx") this.openExerciseSelector("builder", d);
          else if (act === "rmEx") { this.builder.days[d].exercises.splice(x, 1); this.renderBuilder(); }
          else if (act === "addDay") { this.builder.days.push({ title: "Day " + (this.builder.days.length + 1), exercises: [] }); this.renderBuilder(); }
          else if (act === "rmDay") { this.builder.days.splice(d, 1); this.renderBuilder(); }
        });
      }

      openBuilder(prefill) {
        this.builder = prefill
          ? { title: prefill.title || "", description: prefill.description || "", days: JSON.parse(JSON.stringify(prefill.days || [{ title: "Day 1", exercises: [] }])) }
          : { title: "", description: "", days: [{ title: "Day 1", exercises: [] }] };
        const bt = document.getElementById("builder-title");
        if (bt) bt.innerText = prefill ? "Save as Routine" : "Create Custom Program";
        this.renderBuilder();
        document.getElementById("modal-builder").classList.remove("hidden");
      }

      async closeBuilder() {
        if (this.builder && this.builder.days.some(d => d.exercises.length) && !await PT.confirm("Discard this program?")) return;
        document.getElementById("modal-builder").classList.add("hidden");
        this.builder = null;
      }

      renderBuilder() {
        const b = this.builder, body = document.getElementById("builder-body");
        const scroll = body.scrollTop;
        const field = "w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 placeholder-zinc-500";
        const mini = "bg-zinc-950 border border-zinc-800 rounded px-1.5 py-1 text-right font-mono text-zinc-200 focus:outline-none focus:border-emerald-500";
        let html = `
          <div class="space-y-2">
            <input data-f="title" value="${this.esc(b.title)}" placeholder="Program name (e.g. Dad's Friday Upper Body)" class="${field} text-sm font-bold">
            <input data-f="desc" value="${this.esc(b.description)}" placeholder="Short description (optional)" class="${field} text-xs">
          </div>`;
        b.days.forEach((day, di) => {
          html += `<div class="bg-zinc-950 border border-zinc-800 rounded-2xl p-3 space-y-2.5">
            <div class="flex items-center space-x-2">
              <input data-f="dayTitle" data-d="${di}" value="${this.esc(day.title)}" class="flex-grow bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-emerald-500">
              ${b.days.length > 1 ? `<button data-act="rmDay" data-d="${di}" class="px-2.5 py-2 bg-zinc-800 text-rose-400 rounded-lg text-xs font-bold tap-active">Remove</button>` : ""}
            </div>`;
          day.exercises.forEach((ex, ei) => {
            html += `<div class="flex items-center space-x-1.5 bg-zinc-900 border border-zinc-800 rounded-lg p-2">
              <span class="flex-grow text-xs font-bold text-white min-w-0 break-words">${this.esc(ex.name)}</span>
              <input data-f="sets" data-d="${di}" data-e="${ei}" type="number" inputmode="numeric" value="${this.esc(ex.sets)}" class="w-10 ${mini}">
              <span class="text-[10px] text-zinc-500">sets</span>
              <input data-f="reps" data-d="${di}" data-e="${ei}" type="text" value="${this.esc(ex.reps)}" class="w-14 ${mini}">
              <span class="text-[10px] text-zinc-500">reps</span>
              <button data-act="rmEx" data-d="${di}" data-e="${ei}" class="p-1.5 text-zinc-500 hover:text-rose-400 tap-active" aria-label="Remove exercise">✕</button>
            </div>`;
          });
          html += `<button data-act="addEx" data-d="${di}" class="w-full py-2.5 border-2 border-dashed border-zinc-700 text-zinc-400 hover:border-emerald-500 hover:text-emerald-400 rounded-xl text-xs font-bold tap-active">＋ Add Exercises</button>
          </div>`;
        });
        html += `<button data-act="addDay" class="w-full py-2.5 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold tap-active">＋ Add Another Day</button>`;
        body.innerHTML = html;
        body.scrollTop = scroll;
      }

      async saveBuilder() {
        const b = this.builder, clean = (t) => String(t || "").replace(/[<>]/g, "").trim();
        const title = clean(b.title);
        if (!title) { await PT.alert("Give your program a name."); return; }
        const days = b.days.filter(d => d.exercises.length);
        if (!days.length) { await PT.alert("Add at least one exercise."); return; }
        const id = "custom_" + Date.now();
        const prog = {
          id, title,
          description: clean(b.description) || "Custom program",
          tags: ["Custom"],
          days: days.map((d, di) => ({
            dayNumber: di + 1,
            title: clean(d.title) || ("Day " + (di + 1)),
            estimatedMinutes: Math.max(20, d.exercises.length * 9),
            exercises: d.exercises.map((ex, ei) => ({
              id: `${id}_d${di + 1}_e${ei + 1}`,
              name: ex.name,
              sets: Math.max(1, parseInt(ex.sets, 10) || 3),
              reps: clean(ex.reps) || "10",
              restSeconds: this.smartRest(ex.name),
              restAuto: true,
              type: "standard"
            }))
          }))
        };
        if (!this.data || !Array.isArray(this.data.programs)) this.data = { programs: [] };
        prog.days.forEach(d => { d.orig = JSON.parse(JSON.stringify(d.exercises)); });
        this.data.programs.push(prog);
        WorkoutStorage.setData(this.data);
        this.builder = null;
        document.getElementById("modal-builder").classList.add("hidden");
        this.renderProgramsView();
        this.updateDrawerStatus();
        if (this.toast) this.toast(`Saved "${title}" to your programs`, "Open", () => {
          this.activeProgram = prog;
          this.activeDay = prog.days[0];
          AppStateMemory.saveActive(prog.id, prog.days[0].dayNumber);
          this.showView("days");
        }, 5000);
      }

      plateRowHtml(weight) {
        const w = parseFloat(weight), bar = this.selectedBarWeight;
        if (!w || w <= bar) return "";
        const perSide = (w - bar) / 2;
        const res = this.solvePlates(perSide);
        const html = res.plates.map(p => `<span class="px-1.5 py-0.5 rounded border text-[10px] font-bold ${this.plateColor(p)}">${p}</span>`).join("");
        const rem = Math.round((perSide - res.under) * 100) / 100;
        return `<span class="text-[10px] text-zinc-500 mr-0.5">Per side:</span>` + html + (!res.exact && rem > 0 ? `<span class="text-[10px] text-rose-400">+${rem} left</span>` : "");
      }

      applyTheme() {
        const name = this.settings.accent || "emerald";
        const t = THEMES[name] || THEMES.emerald;
        Object.keys(t).forEach(k => document.documentElement.style.setProperty("--a" + k, t[k]));
        document.querySelectorAll(".btn-theme").forEach(b => b.classList.toggle("ring-2", b.dataset.theme === name));
      }

      announceNextSet() {
        if (this.settings.voice === false || !("speechSynthesis" in window)) return;
        let msg = "Rest complete.";
        if (this.activeDay && !this.dom.viewWorkout.classList.contains("hidden")) {
          outer:
          for (const ex of (this.activeDay.exercises || [])) {
            for (let s = 0; s < (ex.sets || 0); s++) {
              const e = this.logs[this.getLogKey(this.activeProgram.id, this.activeDay.dayNumber, ex.id, s)];
              if (!(e && e.completed)) {
                const prev = (this.lastPerf[ex.name] || [])[s];
                const w = (e && parseFloat(e.weight)) || (prev && prev.weight) || 0;
                msg += " Next set: " + ex.name + (w ? ", " + w + (this.unit() === "kg" ? " kilos" : " pounds") : "") + ".";
                break outer;
              }
            }
          }
        }
        try { speechSynthesis.cancel(); speechSynthesis.speak(new SpeechSynthesisUtterance(msg)); } catch (e) {}
      }

      async generateWarmups(index) {
        const ex = this.activeDay.exercises[index];
        const last = (this.lastPerf[ex.name] || []).slice(-1)[0];
        const target = parseFloat(await PT.prompt("Target working weight for " + ex.name + " (" + this.wLabel() + ")?", last ? last.weight : ""));
        if (!target || target <= 0) return;
        const kg = this.unit() === "kg";
        const bar = kg ? 20 : 45, round5 = x => kg ? Math.round(x / 2.5) * 2.5 : Math.round(x / 5) * 5;
        const plan = [{ w: bar, r: 10 }, { w: round5(target * 0.6), r: 5 }, { w: round5(target * 0.8), r: 3 }, { w: round5(target * 0.9), r: 1 }];
        const out = [];
        plan.forEach(st => { if (st.w >= bar && st.w < target && (!out.length || st.w > out[out.length - 1].w)) out.push(st); });
        if (!out.length) { await PT.alert("Target weight is too light for warm-up sets."); return; }

        const pid = this.activeProgram.id, dn = this.activeDay.dayNumber, n = out.length;
        for (let s = ex.sets - 1; s >= 0; s--) {
          const from = this.getLogKey(pid, dn, ex.id, s), to = this.getLogKey(pid, dn, ex.id, s + n);
          if (this.logs[from]) { this.logs[to] = this.logs[from]; delete this.logs[from]; }
        }
        out.forEach((st, i) => {
          this.logs[this.getLogKey(pid, dn, ex.id, i)] = { completed: false, weight: String(st.w), reps: String(st.r), tag: "W" };
        });
        this.changeSets(ex, n);
        WorkoutStorage.setData(this.data);
        WorkoutStorage.saveLogs(this.logs);
        this.renderWorkoutView();
      }

      bindSwipe() {
        this.dom.exercisesList.querySelectorAll(".set-row").forEach(row => {
          let sx = 0, sy = 0, dx = 0, active = false;
          const reset = () => { row.style.transition = "transform .2s ease, background .2s ease"; row.style.transform = ""; row.style.background = ""; };
          row.addEventListener("touchstart", (e) => {
            if (e.target.closest("input,button")) return;
            const t = e.touches[0]; sx = t.clientX; sy = t.clientY; dx = 0; active = true; row.style.transition = "none";
          }, { passive: true });
          row.addEventListener("touchmove", (e) => {
            if (!active) return;
            const t = e.touches[0], mx = t.clientX - sx, my = t.clientY - sy;
            if (Math.abs(my) > Math.abs(mx)) { dx = 0; return; }
            dx = mx;
            row.style.transform = "translateX(" + Math.max(-90, Math.min(90, dx * 0.6)) + "px)";
            row.style.background = dx > 0 ? "rgba(16,185,129,0.15)" : "rgba(244,63,94,0.15)";
          }, { passive: true });
          row.addEventListener("touchcancel", () => { active = false; dx = 0; reset(); }, { passive: true });
          row.addEventListener("touchend", () => {
            if (!active) return;
            active = false; reset();
            if (Math.abs(dx) < 70) return;
            const btn = row.querySelector(".btn-check-set");
            if (!btn) return;
            if (dx > 0) {
              if (btn.dataset.completed === "0") btn.click();
            } else {
              const key = btn.dataset.key;
              if (!this.logs[key]) this.logs[key] = { completed: false, weight: "", reps: "", tag: "R" };
              this.logs[key].tag = "F";
              WorkoutStorage.saveLogs(this.logs);
              if (btn.dataset.completed === "0") btn.click(); else this.renderWorkoutView();
            }
            sound.vibrate(30);
          }, { passive: true });
        });
      }

      renderTrophyRoom() {
        const box = document.getElementById("trophy-room");
        if (!box) return;
        const goals = this.settings.goals || {};
        const names = Object.keys(this.prs);
        box.innerHTML = "";
        BIG_LIFTS.forEach(l => {
          let best = 0, holder = "";
          names.forEach(n => {
            if (l.match.test(n) && !(l.exclude && l.exclude.test(n)) && this.prs[n] > best) { best = this.prs[n]; holder = n; }
          });
          const kg = this.unit() === "kg", u = kg ? "kg" : "lb";
          const goal = goals[l.key] || (kg ? Math.round((l.goal * KG_PER_LB) / 5) * 5 : l.goal);
          const pct = Math.min(100, Math.round((best / goal) * 100));
          const steps = kg ? [60, 100, 140, 180, 220, 260, 300] : [135, 225, 315, 405, 495, 585, 675];
          const next = steps.find(m => m > best);
          const plateTxt = next ? (kg ? (next - 20) / 40 : (next - 45) / 90) : 0;
          const row = document.createElement("button");
          row.className = "w-full text-left space-y-1 tap-active";
          row.innerHTML = `
            <div class="flex items-center justify-between text-xs">
              <span class="font-bold text-white">${l.key}</span>
              <span class="font-mono ${best ? "text-emerald-400" : "text-zinc-500"}">${best ? best + " " + u : "—"} <span class="text-zinc-500">/ ${goal}</span></span>
            </div>
            <div class="h-2 rounded-full bg-zinc-800 overflow-hidden"><div class="h-2 rounded-full bg-emerald-500" style="width:${pct}%"></div></div>
            <div class="text-[10px] text-zinc-500">${holder ? this.esc(holder) + " · est. 1RM · " + pct + "% of goal" : "No PR logged yet"}<br>Next milestone: ${next ? next + " " + u + " (" + plateTxt + "-plate)" : "—"}</div>`;
          row.addEventListener("click", async () => {
            const v = parseFloat(await PT.prompt("Goal 1RM for " + l.key + " (" + this.wLabel() + ")?", goal));
            if (v > 0) {
              this.settings.goals = Object.assign({}, this.settings.goals, { [l.key]: v });
              WorkoutStorage.saveSettings(this.settings);
              this.renderTrophyRoom();
            }
          });
          box.appendChild(row);
        });
      }

      esc(str) {
        return String(str).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
      }

      renderLibraryView() {
        const q = (document.getElementById("lib-search").value || "").toLowerCase();
        const onlyData = document.getElementById("lib-only-data").checked;
        const map = new Map();
        const hasData = n => !!(this.prs[n] || (this.lastPerf[n] || []).length);
        const sameAs = n => { const c = PT.exCanon(n); return c && c.name !== n ? c : null; };
        (typeof EXERCISE_DATABASE !== "undefined" ? EXERCISE_DATABASE : []).forEach(e => map.set(e.name, { name: e.name, category: e.category || "", aka: e.aka }));
        (this.data.programs || []).forEach(p => (p.days || []).forEach(d => (d.exercises || []).forEach(e => {
          if (map.has(e.name)) return;
          const al = sameAs(e.name);
          if (al && !hasData(e.name)) return;     // just another name for something already listed
          map.set(e.name, { name: e.name, category: al ? al.category : "Program", same: al ? al.name : "" });
        })));
        Object.keys(this.prs).forEach(n => { if (!map.has(n)) { const al = sameAs(n); map.set(n, { name: n, category: al ? al.category : "Logged", same: al ? al.name : "" }); } });

        const all = [...map.values()];
        const withPR = all.filter(e => this.prs[e.name]).length;
        let list = all.filter(e => (!q || PT.exMatch(e, q)) && (!onlyData || this.prs[e.name] || this.lastPerf[e.name]));
        list.sort((a, b) => (this.prs[b.name] || 0) - (this.prs[a.name] || 0) || a.name.localeCompare(b.name));

        document.getElementById("lib-summary").innerText = all.length + " exercises · " + withPR + " with PRs · tap one for charts & notes";
        const box = document.getElementById("lib-list");
        box.innerHTML = list.length ? "" : '<p class="text-zinc-500 text-sm text-center pt-4">No exercises found.</p>';
        list.slice(0, 300).forEach(e => {
          const pr = this.prs[e.name];
          const sets = (this.lastPerf[e.name] || []).filter(x => x && x.tag !== "W");
          const top = sets.sort((a, b) => b.weight - a.weight)[0];
          const topTxt = top ? "Last: " + (top.min !== undefined ? PT.num(top.min, 1) + " min" : top.weight + "×" + top.reps) : "No sessions logged";
          const card = document.createElement("button");
          card.className = "w-full text-left bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex items-center justify-between tap-active hover:border-zinc-700 transition";
          card.addEventListener("click", () => this.openExerciseSheet(e.name));
          card.innerHTML = `
            <div class="pr-3 min-w-0">
              <span class="block text-sm font-bold text-white truncate">${this.esc(e.name)}</span>
              <span class="block text-[10px] text-zinc-500 uppercase mt-0.5">${this.esc(e.category)} · ${topTxt}${e.same ? " · same as " + this.esc(e.same) : ""}</span>
            </div>
            <div class="text-right flex-shrink-0">
              ${pr ? `<span class="block text-sm font-black font-mono text-amber-400">${pr} ${this.unit()}</span><span class="block text-[10px] text-zinc-500">est. 1RM</span>` : `<span class="text-xs text-zinc-600">—</span>`}
            </div>`;
          box.appendChild(card);
        });
      }

      animateOut(el, done) {
        if (!el) { done(); return; }
        el.style.maxHeight = el.offsetHeight + "px";
        el.style.overflow = "hidden";
        void el.offsetHeight; // force reflow so the transition starts from the real height
        el.classList.add("anim-exit");
        setTimeout(done, 240);
      }

      calculate1RM(weight, reps) {
        const w = parseFloat(weight);
        const r = parseFloat(reps);
        if (!w || !r || w <= 0 || r <= 0) return 0;
        if (r === 1) return w;
        return Math.round(w * (1 + r / 30));
      }

      renderWorkoutView() {
        if (!this.activeDay) return;
        this.dom.workoutDayBadge.innerText = this.weekBadge(this.activeProgram, this.activeDay);
        this.dom.workoutDayTitle.innerText = this.shortDayTitle(this.activeProgram, this.activeDay) || 'Workout';
        this.dom.exercisesList.innerHTML = "";

        const showLogger = this.settings.showLogger !== false;
        const exercisesList = this.activeDay.exercises || [];
        const ssLabels = this.supersetLabels(exercisesList);
        const wl = this.wLabel();

        if (!exercisesList.length) {
          const empty = document.createElement("div");
          empty.className = "bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center text-sm text-zinc-400";
          empty.innerHTML = this.activeProgram.id === FREESTYLE_ID ? "Empty workout. Add your first exercise below." : "No exercises in this day.";
          this.dom.exercisesList.appendChild(empty);
        }

        exercisesList.forEach((exercise, exIndex) => {
          const card = document.createElement("div");
          const ssLabel = ssLabels[exIndex];
          card.className = "bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5 space-y-2.5" + (ssLabel ? " border-l-4 border-l-purple-500" : "");
          card.setAttribute("data-ex-card", exIndex);

          let badgeColor = "bg-zinc-800 text-zinc-300 border-zinc-700";
          if (exercise.type === "tabata") badgeColor = "bg-rose-950/80 text-rose-300 border-rose-800/60";
          if (exercise.type === "superset") badgeColor = "bg-purple-950/80 text-purple-300 border-purple-800/60";
          if (exercise.type === "dtp") badgeColor = "bg-sky-950/80 text-sky-300 border-sky-800/60";
          if (exercise.type === "dropset") badgeColor = "bg-amber-950/80 text-amber-300 border-amber-800/60";

          const tabataLaunchBtn = exercise.type === "tabata" ? `
            <button class="btn-launch-tabata w-full py-2.5 px-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 tap-active mt-2" data-exindex="${exIndex}">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"/></svg>
              <span>Launch Tabata Timer (${exercise.workSeconds || 20}s / ${exercise.restSeconds || 10}s)</span>
            </button>
          ` : "";

          const notesCallout = exercise.notes ? `<p class="pt-note-line">${this.esc(exercise.notes)}</p>` : "";

          const isBar = /barbell|squat|deadlift|bench press|rack pull|hip thrust|military|good morning|pendlay|yates|ez-bar/i.test(exercise.name)
            && !/dumbbell|machine|cable|smith|goblet|kettlebell|leg press|hack|sissy|split/i.test(exercise.name);
          // Look up previous session history for this exercise
          const prevHistory = this.lastPerf[exercise.name] || [];
          const restSec = this.restFor(exercise);
          const kind = this.exKind(exercise);
          const wUnit = kind.bw ? (this.bwMode(exercise.name) === "assist" ? "−" : "+") + wl : wl;

          let setRowsHtml = "";
          for (let s = 0; s < (exercise.sets || 0); s++) {
            const key = this.getLogKey(this.activeProgram.id, this.activeDay.dayNumber, exercise.id, s);
            const logEntry = this.logs[key] || { completed: false, weight: "", reps: "", tag: "R" };
            const isCompleted = logEntry.completed;
            const currentTag = logEntry.tag || "R";

            let tagBadge = "bg-zinc-800 text-zinc-300 border-zinc-700";
            if (currentTag === "W") tagBadge = "bg-amber-950/90 text-amber-300 border-amber-800/60";
            if (currentTag === "D") tagBadge = "bg-purple-950/90 text-purple-300 border-purple-800/60";
            if (currentTag === "F") tagBadge = "bg-rose-950/90 text-rose-300 border-rose-800/60";

            const calculated1RM = this.liveE1rm(exercise, logEntry);
            const prevBest1RM = this.prs[exercise.name] || 0;
            const isPR = isCompleted && currentTag !== "W" && calculated1RM > 0 && calculated1RM >= prevBest1RM;

            const prevSet = prevHistory[s] || null;
            const prevHint = prevSet ? (kind.cardio ? `${prevSet.min || 0} min` : `${prevSet.bz && !(parseFloat(prevSet.weight) > 0) ? "BW" : prevSet.weight}×${prevSet.reps}`) : ``;

            const inputsHtml = showLogger && kind.cardio ? this.cardioInputsHtml(key, logEntry, prevSet, kind) : showLogger ? `
              <div class="flex items-center space-x-1.5 flex-grow justify-end pr-2">
                ${prevHint ? `<span class="text-[10px] text-zinc-500 font-mono hidden sm:inline">Prev: ${prevHint}</span>` : ''}
                <div class="flex items-center space-x-1">
                  <input type="number" inputmode="decimal" placeholder="${prevSet ? (prevSet.bz && !(parseFloat(prevSet.weight) > 0) ? "BW" : prevSet.weight) : (kind.bw ? "0" : "–")}" value="${logEntry.weight || ''}" 
                    data-key="${key}" data-field="weight" 
                    class="input-set-field w-14 bg-zinc-950 border border-zinc-800 rounded px-1.5 py-1.5 text-right font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500">
                  <span class="text-zinc-500 text-[10px]">${wUnit}</span>
                </div>
                <div class="flex items-center space-x-1">
                  <input type="number" inputmode="numeric" placeholder="${prevSet ? prevSet.reps : (exercise.reps || 'reps')}" value="${logEntry.reps || ''}" 
                    data-key="${key}" data-field="reps" 
                    class="input-set-field w-11 bg-zinc-950 border border-zinc-800 rounded px-1.5 py-1.5 text-right font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500">
                  <span class="text-zinc-500 text-[10px]">reps</span>
                </div>
              </div>
            ` : `
              <div class="flex-grow text-right pr-4 text-zinc-400 font-mono text-xs">
                ${exercise.reps ? `<span class="text-zinc-500">Target:</span> ${exercise.reps}` : ''}
              </div>
            `;

            setRowsHtml += `
              <div class="set-row border-b border-zinc-800/50 last:border-b-0 text-xs" data-set-index="${s}">
                <div class="flex items-center justify-between py-1.5">
                <div class="flex items-center space-x-1.5 flex-shrink-0">
                  <button class="btn-cycle-tag px-1.5 py-0.5 rounded border text-[10px] font-bold tap-active ${tagBadge}" 
                    data-key="${key}" title="Tap to toggle Warm-up/Drop/Failure">
                    ${currentTag}
                  </button>
                  <span class="font-bold ${isCompleted ? 'text-emerald-400' : 'text-zinc-400'}">S${s + 1}</span>
                  ${isPR ? `<span class="px-1 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-700/60 font-black text-[9px] pr-glow-badge">PR</span>` : ''}
                </div>
                ${inputsHtml}
                <button aria-label="Mark set done" class="btn-check-set w-9 h-9 rounded-xl flex items-center justify-center border transition tap-active flex-shrink-0 ${isCompleted ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:text-zinc-300'}" 
                  data-key="${key}" data-rest="${restSec}" data-completed="${isCompleted ? '1' : '0'}" data-exname="${this.esc(exercise.name)}">
                  <svg class="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                </button>
              </div>
                <div class="plate-viz flex flex-wrap items-center gap-1 pb-1.5 pl-1" data-plates-for="${key}" data-bar="${isBar ? 1 : 0}">${isBar ? this.plateRowHtml(logEntry.weight) : ''}</div>
              </div>
            `;
          }

          const headerColumns = showLogger ? `
            <div class="flex items-center justify-between text-[10px] uppercase font-bold text-zinc-500 pb-1 px-1">
              <span>Set (Tag)</span>
              <span class="pr-10">${this.colLabel(exercise, kind)}</span>
              <span>Status</span>
            </div>
          ` : `
            <div class="flex items-center justify-between text-[10px] uppercase font-bold text-zinc-500 pb-1 px-1">
              <span>Set (Tag)</span>
              <span>Mark Done</span>
            </div>
          `;

          card.innerHTML = `
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-1.5">
                  ${ssLabel ? `<span class="px-2 py-0.5 rounded bg-purple-600 text-white text-[10px] font-black">${ssLabel}</span>` : ""}
                  ${exercise.type && exercise.type !== "standard" ? `<span class="px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wide ${badgeColor}">${this.esc(exercise.type)}</span>` : ""}
                  <button class="btn-rest-edit whitespace-nowrap text-[11px] text-zinc-400 font-mono px-1.5 py-0.5 rounded-md bg-zinc-800/80 border border-zinc-700/60 tap-active" data-exindex="${exIndex}" title="Change rest time" aria-label="Rest ${PT.fmtRest(restSec)}, tap to change">Rest ${PT.fmtRest(restSec)} ✎</button>
                </div>
                <button class="btn-ex-info block text-left mt-1 tap-active" data-exindex="${exIndex}" title="Charts, records &amp; notes">
                  <span class="text-base font-bold text-white">${this.esc(exercise.name)}</span>
                  <svg class="inline w-3.5 h-3.5 ml-0.5 -mt-0.5 text-zinc-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 19h16M7 15l3-4 3 2 4-6"/></svg>
                </button>
                <div class="flex items-center gap-2 mt-0.5"><p class="text-xs text-zinc-400 font-medium">${exercise.sets} ${parseInt(exercise.sets, 10) === 1 ? "Set" : "Sets"} × ${this.esc(exercise.reps || 'Intervals')}</p>${PT.cueLinkHtml ? PT.cueLinkHtml(exercise.name) : ""}</div>
              </div>
              <div class="flex items-center space-x-1 flex-shrink-0">
                ${exIndex < exercisesList.length - 1 ? `<button class="btn-link-ex p-2 rounded-xl tap-active ${exercise.link ? "bg-purple-600 text-white" : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200"}" data-exindex="${exIndex}" title="${exercise.link ? "Unlink superset" : "Superset with next exercise"}" aria-label="Superset with next exercise">
                  <svg class="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
                </button>` : ""}
                <!-- Swap Exercise Button -->
                <button class="btn-swap-ex p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 rounded-xl tap-active" data-exindex="${exIndex}" title="Swap Exercise">
                  <svg class="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
                </button>
                <!-- Delete Exercise Button -->
                <button class="btn-delete-ex p-2 bg-zinc-800 hover:bg-rose-900/80 text-zinc-400 hover:text-rose-400 rounded-xl tap-active" data-exindex="${exIndex}" title="Delete Exercise">
                  <svg class="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
            </div>
            ${notesCallout}
            ${this.workoutCardExtrasHtml(exercise, exIndex)}
            ${this.kindBarHtml(exercise, exIndex)}
            ${tabataLaunchBtn}
            <div class="pt-2 border-t border-zinc-800/80">
              ${headerColumns}
              <div class="space-y-0.5">
                ${setRowsHtml}
              </div>
              <!-- Dynamic Add / Remove Set Row Buttons -->
              <div class="flex items-center justify-end space-x-2 pt-2.5 border-t border-zinc-800/50 text-xs">
                <div class="mr-auto flex flex-wrap items-center gap-1.5">
                  <button class="btn-rest-ex px-2.5 py-1 bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 font-semibold rounded-lg tap-active" data-rest="${restSec}">⏱ ${PT.fmtRest(restSec)}</button>
                  ${showLogger && (this.lastPerf[exercise.name] || []).length ? `<button class="btn-copy-last px-2 py-1 bg-zinc-800/70 text-zinc-300 font-semibold rounded-lg tap-active" data-exindex="${exIndex}" title="Fill weights and reps from last time">↺ Last</button>` : ""}
                  ${this.exNotes[exercise.name] ? "" : `<button class="btn-note-ex px-2 py-1 bg-zinc-800/70 text-zinc-300 font-semibold rounded-lg tap-active" data-exindex="${exIndex}" title="Add a note for this exercise">📝</button>`}
                  ${/squat|bench press|deadlift/i.test(exercise.name) && exercise.type !== "tabata" ? `<button class="btn-warmup px-2 py-1 bg-amber-950/60 border border-amber-800/60 text-amber-300 font-semibold rounded-lg tap-active" data-exindex="${exIndex}">🔥 Warm-up</button>` : ''}
                </div>
                <button class="btn-remove-set px-2 py-1 bg-zinc-800/70 hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 rounded-lg tap-active" data-exindex="${exIndex}" aria-label="Remove set">
                  − Set
                </button>
                <button class="btn-add-set px-2.5 py-1 bg-zinc-800/70 hover:bg-zinc-800 text-zinc-300 hover:text-emerald-400 font-semibold rounded-lg tap-active" data-exindex="${exIndex}" aria-label="Add set">
                  + Set
                </button>
              </div>
            </div>
          `;

          this.dom.exercisesList.appendChild(card);
        });

        // Add "Add Exercise" Card at the bottom
        const addCard = document.createElement("div");
        addCard.className = "pt-1 pb-2";
        addCard.innerHTML = `
          <button id="btn-add-exercise" class="w-full py-4 border-2 border-dashed border-zinc-700/80 hover:border-emerald-500 hover:bg-emerald-950/20 text-zinc-400 hover:text-emerald-400 font-bold rounded-2xl flex items-center justify-center space-x-2 tap-active transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
            <span>Add Exercise to Day ${this.activeDay.dayNumber || ''}</span>
          </button>
        `;
        this.dom.exercisesList.appendChild(addCard);

        if (this.pendingEnter) {
          const { exIndex, setIndex } = this.pendingEnter;
          this.pendingEnter = null;
          const row = this.dom.exercisesList.querySelector(`[data-ex-card="${exIndex}"] .set-row[data-set-index="${setIndex}"]`);
          if (row) row.classList.add("anim-enter");
        }


        this.bindWorkoutInteractiveEvents();
      }

      bindWorkoutInteractiveEvents() {
        // Set Checkoff
        this.dom.exercisesList.querySelectorAll(".btn-check-set").forEach(btn => {
          btn.addEventListener("click", () => {
            const key = btn.dataset.key;
            const rest = parseInt(btn.dataset.rest, 10);
            const exName = btn.dataset.exname;
            const isCurrentlyCompleted = btn.dataset.completed === "1";

            if (!this.logs[key]) {
              this.logs[key] = { completed: false, weight: "", reps: "", tag: "R" };
            }

            this.logs[key].completed = !isCurrentlyCompleted;
            WorkoutStorage.saveLogs(this.logs);

            // Log activity to calendar history
            const today = (this.sessionStartTime && this.sessionStartTime <= Date.now() && Date.now() - this.sessionStartTime < 10 * 3600 * 1000) ? new Date(this.sessionStartTime) : new Date();
            const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            this.history = WorkoutStorage.logDayActivity(todayStr, !isCurrentlyCompleted);
            this.renderCalendar();
            this.updateDrawerStatus();

            if (!isCurrentlyCompleted) {
              sound.shortBeep();

              // Check and update PR for this exercise
              const calculated1RM = this.liveE1rm(exName, this.logs[key]);
              if (calculated1RM > (this.prs[exName] || 0) && this.logs[key].tag !== "W") {
                this.prs[exName] = calculated1RM;
                WorkoutStorage.savePRs(this.prs);
              }
              this.autoRestAfterSet(key, rest);
            }

            this.renderWorkoutView();
          });
        });

        // Set Tag Toggle (R -> W -> D -> F)
        this.dom.exercisesList.querySelectorAll(".btn-cycle-tag").forEach(btn => {
          btn.addEventListener("click", () => {
            const key = btn.dataset.key;
            if (!this.logs[key]) {
              this.logs[key] = { completed: false, weight: "", reps: "", tag: "R" };
            }
            const currentTag = this.logs[key].tag || "R";
            const tagCycle = { "R": "W", "W": "D", "D": "F", "F": "R" };
            this.logs[key].tag = tagCycle[currentTag] || "R";
            WorkoutStorage.saveLogs(this.logs);
            this.renderWorkoutView();
          });
        });

        // Input Fields
        this.dom.exercisesList.querySelectorAll(".input-set-field").forEach(input => {
          input.addEventListener("input", () => {
            const key = input.dataset.key;
            const field = input.dataset.field;
            if (!this.logs[key]) {
              this.logs[key] = { completed: false, weight: "", reps: "", tag: "R" };
            }
            this.logs[key][field] = input.value;
            if (field === "weight") {
              const viz = this.dom.exercisesList.querySelector(`[data-plates-for="${key}"]`);
              if (viz && viz.dataset.bar === "1") viz.innerHTML = this.plateRowHtml(input.value);
            }
            WorkoutStorage.saveLogs(this.logs);
          });
        });

        // Tabata Launch
        this.dom.exercisesList.querySelectorAll(".btn-launch-tabata").forEach(btn => {
          btn.addEventListener("click", () => {
            const index = parseInt(btn.dataset.exindex, 10);
            const exercise = this.activeDay.exercises[index];
            this.tabata.open(exercise);
          });
        });

        // Add Set
        this.dom.exercisesList.querySelectorAll(".btn-add-set").forEach(btn => {
          btn.addEventListener("click", () => {
            const index = parseInt(btn.dataset.exindex, 10);
            const newSets = this.changeSets(this.activeDay.exercises[index], 1);
            this.pendingEnter = { exIndex: index, setIndex: newSets - 1 };
            WorkoutStorage.setData(this.data);
            this.renderWorkoutView();
          });
        });

        // Remove Set
        this.dom.exercisesList.querySelectorAll(".btn-remove-set").forEach(btn => {
          btn.addEventListener("click", () => {
            const index = parseInt(btn.dataset.exindex, 10);
            if (this.animating) return;
            if (this.activeDay.exercises[index].sets > 1) {
              const rows = this.dom.exercisesList.querySelectorAll(`[data-ex-card="${index}"] .set-row`);
              this.animating = true;
              this.animateOut(rows[rows.length - 1], () => {
                this.changeSets(this.activeDay.exercises[index], -1);
                WorkoutStorage.setData(this.data);
                this.animating = false;
                this.renderWorkoutView();
              });
            }
          });
        });

        // Swap Exercise from Database
        this.dom.exercisesList.querySelectorAll(".btn-swap-ex").forEach(btn => {
          btn.addEventListener("click", () => {
            const index = parseInt(btn.dataset.exindex, 10);
            this.openExerciseSelector('swap', index);
          });
        });

        // Delete Exercise
        this.dom.exercisesList.querySelectorAll(".btn-delete-ex").forEach(btn => {
          btn.addEventListener("click", async () => {
            const index = parseInt(btn.dataset.exindex, 10);
            const current = this.activeDay.exercises[index];
            if (this.animating) return;
            if (await PT.confirm(`Remove "${current.name}" from this workout?`)) {
              this.animating = true;
              const cardEl = this.dom.exercisesList.querySelector(`[data-ex-card="${index}"]`);
              this.animateOut(cardEl, () => {
                const removed = this.activeDay.exercises.splice(index, 1)[0];
                if (removed) {
                  (this.activeDay.removed = this.activeDay.removed || []).push({ ex: JSON.parse(JSON.stringify(removed)), idx: index });
                }
                WorkoutStorage.setData(this.data);
                this.animating = false;
                this.renderWorkoutView();
              });
            }
          });
        });
        // Manual rest timer button
        this.dom.exercisesList.querySelectorAll(".btn-rest-ex").forEach(btn => {
          btn.addEventListener("click", () => this.restTimer.start(parseInt(btn.dataset.rest, 10) || 60));
        });
        // Warm-up generator
        this.dom.exercisesList.querySelectorAll(".btn-warmup").forEach(btn => {
          btn.addEventListener("click", () => this.generateWarmups(parseInt(btn.dataset.exindex, 10)));
        });

        // Swipe gestures
        this.bindSwipe();
        this.bindWorkoutExtras();
        this.bindWorkoutV3();
        this.bindWorkoutV4();


        // Add New Exercise
        const btnAddEx = document.getElementById("btn-add-exercise");
        if (btnAddEx) {
          btnAddEx.addEventListener("click", () => {
            this.openExerciseSelector('add');
          });
        }
      }

      finishWorkout() {
        this.finishWorkoutV2();
      }

      getLogKey(progId, dayNum, exId, setIndex) {
        return `${progId}_d${dayNum}_${exId}_s${setIndex}`;
      }

      // ----- Reset a day to exactly how the program has it -----
      // The "original" of a day is: the version in programs.js (built-in programs), the copy saved
      // when the program was imported / built / saved from a workout (day.orig), or for older data
      // a best guess from the change markers (origName, origSets, added, day.removed).
      builtinDay(prog, day) {
        const bp = (typeof BUILTIN_PROGRAMS !== "undefined" && Array.isArray(BUILTIN_PROGRAMS)) ? BUILTIN_PROGRAMS.find(x => x.id === prog.id) : null;
        const bd = bp && (bp.days || []).find(d => d.dayNumber === day.dayNumber);
        return bd && Array.isArray(bd.exercises) && bd.exercises.length ? bd : null;
      }

      isAddedExercise(ex) {
        return !!ex && (ex.added === true || /^custom_\d+$/.test(String(ex.id || "")));
      }

      cleanExercise(ex) {
        const c = JSON.parse(JSON.stringify(ex));
        if (c.origName) c.name = c.origName;
        if (c.origSets) c.sets = c.origSets;
        delete c.origName; delete c.origSets; delete c.added;
        return c;
      }

      guessOriginal(day) {
        const list = (day.exercises || []).filter(e => !this.isAddedExercise(e)).map(e => this.cleanExercise(e));
        (Array.isArray(day.removed) ? day.removed : []).slice().sort((a, b) => a.idx - b.idx).forEach(r => {
          if (r && r.ex && !this.isAddedExercise(r.ex) && !list.some(e => e.id === r.ex.id)) {
            list.splice(Math.min(r.idx, list.length), 0, this.cleanExercise(r.ex));
          }
        });
        return list;
      }

      originalExercises(prog, day) {
        const bd = this.builtinDay(prog, day);
        if (bd) return bd.exercises;
        if (Array.isArray(day.orig) && day.orig.length) return day.orig;
        return this.guessOriginal(day);
      }

      // Change how many sets an exercise has, remembering the program's number the first time.
      changeSets(ex, delta) {
        const cur = parseInt(ex.sets, 10) || 0;
        if (ex.origSets === undefined) ex.origSets = cur;
        ex.sets = Math.max(1, cur + delta);
        if (ex.sets === ex.origSets) delete ex.origSets;
        return ex.sets;
      }

      // One-time for programs saved before 2.1.1: remember each day's original now,
      // so later changes (extra sets, added exercises) can always be undone.
      snapshotOriginals() {
        let changed = false;
        ((this.data && this.data.programs) || []).forEach(p => {
          if (!p || p.id === FREESTYLE_ID) return;
          (p.days || []).forEach(d => {
            if (!d || (Array.isArray(d.orig) && d.orig.length) || this.builtinDay(p, d)) return;
            const g = this.guessOriginal(d);
            if (g.length) { d.orig = g; changed = true; }
          });
        });
        if (changed) WorkoutStorage.setData(this.data);
      }

      // Put the day back exactly as the program has it. Returns true if anything changed.
      // Freestyle workouts have no original, so their exercises are left alone.
      restoreDay(prog, day) {
        day.exercises = day.exercises || [];
        if (prog.id === FREESTYLE_ID) return false;
        const before = JSON.stringify(day.exercises);
        let orig = JSON.parse(JSON.stringify(this.originalExercises(prog, day)));
        let changed = false;
        if (orig.length) {
          if (!this.builtinDay(prog, day) && !(Array.isArray(day.orig) && day.orig.length)) day.orig = JSON.parse(JSON.stringify(orig));
          day.exercises = orig;
          changed = JSON.stringify(day.exercises) !== before;
        }
        if (day.removed) { delete day.removed; changed = true; }
        return changed;
      }

      // Removes every logged set for the day's exercises (and any deleted ones), whatever the set number.
      clearDayLogs(prog, day) {
        const ids = new Set((day.exercises || []).map(ex => String(ex.id)));
        (Array.isArray(day.removed) ? day.removed : []).forEach(r => { if (r && r.ex) ids.add(String(r.ex.id)); });
        const pre = `${prog.id}_d${day.dayNumber}_`;
        Object.keys(this.logs || {}).forEach(k => {
          if (!k.startsWith(pre)) return;
          const m = k.slice(pre.length).match(/^(.*)_s\d+$/);
          if (m && ids.has(m[1])) delete this.logs[k];
        });
        if (this.dayNotes && this.dayNotes[`${prog.id}_d${day.dayNumber}`] !== undefined) {
          delete this.dayNotes[`${prog.id}_d${day.dayNumber}`];
          PT.save(STORAGE_KEY_DAYNOTES, this.dayNotes);
        }
      }

      async resetActiveDayLogs() {
        const prog = this.activeProgram, day = this.activeDay;
        if (!prog || !day) return;
        const msg = prog.id === FREESTYLE_ID
          ? "Clear all logged sets in this workout? Saved workouts in History and your PRs are kept."
          : "Clear logged sets and put this day back exactly as the program has it?\n\n• Swapped or deleted exercises come back\n• Exercises and sets you added are removed\n\nSaved workouts in History and your PRs are kept.";
        if (!await PT.confirm(msg)) return;
        this.clearDayLogs(prog, day);             // logs of what's on screen now (incl. added exercises/sets)
        const changed = this.restoreDay(prog, day);
        this.clearDayLogs(prog, day);             // and of the restored originals
        WorkoutStorage.saveLogs(this.logs);
        if (changed) WorkoutStorage.setData(this.data);
        this.renderWorkoutView();
      }

      async resetWholeProgram() {
        if (!this.activeProgram) return;
        if (!await PT.confirm(`Reset ALL days in "${this.activeProgram.title}"? This clears every logged set, puts every day back exactly as the program has it (swapped or deleted exercises come back, exercises and sets you added are removed), and marks this week's days as not done. Saved workouts in History, PRs and the calendar are kept.`)) return;
        let changed = false;
        (this.activeProgram.days || []).forEach(day => {
          this.clearDayLogs(this.activeProgram, day);
          if (this.restoreDay(this.activeProgram, day)) changed = true;
          this.clearDayLogs(this.activeProgram, day);
        });
        WorkoutStorage.saveLogs(this.logs);
        if (changed) WorkoutStorage.setData(this.data);
        if (this.progState && this.progState[this.activeProgram.id]) { this.progState[this.activeProgram.id].done = []; this.saveProgState(); }
        this.activeDay = this.nextDayOf(this.activeProgram) || this.activeDay;
        this.renderDaysView();
      }

      openSettings() {
        this.dom.toggleLogger.checked = this.settings.showLogger !== false;
        document.getElementById("setting-toggle-voice").checked = this.settings.voice !== false;
        document.getElementById("setting-toggle-sound").checked = this.settings.sound !== false;
        this.renderSettingsExtras();
        this.applyTheme();
        this.dom.modalSettings.classList.remove("hidden");
      }

      closeSettings() {
        this.dom.modalSettings.classList.add("hidden");
      }

      async resetDefaults() {
        if (!await PT.confirm("Reset EVERYTHING back to factory defaults?\n\nThis deletes your programs' changes, saved workouts, PRs, body stats, progress photos and calendar. Settings like theme and units are kept.\n\nExport a backup first if you're not sure.")) return;
        if (!await PT.confirm("Last check: this can't be undone. Reset now?")) return;
        WorkoutStorage.resetDefaults();
        const done = () => location.reload();
        try { PhotoDB.clear().then(done, done); } catch (e) { done(); }
      }
    }

    // Start once the page is ready AND the no-limit storage has loaded its saved data
    Promise.all([PTLS.ready, new Promise(r => { if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", r); else r(); })])
      .then(() => { window.app = new ApplicationUI(); });
  