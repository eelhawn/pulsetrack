
/* =====================================================================
 * PulseTrack 2.32.0 (D2): in-app nudges, coach messages and the monthly report card.
 * Everything is computed on the phone from your own history. Nothing is sent anywhere.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined" || !PT.rewards || !PT.weeksOf) return;
  const proto = ApplicationUI.prototype;
  const A = () => window.app;
  const $ = id => document.getElementById(id);
  const esc = s => PT.esc(s);
  const DAY = 86400000, LB = 2.2046226;
  const save = () => { try { WorkoutStorage.saveSettings(A().settings); } catch (e) { } };
  const S = a => a.sessions || [];
  const toLb = (v, from) => (from === "kg" ? v * LB : v);
  const fmt = v => Math.round(v).toLocaleString();
  const V = lb => fmt(A().unit() === "kg" ? lb / LB : lb) + (A().unit() === "kg" ? " kg" : " lb");
  const mondayOf = t => { const d = new Date(t); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d.getTime(); };
  const sessTime = s => s.ts || (PT.fromDs && PT.fromDs(s.date) ? PT.fromDs(s.date).getTime() : 0);
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const seedPick = (arr, salt) => { const d = new Date(); const k = (d.getFullYear() * 400 + d.getMonth() * 31 + d.getDate() + (salt || 0)) % arr.length; return arr[k]; };

  /* ============================================================== helpers */
  function bestE1 (a, s) { const m = {}; (s.ex || []).forEach(e => { let b = 0; (e.sets || []).forEach(st => { if (st.t !== "W") b = Math.max(b, toLb(a.setE1rm(e.name, st, s.date) || 0, s.unit)); }); if (b > 0) m[e.name] = b; }); return m; }
  function daysIdle(a) { const l = S(a).reduce((m, s) => Math.max(m, sessTime(s)), 0); return l ? Math.floor((Date.now() - l) / DAY) : null; }
  function monthStart(y, m) { return new Date(y, m, 1).getTime(); }

  /* ============================================================== monthly report card */
  const LETTERS = [[97, "A+"], [93, "A"], [90, "A-"], [87, "B+"], [83, "B"], [80, "B-"], [77, "C+"], [73, "C"], [70, "C-"], [67, "D+"], [63, "D"], [60, "D-"], [0, "F"]];
  const letter = sc => (LETTERS.find(x => sc >= x[0]) || LETTERS[LETTERS.length - 1])[1];
  const colorOf = sc => (sc >= 90 ? "#34d399" : sc >= 80 ? "#a3e635" : sc >= 70 ? "#fbbf24" : sc >= 60 ? "#fb923c" : "#f87171");
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  /** grade one month. y, m = year and 0-based month */
  function grade(a, y, m) {
    const t0 = monthStart(y, m), t1 = monthStart(y, m + 1), now = Date.now(), end = Math.min(t1, now), elapsed = Math.max(1, (end - t0) / DAY);
    const inM = S(a).filter(s => { const t = sessTime(s); return t >= t0 && t < t1; });
    const out = { y, m, id: y + "-" + (m + 1), name: MONTHS[m], workouts: inM.length, days: new Set(inM.map(s => s.date)).size, vol: 0, prs: 0, sets: 0 };
    inM.forEach(s => { out.vol += toLb(s.vol || 0, s.unit); out.prs += (s.prs || []).length; out.sets += s.sets || 0; });
    // consistency: weekly goals hit (complete weeks that start in the month) and days vs plan
    const W = PT.weeksOf(a), weeks = []; for (let w = mondayOf(t0); w < t1; w += 7 * DAY) { if (w + 7 * DAY <= t0) continue; if (w + 7 * DAY <= now || (w <= now && out.workouts)) weeks.push(w); }
    const done = weeks.filter(w => w + 7 * DAY <= now || (w <= now)); let hit = 0; done.forEach(w => { const o = W.get(w); if (o && o.days.size >= PT.goalFor(a, w)) hit++; });
    const goal = PT.goalFor(a, mondayOf(Math.min(end, now)));
    const frac = done.length ? hit / done.length : 0, planned = Math.max(1, elapsed * goal / 7), dayFrac = Math.min(1, out.days / planned);
    out.cons = out.workouts || done.length ? Math.round(100 * (0.7 * frac + 0.3 * dayFrac)) : null; out.hit = hit; out.weeks = done.length; out.goal = goal;
    // strength: best e1RM this month vs before
    const before = {}; S(a).forEach(s => { if (sessTime(s) >= t0) return; const b = bestE1(a, s); Object.keys(b).forEach(k => { before[k] = Math.max(before[k] || 0, b[k]); }); });
    const mine = {}; inM.forEach(s => { const b = bestE1(a, s); Object.keys(b).forEach(k => { mine[k] = Math.max(mine[k] || 0, b[k]); }); });
    const gains = []; Object.keys(mine).forEach(k => { if (before[k] > 0) gains.push({ n: k, g: 100 * (mine[k] / before[k] - 1), now: mine[k] }); });
    gains.sort((x, y) => y.g - x.g); out.best = gains[0] || null;
    const avg = gains.length ? gains.reduce((n, x) => n + x.g, 0) / gains.length : null;
    out.str = avg === null && !out.prs ? null : Math.round(clamp(50 + 10 * (avg || 0) + 8 * out.prs, 0, 100));
    // volume vs the month before
    const p0 = monthStart(m ? y : y - 1, m ? m - 1 : 11); let pv = 0, pw = 0; S(a).forEach(s => { const t = sessTime(s); if (t >= p0 && t < t0) { pv += toLb(s.vol || 0, s.unit); pw++; } }); out.pvol = pv;
    const adj = (t1 > now) ? (now - t0) / (t1 - t0) : 1; // compare pace if the month is not finished
    out.vol_s = !out.workouts ? null : pv > 0 ? Math.round(clamp(80 + 100 * (out.vol / (pv * adj) - 1), 30, 100)) : 85;
    const parts = [["Consistency", out.cons, 0.4], ["Strength", out.str, 0.3], ["Volume", out.vol_s, 0.3]].filter(p => p[1] !== null);
    out.parts = parts; const wsum = parts.reduce((n, p) => n + p[2], 0);
    out.score = parts.length && out.workouts ? Math.round(parts.reduce((n, p) => n + p[1] * p[2], 0) / wsum) : null; out.letter = out.score === null ? "-" : letter(out.score);
    const low = parts.slice().sort((x, y) => x[1] - y[1])[0];
    out.focus = out.score === null ? "Log a few workouts and your first grade shows up here." : low[0] === "Consistency" ? `Next month: aim for ${goal} training days every week. Consistency is where the grade is lowest.` : low[0] === "Strength" ? "Next month: push one main lift for a new best. Add a little weight or a rep to your top set." : "Next month: add a set or two to your main exercises to bring weekly volume up.";
    out.partial = t1 > now;
    return out;
  }
  PT.monthGrade = grade;
  const prevMonth = (y, m) => (m ? [y, m - 1] : [y - 1, 11]);
  function history(a) { const n = new Date(), out = []; let y = n.getFullYear(), m = n.getMonth(); for (let i = 0; i < 6; i++) { const g = grade(a, y, m); if (i === 0 || g.workouts) out.push(g); [y, m] = prevMonth(y, m); } return out; }

  function gradeHtml(a) {
    const sel = a.__reportSel || 0, hs = history(a), g = hs[sel] || hs[0];
    const tabs = hs.length > 1 ? `<div class="flex flex-wrap gap-1.5">${hs.map((x, i) => `<button type="button" data-rep="${i}" aria-pressed="${i === sel}" class="pt-opt tap-active">${esc(x.name.slice(0, 3))}${x.partial ? " (so far)" : ""} · ${esc(x.letter)}</button>`).join("")}</div>` : "";
    if (g.score === null) return `${tabs}<p class="text-[11px] text-zinc-400 leading-snug">${esc(g.focus)}</p>`;
    const c = colorOf(g.score);
    return `${tabs}<div class="pt-grade"><div class="pt-grade-l" style="border-color:${c};color:${c}">${esc(g.letter)}</div><div class="min-w-0"><span class="block text-sm font-black text-white">${esc(g.name)} ${g.y}${g.partial ? " so far" : ""}</span><span class="block text-[11px] text-zinc-400">${g.workouts} workout${g.workouts === 1 ? "" : "s"} · ${g.days} day${g.days === 1 ? "" : "s"} · ${esc(V(g.vol))}${g.prs ? " · " + g.prs + " PR" + (g.prs === 1 ? "" : "s") : ""}</span></div></div>
      <div class="space-y-1.5">${g.parts.map(p => `<div class="space-y-1"><div class="flex items-center justify-between text-xs"><span class="text-zinc-300">${p[0]}</span><span class="font-black" style="color:${colorOf(p[1])}">${letter(p[1])} · ${p[1]}</span></div><div class="pt-bar"><span style="width:${p[1]}%;background:${colorOf(p[1])}"></span></div></div>`).join("")}</div>
      ${g.weeks ? `<p class="text-[11px] text-zinc-400">Weekly goal hit ${g.hit} of ${g.weeks} week${g.weeks === 1 ? "" : "s"}.</p>` : ""}${g.best ? `<p class="text-[11px] text-zinc-400">Biggest lift gain: <b class="text-white">${esc(g.best.n)}</b> ${g.best.g >= 0 ? "+" : ""}${g.best.g.toFixed(1)}%.</p>` : ""}
      <p class="text-xs text-zinc-300 leading-snug">🎯 ${esc(g.focus)}</p><button type="button" class="pt-b go" id="pt-rep-share" data-i="${sel}">Share my report card</button>`;
  }
  async function shareGrade(i) {
    const a = A(), g = history(a)[i] || history(a)[0]; if (!g || g.score === null) return; const c = colorOf(g.score);
    await PT.shareCard({ icon: g.letter, kicker: g.name + " report card", title: "Grade " + g.letter, sub: g.focus.replace(/^Next month: /, ""), lines: g.parts.map(p => [p[0], letter(p[1]) + " · " + p[1]]).concat([["Workouts", String(g.workouts)]]), c: [c, "#d97706"] });
  }

  /* ============================================================== coach messages */
  function coach(a) {
    const out = [], now = Date.now(), st = PT.rewards(a), idle = daysIdle(a);
    if (!S(a).length) return "Your first workout sets the baseline. Everything after it is progress you can see.";
    // biggest e1RM gain over the last 28 days
    const t28 = now - 28 * DAY, before = {}, recent = {};
    S(a).forEach(s => { const b = bestE1(a, s), t = sessTime(s); Object.keys(b).forEach(k => { const tgt = t < t28 ? before : recent; tgt[k] = Math.max(tgt[k] || 0, b[k]); }); });
    let g = null; Object.keys(recent).forEach(k => { if (before[k] > 0) { const p = 100 * (recent[k] / before[k] - 1); if (p > 0.5 && (!g || p > g.p)) g = { k, p }; } });
    if (g) out.push(`Your ${g.k} is up ${g.p.toFixed(1)}% in the last four weeks. That is real progress.`);
    const w = PT.weeksOf(a), mon = mondayOf(now); let vNow = 0, vOld = 0; for (let i = 0; i < 4; i++) { vNow += (w.get(mon - i * 7 * DAY) || { v: 0 }).v; vOld += (w.get(mon - (i + 4) * 7 * DAY) || { v: 0 }).v; }
    if (vOld > 0 && vNow > vOld * 1.05) out.push(`You lifted ${Math.round(100 * (vNow / vOld - 1))}% more than the four weeks before. Keep stacking it.`);
    if (st.streak.cur >= 2) out.push(`${st.streak.cur} weeks in a row hitting your goal. Do not break the chain.`);
    const monthPrs = S(a).filter(s => new Date(sessTime(s)).getMonth() === new Date().getMonth() && sessTime(s) > now - 31 * DAY).reduce((n, s) => n + (s.prs || []).length, 0);
    if (monthPrs >= 2) out.push(`${monthPrs} personal records this month. You are getting stronger.`);
    if (st.lv && st.lv.span - st.lv.into <= 250) out.push(`${fmt(Math.max(0, st.lv.span - st.lv.into))} XP to Level ${st.lv.L + 1}. One good session might do it.`);
    if (idle !== null && idle >= 6) out.push("Welcome back. A short session today restarts the habit. Do not worry about the numbers.");
    out.push("Slow reps, full range, and write it down. That is the whole secret.", "Sleep and protein are half the work. Eat up and rest well tonight.", "Showing up on a bad day is worth more than a great day you skipped.");
    return seedPick(out, S(a).length);
  }
  PT.coach = coach;

  /* ============================================================== nudges */
  function snoozed(a, id) { const m = a.settings.nudgeSnooze || {}; return m[id] && Date.now() - m[id] < DAY; }
  function nudges(a) {
    const out = [], now = Date.now(), idle = daysIdle(a), dow = new Date().getDay(), hasAny = S(a).length > 0;
    // new month report
    const d = new Date(); if (d.getDate() <= 5 && hasAny) { const [py, pm] = prevMonth(d.getFullYear(), d.getMonth()), g = grade(a, py, pm), id = "rep" + g.id; if (g.workouts && a.settings.reportSeen !== g.id) out.push({ id, icon: "📋", text: `Your ${g.name} report card is ready: ${g.letter}`, act: "report", cta: "See it" }); }
    // challenge ending soon
    try { const c = a.settings.challenge; if (c && c.end && c.end > now && c.end - now <= 3 * DAY && PT.challengeProgress) { const p = PT.challengeProgress(a); if (p && !c.done && p.cur < p.goal) out.push({ id: "chal" + c.id, icon: "⚔️", text: `${Math.max(1, Math.ceil((c.end - now) / DAY))} day${(c.end - now) > DAY ? "s" : ""} left on your challenge`, act: "progress", cta: "Check it" }); } } catch (e) { }
    // one workout from the goal
    const W = PT.weeksOf(a), mon = mondayOf(now), cur = W.get(mon), goal = PT.goalFor(a, mon), got = cur ? cur.days.size : 0;
    if (got > 0 && got === goal - 1) out.push({ id: "goal" + mon, icon: "🎯", text: "One more workout and you hit your weekly goal", act: "start", cta: "Train" });
    // streak at risk on the weekend
    if (got < goal && (dow === 6 || dow === 0) && PT.rewards(a).streak.cur >= 2) out.push({ id: "risk" + mon, icon: "🔥", text: `Your ${PT.rewards(a).streak.cur} week streak needs ${goal - got} more workout${goal - got === 1 ? "" : "s"} by Sunday`, act: "start", cta: "Train" });
    // neglected muscle
    try { const recent = a.regionSetsBetween(now - 9 * DAY, now), prior = a.regionSetsBetween(now - 37 * DAY, now - 9 * DAY), lag = Object.keys(prior).filter(k => prior[k] >= 6 && !(recent[k] > 0)); if (lag.length) { const r = lag[0]; out.push({ id: "reg" + r + mon, icon: "🗺", text: `You have not trained ${r.toLowerCase()} in over a week`, act: "region", cta: "Train it", region: r }); } } catch (e) { }
    // photo due
    try { const age = PT.photoAgeDays && PT.photoAgeDays(); if (age !== null && age >= 7 && hasAny) out.push({ id: "photo" + mon, icon: "📸", text: `It has been ${age} days since your last progress photo`, act: "photo", cta: "Take one" }); } catch (e) { }
    // comeback
    if (idle !== null && idle >= 7) out.push({ id: "back" + Math.floor(now / DAY / 3), icon: "👋", text: `${idle} days since your last workout. A short one restarts the habit`, act: "start", cta: "Train" });
    return out.filter(n => !snoozed(a, n.id));
  }
  PT.nudges = nudges;
  function drawNudge(a) {
    const box = $("pt-home-extra"), you = $("pt-you-card"); if (!box || !you) return; let n = $("pt-nudge");
    const list = nudges(a), it = list[0], line = it ? it : (S(a).length ? { id: "coach" + PT.ds(), icon: "💬", text: coach(a), act: "", cta: "" } : null);
    if (!line || (!it && snoozed(a, line.id))) { if (n) n.remove(); return; }
    if (!n) { n = document.createElement("div"); n.id = "pt-nudge"; }
    n.dataset.id = line.id; n.dataset.act = line.act || ""; n.dataset.region = line.region || "";
    n.innerHTML = `<span class="pt-n-i">${line.icon}</span><span class="pt-n-t">${esc(line.text)}</span>${line.cta ? `<button type="button" class="pt-n-go tap-active" id="pt-nudge-go">${esc(line.cta)}</button>` : ""}<button type="button" class="pt-n-x tap-active" id="pt-nudge-x" aria-label="Dismiss">✕</button>`;
    const anchor = $("pt-checkin") || you; if (anchor.nextElementSibling !== n) anchor.insertAdjacentElement("afterend", n);
  }
  const oHome = proto.renderHomeView;
  proto.renderHomeView = function () { const r = oHome.apply(this, arguments); try { drawNudge(this); } catch (e) { console.error("PulseTrack nudge", e); } return r; };

  function act(a, n) {
    const what = n.dataset.act;
    if (what === "report") { a.settings.reportSeen = ((n.dataset.id || "").replace(/^rep/, "")); save(); a.__reportOpen = true; try { a.showView("progress"); } catch (e) { } setTimeout(() => { const d = $("pt-pg-month"); if (d) { d.open = true; d.scrollIntoView({ block: "start" }); } }, 150); }
    else if (what === "progress") { try { a.showView("progress"); } catch (e) { } }
    else if (what === "photo") { try { a.showView("body"); } catch (e) { } setTimeout(() => { const b = $("pt-cam-open") || document.querySelector("[data-cam]"); if (b) b.click(); }, 250); }
    else if (what === "region") { try { PT.openBuildWorkout({ focus: "custom", regions: [n.dataset.region] }); } catch (e) { try { a.showView("workout"); } catch (x) { } } }
    else if (what === "start") { try { a.showView("workout"); } catch (e) { } }
  }

  /* ============================================================== Progress section + finish line */
  const OPEN = {};
  function drawReport(a) {
    const root = $("progress-body"); if (!root) return; let box = $("pt-pg-rew5");
    if (!box) { box = document.createElement("div"); box.id = "pt-pg-rew5"; box.className = "space-y-3"; const prev = $("pt-pg-rew4") || $("pt-pg-rew3") || $("pt-pg-rew2") || $("pt-pg-rew"); if (prev && prev.parentNode === root) prev.insertAdjacentElement("afterend", box); else root.appendChild(box); }
    if (!S(a).length) { box.innerHTML = ""; return; }
    const g = history(a)[0];
    box.innerHTML = `<details class="pt-pg" id="pt-pg-month" ${OPEN.rep || a.__reportOpen ? "open" : ""}><summary><span class="text-xs font-bold text-white">📋 Monthly report card</span><span class="text-xs font-black" style="color:${g.score === null ? "#a1a1aa" : colorOf(g.score)}">${esc(g.letter)}</span><span class="pt-chev">›</span></summary><div id="pt-rep-body">${gradeHtml(a)}</div></details>`;
    a.__reportOpen = false; const d = $("pt-pg-month"); d.addEventListener("toggle", () => { OPEN.rep = d.open; });
  }
  const oPV = proto.renderProgressView;
  proto.renderProgressView = function () { const r = oPV.apply(this, arguments); try { drawReport(this); } catch (e) { console.error("PulseTrack report card", e); } return r; };

  function summaryLine(a) {
    const t = $("btn-summary-template"); if (!t || !t.parentElement || !a.lastSummary) return; let l = $("pt-coach-line");
    if (!l) { l = document.createElement("p"); l.id = "pt-coach-line"; t.parentElement.insertBefore(l, t.parentElement.firstChild); }
    l.textContent = "💬 " + coach(a);
  }
  const oFin = proto.finishWorkoutV2;
  proto.finishWorkoutV2 = async function () { const r = await oFin.apply(this, arguments); try { summaryLine(this); } catch (e) { } return r; };

  document.addEventListener("click", e => {
    const a = A(); if (!a || !e.target.closest) return;
    const t = id => e.target.closest("#" + id);
    if (t("pt-nudge-x")) { const n = $("pt-nudge"); const m = a.settings.nudgeSnooze && typeof a.settings.nudgeSnooze === "object" ? a.settings.nudgeSnooze : (a.settings.nudgeSnooze = {}); m[n.dataset.id] = Date.now(); const k = Object.keys(m); if (k.length > 40) k.sort((x, y) => m[x] - m[y]).slice(0, k.length - 40).forEach(x => delete m[x]); if (/^rep/.test(n.dataset.id)) a.settings.reportSeen = n.dataset.id.slice(3); save(); n.remove(); return; }
    if (t("pt-nudge-go")) { act(a, $("pt-nudge")); return; }
    const r = e.target.closest("[data-rep]"); if (r) { a.__reportSel = parseInt(r.dataset.rep, 10) || 0; OPEN.rep = true; const b = $("pt-rep-body"); if (b) b.innerHTML = gradeHtml(a); return; }
    if (t("pt-rep-share")) { shareGrade(parseInt(t("pt-rep-share").dataset.i, 10) || 0); }
  });

  const css = document.createElement("style"); css.id = "pt-v232e-css";
  css.textContent = `
    #pt-nudge { display: flex; align-items: center; gap: .55rem; width: 100%; margin-top: .5rem; padding: .55rem .6rem .55rem .8rem; border-radius: .9rem; background: rgb(var(--z900)); border: 1px solid rgb(var(--z800)); }
    #pt-nudge .pt-n-i { font-size: 1.1rem; flex: none; }
    #pt-nudge .pt-n-t { flex: 1 1 auto; min-width: 0; font-size: .75rem; line-height: 1.3; color: rgb(var(--z200)); font-weight: 600; }
    #pt-nudge .pt-n-go { flex: none; padding: .35rem .7rem; border-radius: .6rem; background: rgb(var(--a600)); color: #fff; font-size: .7rem; font-weight: 800; }
    #pt-nudge .pt-n-x { flex: none; padding: .25rem .4rem; color: rgb(var(--z500)); font-size: .75rem; }
    #pt-coach-line { text-align: center; font-size: .75rem; line-height: 1.35; color: rgb(var(--z300)); padding: 0 .5rem; }
    .pt-grade { display: flex; align-items: center; gap: .85rem; }
    .pt-grade-l { flex: none; width: 4rem; height: 4rem; border-radius: 1rem; border: 3px solid; display: flex; align-items: center; justify-content: center; font-size: 1.7rem; font-weight: 900; background: rgb(var(--z950)); }
    #pt-pg-month .pt-b { padding: .5rem .85rem; border-radius: .65rem; font-size: .75rem; font-weight: 700; background: rgb(var(--z800)); color: rgb(var(--z100)); }
    #pt-pg-month .pt-b.go { background: rgb(var(--a600)); color: #fff; }
  `;
  document.head.appendChild(css);
})();
  