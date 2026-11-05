
/* =====================================================================
 * PulseTrack 2.36.0: machine setup notes.
 *  - A short note per exercise and per gym ("seat 4, pin 7, back pad 3") that shows on the exercise card
 *    in your workout and in guided mode. Tap it to change it. Machines, cables and benches get a
 *    "+ Setup" button; any exercise that has a note shows it.
 *  - Notes live in settings.setupNotes = { gymId: { "exercise name": "text" } }, so they are in backups.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  const proto = ApplicationUI.prototype;
  const A = () => window.app;
  const $ = id => document.getElementById(id);
  const esc = s => PT.esc(s);
  const save = () => { try { WorkoutStorage.saveSettings(A().settings); } catch (e) { } };
  /** exercises with a seat, pad, pin or angle to set */
  const ADJUSTABLE = /machine|cable|smith|lever|pulldown|pull-?down|pushdown|push-?down|face pull|crossover|pec deck|pec fly|fly machine|leg press|leg extension|leg curl|hack|seated|incline|decline|preacher|chest[- ]supported|t-bar|assisted|abduct|adduct|calf raise|rear delt|reverse fly|hyperextension|back extension|low row|iso-?lateral|hammer strength/i;
  const norm = n => String(n || "").trim().toLowerCase();
  const MAX = 80;

  function gymKey(a) { return (a.settings && a.settings.gymId) || "default"; }
  function gymName(a, id) { try { const g = (PT.gyms() || []).find(x => x.id === id); return g ? g.name : ""; } catch (e) { return ""; } }
  const store = a => (a.settings.setupNotes && typeof a.settings.setupNotes === "object" ? a.settings.setupNotes : (a.settings.setupNotes = {}));
  PT.setupNote = function (a, name) { a = a || A(); try { const m = (a.settings.setupNotes || {})[gymKey(a)]; return (m && m[norm(name)]) || ""; } catch (e) { return ""; } };
  PT.setSetupNote = function (a, name, text) {
    a = a || A(); const st = store(a), k = gymKey(a), m = st[k] || (st[k] = {}), t = String(text || "").replace(/\s+/g, " ").trim().slice(0, MAX);
    if (t) m[norm(name)] = t; else delete m[norm(name)];
    if (!Object.keys(m).length) delete st[k];
    if (!Object.keys(st).length) delete a.settings.setupNotes;
    save(); return t;
  };
  /** the same exercise's note at your other gyms: [{ gym, text }] */
  function elsewhere(a, name) {
    const out = [], st = a.settings.setupNotes || {}, me = gymKey(a);
    Object.keys(st).forEach(k => { if (k !== me && st[k] && st[k][norm(name)]) out.push({ gym: gymName(a, k) || "Another gym", text: st[k][norm(name)] }); });
    return out;
  }

  /* ---------------------------------------------------------------- on the exercise cards */
  function decorate(a) {
    const list = $("exercises-list") || (a.dom && a.dom.exercisesList); if (!list || !a.activeDay) return;
    list.querySelectorAll("[data-ex-card]").forEach(card => {
      const i = parseInt(card.dataset.exCard, 10), ex = (a.activeDay.exercises || [])[i]; if (!ex) return;
      let row = card.querySelector(".pt-setup-row"); if (row) row.remove();
      if (ex.type === "tabata" || (a.exKind && a.exKind(ex).cardio)) return;
      const note = PT.setupNote(a, ex.name);
      if (!note && !a.settings.setupAll && !ADJUSTABLE.test(ex.name || "")) return;
      row = document.createElement("div"); row.className = "pt-setup-row";
      row.innerHTML = note
        ? `<button type="button" class="pt-setup has" data-su="${i}" aria-label="Machine setup: ${esc(note)}. Tap to change">⚙ <span>${esc(note)}</span></button>`
        : `<button type="button" class="pt-setup" data-su="${i}" aria-label="Add a machine setup note">⚙ <span>＋ Setup</span></button>`;
      const after = card.querySelector(".pt-note-line") || (card.firstElementChild);
      if (after) after.insertAdjacentElement("afterend", row); else card.prepend(row);
    });
  }
  const oRW = proto.renderWorkoutView;
  proto.renderWorkoutView = function () {
    const r = oRW.apply(this, arguments);
    try { decorate(this); } catch (e) { console.error("PulseTrack setup notes", e); }
    return r;
  };

  /* ---------------------------------------------------------------- the editor */
  const PARTS = ["Seat", "Back pad", "Leg pad", "Pin", "Handle", "Grip", "Incline", "Stance"];
  function openEditor(a, i) {
    const ex = (a.activeDay && a.activeDay.exercises || [])[i]; if (!ex) return;
    const cur = PT.setupNote(a, ex.name), els = elsewhere(a, ex.name), many = (PT.gyms() || []).length > 1;
    const body = `<div class="space-y-3">
      <p class="text-xs text-zinc-400 leading-snug">What to set up on <b class="text-zinc-200">${esc(ex.name)}</b>${many ? ` at <b class="text-zinc-200">${esc(gymName(a, gymKey(a)) || "this gym")}</b>` : ""}, so you do not have to guess next time.</p>
      <input id="pt-su-in" type="text" maxlength="${MAX}" value="${esc(cur)}" placeholder="Seat 4, pin 7, back pad 3" autocomplete="off" class="w-full px-3 py-3 bg-zinc-950 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500">
      <div class="flex flex-wrap gap-1.5">${PARTS.map(p => `<button type="button" class="pt-opt tap-active" data-su-add="${esc(p)}">${esc(p)}</button>`).join("")}</div>
      ${els.length ? `<div class="space-y-1.5"><span class="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Your note at other gyms</span>${els.map(o => `<button type="button" class="pt-su-else tap-active" data-su-use="${esc(o.text)}"><span class="text-[11px] text-zinc-400">${esc(o.gym)}</span><b>${esc(o.text)}</b><span class="text-[10px] text-emerald-400">Use</span></button>`).join("")}</div>` : ""}
    </div>`;
    const footer = `<div class="flex gap-2">${cur ? `<button type="button" id="pt-su-clear" class="px-4 py-3 rounded-xl bg-zinc-800 text-zinc-200 font-bold text-sm tap-active">Clear</button>` : ""}<button type="button" id="pt-su-save" class="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm tap-active">Save</button></div>`;
    a.openSheet("Machine setup", ex.name, body, footer);
    SU.i = i; SU.name = ex.name;
    setTimeout(() => { const inp = $("pt-su-in"); if (inp && !cur) inp.focus(); }, 250);
  }
  const SU = { i: -1, name: "" };
  function done(a, text) {
    PT.setSetupNote(a, SU.name, text); a.closeSheet();
    a.toast(text ? "Setup saved" : "Setup cleared");
    try { a.renderWorkoutView(); } catch (e) { }
  }
  document.addEventListener("click", e => {
    const a = A(); if (!a || !e.target.closest) return;
    const b = e.target.closest("[data-su]"); if (b) { openEditor(a, parseInt(b.dataset.su, 10)); return; }
    const add = e.target.closest("[data-su-add]");
    if (add) { const inp = $("pt-su-in"); if (inp) { const v = inp.value.replace(/[\s,]+$/, ""); inp.value = (v ? v + ", " : "") + add.dataset.suAdd + " "; inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); } return; }
    const use = e.target.closest("[data-su-use]"); if (use) { const inp = $("pt-su-in"); if (inp) inp.value = use.dataset.suUse; return; }
    if (e.target.closest("#pt-su-save")) { const inp = $("pt-su-in"); done(a, inp ? inp.value : ""); return; }
    if (e.target.closest("#pt-su-clear")) { done(a, ""); return; }
  });
  document.addEventListener("keydown", e => { if (e.key === "Enter" && e.target && e.target.id === "pt-su-in") { e.preventDefault(); const b = $("pt-su-save"); if (b) b.click(); } });

  /* ---------------------------------------------------------------- Settings */
  function drawSettings() {
    const a = A(); if (!a) return; let box = $("pt-setup-set");
    if (!box) { const ref = $("pt-feel-set") || $("pt-inj-set") || $("pt-sched-set") || $("pt-hiddenex") || $("pt-gym-row") || $("pt-textsize"); if (!ref) return; box = document.createElement("div"); box.id = "pt-setup-set"; box.className = "mt-3"; ref.insertAdjacentElement("afterend", box); }
    const on = !!a.settings.setupAll;
    box.innerHTML = `<span class="block text-xs font-bold text-zinc-100">Machine setup notes</span><span class="block text-[11px] text-zinc-400 mb-1.5">Machines, cables and benches get a + Setup button. Show it on every exercise instead?</span>
      <div class="flex flex-wrap gap-1.5"><button type="button" class="pt-opt tap-active" data-su-all="1" aria-pressed="${on}">Every exercise</button><button type="button" class="pt-opt tap-active" data-su-all="0" aria-pressed="${!on}">Machines only</button></div>`;
  }
  const oEx = proto.renderSettingsExtras;
  proto.renderSettingsExtras = async function () { const r = oEx ? await oEx.apply(this, arguments) : undefined; try { drawSettings(); } catch (e) { console.error("PulseTrack setup settings", e); } return r; };
  document.addEventListener("click", e => {
    const a = A(), b = e.target && e.target.closest && e.target.closest("[data-su-all]"); if (!a || !b) return;
    a.settings.setupAll = b.dataset.suAll === "1"; save(); drawSettings();
  });

  /* ---------------------------------------------------------------- CSS */
  const css = document.createElement("style"); css.id = "pt-v236-setup-css";
  css.textContent = `
    .pt-setup-row { margin: .1rem 0 .35rem; }
    .pt-setup { display: inline-flex; align-items: center; gap: .35rem; max-width: 100%; padding: .3rem .65rem; border-radius: .6rem; font-size: .7rem; font-weight: 700; background: transparent; color: rgb(var(--z500)); border: 1px dashed rgb(var(--z700)); }
    .pt-setup span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .pt-setup.has { background: rgb(var(--z900)); color: rgb(var(--z200)); border: 1px solid rgb(var(--z700)); }
    .pt-su-else { display: flex; align-items: center; justify-content: space-between; gap: .6rem; width: 100%; padding: .55rem .75rem; border-radius: .7rem; background: rgb(var(--z900)); border: 1px solid rgb(var(--z800)); text-align: left; }
    .pt-su-else b { flex: 1; min-width: 0; font-size: .78rem; color: rgb(var(--z100)); }
    body.pt-gym .pt-setup { font-size: .85rem; padding: .45rem .8rem; }
  `;
  document.head.appendChild(css);
})();
  