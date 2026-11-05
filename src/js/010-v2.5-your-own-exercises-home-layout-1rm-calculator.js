
    /* =====================================================================
     * PulseTrack 2.5 — your own exercises, home layout, 1RM calculator
     * (themes, light mode, row size and corners live in the module above)
     * ===================================================================== */
    (function () {
      "use strict";
      const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
      const lower = n => String(n || "").trim().toLowerCase();
      const X_ICON = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>';
      const A = () => window.app;

      /* ---------------------------------------------------------------- sheets */
      const made = [];
      function sheet(id, z) {
        let el = document.getElementById(id);
        if (!el) {
          el = document.createElement("div");
          el.id = id;
          if (z) el.style.zIndex = z;
          el.className = "fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center hidden p-0 sm:p-4";
          el.innerHTML = '<div data-card class="pt-sheet-in bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5 space-y-4 max-h-[92vh] overflow-y-auto hide-scrollbar" style="padding-bottom:calc(1.25rem + env(safe-area-inset-bottom,0px))"></div>';
          document.body.appendChild(el); made.push(el);
          el.addEventListener("click", e => { if (e.target === el || e.target.closest("[data-close]")) closeSheet(el); });
        }
        return el;
      }
      function openSheet(el, html) {
        // A fresh card every time, so old click handlers never pile up
        const old = el.querySelector("[data-card]"), card = old.cloneNode(false);
        card.innerHTML = html; old.replaceWith(card);
        el.classList.remove("hidden");
        el.__onClose = null;
        return card;
      }
      function closeSheet(el) { el.classList.add("hidden"); const f = el.__onClose; el.__onClose = null; if (f) f(); }
      document.addEventListener("keydown", e => {
        if (e.key !== "Escape") return;
        const dlg = document.getElementById("pt-dlg"); if (dlg && !dlg.classList.contains("hidden")) return;
        // close only the top-most sheet (the form sits above the list)
        const open = made.filter(el => el.isConnected && !el.classList.contains("hidden")).sort((a, b) => (parseInt(b.style.zIndex, 10) || 60) - (parseInt(a.style.zIndex, 10) || 60));
        if (open.length) closeSheet(open[0]);
      });
      const head = (title, sub) => `<div class="flex items-start justify-between gap-3"><div class="min-w-0"><h3 class="text-base font-bold text-white">${esc(title)}</h3>${sub ? `<p class="text-xs text-zinc-400 mt-0.5">${esc(sub)}</p>` : ""}</div><button type="button" data-close class="p-1.5 text-zinc-400 hover:text-white tap-active shrink-0" aria-label="Close">${X_ICON}</button></div>`;
      const lab = t => `<span class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">${t}</span>`;

      /* ============================================================ my exercises */
      const MUSCLES = [
        { id: "chest", label: "Chest", cat: "Chest" }, { id: "shoulders", label: "Shoulders", cat: "Shoulders" },
        { id: "biceps", label: "Biceps", cat: "Biceps" }, { id: "triceps", label: "Triceps", cat: "Triceps" },
        { id: "forearms", label: "Forearms", cat: "Forearms" }, { id: "abs", label: "Abs & core", cat: "Core" },
        { id: "back", label: "Lats & upper back", cat: "Back" }, { id: "lowerback", label: "Lower back", cat: "Back" },
        { id: "traps", label: "Traps", cat: "Traps" }, { id: "glutes", label: "Glutes", cat: "Legs" },
        { id: "quads", label: "Quads", cat: "Legs" }, { id: "hamstrings", label: "Hamstrings", cat: "Legs" },
        { id: "calves", label: "Calves", cat: "Legs" }, { id: "cardio", label: "Cardio / full body", cat: "Cardio" }
      ];
      const KINDS = [
        { id: "w", label: "Weight × reps", desc: "Barbell, machine or cable. You type the weight you load." },
        { id: "d", label: "Dumbbells", desc: "You type the weight of one dumbbell. Volume counts both hands." },
        { id: "b", label: "Bodyweight ± weight", desc: "Pull-ups, dips. Your body weight counts, then add or assist." },
        { id: "c", label: "Cardio with distance", desc: "Log minutes and distance (run, bike, row)." },
        { id: "t", label: "Timed, no distance", desc: "Log minutes only (jump rope, stairs, plank holds)." }
      ];
      const muscleOf = id => MUSCLES.find(m => m.id === id) || MUSCLES[0];
      const kindOf = id => KINDS.find(k => k.id === id) || KINDS[0];
      const CX = new Map();   // lower-case name -> { name, m (muscle id), k (kind id) }

      function syncDb() {
        if (typeof EXERCISE_DATABASE === "undefined" || !Array.isArray(EXERCISE_DATABASE)) return;
        for (let i = EXERCISE_DATABASE.length - 1; i >= 0; i--) if (EXERCISE_DATABASE[i].custom) EXERCISE_DATABASE.splice(i, 1);
        CX.forEach(c => {
          const o = { name: c.name, category: muscleOf(c.m).cat, custom: true }, u = muOf(c);
          if (u) o.muscle = u;
          if (c.s && c.s.length) o.similar = c.s.slice();
          EXERCISE_DATABASE.push(o);
        });
        PT._catMap = null; PT._bwList = null;
      }
      function loadCustom(app) {
        CX.clear();
        (Array.isArray(app.settings.customEx) ? app.settings.customEx : []).forEach(e => { if (e && e.name) CX.set(lower(e.name), { name: String(e.name), m: muscleOf(e.m).id, k: kindOf(e.k).id, mu: (typeof e.mu === "string" && PTSIM.MU_LIST.includes(e.mu)) ? e.mu : "", s: Array.isArray(e.s) ? e.s.filter(n => typeof n === "string" && n).slice(0, 6) : [] }); });
        syncDb();
      }
      function saveCustom(app) {
        app.settings.customEx = [...CX.values()];
        WorkoutStorage.saveSettings(app.settings);
        syncDb();
      }
      // The rest of the app works out an exercise's muscle and type from its name. Yours use what you picked.
      const O = { rf: PT.regionsFor, bw: PT.isBodyweightEx, db: PT.dbCount, ck: PT.cardioKind };
      PT.regionsFor = function (name) { const c = CX.get(lower(name)); if (c) { const out = {}; if (c.m !== "cardio") out[c.m] = 1; return out; } return O.rf.apply(this, arguments); };
      PT.isBodyweightEx = function (name) { const c = CX.get(lower(name)); return c ? c.k === "b" : O.bw.apply(this, arguments); };
      PT.dbCount = function (name) { const c = CX.get(lower(name)); return c ? (c.k === "d" ? 2 : 1) : O.db.apply(this, arguments); };
      PT.cardioKind = function (name, reps, type) {
        const c = CX.get(lower(name));
        if (c) { if (type === "tabata") return null; return c.k === "c" ? { dist: true } : c.k === "t" ? { dist: false } : null; }
        return O.ck.apply(this, arguments);
      };
      PT.isCustomEx = name => CX.has(lower(name));

      /* Which part of the muscle ("Which part?") is only asked where a main muscle has more than one. Everything else follows from the main muscle. */
      const SUBS = { shoulders: ["Front Delts", "Side Delts", "Rear Delts"], back: ["Lats", "Mid-Back"], abs: ["Abs", "Obliques", "Core Stability"], forearms: ["Forearms", "Brachioradialis", "Grip & Carries"] };
      const MU_OF_M = { chest: "Chest", biceps: "Biceps", triceps: "Triceps", lowerback: "Lower Back", traps: "Traps", glutes: "Glutes", quads: "Quads", hamstrings: "Hamstrings", calves: "Lower Legs", cardio: "Cardio" };
      /** The muscle to start from: the one the name suggests (a "... Lateral Raise" is a side delt), else the first. */
      function muFor(mId, name) {
        const subs = SUBS[mId];
        if (!subs) return MU_OF_M[mId] || "";
        try {
          const cat = muscleOf(mId).cat, g = PTSIM.muOfFam(PTSIM.info(name || "x", cat).fam, cat);
          if (g && subs.includes(g)) return g;
        } catch (e) { /* use the first */ }
        return subs[0];
      }
      /** The muscle used for "similar exercises". Exercises saved before this existed are read from their name. */
      function muOf(c) {
        if (c.mu) return c.mu;
        if (!SUBS[c.m]) return MU_OF_M[c.m] || "";
        try {
          const cat = muscleOf(c.m).cat, g = PTSIM.muOfFam(PTSIM.info(c.name, cat).fam, cat);
          return g && SUBS[c.m].includes(g) ? g : "";
        } catch (e) { return ""; }
      }
      const MAX_SIM = 6;

      /** Choose up to 6 similar exercises. Resolves with the list, or null if closed without tapping Done. */
      function pickSimilar(o) {
        const el = sheet("pt-cx-pick", 80);
        let chosen = (o.chosen || []).slice(), q = "", finished = false;
        const all = () => (typeof EXERCISE_DATABASE !== "undefined" ? EXERCISE_DATABASE : []).filter(e => e && e.name && lower(e.name) !== lower(o.name));
        // the closest exercises for the same muscle come first (the new lift is added to the list just for this)
        let ranked = [];
        try {
          const tmp = o.name || "New exercise", pool = all().concat([{ name: tmp, category: o.cat, muscle: o.mu || undefined }]), idx = PTSIM.makeIndex(pool);
          ranked = PTSIM.suggest(tmp, pool, { index: idx, cat: () => o.cat, done: () => false, perf: () => "" }, 60).map(s => idx.canon(s.name)).filter(Boolean);
        } catch (err) { ranked = []; }
        const muLabel = e => { try { return PTSIM.muscleOf(e, PTSIM.info(e.name, e.category || "Other")).mu || e.category || ""; } catch (err) { return e.category || ""; } };
        const card = openSheet(el, `${head("Similar exercises", "Pick up to " + MAX_SIM + " that train the same muscle. They show up under this lift, and this lift shows up under theirs.")}
          <input id="pt-sp-q" type="search" autocomplete="off" placeholder="Search all exercises" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-emerald-500" style="user-select:text">
          <div id="pt-sp-list" class="space-y-1.5 max-h-[46vh] overflow-y-auto hide-scrollbar"></div>
          <button type="button" id="pt-sp-done" class="w-full py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold tap-active"></button>`);
        const list = card.querySelector("#pt-sp-list"), done = card.querySelector("#pt-sp-done");
        const draw = () => {
          let rows;
          if (q) rows = all().filter(e => PT.exMatch(e, q)).sort((a, b) => PT.exRank(a, q) - PT.exRank(b, q) || a.name.localeCompare(b.name)).slice(0, 60);
          else {
            // the closest first, in a fixed order (a tapped row stays where it is). Picks that are not among them (found by search) go on top.
            const inRanked = n => ranked.some(e => lower(e.name) === lower(n));
            rows = chosen.filter(n => !inRanked(n)).map(n => all().find(e => lower(e.name) === lower(n))).filter(Boolean).concat(ranked);
          }
          list.innerHTML = rows.length ? rows.map(e => { const on = chosen.some(n => lower(n) === lower(e.name));
            return `<button type="button" data-n="${esc(e.name)}" class="w-full flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left tap-active ${on ? "border-emerald-500 bg-emerald-950/40" : "border-zinc-800 bg-zinc-950"}">
              <span class="min-w-0 flex-1"><span class="block text-sm font-semibold text-white truncate">${esc(e.name)}</span><span class="block text-[10px] text-zinc-400">${esc(muLabel(e))}</span></span>
              <span class="w-5 h-5 shrink-0 rounded-md border flex items-center justify-center text-[11px] font-black ${on ? "bg-emerald-600 border-emerald-500 text-white" : "border-zinc-700 text-transparent"}">✓</span></button>`; }).join("")
            : '<p class="text-xs text-zinc-500 text-center py-4">No exercises match that.</p>';
          done.textContent = chosen.length ? `Done · ${chosen.length} picked` : "Done";
        };
        card.querySelector("#pt-sp-q").addEventListener("input", ev => { q = ev.target.value.trim(); draw(); });
        list.addEventListener("click", ev => {
          const b = ev.target.closest("[data-n]"); if (!b) return;
          const n = b.dataset.n, at = chosen.findIndex(x => lower(x) === lower(n));
          if (at >= 0) chosen.splice(at, 1);
          else if (chosen.length >= MAX_SIM) { const a = A(); a && a.toast && a.toast("You can pick up to " + MAX_SIM + ". Tap one to remove it first."); return; }
          else chosen.push(n);
          const top = list.scrollTop; draw(); list.scrollTop = top;
        });
        return new Promise(resolve => {
          done.addEventListener("click", () => { finished = true; closeSheet(el); resolve(chosen); });
          el.__onClose = () => { if (!finished) resolve(null); };
          draw();
        });
      }

      /** Create or edit one of your own exercises. Resolves with the saved name, or null if cancelled. */
      function openForm(opts) {
        opts = opts || {};
        const app = A(), existing = opts.existing ? CX.get(lower(opts.existing)) : null;
        const el = sheet("pt-cx", 70);
        let m = existing ? existing.m : "", k = existing ? existing.k : "w";
        let mu = existing ? (existing.mu || muOf(existing)) : "", sims = existing ? (existing.s || []).slice() : [];
        return new Promise(resolve => {
          const card = openSheet(el, `${head(existing ? "Edit exercise" : "New exercise", existing ? "The name stays the same so your history keeps matching." : "Add a lift that is not in the list.")}
            <label class="block">${lab("Name")}<input id="pt-cx-name" type="text" maxlength="60" autocomplete="off" ${existing ? "readonly" : ""} placeholder="e.g. Cable Crossover (low to high)" value="${esc(existing ? existing.name : (opts.name || ""))}" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-3 text-base font-semibold text-white focus:outline-none focus:border-emerald-500 ${existing ? "opacity-70" : ""}" style="user-select:text"></label>
            <div>${lab("Main muscle")}<div id="pt-cx-m" class="grid grid-cols-2 gap-1.5">${MUSCLES.map(x => `<button type="button" data-m="${x.id}" class="pt-cx-m rounded-xl border px-2 py-2.5 text-xs font-bold text-left tap-active">${esc(x.label)}</button>`).join("")}</div></div>
            <div id="pt-cx-sub-wrap" class="hidden">${lab("Which part?")}<div id="pt-cx-sub" class="flex flex-wrap gap-1.5"></div></div>
            <div>${lab("Similar exercises (optional)")}<p class="text-[11px] text-zinc-500 mb-1.5">Pick up to ${MAX_SIM} lifts that train the same muscle. They are listed under this one in Similar exercises, and this one is listed under theirs.</p>
              <div id="pt-cx-sim" class="flex flex-wrap gap-1.5 mb-1.5"></div>
              <button type="button" id="pt-cx-sim-btn" class="w-full py-2.5 rounded-xl bg-zinc-800 text-zinc-200 text-xs font-bold tap-active">＋ Choose similar exercises</button></div>
            <div>${lab("How do you log it?")}<div id="pt-cx-k" class="space-y-1.5">${KINDS.map(x => `<button type="button" data-k="${x.id}" class="pt-cx-k w-full rounded-xl border px-3 py-2.5 text-left tap-active"><span class="block text-xs font-bold">${esc(x.label)}</span><span class="block text-[11px] text-zinc-400 mt-0.5">${esc(x.desc)}</span></button>`).join("")}</div></div>
            <p id="pt-cx-err" class="hidden text-xs font-semibold text-rose-400"></p>
            <div class="grid grid-cols-2 gap-2 pt-1"><button type="button" data-close class="py-3 rounded-xl bg-zinc-800 text-zinc-200 text-sm font-bold tap-active">Cancel</button>
              <button type="button" id="pt-cx-save" class="py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold tap-active">${existing ? "Save" : (opts.addLabel || "Create")}</button></div>`);
          const nameVal = () => card.querySelector("#pt-cx-name").value.replace(/\s+/g, " ").trim();
          const paint = () => {
            card.querySelectorAll(".pt-cx-m").forEach(b => { const on = b.dataset.m === m; b.classList.toggle("border-emerald-500", on); b.classList.toggle("bg-emerald-950/40", on); b.classList.toggle("text-white", on); b.classList.toggle("border-zinc-800", !on); b.classList.toggle("bg-zinc-950", !on); b.classList.toggle("text-zinc-300", !on); });
            card.querySelectorAll(".pt-cx-k").forEach(b => { const on = b.dataset.k === k; b.classList.toggle("border-emerald-500", on); b.classList.toggle("bg-emerald-950/40", on); b.classList.toggle("text-white", on); b.classList.toggle("border-zinc-800", !on); b.classList.toggle("bg-zinc-950", !on); b.classList.toggle("text-zinc-300", !on); });
            const subs = SUBS[m] || [];
            card.querySelector("#pt-cx-sub-wrap").classList.toggle("hidden", subs.length < 2);
            card.querySelector("#pt-cx-sub").innerHTML = subs.map(s => `<button type="button" data-mu="${esc(s)}" class="pt-cx-sub rounded-xl border px-3 py-2 text-xs font-bold tap-active ${s === mu ? "border-emerald-500 bg-emerald-950/40 text-white" : "border-zinc-800 bg-zinc-950 text-zinc-300"}">${esc(s)}</button>`).join("");
            card.querySelector("#pt-cx-sim").innerHTML = sims.map((s, i) => `<button type="button" data-rm="${i}" class="pt-cx-chip rounded-full border border-emerald-800/60 bg-emerald-950/40 px-2.5 py-1 text-[11px] font-bold text-emerald-300 tap-active">${esc(s)} ✕</button>`).join("");
            card.querySelector("#pt-cx-sim-btn").textContent = sims.length ? "Change similar exercises" : "＋ Choose similar exercises";
          };
          const err = t => { const e = card.querySelector("#pt-cx-err"); e.textContent = t || ""; e.classList.toggle("hidden", !t); };
          card.addEventListener("click", async ev => {
            const bm = ev.target.closest(".pt-cx-m"), bk = ev.target.closest(".pt-cx-k"), bs = ev.target.closest(".pt-cx-sub"), br = ev.target.closest(".pt-cx-chip");
            if (bm) { m = bm.dataset.m; mu = muFor(m, nameVal()); if (m === "cardio" && !["c", "t"].includes(k)) k = "c"; else if (m !== "cardio" && ["c", "t"].includes(k) && !existing) k = "w"; err(""); paint(); }
            if (bk) { k = bk.dataset.k; err(""); paint(); }
            if (bs) { mu = bs.dataset.mu; paint(); }
            if (br) { sims.splice(parseInt(br.dataset.rm, 10), 1); paint(); }
            if (ev.target.closest("#pt-cx-sim-btn")) {
              if (!m) return err("Pick the main muscle first, so the list can start with the right exercises.");
              err("");
              const got = await pickSimilar({ name: existing ? existing.name : nameVal(), cat: muscleOf(m).cat, mu: mu || muFor(m, nameVal()), chosen: sims });
              if (got) sims = got.slice(0, MAX_SIM);
              paint();
            }
          });
          card.querySelector("#pt-cx-save").addEventListener("click", () => {
            const name = card.querySelector("#pt-cx-name").value.replace(/\s+/g, " ").trim();
            if (!name) return err("Give it a name.");
            if (!m) return err("Pick the main muscle.");
            if (!existing) {
              const clash = (typeof EXERCISE_DATABASE !== "undefined" ? EXERCISE_DATABASE : []).some(e => lower(e.name) === lower(name)) || CX.has(lower(name));
              if (clash) return err("An exercise with that name already exists.");
              const known = (typeof PT !== "undefined" && PT.exCanon) ? PT.exCanon(name) : null;
              if (known) return err('An exercise with that name already exists (it is listed as "' + known.name + '").');
            }
            const saveName = existing ? existing.name : name;
            CX.set(lower(name), { name: saveName, m, k, mu: mu || muFor(m, saveName), s: sims.filter(n => lower(n) !== lower(saveName)).slice(0, MAX_SIM) });
            saveCustom(app);
            done = true; closeSheet(el); resolve(saveName);
          });
          let done = false;
          el.__onClose = () => { if (!done) resolve(null); };
          paint();
          if (!existing) setTimeout(() => { const i = card.querySelector("#pt-cx-name"); if (i && !i.value) i.focus(); }, 150);
        });
      }

      /** The list of your own exercises, with edit and delete. */
      function openManager() {
        const app = A(), el = sheet("pt-mx");
        const draw = () => {
          const list = [...CX.values()].sort((a, b) => a.name.localeCompare(b.name));
          const card = openSheet(el, `${head("My exercises", "Lifts you added yourself. They work everywhere: programs, charts, records and the muscle map.")}
            <button type="button" id="pt-mx-new" class="w-full py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold tap-active">＋ New exercise</button>
            ${list.length ? `<div class="space-y-2">${list.map(c => `<div class="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5" data-name="${esc(c.name)}">
                <div class="min-w-0 flex-1"><span class="block text-sm font-bold text-white truncate">${esc(c.name)}</span><span class="block text-[11px] text-zinc-400">${esc(muOf(c) || muscleOf(c.m).label)} · ${esc(kindOf(c.k).label)}${c.s && c.s.length ? " · " + c.s.length + " similar" : ""}</span></div>
                <button type="button" data-act="edit" class="px-2.5 py-1.5 rounded-lg bg-zinc-800 text-zinc-200 text-xs font-bold tap-active">Edit</button>
                <button type="button" data-act="del" class="px-2.5 py-1.5 rounded-lg bg-zinc-800 text-rose-400 text-xs font-bold tap-active">Delete</button></div>`).join("")}</div>`
              : `<p class="text-xs text-zinc-400 text-center py-4">You have not added any yet.<br>Tap the button above to make your first one.</p>`}`);
          card.querySelector("#pt-mx-new").addEventListener("click", async () => { await openForm({}); draw(); });
          card.querySelectorAll("[data-act]").forEach(b => b.addEventListener("click", async () => {
            const name = b.closest("[data-name]").dataset.name;
            if (b.dataset.act === "edit") { await openForm({ existing: name }); draw(); return; }
            const ok = await PT.confirm(`Delete "${name}"?\n\nWorkouts you already logged keep it. Programs that use it will still show it, but it will no longer be in the exercise list.`);
            if (!ok) return;
            CX.delete(lower(name)); saveCustom(app); draw();
            app.toast && app.toast(`Deleted ${name}`);
          }));
        };
        draw();
      }
      PT.openMyExercises = openManager;
      PT.createExercise = openForm;

      // The exercise picker (add, swap, builder): a "create your own" button on top and a MINE tag
      const origList = ApplicationUI.prototype.renderExerciseList;
      ApplicationUI.prototype.renderExerciseList = function (query) {
        const r = origList.apply(this, arguments);
        try {
          const box = this.dom.exListContainer; if (!box) return r;
          box.querySelectorAll("button").forEach(b => {
            const s = b.querySelector("span"); if (s && CX.has(lower(s.textContent)) && !b.querySelector(".pt-mine")) s.insertAdjacentHTML("afterend", '<span class="pt-mine shrink-0 px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800/60 text-emerald-400 text-[9px] font-black tracking-wide">MINE</span>');
          });
          const q = String(query || "").trim();
          const wrap = document.createElement("div");
          wrap.className = "p-3 border-b border-zinc-800/60";
          wrap.innerHTML = `<button type="button" class="w-full py-3 rounded-xl border-2 border-dashed border-emerald-700/70 text-emerald-400 text-sm font-bold tap-active">${q ? `＋ Create “${esc(q.length > 28 ? q.slice(0, 28) + "…" : q)}”` : "＋ Create your own exercise"}</button>`;
          wrap.firstElementChild.addEventListener("click", async () => {
            const name = await openForm({ name: q, addLabel: "Create and add" });
            if (!name) return;
            this.exCat = "All";
            this.handleExerciseSelection(name, null);
            if (document.getElementById("modal-ex-selector") && !document.getElementById("modal-ex-selector").classList.contains("hidden")) this.renderExerciseList(this.dom.exSearchInput.value);
          });
          box.insertBefore(wrap, box.firstChild);
        } catch (e) { console.error(e); }
        return r;
      };

      /* ============================================================ home layout */
      const closestChild = id => { const e = document.getElementById(id); return e ? e.closest("#view-home > *") : null; };
      const HOME = [
        { id: "banners", label: "Monthly recap banner", el: () => document.getElementById("home-banners") },
        { id: "routine", label: "Today's workout", el: () => closestChild("btn-home-resume") },
        { id: "build", label: "Start training (Build, Empty, Cardio)", el: () => document.getElementById("home-build") },
        { id: "week", label: "This week", el: () => document.getElementById("home-week") },
        { id: "work", label: "Work check-in", el: () => document.getElementById("home-work") },
        { id: "recap", label: "Last workout", off: true, el: () => document.getElementById("home-recap") },
        { id: "prmonth", label: "PRs this month", off: true, el: () => document.getElementById("home-prmonth") },
        { id: "search", label: "Search bar", off: true, el: () => document.getElementById("home-search") },
        { id: "tiles", label: "Train, Track and Tools", off: true, el: () => closestChild("btn-home-view-programs") },
        { id: "trophy", label: "1RM Trophy Room", off: true, el: () => closestChild("trophy-room") },
        { id: "streak", label: "Consistency (it is also in This week)", off: true, el: () => closestChild("home-streak-title") }
      ];
      function homeLayout(app) {
        // 2.22.0: Home is only the daily things now. Every phone gets the shorter Home once; the rest is in the menu and can be switched back on in Settings.
        if (app.settings.homeLayoutV !== 3) {
          app.settings.homeLayout = HOME.map(h => ({ id: h.id, show: !h.off }));
          app.settings.homeLayoutV = 3;
          app.settings.homeNote = 1;
          try { WorkoutStorage.saveSettings(app.settings); } catch (e) { }
        }
        const saved = Array.isArray(app.settings.homeLayout) ? app.settings.homeLayout : [];
        const out = [], seen = new Set();
        saved.forEach(i => { if (i && HOME.some(h => h.id === i.id) && !seen.has(i.id)) { seen.add(i.id); out.push({ id: i.id, show: i.show !== false }); } });
        HOME.forEach(h => { if (seen.has(h.id)) return; const at = h.after ? out.findIndex(x => x.id === h.after) : -1, it = { id: h.id, show: !h.off }; if (at >= 0) out.splice(at + 1, 0, it); else out.push(it); });
        return out;
      }
      function applyHomeLayout(app) {
        homeLayout(app).forEach((it, i) => {
          const h = HOME.find(x => x.id === it.id), e = h && h.el(); if (!e) return;
          e.style.order = String(i); e.style.display = it.show ? "" : "none";
        });
      }
      function drawHomeLayout(app) {
        const box = document.getElementById("pt-home-layout"); if (!box) return;
        const lay = homeLayout(app);
        const hid = lay.filter(x => !x.show).length;
        box.innerHTML = `<details class="pt-sub" data-sec="home" ${box.__open ? "open" : ""}><summary><span class="min-w-0 flex-1 text-xs font-bold text-white">Home screen</span><span class="pt-sum">${hid ? hid + " hidden" : "All shown"}</span><span class="pt-chev" aria-hidden="true">›</span></summary><div class="pt-sub-body space-y-2.5"><span class="text-[11px] text-zinc-400 block">Hide the cards you don't use and put the rest in the order you like.</span>
          <div class="space-y-1.5">${lay.map((it, i) => `<div class="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-2.5 py-1.5" data-id="${it.id}">
            <span class="flex-1 min-w-0 text-xs font-semibold truncate ${it.show ? "text-white" : "text-zinc-500 line-through"}">${esc(HOME.find(h => h.id === it.id).label)}</span>
            <button type="button" data-act="up" ${i === 0 ? "disabled" : ""} class="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-300 text-xs tap-active disabled:opacity-30" aria-label="Move up">▲</button>
            <button type="button" data-act="down" ${i === lay.length - 1 ? "disabled" : ""} class="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-300 text-xs tap-active disabled:opacity-30" aria-label="Move down">▼</button>
            <button type="button" data-act="eye" class="w-14 h-8 rounded-lg text-[11px] font-bold tap-active ${it.show ? "bg-emerald-950 border border-emerald-800/60 text-emerald-400" : "bg-zinc-800 text-zinc-400"}">${it.show ? "Shown" : "Hidden"}</button></div>`).join("")}</div>
          <button type="button" data-act="reset" class="text-[11px] font-semibold text-zinc-400 underline tap-active">Put the cards back the way they were</button></div></details>`;
        box.querySelector("details").addEventListener("toggle", ev => { box.__open = ev.target.open; });
      }
      document.addEventListener("click", e => {
        const b = e.target.closest("#pt-home-layout [data-act]"); if (!b) return;
        const app = A(); if (!app) return;
        let lay = homeLayout(app);
        if (b.dataset.act === "reset") lay = HOME.map(h => ({ id: h.id, show: !h.off }));
        else {
          const id = b.closest("[data-id]").dataset.id, i = lay.findIndex(x => x.id === id);
          if (b.dataset.act === "up" && i > 0) [lay[i - 1], lay[i]] = [lay[i], lay[i - 1]];
          else if (b.dataset.act === "down" && i < lay.length - 1) [lay[i + 1], lay[i]] = [lay[i], lay[i + 1]];
          else if (b.dataset.act === "eye") lay[i].show = !lay[i].show;
        }
        app.settings.homeLayout = lay;
        WorkoutStorage.saveSettings(app.settings);
        applyHomeLayout(app); drawHomeLayout(app);
      });

      /* ============================================================ 1RM calculator */
      function openRm() {
        const app = A(), el = sheet("pt-rm"), u = app.wLabel(), kg = app.unit() === "kg";
        const st = Object.assign({ w: "", r: "5", round: true }, app.settings.rmCalc || {});
        let base = null, baseName = "";
        const card = openSheet(el, `${head("1RM calculator", "Enter a hard set to estimate your one-rep max, then see what to lift at each percentage.")}
          <div class="grid grid-cols-2 gap-3">
            <label class="block">${lab(`Weight (${u})`)}<input id="pt-rm-w" type="number" inputmode="decimal" placeholder="${kg ? "100" : "225"}" value="${esc(st.w)}" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-3 text-xl font-bold font-mono text-white text-center focus:outline-none focus:border-emerald-500"></label>
            <label class="block">${lab("Reps")}<input id="pt-rm-r" type="number" inputmode="numeric" min="1" max="30" placeholder="5" value="${esc(st.r)}" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-3 text-xl font-bold font-mono text-white text-center focus:outline-none focus:border-emerald-500"></label>
          </div>
          <button type="button" id="pt-rm-pr" class="w-full py-2.5 rounded-xl bg-zinc-800 text-zinc-200 text-xs font-bold tap-active">Or start from one of my records…</button>
          <div id="pt-rm-res" class="rounded-2xl bg-zinc-950 border border-zinc-800 p-4 text-center"></div>
          <label class="flex items-center justify-between gap-3"><span class="text-xs text-zinc-300 font-semibold">Round to the plates I have<span class="block text-[11px] text-zinc-500 font-normal">Uses your bar and plates from Settings</span></span>
            <span class="relative inline-flex items-center cursor-pointer shrink-0"><input type="checkbox" id="pt-rm-round" class="sr-only peer" ${st.round ? "checked" : ""}><span class="w-11 h-6 bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></span></span></label>
          <div id="pt-rm-table" class="space-y-1"></div>`);
        const $ = s => card.querySelector(s);
        const plates = app.gymPlates().filter(p => p > 0), step = plates.length ? 2 * Math.min(...plates) : 0, bar = app.selectedBarWeight || 0;
        const roundLoad = w => (!$("#pt-rm-round").checked || !step || w <= bar) ? w : bar + step * Math.round((w - bar) / step);
        const fmt = v => PT.num(v, 2), fmt1 = v => PT.num(v, 1);
        const calc = () => {
          const w = parseFloat($("#pt-rm-w").value), r = Math.round(parseFloat($("#pt-rm-r").value));
          let est = 0, note = "";
          if (base) { est = base; note = `From your record: ${esc(baseName)}`; }
          else if (w > 0 && r >= 1) {
            est = r === 1 ? w : w * (1 + r / 30);
            const brz = r < 37 ? w * 36 / (37 - r) : 0, lom = w * Math.pow(r, 0.10);
            note = r > 12 ? "Estimates get less accurate above about 12 reps." : (r > 1 ? `Other formulas: Brzycki ${fmt1(brz)} · Lombardi ${fmt1(lom)}` : "One rep is your max.");
          }
          app.settings.rmCalc = { w: $("#pt-rm-w").value, r: $("#pt-rm-r").value, round: $("#pt-rm-round").checked };
          clearTimeout(calc._t); calc._t = setTimeout(() => WorkoutStorage.saveSettings(app.settings), 400);
          if (!(est > 0)) { $("#pt-rm-res").innerHTML = '<span class="text-xs text-zinc-500">Enter a weight and reps above.</span>'; $("#pt-rm-table").innerHTML = ""; return; }
          $("#pt-rm-res").innerHTML = `<span class="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Estimated one-rep max</span><span class="block text-4xl font-black font-mono text-emerald-400 mt-1">${fmt1(est)} <span class="text-lg text-zinc-400">${u}</span></span><span class="block text-[11px] text-zinc-500 mt-1">${note}</span>`;
          const rows = [100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50];
          $("#pt-rm-table").innerHTML = `<div class="grid grid-cols-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-3 pb-1"><span>Percent</span><span class="text-center">Lift</span><span class="text-right">About</span></div>` +
            rows.map(p => { const v = roundLoad(est * p / 100), reps = p === 100 ? 1 : Math.max(1, Math.round(30 * (100 / p - 1)));
              return `<button type="button" data-w="${v}" class="w-full grid grid-cols-3 items-center rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 tap-active"><span class="text-xs font-bold text-zinc-300 text-left">${p}%</span><span class="text-sm font-black font-mono text-white text-center">${fmt(v)} <span class="text-[10px] text-zinc-500 font-semibold">${u}</span></span><span class="text-[11px] text-zinc-400 text-right">${reps} rep${reps === 1 ? "" : "s"}</span></button>`; }).join("") +
            `<p class="text-[11px] text-zinc-500 text-center pt-1.5">Tap a row to see which plates to load.</p>`;
        };
        ["#pt-rm-w", "#pt-rm-r"].forEach(s => $(s).addEventListener("input", () => { base = null; calc(); }));
        $("#pt-rm-round").addEventListener("change", calc);
        $("#pt-rm-table").addEventListener("click", e => { const b = e.target.closest("[data-w]"); if (!b) return; closeSheet(el); app.openPlateCalc(parseFloat(b.dataset.w)); });
        $("#pt-rm-pr").addEventListener("click", async () => {
          const names = Object.keys(app.prs || {}).filter(n => app.prs[n] > 0 && !PT.cardioKind(n)).sort((a, b) => app.prs[b] - app.prs[a]);
          if (!names.length) { await PT.alert("You have no records yet. Finish a workout with some weight on the bar and they will show up here."); return; }
          const v = await PT.pickList("Pick a lift", names.slice(0, 60).map(n => ({ value: n, label: `${n} · ${PT.num(app.prs[n], 0)} ${u}` })), "");
          if (!v) return; base = app.prs[v]; baseName = v; calc();
        });
        calc();
      }
      PT.openRmCalc = openRm;
      PT.kit = { sheet, openSheet, closeSheet, head, lab, esc, X_ICON };

      /* ============================================================ home tiles */
      function ensureTiles(app) {
        const first = document.getElementById("btn-home-view-programs"); if (!first || document.getElementById("tile-rm")) return;
        const grid = first.parentElement;
        const tile = (id, icon, label, tint) => { const b = document.createElement("button"); b.id = id; b.className = "bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-2xl p-3 text-left tap-active transition flex flex-col gap-2"; b.innerHTML = `<span class="w-8 h-8 rounded-lg ${tint} flex items-center justify-center">${icon}</span><span class="text-xs font-bold text-white leading-tight">${label}</span>`; grid.appendChild(b); return b; };
        tile("tile-rm", "🧮", "1RM Calculator", "bg-sky-950 border border-sky-800/60").addEventListener("click", () => openRm());
        tile("tile-plates", "🏋️", "Plate Calculator", "bg-rose-950 border border-rose-800/60").addEventListener("click", () => A().openPlateCalc());
        tile("tile-myex", "✏️", "My Exercises", "bg-emerald-950 border border-emerald-800/60").addEventListener("click", () => openManager());
      }
      function ensureLibraryButton() {
        const s = document.getElementById("lib-search"); if (!s || document.getElementById("lib-create")) return;
        const b = document.createElement("button"); b.id = "lib-create"; b.type = "button";
        b.className = "w-full py-2.5 rounded-xl border-2 border-dashed border-emerald-700/70 text-emerald-400 text-xs font-bold tap-active";
        b.textContent = "＋ Create your own exercise";
        b.addEventListener("click", async () => { const n = await openForm({}); if (n && A().renderLibraryView) A().renderLibraryView(); });
        s.parentNode.insertBefore(b, s);
      }

      /* ============================================================ wiring */
      const origInit = ApplicationUI.prototype.initExtras;
      ApplicationUI.prototype.initExtras = function () {
        const r = origInit.apply(this, arguments);
        try { loadCustom(this); ensureTiles(this); ensureLibraryButton(); applyHomeLayout(this); drawHomeLayout(this); PT.applyHomeLayout = () => { applyHomeLayout(this); drawHomeLayout(this); }; } catch (e) { console.error("PulseTrack v2.5 init", e); }
        return r;
      };
      const origUi = ApplicationUI.prototype.updateAppearanceUI;
      ApplicationUI.prototype.updateAppearanceUI = function () {
        const r = origUi.apply(this, arguments);
        const box = document.getElementById("pt-home-layout"); if (box && !box.firstChild) drawHomeLayout(this);
        return r;
      };
    })();
  