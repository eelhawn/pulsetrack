
/* =====================================================================
 * PulseTrack 2.63.0: family weekly recap.
 *  Progress -> Social -> Family recap: one card for the week with who won, everyone's days and records, a few highlights (most records, longest streak, best
 *  progress, the family's workouts together) and the people who have not sent an update yet (with Ask for update). It reads the same updates as the family
 *  board, so nothing new has to be sent. Share as picture, or Copy as text for the family chat.
 *  Home: on Monday and Tuesday one line says last week's recap is ready (once per week). Settings: settings.famRecapSeen = the week it was last opened or dismissed.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined" || !PT.famKit) return;
  const proto = ApplicationUI.prototype;
  const $ = id => document.getElementById(id), A = () => window.app, esc = s => PT.esc(s);
  const K = PT.famKit, DAY = 86400000;
  const save = a => { try { WorkoutStorage.saveSettings(a.settings); } catch (e) { } };
  const view = { w: "last", open: false };

  /* ================================================================ the numbers */
  function recap(a, which) {
    const ppl = K.people(a), mon = K.wkMon(which === "this" ? 0 : 1), wid = K.dsOf(mon);
    const all = Object.values(ppl), name = p => (p.me ? (K.myName(a) || "You") : p.n);
    const rows = all.filter(p => p.wk[wid]).map(p => ({ p, n: name(p), w: p.wk[wid], sc: K.score(p.wk[wid]) })).sort((x, y) => y.sc - x.sc || (x.p.me ? -1 : 1));
    const missing = all.filter(p => !p.wk[wid] && !p.me);
    const winner = rows.length >= 2 && rows[0].sc > 0 && rows[0].sc > rows[1].sc ? rows[0] : null;
    const tied = rows.length >= 2 && rows[0].sc > 0 && rows[0].sc === rows[1].sc ? rows.filter(r => r.sc === rows[0].sc) : null;
    const best = (list, f) => { let m = 0; list.forEach(x => { m = Math.max(m, f(x)); }); return m > 0 ? list.filter(x => f(x) === m) : []; };
    const prs = best(rows, r => K.num(r.w.p)), streak = best(all, p => K.num(p.st)), prog = best(all.filter(p => p.pg != null), p => K.num(p.pg));
    const together = { d: rows.reduce((t, r) => t + K.num(r.w.d), 0), p: rows.reduce((t, r) => t + K.num(r.w.p), 0) };
    return { wid, mon, rows, missing, winner, tied, together, name,
      prs: prs.length ? { who: prs.map(r => r.n), v: K.num(prs[0].w.p) } : null,
      streak: streak.length && K.num(streak[0].st) >= 2 ? { who: streak.map(name), v: K.num(streak[0].st) } : null,
      prog: prog.length && K.num(prog[0].pg) > 0 ? { who: prog.map(name), v: Math.round(K.num(prog[0].pg) * 10) / 10 } : null };
  }
  const range = R => `${PT.fmtDate(R.wid, { month: "short", day: "numeric" })} – ${PT.fmtDate(K.dsOf(R.mon + 6 * DAY), { month: "short", day: "numeric" })}`;
  const list = who => (who.length <= 2 ? who.join(" and ") : who.slice(0, 2).join(", ") + " and " + (who.length - 2) + " more");
  const dayTxt = r => `${K.num(r.w.d)} of ${K.effG(r.w.g)} days`;
  const prTxt = n => (n > 0 ? ` · ${n} record${n === 1 ? "" : "s"}` : "");
  function headline(R) {
    if (R.rows.length < 2) return "";
    if (R.winner) return `👑 ${R.winner.n} won with ${R.winner.sc} pts`;
    if (R.tied) return `🤝 Tied at the top: ${list(R.tied.map(r => r.n))} (${R.tied[0].sc} pts)`;
    return "";
  }
  function lines(R) {
    const out = [];
    if (R.prs) out.push(`💪 Most records: ${list(R.prs.who)} (${R.prs.v})`);
    if (R.streak) out.push(`🔥 Longest streak: ${list(R.streak.who)} (${R.streak.v} weeks)`);
    if (R.prog) out.push(`📈 Best progress: ${list(R.prog.who)} (+${R.prog.v}% in 4 weeks)`);
    if (R.rows.length >= 2) out.push(`🤝 Together: ${R.together.d} workouts${R.together.p ? ", " + R.together.p + " record" + (R.together.p === 1 ? "" : "s") : ""}`);
    return out;
  }
  function textOf(R) {
    const hl = headline(R), L = lines(R);
    return [`PulseTrack group recap · ${range(R)}`, hl, ...R.rows.map((r, i) => `${i + 1}. ${r.n}: ${r.sc} pts · ${dayTxt(r)}${prTxt(K.num(r.w.p))}`), ...L, R.missing.length ? `No update yet: ${list(R.missing.map(p => p.n))}` : ""].filter(Boolean).join("\n");
  }

  /* ================================================================ the card */
  function cardInner(a) {
    const R = recap(a, view.w), hl = headline(R);
    const chips = `<div class="flex gap-1.5">${[["last", "Last week"], ["this", "This week"]].map(([k, l]) => `<button type="button" data-frw="${k}" aria-pressed="${view.w === k}" class="pt-opt tap-active">${l}</button>`).join("")}</div>`;
    if (!R.rows.length) return `${chips}<p class="text-xs text-zinc-400">Nothing for this week yet. Train and send your update.</p>`;
    const top = Math.max(1, ...R.rows.map(r => r.sc));
    const rows = R.rows.map((r, i) => `<div class="space-y-1"><div class="flex items-center justify-between gap-2 text-xs"><span class="min-w-0 truncate ${r.p.me ? "font-black text-white" : "text-zinc-200"}">${i === 0 && R.winner ? "👑 " : ""}${esc(r.n)}</span><span class="shrink-0 font-mono font-bold text-zinc-100">${r.sc} pts</span></div>
        <div class="pt-lv-bar"><span style="width:${Math.round(r.sc / top * 100)}%;background:${r.p.me ? "rgb(var(--a500))" : "#71717a"}"></span></div><div class="text-[10px] text-zinc-500">${esc(dayTxt(r))}${esc(prTxt(K.num(r.w.p)))}</div></div>`).join("");
    const miss = R.missing.length ? `<div class="text-[11px] text-amber-300 leading-snug">No update yet: ${R.missing.map(p => `${esc(p.n)} <button type="button" class="pt-f2ask tap-active" data-f2ask="${esc(p.n)}">Ask</button>`).join(" · ")}</div>` : "";
    const hi = lines(R).map(l => `<div class="text-[11px] text-zinc-300">${esc(l)}</div>`).join("");
    return `${chips}<span class="block text-[11px] text-zinc-500">${esc(range(R))}</span>${hl ? `<div class="text-sm font-black text-white">${esc(hl)}</div>` : ""}<div class="space-y-2.5">${rows}</div>${hi ? `<div class="space-y-1">${hi}</div>` : ""}${miss}
      <div class="flex flex-wrap gap-2"><button type="button" class="pt-b go" id="pt-frc-pic">Share as picture</button><button type="button" class="pt-b" id="pt-frc-txt">Copy as text</button></div>`;
  }
  function draw(a) {
    const root = $("progress-body"); if (!root) return;
    const old = $("pt-pg-famrecap"); if (old) old.remove();
    const d = document.createElement("details");
    d.className = "pt-pg"; d.id = "pt-pg-famrecap"; if (view.open) d.open = true;
    d.innerHTML = `<summary><span class="text-xs font-bold text-white">🗓️ Group recap</span><span class="pt-chev">›</span></summary><div class="space-y-2.5">${cardInner(a)}</div>`;
    d.addEventListener("toggle", () => { view.open = d.open; if (d.open) markSeen(a); });
    root.appendChild(d);
  }
  function redraw(a) { const d = $("pt-pg-famrecap"); if (d) d.querySelector(":scope > div").innerHTML = cardInner(a); }
  const oPV = proto.renderProgressView;
  proto.renderProgressView = function () {
    const r = oPV.apply(this, arguments);
    try { draw(this); } catch (e) { console.error("PulseTrack group recap", e); }
    return r;
  };

  /* ================================================================ picture and text */
  async function sharePic(a) {
    const R = recap(a, view.w), W = 1080, H = 1350, cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    const g = cv.getContext("2d"), acc = PT.accent(), font = (w, s) => `${w} ${s}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;
    const grad = g.createLinearGradient(0, 0, 0, H); grad.addColorStop(0, "#18181b"); grad.addColorStop(1, "#09090b"); g.fillStyle = grad; g.fillRect(0, 0, W, H);
    g.fillStyle = acc; g.fillRect(0, 0, W, 14);
    const fit = (t, max, w, s) => { g.font = font(w, s); let x = String(t); while (g.measureText(x).width > max && x.length > 4) x = x.slice(0, -2); return x === String(t) ? x : x + "…"; };
    g.fillStyle = acc; g.font = font(900, 44); g.fillText("PULSETRACK", 80, 120);
    g.fillStyle = "#ffffff"; g.font = font(900, 84); g.fillText("Group recap", 80, 245);
    g.fillStyle = "#a1a1aa"; g.font = font(600, 34); g.fillText(range(R), 80, 305);
    let y = 400; const hl = headline(R);
    if (hl) { g.fillStyle = "#fbbf24"; g.font = font(900, 50); g.fillText(fit(hl, W - 160, 900, 50), 80, y); y += 40; }
    const top = Math.max(1, ...R.rows.map(r => r.sc)), rowsShown = R.rows.slice(0, 6), step = 118;
    rowsShown.forEach((r, i) => {
      y += step - (i === 0 && !hl ? 40 : 0);
      g.fillStyle = r.p.me ? "#ffffff" : "#e4e4e7"; g.font = font(800, 40); g.fillText(fit(`${i + 1}. ${r.n}`, 640, 800, 40), 80, y);
      g.fillStyle = "#e4e4e7"; g.font = font(900, 40); g.textAlign = "right"; g.fillText(r.sc + " pts", W - 80, y); g.textAlign = "left";
      g.fillStyle = "#27272a"; g.fillRect(80, y + 16, W - 160, 16); g.fillStyle = r.p.me ? acc : "#71717a"; g.fillRect(80, y + 16, Math.max(8, (W - 160) * r.sc / top), 16);
      g.fillStyle = "#71717a"; g.font = font(600, 26); g.fillText(`${dayTxt(r)}${prTxt(K.num(r.w.p))}`, 80, y + 62);
    });
    y += 120; g.font = font(700, 32);
    lines(R).slice(0, 4).forEach(l => { g.fillStyle = "#d4d4d8"; g.fillText(fit(l, W - 160, 700, 32), 80, y); y += 52; });
    if (R.missing.length) { g.fillStyle = "#fbbf24"; g.font = font(700, 30); g.fillText(fit("No update yet: " + list(R.missing.map(p => p.n)), W - 160, 700, 30), 80, y + 10); }
    g.fillStyle = "#52525b"; g.font = font(600, 26); g.fillText("Tracked with PulseTrack", 80, H - 60);
    try {
      const blob = await new Promise((res, rej) => cv.toBlob(b => b ? res(b) : rej(new Error("toBlob")), "image/png"));
      await a.shareFile(new File([blob], `pulsetrack-family-${R.wid}.png`, { type: "image/png" }), "PulseTrack group recap");
    } catch (e) { a.toast("Could not create the picture"); }
  }
  async function shareText(a) {
    const text = textOf(recap(a, view.w));
    try { if (navigator.share) { await navigator.share({ title: "PulseTrack group recap", text }); return; } } catch (e) { if (e && e.name === "AbortError") return; }
    try { await navigator.clipboard.writeText(text); a.toast("Copied. Paste it in your group chat"); } catch (e) { await PT.alert("Copy this:\n\n" + text); }
  }
  PT.famRecapText = (a, which) => textOf(recap(a || A(), which || "last"));

  /* ================================================================ Home: one line on Monday and Tuesday */
  function markSeen(a) { const wid = K.dsOf(K.wkMon(1)); if (a.settings.famRecapSeen !== wid) { a.settings.famRecapSeen = wid; save(a); } }
  const oBan = proto.renderHomeBanners;
  if (typeof oBan === "function") proto.renderHomeBanners = function () {
    const r = oBan.apply(this, arguments);
    // while the app is still being built (the first Home draw) window.app does not exist yet and the recap reads it: draw again a moment later
    if (!window.app) { setTimeout(() => { try { if (window.app) this.renderHomeBanners(); } catch (e) { } }, 0); return r; }
    try {
      const a = this, box = $("home-banners"), dow = new Date().getDay();
      if (!box || (dow !== 1 && dow !== 2) || a.settings.famRecapSeen === K.dsOf(K.wkMon(1))) return r;
      const R = recap(a, "last"); if (R.rows.length < 2) return r;
      const el = document.createElement("div");
      el.className = "border border-emerald-800/60 bg-emerald-950/30 rounded-xl p-3 text-xs text-zinc-300 flex items-start gap-3"; el.setAttribute("data-banner", "famrecap");
      el.innerHTML = `<div class="flex-grow leading-relaxed"><b class="text-white">Group recap is ready.</b> ${esc(headline(R) || "See how last week went.")}</div>
        <div class="flex flex-col gap-1.5 shrink-0"><button type="button" class="pt-frb-go px-2.5 py-1.5 bg-emerald-600 text-white font-bold rounded-lg tap-active">Open</button><button type="button" class="pt-frb-no px-2.5 py-1.5 bg-zinc-800 text-zinc-300 rounded-lg tap-active">Later</button></div>`;
      box.insertBefore(el, box.firstChild);
      el.querySelector(".pt-frb-no").addEventListener("click", () => { markSeen(a); a.renderHomeBanners(); });
      el.querySelector(".pt-frb-go").addEventListener("click", () => {
        markSeen(a); view.w = "last"; view.open = true; a.showView("progress");
        setTimeout(() => { try { const t = document.querySelector(".pt-ptab[data-tab=social]"); if (t) t.click(); const d = $("pt-pg-famrecap"); if (d) { d.open = true; d.scrollIntoView({ block: "start" }); } } catch (e) { } }, 350);
      });
    } catch (e) { console.error("PulseTrack group recap banner", e); }
    return r;
  };

  document.addEventListener("click", e => {
    const a = A(); if (!a || !e.target.closest) return;
    const w = e.target.closest("[data-frw]"); if (w) { view.w = w.dataset.frw; redraw(a); return; }
    if (e.target.closest("#pt-frc-pic")) { sharePic(a); return; }
    if (e.target.closest("#pt-frc-txt")) { shareText(a); }
  });
})();
  