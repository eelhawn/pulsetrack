/* =====================================================================
 * PulseTrack 2.70.0: theme gallery.
 *   - All themes in one screen, by category, with a tick on the one you are using
 *   - Surprise me (a random good-looking combination you can keep)
 *   - Save the look you have made, share it as a short code, use someone else's code
 *   - Day & night: a different look for each part of the day, switched on its own
 * The look data (themes, accents, fonts, codes) lives in module 009 as PT.look.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined" || !PT.look || !PT.kit) return;
  const L = PT.look, K = PT.kit, esc = K.esc;
  const A = () => window.app;
  const GAL = "pt-gal";
  let cat = "all", view = "grid", note = "";

  const allLooks = () => L.PRESETS.concat(L.mine());
  const labelOf = id => { const p = L.byId(id); return p ? p.label : ""; };
  const save = () => { try { WorkoutStorage.saveSettings(A().settings); } catch (e) { /* storage full or blocked: the look still applies for now */ } };
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  /* ------------------------------------------------------------ the pieces of the screen */
  function chips() {
    const n = L.mine().length, list = L.CATS.concat([["mine", "Mine" + (n ? " (" + n + ")" : "")]]);
    return `<div class="pt-gal-chips" role="group" aria-label="Theme groups">${list.map(c => `<button type="button" class="pt-gal-chip tap-active" data-cat="${c[0]}" aria-pressed="${cat === c[0]}">${esc(c[1])}</button>`).join("")}</div>`;
  }
  function actions() {
    const auto = A().settings.autoLook && A().settings.autoLook.on;
    return `<div class="pt-gal-bar" style="grid-template-columns:repeat(4,minmax(0,1fr))">
      <button type="button" class="pt-gal-act tap-active" data-act="surprise">🎲<br>Surprise</button>
      <button type="button" class="pt-gal-act tap-active" data-act="save">💾<br>Save</button>
      <button type="button" class="pt-gal-act tap-active" data-act="code">🔗<br>Code</button>
      <button type="button" class="pt-gal-act tap-active" data-act="sched">${auto ? "🌗<br>On" : "🌗<br>Day/night"}</button></div>`;
  }
  function grid() {
    const cur = A().settings.preset;
    const list = cat === "mine" ? L.mine() : cat === "all" ? L.PRESETS : L.PRESETS.filter(p => p.cat === cat);
    if (!list.length) return `<div class="pt-gal-empty">${cat === "mine" ? "Nothing saved yet. Make a look you like, then tap Save." : "No themes here."}</div>`;
    return `<div class="pt-gal-grid">${list.map(p => `<div class="pt-gal-cell">
      <button type="button" class="pt-gal-it tap-active" data-look="${esc(p.id)}" aria-current="${cur === p.id}">${L.previewOf(p)}</button><span class="pt-gal-tick" aria-hidden="true">✓</span>
      ${p.id.startsWith("my-") ? `<button type="button" class="pt-gal-x tap-active" data-del="${esc(p.id)}" aria-label="Delete ${esc(p.label)}">✕</button>` : ""}</div>`).join("")}</div>`;
  }
  function gridView() {
    const n = L.PRESETS.length;
    return `<p class="text-xs text-zinc-400">${n} themes${note ? " · " + esc(note) : ""}. Tap one to use it. Anything you change after that is yours to keep with Save.</p>${actions()}${chips()}${grid()}`;
  }
  function codeView() {
    const code = L.codeOf(A().settings);
    return `<button type="button" class="pt-gal-act tap-active" data-act="back" style="text-align:left">← Back</button>
      <div><span class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">Your look as a code</span>
        <textarea id="pt-gal-code" rows="3" readonly style="user-select:text;resize:none;font-size:.8rem;word-break:break-all">${esc(code)}</textarea>
        <button type="button" class="pt-gal-act pt-main tap-active mt-2" data-act="copy" style="width:100%">Copy code</button>
        <p class="text-xs text-zinc-400 mt-1.5">Send it to anyone with PulseTrack. It holds colours, font and style only, nothing private.</p></div>
      <div><span class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">Use a code</span>
        <textarea id="pt-gal-paste" rows="3" placeholder="Paste a code that starts with PT1." autocomplete="off" autocapitalize="off" spellcheck="false" style="user-select:text;resize:none;font-size:.8rem"></textarea>
        <p id="pt-gal-err" class="text-xs mt-1.5" style="color:rgb(248 113 113)" role="alert"></p>
        <button type="button" class="pt-gal-act pt-main tap-active mt-1" data-act="usecode" style="width:100%">Use this code</button></div>`;
  }
  function schedView() {
    const a = A().settings.autoLook || {}, opts = sel => `<optgroup label="Themes">${L.PRESETS.map(p => `<option value="${esc(p.id)}"${p.id === sel ? " selected" : ""}>${esc(p.label)}</option>`).join("")}</optgroup>`
      + (L.mine().length ? `<optgroup label="Mine">${L.mine().map(p => `<option value="${esc(p.id)}"${p.id === sel ? " selected" : ""}>${esc(p.label)}</option>`).join("")}</optgroup>` : "");
    const row = (t, inner) => `<label class="block"><span class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">${t}</span>${inner}</label>`;
    return `<button type="button" class="pt-gal-act tap-active" data-act="back" style="text-align:left">← Back</button>
      <p class="text-xs text-zinc-400">Switch looks by itself: a bright one for the day and a dark one for the evening. It changes at the times below, and you can still pick any theme in between.</p>
      <button type="button" class="pt-gal-act tap-active" data-act="autotoggle" role="switch" aria-checked="${!!a.on}" style="width:100%">${a.on ? "Day & night is ON — tap to turn off" : "Day & night is OFF — tap to turn on"}</button>
      ${row("Day look", `<select data-auto="day">${opts(a.day || "paper")}</select>`)}
      ${row("Starts at", `<input type="time" data-auto="dayAt" value="${esc(a.dayAt || "07:00")}">`)}
      ${row("Night look", `<select data-auto="night">${opts(a.night || "classic")}</select>`)}
      ${row("Starts at", `<input type="time" data-auto="nightAt" value="${esc(a.nightAt || "19:30")}">`)}`;
  }

  /* ------------------------------------------------------------ open / draw */
  function paint(el) {
    const body = el.querySelector("#pt-gal-body"); if (!body) return;
    body.innerHTML = view === "code" ? codeView() : view === "sched" ? schedView() : gridView();
    body.className = "space-y-3";
  }
  async function copyText(t) {
    try { await navigator.clipboard.writeText(t); return true; } catch (e) { /* older WebViews */ }
    try { const ta = document.getElementById("pt-gal-code"); if (ta) { ta.focus(); ta.select(); return document.execCommand("copy"); } } catch (e) { /* ignore */ }
    return false;
  }
  function openGallery(startView) {
    const a = A(); if (!a) return;
    const el = K.sheet(GAL, 60);
    view = startView || "grid"; note = "";
    if (!L.CATS.some(c => c[0] === cat) && cat !== "mine") cat = "all";
    const card = K.openSheet(el, K.head("Themes", "Pick a look for the whole app") + '<div id="pt-gal-body" class="space-y-3"></div>');
    paint(el);
    card.addEventListener("click", async e => {
      const t = e.target.closest("button"); if (!t) return;
      if (t.dataset.cat) { cat = t.dataset.cat; paint(el); return; }
      if (t.dataset.look) { if (L.apply(t.dataset.look)) { note = labelOf(t.dataset.look) + " is on"; paint(el); } return; }
      if (t.dataset.del) {
        const ok = await PT.confirm("Delete this saved look? Your other looks are not affected.", { title: "Delete " + labelOf(t.dataset.del) + "?", ok: "Delete", danger: true });
        if (ok) { L.removeMine(t.dataset.del); paint(el); }
        return;
      }
      switch (t.dataset.act) {
        case "surprise": surprise(true); note = "surprise! Tap Save to keep it"; paint(el); break;
        case "save": await saveFlow(); paint(el); break;
        case "code": view = "code"; paint(el); break;
        case "sched": view = "sched"; paint(el); break;
        case "back": view = "grid"; paint(el); break;
        case "copy": { const ok = await copyText(L.codeOf(A().settings)); A().toast(ok ? "Code copied" : "Press and hold the code to copy it"); break; }
        case "usecode": {
          const ta = card.querySelector("#pt-gal-paste"), err = card.querySelector("#pt-gal-err"), look = L.fromCode(ta && ta.value);
          if (!look) { if (err) err.textContent = "That does not look like a PulseTrack code. Check you copied all of it."; break; }
          A().applyLook(look); view = "grid"; note = "code applied"; paint(el); A().toast("Look applied. Tap Save to keep it.");
          break;
        }
        case "autotoggle": {
          const s = A().settings, cur = s.autoLook || {};
          s.autoLook = Object.assign({ day: "paper", night: "classic", dayAt: "07:00", nightAt: "19:30" }, cur, { on: !cur.on });
          delete s.autoLookSlot; save(); if (s.autoLook.on) autoCheck(); paint(el); break;
        }
      }
    });
    card.addEventListener("change", e => {
      const f = e.target.closest("[data-auto]"); if (!f) return;
      const s = A().settings; s.autoLook = Object.assign({ on: false, day: "paper", night: "classic", dayAt: "07:00", nightAt: "19:30" }, s.autoLook || {});
      const v = f.value; if (f.type === "time" && !/^\d{2}:\d{2}$/.test(v)) return;
      s.autoLook[f.dataset.auto] = v; delete s.autoLookSlot; save(); if (s.autoLook.on) autoCheck();
    });
  }

  /* ------------------------------------------------------------ save, surprise */
  async function saveFlow() {
    const a = A();
    if (L.mine().length >= L.MINE_MAX) { a.toast("You have " + L.MINE_MAX + " saved looks. Delete one first."); return false; }
    const name = await PT.prompt("Name this look:", "", { title: "Save this look", ok: "Save", type: "text" });
    if (name == null) return false;
    const m = L.saveMine(name || "My look"); if (!m) return false;
    note = "saved as " + m.label; cat = "mine"; a.toast("Saved \"" + m.label + "\"");
    return true;
  }
  function surprise(quiet) {
    const a = A(); if (!a) return;
    const dark = Math.random() < .7, ids = list => list.map(x => x.id);
    const s = { theme: dark ? "dark" : "light", accent: pick(ids(L.ACCENTS)), font: pick(ids(L.FONTS)), round: pick(["sharp", "normal", "normal", "round"]),
      card: pick(["filled", "filled", "outlined", "raised", "glass"]), btn: pick(["solid", "solid", "gradient", "soft"]),
      bgfx: pick(["solid", "solid", ...ids(L.FX)]) };
    if (dark) s.bg = pick(ids(L.BGS)); else s.bgL = pick(ids(L.LBGS));
    if (s.card === "glass" && s.bgfx === "solid") s.bgfx = pick(["mesh", "aurora", "glow"].filter(x => ids(L.FX).includes(x)).concat(["glow"]));
    if (a.settings.nav) s.nav = a.settings.nav;
    a.applyLook(s);
    if (!quiet) a.toast("A new look", "Save it", () => { saveFlow(); }, 6000);
    return s;
  }

  /* ------------------------------------------------------------ day & night */
  const mins = t => { const m = /^(\d{2}):(\d{2})$/.exec(t || ""); return m ? (+m[1]) * 60 + (+m[2]) : null; };
  /** "day" or "night" for the current time of day (null when the times are not set sensibly) */
  function slotNow(cfg, now) {
    const d = mins(cfg.dayAt), n = mins(cfg.nightAt); if (d == null || n == null || d === n) return null;
    const t = now == null ? new Date().getHours() * 60 + new Date().getMinutes() : now;
    const day = d < n ? (t >= d && t < n) : (t >= d || t < n);
    return day ? "day" : "night";
  }
  function autoCheck(now) {
    const a = A(); if (!a || !a.settings) return;
    const cfg = a.settings.autoLook; if (!cfg || !cfg.on) return;
    const slot = slotNow(cfg, typeof now === "number" ? now : null); if (!slot) return;
    const id = cfg[slot], p = L.byId(id); if (!p) return;
    const key = slot + ":" + id;
    if (a.settings.autoLookSlot === key) return;
    a.settings.autoLookSlot = key;   // saved together with the look by applyLook below
    a.applyLook(p.s, p.id);
  }
  L.openGallery = openGallery;
  L.surprise = () => surprise(false);
  L.autoCheck = autoCheck;
  L.slotNow = slotNow;

  const origInit = ApplicationUI.prototype.initExtras;
  ApplicationUI.prototype.initExtras = function () {
    const r = origInit ? origInit.apply(this, arguments) : undefined;
    try {
      autoCheck();
      document.addEventListener("visibilitychange", () => { if (!document.hidden) autoCheck(); });
      setInterval(autoCheck, 60000);
    } catch (e) { /* the schedule is a nicety, never block start-up */ }
    return r;
  };
})();
