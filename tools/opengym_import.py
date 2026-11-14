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

norm = lambda s: re.sub(r'\s+', ' ', re.sub(r'[^a-z0-9]+', ' ', s.lower())).strip()
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
    if bp == 'full body': return 'Cardio' if cat in ('cardio', 'plyometrics') else 'Full Body'
    return 'Full Body'

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

out, seen, skipped_have, skipped_dup = [], set(), 0, 0
for f in files:
    e = json.load(open(f, encoding='utf-8'))
    if e.get('variantOf') or 'name' not in e: continue
    k = norm(e['name'])
    if k in have: skipped_have += 1; continue
    if k in seen: skipped_dup += 1; continue
    seen.add(k)
    o = {'og': e['id'], 'name': title(e['name']), 'category': category(e), 'muscle': muscle(e), 'eq': e['equipment']}
    if e.get('needs'): o['needs'] = e['needs']
    if e.get('hold'): o['hold'] = 1
    if e.get('textSource') == 'exercisedb': o['mit'] = 1
    if e.get('description'): o['desc'] = e['description'].strip()
    steps = [s.strip() for s in (e.get('instructions') or []) if s.strip()]
    if steps: o['tips'] = steps
    out.append(o)
out.sort(key=lambda o: (o['category'], o['name']))

HEAD = '''// openGym exercise library for PulseTrack: %d exercises (text only), loaded in the background and searchable in the exercise picker.
// Built by tools/opengym_import.py from openGym's catalogue (https://github.com/DuarteSantos8/openGym, catalogue/exercises).
// Copyright (C) 2026 Duarte Santos and the openGym contributors, GNU AGPL v3.0. Entries with "mit": 1 originate from ExerciseDB v1 by AscendAPI
// (via hasaneyldrm/exercises-dataset, MIT licence, Copyright (c) 2026 Hasan Emir Yildirim). See NOTICE.md. No pictures or animations are included.
// Do not edit by hand: rebuild it with the tool. Exercises PulseTrack already has in exercises.js are left out.
// Fields: og = openGym id, eq = equipment, needs = extra kit the name doesn't say, hold = only ever held (timed), desc = what it is, tips = the steps.
'''
body = 'const OPENGYM_EXERCISES = [\n' + ',\n'.join(json.dumps(o, ensure_ascii=False, separators=(',', ':')) for o in out) + '\n];\n'
open(os.path.join(ROOT, 'opengym-exercises.js'), 'w', encoding='utf-8').write(HEAD % len(out) + body)
print('%d exercises written, %d already in PulseTrack, %d duplicate names; %d bytes' % (len(out), skipped_have, skipped_dup, len(HEAD) + len(body)))
