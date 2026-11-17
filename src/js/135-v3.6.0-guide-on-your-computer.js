/* =====================================================================
 * PulseTrack 3.6.0: the guide can ask Ollama on your own computer (optional, off by default).
 *  Settings > Guide: "On this phone" (the default: search answers, no network) or "My computer (Ollama)" with the address you type
 *  (for example http://192.168.1.20:11434) and a model. Find models lists what that Ollama has; Test connection says what is wrong.
 *  How an answer is made: the on-phone search answer is worked out first, as always. Then, only when you press Enter or tap a
 *  question, that answer's facts (the matching screen, setting or exercise; your workout in progress; your last 5 workouts) and your
 *  question go to Ollama's /api/chat, which writes the reply. "Take me there" and the other buttons still come from the phone, so
 *  the jump to a screen works the same. Questions about pain, injuries, medicine or doses are never sent: the phone answers them.
 *  If Ollama doesn't answer within 25 seconds, isn't reachable, the browser blocks it, or the model is missing, the phone's answer is
 *  shown with a line saying so. With no model at all the app works as before.
 *  Browsers: Chrome asks "allow access to your local network" the first time. Safari on iPhone blocks plain http:// addresses from
 *  an https app; an https address (for example from Tailscale) works there. Ollama must allow this app: OLLAMA_ORIGINS.
 *  settings.guideBackend = "search" | "ollama"; settings.guideOllama = { url, model }.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined" || !PT.guide || !PT.guide.backends) return;
  const A = () => window.app, esc = s => PT.esc(s), $ = id => document.getElementById(id);
  const TIMEOUT = 25000, APP = (location.origin && location.origin !== "null") ? location.origin : "https://eelhawn.github.io";

  const cfg = () => { const a = A(), o = (a && a.settings.guideOllama) || {}; return { url: String(o.url || "").trim().replace(/\/+$/, ""), model: String(o.model || "").trim() }; };
  const isLocalHost = h => /^(localhost|127\.|\[?::1\]?$)/i.test(h);
  const isPrivate = h => /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.)/.test(h) || /\.local$/i.test(h);
  function blockedHint(url) {
    try {
      const u = new URL(url);
      if (location.protocol === "https:" && u.protocol === "http:" && !isLocalHost(u.hostname)) return " Your browser may block a plain http:// address from this app (Safari on iPhone does). Chrome asks to allow local network access: say yes. Or use an https:// address.";
    } catch (e) { }
    return "";
  }
  async function call(path, body, ms) {
    const { url } = cfg(); if (!url) throw Object.assign(new Error("No address yet"), { why: "noaddr" });
    let host = ""; try { host = new URL(url).hostname; } catch (e) { throw Object.assign(new Error("That address isn't valid"), { why: "badaddr" }); }
    const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), ms || TIMEOUT);
    const opt = { method: body ? "POST" : "GET", signal: ctl.signal, cache: "no-store", credentials: "omit", mode: "cors" };
    if (body) { opt.headers = { "Content-Type": "application/json" }; opt.body = JSON.stringify(body); }
    if (isPrivate(host)) opt.targetAddressSpace = "local";   // Chrome's local network access: ask the person instead of blocking
    try {
      const res = await fetch(url + path, opt);
      const txt = await res.text(); let js = null; try { js = JSON.parse(txt); } catch (e) { }
      if (!res.ok) throw Object.assign(new Error((js && js.error) || ("HTTP " + res.status)), { why: res.status === 404 ? "nomodel" : res.status === 403 ? "origin" : "http", status: res.status });
      return js;
    } catch (e) {
      if (e.why) throw e;
      throw Object.assign(new Error(e.name === "AbortError" ? "No answer in time" : "Couldn't reach it"), { why: e.name === "AbortError" ? "timeout" : "unreachable" });
    } finally { clearTimeout(t); }
  }

  /* ================================================================ the backend */
  const SYSTEM = "You are the guide inside PulseTrack, a workout tracker app on the user's phone. Answer in at most 4 short sentences, in plain words, using only the App facts given. " +
    "If the facts name a place in the app (like Settings > Workout > Rest Times), say it exactly. For exercise form give general cues only, and say that anyone with pain or an injury should see a doctor or a qualified trainer. " +
    "Never give medical, injury, medication, supplement or dosing advice. If the facts don't answer the question, say you don't know and name a place in the app to look. Don't invent features, numbers or history.";
  function facts(base, c) {
    const L = [];
    if (base && base.kind !== "none") {
      L.push(`Best match in the app: ${base.title}. ${base.text || ""}`.trim());
      if ((base.list || []).length) L.push("Details: " + base.list.join("; "));
      if (base.avoid) L.push("Common mistake: " + base.avoid);
      (base.also || []).forEach(x => L.push(`Related: ${x.label}. ${x.text}`));
    }
    if (c && c.program) L.push("Current program: " + c.program.title);
    if (c && c.day) L.push(`Workout in progress: ${c.day.title}: ` + c.day.exercises.map(x => `${x.name} ${x.done}/${x.sets} sets done (${x.reps} reps)`).join(", "));
    if (c && (c.recent || []).length) L.push("Last workouts: " + c.recent.map(r => `${r.date} ${r.title} (${r.sets} sets: ${r.ex.slice(0, 6).join(", ")})`).join("; "));
    if (c && c.unit) L.push("Weights are in " + (c.unit === "kg" ? "kg" : "lb"));
    return L.join("\n").slice(0, 3000);
  }
  const clean = t => String(t || "").replace(/\*\*(.+?)\*\*/g, "$1").replace(/^#+\s*/gm, "").replace(/\n{3,}/g, "\n\n").trim();
  async function ask(q, c) {
    const base = PT.guide.searchAnswer(q, c);
    if (base && base.kind === "safety") return Object.assign({ backend: "search" }, base);   // never to a model
    const { model } = cfg(); if (!model) throw Object.assign(new Error("No model picked"), { why: "nomodel" });
    const r = await call("/api/chat", { model, stream: false, options: { temperature: .2, num_predict: 260 },
      messages: [{ role: "system", content: SYSTEM }, { role: "user", content: "App facts:\n" + facts(base, c) + "\n\nQuestion: " + q }] });
    const text = clean(r && r.message && r.message.content);
    if (!text) throw Object.assign(new Error("Empty answer"), { why: "empty" });
    const has = base && base.kind !== "none";
    return { kind: has ? base.kind : "model", title: has ? base.title : "Answer", text, list: [], avoid: "", note: has && base.kind === "form" ? base.note : "",
      actions: has ? base.actions || [] : [], also: has ? base.also : null, score: 1, by: `Written by ${model} on your computer (Ollama), from the app's facts.` };
  }
  PT.guide.backends.ollama = { label: "Ollama on your computer", ask };
  PT.guideOllama = { call, ask, facts, cfg, SYSTEM, clean };

  /* ================================================================ Settings > Guide */
  const save = a => { try { WorkoutStorage.saveSettings(a.settings); } catch (e) { } };
  // 3.7.0: other modules add choices here. opts: [id, label]; notes[id]: the line under the buttons; panels[id](a): the box below;
  // gates[id](): a promise of true/false asked before switching to that choice (the cloud option's consent sheet).
  const BOX = { opts: [["search", "On this phone"], ["ollama", "My computer (Ollama)"]], notes: {
      search: "Answers are worked out on this phone from the app's own data. Nothing is sent anywhere.",
      ollama: "Your question and the facts the guide found go to your own computer, which writes the answer. If it doesn't answer, the phone does." },
    panels: {}, gates: {}, draw: () => draw(), save };
  PT.guideBox = BOX;
  function boxHtml(a) {
    const cur = BOX.opts.some(o => o[0] === a.settings.guideBackend) ? a.settings.guideBackend : "search", on = cur === "ollama", c = cfg();
    return `<div class="p-3.5 space-y-2 bg-zinc-950 border border-zinc-800 rounded-xl">
        <span class="text-xs font-bold text-white block">Where answers come from</span>
        <div class="flex flex-wrap gap-1.5" role="group" aria-label="Where the guide's answers come from">
          ${BOX.opts.map(([id, label]) => `<button type="button" class="pt-opt tap-active" data-gb="${id}" aria-pressed="${cur === id}">${esc(label)}</button>`).join("")}
        </div>
        <span class="text-[11px] text-zinc-400 block">${esc(BOX.notes[cur] || "")}</span>
      </div>
      ${BOX.panels[cur] ? BOX.panels[cur](a) : ""}
      ${on ? `<div class="p-3.5 space-y-2.5 bg-zinc-950 border border-zinc-800 rounded-xl" id="pt-gol">
        <label class="pt-gol-l">Address of Ollama<input id="pt-gol-url" type="url" inputmode="url" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="http://192.168.1.20:11434" value="${esc(c.url)}"></label>
        <label class="pt-gol-l">Model<input id="pt-gol-model" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="for example llama3.2" value="${esc(c.model)}" list="pt-gol-models"></label>
        <datalist id="pt-gol-models"></datalist>
        <div class="flex flex-wrap gap-1.5"><button type="button" class="pt-opt tap-active" data-gol="models">Find models</button><button type="button" class="pt-opt tap-active" data-gol="test">Test connection</button></div>
        <p id="pt-gol-st" class="text-[11px] text-zinc-300" aria-live="polite"></p>
        <details class="pt-gol-help"><summary>How to set it up</summary>
          <ol>
            <li>Install Ollama on your computer and pull a model, for example <b>ollama pull llama3.2</b>.</li>
            <li>Let your phone and this app reach it: start Ollama with <b>OLLAMA_HOST=0.0.0.0</b> and <b>OLLAMA_ORIGINS=${esc(APP)}</b>, then restart it.</li>
            <li>Phone and computer on the same Wi-Fi. Type the computer's address with port 11434 above.</li>
            <li>Chrome asks to allow access to your local network: say yes. Safari on iPhone blocks plain http:// addresses from this app; give Ollama an https:// address (for example with Tailscale) instead.</li>
          </ol>
          <p>What is sent, only to the address above: your question and the facts the guide found for it. That is the guide's own answer (for an exercise you have done, it can include your last sets, how many workouts you have done it in and your best estimated 1RM), your program and workout in progress, your last 5 workouts (date, name, number of sets, exercise names; no weights) and kg or lb. Notes, body measurements, photos and form clips are not sent. Questions about pain, injuries, medicine or doses are never sent.</p>
        </details>
      </div>` : ""}`;
  }
  function draw() { const b = $("pt-guide-box"), a = A(); if (b && a) b.innerHTML = boxHtml(a); }
  const proto = ApplicationUI.prototype, oOpen = proto.openSettings;
  if (oOpen) proto.openSettings = function () { const r = oOpen.apply(this, arguments); try { draw(); } catch (e) { console.error("PulseTrack guide settings", e); } return r; };
  const status = (t, bad) => { const s = $("pt-gol-st"); if (s) { s.textContent = t; s.className = "text-[11px] " + (bad ? "text-rose-300" : "text-zinc-300"); } };
  function explain(e, url) {
    return ({ noaddr: "Type the address of Ollama first.", badaddr: "That address isn't valid. It looks like http://192.168.1.20:11434.",
      unreachable: `Couldn't reach ${url}. Check that Ollama is running, the address, that both are on the same Wi-Fi, and OLLAMA_HOST / OLLAMA_ORIGINS.` + blockedHint(url),
      timeout: `${url} didn't answer in time.`, origin: `Ollama refused this app. Set OLLAMA_ORIGINS=${APP} and restart Ollama.`,
      nomodel: "Ollama is there, but that model isn't. Tap Find models and pick one." }[e.why] || ("Something went wrong: " + e.message));
  }
  function keep(a) {
    const u = $("pt-gol-url"), m = $("pt-gol-model"); if (!u || !m) return;
    a.settings.guideOllama = { url: u.value.trim(), model: m.value.trim() }; save(a);
  }
  document.addEventListener("click", async e => {
    const t = e.target; if (!t || !t.closest) return;
    const a = A(); if (!a) return;
    const gb = t.closest("#pt-guide-box [data-gb]");
    if (gb) {
      keep(a); const want = gb.dataset.gb, gate = BOX.gates[want];
      if (gate && a.settings.guideBackend !== want && !(await gate())) { draw(); return; }
      a.settings.guideBackend = want; save(a); draw(); return;
    }
    const g = t.closest("#pt-guide-box [data-gol]"); if (!g) return;
    keep(a);
    const url = cfg().url;
    if (g.dataset.gol === "models") {
      status("Looking…");
      try {
        const r = await call("/api/tags", null, 8000), names = ((r && r.models) || []).map(m => m.name).filter(Boolean);
        const dl = $("pt-gol-models"); if (dl) dl.innerHTML = names.map(n => `<option value="${esc(n)}">`).join("");
        if (names.length && !cfg().model) { $("pt-gol-model").value = names[0]; keep(a); }
        status(names.length ? `Found ${names.length} model${names.length === 1 ? "" : "s"}: ${names.join(", ")}` : "Ollama answered but has no models yet. Run ollama pull llama3.2 on the computer.", !names.length);
      } catch (er) { status(explain(er, url), true); }
    } else if (g.dataset.gol === "test") {
      status("Testing…");
      try {
        const r = await call("/api/tags", null, 8000), names = ((r && r.models) || []).map(m => m.name);
        const m = cfg().model;
        if (!m) status("Connected. Now pick a model (Find models).", true);
        else if (!names.some(n => n === m || n.split(":")[0] === m)) status(`Connected, but there's no model called ${m}. Tap Find models.`, true);
        else status(`Connected to ${url}. ${m} is ready.`);
      } catch (er) { status(explain(er, url), true); }
    }
  });
  document.addEventListener("change", e => { if (e.target && (e.target.id === "pt-gol-url" || e.target.id === "pt-gol-model")) { const a = A(); if (a) keep(a); } });

  const css = document.createElement("style"); css.id = "pt-v360-css";
  css.textContent = `
    .pt-gol-l { display: flex; flex-direction: column; gap: .3rem; font-size: .75rem; font-weight: 700; color: rgb(var(--z200)); }
    .pt-gol-l input { width: 100%; min-width: 0; background: rgb(var(--z900)); border: 1px solid rgb(var(--z800)); border-radius: .6rem; padding: .55rem .65rem; font-size: .85rem; font-weight: 500; color: rgb(var(--z100)); }
    .pt-gol-l input:focus { outline: none; border-color: rgb(var(--a500)); }
    .pt-gol-help > summary { font-size: .75rem; font-weight: 700; color: rgb(var(--z100)); cursor: pointer; }
    .pt-gol-help ol { margin: .4rem 0; padding-left: 1.1rem; list-style: decimal; display: flex; flex-direction: column; gap: .3rem; }
    .pt-gol-help li, .pt-gol-help p { font-size: .72rem; line-height: 1.45; color: rgb(var(--z300)); overflow-wrap: anywhere; }
    .pt-gol-help b { color: rgb(var(--z100)); font-family: ui-monospace, monospace; font-weight: 600; }
  `;
  document.head.appendChild(css);
})();
