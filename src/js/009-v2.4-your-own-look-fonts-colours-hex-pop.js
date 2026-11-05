
    /* =====================================================================
     * PulseTrack 2.4 — your own look (fonts, colours, hex), pop-ups that match the app,
     * auto rest timer, tidy pickers. Storage no longer has a size cap (see PTLS).
     * ===================================================================== */
    (function () {
      "use strict";
      const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

      /* =============================================================== dialogs */
      const SVG = {
        warn: '<svg viewBox="0 0 24 24" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>',
        ask: '<svg viewBox="0 0 24 24" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.5"/><path d="M9.2 9.2a3 3 0 1 1 4.2 2.7c-.9.4-1.4 1-1.4 1.9M12 17h.01"/></svg>',
        info: '<svg viewBox="0 0 24 24" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.5"/><path d="M12 11v5m0-8h.01"/></svg>',
        edit: '<svg viewBox="0 0 24 24" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
        link: '<svg viewBox="0 0 24 24" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/></svg>',
        check: '<svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5 10 17.5 19 7"/></svg>',
        chev: '<svg viewBox="0 0 24 24" class="w-3.5 h-3.5 shrink-0 opacity-70" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>'
      };
      // Special wording for messages the app already had
      const KNOWN = [
        [/No sets are checked off yet/i, { title: "No sets checked off yet", ok: "Finish anyway", cancel: "Keep training" }],
        [/Start a fresh empty workout/i, { title: "Start a fresh workout?", ok: "Start fresh", cancel: "Cancel" }],
        [/has no exercises/i, { title: "Rest day", ok: "Mark as done", cancel: "Not yet", danger: false }],
        [/Discard this program/i, { title: "Discard this program?", ok: "Discard", cancel: "Keep editing", danger: true }],
        [/^Reset EVERYTHING/i, { ok: "Continue", cancel: "Cancel", danger: true }],
        [/^Last check/i, { ok: "Reset now", cancel: "Cancel", danger: true }],
        [/Delete this workout from your history/i, { ok: "Delete workout", danger: true }],
        [/Delete this entry/i, { ok: "Delete entry", danger: true }],
        [/Merge ".*" →/i, { title: "Merge these exercises?", ok: "Merge" }],
        [/isn't in your exercise list/i, { ok: "Merge anyway" }],
        [/Replace them with the weights/i, { title: "Replace today's sets?", ok: "Replace", cancel: "Cancel" }],
        [/^Add the program/i, { title: "Add this program?", ok: "Add program" }],
        [/Restore the backup/i, { ok: "Restore", danger: true }],
        [/Remove your custom rest time/i, { ok: "Remove", danger: true }]
      ];
      function splitMsg(msg) {
        msg = String(msg == null ? "" : msg).trim();
        const parts = msg.split(/\n\s*\n/);
        if (parts.length > 1) return { title: parts[0], body: parts.slice(1).join("\n\n") };
        if (msg.length <= 84 && msg.indexOf("\n") < 0) return { title: msg, body: "" };
        const m = msg.match(/^(.{8,92}?[.?!:])\s+([\s\S]+)$/);
        return m ? { title: m[1], body: m[2] } : { title: "", body: msg };
      }
      function toneOf(msg) { return /\b(delete|remove|reset|clear|discard|erase|forget|can't be undone|cannot be undone|replaces? all)\b/i.test(msg); }
      function okLabel(msg) {
        const m = String(msg);
        if (/\bdelete\b/i.test(m)) return "Delete";
        if (/\bremove\b/i.test(m)) return "Remove";
        if (/\breset\b/i.test(m)) return "Reset";
        if (/\bclear\b/i.test(m)) return "Clear";
        if (/\breplace\b/i.test(m)) return "Replace";
        if (/\brestore\b/i.test(m)) return "Restore";
        if (/\bmerge\b/i.test(m)) return "Merge";
        if (/\badd the program\b/i.test(m)) return "Add";
        return "Yes";
      }
      function rich(text) {
        return esc(text).replace(/&quot;([^&]{1,80}?)&quot;/g, '<b class="text-white font-semibold">$1</b>');
      }
      let root = null, queue = Promise.resolve();
      function ensureRoot() {
        if (root) return root;
        root = document.createElement("div");
        root.id = "pt-dlg";
        root.className = "fixed inset-0 z-[400] hidden items-center justify-center p-4";
        root.setAttribute("role", "dialog");
        root.setAttribute("aria-modal", "true");
        root.innerHTML = '<div data-bd class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div><div class="pt-dlg-card relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden" style="max-height:88vh;display:flex;flex-direction:column"></div>';
        document.body.appendChild(root);
        return root;
      }
      function show(spec) {
        return new Promise(resolve => {
          const el = ensureRoot(), card = el.querySelector(".pt-dlg-card"), tok = (el.__tok = (el.__tok || 0) + 1);
          const kind = spec.kind;
          const k = (KNOWN.find(x => x[0].test(String(spec.msg))) || [])[1] || {};
          const parts = splitMsg(spec.msg);
          let title = spec.title || parts.title, body = spec.body != null ? spec.body : parts.body;
          if (!spec.title && k.title) { title = k.title; if (spec.body == null) body = String(spec.msg); }
          if (body && String(body).trim() === String(title).trim()) body = "";
          const danger = spec.danger != null ? spec.danger : (k.danger != null ? k.danger : (kind === "confirm" && toneOf(spec.msg)));
          if (kind === "prompt") title = (title || "Enter a value").replace(/[:：]\s*$/, "");
          if (!title) title = kind === "alert" ? "Heads up" : kind === "confirm" ? "Please confirm" : "Choose";
          const icon = spec.icon || (danger ? "warn" : kind === "prompt" ? (spec.copy ? "link" : "edit") : kind === "alert" ? "info" : "ask");
          const iconCls = danger ? "bg-rose-500/15 text-rose-400" : "bg-emerald-500/15 text-emerald-400";
          const okText = spec.ok || k.ok || (kind === "confirm" ? okLabel(spec.msg) : kind === "alert" ? "OK" : "Save");
          const cancelText = spec.cancel || k.cancel || "Cancel";
          const okCls = danger ? "bg-rose-600 hover:bg-rose-500 text-white" : "bg-emerald-600 hover:bg-emerald-500 text-white";
          const num = kind === "prompt" && (spec.type === "number" || (spec.type !== "text" && /\b(weight|week|1rm|how many|reps|sets|minutes|seconds)\b/i.test(String(spec.msg)) && !/\bnote\b/i.test(String(spec.msg))));
          const multi = kind === "prompt" && !num && (spec.multi || /\bnote\b/i.test(String(spec.msg)));
          let inner = `<div class="p-5 pb-4 overflow-y-auto hide-scrollbar" style="min-height:0"><div class="flex items-start gap-3.5">
              <div class="shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center ${iconCls}">${SVG[icon] || SVG.info}</div>
              <div class="min-w-0 flex-1 pt-0.5"><h3 id="pt-dlg-title" class="text-base font-bold text-white leading-snug break-words">${rich(title)}</h3>
              ${body ? `<p class="text-[13px] text-zinc-400 mt-1.5 leading-relaxed whitespace-pre-line break-words">${rich(body)}</p>` : ""}</div></div>`;
          if (kind === "prompt") {
            const val = esc(spec.def == null ? "" : spec.def);
            inner += multi
              ? `<textarea id="pt-dlg-input" rows="3" class="mt-4 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-3 text-base text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500" style="user-select:text;resize:none" ${spec.placeholder ? `placeholder="${esc(spec.placeholder)}"` : ""}>${val}</textarea>`
              : `<input id="pt-dlg-input" type="text" ${num ? 'inputmode="decimal"' : ""} ${spec.readonly ? "readonly" : ""} value="${val}" autocomplete="off" autocapitalize="${num || spec.readonly ? "off" : "sentences"}" spellcheck="false" class="mt-4 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-3 text-base text-white ${spec.readonly ? "font-mono text-sm" : ""} placeholder-zinc-600 focus:outline-none focus:border-emerald-500" style="user-select:text" ${spec.placeholder ? `placeholder="${esc(spec.placeholder)}"` : ""}>`;
          }
          if (kind === "list") {
            inner += `<div class="mt-3 -mx-2 space-y-1" id="pt-dlg-list">${(spec.options || []).map((o, i) => {
              const on = String(o.value) === String(spec.value);
              return `<button data-i="${i}" class="w-full flex items-center justify-between gap-3 text-left px-3.5 py-3 rounded-xl tap-active ${on ? "bg-emerald-600/20 text-emerald-300 border border-emerald-600/40" : "bg-zinc-800/60 text-zinc-100 border border-transparent"}"><span class="text-sm font-semibold">${esc(o.label)}</span>${on ? SVG.check : ""}</button>`;
            }).join("")}</div>`;
          }
          inner += `</div><div class="px-5 pb-5 pt-1">`;
          if (kind === "choose") {
            const bs = spec.buttons || [];
            inner += `<div class="space-y-2">${bs.map((b, i) => `<button data-b="${i}" class="w-full py-3 rounded-xl text-sm font-bold tap-active ${i === 0 ? okCls : "bg-zinc-800 hover:bg-zinc-700 text-zinc-100"}">${esc(b)}</button>`).join("")}<button data-b="-1" class="w-full py-2.5 rounded-xl text-sm font-semibold text-zinc-400 tap-active">${esc(cancelText)}</button></div>`;
          } else if (kind === "alert") {
            inner += `<button data-ok class="w-full py-3 rounded-xl text-sm font-bold tap-active ${okCls}">${esc(okText)}</button>`;
          } else if (kind === "list") {
            inner += `<button data-cancel class="w-full py-3 rounded-xl text-sm font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 tap-active">${esc(cancelText)}</button>`;
          } else {
            inner += `<div class="flex gap-2.5"><button data-cancel class="flex-1 py-3 rounded-xl text-sm font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 tap-active">${esc(cancelText)}</button><button data-ok class="flex-[1.25] py-3 rounded-xl text-sm font-bold tap-active ${okCls}">${esc(okText)}</button></div>`;
          }
          inner += "</div>";
          card.innerHTML = inner;
          el.setAttribute("aria-labelledby", "pt-dlg-title");
          el.classList.remove("hidden"); el.classList.add("flex");
          el.style.alignItems = kind === "prompt" && !spec.readonly ? "flex-start" : "center";
          el.style.paddingTop = kind === "prompt" && !spec.readonly ? "max(6vh, env(safe-area-inset-top))" : "";
          el.style.opacity = "1";
          const prevFocus = document.activeElement;
          let done = false;
          const input = card.querySelector("#pt-dlg-input");
          const cancelVal = kind === "confirm" ? false : kind === "alert" ? undefined : kind === "choose" ? -1 : null;
          function close(val) {
            if (done) return; done = true;
            document.removeEventListener("keydown", onKey, true);
            el.style.opacity = "0";
            setTimeout(() => { if (el.__tok !== tok) return; el.classList.add("hidden"); el.classList.remove("flex"); el.style.opacity = "1"; card.innerHTML = ""; }, 130);
            try { if (prevFocus && prevFocus.focus && document.contains(prevFocus)) prevFocus.focus({ preventScroll: true }); } catch (e) {}
            resolve(val);
          }
          async function submit() {
            if (kind === "prompt") {
              if (spec.copy && input) {
                let ok = false;
                try { await navigator.clipboard.writeText(input.value); ok = true; } catch (e) {}
                if (!ok) { try { input.focus(); input.select(); ok = document.execCommand("copy"); } catch (e) {} }
                const b = card.querySelector("[data-ok]"); if (b) b.textContent = ok ? "Copied ✓" : "Select & copy it";
                if (ok) setTimeout(() => close(input.value), 650);
                return;
              }
              close(input ? input.value : "");
            } else if (kind === "confirm") close(true);
            else close(undefined);
          }
          function onKey(e) {
            if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(cancelVal); return; }
            if (e.key === "Enter" && !(e.target && e.target.tagName === "TEXTAREA" && !(e.metaKey || e.ctrlKey)) && kind !== "choose" && kind !== "list") {
              if (e.target && e.target.tagName === "BUTTON" && !e.target.hasAttribute("data-ok")) return;
              e.preventDefault(); e.stopPropagation(); submit();
            }
            if (e.key === "Tab") {
              const f = [...card.querySelectorAll("button,input,textarea")].filter(x => !x.disabled && x.offsetParent !== null);
              if (!f.length) return;
              const i = f.indexOf(document.activeElement);
              if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
              else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
            }
          }
          document.addEventListener("keydown", onKey, true);
          el.querySelector("[data-bd]").onclick = () => close(cancelVal);
          const okBtn = card.querySelector("[data-ok]"); if (okBtn) okBtn.onclick = submit;
          const cBtn = card.querySelector("[data-cancel]"); if (cBtn) cBtn.onclick = () => close(cancelVal);
          card.querySelectorAll("[data-b]").forEach(b => b.onclick = () => close(parseInt(b.dataset.b, 10)));
          card.querySelectorAll("#pt-dlg-list [data-i]").forEach(b => b.onclick = () => close((spec.options[parseInt(b.dataset.i, 10)] || {}).value));
          setTimeout(() => {
            try {
              if (input) { input.focus({ preventScroll: true }); input.select(); }
              else { const f = card.querySelector("[data-ok]") || card.querySelector("[data-b='0']") || card.querySelector("[data-cancel]"); if (f) f.focus({ preventScroll: true }); }
            } catch (e) {}
          }, 30);
        });
      }
      const dlg = spec => (queue = queue.then(() => show(spec), () => show(spec)));
      const hook = (t, m, d) => (typeof window.__ptDialogHook === "function" ? Promise.resolve(window.__ptDialogHook(t, String(m), d)) : null);
      Object.assign(PT, {
        async alert(msg, o) { const h = hook("alert", msg); if (h) { await h; return; } await dlg(Object.assign({ kind: "alert", msg }, o)); },
        async confirm(msg, o) { const h = hook("confirm", msg); if (h) return !!(await h); return !!(await dlg(Object.assign({ kind: "confirm", msg }, o))); },
        async prompt(msg, def, o) { const h = hook("prompt", msg, def); if (h) { const r = await h; return r === undefined ? null : r; } return dlg(Object.assign({ kind: "prompt", msg, def }, o)); },
        /** Several buttons. Returns the index of the one tapped, or -1 for Cancel. */
        async choose(msg, buttons, o) { const h = hook("choose", msg, buttons); if (h) { const r = await h; return typeof r === "number" ? r : 0; } return dlg(Object.assign({ kind: "choose", msg, buttons }, o)); },
        /** Pick one value from a list. Returns the value or null. */
        async pickList(title, options, value, o) { const h = hook("list", title, options); if (h) { const r = await h; return r === undefined ? null : r; } return dlg(Object.assign({ kind: "list", msg: title, title, options, value }, o)); }
      });

      /* ===================================================== custom pickers */
      // Native <select> menus are the grey system pop-up. Replace them with our own list.
      const SELECTS = [];
      function enhanceSelect(sel) {
        if (sel.__pt) return;
        sel.__pt = true;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = sel.className.replace(/focus:[^\s]+/g, "") + " pt-select-btn inline-flex items-center justify-between gap-1.5 tap-active";
        sel.style.display = "none";
        sel.parentNode.insertBefore(btn, sel.nextSibling);
        const label = () => { const o = sel.options[sel.selectedIndex]; return o ? o.textContent : ""; };
        const sync = () => { btn.innerHTML = `<span class="truncate">${esc(label())}</span>${SVG.chev}`; };
        btn.addEventListener("click", async e => {
          e.preventDefault();
          const title = sel.getAttribute("aria-label") || (sel.closest("label") && sel.closest("label").querySelector("span") ? sel.closest("label").querySelector("span").firstChild.textContent.trim() : "Choose");
          const opts = [...sel.options].map(o => ({ value: o.value, label: o.textContent }));
          const v = await PT.pickList(title, opts, sel.value);
          if (v == null) return;
          sel.value = v;
          sel.dispatchEvent(new Event("change", { bubbles: true }));
          sync();
        });
        SELECTS.push({ sel, sync });
        sync();
      }
      PT.syncSelects = function () {
        document.querySelectorAll("select").forEach(enhanceSelect);
        SELECTS.forEach(s => s.sync());
      };

      /* ============================================================ colours */
      const hx = h => { h = String(h).replace("#", ""); if (h.length === 3) h = h.split("").map(c => c + c).join(""); return [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16)); };
      const toHex = ([r, g, b]) => "#" + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
      const triple = h => hx(h).join(" ");
      function rgb2hsl([r, g, b]) {
        r /= 255; g /= 255; b /= 255;
        const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, s = 0; const l = (mx + mn) / 2;
        if (mx !== mn) {
          const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn);
          h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60;
        }
        return [h, s * 100, l * 100];
      }
      function hsl2rgb([h, s, l]) {
        h = ((h % 360) + 360) % 360; s = Math.max(0, Math.min(100, s)) / 100; l = Math.max(0, Math.min(100, l)) / 100;
        const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
        const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
        return [f(0) * 255, f(8) * 255, f(4) * 255];
      }
      const lum = ([r, g, b]) => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
      const validHex = s => /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.test(String(s || "").trim());
      const normHex = s => { s = String(s).trim().replace("#", ""); if (s.length === 3) s = s.split("").map(c => c + c).join(""); return "#" + s.toLowerCase(); };

      // Tailwind colour scales (300 400 500 600 800 950)
      const P = (a, b, c, d, e, f) => [a, b, c, d, e, f];
      const ACCENTS = [
        { id: "emerald",  label: "Emerald",  s: P("#6ee7b7", "#34d399", "#10b981", "#059669", "#065f46", "#022c22") },
        { id: "green",    label: "Green",    s: P("#86efac", "#4ade80", "#22c55e", "#16a34a", "#166534", "#052e16") },
        { id: "lime",     label: "Lime",     s: P("#bef264", "#a3e635", "#84cc16", "#65a30d", "#3f6212", "#1a2e05") },
        { id: "yellow",   label: "Yellow",   s: P("#fde047", "#facc15", "#eab308", "#ca8a04", "#854d0e", "#422006") },
        { id: "amber",    label: "Amber",    s: P("#fcd34d", "#fbbf24", "#f59e0b", "#d97706", "#92400e", "#451a03") },
        { id: "orange",   label: "Orange",   s: P("#fdba74", "#fb923c", "#f97316", "#ea580c", "#9a3412", "#431407") },
        { id: "red",      label: "Red",      s: P("#fca5a5", "#f87171", "#ef4444", "#dc2626", "#991b1b", "#450a0a") },
        { id: "crimson",  label: "Rose",     s: P("#fda4af", "#fb7185", "#f43f5e", "#e11d48", "#9f1239", "#4c0519") },
        { id: "pink",     label: "Pink",     s: P("#f9a8d4", "#f472b6", "#ec4899", "#db2777", "#9d174d", "#500724") },
        { id: "fuchsia",  label: "Fuchsia",  s: P("#f0abfc", "#e879f9", "#d946ef", "#c026d3", "#86198f", "#4a044e") },
        { id: "amethyst", label: "Purple",   s: P("#c4b5fd", "#a78bfa", "#8b5cf6", "#7c3aed", "#5b21b6", "#2e1065") },
        { id: "indigo",   label: "Indigo",   s: P("#a5b4fc", "#818cf8", "#6366f1", "#4f46e5", "#3730a3", "#1e1b4b") },
        { id: "sapphire", label: "Blue",     s: P("#93c5fd", "#60a5fa", "#3b82f6", "#2563eb", "#1e40af", "#172554") },
        { id: "sky",      label: "Sky",      s: P("#7dd3fc", "#38bdf8", "#0ea5e9", "#0284c7", "#075985", "#082f49") },
        { id: "cyan",     label: "Cyan",     s: P("#67e8f9", "#22d3ee", "#06b6d4", "#0891b2", "#155e75", "#083344") },
        { id: "teal",     label: "Teal",     s: P("#5eead4", "#2dd4bf", "#14b8a6", "#0d9488", "#115e59", "#042f2e") },
        { id: "steel",    label: "Steel",    s: P("#cbd5e1", "#94a3b8", "#64748b", "#475569", "#1e293b", "#0f172a") },
        { id: "gold",     label: "Gold",     s: P("#f5e6b3", "#e6c76a", "#d4a937", "#b8891d", "#6b4f0e", "#2e2105") }
      ];
      // Page + card colours: 950 (page), 900, 850, 800, 700
      const BGS = [
        { id: "default",  label: "Classic",  s: ["#09090b", "#121215", "#18181b", "#27272a", "#3f3f46"] },
        { id: "amoled",   label: "True black", s: ["#000000", "#0a0a0a", "#101010", "#1c1c1c", "#333333"] },
        { id: "midnight", label: "Midnight", s: ["#070b14", "#0d1424", "#111a2e", "#1b2740", "#2f3d5c"] },
        { id: "slate",    label: "Slate",    s: ["#0b0f14", "#131920", "#1a2129", "#26303a", "#3c4957"] },
        { id: "forest",   label: "Forest",   s: ["#060d0a", "#0d1713", "#121f19", "#1d2e26", "#34493f"] },
        { id: "plum",     label: "Plum",     s: ["#0d0710", "#170e1c", "#1e1325", "#2c1d36", "#473257"] },
        { id: "ember",    label: "Ember",    s: ["#0f0907", "#1a110d", "#221813", "#32231b", "#50392d"] },
        { id: "wine",     label: "Wine",     s: ["#10060a", "#1c0d13", "#25121b", "#371c28", "#5a3042"] }
      ];
      const FONT_META = [{"id": "poppins", "family": "PT Poppins", "label": "Poppins", "generic": "sans-serif"}, {"id": "outfit", "family": "PT Outfit", "label": "Outfit", "generic": "sans-serif"}, {"id": "worksans", "family": "PT Work Sans", "label": "Work Sans", "generic": "sans-serif"}, {"id": "bigshoulders", "family": "PT Big Shoulders", "label": "Big Shoulders", "generic": "sans-serif"}, {"id": "tektur", "family": "PT Tektur", "label": "Tektur", "generic": "sans-serif"}, {"id": "lora", "family": "PT Lora", "label": "Lora", "generic": "serif"}, {"id": "jetbrains", "family": "PT JetBrains Mono", "label": "JetBrains Mono", "generic": "monospace"}];
      const SYS = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
      const FONTS = [{ id: "system", label: "System", stack: SYS }].concat(FONT_META.map(f => ({ id: f.id, label: f.label, stack: `"${f.family}", ${f.id === "lora" ? "Georgia, serif" : f.id === "jetbrains" ? "ui-monospace, Menlo, Consolas, monospace" : SYS}` })));

      /* ---------------------------------------------------------------- light mode palettes
       * Page and card colours: z950 (page), z900 (cards), z850, z800 (borders), z700. */
      const LBGS = [
        { id: "paper",    label: "Paper",    s: ["#f4f4f5", "#ffffff", "#fafafa", "#e4e4e7", "#d4d4d8"] },
        { id: "snow",     label: "Snow",     s: ["#ffffff", "#f5f5f6", "#f0f0f2", "#e4e4e7", "#d4d4d8"] },
        { id: "cloud",    label: "Cloud",    s: ["#edf1f7", "#ffffff", "#f5f8fc", "#dde5ef", "#c6d1e0"] },
        { id: "sand",     label: "Sand",     s: ["#f5f0e6", "#fffdf8", "#faf6ec", "#e8dfcc", "#d5c8ae"] },
        { id: "mint",     label: "Mint",     s: ["#ebf5ee", "#ffffff", "#f3faf5", "#d6e8dc", "#bcd5c5"] },
        { id: "blush",    label: "Blush",    s: ["#f8edef", "#fffcfc", "#fcf3f5", "#efdadf", "#e0c0c8"] },
        { id: "lavender", label: "Lavender", s: ["#f0edf8", "#ffffff", "#f6f4fb", "#ded8ef", "#c8c0e0"] },
        { id: "stone",    label: "Stone",    s: ["#e7e5e4", "#f5f5f4", "#efeeed", "#d6d3d1", "#bdb9b5"] }
      ];
      // Text colours (zinc 50-600) for each mode. Dark text on light pages, light text on dark pages.
      const DARK_TEXT = { 50: "250 250 250", 100: "244 244 245", 200: "228 228 231", 300: "212 212 216", 400: "161 161 170", 500: "138 138 148", 600: "82 82 91" };
      const LIGHT_TEXT = { 50: "9 9 11", 100: "24 24 27", 200: "39 39 42", 300: "63 63 70", 400: "82 82 91", 500: "113 113 122", 600: "161 161 170" };
      const FX = [{ id: "solid", label: "Solid" }, { id: "glow", label: "Glow" }, { id: "fade", label: "Fade" }, { id: "aurora", label: "Aurora" }, { id: "gradient", label: "Gradient" }];
      const GRAD_QUICK = ["emerald", "sky", "sapphire", "indigo", "amethyst", "fuchsia", "crimson", "orange", "amber", "teal"];
      // One-tap looks (dark ones use bg, light ones use bgL)
      const PRESETS = [
        { id: "classic",  label: "Classic",  s: { theme: "dark",  accent: "emerald",  bg: "default",  font: "system",       bgfx: "solid" } },
        { id: "midnight", label: "Midnight", s: { theme: "dark",  accent: "sapphire", bg: "midnight", font: "system",       bgfx: "glow" } },
        { id: "crimson",  label: "Crimson",  s: { theme: "dark",  accent: "red",      bg: "wine",     font: "outfit",       bgfx: "glow" } },
        { id: "neon",     label: "Neon",     s: { theme: "dark",  accent: "lime",     bg: "amoled",   font: "tektur",       bgfx: "glow" } },
        { id: "sunset",   label: "Sunset",   s: { theme: "dark",  accent: "orange",   bg: "ember",    font: "poppins",      bgfx: "aurora" } },
        { id: "royal",    label: "Royal",    s: { theme: "dark",  accent: "amethyst", bg: "plum",     font: "poppins",      bgfx: "aurora" } },
        { id: "ocean",    label: "Ocean",    s: { theme: "dark",  accent: "cyan",     bg: "slate",    font: "worksans",     bgfx: "fade" } },
        { id: "forest",   label: "Forest",   s: { theme: "dark",  accent: "green",    bg: "forest",   font: "system",       bgfx: "glow" } },
        { id: "iron",     label: "Iron",     s: { theme: "dark",  accent: "steel",    bg: "amoled",   font: "bigshoulders", bgfx: "solid" } },
        { id: "paper",    label: "Paper",    s: { theme: "light", accent: "emerald",  bgL: "paper",   font: "system",       bgfx: "solid" } },
        { id: "daylight", label: "Daylight", s: { theme: "light", accent: "sapphire", bgL: "cloud",   font: "outfit",       bgfx: "fade" } },
        { id: "sandy",    label: "Sandy",    s: { theme: "light", accent: "orange",   bgL: "sand",    font: "lora",         bgfx: "glow" } },
        { id: "bloom",    label: "Bloom",    s: { theme: "light", accent: "pink",     bgL: "blush",   font: "poppins",      bgfx: "aurora" } }
      ];
      const APPEARANCE_KEYS = ["theme", "accent", "accentHex", "bg", "bgHex", "bgL", "bgLHex", "font", "bgfx", "gradHex", "round", "preset"];

      const effMode = s => (s && s.theme === "light") ? "light"
        : (s && s.theme === "auto") ? ((window.matchMedia && matchMedia("(prefers-color-scheme: light)").matches) ? "light" : "dark") : "dark";

      function accentShades(s, mode) {
        let sh, hex;
        if (s.accent === "custom" && validHex(s.accentHex)) {
          const base = hx(normHex(s.accentHex)), [h, sat, l] = rgb2hsl(base);
          const mk = (dl, sa) => hsl2rgb([h, sa == null ? sat : sa, Math.max(4, Math.min(94, l + dl))]);
          sh = [mk(+24), mk(+12), base, mk(-6), mk(-28), hsl2rgb([h, Math.min(sat, 60), 11])];
          hex = normHex(s.accentHex);
        } else {
          const a = ACCENTS.find(x => x.id === s.accent) || ACCENTS[0];
          sh = a.s.map(hx); hex = a.s[2];
        }
        const light = lum(sh[3]) > .30;
        if (mode === "light") {
          // On a light page the "bright" accent shades used for text must be darker, and the dark tints used behind badges must be pale.
          const [h, sat, l] = rgb2hsl(sh[2]), st = Math.min(sat, 85);
          sh = [hsl2rgb([h, st, Math.max(14, Math.min(26, l * .5))]), hsl2rgb([h, st, Math.max(18, Math.min(33, l * .62))]), sh[2], sh[3],
            hsl2rgb([h, Math.min(sat, 70), 82]), hsl2rgb([h, Math.min(sat, 70), 94])];
        }
        return { sh, light, hex };
      }
      function bgShades(s, mode) {
        if (mode === "light") {
          if (s.bgL === "custom" && validHex(s.bgLHex)) {
            const base = hx(normHex(s.bgLHex)); let [h, sat, l] = rgb2hsl(base);
            l = Math.max(88, Math.min(98, l)); sat = Math.min(sat, 70);
            const at = d => hsl2rgb([h, sat, Math.max(60, Math.min(100, l + d))]);
            return [at(0), at(+3.5), at(+1.5), at(-7), at(-14)].map(toHex);
          }
          return (LBGS.find(x => x.id === s.bgL) || LBGS[0]).s;
        }
        if (s.bg === "custom" && validHex(s.bgHex)) {
          const base = hx(normHex(s.bgHex)); let [h, sat, l] = rgb2hsl(base);
          l = Math.min(l, 14); sat = Math.min(sat, 60);
          const at = d => hsl2rgb([h, sat, Math.min(40, l + d)]);
          return [hsl2rgb([h, sat, l]), at(3.5), at(6.5), at(11.5), at(21)].map(toHex);
        }
        return (BGS.find(x => x.id === s.bg) || BGS[0]).s;
      }
      /** The picture painted over the page colour (glow, fade, aurora or a two-colour gradient). */
      function fxCss(s, mode, ac, bg) {
        const t = k => ac.sh[k].map(Math.round).join(" "), c500 = t(2), lt = mode === "light";
        if (s.bgfx === "glow") return `radial-gradient(110% 55% at 50% -10%, rgb(${c500} / ${lt ? .2 : .26}), transparent 70%)`;
        if (s.bgfx === "fade") return `linear-gradient(180deg, rgb(${t(4)} / ${lt ? .75 : .55}) 0%, transparent 62%)`;
        if (s.bgfx === "aurora") {
          const [h, sat, l] = rgb2hsl(ac.sh[2]);
          const o = hsl2rgb([(h + 70) % 360, Math.max(40, Math.min(sat, 90)), Math.max(35, Math.min(l, 60))]).map(Math.round).join(" ");
          const a = lt ? [.22, .18, .12] : [.3, .22, .14];
          return `radial-gradient(75% 45% at 5% 0%, rgb(${c500} / ${a[0]}), transparent 70%), radial-gradient(65% 40% at 100% 38%, rgb(${o} / ${a[1]}), transparent 70%), radial-gradient(80% 45% at 0% 100%, rgb(${c500} / ${a[2]}), transparent 70%)`;
        }
        if (s.bgfx === "gradient") {
          const g0 = validHex(s.gradHex) ? hx(normHex(s.gradHex)) : ac.sh[2];
          const [h, sat, l] = rgb2hsl(g0);
          const g = lt ? hsl2rgb([h, Math.min(sat, 80), Math.max(l, 78)]) : hsl2rgb([h, Math.min(sat, 85), Math.min(l, 26)]);
          return `linear-gradient(165deg, ${bg[0]} 0%, ${toHex(g)} 100%)`;
        }
        return "none";
      }
      // Where each custom-colour panel keeps its value, and what range its sliders may use
      function panelCfg(kind, s) {
        if (kind === "accent") return { hex: "accentHex", mode: "accent", lmin: 18, lmax: 82, smax: 100, label: "Brightness" };
        if (kind === "grad") return { hex: "gradHex", mode: null, lmin: 10, lmax: 90, smax: 100, label: "Brightness" };
        return effMode(s) === "light"
          ? { hex: "bgLHex", mode: "bgL", lmin: 88, lmax: 98, smax: 70, label: "Lightness (light shades only, so text stays readable)" }
          : { hex: "bgHex", mode: "bg", lmin: 0, lmax: 14, smax: 60, label: "Darkness (dark shades only, so text stays readable)" };
      }
      const SEGS = {
        theme:   { title: "Mode", def: "dark", opts: [{ id: "dark", label: "Dark" }, { id: "light", label: "Light" }, { id: "auto", label: "Auto" }], note: "Auto follows your phone's dark / light setting." },
        bgfx:    { title: "Background effect", def: "solid", opts: FX },
        round:   { title: "Corners", def: "normal", opts: [{ id: "sharp", label: "Sharp" }, { id: "normal", label: "Normal" }, { id: "round", label: "Round" }] },
        density: { title: "Row size", def: "normal", opts: [{ id: "compact", label: "Compact" }, { id: "normal", label: "Normal" }, { id: "roomy", label: "Roomy" }], note: "Sets and buttons in your workout. Roomy is easier to hit with sweaty thumbs." }
      };

      Object.assign(ApplicationUI.prototype, {
        applyTheme() {
          const s = this.settings || {}, root = document.documentElement;
          const mode = effMode(s), ac = accentShades(s, mode), bg = bgShades(s, mode);
          const vars = {};
          ["300", "400", "500", "600", "800", "950"].forEach((k, i) => { vars["--a" + k] = ac.sh[i].map(v => Math.round(k === "600" ? v * 0.82 : v)).join(" "); });
          const tx = mode === "light" ? LIGHT_TEXT : DARK_TEXT;
          Object.keys(tx).forEach(k => { vars["--z" + k] = tx[k]; });
          ["950", "900", "850", "800", "700"].forEach((k, i) => { vars["--z" + k] = triple(bg[i]); });
          const f = FONTS.find(x => x.id === s.font) || FONTS[0];
          vars["--pt-font"] = f.stack;
          vars["--pt-fx"] = fxCss(s, mode, ac, bg);
          Object.keys(vars).forEach(k => root.style.setProperty(k, vars[k]));
          const attrs = { "data-mode": mode, "data-round": ["sharp", "round"].includes(s.round) ? s.round : "normal", "data-density": ["compact", "roomy"].includes(s.density) ? s.density : "normal" };
          Object.keys(attrs).forEach(k => root.setAttribute(k, attrs[k]));
          if (ac.light) root.setAttribute("data-accent-light", "1"); else root.removeAttribute("data-accent-light");
          const meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.setAttribute("content", bg[0]);
          // Remember the look so the next start paints it straight away (no dark flash on a light theme)
          try { localStorage.setItem("pt_theme_cache", JSON.stringify({ v: vars, a: attrs, l: ac.light ? 1 : 0, t: bg[0] })); } catch (e) {}
          this.updateAppearanceUI && this.updateAppearanceUI(ac, bg, mode);
        },
        saveAppearance() { WorkoutStorage.saveSettings(this.settings); this.applyTheme(); },
        applyPreset(p) {
          APPEARANCE_KEYS.forEach(k => { delete this.settings[k]; });
          Object.assign(this.settings, p.s); this.settings.preset = p.id;
          this.saveAppearance();
        },
        resetLook() {
          APPEARANCE_KEYS.forEach(k => { delete this.settings[k]; }); delete this.settings.density;
          this.saveAppearance();
        },

        /* ---- Appearance block in Settings (built once, then only updated) ---- */
        buildAppearanceUI() {
          const host = document.getElementById("pt-appearance");
          if (!host || host.__built) return;
          host.__built = true;
          // Each part of Appearance is a row that opens when tapped; the row shows what is chosen right now
          const sec = (title, inner, note, key) => `<details class="pt-sub" data-sec="${key}"><summary><span class="min-w-0 flex-1 text-xs font-bold text-white">${title}</span><span class="pt-sum"></span><span class="pt-chev" aria-hidden="true">›</span></summary><div class="pt-sub-body space-y-2.5">${note ? `<span class="text-[11px] text-zinc-400 block">${note}</span>` : ""}${inner}</div></details>`;
          const sw = (kind, id, label, color) => `<button type="button" data-k="${kind}" data-id="${id}" aria-label="${esc(label)}" title="${esc(label)}" class="pt-sw w-9 h-9 rounded-full tap-active ring-white ring-offset-2 ring-offset-zinc-950" style="background:${color}"></button>`;
          const custom = kind => `<button type="button" data-k="${kind}" data-id="custom" aria-label="Custom colour" title="Custom colour" class="pt-sw pt-custom-${kind} w-9 h-9 rounded-full tap-active ring-white ring-offset-2 ring-offset-zinc-950 flex items-center justify-center text-white text-lg font-black leading-none" style="background:conic-gradient(from 0deg,#f43f5e,#f59e0b,#eab308,#22c55e,#06b6d4,#3b82f6,#8b5cf6,#ec4899,#f43f5e)"><span class="w-5 h-5 rounded-full bg-zinc-950/70 flex items-center justify-center text-[13px]">+</span></button>`;
          const panel = kind => `<div id="pt-panel-${kind}" class="hidden mt-1 rounded-2xl bg-zinc-900 border border-zinc-800 p-3.5 space-y-3">
              <div class="flex items-center gap-3"><div id="pt-prev-${kind}" class="w-12 h-12 rounded-xl border border-zinc-700 shrink-0"></div>
                <div class="flex-1 min-w-0"><span class="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Hex colour</span>
                <input id="pt-hex-${kind}" type="text" maxlength="7" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="#10B981" class="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-base font-mono uppercase text-white focus:outline-none focus:border-emerald-500" style="user-select:text"></div></div>
              <label class="block"><span class="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Colour</span><input id="pt-h-${kind}" type="range" min="0" max="360" step="1" class="pt-range mt-1"></label>
              <label class="block"><span class="text-[10px] font-bold uppercase tracking-wider text-zinc-500">${kind === "bg" ? "Tint" : "Vividness"}</span><input id="pt-s-${kind}" type="range" min="0" max="100" step="1" class="pt-range mt-1"></label>
              <label class="block"><span id="pt-llab-${kind}" class="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Brightness</span><input id="pt-l-${kind}" type="range" min="0" max="100" step="0.5" class="pt-range mt-1"></label>
            </div>`;
          const seg = key => { const d = SEGS[key]; return `<div class="grid gap-1.5" style="grid-template-columns:repeat(${d.opts.length > 4 ? 3 : d.opts.length},minmax(0,1fr))">${d.opts.map(o => `<button type="button" data-seg="${key}" data-id="${o.id}" class="pt-seg tap-active rounded-xl border px-1 py-2.5 text-xs font-bold truncate">${esc(o.label)}</button>`).join("")}</div>`; };
          const presetCard = p => {
            const mode = p.s.theme, ac = accentShades(p.s, mode), bg = bgShades(p.s, mode), fx = fxCss(p.s, mode, ac, bg);
            const f = FONTS.find(x => x.id === p.s.font) || FONTS[0], c = i => "rgb(" + ac.sh[i].map(Math.round).join(",") + ")";
            return `<button type="button" data-preset="${p.id}" class="pt-preset shrink-0 rounded-2xl border border-zinc-800 p-1.5 text-left tap-active" style="width:98px">
              <span class="block rounded-xl overflow-hidden relative" style="height:64px;background:${bg[0]}"><span class="absolute inset-0" style="background:${fx}"></span>
                <span class="absolute left-2 right-2 top-2 h-4 rounded-md" style="background:${bg[1]};border:1px solid ${bg[3]}"></span>
                <span class="absolute left-2 top-8 h-2 w-9 rounded-full" style="background:${c(1)}"></span>
                <span class="absolute left-2 right-2 bottom-2 h-4 rounded-md" style="background:${c(3)}"></span></span>
              <span class="block mt-1.5 px-0.5 text-[11px] font-bold text-zinc-100 truncate" style="font-family:${esc(f.stack)}">${esc(p.label)}</span></button>`;
          };
          const quick = GRAD_QUICK.map(id => { const a = ACCENTS.find(x => x.id === id); return `<button type="button" data-k="grad" data-id="${a.s[2]}" aria-label="${esc(a.label)}" class="w-8 h-8 rounded-full tap-active border border-zinc-700" style="background:${a.s[2]}"></button>`; }).join("");
          host.innerHTML =
            sec("Themes", `<div class="flex gap-2.5 overflow-x-auto hide-scrollbar pb-1 -mx-1 px-1">${PRESETS.map(presetCard).join("")}</div>`, "One tap sets the colours, background, font and mode together. You can still change anything after.", "preset") +
            sec(SEGS.theme.title, seg("theme"), SEGS.theme.note, "theme") +
            sec("Accent colour", `<div class="flex flex-wrap gap-x-3 gap-y-3.5 pt-0.5">${ACCENTS.map(a => sw("accent", a.id, a.label, a.s[2])).join("")}${custom("accent")}</div>${panel("accent")}`, null, "accent") +
            sec('<span id="pt-bg-title">Background</span>', `<div id="pt-bg-sw" class="flex flex-wrap gap-x-3 gap-y-3.5 pt-0.5"></div>${panel("bg")}`, null, "bg") +
            sec(SEGS.bgfx.title, `${seg("bgfx")}<div id="pt-grad-box" class="hidden space-y-2.5 pt-1"><span class="text-[11px] text-zinc-400 block">Second colour</span><div class="flex flex-wrap gap-2">${quick}</div>${panel("grad")}</div>`, null, "bgfx") +
            sec("Font", `<div class="grid grid-cols-2 gap-2">${FONTS.map(f => `<button type="button" data-k="font" data-id="${f.id}" class="pt-font tap-active rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-left" ><span class="block text-xl text-white leading-tight" style="font-family:${esc(f.stack)};font-weight:700">Aa 135</span><span class="block text-[11px] text-zinc-400 mt-0.5" style="font-family:${esc(f.stack)}">${esc(f.label)}</span></button>`).join("")}</div>`, null, "font") +
            sec(SEGS.round.title, seg("round"), null, "round") +
            sec(SEGS.density.title, seg("density"), SEGS.density.note, "density") +
            `<div id="pt-home-layout"></div>` +
            `<div class="p-3.5"><button type="button" id="pt-appearance-reset" class="w-full py-2.5 rounded-xl bg-zinc-800 text-zinc-200 text-xs font-bold tap-active">Reset look to default</button></div>`;
          host.addEventListener("click", e => {
            const b = e.target.closest("button"); if (!b) return;
            if (b.id === "pt-appearance-reset") { this.resetLook(); this.toast && this.toast("Look reset"); return; }
            if (b.dataset.preset) { const p = PRESETS.find(x => x.id === b.dataset.preset); if (p) { this.applyPreset(p); this.toast && this.toast(p.label + " theme applied"); } return; }
            if (b.dataset.seg) { this.settings[b.dataset.seg] = b.dataset.id; delete this.settings.preset; this.saveAppearance(); return; }
            const k = b.dataset.k, id = b.dataset.id; if (!k) return;
            if (k === "grad") { this.settings.gradHex = id; this.settings.bgfx = "gradient"; delete this.settings.preset; this.saveAppearance(); this.syncPanel("grad"); return; }
            const cfg = panelCfg(k, this.settings);
            if (id === "custom") {
              const p = document.getElementById("pt-panel-" + k);
              const wasCustom = this.settings[cfg.mode] === "custom";
              if (!wasCustom) {
                this.settings[cfg.hex] = this.settings[cfg.hex] || (k === "accent" ? accentShades(this.settings, effMode(this.settings)).hex : bgShades(this.settings, effMode(this.settings))[0]);
                this.settings[cfg.mode] = "custom"; delete this.settings.preset;
                this.saveAppearance();
              }
              p.classList.toggle("hidden", wasCustom ? !p.classList.contains("hidden") : false);
              if (!p.classList.contains("hidden")) this.syncPanel(k);
              return;
            }
            if (k === "accent") this.settings.accent = id;
            else if (k === "bg") this.settings[cfg.mode] = id;
            else if (k === "font") this.settings.font = id;
            delete this.settings.preset;
            this.saveAppearance();
          });
          ["accent", "bg", "grad"].forEach(kind => {
            const H = document.getElementById("pt-h-" + kind), S = document.getElementById("pt-s-" + kind), L = document.getElementById("pt-l-" + kind), X = document.getElementById("pt-hex-" + kind);
            let t = null;
            const commit = hex => {
              const cfg = panelCfg(kind, this.settings);
              this.settings[cfg.hex] = hex; if (cfg.mode) this.settings[cfg.mode] = "custom"; if (kind === "grad") this.settings.bgfx = "gradient";
              delete this.settings.preset;
              this.applyTheme(); this.paintPanel(kind, true);
              clearTimeout(t); t = setTimeout(() => WorkoutStorage.saveSettings(this.settings), 250);
            };
            const fromSliders = () => { const hex = toHex(hsl2rgb([+H.value, +S.value, +L.value])); commit(hex); X.value = hex.toUpperCase(); };
            [H, S, L].forEach(r => r.addEventListener("input", fromSliders));
            X.addEventListener("input", () => { if (validHex(X.value)) { const hex = normHex(X.value); commit(hex); const [h, s, l] = rgb2hsl(hx(hex)); H.value = h; S.value = s; L.value = l; this.paintPanel(kind, true); } });
            X.addEventListener("blur", () => { const cur = this.settings[panelCfg(kind, this.settings).hex]; if (cur) X.value = cur.toUpperCase(); });
          });
          this.updateAppearanceUI();
        },
        syncPanel(kind) {
          const cfg = panelCfg(kind, this.settings), hex = this.settings[cfg.hex]; if (!validHex(hex)) return;
          let [h, s, l] = rgb2hsl(hx(normHex(hex)));
          const Hs = document.getElementById("pt-h-" + kind), Ss = document.getElementById("pt-s-" + kind), Ls = document.getElementById("pt-l-" + kind); if (!Hs) return;
          Ss.max = cfg.smax; Ls.min = cfg.lmin; Ls.max = cfg.lmax;
          s = Math.min(s, cfg.smax); l = Math.max(cfg.lmin, Math.min(cfg.lmax, l));
          Hs.value = h; Ss.value = s; Ls.value = l;
          const lab = document.getElementById("pt-llab-" + kind); if (lab) lab.textContent = cfg.label;
          document.getElementById("pt-hex-" + kind).value = normHex(hex).toUpperCase();
          this.paintPanel(kind, false);
        },
        paintPanel(kind, fromTyping) {
          const H = document.getElementById("pt-h-" + kind), S = document.getElementById("pt-s-" + kind), L = document.getElementById("pt-l-" + kind), X = document.getElementById("pt-hex-" + kind), prev = document.getElementById("pt-prev-" + kind);
          if (!H) return;
          const cfg = panelCfg(kind, this.settings), mode = effMode(this.settings);
          const h = +H.value, s = +S.value, l = +L.value, c = (hh, ss, ll) => `hsl(${hh},${ss}%,${ll}%)`;
          H.style.setProperty("--track", "linear-gradient(90deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)");
          S.style.setProperty("--track", `linear-gradient(90deg,${c(h, 0, l)},${c(h, cfg.smax, l)})`);
          L.style.setProperty("--track", `linear-gradient(90deg,${c(h, s, +L.min)},${c(h, s, +L.max)})`);
          const hex = toHex(hsl2rgb([h, s, l]));
          if (prev) prev.style.background = kind === "bg" ? bgShades(mode === "light" ? { bgL: "custom", bgLHex: hex } : { bg: "custom", bgHex: hex }, mode)[0] : hex;
          if (X && document.activeElement !== X) X.value = (this.settings[cfg.hex] || hex).toUpperCase();
        },
        syncAppearanceSummaries(host, s, mode, ac, bg) {
          const set = (key, html) => { const e = host.querySelector('[data-sec="' + key + '"] .pt-sum'); if (e) e.innerHTML = html; };
          const dotc = c => `<i class="pt-dot" style="background:${c}"></i>`;
          const p = PRESETS.find(x => x.id === s.preset);
          set("preset", p ? esc(p.label) : "Custom");
          set("theme", ({ dark: "Dark", light: "Light", auto: "Auto" })[s.theme] || "Dark");
          const a = ACCENTS.find(x => x.id === s.accent);
          set("accent", dotc("rgb(" + ac.sh[2].map(Math.round).join(",") + ")") + (s.accent === "custom" ? "Custom" : esc((a || ACCENTS[0]).label)));
          const bl = mode === "light" ? LBGS : BGS, bk = mode === "light" ? s.bgL : s.bg, b = bl.find(x => x.id === bk);
          set("bg", dotc(bg[0]) + (bk === "custom" ? "Custom" : esc((b || bl[0]).label)));
          set("bgfx", esc((FX.find(x => x.id === s.bgfx) || FX[0]).label));
          set("font", esc((FONTS.find(x => x.id === s.font) || FONTS[0]).label));
          set("round", esc(({ sharp: "Sharp", round: "Round" })[s.round] || "Normal"));
          set("density", esc(({ compact: "Compact", roomy: "Roomy" })[s.density] || "Normal"));
        },
        updateAppearanceUI(ac, bg, mode) {
          const host = document.getElementById("pt-appearance"); if (!host) return;
          if (!host.__built) { this.buildAppearanceUI(); return; }
          const s = this.settings; mode = mode || effMode(s);
          // Background swatches belong to the mode that is showing right now
          if (host.__bgMode !== mode) {
            host.__bgMode = mode;
            const list = mode === "light" ? LBGS : BGS;
            const bgSw = b => `<button type="button" data-k="bg" data-id="${b.id}" aria-label="${esc(b.label)}" title="${esc(b.label)}" class="pt-sw tap-active rounded-xl border border-zinc-700 ring-white ring-offset-2 ring-offset-zinc-950 overflow-hidden text-left" style="width:62px;height:46px;background:${b.s[0]}"><span class="block m-1.5 rounded-md h-3" style="background:${b.s[1]}"></span><span class="block mx-1.5 rounded-md h-2" style="background:${b.s[3]}"></span></button>`;
            const cu = `<button type="button" data-k="bg" data-id="custom" aria-label="Custom colour" title="Custom colour" class="pt-sw pt-custom-bg rounded-xl tap-active ring-white ring-offset-2 ring-offset-zinc-950 flex items-center justify-center text-white text-lg font-black leading-none" style="width:62px;height:46px;background:conic-gradient(from 0deg,#f43f5e,#f59e0b,#eab308,#22c55e,#06b6d4,#3b82f6,#8b5cf6,#ec4899,#f43f5e)"><span class="w-5 h-5 rounded-full bg-zinc-950/70 flex items-center justify-center text-[13px]">+</span></button>`;
            document.getElementById("pt-bg-sw").innerHTML = list.map(bgSw).join("") + cu;
            document.getElementById("pt-bg-title").textContent = mode === "light" ? "Background (light)" : "Background (dark)";
            const p = document.getElementById("pt-panel-bg"); if (p) p.classList.add("hidden");
          }
          const curAccent = s.accent === "custom" ? "custom" : (ACCENTS.find(x => x.id === s.accent) ? s.accent : "emerald");
          const bgKey = mode === "light" ? s.bgL : s.bg, bgList = mode === "light" ? LBGS : BGS;
          const curBg = bgKey === "custom" ? "custom" : (bgList.find(x => x.id === bgKey) ? bgKey : bgList[0].id);
          const curFont = FONTS.find(x => x.id === s.font) ? s.font : "system";
          host.querySelectorAll(".pt-sw").forEach(b => {
            const on = (b.dataset.k === "accent" && b.dataset.id === curAccent) || (b.dataset.k === "bg" && b.dataset.id === curBg);
            b.classList.toggle("ring-2", on);
          });
          host.querySelectorAll(".pt-font").forEach(b => {
            const on = b.dataset.id === curFont;
            b.classList.toggle("border-emerald-500", on); b.classList.toggle("border-zinc-800", !on); b.classList.toggle("bg-emerald-950/40", on);
          });
          host.querySelectorAll(".pt-seg").forEach(b => {
            const d = SEGS[b.dataset.seg], cur = d.opts.some(o => o.id === s[b.dataset.seg]) ? s[b.dataset.seg] : d.def;
            const on = b.dataset.id === cur;
            b.classList.toggle("border-emerald-500", on); b.classList.toggle("bg-emerald-950/40", on); b.classList.toggle("text-white", on);
            b.classList.toggle("border-zinc-800", !on); b.classList.toggle("bg-zinc-900", !on); b.classList.toggle("text-zinc-300", !on);
          });
          host.querySelectorAll(".pt-preset").forEach(b => { const on = s.preset === b.dataset.preset; b.classList.toggle("border-emerald-500", on); b.classList.toggle("border-zinc-800", !on); b.classList.toggle("bg-emerald-950/40", on); });
          const ca = host.querySelector(".pt-custom-accent"); if (ca) { ca.firstElementChild.style.background = curAccent === "custom" ? normHex(s.accentHex || "#10b981") : ""; ca.firstElementChild.style.color = curAccent === "custom" ? "transparent" : ""; }
          const cb = host.querySelector(".pt-custom-bg"); if (cb) { cb.style.background = curBg === "custom" ? bgShades(s, mode)[0] : "conic-gradient(from 0deg,#f43f5e,#f59e0b,#eab308,#22c55e,#06b6d4,#3b82f6,#8b5cf6,#ec4899,#f43f5e)"; cb.firstElementChild.style.display = curBg === "custom" ? "none" : ""; }
          this.syncAppearanceSummaries(host, s, mode, ac || accentShades(s, mode), bg || bgShades(s, mode));
          const gb = document.getElementById("pt-grad-box"); if (gb) { const was = gb.classList.contains("hidden"); gb.classList.toggle("hidden", s.bgfx !== "gradient"); if (was && s.bgfx === "gradient") { const pg = document.getElementById("pt-panel-grad"); pg.classList.remove("hidden"); if (!validHex(s.gradHex)) s.gradHex = accentShades(s, mode).hex; this.syncPanel("grad"); } }
          ["accent", "bg"].forEach(kind => {
            const p = document.getElementById("pt-panel-" + kind);
            const isCustom = (kind === "bg" ? curBg : curAccent) === "custom";
            if (!isCustom && p) p.classList.add("hidden");
            else if (p && !p.classList.contains("hidden") && document.activeElement && !p.contains(document.activeElement)) this.syncPanel(kind);
          });
        },

        /* ------------------------------------------------ auto-start rest timer */
        autoRestAfterSet(key, restSec) {
          if (this.settings.autoRest === false) return;
          const prog = this.activeProgram, day = this.activeDay;
          if (!prog || !day) return;
          let found = null;
          (day.exercises || []).forEach((ex, idx) => { for (let s = 0; s < (ex.sets || 0); s++) if (this.getLogKey(prog.id, day.dayNumber, ex.id, s) === key) found = { ex, idx, s }; });
          if (!found || found.ex.type === "tabata") return;
          // Superset: no rest until the last exercise of the group
          if (found.ex.link && found.idx < day.exercises.length - 1) return;
          // Last set of the whole workout: nothing left to rest for
          const left = (day.exercises || []).some(ex => { for (let s = 0; s < (ex.sets || 0); s++) { const e = this.logs[this.getLogKey(prog.id, day.dayNumber, ex.id, s)]; if (!(e && e.completed)) return true; } return false; });
          if (!left) return;
          let sec = parseInt(restSec, 10);
          if (!(sec > 0)) return;
          const e = this.logs[key];
          if (e && e.tag === "W") sec = Math.min(sec, 45);
          this.restTimer.start(sec);
        }
      });

      /* ----------------------------------------------- hook into settings + init */
      const origExtras = ApplicationUI.prototype.renderSettingsExtras;
      ApplicationUI.prototype.renderSettingsExtras = async function () {
        const r = await origExtras.apply(this, arguments);
        const t = document.getElementById("setting-toggle-autorest");
        if (t) t.checked = this.settings.autoRest !== false;
        this.buildAppearanceUI(); this.updateAppearanceUI();
        PT.syncSelects();
        return r;
      };
      const origV3 = ApplicationUI.prototype.renderSettingsV3;
      if (origV3) ApplicationUI.prototype.renderSettingsV3 = function () { const r = origV3.apply(this, arguments); PT.syncSelects(); return r; };
      const bindOnce = () => {
        const t = document.getElementById("setting-toggle-autorest");
        if (t && !t.__b) { t.__b = true; t.addEventListener("change", () => { const a = window.app; a.settings.autoRest = t.checked; WorkoutStorage.saveSettings(a.settings); a.toast && a.toast(t.checked ? "Rest timer starts automatically" : "Auto rest timer off"); }); }
      };
      const origInit = ApplicationUI.prototype.initExtras;
      ApplicationUI.prototype.initExtras = function () {
        const r = origInit.apply(this, arguments); bindOnce(); this.buildAppearanceUI(); this.applyTheme(); PT.syncSelects();
        // "Auto" mode follows the phone: re-paint when the phone switches between dark and light
        if (!window.__ptMq) {
          try { const mq = matchMedia("(prefers-color-scheme: light)"); window.__ptMq = mq; const fn = () => { if (window.app && window.app.settings && window.app.settings.theme === "auto") window.app.applyTheme(); }; if (mq.addEventListener) mq.addEventListener("change", fn); else if (mq.addListener) mq.addListener(fn); } catch (e) {}
        }
        return r;
      };
    })();
  