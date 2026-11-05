
    /* =====================================================================
     * PulseTrack 2.1 — smart rest times, swap suggestions, gym plates,
     * save-as-routine, rep records, helper-muscle volume.
     * ===================================================================== */
    const PLATE_OPTIONS = {
      lb: [100, 55, 45, 35, 25, 15, 10, 5, 2.5, 1.25],
      kg: [50, 25, 20, 15, 10, 5, 2.5, 2, 1.25, 1, 0.5, 0.25]
    };
    const PLATE_DEFAULTS = {
      lb: [45, 35, 25, 10, 5, 2.5],
      kg: [25, 20, 15, 10, 5, 2.5, 1.25]
    };
    const BAR_PRESETS = { lb: [45, 35, 15, 0], kg: [20, 15, 10, 0] };
    const REST_DEFAULTS = { heavy: 180, compound: 120, isolation: 90, short: 60 };
    const REST_LABELS = { heavy: "Heavy compound", compound: "Other compound", isolation: "Isolation", short: "Abs & cardio" };
    const REST_CHOICES = [30, 45, 60, 75, 90, 105, 120, 150, 180, 210, 240, 300];

    Object.assign(PT, {
      /** heavy = big barbell lifts, compound = multi-joint, isolation = single-joint, short = abs/cardio */
      liftClass(name) {
        const n = String(name || "").toLowerCase();
        const cat = PT.category(name);
        if (cat === "Cardio" || cat === "Core") return "short";
        const iso = /curl|extension|raise|\bfly\b|flye|flies|crossover|cross-over|kickback|pushdown|push-down|pullover|pull-over|shrug|face pull|pec deck|adduct|abduct|wrist|calf|calves|skull|preacher|concentration|rear delt|french press|tricep(s)? press|jm press|pull-?through|glute bridge|frog pump|kick-?back/;
        if (iso.test(n)) return "isolation";
        const light = /bodyweight|body weight|\bair\b|dumbbell|\bdb\b|machine|cable|smith|kettlebell|band|goblet|landmine|single[- ]arm|one[- ]arm|split|bulgarian|sissy|hack|pistol|jump|wall|cossack|close-?grip|hammer strength|plate-loaded|lever/;
        const heavy = /deadlift|rack pull|squat|bench press|overhead press|military press|push press|strict press|\bohp\b|pendlay|barbell row|bent[- ]over (barbell )?row|yates row|clean|snatch|jerk/;
        if (heavy.test(n) && !light.test(n)) return "heavy";
        const compound = /press|row|pull-?up|chin-?up|pulldown|pull-down|\bdips?\b|squat|lunge|deadlift|\brdl\b|romanian|step-?up|hip thrust|thrust|clean|swing|push-?up|muscle-?up|t-bar|sled|carry|farmer|good morning|split|bulgarian/;
        if (compound.test(n)) return "compound";
        if (["Biceps", "Triceps", "Forearms", "Traps", "Other"].includes(cat)) return "isolation";
        return "compound";
      },
      fmtRest(sec) {
        sec = Math.max(0, Math.round(parseFloat(sec) || 0));
        if (sec < 60) return sec + "s";
        return Math.floor(sec / 60) + ":" + String(sec % 60).padStart(2, "0");
      },
      /** Muscles that also work hard on a lift (counted as half a set when turned on). */
      helperMuscles(name, cat) {
        const n = String(name || "").toLowerCase();
        const out = [];
        if (cat === "Chest" && /press|push-?up|\bdips?\b/.test(n)) { out.push(["Triceps", 0.5], ["Shoulders", 0.5]); }
        else if (cat === "Shoulders" && /press|military|overhead|\bohp\b/.test(n) && !/raise/.test(n)) out.push(["Triceps", 0.5]);
        else if (cat === "Back" && /row|pull-?up|chin-?up|pulldown|pull-down/.test(n)) out.push(["Biceps", 0.5]);
        else if (cat === "Back" && /deadlift|rack pull/.test(n)) out.push(["Legs", 0.5]);
        else if (cat === "Legs" && /deadlift|\brdl\b|romanian|good morning/.test(n)) out.push(["Back", 0.5]);
        else if (cat === "Triceps" && /close-?grip|\bdips?\b|jm press/.test(n)) out.push(["Chest", 0.5]);
        return out;
      }
    });

    Object.assign(ApplicationUI.prototype, {

      initV3() {
        const s = this.settings;
        if (s.restMode !== "auto" && s.restMode !== "smart") s.restMode = "auto";
        if (!s.restTimes || typeof s.restTimes !== "object") s.restTimes = {};
        if (!s.restOverrides || typeof s.restOverrides !== "object" || Array.isArray(s.restOverrides)) s.restOverrides = {};
        this.applyUnitLabels();
        this.renderPlateInventory();
        this.bindV3();
      },

      bindV3() {
        const on = (id, ev, fn) => { const el = document.getElementById(id); if (el) el.addEventListener(ev, fn); };
        document.querySelectorAll(".btn-restmode").forEach(b => b.addEventListener("click", () => {
          this.settings.restMode = b.dataset.mode === "smart" ? "smart" : "auto";
          WorkoutStorage.saveSettings(this.settings);
          this.renderSettingsV3();
          this.refreshWorkoutIfOpen();
        }));
        document.querySelectorAll(".sel-rest").forEach(sel => sel.addEventListener("change", () => {
          const v = parseInt(sel.value, 10);
          if (v > 0) this.settings.restTimes[sel.dataset.k] = v;
          WorkoutStorage.saveSettings(this.settings);
          this.refreshWorkoutIfOpen();
        }));
        on("btn-clear-rest-overrides", "click", async () => {
          const n = Object.keys(this.settings.restOverrides || {}).length;
          if (!n) return;
          if (!await PT.confirm(`Remove your custom rest time on ${n} exercise${n > 1 ? "s" : ""}?`)) return;
          this.settings.restOverrides = {};
          WorkoutStorage.saveSettings(this.settings);
          this.renderSettingsV3();
          this.refreshWorkoutIfOpen();
        });
        on("btn-edit-gym-plates", "click", () => {
          this.closeSettings();
          this.openPlateCalc();
          const inv = document.getElementById("plate-inventory");
          if (inv && inv.scrollIntoView) setTimeout(() => inv.scrollIntoView({ block: "center", behavior: "smooth" }), 60);
        });
        on("btn-summary-template", "click", () => {
          const s = this.lastSummary && this.lastSummary.session;
          if (s) this.openSaveRoutine(s);
        });
      },

      refreshWorkoutIfOpen() {
        if (this.dom.viewWorkout && !this.dom.viewWorkout.classList.contains("hidden")) this.renderWorkoutView();
      },

      /* ---------------------------------------------------------- rest times */
      restTimes() {
        const t = Object.assign({}, REST_DEFAULTS);
        Object.keys(t).forEach(k => { const v = parseInt((this.settings.restTimes || {})[k], 10); if (v > 0) t[k] = v; });
        return t;
      },
      smartRest(name) { return this.restTimes()[PT.liftClass(name)] || 90; },
      // Combos (supersets, giant sets, Tabata) are timed by the program on purpose.
      isComboExercise(ex) {
        return !!ex && (["superset", "dtp", "tabata", "giant"].includes(String(ex.type || "").toLowerCase())
          || / w\/ |&|\bgiant\b|\bsuperset\b|\bcircuit\b/i.test(ex.name || ""));
      },
      defaultRestFor(ex) {
        const prog = parseInt(ex && ex.restSeconds, 10);
        const fromProgram = prog > 0 && !ex.origName && !ex.restAuto;
        if (fromProgram && (this.settings.restMode !== "smart" || this.isComboExercise(ex))) return { sec: prog, why: "program" };
        return { sec: this.smartRest(ex && ex.name), why: PT.liftClass(ex && ex.name) };
      },
      restFor(ex) {
        if (!ex) return 60;
        const ov = parseInt((this.settings.restOverrides || {})[ex.name], 10);
        return ov > 0 ? ov : this.defaultRestFor(ex).sec;
      },
      openRestEditor(exIndex) {
        const ex = this.activeDay && this.activeDay.exercises[exIndex];
        if (!ex) return;
        const cur = this.restFor(ex);
        const def = this.defaultRestFor(ex);
        const hasOv = parseInt((this.settings.restOverrides || {})[ex.name], 10) > 0;
        const why = def.why === "program" ? "the program's time" : REST_LABELS[def.why].toLowerCase();
        const chip = sec => `<button class="rest-pick py-2.5 rounded-xl text-sm font-bold font-mono tap-active ${sec === cur ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-300"}" data-sec="${sec}">${PT.fmtRest(sec)}</button>`;
        const body = `
          <p class="text-xs text-zinc-400 leading-relaxed">Pick how long to rest between sets. It's saved for <b class="text-zinc-200">${PT.esc(ex.name)}</b> in every program and workout.</p>
          <div class="grid grid-cols-4 gap-2">${REST_CHOICES.map(chip).join("")}</div>
          <div class="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-[11px] text-zinc-400">Default for this exercise: <b class="text-zinc-200 font-mono">${PT.fmtRest(def.sec)}</b> (${PT.esc(why)}). Change the defaults in Settings → Rest Times.</div>`;
        const footer = `<div class="grid grid-cols-2 gap-2">
            <button id="rest-use-default" class="py-3 rounded-xl text-xs font-bold tap-active ${hasOv ? "bg-zinc-800 text-zinc-200" : "bg-zinc-900 text-zinc-600 border border-zinc-800"}" ${hasOv ? "" : "disabled"}>Use default (${PT.fmtRest(def.sec)})</button>
            <button id="rest-start-now" class="py-3 rounded-xl text-xs font-bold bg-emerald-600 text-white tap-active">⏱ Start ${PT.fmtRest(cur)} now</button>
          </div>`;
        const bodyEl = this.openSheet("Rest time", ex.name, body, footer);
        bodyEl.querySelectorAll(".rest-pick").forEach(b => b.addEventListener("click", () => {
          const sec = parseInt(b.dataset.sec, 10);
          if (sec === def.sec) delete this.settings.restOverrides[ex.name];
          else this.settings.restOverrides[ex.name] = sec;
          WorkoutStorage.saveSettings(this.settings);
          this.closeSheet();
          this.renderWorkoutView();
          this.toast(`Rest for ${ex.name}: ${PT.fmtRest(sec)}`);
        }));
        document.getElementById("rest-use-default").addEventListener("click", () => {
          delete this.settings.restOverrides[ex.name];
          WorkoutStorage.saveSettings(this.settings);
          this.closeSheet();
          this.renderWorkoutView();
          this.toast(`Rest for ${ex.name}: back to ${PT.fmtRest(def.sec)}`);
        });
        document.getElementById("rest-start-now").addEventListener("click", () => {
          this.closeSheet();
          this.restTimer.start(cur);
        });
      },

      bindWorkoutV3() {
        const list = this.dom.exercisesList;
        list.querySelectorAll(".btn-rest-edit").forEach(b => b.addEventListener("click", () => this.openRestEditor(parseInt(b.dataset.exindex, 10))));
        list.querySelectorAll(".btn-ex-info").forEach(b => b.addEventListener("click", () => {
          const ex = this.activeDay && this.activeDay.exercises[parseInt(b.dataset.exindex, 10)];
          if (ex) this.openExerciseSheet(ex.name);
        }));
      },

      /* -------------------------------------------------------- gym plates */
      plateKey() { return this.unit() === "kg" ? "platesKg" : "platesLb"; },
      barKey() { return this.unit() === "kg" ? "barKg" : "barLb"; },
      gymPlates() {
        const u = this.unit();
        const saved = this.settings[this.plateKey()];
        let list = Array.isArray(saved) ? saved.map(Number).filter(p => PLATE_OPTIONS[u].includes(p)) : null;
        if (!list || !list.length) list = PLATE_DEFAULTS[u].slice();
        return [...new Set(list)].sort((a, b) => b - a);
      },
      savedBar() {
        const v = parseFloat(this.settings[this.barKey()]);
        return isFinite(v) && v >= 0 ? v : BAR_PRESETS[this.unit()][0];
      },
      plateColor(p) {
        const kg = this.unit() === "kg";
        const m = kg
          ? { 50: "bg-zinc-800 text-zinc-100 border-zinc-500", 25: "bg-rose-950 text-rose-300 border-rose-800", 20: "bg-blue-950 text-blue-300 border-blue-800", 15: "bg-amber-950 text-amber-300 border-amber-800", 10: "bg-emerald-950 text-emerald-300 border-emerald-800" }
          : { 100: "bg-zinc-800 text-zinc-100 border-zinc-500", 55: "bg-rose-950 text-rose-300 border-rose-800", 45: "bg-blue-950 text-blue-300 border-blue-800", 35: "bg-amber-950 text-amber-300 border-amber-800", 25: "bg-emerald-950 text-emerald-300 border-emerald-800", 10: "bg-purple-950 text-purple-300 border-purple-800" };
        return m[p] || "bg-zinc-800 text-zinc-200 border-zinc-700";
      },
      /**
       * Fewest plates (heaviest first) that make exactly `perSide` from the plates this gym has.
       * If it can't be made exactly, returns the closest loadable amounts below and above.
       */
      solvePlates(perSide) {
        const plates = this.gymPlates();
        const S = 4; // every plate is a multiple of 0.25
        const T = Math.round(Math.max(0, parseFloat(perSide) || 0) * S);
        if (T === 0) return { plates: [], exact: true, under: 0, over: 0 };
        const P = plates.map(p => Math.round(p * S));
        const maxP = Math.max(...P);
        const N = T + maxP;
        if (N > 40000) { // absurd target: fall back to simple greedy
          let rem = T; const out = [];
          P.forEach((p, i) => { while (rem >= p) { rem -= p; out.push(plates[i]); } });
          return { plates: out, exact: rem === 0, under: (T - rem) / S, over: null };
        }
        const INF = 1e9;
        const dp = new Array(N + 1).fill(INF);
        dp[0] = 0;
        for (let a = 1; a <= N; a++) for (const p of P) if (p <= a && dp[a - p] + 1 < dp[a]) dp[a] = dp[a - p] + 1;
        const build = amt => {
          const out = [];
          while (amt > 0) {
            const i = P.findIndex(p => p <= amt && dp[amt - p] === dp[amt] - 1);
            if (i < 0) break;
            out.push(plates[i]); amt -= P[i];
          }
          return out;
        };
        if (dp[T] < INF) return { plates: build(T), exact: true, under: T / S, over: T / S };
        let lo = T; while (lo > 0 && dp[lo] >= INF) lo--;
        let hi = T; while (hi <= N && dp[hi] >= INF) hi++;
        return { plates: build(lo), exact: false, under: lo / S, over: hi <= N ? hi / S : null };
      },
      renderPlateInventory() {
        const box = document.getElementById("plate-inventory");
        if (!box) return;
        const u = this.unit(), have = this.gymPlates();
        box.innerHTML = PLATE_OPTIONS[u].map(p => {
          const on = have.includes(p);
          return `<button class="plate-toggle px-2.5 py-1.5 rounded-lg text-xs font-bold border tap-active ${on ? this.plateColor(p) : "bg-zinc-950 text-zinc-600 border-zinc-800 line-through"}" data-p="${p}" aria-pressed="${on}">${p}</button>`;
        }).join("");
        box.querySelectorAll(".plate-toggle").forEach(b => b.addEventListener("click", () => {
          const p = parseFloat(b.dataset.p);
          let list = this.gymPlates();
          if (list.includes(p)) {
            if (list.length === 1) { this.toast("Keep at least one plate size"); return; }
            list = list.filter(x => x !== p);
          } else list.push(p);
          this.settings[this.plateKey()] = list.sort((a, c) => c - a);
          WorkoutStorage.saveSettings(this.settings);
          this.renderPlateInventory();
          this.calculatePlates();
          this.refreshWorkoutIfOpen();
        }));
        const reset = document.getElementById("btn-plates-reset");
        if (reset && !reset.dataset.bound) {
          reset.dataset.bound = "1";
          reset.addEventListener("click", () => {
            delete this.settings[this.plateKey()];
            WorkoutStorage.saveSettings(this.settings);
            this.renderPlateInventory();
            this.calculatePlates();
            this.refreshWorkoutIfOpen();
          });
        }
      },
      async pickBar(v) {
        let w;
        if (v === "custom") {
          const ans = await PT.prompt(`Bar weight in ${this.wLabel()} (for example a trap bar or safety squat bar):`, String(this.selectedBarWeight));
          if (ans === null) return;
          w = parseFloat(ans);
          if (!(w >= 0) || w > 200) { await PT.alert("Enter a bar weight between 0 and 200."); return; }
        } else w = parseFloat(v);
        if (!(w >= 0)) return;
        this.selectedBarWeight = w;
        this.settings[this.barKey()] = w;
        WorkoutStorage.saveSettings(this.settings);
        this.applyUnitLabels();
        this.calculatePlates();
        this.refreshWorkoutIfOpen();
      },

      /* ----------------------------------------------------- swap suggestions */
      swapSuggestions(curName, limit = 8) {
        const db = (typeof EXERCISE_DATABASE !== "undefined" && Array.isArray(EXERCISE_DATABASE)) ? EXERCISE_DATABASE : [];
        if (!curName || !db.length) return [];
        const cat = PT.category(curName);
        const EQUIP = [["Smith", /smith/], ["Cable", /cable/], ["EZ-bar", /ez-?bar/], ["Kettlebell", /kettlebell/], ["Band", /\bband/],
          ["Machine", /machine|hammer strength|plate-loaded|lever|selectorized|pec deck|leg press|hack|iso-lateral/],
          ["Dumbbell", /dumbbell|\bdb\b/], ["Barbell", /barbell|\bbb\b/],
          ["Bodyweight", /push-?up|pull-?up|chin-?up|\bdips?\b|bodyweight|inverted|plank|crunch/]];
        const equipOf = n => { const hit = EQUIP.find(([, re]) => re.test(n)); return hit ? hit[0] : "Other"; };
        const MOVES = [
          ["press", /press|push-?up|\bdips?\b/], ["fly", /\bfly\b|flye|flies|crossover|pec deck/], ["row", /row/],
          ["vpull", /pull-?up|chin-?up|pulldown|pull-down/], ["pullover", /pullover|pull-over/], ["squat", /squat|leg press|hack/],
          ["lunge", /lunge|split squat|step-?up|bulgarian/], ["hinge", /deadlift|\brdl\b|romanian|good morning|hip thrust|pull-?through|back ext|hyperext|glute bridge/],
          ["legext", /leg ext/], ["legcurl", /leg curl|hamstring curl|nordic/], ["calf", /calf|calves/],
          ["curl", /curl/], ["triext", /extension|skull|pushdown|push-down|kickback|french press/],
          ["latraise", /lateral raise|side raise|y-raise|(?<!iso-)lateral (?!pull)/], ["frontraise", /front raise/],
          ["reardelt", /rear delt|reverse fl|face pull|rear raise/], ["shrug", /shrug/], ["overhead", /overhead|military|shoulder press|arnold|push press/],
          ["adduct", /adduct/], ["abduct", /abduct/], ["crunch", /crunch|sit-?up/], ["legraise", /leg raise|knee raise|knee-up|leg tuck/],
          ["plank", /plank|hollow|dead bug/], ["rotate", /twist|woodchop|rotation|pallof/], ["wrist", /wrist/], ["carry", /carry|farmer/]
        ];
        const ANGLES = [["incline", /incline/], ["decline", /decline/], ["flat", /flat/]];
        const movesOf = n => {
          const m = MOVES.filter(([, re]) => re.test(n)).map(([k]) => k);
          let out = m;
          if (out.includes("calf")) out = out.filter(k => k !== "squat" && k !== "press"); // calf raises on a leg press are still calf raises
          if (out.includes("squat")) out = out.filter(k => k !== "press");                 // "leg press" is a squat pattern, not a chest press
          if (out.includes("legext") || out.includes("legcurl")) out = out.filter(k => k !== "triext" && k !== "curl");
          return out;
        };
        const STOP = new Set(["with", "w", "and", "the", "of", "on", "to", "a", "an", "barbell", "dumbbell", "dumbbells", "cable", "cables", "machine", "smith", "selectorized", "plate", "loaded", "iso", "strength", "lever", "ez", "bar", "db", "bb", "kettlebell", "band", "s", "x"]);
        const words = n => new Set(n.split(/[^a-z]+/).filter(w => w.length > 1 && !STOP.has(w)));
        const angleOf = n => { const h = ANGLES.find(([, re]) => re.test(n)); return h ? h[0] : ""; };
        const cn = curName.toLowerCase();
        const cMoves = movesOf(cn), cEquip = equipOf(cn), cAngle = angleOf(cn), cClass = PT.liftClass(curName), cWords = words(cn);
        const done = new Set([...Object.keys(this.lastPerf || {}), ...(this.sessions || []).flatMap(s => (s.ex || []).map(e => e.name))]);
        const out = [];
        db.forEach(e => {
          if (!e || !e.name || e.name === curName) return;
          if ((e.category || "Other") !== cat) return;
          const n = e.name.toLowerCase();
          const shared = movesOf(n).filter(m => cMoves.includes(m)).length;
          const eq = equipOf(n);
          const wasDone = done.has(e.name);
          let common = 0;
          words(n).forEach(w => { if (cWords.has(w)) common++; });
          let score = shared * 5 + Math.min(3, common) * 2;
          if (shared && angleOf(n) === cAngle) score += 2;
          if (wasDone) score += 2;
          if (shared && eq !== cEquip && eq !== "Other" && cEquip !== "Other") score += 2;
          if (PT.liftClass(e.name) === cClass) score += 1;
          if (!shared && !wasDone) return;
          const why = [];
          if (shared) why.push("Same movement");
          if (eq !== "Other") why.push(eq === cEquip ? `Also ${eq.toLowerCase()}` : eq);
          if (wasDone) why.push("Done before");
          out.push({ name: e.name, score, why });
        });
        return out.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name)).slice(0, limit);
      },
      swapSuggestionsSection(curName, onPick) {
        const sugg = this.swapSuggestions(curName);
        if (!sugg.length) return null;
        const section = document.createElement("div");
        const header = document.createElement("div");
        header.className = "sticky top-0 z-10 px-4 py-1.5 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 flex items-center justify-between";
        header.innerHTML = `<span class="text-[11px] font-black uppercase tracking-widest text-amber-300">★ Best swaps</span><span class="text-[10px] font-bold text-zinc-500">${sugg.length}</span>`;
        section.appendChild(header);
        sugg.forEach(sg => {
          const btn = document.createElement("button");
          btn.className = "sugg-item w-full flex items-center gap-3 px-4 min-h-[56px] py-2 border-b border-zinc-800/60 border-l-2 border-l-amber-500/60 bg-amber-950/10 text-left tap-active transition hover:bg-zinc-900";
          btn.innerHTML = `
            <span class="flex-grow min-w-0">
              <span class="block text-sm font-semibold text-zinc-100 leading-snug">${PT.esc(sg.name)}</span>
              <span class="block text-[10px] text-zinc-400 mt-0.5">${PT.esc(sg.why.join(" · "))}</span>
            </span>
            <svg class="w-4 h-4 shrink-0 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4M16 17H4m0 0l4-4m-4 4l4 4"/></svg>`;
          btn.addEventListener("click", () => onPick(sg.name, btn));
          section.appendChild(btn);
        });
        return section;
      },

      /* ---------------------------------------------------- save as routine */
      templateFromSession(s) {
        const free = s.pid === FREESTYLE_ID || /^freestyle$/i.test(s.dtitle || "");
        const exercises = (s.ex || []).map(e => {
          const work = (e.sets || []).filter(st => st.t !== "W");
          const use = work.length ? work : (e.sets || []);
          const reps = use.map(st => Math.round(parseFloat(st.r) || 0)).filter(r => r > 0);
          const lo = reps.length ? Math.min(...reps) : 10, hi = reps.length ? Math.max(...reps) : 10;
          return { name: e.name, sets: Math.max(1, use.length), reps: lo === hi ? String(lo) : `${lo}-${hi}` };
        });
        return {
          title: free ? "" : (s.dtitle || ""),
          description: `Saved from your ${PT.fmtDate(s.date)} workout`,
          days: [{ title: free ? "Day 1" : (s.dtitle || "Day 1"), exercises }],
          fromSession: true
        };
      },
      openSaveRoutine(s) {
        if (!s || !(s.ex || []).length) { this.toast("That workout has no exercises to save"); return; }
        const builtinIds = new Set((typeof BUILTIN_PROGRAMS !== "undefined" && Array.isArray(BUILTIN_PROGRAMS)) ? BUILTIN_PROGRAMS.map(p => p.id) : []);
        const progs = (this.data.programs || []).filter(p => p.id !== FREESTYLE_ID)
          .sort((a, b) => Number(builtinIds.has(a.id)) - Number(builtinIds.has(b.id)) || String(a.title).localeCompare(String(b.title)));
        const t = this.templateFromSession(s);
        const preview = t.days[0].exercises.map(e => `<div class="flex justify-between gap-2"><span class="text-zinc-200 truncate">${PT.esc(e.name)}</span><span class="font-mono text-zinc-500 shrink-0">${e.sets} × ${PT.esc(e.reps)}</span></div>`).join("");
        const body = `
          <div class="bg-zinc-950 border border-zinc-800 rounded-xl p-3 space-y-1 text-xs">${preview}</div>
          <p class="text-[11px] text-zinc-500">Sets and rep targets come from what you actually did (warm-ups left out). You can change them before saving.</p>
          <button id="sr-new" class="w-full py-3 rounded-xl text-sm font-bold bg-emerald-600 text-white tap-active">＋ New routine from this workout</button>
          ${progs.length ? `<div class="space-y-1.5">
            <span class="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Or add it as a new day to</span>
            ${progs.map(p => `<button class="sr-add w-full text-left bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 tap-active hover:border-zinc-700" data-id="${PT.esc(p.id)}">
                <span class="block text-sm font-semibold text-zinc-100 truncate">${PT.esc(p.title)}</span>
                <span class="block text-[10px] text-zinc-500">${(p.days || []).length} days${builtinIds.has(p.id) ? " · built-in" : ""}</span></button>`).join("")}
          </div>` : ""}`;
        const bodyEl = this.openSheet("Save as Routine", `${s.dtitle} · ${PT.fmtDate(s.date)}`, body, "");
        document.getElementById("sr-new").addEventListener("click", () => {
          this.closeSheet();
          if (!this.dom.modalSummary.classList.contains("hidden")) {
            this.dom.modalSummary.classList.add("hidden");
            this.showView("home");
          }
          this.openBuilder(t);
        });
        bodyEl.querySelectorAll(".sr-add").forEach(b => b.addEventListener("click", () => {
          const prog = (this.data.programs || []).find(p => p.id === b.dataset.id);
          if (prog) this.addSessionAsDay(s, prog);
        }));
      },
      async addSessionAsDay(s, prog) {
        const t = this.templateFromSession(s);
        const days = prog.days = prog.days || [];
        const n = days.reduce((m, d) => Math.max(m, parseInt(d.dayNumber, 10) || 0), 0) + 1;
        const title = (await PT.prompt(`Name for the new Day ${n} in "${prog.title}":`, t.days[0].title === "Day 1" ? `Day ${n}` : t.days[0].title) || "").replace(/[<>]/g, "").trim();
        if (!title) return;
        const tag = PT.uid();
        days.push({
          dayNumber: n, title,
          estimatedMinutes: Math.max(20, t.days[0].exercises.length * 9),
          exercises: t.days[0].exercises.map((e, i) => ({
            id: `${prog.id}_d${n}_e${i + 1}_${tag}`, name: e.name, sets: e.sets, reps: e.reps,
            restSeconds: this.smartRest(e.name), restAuto: true, type: "standard"
          }))
        });
        days[days.length - 1].orig = JSON.parse(JSON.stringify(days[days.length - 1].exercises));
        if (!WorkoutStorage.setData(this.data)) { days.pop(); return; }
        this.closeSheet();
        this.renderProgramsView();
        this.toast(`Added as Day ${n} to ${prog.title}`, "Open", () => {
          this.dom.modalSummary.classList.add("hidden");
          this.activeProgram = prog;
          this.activeDay = days[days.length - 1];
          AppStateMemory.saveActive(prog.id, n);
          this.showView("days");
        }, 6000);
      },

      /* ------------------------------------------------------- rep records */
      repRecords(name) {
        const best = {};
        (this.sessions || []).forEach(s => (s.ex || []).forEach(e => {
          if (e.name !== name) return;
          (e.sets || []).forEach(st => {
            if (st.t === "W") return;
            if (PT.isCardioSet(st)) return;
            const r = Math.round(parseFloat(st.r) || 0), w = this.setLoad(name, st, s.date);
            if (r < 1 || r > 30) return;
            const bwTxt = (PT.isBodyweightEx(name) || st.bz) ? this.setText(name, st).replace(/ × .*$/, "") : "";
            if (!best[r] || w > best[r].w || (w === best[r].w && s.date < best[r].date)) best[r] = { w, date: s.date, bwTxt: bwTxt.startsWith("BW") ? bwTxt : "" };
          });
        }));
        // Drop rows beaten by a heavier lift for more reps (e.g. 225×5 beats 220×3)
        const reps = Object.keys(best).map(Number).sort((a, b) => a - b);
        return reps.filter(r => !reps.some(r2 => r2 > r && best[r2].w >= best[r].w)).map(r => ({ reps: r, w: best[r].w, date: best[r].date, bwTxt: best[r].bwTxt }));
      },

      /* ----------------------------------------------------------- settings */
      renderSettingsV3() {
        const mode = this.settings.restMode === "smart" ? "smart" : "auto";
        document.querySelectorAll(".btn-restmode").forEach(b => {
          b.className = "btn-restmode flex-1 py-2 rounded-lg text-xs font-bold tap-active " + (b.dataset.mode === mode ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-400");
        });
        const t = this.restTimes();
        document.querySelectorAll(".sel-rest").forEach(sel => {
          const k = sel.dataset.k;
          const opts = REST_CHOICES.includes(t[k]) ? REST_CHOICES : REST_CHOICES.concat([t[k]]).sort((a, b) => a - b);
          sel.innerHTML = opts.map(v => `<option value="${v}" ${v === t[k] ? "selected" : ""}>${PT.fmtRest(v)}</option>`).join("");
        });
        const hint = document.getElementById("rest-mode-hint");
        if (hint) hint.innerText = mode === "smart"
          ? "Smart: every exercise uses the time for its type below, even in programs. Supersets, giant sets and Tabata keep the program's time."
          : "Auto: programs keep their own rest times. Exercises you add, swap in or build yourself use the times below.";
        const n = Object.keys(this.settings.restOverrides || {}).length;
        const ov = document.getElementById("rest-override-status");
        if (ov) ov.innerText = n ? `${n} exercise${n > 1 ? "s have" : " has"} your own rest time.` : "Tap \"Rest\" on any exercise card to give it its own time.";
        const clr = document.getElementById("btn-clear-rest-overrides");
        if (clr) clr.classList.toggle("hidden", !n);
        const ps = document.getElementById("gym-plates-status");
        if (ps) ps.innerText = `Bar ${this.savedBar()} ${this.unit()} · plates ${this.gymPlates().join(", ")}`;
      }
    });
  