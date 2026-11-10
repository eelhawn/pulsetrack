/* =====================================================================
 * PulseTrack 2.82.0: family boss fight.
 *  Progress → Social → Family → Boss fight. Every week a new boss shows up and the family beats it together.
 *  It needs nothing new to send: it is worked out from the update codes that already make the family board (days trained and new records
 *  each week, and each person's own weekly goal), so every update anyone sends also hits the boss.
 *  - Damage: each day you train = 100, up to one day over your own weekly goal; each new record = a 50 critical hit (up to 3).
 *  - Boss health: 100 for every day of everyone's weekly goal, so it is fair to people who train a different number of days. Someone who
 *    has not sent an update this week still counts in the health and shows as "waiting", so the bar drops as updates arrive. One day over
 *    your goal lets you carry someone who had a bad week.
 *  - Every boss you beat in a row makes the next one 10% tougher (up to +50%); a missed week resets it.
 *  - A win you took part in is kept, pays coins (40, plus 10 for each other person who landed a hit, up to 100) and unlocks the titles
 *    Boss Slayer (1), Boss Hunter (5) and Boss Legend (15). Wins are kept in settings.bossWins, keyed by the week.
 *  - 12 bosses rotate by week, the same for everybody (no code needed). "Rally the family" sends the boss's health and your update.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined" || !PT.famKit || !PT.rewards) return;
  const proto = ApplicationUI.prototype;
  const A = () => window.app;
  const $ = id => document.getElementById(id);
  const esc = s => PT.esc(s);
  const K = PT.famKit, DAY = 86400000, HIT = 100, CRIT = 50, CRITMAX = 3, BACK = 8;
  const save = a => { try { WorkoutStorage.saveSettings(a.settings); } catch (e) { } };
  const fmt = n => Math.round(n).toLocaleString();
  const bar = p => `<div class="pt-bar pt-bosshp"><span style="width:${Math.round(Math.max(0, Math.min(1, p)) * 100)}%"></span></div>`;

  const BOSSES = [
    ["🛋️", "Couch Golem", "Made of cushions and excuses."], ["🐌", "Snooze Slug", "Lives inside your alarm clock."],
    ["📱", "Doomscroll Dragon", "Breathes notifications."], ["🍕", "Cheat-Meal Cyclops", "One big eye on the leftovers."],
    ["🧟", "Skip-Day Zombie", "Rises every time a workout is missed."], ["🦥", "Sore-Legs Sloth", "Slow, and wants you slow too."],
    ["🕷️", "Rest-Day Spider", "Spins a very comfy web."], ["👻", "Ghost of Missed Reps", "Haunts the gym floor."],
    ["🐙", "Procrasti-Kraken", "Always says tomorrow."], ["🦖", "Leg-Day Rex", "Hates it when you show up."],
    ["🧌", "Plateau Troll", "Guards the bridge to the next record."], ["🤖", "Excuse-O-Tron 9000", "Has an answer for everything except effort."]
  ];
  /** the boss of a week (the Monday as YYYY-MM-DD): the same for everyone, no code needed */
  function bossOf(wid) {
    const t = PT.fromDs(wid), n = t ? Math.floor(Date.UTC(t.getFullYear(), t.getMonth(), t.getDate()) / (7 * DAY)) : 0;
    const b = BOSSES[((n % BOSSES.length) + BOSSES.length) % BOSSES.length];
    return { e: b[0], n: b[1], t: b[2] };
  }

  /* ============================================================== the numbers */
  const goalOf = p => { const ks = Object.keys(p.wk || {}).sort(), w = ks.length ? p.wk[ks[ks.length - 1]] : null; return w ? w.g : 3; };
  /** everybody's damage for one week (i weeks back). A past week counts only people who have a number for it; this week counts everyone on the board */
  function week(a, ppl, i) {
    const wid = K.dsOf(K.wkMon(i)), cur = i === 0, rows = [];
    ppl.forEach(p => {
      const w = p.wk && p.wk[wid]; if (!w && !cur) return;
      const g = K.effG(w ? w.g : goalOf(p)), d = w ? K.num(w.d) : 0, pr = w ? K.num(w.p) : 0, hits = Math.min(d, g + 1), crits = Math.min(pr, CRITMAX);
      rows.push({ n: p.n || "Me", me: !!p.me, g, d, pr, hits, crits, dmg: hits * HIT + crits * CRIT, share: g * HIT, wait: !w, t: p.t || 0 });
    });
    return { wid, rows, base: rows.reduce((t, r) => t + r.share, 0), dmg: rows.reduce((t, r) => t + r.dmg, 0) };
  }
  const mult = lvl => 1 + 0.1 * Math.min(lvl, 5);
  const hpOf = (base, lvl) => Math.round(base * mult(lvl) / 10) * 10;
  const wins = a => (a.settings.bossWins && typeof a.settings.bossWins === "object" && !Array.isArray(a.settings.bossWins) ? a.settings.bossWins : {});

  let memo = null;
  /** this week's fight and the last weeks, oldest first, with the boss level going into each */
  function state(a) {
    const key = [(a.sessions || []).length, (a.sessions || []).reduce((m, s) => Math.max(m, s.upd || s.ts || 0), 0), Object.values(a.settings.fam2 || {}).map(x => x && x.t).join(","),
      (a.settings.family || []).length, Object.keys(a.settings.wall || {}).length, a.settings.myName || "", Object.keys(wins(a)).length, PT.ds()].join("|");
    if (memo && memo.key === key) return memo.v;
    const ppl = Object.values(K.people(a)), past = []; let lvl = 0;
    for (let i = BACK; i >= 1; i--) {
      const w = week(a, ppl, i), hp = hpOf(w.base, lvl), has = w.rows.length > 0, won = has && hp > 0 && w.dmg >= hp;
      past.push({ i, wid: w.wid, rows: w.rows, hp, dmg: w.dmg, has, won, lvl, boss: bossOf(w.wid) });
      lvl = won ? lvl + 1 : 0;
    }
    const w = week(a, ppl, 0), hp = hpOf(w.base, lvl);
    const v = { wid: w.wid, rows: w.rows.slice().sort((x, y) => y.dmg - x.dmg || (x.me ? -1 : 1)), dmg: w.dmg, hp, left: Math.max(0, hp - w.dmg), lvl, boss: bossOf(w.wid),
      won: w.rows.length > 0 && hp > 0 && w.dmg >= hp, past: past.reverse() };
    memo = { key, v }; return v;
  }

  /* ============================================================== wins: kept, paid, celebrated once */
  PT.bossWins = a => Object.keys(wins(a || A())).length;
  PT.bossCoins = a => Object.values(wins(a || A())).reduce((n, w) => n + ((w && w.c) || 0), 0);
  /** records every week the family beat the boss with you in it; returns the new ones */
  function record(a, st) {
    const bw = wins(a), fresh = [];
    const take = (wid, rows, boss, hp, won) => {
      if (!won || bw[wid]) return;
      const me = rows.find(r => r.me); if (!me || me.dmg <= 0) return;                       // you have to be in it
      const others = rows.filter(r => !r.me && r.dmg > 0).length;
      bw[wid] = { b: boss.n, e: boss.e, hp, c: Math.min(100, 40 + 10 * others), n: others + 1, ts: Date.now() }; fresh.push(wid);
    };
    st.past.slice().reverse().forEach(p => take(p.wid, p.rows, p.boss, p.hp, p.won));
    take(st.wid, st.rows, st.boss, st.hp, st.won);
    if (fresh.length) { a.settings.bossWins = bw; save(a); memo = null; }
    return fresh.map(wid => Object.assign({ wid }, bw[wid]));
  }
  function check(a) {
    const fresh = record(a, state(a)); if (!fresh.length) return;
    const f = fresh[fresh.length - 1], cur = f.wid === K.dsOf(K.wkMon(0));
    setTimeout(() => {
      try {
        a.toast(cur ? `${f.e} You beat the ${f.b} together! +${f.c} coins` : `${f.e} The ${f.b} from ${PT.fmtDate ? PT.fmtDate(f.wid, { month: "short", day: "numeric" }) : f.wid} went down too. +${f.c} coins`, undefined, undefined, 6000);
        if (cur) PT.confetti && PT.confetti(70);
        a.renderHomeView && a.renderHomeView();
      } catch (e) { }
    }, 400);
  }

  /* ============================================================== the card */
  const pips = (d, g) => { const t = g + 1, on = Math.min(d, t); return "▮".repeat(on) + "▯".repeat(Math.max(0, g - on)) + (d > g ? " +" : ""); };
  function rowHtml(r) {
    const hurt = r.dmg > 0 ? `−${fmt(r.dmg)}` : "0";
    const sub = r.wait ? `<span class="pt-f2stale">waiting for an update</span>` : `${r.d} of ${r.g} days${r.crits ? ` · ${r.crits} critical hit${r.crits === 1 ? "" : "s"}` : ""}`;
    return `<div class="pt-bossrow ${r.me ? "me" : ""}"><div class="min-w-0 flex-1"><span class="block text-xs font-black text-white truncate">${esc(r.n)}${r.me ? " (you)" : ""}</span><span class="block pt-f2sub">${sub}</span></div>
      <span class="pt-bosspips" aria-hidden="true">${r.wait ? "·" : pips(r.d, r.g)}</span><span class="pt-bossdmg">${hurt}</span></div>`;
  }
  function statusLine(st) {
    const solo = st.rows.length <= 1, wait = st.rows.filter(r => r.wait && !r.me).map(r => r.n);
    if (st.won) return `<p class="text-[11px] font-bold text-emerald-400">Defeated 🏆 with ${fmt(st.dmg - st.hp)} damage to spare.</p>`;
    const days = Math.max(1, Math.ceil(st.left / HIT)), left = Math.max(0, Math.ceil((K.wkMon(0) + 7 * DAY - Date.now()) / DAY));
    const need = `<p class="text-[11px] text-zinc-300"><b class="text-white">${fmt(st.left)} HP</b> to go, about ${days} training day${days === 1 ? "" : "s"} for the family${left > 0 ? " with " + left + " day" + (left === 1 ? "" : "s") + " left" : ""}.</p>`;
    const w = wait.length ? `<p class="text-[11px] text-amber-300">Waiting for ${esc(wait.slice(0, 2).join(" and "))}${wait.length > 2 ? " and " + (wait.length - 2) + " more" : ""}. Their update hits the boss too.</p>` : "";
    const s = solo ? `<p class="text-[11px] text-zinc-400">Fighting alone. Paste your family's updates (Progress → Social → Family) to take on a bigger boss together.</p>` : "";
    return need + w + s;
  }
  function pastHtml(a, st) {
    const list = st.past.filter(p => p.has).slice(0, 6), n = PT.bossWins(a);
    if (!list.length && !n) return "";
    return `<div class="pt-bosshist"><span class="pt-f2h">Past bosses${n ? ` · 🏆 ${n} beaten by you` : ""}</span>${list.length ? `<div class="flex flex-wrap gap-1.5">${list.map(p => `<span class="pt-bh ${p.won ? "won" : ""}" title="${esc(p.boss.n)}: ${fmt(p.dmg)} of ${fmt(p.hp)} HP">${p.boss.e} ${p.won ? "✓" : "✗"}</span>`).join("")}</div>` : ""}</div>`;
  }
  function cardHtml(a) {
    const st = state(a), pct = st.hp ? st.left / st.hp : 0, left = Math.max(0, Math.ceil((K.wkMon(0) + 7 * DAY - Date.now()) / DAY));
    return `<div class="pt-boss ${st.won ? "dead" : ""}">
      <div class="flex items-center gap-2.5"><span class="pt-bosse">${st.boss.e}</span>
        <div class="min-w-0 flex-1"><div class="flex items-center gap-1.5 flex-wrap"><b class="text-sm font-black text-white">${esc(st.boss.n)}</b>${st.lvl ? `<span class="pt-pill" title="You have beaten ${st.lvl} in a row, so this one is ${st.lvl >= 5 ? 50 : st.lvl * 10}% tougher">Lv ${st.lvl + 1}</span>` : ""}</div>
          <span class="block text-[11px] text-zinc-400 leading-snug">${esc(st.boss.t)}</span></div>
        <span class="shrink-0 text-[10px] font-bold ${st.won ? "text-emerald-400" : "text-zinc-400"}">${st.won ? "Defeated" : left + " day" + (left === 1 ? "" : "s") + " left"}</span></div>
      <div>${bar(pct)}<div class="flex items-center justify-between text-[10px] text-zinc-400 mt-1"><span>${st.won ? "0" : fmt(st.left)} / ${fmt(st.hp)} HP</span><span>${Math.round((1 - pct) * 100)}% down</span></div></div>
      ${statusLine(st)}
      <div class="space-y-1.5">${st.rows.map(rowHtml).join("")}</div>
      <div class="flex flex-wrap gap-2"><button type="button" class="pt-b go" id="pt-boss-rally">⚔️ ${st.won ? "Share the win" : "Rally the family"}</button></div>
      <p class="text-[10px] text-zinc-500 leading-snug">Each day you train hits for 100 (one day over your weekly goal counts too), each new record is a 50 critical hit. The boss has 100 HP for every day of everyone's weekly goal, so it is fair when people train different amounts. Beating it together pays 40 coins, plus 10 for each other person who landed a hit.</p>
      ${pastHtml(a, st)}</div>`;
  }
  const OPEN = { v: false };
  function draw(a) {
    const root = $("progress-body"); if (!root) return;
    const old = $("pt-pg-rew5"); if (old) old.remove();
    const od = $("pt-pg-boss"); if (od) od.remove();
    const box = document.createElement("div"); box.id = "pt-pg-rew5"; box.className = "space-y-3";
    box.innerHTML = `<details class="pt-pg" id="pt-pg-boss" ${OPEN.v ? "open" : ""}><summary><span class="text-xs font-bold text-white">⚔️ Boss fight</span><span class="pt-chev">›</span></summary><div>${cardHtml(a)}</div></details>`;
    const after = $("pt-pg-rew4") || $("pt-pg-rew3") || $("pt-pg-rew2");
    if (after && after.parentNode === root) after.insertAdjacentElement("afterend", box); else root.appendChild(box);
    box.querySelector("details").addEventListener("toggle", e => { OPEN.v = e.target.open; });
  }
  const oPV = proto.renderProgressView;
  proto.renderProgressView = function () {
    const r = oPV.apply(this, arguments);
    try { check(this); draw(this); } catch (e) { console.error("PulseTrack boss fight", e); }
    return r;
  };
  const oHome = proto.renderHomeView;
  proto.renderHomeView = function () {
    const r = oHome.apply(this, arguments);
    try { if (!this.__bossHome) { this.__bossHome = true; setTimeout(() => { try { this.__bossHome = false; check(this); } catch (e) { } }, 1200); } } catch (e) { }
    return r;
  };

  /* ============================================================== rally */
  async function rally() {
    const a = A(); if (!a) return;
    if (!K.myName(a)) {
      const v = await PT.prompt("What name should your family see?", "", { title: "Your name", ok: "Save", maxlength: 24 });
      const n = String(v || "").trim().slice(0, 24); if (!n) return; a.settings.myName = n; save(a); memo = null;
    }
    const st = state(a), me = st.rows.find(r => r.me), who = K.myName(a), tail = PT.famUpdateCode ? "\n" + PT.famUpdateCode(a) : "";
    const text = st.won
      ? `${st.boss.e} We beat the ${st.boss.n}! ${st.rows.filter(r => r.dmg > 0).length} of us landed hits this week 🏆 In PulseTrack: Progress > Social > Paste update.${tail}`
      : `⚔️ The ${st.boss.e} ${st.boss.n} has ${fmt(st.left)} of ${fmt(st.hp)} HP left this week. ${who} has dealt ${fmt(me ? me.dmg : 0)}. Who is in? In PulseTrack: Progress > Social > Paste update.${tail}`;
    try { if (navigator.share) { await navigator.share({ title: "Family boss fight", text }); if (PT.famMarkSent) PT.famMarkSent(); return; } } catch (e) { if (e && e.name === "AbortError") return; }
    try { await navigator.clipboard.writeText(text); a.toast("Copied. Paste it in your family chat"); } catch (e) { await PT.alert("Copy this:\n\n" + text); }
    if (PT.famMarkSent) PT.famMarkSent();
  }
  document.addEventListener("click", e => { if (e.target.closest && e.target.closest("#pt-boss-rally")) { e.preventDefault(); rally(); } });

  PT.boss = { state: () => state(A()), bossOf, record: () => record(A(), state(A())), check: () => check(A()), BOSSES, mult, hpOf, reset: () => { memo = null; } };

  const css = document.createElement("style"); css.id = "pt-v282-css";
  css.textContent = `
    .pt-boss { display: flex; flex-direction: column; gap: .65rem; }
    .pt-bosse { flex: none; width: 2.9rem; height: 2.9rem; display: flex; align-items: center; justify-content: center; font-size: 1.9rem; border-radius: .9rem; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); }
    .pt-boss.dead .pt-bosse { filter: grayscale(1); opacity: .7; }
    .pt-bosshp { height: .6rem; }
    .pt-bosshp span { background: linear-gradient(90deg, #ef4444, #f59e0b); }
    .pt-boss.dead .pt-bosshp span { background: rgb(var(--z700)); }
    .pt-bossrow { display: flex; align-items: center; gap: .6rem; padding: .5rem .65rem; border-radius: .75rem; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); }
    .pt-bossrow.me { border-color: rgb(var(--a500) / .6); }
    .pt-bosspips { flex: none; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .7rem; letter-spacing: -.05em; color: rgb(var(--a400)); }
    .pt-bossdmg { flex: none; min-width: 3.2rem; text-align: right; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-weight: 800; font-size: .82rem; color: #f87171; }
    .pt-bosshist { display: flex; flex-direction: column; gap: .35rem; padding-top: .5rem; border-top: 1px solid rgb(var(--z800)); }
    .pt-bh { padding: .2rem .45rem; border-radius: .5rem; background: rgb(var(--z900)); border: 1px solid rgb(var(--z800)); font-size: .75rem; font-weight: 800; color: rgb(var(--z400)); }
    .pt-bh.won { color: #34d399; border-color: rgb(52 211 153 / .45); }
    #pt-pg-boss .pt-b { padding: .5rem .85rem; border-radius: .65rem; font-size: .75rem; font-weight: 700; background: rgb(var(--z800)); color: rgb(var(--z100)); }
    #pt-pg-boss .pt-b.go { background: rgb(var(--a600)); color: #fff; }
    html[data-mode="light"] .pt-bossdmg { color: #dc2626; }
    html[data-mode="light"] .pt-bh.won { color: #047857; }
  `;
  document.head.appendChild(css);
})();
