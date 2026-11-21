/* =====================================================================
 * PulseTrack 3.20.0: the machines in the demos.
 *  The owner: "the machine you drew, use that in the demo". When an exercise is done on a machine, bench, rack, cable station or
 *  cardio machine that the Equipment section draws (module 138), the moving demo in Step by step (module 137 demo()) shows the figure
 *  on that drawing instead of the figure's own simple seat or bench.
 *  How: FIT says, per machine (and the movements it is drawn for), where the figure's hip (or another joint) sits on the drawing
 *  (at, in the machine's own coordinates) and how big the figure is there (k, machine pixels per figure unit). The machine's parts
 *  that move (handles, levers, foot pads) are taken out (drop: boxes; a part wholly inside one is left out) and drawn again each frame:
 *  lever { from: pivot, to: joint } follows the hands or feet; pulley: the cable runs from the machine's pulley to the hands. flip
 *  mirrors a drawing that faces the other way (the cable station). Everything is then fitted into the picture.
 *  Machines not in FIT keep the 3.19.0 demo.
 *  3.21.0 (the owner: "lat pulldown and stuff, leg press and others just look weird, fix them up to match the machine"): the lat
 *  pulldown faces its stack with roller pads on the thighs; the 45-degree leg press has a real 45-degree rail and a foot plate square
 *  to it; the seated leg press plate slides on a rail; plate-loaded presses turn on a pivot low behind the seat (lever ctrl: a fixed
 *  control point, so the plates stay behind the back pad, not on the head); chest-supported rows have the pad on the chest; the
 *  assisted pull-up kneels on its pad; the calf machine keeps the balls of the feet on the block; noCable leaves out the figure's own
 *  cable; the glute kickback machine (LA Fitness) is new (module 137 glute_machine draws the figure, its lever and foot plate).
 *  PT.machineDemo.posesOf(name) gives the joints on the machine for each picture (tests/machinefit.py).
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof PT === "undefined" || !PT.figure || !PT.figure.demoWith || !PT.equip || !PT.equip.emit) return;
  const F = PT.figure, E = PT.equip, W = 320, H = 240;
  const KIT = "#8f8f99", PADF = "#3f3f46", PADS = "#a1a1aa", LITE = "#e4e4e7", PL = "#a1a1aa";

  /* ---- FIT: id -> one entry or { movement: entry }; an entry: { at, k, joint, drop, lever, pulley, flip, floor } */
  // Tuned by eye against each drawing (coordinates are the machine's, from module 138). Smith machine and squat rack are drawn from
  // the front while their movements are drawn from the side, so they keep the 3.19.0 demo, as do machines not listed here.
  const FIT = {
    chest_press_machine: {"machine_chest_press": {"at": [124, 142], "k": 1.2, "drop": [[185, 25, 222, 100]], "lever": {"from": [200, 30], "to": "grip", "grip": [10, 0]}}},
    plate_chest_press: {"machine_chest_press": {"at": [114, 144], "k": 1.2, "drop": [[30, 20, 230, 200, "a"], [100, 60, 160, 110, "l"], [40, 90, 100, 160, "c"]], "lever": {"from": [64, 176], "ctrl": [70, 80], "to": "grip", "plates": 20, "at": 0.3, "w": 9, "grip": [9, 3]}}},
    shoulder_press_machine: {"overhead_press_seated": {"at": [124, 142], "k": 1.15, "drop": [[94, 20, 190, 70, "al"]], "lever": {"from": [98, 34], "to": "grip", "curve": 16, "w": 6, "grip": [10, 0]}}},
    plate_shoulder_press: {"overhead_press_seated": {"at": [124, 144], "k": 1.15, "noCable": true, "drop": [[30, 20, 230, 200, "a"], [120, 70, 160, 95, "l"], [40, 80, 110, 140, "c"]], "lever": {"from": [60, 150], "ctrl": [66, 50], "to": "grip", "plates": 20, "at": 0.2, "w": 9, "grip": [10, 0]}}, "overhead_press": {"at": [124, 144], "k": 1.15, "noCable": true, "drop": [[30, 20, 230, 200, "a"], [120, 70, 160, 95, "l"], [40, 80, 110, 140, "c"]], "lever": {"from": [60, 150], "ctrl": [66, 50], "to": "grip", "plates": 20, "at": 0.2, "w": 9, "grip": [10, 0]}, "as": "overhead_press_seated"}},
    lat_pulldown_machine: {"lat_pulldown": {"at": [140, 150], "k": 1.0, "over": [{ "t": 98 }, { "t": 104, "hand": [165, 100] }], "drop": [[138, 20, 165, 70, "l"]], "pulley": [150, 24], "lever": {"to": "grip", "grip": [9, 1]}}},
    plate_pulldown: {"lat_pulldown": {"at": [130, 150], "k": 1.0, "over": [{ "t": 98 }, { "t": 104, "hand": [165, 100] }], "noCable": true, "drop": [[140, 0, 218, 60]], "lever": {"from": [214, 26], "to": "grip", "curve": -22, "plates": 18, "at": 0.25, "w": 9, "grip": [7, -3]}}},
    seated_row_cable: {"seated_row": {"at": [121, 164], "k": 1.0, "drop": [[200, 138, 256, 176, "l"]], "pulley": [250, 172]}},
    plate_low_row: {"seated_row": {"at": [112, 150], "k": 1.05, "over": [{"t": 76, "ankle": [178, 196], "kb": 1, "ft": 0, "hand": [214, 140]}, {"t": 80, "ankle": [178, 196], "kb": 1, "ft": 0, "hand": [166, 132]}], "drop": [[170, 60, 262, 150]], "lever": {"from": [254, 72], "to": "grip", "curve": -20, "plates": 20, "at": 0.35, "w": 9, "grip": [6, 8]}}},
    row_machine: {"seated_row": {"at": [112, 150], "k": 1.05, "over": [{"t": 76, "ankle": [178, 196], "kb": 1, "ft": 0, "hand": [214, 140]}, {"t": 80, "ankle": [178, 196], "kb": 1, "ft": 0, "hand": [166, 132]}], "drop": [[190, 25, 220, 120, "lr"]], "lever": {"from": [200, 30], "to": "grip", "grip": [10, 0]}}},
    plate_high_row: {"seated_row": {"at": [116, 150], "k": 1.05, "over": [{"t": 90, "ankle": [190, 196], "kb": 1, "ft": 0, "hand": [196, 50]}, {"t": 94, "ankle": [190, 196], "kb": 1, "ft": 0, "hand": [164, 96]}], "drop": [[160, 20, 262, 75]], "lever": {"from": [252, 42], "to": "grip", "curve": 18, "plates": 20, "at": 0.4, "w": 9, "grip": [4, 8]}}},
    leg_extension_machine: {"leg_extension": {"at": [118, 132], "k": 1.2, "noDyn": true, "drop": [[165, 136, 198, 204]], "lever": {"from": [176, 140], "to": "ankle", "dx": 2, "dy": -6, "w": 6, "pad": 9}}},
    seated_leg_curl_machine: {"leg_curl_seated": {"at": [112, 132], "k": 1.2, "noDyn": true, "drop": [[182, 125, 250, 145]], "lever": {"from": [186, 140], "to": "ankle", "dy": 4, "w": 6, "pad": 9}}, "leg_curl": {"at": [112, 132], "k": 1.2, "noDyn": true, "drop": [[182, 125, 250, 145]], "lever": {"from": [186, 140], "to": "ankle", "dy": 4, "w": 6, "pad": 9}, "as": "leg_curl_seated"}},
    lying_leg_curl_machine: {"leg_curl": {"at": [150, 122], "k": 1.2, "noDyn": true, "drop": [[26, 112, 64, 150]], "lever": {"from": [60, 146], "to": "ankle", "dy": -8, "w": 6, "pad": 9}}},
    leg_press_45: {"leg_press": {"at": [100, 168], "k": 1.0, "noDyn": true, "over": [{"t": 136, "ankle": [161.4, 115.1], "kb": 1, "ft": 135, "hand": [116, 162], "eb": 1}, {"t": 136, "ankle": [185.4, 91.1], "kb": 1, "ft": 135, "hand": [116, 162], "eb": 1}], "carry": [{"box": [140, 50, 230, 160], "to": "ankle", "axis": [1, -1]}]}},
    biceps_curl_machine: {"preacher_curl": {"at": [110, 132], "k": 1.15, "drop": [[180, 66, 232, 136]], "lever": {"from": [186, 132], "to": "grip", "grip": [8, 0]}}},
    preacher_bench: {"preacher_curl": {"at": [96, 142], "k": 1.15}},
    pec_deck: {"pec_deck": {"at": [160, 148], "k": 1.1, "drop": [[84, 40, 236, 120, "lp"]], "levers": [{"from": [160, 44], "to": "haL", "grip": [0, 14], "w": 6}, {"from": [160, 44], "to": "haR", "grip": [0, 14], "w": 6}]}, "reverse_fly": {"at": [160, 148], "k": 1.1, "drop": [[84, 40, 236, 120, "lp"]], "levers": [{"from": [160, 44], "to": "haL", "grip": [0, 14], "w": 6}, {"from": [160, 44], "to": "haR", "grip": [0, 14], "w": 6}]}},
    lateral_raise_machine: {"lateral_raise": {"at": [160, 150], "k": 1.1, "drop": [[88, 60, 232, 130, "lp"]], "levers": [{"from": [138, 70], "to": "elL", "pad": 8, "out": 6, "w": 6}, {"from": [182, 70], "to": "elR", "pad": 8, "out": 6, "w": 6}], "over": {"pel": [160, 140], "thS": 0.45, "th": -60, "sh": -90, "floor": true}}},
    hip_machine: {"hip_abduction_seated": {"at": [160, 144], "k": 1.1, "drop": [[90, 148, 230, 200, "l"]], "levers": [{"from": [160, 178], "to": "knL", "pad": 9, "out": 10, "w": 6}, {"from": [160, 178], "to": "knR", "pad": 9, "out": 10, "w": 6}]}, "hip_adduction_seated": {"at": [160, 144], "k": 1.1, "drop": [[90, 148, 230, 200, "l"]], "levers": [{"from": [160, 178], "to": "knL", "pad": 9, "out": -10, "w": 6}, {"from": [160, 178], "to": "knR", "pad": 9, "out": -10, "w": 6}]}},
    cable_crossover: {"cable_fly": {"at": [160, 0], "k": 0.85, "stand": true, "pulleys": [[70, 34], [250, 34]], "drop": [[66, 30, 254, 116, "l"]]}, "reverse_fly": {"at": [160, 0], "k": 0.85, "stand": true, "cross": true, "pulleys": [[70, 34], [250, 34]], "drop": [[66, 30, 254, 116, "l"]]}},
    triceps_machine: {"dip": {"at": [116, 145], "k": 1.15, "over": [{"hip": [140, 148], "t": 90, "th": 0, "sh": -90, "hand": [152, 122], "eb": 1}, {"hip": [140, 148], "t": 90, "th": 0, "sh": -90, "hand": [148, 154], "eb": 1}], "drop": [[164, 26, 196, 116, "l"]], "lever": {"from": [174, 28], "to": "grip", "grip": [11, 0], "w": 6}}},
    seated_calf_machine: {"seated_calf_raise": {"at": [104, 143], "k": 1.05, "carry": [{"box": [124, 110, 240, 156], "to": "knee"}]}, "calf_raise": {"at": [104, 143], "k": 1.05, "carry": [{"box": [124, 110, 240, 156], "to": "knee"}], "as": "seated_calf_raise"}},
    captains_chair: {"hanging_leg_raise": {"joint": "shoulder", "at": [129, 16], "k": 1.1, "over": {"hand": null, "ua": -90, "fa": 0, "eb": 1}}},
    dip_station: {"dip": {"joint": "hand", "at": [150, 117], "k": 1.0}},
    flat_bench: {"bench_press": {"at": [175, 120], "k": 1.05}, "skull_crusher": {"at": [175, 120], "k": 1.05}, "pullover": {"at": [175, 120], "k": 1.05}},
    adjustable_bench: {"incline_press": {"at": [176, 128], "k": 1.1, "over": {"t": 131}}, "incline_curl": {"at": [176, 128], "k": 1.1, "over": {"t": 131}}},
    bench_station: {"bench_press": {"at": [206, 126], "k": 1.1, "drop": [[60, 56, 128, 120, "c"]]}},
    incline_station: {"incline_press": {"at": [200, 134], "k": 1.1, "over": {"t": 135}, "drop": [[74, 24, 136, 80, "c"]]}},
    decline_station: {"decline_press": {"at": [175, 123], "k": 1.1, "over": {"t": 195, "ankle": [252, 121], "kb": 1}, "drop": [[44, 76, 96, 128, "c"]]}},
    plate_incline_press: {"incline_press": {"at": [116, 148], "k": 1.15, "over": [{"t": 123, "hand": [216, 72], "eb": 1}, {"t": 123, "hand": [178, 100], "eb": -1}], "drop": [[0, 0, 320, 205, "a"], [120, 40, 160, 75, "l"], [20, 110, 80, 165, "c"]], "lever": {"from": [40, 170], "ctrl": [60, 80], "to": "grip", "plates": 22, "at": 0.2, "w": 9, "grip": [9, -4]}}},
    plate_decline_press: {"decline_press": {"as": "machine_chest_press", "at": [114, 145], "k": 1.2, "over": [{"hand": [146, 118], "eb": -1}, {"hand": [184, 134], "eb": 1}], "drop": [[30, 20, 230, 200, "a"], [100, 80, 160, 130, "l"], [40, 90, 100, 160, "c"]], "lever": {"from": [64, 176], "ctrl": [70, 84], "to": "grip", "plates": 20, "at": 0.3, "w": 9, "grip": [9, 3]}}},
    cable_station: {"pushdown": {"station": {"x": 174, "y0": 123, "box": [166, 106, 200, 140]}, "flip": true, "k": 1.0, "drop": [[96, 118, 180, 166, "l"]], "at": [0, 0]}, "curl": {"station": {"x": 174, "y0": 123, "box": [166, 106, 200, 140]}, "flip": true, "k": 1.0, "drop": [[96, 118, 180, 166, "l"]], "at": [0, 0]}, "straight_arm_pulldown": {"station": {"x": 174, "y0": 123, "box": [166, 106, 200, 140]}, "flip": true, "k": 1.0, "drop": [[96, 118, 180, 166, "l"]], "at": [0, 0]}, "face_pull": {"station": {"x": 174, "y0": 123, "box": [166, 106, 200, 140]}, "flip": true, "k": 1.0, "drop": [[96, 118, 180, 166, "l"]], "at": [0, 0]}},
    stair_climber: {"stairs": {"at": [145, 84], "k": 1.0}},
    pullup_bar: {"pull_up": {"joint": "hand", "at": [160, 34], "k": 0.88, "over": [{}, {"hip": [148, 96], "t": 88, "eb": 1}]}, "hanging_leg_raise": {"joint": "hand", "at": [160, 34], "k": 0.88}},
    assisted_pullup: {"pull_up": {"joint": "hand", "at": [205, 30], "k": 0.9, "over": [{"th": -92, "sh": -178, "ft": -80}, {"hip": [148, 96], "t": 88, "th": -92, "sh": -178, "ft": -80, "eb": 1}], "drop": [[98, 186, 160, 200, "l"]], "lever": {"from": [100, 194], "to": "knee", "dx": -20, "dy": 13, "w": 5}, "carry": [{"box": [104, 180, 210, 200], "to": "knee", "axis": [0, 1]}]}},
    hyper_bench: {"back_extension": {"joint": "ankle", "at": [108, 176], "k": 1.3}},
    ab_bench: {"sit_up": {"at": [188, 112], "k": 1.1, "over": [{"t": 203, "ankle": [213, 181], "kb": 1, "floor": false, "on": null}, {"t": 120, "ankle": [213, 181], "kb": 1, "floor": false, "on": null}]}},
    ab_crunch_machine: {"crunch": {"at": [116, 145], "k": 1.15, "over": [{"hip": [140, 148], "t": 96, "th": 0, "sh": -90, "ankle": null, "floor": false, "on": null}, {"hip": [140, 148], "t": 66, "th": 0, "sh": -90, "ankle": null, "floor": false, "on": null}], "drop": [[118, 26, 170, 100, "lp"]], "lever": {"from": [146, 28], "to": "shoulder", "dx": 12, "dy": 6, "pad": 8, "w": 6}}},
    treadmill: {"walk": {"at": [150, 0], "k": 0.95, "stand": 188}, "run": {"at": [150, 0], "k": 0.95, "stand": 188}},
    upright_bike: {"cycle": {"from": [164, 170], "at": [170, 168], "k": 1.0, "drop": [[166, 164, 188, 188, "l"]]}},
    rower: {"rower": {"joint": "ankle", "at": [210, 178], "k": 1.0, "noDyn": true, "pulley": [230, 160], "drop": [[180, 140, 232, 164, "l"]], "carry": [{"box": [66, 166, 114, 182, "r"], "to": "hip", "axis": [1, 0]}]}},
    arm_bike: {"arm_bike": {"from": [176, 98], "at": [190, 92], "k": 1.0, "drop": [[170, 70, 212, 116, "l"]]}},
    leg_press_seated: {"leg_press": {"at": [110, 150], "k": 1.0, "noDyn": true, "over": [{"t": 110, "ankle": [182, 130], "kb": 1, "ft": 90, "hand": [146, 166], "eb": 1}, {"t": 110, "ankle": [208, 130], "kb": 1, "ft": 90, "hand": [146, 166], "eb": 1}], "carry": [{"box": [170, 90, 216, 194], "to": "ankle", "axis": [1, 0]}]}},
    standing_calf_machine: {"calf_raise": {"joint": "toe", "at": [176, 180], "k": 0.8, "over": [{}, {"hip": [158.8, 76.4], "ankle": [160.8, 166.4], "ft": -50}], "drop": [[92, 46, 172, 68]], "lever": {"from": [96, 50], "to": "shoulder", "dy": -8, "w": 6, "pad": 9}}},
    glute_machine: {"glute_machine": {"at": [140, 110], "k": 1.0, "drop": [[118, 108, 160, 196, "l"]]}},
    decline_bench: {"decline_press": {"at": [158, 118], "k": 1.1, "over": {"t": 195, "ankle": [252, 121], "kb": 1}}},
  };
  PT.machineFit = FIT;

  /* ================================================================ drawing on the machine */
  const ptsOf = p => p.k === "l" ? [p.a, p.b] : p.k === "p" || p.k === "g" ? p.pts : p.k === "c" ? [p.at] : p.k === "r" ? [[p.x, p.y], [p.x + p.w, p.y + p.h]]
    : p.k === "path" ? (String(p.d).match(/-?\d+(\.\d+)?/g) || []).map(Number).reduce((a, v, i, arr) => (i % 2 ? a.concat([[arr[i - 1], v]]) : a), []) : [];
  const inBox = (q, b) => q[0] >= b[0] && q[0] <= b[2] && q[1] >= b[1] && q[1] <= b[3];
  // a drop box is [x1, y1, x2, y2] or [x1, y1, x2, y2, "lc"] (only those kinds of part: l line, p polyline, c circle, r rect, g polygon, a path)
  const KC = { l: "l", p: "p", c: "c", r: "r", g: "g", path: "a" };
  const dropped = (p, boxes) => (boxes || []).some(b => { if (b[4] && b[4].indexOf(KC[p.k]) < 0) return false; const q = ptsOf(p); return q.length && q.every(x => inBox(x, b)); });
  function flipPart(p) {
    const fx = q => [W - q[0], q[1]], o = Object.assign({}, p);
    if (p.k === "l") { o.a = fx(p.a); o.b = fx(p.b); }
    else if (p.k === "p" || p.k === "g") o.pts = p.pts.map(fx);
    else if (p.k === "c") o.at = fx(p.at);
    else if (p.k === "r") o.x = W - p.x - p.w;
    else if (p.k === "path") o.d = String(p.d).replace(/(-?\d+(?:\.\d+)?)[ ,]+(-?\d+(?:\.\d+)?)/g, (m, x, y) => `${W - parseFloat(x)} ${y}`);
    return o;
  }
  const lineP = (a, b, w, c) => ({ k: "l", a, b, w, c });
  const dataUrl = s => "data:image/svg+xml;charset=utf-8," + encodeURIComponent(s);

  /** one pose j of movement id on machine eq; fit = the box every picture of the demo shares (so the machine does not grow or
   *  shrink while it plays), or none to just measure */
  function shift(p, d) {
    const m = q => [q[0] + d[0], q[1] + d[1]], o = Object.assign({}, p);
    if (p.k === "l") { o.a = m(p.a); o.b = m(p.b); } else if (p.k === "p" || p.k === "g") o.pts = p.pts.map(m); else if (p.k === "c") o.at = m(p.at);
    else if (p.k === "r") { o.x = p.x + d[0]; o.y = p.y + d[1]; }
    else if (p.k === "path") { let i = 0; o.d = String(p.d).replace(/-?\d+(?:\.\d+)?/g, v => (parseFloat(v) + d[i++ % 2]).toFixed(1)); }
    return o;
  }
  let LAST = null;   // the last placement draw() used (posesOf reads it)
  /* start: the demo's first pose (the figure is placed by it; carried parts move by how far a joint has moved from it) */
  function draw(fe, eq, id, kit, j, hi, fit, start) {
    const e = E.EQUIP[eq]; if (!e) return null;
    let parts = e.draw(); if (fe.flip) parts = parts.map(flipPart);
    parts = parts.filter(p => !dropped(p, fe.drop));
    const j0 = start || F.layout(id, kit).frames[0].j, jn = fe.joint || (j0.view === "front" ? "pel" : "hip"), an = fe.from || j0[jn];   // from: the figure point (pattern units) that goes at "at"
    const k = fe.k || 1.3; let tx, ty, pul = fe.pulley || null;
    const feet = Math.max(...["ankle", "ankle2", "toe", "toe2", "anR", "anL", "toR", "toL"].filter(q => j0[q]).map(q => j0[q][1])) + 5;
    if (fe.station) {
      // a cable station: the figure stands where its own drawing puts it from the cable, feet on the floor; the pulley slides to the
      // height the cable comes from (with its carriage)
      const st = fe.station, c = F.cableOf(id, j0, 0);
      ty = (E.F - 2) - k * feet; tx = st.x - k * c[0];
      const yp = Math.max(st.min || 30, Math.min(st.max || 196, c[1] * k + ty));
      parts = parts.map(p => (dropped(p, [st.box]) ? shift(p, [0, yp - st.y0]) : p));
      pul = [st.x, yp];
    } else { tx = fe.at[0] - an[0] * k; ty = fe.stand ? (typeof fe.stand === "number" ? fe.stand : E.F - 2) - k * feet : fe.at[1] - an[1] * k; }   // stand: feet on the floor (or on the surface at that y)
    const T = q => [q[0] * k + tx, q[1] * k + ty];
    LAST = { k, tx, ty };
    // carry: the machine's own moving parts (a leg press sled, a Smith bar, a hack squat's pads) slide with a joint, along axis if given
    (fe.carry || []).forEach(cr => {
      const a = j[cr.to], b = j0[cr.to]; if (!a || !b) return;
      let d = [(a[0] - b[0]) * k, (a[1] - b[1]) * k];
      if (cr.axis) { const l = Math.hypot(cr.axis[0], cr.axis[1]) || 1, u = [cr.axis[0] / l, cr.axis[1] / l], t = d[0] * u[0] + d[1] * u[1]; d = [u[0] * t, u[1] * t]; }
      if (cr.off) d = [d[0] + cr.off[0], d[1] + cr.off[1]];   // where it sits at the start, if not where it is drawn
      parts = parts.map(p => (dropped(p, [cr.box]) ? shift(p, d) : p));
    });
    const fig = F.bare(id, kit, j, hi, { noCable: !!(pul || fe.pulleys || fe.noCable), noBack: !!fe.noBack, noDyn: !!fe.noDyn });
    const under = [], over = [];
    // a lever from its pivot to a joint (bent like the machine's arm by curve px, with plates on it), a handle across the hand, a pad
    (fe.levers || (fe.lever ? [fe.lever] : [])).forEach(L => {
      const at = j[L.to]; if (!at) return;
      const tip = T([at[0] + (L.dx || 0), at[1] + (L.dy || 0)]), w = L.w || 7, to = L.over ? over : under;
      if (L.out && j.pel) tip[0] += Math.sign(tip[0] - T(j.pel)[0]) * L.out;   // a pad on the outside (or, out < 0, the inside) of a knee or elbow
      if (L.from && (L.curve || L.ctrl)) {
        // ctrl (3.21.0): a fixed control point, so a plate-loaded arm keeps its shape (and its plates stay behind the back pad) as it moves
        const a = L.from, mx = (a[0] + tip[0]) / 2, my = (a[1] + tip[1]) / 2, dx = tip[0] - a[0], dy = tip[1] - a[1], l = Math.hypot(dx, dy) || 1;
        const cx = L.ctrl ? L.ctrl[0] : mx + dy / l * L.curve, cy = L.ctrl ? L.ctrl[1] : my - dx / l * L.curve;
        to.push({ k: "path", d: `M${a[0].toFixed(1)} ${a[1].toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${tip[0].toFixed(1)} ${tip[1].toFixed(1)}`, c: KIT, w: w });
        if (L.plates) { const u = L.at == null ? 0.5 : L.at, px = (1 - u) * (1 - u) * a[0] + 2 * u * (1 - u) * cx + u * u * tip[0], py = (1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * cy + u * u * tip[1]; to.push({ k: "c", at: [px, py], r: L.plates, fill: "#52525b", stroke: PL, sw: 2.5 }, { k: "c", at: [px, py], r: 3, fill: PL, stroke: PL, sw: 0 }); }
        to.push({ k: "c", at: a, r: 4, fill: LITE, stroke: LITE, sw: 0 });
      } else if (L.from) to.push(lineP(L.from, tip, w, KIT));
      if (L.grip) over.push(lineP([tip[0] - L.grip[0], tip[1] - L.grip[1]], [tip[0] + L.grip[0], tip[1] + L.grip[1]], 6, LITE));
      if (L.pad) over.push({ k: "c", at: tip, r: L.pad, fill: PADF, stroke: PADS, sw: 2 });
      if (L.shape) (L.over ? over : under).push({ k: "g", pts: L.shape.map(o => [tip[0] + o[0], tip[1] + o[1]]), fill: PADF, stroke: PADS, sw: 2 });
    });
    if (pul) { const g = j.grip || j.hand; if (g) over.push(lineP(pul, T(g), 2, PL)); }
    if (fe.pulleys) {   // one cable from each pulley to the nearest hand
      const hands = [j.grip, j.grip2, j.hand2, j.haL, j.haR].filter(Boolean).map(T), used = new Set();
      // cross (3.21.1): each cable goes to the far hand (a rear delt fly holds the cables crossed)
      fe.pulleys.forEach(pp => { let bi = -1, bd = 1e9; hands.forEach((h, i) => { const d = Math.abs(h[0] - pp[0]) * (fe.cross ? -1 : 1); if (!used.has(i) && d < bd) { bd = d; bi = i; } }); if (bi >= 0) { used.add(bi); over.push(lineP(pp, hands[bi], 2, PL)); } });
    }
    const [bx1, by1, bx2, by2] = E.bbox(parts.concat(under, over)), fb = fig.box;
    const box = [Math.min(bx1, fb[0] * k + tx), Math.min(by1, fb[1] * k + ty), Math.max(bx2, fb[2] * k + tx), Math.max(by2, fb[3] * k + ty, E.F)];
    if (!fit) return { box };
    const [x1, y1, x2, y2] = fit;
    const M = 12, s = Math.min(1.25, (W - 2 * M) / (x2 - x1), (H - 2 * M) / (y2 - y1));
    const ox = (W - (x2 - x1) * s) / 2 - x1 * s, oy = (H - M + 2) - y2 * s;
    const floor = fe.floor === false ? "" : `<line x1="${x1 - 6}" y1="${E.F}" x2="${x2 + 6}" y2="${E.F}" stroke="#3f3f46" stroke-width="3" stroke-linecap="round"/>`;
    return { box, svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${PT.esc(e.label)}"><rect width="${W}" height="${H}" rx="14" fill="${E.BG}"/>`
      + `<g transform="translate(${ox.toFixed(1)} ${oy.toFixed(1)}) scale(${s.toFixed(4)})">${floor}${E.emit(parts)}${E.emit(under)}<g transform="matrix(${k} 0 0 ${k} ${tx.toFixed(1)} ${ty.toFixed(1)})">${fig.svg}</g>${E.emit(over)}</g></svg>` };
  }

  /* ================================================================ the demo */
  function fitFor(name) {
    let q = null; try { q = E.of(name); } catch (e) { q = null; }
    const eq = q && q.items && q.items[0], c = F.classify(name), mv = c && (c.draw || c.id), f = eq && FIT[eq];
    if (!f || !mv) return null;
    const fe = f.at ? (!f.for || f.for.includes(mv) ? f : null) : f[mv];
    return fe ? { fe, eq, mv } : null;
  }
  function machineDemo(key, m) {
    let start = null; const ps = [];
    F.demoWith(key, (j, id, kit) => { if (!start) start = j; ps.push(draw(m.fe, m.eq, id, kit, j, null, null, start).box); return "x"; }, m.fe.over, m.fe.as);
    if (!ps.length) return null;
    const box = [Math.min(...ps.map(b => b[0])), Math.min(...ps.map(b => b[1])), Math.max(...ps.map(b => b[2])), Math.max(...ps.map(b => b[3]))];
    const out = F.demoWith(key, (j, id, kit, hi) => dataUrl(draw(m.fe, m.eq, id, kit, j, hi, box, start).svg), m.fe.over, m.fe.as);
    if (out) out.machine = m.eq;
    return out;
  }
  const CACHE = new Map(), oDemo = F.demo;
  F.demo = function (name) {
    const key = String(name || ""); if (CACHE.has(key)) return CACHE.get(key);
    const m = fitFor(key); let out = null;
    if (m) { try { out = machineDemo(key, m); } catch (e) { console.error("PulseTrack machine demo", e); out = null; } }
    if (!out || out.frames.some(x => !x)) out = oDemo(key);
    if (CACHE.size > 30) CACHE.clear();
    CACHE.set(key, out); return out;
  };
  /** 3.21.0: the joints of each picture of a machine demo, in the machine's own coordinates (for tests) */
  function posesOf(name) {
    const m = fitFor(name); if (!m) return null;
    let start = null; const frames = [];
    F.demoWith(String(name), (j, id, kit) => {
      if (!start) start = j; draw(m.fe, m.eq, id, kit, j, null, null, start); const P = LAST, T = q => q && [q[0] * P.k + P.tx, q[1] * P.k + P.ty], o = {};
      Object.keys(j).forEach(q => { if (Array.isArray(j[q]) && j[q].length === 2 && typeof j[q][0] === "number") o[q] = T(j[q]); });
      frames.push(o); return "x";
    }, m.fe.over, m.fe.as);
    return { machine: m.eq, movement: m.mv, fe: m.fe, frames };
  }
  PT.machineDemo = { fitFor, FIT, posesOf, clear: () => CACHE.clear() };
})();
