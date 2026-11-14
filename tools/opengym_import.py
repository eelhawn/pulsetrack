#!/usr/bin/env python3
"""Builds opengym-exercises.js from openGym's exercise catalogue (https://github.com/DuarteSantos8/openGym, catalogue/exercises/*.json).

    git clone --depth 1 https://github.com/DuarteSantos8/openGym.git /tmp/openGym
    python3 tools/opengym_import.py /tmp/openGym

Text only: names, body part, equipment, muscles, description and steps. The pictures and animations are NOT copied (they are licensed to
openGym by Gym visual and may not be reused). The catalogue text is AGPL-3.0 (the 1,324 entries marked textSource "exercisedb" come from
ExerciseDB under MIT), see NOTICE.md. Exercises PulseTrack already has (same name or one of its other names) are left out, and so are
openGym's male/female drawing variants, which have no text of their own.
"""
import glob, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = sys.argv[1] if len(sys.argv) > 1 else '/tmp/openGym'
files = sorted(glob.glob(os.path.join(src, 'catalogue', 'exercises', '*.json')))
if not files: sys.exit('no catalogue/exercises in ' + src)

SYN = {'alternating': 'alternate', 'alt': 'alternate', 'db': 'dumbbell', 'bb': 'barbell', 'kb': 'kettlebell', 'pullup': 'pull up', 'pushup': 'push up', 'situp': 'sit up', 'chinup': 'chin up'}
def norm(s):
    """the same exercise written a little differently ("Band Alternating Biceps Curls" = "Band Alternate Bicep Curl") gets the same key"""
    words = re.sub(r'[^a-z0-9]+', ' ', s.lower()).split()
    out = []
    for w in words:
        w = SYN.get(w, w)
        if len(w) > 3 and w.endswith('s') and not w.endswith('ss'): w = w[:-1]
        if w in ('with', 'the', 'a', 'on', 'of'): continue
        out.append(w)
    return ' '.join(out)
# the names (and other names) PulseTrack already has
have = set()
for m in re.finditer(r'^\s*\{ name: "((?:[^"\\]|\\.)*)"(.*)$', open(os.path.join(ROOT, 'exercises.js'), encoding='utf-8').read(), re.M):
    have.add(norm(m.group(1)))
    a = re.search(r'aka: \[([^\]]*)\]', m.group(2))
    if a: have.update(norm(x) for x in re.findall(r'"((?:[^"\\]|\\.)*)"', a.group(1)))

UP = {'ez': 'EZ', 'trx': 'TRX', 'v': 'V', 't': 'T', 'w': 'W', 'y': 'Y', 'i': 'I', 'l': 'L', 'x': 'X', 'rdl': 'RDL', 'jm': 'JM', 'hiit': 'HIIT', 'tns': 'TNS', 'abs': 'Abs', 'pov': 'POV', 'ii': 'II', 'iii': 'III'}
def title(n):
    def part(p):
        m = re.match(r'^([^a-z0-9]*)(.*?)([^a-z0-9]*)$', p)
        core = m.group(2)
        return m.group(1) + UP.get(core, core[:1].upper() + core[1:]) + m.group(3)
    def word(w):
        return '-'.join(part(p) for p in w.split('-'))
    return ' '.join(word(w) for w in n.split(' '))

MOB = {'stretching', 'mobility', 'yoga', 'rehab'}
UPPER = {'chest', 'back', 'shoulders', 'upper arms', 'lower arms', 'neck'}
def category(e):
    bp, t, cat = e['bodyPart'], e['target'], e.get('category')
    if cat in MOB: return 'Warm-Up & Mobility'
    if cat == 'pilates': return 'Core'
    if bp == 'chest': return 'Chest'
    if bp == 'back': return 'Traps' if t == 'traps' else 'Back'
    if bp == 'shoulders': return 'Shoulders'
    if bp == 'upper arms': return {'biceps': 'Biceps', 'triceps': 'Triceps', 'forearms': 'Forearms'}.get(t, 'Biceps' if 'curl' in e['name'] else 'Triceps')
    if bp == 'lower arms': return 'Forearms'
    if bp in ('upper legs', 'lower legs'): return 'Legs'
    if bp == 'waist': return 'Core'
    if bp == 'cardio': return 'Cardio'
    if bp == 'neck': return 'Traps'
    if bp == 'full body': return 'Cardio' if cat in ('cardio', 'plyometrics') else 'FULL'
    return 'FULL'

# a full-body lift goes in the group of the muscle it mainly trains, so every exercise sits in a muscle group (2.100.0)
BYMUSCLE = {'Quads': 'Legs', 'Glutes': 'Legs', 'Hamstrings': 'Legs', 'Adductors': 'Legs', 'Lower Legs': 'Legs', 'Traps': 'Traps', 'Neck': 'Traps',
            'Front Delts': 'Shoulders', 'Side Delts': 'Shoulders', 'Rear Delts': 'Shoulders', 'Chest': 'Chest', 'Mid-Back': 'Back', 'Lats': 'Back',
            'Lower Back': 'Back', 'Abs': 'Core', 'Obliques': 'Core', 'Core Stability': 'Core', 'Biceps': 'Biceps', 'Triceps': 'Triceps', 'Forearms': 'Forearms', 'Cardio': 'Cardio'}

T = {'pectorals': 'Chest', 'lats': 'Lats', 'upper back': 'Mid-Back', 'spine': 'Lower Back', 'traps': 'Traps', 'levator scapulae': 'Neck',
     'biceps': 'Biceps', 'triceps': 'Triceps', 'forearms': 'Forearms', 'quads': 'Quads', 'hamstrings': 'Hamstrings', 'glutes': 'Glutes',
     'adductors': 'Adductors', 'abductors': 'Glutes', 'calves': 'Lower Legs', 'shins': 'Lower Legs', 'abs': 'Abs', 'obliques': 'Obliques',
     'hip flexors': 'Abs', 'serratus anterior': 'Core Stability', 'cardiovascular system': 'Cardio'}
def muscle(e):
    bp, t, n, cat = e['bodyPart'], e['target'], e['name'], e.get('category')
    if cat in MOB:
        if bp in UPPER: return 'Upper Body Mobility'
        if bp in ('upper legs', 'lower legs'): return 'Hips & Legs Mobility'
        return 'Spine & Full Body'
    if t == 'delts':
        if re.search(r'rear|reverse fly|reverse flye|face pull|bent over lateral|bent-over lateral|prone', n): return 'Rear Delts'
        if re.search(r'lateral|side raise|upright row|y raise|y-raise', n): return 'Side Delts'
        return 'Front Delts'
    return T.get(t, 'Full Body')

# ---- what is left out as rare or not useful (2.100.0): yoga, pilates, rehab and combat drills; stretches and mobility drills except the
# short-named ones from the original ExerciseDB set; rare kit; drawing variants ("V. 2", "POV"); household props; over-long names and long
# bracketed variations; and anything whose name doesn't say a recognisable gym movement.
RARE_EQ = {'tire', 'macebell', 'hammer', 'sandbag', 'bosu ball', 'massage ball', 'roller', 'upper body ergometer', 'stepmill machine', 'skierg machine', 'elliptical machine', 'stationary bike'}
MOVE = re.compile(r"press|row\b|rows\b|curl|raise|fly\b|flye|squat|lunge|deadlift|pulldown|pull[- ]?down|pull[- ]?ups?\b|chin[- ]?ups?\b|push[- ]?ups?\b|\bdips?\b|"
                  r"extension|pushdown|push[- ]?down|crunch|plank|shrug|bridge|thrust|kickback|kick back|calf|step[- ]?ups?\b|swing|clean|snatch|jerk|carry|walk\b|"
                  r"rollout|roll[- ]?out|twist|sit[- ]?ups?\b|face pull|pullover|good morning|hyperextension|adduction|abduction|woodchop|wood chop|v[- ]?up|burpee|"
                  r"mountain climber|jump|thruster|pallof|farmer|crossover|cross over|pec deck|leg curl|leg press|hack squat|upright row|lateral|reverse fly|"
                  r"toes to bar|muscle[- ]?up|l[- ]?sit|dragon flag|ab wheel|skull ?crusher|preacher|concentration|zottman|wrist|pull apart|slam|rope climb|\blever\b|superman|stretch")
ODD = re.compile(r"bottle|towel|chair|sofa|couch|\bbed\b|table|backpack|broom|stick\b|bucket|book|door|stairs?\b|balloon|baby|partner|tennis|golf|ski\b|skater|"
                 r"hula|frisbee|boxing|kick\b|punch|jab|strongman|crucifix|lay down|power sled|\bpose\b")
def rare(e, name):
    n, cat = name.lower(), e.get('category')
    if cat in ('yoga', 'pilates', 'rehab', 'combat'): return True
    if cat in ('stretching', 'mobility') and not (e.get('textSource') == 'exercisedb' and len(name) <= 30): return True
    if e['equipment'] in RARE_EQ: return True
    if re.search(r'\bv\. ?\d|\bpov\b|\(male\)|\(female\)|\((?:left|right)\)|version|variation', n) or ODD.search(n): return True
    if len(name) > 40: return True
    m = re.search(r'\(([^)]*)\)', n)
    if m and len(m.group(1).split()) > 2: return True
    return not MOVE.search(n)

out, seen, skipped_have, skipped_dup, skipped_rare = [], set(), 0, 0, 0
for f in files:
    e = json.load(open(f, encoding='utf-8'))
    if e.get('variantOf') or 'name' not in e: continue
    k = norm(e['name'])
    if k in have: skipped_have += 1; continue
    if k in seen: skipped_dup += 1; continue
    seen.add(k)
    if rare(e, title(e['name'])): skipped_rare += 1; continue
    o = {'og': e['id'], 'name': title(e['name']), 'category': category(e), 'muscle': muscle(e), 'eq': e['equipment']}
    if o['category'] == 'FULL': o['category'] = BYMUSCLE.get(o['muscle'], 'Legs')
    if e.get('needs'): o['needs'] = e['needs']
    if e.get('hold'): o['hold'] = 1
    if e.get('textSource') == 'exercisedb': o['mit'] = 1
    if e.get('description'): o['desc'] = e['description'].strip()
    steps = [s.strip() for s in (e.get('instructions') or []) if s.strip()]
    if steps: o['tips'] = steps
    out.append(o)
out.sort(key=lambda o: (o['category'], o['name']))

HEAD = '''// openGym exercise library for PulseTrack: %d exercises (text only). Loaded in the background; each one joins its muscle group in the exercise list.
// Built by tools/opengym_import.py from openGym's catalogue (https://github.com/DuarteSantos8/openGym, catalogue/exercises).
// Copyright (C) 2026 Duarte Santos and the openGym contributors, GNU AGPL v3.0. Entries with "mit": 1 originate from ExerciseDB v1 by AscendAPI
// (via hasaneyldrm/exercises-dataset, MIT licence, Copyright (c) 2026 Hasan Emir Yildirim). See NOTICE.md. No pictures or animations are included.
// Do not edit by hand: rebuild it with the tool. Exercises PulseTrack already has in exercises.js are left out, and so are rare or niche ones
// (yoga, pilates, rehab, most stretches, rare kit, drawing variants, household props), see rare() in the tool.
// Fields: og = openGym id, eq = equipment, needs = extra kit the name doesn't say, hold = only ever held (timed), desc = what it is, tips = the steps.
'''
body = 'const OPENGYM_EXERCISES = [\n' + ',\n'.join(json.dumps(o, ensure_ascii=False, separators=(',', ':')) for o in out) + '\n];\n'
open(os.path.join(ROOT, 'opengym-exercises.js'), 'w', encoding='utf-8').write(HEAD % len(out) + body)
print('%d exercises written, %d already in PulseTrack, %d duplicate names, %d rare or not useful left out; %d bytes' % (len(out), skipped_have, skipped_dup, skipped_rare, len(HEAD) + len(body)))
