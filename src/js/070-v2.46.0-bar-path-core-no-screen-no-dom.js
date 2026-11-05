
/* =====================================================================
 * PulseTrack 2.46.0: bar path core (no screen, no DOM): a template tracker for the plate on the end of the bar, and the maths that turns a
 * path into reps, speeds and sway. m76a.js is built from this file plus the screens; the same code is run in plain Node by the tests.
 *  - Tracker: you give it the centre and radius of the plate in the first frame. It remembers a round patch of the plate (grey levels, every
 *    second pixel) and in each new frame looks for the best normalised-cross-correlation match near where the plate should be (constant
 *    speed guess). It refines the match to a fraction of a pixel and slowly updates the patch while the match is good.
 *  - analyse(): smooths the path, finds the turning points (bottom and top of each rep), and gives for each rep the range of motion, the
 *    mean and peak speed on the way up, and how far the bar swayed sideways. "Up" is the concentric part for squats, presses, deadlifts.
 * ===================================================================== */
const PTBarCore = (function () {
  "use strict";
  /** RGBA bytes to grey levels */
  function gray(rgba, n, out) {
    const g = out || new Uint8Array(n);
    for (let i = 0, j = 0; i < n; i++, j += 4) g[i] = (rgba[j] * 77 + rgba[j + 1] * 150 + rgba[j + 2] * 29) >> 8;
    return g;
  }
  function offsets(r) {
    const o = [];
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (dx * dx + dy * dy <= r * r && ((dx + dy) & 1) === 0) o.push(dx, dy);
    return new Int16Array(o);
  }
  function Tracker(w, h, cx, cy, r) {
    this.w = w; this.h = h; this.r = Math.max(4, Math.round(r));
    this.offs = offsets(this.r); this.n = this.offs.length / 2;
    this.raw = new Float32Array(this.n); this.zm = new Float32Array(this.n); this.tn = 1;
    this.x = cx; this.y = cy; this.px = cx; this.py = cy; this.vx = 0; this.vy = 0; this.lost = 0; this.started = false;
    this.base = null;
  }
  Tracker.prototype.inside = function (x, y) { const r = this.r; return x - r >= 0 && y - r >= 0 && x + r < this.w && y + r < this.h; };
  Tracker.prototype._grab = function (g, cx, cy, into) {
    const o = this.offs, w = this.w; for (let k = 0, i = 0; k < this.n; k++, i += 2) into[k] = g[(cy + o[i + 1]) * w + cx + o[i]];
  };
  Tracker.prototype._norm = function () {
    const n = this.n; let m = 0; for (let k = 0; k < n; k++) m += this.raw[k]; m /= n;
    let s = 0; for (let k = 0; k < n; k++) { const d = this.raw[k] - m; this.zm[k] = d; s += d * d; }
    this.tn = Math.sqrt(s) || 1;
  };
  Tracker.prototype.init = function (g) {
    const cx = Math.round(this.x), cy = Math.round(this.y);
    if (!this.inside(cx, cy)) throw new Error("The plate is too close to the edge of the picture.");
    this._grab(g, cx, cy, this.raw); this._norm(); this.base = Float32Array.from(this.raw); this.started = true;
    return { x: this.x, y: this.y, score: 1, lost: false };
  };
  Tracker.prototype._score = function (g, px, py) {
    const o = this.offs, w = this.w, n = this.n, z = this.zm; let sp = 0, spp = 0, stp = 0;
    for (let k = 0, i = 0; k < n; k++, i += 2) { const v = g[(py + o[i + 1]) * w + px + o[i]]; sp += v; spp += v * v; stp += v * z[k]; }
    const varp = spp - sp * sp / n; if (varp < 1) return -1;
    return stp / (Math.sqrt(varp) * this.tn);
  };
  /** one frame later: { x, y, score, lost } (positions in the frame's own pixels) */
  Tracker.prototype.step = function (g) {
    const gx = Math.round(this.x + this.vx), gy = Math.round(this.y + this.vy);
    const sp = Math.hypot(this.vx, this.vy), R = Math.round(Math.min(this.r * 2, 8 + 1.6 * sp + (this.lost ? 6 * this.lost : 0)));
    let best = -2, bx = gx, by = gy;
    for (let dy = -R; dy <= R; dy++) {
      const py = gy + dy; if (py - this.r < 0 || py + this.r >= this.h) continue;
      for (let dx = -R; dx <= R; dx++) {
        const px = gx + dx; if (px - this.r < 0 || px + this.r >= this.w) continue;
        const s = this._score(g, px, py); if (s > best) { best = s; bx = px; by = py; }
      }
    }
    let fx = bx, fy = by;
    if (best > 0 && this.inside(bx - 1, by - 1) && this.inside(bx + 1, by + 1)) {
      const c = best, l = this._score(g, bx - 1, by), r = this._score(g, bx + 1, by), u = this._score(g, bx, by - 1), d = this._score(g, bx, by + 1);
      const dxn = l - 2 * c + r, dyn = u - 2 * c + d;
      if (dxn < -1e-6) fx = bx + Math.max(-0.5, Math.min(0.5, 0.5 * (l - r) / dxn));
      if (dyn < -1e-6) fy = by + Math.max(-0.5, Math.min(0.5, 0.5 * (u - d) / dyn));
    }
    const ok = best >= 0.45;
    if (ok) {
      this.lost = 0; this.vx = 0.6 * this.vx + 0.4 * (fx - this.x); this.vy = 0.6 * this.vy + 0.4 * (fy - this.y); this.px = this.x; this.py = this.y; this.x = fx; this.y = fy;
      if (best > 0.88 && this.inside(bx, by)) {   // keep up with small changes in light and angle, but stay tied to the first look
        const tmp = new Float32Array(this.n); this._grab(g, bx, by, tmp);
        for (let k = 0; k < this.n; k++) this.raw[k] = 0.9 * this.raw[k] + 0.1 * tmp[k];
        this._norm();
      }
    } else {
      this.lost++; this.px = this.x; this.py = this.y; this.x += this.vx; this.y += this.vy;
      this.x = Math.max(this.r, Math.min(this.w - this.r - 1, this.x)); this.y = Math.max(this.r, Math.min(this.h - this.r - 1, this.y));
    }
    return { x: this.x, y: this.y, score: best, lost: !ok };
  };

  /* ------------------------------------------------------------ the path to reps */
  const gauss = (a, sigma) => {                       // sigma in samples
    const R = Math.max(1, Math.ceil(sigma * 3)), k = []; let s = 0;
    for (let i = -R; i <= R; i++) { const v = Math.exp(-(i * i) / (2 * sigma * sigma)); k.push(v); s += v; }
    const out = new Float64Array(a.length);
    for (let i = 0; i < a.length; i++) { let acc = 0, wsum = 0; for (let j = -R; j <= R; j++) { const m = i + j; if (m < 0 || m >= a.length) continue; const wgt = k[j + R]; acc += a[m] * wgt; wsum += wgt; } out[i] = acc / wsum; }
    return out;
  };
  /** the points are { t (s), x, y } with y growing downwards (screen). mPerPx turns pixels into metres. */
  function analyse(points, mPerPx, opts) {
    opts = opts || {};
    const pts = points.filter(p => isFinite(p.t) && isFinite(p.x) && isFinite(p.y)).sort((a, b) => a.t - b.t);
    const empty = { ok: false, reason: "Not enough of the path was found.", reps: [], path: [], summary: null };
    if (pts.length < 8 || !(mPerPx > 0)) return empty;
    const t0 = pts[0].t, T = pts[pts.length - 1].t - t0; if (T < 1) return empty;
    const hz = opts.hz || 30, N = Math.floor(T * hz) + 1, ts = new Float64Array(N), xs = new Float64Array(N), ys = new Float64Array(N);
    for (let i = 0, j = 0; i < N; i++) {                // even spacing, so the speeds are not thrown off by uneven frame times
      const t = t0 + i / hz; ts[i] = t - t0; while (j < pts.length - 2 && pts[j + 1].t < t) j++;
      const a = pts[j], b = pts[j + 1], f = b.t === a.t ? 0 : Math.max(0, Math.min(1, (t - a.t) / (b.t - a.t)));
      xs[i] = a.x + (b.x - a.x) * f; ys[i] = a.y + (b.y - a.y) * f;
    }
    const sig = Math.max(1.2, (opts.smooth || 0.07) * hz), sx = gauss(xs, sig), sy = gauss(ys, sig);
    const h = new Float64Array(N), v = new Float64Array(N);
    for (let i = 0; i < N; i++) h[i] = -(sy[i] - sy[0]) * mPerPx;
    for (let i = 0; i < N; i++) { const a = Math.max(0, i - 1), b = Math.min(N - 1, i + 1); v[i] = (h[b] - h[a]) / (ts[b] - ts[a]); }
    let lo = Infinity, hi = -Infinity; for (let i = 0; i < N; i++) { lo = Math.min(lo, h[i]); hi = Math.max(hi, h[i]); }
    const range = hi - lo, thr = Math.max(opts.minRom || 0.12, 0.3 * range);
    if (range < (opts.minRom || 0.12)) return Object.assign({}, empty, { reason: "The bar barely moved in the video.", path: pathOut(ts, sx, sy, h, v, mPerPx) });
    // turning points: a swing counts only when it goes more than thr from the last turning point
    const ext = []; let dir = 0, cand = 0, candH = h[0];
    for (let i = 1; i < N; i++) {
      if (dir === 0) {
        if (h[i] > candH + thr) { ext.push({ i: cand, type: "min" }); dir = 1; cand = i; candH = h[i]; }
        else if (h[i] < candH - thr) { ext.push({ i: cand, type: "max" }); dir = -1; cand = i; candH = h[i]; }
        else { if (h[i] > candH && h[0] <= candH + 1e-9) { /* keep first point */ } }
      } else if (dir === 1) {
        if (h[i] > candH) { cand = i; candH = h[i]; } else if (h[i] < candH - thr) { ext.push({ i: cand, type: "max" }); dir = -1; cand = i; candH = h[i]; }
      } else {
        if (h[i] < candH) { cand = i; candH = h[i]; } else if (h[i] > candH + thr) { ext.push({ i: cand, type: "min" }); dir = 1; cand = i; candH = h[i]; }
      }
    }
    if (dir !== 0) ext.push({ i: cand, type: dir === 1 ? "max" : "min" });
    const reps = [];
    for (let k = 0; k + 1 < ext.length; k++) {
      const a = ext[k], b = ext[k + 1]; if (a.type !== "min" || b.type !== "max") continue;
      const rom = h[b.i] - h[a.i]; if (!(ts[b.i] - ts[a.i] > 0.15) || rom < thr * 0.8) continue;
      let pcv = 0, pi = a.i; for (let i = a.i; i <= b.i; i++) if (v[i] > pcv) { pcv = v[i]; pi = i; }
      // the way up starts when the bar really starts moving and ends when it stops: waiting at the bottom or locking out does not count
      const vt = Math.max(0.02, 0.06 * pcv); let s0 = a.i, e0 = b.i;
      while (s0 < pi && v[s0] <= vt) s0++; while (e0 > pi && v[e0] <= vt) e0--;
      const dt = ts[e0] - ts[s0]; if (!(dt > 0.15)) continue;
      const prev = ext[k - 1] && ext[k - 1].type === "max" ? ext[k - 1] : null, from = prev ? prev.i : a.i;
      let xlo = Infinity, xhi = -Infinity; for (let i = from; i <= b.i; i++) { xlo = Math.min(xlo, sx[i]); xhi = Math.max(xhi, sx[i]); }
      reps.push({ n: reps.length + 1, t0: ts[a.i] + t0, t1: ts[b.i] + t0, rom, up: dt, down: prev ? ts[a.i] - ts[prev.i] : null, mcv: (h[e0] - h[s0]) / dt, pcv, sway: (xhi - xlo) * mPerPx, i0: a.i, i1: b.i });
    }
    const out = { ok: reps.length > 0, reason: reps.length ? "" : "No full reps were found. Film the whole range of motion from the side.", reps, path: pathOut(ts, sx, sy, h, v, mPerPx), t0, hz, summary: null };
    if (reps.length) {
      const m = reps.map(r => r.mcv), best = Math.max(...m), avg = m.reduce((s, x) => s + x, 0) / m.length, last = m[m.length - 1];
      const sw = reps.map(r => r.sway), swAvg = sw.reduce((s, x) => s + x, 0) / sw.length;
      out.summary = { reps: reps.length, avgMcv: avg, bestMcv: best, lastMcv: last, loss: reps.length > 1 ? Math.max(0, (best - last) / best) * 100 : 0, avgRom: reps.reduce((s, r) => s + r.rom, 0) / reps.length, avgSway: swAvg, maxSway: Math.max(...sw), peak: Math.max(...reps.map(r => r.pcv)) };
    }
    return out;
  }
  function pathOut(ts, sx, sy, h, v, mPerPx) {
    const out = [], step = Math.max(1, Math.floor(ts.length / 600));
    for (let i = 0; i < ts.length; i += step) out.push([Math.round(ts[i] * 1000) / 1000, Math.round(sx[i] * 10) / 10, Math.round(sy[i] * 10) / 10, Math.round(v[i] * 1000) / 1000]);
    return out;
  }
  return { gray, Tracker, analyse, gauss };
})();
if (typeof module !== "undefined" && module.exports) module.exports = PTBarCore;
  