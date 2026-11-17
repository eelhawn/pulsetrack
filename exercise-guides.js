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
  "steps": [
   {
    "text": "Lie with your eyes under the bar, feet flat, shoulder blades pinched together and down. Unrack and hold the bar over your shoulders with straight arms.",
    "image": {
     "src": "img/ex/bench-press-1.svg",
     "license": "original",
     "author": "PulseTrack",
     "attribution": "Line drawing made for PulseTrack",
     "url": "",
     "alt": "Lying on the bench, bar held over the shoulders"
    },
    "arrows": []
   },
   {
    "text": "Lower the bar to your mid-chest, elbows about 45 to 60 degrees from your sides.",
    "image": {
     "src": "img/ex/bench-press-2.svg",
     "license": "original",
     "author": "PulseTrack",
     "attribution": "Line drawing made for PulseTrack",
     "url": "",
     "alt": "Bar lowered to the mid-chest"
    },
    "arrows": [
     {
      "from": [
       0.47,
       0.2
      ],
      "to": [
       0.47,
       0.42
      ],
      "label": "lower"
     }
    ]
   },
   {
    "text": "Press the bar back up over your shoulders until your arms are straight.",
    "image": {
     "src": "img/ex/bench-press-1.svg",
     "license": "original",
     "author": "PulseTrack",
     "attribution": "Line drawing made for PulseTrack",
     "url": "",
     "alt": "Bar pressed back over the shoulders"
    },
    "arrows": [
     {
      "from": [
       0.47,
       0.46
      ],
      "to": [
       0.47,
       0.24
      ],
      "label": "press"
     }
    ]
   }
  ],
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
  "steps": [
   {
    "text": "Stand with your feet about shoulder width, toes turned slightly out, the bar on your upper back. Brace your core.",
    "image": {
     "src": "img/ex/squat-1.svg",
     "license": "original",
     "author": "PulseTrack",
     "attribution": "Line drawing made for PulseTrack",
     "url": "",
     "alt": "Standing tall with the bar on the upper back"
    },
    "arrows": []
   },
   {
    "text": "Sit down and back with your chest up until your thighs are about parallel, knees tracking over your toes.",
    "image": {
     "src": "img/ex/squat-2.svg",
     "license": "original",
     "author": "PulseTrack",
     "attribution": "Line drawing made for PulseTrack",
     "url": "",
     "alt": "Hips down and back, thighs about parallel"
    },
    "arrows": [
     {
      "from": [
       0.4,
       0.45
      ],
      "to": [
       0.4,
       0.68
      ],
      "label": "sit back"
     }
    ]
   },
   {
    "text": "Drive up through your whole foot to stand tall.",
    "image": {
     "src": "img/ex/squat-1.svg",
     "license": "original",
     "author": "PulseTrack",
     "attribution": "Line drawing made for PulseTrack",
     "url": "",
     "alt": "Standing back up"
    },
    "arrows": [
     {
      "from": [
       0.43,
       0.7
      ],
      "to": [
       0.43,
       0.46
      ],
      "label": "drive up"
     }
    ]
   }
  ],
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
  "steps": [
   {
    "text": "Stand tall holding the bar at your thighs, knees slightly bent.",
    "image": {
     "src": "img/ex/romanian-deadlift-1.svg",
     "license": "original",
     "author": "PulseTrack",
     "attribution": "Line drawing made for PulseTrack",
     "url": "",
     "alt": "Standing with the bar at the thighs"
    },
    "arrows": []
   },
   {
    "text": "Push your hips back and slide the bar down your legs until you feel a strong hamstring stretch. Keep your back flat.",
    "image": {
     "src": "img/ex/romanian-deadlift-2.svg",
     "license": "original",
     "author": "PulseTrack",
     "attribution": "Line drawing made for PulseTrack",
     "url": "",
     "alt": "Hips pushed back, flat back, bar below the knees"
    },
    "arrows": [
     {
      "from": [
       0.47,
       0.4
      ],
      "to": [
       0.33,
       0.4
      ],
      "label": "hips back"
     },
     {
      "from": [
       0.72,
       0.5
      ],
      "to": [
       0.72,
       0.74
      ],
      "label": "bar down"
     }
    ]
   },
   {
    "text": "Drive your hips forward to stand tall, squeezing your glutes.",
    "image": {
     "src": "img/ex/romanian-deadlift-1.svg",
     "license": "original",
     "author": "PulseTrack",
     "attribution": "Line drawing made for PulseTrack",
     "url": "",
     "alt": "Hips forward to stand tall"
    },
    "arrows": [
     {
      "from": [
       0.38,
       0.48
      ],
      "to": [
       0.5,
       0.48
      ],
      "label": "hips forward"
     }
    ]
   }
  ],
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
  "steps": [
   {
    "text": "Sit with your thighs snug under the pad and grip the bar just outside your shoulders. Lean back slightly and lift your chest.",
    "image": {
     "src": "img/ex/lat-pulldown-1.svg",
     "license": "original",
     "author": "PulseTrack",
     "attribution": "Line drawing made for PulseTrack",
     "url": "",
     "alt": "Seated under the pad, arms up on the bar"
    },
    "arrows": []
   },
   {
    "text": "Pull the bar to your upper chest, driving your elbows down and back.",
    "image": {
     "src": "img/ex/lat-pulldown-2.svg",
     "license": "original",
     "author": "PulseTrack",
     "attribution": "Line drawing made for PulseTrack",
     "url": "",
     "alt": "Bar pulled to the upper chest"
    },
    "arrows": [
     {
      "from": [
       0.57,
       0.14
      ],
      "to": [
       0.57,
       0.32
      ],
      "label": "pull down"
     },
     {
      "from": [
       0.37,
       0.34
      ],
      "to": [
       0.37,
       0.5
      ],
      "label": "elbows down"
     }
    ]
   },
   {
    "text": "Let the bar rise slowly until your arms are straight.",
    "image": {
     "src": "img/ex/lat-pulldown-1.svg",
     "license": "original",
     "author": "PulseTrack",
     "attribution": "Line drawing made for PulseTrack",
     "url": "",
     "alt": "Bar back up, arms straight"
    },
    "arrows": [
     {
      "from": [
       0.57,
       0.32
      ],
      "to": [
       0.57,
       0.14
      ],
      "label": "slowly up"
     }
    ]
   }
  ],
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
  "steps": [
   {
    "text": "Sit tall with your feet on the platform, knees slightly bent, chest up, arms reaching for the handle.",
    "image": {
     "src": "img/ex/seated-cable-row-1.svg",
     "license": "original",
     "author": "PulseTrack",
     "attribution": "Line drawing made for PulseTrack",
     "url": "",
     "alt": "Sitting tall, arms reaching forward"
    },
    "arrows": []
   },
   {
    "text": "Pull the handle to your lower ribs, driving your elbows back and squeezing your shoulder blades together.",
    "image": {
     "src": "img/ex/seated-cable-row-2.svg",
     "license": "original",
     "author": "PulseTrack",
     "attribution": "Line drawing made for PulseTrack",
     "url": "",
     "alt": "Handle at the lower ribs, elbows back"
    },
    "arrows": [
     {
      "from": [
       0.7,
       0.44
      ],
      "to": [
       0.56,
       0.44
      ],
      "label": "pull to your ribs"
     }
    ]
   },
   {
    "text": "Let the handle go back slowly until your arms are straight, without rounding your back.",
    "image": {
     "src": "img/ex/seated-cable-row-1.svg",
     "license": "original",
     "author": "PulseTrack",
     "attribution": "Line drawing made for PulseTrack",
     "url": "",
     "alt": "Arms back out, chest still up"
    },
    "arrows": [
     {
      "from": [
       0.56,
       0.44
      ],
      "to": [
       0.7,
       0.44
      ],
      "label": "slowly out"
     }
    ]
   }
  ],
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
  "steps": [
   {
    "text": "Hands just wider than your shoulders, body in a straight line from head to heels. Brace your core and squeeze your glutes.",
    "image": {
     "src": "img/ex/push-ups-1.svg",
     "license": "original",
     "author": "PulseTrack",
     "attribution": "Line drawing made for PulseTrack",
     "url": "",
     "alt": "High plank, body straight"
    },
    "arrows": []
   },
   {
    "text": "Lower your chest to about a fist from the floor, elbows about 45 degrees from your ribs.",
    "image": {
     "src": "img/ex/push-ups-2.svg",
     "license": "original",
     "author": "PulseTrack",
     "attribution": "Line drawing made for PulseTrack",
     "url": "",
     "alt": "Lowered, chest near the floor"
    },
    "arrows": [
     {
      "from": [
       0.84,
       0.5
      ],
      "to": [
       0.84,
       0.72
      ],
      "label": "lower"
     }
    ]
   },
   {
    "text": "Press the floor away until your arms are straight.",
    "image": {
     "src": "img/ex/push-ups-1.svg",
     "license": "original",
     "author": "PulseTrack",
     "attribution": "Line drawing made for PulseTrack",
     "url": "",
     "alt": "Pressed back up to a plank"
    },
    "arrows": [
     {
      "from": [
       0.86,
       0.76
      ],
      "to": [
       0.86,
       0.54
      ],
      "label": "press up"
     }
    ]
   }
  ],
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
