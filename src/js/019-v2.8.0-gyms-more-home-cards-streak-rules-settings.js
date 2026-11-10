
/* =====================================================================
 * PulseTrack 2.8.0 (part 2): gyms, more Home cards, streak rules, Settings.
 *  - gym profiles: bar, plates, dumbbell range and equipment for each place you train.
 *    The exercise picker and swap suggestions leave out what the active gym can't do.
 *  - Home cards: This week, Last workout, PRs this month (show, hide and reorder them in Settings)
 *  - sick and trip days that don't break your streak, and an optional "count cardio" switch
 * ===================================================================== */
(function () {
  "use strict";
  const proto = ApplicationUI.prototype;
  const A = () => window.app;
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const num = (v, d) => PT.num(v, d == null ? (Math.abs(v % 1) > 0.001 ? 2 : 0) : d);
  const clone = o => JSON.parse(JSON.stringify(o));
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const save = a => WorkoutStorage.saveSettings(a.settings);

  const css = document.createElement("style");
  css.id = "pt-v28b-css";
  css.textContent = `
    .pt-gchip { display: inline-flex; align-items: center; gap: .4rem; align-self: flex-start; padding: .3rem .7rem; border-radius: 999px; font-size: .7rem; font-weight: 800; background: rgb(var(--z900)); color: rgb(var(--z200)); border: 1px solid rgb(var(--z700)); }
    .pt-opt { padding: .5rem .75rem; border-radius: .7rem; font-size: .75rem; font-weight: 700; border: 1px solid rgb(var(--z800)); background: rgb(var(--z900)); color: rgb(var(--z400)); }
    .pt-opt[aria-pressed="true"] { background: rgb(var(--a600)); color: #fff; border-color: transparent; }
    .pt-wk { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: .35rem; }
    .pt-wd { display: flex; flex-direction: column; align-items: center; gap: .2rem; padding: .4rem 0 .45rem; border-radius: .7rem; border: 1px solid transparent; background: rgb(var(--z950)); min-width: 0; }
    .pt-wd .pt-wl { font-size: .58rem; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; color: rgb(var(--z500)); }
    .pt-wd .pt-wn { font-size: .78rem; font-weight: 800; color: rgb(var(--z200)); font-variant-numeric: tabular-nums; }
    .pt-wd.pt-today { border-color: rgb(var(--a500) / .7); }
    .pt-wd.pt-today .pt-wl { color: rgb(var(--a400)); }
    .pt-wd.pt-future .pt-wn { color: rgb(var(--z600)); }
    .pt-wd.pt-off { background: rgba(217, 119, 6, .14); }
    .pt-dots { display: flex; gap: .22rem; align-items: center; height: .55rem; }
    .pt-dot { width: .5rem; height: .5rem; border-radius: 999px; border: 1.5px solid rgb(var(--z700)); box-sizing: border-box; }
    .pt-dot.pt-lift.on { background: rgb(var(--a500)); border-color: rgb(var(--a500)); }
    .pt-dot.pt-card.on { background: #38bdf8; border-color: #38bdf8; }
    .pt-offmark { font-size: .62rem; line-height: .55rem; }
    .pt-recap-row { display: flex; justify-content: space-between; gap: .75rem; font-size: .72rem; padding: .15rem 0; }
    .pt-recap-row span:first-child { color: rgb(var(--z300)); min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .pt-recap-row span:last-child { color: rgb(var(--z400)); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; flex: none; }
  `;
  document.head.appendChild(css);

  const SW = (attr, on) => `<label class="relative inline-flex items-center cursor-pointer flex-shrink-0"><input type="checkbox" ${attr} class="sr-only peer" ${on ? "checked" : ""}><div class="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div></label>`;
  const ROW = (title, sub, ctl) => `<div class="flex items-center justify-between p-3.5 gap-3"><div class="pr-3 min-w-0"><span class="text-xs font-bold text-white block">${title}</span>${sub ? `<span class="text-[11px] text-zinc-400 block mt-0.5">${sub}</span>` : ""}</div>${ctl}</div>`;

  /* ============================================================ gym profiles */
  const GYM_KEYS = ["barLb", "barKg", "platesLb", "platesKg"];
  const EQUIP = [["barbell", "Barbell"], ["ezbar", "EZ-bar"], ["dumbbell", "Dumbbells"], ["machine", "Machines"], ["cable", "Cables"], ["smith", "Smith machine"], ["kettlebell", "Kettlebells"], ["band", "Bands"], ["bodyweight", "Bodyweight"]];
  const EQMAP = { barbell: "barbell", trapbar: "barbell", landmine: "barbell", plate: "barbell", ezbar: "ezbar", dumbbell: "dumbbell", machine: "machine", cable: "cable", smith: "smith", kettlebell: "kettlebell", band: "band", bodyweight: "bodyweight" };
  const DB_DEF = { lb: { min: 5, max: 150, step: 5 }, kg: { min: 2.5, max: 70, step: 2.5 } };
  const TEMPLATES = [
    { id: "home", label: "Home gym", db: { lb: { min: 5, max: 50, step: 5 }, kg: { min: 2.5, max: 25, step: 2.5 } }, off: ["machine", "cable", "smith", "ezbar"],
      platesLb: [45, 25, 10, 5, 2.5], platesKg: [20, 10, 5, 2.5, 1.25] },
    { id: "commercial", label: "Commercial gym", db: { lb: { min: 5, max: 150, step: 5 }, kg: { min: 2.5, max: 70, step: 2.5 } }, off: [] },
    { id: "hotel", label: "Hotel or travel gym", db: { lb: { min: 5, max: 50, step: 5 }, kg: { min: 2.5, max: 25, step: 2.5 } }, off: ["barbell", "ezbar", "smith", "kettlebell"] },
    { id: "bw", label: "Bodyweight only", db: { lb: { min: 5, max: 50, step: 5 }, kg: { min: 2.5, max: 25, step: 2.5 } }, off: ["barbell", "ezbar", "dumbbell", "machine", "cable", "smith", "kettlebell"] }
  ];
  const eqCache = new Map();
  /** barbell, ezbar, dumbbell, machine, cable, smith, kettlebell, band, bodyweight, or "none" for anything that needs no special kit */
  PT.equipKey = function (name) {
    const c = String(name || "");
    if (eqCache.has(c)) return eqCache.get(c);
    let k = "none";
    try {
      const e = PT.exCanon(c), nm = e ? e.name : c, cat = e ? e.category : PT.category(c);
      k = EQMAP[PTSIM.info(nm, cat).equip] || "none";
    } catch (e) { }
    eqCache.set(c, k);
    return k;
  };
  const gymList = a => (Array.isArray(a.settings.gyms) ? a.settings.gyms.filter(g => g && g.id) : []);
  const realGym = a => { const l = gymList(a); return l.find(g => g.id === a.settings.gymId) || l[0] || null; };
  PT.gyms = () => { const a = A(); return a ? gymList(a) : []; };
  PT.gym = () => { const a = A(); if (!a) return null; return realGym(a) || { id: "g1", name: "My gym", equip: {}, db: null }; };
  PT.gymDb = () => {
    const a = A(), g = PT.gym(), u = a && a.unit() === "kg" ? "kg" : "lb", d = g && g.db && g.db[u];
    return { min: +(d && d.min) || DB_DEF[u].min, max: +(d && d.max) || DB_DEF[u].max, step: +(d && d.step) || DB_DEF[u].step };
  };
  const pickerOpen = () => { const m = document.getElementById("modal-ex-selector"); return !!m && !m.classList.contains("hidden"); };
  PT.gymAllows = function (name) {
    if (PT._gymOff && pickerOpen()) return true;       // "Show all" only lasts while the picker is open
    const a = A(); if (!a || !a.settings) return true;
    const g = realGym(a); if (!g || !g.equip) return true;
    if (PT.isCustomEx && PT.isCustomEx(name)) return true;
    const k = PT.equipKey(name);
    return k === "none" || g.equip[k] !== false;
  };
  /** The equipment this gym lacks, as words: "cables, machines" */
  const lacking = g => EQUIP.filter(([k]) => g && g.equip && g.equip[k] === false).map(([, l]) => l.toLowerCase());

  /** Make the profile the one the whole app uses: the bar, plates and increments live in settings, as they always have. */
  function syncOut(a) {
    const g = realGym(a); if (!g) return;
    GYM_KEYS.forEach(k => { if (a.settings[k] === undefined) delete g[k]; else g[k] = clone(a.settings[k]); });
  }
  function applyToTop(a, g) {
    GYM_KEYS.forEach(k => { if (g[k] === undefined) delete a.settings[k]; else a.settings[k] = clone(g[k]); });
    a.selectedBarWeight = a.savedBar();
    try { a.applyUnitLabels(); } catch (e) { }
    try { if (a.dom.plateTargetInput) a.calculatePlates(); } catch (e) { }
  }
  function ensureGyms(a) {
    if (gymList(a).length) { if (!realGym(a)) a.settings.gymId = gymList(a)[0].id; return; }
    const g = { id: "g1", name: "My gym", equip: {}, db: clone(DB_DEF) };
    GYM_KEYS.forEach(k => { if (a.settings[k] !== undefined) g[k] = clone(a.settings[k]); });
    a.settings.gyms = [g]; a.settings.gymId = g.id;
  }
  function activate(a, id) {
    ensureGyms(a);
    const g = gymList(a).find(x => x.id === id); if (!g) return;
    syncOut(a);
    a.settings.gymId = id;
    applyToTop(a, g);
    save(a);
    a.refreshWorkoutIfOpen();
    chip(a); renderBoxes(a);
    try { if (!document.getElementById("view-home").classList.contains("hidden")) a.renderHomeView(); } catch (e) { }
  }
  PT.setGym = id => { const a = A(); if (a) activate(a, id); };

  /* ---- a small switch at the top of the workout screen (only when there is more than one gym) */
  function chip(a) {
    const host = document.getElementById("view-workout"); if (!host) return;
    let c = document.getElementById("pt-gym-chip");
    if (gymList(a).length < 2) { if (c) c.remove(); return; }
    if (!c) {
      c = document.createElement("button"); c.type = "button"; c.id = "pt-gym-chip"; c.className = "pt-gchip tap-active";
      const bar = document.getElementById("pt-sel-wk");
      host.insertBefore(c, bar ? bar.nextSibling : host.firstChild);
      c.addEventListener("click", () => openSwitch());
    }
    const g = realGym(a);
    c.innerHTML = `<span aria-hidden="true">📍</span><span>${esc(g ? g.name : "Gym")}</span><span class="text-zinc-500">change</span>`;
  }
  function openSwitch() {
    const a = A(), K = PT.kit, el = K.sheet("pt-gsw", 66), cur = realGym(a);
    const card = K.openSheet(el, `${K.head("Where are you training?", "The picker and suggestions use what this gym has.")}
      <div class="space-y-2">${gymList(a).map(g => `<button type="button" data-g="${esc(g.id)}" class="w-full text-left rounded-xl border px-3.5 py-3 tap-active ${cur && g.id === cur.id ? "border-emerald-600 bg-emerald-950/30" : "border-zinc-800 bg-zinc-950"}">
        <span class="flex items-center justify-between gap-2"><span class="text-sm font-bold text-white">${esc(g.name)}</span>${cur && g.id === cur.id ? '<span class="text-[10px] font-black uppercase tracking-wider text-emerald-400">Here</span>' : ""}</span>
        <span class="block text-[11px] text-zinc-400 mt-0.5">${esc(gymSummary(a, g))}</span></button>`).join("")}</div>
      <button type="button" data-edit="1" class="w-full py-2.5 rounded-xl bg-zinc-800/70 text-zinc-300 text-xs font-bold tap-active">Edit gyms…</button>`);
    card.addEventListener("click", e => {
      const b = e.target.closest("[data-g]");
      if (b) { K.closeSheet(el); activate(a, b.dataset.g); a.toast(`Training at ${(gymList(a).find(g => g.id === b.dataset.g) || {}).name}`); return; }
      if (e.target.closest("[data-edit]")) { K.closeSheet(el); openManager(); }
    });
  }
  const gymSummary = (a, g) => {
    const u = a.unit() === "kg" ? "kg" : "lb", bar = g["bar" + (u === "kg" ? "Kg" : "Lb")];
    const miss = lacking(g);
    return `Bar ${bar === undefined ? (u === "kg" ? 20 : 45) : bar} ${u}${miss.length ? " · no " + miss.slice(0, 3).join(", ") + (miss.length > 3 ? "…" : "") : " · everything"}`;
  };

  /* ---- the editor */
  async function openEdit(id, tmpl) {
    const a = A(), K = PT.kit, el = K.sheet("pt-gym", 68), kg = a.unit() === "kg", u = kg ? "kg" : "lb", sfx = kg ? "Kg" : "Lb";
    ensureGyms(a); syncOut(a);
    const existing = id ? gymList(a).find(g => g.id === id) : null;
    let g = existing ? clone(existing) : { id: PT.uid(), name: tmpl ? tmpl.label : "New gym", equip: {}, db: clone(DB_DEF) };
    if (!existing) {
      if (tmpl) { g.db = clone(tmpl.db); (tmpl.off || []).forEach(k => { g.equip[k] = false; }); if (tmpl["plates" + sfx]) g["plates" + sfx] = tmpl["plates" + sfx].slice(); }
    }
    const barNow = g["bar" + sfx] !== undefined ? g["bar" + sfx] : BAR_PRESETS[u][0];
    let plates = Array.isArray(g["plates" + sfx]) && g["plates" + sfx].length ? g["plates" + sfx].map(Number) : PLATE_DEFAULTS[u].slice();
    const db = Object.assign({}, DB_DEF[u], g.db && g.db[u] || {});
    const eq = {}; EQUIP.forEach(([k]) => { eq[k] = g.equip[k] !== false; });
    const inp = "w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-base font-mono text-white text-center focus:outline-none focus:border-emerald-500";
    const chips = () => PLATE_OPTIONS[u].map(p => `<button type="button" data-pl="${p}" aria-pressed="${plates.includes(p)}" class="pt-opt tap-active font-mono">${p}</button>`).join("");
    const eqChips = () => EQUIP.map(([k, l]) => `<button type="button" data-eq="${k}" aria-pressed="${eq[k]}" class="pt-opt tap-active">${l}</button>`).join("");
    const card = K.openSheet(el, `${K.head(existing ? "Edit gym" : "New gym", "Weights are in " + (kg ? "kilograms" : "pounds") + ".")}
      <label class="block">${K.lab("Name")}<input id="pg-name" type="text" maxlength="24" value="${esc(g.name)}" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-base text-white focus:outline-none focus:border-emerald-500"></label>
      <label class="block">${K.lab("Bar weight (" + u + ")")}<input id="pg-bar" type="number" inputmode="decimal" min="0" max="200" step="any" value="${barNow}" class="${inp}"></label>
      <div>${K.lab("Plates this gym has")}<div id="pg-plates" class="flex flex-wrap gap-1.5">${chips()}</div></div>
      <div>${K.lab("Dumbbells (" + u + ")")}<div class="grid grid-cols-3 gap-2">
        <label class="block"><span class="text-[10px] text-zinc-500 block text-center mb-1">Lightest</span><input id="pg-dmin" type="number" inputmode="decimal" min="0" step="any" value="${db.min}" class="${inp}"></label>
        <label class="block"><span class="text-[10px] text-zinc-500 block text-center mb-1">Heaviest</span><input id="pg-dmax" type="number" inputmode="decimal" min="0" step="any" value="${db.max}" class="${inp}"></label>
        <label class="block"><span class="text-[10px] text-zinc-500 block text-center mb-1">Step</span><input id="pg-dstep" type="number" inputmode="decimal" min="0.25" step="any" value="${db.step}" class="${inp}"></label></div></div>
      <div>${K.lab("Equipment")}<div id="pg-eq" class="flex flex-wrap gap-1.5">${eqChips()}</div>
        <p class="text-[11px] text-zinc-500 mt-1.5">Turn off what this gym doesn't have. Those exercises are left out of the picker and swap ideas. Your programs aren't changed.</p></div>
      <div class="grid ${existing && gymList(a).length > 1 ? "grid-cols-2" : "grid-cols-1"} gap-2 pt-1">
        ${existing && gymList(a).length > 1 ? '<button type="button" id="pg-del" class="py-3 rounded-xl bg-rose-950/50 border border-rose-800/50 text-rose-300 text-sm font-bold tap-active">Delete</button>' : ""}
        <button type="button" id="pg-save" class="py-3 rounded-xl bg-emerald-600 text-white text-sm font-extrabold tap-active">Save</button></div>`);
    const $ = s => card.querySelector(s);
    card.addEventListener("click", async e => {
      const p = e.target.closest("[data-pl]");
      if (p) { const v = parseFloat(p.dataset.pl), i = plates.indexOf(v); if (i >= 0) { if (plates.length === 1) { a.toast("Keep at least one plate size"); return; } plates.splice(i, 1); } else plates.push(v); p.setAttribute("aria-pressed", String(plates.includes(v))); return; }
      const q = e.target.closest("[data-eq]");
      if (q) { eq[q.dataset.eq] = !eq[q.dataset.eq]; q.setAttribute("aria-pressed", String(eq[q.dataset.eq])); return; }
      if (e.target.closest("#pg-del")) {
        if (!await PT.confirm(`Delete "${g.name}"? Your workouts and records are not touched.`, { title: "Delete this gym?", ok: "Delete" })) return;
        const wasActive = realGym(a) && realGym(a).id === g.id;
        a.settings.gyms = gymList(a).filter(x => x.id !== g.id);
        if (wasActive) { a.settings.gymId = a.settings.gyms[0].id; applyToTop(a, a.settings.gyms[0]); }
        save(a); K.closeSheet(el); a.refreshWorkoutIfOpen(); chip(a); renderBoxes(a); return;
      }
      if (e.target.closest("#pg-save")) {
        const name = ($("#pg-name").value || "").trim().slice(0, 24) || "Gym";
        const bar = parseFloat($("#pg-bar").value);
        if (!(bar >= 0) || bar > 200) { await PT.alert("Enter a bar weight between 0 and 200."); return; }
        const dmin = parseFloat($("#pg-dmin").value), dmax = parseFloat($("#pg-dmax").value), dstep = parseFloat($("#pg-dstep").value);
        if (!(dmin >= 0) || !(dmax > dmin) || !(dstep > 0)) { await PT.alert("Dumbbells: the heaviest must be more than the lightest, and the step must be above 0."); return; }
        g.name = name; g["bar" + sfx] = bar; g["plates" + sfx] = plates.slice().sort((x, y) => y - x);
        g.db = g.db || {}; g.db[u] = { min: dmin, max: dmax, step: dstep };
        g.equip = {}; EQUIP.forEach(([k]) => { if (!eq[k]) g.equip[k] = false; });
        ensureGyms(a);
        const list = gymList(a);
        if (existing) { const i = list.findIndex(x => x.id === g.id); list[i] = g; a.settings.gyms = list; }
        else { list.push(g); a.settings.gyms = list; }
        const isActive = realGym(a) && realGym(a).id === g.id;
        if (isActive) applyToTop(a, g);
        save(a); K.closeSheet(el);
        if (!existing) activate(a, g.id);
        a.refreshWorkoutIfOpen(); chip(a); renderBoxes(a);
        a.toast(existing ? "Gym saved" : `Training at ${g.name}`);
      }
    });
  }
  async function addGym() {
    const a = A();
    const labels = TEMPLATES.map(t => t.label).concat(["Start from my current gym"]);
    const i = await PT.choose("Add a gym", labels, { title: "Add a gym", body: "Pick a starting point. You can change everything after.", cancel: "Cancel" });
    if (i === -1 || i == null) return;
    if (i === TEMPLATES.length) {
      ensureGyms(a); syncOut(a);
      const cur = realGym(a);
      openEdit(null, { label: "Another gym", db: cur && cur.db || DB_DEF, off: EQUIP.filter(([k]) => cur && cur.equip && cur.equip[k] === false).map(([k]) => k) });
    } else openEdit(null, TEMPLATES[i]);
  }
  function openManager() {
    const a = A(), K = PT.kit, el = K.sheet("pt-gmg", 64);
    const draw = () => {
      ensureGyms(a); syncOut(a);
      const cur = realGym(a);
      const card = K.openSheet(el, `${K.head("Your gyms", "Each one has its own bar, plates, dumbbells and equipment.")}
        <div class="space-y-2">${gymList(a).map(g => `<div class="rounded-xl border px-3.5 py-3 ${g.id === cur.id ? "border-emerald-600 bg-emerald-950/30" : "border-zinc-800 bg-zinc-950"}">
          <div class="flex items-center justify-between gap-2"><span class="text-sm font-bold text-white truncate">${esc(g.name)}</span>
            <span class="flex gap-1.5 shrink-0">${g.id === cur.id ? '<span class="text-[10px] font-black uppercase tracking-wider text-emerald-400 self-center">Active</span>' : `<button type="button" data-use="${esc(g.id)}" class="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-100 text-[11px] font-bold tap-active">Use</button>`}
            <button type="button" data-ed="${esc(g.id)}" class="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-100 text-[11px] font-bold tap-active">Edit</button></span></div>
          <span class="block text-[11px] text-zinc-400 mt-0.5">${esc(gymSummary(a, g))}</span></div>`).join("")}</div>
        <button type="button" data-add="1" class="w-full py-2.5 rounded-xl border-2 border-dashed border-emerald-700/70 text-emerald-400 text-xs font-bold tap-active">＋ Add a gym</button>`);
      card.addEventListener("click", async e => {
        const u = e.target.closest("[data-use]"), ed = e.target.closest("[data-ed]");
        if (u) { activate(a, u.dataset.use); draw(); return; }
        if (ed) { el.__onClose = null; K.closeSheet(el); openEdit(ed.dataset.ed); return; }
        if (e.target.closest("[data-add]")) { K.closeSheet(el); addGym(); }
      });
    };
    draw();
  }
  PT.openGyms = openManager;

  /* the swap list and the picker only show what the active gym can do */
  const oOpenSel = proto.openExerciseSelector;
  proto.openExerciseSelector = function () { PT._gymOff = false; return oOpenSel.apply(this, arguments); };
  const oList = proto.renderExerciseList;
  proto.renderExerciseList = function () {
    const r = oList.apply(this, arguments);
    try {
      const a = this, g = realGym(a), box = a.dom.exListContainer;
      if (g && g.equip && !(PT._gymOff && pickerOpen()) && box) {
        const db = (typeof EXERCISE_DATABASE !== "undefined" && Array.isArray(EXERCISE_DATABASE)) ? EXERCISE_DATABASE : [];
        const hidden = db.filter(e => !PT.gymAllows(e.name)).length;
        box.querySelectorAll("[data-pt-gymbar]").forEach(n => n.remove());
        if (hidden) {
          const bar = document.createElement("div");
          bar.dataset.ptGymbar = "1";
          bar.className = "flex items-center justify-between gap-3 px-4 py-2 text-[11px] text-zinc-400 border-b border-zinc-800/60";
          bar.innerHTML = `<span>Leaving out ${hidden} exercises that need ${esc(lacking(g).join(", "))} (${esc(g.name)})</span><button type="button" class="shrink-0 font-bold text-emerald-400 tap-active">Show all</button>`;
          bar.querySelector("button").addEventListener("click", () => { PT._gymOff = true; a.renderExerciseList(a.dom.exSearchInput.value); });
          const first = box.firstElementChild;
          if (first) first.after(bar); else box.prepend(bar);
        }
      }
    } catch (e) { console.error("PulseTrack gym filter", e); }
    return r;
  };
  // a workout card whose exercise this gym can't do
  const oExtras = proto.workoutCardExtrasHtml;
  proto.workoutCardExtrasHtml = function (ex, i) {
    let html = oExtras.apply(this, arguments);
    try {
      const g = realGym(this);
      if (g && g.equip && ex && ex.name && !PT.gymAllows(ex.name)) {
        const k = PT.equipKey(ex.name), lbl = (EQUIP.find(x => x[0] === k) || [k, k])[1].toLowerCase();
        html += `<p class="pt-tip-line pt-tip-warn">No ${esc(lbl)} at ${esc(g.name)}. <button type="button" class="pt-gym-swap font-extrabold underline tap-active" data-exindex="${i}">Find a swap</button></p>`;
      }
    } catch (e) { }
    return html;
  };
  document.addEventListener("click", e => {
    const b = e.target.closest && e.target.closest(".pt-gym-swap"); if (!b) return;
    const a = A(); if (a) a.openExerciseSelector("swap", parseInt(b.dataset.exindex, 10));
  });
  const oWk = proto.renderWorkoutView;
  proto.renderWorkoutView = function () { const r = oWk.apply(this, arguments); try { chip(this); } catch (e) { } return r; };

  /* ============================================================ streak rules */
  const timeOff = a => (Array.isArray(a.settings.timeOff) ? a.settings.timeOff : []).filter(o => o && o.from && o.to && o.from <= o.to);
  const offOn = (a, ds) => timeOff(a).find(o => o.from <= ds && ds <= o.to) || null;
  const offInWeek = (a, ws) => { let n = 0; for (let i = 0; i < 7; i++) if (offOn(a, PT.ds(addDays(ws, i)))) n++; return n; };
  const cardioDates = () => { try { return PT.cardio ? PT.cardio.data().logs.map(l => l.date) : []; } catch (e) { return []; } };
  PT.timeOffOn = ds => { const a = A(); return a ? offOn(a, ds) : null; };

  proto.renderStreak = function (monthActive) {
    const a = this, goal = parseInt(a.settings.weeklyGoal, 10) || 3, withCardio = !!a.settings.cardioStreak;
    const dates = new Set(a.trainingDates());
    if (withCardio) cardioDates().forEach(d => dates.add(d));
    const perWeek = {};
    let first = null;
    dates.forEach(ds => {
      const d = PT.fromDs(ds); if (isNaN(d)) return;
      const k = PT.ds(PT.weekStart(d));
      perWeek[k] = (perWeek[k] || 0) + 1;
      if (!first || k < first) first = k;
    });
    timeOff(a).forEach(o => { const k = PT.ds(PT.weekStart(PT.fromDs(o.from))); if (!first || k < first) first = k; });
    const need = k => Math.max(0, goal - offInWeek(a, PT.fromDs(k)));
    const thisWeek = PT.weekStart(new Date()), thisKey = PT.ds(thisWeek);
    const thisCount = perWeek[thisKey] || 0, thisNeed = need(thisKey);
    let streak = 0;
    const cursor = new Date(thisWeek);
    if (thisCount < thisNeed) cursor.setDate(cursor.getDate() - 7);        // this week is still in progress
    for (let guard = 0; guard < 700; guard++) {
      const k = PT.ds(cursor);
      if (!first || k < first) break;
      const n = need(k);
      if (n === 0) { cursor.setDate(cursor.getDate() - 7); continue; }     // a week off: it neither counts nor breaks the streak
      if ((perWeek[k] || 0) >= n) { streak++; cursor.setDate(cursor.getDate() - 7); } else break;
    }
    if (monthActive === undefined || withCardio) {
      const now = new Date(), prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-`;
      monthActive = [...dates].filter(d => d.startsWith(prefix)).length;
    }
    const title = document.getElementById("home-streak-title");
    if (title) title.innerText = streak ? `${streak}-week streak` : "Consistency";
    if (a.dom.homeMonthlyStreak) {
      const off = offInWeek(a, thisWeek), today = offOn(a, PT.ds());
      const what = withCardio ? "active days" : "workouts";
      let t = thisNeed === 0 ? `Time off this week. Your streak is safe.` : `${thisCount}/${thisNeed} ${what} this week${off ? ` (${off} day${off > 1 ? "s" : ""} off)` : ""}`;
      t += ` · ${monthActive} active days this month`;
      if (today) t += ` · ${today.kind === "sick" ? "🤒 sick day" : "🏝 trip"}: streak is safe`;
      a.dom.homeMonthlyStreak.innerText = t;
    }
    return { streak, thisCount, goal: thisNeed || goal };
  };

  async function openTimeOff(kind, startDs) {
    const a = A(), K = PT.kit, el = K.sheet("pt-off", 66), today = PT.ds();
    let kd = kind === "sick" ? "sick" : "trip";
    const card = K.openSheet(el, `${K.head("Time off", "Days that don't count against your streak.")}
      <div class="grid grid-cols-2 gap-2"><button type="button" data-k="sick" class="pt-opt tap-active" aria-pressed="${kd === "sick"}">🤒 Sick</button><button type="button" data-k="trip" class="pt-opt tap-active" aria-pressed="${kd === "trip"}">🏝 Trip or rest</button></div>
      <div class="grid grid-cols-2 gap-2">
        <label class="block">${K.lab("From")}<input id="po-from" type="date" value="${esc(startDs || today)}" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"></label>
        <label class="block">${K.lab("To")}<input id="po-to" type="date" value="${esc(startDs || today)}" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"></label></div>
      <p class="text-[11px] text-zinc-500">Each day off lowers that week's workout goal by one. A week with enough days off is skipped, so it neither adds to nor breaks your streak.</p>
      <button type="button" id="po-save" class="w-full py-3 rounded-xl bg-emerald-600 text-white text-sm font-extrabold tap-active">Add</button>`);
    card.addEventListener("click", async e => {
      const k = e.target.closest("[data-k]");
      if (k) { kd = k.dataset.k; card.querySelectorAll("[data-k]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.k === kd))); return; }
      if (!e.target.closest("#po-save")) return;
      const from = card.querySelector("#po-from").value, to = card.querySelector("#po-to").value || from;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to) || to < from) { await PT.alert("Pick a start date, and an end date that is the same day or later."); return; }
      const days = (PT.fromDs(to) - PT.fromDs(from)) / 86400000;
      if (days > 120) { await PT.alert("That's a long time off. Add it in pieces of up to 4 months."); return; }
      const list = timeOff(a).slice(); list.push({ id: PT.uid(), kind: kd, from, to });
      a.settings.timeOff = list.slice(-200); save(a); K.closeSheet(el);
      a.renderStreak(); renderBoxes(a); a.renderHomeView();
      a.toast(kd === "sick" ? "Get well soon. Your streak is safe." : "Time off added. Your streak is safe.");
    });
  }

  /* ============================================================ the Settings boxes */
  function fmtOff(o) {
    const f = ds => PT.fmtDate(ds, { month: "short", day: "numeric" });
    return `${o.kind === "sick" ? "🤒 Sick" : "🏝 Trip"} · ${o.from === o.to ? f(o.from) : f(o.from) + " – " + f(o.to)}`;
  }
  function renderBoxes(a) {
    a = a || A(); if (!a) return;
    const O = PT.opt, ws = document.getElementById("pt-wscreen");
    if (ws) {
      const t = (k, title, sub) => ROW(title, sub, SW(`data-opt="${k}"`, O(k)));
      ws.innerHTML = t("nextHint", "Suggested weight", "Shows what you did last time and what to try next, with a button that fills it in.")
        + t("autoPrefill", "Pre-fill the whole workout", "The first time you open a day each week, every set gets the suggested weight and reps. A \"Fill in suggested weights\" button is also at the top of the workout. Nothing is checked off for you, and you can change any number.")
        + t("autoFill", "Fill in the next set", "When you check off a set, the next empty set gets the same weight and reps.")
        + t("timerFirstSet", "Timer starts on your first set", "The workout timer waits until you log a set instead of starting when you open the day.")
        + t("finishReview", "Look over before saving", "A short screen with time, volume compared to last time, and new records. Turned off, you still get a quick \"Finish workout?\" question.")
        + `<div class="p-3.5 space-y-2"><span class="text-xs font-bold text-white block">On each set row</span>`
        + `<div class="flex flex-wrap gap-1.5">${[["colPrev", "Last time"], ["colTag", "Warm-up / drop tag"], ["col1rm", "Est. 1RM"]].map(([k, l]) => `<button type="button" data-optb="${k}" aria-pressed="${O(k)}" class="pt-opt tap-active">${l}</button>`).join("")}</div>`
        + `<span class="text-[11px] text-zinc-400 block">Pick what shows on every set. Weight, reps and the check button always show.</span></div>`
        + t("lefty", "Left-hand mode", "Moves the check button and the + Set / − Set buttons to the left, where a left thumb reaches.")
        + t("workEase", "Go easier after heavy work days", "When you mark work as Heavy on Home, lifts for your back, legs and grip keep their weight today instead of suggesting more, and Build me a workout goes lighter.");
    }
    const gb = document.getElementById("pt-gyms-box");
    if (gb) {
      ensureGymsView(a);
      const cur = realGym(a), list = gymList(a);
      gb.innerHTML = `<div class="p-3.5 space-y-2.5"><p class="text-[11px] text-zinc-400 leading-relaxed">Each gym has its own bar, plates, dumbbells and equipment. The exercise picker and swap ideas leave out what the active gym can't do.</p>
        <div class="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2.5"><span class="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Training at</span><span class="text-sm font-bold text-white">${esc(cur ? cur.name : "My gym")}</span><span class="block text-[11px] text-zinc-400">${esc(cur ? gymSummary(a, cur) : "Bar and plates are in the settings above")}</span></div>
        <div class="grid grid-cols-2 gap-2"><button type="button" id="pt-gyms-open" class="py-2.5 rounded-xl bg-zinc-800 text-zinc-100 text-xs font-bold tap-active">${list.length > 1 ? "Switch or edit gyms" : "Edit this gym"}</button><button type="button" id="pt-gyms-add" class="py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold tap-active">＋ Add a gym</button></div></div>`;
    }
    const sb = document.getElementById("pt-streak-box");
    if (sb) {
      const offs = timeOff(a).slice().sort((x, y) => (x.from < y.from ? 1 : -1));
      sb.innerHTML = ROW("Count cardio toward my weekly goal", "Off by default. When on, a day with a Cardio &amp; Sports session counts as an active day for your streak and weekly goal.", SW('data-streak="cardio"', !!a.settings.cardioStreak))
        + `<div class="p-3.5 space-y-2.5"><span class="text-xs font-bold text-white block">Sick and trip days</span>
        <span class="text-[11px] text-zinc-400 block">Days off don't break your streak. Each one lowers that week's goal by one, and a week off is skipped.</span>
        <div class="grid grid-cols-2 gap-2"><button type="button" id="pt-off-sick" class="py-2.5 rounded-xl bg-zinc-800 text-zinc-100 text-xs font-bold tap-active">🤒 I'm sick today</button><button type="button" id="pt-off-trip" class="py-2.5 rounded-xl bg-zinc-800 text-zinc-100 text-xs font-bold tap-active">🏝 Add a trip</button></div>
        ${offs.length ? `<div class="space-y-1">${offs.slice(0, 8).map(o => `<div class="flex items-center justify-between gap-2 rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2"><span class="text-xs text-zinc-200">${esc(fmtOff(o))}</span><button type="button" data-rmoff="${esc(o.id)}" aria-label="Remove" class="px-2 text-zinc-500 text-base tap-active">✕</button></div>`).join("")}${offs.length > 8 ? `<span class="text-[10px] text-zinc-500 block">${offs.length - 8} older ones are kept.</span>` : ""}</div>` : ""}</div>`;
    }
  }
  const ensureGymsView = a => { /* a view only: gyms are created the first time one is edited */ };

  document.addEventListener("click", e => {
    const a = A(); if (!a) return;
    const t = e.target;
    if (!t.closest) return;
    const ob = t.closest("[data-optb]");
    if (ob) { const k = ob.dataset.optb; PT.setOpt(k, !PT.opt(k)); ob.setAttribute("aria-pressed", String(PT.opt(k))); PT.refreshRows(); return; }
    if (t.closest("#pt-gyms-open")) { openManager(); return; }
    if (t.closest("#pt-gyms-add")) { ensureGyms(a); syncOut(a); save(a); addGym(); return; }
    if (t.closest("#pt-off-sick")) {
      const o = timeOff(a).find(x => x.kind === "sick" && x.from <= PT.ds() && x.to >= PT.ds());
      if (o) { a.toast("Today is already a sick day"); return; }
      const y = PT.ds(addDays(new Date(), -1)), ext = timeOff(a).find(x => x.kind === "sick" && x.to === y);
      if (ext) { ext.to = PT.ds(); save(a); } else { const l = timeOff(a).slice(); l.push({ id: PT.uid(), kind: "sick", from: PT.ds(), to: PT.ds() }); a.settings.timeOff = l; save(a); }
      a.renderStreak(); renderBoxes(a); a.renderHomeView(); a.toast("Get well soon. Your streak is safe.");
      return;
    }
    if (t.closest("#pt-off-trip")) { openTimeOff("trip"); return; }
    const rm = t.closest("[data-rmoff]");
    if (rm) { a.settings.timeOff = timeOff(a).filter(o => o.id !== rm.dataset.rmoff); save(a); a.renderStreak(); renderBoxes(a); a.renderHomeView(); return; }
  });
  document.addEventListener("change", e => {
    const a = A(); if (!a) return;
    const o = e.target.closest && e.target.closest("[data-opt]");
    if (o) { PT.setOpt(o.dataset.opt, o.checked); PT.refreshRows(); return; }
    const s = e.target.closest && e.target.closest('[data-streak="cardio"]');
    if (s) { a.settings.cardioStreak = s.checked; save(a); a.renderStreak(); a.renderHomeView(); }
  });
  const oOpenSettings = proto.openSettings;
  proto.openSettings = function () {
    const r = oOpenSettings.apply(this, arguments);
    try { renderBoxes(this); } catch (e) { console.error("PulseTrack 2.8 settings", e); }
    return r;
  };

  /* ============================================================ Home cards */
  const SLIM = "bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3";
  const rel = ds => {
    const d = Math.round((PT.fromDs(PT.ds()) - PT.fromDs(ds)) / 86400000);
    return d <= 0 ? "today" : d === 1 ? "yesterday" : d < 14 ? d + " days ago" : d < 60 ? Math.round(d / 7) + " weeks ago" : PT.fmtDate(ds, { month: "short", day: "numeric" });
  };
  function weekCard(a) {
    const box = document.getElementById("home-week"); if (!box) return;
    const ws = PT.weekStart(new Date()), today = PT.ds();
    const lift = a.trainingDates(), cardio = new Set(cardioDates());
    let nl = 0, nc = 0, html = "";
    const showCardio = cardio.size > 0;     // no cardio dot (and no key) until you have logged some
    for (let i = 0; i < 7; i++) {
      const d = addDays(ws, i), ds = PT.ds(d), L = lift.has(ds), C = cardio.has(ds), off = offOn(a, ds);
      if (L) nl++; if (C) nc++;
      const cls = ["pt-wd tap-active"]; if (ds === today) cls.push("pt-today"); if (ds > today) cls.push("pt-future"); if (off) cls.push("pt-off");
      html += `<button type="button" class="${cls.join(" ")}" data-ds="${ds}" aria-label="${esc(PT.fmtDate(ds, { weekday: "long", month: "short", day: "numeric" }))}${L ? ", lifting" : ""}${C ? ", cardio" : ""}${off ? ", " + (off.kind === "sick" ? "sick day" : "trip") : ""}">
        <span class="pt-wl">${esc(d.toLocaleDateString(undefined, { weekday: "short" }))}</span><span class="pt-wn">${d.getDate()}</span>
        <span class="pt-dots">${off ? `<span class="pt-offmark">${off.kind === "sick" ? "🤒" : "🏝"}</span>` : `<span class="pt-dot pt-lift ${L ? "on" : ""}"></span>${showCardio ? `<span class="pt-dot pt-card ${C ? "on" : ""}"></span>` : ""}`}</span></button>`;
    }
    const goal = parseInt(a.settings.weeklyGoal, 10) || 3;
    box.className = SLIM + " space-y-2.5";
    box.innerHTML = `<div class="flex items-center justify-between gap-2"><h4 class="pt-eyebrow">This week</h4>
      <span class="text-[11px] text-zinc-400">${nl} of ${goal} workouts${nc ? ` · ${nc} cardio day${nc > 1 ? "s" : ""}` : ""}</span></div>
      <div class="pt-wk">${html}</div>
      ${showCardio ? `<div class="flex items-center gap-3 text-[10px] text-zinc-500"><span class="flex items-center gap-1"><i class="pt-dot pt-lift on"></i>Lifting</span><span class="flex items-center gap-1"><i class="pt-dot pt-card on"></i>Cardio</span></div>` : ""}`;
  }
  function recapCard(a) {
    const box = document.getElementById("home-recap"); if (!box) return;
    const s = (a.sessions || []).slice().sort((x, y) => (y.ts || 0) - (x.ts || 0))[0];
    if (!s) { box.className = "hidden"; box.innerHTML = ""; return; }
    const u = s.unit === "kg" ? "kg" : "lbs", np = (s.prs || []).length;
    box.className = SLIM + " tap-active cursor-pointer";
    box.setAttribute("role", "button"); box.dataset.id = s.id;
    box.innerHTML = `<div class="flex items-center gap-3"><div class="min-w-0 flex-1">
      <span class="pt-eyebrow">Last workout · ${esc(rel(s.date))}</span>
      <span class="block text-sm font-bold text-white truncate mt-0.5">${esc(s.dtitle || "Workout")}</span>
      <span class="block text-[11px] text-zinc-400 mt-0.5">${esc(PT.fmtDur(s.dur))} · ${s.sets} set${s.sets === 1 ? "" : "s"} · ${Math.round(s.vol || 0).toLocaleString()} ${u}${np ? ` · ${np} PR${np > 1 ? "s" : ""}` : ""}</span></div><span class="pt-chev" aria-hidden="true">›</span></div>`;
  }
  /** this month's new records, newest first: [{name, v, date}] */
  function prList(a) {
    const now = new Date(), prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-`;
    const best = new Map();
    (a.sessions || []).filter(s => String(s.date).startsWith(prefix)).forEach(s => (s.prs || []).forEach(n => {
      const e = (s.ex || []).find(x => x.name === n); if (!e) return;
      const v = Math.max(0, ...(e.sets || []).filter(st => st.t !== "W").map(st => a.setE1rm(n, st, s.date)));
      const cur = best.get(n);
      if (!cur || v > cur.v) best.set(n, { name: n, v, date: s.date });
    }));
    return [...best.values()].sort((x, y) => (y.date < x.date ? -1 : y.date > x.date ? 1 : y.v - x.v));
  }
  // PRs this month: one quiet row (nothing at all when there are none); tap for the list
  function prCard(a) {
    const box = document.getElementById("home-prmonth"); if (!box) return;
    const list = (a.sessions || []).length ? prList(a) : [];
    if (!list.length) { box.className = "hidden"; box.innerHTML = ""; box.removeAttribute("role"); return; }
    const names = list.slice(0, 2).map(p => p.name).join(", ") + (list.length > 2 ? ` +${list.length - 2} more` : "");
    box.className = SLIM + " tap-active cursor-pointer";
    box.setAttribute("role", "button");
    box.innerHTML = `<div class="flex items-center gap-3"><div class="min-w-0 flex-1">
      <span class="pt-eyebrow">PRs this month · ${list.length} new</span>
      <span class="block text-xs text-zinc-300 truncate mt-0.5">${esc(names)}</span></div><span class="pt-chev" aria-hidden="true">›</span></div>`;
  }
  function openPrList() {
    const a = A(), K = PT.kit, list = prList(a), u = a.wLabel(), el = K.sheet("pt-prm", 66);
    const card = K.openSheet(el, `${K.head("PRs this month", "New best estimated one-rep maxes.")}
      <div class="space-y-1.5">${list.length ? list.map(p => `<button type="button" data-pr="${esc(p.name)}" class="w-full flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-left tap-active"><span class="min-w-0"><span class="block text-sm font-bold text-white truncate">${esc(p.name)}</span><span class="block text-[11px] text-zinc-500">${esc(PT.fmtDate(p.date, { weekday: "short", month: "short", day: "numeric" }))}</span></span><span class="font-mono text-sm text-zinc-200 shrink-0">${esc(num(p.v, 0))} ${u}</span></button>`).join("") : `<p class="text-xs text-zinc-400">No new records yet this month.</p>`}</div>`);
    card.addEventListener("click", e => {
      const b = e.target.closest("[data-pr]"); if (!b) return;
      const back = () => openPrList(); back.ptLabel = "Back to PRs";
      K.closeSheet(el); a.openExerciseSheet(b.dataset.pr, back);
    });
  }
  const oHome = proto.renderHomeView;
  proto.renderHomeView = function () {
    const r = oHome.apply(this, arguments);
    try { weekCard(this); recapCard(this); prCard(this); } catch (e) { console.error("PulseTrack Home cards", e); }
    return r;
  };
  document.addEventListener("click", e => {
    const a = A(); if (!a || !e.target.closest) return;
    const wd = e.target.closest("#home-week .pt-wd");
    if (wd) {
      const ds = wd.dataset.ds;
      if (a.sessions.some(s => s.date === ds)) { a.openHistoryForDate(ds); return; }
      if (cardioDates().includes(ds)) { a.showView("cardio"); return; }
      const off = offOn(a, ds); if (off) { a.toast(off.kind === "sick" ? "Sick day. Your streak is safe." : "Trip day. Your streak is safe."); }
      return;
    }
    const rc = e.target.closest("#home-recap");
    if (rc && rc.dataset.id) { a.openSessionSheet(rc.dataset.id); return; }
    if (e.target.closest("#home-prmonth")) openPrList();
  });
})();
  