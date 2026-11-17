// PulseTrack exercise guides, keyed by the exact exercise name in exercises.js or opengym-exercises.js (those files are never changed).
// Per exercise: equipment { items, setup }, steps [{ text, image { src, license, author, attribution, url }, arrows [{ from, to, label }] }],
// muscles [{ muscle_id, role: primary|secondary, intensity 0-100, source? }], muscle_source { type: study|estimate, refs, note }, reviewed.
// A muscle with source "estimate" was not measured by the cited studies. intensity is a 0-100 scaling of the studies' relative results,
// not a measured percentage. reviewed is only ever set true by a person on their phone (stored there, layered over this file).
// Check it with: python3 tools/validate_guides.py
const EXERCISE_GUIDES = {
 "Bench Press": {
  "equipment": {
   "items": [
    "barbell",
    "flat bench",
    "rack or safety arms"
   ],
   "setup": "lying on a flat bench"
  },
  "muscles": [
   {
    "muscle_id": "chest",
    "role": "primary",
    "intensity": 95
   },
   {
    "muscle_id": "upper_chest",
    "role": "primary",
    "intensity": 70
   },
   {
    "muscle_id": "triceps",
    "role": "secondary",
    "intensity": 65
   },
   {
    "muscle_id": "front_delts",
    "role": "secondary",
    "intensity": 60
   }
  ],
  "muscle_source": {
   "type": "study",
   "refs": [
    "Barnett C, Kippers V, Turner P. Effects of variations of the bench press exercise on the EMG activity of five shoulder muscles. J Strength Cond Res. 1995;9(4):222-227.",
    "Lehman GJ. The influence of grip width and forearm pronation/supination on upper-body myoelectric activity during the flat bench press. J Strength Cond Res. 2005;19(3):587-591."
   ],
   "note": "Which muscles work hardest follows these EMG studies. The 0-100 numbers scale their relative results; they are not measured percentages. Muscles marked estimate were not measured in them."
  },
  "reviewed": false
 },
 "Squat": {
  "equipment": {
   "items": [
    "barbell",
    "squat rack"
   ],
   "setup": "standing, bar on the upper back"
  },
  "muscles": [
   {
    "muscle_id": "quads",
    "role": "primary",
    "intensity": 95
   },
   {
    "muscle_id": "glutes",
    "role": "primary",
    "intensity": 75
   },
   {
    "muscle_id": "adductors",
    "role": "secondary",
    "intensity": 50,
    "source": "estimate"
   },
   {
    "muscle_id": "hamstrings",
    "role": "secondary",
    "intensity": 40
   },
   {
    "muscle_id": "lower_back",
    "role": "secondary",
    "intensity": 40,
    "source": "estimate"
   },
   {
    "muscle_id": "calves",
    "role": "secondary",
    "intensity": 25
   }
  ],
  "muscle_source": {
   "type": "study",
   "refs": [
    "Escamilla RF. Knee biomechanics of the dynamic squat exercise. Med Sci Sports Exerc. 2001;33(1):127-141.",
    "Caterisano A, Moss RF, Pellinger TK, et al. The effect of back squat depth on the EMG activity of 4 superficial hip and thigh muscles. J Strength Cond Res. 2002;16(3):428-432."
   ],
   "note": "Which muscles work hardest follows these EMG studies. The 0-100 numbers scale their relative results; they are not measured percentages. Muscles marked estimate were not measured in them."
  },
  "reviewed": false
 },
 "Romanian Deadlift (RDL)": {
  "equipment": {
   "items": [
    "barbell"
   ],
   "setup": "standing"
  },
  "muscles": [
   {
    "muscle_id": "hamstrings",
    "role": "primary",
    "intensity": 95
   },
   {
    "muscle_id": "glutes",
    "role": "primary",
    "intensity": 70,
    "source": "estimate"
   },
   {
    "muscle_id": "lower_back",
    "role": "secondary",
    "intensity": 60,
    "source": "estimate"
   },
   {
    "muscle_id": "forearm_flexors",
    "role": "secondary",
    "intensity": 30,
    "source": "estimate"
   }
  ],
  "muscle_source": {
   "type": "study",
   "refs": [
    "McAllister MJ, Hammond KG, Schilling BK, Ferreria LC, Reed JP, Weiss LW. Muscle activation during various hamstring exercises. J Strength Cond Res. 2014;28(6):1573-1580."
   ],
   "note": "Which muscles work hardest follows these EMG studies. The 0-100 numbers scale their relative results; they are not measured percentages. Muscles marked estimate were not measured in them."
  },
  "reviewed": false
 },
 "Lat Pulldown": {
  "equipment": {
   "items": [
    "lat pulldown machine",
    "straight bar attachment"
   ],
   "setup": "seated, thighs under the pad"
  },
  "muscles": [
   {
    "muscle_id": "lats",
    "role": "primary",
    "intensity": 95
   },
   {
    "muscle_id": "biceps",
    "role": "secondary",
    "intensity": 55
   },
   {
    "muscle_id": "mid_back",
    "role": "secondary",
    "intensity": 50
   },
   {
    "muscle_id": "rear_delts",
    "role": "secondary",
    "intensity": 35,
    "source": "estimate"
   }
  ],
  "muscle_source": {
   "type": "study",
   "refs": [
    "Signorile JF, Zink AJ, Szwed SP. A comparative electromyographical investigation of muscle utilization patterns using various hand positions during the lat pull-down. J Strength Cond Res. 2002;16(4):539-546. PMID 12423182.",
    "Lusk SJ, Hale BD, Russell DM. Grip width and forearm orientation effects on muscle activity during the lat pull-down. J Strength Cond Res. 2010;24(7):1895-1900. PMID 20543740.",
    "Lehman GJ, Buchan DD, Lundy A, Myers N, Nalborczyk A. Variations in muscle activation levels during traditional latissimus dorsi weight training exercises: an experimental study. Dyn Med. 2004;3:4. doi:10.1186/1476-5918-3-4."
   ],
   "note": "Which muscles work hardest follows these EMG studies. The 0-100 numbers scale their relative results; they are not measured percentages. Muscles marked estimate were not measured in them."
  },
  "reviewed": false
 },
 "Seated Cable Row": {
  "equipment": {
   "items": [
    "cable row machine",
    "V-bar attachment"
   ],
   "setup": "seated, feet on the platform"
  },
  "muscles": [
   {
    "muscle_id": "mid_back",
    "role": "primary",
    "intensity": 95
   },
   {
    "muscle_id": "lats",
    "role": "primary",
    "intensity": 80
   },
   {
    "muscle_id": "biceps",
    "role": "secondary",
    "intensity": 50
   },
   {
    "muscle_id": "rear_delts",
    "role": "secondary",
    "intensity": 40,
    "source": "estimate"
   }
  ],
  "muscle_source": {
   "type": "study",
   "refs": [
    "Lehman GJ, Buchan DD, Lundy A, Myers N, Nalborczyk A. Variations in muscle activation levels during traditional latissimus dorsi weight training exercises: an experimental study. Dyn Med. 2004;3:4. doi:10.1186/1476-5918-3-4."
   ],
   "note": "Which muscles work hardest follows these EMG studies. The 0-100 numbers scale their relative results; they are not measured percentages. Muscles marked estimate were not measured in them."
  },
  "reviewed": false
 },
 "Push-Ups": {
  "equipment": {
   "items": [
    "bodyweight"
   ],
   "setup": "on the floor"
  },
  "muscles": [
   {
    "muscle_id": "chest",
    "role": "primary",
    "intensity": 90
   },
   {
    "muscle_id": "triceps",
    "role": "secondary",
    "intensity": 65
   },
   {
    "muscle_id": "front_delts",
    "role": "secondary",
    "intensity": 55
   },
   {
    "muscle_id": "abs",
    "role": "secondary",
    "intensity": 35,
    "source": "estimate"
   },
   {
    "muscle_id": "serratus",
    "role": "secondary",
    "intensity": 30,
    "source": "estimate"
   }
  ],
  "muscle_source": {
   "type": "study",
   "refs": [
    "Cogley RM, Archambault TA, Fibeger JF, Koverman MM, Youdas JW, Hollman JH. Comparison of muscle activation using various hand positions during the push-up exercise. J Strength Cond Res. 2005;19(3):628-633.",
    "Calatayud J, Borreani S, Colado JC, et al. Bench press and push-up at comparable levels of muscle activity results in similar strength gains. J Strength Cond Res. 2015;29(1):246-253."
   ],
   "note": "Which muscles work hardest follows these EMG studies. The 0-100 numbers scale their relative results; they are not measured percentages. Muscles marked estimate were not measured in them."
  },
  "reviewed": false
 }
};
