
/* =====================================================================
 * PulseTrack 2.46.0: bar path and bar speed from the phone's camera (needs m76core.js before it).
 *  - On a barbell lift's card a "🎯 Bar path" button opens the camera. Tap the left and the right edge of the plate on the end of the bar (and
 *    say which plate it is). The plate size gives the scale, so the speeds come out in metres a second. Press Record: the path is drawn on
 *    screen as you lift, and the clip is saved with the exercise.
 *  - Any clip in Form clips can be tracked afterwards ("Track bar path"): pick a frame where the plate is clear, tap its edges and press Track.
 *  - Results: the path drawn over the first frame (slow parts red, fast parts green), and for each rep the average and peak speed going up,
 *    how far the bar travelled, how long it took and how far it drifted front to back. Across the set: average speed, best rep, and
 *    velocity loss (how much slower the last rep was than the best). A share card makes a picture of it.
 *  - Everything happens on the phone: a small tracker written for this app follows the plate frame by frame. Nothing is uploaded and no
 *    model has to be downloaded, so it works offline. The numbers are stored with the clip (clip.bar).
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined" || !PT.kit || typeof PTBarCore === "undefined") return;
  const Core = PTBarCore, A = () => window.app, K = PT.kit, esc = K.esc, $ = id => document.getElementById(id);
  const PLATES = [[450, "45 lb · 20 kg plate"], [395, "35 lb plate"], [335, "25 lb plate"], [255, "10 lb plate"], [200, "5 lb plate"]];
  const MAX_REC = 90;                                         // seconds
  const BAR_RE = /(squat|deadlift|bench press|overhead press|military press|push press|clean|snatch|barbell row|bent[- ]over row|pendlay|good morning|hip thrust|rack pull|jerk)/i;
  const NOT_RE = /dumbbell|\bdb\b|cable|machine|smith|kettlebell|goblet|band|bodyweight|bulgarian|split squat|hack|leg press|pistol|jump|sissy|landing|single[- ]leg|one[- ]arm|curl|lateral|fly|flye|pull[- ]up|push[- ]?up|dip|lunge|step[- ]up|plank|crunch|raise|extension|kickback|shrug|pulldown|pullover|swing|cossack|hold/i;
  const isBarbell = n => BAR_RE.test(String(n || "")) && !NOT_RE.test(String(n || ""));
  const cfg = a => (a.settings.bar && typeof a.settings.bar === "object" ? a.settings.bar : (a.settings.bar = {}));
  const save = a => { try { WorkoutStorage.saveSettings(a.settings); } catch (e) { } };
  const plateMm = () => { const c = cfg(A()), v = Number(c.plate); return v >= 100 && v <= 700 ? v : 450; };
  const plateName = mm => { const p = PLATES.find(x => x[0] === mm); return p ? p[1] : mm + " mm plate"; };
  const mmss = s => { s = Math.max(0, Math.round(s || 0)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
  const once = (el, ev, ms) => new Promise(res => { let d = false; const f = () => { if (d) return; d = true; el.removeEventListener(ev, f); res(); }; el.addEventListener(ev, f); setTimeout(f, ms || 3000); });

  /* ---------------------------------------------------------------- one new picture at a time */
  /** calls cb(seconds) for every picture the video shows. Streams use the clock, files use the position in the file. */
  function frames(video, cb, live) {
    let stopped = false, id = 0, last = -1;
    if (typeof video.requestVideoFrameCallback === "function") {
      const f = (now, md) => {
        if (stopped) return;
        const t = live ? ((md && (md.captureTime || md.presentationTime)) || now) / 1000 : (md && md.mediaTime != null ? md.mediaTime : video.currentTime);
        try { cb(t, md); } catch (e) { console.error("PulseTrack bar path", e); }
        id = video.requestVideoFrameCallback(f);
      };
      id = video.requestVideoFrameCallback(f);
      return () => { stopped = true; try { video.cancelVideoFrameCallback(id); } catch (e) { } };
    }
    const f = now => {
      if (stopped) return;
      const t = live ? now / 1000 : video.currentTime;
      if (live || t !== last) { last = t; try { cb(t); } catch (e) { console.error("PulseTrack bar path", e); } }
      id = requestAnimationFrame(f);
    };
    id = requestAnimationFrame(f);
    return () => { stopped = true; cancelAnimationFrame(id); };
  }

  /* ---------------------------------------------------------------- the tracker session */
  /** the video's pictures, shrunk so the plate is about 22 px across its radius, and a tracker on the plate */
  function Session(video, cal) {
    const vw = video.videoWidth, vh = video.videoHeight; if (!vw || !vh) throw new Error("The camera is not ready yet.");
    this.sc = Math.max(0.25, Math.min(1, 22 / cal.rad));
    this.w = Math.max(32, Math.round(vw * this.sc)); this.h = Math.max(32, Math.round(vh * this.sc));
    this.cv = document.createElement("canvas"); this.cv.width = this.w; this.cv.height = this.h; this.cx = this.cv.getContext("2d", { willReadFrequently: true });
    this.buf = new Uint8Array(this.w * this.h); this.video = video;
    const rad = cal.rad * this.sc;
    this.tr = new Core.Tracker(this.w, this.h, cal.cx * this.sc, cal.cy * this.sc, Math.max(4, Math.round(rad * 0.8)));
    this.mpp = (cal.mm / 1000) / (2 * rad);       // metres per working pixel
    this.lostRun = 0; this.lostAll = 0; this.n = 0;
    this.read(); this.tr.init(this.buf);
  }
  Session.prototype.read = function () {
    this.cx.drawImage(this.video, 0, 0, this.w, this.h);
    Core.gray(this.cx.getImageData(0, 0, this.w, this.h).data, this.w * this.h, this.buf);
    return this.buf;
  };
  Session.prototype.feed = function () {
    this.read(); const r = this.tr.step(this.buf); this.n++;
    if (r.lost) { this.lostRun++; this.lostAll++; } else this.lostRun = 0;
    return r;
  };
  /** a sharp picture of the frame on screen, for the results card */
  function snap(video, maxW) {
    try {
      const k = Math.min(1, (maxW || 720) / video.videoWidth), cv = document.createElement("canvas");
      cv.width = Math.round(video.videoWidth * k); cv.height = Math.round(video.videoHeight * k);
      cv.getContext("2d").drawImage(video, 0, 0, cv.width, cv.height);
      return cv.toDataURL("image/jpeg", 0.72);
    } catch (e) { return ""; }
  }

  /* ---------------------------------------------------------------- the camera screen */
  let O = null;                                              // everything about the screen that is open
  const newState = (mode, ctx) => ({ mode, ctx: ctx || {}, el: null, v: null, cv: null, g: null, stream: null, url: "", taps: [], cal: null, sess: null, stopFrames: null, recording: false, tracking: false, pts: [], trail: [], thumb: "", chunks: [], rec: null, mime: "", t0: 0, timers: [], wl: null, delay: 0, startT: 0, lastT: -1, fd: 0, slowAt: 0, closing: false });
  const msg = t => { const m = $("pt-bar-msg"); if (m) m.textContent = t; };
  const L = () => {
    if (!O || !O.v || !O.v.videoWidth) return null;
    const st = O.el.querySelector(".pt-bar-stage"), W = st.clientWidth, H = st.clientHeight, s = Math.min(W / O.v.videoWidth, H / O.v.videoHeight), w = O.v.videoWidth * s, h = O.v.videoHeight * s;
    return { x: (W - w) / 2, y: (H - h) / 2, w, h, s, W, H };
  };
  function draw() {
    if (!O || !O.cv) return; const l = L(); if (!l) return;
    const dpr = window.devicePixelRatio || 1, cv = O.cv;
    if (cv.width !== Math.round(l.W * dpr) || cv.height !== Math.round(l.H * dpr)) { cv.width = Math.round(l.W * dpr); cv.height = Math.round(l.H * dpr); }
    const g = O.g || (O.g = cv.getContext("2d")); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, l.W, l.H);
    const P = (x, y) => [l.x + x * l.s, l.y + y * l.s], ac = "#34d399";
    // the two taps
    if (!O.cal) O.taps.forEach(t => { const [x, y] = P(t[0], t[1]); g.strokeStyle = "#fff"; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 9, 0, 6.2832); g.moveTo(x - 14, y); g.lineTo(x + 14, y); g.moveTo(x, y - 14); g.lineTo(x, y + 14); g.stroke(); });
    // the path so far
    if (O.trail.length > 1) {
      g.lineWidth = 3.5; g.lineJoin = "round"; g.lineCap = "round"; g.strokeStyle = ac; g.shadowColor = "rgb(0 0 0 / .7)"; g.shadowBlur = 4; g.beginPath();
      O.trail.forEach((p, i) => { const [x, y] = P(p[0], p[1]); if (i) g.lineTo(x, y); else g.moveTo(x, y); }); g.stroke(); g.shadowBlur = 0;
    }
    // the plate
    if (O.sess && O.cal) {
      const tr = O.sess.tr, [x, y] = P(tr.x / O.sess.sc, tr.y / O.sess.sc), lost = O.sess.lostRun > 3;
      g.strokeStyle = lost ? "#fb7185" : ac; g.lineWidth = 3; g.setLineDash(lost ? [6, 5] : []); g.beginPath(); g.arc(x, y, O.cal.rad * l.s, 0, 6.2832); g.stroke(); g.setLineDash([]);
      g.fillStyle = lost ? "#fb7185" : ac; g.beginPath(); g.arc(x, y, 3.5, 0, 6.2832); g.fill();
    }
  }
  function ui() {
    if (!O) return; const e = O.el, q = s => e.querySelector(s);
    const ready = !!O.sess;
    if (O.mode === "live") {
      const r = q('[data-bar="rec"]'); r.classList.toggle("on", O.recording); r.setAttribute("aria-label", O.recording ? "Stop recording" : "Record"); r.disabled = !ready && !O.recording;
      q('[data-bar="delay"]').textContent = "⏱ " + (O.delay ? O.delay + " s" : "Off"); q('[data-bar="delay"]').disabled = O.recording;
    } else { q('[data-bar="track"]').disabled = !ready || O.tracking; q('[data-bar="track"]').textContent = O.tracking ? "Tracking…" : "Track"; }
    q('[data-bar="reset"]').disabled = O.recording || O.tracking || !O.taps.length;
    q("#pt-bar-tip").style.display = O.cal || O.recording || O.tracking ? "none" : "";
    q('[data-bar="plate"]').textContent = plateName(plateMm()) + " ▾"; q('[data-bar="plate"]').disabled = O.recording || O.tracking;
  }
  function stage(mode, ctx) {
    O = newState(mode, ctx);
    const e = document.createElement("div"); e.id = "pt-bar"; e.setAttribute("role", "dialog"); e.setAttribute("aria-label", "Bar path");
    const title = ctx.name ? esc(ctx.name) : "Bar path";
    e.innerHTML = `<div class="pt-bar-stage"><video id="pt-bar-video" playsinline muted></video><canvas id="pt-bar-over"></canvas></div>
      <div class="pt-bar-top"><button type="button" data-bar="x" aria-label="Close">✕</button><div class="pt-bar-title"><b>🎯 ${title}</b></div><button type="button" data-bar="plate" class="pt-bar-chip"></button></div>
      <div class="pt-bar-msg" id="pt-bar-msg" role="status" aria-live="polite">Opening the camera…</div>
      <div class="pt-bar-tip" id="pt-bar-tip">Film side-on at the height of the plate, with the phone resting still and the whole plate in view.</div>
      <div class="pt-bar-bot">${mode === "live"
        ? `<button type="button" data-bar="delay" class="pt-bar-chip">⏱ Off</button><button type="button" data-bar="rec" class="pt-bar-rec" aria-label="Record"><i></i></button><button type="button" data-bar="reset" class="pt-bar-chip">Clear marks</button>`
        : `<div class="pt-bar-scrub"><button type="button" data-bar="fb" aria-label="Back one frame">◀</button><input type="range" min="0" max="1000" value="0" data-bar="seek" aria-label="Pick a frame where the plate is clear"><button type="button" data-bar="ff" aria-label="Forward one frame">▶</button><span id="pt-bar-t">0:00</span></div>
           <div class="pt-bar-row2"><button type="button" data-bar="reset" class="pt-bar-chip">Clear marks</button><button type="button" data-bar="track" class="pt-bar-go">Track</button></div>`}</div>
      <div class="pt-bar-prog hidden" id="pt-bar-prog"><i></i></div>`;
    document.body.appendChild(e); document.body.classList.add("pt-bar-on");
    O.el = e; O.v = $("pt-bar-video"); O.cv = $("pt-bar-over");
    e.addEventListener("click", clicks); e.addEventListener("pointerdown", taps);
    const sk = e.querySelector('[data-bar="seek"]');
    if (sk) sk.addEventListener("input", () => { if (!O.v || O.tracking) return; const d = O.v.duration; if (d && isFinite(d)) { O.v.currentTime = parseFloat(sk.value) / 1000 * d; } clearMarks(); });
    window.addEventListener("resize", draw);
    O.v.addEventListener("resize", () => { if (O && O.mode === "live" && !O.recording && O.taps.length) { clearMarks(); msg("The picture changed shape. Tap the plate's left edge again."); } });
    ui(); return e;
  }
  async function wake() { try { if ("wakeLock" in navigator) O.wl = await navigator.wakeLock.request("screen"); } catch (e) { } }
  function close(keep) {
    if (!O) return; const o = O; O = null; o.closing = true;
    try { if (o.stopFrames) o.stopFrames(); } catch (e) { }
    o.timers.forEach(t => { clearInterval(t); clearTimeout(t); });
    try { if (o.rec && o.rec.state !== "inactive") { o.rec.onstop = null; o.rec.ondataavailable = null; o.rec.stop(); } } catch (e) { }
    try { if (o.stream) o.stream.getTracks().forEach(t => t.stop()); } catch (e) { }
    try { if (o.v) { o.v.pause(); o.v.removeAttribute("src"); o.v.srcObject = null; o.v.load(); } } catch (e) { }
    if (o.url) { try { URL.revokeObjectURL(o.url); } catch (e) { } }
    try { if (o.wl) o.wl.release(); } catch (e) { }
    window.removeEventListener("resize", draw);
    if (o.el) o.el.remove(); document.body.classList.remove("pt-bar-on");
  }

  /* ---- marking the plate */
  function clearMarks() {
    if (!O) return; if (O.stopFrames && O.mode === "live" && !O.recording) { O.stopFrames(); O.stopFrames = null; }
    O.taps = []; O.cal = null; O.sess = null; O.trail = [];
    msg("Tap the left edge of the plate"); ui(); draw();
  }
  function taps(e) {
    if (!O || O.recording || O.tracking || e.target.closest("button, input, .pt-bar-top, .pt-bar-bot")) return;
    const l = L(); if (!l) return; const r = O.el.querySelector(".pt-bar-stage").getBoundingClientRect();
    const x = (e.clientX - r.left - l.x) / l.s, y = (e.clientY - r.top - l.y) / l.s;
    if (x < 0 || y < 0 || x > O.v.videoWidth || y > O.v.videoHeight) return;
    if (O.taps.length >= 2) clearMarks();
    O.taps.push([x, y]);
    if (O.taps.length === 1) { msg("Now tap the right edge of the same plate"); ui(); draw(); return; }
    const a = O.taps[0], b = O.taps[1], cx = (a[0] + b[0]) / 2, cy = (a[1] + b[1]) / 2, rad = Math.hypot(a[0] - b[0], a[1] - b[1]) / 2;
    if (rad < 6) { O.taps = []; msg("Those taps were too close. Tap the left edge, then the right edge."); ui(); draw(); return; }
    try { O.sess = new Session(O.v, { cx, cy, rad, mm: plateMm() }); } catch (err) { O.taps = []; msg(err && err.message ? err.message : "Could not mark the plate."); ui(); draw(); return; }
    O.cal = { cx, cy, rad };
    if (O.mode === "live") { O.stopFrames = frames(O.v, onLive, true); msg("Plate found. Press the red button when you are ready."); }
    else { O.thumb = snap(O.v); O.startT = O.v.currentTime; msg("Plate marked. Press Track and the clip plays while the bar is followed."); }
    ui(); draw();
  }

  /* ---- live: the plate is followed from the moment it is marked, so you see it work before you lift */
  function onLive(t) {
    if (!O || !O.sess) return;
    const r = O.sess.feed();
    if (O.recording) { if (!r.lost) { O.pts.push({ t, x: r.x, y: r.y }); O.trail.push([r.x / O.sess.sc, r.y / O.sess.sc]); } }
    if (O.sess.lostRun === 25) msg(O.recording ? "Lost the plate for a moment. Keep it in the picture." : "The plate is not being followed. Tap Clear marks and mark it again.");
    draw();
  }
  async function startLive(ctx) {
    const a = A();
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { a.toast("This browser has no camera access. Film the set normally and use Track bar path on the clip."); return; }
    stage("live", ctx); wake();
    try {
      O.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } }, audio: false });
      if (!O) { return; }
      O.v.srcObject = O.stream; try { await O.v.play(); } catch (e) { }
      O.timers.push(setInterval(draw, 400));
      msg("Tap the left edge of the plate");
    } catch (e) { close(); a.toast("Could not open the camera. Check the permission, or film normally and track the clip."); }
  }
  const pickMime = () => { try { return ["video/mp4;codecs=avc1", "video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm", "video/mp4"].find(m => window.MediaRecorder && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(m)) || ""; } catch (e) { return ""; } };
  function beginRec() {
    if (!O || O.recording || !O.sess) return;
    O.pts = []; O.trail = []; O.thumb = snap(O.v); O.chunks = []; O.recording = true; O.t0 = performance.now();
    const mime = pickMime(); O.mime = mime;
    if (window.MediaRecorder && O.stream) {
      try { const r = new MediaRecorder(O.stream, mime ? { mimeType: mime, videoBitsPerSecond: 2500000 } : { videoBitsPerSecond: 2500000 }); r.ondataavailable = ev => { if (ev.data && ev.data.size) O.chunks.push(ev.data); }; r.start(1000); O.rec = r; } catch (e) { O.rec = null; }
    }
    O.el.classList.add("rec"); ui();
    O.timers.push(setInterval(() => { if (!O || !O.recording) return; const s = (performance.now() - O.t0) / 1000; msg("● " + mmss(s) + (O.sess.lostRun > 3 ? "  Lost the plate" : "  Tracking")); if (s >= MAX_REC) stopRec(); }, 250));
  }
  function stopRec() {
    if (!O || !O.recording) return; O.recording = false; O.el.classList.remove("rec"); ui(); msg("Working out your reps…");
    const o = O, finish = () => finishLive(o);
    if (o.rec && o.rec.state !== "inactive") { o.rec.onstop = finish; try { o.rec.stop(); } catch (e) { finish(); } } else finish();
  }
  async function finishLive(o) {
    if (!O || O !== o) return;
    const secs = (performance.now() - o.t0) / 1000, ctx = o.ctx;
    const bar = pack(o, secs), blob = o.chunks.length ? new Blob(o.chunks, { type: (o.mime || "video/webm").split(";")[0] }) : null, a = A();
    let clip = null;
    if (blob && blob.size) {
      const lift = ctx.ex ? PT.clips.liftOf(a, ctx.ex) : null, name = ctx.name || "Barbell lift";
      clip = { id: PT.uid(), ts: Date.now(), date: PT.ds(), ex: name, exk: PT.clips.norm(name), note: "", type: blob.type || "video/webm", size: blob.size, dur: Math.round(secs * 10) / 10, lift, blob, bar };
      try { await PT.clips.add(clip); } catch (e) { clip = null; a.toast("The clip could not be saved, but the numbers are here."); }
    }
    close(); results(bar, clip, ctx);
  }

  /* ---- a clip that is already saved */
  async function startClip(cl) {
    const a = A(); if (!cl || !cl.blob) return;
    stage("clip", { name: cl.ex, clip: cl }); wake();
    O.url = URL.createObjectURL(cl.blob); O.v.src = O.url; O.v.muted = true;
    try {
      await once(O.v, "loadedmetadata", 6000);
      if (!O) return;
      if (!isFinite(O.v.duration)) {                          // clips recorded in the browser have no length written in them yet
        const v = O.v; await new Promise(res => { const to = setTimeout(res, 3500); v.ontimeupdate = () => { if (isFinite(v.duration)) { clearTimeout(to); v.ontimeupdate = null; res(); } }; v.currentTime = 1e7; });
        if (!O) return; O.v.currentTime = 0; await once(O.v, "seeked", 3000);
      }
      if (!O) return;
      if (O.v.readyState < 2) await once(O.v, "loadeddata", 3000);
      if (!O || !O.v.videoWidth) throw new Error("no video");
    } catch (e) { if (O) close(); a.toast("This phone cannot play that clip here, so it cannot be tracked."); return; }
    const d = isFinite(O.v.duration) ? O.v.duration : (cl.dur || 0); O.dur = d;
    O.v.currentTime = Math.min(0.05, d / 2); await once(O.v, "seeked", 1500);
    msg("Scrub to a frame where the plate is clear, then tap its left edge."); const t = $("pt-bar-t"); if (t) t.textContent = mmss(O.v.currentTime) + " / " + mmss(d);
    O.el.querySelector('[data-bar="seek"]').addEventListener("input", () => { const q = $("pt-bar-t"); if (q && O) q.textContent = mmss(O.v.currentTime) + " / " + mmss(O.dur); });
    draw(); ui();
  }
  function runClip() {
    if (!O || !O.sess || O.tracking) return; const v = O.v, s = O.sess;
    O.tracking = true; O.pts = [{ t: v.currentTime, x: s.tr.x, y: s.tr.y }]; O.trail = [[s.tr.x / s.sc, s.tr.y / s.sc]]; O.lastT = v.currentTime; O.fd = 0;
    O.el.classList.add("trk"); $("pt-bar-prog").classList.remove("hidden"); ui(); msg("Following the bar…");
    v.muted = true; v.playbackRate = 1; const o = O;
    o.stopFrames = frames(v, t => {
      if (O !== o || !o.tracking) return;
      const d = t - o.lastT; if (d <= 0) return;
      if (o.fd === 0) o.fd = d; else if (d < o.fd * 1.4) o.fd = 0.8 * o.fd + 0.2 * d;
      if (d > o.fd * 2.2 && v.playbackRate > 0.25 && performance.now() - o.slowAt > 800) { v.playbackRate = Math.max(0.25, v.playbackRate / 2); o.slowAt = performance.now(); }   // the phone is falling behind: go slower
      o.lastT = t; const r = s.feed();
      if (!r.lost) { o.pts.push({ t, x: r.x, y: r.y }); o.trail.push([r.x / s.sc, r.y / s.sc]); }
      const bar = $("pt-bar-prog"); if (bar && o.dur) bar.firstElementChild.style.width = Math.min(100, Math.round((t - o.startT) / Math.max(0.1, o.dur - o.startT) * 100)) + "%";
      if (s.lostRun === 25) msg("The plate was lost for a moment. The numbers may be rough.");
      draw();
    }, false);
    v.onended = () => finishClip(o); v.onerror = () => finishClip(o);
    const p = v.play(); if (p && p.catch) p.catch(() => { finishClip(o); });
  }
  async function finishClip(o) {
    if (!O || O !== o || !o.tracking) return; o.tracking = false;
    try { o.stopFrames && o.stopFrames(); o.v.pause(); } catch (e) { }
    const secs = o.pts.length > 1 ? o.pts[o.pts.length - 1].t - o.pts[0].t : 0, bar = pack(o, secs), cl = o.ctx.clip, a = A();
    if (cl) { cl.bar = bar; try { await PT.clips.save(cl); } catch (e) { a.toast("Could not save the numbers with the clip."); } try { PT.clips.refresh(); } catch (e) { } }
    close(); results(bar, cl, o.ctx);
  }

  /** the numbers from a finished take, kept with the clip */
  function pack(o, secs) {
    const s = o.sess, pts = o.pts.slice(), res = Core.analyse(pts, s ? s.mpp : 0, { minRom: 0.12 });
    return {
      v: 1, ts: Date.now(), plate: plateMm(), mpp: s ? s.mpp : 0, fw: s ? s.w : 0, fh: s ? s.h : 0, secs: Math.round(secs * 10) / 10, thumb: o.thumb || "",
      ok: !!res.ok, reason: res.reason || "", t0: res.t0 || 0,
      reps: (res.reps || []).map(r => ({ n: r.n, t0: round(r.t0 - res.t0, 2), t1: round(r.t1 - res.t0, 2), rom: round(r.rom, 3), up: round(r.up, 2), down: r.down == null ? null : round(r.down, 2), mcv: round(r.mcv, 3), pcv: round(r.pcv, 3), sway: round(r.sway, 3) })),
      summary: res.summary ? Object.fromEntries(Object.entries(res.summary).map(([k, v]) => [k, round(v, 3)])) : null,
      path: res.path || [], lost: s ? s.lostAll : 0, seen: s ? s.n : 0
    };
  }
  const round = (v, d) => { const k = Math.pow(10, d); return Math.round(v * k) / k; };

  /* ---- buttons */
  async function clicks(e) {
    const b = e.target.closest("[data-bar]"); if (!b || !O) return; const k = b.dataset.bar, a = A();
    if (k === "x") { if (O.recording || O.tracking) { if (!await PT.confirm("Stop and throw this take away?", { title: "Stop tracking", ok: "Throw it away" })) return; } close(); return; }
    if (k === "plate") {
      const items = PLATES.map(p => ({ value: String(p[0]), label: p[1] + " (" + p[0] + " mm)" })); items.push({ value: "other", label: "Another size…" });
      let v = await PT.pickList("Which plate is on the end of the bar?", items, String(plateMm())); if (!v || !O) return;
      if (v === "other") { const s = await PT.prompt("Plate width in mm (across the whole plate)", String(plateMm())); const n = parseFloat(s); if (!(n >= 100 && n <= 700)) { if (s != null) a.toast("Enter a size from 100 to 700 mm."); return; } v = String(Math.round(n)); }
      cfg(a).plate = parseInt(v, 10); save(a);
      if (O.taps.length >= 2) clearMarks(); else ui(); return;                         // the scale is part of the marking
    }
    if (k === "reset") { clearMarks(); return; }
    if (k === "delay") { O.delay = O.delay === 0 ? 5 : O.delay === 5 ? 10 : 0; ui(); return; }
    if (k === "rec") {
      if (O.recording) { stopRec(); return; }
      if (O.delayLeft) { clearInterval(O.cd); O.delayLeft = 0; msg("Cancelled."); ui(); return; }
      if (!O.sess) return;
      if (!O.delay) { beginRec(); return; }
      O.delayLeft = O.delay; msg("Starting in " + O.delayLeft + " s");
      O.cd = setInterval(() => { if (!O) return; O.delayLeft--; if (O.delayLeft <= 0) { clearInterval(O.cd); O.delayLeft = 0; beginRec(); } else msg("Starting in " + O.delayLeft + " s"); }, 1000); O.timers.push(O.cd); return;
    }
    if (k === "track") { runClip(); return; }
    if (k === "fb" || k === "ff") { if (O.tracking) return; O.v.pause(); O.v.currentTime = Math.min(Math.max(0, O.v.currentTime + (k === "ff" ? 1 : -1) / 30), O.dur || O.v.duration || 1e6); const sk = O.el.querySelector('[data-bar="seek"]'); if (sk && O.dur) sk.value = String(Math.round(O.v.currentTime / O.dur * 1000)); const q = $("pt-bar-t"); if (q) q.textContent = mmss(O.v.currentTime) + " / " + mmss(O.dur); clearMarks(); return; }
  }

  /* ---------------------------------------------------------------- results */
  const ramp = f => { f = Math.max(0, Math.min(1, f)); const c = f < .5 ? [[251, 113, 133], [251, 191, 36], f * 2] : [[251, 191, 36], [52, 211, 153], (f - .5) * 2]; return `rgb(${Math.round(c[0][0] + (c[1][0] - c[0][0]) * c[2])} ${Math.round(c[0][1] + (c[1][1] - c[0][1]) * c[2])} ${Math.round(c[0][2] + (c[1][2] - c[0][2]) * c[2])})`; };
  function loadImg(src) { return new Promise(res => { if (!src) return res(null); const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; }); }
  /** the path over the first picture, in a box x, y, w, h of a 2D canvas context */
  function paintPath(g, bar, img, x, y, w, h, lw) {
    g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
    if (img) { g.drawImage(img, x, y, w, h); g.fillStyle = "rgb(0 0 0 / .3)"; g.fillRect(x, y, w, h); } else { g.fillStyle = "#18181b"; g.fillRect(x, y, w, h); }
    const p = bar.path || [], sx = w / (bar.fw || 1), sy = h / (bar.fh || 1);
    let vmax = 0.05; p.forEach(q => { vmax = Math.max(vmax, Math.abs(q[3])); });
    g.lineCap = "round"; g.lineJoin = "round"; g.lineWidth = lw || 4;
    for (let i = 1; i < p.length; i++) { g.strokeStyle = ramp(Math.abs(p[i][3]) / vmax); g.beginPath(); g.moveTo(x + p[i - 1][1] * sx, y + p[i - 1][2] * sy); g.lineTo(x + p[i][1] * sx, y + p[i][2] * sy); g.stroke(); }
    if (p.length) {
      const s = p[0], r = Math.max(5, (lw || 4) * 1.6); g.fillStyle = "#fff"; g.beginPath(); g.arc(x + s[1] * sx, y + s[2] * sy, r, 0, 6.2832); g.fill();
      const placed = [];
      (bar.reps || []).forEach(rep => {   // a numbered dot at the top of each rep; dots that would sit on each other are stacked
        let best = 0, bd = 1e9; p.forEach((q, i) => { const d = Math.abs(q[0] - rep.t1); if (d < bd) { bd = d; best = i; } });
        const q = p[best], rr = Math.max(8, (lw || 4) * 2.4), cx = x + q[1] * sx; let cy = y + q[2] * sy - rr * 1.4;
        for (let k = 0; k < 8 && placed.some(o => Math.hypot(o[0] - cx, o[1] - cy) < rr * 1.9); k++) cy -= rr * 2;
        placed.push([cx, cy]);
        g.fillStyle = "rgb(0 0 0 / .7)"; g.beginPath(); g.arc(cx, cy, rr, 0, 6.2832); g.fill(); g.fillStyle = "#fff"; g.font = "800 " + Math.round(rr * 1.15) + "px system-ui, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(String(rep.n), cx, cy + 1);
      });
    }
    g.restore();
  }
  const lenU = a => (a.unit() === "kg" ? "cm" : "in");
  const len = (a, m) => a.unit() === "kg" ? Math.round(m * 100) : Math.round(m * 39.37 * 10) / 10;
  const sp = v => (Math.round(v * 100) / 100).toFixed(2);
  /** a sentence on what the set looked like */
  function read(bar) {
    const s = bar.summary; if (!s) return "";
    const out = [];
    if (s.reps >= 2) out.push(s.loss < 10 ? "The last rep was almost as fast as the best one. A crisp set with plenty left." : s.loss < 20 ? "A small slowdown over the set. A good working set with reps in reserve." : s.loss < 35 ? "A clear slowdown. This was a hard set." : "A big slowdown: you were close to your limit. Rest a little longer before the next set.");
    else out.push("One rep. Film a few reps in a row to see how your speed changes through the set.");
    const sw = s.avgSway * 100;
    out.push(sw < 3 ? "The bar stayed on a tight line." : sw < 6 ? "A little drift front to back each rep." : "The bar drifted front to back quite a bit each rep. Film from the side to see where it travels.");
    return out.join(" ");
  }
  async function results(bar, clip, ctx) {
    const a = A(), el = K.sheet("pt-bar-res", 70); ctx = ctx || {}; const name = (clip && clip.ex) || ctx.name || "Barbell lift", S = bar.summary, u = lenU(a);
    PT.bar.last = { bar, clip };
    const lowSight = bar.seen && bar.lost / bar.seen > 0.2;
    let body;
    if (!bar.ok || !S) {
      body = `<div class="pt-bar-fail"><p>${esc(bar.reason || "No reps were found.")}</p><p class="pt-bar-fine">For the best result: film from the side, keep the plate in the picture for the whole set, hold the phone still (lean it on something), and use a plate with an even face. ${clip ? "Your clip is saved, so you can try again from it." : ""}</p></div>`;
    } else {
      const best = S.bestMcv || 1;
      body = `<canvas id="pt-bar-cv" class="pt-bar-cv" aria-label="The bar path"></canvas>
        <div class="pt-bar-legend"><span>slow</span><i></i><span>fast</span></div>
        <div class="pt-bar-tiles"><div><b>${sp(S.avgMcv)}</b><span>m/s average</span></div><div><b>${sp(S.bestMcv)}</b><span>m/s best rep</span></div><div class="${S.loss >= 20 ? "warn" : ""}"><b>${Math.round(S.loss)}%</b><span>velocity loss</span></div><div><b>${len(a, S.avgRom)}</b><span>${u} per rep</span></div></div>
        <div class="pt-bar-reps" role="table" aria-label="Reps"><div class="pt-bar-rh" role="row"><span>Rep</span><span>Up speed</span><span>Peak</span><span>Time up</span><span>Drift</span></div>
          ${bar.reps.map(r => `<div class="pt-bar-rep" role="row"><i style="width:${Math.max(6, Math.round(r.mcv / best * 100))}%"></i><b>${r.n}</b><span>${sp(r.mcv)}</span><span>${sp(r.pcv)}</span><span>${r.up.toFixed(1)} s</span><span>${len(a, r.sway)} ${u}</span></div>`).join("")}</div>
        <p class="pt-bar-read">${esc(read(bar))}</p>
        ${lowSight ? `<p class="pt-bar-fine warn">The plate was lost on about ${Math.round(bar.lost / bar.seen * 100)}% of the pictures, so treat the numbers as rough.</p>` : ""}
        <p class="pt-bar-fine">Speeds are the mean speed of the bar going up, from the plate size you chose (${esc(plateName(bar.plate))}). Phone cameras blur fast bars a little, so compare sets filmed the same way rather than against other people's numbers.</p>`;
    }
    const acts = `<div class="pt-bar-acts">${S ? `<button type="button" class="pt-st-b" data-bres="share">Share picture</button>` : ""}${clip && clip.blob ? `<button type="button" class="pt-st-b ghost" data-bres="again">${S ? "Track again" : "Try again"}</button>` : ""}<button type="button" class="pt-st-b ghost" data-bres="done">Done</button></div>`;
    const card = K.openSheet(el, `${K.head("Bar path", esc2(name) + (clip && clip.lift ? " · " + clip.lift.w + " × " + clip.lift.r : "") + (S ? " · " + S.reps + " rep" + (S.reps === 1 ? "" : "s") : ""))}${body}${acts}`);
    card.addEventListener("click", async e => {
      const b = e.target.closest("[data-bres]"); if (!b) return; const k = b.dataset.bres;
      if (k === "done") { K.closeSheet(el); return; }
      if (k === "again" && clip) { K.closeSheet(el); startClip(clip); return; }
      if (k === "share") { b.disabled = true; try { await shareCard(bar, clip, ctx); } catch (x) { a.toast("Could not make the picture."); } b.disabled = false; }
    });
    if (S) { const img = await loadImg(bar.thumb), cv = card.querySelector("#pt-bar-cv"); if (cv && cv.isConnected) { const w = cv.clientWidth || 340, h = Math.round(w * bar.fh / bar.fw), dpr = window.devicePixelRatio || 1; cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); cv.style.height = h + "px"; const g = cv.getContext("2d"); g.scale(dpr, dpr); paintPath(g, bar, img, 0, 0, w, h, 3.5); } }
  }
  const esc2 = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  /** a picture to post: the path, the name of the lift and the headline numbers */
  async function shareCard(bar, clip, ctx) {
    const a = A(), S = bar.summary, img = await loadImg(bar.thumb), W = 1080, ih = Math.round(W * bar.fh / bar.fw), H = 150 + Math.min(ih, 1300) + 250;
    const dh = Math.min(ih, 1300), dw = Math.round(dh * bar.fw / bar.fh), cv = document.createElement("canvas"); cv.width = W; cv.height = H; const g = cv.getContext("2d");
    g.fillStyle = "#09090b"; g.fillRect(0, 0, W, H);
    const name = (clip && clip.ex) || (ctx && ctx.name) || "Barbell lift";
    g.fillStyle = "#fff"; g.font = "800 54px system-ui, sans-serif"; g.textAlign = "left"; g.textBaseline = "alphabetic"; g.fillText(name.slice(0, 30), 48, 80);
    g.fillStyle = "#a1a1aa"; g.font = "500 32px system-ui, sans-serif"; g.fillText(((clip && clip.lift ? clip.lift.w + " × " + clip.lift.r + "  ·  " : "") + S.reps + " rep" + (S.reps === 1 ? "" : "s") + "  ·  " + (clip ? clip.date : PT.ds())), 48, 124);
    paintPath(g, bar, img, Math.round((W - dw) / 2), 150, dw, dh, 7);
    const y0 = 150 + dh + 70, cols = [[sp(S.avgMcv), "m/s average"], [sp(S.bestMcv), "m/s best rep"], [Math.round(S.loss) + "%", "velocity loss"]];
    cols.forEach((c, i) => { const x = 48 + i * 330; g.fillStyle = "#fff"; g.font = "800 84px system-ui, sans-serif"; g.fillText(c[0], x, y0 + 30); g.fillStyle = "#a1a1aa"; g.font = "500 30px system-ui, sans-serif"; g.fillText(c[1], x, y0 + 78); });
    g.fillStyle = "#52525b"; g.font = "700 28px system-ui, sans-serif"; g.textAlign = "right"; g.fillText("PulseTrack", W - 48, H - 28);
    const blob = await new Promise(res => cv.toBlob(res, "image/png"));
    if (!blob) throw new Error("png");
    const file = new File([blob], "bar-path-" + name.replace(/[^a-z0-9]+/gi, "-").toLowerCase() + ".png", { type: "image/png" });
    await a.shareFile(file, name + " bar path");
  }

  /* ---------------------------------------------------------------- ways in */
  function decorate(a) {
    const list = $("exercises-list") || (a.dom && a.dom.exercisesList); if (!list || !a.activeDay) return;
    list.querySelectorAll("[data-ex-card]").forEach(card => {
      const i = parseInt(card.dataset.exCard, 10), ex = (a.activeDay.exercises || [])[i]; if (!ex) return;
      const old = card.querySelector(".pt-bar-btn"); if (old) old.remove();
      if (ex.type === "tabata" || !isBarbell(ex.name) || (a.exKind && a.exKind(ex).cardio)) return;
      const anchor = card.querySelector(".pt-fc-btn") || card.querySelector(".btn-cues"); if (!anchor) return;
      const b = document.createElement("button"); b.type = "button"; b.className = "pt-bar-btn shrink-0 text-[11px] font-semibold tap-active px-1 py-0.5"; b.dataset.barx = String(i);
      b.setAttribute("aria-label", `Track the bar path of ${ex.name}`); b.innerHTML = `<span aria-hidden="true">🎯</span> Bar path`;
      anchor.insertAdjacentElement("afterend", b);
    });
  }
  /** the line and buttons under a clip in the player */
  function rowHtml(cl) {
    const b = cl && cl.bar, S = b && b.summary;
    if (S) return `<div class="pt-bar-row"><span>🎯 ${S.reps} rep${S.reps === 1 ? "" : "s"} · ${sp(S.avgMcv)} m/s${S.reps > 1 ? " · " + Math.round(S.loss) + "% loss" : ""}</span><button type="button" data-fc="bar" data-v="view">View</button><button type="button" data-fc="bar" data-v="redo">Track again</button></div>`;
    return `<button type="button" class="pt-st-b ghost pt-bar-new" data-fc="bar" data-v="new">🎯 Track bar path</button>`;
  }
  function clipAction(cl, v) { if (!cl) return; if (v === "view" && cl.bar) results(cl.bar, cl, { name: cl.ex }); else startClip(cl); }
  document.addEventListener("click", e => {
    const t = e.target && e.target.closest ? e.target : null; if (!t) return; const a = A();
    const x = t.closest(".pt-bar-btn");
    if (x && a && a.activeDay) { const i = parseInt(x.dataset.barx, 10), ex = (a.activeDay.exercises || [])[i]; if (ex) startLive({ name: ex.name, ex }); }
  });
  PT.bar = { isBarbell, record: startLive, openClip: startClip, view: (cl) => cl && cl.bar && results(cl.bar, cl, { name: cl.ex }), decorate, rowHtml, clipAction, analyse: Core.analyse, state: () => O, plateMm, last: null };

  const css = document.createElement("style");
  css.id = "pt-v246-bar-css";
  css.textContent = `
    .pt-bar-btn { color: rgb(var(--z400)); }
    body.pt-bar-on #floating-rest-timer { display: none; }
    body.pt-bar-on #pt-toast { z-index: 500 !important; }
    #pt-bar { position: fixed; inset: 0; z-index: 84; background: #000; color: #fff; touch-action: manipulation; user-select: none; -webkit-user-select: none; }
    .pt-bar-stage { position: absolute; inset: 0; } .pt-bar-stage video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; background: #000; } .pt-bar-stage canvas { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
    #pt-bar button { color: #fff; font-weight: 800; font-size: .8rem; background: rgb(0 0 0 / .6); border-radius: 9999px; padding: .6rem .9rem; min-height: 2.75rem; }
    #pt-bar button:disabled { opacity: .4; }
    .pt-bar-top { position: absolute; left: 0; right: 0; top: env(safe-area-inset-top, 0px); display: flex; align-items: center; justify-content: space-between; gap: .5rem; padding: .8rem 1rem; }
    .pt-bar-title { min-width: 0; font-size: .8rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-shadow: 0 1px 4px #000; }
    .pt-bar-msg { position: absolute; left: .8rem; right: .8rem; top: calc(env(safe-area-inset-top, 0px) + 4.6rem); text-align: center; font-size: .82rem; font-weight: 700; line-height: 1.35; text-shadow: 0 1px 5px #000, 0 0 2px #000; pointer-events: none; }
    .pt-bar-tip { position: absolute; left: 1.4rem; right: 1.4rem; top: calc(env(safe-area-inset-top, 0px) + 7.6rem); text-align: center; font-size: .72rem; line-height: 1.4; color: rgb(255 255 255 / .75); text-shadow: 0 1px 4px #000; pointer-events: none; }
    .pt-bar-bot { position: absolute; left: 0; right: 0; bottom: calc(env(safe-area-inset-bottom, 0px) + .4rem); padding: .8rem 1rem 1rem; display: grid; gap: .6rem; }
    #pt-bar .pt-bar-bot:has(.pt-bar-rec) { grid-template-columns: 1fr auto 1fr; align-items: center; } .pt-bar-bot [data-bar=delay] { justify-self: start; } .pt-bar-bot [data-bar=reset] { justify-self: end; }
    #pt-bar .pt-bar-rec { width: 4.6rem; height: 4.6rem; padding: 0; background: #fff; border: 4px solid rgb(255 255 255 / .5); background-clip: padding-box; }
    .pt-bar-rec i { display: block; width: 100%; height: 100%; border-radius: 50%; background: #e11d48; transform: scale(.7); transition: transform .15s, border-radius .15s; } #pt-bar.rec .pt-bar-rec i { border-radius: .6rem; transform: scale(.45); }
    .pt-bar-scrub { display: flex; align-items: center; gap: .5rem; } .pt-bar-scrub input { flex: 1; min-width: 0; accent-color: rgb(var(--a500)); } #pt-bar .pt-bar-scrub button { padding: .4rem .7rem; min-width: 2.75rem; } .pt-bar-scrub span { font-size: .68rem; font-family: ui-monospace, monospace; min-width: 5.2rem; text-align: right; }
    .pt-bar-row2 { display: flex; justify-content: space-between; gap: .6rem; } #pt-bar .pt-bar-go { background: rgb(var(--a600)); flex: 1; max-width: 12rem; }
    .pt-bar-prog { position: absolute; left: 0; right: 0; top: 0; height: 4px; background: rgb(255 255 255 / .2); } .pt-bar-prog i { display: block; height: 100%; width: 0; background: rgb(var(--a500)); transition: width .2s; }
    #pt-bar.trk .pt-bar-bot .pt-bar-scrub { display: none; }
    .pt-bar-cv { width: 100%; border-radius: .85rem; background: #18181b; display: block; }
    .pt-bar-legend { display: flex; align-items: center; gap: .5rem; font-size: .66rem; color: rgb(var(--z500)); } .pt-bar-legend i { flex: 1; height: .35rem; border-radius: 9999px; background: linear-gradient(90deg, rgb(251 113 133), rgb(251 191 36), rgb(52 211 153)); }
    .pt-bar-tiles { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .4rem; } .pt-bar-tiles div { display: grid; gap: .1rem; padding: .55rem .3rem; border-radius: .8rem; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); text-align: center; }
    .pt-bar-tiles b { font-size: 1.1rem; font-weight: 900; font-family: ui-monospace, monospace; color: #fff; } .pt-bar-tiles span { font-size: .58rem; line-height: 1.2; color: rgb(var(--z400)); } .pt-bar-tiles .warn b { color: #fbbf24; }
    .pt-bar-reps { display: grid; gap: .25rem; } .pt-bar-rh, .pt-bar-rep { display: grid; grid-template-columns: 2.2rem 1fr 1fr 1fr 1.2fr; align-items: center; gap: .3rem; padding: .4rem .6rem; font-size: .72rem; }
    .pt-bar-rh { font-size: .58rem; font-weight: 800; letter-spacing: .05em; text-transform: uppercase; color: rgb(var(--z500)); padding-bottom: 0; }
    .pt-bar-rep { position: relative; overflow: hidden; border-radius: .7rem; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); font-family: ui-monospace, monospace; color: rgb(var(--z200)); }
    .pt-bar-rep i { position: absolute; left: 0; top: 0; bottom: 0; background: rgb(var(--a600) / .28); } .pt-bar-rep > * { position: relative; } .pt-bar-rep b { color: #fff; }
    .pt-bar-read { font-size: .78rem; line-height: 1.45; color: rgb(var(--z200)); } .pt-bar-fine { font-size: .66rem; line-height: 1.45; color: rgb(var(--z500)); } .pt-bar-fine.warn { color: #fbbf24; }
    .pt-bar-fail p { font-size: .82rem; line-height: 1.45; color: rgb(var(--z200)); } .pt-bar-fail p + p { margin-top: .5rem; }
    .pt-bar-acts { display: flex; gap: .5rem; } .pt-bar-acts button { flex: 1; }
    .pt-bar-row { display: flex; align-items: center; gap: .5rem; padding: .55rem .7rem; border-radius: .8rem; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); font-size: .74rem; color: rgb(var(--z200)); } .pt-bar-row span { flex: 1; min-width: 0; }
    .pt-bar-row button { padding: .35rem .6rem; border-radius: .6rem; font-size: .72rem; font-weight: 800; background: rgb(var(--z800)); color: rgb(var(--z100)); }
    .pt-bar-new { width: 100%; flex: none; }
    .pt-fc-bar { padding: .05rem .55rem 0; font-size: .66rem; color: rgb(var(--a400)); }
  `;
  document.head.appendChild(css);
})();
  