
/* =====================================================================
 * PulseTrack 2.45.0: Mods (your own CSS).
 *  Settings → Mods & Custom CSS → Open mod manager. Each mod is a named piece of CSS that you can switch on and off and put in a load
 *  order (later ones win), like a mod list. Paste snippets, edit them with a live preview, share one as a .css file, or add one of
 *  the starter mods (square corners, accent glow, an animated background, a condensed font and so on).
 *  - Everything stays on the phone, in settings.mods (so it is in backups). The one exception is something you write yourself:
 *    an @import of a web font loads from the web when you are online.
 *  - Safety net: a mod that is saved or switched on has to be confirmed within 15 seconds ("Keep this look?"). If you do not, or the
 *    app is closed first, that mod switches itself off, so a stylesheet that hides everything cannot lock you out. "Use my mods" turns
 *    every mod off in one tap, and opening the app with #nomods on the end of the address starts it with mods off.
 *  - The mods' style tag always sits last in <head>, so a mod beats the app's own styles when it has the same strength.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined" || !PT.kit) return;
  const proto = ApplicationUI.prototype, A = () => window.app, K = PT.kit, esc = K.esc, $ = id => document.getElementById(id);
  const MAX_CSS = 200000, MAX_MODS = 40, TRIAL_S = 15;
  const save = a => { try { WorkoutStorage.saveSettings(a.settings); } catch (e) { } };
  const list = a => (a && a.settings && Array.isArray(a.settings.mods) ? a.settings.mods : []);
  const setList = (a, l) => { a.settings.mods = l; save(a); };
  const safe = () => /(^|[?&#])nomods\b/i.test(String(location.hash || "") + "&" + String(location.search || ""));
  const uid = () => "m" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const lines = s => (String(s || "").trim() ? String(s).trim().split("\n").length : 0);

  /* ---------------------------------------------------------------- starter mods */
  const STARTERS = [
    { id: "s_square", name: "Square corners", note: "Sharp, flat corners on cards and buttons", css: `/* Sharp corners everywhere except round things */
[class*="rounded-"]:not(.rounded-full), button:not(.rounded-full), input, select, textarea, details, summary { border-radius: 4px !important; }` },
    { id: "s_round", name: "Soft and round", note: "Big, friendly rounded corners", css: `/* Extra round corners */
[class*="rounded-xl"], [class*="rounded-2xl"], [class*="rounded-lg"] { border-radius: 1.4rem !important; }
button:not(.rounded-full) { border-radius: 1rem !important; }` },
    { id: "s_outline", name: "Accent outlines", note: "Cards get an outline in your accent colour", css: `/* Card outlines in the accent colour */
[class*="border-zinc-800"], [class*="border-zinc-700"] { border-color: rgb(var(--a500) / .35) !important; }` },
    { id: "s_glow", name: "Accent glow", note: "Main buttons glow in your accent colour", css: `/* Glow on the main buttons */
button[class*="bg-emerald-6"], button[class*="bg-emerald-5"] { box-shadow: 0 0 18px rgb(var(--a500) / .55) !important; }
@keyframes pt-mod-breathe { 0%, 100% { box-shadow: 0 0 10px rgb(var(--a500) / .35); } 50% { box-shadow: 0 0 22px rgb(var(--a500) / .7); } }
#btn-start-workout, #pt-start-training { animation: pt-mod-breathe 3.2s ease-in-out infinite; }` },
    { id: "s_aurora", name: "Aurora background", note: "Slow moving gradient behind the app", css: `/* Slowly moving gradient behind everything */
@keyframes pt-mod-aurora { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
html, body { background: linear-gradient(120deg, rgb(var(--z950)), rgb(var(--a950)), rgb(var(--z950)), rgb(var(--a800) / .55), rgb(var(--z950))) !important; background-size: 320% 320% !important; animation: pt-mod-aurora 26s ease infinite; }` },
    { id: "s_font", name: "Condensed font", note: "Oswald from Google Fonts. Needs internet the first time; the app keeps it after that", css: `/* Needs internet once. After that the font is kept for offline use. */
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;700&display=swap');
html, body, button, input, select, textarea { font-family: 'Oswald', system-ui, sans-serif !important; letter-spacing: .01em; }` },
    { id: "s_still", name: "No animation", note: "Switches off motion and fades", css: `/* Calm: no animations or transitions */
*, *::before, *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }` }
  ];

  /* ---------------------------------------------------------------- applying */
  let styleEl = null, importEl = null, draft = null, observer = null;
  /** @import only counts at the very top of a stylesheet, so every mod's @imports are lifted out and kept apart (comments are left alone) */
  function hoist(css, imports) {
    return String(css || "").replace(/\/\*[\s\S]*?\*\/|@import\s*(?:url\(\s*(?:"[^"]*"|'[^']*'|[^)]*)\s*\)|"[^"]*"|'[^']*')[^;{}]*;/gi, t => { if (t.charAt(0) === "@") { imports.push(t); return ""; } return t; });
  }
  function cssText(a) {
    if (safe() || (a.settings && a.settings.modsOff)) return { imports: "", main: "" };
    const parts = [], imports = [];
    list(a).forEach(m => {
      if (!m || !m.on) return;
      const css = draft && draft.id === m.id ? draft.css : m.css;
      parts.push("/* " + String(m.name || "mod").replace(/[\r\n]+/g, " ").replace(/\*\//g, "*") + " */\n" + hoist(css, imports));
    });
    if (draft && !list(a).some(m => m.id === draft.id)) parts.push("/* draft */\n" + hoist(draft.css, imports));
    return { imports: imports.join("\n"), main: parts.join("\n") };
  }
  function apply(a) {
    a = a || A(); if (!a || !a.settings) return;
    const c = cssText(a);
    // web-font imports live in a style tag of their own: a sheet waits for its @imports before any of its rules apply, and that wait must never hold the mods back
    if (!importEl) { importEl = document.createElement("style"); importEl.id = "pt-mods-imports"; }
    if (!styleEl) { styleEl = document.createElement("style"); styleEl.id = "pt-mods-style"; }
    if (importEl.textContent !== c.imports) importEl.textContent = c.imports;
    if (styleEl.textContent !== c.main) styleEl.textContent = c.main;
    const last = () => document.head.lastElementChild === styleEl && styleEl.previousElementSibling === importEl;
    if (!last()) { document.head.appendChild(importEl); document.head.appendChild(styleEl); }
    if (!observer && window.MutationObserver) {
      observer = new MutationObserver(() => { if (styleEl && styleEl.parentNode === document.head && !last()) { document.head.appendChild(importEl); document.head.appendChild(styleEl); } });
      observer.observe(document.head, { childList: true });
    }
  }

  /** read a piece of CSS the way the browser does, in a scratch document: how many rules it gave, and what looks wrong */
  function analyse(css) {
    css = String(css || "");
    const out = { lines: lines(css), rules: 0, expected: 0, problems: [], imports: 0 };
    let depth = 0, i = 0, q = "", paren = 0, start = 0;
    const strip = css.replace(/\/\*[\s\S]*?\*\//g, " ");
    for (i = 0; i < strip.length; i++) {
      const c = strip[i];
      if (q) { if (c === "\\") i++; else if (c === q) q = ""; continue; }
      if (c === '"' || c === "'") { q = c; continue; }
      if (c === "(") paren++; else if (c === ")") paren = Math.max(0, paren - 1);
      else if (paren) continue;
      else if (c === "{") { if (depth === 0) out.expected++; depth++; }
      else if (c === "}") { depth--; if (depth < 0) { out.problems.push("There is a } with no { before it."); depth = 0; } }
      else if (c === ";" && depth === 0) { const stmt = strip.slice(start, i); if (/^\s*@(import|charset|namespace)\b/i.test(stmt)) out.expected++; if (/^\s*@import\b/i.test(stmt)) out.imports++; }
      if (depth === 0 && (c === "}" || c === ";")) start = i + 1;
    }
    if (depth > 0) out.problems.push("A { is never closed with a }.");
    if (q) out.problems.push("A quote mark is never closed.");
    try {
      const d = document.implementation.createHTMLDocument(""), s = d.createElement("style"); s.textContent = css; d.head.appendChild(s);
      out.rules = s.sheet ? s.sheet.cssRules.length : 0;
    } catch (e) { out.rules = out.expected; }
    if (!out.problems.length && out.rules < out.expected) out.problems.push((out.expected - out.rules) + " rule" + (out.expected - out.rules === 1 ? " was" : "s were") + " not understood and will be ignored.");
    return out;
  }

  /* ---------------------------------------------------------------- the safety net */
  let trialTimer = null;
  const imp = (el, css) => css.split(";").forEach(p => { const i = p.indexOf(":"); if (i > 0) el.style.setProperty(p.slice(0, i).trim(), p.slice(i + 1).trim(), "important"); });
  function removeBar() { clearInterval(trialTimer); trialTimer = null; const b = $("pt-mod-trial"); if (b) b.remove(); }
  function showBar(a) {
    removeBar();
    let left = TRIAL_S;
    const b = document.createElement("div"); b.id = "pt-mod-trial"; b.setAttribute("role", "alertdialog");
    imp(b, "all:initial;position:fixed;left:8px;right:8px;top:8px;z-index:2147483647;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;background:#111827;color:#fff;border:2px solid #f59e0b;border-radius:14px;font-family:system-ui,sans-serif;font-size:14px;font-weight:700;box-shadow:0 10px 30px rgba(0,0,0,.6);opacity:1;visibility:visible;transform:none;filter:none;pointer-events:auto");
    const t = document.createElement("span"); imp(t, "all:initial;color:#fff;font-family:system-ui,sans-serif;font-size:14px;font-weight:700;line-height:1.25");
    const mk = (txt, bg, fg, fn) => { const x = document.createElement("button"); x.type = "button"; x.textContent = txt; imp(x, "all:initial;display:inline-block;padding:10px 14px;border-radius:10px;background:" + bg + ";color:" + fg + ";font-family:system-ui,sans-serif;font-size:14px;font-weight:800;cursor:pointer;flex:none"); x.addEventListener("click", fn); return x; };
    const keepB = mk("Keep", "#10b981", "#022c22", () => keep(a)), undoB = mk("Undo", "#374151", "#fff", () => revert(a, "undo"));
    const box = document.createElement("span"); imp(box, "all:initial;display:flex;gap:8px;flex:none"); box.append(undoB, keepB);
    b.append(t, box); document.documentElement.appendChild(b);
    const paint = () => { t.textContent = "Keep this look? Switching off in " + left + " s"; };
    paint();
    trialTimer = setInterval(() => { left--; if (left <= 0) revert(a, "time"); else paint(); }, 1000);
  }
  function trial(a, id) { a.settings.modTrial = { id, ts: Date.now() }; save(a); showBar(a); }
  function keep(a) { delete a.settings.modTrial; save(a); removeBar(); try { a.toast("Mod kept"); } catch (e) { } refresh(a); }
  function revert(a, why) {
    const t = a.settings.modTrial; removeBar(); if (!t) return;
    const l = list(a), m = l.find(x => x.id === t.id);
    if (m) m.on = false;
    delete a.settings.modTrial; save(a); apply(a); refresh(a);
    try { a.toast(m ? "“" + m.name + "” is switched off. Open it to fix the CSS." : "Mod switched off", undefined, undefined, 4500); } catch (e) { }
  }

  /* ---------------------------------------------------------------- the manager */
  let mgr = null, view = "list";
  function row(a, m, i, n) {
    const an = m.on ? "" : "";
    return `<div class="pt-md-row${m.on ? " on" : ""}" data-md-row="${esc(m.id)}">
      <label class="pt-md-sw"><input type="checkbox" data-md-on="${esc(m.id)}" ${m.on ? "checked" : ""} aria-label="Use ${esc(m.name)}"><i></i></label>
      <button type="button" class="pt-md-name tap-active" data-md-edit="${esc(m.id)}"><b>${esc(m.name || "Untitled mod")}</b><span>${lines(m.css)} lines${m.starter ? " · starter" : ""}</span></button>
      <span class="pt-md-mv"><button type="button" data-md-up="${esc(m.id)}" ${i === 0 ? "disabled" : ""} aria-label="Load earlier">↑</button><button type="button" data-md-dn="${esc(m.id)}" ${i === n - 1 ? "disabled" : ""} aria-label="Load later">↓</button></span></div>`;
  }
  function renderMgr(a) {
    if (!mgr) return;
    const l = list(a), off = !!a.settings.modsOff;
    let body;
    if (view === "starters") {
      const have = new Set(l.map(m => m.starter));
      body = `${K.head("Starter mods", "Tap one to add it. You can edit it afterwards.")}
        <div class="pt-md-list">${STARTERS.map(s => `<button type="button" class="pt-md-st tap-active" data-md-add="${s.id}" ${have.has(s.id) ? "disabled" : ""}><b>${esc(s.name)}</b><span>${esc(s.note)}</span><em>${have.has(s.id) ? "Added" : "Add"}</em></button>`).join("")}</div>
        <button type="button" class="pt-md-ghost tap-active" data-md-view="list">Back to my mods</button>`;
    } else {
      body = `${K.head("Mods", "Your own CSS, switched on and off like a mod list")}
        ${off ? `<p class="pt-md-warn">All mods are switched off in Settings (“Use my mods”).</p>` : ""}
        ${l.length ? `<p class="pt-md-fine">Loads from the top down. A mod lower in the list wins when two of them change the same thing.</p><div class="pt-md-list">${l.map((m, i) => row(a, m, i, l.length)).join("")}</div>`
          : `<p class="pt-md-fine">No mods yet. Add a starter to see how it works, or write your own.</p>`}
        <div class="pt-md-actions"><button type="button" class="pt-md-go tap-active" data-md-new="1">＋ New mod</button><button type="button" class="pt-md-ghost tap-active" data-md-view="starters">Starter mods</button><button type="button" class="pt-md-ghost tap-active" data-md-import="1">Import a .css file</button></div>
        <p class="pt-md-fine">A new or changed mod has to be kept within ${TRIAL_S} seconds, or it switches itself off. If the app ever looks wrong, Settings → Mods & Custom CSS → “Use my mods” turns them all off.</p>`;
    }
    const card = K.openSheet(mgr, body); mgr.__card = card;
  }
  function openMgr(v) {
    const a = A(); if (!a) return;
    view = v || "list"; mgr = K.sheet("pt-mods", 62); renderMgr(a);
  }
  function refresh(a) {
    a = a || A(); if (!a) return;
    try { box(a); } catch (e) { }
    if (mgr && !mgr.classList.contains("hidden")) { const s = mgr.__card && mgr.__card.parentElement ? mgr.__card.parentElement.scrollTop : 0; renderMgr(a); }
  }

  /* ---------------------------------------------------------------- the editor */
  let ed = null, editing = null;
  function openEditor(id) {
    const a = A(); if (!a) return;
    const m = id ? list(a).find(x => x.id === id) : null;
    editing = m ? m.id : null; draft = null;
    ed = K.sheet("pt-modedit", 64);
    const css0 = m ? m.css : "", name0 = m ? m.name : "";
    const c = K.openSheet(ed, `${K.head(m ? "Edit mod" : "New mod", "Changes show live while you type. Nothing is kept until you save.")}
      <label class="pt-md-f"><span>Name</span><input id="pt-md-name" type="text" maxlength="40" value="${esc(name0)}" placeholder="My mod" autocomplete="off"></label>
      <label class="pt-md-f"><span>CSS</span><textarea id="pt-md-css" rows="13" spellcheck="false" autocapitalize="off" autocorrect="off" autocomplete="off" placeholder="/* paste or write CSS here */">${esc(css0)}</textarea></label>
      <p id="pt-md-info" class="pt-md-fine"></p>
      <div class="pt-md-tools"><button type="button" class="pt-md-ghost tap-active" data-md-paste="1">Paste</button><button type="button" class="pt-md-ghost tap-active" data-md-copy="1">Copy</button><button type="button" class="pt-md-ghost tap-active" data-md-share="1">Share file</button>${m ? `<button type="button" class="pt-md-del tap-active" data-md-del="1">Delete</button>` : ""}</div>
      <details class="pt-md-help"><summary>Handy hooks</summary><div>
        <p><b>Accent colour</b> <code>rgb(var(--a500))</code>, also <code>--a300 --a400 --a600 --a800 --a950</code>. With see-through: <code>rgb(var(--a500) / .4)</code>.</p>
        <p><b>Greys</b> <code>--z50</code> … <code>--z950</code> (light to dark in dark mode).</p>
        <p><b>Light mode only</b> <code>html[data-mode="light"] { … }</code></p>
        <p><b>Screens</b> <code>#view-home #view-workout #view-progress #view-body #view-history #view-programs #view-library #view-cardio</code></p>
        <p><b>Cards and buttons</b> use utility classes, so match them like <code>[class*="rounded-2xl"]</code> or <code>.bg-zinc-900</code>.</p>
        <p><b>Tip</b> end a line with <code>!important</code> to beat the app's own style. An <code>@import</code> of a web font needs internet the first time.</p></div></details>
      <button type="button" id="pt-md-save" class="pt-md-go tap-active">Save</button>`);
    ed.__onClose = () => { draft = null; apply(A()); };       // after openSheet, which clears it
    const css = c.querySelector("#pt-md-css"), info = c.querySelector("#pt-md-info");
    const update = () => {
      const v = css.value, an = analyse(v);
      info.className = "pt-md-fine" + (an.problems.length ? " bad" : "");
      info.textContent = v.length > MAX_CSS ? "That is too long (limit about 200,000 characters)." : an.problems.length ? an.problems[0] : an.lines ? an.lines + " line" + (an.lines === 1 ? "" : "s") + " · " + an.rules + " rule" + (an.rules === 1 ? "" : "s") + (an.imports ? " · web font or file import (needs internet)" : "") : "Empty";
      draft = { id: editing || "__new", css: v.length > MAX_CSS ? "" : v };
      // a mod that is off still previews while you edit it
      const a2 = A(); if (a2) { const mm = editing && list(a2).find(x => x.id === editing); if (mm && !mm.on) { const real = mm.on; mm.on = true; apply(a2); mm.on = real; } else apply(a2); }
    };
    css.addEventListener("input", () => { clearTimeout(update._t); update._t = setTimeout(update, 250); });
    update();
  }
  function exportName(m) { return (String(m.name || "mod").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "mod") + ".css"; }
  async function shareFile(name, css) {
    const file = new File(["/* PulseTrack mod: " + name.replace(/\*\//g, "") + " */\n" + css], exportName({ name }), { type: "text/css" });
    try { if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: name }); return; } } catch (e) { if (e && e.name === "AbortError") return; }
    const u = URL.createObjectURL(file), x = document.createElement("a"); x.href = u; x.download = file.name; document.body.appendChild(x); x.click(); x.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000);
    A().toast("Saved " + file.name + " to your downloads");
  }
  function addMod(a, name, css, extra) {
    const l = list(a).slice(); if (l.length >= MAX_MODS) { a.toast("That is the most mods (" + MAX_MODS + ")"); return null; }
    const m = Object.assign({ id: uid(), name: String(name || "My mod").slice(0, 40), css: String(css || "").slice(0, MAX_CSS), on: true, ts: Date.now() }, extra || {});
    l.push(m); setList(a, l); return m;
  }

  /* ---------------------------------------------------------------- clicks */
  document.addEventListener("change", e => {
    const a = A(); if (!a || !e.target || !e.target.closest) return;
    const t = e.target;
    if (t.matches && t.matches("[data-mods-master]")) { a.settings.modsOff = !t.checked; save(a); apply(a); refresh(a); return; }
    const on = t.closest && t.closest("[data-md-on]");
    if (on) {
      const m = list(a).find(x => x.id === on.dataset.mdOn); if (!m) return;
      m.on = !!on.checked; save(a); apply(a);
      if (m.on && !a.settings.modsOff) trial(a, m.id); else if (a.settings.modTrial && a.settings.modTrial.id === m.id) { delete a.settings.modTrial; save(a); removeBar(); }
      refresh(a); return;
    }
    if (t.id === "pt-md-file" && t.files && t.files[0]) {
      const f = t.files[0]; t.value = "";
      if (f.size > MAX_CSS) { a.toast("That file is too big for a mod"); return; }
      f.text().then(txt => {
        const first = (txt.match(/^\s*\/\*\s*PulseTrack mod:\s*(.*?)\s*\*\//) || [])[1];
        const m = addMod(a, first || f.name.replace(/\.[a-z]+$/i, ""), txt); if (m) { apply(a); trial(a, m.id); refresh(a); }
      }).catch(() => a.toast("Could not read that file"));
    }
  });
  document.addEventListener("click", async e => {
    const a = A(); if (!a || !e.target || !e.target.closest) return;
    const g = s => e.target.closest(s);
    if (g("#pt-mods-open")) { openMgr("list"); return; }
    const vw = g("[data-md-view]"); if (vw) { view = vw.dataset.mdView; renderMgr(a); return; }
    const ed1 = g("[data-md-edit]"); if (ed1) { openEditor(ed1.dataset.mdEdit); return; }
    if (g("[data-md-new]")) { openEditor(null); return; }
    const ad = g("[data-md-add]");
    if (ad) {
      const s = STARTERS.find(x => x.id === ad.dataset.mdAdd); if (!s || list(a).some(m => m.starter === s.id)) return;
      const m = addMod(a, s.name, s.css, { starter: s.id }); if (m) { view = "list"; apply(a); trial(a, m.id); refresh(a); }
      return;
    }
    if (g("[data-md-import]")) { let f = $("pt-md-file"); if (!f) { f = document.createElement("input"); f.type = "file"; f.id = "pt-md-file"; f.accept = ".css,.txt,text/css,text/plain"; f.className = "hidden"; document.body.appendChild(f); } f.click(); return; }
    const mv = g("[data-md-up],[data-md-dn]");
    if (mv) {
      const id = mv.dataset.mdUp || mv.dataset.mdDn, l = list(a).slice(), i = l.findIndex(m => m.id === id), j = mv.dataset.mdUp ? i - 1 : i + 1;
      if (i < 0 || j < 0 || j >= l.length) return; [l[i], l[j]] = [l[j], l[i]]; setList(a, l); apply(a); refresh(a); return;
    }
    if (g("#pt-md-save")) {
      const name = ($("pt-md-name").value || "").trim() || "My mod", css = $("pt-md-css").value;
      if (css.length > MAX_CSS) { a.toast("That is too long for a mod"); return; }
      if (!css.trim()) { a.toast("Write some CSS first"); return; }
      let m = editing ? list(a).find(x => x.id === editing) : null, changed = true;
      if (m) { changed = m.css !== css; m.name = name.slice(0, 40); m.css = css; setList(a, list(a).slice()); }
      else { m = addMod(a, name, css); if (!m) return; }
      draft = null; const wasOn = m.on; m.on = true; save(a); apply(a);
      K.closeSheet(ed);
      if (!wasOn || changed || !editing) { if (!a.settings.modsOff) trial(a, m.id); } refresh(a); return;
    }
    if (g("[data-md-copy]")) { const v = $("pt-md-css").value; try { await navigator.clipboard.writeText(v); a.toast("Copied"); } catch (x) { const t = $("pt-md-css"); t.select(); try { document.execCommand("copy"); a.toast("Copied"); } catch (y) { a.toast("Select the text and copy it"); } } return; }
    if (g("[data-md-paste]")) {
      try { const txt = await navigator.clipboard.readText(); const t = $("pt-md-css"); t.value = txt; t.dispatchEvent(new Event("input", { bubbles: true })); } catch (x) { a.toast("Your phone did not allow paste here. Long-press in the box and choose Paste."); }
      return;
    }
    if (g("[data-md-share]")) { const nm = ($("pt-md-name").value || "").trim() || "My mod"; await shareFile(nm, $("pt-md-css").value); return; }
    if (g("[data-md-del]")) {
      const m = list(a).find(x => x.id === editing); if (!m) return;
      if (!(await PT.confirm("Delete “" + m.name + "”?", { title: "Delete this mod?", body: "The CSS in it is gone for good unless you shared a copy.", ok: "Delete" }))) return;
      setList(a, list(a).filter(x => x.id !== m.id)); if (a.settings.modTrial && a.settings.modTrial.id === m.id) { delete a.settings.modTrial; save(a); removeBar(); }
      draft = null; K.closeSheet(ed); apply(a); refresh(a); return;
    }
  });

  /* ---------------------------------------------------------------- Settings box */
  function box(a) {
    const b = $("pt-mods-box"); if (!b) return;
    const l = list(a), on = l.filter(m => m.on).length, off = !!a.settings.modsOff;
    b.innerHTML = `<div class="flex items-center justify-between p-3.5 gap-3"><div class="pr-3 min-w-0"><span class="text-xs font-bold text-white block">Use my mods</span><span class="text-[11px] text-zinc-400 block mt-0.5">Turn this off to see the plain app. ${safe() ? "Safe mode is on, so mods are off until you open the app normally." : "Your mods stay saved."}</span></div>
      <label class="pt-md-sw"><input type="checkbox" data-mods-master ${off ? "" : "checked"} aria-label="Use my mods"><i></i></label></div>
      <div class="p-3.5 space-y-2"><p class="text-[11px] text-zinc-400 leading-relaxed">${l.length ? on + " of " + l.length + " mod" + (l.length === 1 ? "" : "s") + " on." : "Paste your own CSS to restyle the app: corners, fonts, colours, backgrounds and animations. Stays on this phone."}</p>
        <button type="button" id="pt-mods-open" class="w-full py-2.5 rounded-xl bg-zinc-800 text-zinc-100 text-xs font-bold tap-active">Open mod manager</button></div>`;
    const h = document.querySelector('[data-hint="mods"]'); if (h) h.textContent = off ? "Off" : l.length ? on + " of " + l.length + " on" : "Reskin the app with your own CSS";
  }
  const oOpenSettings = proto.openSettings;
  proto.openSettings = function () { const r = oOpenSettings.apply(this, arguments); try { box(this); } catch (e) { console.error("PulseTrack mods box", e); } return r; };

  /* ---------------------------------------------------------------- start up */
  let booted = false;
  function boot(a) {
    if (booted) return; booted = true;
    if (a.settings && a.settings.modTrial) {      // the app was closed before the last mod was confirmed: switch it off
      const t = a.settings.modTrial, m = list(a).find(x => x.id === t.id);
      if (m) m.on = false; delete a.settings.modTrial; save(a);
      setTimeout(() => { try { a.toast(m ? "“" + m.name + "” was switched off because it was not confirmed" : "A mod was switched off", undefined, undefined, 5000); } catch (e) { } }, 1500);
    }
    if (safe()) setTimeout(() => { try { a.toast("Safe mode: mods are off", undefined, undefined, 4000); } catch (e) { } }, 1500);
  }
  const oTheme = proto.applyTheme;
  proto.applyTheme = function () { const r = oTheme.apply(this, arguments); try { boot(this); apply(this); } catch (e) { console.error("PulseTrack mods", e); } return r; };
  PT.mods = { apply: () => apply(A()), analyse, list: () => list(A()), starters: STARTERS, add: (n, c, x) => addMod(A(), n, c, x), trial: id => trial(A(), id), keep: () => keep(A()), revert: () => revert(A(), "test"), open: openMgr };

  /* ---------------------------------------------------------------- CSS */
  const css = document.createElement("style");
  css.id = "pt-v245-mods-css";
  css.textContent = `
    .pt-md-fine { font-size: .7rem; line-height: 1.45; color: rgb(var(--z500)); } .pt-md-fine.bad { color: rgb(251 113 133); font-weight: 700; }
    .pt-md-warn { padding: .6rem .75rem; border-radius: .8rem; background: rgb(251 191 36 / .1); border: 1px solid rgb(251 191 36 / .4); font-size: .75rem; color: rgb(252 211 77); }
    .pt-md-list { display: grid; gap: .45rem; }
    .pt-md-row { display: flex; align-items: center; gap: .6rem; padding: .55rem .65rem; border-radius: .9rem; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); }
    .pt-md-row.on { border-color: rgb(var(--a500) / .5); }
    .pt-md-name { flex: 1 1 auto; min-width: 0; text-align: left; display: grid; gap: .1rem; }
    .pt-md-name b { font-size: .85rem; color: rgb(var(--z50)); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } .pt-md-name span { font-size: .66rem; color: rgb(var(--z500)); }
    .pt-md-mv { display: flex; gap: .25rem; flex: none; } .pt-md-mv button { width: 2rem; height: 2rem; border-radius: .6rem; background: rgb(var(--z800)); color: rgb(var(--z100)); font-weight: 800; } .pt-md-mv button:disabled { opacity: .3; }
    .pt-md-sw { position: relative; display: inline-block; width: 2.75rem; height: 1.5rem; flex: none; cursor: pointer; }
    .pt-md-sw input { position: absolute; opacity: 0; width: 100%; height: 100%; margin: 0; cursor: pointer; }
    .pt-md-sw i { position: absolute; inset: 0; border-radius: 999px; background: rgb(var(--z800)); transition: background .15s; pointer-events: none; }
    .pt-md-sw i::after { content: ""; position: absolute; left: 2px; top: 2px; width: 1.25rem; height: 1.25rem; border-radius: 999px; background: #fff; transition: transform .15s; }
    .pt-md-sw input:checked + i { background: rgb(var(--a600)); } .pt-md-sw input:checked + i::after { transform: translateX(1.25rem); }
    .pt-md-actions, .pt-md-tools { display: flex; flex-wrap: wrap; gap: .5rem; }
    .pt-md-go, .pt-md-ghost, .pt-md-del { padding: .7rem .9rem; border-radius: .8rem; font-size: .8rem; font-weight: 800; flex: 1 1 auto; }
    .pt-md-go { background: rgb(var(--a600)); color: #fff; } .pt-md-ghost { background: rgb(var(--z800)); color: rgb(var(--z100)); } .pt-md-del { background: rgb(190 18 60 / .2); color: rgb(251 113 133); }
    .pt-md-st { display: grid; grid-template-columns: 1fr auto; gap: .1rem .6rem; text-align: left; padding: .65rem .75rem; border-radius: .9rem; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); }
    .pt-md-st b { font-size: .85rem; color: rgb(var(--z50)); } .pt-md-st span { grid-column: 1; font-size: .7rem; color: rgb(var(--z400)); line-height: 1.35; } .pt-md-st em { grid-row: 1 / span 2; grid-column: 2; align-self: center; font-style: normal; font-size: .72rem; font-weight: 800; color: rgb(var(--a400)); }
    .pt-md-st:disabled { opacity: .5; }
    .pt-md-f { display: grid; gap: .3rem; } .pt-md-f > span { font-size: .6rem; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: rgb(var(--z500)); }
    .pt-md-f input, .pt-md-f textarea { width: 100%; padding: .65rem .75rem; border-radius: .8rem; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); color: rgb(var(--z100)); font-size: .85rem; }
    .pt-md-f textarea { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: .75rem; line-height: 1.45; white-space: pre; overflow: auto; tab-size: 2; }
    .pt-md-f input:focus, .pt-md-f textarea:focus { outline: none; border-color: rgb(var(--a500)); }
    .pt-md-help { border-radius: .8rem; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); }
    .pt-md-help summary { padding: .6rem .75rem; font-size: .75rem; font-weight: 800; color: rgb(var(--z300)); cursor: pointer; }
    .pt-md-help div { padding: 0 .75rem .7rem; display: grid; gap: .45rem; } .pt-md-help p { font-size: .7rem; line-height: 1.45; color: rgb(var(--z400)); } .pt-md-help b { color: rgb(var(--z200)); }
    .pt-md-help code { font-family: ui-monospace, Menlo, monospace; font-size: .66rem; padding: .05rem .25rem; border-radius: .3rem; background: rgb(var(--z800)); color: rgb(var(--z100)); word-break: break-word; }
  `;
  document.head.appendChild(css);
})();
  