// Built-in programs shipped to everyone. Upload next to index.html
const BUILTIN_PROGRAMS = [
 {
  "id": "kai_greene_beast_beach_6wk",
  "title": "6 Weeks Shred: The Beast of the Beach",
  "description": "Kai Greene's 6-week cutting protocol. Features pre-workout cardio and ab primers, followed by high-volume splits. Phase 1 (Weeks 1-3) utilizes strict 45-second rests, while Phase 2 (Weeks 4-6) accelerates metabolic density with 30-second rests.",
  "tags": [
   "Kai Greene",
   "Cutting",
   "Fat Loss",
   "6 Weeks",
   "High Volume"
  ],
  "days": [
   {
    "dayNumber": 1,
    "title": "[W1-3] Day 1: Quad & Hamstring Foundation",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "kg_w1_d1_e1",
      "name": "Barbell Squat",
      "sets": 3,
      "reps": "8",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Warm up with 30 min cardio + 2 ab movements (3x30). Full squat depth."
     },
     {
      "id": "kg_w1_d1_e2",
      "name": "Conventional Deadlift",
      "sets": 3,
      "reps": "8",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Reset each rep on floor. Maintain neutral spine and brace."
     },
     {
      "id": "kg_w1_d1_e3",
      "name": "Jefferson Squats",
      "sets": 3,
      "reps": "12",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Straddle the barbell with feet staggered. Switch foot lead each set."
     },
     {
      "id": "kg_w1_d1_e4",
      "name": "Leg Extensions",
      "sets": 3,
      "reps": "12",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Peak contraction pause at the top of every rep."
     },
     {
      "id": "kg_w1_d1_e5",
      "name": "Lying Leg Curls",
      "sets": 3,
      "reps": "12",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Hips down on pad; slow controlled negative."
     },
     {
      "id": "kg_w1_d1_e6",
      "name": "Seated Calf Raises",
      "sets": 3,
      "reps": "20",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Full stretch at bottom; hold peak contraction for 1 second."
     },
     {
      "id": "kg_w1_d1_e7",
      "name": "Standing Calf Raises",
      "sets": 3,
      "reps": "20",
      "restSeconds": 45,
      "type": "standard",
      "notes": "High rep pump; do not bounce out of the stretch."
     }
    ]
   },
   {
    "dayNumber": 2,
    "title": "[W1-3] Day 2: Chest, Delts & Triceps",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "kg_w1_d2_e1",
      "name": "Barbell Bench Press",
      "sets": 3,
      "reps": "8",
      "restSeconds": 45,
      "type": "standard",
      "notes": "30 min cardio + 2 ab exercises (3x30) pre-lift. Retract scapulae."
     },
     {
      "id": "kg_w1_d2_e2",
      "name": "Incline Barbell Bench Press",
      "sets": 3,
      "reps": "8",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Touch upper chest lightly, drive straight up."
     },
     {
      "id": "kg_w1_d2_e3",
      "name": "Dumbbell Chest Fly",
      "sets": 3,
      "reps": "12",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Wide stretch arc; slight elbow bend."
     },
     {
      "id": "kg_w1_d2_e4",
      "name": "Dumbbell Shoulder Press",
      "sets": 3,
      "reps": "12",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Seated or standing; press overhead without clashing dumbbells."
     },
     {
      "id": "kg_w1_d2_e5",
      "name": "Skullcrushers (Lying Triceps Extension)",
      "sets": 3,
      "reps": "12",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Lower bar to forehead or crown; pin elbows in."
     },
     {
      "id": "kg_w1_d2_e6",
      "name": "Dumbbell Lateral Raises",
      "sets": 3,
      "reps": "20",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Lead with elbows for side delt isolation."
     },
     {
      "id": "kg_w1_d2_e7",
      "name": "Rear Delt Cable Flys",
      "sets": 3,
      "reps": "20",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Cross cables without handles; squeeze rear delts."
     }
    ]
   },
   {
    "dayNumber": 3,
    "title": "[W1-3] Day 3: Back Thickness & Biceps",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "kg_w1_d3_e1",
      "name": "Barbell Bent-Over Row",
      "sets": 3,
      "reps": "8",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Pre-lift: 30 min cardio + 2 ab exercises (3x30). Pull bar to navel."
     },
     {
      "id": "kg_w1_d3_e2",
      "name": "Close Grip Lat Pull Down",
      "sets": 3,
      "reps": "12",
      "restSeconds": 45,
      "type": "standard",
      "notes": "V-bar handle; arch upper back and drive elbows down."
     },
     {
      "id": "kg_w1_d3_e3",
      "name": "Wide Grip Lat Pull Down",
      "sets": 3,
      "reps": "12",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Pull to clavicle; focus on lat stretch at top."
     },
     {
      "id": "kg_w1_d3_e4",
      "name": "Neutral Grip Low Cable Row",
      "sets": 3,
      "reps": "12",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Squeeze shoulder blades together on full contraction."
     },
     {
      "id": "kg_w1_d3_e5",
      "name": "EZ-Bar Preacher Curls",
      "sets": 3,
      "reps": "12",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Lock triceps into pad; control the descent."
     },
     {
      "id": "kg_w1_d3_e6",
      "name": "Dumbbell Hammer Curls",
      "sets": 3,
      "reps": "12",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Palms facing each other; targets brachialis."
     },
     {
      "id": "kg_w1_d3_e7",
      "name": "Incline Dumbbell Curls",
      "sets": 3,
      "reps": "20",
      "restSeconds": 45,
      "type": "standard",
      "notes": "High reps; elbows remain back for deep long-head stretch."
     }
    ]
   },
   {
    "dayNumber": 4,
    "title": "[W1-3] Day 4: Quad, Glute & Hamstring Volume",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "kg_w1_d4_e1",
      "name": "Barbell Front Squat",
      "sets": 3,
      "reps": "12",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Pre-lift: 30 min cardio + 2 ab exercises (3x30). Keep elbows high."
     },
     {
      "id": "kg_w1_d4_e2",
      "name": "Romanian Deadlift",
      "sets": 3,
      "reps": "12",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Hinge at hips, push glutes back for deep hamstring load."
     },
     {
      "id": "kg_w1_d4_e3",
      "name": "Leg Press",
      "sets": 3,
      "reps": "12",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Continuous tension; avoid knee lockout."
     },
     {
      "id": "kg_w1_d4_e4",
      "name": "Bulgarian Split Squats",
      "sets": 3,
      "reps": "12",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Rear foot elevated; drop straight down."
     },
     {
      "id": "kg_w1_d4_e5",
      "name": "Lying Leg Curls",
      "sets": 3,
      "reps": "12",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Smooth repetitions with constant tension."
     },
     {
      "id": "kg_w1_d4_e6",
      "name": "Barbell Walking Lunges",
      "sets": 3,
      "reps": "12",
      "restSeconds": 45,
      "type": "standard",
      "notes": "12 reps per leg or 24 total steps."
     },
     {
      "id": "kg_w1_d4_e7",
      "name": "Seated Calf Raises",
      "sets": 3,
      "reps": "20",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Full extension at the top of every rep."
     }
    ]
   },
   {
    "dayNumber": 5,
    "title": "[W1-3] Day 5: Chest, Shoulders & Triceps Density",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "kg_w1_d5_e1",
      "name": "Incline Dumbbell Press",
      "sets": 3,
      "reps": "12",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Pre-lift: 30 min cardio + 2 ab exercises (3x30)."
     },
     {
      "id": "kg_w1_d5_e2",
      "name": "Flat Dumbbell Bench Press",
      "sets": 3,
      "reps": "12",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Control the descent; explosive drive up."
     },
     {
      "id": "kg_w1_d5_e3",
      "name": "Cable Chest Flyes",
      "sets": 3,
      "reps": "12",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Mid-height cable pulleys; squeeze pecs together."
     },
     {
      "id": "kg_w1_d5_e4",
      "name": "Dumbbell Lateral Raises",
      "sets": 3,
      "reps": "12",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Strict form without swinging torso."
     },
     {
      "id": "kg_w1_d5_e5",
      "name": "Overhead Dumbbell Shoulder Press",
      "sets": 3,
      "reps": "20",
      "restSeconds": 45,
      "type": "standard",
      "notes": "High rep deltoid burnout."
     },
     {
      "id": "kg_w1_d5_e6",
      "name": "Skull Crushers",
      "sets": 3,
      "reps": "12",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Keep upper arms stationary."
     },
     {
      "id": "kg_w1_d5_e7",
      "name": "Close Grip Barbell Bench Press",
      "sets": 3,
      "reps": "20",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Hands shoulder-width apart; triceps lockout."
     }
    ]
   },
   {
    "dayNumber": 6,
    "title": "[W1-3] Day 6: Back Width & Bicep Detail",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "kg_w1_d6_e1",
      "name": "Underhand Barbell Row",
      "sets": 3,
      "reps": "8",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Pre-lift: 30 min cardio + 2 ab exercises (3x30). Reverse grip."
     },
     {
      "id": "kg_w1_d6_e2",
      "name": "Neutral Grip Pull Down",
      "sets": 3,
      "reps": "8",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Drive elbows straight down to hip level."
     },
     {
      "id": "kg_w1_d6_e3",
      "name": "Dumbbell Pullover",
      "sets": 3,
      "reps": "12",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Across bench; feel deep lat and ribcage stretch."
     },
     {
      "id": "kg_w1_d6_e4",
      "name": "T-Bar Row",
      "sets": 3,
      "reps": "12",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Pull into lower chest/upper abdomen."
     },
     {
      "id": "kg_w1_d6_e5",
      "name": "Standing Dumbbell Curls",
      "sets": 3,
      "reps": "12",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Supinate wrists on upward phase."
     },
     {
      "id": "kg_w1_d6_e6",
      "name": "Dumbbell Concentration Curls",
      "sets": 3,
      "reps": "20",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Brace elbow against inner thigh."
     },
     {
      "id": "kg_w1_d6_e7",
      "name": "Guillotine Curls (High Cable)",
      "sets": 3,
      "reps": "20",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Lie back or stand; curl handles toward forehead."
     }
    ]
   },
   {
    "dayNumber": 7,
    "title": "[W4-6] Day 1: Upper Push & Arm Antagonist",
    "estimatedMinutes": 65,
    "exercises": [
     {
      "id": "kg_w2_d1_e1",
      "name": "Barbell Bench Press",
      "sets": 4,
      "reps": "12",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Phase 2 strict 30s rest. 30 min cardio + 2 ab exercises (3x30) pre-lift."
     },
     {
      "id": "kg_w2_d1_e2",
      "name": "Skull Crushers",
      "sets": 4,
      "reps": "15",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Control each negative rep."
     },
     {
      "id": "kg_w2_d1_e3",
      "name": "Incline Dumbbell Press",
      "sets": 4,
      "reps": "12",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Continuous pumping tempo."
     },
     {
      "id": "kg_w2_d1_e4",
      "name": "Tricep Kickbacks",
      "sets": 4,
      "reps": "15",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Hold full tricep contraction at lockout."
     },
     {
      "id": "kg_w2_d1_e5",
      "name": "Close Grip Bench Press",
      "sets": 4,
      "reps": "12",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Tuck elbows tight to ribs."
     },
     {
      "id": "kg_w2_d1_e6",
      "name": "EZ Bar Curls",
      "sets": 4,
      "reps": "15",
      "restSeconds": 30,
      "type": "standard",
      "notes": "No body sway; strict arm flexion."
     },
     {
      "id": "kg_w2_d1_e7",
      "name": "Shoulder Dumbbell Press",
      "sets": 4,
      "reps": "12",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Direct delt drive."
     },
     {
      "id": "kg_w2_d1_e8",
      "name": "Wide Grip Upright Row",
      "sets": 4,
      "reps": "15",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Pull with elbows high to chin level."
     }
    ]
   },
   {
    "dayNumber": 8,
    "title": "[W4-6] Day 2: Leg Density & Posterior Chain",
    "estimatedMinutes": 65,
    "exercises": [
     {
      "id": "kg_w2_d2_e1",
      "name": "Barbell Squat",
      "sets": 4,
      "reps": "12",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Pre-lift: 30 min cardio + 2 ab exercises (3x30)."
     },
     {
      "id": "kg_w2_d2_e2",
      "name": "Leg Extensions",
      "sets": 4,
      "reps": "15",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Squeeze quads hard on each rep."
     },
     {
      "id": "kg_w2_d2_e3",
      "name": "Deadlifts",
      "sets": 4,
      "reps": "12",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Maintain strict lat lock and rigid core."
     },
     {
      "id": "kg_w2_d2_e4",
      "name": "Lying Leg Curls",
      "sets": 4,
      "reps": "15",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Full hamstring contraction."
     },
     {
      "id": "kg_w2_d2_e5",
      "name": "Dumbbell Step Ups",
      "sets": 4,
      "reps": "12",
      "restSeconds": 30,
      "type": "standard",
      "notes": "12 reps per leg onto bench/box."
     },
     {
      "id": "kg_w2_d2_e6",
      "name": "Leg Press",
      "sets": 4,
      "reps": "15",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Deep range of motion with full control."
     },
     {
      "id": "kg_w2_d2_e7",
      "name": "Goblet Squat",
      "sets": 4,
      "reps": "12",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Hold dumbbell at chest; keep upright torso."
     },
     {
      "id": "kg_w2_d2_e8",
      "name": "Calf Raises",
      "sets": 4,
      "reps": "15",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Full extension at peak."
     }
    ]
   },
   {
    "dayNumber": 9,
    "title": "[W4-6] Day 3: Back Pull & Arm Antagonist",
    "estimatedMinutes": 65,
    "exercises": [
     {
      "id": "kg_w2_d3_e1",
      "name": "Underhand Barbell Row",
      "sets": 4,
      "reps": "12",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Pre-lift: 30 min cardio + 2 ab exercises (3x30)."
     },
     {
      "id": "kg_w2_d3_e2",
      "name": "Pull Ups",
      "sets": 4,
      "reps": "15",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Full stretch at bottom; clear chin over bar."
     },
     {
      "id": "kg_w2_d3_e3",
      "name": "Lat Pull Down",
      "sets": 4,
      "reps": "12",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Wide overhand grip; drive elbows down."
     },
     {
      "id": "kg_w2_d3_e4",
      "name": "Close Grip Pulley Row",
      "sets": 4,
      "reps": "15",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Squeeze scapulae firmly."
     },
     {
      "id": "kg_w2_d3_e5",
      "name": "EZ Bar Curl",
      "sets": 4,
      "reps": "12",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Strict arm curl."
     },
     {
      "id": "kg_w2_d3_e6",
      "name": "Tricep Kickback",
      "sets": 4,
      "reps": "15",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Hard squeeze at posterior extension."
     },
     {
      "id": "kg_w2_d3_e7",
      "name": "Incline Dumbbell Curl",
      "sets": 4,
      "reps": "12",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Deep long-head bicep stretch."
     },
     {
      "id": "kg_w2_d3_e8",
      "name": "Tricep Rope Pushdown",
      "sets": 4,
      "reps": "15",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Spread rope wide at bottom lockout."
     }
    ]
   },
   {
    "dayNumber": 10,
    "title": "[W4-6] Day 4: Unilateral & Leg Power",
    "estimatedMinutes": 65,
    "exercises": [
     {
      "id": "kg_w2_d4_e1",
      "name": "Jefferson Squats",
      "sets": 4,
      "reps": "12",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Pre-lift: 30 min cardio + 2 ab exercises (3x30)."
     },
     {
      "id": "kg_w2_d4_e2",
      "name": "Leg Extensions",
      "sets": 4,
      "reps": "15",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Continuous quadriceps tension."
     },
     {
      "id": "kg_w2_d4_e3",
      "name": "Deadlift",
      "sets": 4,
      "reps": "12",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Explosive pull through hips."
     },
     {
      "id": "kg_w2_d4_e4",
      "name": "Leg Curls",
      "sets": 4,
      "reps": "15",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Slow controlled eccentric descent."
     },
     {
      "id": "kg_w2_d4_e5",
      "name": "Bulgarian Split Squats",
      "sets": 4,
      "reps": "12",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Isolate quad and glute per side."
     },
     {
      "id": "kg_w2_d4_e6",
      "name": "Dumbbell Step Ups",
      "sets": 4,
      "reps": "15",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Pace the repetitions evenly."
     },
     {
      "id": "kg_w2_d4_e7",
      "name": "Barbell Walking Lunges",
      "sets": 4,
      "reps": "12",
      "restSeconds": 30,
      "type": "standard",
      "notes": "12 reps per leg."
     },
     {
      "id": "kg_w2_d4_e8",
      "name": "Seated Calf Raise",
      "sets": 4,
      "reps": "15",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Deep bottom stretch."
     }
    ]
   },
   {
    "dayNumber": 11,
    "title": "[W4-6] Day 5: Chest, Shoulders & Arm Blast",
    "estimatedMinutes": 65,
    "exercises": [
     {
      "id": "kg_w2_d5_e1",
      "name": "Dumbbell Bench Press",
      "sets": 4,
      "reps": "12",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Pre-lift: 30 min cardio + 2 ab exercises (3x30)."
     },
     {
      "id": "kg_w2_d5_e2",
      "name": "Dumbbell Skullcrusher",
      "sets": 4,
      "reps": "15",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Palms facing in; bend only at elbows."
     },
     {
      "id": "kg_w2_d5_e3",
      "name": "Incline Machine Press",
      "sets": 4,
      "reps": "12",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Upper pec drive."
     },
     {
      "id": "kg_w2_d5_e4",
      "name": "Svend Press",
      "sets": 4,
      "reps": "15",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Pinch weight plates between palms and press outward."
     },
     {
      "id": "kg_w2_d5_e5",
      "name": "Shoulder Press Machine",
      "sets": 4,
      "reps": "12",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Full overhead extension."
     },
     {
      "id": "kg_w2_d5_e6",
      "name": "Dumbbell Lateral Raise",
      "sets": 4,
      "reps": "15",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Lead with elbows for side delt pump."
     },
     {
      "id": "kg_w2_d5_e7",
      "name": "Tricep Press Downs",
      "sets": 4,
      "reps": "12",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Straight or angled bar; lockout triceps."
     },
     {
      "id": "kg_w2_d5_e8",
      "name": "Tricep Kickbacks",
      "sets": 4,
      "reps": "15",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Squeeze and hold contraction."
     }
    ]
   },
   {
    "dayNumber": 12,
    "title": "[W4-6] Day 6: Back Width & Pull Finisher",
    "estimatedMinutes": 65,
    "exercises": [
     {
      "id": "kg_w2_d6_e1",
      "name": "Wide Grip Cable Rows",
      "sets": 4,
      "reps": "12",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Pre-lift: 30 min cardio + 2 ab exercises (3x30)."
     },
     {
      "id": "kg_w2_d6_e2",
      "name": "Lat Pull Downs",
      "sets": 4,
      "reps": "15",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Pull bar smoothly to upper chest."
     },
     {
      "id": "kg_w2_d6_e3",
      "name": "T-Bar Row",
      "sets": 4,
      "reps": "12",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Heavy lat engagement; torso braced at 45 degrees."
     },
     {
      "id": "kg_w2_d6_e4",
      "name": "Neutral Grip Cable Row",
      "sets": 4,
      "reps": "15",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Elbows tucked close to sides."
     },
     {
      "id": "kg_w2_d6_e5",
      "name": "EZ Bar Curl",
      "sets": 4,
      "reps": "12",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Peak bicep contraction."
     },
     {
      "id": "kg_w2_d6_e6",
      "name": "Hammer Curl",
      "sets": 4,
      "reps": "15",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Brachialis focus."
     },
     {
      "id": "kg_w2_d6_e7",
      "name": "Standing Dumbbell Curl",
      "sets": 4,
      "reps": "12",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Strict alternating or simultaneous curls."
     },
     {
      "id": "kg_w2_d6_e8",
      "name": "Rear Delt Fly",
      "sets": 4,
      "reps": "15",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Final posterior deltoid burn."
     }
    ]
   }
  ]
 },
 {
  "id": "arnold_blueprint_cuts_phase2",
  "title": "Arnold Blueprint to Cuts: Phase 2 (Weeks 5-8)",
  "description": "Arnold Schwarzenegger's intense 4-week cutting protocol (Weeks 5-8). 6-day split combining heavy compound supersets/tri-sets, advanced intensity techniques (28 Method, 1-10 Method, Running-the-Rack), post-workout cardio (1-2 miles run 3-5x/week), and strict Arnold Series supplement/diet timing.",
  "tags": [
   "Arnold",
   "Cutting",
   "Phase 2",
   "Fat Loss",
   "Weeks 5-8",
   "Advanced"
  ],
  "days": [
   {
    "dayNumber": 1,
    "title": "Monday & Thursday: Chest, Back & Abs",
    "estimatedMinutes": 80,
    "exercises": [
     {
      "id": "arn_p2_d1_e1",
      "name": "Decline Bench Sit-Ups (3/4 Way Down)",
      "sets": 1,
      "reps": "3-5 mins",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Core primer. Go 3/4 the way down with no rest."
     },
     {
      "id": "arn_p2_d1_e2",
      "name": "Deadlifts",
      "sets": 3,
      "reps": "10, 8, 6",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Done on Monday Week 1, Thursday week 2. Alternate days."
     },
     {
      "id": "arn_p2_d1_e3",
      "name": "Weighted Chin-Ups w/ Incline Barbell Bench Press",
      "sets": 5,
      "reps": "15, 12, 8, 6, 4",
      "restSeconds": 45,
      "type": "superset",
      "notes": "Super-set. Chin-Ups: 15,12,8,6,4. Incline Bench: 15,12,8,5,3 (Use Stripping Method on the last set)."
     },
     {
      "id": "arn_p2_d1_e4",
      "name": "Bench Press w/ Chin-Ups",
      "sets": 4,
      "reps": "15, 12, 8, 6",
      "restSeconds": 45,
      "type": "superset",
      "notes": "Super-set. Bench Press: 15,12,8,6 (Week 6: use Max Effort Method). Chin-Ups: To failure."
     },
     {
      "id": "arn_p2_d1_e5",
      "name": "Dumbbell Flyes w/ Bent Over Rows",
      "sets": 4,
      "reps": "28 / 12",
      "restSeconds": 45,
      "type": "superset",
      "notes": "Super-set. Dumbbell Flyes: Use 28 Method. Bent Over Rows: 12 Reps."
     },
     {
      "id": "arn_p2_d1_e6",
      "name": "Dumbbell Pullovers, Dips & Cable Crossovers",
      "sets": 5,
      "reps": "15 / Failure / 15",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Tri-set. Pullovers: 15 reps. Dips: Bodyweight to failure. Cable Crossovers: 15 reps."
     },
     {
      "id": "arn_p2_d1_e7",
      "name": "Giant Abs Set (No Rest)",
      "sets": 1,
      "reps": "20, 20, 50, 30, 100",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Hanging Straight Leg Raises (20), Hanging Knee-Ups (20), Crunches (50), Seated Leg Tucks (30), Stick Twist (100)."
     }
    ]
   },
   {
    "dayNumber": 2,
    "title": "Tuesday & Friday: Legs & Abs",
    "estimatedMinutes": 75,
    "exercises": [
     {
      "id": "arn_p2_d2_e1",
      "name": "Decline Bench Sit-Ups (3/4 Way Down)",
      "sets": 1,
      "reps": "3-5 mins",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Core primer. Go 3/4 the way down with no rest."
     },
     {
      "id": "arn_p2_d2_e2",
      "name": "Leg Extensions w/ Squats",
      "sets": 5,
      "reps": "12 / 20",
      "restSeconds": 45,
      "type": "superset",
      "notes": "Super-set. Leg Extensions: 12 Reps. Squats: 20 Reps (Use 1/4 Rep Method on Last Set)."
     },
     {
      "id": "arn_p2_d2_e3",
      "name": "Front Squats w/ Leg Curls",
      "sets": 4,
      "reps": "12 / 12",
      "restSeconds": 45,
      "type": "superset",
      "notes": "Super-set. Front Squats: 12 Reps. Leg Curls: 12 Reps."
     },
     {
      "id": "arn_p2_d2_e4",
      "name": "Leg Press w/ Leg Curls",
      "sets": 3,
      "reps": "15 / 1-10",
      "restSeconds": 45,
      "type": "superset",
      "notes": "Super-set. Leg Press: 15 Reps. Leg Curls: Use 1-10 Method."
     },
     {
      "id": "arn_p2_d2_e5",
      "name": "Straight Leg Deadlifts",
      "sets": 3,
      "reps": "6",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Done once a week."
     },
     {
      "id": "arn_p2_d2_e6",
      "name": "Calves Tri-Set (Donkey, Standing, Seated)",
      "sets": 3,
      "reps": "15 / 10 / 15",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Tri-set. Donkey Calf: 15. Standing Calf: 10. Seated Calf: 15 (Use 5-Count Method on All Sets)."
     },
     {
      "id": "arn_p2_d2_e7",
      "name": "Giant Abs Set (No Rest)",
      "sets": 1,
      "reps": "20, 20, 50, 30, 100",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Hanging Straight Leg Raises (20), Hanging Knee Ups (20), Crunches (50), Seated Leg Tucks (30), Stick Twist (100)."
     }
    ]
   },
   {
    "dayNumber": 3,
    "title": "Wednesday & Saturday: Shoulders & Arms",
    "estimatedMinutes": 80,
    "exercises": [
     {
      "id": "arn_p2_d3_e1",
      "name": "Decline Bench Sit-Ups (3/4 Way Down)",
      "sets": 1,
      "reps": "3-5 mins",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Core primer. Go 3/4 the way down with no rest."
     },
     {
      "id": "arn_p2_d3_e2",
      "name": "Barbell Press, Cable Side & Lying Side Laterals",
      "sets": 4,
      "reps": "12 / 12 / 12",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Tri-set. Barbell Press: Alternate front and back (Front+Back = 1 rep). Cable Side Laterals: 12 reps. Lying Side Laterals: Use 5-Count Method."
     },
     {
      "id": "arn_p2_d3_e3",
      "name": "Front Dumbbell Raises w/ Rear Delt Raises",
      "sets": 4,
      "reps": "10 / 10",
      "restSeconds": 45,
      "type": "superset",
      "notes": "Super-set. Front Raises: Use Running-the-Rack Method on last set. Rear Delt Raises: Use 1/4 Rep Method."
     },
     {
      "id": "arn_p2_d3_e4",
      "name": "Barbell Curls w/ Close Grip Push-Downs",
      "sets": 4,
      "reps": "See Notes / 10",
      "restSeconds": 45,
      "type": "superset",
      "notes": "Super-set. Barbell Curls: Use 1-10 Method or 28 Method. Close Grip Straight Bar Push-Downs: 10 reps."
     },
     {
      "id": "arn_p2_d3_e5",
      "name": "Preacher Curls, Skullcrushers & Reverse Preacher Curls",
      "sets": 4,
      "reps": "12 / 28 / 12",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Tri-set. Preacher Curls: 12. Skullcrushers: 28 Method (Running-the-Rack on last set). Reverse Preacher Curls: 12."
     },
     {
      "id": "arn_p2_d3_e6",
      "name": "Concentration Curls w/ Standing One-Arm Rope Push-downs",
      "sets": 4,
      "reps": "12 / 12",
      "restSeconds": 45,
      "type": "superset",
      "notes": "Super-set. Concentration Curls: 12 reps. Rope Push-downs: Hold at bottom for 2 seconds each rep."
     },
     {
      "id": "arn_p2_d3_e7",
      "name": "Reverse Wrist Curls w/ Regular Wrist Curls",
      "sets": 3,
      "reps": "15 / 15",
      "restSeconds": 45,
      "type": "superset",
      "notes": "Forearm finisher superset. Reverse: 15 reps. Regular: 15 reps."
     }
    ]
   }
  ]
 },
 {
  "id": "arnold_blueprint_mass_p1",
  "title": "Arnold Blueprint to Mass: Phase 1",
  "description": "Arnold Schwarzenegger's classic high-volume mass building blueprint (Weeks 1-4). Utilizes heavy basic building-block movements, weekly descending pyramid periodization, antagonist supersets, and shocking principles like the 1-10 and Stripping methods.",
  "tags": [
   "Arnold",
   "Mass Building",
   "Hypertrophy",
   "4 Weeks",
   "Classic Bodybuilding"
  ],
  "days": [
   {
    "dayNumber": 1,
    "title": "Monday: Chest, Upper Back & Abs",
    "estimatedMinutes": 75,
    "exercises": [
     {
      "id": "arn_p1_d1_e1",
      "name": "Flat Barbell Bench Press",
      "sets": 5,
      "reps": "30, 12, 10, 8, 6",
      "restSeconds": 75,
      "type": "standard",
      "notes": "Pyramid up each set. W1: 30, 12, 10, 8, 6 | W2: 30, 8, 6, 4, 2 (+ Stripping Method down to bar) | W3: 30, 5x5 | W4: Max 1RM test."
     },
     {
      "id": "arn_p1_d1_e2",
      "name": "Incline Barbell Bench Press (Low Angle)",
      "sets": 5,
      "reps": "30, 12, 10, 8, 6",
      "restSeconds": 75,
      "type": "standard",
      "notes": "Low bench incline angle. Touch upper clavicles; maintain continuous tension without locking out."
     },
     {
      "id": "arn_p1_d1_e3",
      "name": "Dumbbell Flyes Superset w/ Dumbbell Pullover",
      "sets": 5,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Deep chest expansion on flyes. Immediately grab dumbbell and pull across flat bench for ribcage expansion pullover."
     },
     {
      "id": "arn_p1_d1_e4",
      "name": "Wide-Grip Chin-Ups",
      "sets": 4,
      "reps": "Failure",
      "restSeconds": 75,
      "type": "standard",
      "notes": "Overhand wide grip. Full dead hang stretch at bottom to chin cleared over bar."
     },
     {
      "id": "arn_p1_d1_e5",
      "name": "Bent-Over Barbell Rows Superset w/ T-Bar Rows",
      "sets": 5,
      "reps": "30, 12, 10, 8, 6",
      "restSeconds": 75,
      "type": "superset",
      "notes": "Row bar to lower abdomen, then immediately transition to T-Bar row station. W2: 30, 8, 6, 4, 2 | W3: 30, 5x5 | W4: 20, 15, 12."
     },
     {
      "id": "arn_p1_d1_e6",
      "name": "Hanging / Incline Leg Raises",
      "sets": 5,
      "reps": "25",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Strict abdominal flexion; avoid swinging hips."
     },
     {
      "id": "arn_p1_d1_e7",
      "name": "Decline 3/4 Sit-Ups (or Roman Chair)",
      "sets": 5,
      "reps": "25",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Stay in 3/4 range of motion to keep continuous abdominal burn."
     }
    ]
   },
   {
    "dayNumber": 2,
    "title": "Tuesday: Heavy Shoulders, Arms & Forearms",
    "estimatedMinutes": 80,
    "exercises": [
     {
      "id": "arn_p1_d2_e1",
      "name": "Barbell Clean & Press",
      "sets": 5,
      "reps": "5",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Explosive clean from floor to clavicles, then strict overhead military press."
     },
     {
      "id": "arn_p1_d2_e2",
      "name": "Seated Dumbbell Press Superset w/ Full Frontal Raise",
      "sets": 5,
      "reps": "30, 12, 10, 8, 6",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Heavy DB press followed immediately by front dumbbell raises straight overhead."
     },
     {
      "id": "arn_p1_d2_e3",
      "name": "Dumbbell Lateral Raises Superset w/ Barbell Upright Rows",
      "sets": 5,
      "reps": "30, 12, 10, 8, 6",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Side delt isolation superset. Lead with elbows on both movements."
     },
     {
      "id": "arn_p1_d2_e4",
      "name": "Standing Barbell Curls",
      "sets": 5,
      "reps": "30, 12, 10, 8, 6",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Strict curls with zero body sway. W2 & W3: Substitute 1-10 Method on final work sets."
     },
     {
      "id": "arn_p1_d2_e5",
      "name": "Incline DB Curls Superset w/ Concentration Curls",
      "sets": 5,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Full incline stretch followed immediately by seated one-arm concentration peak squeeze."
     },
     {
      "id": "arn_p1_d2_e6",
      "name": "Close-Grip Barbell Bench Press",
      "sets": 5,
      "reps": "30, 12, 10, 8, 6",
      "restSeconds": 75,
      "type": "standard",
      "notes": "Hands 10-12 inches apart; elbows tucked to ribs to isolate triceps."
     },
     {
      "id": "arn_p1_d2_e7",
      "name": "Skull-Crushers Superset w/ Overhead DB Extension",
      "sets": 5,
      "reps": "30, 12, 10, 8, 6",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Lower bar to crown of head, then stand/sit for one-arm dumbbell overhead extension."
     },
     {
      "id": "arn_p1_d2_e8",
      "name": "Barbell Wrist Curls Superset w/ Reverse Wrist Curls",
      "sets": 5,
      "reps": "15-20",
      "restSeconds": 45,
      "type": "superset",
      "notes": "Rest forearms on bench; curl wrists upward, then flip wrists for reverse curls."
     }
    ]
   },
   {
    "dayNumber": 3,
    "title": "Wednesday: Squats, Calves & Core",
    "estimatedMinutes": 75,
    "exercises": [
     {
      "id": "arn_p1_d3_e1",
      "name": "Barbell Back Squats",
      "sets": 5,
      "reps": "8-12",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Hit parallel depth. Drive through mid-foot. Push for a 1-rep max test during Week 4."
     },
     {
      "id": "arn_p1_d3_e2",
      "name": "Straight-Leg Deadlifts",
      "sets": 5,
      "reps": "8-12",
      "restSeconds": 75,
      "type": "standard",
      "notes": "Slight knee bend. Hinge hips back until deep hamstring stretch is felt."
     },
     {
      "id": "arn_p1_d3_e3",
      "name": "Barbell Good Mornings",
      "sets": 5,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Performed once weekly. Lower torso until parallel with floor; brace lower back."
     },
     {
      "id": "arn_p1_d3_e4",
      "name": "Barbell / Dumbbell Walking Lunges",
      "sets": 5,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "8-12 strides per leg with deep knee drops."
     },
     {
      "id": "arn_p1_d3_e5",
      "name": "Leg Extension Superset w/ Lying Leg Curls",
      "sets": 5,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Continuous pump tempo. Hold 1-second contraction at peak on both exercises."
     },
     {
      "id": "arn_p1_d3_e6",
      "name": "Standing Calf Raise Superset w/ Seated Calf Raise",
      "sets": 5,
      "reps": "8-12",
      "restSeconds": 45,
      "type": "superset",
      "notes": "Full stretch at bottom; rise high onto big toes for peak squeeze."
     },
     {
      "id": "arn_p1_d3_e7",
      "name": "Kneeling Cable Crunches",
      "sets": 4,
      "reps": "25",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Rope attachment. Pull elbows to knees using abdominal contraction."
     }
    ]
   },
   {
    "dayNumber": 4,
    "title": "Thursday: Chest, Back Thickness & Abs",
    "estimatedMinutes": 75,
    "exercises": [
     {
      "id": "arn_p1_d4_e1",
      "name": "Flat Barbell Bench Press",
      "sets": 5,
      "reps": "30, 12, 10, 8, 6",
      "restSeconds": 75,
      "type": "standard",
      "notes": "Heavy pyramid progression. Week 2: Stripping method on set 5. Week 3: 30, 5x5."
     },
     {
      "id": "arn_p1_d4_e2",
      "name": "Incline Barbell Bench Press (Medium Angle)",
      "sets": 5,
      "reps": "30, 12, 10, 8, 6",
      "restSeconds": 75,
      "type": "standard",
      "notes": "Medium bench incline angle to shift clavicular stress slightly higher."
     },
     {
      "id": "arn_p1_d4_e3",
      "name": "Dumbbell Flyes Superset w/ Dumbbell Pullover",
      "sets": 5,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Arnold chest expander combo. Deep stretches with elbow bend."
     },
     {
      "id": "arn_p1_d4_e4",
      "name": "Wide-Grip Chin-Ups",
      "sets": 4,
      "reps": "Failure",
      "restSeconds": 75,
      "type": "standard",
      "notes": "Full range of motion to absolute muscular failure."
     },
     {
      "id": "arn_p1_d4_e5",
      "name": "One-Arm Dumbbell Rows Superset w/ T-Bar Rows",
      "sets": 5,
      "reps": "30, 12, 10, 8, 6",
      "restSeconds": 75,
      "type": "superset",
      "notes": "Heavy lat stretch and row, immediately moving to T-Bar row station."
     },
     {
      "id": "arn_p1_d4_e6",
      "name": "Hanging / Incline Leg Raises",
      "sets": 5,
      "reps": "25",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Strict control without body swing."
     },
     {
      "id": "arn_p1_d4_e7",
      "name": "Decline 3/4 Sit-Ups (or Roman Chair)",
      "sets": 5,
      "reps": "25",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Constant abdominal tension."
     }
    ]
   },
   {
    "dayNumber": 5,
    "title": "Friday: Shoulders, Arms & Forearms",
    "estimatedMinutes": 80,
    "exercises": [
     {
      "id": "arn_p1_d5_e1",
      "name": "Arnold Dumbbell Press",
      "sets": 5,
      "reps": "5",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Start with palms facing chest; rotate outward as dumbbells are pressed overhead."
     },
     {
      "id": "arn_p1_d5_e2",
      "name": "Behind-the-Neck Barbell Press Superset w/ Full Frontal Raise",
      "sets": 5,
      "reps": "30, 12, 10, 8, 6",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Smooth controlled descent behind neck to ear level, paired with standing front raises."
     },
     {
      "id": "arn_p1_d5_e3",
      "name": "Incline Rear Delt Flyes Superset w/ Barbell Upright Rows",
      "sets": 5,
      "reps": "30, 12, 10, 8, 6",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Lie face down on incline bench for rear delt flyes, paired immediately with upright rows."
     },
     {
      "id": "arn_p1_d5_e4",
      "name": "Standing Barbell Curls",
      "sets": 5,
      "reps": "30, 12, 10, 8, 6",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Strict form. Apply the 1-10 Method on Weeks 2 & 3."
     },
     {
      "id": "arn_p1_d5_e5",
      "name": "Incline DB Curls Superset w/ Concentration Curls",
      "sets": 5,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Biceps long-head stretch paired with peak brachialis contraction."
     },
     {
      "id": "arn_p1_d5_e6",
      "name": "Close-Grip Barbell Bench Press",
      "sets": 5,
      "reps": "30, 12, 10, 8, 6",
      "restSeconds": 75,
      "type": "standard",
      "notes": "Heavy triceps power builder."
     },
     {
      "id": "arn_p1_d5_e7",
      "name": "Cable Tricep Pushdown Superset w/ Overhead DB Extension",
      "sets": 5,
      "reps": "30, 12, 10, 8, 6",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Lock out pushdowns with straight/V-bar, paired with overhead extension."
     },
     {
      "id": "arn_p1_d5_e8",
      "name": "Barbell Wrist Curls Superset w/ Reverse Wrist Curls",
      "sets": 5,
      "reps": "15-20",
      "restSeconds": 45,
      "type": "superset",
      "notes": "High rep forearm pump."
     }
    ]
   },
   {
    "dayNumber": 6,
    "title": "Saturday: Front Squats, Deadlifts & Calves",
    "estimatedMinutes": 80,
    "exercises": [
     {
      "id": "arn_p1_d6_e1",
      "name": "Barbell Front Squats",
      "sets": 5,
      "reps": "8-12",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Clean grip or crossed arms; keep elbows high to target quad sweep."
     },
     {
      "id": "arn_p1_d6_e2",
      "name": "Heavy Conventional Deadlifts",
      "sets": 5,
      "reps": "10, 6, 4 (or 5, 5, 5)",
      "restSeconds": 120,
      "type": "standard",
      "notes": "Heavy posterior chain builder. Choose 10, 6, 4 or 5x5 or 12, 10, 8."
     },
     {
      "id": "arn_p1_d6_e3",
      "name": "Barbell / Dumbbell Walking Lunges",
      "sets": 5,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "8-12 reps per leg."
     },
     {
      "id": "arn_p1_d6_e4",
      "name": "Leg Extension Superset w/ Lying Leg Curls",
      "sets": 5,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Antagonist leg isolation pump."
     },
     {
      "id": "arn_p1_d6_e5",
      "name": "Standing Calf Raise Superset w/ Seated Calf Raise",
      "sets": 5,
      "reps": "8-12",
      "restSeconds": 45,
      "type": "superset",
      "notes": "Full gastrocnemius & soleus burn."
     },
     {
      "id": "arn_p1_d6_e6",
      "name": "Kneeling Cable Crunches",
      "sets": 4,
      "reps": "25",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Rope cable crunches with full abdominal flexion."
     }
    ]
   }
  ]
 },
 {
  "id": "bulk_with_buendia",
  "title": "Bulk with Buendia",
  "description": "Jeremy Buendia's off-season bulking blueprint designed to maximize lean muscle mass and strength. Features a high-intensity 5-day split emphasizing precision tempo, drop-sets, ladders, FST-7 finishing sets, and heavy compound movements.",
  "tags": [
   "Jeremy Buendia",
   "Bulking",
   "Hypertrophy",
   "Strength",
   "Off-Season"
  ],
  "days": [
   {
    "dayNumber": 1,
    "title": "Monday: Chest",
    "estimatedMinutes": 65,
    "exercises": [
     {
      "id": "bwb_d1_e1",
      "name": "Bench Press",
      "sets": 6,
      "reps": "15, 10, 6, 5, 3, 10",
      "restSeconds": 120,
      "type": "standard",
      "notes": "Sets 1-2: Warm-up. Sets 3-5: Heavy work sets. Set 6: Drop weight back down for 10 reps with a slow 3-sec negative, 1-sec pause 1 inch above chest, and 1-sec squeeze at top."
     },
     {
      "id": "bwb_d1_e2",
      "name": "DB Incline Press",
      "sets": 5,
      "reps": "10, 10, 8, 6, 4",
      "restSeconds": 120,
      "type": "standard",
      "notes": "Set 1: Warm-up. Final set: Drop-set down 20 lbs and finish with 10 more controlled reps."
     },
     {
      "id": "bwb_d1_e3",
      "name": "Cable Fly (Ladders)",
      "sets": 4,
      "reps": "15",
      "restSeconds": 90,
      "type": "standard",
      "notes": "5 reps Low cable fly, 5 reps Mid cable fly, 5 reps High cable fly (repeat 3x per set)."
     },
     {
      "id": "bwb_d1_e4",
      "name": "Hammer Strength Incline Press",
      "sets": 4,
      "reps": "20",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Complex: 5 full reps, 5 partial reps, 5 full reps, 5 partial reps (Partial = full stretch down, press halfway up)."
     },
     {
      "id": "bwb_d1_e5",
      "name": "Machine Fly (FST-7)",
      "sets": 7,
      "reps": "12",
      "restSeconds": 20,
      "type": "dropset",
      "notes": "FST-7 Finisher. Rest strictly 20 seconds between sets."
     }
    ]
   },
   {
    "dayNumber": 2,
    "title": "Tuesday: Back",
    "estimatedMinutes": 65,
    "exercises": [
     {
      "id": "bwb_d2_e1",
      "name": "Wide Grip Pull Down",
      "sets": 6,
      "reps": "15, 10, 10, 8, 6, 5",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Sets 1-2: Warm-up. Final set: Drop-set down 30 lbs and complete 10 more reps to finish."
     },
     {
      "id": "bwb_d2_e2",
      "name": "Seated Cable Row",
      "sets": 5,
      "reps": "15, 10, 10, 10, 5",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Set 1: Warm-up. Sets 2-4: Hold for 1 sec at peak contraction. Set 5: 5 heavy reps + 10 regular tempo reps. Keep lower back arched and chest up."
     },
     {
      "id": "bwb_d2_e3",
      "name": "Reverse Grip Lat Pull Down",
      "sets": 4,
      "reps": "12, 10, 8, 6",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Drive elbows down to sides, keeping lower back arched."
     },
     {
      "id": "bwb_d2_e4",
      "name": "Barbell Bent Over Rows",
      "sets": 5,
      "reps": "10, 8, 6, 4, 10",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Final set: Drop to a lighter weight and control tempo with slow negatives and a strict positive motion."
     },
     {
      "id": "bwb_d2_e5",
      "name": "DB Straight Leg Deadlifts",
      "sets": 4,
      "reps": "12, 10, 8, 5",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Final set: Drop-set to a lighter weight and finish with 10 reps. Keep knees in fixed position."
     },
     {
      "id": "bwb_d2_e6",
      "name": "Cable Rope Straight Arm Pull Downs (FST-7)",
      "sets": 7,
      "reps": "12",
      "restSeconds": 20,
      "type": "standard",
      "notes": "FST-7 Finisher. Rest strictly 20 seconds between sets."
     }
    ]
   },
   {
    "dayNumber": 3,
    "title": "Thursday: Shoulders",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "bwb_d3_e1",
      "name": "DB Shoulder Press",
      "sets": 6,
      "reps": "15, 10, 10, 8, 6, 5",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Sets 1-2: Warm-up. Final set: Finish with 5 partial reps."
     },
     {
      "id": "bwb_d3_e2",
      "name": "DB Lateral Reverse Drop Set",
      "sets": 4,
      "reps": "40",
      "restSeconds": 90,
      "type": "dropset",
      "notes": "Set 1: Warm-up. Sets 2-4: 10 reps @ 20lbs, 10 reps @ 25lbs, 10 reps @ 30lbs, 10 partial reps @ 35lbs."
     },
     {
      "id": "bwb_d3_e3",
      "name": "Barbell Front Raise",
      "sets": 4,
      "reps": "12, 10, 8, 6",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Strict front raises targeting anterior delts."
     },
     {
      "id": "bwb_d3_e4",
      "name": "Standing Barbell Overhead Press",
      "sets": 4,
      "reps": "10, 8, 6, 4",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Slight bend in knees, core tight. Press in front of head."
     },
     {
      "id": "bwb_d3_e5",
      "name": "Barbell Upright Row",
      "sets": 4,
      "reps": "12, 10, 8, 6",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Grip slightly wider than shoulder width to target rear delts. Final set: drop-set to lighter weight and finish with 10 reps."
     },
     {
      "id": "bwb_d3_e6",
      "name": "Machine Rear Delt Fly",
      "sets": 5,
      "reps": "12",
      "restSeconds": 30,
      "type": "standard",
      "notes": "FST-style or short rest. Each set includes 12 full reps + 5 partial reps."
     }
    ]
   },
   {
    "dayNumber": 4,
    "title": "Friday: Arms",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "bwb_d4_e1",
      "name": "Barbell Curl w/ Close Grip Bench Press",
      "sets": 5,
      "reps": "15, 10, 8, 5, 5",
      "restSeconds": 90,
      "type": "superset",
      "notes": "Super-set. Set 1 is warm-up. Bicep curl superset back-to-back with close grip bench press."
     },
     {
      "id": "bwb_d4_e2",
      "name": "Single Arm DB Spider Curl w/ Overhead DB Tricep Extension",
      "sets": 4,
      "reps": "12, 10, 8, 6",
      "restSeconds": 75,
      "type": "superset",
      "notes": "Super-set. Unilateral preacher-style spider curls paired with overhead extensions."
     },
     {
      "id": "bwb_d4_e3",
      "name": "Machine Preacher Curl w/ Cable Straight Bar Pushdown",
      "sets": 4,
      "reps": "12, 10, 6, 5",
      "restSeconds": 75,
      "type": "superset",
      "notes": "Super-set. Final set includes 5 full reps to 5 partial reps on both movements."
     },
     {
      "id": "bwb_d4_e4",
      "name": "Cable Rope Hammer Curl w/ Cable Rope Overhead Tricep Extension",
      "sets": 4,
      "reps": "12, 10, 8, 5",
      "restSeconds": 75,
      "type": "superset",
      "notes": "Super-set. Final set includes 5 full reps to 5 partial reps."
     },
     {
      "id": "bwb_d4_e5",
      "name": "EZ Bar Reverse Grip Curl w/ Bar Dips",
      "sets": 4,
      "reps": "12 / 15",
      "restSeconds": 75,
      "type": "superset",
      "notes": "Super-set. Reverse curls paired with bodyweight dips."
     }
    ]
   },
   {
    "dayNumber": 5,
    "title": "Saturday: Legs",
    "estimatedMinutes": 75,
    "exercises": [
     {
      "id": "bwb_d5_e1",
      "name": "Calves & Thighs Tri-Set (Seated Calf, Leg Ext, Ham Curl)",
      "sets": 4,
      "reps": "20 / 10 / 10",
      "restSeconds": 75,
      "type": "standard",
      "notes": "Warm-up tri-set. Seated Calf Machine (20 reps) -> Leg Extension (10 reps) -> Lying Hamstring Curl (10 reps)."
     },
     {
      "id": "bwb_d5_e2",
      "name": "Leg Press",
      "sets": 6,
      "reps": "12, 10, 8, 5, 5, 20",
      "restSeconds": 120,
      "type": "standard",
      "notes": "Sets 4-5 are heavy. Set 6: Drop weight significantly and rep out to 20 reps (you should be dying by rep 12)."
     },
     {
      "id": "bwb_d5_e3",
      "name": "Bulgarian Split Squats on Smith Machine",
      "sets": 5,
      "reps": "10, 8, 6, 4, 10",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Per leg. Unilateral quad/glute demolition."
     },
     {
      "id": "bwb_d5_e4",
      "name": "Barbell Straight Leg Deadlift",
      "sets": 5,
      "reps": "10, 6, 4, 2, 10",
      "restSeconds": 120,
      "type": "standard",
      "notes": "Wear a weight belt! Sets 3-4 are heavy. Set 5: Drop weight and rep out."
     },
     {
      "id": "bwb_d5_e5",
      "name": "Single Leg Leg Extensions",
      "sets": 4,
      "reps": "20",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Each set: 10 partial reps + full reps (10, 8, 6, 4)."
     },
     {
      "id": "bwb_d5_e6",
      "name": "Seated Hamstring Curl",
      "sets": 4,
      "reps": "20",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Each set: 10 partial reps + full reps (10, 8, 6, 4)."
     },
     {
      "id": "bwb_d5_e7",
      "name": "Walking Lunges",
      "sets": 4,
      "reps": "15 strides",
      "restSeconds": 20,
      "type": "standard",
      "notes": "15 strides per leg. Rest strictly 20 seconds between sets."
     }
    ]
   }
  ]
 },
 {
  "id": "fst7_hard_body_blueprint_lvl1",
  "title": "FST-7 Hard Body Blueprint: Level 1",
  "description": "Hany Rambod's FST-7 Hard Body Blueprint Level 1 designed for 2X Physique Olympia Champion Jeremy Buendia. Features rotating 5-day splits for Weeks 1 & 3 and Weeks 2 & 4, prioritizing arm growth, eccentric motion, time under tension, and FST-7 fascia-stretching sets.",
  "tags": [
   "FST-7",
   "Hany Rambod",
   "Jeremy Buendia",
   "Level 1",
   "Arm Priority",
   "Hypertrophy"
  ],
  "days": [
   {
    "dayNumber": 1,
    "title": "W1 & W3 - Monday: Back & Triceps",
    "estimatedMinutes": 70,
    "exercises": [
     {
      "id": "fst7_l1_w1_d1_e1",
      "name": "Reverse Grip Pull Down",
      "sets": 3,
      "reps": "10-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Dynamic Warm-Up Protocol B completed prior."
     },
     {
      "id": "fst7_l1_w1_d1_e2",
      "name": "V-Bar Pull Down",
      "sets": 3,
      "reps": "8-10",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Target upper lats."
     },
     {
      "id": "fst7_l1_w1_d1_e3",
      "name": "Reverse Grip Barbell Row",
      "sets": 3,
      "reps": "8-10",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Mid-back thickness."
     },
     {
      "id": "fst7_l1_w1_d1_e4",
      "name": "Low Cable Row (Wide Bar, Palms Facing)",
      "sets": 3,
      "reps": "10-12",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Width and contraction."
     },
     {
      "id": "fst7_l1_w1_d1_e5",
      "name": "FST-7 Straight Arm Pull Down",
      "sets": 7,
      "reps": "8-12",
      "restSeconds": 40,
      "type": "dropset",
      "notes": "Rest 30-45s between sets. Advanced users contract the muscle during the FST-7 rest period."
     },
     {
      "id": "fst7_l1_w1_d1_e6",
      "name": "Rope Push Down",
      "sets": 3,
      "reps": "10-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Triceps isolation."
     },
     {
      "id": "fst7_l1_w1_d1_e7",
      "name": "Close-Grip Bench Press",
      "sets": 3,
      "reps": "8-10",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Heavy triceps compound."
     },
     {
      "id": "fst7_l1_w1_d1_e8",
      "name": "Weighted Dips",
      "sets": 3,
      "reps": "8-10",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Add five partial reps on your last set."
     },
     {
      "id": "fst7_l1_w1_d1_e9",
      "name": "FST-7 Overhead Cable Extension",
      "sets": 7,
      "reps": "8-12",
      "restSeconds": 40,
      "type": "dropset",
      "notes": "FST-7 triceps finisher (rest 30-45s)."
     }
    ]
   },
   {
    "dayNumber": 2,
    "title": "W1 & W3 - Tuesday: Shoulders & Biceps",
    "estimatedMinutes": 65,
    "exercises": [
     {
      "id": "fst7_l1_w1_d2_e1",
      "name": "Seated Lateral Raises",
      "sets": 4,
      "reps": "10-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Dynamic Warm-Up Protocol B completed prior."
     },
     {
      "id": "fst7_l1_w1_d2_e2",
      "name": "Seated Dumbbell Press",
      "sets": 4,
      "reps": "8-10",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Heavy overhead shoulder press."
     },
     {
      "id": "fst7_l1_w1_d2_e3",
      "name": "Spider Bench Front Raises",
      "sets": 3,
      "reps": "8-10",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Anterior delt isolation on incline bench."
     },
     {
      "id": "fst7_l1_w1_d2_e4",
      "name": "FST-7 Standing Lateral Raises",
      "sets": 7,
      "reps": "8-12",
      "restSeconds": 40,
      "type": "dropset",
      "notes": "FST-7 side delt finisher (rest 30-45s, flex during rest)."
     },
     {
      "id": "fst7_l1_w1_d2_e5",
      "name": "FST-7 Straight-Bar Spider Curls",
      "sets": 7,
      "reps": "10-12",
      "restSeconds": 40,
      "type": "dropset",
      "notes": "FST-7 biceps finisher."
     },
     {
      "id": "fst7_l1_w1_d2_e6",
      "name": "Standing EZ-Bar Curls",
      "sets": 3,
      "reps": "8-10",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Add five partial reps on your last set."
     },
     {
      "id": "fst7_l1_w1_d2_e7",
      "name": "Machine Preacher Curls",
      "sets": 3,
      "reps": "8-10",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Add five partial reps on your last set."
     },
     {
      "id": "fst7_l1_w1_d2_e8",
      "name": "FST-7 Rope Hammer Curl",
      "sets": 7,
      "reps": "10-12",
      "restSeconds": 40,
      "type": "dropset",
      "notes": "FST-7 brachialis/biceps finisher."
     }
    ]
   },
   {
    "dayNumber": 3,
    "title": "W1 & W3 - Wednesday: Legs & Abs",
    "estimatedMinutes": 75,
    "exercises": [
     {
      "id": "fst7_l1_w1_d3_e1",
      "name": "Leg Extensions",
      "sets": 4,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Dynamic Warm-Up Protocol A. Add five partial reps on your last set."
     },
     {
      "id": "fst7_l1_w1_d3_e2",
      "name": "Squats",
      "sets": 3,
      "reps": "8-10",
      "restSeconds": 120,
      "type": "standard",
      "notes": "Heavy compound squat."
     },
     {
      "id": "fst7_l1_w1_d3_e3",
      "name": "Hack Squats",
      "sets": 3,
      "reps": "8-10",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Quad sweep focus."
     },
     {
      "id": "fst7_l1_w1_d3_e4",
      "name": "FST-7 Leg Press",
      "sets": 7,
      "reps": "15-20",
      "restSeconds": 40,
      "type": "dropset",
      "notes": "FST-7 leg finisher (rest 30-45s)."
     },
     {
      "id": "fst7_l1_w1_d3_e5",
      "name": "Seated Leg Curls",
      "sets": 3,
      "reps": "10-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Hamstrings."
     },
     {
      "id": "fst7_l1_w1_d3_e6",
      "name": "Stiff-Leg Deadlifts",
      "sets": 3,
      "reps": "8-10",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Slow eccentric motion."
     },
     {
      "id": "fst7_l1_w1_d3_e7",
      "name": "FST-7 Lying Leg Curls",
      "sets": 7,
      "reps": "8-12",
      "restSeconds": 40,
      "type": "dropset",
      "notes": "FST-7 hamstring finisher."
     },
     {
      "id": "fst7_l1_w1_d3_e8",
      "name": "Ab Circuit (No rest between exercises, 1 min rest after circuit)",
      "sets": 4,
      "reps": "14-20",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Reverse Crunch (14-20), Medicine Ball Russian Twist (14-20), V-Ups (14-20), Mountain Climbers (Failure)."
     }
    ]
   },
   {
    "dayNumber": 4,
    "title": "W1 & W3 - Thursday: Chest & Calves",
    "estimatedMinutes": 65,
    "exercises": [
     {
      "id": "fst7_l1_w1_d4_e1",
      "name": "Hammer Strength Incline Press",
      "sets": 4,
      "reps": "10-12",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Dynamic Warm-Up Protocol B. Add five partial reps on your last set."
     },
     {
      "id": "fst7_l1_w1_d4_e2",
      "name": "Flat Bench Fly",
      "sets": 3,
      "reps": "8-10",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Chest stretch and contraction."
     },
     {
      "id": "fst7_l1_w1_d4_e3",
      "name": "Machine Bench Press",
      "sets": 3,
      "reps": "8-10",
      "restSeconds": 75,
      "type": "standard",
      "notes": "Controlled pressing."
     },
     {
      "id": "fst7_l1_w1_d4_e4",
      "name": "FST-7 Standing Cable Fly",
      "sets": 7,
      "reps": "10-12",
      "restSeconds": 40,
      "type": "dropset",
      "notes": "FST-7 chest finisher (rest 30-45s)."
     },
     {
      "id": "fst7_l1_w1_d4_e5",
      "name": "Standing Calf Raises",
      "sets": 4,
      "reps": "15-20",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Full ROM, 2-3 sec hold at top."
     },
     {
      "id": "fst7_l1_w1_d4_e6",
      "name": "Leg Press Calf Raises",
      "sets": 4,
      "reps": "15-20",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Calf development."
     },
     {
      "id": "fst7_l1_w1_d4_e7",
      "name": "FST-7 Seated Calf Raise",
      "sets": 7,
      "reps": "15-20",
      "restSeconds": 40,
      "type": "dropset",
      "notes": "FST-7 calf finisher (rest 30-45s)."
     }
    ]
   },
   {
    "dayNumber": 5,
    "title": "W1 & W3 - Friday: Biceps & Triceps",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "fst7_l1_w1_d5_e1",
      "name": "FST-7 Seated Dumbbell Curls",
      "sets": 7,
      "reps": "10-12",
      "restSeconds": 40,
      "type": "dropset",
      "notes": "Dynamic Warm-Up Protocol B. Front-loaded FST-7 arm set."
     },
     {
      "id": "fst7_l1_w1_d5_e2",
      "name": "Incline Dumbbell Curls",
      "sets": 3,
      "reps": "8-10",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Add five partial reps on your last set."
     },
     {
      "id": "fst7_l1_w1_d5_e3",
      "name": "Machine Preacher Curls",
      "sets": 3,
      "reps": "8-10",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Add five partial reps on your last set."
     },
     {
      "id": "fst7_l1_w1_d5_e4",
      "name": "FST-7 Straight-Bar Spider Curls",
      "sets": 7,
      "reps": "10-12",
      "restSeconds": 40,
      "type": "dropset",
      "notes": "FST-7 bicep finisher."
     },
     {
      "id": "fst7_l1_w1_d5_e5",
      "name": "Reverse Grip Cable Extension",
      "sets": 3,
      "reps": "10-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Triceps isolation."
     },
     {
      "id": "fst7_l1_w1_d5_e6",
      "name": "Close-Grip Bench Press",
      "sets": 3,
      "reps": "8-10",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Heavy triceps press."
     },
     {
      "id": "fst7_l1_w1_d5_e7",
      "name": "Laying Overhead Ext. Cambered Bar",
      "sets": 3,
      "reps": "8-10",
      "restSeconds": 75,
      "type": "standard",
      "notes": "Skullcrusher variation."
     },
     {
      "id": "fst7_l1_w1_d5_e8",
      "name": "FST-7 Rope Push Down",
      "sets": 7,
      "reps": "8-12",
      "restSeconds": 40,
      "type": "dropset",
      "notes": "FST-7 triceps finisher."
     }
    ]
   },
   {
    "dayNumber": 6,
    "title": "W2 & W4 - Monday: Back & Triceps",
    "estimatedMinutes": 70,
    "exercises": [
     {
      "id": "fst7_l1_w2_d1_e1",
      "name": "Overhand Pull Down",
      "sets": 3,
      "reps": "10-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Dynamic Warm-Up Protocol B completed prior."
     },
     {
      "id": "fst7_l1_w2_d1_e2",
      "name": "V-Bar Pull Down",
      "sets": 3,
      "reps": "8-10",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Lat width."
     },
     {
      "id": "fst7_l1_w2_d1_e3",
      "name": "Overhand Barbell Row",
      "sets": 3,
      "reps": "8-10",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Thickness."
     },
     {
      "id": "fst7_l1_w2_d1_e4",
      "name": "V-Bar Cable Row",
      "sets": 3,
      "reps": "10-12",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Add five partial reps on your last set."
     },
     {
      "id": "fst7_l1_w2_d1_e5",
      "name": "FST-7 Straight Arm Pull Down",
      "sets": 7,
      "reps": "8-12",
      "restSeconds": 40,
      "type": "dropset",
      "notes": "FST-7 finisher (rest 30-45s)."
     },
     {
      "id": "fst7_l1_w2_d1_e6",
      "name": "Rope Push Down",
      "sets": 3,
      "reps": "10-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Triceps isolation."
     },
     {
      "id": "fst7_l1_w2_d1_e7",
      "name": "Close-Grip Bench Press",
      "sets": 3,
      "reps": "8-10",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Heavy triceps."
     },
     {
      "id": "fst7_l1_w2_d1_e8",
      "name": "Weighted Dips",
      "sets": 3,
      "reps": "8-10",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Add five partial reps on your last set."
     },
     {
      "id": "fst7_l1_w2_d1_e9",
      "name": "FST-7 Overhead Cable Extension",
      "sets": 7,
      "reps": "8-12",
      "restSeconds": 40,
      "type": "dropset",
      "notes": "FST-7 triceps finisher."
     }
    ]
   },
   {
    "dayNumber": 7,
    "title": "W2 & W4 - Tuesday: Shoulders & Biceps",
    "estimatedMinutes": 65,
    "exercises": [
     {
      "id": "fst7_l1_w2_d2_e1",
      "name": "Seated Dumbbell Press",
      "sets": 4,
      "reps": "10-12",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Dynamic Warm-Up Protocol B. Add five partial reps on your last set."
     },
     {
      "id": "fst7_l1_w2_d2_e2",
      "name": "Seated Lateral Raises",
      "sets": 4,
      "reps": "8-10",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Side delt focus."
     },
     {
      "id": "fst7_l1_w2_d2_e3",
      "name": "Standing Lateral Raises",
      "sets": 3,
      "reps": "8-10",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Standing isolation."
     },
     {
      "id": "fst7_l1_w2_d2_e4",
      "name": "FST-7 Spider Bench Front Raises",
      "sets": 7,
      "reps": "8-12",
      "restSeconds": 40,
      "type": "dropset",
      "notes": "FST-7 front delt finisher."
     },
     {
      "id": "fst7_l1_w2_d2_e5",
      "name": "FST-7 Straight-Bar Spider Curls",
      "sets": 7,
      "reps": "10-12",
      "restSeconds": 40,
      "type": "dropset",
      "notes": "FST-7 bicep finisher."
     },
     {
      "id": "fst7_l1_w2_d2_e6",
      "name": "Preacher Curls",
      "sets": 3,
      "reps": "8-10",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Add five partial reps on your last set."
     },
     {
      "id": "fst7_l1_w2_d2_e7",
      "name": "Incline Dumbbell Curls",
      "sets": 3,
      "reps": "8-10",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Add five partial reps on your last set."
     },
     {
      "id": "fst7_l1_w2_d2_e8",
      "name": "FST-7 Standing EZ-Bar Curls",
      "sets": 7,
      "reps": "10-12",
      "restSeconds": 40,
      "type": "dropset",
      "notes": "FST-7 bicep finisher."
     }
    ]
   },
   {
    "dayNumber": 8,
    "title": "W2 & W4 - Wednesday: Legs & Abs",
    "estimatedMinutes": 75,
    "exercises": [
     {
      "id": "fst7_l1_w2_d3_e1",
      "name": "Dumbbell Lunges",
      "sets": 4,
      "reps": "10-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Dynamic Warm-Up Protocol A."
     },
     {
      "id": "fst7_l1_w2_d3_e2",
      "name": "Squats",
      "sets": 3,
      "reps": "8-10",
      "restSeconds": 120,
      "type": "standard",
      "notes": "Heavy squat."
     },
     {
      "id": "fst7_l1_w2_d3_e3",
      "name": "Leg Press",
      "sets": 3,
      "reps": "8-10",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Quad volume."
     },
     {
      "id": "fst7_l1_w2_d3_e4",
      "name": "FST-7 Leg Extensions",
      "sets": 7,
      "reps": "15-20",
      "restSeconds": 40,
      "type": "dropset",
      "notes": "FST-7 quad finisher (rest 30-45s)."
     },
     {
      "id": "fst7_l1_w2_d3_e5",
      "name": "Reverse Hack Squats",
      "sets": 3,
      "reps": "10-12",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Glute and quad emphasis."
     },
     {
      "id": "fst7_l1_w2_d3_e6",
      "name": "Stiff-Leg Deadlifts",
      "sets": 3,
      "reps": "8-10",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Hamstrings."
     },
     {
      "id": "fst7_l1_w2_d3_e7",
      "name": "FST-7 Seated Leg Curls",
      "sets": 7,
      "reps": "8-12",
      "restSeconds": 40,
      "type": "dropset",
      "notes": "FST-7 hamstring finisher."
     },
     {
      "id": "fst7_l1_w2_d3_e8",
      "name": "Ab Circuit (No rest between exercises, 1 min rest after circuit)",
      "sets": 4,
      "reps": "14-20",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Crunches (14-20), Medicine Ball Russian Twist (14-20), Hanging Leg Raises (14-20), V-Ups (Failure)."
     }
    ]
   },
   {
    "dayNumber": 9,
    "title": "W2 & W4 - Thursday: Chest & Calves",
    "estimatedMinutes": 65,
    "exercises": [
     {
      "id": "fst7_l1_w2_d4_e1",
      "name": "Flat Bench Fly",
      "sets": 4,
      "reps": "10-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Dynamic Warm-Up Protocol B."
     },
     {
      "id": "fst7_l1_w2_d4_e2",
      "name": "Hammer Strength Incline Press",
      "sets": 3,
      "reps": "8-10",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Upper chest."
     },
     {
      "id": "fst7_l1_w2_d4_e3",
      "name": "Hammer Strength Low Press",
      "sets": 3,
      "reps": "8-10",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Lower chest."
     },
     {
      "id": "fst7_l1_w2_d4_e4",
      "name": "FST-7 Machine Bench Press",
      "sets": 7,
      "reps": "10-12",
      "restSeconds": 40,
      "type": "dropset",
      "notes": "FST-7 chest finisher (rest 30-45s)."
     },
     {
      "id": "fst7_l1_w2_d4_e5",
      "name": "Leg Press Calf Raises",
      "sets": 4,
      "reps": "16-20",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Calf development."
     },
     {
      "id": "fst7_l1_w2_d4_e6",
      "name": "FST-7 Standing Calf Raises",
      "sets": 7,
      "reps": "16-20",
      "restSeconds": 40,
      "type": "dropset",
      "notes": "FST-7 calf finisher (rest 30-45s)."
     }
    ]
   },
   {
    "dayNumber": 10,
    "title": "W2 & W4 - Friday: Biceps & Triceps",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "fst7_l1_w2_d5_e1",
      "name": "FST-7 Straight-Bar Spider Curls",
      "sets": 7,
      "reps": "10-12",
      "restSeconds": 40,
      "type": "dropset",
      "notes": "Dynamic Warm-Up Protocol B. Front-loaded FST-7 bicep sets."
     },
     {
      "id": "fst7_l1_w2_d5_e2",
      "name": "Incline Dumbbell Curls",
      "sets": 3,
      "reps": "8-10",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Add five partial reps on your last set."
     },
     {
      "id": "fst7_l1_w2_d5_e3",
      "name": "Machine Preacher Curls",
      "sets": 3,
      "reps": "8-10",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Add five partial reps on your last set."
     },
     {
      "id": "fst7_l1_w2_d5_e4",
      "name": "FST-7 Seated Dumbbell Curls",
      "sets": 7,
      "reps": "10-12",
      "restSeconds": 40,
      "type": "dropset",
      "notes": "FST-7 bicep finisher."
     },
     {
      "id": "fst7_l1_w2_d5_e5",
      "name": "Close-Grip Bench Press",
      "sets": 3,
      "reps": "10-12",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Triceps compound."
     },
     {
      "id": "fst7_l1_w2_d5_e6",
      "name": "Dumbbell Skull Crushers",
      "sets": 3,
      "reps": "8-10",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Triceps isolation."
     },
     {
      "id": "fst7_l1_w2_d5_e7",
      "name": "Laying Overhead Ext. Cambered Bar",
      "sets": 3,
      "reps": "8-10",
      "restSeconds": 75,
      "type": "standard",
      "notes": "Skullcrushers."
     },
     {
      "id": "fst7_l1_w2_d5_e8",
      "name": "FST-7 Overhead Rope Extensions",
      "sets": 7,
      "reps": "8-12",
      "restSeconds": 40,
      "type": "dropset",
      "notes": "FST-7 triceps finisher."
     }
    ]
   }
  ]
 },
 {
  "id": "fst7_big_and_ripped_8wk",
  "title": "FST-7: Big and Ripped",
  "description": "Hany Rambod's elite 8-week Olympia-winning protocol. Phase 1 (Weeks 1-4) builds a base with 5-8 rep ranges and FST-7 finishers. Phase 2 (Weeks 5-8) increases volume to a 6-day split, utilizing 8-12 reps and brutal FST-7 pre-exhaust supersets/trisets.",
  "tags": [
   "FST-7",
   "Hypertrophy",
   "8 Weeks",
   "Advanced"
  ],
  "days": [
   {
    "dayNumber": 1,
    "title": "Quads, Hamstrings, Calves",
    "estimatedMinutes": 75,
    "exercises": [
     {
      "id": "d1_e1",
      "name": "Leg Extensions",
      "sets": 4,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d1_e2",
      "name": "Barbell Squat",
      "sets": 4,
      "reps": "5-8",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Feet pointed straight ahead, slightly wider than shoulder width. Don't go lower than parallel."
     },
     {
      "id": "d1_e3",
      "name": "Leg Press",
      "sets": 4,
      "reps": "5-8",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d1_e4",
      "name": "Barbell Walking Lunge",
      "sets": 4,
      "reps": "15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "2 sets 15 steps up/back. 2 sets 15 steps continuous."
     },
     {
      "id": "d1_e5",
      "name": "Hack Squat",
      "sets": 7,
      "reps": "5-8",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": "FST-7 Finisher. Feet shoulder-width apart. Apply intensity techniques (forced reps/partials)."
     },
     {
      "id": "d1_e6",
      "name": "Seated Leg Curl",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d1_e7",
      "name": "Stiff-Legged Deadlift",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Arch back, contract hams at top."
     },
     {
      "id": "d1_e8",
      "name": "Lying Leg Curls",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d1_e9",
      "name": "Seated Calf Raise",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d1_e10",
      "name": "Standing Calf Raises",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Slow, controlled. Hold contracted position 2-3s."
     },
     {
      "id": "d1_e11",
      "name": "Calf Press On The Leg Press Machine",
      "sets": 7,
      "reps": "5-8",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": "FST-7 Finisher."
     }
    ]
   },
   {
    "dayNumber": 2,
    "title": "Chest, Triceps, Abs",
    "estimatedMinutes": 75,
    "exercises": [
     {
      "id": "d2_e1",
      "name": "Dumbbell Bench Press",
      "sets": 4,
      "reps": "5-8",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Bring hands in closer for tight contraction."
     },
     {
      "id": "d2_e2",
      "name": "Dips - Triceps Version",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d2_e3",
      "name": "Incline Dumbbell Press",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d2_e4",
      "name": "Incline Dumbbell Flyes",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Twisting pinkies inwards."
     },
     {
      "id": "d2_e5",
      "name": "Smith Machine Incline Bench Press",
      "sets": 7,
      "reps": "5-8",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": "FST-7 Finisher."
     },
     {
      "id": "d2_e6",
      "name": "Triceps Pushdown",
      "sets": 4,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Use Cambered-Bar."
     },
     {
      "id": "d2_e7",
      "name": "Close-Grip Barbell Bench Press",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Hands inside shoulder width, elbows close to body."
     },
     {
      "id": "d2_e8",
      "name": "Bench Dips",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Upright body position to stress triceps."
     },
     {
      "id": "d2_e9",
      "name": "Standing Dumbbell Triceps Extension",
      "sets": 7,
      "reps": "5-8",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": "FST-7 Finisher."
     },
     {
      "id": "d2_e10",
      "name": "Crunches",
      "sets": 4,
      "reps": "25",
      "restSeconds": 45,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d2_e11",
      "name": "Hanging Leg Raises",
      "sets": 4,
      "reps": "20",
      "restSeconds": 45,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d2_e12",
      "name": "Decline Reverse Crunches",
      "sets": 4,
      "reps": "20",
      "restSeconds": 45,
      "type": "standard",
      "notes": ""
     }
    ]
   },
   {
    "dayNumber": 3,
    "title": "Rest Day",
    "estimatedMinutes": 0,
    "exercises": []
   },
   {
    "dayNumber": 4,
    "title": "Back, Biceps",
    "estimatedMinutes": 75,
    "exercises": [
     {
      "id": "d4_e1",
      "name": "Pullups",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Dead hang to upper chest touches bar."
     },
     {
      "id": "d4_e2",
      "name": "Barbell Deadlift",
      "sets": 4,
      "reps": "5-8",
      "restSeconds": 120,
      "type": "standard",
      "notes": "Slight arch in back, 'stand up' with weight. Bar close to body."
     },
     {
      "id": "d4_e3",
      "name": "Bent Over Barbell Row",
      "sets": 4,
      "reps": "5-8",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Underhand grip."
     },
     {
      "id": "d4_e4",
      "name": "Leverage Iso Row",
      "sets": 7,
      "reps": "5-8",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": "FST-7 Finisher."
     },
     {
      "id": "d4_e5",
      "name": "Barbell Curl",
      "sets": 4,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Shoulder-width grip. Roll shoulders back."
     },
     {
      "id": "d4_e6",
      "name": "Hammer Curls",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d4_e7",
      "name": "Incline Dumbbell Curl",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d4_e8",
      "name": "Machine Preacher Curls",
      "sets": 7,
      "reps": "5-8",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": "FST-7 Finisher."
     }
    ]
   },
   {
    "dayNumber": 5,
    "title": "Shoulders, Rear-Delts, Traps",
    "estimatedMinutes": 65,
    "exercises": [
     {
      "id": "d5_e1",
      "name": "Standing Dumbbell Press",
      "sets": 4,
      "reps": "5-8",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d5_e2",
      "name": "Front Dumbbell Raise",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d5_e3",
      "name": "One-Arm Incline Lateral Raise",
      "sets": 4,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d5_e4",
      "name": "Machine Lateral Raise",
      "sets": 7,
      "reps": "5-8",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": "FST-7 Finisher."
     },
     {
      "id": "d5_e5",
      "name": "Seated Bent-Over Rear Delt Raise",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d5_e6",
      "name": "Reverse Machine Flyes",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d5_e7",
      "name": "Barbell Shrug",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d5_e8",
      "name": "Smith Machine Shrug",
      "sets": 7,
      "reps": "5-8",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": "FST-7 Finisher."
     }
    ]
   },
   {
    "dayNumber": 6,
    "title": "Biceps, Triceps, Abs",
    "estimatedMinutes": 75,
    "exercises": [
     {
      "id": "d6_e1",
      "name": "Dumbbell Alternate Bicep Curl",
      "sets": 4,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Supinate wrist at top."
     },
     {
      "id": "d6_e2",
      "name": "Standing Biceps Cable Curl",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Use cambered-bar if available."
     },
     {
      "id": "d6_e3",
      "name": "Concentration Curls",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d6_e4",
      "name": "Spider Curl",
      "sets": 7,
      "reps": "5-8",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": "FST-7 Finisher. Straight bar, narrow grip. Ladders for last 3 reps."
     },
     {
      "id": "d6_e5",
      "name": "Triceps Pushdown - Rope Attachment",
      "sets": 4,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Spread handles apart at bottom."
     },
     {
      "id": "d6_e6",
      "name": "Machine Triceps Extension",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": "+ Partials at failure."
     },
     {
      "id": "d6_e7",
      "name": "Reverse Grip Triceps Pushdown",
      "sets": 7,
      "reps": "5-8",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": "FST-7 Finisher. Contract for 2 secs last 3 reps on last 3 sets."
     },
     {
      "id": "d6_e8",
      "name": "Crunches",
      "sets": 4,
      "reps": "25",
      "restSeconds": 45,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d6_e9",
      "name": "Hanging Leg Raises",
      "sets": 4,
      "reps": "20",
      "restSeconds": 45,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d6_e10",
      "name": "Decline Reverse Crunches",
      "sets": 4,
      "reps": "20",
      "restSeconds": 45,
      "type": "standard",
      "notes": ""
     }
    ]
   },
   {
    "dayNumber": 7,
    "title": "Rest Day",
    "estimatedMinutes": 0,
    "exercises": []
   },
   {
    "dayNumber": 8,
    "title": "Quads, Hamstrings, Calves",
    "estimatedMinutes": 75,
    "exercises": [
     {
      "id": "d8_e1",
      "name": "Leg Extensions",
      "sets": 4,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d8_e2",
      "name": "Barbell Squat",
      "sets": 4,
      "reps": "5-8",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d8_e3",
      "name": "Leg Press",
      "sets": 4,
      "reps": "5-8",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d8_e4",
      "name": "Barbell Walking Lunge",
      "sets": 4,
      "reps": "15",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d8_e5",
      "name": "Hack Squat",
      "sets": 7,
      "reps": "5-8",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": "FST-7 Finisher."
     },
     {
      "id": "d8_e6",
      "name": "Seated Leg Curl",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d8_e7",
      "name": "Stiff-Legged Deadlift",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d8_e8",
      "name": "Lying Leg Curls",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d8_e9",
      "name": "Seated Calf Raise",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d8_e10",
      "name": "Standing Calf Raises",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d8_e11",
      "name": "Calf Press On The Leg Press Machine",
      "sets": 7,
      "reps": "5-8",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": "FST-7 Finisher."
     }
    ]
   },
   {
    "dayNumber": 9,
    "title": "Chest, Triceps, Abs",
    "estimatedMinutes": 75,
    "exercises": [
     {
      "id": "d9_e1",
      "name": "Dumbbell Bench Press",
      "sets": 4,
      "reps": "5-8",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d9_e2",
      "name": "Dips - Triceps Version",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d9_e3",
      "name": "Incline Dumbbell Press",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d9_e4",
      "name": "Incline Dumbbell Flyes",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d9_e5",
      "name": "Smith Machine Incline Bench Press",
      "sets": 7,
      "reps": "5-8",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": "FST-7 Finisher."
     },
     {
      "id": "d9_e6",
      "name": "Triceps Pushdown",
      "sets": 4,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d9_e7",
      "name": "Close-Grip Barbell Bench Press",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d9_e8",
      "name": "Bench Dips",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d9_e9",
      "name": "Standing Dumbbell Triceps Extension",
      "sets": 7,
      "reps": "5-8",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": "FST-7 Finisher."
     },
     {
      "id": "d9_e10",
      "name": "Crunches",
      "sets": 4,
      "reps": "25",
      "restSeconds": 45,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d9_e11",
      "name": "Hanging Leg Raises",
      "sets": 4,
      "reps": "20",
      "restSeconds": 45,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d9_e12",
      "name": "Decline Reverse Crunches",
      "sets": 4,
      "reps": "20",
      "restSeconds": 45,
      "type": "standard",
      "notes": ""
     }
    ]
   },
   {
    "dayNumber": 10,
    "title": "Rest Day",
    "estimatedMinutes": 0,
    "exercises": []
   },
   {
    "dayNumber": 11,
    "title": "Back, Biceps",
    "estimatedMinutes": 75,
    "exercises": [
     {
      "id": "d11_e1",
      "name": "Pullups",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d11_e2",
      "name": "Barbell Deadlift",
      "sets": 4,
      "reps": "5-8",
      "restSeconds": 120,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d11_e3",
      "name": "Bent Over Barbell Row",
      "sets": 4,
      "reps": "5-8",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d11_e4",
      "name": "Leverage Iso Row",
      "sets": 7,
      "reps": "5-8",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": "FST-7 Finisher."
     },
     {
      "id": "d11_e5",
      "name": "Barbell Curl",
      "sets": 4,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d11_e6",
      "name": "Hammer Curls",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d11_e7",
      "name": "Incline Dumbbell Curl",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d11_e8",
      "name": "Machine Preacher Curls",
      "sets": 7,
      "reps": "5-8",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": "FST-7 Finisher."
     }
    ]
   },
   {
    "dayNumber": 12,
    "title": "Shoulders, Rear-Delts, Traps",
    "estimatedMinutes": 65,
    "exercises": [
     {
      "id": "d12_e1",
      "name": "Standing Dumbbell Press",
      "sets": 4,
      "reps": "5-8",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d12_e2",
      "name": "Front Dumbbell Raise",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d12_e3",
      "name": "One-Arm Incline Lateral Raise",
      "sets": 4,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d12_e4",
      "name": "Machine Lateral Raise",
      "sets": 7,
      "reps": "5-8",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": "FST-7 Finisher."
     },
     {
      "id": "d12_e5",
      "name": "Seated Bent-Over Rear Delt Raise",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d12_e6",
      "name": "Reverse Machine Flyes",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d12_e7",
      "name": "Barbell Shrug",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d12_e8",
      "name": "Smith Machine Shrug",
      "sets": 7,
      "reps": "5-8",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": "FST-7 Finisher."
     }
    ]
   },
   {
    "dayNumber": 13,
    "title": "Biceps, Triceps, Abs",
    "estimatedMinutes": 75,
    "exercises": [
     {
      "id": "d13_e1",
      "name": "Dumbbell Alternate Bicep Curl",
      "sets": 4,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d13_e2",
      "name": "Standing Biceps Cable Curl",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d13_e3",
      "name": "Concentration Curls",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d13_e4",
      "name": "Spider Curl",
      "sets": 7,
      "reps": "5-8",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": "FST-7 Finisher."
     },
     {
      "id": "d13_e5",
      "name": "Triceps Pushdown - Rope Attachment",
      "sets": 4,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d13_e6",
      "name": "Machine Triceps Extension",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d13_e7",
      "name": "Reverse Grip Triceps Pushdown",
      "sets": 7,
      "reps": "5-8",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": "FST-7 Finisher."
     },
     {
      "id": "d13_e8",
      "name": "Crunches",
      "sets": 4,
      "reps": "25",
      "restSeconds": 45,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d13_e9",
      "name": "Hanging Leg Raises",
      "sets": 4,
      "reps": "20",
      "restSeconds": 45,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d13_e10",
      "name": "Decline Reverse Crunches",
      "sets": 4,
      "reps": "20",
      "restSeconds": 45,
      "type": "standard",
      "notes": ""
     }
    ]
   },
   {
    "dayNumber": 14,
    "title": "Rest Day",
    "estimatedMinutes": 0,
    "exercises": []
   },
   {
    "dayNumber": 15,
    "title": "Quads, Hamstrings, Calves",
    "estimatedMinutes": 75,
    "exercises": [
     {
      "id": "d15_e1",
      "name": "Leg Extensions",
      "sets": 4,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d15_e2",
      "name": "Barbell Squat",
      "sets": 4,
      "reps": "5-8",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d15_e3",
      "name": "Leg Press",
      "sets": 4,
      "reps": "5-8",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d15_e4",
      "name": "Barbell Walking Lunge",
      "sets": 4,
      "reps": "15",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d15_e5",
      "name": "Hack Squat",
      "sets": 7,
      "reps": "5-8",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": "FST-7 Finisher."
     },
     {
      "id": "d15_e6",
      "name": "Seated Leg Curl",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d15_e7",
      "name": "Stiff-Legged Deadlift",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d15_e8",
      "name": "Lying Leg Curls",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d15_e9",
      "name": "Seated Calf Raise",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d15_e10",
      "name": "Standing Calf Raises",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d15_e11",
      "name": "Calf Press On The Leg Press Machine",
      "sets": 7,
      "reps": "5-8",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": "FST-7 Finisher."
     }
    ]
   },
   {
    "dayNumber": 16,
    "title": "Chest, Triceps, Abs (Circuit)",
    "estimatedMinutes": 75,
    "exercises": [
     {
      "id": "d16_e1",
      "name": "Dumbbell Bench Press",
      "sets": 4,
      "reps": "5-8",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d16_e2",
      "name": "Dips - Triceps Version",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d16_e3",
      "name": "Incline Dumbbell Press",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d16_e4",
      "name": "Incline Dumbbell Flyes",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d16_e5",
      "name": "Smith Machine Incline Bench Press",
      "sets": 7,
      "reps": "5-8",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": "FST-7 Finisher."
     },
     {
      "id": "d16_e6",
      "name": "Triceps Pushdown",
      "sets": 4,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d16_e7",
      "name": "Close-Grip Barbell Bench Press",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d16_e8",
      "name": "Bench Dips",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d16_e9",
      "name": "Standing Dumbbell Triceps Extension",
      "sets": 7,
      "reps": "5-8",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": "FST-7 Finisher."
     },
     {
      "id": "d16_e10",
      "name": "Incline Reverse Crunch",
      "sets": 4,
      "reps": "15-20",
      "restSeconds": 0,
      "type": "giantset",
      "notes": "Abs Circuit (Complete all 4 back-to-back, rest 45-60s, repeat 4x)."
     },
     {
      "id": "d16_e11",
      "name": "Incline Elbow to Knee Twist Crunch",
      "sets": 4,
      "reps": "15-20",
      "restSeconds": 0,
      "type": "giantset",
      "notes": "Complete left side then switch to right."
     },
     {
      "id": "d16_e12",
      "name": "Leg Lift",
      "sets": 4,
      "reps": "15-20",
      "restSeconds": 0,
      "type": "giantset",
      "notes": ""
     },
     {
      "id": "d16_e13",
      "name": "Bicycle Kicks",
      "sets": 4,
      "reps": "Failure",
      "restSeconds": 60,
      "type": "giantset",
      "notes": ""
     }
    ]
   },
   {
    "dayNumber": 17,
    "title": "Rest Day",
    "estimatedMinutes": 0,
    "exercises": []
   },
   {
    "dayNumber": 18,
    "title": "Back, Biceps",
    "estimatedMinutes": 75,
    "exercises": [
     {
      "id": "d18_e1",
      "name": "Pullups",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d18_e2",
      "name": "Barbell Deadlift",
      "sets": 4,
      "reps": "5-8",
      "restSeconds": 120,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d18_e3",
      "name": "Bent Over Barbell Row",
      "sets": 4,
      "reps": "5-8",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d18_e4",
      "name": "Leverage Iso Row",
      "sets": 7,
      "reps": "5-8",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": "FST-7 Finisher."
     },
     {
      "id": "d18_e5",
      "name": "Barbell Curl",
      "sets": 4,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d18_e6",
      "name": "Hammer Curls",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d18_e7",
      "name": "Incline Dumbbell Curl",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d18_e8",
      "name": "Machine Preacher Curls",
      "sets": 7,
      "reps": "5-8",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": "FST-7 Finisher."
     }
    ]
   },
   {
    "dayNumber": 19,
    "title": "Shoulders, Rear-Delts, Traps",
    "estimatedMinutes": 65,
    "exercises": [
     {
      "id": "d19_e1",
      "name": "Standing Dumbbell Press",
      "sets": 4,
      "reps": "5-8",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d19_e2",
      "name": "Front Dumbbell Raise",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d19_e3",
      "name": "One-Arm Incline Lateral Raise",
      "sets": 4,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d19_e4",
      "name": "Machine Lateral Raise",
      "sets": 7,
      "reps": "5-8",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": "FST-7 Finisher."
     },
     {
      "id": "d19_e5",
      "name": "Seated Bent-Over Rear Delt Raise",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d19_e6",
      "name": "Reverse Machine Flyes",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d19_e7",
      "name": "Barbell Shrug",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d19_e8",
      "name": "Smith Machine Shrug",
      "sets": 7,
      "reps": "5-8",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": "FST-7 Finisher."
     }
    ]
   },
   {
    "dayNumber": 20,
    "title": "Biceps, Triceps, Abs",
    "estimatedMinutes": 75,
    "exercises": [
     {
      "id": "d20_e1",
      "name": "Dumbbell Alternate Bicep Curl",
      "sets": 4,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d20_e2",
      "name": "Standing Biceps Cable Curl",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d20_e3",
      "name": "Concentration Curls",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d20_e4",
      "name": "Spider Curl",
      "sets": 7,
      "reps": "5-8",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": "FST-7 Finisher."
     },
     {
      "id": "d20_e5",
      "name": "Triceps Pushdown - Rope Attachment",
      "sets": 4,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d20_e6",
      "name": "Machine Triceps Extension",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d20_e7",
      "name": "Reverse Grip Triceps Pushdown",
      "sets": 7,
      "reps": "5-8",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": "FST-7 Finisher."
     },
     {
      "id": "d20_e8",
      "name": "Crunches",
      "sets": 4,
      "reps": "25",
      "restSeconds": 45,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d20_e9",
      "name": "Hanging Leg Raises",
      "sets": 4,
      "reps": "20",
      "restSeconds": 45,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d20_e10",
      "name": "Decline Reverse Crunches",
      "sets": 4,
      "reps": "20",
      "restSeconds": 45,
      "type": "standard",
      "notes": ""
     }
    ]
   },
   {
    "dayNumber": 21,
    "title": "Rest Day",
    "estimatedMinutes": 0,
    "exercises": []
   },
   {
    "dayNumber": 22,
    "title": "Quads, Hamstrings, Calves",
    "estimatedMinutes": 75,
    "exercises": [
     {
      "id": "d22_e1",
      "name": "Leg Extensions",
      "sets": 4,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d22_e2",
      "name": "Barbell Squat",
      "sets": 4,
      "reps": "5-8",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d22_e3",
      "name": "Leg Press",
      "sets": 4,
      "reps": "5-8",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d22_e4",
      "name": "Barbell Walking Lunge",
      "sets": 4,
      "reps": "15",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d22_e5",
      "name": "Hack Squat",
      "sets": 7,
      "reps": "5-8",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": "FST-7 Finisher."
     },
     {
      "id": "d22_e6",
      "name": "Seated Leg Curl",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d22_e7",
      "name": "Stiff-Legged Deadlift",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d22_e8",
      "name": "Lying Leg Curls",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d22_e9",
      "name": "Seated Calf Raise",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d22_e10",
      "name": "Standing Calf Raises",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d22_e11",
      "name": "Calf Press On The Leg Press Machine",
      "sets": 7,
      "reps": "5-8",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": "FST-7 Finisher."
     }
    ]
   },
   {
    "dayNumber": 23,
    "title": "Chest, Triceps, Abs (Circuit)",
    "estimatedMinutes": 75,
    "exercises": [
     {
      "id": "d23_e1",
      "name": "Dumbbell Bench Press",
      "sets": 4,
      "reps": "5-8",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d23_e2",
      "name": "Dips - Triceps Version",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d23_e3",
      "name": "Incline Dumbbell Press",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d23_e4",
      "name": "Incline Dumbbell Flyes",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d23_e5",
      "name": "Smith Machine Incline Bench Press",
      "sets": 7,
      "reps": "5-8",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": "FST-7 Finisher."
     },
     {
      "id": "d23_e6",
      "name": "Triceps Pushdown",
      "sets": 4,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d23_e7",
      "name": "Close-Grip Barbell Bench Press",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d23_e8",
      "name": "Bench Dips",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d23_e9",
      "name": "Standing Dumbbell Triceps Extension",
      "sets": 7,
      "reps": "5-8",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": "FST-7 Finisher."
     },
     {
      "id": "d23_e10",
      "name": "Incline Reverse Crunch",
      "sets": 4,
      "reps": "15-20",
      "restSeconds": 0,
      "type": "giantset",
      "notes": "Abs Circuit (Complete all 4 back-to-back, rest 45-60s, repeat 4x)."
     },
     {
      "id": "d23_e11",
      "name": "Incline Elbow to Knee Twist Crunch",
      "sets": 4,
      "reps": "15-20",
      "restSeconds": 0,
      "type": "giantset",
      "notes": "Complete left side then switch to right."
     },
     {
      "id": "d23_e12",
      "name": "Leg Lift",
      "sets": 4,
      "reps": "15-20",
      "restSeconds": 0,
      "type": "giantset",
      "notes": ""
     },
     {
      "id": "d23_e13",
      "name": "Bicycle Kicks",
      "sets": 4,
      "reps": "Failure",
      "restSeconds": 60,
      "type": "giantset",
      "notes": ""
     }
    ]
   },
   {
    "dayNumber": 24,
    "title": "Rest Day",
    "estimatedMinutes": 0,
    "exercises": []
   },
   {
    "dayNumber": 25,
    "title": "Back, Biceps",
    "estimatedMinutes": 75,
    "exercises": [
     {
      "id": "d25_e1",
      "name": "Pullups",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d25_e2",
      "name": "Barbell Deadlift",
      "sets": 4,
      "reps": "5-8",
      "restSeconds": 120,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d25_e3",
      "name": "Bent Over Barbell Row",
      "sets": 4,
      "reps": "5-8",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d25_e4",
      "name": "Leverage Iso Row",
      "sets": 7,
      "reps": "5-8",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": "FST-7 Finisher."
     },
     {
      "id": "d25_e5",
      "name": "Barbell Curl",
      "sets": 4,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d25_e6",
      "name": "Hammer Curls",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d25_e7",
      "name": "Incline Dumbbell Curl",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d25_e8",
      "name": "Machine Preacher Curls",
      "sets": 7,
      "reps": "5-8",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": "FST-7 Finisher."
     }
    ]
   },
   {
    "dayNumber": 26,
    "title": "Shoulders, Rear-Delts, Traps",
    "estimatedMinutes": 65,
    "exercises": [
     {
      "id": "d26_e1",
      "name": "Standing Dumbbell Press",
      "sets": 4,
      "reps": "5-8",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d26_e2",
      "name": "Front Dumbbell Raise",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d26_e3",
      "name": "One-Arm Incline Lateral Raise",
      "sets": 4,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d26_e4",
      "name": "One-Arm Side Laterals",
      "sets": 7,
      "reps": "5",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": "FST-7 Finisher. Perform 5 reps together, then 5, 4, 3, 2, 1 alternating left/right."
     },
     {
      "id": "d26_e5",
      "name": "Seated Bent-Over Rear Delt Raise",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d26_e6",
      "name": "Reverse Machine Flyes",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d26_e7",
      "name": "Barbell Shrug",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d26_e8",
      "name": "Smith Machine Shrug",
      "sets": 7,
      "reps": "5-8",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": "FST-7 Finisher."
     }
    ]
   },
   {
    "dayNumber": 27,
    "title": "Biceps, Triceps, Abs",
    "estimatedMinutes": 75,
    "exercises": [
     {
      "id": "d27_e1",
      "name": "Dumbbell Alternate Bicep Curl",
      "sets": 4,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d27_e2",
      "name": "Standing Biceps Cable Curl",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d27_e3",
      "name": "Concentration Curls",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d27_e4",
      "name": "Spider Curl",
      "sets": 7,
      "reps": "5-8",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": "FST-7 Finisher."
     },
     {
      "id": "d27_e5",
      "name": "Triceps Pushdown - Rope Attachment",
      "sets": 4,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d27_e6",
      "name": "Machine Triceps Extension",
      "sets": 3,
      "reps": "5-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d27_e7",
      "name": "Reverse Grip Triceps Pushdown",
      "sets": 7,
      "reps": "5-8",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": "FST-7 Finisher."
     },
     {
      "id": "d27_e8",
      "name": "Crunches",
      "sets": 4,
      "reps": "25",
      "restSeconds": 45,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d27_e9",
      "name": "Hanging Leg Raises",
      "sets": 4,
      "reps": "20",
      "restSeconds": 45,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d27_e10",
      "name": "Decline Reverse Crunches",
      "sets": 4,
      "reps": "20",
      "restSeconds": 45,
      "type": "standard",
      "notes": ""
     }
    ]
   },
   {
    "dayNumber": 28,
    "title": "Rest Day",
    "estimatedMinutes": 0,
    "exercises": []
   },
   {
    "dayNumber": 29,
    "title": "PHASE 2: Chest, Abs",
    "estimatedMinutes": 80,
    "exercises": [
     {
      "id": "d29_e1",
      "name": "Cable Crossover",
      "sets": 7,
      "reps": "8-12",
      "restSeconds": 0,
      "type": "superset",
      "notes": "FST-7 Pre-Exhaust Superset. No rest between exercises, 45s after Dips."
     },
     {
      "id": "d29_e2",
      "name": "Dips - Chest Version",
      "sets": 7,
      "reps": "8-12",
      "restSeconds": 45,
      "type": "superset",
      "notes": "FST-7 Pre-Exhaust Superset."
     },
     {
      "id": "d29_e3",
      "name": "Leverage Incline Chest Press",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d29_e4",
      "name": "Dumbbell Bench Press",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d29_e5",
      "name": "Butterfly",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d29_e6",
      "name": "Crunches",
      "sets": 4,
      "reps": "25",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Phase 2 Ab Routine."
     },
     {
      "id": "d29_e7",
      "name": "Ab Crunch Machine",
      "sets": 4,
      "reps": "25",
      "restSeconds": 45,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d29_e8",
      "name": "Rope Crunch",
      "sets": 4,
      "reps": "20",
      "restSeconds": 45,
      "type": "standard",
      "notes": ""
     }
    ]
   },
   {
    "dayNumber": 30,
    "title": "PHASE 2: Quads, Hamstrings, Calves",
    "estimatedMinutes": 85,
    "exercises": [
     {
      "id": "d30_e1",
      "name": "Leg Press",
      "sets": 7,
      "reps": "15-20",
      "restSeconds": 0,
      "type": "giantset",
      "notes": "FST-7 Triset. Move immediately to Lunges."
     },
     {
      "id": "d30_e2",
      "name": "Dumbbell Walking Lunge",
      "sets": 7,
      "reps": "12-15",
      "restSeconds": 0,
      "type": "giantset",
      "notes": "FST-7 Triset."
     },
     {
      "id": "d30_e3",
      "name": "Leg Extensions",
      "sets": 7,
      "reps": "15-20",
      "restSeconds": 60,
      "type": "giantset",
      "notes": "FST-7 Triset. Rest 60s after."
     },
     {
      "id": "d30_e4",
      "name": "Front Barbell Squat",
      "sets": 4,
      "reps": "12-15",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Keep elbows up."
     },
     {
      "id": "d30_e5",
      "name": "Lying Leg Curls",
      "sets": 7,
      "reps": "12-15",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": "FST-7 Set."
     },
     {
      "id": "d30_e6",
      "name": "Standing Leg Curl",
      "sets": 4,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Keep quads on pads, hold contraction 2-3s."
     },
     {
      "id": "d30_e7",
      "name": "Seated Leg Curl",
      "sets": 4,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d30_e8",
      "name": "Standing Calf Raises",
      "sets": 7,
      "reps": "12-15",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": "FST-7 Set."
     },
     {
      "id": "d30_e9",
      "name": "Donkey Calf Raises",
      "sets": 4,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d30_e10",
      "name": "Seated Calf Raise",
      "sets": 4,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Pads over knees, not high on quads."
     }
    ]
   },
   {
    "dayNumber": 31,
    "title": "PHASE 2: Shoulders, Rear Delts, Traps, Abs",
    "estimatedMinutes": 80,
    "exercises": [
     {
      "id": "d31_e1",
      "name": "Side Lateral Raise",
      "sets": 7,
      "reps": "8-12",
      "restSeconds": 0,
      "type": "superset",
      "notes": "FST-7 Superset. Raise no higher than shoulder level."
     },
     {
      "id": "d31_e2",
      "name": "Front Cable Raise",
      "sets": 7,
      "reps": "8-12",
      "restSeconds": 45,
      "type": "superset",
      "notes": "FST-7 Superset."
     },
     {
      "id": "d31_e3",
      "name": "Machine Shoulder (Military) Press",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d31_e4",
      "name": "Cable Seated Lateral Raise",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Align upper body with cables."
     },
     {
      "id": "d31_e5",
      "name": "Face Pull",
      "sets": 7,
      "reps": "8-12",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": "FST-7 Set."
     },
     {
      "id": "d31_e6",
      "name": "Seated Bent-Over Rear Delt Raise",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d31_e7",
      "name": "Dumbbell Shrug",
      "sets": 7,
      "reps": "8-12",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": "FST-7 Set. Lean forward slightly."
     },
     {
      "id": "d31_e8",
      "name": "Smith Machine Behind the Back Shrug",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d31_e9",
      "name": "Crunches",
      "sets": 4,
      "reps": "25",
      "restSeconds": 45,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d31_e10",
      "name": "Ab Crunch Machine",
      "sets": 4,
      "reps": "25",
      "restSeconds": 45,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d31_e11",
      "name": "Rope Crunch",
      "sets": 4,
      "reps": "20",
      "restSeconds": 45,
      "type": "standard",
      "notes": ""
     }
    ]
   },
   {
    "dayNumber": 32,
    "title": "PHASE 2: Back",
    "estimatedMinutes": 75,
    "exercises": [
     {
      "id": "d32_e1",
      "name": "Behind-the-neck pull-down",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Squeeze back muscles at bottom (rear double-biceps pose)."
     },
     {
      "id": "d32_e2",
      "name": "Seated pulley row",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Pull into lower midsection."
     },
     {
      "id": "d32_e3",
      "name": "One-arm dumbbell row",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Arch back, pull into lower obliques."
     },
     {
      "id": "d32_e4",
      "name": "Dumbbell pull-over",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Feet together, hips low. Dip hips at bottom."
     },
     {
      "id": "d32_e5",
      "name": "Barbell Deadlift",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d32_e6",
      "name": "Leverage Iso Row",
      "sets": 7,
      "reps": "8-12",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": "FST-7 Phase 2."
     }
    ]
   },
   {
    "dayNumber": 33,
    "title": "PHASE 2: Triceps, Biceps, Abs",
    "estimatedMinutes": 80,
    "exercises": [
     {
      "id": "d33_e1",
      "name": "One-arm overhead dumbbell extensions",
      "sets": 7,
      "reps": "8-12",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": "FST-7 Phase 2. Seated on bench with support."
     },
     {
      "id": "d33_e2",
      "name": "High-cable curl",
      "sets": 7,
      "reps": "8-12",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": "FST-7 Phase 2. Supinate wrist heavily. Add partials."
     },
     {
      "id": "d33_e3",
      "name": "Triceps Pushdown",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d33_e4",
      "name": "Dumbbell Alternate Bicep Curl",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d33_e5",
      "name": "Machine Triceps Extension",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d33_e6",
      "name": "Concentration Curls",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d33_e7",
      "name": "Crunches",
      "sets": 4,
      "reps": "25",
      "restSeconds": 45,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d33_e8",
      "name": "Ab Crunch Machine",
      "sets": 4,
      "reps": "25",
      "restSeconds": 45,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d33_e9",
      "name": "Rope Crunch",
      "sets": 4,
      "reps": "20",
      "restSeconds": 45,
      "type": "standard",
      "notes": ""
     }
    ]
   },
   {
    "dayNumber": 34,
    "title": "PHASE 2: Quads, Hamstrings, Calves",
    "estimatedMinutes": 85,
    "exercises": [
     {
      "id": "d34_e1",
      "name": "Leg Press",
      "sets": 7,
      "reps": "15-20",
      "restSeconds": 0,
      "type": "giantset",
      "notes": "FST-7 Triset."
     },
     {
      "id": "d34_e2",
      "name": "Dumbbell Walking Lunge",
      "sets": 7,
      "reps": "12-15",
      "restSeconds": 0,
      "type": "giantset",
      "notes": "FST-7 Triset."
     },
     {
      "id": "d34_e3",
      "name": "Leg Extensions",
      "sets": 7,
      "reps": "15-20",
      "restSeconds": 60,
      "type": "giantset",
      "notes": "FST-7 Triset."
     },
     {
      "id": "d34_e4",
      "name": "Front Barbell Squat",
      "sets": 4,
      "reps": "12-15",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d34_e5",
      "name": "Lying Leg Curls",
      "sets": 7,
      "reps": "12-15",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": ""
     },
     {
      "id": "d34_e6",
      "name": "Standing Leg Curl",
      "sets": 4,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d34_e7",
      "name": "Seated Leg Curl",
      "sets": 4,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d34_e8",
      "name": "Standing Calf Raises",
      "sets": 7,
      "reps": "12-15",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": ""
     },
     {
      "id": "d34_e9",
      "name": "Donkey Calf Raises",
      "sets": 4,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d34_e10",
      "name": "Seated Calf Raise",
      "sets": 4,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     }
    ]
   },
   {
    "dayNumber": 35,
    "title": "Rest Day",
    "estimatedMinutes": 0,
    "exercises": []
   },
   {
    "dayNumber": 36,
    "title": "PHASE 2: Chest, Abs",
    "estimatedMinutes": 80,
    "exercises": [
     {
      "id": "d36_e1",
      "name": "Cable Crossover",
      "sets": 7,
      "reps": "8-12",
      "restSeconds": 0,
      "type": "superset",
      "notes": "FST-7 Pre-Exhaust Superset."
     },
     {
      "id": "d36_e2",
      "name": "Dips - Chest Version",
      "sets": 7,
      "reps": "8-12",
      "restSeconds": 45,
      "type": "superset",
      "notes": "FST-7 Pre-Exhaust Superset."
     },
     {
      "id": "d36_e3",
      "name": "Leverage Incline Chest Press",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d36_e4",
      "name": "Dumbbell Bench Press",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d36_e5",
      "name": "Butterfly",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d36_e6",
      "name": "Crunches",
      "sets": 4,
      "reps": "25",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Phase 2 Ab Routine."
     },
     {
      "id": "d36_e7",
      "name": "Ab Crunch Machine",
      "sets": 4,
      "reps": "25",
      "restSeconds": 45,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d36_e8",
      "name": "Rope Crunch",
      "sets": 4,
      "reps": "20",
      "restSeconds": 45,
      "type": "standard",
      "notes": ""
     }
    ]
   },
   {
    "dayNumber": 37,
    "title": "PHASE 2: Quads, Hamstrings, Calves",
    "estimatedMinutes": 85,
    "exercises": [
     {
      "id": "d37_e1",
      "name": "Leg Press",
      "sets": 7,
      "reps": "15-20",
      "restSeconds": 0,
      "type": "giantset",
      "notes": "FST-7 Triset."
     },
     {
      "id": "d37_e2",
      "name": "Dumbbell Walking Lunge",
      "sets": 7,
      "reps": "12-15",
      "restSeconds": 0,
      "type": "giantset",
      "notes": "FST-7 Triset."
     },
     {
      "id": "d37_e3",
      "name": "Leg Extensions",
      "sets": 7,
      "reps": "15-20",
      "restSeconds": 60,
      "type": "giantset",
      "notes": "FST-7 Triset."
     },
     {
      "id": "d37_e4",
      "name": "Front Barbell Squat",
      "sets": 4,
      "reps": "12-15",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d37_e5",
      "name": "Lying Leg Curls",
      "sets": 7,
      "reps": "12-15",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": ""
     },
     {
      "id": "d37_e6",
      "name": "Standing Leg Curl",
      "sets": 4,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d37_e7",
      "name": "Seated Leg Curl",
      "sets": 4,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d37_e8",
      "name": "Standing Calf Raises",
      "sets": 7,
      "reps": "12-15",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": ""
     },
     {
      "id": "d37_e9",
      "name": "Donkey Calf Raises",
      "sets": 4,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d37_e10",
      "name": "Seated Calf Raise",
      "sets": 4,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     }
    ]
   },
   {
    "dayNumber": 38,
    "title": "PHASE 2: Shoulders, Rear Delts, Traps, Abs",
    "estimatedMinutes": 80,
    "exercises": [
     {
      "id": "d38_e1",
      "name": "Side Lateral Raise",
      "sets": 7,
      "reps": "8-12",
      "restSeconds": 0,
      "type": "superset",
      "notes": "FST-7 Superset."
     },
     {
      "id": "d38_e2",
      "name": "Front Cable Raise",
      "sets": 7,
      "reps": "8-12",
      "restSeconds": 45,
      "type": "superset",
      "notes": "FST-7 Superset."
     },
     {
      "id": "d38_e3",
      "name": "Machine Shoulder (Military) Press",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d38_e4",
      "name": "Cable Seated Lateral Raise",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d38_e5",
      "name": "Face Pull",
      "sets": 7,
      "reps": "8-12",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": ""
     },
     {
      "id": "d38_e6",
      "name": "Seated Bent-Over Rear Delt Raise",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d38_e7",
      "name": "Dumbbell Shrug",
      "sets": 7,
      "reps": "8-12",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": ""
     },
     {
      "id": "d38_e8",
      "name": "Smith Machine Behind the Back Shrug",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d38_e9",
      "name": "Crunches",
      "sets": 4,
      "reps": "25",
      "restSeconds": 45,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d38_e10",
      "name": "Ab Crunch Machine",
      "sets": 4,
      "reps": "25",
      "restSeconds": 45,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d38_e11",
      "name": "Rope Crunch",
      "sets": 4,
      "reps": "20",
      "restSeconds": 45,
      "type": "standard",
      "notes": ""
     }
    ]
   },
   {
    "dayNumber": 39,
    "title": "PHASE 2: Back",
    "estimatedMinutes": 75,
    "exercises": [
     {
      "id": "d39_e1",
      "name": "Behind-the-neck pull-down",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Squeeze back muscles at bottom."
     },
     {
      "id": "d39_e2",
      "name": "Seated pulley row",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d39_e3",
      "name": "One-arm dumbbell row",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d39_e4",
      "name": "Dumbbell pull-over",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d39_e5",
      "name": "Barbell Deadlift",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d39_e6",
      "name": "Leverage Iso Row",
      "sets": 7,
      "reps": "8-12",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": "FST-7 Phase 2."
     }
    ]
   },
   {
    "dayNumber": 40,
    "title": "PHASE 2: Triceps, Biceps, Abs",
    "estimatedMinutes": 80,
    "exercises": [
     {
      "id": "d40_e1",
      "name": "One-arm overhead dumbbell extensions",
      "sets": 7,
      "reps": "8-12",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": "FST-7 Phase 2."
     },
     {
      "id": "d40_e2",
      "name": "High-cable curl",
      "sets": 7,
      "reps": "8-12",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": "FST-7 Phase 2."
     },
     {
      "id": "d40_e3",
      "name": "Triceps Pushdown",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d40_e4",
      "name": "Dumbbell Alternate Bicep Curl",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d40_e5",
      "name": "Machine Triceps Extension",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d40_e6",
      "name": "Concentration Curls",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d40_e7",
      "name": "Crunches",
      "sets": 4,
      "reps": "25",
      "restSeconds": 45,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d40_e8",
      "name": "Ab Crunch Machine",
      "sets": 4,
      "reps": "25",
      "restSeconds": 45,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d40_e9",
      "name": "Rope Crunch",
      "sets": 4,
      "reps": "20",
      "restSeconds": 45,
      "type": "standard",
      "notes": ""
     }
    ]
   },
   {
    "dayNumber": 41,
    "title": "PHASE 2: Quads, Hamstrings, Calves",
    "estimatedMinutes": 85,
    "exercises": [
     {
      "id": "d41_e1",
      "name": "Leg Press",
      "sets": 7,
      "reps": "15-20",
      "restSeconds": 0,
      "type": "giantset",
      "notes": "FST-7 Triset."
     },
     {
      "id": "d41_e2",
      "name": "Dumbbell Walking Lunge",
      "sets": 7,
      "reps": "12-15",
      "restSeconds": 0,
      "type": "giantset",
      "notes": "FST-7 Triset."
     },
     {
      "id": "d41_e3",
      "name": "Leg Extensions",
      "sets": 7,
      "reps": "15-20",
      "restSeconds": 60,
      "type": "giantset",
      "notes": "FST-7 Triset."
     },
     {
      "id": "d41_e4",
      "name": "Front Barbell Squat",
      "sets": 4,
      "reps": "12-15",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d41_e5",
      "name": "Lying Leg Curls",
      "sets": 7,
      "reps": "12-15",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": ""
     },
     {
      "id": "d41_e6",
      "name": "Standing Leg Curl",
      "sets": 4,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d41_e7",
      "name": "Seated Leg Curl",
      "sets": 4,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d41_e8",
      "name": "Standing Calf Raises",
      "sets": 7,
      "reps": "12-15",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": ""
     },
     {
      "id": "d41_e9",
      "name": "Donkey Calf Raises",
      "sets": 4,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d41_e10",
      "name": "Seated Calf Raise",
      "sets": 4,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     }
    ]
   },
   {
    "dayNumber": 42,
    "title": "Rest Day",
    "estimatedMinutes": 0,
    "exercises": []
   },
   {
    "dayNumber": 43,
    "title": "PHASE 2: Chest, Abs",
    "estimatedMinutes": 80,
    "exercises": [
     {
      "id": "d43_e1",
      "name": "Cable Crossover",
      "sets": 7,
      "reps": "8-12",
      "restSeconds": 0,
      "type": "superset",
      "notes": "FST-7 Pre-Exhaust Superset."
     },
     {
      "id": "d43_e2",
      "name": "Dips - Chest Version",
      "sets": 7,
      "reps": "8-12",
      "restSeconds": 45,
      "type": "superset",
      "notes": "FST-7 Pre-Exhaust Superset."
     },
     {
      "id": "d43_e3",
      "name": "Leverage Incline Chest Press",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d43_e4",
      "name": "Dumbbell Bench Press",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d43_e5",
      "name": "Butterfly",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d43_e6",
      "name": "Crunches",
      "sets": 4,
      "reps": "25",
      "restSeconds": 45,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d43_e7",
      "name": "Ab Crunch Machine",
      "sets": 4,
      "reps": "25",
      "restSeconds": 45,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d43_e8",
      "name": "Rope Crunch",
      "sets": 4,
      "reps": "20",
      "restSeconds": 45,
      "type": "standard",
      "notes": ""
     }
    ]
   },
   {
    "dayNumber": 44,
    "title": "PHASE 2: Quads, Hamstrings, Calves",
    "estimatedMinutes": 85,
    "exercises": [
     {
      "id": "d44_e1",
      "name": "Leg Press",
      "sets": 7,
      "reps": "15-20",
      "restSeconds": 0,
      "type": "giantset",
      "notes": "FST-7 Triset."
     },
     {
      "id": "d44_e2",
      "name": "Dumbbell Walking Lunge",
      "sets": 7,
      "reps": "12-15",
      "restSeconds": 0,
      "type": "giantset",
      "notes": "FST-7 Triset."
     },
     {
      "id": "d44_e3",
      "name": "Leg Extensions",
      "sets": 7,
      "reps": "15-20",
      "restSeconds": 60,
      "type": "giantset",
      "notes": "FST-7 Triset."
     },
     {
      "id": "d44_e4",
      "name": "Front Barbell Squat",
      "sets": 4,
      "reps": "12-15",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d44_e5",
      "name": "Lying Leg Curls",
      "sets": 7,
      "reps": "12-15",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": ""
     },
     {
      "id": "d44_e6",
      "name": "Standing Leg Curl",
      "sets": 4,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d44_e7",
      "name": "Seated Leg Curl",
      "sets": 4,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d44_e8",
      "name": "Standing Calf Raises",
      "sets": 7,
      "reps": "12-15",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": ""
     },
     {
      "id": "d44_e9",
      "name": "Donkey Calf Raises",
      "sets": 4,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d44_e10",
      "name": "Seated Calf Raise",
      "sets": 4,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     }
    ]
   },
   {
    "dayNumber": 45,
    "title": "PHASE 2: Shoulders, Rear Delts, Traps, Abs",
    "estimatedMinutes": 80,
    "exercises": [
     {
      "id": "d45_e1",
      "name": "Side Lateral Raise",
      "sets": 7,
      "reps": "8-12",
      "restSeconds": 0,
      "type": "superset",
      "notes": "FST-7 Superset."
     },
     {
      "id": "d45_e2",
      "name": "Front Cable Raise",
      "sets": 7,
      "reps": "8-12",
      "restSeconds": 45,
      "type": "superset",
      "notes": "FST-7 Superset."
     },
     {
      "id": "d45_e3",
      "name": "Machine Shoulder (Military) Press",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d45_e4",
      "name": "Cable Seated Lateral Raise",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d45_e5",
      "name": "Face Pull",
      "sets": 7,
      "reps": "8-12",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": ""
     },
     {
      "id": "d45_e6",
      "name": "Seated Bent-Over Rear Delt Raise",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d45_e7",
      "name": "Dumbbell Shrug",
      "sets": 7,
      "reps": "8-12",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": ""
     },
     {
      "id": "d45_e8",
      "name": "Smith Machine Behind the Back Shrug",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d45_e9",
      "name": "Crunches",
      "sets": 4,
      "reps": "25",
      "restSeconds": 45,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d45_e10",
      "name": "Ab Crunch Machine",
      "sets": 4,
      "reps": "25",
      "restSeconds": 45,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d45_e11",
      "name": "Rope Crunch",
      "sets": 4,
      "reps": "20",
      "restSeconds": 45,
      "type": "standard",
      "notes": ""
     }
    ]
   },
   {
    "dayNumber": 46,
    "title": "PHASE 2: Back",
    "estimatedMinutes": 75,
    "exercises": [
     {
      "id": "d46_e1",
      "name": "Behind-the-neck pull-down",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Squeeze back muscles at bottom."
     },
     {
      "id": "d46_e2",
      "name": "Seated pulley row",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d46_e3",
      "name": "One-arm dumbbell row",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d46_e4",
      "name": "Dumbbell pull-over",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d46_e5",
      "name": "Barbell Deadlift",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d46_e6",
      "name": "Leverage Iso Row",
      "sets": 7,
      "reps": "8-12",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": "FST-7 Phase 2."
     }
    ]
   },
   {
    "dayNumber": 47,
    "title": "PHASE 2: Triceps, Biceps, Abs",
    "estimatedMinutes": 80,
    "exercises": [
     {
      "id": "d47_e1",
      "name": "One-arm overhead dumbbell extensions",
      "sets": 7,
      "reps": "8-12",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": "FST-7 Phase 2."
     },
     {
      "id": "d47_e2",
      "name": "High-cable curl",
      "sets": 7,
      "reps": "8-12",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": "FST-7 Phase 2."
     },
     {
      "id": "d47_e3",
      "name": "Triceps Pushdown",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d47_e4",
      "name": "Dumbbell Alternate Bicep Curl",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d47_e5",
      "name": "Machine Triceps Extension",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d47_e6",
      "name": "Concentration Curls",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d47_e7",
      "name": "Crunches",
      "sets": 4,
      "reps": "25",
      "restSeconds": 45,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d47_e8",
      "name": "Ab Crunch Machine",
      "sets": 4,
      "reps": "25",
      "restSeconds": 45,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d47_e9",
      "name": "Rope Crunch",
      "sets": 4,
      "reps": "20",
      "restSeconds": 45,
      "type": "standard",
      "notes": ""
     }
    ]
   },
   {
    "dayNumber": 48,
    "title": "PHASE 2: Quads, Hamstrings, Calves",
    "estimatedMinutes": 85,
    "exercises": [
     {
      "id": "d48_e1",
      "name": "Leg Press",
      "sets": 7,
      "reps": "15-20",
      "restSeconds": 0,
      "type": "giantset",
      "notes": "FST-7 Triset."
     },
     {
      "id": "d48_e2",
      "name": "Dumbbell Walking Lunge",
      "sets": 7,
      "reps": "12-15",
      "restSeconds": 0,
      "type": "giantset",
      "notes": "FST-7 Triset."
     },
     {
      "id": "d48_e3",
      "name": "Leg Extensions",
      "sets": 7,
      "reps": "15-20",
      "restSeconds": 60,
      "type": "giantset",
      "notes": "FST-7 Triset."
     },
     {
      "id": "d48_e4",
      "name": "Front Barbell Squat",
      "sets": 4,
      "reps": "12-15",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d48_e5",
      "name": "Lying Leg Curls",
      "sets": 7,
      "reps": "12-15",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": ""
     },
     {
      "id": "d48_e6",
      "name": "Standing Leg Curl",
      "sets": 4,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d48_e7",
      "name": "Seated Leg Curl",
      "sets": 4,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d48_e8",
      "name": "Standing Calf Raises",
      "sets": 7,
      "reps": "12-15",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": ""
     },
     {
      "id": "d48_e9",
      "name": "Donkey Calf Raises",
      "sets": 4,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d48_e10",
      "name": "Seated Calf Raise",
      "sets": 4,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     }
    ]
   },
   {
    "dayNumber": 49,
    "title": "Rest Day",
    "estimatedMinutes": 0,
    "exercises": []
   },
   {
    "dayNumber": 50,
    "title": "PHASE 2: Chest, Abs",
    "estimatedMinutes": 80,
    "exercises": [
     {
      "id": "d50_e1",
      "name": "Cable Crossover",
      "sets": 7,
      "reps": "8-12",
      "restSeconds": 0,
      "type": "superset",
      "notes": "FST-7 Pre-Exhaust Superset."
     },
     {
      "id": "d50_e2",
      "name": "Dips - Chest Version",
      "sets": 7,
      "reps": "8-12",
      "restSeconds": 45,
      "type": "superset",
      "notes": "FST-7 Pre-Exhaust Superset."
     },
     {
      "id": "d50_e3",
      "name": "Leverage Incline Chest Press",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d50_e4",
      "name": "Dumbbell Bench Press",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d50_e5",
      "name": "Butterfly",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d50_e6",
      "name": "Crunches",
      "sets": 4,
      "reps": "25",
      "restSeconds": 45,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d50_e7",
      "name": "Ab Crunch Machine",
      "sets": 4,
      "reps": "25",
      "restSeconds": 45,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d50_e8",
      "name": "Rope Crunch",
      "sets": 4,
      "reps": "20",
      "restSeconds": 45,
      "type": "standard",
      "notes": ""
     }
    ]
   },
   {
    "dayNumber": 51,
    "title": "PHASE 2: Quads, Hamstrings, Calves",
    "estimatedMinutes": 85,
    "exercises": [
     {
      "id": "d51_e1",
      "name": "Leg Press",
      "sets": 7,
      "reps": "15-20",
      "restSeconds": 0,
      "type": "giantset",
      "notes": "FST-7 Triset."
     },
     {
      "id": "d51_e2",
      "name": "Dumbbell Walking Lunge",
      "sets": 7,
      "reps": "12-15",
      "restSeconds": 0,
      "type": "giantset",
      "notes": "FST-7 Triset."
     },
     {
      "id": "d51_e3",
      "name": "Leg Extensions",
      "sets": 7,
      "reps": "15-20",
      "restSeconds": 60,
      "type": "giantset",
      "notes": "FST-7 Triset."
     },
     {
      "id": "d51_e4",
      "name": "Front Barbell Squat",
      "sets": 4,
      "reps": "12-15",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d51_e5",
      "name": "Lying Leg Curls",
      "sets": 7,
      "reps": "12-15",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": ""
     },
     {
      "id": "d51_e6",
      "name": "Standing Leg Curl",
      "sets": 4,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d51_e7",
      "name": "Seated Leg Curl",
      "sets": 4,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d51_e8",
      "name": "Standing Calf Raises",
      "sets": 7,
      "reps": "12-15",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": ""
     },
     {
      "id": "d51_e9",
      "name": "Donkey Calf Raises",
      "sets": 4,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d51_e10",
      "name": "Seated Calf Raise",
      "sets": 4,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     }
    ]
   },
   {
    "dayNumber": 52,
    "title": "PHASE 2: Shoulders, Rear Delts, Traps, Abs",
    "estimatedMinutes": 80,
    "exercises": [
     {
      "id": "d52_e1",
      "name": "Side Lateral Raise",
      "sets": 7,
      "reps": "8-12",
      "restSeconds": 0,
      "type": "superset",
      "notes": "FST-7 Superset."
     },
     {
      "id": "d52_e2",
      "name": "Front Cable Raise",
      "sets": 7,
      "reps": "8-12",
      "restSeconds": 45,
      "type": "superset",
      "notes": "FST-7 Superset."
     },
     {
      "id": "d52_e3",
      "name": "Machine Shoulder (Military) Press",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d52_e4",
      "name": "Cable Seated Lateral Raise",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d52_e5",
      "name": "Face Pull",
      "sets": 7,
      "reps": "8-12",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": ""
     },
     {
      "id": "d52_e6",
      "name": "Seated Bent-Over Rear Delt Raise",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d52_e7",
      "name": "Dumbbell Shrug",
      "sets": 7,
      "reps": "8-12",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": ""
     },
     {
      "id": "d52_e8",
      "name": "Smith Machine Behind the Back Shrug",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d52_e9",
      "name": "Crunches",
      "sets": 4,
      "reps": "25",
      "restSeconds": 45,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d52_e10",
      "name": "Ab Crunch Machine",
      "sets": 4,
      "reps": "25",
      "restSeconds": 45,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d52_e11",
      "name": "Rope Crunch",
      "sets": 4,
      "reps": "20",
      "restSeconds": 45,
      "type": "standard",
      "notes": ""
     }
    ]
   },
   {
    "dayNumber": 53,
    "title": "PHASE 2: Back",
    "estimatedMinutes": 75,
    "exercises": [
     {
      "id": "d53_e1",
      "name": "Behind-the-neck pull-down",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Squeeze back muscles at bottom."
     },
     {
      "id": "d53_e2",
      "name": "Seated pulley row",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d53_e3",
      "name": "One-arm dumbbell row",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d53_e4",
      "name": "Dumbbell pull-over",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d53_e5",
      "name": "Barbell Deadlift",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d53_e6",
      "name": "Leverage Iso Row",
      "sets": 7,
      "reps": "8-12",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": "FST-7 Phase 2."
     }
    ]
   },
   {
    "dayNumber": 54,
    "title": "PHASE 2: Triceps, Biceps, Abs",
    "estimatedMinutes": 80,
    "exercises": [
     {
      "id": "d54_e1",
      "name": "One-arm overhead dumbbell extensions",
      "sets": 7,
      "reps": "8-12",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": "FST-7 Phase 2."
     },
     {
      "id": "d54_e2",
      "name": "High-cable curl",
      "sets": 7,
      "reps": "8-12",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": "FST-7 Phase 2."
     },
     {
      "id": "d54_e3",
      "name": "Triceps Pushdown",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d54_e4",
      "name": "Dumbbell Alternate Bicep Curl",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d54_e5",
      "name": "Machine Triceps Extension",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d54_e6",
      "name": "Concentration Curls",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d54_e7",
      "name": "Crunches",
      "sets": 4,
      "reps": "25",
      "restSeconds": 45,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d54_e8",
      "name": "Ab Crunch Machine",
      "sets": 4,
      "reps": "25",
      "restSeconds": 45,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d54_e9",
      "name": "Rope Crunch",
      "sets": 4,
      "reps": "20",
      "restSeconds": 45,
      "type": "standard",
      "notes": ""
     }
    ]
   },
   {
    "dayNumber": 55,
    "title": "PHASE 2: Quads, Hamstrings, Calves",
    "estimatedMinutes": 85,
    "exercises": [
     {
      "id": "d55_e1",
      "name": "Leg Press",
      "sets": 7,
      "reps": "15-20",
      "restSeconds": 0,
      "type": "giantset",
      "notes": "FST-7 Triset."
     },
     {
      "id": "d55_e2",
      "name": "Dumbbell Walking Lunge",
      "sets": 7,
      "reps": "12-15",
      "restSeconds": 0,
      "type": "giantset",
      "notes": "FST-7 Triset."
     },
     {
      "id": "d55_e3",
      "name": "Leg Extensions",
      "sets": 7,
      "reps": "15-20",
      "restSeconds": 60,
      "type": "giantset",
      "notes": "FST-7 Triset."
     },
     {
      "id": "d55_e4",
      "name": "Front Barbell Squat",
      "sets": 4,
      "reps": "12-15",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d55_e5",
      "name": "Lying Leg Curls",
      "sets": 7,
      "reps": "12-15",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": ""
     },
     {
      "id": "d55_e6",
      "name": "Standing Leg Curl",
      "sets": 4,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d55_e7",
      "name": "Seated Leg Curl",
      "sets": 4,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d55_e8",
      "name": "Standing Calf Raises",
      "sets": 7,
      "reps": "12-15",
      "restSeconds": 45,
      "type": "fst-7",
      "notes": ""
     },
     {
      "id": "d55_e9",
      "name": "Donkey Calf Raises",
      "sets": 4,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "d55_e10",
      "name": "Seated Calf Raise",
      "sets": 4,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     }
    ]
   },
   {
    "dayNumber": 56,
    "title": "Rest Day",
    "estimatedMinutes": 0,
    "exercises": []
   }
  ]
 },
 {
  "id": "hiit_100s_jim_stoppani_36_workouts_exact",
  "title": "HIIT 100's: 6-Week Fat Loss Transformation (Exact 36 Workouts)",
  "description": "Jim Stoppani's complete 6-week, 6-day per week fat loss training program featuring individual exercise listings for all 36 workouts, 10x10 HIIT 100's blocks, drop sets, and progressive rest reduction from 60s down to 0s.",
  "tags": [
   "Jim Stoppani",
   "HIIT 100s",
   "Fat Loss",
   "6 Weeks",
   "Detailed"
  ],
  "days": [
   {
    "dayNumber": 1,
    "title": "Week 1, Workout 1 (Mon): Chest, Back, Abs",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "h1_w1_d1_e1",
      "name": "Bench Press HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 60,
      "type": "standard",
      "notes": "50% 10 RM. Sets 1-3 explosive, 4-6 slow/controlled."
     },
     {
      "id": "h1_w1_d1_e2",
      "name": "Bench Press",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM weight; 3rd set is a drop set."
     },
     {
      "id": "h1_w1_d1_e3",
      "name": "Dumbbell Incline Press",
      "sets": 3,
      "reps": "10",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM to failure."
     },
     {
      "id": "h1_w1_d1_e4",
      "name": "Cable Crossover",
      "sets": 3,
      "reps": "15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "15 RM to failure."
     },
     {
      "id": "h1_w1_d1_e5",
      "name": "Wide-Grip Pulldown HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 60,
      "type": "standard",
      "notes": "50% 10 RM."
     },
     {
      "id": "h1_w1_d1_e6",
      "name": "Wide-Grip Pulldown",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM with drop set."
     },
     {
      "id": "h1_w1_d1_e7",
      "name": "Barbell Bent-Over Row",
      "sets": 3,
      "reps": "10",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM to failure."
     },
     {
      "id": "h1_w1_d1_e8",
      "name": "Straight-Arm Pulldown",
      "sets": 3,
      "reps": "15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "15 RM to failure."
     },
     {
      "id": "h1_w1_d1_e9",
      "name": "Reverse Crunch",
      "sets": 10,
      "reps": "10",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Bodyweight HIIT 100s block."
     },
     {
      "id": "h1_w1_d1_e10",
      "name": "Crunch",
      "sets": 10,
      "reps": "10",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Bodyweight HIIT 100s block."
     },
     {
      "id": "h1_w1_d1_e11",
      "name": "Dead/Curl/Press",
      "sets": 10,
      "reps": "10",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Light dumbbells full-body finisher."
     }
    ]
   },
   {
    "dayNumber": 2,
    "title": "Week 1, Workout 2 (Tue): Legs, Triceps, Calves",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "h1_w1_d2_e1",
      "name": "Squat HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 60,
      "type": "standard",
      "notes": "50% 10 RM."
     },
     {
      "id": "h1_w1_d2_e2",
      "name": "Squat",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM with drop set."
     },
     {
      "id": "h1_w1_d2_e3",
      "name": "Leg Press",
      "sets": 3,
      "reps": "10",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM."
     },
     {
      "id": "h1_w1_d2_e4",
      "name": "Leg Extension",
      "sets": 3,
      "reps": "15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "15 RM isolation."
     },
     {
      "id": "h1_w1_d2_e5",
      "name": "Leg Curl",
      "sets": 3,
      "reps": "15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "15 RM isolation."
     },
     {
      "id": "h1_w1_d2_e6",
      "name": "Triceps Pressdown HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 60,
      "type": "standard",
      "notes": "50% 10 RM."
     },
     {
      "id": "h1_w1_d2_e7",
      "name": "Triceps Pressdown",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM with drop set."
     },
     {
      "id": "h1_w1_d2_e8",
      "name": "Lying Triceps Extensions",
      "sets": 3,
      "reps": "15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "15 RM work."
     },
     {
      "id": "h1_w1_d2_e9",
      "name": "Standing Calf Raise HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 60,
      "type": "standard",
      "notes": "50% 10 RM."
     },
     {
      "id": "h1_w1_d2_e10",
      "name": "Standing Calf Raise",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM with drop set."
     },
     {
      "id": "h1_w1_d2_e11",
      "name": "Seated Calf Raise",
      "sets": 3,
      "reps": "15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "15 RM."
     },
     {
      "id": "h1_w1_d2_e12",
      "name": "Kettlebell Swing",
      "sets": 10,
      "reps": "10",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Finisher."
     }
    ]
   },
   {
    "dayNumber": 3,
    "title": "Week 1, Workout 3 (Wed): Shoulders, Traps, Biceps, Forearms",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "h1_w1_d3_e1",
      "name": "Dumbbell Shoulder Press HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 60,
      "type": "standard",
      "notes": "50% 10 RM."
     },
     {
      "id": "h1_w1_d3_e2",
      "name": "Dumbbell Shoulder Press",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w1_d3_e3",
      "name": "Dumbbell Lateral Raise",
      "sets": 3,
      "reps": "10",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Side delts."
     },
     {
      "id": "h1_w1_d3_e4",
      "name": "Dumbbell Rear Delt Raise",
      "sets": 3,
      "reps": "15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Rear delts."
     },
     {
      "id": "h1_w1_d3_e5",
      "name": "Dumbbell Shrug HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 60,
      "type": "standard",
      "notes": "50% 10 RM."
     },
     {
      "id": "h1_w1_d3_e6",
      "name": "Dumbbell Shrug",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w1_d3_e7",
      "name": "Dumbbell Curl HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 60,
      "type": "standard",
      "notes": "50% 10 RM."
     },
     {
      "id": "h1_w1_d3_e8",
      "name": "Dumbbell Curl",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w1_d3_e9",
      "name": "Incline Dumbbell Curl",
      "sets": 3,
      "reps": "15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "15 RM work."
     },
     {
      "id": "h1_w1_d3_e10",
      "name": "Barbell Wrist Curl HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 60,
      "type": "standard",
      "notes": "50% 10 RM."
     },
     {
      "id": "h1_w1_d3_e11",
      "name": "Barbell Wrist Curl",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w1_d3_e12",
      "name": "Dumbbell Cleans",
      "sets": 10,
      "reps": "10",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Full-body finisher."
     }
    ]
   },
   {
    "dayNumber": 4,
    "title": "Week 1, Workout 4 (Thu): Chest, Back, Abs",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "h1_w1_d4_e1",
      "name": "Bench Press HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 50,
      "type": "standard",
      "notes": "50% 10 RM (50s rest)."
     },
     {
      "id": "h1_w1_d4_e2",
      "name": "Bench Press",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM weight with drop set."
     },
     {
      "id": "h1_w1_d4_e3",
      "name": "Reverse-Grip Incline Bench Press",
      "sets": 3,
      "reps": "10",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w1_d4_e4",
      "name": "Incline Dumbbell Flye",
      "sets": 3,
      "reps": "15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "15 RM work."
     },
     {
      "id": "h1_w1_d4_e5",
      "name": "Wide-Grip Pulldown HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 50,
      "type": "standard",
      "notes": "50% 10 RM."
     },
     {
      "id": "h1_w1_d4_e6",
      "name": "Wide-Grip Pulldown",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM with drop set."
     },
     {
      "id": "h1_w1_d4_e7",
      "name": "One-Arm Dumbbell Bent-Over Row",
      "sets": 3,
      "reps": "10",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w1_d4_e8",
      "name": "Reverse-Grip Pulldown",
      "sets": 3,
      "reps": "15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "15 RM work."
     },
     {
      "id": "h1_w1_d4_e9",
      "name": "Reverse Crunch",
      "sets": 10,
      "reps": "10",
      "restSeconds": 50,
      "type": "standard",
      "notes": "Abs HIIT 100s block."
     },
     {
      "id": "h1_w1_d4_e10",
      "name": "Crunch",
      "sets": 10,
      "reps": "10",
      "restSeconds": 50,
      "type": "standard",
      "notes": "Abs HIIT 100s block."
     },
     {
      "id": "h1_w1_d4_e11",
      "name": "Dead/Curl/Press",
      "sets": 10,
      "reps": "10",
      "restSeconds": 50,
      "type": "standard",
      "notes": "Finisher."
     }
    ]
   },
   {
    "dayNumber": 5,
    "title": "Week 1, Workout 5 (Fri): Legs, Triceps, Calves",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "h1_w1_d5_e1",
      "name": "Squat HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 50,
      "type": "standard",
      "notes": "50% 10 RM (50s rest)."
     },
     {
      "id": "h1_w1_d5_e2",
      "name": "Squat",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM with drop set."
     },
     {
      "id": "h1_w1_d5_e3",
      "name": "Dumbbell Lunge",
      "sets": 3,
      "reps": "10",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w1_d5_e4",
      "name": "Leg Extension",
      "sets": 3,
      "reps": "15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "15 RM work."
     },
     {
      "id": "h1_w1_d5_e5",
      "name": "Romanian Deadlift",
      "sets": 3,
      "reps": "15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "15 RM work."
     },
     {
      "id": "h1_w1_d5_e6",
      "name": "Triceps Pressdown HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 50,
      "type": "standard",
      "notes": "50% 10 RM."
     },
     {
      "id": "h1_w1_d5_e7",
      "name": "Triceps Pressdown",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM with drop set."
     },
     {
      "id": "h1_w1_d5_e8",
      "name": "Cable Overhead Triceps Extension",
      "sets": 3,
      "reps": "15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "15 RM work."
     },
     {
      "id": "h1_w1_d5_e9",
      "name": "Standing Calf Raise HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 50,
      "type": "standard",
      "notes": "50% 10 RM."
     },
     {
      "id": "h1_w1_d5_e10",
      "name": "Standing Calf Raise",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w1_d5_e11",
      "name": "Seated Calf Raise",
      "sets": 3,
      "reps": "15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "15 RM work."
     },
     {
      "id": "h1_w1_d5_e12",
      "name": "Barbell Wrist Curl HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 50,
      "type": "standard",
      "notes": "50% 10 RM."
     },
     {
      "id": "h1_w1_d5_e13",
      "name": "Barbell Wrist Curl",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w1_d5_e14",
      "name": "Kettlebell Swing",
      "sets": 10,
      "reps": "10",
      "restSeconds": 50,
      "type": "standard",
      "notes": "Finisher."
     },
     {
      "id": "h1_w1_d5_e15",
      "name": "Dumbbell Cleans",
      "sets": 10,
      "reps": "10",
      "restSeconds": 50,
      "type": "standard",
      "notes": "Finisher."
     }
    ]
   },
   {
    "dayNumber": 6,
    "title": "Week 1, Workout 6 (Sat): Shoulders, Traps, Biceps, Forearms",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "h1_w1_d6_e1",
      "name": "Dumbbell Shoulder Press HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 50,
      "type": "standard",
      "notes": "50% 10 RM (50s rest)."
     },
     {
      "id": "h1_w1_d6_e2",
      "name": "Dumbbell Shoulder Press",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w1_d6_e3",
      "name": "One-Arm Cable Lateral Raise",
      "sets": 3,
      "reps": "10",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Side delts."
     },
     {
      "id": "h1_w1_d6_e4",
      "name": "Machine Rear Delt Flye",
      "sets": 3,
      "reps": "15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Rear delts."
     },
     {
      "id": "h1_w1_d6_e5",
      "name": "Dumbbell Shrug HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 50,
      "type": "standard",
      "notes": "50% 10 RM."
     },
     {
      "id": "h1_w1_d6_e6",
      "name": "Dumbbell Shrug",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w1_d6_e7",
      "name": "Dumbbell Curl HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 50,
      "type": "standard",
      "notes": "50% 10 RM."
     },
     {
      "id": "h1_w1_d6_e8",
      "name": "Dumbbell Curl",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w1_d6_e9",
      "name": "Behind-the-Back Cable Curl",
      "sets": 3,
      "reps": "15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "15 RM work."
     },
     {
      "id": "h1_w1_d6_e10",
      "name": "Barbell Wrist Curl HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 50,
      "type": "standard",
      "notes": "50% 10 RM."
     },
     {
      "id": "h1_w1_d6_e11",
      "name": "Barbell Wrist Curl",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w1_d6_e12",
      "name": "Dumbbell Cleans",
      "sets": 10,
      "reps": "10",
      "restSeconds": 50,
      "type": "standard",
      "notes": "Finisher."
     }
    ]
   },
   {
    "dayNumber": 7,
    "title": "Week 2, Workout 1 (Mon): Chest, Back, Abs",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "h1_w2_d1_e1",
      "name": "Bench Press HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 40,
      "type": "standard",
      "notes": "Rest drops to 40 seconds in Week 2."
     },
     {
      "id": "h1_w2_d1_e2",
      "name": "Bench Press",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM with drop set."
     },
     {
      "id": "h1_w2_d1_e3",
      "name": "Dumbbell Incline Press",
      "sets": 3,
      "reps": "10",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w2_d1_e4",
      "name": "Cable Crossover",
      "sets": 3,
      "reps": "15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "15 RM work."
     },
     {
      "id": "h1_w2_d1_e5",
      "name": "Wide-Grip Pulldown HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 40,
      "type": "standard",
      "notes": "40s rest."
     },
     {
      "id": "h1_w2_d1_e6",
      "name": "Wide-Grip Pulldown",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM with drop set."
     },
     {
      "id": "h1_w2_d1_e7",
      "name": "Barbell Bent-Over Row",
      "sets": 3,
      "reps": "10",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w2_d1_e8",
      "name": "Straight-Arm Pulldown",
      "sets": 3,
      "reps": "15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "15 RM work."
     },
     {
      "id": "h1_w2_d1_e9",
      "name": "Reverse Crunch",
      "sets": 10,
      "reps": "10",
      "restSeconds": 40,
      "type": "standard",
      "notes": "Bodyweight HIIT 100s."
     },
     {
      "id": "h1_w2_d1_e10",
      "name": "Crunch",
      "sets": 10,
      "reps": "10",
      "restSeconds": 40,
      "type": "standard",
      "notes": "Bodyweight HIIT 100s."
     },
     {
      "id": "h1_w2_d1_e11",
      "name": "Dead/Curl/Press",
      "sets": 10,
      "reps": "10",
      "restSeconds": 40,
      "type": "standard",
      "notes": "Finisher."
     }
    ]
   },
   {
    "dayNumber": 8,
    "title": "Week 2, Workout 2 (Tue): Legs, Triceps, Calves",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "h1_w2_d2_e1",
      "name": "Squat HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 40,
      "type": "standard",
      "notes": "40s rest."
     },
     {
      "id": "h1_w2_d2_e2",
      "name": "Squat",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM with drop set."
     },
     {
      "id": "h1_w2_d2_e3",
      "name": "Leg Press",
      "sets": 3,
      "reps": "10",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM."
     },
     {
      "id": "h1_w2_d2_e4",
      "name": "Leg Extension",
      "sets": 3,
      "reps": "15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "15 RM work."
     },
     {
      "id": "h1_w2_d2_e5",
      "name": "Leg Curl",
      "sets": 3,
      "reps": "15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "15 RM work."
     },
     {
      "id": "h1_w2_d2_e6",
      "name": "Triceps Pressdown HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 40,
      "type": "standard",
      "notes": "40s rest."
     },
     {
      "id": "h1_w2_d2_e7",
      "name": "Triceps Pressdown",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM with drop set."
     },
     {
      "id": "h1_w2_d2_e8",
      "name": "Lying Triceps Extensions",
      "sets": 3,
      "reps": "15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "15 RM work."
     },
     {
      "id": "h1_w2_d2_e9",
      "name": "Standing Calf Raise HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 40,
      "type": "standard",
      "notes": "40s rest."
     },
     {
      "id": "h1_w2_d2_e10",
      "name": "Standing Calf Raise",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w2_d2_e11",
      "name": "Seated Calf Raise",
      "sets": 3,
      "reps": "15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "15 RM work."
     },
     {
      "id": "h1_w2_d2_e12",
      "name": "Kettlebell Swing",
      "sets": 10,
      "reps": "10",
      "restSeconds": 40,
      "type": "standard",
      "notes": "Finisher."
     }
    ]
   },
   {
    "dayNumber": 9,
    "title": "Week 2, Workout 3 (Wed): Shoulders, Traps, Biceps, Forearms",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "h1_w2_d3_e1",
      "name": "Dumbbell Shoulder Press HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 40,
      "type": "standard",
      "notes": "40s rest."
     },
     {
      "id": "h1_w2_d3_e2",
      "name": "Dumbbell Shoulder Press",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w2_d3_e3",
      "name": "Dumbbell Lateral Raise",
      "sets": 3,
      "reps": "10",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Side delts."
     },
     {
      "id": "h1_w2_d3_e4",
      "name": "Dumbbell Rear Delt Raise",
      "sets": 3,
      "reps": "15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Rear delts."
     },
     {
      "id": "h1_w2_d3_e5",
      "name": "Dumbbell Shrug HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 40,
      "type": "standard",
      "notes": "40s rest."
     },
     {
      "id": "h1_w2_d3_e6",
      "name": "Dumbbell Shrug",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w2_d3_e7",
      "name": "Dumbbell Curl HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 40,
      "type": "standard",
      "notes": "40s rest."
     },
     {
      "id": "h1_w2_d3_e8",
      "name": "Dumbbell Curl",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w2_d3_e9",
      "name": "Incline Dumbbell Curl",
      "sets": 3,
      "reps": "15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "15 RM work."
     },
     {
      "id": "h1_w2_d3_e10",
      "name": "Barbell Wrist Curl HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 40,
      "type": "standard",
      "notes": "40s rest."
     },
     {
      "id": "h1_w2_d3_e11",
      "name": "Barbell Wrist Curl",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w2_d3_e12",
      "name": "Dumbbell Cleans",
      "sets": 10,
      "reps": "10",
      "restSeconds": 40,
      "type": "standard",
      "notes": "Finisher."
     }
    ]
   },
   {
    "dayNumber": 10,
    "title": "Week 2, Workout 4 (Thu): Chest, Back, Abs",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "h1_w2_d4_e1",
      "name": "Bench Press HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 40,
      "type": "standard",
      "notes": "40s rest."
     },
     {
      "id": "h1_w2_d4_e2",
      "name": "Bench Press",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w2_d4_e3",
      "name": "Reverse-Grip Incline Bench Press",
      "sets": 3,
      "reps": "10",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w2_d4_e4",
      "name": "Incline Dumbbell Flye",
      "sets": 3,
      "reps": "15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "15 RM work."
     },
     {
      "id": "h1_w2_d4_e5",
      "name": "Wide-Grip Pulldown HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 40,
      "type": "standard",
      "notes": "40s rest."
     },
     {
      "id": "h1_w2_d4_e6",
      "name": "Wide-Grip Pulldown",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w2_d4_e7",
      "name": "One-Arm Dumbbell Bent-Over Row",
      "sets": 3,
      "reps": "10",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w2_d4_e8",
      "name": "Reverse-Grip Pulldown",
      "sets": 3,
      "reps": "15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "15 RM work."
     },
     {
      "id": "h1_w2_d4_e9",
      "name": "Reverse Crunch",
      "sets": 10,
      "reps": "10",
      "restSeconds": 40,
      "type": "standard",
      "notes": "Abs HIIT 100s."
     },
     {
      "id": "h1_w2_d4_e10",
      "name": "Crunch",
      "sets": 10,
      "reps": "10",
      "restSeconds": 40,
      "type": "standard",
      "notes": "Abs HIIT 100s."
     },
     {
      "id": "h1_w2_d4_e11",
      "name": "Dead/Curl/Press",
      "sets": 10,
      "reps": "10",
      "restSeconds": 40,
      "type": "standard",
      "notes": "Finisher."
     }
    ]
   },
   {
    "dayNumber": 11,
    "title": "Week 2, Workout 5 (Fri): Legs, Triceps, Calves",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "h1_w2_d5_e1",
      "name": "Squat HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 40,
      "type": "standard",
      "notes": "40s rest."
     },
     {
      "id": "h1_w2_d5_e2",
      "name": "Squat",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w2_d5_e3",
      "name": "Dumbbell Lunge",
      "sets": 3,
      "reps": "10",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w2_d5_e4",
      "name": "Leg Extension",
      "sets": 3,
      "reps": "15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "15 RM work."
     },
     {
      "id": "h1_w2_d5_e5",
      "name": "Romanian Deadlift",
      "sets": 3,
      "reps": "15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "15 RM work."
     },
     {
      "id": "h1_w2_d5_e6",
      "name": "Triceps Pressdown HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 40,
      "type": "standard",
      "notes": "40s rest."
     },
     {
      "id": "h1_w2_d5_e7",
      "name": "Triceps Pressdown",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w2_d5_e8",
      "name": "Cable Overhead Triceps Extension",
      "sets": 3,
      "reps": "15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "15 RM work."
     },
     {
      "id": "h1_w2_d5_e9",
      "name": "Standing Calf Raise HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 40,
      "type": "standard",
      "notes": "40s rest."
     },
     {
      "id": "h1_w2_d5_e10",
      "name": "Standing Calf Raise",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w2_d5_e11",
      "name": "Seated Calf Raise",
      "sets": 3,
      "reps": "15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "15 RM work."
     },
     {
      "id": "h1_w2_d5_e12",
      "name": "Barbell Wrist Curl HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 40,
      "type": "standard",
      "notes": "40s rest."
     },
     {
      "id": "h1_w2_d5_e13",
      "name": "Barbell Wrist Curl",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w2_d5_e14",
      "name": "Kettlebell Swing",
      "sets": 10,
      "reps": "10",
      "restSeconds": 40,
      "type": "standard",
      "notes": "Finisher."
     },
     {
      "id": "h1_w2_d5_e15",
      "name": "Dumbbell Cleans",
      "sets": 10,
      "reps": "10",
      "restSeconds": 40,
      "type": "standard",
      "notes": "Finisher."
     }
    ]
   },
   {
    "dayNumber": 12,
    "title": "Week 2, Workout 6 (Sat): Shoulders, Traps, Biceps, Forearms",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "h1_w2_d6_e1",
      "name": "Dumbbell Shoulder Press HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 40,
      "type": "standard",
      "notes": "40s rest."
     },
     {
      "id": "h1_w2_d6_e2",
      "name": "Dumbbell Shoulder Press",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w2_d6_e3",
      "name": "One-Arm Cable Lateral Raise",
      "sets": 3,
      "reps": "10",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Side delts."
     },
     {
      "id": "h1_w2_d6_e4",
      "name": "Machine Rear Delt Flye",
      "sets": 3,
      "reps": "15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Rear delts."
     },
     {
      "id": "h1_w2_d6_e5",
      "name": "Dumbbell Shrug HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 40,
      "type": "standard",
      "notes": "40s rest."
     },
     {
      "id": "h1_w2_d6_e6",
      "name": "Dumbbell Shrug",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w2_d6_e7",
      "name": "Dumbbell Curl HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 40,
      "type": "standard",
      "notes": "40s rest."
     },
     {
      "id": "h1_w2_d6_e8",
      "name": "Dumbbell Curl",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w2_d6_e9",
      "name": "Behind-the-Back Cable Curl",
      "sets": 3,
      "reps": "15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "15 RM work."
     },
     {
      "id": "h1_w2_d6_e10",
      "name": "Barbell Wrist Curl HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 40,
      "type": "standard",
      "notes": "40s rest."
     },
     {
      "id": "h1_w2_d6_e11",
      "name": "Barbell Wrist Curl",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w2_d6_e12",
      "name": "Dumbbell Cleans",
      "sets": 10,
      "reps": "10",
      "restSeconds": 40,
      "type": "standard",
      "notes": "Finisher."
     }
    ]
   },
   {
    "dayNumber": 13,
    "title": "Week 3, Workout 1 (Mon): Chest, Back, Abs",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "h1_w3_d1_e1",
      "name": "Bench Press HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Rest drops to 30 seconds in Week 3."
     },
     {
      "id": "h1_w3_d1_e2",
      "name": "Bench Press",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w3_d1_e3",
      "name": "Dumbbell Incline Press",
      "sets": 3,
      "reps": "12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "12 RM work."
     },
     {
      "id": "h1_w3_d1_e4",
      "name": "Cable Crossover",
      "sets": 3,
      "reps": "20",
      "restSeconds": 60,
      "type": "standard",
      "notes": "20 RM work."
     },
     {
      "id": "h1_w3_d1_e5",
      "name": "Wide-Grip Pulldown HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 30,
      "type": "standard",
      "notes": "30s rest."
     },
     {
      "id": "h1_w3_d1_e6",
      "name": "Wide-Grip Pulldown",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w3_d1_e7",
      "name": "Barbell Bent-Over Row",
      "sets": 3,
      "reps": "12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "12 RM work."
     },
     {
      "id": "h1_w3_d1_e8",
      "name": "Straight-Arm Pulldown",
      "sets": 3,
      "reps": "20",
      "restSeconds": 60,
      "type": "standard",
      "notes": "20 RM work."
     },
     {
      "id": "h1_w3_d1_e9",
      "name": "Reverse Crunch",
      "sets": 10,
      "reps": "10",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Bodyweight HIIT 100s."
     },
     {
      "id": "h1_w3_d1_e10",
      "name": "Crunch",
      "sets": 10,
      "reps": "10",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Bodyweight HIIT 100s."
     },
     {
      "id": "h1_w3_d1_e11",
      "name": "Dead/Curl/Press",
      "sets": 10,
      "reps": "10",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Finisher."
     }
    ]
   },
   {
    "dayNumber": 14,
    "title": "Week 3, Workout 2 (Tue): Legs, Triceps, Calves",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "h1_w3_d2_e1",
      "name": "Squat HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 30,
      "type": "standard",
      "notes": "30s rest."
     },
     {
      "id": "h1_w3_d2_e2",
      "name": "Squat",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w3_d2_e3",
      "name": "Leg Press",
      "sets": 3,
      "reps": "12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "12 RM work."
     },
     {
      "id": "h1_w3_d2_e4",
      "name": "Leg Extension",
      "sets": 3,
      "reps": "20",
      "restSeconds": 60,
      "type": "standard",
      "notes": "20 RM work."
     },
     {
      "id": "h1_w3_d2_e5",
      "name": "Leg Curl",
      "sets": 3,
      "reps": "20",
      "restSeconds": 60,
      "type": "standard",
      "notes": "20 RM work."
     },
     {
      "id": "h1_w3_d2_e6",
      "name": "Triceps Pressdown HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 30,
      "type": "standard",
      "notes": "30s rest."
     },
     {
      "id": "h1_w3_d2_e7",
      "name": "Triceps Pressdown",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w3_d2_e8",
      "name": "Lying Triceps Extensions",
      "sets": 3,
      "reps": "20",
      "restSeconds": 60,
      "type": "standard",
      "notes": "20 RM work."
     },
     {
      "id": "h1_w3_d2_e9",
      "name": "Standing Calf Raise HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 30,
      "type": "standard",
      "notes": "30s rest."
     },
     {
      "id": "h1_w3_d2_e10",
      "name": "Standing Calf Raise",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w3_d2_e11",
      "name": "Seated Calf Raise",
      "sets": 3,
      "reps": "20",
      "restSeconds": 60,
      "type": "standard",
      "notes": "20 RM work."
     },
     {
      "id": "h1_w3_d2_e12",
      "name": "Kettlebell Swing",
      "sets": 10,
      "reps": "10",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Finisher."
     }
    ]
   },
   {
    "dayNumber": 15,
    "title": "Week 3, Workout 3 (Wed): Shoulders, Traps, Biceps, Forearms",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "h1_w3_d3_e1",
      "name": "Dumbbell Shoulder Press HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 30,
      "type": "standard",
      "notes": "30s rest."
     },
     {
      "id": "h1_w3_d3_e2",
      "name": "Dumbbell Shoulder Press",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w3_d3_e3",
      "name": "Dumbbell Lateral Raise",
      "sets": 3,
      "reps": "12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "12 RM work."
     },
     {
      "id": "h1_w3_d3_e4",
      "name": "Dumbbell Rear Delt Raise",
      "sets": 3,
      "reps": "20",
      "restSeconds": 60,
      "type": "standard",
      "notes": "20 RM work."
     },
     {
      "id": "h1_w3_d3_e5",
      "name": "Dumbbell Shrug HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 30,
      "type": "standard",
      "notes": "30s rest."
     },
     {
      "id": "h1_w3_d3_e6",
      "name": "Dumbbell Shrug",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w3_d3_e7",
      "name": "Dumbbell Curl HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 30,
      "type": "standard",
      "notes": "30s rest."
     },
     {
      "id": "h1_w3_d3_e8",
      "name": "Dumbbell Curl",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w3_d3_e9",
      "name": "Incline Dumbbell Curl",
      "sets": 3,
      "reps": "20",
      "restSeconds": 60,
      "type": "standard",
      "notes": "20 RM work."
     },
     {
      "id": "h1_w3_d3_e10",
      "name": "Barbell Wrist Curl HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 30,
      "type": "standard",
      "notes": "30s rest."
     },
     {
      "id": "h1_w3_d3_e11",
      "name": "Barbell Wrist Curl",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w3_d3_e12",
      "name": "Dumbbell Cleans",
      "sets": 10,
      "reps": "10",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Finisher."
     }
    ]
   },
   {
    "dayNumber": 16,
    "title": "Week 3, Workout 4 (Thu): Chest, Back, Abs",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "h1_w3_d4_e1",
      "name": "Bench Press HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 30,
      "type": "standard",
      "notes": "30s rest."
     },
     {
      "id": "h1_w3_d4_e2",
      "name": "Bench Press",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w3_d4_e3",
      "name": "Reverse-Grip Incline Bench Press",
      "sets": 3,
      "reps": "12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "12 RM work."
     },
     {
      "id": "h1_w3_d4_e4",
      "name": "Incline Dumbbell Flye",
      "sets": 3,
      "reps": "20",
      "restSeconds": 60,
      "type": "standard",
      "notes": "20 RM work."
     },
     {
      "id": "h1_w3_d4_e5",
      "name": "Wide-Grip Pulldown HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 30,
      "type": "standard",
      "notes": "30s rest."
     },
     {
      "id": "h1_w3_d4_e6",
      "name": "Wide-Grip Pulldown",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w3_d4_e7",
      "name": "One-Arm Dumbbell Bent-Over Row",
      "sets": 3,
      "reps": "12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "12 RM work."
     },
     {
      "id": "h1_w3_d4_e8",
      "name": "Reverse-Grip Pulldown",
      "sets": 3,
      "reps": "20",
      "restSeconds": 60,
      "type": "standard",
      "notes": "20 RM work."
     },
     {
      "id": "h1_w3_d4_e9",
      "name": "Reverse Crunch",
      "sets": 10,
      "reps": "10",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Abs HIIT 100s."
     },
     {
      "id": "h1_w3_d4_e10",
      "name": "Crunch",
      "sets": 10,
      "reps": "10",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Abs HIIT 100s."
     },
     {
      "id": "h1_w3_d4_e11",
      "name": "Dead/Curl/Press",
      "sets": 10,
      "reps": "10",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Finisher."
     }
    ]
   },
   {
    "dayNumber": 17,
    "title": "Week 3, Workout 5 (Fri): Legs, Triceps, Calves",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "h1_w3_d5_e1",
      "name": "Squat HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 30,
      "type": "standard",
      "notes": "30s rest."
     },
     {
      "id": "h1_w3_d5_e2",
      "name": "Squat",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w3_d5_e3",
      "name": "Dumbbell Lunge",
      "sets": 3,
      "reps": "12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "12 RM work."
     },
     {
      "id": "h1_w3_d5_e4",
      "name": "Leg Extension",
      "sets": 3,
      "reps": "20",
      "restSeconds": 60,
      "type": "standard",
      "notes": "20 RM work."
     },
     {
      "id": "h1_w3_d5_e5",
      "name": "Romanian Deadlift",
      "sets": 3,
      "reps": "20",
      "restSeconds": 60,
      "type": "standard",
      "notes": "20 RM work."
     },
     {
      "id": "h1_w3_d5_e6",
      "name": "Triceps Pressdown HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 30,
      "type": "standard",
      "notes": "30s rest."
     },
     {
      "id": "h1_w3_d5_e7",
      "name": "Triceps Pressdown",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w3_d5_e8",
      "name": "Cable Overhead Triceps Extension",
      "sets": 3,
      "reps": "20",
      "restSeconds": 60,
      "type": "standard",
      "notes": "20 RM work."
     },
     {
      "id": "h1_w3_d5_e9",
      "name": "Standing Calf Raise HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 30,
      "type": "standard",
      "notes": "30s rest."
     },
     {
      "id": "h1_w3_d5_e10",
      "name": "Standing Calf Raise",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w3_d5_e11",
      "name": "Seated Calf Raise",
      "sets": 3,
      "reps": "20",
      "restSeconds": 60,
      "type": "standard",
      "notes": "20 RM work."
     },
     {
      "id": "h1_w3_d5_e12",
      "name": "Kettlebell Swing",
      "sets": 10,
      "reps": "10",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Finisher."
     }
    ]
   },
   {
    "dayNumber": 18,
    "title": "Week 3, Workout 6 (Sat): Shoulders, Traps, Biceps, Forearms",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "h1_w3_d6_e1",
      "name": "Dumbbell Shoulder Press HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 30,
      "type": "standard",
      "notes": "30s rest."
     },
     {
      "id": "h1_w3_d6_e2",
      "name": "Dumbbell Shoulder Press",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w3_d6_e3",
      "name": "One-Arm Cable Lateral Raise",
      "sets": 3,
      "reps": "12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "12 RM work."
     },
     {
      "id": "h1_w3_d6_e4",
      "name": "Machine Rear Delt Flye",
      "sets": 3,
      "reps": "20",
      "restSeconds": 60,
      "type": "standard",
      "notes": "20 RM work."
     },
     {
      "id": "h1_w3_d6_e5",
      "name": "Dumbbell Shrug HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 30,
      "type": "standard",
      "notes": "30s rest."
     },
     {
      "id": "h1_w3_d6_e6",
      "name": "Dumbbell Shrug",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w3_d6_e7",
      "name": "Dumbbell Curl HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 30,
      "type": "standard",
      "notes": "30s rest."
     },
     {
      "id": "h1_w3_d6_e8",
      "name": "Dumbbell Curl",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w3_d6_e9",
      "name": "Behind-the-Back Cable Curl",
      "sets": 3,
      "reps": "20",
      "restSeconds": 60,
      "type": "standard",
      "notes": "20 RM work."
     },
     {
      "id": "h1_w3_d6_e10",
      "name": "Barbell Wrist Curl HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 30,
      "type": "standard",
      "notes": "30s rest."
     },
     {
      "id": "h1_w3_d6_e11",
      "name": "Barbell Wrist Curl",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w3_d6_e12",
      "name": "Dumbbell Cleans",
      "sets": 10,
      "reps": "10",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Finisher."
     }
    ]
   },
   {
    "dayNumber": 19,
    "title": "Week 4, Workout 1 (Mon): Chest, Back, Abs",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "h1_w4_d1_e1",
      "name": "Bench Press HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 20,
      "type": "standard",
      "notes": "Rest drops to 20 seconds in Week 4."
     },
     {
      "id": "h1_w4_d1_e2",
      "name": "Bench Press",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w4_d1_e3",
      "name": "Dumbbell Incline Press",
      "sets": 3,
      "reps": "12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "12 RM work."
     },
     {
      "id": "h1_w4_d1_e4",
      "name": "Cable Crossover",
      "sets": 3,
      "reps": "20",
      "restSeconds": 60,
      "type": "standard",
      "notes": "20 RM work."
     },
     {
      "id": "h1_w4_d1_e5",
      "name": "Wide-Grip Pulldown HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 20,
      "type": "standard",
      "notes": "20s rest."
     },
     {
      "id": "h1_w4_d1_e6",
      "name": "Wide-Grip Pulldown",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w4_d1_e7",
      "name": "Barbell Bent-Over Row",
      "sets": 3,
      "reps": "12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "12 RM work."
     },
     {
      "id": "h1_w4_d1_e8",
      "name": "Straight-Arm Pulldown",
      "sets": 3,
      "reps": "20",
      "restSeconds": 60,
      "type": "standard",
      "notes": "20 RM work."
     },
     {
      "id": "h1_w4_d1_e9",
      "name": "Reverse Crunch",
      "sets": 10,
      "reps": "10",
      "restSeconds": 20,
      "type": "standard",
      "notes": "Abs HIIT 100s."
     },
     {
      "id": "h1_w4_d1_e10",
      "name": "Crunch",
      "sets": 10,
      "reps": "10",
      "restSeconds": 20,
      "type": "standard",
      "notes": "Abs HIIT 100s."
     },
     {
      "id": "h1_w4_d1_e11",
      "name": "Dead/Curl/Press",
      "sets": 10,
      "reps": "10",
      "restSeconds": 20,
      "type": "standard",
      "notes": "Finisher."
     }
    ]
   },
   {
    "dayNumber": 20,
    "title": "Week 4, Workout 2 (Tue): Legs, Triceps, Calves",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "h1_w4_d2_e1",
      "name": "Squat HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 20,
      "type": "standard",
      "notes": "20s rest."
     },
     {
      "id": "h1_w4_d2_e2",
      "name": "Squat",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w4_d2_e3",
      "name": "Leg Press",
      "sets": 3,
      "reps": "12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "12 RM work."
     },
     {
      "id": "h1_w4_d2_e4",
      "name": "Leg Extension",
      "sets": 3,
      "reps": "20",
      "restSeconds": 60,
      "type": "standard",
      "notes": "20 RM work."
     },
     {
      "id": "h1_w4_d2_e5",
      "name": "Leg Curl",
      "sets": 3,
      "reps": "20",
      "restSeconds": 60,
      "type": "standard",
      "notes": "20 RM work."
     },
     {
      "id": "h1_w4_d2_e6",
      "name": "Triceps Pressdown HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 20,
      "type": "standard",
      "notes": "20s rest."
     },
     {
      "id": "h1_w4_d2_e7",
      "name": "Triceps Pressdown",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w4_d2_e8",
      "name": "Lying Triceps Extensions",
      "sets": 3,
      "reps": "20",
      "restSeconds": 60,
      "type": "standard",
      "notes": "20 RM work."
     },
     {
      "id": "h1_w4_d2_e9",
      "name": "Standing Calf Raise HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 20,
      "type": "standard",
      "notes": "20s rest."
     },
     {
      "id": "h1_w4_d2_e10",
      "name": "Standing Calf Raise",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w4_d2_e11",
      "name": "Seated Calf Raise",
      "sets": 3,
      "reps": "20",
      "restSeconds": 60,
      "type": "standard",
      "notes": "20 RM work."
     },
     {
      "id": "h1_w4_d2_e12",
      "name": "Kettlebell Swing",
      "sets": 10,
      "reps": "10",
      "restSeconds": 20,
      "type": "standard",
      "notes": "Finisher."
     }
    ]
   },
   {
    "dayNumber": 21,
    "title": "Week 4, Workout 3 (Wed): Shoulders, Traps, Biceps, Forearms",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "h1_w4_d3_e1",
      "name": "Dumbbell Shoulder Press HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 20,
      "type": "standard",
      "notes": "20s rest."
     },
     {
      "id": "h1_w4_d3_e2",
      "name": "Dumbbell Shoulder Press",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w4_d3_e3",
      "name": "Dumbbell Lateral Raise",
      "sets": 3,
      "reps": "12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "12 RM work."
     },
     {
      "id": "h1_w4_d3_e4",
      "name": "Dumbbell Rear Delt Raise",
      "sets": 3,
      "reps": "20",
      "restSeconds": 60,
      "type": "standard",
      "notes": "20 RM work."
     },
     {
      "id": "h1_w4_d3_e5",
      "name": "Dumbbell Shrug HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 20,
      "type": "standard",
      "notes": "20s rest."
     },
     {
      "id": "h1_w4_d3_e6",
      "name": "Dumbbell Shrug",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w4_d3_e7",
      "name": "Dumbbell Curl HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 20,
      "type": "standard",
      "notes": "20s rest."
     },
     {
      "id": "h1_w4_d3_e8",
      "name": "Dumbbell Curl",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w4_d3_e9",
      "name": "Incline Dumbbell Curl",
      "sets": 3,
      "reps": "20",
      "restSeconds": 60,
      "type": "standard",
      "notes": "20 RM work."
     },
     {
      "id": "h1_w4_d3_e10",
      "name": "Barbell Wrist Curl HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 20,
      "type": "standard",
      "notes": "20s rest."
     },
     {
      "id": "h1_w4_d3_e11",
      "name": "Barbell Wrist Curl",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w4_d3_e12",
      "name": "Dumbbell Cleans",
      "sets": 10,
      "reps": "10",
      "restSeconds": 20,
      "type": "standard",
      "notes": "Finisher."
     }
    ]
   },
   {
    "dayNumber": 22,
    "title": "Week 4, Workout 4 (Thu): Chest, Back, Abs",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "h1_w4_d4_e1",
      "name": "Bench Press HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 20,
      "type": "standard",
      "notes": "20s rest."
     },
     {
      "id": "h1_w4_d4_e2",
      "name": "Bench Press",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w4_d4_e3",
      "name": "Reverse-Grip Incline Bench Press",
      "sets": 3,
      "reps": "12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "12 RM work."
     },
     {
      "id": "h1_w4_d4_e4",
      "name": "Incline Dumbbell Flye",
      "sets": 3,
      "reps": "20",
      "restSeconds": 60,
      "type": "standard",
      "notes": "20 RM work."
     },
     {
      "id": "h1_w4_d4_e5",
      "name": "Wide-Grip Pulldown HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 20,
      "type": "standard",
      "notes": "20s rest."
     },
     {
      "id": "h1_w4_d4_e6",
      "name": "Wide-Grip Pulldown",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w4_d4_e7",
      "name": "One-Arm Dumbbell Bent-Over Row",
      "sets": 3,
      "reps": "12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "12 RM work."
     },
     {
      "id": "h1_w4_d4_e8",
      "name": "Reverse-Grip Pulldown",
      "sets": 3,
      "reps": "20",
      "restSeconds": 60,
      "type": "standard",
      "notes": "20 RM work."
     },
     {
      "id": "h1_w4_d4_e9",
      "name": "Reverse Crunch",
      "sets": 10,
      "reps": "10",
      "restSeconds": 20,
      "type": "standard",
      "notes": "Abs HIIT 100s."
     },
     {
      "id": "h1_w4_d4_e10",
      "name": "Crunch",
      "sets": 10,
      "reps": "10",
      "restSeconds": 20,
      "type": "standard",
      "notes": "Abs HIIT 100s."
     },
     {
      "id": "h1_w4_d4_e11",
      "name": "Dead/Curl/Press",
      "sets": 10,
      "reps": "10",
      "restSeconds": 20,
      "type": "standard",
      "notes": "Finisher."
     }
    ]
   },
   {
    "dayNumber": 23,
    "title": "Week 4, Workout 5 (Fri): Legs, Triceps, Calves",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "h1_w4_d5_e1",
      "name": "Squat HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 20,
      "type": "standard",
      "notes": "20s rest."
     },
     {
      "id": "h1_w4_d5_e2",
      "name": "Squat",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w4_d5_e3",
      "name": "Dumbbell Lunge",
      "sets": 3,
      "reps": "12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "12 RM work."
     },
     {
      "id": "h1_w4_d5_e4",
      "name": "Leg Extension",
      "sets": 3,
      "reps": "20",
      "restSeconds": 60,
      "type": "standard",
      "notes": "20 RM work."
     },
     {
      "id": "h1_w4_d5_e5",
      "name": "Romanian Deadlift",
      "sets": 3,
      "reps": "20",
      "restSeconds": 60,
      "type": "standard",
      "notes": "20 RM work."
     },
     {
      "id": "h1_w4_d5_e6",
      "name": "Triceps Pressdown HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 20,
      "type": "standard",
      "notes": "20s rest."
     },
     {
      "id": "h1_w4_d5_e7",
      "name": "Triceps Pressdown",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w4_d5_e8",
      "name": "Cable Overhead Triceps Extension",
      "sets": 3,
      "reps": "20",
      "restSeconds": 60,
      "type": "standard",
      "notes": "20 RM work."
     },
     {
      "id": "h1_w4_d5_e9",
      "name": "Standing Calf Raise HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 20,
      "type": "standard",
      "notes": "20s rest."
     },
     {
      "id": "h1_w4_d5_e10",
      "name": "Standing Calf Raise",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w4_d5_e11",
      "name": "Seated Calf Raise",
      "sets": 3,
      "reps": "20",
      "restSeconds": 30,
      "type": "standard",
      "notes": "20 RM work."
     },
     {
      "id": "h1_w4_d5_e12",
      "name": "Kettlebell Swing",
      "sets": 10,
      "reps": "10",
      "restSeconds": 20,
      "type": "standard",
      "notes": "Finisher."
     }
    ]
   },
   {
    "dayNumber": 24,
    "title": "Week 4, Workout 6 (Sat): Shoulders, Traps, Biceps, Forearms",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "h1_w4_d6_e1",
      "name": "Dumbbell Shoulder Press HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 20,
      "type": "standard",
      "notes": "20s rest."
     },
     {
      "id": "h1_w4_d6_e2",
      "name": "Dumbbell Shoulder Press",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w4_d6_e3",
      "name": "One-Arm Cable Lateral Raise",
      "sets": 3,
      "reps": "12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "12 RM work."
     },
     {
      "id": "h1_w4_d6_e4",
      "name": "Machine Rear Delt Flye",
      "sets": 3,
      "reps": "20",
      "restSeconds": 60,
      "type": "standard",
      "notes": "20 RM work."
     },
     {
      "id": "h1_w4_d6_e5",
      "name": "Dumbbell Shrug HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 20,
      "type": "standard",
      "notes": "20s rest."
     },
     {
      "id": "h1_w4_d6_e6",
      "name": "Dumbbell Shrug",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w4_d6_e7",
      "name": "Dumbbell Curl HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 20,
      "type": "standard",
      "notes": "20s rest."
     },
     {
      "id": "h1_w4_d6_e8",
      "name": "Dumbbell Curl",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w4_d6_e9",
      "name": "Behind-the-Back Cable Curl",
      "sets": 3,
      "reps": "20",
      "restSeconds": 60,
      "type": "standard",
      "notes": "20 RM work."
     },
     {
      "id": "h1_w4_d6_e10",
      "name": "Barbell Wrist Curl HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 20,
      "type": "standard",
      "notes": "20s rest."
     },
     {
      "id": "h1_w4_d6_e11",
      "name": "Barbell Wrist Curl",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w4_d6_e12",
      "name": "Dumbbell Cleans",
      "sets": 10,
      "reps": "10",
      "restSeconds": 20,
      "type": "standard",
      "notes": "Finisher."
     }
    ]
   },
   {
    "dayNumber": 25,
    "title": "Week 5, Workout 1 (Mon): Chest, Back, Abs",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "h1_w5_d1_e1",
      "name": "Squat HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 10,
      "type": "standard",
      "notes": "Rest drops to 10 seconds in Week 5."
     },
     {
      "id": "h1_w5_d1_e2",
      "name": "Squat",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w5_d1_e3",
      "name": "Leg Press",
      "sets": 3,
      "reps": "15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "15 RM work."
     },
     {
      "id": "h1_w5_d1_e4",
      "name": "Leg Extension",
      "sets": 3,
      "reps": "30",
      "restSeconds": 60,
      "type": "standard",
      "notes": "30 RM work."
     },
     {
      "id": "h1_w5_d1_e5",
      "name": "Leg Curl",
      "sets": 3,
      "reps": "30",
      "restSeconds": 60,
      "type": "standard",
      "notes": "30 RM work."
     },
     {
      "id": "h1_w5_d1_e6",
      "name": "Triceps Pressdown HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 10,
      "type": "standard",
      "notes": "10s rest."
     },
     {
      "id": "h1_w5_d1_e7",
      "name": "Triceps Pressdown",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w5_d1_e8",
      "name": "Lying Triceps Extensions",
      "sets": 3,
      "reps": "30",
      "restSeconds": 60,
      "type": "standard",
      "notes": "30 RM work."
     },
     {
      "id": "h1_w5_d1_e9",
      "name": "Standing Calf Raise HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 10,
      "type": "standard",
      "notes": "10s rest."
     },
     {
      "id": "h1_w5_d1_e10",
      "name": "Standing Calf Raise",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w5_d1_e11",
      "name": "Seated Calf Raise",
      "sets": 3,
      "reps": "30",
      "restSeconds": 60,
      "type": "standard",
      "notes": "30 RM work."
     },
     {
      "id": "h1_w5_d1_e12",
      "name": "Kettlebell Swing",
      "sets": 10,
      "reps": "10",
      "restSeconds": 10,
      "type": "standard",
      "notes": "Finisher."
     }
    ]
   },
   {
    "dayNumber": 26,
    "title": "Week 5, Workout 2 (Tue): Legs, Triceps, Calves",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "h1_w5_d2_e1",
      "name": "Bench Press HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 10,
      "type": "standard",
      "notes": "10s rest."
     },
     {
      "id": "h1_w5_d2_e2",
      "name": "Bench Press",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w5_d2_e3",
      "name": "Dumbbell Incline Press",
      "sets": 3,
      "reps": "15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "15 RM work."
     },
     {
      "id": "h1_w5_d2_e4",
      "name": "Cable Crossover",
      "sets": 3,
      "reps": "30",
      "restSeconds": 60,
      "type": "standard",
      "notes": "30 RM work."
     },
     {
      "id": "h1_w5_d2_e5",
      "name": "Wide-Grip Pulldown HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 10,
      "type": "standard",
      "notes": "10s rest."
     },
     {
      "id": "h1_w5_d2_e6",
      "name": "Wide-Grip Pulldown",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w5_d2_e7",
      "name": "Barbell Bent-Over Row",
      "sets": 3,
      "reps": "15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "15 RM work."
     },
     {
      "id": "h1_w5_d2_e8",
      "name": "Straight-Arm Pulldown",
      "sets": 3,
      "reps": "30",
      "restSeconds": 60,
      "type": "standard",
      "notes": "30 RM work."
     },
     {
      "id": "h1_w5_d2_e9",
      "name": "Reverse Crunch",
      "sets": 10,
      "reps": "10",
      "restSeconds": 10,
      "type": "standard",
      "notes": "Abs HIIT 100s."
     },
     {
      "id": "h1_w5_d2_e10",
      "name": "Crunch",
      "sets": 10,
      "reps": "10",
      "restSeconds": 10,
      "type": "standard",
      "notes": "Abs HIIT 100s."
     },
     {
      "id": "h1_w5_d2_e11",
      "name": "Dead/Curl/Press",
      "sets": 10,
      "reps": "10",
      "restSeconds": 10,
      "type": "standard",
      "notes": "Finisher."
     }
    ]
   },
   {
    "dayNumber": 27,
    "title": "Week 5, Workout 3 (Wed): Shoulders, Traps, Biceps, Forearms",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "h1_w5_d3_e1",
      "name": "Dumbbell Shoulder Press HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 10,
      "type": "standard",
      "notes": "10s rest."
     },
     {
      "id": "h1_w5_d3_e2",
      "name": "Dumbbell Shoulder Press",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w5_d3_e3",
      "name": "Dumbbell Lateral Raise",
      "sets": 3,
      "reps": "15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "15 RM work."
     },
     {
      "id": "h1_w5_d3_e4",
      "name": "Dumbbell Rear Delt Raise",
      "sets": 3,
      "reps": "30",
      "restSeconds": 60,
      "type": "standard",
      "notes": "30 RM work."
     },
     {
      "id": "h1_w5_d3_e5",
      "name": "Dumbbell Shrug HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 10,
      "type": "standard",
      "notes": "10s rest."
     },
     {
      "id": "h1_w5_d3_e6",
      "name": "Dumbbell Shrug",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w5_d3_e7",
      "name": "Dumbbell Curl HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 10,
      "type": "standard",
      "notes": "10s rest."
     },
     {
      "id": "h1_w5_d3_e8",
      "name": "Dumbbell Curl",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w5_d3_e9",
      "name": "Incline Dumbbell Curl",
      "sets": 3,
      "reps": "30",
      "restSeconds": 60,
      "type": "standard",
      "notes": "30 RM work."
     },
     {
      "id": "h1_w5_d3_e10",
      "name": "Barbell Wrist Curl HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 10,
      "type": "standard",
      "notes": "10s rest."
     },
     {
      "id": "h1_w5_d3_e11",
      "name": "Barbell Wrist Curl",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w5_d3_e12",
      "name": "Dumbbell Cleans",
      "sets": 10,
      "reps": "10",
      "restSeconds": 10,
      "type": "standard",
      "notes": "Finisher."
     }
    ]
   },
   {
    "dayNumber": 28,
    "title": "Week 5, Workout 4 (Thu): Chest, Back, Abs",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "h1_w5_d4_e1",
      "name": "Bench Press HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 10,
      "type": "standard",
      "notes": "10s rest."
     },
     {
      "id": "h1_w5_d4_e2",
      "name": "Bench Press",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w5_d4_e3",
      "name": "Reverse-Grip Incline Bench Press",
      "sets": 3,
      "reps": "15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "15 RM work."
     },
     {
      "id": "h1_w5_d4_e4",
      "name": "Incline Dumbbell Flye",
      "sets": 3,
      "reps": "30",
      "restSeconds": 60,
      "type": "standard",
      "notes": "30 RM work."
     },
     {
      "id": "h1_w5_d4_e5",
      "name": "Wide-Grip Pulldown HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 10,
      "type": "standard",
      "notes": "10s rest."
     },
     {
      "id": "h1_w5_d4_e6",
      "name": "Wide-Grip Pulldown",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 30,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w5_d4_e7",
      "name": "One-Arm Dumbbell Bent-Over Row",
      "sets": 3,
      "reps": "15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "15 RM work."
     },
     {
      "id": "h1_w5_d4_e8",
      "name": "Reverse-Grip Pulldown",
      "sets": 3,
      "reps": "30",
      "restSeconds": 60,
      "type": "standard",
      "notes": "30 RM work."
     },
     {
      "id": "h1_w5_d4_e9",
      "name": "Reverse Crunch",
      "sets": 10,
      "reps": "10",
      "restSeconds": 10,
      "type": "standard",
      "notes": "Abs HIIT 100s."
     },
     {
      "id": "h1_w5_d4_e10",
      "name": "Crunch",
      "sets": 10,
      "reps": "10",
      "restSeconds": 10,
      "type": "standard",
      "notes": "Abs HIIT 100s."
     },
     {
      "id": "h1_w5_d4_e11",
      "name": "Dead/Curl/Press",
      "sets": 10,
      "reps": "10",
      "restSeconds": 10,
      "type": "standard",
      "notes": "Finisher."
     }
    ]
   },
   {
    "dayNumber": 29,
    "title": "Week 5, Workout 5 (Fri): Legs, Triceps, Calves",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "h1_w5_d5_e1",
      "name": "Squat HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 10,
      "type": "standard",
      "notes": "10s rest."
     },
     {
      "id": "h1_w5_d5_e2",
      "name": "Squat",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w5_d5_e3",
      "name": "Dumbbell Lunge",
      "sets": 3,
      "reps": "15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "15 RM work."
     },
     {
      "id": "h1_w5_d5_e4",
      "name": "Leg Extension",
      "sets": 3,
      "reps": "30",
      "restSeconds": 60,
      "type": "standard",
      "notes": "30 RM work."
     },
     {
      "id": "h1_w5_d5_e5",
      "name": "Romanian Deadlift",
      "sets": 3,
      "reps": "30",
      "restSeconds": 60,
      "type": "standard",
      "notes": "30 RM work."
     },
     {
      "id": "h1_w5_d5_e6",
      "name": "Triceps Pressdown HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 10,
      "type": "standard",
      "notes": "10s rest."
     },
     {
      "id": "h1_w5_d5_e7",
      "name": "Triceps Pressdown",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w5_d5_e8",
      "name": "Cable Overhead Triceps Extension",
      "sets": 3,
      "reps": "30",
      "restSeconds": 60,
      "type": "standard",
      "notes": "30 RM work."
     },
     {
      "id": "h1_w5_d5_e9",
      "name": "Standing Calf Raise HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 10,
      "type": "standard",
      "notes": "10s rest."
     },
     {
      "id": "h1_w5_d5_e10",
      "name": "Standing Calf Raise",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w5_d5_e11",
      "name": "Seated Calf Raise",
      "sets": 3,
      "reps": "30",
      "restSeconds": 30,
      "type": "standard",
      "notes": "30 RM work."
     },
     {
      "id": "h1_w5_d5_e12",
      "name": "Kettlebell Swing",
      "sets": 10,
      "reps": "10",
      "restSeconds": 10,
      "type": "standard",
      "notes": "Finisher."
     }
    ]
   },
   {
    "dayNumber": 30,
    "title": "Week 5, Workout 6 (Sat): Shoulders, Traps, Biceps, Forearms",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "h1_w5_d6_e1",
      "name": "Dumbbell Shoulder Press HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 10,
      "type": "standard",
      "notes": "10s rest."
     },
     {
      "id": "h1_w5_d6_e2",
      "name": "Dumbbell Shoulder Press",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w5_d6_e3",
      "name": "One-Arm Cable Lateral Raise",
      "sets": 3,
      "reps": "15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "15 RM work."
     },
     {
      "id": "h1_w5_d6_e4",
      "name": "Machine Rear Delt Flye",
      "sets": 3,
      "reps": "30",
      "restSeconds": 60,
      "type": "standard",
      "notes": "30 RM work."
     },
     {
      "id": "h1_w5_d6_e5",
      "name": "Dumbbell Shrug HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 10,
      "type": "standard",
      "notes": "10s rest."
     },
     {
      "id": "h1_w5_d6_e6",
      "name": "Dumbbell Shrug",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w5_d6_e7",
      "name": "Dumbbell Curl HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 10,
      "type": "standard",
      "notes": "10s rest."
     },
     {
      "id": "h1_w5_d6_e8",
      "name": "Dumbbell Curl",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w5_d6_e9",
      "name": "Behind-the-Back Cable Curl",
      "sets": 3,
      "reps": "30",
      "restSeconds": 60,
      "type": "standard",
      "notes": "30 RM work."
     },
     {
      "id": "h1_w5_d6_e10",
      "name": "Barbell Wrist Curl HIIT 100's",
      "sets": 10,
      "reps": "10",
      "restSeconds": 10,
      "type": "standard",
      "notes": "10s rest."
     },
     {
      "id": "h1_w5_d6_e11",
      "name": "Barbell Wrist Curl",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w5_d6_e12",
      "name": "Dumbbell Cleans",
      "sets": 10,
      "reps": "10",
      "restSeconds": 10,
      "type": "standard",
      "notes": "Finisher."
     }
    ]
   },
   {
    "dayNumber": 31,
    "title": "Week 6, Workout 1 (Mon): Chest, Back, Abs",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "h1_w6_d1_e1",
      "name": "Bench Press HIIT 100's (0s Rest)",
      "sets": 10,
      "reps": "10",
      "restSeconds": 0,
      "type": "standard",
      "notes": "Zero rest in Week 6—100 reps straight through."
     },
     {
      "id": "h1_w6_d1_e2",
      "name": "Bench Press",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w6_d1_e3",
      "name": "Dumbbell Incline Press",
      "sets": 3,
      "reps": "15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "15 RM work."
     },
     {
      "id": "h1_w6_d1_e4",
      "name": "Cable Crossover",
      "sets": 3,
      "reps": "30",
      "restSeconds": 60,
      "type": "standard",
      "notes": "30 RM work."
     },
     {
      "id": "h1_w6_d1_e5",
      "name": "Wide-Grip Pulldown HIIT 100's (0s Rest)",
      "sets": 10,
      "reps": "10",
      "restSeconds": 0,
      "type": "standard",
      "notes": "Zero rest."
     },
     {
      "id": "h1_w6_d1_e6",
      "name": "Wide-Grip Pulldown",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w6_d1_e7",
      "name": "Barbell Bent-Over Row",
      "sets": 3,
      "reps": "15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "15 RM work."
     },
     {
      "id": "h1_w6_d1_e8",
      "name": "Straight-Arm Pulldown",
      "sets": 3,
      "reps": "30",
      "restSeconds": 60,
      "type": "standard",
      "notes": "30 RM work."
     },
     {
      "id": "h1_w6_d1_e9",
      "name": "Reverse Crunch",
      "sets": 10,
      "reps": "10",
      "restSeconds": 0,
      "type": "standard",
      "notes": "Abs HIIT 100s."
     },
     {
      "id": "h1_w6_d1_e10",
      "name": "Crunch",
      "sets": 10,
      "reps": "10",
      "restSeconds": 0,
      "type": "standard",
      "notes": "Abs HIIT 100s."
     },
     {
      "id": "h1_w6_d1_e11",
      "name": "Dead/Curl/Press",
      "sets": 10,
      "reps": "10",
      "restSeconds": 0,
      "type": "standard",
      "notes": "Finisher."
     }
    ]
   },
   {
    "dayNumber": 32,
    "title": "Week 6, Workout 2 (Tue): Legs, Triceps, Calves",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "h1_w6_d2_e1",
      "name": "Squat HIIT 100's (0s Rest)",
      "sets": 10,
      "reps": "10",
      "restSeconds": 0,
      "type": "standard",
      "notes": "Zero rest."
     },
     {
      "id": "h1_w6_d2_e2",
      "name": "Squat",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w6_d2_e3",
      "name": "Leg Press",
      "sets": 3,
      "reps": "15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "15 RM work."
     },
     {
      "id": "h1_w6_d2_e4",
      "name": "Leg Extension",
      "sets": 3,
      "reps": "30",
      "restSeconds": 60,
      "type": "standard",
      "notes": "30 RM work."
     },
     {
      "id": "h1_w6_d2_e5",
      "name": "Leg Curl",
      "sets": 3,
      "reps": "30",
      "restSeconds": 60,
      "type": "standard",
      "notes": "30 RM work."
     },
     {
      "id": "h1_w6_d2_e6",
      "name": "Triceps Pressdown HIIT 100's (0s Rest)",
      "sets": 10,
      "reps": "10",
      "restSeconds": 0,
      "type": "standard",
      "notes": "Zero rest."
     },
     {
      "id": "h1_w6_d2_e7",
      "name": "Triceps Pressdown",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w6_d2_e8",
      "name": "Lying Triceps Extensions",
      "sets": 3,
      "reps": "30",
      "restSeconds": 60,
      "type": "standard",
      "notes": "30 RM work."
     },
     {
      "id": "h1_w6_d2_e9",
      "name": "Standing Calf Raise HIIT 100's (0s Rest)",
      "sets": 10,
      "reps": "10",
      "restSeconds": 0,
      "type": "standard",
      "notes": "Zero rest."
     },
     {
      "id": "h1_w6_d2_e10",
      "name": "Standing Calf Raise",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w6_d2_e11",
      "name": "Seated Calf Raise",
      "sets": 3,
      "reps": "30",
      "restSeconds": 60,
      "type": "standard",
      "notes": "30 RM work."
     },
     {
      "id": "h1_w6_d2_e12",
      "name": "Kettlebell Swing",
      "sets": 10,
      "reps": "10",
      "restSeconds": 0,
      "type": "standard",
      "notes": "Finisher."
     }
    ]
   },
   {
    "dayNumber": 33,
    "title": "Week 6, Workout 3 (Wed): Shoulders, Traps, Biceps, Forearms",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "h1_w6_d3_e1",
      "name": "Dumbbell Shoulder Press HIIT 100's (0s Rest)",
      "sets": 10,
      "reps": "10",
      "restSeconds": 0,
      "type": "standard",
      "notes": "Zero rest."
     },
     {
      "id": "h1_w6_d3_e2",
      "name": "Dumbbell Shoulder Press",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w6_d3_e3",
      "name": "Dumbbell Lateral Raise",
      "sets": 3,
      "reps": "15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "15 RM work."
     },
     {
      "id": "h1_w6_d3_e4",
      "name": "Dumbbell Rear Delt Raise",
      "sets": 3,
      "reps": "30",
      "restSeconds": 60,
      "type": "standard",
      "notes": "30 RM work."
     },
     {
      "id": "h1_w6_d3_e5",
      "name": "Dumbbell Shrug HIIT 100's (0s Rest)",
      "sets": 10,
      "reps": "10",
      "restSeconds": 0,
      "type": "standard",
      "notes": "Zero rest."
     },
     {
      "id": "h1_w6_d3_e6",
      "name": "Dumbbell Shrug",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w6_d3_e7",
      "name": "Dumbbell Curl HIIT 100's (0s Rest)",
      "sets": 10,
      "reps": "10",
      "restSeconds": 0,
      "type": "standard",
      "notes": "Zero rest."
     },
     {
      "id": "h1_w6_d3_e8",
      "name": "Dumbbell Curl",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w6_d3_e9",
      "name": "Incline Dumbbell Curl",
      "sets": 3,
      "reps": "30",
      "restSeconds": 60,
      "type": "standard",
      "notes": "30 RM work."
     },
     {
      "id": "h1_w6_d3_e10",
      "name": "Barbell Wrist Curl HIIT 100's (0s Rest)",
      "sets": 10,
      "reps": "10",
      "restSeconds": 0,
      "type": "standard",
      "notes": "Zero rest."
     },
     {
      "id": "h1_w6_d3_e11",
      "name": "Barbell Wrist Curl",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w6_d3_e12",
      "name": "Dumbbell Cleans",
      "sets": 10,
      "reps": "10",
      "restSeconds": 0,
      "type": "standard",
      "notes": "Finisher."
     }
    ]
   },
   {
    "dayNumber": 34,
    "title": "Week 6, Workout 4 (Thu): Chest, Back, Abs",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "h1_w6_d4_e1",
      "name": "Bench Press HIIT 100's (0s Rest)",
      "sets": 10,
      "reps": "10",
      "restSeconds": 0,
      "type": "standard",
      "notes": "Zero rest."
     },
     {
      "id": "h1_w6_d4_e2",
      "name": "Bench Press",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w6_d4_e3",
      "name": "Reverse-Grip Incline Bench Press",
      "sets": 3,
      "reps": "15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "15 RM work."
     },
     {
      "id": "h1_w6_d4_e4",
      "name": "Incline Dumbbell Flye",
      "sets": 3,
      "reps": "30",
      "restSeconds": 60,
      "type": "standard",
      "notes": "30 RM work."
     },
     {
      "id": "h1_w6_d4_e5",
      "name": "Wide-Grip Pulldown HIIT 100's (0s Rest)",
      "sets": 10,
      "reps": "10",
      "restSeconds": 0,
      "type": "standard",
      "notes": "Zero rest."
     },
     {
      "id": "h1_w6_d4_e6",
      "name": "Wide-Grip Pulldown",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 30,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w6_d4_e7",
      "name": "One-Arm Dumbbell Bent-Over Row",
      "sets": 3,
      "reps": "15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "15 RM work."
     },
     {
      "id": "h1_w6_d4_e8",
      "name": "Reverse-Grip Pulldown",
      "sets": 3,
      "reps": "30",
      "restSeconds": 60,
      "type": "standard",
      "notes": "30 RM work."
     },
     {
      "id": "h1_w6_d4_e9",
      "name": "Reverse Crunch",
      "sets": 10,
      "reps": "10",
      "restSeconds": 0,
      "type": "standard",
      "notes": "Abs HIIT 100s."
     },
     {
      "id": "h1_w6_d4_e10",
      "name": "Crunch",
      "sets": 10,
      "reps": "10",
      "restSeconds": 0,
      "type": "standard",
      "notes": "Abs HIIT 100s."
     },
     {
      "id": "h1_w6_d4_e11",
      "name": "Dead/Curl/Press",
      "sets": 10,
      "reps": "10",
      "restSeconds": 0,
      "type": "standard",
      "notes": "Finisher."
     }
    ]
   },
   {
    "dayNumber": 35,
    "title": "Week 6, Workout 5 (Fri): Legs, Triceps, Calves",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "h1_w6_d5_e1",
      "name": "Squat HIIT 100's (0s Rest)",
      "sets": 10,
      "reps": "10",
      "restSeconds": 0,
      "type": "standard",
      "notes": "Zero rest."
     },
     {
      "id": "h1_w6_d5_e2",
      "name": "Squat",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w6_d5_e3",
      "name": "Dumbbell Lunge",
      "sets": 3,
      "reps": "15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "15 RM work."
     },
     {
      "id": "h1_w6_d5_e4",
      "name": "Leg Extension",
      "sets": 3,
      "reps": "30",
      "restSeconds": 60,
      "type": "standard",
      "notes": "30 RM work."
     },
     {
      "id": "h1_w6_d5_e5",
      "name": "Romanian Deadlift",
      "sets": 3,
      "reps": "30",
      "restSeconds": 60,
      "type": "standard",
      "notes": "30 RM work."
     },
     {
      "id": "h1_w6_d5_e6",
      "name": "Triceps Pressdown HIIT 100's (0s Rest)",
      "sets": 10,
      "reps": "10",
      "restSeconds": 0,
      "type": "standard",
      "notes": "Zero rest."
     },
     {
      "id": "h1_w6_d5_e7",
      "name": "Triceps Pressdown",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w6_d5_e8",
      "name": "Cable Overhead Triceps Extension",
      "sets": 3,
      "reps": "30",
      "restSeconds": 60,
      "type": "standard",
      "notes": "30 RM work."
     },
     {
      "id": "h1_w6_d5_e9",
      "name": "Standing Calf Raise HIIT 100's (0s Rest)",
      "sets": 10,
      "reps": "10",
      "restSeconds": 0,
      "type": "standard",
      "notes": "Zero rest."
     },
     {
      "id": "h1_w6_d5_e10",
      "name": "Standing Calf Raise",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w6_d5_e11",
      "name": "Seated Calf Raise",
      "sets": 3,
      "reps": "30",
      "restSeconds": 30,
      "type": "standard",
      "notes": "30 RM work."
     },
     {
      "id": "h1_w6_d5_e12",
      "name": "Kettlebell Swing",
      "sets": 10,
      "reps": "10",
      "restSeconds": 0,
      "type": "standard",
      "notes": "Finisher."
     }
    ]
   },
   {
    "dayNumber": 36,
    "title": "Week 6, Workout 6 (Sat): Shoulders, Traps, Biceps, Forearms (Finale)",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "h1_w6_d6_e1",
      "name": "Dumbbell Shoulder Press HIIT 100's (0s Rest)",
      "sets": 10,
      "reps": "10",
      "restSeconds": 0,
      "type": "standard",
      "notes": "Zero rest."
     },
     {
      "id": "h1_w6_d6_e2",
      "name": "Dumbbell Shoulder Press",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w6_d6_e3",
      "name": "One-Arm Cable Lateral Raise",
      "sets": 3,
      "reps": "15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "15 RM work."
     },
     {
      "id": "h1_w6_d6_e4",
      "name": "Machine Rear Delt Flye",
      "sets": 3,
      "reps": "30",
      "restSeconds": 60,
      "type": "standard",
      "notes": "30 RM work."
     },
     {
      "id": "h1_w6_d6_e5",
      "name": "Dumbbell Shrug HIIT 100's (0s Rest)",
      "sets": 10,
      "reps": "10",
      "restSeconds": 0,
      "type": "standard",
      "notes": "Zero rest."
     },
     {
      "id": "h1_w6_d6_e6",
      "name": "Dumbbell Shrug",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w6_d6_e7",
      "name": "Dumbbell Curl HIIT 100's (0s Rest)",
      "sets": 10,
      "reps": "10",
      "restSeconds": 0,
      "type": "standard",
      "notes": "Zero rest."
     },
     {
      "id": "h1_w6_d6_e8",
      "name": "Dumbbell Curl",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w6_d6_e9",
      "name": "Behind-the-Back Cable Curl",
      "sets": 3,
      "reps": "30",
      "restSeconds": 60,
      "type": "standard",
      "notes": "30 RM work."
     },
     {
      "id": "h1_w6_d6_e10",
      "name": "Barbell Wrist Curl HIIT 100's (0s Rest)",
      "sets": 10,
      "reps": "10",
      "restSeconds": 0,
      "type": "standard",
      "notes": "Zero rest."
     },
     {
      "id": "h1_w6_d6_e11",
      "name": "Barbell Wrist Curl",
      "sets": 3,
      "reps": "5-7",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 RM work."
     },
     {
      "id": "h1_w6_d6_e12",
      "name": "Dumbbell Cleans",
      "sets": 10,
      "reps": "10",
      "restSeconds": 0,
      "type": "standard",
      "notes": "Program completion finisher."
     }
    ]
   }
  ]
 },
 {
  "id": "jim_stoppani_shortcut_to_shred_6wk",
  "title": "Jim Stoppani's 6-Week Shortcut to Shred",
  "description": "Jim Stoppani's ultimate 6-week fat loss and muscle-sculpting program. The secret weapon is Cardio Acceleration: performing 1 minute of high-intensity cardio between every single working set to maximize EPOC and fat burn.",
  "tags": [
   "Jim Stoppani",
   "Shortcut to Shred",
   "Fat Loss",
   "Cardio Acceleration",
   "6 Weeks"
  ],
  "days": [
   {
    "dayNumber": 1,
    "title": "Phase 1: Week 1 - Workout 1: Chest, Triceps, Abs (Multi-Joint)",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "sts_w1_d1_e1",
      "name": "Bench Press",
      "sets": 4,
      "reps": "9-11",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Perform 1 minute of cardio acceleration between every set."
     },
     {
      "id": "sts_w1_d1_e2",
      "name": "Incline Dumbbell Press",
      "sets": 3,
      "reps": "9-11",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w1_d1_e3",
      "name": "Decline Smith Machine Press",
      "sets": 3,
      "reps": "9-11",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w1_d1_e4",
      "name": "Dips",
      "sets": 4,
      "reps": "9-11",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w1_d1_e5",
      "name": "Close-Grip Bench Press",
      "sets": 4,
      "reps": "9-11",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w1_d1_e6",
      "name": "Cable Crunch",
      "sets": 3,
      "reps": "9-11",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w1_d1_e7",
      "name": "Smith Machine Hip Thrust",
      "sets": 3,
      "reps": "9-11",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     }
    ]
   },
   {
    "dayNumber": 2,
    "title": "Phase 1: Week 1 - Workout 2: Shoulders, Legs, Calves (Multi-Joint)",
    "estimatedMinutes": 65,
    "exercises": [
     {
      "id": "sts_w1_d2_e1",
      "name": "Barbell Shoulder Press",
      "sets": 4,
      "reps": "9-11",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w1_d2_e2",
      "name": "Alternating Dumbbell Shoulder Press (Standing)",
      "sets": 3,
      "reps": "9-11",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w1_d2_e3",
      "name": "Smith Machine One-Arm Upright Row",
      "sets": 3,
      "reps": "9-11",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w1_d2_e4",
      "name": "Squat",
      "sets": 4,
      "reps": "9-11",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w1_d2_e5",
      "name": "Deadlift",
      "sets": 3,
      "reps": "9-11",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w1_d2_e6",
      "name": "Walking Lunge",
      "sets": 3,
      "reps": "9-11",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w1_d2_e7",
      "name": "Standing Calf Raise",
      "sets": 3,
      "reps": "9-11",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w1_d2_e8",
      "name": "Seated Calf Raise",
      "sets": 3,
      "reps": "9-11",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     }
    ]
   },
   {
    "dayNumber": 3,
    "title": "Phase 1: Week 1 - Workout 3: Back, Traps, Biceps (Multi-Joint)",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "sts_w1_d3_e1",
      "name": "Barbell Bent Over Row",
      "sets": 4,
      "reps": "9-11",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w1_d3_e2",
      "name": "Dumbbell Bent-Over Row",
      "sets": 3,
      "reps": "9-11",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w1_d3_e3",
      "name": "Seated Cable Row",
      "sets": 3,
      "reps": "9-11",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w1_d3_e4",
      "name": "Barbell Shrug",
      "sets": 4,
      "reps": "9-11",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w1_d3_e5",
      "name": "Barbell Curl",
      "sets": 3,
      "reps": "9-11",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w1_d3_e6",
      "name": "Barbell or EZ-Bar Preacher Curl",
      "sets": 3,
      "reps": "9-11",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w1_d3_e7",
      "name": "Reverse-Grip Barbell Curl",
      "sets": 3,
      "reps": "9-11",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w1_d3_e8",
      "name": "Barbell Wrist Curl",
      "sets": 3,
      "reps": "9-11",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     }
    ]
   },
   {
    "dayNumber": 4,
    "title": "Phase 1: Week 1 - Workout 4: Chest, Triceps, Abs (Single Joint)",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "sts_w1_d4_e1",
      "name": "Incline Dumbbell Flye",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w1_d4_e2",
      "name": "Dumbbell Flye",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w1_d4_e3",
      "name": "Cable Crossover",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w1_d4_e4",
      "name": "Triceps Pressdown",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w1_d4_e5",
      "name": "Overhead Dumbbell Extension",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w1_d4_e6",
      "name": "Cable Lying Triceps Extension",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w1_d4_e7",
      "name": "Crunch",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w1_d4_e8",
      "name": "Standing Oblique Cable Crunch",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     }
    ]
   },
   {
    "dayNumber": 5,
    "title": "Phase 1: Week 1 - Workout 5: Shoulders, Legs, Calves (Single Joint)",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "sts_w1_d5_e1",
      "name": "Dumbbell Lateral Raise",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w1_d5_e2",
      "name": "Barbell Front Raise",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w1_d5_e3",
      "name": "Dumbbell Bent-Over Lateral Raise",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w1_d5_e4",
      "name": "Leg Extension",
      "sets": 4,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w1_d5_e5",
      "name": "Leg Curl",
      "sets": 4,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w1_d5_e6",
      "name": "Seated Calf Raise",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w1_d5_e7",
      "name": "Donkey or Leg Press Calf Raise",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     }
    ]
   },
   {
    "dayNumber": 6,
    "title": "Phase 1: Week 1 - Workout 6: Back, Traps, Biceps (Single Joint)",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "sts_w1_d6_e1",
      "name": "Lat Pulldown",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w1_d6_e2",
      "name": "Reverse-Grip Pulldown",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w1_d6_e3",
      "name": "Straight-Arm Pulldown",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w1_d6_e4",
      "name": "Smith Machine Behind-the-Back Shrug",
      "sets": 4,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w1_d6_e5",
      "name": "Incline Dumbbell Curl",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w1_d6_e6",
      "name": "High Cable Curl",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w1_d6_e7",
      "name": "Rope Cable Curl",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w1_d6_e8",
      "name": "Dumbbell Reverse Wrist Curl",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     }
    ]
   },
   {
    "dayNumber": 7,
    "title": "Phase 1: Week 2 - Workout 1: Chest, Triceps, Abs (Multi-Joint)",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "sts_w2_d1_e1",
      "name": "Bench Press",
      "sets": 4,
      "reps": "6-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w2_d1_e2",
      "name": "Incline Dumbbell Press",
      "sets": 3,
      "reps": "6-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w2_d1_e3",
      "name": "Decline Smith Machine Press",
      "sets": 3,
      "reps": "6-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w2_d1_e4",
      "name": "Dips",
      "sets": 4,
      "reps": "6-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w2_d1_e5",
      "name": "Close-Grip Bench Press",
      "sets": 4,
      "reps": "6-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w2_d1_e6",
      "name": "Cable Crunch",
      "sets": 3,
      "reps": "7-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w2_d1_e7",
      "name": "Smith Machine Hip Thrust",
      "sets": 3,
      "reps": "7-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     }
    ]
   },
   {
    "dayNumber": 8,
    "title": "Phase 1: Week 2 - Workout 2: Shoulders, Legs, Calves (Multi-Joint)",
    "estimatedMinutes": 65,
    "exercises": [
     {
      "id": "sts_w2_d2_e1",
      "name": "Barbell Shoulder Press",
      "sets": 4,
      "reps": "6-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w2_d2_e2",
      "name": "Alternating Dumbbell Shoulder Press (Standing)",
      "sets": 3,
      "reps": "6-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w2_d2_e3",
      "name": "Smith Machine One-Arm Upright Row",
      "sets": 3,
      "reps": "6-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w2_d2_e4",
      "name": "Squat",
      "sets": 4,
      "reps": "6-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w2_d2_e5",
      "name": "Deadlift",
      "sets": 3,
      "reps": "6-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w2_d2_e6",
      "name": "Walking Lunge",
      "sets": 3,
      "reps": "6-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w2_d2_e7",
      "name": "Standing Calf Raise",
      "sets": 3,
      "reps": "7-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w2_d2_e8",
      "name": "Seated Calf Raise",
      "sets": 3,
      "reps": "7-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     }
    ]
   },
   {
    "dayNumber": 9,
    "title": "Phase 1: Week 2 - Workout 3: Back, Traps, Biceps (Multi-Joint)",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "sts_w2_d3_e1",
      "name": "Barbell Bent Over Row",
      "sets": 4,
      "reps": "6-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w2_d3_e2",
      "name": "Dumbbell Bent-Over Row",
      "sets": 3,
      "reps": "6-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w2_d3_e3",
      "name": "Seated Cable Row",
      "sets": 3,
      "reps": "6-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w2_d3_e4",
      "name": "Barbell Shrug",
      "sets": 4,
      "reps": "6-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w2_d3_e5",
      "name": "Barbell Curl",
      "sets": 3,
      "reps": "6-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w2_d3_e6",
      "name": "Barbell or EZ-Bar Preacher Curl",
      "sets": 3,
      "reps": "6-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w2_d3_e7",
      "name": "Reverse-Grip Barbell Curl",
      "sets": 3,
      "reps": "6-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w2_d3_e8",
      "name": "Barbell Wrist Curl",
      "sets": 3,
      "reps": "6-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     }
    ]
   },
   {
    "dayNumber": 10,
    "title": "Phase 1: Week 2 - Workout 4: Chest, Triceps, Abs (Single Joint)",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "sts_w2_d4_e1",
      "name": "Incline Dumbbell Flye",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w2_d4_e2",
      "name": "Dumbbell Flye",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w2_d4_e3",
      "name": "Cable Crossover",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w2_d4_e4",
      "name": "Triceps Pressdown",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w2_d4_e5",
      "name": "Overhead Dumbbell Extension",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w2_d4_e6",
      "name": "Cable Lying Triceps Extension",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w2_d4_e7",
      "name": "Crunch",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w2_d4_e8",
      "name": "Standing Oblique Cable Crunch",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     }
    ]
   },
   {
    "dayNumber": 11,
    "title": "Phase 1: Week 2 - Workout 5: Shoulders, Legs, Calves (Single Joint)",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "sts_w2_d5_e1",
      "name": "Dumbbell Lateral Raise",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w2_d5_e2",
      "name": "Barbell Front Raise",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w2_d5_e3",
      "name": "Dumbbell Bent-Over Lateral Raise",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w2_d5_e4",
      "name": "Leg Extension",
      "sets": 4,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w2_d5_e5",
      "name": "Leg Curl",
      "sets": 4,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w2_d5_e6",
      "name": "Seated Calf Raise",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w2_d5_e7",
      "name": "Donkey or Leg Press Calf Raise",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     }
    ]
   },
   {
    "dayNumber": 12,
    "title": "Phase 1: Week 2 - Workout 6: Back, Traps, Biceps (Single Joint)",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "sts_w2_d6_e1",
      "name": "Lat Pulldown",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w2_d6_e2",
      "name": "Reverse-Grip Pulldown",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w2_d6_e3",
      "name": "Straight-Arm Pulldown",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w2_d6_e4",
      "name": "Smith Machine Behind-the-Back Shrug",
      "sets": 4,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w2_d6_e5",
      "name": "Incline Dumbbell Curl",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w2_d6_e6",
      "name": "High Cable Curl",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w2_d6_e7",
      "name": "Rope Cable Curl",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w2_d6_e8",
      "name": "Dumbbell Reverse Wrist Curl",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     }
    ]
   },
   {
    "dayNumber": 13,
    "title": "Phase 2: Week 3 - Workout 1: Chest, Triceps, Abs (Multi-Joint)",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "sts_w3_d1_e1",
      "name": "Bench Press",
      "sets": 4,
      "reps": "2-5",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w3_d1_e2",
      "name": "Incline Dumbbell Press",
      "sets": 3,
      "reps": "2-5",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w3_d1_e3",
      "name": "Decline Smith Machine Press",
      "sets": 3,
      "reps": "2-5",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w3_d1_e4",
      "name": "Dips",
      "sets": 4,
      "reps": "2-5",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w3_d1_e5",
      "name": "Close-Grip Bench Press",
      "sets": 4,
      "reps": "2-5",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w3_d1_e6",
      "name": "Cable Crunch",
      "sets": 3,
      "reps": "5-6",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w3_d1_e7",
      "name": "Smith Machine Hip Thrust",
      "sets": 3,
      "reps": "5-6",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     }
    ]
   },
   {
    "dayNumber": 14,
    "title": "Phase 2: Week 3 - Workout 2: Shoulders, Legs, Calves (Multi-Joint)",
    "estimatedMinutes": 65,
    "exercises": [
     {
      "id": "sts_w3_d2_e1",
      "name": "Barbell Shoulder Press",
      "sets": 4,
      "reps": "2-5",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w3_d2_e2",
      "name": "Alternating Dumbbell Shoulder Press (Standing)",
      "sets": 3,
      "reps": "2-5",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w3_d2_e3",
      "name": "Smith Machine One-Arm Upright Row",
      "sets": 3,
      "reps": "4-5",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w3_d2_e4",
      "name": "Squat",
      "sets": 4,
      "reps": "2-5",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w3_d2_e5",
      "name": "Deadlift",
      "sets": 3,
      "reps": "2-5",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w3_d2_e6",
      "name": "Walking Lunge",
      "sets": 3,
      "reps": "4-5",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w3_d2_e7",
      "name": "Standing Calf Raise",
      "sets": 3,
      "reps": "5-6",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w3_d2_e8",
      "name": "Seated Calf Raise",
      "sets": 3,
      "reps": "5-6",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     }
    ]
   },
   {
    "dayNumber": 15,
    "title": "Phase 2: Week 3 - Workout 3: Back, Traps, Biceps (Multi-Joint)",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "sts_w3_d3_e1",
      "name": "Barbell Bent Over Row",
      "sets": 4,
      "reps": "2-5",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w3_d3_e2",
      "name": "Dumbbell Bent-Over Row",
      "sets": 3,
      "reps": "2-5",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w3_d3_e3",
      "name": "Seated Cable Row",
      "sets": 3,
      "reps": "2-5",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w3_d3_e4",
      "name": "Barbell Shrug",
      "sets": 4,
      "reps": "2-5",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w3_d3_e5",
      "name": "Barbell Curl",
      "sets": 3,
      "reps": "2-5",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w3_d3_e6",
      "name": "Barbell or EZ-Bar Preacher Curl",
      "sets": 3,
      "reps": "4-5",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w3_d3_e7",
      "name": "Reverse-Grip Barbell Curl",
      "sets": 3,
      "reps": "4-5",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w3_d3_e8",
      "name": "Barbell Wrist Curl",
      "sets": 3,
      "reps": "4-5",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     }
    ]
   },
   {
    "dayNumber": 16,
    "title": "Phase 2: Week 3 - Workout 4: Chest, Triceps, Abs (Single Joint)",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "sts_w3_d4_e1",
      "name": "Incline Dumbbell Flye",
      "sets": 3,
      "reps": "21-30",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w3_d4_e2",
      "name": "Dumbbell Flye",
      "sets": 3,
      "reps": "21-30",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w3_d4_e3",
      "name": "Cable Crossover",
      "sets": 3,
      "reps": "21-30",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w3_d4_e4",
      "name": "Triceps Pressdown",
      "sets": 3,
      "reps": "21-30",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w3_d4_e5",
      "name": "Overhead Dumbbell Extension",
      "sets": 3,
      "reps": "21-30",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w3_d4_e6",
      "name": "Cable Lying Triceps Extension",
      "sets": 3,
      "reps": "21-30",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w3_d4_e7",
      "name": "Crunch",
      "sets": 3,
      "reps": "21-30",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w3_d4_e8",
      "name": "Standing Oblique Cable Crunch",
      "sets": 3,
      "reps": "21-30",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     }
    ]
   },
   {
    "dayNumber": 17,
    "title": "Phase 2: Week 3 - Workout 5: Shoulders, Legs, Calves (Single Joint)",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "sts_w3_d5_e1",
      "name": "Dumbbell Lateral Raise",
      "sets": 3,
      "reps": "21-30",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w3_d5_e2",
      "name": "Barbell Front Raise",
      "sets": 3,
      "reps": "21-30",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w3_d5_e3",
      "name": "Dumbbell Bent-Over Lateral Raise",
      "sets": 3,
      "reps": "21-30",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w3_d5_e4",
      "name": "Leg Extension",
      "sets": 4,
      "reps": "21-30",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w3_d5_e5",
      "name": "Leg Curl",
      "sets": 4,
      "reps": "21-30",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w3_d5_e6",
      "name": "Seated Calf Raise",
      "sets": 3,
      "reps": "21-30",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w3_d5_e7",
      "name": "Donkey or Leg Press Calf Raise",
      "sets": 3,
      "reps": "21-30",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     }
    ]
   },
   {
    "dayNumber": 18,
    "title": "Phase 2: Week 3 - Workout 6: Back, Traps, Biceps (Single Joint)",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "sts_w3_d6_e1",
      "name": "Lat Pulldown",
      "sets": 3,
      "reps": "21-30",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w3_d6_e2",
      "name": "Reverse-Grip Pulldown",
      "sets": 3,
      "reps": "21-30",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w3_d6_e3",
      "name": "Straight-Arm Pulldown",
      "sets": 3,
      "reps": "21-30",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w3_d6_e4",
      "name": "Smith Machine Behind-the-Back Shrug",
      "sets": 4,
      "reps": "21-30",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w3_d6_e5",
      "name": "Incline Dumbbell Curl",
      "sets": 3,
      "reps": "21-30",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w3_d6_e6",
      "name": "High Cable Curl",
      "sets": 3,
      "reps": "21-30",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w3_d6_e7",
      "name": "Rope Cable Curl",
      "sets": 3,
      "reps": "21-30",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w3_d6_e8",
      "name": "Dumbbell Reverse Wrist Curl",
      "sets": 3,
      "reps": "21-30",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     }
    ]
   },
   {
    "dayNumber": 19,
    "title": "Phase 2: Week 4 - Workout 1: Chest, Triceps, Abs (Multi-Joint)",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "sts_w4_d1_e1",
      "name": "Bench Press",
      "sets": 4,
      "reps": "9-11",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. On the LAST set, perform a cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w4_d1_e2",
      "name": "Incline Bench Press",
      "sets": 3,
      "reps": "9-11",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w4_d1_e3",
      "name": "Decline Dumbbell Press",
      "sets": 3,
      "reps": "9-11",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w4_d1_e4",
      "name": "Dips",
      "sets": 4,
      "reps": "9-11",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w4_d1_e5",
      "name": "Close-Grip Bench Press",
      "sets": 4,
      "reps": "9-11",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w4_d1_e6",
      "name": "Smith Machine Crunch",
      "sets": 3,
      "reps": "9-11",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w4_d1_e7",
      "name": "Hanging Leg Raise",
      "sets": 3,
      "reps": "9-11",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     }
    ]
   },
   {
    "dayNumber": 20,
    "title": "Phase 2: Week 4 - Workout 2: Shoulders, Legs, Calves (Multi-Joint)",
    "estimatedMinutes": 65,
    "exercises": [
     {
      "id": "sts_w4_d2_e1",
      "name": "Barbell Shoulder Press",
      "sets": 4,
      "reps": "9-11",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w4_d2_e2",
      "name": "Dumbbell Shoulder Press (Seated)",
      "sets": 3,
      "reps": "9-11",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w4_d2_e3",
      "name": "Dumbbell Upright Row",
      "sets": 3,
      "reps": "9-11",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w4_d2_e4",
      "name": "Squat",
      "sets": 4,
      "reps": "9-11",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w4_d2_e5",
      "name": "Deadlift",
      "sets": 3,
      "reps": "9-11",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets (No dropset noted)."
     },
     {
      "id": "sts_w4_d2_e6",
      "name": "Leg Press",
      "sets": 3,
      "reps": "9-11",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w4_d2_e7",
      "name": "Standing Calf Raise",
      "sets": 3,
      "reps": "9-11",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w4_d2_e8",
      "name": "Seated Calf Raise",
      "sets": 3,
      "reps": "9-11",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     }
    ]
   },
   {
    "dayNumber": 21,
    "title": "Phase 2: Week 4 - Workout 3: Back, Traps, Biceps (Multi-Joint)",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "sts_w4_d3_e1",
      "name": "Barbell Bent Over Row",
      "sets": 4,
      "reps": "9-11",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w4_d3_e2",
      "name": "Incline Dumbbell Row",
      "sets": 3,
      "reps": "9-11",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w4_d3_e3",
      "name": "Seated Cable Row",
      "sets": 3,
      "reps": "9-11",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 min cardio acceleration between sets."
     },
     {
      "id": "sts_w4_d3_e4",
      "name": "Barbell Shrug",
      "sets": 4,
      "reps": "9-11",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w4_d3_e5",
      "name": "Barbell Curl",
      "sets": 3,
      "reps": "9-11",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w4_d3_e6",
      "name": "Seated Barbell Curl",
      "sets": 3,
      "reps": "9-11",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w4_d3_e7",
      "name": "Reverse-Grip Barbell or EZ-Bar Curl",
      "sets": 3,
      "reps": "9-11",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w4_d3_e8",
      "name": "Behind-The-Back Wrist Curl",
      "sets": 3,
      "reps": "9-11",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     }
    ]
   },
   {
    "dayNumber": 22,
    "title": "Phase 2: Week 4 - Workout 4: Chest, Triceps, Abs (Single Joint)",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "sts_w4_d4_e1",
      "name": "Cable Crossover from Low Pulley",
      "sets": 4,
      "reps": "16-20",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w4_d4_e2",
      "name": "Cable Crossover",
      "sets": 3,
      "reps": "16-20",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w4_d4_e3",
      "name": "Dumbbell Flye",
      "sets": 3,
      "reps": "16-20",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w4_d4_e4",
      "name": "Overhead Cable Triceps Extension",
      "sets": 3,
      "reps": "16-20",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w4_d4_e5",
      "name": "Lying Triceps Extension",
      "sets": 3,
      "reps": "16-20",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w4_d4_e6",
      "name": "Rope Triceps Pressdown",
      "sets": 3,
      "reps": "16-20",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w4_d4_e7",
      "name": "Crossover Crunch",
      "sets": 3,
      "reps": "16-20",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w4_d4_e8",
      "name": "Cable Woodchopper",
      "sets": 3,
      "reps": "16-20",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     }
    ]
   },
   {
    "dayNumber": 23,
    "title": "Phase 2: Week 4 - Workout 5: Shoulders, Legs, Calves (Single Joint)",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "sts_w4_d5_e1",
      "name": "Dumbbell Lateral Raise",
      "sets": 4,
      "reps": "16-20",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w4_d5_e2",
      "name": "Cable Front Raise",
      "sets": 3,
      "reps": "16-20",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w4_d5_e3",
      "name": "Lying Cable Rear Delt Flye",
      "sets": 3,
      "reps": "16-20",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w4_d5_e4",
      "name": "Leg Extension",
      "sets": 4,
      "reps": "16-20",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w4_d5_e5",
      "name": "Leg Curl",
      "sets": 4,
      "reps": "16-20",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w4_d5_e6",
      "name": "Seated Calf Raise",
      "sets": 3,
      "reps": "16-20",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w4_d5_e7",
      "name": "Donkey or Leg Press Calf Raise",
      "sets": 3,
      "reps": "16-20",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     }
    ]
   },
   {
    "dayNumber": 24,
    "title": "Phase 2: Week 4 - Workout 6: Back, Traps, Biceps (Single Joint)",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "sts_w4_d6_e1",
      "name": "Lat Pulldown",
      "sets": 4,
      "reps": "16-20",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w4_d6_e2",
      "name": "Behind-the-Neck Pulldown",
      "sets": 3,
      "reps": "16-20",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w4_d6_e3",
      "name": "Rope Straight-Arm Pulldown",
      "sets": 3,
      "reps": "16-20",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w4_d6_e4",
      "name": "Dumbbell Shrug",
      "sets": 4,
      "reps": "16-20",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w4_d6_e5",
      "name": "EZ-Bar Cable Curl",
      "sets": 3,
      "reps": "16-20",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w4_d6_e6",
      "name": "Incline Dumbbell Curl",
      "sets": 3,
      "reps": "16-20",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w4_d6_e7",
      "name": "Dumbbell Hammer Curl",
      "sets": 3,
      "reps": "16-20",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w4_d6_e8",
      "name": "Dumbbell Reverse Wrist Curl",
      "sets": 3,
      "reps": "16-20",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     }
    ]
   },
   {
    "dayNumber": 25,
    "title": "Phase 3: Week 5 - Workout 1: Chest, Triceps, Abs (Multi-Joint)",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "sts_w5_d1_e1",
      "name": "Bench Press",
      "sets": 4,
      "reps": "6-8",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w5_d1_e2",
      "name": "Incline Bench Press",
      "sets": 3,
      "reps": "6-8",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w5_d1_e3",
      "name": "Decline Dumbbell Press",
      "sets": 3,
      "reps": "6-8",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w5_d1_e4",
      "name": "Dips",
      "sets": 4,
      "reps": "6-8",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w5_d1_e5",
      "name": "Close-Grip Bench Press",
      "sets": 4,
      "reps": "6-8",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w5_d1_e6",
      "name": "Smith Machine Crunch",
      "sets": 3,
      "reps": "7-8",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w5_d1_e7",
      "name": "Hanging Leg Raise",
      "sets": 3,
      "reps": "7-8",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     }
    ]
   },
   {
    "dayNumber": 26,
    "title": "Phase 3: Week 5 - Workout 2: Shoulders, Legs, Calves (Multi-Joint)",
    "estimatedMinutes": 65,
    "exercises": [
     {
      "id": "sts_w5_d2_e1",
      "name": "Barbell Shoulder Press",
      "sets": 4,
      "reps": "6-8",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w5_d2_e2",
      "name": "Dumbbell Shoulder Press (Seated)",
      "sets": 3,
      "reps": "6-8",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w5_d2_e3",
      "name": "Dumbbell Upright Row",
      "sets": 3,
      "reps": "6-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w5_d2_e4",
      "name": "Squat",
      "sets": 4,
      "reps": "6-8",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w5_d2_e5",
      "name": "Deadlift",
      "sets": 3,
      "reps": "6-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w5_d2_e6",
      "name": "Leg Press",
      "sets": 3,
      "reps": "6-8",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w5_d2_e7",
      "name": "Standing Calf Raise",
      "sets": 3,
      "reps": "7-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w5_d2_e8",
      "name": "Seated Calf Raise",
      "sets": 3,
      "reps": "7-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     }
    ]
   },
   {
    "dayNumber": 27,
    "title": "Phase 3: Week 5 - Workout 3: Back, Traps, Biceps (Multi-Joint)",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "sts_w5_d3_e1",
      "name": "Barbell Bent Over Row",
      "sets": 4,
      "reps": "6-8",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w5_d3_e2",
      "name": "Incline Dumbbell Row",
      "sets": 3,
      "reps": "6-8",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w5_d3_e3",
      "name": "Seated Cable Row",
      "sets": 3,
      "reps": "6-8",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w5_d3_e4",
      "name": "Barbell Shrug",
      "sets": 4,
      "reps": "6-8",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w5_d3_e5",
      "name": "Barbell Curl",
      "sets": 3,
      "reps": "6-8",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w5_d3_e6",
      "name": "Seated Barbell Curl",
      "sets": 3,
      "reps": "6-8",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w5_d3_e7",
      "name": "Reverse-Grip Barbell or EZ-Bar Curl",
      "sets": 3,
      "reps": "6-8",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w5_d3_e8",
      "name": "Behind-The-Back Wrist Curl",
      "sets": 3,
      "reps": "6-8",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     }
    ]
   },
   {
    "dayNumber": 28,
    "title": "Phase 3: Week 5 - Workout 4: Chest, Triceps, Abs (Single Joint)",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "sts_w5_d4_e1",
      "name": "Cable Crossover from Low Pulley",
      "sets": 4,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w5_d4_e2",
      "name": "Cable Crossover",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w5_d4_e3",
      "name": "Dumbbell Flye",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w5_d4_e4",
      "name": "Overhead Cable Triceps Extension",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w5_d4_e5",
      "name": "Lying Triceps Extension",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w5_d4_e6",
      "name": "Rope Triceps Pressdown",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w5_d4_e7",
      "name": "Crossover Crunch",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w5_d4_e8",
      "name": "Cable Woodchopper",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     }
    ]
   },
   {
    "dayNumber": 29,
    "title": "Phase 3: Week 5 - Workout 5: Shoulders, Legs, Calves (Single Joint)",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "sts_w5_d5_e1",
      "name": "Dumbbell Lateral Raise",
      "sets": 4,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w5_d5_e2",
      "name": "Cable Front Raise",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w5_d5_e3",
      "name": "Lying Cable Rear Delt Flye",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w5_d5_e4",
      "name": "Leg Extension",
      "sets": 4,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w5_d5_e5",
      "name": "Leg Curl",
      "sets": 4,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w5_d5_e6",
      "name": "Seated Calf Raise",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w5_d5_e7",
      "name": "Donkey or Leg Press Calf Raise",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     }
    ]
   },
   {
    "dayNumber": 30,
    "title": "Phase 3: Week 5 - Workout 6: Back, Traps, Biceps (Single Joint)",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "sts_w5_d6_e1",
      "name": "Lat Pulldown",
      "sets": 4,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w5_d6_e2",
      "name": "Behind-the-Neck Pulldown",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w5_d6_e3",
      "name": "Rope Straight-Arm Pulldown",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w5_d6_e4",
      "name": "Dumbbell Shrug",
      "sets": 4,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w5_d6_e5",
      "name": "EZ-Bar Cable Curl",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w5_d6_e6",
      "name": "Incline Dumbbell Curl",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w5_d6_e7",
      "name": "Dumbbell Hammer Curl",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w5_d6_e8",
      "name": "Dumbbell Reverse Wrist Curl",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     }
    ]
   },
   {
    "dayNumber": 31,
    "title": "Phase 3: Week 6 - Workout 1: Chest, Triceps, Abs (Multi-Joint)",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "sts_w6_d1_e1",
      "name": "Bench Press",
      "sets": 4,
      "reps": "2-5",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w6_d1_e2",
      "name": "Incline Bench Press",
      "sets": 3,
      "reps": "2-5",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w6_d1_e3",
      "name": "Decline Dumbbell Press",
      "sets": 3,
      "reps": "2-5",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w6_d1_e4",
      "name": "Dips",
      "sets": 4,
      "reps": "2-5",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w6_d1_e5",
      "name": "Close-Grip Bench Press",
      "sets": 4,
      "reps": "2-5",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w6_d1_e6",
      "name": "Smith Machine Crunch",
      "sets": 3,
      "reps": "4-5",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w6_d1_e7",
      "name": "Hanging Leg Raise",
      "sets": 3,
      "reps": "4-5",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     }
    ]
   },
   {
    "dayNumber": 32,
    "title": "Phase 3: Week 6 - Workout 2: Shoulders, Legs, Calves (Multi-Joint)",
    "estimatedMinutes": 65,
    "exercises": [
     {
      "id": "sts_w6_d2_e1",
      "name": "Barbell Shoulder Press",
      "sets": 4,
      "reps": "2-5",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w6_d2_e2",
      "name": "Dumbbell Shoulder Press (Seated)",
      "sets": 3,
      "reps": "2-5",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w6_d2_e3",
      "name": "Dumbbell Upright Row",
      "sets": 3,
      "reps": "2-5",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w6_d2_e4",
      "name": "Squat",
      "sets": 4,
      "reps": "2-5",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w6_d2_e5",
      "name": "Deadlift",
      "sets": 3,
      "reps": "2-5",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w6_d2_e6",
      "name": "Leg Press",
      "sets": 3,
      "reps": "2-5",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w6_d2_e7",
      "name": "Standing Calf Raise",
      "sets": 3,
      "reps": "4-5",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w6_d2_e8",
      "name": "Seated Calf Raise",
      "sets": 3,
      "reps": "4-5",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     }
    ]
   },
   {
    "dayNumber": 33,
    "title": "Phase 3: Week 6 - Workout 3: Back, Traps, Biceps (Multi-Joint)",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "sts_w6_d3_e1",
      "name": "Barbell Bent Over Row",
      "sets": 4,
      "reps": "2-5",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w6_d3_e2",
      "name": "Incline Dumbbell Row",
      "sets": 3,
      "reps": "2-5",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w6_d3_e3",
      "name": "Seated Cable Row",
      "sets": 3,
      "reps": "2-5",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w6_d3_e4",
      "name": "Barbell Shrug",
      "sets": 4,
      "reps": "2-5",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w6_d3_e5",
      "name": "Barbell Curl",
      "sets": 3,
      "reps": "2-5",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w6_d3_e6",
      "name": "Seated Barbell Curl",
      "sets": 3,
      "reps": "2-5",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w6_d3_e7",
      "name": "Reverse-Grip Barbell or EZ-Bar Curl",
      "sets": 3,
      "reps": "4-5",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w6_d3_e8",
      "name": "Behind-The-Back Wrist Curl",
      "sets": 3,
      "reps": "4-5",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     }
    ]
   },
   {
    "dayNumber": 34,
    "title": "Phase 3: Week 6 - Workout 4: Chest, Triceps, Abs (Single Joint)",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "sts_w6_d4_e1",
      "name": "Cable Crossover from Low Pulley",
      "sets": 4,
      "reps": "16-20",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w6_d4_e2",
      "name": "Cable Crossover",
      "sets": 3,
      "reps": "16-20",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w6_d4_e3",
      "name": "Dumbbell Flye",
      "sets": 3,
      "reps": "16-20",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w6_d4_e4",
      "name": "Overhead Cable Triceps Extension",
      "sets": 3,
      "reps": "16-20",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w6_d4_e5",
      "name": "Lying Triceps Extension",
      "sets": 3,
      "reps": "16-20",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w6_d4_e6",
      "name": "Rope Triceps Pressdown",
      "sets": 3,
      "reps": "16-20",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w6_d4_e7",
      "name": "Crossover Crunch",
      "sets": 3,
      "reps": "16-20",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w6_d4_e8",
      "name": "Cable Woodchopper",
      "sets": 3,
      "reps": "16-20",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     }
    ]
   },
   {
    "dayNumber": 35,
    "title": "Phase 3: Week 6 - Workout 5: Shoulders, Legs, Calves (Single Joint)",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "sts_w6_d5_e1",
      "name": "Dumbbell Lateral Raise",
      "sets": 4,
      "reps": "16-20",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w6_d5_e2",
      "name": "Cable Front Raise",
      "sets": 3,
      "reps": "16-20",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w6_d5_e3",
      "name": "Lying Cable Rear Delt Flye",
      "sets": 3,
      "reps": "16-20",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w6_d5_e4",
      "name": "Leg Extension",
      "sets": 4,
      "reps": "16-20",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w6_d5_e5",
      "name": "Leg Curl",
      "sets": 4,
      "reps": "16-20",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w6_d5_e6",
      "name": "Seated Calf Raise",
      "sets": 3,
      "reps": "16-20",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w6_d5_e7",
      "name": "Donkey or Leg Press Calf Raise",
      "sets": 3,
      "reps": "16-20",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     }
    ]
   },
   {
    "dayNumber": 36,
    "title": "Phase 3: Week 6 - Workout 6: Back, Traps, Biceps (Single Joint)",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "sts_w6_d6_e1",
      "name": "Lat Pulldown",
      "sets": 4,
      "reps": "16-20",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w6_d6_e2",
      "name": "Behind-the-Neck Pulldown",
      "sets": 3,
      "reps": "16-20",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w6_d6_e3",
      "name": "Rope Straight-Arm Pulldown",
      "sets": 3,
      "reps": "16-20",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w6_d6_e4",
      "name": "Dumbbell Shrug",
      "sets": 4,
      "reps": "16-20",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w6_d6_e5",
      "name": "EZ-Bar Cable Curl",
      "sets": 3,
      "reps": "16-20",
      "restSeconds": 60,
      "type": "standard",
      "notes": "1 minute of cardio acceleration between sets."
     },
     {
      "id": "sts_w6_d6_e6",
      "name": "Incline Dumbbell Curl",
      "sets": 3,
      "reps": "16-20",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w6_d6_e7",
      "name": "Dumbbell Hammer Curl",
      "sets": 3,
      "reps": "16-20",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     },
     {
      "id": "sts_w6_d6_e8",
      "name": "Dumbbell Reverse Wrist Curl",
      "sets": 3,
      "reps": "16-20",
      "restSeconds": 60,
      "type": "dropset",
      "notes": "1 min cardio acceleration between sets. Last set: cardio accelerated rest-pause dropset."
     }
    ]
   }
  ]
 },
 {
  "id": "kris_gethin_dtp_split",
  "title": "Kris Gethin DTP 4-Day Split",
  "description": "A high-volume Dramatic Transformation Principle (DTP) routine combining opposing muscle groups in intense superset pyramids. Follows a 2 days on, 1 day off training cycle.",
  "tags": [
   "DTP",
   "Hypertrophy",
   "Supersets",
   "Kris Gethin"
  ],
  "days": [
   {
    "dayNumber": 1,
    "title": "Legs + Upper Abs",
    "estimatedMinutes": 80,
    "exercises": [
     {
      "id": "dtp_d1_e1",
      "name": "Leg Press",
      "sets": 10,
      "reps": "50, 40, 30, 20, 10, 10, 20, 30, 40, 50",
      "restSeconds": 0,
      "type": "dtp",
      "notes": "Superset with Calf Press."
     },
     {
      "id": "dtp_d1_e2",
      "name": "Calf Press",
      "sets": 10,
      "reps": "40, 30, 20, 10, 10, 10, 10, 20, 30, 40",
      "restSeconds": 90,
      "type": "dtp",
      "notes": "Superset with Leg Press. Rest varies between sets: 45s, 60s, 90s, 90s, 120s on the way down. 120s, 90s, 90s, 60s, 120s on the way up."
     },
     {
      "id": "dtp_d1_e3",
      "name": "Decline Crunch",
      "sets": 5,
      "reps": "Failure",
      "restSeconds": 60,
      "type": "standard",
      "notes": "5 sets to failure."
     }
    ]
   },
   {
    "dayNumber": 2,
    "title": "Chest + Back",
    "estimatedMinutes": 75,
    "exercises": [
     {
      "id": "dtp_d2_e1",
      "name": "Incline Press",
      "sets": 5,
      "reps": "30, 20, 10, 5, 5",
      "restSeconds": 0,
      "type": "dtp",
      "notes": "Superset with Bent Lat Row."
     },
     {
      "id": "dtp_d2_e2",
      "name": "Bent Lat Row",
      "sets": 5,
      "reps": "30, 20, 10, 5, 5",
      "restSeconds": 60,
      "type": "dtp",
      "notes": "Superset with Incline Press. Rest intervals per set: 45s, 45s, 60s, 90s, 120s."
     },
     {
      "id": "dtp_d2_e3",
      "name": "Bench Press",
      "sets": 5,
      "reps": "5, 5, 10, 20, 30",
      "restSeconds": 0,
      "type": "dtp",
      "notes": "Superset with Bent Trap Row."
     },
     {
      "id": "dtp_d2_e4",
      "name": "Bent Trap Row",
      "sets": 5,
      "reps": "5, 5, 10, 20, 30",
      "restSeconds": 60,
      "type": "dtp",
      "notes": "Superset with Bench Press. Rest intervals per set: 120s, 90s, 60s, 45s, 45s."
     }
    ]
   },
   {
    "dayNumber": 3,
    "title": "Rest Day",
    "estimatedMinutes": 0,
    "exercises": []
   },
   {
    "dayNumber": 4,
    "title": "Arms + Lower Abs",
    "estimatedMinutes": 75,
    "exercises": [
     {
      "id": "dtp_d4_e1",
      "name": "Cable Curl",
      "sets": 5,
      "reps": "40, 30, 20, 10, 10",
      "restSeconds": 0,
      "type": "dtp",
      "notes": "Superset with Triceps Extension."
     },
     {
      "id": "dtp_d4_e2",
      "name": "Triceps Extension",
      "sets": 5,
      "reps": "40, 30, 20, 10, 10",
      "restSeconds": 60,
      "type": "dtp",
      "notes": "Superset with Cable Curl. Rest intervals per set: 45s, 45s, 60s, 90s, 120s."
     },
     {
      "id": "dtp_d4_e3",
      "name": "Barbell Curl",
      "sets": 5,
      "reps": "10, 10, 20, 30, 40",
      "restSeconds": 0,
      "type": "dtp",
      "notes": "Superset with Skull Crusher."
     },
     {
      "id": "dtp_d4_e4",
      "name": "Skull Crusher",
      "sets": 5,
      "reps": "10, 10, 20, 30, 40",
      "restSeconds": 60,
      "type": "dtp",
      "notes": "Superset with Barbell Curl. Rest intervals per set: 120s, 90s, 60s, 45s, 45s."
     },
     {
      "id": "dtp_d4_e5",
      "name": "Hanging Leg Raise",
      "sets": 5,
      "reps": "Failure",
      "restSeconds": 60,
      "type": "standard",
      "notes": "5 sets to failure."
     }
    ]
   },
   {
    "dayNumber": 5,
    "title": "Shoulder + Traps",
    "estimatedMinutes": 70,
    "exercises": [
     {
      "id": "dtp_d5_e1",
      "name": "Military Press",
      "sets": 5,
      "reps": "40, 30, 20, 15, 10",
      "restSeconds": 0,
      "type": "dtp",
      "notes": "Superset with Upright Row."
     },
     {
      "id": "dtp_d5_e2",
      "name": "Upright Row",
      "sets": 5,
      "reps": "40, 30, 20, 15, 10",
      "restSeconds": 60,
      "type": "dtp",
      "notes": "Superset with Military Press. Rest intervals per set: 45s, 45s, 60s, 90s, 120s."
     },
     {
      "id": "dtp_d5_e3",
      "name": "Arnold Press",
      "sets": 5,
      "reps": "10, 15, 20, 30, 40",
      "restSeconds": 0,
      "type": "dtp",
      "notes": "Superset with Shrug."
     },
     {
      "id": "dtp_d5_e4",
      "name": "Shrug",
      "sets": 5,
      "reps": "10, 15, 20, 30, 40",
      "restSeconds": 60,
      "type": "dtp",
      "notes": "Superset with Arnold Press. Rest intervals per set: 120s, 90s, 60s, 45s, 45s."
     }
    ]
   },
   {
    "dayNumber": 6,
    "title": "Rest Day",
    "estimatedMinutes": 0,
    "exercises": []
   }
  ]
 },
 {
  "id": "kris_gethin_legacy_12wk",
  "title": "Kris Gethin's Legacy 12-Week Fat Loss Trainer",
  "description": "A brutal 12-week fat loss and hypertrophy protocol using Y3T, DTP, supersets, and escalating daily cardio sessions. This program demands absolute adherence.",
  "tags": [
   "Fat Loss",
   "12 Weeks",
   "DTP",
   "Y3T",
   "Advanced"
  ],
  "days": [
   {
    "dayNumber": 1,
    "title": "Week 1: Legs & Calves",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "w1_d1_e1",
      "name": "Leg Press",
      "sets": 4,
      "reps": "10-12",
      "restSeconds": 90,
      "type": "standard",
      "notes": "May want to use knee sleeves, knee wraps, etc. Stretch in between sets."
     },
     {
      "id": "w1_d1_e2",
      "name": "Hack Squat",
      "sets": 4,
      "reps": "10-12",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Optional: Use a foam roller behind your shoulders."
     },
     {
      "id": "w1_d1_e3",
      "name": "Split Squat with Barbell Plate",
      "sets": 4,
      "reps": "10-12",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Use a training journal. This is important to track your progress."
     },
     {
      "id": "w1_d1_e4",
      "name": "Stiff Legged Deadlifts",
      "sets": 4,
      "reps": "10-12",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Can use dumbbells, barbells, smith machine, whatever is available."
     },
     {
      "id": "w1_d1_e5",
      "name": "Lying Hamstring Curls",
      "sets": 4,
      "reps": "10-12",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w1_d1_e6",
      "name": "Seated Leg Curls",
      "sets": 4,
      "reps": "10-12",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w1_d1_e7",
      "name": "Standing Calf Press",
      "sets": 6,
      "reps": "10-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w1_d1_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "20 mins",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "20 minutes AM ONLY + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 2,
    "title": "Week 1: Shoulders & Abs",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "w1_d2_e1",
      "name": "Plate Side Raises",
      "sets": 4,
      "reps": "10-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "If you have shoulder issues you can go higher in reps, 15-17 reps."
     },
     {
      "id": "w1_d2_e2",
      "name": "Partial Side Raises",
      "sets": 4,
      "reps": "10-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w1_d2_e3",
      "name": "Rear Dumbbell Raises",
      "sets": 4,
      "reps": "10-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Chest supported on bench."
     },
     {
      "id": "w1_d2_e4",
      "name": "Incline Cable Front Raises",
      "sets": 4,
      "reps": "10-12",
      "restSeconds": 0,
      "type": "superset",
      "notes": "Superset with Facepulls."
     },
     {
      "id": "w1_d2_e5",
      "name": "Facepulls",
      "sets": 4,
      "reps": "10-12",
      "restSeconds": 90,
      "type": "superset",
      "notes": "Superset with Incline Cable Front Raises."
     },
     {
      "id": "w1_d2_e6",
      "name": "Neck Crunches with Plate",
      "sets": 5,
      "reps": "10-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Put a towel in between your forehead and the plate. Rest 45-60s."
     },
     {
      "id": "w1_d2_e7",
      "name": "Hanging Leg Raises",
      "sets": 5,
      "reps": "Failure",
      "restSeconds": 0,
      "type": "superset",
      "notes": "Use ab slings for the hanging leg raises. Go to failure but aim for 20 reps. Superset with Kneeling Cable Crunches."
     },
     {
      "id": "w1_d2_e8",
      "name": "Kneeling Cable Crunches",
      "sets": 5,
      "reps": "Failure",
      "restSeconds": 45,
      "type": "superset",
      "notes": "Superset with Hanging Leg Raises."
     },
     {
      "id": "w1_d2_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "20 mins",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "20 minutes AM ONLY + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 3,
    "title": "Week 1: Chest",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "w1_d3_e1",
      "name": "Pec Deck",
      "sets": 4,
      "reps": "10-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Look at an anatomy chart to see the muscles of the chest. This will help you with the mind muscle connection."
     },
     {
      "id": "w1_d3_e2",
      "name": "Smith Machine Incline Press",
      "sets": 4,
      "reps": "10-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "You'll need an adjustable bench."
     },
     {
      "id": "w1_d3_e3",
      "name": "Smith Machine Flat Press",
      "sets": 4,
      "reps": "10-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "You'll need an adjustable bench."
     },
     {
      "id": "w1_d3_e4",
      "name": "Incline Cable Fly",
      "sets": 4,
      "reps": "10-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "You'll need an adjustable bench."
     },
     {
      "id": "w1_d3_e5",
      "name": "Cable Crossovers",
      "sets": 4,
      "reps": "10-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w1_d3_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "20 mins",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "20 minutes AM ONLY + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 4,
    "title": "Week 1: Back & Calves",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "w1_d4_e1",
      "name": "Neutral Grip Lat Pulldown",
      "sets": 4,
      "reps": "10-12",
      "restSeconds": 120,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w1_d4_e2",
      "name": "Neutral Grip Cable Row",
      "sets": 4,
      "reps": "10-12",
      "restSeconds": 120,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w1_d4_e3",
      "name": "Bent Over Barbell Row",
      "sets": 4,
      "reps": "10-12",
      "restSeconds": 120,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w1_d4_e4",
      "name": "Single Arm Dumbbell Row",
      "sets": 4,
      "reps": "10-12",
      "restSeconds": 120,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w1_d4_e5",
      "name": "Seated Calf Raises",
      "sets": 6,
      "reps": "10-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w1_d4_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "20 mins",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "20 minutes AM ONLY + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 5,
    "title": "Week 1: Arms",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "w1_d5_e1",
      "name": "Barbell Preacher Curls",
      "sets": 4,
      "reps": "10-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Good for the bottom portion of the bicep."
     },
     {
      "id": "w1_d5_e2",
      "name": "Cable Curls",
      "sets": 4,
      "reps": "10-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Good for the top portion of the bicep."
     },
     {
      "id": "w1_d5_e3",
      "name": "Barbell Curls",
      "sets": 4,
      "reps": "10-12",
      "restSeconds": 0,
      "type": "superset",
      "notes": "Superset with Plate Hammer Curls."
     },
     {
      "id": "w1_d5_e4",
      "name": "Plate Hammer Curls",
      "sets": 4,
      "reps": "10-12",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Hammer curls work the outer part of the bicep. Superset with Barbell Curls."
     },
     {
      "id": "w1_d5_e5",
      "name": "Cable Pushdowns",
      "sets": 4,
      "reps": "10-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w1_d5_e6",
      "name": "Overhead Cable Extensions",
      "sets": 4,
      "reps": "10-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w1_d5_e7",
      "name": "Dips",
      "sets": 4,
      "reps": "10-12",
      "restSeconds": 0,
      "type": "superset",
      "notes": "Superset with Close Grip Pushups."
     },
     {
      "id": "w1_d5_e8",
      "name": "Close Grip Pushups",
      "sets": 4,
      "reps": "10-12",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Superset with Dips."
     },
     {
      "id": "w1_d5_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "20 mins",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "20 minutes AM ONLY + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 6,
    "title": "Week 1: Active Rest Day",
    "estimatedMinutes": 25,
    "exercises": [
     {
      "id": "w1_d6_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "20 mins",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "20 minutes AM ONLY + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 7,
    "title": "Week 1: Active Rest Day",
    "estimatedMinutes": 25,
    "exercises": [
     {
      "id": "w1_d7_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "20 mins",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "20 minutes AM ONLY + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 8,
    "title": "Week 2: Legs & Calves",
    "estimatedMinutes": 75,
    "exercises": [
     {
      "id": "w2_d8_e1",
      "name": "Leg Extension",
      "sets": 4,
      "reps": "14-18",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w2_d8_e2",
      "name": "Parallel Leg Press",
      "sets": 4,
      "reps": "14-18",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w2_d8_e3",
      "name": "V Squat",
      "sets": 4,
      "reps": "14-18",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w2_d8_e4",
      "name": "Sissy Squat",
      "sets": 4,
      "reps": "14-18",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w2_d8_e5",
      "name": "Lying Hamstring Curl",
      "sets": 4,
      "reps": "14-18",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w2_d8_e6",
      "name": "Standing Hamstring Curl",
      "sets": 4,
      "reps": "14-18",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w2_d8_e7",
      "name": "Standing Calf Press",
      "sets": 6,
      "reps": "14-18",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w2_d8_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "30 mins",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "30 minutes AM ONLY + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 9,
    "title": "Week 2: Shoulders & Abs",
    "estimatedMinutes": 75,
    "exercises": [
     {
      "id": "w2_d9_e1",
      "name": "Side Raises",
      "sets": 4,
      "reps": "14-18",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w2_d9_e2",
      "name": "Cable Rear Raises",
      "sets": 4,
      "reps": "14-18",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w2_d9_e3",
      "name": "EZ Bar Front Raises",
      "sets": 4,
      "reps": "14-18",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w2_d9_e4",
      "name": "Dumbbell Upright Row",
      "sets": 4,
      "reps": "14-18",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Might want to use wrist straps for this."
     },
     {
      "id": "w2_d9_e5",
      "name": "Machine Shoulder Press",
      "sets": 4,
      "reps": "14-18",
      "restSeconds": 0,
      "type": "superset",
      "notes": "Superset with Neck Crunches."
     },
     {
      "id": "w2_d9_e6",
      "name": "Neck Crunches",
      "sets": 4,
      "reps": "14-18",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Superset with Machine Shoulder Press."
     },
     {
      "id": "w2_d9_e7",
      "name": "Lying Leg Raises",
      "sets": 5,
      "reps": "Failure",
      "restSeconds": 0,
      "type": "superset",
      "notes": "Superset with Crunches."
     },
     {
      "id": "w2_d9_e8",
      "name": "Crunches",
      "sets": 5,
      "reps": "Failure",
      "restSeconds": 45,
      "type": "superset",
      "notes": "Use medicine ball if you have one. Superset with Lying Leg Raises."
     },
     {
      "id": "w2_d9_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "30 mins",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "30 minutes AM ONLY + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 10,
    "title": "Week 2: Chest",
    "estimatedMinutes": 75,
    "exercises": [
     {
      "id": "w2_d10_e1",
      "name": "Flat Dumbbell Press",
      "sets": 4,
      "reps": "14-18",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Warm up with resistance band 'sword pulls'."
     },
     {
      "id": "w2_d10_e2",
      "name": "Incline Smith Machine Press",
      "sets": 4,
      "reps": "14-18",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w2_d10_e3",
      "name": "Flat Cable Fly",
      "sets": 4,
      "reps": "14-18",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w2_d10_e4",
      "name": "Landmine Incline Press",
      "sets": 4,
      "reps": "14-18",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w2_d10_e5",
      "name": "Dips",
      "sets": 4,
      "reps": "Failure",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w2_d10_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "30 mins",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "30 minutes AM ONLY + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 11,
    "title": "Week 2: Back & Calves",
    "estimatedMinutes": 75,
    "exercises": [
     {
      "id": "w2_d11_e1",
      "name": "Chins",
      "sets": 4,
      "reps": "Failure",
      "restSeconds": 120,
      "type": "standard",
      "notes": "Use wrist straps."
     },
     {
      "id": "w2_d11_e2",
      "name": "Reverse Grip Lat Pulldown",
      "sets": 4,
      "reps": "14-18",
      "restSeconds": 120,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w2_d11_e3",
      "name": "T Bar Rows",
      "sets": 4,
      "reps": "14-18",
      "restSeconds": 120,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w2_d11_e4",
      "name": "Cable Row",
      "sets": 4,
      "reps": "14-18",
      "restSeconds": 120,
      "type": "standard",
      "notes": "You can use a machine if cable row is not available."
     },
     {
      "id": "w2_d11_e5",
      "name": "Shrugs",
      "sets": 4,
      "reps": "14-18",
      "restSeconds": 120,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w2_d11_e6",
      "name": "Seated Calf Raises",
      "sets": 6,
      "reps": "14-18",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w2_d11_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "30 mins",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "30 minutes AM ONLY + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 12,
    "title": "Week 2: Arms",
    "estimatedMinutes": 75,
    "exercises": [
     {
      "id": "w2_d12_e1",
      "name": "TRICEPS CIRCUIT: Cable Pushdowns + Skull Crushers + Rockers + Close Grip Press + Bench Dips + Overhead Tricep Extension",
      "sets": 4,
      "reps": "14-18",
      "restSeconds": 90,
      "type": "circuit",
      "notes": "Rest only after you've completed all of the exercises, no rest between exercises."
     },
     {
      "id": "w2_d12_e2",
      "name": "BICEPS CIRCUIT: Alternating Dumbbell Curls + Leaning Forward Cable in Between Your Legs Curls + Preacher Curls with Barbell Plate + Drag Curls + Row Curls / Kneeling Curls",
      "sets": 4,
      "reps": "14-18",
      "restSeconds": 90,
      "type": "circuit",
      "notes": "Rest only after you've completed all of the exercises, no rest between exercises."
     },
     {
      "id": "w2_d12_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "30 mins",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "30 minutes AM ONLY + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 13,
    "title": "Week 2: Active Rest Day",
    "estimatedMinutes": 35,
    "exercises": [
     {
      "id": "w2_d13_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "30 mins",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "30 minutes AM ONLY + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 14,
    "title": "Week 2: Active Rest Day",
    "estimatedMinutes": 35,
    "exercises": [
     {
      "id": "w2_d14_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "30 mins",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "30 minutes AM ONLY + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 15,
    "title": "Week 3: Legs & Calves (DTP)",
    "estimatedMinutes": 85,
    "exercises": [
     {
      "id": "w3_d15_e1",
      "name": "Hack Squat",
      "sets": 5,
      "reps": "35, 30, 25, 20, 15",
      "restSeconds": 90,
      "type": "dtp",
      "notes": "Rest 45-90 seconds. Resting less between the high reps, more during the lower reps."
     },
     {
      "id": "w3_d15_e2",
      "name": "Vertical Leg Press",
      "sets": 5,
      "reps": "15, 20, 25, 30, 35",
      "restSeconds": 90,
      "type": "dtp",
      "notes": "Rest 45-90 seconds."
     },
     {
      "id": "w3_d15_e3",
      "name": "Seated Leg Curl",
      "sets": 5,
      "reps": "35, 30, 25, 20, 15",
      "restSeconds": 90,
      "type": "dtp",
      "notes": "Rest 45-90 seconds."
     },
     {
      "id": "w3_d15_e4",
      "name": "Leg Extension",
      "sets": 5,
      "reps": "15, 20, 25, 30, 35",
      "restSeconds": 90,
      "type": "dtp",
      "notes": "Rest 45-90 seconds."
     },
     {
      "id": "w3_d15_e5",
      "name": "Standing Calf Press",
      "sets": 6,
      "reps": "30, 20, 10, 10, 20, 30",
      "restSeconds": 45,
      "type": "dtp",
      "notes": "DTP rep scheme."
     },
     {
      "id": "w3_d15_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "35 mins",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "35 minutes AM ONLY + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 16,
    "title": "Week 3: Shoulders & Abs (DTP)",
    "estimatedMinutes": 85,
    "exercises": [
     {
      "id": "w3_d16_e1",
      "name": "Smith Machine Shoulder Press",
      "sets": 5,
      "reps": "30, 25, 20, 15, 10",
      "restSeconds": 60,
      "type": "dtp",
      "notes": ""
     },
     {
      "id": "w3_d16_e2",
      "name": "Upright Cable Rows",
      "sets": 5,
      "reps": "10, 15, 20, 25, 30",
      "restSeconds": 60,
      "type": "dtp",
      "notes": ""
     },
     {
      "id": "w3_d16_e3",
      "name": "Cable Rear Delts",
      "sets": 5,
      "reps": "30, 25, 20, 15, 10",
      "restSeconds": 60,
      "type": "dtp",
      "notes": ""
     },
     {
      "id": "w3_d16_e4",
      "name": "Machine Side Raises",
      "sets": 5,
      "reps": "10, 15, 20, 25, 30",
      "restSeconds": 60,
      "type": "dtp",
      "notes": ""
     },
     {
      "id": "w3_d16_e5",
      "name": "Weighted Scissor Crunch",
      "sets": 5,
      "reps": "Failure",
      "restSeconds": 45,
      "type": "dtp",
      "notes": ""
     },
     {
      "id": "w3_d16_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "35 mins",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "35 minutes AM ONLY + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 17,
    "title": "Week 3: Chest (DTP)",
    "estimatedMinutes": 85,
    "exercises": [
     {
      "id": "w3_d17_e1",
      "name": "Incline Machine Press",
      "sets": 5,
      "reps": "35, 30, 25, 20, 15",
      "restSeconds": 90,
      "type": "dtp",
      "notes": ""
     },
     {
      "id": "w3_d17_e2",
      "name": "Flat Machine Press",
      "sets": 5,
      "reps": "15, 20, 25, 30, 35",
      "restSeconds": 90,
      "type": "dtp",
      "notes": ""
     },
     {
      "id": "w3_d17_e3",
      "name": "Incline Cable Fly",
      "sets": 5,
      "reps": "35, 30, 25, 20, 15",
      "restSeconds": 90,
      "type": "dtp",
      "notes": ""
     },
     {
      "id": "w3_d17_e4",
      "name": "Pec Deck",
      "sets": 5,
      "reps": "15, 20, 25, 30, 35",
      "restSeconds": 90,
      "type": "dtp",
      "notes": ""
     },
     {
      "id": "w3_d17_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "35 mins",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "35 minutes AM ONLY + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 18,
    "title": "Week 3: Back & Calves (DTP)",
    "estimatedMinutes": 85,
    "exercises": [
     {
      "id": "w3_d18_e1",
      "name": "Bent Over Machine Row",
      "sets": 5,
      "reps": "30, 25, 20, 15, 10",
      "restSeconds": 120,
      "type": "dtp",
      "notes": "Rest 90-120 seconds."
     },
     {
      "id": "w3_d18_e2",
      "name": "Seated Machine Low Pulley Row",
      "sets": 5,
      "reps": "10, 15, 20, 25, 30",
      "restSeconds": 120,
      "type": "dtp",
      "notes": "Rest 90-120 seconds."
     },
     {
      "id": "w3_d18_e3",
      "name": "Machine Pulldown",
      "sets": 5,
      "reps": "30, 25, 20, 15, 10",
      "restSeconds": 120,
      "type": "dtp",
      "notes": "Rest 90-120 seconds."
     },
     {
      "id": "w3_d18_e4",
      "name": "Close Grip Pulldown",
      "sets": 5,
      "reps": "10, 15, 20, 25, 30",
      "restSeconds": 120,
      "type": "dtp",
      "notes": "Rest 90-120 seconds."
     },
     {
      "id": "w3_d18_e5",
      "name": "Seated Calf Press",
      "sets": 6,
      "reps": "30, 20, 10, 10, 20, 30",
      "restSeconds": 90,
      "type": "dtp",
      "notes": "Rest 60-90 seconds."
     },
     {
      "id": "w3_d18_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "35 mins",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "35 minutes AM ONLY + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 19,
    "title": "Week 3: Arms (DTP)",
    "estimatedMinutes": 85,
    "exercises": [
     {
      "id": "w3_d19_e1",
      "name": "Cable Curls",
      "sets": 5,
      "reps": "30, 25, 20, 15, 10",
      "restSeconds": 60,
      "type": "dtp",
      "notes": ""
     },
     {
      "id": "w3_d19_e2",
      "name": "Preacher Curls",
      "sets": 5,
      "reps": "10, 15, 20, 25, 30",
      "restSeconds": 60,
      "type": "dtp",
      "notes": ""
     },
     {
      "id": "w3_d19_e3",
      "name": "Cable Pushdown",
      "sets": 5,
      "reps": "30, 25, 20, 15, 10",
      "restSeconds": 60,
      "type": "dtp",
      "notes": ""
     },
     {
      "id": "w3_d19_e4",
      "name": "Lying Cable Extensions",
      "sets": 5,
      "reps": "10, 15, 20, 25, 30",
      "restSeconds": 60,
      "type": "dtp",
      "notes": ""
     },
     {
      "id": "w3_d19_e5",
      "name": "Overhead Tricep Cable Extension",
      "sets": 5,
      "reps": "10-15",
      "restSeconds": 0,
      "type": "superset",
      "notes": "Superset with EZ Bar Curls."
     },
     {
      "id": "w3_d19_e6",
      "name": "EZ Bar Curls",
      "sets": 5,
      "reps": "10-15",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Superset with Overhead Tricep Cable Extension."
     },
     {
      "id": "w3_d19_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "35 mins",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "35 minutes AM ONLY + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 20,
    "title": "Week 3: Active Rest Day",
    "estimatedMinutes": 40,
    "exercises": [
     {
      "id": "w3_d20_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "35 mins",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "35 minutes AM ONLY + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 21,
    "title": "Week 3: Active Rest Day",
    "estimatedMinutes": 40,
    "exercises": [
     {
      "id": "w3_d21_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "35 mins",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "35 minutes AM ONLY + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 22,
    "title": "Week 4: Legs & Calves",
    "estimatedMinutes": 95,
    "exercises": [
     {
      "id": "w4_d22_e1",
      "name": "Box Squats",
      "sets": 4,
      "reps": "12-15",
      "restSeconds": 120,
      "type": "standard",
      "notes": "Rest 90-120 seconds."
     },
     {
      "id": "w4_d22_e2",
      "name": "Leg Press",
      "sets": 4,
      "reps": "12-15",
      "restSeconds": 120,
      "type": "standard",
      "notes": "Place feet at the bottom. Rest 90-120 seconds."
     },
     {
      "id": "w4_d22_e3",
      "name": "Split Squat",
      "sets": 4,
      "reps": "12-15",
      "restSeconds": 120,
      "type": "standard",
      "notes": "Rest 90-120 seconds."
     },
     {
      "id": "w4_d22_e4",
      "name": "Unilateral Lying Hamstring Curl",
      "sets": 4,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w4_d22_e5",
      "name": "Smith Machine Deadlifts",
      "sets": 4,
      "reps": "12-15",
      "restSeconds": 120,
      "type": "standard",
      "notes": "Rest 90-120 seconds."
     },
     {
      "id": "w4_d22_e6",
      "name": "Donkey Calf Press",
      "sets": 6,
      "reps": "12-15",
      "restSeconds": 45,
      "type": "standard",
      "notes": "As long as legs are straight can be done on smith machine or standing press."
     },
     {
      "id": "w4_d22_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "35m AM / 20m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 35 minutes AM / 20 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 23,
    "title": "Week 4: Shoulders & Abs",
    "estimatedMinutes": 95,
    "exercises": [
     {
      "id": "w4_d23_e1",
      "name": "Single Arm Cable Side Raises",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w4_d23_e2",
      "name": "Partial Side Raises",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Use resistance band."
     },
     {
      "id": "w4_d23_e3",
      "name": "Chest Supported Dumbbell Rear Raises",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w4_d23_e4",
      "name": "Front Cable Raises",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w4_d23_e5",
      "name": "Neck Crunches",
      "sets": 5,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Put towel between head and plate."
     },
     {
      "id": "w4_d23_e6",
      "name": "Ball Crunches",
      "sets": 5,
      "reps": "20",
      "restSeconds": 0,
      "type": "superset",
      "notes": "Superset with Ball Knee Tucks."
     },
     {
      "id": "w4_d23_e7",
      "name": "Ball Knee Tucks",
      "sets": 5,
      "reps": "20",
      "restSeconds": 45,
      "type": "superset",
      "notes": "Superset with Ball Crunches."
     },
     {
      "id": "w4_d23_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "35m AM / 20m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 35 minutes AM / 20 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 24,
    "title": "Week 4: Chest",
    "estimatedMinutes": 95,
    "exercises": [
     {
      "id": "w4_d24_e1",
      "name": "Pec Deck",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w4_d24_e2",
      "name": "V Bar Press",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w4_d24_e3",
      "name": "Dumbbell Press",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w4_d24_e4",
      "name": "Cable Crossover",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w4_d24_e5",
      "name": "Push-ups",
      "sets": 4,
      "reps": "Failure",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w4_d24_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "35m AM / 20m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 35 minutes AM / 20 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 25,
    "title": "Week 4: Back & Calves",
    "estimatedMinutes": 95,
    "exercises": [
     {
      "id": "w4_d25_e1",
      "name": "Reverse Grip Pulldowns",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 120,
      "type": "standard",
      "notes": "Rest 90-120 seconds."
     },
     {
      "id": "w4_d25_e2",
      "name": "Parallel Bent Over Barbell Row",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 120,
      "type": "standard",
      "notes": "Rest 90-120 seconds."
     },
     {
      "id": "w4_d25_e3",
      "name": "Reverse Grip Cable Row",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 120,
      "type": "standard",
      "notes": "Rest 90-120 seconds."
     },
     {
      "id": "w4_d25_e4",
      "name": "Chest Supported Dumbbell Row on Incline Bench",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 120,
      "type": "standard",
      "notes": "Rest 90-120 seconds."
     },
     {
      "id": "w4_d25_e5",
      "name": "Shrugs",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 0,
      "type": "superset",
      "notes": "Superset with Seated Calf Press."
     },
     {
      "id": "w4_d25_e6",
      "name": "Seated Calf Press",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Superset with Shrugs."
     },
     {
      "id": "w4_d25_e7",
      "name": "Seated Calf Press",
      "sets": 2,
      "reps": "8-12",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Additional straight sets."
     },
     {
      "id": "w4_d25_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "35m AM / 20m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 35 minutes AM / 20 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 26,
    "title": "Week 4: Arms",
    "estimatedMinutes": 95,
    "exercises": [
     {
      "id": "w4_d26_e1",
      "name": "Incline Tricep Pushdown",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w4_d26_e2",
      "name": "Overhead Tricep Cable Extension with Free Range Handles",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w4_d26_e3",
      "name": "Parallel Bar Dips",
      "sets": 4,
      "reps": "Failure",
      "restSeconds": 0,
      "type": "superset",
      "notes": "Superset with Incline Close Grip Push-ups."
     },
     {
      "id": "w4_d26_e4",
      "name": "Incline Close Grip Push-ups",
      "sets": 4,
      "reps": "Failure",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Superset with Parallel Bar Dips."
     },
     {
      "id": "w4_d26_e5",
      "name": "Arnold Dumbbell Curl with Resistance Band",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w4_d26_e6",
      "name": "Spider Curls",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w4_d26_e7",
      "name": "Preacher Hammer Curl",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w4_d26_e8",
      "name": "Drag Curls",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w4_d26_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "35m AM / 20m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 35 minutes AM / 20 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 27,
    "title": "Week 4: Active Rest Day",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "w4_d27_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "35m AM / 20m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 35 minutes AM / 20 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 28,
    "title": "Week 4: Active Rest Day",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "w4_d28_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "35m AM / 20m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 35 minutes AM / 20 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 29,
    "title": "Week 5: Legs & Calves",
    "estimatedMinutes": 105,
    "exercises": [
     {
      "id": "w5_d29_e1",
      "name": "Unilateral Leg Extension",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 0,
      "type": "standard",
      "notes": "No rest."
     },
     {
      "id": "w5_d29_e2",
      "name": "Wedge Squat",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 120,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w5_d29_e3",
      "name": "Unilateral Leg Press",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 0,
      "type": "standard",
      "notes": "No rest."
     },
     {
      "id": "w5_d29_e4",
      "name": "Standing Single Leg Curl",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 0,
      "type": "standard",
      "notes": "No rest."
     },
     {
      "id": "w5_d29_e5",
      "name": "Lying Hamstring Curls",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 0,
      "type": "superset",
      "notes": "Superset with Standing Calf Press."
     },
     {
      "id": "w5_d29_e6",
      "name": "Standing Calf Press",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 90,
      "type": "superset",
      "notes": "Superset with Lying Hamstring Curls."
     },
     {
      "id": "w5_d29_e7",
      "name": "Standing Calf Press",
      "sets": 2,
      "reps": "16-18",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Additional straight sets."
     },
     {
      "id": "w5_d29_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "35m AM / 35m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 35 minutes AM / 35 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 30,
    "title": "Week 5: Shoulders & Abs",
    "estimatedMinutes": 105,
    "exercises": [
     {
      "id": "w5_d30_e1",
      "name": "Chest Supported Side to Front Raise",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w5_d30_e2",
      "name": "Seated Side Raises Single Drop Set",
      "sets": 4,
      "reps": "8/10",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w5_d30_e3",
      "name": "Seated Reverse Grip Shoulder Press with EZ Bar",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 0,
      "type": "superset",
      "notes": "Superset with Chest Supported Dumbbell Rear Raises."
     },
     {
      "id": "w5_d30_e4",
      "name": "Chest Supported Dumbbell Rear Raises",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Superset with Seated Reverse Grip Shoulder Press."
     },
     {
      "id": "w5_d30_e5",
      "name": "Single Arm Dumbbell Press",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 0,
      "type": "superset",
      "notes": "Superset with Neck Crunches."
     },
     {
      "id": "w5_d30_e6",
      "name": "Neck Crunches",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Superset with Single Arm Dumbbell Press."
     },
     {
      "id": "w5_d30_e7",
      "name": "Hanging Leg Raises",
      "sets": 5,
      "reps": "12-20",
      "restSeconds": 0,
      "type": "superset",
      "notes": "Superset with Kneeling Cable Crunches."
     },
     {
      "id": "w5_d30_e8",
      "name": "Kneeling Cable Crunches",
      "sets": 5,
      "reps": "12-20",
      "restSeconds": 45,
      "type": "superset",
      "notes": "Superset with Hanging Leg Raises."
     },
     {
      "id": "w5_d30_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "35m AM / 35m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 35 minutes AM / 35 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 31,
    "title": "Week 5: Chest",
    "estimatedMinutes": 105,
    "exercises": [
     {
      "id": "w5_d31_e1",
      "name": "Flat Dumbbell Press",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w5_d31_e2",
      "name": "Seated Cable Press",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w5_d31_e3",
      "name": "Incline Dumbbell Press",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Use resistance band to create more tension at the top of the movement without too much weight."
     },
     {
      "id": "w5_d31_e4",
      "name": "Pec Deck",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w5_d31_e5",
      "name": "Incline Push-ups",
      "sets": 4,
      "reps": "Failure",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w5_d31_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "35m AM / 35m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 35 minutes AM / 35 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 32,
    "title": "Week 5: Back & Calves",
    "estimatedMinutes": 105,
    "exercises": [
     {
      "id": "w5_d32_e1",
      "name": "Neutral Grip Chins",
      "sets": 4,
      "reps": "Failure",
      "restSeconds": 120,
      "type": "standard",
      "notes": "Rest 90-120 seconds."
     },
     {
      "id": "w5_d32_e2",
      "name": "Reverse Grip Pulldown Machine",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 120,
      "type": "standard",
      "notes": "Rest 90-120 seconds."
     },
     {
      "id": "w5_d32_e3",
      "name": "Meadow Row",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 120,
      "type": "standard",
      "notes": "Rest 90-120 seconds."
     },
     {
      "id": "w5_d32_e4",
      "name": "Wide Grip Seated Cable Row",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 120,
      "type": "standard",
      "notes": "Rest 90-120 seconds."
     },
     {
      "id": "w5_d32_e5",
      "name": "Upright Rows",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 0,
      "type": "superset",
      "notes": "Superset with Seated Calf Press."
     },
     {
      "id": "w5_d32_e6",
      "name": "Seated Calf Press",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 90,
      "type": "superset",
      "notes": "Superset with Upright Rows."
     },
     {
      "id": "w5_d32_e7",
      "name": "Seated Calf Press",
      "sets": 2,
      "reps": "16-18",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Additional straight sets."
     },
     {
      "id": "w5_d32_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "35m AM / 35m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 35 minutes AM / 35 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 33,
    "title": "Week 5: Arms",
    "estimatedMinutes": 105,
    "exercises": [
     {
      "id": "w5_d33_e1",
      "name": "TRICEPS CIRCUIT: V Bar Cable Pushdowns + Skull Crushers + Parallel bar dips (to failure) + Bench Dips (to failure) + Overhead Dumbbell Extension",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 90,
      "type": "circuit",
      "notes": "Rest 60-90s only after you've completed all of the exercises, no rest between exercises."
     },
     {
      "id": "w5_d33_e2",
      "name": "BICEPS CIRCUIT: High Pulley Cable Curl + Barbell Curl + Spider Curl on an Incline Bench + Single Arm Dumbbell Curl + Double Hand Hammer Curl",
      "sets": 4,
      "reps": "14-18",
      "restSeconds": 90,
      "type": "circuit",
      "notes": "Rest 60-90s only after you've completed all of the exercises, no rest between exercises."
     },
     {
      "id": "w5_d33_e3",
      "name": "Cable Curls",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 0,
      "type": "superset",
      "notes": "Superset with V Bar Pushdowns."
     },
     {
      "id": "w5_d33_e4",
      "name": "V Bar Pushdowns",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Superset with Cable Curls."
     },
     {
      "id": "w5_d33_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "35m AM / 35m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 35 minutes AM / 35 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 34,
    "title": "Week 5: Active Rest Day",
    "estimatedMinutes": 75,
    "exercises": [
     {
      "id": "w5_d34_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "35m AM / 35m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 35 minutes AM / 35 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 35,
    "title": "Week 5: Active Rest Day",
    "estimatedMinutes": 75,
    "exercises": [
     {
      "id": "w5_d35_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "35m AM / 35m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 35 minutes AM / 35 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 36,
    "title": "Week 6: DTP Legs & Calves",
    "estimatedMinutes": 110,
    "exercises": [
     {
      "id": "w6_d36_e1",
      "name": "Pendulum Squat",
      "sets": 5,
      "reps": "35, 30, 25, 20, 15",
      "restSeconds": 120,
      "type": "dtp",
      "notes": "Can use Smith Machine or Barbell Squat. Use knee sleeves or wraps for heavier sets."
     },
     {
      "id": "w6_d36_e2",
      "name": "Vertical Leg Press",
      "sets": 5,
      "reps": "15, 20, 25, 30, 35",
      "restSeconds": 120,
      "type": "dtp",
      "notes": ""
     },
     {
      "id": "w6_d36_e3",
      "name": "Leg Extension",
      "sets": 5,
      "reps": "30, 20, 10, 20, 30",
      "restSeconds": 0,
      "type": "dtp superset",
      "notes": "Superset with Lying Hamstring Curls."
     },
     {
      "id": "w6_d36_e4",
      "name": "Lying Hamstring Curls",
      "sets": 5,
      "reps": "30, 20, 10, 20, 30",
      "restSeconds": 120,
      "type": "dtp superset",
      "notes": "Superset with Leg Extension."
     },
     {
      "id": "w6_d36_e5",
      "name": "Seated Calf Press",
      "sets": 5,
      "reps": "30, 20, 10, 20, 30",
      "restSeconds": 0,
      "type": "dtp superset",
      "notes": "Superset with Donkey Press."
     },
     {
      "id": "w6_d36_e6",
      "name": "Donkey Press",
      "sets": 5,
      "reps": "30, 20, 10, 20, 30",
      "restSeconds": 60,
      "type": "dtp superset",
      "notes": "Superset with Seated Calf Press."
     },
     {
      "id": "w6_d36_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "45m AM / 35m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 45 minutes AM / 35 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 37,
    "title": "Week 6: DTP Shoulders",
    "estimatedMinutes": 110,
    "exercises": [
     {
      "id": "w6_d37_e1",
      "name": "Machine Shoulder Press",
      "sets": 5,
      "reps": "30, 25, 20, 15, 10",
      "restSeconds": 90,
      "type": "dtp",
      "notes": "Rest 60-90s."
     },
     {
      "id": "w6_d37_e2",
      "name": "Upright Dumbbell Rows",
      "sets": 5,
      "reps": "10, 15, 20, 25, 30",
      "restSeconds": 90,
      "type": "dtp",
      "notes": "Rest 60-90s."
     },
     {
      "id": "w6_d37_e3",
      "name": "Machine Side Raises",
      "sets": 10,
      "reps": "30, 25, 20, 15, 10, 10, 15, 20, 25, 30",
      "restSeconds": 0,
      "type": "dtp superset",
      "notes": "Superset with Machine Rear Raises."
     },
     {
      "id": "w6_d37_e4",
      "name": "Machine Rear Raises",
      "sets": 10,
      "reps": "30, 25, 20, 15, 10, 10, 15, 20, 25, 30",
      "restSeconds": 90,
      "type": "dtp superset",
      "notes": "Rest 60-90s. Superset with Machine Side Raises."
     },
     {
      "id": "w6_d37_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "45m AM / 35m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 45 minutes AM / 35 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 38,
    "title": "Week 6: DTP Chest & Abs",
    "estimatedMinutes": 110,
    "exercises": [
     {
      "id": "w6_d38_e1",
      "name": "Cable Crossovers",
      "sets": 5,
      "reps": "30, 25, 20, 15, 10",
      "restSeconds": 60,
      "type": "dtp",
      "notes": ""
     },
     {
      "id": "w6_d38_e2",
      "name": "Seated Machine Press",
      "sets": 5,
      "reps": "10, 15, 20, 25, 30",
      "restSeconds": 60,
      "type": "dtp",
      "notes": ""
     },
     {
      "id": "w6_d38_e3",
      "name": "Decline Barbell Press",
      "sets": 10,
      "reps": "30, 25, 20, 15, 10, 10, 15, 20, 25, 30",
      "restSeconds": 0,
      "type": "dtp superset",
      "notes": "Superset with Incline Dumbbell Press."
     },
     {
      "id": "w6_d38_e4",
      "name": "Incline Dumbbell Press",
      "sets": 10,
      "reps": "30, 25, 20, 15, 10, 10, 15, 20, 25, 30",
      "restSeconds": 60,
      "type": "dtp superset",
      "notes": "Superset with Decline Barbell Press."
     },
     {
      "id": "w6_d38_e5",
      "name": "Sit-ups",
      "sets": 5,
      "reps": "Failure",
      "restSeconds": 0,
      "type": "superset",
      "notes": "Superset with Lying Leg Raises."
     },
     {
      "id": "w6_d38_e6",
      "name": "Lying Leg Raises",
      "sets": 5,
      "reps": "Failure",
      "restSeconds": 45,
      "type": "superset",
      "notes": "Superset with Sit-ups."
     },
     {
      "id": "w6_d38_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "45m AM / 35m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 45 minutes AM / 35 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 39,
    "title": "Week 6: DTP Back",
    "estimatedMinutes": 110,
    "exercises": [
     {
      "id": "w6_d39_e1",
      "name": "Seated Cable Row",
      "sets": 5,
      "reps": "30, 25, 20, 15, 10",
      "restSeconds": 60,
      "type": "dtp",
      "notes": ""
     },
     {
      "id": "w6_d39_e2",
      "name": "Reverse Grip Pulldown",
      "sets": 5,
      "reps": "10, 15, 20, 25, 30",
      "restSeconds": 60,
      "type": "dtp",
      "notes": ""
     },
     {
      "id": "w6_d39_e3",
      "name": "Bent Over Machine Row",
      "sets": 5,
      "reps": "30, 25, 20, 15, 10",
      "restSeconds": 60,
      "type": "dtp",
      "notes": ""
     },
     {
      "id": "w6_d39_e4",
      "name": "Barbell Shrugs",
      "sets": 5,
      "reps": "10, 15, 20, 25, 30",
      "restSeconds": 60,
      "type": "dtp",
      "notes": ""
     },
     {
      "id": "w6_d39_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "45m AM / 35m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 45 minutes AM / 35 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 40,
    "title": "Week 6: DTP Arms",
    "estimatedMinutes": 110,
    "exercises": [
     {
      "id": "w6_d40_e1",
      "name": "Wide Grip Cable Pushdown",
      "sets": 5,
      "reps": "30, 25, 20, 15, 10",
      "restSeconds": 60,
      "type": "dtp",
      "notes": ""
     },
     {
      "id": "w6_d40_e2",
      "name": "Overhead Tricep Extension",
      "sets": 5,
      "reps": "10, 15, 20, 25, 30",
      "restSeconds": 60,
      "type": "dtp",
      "notes": ""
     },
     {
      "id": "w6_d40_e3",
      "name": "Seated Dumbbell Curls",
      "sets": 5,
      "reps": "30, 25, 20, 15, 10",
      "restSeconds": 60,
      "type": "dtp",
      "notes": ""
     },
     {
      "id": "w6_d40_e4",
      "name": "EZ Bar Curls",
      "sets": 5,
      "reps": "10, 15, 20, 25, 30",
      "restSeconds": 60,
      "type": "dtp",
      "notes": ""
     },
     {
      "id": "w6_d40_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "45m AM / 35m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 45 minutes AM / 35 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 41,
    "title": "Week 6: Active Rest Day",
    "estimatedMinutes": 85,
    "exercises": [
     {
      "id": "w6_d41_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "45m AM / 35m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 45 minutes AM / 35 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 42,
    "title": "Week 6: Active Rest Day",
    "estimatedMinutes": 85,
    "exercises": [
     {
      "id": "w6_d42_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "45m AM / 35m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 45 minutes AM / 35 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 43,
    "title": "Week 7: Legs",
    "estimatedMinutes": 110,
    "exercises": [
     {
      "id": "w7_d43_e1",
      "name": "Hack squat",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w7_d43_e2",
      "name": "Sissy Squat",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w7_d43_e3",
      "name": "Leg Press",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w7_d43_e4",
      "name": "Walking Lunges",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w7_d43_e5",
      "name": "Split Squats",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w7_d43_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "45m AM / 35m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 45 minutes AM / 35 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 44,
    "title": "Week 7: Shoulders, Abs & Calves",
    "estimatedMinutes": 110,
    "exercises": [
     {
      "id": "w7_d44_e1",
      "name": "Standing Cable Rear Raises",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 0,
      "type": "superset",
      "notes": "Superset with Standing Lateral Raises."
     },
     {
      "id": "w7_d44_e2",
      "name": "Standing Lateral Raises",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Superset with Standing Cable Rear Raises."
     },
     {
      "id": "w7_d44_e3",
      "name": "Cable Shoulder Press",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w7_d44_e4",
      "name": "Standing Calf Raises",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 0,
      "type": "superset",
      "notes": "Superset with Neck Crunches."
     },
     {
      "id": "w7_d44_e5",
      "name": "Neck Crunches",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Superset with Standing Calf Raises."
     },
     {
      "id": "w7_d44_e6",
      "name": "V Crunches",
      "sets": 5,
      "reps": "Failure",
      "restSeconds": 45,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w7_d44_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "45m AM / 35m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 45 minutes AM / 35 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 45,
    "title": "Week 7: Chest",
    "estimatedMinutes": 110,
    "exercises": [
     {
      "id": "w7_d45_e1",
      "name": "Smith Machine Incline Press",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w7_d45_e2",
      "name": "Flat Cable Fly",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w7_d45_e3",
      "name": "Unilateral Low Incline Dumbbell Press",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w7_d45_e4",
      "name": "Decline Dumbbell Fly",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w7_d45_e5",
      "name": "Dumbbell V Press",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w7_d45_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "45m AM / 35m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 45 minutes AM / 35 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 46,
    "title": "Week 7: Back & Calves",
    "estimatedMinutes": 110,
    "exercises": [
     {
      "id": "w7_d46_e1",
      "name": "Hex bar Row",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w7_d46_e2",
      "name": "T bar Row",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w7_d46_e3",
      "name": "Chest Supported Cable Rows",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w7_d46_e4",
      "name": "Reverse Grip Dumbbell Bent Over Row",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w7_d46_e5",
      "name": "Rack Deadlifts",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w7_d46_e6",
      "name": "Seated Calf Press",
      "sets": 6,
      "reps": "16-18",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w7_d46_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "45m AM / 35m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 45 minutes AM / 35 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 47,
    "title": "Week 7: Arms",
    "estimatedMinutes": 110,
    "exercises": [
     {
      "id": "w7_d47_e1",
      "name": "Lying Tricep Cable Extension",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 0,
      "type": "superset",
      "notes": "Superset with Standing Bicep Cable Curls."
     },
     {
      "id": "w7_d47_e2",
      "name": "Standing Bicep Cable Curls",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Superset with Lying Tricep Cable Extension."
     },
     {
      "id": "w7_d47_e3",
      "name": "Overhead Dumbbell Tricep Extension",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 0,
      "type": "superset",
      "notes": "Superset with Barbell Preacher Curls."
     },
     {
      "id": "w7_d47_e4",
      "name": "Barbell Preacher Curls",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Superset with Overhead Dumbbell Tricep Ext."
     },
     {
      "id": "w7_d47_e5",
      "name": "Seated Dumbbell Curl",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 0,
      "type": "superset",
      "notes": "Superset with Parallel Bar Dips."
     },
     {
      "id": "w7_d47_e6",
      "name": "Parallel Bar Dips",
      "sets": 4,
      "reps": "Failure",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Superset with Seated Dumbbell Curl."
     },
     {
      "id": "w7_d47_e7",
      "name": "Unilateral Cable Curls",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 0,
      "type": "superset",
      "notes": "Superset with Close Grip Push-ups."
     },
     {
      "id": "w7_d47_e8",
      "name": "Close Grip Push-ups",
      "sets": 4,
      "reps": "Failure",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Superset with Unilateral Cable Curls."
     },
     {
      "id": "w7_d47_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "45m AM / 35m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 45 minutes AM / 35 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 48,
    "title": "Week 7: Active Rest Day",
    "estimatedMinutes": 85,
    "exercises": [
     {
      "id": "w7_d48_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "45m AM / 35m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 45 minutes AM / 35 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 49,
    "title": "Week 7: Active Rest Day",
    "estimatedMinutes": 85,
    "exercises": [
     {
      "id": "w7_d49_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "45m AM / 35m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 45 minutes AM / 35 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 50,
    "title": "Week 8: Legs & Calves",
    "estimatedMinutes": 110,
    "exercises": [
     {
      "id": "w8_d50_e1",
      "name": "Leg Extensions",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 0,
      "type": "superset",
      "notes": "Superset with Stiff Legged Deadlifts."
     },
     {
      "id": "w8_d50_e2",
      "name": "Stiff Legged Deadlifts",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 90,
      "type": "superset",
      "notes": "Superset with Leg Extensions."
     },
     {
      "id": "w8_d50_e3",
      "name": "Pendulum Squat",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w8_d50_e4",
      "name": "Heels Elevated Dumbbell Squat",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 0,
      "type": "superset",
      "notes": "Superset with Freestanding Squat."
     },
     {
      "id": "w8_d50_e5",
      "name": "Freestanding Squat with Resistance Band Support",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 90,
      "type": "superset",
      "notes": "Superset with Heels Elevated DB Squat."
     },
     {
      "id": "w8_d50_e6",
      "name": "Standing Calf Raises",
      "sets": 6,
      "reps": "16-18",
      "restSeconds": 45,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w8_d50_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "45m AM / 35m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 45 minutes AM / 35 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 51,
    "title": "Week 8: Shoulders & Abs",
    "estimatedMinutes": 110,
    "exercises": [
     {
      "id": "w8_d51_e1",
      "name": "Front to Side Raises",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w8_d51_e2",
      "name": "Chest Supported Rear Dumbbell Raises",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w8_d51_e3",
      "name": "Partial Side Raises",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w8_d51_e4",
      "name": "Machine Shoulder Press",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w8_d51_e5",
      "name": "Leg Raised Oblique Crunches",
      "sets": 5,
      "reps": "20",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w8_d51_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "45m AM / 35m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 45 minutes AM / 35 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 52,
    "title": "Week 8: Chest",
    "estimatedMinutes": 110,
    "exercises": [
     {
      "id": "w8_d52_e1",
      "name": "Incline Machine Press",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w8_d52_e2",
      "name": "Dumbbell Incline Fly",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w8_d52_e3",
      "name": "Pec Deck",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w8_d52_e4",
      "name": "Cable Crossovers",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w8_d52_e5",
      "name": "Machine Press",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w8_d52_e6",
      "name": "Neck Crunches",
      "sets": 5,
      "reps": "20",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w8_d52_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "45m AM / 35m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 45 minutes AM / 35 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 53,
    "title": "Week 8: Back & Calves",
    "estimatedMinutes": 110,
    "exercises": [
     {
      "id": "w8_d53_e1",
      "name": "Lat Pulldown",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w8_d53_e2",
      "name": "Reverse Pulldown Machine",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w8_d53_e3",
      "name": "Neutral Grip Pulldown",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w8_d53_e4",
      "name": "Overhand Grip Unilateral High Pulley Row",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w8_d53_e5",
      "name": "Seated Machine Row",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 0,
      "type": "superset",
      "notes": "Superset with Seated Calf Press."
     },
     {
      "id": "w8_d53_e6",
      "name": "Seated Calf Press",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 90,
      "type": "superset",
      "notes": "Superset with Seated Machine Row."
     },
     {
      "id": "w8_d53_e7",
      "name": "Seated Calf Press",
      "sets": 2,
      "reps": "16-18",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Additional straight sets."
     },
     {
      "id": "w8_d53_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "45m AM / 35m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 45 minutes AM / 35 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 54,
    "title": "Week 8: Arms",
    "estimatedMinutes": 110,
    "exercises": [
     {
      "id": "w8_d54_e1",
      "name": "TRICEPS CIRCUIT: Close Grip Push-ups + Rope Extension + Overhead Rope Extension + Parallel Bar Dips + Skullcrushers",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 120,
      "type": "circuit",
      "notes": "Rest only after completing each exercise in the circuit."
     },
     {
      "id": "w8_d54_e2",
      "name": "Seated Dumbbell Curl",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w8_d54_e3",
      "name": "High Pulley Curls",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w8_d54_e4",
      "name": "Hammer Curls",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w8_d54_e5",
      "name": "Barbell Curls",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w8_d54_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "45m AM / 35m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 45 minutes AM / 35 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 55,
    "title": "Week 8: Active Rest Day",
    "estimatedMinutes": 85,
    "exercises": [
     {
      "id": "w8_d55_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "45m AM / 35m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 45 minutes AM / 35 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 56,
    "title": "Week 8: Active Rest Day",
    "estimatedMinutes": 85,
    "exercises": [
     {
      "id": "w8_d56_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "45m AM / 35m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 45 minutes AM / 35 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 57,
    "title": "Week 9: DTP Legs & Calves",
    "estimatedMinutes": 120,
    "exercises": [
     {
      "id": "w9_d57_e1",
      "name": "Machine Squat Press",
      "sets": 5,
      "reps": "30, 25, 20, 15, 10",
      "restSeconds": 120,
      "type": "dtp",
      "notes": "Rest 90-120 seconds."
     },
     {
      "id": "w9_d57_e2",
      "name": "Leg Press",
      "sets": 5,
      "reps": "10, 15, 20, 25, 30",
      "restSeconds": 120,
      "type": "dtp",
      "notes": "Rest 90-120 seconds."
     },
     {
      "id": "w9_d57_e3",
      "name": "Leg Extension",
      "sets": 5,
      "reps": "30, 20, 10, 20, 30",
      "restSeconds": 0,
      "type": "dtp superset",
      "notes": "Superset with Lying Hamstring Curls."
     },
     {
      "id": "w9_d57_e4",
      "name": "Lying Hamstring Curls",
      "sets": 5,
      "reps": "30, 20, 10, 20, 30",
      "restSeconds": 120,
      "type": "dtp superset",
      "notes": "Rest 90-120s. Superset with Leg Extension."
     },
     {
      "id": "w9_d57_e5",
      "name": "Seated Calf Press",
      "sets": 5,
      "reps": "30, 20, 10, 20, 30",
      "restSeconds": 0,
      "type": "dtp superset",
      "notes": "Superset with Donkey Press."
     },
     {
      "id": "w9_d57_e6",
      "name": "Donkey Press",
      "sets": 5,
      "reps": "30, 20, 10, 20, 30",
      "restSeconds": 45,
      "type": "dtp superset",
      "notes": "Superset with Seated Calf Press."
     },
     {
      "id": "w9_d57_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "45m AM / 45m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 45 minutes AM / 45 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 58,
    "title": "Week 9: DTP Shoulders & Abs",
    "estimatedMinutes": 120,
    "exercises": [
     {
      "id": "w9_d58_e1",
      "name": "Machine Shoulder Press",
      "sets": 10,
      "reps": "30, 25, 20, 15, 10, 10, 15, 20, 25, 30",
      "restSeconds": 0,
      "type": "dtp superset",
      "notes": "Superset with Barbell Upright Rows."
     },
     {
      "id": "w9_d58_e2",
      "name": "Barbell Upright Rows",
      "sets": 10,
      "reps": "30, 25, 20, 15, 10, 10, 15, 20, 25, 30",
      "restSeconds": 90,
      "type": "dtp superset",
      "notes": "Rest 60-90s. Superset with Machine Shoulder Press."
     },
     {
      "id": "w9_d58_e3",
      "name": "Side Raises",
      "sets": 5,
      "reps": "30, 20, 10, 20, 30",
      "restSeconds": 0,
      "type": "dtp superset",
      "notes": "Superset with Rear Raises."
     },
     {
      "id": "w9_d58_e4",
      "name": "Rear Raises",
      "sets": 5,
      "reps": "30, 20, 10, 20, 30",
      "restSeconds": 90,
      "type": "dtp superset",
      "notes": "Rest 60-90s. Superset with Side Raises."
     },
     {
      "id": "w9_d58_e5",
      "name": "Hanging Leg Raises",
      "sets": 5,
      "reps": "20",
      "restSeconds": 0,
      "type": "superset",
      "notes": "Superset with Kneeling Cable Crunches."
     },
     {
      "id": "w9_d58_e6",
      "name": "Kneeling Cable Crunches",
      "sets": 5,
      "reps": "20",
      "restSeconds": 45,
      "type": "superset",
      "notes": "Superset with Hanging Leg Raises."
     },
     {
      "id": "w9_d58_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "45m AM / 45m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 45 minutes AM / 45 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 59,
    "title": "Week 9: DTP Chest",
    "estimatedMinutes": 120,
    "exercises": [
     {
      "id": "w9_d59_e1",
      "name": "Smith Machine Press",
      "sets": 10,
      "reps": "30, 25, 20, 15, 10, 10, 15, 20, 25, 30",
      "restSeconds": 60,
      "type": "dtp",
      "notes": ""
     },
     {
      "id": "w9_d59_e2",
      "name": "Smith Machine V Press",
      "sets": 5,
      "reps": "30, 25, 20, 15, 10",
      "restSeconds": 60,
      "type": "dtp",
      "notes": ""
     },
     {
      "id": "w9_d59_e3",
      "name": "Pec Deck",
      "sets": 5,
      "reps": "10, 15, 20, 25, 30",
      "restSeconds": 60,
      "type": "dtp",
      "notes": ""
     },
     {
      "id": "w9_d59_e4",
      "name": "Cable Crossovers",
      "sets": 5,
      "reps": "30, 25, 20, 15, 10",
      "restSeconds": 60,
      "type": "dtp",
      "notes": ""
     },
     {
      "id": "w9_d59_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "45m AM / 45m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 45 minutes AM / 45 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 60,
    "title": "Week 9: DTP Back",
    "estimatedMinutes": 120,
    "exercises": [
     {
      "id": "w9_d60_e1",
      "name": "Reverse Grip Lat Pulldown",
      "sets": 5,
      "reps": "20, 20, 15, 15, 10",
      "restSeconds": 90,
      "type": "dtp",
      "notes": ""
     },
     {
      "id": "w9_d60_e2",
      "name": "Overhand Grip Lat Pulldown",
      "sets": 5,
      "reps": "10, 15, 15, 20, 20",
      "restSeconds": 90,
      "type": "dtp",
      "notes": ""
     },
     {
      "id": "w9_d60_e3",
      "name": "Neutral Grip Dumbbell Row",
      "sets": 5,
      "reps": "20, 20, 15, 15, 10",
      "restSeconds": 90,
      "type": "dtp",
      "notes": ""
     },
     {
      "id": "w9_d60_e4",
      "name": "Cable Row",
      "sets": 5,
      "reps": "10, 15, 15, 20, 20",
      "restSeconds": 90,
      "type": "dtp",
      "notes": ""
     },
     {
      "id": "w9_d60_e5",
      "name": "Machine Shrugs",
      "sets": 5,
      "reps": "20, 15, 10, 15, 20",
      "restSeconds": 90,
      "type": "dtp",
      "notes": ""
     },
     {
      "id": "w9_d60_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "45m AM / 45m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 45 minutes AM / 45 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 61,
    "title": "Week 9: DTP Arms",
    "estimatedMinutes": 120,
    "exercises": [
     {
      "id": "w9_d61_e1",
      "name": "Tricep Pushdown",
      "sets": 10,
      "reps": "30, 25, 20, 15, 10, 10, 15, 20, 25, 30",
      "restSeconds": 0,
      "type": "dtp superset",
      "notes": "Superset with Lying Cable Curls."
     },
     {
      "id": "w9_d61_e2",
      "name": "Lying Cable Curls",
      "sets": 10,
      "reps": "30, 25, 20, 15, 10, 10, 15, 20, 25, 30",
      "restSeconds": 120,
      "type": "dtp superset",
      "notes": "Rest 90-120s. Superset with Tricep Pushdown."
     },
     {
      "id": "w9_d61_e3",
      "name": "Skull Crushers",
      "sets": 5,
      "reps": "10, 15, 20, 25, 30",
      "restSeconds": 0,
      "type": "dtp superset",
      "notes": "Superset with Barbell Bicep Curls."
     },
     {
      "id": "w9_d61_e4",
      "name": "Barbell Bicep Curls",
      "sets": 5,
      "reps": "10, 15, 20, 25, 30",
      "restSeconds": 120,
      "type": "dtp superset",
      "notes": "Rest 90-120s. Superset with Skull Crushers."
     },
     {
      "id": "w9_d61_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "45m AM / 45m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 45 minutes AM / 45 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 62,
    "title": "Week 9: Active Rest Day",
    "estimatedMinutes": 95,
    "exercises": [
     {
      "id": "w9_d62_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "45m AM / 45m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 45 minutes AM / 45 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 63,
    "title": "Week 9: Active Rest Day",
    "estimatedMinutes": 95,
    "exercises": [
     {
      "id": "w9_d63_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "45m AM / 45m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 45 minutes AM / 45 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 64,
    "title": "Week 10: Legs & Calves",
    "estimatedMinutes": 120,
    "exercises": [
     {
      "id": "w10_d64_e1",
      "name": "Smith Machine Squat",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 120,
      "type": "standard",
      "notes": "1st two sets: Wide Stance. 2nd two sets: Narrow Stance."
     },
     {
      "id": "w10_d64_e2",
      "name": "Split Squats",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 120,
      "type": "standard",
      "notes": "Use plate for resistance."
     },
     {
      "id": "w10_d64_e3",
      "name": "Leg Press",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 120,
      "type": "standard",
      "notes": "1st two sets: Wide Stance. 2nd two sets: Narrow Stance."
     },
     {
      "id": "w10_d64_e4",
      "name": "Walking Lunges",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 0,
      "type": "superset",
      "notes": "Superset with Straight Legged Calf Press."
     },
     {
      "id": "w10_d64_e5",
      "name": "Straight Legged Calf Press",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 120,
      "type": "superset",
      "notes": "Superset with Walking Lunges."
     },
     {
      "id": "w10_d64_e6",
      "name": "Straight Legged Calf Press",
      "sets": 2,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Additional straight sets. Rest 45-60s."
     },
     {
      "id": "w10_d64_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "45m AM / 45m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 45 minutes AM / 45 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 65,
    "title": "Week 10: Shoulders & Abs",
    "estimatedMinutes": 120,
    "exercises": [
     {
      "id": "w10_d65_e1",
      "name": "Rear Cable Raises",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w10_d65_e2",
      "name": "Side Cable Raises",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w10_d65_e3",
      "name": "Front Barbell Raise",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w10_d65_e4",
      "name": "Front to Rear Barbell Press",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Start in front of face, then behind head. Skip behind head if you have back impingements."
     },
     {
      "id": "w10_d65_e5",
      "name": "Weighted Sit-ups",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Use dumbbell for resistance."
     },
     {
      "id": "w10_d65_e6",
      "name": "Hanging Leg Raises",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 45,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w10_d65_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "45m AM / 45m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 45 minutes AM / 45 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 66,
    "title": "Week 10: Chest",
    "estimatedMinutes": 120,
    "exercises": [
     {
      "id": "w10_d66_e1",
      "name": "Low Incline Dumbbell Press",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 120,
      "type": "standard",
      "notes": "Rest 90-120 seconds."
     },
     {
      "id": "w10_d66_e2",
      "name": "Dumbbell Decline Press",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 120,
      "type": "standard",
      "notes": "Rest 90-120 seconds."
     },
     {
      "id": "w10_d66_e3",
      "name": "Machine Press",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 120,
      "type": "standard",
      "notes": "Rest 90-120 seconds."
     },
     {
      "id": "w10_d66_e4",
      "name": "Cable Incline Fly",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w10_d66_e5",
      "name": "Unilateral Cable Fly",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 0,
      "type": "standard",
      "notes": "No rest."
     },
     {
      "id": "w10_d66_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "45m AM / 45m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 45 minutes AM / 45 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 67,
    "title": "Week 10: Back & Calves",
    "estimatedMinutes": 120,
    "exercises": [
     {
      "id": "w10_d67_e1",
      "name": "Wide Grip Chins",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 120,
      "type": "standard",
      "notes": "Rest 90-120 seconds."
     },
     {
      "id": "w10_d67_e2",
      "name": "Bent Over Row",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 120,
      "type": "standard",
      "notes": "Rest 90-120 seconds."
     },
     {
      "id": "w10_d67_e3",
      "name": "Unilateral Hammer Rows",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 120,
      "type": "standard",
      "notes": "Rest 90-120 seconds."
     },
     {
      "id": "w10_d67_e4",
      "name": "Smith Machine Rack Deads",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 0,
      "type": "superset",
      "notes": "Superset with Seated Calf Raises."
     },
     {
      "id": "w10_d67_e5",
      "name": "Seated Calf Raises",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 90,
      "type": "superset",
      "notes": "Superset with Rack Deads."
     },
     {
      "id": "w10_d67_e6",
      "name": "Seated Calf Raises",
      "sets": 2,
      "reps": "8-12",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Additional straight sets."
     },
     {
      "id": "w10_d67_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "45m AM / 45m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 45 minutes AM / 45 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 68,
    "title": "Week 10: Arms",
    "estimatedMinutes": 120,
    "exercises": [
     {
      "id": "w10_d68_e1",
      "name": "Preacher Curls",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w10_d68_e2",
      "name": "Seated Alternating Dumbbell Curls",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w10_d68_e3",
      "name": "Seated Concentration Curls",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w10_d68_e4",
      "name": "Tricep Cable Pushdowns",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w10_d68_e5",
      "name": "Seated Overhead Cable Extension",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w10_d68_e6",
      "name": "Bench Dips",
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w10_d68_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "45m AM / 45m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 45 minutes AM / 45 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 69,
    "title": "Week 10: Active Rest Day",
    "estimatedMinutes": 95,
    "exercises": [
     {
      "id": "w10_d69_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "45m AM / 45m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 45 minutes AM / 45 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 70,
    "title": "Week 10: Active Rest Day",
    "estimatedMinutes": 95,
    "exercises": [
     {
      "id": "w10_d70_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "45m AM / 45m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 45 minutes AM / 45 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 71,
    "title": "Week 11: Legs & Calves",
    "estimatedMinutes": 120,
    "exercises": [
     {
      "id": "w11_d71_e1",
      "name": "Leg Extension",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 120,
      "type": "standard",
      "notes": "Rest 90-120 seconds."
     },
     {
      "id": "w11_d71_e2",
      "name": "Hack Squat",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 120,
      "type": "standard",
      "notes": "Rest 90-120 seconds."
     },
     {
      "id": "w11_d71_e3",
      "name": "Leg Press",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 120,
      "type": "standard",
      "notes": "Rest 90-120 seconds."
     },
     {
      "id": "w11_d71_e4",
      "name": "Seated Leg Curl",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 120,
      "type": "standard",
      "notes": "Rest 90-120 seconds."
     },
     {
      "id": "w11_d71_e5",
      "name": "Standing Calf Press",
      "sets": 6,
      "reps": "16-18",
      "restSeconds": 45,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w11_d71_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "45m AM / 45m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 45 minutes AM / 45 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 72,
    "title": "Week 11: Shoulders, Abs & Neck",
    "estimatedMinutes": 120,
    "exercises": [
     {
      "id": "w11_d72_e1",
      "name": "Machine Press",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 0,
      "type": "superset",
      "notes": "Superset with Rear Raises."
     },
     {
      "id": "w11_d72_e2",
      "name": "Rear Raises",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 90,
      "type": "superset",
      "notes": "Rest 60-90s. Superset with Machine Press."
     },
     {
      "id": "w11_d72_e3",
      "name": "Standing Front Raises",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 0,
      "type": "superset",
      "notes": "Superset with Standing Side Raises."
     },
     {
      "id": "w11_d72_e4",
      "name": "Standing Side Raises",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 90,
      "type": "superset",
      "notes": "Rest 60-90s. Superset with Standing Front Raises."
     },
     {
      "id": "w11_d72_e5",
      "name": "Machine Crunches",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 0,
      "type": "giantset",
      "notes": "Giant Set."
     },
     {
      "id": "w11_d72_e6",
      "name": "Hanging Leg Raises",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 0,
      "type": "giantset",
      "notes": "Giant Set."
     },
     {
      "id": "w11_d72_e7",
      "name": "Neck Crunches",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 90,
      "type": "giantset",
      "notes": "Giant Set. Rest 60-90s after."
     },
     {
      "id": "w11_d72_e8",
      "name": "Neck Crunches",
      "sets": 2,
      "reps": "16-18",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Additional straight sets. Rest 60-90s."
     },
     {
      "id": "w11_d72_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "45m AM / 45m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 45 minutes AM / 45 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 73,
    "title": "Week 11: Chest",
    "estimatedMinutes": 120,
    "exercises": [
     {
      "id": "w11_d73_e1",
      "name": "Dead Stop Smith Machine Press",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w11_d73_e2",
      "name": "V Press",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w11_d73_e3",
      "name": "Incline Cable Fly",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w11_d73_e4",
      "name": "Dead Stop Incline Machine Press",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w11_d73_e5",
      "name": "Peck Deck",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w11_d73_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "45m AM / 45m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 45 minutes AM / 45 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 74,
    "title": "Week 11: Back & Calves",
    "estimatedMinutes": 120,
    "exercises": [
     {
      "id": "w11_d74_e1",
      "name": "Overhand Grip T Bar Row",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w11_d74_e2",
      "name": "Bent Over Row",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w11_d74_e3",
      "name": "Seated Machine Row",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w11_d74_e4",
      "name": "Reverse Grip Machine Row",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w11_d74_e5",
      "name": "Single Arm Bent Over Row Overhand Grip",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 90,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w11_d74_e6",
      "name": "Seated Calf Press",
      "sets": 6,
      "reps": "16-18",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Rest 45-60s."
     },
     {
      "id": "w11_d74_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "45m AM / 45m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 45 minutes AM / 45 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 75,
    "title": "Week 11: Arms",
    "estimatedMinutes": 120,
    "exercises": [
     {
      "id": "w11_d75_e1",
      "name": "Tricep Cable Pushdown",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w11_d75_e2",
      "name": "Machine Dips",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w11_d75_e3",
      "name": "Overhead Tricep Rope Extension",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w11_d75_e4",
      "name": "Preacher Curls",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w11_d75_e5",
      "name": "Cable Hammer Curls",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w11_d75_e6",
      "name": "Barbell Spider Curls",
      "sets": 4,
      "reps": "16-18",
      "restSeconds": 60,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w11_d75_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "45m AM / 45m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 45 minutes AM / 45 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 76,
    "title": "Week 11: Active Rest Day",
    "estimatedMinutes": 95,
    "exercises": [
     {
      "id": "w11_d76_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "45m AM / 45m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 45 minutes AM / 45 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 77,
    "title": "Week 11: Active Rest Day",
    "estimatedMinutes": 95,
    "exercises": [
     {
      "id": "w11_d77_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "45m AM / 45m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 45 minutes AM / 45 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 78,
    "title": "Week 12: DTP Legs & Calves",
    "estimatedMinutes": 120,
    "exercises": [
     {
      "id": "w12_d78_e1",
      "name": "Squat Press Legs Wide",
      "sets": 5,
      "reps": "35, 30, 25, 20, 15",
      "restSeconds": 120,
      "type": "dtp",
      "notes": "Rest 90-120 seconds."
     },
     {
      "id": "w12_d78_e2",
      "name": "Leg Press Narrow Stance",
      "sets": 5,
      "reps": "15, 20, 25, 30, 35",
      "restSeconds": 120,
      "type": "dtp",
      "notes": "Rest 90-120 seconds."
     },
     {
      "id": "w12_d78_e3",
      "name": "Leg Extension",
      "sets": 3,
      "reps": "30, 20, 10",
      "restSeconds": 120,
      "type": "dtp",
      "notes": "Rest 90-120 seconds."
     },
     {
      "id": "w12_d78_e4",
      "name": "Standing Single Leg Hamstring Curl",
      "sets": 3,
      "reps": "10, 20, 30",
      "restSeconds": 120,
      "type": "dtp",
      "notes": "Rest 90-120 seconds."
     },
     {
      "id": "w12_d78_e5",
      "name": "Seated Calf Press",
      "sets": 4,
      "reps": "20",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Rest 45-60 seconds."
     },
     {
      "id": "w12_d78_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "45m AM / 45m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 45 minutes AM / 45 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 79,
    "title": "Week 12: DTP Shoulders & Abs",
    "estimatedMinutes": 120,
    "exercises": [
     {
      "id": "w12_d79_e1",
      "name": "Standing Dumbbell Side Raises",
      "sets": 5,
      "reps": "30, 25, 20, 15, 10",
      "restSeconds": 120,
      "type": "dtp",
      "notes": "Rest 90-120 seconds."
     },
     {
      "id": "w12_d79_e2",
      "name": "Dumbbell Upright Rows",
      "sets": 5,
      "reps": "10, 15, 20, 25, 30",
      "restSeconds": 120,
      "type": "dtp",
      "notes": "Rest 90-120 seconds."
     },
     {
      "id": "w12_d79_e3",
      "name": "Machine Press",
      "sets": 5,
      "reps": "30, 20, 10, 20, 30",
      "restSeconds": 120,
      "type": "dtp",
      "notes": "Rest 90-120 seconds."
     },
     {
      "id": "w12_d79_e4",
      "name": "Hanging Leg Raises",
      "sets": 4,
      "reps": "Failure",
      "restSeconds": 45,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w12_d79_e5",
      "name": "Crunches",
      "sets": 4,
      "reps": "Failure",
      "restSeconds": 45,
      "type": "standard",
      "notes": ""
     },
     {
      "id": "w12_d79_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "45m AM / 45m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 45 minutes AM / 45 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 80,
    "title": "Week 12: DTP Chest",
    "estimatedMinutes": 120,
    "exercises": [
     {
      "id": "w12_d80_e1",
      "name": "Flat Press",
      "sets": 5,
      "reps": "30, 25, 20, 15, 10",
      "restSeconds": 120,
      "type": "dtp",
      "notes": "Rest 90-120 seconds."
     },
     {
      "id": "w12_d80_e2",
      "name": "Pec Deck",
      "sets": 5,
      "reps": "10, 15, 20, 25, 30",
      "restSeconds": 120,
      "type": "dtp",
      "notes": "Rest 90-120 seconds."
     },
     {
      "id": "w12_d80_e3",
      "name": "Incline Press",
      "sets": 3,
      "reps": "30, 20, 10",
      "restSeconds": 120,
      "type": "dtp",
      "notes": "Rest 90-120 seconds."
     },
     {
      "id": "w12_d80_e4",
      "name": "Cable Crossovers",
      "sets": 3,
      "reps": "10, 20, 30",
      "restSeconds": 120,
      "type": "dtp",
      "notes": "Rest 90-120 seconds."
     },
     {
      "id": "w12_d80_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "45m AM / 45m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 45 minutes AM / 45 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 81,
    "title": "Week 12: DTP Back & Calves",
    "estimatedMinutes": 120,
    "exercises": [
     {
      "id": "w12_d81_e1",
      "name": "Bent Over Row",
      "sets": 5,
      "reps": "30, 25, 20, 15, 10",
      "restSeconds": 120,
      "type": "dtp",
      "notes": "Rest 90-120 seconds."
     },
     {
      "id": "w12_d81_e2",
      "name": "Neutral Grip Cable Row",
      "sets": 5,
      "reps": "10, 15, 20, 25, 30",
      "restSeconds": 120,
      "type": "dtp",
      "notes": "Rest 90-120 seconds."
     },
     {
      "id": "w12_d81_e3",
      "name": "Overhand Grip Machine Pulldowns",
      "sets": 5,
      "reps": "30, 25, 20, 15, 10",
      "restSeconds": 120,
      "type": "dtp",
      "notes": "Rest 90-120 seconds."
     },
     {
      "id": "w12_d81_e4",
      "name": "Reverse Grip Single Arm Row",
      "sets": 3,
      "reps": "10, 20, 30",
      "restSeconds": 120,
      "type": "dtp",
      "notes": "Rest 90-120 seconds."
     },
     {
      "id": "w12_d81_e5",
      "name": "Seated Calf Press",
      "sets": 4,
      "reps": "20",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Rest 45-60 seconds."
     },
     {
      "id": "w12_d81_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "45m AM / 45m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 45 minutes AM / 45 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 82,
    "title": "Week 12: DTP Arms",
    "estimatedMinutes": 120,
    "exercises": [
     {
      "id": "w12_d82_e1",
      "name": "Tricep Pushdown",
      "sets": 5,
      "reps": "30, 25, 20, 15, 10",
      "restSeconds": 60,
      "type": "dtp",
      "notes": ""
     },
     {
      "id": "w12_d82_e2",
      "name": "Overhead Tricep Extension",
      "sets": 5,
      "reps": "10, 15, 20, 25, 30",
      "restSeconds": 60,
      "type": "dtp",
      "notes": ""
     },
     {
      "id": "w12_d82_e3",
      "name": "Preacher Curls",
      "sets": 5,
      "reps": "30, 25, 20, 15, 10",
      "restSeconds": 60,
      "type": "dtp",
      "notes": ""
     },
     {
      "id": "w12_d82_e4",
      "name": "Hammer Curls",
      "sets": 5,
      "reps": "10, 15, 20, 25, 30",
      "restSeconds": 60,
      "type": "dtp",
      "notes": ""
     },
     {
      "id": "w12_d82_e5",
      "name": "Close Grip Push-ups",
      "sets": 3,
      "reps": "Failure",
      "restSeconds": 60,
      "type": "standard",
      "notes": "4 second negatives."
     },
     {
      "id": "w12_d82_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "45m AM / 45m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 45 minutes AM / 45 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 83,
    "title": "Week 12: Active Rest Day",
    "estimatedMinutes": 95,
    "exercises": [
     {
      "id": "w12_d83_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "45m AM / 45m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 45 minutes AM / 45 minutes PM (outside if possible) + 150 twists."
     }
    ]
   },
   {
    "dayNumber": 84,
    "title": "Week 12: Active Rest Day",
    "estimatedMinutes": 95,
    "exercises": [
     {
      "id": "w12_d84_cardio",
      "name": "Steady State Cardio + Twists",
      "sets": 1,
      "reps": "45m AM / 45m PM",
      "restSeconds": 0,
      "type": "cardio",
      "notes": "Cardio: 45 minutes AM / 45 minutes PM (outside if possible) + 150 twists."
     }
    ]
   }
  ]
 },
 {
  "id": "shred_with_buendia_complete_v2",
  "title": "Shred with Buendia",
  "description": "Jeremy Buendia's complete 8-week shredding program (Phase 1 & Phase 2). Features a 5-day split with Legs on Friday and Arms on Saturday. Core/abs work is integrated as an independent daily routine (every other day in Phase 1, 5x a week in Phase 2) featuring hanging leg lifts, floor crunches, and decline reverse crunches.",
  "tags": [
   "Jeremy Buendia",
   "Shred",
   "Cutting",
   "FST-7",
   "Phase 1",
   "Phase 2"
  ],
  "days": [
   {
    "dayNumber": 1,
    "title": "Phase 1 - Monday: Chest",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "swb_p1_d1_e1",
      "name": "Cable Chest Fly",
      "sets": 6,
      "reps": "15, 15, 12, 12, 12, 10",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Warm-up sets (1-2), working sets, followed by a drop set decreasing weight and completing 10 more reps without rest."
     },
     {
      "id": "swb_p1_d1_e2",
      "name": "Cable Fly (Ladders)",
      "sets": 4,
      "reps": "15",
      "restSeconds": 50,
      "type": "superset",
      "notes": "5 rep Low cable fly, 5 rep Mid cable fly, 5 rep High cable fly (repeat 3x per set). Supersetted with 15 push-ups."
     },
     {
      "id": "swb_p1_d1_e3",
      "name": "DB Incline Press",
      "sets": 5,
      "reps": "15, 15, 12, 12, 8",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Sets 4-5 feature Partial-to-Full Reps: bring weight down for full stretch, press halfway up, back down to full stretch, then press through a full rep (= 1 rep)."
     },
     {
      "id": "swb_p1_d1_e4",
      "name": "Smith Incline Press",
      "sets": 4,
      "reps": "18",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Complex: 10 full reps, 5 partial reps, 3 full reps per set."
     },
     {
      "id": "swb_p1_d1_e5",
      "name": "Machine Fly (FST-7)",
      "sets": 7,
      "reps": "12",
      "restSeconds": 20,
      "type": "dropset",
      "notes": "FST-7 finisher. Superset each set with 10 seconds of maximum chest flexing. Rest strictly 20 seconds between sets."
     }
    ]
   },
   {
    "dayNumber": 2,
    "title": "Phase 1 - Tuesday: Back",
    "estimatedMinutes": 65,
    "exercises": [
     {
      "id": "swb_p1_d2_e1",
      "name": "Pull-Ups",
      "sets": 4,
      "reps": "25",
      "restSeconds": 40,
      "type": "standard",
      "notes": "Use assisted pull-up machine for 15 reps if needed."
     },
     {
      "id": "swb_p1_d2_e2",
      "name": "Barbell Bent Over Row to Straight Leg Deadlift",
      "sets": 5,
      "reps": "20",
      "restSeconds": 60,
      "type": "standard",
      "notes": "10 rows and 10 deadlifts alternating per set. Keep lower back arched, chest up, and stretch lats on negative."
     },
     {
      "id": "swb_p1_d2_e3",
      "name": "Reverse Grip Lat Pulldown",
      "sets": 4,
      "reps": "15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Drive elbows down to sides, keeping lower back arched and chest up toward ceiling."
     },
     {
      "id": "swb_p1_d2_e4",
      "name": "Single Arm Dumbbell Row",
      "sets": 4,
      "reps": "20, 15, 15, 10",
      "restSeconds": 105,
      "type": "standard",
      "notes": "Unilateral lat development per arm."
     },
     {
      "id": "swb_p1_d2_e5",
      "name": "Back Extensions",
      "sets": 4,
      "reps": "25",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Erector spinae endurance."
     },
     {
      "id": "swb_p1_d2_e6",
      "name": "Wide Grip Lat Pull Down",
      "sets": 4,
      "reps": "15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Hold contraction for 2 seconds on each rep."
     }
    ]
   },
   {
    "dayNumber": 3,
    "title": "Phase 1 - Thursday: Shoulders",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "swb_p1_d3_e1",
      "name": "DB Shoulder Press",
      "sets": 5,
      "reps": "15, 15, 10, 10, 10",
      "restSeconds": 75,
      "type": "standard",
      "notes": "Warm-up sets followed by working sets."
     },
     {
      "id": "swb_p1_d3_e2",
      "name": "Standing DB Overhead Press (Palms Facing In)",
      "sets": 4,
      "reps": "15, 10, 10, 10",
      "restSeconds": 75,
      "type": "standard",
      "notes": "Slight bend in knees, core tight. Press in front of head, not behind neck."
     },
     {
      "id": "swb_p1_d3_e3",
      "name": "DB Lateral Raises",
      "sets": 3,
      "reps": "10",
      "restSeconds": 75,
      "type": "standard",
      "notes": "Hold at top of contraction for 1 second."
     },
     {
      "id": "swb_p1_d3_e4",
      "name": "Single Arm DB Lateral Raise",
      "sets": 4,
      "reps": "15, 10, 10, 10",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Strict unilateral side delt isolation."
     },
     {
      "id": "swb_p1_d3_e5",
      "name": "Bent Over Rear Delt Fly",
      "sets": 4,
      "reps": "15",
      "restSeconds": 75,
      "type": "dropset",
      "notes": "Final set drops to a lighter weight and finishes with 10 extra reps."
     },
     {
      "id": "swb_p1_d3_e6",
      "name": "Machine Rear Delt Fly",
      "sets": 4,
      "reps": "12",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Short rest rear delt isolation."
     }
    ]
   },
   {
    "dayNumber": 4,
    "title": "Phase 1 - Friday: Legs",
    "estimatedMinutes": 70,
    "exercises": [
     {
      "id": "swb_p1_d4_e1",
      "name": "Calf Machine / Leg Extension / Lying Hamstring Curl (Tri-Set)",
      "sets": 4,
      "reps": "20 / 10 / 10",
      "restSeconds": 75,
      "type": "standard",
      "notes": "Warm-up tri-set. Cycle through all three movements before resting."
     },
     {
      "id": "swb_p1_d4_e2",
      "name": "Smith Machine Squats (Close Stance)",
      "sets": 6,
      "reps": "20, 20, 15, 10, 10, 20",
      "restSeconds": 75,
      "type": "standard",
      "notes": "Sets 4-5 are heavy. Set 6: drop weight significantly and rep out."
     },
     {
      "id": "swb_p1_d4_e3",
      "name": "Hack Squats",
      "sets": 3,
      "reps": "20",
      "restSeconds": 75,
      "type": "standard",
      "notes": "Quad sweep focus."
     },
     {
      "id": "swb_p1_d4_e4",
      "name": "DB Walking Lunges",
      "sets": 4,
      "reps": "15 strides per leg",
      "restSeconds": 75,
      "type": "standard",
      "notes": "Unilateral leg conditioning."
     },
     {
      "id": "swb_p1_d4_e5",
      "name": "Lying Hamstring Curl",
      "sets": 4,
      "reps": "20, 20, 15, 15",
      "restSeconds": 75,
      "type": "standard",
      "notes": "Hamstring isolation finisher."
     }
    ]
   },
   {
    "dayNumber": 5,
    "title": "Phase 1 - Saturday: Arms",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "swb_p1_d5_e1",
      "name": "E-Z Bar Curl w/ Tricep Straight Bar Pushdown",
      "sets": 5,
      "reps": "15",
      "restSeconds": 30,
      "type": "superset",
      "notes": "Superset format. Warm-up set followed by 4 heavy working sets."
     },
     {
      "id": "swb_p1_d5_e2",
      "name": "DB Hammer Curl w/ Tricep Rope Pushdown",
      "sets": 4,
      "reps": "15 / 20",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Superset. Both arms simultaneously on hammer curls."
     },
     {
      "id": "swb_p1_d5_e3",
      "name": "DB Single Arm Spider Curl w/ DB Overhead Tricep Extension",
      "sets": 4,
      "reps": "15 / 20",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Superset arm builder."
     },
     {
      "id": "swb_p1_d5_e4",
      "name": "DB Curl (Palms Facing Forward, Both Arms) w/ Machine Dips",
      "sets": 4,
      "reps": "10+10 / 15",
      "restSeconds": 75,
      "type": "superset",
      "notes": "Superset. 10 full reps followed by 10 partial reps on curls."
     },
     {
      "id": "swb_p1_d5_e5",
      "name": "Barbell Curl w/ Close-Grip Push-Ups",
      "sets": 3,
      "reps": "20",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Arm day finishing superset."
     }
    ]
   },
   {
    "dayNumber": 6,
    "title": "Phase 2 - Monday: Chest",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "swb_p2_d1_e1",
      "name": "Cable Chest Fly to Cable Press",
      "sets": 6,
      "reps": "15, 15, 10, 10, 10, 10",
      "restSeconds": 75,
      "type": "standard",
      "notes": "Warm-ups followed by working sets combining flyes and presses."
     },
     {
      "id": "swb_p2_d1_e2",
      "name": "Smith Machine Incline",
      "sets": 5,
      "reps": "15, 15, 12, 10, 10",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Set 5 features Partial-to-Full Reps (full stretch, half press, full stretch, full rep)."
     },
     {
      "id": "swb_p2_d1_e3",
      "name": "DB Incline Close Grip Press",
      "sets": 4,
      "reps": "15",
      "restSeconds": 45,
      "type": "superset",
      "notes": "Superset each set with 15 push-ups."
     },
     {
      "id": "swb_p2_d1_e4",
      "name": "Smith Incline Press",
      "sets": 4,
      "reps": "15",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Complex: 5 full, 5 partial, 5 full, 5 partial reps."
     },
     {
      "id": "swb_p2_d1_e5",
      "name": "Machine Fly",
      "sets": 5,
      "reps": "12",
      "restSeconds": 20,
      "type": "dropset",
      "notes": "FST-style machine fly. Superset each set with push-ups to failure. Rest strictly 20 seconds."
     }
    ]
   },
   {
    "dayNumber": 7,
    "title": "Phase 2 - Tuesday: Back",
    "estimatedMinutes": 65,
    "exercises": [
     {
      "id": "swb_p2_d2_e1",
      "name": "Deadlifts",
      "sets": 5,
      "reps": "15, 10, 10, 10, 10",
      "restSeconds": 75,
      "type": "standard",
      "notes": "Heavy compound pull. Warm-up followed by working sets."
     },
     {
      "id": "swb_p2_d2_e2",
      "name": "Pull-Downs",
      "sets": 4,
      "reps": "15, 12, 12, 10",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Lat width development."
     },
     {
      "id": "swb_p2_d2_e3",
      "name": "DB Single Arm Bent Over Rows",
      "sets": 4,
      "reps": "15, 15, 10, 10",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Keep lower back arched, hips cocked, chest up."
     },
     {
      "id": "swb_p2_d2_e4",
      "name": "T-Bar Row",
      "sets": 4,
      "reps": "15, 15, 12, 12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Mid-back thickness."
     },
     {
      "id": "swb_p2_d2_e5",
      "name": "Seated Cable Row (Underhand Grip)",
      "sets": 4,
      "reps": "20, 15, 15, 10",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Underhand grip to target lower lats."
     },
     {
      "id": "swb_p2_d2_e6",
      "name": "Cable Rope Straight Arm Pull Down",
      "sets": 4,
      "reps": "20",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Constant tension isolation."
     },
     {
      "id": "swb_p2_d2_e7",
      "name": "Back Extensions",
      "sets": 4,
      "reps": "25",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Lower back finisher."
     }
    ]
   },
   {
    "dayNumber": 8,
    "title": "Phase 2 - Thursday: Shoulders",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "swb_p2_d3_e1",
      "name": "Smith Machine Shoulder Press",
      "sets": 5,
      "reps": "15, 15, 20, 20, 20",
      "restSeconds": 75,
      "type": "standard",
      "notes": "Sets 3-5 use partials and full reps (5 partial, 5 full, 5 partial, 5 full)."
     },
     {
      "id": "swb_p2_d3_e2",
      "name": "DB Lateral Drop Sets",
      "sets": 4,
      "reps": "10/12/15",
      "restSeconds": 75,
      "type": "dropset",
      "notes": "Decrease weight by 5 lbs on each drop set with no rest."
     },
     {
      "id": "swb_p2_d3_e3",
      "name": "DB Front Raise (Thumbs Up, Both Arms)",
      "sets": 3,
      "reps": "10",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Hold at top of contraction for 1 second."
     },
     {
      "id": "swb_p2_d3_e4",
      "name": "Barbell Front Raise",
      "sets": 3,
      "reps": "15",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Anterior delt finisher."
     }
    ]
   },
   {
    "dayNumber": 9,
    "title": "Phase 2 - Friday: Legs",
    "estimatedMinutes": 70,
    "exercises": [
     {
      "id": "swb_p2_d4_e1",
      "name": "Calf Machine / Leg Extension / Lying Hamstring Curl (Tri-Set)",
      "sets": 4,
      "reps": "20 / 10 / 10",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Warm-up tri-set."
     },
     {
      "id": "swb_p2_d4_e2",
      "name": "Leg Press (Shoulder Width Stance)",
      "sets": 5,
      "reps": "20, 20, 15, 10, 10",
      "restSeconds": 75,
      "type": "standard",
      "notes": "Heavy leg press working sets."
     },
     {
      "id": "swb_p2_d4_e3",
      "name": "Smith Machine Lunges",
      "sets": 4,
      "reps": "20, 15, 12, 10 strides per leg",
      "restSeconds": 75,
      "type": "standard",
      "notes": "Unilateral leg demolition."
     },
     {
      "id": "swb_p2_d4_e4",
      "name": "Sumo Deadlift",
      "sets": 4,
      "reps": "20, 15, 12, 10",
      "restSeconds": 75,
      "type": "standard",
      "notes": "Posterior chain and adductor focus."
     },
     {
      "id": "swb_p2_d4_e5",
      "name": "Seated Hamstring Curl Superset w/ Leg Extensions",
      "sets": 4,
      "reps": "20, 20, 15, 15",
      "restSeconds": 45,
      "type": "superset",
      "notes": "Superset finisher."
     }
    ]
   },
   {
    "dayNumber": 10,
    "title": "Phase 2 - Saturday: Arms",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "swb_p2_d5_e1",
      "name": "Barbell Curl w/ Close-Grip Bench Press",
      "sets": 5,
      "reps": "20, 15, 15, 10, 10",
      "restSeconds": 30,
      "type": "superset",
      "notes": "Superset format. Warm-up followed by heavy working sets."
     },
     {
      "id": "swb_p2_d5_e2",
      "name": "Machine Preacher Curl w/ Machine Dips",
      "sets": 4,
      "reps": "20, 15, 12, 10",
      "restSeconds": 45,
      "type": "superset",
      "notes": "Superset arm builder."
     },
     {
      "id": "swb_p2_d5_e3",
      "name": "Cable Straight Bar Curl w/ Cable Reverse Grip Pushdown",
      "sets": 5,
      "reps": "20, 15, 12, 10, 10",
      "restSeconds": 45,
      "type": "superset",
      "notes": "Superset with partial reps on final sets."
     },
     {
      "id": "swb_p2_d5_e4",
      "name": "Reverse Grip E-Z Bar Curl w/ Cable Rope Overhead Tricep Extensions",
      "sets": 4,
      "reps": "20",
      "restSeconds": 45,
      "type": "superset",
      "notes": "Brachialis and tricep long head finisher."
     }
    ]
   }
  ]
 },
 {
  "id": "jim_stoppani_ss8_base_6days",
  "title": "Super Shredded 8 (Base 6 Days)",
  "description": "The foundational 6-day split for Jim Stoppani's Super Shredded 8. Supersets and Tabata cardio acceleration blocks are merged into single entries. Decrease your rest periods every two weeks according to the program progression.",
  "tags": [
   "Jim Stoppani",
   "Super Shredded 8",
   "SS8",
   "Fat Loss",
   "Base Split"
  ],
  "days": [
   {
    "dayNumber": 1,
    "title": "Day 1: Chest, Shoulders, Triceps, Abs",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "ss8_d1_e1",
      "name": "Bench Press / Dumbbell Flye",
      "sets": 3,
      "reps": "7-8 / 16-20",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Chest Superset"
     },
     {
      "id": "ss8_d1_e2",
      "name": "Incline Dumbbell Flye / Incline Dumbbell Press",
      "sets": 3,
      "reps": "16-20 / 7-8",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Chest Superset"
     },
     {
      "id": "ss8_d1_e3",
      "name": "Push Up / Jumping Jacks (Tabata)",
      "sets": 8,
      "reps": "20s / 20s",
      "restSeconds": 10,
      "type": "tabata",
      "notes": "Tabata Interval Block"
     },
     {
      "id": "ss8_d1_e4",
      "name": "Seated Dumbbell Shoulder Press / Dumbbell Lateral Raise",
      "sets": 3,
      "reps": "7-8 / 16-20",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Shoulder Superset"
     },
     {
      "id": "ss8_d1_e5",
      "name": "Bent-Over Lateral Raise / Dumbbell Upright Row",
      "sets": 3,
      "reps": "16-20 / 7-8",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Shoulder Superset"
     },
     {
      "id": "ss8_d1_e6",
      "name": "Kettlebell Swing / Smith Machine Hang Power Clean (Tabata)",
      "sets": 8,
      "reps": "20s / 20s",
      "restSeconds": 10,
      "type": "tabata",
      "notes": "Tabata Interval Block"
     },
     {
      "id": "ss8_d1_e7",
      "name": "Close-Grip Bench Press / Lying Triceps Extension",
      "sets": 3,
      "reps": "7-8 / 16-20",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Triceps Superset (Note: Perform 3 sets of Close-Grip, 2 sets of Extensions)"
     },
     {
      "id": "ss8_d1_e8",
      "name": "Triceps Pressdown / Overhead Cable Triceps Extension (Low Pulley)",
      "sets": 2,
      "reps": "16-20 / 7-8",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Triceps Superset"
     },
     {
      "id": "ss8_d1_e9",
      "name": "Dead Landmines / Burpee (Tabata)",
      "sets": 8,
      "reps": "20s / 20s",
      "restSeconds": 10,
      "type": "tabata",
      "notes": "Tabata Interval Block"
     }
    ]
   },
   {
    "dayNumber": 2,
    "title": "Day 2: Legs, Calves, Abs",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "ss8_d2_e1",
      "name": "Jump Squat / Leg Extension",
      "sets": 3,
      "reps": "5-6 / 16-20",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Legs Superset"
     },
     {
      "id": "ss8_d2_e2",
      "name": "Front Squat / Squat",
      "sets": 3,
      "reps": "16-20 / 7-8",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Legs Superset"
     },
     {
      "id": "ss8_d2_e3",
      "name": "Lying Leg Curl / Dumbbell Romanian Deadlift",
      "sets": 3,
      "reps": "16-20 / 7-8",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Legs Superset"
     },
     {
      "id": "ss8_d2_e4",
      "name": "Squat / Kettlebell Snatch (Tabata)",
      "sets": 8,
      "reps": "20s / 20s",
      "restSeconds": 10,
      "type": "tabata",
      "notes": "Tabata Interval Block"
     },
     {
      "id": "ss8_d2_e5",
      "name": "Leg Press Calf Raise / One-Leg Standing Calf Raise (Body Weight)",
      "sets": 3,
      "reps": "15 / To Failure",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Calves Superset"
     },
     {
      "id": "ss8_d2_e6",
      "name": "Dumbbell Lunge / Mountain Climbers (Tabata)",
      "sets": 8,
      "reps": "20s / 20s",
      "restSeconds": 10,
      "type": "tabata",
      "notes": "Tabata Interval Block"
     },
     {
      "id": "ss8_d2_e7",
      "name": "Hanging Leg Raise / Oblique Crunch",
      "sets": 3,
      "reps": "To Failure / To Failure",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Abs Superset"
     },
     {
      "id": "ss8_d2_e8",
      "name": "Crunch / Cable Woodchopper (Tabata)",
      "sets": 8,
      "reps": "20s / 20s",
      "restSeconds": 10,
      "type": "tabata",
      "notes": "Tabata Interval Block"
     }
    ]
   },
   {
    "dayNumber": 3,
    "title": "Day 3: Back, Traps, Biceps, Forearms",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "ss8_d3_e1",
      "name": "Bent-Over Barbell Row / Reverse-Grip Barbell Row",
      "sets": 3,
      "reps": "7-8 / 16-20",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Back Superset"
     },
     {
      "id": "ss8_d3_e2",
      "name": "Straight-Arm Pulldown / Wide-Grip Lat Pulldowns",
      "sets": 3,
      "reps": "16-20 / 7-8",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Back Superset"
     },
     {
      "id": "ss8_d3_e3",
      "name": "Kettlebell Snatch / Step Ups (Tabata)",
      "sets": 8,
      "reps": "20s / 20s",
      "restSeconds": 10,
      "type": "tabata",
      "notes": "Tabata Interval Block"
     },
     {
      "id": "ss8_d3_e4",
      "name": "Barbell Shrug / Behind-The-Back Barbell Shrug",
      "sets": 3,
      "reps": "7-8 / 16-20",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Traps Superset"
     },
     {
      "id": "ss8_d3_e5",
      "name": "Dumbbell Clean / Bench Hop Overs (Tabata)",
      "sets": 8,
      "reps": "20s / 20s",
      "restSeconds": 10,
      "type": "tabata",
      "notes": "Tabata Interval Block"
     },
     {
      "id": "ss8_d3_e6",
      "name": "Seated Barbell Curl / Standing Barbell Curl",
      "sets": 2,
      "reps": "7-8 / 16-20",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Arms Superset"
     },
     {
      "id": "ss8_d3_e7",
      "name": "Prone Incline Dumbbell Curl / Incline Dumbbell Curl",
      "sets": 2,
      "reps": "16-20 / 7-8",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Arms Superset"
     },
     {
      "id": "ss8_d3_e8",
      "name": "Barbell Wrist Curl / Barbell Reverse Wrist Curl",
      "sets": 2,
      "reps": "7-8 / 16-20",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Forearms Superset"
     },
     {
      "id": "ss8_d3_e9",
      "name": "Dead Landmines / Jumping Jacks (Tabata)",
      "sets": 8,
      "reps": "20s / 20s",
      "restSeconds": 10,
      "type": "tabata",
      "notes": "Tabata Interval Block"
     }
    ]
   },
   {
    "dayNumber": 4,
    "title": "Day 4: Chest, Shoulders, Triceps",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "ss8_d4_e1",
      "name": "Incline Bench Press / Incline Dumbbell Flye",
      "sets": 3,
      "reps": "7-8 / 16-20",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Chest Superset"
     },
     {
      "id": "ss8_d4_e2",
      "name": "Cable Crossover (Low Pulley) / Cable Crossover (High Pulley)",
      "sets": 3,
      "reps": "16-20 / 7-8",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Chest Superset"
     },
     {
      "id": "ss8_d4_e3",
      "name": "Push Up / Jumping Jacks (Tabata)",
      "sets": 8,
      "reps": "20s / 20s",
      "restSeconds": 10,
      "type": "tabata",
      "notes": "Tabata Interval Block"
     },
     {
      "id": "ss8_d4_e4",
      "name": "Smith-Machine Seated Behind-The-Neck Shoulder Press / Smith Machine Upright Row",
      "sets": 3,
      "reps": "7-8 / 16-20",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Shoulders Superset"
     },
     {
      "id": "ss8_d4_e5",
      "name": "Lying Cable Rear Delt Raise / Cable Lateral Raise",
      "sets": 3,
      "reps": "16-20 / 7-8",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Shoulders Superset"
     },
     {
      "id": "ss8_d4_e6",
      "name": "Kettlebell Swing / Smith Machine Hang Power Clean (Tabata)",
      "sets": 8,
      "reps": "20s / 20s",
      "restSeconds": 10,
      "type": "tabata",
      "notes": "Tabata Interval Block"
     },
     {
      "id": "ss8_d4_e7",
      "name": "Lying Triceps Extension / Bench Dip",
      "sets": 2,
      "reps": "7-8 / 16-20",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Triceps Superset"
     },
     {
      "id": "ss8_d4_e8",
      "name": "Reverse-Grip Triceps Pressdown / Triceps Pressdown",
      "sets": 2,
      "reps": "16-20 / 7-8",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Triceps Superset"
     },
     {
      "id": "ss8_d4_e9",
      "name": "Dead Landmines / Burpee (Tabata)",
      "sets": 8,
      "reps": "20s / 20s",
      "restSeconds": 10,
      "type": "tabata",
      "notes": "Tabata Interval Block"
     }
    ]
   },
   {
    "dayNumber": 5,
    "title": "Day 5: Legs, Calves, Abs",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "ss8_d5_e1",
      "name": "Squat / Barbell Lunge",
      "sets": 3,
      "reps": "7-8 / 16-20",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Legs Superset"
     },
     {
      "id": "ss8_d5_e2",
      "name": "One-Leg Leg Press (Alt. Legs) / Leg Press",
      "sets": 3,
      "reps": "16-20 / 7-8",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Legs Superset"
     },
     {
      "id": "ss8_d5_e3",
      "name": "Deadlift / Romanian Deadlift",
      "sets": 3,
      "reps": "7-8 / 16-20",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Legs Superset"
     },
     {
      "id": "ss8_d5_e4",
      "name": "Squat / Kettlebell Snatch (Tabata)",
      "sets": 8,
      "reps": "20s / 20s",
      "restSeconds": 10,
      "type": "tabata",
      "notes": "Tabata Interval Block"
     },
     {
      "id": "ss8_d5_e5",
      "name": "Seated Calf Raise / One-Leg Standing Calf Raise (Body Weight)",
      "sets": 3,
      "reps": "15 / To Failure",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Calves Superset"
     },
     {
      "id": "ss8_d5_e6",
      "name": "Dumbbell Lunge / Mountain Climbers (Tabata)",
      "sets": 8,
      "reps": "20s / 20s",
      "restSeconds": 10,
      "type": "tabata",
      "notes": "Tabata Interval Block"
     },
     {
      "id": "ss8_d5_e7",
      "name": "Cable Crunch / Oblique Cable Crunch",
      "sets": 3,
      "reps": "10 / 15",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Abs Superset"
     },
     {
      "id": "ss8_d5_e8",
      "name": "Reverse Crunch / Barbell Roll Out (Tabata)",
      "sets": 8,
      "reps": "20s / 20s",
      "restSeconds": 10,
      "type": "tabata",
      "notes": "Tabata Interval Block"
     }
    ]
   },
   {
    "dayNumber": 6,
    "title": "Day 6: Back, Traps, Biceps, Forearms",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "ss8_d6_e1",
      "name": "Wide-Grip Lat Pulldowns / Reverse-Grip Lat Pulldown",
      "sets": 3,
      "reps": "7-8 / 16-20",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Back Superset"
     },
     {
      "id": "ss8_d6_e2",
      "name": "Straight-Arm Pulldown / Standing Lat Pulldown",
      "sets": 3,
      "reps": "16-20 / 7-8",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Back Superset"
     },
     {
      "id": "ss8_d6_e3",
      "name": "Kettlebell Snatch / Step Ups (Tabata)",
      "sets": 8,
      "reps": "20s / 20s",
      "restSeconds": 10,
      "type": "tabata",
      "notes": "Tabata Interval Block"
     },
     {
      "id": "ss8_d6_e4",
      "name": "Smith Machine Behind-The-Back Barbell Shrug / Smith Machine Shrug",
      "sets": 3,
      "reps": "7-8 / 16-20",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Traps Superset"
     },
     {
      "id": "ss8_d6_e5",
      "name": "Dumbbell Clean / Bench Hop Overs (Tabata)",
      "sets": 8,
      "reps": "20s / 20s",
      "restSeconds": 10,
      "type": "tabata",
      "notes": "Tabata Interval Block"
     },
     {
      "id": "ss8_d6_e6",
      "name": "Standing Barbell Curl (EZ-Bar) / Preacher Curl (Also Can Use EZ-Bar)",
      "sets": 2,
      "reps": "7-8 / 16-20",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Arms Superset"
     },
     {
      "id": "ss8_d6_e7",
      "name": "Incline Dumbbell Curl / Alternating Dumbbell Curl",
      "sets": 2,
      "reps": "16-20 / 7-8",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Arms Superset"
     },
     {
      "id": "ss8_d6_e8",
      "name": "Dumbbell Reverse Wrist Curl / Dumbbell Wrist Curl",
      "sets": 2,
      "reps": "7-8 / 16-20",
      "restSeconds": 60,
      "type": "superset",
      "notes": "Forearms Superset"
     },
     {
      "id": "ss8_d6_e9",
      "name": "Dead Landmines / Jumping Jacks (Tabata)",
      "sets": 8,
      "reps": "20s / 20s",
      "restSeconds": 10,
      "type": "tabata",
      "notes": "Tabata Interval Block"
     }
    ]
   }
  ]
 },
 {
  "id": "usn_5_day_mass_plan",
  "title": "USN 5 Day Mass Plan",
  "description": "An extreme 5-day split designed to increase muscle mass by allowing maximum recuperation. This program features a 'spill over' routine where each body part is worked once directly and once indirectly. Finish each session with 20-25 minutes of moderate-intensity cardio.",
  "tags": [
   "USN",
   "Mass Building",
   "Hypertrophy",
   "5 Day Split",
   "Volume"
  ],
  "days": [
   {
    "dayNumber": 1,
    "title": "Day 1: Legs",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "usn_d1_e1",
      "name": "Barbell Squats",
      "sets": 4,
      "reps": "8",
      "restSeconds": 120,
      "type": "standard",
      "notes": "Increase weight on each progressive set (pyramid style)"
     },
     {
      "id": "usn_d1_e2",
      "name": "Leg Press",
      "sets": 4,
      "reps": "25",
      "restSeconds": 120,
      "type": "standard",
      "notes": "High volume for muscular endurance and pump"
     },
     {
      "id": "usn_d1_e3",
      "name": "Leg Curls",
      "sets": 5,
      "reps": "8",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Heavy hamstring isolation"
     },
     {
      "id": "usn_d1_e4",
      "name": "Lunges",
      "sets": 3,
      "reps": "15-20",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Unilateral leg volume"
     },
     {
      "id": "usn_d1_e5",
      "name": "Leg Extensions",
      "sets": 3,
      "reps": "15-20",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Quad isolation finisher"
     },
     {
      "id": "usn_d1_e6",
      "name": "Seated Calf Raise",
      "sets": 5,
      "reps": "12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Soleus focused calf work"
     },
     {
      "id": "usn_d1_e7",
      "name": "Standing Calf Raise",
      "sets": 4,
      "reps": "25-30",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Gastrocnemius high-rep burnout"
     },
     {
      "id": "usn_d1_e8",
      "name": "Moderate Pace Cardio",
      "sets": 1,
      "reps": "20-25 mins",
      "restSeconds": 0,
      "type": "standard",
      "notes": "Perform at the end of the workout"
     }
    ]
   },
   {
    "dayNumber": 2,
    "title": "Day 2: Chest & Abs",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "usn_d2_e1",
      "name": "Barbell Bench Press",
      "sets": 4,
      "reps": "6",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Heavy compound pressing"
     },
     {
      "id": "usn_d2_e2",
      "name": "Incline Dumbbell Press",
      "sets": 4,
      "reps": "8",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Upper chest development"
     },
     {
      "id": "usn_d2_e3",
      "name": "Flat Dumbbell Flies",
      "sets": 4,
      "reps": "12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Chest isolation stretch and squeeze"
     },
     {
      "id": "usn_d2_e4",
      "name": "Dumbbell Pullovers",
      "sets": 4,
      "reps": "15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Rib cage expansion and lat tie-in"
     },
     {
      "id": "usn_d2_e5",
      "name": "Push Ups",
      "sets": 3,
      "reps": "To Failure",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Chest burnout"
     },
     {
      "id": "usn_d2_e6",
      "name": "Leg Raises Off Bench",
      "sets": 3,
      "reps": "25",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Lower ab focus"
     },
     {
      "id": "usn_d2_e7",
      "name": "Cable Crunches",
      "sets": 3,
      "reps": "15",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Weighted core resistance"
     },
     {
      "id": "usn_d2_e8",
      "name": "Incline Sit Ups",
      "sets": 3,
      "reps": "20",
      "restSeconds": 30,
      "type": "standard",
      "notes": "Upper ab development"
     },
     {
      "id": "usn_d2_e9",
      "name": "Moderate Pace Cardio",
      "sets": 1,
      "reps": "20-25 mins",
      "restSeconds": 0,
      "type": "standard",
      "notes": "Perform at the end of the workout"
     }
    ]
   },
   {
    "dayNumber": 3,
    "title": "Day 3: Back",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "usn_d3_e1",
      "name": "Chin Up",
      "sets": 4,
      "reps": "To Failure",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Lat width builder"
     },
     {
      "id": "usn_d3_e2",
      "name": "One Arm Dumbbell Rows",
      "sets": 4,
      "reps": "10",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Unilateral back thickness"
     },
     {
      "id": "usn_d3_e3",
      "name": "Reverse Grip Pull-Downs",
      "sets": 4,
      "reps": "12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Lower lat activation"
     },
     {
      "id": "usn_d3_e4",
      "name": "Barbell Power Cleans",
      "sets": 4,
      "reps": "8",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Explosive full posterior chain movement"
     },
     {
      "id": "usn_d3_e5",
      "name": "Hyperextensions",
      "sets": 4,
      "reps": "15-20",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Erector spinae strengthening"
     },
     {
      "id": "usn_d3_e6",
      "name": "Dumbbell Side Bends",
      "sets": 4,
      "reps": "20",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Oblique work"
     },
     {
      "id": "usn_d3_e7",
      "name": "Moderate Pace Cardio",
      "sets": 1,
      "reps": "20-25 mins",
      "restSeconds": 0,
      "type": "standard",
      "notes": "Perform at the end of the workout"
     }
    ]
   },
   {
    "dayNumber": 4,
    "title": "Day 4: Shoulders & Abs",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "usn_d4_e1",
      "name": "Military Press",
      "sets": 5,
      "reps": "8",
      "restSeconds": 120,
      "type": "standard",
      "notes": "Heavy overhead press for anteriormedial delts"
     },
     {
      "id": "usn_d4_e2",
      "name": "Side Laterals",
      "sets": 4,
      "reps": "10",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Medial delt isolation"
     },
     {
      "id": "usn_d4_e3",
      "name": "Barbell Upright Rows",
      "sets": 4,
      "reps": "12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Shoulder and trap thickness"
     },
     {
      "id": "usn_d4_e4",
      "name": "Bent Over Laterals",
      "sets": 5,
      "reps": "12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Rear delt isolation"
     },
     {
      "id": "usn_d4_e5",
      "name": "Incline Sit Ups",
      "sets": 4,
      "reps": "30-50",
      "restSeconds": 60,
      "type": "standard",
      "notes": "High volume core"
     },
     {
      "id": "usn_d4_e6",
      "name": "Moderate Pace Cardio",
      "sets": 1,
      "reps": "20-25 mins",
      "restSeconds": 0,
      "type": "standard",
      "notes": "Perform at the end of the workout"
     }
    ]
   },
   {
    "dayNumber": 5,
    "title": "Day 5: Arms (Biceps/Triceps)",
    "estimatedMinutes": 60,
    "exercises": [
     {
      "id": "usn_d5_e1",
      "name": "Close Grip Bench Press",
      "sets": 5,
      "reps": "6",
      "restSeconds": 120,
      "type": "standard",
      "notes": "Heavy compound triceps"
     },
     {
      "id": "usn_d5_e2",
      "name": "Standing Barbell Curls",
      "sets": 5,
      "reps": "6",
      "restSeconds": 120,
      "type": "standard",
      "notes": "Heavy compound biceps"
     },
     {
      "id": "usn_d5_e3",
      "name": "Skull Crushers",
      "sets": 4,
      "reps": "10",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Lying triceps extensions"
     },
     {
      "id": "usn_d5_e4",
      "name": "Incline Dumbbell Curls",
      "sets": 4,
      "reps": "10",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Long-head bicep focus"
     },
     {
      "id": "usn_d5_e5",
      "name": "Triceps Cable Press Downs",
      "sets": 3,
      "reps": "15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Triceps isolation pump"
     },
     {
      "id": "usn_d5_e6",
      "name": "Dumbbell Concentration Curls",
      "sets": 3,
      "reps": "15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Biceps peak isolation"
     },
     {
      "id": "usn_d5_e7",
      "name": "Seated Calf Raise",
      "sets": 3,
      "reps": "30",
      "restSeconds": 60,
      "type": "standard",
      "notes": "High rep soleus volume"
     },
     {
      "id": "usn_d5_e8",
      "name": "Standing Calf Raise",
      "sets": 3,
      "reps": "25",
      "restSeconds": 60,
      "type": "standard",
      "notes": "High rep gastrocnemius volume"
     },
     {
      "id": "usn_d5_e9",
      "name": "Moderate Pace Cardio",
      "sets": 1,
      "reps": "20-25 mins",
      "restSeconds": 0,
      "type": "standard",
      "notes": "Perform at the end of the workout"
     }
    ]
   },
   {
    "dayNumber": 6,
    "title": "Day 6: Rest / Optional Cardio",
    "estimatedMinutes": 25,
    "exercises": [
     {
      "id": "usn_d6_e1",
      "name": "Active Recovery / Light Cardio",
      "sets": 1,
      "reps": "20-25 mins",
      "restSeconds": 0,
      "type": "standard",
      "notes": "Optional light cardio or complete rest"
     }
    ]
   },
   {
    "dayNumber": 7,
    "title": "Day 7: Complete Rest",
    "estimatedMinutes": 0,
    "exercises": [
     {
      "id": "usn_d7_e1",
      "name": "Rest Day",
      "sets": 1,
      "reps": "NA",
      "restSeconds": 0,
      "type": "standard",
      "notes": "Allow maximum recuperation for the upcoming week"
     }
    ]
   }
  ]
 },
 {
  "id": "upper_lower_6day_high_volume",
  "title": "6-Day Upper/Lower Split (High Volume)",
  "description": "3 upper + 3 lower days plus a rest day, using barbells, dumbbells and cables (lat pulldown / pushdown). Every upper day hits 3 chest, 4 back, 2 shoulder, 2 biceps and 2 triceps exercises.",
  "tags": [
   "Custom",
   "6 Days",
   "Upper/Lower",
   "High Volume"
  ],
  "days": [
   {
    "dayNumber": 1,
    "title": "Upper A: Heavy Compound Focus",
    "estimatedMinutes": 80,
    "exercises": [
     {
      "id": "ulhv_d1_e1",
      "name": "Barbell Bench Press",
      "sets": 3,
      "reps": "8-10",
      "restSeconds": 120,
      "type": "standard",
      "notes": "Chest 1/3"
     },
     {
      "id": "ulhv_d1_e2",
      "name": "Incline Dumbbell Press",
      "sets": 3,
      "reps": "10-12",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Chest 2/3"
     },
     {
      "id": "ulhv_d1_e3",
      "name": "Dumbbell Flyes",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Chest 3/3 · flat bench"
     },
     {
      "id": "ulhv_d1_e4",
      "name": "Lat Pulldown",
      "sets": 3,
      "reps": "8-10",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Back 1/4 · cable"
     },
     {
      "id": "ulhv_d1_e5",
      "name": "Barbell Bent-Over Rows",
      "sets": 3,
      "reps": "8-10",
      "restSeconds": 120,
      "type": "standard",
      "notes": "Back 2/4"
     },
     {
      "id": "ulhv_d1_e6",
      "name": "Single-Arm Dumbbell Row",
      "sets": 3,
      "reps": "10-12",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Back 3/4 · one arm at a time"
     },
     {
      "id": "ulhv_d1_e7",
      "name": "Barbell Shrugs",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Back 4/4 · upper traps"
     },
     {
      "id": "ulhv_d1_e8",
      "name": "Overhead Press",
      "sets": 3,
      "reps": "8-10",
      "restSeconds": 120,
      "type": "standard",
      "notes": "Shoulders 1/2 · barbell"
     },
     {
      "id": "ulhv_d1_e9",
      "name": "Dumbbell Lateral Raises",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Shoulders 2/2"
     },
     {
      "id": "ulhv_d1_e10",
      "name": "Barbell Curls",
      "sets": 3,
      "reps": "10-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Biceps 1/2"
     },
     {
      "id": "ulhv_d1_e11",
      "name": "Dumbbell Hammer Curls",
      "sets": 3,
      "reps": "10-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Biceps 2/2"
     },
     {
      "id": "ulhv_d1_e12",
      "name": "Close-Grip Bench Press",
      "sets": 3,
      "reps": "8-10",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Triceps 1/2 · barbell"
     },
     {
      "id": "ulhv_d1_e13",
      "name": "Triceps Pushdown",
      "sets": 3,
      "reps": "10-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Triceps 2/2 · cable"
     }
    ]
   },
   {
    "dayNumber": 2,
    "title": "Lower A: Quad Bias",
    "estimatedMinutes": 55,
    "exercises": [
     {
      "id": "ulhv_d2_e1",
      "name": "Barbell Back Squat",
      "sets": 4,
      "reps": "8-10",
      "restSeconds": 120,
      "type": "standard",
      "notes": "Quads / glutes"
     },
     {
      "id": "ulhv_d2_e2",
      "name": "Romanian Deadlift (RDL)",
      "sets": 4,
      "reps": "8-10",
      "restSeconds": 120,
      "type": "standard",
      "notes": "Hamstrings / glutes · barbell"
     },
     {
      "id": "ulhv_d2_e3",
      "name": "Dumbbell Walking Lunges",
      "sets": 4,
      "reps": "10-12 / leg",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Quads / glutes"
     },
     {
      "id": "ulhv_d2_e4",
      "name": "Barbell Front Squat",
      "sets": 3,
      "reps": "10-12",
      "restSeconds": 120,
      "type": "standard",
      "notes": "Quads"
     },
     {
      "id": "ulhv_d2_e5",
      "name": "Dumbbell Goblet Squats",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Quads"
     },
     {
      "id": "ulhv_d2_e6",
      "name": "Standing Barbell Calf Raises",
      "sets": 4,
      "reps": "15-20",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Calves"
     },
     {
      "id": "ulhv_d2_e7",
      "name": "Seated Dumbbell Calf Raises",
      "sets": 4,
      "reps": "15-20",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Calves (soleus)"
     }
    ]
   },
   {
    "dayNumber": 3,
    "title": "Upper B: Hypertrophy & Width",
    "estimatedMinutes": 80,
    "exercises": [
     {
      "id": "ulhv_d3_e1",
      "name": "Dumbbell Bench Press",
      "sets": 3,
      "reps": "8-10",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Chest 1/3 · flat bench"
     },
     {
      "id": "ulhv_d3_e2",
      "name": "Incline Barbell Bench Press",
      "sets": 3,
      "reps": "10-12",
      "restSeconds": 120,
      "type": "standard",
      "notes": "Chest 2/3"
     },
     {
      "id": "ulhv_d3_e3",
      "name": "Incline Dumbbell Flyes",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Chest 3/3"
     },
     {
      "id": "ulhv_d3_e4",
      "name": "Reverse-Grip Lat Pulldown",
      "sets": 3,
      "reps": "10-12",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Back 1/4 · cable, underhand grip"
     },
     {
      "id": "ulhv_d3_e5",
      "name": "Barbell Bent-Over Rows",
      "sets": 3,
      "reps": "8-10",
      "restSeconds": 120,
      "type": "standard",
      "notes": "Back 2/4 · overhand grip"
     },
     {
      "id": "ulhv_d3_e6",
      "name": "Reverse-Grip Barbell Rows",
      "sets": 3,
      "reps": "10-12",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Back 3/4 · underhand grip"
     },
     {
      "id": "ulhv_d3_e7",
      "name": "Dumbbell Shrugs",
      "sets": 3,
      "reps": "15-20",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Back 4/4 · upper traps"
     },
     {
      "id": "ulhv_d3_e8",
      "name": "Seated Dumbbell Shoulder Press",
      "sets": 3,
      "reps": "10-12",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Shoulders 1/2"
     },
     {
      "id": "ulhv_d3_e9",
      "name": "Dumbbell Lateral Raises",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Shoulders 2/2"
     },
     {
      "id": "ulhv_d3_e10",
      "name": "Preacher Curls (Dumbbell)",
      "sets": 4,
      "reps": "10-12 / arm",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Biceps 1/2 · one arm at a time"
     },
     {
      "id": "ulhv_d3_e11",
      "name": "Barbell Hammer Curl",
      "sets": 4,
      "reps": "10-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Biceps 2/2 · neutral grip (hammer/Swiss bar)"
     },
     {
      "id": "ulhv_d3_e12",
      "name": "Dumbbell Overhead Extension",
      "sets": 3,
      "reps": "10-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Triceps 1/2 · long head"
     },
     {
      "id": "ulhv_d3_e13",
      "name": "Triceps Pushdown",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Triceps 2/2 · cable"
     }
    ]
   },
   {
    "dayNumber": 4,
    "title": "Lower B: Posterior Chain Bias",
    "estimatedMinutes": 55,
    "exercises": [
     {
      "id": "ulhv_d4_e1",
      "name": "Barbell Deadlift",
      "sets": 4,
      "reps": "5-8",
      "restSeconds": 120,
      "type": "standard",
      "notes": "Posterior chain"
     },
     {
      "id": "ulhv_d4_e2",
      "name": "Bulgarian Split Squats (Dumbbell)",
      "sets": 4,
      "reps": "10-12 / leg",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Quads / glutes"
     },
     {
      "id": "ulhv_d4_e3",
      "name": "Barbell Hip Thrusts",
      "sets": 4,
      "reps": "10-12",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Glutes"
     },
     {
      "id": "ulhv_d4_e4",
      "name": "Dumbbell Stiff-Leg Deadlift",
      "sets": 4,
      "reps": "10-12",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Hamstrings"
     },
     {
      "id": "ulhv_d4_e5",
      "name": "Barbell Hack Squat",
      "sets": 3,
      "reps": "10-12",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Quads · bar held behind your legs"
     },
     {
      "id": "ulhv_d4_e6",
      "name": "Dumbbell Step-Ups",
      "sets": 3,
      "reps": "10-12 / leg",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Glutes / quads"
     },
     {
      "id": "ulhv_d4_e7",
      "name": "Single-Leg Calf Raises",
      "sets": 4,
      "reps": "15-20 / leg",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Calves · hold a dumbbell"
     }
    ]
   },
   {
    "dayNumber": 5,
    "title": "Upper C: Pump & Isolation",
    "estimatedMinutes": 80,
    "exercises": [
     {
      "id": "ulhv_d5_e1",
      "name": "Wide-Grip Barbell Bench Press",
      "sets": 3,
      "reps": "10-12",
      "restSeconds": 120,
      "type": "standard",
      "notes": "Chest 1/3"
     },
     {
      "id": "ulhv_d5_e2",
      "name": "Incline Dumbbell Press",
      "sets": 3,
      "reps": "10-12",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Chest 2/3"
     },
     {
      "id": "ulhv_d5_e3",
      "name": "Dumbbell Flyes",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Chest 3/3"
     },
     {
      "id": "ulhv_d5_e4",
      "name": "Lat Pulldown",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Back 1/4 · cable"
     },
     {
      "id": "ulhv_d5_e5",
      "name": "Barbell Bent-Over Rows",
      "sets": 3,
      "reps": "8-10",
      "restSeconds": 120,
      "type": "standard",
      "notes": "Back 2/4"
     },
     {
      "id": "ulhv_d5_e6",
      "name": "Single-Arm Dumbbell Row",
      "sets": 3,
      "reps": "10-12 / arm",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Back 3/4 · one arm at a time"
     },
     {
      "id": "ulhv_d5_e7",
      "name": "Barbell Shrugs",
      "sets": 3,
      "reps": "10-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Back 4/4 · upper traps"
     },
     {
      "id": "ulhv_d5_e8",
      "name": "Dumbbell Shoulder Press",
      "sets": 3,
      "reps": "10-12",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Shoulders 1/2"
     },
     {
      "id": "ulhv_d5_e9",
      "name": "Dumbbell Lateral Raises",
      "sets": 3,
      "reps": "15-20",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Shoulders 2/2"
     },
     {
      "id": "ulhv_d5_e10",
      "name": "Incline Dumbbell Curls",
      "sets": 3,
      "reps": "10-12",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Biceps 1/2"
     },
     {
      "id": "ulhv_d5_e11",
      "name": "Dumbbell Concentration Curls",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Biceps 2/2"
     },
     {
      "id": "ulhv_d5_e12",
      "name": "Close-Grip Bench Press",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Triceps 1/2 · barbell"
     },
     {
      "id": "ulhv_d5_e13",
      "name": "Triceps Pushdown",
      "sets": 3,
      "reps": "15-20",
      "restSeconds": 60,
      "type": "standard",
      "notes": "Triceps 2/2 · cable"
     }
    ]
   },
   {
    "dayNumber": 6,
    "title": "Lower C: Volume & Endurance",
    "estimatedMinutes": 50,
    "exercises": [
     {
      "id": "ulhv_d6_e1",
      "name": "Barbell Front Squat",
      "sets": 4,
      "reps": "8-10",
      "restSeconds": 120,
      "type": "standard",
      "notes": "Quads"
     },
     {
      "id": "ulhv_d6_e2",
      "name": "Good Mornings",
      "sets": 4,
      "reps": "10-12",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Hamstrings / lower back · barbell"
     },
     {
      "id": "ulhv_d6_e3",
      "name": "Dumbbell Reverse Lunges",
      "sets": 4,
      "reps": "10-12 / leg",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Glutes / quads"
     },
     {
      "id": "ulhv_d6_e4",
      "name": "Dumbbell Sumo Squat",
      "sets": 4,
      "reps": "12-15",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Adductors / quads"
     },
     {
      "id": "ulhv_d6_e5",
      "name": "Romanian Deadlift (RDL)",
      "sets": 3,
      "reps": "12-15",
      "restSeconds": 90,
      "type": "standard",
      "notes": "Hamstrings · barbell"
     },
     {
      "id": "ulhv_d6_e6",
      "name": "Standing Barbell Calf Raises",
      "sets": 5,
      "reps": "20",
      "restSeconds": 45,
      "type": "standard",
      "notes": "Calves"
     }
    ]
   },
   {
    "dayNumber": 7,
    "title": "Rest / Recovery",
    "estimatedMinutes": 0,
    "exercises": []
   }
  ]
 }
];
