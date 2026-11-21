/* =====================================================================
 * PulseTrack 3.10.0: what the equipment looks like.
 *  Every exercise sheet gets an "Equipment" section: a drawing of the machine, bench, rack or cardio machine on its own, its name,
 *  how to spot it, and (Settings > Gyms & Equipment > LA Fitness) a note on what it usually is at LA Fitness. The drawings are original line
 *  drawings made by this code (no photos, no logos); "Add a photo of it at your gym" keeps your own photo of the real machine on this
 *  phone and shows it for every exercise that uses that machine.
 *  Which equipment: PT.figure.classify (movement + kit, module 137) plus words in the name ("Hammer Strength", "Smith", "cable" ...).
 *  LA Fitness notes come from a published comparison (powerliftingtechnique.com, "LA Fitness vs Life Time Fitness"): machines from
 *  Hammer Strength, Life Fitness, Matrix and Star Trac; dumbbells to 120 lb; preloaded EZ and straight bars; bench press stations;
 *  squat racks and deadlift platforms; Concept2 rowers and Keiser bikes in the cycling studio. Clubs differ; the notes say so.
 *  settings.gymChain = "lafitness" | "any" (unset: on when the gym you train at is named "LA Fitness");
 *  settings.equipPhotos = { equipment id: photo id in the guide photo store (module 134) } (the photos themselves stay on the phone, like step photos).
 *  PT.equip = { of(name), svg(id), EQUIP }.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined" || !PT.figure || !PT.guideSteps) return;
  const proto = ApplicationUI.prototype, A = () => window.app, $ = id => document.getElementById(id), esc = s => PT.esc(s);
  const W = 320, H = 240, F = 210;
  const K = "#8f8f99", KD = "#71717a", PADF = "#3f3f46", PADS = "#a1a1aa", LITE = "#e4e4e7", PL = "#a1a1aa", PLF = "#52525b", BG = "#18181b";

  /* ================================================================ drawing kit */
  const ln = (a, b, w = 6, c = K) => ({ k: "l", a, b, c, w });
  const pl = (pts, w = 6, c = K) => ({ k: "p", pts, c, w });
  const rf = (x, y, w, h, rx = 3, fill = PADF, stroke = PADS, sw = 2) => ({ k: "r", x, y, w, h, rx, fill, stroke, sw });
  const ci = (at, r, fill = PLF, stroke = PL, sw = 2.5) => ({ k: "c", at, r, fill, stroke, sw });
  const pg = (pts, fill = PADF, stroke = PADS, sw = 2) => ({ k: "g", pts, fill, stroke, sw });
  const pt = (a, ang, l) => [a[0] + Math.cos(ang * Math.PI / 180) * l, a[1] - Math.sin(ang * Math.PI / 180) * l];
  const pad = (a, b, w = 12) => [ln(a, b, w + 4, PADS), ln(a, b, w, PADF)];     // an upholstered pad along a line
  const grip = (a, b) => ln(a, b, 6, LITE);                                        // a handle you hold
  const plate = (at, r = 15) => [ci(at, r), ci(at, 3, PL, PL, 0)];
  const plates = (at, r = 15, n = 2) => { const o = []; for (let i = n - 1; i >= 0; i--) o.push(...plate([at[0] + i * 4, at[1]], r - i * 2)); return o; };
  const pulley = at => ci(at, 5, PADF, K, 2);
  const cable = (a, b) => ln(a, b, 2, PL);
  const foot = (x1, x2, y = F) => ln([x1, y], [x2, y], 7);
  // a pin-loaded weight stack: x,y top-left of the column, w wide
  function stack(x, y, w) {
    const out = [ln([x - 4, F], [x - 4, y], 5), ln([x + w + 4, F], [x + w + 4, y], 5), ln([x - 8, y], [x + w + 8, y], 6), rf(x - 2, F - 54, w + 4, 52, 3, "#27272a", KD, 1.5)];
    out.push(ln([x + 6, y + 4], [x + 6, F - 50], 2, PL), ln([x + w - 6, y + 4], [x + w - 6, F - 50], 2, PL));
    for (let i = 0; i < 8; i++) out.push(rf(x + 1, F - 48 + i * 5.5, w - 2, 4.5, 1, PLF, PL, 1));
    out.push(ci([x + w / 2, F - 33], 2.6, LITE, LITE, 0));
    return out;
  }
  const seat = (x, y, w, post = true) => [rf(x, y, w, 10, 4)].concat(post ? [ln([x + w / 2, y + 10], [x + w / 2, F], 6), foot(x - 6, x + w + 6)] : []);
  const console_ = (at, ang = 20) => [ln(at, pt(at, ang + 90, 4), 1, K), pg([pt(at, ang, -12), pt(at, ang, 12), pt(pt(at, ang, 12), ang + 90, 9), pt(pt(at, ang, -12), ang + 90, 9)], "#27272a", PL, 1.5)];
  const wheel = (at, r) => [ci(at, r, "none", K, 4), ci(at, 3, K, K, 0)];
  // 3.21.0: a roller pad seen end-on; a plate-loaded arm as a curve from its pivot (P) through Q to the handle (H), and a point along it
  const roller = (at, r = 8) => ci(at, r, PADF, PADS, 2);
  const arm = (P, Q, H) => ({ k: "path", d: `M${P[0]} ${P[1]} Q${Q[0]} ${Q[1]} ${H[0]} ${H[1]}`, c: K, w: 9 });
  const qAt = (P, Q, H, u) => [(1 - u) * (1 - u) * P[0] + 2 * u * (1 - u) * Q[0] + u * u * H[0], (1 - u) * (1 - u) * P[1] + 2 * u * (1 - u) * Q[1] + u * u * H[1]];
  const armWith = (P, Q, H, u, r) => [arm(P, Q, H), ci(P, 4, LITE, LITE, 0), ...plates(qAt(P, Q, H, u), r, 2)];
  // 3.21.0: the 45-degree leg press rail: a point s along it and h out from it (towards you)
  const lp45 = (s, h) => [120 + Math.SQRT1_2 * s - Math.SQRT1_2 * h, 200 - Math.SQRT1_2 * s - Math.SQRT1_2 * h];

  /* ================================================================ the equipment (side view, you face right; some from the front) */
  const SEL = "selectorized", PLT = "plate", FREE = "free", BENCH = "bench", RACK = "rack", CAB = "cable", CARD = "cardio", SMALL = "small";
  const EQUIP = {
    // ---- free weights and small kit
    dumbbells: { label: "Dumbbells", group: FREE, look: "Pairs of hand weights on a rack, heaviest at one end.",
      draw: () => [pl([[40, F], [70, 120], [250, 120], [280, F]], 5), ln([60, 150], [260, 150], 5), ln([50, 178], [270, 178], 5), foot(30, 290),
        ...[0, 1, 2, 3, 4].flatMap(i => db([78 + i * 40, 112], 7 + i * 0.6)), ...[0, 1, 2, 3, 4].flatMap(i => db([78 + i * 40, 142], 8 + i * 0.6)), ...[0, 1, 2, 3].flatMap(i => db([98 + i * 40, 170], 9 + i * 0.6))] },
    barbell: { label: "Barbell and plates", group: FREE, look: "A long straight bar with round plates slid on each end and clips to hold them.",
      draw: () => [ln([26, 168], [294, 168], 5, PL), rf(62, 128, 14, 80, 3, PLF, PL), rf(80, 136, 10, 64, 3, PLF, PL), rf(244, 128, 14, 80, 3, PLF, PL), rf(230, 136, 10, 64, 3, PLF, PL), rf(94, 162, 6, 12, 2, K, K, 0), rf(220, 162, 6, 12, 2, K, K, 0), foot(30, 290)] },
    ez_bar: { label: "EZ-curl bar", group: FREE, look: "A short bar with a zig-zag bend in the middle for your wrists; often preloaded with fixed plates.",
      draw: () => [{ k: "path", d: "M36 160 L120 160 Q128 160 134 153 Q142 145 150 153 Q160 163 170 153 Q178 145 186 153 Q192 160 200 160 L284 160", c: PL, w: 5 }, rf(64, 130, 12, 60, 3, PLF, PL), rf(80, 138, 9, 44, 3, PLF, PL), rf(244, 130, 12, 60, 3, PLF, PL), rf(231, 138, 9, 44, 3, PLF, PL), foot(30, 290)] },
    kettlebell: { label: "Kettlebell", group: FREE, look: "A round iron ball with a thick handle on top.",
      draw: () => [{ k: "path", d: "M138 112 Q138 72 160 72 Q182 72 182 112", c: PL, w: 9 }, ci([160, 152], 44, PLF, PL, 4), foot(60, 260)] },
    plate: { label: "Weight plate", group: FREE, look: "A flat round plate with a hole in the middle; some have hand grips cut in.",
      draw: () => [ci([160, 130], 72, PLF, PL, 4), ci([160, 130], 52, "none", KD, 3), ci([160, 130], 12, BG, PL, 3), rf(150, 64, 20, 14, 6, BG, PL, 2), rf(150, 182, 20, 14, 6, BG, PL, 2), foot(60, 260)] },
    medicine_ball: { label: "Medicine ball", group: SMALL, look: "A heavy rubber ball about the size of a basketball.",
      draw: () => [ci([160, 150], 56, PLF, PL, 4), { k: "path", d: "M110 128 Q160 112 210 128", c: KD, w: 3 }, { k: "path", d: "M110 172 Q160 188 210 172", c: KD, w: 3 }, foot(60, 260)] },
    stability_ball: { label: "Stability ball", group: SMALL, look: "A big air-filled exercise ball, about knee to hip high.",
      draw: () => [ci([160, 128], 80, PLF, PL, 4), { k: "path", d: "M86 108 Q160 84 234 108", c: KD, w: 3 }, foot(60, 260)] },
    foam_roller: { label: "Foam roller", group: SMALL, look: "A foam cylinder about a forearm long.",
      draw: () => [rf(80, 150, 160, 56, 26, PLF, PL, 3), ci([108, 178], 24, "none", KD, 2), foot(60, 260)] },
    ab_wheel: { label: "Ab wheel", group: SMALL, look: "A small wheel with a handle sticking out each side.",
      draw: () => [...wheel([160, 158], 48), ci([160, 158], 30, "none", KD, 3), grip([96, 158], [136, 158]), grip([184, 158], [224, 158]), foot(60, 260)] },
    band: { label: "Resistance band", group: SMALL, look: "A long stretchy loop of rubber; the colour shows how strong it is.",
      draw: () => [{ k: "path", d: "M70 150 Q70 100 160 100 Q250 100 250 150 Q250 196 160 196 Q70 196 70 150", c: "#a1a1aa", w: 7 }, foot(60, 260)] },
    jump_rope: { label: "Jump rope", group: SMALL, look: "A rope with a handle at each end.",
      draw: () => [{ k: "path", d: "M92 96 Q60 220 160 200 Q260 220 228 96", c: PL, w: 3 }, grip([88, 70], [94, 100]), grip([232, 70], [226, 100]), foot(60, 260)] },
    box: { label: "Plyo box", group: SMALL, look: "A sturdy box (wood or foam) to step or jump onto.",
      draw: () => [pg([[92, F], [228, F], [214, 104], [106, 104]], PLF, PL, 3), rf(138, 124, 44, 13, 6, BG, PL, 2), foot(70, 250)] },
    mat: { label: "No equipment", group: SMALL, look: "Just floor space. A mat makes floor work more comfortable.",
      draw: () => [rf(60, F - 10, 200, 8, 3, PLF, PL, 2), ci([260, F - 18], 14, PLF, PL, 2)] },
    trx: { label: "Suspension straps", group: SMALL, look: "Two straps hanging from an anchor high up, each with a handle.",
      draw: () => [ln([120, 22], [200, 22], 7), ci([160, 22], 6, PADF, K, 2), ln([160, 28], [140, 150], 4, "#a1a1aa"), ln([160, 28], [180, 150], 4, "#a1a1aa"), grip([128, 156], [152, 156]), grip([168, 156], [192, 156]), foot(60, 260)] },
    landmine: { label: "Landmine", group: SMALL, look: "A barbell with one end in a swivel on the floor (or in a corner), plates on the other end.",
      draw: () => [rf(52, F - 16, 34, 14, 3, K, K, 0), ci([70, F - 18], 6, PADF, K, 2), ln([70, F - 18], [252, 92], 6, PL), ...plates([244, 98], 22, 1), foot(40, 290)] },
    battle_ropes: { label: "Battle ropes", group: SMALL, look: "Two thick heavy ropes looped around an anchor on the floor or wall.",
      draw: () => [rf(40, F - 30, 22, 30, 3, K, K, 0), { k: "path", d: "M60 182 Q120 150 170 186 Q220 210 270 170", c: PL, w: 9 }, { k: "path", d: "M60 194 Q120 172 170 198 Q220 214 270 186", c: KD, w: 9 }, foot(30, 290)] },
    sled: { label: "Sled", group: SMALL, look: "A metal sled with two tall push poles and a post for plates.",
      draw: () => [pl([[60, F - 4], [70, F - 16], [250, F - 16], [262, F - 4]], 6), ln([200, F - 16], [214, 70], 6), ln([180, F - 16], [194, 70], 6), ln([110, F - 16], [110, 140], 6, PL), ...plates([110, 160], 22, 2), foot(40, 290)] },
    heavy_bag: { label: "Heavy bag", group: SMALL, look: "A long punching bag hanging on a chain.",
      draw: () => [ln([160, 8], [160, 40], 3, PL), rf(120, 40, 80, 160, 22, PLF, PL, 3), foot(60, 260)] },
    gripper: { label: "Hand gripper", group: SMALL, look: "Two handles joined by a spring; squeeze them together.",
      draw: () => [{ k: "path", d: "M130 60 Q114 120 128 190", c: LITE, w: 14 }, { k: "path", d: "M190 60 Q206 120 192 190", c: LITE, w: 14 }, { k: "path", d: "M130 62 Q160 30 190 62", c: PL, w: 4 }, foot(60, 260)] },
    // ---- benches
    flat_bench: { label: "Flat bench", group: BENCH, look: "A low padded bench, flat along its whole length.",
      draw: () => [rf(50, 126, 220, 15, 6), ln([82, 141], [82, F], 7), ln([238, 141], [238, F], 7), ln([62, F], [102, F], 7), ln([218, F], [258, F], 7), ln([82, 160], [238, 160], 5, KD)] },
    adjustable_bench: { label: "Adjustable bench", group: BENCH, look: "A bench whose back rest tilts up (incline) and locks with a pin or ladder.",
      draw: () => [ln([86, F - 4], [248, F - 4], 6), ln([70, F], [100, F], 7), ln([234, F], [262, F], 7), ln([204, 147], [204, F - 4], 6), ln([132, F - 4], [140, 104], 5, KD), ...pad([168, 141], [104, 66], 14), rf(170, 134, 70, 13, 5)] },
    decline_bench: { label: "Decline bench", group: BENCH, look: "A bench that slopes down towards your head, with rollers at the high end to hook your legs.",
      draw: () => [...pad([64, 158], [220, 116], 14), ln([206, 120], [206, F], 6), ln([90, 152], [90, F], 6), ln([226, 112], [248, 96], 5), ci([252, 94], 8, PADF, PADS, 2), ci([236, 128], 8, PADF, PADS, 2), foot(70, 260)] },
    bench_station: { label: "Bench press station", group: BENCH, look: "A flat bench with two uprights at the head end and hooks to rack the bar.",
      draw: () => [ln([84, F], [84, 48], 8), ln([60, F], [112, F], 7), pl([[84, 92], [98, 92], [98, 84]], 5), ...plates([94, 88], 26, 2), rf(104, 132, 176, 14, 5), ln([132, 146], [132, F], 6), ln([256, 146], [256, F], 6), ln([116, F], [148, F], 7), ln([240, F], [272, F], 7)] },
    incline_station: { label: "Incline bench press station", group: BENCH, look: "A bench with a reclined back, a small seat, and uprights behind your head to rack the bar.",
      draw: () => [ln([94, F], [94, 22], 8), ln([66, F], [256, F], 7), pl([[94, 58], [108, 58], [108, 50]], 5), ...plates([104, 52], 24, 2), ...pad([196, 146], [128, 78], 14), rf(196, 140, 58, 13, 5), ln([226, 153], [226, F], 6), ln([160, F], [150, 120], 5, KD)] },
    decline_station: { label: "Decline bench press station", group: BENCH, look: "A decline bench with leg rollers at the high end and uprights by your head.",
      draw: () => [...pad([84, 160], [236, 120], 14), ln([222, 124], [222, F], 6), ln([110, 154], [110, F], 6), ci([262, 106], 8, PADF, PADS, 2), ln([240, 118], [262, 106], 5), ln([70, F], [70, 74], 8), pl([[62, 98], [70, 102], [70, 112]], 5), ...plates([70, 102], 22, 2), foot(50, 270)] },
    preacher_bench: { label: "Preacher curl bench", group: BENCH, look: "A seat facing a slanted arm pad, with a rack for the bar in front.",
      draw: () => [...seat(70, 150, 52), ln([96, F - 6], [172, F - 6], 6), ln([172, F], [172, 126], 7), ...pad([140, 104], [190, 138], 16), pl([[150, 120], [150, 130], [160, 130]], 4), ln([150, F], [196, F], 7)] },
    ab_bench: { label: "Decline sit-up bench", group: BENCH, look: "A long sloped bench with foot rollers at the top end.",
      draw: () => [...pad([60, 180], [226, 110], 14), ln([214, 114], [214, F], 6), ci([240, 92], 8, PADF, PADS, 2), ci([252, 112], 8, PADF, PADS, 2), ln([226, 110], [248, 94], 5), foot(60, 260)] },
    hyper_bench: { label: "Back extension bench (45°)", group: BENCH, look: "A slanted frame with a hip pad near the top and a foot plate with ankle pads at the bottom.",
      draw: () => [pl([[90, F], [230, 80]], 7), ...pad([200, 92], [236, 64], 16), rf(86, F - 26, 30, 8, 2, K, K, 0), ci([110, F - 40], 8, PADF, PADS, 2), ln([200, 106], [214, F], 6), foot(70, 240)] },
    captains_chair: { label: "Captain's chair (knee raise and dip station)", group: BENCH, look: "A tall frame with a back pad, two forearm pads with handles, and often dip handles below.",
      draw: () => [ln([110, F], [110, 30], 8), ln([210, F], [210, 30], 8), ...pad([112, 60], [112, 150], 18), ...pad([116, 64], [196, 64], 14), grip([190, 50], [204, 50]), ln([116, 150], [196, 150], 5), ln([196, 150], [210, 170], 5), rf(150, F - 54, 40, 10, 3), foot(90, 230)] },
    dip_station: { label: "Dip station", group: BENCH, look: "Two parallel bars at hip height on a frame.",
      draw: () => [ln([104, 94], [262, 94], 7, KD), ln([122, 94], [122, F - 16], 6, KD), ln([244, 94], [244, F - 16], 6, KD), ln([60, 120], [218, 120], 8, PL), ln([80, 120], [80, F], 7), ln([200, 120], [200, F], 7), grip([60, 120], [94, 120]), grip([104, 94], [136, 94]), foot(50, 270)] },
    // ---- racks
    squat_rack: { label: "Squat rack", group: RACK, look: "A tall steel frame with hooks to hold the bar at shoulder height and safety arms below.",
      draw: () => [ln([86, F], [86, 24], 8), ln([234, F], [234, 24], 8), ln([80, 24], [240, 24], 7), ln([66, F], [254, F], 8), rf(80, 94, 16, 9, 2, K, K, 0), rf(224, 94, 16, 9, 2, K, K, 0), rf(78, 150, 18, 7, 2, KD, KD, 0), rf(224, 150, 18, 7, 2, KD, KD, 0), ln([28, 92], [292, 92], 5, PL), rf(38, 56, 12, 72, 3, PLF, PL), rf(52, 64, 9, 56, 3, PLF, PL), rf(270, 56, 12, 72, 3, PLF, PL), rf(259, 64, 9, 56, 3, PLF, PL)] },
    smith_machine: { label: "Smith machine", group: RACK, look: "A bar fixed on two vertical rails, so it only moves straight up and down; twist it to hook it on the rails.",
      draw: () => [ln([80, F], [80, 20], 7), ln([240, F], [240, 20], 7), ln([74, 20], [246, 20], 7), ln([102, F], [102, 22], 3, PL), ln([218, F], [218, 22], 3, PL), ln([36, 104], [284, 104], 5, PL), rf(95, 94, 14, 20, 3, K, K, 0), rf(211, 94, 14, 20, 3, K, K, 0), rf(44, 70, 11, 68, 3, PLF, PL), rf(265, 70, 11, 68, 3, PLF, PL), foot(60, 260)] },
    pullup_bar: { label: "Pull-up bar", group: RACK, look: "A bar high on a rack or frame, high enough to hang with straight arms.",
      draw: () => [ln([90, F], [90, 30], 8), ln([230, F], [230, 30], 8), ln([82, 34], [238, 34], 7, PL), grip([130, 34], [190, 34]), foot(70, 250)] },
    // ---- cables
    cable_station: { label: "Cable station (adjustable pulley)", group: CAB, look: "A tall column with a weight stack and a pulley you slide up or down, a handle on the cable.",
      draw: () => [...stack(70, 26, 34), ln([130, F], [130, 22], 8), ln([66, 22], [134, 22], 6), rf(124, 112, 16, 22, 3, PADF, K, 2), pulley([146, 123]), cable([146, 123], [210, 152]), grip([206, 146], [218, 160]), cable([104, 30], [128, 30]), foot(56, 150)] },
    cable_crossover: { label: "Cable crossover", group: CAB, look: "Two tall towers joined at the top, each with a weight stack and pulleys high and low.", view: "front",
      draw: () => [...stack(28, 24, 30), ...stack(262, 24, 30), ln([24, 22], [296, 22], 7), pulley([70, 34]), pulley([250, 34]), pulley([70, 196]), pulley([250, 196]), cable([70, 34], [128, 104]), cable([250, 34], [192, 104]), grip([124, 98], [132, 112]), grip([188, 98], [196, 112]), foot(16, 304)] },
    lat_pulldown_machine: { label: "Lat pulldown", group: CAB, look: "A seat facing the weight stack, with roller pads over your thighs; a bar hangs on a cable from a pulley above you.",
      draw: () => [...stack(236, 16, 32), ln([132, 16], [276, 16], 7), ln([136, 16], [136, 26], 5), pulley([150, 24]), ln([136, 24], [145, 24], 4), cable([150, 24], [150, 60]), grip([140, 62], [160, 62]), rf(112, 157, 56, 10, 4), ln([140, 167], [140, F], 6), ln([214, F], [214, 132], 6), ln([214, 134], [176, 134], 5), roller([176, 140]), foot(100, 284)] },
    seated_row_cable: { label: "Seated cable row", group: CAB, look: "A long low seat facing a foot plate, with a cable handle coming from a low pulley in front.",
      draw: () => [rf(50, 168, 150, 12, 4), ln([80, 180], [80, F], 6), ln([170, 180], [170, F], 6), pg([[226, 196], [240, 150], [250, 154], [238, 198]], PADF, PADS), ...stack(262, 30, 30), pulley([250, 172]), cable([250, 172], [214, 150]), grip([206, 142], [214, 158]), foot(40, 300)] },
    // ---- pin-loaded (selectorized) machines
    chest_press_machine: { label: "Chest press machine", group: SEL, look: "A seat and back pad with two handles at chest height that you push forward; weight stack behind.",
      draw: () => [...stack(36, 30, 30), ...seat(110, 150, 54), ...pad([112, 146], [104, 70], 14), ln([70, 28], [200, 28], 7), ln([196, 28], [204, 92], 7), grip([196, 92], [216, 92]), ln([180, 28], [176, 50], 5), foot(30, 230)] },
    pec_deck: { label: "Pec deck (fly / rear delt machine)", group: SEL, look: "A seat with a tall back pad and two arms that swing together in front of your chest.", view: "front",
      draw: () => [...stack(26, 24, 30), ln([22, 22], [240, 22], 7), ...seat(130, 156, 60), ...pad([160, 150], [160, 66], 26), ln([160, 22], [160, 50], 6), pl([[160, 44], [96, 52], [90, 100]], 6), pl([[160, 44], [224, 52], [230, 100]], 6), grip([90, 84], [90, 116]), grip([230, 84], [230, 116]), foot(20, 240)] },
    shoulder_press_machine: { label: "Shoulder press machine", group: SEL, look: "A seat with a tall back pad and handles beside your shoulders that you press up.",
      draw: () => [...stack(36, 20, 30), ...seat(110, 150, 54), ...pad([112, 146], [110, 60], 14), ln([70, 18], [176, 18], 7), ln([98, 18], [98, 34], 5), { k: "path", d: "M98 34 Q140 33 171 62", c: K, w: 6 }, ci([98, 34], 4, LITE, LITE, 0), grip([161, 62], [181, 62]), foot(30, 220)] },
    lateral_raise_machine: { label: "Lateral raise machine", group: SEL, look: "A seat with pads that sit against the outside of your elbows and swing up to the sides.", view: "front",
      draw: () => [...stack(270, 30, 28), ...seat(130, 158, 60), ...pad([160, 154], [160, 96], 22), ln([160, 92], [160, 70], 5), pl([[138, 70], [104, 64], [94, 106]], 6), pl([[182, 70], [216, 64], [226, 106]], 6), ...pad([94, 96], [94, 124], 12), ...pad([226, 96], [226, 124], 12), foot(110, 300)] },
    biceps_curl_machine: { label: "Biceps curl machine", group: SEL, look: "A seat facing a slanted arm pad, with handles on an arm that curls up.",
      draw: () => [...stack(30, 30, 30), ...seat(92, 152, 52), ...pad([152, 108], [196, 142], 16), ln([190, 144], [190, F], 7), ln([200, 140], [222, 96], 6), grip([216, 92], [230, 92]), foot(24, 240)] },
    triceps_machine: { label: "Triceps machine (seated dip / extension)", group: SEL, look: "A seat with handles at your sides that you push down until your arms are straight.",
      draw: () => [...stack(30, 30, 30), ...seat(104, 152, 54), ...pad([106, 148], [100, 74], 14), ln([64, 28], [176, 28], 6), ln([172, 28], [176, 104], 6), grip([168, 110], [190, 110]), foot(24, 220)] },
    leg_extension_machine: { label: "Leg extension machine", group: SEL, look: "A seat and back pad with a padded bar in front of your shins that you kick up.",
      draw: () => [...stack(30, 40, 30), ...seat(104, 140, 64), ...pad([108, 136], [98, 66], 14), ln([168, 140], [176, 140], 6), ln([176, 140], [180, 196], 6), ci([186, 194], 9, PADF, PADS, 2), grip([160, 154], [172, 154]), ln([64, 38], [100, 38], 5), foot(24, 230)] },
    seated_leg_curl_machine: { label: "Seated leg curl machine", group: SEL, look: "A seat with a pad on top of your thighs and a padded bar behind your heels that you pull down.",
      draw: () => [...stack(30, 40, 30), ...seat(98, 140, 70), ...pad([100, 136], [92, 66], 14), ...pad([150, 118], [180, 118], 12), ln([168, 118], [168, 140], 5), ln([186, 140], [232, 136], 6), ci([238, 134], 9, PADF, PADS, 2), foot(24, 250)] },
    lying_leg_curl_machine: { label: "Lying leg curl machine", group: SEL, look: "A bench with a hump to lie face down on, handles at the front, and a padded bar behind your ankles.",
      draw: () => [pg([[60, 140], [150, 126], [180, 132], [260, 140], [260, 152], [60, 152]], PADF, PADS), ln([90, 152], [90, F], 6), ln([230, 152], [230, F], 6), grip([256, 166], [272, 166]), ln([258, 152], [262, 166], 4), ln([60, 146], [40, 128], 6), ci([36, 122], 9, PADF, PADS, 2), ...stack(292, 70, 28), ln([260, 146], [292, 146], 4, KD), foot(30, 330)] },
    leg_press_seated: { label: "Seated leg press (pin-loaded)", group: SEL, look: "A reclined seat facing a big foot plate that slides away on a rail as you push.",
      draw: () => [...stack(22, 50, 30), ln([18, 50], [58, 50], 6), ...pad([100, 152], [82, 100], 14), rf(84, 157, 50, 10, 4), ln([110, 167], [110, F], 6), grip([128, 168], [140, 168]), ln([134, 162], [134, 168], 4), ln([150, 192], [272, 192], 5, KD), ln([272, F], [272, 186], 7), ln([150, 192], [150, F], 5), rf(176, 98, 12, 84, 5, PADF, PADS, 2), rf(175, 180, 36, 10, 3, K, K, 0), ln([182, 182], [182, 176], 6), foot(14, 286)] },
    hip_machine: { label: "Hip abductor / adductor machine", group: SEL, look: "A seat with two leg pads that swing out (outer thigh) or in (inner thigh); one machine often does both.", view: "front",
      draw: () => [...stack(270, 30, 28), ...seat(116, 150, 88), ...pad([160, 146], [160, 70], 24), ...pad([112, 152], [96, 196], 12), ...pad([208, 152], [224, 196], 12), ln([104, 172], [216, 172], 4, KD), foot(100, 300)] },
    multi_hip: { label: "Glute / multi-hip machine", group: SEL, look: "You stand on a platform holding handles; a padded lever behind or beside your leg moves with it.",
      draw: () => [...stack(30, 30, 30), rf(110, F - 26, 110, 16, 3, K, K, 0), ln([210, F - 26], [210, 70], 7), grip([196, 70], [222, 70]), ln([140, 112], [160, 140], 6), ln([160, 140], [120, 180], 6), ci([116, 184], 10, PADF, PADS, 2), ln([64, 28], [150, 28], 5), ln([150, 28], [150, 112], 5), foot(24, 240)] },
    // 3.21.0: the standing glute kickback machine (LA Fitness): platform, chest pad, forearm pads with handles, a foot plate on a lever
    glute_machine: { label: "Glute kickback machine", group: SEL, look: "You stand on a platform and lean your chest and forearms on pads; your working foot pushes a foot plate on a lever back and up.",
      draw: () => [...stack(244, 36, 30), rf(104, 197, 64, 13, 3, K, K, 0), ln([112, 197], [122, 112], 6, KD), ci([122, 112], 4, LITE, LITE, 0),
        ...pad([176, 101], [189, 90], 12), ln([189, 90], [240, 90], 5), ...pad([174, 118], [218, 118], 10), ln([218, 118], [240, 118], 5), grip([213, 102], [213, 116]),
        ln([122, 112], [145, 188], 6), ...pad([134, 192], [157, 184], 6), foot(96, 290)] },
    ab_crunch_machine: { label: "Ab crunch machine", group: SEL, look: "A seat with pads over your chest or handles by your head that you curl forward.",
      draw: () => [...stack(30, 30, 30), ...seat(100, 152, 60), ...pad([102, 148], [98, 74], 14), ln([64, 28], [146, 28], 6), pl([[146, 28], [146, 60], [126, 82]], 6), ...pad([126, 82], [150, 94], 12), grip([140, 60], [160, 60]), foot(24, 220)] },
    rotary_torso: { label: "Rotary torso machine", group: SEL, look: "A seat that turns (or a chest pad that turns) so you twist from your waist.",
      draw: () => [...stack(30, 30, 30), ...seat(110, 150, 60), ci([140, 156], 30, "none", KD, 3), ...pad([170, 140], [170, 80], 18), grip([180, 84], [200, 84]), ln([64, 28], [176, 28], 6), ln([170, 28], [170, 80], 5), ...pad([114, 186], [150, 186], 10), foot(24, 240)] },
    back_ext_machine: { label: "Back extension machine (seated)", group: SEL, look: "A seat with a foot plate and a pad high behind your upper back that you push back.",
      draw: () => [...stack(260, 40, 30), ...seat(96, 152, 64), ...pad([96, 60], [100, 110], 16), ln([100, 110], [130, 150], 5), pg([[180, 196], [196, 160], [206, 164], [192, 200]], PADF, PADS), grip([120, 138], [134, 138]), foot(80, 300)] },
    standing_calf_machine: { label: "Standing calf raise machine", group: SEL, look: "A pad on a lever rests on your shoulders while the balls of your feet are on the edge of a block; you rise onto your toes.",
      draw: () => [...stack(30, 30, 30), rf(167, F - 26, 64, 24, 3, K, K, 0), ln([64, 28], [100, 28], 6), ln([96, 28], [96, 52], 6), ln([96, 50], [160, 58], 6), ci([96, 50], 4, LITE, LITE, 0), ci([162, 58], 9, PADF, PADS, 2), ln([218, F], [218, 70], 7), ln([218, 72], [200, 72], 5), grip([196, 66], [196, 80]), foot(24, 240)] },
    seated_calf_machine: { label: "Seated calf raise machine", group: PLT, look: "A seat with a pad that sits on top of your knees, a foot block, and a horn for plates.",
      draw: () => [...seat(80, 150, 56), ...pad([130, 120], [176, 120], 14), ln([176, 120], [212, 132], 6), ...plates([214, 132], 20, 2), rf(160, F - 30, 40, 28, 3, K, K, 0), ln([150, 120], [150, F - 30], 5), foot(70, 250)] },
    assisted_pullup: { label: "Assisted pull-up / dip machine", group: SEL, look: "A tall frame with handles high up and dip handles lower, and a pad you kneel on that pushes you up.",
      draw: () => [...stack(30, 20, 30), ln([100, F], [100, 18], 8), ln([64, 18], [220, 18], 7), grip([190, 30], [220, 30]), ln([210, 18], [210, 30], 5), ln([100, 110], [200, 110], 6), grip([186, 104], [208, 104]), ...pad([156, 188], [204, 188], 12), ln([100, 196], [156, 190], 5), rf(110, F - 12, 40, 10, 3), foot(24, 230)] },
    row_machine: { label: "Seated row machine", group: SEL, look: "A seat facing a chest pad, with handles out in front that you pull back.",
      draw: () => [...stack(260, 30, 30), ...seat(70, 156, 60), ...pad([135, 124], [140, 100], 14), ln([141, 112], [256, 112], 5), ln([200, 112], [204, F], 6), ln([200, 30], [200, 112], 6), grip([194, 116], [214, 116]), ln([200, 30], [264, 30], 6), foot(60, 300)] },
    // ---- plate-loaded machines (the big arms with horns for plates)
    plate_chest_press: { label: "Plate-loaded chest press", group: PLT, look: "A seat and back pad; each arm turns on a pivot low behind the seat and comes forward to a handle by your chest; plates go on the horns behind the back pad.",
      draw: () => [...seat(100, 152, 56), ...pad([102, 148], [92, 70], 14), ln([60, F], [64, 176], 8), ...armWith([64, 176], [70, 80], [136, 87], 0.3, 20), grip([127, 84], [145, 90]), foot(30, 230)] },
    plate_incline_press: { label: "Plate-loaded incline press", group: PLT, look: "A reclined back pad with arms that press up and forward at an angle; each arm turns on a pivot low behind the seat; plates on the horns.",
      draw: () => [...seat(104, 156, 56), ...pad([108, 152], [64, 84], 14), ln([36, F], [40, 170], 8), ...armWith([40, 170], [60, 80], [139, 58], 0.2, 22), grip([130, 62], [148, 54]), foot(24, 230)] },
    plate_decline_press: { label: "Plate-loaded decline press", group: PLT, look: "An upright seat with arms that press forward and slightly down; each arm turns on a pivot low behind the seat; plates on the horns behind the back pad.",
      draw: () => [...seat(100, 152, 56), ...pad([102, 148], [96, 70], 14), ln([60, F], [64, 176], 8), ...armWith([64, 176], [70, 84], [136, 107], 0.3, 20), grip([127, 104], [145, 110]), foot(30, 230)] },
    plate_shoulder_press: { label: "Plate-loaded shoulder press", group: PLT, look: "An upright seat and back pad with arms that press straight up; plates on the horns behind.",
      draw: () => [...seat(110, 152, 56), ...pad([112, 148], [108, 60], 14), ln([56, F], [60, 150], 8), ...armWith([60, 150], [66, 50], [138, 82], 0.2, 20), grip([128, 82], [148, 82]), foot(40, 220)] },
    plate_high_row: { label: "Plate-loaded high row", group: PLT, look: "A seat with a thigh pad and handles high in front that you pull down and back; plates on the horns.",
      draw: () => [...seat(80, 156, 56), ...pad([126, 130], [160, 130], 12), ln([260, F], [252, 40], 8), { k: "path", d: "M252 42 Q190 30 172 60", c: K, w: 9 }, ci([252, 42], 4, LITE, LITE, 0), ...plates([210, 38.7], 22, 2), grip([168, 54], [176, 70]), foot(60, 280)] },
    plate_low_row: { label: "Plate-loaded low row", group: PLT, look: "A seat facing a chest pad, with low handles that you row back to your hips; plates on the horns.",
      draw: () => [...seat(70, 156, 56), ...pad([135, 124], [140, 100], 14), ln([141, 112], [200, 112], 5), ln([200, 112], [204, F], 6), ln([262, F], [254, 70], 8), { k: "path", d: "M254 72 Q210 120 188 140", c: K, w: 9 }, ci([254, 72], 4, LITE, LITE, 0), ...plates([225.6, 98.3], 22, 2), grip([180, 132], [196, 148]), foot(50, 280)] },
    plate_pulldown: { label: "Plate-loaded pulldown", group: PLT, look: "A seat with roller pads over your thighs; arms reach over from the front of the machine with handles above you that you pull down; plates on the horns.",
      draw: () => [rf(102, 157, 56, 10, 4), ln([130, 167], [130, F], 6), ln([204, F], [204, 132], 6), ln([204, 134], [166, 134], 5), roller([166, 140]), ln([226, F], [226, 22], 8), ln([226, 26], [214, 26], 6), { k: "path", d: "M214 26 Q176 4 148 36", c: K, w: 9 }, ci([214, 26], 4, LITE, LITE, 0), ...plates([196, 16], 18, 2), grip([142, 38], [154, 34]), foot(90, 240)] },
    plate_tbar_row: { label: "T-bar row machine (chest-supported)", group: PLT, look: "A slanted chest pad above a foot platform; the lever under you has handles and a horn for plates.",
      draw: () => [rf(60, F - 18, 110, 14, 3, K, K, 0), ...pad([150, 120], [206, 80], 16), ln([180, 100], [176, F], 7), ln([70, F - 18], [240, 150], 7), grip([206, 140], [214, 160]), ...plates([238, 151], 22, 2), foot(40, 290)] },
    leg_press_45: { label: "45° leg press (plate-loaded)", group: PLT, look: "A low reclined seat facing a sled on angled rails; you push the foot plate up the rails. Plates go on the sled's horns.",
      draw: () => [ln(lp45(-12, 0), lp45(168, 0), 6, KD), ln([242.8, F], [242.8, 77], 7), ln(lp45(110, -2), [242.8, 150], 5), ...pad([104, 178], [52, 126], 14), rf(84, 176, 46, 10, 4), ln([104, 186], [104, F], 6), ln([70, F], [88, 160], 5, KD), grip([90, 184], [102, 180]), pg([lp45(70.3, 4), lp45(117.3, 4), lp45(117.3, 26), lp45(70.3, 44)], PADF, PADS), ...plates(lp45(97.3, 22), 17, 2), ...pad(lp45(67.3, 8), lp45(67.3, 56), 8), foot(50, 258)] },
    plate_squat: { label: "Hack squat / squat machine", group: PLT, look: "A foot plate below an angled back pad with shoulder pads that slide on rails; plates on the horns.",
      draw: () => [ln([80, F - 8], [210, 30], 6, KD), pg([[116, 120], [176, 46], [192, 58], [132, 132]], PADF, PADS), ...pad([170, 54], [190, 70], 12), ...plates([150, 86], 20, 2), pg([[150, F - 10], [230, F - 30], [234, F - 18], [154, F]], PADF, PADS), foot(60, 260)] },
    // ---- cardio
    treadmill: { label: "Treadmill", group: CARD, look: "A moving belt on a long low deck, with handrails and a screen at the front.",
      draw: () => [rf(40, F - 22, 220, 18, 8, "#27272a", PL, 2), ln([50, F - 18], [250, F - 18], 3, KD), ln([236, F - 18], [250, 74], 7), ln([210, 100], [252, 100], 6), ...console_([254, 70], 20), foot(40, 260)] },
    elliptical: { label: "Elliptical", group: CARD, look: "Two foot pedals on long arms and two moving handles; your feet move in an oval.",
      draw: () => [rf(40, F - 14, 220, 12, 4, K, K, 0), ci([230, 168], 28, "none", K, 5), ln([230, 168], [110, 180], 6), rf(100, 172, 36, 9, 3), ln([230, 168], [196, 160], 6), rf(186, 152, 36, 9, 3), ln([238, F], [238, 70], 7), ln([238, 80], [196, 40], 6), grip([188, 30], [196, 60]), ...console_([248, 64], 30), foot(40, 260)] },
    upright_bike: { label: "Exercise bike", group: CARD, look: "A seat, handlebars and pedals on a stand, with a flywheel housing at the front.",
      draw: () => [ln([60, F], [260, F], 8), ln([110, F], [124, 112], 7), rf(100, 104, 46, 10, 4), pg([[150, 196], [230, 196], [230, 140], [196, 110], [156, 150]], "#27272a", PL, 2), ln([210, 120], [220, 70], 7), grip([206, 66], [234, 66]), ...wheel([170, 168], 14), ln([170, 168], [184, 184], 4), ...console_([224, 60], 20)] },
    spin_bike: { label: "Cycling (spin) bike", group: CARD, look: "A narrow saddle, low handlebars and a heavy flywheel at the front.",
      draw: () => [ln([60, F], [260, F], 8), ln([100, F], [140, 120], 7), ln([140, 120], [122, 100], 6), rf(104, 94, 40, 9, 4), ln([140, 120], [220, 110], 7), ln([220, 110], [232, 86], 6), grip([224, 82], [252, 82]), ...wheel([230, 168], 30), ln([140, 120], [170, 172], 6), ...wheel([170, 172], 10), ln([230, 198], [230, F], 6)] },
    recumbent_bike: { label: "Recumbent bike", group: CARD, look: "A low bucket seat with a back rest and the pedals out in front.",
      draw: () => [ln([40, F], [270, F], 8), rf(70, 148, 64, 12, 5), ...pad([76, 146], [60, 86], 16), ln([100, 160], [100, F], 6), pg([[200, 196], [260, 196], [260, 140], [220, 120]], "#27272a", PL, 2), ...wheel([216, 150], 12), grip([140, 160], [160, 160]), ...console_([248, 112], 30)] },
    stair_climber: { label: "Stair climber (StepMill)", group: CARD, look: "A tall machine with a revolving staircase and handrails on both sides.",
      draw: () => [rf(70, 60, 170, F - 60, 8, "#27272a", PL, 2), ...[0, 1, 2, 3, 4].map(i => ln([90 + i * 26, F - 14 - i * 28], [124 + i * 26, F - 14 - i * 28], 6, PL)), ln([96, 40], [230, 40], 6), ln([96, 40], [90, 120], 5), ...console_([236, 34], 10), foot(60, 250)] },
    rower: { label: "Rowing machine", group: CARD, look: "A long rail with a sliding seat, foot straps at the front and a handle on a chain from the flywheel.",
      draw: () => [ln([40, F - 26], [230, F - 26], 6), ln([60, F - 26], [60, F], 6), rf(70, F - 40, 40, 10, 4), ci([254, 176], 30, "#27272a", PL, 3), pg([[200, 186], [216, 160], [226, 166], [210, 190]], PADF, PADS), cable([230, 160], [190, 152]), grip([184, 146], [188, 160]), ln([254, 206], [254, F], 6), ln([250, 148], [236, 112], 4), rf(220, 96, 30, 18, 3, "#27272a", PL, 1.5), foot(36, 290)] },
    air_bike: { label: "Air bike (fan bike)", group: CARD, look: "A bike with a big fan at the front and handles that move with the pedals.",
      draw: () => [ln([50, F], [270, F], 8), ln([110, F], [124, 112], 7), rf(100, 104, 46, 10, 4), ...wheel([226, 150], 46), ...[0, 30, 60, 90, 120, 150].map(a => ln(pt([226, 150], a, 10), pt([226, 150], a, 42), 2, KD)), ln([150, 150], [196, 76], 6), grip([190, 70], [204, 82]), ln([124, 160], [190, 160], 6), ...wheel([160, 168], 10)] },
    skierg: { label: "SkiErg", group: CARD, look: "A tall column with a flywheel at the top and two handles on cords that you pull down.",
      draw: () => [rf(150, 24, 40, 48, 8, "#27272a", PL, 2), ln([170, 72], [170, F], 8), cable([156, 60], [126, 120]), cable([184, 60], [214, 120]), grip([122, 120], [126, 140]), grip([214, 120], [218, 140]), rf(130, F - 12, 80, 10, 3, K, K, 0)] },
    arm_bike: { label: "Arm bike (upper body ergometer)", group: CARD, look: "A post with handles on a crank at chest height, turned with your arms.",
      draw: () => [ln([200, F], [200, 90], 8), ci([190, 92], 16, "none", K, 4), ln([190, 92], [206, 80], 5), grip([206, 72], [206, 90]), ln([190, 92], [174, 104], 5), grip([174, 96], [174, 114]), ...seat(80, 150, 50), ...console_([212, 60], 30), foot(70, 230)] },
    machine_generic: { label: "Weight-stack machine", group: SEL, look: "A machine with a pin-loaded weight stack: set the weight with the pin. The card on the machine shows the exercise and how to set it up.",
      draw: () => [...stack(36, 30, 32), ...seat(110, 152, 56), ...pad([112, 148], [106, 72], 14), ln([72, 28], [190, 28], 6), ln([186, 28], [196, 96], 6), grip([188, 100], [210, 100]), foot(28, 226)] },
    plate_machine: { label: "Plate-loaded machine", group: PLT, look: "A machine with a lever arm and horns (short posts) where you load plates.",
      draw: () => [...seat(100, 152, 56), ...pad([102, 148], [96, 72], 14), ln([60, F], [66, 40], 8), { k: "path", d: "M66 42 Q170 26 196 100", c: K, w: 9 }, ci([66, 42], 4, LITE, LITE, 0), ...plates([146.5, 48.5], 22, 2), grip([190, 100], [210, 106]), foot(40, 230)] },
    versaclimber: { label: "Climbing machine (VersaClimber)", group: CARD, look: "A tall slanted mast with handles and foot pedals that move up and down.",
      draw: () => [ln([150, F], [190, 20], 8), grip([170, 70], [196, 70]), grip([160, 110], [186, 110]), rf(140, 160, 34, 8, 3), rf(130, 186, 34, 8, 3), foot(110, 230)] },
  };
  function db(at, r) { return [rf(at[0] - 10, at[1] - r, 6, r * 2, 2, PLF, PL, 1.5), rf(at[0] + 4, at[1] - r, 6, r * 2, 2, PLF, PL, 1.5), ln([at[0] - 4, at[1]], [at[0] + 4, at[1]], 3, PL)]; }

  /* ================================================================ which equipment an exercise uses */
  const PLATE_RX = /hammer strength|iso[- ]?lateral|plate[- ]loaded|\blever\b|\bhs\b/i;
  const MACH_RX = /machine|\blever\b|hammer strength|selectorized|plate[- ]loaded|iso[- ]lateral|pec deck|hack squat|pendulum|leg press|leg extension|leg curl/i;
  function entry(n) {
    try { const e = PT.exCanon && PT.exCanon(n); if (e) return e; } catch (er) { }
    const l = n.toLowerCase();
    try { return (window.EXERCISE_DATABASE || []).find(x => x.name.toLowerCase() === l) || (window.OPENGYM_EXERCISES || []).find(x => x.name.toLowerCase() === l) || null; } catch (er) { return null; }
  }
  const OF = new Map();   // 3.13.0: remembered (the exercise search asks for many at once)
  function of(name) {
    const n = String(name || ""); if (!n) return null;
    if (OF.has(n)) return OF.get(n);
    if (OF.size > 4000) OF.clear();
    const r = of0(n); OF.set(n, r); return r;
  }
  function of0(n) {
    const c = PT.figure.classify(n), id = c ? c.draw || c.id : null, kit = c ? c.kit : "none", eq = String((entry(n) || {}).eq || "").toLowerCase();
    let list = pick(n, id, kit, eq) || [];
    list = list.filter((x, i) => EQUIP[x] && list.indexOf(x) === i);
    return list.length ? { items: list, movement: id, kit } : null;
  }
  function pick(n, id, kit, eq) {
    const has = rx => rx.test(n);
    // cardio machines and small kit named in the exercise
    if (has(/jacob'?s ladder/i)) return ["versaclimber"];   // 3.21.0: a climbing machine, not a treadmill
    if (has(/treadmill/i)) return ["treadmill"];
    if (has(/elliptical|arc trainer|cross ?trainer|adaptive motion/i)) return ["elliptical"];
    if (has(/recumbent/i)) return ["recumbent_bike"];
    if (has(/\bspin(ning)?\b|spin bike|indoor cycl|keiser/i)) return ["spin_bike"];
    if (has(/assault|air ?bike|airdyne|fan bike/i)) return ["air_bike"];
    if (has(/stair ?(climb|master|mill)|step ?mill|stepper|stairs? machine/i)) return ["stair_climber"];
    if (has(/versa ?climber|climbing machine/i)) return ["versaclimber"];
    if (has(/ski ?erg/i)) return ["skierg"];
    if (has(/arm bike|arm ergometer|\bube\b|arm cycl/i)) return ["arm_bike"];
    if (has(/rowing machine|\brower\b|row erg|concept ?2/i)) return ["rower"];
    if (has(/exercise bike|stationary bike|upright bike/i)) return ["upright_bike"];
    if (has(/battle ?rope|battling rope/i)) return ["battle_ropes"];
    if (has(/\bsled (push|pull|drag)|(push|pull|drag)(ing)? (a |the )?sled|prowler/i)) return ["sled"];
    if (has(/heavy bag|punching bag|bag work/i)) return ["heavy_bag"];
    if (has(/gripper|grip squeeze/i)) return ["gripper"];
    if (has(/plate pinch|pinch grip/i)) return ["plate"];
    if (has(/foam roll/i) || /^foam_roll/.test(id || "")) return ["foam_roller"];
    if (has(/jump rope|skipping|double[- ]unders?/i) || id === "jump_rope") return ["jump_rope"];
    if (has(/stability ball|swiss ball|exercise ball|physio ball/i) || id === "ball_leg_curl") return ["stability_ball"];
    if ((has(/ab wheel|ab roller|roll[- ]?outs?\b|rollouts?/i) || id === "ab_wheel") && kit !== "barbell") return ["ab_wheel"];
    if (has(/captain|vertical knee raise|knee raise station|\bvkr\b|roman chair (knee|leg)/i)) return ["captains_chair"];
    if (has(/\bghd\b|glute[- ]ham/i)) return ["hyper_bench"];
    if (has(/\b(front|back) lever\b/i)) return ["pullup_bar"];   // the gymnastics hold, not a machine
    if (has(/smith/i) || kit === "smith" || eq === "smith machine") return ["smith_machine"];
    if (has(/assist/i) && has(/pull|chin|dip/i) && !has(/band/i)) return ["assisted_pullup"];
    if (has(/preacher|scott curl/i) && !MACH_RX.test(n)) return ["preacher_bench", kit === "dumbbell" ? "dumbbells" : kit === "cable" ? "cable_station" : "ez_bar"];
    if (kit === "landmine" || eq === "landmine" || has(/landmine|meadows row/i) || id === "landmine_twist") return ["landmine", "barbell"];
    if (has(/chest[- ]supported t[- ]?bar/i)) return ["plate_tbar_row"];
    if (has(/t[- ]bar row/i) && !MACH_RX.test(n)) return ["landmine", "barbell"];
    if (kit === "trx" || eq === "suspension trainer") return ["trx"];
    if (kit === "band" || has(/\bband(ed)?\b|resistance band|mini[- ]band/i)) return id === "pull_up" || id === "dead_hang" ? ["band", "pullup_bar"] : ["band"];
    if (kit === "ball" || eq === "medicine ball" || eq === "stability ball" || id === "slam") return [eq === "stability ball" || has(/stability|swiss|bosu/i) ? "stability_ball" : "medicine_ball"];
    if (kit === "kettlebell" || eq === "kettlebell" || id === "swing" && kit === "none") return ["kettlebell"];
    if (kit === "plate" || eq === "weight plate") return ["plate"];
    // a machine: by movement; a machine we can't place gets a general weight-stack or plate-loaded machine
    const named = /machine|\blever\b|leverage|selectorized|plate[- ]loaded|hammer strength|iso[- ]lateral/i.test(n), free = /barbell|dumbbell|kettlebell|\bband\b/i.test(n);
    if (kit === "machine" || eq === "leverage machine" || eq === "sled machine" || MACH_RX.test(n) && !free) {
      const m = machine(n, id); if (m) return m;
      if (named || eq === "leverage machine" || eq === "sled machine") return [PLATE_RX.test(n) || eq === "sled machine" ? "plate_machine" : "machine_generic"];
    }
    if (kit === "cable" || eq === "cable" || eq === "rope" || has(/\bcable|pulley/i)) return cableFor(n, id);
    if (has(/\bez[- ]?(bar|curl|barbell)\b|\bez\b/i) || eq === "ez barbell") return ezWith(id);
    return byMove(n, id, kit);
  }
  const ezWith = id => id === "preacher_curl" ? ["preacher_bench", "ez_bar"] : /skull|pullover|lying/.test(id || "") ? ["flat_bench", "ez_bar"] : ["ez_bar"];
  // a machine name the movement rules don't know ("Hammer Strength Chest Press"): its movement from the words
  const GUESS = [[/incline.*press/i, "incline_press"], [/decline.*press/i, "decline_press"], [/chest press|bench press/i, "machine_chest_press"], [/shoulder press|overhead press/i, "overhead_press"],
    [/high row|low row|\brow\b/i, "seated_row"], [/pull[- ]?down/i, "lat_pulldown"], [/leg press/i, "leg_press"], [/hack|squat/i, "squat"], [/leg extension/i, "leg_extension"],
    [/seated leg curl/i, "leg_curl_seated"], [/leg curl/i, "leg_curl"], [/calf/i, "calf_raise"], [/fly|pec/i, "pec_deck"], [/curl/i, "curl"], [/triceps|dip/i, "pushdown"], [/abduct/i, "hip_abduction_seated"], [/adduct/i, "hip_adduction_seated"]];
  function machine(n, id) {
    const pl = PLATE_RX.test(n);
    if (/chest[- ]supported t[- ]?bar|t[- ]?bar row machine|lever t[- ]?bar row/i.test(n)) return ["plate_tbar_row"];
    if (!id) { const g = GUESS.find(([rx]) => rx.test(n)); id = g ? g[1] : null; }
    switch (id) {
      case "machine_chest_press": case "bench_press": case "floor_press": case "push_up": return [pl ? "plate_chest_press" : "chest_press_machine"];
      case "incline_press": return [pl ? "plate_incline_press" : "chest_press_machine"];
      case "decline_press": return [pl ? "plate_decline_press" : "chest_press_machine"];
      case "pec_deck": case "fly_lying": case "fly_incline": case "reverse_fly": case "cable_fly": return ["pec_deck"];
      case "overhead_press": case "overhead_press_seated": case "standing_press": return [pl ? "plate_shoulder_press" : "shoulder_press_machine"];
      case "lateral_raise": return ["lateral_raise_machine"];
      case "curl": case "preacher_curl": case "curl_seated": case "concentration_curl": case "spider_curl": case "incline_curl": return ["biceps_curl_machine"];
      case "pushdown": case "overhead_triceps": case "overhead_triceps_seated": case "skull_crusher": case "dip": case "bench_dip": case "kickback": return [/assist/i.test(n) ? "assisted_pullup" : "triceps_machine"];
      case "pull_up": case "dead_hang": return ["assisted_pullup"];
      case "lat_pulldown": case "straight_arm_pulldown": return [pl || /front|dual|diverging/i.test(n) ? "plate_pulldown" : "lat_pulldown_machine"];
      case "seated_row": return [/high row/i.test(n) ? "plate_high_row" : pl || /low row|diverging/i.test(n) ? "plate_low_row" : "row_machine"];
      case "chest_supported_row": case "bent_row": case "one_arm_row": case "inverted_row": return [/t[- ]bar/i.test(n) ? "plate_tbar_row" : /high row/i.test(n) ? "plate_high_row" : pl ? "plate_low_row" : "row_machine"];
      case "leg_extension": return ["leg_extension_machine"];
      case "leg_curl_seated": return ["seated_leg_curl_machine"];
      case "leg_curl": case "supine_leg_curl": return [/seated/i.test(n) ? "seated_leg_curl_machine" : /standing|kneeling/i.test(n) ? "multi_hip" : "lying_leg_curl_machine"];
      case "glute_machine": return ["glute_machine"];
      case "standing_leg_curl": case "hip_extension": case "hip_abduction": case "hip_adduction": case "leg_swing": return ["multi_hip"];
      case "hip_abduction_seated": case "hip_adduction_seated": return ["hip_machine"];
      case "leg_press": return [/seated|horizontal|selectorized|\bpin\b/i.test(n) ? "leg_press_seated" : "leg_press_45"];
      case "squat": case "air_squat": case "front_squat": case "goblet_squat": case "sissy_squat": case "lunge": case "split_squat_rear": case "squat_hold": return ["plate_squat"];
      case "calf_raise": return [/seated/i.test(n) ? "seated_calf_machine" : /leg press|sled|\bpress\b/i.test(n) ? "leg_press_45" : /hack/i.test(n) ? "plate_squat" : "standing_calf_machine"];
      case "seated_calf_raise": return ["seated_calf_machine"];
      case "crunch": case "cable_crunch": case "sit_up": case "v_up": return ["ab_crunch_machine"];
      case "russian_twist": case "woodchop": case "standing_twist": return ["rotary_torso"];
      case "seated_back_extension": case "back_extension": case "good_morning": case "seated_good_morning": return ["back_ext_machine"];
      default: return null;
    }
  }
  function cableFor(n, id) {
    switch (id) {
      case "lat_pulldown": return ["lat_pulldown_machine"];
      case "seated_row": return ["seated_row_cable"];
      case "cable_fly": case "reverse_fly": case "high_cable_curl": case "y_raise": case "pec_deck": return ["cable_crossover"];
      case "fly_lying": case "bench_press": case "skull_crusher": case "pullover": return ["cable_crossover", "flat_bench"];
      case "fly_incline": case "incline_press": return ["cable_crossover", "adjustable_bench"];
      default: return ["cable_station"];
    }
  }
  function byMove(n, id, kit) {
    const W8 = kit === "barbell" ? "barbell" : kit === "dumbbell" ? "dumbbells" : null;
    const w = x => W8 ? [x, W8] : [x], only = () => W8 ? [W8] : ["mat"];
    switch (id) {
      case "bench_press": return kit === "barbell" ? ["bench_station"] : w("flat_bench");
      case "incline_press": return kit === "barbell" ? ["incline_station"] : w("adjustable_bench");
      case "decline_press": return kit === "barbell" ? ["decline_station"] : w("decline_bench");
      case "fly_lying": case "skull_crusher": case "pullover": case "one_arm_row": case "concentration_curl": case "curl_seated": case "split_squat_rear": case "reverse_hyper": return w("flat_bench");
      case "fly_incline": case "incline_curl": case "chest_supported_row": case "spider_curl": case "overhead_press_seated": case "overhead_triceps_seated": return w("adjustable_bench");
      case "hip_thrust": case "bench_dip": case "push_up_incline": case "push_up_decline": return w("flat_bench");
      case "preacher_curl": return ["preacher_bench", kit === "dumbbell" ? "dumbbells" : "ez_bar"];
      case "squat": case "front_squat": case "overhead_press": case "good_morning": case "squat_hold": return kit === "barbell" ? ["squat_rack", "barbell"] : only();
      case "step_up": return w("box");
      case "jump": return /box/i.test(n) ? ["box"] : ["mat"];
      case "dip": case "l_sit": return ["dip_station"];
      case "pull_up": case "dead_hang": return ["pullup_bar"];
      case "hanging_leg_raise": return /captain|knee raise/i.test(n) && !/hanging/i.test(n) ? ["captains_chair"] : ["pullup_bar"];
      case "inverted_row": return ["squat_rack"];
      case "back_extension": return ["hyper_bench"];
      case "seated_back_extension": return ["back_ext_machine"];
      case "sit_up": case "crunch": case "leg_raise": return /decline/i.test(n) ? ["ab_bench"] : only();
      case "run": case "walk": return /outdoor|track|trail|hill|stairs/i.test(n) ? ["mat"] : ["treadmill"];
      case "cycle": return ["upright_bike"];
      case "rower": return ["rower"];
      case "stairs": return ["stair_climber"];
      case "arm_bike": return ["arm_bike"];
      case "swing": case "clean": case "snatch": return kit === "kettlebell" ? ["kettlebell"] : only();
      default: return only();
    }
  }

  /* ================================================================ the picture */
  const n1 = v => Math.round(v * 10) / 10;
  function emit(parts) {
    return parts.map(s => {
      if (s.k === "l") return `<line x1="${n1(s.a[0])}" y1="${n1(s.a[1])}" x2="${n1(s.b[0])}" y2="${n1(s.b[1])}" stroke="${s.c}" stroke-width="${s.w}" stroke-linecap="round"/>`;
      if (s.k === "p") return `<polyline points="${s.pts.map(q => n1(q[0]) + "," + n1(q[1])).join(" ")}" fill="none" stroke="${s.c}" stroke-width="${s.w}" stroke-linecap="round" stroke-linejoin="round"/>`;
      if (s.k === "c") return `<circle cx="${n1(s.at[0])}" cy="${n1(s.at[1])}" r="${s.r}" fill="${s.fill}" stroke="${s.stroke}" stroke-width="${s.sw}"/>`;
      if (s.k === "r") return `<rect x="${n1(s.x)}" y="${n1(s.y)}" width="${n1(s.w)}" height="${n1(s.h)}" rx="${s.rx}" fill="${s.fill}" stroke="${s.stroke}" stroke-width="${s.sw}"/>`;
      if (s.k === "g") return `<polygon points="${s.pts.map(q => n1(q[0]) + "," + n1(q[1])).join(" ")}" fill="${s.fill}" stroke="${s.stroke}" stroke-width="${s.sw}" stroke-linejoin="round"/>`;
      if (s.k === "path") return `<path d="${s.d}" fill="none" stroke="${s.c}" stroke-width="${s.w}" stroke-linecap="round"/>`;
      return "";
    }).join("");
  }
  function bbox(parts) {
    let x1 = 1e9, y1 = 1e9, x2 = -1e9, y2 = -1e9;
    const P = (q, d) => { x1 = Math.min(x1, q[0] - d); y1 = Math.min(y1, q[1] - d); x2 = Math.max(x2, q[0] + d); y2 = Math.max(y2, q[1] + d); };
    parts.forEach(s => {
      if (s.k === "l") { P(s.a, s.w / 2); P(s.b, s.w / 2); }
      else if (s.k === "p" || s.k === "g") s.pts.forEach(q => P(q, (s.w || s.sw || 0) / 2));
      else if (s.k === "c") P(s.at, s.r + (s.sw || 0) / 2);
      else if (s.k === "r") { P([s.x, s.y], 1); P([s.x + s.w, s.y + s.h], 1); }
      else if (s.k === "path") (s.d.match(/-?\d+(\.\d+)?/g) || []).map(Number).reduce((a, v, i, arr) => (i % 2 ? (P([arr[i - 1], v], s.w / 2), a) : a), 0);
    });
    return [x1, y1, x2, y2];
  }
  const cache = new Map();
  function svg(id) {
    if (cache.has(id)) return cache.get(id);
    const e = EQUIP[id]; if (!e) return "";
    const parts = e.draw(), [x1, y1, x2, y2] = bbox(parts), M = 16;
    const s = Math.min(1.25, (W - 2 * M) / (x2 - x1), (H - 2 * M) / (y2 - y1));
    const tx = (W - (x2 - x1) * s) / 2 - x1 * s, ty = (H - (y2 - y1) * s) / 2 - y1 * s;
    const out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(e.label)}"><title>${esc(e.label)}. Drawing: PulseTrack, made by the app (not a photo of a real machine).</title><rect width="${W}" height="${H}" rx="14" fill="${BG}"/><g transform="translate(${n1(tx)} ${n1(ty)}) scale(${Math.round(s * 1000) / 1000})">${emit(parts)}</g></svg>`;
    cache.set(id, out); return out;
  }
  const dataUrl = s => "data:image/svg+xml;charset=utf-8," + encodeURIComponent(s);

  /* ================================================================ notes for LA Fitness */
  const LAF = {
    [SEL]: "Usually a pin-loaded machine from Life Fitness, Matrix or Star Trac. The card on the machine shows its name and how to set it up.",
    [PLT]: "Usually a Hammer Strength plate-loaded machine: load plates on the horns, and each arm moves on its own.",
    [FREE]: "Dumbbells go up to about 120 lb on the racks, with flat and incline benches next to them.",
    [BENCH]: "Flat and incline benches are usually next to the dumbbell racks.",
    [RACK]: "Most clubs have a few squat racks, often by the deadlift platforms.",
    [CAB]: "Look for the cable crossover or a cable column; slide the pulley up or down to the height you need.",
    [CARD]: "Treadmills, ellipticals, step climbers and bikes are out on the cardio floor.",
    [SMALL]: "Mats, balls, bands and rollers are usually in the stretching or functional training area.",
  };
  const LAF_ID = {
    bench_station: "Most clubs have several bench press stations: a bench with the bar rack built in.",
    incline_station: "Most clubs have incline bench press stations next to the flat ones.",
    ez_bar: "Look for the racks of preloaded EZ-curl and straight bars, numbered by weight.",
    barbell: "Barbells and rubber-coated plates are by the racks and platforms; most clubs don't have bumper plates.",
    rower: "Concept2 rowers are often in or near the cycling studio.",
    spin_bike: "Keiser bikes are in the cycling studio.",
    smith_machine: "Many clubs have one or two Smith machines near the racks.",
  };
  const lafNote = id => LAF_ID[id] || LAF[EQUIP[id].group] || "";

  /* ================================================================ the Equipment section of the exercise sheet */
  const save = a => { try { WorkoutStorage.saveSettings(a.settings); } catch (e) { } };
  // settings.gymChain: "lafitness" or "any" once chosen; before that, a gym named "LA Fitness" (Settings > Gyms & Equipment) turns the notes on
  function chain(a) {
    const s = (a && a.settings) || {};
    if (s.gymChain === "lafitness" || s.gymChain === "any") return s.gymChain === "lafitness" ? "lafitness" : "";
    try { const g = (PT.gyms() || []).find(x => x.id === s.gymId); return g && /\bla ?fitness\b/i.test(g.name || "") ? "lafitness" : ""; } catch (e) { return ""; }
  }
  const photos = () => { const a = A(); return (a && a.settings.equipPhotos) || {}; };
  // 3.13.0: the name printed on the machine at your gym (settings.equipNames[equipment id]); searching the exercise list for it finds the
  // exercises on that machine
  const names = () => { const a = A(); return (a && a.settings.equipNames) || {}; };
  let cur = null;   // { name, items, show: "photo" | "drawing", url }
  function sectionHtml(name) {
    const r = of(name); if (!r) return "";
    const e = EQUIP[r.items[0]];
    return `<details id="ex-equip" class="pt-mw pt-eq" open><summary><span class="pt-mw-h">Equipment</span><span class="pt-mw-s">${esc(names()[r.items[0]] || e.label)}</span><span class="pt-chev">›</span></summary>
      <div class="pt-mw-b"><div id="pt-eq" data-name="${esc(name)}"></div></div></details>`;
  }
  async function draw() {
    const box = $("pt-eq"); if (!box || !cur) return;
    const a = A(), id = cur.items[0], e = EQUIP[id], ph = photos()[id], gym = chain(a);
    if (cur.url) { URL.revokeObjectURL(cur.url); cur.url = null; }
    if (ph && cur.show !== "drawing") { try { const rec = await PT.guideSteps.db.get(ph); if (rec && rec.blob) cur.url = URL.createObjectURL(rec.blob); } catch (er) { } }
    const pic = cur.url ? `<img class="pt-eq-img pt-eq-photo" src="${cur.url}" alt="Your photo of the ${esc(e.label.toLowerCase())}">` : `<img class="pt-eq-img" src="${dataUrl(svg(id))}" alt="Drawing of a ${esc(e.label.toLowerCase())}">`;
    const more = cur.items.slice(1).map(x => EQUIP[x].label.toLowerCase());
    box.innerHTML = `<div class="pt-eq-box">${pic}</div>
      ${ph ? `<div class="pt-eq-seg" role="group" aria-label="Show"><button type="button" class="pt-opt tap-active" data-eq="photo" aria-pressed="${!!cur.url}">My photo</button><button type="button" class="pt-opt tap-active" data-eq="drawing" aria-pressed="${!cur.url}">Drawing</button></div>` : ""}
      <p class="pt-eq-name"><b>${esc(e.label)}</b>${more.length ? ` <span>with ${esc(more.join(" and "))}</span>` : ""}</p>
      <p class="pt-eq-look">${esc(e.look)}</p>
      ${cur.naming ? `<div class="pt-eq-nm"><label for="pt-eq-nm" class="pt-eq-nml">Name on the machine at your gym</label>
          <input id="pt-eq-nm" type="text" maxlength="60" autocomplete="off" value="${esc(names()[id] || "")}" placeholder="For example: Hammer Strength Iso-Lateral Leg Press">
          <div class="pt-eq-act"><button type="button" class="pt-opt tap-active" data-eq="namesave">Save</button><button type="button" class="pt-opt tap-active" data-eq="namecancel">Cancel</button>
          ${names()[id] ? `<button type="button" class="pt-opt tap-active" data-eq="nameclear">Remove the name</button>` : ""}</div></div>`
        : names()[id] ? `<p class="pt-eq-mine">On the machine: <b>${esc(names()[id])}</b> <button type="button" class="pt-eq-link tap-active" data-eq="name">Change</button></p>` : ""}
      ${gym === "lafitness" ? `<p class="pt-eq-laf"><b>At LA Fitness:</b> ${esc(lafNote(id))} Clubs differ, so yours may look a little different.</p>` : ""}
      <div class="pt-eq-act">
        <label for="pt-eq-file" class="pt-opt tap-active pt-eq-add">${ph ? "Change my photo" : "Add a photo of it at your gym"}</label>
        <input id="pt-eq-file" type="file" accept="image/*" capture="environment" class="hidden">
        ${ph ? `<button type="button" class="pt-opt tap-active" data-eq="rm">Remove my photo</button>` : ""}
        ${!names()[id] && !cur.naming ? `<button type="button" class="pt-opt tap-active" data-eq="name">Add the name on the machine</button>` : ""}
      </div>
      <p class="pt-eq-cr">${cur.url ? `Your photo, kept on this phone. It shows for every exercise on this ${esc(e.label.toLowerCase())}.` : `Drawing: PulseTrack, original drawing made by the app (not a photo of a real machine).`}${gym === "lafitness" ? "" : ` Train at LA Fitness? Pick it in Settings > Gyms &amp; Equipment for notes on their machines.`}</p>`;
  }
  const oEx = proto.openExerciseSheet;
  proto.openExerciseSheet = function (name) {
    const r = oEx.apply(this, arguments);
    try {
      const body = $("sheet-body"); if (!body || $("ex-equip")) return r;
      const html = sectionHtml(name); if (!html) return r;
      const anchor = $("ex-steps") || $("ex-muscles") || body.querySelector(".pt-cues");
      if (anchor) anchor.insertAdjacentHTML(anchor.classList && anchor.classList.contains("pt-cues") ? "afterend" : "beforebegin", html); else body.insertAdjacentHTML("afterbegin", html);
      cur = { name, items: of(name).items, show: "photo", url: null };
      draw();
    } catch (e) { console.error("PulseTrack equipment", e); }
    return r;
  };
  document.addEventListener("click", async e => {
    const b = e.target.closest && e.target.closest("#pt-eq [data-eq]"); if (!b || !cur) return;
    const a = A(), id = cur.items[0], k = b.dataset.eq;
    if (k === "photo" || k === "drawing") { cur.show = k; draw(); }
    else if (k === "name") { cur.naming = true; await draw(); const i = $("pt-eq-nm"); if (i) i.focus(); }
    else if (k === "namecancel") { cur.naming = false; draw(); }
    else if (k === "namesave" || k === "nameclear") {
      const v = k === "nameclear" ? "" : String(($("pt-eq-nm") || {}).value || "").replace(/\s+/g, " ").trim().slice(0, 60);
      const nm = Object.assign({}, names()); if (v) nm[id] = v; else delete nm[id];
      a.settings.equipNames = nm; save(a); cur.naming = false; await draw();
      const s = document.querySelector("#ex-equip .pt-mw-s"); if (s) s.textContent = v || EQUIP[id].label;
      a.toast(v ? "Name saved for every exercise on this machine" : "Name removed");
    }
    else if (k === "rm") {
      const p = Object.assign({}, photos()), old = p[id]; delete p[id];
      a.settings.equipPhotos = p; save(a);
      try { if (old) await PT.guideSteps.db.del(old); } catch (er) { }
      cur.show = "photo"; draw(); a.toast("Photo removed");
    }
  });
  document.addEventListener("change", async e => {
    if (!e.target || e.target.id !== "pt-eq-file" || !cur) return;
    const f = e.target.files && e.target.files[0]; if (!f) return;
    const a = A(), id = cur.items[0];
    try {
      const blob = await PT.guideSteps.shrink(f), pid = "q" + PT.uid();
      await PT.guideSteps.db.put({ id: pid, equip: id, ts: Date.now(), blob, license: "own-photo", author: "you" });
      const p = Object.assign({}, photos()), old = p[id]; p[id] = pid;
      a.settings.equipPhotos = p; save(a);
      if (old) PT.guideSteps.db.del(old).catch(() => { });
      cur.show = "photo"; draw(); a.toast("Photo saved for the " + EQUIP[id].label.toLowerCase());
    } catch (er) { if (a) a.toast(er.message || "Couldn't add that photo"); }
    e.target.value = "";
  });

  /* ================================================================ Settings > Gyms & Equipment: which chain */
  function gymBox() {
    const box = $("pt-gym-box"), a = A(); if (!box || !a) return;
    const g = chain(a), n = Object.keys(photos()).length;
    box.innerHTML = `<div class="p-3.5 space-y-2 bg-zinc-950 border border-zinc-800 rounded-xl">
        <span class="text-xs font-bold text-white block">Machine notes for</span>
        <div class="flex flex-wrap gap-1.5" role="group" aria-label="Machine notes for">
          <button type="button" class="pt-opt tap-active" data-gymchain="any" aria-pressed="${!g}">Any gym</button>
          <button type="button" class="pt-opt tap-active" data-gymchain="lafitness" aria-pressed="${g === "lafitness"}">LA Fitness</button>
        </div>
        <span class="text-[11px] text-zinc-400 block">${g === "lafitness" ? "Each exercise's Equipment section also says what that machine usually is at LA Fitness. Clubs differ, so yours may look a little different." : "Each exercise's Equipment section shows a drawing of the machine and how to spot it."} ${n ? `Your photos of ${n} machine${n === 1 ? "" : "s"} are kept on this phone (not in backups).` : "You can add your own photo of a machine from any exercise's Equipment section."}</span>
      </div>`;
  }
  document.addEventListener("click", e => {
    const b = e.target.closest && e.target.closest("#pt-gym-box [data-gymchain]"); if (!b) return;
    const a = A(); if (!a) return;
    a.settings.gymChain = b.dataset.gymchain; save(a); gymBox(); if (cur) draw();
  });
  const oOpen = proto.openSettings;
  if (typeof oOpen === "function") proto.openSettings = function () { const r = oOpen.apply(this, arguments); try { gymBox(); } catch (e) { } return r; };

  const css = document.createElement("style"); css.id = "pt-v3100-css";
  css.textContent = `
    .pt-eq-box { position: relative; width: 100%; aspect-ratio: 4 / 3; border-radius: .9rem; overflow: hidden; background: #18181b; }
    .pt-eq-img { width: 100%; height: 100%; object-fit: contain; display: block; }
    .pt-eq-photo { object-fit: cover; }
    .pt-eq-seg { display: flex; gap: .375rem; margin-top: .5rem; }
    .pt-eq-name { margin: .55rem 0 0; font-size: .8125rem; color: rgb(var(--z100)); }
    .pt-eq-name span { color: rgb(var(--z300)); font-weight: 400; }
    .pt-eq-look, .pt-eq-laf { margin: .3rem 0 0; font-size: .75rem; line-height: 1.45; color: rgb(var(--z300)); }
    .pt-eq-laf b { color: rgb(var(--z100)); }
    .pt-eq-act { display: flex; flex-wrap: wrap; gap: .375rem; margin-top: .55rem; }
    .pt-eq-add { cursor: pointer; }
    .pt-eq-cr { margin: .45rem 0 0; font-size: .6875rem; line-height: 1.4; color: rgb(var(--z400)); }
    .pt-eq-mine { margin: .35rem 0 0; font-size: .75rem; color: rgb(var(--z300)); }
    .pt-eq-mine b { color: rgb(var(--z100)); }
    .pt-eq-link { font-size: .75rem; font-weight: 600; color: rgb(var(--a400)); text-decoration: underline; padding: .35rem .25rem; }
    .pt-eq-nm { margin-top: .55rem; }
    .pt-eq-nml { display: block; font-size: .75rem; font-weight: 600; color: rgb(var(--z200)); margin-bottom: .3rem; }
    #pt-eq-nm { width: 100%; font-size: 1rem; padding: .55rem .7rem; border-radius: .6rem; background: rgb(var(--z950)); border: 1px solid rgb(var(--z700)); color: rgb(var(--z100)); }
  `;
  document.head.appendChild(css);
  document.addEventListener("keydown", e => { if (e.target && e.target.id === "pt-eq-nm" && e.key === "Enter") { e.preventDefault(); const b = document.querySelector('#pt-eq [data-eq="namesave"]'); if (b) b.click(); } });
  // searching the exercise list for a machine's name finds the exercises on that machine
  if (PT.exMatch) {
    const oMatch = PT.exMatch;
    PT.exMatch = function (e, q) {
      if (oMatch.apply(this, arguments)) return true;
      const t = String(q || "").trim().toLowerCase(); if (t.length < 3 || !e || !e.name) return false;
      const ids = Object.entries(names()).filter(([, v]) => String(v).toLowerCase().includes(t)).map(([k]) => k); if (!ids.length) return false;
      const r = of(e.name); return !!(r && ids.includes(r.items[0]));
    };
  }
  PT.equip = { of, svg, EQUIP, lafNote, chain, gymBox, emit, bbox, BG, F,   // 3.20.0: emit, bbox, BG and F (the floor) for module 146
    kit: { ln, pl, rf, ci, pg, pt, pad, grip, plate, plates, pulley, cable, foot, stack, seat, wheel, C: { K, KD, PADF, PADS, LITE, PL, PLF, BG } } };   // 3.21.0: the drawing kit
})();
