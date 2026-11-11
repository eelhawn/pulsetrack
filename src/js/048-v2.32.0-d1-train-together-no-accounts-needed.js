
/* =====================================================================
 * PulseTrack 2.32.0 (D1): train together, no accounts needed.
 *  - Family challenge: pick one stat for the week, share a code, see the standings.
 *  - Buddies: send "I finished" results (with a link to do the same workout), see friends' workouts, send them a reaction.
 *  - Wall of fame: everyone's level, badges, streak and best lifts, with a 👑 for each lift.
 *  Everything travels as short codes you can paste into any chat.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined" || !PT.rewards) return;
  const proto = ApplicationUI.prototype;
  const A = () => window.app;
  const $ = id => document.getElementById(id);
  const esc = s => PT.esc(s);
  const DAY = 86400000, LB = 2.2046226;
  const save = () => { try { WorkoutStorage.saveSettings(A().settings); } catch (e) { } };
  const num = v => { const n = parseFloat(v); return isFinite(n) ? n : 0; };
  const fmt = v => Math.round(v).toLocaleString();
  const unitKg = () => A().unit() === "kg";
  const V = lb => fmt(unitKg() ? lb / LB : lb) + (unitKg() ? " kg" : " lb");
  const S = a => a.sessions || [];
  const toLb = (v, from) => (from === "kg" ? v * LB : v);
  const mondayOf = t => { const d = new Date(t); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d.getTime(); };
  const dsOf = t => PT.ds(new Date(t));
  const sessTime = s => s.ts || (PT.fromDs && PT.fromDs(s.date) ? PT.fromDs(s.date).getTime() : 0);
  const chip = (attr, label, on) => `<button type="button" ${attr} aria-pressed="${on}" class="pt-opt tap-active">${esc(label)}</button>`;
  const arr = (a, k) => (Array.isArray(a.settings[k]) ? a.settings[k] : []);
  const bar = p => `<div class="pt-bar"><span style="width:${Math.round(Math.max(0, Math.min(1, p)) * 100)}%"></span></div>`;

  /* ============================================================== codes */
  const enc = (tag, o) => tag + "." + btoa(unescape(encodeURIComponent(JSON.stringify(o))));
  const dec = tok => { try { const m = String(tok).match(/^(PT1|PTB1|PTC1|PTR1|PTW1)\.([A-Za-z0-9+/=_-]+)$/); if (!m) return null; return { tag: m[1], o: JSON.parse(decodeURIComponent(escape(atob(m[2])))) }; } catch (e) { return null; } };
  const clip = (s, n) => String(s == null ? "" : s).slice(0, n);
  const famTail = a => { try { return PT.famUpdateCode ? "\n" + PT.famUpdateCode(a) : ""; } catch (e) { return ""; } };
  const sent = () => { try { if (PT.famMarkSent) PT.famMarkSent(); } catch (e) { } };
  const myName = a => a.settings.myName || "";
  async function ensureName(a) {
    if (myName(a)) return myName(a);
    const v = await PT.prompt("What name should your friends see?", "", { title: "Your name", ok: "Save", maxlength: 24 });
    const n = clip(String(v || "").trim(), 24); if (!n) return ""; a.settings.myName = n; save(); return n;
  }
  /** take any pasted text (messages with several codes and links are fine). Returns what was added */
  function takeCodes(text, appArg) {
    const a = appArg || A(), got = { feed: 0, react: 0, wall: 0, chal: 0 }; const s = String(text || "");
    const link = (s.match(/https?:\/\/[^\s]*#day=[A-Za-z0-9_-]+/) || [])[0] || "";
    (s.match(/(?:PT1|PTB1|PTC1|PTR1|PTW1)\.[A-Za-z0-9+/=_-]+/g) || []).forEach(tok => {
      const d = dec(tok); if (!d || !d.o) return; const o = d.o;
      if (d.tag === "PTB1" && o.n && o.t) {
        const l = arr(a, "buddyFeed"), it = { n: clip(o.n, 24), d: clip(o.d, 10), t: clip(o.t, 60), v: num(o.v), m: num(o.m), s: num(o.s), p: num(o.p), link: link && link.length < 4000 ? link : "", ts: Date.now() };
        if (!l.some(x => x.n === it.n && x.d === it.d && x.t === it.t && x.v === it.v)) { l.push(it); a.settings.buddyFeed = l.slice(-40); got.feed++; }
      } else if (d.tag === "PTR1" && o.f && o.e) {
        const me = myName(a).toLowerCase(); if (o.to && me && String(o.to).toLowerCase() !== me) return;
        const l = arr(a, "reacts"); if (!l.some(x => x.f === o.f && x.d === o.d && x.t === o.t && x.e === o.e)) { l.push({ f: clip(o.f, 24), e: clip(o.e, 4), t: clip(o.t, 60), d: clip(o.d, 10), ts: Date.now() }); a.settings.reacts = l.slice(-40); got.react++; }
      } else if (d.tag === "PTW1" && o.n) {
        const w = a.settings.wall && typeof a.settings.wall === "object" ? a.settings.wall : (a.settings.wall = {}); w[clip(o.n, 24)] = { n: clip(o.n, 24), lv: num(o.lv), b: num(o.b), st: num(o.st), l: { bench: num(o.l && o.l.bench), squat: num(o.l && o.l.squat), dead: num(o.l && o.l.dead), ohp: num(o.l && o.l.ohp) }, ts: Date.now() }; got.wall++;
      } else if (d.tag === "PTC1" && o.s && o.w) {
        if (STATS[o.s]) { a.settings.famChal = { s: o.s, w: clip(o.w, 10), t: clip(o.t || STATS[o.s].label, 40) }; got.chal++; }
      }
    });
    if (got.feed || got.react || got.wall || got.chal) save();
    return got;
  }
  PT.takeCodes = takeCodes;
  // the existing family paste box understands every code too
  const baseAdd = PT.familyAdd;
  if (baseAdd) PT.familyAdd = function (text, appArg) {
    const n = baseAdd.apply(this, arguments), g = takeCodes(text, appArg), x = g.feed + g.react + g.wall + g.chal;
    if (x && !n) { const a = appArg || A(); a.toast(g.chal ? "Challenge added" : g.feed ? "Buddy workout added" : g.react ? "Reaction added" : "Added to the wall"); try { a.renderProgressView(); } catch (e) { } }
    return n + (x ? 0 : 0);
  };

  /* ============================================================== family challenge */
  const STATS = { k: { label: "Most workouts", unit: "workouts", f: x => String(x) }, v: { label: "Most volume", unit: "lifted", f: x => V(x) }, s: { label: "Most sets", unit: "sets", f: x => String(x) }, p: { label: "Most records", unit: "PRs", f: x => String(x) },
    sc: { label: "Highest score", unit: "points", f: x => x + " pts" }, cn: { label: "Best consistency", unit: "%", f: x => x + "%" } }; // 2.53.0: sc and cn are the fair contests (the board in m80a draws them)
  const thisWeekId = () => dsOf(mondayOf(Date.now()));
  function mine(a, weekT) { const w = PT.weeksOf(a).get(mondayOf(weekT)); return { k: w ? w.days.size : 0, v: w ? Math.round(w.v) : 0, s: w ? w.s : 0, p: w ? w.p : 0 }; }
  function chalRows(a, c) {
    const me = myName(a) || "Me", t = PT.fromDs(c.w); if (!t) return [];
    const m = mine(a, t.getTime()), fam = arr(a, "family").filter(x => x.w === c.w && x.n !== me);
    return [{ n: me, me: true, val: m[c.s] }].concat(fam.map(x => ({ n: x.n, val: num(x[c.s]) }))).sort((x, y) => y.val - x.val);
  }
  function chalHtml(a) {
    const c = a.settings.famChal, st = a.__chalStat || "k", cur = thisWeekId();
    const pick = `<div class="flex flex-wrap gap-1.5">${Object.keys(STATS).map(k => chip(`data-cstat="${k}"`, STATS[k].label, st === k)).join("")}</div><div><button type="button" class="pt-b go" id="pt-chal-new">Start a group challenge</button></div>`;
    if (!c) return `<div class="pt-chalcard"><span class="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Group challenge</span><p class="text-[11px] text-zinc-400 leading-snug">Pick one stat for the week. Everyone adds the code and the standings show up here.</p>${pick}</div>`;
    const rows = chalRows(a, c), S0 = STATS[c.s] || STATS.k, past = c.w < cur, lead = rows[0], top = Math.max(1, ...rows.map(r => r.val));
    const left = Math.max(0, Math.ceil((mondayOf(PT.fromDs(c.w).getTime()) + 7 * DAY - Date.now()) / DAY));
    return `<div class="pt-chalcard"><div class="flex items-center justify-between"><span class="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Group challenge</span><span class="text-[10px] font-bold ${past ? "text-amber-300" : "text-zinc-400"}">${past ? "Finished" : left + " day" + (left === 1 ? "" : "s") + " left"}</span></div>
      <span class="text-sm font-black text-white">${esc(c.t)}</span>
      ${rows.map((r, i) => `<div class="space-y-1"><div class="flex items-center justify-between text-xs"><span class="${r.me ? "font-black text-white" : "text-zinc-300"}">${i === 0 && r.val > 0 ? "👑 " : ""}${esc(r.n)}</span><span class="font-mono ${i === 0 && r.val > 0 ? "text-amber-300" : "text-zinc-400"}">${esc(S0.f(r.val))}</span></div>${bar(r.val / top)}</div>`).join("")}
      ${lead && lead.val > 0 ? `<p class="text-[11px] ${lead.me ? "text-emerald-400" : "text-zinc-400"} font-bold">${lead.me ? (past ? "You won this one 🏆" : "You are in the lead") : esc(lead.n) + (past ? " won" : " leads") + " this " + (past ? "round" : "week")}</p>` : ""}
      <div class="flex flex-wrap gap-2"><button type="button" class="pt-b go" id="pt-chal-share">Share challenge + my result</button>${past ? '<button type="button" class="pt-b" id="pt-chal-clear">New challenge</button>' : '<button type="button" class="pt-b" id="pt-chal-clear">End it</button>'}</div></div>`;
  }
  async function shareChal() {
    const a = A(), c = a.settings.famChal; if (!c) return; await ensureName(a);
    const mineCode = PT.familyCode ? PT.familyCode(a, PT.fromDs(c.w).getTime() + 3 * DAY).split("\n")[0] : "";
    const text = `PulseTrack group challenge: ${c.t}. Paste this in PulseTrack > Progress > Group board.\n${enc("PTC1", c)}\n${mineCode}`;
    try { if (navigator.share) { await navigator.share({ title: "Group challenge", text }); return; } } catch (e) { if (e && e.name === "AbortError") return; }
    try { await navigator.clipboard.writeText(text); a.toast("Copied. Send it to your group"); } catch (e) { await PT.alert("Copy this:\n\n" + text); }
  }

  /* ============================================================== buddies */
  function lastSession(a) { return S(a).slice().sort((x, y) => sessTime(y) - sessTime(x))[0]; }
  function dayLink(s) {
    try {
      const ex = (s.ex || []).filter(e => e && e.name).map(e => { const w = (e.sets || []).filter(x => x.t !== "W"), reps = w.length ? String(Math.round(w.reduce((n, x) => n + num(x.r), 0) / w.length) || "") : ""; return { name: e.name, sets: Math.max(1, w.length), reps: reps || "10" }; });
      if (!ex.length) return ""; const obj = { pulsetrackDay: 1, program: { id: "buddy", title: "Buddy workout" }, day: { dayNumber: 1, title: s.dtitle || "Workout", estimatedMinutes: 45, exercises: ex } };
      const link = location.origin + location.pathname + "#day=" + PT.b64urlEncode(JSON.stringify(obj)); return link.length < 2800 ? link : "";
    } catch (e) { return ""; }
  }
  async function sendResult(s) {
    const a = A(); s = s || lastSession(a); if (!s) { a.toast("Finish a workout first"); return; }
    if (!(await ensureName(a))) return;
    const o = { n: myName(a), d: s.date, t: s.dtitle || s.ptitle || "Workout", v: Math.round(toLb(s.vol || 0, s.unit)), m: Math.round((s.dur || 0) / 60), s: s.sets || 0, p: (s.prs || []).length };
    /* 2.53.0: the message carries my family update code too, so every workout I send also refreshes the family board */
    const link = dayLink(s), text = `${o.n} finished ${o.t}: ${V(o.v)}, ${o.m} min${o.p ? ", " + o.p + " PR" + (o.p === 1 ? "" : "s") : ""} 💪\n${link ? "Do the same workout: " + link + "\n" : ""}${enc("PTB1", o)}${famTail(a)}`;
    try { if (navigator.share) { await navigator.share({ title: "I finished a workout", text }); sent(); return; } } catch (e) { if (e && e.name === "AbortError") return; }
    try { await navigator.clipboard.writeText(text); a.toast("Copied. Paste it in your group chat"); } catch (e) { await PT.alert("Copy this:\n\n" + text); }
    sent();
  }
  function ago(d) { const t = PT.fromDs(d); if (!t) return ""; const n = Math.round((mondayOf(Date.now()) - mondayOf(t.getTime())) / DAY), dd = Math.round((new Date().setHours(0, 0, 0, 0) - new Date(t).setHours(0, 0, 0, 0)) / DAY); return dd <= 0 ? "today" : dd === 1 ? "yesterday" : dd + " days ago"; }
  function feedHtml(a) {
    const l = arr(a, "buddyFeed").slice().sort((x, y) => String(y.d).localeCompare(String(x.d)) || y.ts - x.ts).slice(0, 8), rx = arr(a, "reacts").slice(-5).reverse();
    const items = l.length ? l.map((x, i) => `<div class="pt-qrow"><div class="flex items-center justify-between gap-2"><span class="text-xs font-black text-white min-w-0 truncate">${esc(x.n)} · ${esc(x.t)}</span><span class="shrink-0 text-[10px] text-zinc-400">${esc(ago(x.d))}</span></div><span class="block text-[11px] text-zinc-400">${esc(V(x.v))}${x.m ? " · " + x.m + " min" : ""}${x.s ? " · " + x.s + " sets" : ""}${x.p ? " · 🏅 " + x.p + " PR" + (x.p === 1 ? "" : "s") : ""}</span>
      <div class="flex flex-wrap items-center gap-1.5">${["🔥", "💪", "👏"].map(e => `<button type="button" class="pt-react tap-active" data-react="${e}" data-i="${i}" aria-label="Send ${e}">${e}</button>`).join("")}${x.link ? `<button type="button" class="pt-b" data-dosame="${i}">Do this workout</button>` : ""}</div></div>`).join("") : '<p class="text-[11px] text-zinc-400 leading-snug">When a friend sends a finished workout, it shows up here. You can cheer them on and do the same session.</p>';
    return `${items}${rx.length ? `<div class="flex flex-wrap gap-1.5">${rx.map(r => `<span class="pt-frame">${esc(r.e)} ${esc(r.f)} · ${esc(r.t)}</span>`).join("")}</div>` : ""}`;
  }
  // feed index -> sorted order must match the render
  const sortedFeed = a => arr(a, "buddyFeed").slice().sort((x, y) => String(y.d).localeCompare(String(x.d)) || y.ts - x.ts).slice(0, 8);
  async function react(i, e) {
    const a = A(), x = sortedFeed(a)[i]; if (!x) return; if (!(await ensureName(a))) return;
    const text = `${e} ${myName(a)} liked your ${x.t} workout\n${enc("PTR1", { f: myName(a), to: x.n, e, t: x.t, d: x.d })}`;
    try { if (navigator.share) { await navigator.share({ title: "Cheer", text }); return; } } catch (er) { if (er && er.name === "AbortError") return; }
    try { await navigator.clipboard.writeText(text); a.toast("Copied. Send it to " + x.n); } catch (er) { await PT.alert("Copy this:\n\n" + text); }
  }
  function doSame(i) {
    const a = A(), x = sortedFeed(a)[i]; if (!x || !x.link) return;
    const h = x.link.slice(x.link.indexOf("#")); if (!h.startsWith("#day=")) return; location.hash = h;
  }

  /* ============================================================== wall of fame */
  const LIFTS = [["bench", "Bench", /^(smith machine (flat |bench )?press|(barbell )?bench press)$/i], ["squat", "Squat", /^(smith machine squats?|(barbell )?(back )?squat)$/i], ["dead", "Deadlift", /^(barbell )?(conventional )?deadlift$/i]];
  function myCard(a) {
    const st = PT.rewards(a), best = { bench: 0, squat: 0, dead: 0, ohp: 0 };
    S(a).forEach(s => (s.ex || []).forEach(e => LIFTS.forEach(([k, , re]) => { if (re.test(e.name)) (e.sets || []).forEach(x => { if (x.t !== "W") best[k] = Math.max(best[k], toLb(a.setE1rm(e.name, x, s.date) || 0, s.unit)); }); })));
    return { n: myName(a) || "Me", lv: st.lv.L, b: st.badges.filter(b => b.got).length, st: st.streak.cur, l: { bench: Math.round(best.bench), squat: Math.round(best.squat), dead: Math.round(best.dead), ohp: Math.round(best.ohp) } };
  }
  function wallHtml(a) {
    const me = myCard(a), others = Object.values(a.settings.wall || {}).filter(x => x.n !== me.n), rows = [Object.assign({ me: true }, me)].concat(others).sort((x, y) => y.lv - x.lv || y.b - x.b);
    const top = {}; LIFTS.forEach(([k]) => { let b = 0, who = ""; rows.forEach(r => { if ((r.l[k] || 0) > b) { b = r.l[k]; who = r.n; } }); top[k] = who; });
    const del = x => (x.me ? "" : `<button type="button" data-wall-del="${esc(x.n)}" class="pt-xdel" aria-label="Remove ${esc(x.n)}">✕</button>`);
    return `<div class="space-y-1.5">${rows.map(r => `<div class="pt-wall ${r.me ? "me" : ""}"><div class="flex items-center justify-between gap-2"><span class="text-xs font-black text-white truncate">${esc(r.n)}${r.me ? " (you)" : ""}</span><span class="text-[11px] font-bold text-amber-300 shrink-0">Lv ${r.lv} · 🏅 ${r.b} · 🔥 ${r.st}</span>${del(r)}</div>
      <div class="pt-wlifts">${LIFTS.map(([k, name]) => `<span class="${top[k] === r.n && r.l[k] ? "king" : ""}">${top[k] === r.n && r.l[k] ? "👑 " : ""}${name} <b>${r.l[k] ? esc(V(r.l[k])) : "-"}</b></span>`).join("")}</div></div>`).join("")}</div>
      <div class="flex flex-wrap gap-2"><button type="button" class="pt-b go" id="pt-wall-share">Share my card</button></div>
      <p class="text-[10px] text-zinc-500 leading-snug">Lifts are estimated one-rep maxes. Share your card, and paste friends' cards below to add them to the wall.</p>`;
  }
  async function shareCard() {
    const a = A(); if (!(await ensureName(a))) return; const c = myCard(a);
    const text = `${c.n}: Level ${c.lv}, ${c.b} badges, ${c.st} week streak 💪\n${enc("PTW1", c)}${famTail(a)}`;
    try { if (navigator.share) { await navigator.share({ title: "My PulseTrack card", text }); sent(); return; } } catch (e) { if (e && e.name === "AbortError") return; }
    try { await navigator.clipboard.writeText(text); a.toast("Copied. Send it to your group"); } catch (e) { await PT.alert("Copy this:\n\n" + text); }
    sent();
  }

  /* ============================================================== Progress wiring */
  const OPEN = {};
  function drawBuddy(a) {
    const root = $("progress-body"); if (!root) return;
    let box = $("pt-pg-rew4");
    if (!box) { box = document.createElement("div"); box.id = "pt-pg-rew4"; box.className = "space-y-3"; const r3 = $("pt-pg-rew3") || $("pt-pg-rew2") || $("pt-pg-rew"); if (r3 && r3.parentNode === root) r3.insertAdjacentElement("afterend", box); else root.appendChild(box); }
    box.innerHTML = `<details class="pt-pg" id="pt-pg-buddy" ${OPEN.buddy ? "open" : ""}><summary><span class="text-xs font-bold text-white">🤝 Buddies</span><span class="pt-chev">›</span></summary><div>${feedHtml(a)}<div class="flex flex-wrap gap-2"><button type="button" class="pt-b go" id="pt-send-last">Send my last workout</button></div>
      <input type="text" id="pt-code-paste" placeholder="Paste a friend's message or code" aria-label="Paste a code"><button type="button" class="pt-b" id="pt-code-add">Add</button></div></details>
      <details class="pt-pg" id="pt-pg-wall" ${OPEN.wall ? "open" : ""}><summary><span class="text-xs font-bold text-white">🏛 Wall of fame</span><span class="pt-chev">›</span></summary><div>${wallHtml(a)}</div></details>`;
    box.querySelectorAll("details").forEach(d => d.addEventListener("toggle", () => { OPEN[d.id.replace("pt-pg-", "")] = d.open; }));
    const fam = document.querySelector("#pt-pg-fam > div"); if (fam && !fam.querySelector("#pt-chal-box")) { const h = document.createElement("div"); h.id = "pt-chal-box"; h.innerHTML = chalHtml(a); fam.insertAdjacentElement("afterbegin", h); }
  }
  const oPV = proto.renderProgressView;
  proto.renderProgressView = function () { const r = oPV.apply(this, arguments); try { drawBuddy(this); } catch (e) { console.error("PulseTrack buddies", e); } return r; };

  /* finish screen button */
  function ensureSummaryBtn() {
    if ($("pt-summary-send")) return; const t = $("btn-summary-template"); if (!t || !t.parentElement) return;
    const b = document.createElement("button"); b.id = "pt-summary-send"; b.type = "button"; b.className = "w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold rounded-xl tap-active text-sm"; b.textContent = "🤝 Send to group & buddies"; t.parentElement.insertBefore(b, t);
  }
  const oFin = proto.finishWorkoutV2;
  proto.finishWorkoutV2 = async function () { const r = await oFin.apply(this, arguments); try { ensureSummaryBtn(); } catch (e) { } return r; };

  document.addEventListener("click", async e => {
    const a = A(); if (!a || !e.target.closest) return; const t = id => e.target.closest("#" + id), on = sel => e.target.closest(sel);
    const cs = on("[data-cstat]"); if (cs) { a.__chalStat = cs.dataset.cstat; const b = $("pt-chal-box"); if (b) b.innerHTML = chalHtml(a); return; }
    if (t("pt-chal-new")) { const k = a.__chalStat || "k"; await ensureName(a); a.settings.famChal = { s: k, w: thisWeekId(), t: STATS[k].label + " this week" }; save(); a.renderProgressView(); setTimeout(shareChal, 200); return; }
    if (t("pt-chal-share")) { shareChal(); return; }
    if (t("pt-chal-clear")) { a.settings.famChal = null; save(); a.renderProgressView(); return; }
    if (t("pt-send-last") || t("pt-summary-send")) { if (t("pt-summary-send") && a.lastSummary && a.lastSummary.session) sendResult(a.lastSummary.session); else sendResult(); return; }
    if (t("pt-code-add")) { const g = takeCodes(($("pt-code-paste") || {}).value, a), n = g.feed + g.react + g.wall + g.chal; let fam = 0; try { fam = PT.familyAdd ? baseAdd && baseAdd(($("pt-code-paste") || {}).value, a) : 0; } catch (x) { } a.toast(n || fam ? "Added" : "That doesn't look like a PulseTrack code"); OPEN.buddy = true; a.renderProgressView(); return; }
    const rc = on("[data-react]"); if (rc) { react(parseInt(rc.dataset.i, 10), rc.dataset.react); return; }
    const ds = on("[data-dosame]"); if (ds) { doSame(parseInt(ds.dataset.dosame, 10)); return; }
    if (t("pt-wall-share")) { shareCard(); return; }
    const wd = on("[data-wall-del]"); if (wd) { const w = a.settings.wall || {}; delete w[wd.dataset.wallDel]; save(); a.renderProgressView(); }
  });

  const css = document.createElement("style"); css.id = "pt-v232d-css";
  css.textContent = `
    .pt-chalcard { display: flex; flex-direction: column; gap: .4rem; padding-bottom: .5rem; border-bottom: 1px solid rgb(var(--z800)); }
    .pt-react { padding: .3rem .6rem; border-radius: .6rem; background: rgb(var(--z800)); font-size: .9rem; }
    .pt-wall { padding: .6rem .7rem; border-radius: .8rem; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); display: flex; flex-direction: column; gap: .35rem; }
    .pt-wall.me { border-color: rgb(var(--a500) / .6); }
    .pt-wlifts { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .2rem .6rem; font-size: .68rem; color: rgb(var(--z400)); }
    .pt-wlifts b { color: rgb(var(--z100)); font-weight: 800; }
    .pt-wlifts .king b { color: #fbbf24; }
    .pt-xdel { color: rgb(var(--z500)); padding: 0 .3rem; font-size: .8rem; }
    #pt-chal-box .pt-b, #pt-pg-buddy .pt-b, #pt-pg-wall .pt-b { padding: .5rem .85rem; border-radius: .65rem; font-size: .75rem; font-weight: 700; background: rgb(var(--z800)); color: rgb(var(--z100)); }
    #pt-chal-box .pt-b.go, #pt-pg-buddy .pt-b.go, #pt-pg-wall .pt-b.go { background: rgb(var(--a600)); color: #fff; }
    #pt-pg-buddy input[type=text] { background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); border-radius: .65rem; padding: .55rem .75rem; font-size: .8rem; color: #fff; width: 100%; }
  `;
  document.head.appendChild(css);
})();
  