/* =====================================================================
 * PulseTrack 3.4.0: muscles worked, on the body figure.
 *  - The front and back body figure (module 007) is now 26 muscles instead of 13 groups (PT.MUSCLES). Every shape has its muscle id.
 *  - An exercise's sheet has "Muscles worked": the figure with that exercise's muscles in one colour, strong for the main (primary)
 *    muscles and light for the helping (secondary) ones, untouched muscles left neutral, and a legend. Below it: the equipment
 *    ("Bodyweight, no equipment needed" when there is none), the muscles by name, where the values come from (the studies, or
 *    "estimate"), and "I've checked these".
 *  - The data comes from exercise-guides.js (built-in, keyed by exact exercise name; 6 sample exercises so far). What a person adds on
 *    their phone (for now: that they checked the muscles) is kept in settings.exGuideLocal[name] and laid over it, so an app update
 *    never overwrites it. PT.exGuide(name) gives the two together.
 *  - The colour is the theme's accent, lifted so it shows on the dark figure in every theme, mixed toward the neutral muscle colour by
 *    intensity: PT.muscleFill(0..100).
 *  - The sets-per-muscle map uses the same figure: it still counts and colours sets in the 13 groups, and tapping a muscle now names
 *    it ("Front delts (counted in Shoulders)").
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  const proto = ApplicationUI.prototype, A = () => window.app, esc = s => PT.esc(s), $ = id => document.getElementById(id);

  PT.MUSCLES = [
    ["neck", "Neck", ""], ["traps", "Traps", "traps"], ["front_delts", "Front delts", "shoulders"], ["side_delts", "Side delts", "shoulders"],
    ["rear_delts", "Rear delts", "shoulders"], ["upper_chest", "Upper chest", "chest"], ["chest", "Chest", "chest"], ["serratus", "Serratus", "abs"],
    ["biceps", "Biceps", "biceps"], ["brachialis", "Brachialis", "biceps"], ["triceps", "Triceps", "triceps"], ["forearm_flexors", "Forearm flexors", "forearms"],
    ["forearm_extensors", "Forearm extensors", "forearms"], ["abs", "Abs", "abs"], ["obliques", "Obliques", "abs"], ["lats", "Lats", "back"],
    ["mid_back", "Mid back", "back"], ["lower_back", "Lower back", "lowerback"], ["glutes", "Glutes", "glutes"], ["glute_med", "Glute medius", "glutes"],
    ["hip_flexors", "Hip flexors", "quads"], ["adductors", "Adductors", "quads"], ["quads", "Quads", "quads"], ["hamstrings", "Hamstrings", "hamstrings"],
    ["calves", "Calves", "calves"], ["tibialis", "Shins (tibialis)", "calves"]
  ];
  const LABEL = Object.fromEntries(PT.MUSCLES.map(m => [m[0], m[1]]));
  PT.muscleLabel = id => LABEL[id] || "";

  /* ================================================================ the one-colour scale */
  const NEUTRAL = [52, 52, 59];   // a muscle this exercise doesn't work
  /** the theme's main accent as [r, g, b]: the --a500 colour every theme sets ("r g b"), else PT.accent() ("rgb(r,g,b)" or "#hex") */
  function accentRgb() {
    let v = "";
    try { v = getComputedStyle(document.documentElement).getPropertyValue("--a500").trim(); } catch (e) { }
    if (!v && PT.accent) v = String(PT.accent() || "");
    const n = (v.match(/\d+(\.\d+)?/g) || []).map(Number);
    if (n.length >= 3 && !/^#/.test(v)) return n.slice(0, 3);
    const h = v.replace("#", ""), x = parseInt(h.length === 3 ? h.split("").map(c => c + c).join("") : h, 16);
    return /^#?[0-9a-f]{3,6}$/i.test(v) && isFinite(x) ? [x >> 16 & 255, x >> 8 & 255, x & 255] : [16, 185, 129];
  }
  function rgbHsl([r, g, b]) {
    r /= 255; g /= 255; b /= 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
    if (mx === mn) return [0, 0, l];
    const d = mx - mn, s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn);
    const h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return [h / 6, s, l];
  }
  function hslRgb([h, s, l]) {
    if (!s) return [l, l, l].map(v => Math.round(v * 255));
    const q = l < .5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    const f = t => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < .5 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
    return [f(h + 1 / 3), f(h), f(h - 1 / 3)].map(v => Math.round(v * 255));
  }
  const lum = c => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(c[0]) + .7152 * f(c[1]) + .0722 * f(c[2]); };
  let strongKey = null, strong = null;
  /** the theme's accent, light enough to stand out on the dark figure whatever the theme */
  function strongColor() {
    const rgb = accentRgb(), key = rgb.join(",");
    if (key === strongKey) return strong;
    const [h, s0, l0] = rgbHsl(rgb), s = Math.min(s0, .9);
    let l = Math.max(l0, .6), c = hslRgb([h, s, l]);
    while (lum(c) < .25 && l < .86) { l += .02; c = hslRgb([h, s, l]); }   // deep blues and violets: lighter until they stand out on the figure
    strongKey = key; strong = c;
    return strong;
  }
  /** 0 = not worked (neutral), 1..100 = from light (helping a little) to the full colour (working hardest) */
  PT.muscleFill = v => {
    v = Math.max(0, Math.min(100, +v || 0));
    if (!v) return `rgb(${NEUTRAL.join(" ")})`;
    const t = .3 + .7 * v / 100, s = strongColor();
    return `rgb(${s.map((c, i) => Math.round(NEUTRAL[i] + (c - NEUTRAL[i]) * t)).join(" ")})`;
  };

  /* ================================================================ guide data: built-in + what this phone added */
  const builtin = () => (typeof EXERCISE_GUIDES !== "undefined" && EXERCISE_GUIDES) || {};
  const local = a => (a.settings.exGuideLocal = a.settings.exGuideLocal || {});
  PT.exGuide = name => {
    const a = A(), b = builtin()[name], l = a && a.settings.exGuideLocal && a.settings.exGuideLocal[name];
    if (!b && !l) return null;
    return Object.assign({}, b || {}, l ? { reviewed: !!l.reviewed, reviewedAt: l.reviewedAt || 0, local: l } : {});
  };
  PT.exGuideLocal = (name, patch) => {
    const a = A(); if (!a) return;
    const all = local(a), cur = Object.assign({}, all[name] || {}, patch);
    Object.keys(cur).forEach(k => { if (cur[k] === undefined || cur[k] === null || cur[k] === false) delete cur[k]; });
    if (Object.keys(cur).length) all[name] = cur; else delete all[name];
    try { WorkoutStorage.saveSettings(a.settings); } catch (e) { }
  };

  /* ================================================================ the "Muscles worked" section */
  const capFirst = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  function equipText(g) {
    const it = (g.equipment && g.equipment.items) || [];
    if (!it.length) return "";
    if (it.length === 1 && /^body ?weight$/i.test(it[0])) return "Bodyweight, no equipment needed";
    return capFirst(it.join(", ")) + (g.equipment.setup ? " · " + g.equipment.setup : "");
  }
  function legendHtml() {
    const bar = `linear-gradient(90deg, ${PT.muscleFill(10)}, ${PT.muscleFill(100)})`;
    return `<div class="pt-mw-leg" aria-hidden="true"><span class="pt-mw-sw" style="background:${PT.muscleFill(0)}"></span><span>Not worked</span>
      <span class="pt-mw-bar" style="background:${bar}"></span><span class="pt-mw-ends"><span>Helps</span><span>Works hardest</span></span></div>`;
  }
  function sectionHtml(a, name) {
    const g = PT.exGuide(name);
    let e = null; try { e = (PT.exCanon && PT.exCanon(name)) || (EXERCISE_DATABASE || []).find(x => x && x.name === name) || null; } catch (er) { e = null; }
    const main = e && e.muscle ? e.muscle : "";
    const ms = (g && g.muscles) || [];
    if (!ms.length) {
      return `<details id="ex-muscles" class="pt-mw"><summary><span class="pt-mw-h">Muscles worked</span><span class="pt-mw-s">Not added yet</span><span class="pt-chev">›</span></summary>
        <div class="pt-mw-b"><p class="pt-mw-x">There's no muscle guide for this exercise yet.${main ? ` Its main muscle is ${esc(main.toLowerCase())}.` : ""}</p>
        ${g && equipText(g) ? `<p class="pt-mw-x"><b>Equipment:</b> ${esc(equipText(g))}</p>` : ""}</div></details>`;
    }
    const fine = Object.fromEntries(ms.map(m => [m.muscle_id, m.intensity]));
    const P = ms.filter(m => m.role === "primary"), S = ms.filter(m => m.role !== "primary");
    const chip = m => `<span class="pt-mw-c" data-mw="${esc(m.muscle_id)}"><i style="background:${PT.muscleFill(m.intensity)}"></i>${esc(PT.muscleLabel(m.muscle_id))}${m.source === "estimate" ? '<em title="estimate">est.</em>' : ""}</span>`;
    const src = g.muscle_source || {}, est = ms.filter(m => m.source === "estimate").length;
    const srcLine = src.type === "study"
      ? `From ${src.refs.length} EMG ${src.refs.length === 1 ? "study" : "studies"}${est ? `. ${est === ms.length ? "All" : est} muscle${est === 1 ? " is an estimate" : "s are estimates"} (marked est.)` : ""}.`
      : "Estimate. These values aren't from a study yet.";
    const checked = !!g.reviewed;
    return `<details id="ex-muscles" class="pt-mw" open><summary><span class="pt-mw-h">Muscles worked</span><span class="pt-mw-s">${esc(P.map(m => PT.muscleLabel(m.muscle_id)).join(", "))}</span><span class="pt-chev">›</span></summary>
      <div class="pt-mw-b">
        ${equipText(g) ? `<p class="pt-mw-x"><b>Equipment:</b> ${esc(equipText(g))}</p>` : ""}
        <div class="pt-mw-fig">${a.muscleMapSvg({}, { fine, label: "Muscles " + name + " works" })}</div>
        ${legendHtml()}
        <p class="pt-mw-tap" id="pt-mw-tap" aria-live="polite">Tap a muscle to see its name.</p>
        <div class="pt-mw-g"><span class="pt-mw-k">Main muscles</span><div class="pt-mw-cs">${P.map(chip).join("")}</div></div>
        ${S.length ? `<div class="pt-mw-g"><span class="pt-mw-k">Helping muscles</span><div class="pt-mw-cs">${S.map(chip).join("")}</div></div>` : ""}
        <details class="pt-mw-src"><summary>${esc(srcLine)} <span class="pt-mw-more">Sources</span></summary>
          ${src.note ? `<p class="pt-mw-x">${esc(src.note)}</p>` : ""}
          ${(src.refs || []).length ? `<ol class="pt-mw-refs">${src.refs.map(r => `<li>${esc(r)}</li>`).join("")}</ol>` : ""}
          <p class="pt-mw-x">These are approximations for a typical lifter, not measurements of you.</p></details>
        <label class="pt-mw-chk"><input type="checkbox" id="pt-mw-rev" data-name="${esc(name)}" ${checked ? "checked" : ""}><span>I've checked these muscles${checked && g.reviewedAt ? ` <em>(${esc(PT.fmtDate(PT.ds(new Date(g.reviewedAt)), { month: "short", day: "numeric", year: "numeric" }))})</em>` : ""}</span></label>
      </div></details>`;
  }

  const oEx = proto.openExerciseSheet;
  proto.openExerciseSheet = function (name) {
    const r = oEx.apply(this, arguments);
    try {
      const body = $("sheet-body"); if (!body || $("ex-muscles")) return r;
      const html = sectionHtml(this, name), cues = body.querySelector(".pt-cues");
      if (cues) cues.insertAdjacentHTML("afterend", html);
      else { const first = body.firstElementChild; if (first) first.insertAdjacentHTML("afterend", html); else body.insertAdjacentHTML("afterbegin", html); }
    } catch (e) { console.error("PulseTrack muscles worked", e); }
    return r;
  };

  document.addEventListener("click", e => {
    const t = e.target; if (!t || !t.closest) return;
    const sec = t.closest("#ex-muscles"); if (!sec) return;
    const sh = t.closest("[data-m]"), ch = t.closest("[data-mw]");
    const id = sh ? sh.dataset.m : ch ? ch.dataset.mw : null; if (!id) return;
    const g = PT.exGuide(((sec.querySelector("#pt-mw-rev") || {}).dataset || {}).name || ""), m = g && (g.muscles || []).find(x => x.muscle_id === id);
    const info = $("pt-mw-tap"); if (!info) return;
    info.innerHTML = m ? `<b>${esc(PT.muscleLabel(id))}</b>: ${m.role === "primary" ? "a main muscle" : "a helping muscle"}, ${m.intensity} of 100${m.source === "estimate" ? " (estimate)" : ""}` : `<b>${esc(PT.muscleLabel(id))}</b>: not really worked here`;
    sec.querySelectorAll(".mm-r").forEach(x => x.setAttribute("stroke", x.dataset.m === id ? "#ffffff" : "#09090b"));
  });
  document.addEventListener("change", e => {
    if (!e.target || e.target.id !== "pt-mw-rev") return;
    const name = e.target.dataset.name;
    PT.exGuideLocal(name, e.target.checked ? { reviewed: true, reviewedAt: Date.now() } : { reviewed: false, reviewedAt: null });
    const a = A(); if (a) a.toast(e.target.checked ? "Marked as checked on this phone" : "Not checked");
  });

  const css = document.createElement("style"); css.id = "pt-v340-css";
  css.textContent = `
    .pt-mw { border-radius: .75rem; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); }
    .pt-mw > summary { display: flex; align-items: center; gap: .5rem; padding: .75rem .85rem; cursor: pointer; list-style: none; }
    .pt-mw > summary::-webkit-details-marker { display: none; }
    .pt-mw-h { font-size: .8rem; font-weight: 700; color: rgb(var(--z100)); flex: none; }
    .pt-mw-s { font-size: .72rem; color: rgb(var(--z400)); flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: right; }
    .pt-mw[open] > summary .pt-chev { transform: rotate(90deg); }
    .pt-mw-b { padding: 0 .85rem .85rem; display: flex; flex-direction: column; gap: .6rem; }
    .pt-mw-x { font-size: .75rem; line-height: 1.45; color: rgb(var(--z300)); margin: 0; }
    .pt-mw-x b { color: rgb(var(--z100)); }
    .pt-mw-fig { border-radius: .75rem; background: #141417; padding: .4rem 0 .1rem; }
    .pt-mw-fig svg { max-width: 18rem; }
    .pt-mw-leg { display: grid; grid-template-columns: auto auto 1fr; grid-template-rows: auto auto; align-items: center; column-gap: .45rem; row-gap: .15rem; font-size: .68rem; color: rgb(var(--z300)); }
    .pt-mw-sw { width: .85rem; height: .85rem; border-radius: .25rem; grid-row: 1; }
    .pt-mw-bar { height: .7rem; border-radius: 999px; grid-column: 3; grid-row: 1; }
    .pt-mw-ends { grid-column: 3; grid-row: 2; display: flex; justify-content: space-between; }
    .pt-mw-tap { font-size: .72rem; color: rgb(var(--z300)); margin: 0; min-height: 1.1em; }
    .pt-mw-tap b { color: rgb(var(--z100)); }
    .pt-mw-g { display: flex; flex-direction: column; gap: .3rem; }
    .pt-mw-k { font-size: .7rem; font-weight: 700; color: rgb(var(--z400)); }
    .pt-mw-cs { display: flex; flex-wrap: wrap; gap: .3rem; }
    .pt-mw-c { display: inline-flex; align-items: center; gap: .35rem; padding: .3rem .55rem; border-radius: 999px; background: rgb(var(--z900)); border: 1px solid rgb(var(--z800)); font-size: .72rem; font-weight: 600; color: rgb(var(--z100)); cursor: pointer; }
    .pt-mw-c i { width: .6rem; height: .6rem; border-radius: 999px; flex: none; }
    .pt-mw-c em { font-style: normal; font-size: .62rem; color: rgb(var(--z400)); }
    .pt-mw-src > summary { font-size: .72rem; color: rgb(var(--z300)); cursor: pointer; list-style: none; line-height: 1.4; }
    .pt-mw-src > summary::-webkit-details-marker { display: none; }
    .pt-mw-more { color: rgb(var(--z100)); font-weight: 700; text-decoration: underline; white-space: nowrap; }
    .pt-mw-src[open] { display: flex; flex-direction: column; gap: .4rem; }
    .pt-mw-refs { margin: 0; padding-left: 1.1rem; list-style: decimal; font-size: .68rem; line-height: 1.4; color: rgb(var(--z300)); display: flex; flex-direction: column; gap: .3rem; overflow-wrap: anywhere; }
    .pt-mw-chk { display: flex; gap: .5rem; align-items: center; font-size: .75rem; color: rgb(var(--z200)); cursor: pointer; }
    .pt-mw-chk input { width: 1.05rem; height: 1.05rem; accent-color: rgb(var(--a600)); flex: none; }
    .pt-mw-chk em { font-style: normal; color: rgb(var(--z400)); }
  `;
  document.head.appendChild(css);
})();
