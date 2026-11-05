
/* =====================================================================
 * PulseTrack 2.32.0 (B): things to keep chasing.
 *  - Challenges (a few weeks long, with a goal and a trophy), 12-week Seasons with a reward track,
 *    a daily "I'm in today" check-in streak, and a coin shop (colors, profile frames, confetti styles).
 *  All of it is worked out from your saved data.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined" || !PT.rewards || !PT.badgeKit) return;
  const proto = ApplicationUI.prototype;
  const A = () => window.app;
  const $ = id => document.getElementById(id);
  const esc = s => PT.esc(s);
  const DAY = 86400000, LB = 2.2046226;
  const save = () => { try { WorkoutStorage.saveSettings(A().settings); } catch (e) { } };
  const mondayOf = t => { const d = new Date(t); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d.getTime(); };
  const unitKg = () => A().unit() === "kg";
  const toLb = (v, from) => (from === "kg" ? v * LB : v);
  const fmt = v => Math.round(v).toLocaleString();
  const V = lb => fmt(unitKg() ? lb / LB : lb) + (unitKg() ? " kg" : " lb");
  const S = a => a.sessions || [];
  const sessTime = s => s.ts || (PT.fromDs && PT.fromDs(s.date) ? PT.fromDs(s.date).getTime() : 0);
  const card = "bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5 space-y-2";
  const bar = p => `<div class="pt-bar"><span style="width:${Math.round(Math.max(0, Math.min(1, p)) * 100)}%"></span></div>`;
  const K = () => PT.badgeKit;
  const dsOf = t => PT.ds(new Date(t));
  const arr = (a, k) => (Array.isArray(a.settings[k]) ? a.settings[k] : []);

  /* ============================================================== seasons */
  const EPOCH = new Date(2026, 0, 5).getTime(), SEASON_DAYS = 84, TIER_XP = 400;
  const SEASON_NAMES = ["Winter Forge", "Spring Surge", "Summer Heat", "Autumn Grind"];
  const SEASON_COL = [["#bae6fd", "#3b82f6"], ["#bbf7d0", "#16a34a"], ["#fde68a", "#ea580c"], ["#fdba74", "#b45309"]];
  const SEASON_COINS = { 1: 50, 3: 100, 4: 150, 5: 200, 7: 250, 8: 400 };
  const TIER_REWARD = { 1: "🪙 50", 2: "🖼 Frame", 3: "🪙 100", 4: "🪙 150", 5: "🪙 200", 6: "🏷 Title", 7: "🪙 250", 8: "🏆 Trophy" };
  const seasonOf = t => Math.floor(Math.round((mondayOf(t) - EPOCH) / (7 * DAY)) / 12);
  const seasonStart = i => { const d = new Date(EPOCH); d.setDate(d.getDate() + i * SEASON_DAYS); return d.getTime(); };
  const seasonName = i => SEASON_NAMES[((i % 4) + 4) % 4];
  const tierOf = xp => Math.min(8, Math.floor(xp / TIER_XP));
  const coinsAt = tier => { let c = 0; for (let t = 1; t <= tier; t++) c += SEASON_COINS[t] || 0; return c; };
  let sMemo = null;
  /** xp per season index, worked out from workouts, goal weeks, quests and challenges */
  function seasons(a) {
    const key = S(a).length + "|" + S(a).reduce((m, s) => Math.max(m, s.upd || s.ts || 0), 0) + "|" + Object.keys(a.settings.questDone || {}).length + "|" + arr(a, "challengesDone").length + "|" + PT.ds();
    if (sMemo && sMemo.key === key) return sMemo.v;
    const xp = {}, add = (i, v) => { xp[i] = (xp[i] || 0) + v; };
    S(a).forEach(s => add(seasonOf(sessTime(s)), PT.sessionXpOf(s)));
    PT.weeksOf(a).forEach((o, t) => { if (o.days.size >= PT.goalFor(a, t)) add(seasonOf(t), 50); });
    const qd = a.settings.questDone || {}; Object.keys(qd).forEach(k => add(seasonOf(parseInt(k, 10) || 0), 100 * (qd[k] || []).length));
    arr(a, "challengesDone").forEach(c => add(seasonOf(c.ts || 0), 300));
    const cur = seasonOf(Date.now()); if (!(cur in xp)) xp[cur] = 0;
    const list = Object.keys(xp).map(Number).sort((x, y) => x - y).map(i => ({ i, name: seasonName(i), n: i + 1, xp: xp[i], tier: tierOf(xp[i]), cur: i === cur, start: seasonStart(i), end: seasonStart(i + 1) }));
    const v = { list, cur: list.find(x => x.cur), coins: list.reduce((n, x) => n + coinsAt(x.tier), 0), trophies: list.filter(x => x.tier >= 8) };
    sMemo = { key, v }; return v;
  }
  PT.seasons = seasons;

  /* ============================================================== daily check-in */
  const activeDays = a => { const set = new Set(arr(a, "checkins")); S(a).forEach(s => set.add(s.date)); return set; };
  function dayStreak(a) { const set = activeDays(a); const d = new Date(); d.setHours(0, 0, 0, 0); let n = 0; if (!set.has(PT.ds(d))) d.setDate(d.getDate() - 1); while (set.has(PT.ds(d))) { n++; d.setDate(d.getDate() - 1); } return n; }
  function dayStats(a) {
    const days = [...activeDays(a)].sort(), when = {}; let run = 0, best = 0, prev = null;
    days.forEach(ds => { const t = PT.fromDs(ds); if (!t) return; run = prev && Math.round((t.getTime() - prev) / DAY) === 1 ? run + 1 : 1; prev = t.getTime(); if (run > best) best = run; [7, 30, 100, 365].forEach(m => { if (run >= m && !when["showup" + m]) when["showup" + m] = ds; }); });
    return { best, when };
  }
  PT.dayStreak = dayStreak;
  const checkedToday = a => arr(a, "checkins").includes(PT.ds());

  /* ============================================================== challenges */
  const niceRound = (v, step) => Math.max(step, Math.round(v / step) * step);
  function presets(a) {
    const now = Date.now(), ss = S(a).filter(s => sessTime(s) >= now - 90 * DAY);
    const vol = ss.reduce((n, s) => n + toLb(s.vol || 0, s.unit), 0) / 3, sets = ss.reduce((n, s) => n + (s.sets || 0), 0) / 3;
    const gv = niceRound(Math.max(20000, vol * 1.15), 5000), gs = niceRound(Math.max(90, sets * 1.15), 10);
    return [
      { id: "w30", icon: "🗓", title: "30 in 60", desc: "Finish 30 workouts in 60 days", stat: "workouts", goal: 30, days: 60 },
      { id: "vol", icon: "🚛", title: "Heavy Month", desc: `Lift ${V(gv)} in 30 days`, stat: "volume", goal: gv, days: 30 },
      { id: "pr", icon: "🏅", title: "PR Hunt", desc: "Set 4 personal records in 30 days", stat: "prs", goal: 4, days: 30 },
      { id: "sets", icon: "🔥", title: "Set Stacker", desc: `Do ${gs} working sets in 30 days`, stat: "sets", goal: gs, days: 30 },
      { id: "show", icon: "📅", title: "Show Up", desc: "Train on 16 different days in 30 days", stat: "days", goal: 16, days: 30 }
    ];
  }
  function chalStat(a, c) {
    let w = 0, v = 0, p = 0, st = 0; const days = new Set();
    S(a).forEach(s => { const t = sessTime(s); if (t < c.start || t > c.end) return; w++; v += toLb(s.vol || 0, s.unit); p += (s.prs || []).length; st += s.sets || 0; days.add(s.date); });
    return { workouts: w, volume: v, prs: p, sets: st, days: days.size }[c.stat] || 0;
  }
  PT.challengeProgress = a => { const c = (a || A()).settings.challenge; return c ? { c, cur: chalStat(a || A(), c), goal: c.goal } : null; };
  function checkChallenge(a) {
    const c = a.settings.challenge; if (!c || c.done) return null;
    if (chalStat(a, c) < c.goal) return null;
    c.done = true; c.doneTs = Date.now(); const l = arr(a, "challengesDone"); l.push({ id: c.id, title: c.title, icon: c.icon, ts: c.doneTs }); a.settings.challengesDone = l.slice(-60); save(); sMemo = null; return c;
  }
  function chalItem(c) {
    return { custom: true, label: "Challenge complete", name: `${c.title}`, desc: `${c.desc}. +300 XP`, big: `<div style="font-size:96px;line-height:1">${c.icon}</div>`, glow: "rgb(251 191 36 / .6)", a: "#fde68a", b: "#d97706", confetti: true,
      share: { icon: c.icon, kicker: "Challenge complete", title: c.title, sub: c.desc, lines: [["Reward", "+300 XP"]], c: ["#fde68a", "#d97706"] } };
  }

  /* ============================================================== shop */
  const SHOP = [
    { id: "c_neon", kind: "color", name: "Neon Lime", hex: "#c6ff00", price: 120 }, { id: "c_magenta", kind: "color", name: "Hot Magenta", hex: "#ff2fd6", price: 120 },
    { id: "c_ice", kind: "color", name: "Ice", hex: "#7df9ff", price: 120 }, { id: "c_lava", kind: "color", name: "Lava", hex: "#ff5a1f", price: 120 }, { id: "c_royal", kind: "color", name: "Royal", hex: "#6a5cff", price: 120 },
    { id: "f_neon", kind: "frame", name: "Neon", c: ["#c6ff00", "#00e5ff"], price: 200 }, { id: "f_lava", kind: "frame", name: "Lava", c: ["#ffb347", "#ff2d00"], price: 200 },
    { id: "f_ocean", kind: "frame", name: "Ocean", c: ["#00c6ff", "#0072ff"], price: 300 }, { id: "f_galaxy", kind: "frame", name: "Galaxy", c: ["#f472b6", "#8b5cf6", "#22d3ee"], price: 500 },
    { id: "x_gold", kind: "fx", name: "Gold rain", style: "gold", icon: "🪙", price: 150 }, { id: "x_fire", kind: "fx", name: "Fire", style: "fire", icon: "🔥", price: 250 },
    { id: "x_bolt", kind: "fx", name: "Lightning", style: "bolt", icon: "⚡", price: 250 }, { id: "x_stars", kind: "fx", name: "Stars", style: "stars", icon: "⭐", price: 300 }
  ];
  const owned = a => arr(a, "shopOwned");
  const spent = a => owned(a).reduce((n, id) => n + ((SHOP.find(x => x.id === id) || { price: 0 }).price), 0);
  PT.coins = a => { a = a || A(); return Math.max(0, Math.floor(PT.rewards(a).xp / 10) + seasons(a).coins - spent(a)); };
  function equip(a, it) {
    const st = a.settings;
    if (it.kind === "color") { if (st.accent !== "custom") st.accentPrev = st.accent || "emerald"; st.accent = "custom"; st.accentHex = it.hex; save(); try { a.applyTheme(); } catch (e) { } }
    else if (it.kind === "frame") { st.frame = it.id; save(); }
    else if (it.kind === "fx") { st.fxStyle = it.style; save(); if (PT.confetti) PT.confetti(36); }
  }
  const equipped = (a, it) => (it.kind === "color" ? a.settings.accent === "custom" && String(a.settings.accentHex || "").toLowerCase() === it.hex : it.kind === "frame" ? a.settings.frame === it.id : a.settings.fxStyle === it.style);

  /* ============================================================== hooks into the rest of the rewards */
  PT.xpKey = a => arr(a, "checkins").length + "," + arr(a, "challengesDone").length;
  PT.xpExtras = a => ({ checkins: arr(a, "checkins").length * 10, challenges: arr(a, "challengesDone").length * 300 });
  PT.extraFrames = a => {
    const out = [];
    SHOP.filter(x => x.kind === "frame").forEach(x => out.push({ id: x.id, name: x.name, c: x.c, have: owned(a).includes(x.id), req: `🪙 ${x.price} in the shop` }));
    seasons(a).list.forEach(s => { if (s.tier >= 2 || s.cur) out.push({ id: "s" + s.i, name: `${s.name} S${s.n}`, c: SEASON_COL[((s.i % 4) + 4) % 4], have: s.tier >= 2, req: "Season tier 2" }); });
    return out;
  };
  const prevBadges = PT.badges;
  PT.badges = function (a) {
    const out = prevBadges.apply(this, arguments);
    try {
      a = a || A(); const ds = dayStats(a), cd = arr(a, "challengesDone"), tr = seasons(a).trophies, T = K().tierOf;
      [7, 30, 100, 365].forEach((st, i, l) => out.push({ id: "showup" + st, cat: "habits", series: "showup", step: i, steps: l.length, tier: T(i, l.length), icon: "🌱", name: ["Showing Up", "Habit Formed", "Hundred Days", "Year-Round"][i], desc: `Check in or train ${st} days in a row`, got: ds.best >= st, cur: ds.best, goal: st, date: ds.when["showup" + st] || "" }));
      [1, 3, 5, 10].forEach((st, i, l) => out.push({ id: "chal" + st, cat: "milestones", series: "chal", step: i, steps: l.length, tier: T(i, l.length), icon: "🏁", name: ["Challenger", "Challenge Streak", "Five Trophies", "Champion"][i], desc: `Complete ${st} challenge${st === 1 ? "" : "s"}`, got: cd.length >= st, cur: cd.length, goal: st, date: cd[st - 1] ? dsOf(cd[st - 1].ts) : "" }));
      [1, 2, 4].forEach((st, i, l) => out.push({ id: "seasontr" + st, cat: "milestones", series: "seasontr", step: i, steps: l.length, tier: T(i + 1, 4), icon: "🏟", name: ["Season Finisher", "Two Seasons", "Year of Seasons"][i], desc: `Reach tier 8 in ${st} season${st === 1 ? "" : "s"}`, got: tr.length >= st, cur: tr.length, goal: st, date: tr[st - 1] ? dsOf(tr[st - 1].end - DAY) : "" }));
    } catch (e) { console.error("PulseTrack extra badges B", e); }
    return out;
  };

  /* ============================================================== Home: check-in chip */
  function homeChip(a) {
    const box = $("pt-home-extra"), you = $("pt-you-card"); if (!box || !you) return;
    let b = $("pt-checkin"); const need = !checkedToday(a) && !S(a).some(s => s.date === PT.ds());
    if (!need) { if (b) b.remove(); return; }
    if (!b) { b = document.createElement("button"); b.type = "button"; b.id = "pt-checkin"; b.className = "tap-active"; }
    const n = dayStreak(a);
    b.innerHTML = `✋ I'm in today <span>${n ? "🌱 " + n + " day" + (n === 1 ? "" : "s") : "start a streak"}</span>`;
    if (you.nextElementSibling !== b) you.insertAdjacentElement("afterend", b);
  }
  const oHome = proto.renderHomeView;
  proto.renderHomeView = function () { const r = oHome.apply(this, arguments); try { homeChip(this); } catch (e) { console.error("PulseTrack check-in chip", e); } return r; };
  function checkIn(a) {
    if (checkedToday(a)) return;
    const l = arr(a, "checkins"); l.push(PT.ds()); a.settings.checkins = l.slice(-800); save(); sMemo = null;
    const n = dayStreak(a); a.toast(`Checked in. +10 XP${n > 1 ? " · " + n + " day streak" : ""}`);
    const ms = [7, 30, 100, 365].filter(m => n >= m).pop() || 0, seen = a.settings.showSeen || 0;
    if (ms > seen) { a.settings.showSeen = ms; save(); if (PT.showBadgeUnlock) PT.showBadgeUnlock([{ custom: true, label: "Streak", name: `${n} days in a row`, desc: "Showing up is the hard part.", big: '<div style="font-size:96px;line-height:1">🌱</div>', glow: "rgb(52 211 153 / .6)", a: "#6ee7b7", b: "#059669", confetti: true, share: { icon: "🌱", kicker: "Daily streak", title: n + " days in a row", sub: "Showing up every day", lines: [["Best", dayStats(a).best + " days"]], c: ["#6ee7b7", "#059669"] } }]); }
    try { a.renderHomeView(); } catch (e) { }
    if ($("progress-body") && a.renderProgressView && !$("view-progress").classList.contains("hidden")) a.renderProgressView();
  }

  /* ============================================================== Progress: sections */
  const OPEN = { season: true };
  const section = (id, icon, title, body) => `<details class="pt-pg" id="pt-pg-${id}" ${OPEN[id] ? "open" : ""}><summary><span class="text-xs font-bold text-white">${icon} ${title}</span><span class="pt-chev">›</span></summary><div>${body}</div></details>`;
  function seasonHtml(a) {
    const sv = seasons(a), c = sv.cur, nextAt = (c.tier + 1) * TIER_XP, left = Math.max(1, Math.ceil((c.end - Date.now()) / DAY));
    const ladder = Array.from({ length: 8 }, (_, i) => { const t = i + 1, got = c.tier >= t; return `<div class="pt-tier ${got ? "got" : ""}" title="Tier ${t}"><b>${t}</b><span>${TIER_REWARD[t]}</span></div>`; }).join("");
    const trophies = sv.trophies.length ? `<div class="flex flex-wrap gap-1.5">${sv.trophies.map(s => `<span class="pt-frame">🏆 ${esc(s.name)} S${s.n}</span>`).join("")}</div>` : "";
    return `<div class="flex items-center justify-between gap-2"><div class="min-w-0"><span class="block text-sm font-black text-white">${esc(c.name)} · Season ${c.n}</span><span class="block text-[11px] text-zinc-400">${left} day${left === 1 ? "" : "s"} left · ${fmt(c.xp)} season XP</span></div><span class="text-2xl">${c.tier >= 8 ? "🏆" : "🏟"}</span></div>
      ${c.tier >= 8 ? '<p class="text-xs font-bold text-emerald-400">Season complete. Trophy earned.</p>' : `${bar((c.xp - c.tier * TIER_XP) / TIER_XP)}<span class="block text-[11px] text-zinc-300">${fmt(nextAt - c.xp)} XP to tier ${c.tier + 1} · reward ${esc(TIER_REWARD[c.tier + 1])}</span>`}
      <div class="pt-ladder">${ladder}</div>${trophies}
      <p class="text-[11px] text-zinc-400 leading-snug">Every 12 weeks a new season starts. Workouts, goal weeks, quests and challenges earn season XP. Tier 2 unlocks a season profile frame and tier 8 a trophy badge.</p>`;
  }
  function challengeHtml(a) {
    const c = a.settings.challenge, cd = arr(a, "challengesDone");
    const shelf = cd.length ? `<div class="flex flex-wrap gap-1.5">${cd.slice(-6).map(x => `<span class="pt-frame">${esc(x.icon)} ${esc(x.title)}</span>`).join("")}</div>` : "";
    if (c) {
      const cur = chalStat(a, c), over = !c.done && Date.now() > c.end, left = Math.max(0, Math.ceil((c.end - Date.now()) / DAY)), fv = x => (c.stat === "volume" ? V(x) : fmt(x));
      return `<div class="pt-qrow ${c.done ? "done" : ""}"><div class="flex items-center justify-between gap-2"><span class="text-sm font-black text-white">${esc(c.icon)} ${esc(c.title)}</span><span class="text-[10px] font-bold ${c.done ? "text-emerald-400" : over ? "text-amber-300" : "text-zinc-400"}">${c.done ? "Complete" : over ? "Time is up" : left + " day" + (left === 1 ? "" : "s") + " left"}</span></div>
        <span class="block text-[11px] text-zinc-400">${esc(c.desc)}</span>${bar(cur / c.goal)}<span class="block text-[11px] text-zinc-300">${fv(Math.min(cur, c.goal))} of ${fv(c.goal)}</span></div>
        <div class="flex gap-2">${c.done || over ? '<button type="button" class="pt-b go" id="pt-c-clear">Pick a new challenge</button>' : '<button type="button" class="pt-b" id="pt-c-giveup">Give up</button>'}</div>${shelf}`;
    }
    return `<p class="text-[11px] text-zinc-400">Pick one goal and go for it. Finish it for a trophy and +300 XP.</p>` + presets(a).map(p => `<button type="button" class="pt-chal tap-active" data-cstart="${p.id}"><span class="text-2xl">${p.icon}</span><span class="min-w-0 flex-1 text-left"><span class="block text-xs font-black text-white">${esc(p.title)}</span><span class="block text-[11px] text-zinc-400">${esc(p.desc)}</span></span><span class="text-[11px] font-bold text-emerald-400">Start</span></button>`).join("") + shelf;
  }
  function checkinHtml(a) {
    const n = dayStreak(a), st = dayStats(a), done = checkedToday(a) || S(a).some(s => s.date === PT.ds());
    const cells = Array.from({ length: 14 }, (_, i) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (13 - i)); const on = activeDays(a).has(PT.ds(d)); return `<i class="pt-dot ${on ? "on" : ""}" title="${esc(PT.ds(d))}"></i>`; }).join("");
    return `<div class="flex items-center justify-between gap-2"><div><span class="block text-sm font-black text-white">🌱 ${n} day${n === 1 ? "" : "s"} in a row</span><span class="block text-[11px] text-zinc-400">Best ${st.best} · training or checking in both count</span></div>${done ? '<span class="text-xs font-bold text-emerald-400">Done today</span>' : '<button type="button" class="pt-b go" id="pt-checkin-go">✋ I\'m in today</button>'}</div><div class="pt-dots">${cells}</div>
      <p class="text-[11px] text-zinc-400 leading-snug">Rest days count too. Tap "I'm in today" so the streak keeps going. Each check-in is worth 10 XP.</p>`;
  }
  function shopHtml(a) {
    const coins = PT.coins(a), own = owned(a);
    const grp = (kind, title) => `<span class="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mt-1">${title}</span><div class="pt-shopgrid">${SHOP.filter(x => x.kind === kind).map(x => {
      const has = own.includes(x.id), eq = has && equipped(a, x);
      const prev = x.kind === "color" ? `<i class="pt-sw" style="background:${x.hex}"></i>` : x.kind === "frame" ? `<i class="pt-sw" style="background:linear-gradient(135deg,${x.c.join(",")})"></i>` : `<span class="text-xl leading-none">${x.icon}</span>`;
      return `<button type="button" class="pt-shopit tap-active ${eq ? "eq" : ""}" data-shop="${x.id}" aria-label="${esc(x.name)}, ${has ? (eq ? "equipped" : "owned") : x.price + " coins"}">${prev}<span class="pt-sn">${esc(x.name)}</span><span class="pt-sp">${eq ? "Equipped" : has ? "Equip" : "🪙 " + x.price}</span></button>`;
    }).join("")}</div>`;
    const reset = a.settings.accent === "custom" && a.settings.accentPrev ? '<button type="button" class="pt-b" id="pt-shop-resetcol">Back to my old color</button>' : "";
    return `<div class="flex items-center justify-between"><span class="text-sm font-black text-amber-300">🪙 ${fmt(coins)} coins</span><span class="text-[10px] text-zinc-500">1 coin per 10 XP, plus season rewards</span></div>${grp("color", "Accent colors")}${grp("frame", "Profile frames")}${grp("fx", "Confetti styles")}
      <div class="flex gap-2 flex-wrap">${a.settings.fxStyle && a.settings.fxStyle !== "classic" ? '<button type="button" class="pt-b" id="pt-shop-fxclassic">Classic confetti</button>' : ""}${reset}</div>`;
  }
  function drawRew2(a) {
    const root = $("progress-body"); if (!root) return;
    let box = $("pt-pg-rew2");
    if (!box) { box = document.createElement("div"); box.id = "pt-pg-rew2"; box.className = "space-y-3"; const r1 = $("pt-pg-rew"); if (r1 && r1.parentNode === root) r1.insertAdjacentElement("afterend", box); else root.appendChild(box); }
    box.innerHTML = section("season", "🏟", "Season", seasonHtml(a)) + section("chal", "🏁", "Challenge", challengeHtml(a)) + section("chk", "🌱", "Daily check-in", checkinHtml(a)) + section("shop", "🛍", "Rewards shop", shopHtml(a));
    box.querySelectorAll("details").forEach(d => d.addEventListener("toggle", () => { OPEN[d.id.replace("pt-pg-", "")] = d.open; }));
  }
  const oPV = proto.renderProgressView;
  proto.renderProgressView = function () { const r = oPV.apply(this, arguments); try { drawRew2(this); } catch (e) { console.error("PulseTrack rewards B", e); } return r; };

  /* ============================================================== after a workout */
  function afterFinish(a) {
    const items = [], st = a.settings, c = checkChallenge(a); if (c) items.push(chalItem(c));
    const sv = seasons(a).cur; if (st.seasonSeen && st.seasonSeen.i === sv.i && sv.tier > st.seasonSeen.t) { const t = sv.tier; items.push({ custom: true, label: "Season reward", name: `Tier ${t}`, desc: `${sv.name} · ${TIER_REWARD[t].replace(/^\S+ /, "")} unlocked${SEASON_COINS[t] ? " (+" + SEASON_COINS[t] + " coins)" : ""}`, big: `<div style="font-size:96px;line-height:1">${t >= 8 ? "🏆" : "🏟"}</div>`, glow: "rgb(96 165 250 / .6)", a: "#93c5fd", b: "#2563eb", confetti: t >= 6 }); }
    st.seasonSeen = { i: sv.i, t: sv.tier }; save();
    if (items.length && PT.showBadgeUnlock) setTimeout(() => PT.showBadgeUnlock(items), 1500);
  }
  const oFin = proto.finishWorkoutV2;
  proto.finishWorkoutV2 = async function () {
    const n0 = (this.sessions || []).length; sMemo = null;
    const r = await oFin.apply(this, arguments);
    try { if ((this.sessions || []).length > n0) afterFinish(this); } catch (e) { console.error("PulseTrack rewards B finish", e); }
    return r;
  };

  /* ============================================================== clicks */
  document.addEventListener("click", async e => {
    const a = A(); if (!a || !e.target.closest) return; const t = id => e.target.closest("#" + id), on = sel => e.target.closest(sel);
    if (t("pt-checkin") || t("pt-checkin-go")) { checkIn(a); return; }
    const cs = on("[data-cstart]");
    if (cs) { const p = presets(a).find(x => x.id === cs.dataset.cstart); if (p) { a.settings.challenge = { id: p.id, title: p.title, icon: p.icon, desc: p.desc, stat: p.stat, goal: p.goal, start: Date.now(), end: Date.now() + p.days * DAY, done: false }; save(); OPEN.chal = true; a.toast("Challenge started. Go get it"); a.renderProgressView(); } return; }
    if (t("pt-c-giveup")) { if (await PT.confirm("Give up this challenge?")) { a.settings.challenge = null; save(); a.renderProgressView(); } return; }
    if (t("pt-c-clear")) { a.settings.challenge = null; save(); a.renderProgressView(); return; }
    const sh = on("[data-shop]");
    if (sh) {
      const it = SHOP.find(x => x.id === sh.dataset.shop); if (!it) return; OPEN.shop = true;
      if (!owned(a).includes(it.id)) { if (PT.coins(a) < it.price) { a.toast(`You need ${it.price - PT.coins(a)} more coins`); return; } if (!(await PT.confirm(`Buy ${it.name} for ${it.price} coins?`))) return; a.settings.shopOwned = owned(a).concat(it.id); save(); memo2(); }
      equip(a, it); a.renderProgressView(); try { a.renderHomeView(); } catch (x) { } return;
    }
    if (t("pt-shop-fxclassic")) { a.settings.fxStyle = "classic"; save(); a.renderProgressView(); return; }
    if (t("pt-shop-resetcol")) { a.settings.accent = a.settings.accentPrev || "emerald"; save(); try { a.applyTheme(); } catch (x) { } a.renderProgressView(); }
  });
  const memo2 = () => { sMemo = null; };

  /* ============================================================== styles */
  const css = document.createElement("style"); css.id = "pt-v232b-css";
  css.textContent = `
    #pt-checkin { display: flex; align-items: center; justify-content: space-between; width: 100%; margin-top: .5rem; padding: .55rem .85rem; border-radius: .9rem; background: rgb(var(--z900)); border: 1px dashed rgb(var(--a500) / .6); color: rgb(var(--a400)); font-size: .8rem; font-weight: 800; }
    #pt-checkin span { font-size: .68rem; font-weight: 700; color: rgb(var(--z400)); }
    .pt-ladder { display: grid; grid-template-columns: repeat(8, minmax(0, 1fr)); gap: .25rem; }
    .pt-ladder .pt-tier { display: flex; flex-direction: column; align-items: center; gap: .15rem; padding: .35rem .1rem; border-radius: .6rem; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); background-image: none; color: rgb(var(--z500)); letter-spacing: 0; text-transform: none; }
    .pt-ladder .pt-tier b { font-size: .75rem; font-weight: 900; }
    .pt-ladder .pt-tier span { font-size: .5rem; font-weight: 700; line-height: 1.1; text-align: center; overflow-wrap: anywhere; }
    .pt-ladder .pt-tier.got { border-color: rgb(251 191 36 / .6); color: #fde68a; background: rgb(var(--z900)); }
    .pt-chal { display: flex; align-items: center; gap: .7rem; width: 100%; padding: .6rem .75rem; border-radius: .85rem; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); }
    .pt-dots { display: flex; gap: .3rem; }
    .pt-dot { flex: 1; height: .9rem; border-radius: .3rem; background: rgb(var(--z800)); }
    .pt-dot.on { background: rgb(52 211 153); }
    .pt-shopgrid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .45rem; }
    .pt-shopit { display: flex; flex-direction: column; align-items: center; gap: .25rem; padding: .6rem .3rem; border-radius: .85rem; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); min-width: 0; }
    .pt-shopit.eq { border-color: rgb(var(--a500)); }
    .pt-sw { width: 1.6rem; height: 1.6rem; border-radius: 50%; display: block; }
    .pt-sn { font-size: .68rem; font-weight: 800; color: #fff; text-align: center; line-height: 1.15; }
    .pt-sp { font-size: .62rem; font-weight: 700; color: rgb(251 191 36); }
    .pt-shopit.eq .pt-sp { color: rgb(52 211 153); }
  `;
  document.head.appendChild(css);

  setTimeout(() => {
    try {
      const a = A(), st = a.settings; let ch = false;
      if (st.showSeen === undefined) { st.showSeen = [7, 30, 100, 365].filter(m => dayStats(a).best >= m && dayStreak(a) >= m).pop() || 0; ch = true; }
      const sv = seasons(a).cur; if (!st.seasonSeen) { st.seasonSeen = { i: sv.i, t: sv.tier }; ch = true; }
      if (ch) save();
      const c = checkChallenge(a); if (c && PT.showBadgeUnlock) PT.showBadgeUnlock([chalItem(c)]);
    } catch (e) { console.error("PulseTrack rewards B init", e); }
  }, 2300);
})();
  