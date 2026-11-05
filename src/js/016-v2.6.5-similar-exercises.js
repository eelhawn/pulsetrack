
/* ===================================================================
 * PulseTrack 2.6.5: similar exercises.
 * Every exercise name is read into a few features (the movement it is,
 * the equipment, the angle / grip / one-sided) and two exercises are
 * scored by how close those are. "aka" names in exercises.js count as
 * the same exercise, so an old name from a program still finds its match.
 * =================================================================== */
const PTSIM = (function () {
  "use strict";
  const low = s => String(s == null ? "" : s).toLowerCase();

  /* ------------------------------------------------ names that mean the same thing */
  /** Spelling variants that programs use ("Lat Pull Down", "Press Downs", "Chins", "Rear Raises") read as the standard words. */
  function norm(name) {
    return low(name)
      .replace(/\bpull[\s-]?downs?\b/g, "pulldown").replace(/\b(push|press)[\s-]?downs?\b/g, "pushdown")
      .replace(/\bpull[\s-]?overs?\b/g, "pullover").replace(/\bpull[\s-]?ups?\b/g, "pull-up")
      .replace(/\bchin[\s-]?ups?\b|\bchins\b/g, "chin-up").replace(/\bpush[\s-]?ups?\b/g, "push-up")
      .replace(/\bsit[\s-]?ups?\b/g, "sit-up").replace(/\bface[\s-]?pulls?\b/g, "face pull")
      .replace(/\bpeck deck\b|\bbutterfl(y|ies)\b/g, "pec deck")
      .replace(/\b(rear|reverse) (dumbbell |cable |machine |db |standing )*(raises?|laterals?)\b|\bbent[\s-]?over laterals?\b|\bstanding cable rear raises?\b/g, "rear delt raise")
      .replace(/\bside cable (laterals?|raises?)\b/g, "cable lateral raise")
      .replace(/\bside (dumbbell )?(laterals?|raises?)\b/g, "lateral raise")
      .replace(/\bdeads\b/g, "deadlift").replace(/\blaying\b/g, "lying").replace(/\bext\b\.?/g, "extension")
      .replace(/\bdb\b/g, "dumbbell").replace(/\bbb\b/g, "barbell").replace(/[()]/g, " ").replace(/\s+/g, " ").trim();
  }
  const NOISE = new Set(["the", "a", "of", "with", "and", "time", "standard", "biceps", "bicep", "triceps", "tricep"]);
  const SYN = { pressdown: "pushdown", flye: "fly", flyes: "fly", flies: "fly", flys: "fly", alternate: "alternating", dumbell: "dumbbell", db: "dumbbell", bb: "barbell", kb: "kettlebell", hyperextensions: "hyperextension" };
  function keyOf(name) {
    const toks = norm(name).replace(/&/g, " and ").match(/[a-z0-9]+/g) || [];
    const out = [];
    toks.forEach(t => {
      if (NOISE.has(t)) return;
      if (SYN[t]) t = SYN[t];
      else if (t.length > 3 && t.endsWith("ies")) t = t.slice(0, -3) + "y";
      else if (t.length > 4 && /(ch|sh|x|ss|z)es$/.test(t)) t = t.slice(0, -2);
      else if (t.length > 3 && t.endsWith("s") && !t.endsWith("ss")) t = t.slice(0, -1);
      out.push(t);
    });
    return out.sort().join(" ");
  }

  /** Looks a name up in the exercise list, including its "aka" names and plain spelling differences. */
  function makeIndex(db) {
    const exact = new Map(), keyed = new Map();
    const put = (nm, e) => { const l = low(nm); if (!exact.has(l)) exact.set(l, e); const k = keyOf(nm); if (k && !keyed.has(k)) keyed.set(k, e); };
    db.forEach(e => { if (e && e.name) put(e.name, e); });
    db.forEach(e => { if (e && e.name && Array.isArray(e.aka)) e.aka.forEach(a => put(a, e)); });
    return { exact, keyed, size: db.length, canon(name) { return exact.get(low(name)) || keyed.get(keyOf(name)) || null; } };
  }

  /* ------------------------------------------------ movement families */
  const R = (re, cats) => (n, c) => re.test(n) && (!cats || cats.includes(c));
  const RULES = [
    // arms / triceps first (their words overlap with everything)
    ["tmachine", R(/triceps extension machine|machine triceps ext|selectorized triceps/)],
    ["skull", R(/skull ?crusher|(?<!standing )french press|crucifix|tate press|two-dumbbell ext|cross-body triceps ext|lying (triceps |dumbbell |cable )?extension/)],
    ["ohext", R(/standing french press|overhead.*(extension|triceps)|extension.*overhead|triceps extension$/)],
    ["jm", R(/jm press/)],
    ["pushdown", R(/push-?down|press-?down|cable extension/)],
    ["kickback-tri", (n, c) => /kickback|kick out/.test(n) && c !== "Legs"],
    ["dip", R(/\bdips?\b/)],
    ["cgpress", R(/close[- ]grip.*(bench|press)/)],
    // back / pulling
    ["reardelt", R(/rear[- ]delt|reverse (machine |cable |dumbbell |db )?(fly|flye|flyes|pec|cable|dumbbell fl)|y-raise|chest-supported dumbbell reverse|prone trap raise/)],
    ["facepull", R(/face pull/)],
    ["upright", R(/upright row/)],
    ["straightarm", R(/straight-arm/)],
    ["pulldown", R(/pull-?down/)],
    ["pullup", R(/pull-?up|chin-?up/)],
    ["row-bw", R(/inverted row|ring row/)],
    ["row-supported", R(/chest.supported(?!.*(raise|fly|flye|press))|helms|seal row|t-bar machine|incline dumbbell row/)],
    ["row-tbar", R(/t-bar row|landmine row/)],
    ["row-cable", R(/cable.*row|seated.*cable|underhand seated/)],
    ["row-machine", R(/machine row|hammer strength row|iso-lateral.*row|diverging|row machine|leverage.*row/)],
    ["row-db", R(/dumbbell row|kroc|meadows|gorilla|one-arm.*row|single-arm.*row/)],
    ["row-bent", R(/\brows?\b/)],
    // hips / hinge
    ["goodmorning", R(/good morning/)],
    ["backext", R(/back extension|hyperextension|reverse hyper|superman/)],
    ["rdl", R(/romanian|\brdl\b|stiff-legged|b-stance/)],
    ["deadlift", R(/deadlift|rack pull/)],
    ["pullthrough", R(/pull-?through/)],
    ["swing", R(/swing/)],
    ["hipthrust", R(/hip thrust|glute bridge|frog pump|glute drive/)],
    ["nordic", R(/(?<!reverse )nordic|glute-ham|\bghr\b/)],
    ["legcurl", R(/leg curl|hamstring curl/)],
    ["legext", R(/leg extension/)],
    ["sissy", R(/sissy|reverse nordic/)],
    ["calf", R(/calf|calves/)],
    ["tib", R(/tibialis/)],
    ["legpress", R(/leg press/)],
    ["hack", R(/hack squat|pendulum|v-squat|belt squat/)],
    ["split", R(/split squat|bulgarian|split jump/)],
    ["lunge", R(/lunge/)],
    ["stepup", R(/step-?up/)],
    ["wallsit", R(/wall sit/)],
    ["goblet", R(/goblet|sumo squat|cyclist|heel-elevated/)],
    ["bwsquat", R(/bodyweight squat|air squat|jump squat|pistol|cossack/)],
    ["squat", R(/squat/)],
    ["abduct", R(/abduct/)],
    ["adduct", R(/adduct/)],
    ["kickback-glute", R(/kickback|multi-hip/)],
    // shoulders / traps
    ["lateral", R(/lateral raise|side raise|lu raise|incline lateral|(?<!iso-)\blateral\b(?! lunge| pull| row| press)/)],
    ["front", R(/front raise|plate raise/)],
    ["scaption", R(/scaption/)],
    ["hspu", R(/pike push|handstand push/)],
    ["ohp", (n, c) => (c === "Shoulders" && /press/.test(n)) || /overhead press|military press|shoulder press|arnold press|push press|z press|landmine press|scott press|clean and press|kettlebell press|(seated|standing) (dumbbell |barbell )?press/.test(n)],
    ["clean", R(/clean(s)?\b/)],
    ["shrug", R(/shrug/)],
    ["carry", R(/farmer|suitcase|carry/)],
    // chest
    ["pushup", R(/push-?up/)],
    ["pullover", R(/pullover/)],
    ["fly", R(/\bfly\b|flye|flies|crossover|pec deck/)],
    ["press-incline", (n, c) => /press|bench|smith machine incline$/.test(n) && /incline/.test(n) && (c === "Chest" || c === "Other")],
    ["press-decline", (n, c) => /press|bench/.test(n) && /decline/.test(n) && (c === "Chest" || c === "Other")],
    ["press-flat", (n, c) => /press|bench/.test(n) && (c === "Chest" || c === "Other")],
    // forearms / biceps
    ["wristroll", R(/wrist roller/)],
    ["wristext", R(/reverse.*wrist|wrist extension/)],
    ["wristcurl", R(/wrist curl|finger curl|pronation/)],
    ["grip", R(/dead hang|pinch|towel hang|gripper/)],
    ["revcurl", R(/reverse curl|reverse preacher|zottman/)],
    ["hammer", R(/hammer curl/)],
    ["curl", R(/curl|\b21s\b/)],
    // core
    ["situp", R(/sit-?up/)],
    ["legraise", R(/leg raise|knee raise|knee tuck|toes-to-bar|windshield|flutter|v-up|dragon flag|reverse crunch|knee-up|leg lift/)],
    ["crunch", R(/crunch|toe touch|heel tap|bicycle|ab coaster/)],
    ["rollout", R(/rollout/)],
    ["rotation", R(/twist|woodchop|pallof|rotary torso|side bend|oblique|chops?\b/)],
    ["plank", R(/plank|hollow|dead bug|bird dog|l-sit|mountain|stir the pot|body saw/)]
  ];
  const CARDIO = [["cardio", /steady state|\bcardio\b|moderate pace|zone 2/], ["swim", /swim/], ["climb", /stair|versa|jacob/], ["ellip", /elliptical|arc trainer/], ["cycle", /bike|cycl/], ["rowc", /rowing machine|skierg/], ["walk", /walk|hik|ruck/], ["run", /\brun|\bjog|sprint|treadmill/]];

  function famOf(n, c) {
    if (c === "Warm-Up & Mobility") return "mobility";
    if (c === "Cardio") { if (/tabata/.test(n)) return "hiit"; const h = CARDIO.find(([, re]) => re.test(n)); return h ? h[0] : "hiit"; }
    for (const [f, t] of RULES) if (t(n, c)) return f;
    return "x:" + c;
  }

  const LABEL = {
    "press-flat": "Flat press", "press-incline": "Incline press", "press-decline": "Decline press", cgpress: "Close-grip press", fly: "Fly", pullover: "Pullover",
    pushup: "Push-up", hspu: "Vertical push-up", dip: "Dip", pushdown: "Pushdown", ohext: "Overhead extension", skull: "Skull crusher", jm: "JM press",
    "kickback-tri": "Kickback", tmachine: "Triceps machine", pulldown: "Pulldown", pullup: "Pull-up", straightarm: "Straight-arm pulldown",
    "row-bent": "Bent-over row", "row-tbar": "T-bar row", "row-db": "One-arm row", "row-supported": "Chest-supported row", "row-cable": "Cable row", "row-machine": "Machine row", "row-bw": "Bodyweight row",
    deadlift: "Deadlift", rdl: "Romanian deadlift", goodmorning: "Good morning", backext: "Back extension", pullthrough: "Pull-through", swing: "Swing", hipthrust: "Hip thrust",
    nordic: "Hamstring raise", legcurl: "Leg curl", legext: "Leg extension", sissy: "Sissy squat", calf: "Calf raise", tib: "Tibialis raise", legpress: "Leg press", hack: "Hack squat",
    split: "Split squat", lunge: "Lunge", stepup: "Step-up", wallsit: "Wall sit", goblet: "Goblet squat", bwsquat: "Bodyweight squat", squat: "Squat",
    abduct: "Hip abduction", adduct: "Hip adduction", "kickback-glute": "Glute kickback", lateral: "Lateral raise", front: "Front raise", scaption: "Scaption", ohp: "Overhead press",
    reardelt: "Rear delt", facepull: "Face pull", upright: "Upright row", shrug: "Shrug", carry: "Carry", grip: "Grip hold", wristcurl: "Wrist curl", wristext: "Reverse wrist curl",
    wristroll: "Wrist roller", revcurl: "Reverse curl", hammer: "Hammer curl", curl: "Curl", situp: "Sit-up", crunch: "Crunch", legraise: "Leg raise", rollout: "Rollout",
    rotation: "Rotation", swim: "Swim", plank: "Plank / hold", cardio: "Steady cardio", clean: "Clean", mobility: "Mobility", run: "Run", walk: "Walk", cycle: "Bike", climb: "Stairs", ellip: "Elliptical", rowc: "Rowing / ski", hiit: "Conditioning"
  };

  /* how close two different movements are (0-100). Same movement = 100. */
  const REL = {};
  const rel = (a, b, v) => { REL[a + "|" + b] = v; REL[b + "|" + a] = v; };
  const clique = (list, v) => { for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) rel(list[i], list[j], v); };
  // chest & triceps
  clique(["press-flat", "press-incline", "press-decline"], 72);
  rel("press-flat", "press-incline", 80); rel("press-flat", "press-decline", 78); rel("press-incline", "press-decline", 60);
  rel("cgpress", "press-flat", 68); rel("cgpress", "press-incline", 50); rel("cgpress", "press-decline", 52);
  rel("pushup", "press-flat", 62); rel("pushup", "press-incline", 55); rel("pushup", "press-decline", 52); rel("pushup", "dip", 52); rel("pushup", "cgpress", 45);
  rel("dip", "press-decline", 56); rel("dip", "cgpress", 52); rel("dip", "press-flat", 44); rel("dip", "pushdown", 36); rel("dip", "tmachine", 56); rel("dip", "skull", 28);
  rel("fly", "press-flat", 40); rel("fly", "press-incline", 36); rel("fly", "pullover", 40); rel("fly", "pushup", 28);
  rel("pushdown", "ohext", 66); rel("pushdown", "skull", 60); rel("pushdown", "kickback-tri", 62); rel("pushdown", "tmachine", 74); rel("pushdown", "jm", 36);
  rel("ohext", "skull", 82); rel("ohext", "kickback-tri", 54); rel("ohext", "tmachine", 60); rel("ohext", "jm", 40);
  rel("skull", "jm", 72); rel("skull", "kickback-tri", 55); rel("skull", "tmachine", 52); rel("skull", "cgpress", 40);
  rel("jm", "cgpress", 72); rel("kickback-tri", "tmachine", 50);
  rel("hspu", "ohp", 60); rel("hspu", "pushup", 40);
  // back
  rel("pulldown", "pullup", 86); rel("straightarm", "pulldown", 56); rel("straightarm", "pullover", 62); rel("pullover", "pulldown", 40); rel("pullup", "straightarm", 30);
  const rows = ["row-bent", "row-tbar", "row-db", "row-supported", "row-cable", "row-machine", "row-bw"];
  clique(rows, 72);
  rel("row-bent", "row-tbar", 82); rel("row-tbar", "row-supported", 78); rel("row-db", "row-supported", 78); rel("row-cable", "row-machine", 82); rel("row-bent", "row-db", 70);
  rel("row-bw", "row-cable", 60); rel("row-bw", "row-supported", 62); rel("row-bw", "row-bent", 58); rel("row-tbar", "row-machine", 70); rel("row-supported", "row-machine", 76); rel("row-supported", "row-cable", 72);
  rows.forEach(r => { rel(r, "pulldown", 44); rel(r, "pullup", 36); rel(r, "reardelt", 42); rel(r, "upright", 30); rel(r, "straightarm", 24); });
  rel("pullup", "row-bw", 48);
  // hinge / legs
  rel("deadlift", "rdl", 72); rel("rdl", "goodmorning", 70); rel("goodmorning", "backext", 62); rel("deadlift", "backext", 40); rel("rdl", "hipthrust", 46); rel("deadlift", "hipthrust", 38);
  rel("pullthrough", "rdl", 58); rel("swing", "rdl", 56); rel("swing", "pullthrough", 62); rel("hipthrust", "pullthrough", 52); rel("deadlift", "goodmorning", 46); rel("backext", "hipthrust", 42);
  rel("nordic", "rdl", 42); rel("legcurl", "rdl", 40); rel("legcurl", "nordic", 76); rel("legcurl", "goodmorning", 30); rel("deadlift", "squat", 30);
  clique(["squat", "goblet", "bwsquat", "hack", "legpress", "sissy", "lunge", "split", "stepup", "legext"], 52);
  rel("squat", "goblet", 80); rel("squat", "hack", 74); rel("squat", "legpress", 70); rel("squat", "lunge", 56); rel("squat", "split", 62); rel("hack", "legpress", 76);
  rel("goblet", "bwsquat", 66); rel("squat", "bwsquat", 62); rel("lunge", "split", 82); rel("lunge", "stepup", 72); rel("split", "stepup", 70); rel("legext", "sissy", 66);
  rel("legext", "squat", 34); rel("legext", "legpress", 40); rel("legpress", "split", 50); rel("legpress", "lunge", 48); rel("hack", "lunge", 45); rel("hack", "split", 50);
  rel("stepup", "squat", 50); rel("goblet", "legpress", 56); rel("goblet", "hack", 60); rel("goblet", "lunge", 52); rel("goblet", "split", 56); rel("sissy", "squat", 44); rel("sissy", "hack", 44);
  rel("sissy", "legpress", 38); rel("legext", "hack", 36); rel("legext", "split", 34); rel("legext", "lunge", 34); rel("legext", "stepup", 34); rel("legext", "goblet", 34); rel("legext", "bwsquat", 34); rel("sissy", "bwsquat", 48);
  rel("wallsit", "squat", 40); rel("wallsit", "legext", 32); rel("wallsit", "bwsquat", 50); rel("bwsquat", "lunge", 52); rel("bwsquat", "split", 52); rel("bwsquat", "stepup", 50); rel("bwsquat", "hack", 40); rel("bwsquat", "legpress", 40);
  rel("hipthrust", "kickback-glute", 56); rel("kickback-glute", "abduct", 54); rel("hipthrust", "abduct", 36); rel("abduct", "adduct", 30); rel("hipthrust", "lunge", 30); rel("kickback-glute", "pullthrough", 36);
  rel("calf", "tib", 28);
  // shoulders / traps
  rel("ohp", "press-incline", 46); rel("lateral", "front", 52); rel("lateral", "scaption", 68); rel("front", "scaption", 62); rel("lateral", "reardelt", 40);
  rel("reardelt", "facepull", 76); rel("upright", "lateral", 52); rel("upright", "shrug", 50); rel("upright", "front", 40); rel("upright", "facepull", 38); rel("facepull", "row-cable", 36);
  rel("shrug", "carry", 32); rel("carry", "grip", 56); rel("shrug", "reardelt", 24); rel("lateral", "ohp", 28); rel("front", "ohp", 34); rel("front", "press-incline", 30);
  // arms
  rel("curl", "hammer", 76); rel("curl", "revcurl", 52); rel("hammer", "revcurl", 62); rel("wristcurl", "wristext", 70); rel("wristext", "revcurl", 55); rel("wristcurl", "revcurl", 40);
  rel("wristroll", "wristcurl", 62); rel("wristroll", "wristext", 62); rel("grip", "wristcurl", 36); rel("grip", "pullup", 24);
  // core
  rel("situp", "crunch", 82); rel("crunch", "legraise", 46); rel("situp", "legraise", 38); rel("plank", "rollout", 66); rel("plank", "rotation", 32); rel("crunch", "rotation", 46); rel("situp", "rotation", 36);
  rel("legraise", "plank", 36); rel("crunch", "plank", 28); rel("rollout", "crunch", 36); rel("rollout", "legraise", 30);
  rel("clean", "deadlift", 40); rel("clean", "swing", 46); rel("clean", "ohp", 42); rel("clean", "shrug", 36); rel("clean", "upright", 36);
  // cardio
  rel("run", "walk", 72); rel("run", "cycle", 62); rel("run", "ellip", 74); rel("run", "climb", 62); rel("walk", "climb", 68); rel("walk", "ellip", 66); rel("cycle", "ellip", 66); rel("cycle", "climb", 60);
  ["run", "walk", "cycle", "ellip"].forEach(f => rel("cardio", f, 74)); rel("cardio", "climb", 70); rel("cardio", "rowc", 60); rel("cardio", "swim", 56); rel("cardio", "hiit", 40);
  rel("swim", "run", 50); rel("swim", "cycle", 48); rel("swim", "ellip", 54); rel("swim", "rowc", 60); rel("swim", "climb", 40); rel("swim", "hiit", 34);
  rel("rowc", "run", 50); rel("rowc", "cycle", 50); rel("rowc", "ellip", 52); rel("rowc", "climb", 50); rel("hiit", "run", 42); rel("hiit", "cycle", 36); rel("hiit", "rowc", 42); rel("hiit", "ellip", 34); rel("hiit", "climb", 36); rel("hiit", "walk", 30);

  const famScore = (a, b) => (a === b ? 100 : (REL[a + "|" + b] || 0));

  /* ------------------------------------------------ equipment, angle, grip */
  const EXPLICIT = [
    ["smith", /smith/], ["kettlebell", /kettlebell/], ["band", /\bbands?\b|banded|resistance band/], ["landmine", /landmine/], ["trapbar", /trap bar|hex bar/],
    ["machine", /machine|hammer strength|iso-lateral|plate-loaded|selectorized|converging|nautilus|pec deck|assisted/], ["cable", /cable/],
    ["ezbar", /\bez[- ]?bar/], ["plate", /plate|svend/], ["barbell", /barbell|t-bar row/], ["dumbbell", /dumbbell|\bdb\b|arnold/]
  ];
  const IMPLIED = {
    pushdown: "cable", facepull: "cable", pulldown: "cable", straightarm: "cable", pullthrough: "cable", "row-cable": "cable", "row-machine": "machine",
    legext: "machine", legcurl: "machine", legpress: "machine", hack: "machine", abduct: "machine", adduct: "machine", tmachine: "machine", calf: "machine",
    deadlift: "barbell", rdl: "barbell", goodmorning: "barbell", "row-bent": "barbell", "row-tbar": "barbell", squat: "barbell", "press-flat": "barbell", "press-incline": "barbell",
    "press-decline": "barbell", cgpress: "barbell", ohp: "barbell", upright: "barbell", shrug: "barbell", hipthrust: "barbell", skull: "ezbar", jm: "barbell", curl: "",
    lateral: "dumbbell", front: "dumbbell", hammer: "dumbbell", "kickback-tri": "dumbbell", "row-db": "dumbbell", goblet: "dumbbell", scaption: "dumbbell", reardelt: "dumbbell", swing: "kettlebell",
    pushup: "bodyweight", pullup: "bodyweight", dip: "bodyweight", "row-bw": "bodyweight", situp: "bodyweight", crunch: "bodyweight", legraise: "bodyweight", plank: "bodyweight",
    wallsit: "bodyweight", bwsquat: "bodyweight", backext: "bodyweight", nordic: "bodyweight", hspu: "bodyweight", sissy: "bodyweight", fly: "dumbbell", pullover: "dumbbell"
  };
  const EQLABEL = { smith: "Smith machine", kettlebell: "Kettlebell", band: "Band", landmine: "Landmine", trapbar: "Trap bar", ezbar: "EZ-bar", barbell: "Barbell", plate: "Plate", dumbbell: "Dumbbells", cable: "Cable", machine: "Machine", bodyweight: "Bodyweight", none: "" };
  const EQNEAR = {};
  const eqn = (a, b, v) => { EQNEAR[a + "|" + b] = v; EQNEAR[b + "|" + a] = v; };
  eqn("barbell", "smith", 6); eqn("barbell", "trapbar", 7); eqn("barbell", "ezbar", 8); eqn("barbell", "landmine", 6); eqn("barbell", "dumbbell", 4); eqn("ezbar", "dumbbell", 4);
  eqn("dumbbell", "kettlebell", 6); eqn("dumbbell", "cable", 2); eqn("cable", "machine", 4); eqn("machine", "smith", 6); eqn("bodyweight", "band", 4); eqn("smith", "dumbbell", 3);
  eqn("cable", "band", 5); eqn("machine", "dumbbell", 1); eqn("landmine", "dumbbell", 3); eqn("trapbar", "dumbbell", 3); eqn("machine", "band", 2);

  function equipOf(n, fam) {
    // "machine" inside "smith machine" is the smith, so test the explicit list in order
    for (const [k, re] of EXPLICIT) if (re.test(n)) return k;
    if (fam === "hipthrust" && /bridge|frog|single-leg/.test(n)) return "bodyweight";
    if (/concentration|waiter curl|zottman|tate press|kick ?outs?|crucifix|pronation|cross-body (triceps|dumbbell)/.test(n)) return "dumbbell";
    if (/drag curl|row curl|jm press|french press/.test(n)) return "barbell";
    return IMPLIED[fam] || (/push-?up|pull-?up|chin-?up|\bdips?\b|bodyweight|plank|hang|sit-?up|crunch|leg raise/.test(n) ? "bodyweight" : "none");
  }
  const ANGLES = [["incline", /incline/], ["decline", /decline/]];
  const angleOf = n => { const h = ANGLES.find(([, re]) => re.test(n)); return h ? h[0] : ""; };
  const GRIPS = [["close", /close[- ]?grip|narrow/], ["wide", /wide[- ]?grip|wide-stance/], ["reverse", /reverse[- ]?grip|underhand|supinated/], ["neutral", /neutral[- ]?grip|v-bar|hammer(?! strength)/], ["rope", /\brope\b/], ["straight", /straight bar/], ["ez", /\bez[- ]?bar/]];
  const gripOf = n => { const h = GRIPS.find(([, re]) => re.test(n)); return h ? h[0] : ""; };
  const isUni = n => /single-arm|one-arm|single-leg|unilateral|alternating|b-stance|kroc|meadows|bulgarian|pistol|split squat/.test(n);
  const POSES = [["seated", /seated/], ["standing", /standing/], ["lying", /lying|decline bench|prone|floor/], ["kneeling", /kneeling|half-kneeling/], ["hanging", /hanging|captain/], ["supported", /chest.supported|preacher|spider|incline (dumbbell|seated)/]];
  const poseOf = n => { const h = POSES.find(([, re]) => re.test(n)); return h ? h[0] : ""; };
  const DETAIL = [["Incline", /incline/], ["Decline", /decline/], ["Close grip", /close[- ]?grip/], ["Wide grip", /wide[- ]?grip/], ["Reverse grip", /reverse[- ]?grip|underhand/], ["Neutral grip", /neutral[- ]?grip/],
    ["Single-arm", /single-arm|one-arm/], ["Single-leg", /single-leg/], ["Seated", /seated/], ["Standing", /standing/], ["Lying", /lying/], ["Kneeling", /kneeling/], ["Rope", /\brope\b/], ["V-bar", /v-bar/], ["Straight bar", /straight bar/], ["Weighted", /weighted/], ["Assisted", /assisted/]];

  const GENERIC = new Set(["press", "raise", "curl", "row", "pull", "extension", "squat", "lunge", "fly", "dip", "up", "ups", "push", "machine", "with", "the", "and", "bar", "single", "arm", "leg", "grip", "dumbbell", "barbell", "cable", "smith", "ez", "plate", "loaded", "iso", "lateral", "hammer", "strength", "seated", "standing", "lying"]);
  const wordSet = n => new Set((low(n).match(/[a-z]+/g) || []).map(w => (w.length > 3 && w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1) : w)).filter(w => w.length > 2 && !GENERIC.has(w)));
  // specialised variations: fine to suggest, but not before the everyday ones
  const HARD = /pause|jefferson|zercher|box squat|deficit|snatch|dorian|crucifix|tate press|copenhagen|body saw|stir the pot|kroc|gorilla|helms|spoto|svend|lu raise|commando|archer|clap|negative|windshield|dragon|flutter|\b21s\b|cossack|pistol|jumping|b-stance|seal row|yates|meadows|behind-the-back|behind-the-neck|scapular|reverse plank|power shrug|multi-hip|belt squat|v-squat|pendulum|handstand|ring |l-sit|eccentric|clean and press|scott press|drag curl|sissy|nordic|pike push|bird dog|dead bug|hollow|heel tap|toe touch|incline two-dumbbell|cross-body triceps|z press|push press|floor press|landmine|jump rope|mountain climber|row to straight leg/;

  const cache = new Map();
  function info(name, cat) {
    const k = low(name) + "|" + cat;
    let v = cache.get(k);
    if (v) return v;
    const n = norm(name);
    const fam = famOf(n, cat);
    v = { name, n, cat, fam, equip: equipOf(n, fam), angle: angleOf(n), grip: gripOf(n), uni: isUni(n), pose: poseOf(n), words: wordSet(name), hard: HARD.test(n) };
    cache.set(k, v);
    return v;
  }

  /** score of candidate `c` as a swap for current `x` (0 = unrelated) */
  function score(x, c, done, sameMu) {
    let s = famScore(x.fam, c.fam);
    if (s < 28 && x.fam.charAt(0) === "x" && c.fam === x.fam) s = 30;     // unknown movement: same muscle group only
    if (s < 28 && sameMu) s = 30;                                         // a different movement for the same muscle: offered, after the closer ones
    if (s < 28) return 0;
    const sameFam = x.fam === c.fam;
    if (x.equip === c.equip) s += x.equip === "none" ? 3 : 10;
    else if (x.equip === "none" || c.equip === "none") s += 3;
    else s += EQNEAR[x.equip + "|" + c.equip] || 0;
    if (x.angle || c.angle) s += x.angle === c.angle ? 6 : (x.angle && c.angle ? -8 : -5);
    if (x.grip || c.grip) s += x.grip === c.grip ? 4 : -2;
    if (x.uni || c.uni) s += x.uni === c.uni ? 4 : -4;
    if (x.pose && c.pose && x.pose === c.pose) s += 3;
    let common = 0; x.words.forEach(w => { if (c.words.has(w)) common++; });
    s += Math.min(3, common) * 2;
    if (c.hard && !x.hard) s -= 8;
    if (done) s += 8;
    return sameFam ? s : Math.min(s, 99);
  }

  function whyOf(x, c, done, perf) {
    const out = [];
    out.push(x.fam === c.fam ? "Same movement" : (LABEL[c.fam] || "Similar"));
    const eq = EQLABEL[c.equip];
    if (eq && !out[0].toLowerCase().includes(eq.toLowerCase().split(" ")[0])) out.push(eq);
    const dx = DETAIL.filter(([, re]) => re.test(c.n) && !re.test(x.n)).map(d => d[0]);
    if (dx.length) out.push(dx[0]);
    if (done) out.push(perf ? "Last " + perf : "Done before");
    return out.slice(0, 4);
  }

  /* ------------------------------------------------ the muscle an exercise trains
   * Every exercise in exercises.js has a "muscle". Similar exercises are only ever offered from the SAME muscle, so a
   * movement that works a different muscle (chest dips vs triceps dips) is not suggested. Names the list does not
   * know (old program names, history) are read by their movement instead. */
  const MU_FAM = {
    "press-flat": "Chest", "press-incline": "Chest", "press-decline": "Chest", fly: "Chest", pushup: "Chest",
    cgpress: "Triceps", skull: "Triceps", ohext: "Triceps", jm: "Triceps", pushdown: "Triceps", "kickback-tri": "Triceps", tmachine: "Triceps",
    pulldown: "Lats", pullup: "Lats", straightarm: "Lats",
    "row-bent": "Mid-Back", "row-tbar": "Mid-Back", "row-db": "Mid-Back", "row-supported": "Mid-Back", "row-cable": "Mid-Back", "row-machine": "Mid-Back", "row-bw": "Mid-Back",
    deadlift: "Lower Back", goodmorning: "Lower Back", backext: "Lower Back",
    rdl: "Hamstrings", nordic: "Hamstrings", legcurl: "Hamstrings",
    hipthrust: "Glutes", pullthrough: "Glutes", swing: "Glutes", "kickback-glute": "Glutes", abduct: "Glutes", adduct: "Adductors",
    legext: "Quads", sissy: "Quads", legpress: "Quads", hack: "Quads", split: "Quads", lunge: "Quads", stepup: "Quads", wallsit: "Quads", goblet: "Quads", bwsquat: "Quads", squat: "Quads",
    calf: "Lower Legs", tib: "Lower Legs",
    lateral: "Side Delts", scaption: "Side Delts", upright: "Side Delts", front: "Front Delts", ohp: "Front Delts", hspu: "Front Delts", reardelt: "Rear Delts", facepull: "Rear Delts",
    shrug: "Traps", clean: "Traps", carry: "Grip & Carries", grip: "Grip & Carries",
    wristcurl: "Forearms", wristext: "Forearms", wristroll: "Forearms", revcurl: "Brachioradialis", hammer: "Biceps", curl: "Biceps",
    situp: "Abs", crunch: "Abs", legraise: "Abs", rotation: "Obliques", plank: "Core Stability", rollout: "Core Stability",
    cardio: "Cardio", swim: "Cardio", climb: "Cardio", ellip: "Cardio", cycle: "Cardio", rowc: "Cardio", walk: "Cardio", run: "Cardio", hiit: "Cardio"
  };
  const MU_LIST = ["Chest", "Lats", "Mid-Back", "Lower Back", "Front Delts", "Side Delts", "Rear Delts", "Traps", "Neck", "Biceps", "Triceps", "Forearms", "Brachioradialis", "Grip & Carries",
    "Quads", "Hamstrings", "Glutes", "Adductors", "Lower Legs", "Abs", "Obliques", "Core Stability", "Cardio", "Upper Body Mobility", "Hips & Legs Mobility", "Spine & Full Body"];
  /** The muscle a movement family trains. A few families depend on the category ("dip", "pullover"). */
  function muOfFam(fam, cat) {
    if (fam === "dip") return cat === "Chest" ? "Chest" : "Triceps";
    if (fam === "pullover") return cat === "Chest" ? "Chest" : "Lats";
    return MU_FAM[fam] || null;
  }
  /** { mu, cat } for a list entry (or { category } for a bare name). `mu` is null when nobody knows. */
  function muscleOf(e, inf) {
    const mu = (e && typeof e.muscle === "string" && e.muscle) || muOfFam(inf.fam, (e && e.category) || inf.cat);
    return { mu: mu || null, cat: (e && e.category) || inf.cat };
  }
  /** Same muscle. When the current exercise's muscle is unknown, the same category is as close as it gets. */
  const sameMuscle = (a, b) => (a.mu ? b.mu === a.mu : a.cat === b.cat);

  /**
   * Best swaps for `curName`.
   *   pool:  [{ name, category, aka }]  everything to choose from
   *   ctx:   { cat(name) -> category, done(name) -> bool, perf(name) -> "135×8" | "" }
   */
  function suggest(curName, pool, ctx, limit) {
    limit = limit || 8;
    if (!curName || !pool || !pool.length) return [];
    const idx = ctx.index || makeIndex(pool);
    const curEntry = idx.canon(curName);
    const curCat = curEntry ? curEntry.category : ctx.cat(curName);
    const x = info(curEntry ? curEntry.name : curName, curCat);
    const xs = info(curName, curCat);              // the name as written (an old program name may carry detail the kept name lacks)
    const cx = { ...x, n: xs.n, words: new Set([...x.words, ...xs.words]), equip: x.equip !== "none" ? x.equip : xs.equip };
    const skip = new Set([low(curName)]);
    if (curEntry) { skip.add(low(curEntry.name)); (curEntry.aka || []).forEach(a => skip.add(low(a))); }
    const xmu = muscleOf(curEntry || { category: curCat }, x);
    const mine = (curEntry && Array.isArray(curEntry.similar)) ? curEntry.similar.map(low) : [];
    const forced = [];
    const scored = [];
    const seen = new Set();
    pool.forEach(e => {
      if (!e || !e.name) return;
      const l = low(e.name);
      if (skip.has(l) || seen.has(l)) return;
      seen.add(l);
      if (curEntry && e === curEntry) return;
      const c = info(e.name, e.category || "Other");
      const dn = ctx.done ? ctx.done(e) : false;
      // lifts the person linked as "similar" when they made one of the two (works both ways) come first
      const at = mine.indexOf(l);
      if (at >= 0 || (Array.isArray(e.similar) && e.similar.some(n => skip.has(low(n))))) { forced.push({ name: e.name, score: 100, c, done: dn, entry: e, order: at >= 0 ? at : 99 }); return; }
      if (x.cat === "Warm-Up & Mobility" !== (e.category === "Warm-Up & Mobility")) return;
      if ((x.cat === "Cardio") !== (e.category === "Cardio")) return;
      if (!sameMuscle(xmu, muscleOf(e, c))) return;      // a different muscle is never "similar"
      const sc = score(cx, c, dn, true);
      if (sc > 0) scored.push({ name: e.name, score: sc, c, done: dn, entry: e });
    });
    forced.sort((a, b) => a.order - b.order);
    if (forced.length > limit) forced.length = limit;
    scored.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
    // pick with a little variety: the 3rd barbell version is worth less than the first cable one,
    // and at most 5 are the very same movement while other close movements are still on offer
    const picked = [], eqCount = {};
    const room = Math.max(0, limit - forced.length);
    const pool2 = scored.slice(0, 80);
    const take = (maxSame, floorOther) => {
      while (picked.length < room) {
        const nSame = picked.filter(p => p.c.fam === x.fam).length;
        let bi = -1, bv = -1e9;
        pool2.forEach((s, i) => {
          const same = s.c.fam === x.fam;
          if (same && nSame >= maxSame) return;
          const v = s.score - 4 * (eqCount[s.c.equip] || 0);
          if (v < (same ? -999 : floorOther)) return;
          if (v > bv) { bv = v; bi = i; }
        });
        if (bi < 0) return;
        const s = pool2.splice(bi, 1)[0];
        picked.push(s);
        eqCount[s.c.equip] = (eqCount[s.c.equip] || 0) + 1;
      }
    };
    take(5, 62);      // up to five of the same movement, plus any really close relatives
    take(99, -999);   // then fill up with the rest of that muscle
    picked.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
    const out = s => ({ name: s.name, score: Math.round(s.score), why: whyOf(cx, s.c, s.done, ctx.perf ? ctx.perf(s.entry) : ""), fam: s.c.fam, equip: s.c.equip, done: s.done });
    return forced.map(s => { const o = out(s); o.why = ["Your pick"].concat(o.why.slice(1, 3)); o.pick = true; return o; }).concat(picked.map(out));
  }

  /** The muscle group a movement belongs to (only where that is unambiguous), for names the list does not know. */
  const FAMCAT = {};
  const fc = (cat, list) => list.split(" ").forEach(f => { FAMCAT[f] = cat; });
  fc("Chest", "press-flat press-incline press-decline fly pushup");
  fc("Triceps", "cgpress skull ohext pushdown jm kickback-tri tmachine");
  fc("Back", "pulldown pullup straightarm row-bent row-tbar row-db row-supported row-cable row-machine row-bw deadlift goodmorning backext");
  fc("Legs", "rdl pullthrough swing hipthrust nordic legcurl legext sissy calf tib legpress hack split lunge stepup wallsit goblet bwsquat squat abduct adduct kickback-glute");
  fc("Shoulders", "lateral front scaption hspu ohp reardelt facepull upright");
  fc("Traps", "shrug carry");
  fc("Forearms", "wristext wristcurl wristroll grip revcurl");
  fc("Biceps", "hammer curl");
  fc("Core", "situp legraise crunch rollout rotation plank");

  return { keyOf, norm, makeIndex, info, famOf, suggest, score, LABEL, famScore, FAMCAT, muscleOf, muOfFam, MU_LIST };
})();


    /* ---- 2.6.5 wiring: the swap list, exercise search and the exercise sheet use PTSIM ---- */
    (function () {
      "use strict";
      const proto = ApplicationUI.prototype;
      const db = () => (typeof EXERCISE_DATABASE !== "undefined" && Array.isArray(EXERCISE_DATABASE)) ? EXERCISE_DATABASE : [];

      /* the exercise index is rebuilt whenever the list changes (custom exercises are added at the end) */
      let IDX = null, SIG = "";
      const CAT = new Map();
      const sig = () => {
        const d = db();
        let s = d.length + ":";
        for (let i = d.length - 1; i >= 0 && d[i] && d[i].custom; i--) s += d[i].name + "," + d[i].category + ";";
        return s;
      };
      const index = () => {
        const s = sig();
        if (!IDX || s !== SIG) { IDX = PTSIM.makeIndex(db()); SIG = s; CAT.clear(); }
        return IDX;
      };

      /* an old or alternative name ("Barbell Bench Press") gets the category of the exercise it stands for */
      const origCategory = PT.category;
      PT.category = function (name) {
        const idx = index();
        const k = String(name || "");
        if (CAT.has(k)) return CAT.get(k);
        const e = idx.canon(k);
        let c;
        if (e && e.category) c = e.category;
        else {
          c = origCategory.call(PT, name);
          // A name the list has never heard of: read it by its movement ("Wide Grip Lat Pull Down" is a back exercise, not forearms)
          if (c !== "Cardio" && c !== "Warm-Up & Mobility") {
            const fcat = PTSIM.FAMCAT[PTSIM.famOf(PTSIM.norm(k), "Other")];
            if (fcat) c = fcat;
          }
        }
        CAT.set(k, c);
        return c;
      };

      const QSYN = { db: "dumbbell", dbs: "dumbbell", bb: "barbell", kb: "kettlebell", bw: "bodyweight", ohp: "overhead press", "tri": "triceps", "bi": "biceps" };
      const hay = new WeakMap();
      const hayOf = e => {
        let h = hay.get(e);
        if (!h) { h = [e.name].concat(Array.isArray(e.aka) ? e.aka : []).join(" | ").toLowerCase(); hay.set(e, h); }
        return h;
      };
      const qTokens = q => String(q || "").toLowerCase().split(/[\s,]+/).filter(Boolean).map(t => QSYN[t] || t);

      Object.assign(PT, {
        exIndex: index,
        /** The exercise-list entry a name stands for (its own name, an "aka" name, or just a spelling difference), or null. */
        exCanon(name) { return index().canon(name); },
        exName(name) { const e = index().canon(name); return e ? e.name : String(name || ""); },
        sameEx(a, b) {
          if (a === b) return true;
          const i = index(), x = i.canon(a), y = i.canon(b);
          return !!(x && y && x === y);
        },
        /** Search: every word must appear in the name, one of its other names, or its category. */
        exMatch(e, q) {
          const toks = qTokens(q);
          if (!toks.length) return true;
          const h = hayOf(e) + " | " + String(e.category || "").toLowerCase();
          return toks.every(t => h.includes(t));
        },
        /** The other name to show under a result when the search matched that name rather than the main one. */
        exHint(e, q) {
          const toks = qTokens(q);
          if (!toks.length || !Array.isArray(e.aka)) return "";
          const nm = e.name.toLowerCase(), cat = String(e.category || "").toLowerCase();
          if (toks.every(t => nm.includes(t) || cat.includes(t))) return "";
          return e.aka.find(a => { const l = a.toLowerCase(); return toks.every(t => l.includes(t) || nm.includes(t) || cat.includes(t)); }) || "";
        },
        exRank(e, q) {
          const l = e.name.toLowerCase(), c = String(e.category || "").toLowerCase(), s = String(q || "").trim().toLowerCase();
          if (l.startsWith(s)) return 0;
          if (Array.isArray(e.aka) && e.aka.some(a => a.toLowerCase().startsWith(s))) return 0.5;
          if (l.includes(s)) return 1;
          const toks = qTokens(q);
          if (toks.every(t => l.includes(t))) return 2;
          if (toks.every(t => l.includes(t) || c.includes(t))) return 3;
          return 4;
        }
      });

      /* ------------------------------------------------------ what you have done before */
      proto._simHistory = function () {
        const idx = index();
        const names = new Set(), perf = new Map(), extra = [];
        const topText = sets => {
          const top = sets.slice().sort((a, b) => (parseFloat(b.weight) || 0) - (parseFloat(a.weight) || 0))[0];
          if (!top) return "";
          if (top.min !== undefined) return PT.num(top.min, 1) + " min";
          const w = parseFloat(top.weight) || 0, r = top.reps;
          return w > 0 ? w + "×" + r : (r ? r + " reps" : "");
        };
        const add = (n, text) => {
          const e = idx.canon(n);
          const key = e ? e.name : n;
          names.add(key);
          if (text && (!perf.has(key) || n === key)) perf.set(key, text);
          if (!e && !extra.some(x => x.name === n)) extra.push({ name: n, category: PT.category(n) });
        };
        Object.keys(this.lastPerf || {}).forEach(k => {
          const sets = (this.lastPerf[k] || []).filter(x => x && x.tag !== "W");
          if (sets.length) add(k, topText(sets));
        });
        (this.sessions || []).forEach(s => (s.ex || []).forEach(e => { if (e && e.name) add(e.name, ""); }));
        return { names, perf, extra };
      };

      /* ------------------------------------------------------ similar exercises */
      proto.swapSuggestions = function (curName, limit) {
        const pool = db().filter(e => !PT.gymAllows || PT.gymAllows(e.name));
        if (!curName || !pool.length) return [];
        const hist = this._simHistory();
        const ctx = {
          index: index(),
          cat: n => PT.category(n),
          done: e => hist.names.has(e.name),
          perf: e => hist.perf.get(e.name) || ""
        };
        return PTSIM.suggest(curName, hist.extra.length ? pool.concat(hist.extra) : pool, ctx, limit || 8);
      };

      /** The muscle an exercise trains (what Similar exercises is matched on), or "". */
      proto.similarMuscle = function (name) {
        try {
          const e = index().canon(name), cat = e ? e.category : PT.category(name);
          return PTSIM.muscleOf(e || { category: cat }, PTSIM.info(e ? e.name : name, cat)).mu || "";
        } catch (err) { return ""; }
      };

      proto.swapSuggestionsSection = function (curName, onPick) {
        const sugg = this.swapSuggestions(curName);
        if (!sugg.length) return null;
        const mu = this.similarMuscle(curName);
        const section = document.createElement("div");
        section.className = "pt-sim";
        const header = document.createElement("div");
        header.className = "sticky top-0 z-10 px-4 py-1.5 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 flex items-center justify-between";
        header.innerHTML = `<span class="text-[11px] font-black uppercase tracking-widest text-amber-300">★ Similar exercises</span><span class="text-[10px] font-bold text-zinc-500">${mu ? PT.esc(mu) + " · " : ""}closest first</span>`;
        section.appendChild(header);
        sugg.forEach(sg => {
          const btn = document.createElement("button");
          btn.className = "sugg-item w-full flex items-center gap-3 px-4 min-h-[56px] py-2 border-b border-zinc-800/60 border-l-2 border-l-amber-500/60 bg-amber-950/10 text-left tap-active transition hover:bg-zinc-900";
          const why = sg.why.map(p => (/^Last |^Done before$/.test(p) ? `<span class="text-emerald-400 font-semibold">${PT.esc(p)}</span>` : PT.esc(p))).join(" · ");
          btn.innerHTML = `
            <span class="flex-grow min-w-0">
              <span class="block text-sm font-semibold text-zinc-100 leading-snug">${PT.esc(sg.name)}</span>
              <span class="block text-[10px] text-zinc-400 mt-0.5">${why}</span>
            </span>
            <svg class="w-4 h-4 shrink-0 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4M16 17H4m0 0l4-4m-4 4l4 4"/></svg>`;
          btn.addEventListener("click", () => onPick(sg.name, btn));
          section.appendChild(btn);
        });
        return section;
      };

      /* the exercise sheet: a folded "Similar exercises" list, tap one to open its page */
      const origExtras = proto.exSheetExtrasHtml;
      proto.exSheetExtrasHtml = function (name) {
        let html = origExtras.apply(this, arguments);
        try {
          const sugg = this.swapSuggestions(name, 6);
          if (sugg.length) {
            const mu = this.similarMuscle(name);
            html += `<details id="ex-similar" class="bg-zinc-950 border border-zinc-800 rounded-xl">
              <summary class="cursor-pointer select-none list-none flex items-center justify-between px-3 py-2.5 text-xs font-bold text-white tap-active">
                <span>Similar exercises</span><span class="text-[10px] font-semibold text-zinc-500">${mu ? PT.esc(mu) + " · " : ""}${sugg.length} · tap to see</span></summary>
              <div class="px-2 pb-2 space-y-1">${sugg.map(sg => `<button type="button" class="ex-sim w-full text-left rounded-lg px-2.5 py-2 bg-zinc-900 border border-zinc-800 tap-active" data-name="${PT.esc(sg.name)}">
                <span class="block text-xs font-semibold text-zinc-100">${PT.esc(sg.name)}</span>
                <span class="block text-[10px] text-zinc-500 mt-0.5">${PT.esc(sg.why.join(" · "))}</span></button>`).join("")}</div></details>`;
          }
        } catch (err) { console.warn("PulseTrack: similar exercises skipped", err); }
        return html;
      };
      /* Picking "Bench Press" when all your history is under "Barbell Bench Press" keeps using the name your history is under, so PRs and "last time" stay together */
      const origSelect = proto.handleExerciseSelection;
      proto.handleExerciseSelection = function (name, btn) {
        let use = name;
        try {
          const e = index().canon(name);
          if (e && Array.isArray(e.aka) && e.aka.length) {
            const count = n => ((this.lastPerf && this.lastPerf[n]) || []).length + (this.prs && this.prs[n] ? 1 : 0)
              + (this.sessions || []).reduce((t, s) => t + (s.ex || []).filter(x => x && x.name === n).length, 0);
            if (!count(e.name)) {
              let best = null, bestN = 0;
              e.aka.forEach(a => { const c = count(a); if (c > bestN) { best = a; bestN = c; } });
              if (best) use = best;
            }
          }
        } catch (err) { console.warn("PulseTrack: history name check skipped", err); }
        return origSelect.call(this, use, btn);
      };
      const origBind = proto.bindExSheetV4;
      proto.bindExSheetV4 = function (name) {
        origBind.apply(this, arguments);
        document.querySelectorAll("#ex-similar .ex-sim").forEach(b => b.addEventListener("click", () => this.openExerciseSheet(b.dataset.name)));
      };
    })();
  