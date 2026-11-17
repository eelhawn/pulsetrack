/* =====================================================================
 * PulseTrack 3.7.0: the guide can ask a cloud AI service with your own API key (optional, off by default).
 *  Settings > Guide gets a third choice, "Cloud AI (your key)": Anthropic, OpenAI or Google, your key, a model.
 *  Consent: before the choice can be picked, a sheet shows the "Guide answers from a cloud AI service" item of PRIVACY.md, taken
 *  from the built page (the <template id="pt-legal-privacy">), so it is word for word the text the owner approved. Ticking
 *  "I have read this and agree" and Turn on saves a fingerprint of that text under localStorage "pt-cloud-ok". If the section
 *  ever changes, the fingerprint no longer matches: the option is off (the phone answers) until the person agrees again.
 *  Keys: localStorage "pt-cloud-keys" = { anthropic, openai, google }. The name doesn't start with "pulsetrack_", so a backup
 *  never holds it. Forget key deletes every key and switches the guide back to On this phone.
 *  Requests go straight from the phone to the service, only when a question is asked (Enter or a tapped question): the same
 *  instructions and facts as Ollama (PT.guideOllama.SYSTEM / facts). There is no Find models or Test connection button on purpose:
 *  the approved text says a request is sent only for a question. Pain, injury, medicine and dose questions are never sent.
 *  Every answer that involved a request has "What was sent" with the exact text (never the key).
 *  settings.guideBackend = "cloud"; settings.guideCloud = { provider, models: { anthropic, openai, google } }.
 *  Endpoints (checked Nov 2026): Anthropic /v1/messages with anthropic-dangerous-direct-browser-access; OpenAI
 *  /v1/chat/completions; Google /v1beta/models/{model}:generateContent with x-goog-api-key (Google calls this API "legacy" now,
 *  the Interactions API is its successor; move when generateContent stops working).
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined" || !PT.guide || !PT.guideOllama || !PT.guideBox || !PT.kit) return;
  const A = () => window.app, esc = s => PT.esc(s), $ = id => document.getElementById(id);
  const TIMEOUT = 30000, KEYS = "pt-cloud-keys", OK = "pt-cloud-ok", SECTION = "Guide answers from a cloud AI service";
  const { SYSTEM, facts, clean } = PT.guideOllama, BOX = PT.guideBox;

  const PROV = {
    anthropic: { name: "Anthropic", label: "Anthropic (Claude)", def: "claude-haiku-5-5", models: ["claude-haiku-5-5", "claude-sonnet-5-5"],
      keyAt: "https://platform.claude.com/settings/keys", terms: "https://www.anthropic.com/legal/privacy", hint: "" },
    openai: { name: "OpenAI", label: "OpenAI", def: "gpt-5-mini", models: ["gpt-5-mini", "gpt-5-nano", "gpt-6-luna"],
      keyAt: "https://platform.openai.com/api-keys", terms: "https://openai.com/policies/privacy-policy/", hint: "" },
    google: { name: "Google", label: "Google (Gemini)", def: "gemini-3.5-flash-lite", models: ["gemini-3.5-flash-lite", "gemini-3.6-flash"],
      keyAt: "https://aistudio.google.com/apikey", terms: "https://ai.google.dev/gemini-api/terms",
      hint: "Google's terms say that on its free tier it may use what you send to improve its products, and people may read it; paid use isn't used that way." },
  };

  /* ================================================================ storage: keys and consent stay on this phone, out of backups */
  const ls = {
    get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { } },
    del: k => { try { localStorage.removeItem(k); } catch (e) { } },
  };
  const keys = () => { try { const o = JSON.parse(ls.get(KEYS) || "{}"); return o && typeof o === "object" ? o : {}; } catch (e) { return {}; } };
  function setKey(p, k) { const o = keys(); if (k) o[p] = k; else delete o[p]; Object.keys(o).length ? ls.set(KEYS, JSON.stringify(o)) : ls.del(KEYS); }
  const save = a => BOX.save(a);
  function cfg() {
    const a = A(), g = (a && a.settings.guideCloud) || {}, p = PROV[g.provider] ? g.provider : "anthropic";
    return { provider: p, model: String((g.models || {})[p] || "").trim() || PROV[p].def, key: String(keys()[p] || "").trim() };
  }

  function sectionEl() {
    const t = $("pt-legal-privacy"); if (!t || !t.content) return null;
    const s = [...t.content.querySelectorAll("strong")].find(x => x.textContent.trim().startsWith(SECTION));
    return s ? s.closest("li") : null;
  }
  function fingerprint() {
    const el = sectionEl(); if (!el) return "";
    const t = el.textContent.replace(/\s+/g, " ").trim(); let h = 0x811c9dc5;
    for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return h.toString(16) + "-" + t.length;
  }
  function agreed() { const f = fingerprint(); if (!f) return false; try { const o = JSON.parse(ls.get(OK) || "null"); return !!(o && o.h === f); } catch (e) { return false; } }

  function askConsent(readOnly) {
    return new Promise(resolve => {
      const sec = sectionEl(); if (!sec) { resolve(false); return; }
      const el = PT.kit.sheet("pt-cloud-sheet", 70);
      const card = PT.kit.openSheet(el, `${PT.kit.head(readOnly ? "Cloud answers: what is sent" : "Before you turn on cloud answers", "From the Privacy Policy")}
        <div class="pt-cc-text">${sec.innerHTML}</div>
        ${readOnly ? `<button type="button" class="pt-cc-go" data-close>Close</button>` : `
        <label class="pt-cc-ok"><input type="checkbox" id="pt-cc-check"><span>I have read this and agree</span></label>
        <div class="pt-cc-row"><button type="button" class="pt-cc-no" data-close>Cancel</button><button type="button" class="pt-cc-go" id="pt-cc-go" disabled>Turn on</button></div>`}`);
      let done = false; const fin = v => { if (!done) { done = true; resolve(v); } };
      el.__onClose = () => fin(false);
      if (readOnly) return;
      const tick = card.querySelector("#pt-cc-check"), go = card.querySelector("#pt-cc-go");
      tick.addEventListener("change", () => { go.disabled = !tick.checked; });
      go.addEventListener("click", () => {
        if (!tick.checked) return;
        ls.set(OK, JSON.stringify({ h: fingerprint(), at: new Date().toISOString() }));
        fin(true); PT.kit.closeSheet(el);
      });
    });
  }

  /* ================================================================ the services */
  async function req(url, headers, body) {
    const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), TIMEOUT);
    try {
      const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body), signal: ctl.signal, cache: "no-store", credentials: "omit", mode: "cors", referrerPolicy: "no-referrer" });
      const txt = await res.text(); let js = null; try { js = JSON.parse(txt); } catch (e) { }
      if (!res.ok) {
        const msg = String((js && js.error && (js.error.message || (typeof js.error === "string" && js.error))) || (js && js.message) || ("HTTP " + res.status));
        const st = res.status, keyish = /api[ _-]?key|x-api-key|authenticat|unauthori[sz]ed|permission/i.test(msg);
        const why = st === 401 || st === 403 || (st === 400 && keyish) ? "key" : st === 404 || (st === 400 && /\bmodel\b/i.test(msg)) ? "model"
          : st === 429 ? "limit" : st >= 500 ? "busy" : "http";
        throw Object.assign(new Error(msg), { why, status: st });
      }
      return js;
    } catch (e) {
      if (e.why) throw e;
      throw Object.assign(new Error(e.name === "AbortError" ? "No answer in time" : "Couldn't reach it"), { why: e.name === "AbortError" ? "timeout" : "unreachable" });
    } finally { clearTimeout(t); }
  }
  const API = {
    // effort "low" keeps answers quick and cheap; a model that doesn't take it is asked again without it
    async anthropic(model, key, sys, user, light = true) {
      const body = { model, max_tokens: 1024, system: sys, messages: [{ role: "user", content: user }] };
      if (light) body.output_config = { effort: "low" };
      try {
        const r = await req("https://api.anthropic.com/v1/messages", { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" }, body);
        return ((r && r.content) || []).filter(b => b && b.type === "text").map(b => b.text).join("\n");
      } catch (e) { if (light && e.status === 400 && /effort|output_config/i.test(e.message)) return API.anthropic(model, key, sys, user, false); throw e; }
    },
    async openai(model, key, sys, user, light = true) {
      const body = { model, max_completion_tokens: 1200, messages: [{ role: "system", content: sys }, { role: "user", content: user }] };
      if (light) body.reasoning_effort = "low";
      try {
        const r = await req("https://api.openai.com/v1/chat/completions", { "content-type": "application/json", authorization: "Bearer " + key }, body);
        const m = r && r.choices && r.choices[0] && r.choices[0].message; return m && typeof m.content === "string" ? m.content : "";
      } catch (e) { if (light && e.status === 400 && /reasoning/i.test(e.message)) return API.openai(model, key, sys, user, false); throw e; }
    },
    async google(model, key, sys, user) {
      const id = encodeURIComponent(model.replace(/^models\//, ""));
      const r = await req(`https://generativelanguage.googleapis.com/v1beta/models/${id}:generateContent`, { "content-type": "application/json", "x-goog-api-key": key },
        { systemInstruction: { parts: [{ text: sys }] }, contents: [{ role: "user", parts: [{ text: user }] }], generationConfig: { maxOutputTokens: 1200 } });
      const c = r && r.candidates && r.candidates[0];
      return ((c && c.content && c.content.parts) || []).filter(p => p && !p.thought && typeof p.text === "string").map(p => p.text).join("\n");
    },
  };

  /* ================================================================ the backend */
  async function ask(q, c) {
    const base = PT.guide.searchAnswer(q, c);
    if (base && base.kind === "safety") return Object.assign({ backend: "search" }, base);   // never sent
    const a = A();
    if (!agreed()) {
      if (a && a.settings.guideBackend === "cloud") { a.settings.guideBackend = "search"; save(a); }
      return Object.assign({ backend: "search" }, base, { by: "Cloud answers are off until you read and agree to the Privacy Policy section again (Settings > Guide)." });
    }
    const { provider, model, key } = cfg(), P = PROV[provider];
    if (!key) throw Object.assign(new Error("No key"), { why: "nokey" });
    const user = "App facts:\n" + facts(base, c) + "\n\nQuestion: " + q;
    const sent = `To ${P.name}, model ${model}.\n\nInstructions:\n${SYSTEM}\n\n${user}`;
    let text = "";
    try { text = clean(await API[provider](model, key, SYSTEM, user)); }
    catch (e) { e.sent = sent; e.model = model; throw e; }
    if (!text) throw Object.assign(new Error("Empty answer"), { why: "empty", sent });
    const has = base && base.kind !== "none";
    return { kind: has ? base.kind : "model", title: has ? base.title : "Answer", text, list: [], avoid: "", note: has && base.kind === "form" ? base.note : "",
      actions: has ? base.actions || [] : [], also: has ? base.also : null, score: 1, sent,
      by: `Written by ${model} (${P.name}) with your key, from the app's facts.` };
  }
  function explain(e) {
    const { model } = cfg();
    return ({ nokey: "no API key is saved: add one in Settings > Guide", key: "it refused the API key", model: `it has no model called ${e.model || model}: check the model in Settings > Guide`,
      limit: "too many requests, or no credit left on the account", busy: "it's busy right now", timeout: "no answer within 30 seconds",
      unreachable: "couldn't reach it: check your connection", empty: "it sent back an empty answer" }[e.why]) || ("it refused the request: " + String(e.message || "").slice(0, 140));
  }
  const backend = { ask, explain };
  Object.defineProperty(backend, "label", { enumerable: true, get: () => PROV[cfg().provider].name });
  PT.guide.backends.cloud = backend;

  /* ================================================================ Settings > Guide */
  BOX.opts.push(["cloud", "Cloud AI (your key)"]);
  BOX.notes.cloud = "Your question and the facts the guide found go straight from this phone to the service you pick, with your key. If it doesn't answer, the phone does.";
  BOX.gates.cloud = () => agreed() ? Promise.resolve(true) : askConsent(false);
  BOX.panels.cloud = function (a) {
    const c = cfg(), P = PROV[c.provider], any = Object.keys(keys()).length > 0;
    return `<div class="p-3.5 space-y-2.5 bg-zinc-950 border border-zinc-800 rounded-xl" id="pt-gcl">
        <span class="text-xs font-bold text-white block">Service</span>
        <div class="flex flex-wrap gap-1.5" role="group" aria-label="Cloud AI service">
          ${Object.entries(PROV).map(([id, p]) => `<button type="button" class="pt-opt tap-active" data-gcp="${id}" aria-pressed="${id === c.provider}">${esc(p.label)}</button>`).join("")}
        </div>
        <label class="pt-gol-l">${esc(P.name)} API key<input id="pt-gcl-key" type="password" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${c.key ? "Paste a new key to replace it" : "Paste your key"}" value=""></label>
        <p class="text-[11px] text-zinc-400" id="pt-gcl-has">${c.key ? `A key for ${esc(P.name)} is saved on this phone, ending in ${esc(c.key.slice(-4))}.` : `No key yet. Make one in your ${esc(P.name)} account: <a class="pt-gcl-a" href="${P.keyAt}" target="_blank" rel="noopener noreferrer">${esc(P.keyAt.replace(/^https:\/\//, ""))}</a>`}</p>
        <label class="pt-gol-l">Model<input id="pt-gcl-model" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${esc(P.def)}" value="${esc(c.model)}" list="pt-gcl-models"></label>
        <datalist id="pt-gcl-models">${P.models.map(m => `<option value="${esc(m)}">`).join("")}</datalist>
        <div class="flex flex-wrap gap-1.5">${any ? `<button type="button" class="pt-opt tap-active" data-gcl="forget">Forget key</button>` : ""}<button type="button" class="pt-opt tap-active" data-gcl="policy">What is sent</button></div>
        <p id="pt-gcl-st" class="text-[11px] text-zinc-300" aria-live="polite"></p>
        <details class="pt-gol-help"><summary>Costs and the service's terms</summary>
          <p>Each question is one request, charged to your ${esc(P.name)} account. Set a spending limit there. ${esc(P.def)} is a small, cheap model.</p>
          <p>Nothing is sent while you type or when you open this screen: only when you press Enter or tap a question in the guide.</p>
          <p>${esc(P.name)}'s terms decide what happens to what you send: <a class="pt-gcl-a" href="${P.terms}" target="_blank" rel="noopener noreferrer">${esc(P.terms.replace(/^https:\/\//, ""))}</a></p>
          ${P.hint ? `<p>${esc(P.hint)}</p>` : ""}
        </details>
      </div>`;
  };
  const status = (t, bad) => { const s = $("pt-gcl-st"); if (s) { s.textContent = t; s.className = "text-[11px] " + (bad ? "text-rose-300" : "text-zinc-300"); } };
  function keepModel(a) {
    const m = $("pt-gcl-model"); if (!m) return;
    const c = cfg(), g = a.settings.guideCloud = Object.assign({ provider: c.provider, models: {} }, a.settings.guideCloud || {});
    g.models = Object.assign({}, g.models); g.models[c.provider] = m.value.trim(); save(a);
  }
  function keepKey() {
    const k = $("pt-gcl-key"); if (!k) return false;
    const v = k.value.replace(/\s+/g, ""); if (!v) return false;
    setKey(cfg().provider, v); k.value = ""; return true;
  }
  document.addEventListener("click", async e => {
    const t = e.target; if (!t || !t.closest) return;
    const a = A(); if (!a) return;
    const p = t.closest("#pt-guide-box [data-gcp]");
    if (p) {
      keepModel(a); keepKey();
      a.settings.guideCloud = Object.assign({ models: {} }, a.settings.guideCloud || {}, { provider: p.dataset.gcp }); save(a); BOX.draw(); return;
    }
    const g = t.closest("#pt-guide-box [data-gcl]"); if (!g) return;
    if (g.dataset.gcl === "forget") {
      ls.del(KEYS); a.settings.guideBackend = "search"; save(a); BOX.draw();
      if (a.toast) a.toast("Keys deleted from this phone. The guide answers on the phone again.");
    } else if (g.dataset.gcl === "policy") { askConsent(true); }
  });
  document.addEventListener("change", e => {
    const a = A(); if (!a || !e.target) return;
    if (e.target.id === "pt-gcl-model") keepModel(a);
    if (e.target.id === "pt-gcl-key" && keepKey()) { BOX.draw(); status("Key saved on this phone."); }
  });

  const css = document.createElement("style"); css.id = "pt-v370-css";
  css.textContent = `
    #pt-cloud-sheet .pt-cc-text { font-size: .8125rem; line-height: 1.55; color: rgb(var(--z300)); max-height: 52vh; overflow-y: auto; padding: .25rem .75rem .25rem 0; }
    #pt-cloud-sheet .pt-cc-text p { margin: .5rem 0; }
    #pt-cloud-sheet .pt-cc-text p:first-child { margin-top: 0; }
    #pt-cloud-sheet .pt-cc-text ul { margin: .4rem 0; padding-left: 1.125rem; list-style: disc; }
    #pt-cloud-sheet .pt-cc-text ul ul { list-style: circle; margin: .25rem 0; }
    #pt-cloud-sheet .pt-cc-text li { margin: .3rem 0; }
    #pt-cloud-sheet .pt-cc-text li > p { margin: 0; }
    #pt-cloud-sheet .pt-cc-text strong { color: rgb(var(--z100)); }
    #pt-cloud-sheet .pt-cc-ok { display: flex; gap: .75rem; align-items: flex-start; font-size: .875rem; line-height: 1.4; font-weight: 600; color: rgb(var(--z100));
      padding: .75rem; border: 1px solid rgb(var(--z800)); border-radius: .75rem; cursor: pointer; }
    #pt-cloud-sheet .pt-cc-ok input { width: 1.25rem; height: 1.25rem; flex: none; margin-top: .05rem; accent-color: rgb(var(--a600)); }
    #pt-cloud-sheet .pt-cc-row { display: flex; gap: .5rem; }
    #pt-cloud-sheet .pt-cc-go, #pt-cloud-sheet .pt-cc-no { flex: 1; width: 100%; padding: .8rem; border-radius: .75rem; font-size: .9375rem; font-weight: 800; }
    #pt-cloud-sheet .pt-cc-go { background: rgb(var(--a600)); color: #fff; }
    #pt-cloud-sheet .pt-cc-no { background: rgb(var(--z800)); color: rgb(var(--z100)); }
    #pt-cloud-sheet .pt-cc-go:disabled { background: rgb(var(--z800)); color: rgb(var(--z400)); cursor: not-allowed; }
    #pt-cloud-sheet .pt-cc-go:focus-visible, #pt-cloud-sheet .pt-cc-no:focus-visible, #pt-cloud-sheet .pt-cc-ok:focus-within { outline: 2px solid rgb(var(--a400)); outline-offset: 2px; }
    .pt-gcl-a { color: rgb(var(--z100)); text-decoration: underline; overflow-wrap: anywhere; }
    #pt-legal .lg-box li > p { margin: .375rem 0; }
    #pt-legal .lg-box li > p:first-child { margin-top: 0; }
    #pt-legal .lg-box ul ul { list-style: circle; margin: .25rem 0; }
  `;
  document.head.appendChild(css);
  PT.guideCloud = { PROV, cfg, agreed, askConsent, fingerprint, sectionEl, keys, explain };
})();
