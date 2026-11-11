/* =====================================================================
 * PulseTrack 2.83.0: streak shield.
 *  Your "days in a row" streak (training or checking in, the 🌱 number) used to break on any missed day. Now you can buy streak shields
 *  with coins (150 each, hold up to 3) in Progress → Rewards → Daily check-in:
 *  - After a missed day, the next time you open the app a shield is used on its own, as long as the streak it protects was 3 days or more
 *    and you hold enough shields for every missed day in a row (up to 3). Nothing is used when the streak could not be saved anyway.
 *  - Sick day, or you know you cannot make it: "Protect today" uses a shield for today by hand and hides the "I'm in today" prompt.
 *    If you train or check in on that day after all, the shield comes back.
 *  - A shield keeps the streak alive but never adds a day to it, and the milestone badges (7, 30, 100, 365 days) count real days only.
 *  - Days a shield covers show in amber in the 14 day strip. Shields held show next to the 🌱 on Home and in the Rewards card.
 *  The streak maths lives in module 046 (settings.shielded = the covered days); this module is buying, using and the screen.
 *  settings: shields (held), shieldBuys (bought in all, for the coin balance), shielded (days covered).
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined" || !PT.dayRunFrom || !PT.activeDaySet || !PT.coins) return;
  const proto = ApplicationUI.prototype;
  const A = () => window.app;
  const $ = id => document.getElementById(id);
  const PRICE = 150, CAP = 3, MIN_STREAK = 3, MAX_GAP = 3;
  const save = a => { try { WorkoutStorage.saveSettings(a.settings); } catch (e) { } };
  const held = a => Math.max(0, parseInt(a.settings.shields, 10) || 0);
  const covered = a => (Array.isArray(a.settings.shielded) ? a.settings.shielded : []);
  const midnight = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
  const fmt = n => Math.round(n).toLocaleString();

  PT.shieldSpent = a => Math.max(0, parseInt((a || A()).settings.shieldBuys, 10) || 0) * PRICE;
  PT.shieldCount = a => held(a || A());
  PT.shieldTag = a => (held(a) > 0 ? ` · 🛡 ${held(a)}` : "");
  PT.shieldPill = a => (held(a) > 0 ? `<span class="pt-pill" title="Streak shields">🛡 ${held(a)}</span>` : "");

  /* ============================================================== using them */
  /** the shield moves: a day you showed up on after all gives its shield back, then a run of missed days after a streak worth keeping is covered */
  function auto(a) {
    const out = { back: 0, used: [], kept: 0 };
    const act = PT.activeDaySet(a), cur = covered(a);
    const real = cur.filter(k => act.has(k));
    if (real.length) { a.settings.shielded = cur.filter(k => !act.has(k)); a.settings.shields = held(a) + real.length; out.back = real.length; }
    const sh = new Set(covered(a));
    const d = midnight(); d.setDate(d.getDate() - 1);
    const gap = [];
    while (gap.length <= MAX_GAP && !act.has(PT.ds(d)) && !sh.has(PT.ds(d))) { gap.push(PT.ds(d)); d.setDate(d.getDate() - 1); }
    if (gap.length && gap.length <= MAX_GAP && gap.length <= held(a)) {
      const before = PT.dayRunFrom(a, d);                                  // the streak that ends the day before the first missed day
      if (before >= MIN_STREAK) {
        a.settings.shielded = covered(a).concat(gap).slice(-400); a.settings.shields = held(a) - gap.length;
        out.used = gap; out.kept = before;
      }
    }
    if (out.back || out.used.length) save(a);
    return out;
  }
  function protect(a) {
    const today = PT.ds(), act = PT.activeDaySet(a);
    if (held(a) < 1) { a.toast("No streak shield to use"); return false; }
    if (act.has(today) || covered(a).includes(today)) { a.toast(act.has(today) ? "You already showed up today" : "Today is already protected"); return false; }
    a.settings.shielded = covered(a).concat(today).slice(-400); a.settings.shields = held(a) - 1; save(a);
    a.toast("🛡 Today is protected. Rest up, your streak is safe");
    return true;
  }
  async function buy(a) {
    if (held(a) >= CAP) { a.toast(`You can hold ${CAP} shields`); return false; }
    const coins = PT.coins(a); if (coins < PRICE) { a.toast(`You need ${fmt(PRICE - coins)} more dumbbells`); return false; }
    if (!(await PT.confirm(`Buy a streak shield for ${PRICE} dumbbells?\n\nIt keeps your days-in-a-row streak alive on a day you miss.`))) return false;
    a.settings.shields = held(a) + 1; a.settings.shieldBuys = (parseInt(a.settings.shieldBuys, 10) || 0) + 1; save(a);
    a.toast("🛡 Streak shield added");
    return true;
  }
  PT.shield = { auto: () => auto(A()), protect: () => protect(A()), buy: () => buy(A()), PRICE, CAP, MIN_STREAK, MAX_GAP };

  /* ============================================================== the screen */
  PT.shieldHtml = a => {
    const n = held(a), today = PT.ds(), act = PT.activeDaySet(a), can = n > 0 && !act.has(today) && !covered(a).includes(today), coins = PT.coins(a), full = n >= CAP;
    return `<div class="pt-shield">
      <div class="flex items-center justify-between gap-2"><div class="min-w-0"><span class="block text-sm font-black text-white">🛡 Streak shields · ${n} of ${CAP}</span><span class="block text-[11px] text-zinc-400">Keep your days in a row on a day you miss</span></div>
        <button type="button" class="pt-b ${!full && coins >= PRICE ? "go" : ""}" id="pt-shield-buy" ${full ? "disabled" : ""}>${full ? "Full" : "Buy · " + PT.DBI + " " + PRICE}</button></div>
      ${can ? `<div><button type="button" class="pt-b" id="pt-shield-use">🤒 Sick day? Protect today</button></div>` : ""}
      <p class="text-[11px] text-zinc-400 leading-snug">After a missed day, the next time you open the app a shield is used on its own when your streak was ${MIN_STREAK} days or more (up to ${MAX_GAP} missed days in a row). If you show up on a protected day, the shield comes back. A shield keeps the streak going but never adds a day, so the 7, 30, 100 and 365 day badges still need real days.</p></div>`;
  };
  const refresh = a => {
    try { a.renderHomeView(); } catch (e) { }
    try { if ($("progress-body") && $("view-progress") && !$("view-progress").classList.contains("hidden")) a.renderProgressView(); } catch (e) { }
  };
  document.addEventListener("click", async e => {
    const a = A(); if (!a || !e.target.closest) return;
    if (e.target.closest("#pt-shield-buy")) { e.preventDefault(); if (await buy(a)) refresh(a); return; }
    if (e.target.closest("#pt-shield-use")) { e.preventDefault(); if (protect(a)) refresh(a); }
  });

  /* ============================================================== when it happens: before Home and Progress draw */
  function run(app) {
    try {
      const r = auto(app);
      if (r.used.length) setTimeout(() => { try { app.toast(`🛡 A streak shield kept your ${r.kept}-day streak alive${r.used.length > 1 ? " (" + r.used.length + " missed days)" : ""}`, undefined, undefined, 6000); } catch (e) { } }, 500);
      else if (r.back) setTimeout(() => { try { app.toast("🛡 Your shield is back, you showed up"); } catch (e) { } }, 500);
    } catch (e) { console.error("PulseTrack streak shield", e); }
  }
  const oHome = proto.renderHomeView;
  proto.renderHomeView = function () { run(this); return oHome.apply(this, arguments); };
  const oPV = proto.renderProgressView;
  proto.renderProgressView = function () { run(this); return oPV.apply(this, arguments); };

  const css = document.createElement("style"); css.id = "pt-v283-css";
  css.textContent = `
    .pt-shield { display: flex; flex-direction: column; gap: .5rem; margin-top: .6rem; padding-top: .65rem; border-top: 1px solid rgb(var(--z800)); }
    .pt-dot.sh { background: rgb(251 191 36 / .85); }
    #pt-pg-chk .pt-shield .pt-b { padding: .5rem .85rem; border-radius: .65rem; font-size: .75rem; font-weight: 700; background: rgb(var(--z800)); color: rgb(var(--z100)); }
    #pt-pg-chk .pt-shield .pt-b.go { background: rgb(var(--a600)); color: #fff; }
    #pt-pg-chk .pt-shield .pt-b:disabled { opacity: .5; }
    #pt-pg-chk .pt-shield #pt-shield-buy { white-space: nowrap; flex: none; }
  `;
  document.head.appendChild(css);
})();
