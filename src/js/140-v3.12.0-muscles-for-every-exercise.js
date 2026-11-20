/* =====================================================================
 * PulseTrack 3.12.0: muscles worked for every exercise.
 *  Only a few exercises have muscles from studies (exercise-guides.js). Every other one now gets an estimate worked out from the kind
 *  of movement it is (PT.figure.classify, module 137: a flat press, a squat, a row ...), adjusted by words in its name ("close-grip",
 *  "incline", "sumo", "hammer" ...) and checked against its main muscle in the exercise list (if that muscle isn't among the main
 *  ones, it is added). An exercise no drawing fits gets the usual muscles for its main muscle. Stretches say which muscles they stretch,
 *  foam rolling which ones it works on.
 *  The values are "how much this muscle works, 0 to 100", main (primary) or helping (secondary), the same scale the study-based ones
 *  use; they are approximations for a typical lifter, said so on the screen ("Estimated from how the movement works").
 *  PT.musclesOf(name) -> { muscles: [{ muscle_id, role, intensity, source: "rule" }], kind: "worked" | "stretched" | "rolled",
 *  basis: "movement" | "main muscle" } or null for an empty name. Module 133 shows it when there is no built-in guide; module 137
 *  fills the same muscles on the drawings.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof PT === "undefined") return;

  // "primary muscles | helping muscles", each muscle:how hard it works (0..100)
  const MOVE = {
    bench_press: "chest:100 | upper_chest:60 front_delts:55 triceps:55",
    incline_press: "upper_chest:100 chest:75 | front_delts:65 triceps:50",
    decline_press: "chest:100 | triceps:55 front_delts:35 upper_chest:30",
    machine_chest_press: "chest:100 | front_delts:50 triceps:50 upper_chest:45",
    fly_lying: "chest:100 | upper_chest:55 front_delts:45 biceps:15",
    fly_incline: "upper_chest:100 chest:70 | front_delts:50 biceps:15",
    cable_fly: "chest:100 | upper_chest:50 front_delts:45 biceps:15",
    pec_deck: "chest:100 | upper_chest:50 front_delts:35",
    push_up: "chest:100 | triceps:60 front_delts:55 abs:30 serratus:25",
    push_up_incline: "chest:100 | triceps:55 front_delts:45 abs:20",
    push_up_decline: "upper_chest:100 chest:80 | front_delts:65 triceps:55 abs:30",
    push_up_knee: "chest:100 | triceps:55 front_delts:50 abs:15",
    floor_press: "chest:100 triceps:75 | front_delts:45",
    standing_press: "chest:100 | front_delts:50 triceps:40 abs:25",
    dip: "chest:90 triceps:90 | front_delts:60 abs:15",
    bench_dip: "triceps:100 | front_delts:45 chest:35",
    overhead_press: "front_delts:100 | side_delts:60 triceps:60 upper_chest:30 traps:35 abs:30",
    overhead_press_seated: "front_delts:100 | side_delts:60 triceps:60 upper_chest:25 traps:30",
    pike_pushup: "front_delts:100 | triceps:60 side_delts:45 upper_chest:30 abs:25",
    handstand_pushup: "front_delts:100 triceps:75 | side_delts:50 traps:45 abs:35",
    front_raise: "front_delts:100 | side_delts:40 upper_chest:30 serratus:20",
    lateral_raise: "side_delts:100 | front_delts:35 traps:35 rear_delts:20",
    upright_row: "side_delts:100 traps:75 | front_delts:45 biceps:30",
    shrug: "traps:100 | forearm_flexors:35 neck:20",
    reverse_fly: "rear_delts:100 | mid_back:70 traps:40 side_delts:20",
    face_pull: "rear_delts:100 | mid_back:65 traps:50 side_delts:30 biceps:25",
    y_raise: "traps:85 rear_delts:80 | side_delts:55 mid_back:55",
    external_rotation: "rear_delts:90 | side_delts:30 mid_back:30",
    curl: "biceps:100 | brachialis:65 forearm_flexors:40 front_delts:15",
    curl_seated: "biceps:100 | brachialis:65 forearm_flexors:40",
    preacher_curl: "biceps:100 | brachialis:70 forearm_flexors:35",
    concentration_curl: "biceps:100 | brachialis:60 forearm_flexors:30",
    incline_curl: "biceps:100 | brachialis:55 forearm_flexors:35",
    spider_curl: "biceps:100 | brachialis:60 forearm_flexors:30",
    high_cable_curl: "biceps:100 | brachialis:50 front_delts:25",
    wrist_curl: "forearm_flexors:100 | forearm_extensors:20",
    pushdown: "triceps:100 | forearm_extensors:20 abs:15",
    overhead_triceps: "triceps:100 | front_delts:20 abs:20",
    overhead_triceps_seated: "triceps:100 | front_delts:20",
    skull_crusher: "triceps:100 | forearm_extensors:20 lats:15",
    kickback: "triceps:100 | rear_delts:30 mid_back:20",
    pull_up: "lats:100 | mid_back:65 biceps:60 brachialis:45 rear_delts:35 forearm_flexors:40 abs:25",
    lat_pulldown: "lats:100 | mid_back:60 biceps:55 brachialis:40 rear_delts:35",
    straight_arm_pulldown: "lats:100 | triceps:35 rear_delts:30 abs:25",
    pullover: "lats:85 chest:80 | triceps:40 serratus:40",
    seated_row: "mid_back:100 lats:85 | biceps:55 rear_delts:50 traps:40 lower_back:25",
    bent_row: "mid_back:100 lats:90 | rear_delts:55 biceps:55 lower_back:45 traps:40 hamstrings:30",
    one_arm_row: "lats:100 mid_back:90 | rear_delts:50 biceps:55 obliques:25",
    chest_supported_row: "mid_back:100 lats:85 | rear_delts:60 biceps:50 traps:45",
    inverted_row: "mid_back:100 lats:85 | biceps:55 rear_delts:55 abs:30",
    renegade_row: "lats:90 mid_back:80 abs:75 | obliques:55 triceps:30 chest:30",
    dead_hang: "forearm_flexors:100 lats:60 | traps:30 abs:20",
    deadlift: "glutes:100 hamstrings:90 lower_back:85 | quads:60 traps:50 forearm_flexors:50 mid_back:40 lats:35 abs:30",
    rdl: "hamstrings:100 glutes:85 | lower_back:65 forearm_flexors:35 traps:25 mid_back:25",
    single_leg_rdl: "hamstrings:100 glutes:95 | glute_med:55 lower_back:45 calves:25 obliques:20",
    good_morning: "hamstrings:100 lower_back:85 | glutes:70",
    seated_good_morning: "lower_back:100 | glutes:50 hamstrings:45",
    back_extension: "lower_back:100 glutes:80 | hamstrings:65",
    seated_back_extension: "lower_back:100 | glutes:45 hamstrings:30",
    reverse_hyper: "glutes:100 | hamstrings:70 lower_back:60",
    superman: "lower_back:100 | glutes:55 rear_delts:30 hamstrings:30 mid_back:30",
    squat: "quads:100 glutes:85 | adductors:60 lower_back:40 hamstrings:35 abs:30 calves:20",
    air_squat: "quads:100 glutes:75 | adductors:45 hamstrings:30 calves:20",
    front_squat: "quads:100 | glutes:70 adductors:45 abs:45 mid_back:40 traps:25",
    goblet_squat: "quads:100 | glutes:70 adductors:45 abs:35 front_delts:20",
    squat_hold: "quads:100 | glutes:55 adductors:45 calves:30",
    pistol: "quads:100 glutes:85 | glute_med:50 abs:35 hamstrings:30 calves:30 hip_flexors:30",
    sissy_squat: "quads:100 | hip_flexors:35 abs:25",
    wall_sit: "quads:100 | glutes:40 adductors:30 calves:20",
    leg_press: "quads:100 | glutes:70 adductors:50 hamstrings:25 calves:20",
    lunge: "quads:100 glutes:90 | adductors:45 glute_med:40 hamstrings:35 calves:25",
    split_squat_rear: "quads:100 glutes:90 | adductors:40 glute_med:40 hamstrings:30 hip_flexors:25",
    lateral_lunge: "adductors:90 glutes:90 quads:85 | glute_med:40 hamstrings:30",
    step_up: "quads:100 glutes:95 | glute_med:40 hamstrings:35 calves:30",
    leg_extension: "quads:100",
    leg_curl: "hamstrings:100 | calves:35",
    leg_curl_seated: "hamstrings:100 | calves:30",
    standing_leg_curl: "hamstrings:100 | calves:30 glutes:15",
    ball_leg_curl: "hamstrings:100 glutes:70 | calves:30 abs:25 lower_back:25",
    supine_leg_curl: "hamstrings:100 glutes:70 | calves:30 abs:25 lower_back:25",
    nordic: "hamstrings:100 | glutes:50 calves:35",
    reverse_nordic: "quads:100 | hip_flexors:50 abs:25",
    hip_thrust: "glutes:100 | hamstrings:50 quads:40 adductors:30 lower_back:20",
    glute_bridge: "glutes:100 | hamstrings:55 lower_back:25 abs:20",
    glute_bridge_loaded: "glutes:100 | hamstrings:50 quads:30 adductors:25",
    hip_extension: "glutes:100 | hamstrings:55 lower_back:20",
    pull_through: "glutes:100 hamstrings:80 | lower_back:40 forearm_flexors:25",
    hip_abduction: "glute_med:100 | glutes:55",
    hip_abduction_seated: "glute_med:100 | glutes:60",
    hip_adduction: "adductors:100",
    hip_adduction_seated: "adductors:100",
    calf_raise: "calves:100",
    seated_calf_raise: "calves:100",
    tibialis_raise: "tibialis:100",
    swing: "glutes:100 hamstrings:85 | lower_back:55 abs:40 forearm_flexors:35 front_delts:30 quads:30",
    clean: "glutes:90 quads:85 hamstrings:80 traps:75 | lower_back:55 front_delts:50 calves:45 forearm_flexors:40 mid_back:35",
    snatch: "glutes:90 quads:80 hamstrings:80 traps:70 front_delts:75 | lower_back:50 side_delts:45 triceps:40 calves:40 abs:35",
    thruster: "quads:100 front_delts:90 glutes:80 | triceps:60 side_delts:45 abs:40 upper_chest:25",
    carry: "forearm_flexors:100 traps:85 | abs:55 obliques:55 glutes:40 quads:35 calves:30",
    overhead_carry: "front_delts:90 traps:85 abs:80 | side_delts:60 triceps:50 obliques:50",
    burpee: "quads:85 chest:75 glutes:75 | triceps:50 front_delts:50 abs:45 calves:40 hamstrings:30",
    jump: "quads:100 glutes:85 calves:80 | hamstrings:45 abs:25",
    jump_rope: "calves:100 | quads:45 forearm_flexors:35 front_delts:30 abs:25",
    jumping_jack: "calves:80 glute_med:75 | quads:50 side_delts:45 adductors:45 abs:25",
    mountain_climber: "abs:100 hip_flexors:80 | front_delts:50 quads:45 obliques:40 chest:30",
    bear_crawl: "abs:90 front_delts:85 quads:70 | triceps:45 glutes:40 hip_flexors:40 chest:35",
    inchworm: "hamstrings:80 abs:80 front_delts:75 | chest:40 triceps:40 lower_back:30",
    run: "quads:90 calves:90 glutes:80 hamstrings:75 | hip_flexors:60 abs:30 tibialis:30",
    walk: "quads:70 glutes:70 calves:70 | hamstrings:55 hip_flexors:45 tibialis:30",
    cycle: "quads:100 glutes:70 | hamstrings:55 calves:50 hip_flexors:40",
    stairs: "quads:100 glutes:95 calves:70 | hamstrings:50",
    rower: "lats:85 mid_back:80 quads:85 glutes:75 | hamstrings:60 biceps:50 rear_delts:45 lower_back:45 abs:30 calves:20",
    arm_bike: "front_delts:85 triceps:70 biceps:70 | lats:50 mid_back:45 rear_delts:40 forearm_flexors:35",
    slam: "lats:85 abs:85 | front_delts:60 triceps:45 glutes:45 obliques:40 quads:35",
    crunch: "abs:100 | obliques:45",
    cable_crunch: "abs:100 | obliques:50 lats:20",
    sit_up: "abs:100 hip_flexors:70 | obliques:45",
    v_up: "abs:100 hip_flexors:80 | obliques:40 quads:20",
    leg_raise: "abs:100 hip_flexors:90 | obliques:40 quads:20",
    hanging_leg_raise: "abs:100 hip_flexors:90 | obliques:50 forearm_flexors:50 lats:30",
    knee_tuck: "abs:100 hip_flexors:70 | obliques:35",
    plank: "abs:100 | obliques:60 front_delts:40 glutes:35 quads:30 serratus:30 lower_back:25",
    side_plank: "obliques:100 | abs:55 glute_med:55 lower_back:30 side_delts:35 adductors:25",
    reverse_plank: "glutes:85 lower_back:80 hamstrings:75 | rear_delts:50 triceps:40 abs:35",
    hollow_hold: "abs:100 | hip_flexors:60 obliques:45 quads:20",
    l_sit: "abs:100 hip_flexors:90 | triceps:55 quads:50 front_delts:30 lats:25",
    dead_bug: "abs:100 | obliques:50 hip_flexors:40",
    bird_dog: "lower_back:85 glutes:80 abs:70 | rear_delts:40 hamstrings:35 obliques:35",
    ab_wheel: "abs:100 | lats:60 obliques:50 front_delts:40 serratus:35 triceps:30 hip_flexors:30",
    russian_twist: "obliques:100 | abs:65 hip_flexors:35",
    woodchop: "obliques:100 | abs:60 front_delts:35 lats:25 glutes:25",
    pallof: "obliques:100 abs:80 | glute_med:30 front_delts:25",
    side_bend: "obliques:100 | abs:35 lower_back:35 forearm_flexors:25",
    standing_twist: "obliques:100 | abs:50 mid_back:30",
    landmine_twist: "obliques:100 | abs:60 front_delts:50 glutes:30 triceps:20",
    arm_circles: "side_delts:100 front_delts:80 rear_delts:80 | traps:30",
    wall_slide: "traps:85 serratus:80 | rear_delts:60 mid_back:60",
    hip_circles: "hip_flexors:85 glute_med:85 | glutes:60 adductors:55",
    grip: "forearm_flexors:100 | forearm_extensors:40",
    neck_flexion: "neck:100",
    neck_extension: "neck:100 traps:60",
    neck_side: "neck:100 | traps:40",
    battle_ropes: "front_delts:90 side_delts:70 | forearm_flexors:60 abs:50 traps:40 biceps:40 triceps:40 quads:40 glutes:35",
    sled_push: "quads:100 glutes:90 calves:80 | hamstrings:50 front_delts:45 triceps:45 abs:40 chest:35",
    sled_pull: "glutes:90 hamstrings:85 quads:80 | mid_back:55 lats:50 forearm_flexors:50 calves:50 biceps:45",
    swim: "lats:100 front_delts:80 | triceps:60 chest:55 mid_back:45 abs:45 glutes:45 hamstrings:40 quads:40 calves:30",
    boxing: "front_delts:90 obliques:80 | triceps:60 chest:50 abs:50 calves:45 side_delts:40 serratus:40 glutes:30"
  };
  // stretches (the muscles they stretch) and foam rolling (the muscles it works on)
  const STRETCH = {
    stretch: "", lying_twist: "obliques:100 | lower_back:60 glutes:40", hip_flexor_stretch: "hip_flexors:100 | quads:60 abs:20",
    toe_reach: "hamstrings:100 | lower_back:60 calves:40", calf_stretch: "calves:100 | hamstrings:20", doorway_stretch: "chest:100 | front_delts:70 biceps:30",
    child_pose: "lats:90 lower_back:90 | glutes:40 mid_back:40", quad_stretch: "quads:100 | hip_flexors:60", leg_swing: "hamstrings:80 hip_flexors:80 | adductors:60 glutes:50",
    cat_cow: "lower_back:100 mid_back:80 | abs:50", worlds_greatest: "hip_flexors:100 hamstrings:85 | adductors:60 mid_back:55 glutes:50 obliques:40",
    dislocate: "chest:80 front_delts:80 | rear_delts:50 mid_back:45", thoracic_rotation: "mid_back:100 obliques:70 | lats:40",
    pigeon: "glutes:100 glute_med:80 | hip_flexors:60 lower_back:30", ankle_rock: "calves:100 | tibialis:40", cross_body_stretch: "rear_delts:100 | mid_back:60 traps:30",
    triceps_stretch: "triceps:100 | lats:60", knee_to_chest: "glutes:100 lower_back:80 | hamstrings:50"
  };
  const ROLL = { foam_roll_upper: "mid_back:100 | lats:60 traps:40", foam_roll_lower: "quads:100 hamstrings:90 calves:80 | glutes:60 adductors:50" };
  // an exercise's main muscle (the exercise list) -> the usual muscles, and which muscles count as "that muscle"
  const MAIN = {
    "Chest": ["chest:100 | front_delts:50 triceps:45", "chest upper_chest"], "Lower Back": ["lower_back:100 | glutes:50 hamstrings:40", "lower_back"],
    "Mid-Back": ["mid_back:100 lats:80 | rear_delts:50 biceps:40 traps:40", "mid_back lats traps rear_delts"], "Lats": ["lats:100 | mid_back:60 biceps:50 rear_delts:30", "lats mid_back"],
    "Quads": ["quads:100 | glutes:60 adductors:35", "quads"], "Hamstrings": ["hamstrings:100 | glutes:55 calves:20", "hamstrings"],
    "Glutes": ["glutes:100 | hamstrings:50 glute_med:40 quads:30", "glutes glute_med"], "Adductors": ["adductors:100", "adductors"],
    "Lower Legs": ["calves:100 | tibialis:30", "calves tibialis"], "Front Delts": ["front_delts:100 | side_delts:45 triceps:40 upper_chest:25", "front_delts"],
    "Side Delts": ["side_delts:100 | front_delts:40 traps:35", "side_delts"], "Rear Delts": ["rear_delts:100 | mid_back:55 traps:35", "rear_delts"],
    "Biceps": ["biceps:100 | brachialis:60 forearm_flexors:35", "biceps brachialis"], "Triceps": ["triceps:100", "triceps"], "Traps": ["traps:100 | neck:30", "traps"],
    "Grip & Carries": ["forearm_flexors:100 | forearm_extensors:40 traps:30", "forearm_flexors forearm_extensors traps"],
    "Brachioradialis": ["forearm_extensors:100 brachialis:80 | biceps:50", "forearm_extensors brachialis"], "Forearms": ["forearm_flexors:100 | forearm_extensors:60", "forearm_flexors forearm_extensors"],
    "Abs": ["abs:100 | obliques:50 hip_flexors:30", "abs obliques"], "Obliques": ["obliques:100 | abs:55", "obliques"],
    "Core Stability": ["abs:100 obliques:70 | lower_back:45 glutes:30", "abs obliques lower_back"], "Neck": ["neck:100 | traps:40", "neck"],
    "Cardio": ["quads:80 glutes:70 calves:60 | hamstrings:50 front_delts:30 abs:30", ""],
    "Upper Body Mobility": ["front_delts:70 side_delts:70 rear_delts:70 mid_back:70 | traps:40 chest:40", "", "stretched"],
    "Spine & Full Body": ["lower_back:80 mid_back:80 obliques:70 | glutes:50 hip_flexors:50", "", "stretched"],
    "Hips & Legs Mobility": ["hip_flexors:85 glutes:80 hamstrings:80 adductors:70 | quads:40 calves:40", "", "stretched"]
  };
  const KNOWN = new Set((PT.MUSCLES || []).map(m => m[0]));
  function parse(spec) {
    const out = new Map(); if (!spec) return out;
    const [p, s] = spec.split("|");
    const add = (txt, role) => (txt || "").trim().split(/\s+/).filter(Boolean).forEach(t => { const [id, v] = t.split(":"); if (!KNOWN.size || KNOWN.has(id)) out.set(id, { role, v: +v }); });
    add(p, "primary"); add(s, "secondary");
    return out;
  }
  const set = (m, id, role, v) => { const c = m.get(id); m.set(id, { role: role === "keep" ? (c ? c.role : "secondary") : role, v: Math.max(v, c && role === "keep" ? c.v : 0) }); };
  const PRESS = /^(bench_press|incline_press|decline_press|machine_chest_press|push_up\w*|floor_press|standing_press)$/, PULL = /^(pull_up|lat_pulldown|seated_row|bent_row|one_arm_row|chest_supported_row|inverted_row)$/;
  const CURL = /curl$/;
  // words in the name that change the muscles
  function adjust(m, id, n) {
    if (PRESS.test(id) && /close[- ]grip|narrow|diamond|triangle|jm press/.test(n)) { set(m, "triceps", "primary", 90); set(m, "chest", "primary", 85); }
    if (PRESS.test(id) && /wide[- ]grip/.test(n)) { set(m, "chest", "primary", 100); set(m, "triceps", "secondary", 40); }
    if (id === "dip" && /triceps|bench|straight[- ]bar|korean/.test(n)) { set(m, "triceps", "primary", 100); set(m, "chest", "secondary", 50); }
    if (id === "dip" && /chest/.test(n)) { set(m, "chest", "primary", 100); set(m, "triceps", "primary", 80); }
    if (PULL.test(id) && /chin[- ]?up|underhand|reverse[- ]grip|supinated/.test(n)) set(m, "biceps", id === "pull_up" || id === "lat_pulldown" ? "primary" : "secondary", 75);
    if (PULL.test(id) && /wide/.test(n)) { set(m, "lats", "primary", 100); set(m, "rear_delts", "secondary", 45); }
    if (PULL.test(id) && /close[- ]grip|v[- ]bar|neutral/.test(n)) set(m, "biceps", "keep", 65);
    if (CURL.test(id) && id !== "wrist_curl" && /hammer|neutral|rope curl|cross[- ]body|pinwheel/.test(n)) { set(m, "brachialis", "primary", 90); set(m, "forearm_extensors", "secondary", 60); set(m, "biceps", "primary", 75); }
    if (CURL.test(id) && id !== "wrist_curl" && /reverse|overhand|pronated|zottman/.test(n)) { set(m, "brachialis", "primary", 85); set(m, "forearm_extensors", "primary", 80); set(m, "biceps", "secondary", 55); }
    if (id === "wrist_curl" && /reverse|extension|behind/.test(n) && /reverse|extension/.test(n)) { m.clear(); set(m, "forearm_extensors", "primary", 100); set(m, "forearm_flexors", "secondary", 20); }
    if (/^(squat|deadlift|air_squat|goblet_squat|leg_press)$/.test(id) && /sumo|wide[- ]stance|plie|pli[eé]/.test(n)) { set(m, "adductors", "primary", 75); set(m, "glutes", "primary", 90); }
    if (id === "deadlift" && /trap bar|hex bar/.test(n)) set(m, "quads", "primary", 85);
    if (id === "deadlift" && /rack pull|block pull/.test(n)) { set(m, "traps", "primary", 75); set(m, "quads", "secondary", 30); }
    if (/^(lunge|step_up|split_squat_rear)$/.test(id) && /curtsy|lateral|side|cossack/.test(n)) { set(m, "glute_med", "primary", 70); set(m, "adductors", "secondary", 60); }
    if (/^(crunch|sit_up|v_up|leg_raise|hanging_leg_raise|knee_tuck|cable_crunch)$/.test(id) && /oblique|bicycle|twist|cross|side|windshield/.test(n)) set(m, "obliques", "primary", 90);
    if (id === "plank" && /shoulder tap|up[- ]down|walk|reach/.test(n)) { set(m, "front_delts", "secondary", 60); set(m, "triceps", "secondary", 45); set(m, "obliques", "keep", 65); }
    if (id === "carry" && /suitcase|one[- ]arm|single|unilateral/.test(n)) set(m, "obliques", "primary", 90);
    if (/single[- ]arm|one[- ]arm|unilateral|alternating/.test(n) && /press|row|raise|carry|curl/.test(n)) set(m, "obliques", "keep", 25);
    if (/single[- ]leg|one[- ]leg|pistol|skater/.test(n) && !/^(leg_curl\w*|leg_extension|calf_raise|seated_calf_raise|hip_\w+)$/.test(id)) set(m, "glute_med", "keep", 40);
    if (/^(lateral_raise)$/.test(id) && /bent[- ]over|rear|reverse/.test(n)) { set(m, "rear_delts", "primary", 100); set(m, "side_delts", "secondary", 45); }
    if (/^(calf_raise)$/.test(id) && /tibialis|toe raise/.test(n)) { m.clear(); set(m, "tibialis", "primary", 100); }
  }
  function toList(m, kind) {
    const arr = [...m.entries()].map(([id, x]) => ({ muscle_id: id, role: x.role, intensity: Math.max(1, Math.min(100, Math.round(x.v))), source: "rule" }));
    arr.sort((a, b) => (a.role === "primary" ? 0 : 1) - (b.role === "primary" ? 0 : 1) || b.intensity - a.intensity);
    return { muscles: arr, kind };
  }
  function entryOf(name) {
    try { const e = PT.exCanon && PT.exCanon(name); if (e) return e; } catch (er) { }
    try { const l = String(name).toLowerCase(); return (typeof EXERCISE_DATABASE !== "undefined" ? EXERCISE_DATABASE : []).find(x => x && x.name.toLowerCase() === l) || null; } catch (er) { return null; }
  }
  // an exercise of your own that no drawing fits: the kind of movement from the words in its name
  const WORDS = [[/incline.*(press|fly|flye)/, "incline_press"], [/decline.*press/, "decline_press"], [/chest press|bench press|\bbench\b/, "bench_press"], [/\bfly|flye|pec deck/, "pec_deck"],
    [/shoulder press|overhead press|military press/, "overhead_press"], [/lateral raise|side raise/, "lateral_raise"], [/front raise/, "front_raise"], [/rear delt|reverse fly/, "reverse_fly"],
    [/pull[- ]?down/, "lat_pulldown"], [/pull[- ]?up|chin[- ]?up/, "pull_up"], [/\brows?\b/, "seated_row"], [/leg curl|hamstring curl/, "leg_curl"], [/leg extension/, "leg_extension"],
    [/leg press/, "leg_press"], [/squat|hack/, "squat"], [/\brdl\b|romanian|stiff/, "rdl"], [/deadlift/, "deadlift"], [/lunge|split squat/, "lunge"], [/calf/, "calf_raise"],
    [/hip thrust|glute bridge/, "hip_thrust"], [/abduct/, "hip_abduction_seated"], [/adduct/, "hip_adduction_seated"], [/wrist/, "wrist_curl"], [/curl/, "curl"],
    [/push ?down|tricep|skull/, "pushdown"], [/crunch|sit[- ]?up/, "crunch"], [/plank/, "plank"], [/shrug/, "shrug"], [/\bdips?\b/, "dip"], [/push[- ]?up/, "push_up"],
    [/back extension|hyperextension/, "back_extension"], [/twist|woodchop/, "russian_twist"], [/leg raise|knee raise/, "hanging_leg_raise"]];
  const memo = new Map();
  PT.musclesOf = function (name) {
    name = String(name || "").trim(); if (!name) return null;
    if (memo.has(name)) return memo.get(name);
    const e = entryOf(name) || {}, n = name.toLowerCase(), c = PT.figure ? PT.figure.classify(name) : null, id = c ? c.draw || c.id : null;
    const main = MAIN[e.muscle] || null;
    let m = null, kind = "worked", basis = "movement";
    if (id && ROLL[id] != null) { m = parse(ROLL[id]); kind = "rolled"; }
    else if (id && STRETCH[id] != null) { m = parse(STRETCH[id] || (main ? main[0] : "")); kind = "stretched"; }
    else if (id && MOVE[id]) { m = parse(MOVE[id]); adjust(m, id, n); }
    else if (!id && !e.muscle) { const w = WORDS.find(([rx]) => rx.test(n)); if (w) { m = parse(MOVE[w[1]]); adjust(m, w[1], n); basis = "name"; } }
    if (!m || !m.size) {
      m = parse(main ? main[0] : (e.category && /cardio/i.test(e.category) ? MAIN.Cardio[0] : ""));
      basis = "main muscle"; if (main && main[2]) kind = main[2];
      if (!m.size) { memo.set(name, null); return null; }
    }
    // the exercise list's main muscle must be one of the main ones
    if (kind === "worked" && main && main[1]) {
      const want = main[1].split(" "), P = [...m.entries()].filter(([, x]) => x.role === "primary").map(([k]) => k);
      if (!want.some(w => P.includes(w))) set(m, want[0], "primary", 90);
    }
    const r = Object.assign(toList(m, kind), { basis });
    memo.set(name, r); return r;
  };
  PT.musclesOf.MOVE = MOVE; PT.musclesOf.STRETCH = STRETCH; PT.musclesOf.ROLL = ROLL; PT.musclesOf.MAIN = MAIN;
})();
