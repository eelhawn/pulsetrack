
/* =====================================================================
 * PulseTrack 2.32.0 (C): look and track.
 *  - Progress photos: a guided camera (ghost of your last photo, self-timer), a before/after slider and a share card,
 *    photo tips and a weekly nudge. Photos stay on the phone.
 *  - Measurements: trends with change since last month, and goal dates.
 *  - Physique map: which muscles are getting the work and which are lagging, with a one-tap workout for the lagging ones.
 *  - Goal physique: lean / bulk / recomp targets for calories and protein, and a check on whether you are on track.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  const proto = ApplicationUI.prototype;
  const A = () => window.app;
  const $ = id => document.getElementById(id);
  const esc = s => PT.esc(s);
  const DAY = 86400000, LB = 2.2046226;
  const save = () => { try { WorkoutStorage.saveSettings(A().settings); } catch (e) { } };
  const num = v => { const n = parseFloat(v); return isFinite(n) ? n : 0; };
  const fmt = v => Math.round(v).toLocaleString();
  const unitKg = () => A().unit() === "kg";
  const chip = (attr, label, on) => `<button type="button" ${attr} aria-pressed="${on}" class="pt-opt tap-active">${esc(label)}</button>`;
  const card = "bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3";
  const S = a => a.sessions || [];
  const toLb = (v, from) => (from === "kg" ? v * LB : v);
  const bestE1 = (a, s) => { const m = {}; (s.ex || []).forEach(e => { let b = 0; (e.sets || []).forEach(st => { if (st.t !== "W") b = Math.max(b, a.setE1rm(e.name, st, s.date) || 0); }); if (b > 0) m[e.name] = b; }); return m; };
  const sessTime = s => s.ts || (PT.fromDs && PT.fromDs(s.date) ? PT.fromDs(s.date).getTime() : 0);

  /* ============================================================== photos */
  const allPhotos = async () => { try { return (await PhotoDB.all()).sort((x, y) => (x.ts || 0) - (y.ts || 0)); } catch (e) { return []; } };
  let photoInfo = { count: 0, last: 0 };
  async function refreshPhotoInfo() { const l = await allPhotos(); photoInfo = { count: l.length, last: l.length ? l[l.length - 1].ts || 0 : 0 }; return photoInfo; }
  PT.photoInfo = () => photoInfo; PT.refreshPhotoInfo = refreshPhotoInfo;
  /** days since the last progress photo, or null when there are none */
  PT.photoAgeDays = () => (photoInfo.last ? Math.floor((Date.now() - photoInfo.last) / DAY) : null);

  const tipsHtml = `<div class="space-y-2 text-sm text-zinc-300 leading-snug">
    <p><b class="text-white">Same spot, same light.</b> Pick one wall and one lamp or window, and use it every time.</p>
    <p><b class="text-white">Same time of day.</b> Mornings before eating are the most consistent.</p>
    <p><b class="text-white">Same distance and pose.</b> Prop the phone at chest height about 6 feet away. Use the guided camera: it fades your last photo over the preview so you can line up.</p>
    <p><b class="text-white">Relaxed, then flexed.</b> Take the relaxed front, side and back first. Add a flex shot if you like.</p>
    <p><b class="text-white">Once a week is plenty.</b> Changes are slow. Compare a month or more apart.</p>
    <p class="text-xs text-zinc-500">Photos stay on this phone only. They are not part of the backup file.</p></div>`;
  function openTips() { A().openSheet("Photo tips", "Same pose, same light", tipsHtml, ""); }

  /* guided camera */
  const CAM = { stream: null, facing: "user", timer: 0, ghost: true, busy: false };
  async function startStream() {
    if (CAM.stream) CAM.stream.getTracks().forEach(t => t.stop());
    CAM.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: CAM.facing, width: { ideal: 1280 }, height: { ideal: 1706 } }, audio: false });
    const v = $("pt-cam-video"); if (v) { v.srcObject = CAM.stream; v.style.transform = CAM.facing === "user" ? "scaleX(-1)" : ""; try { await v.play(); } catch (e) { } }
  }
  function stopCam() { if (CAM.stream) { CAM.stream.getTracks().forEach(t => t.stop()); CAM.stream = null; } const o = $("pt-cam"); if (o) o.remove(); document.body.classList.remove("pt-cam-on"); }
  async function openCam() {
    const a = A();
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { a.toast("This browser has no camera access. Use Add Photo instead"); return; }
    const last = (await allPhotos()).pop(); let ghostUrl = "";
    if (last) ghostUrl = a.photoUrl(last.blob, "cam");
    const o = document.createElement("div"); o.id = "pt-cam"; o.setAttribute("role", "dialog"); o.setAttribute("aria-label", "Guided camera");
    o.innerHTML = `<video id="pt-cam-video" autoplay playsinline muted></video>${ghostUrl ? `<img id="pt-cam-ghost" src="${ghostUrl}" alt="" style="opacity:.35">` : ""}<div class="pt-cam-grid" aria-hidden="true"><i></i><i></i></div><div id="pt-cam-count" class="hidden"></div>
      <div class="pt-cam-top"><button type="button" id="pt-cam-x" aria-label="Close camera">✕</button>${ghostUrl ? '<button type="button" id="pt-cam-ghostbtn" aria-pressed="true">👻 Last photo</button>' : "<span></span>"}<button type="button" id="pt-cam-flip" aria-label="Switch camera">🔄</button></div>
      <div class="pt-cam-bot"><button type="button" id="pt-cam-timer" aria-label="Self timer">⏱ Off</button><button type="button" id="pt-cam-shot" aria-label="Take photo"><i></i></button><span class="pt-cam-spacer"></span></div>`;
    document.body.appendChild(o); document.body.classList.add("pt-cam-on"); CAM.timer = 0; CAM.ghost = true; CAM.busy = false;
    try { await startStream(); } catch (e) { stopCam(); a.toast("Could not open the camera. Check permission, or use Add Photo"); }
  }
  async function shoot() {
    if (CAM.busy) return; CAM.busy = true; const a = A();
    if (CAM.timer) { const c = $("pt-cam-count"); c.classList.remove("hidden"); for (let n = CAM.timer; n > 0; n--) { if (!$("pt-cam")) { CAM.busy = false; return; } c.textContent = n; await new Promise(r => setTimeout(r, 1000)); } c.classList.add("hidden"); }
    const v = $("pt-cam-video"); if (!v || !v.videoWidth) { CAM.busy = false; a.toast("The camera is not ready yet"); return; }
    try {
      const sc = Math.min(1, 1600 / Math.max(v.videoWidth, v.videoHeight)), w = Math.round(v.videoWidth * sc), h = Math.round(v.videoHeight * sc), cv = document.createElement("canvas"); cv.width = w; cv.height = h; const g = cv.getContext("2d");
      if (CAM.facing === "user") { g.translate(w, 0); g.scale(-1, 1); } g.drawImage(v, 0, 0, w, h);
      const blob = await new Promise((res, rej) => cv.toBlob(b => b ? res(b) : rej(new Error("toBlob")), "image/jpeg", 0.85));
      await PhotoDB.put({ id: PT.uid(), date: PT.ds(), ts: Date.now(), blob });
      try { navigator.vibrate && navigator.vibrate(40); } catch (e) { }
      stopCam(); await refreshPhotoInfo(); a.toast("Photo saved"); if (a.renderPhotos) a.renderPhotos();
    } catch (e) { a.toast("Could not save the photo"); }
    CAM.busy = false;
  }

  /* before / after slider and share card */
  const pair = async () => { const a = A(), ps = (a.photoSel || []).map(id => (a._photos || []).find(p => p.id === id)).filter(Boolean).sort((x, y) => (x.ts || 0) - (y.ts || 0)); return ps.length === 2 ? ps : null; };
  async function openSlider() {
    const a = A(), ps = await pair(); if (!ps) { a.toast("Pick two photos first"); return; }
    const days = Math.round(((ps[1].ts || 0) - (ps[0].ts || 0)) / DAY), d = p => PT.fmtDate(p.date, { month: "short", day: "numeric", year: "2-digit" });
    PT.__ba = ps;
    a.openSheet("Before and after", `${days} day${days === 1 ? "" : "s"} apart`, `<div class="pt-slide" id="pt-slide"><img class="pt-sl-after" src="${a.photoUrl(ps[1].blob, "sheet")}" alt="After photo ${esc(ps[1].date)}"><img class="pt-sl-before" id="pt-sl-before" src="${a.photoUrl(ps[0].blob, "sheet")}" alt="Before photo ${esc(ps[0].date)}" style="clip-path:inset(0 50% 0 0)"><i class="pt-knob" id="pt-knob" style="left:50%"></i><span class="pt-sl-tag l">BEFORE · ${esc(d(ps[0]))}</span><span class="pt-sl-tag r">AFTER · ${esc(d(ps[1]))}</span></div>
      <input type="range" id="pt-slide-rng" min="0" max="100" value="50" aria-label="Slide between before and after" class="w-full mt-3"><div class="flex gap-2 mt-2"><button type="button" class="pt-b go" id="pt-ba-share">Share before/after</button></div>`, "");
  }
  function statsBetween(a, t0, t1) {
    const ss = S(a).filter(s => sessTime(s) > t0 && sessTime(s) <= t1);
    const bw = (a.body || []).filter(b => b.bw > 0 && PT.fromDs(b.date)).map(b => ({ t: PT.fromDs(b.date).getTime(), v: b.bw })).sort((x, y) => x.t - y.t);
    const near = t => bw.length ? bw.reduce((m, p) => (Math.abs(p.t - t) < Math.abs(m.t - t) ? p : m)) : null, b0 = near(t0), b1 = near(t1);
    const best = tt => { const m = {}; S(a).forEach(s => { if (sessTime(s) <= tt) { const e = bestE1(a, s); Object.keys(e).forEach(n => { m[n] = Math.max(m[n] || 0, toLb(e[n], s.unit)); }); } }); return m; };
    const m0 = best(t0), m1 = best(t1); let big = null; Object.keys(m1).forEach(n => { if (m0[n] > 0 && m1[n] > m0[n]) { const g = m1[n] - m0[n]; if (!big || g > big.g) big = { n, g }; } });
    return { workouts: ss.length, dw: b0 && b1 && b0 !== b1 ? b1.v - b0.v : null, big };
  }
  async function shareBA() {
    const a = A(), ps = PT.__ba; if (!ps) return;
    try {
      const load = blob => new Promise((res, rej) => { const u = URL.createObjectURL(blob), im = new Image(); im.onload = () => { res(im); setTimeout(() => URL.revokeObjectURL(u), 3000); }; im.onerror = rej; im.src = u; });
      const [i0, i1] = await Promise.all(ps.map(p => load(p.blob)));
      const W = 1080, H = 1350, cv = document.createElement("canvas"); cv.width = W; cv.height = H; const g = cv.getContext("2d"), acc = PT.accent();
      const font = (w, s) => `${w} ${s}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;
      const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, "#1c1c20"); bg.addColorStop(1, "#09090b"); g.fillStyle = bg; g.fillRect(0, 0, W, H);
      g.fillStyle = acc; g.fillRect(0, 0, W, 14); g.font = font(900, 40); g.fillText("PULSETRACK", 60, 100);
      g.fillStyle = "#fff"; g.font = font(900, 70); const days = Math.round(((ps[1].ts || 0) - (ps[0].ts || 0)) / DAY); g.fillText(`${days} day${days === 1 ? "" : "s"} of work`, 60, 190);
      const pw = 480, ph = 640, py = 240;
      [[i0, 60, "BEFORE", ps[0]], [i1, 540, "AFTER", ps[1]]].forEach(([im, x, lab, p]) => {
        g.save(); g.beginPath(); if (g.roundRect) g.roundRect(x, py, pw, ph, 28); else g.rect(x, py, pw, ph); g.clip();
        const s = Math.max(pw / im.naturalWidth, ph / im.naturalHeight), dw = im.naturalWidth * s, dh = im.naturalHeight * s; g.drawImage(im, x + (pw - dw) / 2, py + (ph - dh) / 2, dw, dh); g.restore();
        g.fillStyle = "rgb(0 0 0 / .6)"; g.fillRect(x, py + ph - 90, pw, 90); g.fillStyle = "#fff"; g.font = font(900, 34); g.fillText(lab, x + 24, py + ph - 48); g.fillStyle = "#d4d4d8"; g.font = font(600, 26); g.fillText(PT.fmtDate(p.date, { month: "short", day: "numeric", year: "numeric" }), x + 24, py + ph - 14);
      });
      const st = statsBetween(a, ps[0].ts || 0, ps[1].ts || Date.now()), lines = [];
      if (st.dw !== null) lines.push(["Body weight", `${st.dw > 0 ? "+" : ""}${(Math.round((unitKg() ? st.dw : st.dw) * 10) / 10)} ${unitKg() ? "kg" : "lb"}`]);
      lines.push(["Workouts", String(st.workouts)]); if (st.big) lines.push(["Biggest lift gain", `${st.big.n} +${fmt(unitKg() ? st.big.g / LB : st.big.g)} ${unitKg() ? "kg" : "lb"}`]);
      let y = py + ph + 90; lines.slice(0, 3).forEach(([k, v]) => { g.fillStyle = "#71717a"; g.font = font(800, 28); g.textAlign = "left"; g.fillText(k.toUpperCase(), 60, y); g.fillStyle = "#fff"; g.font = font(900, 38); g.textAlign = "right"; g.fillText(v, W - 60, y); y += 66; });
      g.textAlign = "left"; g.fillStyle = "#52525b"; g.font = font(600, 26); g.fillText((a.settings.myName ? a.settings.myName + " · " : "") + "Tracked with PulseTrack", 60, H - 50);
      const blob = await new Promise((res, rej) => cv.toBlob(b => b ? res(b) : rej(new Error("toBlob")), "image/png"));
      await a.shareFile(new File([blob], "pulsetrack-before-after.png", { type: "image/png" }), "Before and after");
    } catch (e) { console.error("before/after", e); a.toast("Could not create the picture"); }
  }

  /* ============================================================== measurement trends */
  const METRICS = [["bw", "Weight"], ["bf", "Body fat"], ["waist", "Waist"], ["chest", "Chest"], ["arms", "Arms"], ["thighs", "Thighs"]];
  const unitOf = k => (k === "bw" ? A().wLabel() : k === "bf" ? "%" : A().lenLabel());
  const goodDir = (a, k) => { if (k === "waist" || k === "bf") return -1; if (k === "bw") { const g = (a.settings.phys || {}).goal; return g === "lean" ? -1 : g === "bulk" ? 1 : 0; } return 1; };
  function series(a, k) { return (a.body || []).filter(b => num(b[k]) > 0 && PT.fromDs(b.date)).map(b => ({ x: PT.fromDs(b.date).getTime(), y: num(b[k]) })).sort((x, y) => x.x - y.x); }
  function slope(pts) { if (pts.length < 3) return 0; const x0 = pts[0].x, xs = pts.map(p => (p.x - x0) / (7 * DAY)), ys = pts.map(p => p.y), n = xs.length, mx = xs.reduce((s, v) => s + v, 0) / n, my = ys.reduce((s, v) => s + v, 0) / n, den = xs.reduce((t, v) => t + (v - mx) ** 2, 0); return den ? xs.reduce((t, v, i) => t + (v - mx) * (ys[i] - my), 0) / den : 0; }
  PT.measProjection = function (a, k) {
    const goal = ((a.settings.measGoals || {})[k]), pts = series(a, k).filter(p => p.x >= Date.now() - 56 * DAY); if (!(goal > 0) || !pts.length) return null;
    const cur = series(a, k).slice(-1)[0].y, sl = slope(pts), toward = goal > cur ? sl > 0.01 : sl < -0.01;
    if (Math.abs(goal - cur) < 0.05) return { cur, goal, done: true };
    if (!toward) return { cur, goal, weeks: null };
    const w = Math.ceil((goal - cur) / sl); return { cur, goal, weeks: w, date: w <= 260 ? new Date(Date.now() + w * 7 * DAY) : null, slope: sl };
  };
  function measHtml(a) {
    const k = METRICS.some(m => m[0] === a.__measK) ? a.__measK : "waist", have = METRICS.filter(m => series(a, m[0]).length);
    if (!have.length) return `<h3 class="text-xs font-bold text-white">Measurement trends</h3><p class="text-xs text-zinc-400">Log your weight, waist, chest, arms or thighs and the changes show up here.</p>`;
    const kk = have.some(m => m[0] === k) ? k : have[0][0], pts = series(a, kk), cutoff = Date.now() - 365 * DAY, cur = pts[pts.length - 1];
    const rows = have.map(([key, name]) => {
      const p = series(a, key), c = p[p.length - 1], ref = p.filter(q => q.x <= c.x - 28 * DAY).pop() || (p.length > 1 ? p[0] : null);
      let txt = "", col = "text-zinc-400"; if (ref && ref !== c) { const d = Math.round((c.y - ref.y) * 10) / 10, wks = Math.max(1, Math.round((c.x - ref.x) / (7 * DAY))); const g = goodDir(a, key); txt = `${d > 0 ? "+" : d < 0 ? "−" : ""}${Math.abs(d)} ${unitOf(key)} over ${wks} wk${wks === 1 ? "" : "s"}`; if (d !== 0) col = g === 0 ? "text-zinc-300" : (d * g > 0 ? "text-emerald-400" : "text-amber-400"); } else txt = "just started";
      return `<button type="button" class="pt-mrow tap-active" data-meas="${key}" aria-pressed="${key === kk}"><span class="text-xs font-bold text-white">${esc(name)}</span><span class="text-xs font-mono text-zinc-300">${PT.num(c.y)} ${unitOf(key)}</span><span class="text-[11px] ${col}">${esc(txt)}</span></button>`;
    }).join("");
    const chart = PT.lineChart([{ points: pts.filter(p => p.x >= cutoff), color: PT.accent(), width: 2.5 }], { empty: "Log a couple of entries to see the trend.", label: METRICS.find(m => m[0] === kk)[1] });
    const pr = PT.measProjection(a, kk), goal = (a.settings.measGoals || {})[kk];
    const gtxt = !goal ? "No goal set." : pr && pr.done ? "🎉 Goal reached." : pr && pr.date ? `On track for about ${PT.fmtDate(PT.ds(pr.date), { month: "short", day: "numeric", year: "numeric" })} (${pr.weeks} week${pr.weeks === 1 ? "" : "s"}).` : "Not trending toward it yet. Keep logging.";
    return `<h3 class="text-xs font-bold text-white">Measurement trends</h3><div class="pt-mrows">${rows}</div>${chart}<div class="flex items-center justify-between gap-2"><span class="text-[11px] text-zinc-300 min-w-0">${goal ? "Goal " + PT.num(goal) + " " + unitOf(kk) + ". " : ""}${esc(gtxt)}</span><button type="button" class="pt-b" id="pt-meas-goal">${goal ? "Change goal" : "Set a goal"}</button></div>`;
  }

  /* ============================================================== goal physique */
  const PHYS_GOALS = { lean: { label: "Lean out", cal: -0.2, pro: 1.0, rate: -0.005, tip: "A steady cut: about 0.5% of body weight a week." }, recomp: { label: "Recomp", cal: 0, pro: 0.9, rate: 0, tip: "Hold weight steady while you build and lean out." }, bulk: { label: "Build", cal: 0.1, pro: 0.8, rate: 0.0025, tip: "A slow gain: about 0.25% of body weight a week." } };
  function workoutsPerWeek(a) { const t = Date.now() - 28 * DAY; return S(a).filter(s => sessTime(s) >= t).length / 4; }
  function physPlan(a) {
    const p = a.settings.phys || {}, bwS = series(a, "bw"); if (!p.goal || !p.age || !p.height || !bwS.length) return null;
    const bwLb = unitKg() ? bwS[bwS.length - 1].y * LB : bwS[bwS.length - 1].y, kg = bwLb / LB, cm = p.height;
    const bmr = 10 * kg + 6.25 * cm - 5 * p.age + (p.sex === "f" ? -161 : 5), wpw = workoutsPerWeek(a), act = wpw >= 6 ? 1.725 : wpw >= 4 ? 1.55 : wpw >= 2 ? 1.375 : 1.2, tdee = bmr * act, G = PHYS_GOALS[p.goal];
    const cal = Math.round(tdee * (1 + G.cal) / 10) * 10, pro = Math.round(bwLb * G.pro / 5) * 5, fat = Math.round(cal * 0.25 / 9 / 5) * 5, carb = Math.max(0, Math.round((cal - pro * 4 - fat * 9) / 4 / 5) * 5);
    const wk = bwS.filter(q => q.x >= Date.now() - 28 * DAY), sl = slope(wk), slLb = unitKg() ? sl * LB : sl, pct = bwLb ? slLb / bwLb : 0;
    return { G, cal, pro, fat, carb, tdee: Math.round(tdee), wpw, pct, slLb, slope: sl, enough: wk.length >= 3, bwLb };
  }
  PT.physPlan = physPlan;
  function physHtml(a) {
    const p = a.settings.phys || {}, pl = physPlan(a);
    if (!pl) return `<h3 class="text-xs font-bold text-white">Goal physique</h3><p class="text-xs text-zinc-400 leading-snug">Pick lean, recomp or build, and get a daily calorie and protein target plus a check on whether your weight is moving the right way. You need a logged body weight first.</p><button type="button" class="pt-b go" id="pt-phys-edit">Set my goal</button>`;
    const G = pl.G, tgt = G.rate, diff = pl.pct - tgt; let verdict, col;
    if (!pl.enough) { verdict = "Log your weight a few times a week for a couple of weeks to see if you are on track."; col = "text-zinc-300"; }
    else if (p.goal === "recomp") { verdict = Math.abs(pl.pct) < 0.003 ? "Weight is steady. Right on target." : pl.pct > 0 ? "Weight is creeping up. Trim about 100 calories if you want to stay level." : "Weight is drifting down. Add about 100 calories to hold it."; col = Math.abs(pl.pct) < 0.003 ? "text-emerald-400" : "text-amber-300"; }
    else if (Math.abs(diff) <= 0.0025) { verdict = "On track. Keep it going."; col = "text-emerald-400"; }
    else if (p.goal === "lean") { verdict = diff < 0 ? "Losing faster than planned. Add about 150 calories to protect muscle." : "Losing slower than planned. Trim about 150 calories or add a walk."; col = "text-amber-300"; }
    else { verdict = diff > 0 ? "Gaining faster than planned. Trim about 150 calories to limit fat gain." : "Gaining slower than planned. Add about 150 calories."; col = "text-amber-300"; }
    const rt = x => (Math.round(x * 100 * 10) / 10).toFixed(1) + "% a week", logs = (a.body || []).filter(b => b.cal > 0 && PT.fromDs(b.date) && PT.fromDs(b.date).getTime() >= Date.now() - 7 * DAY), avg = k => { const l = (a.body || []).filter(b => b[k] > 0 && PT.fromDs(b.date) && PT.fromDs(b.date).getTime() >= Date.now() - 7 * DAY); return l.length ? l.reduce((n, b) => n + num(b[k]), 0) / l.length : 0; };
    const ac = avg("cal"), ap = avg("pro");
    return `<div class="flex items-center justify-between"><h3 class="text-xs font-bold text-white">Goal physique · ${esc(G.label)}</h3><button type="button" class="pt-b" id="pt-phys-edit">Edit</button></div>
      <div class="pt-tiles"><div class="pt-tile"><b>${fmt(pl.cal)}</b><span>Calories a day</span></div><div class="pt-tile"><b>${fmt(pl.pro)} g</b><span>Protein</span></div><div class="pt-tile"><b>${fmt(pl.carb)} g</b><span>Carbs</span></div><div class="pt-tile"><b>${fmt(pl.fat)} g</b><span>Fat</span></div></div>
      <p class="text-xs ${col} font-bold leading-snug">${esc(verdict)}</p>
      <p class="text-[11px] text-zinc-400 leading-snug">${esc(G.tip)} Your trend: ${pl.enough ? rt(pl.pct) : "not enough data yet"}.${ac ? ` Last 7 days you logged ${fmt(ac)} cal${ap ? " and " + fmt(ap) + " g protein" : ""} on average.` : ""}</p>
      <p class="text-[10px] text-zinc-500 leading-snug">Rough estimates (maintenance about ${fmt(pl.tdee)} cal at ${pl.wpw.toFixed(1)} workouts a week). Not medical advice. If you have a health condition, talk to a doctor or dietitian.</p>`;
  }
  function openPhys() {
    const a = A(), K = PT.kit, el = K.sheet("pt-physform", 70), p = Object.assign({ goal: "recomp", sex: "m", age: "", height: "" }, a.settings.phys || {});
    const kg = unitKg(), hv = p.height ? (kg ? Math.round(p.height) : Math.round(p.height / 2.54)) : "";
    const c = K.openSheet(el, `${K.head("Goal physique", "Used for calorie and protein targets.")}
      <div><span class="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Goal</span><div class="flex flex-wrap gap-1.5" id="pt-pg-goal">${Object.keys(PHYS_GOALS).map(k => chip(`data-pgoal="${k}"`, PHYS_GOALS[k].label, p.goal === k)).join("")}</div></div>
      <div><span class="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Sex (for the calorie formula)</span><div class="flex gap-1.5" id="pt-pg-sex">${chip('data-psex="m"', "Male", p.sex !== "f")}${chip('data-psex="f"', "Female", p.sex === "f")}</div></div>
      <div class="grid grid-cols-2 gap-2"><label class="block"><span class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">Age</span><input id="pt-pg-age" type="number" inputmode="numeric" value="${p.age || ""}"></label><label class="block"><span class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">Height (${kg ? "cm" : "in"})</span><input id="pt-pg-h" type="number" inputmode="decimal" value="${hv}"></label></div>
      <div class="sticky bottom-[calc(-1.25rem-env(safe-area-inset-bottom,0px))] -mx-5 -mb-5 px-5 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] bg-zinc-900 border-t border-zinc-800"><button type="button" id="pt-pg-save" class="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm">Save</button></div>`);
    const st = { goal: p.goal, sex: p.sex === "f" ? "f" : "m" };
    c.addEventListener("click", e => {
      const g = e.target.closest("[data-pgoal]"); if (g) { st.goal = g.dataset.pgoal; c.querySelectorAll("[data-pgoal]").forEach(b => b.setAttribute("aria-pressed", String(b === g))); return; }
      const s = e.target.closest("[data-psex]"); if (s) { st.sex = s.dataset.psex; c.querySelectorAll("[data-psex]").forEach(b => b.setAttribute("aria-pressed", String(b === s))); return; }
      if (e.target.closest("#pt-pg-save")) {
        const age = num($("pt-pg-age").value), h = num($("pt-pg-h").value); if (!(age >= 14 && age <= 90) || !(h > 0)) { a.toast("Enter your age (14 to 90) and height"); return; }
        a.settings.phys = { goal: st.goal, sex: st.sex, age, height: kg ? h : h * 2.54 }; save(); K.closeSheet(el); a.renderBodyView();
      }
    });
  }

  /* ============================================================== physique map */
  const WEEKS = [4, 12];
  const MAJOR = ["chest", "back", "shoulders", "biceps", "triceps", "quads", "hamstrings", "glutes", "calves", "abs"];
  function mapData(a, weeks) {
    const end = Date.now(), start = end - weeks * 7 * DAY, raw = a.regionSetsBetween(start, end), vals = {}; Object.keys(raw).forEach(k => { vals[k] = raw[k] / weeks; });
    const names = typeof MAP_REGIONS !== "undefined" ? MAP_REGIONS : {}, lag = MAJOR.filter(r => (vals[r] || 0) < 6).sort((x, y) => (vals[x] || 0) - (vals[y] || 0)), top = MAJOR.slice().sort((x, y) => (vals[y] || 0) - (vals[x] || 0))[0];
    return { vals, lag, top, names };
  }
  function mapHtml(a) {
    const wk = WEEKS.includes(a.__mapWk) ? a.__mapWk : 4;
    if (!S(a).length) return '<p class="text-xs text-zinc-400">Log some workouts and your body map fills in here.</p>';
    const d = mapData(a, wk), nm = r => (d.names[r] || r);
    return `<div class="flex gap-1.5">${WEEKS.map(w => chip(`data-mapwk="${w}"`, w + " weeks", w === wk)).join("")}</div>
      ${a.muscleMapSvg(d.vals)}
      <p class="text-[11px] text-zinc-400 text-center">Average sets per week over the last ${wk} weeks</p>
      ${d.lag.length ? `<div class="pt-qrow"><span class="text-xs font-bold text-amber-300">Lagging: ${d.lag.slice(0, 4).map(r => esc(nm(r))).join(", ")}</span><span class="block text-[11px] text-zinc-400">Under 6 sets a week. Balanced growth needs 8 to 12 for each major muscle.</span><div><button type="button" class="pt-b go" id="pt-map-train" data-lag="${d.lag.slice(0, 3).join(",")}">Build a workout for these</button></div></div>` : `<div class="pt-qrow done"><span class="text-xs font-bold text-emerald-400">Well balanced. Every major muscle is getting work.</span></div>`}
      ${d.top ? `<p class="text-[11px] text-zinc-400 text-center">Most trained: <b class="text-white">${esc(nm(d.top))}</b> (${(d.vals[d.top] || 0).toFixed(1)} sets a week)</p>` : ""}`;
  }
  const OPEN = {};
  function drawMap(a) {
    const root = $("progress-body"); if (!root || typeof a.muscleMapSvg !== "function") return;
    let box = $("pt-pg-rew3");
    if (!box) { box = document.createElement("div"); box.id = "pt-pg-rew3"; box.className = "space-y-3"; const r2 = $("pt-pg-rew2") || $("pt-pg-rew"); if (r2 && r2.parentNode === root) r2.insertAdjacentElement("afterend", box); else root.appendChild(box); }
    box.innerHTML = `<details class="pt-pg" id="pt-pg-pmap" ${OPEN.pmap ? "open" : ""}><summary><span class="text-xs font-bold text-white">🧍 Physique map</span><span class="pt-chev">›</span></summary><div>${mapHtml(a)}</div></details>`;
    box.querySelector("details").addEventListener("toggle", e => { OPEN.pmap = e.target.open; });
  }
  const oPV = proto.renderProgressView;
  proto.renderProgressView = function () { const r = oPV.apply(this, arguments); try { drawMap(this); } catch (e) { console.error("PulseTrack physique map", e); } return r; };

  /* ============================================================== Body page wiring */
  function afterBody(a) {
    const root = $("body-root"); if (!root) return;
    // photo tools
    const head = [...root.querySelectorAll("h3")].find(h => /Progress photos/.test(h.textContent));
    if (head && !$("pt-cam-open")) {
      const row = head.parentElement; row.classList.add("flex-wrap"); row.style.gap = ".4rem";
      const tools = document.createElement("div"); tools.className = "pt-ptools"; tools.innerHTML = '<button type="button" id="pt-cam-open" class="pt-b go">📷 Guided camera</button><button type="button" id="pt-tips-open" class="pt-b">💡 Tips</button>';
      row.insertAdjacentElement("afterend", tools);
      const age = PT.photoAgeDays(); const note = document.createElement("p"); note.id = "pt-photo-note"; note.className = "text-[11px] " + (age === null ? "text-zinc-400" : age >= 7 ? "text-amber-300" : "text-emerald-400");
      note.textContent = age === null ? "Take your first photo so you can compare later." : age >= 7 ? `Last photo was ${age} days ago. Time for this week's.` : `Last photo ${age === 0 ? "today" : age + " day" + (age === 1 ? "" : "s") + " ago"}. Nice and consistent.`; tools.insertAdjacentElement("afterend", note);
    }
    const act = $("photo-actions");
    if (act && !$("pt-slide-open")) { const b = document.createElement("button"); b.id = "pt-slide-open"; b.type = "button"; b.className = "flex-1 py-2.5 bg-zinc-800 text-zinc-200 text-xs font-bold rounded-xl tap-active"; b.textContent = "Slider"; const cmp = $("photo-compare"); cmp.insertAdjacentElement("afterend", b); const s = document.createElement("button"); s.id = "pt-ba-card"; s.type = "button"; s.className = "flex-1 py-2.5 bg-emerald-700 text-white text-xs font-bold rounded-xl tap-active"; s.textContent = "Share"; b.insertAdjacentElement("afterend", s); }
    syncPhotoBtns(a);
    // trends + goal physique after "Latest measurements"
    const lm = [...root.querySelectorAll("h3")].find(h => /Latest measurements/.test(h.textContent)), anchor = lm && lm.closest(".bg-zinc-900");
    if (anchor) {
      let m = $("pt-meas"); if (!m) { m = document.createElement("div"); m.id = "pt-meas"; m.className = card; anchor.insertAdjacentElement("afterend", m); } m.innerHTML = measHtml(a);
      let p = $("pt-phys"); if (!p) { p = document.createElement("div"); p.id = "pt-phys"; p.className = card; m.insertAdjacentElement("afterend", p); } p.innerHTML = physHtml(a);
    }
  }
  function syncPhotoBtns(a) { const two = (a.photoSel || []).length === 2; ["pt-slide-open", "pt-ba-card"].forEach(id => { const b = $(id); if (b) { b.disabled = !two; b.classList.toggle("opacity-40", !two); } }); }
  const oBody = proto.renderBodyView;
  proto.renderBodyView = function () { const r = oBody.apply(this, arguments); try { afterBody(this); refreshPhotoInfo().then(() => { const n = $("pt-photo-note"); if (n) afterBodyNote(); }); } catch (e) { console.error("PulseTrack body 2.32", e); } return r; };
  function afterBodyNote() { const n = $("pt-photo-note"); if (!n) return; const age = PT.photoAgeDays(); n.className = "text-[11px] " + (age === null ? "text-zinc-400" : age >= 7 ? "text-amber-300" : "text-emerald-400"); n.textContent = age === null ? "Take your first photo so you can compare later." : age >= 7 ? `Last photo was ${age} days ago. Time for this week's.` : `Last photo ${age === 0 ? "today" : age + " day" + (age === 1 ? "" : "s") + " ago"}. Nice and consistent.`; }
  const oRP = proto.renderPhotos;
  if (oRP) proto.renderPhotos = async function () { const r = await oRP.apply(this, arguments); try { syncPhotoBtns(this); refreshPhotoInfo().then(afterBodyNote); } catch (e) { } return r; };

  /* ============================================================== clicks */
  document.addEventListener("click", async e => {
    const a = A(); if (!a || !e.target.closest) return; const t = id => e.target.closest("#" + id);
    if (t("pt-cam-open")) { openCam(); return; }
    if (t("pt-tips-open")) { openTips(); return; }
    if (t("pt-slide-open")) { openSlider(); return; }
    if (t("pt-ba-card")) { const ps = await pair(); if (ps) { PT.__ba = ps; shareBA(); } return; }
    if (t("pt-ba-share")) { shareBA(); return; }
    if (t("pt-cam-x")) { stopCam(); return; }
    if (t("pt-cam-flip")) { CAM.facing = CAM.facing === "user" ? "environment" : "user"; try { await startStream(); } catch (x) { a.toast("Could not switch camera"); } return; }
    if (t("pt-cam-timer")) { CAM.timer = CAM.timer === 0 ? 5 : CAM.timer === 5 ? 10 : 0; t("pt-cam-timer").textContent = "⏱ " + (CAM.timer ? CAM.timer + "s" : "Off"); return; }
    if (t("pt-cam-ghostbtn")) { CAM.ghost = !CAM.ghost; const g = $("pt-cam-ghost"); if (g) g.style.opacity = CAM.ghost ? ".35" : "0"; t("pt-cam-ghostbtn").setAttribute("aria-pressed", String(CAM.ghost)); return; }
    if (t("pt-cam-shot")) { shoot(); return; }
    const mm = e.target.closest("[data-meas]"); if (mm) { a.__measK = mm.dataset.meas; const m = $("pt-meas"); if (m) m.innerHTML = measHtml(a); return; }
    if (t("pt-meas-goal")) {
      const k = METRICS.some(m => m[0] === a.__measK) ? a.__measK : "waist", v = parseFloat(await PT.prompt(`Goal for ${METRICS.find(m => m[0] === k)[1].toLowerCase()} (${unitOf(k)})?`, (a.settings.measGoals || {})[k] || "", { type: "number", title: "Measurement goal", ok: "Save" }));
      if (v > 0) { const g = a.settings.measGoals && typeof a.settings.measGoals === "object" ? a.settings.measGoals : (a.settings.measGoals = {}); g[k] = v; save(); const m = $("pt-meas"); if (m) m.innerHTML = measHtml(a); }
      return;
    }
    if (t("pt-phys-edit")) { openPhys(); return; }
    const mw = e.target.closest("[data-mapwk]"); if (mw) { a.__mapWk = parseInt(mw.dataset.mapwk, 10); OPEN.pmap = true; a.renderProgressView(); return; }
    if (t("pt-map-train")) { const l = t("pt-map-train").dataset.lag.split(",").filter(Boolean); if (PT.openBuildWorkout) PT.openBuildWorkout({ focus: "custom", regions: l }); return; }
  });
  document.addEventListener("input", e => {
    if (!e.target || e.target.id !== "pt-slide-rng") return; const v = e.target.value, b = $("pt-sl-before"), k = $("pt-knob");
    if (b) b.style.clipPath = `inset(0 ${100 - v}% 0 0)`; if (k) k.style.left = v + "%";
  });

  /* ============================================================== styles */
  const css = document.createElement("style"); css.id = "pt-v232c-css";
  css.textContent = `
    .pt-ptools { display: flex; gap: .5rem; flex-wrap: wrap; }
    .pt-ptools .pt-b, #pt-meas .pt-b, #pt-phys .pt-b { padding: .5rem .85rem; border-radius: .65rem; font-size: .75rem; font-weight: 700; background: rgb(var(--z800)); color: rgb(var(--z100)); }
    .pt-ptools .pt-b.go, #pt-phys .pt-b.go { background: rgb(var(--a600)); color: #fff; }
    .pt-slide { position: relative; width: 100%; aspect-ratio: 3 / 4; overflow: hidden; border-radius: 1rem; background: #000; }
    .pt-slide img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
    .pt-knob { position: absolute; top: 0; bottom: 0; width: 3px; margin-left: -1.5px; background: #fff; box-shadow: 0 0 8px rgb(0 0 0 / .6); pointer-events: none; }
    .pt-sl-tag { position: absolute; bottom: .6rem; font-size: .62rem; font-weight: 800; letter-spacing: .06em; color: #fff; background: rgb(0 0 0 / .6); padding: .25rem .5rem; border-radius: .5rem; }
    .pt-sl-tag.l { left: .6rem; } .pt-sl-tag.r { right: .6rem; }
    #sheet-body .pt-b { padding: .6rem 1rem; border-radius: .7rem; font-size: .8rem; font-weight: 800; background: rgb(var(--z800)); color: #fff; }
    #sheet-body .pt-b.go { background: rgb(var(--a600)); }
    .pt-mrows { display: flex; flex-direction: column; gap: .35rem; }
    .pt-mrow { display: grid; grid-template-columns: 4.2rem auto 1fr; align-items: center; gap: .6rem; padding: .5rem .7rem; border-radius: .75rem; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); text-align: left; }
    .pt-mrow[aria-pressed=true] { border-color: rgb(var(--a500)); }
    .pt-mrow span:last-child { text-align: right; }
    #pt-cam { position: fixed; inset: 0; z-index: 80; background: #000; display: flex; align-items: center; justify-content: center; overflow: hidden; }
    #pt-cam video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
    #pt-cam-ghost { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; pointer-events: none; transition: opacity .2s; }
    .pt-cam-grid { position: absolute; inset: 0; pointer-events: none; }
    .pt-cam-grid i { position: absolute; top: 0; bottom: 0; width: 1px; background: rgb(255 255 255 / .25); }
    .pt-cam-grid i:nth-child(1) { left: 33.3%; } .pt-cam-grid i:nth-child(2) { left: 66.6%; }
    #pt-cam-count { position: absolute; font-size: 7rem; font-weight: 900; color: #fff; text-shadow: 0 4px 24px rgb(0 0 0 / .7); pointer-events: none; }
    .pt-cam-top, .pt-cam-bot { position: absolute; left: 0; right: 0; display: flex; align-items: center; justify-content: space-between; padding: 1rem; }
    .pt-cam-top { top: env(safe-area-inset-top, 0px); } .pt-cam-bot { bottom: calc(env(safe-area-inset-bottom, 0px) + .5rem); padding-bottom: 1.2rem; }
    #pt-cam button { color: #fff; font-weight: 800; font-size: .8rem; background: rgb(0 0 0 / .55); border-radius: 9999px; padding: .6rem .9rem; min-height: 2.75rem; }
    #pt-cam-shot { width: 4.6rem; height: 4.6rem; padding: 0 !important; background: #fff !important; border: 4px solid rgb(255 255 255 / .5); background-clip: padding-box !important; }
    #pt-cam-shot i { display: block; width: 100%; height: 100%; border-radius: 50%; }
    .pt-cam-spacer { width: 4rem; }
    body.pt-cam-on #floating-rest-timer { display: none; }
  `;
  document.head.appendChild(css);
  setTimeout(() => { refreshPhotoInfo().catch(() => { }); }, 1800);
})();
  