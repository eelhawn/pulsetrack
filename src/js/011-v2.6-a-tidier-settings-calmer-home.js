
    /* =====================================================================
     * PulseTrack 2.6 (part 3): a tidier Settings, calmer Home
     * ===================================================================== */
    (function () {
      "use strict";
      const A = () => window.app;
      const proto = ApplicationUI.prototype;
      const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

      /* ---------------------------------------------------------------- Settings groups */
      const GROUPS = {
        "Workout": { id: "workout", hint: "Units, rest times, weekly goal" },
        "Workout Screen": { id: "wscreen", hint: "Suggestions, set rows, left hand" },
        "Gyms & Equipment": { id: "gyms", hint: "Bar, plates, dumbbells, equipment" },
        "Streaks & Time Off": { id: "streak", hint: "Sick days, trips, cardio" },
        "Sound, Voice & Feel": { id: "sound", hint: "Sounds, voice coaching, vibration" },
        "Appearance": { id: "appearance", hint: "" },
        "Mods & Custom CSS": { id: "mods", hint: "Reskin the app with your own CSS" },
        "Data & Backup": { id: "data", hint: "Back up, restore, export" },
        "App": { id: "app", hint: "Version, updates" },
        "Danger Zone": { id: "danger", hint: "Reset the app" }
      };
      function appearanceSummary() {
        const s = (A() && A().settings) || {};
        const mode = ({ dark: "Dark", light: "Light", auto: "Auto" })[s.theme] || "Dark";
        const sub = document.querySelector('#pt-appearance [data-sec="preset"] .pt-sum');
        const acc = document.querySelector('#pt-appearance [data-sec="accent"] .pt-sum');
        const p = sub ? sub.textContent.trim() : "";
        return mode + (p && p !== "Custom" ? " · " + p + " theme" : (acc ? " · " + acc.textContent.trim() : ""));
      }
      function buildAccordion() {
        const modal = document.getElementById("modal-settings"); if (!modal) return;
        const card = modal.firstElementChild; if (!card || card.__acc) return;
        card.__acc = true;
        const labels = [...card.children].filter(el => el.tagName === "SPAN" && /uppercase/.test(el.className));
        labels.forEach(lab => {
          const key = lab.textContent.replace(/\s+/g, " ").trim(), g = GROUPS[key], body = lab.nextElementSibling;
          if (!g || !body) return;
          const d = document.createElement("details");
          d.className = "pt-acc" + (g.id === "danger" ? " pt-acc-danger" : ""); d.dataset.acc = g.id;
          d.innerHTML = `<summary><span class="min-w-0 flex-1"><span class="pt-acc-t">${esc(key)}</span><span class="pt-acc-h" data-hint="${g.id}">${esc(g.hint)}</span></span><span class="pt-chev" aria-hidden="true">›</span></summary><div class="pt-acc-body"></div>`;
          lab.replaceWith(d);
          d.querySelector(".pt-acc-body").appendChild(body);
          d.addEventListener("toggle", () => { try { sessionStorage.setItem("pt_acc_" + g.id, d.open ? "1" : "0"); } catch (e) { } });
          try { if (sessionStorage.getItem("pt_acc_" + g.id) === "1") d.open = true; } catch (e) { }
        });
        card.classList.remove("space-y-4"); card.classList.add("space-y-2.5");
        refreshHints();
      }
      function refreshHints() {
        const h = document.querySelector('[data-hint="appearance"]'); if (h) h.textContent = appearanceSummary();
        const v = document.querySelector('[data-hint="app"]'); const ver = document.getElementById("app-version");
        if (v && ver && ver.textContent.trim().length > 1) v.textContent = "Version " + ver.textContent.trim().replace(/^v/i, "") + " · updates";
      }
      const oUpdateUI = proto.updateAppearanceUI;
      proto.updateAppearanceUI = function () { const r = oUpdateUI.apply(this, arguments); try { refreshHints(); } catch (e) { } return r; };
      const oOpenSettings = proto.openSettings;
      if (oOpenSettings) proto.openSettings = function () { const r = oOpenSettings.apply(this, arguments); try { buildAccordion(); refreshHints(); } catch (e) { console.error("PulseTrack 2.6 settings", e); } return r; };
      /** Open every Settings group at once (used by the "Open all" helper and by tests) */
      PT.openAllSettings = function (open) { document.querySelectorAll("#modal-settings details").forEach(d => { d.open = open !== false; }); };

      /* ---------------------------------------------------------------- Home: lifts with no PR yet shrink to one line */
      const oTrophy = proto.renderTrophyRoom;
      proto.renderTrophyRoom = function () {
        const r = oTrophy.apply(this, arguments);
        try { [...document.querySelectorAll("#trophy-room > button")].forEach(b => b.classList.toggle("pt-empty", /No PR logged yet/.test(b.textContent))); } catch (e) { }
        return r;
      };
    })();
  