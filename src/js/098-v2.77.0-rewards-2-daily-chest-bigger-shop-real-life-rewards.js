/* =====================================================================
 * PulseTrack 2.77.0: Rewards 2.0.
 *  - A "Today" card at the top of Rewards: your coins, a daily chest, what you are closest to, and how coins are earned.
 *  - Daily chest: one a day once you have trained or checked in. The prize is a surprise (coins, sometimes XP), bigger on a long streak.
 *  - More ways to earn coins, so the shop does not run dry: records, quests, goal weeks, challenges, badges and chests.
 *  - A much bigger shop with sections: more colors, frames and confetti, plus Titles (your name tag under Level) and Home card banners.
 *    Season rewards now really give titles (tier 6 and tier 8), and every level title can be picked again.
 *  - My real rewards: set a prize you actually want (a cheat meal, new gear) and a coin price; claim it when you have saved enough.
 *  Everything is worked out from saved data; the only new saved things are chests, titles, banners and your own prizes.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined" || !PT.rewards || !PT.SHOP || !PT.seasons || !PT.shopHooks) return;
  const proto = ApplicationUI.prototype;
  const A = () => window.app;
  const $ = id => document.getElementById(id);
  const esc = s => PT.esc(s);
  const DAY = 86400000;
  const fmt = v => Math.round(v).toLocaleString();
  const arr = (a, k) => (Array.isArray(a.settings[k]) ? a.settings[k] : []);
  const save = () => { try { WorkoutStorage.saveSettings(A().settings); } catch (e) { } };
  const S = a => a.sessions || [];
  const bar = p => `<div class="pt-bar"><span style="width:${Math.round(Math.max(0, Math.min(1, p)) * 100)}%"></span></div>`;
  const owned = a => arr(a, "shopOwned");
  const hexA = (h, al) => { const m = /^#?([0-9a-f]{6})$/i.exec(h || ""); if (!m) return h; const n = parseInt(m[1], 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${al})`; };
  const card = "bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5 space-y-2";

  /* ============================================================== daily chest */
  const trainedToday = a => S(a).some(s => s.date === PT.ds());
  const checkedIn = a => arr(a, "checkins").includes(PT.ds());
  const ready = a => trainedToday(a) || checkedIn(a);
  const chestOf = (a, ds) => arr(a, "chests").find(c => c && c.d === (ds || PT.ds()));
  const hash = str => { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const rng = seed => () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const MULT = n => (n >= 100 ? 2 : n >= 30 ? 1.5 : n >= 7 ? 1.25 : 1);
  const TIERS = { common: ["Common", "#a1a1aa"], rare: ["Rare", "#38bdf8"], epic: ["Epic", "#c084fc"], legendary: ["Legendary", "#fbbf24"] };
  /** the same prize for the same person and day, however often the page is opened: 70% common, 22% rare, 7% epic, 1% legendary */
  function rollChest(a, ds) {
    const r = rng(hash("chest|" + ds + "|" + (a.settings.myName || ""))), x = r(), n = PT.dayStreak ? PT.dayStreak(a) : 0, m = MULT(n);
    let tier, coins, xp = 0;
    if (x < 0.01) { tier = "legendary"; coins = 250; xp = 100; }
    else if (x < 0.08) { tier = "epic"; coins = 90 + Math.floor(r() * 51); xp = 25; }
    else if (x < 0.30) { tier = "rare"; coins = 40 + Math.floor(r() * 31); }
    else { tier = "common"; coins = 15 + Math.floor(r() * 16); }
    return { d: ds, tier, coins: Math.max(5, Math.round(coins * m / 5) * 5), xp, mult: m };
  }
  function openChest(a) {
    if (!ready(a) || chestOf(a)) return null;
    const c = rollChest(a, PT.ds()), l = arr(a, "chests"); l.push(c); a.settings.chests = l.slice(-800); save();
    return c;
  }
  const xpExtras0 = PT.xpExtras, xpKey0 = PT.xpKey;
  PT.xpExtras = a => Object.assign({}, xpExtras0 ? xpExtras0(a) : {}, { chests: arr(a, "chests").reduce((n, c) => n + ((c && c.xp) || 0), 0) });
  PT.xpKey = a => (xpKey0 ? xpKey0(a) : "") + "," + arr(a, "chests").length + "," + (a.settings.titleSel || "");

  /* ============================================================== coins: more ways to earn them */
  const BADGE_COINS = [10, 20, 40, 75];
  const redeemed = a => arr(a, "myRewards").reduce((n, w) => n + (w && w.claimed ? (w.paid || w.price || 0) : 0), 0);
  /** where the coins come from (everything is worked out from your saved data) */
  function income(a) {
    const r = PT.rewards(a), p = r.parts || {}, sv = PT.seasons(a);
    const o = {
      xp: Math.floor(r.xp / 10), season: sv.coins,
      records: Math.round((p.prs || 0) / 60) * 10, quests: Math.round((p.quests || 0) / 100) * 25, weeks: Math.round((p.weeks || 0) / 50) * 20,
      challenges: Math.round((p.challenges || 0) / 300) * 100,
      badges: (r.badges || []).filter(b => b.got).reduce((n, b) => n + (BADGE_COINS[b.tier] || 10), 0),
      chests: arr(a, "chests").reduce((n, c) => n + ((c && c.coins) || 0), 0)
    };
    o.bonus = o.records + o.quests + o.weeks + o.challenges + o.badges + o.chests;
    return o;
  }
  PT.coins = a => { a = a || A(); return Math.max(0, PT.coinsRaw(a) + income(a).bonus - redeemed(a)); };
  PT.coinIncome = income;

  /* ============================================================== titles */
  const seasonTitles = a => { const out = []; PT.seasons(a).list.forEach(s => { out.push({ id: "ss" + s.i + "v", text: `${s.name} Veteran`, have: s.tier >= 6, req: "Season tier 6" }); if (s.tier >= 8 || s.cur) out.push({ id: "ss" + s.i + "c", text: `${s.name} Champion`, have: s.tier >= 8, req: "Season tier 8" }); }); return out; };
  function titleEntries(a, L) {
    const lv = (PT.levelTitles || []).map(x => ({ id: "lv" + x[0], text: x[1], have: L >= x[0], req: "Level " + x[0] }));
    const shop = PT.SHOP.filter(x => x.kind === "title").map(x => ({ id: x.id, text: x.text, have: owned(a).includes(x.id), req: "In the shop" }));
    return lv.concat(seasonTitles(a), shop);
  }
  /** the title you picked, shown instead of the level title (Home card, Level, share pictures) */
  PT.customTitle = (a, L) => {
    const id = a && a.settings && a.settings.titleSel; if (!id) return null;
    const e = titleEntries(a, L).find(x => x.id === id); return e && e.have ? e.text : null;
  };
  function earnedTitles(a) {
    const L = PT.rewards(a).lv.L, cur = a.settings.titleSel || "", es = titleEntries(a, L).filter(x => !/^t_/.test(x.id));
    const chip = (id, text, have, req) => `<button type="button" class="pt-frame tap-active ${have ? "" : "lock"}" data-title2="${id}" ${have ? "" : "disabled"} aria-pressed="${cur === id}"><i style="background:linear-gradient(135deg,#fde68a,#d97706)"></i>${esc(text)}${have ? "" : " · " + esc(req)}</button>`;
    return `<span class="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mt-2">Earned titles</span><div class="pt-frames mt-1">${chip("", "Automatic (your level)", true, "")}${es.map(e => chip(e.id, e.text, e.have, e.req)).join("")}</div>`;
  }

  /* ============================================================== the bigger shop */
  const add = list => list.forEach(x => { if (!PT.SHOP.some(y => y.id === x.id)) PT.SHOP.push(x); });
  add([
    { id: "c_sun", kind: "color", name: "Sunburst", hex: "#ffc400", price: 120 }, { id: "c_crimson", kind: "color", name: "Crimson", hex: "#ff2e4d", price: 120 },
    { id: "c_cobalt", kind: "color", name: "Cobalt", hex: "#2f6bff", price: 120 }, { id: "c_grape", kind: "color", name: "Grape", hex: "#b24bff", price: 120 },
    { id: "c_mint", kind: "color", name: "Mint", hex: "#3dffb4", price: 120 },
    { id: "f_candy", kind: "frame", name: "Candy", c: ["#ff9ad5", "#ffd1f0", "#9ad7ff"], price: 250 }, { id: "f_toxic", kind: "frame", name: "Toxic", c: ["#39ff14", "#0b8f3a"], price: 250 },
    { id: "f_rose", kind: "frame", name: "Rose gold", c: ["#fbc7b5", "#e8a0bf", "#c98bb9"], price: 350 }, { id: "f_royal", kind: "frame", name: "Regal", c: ["#f5d142", "#7c3aed"], price: 450 },
    { id: "x_muscle", kind: "fx", name: "Gains", style: "muscle", icon: "💪", price: 200 }, { id: "x_pizza", kind: "fx", name: "Cheat meal", style: "pizza", icon: "🍕", price: 200 },
    { id: "x_money", kind: "fx", name: "Money", style: "money", icon: "💸", price: 250 }, { id: "x_skull", kind: "fx", name: "Skulls", style: "skull", icon: "💀", price: 250 },
    { id: "x_heart", kind: "fx", name: "Hearts", style: "heart", icon: "❤️", price: 250 }, { id: "x_iron", kind: "fx", name: "Iron", style: "iron", icon: "🏋️", price: 300 },
    { id: "t_pump", kind: "title", name: "Pump Chaser", text: "Pump Chaser", price: 100 }, { id: "t_rat", kind: "title", name: "Gym Rat", text: "Gym Rat", price: 100 },
    { id: "t_bird", kind: "title", name: "Early Bird", text: "Early Bird", price: 100 }, { id: "t_owl", kind: "title", name: "Night Owl", text: "Night Owl", price: 100 },
    { id: "t_monk", kind: "title", name: "Iron Monk", text: "Iron Monk", price: 150 }, { id: "t_wizard", kind: "title", name: "Cable Wizard", text: "Cable Wizard", price: 150 },
    { id: "t_pre", kind: "title", name: "Pre-Exhaust Pro", text: "Pre-Exhaust Pro", price: 150 }, { id: "t_hands", kind: "title", name: "Heavy Hands", text: "Heavy Hands", price: 150 },
    { id: "t_sharm", kind: "title", name: "Sharm Lord", text: "Sharm Lord", price: 200 }, { id: "t_legs", kind: "title", name: "Leg Day Survivor", text: "Leg Day Survivor", price: 200 },
    { id: "t_built", kind: "title", name: "Built Different", text: "Built Different", price: 300 }, { id: "t_machine", kind: "title", name: "The Machine", text: "The Machine", price: 300 },
    { id: "t_never", kind: "title", name: "Never Skips Legs", text: "Never Skips Legs", price: 400 }, { id: "t_mass", kind: "title", name: "Mass Monster", text: "Mass Monster", price: 400 },
    { id: "b_sunset", kind: "banner", name: "Sunset", c: ["#fb923c", "#e11d48"], price: 150 }, { id: "b_ocean", kind: "banner", name: "Ocean", c: ["#38bdf8", "#4f46e5"], price: 150 },
    { id: "b_forest", kind: "banner", name: "Forest", c: ["#34d399", "#065f46"], price: 150 }, { id: "b_grape", kind: "banner", name: "Grape", c: ["#c084fc", "#6d28d9"], price: 150 },
    { id: "b_gold", kind: "banner", name: "Gold", c: ["#fde68a", "#d97706"], price: 250 }, { id: "b_candy", kind: "banner", name: "Candy", c: ["#f9a8d4", "#67e8f9"], price: 250 },
    { id: "b_ember", kind: "banner", name: "Ember", c: ["#f97316", "#7f1d1d"], price: 250 }, { id: "b_midnight", kind: "banner", name: "Midnight", c: ["#6366f1", "#0f172a"], price: 250 }
  ]);
  PT.fxEmoji = { muscle: "💪", pizza: "🍕", money: "💸", skull: "💀", heart: "❤️", iron: "🏋️" };
  PT.shopKinds.push(["title", "Titles"], ["banner", "Home card banners"]);
  PT.shopHooks.title = {
    cols: 2,
    preview: x => `<span class="text-xl leading-none">🎖</span>`,
    equip: (a, it) => { a.settings.titleSel = it.id; save(); },
    equipped: (a, it) => a.settings.titleSel === it.id,
    extra: a => earnedTitles(a)
  };
  PT.shopHooks.banner = {
    preview: x => `<i class="pt-sw wide" style="background:linear-gradient(120deg,${x.c.join(",")})"></i>`,
    equip: (a, it) => { a.settings.banner = it.id; save(); },
    equipped: (a, it) => a.settings.banner === it.id
  };
  function applyBanner(a) {
    const c = $("pt-you-card"); if (!c) return;
    const it = PT.SHOP.find(x => x.kind === "banner" && x.id === a.settings.banner && owned(a).includes(x.id));
    c.style.backgroundImage = it ? `linear-gradient(120deg, ${hexA(it.c[0], 0.3)}, ${hexA(it.c[1], 0.22)})` : "";
    c.style.borderColor = it ? hexA(it.c[1], 0.6) : "";
  }

  /* ============================================================== real rewards: your own prizes */
  const IDEAS = [["🍕", "Cheat meal", 800], ["😴", "Guilt-free rest day", 400], ["🎬", "Movie night", 1000], ["🥤", "Fancy pre-workout", 1500], ["👟", "New gym gear", 3000]];
  const wishes = a => arr(a, "myRewards").filter(w => w && !w.claimed);
  const claimed = a => arr(a, "myRewards").filter(w => w && w.claimed).sort((x, y) => (y.claimed || 0) - (x.claimed || 0));
  const newId = () => "w" + Date.now().toString(36) + Math.floor(Math.random() * 1296).toString(36);
  function addWish(a, name, price) {
    const l = arr(a, "myRewards"); l.push({ id: newId(), name: String(name).trim().slice(0, 40), price: Math.max(10, Math.min(100000, Math.round(price))), added: Date.now() });
    a.settings.myRewards = l.slice(-60); save();
  }

  /* ============================================================== the cards */
  const OPEN = {};
  function nextRows(a, coins, r) {
    const rows = [], sv = PT.seasons(a).cur, TX = PT.seasonTierXp || 400;
    if (sv && sv.tier < 8) rows.push({ i: "🏟", t: `Season tier ${sv.tier + 1}`, s: `${fmt((sv.tier + 1) * TX - sv.xp)} XP to go`, p: (sv.xp - sv.tier * TX) / TX });
    rows.push({ i: "⚡", t: `Level ${r.lv.L + 1}`, s: `${fmt(r.lv.nxt - r.xp)} XP to go`, p: r.lv.pct });
    const want = wishes(a).map(w => ({ n: w.name, price: w.price, real: true })).concat(PT.SHOP.filter(x => !owned(a).includes(x.id)).map(x => ({ n: x.name, price: x.price })));
    const near = want.filter(x => x.price > coins).sort((x, y) => (y.price ? coins / y.price : 0) - (x.price ? coins / x.price : 0) || x.price - y.price)[0];
    if (near) rows.push({ i: near.real ? "🎁" : "🛍", t: near.n, s: `${fmt(near.price - coins)} coins to go`, p: coins / near.price });
    const qs = PT.quests ? PT.quests(a) : [], qd = qs.filter(q => q.done).length;
    if (qs.length) rows.push({ i: "🎯", t: "Weekly quests", s: `${qd} of ${qs.length} done`, p: qd / qs.length });
    return rows;
  }
  function chestStrip(a) {
    return Array.from({ length: 7 }, (_, k) => {
      const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (6 - k)); const c = chestOf(a, PT.ds(d));
      return `<span class="pt-cd"><i class="${c ? "on " + c.tier : ""}" title="${esc(PT.ds(d))}">${c ? c.coins : ""}</i><em>${"SMTWTFS"[d.getDay()]}</em></span>`;
    }).join("");
  }
  function chestHtml(a) {
    const done = chestOf(a), rdy = ready(a), n = PT.dayStreak ? PT.dayStreak(a) : 0, m = MULT(n);
    let main;
    if (done) {
      const t = TIERS[done.tier] || TIERS.common;
      main = `<div class="pt-chest open" style="--tc:${t[1]}"><span class="pt-chest-i">🎁</span><div class="min-w-0"><b class="text-white">${t[0]} chest opened</b><span>+${fmt(done.coins)} coins${done.xp ? " · +" + done.xp + " XP" : ""}${done.mult > 1 ? " · ×" + done.mult + " streak bonus" : ""}</span><small>Back tomorrow for the next one.</small></div></div>`;
    } else if (rdy) {
      main = `<button type="button" class="pt-chest ready tap-active" id="pt-chest-open"><span class="pt-chest-i">🎁</span><div class="min-w-0"><b class="text-white">Open today's chest</b><span>${m > 1 ? "×" + m + " streak bonus on today's prize" : "A surprise: coins, sometimes XP"}</span></div></button>`;
    } else {
      main = `<div class="pt-chest locked"><span class="pt-chest-i">🔒</span><div class="min-w-0"><b class="text-white">Daily chest</b><span>Train or check in to unlock today's chest.</span></div></div><button type="button" class="pt-b go" id="pt-checkin-go">✋ I'm in today</button>`;
    }
    return `${main}<div class="pt-cstrip" aria-label="Chests this week">${chestStrip(a)}</div>`;
  }
  function howHtml(a) {
    const o = income(a), sp = PT.SHOP.filter(x => owned(a).includes(x.id)).reduce((n, x) => n + x.price, 0), rd = redeemed(a);
    const L = (k, v) => `<span>${k}</span><b class="text-white">${v < 0 ? "−" + fmt(-v) : fmt(v)}</b>`;
    return `<details class="pt-how"><summary>How coins work</summary><div class="pt-howg">${L("Workouts and sets (1 per 10 XP)", o.xp)}${L("Season tiers", o.season)}${L("Records (10 each)", o.records)}${L("Weekly quests (25 each)", o.quests)}${L("Goal weeks (20 each)", o.weeks)}${L("Challenges (100 each)", o.challenges)}${L("Badges (10 to 75 each)", o.badges)}${L("Daily chests", o.chests)}${L("Spent in the shop", -sp)}${L("Spent on real rewards", -rd)}</div>
      <p class="text-[11px] text-zinc-400 leading-snug mt-1">Chest odds: common 70%, rare 22%, epic 7%, legendary 1%. Check-in or training streaks of 7, 30 and 100 days add ×1.25, ×1.5 and ×2 to the prize.</p></details>`;
  }
  function hubHtml(a) {
    const coins = PT.coins(a), r = PT.rewards(a), sk = r.streak, ds = PT.dayStreak ? PT.dayStreak(a) : 0;
    const next = nextRows(a, coins, r).map(x => `<div class="pt-nx"><span class="pt-nx-i">${x.i}</span><div class="min-w-0 flex-1"><div class="flex items-baseline justify-between gap-2"><span class="text-xs font-bold text-white truncate">${esc(x.t)}</span><span class="shrink-0 text-[10px] text-zinc-400">${esc(x.s)}</span></div>${bar(x.p)}</div></div>`).join("");
    return `<div id="pt-pg-hub" class="pt-hub ${card}">
      <div class="flex items-center justify-between gap-2"><div><span class="block text-2xl font-black text-amber-300 leading-none">🪙 ${fmt(coins)}</span><span class="block text-[11px] text-zinc-400 mt-1">coins to spend</span></div>
        <div class="flex gap-1.5 flex-wrap justify-end"><span class="pt-pill" title="Level">⚡ ${r.lv.L}</span><span class="pt-pill" title="Weeks in a row you hit your goal">🔥 ${sk.cur}</span><span class="pt-pill" title="Days in a row">🌱 ${ds}</span></div></div>
      ${chestHtml(a)}
      <div class="pt-nxs"><span class="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Closest to you</span>${next}</div>
      ${howHtml(a)}</div>`;
  }
  function wishHtml(a) {
    const coins = PT.coins(a), list = wishes(a), done = claimed(a), have = new Set(list.map(w => w.name.toLowerCase()));
    const rows = list.map(w => { const can = coins >= w.price;
      return `<div class="pt-qrow"><div class="flex items-center justify-between gap-2"><span class="text-sm font-black text-white min-w-0 truncate">${esc(w.name)}</span><span class="shrink-0 text-xs font-black text-amber-300">🪙 ${fmt(w.price)}</span></div>${bar(coins / w.price)}
        <div class="flex items-center justify-between gap-2"><span class="text-[11px] ${can ? "text-emerald-400 font-bold" : "text-zinc-400"}">${can ? "You can claim this" : fmt(w.price - coins) + " coins to go"}</span>
        <span class="flex gap-1.5"><button type="button" class="pt-b ${can ? "go" : ""}" data-wclaim="${w.id}" ${can ? "" : "disabled"}>Claim</button><button type="button" class="pt-b" data-wedit="${w.id}" aria-label="Change the price of ${esc(w.name)}">Price</button><button type="button" class="pt-b" data-wdel="${w.id}" aria-label="Remove ${esc(w.name)}">✕</button></span></div></div>`; }).join("");
    const ideas = IDEAS.filter(x => !have.has(x[1].toLowerCase())).map((x, i) => `<button type="button" class="pt-schip tap-active" data-widea="${i}">${x[0]} ${esc(x[1])} · ${fmt(x[2])}</button>`).join("");
    const hist = done.slice(0, 5).map(w => `<div class="flex items-center justify-between gap-2 text-[11px]"><span class="text-zinc-300 min-w-0 truncate">✅ ${esc(w.name)}</span><span class="shrink-0 text-zinc-500">${esc(new Date(w.claimed).toLocaleDateString(undefined, { month: "short", day: "numeric" }))} · 🪙 ${fmt(w.paid || w.price || 0)} <button type="button" class="pt-link" data-wagain="${w.id}">again</button></span></div>`).join("");
    return `<details class="pt-pg" id="pt-pg-wish" ${OPEN.wish ? "open" : ""}><summary><span class="text-xs font-bold text-white">🎁 My real rewards</span><span class="pt-chev">›</span></summary><div>
      <p class="text-[11px] text-zinc-400 leading-snug">Pick a prize you really want and save your coins for it. Claim it when you have enough, then go enjoy it. Your call, on the honor system.</p>
      ${rows || '<p class="text-[11px] text-zinc-500">No prizes yet. Add one below.</p>'}
      <div class="flex gap-2 flex-wrap"><button type="button" class="pt-b go" id="pt-wish-add">+ Add a reward</button></div>
      ${ideas ? `<span class="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mt-1">Ideas (tap to add)</span><div class="pt-schips wrap">${ideas}</div>` : ""}
      ${hist ? `<span class="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mt-1">Claimed</span><div class="space-y-1">${hist}</div>` : ""}</div></details>`;
  }
  function draw(a) {
    const root = $("progress-body"); if (!root) return;
    const old = $("pt-pg-rew3"); if (old) old.remove();
    const box = document.createElement("div"); box.id = "pt-pg-rew3"; box.className = "space-y-3";
    box.innerHTML = hubHtml(a) + wishHtml(a);
    const r2 = $("pt-pg-rew2"); if (r2 && r2.parentNode === root) r2.insertAdjacentElement("afterend", box); else root.appendChild(box);
    box.querySelectorAll("details.pt-pg").forEach(d => d.addEventListener("toggle", () => { OPEN[d.id.replace("pt-pg-", "")] = d.open; }));
  }
  const oPV = proto.renderProgressView;
  proto.renderProgressView = function () {
    const r = oPV.apply(this, arguments);
    try { draw(this); } catch (e) { console.error("PulseTrack rewards 2", e); }
    return r;
  };
  const refresh = a => { try { if ($("progress-body") && $("view-progress") && !$("view-progress").classList.contains("hidden")) a.renderProgressView(); } catch (e) { } try { a.renderHomeView(); } catch (e) { } };

  /* ============================================================== Home: banner and a gift when a chest is waiting */
  const oHome = proto.renderHomeView;
  proto.renderHomeView = function () {
    const r = oHome.apply(this, arguments);
    try {
      applyBanner(this);
      const c = $("pt-you-card"), first = c && c.querySelector(".pt-you-r > span");
      if (first && ready(this) && !chestOf(this) && !first.querySelector(".pt-gift")) first.insertAdjacentHTML("beforeend", ' <span class="pt-gift" role="img" aria-label="Daily chest ready">🎁</span>');
    } catch (e) { console.error("PulseTrack rewards 2 home", e); }
    return r;
  };
  // the Home level card opens the Rewards tab
  document.addEventListener("click", e => { const a = A(); if (a && e.target.closest && e.target.closest("#pt-you-card")) a._progTab = "rewards"; }, true);

  /* a reminder after a workout: the chest is ready */
  const oFin = proto.finishWorkoutV2;
  if (oFin) proto.finishWorkoutV2 = async function () {
    const n0 = (this.sessions || []).length, r = await oFin.apply(this, arguments);
    try {
      if ((this.sessions || []).length > n0 && !chestOf(this)) setTimeout(() => { try { if (!chestOf(this)) this.toast("🎁 Your daily chest is ready", "Open", () => { this._progTab = "rewards"; this.showView("progress"); }, 5000); } catch (e) { } }, 2600);
    } catch (e) { console.error("PulseTrack rewards 2 finish", e); }
    return r;
  };

  /* ============================================================== clicks */
  document.addEventListener("click", async e => {
    const a = A(); if (!a || !e.target.closest) return; const t = id => e.target.closest("#" + id), on = sel => e.target.closest(sel);
    if (t("pt-chest-open")) {
      const c = openChest(a); if (!c) return;
      const nm = (TIERS[c.tier] || TIERS.common)[0];
      if (PT.confetti) PT.confetti(c.tier === "common" ? 40 : c.tier === "rare" ? 60 : 90);
      a.toast(`${nm} chest: +${c.coins} coins${c.xp ? " and +" + c.xp + " XP" : ""}`);
      OPEN.chest = true; refresh(a); return;
    }
    const tt = on("[data-title2]");
    if (tt && !tt.disabled) { a.settings.titleSel = tt.dataset.title2 || ""; save(); refresh(a); return; }
    if (t("pt-wish-add")) {
      const name = await PT.prompt("What is the reward? (a cheat meal, new gear...)", ""); if (!name || !String(name).trim()) return;
      const price = parseInt(await PT.prompt("How many coins should it cost?", "500"), 10);
      if (!(price >= 10)) { a.toast("Enter a price of at least 10 coins"); return; }
      addWish(a, name, price); OPEN.wish = true; refresh(a); return;
    }
    const wi = on("[data-widea]");
    if (wi) { const x = IDEAS[+wi.dataset.widea]; if (x) { addWish(a, x[0] + " " + x[1], x[2]); OPEN.wish = true; refresh(a); } return; }
    const wc = on("[data-wclaim]");
    if (wc) {
      const w = arr(a, "myRewards").find(x => x && x.id === wc.dataset.wclaim); if (!w || w.claimed) return;
      if (PT.coins(a) < w.price) { a.toast(`You need ${fmt(w.price - PT.coins(a))} more coins`); return; }
      if (!(await PT.confirm(`Claim "${w.name}" for ${fmt(w.price)} coins?`))) return;
      if (PT.coins(a) < w.price) return;
      w.claimed = Date.now(); w.paid = w.price; save();
      if (PT.confetti) PT.confetti(80); a.toast(`Claimed: ${w.name}. Enjoy it, you earned it`, null, null, 5000);
      OPEN.wish = true; refresh(a); return;
    }
    const we = on("[data-wedit]");
    if (we) { const w = arr(a, "myRewards").find(x => x && x.id === we.dataset.wedit); if (!w) return; const v = parseInt(await PT.prompt(`New price in coins for "${w.name}"?`, String(w.price)), 10); if (v >= 10) { w.price = Math.min(100000, v); save(); OPEN.wish = true; refresh(a); } return; }
    const wd = on("[data-wdel]");
    if (wd) { const l = arr(a, "myRewards"), w = l.find(x => x && x.id === wd.dataset.wdel); if (!w) return; if (!(await PT.confirm(`Remove "${w.name}"?`))) return; a.settings.myRewards = l.filter(x => x !== w); save(); OPEN.wish = true; refresh(a); return; }
    const wa = on("[data-wagain]");
    if (wa) { const w = arr(a, "myRewards").find(x => x && x.id === wa.dataset.wagain); if (w) { addWish(a, w.name, w.price); OPEN.wish = true; refresh(a); } }
  });

  /* ============================================================== once, after the update: what the new coin sources gave */
  PT.rw2 = { income, rollChest, openChest, titleEntries, ready, chestOf };
  const oInit = proto.initExtras;
  proto.initExtras = function () {
    const r = oInit ? oInit.apply(this, arguments) : undefined;
    setTimeout(() => {
      try {
        if (this.settings.rw2Seen) return;
        this.settings.rw2Seen = true; save();
        const o = income(this), n = o.records + o.quests + o.weeks + o.challenges + o.badges;
        if (n > 0 && (this.sessions || []).length) setTimeout(() => { try { this.toast(`Rewards 2.0: +${fmt(n)} bonus coins for your records, quests, goal weeks and badges`, "Open", () => { this._progTab = "rewards"; this.showView("progress"); }, 7000); } catch (e) { } }, 3200);
      } catch (e) { console.error("PulseTrack rewards 2 intro", e); }
    }, 0);
    return r;
  };

  /* ============================================================== styles */
  const css = document.createElement("style"); css.id = "pt-v277-css";
  css.textContent = `
    .pt-pill { display: inline-flex; align-items: center; gap: .2rem; padding: .2rem .55rem; border-radius: 999px; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); font-size: .72rem; font-weight: 800; color: rgb(var(--z300)); }
    .pt-chest { display: flex; align-items: center; gap: .75rem; width: 100%; padding: .7rem .85rem; border-radius: .95rem; text-align: left; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); --tc: rgb(var(--a500)); }
    .pt-chest > div { display: flex; flex-direction: column; gap: .1rem; }
    .pt-chest b { font-size: .85rem; font-weight: 900; }
    .pt-chest span:not(.pt-chest-i) { font-size: .72rem; color: rgb(var(--z300)); }
    .pt-chest small { font-size: .66rem; color: rgb(var(--z500)); }
    .pt-chest-i { font-size: 1.9rem; line-height: 1; flex: 0 0 auto; }
    .pt-chest.ready { border-color: rgb(251 191 36 / .7); background: linear-gradient(120deg, rgb(251 191 36 / .16), rgb(var(--z950))); animation: pt-chest-glow 2.2s ease-in-out infinite; }
    .pt-chest.ready .pt-chest-i { animation: pt-chest-wiggle 2.2s ease-in-out infinite; }
    .pt-chest.open { border-color: var(--tc); background: linear-gradient(120deg, color-mix(in srgb, var(--tc) 22%, transparent), rgb(var(--z950))); }
    .pt-chest.locked { opacity: .85; }
    .pt-chest.locked .pt-chest-i { filter: grayscale(1); opacity: .6; }
    @keyframes pt-chest-glow { 0%, 100% { box-shadow: 0 0 0 0 rgb(251 191 36 / 0); } 50% { box-shadow: 0 0 18px 0 rgb(251 191 36 / .35); } }
    @keyframes pt-chest-wiggle { 0%, 70%, 100% { transform: rotate(0); } 76% { transform: rotate(-9deg); } 84% { transform: rotate(8deg); } 92% { transform: rotate(-5deg); } }
    @media (prefers-reduced-motion: reduce) { .pt-chest.ready, .pt-chest.ready .pt-chest-i { animation: none; } }
    .pt-cstrip { display: flex; gap: .3rem; }
    .pt-cd { flex: 1; display: flex; flex-direction: column; align-items: center; gap: .15rem; min-width: 0; }
    .pt-cd i { width: 100%; height: 1.35rem; border-radius: .4rem; background: rgb(var(--z800)); font-style: normal; font-size: .6rem; font-weight: 900; line-height: 1.35rem; text-align: center; color: #09090b; }
    .pt-cd i.on { background: #a1a1aa; } .pt-cd i.on.rare { background: #38bdf8; } .pt-cd i.on.epic { background: #c084fc; } .pt-cd i.on.legendary { background: #fbbf24; }
    .pt-cd em { font-style: normal; font-size: .55rem; font-weight: 700; color: rgb(var(--z500)); }
    .pt-nxs { display: flex; flex-direction: column; gap: .45rem; }
    .pt-nx { display: flex; align-items: center; gap: .55rem; }
    .pt-nx-i { flex: 0 0 auto; width: 1.7rem; height: 1.7rem; display: inline-flex; align-items: center; justify-content: center; border-radius: .55rem; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); font-size: .9rem; }
    .pt-nx .pt-bar { height: .3rem; margin-top: .2rem; }
    .pt-how > summary { cursor: pointer; font-size: .7rem; font-weight: 800; color: rgb(var(--a400)); list-style: none; }
    .pt-how > summary::-webkit-details-marker { display: none; }
    .pt-howg { display: grid; grid-template-columns: 1fr auto; gap: .2rem .75rem; margin-top: .45rem; font-size: .7rem; color: rgb(var(--z300)); }
    .pt-howg b { text-align: right; }
    .pt-sw.wide { width: 2.6rem; height: 1.35rem; border-radius: .45rem; }
    .pt-schips.wrap { flex-wrap: wrap; overflow: visible; }
    .pt-link { background: none; border: 0; padding: 0 0 0 .25rem; color: rgb(var(--a400)); font-size: .68rem; font-weight: 800; text-decoration: underline; }
    .pt-gift { font-size: .75rem; }
    .pt-b[disabled] { opacity: .45; }
    .pt-hub .pt-b { padding: .5rem .85rem; border-radius: .65rem; font-size: .75rem; font-weight: 700; background: rgb(var(--z800)); color: rgb(var(--z100)); align-self: flex-start; }
    .pt-hub .pt-b.go { background: rgb(var(--a600)); color: #fff; }
  `;
  document.head.appendChild(css);
})();
