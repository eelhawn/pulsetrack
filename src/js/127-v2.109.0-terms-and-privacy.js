/* =====================================================================
 * PulseTrack 2.109.0: terms and privacy.
 *
 *  - On the very first launch a full-screen sheet shows the Terms of Service and the Privacy Policy in one scrolling box. It cannot be
 *    closed: Enter App stays disabled until the box "I have read and agree to the Terms of Service and Privacy Policy" is ticked.
 *  - The text is TERMS.md and PRIVACY.md from the repo root, turned into HTML by tools/build.py (the md slots in the template), so the app
 *    shows exactly what the repo shows. Nothing is fetched.
 *  - Accepting saves { v, at } under localStorage "pt-terms". It is asked again only when TERMS_V below changes (bump it when either
 *    document changes in a way people should agree to again) or when the site's data is cleared. If storage is blocked (some private
 *    windows) the person still gets in for that visit.
 *  - While it is open the rest of the page is inert, so taps, the keyboard and screen readers stay in the sheet.
 *  - Settings > App > Terms and Privacy opens the same text to read again, with a Close button and the date it was accepted.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;

  const TERMS_V = "2026-11-16", KEY = "pt-terms";

  const saved = () => { try { const o = JSON.parse(localStorage.getItem(KEY) || "null"); return o && o.v === TERMS_V ? o : null; } catch (e) { return null; } };

  const css = document.createElement("style");
  css.id = "pt-legal-css";
  css.textContent = `
    #pt-legal { position: fixed; inset: 0; z-index: 2147483000; display: flex; align-items: center; justify-content: center;
      background: rgb(0 0 0 / .8); padding: env(safe-area-inset-top, 0px) 0 0; }
    #pt-legal .lg-card { display: flex; flex-direction: column; width: 100%; max-width: 32rem; height: 100%; max-height: 100%;
      background: rgb(var(--z900)); color: rgb(var(--z100)); border: 1px solid rgb(var(--z800));
      padding: 1rem 1rem calc(1rem + env(safe-area-inset-bottom, 0px)); gap: .75rem; }
    @media (min-width: 640px) { #pt-legal { padding: 1.5rem; } #pt-legal .lg-card { height: auto; max-height: min(90vh, 52rem); border-radius: 1rem; } }
    #pt-legal h2.lg-t { font-size: 1.125rem; font-weight: 800; margin: 0; }
    #pt-legal .lg-sub { font-size: .8125rem; line-height: 1.45; color: rgb(var(--z300)); margin: 0; }
    #pt-legal .lg-jump { display: flex; gap: .5rem; }
    #pt-legal .lg-jump button { font-size: .75rem; font-weight: 700; padding: .375rem .75rem; border-radius: 999px;
      background: rgb(var(--z800)); color: rgb(var(--z100)); }
    #pt-legal .lg-box { flex: 1 1 auto; min-height: 9rem; overflow-y: auto; overscroll-behavior: contain; -webkit-overflow-scrolling: touch;
      background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); border-radius: .75rem; padding: .25rem 1rem 1rem;
      font-size: .8125rem; line-height: 1.55; color: rgb(var(--z200)); overflow-wrap: anywhere; }
    #pt-legal .lg-box:focus-visible { outline: 2px solid rgb(var(--a400)); outline-offset: 2px; }
    #pt-legal .lg-box h2 { font-size: 1rem; font-weight: 800; color: rgb(var(--z100)); margin: 1.25rem 0 .25rem; }
    #pt-legal .lg-box section + section { border-top: 1px solid rgb(var(--z800)); margin-top: 1.25rem; }
    #pt-legal .lg-box h3 { font-size: .875rem; font-weight: 700; color: rgb(var(--z100)); margin: 1rem 0 .25rem; }
    #pt-legal .lg-box p { margin: .5rem 0; }
    #pt-legal .lg-box ul { margin: .5rem 0; padding-left: 1.125rem; list-style: disc; }
    #pt-legal .lg-box li { margin: .375rem 0; }
    #pt-legal .lg-box strong { color: rgb(var(--z100)); }
    #pt-legal .lg-box a { color: rgb(var(--z100)); text-decoration: underline; }
    #pt-legal .lg-agree { display: flex; gap: .75rem; align-items: flex-start; font-size: .875rem; line-height: 1.4; font-weight: 600;
      padding: .75rem; border: 1px solid rgb(var(--z800)); border-radius: .75rem; cursor: pointer; }
    #pt-legal .lg-agree input { width: 1.25rem; height: 1.25rem; flex: none; margin-top: .05rem; accent-color: rgb(var(--a600)); }
    #pt-legal .lg-go { width: 100%; padding: .875rem; border-radius: .75rem; font-size: .9375rem; font-weight: 800;
      background: rgb(var(--a600)); color: #fff; }
    #pt-legal .lg-go:disabled { background: rgb(var(--z800)); color: rgb(var(--z400)); cursor: not-allowed; }
    #pt-legal .lg-go:focus-visible, #pt-legal .lg-agree:focus-within { outline: 2px solid rgb(var(--a400)); outline-offset: 2px; }
    #pt-legal .lg-when { font-size: .75rem; color: rgb(var(--z400)); margin: 0; }
  `;
  document.head.appendChild(css);

  const body = id => { const t = document.getElementById(id); return t ? t.innerHTML : ""; };
  let open = null;

  function show(readOnly) {
    if (open) return open;
    const prior = document.activeElement;
    const wrap = document.createElement("div");
    wrap.id = "pt-legal";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-modal", "true");
    wrap.setAttribute("aria-labelledby", "pt-legal-t");
    const ok = saved();
    wrap.innerHTML = `<div class="lg-card">
        <h2 class="lg-t" id="pt-legal-t">${readOnly ? "Terms and Privacy" : "Before you start"}</h2>
        ${readOnly ? "" : `<p class="lg-sub">PulseTrack tracks your training. It does not give medical advice, and everything you log stays on this device. Please read the terms below.</p>`}
        <div class="lg-jump"><button type="button" data-j="lg-terms">Terms of Service</button><button type="button" data-j="lg-privacy">Privacy Policy</button></div>
        <div class="lg-box" id="pt-legal-box" tabindex="0" role="document" aria-label="Terms of Service and Privacy Policy">
          <section id="lg-terms">${body("pt-legal-terms")}</section>
          <section id="lg-privacy">${body("pt-legal-privacy")}</section>
        </div>
        ${readOnly
          ? `${ok && ok.at ? `<p class="lg-when">You agreed on ${new Date(ok.at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}.</p>` : ""}
             <button type="button" class="lg-go" id="pt-legal-go">Close</button>`
          : `<label class="lg-agree"><input type="checkbox" id="pt-legal-ok"><span>I have read and agree to the Terms of Service and Privacy Policy</span></label>
             <button type="button" class="lg-go" id="pt-legal-go" disabled>Enter App</button>`}
      </div>`;

    // everything else on the page is out of reach while this is open
    const others = [...document.body.children].filter(e => e !== wrap && e.tagName !== "SCRIPT" && e.tagName !== "STYLE" && e.tagName !== "TEMPLATE" && !e.inert);
    others.forEach(e => { e.inert = true; });
    const lockY = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.appendChild(wrap);

    const box = wrap.querySelector("#pt-legal-box"), go = wrap.querySelector("#pt-legal-go"), tick = wrap.querySelector("#pt-legal-ok");
    wrap.querySelectorAll("[data-j]").forEach(b => b.addEventListener("click", () => {
      const s = wrap.querySelector("#" + b.dataset.j);
      box.scrollTop = s.offsetTop - box.offsetTop;
    }));
    if (tick) tick.addEventListener("change", () => { go.disabled = !tick.checked; });

    // keep Tab inside the sheet; Escape does nothing on the first launch
    wrap.addEventListener("keydown", e => {
      if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); if (readOnly) close(); return; }
      if (e.key !== "Tab") return;
      const f = [...wrap.querySelectorAll("button, input, [tabindex='0']")].filter(x => !x.disabled);
      if (!f.length) return;
      const i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    });

    function close() {
      others.forEach(e => { e.inert = false; });
      document.documentElement.style.overflow = lockY;
      wrap.remove();
      open = null;
      if (prior && prior.focus && document.contains(prior)) prior.focus();
    }

    go.addEventListener("click", () => {
      if (!readOnly) {
        if (!tick.checked) return;
        try { localStorage.setItem(KEY, JSON.stringify({ v: TERMS_V, at: new Date().toISOString() })); } catch (e) { /* blocked storage: let them in this visit */ }
      }
      close();
    });

    setTimeout(() => box.focus({ preventScroll: true }), 0);
    open = wrap;
    return wrap;
  }

  PT.legal = { show, accepted: () => !!saved(), version: TERMS_V, key: KEY };

  const btn = document.getElementById("btn-legal");
  if (btn) btn.addEventListener("click", () => show(true));

  if (!saved()) show(false);
})();
