
    /* =====================================================================
     * PulseTrack 2 — history, analytics, backup, body tracking, sharing.
     * Everything here extends ApplicationUI and stores data on this device only.
     * ===================================================================== */
    const APP_VERSION = "{{VERSION}}";
    // the menu footer (bottom left of the side menu) shows the real version
    try { const dv = document.getElementById("drawer-version"); if (dv) dv.textContent = "v" + APP_VERSION; } catch (e) {}
    const BACKUP_SCHEMA = 2;
    const STORAGE_KEY_SESSIONS = "pulsetrack_sessions_v1";
    const STORAGE_KEY_BODY = "pulsetrack_body_v1";
    const STORAGE_KEY_EXNOTES = "pulsetrack_exnotes_v1";
    const STORAGE_KEY_DAYNOTES = "pulsetrack_daynotes_v1";
    const STORAGE_KEY_PROGSTATE = "pulsetrack_progstate_v1";
    const STORAGE_KEY_PRBASE = "pulsetrack_prbase_v1";
    const STORAGE_KEY_SESSION_START = "pulsetrack_session_start_v1";
    const KG_PER_LB = 0.45359237;
    const FREESTYLE_ID = "freestyle";
    const MUSCLE_ORDER = ["Chest", "Back", "Legs", "Shoulders", "Biceps", "Triceps", "Traps", "Forearms", "Core", "Cardio", "Other"];

    // Android/desktop Chrome fire this early, sometimes before the app object exists.
    window.__ptInstallEvent = null;
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      window.__ptInstallEvent = e;
      if (window.app && window.app.refreshInstallUI) window.app.refreshInstallUI();
    });

    const PT = {
      load(key, fallback) {
        try {
          const v = PTLS.getItem(key);
          if (v === null || v === undefined) return fallback;
          const parsed = JSON.parse(v);
          return parsed === null ? fallback : parsed;
        } catch (e) { return fallback; }
      },
      save(key, val) { return safeSetItem(key, JSON.stringify(val)); },
      uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); },
      ds(d = new Date()) {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      },
      fromDs(s) {
        const p = String(s || "").split("-").map(Number);
        return (p.length === 3 && p.every(n => !isNaN(n))) ? new Date(p[0], p[1] - 1, p[2]) : new Date(NaN);
      },
      /** 0 = Sunday, 1 = Monday. "auto" follows the phone's region (US/Canada: Sunday). */
      firstDay() {
        let p = PT._wsPref;
        if (p === undefined) {
          try { p = (WorkoutStorage.getSettings() || {}).weekStart; } catch (e) { p = null; }
          PT._wsPref = p = (p === "mon" || p === "sun") ? p : "auto";
        }
        if (p === "sun") return 0;
        if (p === "mon") return 1;
        const lang = (typeof navigator !== "undefined" && navigator.language) || "en-US";
        try {
          const l = new Intl.Locale(lang), wi = l.getWeekInfo ? l.getWeekInfo() : l.weekInfo;
          if (wi && wi.firstDay) return wi.firstDay % 7;
        } catch (e) { }
        const reg = String(lang.split("-")[1] || "").toUpperCase();
        if (!reg && /^en$/i.test(lang)) return 0;
        return ["US", "CA", "MX", "BR", "JP", "KR", "PH", "TW", "IL", "AU", "ZA", "IN", "CO", "PE", "VE", "HK"].includes(reg) ? 0 : 1;
      },
      weekStart(date) {
        const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        d.setDate(d.getDate() - ((d.getDay() - PT.firstDay() + 7) % 7));
        return d;
      },
      /** "Sun Oct 5 to Sat Oct 11" style text for the This week / Last week / 4-wk avg buttons */
      weekRangeText(mode) {
        const ws = PT.weekStart(new Date());
        const add = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
        const f = d => d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
        if (mode === "last") return `${f(add(ws, -7))} to ${f(add(ws, -1))}`;
        if (mode === "avg") return `The 4 full weeks before this one: ${f(add(ws, -28))} to ${f(add(ws, -1))}`;
        return `${f(ws)} to now (your week starts on ${ws.toLocaleDateString(undefined, { weekday: "long" })})`;
      },
      e1rm(w, r) {
        w = parseFloat(w); r = parseFloat(r);
        if (!(w > 0) || !(r > 0)) return 0;
        return r === 1 ? w : Math.round(w * (1 + r / 30));
      },
      num(n, dp = 1) {
        const f = Math.pow(10, dp);
        return (Math.round((parseFloat(n) || 0) * f) / f).toLocaleString();
      },
      esc(s) {
        return String(s === null || s === undefined ? "" : s)
          .replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
      },
      fmtDate(ds, opts) {
        const d = PT.fromDs(ds);
        return isNaN(d) ? String(ds) : d.toLocaleDateString(undefined, opts || { month: "short", day: "numeric", year: "numeric" });
      },
      fmtDur(sec) {
        sec = Math.max(0, Math.round(parseFloat(sec) || 0));
        const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60);
        return h ? `${h}h ${m}m` : `${m}m ${sec % 60}s`;
      },
      csvCell(v) {
        const s = String(v === null || v === undefined ? "" : v);
        return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
      },
      b64urlEncode(str) {
        const bytes = new TextEncoder().encode(str);
        let bin = "";
        for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
        return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
      },
      b64urlDecode(s) {
        s = String(s).replace(/-/g, "+").replace(/_/g, "/");
        while (s.length % 4) s += "=";
        const bin = atob(s);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        return new TextDecoder().decode(bytes);
      },
      isIOS() {
        return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
      },
      isStandalone() {
        return (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true;
      },
      accent(alpha) {
        const v = getComputedStyle(document.documentElement).getPropertyValue("--a500").trim() || "16 185 129";
        const [r, g, b] = v.split(/\s+/).map(Number);
        return alpha === undefined ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${alpha})`;
      },
      _catMap: null,
      category(name) {
        if (!PT._catMap) {
          PT._catMap = new Map();
          (typeof EXERCISE_DATABASE !== "undefined" && Array.isArray(EXERCISE_DATABASE) ? EXERCISE_DATABASE : [])
            .forEach(e => PT._catMap.set(String(e.name).toLowerCase(), e.category || "Other"));
        }
        const n = String(name || "").toLowerCase();
        if (PT._catMap.has(n)) return PT._catMap.get(n);
        const rules = [
          ["Cardio", /\brun|treadmill|bike|cycling|rowing machine|\berg\b|cardio|jump|burpee|sprint|stair|elliptical|hiit|tabata|sled|battle rope|skierg|walk(?!ing lunge)/],
          ["Core", /\babs?\b|crunch|plank|sit-?up|russian twist|\bcore\b|leg raise|knee raise|knee-up|woodchop|ab wheel|rollout|v-up|dead bug|hollow|dragon flag|pallof|leg tuck|oblique/],
          ["Forearms", /wrist|forearm|grip|reverse curl|zottman|plate pinch|dead hang/],
          ["Legs", /squat|leg press|leg ext|leg curl|lunge|calf|calves|hamstring|glute|hip thrust|\brdl\b|romanian|stiff|step-?up|quad|abduct|adduct|good morning|pull-?through|nordic/],
          ["Triceps", /tricep|skull|pushdown|push-down|kickback|jm press|close-?grip bench|overhead extension|diamond push/],
          ["Traps", /shrug|farmer/],
          ["Back", /row|pull-?up|pulldown|pull-?down|chin-?up|\blat\b|deadlift|rack pull|back ext|hyperext|pullover/],
          ["Chest", /bench|chest|\bpec|fly|flye|push-?up|crossover|\bdips?\b/],
          ["Shoulders", /shoulder|overhead|military|lateral|\bdelt|arnold|face pull|upright|front raise|rear raise|press/],
          ["Biceps", /curl|bicep/]
        ];
        for (const [cat, re] of rules) if (re.test(n)) return cat;
        return "Other";
      },
      lineChart(series, opts = {}) {
        const all = [];
        series.forEach(s => (s.points || []).forEach(p => { if (isFinite(p.x) && isFinite(p.y)) all.push(p); }));
        if (!all.length) return `<div class="h-28 flex items-center justify-center text-xs text-zinc-500 text-center px-6">${PT.esc(opts.empty || "No data yet")}</div>`;
        const W = 320, H = 170, padL = 38, padR = 10, padT = 10, padB = 22;
        let xMin = Math.min(...all.map(p => p.x)), xMax = Math.max(...all.map(p => p.x));
        let yMin = Math.min(...all.map(p => p.y)), yMax = Math.max(...all.map(p => p.y));
        if (xMin === xMax) { xMin -= 86400000; xMax += 86400000; }
        if (yMin === yMax) { yMin -= Math.max(1, Math.abs(yMin) * 0.05); yMax += Math.max(1, Math.abs(yMax) * 0.05); }
        const pad = (yMax - yMin) * 0.12;
        yMin -= pad; yMax += pad;
        if (opts.zeroFloor && yMin < 0) yMin = 0;
        const X = x => padL + ((x - xMin) / (xMax - xMin)) * (W - padL - padR);
        const Y = y => padT + (1 - (y - yMin) / (yMax - yMin)) * (H - padT - padB);
        const dp = (yMax - yMin) < 10 ? 1 : 0;
        let g = "";
        for (let i = 0; i <= 3; i++) {
          const yv = yMin + ((yMax - yMin) * i) / 3, yy = Y(yv).toFixed(1);
          g += `<line x1="${padL}" x2="${W - padR}" y1="${yy}" y2="${yy}" style="stroke:rgb(var(--z800))" stroke-width="1"/>`;
          g += `<text x="${padL - 5}" y="${(+yy + 3).toFixed(1)}" text-anchor="end" font-size="9" style="fill:rgb(var(--z500))">${PT.num(yv, dp)}</text>`;
        }
        const dl = t => new Date(t).toLocaleDateString(undefined, { month: "short", day: "numeric" });
        g += `<text x="${padL}" y="${H - 6}" font-size="9" style="fill:rgb(var(--z500))">${PT.esc(dl(xMin))}</text>`;
        g += `<text x="${W - padR}" y="${H - 6}" text-anchor="end" font-size="9" style="fill:rgb(var(--z500))">${PT.esc(dl(xMax))}</text>`;
        series.forEach(s => {
          const pts = (s.points || []).filter(p => isFinite(p.x) && isFinite(p.y)).sort((a, b) => a.x - b.x);
          if (!pts.length) return;
          const d = pts.map((p, i) => `${i ? "L" : "M"}${X(p.x).toFixed(1)},${Y(p.y).toFixed(1)}`).join(" ");
          g += `<path d="${d}" fill="none" style="stroke:${s.color}" stroke-width="${s.width || 2}" ${s.dash ? 'stroke-dasharray="4 3"' : ""} stroke-linejoin="round" stroke-linecap="round"/>`;
          if (s.dots !== false) pts.forEach(p => { g += `<circle cx="${X(p.x).toFixed(1)}" cy="${Y(p.y).toFixed(1)}" r="2.6" style="fill:${s.color}"/>`; });
        });
        return `<svg viewBox="0 0 ${W} ${H}" class="w-full h-auto" role="img" aria-label="${PT.esc(opts.label || "Chart")}">${g}</svg>`;
      }
    };

    /** Progress photos live in IndexedDB (far more room than localStorage). */
    const PhotoDB = {
      _db: null,
      open() {
        return new Promise((resolve, reject) => {
          if (this._db) return resolve(this._db);
          if (!("indexedDB" in window)) return reject(new Error("This browser cannot store photos."));
          const req = indexedDB.open("pulsetrack-photos", 1);
          req.onupgradeneeded = () => { if (!req.result.objectStoreNames.contains("photos")) req.result.createObjectStore("photos", { keyPath: "id" }); };
          req.onsuccess = () => { this._db = req.result; resolve(this._db); };
          req.onerror = () => reject(req.error);
        });
      },
      async _tx(mode, fn) {
        const db = await this.open();
        return new Promise((resolve, reject) => {
          const tx = db.transaction("photos", mode);
          const store = tx.objectStore("photos");
          let result;
          const r = fn(store);
          if (r) r.onsuccess = () => { result = r.result; };
          tx.oncomplete = () => resolve(result);
          tx.onerror = () => reject(tx.error);
          tx.onabort = () => reject(tx.error);
        });
      },
      all() { return this._tx("readonly", s => s.getAll()).then(r => r || []); },
      put(rec) { return this._tx("readwrite", s => s.put(rec)); },
      del(id) { return this._tx("readwrite", s => s.delete(id)); },
      clear() { return this._tx("readwrite", s => s.clear()); }
    };

    function ptCompressImage(file, max = 1280, quality = 0.8) {
      return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
          try {
            const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
            const w = Math.max(1, Math.round(img.naturalWidth * scale)), h = Math.max(1, Math.round(img.naturalHeight * scale));
            const c = document.createElement("canvas");
            c.width = w; c.height = h;
            c.getContext("2d").drawImage(img, 0, 0, w, h);
            URL.revokeObjectURL(url);
            c.toBlob(b => b ? resolve(b) : reject(new Error("Could not compress photo.")), "image/jpeg", quality);
          } catch (err) { URL.revokeObjectURL(url); reject(err); }
        };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Could not read that image.")); };
        img.src = url;
      });
    }

    Object.assign(ApplicationUI.prototype, {

      /* ------------------------------------------------------------------ setup */
      initExtras() {
        const arr = v => Array.isArray(v) ? v : [];
        const obj = v => (v && typeof v === "object" && !Array.isArray(v)) ? v : {};
        this.sessions = arr(PT.load(STORAGE_KEY_SESSIONS, []));
        this.body = arr(PT.load(STORAGE_KEY_BODY, []));
        this.exNotes = obj(PT.load(STORAGE_KEY_EXNOTES, {}));
        this.dayNotes = obj(PT.load(STORAGE_KEY_DAYNOTES, {}));
        this.progState = obj(PT.load(STORAGE_KEY_PROGSTATE, {}));
        if (PTLS.getItem(STORAGE_KEY_PRBASE) === null) {
          // First run of v2: keep every PR you already had as the starting point.
          this.prBase = Object.assign({}, this.prs);
          PT.save(STORAGE_KEY_PRBASE, this.prBase);
        } else {
          this.prBase = obj(PT.load(STORAGE_KEY_PRBASE, {}));
        }
        if (this.settings.unit !== "kg") this.settings.unit = "lb";
        this.selectedBarWeight = this.savedBar();
        sound.vibrateEnabled = this.settings.vibrate !== false;
        this.historyFilter = null;
        this.progressWeekMode = "this";
        this.progressMonth = new Date(); this.progressMonth.setDate(1);
        this.chartRange = "6m";
        this.chartMetric = "e1rm";
        this.bodyRange = "3m";
        this.photoSel = [];
        this.photoUrls = [];

        this.applyTextSize();
        this.applyUnitLabels();
        this.bindExtras();
        this.initV3();
        this.snapshotOriginals();
        this.initV4();
        this.setupPWA();
        this.checkImportHash();
      },

      unit() { return this.settings.unit === "kg" ? "kg" : "lb"; },
      wLabel() { return this.unit() === "kg" ? "kg" : "lbs"; },
      lenLabel() { return this.unit() === "kg" ? "cm" : "in"; },
      increment() {
        const v = parseFloat(this.settings.increment);
        return v > 0 ? v : (this.unit() === "kg" ? 2.5 : 5);
      },
      saveSessions() { return PT.save(STORAGE_KEY_SESSIONS, this.sessions); },
      saveProgState() { return PT.save(STORAGE_KEY_PROGSTATE, this.progState); },

      applyTextSize() {
        document.documentElement.style.fontSize = this.settings.largeText ? "112.5%" : "";
      },

      applyUnitLabels() {
        const kg = this.unit() === "kg";
        const lbl = document.getElementById("plate-target-label");
        if (lbl) lbl.innerText = `Target Weight (${this.wLabel()})`;
        const input = this.dom.plateTargetInput;
        if (input) { input.step = kg ? "2.5" : "5"; }
        const bars = BAR_PRESETS[this.unit()];
        const btns = this.dom.plateBarSelector ? this.dom.plateBarSelector.querySelectorAll(".btn-bar-select") : [];
        const isCustom = !bars.includes(this.selectedBarWeight);
        btns.forEach((b, i) => {
          const customBtn = i >= bars.length;
          if (customBtn) {
            b.dataset.bar = "custom";
            b.innerText = isCustom ? `${this.selectedBarWeight} ${this.unit()}` : "Other";
          } else {
            b.dataset.bar = bars[i];
            b.innerText = `${bars[i]} ${this.unit()}`;
          }
          const on = customBtn ? isCustom : bars[i] === this.selectedBarWeight;
          b.className = "btn-bar-select py-2 rounded-lg text-xs font-bold tap-active " + (on ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-400");
        });
        if (this.renderPlateInventory) this.renderPlateInventory();
        const adj = kg ? [-10, -2.5, 2.5, 10] : [-20, -5, 5, 20];
        document.querySelectorAll(".btn-plate-adjust").forEach((b, i) => {
          b.dataset.val = adj[i];
          b.innerText = (adj[i] > 0 ? "+" : "") + adj[i];
        });
      },

      /* ----------------------------------------------------------- bindings */
      bindExtras() {
        const on = (id, ev, fn) => { const el = document.getElementById(id); if (el) el.addEventListener(ev, fn); };

        // Home tiles
        on("tile-history", "click", () => { this.historyFilter = null; this.showView("history"); });
        on("tile-progress", "click", () => this.showView("progress"));
        on("tile-body", "click", () => this.showView("body"));
        on("tile-empty", "click", () => this.startEmptyWorkout());

        // Sheet + toast
        on("btn-close-sheet", "click", () => this.closeSheet());
        on("modal-sheet", "click", (e) => { if (e.target.id === "modal-sheet") this.closeSheet(); });
        on("pt-toast-action", "click", () => { const fn = this._toastAction; this.hideToast(); if (fn) fn(); });

        // History
        on("btn-history-csv", "click", () => this.exportCSV());

        // Programs view import
        on("btn-import-program", "click", () => document.getElementById("input-import-program").click());
        on("input-import-program", "change", (e) => {
          const f = e.target.files && e.target.files[0];
          e.target.value = "";
          if (f) this.importProgramFile(f);
        });

        // Workout note
        on("workout-day-note", "input", (e) => {
          if (!this.activeProgram || !this.activeDay) return;
          const k = `${this.activeProgram.id}_d${this.activeDay.dayNumber}`;
          if (e.target.value.trim()) this.dayNotes[k] = e.target.value; else delete this.dayNotes[k];
          PT.save(STORAGE_KEY_DAYNOTES, this.dayNotes);
        });

        // Summary share
        on("btn-share-summary", "click", () => this.shareSummaryImage());

        // Settings
        document.querySelectorAll(".btn-unit").forEach(b => b.addEventListener("click", () => this.changeUnit(b.dataset.unit)));
        on("setting-increment", "change", (e) => {
          const v = parseFloat(e.target.value);
          this.settings.increment = v > 0 ? v : "";
          WorkoutStorage.saveSettings(this.settings);
          e.target.value = this.increment();
        });
        on("setting-week-start", "change", (e) => {
          const v = e.target.value === "sun" || e.target.value === "mon" ? e.target.value : "auto";
          this.settings.weekStart = v;
          PT._wsPref = v;
          WorkoutStorage.saveSettings(this.settings);
          this.renderStreak();
          try { if (document.getElementById("view-progress") && !document.getElementById("view-progress").classList.contains("hidden")) this.renderProgressView(); } catch (err) { }
          try { this.renderHomeView(); } catch (err) { }
        });
        on("setting-weekly-goal", "change", (e) => {
          this.settings.weeklyGoal = parseInt(e.target.value, 10) || 3;
          WorkoutStorage.saveSettings(this.settings);
          this.renderStreak();
        });
        const toggle = (id, key, after) => on(id, "change", (e) => {
          this.settings[key] = e.target.checked;
          WorkoutStorage.saveSettings(this.settings);
          if (after) after(e.target.checked);
        });
        toggle("setting-toggle-resetfinish", "resetAfterFinish");
        toggle("setting-toggle-vibrate", "vibrate", v => { sound.vibrateEnabled = v; if (v) sound.vibrate(40); });
        toggle("setting-toggle-largetext", "largeText", () => this.applyTextSize());
        toggle("setting-toggle-restnotify", "restNotify", async (v) => {
          if (!v) return;
          if (!("Notification" in window)) { await PT.alert("This browser does not support notifications."); this.settings.restNotify = false; WorkoutStorage.saveSettings(this.settings); this.renderSettingsExtras(); return; }
          let perm = Notification.permission;
          if (perm === "default") { try { perm = await Notification.requestPermission(); } catch (err) { perm = "denied"; } }
          if (perm !== "granted") {
            await PT.alert("Notifications are blocked for PulseTrack. You can allow them in your phone's settings.");
            this.settings.restNotify = false; WorkoutStorage.saveSettings(this.settings);
          }
          this.renderSettingsExtras();
        });
        on("btn-export-backup", "click", () => this.exportBackup());
        on("btn-import-backup", "click", () => document.getElementById("input-import-backup").click());
        on("input-import-backup", "change", (e) => {
          const f = e.target.files && e.target.files[0];
          e.target.value = "";
          if (f) this.importBackup(f);
        });
        on("btn-export-csv", "click", () => this.exportCSV());
        on("btn-persist", "click", () => this.requestPersist(true));
        on("btn-rebuild-prs", "click", async () => {
          const pick = await PT.choose("Recalculate PRs", ["Recalculate and forget old PRs", "Recalculate, keep old PRs"], { title: "Recalculate your PRs?", body: "Your PRs are rebuilt from your saved workouts.\n\nForgetting old PRs also removes PRs from before workout history existed. Use it to get rid of a mistyped PR.", cancel: "Cancel" });
          if (pick < 0) return;
          const forget = pick === 0;
          if (forget) { this.prBase = {}; PT.save(STORAGE_KEY_PRBASE, this.prBase); }
          this.rebuildPRs();
          this.toast("PRs recalculated");
          this.renderSettingsExtras();
        });
        on("btn-install-app", "click", async () => {
          const ev = window.__ptInstallEvent;
          if (!ev) return;
          ev.prompt();
          try { await ev.userChoice; } catch (err) {}
          window.__ptInstallEvent = null;
          this.refreshInstallUI();
        });
        on("btn-check-update", "click", async () => {
          if (!("serviceWorker" in navigator)) { this.toast("Updates are not supported in this browser"); return; }
          try {
            const reg = await navigator.serviceWorker.getRegistration();
            if (reg) await reg.update();
            this.toast("Checked for updates. If a new version exists you'll see a banner.");
          } catch (err) { this.toast("Could not check for updates (offline?)"); }
        });

        // Timer + wake lock survive the app being backgrounded
        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState !== "visible") return;
          if (this.restTimer && this.restTimer.isRunning()) this.restTimer.tick();
          if (!this.dom.viewWorkout.classList.contains("hidden")) this.acquireWakeLock();
        });
      },

      /* ------------------------------------------------------------- views */
      showExtraView(name) {
        const titles = {
          history: ["Workout History", "Saved workouts"],
          progress: ["Progress", "Analytics & PRs"],
          body: ["Body & Photos", "Bodyweight, measurements, photos"],
          cardio: ["Cardio & Sports", "Separate from your lifting"]
        };
        document.getElementById("view-" + name).classList.remove("hidden");
        this.dom.backBtn.classList.remove("hidden");
        this.dom.headerTitle.innerText = titles[name][0];
        this.dom.headerBreadcrumb.innerText = titles[name][1];
        if (name === "history") this.renderHistoryView();
        if (name === "progress") this.renderProgressView();
        if (name === "body") this.renderBodyView();
        if (name === "cardio") this.renderCardioView();
      },

      openSheet(title, sub, bodyHtml, footerHtml) {
        document.getElementById("sheet-title").innerText = title || "";
        document.getElementById("sheet-sub").innerText = sub || "";
        const body = document.getElementById("sheet-body");
        body.innerHTML = bodyHtml || "";
        body.scrollTop = 0;
        const foot = document.getElementById("sheet-footer");
        foot.innerHTML = footerHtml || "";
        foot.classList.toggle("hidden", !footerHtml);
        document.getElementById("modal-sheet").classList.remove("hidden");
        return body;
      },
      closeSheet() {
        document.getElementById("modal-sheet").classList.add("hidden");
        this.revokePhotoUrls("sheet");
      },

      toast(msg, actionLabel, action, ms = 3500) {
        const el = document.getElementById("pt-toast");
        if (!el) return;
        document.getElementById("pt-toast-msg").innerText = msg;
        const btn = document.getElementById("pt-toast-action");
        this._toastAction = action || null;
        btn.classList.toggle("hidden", !actionLabel);
        btn.innerText = actionLabel || "";
        el.classList.remove("hidden");
        clearTimeout(this._toastTimer);
        if (ms) this._toastTimer = setTimeout(() => this.hideToast(), ms);
      },
      hideToast() {
        const el = document.getElementById("pt-toast");
        if (el) el.classList.add("hidden");
      },

      /* ------------------------------------------------ home, streak, banners */
      renderHomeExtras() {
        const upNext = document.getElementById("home-up-next");
        const resumeLbl = document.getElementById("home-resume-label");
        if (this.activeProgram && this.activeDay) {
          const st = this.getProgState(this.activeProgram);
          const isFree = this.activeProgram.id === FREESTYLE_ID;
          this.dom.homeActiveDayBadge.innerText = isFree ? "Freestyle" : this.weekBadge(this.activeProgram, this.activeDay);
          upNext.innerHTML = `<span class="text-zinc-500 font-semibold uppercase tracking-wider text-[10px] block">Up next</span>
            <span class="text-white font-bold">${PT.esc(this.shortDayTitle(this.activeProgram, this.activeDay))}</span>
            <span class="text-zinc-500"> · ${(this.activeDay.exercises || []).length} exercises</span>`;
          upNext.classList.remove("hidden");
          resumeLbl.innerText = (this.activeDay.exercises || []).length ? "Start Workout" : "Open Day";
          const chip = document.getElementById("home-chip"); if (chip) chip.innerText = "ACTIVE ROUTINE";
        } else {
          const chip = document.getElementById("home-chip"); if (chip) chip.innerText = "NO PROGRAM CHOSEN";
          upNext.classList.add("hidden");
          resumeLbl.innerText = "Choose a Program";
        }
        this.renderStreak();
        this.renderHomeBanners();
      },

      trainingDates() {
        const set = new Set(Object.keys(this.history || {}).filter(k => this.history[k] > 0));
        (this.sessions || []).forEach(s => set.add(s.date));
        return set;
      },

      renderStreak(monthActive) {
        const goal = parseInt(this.settings.weeklyGoal, 10) || 3;
        const dates = [...this.trainingDates()];
        const perWeek = {};
        dates.forEach(ds => {
          const d = PT.fromDs(ds);
          if (isNaN(d)) return;
          const k = PT.ds(PT.weekStart(d));
          perWeek[k] = (perWeek[k] || 0) + 1;
        });
        const thisWeek = PT.weekStart(new Date());
        const thisCount = perWeek[PT.ds(thisWeek)] || 0;
        let streak = 0;
        const cursor = new Date(thisWeek);
        if (thisCount < goal) cursor.setDate(cursor.getDate() - 7); // this week is still in progress
        while ((perWeek[PT.ds(cursor)] || 0) >= goal) { streak++; cursor.setDate(cursor.getDate() - 7); }
        if (monthActive === undefined) {
          const now = new Date();
          const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-`;
          monthActive = dates.filter(d => d.startsWith(prefix)).length;
        }
        const title = document.getElementById("home-streak-title");
        if (title) title.innerText = streak ? `${streak}-week streak` : "Consistency";
        if (this.dom.homeMonthlyStreak) {
          this.dom.homeMonthlyStreak.innerText = `${thisCount}/${goal} workouts this week · ${monthActive} active days this month`;
        }
        return { streak, thisCount, goal };
      },

      renderHomeBanners() {
        const box = document.getElementById("home-banners");
        if (!box) return;
        const items = [];
        const now = Date.now();
        if (PT.isIOS() && !PT.isStandalone() && !this.settings.iosHintDismissed) {
          items.push({ id: "ios", color: "border-sky-800/60 bg-sky-950/40", html: `<b class="text-white">Install PulseTrack:</b> tap <b>Share</b> → <b>Add to Home Screen</b>. Always open it from the icon. Data in a Safari tab is kept separately from the app.` });
        }
        const last = this.settings.lastBackupAt;
        const snooze = this.settings.backupSnoozeUntil || 0;
        const every = PT.backupEveryDays ? PT.backupEveryDays(this) : 7;      // days between reminders; 0 = never (Settings → Data & Backup)
        if (every > 0 && this.sessions.length >= 1 && now > snooze && (!last || now - last > every * 86400000)) {
          const age = last ? Math.floor((now - last) / 86400000) + " days ago" : "never";
          items.push({ id: "backup", color: "border-amber-800/60 bg-amber-950/30", html: `<b class="text-white">Back up your data.</b> Last backup: ${age}. Everything lives only on this phone.`, action: "Back up" });
        }
        const recap = this.recapBanner();
        if (recap) items.push(recap);
        box.innerHTML = items.map(it => `
          <div class="border ${it.color} rounded-xl p-3 text-xs text-zinc-300 flex items-start gap-3" data-banner="${it.id}">
            <div class="flex-grow leading-relaxed">${it.html}</div>
            <div class="flex flex-col gap-1.5 shrink-0">
              ${it.action ? `<button class="banner-act px-2.5 py-1.5 bg-emerald-600 text-white font-bold rounded-lg tap-active">${it.action}</button>` : ""}
              <button class="banner-x px-2.5 py-1.5 bg-zinc-800 text-zinc-300 rounded-lg tap-active">${it.action ? "Later" : "Got it"}</button>
            </div>
          </div>`).join("");
        box.querySelectorAll("[data-banner]").forEach(el => {
          const id = el.dataset.banner;
          const act = el.querySelector(".banner-act");
          if (act) act.addEventListener("click", () => (id === "recap" ? this.openRecapFromBanner() : this.exportBackup()));
          el.querySelector(".banner-x").addEventListener("click", () => {
            if (id === "ios") this.settings.iosHintDismissed = true;
            if (id === "backup") this.settings.backupSnoozeUntil = Date.now() + 3 * 86400000;
            if (id === "recap" && this._recapKey) this.settings.recapSeen = this._recapKey;
            WorkoutStorage.saveSettings(this.settings);
            this.renderHomeBanners();
          });
        });
      },

      /* ------------------------------------------------- program progression */
      getProgState(prog) {
        if (!prog) return { week: 1, done: [] };
        let st = this.progState[prog.id];
        if (!st || typeof st !== "object") { st = { week: 1, done: [] }; this.progState[prog.id] = st; }
        if (!(st.week >= 1)) st.week = 1;
        if (!Array.isArray(st.done)) st.done = [];
        return st;
      },
      nextDayOf(prog) {
        const days = (prog && prog.days) || [];
        if (!days.length) return null;
        const st = this.getProgState(prog);
        return days.find(d => !st.done.includes(d.dayNumber)) || days[0];
      },
      markDayDone(prog, dayNumber) {
        if (!prog || prog.id === FREESTYLE_ID) return;
        const st = this.getProgState(prog);
        if (!st.done.includes(dayNumber)) st.done.push(dayNumber);
        const allNums = (prog.days || []).map(d => d.dayNumber);
        if (allNums.length && allNums.every(n => st.done.includes(n))) {
          st.week += 1;
          st.done = [];
        }
        this.saveProgState();
      },
      advanceToNextDay(prog) {
        const next = this.nextDayOf(prog);
        if (next) {
          this.activeProgram = prog;
          this.activeDay = next;
          AppStateMemory.saveActive(prog.id, next.dayNumber);
        }
      },
      renderDaysWeekRow() {
        const row = document.getElementById("days-week-row");
        if (!row || !this.activeProgram) return;
        if (this.activeProgram.id === FREESTYLE_ID) { row.classList.add("hidden"); return; }
        row.classList.remove("hidden");
        const st = this.getProgState(this.activeProgram);
        const total = (this.activeProgram.days || []).length;
        row.innerHTML = `
          <div class="text-xs text-zinc-400"><span class="font-black text-white">Week ${st.week}</span> · ${st.done.length}/${total} days done</div>
          <button id="btn-set-week" class="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700/60 tap-active">Change week</button>`;
        document.getElementById("btn-set-week").addEventListener("click", async () => {
          const v = parseInt(await PT.prompt("Which week of the program are you on?", st.week), 10);
          if (v >= 1 && v <= 520) { st.week = v; this.saveProgState(); this.renderDaysView(); }
        });
      },
      dayCardExtras(day) {
        if (!this.activeProgram || this.activeProgram.id === FREESTYLE_ID) return "";
        const st = this.getProgState(this.activeProgram);
        const next = this.nextDayOf(this.activeProgram);
        if (st.done.includes(day.dayNumber)) return `<span class="px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px] font-bold">✓ DONE</span>`;
        if (next && next.dayNumber === day.dayNumber) return `<span class="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">UP NEXT</span>`;
        return "";
      },
      async handleRestDay(day) {
        if (!await PT.confirm(`"${day.title || "Rest day"}" has no exercises.\n\nMark this rest day as done and move to the next day?`)) return;
        this.markDayDone(this.activeProgram, day.dayNumber);
        this.advanceToNextDay(this.activeProgram);
        this.renderDaysView();
        this.updateDrawerStatus();
      },

      async startEmptyWorkout() {
        if (!this.data || !Array.isArray(this.data.programs)) this.data = { programs: [] };
        let prog = this.data.programs.find(p => p.id === FREESTYLE_ID);
        if (!prog) {
          prog = {
            id: FREESTYLE_ID, title: "Freestyle Workouts",
            description: "Empty workouts you build on the fly. Add any exercise from the library.",
            tags: ["Custom"],
            days: [{ dayNumber: 1, title: "Freestyle", estimatedMinutes: 45, exercises: [] }]
          };
          this.data.programs.push(prog);
        }
        const day = prog.days[0];
        if ((day.exercises || []).length && !await PT.confirm("Start a fresh empty workout? The exercises from your last freestyle workout will be cleared (anything you finished is already saved in History).")) return;
        this.clearDayLogs(prog, day);
        day.exercises = [];
        delete day.removed;
        WorkoutStorage.saveLogs(this.logs);
        WorkoutStorage.setData(this.data);
        this.activeProgram = prog;
        this.activeDay = day;
        AppStateMemory.saveActive(prog.id, day.dayNumber);
        this.showView("workout");
        setTimeout(() => this.openExerciseSelector("add"), 250);
      },

      /* --------------------------------------------- workout card additions */
      lastWorkingSets(name) {
        return (this.lastPerf[name] || []).filter(x => x && x.tag !== "W" && x.tag !== "D" && parseFloat(x.weight) > 0);
      },
      parseRepRange(reps) {
        const s = String(reps || "");
        if (!s || /sec|\bs\b|\d\s*s\b|min|time|fail|amrap|max|mile|yard|meter|step|round|cal/i.test(s)) return null;
        const m = s.match(/(\d+)\s*(?:-|–|to)\s*(\d+)/);
        if (m) { const lo = +m[1], hi = +m[2]; return (lo > 0 && hi >= lo && hi <= 50) ? { lo, hi } : null; }
        const nums = s.match(/\d+/g) || [];
        if (nums.length === 1) { const n = +nums[0]; return n > 0 && n <= 50 ? { lo: n, hi: n } : null; }
        return null; // pyramids like "12, 10, 8" change every set
      },
      suggestionFor(ex) {
        const range = this.parseRepRange(ex.reps);
        const work = this.lastWorkingSets(ex.name);
        if (!range || !work.length) return null;
        const topW = Math.max(...work.map(x => parseFloat(x.weight) || 0));
        const atTop = work.filter(x => (parseFloat(x.weight) || 0) === topW);
        const reps = atTop.map(x => parseFloat(x.reps) || 0);
        const u = this.wLabel();
        const rangeTxt = range.lo === range.hi ? `${range.hi}` : `${range.lo}–${range.hi}`;
        if (reps.every(r => r >= range.hi)) {
          const next = Math.round((topW + this.increment()) * 100) / 100;
          return { kind: "up", text: `▲ Add weight: try ${PT.num(next, 2)} ${u} for ${rangeTxt} reps (you hit ${range.hi}+ on every top set last time)` };
        }
        if (reps.some(r => r < range.lo)) {
          return { kind: "hold", text: `● Stay at ${PT.num(topW, 2)} ${u} and build up to ${range.lo}+ reps on every set` };
        }
        return { kind: "reps", text: `● Same weight (${PT.num(topW, 2)} ${u}) — add a rep or two, aim for ${range.hi}` };
      },
      exerciseSeries(name) {
        const out = [];
        this.sessions.forEach(s => (s.ex || []).forEach(e => {
          if (e.name !== name) return;
          let best = 0, topW = 0, vol = 0, n = 0, mins = 0, dist = 0;
          (e.sets || []).forEach(st => {
            if (st.t === "W") return;
            n++;
            best = Math.max(best, this.setE1rm(name, st, s.date));
            topW = Math.max(topW, PT.isCardioSet(st) ? 0 : this.setLoad(name, st, s.date));
            vol += this.setVolume(name, st, s.date, e.dbn);
            mins += parseFloat(st.min) || 0;
            dist += parseFloat(st.dist) || 0;
          });
          if (n) out.push({ date: s.date, x: s.ts || PT.fromDs(s.date).getTime(), best, topW, vol, mins, dist, sets: e.sets, sessionId: s.id });
        }));
        return out.sort((a, b) => a.x - b.x);
      },
      isStalled(name) {
        const s = this.exerciseSeries(name).filter(p => p.best > 0);
        if (s.length < 4) return false;
        const recent = s.slice(-3), before = s.slice(0, -3);
        return Math.max(...recent.map(p => p.best)) <= Math.max(...before.map(p => p.best));
      },
      supersetLabels(list) {
        const labels = new Array(list.length).fill("");
        let i = 0, letter = 0;
        while (i < list.length) {
          let j = i;
          while (j < list.length - 1 && list[j].link) j++;
          if (j > i) {
            const L = String.fromCharCode(65 + (letter % 26));
            for (let k = i; k <= j; k++) labels[k] = L + (k - i + 1);
            letter++;
          }
          i = j + 1;
        }
        return labels;
      },
      workoutCardExtrasHtml(exercise, exIndex) {
        let html = "";
        const note = this.exNotes[exercise.name];
        if (note) {
          html += `<button class="btn-note-ex w-full text-left bg-amber-950/30 border border-amber-800/40 rounded-lg p-2.5 text-xs text-amber-200 flex items-start gap-2 tap-active" data-exindex="${exIndex}">
            <span>📌</span><span class="flex-grow whitespace-pre-wrap">${PT.esc(note)}</span></button>`;
        }
        if (this.settings.showLogger !== false && exercise.type !== "tabata") {
          const sug = this.suggestionFor(exercise);
          if (sug) {
            html += `<p class="pt-tip-line ${sug.kind === "up" ? "pt-tip-up" : "pt-tip-plain"}">${PT.esc(sug.text)}</p>`;
          }
          if (this.isStalled(exercise.name)) {
            html += `<p class="pt-tip-line pt-tip-warn">⚠ ${PT.esc(PT.plateauTip(exercise.name))}</p>`;
          }
        }
        return html;
      },
      bindWorkoutExtras() {
        const list = this.dom.exercisesList;
        list.querySelectorAll(".btn-note-ex").forEach(btn => btn.addEventListener("click", async () => {
          const ex = this.activeDay.exercises[parseInt(btn.dataset.exindex, 10)];
          if (!ex) return;
          const v = await PT.prompt(`Note for ${ex.name} (seat height, grip, cues…). It shows up every time you do this exercise.`, this.exNotes[ex.name] || "");
          if (v === null) return;
          if (v.trim()) this.exNotes[ex.name] = v.trim(); else delete this.exNotes[ex.name];
          PT.save(STORAGE_KEY_EXNOTES, this.exNotes);
          this.renderWorkoutView();
        }));
        list.querySelectorAll(".btn-link-ex").forEach(btn => btn.addEventListener("click", () => {
          const ex = this.activeDay.exercises[parseInt(btn.dataset.exindex, 10)];
          if (!ex) return;
          if (ex.link) delete ex.link; else ex.link = true;
          WorkoutStorage.setData(this.data);
          this.renderWorkoutView();
        }));
        list.querySelectorAll(".btn-copy-last").forEach(btn => btn.addEventListener("click", () => {
          const idx = parseInt(btn.dataset.exindex, 10);
          const ex = this.activeDay.exercises[idx];
          const prev = ex ? (this.lastPerf[ex.name] || []) : [];
          if (!prev.length) { this.toast("No previous session for this exercise yet"); return; }
          let filled = 0;
          for (let s = 0; s < (ex.sets || 0); s++) {
            const p = prev[s] || prev[prev.length - 1];
            const key = this.getLogKey(this.activeProgram.id, this.activeDay.dayNumber, ex.id, s);
            const e = this.logs[key] || { completed: false, weight: "", reps: "", tag: "R" };
            if (e.completed) continue;
            if (e.weight === "" || e.weight === undefined) e.weight = (parseFloat(p.weight) || p.bz) ? String(p.weight) : "";
            if (e.reps === "" || e.reps === undefined) e.reps = String(p.reps);
            if (p.min !== undefined && (e.min === "" || e.min === undefined)) e.min = String(p.min);
            if (p.dist !== undefined && (e.dist === "" || e.dist === undefined)) e.dist = String(p.dist);
            this.logs[key] = e;
            filled++;
          }
          WorkoutStorage.saveLogs(this.logs);
          this.renderWorkoutView();
          this.toast(filled ? `Filled ${filled} set${filled > 1 ? "s" : ""} from last time` : "All sets are already done");
        }));
        const noteEl = document.getElementById("workout-day-note");
        if (noteEl && this.activeProgram && this.activeDay) {
          noteEl.value = this.dayNotes[`${this.activeProgram.id}_d${this.activeDay.dayNumber}`] || "";
        }
      },

      /* ------------------------------------------------ finishing a workout */
      priorBest(name) {
        let best = parseFloat(this.prBase[name]) || 0;
        this.sessions.forEach(s => (s.ex || []).forEach(e => {
          if (e.name !== name) return;
          (e.sets || []).forEach(st => { if (st.t !== "W") best = Math.max(best, this.setE1rm(name, st, s.date)); });
        }));
        return best;
      },

      async finishWorkoutV2() {
        if (!this.activeProgram || !this.activeDay) return;
        const prog = this.activeProgram, day = this.activeDay;
        const exOut = [];
        let volume = 0, setsCount = 0;
        (day.exercises || []).forEach(ex => {
          const sets = [];
          for (let s = 0; s < (ex.sets || 0); s++) {
            const entry = this.logs[this.getLogKey(prog.id, day.dayNumber, ex.id, s)];
            if (!entry || !entry.completed) continue;
            sets.push(this.entryToSet(ex, entry));
            setsCount++;
          }
          if (sets.length) {
            const rec = { id: ex.id, name: ex.name, sets };
            if (PT.exDbn && PT.exDbn(ex)) rec.dbn = PT.exDbn(ex); else if (/dumbbell|\bdb\b|arnold/i.test(ex.name)) rec.dbn = PT.dbCount(ex.name, ex.reps);
            if (this.exKind(ex).cardio) rec.k = "c";
            exOut.push(rec);
            volume += sets.reduce((a, st) => a + this.setVolume(ex.name, st, PT.ds(), rec.dbn), 0);
          }
        });

        if (!setsCount && !await PT.confirm("No sets are checked off yet. Finish anyway? (Nothing will be saved to History.)")) return;

        const startedAt = this.sessionStartTime;
        const durationSeconds = this.stopStopwatch();
        const prNames = [];
        exOut.forEach(e => {
          const best = Math.max(0, ...e.sets.filter(st => st.t !== "W").map(st => this.setE1rm(e.name, st, PT.ds())));
          if (best > 0 && best > this.priorBest(e.name)) prNames.push({ name: e.name, value: best });
        });

        const noteKey = `${prog.id}_d${day.dayNumber}`;
        let session = null;
        if (setsCount) {
          const now = new Date();
          session = {
            id: PT.uid(), v: 1, date: PT.ds(startedAt && startedAt <= now.getTime() && now.getTime() - startedAt < 10 * 3600 * 1000 ? new Date(startedAt) : now), ts: now.getTime(),
            pid: prog.id, ptitle: prog.title, day: day.dayNumber, dtitle: this.shortDayTitle(prog, day) || ("Day " + day.dayNumber),
            week: prog.id === FREESTYLE_ID ? null : (this.dayWeek(prog, day) && this.progWeeks(prog) ? this.dayWeek(prog, day) : this.getProgState(prog).week),
            dur: durationSeconds, unit: this.unit(), note: (this.dayNotes[noteKey] || "").trim(),
            ex: exOut, vol: Math.round(volume), sets: setsCount, prs: prNames.map(p => p.name), upd: now.getTime()
          };
          this.sessions.push(session);
          if (!this.saveSessions()) { this.sessions.pop(); session = null; }
        }

        // Ghost values for next time
        exOut.forEach(e => { this.lastPerf[e.name] = e.sets.map(st => this.perfFromSet(st)); });
        WorkoutStorage.saveLastPerf(this.lastPerf);

        if (session) {
          const today = session.date;
          if (!this.history[today]) this.history = WorkoutStorage.logDayActivity(today, true);
          this.markDayDone(prog, day.dayNumber);
          if (this.settings.resetAfterFinish !== false) {
            this.clearDayLogs(prog, day);
            WorkoutStorage.saveLogs(this.logs);
          }
          this.rebuildPRs();
          this.advanceToNextDay(prog);
          if (!this.settings.persistAsked) this.requestPersist(false);
        }

        this.lastSummary = { session, prNames, durationSeconds, volume, setsCount, progTitle: prog.title, dayTitle: day.title };
        this.dom.summaryWorkoutName.innerText = `${prog.title} • ${day.title}`;
        if (this.progWeeks(prog)) this.dom.summaryWorkoutName.innerText = `${prog.title} • ${this.weekBadge(prog, day).replace(/ · Day \d+$/, "")} • ${this.shortDayTitle(prog, day)}`;
        this.dom.summaryDuration.innerText = PT.fmtDur(durationSeconds);
        this.dom.summaryVolume.innerText = `${Math.round(volume).toLocaleString()} ${this.wLabel()}`;
        this.dom.summarySets.innerText = setsCount;
        this.dom.summaryPRs.innerText = prNames.length;
        const prList = document.getElementById("summary-pr-list");
        prList.innerHTML = prNames.map(p => `<div>🏅 <b>${PT.esc(p.name)}</b> — new est. 1RM ${PT.num(p.value)} ${this.wLabel()}</div>`).join("");
        prList.classList.toggle("hidden", !prNames.length);
        const nextEl = document.getElementById("summary-next");
        if (session && this.activeDay && prog.id !== FREESTYLE_ID) {
          nextEl.innerText = this.upNextText(prog, this.activeDay);
          nextEl.classList.remove("hidden");
        } else nextEl.classList.add("hidden");
        document.getElementById("btn-share-summary").classList.toggle("hidden", !session);
        document.getElementById("btn-summary-template").classList.toggle("hidden", !(session && prog.id === FREESTYLE_ID));

        this.dom.modalSummary.classList.remove("hidden");
        this.confetti.fire();
        sound.completeChime();
        this.renderCalendar();
        this.updateDrawerStatus();
        this._shareFile = null;
        if (session) this.prepareShareImage(session).then(f => { this._shareFile = f; }).catch(() => {});
      },

      /* ------------------------------------------------------- PR rebuild */
      rebuildPRs() {
        const prs = {};
        Object.keys(this.prBase || {}).forEach(k => { const v = parseFloat(this.prBase[k]); if (v > 0) prs[k] = v; });
        const bump = (name, v) => { if (v > 0 && v > (prs[name] || 0)) prs[name] = v; };
        this.sessions.forEach(s => (s.ex || []).forEach(e => (e.sets || []).forEach(st => {
          if (st.t !== "W") bump(e.name, this.setE1rm(e.name, st, s.date));
        })));
        // Sets checked off in a workout that has not been finished yet still count.
        (this.data.programs || []).forEach(p => (p.days || []).forEach(d => (d.exercises || []).forEach(ex => {
          for (let s = 0; s < (ex.sets || 0); s++) {
            const e = this.logs[this.getLogKey(p.id, d.dayNumber, ex.id, s)];
            if (e && e.completed && e.tag !== "W") bump(ex.name, this.liveE1rm(ex, e));
          }
        })));
        this.prs = prs;
        WorkoutStorage.savePRs(this.prs);
      },
      rebuildLastPerfFor(names) {
        names.forEach(name => {
          let latest = null;
          this.sessions.forEach(s => (s.ex || []).forEach(e => {
            if (e.name === name && (!latest || (s.ts || 0) >= (latest.ts || 0))) latest = { ts: s.ts, sets: e.sets };
          }));
          if (latest) this.lastPerf[name] = latest.sets.map(st => this.perfFromSet(st));
        });
        WorkoutStorage.saveLastPerf(this.lastPerf);
      },

      /* ------------------------------------------------------------ history */
      openHistoryForDate(ds) {
        const has = this.sessions.some(s => s.date === ds);
        if (!has) { this.toast("Sets were logged that day, but no finished workout was saved."); return; }
        this.closeDrawer();
        this.historyFilter = ds;
        this.showView("history");
      },
      renderHistoryView() {
        const list = document.getElementById("history-list");
        const filterBox = document.getElementById("history-filter");
        const all = this.sessions.slice().sort((a, b) => (b.ts || 0) - (a.ts || 0));
        const shownAll = this.historyFilter ? all.filter(s => s.date === this.historyFilter) : all;
        const shown = shownAll.slice(0, this.historyFilter ? shownAll.length : (this.historyLimit || 60));
        const totalVol = all.reduce((a, s) => a + (s.vol || 0), 0);
        document.getElementById("history-summary").innerText = all.length
          ? `${all.length} workouts · ${Math.round(totalVol).toLocaleString()} ${this.wLabel()} lifted`
          : "Finish a workout and it will show up here.";
        if (this.historyFilter) {
          filterBox.className = "flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs";
          filterBox.innerHTML = `<span class="text-zinc-300">Showing <b class="text-white">${PT.esc(PT.fmtDate(this.historyFilter))}</b></span><button id="btn-clear-hfilter" class="px-2.5 py-1 bg-zinc-800 text-zinc-300 rounded-lg tap-active">Show all</button>`;
          document.getElementById("btn-clear-hfilter").addEventListener("click", () => { this.historyFilter = null; this.renderHistoryView(); });
        } else { filterBox.className = "hidden"; filterBox.innerHTML = ""; }

        if (!shown.length) {
          list.innerHTML = `<div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center text-sm text-zinc-400">No saved workouts yet.<br><span class="text-xs text-zinc-500">Check off your sets and tap <b>Finish Workout</b> to save one.</span></div>`;
          return;
        }
        const groups = [];
        shown.forEach(s => {
          const d = PT.fromDs(s.date);
          const key = isNaN(d) ? "Unknown" : d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
          let g = groups.find(x => x.key === key);
          if (!g) { g = { key, items: [] }; groups.push(g); }
          g.items.push(s);
        });
        list.innerHTML = groups.map(g => `
          <div class="space-y-2">
            <h3 class="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-1">${PT.esc(g.key)} · ${g.items.length}</h3>
            ${g.items.map(s => `
              <button class="hist-item w-full text-left bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5 tap-active hover:border-zinc-700 transition" data-id="${PT.esc(s.id)}">
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0">
                    <span class="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">${PT.esc(PT.fmtDate(s.date, { weekday: "short", month: "short", day: "numeric" }))}${s.week ? " · Week " + s.week : ""}</span>
                    <span class="block text-sm font-bold text-white truncate mt-0.5">${PT.esc(s.dtitle)}</span>
                    <span class="block text-[11px] text-zinc-400 truncate">${PT.esc(s.ptitle)}</span>
                  </div>
                  ${(s.prs || []).length ? `<span class="shrink-0 px-2 py-0.5 rounded-full bg-amber-950 border border-amber-800 text-amber-300 text-[10px] font-black">${s.prs.length} PR</span>` : ""}
                </div>
                <div class="flex gap-3 mt-2 text-[11px] text-zinc-400 font-mono">
                  <span>⏱ ${PT.fmtDur(s.dur)}</span><span>${s.sets} sets</span><span>${Math.round(s.vol || 0).toLocaleString()} ${PT.esc(s.unit === "kg" ? "kg" : "lbs")}</span>
                </div>
              </button>`).join("")}
          </div>`).join("");
        list.querySelectorAll(".hist-item").forEach(b => b.addEventListener("click", () => this.openSessionSheet(b.dataset.id)));
        if (shownAll.length > shown.length) {
          const more = document.createElement("button");
          more.type = "button"; more.id = "pt-hist-more";
          more.className = "w-full py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300 tap-active";
          more.textContent = `Show 60 more (${shownAll.length - shown.length} older)`;
          more.addEventListener("click", () => { this.historyLimit = (this.historyLimit || 60) + 60; this.renderHistoryView(); });
          list.appendChild(more);
        }
      },

      openSessionSheet(id, editing = false) {
        const s = this.sessions.find(x => x.id === id);
        if (!s) return;
        const u = s.unit === "kg" ? "kg" : "lbs";
        const mini = "bg-zinc-950 border border-zinc-700 rounded px-1.5 py-1 text-right font-mono text-zinc-100 focus:outline-none focus:border-emerald-500";
        let body = `
          <div class="grid grid-cols-3 gap-2 text-center">
            <div class="bg-zinc-950 border border-zinc-800 rounded-xl p-2"><span class="block text-[10px] text-zinc-500 uppercase font-bold">Time</span><span class="font-mono font-bold text-white text-sm">${PT.fmtDur(s.dur)}</span></div>
            <div class="bg-zinc-950 border border-zinc-800 rounded-xl p-2"><span class="block text-[10px] text-zinc-500 uppercase font-bold">Volume</span><span class="font-mono font-bold text-emerald-400 text-sm">${Math.round(s.vol || 0).toLocaleString()}</span></div>
            <div class="bg-zinc-950 border border-zinc-800 rounded-xl p-2"><span class="block text-[10px] text-zinc-500 uppercase font-bold">Sets</span><span class="font-mono font-bold text-white text-sm">${s.sets}</span></div>
          </div>`;
        if (editing) {
          body += `<label class="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Notes<textarea id="edit-session-note" rows="2" class="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-200 normal-case font-normal tracking-normal focus:outline-none focus:border-emerald-500">${PT.esc(s.note || "")}</textarea></label>`;
        } else if (s.note) {
          body += `<div class="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-300 whitespace-pre-wrap">📝 ${PT.esc(s.note)}</div>`;
        }
        (s.ex || []).forEach((e, ei) => {
          const isPR = (s.prs || []).includes(e.name);
          body += `<div class="bg-zinc-950 border border-zinc-800 rounded-xl p-3 space-y-1.5">
            <div class="flex items-center justify-between gap-2">${editing ? `<span class="text-sm font-bold text-white">${PT.esc(e.name)}</span>` : `<button class="ss-ex text-left text-sm font-bold text-white tap-active" data-name="${PT.esc(e.name)}">${PT.esc(e.name)} <span class="text-zinc-500 font-normal">›</span></button>`}${isPR ? `<span class="text-[10px] font-black text-amber-300">🏅 PR</span>` : ""}</div>`;
          (e.sets || []).forEach((st, si) => {
            const tag = st.t && st.t !== "R" ? `<span class="text-[10px] font-bold text-zinc-500 w-4">${PT.esc(st.t)}</span>` : `<span class="w-4"></span>`;
            if (editing && PT.isCardioSet(st)) {
              body += `<div class="flex items-center gap-1.5 text-xs">${tag}<span class="text-zinc-500 w-6">S${si + 1}</span>
                <input type="number" inputmode="decimal" step="any" class="es-min w-16 ${mini}" data-e="${ei}" data-s="${si}" value="${st.min || 0}"><span class="text-zinc-500 text-[10px]">min</span>
                <input type="number" inputmode="decimal" step="any" class="es-dist w-14 ${mini}" data-e="${ei}" data-s="${si}" value="${st.dist || ""}"><span class="text-zinc-500 text-[10px]">${this.distLabel(s.unit)}</span>
                <button class="es-del ml-auto px-2 py-1 text-zinc-500 hover:text-rose-400 tap-active" data-e="${ei}" data-s="${si}" aria-label="Delete set">✕</button></div>`;
            } else if (editing) {
              body += `<div class="flex items-center gap-1.5 text-xs">${tag}<span class="text-zinc-500 w-6">S${si + 1}</span>
                <input type="number" inputmode="decimal" step="any" class="es-w w-16 ${mini}" data-e="${ei}" data-s="${si}" value="${st.w}"><span class="text-zinc-500 text-[10px]">${PT.isBodyweightEx(e.name) && (st.bx || st.a) ? (st.a ? "−" : "+") + u : u}</span>
                <input type="number" inputmode="numeric" class="es-r w-12 ${mini}" data-e="${ei}" data-s="${si}" value="${st.r}"><span class="text-zinc-500 text-[10px]">reps</span>
                <button class="es-del ml-auto px-2 py-1 text-zinc-500 hover:text-rose-400 tap-active" data-e="${ei}" data-s="${si}" aria-label="Delete set">✕</button></div>`;
            } else {
              const e1 = st.t !== "W" ? this.setE1rm(e.name, st, s.date) : 0;
              body += `<div class="flex items-center gap-2 text-xs font-mono text-zinc-300">${tag}<span class="text-zinc-500 w-6">S${si + 1}</span><span>${PT.esc(this.setText(e.name, st, u, s.unit))}</span>${e1 ? `<span class="ml-auto text-[10px] text-zinc-500">e1RM ${PT.num(e1)}</span>` : ""}</div>`;
            }
          });
          body += `</div>`;
        });
        const btn = "py-3 rounded-xl text-xs font-bold tap-active";
        const footer = editing
          ? `<div class="flex gap-2"><button id="ss-cancel" class="${btn} px-4 bg-zinc-800 text-zinc-300">Cancel</button><button id="ss-save" class="${btn} flex-1 bg-emerald-600 text-white">Save Changes</button></div>`
          : `<div class="grid grid-cols-4 gap-2">
              <button id="ss-repeat" class="${btn} col-span-2 bg-emerald-600 text-white">↻ Do Again</button>
              <button id="ss-edit" class="${btn} bg-zinc-800 text-zinc-200">Edit</button>
              <button id="ss-share" class="${btn} bg-zinc-800 text-zinc-200">Share</button>
              <button id="ss-template" class="${btn} col-span-2 bg-zinc-800 text-zinc-200">💾 Save as Routine</button>
              <button id="ss-delete" class="${btn} col-span-2 bg-rose-950/40 border border-rose-800/40 text-rose-300">Delete Workout</button>
            </div>`;
        const sub = `${PT.fmtDate(s.date, { weekday: "long", month: "short", day: "numeric", year: "numeric" })} · ${s.ptitle}`;
        const bodyEl = this.openSheet(s.dtitle, sub, body, footer);
        const $ = id => document.getElementById(id);
        if (editing) {
          const draft = JSON.parse(JSON.stringify(s.ex || []));
          const removed = new Set();
          bodyEl.querySelectorAll(".es-del").forEach(b => b.addEventListener("click", () => {
            removed.add(b.dataset.e + ":" + b.dataset.s);
            b.closest("div").style.display = "none";
          }));
          $("ss-cancel").addEventListener("click", () => this.openSessionSheet(id));
          $("ss-save").addEventListener("click", async () => {
            bodyEl.querySelectorAll(".es-w").forEach(inp => { const st = draft[inp.dataset.e].sets[inp.dataset.s]; st.w = Math.max(0, parseFloat(inp.value) || 0); });
            bodyEl.querySelectorAll(".es-r").forEach(inp => { const st = draft[inp.dataset.e].sets[inp.dataset.s]; st.r = Math.max(0, parseFloat(inp.value) || 0); });
            bodyEl.querySelectorAll(".es-min").forEach(inp => { const st = draft[inp.dataset.e].sets[inp.dataset.s]; st.min = Math.max(0, parseFloat(inp.value) || 0); });
            bodyEl.querySelectorAll(".es-dist").forEach(inp => { const st = draft[inp.dataset.e].sets[inp.dataset.s]; const d = parseFloat(inp.value); if (d > 0) st.dist = d; else delete st.dist; });
            const ex = draft.map((e, ei) => Object.assign({}, e, { sets: e.sets.filter((_, si) => !removed.has(ei + ":" + si)) })).filter(e => e.sets.length);
            if (!ex.length) { await PT.alert("A workout needs at least one set. Use Delete Workout instead."); return; }
            const names = new Set((s.ex || []).map(e => e.name));
            s.ex = ex;
            s.sets = ex.reduce((a, e) => a + e.sets.length, 0);
            s.vol = Math.round(this.sessionVolume(s));
            const noteEl = $("edit-session-note");
            if (noteEl) s.note = noteEl.value.trim();
            s.upd = Date.now();
            this.saveSessions();
            this.recomputeSessionPRs();
            this.rebuildPRs();
            this.rebuildLastPerfFor([...names]);
            this.toast("Workout updated");
            this.openSessionSheet(id);
            this.renderHistoryView();
          });
        } else {
          $("ss-edit").addEventListener("click", () => this.openSessionSheet(id, true));
          $("ss-delete").addEventListener("click", async () => {
            if (!await PT.confirm("Delete this workout from your history? PRs will be recalculated.")) return;
            const names = (s.ex || []).map(e => e.name);
            this.sessions = this.sessions.filter(x => x.id !== id);
            this.saveSessions();
            names.forEach(n => {
              const stillThere = this.sessions.some(x => (x.ex || []).some(e => e.name === n));
              const lp = this.lastPerf[n];
              const fromThis = (s.ex || []).find(e => e.name === n);
              if (!stillThere && lp && fromThis && JSON.stringify(lp) === JSON.stringify(fromThis.sets.map(st => this.perfFromSet(st)))) delete this.lastPerf[n];
            });
            this.rebuildLastPerfFor(names);
            this.recomputeSessionPRs();
            this.rebuildPRs();
            this.closeSheet();
            this.renderHistoryView();
            this.renderCalendar();
            this.updateDrawerStatus();
            this.toast("Workout deleted", "Undo", () => {
              this.sessions.push(s); this.saveSessions();
              this.rebuildLastPerfFor(names); this.recomputeSessionPRs(); this.rebuildPRs();
              if (this.renderHistoryView) this.renderHistoryView();
              this.renderCalendar(); this.updateDrawerStatus();
              this.toast("Workout restored");
            }, 10000);
          });
          $("ss-repeat").addEventListener("click", () => this.repeatSession(s));
          $("ss-template").addEventListener("click", () => this.openSaveRoutine(s));
          bodyEl.querySelectorAll(".ss-ex").forEach(b => b.addEventListener("click", () => this.openExerciseSheet(b.dataset.name, () => this.openSessionSheet(id))));
          $("ss-share").addEventListener("click", () => this.shareSessionById(id));
        }
      },

      // Re-label which exercises were PRs after an edit or delete (chronological order).
      recomputeSessionPRs() {
        const best = Object.assign({}, this.prBase);
        this.sessions.slice().sort((a, b) => (a.ts || 0) - (b.ts || 0)).forEach(s => {
          s.prs = [];
          (s.ex || []).forEach(e => {
            const b = Math.max(0, ...(e.sets || []).filter(st => st.t !== "W").map(st => this.setE1rm(e.name, st, s.date)));
            if (b > 0 && b > (parseFloat(best[e.name]) || 0)) { s.prs.push(e.name); best[e.name] = b; }
          });
        });
        this.saveSessions();
      },

      async repeatSession(s) {
        const prog = (this.data.programs || []).find(p => p.id === s.pid);
        const day = prog && (prog.days || []).find(d => d.dayNumber === s.day);
        if (!prog || !day) { await PT.alert("That program or day no longer exists on this phone, so it can't be repeated."); return; }
        const hasDone = (day.exercises || []).some(ex => {
          for (let i = 0; i < (ex.sets || 0); i++) { const e = this.logs[this.getLogKey(prog.id, day.dayNumber, ex.id, i)]; if (e && e.completed) return true; }
          return false;
        });
        if (hasDone && !await PT.confirm("This day already has sets checked off. Replace them with the weights from this saved workout?")) return;
        let filled = 0, missing = 0;
        (s.ex || []).forEach(e => {
          const ex = (day.exercises || []).find(x => x.id === e.id) || (day.exercises || []).find(x => x.name === e.name);
          if (!ex) { missing++; return; }
          if ((e.sets || []).length > (ex.sets || 0)) this.changeSets(ex, e.sets.length - (parseInt(ex.sets, 10) || 0));
          for (let i = 0; i < (ex.sets || 0); i++) delete this.logs[this.getLogKey(prog.id, day.dayNumber, ex.id, i)];
          e.sets.forEach((st, i) => {
            this.logs[this.getLogKey(prog.id, day.dayNumber, ex.id, i)] = Object.assign({ completed: false, weight: (st.w || st.bz) ? String(st.w) : "", reps: String(st.r), tag: st.t || "R" },
              st.min !== undefined ? { min: String(st.min) } : {}, st.dist !== undefined ? { dist: String(st.dist) } : {});
            filled++;
          });
        });
        WorkoutStorage.saveLogs(this.logs);
        WorkoutStorage.setData(this.data);
        this.closeSheet();
        this.activeProgram = prog;
        this.activeDay = day;
        AppStateMemory.saveActive(prog.id, day.dayNumber);
        this.showView("workout");
        this.toast(`Loaded ${filled} sets${missing ? ` · ${missing} exercise(s) no longer in this day` : ""}. Check them off as you go.`, null, null, 5000);
      },

      /* ----------------------------------------------------------- progress */
      weeklyMuscleSets(weekStartDate) {
        const start = weekStartDate.getTime(), end = start + 7 * 86400000;
        const out = {};
        this.sessions.forEach(s => {
          const t = PT.fromDs(s.date).getTime();
          if (!(t >= start && t < end)) return;
          (s.ex || []).forEach(e => {
            const n = (e.sets || []).filter(st => st.t !== "W").length;
            if (!n) return;
            const c = PT.category(e.name);
            out[c] = (out[c] || 0) + n;
            if (this.settings.helperSets) PT.helperMuscles(e.name, c).forEach(([m, f]) => { out[m] = (out[m] || 0) + n * f; });
          });
        });
        return out;
      },
      renderProgressView() {
        const root = document.getElementById("progress-body");
        const u = this.wLabel();
        const card = "bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3";
        const h = t => `<h3 class="text-xs font-bold text-white">${t}</h3>`;
        const st = this.renderStreak();

        // Weekly sets per muscle
        const thisWeek = PT.weekStart(new Date());
        let data = {}, label = "";
        if (this.progressWeekMode === "this") { data = this.weeklyMuscleSets(thisWeek); label = "This week"; }
        else if (this.progressWeekMode === "last") { const lw = new Date(thisWeek); lw.setDate(lw.getDate() - 7); data = this.weeklyMuscleSets(lw); label = "Last week"; }
        else {
          label = "4-week average";
          for (let i = 1; i <= 4; i++) {
            const w = new Date(thisWeek); w.setDate(w.getDate() - 7 * i);
            const d = this.weeklyMuscleSets(w);
            Object.keys(d).forEach(k => { data[k] = (data[k] || 0) + d[k] / 4; });
          }
        }
        let prevData = null;
        if (this.progressWeekMode === "this") { const lw = new Date(thisWeek); lw.setDate(lw.getDate() - 7); prevData = this.weeklyMuscleSets(lw); }
        const MAIN_MUSCLES = ["Chest", "Back", "Legs", "Shoulders", "Biceps", "Triceps"];
        const lowMuscles = MAIN_MUSCLES.filter(c => (data[c] || 0) < 10);
        const lowMsg = this.progressWeekMode === "this" && this.sessions.length
          ? `<p class="text-[11px] text-zinc-300 bg-zinc-950 border border-zinc-800 rounded-xl p-2.5">${lowMuscles.length ? `Under 10 sets so far this week: <b class="text-amber-300">${lowMuscles.join(", ")}</b>.` : "Every main muscle has 10+ sets this week 💪"} <span class="text-zinc-500">The small +/− numbers compare with last week.</span></p>` : "";
        const cats = MUSCLE_ORDER.filter(c => c !== "Cardio" && c !== "Other" || data[c]);
        const maxV = Math.max(24, ...cats.map(c => data[c] || 0));
        const bars = cats.map(c => {
          const v = data[c] || 0;
          const color = c === "Cardio" || c === "Other" ? "bg-zinc-500" : v === 0 ? "bg-zinc-700" : v < 10 ? "bg-amber-500" : v <= 20 ? "bg-emerald-500" : "bg-rose-500";
          return `<div class="flex items-center gap-2 text-xs">
            <span class="w-20 shrink-0 text-zinc-300 font-semibold">${c}</span>
            <div class="relative flex-grow h-4 bg-zinc-800 rounded-full overflow-hidden">
              <div class="absolute inset-y-0 border-l border-r border-dashed border-zinc-500/70" style="left:${(10 / maxV) * 100}%;width:${(10 / maxV) * 100}%"></div>
              <div class="h-4 rounded-full ${color}" style="width:${Math.min(100, (v / maxV) * 100)}%"></div>
            </div>
            <span class="w-8 text-right font-mono text-zinc-200">${PT.num(v, v % 1 ? 1 : 0)}</span>
            ${prevData ? (() => { const d = Math.round((v - (prevData[c] || 0)) * 10) / 10; return `<span class="w-8 text-right font-mono text-[10px] ${d > 0 ? "text-emerald-400" : d < 0 ? "text-rose-400" : "text-zinc-600"}">${d > 0 ? "+" : ""}${PT.num(d, d % 1 ? 1 : 0)}</span>`; })() : ""}
          </div>`;
        }).join("");
        const seg = (k, t) => `<button class="prog-week px-2.5 py-1 rounded-lg text-[11px] font-bold tap-active ${this.progressWeekMode === k ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-400"}" data-k="${k}">${t}</button>`;

        // Monthly report
        const m0 = new Date(this.progressMonth.getFullYear(), this.progressMonth.getMonth(), 1);
        const m1 = new Date(m0.getFullYear(), m0.getMonth() + 1, 1);
        const inMonth = this.sessions.filter(s => { const t = PT.fromDs(s.date); return t >= m0 && t < m1; });
        const mVol = inMonth.reduce((a, s) => a + (s.vol || 0), 0);
        const mSets = inMonth.reduce((a, s) => a + (s.sets || 0), 0);
        const mPRs = inMonth.reduce((a, s) => a + (s.prs || []).length, 0);
        const mDur = inMonth.length ? inMonth.reduce((a, s) => a + (s.dur || 0), 0) / inMonth.length : 0;
        const exCount = {};
        inMonth.forEach(s => (s.ex || []).forEach(e => { exCount[e.name] = (exCount[e.name] || 0) + (e.sets || []).filter(x => x.t !== "W").length; }));
        const top = Object.keys(exCount).sort((a, b) => exCount[b] - exCount[a]).slice(0, 3);
        const stat = (k, v, c = "text-white") => `<div class="bg-zinc-950 border border-zinc-800 rounded-xl p-2.5"><span class="block text-[10px] text-zinc-500 uppercase font-bold">${k}</span><span class="block font-mono font-bold text-sm ${c}">${v}</span></div>`;

        // Stalls & PR timeline
        const names = [...new Set(this.sessions.flatMap(s => (s.ex || []).map(e => e.name)))];
        const stalled = names.filter(n => this.isStalled(n));
        const events = [];
        const running = {};
        this.sessions.slice().sort((a, b) => (a.ts || 0) - (b.ts || 0)).forEach(s => (s.ex || []).forEach(e => {
          const b = Math.max(0, ...(e.sets || []).filter(x => x.t !== "W").map(x => this.setE1rm(e.name, x, s.date)));
          if (b > 0 && b > (running[e.name] || 0)) {
            if (running[e.name]) events.push({ date: s.date, name: e.name, v: b, gain: b - running[e.name] });
            else events.push({ date: s.date, name: e.name, v: b, gain: 0, first: true });
            running[e.name] = b;
          }
        }));
        const prEvents = events.filter(e => !e.first).reverse().slice(0, 15);
        const lifeVol = this.sessions.reduce((a, s) => a + (s.vol || 0), 0);
        const lifeSets = this.sessions.reduce((a, s) => a + (s.sets || 0), 0);
        const first = this.sessions.reduce((a, s) => (!a || s.date < a ? s.date : a), null);

        root.innerHTML = `
          <div class="grid grid-cols-3 gap-2">
            ${stat("Streak", st.streak + " wk", "text-emerald-400")}
            ${stat("This week", st.thisCount + "/" + st.goal)}
            ${stat("Workouts", this.sessions.length)}
          </div>

          ${this.muscleCardHtml(seg, label)}

          ${this.strengthCardHtml()}

          ${this.recapCardHtml(m0)}

          ${this.plateauCardHtml(stalled)}

          <div class="${card}">
            ${h("Recent PRs")}
            ${prEvents.length ? `<div class="space-y-1.5">${prEvents.map(e => `<button class="pr-ex w-full flex items-center justify-between text-xs tap-active" data-name="${PT.esc(e.name)}">
                <span class="text-left min-w-0"><span class="block text-zinc-100 font-semibold truncate">${PT.esc(e.name)}</span><span class="block text-[10px] text-zinc-500">${PT.esc(PT.fmtDate(e.date))}</span></span>
                <span class="font-mono text-amber-400 shrink-0">${PT.num(e.v)} ${u} <span class="text-emerald-400">+${PT.num(e.gain)}</span></span></button>`).join("")}</div>`
              : `<p class="text-xs text-zinc-500">Beat a lift you've done before and it shows up here.</p>`}
          </div>

          <div class="${card}">
            ${h("Lifetime")}
            <div class="grid grid-cols-3 gap-2">
              ${stat("Volume", Math.round(lifeVol).toLocaleString(), "text-emerald-400")}
              ${stat("Sets", lifeSets.toLocaleString())}
              ${stat("Since", first ? PT.fmtDate(first, { month: "short", year: "numeric" }) : "—")}
            </div>
          </div>`;

        root.querySelectorAll(".prog-week").forEach(b => b.addEventListener("click", () => { this.progressWeekMode = b.dataset.k; this.renderProgressView(); }));
        document.getElementById("prog-helpers").addEventListener("click", () => {
          this.settings.helperSets = !this.settings.helperSets;
          WorkoutStorage.saveSettings(this.settings);
          this.renderProgressView();
        });
        document.getElementById("pm-prev").addEventListener("click", () => { this.progressMonth = new Date(m0.getFullYear(), m0.getMonth() - 1, 1); this.renderProgressView(); });
        document.getElementById("pm-next").addEventListener("click", () => { this.progressMonth = new Date(m0.getFullYear(), m0.getMonth() + 1, 1); this.renderProgressView(); });
        root.querySelectorAll(".pr-ex").forEach(b => b.addEventListener("click", () => this.openExerciseSheet(b.dataset.name)));
        this.bindProgressV4(root, m0);
      },

      /* ---------------------------------------------------- exercise detail */
      openExerciseSheet(name, back) {
        const u = this.wLabel();
        const series = this.exerciseSeries(name);
        const ranges = { "3m": 90, "6m": 182, "1y": 365, "all": 100000 };
        const cutoff = Date.now() - ranges[this.chartRange] * 86400000;
        const pts = series.filter(p => p.x >= cutoff);
        const isCardio = series.some(p => (p.sets || []).some(st => PT.isCardioSet(st))) || !!PT.cardioKind(name);
        const cardioMetric = ["min", "dist", "pace"].includes(this.chartMetric);
        const metric = isCardio ? (cardioMetric ? this.chartMetric : "min") : (cardioMetric ? "e1rm" : this.chartMetric);
        const yOf = p => metric === "min" ? p.mins : metric === "dist" ? p.dist : metric === "pace" ? (p.dist > 0 ? p.mins / p.dist : NaN)
          : metric === "e1rm" ? p.best : metric === "top" ? p.topW
          : metric === "reps" ? Math.max(0, ...(p.sets || []).filter(st => st.t !== "W").map(st => parseFloat(st.r) || 0)) : p.vol;
        const recs = this.repRecords(name);
        const chart = PT.lineChart([{ points: pts.map(p => ({ x: p.x, y: yOf(p) })), color: PT.accent() }], {
          empty: series.length ? "No sessions in this range" : "Finish a workout with this exercise to see your progress chart.",
          label: name + " progress"
        });
        const pr = this.prs[name];
        const last = series[series.length - 1];
        const seg = (cls, k, t, cur) => `<button class="${cls} px-2.5 py-1 rounded-lg text-[11px] font-bold tap-active ${cur === k ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-400"}" data-k="${k}">${t}</button>`;
        const note = this.exNotes[name] || "";
        const recent = series.slice(-6).reverse();
        const body = `${back ? `<button id="ex-back" class="text-xs font-bold text-emerald-400 tap-active">‹ Back to workout</button>` : ""}
          <div class="grid grid-cols-3 gap-2 text-center">
            ${isCardio
              ? `<div class="bg-zinc-950 border border-zinc-800 rounded-xl p-2"><span class="block text-[10px] text-zinc-500 uppercase font-bold">Longest</span><span class="font-mono font-black text-amber-400 text-sm">${series.length ? PT.num(Math.max(...series.map(p => p.mins)), 0) + " min" : "—"}</span></div>`
              : `<div class="bg-zinc-950 border border-zinc-800 rounded-xl p-2"><span class="block text-[10px] text-zinc-500 uppercase font-bold">Est. 1RM PR</span><span class="font-mono font-black text-amber-400 text-sm">${pr ? PT.num(pr) + " " + u : "—"}</span></div>`}
            <div class="bg-zinc-950 border border-zinc-800 rounded-xl p-2"><span class="block text-[10px] text-zinc-500 uppercase font-bold">Sessions</span><span class="font-mono font-bold text-white text-sm">${series.length}</span></div>
            <div class="bg-zinc-950 border border-zinc-800 rounded-xl p-2"><span class="block text-[10px] text-zinc-500 uppercase font-bold">Last done</span><span class="font-mono font-bold text-white text-sm">${last ? PT.fmtDate(last.date, { month: "short", day: "numeric" }) : "—"}</span></div>
          </div>
          ${this.isStalled(name) ? `<div class="text-[11px] font-semibold border rounded-lg px-2.5 py-2 text-amber-300 bg-amber-950/30 border-amber-800/50">⚠ ${PT.esc(PT.plateauTip(name))}</div>` : ""}
          ${PT.cuesHtml(name)}
          ${this.exSheetExtrasHtml(name)}
          <div class="bg-zinc-950 border border-zinc-800 rounded-xl p-3 space-y-2">
            <div class="flex flex-wrap gap-1.5">${isCardio
              ? `${seg("ch-metric", "min", "Minutes", metric)}${seg("ch-metric", "dist", "Distance", metric)}${seg("ch-metric", "pace", "Pace (min/" + this.distLabel() + ")", metric)}`
              : `${seg("ch-metric", "e1rm", "Est. 1RM", metric)}${seg("ch-metric", "top", "Top weight", metric)}${seg("ch-metric", "vol", "Volume", metric)}${seg("ch-metric", "reps", "Best reps", metric)}`}</div>
            ${chart}
            <div class="flex gap-1.5 justify-end">${seg("ch-range", "3m", "3M", this.chartRange)}${seg("ch-range", "6m", "6M", this.chartRange)}${seg("ch-range", "1y", "1Y", this.chartRange)}${seg("ch-range", "all", "All", this.chartRange)}</div>
          </div>
          ${recs.length ? `<div class="bg-zinc-950 border border-zinc-800 rounded-xl p-3 space-y-2">
            <div><span class="text-xs font-bold text-white">🏆 Rep records</span><span class="block text-[10px] text-zinc-500 mt-0.5">Heaviest weight you've done for each rep count (warm-ups left out).</span></div>
            <div class="grid grid-cols-[3rem_1fr_auto] gap-x-3 gap-y-1 text-xs">
              <span class="text-[10px] font-bold uppercase text-zinc-500">Reps</span><span class="text-[10px] font-bold uppercase text-zinc-500">Weight</span><span class="text-[10px] font-bold uppercase text-zinc-500 text-right">When</span>
              ${recs.map(r => `<span class="font-mono font-bold text-white">${r.reps}</span><span class="font-mono text-amber-300">${PT.num(r.w, 2)} ${u}${r.bwTxt ? ` <span class="text-zinc-500">(${PT.esc(r.bwTxt)})</span>` : ""}</span><span class="text-zinc-500 text-right">${PT.esc(PT.fmtDate(r.date, { month: "short", day: "numeric", year: "2-digit" }))}</span>`).join("")}
            </div>
          </div>` : ""}
          <div class="bg-zinc-950 border border-zinc-800 rounded-xl p-3 space-y-2">
            <div class="flex items-center justify-between"><span class="text-xs font-bold text-white">📌 Exercise note</span><button id="ex-note-edit" class="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 tap-active">${note ? "Edit" : "Add"}</button></div>
            <p class="text-xs ${note ? "text-zinc-300" : "text-zinc-500"} whitespace-pre-wrap">${note ? PT.esc(note) : "Seat height, grip, cues… shown on the workout card every time."}</p>
          </div>
          <div class="space-y-1.5">
            <span class="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Recent sessions</span>
            ${recent.length ? recent.map(p => `<div class="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs">
                <div class="flex justify-between"><span class="text-zinc-300 font-semibold">${PT.esc(PT.fmtDate(p.date))}</span><span class="font-mono text-zinc-500">${isCardio ? PT.num(p.mins, 1) + " min" : "e1RM " + PT.num(p.best)}</span></div>
                <div class="font-mono text-zinc-400 mt-0.5">${p.sets.map(st => `${st.t === "W" ? "w" : ""}${PT.esc(this.setText(name, st))}`).join(" · ")}</div></div>`).join("")
              : `<p class="text-xs text-zinc-500">No saved sessions yet.</p>`}
          </div>`;
        const footer = series.length || pr ? `<button id="ex-merge" class="w-full py-3 rounded-xl text-xs font-bold bg-zinc-800 text-zinc-300 tap-active">Merge history into another exercise…</button>` : "";
        const bodyEl = this.openSheet(name, PT.category(name), body, footer);
        const backBtn = document.getElementById("ex-back");
        if (backBtn) backBtn.addEventListener("click", () => back());
        this.bindExSheetV4(name);
        bodyEl.querySelectorAll(".ch-metric").forEach(b => b.addEventListener("click", () => { this.chartMetric = b.dataset.k; this.openExerciseSheet(name, back); }));
        bodyEl.querySelectorAll(".ch-range").forEach(b => b.addEventListener("click", () => { this.chartRange = b.dataset.k; this.openExerciseSheet(name, back); }));
        document.getElementById("ex-note-edit").addEventListener("click", async () => {
          const v = await PT.prompt(`Note for ${name}:`, this.exNotes[name] || "");
          if (v === null) return;
          if (v.trim()) this.exNotes[name] = v.trim(); else delete this.exNotes[name];
          PT.save(STORAGE_KEY_EXNOTES, this.exNotes);
          this.openExerciseSheet(name, back);
        });
        const mergeBtn = document.getElementById("ex-merge");
        if (mergeBtn) mergeBtn.addEventListener("click", () => this.mergeExercise(name));
      },

      async mergeExercise(from) {
        const to = (await PT.prompt(`Move all history, PRs and notes from "${from}" into which exercise? Type its exact name (for example the renamed version):`, "") || "").trim();
        if (!to || to === from) return;
        const known = new Set([...(typeof EXERCISE_DATABASE !== "undefined" ? EXERCISE_DATABASE.map(e => e.name) : []), ...Object.keys(this.prs), ...this.sessions.flatMap(s => (s.ex || []).map(e => e.name))]);
        if (!known.has(to) && !await PT.confirm(`"${to}" isn't in your exercise list or history yet. Merge into it anyway?`)) return;
        if (!await PT.confirm(`Merge "${from}" → "${to}"?\n\nSaved workouts, PRs, last-time values and notes move over. Your programs are not renamed.`)) return;
        this.sessions.forEach(s => (s.ex || []).forEach(e => { if (e.name === from) e.name = to; }));
        this.saveSessions();
        if (this.prBase[from]) { this.prBase[to] = Math.max(this.prBase[to] || 0, this.prBase[from]); delete this.prBase[from]; PT.save(STORAGE_KEY_PRBASE, this.prBase); }
        if (this.lastPerf[from]) { if (!this.lastPerf[to]) this.lastPerf[to] = this.lastPerf[from]; delete this.lastPerf[from]; WorkoutStorage.saveLastPerf(this.lastPerf); }
        if (this.exNotes[from]) { this.exNotes[to] = this.exNotes[to] ? this.exNotes[to] + "\n" + this.exNotes[from] : this.exNotes[from]; delete this.exNotes[from]; PT.save(STORAGE_KEY_EXNOTES, this.exNotes); }
        delete this.prs[from];
        this.recomputeSessionPRs();
        this.rebuildPRs();
        this.rebuildLastPerfFor([to]);
        this.toast(`Merged into ${to}`);
        this.openExerciseSheet(to);
        if (!document.getElementById("view-library").classList.contains("hidden")) this.renderLibraryView();
      },

      /* --------------------------------------------------------------- body */
      renderBodyView() {
        const root = document.getElementById("body-root");
        const u = this.wLabel(), L = this.lenLabel();
        const entries = this.body.slice().sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
        const ranges = { "1m": 31, "3m": 92, "1y": 366, "all": 100000 };
        const cutoff = Date.now() - ranges[this.bodyRange] * 86400000;
        const bw = entries.filter(e => parseFloat(e.bw) > 0).map(e => ({ x: PT.fromDs(e.date).getTime(), y: parseFloat(e.bw) }));
        const avg = bw.map(p => {
          const win = bw.filter(q => q.x <= p.x && q.x > p.x - 7 * 86400000);
          return { x: p.x, y: win.reduce((a, q) => a + q.y, 0) / win.length };
        });
        const inRange = arr => arr.filter(p => p.x >= cutoff);
        const chart = PT.lineChart([
          { points: inRange(bw), color: "#71717a", width: 1.5 },
          { points: inRange(avg), color: PT.accent(), width: 2.5, dots: false }
        ].concat(this.bodyGoalSeries(inRange(bw))), { empty: "Log your bodyweight to see the trend.", label: "Bodyweight" });
        const latest = bw[bw.length - 1];
        const monthAgo = bw.filter(p => p.x <= (latest ? latest.x : 0) - 28 * 86400000).pop();
        const change = latest && monthAgo ? latest.y - monthAgo.y : null;
        const latestOf = key => { for (let i = entries.length - 1; i >= 0; i--) { const v = parseFloat(entries[i][key]); if (v > 0) return v; } return null; };
        const field = (id, label, unit, step = "0.1") => `<label class="block"><span class="text-[10px] font-bold uppercase tracking-wider text-zinc-500">${label}${unit ? ` (${unit})` : ""}</span>
          <input id="${id}" type="number" inputmode="decimal" step="${step}" min="0" class="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"></label>`;
        const seg = k => `<button class="body-range px-2.5 py-1 rounded-lg text-[11px] font-bold tap-active ${this.bodyRange === k ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-400"}" data-k="${k}">${k.toUpperCase()}</button>`;
        const meas = [["waist", "Waist"], ["chest", "Chest"], ["arms", "Arms"], ["thighs", "Thighs"]];
        root.innerHTML = `
          <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-xs font-bold text-white">Bodyweight</h3>
              <span class="text-[11px] text-zinc-400">${latest ? `<b class="text-white font-mono">${PT.num(latest.y)} ${u}</b>` : ""}${change !== null ? ` <span class="${change <= 0 ? "text-emerald-400" : "text-amber-400"} font-mono">${change > 0 ? "+" : ""}${PT.num(change)} in 4 wks</span>` : ""}</span>
            </div>
            ${chart}
            <div class="flex items-center justify-between"><span class="text-[10px] text-zinc-500"><span style="color:${PT.accent()}">━</span> 7-day average · <span class="text-zinc-500">●</span> daily</span><div class="flex gap-1.5">${seg("1m")}${seg("3m")}${seg("1y")}${seg("all")}</div></div>
            ${this.bodyTrendHtml(bw, avg)}
          </div>

          <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
            <h3 class="text-xs font-bold text-white">Log today</h3>
            <label class="block"><span class="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Date</span>
              <input id="bf-date" type="date" value="${PT.ds()}" class="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"></label>
            <div class="grid grid-cols-2 gap-2">
              ${field("bf-bw", "Bodyweight", u)}
              ${field("bf-bf", "Body fat", "%")}
            </div>
            <details id="bf-more" class="rounded-xl border border-zinc-800 bg-zinc-950/40">
              <summary><span>More: measurements &amp; nutrition</span><span class="pt-chev" aria-hidden="true">›</span></summary>
              <div class="grid grid-cols-2 gap-2 p-3 pt-1">
                ${meas.map(([k, t]) => field("bf-" + k, t, L)).join("")}
                ${field("bf-cal", "Calories", "kcal", "1")}
                ${field("bf-pro", "Protein", "g", "1")}
              </div>
            </details>
            <button id="bf-save" class="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs tap-active">Save Entry</button>
            <p class="text-[10px] text-zinc-500">Fill in only what you measured. Saving again on the same date updates that day.</p>
          </div>

          <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-2">
            <h3 class="text-xs font-bold text-white">Latest measurements</h3>
            <div class="grid grid-cols-3 gap-2 text-center">
              ${[["bf", "Body fat", "%"], ...meas.map(([k, t]) => [k, t, L])].map(([k, t, un]) => { const v = latestOf(k); return `<div class="bg-zinc-950 border border-zinc-800 rounded-xl p-2"><span class="block text-[10px] text-zinc-500 uppercase font-bold">${t}</span><span class="font-mono font-bold text-white text-sm">${v ? PT.num(v) + " " + un : "—"}</span></div>`; }).join("")}
            </div>
          </div>

          <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-xs font-bold text-white">Progress photos</h3>
              <label class="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg tap-active cursor-pointer">＋ Add Photo<input id="photo-input" type="file" accept="image/*" class="hidden"></label>
            </div>
            <div id="photo-grid" class="grid grid-cols-3 gap-2"><p class="col-span-3 text-xs text-zinc-500">Loading…</p></div>
            <div id="photo-actions" class="hidden flex gap-2">
              <button id="photo-compare" class="flex-1 py-2.5 bg-zinc-800 text-zinc-200 text-xs font-bold rounded-xl tap-active">Compare</button>
              <button id="photo-delete" class="px-4 py-2.5 bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs font-bold rounded-xl tap-active">Delete</button>
            </div>
            <p class="text-[10px] text-zinc-500">Photos use the date picked in "Log today". They stay on this phone only and are not part of the backup file. Tap two photos to compare.</p>
          </div>

          <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-2">
            <h3 class="text-xs font-bold text-white">History</h3>
            ${entries.length ? entries.slice().reverse().slice(0, 30).map(e => `<div class="flex items-center justify-between gap-2 text-xs bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2">
                <div class="min-w-0"><span class="text-zinc-300 font-semibold">${PT.esc(PT.fmtDate(e.date))}</span>
                <span class="block text-[11px] text-zinc-500 font-mono truncate">${[e.bw ? PT.num(e.bw) + " " + u : "", e.bf ? PT.num(e.bf) + "%" : "", ...meas.map(([k, t]) => e[k] ? t[0] + " " + PT.num(e[k]) : ""), e.cal ? e.cal + " kcal" : "", e.pro ? e.pro + "g P" : ""].filter(Boolean).join(" · ")}</span></div>
                <button class="body-del shrink-0 px-2 py-1 text-zinc-500 hover:text-rose-400 tap-active" data-id="${PT.esc(e.id)}" aria-label="Delete entry">✕</button></div>`).join("")
              : `<p class="text-xs text-zinc-500">No entries yet.</p>`}
          </div>`;

        // Prefill the form if today's entry exists
        const fillFor = ds => {
          const e = this.body.find(x => x.date === ds) || {};
          ["bw", "bf", "waist", "chest", "arms", "thighs", "cal", "pro"].forEach(k => { const el = document.getElementById("bf-" + k); if (el) el.value = e[k] || ""; });
        };
        fillFor(PT.ds());
        document.getElementById("bf-date").addEventListener("change", (e) => fillFor(e.target.value));
        root.querySelectorAll(".body-range").forEach(b => b.addEventListener("click", () => { this.bodyRange = b.dataset.k; this.renderBodyView(); }));
        document.getElementById("bf-save").addEventListener("click", async () => {
          const date = document.getElementById("bf-date").value || PT.ds();
          if (isNaN(PT.fromDs(date))) { await PT.alert("Pick a valid date."); return; }
          const rec = { date };
          let any = false;
          ["bw", "bf", "waist", "chest", "arms", "thighs", "cal", "pro"].forEach(k => {
            const v = parseFloat(document.getElementById("bf-" + k).value);
            if (v > 0) { rec[k] = Math.round(v * 10) / 10; any = true; }
          });
          if (!any) { await PT.alert("Enter at least one number."); return; }
          const existing = this.body.find(x => x.date === date);
          if (existing) {
            ["bw", "bf", "waist", "chest", "arms", "thighs", "cal", "pro"].forEach(k => { delete existing[k]; });
            Object.assign(existing, rec);
          } else this.body.push(Object.assign({ id: PT.uid() }, rec));
          PT.save(STORAGE_KEY_BODY, this.body);
          this.onBodyChanged();
          this.toast("Saved");
          this.renderBodyView();
        });
        root.querySelectorAll(".body-del").forEach(b => b.addEventListener("click", async () => {
          if (!await PT.confirm("Delete this entry?")) return;
          const gone = this.body.find(x => x.id === b.dataset.id);
          this.body = this.body.filter(x => x.id !== b.dataset.id);
          PT.save(STORAGE_KEY_BODY, this.body);
          this.onBodyChanged();
          this.renderBodyView();
          if (gone) this.toast("Entry deleted", "Undo", () => {
            this.body.push(gone); PT.save(STORAGE_KEY_BODY, this.body); this._bwList = null;
            this.onBodyChanged(); this.renderBodyView(); this.toast("Entry restored");
          }, 10000);
        }));
        document.getElementById("photo-input").addEventListener("change", async (e) => {
          const f = e.target.files && e.target.files[0];
          e.target.value = "";
          if (!f) return;
          try {
            const blob = await ptCompressImage(f);
            const dEl = document.getElementById("bf-date");
            const pd = dEl && !isNaN(PT.fromDs(dEl.value)) ? dEl.value : PT.ds();
            const pts = pd === PT.ds() ? Date.now() : PT.fromDs(pd).getTime() + 12 * 3600000;
            await PhotoDB.put({ id: PT.uid(), date: pd, ts: pts, blob });
            this.toast("Photo saved");
            this.renderPhotos();
          } catch (err) { await PT.alert("Could not save the photo: " + (err && err.message ? err.message : err)); }
        });
        document.getElementById("photo-compare").addEventListener("click", () => this.comparePhotos());
        document.getElementById("photo-delete").addEventListener("click", async () => {
          if (!this.photoSel.length || !await PT.confirm(`Delete ${this.photoSel.length} photo(s)? This can't be undone.`)) return;
          for (const id of this.photoSel) { try { await PhotoDB.del(id); } catch (err) {} }
          this.photoSel = [];
          this.renderPhotos();
        });
        this.renderPhotos();
      },

      revokePhotoUrls(scope) {
        this.photoUrls = this.photoUrls.filter(x => {
          if (!scope || x.scope === scope) { URL.revokeObjectURL(x.url); return false; }
          return true;
        });
      },
      photoUrl(blob, scope) {
        const url = URL.createObjectURL(blob);
        this.photoUrls.push({ url, scope });
        return url;
      },
      async renderPhotos() {
        const grid = document.getElementById("photo-grid");
        if (!grid) return;
        let photos = [];
        try { photos = await PhotoDB.all(); } catch (err) {
          grid.innerHTML = `<p class="col-span-3 text-xs text-rose-400">Photos are not available in this browser.</p>`;
          return;
        }
        this.revokePhotoUrls("grid");
        photos.sort((a, b) => (b.ts || 0) - (a.ts || 0));
        this._photos = photos;
        this.photoSel = this.photoSel.filter(id => photos.some(p => p.id === id));
        grid.innerHTML = photos.length ? photos.map(p => {
          const sel = this.photoSel.indexOf(p.id);
          return `<button class="photo-item relative aspect-[3/4] rounded-xl overflow-hidden border-2 ${sel >= 0 ? "border-emerald-500" : "border-zinc-800"} tap-active" data-id="${PT.esc(p.id)}">
            <img src="${this.photoUrl(p.blob, "grid")}" alt="Progress photo ${PT.esc(p.date)}" class="w-full h-full object-cover">
            <span class="absolute bottom-0 inset-x-0 bg-black/60 text-[10px] text-white font-semibold py-0.5">${PT.esc(PT.fmtDate(p.date, { month: "short", day: "numeric", year: "2-digit" }))}</span>
            ${sel >= 0 ? `<span class="absolute top-1 right-1 w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center">${sel + 1}</span>` : ""}
          </button>`;
        }).join("") : `<p class="col-span-3 text-xs text-zinc-500">No photos yet.</p>`;
        grid.querySelectorAll(".photo-item").forEach(b => b.addEventListener("click", () => {
          const id = b.dataset.id, i = this.photoSel.indexOf(id);
          if (i >= 0) this.photoSel.splice(i, 1);
          else { this.photoSel.push(id); if (this.photoSel.length > 2) this.photoSel.shift(); }
          this.renderPhotos();
        }));
        const actions = document.getElementById("photo-actions");
        actions.classList.toggle("hidden", !this.photoSel.length);
        actions.classList.toggle("flex", !!this.photoSel.length);
        document.getElementById("photo-compare").disabled = this.photoSel.length !== 2;
        document.getElementById("photo-compare").classList.toggle("opacity-40", this.photoSel.length !== 2);
      },
      comparePhotos() {
        if (this.photoSel.length !== 2) return;
        const ps = this.photoSel.map(id => (this._photos || []).find(p => p.id === id)).filter(Boolean)
          .sort((a, b) => (a.ts || 0) - (b.ts || 0));
        if (ps.length !== 2) return;
        const days = Math.round(((ps[1].ts || 0) - (ps[0].ts || 0)) / 86400000);
        const html = `<div class="grid grid-cols-2 gap-2">${ps.map(p => `<figure class="space-y-1"><img src="${this.photoUrl(p.blob, "sheet")}" class="w-full rounded-xl border border-zinc-800" alt="Progress photo ${PT.esc(p.date)}"><figcaption class="text-[11px] text-center text-zinc-400 font-semibold">${PT.esc(PT.fmtDate(p.date))}</figcaption></figure>`).join("")}</div>`;
        this.openSheet("Compare photos", `${days} days apart`, html, "");
      },

      /* --------------------------------------------------- backup & export */
      async shareFile(file, title) {
        try {
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title });
            return true;
          }
        } catch (err) {
          if (err && err.name === "AbortError") return false;
        }
        const url = URL.createObjectURL(file);
        const a = document.createElement("a");
        a.href = url; a.download = file.name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 5000);
        return true;
      },
      async exportBackup() {
        const keys = {};
        for (let i = 0; i < PTLS.length; i++) {
          const k = PTLS.key(i);
          if (k && k.startsWith("pulsetrack_") && k !== STORAGE_KEY_SESSION_START && k !== "pulsetrack_cardio_timer_v1" && k !== "pulsetrack_cleanup_undo_v1") keys[k] = PTLS.getItem(k);
        }
        const payload = { app: "PulseTrack", schemaVersion: BACKUP_SCHEMA, appVersion: APP_VERSION, exportedAt: new Date().toISOString(), keys };
        const file = new File([JSON.stringify(payload)], `pulsetrack-backup-${PT.ds()}.json`, { type: "application/json" });
        const ok = await this.shareFile(file, "PulseTrack backup");
        if (ok) {
          this.settings.lastBackupAt = Date.now();
          WorkoutStorage.saveSettings(this.settings);
          this.renderHomeBanners();
          this.renderSettingsExtras();
          this.toast("Backup created. Keep the file somewhere safe (Files, iCloud, Drive).");
        }
      },
      importBackup(file) {
        const reader = new FileReader();
        reader.onerror = async () => await PT.alert("Could not read that file.");
        reader.onload = async () => {
          let payload;
          try { payload = JSON.parse(reader.result); } catch (e) { await PT.alert("That file isn't a valid PulseTrack backup."); return; }
          if (payload && payload.pulsetrackProgram) { this.importProgramObject(payload.program); return; }
          if (!payload || payload.app !== "PulseTrack" || !payload.keys || typeof payload.keys !== "object") { await PT.alert("That file isn't a PulseTrack backup."); return; }
          const entries = Object.entries(payload.keys).filter(([k, v]) => k.startsWith("pulsetrack_") && typeof v === "string");
          if (!entries.length) { await PT.alert("The backup is empty."); return; }
          const when = payload.exportedAt ? new Date(payload.exportedAt).toLocaleString() : "an unknown date";
          if (!await PT.confirm(`Restore the backup from ${when}?\n\nThis REPLACES all PulseTrack data on this phone (programs, history, PRs, settings). Progress photos are not affected.`)) return;
          const old = [];
          for (let i = 0; i < PTLS.length; i++) { const k = PTLS.key(i); if (k && k.startsWith("pulsetrack_")) old.push(k); }
          old.forEach(k => PTLS.removeItem(k));
          let failed = 0;
          entries.forEach(([k, v]) => { if (!safeSetItem(k, v)) failed++; });
          await PT.alert(failed ? `Restored with ${failed} item(s) that did not fit in storage.` : "Backup restored. The app will reload.");
          location.reload();
        };
        reader.readAsText(file);
      },
      async exportCSV() {
        if (!this.sessions.length) { await PT.alert("No saved workouts to export yet."); return; }
        const head = ["Date", "Program", "Week", "Day", "Exercise", "Category", "Set", "Tag", "Weight", "Unit", "Reps", "Est 1RM", "Duration (min)", "Workout Notes", "Exercise Note", "Load incl. bodyweight", "Cardio minutes", "Distance", "Distance unit"];
        const rows = [head.join(",")];
        const tagName = { R: "Working", W: "Warm-up", D: "Drop", F: "Failure" };
        this.sessions.slice().sort((a, b) => (a.ts || 0) - (b.ts || 0)).forEach(s => (s.ex || []).forEach(e => (e.sets || []).forEach((st, i) => {
          rows.push([s.date, s.ptitle, s.week || "", s.dtitle, e.name, PT.category(e.name), i + 1, tagName[st.t] || st.t, st.w, s.unit || "lb", st.r,
            st.t === "W" ? "" : this.setE1rm(e.name, st, s.date) || "", Math.round((s.dur || 0) / 60), s.note || "", this.exNotes[e.name] || "",
            (PT.isBodyweightEx(e.name) || st.bz) ? this.setLoad(e.name, st, s.date) : "", st.min !== undefined ? st.min : "", st.dist !== undefined ? st.dist : "", st.dist !== undefined ? this.distLabel(s.unit) : ""].map(PT.csvCell).join(","));
        })));
        const file = new File(["﻿" + rows.join("\r\n")], `pulsetrack-workouts-${PT.ds()}.csv`, { type: "text/csv" });
        this.shareFile(file, "PulseTrack workouts CSV");
      },
      async requestPersist(userAsked) {
        this.settings.persistAsked = true;
        WorkoutStorage.saveSettings(this.settings);
        if (!(navigator.storage && navigator.storage.persist)) { if (userAsked) await PT.alert("This browser doesn't support protected storage. Regular backups are your safety net."); return false; }
        let ok = false;
        try { ok = (await navigator.storage.persisted()) || (await navigator.storage.persist()); } catch (e) { ok = false; }
        if (userAsked) this.toast(ok ? "Storage protected ✓" : "The browser declined. Keep making backups — installing to the home screen helps.");
        this.renderSettingsExtras();
        return ok;
      },

      /* -------------------------------------------------------- settings */
      async renderSettingsExtras() {
        const $ = id => document.getElementById(id);
        if (!$("setting-increment")) return;
        this.renderSettingsV3();
        document.querySelectorAll(".btn-unit").forEach(b => {
          b.className = "btn-unit flex-1 py-2 rounded-lg text-xs font-bold tap-active " + (b.dataset.unit === this.unit() ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-400");
        });
        $("setting-increment").value = this.increment();
        $("setting-increment-unit").innerText = this.unit();
        $("setting-weekly-goal").value = String(parseInt(this.settings.weeklyGoal, 10) || 3);
        if ($("setting-week-start")) $("setting-week-start").value = ["sun", "mon"].includes(this.settings.weekStart) ? this.settings.weekStart : "auto";
        $("setting-toggle-resetfinish").checked = this.settings.resetAfterFinish !== false;
        $("setting-toggle-vibrate").checked = this.settings.vibrate !== false;
        $("setting-toggle-largetext").checked = !!this.settings.largeText;
        $("setting-toggle-restnotify").checked = !!this.settings.restNotify && ("Notification" in window) && Notification.permission === "granted";
        const last = this.settings.lastBackupAt;
        $("backup-status").innerText = last ? `Last backup: ${new Date(last).toLocaleDateString()} (${Math.floor((Date.now() - last) / 86400000)} days ago)` : "No backup yet — make one now.";
        $("app-version").innerText = "v" + APP_VERSION;
        this.refreshInstallUI();
        let bytes = 0;
        for (let i = 0; i < PTLS.length; i++) {
          const k = PTLS.key(i);
          if (k && k.startsWith("pulsetrack_")) bytes += (k.length + (PTLS.getItem(k) || "").length) * 2;
        }
        let persisted = null, usage = 0;
        try { if (navigator.storage && navigator.storage.persisted) persisted = await navigator.storage.persisted(); } catch (e) {}
        try { if (navigator.storage && navigator.storage.estimate) usage = (await navigator.storage.estimate()).usage || 0; } catch (e) {}
        $("storage-status").innerHTML = `Saved data: <b class="text-white font-mono">${(bytes / 1048576).toFixed(2)} MB</b> · <span class="text-emerald-400 font-semibold">No size limit</span>${usage > bytes ? ` · everything incl. photos: <span class="font-mono text-zinc-200">${(usage / 1048576).toFixed(1)} MB</span>` : ""} · ${persisted === true ? `<span class="text-emerald-400 font-semibold">Protected ✓</span>` : persisted === false ? `<span class="text-amber-400 font-semibold">Not protected</span>` : "Protection unknown"}`;
        $("btn-persist").classList.toggle("hidden", persisted === true);
      },
      refreshInstallUI() {
        const btn = document.getElementById("btn-install-app");
        if (btn) btn.classList.toggle("hidden", !window.__ptInstallEvent);
        const hint = document.getElementById("install-hint");
        if (hint) {
          hint.innerText = PT.isStandalone() ? "Installed on the home screen ✓"
            : PT.isIOS() ? "To install: Safari → Share → Add to Home Screen."
            : window.__ptInstallEvent ? "This app can be installed." : "Use your browser menu → Install app / Add to Home Screen.";
        }
      },
      async changeUnit(u) {
        if (u !== "kg" && u !== "lb") return;
        if (u === this.unit()) return;
        const hasData = this.sessions.length || Object.keys(this.prs).length || Object.keys(this.lastPerf).length || this.body.length;
        let convert = false;
        if (hasData) {
          const pick = await PT.choose(`Switch to ${u}?`, ["Convert my saved numbers", "Only change the labels"], { title: `Switch to ${u}?`, body: `Convert changes your history, PRs, last-time values, body weight and measurements to ${u}.\n\nOnly change the labels keeps every number exactly as it is.`, cancel: "Cancel" });
          if (pick < 0) { this.renderSettingsExtras(); return; }
          convert = pick === 0;
        }
        if (convert) this.convertAllWeights(u === "kg" ? KG_PER_LB : 1 / KG_PER_LB, u === "kg" ? 2.54 : 1 / 2.54);
        this.settings.unit = u;
        if (this.settings.increment) this.settings.increment = "";
        if (convert && this.settings.goals) {
          const f = u === "kg" ? KG_PER_LB : 1 / KG_PER_LB;
          Object.keys(this.settings.goals).forEach(k => { this.settings.goals[k] = Math.round(this.settings.goals[k] * f / 5) * 5; });
        }
        WorkoutStorage.saveSettings(this.settings);
        this.selectedBarWeight = this.savedBar();
        this.applyUnitLabels();
        this.renderSettingsExtras();
        this.renderHomeView();
        this.toast(`Units: ${u}`);
      },
      convertAllWeights(f, lenF) {
        const r = v => { const n = parseFloat(v); return n > 0 ? Math.round(n * f * 2) / 2 : v; };
        Object.keys(this.logs).forEach(k => { const e = this.logs[k]; if (e && typeof e === "object" && e.weight !== "" && e.weight !== undefined) e.weight = String(r(e.weight)); });
        WorkoutStorage.saveLogs(this.logs);
        Object.keys(this.lastPerf).forEach(k => (this.lastPerf[k] || []).forEach(st => { st.weight = r(st.weight); }));
        WorkoutStorage.saveLastPerf(this.lastPerf);
        Object.keys(this.prBase).forEach(k => { this.prBase[k] = Math.round(parseFloat(this.prBase[k]) * f) || 0; });
        PT.save(STORAGE_KEY_PRBASE, this.prBase);
        const dF = f < 1 ? 1 / MI_PER_KM : MI_PER_KM;
        const rd = v => Math.round(parseFloat(v) * dF * 100) / 100;
        this.sessions.forEach(s => { (s.ex || []).forEach(e => (e.sets || []).forEach(st => {
          st.w = r(st.w);
          if (st.bw) st.bw = Math.round(st.bw * f * 10) / 10;
          if (parseFloat(st.dist) > 0) st.dist = rd(st.dist);
        })); s.vol = Math.round((s.vol || 0) * f); s.unit = f < 1 ? "kg" : "lb"; });
        Object.keys(this.logs).forEach(k => { const e = this.logs[k]; if (e && typeof e === "object" && parseFloat(e.dist) > 0) e.dist = String(rd(e.dist)); });
        WorkoutStorage.saveLogs(this.logs);
        Object.keys(this.lastPerf).forEach(k => (this.lastPerf[k] || []).forEach(st => { if (parseFloat(st.dist) > 0) st.dist = rd(st.dist); }));
        WorkoutStorage.saveLastPerf(this.lastPerf);
        this.saveSessions();
        this.body.forEach(b => {
          if (b.bw) b.bw = Math.round(b.bw * f * 10) / 10;
          ["waist", "chest", "arms", "thighs"].forEach(k => { if (b[k]) b[k] = Math.round(b[k] * lenF * 10) / 10; });
        });
        PT.save(STORAGE_KEY_BODY, this.body);
        this._bwList = null;
        this.recomputeVolumes();
        this.rebuildPRs();
      },

      /* ----------------------------------------------- PWA: updates/install */
      setupPWA() {
        if ("serviceWorker" in navigator) {
          const hadController = !!navigator.serviceWorker.controller;
          navigator.serviceWorker.addEventListener("controllerchange", () => {
            if (!hadController || this._reloading) return;
            this.toast("A new version of PulseTrack is ready.", "Reload", () => { this._reloading = true; location.reload(); }, 0);
          });
        }
        window.addEventListener("appinstalled", () => { window.__ptInstallEvent = null; this.refreshInstallUI(); this.toast("PulseTrack installed ✓"); });
      },

      /* ------------------------------------------------- program sharing */
      cleanProgramForShare(p) {
        const c = JSON.parse(JSON.stringify(p));
        (c.days || []).forEach(d => {
          delete d.removed; delete d.orig;
          (d.exercises || []).forEach(e => { delete e.origName; delete e.origSets; delete e.added; delete e.takenOn; });
        });
        return c;
      },
      async shareProgram(program) {
        const payload = { pulsetrackProgram: 1, program: this.cleanProgramForShare(program) };
        const json = JSON.stringify(payload);
        const link = location.origin + location.pathname + "#import=" + PT.b64urlEncode(json);
        if (link.length <= 7000) {
          try {
            if (navigator.share) { await navigator.share({ title: program.title, text: `PulseTrack program: ${program.title}`, url: link }); return; }
          } catch (err) { if (err && err.name === "AbortError") return; }
          try { await navigator.clipboard.writeText(link); this.toast("Link copied — send it to anyone with PulseTrack"); return; } catch (err) {}
          await PT.prompt("Share link", link, { readonly: true, copy: true, ok: "Copy link", cancel: "Close", title: "Share this program", body: "Copy this link and send it to anyone who has PulseTrack." });
          return;
        }
        const slug = String(program.title || "program").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "program";
        const file = new File([json], `${slug}.pulsetrack.json`, { type: "application/json" });
        const ok = await this.shareFile(file, program.title);
        if (ok) this.toast("This program is big, so it was shared as a file. Open it in PulseTrack → Programs → Import.", null, null, 6000);
      },
      importProgramFile(file) {
        const reader = new FileReader();
        reader.onerror = async () => await PT.alert("Could not read that file.");
        reader.onload = async () => {
          let obj;
          try { obj = JSON.parse(reader.result); } catch (e) { await PT.alert("That file isn't valid program JSON."); return; }
          if (obj && obj.app === "PulseTrack" && obj.keys) { await PT.alert("That's a full backup. Restore it from Settings → Data & Backup instead."); return; }
          this.importProgramObject(obj && obj.pulsetrackProgram ? obj.program : obj);
        };
        reader.readAsText(file);
      },
      async importProgramObject(p) {
        const clean = t => String(t === undefined || t === null ? "" : t).replace(/[<>]/g, "").trim();
        if (!p || typeof p !== "object" || !Array.isArray(p.days) || !p.days.length) { await PT.alert("That doesn't look like a PulseTrack program."); return false; }
        const days = p.days.filter(d => d && Array.isArray(d.exercises)).map((d, di) => ({
          dayNumber: parseInt(d.dayNumber, 10) || di + 1,
          title: clean(d.title) || ("Day " + (di + 1)),
          estimatedMinutes: parseInt(d.estimatedMinutes, 10) || 45,
          exercises: d.exercises.filter(e => e && e.name).map((e, ei) => {
            const ex = {
              id: clean(e.id) || `imp_d${di + 1}_e${ei + 1}`,
              name: clean(e.name),
              sets: Math.max(1, Math.min(50, parseInt(e.sets, 10) || 3)),
              reps: clean(e.reps) || "10",
              restSeconds: Number.isFinite(parseInt(e.restSeconds, 10)) ? Math.max(0, parseInt(e.restSeconds, 10)) : 60,
              type: clean(e.type) || "standard"
            };
            if (e.notes) ex.notes = clean(e.notes);
            if (e.link) ex.link = true;
            if (e.workSeconds) ex.workSeconds = parseInt(e.workSeconds, 10) || 20;
            return ex;
          })
        }));
        const seenDays = new Set();
        days.forEach((d, i) => { if (seenDays.has(d.dayNumber)) d.dayNumber = Math.max(...days.map(x => x.dayNumber)) + 1 + i; seenDays.add(d.dayNumber); });
        days.forEach(d => { const seen = new Set(); d.exercises.forEach((e, i) => { if (seen.has(e.id)) e.id = e.id + "_" + i; seen.add(e.id); }); });
        days.forEach(d => { d.orig = JSON.parse(JSON.stringify(d.exercises)); });
        if (!days.some(d => d.exercises.length)) { await PT.alert("That program has no exercises."); return false; }
        const title = clean(p.title) || "Shared Program";
        if (!await PT.confirm(`Add the program "${title}" (${days.length} days) to PulseTrack?`)) return false;
        if (!this.data || !Array.isArray(this.data.programs)) this.data = { programs: [] };
        let id = clean(p.id) || ("shared_" + Date.now());
        if (this.data.programs.some(x => x.id === id)) id = id + "_" + Date.now().toString(36);
        this.data.programs.push({ id, title, description: clean(p.description) || "Shared program", tags: Array.isArray(p.tags) ? p.tags.map(clean).filter(Boolean).slice(0, 6) : ["Shared"], days });
        if (!WorkoutStorage.setData(this.data)) { this.data.programs.pop(); return false; }
        this.toast(`Added "${title}"`);
        this.showView("programs");
        return true;
      },
      checkImportHash() {
        const h = location.hash || "";
        if (!h.startsWith("#import=")) return;
        let obj = null;
        try { obj = JSON.parse(PT.b64urlDecode(h.slice(8))); } catch (e) { obj = null; }
        try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
        if (!obj || !obj.pulsetrackProgram) { setTimeout(async () => await PT.alert("That program link is broken or incomplete."), 300); return; }
        setTimeout(() => this.importProgramObject(obj.program), 400);
      },

      /* -------------------------------------------------- share as image */
      async prepareShareImage(session) {
        const W = 1080, H = 1350;
        const c = document.createElement("canvas");
        c.width = W; c.height = H;
        const g = c.getContext("2d");
        const acc = PT.accent();
        const grad = g.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, "#18181b"); grad.addColorStop(1, "#09090b");
        g.fillStyle = grad; g.fillRect(0, 0, W, H);
        g.fillStyle = acc; g.fillRect(0, 0, W, 14);
        const font = (w, s) => `${w} ${s}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;
        const fit = (text, max, weight, size) => { let s = size; g.font = font(weight, s); while (g.measureText(text).width > max && s > 20) { s -= 2; g.font = font(weight, s); } return s; };
        g.textBaseline = "alphabetic";
        g.fillStyle = acc; g.font = font(900, 44); g.fillText("PULSETRACK", 80, 120);
        g.fillStyle = "#a1a1aa"; g.font = font(600, 34);
        g.fillText(PT.fmtDate(session.date, { weekday: "long", month: "long", day: "numeric", year: "numeric" }), 80, 175);
        g.fillStyle = "#ffffff"; fit(session.dtitle, W - 160, 900, 76); g.fillText(session.dtitle, 80, 290);
        g.fillStyle = "#a1a1aa"; fit(session.ptitle, W - 160, 600, 36); g.fillText(session.ptitle, 80, 345);
        const u = session.unit === "kg" ? "kg" : "lbs";
        const stats = [["TIME", PT.fmtDur(session.dur)], ["VOLUME", `${Math.round(session.vol || 0).toLocaleString()} ${u}`], ["SETS", String(session.sets)], ["PRs", String((session.prs || []).length)]];
        stats.forEach(([k, v], i) => {
          const x = 80 + (i % 2) * 470, y = 410 + Math.floor(i / 2) * 190;
          g.fillStyle = "#18181b"; g.strokeStyle = "#27272a"; g.lineWidth = 3;
          if (g.roundRect) { g.beginPath(); g.roundRect(x, y, 440, 160, 28); g.fill(); g.stroke(); } else { g.fillRect(x, y, 440, 160); }
          g.fillStyle = "#71717a"; g.font = font(800, 28); g.fillText(k, x + 36, y + 58);
          g.fillStyle = k === "PRs" ? "#fbbf24" : k === "VOLUME" ? acc : "#ffffff"; fit(v, 370, 900, 60); g.fillText(v, x + 36, y + 128);
        });
        let y = 850;
        g.fillStyle = "#71717a"; g.font = font(800, 28); g.fillText("TOP SETS", 80, y); y += 22;
        (session.ex || []).slice(0, 7).forEach(e => {
          const work = (e.sets || []).filter(s => s.t !== "W");
          const best = (work.length ? work : e.sets).reduce((a, s) => (this.setE1rm(e.name, s, session.date) > this.setE1rm(e.name, a, session.date) ? s : a), (work.length ? work : e.sets)[0]);
          y += 58;
          const pr = (session.prs || []).includes(e.name);
          g.fillStyle = "#e4e4e7"; fit(e.name, 640, 700, 36); g.fillText(e.name, 80, y);
          g.fillStyle = pr ? "#fbbf24" : "#a1a1aa"; g.font = font(800, 36); g.textAlign = "right";
          g.fillText(`${pr ? "PR  " : ""}${this.setText(e.name, best, "", session.unit)}`, W - 80, y);
          g.textAlign = "left";
        });
        g.fillStyle = "#52525b"; g.font = font(600, 26); g.fillText("Tracked with PulseTrack", 80, H - 60);
        const blob = await new Promise((res, rej) => c.toBlob(b => b ? res(b) : rej(new Error("toBlob failed")), "image/png"));
        return new File([blob], `pulsetrack-${session.date}.png`, { type: "image/png" });
      },
      async shareSummaryImage() {
        const s = this.lastSummary && this.lastSummary.session;
        if (!s) return;
        try {
          const f = this._shareFile || await this.prepareShareImage(s);
          await this.shareFile(f, "PulseTrack workout");
        } catch (err) { this.toast("Could not create the image"); }
      }
    });
  