/* =====================================================================
 * PulseTrack 3.8.0: a drawing for (nearly) every exercise, made by the app.
 *  One line figure, the same proportions every time, posed for a kind of movement (a flat press, a squat, a row, a curl ...) and
 *  holding the right kit (barbell, dumbbell, kettlebell, cable, machine, band ...). Two poses per movement: where you start and
 *  where you finish, with an arrow for the movement. Original work drawn by PulseTrack's code: no photos, nothing traced, nothing
 *  downloaded, so it works offline and costs nothing.
 *  Which drawing an exercise gets: RULES below (the first rule whose words match its name, and the category when a rule names one).
 *  The rules are plain JSON between the RULES markers, so tools/guides_data.py reads the very same rules for the coverage report.
 *  Kit: the words of the name first ("cable", "dumbbell", "smith" ...), then openGym's equipment field, then the movement's default.
 *  Step by step (module 134) asks PT.figure.forSteps(name, steps) for exercises without their own guide pictures: each step gets the
 *  start or the finish pose (the first step and steps that say "lower", "return" ... get the start), with the movement arrow, so
 *  "Add my photo" and "Move arrows" work the same as on the hand-made guides. Exercises no rule matches keep "No picture yet".
 *  PT.figure = { classify(name), svg(id, frame, kit), forSteps(name, steps), PATTERNS, RULES, kitOf(name) }.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof PT === "undefined") return;
  const W = 320, H = 240, FLOOR = 200, D2R = Math.PI / 180;
  const LEN = { t: 54, neck: 24, ua: 34, fa: 29, th: 46, sh: 45, ft: 15, wr: 9 };   // 3.12.0: upper arm 31 -> 34, so a straight arm reaches mid-thigh
  const C = { body: "#e4e4e7", far: "#9b9ba5", kit: "#8f8f99", kitFill: "#3f3f46", plate: "#a1a1aa", plateFill: "#52525b", floor: "#3f3f46", bg: "#18181b", cable: "#a1a1aa" };

  /* ================================================================ geometry */
  const dir = a => [Math.cos(a * D2R), -Math.sin(a * D2R)];
  const add = (p, a, l) => { const d = dir(a); return [p[0] + d[0] * l, p[1] + d[1] * l]; };
  const dist = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
  // two bones from root towards target; bend +1 puts the middle joint on the left of root->target (screen), -1 on the right
  function ik(root, target, a, b, bend) {
    const dx = target[0] - root[0], dy = target[1] - root[1];
    const d = Math.max(Math.abs(a - b) + 0.5, Math.min(a + b - 0.01, Math.hypot(dx, dy) || 0.01));
    const base = Math.atan2(dy, dx), A = Math.acos(Math.max(-1, Math.min(1, (a * a + d * d - b * b) / (2 * a * d))));
    const ang = base - (bend >= 0 ? 1 : -1) * A;
    const mid = [root[0] + a * Math.cos(ang), root[1] + a * Math.sin(ang)];
    const k = Math.atan2(target[1] - mid[1], target[0] - mid[0]);
    return [mid, [mid[0] + b * Math.cos(k), mid[1] + b * Math.sin(k)]];
  }
  function limb(root, p, kA, kB, kT, kBend, la, lb, defA, sa, sb) {
    if (p[kT]) return ik(root, p[kT], la * (sa || 1), lb * (sb || 1), p[kBend] == null ? 1 : p[kBend]);
    const a = p[kA] == null ? defA : p[kA], b = p[kB] == null ? a : p[kB];
    const m = add(root, a, la * (sa || 1)); return [m, add(m, b, lb * (sb || 1))];
  }

  // side view, facing right. hip [x,y], t = torso angle (90 up, 0 forward, 180 back), nk = head tilt;
  // arms: ua/fa angles (uaR/faR: relative to the torso) or hand [x,y] + eb (elbow side); legs: th/sh or ankle [x,y] + kb; ft foot angle.
  // The far arm and leg (ua2 ..., hand2, ankle2) default to the near ones and are drawn in grey behind when they differ.
  function side(p) {
    const t = p.t == null ? 90 : p.t, j = { view: "side", hip: p.hip ? p.hip.slice() : [160, 106], mirror: !!p.mirror };
    const rel = (k, kr, d) => p[k] != null ? p[k] : p[kr] != null ? t + p[kr] : d;
    j.shoulder = add(j.hip, t, LEN.t); j.head = add(j.shoulder, t + (p.nk || 0), LEN.neck);
    if (p.handOn) {
      const [jk, a, b] = p.handOn, base = jk === "hip" ? j.hip : j.shoulder, u = dir(t), back = dir(t + 90);
      p = Object.assign({}, p, { hand: [base[0] + u[0] * a + back[0] * b, base[1] + u[1] * a + back[1] * b] });
    }
    const ua = rel("ua", "uaR", -90), fa = rel("fa", "faR", ua);
    [j.elbow, j.hand] = limb(j.shoulder, Object.assign({}, p, { ua, fa }), "ua", "fa", "hand", "eb", LEN.ua, LEN.fa, -90);
    const p2 = { ua: rel("ua2", "ua2R", ua), fa: rel("fa2", "fa2R", fa), hand: p.hand2 || (p.ua2 == null && p.ua2R == null ? p.hand : null), eb: p.eb2 == null ? p.eb : p.eb2 };
    [j.elbow2, j.hand2] = limb(j.shoulder, p2, "ua", "fa", "hand", "eb", LEN.ua, LEN.fa, -90);
    [j.knee, j.ankle] = limb(j.hip, p, "th", "sh", "ankle", "kb", LEN.th, LEN.sh, -90);
    j.toe = add(j.ankle, p.ft == null ? 0 : p.ft, LEN.ft);
    const q2 = { th: p.th2 == null ? p.th : p.th2, sh: p.sh2 == null ? (p.th2 == null ? p.sh : p.th2) : p.sh2, ankle: p.ankle2 || (p.th2 == null ? p.ankle : null), kb: p.kb2 == null ? p.kb : p.kb2 };
    if (p.sh2 != null) q2.sh = p.sh2;
    [j.knee2, j.ankle2] = limb(j.hip, q2, "th", "sh", "ankle", "kb", LEN.th, LEN.sh, -90);
    j.toe2 = add(j.ankle2, p.ft2 == null ? (p.ft == null ? 0 : p.ft) : p.ft2, LEN.ft);
    j.grip = p.wr == null ? j.hand : add(j.hand, p.wr, LEN.wr);
    return j;
  }
  // front view (also a lying figure seen from above). pel [x,y]; tl = lean; lift = shrug; arms of the figure's left side (viewer's
  // right) by ua/fa or hand [x,y], mirrored for the other arm unless uaL/faL/handL say otherwise; legs th/sh or ankle; uaS ... foreshorten.
  function front(p) {
    const j = { view: "front" }, tl = p.tl || 0, pel = p.pel ? p.pel.slice() : [160, 106], bow = p.bow || 0;   // 3.12.0: bow 0..1 = bent forward; hk = head tilt
    j.pel = pel; j.neck = add(pel, 90 - tl, LEN.t * (p.tS || 1) * (1 - 0.5 * bow)); j.head = add(j.neck, 90 - tl + (p.hk || 0), (LEN.neck - 2) * (1 - 1.85 * bow));
    j.shR = add(j.neck, -tl, 17); j.shL = add(j.neck, 180 - tl, 17);
    if (p.lift) { j.shR[1] -= p.lift; j.shL[1] -= p.lift; }
    j.hipR = add(pel, -tl, 10); j.hipL = add(pel, 180 - tl, 10);
    const m = a => 180 - a, mx = q => q && [2 * j.neck[0] - q[0], q[1]], mxp = q => q && [2 * pel[0] - q[0], q[1]];
    const R = { ua: p.ua == null ? -84 : p.ua, fa: p.fa == null ? (p.ua == null ? -84 : p.ua) : p.fa, hand: p.hand, eb: p.eb == null ? -1 : p.eb };
    const Lf = { ua: p.uaL == null ? m(R.ua) : p.uaL, fa: p.faL == null ? (p.uaL == null ? m(R.fa) : p.uaL) : p.faL, hand: p.handL || (p.uaL == null ? mx(p.hand) : null), eb: p.ebL == null ? -R.eb : p.ebL };
    [j.elR, j.haR] = limb(j.shR, R, "ua", "fa", "hand", "eb", LEN.ua, LEN.fa, -84, p.uaS, p.faS);
    [j.elL, j.haL] = limb(j.shL, Lf, "ua", "fa", "hand", "eb", LEN.ua, LEN.fa, -96, p.uaLS || p.uaS, p.faLS || p.faS);
    const RL = { th: p.th == null ? -86 : p.th, sh: p.sh == null ? (p.th == null ? -86 : p.th) : p.sh, ankle: p.ankle, kb: p.kb == null ? 1 : p.kb };
    const LL = { th: p.thL == null ? m(RL.th) : p.thL, sh: p.shL == null ? (p.thL == null ? m(RL.sh) : p.thL) : p.shL, ankle: p.ankleL || (p.thL == null ? mxp(p.ankle) : null), kb: p.kbL == null ? -RL.kb : p.kbL };
    [j.knR, j.anR] = limb(j.hipR, RL, "th", "sh", "ankle", "kb", LEN.th, LEN.sh, -86, p.thS, p.shS);
    [j.knL, j.anL] = limb(j.hipL, LL, "th", "sh", "ankle", "kb", LEN.th, LEN.sh, -94, p.thLS || p.thS, p.shLS || p.shS);
    j.toR = [j.anR[0] + 9, j.anR[1] + 1]; j.toL = [j.anL[0] - 9, j.anL[1] + 1];
    if (p.rot) { const c = pel, r = p.rot * D2R, cs = Math.cos(r), sn = Math.sin(r); for (const k in j) if (Array.isArray(j[k])) { const x = j[k][0] - c[0], y = j[k][1] - c[1]; j[k] = [c[0] + x * cs - y * sn, c[1] + x * sn + y * cs]; } }
    Object.assign(j, { hand: j.haR, hand2: j.haL, elbow: j.elR, shoulder: j.shR, hip: j.pel, knee: j.knR, ankle: j.anR, grip: j.haR, grip2: j.haL });
    return j;
  }
  const pose = (p, view) => (view === "front" ? front : side)(p);
  // stand on the floor: move the figure so its lowest foot point (or the joints named in p.on) sits on the floor
  function settle(j, p) {
    if (!p.floor) return j;
    const keys = p.on || (j.view === "front" ? ["anR", "anL"] : ["ankle", "toe", "ankle2", "toe2"]);
    const low = Math.max(...keys.map(k => j[k][1] + (/an|ankle/.test(k) ? 4 : 2)));
    const dy = FLOOR - low; for (const k in j) if (Array.isArray(j[k])) j[k] = [j[k][0], j[k][1] + dy];
    return j;
  }

  /* ================================================================ drawing primitives (kept as data so the picture can be fitted) */
  const L = (a, b, c, w) => ({ k: "l", a, b, c, w });
  const P = (pts, c, w) => ({ k: "p", pts, c, w });
  const O = (at, r, fill, stroke, sw) => ({ k: "c", at, r, fill, stroke, sw: sw == null ? 2 : sw });
  const Rc = (x, y, w, h, rx) => ({ k: "r", x, y, w, h, rx: rx == null ? 3 : rx });
  const same = (a, b) => dist(a, b) < 1.5;

  /* ================================================================ 3.12.0: the figure as a body
   *  Tapered arms and legs, a torso with a chest and a back, a head with an eye and a nose (so you can see which way you face), hands
   *  and shoes. Every part has a thin dark outline, so an arm in front of the body stays visible (a curl, a press). The far arm and
   *  leg are a darker grey behind. hi = { region: 0..100 } fills the muscles the exercise works in the theme's colour: strong for the
   *  main muscles, lighter for the helping ones (REGION_OF maps the 26 muscles to the parts of the figure). A pose can say mirror:
   *  true when the figure lies face up with its head on the right (so the chest is on the other side). */
  const BR = { ua: [7.4, 5.8], fa: [5.8, 4.5], th: [10.8, 7.4], sh: [7.4, 5.1], neck: [5.4, 5.4] };
  const OUTLINE = C.bg, OW = 2.6;
  const unit = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 0.001; return [dx / l, dy / l, l]; };
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const offs = (p, n, d) => [p[0] + n[0] * d, p[1] + n[1] * d];
  function capPts(a, b, ra, rb) {   // a capsule from a (radius ra) to b (radius rb), as a polygon
    const [ux, uy] = unit(a, b), base = Math.atan2(ux, -uy), pts = [];   // base = the angle of the normal (-uy, ux)
    for (let i = 0; i <= 8; i++) { const t = base - Math.PI * i / 8; pts.push([b[0] + Math.cos(t) * rb, b[1] + Math.sin(t) * rb]); }
    for (let i = 0; i <= 8; i++) { const t = base + Math.PI - Math.PI * i / 8; pts.push([a[0] + Math.cos(t) * ra, a[1] + Math.sin(t) * ra]); }
    return pts;
  }
  const G = (pts, fill, extra) => Object.assign({ k: "g", pts, fill, stroke: OUTLINE, sw: OW }, extra || {});   // an outlined body shape
  const F = (pts, fill) => ({ k: "g", pts, fill, stroke: "none", sw: 0 });                                         // a fill inside one
  const seg = (a, b, r, fill) => G(capPts(a, b, r[0], r[1]), fill);
  // a muscle on one side of a limb (side +1 = the normal (-uy, ux) of a->b, -1 the other side, 0 the middle)
  function belly(a, b, r, side, from = 0.16, to = 0.82) {
    const [ux, uy] = unit(a, b), n = [-uy, ux], p = lerp(a, b, from), q = lerp(a, b, to);
    const rp = r[0] + (r[1] - r[0]) * from, rq = r[0] + (r[1] - r[0]) * to;
    const k = side ? 0.58 : 0.72, o = side ? 0.34 : 0;
    return capPts(offs(p, n, side * rp * o), offs(q, n, side * rq * o), rp * k, rq * k);
  }
  // the muscle regions each of the 26 muscles lights up
  const REGION_OF = { chest: "chest", upper_chest: "chest", serratus: "obliques", abs: "abs", obliques: "obliques", lats: "lats", mid_back: "upperBack",
    traps: "traps", lower_back: "lowerBack", glutes: "glutes", glute_med: "glutes", hip_flexors: "hipFront", adductors: "inThigh", quads: "thighF",
    hamstrings: "thighB", calves: "shinB", tibialis: "shinF", biceps: "armF", brachialis: "armF", triceps: "armB", forearm_flexors: "forearm",
    forearm_extensors: "forearm", front_delts: "delts", side_delts: "delts", rear_delts: "delts", neck: "neck" };
  let HI_STRONG = null;
  function hiColor(v, far) {
    if (!HI_STRONG) {
      let s = [74, 222, 128];
      try { const m = String(PT.muscleFill ? PT.muscleFill(100) : "").match(/\d+/g); if (m && m.length >= 3) s = m.slice(0, 3).map(Number); } catch (e) { }
      HI_STRONG = s;
    }
    const base = far ? [155, 155, 165] : [228, 228, 231], t = Math.max(0.35, Math.min(1, v / 100)) * (far ? 0.75 : 1);
    return "#" + HI_STRONG.map((c, i) => Math.round(base[i] + (c - base[i]) * t).toString(16).padStart(2, "0")).join("");
  }
  function smoothD(pts) {   // a closed Catmull-Rom curve through the points, as a path
    const n = pts.length, f = v => n1(v);
    let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += `C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
    }
    return d + "Z";
  }
  const SM = (pts, fill, stroke, sw) => ({ k: "sm", pts, fill, stroke: stroke == null ? OUTLINE : stroke, sw: sw == null ? OW : sw });

  function person(j, hi, plain) {
    hi = hi || {};
    const on = k => (hi[k] || 0) > 0, out = [];
    const mark = (k, pts, far) => { if (on(k) && !plain) out.push(F(pts, hiColor(hi[k], far))); };
    if (j.view === "front") return personFront(j, hi, plain);
    const flip = j.mirror ? -1 : 1, body = C.body, far = C.far;
    const [tux, tuy] = unit(j.hip, j.shoulder), tn = [-tuy * flip, tux * flip], tu = [tux, tuy];   // torso up, torso front
    const limbSide = flip * -1;   // the front of an arm or leg is the -normal side for a figure facing right
    const leg = (hip, knee, ankle, toe, fill, isFar) => {
      out.push(seg(hip, knee, BR.th, fill)); mark("thighF", belly(hip, knee, BR.th, limbSide), isFar); mark("thighB", belly(hip, knee, BR.th, -limbSide), isFar);
      if (on("inThigh") && !on("thighF") && !on("thighB")) mark("inThigh", belly(hip, knee, BR.th, 0), isFar);
      out.push(seg(knee, ankle, BR.sh, fill)); mark("shinB", belly(knee, ankle, BR.sh, -limbSide, 0.1, 0.62), isFar); mark("shinF", belly(knee, ankle, BR.sh, limbSide, 0.1, 0.75), isFar);
      const [fx, fy] = unit(ankle, toe); out.push(G(capPts([ankle[0] - fx * 3, ankle[1] - fy * 3], toe, 5.4, 4), fill));
    };
    const arm = (sh, el, ha, grip, fill, isFar) => {
      out.push(seg(sh, el, BR.ua, fill)); mark("armF", belly(sh, el, BR.ua, limbSide), isFar); mark("armB", belly(sh, el, BR.ua, -limbSide), isFar);
      out.push(seg(el, ha, BR.fa, fill)); mark("forearm", belly(el, ha, BR.fa, 0, 0.1, 0.7), isFar);
      if (grip && !same(grip, ha)) out.push(G(capPts(ha, grip, 4.6, 4.2), fill)); else out.push(G(capPts(ha, ha, 4.8, 4.8), fill));
    };
    const farLeg = !same(j.knee2, j.knee) || !same(j.ankle2, j.ankle), farArm = !same(j.hand2, j.hand) || !same(j.elbow2, j.elbow);
    if (farLeg) leg(j.hip, j.knee2, j.ankle2, j.toe2, far, true);
    if (farArm) arm(j.shoulder, j.elbow2, j.hand2, null, far, true);
    // the torso: a chest in front, a curved back behind, rounded over the shoulders and round the seat
    const H = j.hip, S = j.shoulder, L = dist(H, S), at = (t, d) => offs(offs(H, tu, L * t), tn, d);
    const FR = [[0, 9.5], [0.28, 10.5], [0.52, 11], [0.74, 14.5], [0.92, 12]], BK = [[0.95, -11], [0.72, -12.5], [0.42, -10], [0.18, -12.5], [0, -14]];
    const tor = FR.map(([t, d]) => at(t, d)).concat([at(1.1, 2)], BK.map(([t, d]) => at(t, d)), [at(-0.16, -3)]);
    out.push(SM(tor, body));
    mark("chest", capPts(at(0.6, 7.5), at(0.86, 7.5), 6.8, 5.8)); mark("abs", capPts(at(0.14, 6), at(0.52, 6.5), 4.8, 4.8));
    mark("obliques", capPts(at(0.16, 0), at(0.5, 1), 5, 5)); mark("lats", capPts(at(0.46, -7.5), at(0.8, -7.5), 5.2, 5.8));
    mark("upperBack", capPts(at(0.58, -8), at(0.9, -7.5), 5.4, 5.4)); mark("lowerBack", capPts(at(0.14, -7.5), at(0.42, -6.5), 4.8, 4.6));
    mark("traps", capPts(at(0.9, -5), at(1.08, -2), 4.2, 3.6)); mark("glutes", capPts(at(-0.06, -7.5), at(0.08, -8.5), 7, 6.4));
    mark("hipFront", capPts(at(-0.02, 5.5), at(0.08, 5.5), 4.2, 4.2));
    leg(j.hip, j.knee, j.ankle, j.toe, body, false);
    // the head: neck, a nose and an eye on the side you face
    const [hux, huy] = unit(S, j.head), hn = [-huy * flip, hux * flip], hu = [hux, huy];
    out.push(G(capPts(S, j.head, BR.neck[0], BR.neck[1]), body)); mark("neck", capPts(lerp(S, j.head, 0.2), lerp(S, j.head, 0.62), 3.4, 3.4));
    out.push(G(capPts(offs(offs(j.head, hn, 10.5), hu, -1.5), offs(offs(j.head, hn, 10.5), hu, -1.5), 3.2, 3.2), body));
    out.push(O(j.head, 12, body, OUTLINE, OW));
    out.push(O(offs(offs(j.head, hn, 5.5), hu, 2.6), 1.7, OUTLINE, OUTLINE, 0));
    mark("delts", capPts(offs(S, tu, -2), offs(S, tu, -2), 7.2, 7.2));
    arm(j.shoulder, j.elbow, j.hand, j.grip, body, false);
    if (on("delts") && !plain) out.push(F(capPts(offs(S, tu, -1.5), offs(S, tu, -1.5), 6.4, 6.4), hiColor(hi.delts)));   // the shoulder cap shows over the arm
    return out;
  }
  // front view (or seen from above when lying)
  function personFront(j, hi, plain) {
    const out = [], body = C.body, on = k => (hi[k] || 0) > 0, mark = (k, pts) => { if (on(k) && !plain) out.push(F(pts, hiColor(hi[k]))); };
    const [ux, uy] = unit(j.pel, j.neck), up = [ux, uy], lat = [-uy, ux];   // lat points to the figure's left (viewer's right) for an upright figure
    const leg = (hip, kn, an, side) => {
      out.push(seg(hip, kn, BR.th, body)); mark("thighF", belly(hip, kn, BR.th, 0)); mark("inThigh", belly(hip, kn, BR.th, side * 0.9, 0.12, 0.7));
      out.push(seg(kn, an, BR.sh, body)); mark("shinB", belly(kn, an, BR.sh, 0, 0.08, 0.6)); mark("shinF", belly(kn, an, BR.sh, 0, 0.1, 0.75));
      out.push(G(capPts([an[0], an[1] + 1], [an[0] + (an[0] > j.pel[0] ? 5 : -5), an[1] + 3], 5.2, 4.4), body));
    };
    const inward = (a, b) => { const [x, y] = unit(a, b); return (-y * (j.pel[0] - a[0]) + x * (j.pel[1] - a[1])) > 0 ? 1 : -1; };   // the side of a thigh that faces the other leg
    leg(j.hipL, j.knL, j.anL, inward(j.hipL, j.knL)); leg(j.hipR, j.knR, j.anR, inward(j.hipR, j.knR));
    const at = (t, d) => offs(offs(j.pel, up, dist(j.pel, j.neck) * t), lat, d);
    const half = [[-0.12, 12], [0.1, 14], [0.4, 12], [0.72, 15.5], [0.92, 19.5], [1.02, 12]];
    const tor = half.map(([t, d]) => at(t, d)).concat([at(1.08, 0)], half.slice().reverse().map(([t, d]) => at(t, -d)), [at(-0.2, 0)]);
    out.push(SM(tor, body));
    mark("chest", capPts(at(0.7, 3.5), at(0.74, 11.5), 5.2, 5.2)); mark("chest", capPts(at(0.7, -3.5), at(0.74, -11.5), 5.2, 5.2));
    mark("abs", capPts(at(0.08, 0), at(0.52, 0), 5, 5));
    mark("obliques", capPts(at(0.1, 10), at(0.42, 10.5), 3.4, 3.4)); mark("obliques", capPts(at(0.1, -10), at(0.42, -10.5), 3.4, 3.4));
    mark("lats", capPts(at(0.48, 12.5), at(0.78, 15), 3.2, 3.8)); mark("lats", capPts(at(0.48, -12.5), at(0.78, -15), 3.2, 3.8));
    mark("upperBack", capPts(at(0.52, 12.5), at(0.8, 15), 3.2, 3.8)); mark("upperBack", capPts(at(0.52, -12.5), at(0.8, -15), 3.2, 3.8));
    mark("glutes", capPts(at(-0.04, 12.5), at(0.06, 12.5), 3.6, 3.6)); mark("glutes", capPts(at(-0.04, -12.5), at(0.06, -12.5), 3.6, 3.6));
    mark("hipFront", capPts(at(-0.02, 6), at(0.06, 7), 3.2, 3.2)); mark("hipFront", capPts(at(-0.02, -6), at(0.06, -7), 3.2, 3.2));
    out.push(G(capPts(j.neck, j.head, BR.neck[0], BR.neck[1]), body)); mark("neck", capPts(lerp(j.neck, j.head, 0.15), lerp(j.neck, j.head, 0.55), 3.4, 3.4));
    mark("traps", capPts(at(1.0, 4), at(0.98, 13), 3.4, 3)); mark("traps", capPts(at(1.0, -4), at(0.98, -13), 3.4, 3));
    out.push(O(j.head, 12, body, OUTLINE, OW));
    const [hx, hy] = unit(j.neck, j.head), hl = [-hy, hx];
    out.push(O(offs(offs(j.head, hl, 4.4), [hx, hy], 1.5), 1.6, OUTLINE, OUTLINE, 0), O(offs(offs(j.head, hl, -4.4), [hx, hy], 1.5), 1.6, OUTLINE, OUTLINE, 0));
    const arm = (sh, el, ha) => {
      out.push(seg(sh, el, BR.ua, body)); mark("armF", belly(sh, el, BR.ua, 0)); if (!on("armF")) mark("armB", belly(sh, el, BR.ua, 0, 0.2, 0.75));
      out.push(seg(el, ha, BR.fa, body)); mark("forearm", belly(el, ha, BR.fa, 0, 0.1, 0.7));
      out.push(G(capPts(ha, ha, 4.8, 4.8), body));
      mark("delts", capPts(sh, sh, 7, 7));
    };
    arm(j.shL, j.elL, j.haL); arm(j.shR, j.elR, j.haR);
    return out;
  }

  /* kit in the hands. side view: a barbell is seen end on (a plate), a dumbbell is a small one; front view: bars run across */
  function kitAt(kind, j, pat, f) {
    const g = pat.from === "ankle" ? (j.view === "front" ? j.anR : j.ankle) : j.grip, g2 = j.grip2 || j.hand2, out = [], front = j.view === "front";
    const plate = (c, r) => [Object.assign(O(c, r, C.plateFill, C.plate, 3), { fo: 0.62 }), O(c, 3, C.plate, C.plate, 0)];   // 3.12.0: see-through, so the body behind shows
    const dumb = c => front ? [L([c[0] - 8, c[1]], [c[0] + 8, c[1]], C.plate, 3), Rc(c[0] - 13, c[1] - 7, 6, 14, 2), Rc(c[0] + 7, c[1] - 7, 6, 14, 2)] : [O(c, 8, C.plateFill, C.plate, 2.5)];
    const bell = c => [{ k: "path", d: `M${c[0] - 5} ${c[1] + 2} Q${c[0]} ${c[1] - 6} ${c[0] + 5} ${c[1] + 2}`, c: C.plate, w: 2.5 }, O([c[0], c[1] + 11], 9, C.plateFill, C.plate, 2.5)];
    switch (kind) {
      case "barbell": case "smith":
        if (front) { const y = (g[1] + g2[1]) / 2, x1 = Math.min(g[0], g2[0]) - 34, x2 = Math.max(g[0], g2[0]) + 34; out.push(L([x1, y], [x2, y], C.plate, 4), Rc(x1 - 4, y - 16, 9, 32, 2), Rc(x2 - 5, y - 16, 9, 32, 2)); }
        else out.push(...plate(g, pat.plate || 15));
        if (kind === "smith" && !front) out.unshift(Object.assign(L([g[0] + 1, FLOOR], [g[0] + 1, Math.min(g[1] - 40, 20)], C.kit, 4), { back: true }));
        break;
      case "dumbbell": out.push(...dumb(g)); if (front && pat.both !== false) out.push(...dumb(g2)); break;
      case "kettlebell": out.push(...bell(g)); if (front && pat.both !== false && !same(g, g2)) out.push(...bell(g2)); break;
      case "ball": out.push(O(front ? [(g[0] + g2[0]) / 2, (g[1] + g2[1]) / 2] : g, 12, C.plateFill, C.plate, 2.5)); break;
      case "plate": out.push(...plate(front ? [(g[0] + g2[0]) / 2, (g[1] + g2[1]) / 2] : g, 13)); break;
      case "band": if (front) { out.push(L(g, g2, "#71717a", 3)); break; }
      // falls through
      case "cable": case "trx": {
        const to = (pat.cable && pat.cable(j, f)) || (kind === "trx" ? [g[0] + 40, 6] : kind === "band" ? (front ? [j.anR[0], j.anR[1]] : j.ankle) : front ? [j.pel[0] + 96, FLOOR - 8] : [Math.max(g[0], j.toe[0]) + 56, FLOOR - 8]);
        const tos = Array.isArray(to[0]) ? to : [to];
        tos.forEach((tp, i) => { const from = i ? g2 : g; out.push(L(from, tp, kind === "band" ? "#71717a" : C.cable, kind === "band" ? 3 : 2)); if (kind === "cable") out.push(O(tp, 6, C.kitFill, C.kit, 2)); });
        if (kind === "cable") out.push(Rc(g[0] - 5, g[1] - 5, 10, 10, 3));
        break;
      }
      case "landmine":
        if (front) out.push(L([(g[0] + g2[0]) / 2, (g[1] + g2[1]) / 2], [j.pel[0], FLOOR - 4], C.plate, 5));
        else out.push(L(g, [g[0] - 110, FLOOR - 4], C.plate, 4), ...plate(g, 11));
        break;
      case "stick":
        if (front) { const dx = g[0] - g2[0], dy = g[1] - g2[1], l = Math.hypot(dx, dy) || 1, e = 18; out.push(L([g2[0] - dx / l * e, g2[1] - dy / l * e], [g[0] + dx / l * e, g[1] + dy / l * e], C.plate, 4)); }
        else out.push(O(g, 4, C.plate, C.plate, 0));
        break;
      case "machine": out.push(Rc(g[0] - 5, g[1] - 5, 10, 10, 3)); break;
      default: break;
    }
    return out;
  }
  // the fixed kit of a movement (benches, racks, bars), drawn from the start pose so it never moves between the two pictures
  const PROPS = {
    bench: (j, o) => { const y = Math.max(j.hip[1], j.shoulder[1]) + 10, x1 = Math.min(j.hip[0], j.shoulder[0]) - (o.headRoom || 26), x2 = Math.max(j.hip[0], j.shoulder[0]) + 14; return [Rc(x1, y - 1, x2 - x1, 9), L([x1 + 16, y + 8], [x1 + 16, FLOOR], C.kit, 6), L([x2 - 14, y + 8], [x2 - 14, FLOOR], C.kit, 6)]; },
    lowBench: (j, o) => { const y = o.y, x1 = o.x1, x2 = o.x2; return [Rc(x1, y, x2 - x1, 9), L([x1 + 12, y + 9], [x1 + 12, FLOOR], C.kit, 6), L([x2 - 12, y + 9], [x2 - 12, FLOOR], C.kit, 6)]; },
    angled: (j, o) => {   // a back pad under the torso and a seat under the hip
      const t = Math.atan2(j.shoulder[1] - j.hip[1], j.shoulder[0] - j.hip[0]), n = [Math.sin(t) * -1, Math.cos(t)];
      const off = 11, a = [j.hip[0] + n[0] * off * (o.flip ? -1 : 1), j.hip[1] + n[1] * off * (o.flip ? -1 : 1)], b = [j.shoulder[0] + n[0] * off * (o.flip ? -1 : 1) + Math.cos(t) * 14, j.shoulder[1] + n[1] * off * (o.flip ? -1 : 1) + Math.sin(t) * 14];
      const out = [{ k: "l", a, b, c: C.kit, w: 10 }];
      if (o.seat !== false) out.push(L([j.hip[0] - 14, j.hip[1] + 11], [j.hip[0] + 26, j.hip[1] + 11], C.kit, 9), L([j.hip[0] + 4, j.hip[1] + 14], [j.hip[0] + 4, FLOOR], C.kit, 6));
      return out;
    },
    seat: (j, o) => [L([j.hip[0] - 18, j.hip[1] + 11], [j.hip[0] + 22, j.hip[1] + 11], C.kit, 9), L([j.hip[0], j.hip[1] + 14], [j.hip[0], FLOOR], C.kit, 6)].concat(o.back ? [L([j.hip[0] - 13, j.hip[1] + 6], [j.hip[0] - 13 - (o.lean || 4), j.hip[1] - 60], C.kit, 9)] : []),
    rack: (j, o) => [L([j.hip[0] - 46, FLOOR], [j.hip[0] - 46, 34], C.kit, 5), L([j.hip[0] - 54, o.hookY || j.shoulder[1] + 2], [j.hip[0] - 38, o.hookY || j.shoulder[1] + 2], C.kit, 5)],
    bar: (j, o) => [O(o.at, 5, C.kitFill, C.plate, 3), o.post ? L([o.at[0] + 4, o.at[1] + 6], [o.at[0] + 4, FLOOR], C.kit, 6) : L([o.at[0] - 4, o.at[1] - 4], [o.at[0] - 40, 4], C.kit, 4)],
    bars: (j, o) => [L([o.at[0] - 42, o.at[1] + 3], [o.at[0] + 30, o.at[1] + 3], C.plate, 5), L([o.at[0] - 34, o.at[1] + 5], [o.at[0] - 34, FLOOR], C.kit, 5), L([o.at[0] + 22, o.at[1] + 5], [o.at[0] + 22, FLOOR], C.kit, 5)],
    box: (j, o) => [Rc(o.x, o.y, o.w, FLOOR - o.y, 4)],
    tower: (j, o) => [L([o.x, FLOOR], [o.x, o.top || 14], C.kit, 7)],
    pad: (j, o) => [L(o.a, o.b, C.kit, 10)],
    wheel: (j, o) => [],
  };

  /* ================================================================ the movements */
  // frames: [start, finish] poses; at: per-frame or shared settle; go/back: arrow labels; joint: which joint the arrow follows
  const S = (o) => Object.assign({ hip: [160, 106], t: 90, ankle: [162, 196], kb: 1, floor: true }, o);
  const PATTERNS = {
    bench_press: { label: "flat press", kit: "barbell", go: "lower", back: "press up", joint: "grip", over: true,
      start: "Lie on the bench with your feet flat and your arms straight over your shoulders.", end: "Lower the weight to your mid-chest, then press it back up.",
      props: j => PROPS.bench(j, {}),
      frames: [{ hip: [196, 138], t: 180, ankle: [234, 196], kb: 1, hand: [146, 78], eb: 1 }, { hip: [196, 138], t: 180, ankle: [234, 196], kb: 1, hand: [158, 122], eb: -1 }] },
    incline_press: { label: "incline press", kit: "barbell", go: "lower", back: "press up", joint: "grip", over: true,
      start: "Sit back on the incline bench with your arms straight over your upper chest.", end: "Lower the weight to your upper chest, then press it back up.",
      props: j => PROPS.angled(j, {}),
      frames: [{ hip: [196, 150], t: 145, ankle: [238, 196], kb: 1, hand: [158, 62], eb: 1 }, { hip: [196, 150], t: 145, ankle: [238, 196], kb: 1, hand: [160, 108], eb: -1 }] },
    decline_press: { label: "decline press", kit: "barbell", go: "lower", back: "press up", joint: "grip", over: true,
      start: "Lie on the decline bench, legs hooked, arms straight over your chest.", end: "Lower the weight to your lower chest, then press it back up.",
      props: j => PROPS.angled(j, { flip: false, seat: false }).concat([O([j.ankle[0] + 6, j.ankle[1] + 10], 7, C.kitFill, C.kit, 2), L([j.ankle[0] + 6, j.ankle[1] + 16], [j.ankle[0] + 6, FLOOR], C.kit, 6)]),
      frames: [{ hip: [184, 128], t: 200, ankle: [236, 168], kb: 1, hand: [134, 84], eb: 1 }, { hip: [184, 128], t: 200, ankle: [236, 168], kb: 1, hand: [146, 132], eb: -1 }] },
    machine_chest_press: { label: "seated chest press", kit: "machine", go: "push", back: "back", joint: "grip",
      start: "Sit tall with your back on the pad and the handles beside your chest.", end: "Press the handles straight out, then let them come back slowly.",
      props: j => PROPS.seat(j, { back: true, lean: 10 }), cable: null,
      frames: [S({ hip: [128, 150], t: 98, ankle: [176, 196], hand: [146, 102], eb: -1, floor: false }), S({ hip: [128, 150], t: 98, ankle: [176, 196], hand: [180, 100], eb: 1, floor: false })] },
    fly_lying: { label: "lying fly (seen from above)", view: "front", kit: "dumbbell", go: "bring together", back: "open wide", joint: "hand", floor: false,
      start: "Lie on the bench, arms out wide with a soft bend in the elbows.", end: "Bring the weights together over your chest in a wide arc, then open again.",
      props: j => [Rc(j.pel[0] - 15, j.head[1] - 16, 30, j.pel[1] - j.head[1] + 30, 6)],
      frames: [{ pel: [160, 146], ua: -6, fa: 0, th: -88 }, { pel: [160, 146], hand: [168, 100], eb: -1, uaS: 0.55, faS: 0.55, th: -88 }] },
    cable_fly: { label: "standing cable fly", view: "front", kit: "cable", go: "bring together", back: "open wide", joint: "hand",
      start: "Stand between the pulleys, arms out wide and a little up.", end: "Bring your hands together in front of you, then let them open slowly.",
      props: () => [L([292, FLOOR], [292, 16], C.kit, 7), L([28, FLOOR], [28, 16], C.kit, 7)], cable: () => [[290, 24], [30, 24]],
      frames: [{ pel: [160, 110], hand: [232, 62], eb: 1, floor: true }, { pel: [160, 110], hand: [170, 122], eb: -1, floor: true }] },
    pec_deck: { label: "seated machine fly", view: "front", kit: "machine", go: "together", back: "open", joint: "hand",
      start: "Sit tall with your forearms or hands on the handles, arms open.", end: "Squeeze the handles together in front of your chest, then open slowly.",
      props: j => [Rc(j.pel[0] - 20, j.pel[1] + 4, 40, 9), L([j.pel[0], j.pel[1] + 12], [j.pel[0], FLOOR], C.kit, 6), Rc(j.pel[0] - 15, j.neck[1] - 4, 30, j.pel[1] - j.neck[1] + 6, 5)],
      frames: [{ pel: [160, 140], ua: 0, fa: 90, thS: 0.45, th: -60, sh: -90, floor: true }, { pel: [160, 140], ua: 185, fa: 90, uaS: 0.35, thS: 0.45, th: -60, sh: -90, floor: true }] },
    push_up: { label: "push-up", kit: "none", go: "lower", back: "push up", joint: "shoulder",
      start: "Hands under your shoulders, body straight from head to heels.", end: "Lower your chest towards the floor, then push back up.",
      frames: [{ hip: [176, 156], t: 21, th: 200, sh: 200, ft: -75, hand: [234, 196], eb: 1, floor: true, on: ["hand", "toe"] },
        { hip: [188, 184], t: 8, th: 190, sh: 190, ft: -70, hand: [234, 196], eb: -1, floor: true, on: ["hand", "toe"] }] },
    dip: { label: "dip", kit: "none", go: "lower", back: "push up", joint: "shoulder", floor: false,
      start: "Hold yourself up on straight arms, chest a little forward.", end: "Bend your elbows to lower until your upper arms are about level, then push up.",
      props: () => PROPS.bars(null, { at: [170, 118] }),
      frames: [{ hip: [158, 112], t: 82, th: -100, sh: -150, hand: [170, 118], eb: 1 }, { hip: [160, 140], t: 76, th: -100, sh: -150, hand: [170, 118], eb: -1 }] },
    bench_dip: { label: "bench dip", kit: "none", go: "lower", back: "push up", joint: "hip",
      start: "Hands on the bench edge behind you, legs out in front, arms straight.", end: "Bend your elbows to lower your hips, then push back up.",
      props: () => PROPS.lowBench(null, { x1: 40, x2: 122, y: 140 }),
      frames: [S({ hip: [140, 134], t: 112, ankle: [252, 196], kb: 1, hand: [116, 140], eb: 1 }), S({ hip: [142, 166], t: 106, ankle: [252, 196], kb: 1, hand: [116, 140], eb: 1 })] },
    overhead_press: { label: "standing overhead press", kit: "barbell", go: "press up", back: "lower", joint: "grip",
      start: "Stand tall with the weight at your shoulders, elbows a little in front.", end: "Press it straight up over your head, then lower it to your shoulders.",
      frames: [S({ hand: [172, 52], eb: 1 }), S({ hand: [164, -6], eb: 1 })] },
    overhead_press_seated: { label: "seated overhead press", kit: "dumbbell", go: "press up", back: "lower", joint: "grip",
      start: "Sit tall against the pad with the weights at your shoulders.", end: "Press them up over your head, then lower to your shoulders.",
      props: j => PROPS.seat(j, { back: true, lean: 4 }),
      frames: [S({ hip: [150, 150], t: 92, ankle: [198, 196], hand: [162, 96], eb: 1, floor: false }), S({ hip: [150, 150], t: 92, ankle: [198, 196], hand: [154, 38], eb: 1, floor: false })] },
    front_raise: { label: "front raise", kit: "dumbbell", go: "raise", back: "lower", joint: "grip",
      start: "Stand tall with the weights in front of your thighs.", end: "Raise them in front of you to shoulder height, then lower slowly.",
      frames: [S({ ua: -84, fa: -82 }), S({ ua: 2, fa: 4 })] },
    lateral_raise: { label: "lateral raise", view: "front", kit: "dumbbell", go: "raise", back: "lower", joint: "hand",
      start: "Stand tall, weights at your sides, a soft bend in the elbows.", end: "Raise your arms out to the sides to shoulder height, then lower slowly.",
      frames: [{ ua: -78, fa: -82, floor: true }, { ua: 2, fa: -6, floor: true }] },
    upright_row: { label: "upright row", view: "front", kit: "barbell", go: "pull up", back: "lower", joint: "hand",
      start: "Stand tall, the weight in front of your thighs, hands about shoulder-width.", end: "Pull it up along your body to chest height, elbows high, then lower.",
      frames: [{ hand: [172, 118], eb: -1, floor: true }, { ua: 16, fa: 206, floor: true }] },
    shrug: { label: "shrug", view: "front", kit: "dumbbell", go: "shrug up", back: "lower", joint: "shoulder",
      start: "Stand tall with the weights hanging at your sides.", end: "Lift your shoulders straight up towards your ears, hold, then lower.",
      frames: [{ ua: -88, fa: -90, floor: true }, { ua: -88, fa: -90, lift: 9, floor: true }] },
    reverse_fly: { label: "reverse fly", view: "front", kit: "dumbbell", go: "open wide", back: "back in", joint: "hand",
      start: "Arms out in front of you, a soft bend in the elbows (bent over or on a machine).", end: "Open your arms out wide, squeezing your shoulder blades, then come back.",
      kitPose: { dumbbell: [{ bow: 1, ua: -86, fa: -88, hand: null, uaS: 1, faS: 1 }, { bow: 1, ua: 2, fa: -8, hand: null }], none: [{ bow: 1, ua: -86, fa: -88, hand: null, uaS: 1, faS: 1 }, { bow: 1, ua: 2, fa: -8, hand: null }] },   // 3.12.0: bent over, seen from the front
      frames: [{ hand: [168, 110], eb: -1, uaS: 0.6, faS: 0.6, floor: true }, { ua: 0, fa: -4, floor: true }] },
    curl: { label: "curl", kit: "dumbbell", go: "curl up", back: "lower", joint: "grip",
      start: "Stand tall, arms straight down, elbows at your sides.", end: "Curl the weight up to your shoulders without moving your elbows, then lower.",
      frames: [S({ ua: -92, fa: -88 }), S({ ua: -84, fa: 88 })] },
    preacher_curl: { label: "preacher curl", kit: "barbell", go: "curl up", back: "lower", joint: "grip",
      start: "Sit with the backs of your arms flat on the pad, arms nearly straight.", end: "Curl the weight up, then lower it slowly until your arms are nearly straight.",
      props: j => PROPS.seat(j, {}).concat([L([j.shoulder[0] + 6, j.shoulder[1] + 16], [j.shoulder[0] + 34, j.shoulder[1] + 44], C.kit, 12), L([j.shoulder[0] + 18, j.shoulder[1] + 36], [j.shoulder[0] + 18, FLOOR], C.kit, 6)]),
      frames: [S({ hip: [138, 150], t: 80, ankle: [186, 196], ua: -46, fa: -36, floor: false }), S({ hip: [138, 150], t: 80, ankle: [186, 196], ua: -46, fa: 98, floor: false })] },
    pushdown: { label: "triceps pushdown", kit: "cable", go: "push down", back: "up", joint: "grip",
      start: "Stand close to the cable, elbows at your sides, forearms up.", end: "Push down until your arms are straight, then let your forearms come back up.",
      props: () => PROPS.tower(null, { x: 214 }), cable: () => [212, 18],
      frames: [S({ t: 86, ua: -94, fa: 32 }), S({ t: 86, ua: -94, fa: -88 })] },
    overhead_triceps: { label: "overhead triceps extension", kit: "dumbbell", go: "straighten", back: "bend", joint: "grip",
      start: "Hold the weight overhead, then let it lower behind your head, elbows up.", end: "Straighten your arms to lift it overhead, then lower behind your head.",
      frames: [S({ ua: 96, fa: -118 }), S({ ua: 94, fa: 92 })] },
    skull_crusher: { label: "lying triceps extension", kit: "barbell", go: "lower", back: "straighten", joint: "grip", over: true,
      start: "Lie on the bench with your arms straight up over your chest.", end: "Bend only your elbows to lower the weight towards your forehead, then straighten.",
      props: j => PROPS.bench(j, {}),
      frames: [{ hip: [196, 138], t: 180, ankle: [234, 196], kb: 1, ua: 96, fa: 92 }, { hip: [196, 138], t: 180, ankle: [234, 196], kb: 1, ua: 104, fa: 196 }] },
    kickback: { label: "triceps kickback", kit: "dumbbell", go: "straighten", back: "bend", joint: "grip",
      start: "Lean forward with a flat back, upper arm along your side, forearm hanging.", end: "Straighten your arm back, then let the forearm swing down.",
      frames: [S({ hip: [150, 112], t: 26, ankle: [168, 196], ua: 202, fa: -90 }), S({ hip: [150, 112], t: 26, ankle: [168, 196], ua: 202, fa: 196 })] },
    wrist_curl: { label: "wrist curl", kit: "dumbbell", go: "curl", back: "lower", joint: "grip",
      start: "Sit with your forearms on your thighs, wrists just past your knees.", end: "Curl the weight up with your wrists only, then lower it.",
      props: j => PROPS.seat(j, {}),
      frames: [S({ hip: [140, 150], t: 72, ankle: [188, 196], hand: [190, 136], eb: 1, wr: -60, floor: false }), S({ hip: [140, 150], t: 72, ankle: [188, 196], hand: [190, 136], eb: 1, wr: 40, floor: false })] },
    bent_row: { label: "bent-over row", kit: "barbell", go: "pull", back: "lower", joint: "grip",
      start: "Hinge forward with a flat back, knees soft, arms hanging.", end: "Pull the weight to your lower ribs, then lower it.",
      frames: [S({ hip: [146, 114], t: 32, ankle: [166, 196], ua: -92, fa: -90 }), S({ hip: [146, 114], t: 32, ankle: [166, 196], ua: 168, fa: -72 })] },
    seated_row: { label: "seated cable row", kit: "cable", go: "pull", back: "reach", joint: "grip",
      start: "Sit tall, feet on the platform, arms reaching forward.", end: "Pull the handle to your lower ribs, elbows back, then reach forward again.",
      props: () => [L([286, FLOOR], [286, 40], C.kit, 7), Rc(96, 168, 108, 9), L([150, 177], [150, FLOOR], C.kit, 6), L([246, FLOOR], [258, 166], C.kit, 7)], cable: () => [286, 150],
      frames: [{ hip: [140, 164], t: 96, ankle: [251, 182], kb: 1, ft: 70, hand: [222, 128], eb: 1 }, { hip: [140, 164], t: 96, ankle: [251, 182], kb: 1, ft: 70, hand: [170, 128], eb: 1 }] },
    inverted_row: { label: "inverted row", kit: "none", go: "pull up", back: "lower", joint: "shoulder",
      start: "Hang under the bar, body straight, heels on the floor.", end: "Pull your chest up to the bar, then lower.",
      props: (j, kit) => kit === "trx" ? [] : PROPS.bar(null, { at: [214, 78], post: true }),
      frames: [{ hip: [146, 160], t: 24, th: 204, sh: 204, ft: 60, hand: [214, 80], eb: 1, floor: true, on: ["ankle"] }, { hip: [150, 138], t: 34, th: 214, sh: 214, ft: 60, hand: [214, 80], eb: 1, floor: true, on: ["ankle"] }] },
    lat_pulldown: { label: "lat pulldown", kit: "cable", go: "pull down", back: "up", joint: "grip",
      start: "Sit under the pad, arms straight up on the bar.", end: "Pull the bar to your upper chest, elbows down, then let it rise.",
      props: j => [L([60, FLOOR], [60, 10], C.kit, 7), L([60, 12], [166, 12], C.kit, 6), Rc(118, j.hip[1] + 7, 66, 9), L([150, j.hip[1] + 16], [150, FLOOR], C.kit, 6), Rc(186, j.knee[1] - 20, 28, 9)], cable: () => [160, 16],
      frames: [{ hip: [150, 144], t: 98, ankle: [204, 196], kb: 1, hand: [158, 34], eb: 1 }, { hip: [150, 144], t: 98, ankle: [204, 196], kb: 1, hand: [160, 84], eb: 1 }] },
    pull_up: { label: "pull-up", kit: "none", go: "pull up", back: "lower", joint: "shoulder", floor: false,
      start: "Hang from the bar, arms straight.", end: "Pull until your chin is over the bar, then lower all the way.",
      props: (j, kit) => kit === "trx" ? [] : PROPS.bar(null, { at: [166, 26] }),
      frames: [{ hip: [160, 148], t: 90, th: -96, sh: -124, hand: [166, 28], eb: 1 }, { hip: [160, 88], t: 88, th: -96, sh: -124, hand: [166, 28], eb: -1 }] },
    pullover: { label: "lying pullover", kit: "dumbbell", go: "lower back", back: "pull over", joint: "grip", over: true,
      start: "Lie on the bench holding the weight over your chest, arms nearly straight.", end: "Lower it back behind your head in an arc, then pull it back over your chest.",
      props: j => PROPS.bench(j, {}),
      frames: [{ hip: [196, 138], t: 180, ankle: [234, 196], kb: 1, ua: 88, fa: 92 }, { hip: [196, 138], t: 180, ankle: [234, 196], kb: 1, ua: 168, fa: 176 }] },
    straight_arm_pulldown: { label: "straight-arm pulldown", kit: "cable", go: "pull down", back: "up", joint: "grip",
      start: "Lean forward a little, arms straight up in front on the bar.", end: "Sweep the bar down to your thighs with straight arms, then let it rise.",
      props: () => PROPS.tower(null, { x: 250 }), cable: () => [248, 20],
      frames: [S({ t: 74, ua: 34, fa: 34 }), S({ t: 74, ua: -78, fa: -78 })] },
    face_pull: { label: "face pull", kit: "cable", go: "pull", back: "reach", joint: "grip",
      start: "Stand facing the cable at face height, arms straight.", end: "Pull the rope to your face, elbows high and wide, then reach forward.",
      props: () => PROPS.tower(null, { x: 270 }), cable: () => [268, 50],
      frames: [S({ ua: 6, fa: 4 }), S({ ua: 174, fa: 24, eb: 1 })] },
    deadlift: { label: "deadlift", kit: "barbell", go: "stand up", back: "lower", joint: "hip", plate: 17,
      start: "Bar over your mid-foot, hips back, flat back, arms straight.", end: "Stand up tall with the bar, then lower it the same way.",
      frames: [S({ hip: [128, 142], t: 32, ankle: [164, 196], hand: [173, 182], eb: 1 }), S({ hand: [170, 134], eb: 1 })] },
    rdl: { label: "Romanian deadlift", kit: "barbell", go: "hips back", back: "stand up", joint: "hip",
      start: "Stand tall with the weight at your thighs, knees soft.", end: "Push your hips back with a flat back until you feel your hamstrings, then stand up.",
      frames: [S({ hand: [170, 128], eb: 1 }), S({ hip: [126, 116], t: 22, ankle: [164, 196], hand: [180, 156], eb: 1 })] },
    good_morning: { label: "good morning", kit: "barbell", go: "hips back", back: "stand up", joint: "shoulder",
      start: "Stand tall with the bar on your upper back.", end: "Push your hips back and lean forward with a flat back, then stand up.",
      frames: [S({ handOn: ['shoulder', -3, 13], eb: -1 }), S({ hip: [128, 118], t: 14, ankle: [164, 196], handOn: ['shoulder', -3, 13], eb: -1 })] },
    back_extension: { label: "back extension", kit: "none", go: "rise", back: "lower", joint: "shoulder", floor: true,
      start: "Hips on the pad, feet locked in, body bent forward.", end: "Lift your body until it is in a straight line, then lower.",
      props: j => [L([j.hip[0] - 6, j.hip[1] + 14], [j.hip[0] + 18, j.hip[1] - 10], C.kit, 12), L(j.ankle, [j.ankle[0] - 6, FLOOR], C.kit, 6), L([j.hip[0] + 4, j.hip[1] + 14], [j.hip[0] - 10, FLOOR], C.kit, 6)],
      frames: [{ hip: [170, 112], t: -42, th: 222, sh: 222, ft: 130, uaR: -165, faR: 20 }, { hip: [170, 112], t: 42, th: 222, sh: 222, ft: 130, uaR: -165, faR: 20 }] },
    hip_thrust: { label: "hip thrust", kit: "barbell", go: "hips up", back: "lower", joint: "hip",
      start: "Upper back on the bench, feet flat, the weight over your hips.", end: "Drive your hips up until your body is flat from knees to shoulders, then lower.",
      props: () => PROPS.lowBench(null, { x1: 60, x2: 124, y: 150 }),
      frames: [{ hip: [158, 176], t: 160, ankle: [222, 196], kb: 1, handOn: ['hip', 4, -12], eb: 1 }, { hip: [168, 144], t: 182, ankle: [222, 196], kb: 1, handOn: ['hip', 4, -12], eb: 1 }] },
    glute_bridge: { label: "glute bridge", kit: "none", go: "hips up", back: "lower", joint: "hip",
      start: "Lie on your back, knees bent, feet flat.", end: "Push through your heels to lift your hips, squeeze, then lower.",
      frames: [{ hip: [154, 190], t: 180, ankle: [212, 196], kb: 1, ua: 2, fa: 0 }, { hip: [152, 170], t: 200, ankle: [212, 196], kb: 1, ua: -4, fa: -4 }] },
    squat: { label: "squat", kit: "barbell", go: "sit down", back: "stand up", joint: "hip",
      start: "Stand tall, feet about shoulder-width, the bar on your upper back.", end: "Sit your hips down and back until your thighs are about level, then stand up.",
      props: (j, kit) => kit === "barbell" ? PROPS.rack(j, {}) : [], behind: true,
      frames: [S({ handOn: ['shoulder', -3, 13], eb: -1 }), S({ hip: [134, 156], t: 58, ankle: [166, 196], handOn: ['shoulder', -3, 13], eb: -1 })] },
    front_squat: { label: "front squat", kit: "barbell", go: "sit down", back: "stand up", joint: "hip",
      start: "Bar across the front of your shoulders, elbows high.", end: "Squat down with your chest up, then stand up.",
      frames: [S({ handOn: ['shoulder', 0, -15], eb: -1 }), S({ hip: [138, 158], t: 74, ankle: [166, 196], handOn: ['shoulder', 0, -15], eb: -1 })] },
    goblet_squat: { label: "goblet squat", kit: "kettlebell", go: "sit down", back: "stand up", joint: "hip",
      start: "Hold the weight at your chest, feet a little wider than your hips.", end: "Squat down between your knees with your chest up, then stand up.",
      frames: [S({ handOn: ['shoulder', -20, -18], eb: -1 }), S({ hip: [138, 158], t: 70, ankle: [166, 196], handOn: ['shoulder', -20, -18], eb: -1 })] },
    leg_press: { label: "leg press", kit: "machine", go: "push", back: "bend", joint: "ankle",
      start: "Back flat on the pad, feet on the platform, knees bent.", end: "Push the platform away until your legs are nearly straight, then bend your knees again.",
      props: j => [L([j.hip[0] - 8, j.hip[1] + 12], [j.hip[0] - 54, j.hip[1] - 44], C.kit, 10), L([j.hip[0] - 4, j.hip[1] + 14], [j.hip[0] + 6, FLOOR], C.kit, 6), L([j.ankle[0] + 22, j.ankle[1] + 30], [j.ankle[0] + 76, j.ankle[1] - 40], C.floor, 5)],
      cable: null, dyn: j => [L([j.ankle[0] + 4, j.ankle[1] + 20], [j.ankle[0] + 26, j.ankle[1] - 8], C.kit, 9)],
      frames: [{ hip: [120, 150], t: 136, ankle: [178, 124], kb: 1, ft: 60, hand: [126, 160], eb: 1 }, { hip: [120, 150], t: 136, ankle: [196, 92], kb: 1, ft: 60, hand: [126, 160], eb: 1 }] },
    lunge: { label: "lunge", kit: "dumbbell", go: "lower", back: "push up", joint: "hip",
      start: "Stand tall in a long split stance, one foot forward.", end: "Lower your back knee towards the floor, then push back up.",
      frames: [{ hip: [150, 110], t: 90, ankle: [186, 196], kb: 1, ankle2: [110, 196], kb2: 1, ft2: -40, floor: true }, { hip: [148, 142], t: 90, ankle: [190, 196], kb: 1, ankle2: [104, 196], kb2: -1, ft2: -40, floor: true }] },
    split_squat_rear: { label: "rear-foot-elevated split squat", kit: "dumbbell", go: "lower", back: "push up", joint: "hip",
      start: "Front foot forward, the top of your back foot on a bench behind you.", end: "Lower straight down until your front thigh is about level, then push up.",
      props: () => PROPS.lowBench(null, { x1: 50, x2: 112, y: 150 }),
      frames: [{ hip: [154, 112], t: 90, ankle: [190, 196], kb: 1, ankle2: [100, 146], kb2: 1, ft2: 200 }, { hip: [150, 146], t: 86, ankle: [190, 196], kb: 1, ankle2: [100, 146], kb2: 1, ft2: 200 }] },
    step_up: { label: "step-up", kit: "dumbbell", go: "step up", back: "step down", joint: "hip",
      start: "One foot on the box, the other on the floor.", end: "Stand up onto the box through the top foot, then step down.",
      props: () => PROPS.box(null, { x: 160, y: 150, w: 80 }),
      frames: [{ hip: [150, 110], t: 88, ankle: [186, 146], kb: 1, ft: 0, ankle2: [124, 196], kb2: 1 }, { hip: [182, 62], t: 90, ankle: [184, 146], kb: 1, ft: 0, ankle2: [168, 126], kb2: 1, ft2: -20 }] },
    leg_extension: { label: "leg extension", kit: "machine", go: "straighten", back: "lower", joint: "ankle",
      start: "Sit back with the pad on your lower shins, knees bent.", end: "Straighten your legs, then lower slowly.",
      props: j => PROPS.seat(j, { back: true, lean: 6 }), dyn: j => [O([j.ankle[0] + 2, j.ankle[1] - 6], 7, C.kitFill, C.kit, 2)],
      frames: [{ hip: [140, 142], t: 96, th: -2, sh: -92, hand: [150, 150], eb: 1 }, { hip: [140, 142], t: 96, th: 2, sh: 6, hand: [150, 150], eb: 1 }] },
    leg_curl: { label: "lying leg curl", kit: "machine", go: "curl", back: "lower", joint: "ankle",
      start: "Lie face down, the pad just above your heels, legs straight.", end: "Curl your heels towards your hips, then lower slowly.",
      props: j => [Rc(j.knee[0] - 6, j.hip[1] + 8, j.shoulder[0] - j.knee[0] + 36, 9), L([j.knee[0] + 14, j.hip[1] + 16], [j.knee[0] + 14, FLOOR], C.kit, 6), L([j.shoulder[0] + 10, j.hip[1] + 16], [j.shoulder[0] + 10, FLOOR], C.kit, 6)],
      dyn: j => [O([j.ankle[0] + 2, j.ankle[1] - 9], 7, C.kitFill, C.kit, 2)],
      frames: [{ hip: [150, 140], t: 2, th: 180, sh: 180, ft: -90, hand: [214, 154], eb: -1 }, { hip: [150, 140], t: 2, th: 182, sh: 82, ft: 180, hand: [214, 154], eb: -1 }] },
    leg_curl_seated: { label: "seated leg curl", kit: "machine", go: "curl", back: "straighten", joint: "ankle",
      start: "Sit with the pad behind your lower legs, legs out straight.", end: "Pull your heels down and back under the seat, then straighten.",
      props: j => PROPS.seat(j, { back: true, lean: 8 }), dyn: j => [O([j.ankle[0] - 2, j.ankle[1] + 8], 7, C.kitFill, C.kit, 2)],
      frames: [{ hip: [130, 138], t: 98, th: 2, sh: -20, hand: [140, 148], eb: 1 }, { hip: [130, 138], t: 98, th: 2, sh: -112, hand: [140, 148], eb: 1 }] },
    calf_raise: { label: "calf raise", kit: "none", go: "rise", back: "lower", joint: "ankle",
      start: "Balls of your feet on the edge of a step, heels down.", end: "Rise as high as you can onto your toes, then lower your heels below the step.",
      props: () => PROPS.box(null, { x: 150, y: 186, w: 60 }),
      frames: [S({ hip: [154, 92], ankle: [156, 182], ft: 16, floor: false }), S({ hip: [160, 76], ankle: [162, 166], ft: -50, floor: false })] },
    swing: { label: "kettlebell swing", kit: "kettlebell", go: "hips forward", back: "hike back", joint: "grip",
      start: "Hinge with the bell between your legs, flat back.", end: "Snap your hips forward to swing the bell to chest height, then let it swing back.",
      frames: [S({ hip: [136, 122], t: 32, ankle: [164, 196], hand: [150, 160], eb: 1 }), S({ hand: [214, 62], eb: 1 })] },
    clean: { label: "clean", kit: "barbell", go: "pull and catch", back: "lower", joint: "grip",
      start: "Set up like a deadlift, bar over your mid-foot.", end: "Pull hard, catch the bar on the front of your shoulders, stand tall.",
      frames: [S({ hip: [128, 146], t: 36, ankle: [164, 196], hand: [173, 180], eb: 1 }), S({ handOn: ['shoulder', 0, -15], eb: -1 })] },
    snatch: { label: "snatch", kit: "barbell", go: "pull overhead", back: "lower", joint: "grip",
      start: "Wide grip, set up like a deadlift.", end: "Pull the bar in one move to straight arms overhead, then stand tall.",
      frames: [S({ hip: [126, 150], t: 36, ankle: [164, 196], hand: [172, 178], eb: 1 }), S({ hand: [156, -6], eb: 1 })] },
    thruster: { label: "thruster", kit: "barbell", go: "stand and press", back: "squat", joint: "grip",
      start: "Front squat down with the weight at your shoulders.", end: "Stand up and press it overhead in one move.",
      frames: [S({ hip: [138, 158], t: 74, ankle: [166, 196], handOn: ['shoulder', 0, -15], eb: -1 }), S({ hand: [164, -6], eb: 1 })] },
    jump: { label: "jump", kit: "none", go: "jump", back: "land soft", joint: "hip",
      start: "Feet hip-width, sit back into a quarter squat, arms back.", end: "Jump up explosively, then land softly with bent knees.",
      frames: [S({ hip: [140, 150], t: 66, ankle: [164, 196], ua: -120, fa: -110 }), { hip: [162, 74], t: 90, th: -88, sh: -96, ft: -30, ua: 100, fa: 96 }] },
    crunch: { label: "crunch", kit: "none", go: "curl up", back: "lower", joint: "shoulder",
      start: "Lie on your back, knees bent, hands by your head.", end: "Curl your shoulders off the floor, then lower slowly.",
      frames: [{ hip: [160, 190], t: 180, ankle: [214, 196], kb: 1, uaR: 30, faR: 172, floor: true, on: ["hip", "ankle"] }, { hip: [160, 190], t: 148, ankle: [214, 196], kb: 1, uaR: 30, faR: 172, floor: true, on: ["hip", "ankle"] }] },
    sit_up: { label: "sit-up", kit: "none", go: "sit up", back: "lower", joint: "shoulder",
      start: "Lie on your back, knees bent, feet flat.", end: "Sit all the way up, then lower with control.",
      frames: [{ hip: [160, 190], t: 180, ankle: [214, 196], kb: 1, uaR: -175, faR: 182, floor: true, on: ["hip", "ankle"] }, { hip: [160, 190], t: 74, ankle: [214, 196], kb: 1, ua: -10, fa: 0, floor: true, on: ["hip", "ankle"] }] },
    leg_raise: { label: "lying leg raise", kit: "none", go: "legs up", back: "lower", joint: "ankle",
      start: "Lie on your back, legs straight, arms by your sides.", end: "Lift your straight legs to vertical, then lower them slowly without touching the floor.",
      frames: [{ hip: [170, 190], t: 180, th: 4, sh: 4, ft: 80, ua: 2, fa: 0, floor: true, on: ["hip"] }, { hip: [170, 190], t: 180, th: 86, sh: 86, ft: 0, ua: 2, fa: 0, floor: true, on: ["hip"] }] },
    hanging_leg_raise: { label: "hanging leg raise", kit: "none", go: "legs up", back: "lower", joint: "ankle", floor: false,
      start: "Hang from the bar with straight arms.", end: "Raise your legs to hip height or higher, then lower without swinging.",
      props: () => PROPS.bar(null, { at: [166, 26] }),
      frames: [{ hip: [162, 146], t: 92, th: -90, sh: -92, ft: -30, hand: [166, 28], eb: 1 }, { hip: [160, 146], t: 96, th: 4, sh: 4, ft: 60, hand: [166, 28], eb: 1 }] },
    plank: { label: "plank", kit: "none", hold: true, joint: "hip",
      start: "Forearms on the floor under your shoulders, body straight from head to heels.", end: "Hold it: squeeze your glutes and brace your stomach.",
      frames: [{ hip: [160, 168], t: 12, th: 191, sh: 191, ft: -75, ua: -92, fa: 2, floor: true, on: ["elbow", "toe"] }] },
    side_plank: { label: "side plank", view: "front", kit: "none", kits: "none", hold: true, joint: "hip",
      start: "On your side, forearm under your shoulder, feet stacked.", end: "Lift your hips so your body is straight, and hold.",
      frames: [{ pel: [160, 150], rot: 68, ua: -22, fa: -22, uaL: 158, faL: 158, th: -90, sh: -90, thL: -90, shL: -90, floor: true, on: ["haR", "anR"] }] },
    mountain_climber: { label: "mountain climber", kit: "none", kits: "none", go: "knee in", back: "back", joint: "knee",
      start: "High plank, hands under your shoulders.", end: "Drive one knee towards your chest, then switch legs quickly.",
      frames: [{ hip: [176, 156], t: 21, th: 200, sh: 200, ft: -75, hand: [234, 196], eb: 1, floor: true, on: ["hand", "toe"] }, { hip: [176, 156], t: 21, th: -42, sh: -150, ft: -60, th2: 200, sh2: 200, ft2: -75, hand: [234, 196], eb: 1, floor: true, on: ["hand", "toe2"] }] },
    russian_twist: { label: "Russian twist", view: "front", kit: "none", go: "twist", back: "other side", joint: "hand",
      start: "Sit leaning back a little, feet down or lifted, hands together.", end: "Turn your shoulders to bring your hands beside one hip, then the other.",
      frames: [{ pel: [160, 180], tS: 0.85, tl: -12, th: 52, sh: -72, thS: 0.8, shS: 0.85, hand: [212, 156], handL: [204, 146], eb: 1, ebL: 1, floor: true }, { pel: [160, 180], tS: 0.85, tl: 12, th: 52, sh: -72, thS: 0.8, shS: 0.85, hand: [116, 146], handL: [108, 156], eb: -1, ebL: -1, floor: true }] },
    ab_wheel: { label: "ab wheel rollout", kit: "none", go: "roll out", back: "roll back", joint: "grip",
      start: "Kneel with the wheel under your shoulders, arms straight.", end: "Roll forward as far as you can keep your back flat, then roll back.",
      dyn: j => [O([j.hand[0], j.hand[1] + 6], 9, C.plateFill, C.plate, 3)],
      frames: [{ hip: [120, 146], t: 52, th: -88, sh: 180, ft: 180, hand: [168, 182], eb: 1, floor: true, on: ["knee"] }, { hip: [124, 176], t: 8, th: -150, sh: 180, ft: 180, hand: [236, 182], eb: 1, floor: true, on: ["knee"] }] },
    cable_crunch: { label: "kneeling cable crunch", kit: "cable", go: "crunch", back: "up", joint: "shoulder",
      start: "Kneel facing the cable, rope by your head.", end: "Curl your chest towards your knees, then come back up.",
      props: () => PROPS.tower(null, { x: 236 }), cable: () => [234, 16],
      frames: [{ hip: [150, 144], t: 76, th: -86, sh: 180, ft: 180, uaR: 40, faR: 150, floor: true, on: ["knee"] }, { hip: [150, 144], t: 20, th: -86, sh: 180, ft: 180, uaR: 40, faR: 150, floor: true, on: ["knee"] }] },
    v_up: { label: "V-up", kit: "none", go: "fold up", back: "lower", joint: "hand",
      start: "Lie flat, arms overhead, legs straight.", end: "Lift your arms and legs together to touch over your hips, then lower.",
      frames: [{ hip: [170, 190], t: 180, th: 2, sh: 2, ft: 80, ua: 182, fa: 182, floor: true, on: ["hip"] }, { hip: [170, 190], t: 128, th: 52, sh: 52, ft: -10, ua: 60, fa: 60, floor: true, on: ["hip"] }] },
    superman: { label: "superman", kit: "none", go: "lift", back: "lower", joint: "hand",
      start: "Lie face down, arms straight out in front.", end: "Lift your arms, chest and legs off the floor, hold, then lower.",
      frames: [{ hip: [150, 190], t: 0, th: 180, sh: 180, ft: -90, ua: 2, fa: 2, floor: true, on: ["hip"] }, { hip: [150, 190], t: 14, th: 168, sh: 168, ft: -90, ua: 22, fa: 22, floor: true, on: ["hip"] }] },
    bird_dog: { label: "bird dog", kit: "none", kits: "none", go: "reach", back: "back", joint: "hand",
      start: "On hands and knees, back flat.", end: "Reach one arm forward and the opposite leg back, hold, then switch.",
      frames: [{ hip: [130, 140], t: 2, th: -90, sh: 180, ft: 180, ua: -90, fa: -90, floor: true, on: ["knee", "hand"] }, { hip: [130, 140], t: 2, th: 180, sh: 180, ft: 180, th2: -90, sh2: 180, ft2: 180, ua: 4, fa: 4, ua2: -90, fa2: -90, floor: true, on: ["knee2", "hand2"] }] },
    dead_bug: { label: "dead bug", kit: "none", kits: "none", go: "reach out", back: "back", joint: "hand",
      start: "On your back, arms up, knees bent over your hips.", end: "Lower one arm back and the opposite leg out, then switch.",
      frames: [{ hip: [170, 190], t: 180, th: 90, sh: 0, ft: 90, ua: 90, fa: 90, floor: true, on: ["hip"] }, { hip: [170, 190], t: 180, th: 10, sh: 6, ft: 90, th2: 90, sh2: 0, ft2: 90, ua: 172, fa: 176, ua2: 90, fa2: 90, floor: true, on: ["hip"] }] },
    side_bend: { label: "side bend", view: "front", kit: "dumbbell", go: "bend", back: "up", joint: "hand", both: false,
      start: "Stand tall, a weight in one hand at your side.", end: "Bend sideways towards the weight, then come back up straight.",
      frames: [{ ua: -86, fa: -88, uaL: 236, faL: 318, floor: true }, { tl: 16, ua: -100, fa: -100, uaL: 236, faL: 318, floor: true }] },   // 3.12.0: the free hand on the hip
    woodchop: { label: "woodchop", view: "front", kit: "cable", go: "chop", back: "back up", joint: "hand",
      start: "Stand side-on to the cable, arms straight up to one side.", end: "Pull across your body down to the other hip, turning your shoulders.",
      props: () => [L([292, FLOOR], [292, 16], C.kit, 7)], cable: () => [290, 24],
      frames: [{ hand: [230, 56], handL: [222, 64], eb: 1, ebL: 1, floor: true }, { tl: -8, hand: [110, 140], handL: [104, 132], eb: 1, ebL: 1, floor: true }] },
    carry: { label: "loaded carry", kit: "dumbbell", go: "walk", back: "", joint: "hip",
      start: "Pick up the weights, stand tall, shoulders back.", end: "Walk with short, steady steps without leaning.",
      frames: [{ hip: [150, 110], t: 90, ankle: [176, 196], kb: 1, ankle2: [126, 196], kb2: 1, ft2: -20, floor: true }, { hip: [176, 110], t: 90, ankle: [210, 196], kb: 1, ankle2: [154, 196], kb2: 1, ft2: -20, floor: true }] },
    hip_extension: { label: "standing hip extension", kit: "cable", from: "ankle", go: "leg back", back: "forward", joint: "ankle",
      start: "Stand tall holding on for balance, the cuff or pad at the working ankle.", end: "Push the leg straight back without arching your back, then bring it forward.",
      cable: j => [j.ankle[0] + 70, FLOOR - 8],
      frames: [S({ ankle2: [158, 196], hand: [196, 92], eb: 1 }), S({ th: -122, sh: -126, ankle: null, ankle2: [158, 196], hand: [196, 92], eb: 1, on: ["ankle2"] })] },
    hip_abduction: { label: "standing hip abduction", view: "front", kit: "cable", from: "ankle", go: "leg out", back: "back in", joint: "ankle",
      start: "Stand tall side-on to the cable, the cuff on the outside ankle.", end: "Lift the leg out to the side, then bring it back slowly.",
      cable: j => [j.pel[0] - 110, FLOOR - 8],
      frames: [{ th: -88, sh: -88, thL: -92, shL: -92, floor: true, on: ["anL"] }, { th: -50, sh: -50, thL: -92, shL: -92, floor: true, on: ["anL"] }] },
    hip_abduction_seated: { label: "seated hip abduction", view: "front", kit: "machine", go: "knees out", back: "back in", joint: "knee",
      start: "Sit tall with the pads on the outside of your knees.", end: "Push your knees apart, then let them come back slowly.",
      props: j => [Rc(j.pel[0] - 22, j.pel[1] + 4, 44, 9), L([j.pel[0], j.pel[1] + 12], [j.pel[0], FLOOR], C.kit, 6), Rc(j.pel[0] - 15, j.neck[1] - 4, 30, j.pel[1] - j.neck[1] + 6, 5)],
      dyn: j => [Rc(j.knR[0] - 2, j.knR[1] - 10, 8, 20, 3), Rc(j.knL[0] - 6, j.knL[1] - 10, 8, 20, 3)],
      frames: [{ pel: [160, 140], ua: -70, fa: -80, thS: 0.5, th: -78, sh: -92, floor: true }, { pel: [160, 140], ua: -70, fa: -80, thS: 0.5, th: -20, sh: -90, floor: true }] },
    hip_adduction_seated: { label: "seated hip adduction", view: "front", kit: "machine", go: "knees in", back: "apart", joint: "knee",
      start: "Sit tall with the pads on the inside of your knees, legs apart.", end: "Squeeze your knees together, then let them open slowly.",
      props: j => [Rc(j.pel[0] - 22, j.pel[1] + 4, 44, 9), L([j.pel[0], j.pel[1] + 12], [j.pel[0], FLOOR], C.kit, 6), Rc(j.pel[0] - 15, j.neck[1] - 4, 30, j.pel[1] - j.neck[1] + 6, 5)],
      dyn: j => [Rc(j.knR[0] - 6, j.knR[1] - 10, 8, 20, 3), Rc(j.knL[0] - 2, j.knL[1] - 10, 8, 20, 3)],
      frames: [{ pel: [160, 140], ua: -70, fa: -80, thS: 0.5, th: -20, sh: -90, floor: true }, { pel: [160, 140], ua: -70, fa: -80, thS: 0.5, th: -78, sh: -92, floor: true }] },
    slam: { label: "ball slam", kit: "ball", go: "slam down", back: "pick up", joint: "grip",
      start: "Stand tall with the ball held overhead.", end: "Slam it into the floor in front of you, bending your hips and knees, then pick it up.",
      frames: [S({ hand: [160, -4], eb: 1 }), S({ hip: [136, 140], t: 40, ankle: [166, 196], hand: [196, 182], eb: 1 })] },
    run: { label: "running", kit: "none", kits: "none", go: "", back: "", joint: "hip", hold: true,
      start: "Run tall, land under your hips, arms swinging.", end: "Keep a steady pace you can breathe through.",
      frames: [{ hip: [160, 104], t: 84, th: -50, sh: -120, ft: 0, th2: -120, sh2: -170, ft2: -80, ua: -130, fa: -40, ua2: -50, fa2: 40, floor: true, on: ["ankle"] }] },
    walk: { label: "walking", kit: "none", kits: "none", go: "", back: "", joint: "hip", hold: true,
      start: "Walk tall at a pace you can keep.", end: "Swing your arms and keep your steps even.",
      frames: [{ hip: [160, 108], t: 90, ankle: [186, 196], kb: 1, ankle2: [136, 196], kb2: 1, ft2: -20, ua: -110, fa: -100, ua2: -70, fa2: -60, floor: true }] },
    cycle: { label: "cycling", kit: "none", kits: "none", hold: true, joint: "hip",
      start: "Set the seat so your knee is only slightly bent at the bottom.", end: "Pedal at a steady pace.",
      props: j => [O([j.hip[0] + 30, 176], 20, "none", C.kit, 4), L([j.hip[0] - 4, j.hip[1] + 10], [j.hip[0] + 30, 176], C.kit, 6), L([j.hip[0] + 30, 176], [j.hip[0] + 62, 120], C.kit, 6), L([j.hip[0] - 14, j.hip[1] + 10], [j.hip[0] + 8, j.hip[1] + 10], C.kit, 8), L([j.hip[0] + 30, 196], [j.hip[0] + 30, FLOOR], C.kit, 6)],
      frames: [{ hip: [130, 112], t: 64, ankle: [176, 186], kb: 1, ft: 0, ankle2: [154, 158], kb2: 1, hand: [192, 124], eb: 1, floor: false }] },
    rower: { label: "rowing machine", kit: "none", kits: "none", go: "drive", back: "recover", joint: "hip",
      start: "Knees bent, shins vertical, arms reaching to the handle.", end: "Push with your legs, lean back a little, pull the handle to your ribs.",
      props: () => [L([40, 194], [290, 194], C.kit, 6), Rc(266, 150, 24, 44, 5)], cable: () => [266, 168],
      dyn: j => [Rc(j.hip[0] - 16, j.hip[1] + 8, 32, 8, 3)],
      frames: [{ hip: [150, 176], t: 74, ankle: [250, 186], kb: 1, ft: 70, hand: [242, 160], eb: 1 }, { hip: [92, 176], t: 106, ankle: [250, 186], kb: 1, ft: 70, hand: [110, 150], eb: 1 }] },
    jump_rope: { label: "jump rope", view: "front", kit: "none", kits: "none", go: "", back: "", joint: "hip", hold: true,
      start: "Elbows close, small turns from the wrists.", end: "Small, quick hops on the balls of your feet.",
      props: j => [{ k: "path", d: `M${j.haL[0]} ${j.haL[1]} Q${j.pel[0]} ${FLOOR + 30} ${j.haR[0]} ${j.haR[1]}`, c: C.cable, w: 2 }],
      frames: [{ pel: [160, 100], ua: -60, fa: -10, th: -88, sh: -92, floor: false }] },
    stretch: { label: "stretch", kit: "none", kits: "none", hold: true, joint: "hip",
      start: "Move into the stretch slowly until you feel it.", end: "Hold it and breathe; don't bounce.",
      frames: [{ hip: [160, 110], t: 90, ankle: [186, 196], kb: 1, ankle2: [124, 196], kb2: -1, ua: 92, fa: 92, floor: true }] },
  };

  /* ================================================================ 3.9.0: more movements, and better ones for PulseTrack's own exercises */
  const BACKBAR = { handOn: ["shoulder", -3, 13], eb: -1 }, HANG = { handOn: null, hand: null, ua: -92, fa: -90 };
  const wall = x => [L([x, FLOOR], [x, 8], C.kit, 6)];
  const floorBench = (x1, x2, y) => PROPS.lowBench(null, { x1, x2, y });
  Object.assign(PATTERNS, {
    // ---- pushing
    fly_lying: { label: "lying fly", kit: "dumbbell", go: "bring up", back: "open wide", joint: "grip", over: true, kits: ["dumbbell", "cable", "band", "kettlebell", "plate"],
      start: "Lie on the bench, arms out wide with a soft bend in the elbows.", end: "Bring the weights up over your chest in a wide arc, then lower them out wide again.",
      props: j => PROPS.bench(j, {}), cable: j => [j.shoulder[0] + 10, FLOOR - 8],
      frames: [{ hip: [196, 138], t: 180, ankle: [234, 196], kb: 1, hand: [150, 152], eb: -1 }, { hip: [196, 138], t: 180, ankle: [234, 196], kb: 1, hand: [144, 80], eb: -1 }] },
    fly_incline: { label: "incline fly", kit: "dumbbell", go: "bring up", back: "open wide", joint: "grip", over: true, kits: ["dumbbell", "cable", "band", "kettlebell"],
      start: "Sit back on the incline bench, arms out wide with a soft bend in the elbows.", end: "Bring the weights up over your upper chest in an arc, then lower out wide.",
      props: j => PROPS.angled(j, {}), cable: j => [j.shoulder[0] + 10, FLOOR - 8],
      frames: [{ hip: [196, 150], t: 145, ankle: [238, 196], kb: 1, hand: [164, 140], eb: -1 }, { hip: [196, 150], t: 145, ankle: [238, 196], kb: 1, hand: [158, 62], eb: -1 }] },
    floor_press: { label: "floor press", kit: "barbell", go: "lower", back: "press up", joint: "grip", over: true,
      start: "Lie on the floor, knees bent, the weight over your chest on straight arms.", end: "Lower until your upper arms touch the floor, then press back up.",
      frames: [{ hip: [190, 189], t: 180, ankle: [236, 196], kb: 1, hand: [140, 128], eb: -1 }, { hip: [190, 189], t: 180, ankle: [236, 196], kb: 1, hand: [152, 160], eb: -1 }] },
    standing_press: { label: "standing press out", kit: "plate", go: "press out", back: "back in", joint: "grip", kits: ["plate", "cable", "band", "dumbbell", "ball", "kettlebell"],
      start: "Stand tall, one foot a little ahead, hands at your chest.", end: "Press your hands straight out in front, squeeze, then bring them back.",
      cable: j => [j.hip[0] - 110, j.shoulder[1] + 6],
      frames: [S({ hip: [150, 108], ankle: [176, 196], ankle2: [128, 196], kb2: 1, ft2: -20, hand: [178, 72], eb: 1 }), S({ hip: [150, 108], ankle: [176, 196], ankle2: [128, 196], kb2: 1, ft2: -20, hand: [212, 66], eb: 1 })] },
    pallof: { label: "Pallof press", view: "front", kit: "cable", go: "press out", back: "in", joint: "hand", kits: ["cable", "band"],
      start: "Stand side-on to the cable, handle at the middle of your chest.", end: "Press it straight out in front without letting it turn you, then bring it back.",
      props: () => [L([300, FLOOR], [300, 30], C.kit, 7)], cable: j => [300, j.haR[1]],
      frames: [{ hand: [166, 80], handL: [156, 80], eb: -1, ebL: 1, floor: true }, { hand: [166, 86], handL: [156, 86], eb: -1, ebL: 1, uaS: 0.5, faS: 0.5, floor: true }] },
    push_up_incline: { label: "incline push-up", kit: "none", kits: "none", go: "lower", back: "push up", joint: "shoulder",
      start: "Hands on the bench edge, body straight from head to heels.", end: "Lower your chest to the bench, then push back up.",
      props: () => floorBench(214, 290, 151),
      frames: [{ hip: [186.8, 124.4], t: 44, th: 224, sh: 224, ft: -52, hand: [236, 146], eb: -1 }, { hip: [196.7, 136.7], t: 34, th: 214, sh: 214, ft: -52, hand: [236, 146], eb: -1 }] },
    push_up_decline: { label: "decline push-up", kit: "none", kits: "none", go: "lower", back: "push up", joint: "shoulder",
      start: "Feet up on the bench, hands under your shoulders, body straight.", end: "Lower your chest towards the floor, then push back up.",
      props: () => floorBench(36, 112, 118),
      frames: [{ hip: [175.8, 122], t: -15, th: 165, sh: 165, ft: -70, hand: [232, 196], eb: -1 }, { hip: [170.4, 136.9], t: -25, th: 155, sh: 155, ft: -70, hand: [232, 196], eb: -1 }] },
    push_up_knee: { label: "knee push-up", kit: "none", kits: "none", go: "lower", back: "push up", joint: "shoulder",
      start: "Knees on the floor, hands under your shoulders, straight line from knees to head.", end: "Lower your chest towards the floor, then push back up.",
      frames: [{ hip: [183.2, 166.6], t: 32, th: 212, sh: 165, ft: 180, hand: [232, 196], eb: -1 }, { hip: [188.8, 179.9], t: 14, th: 194, sh: 165, ft: 180, hand: [232, 196], eb: -1 }] },
    handstand_pushup: { label: "handstand push-up", kit: "none", kits: "none", go: "lower", back: "push up", joint: "head",
      start: "Kick up into a handstand against the wall, hands a little wider than your shoulders.", end: "Lower your head towards the floor, then press back up.",
      props: () => wall(214),
      frames: [{ hip: [192, 82], t: -90, th: 86, sh: 86, ft: 0, hand: [190, 196], eb: 1 }, { hip: [196, 112], t: -86, th: 86, sh: 86, ft: 0, hand: [190, 196], eb: 1 }] },
    pike_pushup: { label: "pike push-up", kit: "none", kits: "none", go: "lower", back: "push up", joint: "head",
      start: "Hips high in an upside-down V, hands on the floor, head between your arms.", end: "Bend your elbows to bring your head towards the floor, then push back up.",
      frames: [{ hip: [170, 112], t: -40, th: -118, sh: -118, ft: 0, hand: [230, 196], eb: 1 }, { hip: [172, 118], t: -56, th: -116, sh: -116, ft: 0, hand: [230, 196], eb: -1 }] },
    // ---- squats and legs
    air_squat: { label: "bodyweight squat", kit: "none", go: "sit down", back: "stand up", joint: "hip",
      start: "Stand tall, feet about shoulder-width, arms by your sides.", end: "Sit down and back with your arms out in front, then stand up.",
      frames: [S({ ua: -90, fa: -90 }), S({ hip: [134, 156], t: 62, ankle: [166, 196], ua: 0, fa: 0 })] },
    squat_hold: { label: "deep squat hold", kit: "none", hold: true, joint: "hip",
      start: "Sit as deep as you can, heels down, chest up, elbows inside your knees.", end: "Hold and breathe, letting your hips sink a little more each breath.",
      frames: [S({ hip: [148, 172], t: 72, ankle: [168, 196], hand: [190, 130], eb: -1 })] },
    wall_sit: { label: "wall sit", kit: "none", kits: "none", hold: true, joint: "hip",
      start: "Back flat on the wall, feet out in front.", end: "Slide down until your thighs are level and hold.",
      props: () => wall(124),
      frames: [{ hip: [134, 152], t: 92, th: 0, sh: -90, ua: -80, fa: -4, floor: true }] },
    pistol: { label: "pistol squat", kit: "none", go: "sit down", back: "stand up", joint: "hip",
      start: "Stand on one leg, the other leg straight out in front, arms forward.", end: "Squat all the way down on one leg, then stand back up.",
      frames: [S({ th2: -60, sh2: -60, ua: 0, fa: 0 }), S({ hip: [128, 166], t: 58, ankle: [162, 196], th2: 6, sh2: 6, ft2: 60, ua: 6, fa: 6 })] },
    sissy_squat: { label: "sissy squat", kit: "none", go: "lean back", back: "up", joint: "knee",
      start: "Stand tall on your toes, holding on for balance.", end: "Push your knees forward and lean back in one straight line, then come back up.",
      frames: [S({ ft: -30, ua: 0, fa: 0 }), S({ hip: [146, 136], t: 150, th: -30, sh: -123, ankle: null, ft: -40, ua: 10, fa: 10, on: ["toe"] })] },
    lateral_lunge: { label: "side lunge", view: "front", kit: "none", go: "lunge to the side", back: "push back", joint: "pel",
      start: "Stand with your feet wide, toes forward.", end: "Sit back over one leg, keeping the other straight, then push back to the middle.",
      frames: [{ pel: [160, 108], ankle: [204, 196], ankleL: [116, 196], kb: 1, kbL: -1, hand: [166, 92], handL: [154, 92], eb: -1, ebL: 1, floor: true },
        { pel: [180, 146], ankle: [214, 196], ankleL: [98, 196], kb: 1, kbL: -1, hand: [186, 120], handL: [174, 120], eb: -1, ebL: 1, floor: true }] },
    single_leg_rdl: { label: "single-leg Romanian deadlift", kit: "dumbbell", go: "hinge", back: "stand up", joint: "shoulder",
      start: "Stand on one leg, knee soft, the weight in the opposite hand.", end: "Hinge forward as the free leg goes back in a straight line, then stand up.",
      frames: [S({ hip: [154, 108], ankle: [164, 196], th2: -100, sh2: -110 }), S({ hip: [150, 112], t: 10, ankle: [164, 196], th2: 188, sh2: 188, ft2: -80, ua: -90, fa: -90 })] },
    standing_leg_curl: { label: "standing leg curl", kit: "machine", from: "ankle", go: "curl", back: "lower", joint: "ankle", kits: ["machine", "cable", "band", "none"],
      start: "Stand tall holding on, the pad behind your ankle.", end: "Curl your heel up towards your glutes, then lower slowly.",
      props: () => wall(204), dyn: j => [O([j.ankle[0] - 7, j.ankle[1] - 3], 7, C.kitFill, C.kit, 2)], cable: j => [j.ankle[0] + 70, FLOOR - 8],
      frames: [S({ ankle2: [160, 196], ankle: null, th: -92, sh: -92, hand: [198, 92], eb: 1, on: ["ankle2"] }), S({ ankle2: [160, 196], ankle: null, th: -96, sh: 158, hand: [198, 92], eb: 1, on: ["ankle2"] })] },
    nordic: { label: "Nordic curl", kit: "none", kits: "none", go: "lower", back: "pull up", joint: "shoulder",
      start: "Kneel tall with your ankles held down, body straight from knees to head.", end: "Lower forward as slowly as you can, catch yourself with your hands, then pull back up.",
      dyn: () => [], props: j => [O([j.ankle[0] + 2, j.ankle[1] - 11], 7, C.kitFill, C.kit, 2), Rc(j.knee[0] - 12, FLOOR - 7, 24, 7, 3)],
      frames: [{ hip: [120, 144], t: 90, th: -90, sh: 180, ft: 180, handOn: ["shoulder", -18, -8], eb: -1, floor: true, on: ["knee"] },
        { hip: [161.7, 170.6], t: 25, th: 205, sh: 180, ft: 180, ua: -60, fa: -50, floor: true, on: ["knee"] }] },
    reverse_nordic: { label: "reverse Nordic", kit: "none", kits: "none", go: "lean back", back: "up", joint: "shoulder",
      start: "Kneel tall, body straight from knees to head, arms out in front.", end: "Lean back as far as you control, keeping hips straight, then come back up.",
      frames: [{ hip: [150, 144], t: 90, th: -90, sh: 180, ft: 180, ua: 0, fa: 0, floor: true, on: ["knee"] },
        { hip: [120.4, 154.8], t: 130, th: -50, sh: 180, ft: 180, ua: 20, fa: 20, floor: true, on: ["knee"] }] },
    seated_calf_raise: { label: "seated calf raise", kit: "machine", go: "rise", back: "lower", joint: "knee", kits: ["machine", "dumbbell", "barbell", "plate", "none"],
      start: "Sit with the balls of your feet on the block and the pad on your knees.", end: "Push up onto your toes as high as you can, then lower your heels.",
      props: j => PROPS.seat(j, {}).concat([Rc(j.toe[0] - 14, j.toe[1] + 4, 28, FLOOR - j.toe[1] - 4, 3)]),
      dyn: j => [Rc(j.knee[0] - 14, j.knee[1] - 16, 28, 9, 3)],
      frames: [{ hip: [140, 142], t: 92, ankle: [194, 178], kb: 1, ft: 18, hand: [180, 132], eb: 1 }, { hip: [140, 142], t: 92, ankle: [190, 162], kb: 1, ft: -40, hand: [178, 118], eb: 1 }] },
    tibialis_raise: { label: "tibialis raise", kit: "none", kits: "none", go: "toes up", back: "lower", joint: "toe",
      start: "Lean your back on the wall, heels out in front.", end: "Lift your toes as high as you can, then lower them.",
      props: () => wall(132),
      frames: [{ hip: [146, 108], t: 96, ankle: [184, 192], kb: 1, ft: 0, ua: -92, fa: -92 }, { hip: [146, 108], t: 96, ankle: [184, 192], kb: 1, ft: 38, ua: -92, fa: -92 }] },
    glute_bridge_loaded: { label: "loaded glute bridge", kit: "barbell", go: "hips up", back: "lower", joint: "hip",
      start: "Lie on your back, knees bent, the weight across your hips.", end: "Drive your hips up and squeeze, then lower.",
      frames: [{ hip: [154, 188], t: 180, ankle: [212, 196], kb: 1, handOn: ["hip", 4, -14], eb: 1 }, { hip: [152, 170], t: 200, ankle: [212, 196], kb: 1, handOn: ["hip", 4, -14], eb: 1 }] },
    supine_leg_curl: { label: "slider leg curl", kit: "none", kits: "none", go: "pull heels in", back: "slide out", joint: "ankle",
      start: "On your back, hips up, heels on the sliders, legs straight.", end: "Pull your heels in towards your hips, keeping them up, then slide out.",
      frames: [{ hip: [160, 172], t: 195, ankle: [250, 192], kb: 1, ft: 80, ua: 0, fa: 0 }, { hip: [168, 160], t: 205, ankle: [214, 192], kb: 1, ft: 80, ua: 0, fa: 0 }] },
    ball_leg_curl: { label: "stability ball leg curl", kit: "none", kits: "none", go: "roll in", back: "roll out", joint: "ankle",
      start: "On your back, heels on the ball, hips lifted.", end: "Roll the ball in with your heels, then roll it out.",
      dyn: j => [O([j.ankle[0] + 2, j.ankle[1] + 14], 15, C.plateFill, C.plate, 2.5)],
      frames: [{ hip: [158, 178], t: 196, ankle: [248, 168], kb: 1, ft: 70, ua: 0, fa: 0 }, { hip: [166, 164], t: 206, ankle: [216, 168], kb: 1, ft: 70, ua: 0, fa: 0 }] },
    hip_adduction: { label: "standing hip adduction", view: "front", kit: "cable", from: "ankle", go: "leg across", back: "out", joint: "ankle",
      start: "Stand side-on to the cable, the cuff on the inside ankle, that leg out to the side.", end: "Pull the leg across in front of the other, then let it go back out slowly.",
      cable: j => [j.pel[0] + 116, FLOOR - 8],
      frames: [{ th: -58, sh: -58, thL: -92, shL: -92, floor: true, on: ["anL"] }, { th: -104, sh: -104, thL: -92, shL: -92, floor: true, on: ["anL"] }] },
    pull_through: { label: "cable pull-through", kit: "cable", go: "hips forward", back: "hips back", joint: "hip", kits: ["cable", "band"],
      start: "Face away from the low cable, rope between your legs, hips back.", end: "Drive your hips forward to stand tall, then hinge back.",
      cable: j => [j.hip[0] - 120, FLOOR - 8],
      frames: [S({ hip: [126, 120], t: 30, ankle: [164, 196], hand: [150, 166], eb: 1 }), S({ hand: [164, 132], eb: 1 })] },
    leg_swing: { label: "leg swing", kit: "none", kits: "none", go: "swing", back: "back", joint: "ankle",
      start: "Stand side-on holding a wall, on one leg.", end: "Swing the free leg forward and back, a little higher each time.",
      props: () => wall(218),
      frames: [S({ ankle2: [160, 196], ankle: null, th: -40, sh: -40, ft: 30, hand: [214, 96], eb: 1, on: ["ankle2"] }), S({ ankle2: [160, 196], ankle: null, th: -132, sh: -132, ft: -60, hand: [214, 96], eb: 1, on: ["ankle2"] })] },
    // ---- pulling
    chest_supported_row: { label: "chest-supported row", kit: "dumbbell", go: "pull", back: "lower", joint: "grip",
      start: "Lie chest-down on the incline bench, arms hanging straight.", end: "Pull your elbows back to bring the weight to your ribs, then lower.",
      props: j => PROPS.angled(j, { flip: false, seat: false }).concat([L([j.hip[0] + 10, j.hip[1] + 6], [j.hip[0] + 10, FLOOR], C.kit, 6)]),
      frames: [{ hip: [150, 124], t: 38, ankle: [96, 196], kb: 1, ua: -90, fa: -90 }, { hip: [150, 124], t: 38, ankle: [96, 196], kb: 1, ua: 170, fa: -74 }] },
    one_arm_row: { label: "one-arm row", kit: "dumbbell", go: "pull", back: "lower", joint: "grip",
      start: "One knee and hand on the bench, back flat, the weight hanging.", end: "Pull the weight to your hip, then lower it all the way.",
      props: () => floorBench(96, 214, 168),
      frames: [{ hip: [128, 124], t: 6, ankle: [154, 196], kb: 1, th2: -90, sh2: 180, ft2: 180, hand2: [194, 168], eb2: 1, ua: -90, fa: -90 },
        { hip: [128, 124], t: 6, ankle: [154, 196], kb: 1, th2: -90, sh2: 180, ft2: 180, hand2: [194, 168], eb2: 1, ua: 160, fa: -74 }] },
    renegade_row: { label: "renegade row", kit: "dumbbell", go: "row", back: "down", joint: "grip",
      start: "High plank with your hands on the dumbbells, feet wide.", end: "Row one dumbbell to your ribs without twisting, put it down, switch sides.",
      frames: [{ hip: [176, 152], t: 21, th: 200, sh: 200, ft: -75, hand: [232, 188], eb: 1, floor: true, on: ["hand", "toe"] },
        { hip: [176, 152], t: 21, th: 200, sh: 200, ft: -75, hand2: [232, 188], eb2: 1, ua: 175, fa: -70, floor: true, on: ["hand2", "toe"] }] },
    dead_hang: { label: "dead hang", kit: "none", kits: "none", hold: true, joint: "hip", floor: false,
      start: "Grab the bar and hang with straight arms, shoulders active.", end: "Hold, breathing slowly.",
      props: () => PROPS.bar(null, { at: [166, 26] }),
      frames: [{ hip: [160, 148], t: 90, th: -96, sh: -124, hand: [166, 28], eb: 1 }] },
    reverse_hyper: { label: "reverse hyperextension", kit: "none", kits: ["none", "machine", "band"], go: "legs up", back: "lower", joint: "ankle",
      start: "Lie face down on the high bench, hips at the edge, legs hanging.", end: "Lift your straight legs up behind you to level, then lower.",
      props: j => [Rc(j.hip[0] - 4, j.hip[1] + 8, 96, 9), L([j.hip[0] + 20, j.hip[1] + 16], [j.hip[0] + 20, FLOOR], C.kit, 6), L([j.hip[0] + 78, j.hip[1] + 16], [j.hip[0] + 78, FLOOR], C.kit, 6)],
      frames: [{ hip: [140, 90], t: -2, th: -92, sh: -92, ft: 0, hand: [222, 108], eb: -1 }, { hip: [140, 90], t: -2, th: 178, sh: 176, ft: -90, hand: [222, 108], eb: -1 }] },
    seated_back_extension: { label: "seated back extension", kit: "machine", kits: ["machine"], go: "push back", back: "forward", joint: "shoulder",
      start: "Sit with the pad across your upper back, leaning forward, arms crossed.", end: "Push back against the pad until you are upright, then lean forward slowly.",
      props: j => PROPS.seat(j, {}), dyn: j => [L([j.shoulder[0] - 14, j.shoulder[1] - 12], [j.shoulder[0] - 8, j.shoulder[1] + 18], C.kit, 10)],
      frames: [{ hip: [140, 150], t: 52, ankle: [190, 196], kb: 1, handOn: ["shoulder", -16, -10], eb: -1 }, { hip: [140, 150], t: 98, ankle: [190, 196], kb: 1, handOn: ["shoulder", -16, -10], eb: -1 }] },
    seated_good_morning: { label: "seated good morning", kit: "barbell", go: "lean forward", back: "sit up", joint: "shoulder",
      start: "Sit tall on the bench with the bar on your upper back.", end: "Hinge forward from your hips with a flat back, then sit up.",
      props: j => PROPS.seat(j, {}),
      frames: [{ hip: [140, 150], t: 90, ankle: [196, 196], kb: 1, handOn: ["shoulder", -3, 13], eb: -1 }, { hip: [140, 150], t: 30, ankle: [196, 196], kb: 1, handOn: ["shoulder", -3, 13], eb: -1 }] },
    arm_bike: { label: "arm bike", kit: "none", kits: "none", hold: true, joint: "hand",
      start: "Sit tall with the handles at shoulder height.", end: "Turn the handles in steady circles, then switch direction.",
      props: () => [L([120, FLOOR], [120, 152], C.kit, 6), L([104, 150], [138, 150], C.kit, 8), L([236, FLOOR], [236, 96], C.kit, 7), O([224, 98], 14, "none", C.kit, 3)],
      frames: [{ hip: [120, 140], t: 92, ankle: [168, 196], kb: 1, hand: [214, 92], eb: 1 }] },
    // ---- arms
    incline_curl: { label: "incline curl", kit: "dumbbell", go: "curl up", back: "lower", joint: "grip",
      start: "Sit back on an incline bench, arms hanging straight down.", end: "Curl the weights up without moving your elbows forward, then lower.",
      props: j => PROPS.angled(j, {}),
      frames: [{ hip: [176, 150], t: 128, ankle: [222, 196], kb: 1, ua: -96, fa: -94 }, { hip: [176, 150], t: 128, ankle: [222, 196], kb: 1, ua: -96, fa: 70 }] },
    spider_curl: { label: "spider curl", kit: "barbell", go: "curl up", back: "lower", joint: "grip",
      start: "Lie chest-down on an incline bench, arms hanging straight.", end: "Curl the weight up, squeeze, then lower slowly.",
      props: j => PROPS.angled(j, { flip: false, seat: false }).concat([L([j.hip[0] + 10, j.hip[1] + 6], [j.hip[0] + 10, FLOOR], C.kit, 6)]),
      frames: [{ hip: [150, 124], t: 38, ankle: [96, 196], kb: 1, ua: -90, fa: -90 }, { hip: [150, 124], t: 38, ankle: [96, 196], kb: 1, ua: -84, fa: 100 }] },
    concentration_curl: { label: "concentration curl", kit: "dumbbell", go: "curl up", back: "lower", joint: "grip",
      start: "Sit on a bench, lean forward, the back of your arm against your inner thigh.", end: "Curl the weight to your shoulder, then lower until the arm is straight.",
      props: j => PROPS.seat(j, {}),
      frames: [{ hip: [140, 150], t: 56, ankle: [196, 196], kb: 1, ua: -76, fa: -88 }, { hip: [140, 150], t: 56, ankle: [196, 196], kb: 1, ua: -76, fa: 110 }] },
    curl_seated: { label: "seated curl", kit: "dumbbell", go: "curl up", back: "lower", joint: "grip",
      start: "Sit tall on the bench, arms straight down, elbows at your sides.", end: "Curl the weight up to your shoulders, then lower.",
      props: j => PROPS.seat(j, {}),
      frames: [{ hip: [146, 150], t: 92, ankle: [194, 196], kb: 1, ua: -92, fa: -80 }, { hip: [146, 150], t: 92, ankle: [194, 196], kb: 1, ua: -86, fa: 88 }] },
    high_cable_curl: { label: "high cable curl", view: "front", kit: "cable", go: "curl in", back: "straighten", joint: "hand", kits: ["cable", "band"],
      start: "Stand between two high pulleys, arms straight out to the sides.", end: "Curl your hands towards your head, then straighten your arms.",
      props: () => [L([302, FLOOR], [302, 30], C.kit, 7), L([18, FLOOR], [18, 30], C.kit, 7)], cable: j => [[300, j.shR[1]], [20, j.shL[1]]],
      frames: [{ ua: 2, fa: 2, floor: true }, { ua: 2, fa: 128, floor: true }] },
    external_rotation: { label: "external rotation", view: "front", kit: "dumbbell", go: "rotate up", back: "down", joint: "hand", both: false,
      start: "Upper arm out to the side at shoulder height, elbow bent, forearm pointing forward.", end: "Rotate the forearm up until it points to the ceiling, then lower slowly.",
      frames: [{ ua: 0, fa: -70, faS: 0.4, uaL: -96, faL: -96, floor: true }, { ua: 0, fa: 90, uaL: -96, faL: -96, floor: true }] },
    // ---- shoulders and traps
    y_raise: { label: "Y-raise", view: "front", kit: "dumbbell", go: "raise", back: "lower", joint: "hand",
      start: "Arms in front of you, thumbs up (standing, leaning on a bench or face-down).", end: "Raise your arms up and out into a Y, then lower slowly.",
      cable: j => [[j.pel[0] - 120, FLOOR - 8], [j.pel[0] + 120, FLOOR - 8]],
      frames: [{ hand: [166, 116], eb: -1, floor: true }, { ua: 52, fa: 54, floor: true }] },
    overhead_carry: { label: "overhead carry", kit: "dumbbell", go: "walk", back: "", joint: "hip",
      start: "Press the weight overhead and lock your arm.", end: "Walk with short steps, the weight steady over your shoulder.",
      frames: [{ hip: [150, 110], t: 90, ankle: [176, 196], kb: 1, ankle2: [126, 196], kb2: 1, ft2: -20, hand: [156, 0], eb: 1, floor: true },
        { hip: [176, 110], t: 90, ankle: [210, 196], kb: 1, ankle2: [154, 196], kb2: 1, ft2: -20, hand: [182, 0], eb: 1, floor: true }] },
    // ---- core
    russian_twist: { label: "Russian twist", kit: "none", go: "twist to the side", back: "other side", joint: "grip",
      start: "Sit leaning back, knees bent, feet down or lifted, hands together in front.", end: "Turn your shoulders to bring your hands beside one hip, then across to the other.",
      frames: [{ hip: [150, 186], t: 124, th: 46, sh: -38, ft: 10, hand: [190, 136], eb: 1 }, { hip: [150, 186], t: 118, th: 46, sh: -38, ft: 10, hand: [170, 190], eb: 1 }] },
    overhead_triceps_seated: { label: "seated overhead triceps extension", kit: "dumbbell", go: "straighten", back: "bend", joint: "grip",
      start: "Sit tall against the pad, the weight overhead, then lower it behind your head with elbows up.", end: "Straighten your arms to lift it overhead, then lower it behind your head.",
      props: j => PROPS.seat(j, { back: true, lean: 4 }),
      frames: [{ hip: [150, 150], t: 92, ankle: [198, 196], kb: 1, ua: 96, fa: -118 }, { hip: [150, 150], t: 92, ankle: [198, 196], kb: 1, ua: 94, fa: 92 }] },
    hollow_hold: { label: "hollow body hold", kit: "none", kits: "none", hold: true, joint: "hip",
      start: "Lie on your back, lower back pressed down, arms overhead.", end: "Lift your shoulders and straight legs off the floor and hold.",
      frames: [{ hip: [170, 190], t: 166, th: 14, sh: 14, ft: 60, ua: 170, fa: 172, floor: true, on: ["hip"] }] },
    reverse_plank: { label: "reverse plank", kit: "none", kits: "none", hold: true, joint: "hip",
      start: "Sit with your legs straight, hands on the floor just behind your hips.", end: "Lift your hips until your body is straight from heels to shoulders and hold.",
      frames: [{ hip: [134, 160], t: 18, th: 198, sh: 198, ft: 100, nk: 20, hand: [180, 196], eb: 1, floor: true, on: ["hand", "ankle"] }] },
    bear_crawl: { label: "bear crawl", kit: "none", kits: "none", hold: true, joint: "hip",
      start: "On hands and feet, knees just off the floor under your hips, back flat.", end: "Crawl forward with small steps, opposite hand and foot together.",
      frames: [{ hip: [140, 136], t: 4, ankle: [116, 194], kb: 1, ft: 0, hand: [196, 196], eb: 1, floor: true, on: ["hand", "ankle"] }] },
    l_sit: { label: "L-sit", kit: "none", kits: "none", hold: true, joint: "hip",
      start: "Hands on the bars or the floor beside your hips, arms straight.", end: "Lift your straight legs out in front and hold.",
      props: j => [L([j.hand[0] - 15, j.hand[1] + 5], [j.hand[0] + 15, j.hand[1] + 5], C.plate, 5), L([j.hand[0] - 11, j.hand[1] + 6], [j.hand[0] - 15, FLOOR], C.kit, 4), L([j.hand[0] + 11, j.hand[1] + 6], [j.hand[0] + 15, FLOOR], C.kit, 4)],   // 3.12.0: low parallettes
      frames: [{ hip: [150, 164], t: 92, th: 2, sh: 2, ft: 80, hand: [152, 172], eb: 1 }] },
    knee_tuck: { label: "seated knee tuck", kit: "none", kits: "none", go: "knees in", back: "legs out", joint: "knee",
      start: "Sit leaning back on your hands, legs straight out just off the floor.", end: "Pull your knees in towards your chest, then push your legs back out.",
      frames: [{ hip: [150, 186], t: 122, th: 12, sh: 12, ft: 40, hand: [118, 196], eb: 1 }, { hip: [150, 186], t: 112, th: 62, sh: -50, ft: 20, hand: [118, 196], eb: 1 }] },
    standing_twist: { label: "standing twist", view: "front", kit: "stick", go: "turn", back: "other way", joint: "hand", kits: ["stick", "none", "barbell"],
      start: "Stand tall, a stick across your shoulders, hands wide.", end: "Turn your shoulders to one side, then the other, hips facing forward.",
      frames: [{ tl: -6, hand: [222, 56], handL: [100, 44], eb: 1, ebL: -1, floor: true }, { tl: 6, hand: [220, 44], handL: [98, 56], eb: 1, ebL: -1, floor: true }] },
    landmine_twist: { label: "landmine twist", view: "front", kit: "landmine", go: "arc across", back: "back", joint: "hand", kits: ["landmine"],
      start: "Hold the end of the bar at arm's length over your head, arms straight.", end: "Arc it down to one hip, back over the top and down to the other.",
      frames: [{ tl: -8, hand: [214, 92], handL: [204, 84], eb: 1, ebL: 1, floor: true }, { tl: 8, hand: [116, 84], handL: [106, 92], eb: -1, ebL: -1, floor: true }] },
    // ---- cardio and warm-ups
    burpee: { label: "burpee", kit: "none", kits: "none", go: "jump up", back: "down", joint: "hip",
      start: "Squat down, hands on the floor, jump your feet back to a plank.", end: "Jump your feet in and leap up with your arms overhead, then go again.",
      frames: [{ hip: [176, 156], t: 21, th: 200, sh: 200, ft: -75, hand: [234, 196], eb: 1, floor: true, on: ["hand", "toe"] }, { hip: [162, 74], t: 90, th: -88, sh: -96, ft: -30, ua: 100, fa: 96 }] },
    jumping_jack: { label: "jumping jack", view: "front", kit: "none", kits: "none", go: "jump out", back: "jump in", joint: "hand",
      start: "Stand tall, feet together, arms by your sides.", end: "Jump your feet wide and your arms overhead, then jump back in.",
      frames: [{ ua: -84, fa: -86, th: -89, sh: -89, floor: true }, { ua: 64, fa: 74, th: -66, sh: -66, floor: true }] },
    child_pose: { label: "child's pose", kit: "none", kits: "none", hold: true, joint: "hip",
      start: "Kneel, sit back towards your heels and walk your hands forward.", end: "Rest your chest down, arms long, and breathe into your back.",
      frames: [{ hip: [112, 165], t: -15, th: -35, sh: 180, ft: 180, ua: -4, fa: 0, floor: true, on: ["knee", "ankle"] }] },
    cat_cow: { label: "cat-cow", kit: "none", kits: "none", go: "round up", back: "dip down", joint: "head",
      start: "On hands and knees, hands under shoulders, knees under hips.", end: "Round your back up and tuck your head (cat), then let your belly drop and look up (cow).",
      frames: [{ hip: [130, 140], t: 6, nk: -60, th: -90, sh: 180, ft: 180, ua: -90, fa: -90, floor: true, on: ["knee", "hand"] }, { hip: [130, 140], t: -3, nk: 40, th: -90, sh: 180, ft: 180, ua: -90, fa: -90, floor: true, on: ["knee", "hand"] }] },
    toe_reach: { label: "seated toe reach", kit: "none", kits: "none", hold: true, joint: "hip",
      start: "Sit with your legs straight out in front.", end: "Hinge forward from your hips, reach for your toes and hold.",
      frames: [{ hip: [130, 188], t: 36, th: 0, sh: 0, ft: 90, ua: -6, fa: -6, floor: true, on: ["hip", "ankle"] }] },
    calf_stretch: { label: "calf stretch", kit: "none", kits: "none", hold: true, joint: "hip",
      start: "Hands on the wall, one foot forward, the back leg straight.", end: "Lean in with the back heel down until you feel your calf, and hold.",
      props: () => wall(254),
      frames: [{ hip: [170, 110], t: 66, ankle: [100, 196], kb: 1, ft: 0, ankle2: [204, 196], kb2: 1, hand: [248, 72], eb: 1, floor: true }] },   // 3.12.0: the stretched (back) leg is the near one
    hip_flexor_stretch: { label: "kneeling hip flexor stretch", kit: "none", kits: "none", hold: true, joint: "hip",
      start: "Kneel on one knee, the other foot flat in front.", end: "Squeeze the glute of the back leg and shift your hips forward until you feel the front of the hip, then hold.",
      frames: [{ hip: [148, 152], t: 90, th: -128, sh: 180, ft: 180, ankle2: [204, 196], kb2: 1, hand: [182, 152], eb: 1, floor: true, on: ["ankle2", "knee"] }] },
    quad_stretch: { label: "standing quad stretch", kit: "none", kits: "none", hold: true, joint: "hip",
      start: "Stand tall on one leg, holding a wall if you need to.", end: "Pull the other heel to your glutes, knees together, and hold.",
      frames: [{ th: -100, sh: 110, ft: 170, hand: [138, 112], eb: 1, ankle2: [160, 196], ua2: -40, fa2: -20, floor: true, on: ["ankle2"] }] },
    pigeon: { label: "pigeon stretch", kit: "none", kits: "none", hold: true, joint: "hip",
      start: "From hands and knees, bring one knee forward and lay that shin across in front of you.", end: "Slide the other leg straight back, sink your hips and hold.",
      frames: [{ hip: [150, 178], t: 82, th: -8, sh: 200, ft: 180, th2: 186, sh2: 180, ft2: 180, hand: [196, 196], eb: 1, floor: true, on: ["hip", "ankle2"] }] },
    doorway_stretch: { label: "doorway chest stretch", kit: "none", kits: "none", hold: true, joint: "hip",
      start: "Forearm up on the door frame, elbow at shoulder height.", end: "Step through with the near foot until you feel your chest stretch, and hold.",
      props: () => wall(130),
      frames: [{ hip: [158, 108], t: 84, ankle: [190, 196], kb: 1, ankle2: [136, 196], kb2: 1, ft2: -20, ua: 178, fa: 92, floor: true }] },
    cross_body_stretch: { label: "cross-body shoulder stretch", view: "front", kit: "none", kits: "none", hold: true, joint: "hand",
      start: "Bring one straight arm across your chest.", end: "Hold it close with the other hand and hold the stretch.",
      frames: [{ ua: 180, fa: 180, handL: [150, 60], ebL: 1, floor: true }] },
    triceps_stretch: { label: "overhead triceps stretch", view: "front", kit: "none", kits: "none", hold: true, joint: "hand",
      start: "Reach one arm up, bend the elbow and drop the hand behind your head.", end: "Gently push the elbow back with the other hand and hold.",
      frames: [{ ua: 96, fa: -150, handL: [176, 10], ebL: 1, floor: true }] },
    knee_to_chest: { label: "knee to chest", kit: "none", kits: "none", hold: true, joint: "hip",
      start: "Lie on your back, legs long.", end: "Pull one knee to your chest with both hands and hold.",
      frames: [{ hip: [170, 190], t: 180, th: 112, sh: -14, ft: 70, th2: 2, sh2: 2, ft2: 80, hand: [150, 152], eb: -1, floor: true, on: ["hip"] }] },
    lying_twist: { label: "lying twist (seen from above)", view: "front", kit: "none", kits: "none", hold: true, joint: "pel", floor: false,
      start: "Lie on your back, arms out wide.", end: "Bring one knee across your body towards the floor, shoulders down, and hold.",
      props: j => [Rc(j.pel[0] - 78, j.head[1] - 22, 156, j.anR[1] - j.head[1] + 34, 10)],
      frames: [{ pel: [160, 130], ua: 2, fa: 2, th: -90, sh: -90, thL: -24, shL: -118 }] },
    arm_circles: { label: "arm circles", view: "front", kit: "none", kits: "none", go: "circle", back: "circle", joint: "hand",
      start: "Stand tall, arms straight out to the sides.", end: "Make small circles, slowly getting bigger, then reverse.",
      frames: [{ ua: 14, fa: 14, floor: true }, { ua: -12, fa: -12, floor: true }] },
    hip_circles: { label: "hip circles", view: "front", kit: "none", kits: "none", go: "circle", back: "circle", joint: "pel",
      start: "Stand with your hands on your hips, feet hip-width.", end: "Draw slow circles with your hips, then go the other way.",
      frames: [{ tl: -8, hand: [176, 100], handL: [150, 100], eb: 1, ebL: -1, floor: true }, { tl: 8, hand: [176, 100], handL: [150, 100], eb: 1, ebL: -1, floor: true }] },
    ankle_rock: { label: "ankle rock", kit: "none", kits: "none", go: "knee forward", back: "back", joint: "knee",
      start: "Half-kneel with the front foot flat.", end: "Push the front knee forward over the toes, heel down, then rock back.",
      frames: [{ hip: [146, 152], t: 90, ankle: [196, 196], kb: 1, th2: -128, sh2: 180, ft2: 180, hand: [186, 150], eb: 1, floor: true, on: ["ankle", "knee2"] },
        { hip: [160, 150], t: 84, ankle: [196, 196], kb: 1, th2: -118, sh2: 180, ft2: 180, hand: [200, 150], eb: 1, floor: true, on: ["ankle", "knee2"] }] },
    dislocate: { label: "shoulder dislocate", view: "front", kit: "band", go: "over", back: "back", joint: "hand", kits: ["band", "stick"],
      start: "Hold a band or stick wide, arms straight in front of your hips.", end: "Lift it over your head and behind you with straight arms, then back.",
      frames: [{ ua: -48, fa: -48, floor: true }, { ua: 56, fa: 56, floor: true }] },
    inchworm: { label: "inchworm", kit: "none", kits: "none", go: "walk out", back: "walk in", joint: "hand",
      start: "Stand, fold forward and put your hands on the floor.", end: "Walk your hands out to a plank, then walk them back in.",
      frames: [{ hip: [150, 104], t: -78, ankle: [154, 196], kb: 1, hand: [178, 196], eb: 1, floor: true, on: ["ankle", "hand"] }, { hip: [176, 156], t: 21, th: 200, sh: 200, ft: -75, hand: [234, 196], eb: 1, floor: true, on: ["hand", "toe"] }] },
    worlds_greatest: { label: "world's greatest stretch", kit: "none", kits: "none", go: "reach up", back: "down", joint: "hand",
      start: "Step into a long lunge, both hands on the floor inside the front foot.", end: "Turn and reach one arm to the ceiling, then bring it back down.",
      frames: [{ hip: [146, 150], t: 34, ankle: [204, 196], kb: 1, ankle2: [70, 194], kb2: 1, ft2: -40, hand: [192, 196], eb: 1, floor: true, on: ["ankle", "toe2"] },
        { hip: [146, 150], t: 40, ankle: [204, 196], kb: 1, ankle2: [70, 194], kb2: 1, ft2: -40, ua: 88, fa: 88, hand2: [192, 196], eb2: 1, floor: true, on: ["ankle", "toe2"] }] },
    wall_slide: { label: "wall slide", view: "front", kit: "none", kits: "none", go: "slide up", back: "down", joint: "hand",
      start: "Back, head and arms on the wall, elbows bent at shoulder height.", end: "Slide your arms up the wall as far as you can keep contact, then back down.",
      frames: [{ ua: 6, fa: 90, floor: true }, { ua: 58, fa: 66, floor: true }] },
    foam_roll_lower: { label: "foam rolling (legs)", kit: "none", kits: "none", go: "roll", back: "roll back", joint: "hip",
      start: "Sit with the roller under your thighs, hands on the floor behind you.", end: "Roll slowly from hips to knees, pausing on tight spots.",
      dyn: j => [O([j.knee[0] - 16, j.knee[1] + 14], 11, C.plateFill, C.plate, 2.5)],
      frames: [{ hip: [150, 172], t: 118, th: -6, sh: -2, ft: 80, hand: [110, 196], eb: 1 }, { hip: [168, 172], t: 124, th: -6, sh: -2, ft: 80, hand: [118, 196], eb: 1 }] },
    foam_roll_upper: { label: "foam rolling (upper back)", kit: "none", kits: "none", go: "roll", back: "roll back", joint: "shoulder",
      start: "Lie with the roller under your upper back, knees bent, hands behind your head.", end: "Lift your hips a little and roll slowly up and down your upper back.",
      dyn: j => [O([j.shoulder[0] + 14, j.shoulder[1] + 16], 11, C.plateFill, C.plate, 2.5)],
      frames: [{ hip: [180, 170], t: 174, ankle: [236, 196], kb: 1, uaR: 30, faR: 172 }, { hip: [168, 170], t: 176, ankle: [236, 196], kb: 1, uaR: 30, faR: 172 }] },
    thoracic_rotation: { label: "thoracic rotation", kit: "none", kits: "none", go: "open up", back: "back down", joint: "elbow",
      start: "On hands and knees, one hand behind your head.", end: "Turn to point that elbow at the ceiling, then turn back down.",
      frames: [{ hip: [130, 140], t: 2, th: -90, sh: 180, ft: 180, ua2: -90, fa2: -90, ua: -110, fa: 150, floor: true, on: ["knee", "hand2"] }, { hip: [130, 140], t: 2, th: -90, sh: 180, ft: 180, ua2: -90, fa2: -90, ua: 92, fa: 150, floor: true, on: ["knee", "hand2"] }] },
    stairs: { label: "stair climber", kit: "none", kits: "none", go: "step up", back: "", joint: "hip",
      start: "Stand tall on the steps, hands light on the rails.", end: "Step at a steady pace, pushing through the whole foot.",
      props: () => [Rc(150, 166, 90, FLOOR - 166, 3), Rc(196, 132, 70, FLOOR - 132, 3)],
      frames: [{ hip: [170, 80], t: 88, ankle: [212, 128], kb: 1, ft: 0, ankle2: [160, 162], kb2: 1, ft2: 0, ua: -60, fa: -20 }] },
    run: { label: "running", kit: "none", kits: "none", hold: true, joint: "hip",
      start: "Run tall, landing under your hips, arms swinging.", end: "Keep a steady pace you can breathe through.",
      frames: [{ hip: [160, 104], t: 82, th: -48, sh: -112, ft: -10, th2: -118, sh2: -168, ft2: -100, ua: -128, fa: -40, ua2: -56, fa2: 40, floor: true, on: ["toe"] }] },
    walk: { label: "walking", kit: "none", kits: "none", hold: true, joint: "hip",
      start: "Walk tall at a pace you can keep.", end: "Swing your arms and keep your steps even.",
      frames: [{ hip: [160, 108], t: 88, ankle: [186, 196], kb: 1, ankle2: [134, 196], kb2: 1, ft2: -24, ua: -112, fa: -94, ua2: -68, fa2: -60, floor: true }] },
    cycle: { label: "cycling", kit: "none", kits: "none", hold: true, joint: "hip",
      start: "Set the seat so your knee is only slightly bent at the bottom.", end: "Pedal at a steady pace, shoulders relaxed.",
      props: () => [L([110, FLOOR - 2], [236, FLOOR - 2], C.kit, 6), L([144, FLOOR - 2], [138, 114], C.kit, 6), L([126, 112], [152, 112], C.kit, 8), L([224, FLOOR - 2], [210, 90], C.kit, 6), L([200, 88], [222, 88], C.kit, 7), O([196, 166], 22, "none", C.kit, 4), O([164, 172], 4, C.kit, C.kit, 0)],
      frames: [{ hip: [138, 106], t: 58, ankle: [172, 186], kb: 1, ft: -10, ankle2: [158, 150], kb2: 1, ft2: 0, hand: [212, 90], eb: 1 }] },
  });
  // kit-specific poses and limits on the movements from 3.8.0
  Object.assign(PATTERNS.squat, { kitPose: { dumbbell: [HANG, HANG], kettlebell: [HANG, HANG], band: [HANG, HANG] }, alt: { none: "air_squat" }, kits: ["barbell", "smith", "machine", "dumbbell", "kettlebell", "band", "none", "landmine"] });
  Object.assign(PATTERNS.front_squat, { alt: { none: "air_squat" } });
  Object.assign(PATTERNS.goblet_squat, { alt: { none: "air_squat" } });
  Object.assign(PATTERNS.lunge, { kitPose: { barbell: BACKBAR, smith: BACKBAR } });
  Object.assign(PATTERNS.split_squat_rear, { kitPose: { barbell: BACKBAR, smith: BACKBAR } });
  Object.assign(PATTERNS.step_up, { kitPose: { barbell: BACKBAR } });
  Object.assign(PATTERNS.calf_raise, { kitPose: { barbell: BACKBAR, smith: BACKBAR, machine: BACKBAR } });
  Object.assign(PATTERNS.good_morning, { kits: ["barbell", "smith", "band", "none"] });
  ["pushdown", "lat_pulldown", "seated_row", "face_pull", "straight_arm_pulldown", "cable_fly", "cable_crunch"].forEach(id => { PATTERNS[id].kits = ["cable", "band", "machine"]; });
  PATTERNS.woodchop.kits = ["cable", "band", "ball", "plate", "machine"];
  PATTERNS.hanging_leg_raise.kits = ["none", "dumbbell", "ball", "plate"];
  PATTERNS.reverse_fly.cable = j => [[j.pel[0] - 130, 30], [j.pel[0] + 130, 30]];
  PATTERNS.lateral_raise.cable = j => [j.pel[0] - 96, FLOOR - 8];
  // 3.9.0 review of PulseTrack's own exercises: kit in the right place
  PATTERNS.squat.dyn = (j, kit) => kit === "machine" ? PROPS.angled(j, { flip: true, seat: false }) : [];
  PATTERNS.hip_extension.props = () => wall(200);
  PATTERNS.upright_row.cable = j => [(j.haR[0] + j.haL[0]) / 2 + 2, FLOOR - 6];
  PATTERNS.overhead_triceps.cable = j => [j.hip[0] - 84, FLOOR - 8];
  PATTERNS.skull_crusher.cable = j => [j.head[0] - 46, FLOOR - 8];
  PATTERNS.machine_chest_press.cable = j => [j.hip[0] - 70, j.shoulder[1] + 8];
  PATTERNS.overhead_press.cable = j => [j.hip[0] - 50, FLOOR - 8];
  PATTERNS.overhead_press_seated.cable = j => [j.hip[0] - 54, FLOOR - 8];
  PATTERNS.dip.props = (j, kit) => kit === "trx" ? [] : PROPS.bars(null, { at: [170, 118] });
  const ONCHEST = { handOn: ["shoulder", -14, -10], eb: 1, uaR: null, faR: null, ua: null, fa: null };
  PATTERNS.crunch.kitPose = { plate: ONCHEST, dumbbell: ONCHEST, ball: ONCHEST, kettlebell: ONCHEST };
  PATTERNS.sit_up.kitPose = { plate: ONCHEST, dumbbell: ONCHEST, ball: ONCHEST, kettlebell: ONCHEST };
  PATTERNS.ab_wheel.dyn = (j, kit) => kit === "none" ? [O([j.hand[0], j.hand[1] + 6], 9, C.plateFill, C.plate, 3)] : [];
  PATTERNS.leg_raise.kits = ["none", "dumbbell", "ball", "plate"];
  PATTERNS.step_up.frames[1] = { hip: [182, 62], t: 90, ankle: [184, 146], kb: 1, ft: 0, ankle2: [164, 146], kb2: 1, ft2: 0 };

  /* ================================================================ 3.12.0: drawings for the last exercises (grip, neck, ropes, sled, swimming, boxing) */
  const anchor = x => [Rc(x - 8, FLOOR - 14, 16, 14, 3)];
  const ropes = (j, x) => { const h = j.grip, up = j.frame ? 1 : -1, a = [h[0] + (x - h[0]) * 0.33, h[1] + up * 16], b = [h[0] + (x - h[0]) * 0.66, FLOOR - 10 - up * 12];
    return [{ k: "path", d: `M${n1(h[0])} ${n1(h[1])} C${n1(a[0])} ${n1(a[1])} ${n1(b[0])} ${n1(b[1])} ${x - 6} ${FLOOR - 8}`, c: "#a1a1aa", w: 5 }]; };
  const sled = x => [L([x - 26, FLOOR - 4], [x + 26, FLOOR - 4], C.kit, 6), Rc(x - 22, FLOOR - 22, 44, 16, 3), O([x + 4, FLOOR - 30], 12, C.plateFill, C.plate, 3)];
  Object.assign(PATTERNS, {
    grip: { label: "grip squeeze", kit: "none", kits: "none", go: "squeeze", back: "open", joint: "grip",
      start: "Hold the gripper (or a ball) in one hand, arm relaxed in front of you.", end: "Squeeze it shut as hard as you can, hold a moment, then open slowly.",
      dyn: j => { const h = j.grip, o = j.frame ? 3 : 12; return [L([h[0] - 2, h[1] - 3], [h[0] - 4, h[1] + 20], C.plate, 4), L([h[0] + 2, h[1] - 3], [h[0] + o, h[1] + 19], C.plate, 4), O([h[0], h[1] - 5], 3.5, C.kitFill, C.plate, 2)]; },
      frames: [S({ ua: -80, fa: 6 }), S({ ua: -80, fa: 6 })] },
    neck_flexion: { label: "neck curl", kit: "none", kits: "none", go: "chin to chest", back: "lower", joint: "head", floor: false, off: 16,
      start: "Lie on your back on a bench with your head past the end, head lowered back a little.", end: "Bring your chin towards your chest, then lower your head slowly.",
      props: j => PROPS.bench(j, { headRoom: 2 }),
      frames: [{ hip: [204, 138], t: 180, ankle: [242, 196], kb: 1, nk: 30, hand: [206, 132], eb: -1 }, { hip: [204, 138], t: 180, ankle: [242, 196], kb: 1, nk: -48, hand: [206, 132], eb: -1 }] },
    neck_extension: { label: "neck extension", kit: "none", kits: "none", go: "head up", back: "lower", joint: "head", floor: false, off: 16,
      start: "Lie face down on a bench with your head past the end, head lowered.", end: "Lift your head until you look straight ahead, then lower slowly.",
      props: () => PROPS.lowBench(null, { x1: 44, x2: 184, y: 144 }),
      frames: [{ hip: [126, 134], t: 0, th: 180, sh: 180, ft: -90, nk: -42, hand: [172, 182], eb: 1 }, { hip: [126, 134], t: 0, th: 180, sh: 180, ft: -90, nk: 24, hand: [172, 182], eb: 1 }] },
    neck_side: { label: "side neck raise", view: "front", kit: "none", kits: "none", go: "tilt", back: "back", joint: "head",
      start: "Stand or sit tall, one hand on the side of your head.", end: "Tilt your head towards your shoulder against your hand, then back up slowly.",
      frames: [{ ua: -88, fa: -90, handL: [138, 32], ebL: 1, floor: true }, { hk: 24, ua: -88, fa: -90, handL: [138, 32], ebL: 1, floor: true }] },
    battle_ropes: { label: "battle ropes", kit: "none", kits: "none", go: "whip down", back: "up", joint: "grip",
      start: "Hold a rope end in each hand, knees bent, chest up.", end: "Whip the ropes up and down fast, one arm or both, and keep the waves going.",
      props: () => anchor(296), dyn: j => ropes(j, 296),
      frames: [S({ hip: [150, 128], t: 80, ankle: [174, 196], kb: 1, ankle2: [132, 196], kb2: 1, hand: [204, 98], eb: -1, floor: true }),
        S({ hip: [150, 128], t: 80, ankle: [174, 196], kb: 1, ankle2: [132, 196], kb2: 1, hand: [204, 150], eb: -1, floor: true })] },
    sled_push: { label: "sled push", kit: "none", kits: "none", go: "drive", back: "", joint: "hip", hold: true,
      start: "Hands on the sled's poles, body leaning in at about 45 degrees.", end: "Drive with short, powerful steps, pushing the floor away behind you.",
      props: () => sled(268).concat([L([254, FLOOR - 22], [236, 104], C.kit, 5)]),
      frames: [S({ hip: [150, 134], t: 34, ankle: [102, 196], kb: 1, ft: -20, ankle2: [178, 196], kb2: 1, hand: [236, 108], eb: 1, floor: true })] },
    sled_pull: { label: "sled pull", kit: "none", kits: "none", go: "pull", back: "reach", joint: "grip",
      start: "Face the sled, rope in your hands, knees bent and arms reaching.", end: "Pull the rope in hand over hand, or walk back pulling, keeping your back flat.",
      props: () => sled(290), dyn: j => [L(j.grip, [278, FLOOR - 16], C.cable, 3)],
      frames: [S({ hip: [140, 126], t: 74, ankle: [164, 196], kb: 1, ankle2: [122, 196], kb2: 1, hand: [204, 122], eb: 1, floor: true }),
        S({ hip: [134, 124], t: 84, ankle: [164, 196], kb: 1, ankle2: [122, 196], kb2: 1, hand: [150, 130], eb: -1, floor: true })] },
    swim: { label: "swimming", kit: "none", kits: "none", go: "pull", back: "", joint: "hand", floor: false, hold: true,
      start: "Float face down, long and straight, eyes to the bottom.", end: "Reach, pull the water back past your hip, and kick from the hips.",
      props: () => [{ k: "path", d: "M24 112 Q44 104 64 112 T104 112 T144 112 T184 112 T224 112 T264 112 T304 112", c: "#3f3f46", w: 3 }, L([20, 112], [20, 112], C.floor, 1), L([306, 112], [306, 112], C.floor, 1)],
      frames: [{ hip: [146, 128], t: 2, th: 184, sh: 176, ft: 182, th2: 176, sh2: 188, ft2: 178, ua: 2, fa: 0, ua2: 196, fa2: 186, nk: -6 }] },
    boxing: { label: "boxing stance", kit: "none", kits: "none", go: "punch", back: "guard", joint: "hand",
      start: "Stand side-on, feet apart, knees soft, hands up by your chin.", end: "Punch straight out, turning your hip in, then bring the hand straight back to your chin.",
      frames: [S({ hip: [154, 110], t: 86, ankle: [184, 196], kb: 1, ankle2: [128, 196], kb2: 1, hand: [192, 60], eb: -1, hand2: [184, 56], eb2: -1, floor: true }),
        S({ hip: [156, 110], t: 82, ankle: [184, 196], kb: 1, ankle2: [128, 196], kb2: 1, hand: [242, 58], eb: -1, hand2: [184, 56], eb2: -1, floor: true })] },
    bag_work: { label: "heavy bag", kit: "none", kits: "none", go: "punch", back: "guard", joint: "hand",
      start: "Stand side-on a step from the bag, hands up by your chin.", end: "Punch through the bag, turn your hip in, and bring the hand straight back.",
      props: () => [L([262, 0], [262, 30], C.plate, 3), Rc(240, 30, 44, 120, 20)],
      frames: [S({ hip: [154, 110], t: 86, ankle: [184, 196], kb: 1, ankle2: [128, 196], kb2: 1, hand: [192, 60], eb: -1, hand2: [184, 56], eb2: -1, floor: true }),
        S({ hip: [156, 110], t: 82, ankle: [184, 196], kb: 1, ankle2: [128, 196], kb2: 1, hand: [238, 60], eb: -1, hand2: [184, 56], eb2: -1, floor: true })] },
    crucifix: { label: "crucifix extension", view: "front", kit: "dumbbell", kits: ["dumbbell", "none", "cable", "band"], go: "bend", back: "straighten", joint: "hand",
      start: "Arms straight out to the sides at shoulder height.", end: "Bend your elbows to bring the weights towards your head, then straighten your arms again.",
      frames: [{ ua: 0, fa: 0, floor: true }, { ua: 0, fa: 118, floor: true }] }
  });

  /* ================================================================ which drawing an exercise gets (shared with tools/guides_data.py) */
  const RULES = /*RULES*/[
    ["neck_side", "side neck|neck.*\\bside\\b|head twist|lateral neck", ""],
    ["neck_extension", "neck (extension|bridge|harness)|cervical extension|neck bridge", ""],
    ["neck_flexion", "neck (crunch|crunches|flexion|curl|raise|raises)", ""],
    ["grip", "gripper|grip squeeze|fingers? press|\\bhand grip", ""],
    ["carry", "plate pinch|\\bpinch(es)?\\b", ""],
    ["wrist_curl", "pronation|supination", ""],
    ["reverse_fly", "scapular (adduction|retraction)|behind back raise", ""],
    ["swim", "swimming|\\bswim\\b", ""],
    ["bag_work", "heavy bag|bag work|punching bag", ""],
    ["boxing", "shadow ?box|boxing", ""],
    ["russian_twist", "battling ropes? russian twist", ""],
    ["battle_ropes", "battle ?ropes?|battling ropes?", ""],
    ["sled_push", "sled push|prowler", ""],
    ["sled_pull", "sled (pull|drag)", ""],
    ["pigeon", "90/90", ""],
    ["crucifix", "crucifix", ""],
    ["knee_tuck", "ab coaster", ""],
    ["leg_raise", "^bottoms up$", ""],
    ["skull_crusher", "triceps rockers?|^rockers$", ""],
    ["kickback", "kick ?outs?", ""],
    ["superman", "prone around the world", ""],
    ["overhead_press", "t spine press", ""],
    ["walk", "step in place|marching", ""],
    ["jumping_jack", "jack press", ""],
    ["dead_bug", "lying ab press", ""],
    ["reverse_nordic", "^body extension$", ""],
    ["child_pose", "child'?s pose|kneeling lat stretch|prayer stretch", ""],
    ["cat_cow", "cat[- ]?cow|cat camel", ""],
    ["toe_reach", "toe reach|hamstring stretch|seated forward (bend|fold)|sit and reach", ""],
    ["calf_stretch", "calf stretch|wall calf stretch", ""],
    ["hip_flexor_stretch", "hip flexor stretch|low lunge|couch stretch|kneeling lunge stretch", ""],
    ["quad_stretch", "quad(riceps)? stretch", ""],
    ["pigeon", "pigeon", ""],
    ["doorway_stretch", "doorway|chest stretch|pec stretch", ""],
    ["cross_body_stretch", "cross[- ]body (shoulder |arm )?stretch|shoulder stretch", ""],
    ["triceps_stretch", "triceps? stretch", ""],
    ["knee_to_chest", "knee[- ]to[- ]chest|knees to chest stretch", ""],
    ["lying_twist", "lying (crossover|hip twist|twist|spinal twist)|supine (twist|spinal)", ""],
    ["arm_circles", "arm circles?", ""],
    ["hip_circles", "hip circles?", ""],
    ["ankle_rock", "ankle (mobility|rock|dorsiflexion)", ""],
    ["dislocate", "dislocates?|shoulder pass[- ]throughs?|band pass[- ]throughs?|stick pass[- ]throughs?", ""],
    ["inchworm", "inchworm|walk[- ]?outs?\\b", ""],
    ["worlds_greatest", "world'?s greatest", ""],
    ["wall_slide", "wall slides?(?!.*squat)|wall angels?", ""],
    ["foam_roll_upper", "foam roll.*(upper|back|thoracic|lat|t[- ]spine)", ""],
    ["foam_roll_lower", "foam roll", ""],
    ["thoracic_rotation", "thoracic rotation|open book|t[- ]spine rotation", ""],
    ["leg_swing", "^(?!.*bridge).*leg swings?", ""],
    ["floor_press", "floor press", ""],
    ["push_up_incline", "incline push[- ]?up|bench push[- ]?up|wall push[- ]?up|hands elevated push", ""],
    ["push_up_decline", "decline push[- ]?up|feet elevated push", ""],
    ["push_up_knee", "knee push[- ]?up|kneeling push[- ]?up", ""],
    ["handstand_pushup", "handstand", ""],
    ["pike_pushup", "pike push|pike press|dive bomber|hindu push", ""],
    ["wall_sit", "wall sit|wall slide.*squat", ""],
    ["squat_hold", "deep squat|squat hold|goblet hold", ""],
    ["pistol", "pistol|single[- ]leg squat|one[- ]leg squat", ""],
    ["sissy_squat", "sissy", ""],
    ["lateral_lunge", "lateral lunge|side lunge|cossack|skater squat", ""],
    ["single_leg_rdl", "single[- ]leg (romanian|rdl|deadlift|stiff)|one[- ]leg (romanian|rdl|deadlift)|kickstand", ""],
    ["reverse_nordic", "reverse nordic", ""],
    ["nordic", "nordic|glute[- ]ham raise|\\bghr\\b", ""],
    ["standing_leg_curl", "standing (leg|hamstring) curl|kneeling (single[- ]leg )?(leg )?curl|cable (leg|hamstring) curl", ""],
    ["seated_calf_raise", "seated calf|seated (dumbbell |barbell |machine )?calf", ""],
    ["tibialis_raise", "^(?!.*stretch).*(tibialis|toe raise|tib raise)", ""],
    ["floor_press", "bridge (bench |chest )?press|glute bridge chest press", ""],
    ["glute_bridge_loaded", "(barbell|dumbbell|weighted|plate|smith|kettlebell) (glute |hip )?bridge", ""],
    ["supine_leg_curl", "slider (leg |hamstring )?curl|towel (leg |hamstring )?curl", ""],
    ["ball_leg_curl", "(stability|swiss|exercise|physio) ball (leg |hamstring )?curl|ball hamstring curl", ""],
    ["hip_adduction", "(cable|band|standing).*adduct", ""],
    ["pull_through", "pull[- ]through", ""],
    ["chest_supported_row", "chest[- ]supported.*row|seal row|prone (dumbbell |incline )?row|incline (dumbbell |bench |reverse grip |)row|incline bench row|incline prone row|spider row", ""],
    ["one_arm_row", "one[- ]arm (dumbbell |db |kettlebell )?row|single[- ]arm (dumbbell |db |kettlebell )?row|kroc|bench row", ""],
    ["renegade_row", "renegade", ""],
    ["dead_hang", "dead hang|towel hang|bar hang|passive hang|active hang|^hangs?$", ""],
    ["reverse_hyper", "reverse hyper", ""],
    ["seated_back_extension", "seated back extension|back extension machine|lower back machine", ""],
    ["seated_good_morning", "seated good ?morning", ""],
    ["incline_curl", "incline (dumbbell |hammer |db |bench )?curl", ""],
    ["spider_curl", "spider curl", ""],
    ["concentration_curl", "concentration", ""],
    ["high_cable_curl", "high cable curl|overhead cable curl|double biceps cable", ""],
    ["external_rotation", "^(?!.*face pull).*(external|internal) rotation", ""],
    ["y_raise", "\\by[- ]raise|\\biyt\\b|\\bytw?\\b raise|prone trap|trap raise|incline y", ""],
    ["overhead_carry", "overhead (carry|walk(?!ing lunge))|waiter'?s? (carry|walk)", ""],
    ["hollow_hold", "hollow", ""],
    ["reverse_plank", "reverse plank|crab hold|table ?top hold", ""],
    ["bear_crawl", "bear crawl|bear plank|crab walk", ""],
    ["l_sit", "^(?!.*(hanging|rope)).*\\bl[- ]sit|v[- ]sit hold", ""],
    ["knee_tuck", "seated knee tucks?|bench knee tucks?|leg pull[- ]?ins?|seated in[- ]and[- ]out|^knee tucks?$|incline (leg )?pull[- ]?ins?|^pull[- ]?ins?$|sitting knee tuck", ""],
    ["standing_twist", "broomstick|stick twist|bent[- ]over twist|standing (oblique )?twist", ""],
    ["landmine_twist", "landmine (twist|rotation|rainbow|180)", ""],
    ["pallof", "pallof", ""],
    ["burpee", "burpee", ""],
    ["jumping_jack", "jumping jack|star jump|seal jack", ""],
    ["standing_press", "svend|plate (squeeze )?press|standing (cable )?chest press", ""],
    ["arm_bike", "arm (bike|ergometer|cycle|crank)|upper body (ergometer|bike)|\\bube\\b", ""],
    ["straight_arm_pulldown", "ski ?erg|ski machine", ""],
    ["stairs", "stair|step ?mill|versaclimber|stepper", ""],
    ["fly_incline", "incline (dumbbell |cable |db )?(fly|flye)", ""],
    ["curl_seated", "seated (barbell |dumbbell |db |ez[- ]bar |alternating |hammer |)curl", ""],
    ["stretch", "stretch|mobility|foam roll|\\brolling\\b|yoga|cat[- ]?cow|child'?s pose|downward dog|leg swings?|arm swings?|arm circles?|hip circles?|dislocates?|90/90|inchworm|world'?s greatest|warm[- ]?up|wall slide|toe reach|scapula raise", ""],
    ["side_plank", "side plank|copenhagen|side bridge|side floor tap", ""],
    ["plank", "\\bplank\\b(?!.*(walk|up\\b|row|to push))|hollow (body )?hold|bear crawl|stir the pot", ""],
    ["mountain_climber", "mountain climber|climbers?\\b|cross body knee", ""],
    ["ab_wheel", "ab wheel|rollout|roll[- ]out|wheel roll|barbell roll", ""],
    ["dead_bug", "dead ?bug", ""],
    ["bird_dog", "bird ?dog|quadruped", ""],
    ["superman", "superman|prone (back )?extension|swimmers?\\b|reverse snow angel", ""],
    ["mountain_climber", "ball pull[- ]?ins?|ball knee tuck|ball jack ?knife", ""],
    ["hanging_leg_raise", "toes[- ]to[- ]bar", ""],
    ["v_up", "\\bv[- ]?up|jack ?knife|toe touch|toes to bar|toes-to-bar|pike up", ""],
    ["leg_raise", "lying (knee|leg) raise|lying.*knee raise", ""],
    ["hanging_leg_raise", "hanging (knee|leg)|captain'?s chair|knee raise|knees? to (chest|elbow)|leg raise.*(bar|hang)|\\bl[- ]sit|windshield|front lever|back lever", ""],
    ["leg_raise", "legs? raise|leg lift|flutter kick|scissor|reverse crunch|lying knee|hip raise|dragon flag|heel tap", ""],
    ["cable_crunch", "cable crunch|kneeling crunch|rope crunch", ""],
    ["russian_twist", "russian twist|seated twist|oblique twist|landmine (twist|rotation)", ""],
    ["woodchop", "wood ?chop|chop\\b|cable.*\\blift\\b|\\blift\\b.*cable|pallof|cable.*twist|twist.*cable|standing twist|kneeling twist|lever twist|rotary torso", ""],
    ["side_bend", "side bend|oblique bend|lateral bend|side crunch|oblique crunch|windmill", ""],
    ["sit_up", "sit[- ]?up|decline crunch|butterfly crunch", ""],
    ["crunch", "crunch|curl[- ]up|ab curl", ""],
    ["back_extension", "back extension|hyperextension|hyper extension|reverse hyper|45 degrees? back|roman chair", ""],
    ["good_morning", "good ?morning", ""],
    ["rdl", "romanian|\\brdls?\\b|stiff[- ]leg|straight[- ]leg dead|single[- ]leg dead|one[- ]leg dead|b[- ]stance|pull[- ]through", ""],
    ["snatch", "snatch|devil'?s? press", ""],
    ["clean", "\\bcleans?\\b|power clean|hang clean|high pull", ""],
    ["thruster", "thruster|wall ball|squat to (overhead )?press", ""],
    ["slam", "slam|ball.*throw|overhead throw|wall ball(?! squat)", ""],
    ["deadlift", "deadlift|rack pull|trap bar lift|jefferson|tire flip", ""],
    ["hip_thrust", "hip thrust|thrusts?\\b(?!.*squat)|barbell glute bridge|glute bridge.*bench|bench glute bridge", ""],
    ["glute_bridge", "glute bridge|hip bridge|bridge|frog pump", ""],
    ["leg_press", "leg press|sled press|vertical press|sled.*press|lever.*leg.*press", ""],
    ["calf_raise", "calf|calves|heel raise|toe raise|tibialis", ""],
    ["leg_extension", "leg extension|quad extension|knee extension", ""],
    ["leg_curl_seated", "seated (leg|hamstring) curl", ""],
    ["leg_curl", "leg curl|hamstring curl|nordic|glute[- ]ham|ham curl|\\bghr\\b", ""],
    ["split_squat_rear", "bulgarian|rear[- ]foot|rear foot elevated|elevated split", ""],
    ["step_up", "step[- ]?up|box step", ""],
    ["lunge", "lunge|split squat|split jump|scissor jump|reverse step|curtsy", ""],
    ["jump_rope", "jump rope|skipping|double under|rope jump", ""],
    ["jump", "jump(?! rope)|hop\\b|hops\\b|burpee|bound|skater|plyo|tuck jump|plank jack|lateral speed|ladder drill", ""],
    ["goblet_squat", "goblet|kettlebell squat|dumbbell squat|cossack|sissy", ""],
    ["carry", "carry|farmer|suitcase|yoke", ""],
    ["front_squat", "front squat|zercher|overhead squat", ""],
    ["air_squat", "air squat|bodyweight squat|prisoner squat|body weight squat", ""],
    ["squat", "squat|hack|pistol|wall sit|belt squat|pendulum", ""],
    ["face_pull", "face pull", ""],
    ["pullover", "pullover|pull[- ]over", ""],
    ["straight_arm_pulldown", "straight[- ]arm|stiff[- ]arm", ""],
    ["lat_pulldown", "pulldown|pull[- ]down|lat pull", ""],
    ["pull_up", "pull[- ]?up|chin[- ]?up|chin\\b|muscle[- ]up|dead hang|\\bhangs?\\b|rope climb", ""],
    ["inverted_row", "inverted row|ring row|trx row|suspension row|suspended row|australian|body ?weight row|table row", ""],
    ["seated_row", "seated (cable |machine |lever |)row|cable row|low row|machine row|lever row|rowing machine row|seated row|iso[- ]lateral row|high row|chest supported row", ""],
    ["upright_row", "upright row", ""],
    ["bent_row", "\\brows?\\b|\\bt[- ]bar|kroc|pendlay|yates|meadows|seal row", ""],
    ["shrug", "shrug", ""],
    ["reverse_fly", "rear[- ]delt|reverse fly|reverse flye|reverse pec|rear fly|bent[- ]over (lateral|raise|fly)|lateral bent[- ]over|\\b[ytw][- ]raise|prone (fly|raise)|trap raise|band pull[- ]apart|pull[- ]apart|\\biyt\\b|\\bytw?\\b raise", ""],
    ["lateral_raise", "lateral raise|side raise|lat raise|side lateral|lateral delt|lu raise|lateral rais|powell|side lying.*raise|cross raise|6 ways|backhand raise", ""],
    ["front_raise", "front raise|front delt raise|plate raise|forward raise|front shoulder raise|scaption|incline (shoulder )?raise|dumbbell raise|alternate raise", ""],
    ["pec_deck", "pec deck|peck deck|butterfly|machine fly|machine flye|seated fly|lever fly|chest fly machine|fly machine", ""],
    ["cable_fly", "cable (cross|fly|flye)|crossover|cross[- ]over|standing fly|standing flye|cable chest fly|low to high|high to low", ""],
    ["fly_lying", "\\bfly|\\bflye|flyes|\\bflies\\b|svend", ""],
    ["bench_dip", "bench dip|chair dip|dip.*(bench|between benches)|(bench|ball).*dip", ""],
    ["dip", "triceps press machine|seated (dip|triceps press)", ""],
    ["dip", "\\bdips?\\b(?!.*bench)|parallel bar|ring dip", ""],
    ["overhead_triceps_seated", "seated (overhead |dumbbell |db |ez[- ]bar |)(triceps? |tricep )?(overhead )?extension|seated french press", ""],
    ["skull_crusher", "skull|lying (triceps?|tricep|alternate|single|elbow)? ?(extension|press)|lying extension|lying french press|tate press|jm (bench )?press|lying close|elbow press", ""],
    ["overhead_triceps", "overhead (triceps?|tricep|extension|ez|dumbbell)|triceps? extension|tricep extension|french curl|behind (the )?head|one arm extension|single extension|standing.*extension|seated.*extension|two[- ]?(arm|dumbbell) extension|overhead.*extension|french press", ""],
    ["pushdown", "pushdown|push[- ]down|press[- ]?down", ""],
    ["hip_extension", "glute kickback|donkey kick|hip extension|cable kickback.*(glute|leg)|leg kickback|glute press|multi[- ]hip|reverse hyper|reverse extension", ""],
    ["hip_abduction_seated", "seated.*abduct|abduct.*(machine|lever|seated)|abductor machine|lever.*abduction|bent knee abduction", ""],
    ["hip_adduction_seated", "adduct", ""],
    ["hip_abduction", "abduct|fire hydrant|clam", ""],
    ["kickback", "kickback|kick[- ]back", ""],
    ["wrist_curl", "wrist|forearm curl|finger curl|wrist roller|reverse wrist", ""],
    ["preacher_curl", "preacher|scott curl|spider curl|concentration", ""],
    ["curl", "curl|\\b21s\\b", ""],
    ["push_up", "pike (push|press)|planche press", ""],
    ["push_up", "push[- ]?up|press[- ]?up|pushup", ""],
    ["machine_chest_press", "(machine|lever|hammer strength|seated|plate[- ]loaded|iso[- ]lateral|stack|selectorized|cable).*chest press|chest press machine|machine (chest )?press|iso[- ]lateral (bench|chest|incline)", "Chest"],
    ["incline_press", "incline.*press|press.*incline|incline", "Chest|Triceps"],
    ["decline_press", "decline.*press|decline", "Chest|Triceps"],
    ["bench_press", "bench press|floor press|chest press|board press|pin press|close[- ]grip|press", "Chest|Triceps"],
    ["overhead_press_seated", "seated (overhead|shoulder|military|dumbbell shoulder|db shoulder|dumbbell press|alternate press|close grip press|cuban)|seated press|arnold|shoulder press machine|machine shoulder|lever shoulder|smith (overhead|shoulder|seated)", ""],
    ["overhead_press", "overhead press|military|shoulder press|push press|jerk|press\\b.*(overhead|shoulder)|z[- ]press|bradford|landmine press|viking|behind[- ]the[- ]neck|behind neck|cuban|scott press|bent press|sots|see[- ]?saw press|kettlebell press|strict press|w[- ]press|pin press|press under|plate press", ""],
    ["overhead_press", "press", "Shoulders"],
    ["v_up", "pull[- ]?ins?\\b|knee tuck", ""],
    ["swing", "\\bswings?\\b", ""],
    ["russian_twist", "twist|rotation", ""],
    ["rower", "rowing|rower|erg\\b", ""],
    ["cycle", "bike|cycl|\\bspin\\b|spinning|airdyne|assault", ""],
    ["run", "\\bruns?\\b|running|sprint|jog|treadmill|stair|elliptical|cross trainer|high knees", ""],
    ["walk", "walk|hike|hiking|ruck|march|stepper|arc trainer|adaptive motion|jacob'?s ladder|cardio", ""]
  ]/*END RULES*/;
  const KIT_WORDS = [["smith", "smith"], ["cable", "cable|pulley|\\brope (pushdown|crunch|curl|face|pull|extension|hammer|triceps?|row|attachment)|with rope|\\(rope"], ["band", "\\bband|resistance band|mini band"], ["trx", "\\btrx\\b|suspension|suspend|\\brings?\\b"],
    ["landmine", "landmine"], ["kettlebell", "kettlebell|\\bkb\\b"], ["dumbbell", "dumbbell|\\bdb\\b|\\bdbs\\b"], ["ball", "medicine ball|med ball|wall ball|slam ball|stability ball|swiss ball|bosu"],
    ["plate", "\\bplate\\b(?!.*loaded)"], ["barbell", "barbell|\\bbar\\b|ez[- ]?bar|ez curl|trap bar|hex bar|olympic|\\bbb\\b|safety bar|ssb|axle"],
    ["machine", "machine|lever|hammer strength|selectorized|plate[- ]loaded|iso[- ]lateral|pec deck|sled|hack|pendulum|leg press|leg extension|leg curl"],
    ["none", "body ?weight|bodyweight|\\bbw\\b|push[- ]?up|pull[- ]?up|chin[- ]?up|\\bdips?\\b|plank|crunch|sit[- ]?up|bridge|burpee|jump|air squat|pistol|nordic|inverted"]];
  const KIT_EQ = { "barbell": "barbell", "ez barbell": "barbell", "olympic barbell": "barbell", "trap bar": "barbell", "dumbbell": "dumbbell", "cable": "cable", "leverage machine": "machine",
    "smith machine": "smith", "kettlebell": "kettlebell", "body weight": "none", "assisted": "machine", "suspension trainer": "trx", "band": "band", "medicine ball": "ball",
    "stability ball": "ball", "weight plate": "plate", "landmine": "landmine", "sled machine": "machine", "rope": "cable", "wheel roller": "none", "weighted": "" };
  const EXACT = /*EXACT*/{
    "90/90 Hip Switches": ["pigeon", null],
    "Ankle Mobility Rocks": ["ankle_rock", null],
    "Arm Bike": ["arm_bike", null],
    "Arm Circles": ["arm_circles", null],
    "Band Shoulder Dislocates": ["dislocate", "band"],
    "Barbell Glute Bridges": ["glute_bridge_loaded", "barbell"],
    "Barbell Hack Squat": ["deadlift", "barbell"],
    "Barbell High Pulls": ["upright_row", "barbell"],
    "Bear Crawls": ["bear_crawl", null],
    "Bent-Over Twists": ["standing_twist", "stick"],
    "Bodyweight Triceps Extensions": ["push_up_incline", null],
    "Bodyweight Warm-Up Exercises": ["jumping_jack", null],
    "Broomstick Twists": ["standing_twist", "stick"],
    "Burpees": ["burpee", null],
    "Cable Chest Press": ["standing_press", "cable"],
    "Cable Curls (Straight Bar)": ["curl", "cable"],
    "Cable Hip Adduction": ["hip_adduction", "cable"],
    "Cable Leg Curls": ["standing_leg_curl", "cable"],
    "Cable Pull-Throughs": ["pull_through", "cable"],
    "Cable Rear Delt Rows": ["face_pull", "cable"],
    "Cable Scooped Chest Press": ["standing_press", "cable"],
    "Cable Y-Raises": ["y_raise", "cable"],
    "Calf Stretch": ["calf_stretch", null],
    "Cat-Cow": ["cat_cow", null],
    "Chest-Supported Row": ["chest_supported_row", "dumbbell"],
    "Child's Pose": ["child_pose", null],
    "Concentration Curls": ["concentration_curl", "dumbbell"],
    "Cossack Squats": ["lateral_lunge", "none"],
    "Cross-Body Shoulder Stretch": ["cross_body_stretch", null],
    "Cross-Body Triceps Extension": ["skull_crusher", "dumbbell"],
    "Crunch / Cable Woodchopper (Tabata)": ["crunch", "none"],
    "Dead Hangs": ["dead_hang", null],
    "Dead Landmines / Burpee (Tabata)": ["deadlift", "landmine"],
    "Dead Landmines / Jumping Jacks (Tabata)": ["deadlift", "landmine"],
    "Decline Cable Flyes": ["fly_lying", "cable"],
    "Decline Push-Ups": ["push_up_decline", null],
    "Deep Squat Hold": ["squat_hold", null],
    "Dive Bomber Push-Ups": ["pike_pushup", null],
    "Doorway Chest Stretch": ["doorway_stretch", null],
    "Dumbbell Floor Press": ["floor_press", "dumbbell"],
    "Dumbbell Glute Bridges": ["glute_bridge_loaded", "dumbbell"],
    "Dumbbell Leg Curls": ["leg_curl", "none"],
    "Dumbbell Lunge / Mountain Climbers (Tabata)": ["lunge", "dumbbell"],
    "Dumbbell Row": ["one_arm_row", "dumbbell"],
    "Dumbbell Squats": ["squat", "dumbbell"],
    "Dumbbell Sumo Squats": ["squat", "dumbbell"],
    "Elliptical": ["walk", null],
    "Flat Cable Flyes (Bench)": ["fly_lying", "cable"],
    "Floor Press": ["floor_press", "barbell"],
    "Front and Lateral Leg Swings": ["leg_swing", null],
    "Glute-Ham Raise (GHR)": ["nordic", null],
    "Glute-Ham Raises": ["nordic", null],
    "Gorilla Rows": ["bent_row", "kettlebell"],
    "Hammer Strength D.Y. Row": ["seated_row", "machine"],
    "Hammer Strength Flat Press": ["machine_chest_press", "machine"],
    "Hammer Strength Row": ["seated_row", "machine"],
    "Hamstring Stretch": ["toe_reach", null],
    "Handstand Push-Ups": ["handstand_pushup", null],
    "Heel Taps": ["crunch", "none"],
    "High Cable Curls": ["high_cable_curl", "cable"],
    "Hip Circles": ["hip_circles", null],
    "Hip Flexor Stretch": ["hip_flexor_stretch", null],
    "Hollow Body Hold (Time)": ["hollow_hold", null],
    "Inchworms": ["inchworm", null],
    "Incline Cable Flyes (Bench)": ["fly_incline", "cable"],
    "Incline Close-Grip Push-Ups": ["push_up_incline", null],
    "Incline Dumbbell Curls": ["incline_curl", "dumbbell"],
    "Incline Dumbbell Flyes": ["fly_incline", "dumbbell"],
    "Incline Dumbbell Row (Bilateral)": ["chest_supported_row", "dumbbell"],
    "Incline Hammer Curls": ["incline_curl", "dumbbell"],
    "Incline Leg Pull-Ins": ["knee_tuck", null],
    "Incline Push-Ups": ["push_up_incline", null],
    "Incline Treadmill Walk": ["walk", null],
    "Incline Two-Dumbbell Extension": ["skull_crusher", "dumbbell"],
    "Iso-Lateral Plate-Loaded Shoulder Press (Hammer Strength)": ["overhead_press_seated", "machine"],
    "Iso-Lateral Plate-Loaded T-Bar Row": ["chest_supported_row", "machine"],
    "Isometric Lateral Lunges": ["lateral_lunge", "none"],
    "Jumping Jacks": ["jumping_jack", null],
    "Kettlebell Swing / Smith Machine Hang Power Clean (Tabata)": ["swing", "kettlebell"],
    "Knee Push-Ups": ["push_up_knee", null],
    "Knee-to-Chest Stretch": ["knee_to_chest", null],
    "Kneeling Lat Stretch": ["child_pose", null],
    "Kneeling Single-Leg Curl Machine": ["standing_leg_curl", "machine"],
    "Kroc Rows": ["one_arm_row", "dumbbell"],
    "L-Sit Hold (Time)": ["l_sit", null],
    "Landmine Twists": ["landmine_twist", "landmine"],
    "Lateral Lunges": ["lateral_lunge", null],
    "Leg Press Calf Raises": ["calf_raise", "none"],
    "Leg Pull-Ins": ["knee_tuck", null],
    "Low Lunge Hold": ["hip_flexor_stretch", null],
    "Lower Body Foam Rolling": ["foam_roll_lower", null],
    "Lying Crossover Stretch": ["lying_twist", null],
    "Lying Hip Twist": ["lying_twist", null],
    "Machine Ab Crunches (Selectorized)": ["crunch", "none"],
    "Machine Incline Curl": ["preacher_curl", "machine"],
    "Meadows Row": ["bent_row", "landmine"],
    "Multi-Press Shoulder Machine": ["overhead_press_seated", "machine"],
    "Neck Crunches": ["neck_flexion", null],
    "Neck Crunches with Plate": ["neck_flexion", null],
    "Nordic Hamstring Curls": ["nordic", null],
    "Oblique Crunches": ["crunch", "none"],
    "One-Arm Dumbbell Lateral External Rotation": ["external_rotation", "dumbbell"],
    "One-Arm Dumbbell Upright External Rotation": ["external_rotation", "dumbbell"],
    "Overhead Carry": ["overhead_carry", "dumbbell"],
    "Overhead Triceps Stretch": ["triceps_stretch", null],
    "Pallof Press": ["pallof", "cable"],
    "Pigeon Stretch": ["pigeon", null],
    "Pike Push-Ups": ["pike_pushup", null],
    "Pistol Squats": ["pistol", null],
    "Plate-Loaded Biceps Curl Machine": ["preacher_curl", "machine"],
    "Machine Bicep Curl": ["preacher_curl", "machine"],
    "Prone Dumbbell Y-Raises": ["y_raise", "dumbbell"],
    "Prone IYT Raises": ["y_raise", "dumbbell"],
    "Prone Trap Raises": ["y_raise", "dumbbell"],
    "Push Up / Jumping Jacks (Tabata)": ["push_up", null],
    "Renegade Rows": ["renegade_row", "dumbbell"],
    "Reverse Cable Crossovers": ["reverse_fly", "cable"],
    "Reverse Crunch / Barbell Roll Out (Tabata)": ["leg_raise", "none"],
    "Reverse Hyperextensions": ["reverse_hyper", null],
    "Reverse Nordic Curls": ["reverse_nordic", null],
    "Reverse Plank": ["reverse_plank", null],
    "Ring Push-Ups": ["push_up", "none"],
    "Rotary Torso Machine": ["russian_twist", "none"],
    "Row Curls": ["curl", "barbell"],
    "Sandbag Carry": ["carry", "ball"],
    "Seal Rows (Cambered Bar/Bench)": ["chest_supported_row", "barbell"],
    "Seated Back Extension Machine": ["seated_back_extension", "machine"],
    "Seated Barbell Curls": ["curl_seated", "barbell"],
    "Seated Barbell Overhead Press": ["overhead_press_seated", "barbell"],
    "Seated Cable Shoulder Press": ["overhead_press_seated", "cable"],
    "Seated Calf Raises": ["seated_calf_raise", "machine"],
    "Seated Dumbbell Calf Raises": ["seated_calf_raise", "dumbbell"],
    "Seated Dumbbell Curls": ["curl_seated", "dumbbell"],
    "Seated Forward Toe Reach": ["toe_reach", null],
    "Seated Good Mornings": ["seated_good_morning", "barbell"],
    "Seated Knee Tucks": ["knee_tuck", null],
    "Seated Overhead Dumbbell Extension": ["overhead_triceps_seated", "dumbbell"],
    "Seated Reverse-Grip Barbell Press": ["overhead_press_seated", "barbell"],
    "Selectorized Triceps Extension Machine": ["pushdown", "machine"],
    "Single-Arm Cable Chest Press": ["standing_press", "cable"],
    "Single-Leg Hip Thrusts": ["hip_thrust", "none"],
    "Single-Leg RDL (Dumbbell/Kettlebell)": ["single_leg_rdl", "dumbbell"],
    "Sissy Squat Machine": ["sissy_squat", null],
    "Sissy Squats": ["sissy_squat", null],
    "SkiErg": ["straight_arm_pulldown", "cable"],
    "Slider Leg Curls": ["supine_leg_curl", null],
    "Smith Machine Behind-The-Neck Press": ["overhead_press_seated", "smith"],
    "Smith Machine Chest-Supported Row": ["chest_supported_row", "smith"],
    "Smith Machine Crunches": ["crunch", "none"],
    "Smith Machine Overhead Press": ["overhead_press_seated", "smith"],
    "Smith Machine Row": ["bent_row", "smith"],
    "Snatch-Grip Deadlift": ["deadlift", "barbell"],
    "Spider Curls": ["spider_curl", "barbell"],
    "Squat / Kettlebell Snatch (Tabata)": ["air_squat", "none"],
    "Stability Ball Crunches": ["crunch", "none"],
    "Stability Ball Leg Curls": ["ball_leg_curl", null],
    "Stairmaster": ["stairs", null],
    "Standing Hip Abductor Machine": ["hip_abduction", "machine"],
    "Standing Leg Curls": ["standing_leg_curl", "machine"],
    "Standing Quad Stretch": ["quad_stretch", null],
    "Steady State Cardio + Twists": ["walk", null],
    "Straight Bar Pushdown": ["pushdown", "cable"],
    "Svend Press": ["standing_press", "plate"],
    "T-Bar Machine Rows (Chest Supported)": ["chest_supported_row", "machine"],
    "T-Bar Row": ["bent_row", "landmine"],
    "Thoracic Rotations": ["thoracic_rotation", null],
    "Tibialis Raises": ["tibialis_raise", null],
    "Tire Flips": ["deadlift", "none"],
    "Toes-to-Bar": ["hanging_leg_raise", "none"],
    "Towel Hangs": ["dead_hang", null],
    "Treadmill or Bike (Warm-Up)": ["walk", null],
    "Upper Body Foam Rolling": ["foam_roll_upper", null],
    "VersaClimber": ["stairs", null],
    "Waiter Curls": ["curl", "dumbbell"],
    "Wall Sit": ["wall_sit", null],
    "Wall Slides": ["wall_slide", null],
    "Weighted Crunches": ["crunch", "plate"],
    "Weighted Decline Sit-Ups": ["sit_up", "plate"],
    "Weighted Russian Twists": ["russian_twist", "plate"],
    "Weighted Sit-Ups": ["sit_up", "plate"],
    "World's Greatest Stretch": ["worlds_greatest", null],
    "Z Press": ["overhead_press_seated", "barbell"]
  }/*END EXACT*/;
  const EXL = new Map(Object.entries(EXACT).map(([k, v]) => [k.toLowerCase(), v]));
  const RX = RULES.map(([id, rx, cat]) => [id, new RegExp(rx, "i"), cat ? new RegExp("^(" + cat + ")$", "i") : null]);
  const KX = KIT_WORDS.map(([k, rx]) => [k, new RegExp(rx, "i")]);

  function entryOf(name) {
    try { const e = PT.exCanon && PT.exCanon(name); if (e) return e; } catch (er) { }
    try { const n = String(name).toLowerCase(); return (window.EXERCISE_DATABASE || []).find(x => x.name.toLowerCase() === n) || (window.OPENGYM_EXERCISES || []).find(x => x.name.toLowerCase() === n) || null; } catch (er) { return null; }
  }
  const cache = new Map();
  // 3.9.0: PulseTrack's own exercises are looked up by exact name first (EXACT: name -> [movement, kit or null]), then the rules
  function classify(name) {
    const key = String(name || ""); if (cache.has(key)) return cache.get(key);
    const found = entryOf(key), e = found || {}, cat = e.category || "", nm = key;
    let id = null, forced = null;
    const ex = EXL.get(nm.toLowerCase());
    if (ex) { id = ex[0]; forced = ex[1] || null; }
    else for (const [pid, rx, crx] of RX) { if (rx.test(nm) && (!crx || crx.test(cat))) { id = pid; break; } }
    if (id === "none") id = null;
    let out = null;
    if (id && PATTERNS[id]) {
      const kit = forced || kitOf(key, e, id), alt = PATTERNS[id].alt;
      out = { id, kit, draw: alt && alt[kit] && PATTERNS[alt[kit]] ? alt[kit] : id };
    }
    if (found || !key) cache.set(key, out);   // an exercise not loaded yet (openGym loads after start-up) is asked again later
    return out;
  }
  function kitOf(name, e, id) {
    e = e || entryOf(name) || {}; id = id || ((classify(name) || {}).id);
    const pat = PATTERNS[id] || {};
    for (const [k, rx] of KX) if (rx.test(name)) return fits(k, pat);
    const q = KIT_EQ[String(e.eq || "").toLowerCase()];
    if (q) return fits(q, pat);
    return pat.kit || "none";
  }
  // movements that can't hold some kit keep their own (a push-up named with "band" still shows the push-up)
  const fits = (k, pat) => pat.kits === "none" ? "none" : Array.isArray(pat.kits) && !pat.kits.includes(k) ? (pat.kit || "none") : k;

  /* ================================================================ rendering */
  function frameParts(id, f, kit) {
    const pat = PATTERNS[id], kp = pat.kitPose && pat.kitPose[kit];
    let fr = pat.frames[Math.min(f, pat.frames.length - 1)];
    if (kp) fr = Object.assign({}, fr, Array.isArray(kp) ? kp[Math.min(f, kp.length - 1)] : kp);   // e.g. a barbell lunge carries the bar on the back
    if (pat.mirror && fr.mirror == null) fr = Object.assign({}, fr, { mirror: true });
    const j = settle(pose(fr, pat.view), Object.assign({ floor: pat.floor !== false && fr.floor !== false && (fr.floor || pat.floor) }, fr));
    j.frame = f;
    return { j, fr };
  }
  function bbox(parts) {
    let x1 = 1e9, y1 = 1e9, x2 = -1e9, y2 = -1e9;
    const pt = (p, pad) => { x1 = Math.min(x1, p[0] - pad); y1 = Math.min(y1, p[1] - pad); x2 = Math.max(x2, p[0] + pad); y2 = Math.max(y2, p[1] + pad); };
    parts.forEach(s => {
      if (s.k === "l") { pt(s.a, s.w / 2); pt(s.b, s.w / 2); }
      else if (s.k === "p") s.pts.forEach(p => pt(p, s.w / 2));
      else if (s.k === "c") pt(s.at, s.r + (s.sw || 0) / 2);
      else if (s.k === "r") { pt([s.x, s.y], 1); pt([s.x + s.w, s.y + s.h], 1); }
      else if (s.k === "g" || s.k === "sm") s.pts.forEach(p => pt(p, (s.sw || 0) / 2 + (s.k === "sm" ? 1.5 : 0)));
    });
    return [x1, y1, x2, y2];
  }
  const fitCache = new Map();
  function layout(id, kit) {
    const key = id + "|" + kit; if (fitCache.has(key)) return fitCache.get(key);
    const pat = PATTERNS[id], frames = pat.frames.map((_, f) => frameParts(id, f, kit));
    const props = pat.props ? pat.props(frames[0].j, kit) : [];
    const all = props.slice();
    frames.forEach((fp, f) => { all.push(...person(fp.j), ...kitAt(kit, fp.j, pat, f), ...(pat.dyn ? pat.dyn(fp.j, kit) : [])); });
    const floorOn = pat.floor !== false && pat.frames.some(fr => fr.floor !== false);
    const [x1, y1, x2, y2] = bbox(all.concat(floorOn ? [L([160, FLOOR], [160, FLOOR], C.floor, 3)] : []));
    const M = 14, s = Math.min(1, (W - 2 * M) / (x2 - x1), (H - 2 * M) / (y2 - y1));
    const tx = (W - (x2 - x1) * s) / 2 - x1 * s, ty = floorOn ? (H - M + 2) - FLOOR * s - Math.max(0, (y2 - FLOOR)) * s : (H - (y2 - y1) * s) / 2 - y1 * s;
    const ty2 = Math.max(M - y1 * s, Math.min(ty, H - M - y2 * s));
    const out = { s, tx, ty: ty2, frames, props, floorOn };
    fitCache.set(key, out); return out;
  }
  const n1 = v => Math.round(v * 10) / 10;
  function emit(parts) {
    return parts.map(s => {
      if (s.k === "l") return `<line x1="${n1(s.a[0])}" y1="${n1(s.a[1])}" x2="${n1(s.b[0])}" y2="${n1(s.b[1])}" stroke="${s.c}" stroke-width="${s.w}" stroke-linecap="round"/>`;
      if (s.k === "p") return `<polyline points="${s.pts.map(p => n1(p[0]) + "," + n1(p[1])).join(" ")}" fill="none" stroke="${s.c}" stroke-width="${s.w}" stroke-linecap="round" stroke-linejoin="round"/>`;
      if (s.k === "c") return `<circle cx="${n1(s.at[0])}" cy="${n1(s.at[1])}" r="${s.r}" fill="${s.fill}"${s.fo ? ` fill-opacity="${s.fo}"` : ""} stroke="${s.stroke}" stroke-width="${s.sw}"/>`;
      if (s.k === "g") return `<polygon points="${s.pts.map(p => n1(p[0]) + "," + n1(p[1])).join(" ")}" fill="${s.fill}"${s.sw ? ` stroke="${s.stroke}" stroke-width="${s.sw}" stroke-linejoin="round"` : ""}/>`;
      if (s.k === "sm") return `<path d="${smoothD(s.pts)}" fill="${s.fill}" stroke="${s.stroke}" stroke-width="${s.sw}" stroke-linejoin="round"/>`;
      if (s.k === "r") return `<rect x="${n1(s.x)}" y="${n1(s.y)}" width="${n1(s.w)}" height="${n1(s.h)}" rx="${s.rx}" fill="${C.kitFill}" stroke="${C.kit}" stroke-width="2"/>`;
      if (s.k === "path") return `<path d="${s.d}" fill="none" stroke="${s.c}" stroke-width="${s.w}" stroke-linecap="round"/>`;
      return "";
    }).join("");
  }
  const KIT_NAME = { barbell: "barbell", smith: "Smith machine", dumbbell: "dumbbells", kettlebell: "kettlebell", cable: "cable", band: "band", trx: "suspension straps", landmine: "landmine", ball: "ball", plate: "plate", machine: "machine", stick: "stick", none: "" };
  // 3.12.0: opts.hi = { region: 0..100 } fills the worked muscles; a two-pose movement says "Start" on the first picture and "Halfway"
  // on the second (where you turn round and come back), (opts.ghost: the start pose faint behind it); a held position says "Hold"
  const MOVING = /running|walking|cycling|jump rope|stair|rowing|arm bike|march|swimming|sled/i;
  function frameLabel(pat, f) {
    if (pat.frames.length < 2 || pat.hold) return MOVING.test(pat.label) ? "" : "Hold";
    return f ? (pat.f1 || "Halfway") : "Start";
  }
  function svg(id, f, kit, opts) {
    const pat = PATTERNS[id]; if (!pat) return "";
    kit = kit || pat.kit || "none"; opts = opts || {};
    const lay = layout(id, kit), fp = opts.j ? { j: opts.j } : lay.frames[Math.min(f, lay.frames.length - 1)];   // 3.13.0: opts.j = a pose in between (motion)
    if (opts.j) f = opts.j.frame || 0;
    const kp = kitAt(kit, fp.j, pat, f), behind = pat.behind ? kp : kp.filter(x => x.back), over = pat.behind ? [] : kp.filter(x => !x.back);
    const ghost = f && pat.frames.length > 1 && !pat.hold && opts.ghost === true ? `<g opacity="0.2">${emit(person(lay.frames[0].j, null, true))}</g>` : "";
    const body = emit(lay.props) + ghost + emit(behind) + emit(person(fp.j, opts.hi)) + emit(over) + emit(pat.dyn ? pat.dyn(fp.j, kit) : []);
    const floor = lay.floorOn ? `<line x1="16" y1="${n1(FLOOR * lay.s + lay.ty)}" x2="${W - 16}" y2="${n1(FLOOR * lay.s + lay.ty)}" stroke="${C.floor}" stroke-width="3" stroke-linecap="round"/>` : "";
    const lab = opts.label === false ? "" : frameLabel(pat, f);
    const tag = lab ? `<rect x="10" y="10" width="${Math.round(lab.length * 7.4 + 18)}" height="22" rx="11" fill="#27272a"/><text x="${Math.round(19)}" y="25" font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif" font-size="12.5" font-weight="700" fill="#e4e4e7">${esc(lab)}</text>` : "";
    const title = `${cap(pat.label)}${KIT_NAME[kit] ? " with " + KIT_NAME[kit] : ""}: ${f ? "finish" : "start"}`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(title)}"><title>${esc(title)}. Drawing: PulseTrack, made by the app.</title><rect width="${W}" height="${H}" rx="14" fill="${C.bg}"/>${floor}<g transform="translate(${n1(lay.tx)} ${n1(lay.ty)}) scale(${Math.round(lay.s * 1000) / 1000})">${body}</g>${tag}</svg>`;
  }
  /* ================================================================ 3.13.0: the move as a short loop
   *  Poses in between Start and Halfway: the hip (or pelvis) slides, every bone turns about its joint and keeps its length, the
   *  hands' grips and the toes follow their joint. motion(name) -> [data URLs from Start to Halfway, eased], or null for a held
   *  position or a single picture. Module 134 plays them forwards and back in Step by step. */
  const BONES = { side: [["shoulder", "hip"], ["head", "shoulder"], ["elbow", "shoulder"], ["hand", "elbow"], ["knee", "hip"], ["ankle", "knee"], ["toe", "ankle"],
      ["elbow2", "shoulder"], ["hand2", "elbow2"], ["knee2", "hip"], ["ankle2", "knee2"], ["toe2", "ankle2"]],
    front: [["neck", "pel"], ["head", "neck"], ["shL", "neck"], ["shR", "neck"], ["elL", "shL"], ["haL", "elL"], ["elR", "shR"], ["haR", "elR"],
      ["hipL", "pel"], ["hipR", "pel"], ["knL", "hipL"], ["anL", "knL"], ["knR", "hipR"], ["anR", "knR"]] };
  const ANCHOR = { grip: "hand", grip2: "hand2", toR: "anR", toL: "anL" };
  function tween(a, b, t) {
    const front = a.view === "front", root = front ? "pel" : "hip", j = {}, done = [root], pt2 = v => Array.isArray(v) && v.length === 2 && typeof v[0] === "number";
    Object.keys(b).forEach(k => { if (!pt2(b[k])) j[k] = b[k]; });
    j[root] = [a[root][0] + (b[root][0] - a[root][0]) * t, a[root][1] + (b[root][1] - a[root][1]) * t];
    BONES[front ? "front" : "side"].forEach(([c, p]) => {
      if (!pt2(a[c]) || !pt2(b[c]) || !j[p]) return;
      const aa = Math.atan2(a[c][1] - a[p][1], a[c][0] - a[p][0]), ab = Math.atan2(b[c][1] - b[p][1], b[c][0] - b[p][0]);
      let d = ab - aa; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
      const la = dist(a[c], a[p]), lb = dist(b[c], b[p]), ang = aa + d * t, len = la + (lb - la) * t;
      j[c] = [j[p][0] + Math.cos(ang) * len, j[p][1] + Math.sin(ang) * len]; done.push(c);
    });
    const follow = (k, by) => { const oa = [a[k][0] - a[by][0], a[k][1] - a[by][1]], ob = [b[k][0] - b[by][0], b[k][1] - b[by][1]];
      j[k] = [j[by][0] + oa[0] + (ob[0] - oa[0]) * t, j[by][1] + oa[1] + (ob[1] - oa[1]) * t]; };
    const rest = Object.keys(b).filter(k => pt2(b[k]) && pt2(a[k]) && !done.includes(k));
    // names for the same point first (the front view also keeps hand, elbow, hip ... for the kit), then grips and toes
    rest.forEach(k => { const same = done.find(d => dist(a[k], a[d]) < 0.5 && dist(b[k], b[d]) < 0.5); if (same) { j[k] = j[same].slice(); done.push(k); } });
    rest.filter(k => !done.includes(k)).forEach(k => {
      let by = ANCHOR[k] && j[ANCHOR[k]] ? ANCHOR[k] : null;
      if (!by) { let bd = 1e9; done.forEach(d => { const v = dist(a[k], a[d]); if (v < bd) { bd = v; by = d; } }); }
      follow(k, by);
    });
    j.frame = t < 0.5 ? 0 : 1;
    return j;
  }
  const MOTION = new Map();
  // all: also for exercises with their own pictures (3.17.0's rep counter shows the move for those too)
  function motion(name, n = 8, all = false) {
    const key = String(name || "") + (all ? "\u0000all" : ""); if (MOTION.has(key)) return MOTION.get(key);
    let out = null;
    const c = classify(String(name || "")), id = c && (c.draw || c.id), pat = id && PATTERNS[id];
    if (pat && pat.frames.length > 1 && !pat.hold && (all || !(PT.exGuide && (PT.exGuide(String(name || "")) || {}).steps))) {
      const lay = layout(id, c.kit), a = lay.frames[0].j, b = lay.frames[1].j, hi = hiOf(String(name || ""));
      out = [];
      for (let i = 0; i <= n; i++) { const e = 0.5 - 0.5 * Math.cos(Math.PI * i / n); out.push(dataUrl(svg(id, 0, c.kit, { hi, j: tween(a, b, e), label: false }))); }
    }
    if (MOTION.size > 40) MOTION.clear();
    MOTION.set(key, out); return out;
  }
  // the regions to fill for an exercise: its main muscles strong, the helping ones lighter
  function hiOf(name) {
    let ms = null;
    try { const g = PT.exGuide && PT.exGuide(name); ms = g && g.muscles && g.muscles.length ? g.muscles : PT.musclesOf ? (PT.musclesOf(name) || {}).muscles : null; } catch (e) { ms = null; }
    const hi = {};
    (ms || []).forEach(m => { const r = REGION_OF[m.muscle_id]; if (!r) return; const v = m.role === "primary" ? 100 : Math.min(55, m.intensity || 40); hi[r] = Math.max(hi[r] || 0, v); });
    return hi;
  }
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  // the movement arrow, as fractions of the picture (the same form as the hand-made guides' arrows)
  function arrow(id, kit, from, to, label) {
    const pat = PATTERNS[id], lay = layout(id, kit), k = pat.joint || "hand";
    const A = lay.frames[from].j[k], B = lay.frames[to].j[k]; if (!A || !B) return null;
    const T = p => [p[0] * lay.s + lay.tx, p[1] * lay.s + lay.ty];
    let a = T(A), b = T(B); const len = dist(a, b); if (len < 18) return null;
    const jj = lay.frames[from].j, mid = T([(jj.hip[0] + jj.shoulder[0]) / 2, (jj.hip[1] + jj.shoulder[1]) / 2]);
    let nx = -(b[1] - a[1]) / len, ny = (b[0] - a[0]) / len; const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    if ((m[0] + nx - mid[0]) ** 2 + (m[1] + ny - mid[1]) ** 2 < (m[0] - nx - mid[0]) ** 2 + (m[1] - ny - mid[1]) ** 2) { nx = -nx; ny = -ny; }
    const off = pat.off == null ? 20 : pat.off, ux = (b[0] - a[0]) / len, uy = (b[1] - a[1]) / len, sh = Math.min(6, len * 0.1);
    a = [a[0] + nx * off + ux * sh, a[1] + ny * off + uy * sh]; b = [b[0] + nx * off - ux * sh, b[1] + ny * off - uy * sh];
    const cl = (v, hi) => Math.round(Math.max(0.03, Math.min(0.97, v / hi)) * 1000) / 1000;
    return { from: [cl(a[0], W), cl(a[1], H)], to: [cl(b[0], W), cl(b[1], H)], label: label || "" };
  }
  const dataUrl = s => "data:image/svg+xml;charset=utf-8," + encodeURIComponent(s);
  const BACK = /^(then |and |now |slowly |with control,? |under control,? )?(lower|return|go back|come back|come down|bring (it|them|the \w+) back|reverse|release|reset|let (it|them|the \w+) (come|go|lower|return|swing back))\b/i;

  // steps for an exercise without its own guide pictures: each step gets the start or finish drawing and the arrow
  function forSteps(name, steps) {
    const c = classify(name); if (!c) return null;
    const id = c.draw || c.id, pat = PATTERNS[id], two = pat.frames.length > 1 && !pat.hold;
    const list = steps && steps.length ? steps.slice() : [{ text: pat.start }, { text: pat.end }];
    const hi = hiOf(name);
    const pic = f => ({ src: dataUrl(svg(id, f, c.kit, { hi })), license: "original", author: "PulseTrack", generated: true, movement: pat.label,
      attribution: "Drawn by the app for this kind of movement", alt: `${cap(pat.label)}: ${f ? "finish" : "start"}` });
    const pics = [pic(0), two ? pic(1) : null];
    const go = two ? arrow(id, c.kit, 0, 1, pat.go) : null, back = two && pat.back ? arrow(id, c.kit, 1, 0, pat.back) : null;
    // 3.9.0: a step that starts with the movement's own word ("Lower" in a bench press) shows the finish; one that starts with the way
    // back ("Lower" in a curl) shows the start; otherwise the BACK words decide
    const word = t => (String(t || "").trim().toLowerCase().replace(/^(then|and|now|slowly|with control,?|under control,?)\s+/, "").match(/^[a-z]+/) || [""])[0];
    const goW = word(pat.go), backW = word(pat.back);
    return list.map((st, i) => {
      const w = word(st.text);
      const f = !two || i === 0 ? 0 : w && w === goW ? 1 : w && w === backW ? 0 : BACK.test(String(st.text || "").trim()) ? 0 : 1;
      return Object.assign({}, st, { image: f ? pics[1] : pics[0], arrows: (f ? (back ? [back] : []) : (go ? [go] : [])) });
    });
  }

  PT.figure = { classify, svg, forSteps, kitOf, arrow, PATTERNS, RULES, layout, hiOf, REGION_OF, tween, motion };
})();
