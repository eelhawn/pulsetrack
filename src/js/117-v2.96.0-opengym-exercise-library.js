/* =====================================================================
 * PulseTrack 2.96.0: the openGym exercise library, 5,520 more exercises in the picker.
 *  opengym-exercises.js (built by tools/opengym_import.py from openGym's catalogue, AGPL-3.0, see NOTICE.md) is loaded in the background
 *  after the app has started, so opening the app is not slower. Text only: name, muscle, equipment, what it is, and the steps (they show
 *  under Form tips). No pictures.
 *  - Searching in the exercise picker also searches the openGym library: its matches come after PulseTrack's own, under their own heading.
 *  - A last chip, "openGym", lists the whole library by body part, 100 at a time.
 *  - Picking one makes it a normal PulseTrack exercise from then on: it joins the list (with its muscle, so Similar exercises, the muscle
 *    map and records work), and it is remembered because it is in your workout, program or history. Nothing else changes until you pick one.
 *  - PulseTrack's own exercises (and their other names) win: the 98 openGym exercises it already had are not in the file.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  const proto = ApplicationUI.prototype;
  const CHIP = "openGym", PAGE = 100, SEARCH_CAP = 60;
  const DBA = () => (typeof EXERCISE_DATABASE !== "undefined" && Array.isArray(EXERCISE_DATABASE)) ? EXERCISE_DATABASE : null;
  const lower = s => String(s || "").toLowerCase();
  let OG = null, BY = null, loading = null;

  const list = () => OG || [];
  function ready(arr) {
    OG = arr.filter(e => e && e.name);
    BY = new Map(); OG.forEach(e => BY.set(lower(e.name), e));
    promoteUsed(window.app);
    document.dispatchEvent(new Event("pt-opengym-ready"));
  }
  function load() {
    if (OG) return Promise.resolve(OG);
    if (loading) return loading;
    loading = new Promise(res => {
      if (typeof OPENGYM_EXERCISES !== "undefined" && Array.isArray(OPENGYM_EXERCISES)) { ready(OPENGYM_EXERCISES); res(OG); return; }
      const s = document.createElement("script");
      s.src = "./opengym-exercises.js"; s.async = true;
      s.onload = () => { try { ready(typeof OPENGYM_EXERCISES !== "undefined" && Array.isArray(OPENGYM_EXERCISES) ? OPENGYM_EXERCISES : []); } catch (e) { console.error("PulseTrack openGym", e); OG = OG || []; } res(OG); };
      s.onerror = () => { OG = OG || []; loading = null; res(OG); };   // offline and never saved: try again next time
      document.head.appendChild(s);
    });
    return loading;
  }

  /** an openGym exercise not in the list yet (nor something the list already calls the same) */
  const inDb = name => { const d = DBA() || []; const l = lower(name); return d.some(e => e && lower(e.name) === l) || !!(PT.exCanon && PT.exCanon(name)); };
  function promote(e) {
    const d = DBA(); if (!d || !e || d.some(x => x && lower(x.name) === lower(e.name))) return false;
    const o = { name: e.name, category: e.category, muscle: e.muscle, og: e.og, eq: e.eq };
    if (e.needs) o.needs = e.needs.slice();
    if (e.desc) o.desc = e.desc;
    if (e.tips) o.tips = e.tips.slice();
    if (e.hold) o.hold = 1;
    d.push(o);
    PT._catMap = null; PT._bwList = null;
    return true;
  }
  /** every exercise name the app has a use for: workout days, programs, history, last-time weights */
  function usedNames(a) {
    const s = new Set();
    if (!a) return s;
    try { ((a.data && a.data.programs) || []).forEach(p => (p.days || []).forEach(d => (d.exercises || []).forEach(x => x && s.add(lower(x.name))))); } catch (e) { }
    try { (a.sessions || []).forEach(x => (x.ex || []).forEach(e => e && s.add(lower(e.name)))); } catch (e) { }
    try { Object.keys(a.lastPerf || {}).forEach(n => s.add(lower(n))); } catch (e) { }
    return s;
  }
  function promoteUsed(a) {
    if (!BY || !a) return 0;
    let n = 0;
    usedNames(a).forEach(l => { const e = BY.get(l); if (e && promote(e)) n++; });
    return n;
  }

  /* ---------------------------------------------------------------- the picker */
  const icon = swap => swap
    ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4M16 17H4m0 0l4-4m-4 4l4 4"/>'
    : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 5v14m7-7H5"/>';
  function row(app, e, swap) {
    const b = document.createElement("button");
    b.className = "w-full flex items-center gap-3 px-4 min-h-[52px] py-2 border-b border-zinc-800/60 border-l-2 border-l-transparent text-left tap-active transition";
    b.dataset.og = e.og;
    b.innerHTML = `<span class="flex-grow min-w-0"><span class="block text-sm font-semibold text-zinc-100 leading-snug">${app.esc(e.name)}</span><span class="block text-[11px] text-zinc-500 mt-0.5 truncate">${app.esc(e.muscle)} · ${app.esc(e.eq)}</span></span>
      <svg class="w-4 h-4 shrink-0 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">${icon(swap)}</svg>`;
    b.addEventListener("click", () => { promote(e); app.handleExerciseSelection(e.name, b); });
    return b;
  }
  const head = (txt, n, note) => {
    const h = document.createElement("div");
    h.className = "sticky top-0 z-10 px-4 py-1.5 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 flex items-center justify-between gap-2";
    h.innerHTML = `<span class="text-[11px] font-black uppercase tracking-widest text-emerald-400 truncate">${txt}</span><span class="text-[10px] font-bold text-zinc-500 shrink-0">${n}${note ? " · " + note : ""}</span>`;
    return h;
  };
  function moreBtn(label, fn) {
    const b = document.createElement("button");
    b.className = "pt-og-more w-full py-3 text-xs font-bold text-emerald-400 border-b border-zinc-800/60 tap-active";
    b.textContent = label; b.addEventListener("click", fn);
    return b;
  }
  const credit = () => {
    const p = document.createElement("p");
    p.className = "pt-og-credit px-4 py-3 text-[10px] text-zinc-500 leading-snug";
    p.textContent = "Exercises from openGym (github.com/DuarteSantos8/openGym), AGPL-3.0. Text only, no pictures.";
    return p;
  };
  const matchesOf = (q, swap) => {
    const allow = e => (!PT.gymAllows || PT.gymAllows(e.name)) && (!PT.eqAllows || PT.eqAllows(e));
    const m = list().filter(e => !inDb(e.name) && allow(e) && (!q || PT.exMatch(e, q)));
    if (q) m.sort((a, b) => PT.exRank(a, q) - PT.exRank(b, q) || a.name.localeCompare(b.name));
    return m;
  };

  const oRender = proto.renderExerciseList;
  proto.renderExerciseList = function (query) {
    const r = oRender.apply(this, arguments);
    try {
      const q = String(query || "").trim(), swap = !!(this.exerciseModalTarget && this.exerciseModalTarget.action === "swap");
      const chips = this.dom.exChips, box = this.dom.exListContainer;
      if (!chips || !box) return r;
      if (!OG) { load().then(() => { if (!this.dom.modalExSelector.classList.contains("hidden")) this.renderExerciseList(this.dom.exSearchInput.value); }); return r; }
      const all = matchesOf(q, swap);
      try { const n = (DBA() || []).length + list().filter(e => !inDb(e.name)).length; this.dom.exSearchInput.placeholder = `Search ${n.toLocaleString()} exercises...`; } catch (e) { }
      if (!all.length && !q) return r;
      // the chip
      const on = !q && this.exCat === CHIP;
      chips.insertAdjacentHTML("beforeend", `<button data-cat="${CHIP}" data-og-chip="1" class="ex-chip shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border tap-active transition whitespace-nowrap ${on ? "bg-emerald-500 border-emerald-500 text-zinc-950" : "bg-zinc-950 border-zinc-800 text-zinc-300"}">${CHIP} <span class="${on ? "text-zinc-800" : "text-zinc-500"} font-semibold">${all.length}</span></button>`);
      const chip = chips.querySelector("[data-og-chip]");
      chip.addEventListener("click", () => { this.exCat = CHIP; this.renderExerciseList(this.dom.exSearchInput.value); });
      if (on) {
        chips.querySelectorAll(".ex-chip.bg-emerald-500:not([data-og-chip])").forEach(b => { b.classList.remove("bg-emerald-500", "border-emerald-500", "text-zinc-950"); b.classList.add("bg-zinc-950", "border-zinc-800", "text-zinc-300"); });
        if (chip.scrollIntoView) chip.scrollIntoView({ inline: "center", block: "nearest" });
        // the whole library, by body part, a page at a time
        box.innerHTML = ""; box.scrollTop = 0;
        const sorted = all.slice().sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
        let shown = 0, cur = "";
        const sec = document.createElement("div"); box.appendChild(sec);
        const page = () => {
          const old = box.querySelector(".pt-og-more"); if (old) old.remove();
          const end = Math.min(sorted.length, shown + PAGE);
          for (; shown < end; shown++) {
            const e = sorted[shown];
            if (e.category !== cur) { cur = e.category; sec.appendChild(head(this.esc(cur), sorted.filter(x => x.category === cur).length)); }
            sec.appendChild(row(this, e, swap));
          }
          if (shown < sorted.length) sec.appendChild(moreBtn(`Show ${Math.min(PAGE, sorted.length - shown)} more (${sorted.length - shown} left)`, page));
          else sec.appendChild(credit());
        };
        page();
        return r;
      }
      if (!q) return r;
      // searching: openGym matches after PulseTrack's own
      const none = box.querySelector("p.text-zinc-500.text-center");
      if (none && /No exercises found/.test(none.textContent)) none.remove();
      const sec = document.createElement("div"); sec.className = "pt-og-results";
      sec.appendChild(head("openGym library", all.length, all.length > SEARCH_CAP ? `first ${SEARCH_CAP}` : ""));
      let shown = 0;
      const more = () => {
        const old = sec.querySelector(".pt-og-more"); if (old) old.remove();
        const end = Math.min(all.length, shown + SEARCH_CAP);
        for (; shown < end; shown++) sec.appendChild(row(this, all[shown], swap));
        if (shown < all.length) sec.appendChild(moreBtn(`Show ${Math.min(SEARCH_CAP, all.length - shown)} more`, more)); else sec.appendChild(credit());
      };
      more();
      box.appendChild(sec);
    } catch (e) { console.error("PulseTrack openGym picker", e); }
    return r;
  };

  /* ---------------------------------------------------------------- Form tips: an openGym exercise shows its own description and steps */
  const made = new WeakMap();
  const oCue = PT.cueFor;
  if (typeof oCue === "function") PT.cueFor = function (name) {
    let e = null;
    try { e = PT.exCanon ? PT.exCanon(String(name || "")) : null; } catch (err) { e = null; }
    if (e && e.og && Array.isArray(e.tips) && e.tips.length && !e.avoid) {
      let c = made.get(e);
      if (!c) { c = { id: "ex:" + e.name, own: true, name: e.name, title: e.category || "This exercise", do: e.tips, avoid: "", desc: e.desc || "", og: 1 }; made.set(e, c); }
      return c;
    }
    return oCue.apply(this, arguments);
  };
  const oHtml = PT.cuesHtml;
  if (typeof oHtml === "function") PT.cuesHtml = function (name) {
    let h = oHtml.apply(this, arguments);
    const c = PT.cueFor(name);
    if (h && c && c.og) h = h.replace(/<p class="text-\[11px\] text-amber-300\/90 leading-snug"><b>Avoid:<\/b>\s*<\/p>/, "").replace("General guidance.", "Steps from the openGym library.");
    return h;
  };

  PT.og = { load, list, promote: name => { const e = BY && BY.get(lower(name)); return e ? promote(e) : false; }, promoteUsed: () => promoteUsed(window.app), get: name => (BY && BY.get(lower(name))) || null };

  const oInit = proto.initExtras;
  proto.initExtras = function () {
    const r = oInit ? oInit.apply(this, arguments) : undefined;
    setTimeout(() => { load(); }, 1500);   // after the app is up
    return r;
  };
})();
