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
  const LEN = { t: 54, neck: 24, ua: 31, fa: 29, th: 46, sh: 45, ft: 15, wr: 9 };
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
    const t = p.t == null ? 90 : p.t, j = { view: "side", hip: p.hip ? p.hip.slice() : [160, 106] };
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
    const j = { view: "front" }, tl = p.tl || 0, pel = p.pel ? p.pel.slice() : [160, 106];
    j.pel = pel; j.neck = add(pel, 90 - tl, LEN.t * (p.tS || 1)); j.head = add(j.neck, 90 - tl, LEN.neck - 2);
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

  function person(j) {
    const out = [];
    if (j.view === "front") {
      out.push(P([j.anL, j.knL, j.hipL], C.body, 11), L(j.anL, j.toL, C.body, 7), P([j.anR, j.knR, j.hipR], C.body, 11), L(j.anR, j.toR, C.body, 7));
      out.push(L(j.hipL, j.hipR, C.body, 12), L(j.pel, j.neck, C.body, 16), L(j.shL, j.shR, C.body, 11));
      out.push(O(j.head, 12, C.body, C.bg, 2.5));
      out.push(P([j.shL, j.elL, j.haL], C.body, 9), P([j.shR, j.elR, j.haR], C.body, 9));
      return out;
    }
    if (!same(j.knee2, j.knee) || !same(j.ankle2, j.ankle)) out.push(P([j.ankle2, j.knee2, j.hip], C.far, 10), L(j.ankle2, j.toe2, C.far, 7));
    if (!same(j.hand2, j.hand) || !same(j.elbow2, j.elbow)) out.push(P([j.shoulder, j.elbow2, j.hand2], C.far, 8));
    out.push(P([j.ankle, j.knee, j.hip], C.body, 11), L(j.ankle, j.toe, C.body, 8), L(j.hip, j.shoulder, C.body, 14));
    const arm = [P([j.shoulder, j.elbow, j.hand], C.body, 9)]; if (j.grip !== j.hand) arm.push(L(j.hand, j.grip, C.body, 7));
    const head = O(j.head, 12, C.body, C.bg, 2.5);
    // an arm raised past the face is drawn over the head
    if (j.hand[1] < j.shoulder[1] - 8 && Math.abs(j.hand[0] - j.head[0]) < 26) out.push(head, ...arm); else out.push(...arm, head);
    return out;
  }

  /* kit in the hands. side view: a barbell is seen end on (a plate), a dumbbell is a small one; front view: bars run across */
  function kitAt(kind, j, pat, f) {
    const g = pat.from === "ankle" ? (j.view === "front" ? j.anR : j.ankle) : j.grip, g2 = j.grip2 || j.hand2, out = [], front = j.view === "front";
    const plate = (c, r) => [O(c, r, C.plateFill, C.plate, 3), O(c, 3, C.plate, C.plate, 0)];
    const dumb = c => front ? [L([c[0] - 8, c[1]], [c[0] + 8, c[1]], C.plate, 3), Rc(c[0] - 13, c[1] - 7, 6, 14, 2), Rc(c[0] + 7, c[1] - 7, 6, 14, 2)] : [O(c, 8, C.plateFill, C.plate, 2.5)];
    const bell = c => [{ k: "path", d: `M${c[0] - 5} ${c[1] + 2} Q${c[0]} ${c[1] - 6} ${c[0] + 5} ${c[1] + 2}`, c: C.plate, w: 2.5 }, O([c[0], c[1] + 11], 9, C.plateFill, C.plate, 2.5)];
    switch (kind) {
      case "barbell": case "smith":
        if (front) { const y = (g[1] + g2[1]) / 2, x1 = Math.min(g[0], g2[0]) - 34, x2 = Math.max(g[0], g2[0]) + 34; out.push(L([x1, y], [x2, y], C.plate, 4), Rc(x1 - 4, y - 16, 9, 32, 2), Rc(x2 - 5, y - 16, 9, 32, 2)); }
        else out.push(...plate(g, pat.plate || 15));
        if (kind === "smith" && !front) out.unshift(L([g[0] + 1, FLOOR], [g[0] + 1, Math.min(g[1] - 40, 20)], C.kit, 4));
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
      case "landmine": out.push(L(g, [g[0] - 110, FLOOR - 4], C.plate, 4), ...plate(g, 11)); break;
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
      frames: [{ hand: [172, 116], eb: -1, floor: true }, { hand: [172, 66], eb: -1, uaS: 1, floor: true }] },
    shrug: { label: "shrug", view: "front", kit: "dumbbell", go: "shrug up", back: "lower", joint: "shoulder",
      start: "Stand tall with the weights hanging at your sides.", end: "Lift your shoulders straight up towards your ears, hold, then lower.",
      frames: [{ ua: -88, fa: -90, floor: true }, { ua: -88, fa: -90, lift: 9, floor: true }] },
    reverse_fly: { label: "reverse fly", view: "front", kit: "dumbbell", go: "open wide", back: "back in", joint: "hand",
      start: "Arms out in front of you, a soft bend in the elbows (bent over or on a machine).", end: "Open your arms out wide, squeezing your shoulder blades, then come back.",
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
      frames: [S({ hip: [126, 150], t: 36, ankle: [164, 196], hand: [172, 178], eb: 1 }), S({ hand: [170, 128], eb: 1 })] },
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
      frames: [S({ hip: [126, 150], t: 36, ankle: [164, 196], hand: [172, 178], eb: 1 }), S({ handOn: ['shoulder', 0, -15], eb: -1 })] },
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
      frames: [{ ua: -86, fa: -88, handL: [138, 98], ebL: 1, floor: true }, { tl: 16, ua: -100, fa: -100, handL: [146, 96], ebL: 1, floor: true }] },
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

  /* ================================================================ which drawing an exercise gets (shared with tools/guides_data.py) */
  const RULES = /*RULES*/[
    ["none", "neck (extension|flexion|raise|bridge|head|curl|harness|twist)|side neck|neck bridge|cervical|scapular (adduction|retraction|protraction)|gripper|grip squeeze|pinch|pronation|supination|swimming|shadow box|heavy bag|battle ?rope|battling rope(?!.*slam)|sled (push|pull)", ""],
    ["stretch", "stretch|mobility|foam roll|\\brolling\\b|yoga|cat[- ]?cow|child'?s pose|downward dog|leg swings?|arm swings?|arm circles?|hip circles?|dislocates?|90/90|inchworm|world'?s greatest|warm[- ]?up|wall slide|toe reach|scapula raise", ""],
    ["side_plank", "side plank|copenhagen|side bridge|side floor tap", ""],
    ["plank", "\\bplank\\b(?!.*(walk|up\\b|row|to push))|hollow (body )?hold|bear crawl|stir the pot", ""],
    ["mountain_climber", "mountain climber|climbers?\\b|cross body knee", ""],
    ["ab_wheel", "ab wheel|rollout|roll[- ]out|wheel roll|barbell roll", ""],
    ["dead_bug", "dead ?bug", ""],
    ["bird_dog", "bird ?dog|quadruped", ""],
    ["superman", "superman|prone (back )?extension|swimmers?\\b|reverse snow angel", ""],
    ["mountain_climber", "ball pull[- ]?ins?|ball knee tuck|ball jack ?knife", ""],
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
    ["carry", "carry|farmer|suitcase|yoke|waiter", ""],
    ["front_squat", "front squat|zercher|overhead squat", ""],
    ["squat", "squat|hack|pistol|wall sit|belt squat|pendulum", ""],
    ["face_pull", "face pull", ""],
    ["pullover", "pullover|pull[- ]over", ""],
    ["straight_arm_pulldown", "straight[- ]arm|stiff[- ]arm", ""],
    ["lat_pulldown", "pulldown|pull[- ]down|lat pull", ""],
    ["pull_up", "pull[- ]?up|chin[- ]?up|chin\\b|muscle[- ]up|dead hang|\\bhangs?\\b|rope climb", ""],
    ["inverted_row", "inverted row|ring row|trx row|suspension row|suspended row|australian|body ?weight row|table row", ""],
    ["seated_row", "seated (cable |machine |lever |)row|cable row|low row|machine row|lever row|rowing machine row|seated row|iso[- ]lateral row|high row|chest supported row", ""],
    ["upright_row", "upright row", ""],
    ["bent_row", "\\brows?\\b|t[- ]bar|kroc|pendlay|yates|meadows|seal row", ""],
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
  const RX = RULES.map(([id, rx, cat]) => [id, new RegExp(rx, "i"), cat ? new RegExp("^(" + cat + ")$", "i") : null]);
  const KX = KIT_WORDS.map(([k, rx]) => [k, new RegExp(rx, "i")]);

  function entryOf(name) {
    try { const e = PT.exCanon && PT.exCanon(name); if (e) return e; } catch (er) { }
    try { const n = String(name).toLowerCase(); return (window.EXERCISE_DATABASE || []).find(x => x.name.toLowerCase() === n) || (window.OPENGYM_EXERCISES || []).find(x => x.name.toLowerCase() === n) || null; } catch (er) { return null; }
  }
  const cache = new Map();
  function classify(name) {
    const key = String(name || ""); if (cache.has(key)) return cache.get(key);
    const found = entryOf(key), e = found || {}, cat = e.category || "", nm = key;
    let id = null;
    for (const [pid, rx, crx] of RX) { if (rx.test(nm) && (!crx || crx.test(cat))) { id = pid; break; } }
    if (id === "none") id = null;
    const out = id && PATTERNS[id] ? { id, kit: kitOf(key, e, id) } : null;
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
  const fits = (k, pat) => pat.kits === "none" ? "none" : k;

  /* ================================================================ rendering */
  function frameParts(id, f, kit) {
    const pat = PATTERNS[id], fr = pat.frames[Math.min(f, pat.frames.length - 1)];
    const j = settle(pose(fr, pat.view), Object.assign({ floor: pat.floor !== false && fr.floor !== false && (fr.floor || pat.floor) }, fr));
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
    });
    return [x1, y1, x2, y2];
  }
  const fitCache = new Map();
  function layout(id, kit) {
    const key = id + "|" + kit; if (fitCache.has(key)) return fitCache.get(key);
    const pat = PATTERNS[id], frames = pat.frames.map((_, f) => frameParts(id, f, kit));
    const props = pat.props ? pat.props(frames[0].j, kit) : [];
    const all = props.slice();
    frames.forEach((fp, f) => { all.push(...person(fp.j), ...kitAt(kit, fp.j, pat, f), ...(pat.dyn ? pat.dyn(fp.j) : [])); });
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
      if (s.k === "c") return `<circle cx="${n1(s.at[0])}" cy="${n1(s.at[1])}" r="${s.r}" fill="${s.fill}" stroke="${s.stroke}" stroke-width="${s.sw}"/>`;
      if (s.k === "r") return `<rect x="${n1(s.x)}" y="${n1(s.y)}" width="${n1(s.w)}" height="${n1(s.h)}" rx="${s.rx}" fill="${C.kitFill}" stroke="${C.kit}" stroke-width="2"/>`;
      if (s.k === "path") return `<path d="${s.d}" fill="none" stroke="${s.c}" stroke-width="${s.w}" stroke-linecap="round"/>`;
      return "";
    }).join("");
  }
  const KIT_NAME = { barbell: "barbell", smith: "Smith machine", dumbbell: "dumbbells", kettlebell: "kettlebell", cable: "cable", band: "band", trx: "suspension straps", landmine: "landmine", ball: "ball", plate: "plate", machine: "machine", none: "" };
  function svg(id, f, kit) {
    const pat = PATTERNS[id]; if (!pat) return "";
    kit = kit || pat.kit || "none";
    const lay = layout(id, kit), fp = lay.frames[Math.min(f, lay.frames.length - 1)];
    const behind = pat.behind ? kitAt(kit, fp.j, pat, f) : [], over = pat.behind ? [] : kitAt(kit, fp.j, pat, f);
    const body = emit(lay.props) + emit(behind) + emit(person(fp.j)) + emit(over) + emit(pat.dyn ? pat.dyn(fp.j) : []);
    const floor = lay.floorOn ? `<line x1="16" y1="${n1(FLOOR * lay.s + lay.ty)}" x2="${W - 16}" y2="${n1(FLOOR * lay.s + lay.ty)}" stroke="${C.floor}" stroke-width="3" stroke-linecap="round"/>` : "";
    const title = `${cap(pat.label)}${KIT_NAME[kit] ? " with " + KIT_NAME[kit] : ""}: ${f ? "finish" : "start"}`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(title)}"><title>${esc(title)}. Drawing: PulseTrack, made by the app.</title><rect width="${W}" height="${H}" rx="14" fill="${C.bg}"/>${floor}<g transform="translate(${n1(lay.tx)} ${n1(lay.ty)}) scale(${Math.round(lay.s * 1000) / 1000})">${body}</g></svg>`;
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
    const pat = PATTERNS[c.id], two = pat.frames.length > 1 && !pat.hold;
    const list = steps && steps.length ? steps.slice() : [{ text: pat.start }, { text: pat.end }];
    const pic = f => ({ src: dataUrl(svg(c.id, f, c.kit)), license: "original", author: "PulseTrack", generated: true, movement: pat.label,
      attribution: "Drawn by the app for this kind of movement", alt: `${cap(pat.label)}: ${f ? "finish" : "start"}` });
    const pics = [pic(0), two ? pic(1) : null];
    const go = two ? arrow(c.id, c.kit, 0, 1, pat.go) : null, back = two && pat.back ? arrow(c.id, c.kit, 1, 0, pat.back) : null;
    return list.map((st, i) => {
      const f = !two || i === 0 || BACK.test(String(st.text || "").trim()) ? 0 : 1;
      return Object.assign({}, st, { image: f ? pics[1] : pics[0], arrows: (f ? (back ? [back] : []) : (go ? [go] : [])) });
    });
  }

  PT.figure = { classify, svg, forSteps, kitOf, arrow, PATTERNS, RULES, layout };
})();
