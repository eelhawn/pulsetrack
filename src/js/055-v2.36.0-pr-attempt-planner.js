
/* =====================================================================
 * PulseTrack 2.36.0: PR attempt planner.
 *  - Pick a lift, a target weight for a single and a test date. The plan has the week before (a last heavy
 *    day, a light day, a rest day), the attempt-day warm-up ladder with the plates for each step, and three
 *    attempts (about 93%, 97% and 100%). Steps can be ticked off on the day.
 *  - The plan lives in settings.attempt (and settings.attemptLog when it is over), so it is in backups.
 *  - Shows on Progress -> Strength, and on Home during the last week.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  const proto = ApplicationUI.prototype;
  const A = () => window.app;
  const $ = id => document.getElementById(id);
  const esc = s => PT.esc(s);
  const DAY = 86400000;
  const save = () => { try { WorkoutStorage.saveSettings(A().settings); } catch (e) { } };
  const card = "bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3";
  const fw = v => { v = Math.round(v * 100) / 100; return PT.num ? PT.num(v, v % 1 ? 1 : 0) : String(v); };
  const unit = a => a.wLabel();

  /* ---------------------------------------------------------------- loadable weights */
  const eqk = n => { try { return PT.equipKey ? PT.equipKey(n) : "none"; } catch (e) { return "none"; } };
  function isBar(n) {
    const k = eqk(n); if (k === "barbell" || k === "ezbar") return true; if (k !== "none") return false;
    return /barbell|squat|deadlift|bench press|rack pull|hip thrust|military|good morning|pendlay|yates|ez-bar/i.test(n) && !/dumbbell|machine|cable|smith|goblet|kettlebell|leg press|hack|sissy|split/i.test(n);
  }
  /** the nearest weight this gym can load: { w, plates (one side) } */
  function load(a, name, w) {
    if (isBar(name)) {
      const bar = a.selectedBarWeight || 0;
      if (w <= bar) return { w: bar, plates: [] };
      const r = a.solvePlates((w - bar) / 2);
      if (r.exact) return { w: Math.round((bar + 2 * r.plates.reduce((t, x) => t + x, 0)) * 100) / 100, plates: r.plates };   // the plates decide the weight
      const lo = r.under, hi = r.over, pick = hi != null && (hi - (w - bar) / 2 <= ((w - bar) / 2) - lo) ? hi : lo;
      const rr = a.solvePlates(pick);
      return { w: Math.round((bar + 2 * rr.plates.reduce((t, x) => t + x, 0)) * 100) / 100, plates: rr.plates };
    }
    const inc = a.increment ? a.increment() : 5;
    return { w: Math.max(inc, Math.round(w / inc) * inc), plates: null };
  }
  const platesTxt = p => (p && p.length ? p.join(" + ") + " per side" : p ? "bar only" : "");

  /* ---------------------------------------------------------------- the plan */
  const ds = d => PT.ds(d), fromDs = s => PT.fromDs(s);
  const midnight = d => { const x = new Date(d); x.setHours(12, 0, 0, 0); return x; };
  const daysTo = s => Math.round((midnight(fromDs(s)).getTime() - midnight(new Date()).getTime()) / DAY);
  const addDs = (s, n) => { const d = fromDs(s); d.setDate(d.getDate() + n); return ds(d); };
  const dateTxt = s => fromDs(s).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  const MOB = (name) => /squat|deadlift|lunge|leg|hip|rdl|romanian/i.test(name) ? "hips" : /bench|press|fly|dip|push/i.test(name) ? "shoulders" : /row|pull|chin|lat/i.test(name) ? "shoulders" : "reset";
  const realism = pct => pct <= 0 ? ["At or below your best estimate. An easy one to take.", "ok"] : pct <= 3 ? ["Very doable. Just above your best estimate.", "ok"] : pct <= 6 ? ["A real stretch, but realistic on a good day.", "mid"] : ["Ambitious. A smaller jump is likelier to land.", "hard"];

  /** everything the plan view needs, from { name, target, date } */
  PT.attemptPlan = function (a, p) {
    a = a || A(); const T = p.target, name = p.name, left = daysTo(p.date);
    const L = f => load(a, name, T * f), bar = isBar(name);
    const rung = (id, label, f, reps, rest, kind) => { const l = L(f); return { id, label, w: l.w, plates: l.plates, reps, rest, kind, pct: Math.round(f * 100) }; };
    const ladder = [];
    if (bar && T >= (a.selectedBarWeight || 0) * 1.6) ladder.push({ id: "w0", label: "Empty bar", w: a.selectedBarWeight, plates: [], reps: "10", rest: "30 s", kind: "warm", pct: 0 });
    (bar ? [[.4, 5, "1 min"], [.55, 3, "1–2 min"], [.7, 2, "2 min"], [.8, 1, "2–3 min"], [.9, 1, "3 min"]] : [[.5, 5, "1 min"], [.65, 3, "1–2 min"], [.8, 2, "2 min"], [.9, 1, "3 min"]]).forEach(([f, r, rest], i) => ladder.push(rung("w" + (i + 1), "Warm-up " + (i + 1), f, String(r), rest, "warm")));
    const att = [rung("a1", "Attempt 1 · opener", .93, "1", "3–5 min", "att"), rung("a2", "Attempt 2", .97, "1", "3–5 min", "att"), rung("a3", "Attempt 3 · goal", 1, "1", "", "att")];
    // keep every step heavier than the one before it
    const all = ladder.concat(att); for (let i = 1; i < all.length; i++) if (all[i].w <= all[i - 1].w) all[i].dup = true;
    const days = [];
    const heavyOff = left >= 6 ? 6 : left >= 5 ? 5 : left >= 4 ? 4 : 0;
    if (heavyOff) { const h = L(.85); days.push({ off: heavyOff, kind: "heavy", title: "Last heavy day", txt: `${name}: 3 sets of 3 at ${fw(h.w)} ${unit(a)}${h.plates ? " (" + platesTxt(h.plates) + ")" : ""}. Crisp reps, stop with 1–2 in the tank. After today, no more hard work for the same muscles.` }); }
    if (left >= 3) { const l = L(.65); days.push({ off: 3, kind: "light", title: "Light day", txt: `${name}: 3 sets of 2–3 at ${fw(l.w)} ${unit(a)}. Fast and easy. Skip other heavy work for the same muscles.` }); }
    if (left >= 1) days.push({ off: 1, kind: "rest", title: "Rest day", txt: "Rest, or 10 minutes of easy mobility. Eat well, sleep early and pack your gear.", mob: MOB(name) });
    days.sort((x, y) => y.off - x.off); days.forEach(d => { d.ds = addDs(p.date, -d.off); });
    return { left, ladder: all, days: days.filter(d => daysTo(d.ds) >= 0), bar };
  };

  /* ---------------------------------------------------------------- state + helpers */
  const plan = a => { const p = a.settings.attempt; return p && p.name && p.target > 0 && p.date ? p : null; };
  function isHit(a, p) { return p.result === "hit" || (p.e1 != null && p.e1 < p.target && (a.prs && a.prs[p.name]) >= p.target); }
  function lifts(a) {
    return Object.keys(a.prs || {}).filter(n => a.prs[n] > 0).sort((x, y) => (isBar(y) - isBar(x)) || a.prs[y] - a.prs[x]).slice(0, 40);
  }
  function defTarget(a, name) {
    const best = (a.prs && a.prs[name]) || 0, inc = a.increment ? a.increment() : 5;
    return load(a, name, Math.max(best * 1.025, best + inc)).w;
  }
  const S = { name: "", target: 0, date: "" };

  /* ---------------------------------------------------------------- the sheet: set up */
  function openSetup(a) {
    const l = lifts(a);
    if (!l.length) { a.openSheet("PR attempt", "Plan a test day", `<p class="text-sm text-zinc-300 leading-relaxed">Log a few weighted sets first. The planner starts from your best estimated one-rep max for a lift.</p>`, ""); return; }
    const cur = plan(a);
    if (!S.name || !l.includes(S.name)) S.name = cur && l.includes(cur.name) ? cur.name : (l.find(n => /bench press|back squat|^squat|deadlift/i.test(n)) || l[0]);
    if (!(S.target > 0)) S.target = defTarget(a, S.name);
    if (!S.date) S.date = addDs(ds(new Date()), 14);
    const best = a.prs[S.name] || 0, pct = best ? (S.target / best - 1) * 100 : 0, rl = realism(pct), left = daysTo(S.date);
    const chip = (n, t) => `<button type="button" class="pt-opt tap-active" data-at-days="${n}" aria-pressed="${left === n}">${t}</button>`;
    const body = `<div class="space-y-4">
      <p class="text-xs text-zinc-400 leading-snug">Pick a lift, a target for one rep and the day you will try it. You get the week before and a warm-up ladder for the day.</p>
      <div><span class="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Lift</span>
        <select id="pt-at-lift" class="w-full px-3 py-3 bg-zinc-950 border border-zinc-700 rounded-xl text-white text-sm">${l.map(n => `<option value="${esc(n)}"${n === S.name ? " selected" : ""}>${esc(n)} · best ${fw(a.prs[n])} ${unit(a)}</option>`).join("")}</select></div>
      <div><span class="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Target for one rep (${unit(a)})</span>
        <div class="flex items-center gap-2"><button type="button" class="pt-at-st" data-at-step="-1" aria-label="Lower the target">−</button>
        <input id="pt-at-target" type="number" inputmode="decimal" value="${fw(S.target)}" class="flex-1 min-w-0 text-center px-3 py-3 bg-zinc-950 border border-zinc-700 rounded-xl text-white text-lg font-black">
        <button type="button" class="pt-at-st" data-at-step="1" aria-label="Raise the target">＋</button></div>
        <p class="text-[11px] mt-1.5 pt-at-${rl[1]}">${best ? (pct >= 0 ? "+" : "") + (Math.round(pct * 10) / 10) + "% on your best estimate. " : ""}${esc(rl[0])}</p></div>
      <div><span class="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Test day</span>
        <div class="flex flex-wrap gap-1.5 mb-2">${chip(7, "1 week")}${chip(14, "2 weeks")}${chip(21, "3 weeks")}${chip(28, "4 weeks")}</div>
        <input id="pt-at-date" type="date" value="${esc(S.date)}" min="${esc(addDs(ds(new Date()), 1))}" class="w-full px-3 py-3 bg-zinc-950 border border-zinc-700 rounded-xl text-white text-sm">
        <p class="text-[11px] text-zinc-500 mt-1">${left} day${left === 1 ? "" : "s"} from now · ${esc(dateTxt(S.date))}. ${left < 5 ? "That is tight for a taper. A week or more is better." : ""}</p></div>
      ${(() => { try { const d = PT.deloadCheck && PT.deloadCheck(a); return d && d.due ? `<p class="text-[11px] text-amber-300 leading-snug">Your recent weeks look heavy. A lighter week before the attempt will usually help more than extra work.</p>` : ""; } catch (e) { return ""; } })()}
    </div>`;
    a.openSheet("PR attempt", "Plan a test day", body, `<button type="button" id="pt-at-build" class="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm tap-active">${cur ? "Replace my plan" : "Build the plan"}</button>`);
  }

  /* ---------------------------------------------------------------- the sheet: the plan */
  function openPlan(a) {
    const p = plan(a); if (!p) { openSetup(a); return; }
    const pl = PT.attemptPlan(a, p), done = p.done || {}, hit = isHit(a, p);
    const rungHtml = r => `<button type="button" class="pt-at-rung tap-active${done[r.id] ? " on" : ""}${r.kind === "att" ? " att" : ""}" data-at-done="${r.id}" aria-pressed="${!!done[r.id]}">
        <span class="pt-at-tick">${done[r.id] ? "✓" : ""}</span>
        <span class="min-w-0 flex-1 text-left"><b class="block text-sm text-white">${fw(r.w)} ${unit(a)} × ${r.reps}</b>
          <span class="block text-[11px] text-zinc-400">${esc(r.label)}${r.pct ? " · " + r.pct + "%" : ""}${r.id === "a3" && PT.hype && PT.hype.linked() ? " · 🔊" : ""}${r.plates ? " · " + esc(platesTxt(r.plates)) : ""}</span></span>
        ${r.rest ? `<span class="text-[10px] text-zinc-500 shrink-0">rest ${esc(r.rest)}</span>` : ""}</button>`;
    const gap = a.prs && a.prs[p.name] ? (p.target / a.prs[p.name] - 1) * 100 : 0, rl = realism(gap);
    const days = pl.days.map(d => `<div class="pt-at-day"><div class="flex items-baseline justify-between gap-2"><b class="text-sm text-white">${esc(d.title)}</b><span class="text-[10px] font-bold uppercase tracking-wider text-zinc-500">${d.off === 0 ? "Today" : esc(dateTxt(d.ds))}</span></div><p class="text-[11px] text-zinc-400 leading-relaxed mt-0.5">${esc(d.txt)}</p>${d.mob ? `<button type="button" class="pt-at-mob tap-active" data-mob="${d.mob}">⏱ Start easy mobility</button>` : ""}</div>`).join("");
    const lt = pl.left;
    const head = hit ? `<div class="pt-at-banner hit">🎉 Hit it. ${fw(a.prs[p.name] >= p.target ? a.prs[p.name] : p.target)} ${unit(a)} estimated now.</div>`
      : lt < 0 ? `<div class="pt-at-banner">The test day was ${esc(dateTxt(p.date))}. How did it go?</div>`
        : lt === 0 ? `<div class="pt-at-banner today">It is attempt day. Work up the ladder and trust it.</div>`
          : `<div class="pt-at-banner">${lt} day${lt === 1 ? "" : "s"} to go · ${esc(dateTxt(p.date))}</div>`;
    const body = `<div class="space-y-4">${PT.hype ? PT.hype.liveHtml() : ""}${head}
      <div class="flex items-center justify-between gap-3"><div><span class="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">${esc(p.name)}</span><b class="text-2xl font-black text-white">${fw(p.target)} ${unit(a)}</b></div><p class="text-[11px] text-right max-w-[11rem] pt-at-${rl[1]}">${esc(rl[0])}</p></div>
      ${days ? `<div><span class="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">The week before</span><div class="space-y-2">${days}</div></div>` : ""}
      <div><span class="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Attempt day: warm-up ladder${pl.bar ? ` (${fw(a.selectedBarWeight || 0)} ${unit(a)} bar)` : ""}</span><div class="space-y-1.5">${pl.ladder.map(rungHtml).join("")}</div>
        <p class="text-[10px] text-zinc-500 leading-relaxed mt-2">Take attempt 2 only if the opener moved fast, and attempt 3 only if attempt 2 was smooth. Log your heaviest single as a normal set so it counts as a PR. Stop any attempt that hurts.</p></div>
      ${PT.hype ? PT.hype.block(a) : ""}
    </div>`;
    const foot = `<div class="flex gap-2"><button type="button" id="pt-at-cancel" class="px-3 py-3 rounded-xl bg-zinc-800 text-zinc-300 font-bold text-xs tap-active">Remove plan</button><button type="button" id="pt-at-edit" class="px-3 py-3 rounded-xl bg-zinc-800 text-zinc-100 font-bold text-xs tap-active">Change</button>${lt < 0 && !hit ? `<button type="button" id="pt-at-miss" class="px-3 py-3 rounded-xl bg-zinc-800 text-zinc-100 font-bold text-xs tap-active">Not this time</button>` : ""}<button type="button" id="pt-at-hit" class="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm tap-active">${hit ? "Save it and close 🎉" : "I hit it 🎉"}</button></div>`;
    a.openSheet("PR attempt", p.name, body, foot);
    try { PT.hype && PT.hype.afterRender(a); } catch (e) { }
  }
  PT.openAttempt = function () { const a = A(); if (a) { plan(a) ? openPlan(a) : openSetup(a); } };

  function finish(a, result) {
    const p = plan(a); if (!p) return;
    const lg = Array.isArray(a.settings.attemptLog) ? a.settings.attemptLog : [];
    lg.push({ name: p.name, target: p.target, date: p.date, result }); a.settings.attemptLog = lg.slice(-20);
    a.settings.attempt = null; save();
    try { a.closeSheet(); } catch (e) { }
    if (result === "hit") { try { PT.confetti && PT.confetti(); } catch (e) { } a.toast("Nice. That one is in the books."); } else a.toast("Plan closed. Plan another when you are ready.");
    try { a.renderProgressView(); a.renderHomeView(); } catch (e) { }
  }

  /* ---------------------------------------------------------------- Strength tab card */
  function cardHtml(a) {
    const p = plan(a), lg = (a.settings.attemptLog || []), last = lg[lg.length - 1];
    let html = `<h3 class="text-xs font-bold text-white">PR attempt planner</h3>`;
    if (p) {
      const left = daysTo(p.date), hit = isHit(a, p);
      html += `<button type="button" class="pt-lv-row tap-active" data-at-open="1"><div class="flex items-center justify-between gap-2"><span class="text-xs font-bold text-white truncate">🎯 ${esc(p.name)} · ${fw(p.target)} ${unit(a)}</span><span class="text-[11px] font-bold ${hit ? "text-emerald-400" : "text-amber-300"}">${hit ? "Hit it" : left < 0 ? "Past" : left === 0 ? "Today" : left + " day" + (left === 1 ? "" : "s")}</span></div><span class="block text-[10px] text-zinc-400 mt-0.5">${esc(dateTxt(p.date))} · tap for the plan and warm-up ladder</span></button>`;
    } else {
      html += `<p class="text-xs text-zinc-400 leading-snug">Pick a lift and a date. You get the week before and a warm-up ladder with the plates for each step.</p>`;
      if (last) html += `<p class="text-[11px] text-zinc-500">Last plan: ${esc(last.name)} ${fw(last.target)} ${unit(a)} on ${esc(dateTxt(last.date))}${last.result === "hit" ? " · hit ✓" : ""}.</p>`;
      html += `<button type="button" class="pt-b go w-full" data-at-new="1">Plan an attempt</button>`;
    }
    return html;
  }
  const oPV = proto.renderProgressView;
  proto.renderProgressView = function () {
    const r = oPV.apply(this, arguments);
    try {
      const root = $("progress-body"); if (!root) return r;
      const panel = root.querySelector('[data-ptab="strength"]') || root;
      const old = $("pt-attempt-card"); if (old) old.remove();
      const c = document.createElement("div"); c.id = "pt-attempt-card"; c.className = card; c.innerHTML = cardHtml(this);
      panel.appendChild(c);
    } catch (e) { console.error("PulseTrack attempt card", e); }
    return r;
  };

  /* ---------------------------------------------------------------- Home */
  function homeCard(a) {
    const host = $("home-work"); let b = $("pt-attempt-home"); const p = plan(a);
    const left = p ? daysTo(p.date) : 99, show = !!(host && p && left <= 7 && left >= -2 && p.result !== "hit");
    if (!show) { if (b) b.remove(); return; }
    if (!b) { b = document.createElement("button"); b.type = "button"; b.id = "pt-attempt-home"; b.className = "tap-active"; b.dataset.atOpen = "1"; }
    const t = left > 1 ? `in ${left} days` : left === 1 ? "tomorrow" : left === 0 ? "today" : "was " + dateTxt(p.date);
    b.innerHTML = `🎯 ${esc(p.name)} attempt ${t}<span>${fw(p.target)} ${unit(a)} · plan</span>`;
    if (host.nextElementSibling !== b) host.insertAdjacentElement("afterend", b);
  }
  const oHome = proto.renderHomeView;
  if (oHome) proto.renderHomeView = function () { const r = oHome.apply(this, arguments); try { homeCard(this); } catch (e) { console.error("PulseTrack attempt home", e); } return r; };

  /* ---------------------------------------------------------------- clicks */
  let confirmCancel = false;
  document.addEventListener("click", e => {
    const a = A(); if (!a || !e.target.closest) return;
    if (e.target.closest("[data-at-open]")) { confirmCancel = false; openPlan(a); return; }
    if (e.target.closest("[data-at-new]")) { S.name = ""; S.target = 0; S.date = ""; openSetup(a); return; }
    const st = e.target.closest("[data-at-step]");
    if (st) { const inc = a.increment ? a.increment() : 5, inp = $("pt-at-target"); S.target = Math.max(inc, (parseFloat(inp && inp.value) || S.target) + inc * parseInt(st.dataset.atStep, 10)); openSetup(a); return; }
    const dy = e.target.closest("[data-at-days]"); if (dy) { S.date = addDs(ds(new Date()), parseInt(dy.dataset.atDays, 10)); openSetup(a); return; }
    if (e.target.closest("#pt-at-build")) {
      const inp = $("pt-at-target"), t = parseFloat(inp && inp.value) || S.target, d = ($("pt-at-date") || {}).value || S.date;
      if (!(t > 0)) { a.toast("Enter a target weight"); return; }
      if (daysTo(d) < 1) { a.toast("Pick a day after today"); return; }
      const ld = load(a, S.name, t);
      a.settings.attempt = { name: S.name, target: ld.w, date: d, e1: (a.prs && a.prs[S.name]) || 0, created: ds(new Date()), done: {} }; save();
      openPlan(a); try { a.renderProgressView(); a.renderHomeView(); } catch (x) { } return;
    }
    const dn = e.target.closest("[data-at-done]");
    if (dn) { const p = plan(a); if (p) { p.done = p.done || {}; const k = dn.dataset.atDone; if (p.done[k]) delete p.done[k]; else p.done[k] = 1; save(); try { PT.hype && PT.hype.onTick(a, p, k, !!p.done[k]); } catch (x) { } const body = $("sheet-body"), top = body ? body.scrollTop : 0; openPlan(a); const b2 = $("sheet-body"); if (b2) b2.scrollTop = top; } return; }
    if (e.target.closest("#pt-at-edit")) { const p = plan(a); if (p) { S.name = p.name; S.target = p.target; S.date = p.date; } openSetup(a); return; }
    if (e.target.closest("#pt-at-cancel")) {
      const b = $("pt-at-cancel");
      if (!confirmCancel) { confirmCancel = true; if (b) { b.textContent = "Tap again to remove"; b.classList.add("text-rose-300"); } return; }
      confirmCancel = false; a.settings.attempt = null; save(); a.closeSheet(); try { a.renderProgressView(); a.renderHomeView(); } catch (x) { } return;
    }
    if (e.target.closest("#pt-at-hit")) { finish(a, "hit"); return; }
    if (e.target.closest("#pt-at-miss")) { finish(a, "missed"); return; }
  });
  document.addEventListener("change", e => {
    const a = A(); if (!a || !e.target) return;
    if (e.target.id === "pt-at-lift") { S.name = e.target.value; S.target = defTarget(a, S.name); openSetup(a); return; }
    if (e.target.id === "pt-at-target") { const v = parseFloat(e.target.value); if (v > 0) { S.target = v; openSetup(a); } return; }
    if (e.target.id === "pt-at-date") { if (e.target.value) { S.date = e.target.value; openSetup(a); } }
  });

  /* ---------------------------------------------------------------- CSS */
  const css = document.createElement("style"); css.id = "pt-v236-attempt-css";
  css.textContent = `
    .pt-at-st { width: 3rem; height: 3rem; flex: none; border-radius: .8rem; background: rgb(var(--z800)); color: #fff; font-size: 1.3rem; font-weight: 800; }
    .pt-at-ok { color: rgb(52 211 153); } .pt-at-mid { color: rgb(251 191 36); } .pt-at-hard { color: rgb(251 113 133); }
    .pt-at-banner { padding: .7rem .85rem; border-radius: .9rem; background: rgb(var(--z900)); border: 1px solid rgb(var(--z800)); font-size: .8rem; font-weight: 700; color: rgb(var(--z200)); text-align: center; }
    .pt-at-banner.today { background: rgb(245 158 11 / .1); border-color: rgb(245 158 11 / .5); color: rgb(252 211 77); }
    .pt-at-banner.hit { background: rgb(16 185 129 / .12); border-color: rgb(16 185 129 / .5); color: rgb(110 231 183); }
    .pt-at-day { padding: .7rem .85rem; border-radius: .9rem; background: rgb(var(--z900)); border: 1px solid rgb(var(--z800)); }
    .pt-at-mob { margin-top: .5rem; padding: .45rem .75rem; border-radius: .6rem; font-size: .72rem; font-weight: 800; background: rgb(var(--z800)); color: rgb(var(--z100)); }
    .pt-at-rung { display: flex; align-items: center; gap: .7rem; width: 100%; padding: .6rem .8rem; border-radius: .85rem; background: rgb(var(--z900)); border: 1px solid rgb(var(--z800)); }
    .pt-at-rung.att { border-color: rgb(245 158 11 / .4); }
    .pt-at-rung.on { opacity: .55; }
    .pt-at-tick { flex: none; width: 1.5rem; height: 1.5rem; border-radius: 9999px; border: 2px solid rgb(var(--z600)); display: grid; place-items: center; font-size: .8rem; font-weight: 900; color: #fff; }
    .pt-at-rung.on .pt-at-tick { background: rgb(var(--a600)); border-color: transparent; }
    #pt-attempt-home { display: flex; align-items: center; justify-content: space-between; gap: .5rem; width: 100%; padding: .6rem .85rem; border-radius: .9rem; font-size: .8rem; font-weight: 700; background: rgb(120 53 15 / .3); border: 1px solid rgb(180 83 9 / .55); color: #fde68a; text-align: left; margin-top: .5rem; }
    #pt-attempt-home span { font-size: .68rem; font-weight: 500; color: #fcd34d; text-align: right; }
    #pt-attempt-card .pt-b { padding: .6rem .85rem; border-radius: .7rem; font-size: .78rem; font-weight: 700; background: rgb(var(--z800)); color: rgb(var(--z100)); }
    #pt-attempt-card .pt-b.go { background: rgb(var(--a600)); color: #fff; }
  `;
  document.head.appendChild(css);
})();
  