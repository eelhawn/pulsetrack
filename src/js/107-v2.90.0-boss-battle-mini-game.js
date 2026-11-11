/* =====================================================================
 * PulseTrack 2.90.0: the boss battle, a tap mini game on top of the weekly boss fight (module 102).
 *
 *  Workouts still do the real damage. The battle is how you add to it:
 *  - Swings: 3 for every day you train this week (up to one day over your goal) and 2 for every new record (up to 3). No training,
 *    no swings, so the game never replaces the gym.
 *  - A marker sweeps across a bar. Tap HIT: the green middle is PERFECT (20 damage, a critical), the yellow is GOOD (10), the red is a
 *    MISS and the boss hits back: you lose a heart. 3 hearts a day; at 0 you are knocked down until tomorrow (your swings wait).
 *  - Perfect hits in a row build a combo: ×1.25, ×1.5, ×1.75, up to ×2. Every 4th swing the boss charges: the marker is faster, and a
 *    perfect hit on it is a COUNTER for double. Below 30% health the boss is enraged: faster again, smaller green zone. Tougher bosses
 *    (a win streak) are faster too.
 *  - What the battle adds is capped at half of your workout damage that week (so 3 training days = up to +150), and it travels in your
 *    group update (the "bx" field), so it counts on everybody's board. Your weapon from the shop (module 106) shows on every hit.
 *  settings.bossGame = { week: { used, dmg, hits, crits, best, lost: { day: hearts lost } } }, settings.battleSound (false = muted).
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined" || !PT.boss || !PT.famKit || !PT.weeksOf) return;
  const proto = ApplicationUI.prototype;
  const A = () => window.app;
  const $ = id => document.getElementById(id);
  const esc = s => PT.esc(s);
  const K = PT.famKit, DAY = 86400000;
  const PERFECT = 20, GOOD = 10, HEARTS = 3, PER_DAY = 3, PER_PR = 2, PR_MAX = 3;
  const save = a => { try { WorkoutStorage.saveSettings((a || A()).settings); } catch (e) { } };
  const num = v => { const n = parseFloat(v); return isFinite(n) ? n : 0; };
  const fmt = n => Math.round(n).toLocaleString();
  const wid0 = () => K.dsOf(K.wkMon(0));

  /* ============================================================== the numbers */
  function games(a) { const g = a.settings.bossGame; return g && typeof g === "object" && !Array.isArray(g) ? g : (a.settings.bossGame = {}); }
  function game(a, wid) {
    const G = games(a); wid = wid || wid0();
    if (!G[wid]) { G[wid] = { used: 0, dmg: 0, hits: 0, crits: 0, best: 0, combo: 0, lost: {} }; const ks = Object.keys(G).sort(); while (ks.length > 6) delete G[ks.shift()]; }
    return G[wid];
  }
  /** this week's training: days (capped at goal + 1) and records (capped), and the workout damage they do */
  function mine(a) {
    const W = PT.weeksOf(a), o = W.get(K.wkMon(0)), g = K.effG(PT.goalFor(a, K.wkMon(0)));
    const d = Math.min(o ? o.days.size : 0, g + 1), p = Math.min(o ? o.p : 0, PR_MAX);
    return { d, p, g, base: d * 100 + p * 50 };
  }
  function swings(a) { const m = mine(a), G = game(a); return { total: m.d * PER_DAY + m.p * PER_PR, left: Math.max(0, m.d * PER_DAY + m.p * PER_PR - G.used), cap: Math.floor(m.base / 2), m }; }
  const heartsLeft = a => Math.max(0, HEARTS - num(game(a).lost[PT.ds()]));
  /** what the battle adds to one person's boss damage in a week (capped at half their workout damage) */
  PT.bossBonus = (a, p, wid, base) => {
    const raw = p && p.me ? num(((a.settings.bossGame || {})[wid] || {}).dmg) : num(p && p.bx && p.bx[wid]);
    return Math.max(0, Math.min(raw, Math.floor(num(base) / 2)));
  };
  /** for the update code: this week's and last week's battle damage */
  PT.bossBonusOut = a => { const G = a.settings.bossGame || {}; return [K.dsOf(K.wkMon(1)), wid0()].filter(w => G[w] && num(G[w].dmg) > 0).map(w => [w, Math.round(num(G[w].dmg))]); };

  /** how hard this swing is: zone sizes and marker speed */
  function feel(a, st) {
    const G = game(a), lvl = st ? st.lvl || 0 : 0, rage = !!(st && st.hp && st.left / st.hp < 0.3 && !st.won), charge = (G.used + 1) % 4 === 0;
    let perfect = Math.max(0.07, 0.13 - 0.01 * lvl), speed = 0.85 + 0.08 * Math.min(lvl, 5);
    if (rage) { perfect *= 0.8; speed += 0.2; } if (charge) speed += 0.35;
    return { perfect, good: 0.4, speed, rage, charge };
  }
  /** one swing at marker position pos (0..1, the middle is 0.5). Returns what happened; never throws */
  function strike(a, pos, f) {
    const s = swings(a), G = game(a), out = { ok: false };
    if (s.left <= 0) return Object.assign(out, { why: "swings" });
    if (heartsLeft(a) <= 0) return Object.assign(out, { why: "hearts" });
    if (s.cap > 0 && G.dmg >= s.cap) return Object.assign(out, { why: "cap" });
    f = f || feel(a, PT.boss.state()); const off = Math.abs(num(pos) - 0.5);
    G.used++;
    let kind, dmg = 0;
    if (off <= f.perfect / 2) {
      G.combo = (G.combo || 0) + 1; const mult = Math.min(2, 1 + 0.25 * (G.combo - 1));
      dmg = Math.round(PERFECT * mult * (f.charge ? 2 : 1)); kind = f.charge ? "counter" : "perfect"; G.crits++; out.mult = mult;
    } else if (off <= f.good / 2) { G.combo = 0; dmg = GOOD; kind = "good"; }
    else { G.combo = 0; kind = "miss"; G.lost[PT.ds()] = num(G.lost[PT.ds()]) + 1; Object.keys(G.lost).forEach(k => { if (k < PT.ds(new Date(Date.now() - 7 * DAY))) delete G.lost[k]; }); }
    const room = s.cap > 0 ? Math.max(0, s.cap - G.dmg) : 0, counted = Math.min(dmg, room);
    G.dmg += counted; if (dmg) G.hits++; G.best = Math.max(G.best || 0, G.combo || 0);
    save(a); try { PT.boss.reset(); } catch (e) { }
    return Object.assign(out, { ok: true, kind, dmg, counted, combo: G.combo, capped: counted < dmg, hearts: heartsLeft(a), left: swings(a).left });
  }

  /* ============================================================== the line on the boss card */
  PT.battleCardHtml = (a, st) => {
    const s = swings(a), G = game(a), h = heartsLeft(a);
    const msg = s.total === 0 ? "Train to earn swings: 3 for every training day, 2 for every new record."
      : st.won ? "The boss is down. Your swings wait for the next one."
      : s.left === 0 ? `All ${s.total} swings used this week. Train again for more.`
      : h === 0 ? "Knocked down for today. Back tomorrow with 3 hearts."
      : s.cap && G.dmg >= s.cap ? "Battle bonus maxed for your workouts this week. Train again to raise it."
      : `${s.left} swing${s.left === 1 ? "" : "s"} ready · ${"❤️".repeat(h)}${"🖤".repeat(HEARTS - h)}`;
    const can = s.left > 0 && h > 0 && !st.won && !(s.cap && G.dmg >= s.cap);
    return `<div class="pt-bbline"><div class="min-w-0 flex-1"><span class="block text-xs font-black text-white">⚔️ Battle${G.dmg ? ` · +${fmt(Math.min(G.dmg, s.cap))} of ${fmt(s.cap)}` : s.cap ? ` · up to +${fmt(s.cap)}` : ""}</span><span class="block text-[11px] text-zinc-400 leading-snug">${esc(msg)}</span></div>
      <button type="button" class="pt-b ${can ? "go" : ""}" id="pt-boss-battle">${can ? "Fight" : "Look"}</button></div>`;
  };

  /* ============================================================== sound (tiny, optional) */
  let ac = null;
  function beep(kind) {
    const a = A(); if (!a || a.settings.battleSound === false) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const t = ac.currentTime;
      const tone = (f1, f2, dur, type, vol, at) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f1, t + at); o.frequency.exponentialRampToValueAtTime(f2, t + at + dur); g.gain.setValueAtTime(vol, t + at); g.gain.exponentialRampToValueAtTime(0.001, t + at + dur); o.connect(g); g.connect(ac.destination); o.start(t + at); o.stop(t + at + dur + 0.02); };
      if (kind === "perfect" || kind === "counter") { tone(520, 1040, 0.09, "square", 0.08, 0); tone(780, 1560, 0.12, "square", 0.06, 0.07); }
      else if (kind === "good") tone(300, 160, 0.09, "square", 0.07, 0);
      else if (kind === "miss") tone(140, 55, 0.28, "sawtooth", 0.09, 0);
      else if (kind === "win") [523, 659, 784, 1047].forEach((f, i) => tone(f, f * 1.01, 0.16, "triangle", 0.08, i * 0.11));
    } catch (e) { }
  }
  const buzz = p => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) { } };

  /* ============================================================== the battle screen */
  let run = null;   // { raf, t0, pos, f, el }
  const still = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  function hud(a) {
    const st = PT.boss.state(), s = swings(a), G = game(a), h = heartsLeft(a), f = feel(a, st);
    const hp = $("pt-bb-hp"), hpt = $("pt-bb-hpt"), boss = $("pt-bb-boss"); if (!hp) return;
    hp.style.width = (st.hp ? Math.max(0, st.left) / st.hp * 100 : 0) + "%";
    hpt.textContent = `${fmt(Math.max(0, st.left))} / ${fmt(st.hp)} HP`;
    $("pt-bb-hearts").textContent = "❤️".repeat(h) + "🖤".repeat(HEARTS - h);
    $("pt-bb-sw").textContent = `⚔️ ${s.left}`;
    $("pt-bb-bonus").textContent = `+${fmt(Math.min(G.dmg, s.cap))} / ${fmt(s.cap)}`;
    $("pt-bb-combo").textContent = G.combo > 1 ? `Combo ×${Math.min(2, 1 + 0.25 * (G.combo - 1))}` : "";
    boss.classList.toggle("rage", f.rage); $("pt-bb-arena").classList.toggle("charge", f.charge && s.left > 0);
    const zone = $("pt-bb-zone"); zone.style.setProperty("--p", f.perfect * 100 + "%"); zone.style.setProperty("--g", f.good * 100 + "%");
    const btn = $("pt-bb-hit"), why = st.won ? "Defeated! 🏆" : s.left <= 0 ? (s.total ? "No swings left. Train for more" : "Train to earn swings") : h <= 0 ? "Knocked down. Back tomorrow" : s.cap && G.dmg >= s.cap ? "Bonus maxed. Train to raise it" : "";
    btn.disabled = !!why; btn.textContent = why || (f.charge ? "COUNTER!" : "HIT");
    $("pt-bb-tip").textContent = st.won ? "The group beat this boss. A new one shows up on Monday." : f.charge ? "The boss is charging. A perfect hit counters for double." : f.rage ? "Enraged! Faster, and the green zone is smaller." : "Tap HIT when the marker is in the green.";
    run && (run.f = f);
  }
  function float(text, cls) {
    const box = $("pt-bb-fx"); if (!box) return;
    const e = document.createElement("span"); e.className = "pt-bbfloat " + cls; e.textContent = text; e.style.left = (35 + Math.random() * 30) + "%";
    box.appendChild(e); setTimeout(() => e.remove(), 900);
  }
  function loop(ts) {
    if (!run || !document.body.contains(run.el)) { run = null; return; }
    const f = run.f || { speed: 1 }; if (!run.t0) run.t0 = ts;
    run.ph = (run.ph || 0) + ((ts - (run.last || ts)) / 1000) * f.speed; run.last = ts;
    const x = run.ph % 1, pos = run.hold ? run.pos : (x < 0.5 ? x * 2 : 2 - x * 2); run.pos = pos;
    const m = $("pt-bb-mark"); if (m) m.style.left = (pos * 100) + "%";
    run.raf = requestAnimationFrame(loop);
  }
  function swing(a) {
    if (!run) return; const st = PT.boss.state(), wasWon = st.won, r = strike(a, run.pos, run.f); run.hold = false;
    if (!r.ok) { hud(a); return; }
    const boss = $("pt-bb-boss"), arena = $("pt-bb-arena"), w = PT.weaponOf ? PT.weaponOf(a) : { icon: "👊" };
    if (r.kind === "miss") {
      float("MISS", "miss"); boss.classList.remove("hit", "crit"); void boss.offsetWidth; boss.classList.add("lunge"); arena.classList.add("hurt"); setTimeout(() => arena.classList.remove("hurt"), 350);
      beep("miss"); buzz([60, 40, 60]); float("💔 −1", "heart");
    } else {
      const crit = r.kind !== "good";
      float(`${w.icon} ${r.counted ? "−" + r.counted : "0"}${r.kind === "counter" ? " COUNTER" : crit ? " CRIT" : ""}${r.capped ? " (max)" : ""}`, crit ? "crit" : "hit");
      boss.classList.remove("hit", "crit", "lunge"); void boss.offsetWidth; boss.classList.add(crit ? "crit" : "hit");
      if (crit && !still()) { arena.classList.add("shake"); setTimeout(() => arena.classList.remove("shake"), 300); }
      beep(r.kind); buzz(crit ? 35 : 15);
    }
    hud(a);
    const now = PT.boss.state();
    if (!wasWon && now.won) {
      setTimeout(() => { try { $("pt-bb-boss").classList.add("dead"); float("DEFEATED", "win"); beep("win"); PT.confetti && PT.confetti(80); PT.boss.check(); } catch (e) { } }, 250);
    }
  }
  function openBattle(a) {
    const kit = PT.kit, st = PT.boss.state(), el = kit.sheet("pt-battle", 85), lvl = st.lvl || 0;
    const card = kit.openSheet(el, `${kit.head(`${st.boss.e} ${st.boss.n}`, `${lvl ? "Lv " + (lvl + 1) + " · " : ""}${st.boss.t}`)}
      <div class="pt-bbarena" id="pt-bb-arena">
        <button type="button" class="pt-bbmute" id="pt-bb-mute" aria-label="Sound">${a.settings.battleSound === false ? "🔇" : "🔊"}</button>
        <div class="pt-bbboss" id="pt-bb-boss">${st.boss.e}</div><div class="pt-bbfx" id="pt-bb-fx" aria-live="polite"></div>
        <div class="pt-bbhpw"><div class="pt-bar pt-bosshp"><span id="pt-bb-hp"></span></div><span id="pt-bb-hpt" class="pt-bbhpt"></span></div></div>
      <div class="pt-bbstats"><span id="pt-bb-hearts" aria-label="Hearts"></span><span id="pt-bb-combo" class="pt-bbcombo"></span><span id="pt-bb-sw" title="Swings left"></span><span id="pt-bb-bonus" title="Battle bonus this week"></span></div>
      <div class="pt-bbtrack" id="pt-bb-track" aria-hidden="true"><div class="pt-bbzone" id="pt-bb-zone"></div><i class="pt-bbmark" id="pt-bb-mark"></i></div>
      <button type="button" class="pt-bbhit tap-active" id="pt-bb-hit">HIT</button>
      <p class="text-[11px] text-zinc-400 text-center leading-snug" id="pt-bb-tip"></p>
      <p class="text-[10px] text-zinc-500 text-center leading-snug">Perfect 20 · Good 10 · combos up to ×2 · a miss costs a heart (3 a day). Your battle damage is added to the group's, up to half your workout damage this week.</p>`);
    run = { el, pos: 0.5, f: feel(a, st) };
    hud(a); run.raf = requestAnimationFrame(loop);
    card.addEventListener("click", e => {
      if (e.target.closest("#pt-bb-hit") || e.target.closest("#pt-bb-track")) { swing(a); return; }
      if (e.target.closest("#pt-bb-mute")) { a.settings.battleSound = a.settings.battleSound === false; save(a); e.target.closest("#pt-bb-mute").textContent = a.settings.battleSound === false ? "🔇" : "🔊"; }
    });
    const obs = new MutationObserver(() => { if (el.classList.contains("hidden") || !document.body.contains(el)) { obs.disconnect(); if (run) cancelAnimationFrame(run.raf); run = null; try { a.renderProgressView(); } catch (er) { } try { if (PT.live && PT.live.isOn && PT.live.isOn(a)) PT.live.sync(a); } catch (er) { } } });
    obs.observe(el, { attributes: true, attributeFilter: ["class"] });
  }
  document.addEventListener("click", e => { if (e.target.closest && e.target.closest("#pt-boss-battle")) { e.preventDefault(); const a = A(); if (a) openBattle(a); } });

  PT.battle = { swings: a => swings(a || A()), strike: (pos, a, f) => strike(a || A(), pos, f), feel: a => feel(a || A(), PT.boss.state()), hearts: a => heartsLeft(a || A()), game: a => game(a || A()), open: a => openBattle(a || A()), pos: () => (run ? run.pos : null), setPos: p => { if (run) { run.pos = p; run.ph = p / 2; run.hold = true; } } /* tests: the marker stays there for one swing */, PERFECT, GOOD };

  const css = document.createElement("style"); css.id = "pt-v290-battle-css";
  css.textContent = `
    .pt-bbline { display: flex; align-items: center; gap: .6rem; padding: .6rem .7rem; border-radius: .8rem; background: rgb(var(--z950)); border: 1px solid rgb(239 68 68 / .45); }
    .pt-bbarena { position: relative; height: 12.5rem; margin: .4rem 0 .6rem; border-radius: 1rem; overflow: hidden; border: 1px solid rgb(var(--z800));
      background: radial-gradient(circle at 50% 42%, rgb(239 68 68 / .22), transparent 60%), linear-gradient(180deg, rgb(var(--z900)), rgb(var(--z950))); }
    .pt-bbarena.charge { box-shadow: inset 0 0 0 2px rgb(245 158 11 / .8); }
    .pt-bbarena.hurt { animation: pt-bbhurt .35s; }
    .pt-bbarena.shake { animation: pt-bbshake .3s; }
    .pt-bbboss { position: absolute; left: 50%; top: 42%; transform: translate(-50%, -50%); font-size: 5.2rem; line-height: 1; transition: filter .3s; user-select: none; -webkit-user-select: none; }
    .pt-bbboss.rage { filter: drop-shadow(0 0 14px rgb(239 68 68)) saturate(1.4); animation: pt-bbpulse 1s infinite; }
    .pt-bbboss.hit { animation: pt-bbhit .25s; }
    .pt-bbboss.crit { animation: pt-bbcrit .35s; }
    .pt-bbboss.lunge { animation: pt-bblunge .35s; }
    .pt-bbboss.dead { filter: grayscale(1); opacity: .4; transform: translate(-50%, -30%) rotate(-90deg); transition: all .6s; animation: none; }
    .pt-bbfx { position: absolute; inset: 0; pointer-events: none; }
    .pt-bbfloat { position: absolute; top: 6%; transform: translateX(-50%); font-weight: 900; font-size: 1.05rem; white-space: nowrap; animation: pt-bbfloat .9s ease-out forwards; text-shadow: 0 2px 6px rgb(0 0 0 / .6); }
    .pt-bbfloat.hit { color: #fde68a; }
    .pt-bbfloat.crit { color: #fbbf24; font-size: 1.35rem; }
    .pt-bbfloat.miss { color: #f87171; font-size: 1.3rem; }
    .pt-bbfloat.heart { color: #fca5a5; top: 62%; font-size: .9rem; }
    .pt-bbfloat.win { color: #34d399; font-size: 1.7rem; top: 6%; }
    .pt-bbhpw { position: absolute; left: .75rem; right: .75rem; bottom: .65rem; }
    .pt-bbhpt { display: block; text-align: right; font-size: .65rem; font-weight: 800; color: rgb(var(--z300)); margin-top: .2rem; }
    .pt-bbmute { position: absolute; right: .5rem; top: .5rem; width: 2.2rem; height: 2.2rem; border-radius: .7rem; background: rgb(var(--z900) / .8); border: 1px solid rgb(var(--z800)); font-size: 1rem; z-index: 2; }
    .pt-bbstats { display: flex; align-items: center; justify-content: space-between; gap: .5rem; font-size: .8rem; font-weight: 800; color: rgb(var(--z200)); margin-bottom: .55rem; }
    .pt-bbcombo { color: #fbbf24; flex: 1; text-align: center; }
    .pt-bbtrack { position: relative; height: 2.6rem; border-radius: .8rem; overflow: hidden; margin-bottom: .7rem; cursor: pointer;
      background: linear-gradient(90deg, rgb(239 68 68 / .55), rgb(239 68 68 / .35)); border: 1px solid rgb(var(--z800)); }
    .pt-bbzone { position: absolute; top: 0; bottom: 0; left: 50%; width: var(--g); transform: translateX(-50%); background: rgb(245 158 11 / .65); }
    .pt-bbzone::after { content: ""; position: absolute; top: 0; bottom: 0; left: 50%; width: calc(var(--p) / var(--g) * 100%); transform: translateX(-50%); background: rgb(52 211 153); box-shadow: 0 0 12px rgb(52 211 153 / .8); }
    .pt-bbmark { position: absolute; top: -2px; bottom: -2px; width: 5px; margin-left: -2.5px; border-radius: 3px; background: #fff; box-shadow: 0 0 8px #fff, 0 0 2px #000; }
    .pt-bbhit { display: block; width: 100%; height: 3.6rem; border-radius: 1rem; font-size: 1.35rem; font-weight: 900; letter-spacing: .06em; color: #fff; background: linear-gradient(180deg, #ef4444, #b91c1c); box-shadow: 0 6px 0 #7f1d1d; margin-bottom: .6rem; }
    .pt-bbhit:active:not(:disabled) { transform: translateY(4px); box-shadow: 0 2px 0 #7f1d1d; }
    .pt-bbhit:disabled { background: rgb(var(--z800)); box-shadow: none; color: rgb(var(--z400)); font-size: .85rem; letter-spacing: 0; }
    @keyframes pt-bbhit { 0% { transform: translate(-50%, -50%) } 40% { transform: translate(-46%, -50%) scale(.95) } 100% { transform: translate(-50%, -50%) } }
    @keyframes pt-bbcrit { 0% { transform: translate(-50%, -50%) } 30% { transform: translate(-42%, -50%) scale(.85) rotate(8deg); filter: brightness(2.5) } 100% { transform: translate(-50%, -50%) } }
    @keyframes pt-bblunge { 0% { transform: translate(-50%, -50%) } 45% { transform: translate(-50%, -30%) scale(1.35) } 100% { transform: translate(-50%, -50%) } }
    @keyframes pt-bbpulse { 50% { transform: translate(-50%, -50%) scale(1.06) } }
    @keyframes pt-bbfloat { from { opacity: 1; transform: translate(-50%, 0) } to { opacity: 0; transform: translate(-50%, -2.6rem) } }
    @keyframes pt-bbshake { 25% { transform: translateX(-5px) } 50% { transform: translateX(5px) } 75% { transform: translateX(-3px) } }
    @keyframes pt-bbhurt { 0%, 100% { box-shadow: none } 30% { box-shadow: inset 0 0 0 999px rgb(239 68 68 / .3) } }
    @media (prefers-reduced-motion: reduce) { .pt-bbboss.hit, .pt-bbboss.crit, .pt-bbboss.lunge, .pt-bbboss.rage, .pt-bbarena.shake { animation: none; } }
    html[data-mode="light"] .pt-bbfloat.hit, html[data-mode="light"] .pt-bbfloat.crit { color: #b45309; text-shadow: none; }
  `;
  document.head.appendChild(css);
})();
