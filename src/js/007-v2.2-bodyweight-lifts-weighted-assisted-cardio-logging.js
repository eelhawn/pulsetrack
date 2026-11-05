
    /* =====================================================================
     * PulseTrack 2.2 — bodyweight lifts (weighted / assisted), cardio logging,
     * dumbbells per hand, muscle map, strength levels, monthly recap, form help.
     * ===================================================================== */

    // 1-rep-max standards in lb from StrengthLevel.com (by bodyweight, every 10 lb).
    // [first bodyweight, rows of [Beginner, Novice, Intermediate, Advanced, Elite]]
    const STRENGTH_STD = {
      male: {
        bench: [110, [[60,90,128,172,221],[70,102,142,189,240],[80,114,156,205,258],[89,125,170,221,276],[99,137,183,236,292],[108,148,196,250,308],[118,158,208,264,324],[127,169,220,277,339],[136,179,231,290,353],[144,189,243,303,367],[153,199,254,315,380],[161,208,265,327,394],[169,218,275,339,406],[177,227,285,350,419],[185,236,295,361,431],[193,244,305,372,442],[200,253,314,383,454],[208,261,324,393,465],[215,269,333,403,476],[222,278,342,413,487],[229,285,351,422,497]]],
        squat: [110, [[79,120,172,234,301],[92,136,192,257,327],[106,153,211,279,352],[119,168,229,300,376],[132,184,247,320,399],[145,199,265,340,421],[157,213,282,359,442],[169,228,298,377,462],[182,242,314,395,482],[193,255,329,413,501],[205,269,344,430,520],[216,281,359,446,538],[227,294,373,462,555],[238,307,387,477,572],[249,319,401,493,589],[260,331,414,507,605],[270,342,427,522,621],[280,354,440,536,636],[290,365,452,550,651],[300,376,465,563,666],[309,387,477,576,680]]],
        deadlift: [110, [[101,150,211,283,361],[116,168,233,308,389],[131,186,254,332,416],[146,203,274,355,442],[160,220,293,377,466],[174,236,312,398,490],[188,252,330,419,513],[201,268,348,438,535],[214,283,365,458,556],[227,297,382,476,576],[239,312,398,494,596],[252,326,413,512,615],[263,339,429,529,634],[275,352,443,545,652],[287,365,458,561,669],[298,378,472,577,686],[309,390,486,592,703],[320,402,499,607,719],[330,414,513,622,735],[341,426,526,636,751],[351,437,538,650,766]]],
        ohp: [110, [[33,53,79,111,147],[39,61,89,123,160],[45,68,98,133,172],[51,76,107,144,183],[57,83,116,154,195],[63,90,124,163,206],[69,97,132,172,216],[75,104,140,181,226],[80,111,148,190,236],[86,117,155,199,245],[91,123,163,207,254],[97,130,170,215,263],[102,136,177,223,272],[107,142,183,230,280],[112,147,190,238,288],[117,153,196,245,296],[122,159,203,252,304],[127,164,209,259,312],[131,170,215,266,319],[136,175,221,272,326],[141,180,227,279,333]]]
      },
      female: {
        bench: [90, [[23,44,73,110,152],[27,50,81,119,163],[32,56,88,128,173],[36,61,95,137,183],[40,67,102,145,192],[44,72,108,152,201],[48,77,114,159,209],[52,82,120,166,217],[55,86,126,173,224],[59,91,131,179,232],[63,95,136,185,238],[66,99,141,191,245],[69,103,146,197,251],[73,107,151,202,258],[76,111,156,207,264],[79,115,160,212,269],[82,119,164,217,275],[85,122,168,222,280]]],
        squat: [90, [[44,76,118,170,228],[50,84,129,183,243],[57,92,139,194,256],[63,100,148,206,269],[69,107,157,216,281],[74,114,165,226,292],[80,121,174,235,303],[85,128,181,244,313],[90,134,189,253,323],[95,140,196,261,332],[100,146,203,269,341],[105,151,209,277,350],[109,157,216,284,358],[114,162,222,291,366],[118,167,228,298,374],[122,172,234,305,381],[126,177,239,311,389],[130,182,245,318,396]]],
        deadlift: [90, [[59,97,146,205,270],[67,106,157,218,286],[74,115,168,231,300],[80,123,178,242,313],[87,131,187,253,326],[93,139,196,264,338],[99,146,205,274,349],[105,153,213,283,359],[110,159,221,292,370],[115,166,228,301,379],[121,172,236,309,389],[126,178,242,317,397],[130,184,249,325,406],[135,189,256,332,414],[140,195,262,339,422],[144,200,268,346,430],[148,205,274,353,437],[153,210,280,359,445]]],
        ohp: [90, [[16,30,49,73,100],[19,34,54,79,107],[22,37,58,84,113],[24,41,63,89,118],[27,44,66,94,124],[29,47,70,98,129],[32,50,74,102,134],[34,53,77,106,138],[36,55,80,110,143],[38,58,84,114,147],[40,61,87,117,151],[42,63,90,121,155],[44,65,92,124,158],[46,68,95,127,162],[48,70,98,130,165],[50,72,100,133,169],[51,74,103,136,172],[53,76,105,139,175]]]
      }
    };
    const STRENGTH_LEVELS = ["Beginner", "Novice", "Intermediate", "Advanced", "Elite"];
    const STRENGTH_COLORS = ["#a1a1aa", "#38bdf8", "#34d399", "#a78bfa", "#fbbf24"];
    const STRENGTH_LIFTS = [
      { key: "bench", label: "Bench Press", also: /^smith machine flat press$/i, match: /bench press/i, exclude: /dumbbell|incline|decline|close|wide|reverse|smith|machine|floor|single|hammer|iso-lateral|board|pin|spoto|landmine/i },
      { key: "squat", label: "Squat", also: /^smith machine squats?$/i, match: /squat/i, exclude: /split|goblet|dumbbell|smith|hack|machine|front|sumo|zercher|box|pistol|jump|belt|sissy|bulgarian|overhead|safety|cyclist|heel|pendulum|v-squat|landmine|kettlebell|wall|plie|bodyweight|cossack|pause|jefferson|air squat/i },
      { key: "deadlift", label: "Deadlift", match: /deadlift/i, exclude: /romanian|stiff|single|rdl|dumbbell|deficit|trap|hex|kettlebell|b-stance|snatch|smith|machine/i }
    ];
    const MAP_REGIONS = {
      chest: "Chest", shoulders: "Shoulders", biceps: "Biceps", triceps: "Triceps", forearms: "Forearms", abs: "Abs & core",
      back: "Lats & upper back", lowerback: "Lower back", traps: "Traps", glutes: "Glutes", quads: "Quads", hamstrings: "Hamstrings", calves: "Calves"
    };
    const MI_PER_KM = 0.621371;

    Object.assign(PT, {
      /** Pull-ups, chin-ups and dips: the load is your bodyweight plus (or minus) what you type. */
      isBodyweightEx(name) {
        const n = String(name || "").toLowerCase();
        if (/bench dips?|dip machine|machine triceps dip|seated dip|plate-loaded|pulldown|pull-down|pullover|straight-arm/.test(n)) return false;
        return /\b(pull-?ups?|chin-?ups?|muscle-?ups?)\b|\bdips?\b/.test(n);
      },
      /** How many dumbbells you hold. Weights are typed per hand, so volume counts both. */
      dbCount(name, reps) {
        const n = String(name || "").toLowerCase();
        if (!/dumbbell|\bdb\b|arnold/.test(n)) return 1;
        if (/single-?arm|one-?arm|single-?leg|one-?leg|goblet|concentration|pullover|kettlebell|hip thrust|sumo squat|leg curl|side bend|cross-body triceps|pronation/.test(n)) return 1;
        if (/overhead (triceps? )?extension|overhead dumbbell extension|french press/.test(n)) return 1;
        if (/\/\s*arm|per arm|each arm|one arm/.test(String(reps || "").toLowerCase())) return 1;
        return 2;
      },
      /** Steady cardio (or anything timed in minutes) logs minutes and distance instead of weight × reps. */
      cardioKind(name, reps, type) {
        if (type === "tabata") return null;
        const n = String(name || "").toLowerCase();
        const noDist = /stair|step machine|jump rope|rope|jumping jack|high knee|shadow box|heavy bag|versa/.test(n);
        if (type === "cardio") return { dist: !noDist };
        if (/hiit 100|lunge|tabata|burpee|box jump|slam|tire|sled|battle rope|push-?up|squat|mountain|farmer|carry|suitcase|kettlebell/.test(n)) return null;
        if (/treadmill|\brun(ning)?\b|\bjog|elliptical|stair ?master|step machine|stair climb|rowing machine|\berg\b|ski-?erg|cycling|\bbike\b|\bspin|swim|\bwalk(ing)?\b|steady state|\bcardio\b|jump rope|\bhik(e|ing)|sprint|jumping jack|high knee|shadow box|heavy bag/.test(n)) return { dist: !noDist };
        if (/\d\s*(m|min|mins|minutes)\b/.test(String(reps || "").toLowerCase())) return { dist: false };
        return null;
      },
      isCardioSet(st) { return !!st && (st.min !== undefined || st.dist !== undefined); },
      /** Body-map regions a set counts toward (main muscle 1, helpers ½ when turned on). */
      regionsFor(name, helpers) {
        const n = String(name || "").toLowerCase();
        const cat = PT.category(name);
        const out = {};
        const add = (r, f) => { out[r] = (out[r] || 0) + f; };
        const leg = /calf|calves/.test(n) ? "calves"
          : /hip thrust|glute|bridge|kickback|abduct|pull-?through/.test(n) ? "glutes"
          : /leg curl|hamstring|nordic|romanian|\brdl\b|stiff|good morning|deadlift/.test(n) ? "hamstrings" : "quads";
        switch (cat) {
          case "Chest": add("chest", 1); break;
          case "Back": add(/deadlift|rack pull|back ext|hyperext|good morning|superman|reverse hyper/.test(n) ? "lowerback" : "back", 1); break;
          case "Legs": add(leg, 1); break;
          case "Shoulders": add("shoulders", 1); break;
          case "Biceps": add("biceps", 1); break;
          case "Triceps": add("triceps", 1); break;
          case "Traps": add("traps", 1); break;
          case "Forearms": add("forearms", 1); break;
          case "Core": add("abs", 1); break;
          default: return out;
        }
        if (helpers) {
          const simple = { Chest: "chest", Shoulders: "shoulders", Biceps: "biceps", Triceps: "triceps", Traps: "traps", Forearms: "forearms", Core: "abs" };
          PT.helperMuscles(name, cat).forEach(([m, f]) => {
            const r = m === "Legs" ? "glutes" : m === "Back" ? (/deadlift|\brdl\b|romanian|good morning|stiff/.test(n) ? "lowerback" : "back") : simple[m];
            if (r) add(r, f);
          });
          if (cat === "Legs" && leg === "quads" && /squat|lunge|leg press|step-?up|split/.test(n)) add("glutes", 0.5);
        }
        return out;
      },
      /** Thresholds (lb) for one lift at a bodyweight (lb). */
      strengthThresholds(liftKey, sex, bwLb) {
        const tbl = (STRENGTH_STD[sex === "female" ? "female" : "male"] || {})[liftKey];
        if (!tbl || !(bwLb > 0)) return null;
        const [start, rows] = tbl;
        const pos = (bwLb - start) / 10;
        if (pos <= 0) return rows[0].map(v => v * Math.pow(bwLb / start, 0.8));
        if (pos >= rows.length - 1) { const top = start + (rows.length - 1) * 10; return rows[rows.length - 1].map(v => v * Math.pow(bwLb / top, 0.6)); }
        const i = Math.floor(pos), f = pos - i;
        return rows[i].map((v, k) => v + (rows[i + 1][k] - v) * f);
      },
      /** Level from a 1RM: Beginner below Novice, … Elite at or above Elite. */
      strengthLevel(liftKey, sex, bwLb, oneRmLb) {
        const th = PT.strengthThresholds(liftKey, sex, bwLb);
        if (!th || !(oneRmLb > 0)) return null;
        let idx = 0;
        for (let k = 1; k < th.length; k++) if (oneRmLb >= th[k]) idx = k;
        const next = idx < th.length - 1 ? th[idx + 1] : null;
        const prev = idx === 0 ? 0 : th[idx];
        const frac = next ? Math.max(0, Math.min(1, (oneRmLb - prev) / (next - prev))) : 1;
        return { idx, level: STRENGTH_LEVELS[idx], next, nextLevel: next ? STRENGTH_LEVELS[idx + 1] : null, frac, th };
      }
    });

    ApplicationUI.prototype._suggestionV3 = ApplicationUI.prototype.suggestionFor;

    Object.assign(ApplicationUI.prototype, {

      initV4() {
        const s = this.settings;
        if (!s.bwModes || typeof s.bwModes !== "object" || Array.isArray(s.bwModes)) s.bwModes = {};
        if (s.strengthSex !== "female") s.strengthSex = "male";
        this._bwList = null;
        // 2.2 counts both dumbbells and your bodyweight on pull-ups/dips: refresh saved totals once.
        if (s.volVersion !== 2) {
          this.recomputeVolumes();
          this.recomputeSessionPRs();
          this.rebuildPRs();
          s.volVersion = 2;
          WorkoutStorage.saveSettings(s);
        }
      },

      /* ------------------------------------------------ bodyweight & loads */
      bwList() {
        if (!this._bwList) {
          this._bwList = (this.body || []).filter(b => b && parseFloat(b.bw) > 0)
            .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
            .map(b => ({ date: b.date, bw: parseFloat(b.bw) }));
        }
        return this._bwList;
      },
      /** Your logged bodyweight on a date (the latest entry on or before it, else the first one). */
      bwOn(ds) {
        const list = this.bwList();
        if (!list.length) return 0;
        let pick = list[0];
        for (const b of list) { if (!ds || b.date <= ds) pick = b; else break; }
        return pick.bw;
      },
      bwMode(name) {
        const m = (this.settings.bwModes || {})[name];
        return m === "assist" || m === "add" ? m : (/assist/i.test(name) ? "assist" : "add");
      },
      exKind(ex) {
        const cardio = PT.cardioKind(ex && ex.name, ex && ex.reps, ex && ex.type);
        return { cardio, bw: !cardio && PT.isBodyweightEx(ex && ex.name), dbn: PT.dbCount(ex && ex.name, ex && ex.reps) };
      },
      /** The weight actually moved in one set (bodyweight ± typed weight for pull-ups/dips). */
      setLoad(name, st, ds) {
        const x = parseFloat(st && st.w) || 0;
        if (!st || !PT.isBodyweightEx(name)) return x;
        const assist = st.a === 1 || st.a === true;
        const bw = parseFloat(st.bw) || this.bwOn(ds);
        if (!st.bx && !assist && bw > 0 && x >= bw * 0.5) return x; // older entries that already included bodyweight
        if (!(bw > 0)) return assist ? 0 : x;
        return Math.max(0, assist ? bw - x : bw + x);
      },
      setE1rm(name, st, ds) {
        if (!st || PT.isCardioSet(st)) return 0;
        return PT.e1rm(this.setLoad(name, st, ds), st.r);
      },
      setVolume(name, st, ds, dbn) {
        if (!st || st.t === "W" || PT.isCardioSet(st)) return 0;
        const reps = parseFloat(st.r) || 0;
        return this.setLoad(name, st, ds) * reps * (dbn || PT.dbCount(name));
      },
      sessionVolume(s) {
        return (s.ex || []).reduce((a, e) => a + (e.sets || []).reduce((b, st) => b + this.setVolume(e.name, st, s.date, e.dbn), 0), 0);
      },
      recomputeVolumes() {
        if (!Array.isArray(this.sessions) || !this.sessions.length) return;
        this.sessions.forEach(s => { s.vol = Math.round(this.sessionVolume(s)); });
        this.saveSessions();
      },
      onBodyChanged() {
        this._bwList = null;
        if ((this.sessions || []).some(s => (s.ex || []).some(e => PT.isBodyweightEx(e.name)))) {
          this.recomputeVolumes();
          this.recomputeSessionPRs();
          this.rebuildPRs();
        }
      },
      /** A logged-but-unfinished set, shaped like a saved one. */
      entryToSet(ex, entry) {
        const kind = this.exKind(ex);
        const t = (entry && entry.tag) || "R";
        if (kind.cardio) {
          const st = { w: 0, r: 0, t, min: Math.max(0, parseFloat(entry.min) || 0) };
          const d = parseFloat(entry.dist);
          if (d > 0) st.dist = d;
          return st;
        }
        const st = { w: parseFloat(entry && entry.weight) || 0, r: parseFloat(entry && entry.reps) || 0, t };
        if (kind.bw) {
          st.bx = 1;
          if (this.bwMode(ex.name) === "assist") st.a = 1;
          const bw = this.bwOn(PT.ds());
          if (bw > 0) st.bw = bw;
        }
        return st;
      },
      liveE1rm(exOrName, entry) {
        if (!entry) return 0;
        const ex = typeof exOrName === "string"
          ? ((this.activeDay && (this.activeDay.exercises || []).find(e => e.name === exOrName)) || { name: exOrName })
          : exOrName;
        return this.setE1rm(ex.name, this.entryToSet(ex, entry), PT.ds());
      },
      perfFromSet(st) {
        const p = { weight: st.w, reps: st.r, tag: st.t };
        if (st.min !== undefined) p.min = st.min;
        if (st.dist !== undefined) p.dist = st.dist;
        return p;
      },
      distLabel(unit) { return (unit || this.unit()) === "kg" ? "km" : "mi"; },
      /** "135 lbs × 8", "BW+25 × 8", "25 min · 2.1 mi" */
      setText(name, st, uLabel, unitKey) {
        if (PT.isCardioSet(st)) {
          const parts = [];
          if (parseFloat(st.min) > 0) parts.push(PT.num(st.min, 1) + " min");
          if (parseFloat(st.dist) > 0) parts.push(PT.num(st.dist, 2) + " " + this.distLabel(unitKey));
          return parts.join(" · ") || "done";
        }
        const r = PT.num(st.r, 0);
        const x = parseFloat(st.w) || 0;
        if (PT.isBodyweightEx(name)) {
          const bw = parseFloat(st.bw) || this.bwOn();
          const legacyTotal = !st.bx && !st.a && bw > 0 && x >= bw * 0.5;
          if (!legacyTotal) return (x ? `BW${st.a ? "−" : "+"}${PT.num(x, 2)}` : "BW") + ` × ${r}`;
        }
        return `${PT.num(x, 2)}${uLabel ? " " + uLabel : ""} × ${r}`;
      },

      /* ---------------------------------------------------- workout card */
      colLabel(ex, kind) {
        if (kind.cardio) return kind.cardio.dist ? "Minutes · Distance" : "Minutes";
        if (kind.bw) return this.bwMode(ex.name) === "assist" ? "Assist · Reps" : "Added · Reps";
        if (kind.dbn === 2) return "Each hand · Reps";
        return "Weight · Reps";
      },
      cardioInputsHtml(key, entry, prev, kind) {
        const cls = "input-set-field w-14 bg-zinc-950 border border-zinc-800 rounded px-1.5 py-1.5 text-right font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500";
        const dl = this.distLabel();
        const v = x => (x === undefined || x === null ? "" : PT.esc(String(x)));
        return `
              <div class="flex items-center space-x-1.5 flex-grow justify-end pr-2">
                <div class="flex items-center space-x-1">
                  <input type="number" inputmode="decimal" step="any" placeholder="${prev && prev.min ? v(prev.min) : "min"}" value="${v(entry.min)}"
                    data-key="${key}" data-field="min" class="${cls}">
                  <span class="text-zinc-500 text-[10px]">min</span>
                </div>
                ${kind.cardio.dist ? `<div class="flex items-center space-x-1">
                  <input type="number" inputmode="decimal" step="any" placeholder="${prev && prev.dist ? v(prev.dist) : dl}" value="${v(entry.dist)}"
                    data-key="${key}" data-field="dist" class="${cls}">
                  <span class="text-zinc-500 text-[10px]">${dl}</span>
                </div>` : ""}
              </div>`;
      },
      kindBarHtml(ex, exIndex) {
        const kind = this.exKind(ex);
        if (!kind.bw || this.settings.showLogger === false) return "";
        const mode = this.bwMode(ex.name);
        const bw = this.bwOn(PT.ds());
        const u = this.wLabel();
        const b = (m, t) => `<button class="btn-bwmode px-2 py-1 rounded-lg text-[11px] font-bold tap-active ${mode === m ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-400"}" data-exindex="${exIndex}" data-mode="${m}">${t}</button>`;
        return `<div class="bg-zinc-950/70 border border-zinc-800 rounded-lg px-2.5 py-2 space-y-1.5">
            <div class="flex flex-wrap items-center gap-1.5">${b("add", "＋ Weighted")}${b("assist", "− Assisted")}
              <span class="text-[11px] text-zinc-400 ml-auto">${bw ? `Body weight <b class="font-mono text-zinc-200">${PT.num(bw, 1)} ${u}</b>` : ""}</span></div>
            ${bw
              ? `<p class="text-[10px] text-zinc-500 leading-snug">${mode === "assist" ? `Type how much the machine or band helps. Leave it empty for no help.` : `Type the extra weight (belt, vest, dumbbell). Leave it empty for just your body.`} Volume and PRs use your body weight ${mode === "assist" ? "minus" : "plus"} that.</p>`
              : `<button class="btn-log-bw w-full text-left text-[11px] text-amber-300 font-semibold tap-active">⚠ Log your body weight in Body &amp; Photos so this counts your body weight (tap)</button>`}
          </div>`;
      },
      bindWorkoutV4() {
        const list = this.dom.exercisesList;
        list.querySelectorAll(".btn-bwmode").forEach(btn => btn.addEventListener("click", () => {
          const ex = this.activeDay && this.activeDay.exercises[parseInt(btn.dataset.exindex, 10)];
          if (!ex) return;
          this.settings.bwModes = Object.assign({}, this.settings.bwModes, { [ex.name]: btn.dataset.mode });
          WorkoutStorage.saveSettings(this.settings);
          this.renderWorkoutView();
        }));
        list.querySelectorAll(".btn-log-bw").forEach(btn => btn.addEventListener("click", () => this.showView("body")));
      },

      /* ------------------------------------------------------ muscle map */
      regionSetsBetween(startMs, endMs) {
        const out = {};
        const helpers = !!this.settings.helperSets;
        this.sessions.forEach(s => {
          const t = PT.fromDs(s.date).getTime();
          if (!(t >= startMs && t < endMs)) return;
          (s.ex || []).forEach(e => {
            const n = (e.sets || []).filter(st => st.t !== "W").length;
            if (!n) return;
            const regs = PT.regionsFor(e.name, helpers);
            Object.keys(regs).forEach(r => { out[r] = (out[r] || 0) + n * regs[r]; });
          });
        });
        return out;
      },
      regionSetsForMode(mode) {
        const ws = PT.weekStart(new Date());
        const wk = 7 * 86400000;
        if (mode === "this") return this.regionSetsBetween(ws.getTime(), ws.getTime() + wk);
        if (mode === "last") return this.regionSetsBetween(ws.getTime() - wk, ws.getTime());
        const out = {};
        for (let i = 1; i <= 4; i++) {
          const d = this.regionSetsBetween(ws.getTime() - wk * i, ws.getTime() - wk * (i - 1));
          Object.keys(d).forEach(k => { out[k] = (out[k] || 0) + d[k] / 4; });
        }
        return out;
      },
      regionColor(v) {
        if (!(v > 0)) return "#3f3f46";
        if (v < 10) return "#f59e0b";
        if (v <= 20) return PT.accent();
        return "#f43f5e";
      },
      muscleMapSvg(vals) {
        // Anatomical front/back figure. Each figure is drawn as its left half and mirrored.
        const c = r => this.regionColor(vals[r] || 0);
        const sh = "mmShade" + (this._mmN = (this._mmN || 0) + 1);   // one gradient id per drawing: two maps on a page must not share it
        const M = (r, d) => `<path class="mm-r" data-r="${r}" d="${d}" fill="${c(r)}"/><path d="${d}" fill="url(#${sh})" stroke="none" pointer-events="none"/>`;
        const N = d => `<path d="${d}" fill="#2b2b30"/>`; // not tracked (neck, tendons)
        const pil = (x1, y1, x2, y2, k = 3) => `M${x1} ${y1 + k} Q${x1} ${y1} ${x1 + k} ${y1} L${x2 - k} ${y1} Q${x2} ${y1} ${x2} ${y1 + k} L${x2} ${y2 - k} Q${x2} ${y2} ${x2 - k} ${y2} L${x1 + k} ${y2} Q${x1} ${y2} ${x1} ${y2 - k} Z`;
        const sil = [
          "M100 6 C90 6 83 13 83 26 C83 36 86 44 91 49 C94 51 97 52 100 52 Z",
          "M90.6 44 L91.4 60 L100 61 L100 44 Z",
          "M100 54 L92 55 C86 60.5 75 62.6 64 64.6 C54 65.6 46.5 69 43.8 75.5 C42.9 78.5 42.6 82 42.8 86 L56 100 L60.5 104 C62.5 120 65 138 67 156 C68 166 67 176 66 186 C64 196 61.5 204 61 212 L60.8 226 L100 234 Z",
          "M42.9 79.2 C38.8 78.9 41.9 82.5 41.4 84.2 C40.9 85.9 40.4 87.6 39.9 89.2 C39.4 90.9 38.9 92.6 38.4 94.2 C38 95.9 37.5 97.6 37.1 99.3 C36.7 101 36.4 102.7 36 104.4 C35.6 106.1 35.2 107.8 34.8 109.5 C34.4 111.2 33.9 112.9 33.5 114.6 C33.1 116.3 32.8 118 32.5 119.7 C32.2 121.4 31.9 123.2 31.6 124.9 C31.3 126.6 30.9 128.3 30.6 130 C30.2 131.8 29.8 133.4 29.4 135.2 C29.1 136.9 28.9 138.6 28.6 140.4 C28.4 142.1 28.2 143.9 27.8 145.6 C27.5 147.3 24.2 149 26.5 150.6 C28.8 152.2 39.1 155.2 41.9 155.1 C44.7 155 42.8 151.7 43.3 150 C43.8 148.4 44.4 146.7 45 145.1 C45.6 143.5 46.3 141.8 46.8 140.2 C47.4 138.5 47.8 136.8 48.3 135.2 C48.8 133.5 49.4 131.8 50 130.2 C50.6 128.6 51.2 126.9 51.8 125.3 C52.5 123.7 53.1 122 53.7 120.4 C54.2 118.7 54.7 117.1 55.2 115.4 C55.8 113.7 56.4 112.1 57 110.5 C57.6 108.8 58.3 107.2 58.9 105.6 C59.5 104 60.1 102.3 60.7 100.7 C61.3 99 61.8 97.3 62.3 95.7 C62.9 94 63.5 92.4 64.1 90.8 C64.7 89.1 69.4 87.8 65.8 85.8 C62.3 83.9 46.9 79.5 42.9 79.2 Z", "M27.2 146.8 C24.4 147.1 26.7 149.8 26.3 151.3 C25.9 152.7 25.2 154.2 24.8 155.6 C24.4 157.1 24 158.6 23.7 160.1 C23.4 161.6 23.3 163.1 23.2 164.6 C23.1 166.2 23 167.7 22.9 169.2 C22.8 170.7 22.7 172.3 22.5 173.8 C22.3 175.3 22 176.8 21.8 178.3 C21.7 179.8 21.6 181.4 21.6 182.9 C21.5 184.4 21.5 186 21.5 187.5 C21.4 189.1 21.4 190.6 21.3 192.1 C21.2 193.7 21 195.2 20.8 196.7 C20.7 198.2 20.4 199.7 20.3 201.2 C20.2 202.7 20.1 204.3 20 205.8 C19.8 207.3 17.8 209.3 19.4 210.3 C20.9 211.4 27.4 212.5 29.2 212.1 C31 211.6 29.8 209.1 30.2 207.6 C30.5 206.1 31 204.7 31.4 203.2 C31.8 201.7 32.1 200.2 32.5 198.7 C32.8 197.2 33.1 195.7 33.6 194.3 C34 192.8 34.5 191.3 35 189.9 C35.5 188.4 36 187 36.5 185.5 C36.9 184 37.4 182.6 37.8 181.1 C38.1 179.6 38.4 178.1 38.7 176.6 C39.1 175.1 39.5 173.7 39.9 172.2 C40.3 170.7 40.7 169.2 41.1 167.8 C41.5 166.3 41.9 164.8 42.2 163.3 C42.5 161.8 42.6 160.3 42.7 158.8 C42.8 157.2 42.7 155.7 42.8 154.1 C42.9 152.6 46 150.8 43.4 149.6 C40.8 148.4 30.1 146.5 27.2 146.8 Z", "M19.5 208.5 C17.8 208.7 19.3 210.2 19.1 211.1 C18.9 212 18.7 212.8 18.5 213.7 C18.2 214.6 18 215.4 17.7 216.3 C17.5 217.2 17.3 218 17.1 218.9 C16.9 219.8 16.8 220.6 16.7 221.5 C16.6 222.4 16.6 223.3 16.5 224.2 C16.4 225.1 16.4 226 16.4 226.8 C16.4 227.7 16.3 228.6 16.3 229.5 C16.3 230.4 16.3 231.3 16.2 232.2 C16.2 233.1 16.1 233.9 16.1 234.8 C16 235.7 15.9 236.6 15.9 237.5 C15.9 238.4 16.1 239.3 16.3 240.2 C16.4 241.1 16.7 242 16.8 242.9 C16.9 243.8 16.3 244.7 16.9 245.6 C17.5 246.5 19.1 248.1 20.3 248.2 C21.5 248.3 23.3 247.1 24.1 246.4 C24.8 245.6 24.5 244.6 24.8 243.8 C25.1 242.9 25.5 242.1 25.9 241.2 C26.2 240.4 26.6 239.5 26.8 238.7 C27 237.8 27.1 236.9 27.2 236 C27.4 235.2 27.5 234.3 27.6 233.4 C27.8 232.5 28 231.7 28.1 230.8 C28.3 229.9 28.5 229 28.6 228.2 C28.8 227.3 28.9 226.4 29.1 225.5 C29.2 224.7 29.3 223.8 29.4 222.9 C29.5 222 29.6 221.1 29.6 220.2 C29.6 219.4 29.6 218.5 29.5 217.6 C29.5 216.7 29.4 215.8 29.4 214.9 C29.4 214 29.3 213.1 29.3 212.2 C29.3 211.3 31.1 210.2 29.5 209.5 C27.8 208.9 21.3 208.2 19.5 208.5 Z", "M60.5 212.2 C54.2 213.4 60.5 216.8 60.5 219.1 C60.5 221.3 60.5 223.6 60.5 225.9 C60.6 228.2 60.5 230.5 60.6 232.8 C60.7 235 60.9 237.3 61.1 239.6 C61.3 241.9 61.6 244.2 61.8 246.5 C62.1 248.7 62.3 251 62.5 253.3 C62.6 255.6 62.6 257.9 62.8 260.2 C63 262.4 63.3 264.7 63.7 267 C64.1 269.3 64.7 271.5 65.2 273.8 C65.6 276.1 66.2 278.4 66.5 280.7 C66.8 282.9 66.8 285.2 67.1 287.5 C67.4 289.8 67.9 292.1 68.3 294.3 C68.7 296.6 69.4 298.9 69.8 301.2 C70.1 303.5 66.6 306.9 70.2 308 C73.9 309.1 88.2 308.9 91.8 307.7 C95.5 306.5 91.7 303.1 91.9 300.8 C92.1 298.5 92.5 296.2 92.8 294 C93.1 291.7 93.3 289.4 93.4 287.1 C93.6 284.8 93.4 282.5 93.6 280.2 C93.8 277.9 94.1 275.7 94.5 273.4 C94.8 271.1 95.3 268.8 95.5 266.5 C95.8 264.2 96.1 261.9 96.2 259.6 C96.3 257.3 96.2 255.1 96.3 252.8 C96.4 250.5 96.6 248.2 96.8 245.9 C97 243.6 97.3 241.3 97.5 239 C97.7 236.7 97.9 234.5 98 232.2 C98.1 229.9 98.1 227.6 98.2 225.3 C98.2 223 98.3 220.7 98.3 218.5 C98.4 216.2 104.8 212.6 98.5 211.6 C92.2 210.6 66.8 211 60.5 212.2 Z", "M70.2 302.9 C66.5 303.9 70.2 306.7 70 308.6 C69.7 310.5 69.1 312.4 68.7 314.3 C68.4 316.2 68.1 318.1 67.9 319.9 C67.7 321.8 67.8 323.7 67.8 325.6 C67.7 327.5 67.5 329.4 67.5 331.3 C67.6 333.2 67.7 335.1 68 336.9 C68.4 338.8 69.1 340.7 69.6 342.6 C70.2 344.5 70.8 346.3 71.2 348.2 C71.5 350.1 71.4 352 71.7 353.9 C72.1 355.8 72.7 357.6 73.2 359.5 C73.7 361.4 74.5 363.3 75 365.1 C75.4 367 75.7 368.9 75.9 370.8 C76.1 372.7 76.2 374.6 76.3 376.5 C76.4 378.3 74.7 381.2 76.7 382.1 C78.7 383 86.3 382.9 88.3 381.9 C90.3 380.9 88.4 378.1 88.5 376.2 C88.5 374.3 88.5 372.4 88.7 370.5 C88.8 368.7 89 366.8 89.3 364.9 C89.7 363 90.4 361.1 90.9 359.2 C91.4 357.3 91.9 355.4 92.2 353.5 C92.4 351.6 92.2 349.7 92.5 347.8 C92.8 345.9 93.4 344 93.8 342.1 C94.3 340.2 94.9 338.3 95.2 336.4 C95.5 334.5 95.5 332.6 95.5 330.7 C95.4 328.9 95.1 327 95 325.1 C94.9 323.2 94.9 321.3 94.7 319.4 C94.4 317.5 94 315.7 93.6 313.8 C93.2 311.9 92.5 310 92.2 308.1 C91.9 306.3 95.4 303.4 91.8 302.5 C88.1 301.6 73.8 301.9 70.2 302.9 Z",
          "M76.4 376 C74.4 384 67.5 389.5 68.4 394.6 Q69.4 397 74 397 L89.4 397 C91.6 393 90.6 384 88.8 376 Z"
        ].map(d => `<path d="${d}"/>`).join("");
        const ear = `<ellipse cx="83.6" cy="29" rx="2.6" ry="6.5"/>`;
        const fingers = `<path d="M18.6 236 L18.6 245 M21.4 238 L21.6 248 M24.4 237 L24.6 247" stroke-opacity=".5"/>`;

        /* ================= FRONT ================= */
        const frontL =
          N("M91.5 50 C92.5 56 95 61 98.5 66.5 L95.5 67 C93 62 90.5 57 89 51.5 Z")
          + M("traps", "M91.5 57 C86 61 76 63 66 65.5 C74 68.5 84 68.6 92.8 66 C92 63 91.6 60 91.5 57 Z")
          + M("chest", "M71 71 C80 69 90 69 98.5 70 L98.5 86 C88 86 76 88 62.5 95 C63.5 86 66 78 71 71 Z")
          + M("chest", "M62.5 95.5 C76 88.5 88 86.5 98.5 86.5 L98.5 108 C93 114 84 117 75 115 C67 112.5 62.5 107 61.2 101.5 Z")
          + M("abs", "M76 116.5 C79.5 118 82 120 82.5 124 C82.5 145 82 170 83 201 C77 199 71 194 66.5 188 C67.6 177 68 166 67 156 C66 142 64 129 62 118 C66 116.5 71 116 76 116.5 Z")
          + M("abs", "M61.6 110.5 C66 112.5 71 115.5 76 119.5 C75.2 121.6 74.2 123 73 124.2 C69 121.4 65.2 119.4 62.4 118.4 Z")
          + M("abs", "M62.8 120.6 C67 122.6 72 125.6 77 129.6 C76.2 131.7 75.2 133.1 74 134.2 C70 131.4 66.2 129.4 63.7 128.5 Z")
          + M("abs", "M64 130.6 C68.2 132.6 73 135.6 78 139.6 C77.2 141.6 76.2 143 75 144 C71 141.4 67.4 139.4 65 138.6 Z")
          + M("abs", pil(84, 117.5, 98.5, 134.5))
          + M("abs", pil(84, 137.5, 98.5, 155))
          + M("abs", pil(84, 158, 98.5, 176))
          + M("abs", "M84 182 Q84 179 87 179 L95.5 179 Q98.5 179 98.5 182 L98.5 218 C94 215 90 208 87.2 200 C85 194 84 188 84 182 Z")
          + M("biceps", "M35.1 113.1 C35.6 113.2 35.6 116.6 35.2 119.3 C34.8 122 33.2 125.9 32.6 129.3 C32 132.7 31.7 136.9 31.7 139.8 C31.7 142.8 33 145.2 32.8 147 C32.5 148.9 30.9 150.7 30.1 150.9 C29.3 151 28 150.9 27.9 148 C27.9 145 29 138 29.8 133.1 C30.6 128.2 31.8 121.9 32.7 118.6 C33.6 115.2 34.7 113 35.1 113.1 Z") + M("triceps", "M59.2 100.1 C58.5 100.9 56.2 107.2 54.8 111.1 C53.4 115 52.1 119.6 50.6 123.7 C49.1 127.9 47.4 132.2 45.6 136.2 C43.9 140.1 40.9 145 40.1 147.6 C39.4 150.2 40.3 152.4 41.1 151.8 C42 151.1 43.7 148.4 45.5 143.8 C47.4 139.2 50.1 130.5 52.3 124.2 C54.5 117.9 57.6 110.1 58.7 106.1 C59.9 102.1 59.8 99.2 59.2 100.1 Z") + M("biceps", "M55.8 100.6 C55.1 100.2 52.3 104.9 50 106.6 C47.7 108.4 44.2 109.6 42 111.3 C39.9 112.9 38.4 113.9 37 116.7 C35.7 119.5 34.4 124.2 33.7 128.1 C32.9 132 32.5 136.7 32.5 140 C32.5 143.4 33.3 146.4 33.8 148.1 C34.4 149.8 34.8 150.7 35.8 150.2 C36.8 149.7 38.3 147.9 39.8 145.2 C41.4 142.6 43.3 138.5 45.1 134.4 C46.9 130.4 49.1 124.9 50.7 120.7 C52.2 116.5 53.5 112.8 54.4 109.4 C55.2 106.1 56.6 101.1 55.8 100.6 Z")
          + M("shoulders", "M62.5 66.6 C61.6 66.1 56.4 66.9 54 67.6 C51.6 68.3 49.5 69.3 48 70.6 C46.5 71.9 45.7 73.8 45 75.5 C44.3 77.2 44.4 79.5 43.8 81 C43.2 82.5 42.4 82 41.6 84.2 C40.9 86.5 39.9 91.2 39.4 94.3 C38.8 97.5 38.6 100.7 38.5 103.3 C38.4 106 38.1 110.4 38.8 110.3 C39.5 110.3 41 106.2 42.7 103 C44.4 99.8 47.1 94.5 48.9 90.9 C50.7 87.4 51.7 84.9 53.4 81.5 C55.2 78.1 58 73.1 59.5 70.6 C61 68.1 63.4 67.1 62.5 66.6 Z") + M("shoulders", "M64.8 67.6 C66.1 67.6 69.7 67.6 69.4 70.9 C69.1 74.2 64.5 83.7 63.3 87.4 C62 91.1 63.1 90.9 62 93.2 C60.9 95.4 58.9 98.7 56.7 100.9 C54.6 103.1 52 104.6 49.1 106.4 C46.3 108.1 40.6 111.7 39.6 111.3 C38.6 110.9 41.6 107 43.1 103.9 C44.7 100.8 47.4 96 49.2 92.6 C50.9 89.1 51.7 86.7 53.8 83.1 C55.8 79.5 59.6 73.4 61.4 70.8 C63.2 68.2 63.5 67.6 64.8 67.6 Z")
          + M("forearms", "M32.8 148.4 C31.9 146.9 30 146.5 28.9 147.1 C27.8 147.6 27.1 148.8 26.2 151.5 C25.3 154.3 24 158.9 23.3 163.4 C22.6 167.9 22.2 173.5 22 178.6 C21.7 183.7 21.9 189.4 21.8 194.1 C21.7 198.7 21.2 204.1 21.4 206.4 C21.6 208.7 22.4 209.3 23 207.9 C23.6 206.4 24.2 201.9 25.1 197.7 C26 193.6 27.2 187.8 28.2 182.8 C29.3 177.9 30.6 172.4 31.6 168 C32.5 163.5 33.8 159.3 34 156 C34.1 152.7 33.6 149.9 32.8 148.4 Z") + M("forearms", "M35.6 150.1 C36.5 149.2 38.6 150.8 39.7 152.1 C40.8 153.3 42.1 154.5 42.3 157.5 C42.4 160.4 41.6 165.1 40.6 169.5 C39.6 174 37.9 179.4 36.2 184.2 C34.6 189.1 32.3 194.7 30.8 198.7 C29.3 202.8 28.3 207 27.1 208.6 C25.9 210.2 23.8 210.2 23.5 208.6 C23.2 207 24.6 203.1 25.5 199 C26.3 195 27.7 189.1 28.8 184.2 C29.9 179.2 31.3 173.8 32.2 169.3 C33.2 164.8 34.2 160.6 34.7 157.4 C35.3 154.2 34.8 151 35.6 150.1 Z") + M("forearms", "M37.1 151.6 C38.2 149.7 39.6 149.8 40 150.9 C40.4 152 40.3 155.5 39.5 158.2 C38.6 160.9 36.3 164.4 34.7 167.3 C33.2 170.1 31 174.4 30.3 175.1 C29.5 175.9 29.6 174.2 30.1 172 C30.6 169.9 32.3 165.5 33.5 162.1 C34.6 158.7 36 153.5 37.1 151.6 Z")
          + M("glutes", "M69 211.1 C67.6 211 62.9 211.7 61.4 213.1 C60 214.6 60.6 217.1 60.5 219.8 C60.4 222.5 60.6 226.1 60.9 229.3 C61.2 232.5 61.6 237.5 62.3 238.8 C63 240 64.4 239.2 65.3 236.8 C66.2 234.4 66.8 228.3 67.7 224.4 C68.5 220.6 70.1 216.2 70.4 213.9 C70.6 211.7 70.5 211.3 69 211.1 Z")
          + M("quads", "M85.2 211.8 C86.1 209.4 88.9 214.9 90.8 214.6 C92.8 214.2 95.7 208.6 97 209.7 C98.2 210.8 98.2 215.6 98.3 221.1 C98.3 226.6 97.6 236.2 97.1 243 C96.6 249.8 96.2 258 95.2 262 C94.2 266 92.4 266.8 91.1 266.8 C89.7 266.9 87.9 265.3 87.1 262.1 C86.3 259 86.6 253.4 86.3 247.9 C86 242.4 85.5 234.9 85.3 228.9 C85.2 222.9 84.3 214.2 85.2 211.8 Z") + M("quads", "M73.8 212 C74.9 209.6 77 208.8 78.6 210 C80.1 211.3 82 214.7 83.2 219.4 C84.3 224.2 85.3 231.3 85.5 238.4 C85.7 245.5 85 254.6 84.5 262.2 C84 269.8 83.2 278.2 82.5 284.1 C81.9 289.9 81.3 294.7 80.7 297.4 C80 300.1 79.3 301.4 78.6 300.3 C77.8 299.2 77.2 296.3 76.3 290.8 C75.4 285.3 73.8 275 73 267.1 C72.2 259.2 71.7 250.5 71.5 243.4 C71.3 236.3 71.4 229.6 71.8 224.4 C72.2 219.1 72.7 214.4 73.8 212 Z") + M("quads", "M69.9 225.4 C69.4 225.4 67.9 228.7 66.9 231.1 C66 233.5 65.2 237.5 64.4 239.7 C63.6 241.9 62.3 241.5 62 244.5 C61.7 247.5 61.9 252.4 62.7 257.8 C63.4 263.2 65 270.7 66.2 276.7 C67.4 282.7 68.6 289.2 69.9 293.8 C71.2 298.3 73 302.1 74.3 304.2 C75.5 306.2 76.9 306.6 77.6 306 C78.2 305.4 78.3 302.7 78 300.3 C77.7 297.9 76.8 297.3 75.8 291.8 C74.7 286.3 72.8 275 71.9 267.1 C71 259.2 70.5 250.4 70.3 244.4 C70.1 238.3 70.6 234.2 70.5 231 C70.4 227.9 70.5 225.3 69.9 225.4 Z") + M("quads", "M86.3 266.9 C85.3 268.2 85.5 272.9 85 276.4 C84.5 279.9 84 284 83.5 287.9 C82.9 291.7 81.7 296.4 81.7 299.3 C81.7 302.1 82.6 303.7 83.4 305 C84.2 306.2 85.3 307.5 86.4 306.8 C87.6 306.2 89 304.2 90.1 301.1 C91.2 297.9 92.6 291.8 93.2 287.7 C93.7 283.6 93.7 279.5 93.3 276.3 C93 273.1 92.4 270.3 91.2 268.7 C90 267.2 87.3 265.6 86.3 266.9 Z") + M("quads", "M65.8 206.4 C66.1 208.6 68.5 215.1 70.7 219.6 C73 224.2 77 228.7 79.3 233.8 C81.7 238.8 83.4 244.6 84.8 249.8 C86.3 255 87.3 260.6 88 265 C88.7 269.4 88.5 274.9 88.9 276.4 C89.4 277.8 90.7 275.9 90.9 273.5 C91.2 271.1 91 266.7 90.4 262.1 C89.9 257.5 89 251.5 87.7 246 C86.4 240.5 84.9 234 82.5 229 C80.2 223.9 76 219.6 73.8 215.8 C71.5 212 70.1 207.9 68.8 206.4 C67.5 204.8 65.4 204.2 65.8 206.4 Z")
          + M("calves", "M70.3 312.9 C69.9 312.1 68.8 312.2 68.4 316 C68 319.9 67.2 329.5 67.9 336.1 C68.5 342.6 71 350.1 72.4 355.2 C73.8 360.3 75.8 366.1 76.3 366.7 C76.7 367.3 75.8 363.5 74.9 359 C74.1 354.6 72.2 346.3 71.4 339.9 C70.6 333.4 70.5 325.1 70.3 320.6 C70.1 316.1 70.6 313.7 70.3 312.9 Z") + M("calves", "M85 343.4 C85.5 343.2 86.6 350.9 87.3 353.4 C88 356 88.7 357.6 89.2 358.8 C89.7 359.9 90.6 358.7 90.3 360.3 C90 361.8 88.2 366.1 87.5 368 C86.7 370 86.3 372.2 85.8 371.9 C85.4 371.7 85 369.4 84.8 366.5 C84.6 363.7 84.5 358.9 84.6 355 C84.6 351.1 84.6 343.7 85 343.4 Z") + M("calves", "M84.5 304.9 C83.5 305.3 83 306.2 82.9 308.8 C82.7 311.4 83.2 315.9 83.7 320.4 C84.2 324.8 85.2 330.9 85.7 335.7 C86.3 340.6 86.5 346.2 87.1 349.6 C87.7 352.9 88.6 355.4 89.5 355.7 C90.3 355.9 91.1 355 92.1 351 C93.1 347 95.3 337.8 95.5 331.7 C95.7 325.5 94.6 318.2 93.4 314 C92.3 309.8 90.1 307.9 88.6 306.4 C87.1 304.9 85.4 304.5 84.5 304.9 Z") + M("calves", "M74.4 308.2 C73.3 308.5 71.9 308.5 71.4 310.6 C70.9 312.6 71.1 315.7 71.3 320.6 C71.4 325.5 71.6 333.4 72.4 339.8 C73.2 346.2 74.8 353.5 75.9 359 C77.1 364.5 78.4 369.6 79.2 372.8 C79.9 376 80.3 377.9 80.6 378.2 C81 378.4 81.5 377.5 81.4 374.3 C81.3 371.1 80.5 365.3 80.3 358.9 C80 352.5 80 342.9 80 335.8 C79.9 328.8 80.5 321.1 80.2 316.6 C79.9 312.1 79.2 310.3 78.3 308.9 C77.3 307.5 75.6 307.9 74.4 308.2 Z");
        const frontDetail = `
          <ellipse cx="79.9" cy="306.5" rx="5.6" ry="6.6" fill="#2b2b30"/>
          <path d="M71 71.5 Q84 67.5 98 69.5" stroke-opacity=".45"/>
          <path d="M72 79 Q84 82.5 98 81 M67 97 Q81 94.5 97.5 95.5 M68.5 105.5 Q82 106.5 96 103.5" stroke-opacity=".35"/>
          <path d="M70 162 Q75 176 80 192" stroke-opacity=".3"/>
          ${fingers}`;
        const frontCenter = `<ellipse cx="100" cy="191" rx="1.8" ry="2.6" fill="#0c0c0e"/>`;

        /* ================= BACK ================= */
        const backL =
          M("traps", "M99 46.5 C96.5 48 94.2 50 93 52 C92 56 90 60 86 62 C78 64 70 65 64.5 66.6 C72 70 81 74 89 77.5 C93 79.3 96.5 80.6 99 81.2 Z")
          + M("traps", "M99 84 C95 84 90 82.5 85 80.6 C80 78.8 75 76.6 70.5 74.6 C76.5 82.5 82.5 92 88 104 C92 116 96 132 99 149 Z")
          + M("back", "M74.2 77.4 C71 84.4 67.4 92.4 65.2 100.4 C70.4 106.4 78.4 110.2 86.4 111 C87.8 103 87.6 95 85.6 87.4 C82.2 82.6 78.4 79.4 74.2 77.4 Z")
          + M("back", "M64.4 103.4 C62.6 107.2 61.6 111 62.4 115 C69 117 77 117.2 84.2 114.6 C77 113 70.8 109.4 64.4 103.4 Z")
          + M("back", "M61 107 C63 122 65 138 67 154 C68 166 72 176 79 185 C85 190 91 190.4 95.6 188.4 C93.6 176 92 164 90.6 152 C89.6 140 88.6 128 87.2 117.6 C79 120.4 70 119.6 62.6 117.6 Z")
          + M("lowerback", "M93 140.5 C91 160 90.2 178 90.2 196 C90.2 204 91.6 210 93 214.5 L98.6 214.5 L98.6 150.5 C97 146.6 95 143.4 93 140.5 Z")
          + M("abs", "M66.6 160.5 C67.1 172 66.6 182.5 64.6 195.5 C70 197 76 197 82.2 194.4 C75 186.4 70 176.4 66.6 160.5 Z")
          + N("M36.4 135 C35.5 135.3 33.7 138.1 32.6 139.3 C31.5 140.5 30.3 140.6 29.9 142.4 C29.4 144.2 29.2 148.5 30 150.1 C30.7 151.7 32.8 151.7 34.4 152.1 C35.9 152.6 37.9 153.7 39.2 152.8 C40.5 151.9 42.1 148.3 42.3 146.7 C42.5 145.1 40.9 144.5 40.3 143.1 C39.7 141.6 39.3 139.3 38.6 138 C38 136.6 37.4 134.8 36.4 135 Z") + M("triceps", "M52.3 93.5 C54 91.7 56.1 94.6 57.2 96.4 C58.3 98.3 59.3 100.5 58.7 104.5 C58.1 108.6 55.3 115.7 53.5 120.7 C51.8 125.7 49.6 130.8 48 134.5 C46.4 138.3 45.1 141.8 43.8 143.3 C42.6 144.9 41.3 145.1 40.5 143.9 C39.7 142.6 39 139.4 39.3 135.8 C39.5 132.3 40.8 127.6 42.1 122.8 C43.3 118 45.1 112.1 46.8 107.2 C48.5 102.4 50.6 95.3 52.3 93.5 Z") + M("triceps", "M42.9 103.1 C41.7 102.2 38.9 102.7 37.3 104.5 C35.8 106.4 34.6 110.4 33.6 114.2 C32.6 118 31.8 123.7 31.3 127.4 C30.9 131.1 30.7 134.5 31 136.5 C31.3 138.6 32.2 139.8 33.2 139.5 C34.1 139.1 35.5 137.4 36.9 134.4 C38.3 131.3 40.5 125.3 41.8 121.2 C43.1 117.1 44.5 112.7 44.7 109.7 C44.9 106.7 44.1 103.9 42.9 103.1 Z")
          + M("shoulders", "M62.5 66.6 C61.6 66.1 56.4 66.9 54 67.6 C51.6 68.3 49.5 69.3 48 70.6 C46.5 71.9 45.7 73.8 45 75.5 C44.3 77.2 44.4 79.5 43.8 81 C43.2 82.5 42.4 82 41.6 84.2 C40.9 86.5 39.9 91.2 39.4 94.3 C38.8 97.5 38.6 100.7 38.5 103.3 C38.4 106 38.1 110.4 38.8 110.3 C39.5 110.3 41 106.2 42.7 103 C44.4 99.8 47.1 94.5 48.9 90.9 C50.7 87.4 51.7 84.9 53.4 81.5 C55.2 78.1 58 73.1 59.5 70.6 C61 68.1 63.4 67.1 62.5 66.6 Z") + M("shoulders", "M64.8 67.6 C66.1 67.6 69.7 67.6 69.4 70.9 C69.1 74.2 64.5 83.7 63.3 87.4 C62 91.1 63.1 90.9 62 93.2 C60.9 95.4 58.9 98.7 56.7 100.9 C54.6 103.1 52 104.6 49.1 106.4 C46.3 108.1 40.6 111.7 39.6 111.3 C38.6 110.9 41.6 107 43.1 103.9 C44.7 100.8 47.4 96 49.2 92.6 C50.9 89.1 51.7 86.7 53.8 83.1 C55.8 79.5 59.6 73.4 61.4 70.8 C63.2 68.2 63.5 67.6 64.8 67.6 Z")
          + M("forearms", "M32.8 148.4 C31.9 146.9 30 146.5 28.9 147.1 C27.8 147.6 27.1 148.8 26.2 151.5 C25.3 154.3 24 158.9 23.3 163.4 C22.6 167.9 22.2 173.5 22 178.6 C21.7 183.7 21.9 189.4 21.8 194.1 C21.7 198.7 21.2 204.1 21.4 206.4 C21.6 208.7 22.4 209.3 23 207.9 C23.6 206.4 24.2 201.9 25.1 197.7 C26 193.6 27.2 187.8 28.2 182.8 C29.3 177.9 30.6 172.4 31.6 168 C32.5 163.5 33.8 159.3 34 156 C34.1 152.7 33.6 149.9 32.8 148.4 Z") + M("forearms", "M35.6 150.1 C36.5 149.2 38.6 150.8 39.7 152.1 C40.8 153.3 42.1 154.5 42.3 157.5 C42.4 160.4 41.6 165.1 40.6 169.5 C39.6 174 37.9 179.4 36.2 184.2 C34.6 189.1 32.3 194.7 30.8 198.7 C29.3 202.8 28.3 207 27.1 208.6 C25.9 210.2 23.8 210.2 23.5 208.6 C23.2 207 24.6 203.1 25.5 199 C26.3 195 27.7 189.1 28.8 184.2 C29.9 179.2 31.3 173.8 32.2 169.3 C33.2 164.8 34.2 160.6 34.7 157.4 C35.3 154.2 34.8 151 35.6 150.1 Z") + M("forearms", "M37.1 151.6 C38.2 149.7 39.6 149.8 40 150.9 C40.4 152 40.3 155.5 39.5 158.2 C38.6 160.9 36.3 164.4 34.7 167.3 C33.2 170.1 31 174.4 30.3 175.1 C29.5 175.9 29.6 174.2 30.1 172 C30.6 169.9 32.3 165.5 33.5 162.1 C34.6 158.7 36 153.5 37.1 151.6 Z")
          + M("quads", "M61 234 C60.8 236.4 61.6 245.9 62.4 253 C63.3 260.1 64.8 269.6 66.1 276.7 C67.3 283.8 68.8 291.4 69.8 295.7 C70.8 299.9 71.9 303.9 71.9 302.3 C71.9 300.7 71 293.6 70.1 286.2 C69.1 278.7 67.2 265.6 66.2 257.7 C65.2 249.8 65 242.7 64.1 238.7 C63.3 234.8 61.3 231.7 61 234 Z") + M("hamstrings", "M94.3 238.3 C93.8 240.3 94.1 246.2 93.8 252.5 C93.4 258.9 92.8 268.4 92.2 276.3 C91.6 284.2 90.6 295.3 90.4 300.1 C90.3 304.9 90.8 307.2 91.3 304.8 C91.8 302.5 92.6 293.7 93.4 285.8 C94.3 277.9 95.6 264.9 96.2 257.2 C96.8 249.6 97.4 243.3 97 240.1 C96.7 237 94.8 236.2 94.3 238.3 Z") + M("hamstrings", "M72.2 244.3 C70.5 244.7 68 245.2 67.2 248.2 C66.4 251.2 66.7 256.9 67.3 262.5 C67.9 268 69.7 275.9 70.6 281.4 C71.5 286.9 71.8 291.7 72.7 295.6 C73.6 299.6 75 303.5 76.1 305.1 C77.3 306.6 78.7 306.3 79.4 305 C80 303.7 80.1 301.4 80.1 297.4 C80.1 293.5 79.8 287.9 79.7 281.3 C79.5 274.6 79.6 263.4 79.3 257.5 C78.9 251.7 78.8 248.3 77.6 246.1 C76.4 243.9 74 244 72.2 244.3 Z") + M("hamstrings", "M81.1 246.1 C79.8 247.7 80.3 251.6 80.3 257.5 C80.2 263.4 80.5 274.6 80.7 281.2 C80.9 287.9 81.1 293.4 81.5 297.4 C81.9 301.3 82.3 303.7 83.2 305 C84 306.2 85.4 306.5 86.4 304.9 C87.4 303.3 88.3 300.1 89 295.4 C89.7 290.6 90.3 282.7 90.8 276.3 C91.3 270 92.5 262.1 92 257.3 C91.6 252.6 89.8 249.7 88 247.9 C86.2 246 82.4 244.5 81.1 246.1 Z")
          + M("glutes", "M62 205.4 C60.4 213 60.2 219 60.8 225.6 C68 218.4 76 212.4 86.2 208.2 C80 203.4 70 201.6 62 205.4 Z")
          + M("glutes", "M62.6 225 C61.4 236 63.6 247.6 70 255 C78 263 90 263 98.6 258 L98.6 216.4 C92 210.4 84 210.4 76 213.4 C70 216.4 65.4 219.4 62.6 225 Z")
          + M("calves", "M69 334.5 C67.3 335.2 70.3 342.8 71.5 347.6 C72.6 352.3 74.9 358.7 76.2 362.9 C77.5 367.1 78.4 370.9 79.5 372.8 C80.5 374.7 81.4 374.3 82.3 374.3 C83.3 374.3 84.2 374.6 85.2 372.7 C86.1 370.8 86.9 366.9 88.1 362.6 C89.2 358.4 91.2 351.9 92.2 347.1 C93.2 342.4 95.8 334.6 94.1 334 C92.4 333.4 85.9 343.4 81.8 343.5 C77.6 343.6 70.8 333.8 69 334.5 Z") + N("M79.9 352.8 C79.6 355.6 80.3 361.8 80.5 366.6 C80.6 371.5 80.1 379.5 80.8 382 C81.4 384.6 83.7 384.5 84.2 382 C84.8 379.4 83.9 371.4 83.9 366.6 C83.9 361.7 84.3 355.5 84 352.7 C83.7 349.9 82.6 349.6 81.9 349.7 C81.2 349.7 80.1 350 79.9 352.8 Z") + M("calves", "M76.7 306.6 C75.2 306.7 73 306.7 71.6 309 C70.1 311.4 68.5 316.4 67.9 320.7 C67.3 324.9 67.1 330.4 67.9 334.5 C68.7 338.6 71.3 342.4 72.7 345.2 C74.2 348 75.4 350.6 76.7 351.3 C78 352 79.6 351.6 80.3 349.7 C81 347.8 81 344.5 81 339.7 C81.1 334.8 80.9 325.5 80.8 320.4 C80.6 315.3 80.9 311.2 80.2 308.9 C79.5 306.6 78.1 306.6 76.7 306.6 Z") + M("calves", "M81.5 305 C82.4 303.3 84.6 304.9 86.5 306.4 C88.3 307.9 91.2 310.5 92.7 314 C94.1 317.6 95.2 323 95.3 327.8 C95.3 332.7 94.1 338.6 93 343.3 C92 347.9 90.2 353.1 88.9 355.7 C87.5 358.3 85.8 359.1 84.7 358.8 C83.7 358.6 83 358.1 82.6 354.3 C82.1 350.4 82.1 342.1 81.9 335.8 C81.7 329.5 81.5 321.7 81.5 316.5 C81.4 311.4 80.7 306.7 81.5 305 Z");
        const backDetail = `
          <path d="M86.4 99 Q76.4 96 67.4 100.4" stroke-opacity=".35"/>
          <path d="M70 128 Q78 150 86 174 M65 120 Q72 134 79 154" stroke-opacity=".3"/>
          <path d="M92 104 Q95 120 97 136" stroke-opacity=".3"/>
          <path d="M70 232 Q80 243 93 249 M66 240 Q75 252 88 258" stroke-opacity=".28"/>
          ${fingers}`;
        const backCenter = `<path d="M100 150 V214.5" stroke="#0c0c0e" stroke-width="1"/>`;

        const mirror = inner => `<g>${inner}</g><g transform="translate(200 0) scale(-1 1)">${inner}</g>`;
        const figure = (x, muscles, detail, center, label) => `
          <g transform="translate(${x} 0)">
            <g fill="#3a3a41" stroke="#3a3a41" stroke-width="2.4" stroke-linejoin="round">${mirror(sil + ear)}</g>
            <g fill="#1f1f23">${mirror(sil + ear)}</g>
            <g stroke="#0c0c0e" stroke-width="1.1" stroke-linejoin="round">${mirror(muscles)}</g>
            <g fill="none" stroke="#0c0c0e" stroke-width="0.9" stroke-linecap="round" pointer-events="none">${mirror(detail)}${center}</g>
            <text x="100" y="412" text-anchor="middle" font-size="11" font-weight="700" fill="#71717a" letter-spacing="2">${label}</text>
          </g>`;
        const defs = `<defs><linearGradient id="${sh}" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#fff" stop-opacity=".24"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></linearGradient></defs>`;
        return `<svg viewBox="0 0 420 418" class="w-full h-auto max-w-sm mx-auto block select-none" role="img" aria-label="Muscle map: sets per muscle">${defs}
          ${figure(0, frontL, frontDetail, frontCenter, "FRONT")}${figure(220, backL, backDetail, backCenter, "BACK")}</svg>`;
      },
      muscleMapHtml() {
        const vals = this.regionSetsForMode(this.progressWeekMode);
        this._mapVals = vals;
        const dot = (col, t) => `<span class="inline-flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full inline-block" style="background:${col}"></span>${t}</span>`;
        return `<div class="space-y-2">
            ${this.muscleMapSvg(vals)}
            <div id="mm-info" class="text-center text-[11px] text-zinc-400 min-h-[1rem]">Tap a muscle to see its sets</div>
            <div class="flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] text-zinc-400">${dot("#3f3f46", "none")}${dot("#f59e0b", "under 10")}${dot(PT.accent(), "10–20")}${dot("#f43f5e", "20+")}</div>
          </div>`;
      },
      bindMuscleMap(root) {
        const info = root.querySelector("#mm-info");
        if (!info) return;
        const when = { this: "this week", last: "last week", avg: "a week (4-week average)" }[this.progressWeekMode] || "";
        root.querySelectorAll(".mm-r").forEach(el => el.addEventListener("click", () => {
          const r = el.dataset.r, v = (this._mapVals || {})[r] || 0;
          root.querySelectorAll(".mm-r").forEach(x => x.setAttribute("stroke", x.dataset.r === r ? "#ffffff" : "#09090b"));
          info.innerHTML = `<b class="text-white">${PT.esc(MAP_REGIONS[r] || r)}</b> · ${PT.num(v, v % 1 ? 1 : 0)} set${v === 1 ? "" : "s"} ${when}`;
        }));
      },

      /* -------------------------------------------------- strength level */
      bestLift(lift) {
        let best = 0, holder = "";
        Object.keys(this.prs || {}).forEach(n => {
          if (((lift.match.test(n) && !(lift.exclude && lift.exclude.test(n))) || (lift.also && lift.also.test(n))) && !PT.isBodyweightEx(n) && this.prs[n] > best) { best = this.prs[n]; holder = n; }
        });
        return { best, holder };
      },
      strengthCardHtml() {
        const kg = this.unit() === "kg", u = this.wLabel();
        const toLb = v => kg ? v / KG_PER_LB : v;
        const fromLb = v => kg ? v * KG_PER_LB : v;
        const sex = this.settings.strengthSex === "female" ? "female" : "male";
        const bw = this.bwOn(PT.ds());
        const seg = (k, t) => `<button class="str-sex px-2.5 py-1 rounded-lg text-[11px] font-bold tap-active ${sex === k ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-400"}" data-k="${k}">${t}</button>`;
        let html = `<div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3" id="strength-card">
          <div class="flex items-center justify-between gap-2"><h3 class="text-xs font-bold text-white">Strength level</h3><div class="flex gap-1.5">${seg("male", "Men")}${seg("female", "Women")}</div></div>`;
        if (!bw) {
          html += `<p class="text-xs text-zinc-400">Your level compares your lifts with people of the same body weight. Log your body weight first.</p>
            <button id="str-log-bw" class="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white tap-active">Log body weight</button></div>`;
          return html;
        }
        const bwLb = toLb(bw);
        const rows = [];
        const totals = {};
        STRENGTH_LIFTS.forEach(l => {
          const { best, holder } = this.bestLift(l);
          const lv = best ? PT.strengthLevel(l.key, sex, bwLb, toLb(best)) : null;
          if (best) totals[l.key] = toLb(best);
          rows.push({ l, best, holder, lv });
        });
        const withData = rows.filter(r => r.lv);
        const overall = withData.length ? Math.floor(withData.reduce((a, r) => a + r.lv.idx + r.lv.frac * 0.999, 0) / withData.length) : -1;
        if (overall >= 0) {
          html += `<div class="flex items-center gap-3 bg-zinc-950 border border-zinc-800 rounded-xl p-3">
            <span class="text-2xl">🏋️</span>
            <div class="min-w-0"><span class="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Overall</span>
              <span class="block text-base font-black" style="color:${STRENGTH_COLORS[overall]}">${STRENGTH_LEVELS[overall]}</span></div>
            <span class="ml-auto text-[11px] text-zinc-500 text-right">Body weight<br><b class="font-mono text-zinc-300">${PT.num(bw, 1)} ${u}</b></span>
          </div>`;
        }
        html += `<div class="space-y-3">${rows.map(r => {
          if (!r.lv) return `<div class="text-xs"><div class="flex justify-between"><span class="font-bold text-zinc-300">${r.l.label}</span><span class="text-zinc-600">no lift logged</span></div></div>`;
          const col = STRENGTH_COLORS[r.lv.idx];
          const nextTxt = r.lv.next ? `${r.lv.nextLevel} at ${PT.num(Math.ceil(fromLb(r.lv.next)), 0)} ${u}` : "Top level reached";
          return `<button class="str-row w-full text-left space-y-1 tap-active" data-name="${PT.esc(r.holder)}">
            <div class="flex items-center justify-between gap-2 text-xs">
              <span class="font-bold text-white">${r.l.label}</span>
              <span class="font-mono text-zinc-300">${PT.num(r.best, 0)} ${u} <span class="text-zinc-500">· ${PT.num(toLb(r.best) / bwLb, 2)}× BW</span></span>
            </div>
            <div class="flex items-center gap-2">
              <span class="shrink-0 w-[5.5rem] text-[11px] font-black" style="color:${col}">${r.lv.level}</span>
              <div class="flex-grow h-2 rounded-full bg-zinc-800 overflow-hidden"><div class="h-2 rounded-full" style="width:${Math.round(r.lv.frac * 100)}%;background:${col}"></div></div>
            </div>
            <div class="text-[10px] text-zinc-500">Next: ${nextTxt}</div>
          </button>`;
        }).join("")}</div>`;
        const club = (totals.squat || 0) + (totals.bench || 0) + (totals.deadlift || 0);
        const clubPct = Math.min(100, Math.round(club / 10));
        html += `<div class="bg-zinc-950 border border-zinc-800 rounded-xl p-3 space-y-1.5">
            <div class="flex items-center justify-between text-xs"><span class="font-bold text-white">${club >= 1000 ? "🏆 " : ""}1,000 lb club</span>
              <span class="font-mono ${club >= 1000 ? "text-amber-400" : "text-zinc-300"}">${PT.num(fromLb(club), 0)} / ${kg ? "454 kg" : "1,000 lb"}</span></div>
            <div class="h-2 rounded-full bg-zinc-800 overflow-hidden"><div class="h-2 rounded-full ${club >= 1000 ? "bg-amber-400" : "bg-emerald-500"}" style="width:${clubPct}%"></div></div>
            <p class="text-[10px] text-zinc-500">${club >= 1000 ? "You're in! Squat + bench + deadlift add up to 1,000 lb or more." : club ? `Squat + bench + deadlift. ${PT.num(fromLb(1000 - club), 0)} ${u} to go.` : "Log a squat, bench press and deadlift to start your total."}</p>
          </div>
          <p class="text-[10px] text-zinc-500 leading-relaxed">Uses your best estimated 1-rep max for barbell or Smith machine bench, back or Smith machine squat, and deadlift, compared with StrengthLevel.com standards for your body weight. Tap a lift for its chart.</p>
        </div>`;
        return html;
      },
      bindStrengthCard(root) {
        root.querySelectorAll(".str-sex").forEach(b => b.addEventListener("click", () => {
          this.settings.strengthSex = b.dataset.k === "female" ? "female" : "male";
          WorkoutStorage.saveSettings(this.settings);
          this.renderProgressView();
        }));
        const lb = root.querySelector("#str-log-bw");
        if (lb) lb.addEventListener("click", () => this.showView("body"));
        root.querySelectorAll(".str-row").forEach(b => b.addEventListener("click", () => { if (b.dataset.name) this.openExerciseSheet(b.dataset.name); }));
      },

      /* --------------------------------------------------- monthly recap */
      monthStats(m0) {
        const m1 = new Date(m0.getFullYear(), m0.getMonth() + 1, 1);
        const p0 = new Date(m0.getFullYear(), m0.getMonth() - 1, 1);
        const between = (a, b) => this.sessions.filter(s => { const t = PT.fromDs(s.date); return t >= a && t < b; });
        const cur = between(m0, m1), prev = between(p0, m0);
        const sum = (arr, f) => arr.reduce((a, s) => a + (f(s) || 0), 0);
        const muscles = {}, exSets = {};
        let cardioMin = 0, cardioDist = 0;
        cur.forEach(s => (s.ex || []).forEach(e => {
          const work = (e.sets || []).filter(st => st.t !== "W");
          if (!work.length) return;
          const c = PT.category(e.name);
          muscles[c] = (muscles[c] || 0) + work.length;
          exSets[e.name] = (exSets[e.name] || 0) + work.length;
          work.forEach(st => { cardioMin += parseFloat(st.min) || 0; cardioDist += parseFloat(st.dist) || 0; });
        }));
        const startMs = m0.getTime(), endMs = m1.getTime();
        const before = {}, during = {};
        this.sessions.forEach(s => {
          const t = PT.fromDs(s.date).getTime();
          if (!(t < endMs)) return;
          (s.ex || []).forEach(e => (e.sets || []).forEach(st => {
            if (st.t === "W") return;
            const v = this.setE1rm(e.name, st, s.date);
            if (!(v > 0)) return;
            const bucket = t < startMs ? before : during;
            if (v > (bucket[e.name] || 0)) bucket[e.name] = v;
          }));
        });
        let improved = null;
        Object.keys(during).forEach(n => {
          const b = before[n];
          if (!(b > 0)) return;
          const gain = (during[n] - b) / b;
          if (gain > 0 && (!improved || gain > improved.gain)) improved = { name: n, from: b, to: during[n], gain };
        });
        const prNames = [];
        cur.forEach(s => (s.prs || []).forEach(n => { if (!prNames.includes(n)) prNames.push(n); }));
        return {
          m0, m1, cur, prev, workouts: cur.length, prevWorkouts: prev.length,
          vol: sum(cur, s => s.vol), prevVol: sum(prev, s => s.vol), sets: sum(cur, s => s.sets), dur: sum(cur, s => s.dur),
          days: new Set(cur.map(s => s.date)).size, prCount: sum(cur, s => (s.prs || []).length), prNames,
          muscles, exSets, cardioMin, cardioDist, improved
        };
      },
      recapCardHtml(m0) {
        const S = this.monthStats(m0);
        const u = this.wLabel();
        const month = m0.toLocaleDateString(undefined, { month: "long", year: "numeric" });
        const prevName = new Date(m0.getFullYear(), m0.getMonth() - 1, 1).toLocaleDateString(undefined, { month: "short" });
        const stat = (k, v, c = "text-white", sub = "") => `<div class="bg-zinc-950 border border-zinc-800 rounded-xl p-2.5"><span class="block text-[10px] text-zinc-500 uppercase font-bold">${k}</span><span class="block font-mono font-bold text-sm ${c}">${v}</span>${sub ? `<span class="block text-[10px] font-mono ${sub.startsWith("+") ? "text-emerald-400" : sub.startsWith("−") ? "text-rose-400" : "text-zinc-500"}">${sub}</span>` : ""}</div>`;
        const delta = (a, b, pct) => {
          if (!S.prevWorkouts) return "";
          if (pct) { if (!b) return ""; const d = Math.round(((a - b) / b) * 100); return (d > 0 ? "+" : d < 0 ? "−" : "±") + Math.abs(d) + "% vs " + prevName; }
          const d = a - b; return (d > 0 ? "+" : d < 0 ? "−" : "±") + Math.abs(d) + " vs " + prevName;
        };
        const fmtHours = sec => { const h = Math.floor(sec / 3600), m = Math.round((sec % 3600) / 60); return h ? `${h}h ${m}m` : `${m}m`; };
        let html = `<div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3" id="recap-card">
            <div class="flex items-center justify-between">
              <button id="pm-prev" class="p-1.5 px-2.5 rounded-lg bg-zinc-800 text-zinc-300 tap-active" aria-label="Previous month">‹</button>
              <h3 class="text-xs font-bold text-white">${PT.esc(month)} recap</h3>
              <button id="pm-next" class="p-1.5 px-2.5 rounded-lg bg-zinc-800 text-zinc-300 tap-active" aria-label="Next month">›</button>
            </div>`;
        if (!S.workouts) return html + `<p class="text-xs text-zinc-500">No workouts saved this month.</p></div>`;
        html += `<div class="grid grid-cols-3 gap-2">
              ${stat("Workouts", S.workouts, "text-white", delta(S.workouts, S.prevWorkouts))}
              ${stat("Time", fmtHours(S.dur))}
              ${stat("Volume", Math.round(S.vol).toLocaleString(), "text-emerald-400", delta(S.vol, S.prevVol, true))}
              ${stat("Sets", S.sets)}
              ${stat("PRs", S.prCount, "text-amber-400")}
              ${stat("Active days", S.days)}
            </div>`;
        if (S.improved) {
          html += `<button class="pr-ex w-full text-left bg-emerald-950/30 border border-emerald-800/50 rounded-xl p-3 tap-active" data-name="${PT.esc(S.improved.name)}">
              <span class="block text-[10px] font-bold uppercase tracking-wider text-emerald-400">📈 Most improved</span>
              <span class="block text-sm font-bold text-white mt-0.5">${PT.esc(S.improved.name)}</span>
              <span class="block text-[11px] text-zinc-400 font-mono">est. 1RM ${PT.num(S.improved.from, 0)} → ${PT.num(S.improved.to, 0)} ${u} <b class="text-emerald-400">+${PT.num(S.improved.gain * 100, 1)}%</b></span>
            </button>`;
        }
        const mus = Object.keys(S.muscles).filter(k => MUSCLE_ORDER.includes(k) && k !== "Other" && k !== "Cardio").sort((a, b) => S.muscles[b] - S.muscles[a]).slice(0, 4);
        const maxM = Math.max(1, ...mus.map(k => S.muscles[k]));
        if (mus.length) {
          html += `<div class="space-y-1.5"><span class="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Top muscles</span>
            ${mus.map(k => `<div class="flex items-center gap-2 text-xs"><span class="w-20 shrink-0 text-zinc-300 font-semibold">${PT.esc(k)}</span><div class="flex-grow h-2.5 rounded-full bg-zinc-800 overflow-hidden"><div class="h-2.5 rounded-full bg-emerald-500" style="width:${Math.round((S.muscles[k] / maxM) * 100)}%"></div></div><span class="w-14 text-right font-mono text-zinc-400 text-[11px]">${S.muscles[k]} sets</span></div>`).join("")}
          </div>`;
        }
        const top = Object.keys(S.exSets).sort((a, b) => S.exSets[b] - S.exSets[a]).slice(0, 3);
        html += `<div class="text-xs text-zinc-400"><span class="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">Most trained</span>${top.map((n, i) => `<div class="flex justify-between gap-2"><span class="text-zinc-200 truncate">${i + 1}. ${PT.esc(n)}</span><span class="font-mono shrink-0">${S.exSets[n]} sets</span></div>`).join("")}</div>`;
        if (S.cardioMin > 0 || S.cardioDist > 0) {
          html += `<div class="text-xs text-zinc-300 bg-zinc-950 border border-zinc-800 rounded-xl p-2.5">🏃 Cardio: <b class="font-mono text-white">${PT.num(S.cardioMin, 0)} min</b>${S.cardioDist > 0 ? ` · <b class="font-mono text-white">${PT.num(S.cardioDist, 1)} ${this.distLabel()}</b>` : ""}</div>`;
        }
        if (S.prNames.length) {
          html += `<div class="text-xs"><span class="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">PRs this month</span><div class="flex flex-wrap gap-1.5">${S.prNames.slice(0, 8).map(n => `<button class="pr-ex px-2 py-1 rounded-lg bg-amber-950/40 border border-amber-800/50 text-amber-300 text-[11px] font-semibold tap-active" data-name="${PT.esc(n)}">🏅 ${PT.esc(n)}</button>`).join("")}${S.prNames.length > 8 ? `<span class="text-[11px] text-zinc-500 self-center">+${S.prNames.length - 8} more</span>` : ""}</div></div>`;
        }
        html += `<button id="recap-share" class="w-full py-3 rounded-xl text-xs font-bold bg-emerald-600 text-white tap-active">📤 Share ${PT.esc(m0.toLocaleDateString(undefined, { month: "long" }))} recap</button></div>`;
        return html;
      },
      async prepareRecapImage(m0) {
        const S = this.monthStats(m0);
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
        const fit = (text, max, weight, size) => { let s = size; g.font = font(weight, s); while (g.measureText(text).width > max && s > 18) { s -= 2; g.font = font(weight, s); } return s; };
        const box = (x, y, w, h) => { g.fillStyle = "#18181b"; g.strokeStyle = "#27272a"; g.lineWidth = 3; if (g.roundRect) { g.beginPath(); g.roundRect(x, y, w, h, 26); g.fill(); g.stroke(); } else g.fillRect(x, y, w, h); };
        const u = this.wLabel();
        g.textBaseline = "alphabetic";
        g.fillStyle = acc; g.font = font(900, 44); g.fillText("PULSETRACK", 80, 120);
        g.fillStyle = "#a1a1aa"; g.font = font(700, 34); g.fillText("MONTHLY RECAP", 80, 172);
        g.fillStyle = "#ffffff"; fit(m0.toLocaleDateString(undefined, { month: "long", year: "numeric" }), W - 160, 900, 92);
        g.fillText(m0.toLocaleDateString(undefined, { month: "long", year: "numeric" }), 80, 280);
        const hours = S.dur / 3600;
        const stats = [["WORKOUTS", String(S.workouts), "#ffffff"], ["HOURS", PT.num(hours, 1), "#ffffff"], ["PRs", String(S.prCount), "#fbbf24"],
          ["VOLUME", `${Math.round(S.vol).toLocaleString()} ${u}`, acc], ["SETS", String(S.sets), "#ffffff"], ["ACTIVE DAYS", String(S.days), "#ffffff"]];
        stats.forEach(([k, v, col], i) => {
          const wide = k === "VOLUME";
          const x = 80 + (i % 3) * 312, y = 330 + Math.floor(i / 3) * 186;
          box(x, y, 288, 162);
          g.fillStyle = "#71717a"; g.font = font(800, 24); g.fillText(k, x + 30, y + 52);
          g.fillStyle = col; fit(v, 240, 900, wide ? 44 : 64); g.fillText(v, x + 30, y + 126);
        });
        let y = 740;
        if (S.improved) {
          box(80, y, W - 160, 150);
          g.fillStyle = acc; g.font = font(800, 26); g.fillText("MOST IMPROVED", 116, y + 50);
          g.fillStyle = "#ffffff"; fit(S.improved.name, 600, 800, 40); g.fillText(S.improved.name, 116, y + 108);
          g.fillStyle = acc; g.font = font(900, 48); g.textAlign = "right"; g.fillText(`+${PT.num(S.improved.gain * 100, 1)}%`, W - 116, y + 106); g.textAlign = "left";
          y += 214;
        }
        const mus = Object.keys(S.muscles).filter(k => MUSCLE_ORDER.includes(k) && k !== "Other" && k !== "Cardio").sort((a, b) => S.muscles[b] - S.muscles[a]).slice(0, 4);
        if (mus.length) {
          g.fillStyle = "#71717a"; g.font = font(800, 26); g.fillText("TOP MUSCLES", 80, y); y += 24;
          const maxM = Math.max(1, ...mus.map(k => S.muscles[k]));
          mus.forEach(k => {
            y += 52;
            g.fillStyle = "#e4e4e7"; g.font = font(700, 32); g.fillText(k, 80, y);
            const bx = 330, bw = 520, frac = S.muscles[k] / maxM;
            g.fillStyle = "#27272a"; g.fillRect(bx, y - 22, bw, 20);
            g.fillStyle = acc; g.fillRect(bx, y - 22, Math.max(6, bw * frac), 20);
            g.fillStyle = "#a1a1aa"; g.font = font(700, 28); g.textAlign = "right"; g.fillText(`${S.muscles[k]} sets`, W - 80, y); g.textAlign = "left";
          });
          y += 30;
        }
        if (S.cardioMin > 0 && y < H - 140) {
          y += 40;
          g.fillStyle = "#a1a1aa"; g.font = font(700, 30);
          g.fillText(`Cardio: ${PT.num(S.cardioMin, 0)} min${S.cardioDist > 0 ? ` · ${PT.num(S.cardioDist, 1)} ${this.distLabel()}` : ""}`, 80, y);
        }
        g.fillStyle = "#52525b"; g.font = font(600, 26); g.fillText("Tracked with PulseTrack", 80, H - 60);
        const blob = await new Promise((res, rej) => c.toBlob(b => b ? res(b) : rej(new Error("toBlob failed")), "image/png"));
        const key = `${m0.getFullYear()}-${String(m0.getMonth() + 1).padStart(2, "0")}`;
        return new File([blob], `pulsetrack-recap-${key}.png`, { type: "image/png" });
      },
      bindRecapCard(root, m0) {
        const btn = root.querySelector("#recap-share");
        if (!btn) return;
        btn.addEventListener("click", async () => {
          btn.disabled = true;
          try { const f = await this.prepareRecapImage(m0); await this.shareFile(f, "My PulseTrack recap"); }
          catch (err) { this.toast("Could not create the image"); }
          btn.disabled = false;
        });
      },
      recapBanner() {
        const now = new Date();
        if (now.getDate() > 10) return null;
        const p0 = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const key = `${p0.getFullYear()}-${String(p0.getMonth() + 1).padStart(2, "0")}`;
        if (this.settings.recapSeen === key) return null;
        const p1 = new Date(now.getFullYear(), now.getMonth(), 1);
        const n = this.sessions.filter(s => { const t = PT.fromDs(s.date); return t >= p0 && t < p1; }).length;
        if (!n) return null;
        this._recapKey = key;
        this._recapMonth = p0;
        const name = p0.toLocaleDateString(undefined, { month: "long" });
        return { id: "recap", color: "border-emerald-800/60 bg-emerald-950/30", html: `<b class="text-white">Your ${PT.esc(name)} recap is ready 🎉</b> ${n} workout${n === 1 ? "" : "s"}, your PRs and your most improved lift.`, action: "See it" };
      },
      openRecapFromBanner() {
        if (this._recapKey) { this.settings.recapSeen = this._recapKey; WorkoutStorage.saveSettings(this.settings); }
        if (this._recapMonth) this.progressMonth = new Date(this._recapMonth);
        this.showView("progress");
        setTimeout(() => {
          const el = document.getElementById("recap-card");
          if (!el) return;
          const head = document.querySelector("header");
          const off = (head ? head.getBoundingClientRect().height : 80) + 12;
          window.scrollTo({ top: Math.max(0, el.getBoundingClientRect().top + window.scrollY - off), behavior: "smooth" });
        }, 150);
      },

      /* ---------------------------------------------------- progress glue */
      bindProgressV4(root, m0) {
        this.bindMuscleMap(root);
        this.bindStrengthCard(root);
        this.bindRecapCard(root, m0);
      },

      /* ------------------------------------------------- exercise sheet */
      exSheetExtrasHtml(name) {
        let html = `<button id="ex-howto" class="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-zinc-800 text-zinc-200 border border-zinc-700/60 tap-active">
            <svg class="w-4 h-4 text-rose-500" viewBox="0 0 24 24" fill="currentColor"><path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8zM9.7 15.1V8.9l5.8 3.1-5.8 3.1z"/></svg>
            How to do it — form videos</button>`;
        if (PT.isBodyweightEx(name)) {
          html += `<p class="text-[11px] text-zinc-500 bg-zinc-950 border border-zinc-800 rounded-xl p-2.5">Charts and PRs for this exercise include your body weight (from Body &amp; Photos) plus any added weight, or minus assistance.</p>`;
        } else if (PT.dbCount(name) === 2) {
          html += `<p class="text-[11px] text-zinc-500">Weights are per dumbbell. Volume counts both dumbbells.</p>`;
        }
        return html;
      },
      bindExSheetV4(name) {
        const b = document.getElementById("ex-howto");
        if (!b) return;
        b.addEventListener("click", () => {
          if (navigator.onLine === false) { this.toast("Form videos need an internet connection"); return; }
          const a = document.createElement("a");
          a.href = "https://www.youtube.com/results?search_query=" + encodeURIComponent(name + " exercise proper form");
          a.target = "_blank";
          a.rel = "noopener noreferrer";
          document.body.appendChild(a);
          a.click();
          a.remove();
        });
      },

      /* ------------------------------------------- assisted progression */
      suggestionFor(ex) {
        if (this.exKind(ex).cardio) return null;
        if (!PT.isBodyweightEx(ex.name) || this.bwMode(ex.name) !== "assist") return this._suggestionV3.call(this, ex);
        // Assisted: less assistance is progress.
        const range = this.parseRepRange(ex.reps);
        const work = this.lastWorkingSets(ex.name);
        if (!range || !work.length) return null;
        const w = x => parseFloat(x.weight) || 0;
        const least = Math.min(...work.map(w));
        const reps = work.filter(x => w(x) === least).map(x => parseFloat(x.reps) || 0);
        const u = this.wLabel();
        if (reps.every(r => r >= range.hi)) {
          const next = Math.round((least - this.increment()) * 100) / 100;
          return { kind: "up", text: next > 0 ? `▲ Less help: try ${PT.num(next, 2)} ${u} of assistance (you hit ${range.hi}+ reps last time)` : `▲ Try it with no assistance (you hit ${range.hi}+ reps last time)` };
        }
        if (reps.some(r => r < range.lo)) return { kind: "hold", text: `● Stay at ${PT.num(least, 2)} ${u} of assistance and build up to ${range.lo}+ reps` };
        return { kind: "reps", text: `● Same assistance (${PT.num(least, 2)} ${u}) — add a rep or two, aim for ${range.hi}` };
      }
    });
  