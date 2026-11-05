

    /* =====================================================================
     * PulseTrack 2.7 — Cardio & Sports: its own log, kept apart from lifting.
     * Nothing here touches workouts, sets, volume, records, the muscle map or the lifting streak.
     * Data lives under its own key (pulsetrack_cardio_v1), so backups and "erase everything" already cover it.
     * ===================================================================== */
    (function () {
      "use strict";
      const KEY = "pulsetrack_cardio_v1", TKEY = "pulsetrack_cardio_timer_v1";
      const esc = s => PT.esc(s);
      let CUR = null;                       // the app, while it is still being built (window.app is not set until it has started)
      const A = () => window.app || CUR;
      const K = () => PT.kit;
      const M_PER_MI = 1609.344, M_PER_YD = 0.9144;

      /* ------------------------------------------------------------ activities */
      // grp = where it sits in the picker, cat = Cardio or Sport, met = effort of a normal session (calorie estimate),
      // dist = what the distance is measured in (long: miles/km, short: yards/metres), pace = how speed is shown
      const act = (id, name, icon, cat, grp, met, dist, pace) => ({ id, name, icon, cat, grp, met, dist: dist || null, pace: pace || null });
      const BUILTIN = [
        act("run", "Running", "🏃", "cardio", "Cardio", 9.8, "long", "pace"),
        act("trail", "Trail Running", "🌲", "cardio", "Cardio", 9.0, "long", "pace"),
        act("walk", "Walking", "🚶", "cardio", "Cardio", 3.8, "long", "pace"),
        act("hike", "Hiking", "🥾", "cardio", "Cardio", 6.0, "long", "pace"),
        act("bike", "Cycling", "🚴", "cardio", "Cardio", 7.5, "long", "speed"),
        act("mtb", "Mountain Biking", "🚵", "cardio", "Cardio", 8.5, "long", "speed"),
        act("swim", "Swimming", "🏊", "cardio", "Cardio", 7.0, "short", "swim"),
        act("stadium", "Stair Running (stadium or building)", "🏟️", "cardio", "Cardio", 9.0),

        // gym machines
        act("tread", "Treadmill", "🏃", "cardio", "Gym machines", 8.5, "long", "pace"),
        act("incline", "Incline Treadmill Walk", "⛰️", "cardio", "Gym machines", 6.5, "long", "pace"),
        act("stairs", "StairMaster / Stair Climber", "🪜", "cardio", "Gym machines", 9.0),
        act("ellip", "Elliptical", "🌀", "cardio", "Gym machines", 5.0, "long"),
        act("arc", "Arc Trainer / Cross Trainer", "🌀", "cardio", "Gym machines", 6.0, "long"),
        act("spin", "Stationary Bike", "🚲", "cardio", "Gym machines", 7.0, "long", "speed"),
        act("recumbent", "Recumbent Bike", "🚲", "cardio", "Gym machines", 5.5, "long", "speed"),
        act("airbike", "Air Bike (Assault / Echo)", "💨", "cardio", "Gym machines", 8.5, "long", "speed"),
        act("row", "Rowing Machine", "🚣", "cardio", "Gym machines", 7.0, "short", "row"),
        act("skierg", "SkiErg", "⛷️", "cardio", "Gym machines", 7.5, "short", "row"),
        act("versa", "VersaClimber", "🧗", "cardio", "Gym machines", 9.0),
        act("jacobs", "Jacob's Ladder", "🪜", "cardio", "Gym machines", 9.0),
        act("stepper", "Mini Stepper", "👣", "cardio", "Gym machines", 4.5),
        act("ube", "Arm Bike (UBE)", "💪", "cardio", "Gym machines", 4.0, "long"),

        act("hiit", "HIIT", "🔥", "cardio", "Classes & workouts", 8.0),
        act("rope", "Jump Rope", "💫", "cardio", "Classes & workouts", 10.0),
        act("class", "Cardio Class", "🤸", "cardio", "Classes & workouts", 6.5),
        act("spinclass", "Spin Class", "🚴", "cardio", "Classes & workouts", 8.5),
        act("circuit", "Circuit Training", "🔁", "cardio", "Classes & workouts", 8.0),
        act("bootcamp", "Boot Camp", "🪖", "cardio", "Classes & workouts", 8.0),
        act("ropes", "Battle Ropes", "🪢", "cardio", "Classes & workouts", 8.0),
        act("sled", "Sled Push / Pull", "🛷", "cardio", "Classes & workouts", 8.0),
        act("kickbox", "Kickboxing Class", "🥊", "cardio", "Classes & workouts", 7.5),
        act("zumba", "Zumba", "🕺", "cardio", "Classes & workouts", 6.0),
        act("aqua", "Water Aerobics", "🏊", "cardio", "Classes & workouts", 5.3),
        act("dance", "Dance", "💃", "cardio", "Classes & workouts", 5.5),
        act("barre", "Barre", "🩰", "cardio", "Classes & workouts", 3.5),
        act("yoga", "Yoga", "🧘", "cardio", "Classes & workouts", 2.5),
        act("pilates", "Pilates", "🧘", "cardio", "Classes & workouts", 3.0),

        act("basketball", "Basketball", "🏀", "sport", "Team sports", 6.5),
        act("soccer", "Soccer", "⚽", "sport", "Team sports", 7.0),
        act("football", "Football", "🏈", "sport", "Team sports", 8.0),
        act("baseball", "Baseball / Softball", "⚾", "sport", "Team sports", 5.0),
        act("volleyball", "Volleyball", "🏐", "sport", "Team sports", 4.0),
        act("hockey", "Hockey", "🏒", "sport", "Team sports", 8.0),
        act("rugby", "Rugby", "🏉", "sport", "Team sports", 8.3),
        act("lacrosse", "Lacrosse", "🥍", "sport", "Team sports", 8.0),
        act("cricket", "Cricket", "🏏", "sport", "Team sports", 4.8),
        act("ultimate", "Ultimate Frisbee", "🥏", "sport", "Team sports", 8.0),
        act("handball", "Handball", "🤾", "sport", "Team sports", 8.0),
        act("waterpolo", "Water Polo", "🤽", "sport", "Team sports", 10.0),

        act("tennis", "Tennis", "🎾", "sport", "Racquet & court", 7.3),
        act("pickleball", "Pickleball", "🏓", "sport", "Racquet & court", 4.8),
        act("badminton", "Badminton", "🏸", "sport", "Racquet & court", 5.5),
        act("tabletennis", "Table Tennis", "🏓", "sport", "Racquet & court", 4.0),
        act("squash", "Squash", "🎾", "sport", "Racquet & court", 7.3),
        act("racquetball", "Racquetball", "🎾", "sport", "Racquet & court", 7.0),

        act("boxing", "Boxing", "🥊", "sport", "Combat", 7.8),
        act("martial", "Martial Arts / BJJ", "🥋", "sport", "Combat", 10.0),
        act("wrestling", "Wrestling", "🤼", "sport", "Combat", 6.0),
        act("fencing", "Fencing", "🤺", "sport", "Combat", 6.0),

        act("climb", "Rock Climbing", "🧗", "sport", "Outdoor & other", 8.0),
        act("ski", "Skiing", "⛷️", "sport", "Outdoor & other", 6.0),
        act("snowboard", "Snowboarding", "🏂", "sport", "Outdoor & other", 5.3),
        act("iceskate", "Ice Skating", "⛸️", "sport", "Outdoor & other", 5.5),
        act("skateboard", "Skateboarding", "🛹", "sport", "Outdoor & other", 5.0),
        act("surf", "Surfing", "🏄", "sport", "Outdoor & other", 3.0),
        act("kayak", "Kayaking", "🛶", "sport", "Outdoor & other", 5.0, "long", "speed"),
        act("golf", "Golf", "⛳", "sport", "Outdoor & other", 4.3),
        act("bowling", "Bowling", "🎳", "sport", "Outdoor & other", 3.0),
        act("archery", "Archery", "🏹", "sport", "Outdoor & other", 4.3),
        act("gymnastics", "Gymnastics", "🤸", "sport", "Outdoor & other", 3.8),
        act("horse", "Horse Riding", "🏇", "sport", "Outdoor & other", 5.5)
      ];
      // other names people search for ("stairmaster" finds the stair climber)
      const AKA = {
        run: "jog jogging road run", tread: "treadmill run jog jogging", incline: "incline walk treadmill hill 12-3-30 walking pad", walk: "stroll power walk",
        stairs: "stairmaster stair master stepmill step mill gauntlet stair climber stairs step climber", stadium: "stairs stadium steps bleachers",
        ellip: "elliptical trainer cross trainer ellipse", arc: "arc trainer crosstrainer cross trainer elliptical",
        spin: "exercise bike spin bike indoor cycle cycling stationary", recumbent: "recumbent bike seated bike", bike: "biking road bike bicycle cycle", mtb: "mountain bike mtb trail bike",
        airbike: "assault bike echo bike fan bike airdyne air bike", row: "rower erg concept2 indoor rowing ergometer", skierg: "ski erg ski machine concept2",
        versa: "versaclimber vertical climber", jacobs: "jacobs ladder ladder climber", stepper: "step machine mini stepper stair stepper", ube: "arm bike arm ergometer hand bike upper body ergometer",
        spinclass: "spin cycling class soulcycle indoor cycling", circuit: "circuit workout stations", bootcamp: "boot camp bootcamp crossfit", ropes: "battle rope ropes", sled: "sled push sled pull prowler",
        kickbox: "kickboxing cardio kickboxing muay thai", zumba: "zumba dance fitness", aqua: "aqua aerobics water aerobics pool", barre: "ballet barre"
      };
      BUILTIN.forEach(a => { if (AKA[a.id]) a.aka = AKA[a.id]; });
      const GROUPS = ["Cardio", "Gym machines", "Classes & workouts", "Team sports", "Racquet & court", "Combat", "Outdoor & other"];
      const EFFORT = { 1: { label: "Easy", mult: 0.8, dot: "bg-emerald-400", text: "text-emerald-400" }, 2: { label: "Moderate", mult: 1, dot: "bg-amber-400", text: "text-amber-400" }, 3: { label: "Hard", mult: 1.2, dot: "bg-rose-400", text: "text-rose-400" } };
      const CUSTOM_MET = { 1: 3.5, 2: 6, 3: 9 };

      /* ------------------------------------------------------------ data */
      let S = null;
      const valid = l => l && typeof l === "object" && typeof l.date === "string" && l.sec > 0;
      function ensure() {
        if (S) return S;
        const raw = PT.load(KEY, null) || {};
        S = { logs: (Array.isArray(raw.logs) ? raw.logs : []).filter(valid), custom: Array.isArray(raw.custom) ? raw.custom.filter(c => c && c.id && c.name) : [], shoes: Array.isArray(raw.shoes) ? raw.shoes.filter(h => h && h.id && h.name) : [] };
        return S;
      }
      function save() {
        const ok = PT.save(KEY, { v: 1, logs: S.logs, custom: S.custom, shoes: S.shoes });
        if (!ok) A().toast("Could not save. Storage may be full: make a backup in Settings.");
        return ok;
      }
      const allActs = () => BUILTIN.concat(ensure().custom.map(c => ({ id: c.id, name: c.name, icon: c.icon || (c.cat === "sport" ? "🏅" : "💓"), cat: c.cat === "sport" ? "sport" : "cardio", grp: "My activities", met: c.met || 6, dist: c.dist || null, pace: c.pace || null, custom: true })));
      function actOf(id, log) {
        const f = allActs().find(a => a.id === id);
        if (f) return f;
        const cat = log && log.cat === "sport" ? "sport" : "cardio";
        return { id: id || "other", name: (log && log.name) || "Activity", icon: cat === "sport" ? "🏅" : "💓", cat, grp: "", met: 6, dist: log && log.dist ? "long" : null, pace: null, gone: true };
      }
      const sortedLogs = () => ensure().logs.slice().sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : (b.ts || 0) - (a.ts || 0)));
      const cfg = () => { const s = A().settings; if (!s.cardio || typeof s.cardio !== "object") s.cardio = {}; return s.cardio; };
      const saveCfg = () => WorkoutStorage.saveSettings(A().settings);
      const goalMin = () => { const g = parseFloat(cfg().goalMin); return g > 0 ? Math.round(g) : 150; };

      /* ------------------------------------------------------------ units and numbers */
      function distPref() { const u = cfg().unit; return u === "mi" || u === "km" ? u : (A().unit() === "kg" ? "km" : "mi"); }
      const longU = () => (distPref() === "km" ? { l: "km", m: 1000 } : { l: "mi", m: M_PER_MI });
      const shortU = () => (distPref() === "km" ? { l: "m", m: 1 } : { l: "yd", m: M_PER_YD });
      const unitFor = a => (a && a.dist === "short" ? shortU() : longU());
      const pad = n => String(n).padStart(2, "0");
      function clock(sec) {
        sec = Math.max(0, Math.round(sec));
        const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
        return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
      }
      function durText(sec) {
        const m = Math.max(1, Math.round(sec / 60)), h = Math.floor(m / 60);
        return h ? `${h} h ${pad(m % 60)} min` : `${m} min`;
      }
      function totalText(sec) {
        const m = Math.round(sec / 60), h = Math.floor(m / 60);
        return h ? (m % 60 ? `${h}h ${m % 60}m` : `${h}h`) : `${m} min`;
      }
      function distText(meters, a) {
        const u = unitFor(a), v = meters / u.m;
        return `${PT.num(v, a && a.dist === "short" ? 0 : (v >= 100 ? 0 : 2))} ${u.l}`;
      }
      /** { text, val } for the pace or speed of one session, or null when it has no distance. */
      function paceOf(l, a) {
        if (!a || !a.pace || !(l.dist > 0) || !(l.sec > 0)) return null;
        const u = unitFor(a);
        if (a.pace === "pace") { const s = l.sec / (l.dist / u.m); return { text: `${clock(s)} /${u.l}`, val: s, low: true }; }
        if (a.pace === "speed") { const v = (l.dist / u.m) / (l.sec / 3600); return { text: `${PT.num(v, 1)} ${u.l === "mi" ? "mph" : "km/h"}`, val: v, low: false }; }
        if (a.pace === "swim") { const s = l.sec / (l.dist / (u.m * 100)); return { text: `${clock(s)} /100${u.l}`, val: s, low: true }; }
        if (a.pace === "row") { const s = l.sec / (l.dist / 500); return { text: `${clock(s)} /500m`, val: s, low: true }; }
        return null;
      }
      function bwKg() {
        const app = A();
        const e = (app.body || []).filter(x => parseFloat(x.bw) > 0).sort((a, b) => (a.date < b.date ? -1 : 1)).pop();
        if (e) return parseFloat(e.bw) * (app.unit() === "lb" ? KG_PER_LB : 1);
        const m = parseFloat(cfg().bwKg);
        return m > 0 ? m : 0;
      }
      function estKcal(a, int, sec) {
        const kg = bwKg(); if (!kg || !(sec > 0)) return null;
        return Math.round(a.met * (EFFORT[int] || EFFORT[2]).mult * kg * sec / 3600);
      }
      const kcalOf = l => (l.kcal > 0 ? l.kcal : 0);

      /* ------------------------------------------------------------ weeks */
      const wkKey = ds => PT.ds(PT.weekStart(PT.fromDs(ds)));
      function weekStats(startDs) {
        const logs = ensure().logs.filter(l => wkKey(l.date) === startDs);
        const days = new Set(logs.map(l => l.date));
        let sec = 0, longM = 0, kcal = 0;
        logs.forEach(l => { sec += l.sec; kcal += kcalOf(l); const a = actOf(l.act, l); if (a.dist === "long") longM += l.dist || 0; });
        return { n: logs.length, sec, longM, kcal, days };
      }
      function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }

      /* ------------------------------------------------------------ timer */
      const getTimer = () => { const t = PT.load(TKEY, null); return t && t.act && t.began ? t : null; };
      const setTimer = t => { if (t) PT.save(TKEY, t); else { try { PTLS.removeItem(TKEY); } catch (e) { } } ensureTick(); };
      const elapsedSec = t => ((t.acc || 0) + (t.running ? Date.now() - t.start : 0)) / 1000;
      let tickId = null;
      function ensureTick() {
        const t = getTimer();
        if (t && t.running && !tickId) tickId = setInterval(tick, 1000);
        if ((!t || !t.running) && tickId) { clearInterval(tickId); tickId = null; }
      }
      function tick() {
        const t = getTimer(); if (!t) { ensureTick(); return; }
        const txt = clock(elapsedSec(t));
        ["cd-elapsed", "hc-elapsed"].forEach(id => { const e = document.getElementById(id); if (e) e.textContent = txt; });
      }
      async function startTimer() {
        const a = await pickActivity({ title: "What are you doing?", sub: "The timer starts as soon as you pick." });
        if (!a) return;
        const now = Date.now();
        setTimer({ act: a.id, name: a.name, began: now, start: now, acc: 0, running: true });
        refresh();
      }
      function pauseTimer() { const t = getTimer(); if (!t || !t.running) return; t.acc = (t.acc || 0) + (Date.now() - t.start); t.running = false; setTimer(t); refresh(); }
      function resumeTimer() { const t = getTimer(); if (!t || t.running) return; t.start = Date.now(); t.running = true; setTimer(t); refresh(); }
      function finishTimer() {
        const t = getTimer(); if (!t) return;
        const sec = Math.max(1, Math.round(elapsedSec(t)));
        if (t.running) { t.acc = (t.acc || 0) + (Date.now() - t.start); t.running = false; setTimer(t); }
        openLog({ act: t.act, sec, date: PT.ds(new Date(t.began)), ts: t.began, fromTimer: true });
        refresh();
      }
      async function discardTimer() {
        if (!await PT.confirm("Throw away this timer? Nothing will be saved.")) return;
        setTimer(null); refresh();
      }

      /* ------------------------------------------------------------ sheets */
      const sheetEl = (id, z) => K().sheet(id, z);

      /** Pick an activity. Resolves to the activity, or null when closed. */
      function pickActivity(o) {
        o = o || {};
        return new Promise(resolve => {
          const el = sheetEl("pt-cardio-pick", 70);
          const logs = sortedLogs(), recent = [];
          logs.forEach(l => { if (recent.length < 6 && !recent.includes(l.act) && allActs().some(a => a.id === l.act)) recent.push(l.act); });
          const card = K().openSheet(el, `${K().head(o.title || "Pick an activity", o.sub || "")}
            <input id="cp-q" type="search" placeholder="Search, for example stairmaster or tennis" autocomplete="off" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500">
            <div id="cp-list" class="space-y-4"></div>`);
          let done = false;
          const finish = a => { if (done) return; done = true; el.__onClose = null; K().closeSheet(el); resolve(a); };
          const btn = a => `<button type="button" data-a="${esc(a.id)}" class="flex flex-col items-center justify-center gap-1 rounded-xl bg-zinc-950 border border-zinc-800 px-1.5 py-2.5 min-h-[4.25rem] tap-active"><span class="text-xl leading-none">${esc(a.icon)}</span><span class="text-[11px] font-semibold text-zinc-200 leading-tight text-center">${esc(a.name)}</span></button>`;
          const draw = q => {
            q = String(q || "").trim().toLowerCase();
            const words = q.split(/\s+/).filter(Boolean);
            const acts = allActs().filter(a => { const hay = (a.name + " " + a.grp + " " + (a.aka || "") + " " + (a.cat === "sport" ? "sport" : "cardio")).toLowerCase(); return words.every(w => hay.includes(w)); });
            const sec = (title, list) => list.length ? `<div><div class="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1.5">${esc(title)}</div><div class="grid grid-cols-3 gap-2">${list.map(btn).join("")}</div></div>` : "";
            let html = "";
            if (!q && recent.length) html += sec("Recent", recent.map(id => allActs().find(a => a.id === id)).filter(Boolean));
            GROUPS.concat(["My activities"]).forEach(g => { html += sec(g, acts.filter(a => a.grp === g)); });
            if (!acts.length) html = `<p class="text-xs text-zinc-500 text-center py-3">Nothing matches "${esc(q)}". You can add it as your own activity.</p>`;
            html += `<button type="button" data-new class="w-full py-2.5 rounded-xl border-2 border-dashed border-emerald-700/70 text-emerald-400 text-xs font-bold tap-active">＋ Add your own activity</button>`;
            card.querySelector("#cp-list").innerHTML = html;
          };
          draw("");
          card.querySelector("#cp-q").addEventListener("input", e => draw(e.target.value));
          card.addEventListener("click", async e => {
            const b = e.target.closest("[data-a]");
            if (b) { finish(allActs().find(a => a.id === b.dataset.a) || null); return; }
            if (e.target.closest("[data-new]")) {
              const made = await newActivity(card.querySelector("#cp-q").value);
              if (made) finish(made);
            }
          });
          el.__onClose = () => finish(null);
        });
      }

      /** A small form for an activity that is not in the list. */
      function newActivity(prefill) {
        return new Promise(resolve => {
          const el = sheetEl("pt-cardio-new", 80);
          let cat = "sport", eff = 2, dist = false;
          const card = K().openSheet(el, `${K().head("Your own activity", "It joins the list and works like the built-in ones.")}
            <label class="block">${K().lab("Name")}<input id="cn-name" type="text" maxlength="40" autocomplete="off" value="${esc(String(prefill || "").trim())}" placeholder="e.g. Rec league dodgeball" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-3 text-base font-semibold text-white focus:outline-none focus:border-emerald-500"></label>
            <div>${K().lab("Is it cardio or a sport?")}<div class="grid grid-cols-2 gap-2" id="cn-cat"></div></div>
            <div>${K().lab("How hard is it usually?")}<div class="grid grid-cols-3 gap-2" id="cn-eff"></div></div>
            <div>${K().lab("Track distance?")}<div class="grid grid-cols-2 gap-2" id="cn-dist"></div></div>
            <p id="cn-err" class="text-xs text-rose-400 min-h-[1rem]"></p>
            <div class="flex gap-2"><button type="button" data-close class="flex-1 py-3 rounded-xl bg-zinc-800 text-zinc-200 text-sm font-bold tap-active">Cancel</button><button type="button" id="cn-save" class="flex-[2] py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold tap-active">Add activity</button></div>`);
          const chip = (on, label, attr) => `<button type="button" ${attr} class="py-2.5 rounded-xl text-xs font-bold tap-active ${on ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-400"}">${label}</button>`;
          const paint = () => {
            card.querySelector("#cn-cat").innerHTML = chip(cat === "cardio", "Cardio", 'data-cat="cardio"') + chip(cat === "sport", "Sport", 'data-cat="sport"');
            card.querySelector("#cn-eff").innerHTML = [1, 2, 3].map(i => chip(eff === i, EFFORT[i].label, `data-eff="${i}"`)).join("");
            card.querySelector("#cn-dist").innerHTML = chip(!dist, "No", 'data-dist="0"') + chip(dist, `Yes (${longU().l})`, 'data-dist="1"');
          };
          paint();
          card.addEventListener("click", e => {
            const c = e.target.closest("[data-cat]"), f = e.target.closest("[data-eff]"), d = e.target.closest("[data-dist]");
            if (c) { cat = c.dataset.cat; paint(); } else if (f) { eff = +f.dataset.eff; paint(); } else if (d) { dist = d.dataset.dist === "1"; paint(); }
          });
          let done = false;
          card.querySelector("#cn-save").addEventListener("click", () => {
            const name = card.querySelector("#cn-name").value.replace(/\s+/g, " ").trim();
            if (!name) { card.querySelector("#cn-err").textContent = "Give it a name."; return; }
            if (allActs().some(a => a.name.toLowerCase() === name.toLowerCase())) { card.querySelector("#cn-err").textContent = "That activity is already in the list."; return; }
            const c = { id: "c_" + PT.uid(), name, cat, met: CUSTOM_MET[eff], dist: dist ? "long" : null, pace: dist && cat === "cardio" ? "pace" : (dist ? "speed" : null) };
            ensure().custom.push(c); save();
            done = true; el.__onClose = null; K().closeSheet(el);
            resolve(allActs().find(a => a.id === c.id));
          });
          el.__onClose = () => { if (!done) resolve(null); };
        });
      }

      /** The log form. o: { log } to edit, or { act, sec, date, ts, fromTimer } for a new one. */
      function openLog(o) {
        o = o || {};
        const app = A(), edit = o.log || null, st = ensure();
        const lastId = (sortedLogs()[0] || {}).act;
        let a = actOf(edit ? edit.act : (o.act || lastId || "run"), edit);
        let eff = edit ? (edit.int || 2) : 2, res = edit ? (edit.res || "") : "";
        let shoe = edit ? (edit.shoe || "") : defaultShoe();
        const sec0 = edit ? edit.sec : (o.sec || 0);
        const date0 = edit ? edit.date : (o.date || PT.ds());
        const h0 = Math.floor(sec0 / 3600), m0 = Math.floor((sec0 % 3600) / 60), s0 = Math.round(sec0 % 60);
        const el = sheetEl("pt-cardio-log");
        const inp = "w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-lg font-bold font-mono text-white text-center focus:outline-none focus:border-emerald-500";
        const card = K().openSheet(el, `${K().head(edit ? "Edit activity" : (o.fromTimer ? "Save this session" : "Log activity"), o.fromTimer ? "Check the time, then add anything else you want to remember." : "")}
          <button type="button" id="cl-act" class="w-full flex items-center gap-3 rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2.5 text-left tap-active"><span id="cl-icon" class="text-2xl leading-none"></span><span class="min-w-0 flex-1"><span id="cl-name" class="block text-sm font-bold text-white truncate"></span><span id="cl-kind" class="block text-[10px] font-bold uppercase tracking-wider text-zinc-500"></span></span><span class="text-xs font-semibold text-emerald-400">Change</span></button>
          <label class="block">${K().lab("Date")}<input id="cl-date" type="date" max="${PT.ds()}" value="${esc(date0)}" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"></label>
          <div>${K().lab("Time")}<div class="grid grid-cols-3 gap-2">
            <label class="block"><input id="cl-h" type="number" inputmode="numeric" min="0" max="99" placeholder="0" value="${h0 || ""}" class="${inp}"><span class="block text-[10px] text-zinc-500 text-center mt-1">hours</span></label>
            <label class="block"><input id="cl-m" type="number" inputmode="numeric" min="0" max="999" placeholder="0" value="${m0 || ""}" class="${inp}"><span class="block text-[10px] text-zinc-500 text-center mt-1">minutes</span></label>
            <label class="block"><input id="cl-s" type="number" inputmode="numeric" min="0" max="59" placeholder="0" value="${s0 || ""}" class="${inp}"><span class="block text-[10px] text-zinc-500 text-center mt-1">seconds</span></label></div></div>
          <div id="cl-distrow"><label class="block">${K().lab('Distance <span id="cl-du" class="normal-case text-zinc-500"></span>')}<input id="cl-dist" type="number" inputmode="decimal" step="any" min="0" placeholder="0" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-lg font-bold font-mono text-white focus:outline-none focus:border-emerald-500"></label>
            <p id="cl-pace" class="text-xs text-emerald-400 font-semibold mt-1.5 min-h-[1rem]"></p></div>
          <div>${K().lab("How hard was it?")}<div class="grid grid-cols-3 gap-2" id="cl-eff"></div></div>
          <div id="cl-resrow">${K().lab("Result (optional)")}<div class="grid grid-cols-4 gap-2" id="cl-res"></div></div>
          <div id="cl-shoerow" class="hidden">${K().lab("Shoes")}<div class="flex flex-wrap gap-1.5" id="cl-shoes"></div></div>
          <div class="grid grid-cols-2 gap-2">
            <label class="block">${K().lab("Avg heart rate")}<input id="cl-hr" type="number" inputmode="numeric" min="0" max="250" placeholder="bpm" value="${edit && edit.hr ? edit.hr : ""}" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"></label>
            <label class="block">${K().lab("Calories")}<input id="cl-kcal" type="number" inputmode="numeric" min="0" max="20000" placeholder="auto" value="${edit && edit.kcal && !edit.kest ? edit.kcal : ""}" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"></label></div>
          <p id="cl-kest" class="text-[11px] text-zinc-500 -mt-2 min-h-[1rem]"></p>
          <label class="block">${K().lab("Notes")}<textarea id="cl-note" rows="2" maxlength="400" placeholder="Route, who you played with, how it felt…" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500">${esc(edit && edit.note || "")}</textarea></label>
          <p id="cl-err" class="text-xs text-rose-400 min-h-[1rem]"></p>
          <div class="flex gap-2">${edit ? `<button type="button" id="cl-del" class="px-4 py-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-sm font-bold tap-active">Delete</button>` : ""}<button type="button" data-close class="flex-1 py-3 rounded-xl bg-zinc-800 text-zinc-200 text-sm font-bold tap-active">Cancel</button><button type="button" id="cl-save" class="flex-[2] py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold tap-active">${edit ? "Save changes" : "Save"}</button></div>`);
        const $ = s => card.querySelector(s);
        if (edit && edit.dist > 0) $("#cl-dist").value = Math.round(edit.dist / unitFor(a).m * 1000) / 1000;
        const secNow = () => (parseFloat($("#cl-h").value) || 0) * 3600 + (parseFloat($("#cl-m").value) || 0) * 60 + (parseFloat($("#cl-s").value) || 0);
        const chip = (on, label, attr) => `<button type="button" ${attr} class="py-2.5 rounded-xl text-xs font-bold tap-active ${on ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-400"}">${label}</button>`;
        const paintChips = () => {
          $("#cl-eff").innerHTML = [1, 2, 3].map(i => chip(eff === i, EFFORT[i].label, `data-eff="${i}"`)).join("");
          $("#cl-res").innerHTML = [["", "—"], ["W", "Win"], ["L", "Loss"], ["D", "Draw"]].map(([v, t]) => chip(res === v, t, `data-res="${v}"`)).join("");
          $("#cl-shoes").innerHTML = [{ id: "", name: "None" }].concat(shoeChoices(shoe)).map(h => `<button type="button" data-shoe="${esc(h.id)}" class="px-3 py-2 rounded-xl text-xs font-bold tap-active ${shoe === h.id ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-400"}">${esc(h.name)}</button>`).join("");
        };
        const paintAct = () => {
          $("#cl-icon").textContent = a.icon; $("#cl-name").textContent = a.name;
          $("#cl-kind").textContent = a.cat === "sport" ? "Sport" : "Cardio";
          $("#cl-distrow").classList.toggle("hidden", !a.dist);
          $("#cl-resrow").classList.toggle("hidden", a.cat !== "sport");
          $("#cl-shoerow").classList.toggle("hidden", !(shoeAct(a) && shoeChoices(shoe).length));
          $("#cl-du").textContent = a.dist ? "(" + unitFor(a).l + ")" : "";
          preview();
        };
        const preview = () => {
          const sec = secNow(), v = parseFloat($("#cl-dist").value) || 0;
          const p = a.dist && v > 0 && sec > 0 ? paceOf({ sec, dist: v * unitFor(a).m }, a) : null;
          $("#cl-pace").textContent = p ? (a.pace === "speed" ? "Average speed " : "Average pace ") + p.text : "";
          const k = estKcal(a, eff, sec);
          $("#cl-kest").textContent = k ? `Leave calories empty to use an estimate (about ${k} kcal for your body weight).` : (bwKg() ? "" : "Add your body weight in Body & Photos to get a calorie estimate, or type your own number.");
        };
        paintChips(); paintAct();
        ["#cl-h", "#cl-m", "#cl-s", "#cl-dist"].forEach(s => $(s).addEventListener("input", preview));
        card.addEventListener("click", async e => {
          const f = e.target.closest("[data-eff]"), r = e.target.closest("[data-res]"), sh = e.target.closest("[data-shoe]");
          if (sh) { shoe = sh.dataset.shoe; paintChips(); return; }
          if (f) { eff = +f.dataset.eff; paintChips(); preview(); return; }
          if (r) { res = r.dataset.res; paintChips(); return; }
          if (e.target.closest("#cl-act")) {
            const picked = await pickActivity({ title: "Change activity" });
            if (picked) { const oldU = unitFor(a).m, v = parseFloat($("#cl-dist").value); a = picked; if (v > 0 && picked.dist) $("#cl-dist").value = Math.round(v * oldU / unitFor(picked).m * 1000) / 1000; if (!picked.dist) $("#cl-dist").value = ""; if (picked.cat !== "sport") res = ""; paintChips(); paintAct(); }
            return;
          }
          if (e.target.closest("#cl-del")) {
            if (!await PT.confirm(`Delete this ${a.name} session?`)) return;
            const i = st.logs.findIndex(x => x.id === edit.id), gone = st.logs[i];
            if (i >= 0) st.logs.splice(i, 1); save(); K().closeSheet(el); refresh();
            app.toast("Session deleted", "Undo", () => { st.logs.push(gone); save(); refresh(); });
            return;
          }
          if (e.target.closest("#cl-save")) {
            const sec = Math.round(secNow());
            const err = t => { $("#cl-err").textContent = t; };
            if (!(sec > 0)) return err("Enter how long it took.");
            if (sec > 100 * 3600) return err("That is more than 100 hours. Check the time.");
            const date = $("#cl-date").value || PT.ds();
            if (date > PT.ds()) return err("That date is in the future.");
            const v = parseFloat($("#cl-dist").value);
            if (a.dist && v < 0) return err("Distance can't be negative.");
            const kcalTyped = parseFloat($("#cl-kcal").value);
            const log = edit ? edit : { id: PT.uid() };
            log.date = date;
            log.ts = edit ? (edit.date === date ? edit.ts : tsFor(date)) : (o.ts && o.date === date ? o.ts : tsFor(date));
            log.act = a.id; log.name = a.name; log.cat = a.cat; log.sec = sec; log.int = eff;
            if (a.dist && v > 0) log.dist = Math.round(v * unitFor(a).m * 10) / 10; else delete log.dist;
            const hr = parseFloat($("#cl-hr").value); if (hr > 0) log.hr = Math.round(hr); else delete log.hr;
            if (kcalTyped > 0) { log.kcal = Math.round(kcalTyped); delete log.kest; }
            else { const k = estKcal(a, eff, sec); if (k) { log.kcal = k; log.kest = true; } else { delete log.kcal; delete log.kest; } }
            const note = $("#cl-note").value.trim(); if (note) log.note = note; else delete log.note;
            if (a.cat === "sport" && res) log.res = res; else delete log.res;
            if (shoeAct(a) && shoe && ensure().shoes.some(h => h.id === shoe)) log.shoe = shoe; else delete log.shoe;
            if (!edit) st.logs.push(log);
            if (!save()) return;
            if (o.fromTimer) setTimer(null);
            K().closeSheet(el); refresh();
            app.toast(`${edit ? "Updated" : "Logged"}: ${a.name} · ${durText(sec)}`);
          }
        });
      }
      function tsFor(ds) {
        if (ds === PT.ds()) return Date.now();
        const d = PT.fromDs(ds); d.setHours(12, 0, 0, 0); return d.getTime();
      }

      /* ------------------------------------------------------------ the view */
      let filter = "all", shown = 25, bound = false;
      const CARD = "bg-zinc-900 border border-zinc-800 rounded-2xl p-4";
      const dayLabel = ds => {
        const t = PT.ds(), y = PT.ds(addDays(new Date(), -1));
        return ds === t ? "Today" : ds === y ? "Yesterday" : PT.fmtDate(ds, { weekday: "short", month: "short", day: "numeric" });
      };
      function sessionLine(l) {
        const a = actOf(l.act, l), bits = [durText(l.sec)];
        if (l.dist > 0) bits.push(distText(l.dist, a));
        const p = paceOf(l, a); if (p) bits.push(p.text);
        if (l.kcal > 0) bits.push((l.kest ? "≈" : "") + l.kcal + " kcal");
        if (l.hr > 0) bits.push(l.hr + " bpm");
        return bits.join(" · ");
      }
      function weeklyChart(goal) {
        const ws0 = PT.weekStart(new Date()), weeks = [];
        for (let i = 7; i >= 0; i--) { const d = addDays(ws0, -7 * i); weeks.push({ d, st: weekStats(PT.ds(d)), cur: i === 0 }); }
        const max = Math.max(goal * 1.15, ...weeks.map(w => w.st.sec / 60), 30);
        return `<div class="relative"><div class="flex items-end gap-1.5 h-24 relative">
          <div class="absolute left-0 right-0 border-t border-dashed border-zinc-600 pointer-events-none" style="bottom:${Math.min(100, goal / max * 100)}%"></div>
          ${weeks.map(w => { const m = Math.round(w.st.sec / 60); return `<div class="flex-1 min-w-0 h-full flex flex-col items-center justify-end">${m ? `<span class="text-[9px] font-mono text-zinc-400 mb-0.5">${m}</span>` : ""}<div class="w-full rounded-t-md" style="height:${m ? Math.max(3, m / max * 100) : 0}%;background:${w.cur ? PT.accent() : PT.accent(0.4)}"></div></div>`; }).join("")}
        </div><div class="flex gap-1.5 mt-1">${weeks.map(w => `<span class="flex-1 min-w-0 text-center text-[9px] ${w.cur ? "text-white font-bold" : "text-zinc-500"} truncate">${w.cur ? "Now" : (w.d.getMonth() + 1) + "/" + w.d.getDate()}</span>`).join("")}</div></div>
        <p class="text-[10px] text-zinc-500 mt-2">Minutes per week, last 8 weeks. The dashed line is your ${goal} minute goal.</p>`;
      }
      function recordsHtml(logs) {
        const byAct = {};
        logs.forEach(l => { (byAct[l.act] = byAct[l.act] || []).push(l); });
        const rows = Object.keys(byAct).map(id => {
          const ls = byAct[id], a = actOf(id, ls[0]), tot = ls.reduce((s, l) => s + l.sec, 0);
          const out = { a, n: ls.length, tot, dist: ls.reduce((s, l) => s + (l.dist || 0), 0), bits: [] };
          const longest = ls.reduce((m, l) => (l.sec > m.sec ? l : m), ls[0]);
          if (ls.length > 1) out.bits.push("Longest " + durText(longest.sec));
          if (a.dist) {
            const far = ls.reduce((m, l) => ((l.dist || 0) > (m.dist || 0) ? l : m), ls[0]);
            if (far.dist > 0 && ls.length > 1) out.bits.push("Farthest " + distText(far.dist, a));
            const minD = a.pace === "speed" ? 3000 : a.pace === "swim" ? 100 * unitFor(a).m : a.pace === "row" ? 500 : 1000;
            const cand = ls.map(l => ({ l, p: paceOf(l, a) })).filter(x => x.p && x.l.dist >= minD);
            if (cand.length > 1) { const best = cand.reduce((m, x) => (a.pace === "speed" ? (x.p.val > m.p.val ? x : m) : (x.p.val < m.p.val ? x : m)), cand[0]); out.bits.push((a.pace === "speed" ? "Fastest " : "Best pace ") + best.p.text); }
          }
          if (a.cat === "sport") { const w = ls.filter(l => l.res === "W").length, lo = ls.filter(l => l.res === "L").length, d = ls.filter(l => l.res === "D").length; if (w + lo + d) out.bits.push(`Record ${w}-${lo}${d ? "-" + d : ""}`); }
          return out;
        }).sort((x, y) => y.tot - x.tot);
        return rows.map(r => `<div class="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5"><div class="flex items-center justify-between gap-2"><span class="text-xs font-bold text-white truncate">${esc(r.a.icon)} ${esc(r.a.name)}</span><span class="text-[11px] font-mono text-zinc-300 shrink-0">${r.n}× · ${totalText(r.tot)}${r.dist > 0 ? " · " + distText(r.dist, r.a) : ""}</span></div>${r.bits.length ? `<div class="text-[10px] text-zinc-500 mt-1">${esc(r.bits.join(" · "))}</div>` : ""}</div>`).join("");
      }
      /* ------------------------------------------------------------ goals, race records, shoes (2.8.0) */
      const RACES = [{ k: "5k", label: "5K", m: 5000 }, { k: "10k", label: "10K", m: 10000 }];
      const isRun = a => a && (a.id === "run" || a.id === "tread");
      const KINDS = {
        all: { label: "All distance", ok: () => true },
        run: { label: "Running", ok: a => isRun(a) || (a && a.id === "trail") },
        walk: { label: "Walking & hiking", ok: a => a && (a.id === "walk" || a.id === "hike" || a.id === "incline") },
        bike: { label: "Cycling", ok: a => a && (a.id === "bike" || a.id === "spin" || a.id === "mtb" || a.id === "recumbent" || a.id === "airbike") }
      };
      const goalKind = () => (KINDS[cfg().distGoalKind] ? cfg().distGoalKind : "all");
      const shoeAct = a => !!a && a.dist === "long" && a.pace === "pace";
      const monthKey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-`;
      /** metres done in a month (prefix like "2026-10-") for one kind of activity */
      function monthDist(prefix, kind) {
        const k = KINDS[kind] || KINDS.all;
        return ensure().logs.reduce((t, l) => (l.dist > 0 && l.date.startsWith(prefix) && k.ok(actOf(l.act, l)) ? t + l.dist : t), 0);
      }
      function goalInfo() {
        const gm = parseFloat(cfg().distGoalM);
        if (!(gm > 0)) return null;
        const now = new Date(), dim = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate(), day = now.getDate();
        const done = monthDist(monthKey(now), goalKind());
        const expected = gm * day / dim, left = Math.max(0, gm - done);
        return { gm, done, pct: Math.min(100, Math.round(done / gm * 100)), expected, ahead: done - expected, left, perDay: left / Math.max(1, dim - day + 1), daysLeft: dim - day, reached: done >= gm, kind: goalKind() };
      }
      /** The fastest time over each race distance, from runs at about that distance (scaled to exactly that distance). */
      function bestTimes() {
        const out = {};
        RACES.forEach(r => {
          let best = null;
          ensure().logs.forEach(l => {
            if (!(l.dist > 0) || !(l.sec > 0) || !isRun(actOf(l.act, l))) return;
            if (l.dist < r.m * 0.99 || l.dist > r.m * 1.08) return;
            const t = l.sec * r.m / l.dist;
            if (!best || t < best.sec) best = { sec: t, log: l };
          });
          out[r.k] = best;
        });
        return out;
      }
      const shoeM = h => (parseFloat(h.startM) || 0) + ensure().logs.reduce((t, l) => (l.shoe === h.id && l.dist > 0 ? t + l.dist : t), 0);
      const shoeLimit = h => (parseFloat(h.limitM) > 0 ? parseFloat(h.limitM) : (distPref() === "km" ? 650000 : 400 * M_PER_MI));
      const activeShoes = () => ensure().shoes.filter(h => !h.retired);
      /** shoes to pick from in the log form (the one already on the session stays even if retired) */
      function shoeChoices(cur) { return ensure().shoes.filter(h => !h.retired || h.id === cur); }
      function defaultShoe() {
        const act = activeShoes(); if (!act.length) return "";
        const last = sortedLogs().find(l => l.shoe && act.some(h => h.id === l.shoe));
        return last ? last.shoe : (act.length === 1 ? act[0].id : "");
      }
      const lu2 = () => longU();
      async function setGoal() {
        const u = lu2(), cur = cfg().distGoalM > 0 ? PT.num(cfg().distGoalM / u.m, 1) : "";
        const v = await PT.prompt(`Distance goal per month, in ${u.l}`, cur, { type: "text", title: "Monthly distance goal", body: `Type how far you want to go each month, in ${u.l}. Leave it empty to remove the goal.`, ok: "Save" });
        if (v === null) return;
        const n = parseFloat(String(v).replace(",", "."));
        if (!String(v).trim()) { delete cfg().distGoalM; }
        else if (!(n > 0 && n <= 20000)) { await PT.alert(`Type a number of ${u.l}, like 100.`); return; }
        else cfg().distGoalM = Math.round(n * u.m);
        saveCfg(); renderView();
      }
      function editShoe(id) {
        const app = A(), st = ensure(), el = sheetEl("pt-shoe", 70), u = lu2();
        const h = id ? st.shoes.find(x => x.id === id) : null;
        const inp = "w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-base font-mono text-white text-center focus:outline-none focus:border-emerald-500";
        const card = K().openSheet(el, `${K().head(h ? "Edit shoes" : "Add shoes", "Sessions you log with them add up their distance.")}
          <label class="block">${K().lab("Name")}<input id="sh-name" type="text" maxlength="30" placeholder="Pegasus 41, trail pair…" value="${esc(h ? h.name : "")}" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-base text-white focus:outline-none focus:border-emerald-500"></label>
          <div class="grid grid-cols-2 gap-2">
            <label class="block">${K().lab(`Already worn (${u.l})`)}<input id="sh-start" type="number" inputmode="decimal" min="0" step="any" placeholder="0" value="${h && h.startM ? PT.num(h.startM / u.m, 1) : ""}" class="${inp}"></label>
            <label class="block">${K().lab(`Replace at (${u.l})`)}<input id="sh-lim" type="number" inputmode="decimal" min="1" step="any" value="${PT.num((h ? shoeLimit(h) : shoeLimit({})) / u.m, 0)}" class="${inp}"></label></div>
          <p class="text-[11px] text-zinc-500">Most running shoes are good for 300 to 500 miles (500 to 800 km).</p>
          <p id="sh-err" class="text-xs text-rose-400 min-h-[1rem]"></p>
          <div class="grid ${h ? "grid-cols-3" : "grid-cols-1"} gap-2">${h ? `<button type="button" id="sh-ret" class="py-3 rounded-xl bg-zinc-800 text-zinc-200 text-xs font-bold tap-active">${h.retired ? "Use again" : "Retire"}</button><button type="button" id="sh-del" class="py-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs font-bold tap-active">Delete</button>` : ""}<button type="button" id="sh-save" class="py-3 rounded-xl bg-emerald-600 text-white text-sm font-extrabold tap-active">Save</button></div>`);
        const $ = q => card.querySelector(q);
        card.addEventListener("click", async e => {
          if (e.target.closest("#sh-ret")) { h.retired = !h.retired; save(); K().closeSheet(el); renderView(); app.toast(h.retired ? `${h.name} retired` : `${h.name} is back in use`); return; }
          if (e.target.closest("#sh-del")) {
            if (!await PT.confirm(`Delete "${h.name}"? The sessions stay, but they won't be linked to these shoes.`, { title: "Delete shoes?", ok: "Delete" })) return;
            st.shoes = st.shoes.filter(x => x.id !== h.id); st.logs.forEach(l => { if (l.shoe === h.id) delete l.shoe; });
            S.shoes = st.shoes; save(); K().closeSheet(el); renderView(); return;
          }
          if (!e.target.closest("#sh-save")) return;
          const name = $("#sh-name").value.trim(), start = parseFloat($("#sh-start").value) || 0, lim = parseFloat($("#sh-lim").value);
          if (!name) { $("#sh-err").textContent = "Give the shoes a name."; return; }
          if (!(lim > 0)) { $("#sh-err").textContent = "Type when to replace them."; return; }
          if (start < 0) { $("#sh-err").textContent = "Miles already worn can't be negative."; return; }
          const o = h || { id: PT.uid(), retired: false };
          o.name = name; o.startM = Math.round(start * u.m); o.limitM = Math.round(lim * u.m);
          if (!h) st.shoes.push(o);
          save(); K().closeSheet(el); renderView();
        });
      }
      function goalsHtml(all) {
        const u = lu2(), g = goalInfo(), best = bestTimes(), shoes = ensure().shoes;
        const kindChips = Object.keys(KINDS).map(k => `<button data-cd="goal-kind" data-k="${k}" class="px-2.5 py-1 rounded-lg text-[11px] font-bold tap-active ${goalKind() === k ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-400"}">${KINDS[k].label}</button>`).join("");
        const fmt = m => PT.num(m / u.m, m / u.m >= 100 ? 0 : 1);
        let goal;
        if (g) {
          const msg = g.reached ? "Goal reached 🎉" : g.ahead >= 0 ? `Ahead of pace by ${fmt(g.ahead)} ${u.l}` : `${fmt(-g.ahead)} ${u.l} behind pace · about ${PT.num(g.perDay / u.m, 1)} ${u.l} a day to catch up`;
          const now = new Date(), hist = [1, 2, 3].map(i => { const d = new Date(now.getFullYear(), now.getMonth() - i, 1); const m = monthDist(monthKey(d), g.kind); return { name: d.toLocaleDateString(undefined, { month: "short" }), m, hit: m >= g.gm }; }).filter(x => x.m > 0);
          goal = `<div class="space-y-1.5"><div class="flex items-center justify-between text-[11px]"><span class="font-semibold text-zinc-300">${fmt(g.done)} of ${fmt(g.gm)} ${u.l} in ${esc(now.toLocaleDateString(undefined, { month: "long" }))}</span><span class="${g.reached ? "text-emerald-400 font-bold" : "text-zinc-500"}">${g.pct}%</span></div>
            <div class="h-2 rounded-full bg-zinc-800 overflow-hidden"><div class="h-full rounded-full" style="width:${g.pct}%;background:${PT.accent()}"></div></div>
            <p class="text-[11px] ${g.reached || g.ahead >= 0 ? "text-emerald-400" : "text-amber-300"}">${esc(msg)}${g.reached ? "" : ` · ${g.daysLeft} day${g.daysLeft === 1 ? "" : "s"} left`}</p>
            ${hist.length ? `<p class="text-[10px] text-zinc-500">${hist.map(x => `${esc(x.name)} ${fmt(x.m)} ${u.l}${x.hit ? " ✓" : ""}`).join(" · ")}</p>` : ""}</div>`;
        } else goal = `<p class="text-xs text-zinc-400">Pick a distance for each month, like 100 ${u.l}, and watch your progress here.</p>`;
        const raceRow = r => {
          const b = best[r.k];
          if (!b) return `<div class="flex items-center justify-between rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2.5"><span class="text-xs font-bold text-white">Best ${r.label}</span><span class="text-[11px] text-zinc-500">Run ${r.label} or a bit more</span></div>`;
          const a = actOf(b.log.act, b.log), p = b.sec / (r.m / u.m);
          return `<button data-cd="open" data-id="${esc(b.log.id)}" class="w-full flex items-center justify-between gap-2 rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2.5 text-left tap-active"><span class="text-xs font-bold text-white">🏅 Best ${r.label}</span><span class="text-right min-w-0"><span class="block text-sm font-black font-mono text-emerald-400">${clock(b.sec)}</span><span class="block text-[10px] text-zinc-500">${clock(p)} /${u.l} · ${esc(PT.fmtDate(b.log.date, { month: "short", day: "numeric", year: "numeric" }))}</span></span></button>`;
        };
        const shoeRow = h => {
          const m = shoeM(h), lim = shoeLimit(h), pct = Math.min(100, Math.round(m / lim * 100)), worn = m >= lim * 0.9;
          const n = ensure().logs.filter(l => l.shoe === h.id).length;
          return `<button data-cd="shoe-edit" data-id="${esc(h.id)}" class="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2.5 text-left tap-active ${h.retired ? "opacity-60" : ""}"><span class="flex items-center justify-between gap-2"><span class="text-xs font-bold text-white truncate">👟 ${esc(h.name)}${h.retired ? " · retired" : ""}</span><span class="text-[11px] font-mono text-zinc-300 shrink-0">${fmt(m)} / ${fmt(lim)} ${u.l}</span></span>
            <span class="block h-1.5 rounded-full bg-zinc-800 overflow-hidden mt-1.5"><span class="block h-full rounded-full ${worn ? "bg-amber-400" : "bg-emerald-500"}" style="width:${pct}%"></span></span>
            <span class="block text-[10px] ${worn && !h.retired ? "text-amber-300" : "text-zinc-500"} mt-1">${worn && !h.retired ? "Getting worn out. Time to look at a new pair." : `${n} session${n === 1 ? "" : "s"}`}</span></button>`;
        };
        const open = g ? `${g.pct}% of goal` : (shoes.length ? `${shoes.length} shoe${shoes.length === 1 ? "" : "s"}` : "Set a goal");
        return `<details data-k="goals" class="rounded-2xl border border-zinc-800 bg-zinc-900"><summary class="px-4 py-3.5 min-h-[3rem] flex items-center gap-2 cursor-pointer"><span class="flex-1 text-xs font-bold text-white">Goals, records &amp; shoes</span><span class="pt-sum">${esc(open)}</span><span class="pt-chev" aria-hidden="true">›</span></summary>
          <div class="px-4 pb-4 space-y-4">
            <div class="space-y-2"><div class="flex items-center justify-between gap-2"><span class="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Monthly distance goal</span><button data-cd="goal-set" class="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-100 text-[11px] font-bold tap-active">${g ? "Change" : "Set a goal"}</button></div>
              ${goal}${g || cfg().distGoalM ? `<div class="flex flex-wrap gap-1.5 pt-0.5">${kindChips}</div>` : ""}</div>
            <div class="space-y-2"><span class="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Race times</span>${RACES.map(raceRow).join("")}
              <p class="text-[10px] text-zinc-500">Counts Running and Treadmill sessions of 5 to 5.4 km (10 to 10.8 km for the 10K). The time is scaled to the exact distance.</p></div>
            <div class="space-y-2"><div class="flex items-center justify-between gap-2"><span class="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Shoe mileage</span><button data-cd="shoe-add" class="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-100 text-[11px] font-bold tap-active">＋ Add shoes</button></div>
              ${shoes.length ? shoes.slice().sort((x, y) => (x.retired ? 1 : 0) - (y.retired ? 1 : 0)).map(shoeRow).join("") : `<p class="text-xs text-zinc-400">Add your running shoes and choose them when you log a run, walk or hike. You'll see when they're getting worn out.</p>`}</div>
          </div></details>`;
      }

      function renderView() {
        const app = A(), root = document.getElementById("cardio-root"); if (!root) return;
        const wasOpen = new Set([...root.querySelectorAll("details[data-k]")].filter(d => d.open).map(d => d.dataset.k));   // keep sections open while the screen redraws
        const st = ensure(), goal = goalMin(), all = sortedLogs();
        const lu = longU(), t = getTimer();
        const ws0 = PT.weekStart(new Date()), wk = weekStats(PT.ds(ws0)), last = weekStats(PT.ds(addDays(ws0, -7)));
        const pct = Math.min(100, Math.round(wk.sec / 60 / goal * 100)), mins = Math.round(wk.sec / 60);
        const counts = { all: all.length, cardio: all.filter(l => actOf(l.act, l).cat !== "sport").length, sport: all.filter(l => actOf(l.act, l).cat === "sport").length };
        const list = all.filter(l => filter === "all" || (filter === "sport") === (actOf(l.act, l).cat === "sport"));
        const dots = [0, 1, 2, 3, 4, 5, 6].map(i => { const d = addDays(ws0, i), ds = PT.ds(d), on = wk.days.has(ds); return `<div class="flex-1 text-center"><div class="mx-auto w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${on ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-500"} ${ds === PT.ds() ? "ring-2 ring-emerald-500/60" : ""}">${on ? "✓" : d.getDate()}</div><div class="text-[9px] text-zinc-500 mt-1">${d.toLocaleDateString(undefined, { weekday: "narrow" })}</div></div>`; }).join("");

        // timer / start
        let top;
        if (t) {
          const a = actOf(t.act, { name: t.name }), long = elapsedSec(t) > 6 * 3600;
          top = `<div class="${CARD} space-y-3 border-emerald-700/50">
            <div class="flex items-center justify-between"><span class="text-xs font-bold text-white">${esc(a.icon)} ${esc(t.name || a.name)}</span><span class="text-[10px] font-bold uppercase tracking-wider ${t.running ? "text-emerald-400" : "text-amber-400"}">${t.running ? "● Running" : "Paused"}</span></div>
            <div id="cd-elapsed" class="text-5xl font-black font-mono text-center text-white tracking-tight">${clock(elapsedSec(t))}</div>
            ${long ? `<p class="text-[11px] text-amber-400 text-center">This timer has been going a long time. If you forgot to stop it, fix the time when you save.</p>` : ""}
            <div class="grid grid-cols-3 gap-2"><button data-cd="${t.running ? "pause" : "resume"}" class="py-3 rounded-xl bg-zinc-800 text-zinc-100 text-xs font-bold tap-active">${t.running ? "Pause" : "Resume"}</button><button data-cd="finish" class="py-3 rounded-xl bg-emerald-600 text-white text-xs font-bold tap-active">Finish</button><button data-cd="discard" class="py-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs font-bold tap-active">Discard</button></div></div>`;
        } else {
          top = `<div class="${CARD} space-y-3"><div class="grid grid-cols-2 gap-2"><button data-cd="start" class="py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-extrabold tap-active">▶ Start timer</button><button data-cd="log" class="py-3.5 rounded-xl bg-zinc-800 text-zinc-100 text-sm font-bold tap-active">＋ Log one</button></div>
            <p class="text-[11px] text-zinc-500">Time it live, or log a session you already did. Runs, rides, swims and every sport are kept here, apart from your lifting.</p></div>`;
        }

        const empty = !all.length ? `<div class="${CARD} text-center space-y-1"><div class="text-3xl">🏃 🏀 🏊</div><p class="text-sm font-bold text-white">Nothing logged yet</p><p class="text-xs text-zinc-400">Log a run, a game, a swim or a class. It does not change your sets, volume, records or muscle map.</p></div>` : "";

        // history
        let hist = "";
        if (all.length) {
          const groups = []; list.slice(0, shown).forEach(l => { const g = groups[groups.length - 1]; if (g && g.date === l.date) g.items.push(l); else groups.push({ date: l.date, items: [l] }); });
          hist = `<div class="${CARD} space-y-3"><div class="flex items-center justify-between gap-2"><h3 class="text-xs font-bold text-white">History</h3><div class="flex gap-1.5">${[["all", "All"], ["cardio", "Cardio"], ["sport", "Sports"]].map(([k, n]) => `<button data-cd="filter" data-k="${k}" class="px-2.5 py-1 rounded-lg text-[11px] font-bold tap-active ${filter === k ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-400"}">${n} <span class="opacity-70">${counts[k]}</span></button>`).join("")}</div></div>
            ${list.length ? groups.map(g => `<div class="space-y-1.5"><div class="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-500"><span>${esc(dayLabel(g.date))}</span><span>${totalText(g.items.reduce((s, l) => s + l.sec, 0))}</span></div>
              ${g.items.map(l => { const a = actOf(l.act, l), e = EFFORT[l.int] || EFFORT[2]; return `<button data-cd="open" data-id="${esc(l.id)}" class="w-full flex items-center gap-3 rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2.5 text-left tap-active min-h-[3.25rem]"><span class="text-xl leading-none shrink-0">${esc(a.icon)}</span><span class="min-w-0 flex-1"><span class="flex items-center gap-1.5"><span class="text-sm font-bold text-white truncate">${esc(a.name)}</span>${l.res ? `<span class="shrink-0 text-[9px] font-black rounded px-1.5 py-0.5 ${l.res === "W" ? "bg-emerald-950 text-emerald-400" : l.res === "L" ? "bg-rose-950 text-rose-300" : "bg-zinc-800 text-zinc-300"}">${l.res === "W" ? "WIN" : l.res === "L" ? "LOSS" : "DRAW"}</span>` : ""}</span><span class="block text-[11px] text-zinc-400 mt-0.5">${esc(sessionLine(l))}</span>${l.note ? `<span class="block text-[10px] text-zinc-500 mt-0.5 truncate">${esc(l.note)}</span>` : ""}</span><span class="shrink-0 w-2 h-2 rounded-full ${e.dot}" title="${e.label}"></span></button>`; }).join("")}</div>`).join("")
              : `<p class="text-xs text-zinc-500 text-center py-2">Nothing in this filter yet.</p>`}
            ${list.length > shown ? `<button data-cd="more" class="w-full py-2.5 rounded-xl bg-zinc-800 text-zinc-200 text-xs font-bold tap-active">Show more (${list.length - shown} older)</button>` : ""}</div>`;
        }

        const bwk = bwKg(), manualBw = !(app.body || []).some(x => parseFloat(x.bw) > 0);
        const unitChip = (v, label) => `<button data-cd="unit" data-k="${v}" class="flex-1 py-2 rounded-lg text-[11px] font-bold tap-active ${(cfg().unit || "auto") === v ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-400"}">${label}</button>`;
        const settings = `<details data-k="settings" class="rounded-2xl border border-zinc-800 bg-zinc-900"><summary class="px-4 py-3.5 min-h-[3rem] flex items-center gap-2 cursor-pointer"><span class="flex-1 text-xs font-bold text-white">Cardio settings</span><span class="pt-sum">Goal ${goal} min</span><span class="pt-chev" aria-hidden="true">›</span></summary>
          <div class="px-4 pb-4 space-y-4">
            <label class="block"><span class="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Weekly goal (minutes)</span><input id="cd-goal" type="number" inputmode="numeric" min="10" max="2000" value="${goal}" class="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"><span class="block text-[10px] text-zinc-500 mt-1">Health guidelines suggest about 150 minutes of moderate activity a week.</span></label>
            <div><span class="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Distance units</span><div class="flex gap-1.5 mt-1">${unitChip("auto", "Follow lb / kg")}${unitChip("mi", "Miles")}${unitChip("km", "Kilometres")}</div></div>
            <div><span class="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Body weight for calorie estimates</span>
              ${manualBw ? `<input id="cd-bw" type="number" inputmode="decimal" step="0.1" min="0" placeholder="${app.wLabel()}" value="${cfg().bwKg ? PT.num(cfg().bwKg * (app.unit() === "lb" ? 1 / KG_PER_LB : 1), 1) : ""}" class="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"><span class="block text-[10px] text-zinc-500 mt-1">Or log your weight in Body &amp; Photos and it is used automatically.</span>`
                : `<p class="text-xs text-zinc-300 mt-1">Using your latest Body &amp; Photos entry: <b class="font-mono text-white">${PT.num(bwk * (app.unit() === "lb" ? 1 / KG_PER_LB : 1), 1)} ${app.wLabel()}</b></p>`}
              <span class="block text-[10px] text-zinc-500 mt-1">Calories are an estimate from the activity, how hard it was, your weight and the time. A watch or machine will be more exact, so you can always type your own number.</span></div>
            ${st.custom.length ? `<div><span class="text-[10px] font-bold uppercase tracking-wider text-zinc-500">My activities</span><div class="space-y-1.5 mt-1">${st.custom.map(c => `<div class="flex items-center justify-between gap-2 rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2"><span class="text-xs font-semibold text-white truncate">${esc(c.icon || (c.cat === "sport" ? "🏅" : "💓"))} ${esc(c.name)}</span><button data-cd="delcustom" data-id="${esc(c.id)}" class="text-[11px] font-bold text-rose-300 px-2 py-1 tap-active">Remove</button></div>`).join("")}</div><span class="block text-[10px] text-zinc-500 mt-1">Removing one keeps the sessions you already logged.</span></div>` : ""}
            <button data-cd="csv" class="w-full py-2.5 rounded-xl bg-zinc-800 text-zinc-200 text-xs font-bold tap-active">Export cardio &amp; sports as CSV</button>
          </div></details>`;

        root.innerHTML = `${top}
          <div class="${CARD} space-y-3">
            <div class="flex items-center justify-between"><h3 class="text-xs font-bold text-white">This week</h3><span class="text-[10px] text-zinc-500">${esc(ws0.toLocaleDateString(undefined, { month: "short", day: "numeric" }))} – now</span></div>
            <div class="grid grid-cols-4 gap-2 text-center">
              ${[["Sessions", wk.n], ["Time", wk.sec ? totalText(wk.sec) : "0"], ["Distance", wk.longM ? PT.num(wk.longM / lu.m, 1) + " " + lu.l : "—"], ["Calories", wk.kcal ? PT.num(wk.kcal, 0) : "—"]].map(([n, v]) => `<div class="bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-1 min-w-0"><span class="block text-[9px] text-zinc-500 uppercase font-bold tracking-wider">${n}</span><span class="block font-mono font-bold text-white text-[13px] mt-0.5 truncate">${v}</span></div>`).join("")}
            </div>
            <div><div class="flex items-center justify-between text-[11px] mb-1"><span class="font-semibold text-zinc-300">${mins} of ${goal} min</span><span class="${pct >= 100 ? "text-emerald-400 font-bold" : "text-zinc-500"}">${pct >= 100 ? "Goal reached 🎉" : (goal - mins) + " to go"}</span></div>
              <div class="h-2 rounded-full bg-zinc-800 overflow-hidden"><div class="h-full rounded-full" style="width:${pct}%;background:${PT.accent()}"></div></div>
              ${last.sec ? `<p class="text-[10px] text-zinc-500 mt-1.5">Last week: ${totalText(last.sec)} in ${last.n} session${last.n === 1 ? "" : "s"}</p>` : ""}</div>
            <div class="flex gap-1">${dots}</div>
          </div>
          ${empty}
          ${all.length ? `<div class="${CARD} space-y-2"><h3 class="text-xs font-bold text-white">Weekly time</h3>${weeklyChart(goal)}</div>` : ""}
          ${hist}
          ${goalsHtml(all)}
          ${all.length ? `<details data-k="records" class="rounded-2xl border border-zinc-800 bg-zinc-900"><summary class="px-4 py-3.5 min-h-[3rem] flex items-center gap-2 cursor-pointer"><span class="flex-1 text-xs font-bold text-white">Totals &amp; records</span><span class="pt-sum">${all.length} session${all.length === 1 ? "" : "s"} · ${totalText(all.reduce((s, l) => s + l.sec, 0))}</span><span class="pt-chev" aria-hidden="true">›</span></summary><div class="px-4 pb-4 space-y-2">${recordsHtml(all)}</div></details>` : ""}
          ${settings}
          <p class="text-[10px] text-zinc-500 text-center px-4 pb-2">Cardio &amp; Sports is separate from your lifting. It does not count toward your sets, volume, records, muscle map or lifting streak, and it is included in your backup.</p>`;
        root.querySelectorAll("details[data-k]").forEach(d => { if (wasOpen.has(d.dataset.k)) d.open = true; });
        bind();
      }

      function bind() {
        if (bound) return;
        const root = document.getElementById("cardio-root"); if (!root) return;
        bound = true;
        root.addEventListener("click", ev => handle(ev.target.closest("[data-cd]")));
        root.addEventListener("change", ev => {
          if (ev.target.id === "cd-goal") { const v = Math.round(parseFloat(ev.target.value)); if (v >= 10 && v <= 2000) { cfg().goalMin = v; saveCfg(); } renderView(); renderHome(); }
          if (ev.target.id === "cd-bw") { const v = parseFloat(ev.target.value); cfg().bwKg = v > 0 ? v * (A().unit() === "lb" ? KG_PER_LB : 1) : 0; saveCfg(); }
        });
        const home = document.getElementById("home-cardio");
        if (home) home.addEventListener("click", ev => handle(ev.target.closest("[data-cd]")));
      }
      async function handle(b) {
        if (!b) return;
        const k = b.dataset.cd, app = A();
        if (k === "start") startTimer();
        else if (k === "log") openLog({});
        else if (k === "pause") pauseTimer();
        else if (k === "resume") resumeTimer();
        else if (k === "finish") finishTimer();
        else if (k === "discard") discardTimer();
        else if (k === "filter") { filter = b.dataset.k; shown = 25; renderView(); }
        else if (k === "more") { shown += 25; renderView(); }
        else if (k === "open") { const l = ensure().logs.find(x => x.id === b.dataset.id); if (l) openLog({ log: l }); }
        else if (k === "unit") { cfg().unit = b.dataset.k === "auto" ? "" : b.dataset.k; saveCfg(); renderView(); renderHome(); }
        else if (k === "delcustom") {
          const c = ensure().custom.find(x => x.id === b.dataset.id);
          if (c && await PT.confirm(`Remove "${c.name}" from your activities? Sessions you logged with it stay.`)) { S.custom = S.custom.filter(x => x.id !== c.id); save(); renderView(); }
        }
        else if (k === "goal-set") await setGoal();
        else if (k === "goal-kind") { cfg().distGoalKind = b.dataset.k; saveCfg(); renderView(); }
        else if (k === "shoe-add") editShoe(null);
        else if (k === "shoe-edit") editShoe(b.dataset.id);
        else if (k === "csv") exportCsv();
        else if (k === "open-view") app.showView("cardio");
      }

      /* ------------------------------------------------------------ Home: a tile, and a strip while a timer runs */
      function ensureTile() {
        if (document.getElementById("tile-cardio")) return;
        const first = document.getElementById("btn-home-view-programs"), myex = document.getElementById("tile-myex");
        if (!first || !myex) return;            // the other shortcut tiles are added first, this one goes after them
        const b = document.createElement("button");
        b.id = "tile-cardio";
        b.className = "bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-2xl p-3 text-left tap-active transition flex flex-col gap-2";
        b.innerHTML = '<span class="w-8 h-8 rounded-lg bg-sky-950 border border-sky-800/60 flex items-center justify-center">🏃</span><span class="text-xs font-bold text-white leading-tight">Cardio &amp; Sports</span>';
        b.addEventListener("click", () => A().showView("cardio"));
        myex.insertAdjacentElement("afterend", b);
      }
      function renderHome() {
        ensureTile();
        const box = document.getElementById("home-cardio"); if (!box) return;
        bind();
        const t = getTimer();
        if (!t) { box.classList.add("hidden"); box.innerHTML = ""; return; }
        const a = actOf(t.act, { name: t.name });
        box.classList.remove("hidden");
        box.innerHTML = `<div class="border border-emerald-700/50 bg-emerald-950/30 rounded-xl px-3 py-2.5 flex items-center gap-3"><span class="text-lg leading-none shrink-0">${esc(a.icon)}</span><span class="min-w-0 flex-1 text-xs text-zinc-300 truncate"><b class="text-white">${esc(t.name || a.name)}</b> <span id="hc-elapsed" class="font-mono text-emerald-400">${clock(elapsedSec(t))}</span> <span class="text-zinc-500">· ${t.running ? "running" : "paused"}</span></span><button data-cd="open-view" class="shrink-0 px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg tap-active">Open</button></div>`;
      }
      function refresh() {
        renderHome();
        const v = document.getElementById("view-cardio");
        if (v && !v.classList.contains("hidden")) renderView();
        ensureTick();
      }

      /* ------------------------------------------------------------ CSV */
      async function exportCsv() {
        const app = A(), logs = sortedLogs().reverse();
        if (!logs.length) { await PT.alert("No cardio or sports sessions to export yet."); return; }
        const head = ["Date", "Activity", "Type", "Duration (min)", "Distance", "Distance unit", "Pace or speed", "Effort", "Avg heart rate", "Calories", "Calories estimated", "Result", "Notes"];
        const rows = [head.join(",")];
        logs.forEach(l => {
          const a = actOf(l.act, l), p = paceOf(l, a);
          rows.push([l.date, l.name || a.name, a.cat === "sport" ? "Sport" : "Cardio", Math.round(l.sec / 6) / 10, l.dist > 0 ? Math.round(l.dist / unitFor(a).m * 100) / 100 : "", l.dist > 0 ? unitFor(a).l : "", p ? p.text : "",
            (EFFORT[l.int] || EFFORT[2]).label, l.hr || "", l.kcal || "", l.kcal ? (l.kest ? "yes" : "no") : "", l.res === "W" ? "Win" : l.res === "L" ? "Loss" : l.res === "D" ? "Draw" : "", l.note || ""].map(PT.csvCell).join(","));
        });
        app.shareFile(new File(["\uFEFF" + rows.join("\r\n")], `pulsetrack-cardio-${PT.ds()}.csv`, { type: "text/csv" }), "PulseTrack cardio CSV");
      }

      /* ------------------------------------------------------------ wiring */
      const css = document.createElement("style");
      css.id = "pt-v27-css";
      css.textContent = `
        html #view-home .grid.grid-cols-3 { grid-template-columns: repeat(6, minmax(0, 1fr)); }
        html #view-home .grid.grid-cols-3 > button { grid-column: span 2; }
        html #view-home .grid.grid-cols-3 > #tile-rm, html #view-home .grid.grid-cols-3 > #tile-plates, html #view-home .grid.grid-cols-3 > #tile-myex, html #view-home .grid.grid-cols-3 > #tile-cardio { grid-column: span 3; flex-direction: row; align-items: center; padding: .55rem .75rem; gap: .6rem; }
        html #view-home .grid.grid-cols-3 > #tile-rm > span:first-child, html #view-home .grid.grid-cols-3 > #tile-plates > span:first-child, html #view-home .grid.grid-cols-3 > #tile-myex > span:first-child, html #view-home .grid.grid-cols-3 > #tile-cardio > span:first-child { width: 1.6rem; height: 1.6rem; font-size: .85rem; border-radius: .5rem; flex: none; }
        html #view-home .grid.grid-cols-3 > #tile-rm > span:last-child, html #view-home .grid.grid-cols-3 > #tile-plates > span:last-child, html #view-home .grid.grid-cols-3 > #tile-myex > span:last-child, html #view-home .grid.grid-cols-3 > #tile-cardio > span:last-child { font-size: .72rem; line-height: 1.2; }`;
      document.body.appendChild(css);
      const proto = ApplicationUI.prototype;
      proto.renderCardioView = function () { CUR = this; renderView(); ensureTick(); };
      proto.openCardioLog = function (o) { openLog(o || {}); };
      const origInitX = proto.initExtras;
      if (origInitX) proto.initExtras = function () { CUR = this; const r = origInitX.apply(this, arguments); try { ensureTile(); renderHome(); ensureTick(); } catch (e) { console.error("PulseTrack cardio tile", e); } return r; };
      const origHome = proto.renderHomeView;
      proto.renderHomeView = function () { CUR = this; const r = origHome.apply(this, arguments); try { renderHome(); ensureTick(); } catch (e) { console.error("PulseTrack cardio card", e); } return r; };
      PT.cardio = { data: () => ensure(), actOf, paceOf, estKcal, weekStats, openLog, startTimer, getTimer, BUILTIN, bestTimes, monthDist, shoeM, goal: () => goalInfo() };
    })();
  