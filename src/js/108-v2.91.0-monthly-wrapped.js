/* =====================================================================
 * PulseTrack 2.91.0: Monthly Wrapped.
 *  Your month as a full-screen story, one thing per slide, like the year-end recaps on music apps:
 *  workouts and days, weekly goal weeks, what you moved (as things you haul), records and the biggest jump, your go-to lift,
 *  your training style (early bird or night owl, favourite day), boss fights and battle damage, loot chests, and your group.
 *  Slides with nothing to show are left out. The last slide is a summary with a Share picture (a 1080 × 1920 story image).
 *  - Tap the right side for the next slide, the left side to go back, hold to pause. Arrow keys and Escape work too.
 *  - Opens from the Home banner in the first 10 days of a month ("Your October Wrapped is ready", which used to scroll to the
 *    monthly recap), and from a "Play Wrapped" button on the monthly recap card in Progress → History, for any month.
 *  Nothing new is stored except settings.recapSeen (as before) once you open it from the banner.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  const proto = ApplicationUI.prototype;
  const A = () => window.app;
  const $ = id => document.getElementById(id);
  const esc = s => PT.esc(s);
  const num = v => { const n = parseFloat(v); return isFinite(n) ? n : 0; };
  const DAY = 86400000, PER = 6000;
  const fmtInt = n => Math.round(n).toLocaleString();
  const keyOf = m0 => m0.getFullYear() + "-" + String(m0.getMonth() + 1).padStart(2, "0");
  const fromKey = k => { const m = /^(\d{4})-(\d{2})$/.exec(String(k || "")); return m ? new Date(+m[1], +m[2] - 1, 1) : null; };
  const hm = sec => { const h = Math.floor(sec / 3600), m = Math.round((sec % 3600) / 60); return h ? h + " h" + (m ? " " + m + " min" : "") : m + " min"; };
  const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  /* ============================================================== the numbers */
  /** the Mondays of the weeks that start in this month (and have started), oldest first */
  function mondays(m0, m1) {
    const K = PT.famKit, out = [];
    if (K && K.wkMon) { for (let i = 0; i < 80; i++) { const t = K.wkMon(i); if (t < m0.getTime()) break; if (t < m1.getTime()) out.push(t); } return out.reverse(); }
    const d = new Date(m0); d.setDate(d.getDate() + ((8 - d.getDay()) % 7));
    for (; d < m1 && d.getTime() <= Date.now(); d.setDate(d.getDate() + 7)) out.push(d.getTime());
    return out;
  }
  function styleOf(hours) {
    if (!hours.length) return null;
    const h = hours.slice().sort((x, y) => x - y)[Math.floor(hours.length / 2)];
    const name = h < 9 ? ["Early bird", "🌅"] : h < 12 ? ["Morning lifter", "☀️"] : h < 17 ? ["Afternoon lifter", "🌤️"] : h < 21 ? ["Evening lifter", "🌆"] : ["Night owl", "🦉"];
    const ampm = x => { const q = Math.round(x * 2) / 2, r = Math.floor(q) % 24, half = q % 1 ? ":30" : ""; return (r % 12 || 12) + half + (r < 12 ? " am" : " pm"); };
    return { name: name[0], ico: name[1], at: ampm(h) };
  }

  function data(a, m0) {
    if (!a.monthStats) return null;
    const S = a.monthStats(m0); if (!S || !S.workouts) return null;
    const m1 = S.m1, now = Date.now(), done = now >= m1.getTime();
    const u = a.wLabel(), monthName = m0.toLocaleDateString(undefined, { month: "long" }), prevName = new Date(m0.getFullYear(), m0.getMonth() - 1, 1).toLocaleDateString(undefined, { month: "long" });
    // weekly goal
    const W = PT.weeksOf ? PT.weeksOf(a) : new Map();
    const weeks = mondays(m0, m1).map(t => { const o = W.get(t), d = o ? o.days.size : 0, g = PT.goalFor ? PT.goalFor(a, t) : 3, cur = now < t + 7 * DAY; return { t, d, g, hit: d >= g, cur }; });
    const goalWeeks = weeks.filter(w => !w.cur || w.hit);
    // style
    const hours = [], wd = [0, 0, 0, 0, 0, 0, 0]; let longest = 0;
    S.cur.forEach(s => {
      const t = num(s.ts); if (t > 0) { const d = new Date(t - num(s.dur) * 1000); hours.push(d.getHours() + d.getMinutes() / 60); }
      const day = PT.fromDs(s.date); wd[day.getDay()]++; longest = Math.max(longest, num(s.dur));
    });
    const topDay = wd.indexOf(Math.max(...wd));
    // lifts and muscles
    const topEx = Object.keys(S.exSets).filter(n => !(PT.cardioKind && PT.cardioKind(n))).sort((x, y) => S.exSets[y] - S.exSets[x])[0] || null;
    const mus = Object.keys(S.muscles).filter(k => k !== "Other" && k !== "Cardio").sort((x, y) => S.muscles[y] - S.muscles[x])[0] || null;
    // what you moved, as things you haul (module 060)
    let haul = null; try { if (PT.haul) { const h = PT.haul({ sessions: S.cur, unit: () => a.unit() }); haul = h.big ? h.big.text : null; } } catch (e) { haul = null; }
    // boss and battle (modules 102, 107)
    const inMonth = wid => { const t = PT.fromDs(wid).getTime(); return t >= m0.getTime() && t < m1.getTime(); };
    const wins = Object.entries(a.settings.bossWins || {}).filter(([wid]) => inMonth(wid)).map(([, w]) => (w && w.b) || "boss");
    let bdmg = 0, crits = 0, best = 0;
    Object.entries(a.settings.bossGame || {}).forEach(([wid, g]) => { if (g && inMonth(wid)) { bdmg += num(g.dmg); crits += num(g.crits); best = Math.max(best, num(g.best)); } });
    // loot chests (module 106)
    const chests = { common: 0, rare: 0, epic: 0, legendary: 0 }; let nChests = 0;
    try { if (PT.loot) PT.loot.earned(a).forEach(c => { if (c.t >= m0.getTime() && c.t < m1.getTime() && chests[c.tier] != null) { chests[c.tier]++; nChests++; } }); } catch (e) { }
    // the group (module 076)
    let group = null;
    try {
      const K = PT.famKit;
      if (K) {
        const wids = weeks.map(w => K.dsOf(w.t)), ppl = Object.values(K.people(a));
        const rows = ppl.map(p => ({ n: p.n, me: !!p.me, d: wids.reduce((s, w) => s + num(p.wk[w] && p.wk[w].d), 0), crowns: 0 })).filter(r => r.d > 0);
        wids.forEach((w, i) => {
          if (weeks[i].cur) return;
          const l = ppl.filter(p => p.wk[w]).map(p => ({ n: p.n, sc: K.score(p.wk[w]) })).sort((x, y) => y.sc - x.sc);
          if (l.length >= 2 && l[0].sc > 0 && l[0].sc > l[1].sc) { const r = rows.find(x => x.n === l[0].n); if (r) r.crowns++; }
        });
        if (rows.length >= 2) group = { rows: rows.sort((x, y) => y.d - x.d || y.crowns - x.crowns), days: rows.reduce((s, r) => s + r.d, 0) };
      }
    } catch (e) { group = null; }
    return { S, m0, m1, done, u, monthName, prevName, weeks, goalHit: goalWeeks.filter(w => w.hit).length, goalOf: goalWeeks.length, style: styleOf(hours), topDay: wd[topDay] ? { name: DAYS[topDay], n: wd[topDay] } : null,
      longest, topEx, mus, haul, wins, bdmg, crits, best, chests, nChests, group };
  }

  /* ============================================================== the slides */
  const N = (v, kind) => `<span class="pt-wr-n" data-to="${v}" data-k="${kind || "int"}">${kind === "dec" ? PT.num(v, 1) : fmtInt(v)}</span>`;
  function slides(D) {
    const S = D.S, out = [], u = D.u, M = esc(D.monthName);
    out.push({ k: "intro", tone: "glow", html: `<p class="pt-wr-kick">PulseTrack</p><h2 class="pt-wr-month">${M}</h2><p class="pt-wr-sub">${D.done ? "Your month in lifting, wrapped." : "Your month so far, wrapped."}</p><p class="pt-wr-hint">Tap to go on, hold to pause</p>` });
    let vs = "";
    if (S.prevWorkouts) { const d = S.workouts - S.prevWorkouts; vs = d > 0 ? `${d} more than ${esc(D.prevName)}.` : d < 0 ? `${-d} fewer than ${esc(D.prevName)}.` : `Same as ${esc(D.prevName)}.`; }
    out.push({ k: "showed", tone: "solid", html: `<p class="pt-wr-kick">You showed up</p><div class="pt-wr-big">${N(S.workouts)}</div><p class="pt-wr-unit">workout${S.workouts === 1 ? "" : "s"}</p><p class="pt-wr-line">On ${S.days} day${S.days === 1 ? "" : "s"}, ${esc(hm(S.dur))} in all.</p>${vs ? `<p class="pt-wr-line pt-wr-dim">${vs}</p>` : ""}` });
    if (D.goalOf) {
      const dots = D.weeks.map(w => `<span class="pt-wr-wk${w.hit ? " on" : ""}${w.cur && !w.hit ? " cur" : ""}"><b>${w.d}/${w.g}</b><i>${esc(PT.fmtDate(PT.ds(new Date(w.t)), { month: "short", day: "numeric" }))}</i></span>`).join("");
      const line = D.goalHit === D.goalOf ? "Every single week." : D.goalHit === 0 ? "Next month is a fresh start." : D.goalHit / D.goalOf >= 0.5 ? "More often than not." : "Room to grow next month.";
      out.push({ k: "goal", tone: "dark", html: `<p class="pt-wr-kick">Your weekly goal</p><div class="pt-wr-big">${N(D.goalHit)}<small> of ${D.goalOf}</small></div><p class="pt-wr-unit">week${D.goalOf === 1 ? "" : "s"} on goal</p><div class="pt-wr-wks">${dots}</div><p class="pt-wr-line">${line}</p>` });
    }
    if (S.vol > 0) out.push({ k: "moved", tone: "glow", html: `<p class="pt-wr-kick">You moved</p><div class="pt-wr-big">${N(Math.round(S.vol))}</div><p class="pt-wr-unit">${esc(u)}</p>${D.haul ? `<p class="pt-wr-line">About ${esc(D.haul)}.</p>` : ""}<p class="pt-wr-line pt-wr-dim">${fmtInt(S.sets)} sets, weight × reps added up.</p>` });
    if (S.prCount || S.improved) {
      const names = S.prNames.slice(0, 3).map(n => `<li>🏅 ${esc(n)}</li>`).join("");
      const imp = S.improved ? `<p class="pt-wr-line">Biggest jump: <b>${esc(S.improved.name)}</b>, +${PT.num(S.improved.gain * 100, 1)}%<span class="pt-wr-dim"> (est. 1RM ${PT.num(S.improved.from, 0)} → ${PT.num(S.improved.to, 0)} ${esc(u)})</span></p>` : "";
      out.push({ k: "prs", tone: "gold", html: `<p class="pt-wr-kick">New records</p><div class="pt-wr-big">${N(S.prCount)}</div><p class="pt-wr-unit">record${S.prCount === 1 ? "" : "s"}</p>${names ? `<ul class="pt-wr-list">${names}${S.prNames.length > 3 ? `<li class="pt-wr-dim">and ${S.prNames.length - 3} more</li>` : ""}</ul>` : ""}${imp}` });
    }
    if (D.topEx) out.push({ k: "lift", tone: "solid", html: `<p class="pt-wr-kick">Your go-to lift</p><h2 class="pt-wr-name">${esc(D.topEx)}</h2><p class="pt-wr-unit">${S.exSets[D.topEx]} sets</p>${D.mus ? `<p class="pt-wr-line">Most worked: <b>${esc(D.mus)}</b>, ${S.muscles[D.mus]} sets.</p>` : ""}` });
    if (D.style) out.push({ k: "style", tone: "dark", html: `<p class="pt-wr-kick">Your training style</p><div class="pt-wr-ico" aria-hidden="true">${D.style.ico}</div><h2 class="pt-wr-name">${esc(D.style.name)}</h2><p class="pt-wr-line">Most workouts started around ${esc(D.style.at)}.</p>${D.topDay ? `<p class="pt-wr-line">Favourite day: <b>${esc(D.topDay.name)}</b> (${D.topDay.n}).</p>` : ""}${D.longest >= 600 ? `<p class="pt-wr-line pt-wr-dim">Longest workout: ${esc(hm(D.longest))}.</p>` : ""}` });
    if (D.wins.length || D.bdmg > 0) {
      const names = D.wins.length ? `<p class="pt-wr-line">${D.wins.slice(0, 4).map(esc).join(", ")}${D.wins.length > 4 ? " and more" : ""}.</p>` : "";
      const bat = D.bdmg > 0 ? `<p class="pt-wr-line">In the battle you added <b>${fmtInt(D.bdmg)}</b> damage${D.crits ? `, with ${fmtInt(D.crits)} perfect hit${D.crits === 1 ? "" : "s"}` : ""}.</p>` : "";
      out.push({ k: "boss", tone: "red", html: `<p class="pt-wr-kick">Boss fights</p><div class="pt-wr-big">${N(D.wins.length)}</div><p class="pt-wr-unit">boss${D.wins.length === 1 ? "" : "es"} beaten with the group</p>${names}${bat}` });
    }
    if (D.nChests) {
      const chips = [["legendary", "Legendary"], ["epic", "Epic"], ["rare", "Rare"], ["common", "Common"]].filter(([k]) => D.chests[k]).map(([k, l]) => `<span class="pt-wr-chip" data-t="${k}">${D.chests[k]} ${l}</span>`).join("");
      out.push({ k: "loot", tone: "dark", html: `<p class="pt-wr-kick">Loot</p><div class="pt-wr-ico" aria-hidden="true">🎁</div><div class="pt-wr-big">${N(D.nChests)}</div><p class="pt-wr-unit">chest${D.nChests === 1 ? "" : "s"} earned</p><div class="pt-wr-chips">${chips}</div>` });
    }
    if (D.group) {
      const rows = D.group.rows.slice(0, 4).map(r => `<li class="${r.me ? "me" : ""}"><span>${esc(r.me ? r.n + " (you)" : r.n)}</span><b>${r.d} day${r.d === 1 ? "" : "s"}${r.crowns ? " · 👑" + (r.crowns > 1 ? "×" + r.crowns : "") : ""}</b></li>`).join("");
      out.push({ k: "group", tone: "glow", html: `<p class="pt-wr-kick">Your group</p><div class="pt-wr-big">${N(D.group.days)}</div><p class="pt-wr-unit">days trained together</p><ul class="pt-wr-rows">${rows}</ul>${D.group.rows.some(r => r.crowns) ? `<p class="pt-wr-line pt-wr-dim">👑 = won the week on the group board.</p>` : ""}` });
    }
    const tile = (l, v) => `<div><i>${l}</i><b>${v}</b></div>`;
    out.push({ k: "sum", tone: "solid", end: true, html: `<p class="pt-wr-kick">${M} in one look</p><div class="pt-wr-grid">${tile("Workouts", S.workouts)}${tile("Days", S.days)}${tile("Records", S.prCount)}${tile("Goal weeks", D.goalOf ? D.goalHit + "/" + D.goalOf : "–")}${tile("Moved", fmtInt(S.vol) + " " + esc(u))}${tile("Time", esc(hm(S.dur)))}</div>${D.topEx ? `<p class="pt-wr-line">Go-to lift: <b>${esc(D.topEx)}</b></p>` : ""}${D.style ? `<p class="pt-wr-line">${D.style.ico} ${esc(D.style.name)}</p>` : ""}<div class="pt-wr-acts"><button type="button" id="pt-wr-share" class="tap-active">Share picture</button><button type="button" id="pt-wr-done" class="tap-active">Done</button></div>` });
    return out;
  }

  /* ============================================================== the player */
  let P = null;
  const reduced = () => { try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } };
  function countUp(root) {
    root.querySelectorAll(".pt-wr-n").forEach(el => {
      const to = num(el.dataset.to), dec = el.dataset.k === "dec", f = v => dec ? PT.num(v, 1) : fmtInt(v);
      if (reduced() || to <= 0) { el.textContent = f(to); return; }
      const t0 = performance.now(), dur = 900;
      const step = now => { if (!el.isConnected) return; const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3); el.textContent = f(dec ? to * e : Math.round(to * e)); if (p < 1) requestAnimationFrame(step); };
      el.textContent = f(0); requestAnimationFrame(step);
    });
  }
  function show(i) {
    if (!P) return;
    if (i < 0) i = 0;
    if (i >= P.list.length) { close(); return; }
    P.i = i;
    const s = P.list[i], el = P.el;
    el.dataset.tone = s.tone; el.dataset.k = s.k;
    const st = el.querySelector(".pt-wr-stage");
    st.innerHTML = `<div class="pt-wr-slide">${s.html}</div>`;
    el.querySelectorAll(".pt-wr-bars > i").forEach((b, j) => { b.className = j < i ? "done" : j === i ? (s.end ? "done" : "now") : ""; const f = b.firstChild; f.style.animation = "none"; void f.offsetWidth; f.style.animation = ""; });
    el.classList.toggle("paused", false);
    countUp(st);
  }
  function close() {
    if (!P) return;
    const el = P.el; P = null;
    document.removeEventListener("keydown", onKey, true);
    el.classList.add("out"); setTimeout(() => el.remove(), 220);
    try { document.body.classList.remove("pt-wr-open"); } catch (e) { }
  }
  function onKey(e) {
    if (!P) return;
    if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(); }
    else if (e.key === "ArrowRight") { e.preventDefault(); show(P.i + 1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); show(P.i - 1); }
    else if (e.key === " ") { e.preventDefault(); P.el.classList.toggle("paused"); }
  }
  function open(a, m0) {
    a = a || A(); m0 = m0 || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const D = data(a, m0);
    if (!D) { a.toast("No workouts saved in " + m0.toLocaleDateString(undefined, { month: "long" }) + " yet"); return false; }
    if (P) close();
    const list = slides(D), el = document.createElement("div");
    el.id = "pt-wr"; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-label", D.monthName + " Wrapped");
    el.innerHTML = `<div class="pt-wr-bars" aria-hidden="true">${list.map(() => "<i><b></b></i>").join("")}</div>
      <button type="button" class="pt-wr-x tap-active" aria-label="Close">✕</button>
      <div class="pt-wr-stage" aria-live="polite"></div>`;
    document.body.appendChild(el); document.body.classList.add("pt-wr-open");
    P = { el, list, i: 0, D, down: 0 };
    el.style.setProperty("--pt-wr-per", PER + "ms");
    el.addEventListener("animationend", e => { if (P && e.animationName === "pt-wr-bar" && e.target.parentElement && e.target.parentElement.classList.contains("now")) show(P.i + 1); });
    el.querySelector(".pt-wr-x").addEventListener("click", e => { e.stopPropagation(); close(); });
    el.addEventListener("pointerdown", e => {
      if (!P || e.target.closest("button")) return;
      P.down = Date.now(); P.hold = setTimeout(() => { if (P) P.el.classList.add("paused"); }, 220);
    });
    const up = e => {
      if (!P || !P.down) return;
      clearTimeout(P.hold); const held = Date.now() - P.down; P.down = 0;
      if (held >= 220) { P.el.classList.remove("paused"); return; }
      if (e.target.closest && e.target.closest("button")) return;
      const r = P.el.getBoundingClientRect();
      show(e.clientX - r.left < r.width * 0.3 ? P.i - 1 : P.i + 1);
    };
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", () => { if (P) { clearTimeout(P.hold); P.down = 0; P.el.classList.remove("paused"); } });
    el.addEventListener("click", async e => {
      if (e.target.closest("#pt-wr-done")) { close(); return; }
      const sh = e.target.closest("#pt-wr-share");
      if (sh && P) { sh.disabled = true; try { const f = await picture(a, P.D); await a.shareFile(f, "My " + P.D.monthName + " Wrapped"); } catch (err) { a.toast("Could not make the picture"); } sh.disabled = false; }
    });
    document.addEventListener("keydown", onKey, true);
    show(0);
    setTimeout(() => { try { el.querySelector(".pt-wr-x").focus({ preventScroll: true }); } catch (e) { } }, 50);
    return true;
  }

  /* ============================================================== the share picture */
  async function picture(a, D) {
    const S = D.S, W = 1080, H = 1920, c = document.createElement("canvas"); c.width = W; c.height = H;
    const g = c.getContext("2d"), acc = PT.accent(), u = D.u;
    const font = (w, s) => `${w} ${s}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;
    const fit = (t, max, w, s) => { g.font = font(w, s); while (g.measureText(t).width > max && s > 20) { s -= 2; g.font = font(w, s); } };
    g.fillStyle = "#09090b"; g.fillRect(0, 0, W, H);
    const rg = g.createRadialGradient(W * 0.85, 120, 40, W * 0.85, 120, 1100); rg.addColorStop(0, PT.accent(0.55)); rg.addColorStop(1, "rgba(9,9,11,0)");
    g.fillStyle = rg; g.fillRect(0, 0, W, H);
    g.textBaseline = "alphabetic"; g.fillStyle = acc; g.font = font(900, 40); g.fillText("PULSETRACK WRAPPED", 90, 150);
    g.fillStyle = "#fff"; fit(D.monthName, W - 180, 900, 190); g.fillText(D.monthName, 82, 340);
    g.fillStyle = "#a1a1aa"; g.font = font(600, 40); g.fillText(String(D.m0.getFullYear()) + (D.done ? "" : ", so far"), 90, 410);
    const tiles = [["Workouts", String(S.workouts)], ["Days", String(S.days)], ["Records", String(S.prCount)], ["Goal weeks", D.goalOf ? D.goalHit + "/" + D.goalOf : "–"], ["Moved", fmtInt(S.vol) + " " + u], ["Time", hm(S.dur)]];
    tiles.forEach(([k, v], i) => {
      const x = 90 + (i % 2) * 460, y = 500 + Math.floor(i / 2) * 250;
      g.fillStyle = "rgba(255,255,255,0.06)"; if (g.roundRect) { g.beginPath(); g.roundRect(x, y, 440, 220, 32); g.fill(); } else g.fillRect(x, y, 440, 220);
      g.fillStyle = "#a1a1aa"; g.font = font(700, 34); g.fillText(k, x + 36, y + 66);
      g.fillStyle = i === 2 ? "#fbbf24" : "#fff"; fit(v, 370, 900, 92); g.fillText(v, x + 36, y + 172);
    });
    let y = 1290;
    const line = (label, value, col) => { g.fillStyle = "#a1a1aa"; g.font = font(700, 34); g.fillText(label, 90, y); g.fillStyle = col || "#fff"; fit(value, W - 180, 800, 58); g.fillText(value, 90, y + 70); y += 150; };
    if (D.topEx) line("Go-to lift", D.topEx);
    if (S.improved) line("Biggest jump", S.improved.name + "  +" + PT.num(S.improved.gain * 100, 1) + "%", acc);
    if (D.style && y < H - 260) line("Training style", D.style.name);
    if ((D.wins.length || D.bdmg) && y < H - 260) line("Boss fights", D.wins.length + " beaten" + (D.bdmg ? " · " + fmtInt(D.bdmg) + " battle damage" : ""), "#f87171");
    g.fillStyle = "#52525b"; g.font = font(600, 32); g.fillText("Tracked with PulseTrack", 90, H - 90);
    const blob = await new Promise((res, rej) => c.toBlob(b => b ? res(b) : rej(new Error("toBlob")), "image/png"));
    return new File([blob], "pulsetrack-wrapped-" + keyOf(D.m0) + ".png", { type: "image/png" });
  }

  /* ============================================================== where it opens */
  const oBanner = proto.recapBanner;
  if (oBanner) proto.recapBanner = function () {
    const b = oBanner.apply(this, arguments);
    if (b && this._recapMonth) {
      const name = this._recapMonth.toLocaleDateString(undefined, { month: "long" }), S = this.monthStats(this._recapMonth);
      b.html = `<b class="text-white">Your ${esc(name)} Wrapped is ready 🎉</b> ${S.workouts} workout${S.workouts === 1 ? "" : "s"}, your records, your style and more.`;
      b.action = "Play";
    }
    return b;
  };
  proto.openRecapFromBanner = function () {
    if (this._recapKey) { this.settings.recapSeen = this._recapKey; WorkoutStorage.saveSettings(this.settings); }
    open(this, this._recapMonth ? new Date(this._recapMonth) : null);
    try { this.renderHomeBanners(); } catch (e) { }
  };
  const oCard = proto.recapCardHtml;
  if (oCard) proto.recapCardHtml = function (m0) {
    let h = oCard.apply(this, arguments);
    try {
      if (h.indexOf('id="recap-share"') > 0) {
        const name = esc(m0.toLocaleDateString(undefined, { month: "long" }));
        h = h.replace('<button id="recap-share"', `<button type="button" id="pt-wr-play" data-m="${keyOf(m0)}" class="w-full py-3 rounded-xl text-xs font-bold tap-active">▶ Play ${name} Wrapped</button><button id="recap-share"`);
      }
    } catch (e) { }
    return h;
  };
  document.addEventListener("click", e => {
    const b = e.target.closest && e.target.closest("#pt-wr-play"); if (!b) return;
    open(A(), fromKey(b.dataset.m));
  });

  PT.wrapped = { open: (m0, a) => open(a || A(), m0), close, data: (m0, a) => data(a || A(), m0), slides: (m0, a) => { const D = data(a || A(), m0); return D ? slides(D) : []; }, picture: (m0, a) => picture(a || A(), data(a || A(), m0)), at: () => (P ? P.i : -1), next: () => P && show(P.i + 1), prev: () => P && show(P.i - 1) };

  /* ============================================================== the look */
  const css = document.createElement("style"); css.id = "pt-v291w-css";
  css.textContent = `
    body.pt-wr-open { overflow: hidden; }
    #pt-wr { position: fixed; inset: 0; z-index: 9800; display: flex; flex-direction: column; color: #fff; background: rgb(var(--z950)); touch-action: manipulation; user-select: none; -webkit-user-select: none;
      animation: pt-wr-in .22s ease-out; padding: env(safe-area-inset-top) 0 env(safe-area-inset-bottom); }
    #pt-wr.out { opacity: 0; transition: opacity .2s; }
    @keyframes pt-wr-in { from { opacity: 0; transform: scale(.98); } }
    #pt-wr[data-tone="glow"] { background: radial-gradient(120% 70% at 85% 0%, rgb(var(--a500) / .55), transparent 60%), rgb(var(--z950)); }
    #pt-wr[data-tone="solid"] { background: linear-gradient(160deg, rgb(var(--a600)), rgb(var(--a800, var(--a700)))); }
    #pt-wr[data-tone="dark"] { background: linear-gradient(180deg, rgb(var(--z900)), rgb(var(--z950))); }
    #pt-wr[data-tone="gold"] { background: radial-gradient(110% 60% at 15% 100%, rgb(245 158 11 / .55), transparent 65%), #1c1408; }
    #pt-wr[data-tone="red"] { background: radial-gradient(110% 60% at 50% 0%, rgb(220 38 38 / .55), transparent 65%), #160909; }
    .pt-wr-bars { display: flex; gap: 4px; padding: 12px 14px 0; }
    .pt-wr-bars > i { flex: 1 1 0; height: 3px; border-radius: 3px; background: rgb(255 255 255 / .25); overflow: hidden; }
    .pt-wr-bars > i > b { display: block; height: 100%; width: 0; background: #fff; }
    .pt-wr-bars > i.done > b { width: 100%; }
    .pt-wr-bars > i.now > b { animation: pt-wr-bar var(--pt-wr-per) linear forwards; }
    #pt-wr.paused .pt-wr-bars > i.now > b { animation-play-state: paused; }
    @keyframes pt-wr-bar { to { width: 100%; } }
    .pt-wr-x { position: absolute; top: calc(env(safe-area-inset-top) + 24px); right: 12px; width: 40px; height: 40px; border-radius: 999px; background: rgb(0 0 0 / .25); color: #fff; font-size: 1rem; z-index: 2; }
    .pt-wr-stage { flex: 1 1 auto; display: flex; align-items: center; justify-content: center; padding: 56px 28px 40px; overflow: hidden; }
    .pt-wr-slide { width: 100%; max-width: 26rem; animation: pt-wr-up .45s cubic-bezier(.2,.8,.2,1); }
    @keyframes pt-wr-up { from { opacity: 0; transform: translateY(14px); } }
    @media (prefers-reduced-motion: reduce) { .pt-wr-slide, #pt-wr { animation: none; } }
    .pt-wr-kick { font-size: .95rem; font-weight: 700; color: rgb(255 255 255 / .75); margin-bottom: .6rem; }
    .pt-wr-month { font-size: clamp(3.4rem, 17vw, 5.6rem); font-weight: 900; line-height: .92; letter-spacing: -.04em; word-break: break-word; }
    .pt-wr-sub { font-size: 1.15rem; font-weight: 600; margin-top: .9rem; color: rgb(255 255 255 / .9); }
    .pt-wr-hint { font-size: .78rem; color: rgb(255 255 255 / .55); margin-top: 2.5rem; }
    .pt-wr-big { font-size: clamp(4.6rem, 26vw, 8rem); font-weight: 900; line-height: .9; letter-spacing: -.05em; font-variant-numeric: tabular-nums; }
    .pt-wr-big small { font-size: .38em; letter-spacing: -.02em; color: rgb(255 255 255 / .7); }
    .pt-wr-unit { font-size: 1.3rem; font-weight: 800; margin-top: .35rem; }
    .pt-wr-name { font-size: clamp(2.2rem, 11vw, 3.4rem); font-weight: 900; line-height: 1; letter-spacing: -.03em; word-break: break-word; }
    .pt-wr-ico { font-size: 3.2rem; line-height: 1; margin-bottom: .6rem; }
    .pt-wr-line { font-size: 1rem; line-height: 1.45; margin-top: .8rem; color: rgb(255 255 255 / .92); }
    .pt-wr-line b { font-weight: 800; }
    .pt-wr-dim { color: rgb(255 255 255 / .6) !important; }
    .pt-wr-list { margin-top: 1rem; font-size: 1rem; font-weight: 700; line-height: 1.8; }
    .pt-wr-wks { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 1.2rem; }
    .pt-wr-wk { display: flex; flex-direction: column; align-items: center; min-width: 3.4rem; padding: .45rem .35rem; border-radius: .8rem; background: rgb(255 255 255 / .08); border: 1px solid rgb(255 255 255 / .12); }
    .pt-wr-wk b { font-size: .95rem; font-weight: 900; }
    .pt-wr-wk i { font-style: normal; font-size: .62rem; color: rgb(255 255 255 / .6); }
    .pt-wr-wk.on { background: rgb(var(--a500)); border-color: transparent; }
    .pt-wr-wk.on i { color: rgb(255 255 255 / .85); }
    .pt-wr-wk.cur { border-style: dashed; }
    .pt-wr-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 1rem; }
    .pt-wr-chip { padding: .35rem .7rem; border-radius: 999px; font-size: .85rem; font-weight: 800; background: rgb(255 255 255 / .1); }
    .pt-wr-chip[data-t="rare"] { color: #7dd3fc; } .pt-wr-chip[data-t="epic"] { color: #d8b4fe; } .pt-wr-chip[data-t="legendary"] { color: #fcd34d; }
    .pt-wr-rows { margin-top: 1.1rem; display: grid; gap: 6px; }
    .pt-wr-rows li { display: flex; justify-content: space-between; gap: .75rem; padding: .55rem .8rem; border-radius: .8rem; background: rgb(255 255 255 / .08); font-size: .95rem; }
    .pt-wr-rows li span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 600; }
    .pt-wr-rows li b { flex: none; font-weight: 800; }
    .pt-wr-rows li.me { background: rgb(255 255 255 / .18); }
    .pt-wr-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .pt-wr-grid > div { padding: .7rem .8rem; border-radius: .9rem; background: rgb(0 0 0 / .22); min-width: 0; }
    .pt-wr-grid i { display: block; font-style: normal; font-size: .72rem; font-weight: 700; color: rgb(255 255 255 / .7); }
    .pt-wr-grid b { display: block; font-size: 1.35rem; font-weight: 900; letter-spacing: -.02em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .pt-wr-acts { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 1.4rem; }
    .pt-wr-acts button { padding: .85rem; border-radius: .9rem; font-size: .9rem; font-weight: 800; }
    #pt-wr-share { background: #fff; color: rgb(var(--a600)); }
    #pt-wr-done { background: rgb(0 0 0 / .25); color: #fff; }
    #pt-wr-play { background: rgb(var(--a500) / .14); border: 1px solid rgb(var(--a500) / .5); color: rgb(var(--a300)); }
    @media (min-width: 640px) { #pt-wr { left: calc(50% - 220px); right: auto; width: 440px; box-shadow: 0 0 0 100vmax rgb(0 0 0 / .7); } }
  `;
  document.head.appendChild(css);
})();
