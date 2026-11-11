
/* =====================================================================
 * PulseTrack 2.53.0: a family board that stays fresh and is fair to everybody.
 *
 * Why it only updated once: the board has no server, so it runs on codes people paste into each other's phones, and every code was a snapshot
 * from the moment it was sent. Anyone who had not sent a new one this week also vanished from the board.
 *
 * Now:
 *  - One update code (PTF2) carries a person's last 4 weeks, streak, progress and strength rating. Every workout / card / challenge share
 *    includes it automatically, so each message you already send keeps the board current.
 *  - "Paste update" reads the clipboard in one tap. Nobody disappears: people who have not sent this week stay on the board, with "updated 3 days ago".
 *    A stale row gets an "Ask for update" button that sends your own update along with the request.
 *  - The contest is fair between people who lift different weights. Volume and weights are gone. It is scored on:
 *      Score        100 for hitting YOUR weekly goal (3 to 6 days counts, so a goal of 1 cannot be farmed) + 10 per new record (up to 5)
 *      Consistency  days trained against your own goal
 *      Streak       weeks in a row hitting your goal
 *      Records      new personal records
 *      Progress     how much your main lifts went up over 4 weeks, in %
 *      Strength     your StrengthLevel rating for your body weight and sex (0 to 100)
 *    Weekly crowns and an 8 week season table sit on top.
 * Old codes (PT1, PTW1, PTB1, PTC1, PTR1) still work.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined" || !PT.rewards || !PT.weeksOf || !PT.goalFor) return;
  const proto = ApplicationUI.prototype;
  const A = () => window.app;
  const $ = id => document.getElementById(id);
  const esc = s => PT.esc(s);
  const DAY = 86400000, HOUR = 3600000;
  const S = a => a.sessions || [];
  const save = () => { try { WorkoutStorage.saveSettings(A().settings); } catch (e) { } };
  const num = v => { const n = parseFloat(v); return isFinite(n) ? n : 0; };
  const clip = (s, n) => String(s == null ? "" : s).slice(0, n);
  const toLb = (v, from) => (from === "kg" ? v * 2.2046226 : v);
  const sessTime = s => s.ts || (PT.fromDs && PT.fromDs(s.date) ? PT.fromDs(s.date).getTime() : 0);
  const mondayOf = t => { const d = new Date(t); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d.getTime(); };
  const dsOf = t => PT.ds(new Date(t));
  /** the Monday i weeks back (noon offset keeps it safe across daylight saving changes) */
  const wkMon = i => mondayOf(mondayOf(Date.now()) - i * 7 * DAY + 12 * HOUR);
  const myName = a => a.settings.myName || "";
  const arr = (a, k) => (Array.isArray(a.settings[k]) ? a.settings[k] : []);
  const chip = (attr, label, on) => `<button type="button" ${attr} aria-pressed="${on}" class="pt-opt tap-active">${esc(label)}</button>`;
  const enc = (tag, o) => tag + "." + btoa(unescape(encodeURIComponent(JSON.stringify(o))));
  const dec = tok => { try { const m = String(tok).match(/^(PTF2|PTC1)\.([A-Za-z0-9+/=_-]+)$/); if (!m) return null; return { tag: m[1], o: JSON.parse(decodeURIComponent(escape(atob(m[2])))) }; } catch (e) { return null; } };
  const LEVELS = ["Beginner", "Novice", "Intermediate", "Advanced", "Elite"];
  const fam2 = a => (a.settings.fam2 && typeof a.settings.fam2 === "object" && !Array.isArray(a.settings.fam2) ? a.settings.fam2 : (a.settings.fam2 = {}));

  async function ensureName(a) {
    if (myName(a)) return myName(a);
    const i = $("pt-f2-name"); if (i && i.value.trim()) { a.settings.myName = clip(i.value.trim(), 24); save(); return a.settings.myName; }
    const v = await PT.prompt("What name should your group see?", "", { title: "Your name", ok: "Save", maxlength: 24 });
    const n = clip(String(v || "").trim(), 24); if (!n) return ""; a.settings.myName = n; save(); return n;
  }

  /* ============================================================== what I send */
  const effG = g => Math.max(3, Math.min(6, g || 3)); // a goal of 1 or 2 days still has to cover 3, and more than 6 does not help
  const cons = w => Math.min(1, num(w.d) / effG(w.g));
  const score = w => Math.round(cons(w) * 100 + 10 * Math.min(num(w.p), 5));

  let memoR = null;
  /** your strength rating: average level of your 5 best graded exercises, 0 to 100, graded for YOUR body weight and sex */
  function rating(a) {
    try {
      const rows = PT.exLevels ? PT.exLevels(a) : []; if (!rows || !rows.length) return null;
      const sc = rows.map(r => r.lv.idx + r.lv.frac).sort((x, y) => y - x).slice(0, 5), avg = sc.reduce((n, x) => n + x, 0) / sc.length;
      return { sr: Math.round(avg / 5 * 100), lvl: Math.max(0, Math.min(4, Math.floor(avg))) };
    } catch (e) { return null; }
  }
  /** how much your lifts went up over the last 4 weeks: best estimated 1RM now against before, averaged over your 6 most trained lifts (each capped), in % */
  function progress(a) {
    const cut = Date.now() - 28 * DAY, per = new Map();
    S(a).forEach(s => {
      const t = sessTime(s);
      (s.ex || []).forEach(e => {
        if (PT.isBodyweightEx && PT.isBodyweightEx(e.name)) return;
        (e.sets || []).forEach(x => {
          if (x.t === "W" || (PT.isCardioSet && PT.isCardioSet(x))) return;
          const r = parseFloat(x.r) || 0; let v = toLb(a.setE1rm(e.name, x, s.date) || 0, s.unit); if (!(v > 0)) return;
          if (r > 20) v = v * (1 + 20 / 30) / (1 + r / 30);
          let o = per.get(e.name); if (!o) { o = { cur: 0, prev: 0, n: 0 }; per.set(e.name, o); }
          if (t >= cut) { if (v > o.cur) o.cur = v; o.n++; } else if (v > o.prev) o.prev = v;
        });
      });
    });
    const g = []; per.forEach(o => { if (o.cur > 0 && o.prev > 0 && o.n >= 2) g.push({ n: o.n, g: Math.max(-0.15, Math.min(0.3, o.cur / o.prev - 1)) }); });
    if (g.length < 2) return null;
    g.sort((x, y) => y.n - x.n); const top = g.slice(0, 6);
    return Math.round(top.reduce((n, x) => n + x.g, 0) / top.length * 1000) / 10;
  }
  function slow(a) {
    const key = S(a).length + ":" + S(a).reduce((m, s) => Math.max(m, s.upd || s.ts || 0), 0) + ":" + (a.body || []).length + ":" + a.unit() + ":" + a.settings.strengthSex + ":" + PT.ds();
    if (memoR && memoR.key === key) return memoR.v;
    const v = { rt: rating(a), pg: progress(a) }; memoR = { key, v }; return v;
  }
  function bigBest(a, k) { try { return Math.round(PT.bigBest ? PT.bigBest(a, k) : 0); } catch (e) { return 0; } }
  function myRec(a, n) {
    const W = PT.weeksOf(a), st = PT.rewards(a), wk = [], sl = slow(a);
    for (let i = 0; i < n; i++) { const mon = wkMon(i), o = W.get(mon); wk.push({ w: dsOf(mon), d: o ? o.days.size : 0, g: PT.goalFor(a, mon), p: o ? o.p : 0 }); }
    const l = {}; ["bench", "squat", "dead", "ohp"].forEach(k => { l[k] = bigBest(a, k); });
    return { n: myName(a) || "Me", lv: st.lv.L, b: st.badges.filter(x => x.got).length, st: st.streak.cur, l, wk, sr: sl.rt ? sl.rt.sr : null, sl: sl.rt ? sl.rt.lvl : null, pg: sl.pg };
  }
  /** my update, as a code anyone can paste */
  function code(a) {
    const r = myRec(a, 4), o = { v: 2, n: r.n, t: Date.now(), lv: r.lv, b: r.b, st: r.st, l: r.l, wk: r.wk.map(x => [x.w, x.d, x.g, x.p]) };
    if (r.sr != null) { o.sr = r.sr; o.sl = r.sl; } if (r.pg != null) o.pg = r.pg;
    try { const bx = PT.bossBonusOut ? PT.bossBonusOut(a) : null; if (bx && bx.length) o.bx = bx; } catch (e) { }   // 2.90.0: boss battle damage, per week
    return enc("PTF2", o);
  }
  PT.famUpdateCode = a => code(a || A());
  PT.famMarkSent = () => { const a = A(); a.settings.famSent = Date.now(); save(); };
  /** true when there is somebody to update and you have trained since you last sent */
  PT.famDue = a => {
    a = a || A(); const sent = num(a.settings.famSent), others = Object.keys(fam2(a)).length + arr(a, "family").length;
    return others > 0 && (!sent || S(a).some(s => sessTime(s) > sent));
  };

  /* ============================================================== what I receive */
  function receive(text, a) {
    const names = [], f2 = fam2(a), me = myName(a).toLowerCase(); let same = 0, self = 0;
    (String(text || "").match(/PTF2\.[A-Za-z0-9+/=_-]+/g) || []).forEach(tok => {
      const d = dec(tok); if (!d || d.tag !== "PTF2" || !d.o || d.o.v !== 2 || !d.o.n) return; const o = d.o;
      const n = clip(o.n, 24); if (/^(__proto__|constructor|prototype)$/i.test(n)) return; if (me && n.toLowerCase() === me) { self++; return; }
      const key = Object.keys(f2).find(k => k.toLowerCase() === n.toLowerCase()) || n, old = f2[key], t = Math.min(num(o.t) || Date.now(), Date.now() + HOUR);
      if (old && num(old.t) >= t) { same++; return; }
      const wk = Object.assign({}, old ? old.wk : {});
      (Array.isArray(o.wk) ? o.wk : []).slice(0, 8).forEach(x => { if (Array.isArray(x) && /^\d{4}-\d{2}-\d{2}$/.test(String(x[0]))) wk[x[0]] = { d: Math.max(0, Math.min(7, num(x[1]))), g: Math.max(1, Math.min(7, num(x[2]) || 3)), p: Math.max(0, Math.min(99, num(x[3]))) }; });
      const kept = {}; Object.keys(wk).sort().slice(-14).forEach(k => { kept[k] = wk[k]; });
      const bx0 = Object.assign({}, old && old.bx ? old.bx : {}); (Array.isArray(o.bx) ? o.bx : []).slice(0, 4).forEach(x => { if (Array.isArray(x) && /^\d{4}-\d{2}-\d{2}$/.test(String(x[0]))) bx0[x[0]] = Math.max(0, Math.min(5000, Math.round(num(x[1])))); });
      const bx = {}; Object.keys(bx0).sort().slice(-6).forEach(k => { bx[k] = bx0[k]; });
      const l = { bench: num(o.l && o.l.bench), squat: num(o.l && o.l.squat), dead: num(o.l && o.l.dead), ohp: num(o.l && o.l.ohp) };
      f2[key] = { n, t, rx: Date.now(), lv: num(o.lv), b: num(o.b), st: num(o.st), l, sr: o.sr != null ? num(o.sr) : null, sl: o.sl != null ? Math.max(0, Math.min(4, num(o.sl))) : null, pg: o.pg != null ? num(o.pg) : null, wk: kept, bx };
      const w = a.settings.wall && typeof a.settings.wall === "object" ? a.settings.wall : (a.settings.wall = {}); w[n] = { n, lv: num(o.lv), b: num(o.b), st: num(o.st), l, ts: Date.now() };
      names.push(n);
    });
    if (names.length) { a.settings.fam2 = f2; save(); }
    return { names, same, self };
  }
  /** take any pasted text: the new update code and every older code */
  function importText(a, text) {
    const r = receive(text, a), pt1 = (String(text || "").match(/PT1\.[A-Za-z0-9+/=_-]+/g) || []).join(" "); let other = 0, old = 0;
    try { if (pt1 && PT.familyAdd) old = PT.familyAdd(pt1, a) || 0; } catch (e) { }
    try { if (PT.takeCodes) { const g = PT.takeCodes(text, a); other = g.feed + g.react + g.wall + g.chal; } } catch (e) { }
    if (r.names.length) a.toast(`Updated ${r.names.join(", ")} 💪`);
    else if (other || old) a.toast("Added");
    else if (r.same) a.toast("Already up to date");
    else if (r.self) a.toast("That one is your own update");
    else a.toast("That doesn't look like a PulseTrack update");
    return r.names.length + other + old;
  }

  /* ============================================================== the people on the board */
  function people(a) {
    const mine = myRec(a, 10), mk = mine.n.toLowerCase(), out = {};
    const me = { me: true, n: mine.n, t: Date.now(), lv: mine.lv, b: mine.b, st: mine.st, l: mine.l, sr: mine.sr, sl: mine.sl, pg: mine.pg, wk: {} };
    mine.wk.forEach(x => { me.wk[x.w] = { d: x.d, g: x.g, p: x.p }; }); out[mk] = me;
    const get = n => { const k = String(n).toLowerCase(); return out[k] || (out[k] = { n: String(n), wk: {}, t: 0 }); };
    arr(a, "family").forEach(x => { if (!x || !x.n || String(x.n).toLowerCase() === mk) return; const p = get(x.n); if (!p.wk[x.w]) p.wk[x.w] = { d: num(x.k), g: 4, p: num(x.p), old: true }; });
    Object.values(a.settings.wall && typeof a.settings.wall === "object" ? a.settings.wall : {}).forEach(x => { if (!x || !x.n || String(x.n).toLowerCase() === mk) return; const p = get(x.n); if (p.lv == null) { p.lv = x.lv; p.b = x.b; p.st = x.st; p.l = x.l; } if (!p.t && x.ts) p.t = x.ts; });
    Object.values(fam2(a)).forEach(x => { if (!x || !x.n || String(x.n).toLowerCase() === mk) return; const p = get(x.n); Object.assign(p, { t: x.t, lv: x.lv, b: x.b, st: x.st, l: x.l, sr: x.sr, sl: x.sl, pg: x.pg, bx: x.bx || {} }); Object.assign(p.wk, x.wk || {}); p.fresh = true; });
    return out;
  }
  const ago = t => {
    if (!t) return "";
    const m = Math.max(0, Math.round((Date.now() - t) / 60000)); if (m < 2) return "just now"; if (m < 60) return m + " min ago";
    const h = Math.round(m / 60); if (h < 24) return h + " h ago"; const d = Math.round(h / 24); return d + (d === 1 ? " day ago" : " days ago");
  };
  const STALE = 3 * DAY;

  /** weekly winners and an 8 week table */
  function season(a, ppl) {
    ppl = ppl || people(a); const rows = {}; Object.values(ppl).forEach(p => { rows[p.n] = { n: p.n, me: !!p.me, pts: 0, crowns: 0, weeks: 0 }; });
    let rounds = 0;
    for (let i = 1; i <= 8; i++) {
      const wid = dsOf(wkMon(i)), list = Object.values(ppl).filter(p => p.wk[wid]).map(p => ({ p, sc: score(p.wk[wid]) }));
      if (list.length < 2) continue; list.sort((x, y) => y.sc - x.sc); rounds++;
      list.forEach(x => { rows[x.p.n].pts += x.sc; rows[x.p.n].weeks++; });
      if (list[0].sc > 0 && list[0].sc > list[1].sc) rows[list[0].p.n].crowns++;
    }
    return { rounds, rows: Object.values(rows).filter(r => r.weeks > 0).sort((x, y) => y.crowns - x.crowns || y.pts - x.pts) };
  }
  /** true when you had the top score last week (a crown shows next to your level) */
  PT.familyWon = function (appArg) {
    try {
      const a = appArg || A(), ppl = people(a), wid = dsOf(wkMon(1)), list = Object.values(ppl).filter(p => p.wk[wid]).map(p => ({ p, sc: score(p.wk[wid]) })).sort((x, y) => y.sc - x.sc);
      return !!(list.length >= 2 && list[0].p.me && list[0].sc > 0 && list[0].sc > list[1].sc);
    } catch (e) { return false; }
  };

  /* ============================================================== the contests */
  const dayTxt = (w, extra) => `${num(w.d)} of ${effG(w.g)} days${extra ? " · " + extra : ""}`;
  const CATS = {
    sc: { label: "Score", wk: true, val: (p, w) => (p.wk[w] ? score(p.wk[w]) : null), txt: v => v + " pts", sub: (p, w) => (p.wk[w] ? dayTxt(p.wk[w], num(p.wk[w].p) + " record" + (num(p.wk[w].p) === 1 ? "" : "s")) : ""), how: "100 points for hitting your own weekly goal, plus 10 for each new record (up to 5). Goals count between 3 and 6 days." },
    cn: { label: "Consistency", wk: true, val: (p, w) => (p.wk[w] ? Math.round(cons(p.wk[w]) * 100) : null), txt: v => v + "%", sub: (p, w) => (p.wk[w] ? dayTxt(p.wk[w]) : ""), how: "Days trained against your own weekly goal. Everyone is measured against themselves." },
    st: { label: "Streak", val: p => (p.st != null ? num(p.st) : null), txt: v => v + (v === 1 ? " week" : " weeks"), sub: () => "in a row hitting the weekly goal", how: "Weeks in a row you hit your weekly goal." },
    rc: { label: "Records", wk: true, val: (p, w) => (p.wk[w] ? num(p.wk[w].p) : null), txt: v => v + (v === 1 ? " PR" : " PRs"), sub: (p, w) => (p.wk[w] ? dayTxt(p.wk[w]) : ""), how: "New personal records set that week." },
    pg: { label: "Progress", val: p => (p.pg != null ? num(p.pg) : null), txt: v => (v > 0 ? "+" : "") + v.toFixed(1) + "%", sub: () => "main lifts, last 4 weeks", how: "How much your main lifts went up over the last 4 weeks, in percent. It needs a few weeks of training history. A bigger number means more progress, whatever weight you lift." },
    sr: { label: "Strength", val: p => (p.sr != null ? num(p.sr) : null), txt: v => v + " / 100", sub: p => (p.sl != null ? LEVELS[p.sl] + " for body weight" : "level for body weight"), how: "Your StrengthLevel rating: the average level of your 5 best exercises for your body weight and sex, out of 100. Needs your body weight logged." }
  };
  const CAT_ORDER = ["sc", "cn", "st", "rc", "pg", "sr"];
  function rank(ppl, cat, wid) {
    const C = CATS[cat], all = Object.values(ppl).map(p => ({ p, v: C.val(p, wid) }));
    const have = all.filter(x => x.v != null).sort((x, y) => y.v - x.v || (x.p.me ? -1 : 1)), none = all.filter(x => x.v == null).sort((x, y) => (y.p.t || 0) - (x.p.t || 0));
    return { have, none };
  }
  function insight(a, ppl, wid) {
    const r = rank(ppl, "sc", wid).have; if (r.length < 2) return "";
    const my = r.findIndex(x => x.p.me); if (my < 0) return "";
    if (my === 0) return r[1].v < r[0].v ? `<p class="text-[11px] font-bold text-emerald-400">You are in the lead by ${r[0].v - r[1].v} 👑</p>` : `<p class="text-[11px] font-bold text-amber-300">Tied at the top with ${esc(r[1].p.n)}. One more workout breaks it.</p>`;
    const lead = r[0], gap = lead.v - r[my].v, w = r[my].p.wk[wid] || {}, left = Math.max(0, effG(w.g) - num(w.d)), perDay = 100 / effG(w.g);
    const days = Math.ceil((gap + 1) / perDay);
    const tail = left > 0 && days <= left ? `${days} more workout day${days === 1 ? "" : "s"} puts you in front.` : left > 0 ? "Finish your weekly goal and add a record or two." : "A new record is worth +10.";
    return `<p class="text-[11px] text-zinc-300"><b class="text-white">${esc(lead.p.n)}</b> leads by ${gap}. ${tail}</p>`;
  }
  function rowHtml(r, i, cat, wid, ppl) {
    const C = CATS[cat], p = r.p, stale = !p.me && (!p.t || Date.now() - p.t > STALE), top = r.v != null && i === 0 && r.v > 0;
    const meta = p.me ? "live from your phone" : p.t ? "updated " + ago(p.t) : "from an older code";
    const none = r.v == null;
    return `<div class="pt-f2row ${p.me ? "me" : ""} ${top ? "first" : ""} ${none ? "dim" : ""}"><span class="pt-f2rk">${none ? "–" : i + 1}</span>
      <div class="min-w-0 flex-1"><div class="flex items-center justify-between gap-2"><span class="min-w-0 truncate text-xs font-black text-white">${top ? "👑 " : ""}${esc(p.n)}${p.me ? " (you)" : ""}</span><span class="pt-f2val shrink-0">${none ? "no data" : esc(C.txt(r.v))}</span></div>
        <div class="pt-f2sub">${none ? (C.wk ? "No update for this week yet" : "Not in their update yet") : esc(C.sub(p, wid))}</div>
        <div class="pt-f2sub ${stale ? "pt-f2stale" : ""}">${esc(meta)}${stale && !p.me ? ` · <button type="button" class="pt-f2ask tap-active" data-f2ask="${esc(p.n)}">Ask for update</button>` : ""}</div></div>
      ${p.me ? '<span class="pt-xdel" style="visibility:hidden" aria-hidden="true">✕</span>' : `<button type="button" data-f2del="${esc(p.n)}" class="pt-xdel tap-active" aria-label="Remove ${esc(p.n)}">✕</button>`}</div>`;
  }

  /* ---- family challenge: pick a contest for the week */
  const CH = { sc: "Highest score", cn: "Best consistency", p: "Most records" };
  const CH_ALL = { sc: "Highest score", cn: "Best consistency", p: "Most records", k: "Most workouts", v: "Most volume", s: "Most sets" };
  function chalVal(a, ppl, p, c) {
    const w = p.wk[c.w]; const legacy = p.me ? null : arr(a, "family").find(x => x.n === p.n && x.w === c.w);
    if (c.s === "sc") return w ? score(w) : 0; if (c.s === "cn") return w ? Math.round(cons(w) * 100) : 0; if (c.s === "p") return w ? num(w.p) : 0; if (c.s === "k") return w ? num(w.d) : 0;
    if (p.me) { const o = PT.weeksOf(a).get(mondayOf(PT.fromDs(c.w).getTime())); return o ? (c.s === "v" ? Math.round(o.v) : o.s) : 0; }
    return legacy ? num(legacy[c.s]) : 0;
  }
  const chalTxt = (a, c, v) => (c.s === "sc" ? v + " pts" : c.s === "cn" ? v + "%" : c.s === "v" ? fmtV(a, v) : String(v));
  const fmtV = (a, lb) => { const kg = a.unit() === "kg"; return Math.round(kg ? lb / 2.2046226 : lb).toLocaleString() + (kg ? " kg" : " lb"); };
  function chalHtml(a, ppl) {
    const c = a.settings.famChal, pick = a.__f2cs || "sc";
    if (!c) return `<div class="pt-f2box"><span class="pt-f2h">Group challenge</span><p class="text-[11px] text-zinc-400 leading-snug">Pick one contest for the week. Everyone pastes the message and the standings show up here.</p>
      <div class="flex flex-wrap gap-1.5">${Object.keys(CH).map(k => chip(`data-f2cs="${k}"`, CH[k], pick === k)).join("")}</div><div><button type="button" class="pt-b go" id="pt-f2-chal-new">Start a challenge</button></div></div>`;
    const cur = dsOf(wkMon(0)), past = c.w < cur, rows = Object.values(ppl).map(p => ({ p, v: chalVal(a, ppl, p, c) })).sort((x, y) => y.v - x.v || (x.p.me ? -1 : 1)), top = Math.max(1, ...rows.map(r => r.v));
    const left = Math.max(0, Math.ceil((mondayOf(PT.fromDs(c.w).getTime()) + 7 * DAY - Date.now()) / DAY)), lead = rows[0];
    return `<div class="pt-f2box"><div class="flex items-center justify-between"><span class="pt-f2h">Group challenge</span><span class="text-[10px] font-bold ${past ? "text-amber-300" : "text-zinc-400"}">${past ? "Finished" : left + " day" + (left === 1 ? "" : "s") + " left"}</span></div>
      <span class="text-sm font-black text-white">${esc(c.t || CH_ALL[c.s] || "Challenge")}</span>
      ${rows.map((r, i) => `<div class="space-y-1"><div class="flex items-center justify-between text-xs"><span class="${r.p.me ? "font-black text-white" : "text-zinc-300"}">${i === 0 && r.v > 0 ? "👑 " : ""}${esc(r.p.n)}</span><span class="font-mono ${i === 0 && r.v > 0 ? "text-amber-300" : "text-zinc-400"}">${esc(chalTxt(a, c, r.v))}</span></div><div class="pt-bar"><span style="width:${Math.round(r.v / top * 100)}%"></span></div></div>`).join("")}
      ${lead && lead.v > 0 ? `<p class="text-[11px] font-bold ${lead.p.me ? "text-emerald-400" : "text-zinc-400"}">${lead.p.me ? (past ? "You won this one 🏆" : "You are in the lead") : esc(lead.p.n) + (past ? " won" : " leads") + " this " + (past ? "round" : "week")}</p>` : ""}
      <div class="flex flex-wrap gap-2"><button type="button" class="pt-b go" id="pt-f2-chal-share">Share challenge + my update</button><button type="button" class="pt-b" id="pt-f2-chal-end">${past ? "New challenge" : "End it"}</button></div></div>`;
  }

  /* ============================================================== the board */
  function boardHtml(a) {
    const ppl = people(a), last = a.__f2w === "last", wid = dsOf(wkMon(last ? 1 : 0)), cat = CATS[a.__f2c] ? a.__f2c : "sc", C = CATS[cat], R = rank(ppl, cat, wid);
    const others = Object.values(ppl).filter(p => !p.me).length, sent = num(a.settings.famSent), since = sent ? S(a).filter(s => sessTime(s) > sent).length : S(a).length;
    const due = !sent || since > 0, S8 = season(a, ppl);
    const named = !!myName(a);
    const head = !named ? `<div class="pt-f2box"><span class="pt-f2h">First, your name</span><p class="text-[11px] text-zinc-400 leading-snug">This is what the group sees next to your score.</p><input type="text" id="pt-f2-name" placeholder="Your name" maxlength="24" aria-label="Your name"></div>` : "";
    const list = R.have.map((r, i) => rowHtml(r, i, cat, wid, ppl)).join("") + R.none.map(r => rowHtml(r, 0, cat, wid, ppl)).join("");
    const seas = S8.rounds ? `<div class="pt-f2box"><span class="pt-f2h">Last ${S8.rounds} week${S8.rounds === 1 ? "" : "s"} with 2 or more people</span>${S8.rows.map((r, i) => `<div class="flex items-center justify-between gap-2 text-xs"><span class="min-w-0 truncate ${r.me ? "font-black text-white" : "text-zinc-300"}">${i === 0 && r.crowns ? "👑 " : ""}${esc(r.n)}${r.me ? " (you)" : ""}</span><span class="shrink-0 font-mono text-zinc-400">${r.crowns} 👑 · ${r.pts} pts</span></div>`).join("")}<p class="text-[10px] text-zinc-500 leading-snug">A crown is the top score of a week. Points add up each week's score.</p></div>` : `<p class="text-[10px] text-zinc-500 leading-snug">After a full week with 2 or more people on the board, weekly crowns and a season table show up here.</p>`;
    return `${head}
      <div class="flex gap-1.5">${chip('data-f2w="this"', "This week", !last)}${chip('data-f2w="last"', "Last week", last)}</div>
      <div class="flex flex-wrap gap-1.5">${CAT_ORDER.map(k => chip(`data-f2c="${k}"`, CATS[k].label, cat === k)).join("")}</div>
      ${cat === "sc" && !last ? insight(a, ppl, wid) : ""}
      <div class="space-y-1.5">${list}</div>
      <p class="text-[10px] text-zinc-500 leading-snug">${esc(C.how)}${C.wk ? "" : " Shows the latest from each phone, not a single week."}</p>
      <div class="pt-f2box"><span class="pt-f2h">Keep it fresh</span>
        <p class="text-[11px] text-zinc-400 leading-snug">${sent ? `You last sent your update ${esc(ago(sent))}${since ? ` · ${since} workout${since === 1 ? "" : "s"} since` : ""}.` : "You haven't sent your update yet."} ${others ? "" : "Send it to the group chat, and ask them to send theirs."} Every workout you send to your buddies updates the board too.</p>
        <div class="flex flex-wrap gap-2"><button type="button" class="pt-b ${due ? "go" : ""}" id="pt-f2-send">📣 Send my update</button><button type="button" class="pt-b" id="pt-f2-paste">📋 Paste update</button></div>
        <input type="text" id="pt-f2-text" placeholder="Or paste a message or code here" aria-label="Paste a code"><button type="button" class="pt-b" id="pt-f2-add">Add</button>
        ${named ? `<span class="text-[10px] text-zinc-500">Your name on the board</span><input type="text" id="pt-f2-name" placeholder="Your name for the board" value="${esc(myName(a))}" maxlength="24" aria-label="Your name">` : ""}</div>
      ${seas}
      ${chalHtml(a, ppl)}`;
  }
  function drawFam(a) {
    const box = document.querySelector("#pt-pg-fam > div"); if (!box) return;
    box.innerHTML = boardHtml(a);
  }
  const oPV = proto.renderProgressView;
  proto.renderProgressView = function () {
    const r = oPV.apply(this, arguments);
    try { drawFam(this); } catch (e) { console.error("PulseTrack group board 2.53", e); }
    return r;
  };

  /* ============================================================== sharing */
  async function deliver(a, title, text) {
    try { if (navigator.share) { await navigator.share({ title, text }); PT.famMarkSent(); return true; } } catch (e) { if (e && e.name === "AbortError") return false; }
    try { await navigator.clipboard.writeText(text); a.toast("Copied. Paste it in your group chat"); } catch (e) { await PT.alert("Copy this:\n\n" + text); }
    PT.famMarkSent(); return true;
  }
  const summaryLine = a => { const r = myRec(a, 1), w = r.wk[0]; return `${score(w)} pts this week · ${w.d} of ${effG(w.g)} days${r.st ? " · " + r.st + " week streak 🔥" : ""}`; };
  async function sendUpdate(a, askName) {
    if (!(await ensureName(a))) return;
    const n = myName(a), text = askName
      ? `Hey ${askName}, send me your PulseTrack update when you can 💪 Here is mine (${summaryLine(a)}). In PulseTrack: Progress > Social > Paste update.\n${code(a)}`
      : `${n}'s PulseTrack update: ${summaryLine(a)}. In PulseTrack: Progress > Social > Paste update.\n${code(a)}`;
    if (await deliver(a, "PulseTrack update", text)) { try { a.renderProgressView(); } catch (e) { } }
  }
  async function shareChallenge(a) {
    const c = a.settings.famChal; if (!c) return; if (!(await ensureName(a))) return;
    const text = `PulseTrack group challenge: ${c.t}. In PulseTrack: Progress > Social > Paste update.\n${enc("PTC1", c)}\n${code(a)}`;
    await deliver(a, "Group challenge", text);
  }
  async function pasteClipboard(a) {
    let txt = ""; try { txt = await navigator.clipboard.readText(); } catch (e) { txt = ""; }
    if (txt && /(PTF2|PT1|PTB1|PTC1|PTR1|PTW1)\./.test(txt)) { importText(a, txt); a.renderProgressView(); return; }
    const i = $("pt-f2-text"); if (i) { try { i.focus(); i.scrollIntoView({ block: "center" }); } catch (e) { } }
    a.toast(txt ? "Nothing from PulseTrack in your clipboard" : "Paste the message in the box, then tap Add");
  }

  document.addEventListener("click", async e => {
    const a = A(); if (!a || !e.target.closest) return; const t = id => e.target.closest("#" + id), on = sel => e.target.closest(sel);
    const w = on("[data-f2w]"); if (w) { a.__f2w = w.dataset.f2w; a.renderProgressView(); return; }
    const c = on("[data-f2c]"); if (c) { a.__f2c = c.dataset.f2c; a.renderProgressView(); return; }
    const cs = on("[data-f2cs]"); if (cs) { a.__f2cs = cs.dataset.f2cs; a.renderProgressView(); return; }
    const ask = on("[data-f2ask]"); if (ask) { sendUpdate(a, ask.dataset.f2ask); return; }
    const del = on("[data-f2del]");
    if (del) {
      const n = del.dataset.f2del, k = n.toLowerCase(), f2 = fam2(a);
      Object.keys(f2).forEach(x => { if (x.toLowerCase() === k) delete f2[x]; });
      a.settings.family = arr(a, "family").filter(x => String(x.n).toLowerCase() !== k);
      const wall = a.settings.wall || {}; Object.keys(wall).forEach(x => { if (x.toLowerCase() === k) delete wall[x]; });
      save(); a.renderProgressView(); return;
    }
    if (t("pt-f2-send")) { sendUpdate(a); return; }
    if (t("pt-f2-paste")) { pasteClipboard(a); return; }
    if (t("pt-f2-add")) { const i = $("pt-f2-text"); importText(a, i ? i.value : ""); a.renderProgressView(); return; }
    if (t("pt-f2-chal-new")) { if (!(await ensureName(a))) return; const k = a.__f2cs || "sc"; a.settings.famChal = { s: k, w: dsOf(wkMon(0)), t: CH[k] + " this week" }; save(); a.renderProgressView(); setTimeout(() => shareChallenge(A()), 200); return; }
    if (t("pt-f2-chal-share")) { shareChallenge(a); return; }
    if (t("pt-f2-chal-end")) { a.settings.famChal = null; save(); a.renderProgressView(); return; }
  }, false);
  document.addEventListener("change", e => {
    const a = A(); if (!a || !e.target || e.target.id !== "pt-f2-name") return;
    const v = clip(e.target.value.trim(), 24); if (v) { a.settings.myName = v; save(); }
  });
  /* the Buddies paste box understands the new update code too (it runs first, then the rest of that box carries on if nothing here matched) */
  document.addEventListener("click", e => {
    const a = A(); if (!a || !e.target.closest || !e.target.closest("#pt-code-add")) return;
    const i = $("pt-code-paste"), txt = i ? i.value : ""; if (!/PTF2\./.test(txt)) return;
    e.stopPropagation(); importText(a, txt); a.renderProgressView();
  }, true);

  /* ============================================================== the finish screen: say it is for the family too */
  function polishSummaryBtn() {
    const b = $("pt-summary-send"); if (!b) return; const a = A();
    b.textContent = "🤝 Send to group & buddies";
    if (PT.famDue && PT.famDue(a)) b.className = "w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl tap-active text-sm";
  }
  const oFin = proto.finishWorkoutV2;
  if (oFin) proto.finishWorkoutV2 = async function () { const r = await oFin.apply(this, arguments); try { polishSummaryBtn(); } catch (e) { } return r; };

  /** 2.63.0: what the family recap (m90a) reads */
  PT.famReceive = receive;   // 2.89.0: the live board feeds what it receives through here too
  PT.famKit = { people, season, score, cons, effG, wkMon, dsOf, myName, ago, CATS, num };

  const css = document.createElement("style"); css.id = "pt-v253-fam-css";
  css.textContent = `
    .pt-f2row { display: flex; gap: .55rem; align-items: flex-start; padding: .6rem .7rem; border-radius: .8rem; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); }
    .pt-f2row.me { border-color: rgb(var(--a500) / .6); }
    .pt-f2row.dim { opacity: .75; }
    .pt-f2rk { flex: none; width: 1.3rem; text-align: center; font-weight: 900; font-size: .85rem; color: rgb(var(--z500)); padding-top: .05rem; }
    .pt-f2row.first .pt-f2rk { color: #fbbf24; }
    .pt-f2val { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-weight: 800; font-size: .82rem; color: rgb(var(--z100)); }
    .pt-f2sub { font-size: .68rem; color: rgb(var(--z400)); line-height: 1.35; margin-top: .1rem; }
    .pt-f2stale { color: #fbbf24; }
    .pt-f2ask { display: inline-flex; align-items: center; min-height: 1.9rem; padding: 0 .25rem; margin: -.4rem 0; background: none; border: 0; font: inherit; font-weight: 800; color: rgb(var(--a400)); text-decoration: underline; }
    .pt-f2box { display: flex; flex-direction: column; gap: .45rem; padding: .7rem; border-radius: .9rem; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); }
    .pt-f2h { font-size: .62rem; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; color: rgb(var(--z500)); }
    html[data-mode="light"] .pt-f2row.first .pt-f2rk, html[data-mode="light"] .pt-f2stale { color: #b45309; }
  `;
  document.head.appendChild(css);
})();
  