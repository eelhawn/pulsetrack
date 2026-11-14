/* =====================================================================
 * PulseTrack 2.96.0, reworked in 2.100.0: the openGym exercise library, in your exercise list.
 *  opengym-exercises.js (built by tools/opengym_import.py from openGym's catalogue, AGPL-3.0, see NOTICE.md) is loaded in the background
 *  after the app has started, so opening the app is not slower. Text only: name, muscle, equipment, what it is, and the steps. No pictures.
 *  2.100.0: every one of them is a normal exercise in its muscle group (Chest, Back, Legs ...), with Similar exercises, Form tips (its
 *  description and steps), the muscle map and records, like PulseTrack's own. The separate "openGym" chip is gone. The file only has the
 *  useful ones (about 2,900): yoga, pilates, rehab, most stretches, rare kit, drawing variants and household-prop drills are left out.
 *  PulseTrack's own exercises (and their other names) win: an openGym one that is the same exercise is not added.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  const proto = ApplicationUI.prototype;
  const DBA = () => (typeof EXERCISE_DATABASE !== "undefined" && Array.isArray(EXERCISE_DATABASE)) ? EXERCISE_DATABASE : null;
  const lower = s => String(s || "").toLowerCase();
  let OG = null, BY = null, loading = null, merged = 0;

  const list = () => OG || [];
  function entry(e) {
    const o = { name: e.name, category: e.category, muscle: e.muscle, og: e.og, eq: e.eq };
    if (e.needs) o.needs = e.needs.slice();
    if (e.desc) o.desc = e.desc;
    if (e.tips) o.tips = e.tips.slice();
    if (e.hold) o.hold = 1;
    return o;
  }
  /** every openGym exercise joins the list, in its muscle group, unless the list already has it (or something it calls the same) */
  function merge() {
    const d = DBA(); if (!d || !OG) return 0;
    const have = new Set(d.map(x => x && lower(x.name)));
    const add = [];
    OG.forEach(e => {
      const l = lower(e.name); if (have.has(l)) return;
      let same = null; try { same = PT.exCanon ? PT.exCanon(e.name) : null; } catch (err) { same = null; }
      if (same && !same.og) return;   // PulseTrack's own exercise under another spelling
      add.push(entry(e)); have.add(l);
    });
    // in front of your own exercises (they stay last, where My Exercises keeps them)
    const firstCustom = d.findIndex(x => x && x.custom);
    if (firstCustom < 0) d.push(...add); else d.splice(firstCustom, 0, ...add);
    PT._catMap = null; PT._bwList = null;
    merged += add.length;
    return add.length;
  }
  function ready(arr) {
    OG = arr.filter(e => e && e.name);
    BY = new Map(); OG.forEach(e => BY.set(lower(e.name), e));
    merge();
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
  const promote = e => { if (!e) return false; const d = DBA(); if (!d || d.some(x => x && lower(x.name) === lower(e.name))) return false; d.push(entry(e)); PT._catMap = null; return true; };

  /* the picker: opened before the library has loaded, it shows what it has and fills in when the library arrives */
  const oRender = proto.renderExerciseList;
  proto.renderExerciseList = function (query) {
    const r = oRender.apply(this, arguments);
    try {
      const n = (DBA() || []).length; if (this.dom.exSearchInput) this.dom.exSearchInput.placeholder = `Search ${n.toLocaleString()} exercises...`;
      if (!OG) load().then(() => { if (this.dom.modalExSelector && !this.dom.modalExSelector.classList.contains("hidden")) { this.dom.exSearchInput.placeholder = `Search ${(DBA() || []).length.toLocaleString()} exercises...`; this.renderExerciseList(this.dom.exSearchInput.value); } });
    } catch (e) { console.error("PulseTrack openGym picker", e); }
    return r;
  };
  // 2.96.0 had its own chip; a picker left on it goes back to All
  const oOpen = proto.openExerciseSelector;
  proto.openExerciseSelector = function () { if (this.exCat === "openGym") this.exCat = "All"; return oOpen.apply(this, arguments); };

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

  PT.og = { load, list, merged: () => merged, promote: name => { const e = BY && BY.get(lower(name)); return e ? promote(e) : false; }, get: name => (BY && BY.get(lower(name))) || null };

  const oInit = proto.initExtras;
  proto.initExtras = function () {
    const r = oInit ? oInit.apply(this, arguments) : undefined;
    setTimeout(() => { load(); }, 1500);   // after the app is up
    return r;
  };
})();
