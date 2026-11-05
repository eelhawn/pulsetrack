
/* =====================================================================
 * PulseTrack 2.33.0: strength levels for every exercise.
 * The big lifts (bench, squat, deadlift) use the StrengthLevel.com tables already in the app.
 * Every other exercise is graded as a share of one of those lifts (a dumbbell curl is a share of the
 * press, a leg extension a share of the squat, and so on). Pull-ups and dips use bodyweight ratios,
 * and push-ups, sit-ups and the like use reps. These are estimates, not lab standards.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined" || !PT.strengthThresholds) return;
  const proto = ApplicationUI.prototype;
  const A = () => window.app;
  const $ = id => document.getElementById(id);
  const esc = s => PT.esc(s);
  const LB = 2.2046226;
  const S = a => a.sessions || [];
  const toLb = (v, from) => (from === "kg" ? v * LB : v);
  const sessTime = s => s.ts || (PT.fromDs && PT.fromDs(s.date) ? PT.fromDs(s.date).getTime() : 0);
  const LEVELS = ["Beginner", "Novice", "Intermediate", "Advanced", "Elite"];
  const COLS = ["#a1a1aa", "#38bdf8", "#34d399", "#a78bfa", "#fbbf24"];

  /* ============================================================== the standards
   * w(ref, f)      weight lifted, as a share f of the 1RM standard for the reference lift (bench, squat, deadlift, ohp)
   * bw(ratios)     pull-ups and dips: 1RM including bodyweight, as a multiple of bodyweight
   * reps(list)     bodyweight moves: reps in one set (extra weight counts as extra reps)
   * null           timed holds, carries, stretches, bands: not graded */
  const w = (ref, f, alt) => ({ k: "w", ref, f, alt });
  const NONE = null;

  /* ---- StrengthLevel.com community standards, men, lb, 1RM (dumbbells are per hand), read 2026: Beginner, Novice, Intermediate, Advanced, Elite.
   *      All of these come from the same community table, so an exercise is graded as the SAME SHARE of the matching big-lift standard
   *      that it is in this table, level by level (a lat pulldown is 87% of a bench at Beginner and 84% at Elite, a leg extension 65% to 82% of a squat).
   *      The big-lift standards themselves are the by-bodyweight tables, so your body weight and Men / Women still apply. ---- */
  const SL = {
    bench: [107, 154, 212, 280, 353], squat: [145, 209, 289, 382, 482], deadlift: [176, 249, 340, 445, 558], ohp: [65, 97, 137, 185, 236],
    legExt: [94, 149, 219, 303, 395], hack: [129, 217, 335, 478, 637], legPress: [146, 243, 370, 525, 697], smithSquat: [105, 167, 246, 341, 445],
    front: [120, 170, 231, 303, 380], goblet: [31, 55, 88, 129, 174], bbBulg: [37, 80, 143, 224, 318], dbBulg: [25, 43, 69, 101, 136],
    bbLunge: [66, 114, 178, 256, 343], dbLunge: [18, 37, 63, 96, 134], hipAbd: [76, 130, 203, 292, 392], hipThrust: [100, 188, 309, 460, 631],
    legCurlLy: [58, 94, 140, 195, 257], legCurlSe: [77, 121, 176, 243, 316], calfBar: [97, 171, 271, 395, 534], calfMach: [95, 181, 302, 453, 625], calfSeat: [61, 119, 200, 302, 418],
    rdl: [129, 191, 270, 362, 462], dbRdl: [36, 60, 92, 130, 173], dbDead: [28, 54, 90, 136, 188], sumo: [198, 275, 370, 478, 594], shrug: [103, 178, 279, 401, 539], dbShrug: [31, 58, 93, 138, 188],
    smithBench: [99, 144, 199, 264, 334], inclineBench: [96, 138, 190, 251, 317], cgbp: [108, 152, 206, 268, 336], dbBench: [37, 58, 85, 117, 153], inclDb: [41, 60, 83, 110, 140],
    chestPress: [75, 124, 189, 267, 354], machineFly: [81, 127, 188, 260, 339], dbFly: [16, 30, 50, 76, 105], cableFly: [15, 39, 76, 126, 186],
    latPull: [93, 132, 180, 235, 295], tbar: [74, 119, 177, 248, 327], pendlay: [108, 150, 202, 262, 325], bor: [94, 137, 192, 255, 325], scr: [91, 133, 186, 246, 313], dbRow: [36, 60, 91, 129, 171],
    pushdown: [33, 60, 98, 144, 196], lte: [37, 61, 92, 129, 171], dbTri: [11, 25, 45, 72, 103],
    dbSp: [29, 45, 67, 93, 121], machSp: [54, 100, 162, 239, 326], arnold: [21, 34, 52, 74, 98], lat: [10, 20, 35, 53, 75], frontR: [8, 20, 37, 59, 85],
    facePull: [30, 59, 100, 151, 209], cableUpright: [45, 84, 137, 203, 278], dbUpright: [15, 31, 53, 81, 114],
    dbCurl: [16, 29, 46, 68, 93], hammer: [20, 33, 50, 71, 94], bbCurl: [42, 67, 99, 138, 180], ezCurl: [49, 72, 100, 132, 168], preacher: [40, 64, 96, 133, 174], cableCurl: [38, 67, 108, 157, 214]
  };
  PT.slStd = SL;
  /** wr(ref, key, scale, alt, est): graded as the share of the reference lift that `key` is in the StrengthLevel table. scale / est mark the ones adjusted by hand (one arm, one leg) */
  const wr = (ref, key, scale, alt, est) => ({ k: "w", ref, f: SL[key].map((v, i) => Math.round(v / SL[ref][i] * (scale || 1) * 1000) / 1000), sl: !est && !(scale && scale !== 1), alt: alt || null });
  const fMid = st => (Array.isArray(st.f) ? st.f[2] : st.f);

  /* ---- 2.62.0: more StrengthLevel.com exercise tables, read 2026 (men, 180 lb body weight, 1RM in lb: Beginner, Novice, Intermediate, Advanced, Elite).
   *      Each one becomes a share of the matching big-lift standard AT 180 lb, so it follows your body weight and Men / Women like the rest. ---- */
  const SL180 = {
    cableCrunch: [58, 98, 151, 216, 288], reverseCurl: [35, 59, 90, 128, 171], wristCurl: [17, 48, 98, 166, 246], reverseWrist: [8, 37, 90, 165, 258],
    dbWrist: [17, 35, 60, 92, 129], uprightRow: [53, 87, 132, 187, 248]
  };
  PT.slStd180 = SL180;
  /** wx(ref, key, scale, alt, est): like wr, for the rows above (a share of the reference lift's standard at 180 lb) */
  const wx = (ref, key, scale, alt, est) => {
    const base = PT.strengthThresholds(ref, "male", 180) || SL[ref];
    return { k: "w", ref, f: SL180[key].map((v, i) => Math.round(v / base[i] * (scale || 1) * 1000) / 1000), sl: !est && !(scale && scale !== 1), alt: alt || null };
  };

  /* ---- 2.62.0: how a typed number is compared with the standard (see wMult below) ---- */
  const ONE_SIDED = /single[- ]arm|one[- ]arm|single[- ]leg|one[- ]leg|unilateral|alternating|single[- ]hand/i;
  const isDbMove = n => { try { return PT.dbCount(n) === 2 || PT.equipKey(n) === "dumbbell"; } catch (e) { return false; } };
  const convOn = a => !(a && a.settings && a.settings.slConv === false);
  /** StrengthLevel counts a dumbbell move PER HAND and a machine or cable move as the TOTAL load. What you typed is scaled to match:
   *  each side on a machine or cable x2; a total typed for dumbbells (both together) x0.5; everything else as typed. One-arm and one-leg moves, barbells and bodyweight never change.
   *  Sets saved from 2.62.0 on carry how the weight was entered (set.sm); older sets are read from the exercise's saved dumbbell count. */
  function wMult(a, e, x) {
    try {
      if (!convOn(a)) return 1;
      const n = e.name;
      if (!PT.sideEligible(n) || ONE_SIDED.test(n)) return 1;
      const db = isDbMove(n);
      if (x.sm === "e") return db ? 1 : 2;
      if (x.sm === "t") return db ? 0.5 : 1;
      if (db) return 1;                                             // dumbbell numbers have always been per hand
      const d = parseFloat(e.dbn) || 0; if (!(d > 0)) return 1;
      return (x.rm === "t" ? d * 2 : d) >= 2 ? 2 : 1;               // a saved "x2" on a machine or cable meant each side
    } catch (err) { return 1; }
  }
  PT.slMult = wMult;
  /** typed number x factor = number compared with the standard, for how this exercise is entered right now (the planner and goals divide by it to show what to type) */
  PT.slFactor = (a, name) => { try { return wMult(a, { name }, { sm: PT.sideSm ? PT.sideSm(name) : "" }) || 1; } catch (e) { return 1; } };

  /* ---- StrengthLevel.com bodyweight tables, read 2026. Rows: bodyweight (lb): Beginner, Novice, Intermediate, Advanced, Elite.
   *      u: reps = reps in one set, sec = seconds held, add = one-rep max with added weight (lb, negative = assisted) ---- */
  const rows = t => t.trim().split(/\s+/).map(r => { const [b, v] = r.split(":"); return [+b].concat(v.split(",").map(Number)); });
  const TABLES = {
    farmer: { u: "max", label: "Farmer's walk (each hand)",
      m: rows("110:8,26,54,92,139 130:12,32,63,104,152 150:16,38,71,114,165 170:19,43,78,123,176 190:23,48,85,132,186 210:26,53,91,140,196 230:30,58,97,147,205 250:33,62,103,154,213 270:36,66,109,161,221 290:39,70,114,167,228 310:42,74,119,173,235"),
      f: null },
    pullup: { u: "add", label: "Pull-ups",
      m: rows("110:-12,16,49,85,124 130:-8,23,59,99,140 150:-6,28,66,109,153 170:-5,31,72,117,164 190:-5,33,76,123,172 210:-6,34,79,128,178 230:-7,34,80,131,183 250:-10,32,81,133,186 270:-14,30,80,134,189 290:-18,27,79,134,190"),
      f: rows("90:-30,-11,13,39,68 110:-32,-9,17,46,77 130:-34,-10,19,51,84 150:-38,-11,19,53,88 170:-42,-14,18,54,90 190:-48,-18,16,53,91 210:-54,-23,12,51,90 230:-61,-29,8,47,88 250:-68,-35,3,43,85") },
    chinup: { u: "add", label: "Chin-ups",
      m: rows("110:-9,18,50,86,123 150:-2,30,68,109,152 190:-1,36,78,124,170 230:-3,37,82,131,181 270:-9,33,82,134,186"),
      f: rows("90:-22,-6,13,34,56 130:-22,-1,22,47,72 170:-27,-3,23,51,79 210:-35,-10,19,49,80 250:-47,-20,11,43,76") },
    dip: { u: "add", label: "Dips",
      m: rows("110:-11,25,68,118,171 150:3,47,100,158,219 190:13,63,122,187,254 230:18,73,137,207,280 270:19,79,147,222,299"),
      f: rows("90:-33,-8,23,59,98 130:-33,-1,37,80,126 170:-37,0,44,92,143 210:-44,-4,44,96,151 250:-55,-11,40,96,154") },
    muscleup: { u: "add", label: "Muscle-ups",
      m: rows("110:-28,-9,12,36,60 150:-23,0,26,54,83 190:-22,4,34,65,97 230:-25,4,36,71,106 270:-31,0,35,72,109"),
      f: rows("90:-31,-17,-1,17,35 130:-27,-8,12,35,58 170:-26,-5,19,45,71 210:-30,-6,21,49,77 250:-37,-11,18,48,79") },
    ringdip: { u: "reps", label: "Ring dips",
      m: rows("110:0,6,14,25,36 150:1,8,15,24,34 190:2,8,15,22,31 230:2,8,13,20,28 270:2,7,12,18,25"),
      f: rows("90:0,0,7,15,24 130:0,2,9,16,24 170:0,3,9,15,22 210:0,3,8,13,20 250:0,3,7,12,17") },
    pushup: { u: "reps", label: "Push-ups",
      m: rows("110:0,18,42,70,102 150:5,20,40,64,91 190:6,20,37,58,81 230:6,18,34,53,73 270:6,17,32,48,66"),
      f: rows("90:0,5,19,36,55 130:0,7,18,32,48 170:0,7,16,28,41 210:0,6,14,25,36 250:0,5,12,21,31") },
    inclinepush: { u: "reps", label: "Incline push-ups",
      m: rows("110:0,8,29,57,87 150:0,12,31,55,80 190:0,13,31,51,73 230:2,14,29,47,67 270:2,13,27,44,62"),
      f: rows("90:0,1,14,31,50 130:0,6,17,32,47 170:0,7,17,30,43 210:0,7,16,27,39 250:0,7,15,25,35") },
    declinepush: { u: "reps", label: "Decline push-ups",
      m: rows("110:0,9,25,44,65 150:2,13,28,45,63 190:5,15,28,43,59 230:6,15,28,41,55 270:7,15,26,39,51"),
      f: rows("90:0,4,15,29,44 130:0,7,17,29,42 170:0,8,16,27,38 210:1,8,15,24,34 250:0,7,14,22,30") },
    diamond: { u: "reps", label: "Diamond push-ups",
      m: rows("110:0,8,22,40,59 160:1,11,24,38,54 210:3,12,23,35,48 260:4,11,21,32,43 310:3,10,19,29,39"),
      f: rows("90:0,0,9,21,33 130:0,5,13,23,33 170:0,7,13,22,31 210:0,7,13,20,28 260:0,6,11,18,25") },
    archer: { u: "reps", label: "Archer push-ups",
      m: rows("110:0,5,15,28,43 160:0,7,16,27,39 210:0,7,15,24,34 260:0,7,13,22,30 310:0,6,11,19,27"),
      f: rows("90:0,0,10,24,39 130:0,4,12,24,36 170:0,5,12,22,32 210:0,4,11,19,28 260:0,3,9,17,24") },
    pike: { u: "reps", label: "Pike push-ups",
      m: rows("110:0,3,15,30,47 150:0,7,17,30,44 190:0,8,17,28,41 230:0,8,16,26,37 270:0,7,15,24,34"),
      f: rows("90:0,3,10,20,31 130:0,4,11,19,27 170:0,4,10,16,24 210:0,3,8,14,20 250:0,2,7,11,17") },
    hspu: { u: "reps", label: "Handstand push-ups",
      m: rows("110:0,0,8,20,35 150:0,1,10,22,34 190:0,3,11,21,31 230:0,3,10,19,29 270:0,3,10,18,26"),
      f: rows("90:0,0,9,20,32 130:0,1,9,18,28 170:0,1,8,15,23 210:0,0,7,12,20 250:0,0,5,10,17") },
    benchdip: { u: "reps", label: "Bench dips",
      m: rows("110:0,10,31,56,85 150:0,13,31,53,77 190:2,14,30,49,70 230:3,14,28,45,63 270:3,13,26,42,58"),
      f: rows("90:0,8,21,37,54 130:0,9,20,33,46 170:0,8,17,28,40 210:0,7,15,24,34 250:0,6,12,21,30") },
    situp: { u: "reps", label: "Sit-ups",
      m: rows("110:5,32,69,115,167 150:5,27,57,94,136 190:4,23,49,80,114 230:3,20,42,69,98 270:2,17,37,60,86"),
      f: rows("90:0,19,54,99,151 130:0,16,44,79,118 170:0,13,36,65,97 210:0,10,30,55,82 250:0,8,25,47,70") },
    declsit: { u: "reps", label: "Decline sit-ups",
      m: rows("110:0,13,34,59,87 150:1,14,32,54,77 190:2,14,30,48,68 230:3,13,27,43,61 270:2,12,25,39,55"),
      f: rows("90:0,10,28,48,71 130:0,11,25,42,60 170:0,10,22,37,52 210:0,9,19,32,45 250:0,8,17,28,39") },
    crunch: { u: "reps", label: "Crunches",
      m: rows("110:0,22,57,101,152 150:1,22,52,89,130 190:3,22,47,79,113 230:3,20,43,70,101 270:3,18,39,64,90"),
      f: rows("90:0,16,51,96,148 130:0,15,43,78,118 170:0,13,37,65,98 210:0,11,31,56,83 250:0,9,27,48,72") },
    lyingleg: { u: "reps", label: "Lying leg raises",
      m: rows("110:0,10,33,61,92 150:0,12,31,55,80 190:0,11,29,49,71 230:0,11,26,44,63 270:0,10,23,39,56"),
      f: rows("90:0,7,27,53,83 130:0,9,27,48,71 170:0,9,24,42,62 210:0,9,22,37,54 250:0,8,19,33,48") },
    hangleg: { u: "reps", label: "Hanging leg raises",
      m: rows("110:0,5,16,29,43 150:0,8,17,29,41 190:1,9,17,27,37 230:2,9,16,25,34 270:2,8,15,23,31"),
      f: rows("90:0,3,12,23,35 130:0,7,14,24,34 170:0,7,14,22,30 210:1,7,12,20,27 250:0,6,11,18,24") },
    ttb: { u: "reps", label: "Toes to bar",
      m: rows("110:0,2,12,25,39 150:0,6,15,26,38 190:0,7,15,25,35 230:0,7,15,23,33 270:1,7,13,22,30"),
      f: rows("90:0,1,9,18,28 130:0,5,11,19,27 170:0,5,10,17,24 210:0,5,10,15,22 250:0,4,9,13,19") },
    abwheel: { u: "reps", label: "Ab wheel rollouts",
      m: rows("110:0,3,19,39,62 154:0,7,21,38,57 198:0,8,20,35,52 243:0,8,19,32,47 287:0,7,17,29,42"),
      f: rows("88:0,0,12,26,41 132:0,5,14,26,39 176:0,6,14,24,34 220:0,6,13,21,30 265:0,5,11,19,27") },
    invrow: { u: "reps", label: "Inverted rows",
      m: rows("110:0,5,17,34,51 150:0,8,19,33,48 190:0,9,19,32,45 230:1,9,18,29,41 270:1,9,17,27,37"),
      f: rows("90:0,1,10,20,31 130:0,6,13,21,30 170:0,7,13,20,28 210:1,7,12,19,25 250:1,6,11,17,23") },
    backext: { u: "reps", label: "Back extensions",
      m: rows("110:0,11,28,49,71 150:3,15,30,47,66 190:5,15,29,45,61 230:6,15,28,41,56 270:6,15,26,38,51"),
      f: rows("90:2,12,25,41,57 130:5,14,25,37,50 170:6,13,22,33,44 210:5,11,20,29,39 250:4,10,17,26,34") },
    bwsquat: { u: "reps", label: "Bodyweight squats",
      m: rows("110:2,29,68,118,175 150:3,26,58,98,143 190:3,22,50,84,121 230:2,19,44,73,105 270:1,17,38,64,92"),
      f: rows("90:0,14,49,94,147 130:0,13,41,76,117 170:0,11,34,64,97 210:0,9,29,54,82 250:0,8,25,47,71") },
    pistol: { u: "reps", label: "Pistol squats",
      m: rows("110:0,1,11,24,38 150:0,4,13,24,36 190:0,5,13,22,33 230:0,5,12,21,30 270:0,5,11,19,27"),
      f: rows("90:0,0,7,15,25 130:0,2,9,16,24 170:0,3,9,14,21 210:0,2,8,13,19 250:0,2,7,11,16") },
    bwcalf: { u: "reps", label: "Bodyweight calf raises",
      m: rows("110:7,35,75,124,180 150:7,30,63,102,146 190:6,26,54,87,123 230:5,22,46,75,106 270:4,19,41,66,94"),
      f: rows("90:0,17,50,92,140 130:0,17,44,78,115 170:0,16,39,67,97 210:0,14,34,58,84 250:0,12,30,51,74") },
    rtwist: { u: "reps", label: "Russian twists",
      m: rows("110:0,23,54,93,137 150:0,18,44,75,109 190:0,15,36,62,91 230:0,11,30,53,77 270:0,9,26,45,67"),
      f: rows("90:0,15,40,72,108 130:0,13,34,59,86 170:0,11,28,49,71 210:0,9,24,41,60 250:0,7,20,35,52") },
    mtnclimb: { u: "reps", label: "Mountain climbers",
      m: rows("130:0,22,56,98,147 160:0,19,49,85,127 190:0,17,43,75,112 220:0,15,38,67,100 250:0,13,34,61,90"),
      f: rows("110:0,20,49,84,125 140:0,15,39,68,101 170:0,11,31,57,85 200:0,8,26,48,72 230:0,6,21,41,63") },
    plank: { u: "sec", label: "Planks",
      m: rows("110:7,43,91,147,207 150:12,41,82,128,177 190:11,37,72,112,154 230:9,32,63,98,134 270:6,28,55,86,119"),
      f: rows("90:17,45,83,126,170 130:16,38,68,102,137 170:11,30,55,83,112 210:6,24,44,68,93 250:1,18,34,56,78") },
    sideplank: { u: "sec", label: "Side planks",
      m: rows("110:1,25,50,82,114 150:7,26,48,74,102 190:7,24,43,65,89 230:5,21,37,57,78 270:2,18,31,49,68"),
      f: rows("90:9,28,50,77,104 130:11,26,44,65,86 170:8,22,35,53,71 210:3,17,28,43,59 250:1,12,23,35,48") },
    /* no published table for these holds: community-style rules of thumb, shown as estimates */
    hollow: { u: "sec", label: "Hollow holds", m: rows("150:10,25,45,70,100"), f: rows("150:8,20,38,60,85") },
    lsit: { u: "sec", label: "L-sits", m: rows("150:2,6,12,20,35"), f: rows("150:1,5,10,17,28") },
    deadhang: { u: "sec", label: "Dead hangs", m: rows("150:10,25,45,75,110"), f: rows("150:6,16,30,50,75") },
    wallsit: { u: "sec", label: "Wall sits", m: rows("150:20,45,80,120,180"), f: rows("150:15,40,70,105,150") }
  };
  TABLES.farmer.f = TABLES.farmer.m.map(r => [r[0]].concat(r.slice(1).map(v => Math.round(v * 0.62))));   // women: scaled from the men's table
  PT.exTables = TABLES;
  const interp = (rs, bw) => {
    if (bw <= rs[0][0]) return rs[0].slice(1);
    const last = rs[rs.length - 1]; if (bw >= last[0]) return last.slice(1);
    for (let i = 1; i < rs.length; i++) if (bw <= rs[i][0]) { const a = rs[i - 1], b = rs[i], f = (bw - a[0]) / (b[0] - a[0]); return a.slice(1).map((v, k) => v + (b[k + 1] - v) * f); }
    return last.slice(1);
  };
  const tb = (t, s, est) => ({ k: "tbl", t, s: s || 1, est: !!est });
  const NOT_GRADED = /crawl|gripper|pinch|wrist roller|pronation|\bband\b|resistance band|negative|bound\b|lunge hold|freestanding squat/;
  const RULES = [
    [NOT_GRADED, NONE],
    /* ---- 2.62.0: carries, graded by the heaviest weight in each hand (StrengthLevel.com farmer's walk, 20 m); the other carries are scaled from it ---- */
    [/farmer|trap bar carry|dumbbell carry/, tb("farmer")],
    [/suitcase/, tb("farmer", 1.05, true)],
    [/overhead carry|waiter carry/, tb("farmer", 0.45, true)],
    [/sandbag carry|yoke|bear hug carry/, tb("farmer", 1.4, true)],
    /* ---- 2.62.0: reps-based moves that were left out, graded as a share of the closest bodyweight table (est.) ---- */
    [/jumping lunge/, tb("bwsquat", 0.5, true)],
    [/jump squat/, tb("bwsquat", 0.6, true)],
    [/clap push/, tb("pushup", 0.35, true)],
    [/stability ball leg curl|slider leg curl/, tb("lyingleg", 0.8, true)],
    [/tibialis/, tb("bwcalf", 0.8, true)],
    [/reverse nordic/, tb("pistol", 0.4, true)],
    [/bodyweight triceps|triceps rockers/, tb("pushup", 0.5, true)],
    [/neck crunch/, tb("crunch", 0.5, true)],
    /* ---- 2.62.0: exercises that have a StrengthLevel.com table of their own (the rest below are shares of a related one) ---- */
    [/^(standing )?cable crunch(es)?( \(standing\))?$|kneeling cable crunch/, wx("bench", "cableCrunch")],
    [/oblique cable crunch/, wx("bench", "cableCrunch", 0.55, null, true)],
    [/cable reverse crunch/, wx("bench", "cableCrunch", 0.5, null, true)],
    [/^(ez-bar |barbell )?reverse curls?$|^ez-bar reverse curls?$/, wx("ohp", "reverseCurl")],
    [/cable reverse curl/, wx("ohp", "reverseCurl", 0.8, null, true)],
    [/^reverse wrist curls?$/, wx("ohp", "reverseWrist")],
    [/reverse dumbbell wrist|dumbbell reverse wrist/, wx("ohp", "dbWrist", 0.75, null, true)],
    [/dumbbell wrist curl/, wx("ohp", "dbWrist")],
    [/cable wrist curl/, wx("ohp", "wristCurl", 0.6, null, true)],
    [/finger curl/, wx("ohp", "wristCurl", 0.5, null, true)],
    [/behind-the-back (barbell )?wrist/, wx("ohp", "wristCurl", 1, null, true)],
    [/^(barbell )?wrist curls?$/, wx("ohp", "wristCurl")],
    [/^(barbell |ez-bar )?upright rows?$/, wx("ohp", "uprightRow")],
    [/smith machine upright/, wx("ohp", "uprightRow", 1, null, true)],
    /* ---- 2.62.0: machines that had no rule of their own ---- */
    [/dual-axis chest press/, wr("bench", "chestPress")],
    [/hammer strength (flat|incline|super incline)/, wr("bench", "chestPress", 1, null, true)],
    [/super fly|hammer strength .*fly/, wr("bench", "machineFly")],
    [/hammer strength (d\.y\. )?row|d\.y\. row/, w("bench", 0.65)],
    [/squat press/, wr("squat", "hack", 1, null, true)],
    [/seated triceps press|triceps press machine/, wr("bench", "pushdown", 1.4, null, true)],
    /* light rehab moves, graded as a small share of the press so a 10 lb rotation is not scored as an upright row */
    [/external rotation|internal rotation/, w("ohp", 0.1)],
    /* weight-stack ab machines first */
    [/cable crunch|cable reverse crunch|oblique cable crunch/, w("bench", 0.5)],
    [/machine ab|ab coaster|rotary torso|smith machine crunch/, w("bench", 0.6)],
    /* ---- bodyweight moves: real StrengthLevel.com tables (est = scaled from a related table) ---- */
    [/muscle-?ups?/, tb("muscleup")],
    [/chin-?ups?/, tb("chinup")],
    [/scapular/, tb("invrow", 1.2, true)],
    [/pull-?ups?/, tb("pullup")],
    [/ring dips?/, tb("ringdip")],
    [/machine triceps dip|plate-loaded triceps dip|dip machine/, w("bench", 0.9)],
    [/bench dips?/, tb("benchdip")],
    [/\bdips?\b/, tb("dip")],
    [/handstand push/, tb("hspu")],
    [/pike push/, tb("pike")],
    [/incline close-grip push/, tb("diamond", 1.4, true)],
    [/diamond push/, tb("diamond")],
    [/close-grip push|close grip push/, tb("diamond", 1.15, true)],
    [/archer push/, tb("archer")],
    [/deficit push/, tb("pushup", 0.9, true)],
    [/ring push/, tb("declinepush", 0.8, true)],
    [/decline push/, tb("declinepush")],
    [/knee push/, tb("inclinepush", 1.2, true)],
    [/incline push/, tb("inclinepush")],
    [/push-?ups?/, tb("pushup")],
    [/inverted row/, tb("invrow")],
    [/ring row/, tb("invrow", 1, true)],
    [/dragon flag/, tb("hangleg", 0.3, true)],
    [/toes-to-bar/, tb("ttb")],
    [/windshield/, tb("hangleg", 0.5, true)],
    [/ab wheel|ab-wheel/, tb("abwheel")],
    [/barbell rollout/, tb("abwheel", 0.8, true)],
    [/stability ball rollout/, tb("abwheel", 1.3, true)],
    [/stir the pot/, tb("abwheel", 0.7, true)],
    [/hanging leg raise/, tb("hangleg")],
    [/captain|supported knee/, tb("hangleg", 1.3, true)],
    [/hanging (knee|oblique)|side knee/, tb("hangleg", 1.1, true)],
    [/seated knee tuck|stability ball pull-in/, tb("lyingleg", 0.7, true)],
    [/^(lying )?leg raises$|bench leg raise/, tb("lyingleg")],
    [/reverse crunch|leg pull-in|bent-knee hip raise|flutter/, tb("lyingleg", 0.8, true)],
    [/v-ups?|jackknife/, tb("situp", 0.5, true)],
    [/decline sit-?ups?|roman chair sit/, tb("declsit")],
    [/sit-?ups?/, tb("situp")],
    [/toe touch/, tb("situp", 0.8, true)],
    [/decline crunch/, tb("crunch", 0.85, true)],
    [/^crunches$|weighted crunch|stability ball crunch|crunches \(legs/, tb("crunch")],
    [/russian twist|bent-over twist|broomstick|seated twist/, tb("rtwist")],
    [/bicycle|oblique crunch|cross-body crunch|side bend crunch|elbow-to-knee|scissor/, tb("crunch", 0.8, true)],
    [/tuck-up|vertical bench crunch|bottoms up/, tb("crunch", 0.7, true)],
    [/dead bug|bird dog/, tb("crunch", 0.4, true)],
    [/heel tap/, tb("crunch", 1, true)],
    [/mountain climb/, tb("mtnclimb")],
    [/plank jack|plank shoulder tap/, tb("mtnclimb", 0.7, true)],
    [/copenhagen/, tb("sideplank", 0.6, true)],
    [/side plank/, tb("sideplank")],
    [/reverse plank/, tb("plank", 0.8, true)],
    [/body saw/, tb("plank", 0.6, true)],
    [/plank/, tb("plank")],
    [/hollow/, tb("hollow", 1, true)],
    [/l-sit/, tb("lsit", 1, true)],
    [/towel hang/, tb("deadhang", 0.6, true)],
    [/dead hang/, tb("deadhang", 1, true)],
    [/wall sit/, tb("wallsit", 1, true)],
    [/pistol/, tb("pistol")],
    [/sissy squat machine/, w("squat", 0.4)],
    [/sissy squat/, tb("pistol", 2, true)],
    [/nordic/, tb("pistol", 0.4, true)],
    [/glute-ham raise|\bghr\b/, tb("backext", 0.35, true)],
    [/superman/, tb("backext", 0.7, true)],
    [/^back extensions$/, tb("backext")],
    [/bodyweight squat/, tb("bwsquat")],
    [/^wedge/, tb("bwsquat", 1, true)],
    [/cossack|lateral lunge|curtsy/, tb("bwsquat", 0.5, true)],
    [/^jefferson/, w("squat", 0.7)],
    [/^(single-leg )?(glute bridges?|glute frog pumps)$/, tb("bwsquat", 0.8, true)],
    [/single-leg calf raise/, tb("bwcalf", 0.5, true)],
    [/rotary calf/, w("squat", 0.9)],
    /* ---- weighted core ---- */
    [/weighted russian/, tb("rtwist")],
    [/landmine twist|woodchop|pallof|cable side bend/, w("ohp", 0.3)],
    [/dumbbell side bend/, w("ohp", 0.45)],
    [/crunch|twist|oblique|hip raise/, tb("crunch", 0.8, true)],
    /* ---- squat family ---- */
    [/safety squat|ssb/, w("squat", 0.95)],
    [/front squat/, wr("squat", "front")],
    [/zercher/, w("squat", 0.7)],
    [/box squat|pause squat|high-bar|low-bar|^squat$|barbell hack squat/, w("squat", 1)],
    [/goblet|dumbbell squat|dumbbell sumo/, wr("squat", "goblet")],
    [/smith machine squat/, wr("squat", "smithSquat")],
    [/smith machine split/, w("squat", 0.7)],
    [/bulgarian.*barbell|barbell.*split squat/, wr("squat", "bbBulg")],
    [/split squat|bulgarian/, wr("squat", "dbBulg", 1, tb("bwsquat", 0.5, true))],
    [/barbell .*lunge|smith machine front lunge/, wr("squat", "bbLunge")],
    [/lunge/, wr("squat", "dbLunge", 1, tb("bwsquat", 0.5, true))],
    [/step-?ups?/, w("squat", 0.3, tb("bwsquat", 0.5, true))],
    [/wide-stance squat|narrow-stance squat/, w("squat", 0.95)],
    [/hack squat|pendulum|v-squat|belt squat/, wr("squat", "hack")],
    [/leg press calf/, wr("squat", "calfMach", 1, null, true)],
    [/single-leg leg press/, wr("squat", "legPress", 0.6)],
    [/vertical leg press/, wr("squat", "legPress", 1.1)],
    [/leg press/, wr("squat", "legPress")],
    [/single-leg extension/, wr("squat", "legExt", 0.55)],
    [/leg extension/, wr("squat", "legExt")],
    [/dumbbell leg curl/, w("squat", 0.12)],
    [/single-leg curl|single-leg lying/, wr("squat", "legCurlLy", 0.55)],
    [/seated leg curl/, wr("squat", "legCurlSe")],
    [/leg curl/, wr("squat", "legCurlLy")],
    [/dumbbell (hip thrust|glute bridge)|single-leg hip thrust/, w("squat", 0.5)],
    [/hip thrust|glute bridge/, wr("squat", "hipThrust")],
    [/glute kickback|cable hip|multi-hip/, w("squat", 0.35)],
    [/hip abductor/, wr("squat", "hipAbd")],
    [/hip adductor/, wr("squat", "hipAbd", 1, null, true)],
    [/seated dumbbell calf/, w("squat", 0.3)],
    [/dumbbell calf/, w("squat", 0.25)],
    [/seated calf/, wr("squat", "calfSeat")],
    [/calf raise/, wr("squat", "calfBar", 1, tb("bwcalf", 1, true))],
    /* ---- deadlift family ---- */
    [/barbell bent over row to straight/, w("deadlift", 0.55)],
    [/trap bar deadlift|hex bar deadlift/, w("deadlift", 1.05)],
    [/rack pull/, w("deadlift", 1.1)],
    [/deficit barbell deadlift|snatch-grip|dorian/, w("deadlift", 0.9)],
    [/dumbbell deadlift|stiff-legged dumbbell/, wr("deadlift", "dbDead")],
    [/single-leg rdl/, w("deadlift", 0.22)],
    [/dumbbell romanian|dumbbell stiff/, wr("deadlift", "dbRdl")],
    [/b-stance/, wr("deadlift", "rdl", 0.8)],
    [/stiff-legged|romanian|smith machine romanian|smith machine deadlift/, wr("deadlift", "rdl")],
    [/good morning/, w("squat", 0.5)],
    [/reverse hyper/, w("deadlift", 0.4)],
    [/weighted back extension|back extension/, w("deadlift", 0.3)],
    [/pull-?through/, w("deadlift", 0.4)],
    [/kettlebell swing/, w("deadlift", 0.22)],
    [/sumo deadlift/, wr("deadlift", "sumo")],
    [/deadlift/, w("deadlift", 1)],
    [/barbell bent over row to straight/, w("deadlift", 0.55)],
    /* ---- bench family ---- */
    [/smith machine (flat|bench) press|smith machine decline/, wr("bench", "smithBench")],
    [/smith machine incline press/, wr("bench", "inclineBench", 0.94)],
    [/smith machine close-grip/, w("bench", 0.9)],
    [/incline close-grip bench|reverse-grip incline/, w("bench", 0.82)],
    [/incline bench press/, wr("bench", "inclineBench")],
    [/decline bench press/, w("bench", 1.05)],
    [/close-grip bench|close grip bench/, wr("bench", "cgbp")],
    [/wide-grip barbell bench|reverse-grip barbell bench|pause bench|spoto|^floor press$|^bench press$/, w("bench", 1)],
    [/dumbbell floor press/, w("bench", 0.38)],
    [/incline close-grip dumbbell/, wr("bench", "inclDb", 0.9)],
    [/incline dumbbell (bench )?press|incline dumbbell (shoulder )?press|low incline dumbbell|incline dumbbell bench/, wr("bench", "inclDb")],
    [/single-arm (low incline )?dumbbell bench press|single-arm low incline/, w("bench", 0.4)],
    [/dumbbell (bench|squeeze) press|decline dumbbell press|neutral-grip dumbbell press|close-grip dumbbell press/, wr("bench", "dbBench")],
    [/svend|plate press/, w("bench", 0.2)],
    [/hammer strength (flat|incline)/, wr("bench", "chestPress", 1, null, true)],
    [/iso-lateral plate-loaded (decline|wide)/, wr("bench", "chestPress", 1, null, true)],
    [/converging chest|machine (chest|incline|decline) press/, wr("bench", "chestPress")],
    [/cable (scooped )?chest press|seated cable chest press|single-arm cable chest|cable chest fly to/, w("bench", 0.4)],
    [/reverse pec deck/, w("bench", 0.35)],
    [/pec deck/, wr("bench", "machineFly")],
    [/reverse cable crossover/, w("ohp", 0.2)],
    [/dumbbell flyes?|incline dumbbell flyes|decline dumbbell flyes/, wr("bench", "dbFly")],
    [/cable (flyes?|crossovers?)|(flat|incline|decline) cable flyes|(high|low)[- ]to[- ](low|high) cable fl|(high|low) cable crossover|cable fly ladder|bent-over cable crossover|single-arm cable crossover/, wr("bench", "cableFly")],
    [/dumbbell pullover/, w("bench", 0.38)],
    [/barbell pullover/, w("bench", 0.38)],
    [/machine pullover/, w("bench", 0.55)],
    /* ---- rows and pulldowns ---- */
    [/rear delt row|dumbbell rear delt/, w("ohp", 0.2)],
    [/meadows/, w("bench", 0.5)],
    [/hex bar row/, w("bench", 0.9)],
    [/straight-arm/, w("bench", 0.35)],
    [/single-arm cable lat pulldown|half-kneeling single-arm lat/, wr("bench", "latPull", 0.5)],
    [/behind-the-neck pulldown|lat pulldown/, wr("bench", "latPull")],
    [/iso-lateral plate-loaded (high|low) row|hammer strength row/, w("bench", 0.65)],
    [/single-arm (machine row|cable seated)/, wr("bench", "scr", 0.5)],
    [/pendlay/, wr("bench", "pendlay")],
    [/chest-supported cable/, wr("bench", "scr")],
    [/t-bar|seal row|chest-supported row|chest-supported t-bar/, wr("bench", "tbar")],
    [/barbell row|reverse-grip barbell row|yates|hex bar row|barbell bent|bent-over trap/, wr("bench", "bor")],
    [/dumbbell row|incline dumbbell row|bent-over dumbbell row|helms|kroc|gorilla|reverse-grip dumbbell row|renegade|dumbbell rear delt row/, wr("bench", "dbRow")],
    [/seated cable row|cable seated row|underhand seated|neutral-grip seated cable|low row|diverging seated|machine row|smith machine row/, wr("bench", "scr")],
    /* ---- shoulders ---- */
    [/behind-the-neck (barbell )?press|smith machine behind-the-neck/, w("ohp", 0.8)],
    [/dumbbell push press/, w("ohp", 0.52)],
    [/dumbbell cleans/, w("ohp", 0.5)],
    [/push press|clean and press|power clean/, w("ohp", 1.1)],
    [/z press/, w("ohp", 0.75)],
    [/seated reverse-grip barbell press|front and back|bradford|scott press/, w("ohp", 0.75)],
    [/landmine press/, w("ohp", 0.7)],
    [/arnold press/, wr("ohp", "arnold")],
    [/(seated|standing)? ?dumbbell (shoulder )?press|single-arm dumbbell press/, wr("ohp", "dbSp")],
    [/kettlebell press/, w("ohp", 0.45)],
    [/seated cable shoulder press/, w("ohp", 0.6)],
    [/iso-lateral plate-loaded shoulder press|machine shoulder press|multi-press/, wr("ohp", "machSp")],
    [/overhead press|smith machine overhead press/, w("ohp", 1)],
    [/machine lateral/, w("ohp", 0.4)],
    [/cable (y-)?raises|cable lateral|single-arm cable lateral|seated cable lateral/, wr("ohp", "lat", 0.7)],
    [/lu raises|scaption|y-raise|cuban/, wr("ohp", "lat", 0.6)],
    [/lateral raises?|lateral to front/, wr("ohp", "lat")],
    [/(barbell|ez-bar) front raise/, w("ohp", 0.35)],
    [/plate front|weight plate/, w("ohp", 0.28)],
    [/cable front raise|incline cable front/, wr("ohp", "frontR", 0.7)],
    [/front raises?/, wr("ohp", "frontR")],
    [/rear delt|reverse flye|reverse cable crossover|lying cable rear|machine lying rear|prone dumbbell/, w("ohp", 0.16)],
    [/face pull/, wr("ohp", "facePull")],
    [/dumbbell upright/, wr("ohp", "dbUpright")],
    [/cable upright/, wr("ohp", "cableUpright")],
    [/upright row/, w("ohp", 0.8)],
    [/barbell incline shoulder raise/, w("ohp", 0.35)],
    /* ---- traps and neck ---- */
    [/barbell high pull/, w("deadlift", 0.6)],
    [/prone trap raise/, w("ohp", 0.12)],
    [/dumbbell shrug|incline bench dumbbell shrug/, wr("deadlift", "dbShrug")],
    [/shrug machine|selectorized shrug|cable shrug/, w("deadlift", 0.7)],
    [/shrugs?/, wr("deadlift", "shrug")],
    /* ---- biceps ---- */
    [/barbell 21s|21s/, w("ohp", 0.35)],
    [/wrist curl|finger curl/, wr("ohp", "dbCurl", 0.6)],
    [/cable reverse curl/, wr("ohp", "cableCurl", 0.6)],
    [/(barbell|ez-bar|plate) preacher|machine preacher|plate-loaded biceps|cable preacher|reverse preacher|machine incline curl/, wr("ohp", "preacher")],
    [/single-arm cable curl/, wr("ohp", "cableCurl", 0.6)],
    [/cable .*curl|curl.*cable|high cable|lying cable|between-the-legs/, wr("ohp", "cableCurl")],
    [/hammer curl/, wr("ohp", "hammer")],
    [/(dumbbell|incline) .*curl|curls?.*dumbbell|alternating|bilateral|concentration|seated dumbbell|zottman|cross-body dumbbell|bicep curls|^dumbbell curls/, wr("ohp", "dbCurl")],
    [/reverse curl|ez-bar reverse/, w("ohp", 0.4)],
    [/preacher curls/, wr("ohp", "preacher")],
    [/ez-bar curl|spider curl|drag curl|row curl|waiter|seated barbell curl|wide-grip barbell|close-grip barbell/, wr("ohp", "ezCurl")],
    [/barbell curl/, wr("ohp", "bbCurl")],
    [/curls?$/, w("ohp", 0.45)],
    /* ---- triceps ---- */
    [/jm press/, w("bench", 0.65)],
    [/machine triceps dip|plate-loaded triceps dip/, w("bench", 0.9)],
    [/dumbbell skull/, w("bench", 0.17)],
    [/(ez-bar|barbell|incline|decline|lying|standing) (french|skull|overhead)|overhead ez-bar|barbell french|barbell overhead triceps|close grip french|crucifix|skull crushers/, wr("bench", "lte")],
    [/incline two-dumbbell|dumbbell overhead|seated overhead dumbbell|single-arm overhead dumbbell|overhead triceps extension|overhead dumbbell/, wr("ohp", "dbTri")],
    [/kickback|kick out|tate press/, w("ohp", 0.12)],
    [/cross-body triceps/, w("ohp", 0.22)],
    [/single-arm cable pushdown|single-arm overhead cable/, wr("bench", "pushdown", 0.6)],
    [/pushdown|cable overhead|single-arm overhead cable|triceps extension|cable skull/, wr("bench", "pushdown")],
    /* ---- forearms ---- */
    [/wrist curl|finger curl/, w("ohp", 0.35)],
    [/cable reverse curl/, w("ohp", 0.35)]
  ];

  /** a standard for any exercise name (custom names too). Returns { k, ... } or null */
  function std(name) {
    const n = String(name || "").toLowerCase();
    for (let i = 0; i < RULES.length; i++) if (RULES[i][0].test(n)) return RULES[i][1];
    return null;
  }
  PT.exStd = std;

  /* ============================================================== thresholds and levels */
  const sexOf = a => (a.settings.strengthSex === "female" ? "female" : "male");
  function bwOf(a) { try { const v = a.bwOn(PT.ds()); return v > 0 ? (a.unit() === "kg" ? v * LB : v) : 0; } catch (e) { return 0; } }
  /** 5 thresholds in lb (weight kinds / bodyweight kinds) or reps. */
  function thresholds(s, sex, bw) {
    if (!s || !(bw > 0)) return null;
    if (s.k === "w") { const t = PT.strengthThresholds(s.ref, sex, bw); return t ? t.map((v, i) => v * (Array.isArray(s.f) ? s.f[i] : s.f)) : null; }
    if (s.k === "tbl") {
      const T = TABLES[s.t], r = interp(sex === "female" ? T.f : T.m, bw);
      return T.u === "add" ? r.map(v => bw + v) : r.map(v => Math.max(1, Math.ceil(v * s.s - 1e-6)));
    }
    return null;
  }
  function levelOf(th, v) {
    if (!th || !(v > 0)) return null;
    let idx = 0; for (let k = 1; k < th.length; k++) if (v >= th[k]) idx = k;
    const next = idx < th.length - 1 ? th[idx + 1] : null, prev = idx === 0 ? 0 : th[idx];
    return { idx, level: LEVELS[idx], next, nextLevel: next ? LEVELS[idx + 1] : null, frac: next ? Math.max(0, Math.min(1, (v - prev) / (next - prev))) : 1 };
  }
  PT.exLevel = (a, name, value) => { const s = std(name); return levelOf(thresholds(s, sexOf(a), bwOf(a)), value); };

  /* ============================================================== what the user has done */
  const GROUP = { Chest: "Chest", Back: "Back", Traps: "Back", Shoulders: "Shoulders", Biceps: "Arms", Triceps: "Arms", Forearms: "Arms", Legs: "Legs", Core: "Core" };
  const GROUPS = ["Chest", "Back", "Shoulders", "Arms", "Legs", "Core"];
  let DB = null;
  function db() {
    if (DB) return DB;
    const byName = new Map(), list = [];
    (typeof EXERCISE_DATABASE !== "undefined" ? EXERCISE_DATABASE : []).forEach(e => {
      if (!GROUP[e.category]) return; const g = GROUP[e.category]; list.push({ name: e.name, group: g });
      byName.set(e.name.toLowerCase(), e.name); (e.aka || []).forEach(k => { if (!byName.has(k.toLowerCase())) byName.set(k.toLowerCase(), e.name); });
    });
    return (DB = { byName, list, group: new Map(list.map(x => [x.name, x.group])) });
  }
  const canon = n => db().byName.get(String(n || "").toLowerCase()) || n;
  /** a muscle group for names the library does not list exactly (older or custom names): try the plural, then read the name */
  function groupOf(name) {
    const g = db().group, n = String(name || "");
    const hit = g.get(n) || g.get(canon(n)) || g.get(canon(n + "s")) || g.get(canon(n.replace(/\s*\(.*\)\s*$/, "")));
    if (hit) return hit;
    const l = n.toLowerCase();
    if (/curl|bicep|tricep|skull|pushdown|kickback|forearm|wrist/.test(l)) return "Arms";
    if (/calf|squat|lunge|leg |leg$|deadlift|hip|glute|hamstring|quad|step-?up|thrust/.test(l)) return "Legs";
    if (/crunch|plank|sit-?up|\bab\b|abs\b|core|twist|leg raise|hollow/.test(l)) return "Core";
    if (/crossover|bench|chest|fly|flye|push-?up|pec|dip/.test(l)) return "Chest";
    if (/row|pulldown|pull-?up|chin-?up|\blat\b|back ext|shrug|pullover/.test(l)) return "Back";
    if (/shoulder|overhead|lateral|raise|face pull|arnold|military|upright/.test(l)) return "Shoulders";
    return "Other";
  }
  /** one logged set as { e1 } (estimated 1RM in lb) or { reps } (reps, or seconds held), or null when it counts for nothing */
  /** estimated 1RM of one set in lb. The estimate is Epley (weight x (1 + reps / 30)), which runs high for very long sets, so reps past 20 stop adding to it. */
  const CAP_REPS = 20;
  function e1Of(a, e, x, s) {
    const v = toLb(a.setE1rm(e.name, x, s.date) || 0, s.unit) * wMult(a, e, x), r = (parseFloat(x.r) || 0) * (x.rm === "t" ? 0.5 : 1);
    return r > CAP_REPS && v > 0 ? v * (1 + CAP_REPS / 30) / (1 + r / 30) : v;
  }
  function setVal(a, e, x, s, st, bw) {
    const T = st.k === "tbl" ? TABLES[st.t] : null;
    if (T && T.u === "add") return { e1: e1Of(a, e, x, s) };
    if (T && T.u === "max") { const wt = toLb(parseFloat(x.w) || 0, s.unit) * wMult(a, e, x); return wt > 0 && !PT.isCardioSet(x) ? { e1: wt } : null; }
    if (T || st.alt) {
      const r = parseFloat(x.r) || 0; if (r <= 0 || PT.isCardioSet(x)) return null;
      const wt = toLb(PT.isBodyweightEx(e.name) ? Math.max(0, a.setLoad(e.name, x, s.date) - (a.bwOn(s.date) || 0)) : (PT.bwAdded && PT.isBwMove && PT.isBwMove(e.name) ? PT.bwAdded(e.name, x, s.date) : (parseFloat(x.w) || 0)), s.unit);
      if (st.alt && wt > 0) return { e1: e1Of(a, e, x, s) };
      if (T && T.u === "sec") return { reps: r };
      return { reps: r * (bw > 0 && wt > 0 ? 1 + wt / bw : 1) };
    }
    return { e1: e1Of(a, e, x, s) };
  }
  let memo = null;
  function bests(a) {
    const key = S(a).length + ":" + S(a).reduce((m, s) => Math.max(m, s.upd || s.ts || 0), 0) + ":" + a.unit() + ":" + (convOn(a) ? 1 : 0);
    if (memo && memo.key === key) return memo.map;
    const map = new Map(), bw = bwOf(a);
    S(a).forEach(s => (s.ex || []).forEach(e => {
      const nm = canon(e.name), st = std(nm); if (!st) return; let o = map.get(nm); if (!o) { o = { name: nm, e1: 0, reps: 0, ts: 0 }; map.set(nm, o); }
      o.ts = Math.max(o.ts, sessTime(s));
      (e.sets || []).forEach(x => {
        if (x.t === "W") return;
        const r = setVal(a, e, x, s, st, bw); if (!r) return;
        if (r.e1 > o.e1) o.e1 = r.e1;
        if (r.reps > o.reps) o.reps = r.reps;
      });
    }));
    memo = { key, map }; return map;
  }
  /** the standard that applies to what was logged, and the value to compare. Weight-based moves with a bodyweight fallback use it when no weight was logged. */
  function scored(st, o) {
    if (st.k === "tbl") return { st, v: TABLES[st.t].u === "add" || TABLES[st.t].u === "max" ? o.e1 : o.reps };
    if (st.alt && !(o.e1 > 0) && o.reps > 0) return { st: st.alt, v: o.reps };
    return { st, v: o.e1 };
  }
  function rowsFor(a) {
    const sex = sexOf(a), bw = bwOf(a), out = [];
    bests(a).forEach(o => {
      const sc = scored(std(o.name), o), st = sc.st, v = sc.v; if (!(v > 0)) return;
      const th = thresholds(st, sex, bw), lv = levelOf(th, v); if (!lv) return;
      out.push({ name: o.name, st, v, th, lv, ts: o.ts, group: groupOf(o.name) });
    });
    return out;
  }
  PT.exLevels = rowsFor;

  /* ============================================================== display */
  const UI = { mode: "logged", group: "All", q: "", more: 1 };
  const unitK = a => a.unit() === "kg";
  const fromLb = (a, v) => (unitK(a) ? v / LB : v);
  const num = v => Math.round(v).toLocaleString();
  const unitOfStd = st => (st.k === "tbl" ? TABLES[st.t].u : "lb");
  const fmtSec = v => (v >= 120 ? Math.floor(v / 60) + ":" + String(Math.round(v % 60)).padStart(2, "0") : Math.round(v) + " s");
  const fmtV = (a, st, v) => {
    const u = unitOfStd(st);
    if (u === "reps") return `${Math.floor(v + 1e-6)} reps`;
    if (u === "sec") return fmtSec(v);
    if (u === "add") { const d = fromLb(a, v - bwOf(a)); return (d < 0 ? "−" : "+") + num(Math.abs(d)) + " " + a.wLabel() + " added"; }
    return `${num(fromLb(a, v))} ${a.wLabel()}`;
  };
  const BIG = /^(bench press|squat|deadlift|overhead press)$/i;
  const isEst = (st, name) => (st.k === "tbl" ? st.est : st.k === "w" ? !(st.sl || (st.f === 1 && BIG.test(name))) : true);
  const bar = (p, c) => `<div class="pt-lv-bar"><span style="width:${Math.round(Math.max(0, Math.min(1, p)) * 100)}%;background:${c}"></span></div>`;
  const chip = (attr, label, on) => `<button type="button" ${attr} aria-pressed="${on}" class="pt-opt tap-active">${esc(label)}</button>`;
  const kindNote = st => ({ reps: "reps in one set", sec: "seconds held", add: "1RM with body weight", max: "heaviest weight" }[unitOfStd(st)] || "estimated 1RM");

  function listRows(a) {
    const rows = rowsFor(a), have = new Map(rows.map(r => [r.name, r])), q = UI.q.trim().toLowerCase(), sex = sexOf(a), bw = bwOf(a);
    let pool;
    if (UI.mode === "logged") pool = rows.slice().sort((x, y) => y.lv.idx + y.lv.frac - (x.lv.idx + x.lv.frac) || y.ts - x.ts);
    else pool = db().list.filter(e => std(e.name)).map(e => have.get(e.name) || { name: e.name, st: std(e.name), v: 0, th: thresholds(std(e.name), sex, bw), lv: null, ts: 0, group: e.group });
    if (UI.group !== "All") pool = pool.filter(r => r.group === UI.group);
    if (q) pool = pool.filter(r => r.name.toLowerCase().includes(q));
    return pool;
  }
  function rowHtml(a, r) {
    if (r.lv) {
      const c = COLS[r.lv.idx];
      return `<button type="button" class="pt-lv-row tap-active" data-lv="${esc(r.name)}"><div class="flex items-center justify-between gap-2"><span class="text-xs font-bold text-white truncate">${esc(r.name)}</span><span class="shrink-0 text-[11px] font-black" style="color:${c}">${r.lv.level}</span></div>${bar(r.lv.frac, c)}<span class="block text-[10px] text-zinc-400">${esc(fmtV(a, r.st, r.v))} · ${r.lv.next ? esc(r.lv.nextLevel) + " at " + esc(fmtV(a, r.st, r.th[r.lv.idx + 1])) : "top level reached"}${isEst(r.st, r.name) ? " · est." : ""}</span></button>`;
    }
    const t = r.th; return `<button type="button" class="pt-lv-row tap-active" data-lv="${esc(r.name)}"><div class="flex items-center justify-between gap-2"><span class="text-xs font-bold text-white truncate">${esc(r.name)}</span><span class="shrink-0 text-[10px] text-zinc-500">not logged yet</span></div>${t ? `<span class="block text-[10px] text-zinc-400">Intermediate at ${esc(fmtV(a, r.st, t[2]))} · Elite ${esc(fmtV(a, r.st, t[4]))}</span>` : ""}</button>`;
  }
  function cardHtml(a) {
    const bw = bwOf(a);
    let html = `<div class="flex items-center justify-between gap-2"><h3 class="text-xs font-bold text-white">Strength levels · every exercise</h3></div>`;
    if (!bw) return html + `<p class="text-xs text-zinc-400">Log your body weight and every exercise you do gets a level.</p><button id="pt-lvls-bw" type="button" class="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white tap-active">Log body weight</button>`;
    const rows = rowsFor(a), counts = [0, 0, 0, 0, 0]; rows.forEach(r => counts[r.lv.idx]++);
    const avg = rows.length ? Math.floor(rows.reduce((n, r) => n + r.lv.idx + r.lv.frac * 0.999, 0) / rows.length) : -1;
    html += rows.length ? `<div class="flex items-center gap-3 bg-zinc-950 border border-zinc-800 rounded-xl p-3"><span class="text-2xl">📊</span><div class="min-w-0"><span class="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">${rows.length} exercise${rows.length === 1 ? "" : "s"} graded</span><span class="block text-base font-black" style="color:${COLS[avg]}">${LEVELS[avg]} on average</span></div></div>
      <div class="flex flex-wrap gap-1.5">${counts.map((n, i) => (n ? `<span class="pt-lv-pill" style="border-color:${COLS[i]};color:${COLS[i]}">${LEVELS[i]} ${n}</span>` : "")).join("")}</div>` : `<p class="text-xs text-zinc-400">Log some sets and each exercise gets a level here. Tap All exercises to see what each level takes.</p>`;
    html += `<div class="flex flex-wrap gap-1.5">${chip('data-lvm="logged"', "Mine", UI.mode === "logged")}${chip('data-lvm="all"', "All exercises", UI.mode === "all")}</div>
      <div class="flex flex-wrap gap-1.5">${["All"].concat(GROUPS).map(g => chip(`data-lvg="${g}"`, g, UI.group === g)).join("")}</div>
      <input type="search" id="pt-lv-q" value="${esc(UI.q)}" placeholder="Search exercises" aria-label="Search exercises" autocomplete="off">
      <div id="pt-lv-list" class="space-y-1.5">${listHtml(a)}</div>
      <p class="text-[10px] text-zinc-500 leading-relaxed">Bench, squat, deadlift, press, the bodyweight moves (pull-ups, dips, push-ups, sit-ups, planks and more) and about 80 more lifts (leg press, leg extension, curls, wrist curls, rows, pulldowns, pushdowns, upright rows, cable crunches, calf raises, hip thrusts, farmer's walk and others) use StrengthLevel.com's own standards for that exercise, scaled to your body weight. Anything marked est. is a share of the closest related exercise. Cardio, stretches, bands, jumps and sleds have no 1RM, so no level. Sets past 20 reps stop adding to the estimate. What you type is matched to the standard: dumbbells per hand, machines and cables as both sides together, reps per hand. Men or Women follows the card above.</p>`;
    return html;
  }
  function listHtml(a) {
    const pool = listRows(a), n = UI.more * 15, show = pool.slice(0, n);
    if (!pool.length) return `<p class="text-xs text-zinc-400">${UI.mode === "logged" ? "Nothing here yet. Log a set of an exercise to grade it." : "No exercise matches that."}</p>`;
    return show.map(r => rowHtml(a, r)).join("") + (pool.length > n ? `<button type="button" id="pt-lv-more" class="w-full py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] font-bold text-zinc-300 tap-active">Show more (${pool.length - n})</button>` : "");
  }
  function refresh(a) { const l = $("pt-lv-list"); if (l) l.innerHTML = listHtml(a); }

  function detail(a, name) {
    const base = std(name), bw = bwOf(a), sex = sexOf(a), o = bests(a).get(canon(name)), sc = base && o ? scored(base, o) : { st: base, v: 0 };
    const st = sc.st || base, th = thresholds(st, sex, bw); if (!th) return;
    const v = sc.v, lv = levelOf(th, v), est = isEst(st, name);
    const rows = LEVELS.map((L, i) => `<div class="pt-lv-t ${lv && lv.idx === i ? "on" : ""}" style="${lv && lv.idx === i ? "border-color:" + COLS[i] : ""}"><span class="font-black" style="color:${COLS[i]}">${L}</span><span class="font-mono text-zinc-200">${i === 0 ? "Under " + esc(fmtV(a, st, th[1])) : esc(fmtV(a, st, th[i])) + "+"}</span></div>`).join("");
    let how;
    if (st.k === "tbl") {
      const T = TABLES[st.t];
      how = (est ? `Estimated from the ${T.label.toLowerCase()} table${st.s !== 1 ? ` (about ${Math.round(st.s * 100)}% of it)` : ""}, since there is no published table for this exact move.` : `StrengthLevel.com ${T.label.toLowerCase()} standards for your body weight.`)
        + (T.u === "max" ? " The heaviest weight you carried (in each hand) is compared; women's figures are scaled from the men's table." : T.u === "add" ? " Your best one-rep max (body weight plus added weight) is compared with the added-weight standard; assisted reps count as negative weight." : T.u === "sec" ? " Seconds held in one set." : " Reps in one set. Added weight counts as extra reps.");
    } else {
      const refName = st.ref === "ohp" ? "overhead press" : st.ref;
      how = st.sl ? `StrengthLevel.com's own standards for this exercise, which come to about ${Math.round(fMid(st) * 100)}% of the ${refName} standard at Intermediate, adjusted to your body weight.`
        : est ? `A share of the ${refName} standard (about ${Math.round(fMid(st) * 100)}%). Not an official table.` : "StrengthLevel.com standards for your body weight.";
    }
    const conv = (() => { try {
      if (!convOn(a) || !PT.sideEligible(name) || ONE_SIDED.test(name) || st.k === "tbl") return "";
      return (isDbMove(name) ? " Dumbbells are compared per hand: if you enter both together, it is halved." : " Machines and cables are compared as both sides together: if you enter each side, it is doubled.") + (PT.repEligible && PT.repEligible(name) ? " Total reps are halved to reps per hand." : "");
    } catch (e) { return ""; } })();
    const fix = (() => { try { return PT.fixOldHas && PT.fixOldHas(name) && PT.sideInfo(name).side ? ` <button type="button" class="underline font-bold text-emerald-400" data-fixold="${esc(name)}">Older sets look wrong? Fix old workouts</button>` : ""; } catch (e) { return ""; } })();
    const best = v > 0 ? `Your best: <b class='text-white'>${esc(fmtV(a, st, v))}</b> (${kindNote(st)})` : "Not logged yet";
    const body = `<div class="space-y-3"><div class="flex items-center justify-between gap-2"><span class="text-xs text-zinc-400">${best}</span>${lv ? `<span class="shrink-0 text-sm font-black" style="color:${COLS[lv.idx]}">${lv.level}</span>` : ""}</div>${lv ? bar(lv.frac, COLS[lv.idx]) : ""}<div class="space-y-1.5">${rows}</div>
      <p class="text-[10px] text-zinc-500 leading-relaxed">At body weight ${esc(num(fromLb(a, bw)))} ${a.wLabel()} (${sex === "female" ? "women" : "men"}). ${esc(how + conv)}${fix}</p></div>`;
    a.openSheet(name, est ? "Strength level (estimate)" : "Strength level", body, `<button type="button" class="w-full py-3 rounded-xl bg-zinc-800 text-zinc-100 font-bold text-sm tap-active" data-lv-open="${esc(name)}">Open exercise</button>`);
  }

  /** best value of one exercise in each session, oldest first: [{ t, v }] in the same units as its level (lb, reps or seconds) */
  function series(a, name) {
    const nm = canon(name), st = std(nm), bw = bwOf(a), out = []; if (!st) return out;
    S(a).slice().sort((x, y) => sessTime(x) - sessTime(y)).forEach(s => {
      const o = { e1: 0, reps: 0 }; let hit = false;
      (s.ex || []).forEach(e => { if (canon(e.name) !== nm) return; (e.sets || []).forEach(x => { if (x.t === "W") return; const r = setVal(a, e, x, s, st, bw); if (!r) return; hit = true; if (r.e1 > o.e1) o.e1 = r.e1; if (r.reps > o.reps) o.reps = r.reps; }); });
      if (!hit) return; const sc = scored(st, o); if (sc.v > 0) out.push({ t: sessTime(s), v: sc.v });
    });
    return out;
  }
  PT.exSeries = series;
  /** helpers for the pieces built on top of these levels (next level, weak points, planner) */
  PT.lvKit = { LEVELS, COLS, GROUPS, fmtV, fromLb, bwOf, sexOf, std, thresholds, levelOf, canon, scored, bests, db, unitOfStd, isEst, bar, num };

  /* ============================================================== wiring */
  const oPV = proto.renderProgressView;
  proto.renderProgressView = function () {
    const r = oPV.apply(this, arguments);
    try {
      const root = $("progress-body"); if (!root) return r;
      const panel = root.querySelector('[data-ptab="strength"]') || root; let card = $("pt-lvls-card");
      if (card) card.remove();
      card = document.createElement("div"); card.id = "pt-lvls-card"; card.className = "bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3"; card.innerHTML = cardHtml(this);
      const anchor = panel.querySelector("#strength-card"); if (anchor) anchor.insertAdjacentElement("afterend", card); else panel.insertBefore(card, panel.firstChild);
    } catch (e) { console.error("PulseTrack strength levels", e); }
    return r;
  };
  document.addEventListener("input", e => { if (e.target && e.target.id === "pt-lv-q") { UI.q = e.target.value; UI.more = 1; refresh(A()); } });
  document.addEventListener("click", e => {
    const a = A(); if (!a || !e.target.closest) return;
    const m = e.target.closest("[data-lvm]"); if (m) { UI.mode = m.dataset.lvm; UI.more = 1; a.renderProgressView(); return; }
    const g = e.target.closest("[data-lvg]"); if (g) { UI.group = g.dataset.lvg; UI.more = 1; a.renderProgressView(); return; }
    if (e.target.closest("#pt-lv-more")) { UI.more++; refresh(a); return; }
    if (e.target.closest("#pt-lvls-bw")) { a.showView("body"); return; }
    const r = e.target.closest("[data-lv]"); if (r) { detail(a, r.dataset.lv); return; }
    const o = e.target.closest("[data-lv-open]"); if (o) { try { a.closeSheet(); } catch (x) { } setTimeout(() => { try { a.openExerciseSheet(o.dataset.lvOpen); } catch (x) { } }, 150); }
  });

  const css = document.createElement("style"); css.id = "pt-v233-css";
  css.textContent = `
    .pt-lv-row { display: block; width: 100%; text-align: left; padding: .6rem .7rem; border-radius: .8rem; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); }
    .pt-lv-row > * + * { margin-top: .3rem; }
    .pt-lv-bar { height: .4rem; border-radius: 9999px; background: rgb(var(--z800)); overflow: hidden; }
    .pt-lv-bar > span { display: block; height: 100%; border-radius: 9999px; }
    .pt-lv-pill { padding: .15rem .55rem; border-radius: 9999px; border: 1px solid; font-size: .65rem; font-weight: 800; }
    .pt-lv-t { display: flex; justify-content: space-between; align-items: center; font-size: .78rem; padding: .5rem .7rem; border-radius: .7rem; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); }
    .pt-lv-t.on { background: rgb(var(--z900)); border-width: 2px; }
    #pt-lv-q { width: 100%; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); border-radius: .65rem; padding: .55rem .75rem; font-size: .8rem; color: #fff; }
  `;
  document.head.appendChild(css);
})();
  