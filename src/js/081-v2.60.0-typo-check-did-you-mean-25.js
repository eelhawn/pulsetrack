
/* =====================================================================
 * PulseTrack 2.60.0: typo check, "Did you mean 25?"
 *
 * A fat-fingered 250 instead of 25 (or 22.5 typed as 225, or 8 and 135 in the wrong boxes) used to be saved like any other set: a fake PR,
 * a wrecked volume total, a chart with a spike. Now, when you check off a set whose weight or reps are far from what you did last time on that
 * exercise, a small sheet asks before it is saved:
 *    Did you mean 25?   [Use 25]  [Keep 250]
 * Only clear slips are asked about (about 5 times higher or lower than last time, reps of 30+ at 4 times last time, weight and reps swapped).
 * Not asked: warm-up and drop sets, bodyweight moves, cardio, anything with no "last time", and a number you already said was right (Keep).
 * Works from the normal set check and from Guided mode (the Log set button). Settings → "Typo check" turns it off.
 * Setting: settings.typoGuard = false (only when turned off).
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  const proto = ApplicationUI.prototype, $ = id => document.getElementById(id), A = () => window.app;
  const esc = s => PT.esc(s);
  const num = v => { const n = parseFloat(String(v == null ? "" : v).replace(",", ".")); return isFinite(n) ? n : 0; };
  const fmt = n => PT.num ? PT.num(n, 2) : String(Math.round(n * 100) / 100);
  const on = () => { const a = A(); return !a || !a.settings || a.settings.typoGuard !== false; };

  const kept = new Set();            // "name|w|250": you said it was right, not asked again

  /* ================================================================ what is a slip */
  const med = xs => { const s = xs.slice().sort((p, q) => p - q), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
  const near = (x, y) => y > 0 && x / y >= 0.6 && x / y <= 1.6;
  const half = n => Math.round(n * 2) / 2;
  /** the closest "ten times off" guess to what you usually do, or 0 when none is close */
  function guess(typed, usual) {
    const c = [typed / 10, typed * 10].map(v => ({ v, d: Math.abs(Math.log(v / usual)) })).sort((p, q) => p.d - q.d)[0];
    return c && c.v / usual >= 0.5 && c.v / usual <= 2 ? half(c.v) : 0;
  }
  /** last time's working sets of this exercise (warm-ups and drop sets left out) */
  function lastTime(a, name) {
    const arr = ((a.lastPerf || {})[name] || []).filter(p => p && p.tag !== "W" && p.tag !== "D");
    return { w: arr.map(p => num(p.weight)).filter(x => x > 0), r: arr.map(p => num(p.reps)).filter(x => x > 0) };
  }
  /** null when the numbers look fine, otherwise { kind: "w" | "r" | "swap", ... } */
  function inspect(a, ex, w, r, tag) {
    try {
      if (!ex || tag === "W" || tag === "D" || ex.type === "tabata") return null;
      const k = a.exKind(ex); if (k.cardio || k.bw) return null;
      if (PT.isBwMove && PT.isBwMove(ex.name)) return null;
      const t = lastTime(a, ex.name); if (!t.w.length && !t.r.length) return null;
      const wMed = t.w.length ? med(t.w) : 0, wMax = t.w.length ? Math.max.apply(null, t.w) : 0, wMin = t.w.length ? Math.min.apply(null, t.w) : 0;
      const rMed = t.r.length ? med(t.r) : 0, rMax = t.r.length ? Math.max.apply(null, t.r) : 0;
      if (w > 0 && r > 0 && wMed > 0 && rMed > 0 && w !== r && (w < wMed / 3 || w > wMed * 3) && near(r, wMed) && near(w, rMed) && !kept.has(ex.name + "|s|" + w + "|" + r))
        return { kind: "swap", w, r, usualW: wMed, usualR: rMed };
      if (w > 0 && wMed > 0 && (w >= wMax * 5 || w <= wMin / 5) && !kept.has(ex.name + "|w|" + w))
        return { kind: "w", typed: w, usual: wMed, fix: guess(w, wMed) };
      if (r >= 30 && rMed > 0 && r >= rMax * 4 && !kept.has(ex.name + "|r|" + r))
        return { kind: "r", typed: r, usual: rMed, fix: guess(r, rMed) };
    } catch (e) { console.error("PulseTrack typo check", e); }
    return null;
  }

  /* ================================================================ the question */
  /** shows the sheet; done("use" | "keep") after a choice; "Let me change it" or closing it leaves the set unchecked */
  function ask(a, ex, hit, done) {
    const u = esc((a.wLabel && a.wLabel()) || "lb"), nm = ex.name;
    let title, line, useL, keepL;
    if (hit.kind === "swap") {
      title = `Weight and reps swapped?`;
      line = `You typed <b>${esc(fmt(hit.w))} ${u} × ${esc(fmt(hit.r))} reps</b>. Last time: <b>${esc(fmt(hit.usualW))} ${u} × ${esc(fmt(hit.usualR))}</b>.`;
      useL = `Swap them: ${esc(fmt(hit.r))} ${u} × ${esc(fmt(hit.w))}`; keepL = `Keep ${esc(fmt(hit.w))} × ${esc(fmt(hit.r))}`;
    } else if (hit.kind === "w") {
      title = hit.fix ? `Did you mean ${fmt(hit.fix)}?` : `Is that weight right?`;
      line = `You typed <b>${esc(fmt(hit.typed))} ${u}</b>. Last time: <b>${esc(fmt(hit.usual))} ${u}</b>.`;
      useL = hit.fix ? `Use ${esc(fmt(hit.fix))} ${u}` : ""; keepL = `Keep ${esc(fmt(hit.typed))} ${u}`;
    } else {
      title = hit.fix ? `Did you mean ${fmt(hit.fix)} reps?` : `Are those reps right?`;
      line = `You typed <b>${esc(fmt(hit.typed))} reps</b>. Last time: <b>${esc(fmt(hit.usual))}</b>.`;
      useL = hit.fix ? `Use ${esc(fmt(hit.fix))} reps` : ""; keepL = `Keep ${esc(fmt(hit.typed))} reps`;
    }
    const el = a.openSheet(title, nm, `<p class="text-sm text-zinc-300 leading-snug mb-3">${line}</p>
      <div class="space-y-2">
        ${useL ? `<button type="button" class="pt-typo-b pt-typo-use" data-c="use">${useL}</button>` : ""}
        <button type="button" class="pt-typo-b${useL ? "" : " pt-typo-use"}" data-c="keep">${keepL}</button>
        <button type="button" class="pt-typo-b pt-typo-edit" data-c="edit">${useL ? "Let me change it" : "Let me change it myself"}</button>
      </div>`, "");
    el.querySelectorAll("[data-c]").forEach(b => b.addEventListener("click", () => { a.closeSheet(); if (b.dataset.c !== "edit") done(b.dataset.c); }));
  }
  const setInput = (inp, v) => { if (!inp) return; inp.value = String(v); inp.dispatchEvent(new Event("input", { bubbles: true })); inp.dispatchEvent(new Event("change", { bubbles: true })); };
  const rowInput = (key, field) => document.querySelector(`input.input-set-field[data-key="${key}"][data-field="${field}"]`);
  const exByName = (a, name) => ((a.activeDay && a.activeDay.exercises) || []).find(x => x.name === name);
  /** the first set of this exercise that is not checked off yet (what Guided mode logs next) */
  function openBtn(name) {
    const list = $("exercises-list"); if (!list) return null;
    return [...list.querySelectorAll(".btn-check-set")].find(b => b.dataset.exname === name && b.dataset.completed !== "1") || null;
  }

  /* ================================================================ the normal set check */
  window.addEventListener("click", e => {
    try {
      if (!on() || !e.target || !e.target.closest) return;
      const a = A(); if (!a || !a.activeDay) return;
      const btn = e.target.closest(".btn-check-set");
      if (!btn || btn.dataset.completed === "1" || document.body.classList.contains("pt-guided-on")) return;
      const ent = (a.logs || {})[btn.dataset.key]; if (!ent) return;
      const ex = exByName(a, btn.dataset.exname), w = num(ent.weight), r = num(ent.reps);
      const hit = inspect(a, ex, w, r, ent.tag || "R"); if (!hit) return;
      e.stopImmediatePropagation(); e.preventDefault();
      const key = btn.dataset.key;
      ask(a, ex, hit, c => {
        if (c === "use") {
          if (hit.kind === "swap") { setInput(rowInput(key, "weight"), hit.r); setInput(rowInput(key, "reps"), hit.w); }
          else setInput(rowInput(key, hit.kind === "w" ? "weight" : "reps"), hit.fix);
        } else kept.add(ex.name + "|" + hit.kind[0] + "|" + (hit.kind === "swap" ? hit.w + "|" + hit.r : hit.typed));
        const b2 = document.querySelector(`.btn-check-set[data-key="${key}"]`); if (b2 && b2.dataset.completed !== "1") b2.click();          // checked again: a second slip in the same set is asked about too
      });
    } catch (err) { console.error("PulseTrack typo check click", err); }
  }, true);

  /* ================================================================ Guided mode: the Log set button */
  window.addEventListener("click", e => {
    try {
      if (!on() || !e.target || !e.target.closest) return;
      const a = A(); if (!a || !a.activeDay || !document.body.classList.contains("pt-guided-on")) return;
      const go = e.target.closest("#pt-g-log, .pt-gb-log"); if (!go) return;
      // one exercise: #pt-g-w / #pt-g-r. A superset or circuit: #pt-g-w-<i> / #pt-g-r-<i> for the exercise at index i
      const exs = a.activeDay.exercises || [], items = [];
      const title = document.querySelector("#pt-guided .pt-g-title");
      if ($("pt-g-w") && $("pt-g-r") && title) { const ex = exByName(a, title.textContent.trim()); if (ex) items.push({ ex, wi: $("pt-g-w"), ri: $("pt-g-r") }); }
      document.querySelectorAll('#pt-guided input[id^="pt-g-w-"]').forEach(wi => {
        const i = parseInt(wi.id.slice(7), 10), ex = exs[i], ri = $("pt-g-r-" + i); if (ex && ri) items.push({ ex, wi, ri });
      });
      for (const it of items) {
        const b = openBtn(it.ex.name), ent = b && (a.logs || {})[b.dataset.key];
        const w = num(it.wi.value), r = num(it.ri.value), hit = inspect(a, it.ex, w, r, (ent && ent.tag) || "R"); if (!hit) continue;
        e.stopImmediatePropagation(); e.preventDefault();
        ask(a, it.ex, hit, c => {
          if (c === "use") {
            if (hit.kind === "swap") { setInput(it.wi, hit.r); setInput(it.ri, hit.w); }
            else setInput(hit.kind === "w" ? it.wi : it.ri, hit.fix);
          } else kept.add(it.ex.name + "|" + hit.kind[0] + "|" + (hit.kind === "swap" ? hit.w + "|" + hit.r : hit.typed));
          const g2 = document.querySelector("#pt-g-log, .pt-gb-log"); if (g2) g2.click();       // asks about the next slip too, if there is one
        });
        return;
      }
    } catch (err) { console.error("PulseTrack typo check guided", err); }
  }, true);

  /* ================================================================ Settings → the switch */
  const oEx = proto.renderSettingsExtras;
  if (typeof oEx === "function") proto.renderSettingsExtras = async function () {
    const r = await oEx.apply(this, arguments);
    try {
      if (!$("pt-typo-row")) {
        const ref = $("pt-dbpair-row") || $("pt-simple-row") || $("pt-resume-row") || $("pt-tabs-row") || $("pt-gym-row") || $("pt-textsize");
        if (ref) {
          const row = document.createElement("label");
          row.id = "pt-typo-row"; row.className = "flex items-center justify-between gap-3 mt-3 cursor-pointer";
          row.innerHTML = '<span><span class="block text-xs font-bold text-zinc-100">Typo check</span><span class="block text-[11px] text-zinc-400">Asks "Did you mean 25?" when a weight or reps is about 10 times off from last time.</span></span><input type="checkbox" id="setting-toggle-typo" class="accent-emerald-500 w-5 h-5 shrink-0">';
          ref.insertAdjacentElement("afterend", row);
          row.querySelector("input").addEventListener("change", ev => {
            const a = A(); if (ev.target.checked) delete a.settings.typoGuard; else a.settings.typoGuard = false;
            WorkoutStorage.saveSettings(a.settings);
          });
        }
      }
      const t = $("setting-toggle-typo"), a = A(); if (t && a) t.checked = a.settings.typoGuard !== false;
    } catch (e) { console.error("PulseTrack typo check setting", e); }
    return r;
  };

  const css = document.createElement("style"); css.id = "pt-v260-typo-css";
  css.textContent = `
    .pt-typo-b { display: block; width: 100%; min-height: 3rem; padding: .7rem .9rem; border-radius: .9rem; font-size: .9rem; font-weight: 800; text-align: center; background: rgb(var(--z900)); border: 1px solid rgb(var(--z800)); color: rgb(var(--z200)); }
    .pt-typo-use { background: rgb(var(--a600)); border-color: rgb(var(--a600)); color: #fff; }
    .pt-typo-edit { background: transparent; border-style: dashed; color: rgb(var(--z400)); font-weight: 700; font-size: .8rem; min-height: 2.75rem; }
  `;
  document.head.appendChild(css);
})();
  