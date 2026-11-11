/* =====================================================================
 * PulseTrack 2.90.0: a 5 day weekly goal, dumbbells, loot chests, a bigger shop and group rewards.
 *
 *  - Weekly goal: everybody moves to 5 days a week once (from this week on; past weeks keep the goal they had, so no streak breaks).
 *    The two goal settings (Settings → Weekly Goal for the streak, Progress → Overview for rewards) now always move together, and both
 *    remember the goal per week (settings.weeklyGoalLog, like weekGoalLog), so changing it later never rewrites the past either.
 *  - Coins are now dumbbells (module 098 holds the maths: everyone restarts at 0, the old sources pay half). This module adds the big
 *    prizes on top: LOOT CHESTS.
 *  - Loot chests are earned (worked out from your data, only for things that happen after the switch) and opened by hand:
 *      Common     each week you hit your goal
 *      Rare       every 10 new records · a goal streak of 4 or 8 weeks · the group trains 4 days a head in a week
 *      Epic       beating the weekly boss · a goal streak of 12 or 26 weeks · everybody in the group hits their goal in a week
 *      Legendary  a goal streak of 52 weeks · the group beats 3 bosses in a row
 *    A chest holds dumbbells, a streak shield, or a shop item you do not own (bigger chests, better items; a legendary chest holds one
 *    of the legendary items). The prize is fixed by the chest (it cannot be re-rolled). settings.loot = { id: { tier, k, v, ts } }.
 *    Items won are kept in settings.shopGifts so they never count as spent.
 *  - The shop gets boss battle weapons (module 107 shows them when you hit) and higher-end frames, banners, titles and colors.
 *  - Group rewards: a card in Progress → Social → Group shows this week's group goals and what they pay.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined" || !PT.rewards || !PT.weeksOf || !PT.goalFor || !PT.SHOP || !PT.shopHooks) return;
  const proto = ApplicationUI.prototype;
  const A = () => window.app;
  const $ = id => document.getElementById(id);
  const esc = s => PT.esc(s);
  const DAY = 86400000, HOUR = 3600000;
  const save = a => { try { WorkoutStorage.saveSettings((a || A()).settings); } catch (e) { } };
  const arr = (a, k) => (Array.isArray(a.settings[k]) ? a.settings[k] : []);
  const obj = (a, k) => (a.settings[k] && typeof a.settings[k] === "object" && !Array.isArray(a.settings[k]) ? a.settings[k] : (a.settings[k] = {}));
  const fmt = v => Math.round(v).toLocaleString();
  const num = v => { const n = parseFloat(v); return isFinite(n) ? n : 0; };
  const mondayOf = t => { const d = new Date(t); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d.getTime(); };
  const nextMon = t => mondayOf(t + 7 * DAY + 12 * HOUR);
  const dsOf = t => PT.ds(new Date(t));
  const bar = p => `<div class="pt-bar"><span style="width:${Math.round(Math.max(0, Math.min(1, p)) * 100)}%"></span></div>`;
  const DEFAULT_GOAL = 5;

  /* ============================================================== the weekly goal */
  const weekStartOf = t => { try { return PT.weekStart ? PT.weekStart(new Date(t)).getTime() : mondayOf(t); } catch (e) { return mondayOf(t); } };
  /** the streak goal that applied in the week that starts on k ("YYYY-MM-DD") */
  PT.weeklyGoalAt = (a, k) => {
    const st = a.settings, log = Array.isArray(st.weeklyGoalLog) ? st.weeklyGoalLog : [], cur = Math.max(1, Math.min(7, parseInt(st.weeklyGoal, 10) || 3));
    if (!log.length) return cur;
    const d = PT.fromDs ? PT.fromDs(k) : new Date(k), t = (d && !isNaN(d) ? d.getTime() : Date.now()) + 3 * DAY;   // mid-week, so a Sunday or Monday start both land right
    let g = null; log.forEach(e => { if (e.t <= t) g = e.g; });
    return Math.max(1, Math.min(7, g == null ? log[0].g : g));
  };
  function setStreakGoal(a, g) {
    g = Math.max(1, Math.min(7, parseInt(g, 10) || DEFAULT_GOAL));
    const st = a.settings, log = Array.isArray(st.weeklyGoalLog) ? st.weeklyGoalLog : [];
    if (!log.length) log.push({ t: 0, g: Math.max(1, Math.min(7, parseInt(st.weeklyGoal, 10) || 3)) });
    const now = weekStartOf(Date.now()), i = log.findIndex(e => e.t === now);
    if (i >= 0) log[i].g = g; else log.push({ t: now, g });
    st.weeklyGoalLog = log.sort((x, y) => x.t - y.t).slice(-60); st.weeklyGoal = g;
  }
  /* one goal: whichever control you use, both move */
  const oSet = PT.setWeekGoal;
  let inSet = false;
  PT.setWeekGoal = function (g, appArg) {
    const a = appArg || A(); oSet.call(this, g, a);
    if (!inSet) { try { setStreakGoal(a, g); save(a); } catch (e) { } }
  };
  PT.setGoalBoth = (a, g) => { inSet = true; try { setStreakGoal(a, g); PT.setWeekGoal(g, a); } finally { inSet = false; } save(a); };
  document.addEventListener("change", e => {
    if (!e.target || e.target.id !== "setting-weekly-goal") return; const a = A(); if (!a) return;
    PT.setGoalBoth(a, e.target.value);
    try { a.renderStreak(); } catch (x) { }
  });
  /** once: everybody to 5 days, from this week on */
  function goal5(a) {
    if (a.settings.goal5) return false;
    a.settings.goal5 = Date.now(); PT.setGoalBoth(a, DEFAULT_GOAL); return true;
  }

  /* ============================================================== the shop: weapons and the high end */
  const add = list => list.forEach(x => { if (!PT.SHOP.some(y => y.id === x.id)) PT.SHOP.push(x); });
  add([
    { id: "w_hammer", kind: "weapon", name: "War hammer", icon: "🔨", price: 150 }, { id: "w_axe", kind: "weapon", name: "Battle axe", icon: "🪓", price: 250 },
    { id: "w_sword", kind: "weapon", name: "Blade", icon: "🗡️", price: 300 }, { id: "w_trident", kind: "weapon", name: "Trident", icon: "🔱", price: 450 },
    { id: "w_bolt", kind: "weapon", name: "Lightning", icon: "⚡", price: 700 }, { id: "w_flame", kind: "weapon", name: "Flame fist", icon: "🔥", price: 900 },
    { id: "w_comet", kind: "weapon", name: "Comet", icon: "☄️", price: 2000 },
    { id: "c_volt", kind: "color", name: "Volt", hex: "#d4ff00", price: 200 }, { id: "c_peach", kind: "color", name: "Peach", hex: "#ff8a65", price: 200 },
    { id: "f_aurora", kind: "frame", name: "Aurora", c: ["#22d3ee", "#a78bfa", "#34d399"], price: 800 }, { id: "f_obsidian", kind: "frame", name: "Obsidian", c: ["#111827", "#6b7280", "#f59e0b"], price: 1200 },
    { id: "f_prism", kind: "frame", name: "Prismatic", c: ["#f43f5e", "#f59e0b", "#22c55e", "#3b82f6", "#a855f7"], price: 2000 },
    { id: "b_aurora", kind: "banner", name: "Aurora", c: ["#22d3ee", "#7c3aed"], price: 600 }, { id: "b_blood", kind: "banner", name: "Blood moon", c: ["#7f1d1d", "#ef4444"], price: 900 },
    { id: "t_breaker", kind: "title", name: "Boss Breaker", text: "Boss Breaker", price: 300 }, { id: "t_carry", kind: "title", name: "Group Carry", text: "Group Carry", price: 400 },
    { id: "t_baron", kind: "title", name: "Dumbbell Baron", text: "Dumbbell Baron", price: 1000 }, { id: "t_unbreak", kind: "title", name: "Unbreakable", text: "Unbreakable", price: 1500 },
    { id: "t_iron", kind: "title", name: "Legend of Iron", text: "Legend of Iron", price: 2500 }
  ]);
  const LEGEND = ["w_comet", "f_prism", "t_iron", "t_unbreak"];
  if (!PT.shopKinds.some(k => k[0] === "weapon")) PT.shopKinds.push(["weapon", "Boss battle weapons"]);
  PT.shopHooks.weapon = {
    equip: (a, it) => { a.settings.weapon = it.id; save(a); },
    equipped: (a, it) => a.settings.weapon === it.id,
    preview: it => `<span class="text-xl leading-none">${it.icon}</span>`
  };
  /** the weapon you hit the boss with in the battle */
  PT.weaponOf = a => { const w = PT.SHOP.find(x => x.id === (a && a.settings.weapon) && x.kind === "weapon"); return w && arr(a, "shopOwned").includes(w.id) ? w : { id: "", name: "Fists", icon: "👊" }; };

  /* ============================================================== loot chests: what you have earned */
  const TIER = { common: ["Common", "#a1a1aa", 1], rare: ["Rare", "#38bdf8", 2], epic: ["Epic", "#c084fc", 3], legendary: ["Legendary", "#fbbf24", 4] };
  const STREAK_MS = { 4: "rare", 8: "rare", 12: "epic", 26: "epic", 52: "legendary" };
  const since = a => (a.settings.dbBase && a.settings.dbBase.t) || Date.now();
  const short = t => (PT.fmtDate ? PT.fmtDate(dsOf(t), { month: "short", day: "numeric" }) : dsOf(t));
  let memo = null;
  function earned(a) {
    const W = PT.weeksOf(a), from = since(a), fromWk = mondayOf(from), now = mondayOf(Date.now());
    const key = [from, (a.sessions || []).length, (a.sessions || []).reduce((m, s) => Math.max(m, s.upd || s.ts || 0), 0), JSON.stringify(a.settings.weekGoalLog || []),
      Object.keys(a.settings.bossWins || {}).length, Object.values(a.settings.fam2 || {}).map(x => x && x.t).join(","), a.settings.myName || "", PT.ds()].join("|");
    if (memo && memo.key === key) return memo.v;
    const out = [];
    const push = (id, tier, why, t) => out.push({ id, tier, why, t });
    // your goal, week by week, and the streak milestones
    const first = W.size ? Math.min(...W.keys()) : now; let run = 0;
    for (let t = first, g = 0; t <= now && g < 1200; t = nextMon(t), g++) {
      const o = W.get(t), hit = !!(o && o.days.size >= PT.goalFor(a, t));
      if (hit) {
        run++;
        if (t >= fromWk) push("g:" + dsOf(t), "common", `You hit your goal (week of ${short(t)})`, t);
        if (STREAK_MS[run] && t >= fromWk) push(`s${run}:` + dsOf(t), STREAK_MS[run], `${run} weeks in a row on goal`, t);
      } else if (t !== now) run = 0;
    }
    // records
    let prs = 0; (a.sessions || []).forEach(s => { if ((s.ts || 0) >= from) prs += (s.prs || []).length; });
    for (let k = 1; k <= Math.floor(prs / 10); k++) push("r" + k, "rare", `${k * 10} new records since the switch`, from);
    // the boss
    Object.entries(a.settings.bossWins || {}).forEach(([wid, w]) => { const wt = PT.fromDs ? PT.fromDs(wid).getTime() : 0; if (w && num(w.ts) >= from && wt >= fromWk) push("b:" + wid, "epic", `Beat the ${w.b || "boss"} with the group`, num(w.ts)); });
    // the group
    group(a).weeks.forEach(w => {
      if (w.mon < fromWk || !w.meIn || w.n < 2) return;
      if (w.allHit) push("G:" + w.wid, "epic", `Everybody hit their goal (week of ${short(w.mon)})`, w.mon);
      if (w.days >= w.target) push("GT:" + w.wid, "rare", `Group grind: ${w.days} days together (week of ${short(w.mon)})`, w.mon);
    });
    bossStreaks(a, fromWk).forEach(x => push(`GB${x.n}:` + x.wid, "legendary", `The group beat ${x.n} bosses in a row`, x.t));
    const v = out; memo = { key, v }; return v;
  }
  /** the group, week by week (this one and the 8 before): who has a number, did everybody hit, how many days together */
  function group(a) {
    const K = PT.famKit; if (!K) return { weeks: [], ppl: [] };
    const ppl = Object.values(K.people(a)), weeks = [];
    for (let i = 0; i <= 8; i++) {
      const mon = K.wkMon(i), wid = K.dsOf(mon), rows = ppl.map(p => ({ p, w: p.wk && p.wk[wid] })).filter(x => x.w);
      const n = rows.length, days = rows.reduce((s, x) => s + num(x.w.d), 0), hit = rows.filter(x => num(x.w.d) >= Math.max(1, Math.min(7, num(x.w.g) || 3))).length;
      const me = rows.find(x => x.p.me);
      weeks.push({ i, mon, wid, n, days, hit, allHit: n >= 2 && hit === n, target: 4 * Math.max(2, n), meIn: !!(me && num(me.w.d) > 0), rows });
    }
    return { weeks, ppl };
  }
  function bossStreaks(a, fromWk) {
    if (!PT.boss || !PT.boss.state) return [];
    let st; try { st = PT.boss.state(); } catch (e) { return []; }
    const seq = (st.past || []).slice().reverse().concat([{ wid: st.wid, won: st.won }]), out = []; let run = 0;   // oldest first
    seq.forEach(w => { run = w.won ? run + 1 : 0; const t = PT.fromDs ? PT.fromDs(w.wid).getTime() : 0; if (run && run % 3 === 0 && t >= fromWk) out.push({ n: run, wid: w.wid, t }); });
    return out;
  }
  const loot = a => obj(a, "loot");
  const waiting = a => { const L = loot(a); return earned(a).filter(c => !L[c.id]).sort((x, y) => TIER[y.tier][2] - TIER[x.tier][2] || x.t - y.t); };
  PT.lootDb = a => Object.values(loot(a || A())).reduce((n, p) => n + (p && p.k === "db" ? num(p.v) : 0) + (p && p.k === "shield" ? num(p.db) : 0), 0);

  /* ============================================================== opening one */
  const hash = str => { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const rng = seed => () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const DB = { common: [20, 40], rare: [60, 100], epic: [150, 250], legendary: [500, 500] };
  const CAP = { common: 200, rare: 350, epic: 800, legendary: 99999 };
  /** what is in a chest: fixed by the chest and you, so opening it again (or on another day) gives the same */
  function roll(a, c) {
    const r = rng(hash("loot|" + c.id + "|" + (a.settings.myName || ""))), x = r(), own = arr(a, "shopOwned"), held = num(a.settings.shields);
    const dbv = () => { const [lo, hi] = DB[c.tier]; return Math.round((lo + r() * (hi - lo)) / 5) * 5; };
    const item = cap => { const l = PT.SHOP.filter(i => !own.includes(i.id) && i.price <= cap && !LEGEND.includes(i.id)); return l.length ? l[Math.floor(r() * l.length)] : null; };
    if (c.tier === "legendary") { const l = LEGEND.filter(id => !own.includes(id)); return l.length ? { k: "item", v: l[Math.floor(r() * l.length)] } : { k: "db", v: 500 }; }
    let p;
    if (c.tier === "common") p = x < 0.6 ? { k: "db", v: dbv() } : x < 0.85 ? (held < 3 ? { k: "shield", v: 1, db: 0 } : { k: "db", v: 30 }) : null;
    else if (c.tier === "rare") p = x < 0.5 ? { k: "db", v: dbv() } : x < 0.9 ? null : (held < 3 ? { k: "shield", v: 1, db: 30 } : { k: "db", v: 80 });
    else p = x < 0.4 ? { k: "db", v: dbv() } : null;
    if (!p) { const it = item(CAP[c.tier]); p = it ? { k: "item", v: it.id } : { k: "db", v: dbv() }; }
    return p;
  }
  function open(a, id) {
    const c = earned(a).find(x => x.id === id), L = loot(a); if (!c || L[id]) return null;
    const p = Object.assign({ tier: c.tier, ts: Date.now() }, roll(a, c));
    if (p.k === "item") {
      const own = arr(a, "shopOwned"); if (!own.includes(p.v)) a.settings.shopOwned = own.concat(p.v);
      const g = arr(a, "shopGifts"); if (!g.includes(p.v)) a.settings.shopGifts = g.concat(p.v);
    } else if (p.k === "shield") a.settings.shields = Math.min(3, num(a.settings.shields) + 1);
    L[id] = p; save(a); return Object.assign({ why: c.why }, p);
  }
  const prizeText = p => {
    if (p.k === "db") return { big: `<span style="color:#fbbf24">${PT.DBI}</span>`, t: `${fmt(p.v)} dumbbells` };
    if (p.k === "shield") return { big: "🛡", t: "A streak shield" + (p.db ? ` and ${p.db} dumbbells` : "") };
    const it = PT.SHOP.find(x => x.id === p.v) || { name: p.v, kind: "" };
    const kind = { color: "accent color", frame: "profile frame", fx: "confetti style", title: "title", banner: "Home banner", weapon: "boss weapon" }[it.kind] || "item";
    return { big: it.icon || (it.kind === "title" ? "🏷" : it.kind === "frame" ? "🖼" : it.kind === "color" ? "🎨" : it.kind === "banner" ? "🏳️" : "🎁"), t: `${it.text || it.name} (${kind})`, it };
  };
  function showOpen(a, id) {
    const c = earned(a).find(x => x.id === id); if (!c) return;
    const t = TIER[c.tier], kit = PT.kit, el = kit.sheet("pt-lootsh", 80);
    const card = kit.openSheet(el, `${kit.head(`${t[0]} chest`, c.why)}
      <div class="pt-lootstage" style="--tc:${t[1]}"><div class="pt-lootbox" id="pt-lootbox">🎁</div><div class="pt-lootprize" id="pt-lootprize" hidden></div></div>
      <button type="button" class="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl tap-active text-sm" id="pt-loot-go">Open it</button>`);
    card.addEventListener("click", e => {
      const go = e.target.closest("#pt-loot-go"); if (!go) return;
      if (go.dataset.done) { kit.closeSheet(el); a.renderProgressView(); return; }
      const p = open(a, id); if (!p) { kit.closeSheet(el); return; }
      const box = $("pt-lootbox"), pr = $("pt-lootprize"), x = prizeText(p);
      go.disabled = true; box.classList.add("shake");
      setTimeout(() => {
        box.classList.remove("shake"); box.classList.add("gone");
        pr.hidden = false; pr.innerHTML = `<span class="pt-lootbig">${x.big}</span><b>${esc(x.t)}</b><small>${p.k === "item" ? "It is yours. Find it in the shop to use it." : p.k === "shield" ? "Saved for a day you miss." : "Added to your dumbbells."}</small>`;
        go.disabled = false; go.dataset.done = "1"; go.textContent = "Nice";
        try { if (PT.confetti) PT.confetti(c.tier === "common" ? 24 : c.tier === "rare" ? 40 : 70); } catch (er) { }
        try { navigator.vibrate && navigator.vibrate(c.tier === "legendary" ? [40, 60, 40] : 30); } catch (er) { }
      }, matchMedia("(prefers-reduced-motion: reduce)").matches ? 50 : 750);
    });
  }

  /* ============================================================== the cards */
  const OPEN = { loot: false, grp: false };
  const how = [["Hit your weekly goal", "common"], ["10 new records", "rare"], ["Goal streak of 4 or 8 weeks", "rare"], ["Group trains 4 days a head in a week", "rare"],
    ["Beat the weekly boss", "epic"], ["Goal streak of 12 or 26 weeks", "epic"], ["Everybody in the group hits their goal", "epic"], ["Goal streak of 52 weeks", "legendary"], ["The group beats 3 bosses in a row", "legendary"]];
  const tag = tier => `<span class="pt-ltag" style="--tc:${TIER[tier][1]}">${TIER[tier][0]}</span>`;
  function lootHtml(a) {
    const w = waiting(a), L = loot(a), done = Object.entries(L).sort((x, y) => num(y[1].ts) - num(x[1].ts)).slice(0, 5);
    const rows = w.length ? w.slice(0, 12).map(c => `<div class="pt-lrow" style="--tc:${TIER[c.tier][1]}"><span class="pt-lico">🎁</span><div class="min-w-0 flex-1"><span class="block text-xs font-black text-white">${TIER[c.tier][0]} chest</span><span class="block text-[11px] text-zinc-400 leading-snug">${esc(c.why)}</span></div><button type="button" class="pt-b go" data-lopen="${esc(c.id)}">Open</button></div>`).join("")
      + (w.length > 12 ? `<p class="text-[11px] text-zinc-400">and ${w.length - 12} more</p>` : "")
      : `<p class="text-[11px] text-zinc-400">No chests waiting. Hit your goal this week for the next one.</p>`;
    const hist = done.length ? `<div class="pt-lhist"><span class="pt-f2h">Last opened</span>${done.map(([, p]) => `<span class="text-[11px] text-zinc-300">${tag(p.tier)} ${esc(prizeText(p).t)}</span>`).join("")}</div>` : "";
    return `<div class="space-y-2">${rows}</div>
      <details class="pt-how"><summary>How to earn chests</summary><div class="pt-lhow">${how.map(([t, tier]) => `<span>${esc(t)}</span>${tag(tier)}`).join("")}</div>
        <p class="text-[11px] text-zinc-400 leading-snug mt-1">A chest holds dumbbells, a streak shield or a shop item you do not own yet. Bigger chests hold more; a legendary chest holds one of the legendary items. Only things that happened after the switch to dumbbells count.</p></details>${hist}`;
  }
  function grpHtml(a) {
    const g = group(a), w = g.weeks[0], others = g.ppl.filter(p => !p.me).length;
    if (!others) return `<p class="text-[11px] text-zinc-400 leading-snug">Rewards the whole group unlocks together. Add people to your group board first (Progress → Social → Group board), then everybody who trains gets the chest.</p>`;
    const n = Math.max(w.n, 1), wins = PT.boss && PT.boss.state ? (() => { try { const s = PT.boss.state(); let r = s.won ? 1 : 0; for (const p of s.past || []) { if (p.won) r++; else break; } return r; } catch (e) { return 0; } })() : 0;
    const row = (t, s, p, tier) => `<div class="space-y-1"><div class="flex items-center justify-between gap-2"><span class="text-xs font-bold text-white">${esc(t)}</span>${tag(tier)}</div>${bar(p)}<span class="block text-[11px] text-zinc-400">${esc(s)}</span></div>`;
    return `${row("Everybody hits their goal", `${w.hit} of ${n} on goal this week`, w.n ? w.hit / w.n : 0, "epic")}
      ${row("Group grind", `${w.days} of ${w.target} days together (4 a head)`, w.days / w.target, "rare")}
      ${row("3 bosses in a row", `${wins % 3 === 0 && wins ? 3 : wins % 3} of 3 in this run`, (wins % 3 === 0 && wins ? 3 : wins % 3) / 3, "legendary")}
      <p class="text-[10px] text-zinc-500 leading-snug">Everybody who trained that week gets the chest, on their own phone. It counts the updates on your board, so a live group board keeps it up to date.</p>`;
  }
  function draw(a) {
    const root = $("progress-body"); if (!root) return;
    const old = $("pt-pg-rew6"); if (old) old.remove(); ["pt-pg-loot", "pt-pg-grprew"].forEach(id => { const e = $(id); if (e) e.remove(); });
    const w = waiting(a).length;
    const box = document.createElement("div"); box.id = "pt-pg-rew6"; box.className = "space-y-3";
    box.innerHTML = `<details class="pt-pg" id="pt-pg-loot" ${OPEN.loot ? "open" : ""}><summary><span class="text-xs font-bold text-white">🎁 Loot chests${w ? ` · ${w} to open` : ""}</span><span class="pt-chev">›</span></summary><div>${lootHtml(a)}</div></details>
      <details class="pt-pg" id="pt-pg-grprew" ${OPEN.grp ? "open" : ""}><summary><span class="text-xs font-bold text-white">🏅 Group rewards</span><span class="pt-chev">›</span></summary><div class="space-y-3">${grpHtml(a)}</div></details>`;
    root.appendChild(box);
    box.querySelectorAll("details").forEach(d => d.addEventListener("toggle", () => { OPEN[d.id === "pt-pg-loot" ? "loot" : "grp"] = d.open; }));
  }
  const oPV = proto.renderProgressView;
  proto.renderProgressView = function () {
    const r = oPV.apply(this, arguments);
    try { draw(this); } catch (e) { console.error("PulseTrack loot chests", e); }
    try { announce(this); } catch (e) { }
    return r;
  };
  /** a new chest: say so once */
  function announce(a) {
    if (!a.settings.dbBase) return;
    const seen = new Set(arr(a, "lootSeen")), fresh = waiting(a).filter(c => !seen.has(c.id)); if (!fresh.length) return;
    a.settings.lootSeen = Array.from(new Set(arr(a, "lootSeen").concat(fresh.map(c => c.id)))).slice(-400); save(a);
    const best = fresh[0];
    setTimeout(() => { try { a.toast(`🎁 ${TIER[best.tier][0]} chest earned: ${best.why}${fresh.length > 1 ? ` (+${fresh.length - 1} more)` : ""}`, "Open", () => { a._progTab = "rewards"; OPEN.loot = true; a.showView("progress"); }, 6000); } catch (e) { } }, 900);
  }
  const oHome = proto.renderHomeView;
  proto.renderHomeView = function () {
    const r = oHome.apply(this, arguments);
    try { if (!this.__lootHome) { this.__lootHome = true; setTimeout(() => { this.__lootHome = false; try { announce(this); } catch (e) { } }, 1500); } } catch (e) { }
    return r;
  };
  document.addEventListener("click", e => {
    const a = A(); if (!a || !e.target.closest) return;
    const b = e.target.closest("[data-lopen]"); if (b) { OPEN.loot = true; showOpen(a, b.dataset.lopen); }
  });

  /* ============================================================== once, after the update */
  function intro(a) {
    if (a.settings.v290Seen) return; a.settings.v290Seen = Date.now(); save(a);
    if (!(a.sessions || []).length) return;
    const kit = PT.kit; if (!kit) return;
    setTimeout(() => {
      try {
        const el = kit.sheet("pt-v290", 75);
        const card = kit.openSheet(el, `${kit.head("What's new", "PulseTrack 2.90")}
          <div class="space-y-2.5 text-[12px] text-zinc-300 leading-snug">
            <p><b class="text-white">${PT.DBI} Coins are now dumbbells.</b> Everyone starts again at 0 and they are harder to earn (half of before). What you already bought stays yours.</p>
            <p><b class="text-white">🎁 Loot chests.</b> Hit your goal, set records, keep streaks and beat bosses to earn chests with dumbbells, shields and shop items. Progress → Rewards.</p>
            <p><b class="text-white">⚔️ Boss battle.</b> Your workouts give you swings. Time your taps to hit the weekly boss. Progress → Social → Boss fight.</p>
            <p><b class="text-white">📅 Weekly goal: 5 days.</b> Past weeks keep their old goal, so your streak is safe. Change it any time in Settings → Weekly Goal.</p>
            <p><b class="text-white">👥 Family is now Group</b>, with group rewards everybody unlocks together.</p></div>
          <button type="button" class="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl tap-active text-sm" data-v290-ok="1">Let's go</button>`);
        card.addEventListener("click", ev => { if (ev.target.closest("[data-v290-ok]")) kit.closeSheet(el); });
      } catch (e) { console.error("PulseTrack what's new", e); }
    }, 1800);
  }
  const oInit = proto.initExtras;
  proto.initExtras = function () {
    const r = oInit ? oInit.apply(this, arguments) : undefined;
    setTimeout(() => {
      try { if (PT.dbStart) PT.dbStart(this); } catch (e) { }
      try { if (goal5(this)) { try { this.renderStreak(); } catch (e) { } } } catch (e) { console.error("PulseTrack goal 5", e); }
      try { intro(this); } catch (e) { }
    }, 0);
    return r;
  };

  PT.loot = { earned: a => earned(a || A()), waiting: a => waiting(a || A()), open: (id, a) => open(a || A(), id), roll: (c, a) => roll(a || A(), c), group: a => group(a || A()), TIER, LEGEND, reset: () => { memo = null; }, goal5: a => goal5(a || A()), intro: a => intro(a || A()), setStreakGoal: (a, g) => setStreakGoal(a, g) };

  const css = document.createElement("style"); css.id = "pt-v290-loot-css";
  css.textContent = `
    .pt-dbi { display: inline-block; width: 1em; height: 1em; vertical-align: -0.14em; }
    .pt-ltag { display: inline-flex; align-items: center; padding: .1rem .45rem; border-radius: 999px; font-size: .6rem; font-weight: 900; letter-spacing: .02em; color: var(--tc); border: 1px solid color-mix(in srgb, var(--tc) 55%, transparent); white-space: nowrap; }
    .pt-lrow { display: flex; align-items: center; gap: .6rem; padding: .55rem .65rem; border-radius: .8rem; background: rgb(var(--z950)); border: 1px solid color-mix(in srgb, var(--tc) 45%, rgb(var(--z800))); }
    .pt-lico { flex: none; font-size: 1.4rem; filter: drop-shadow(0 0 6px color-mix(in srgb, var(--tc) 70%, transparent)); }
    .pt-lhow { display: grid; grid-template-columns: 1fr auto; gap: .35rem .6rem; align-items: center; font-size: .7rem; color: rgb(var(--z300)); margin-top: .4rem; }
    .pt-lhist { display: flex; flex-direction: column; gap: .25rem; padding-top: .5rem; border-top: 1px solid rgb(var(--z800)); }
    #pt-pg-loot .pt-b, #pt-pg-grprew .pt-b { padding: .45rem .8rem; border-radius: .65rem; font-size: .72rem; font-weight: 800; background: rgb(var(--z800)); color: rgb(var(--z100)); }
    #pt-pg-loot .pt-b.go { background: rgb(var(--a600)); color: #fff; }
    .pt-lootstage { position: relative; height: 11rem; display: flex; align-items: center; justify-content: center; margin: .5rem 0 .9rem; border-radius: 1rem;
      background: radial-gradient(circle at 50% 55%, color-mix(in srgb, var(--tc) 35%, transparent), transparent 65%), rgb(var(--z950)); border: 1px solid rgb(var(--z800)); overflow: hidden; }
    .pt-lootbox { font-size: 5rem; line-height: 1; transition: transform .35s, opacity .35s; }
    .pt-lootbox.shake { animation: pt-lshake .75s ease-in-out; }
    .pt-lootbox.gone { transform: scale(1.6); opacity: 0; position: absolute; }
    .pt-lootprize { display: flex; flex-direction: column; align-items: center; gap: .3rem; text-align: center; padding: 0 1rem; animation: pt-lpop .45s cubic-bezier(.2,1.6,.4,1); }
    .pt-lootprize b { font-size: .95rem; font-weight: 900; color: rgb(var(--z100)); }
    .pt-lootprize small { font-size: .7rem; color: rgb(var(--z400)); }
    .pt-lootbig { font-size: 3.4rem; line-height: 1; filter: drop-shadow(0 0 14px var(--tc)); }
    @keyframes pt-lshake { 0%,100% { transform: rotate(0) } 15% { transform: rotate(-12deg) scale(1.05) } 30% { transform: rotate(10deg) } 45% { transform: rotate(-8deg) scale(1.1) } 60% { transform: rotate(6deg) } 75% { transform: rotate(-4deg) scale(1.15) } }
    @keyframes pt-lpop { from { transform: scale(.4); opacity: 0 } to { transform: scale(1); opacity: 1 } }
    @media (prefers-reduced-motion: reduce) { .pt-lootbox.shake, .pt-lootprize { animation: none; } }
  `;
  document.head.appendChild(css);
})();
