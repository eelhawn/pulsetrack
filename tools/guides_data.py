#!/usr/bin/env python3
"""Shared helpers for exercise-guides.js (the built-in exercise guides): read and write it, the 26 muscle ids, the exercise names.

exercise-guides.js is plain JSON after its first line ("const EXERCISE_GUIDES = ") so Python can read and write it.
"""
import json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GUIDES = os.path.join(ROOT, 'exercise-guides.js')
HEAD = ('// PulseTrack exercise guides, keyed by the exact exercise name in exercises.js or opengym-exercises.js (those files are never changed).\n'
        '// Per exercise: equipment { items, setup }, steps [{ text, image { src, license, author, attribution, url }, arrows [{ from, to, label }] }],\n'
        '// muscles [{ muscle_id, role: primary|secondary, intensity 0-100, source? }], muscle_source { type: study|estimate, refs, note }, reviewed.\n'
        '// A muscle with source "estimate" was not measured by the cited studies. intensity is a 0-100 scaling of the studies\' relative results,\n'
        '// not a measured percentage. reviewed is only ever set true by a person on their phone (stored there, layered over this file).\n'
        '// Check it with: python3 tools/validate_guides.py\n')
MUSCLES = ['neck', 'traps', 'front_delts', 'side_delts', 'rear_delts', 'upper_chest', 'chest', 'serratus', 'biceps', 'brachialis', 'triceps',
           'forearm_flexors', 'forearm_extensors', 'abs', 'obliques', 'lats', 'mid_back', 'lower_back', 'glutes', 'glute_med', 'hip_flexors',
           'adductors', 'quads', 'hamstrings', 'calves', 'tibialis']


def read_guides():
    s = open(GUIDES, encoding='utf-8').read()
    m = re.search(r'const EXERCISE_GUIDES = (\{.*\});\s*$', s, re.S)
    return json.loads(m.group(1))


def write_guides(g):
    body = json.dumps(g, indent=1, ensure_ascii=False)
    open(GUIDES, 'w', encoding='utf-8').write(HEAD + 'const EXERCISE_GUIDES = ' + body + ';\n')


def exercise_names():
    """every built-in exercise name, in file order (exercises.js, then opengym-exercises.js)"""
    a = open(os.path.join(ROOT, 'exercises.js'), encoding='utf-8').read()
    names = re.findall(r'^\s*\{\s*name:\s*"((?:[^"\\]|\\.)*)"', a, re.M)   # not the example in the header comment
    b = open(os.path.join(ROOT, 'opengym-exercises.js'), encoding='utf-8').read()
    names += [json.loads('"' + n + '"') for n in re.findall(r'^\{"og":"[^"]*","name":"((?:[^"\\]|\\.)*)"', b, re.M)]
    return names


# ---- which of those the app shows: openGym entries that are another spelling of a PulseTrack exercise are merged into it
#      (the same rules as norm/keyOf in src/js/016 and merge() in src/js/117: Push-Up shows as Push-Ups)
_NOISE = {'the', 'a', 'of', 'with', 'and', 'time', 'standard', 'biceps', 'bicep', 'triceps', 'tricep'}
_SYN = {'pressdown': 'pushdown', 'flye': 'fly', 'flyes': 'fly', 'flies': 'fly', 'flys': 'fly', 'alternate': 'alternating', 'dumbell': 'dumbbell',
        'db': 'dumbbell', 'bb': 'barbell', 'kb': 'kettlebell', 'hyperextensions': 'hyperextension'}
_RULES = [(r'\bpull[\s-]?downs?\b', 'pulldown'), (r'\b(push|press)[\s-]?downs?\b', 'pushdown'), (r'\bpull[\s-]?overs?\b', 'pullover'),
          (r'\bpull[\s-]?ups?\b', 'pull-up'), (r'\bchin[\s-]?ups?\b|\bchins\b', 'chin-up'), (r'\bpush[\s-]?ups?\b', 'push-up'),
          (r'\bsit[\s-]?ups?\b', 'sit-up'), (r'\bface[\s-]?pulls?\b', 'face pull'), (r'\bpeck deck\b|\bbutterfl(y|ies)\b', 'pec deck'),
          (r'\b(rear|reverse) (dumbbell |cable |machine |db |standing )*(raises?|laterals?)\b|\bbent[\s-]?over laterals?\b|\bstanding cable rear raises?\b', 'rear delt raise'),
          (r'\bside cable (laterals?|raises?)\b', 'cable lateral raise'), (r'\bside (dumbbell )?(laterals?|raises?)\b', 'lateral raise'),
          (r'\bdeads\b', 'deadlift'), (r'\blaying\b', 'lying'), (r'\bext\b\.?', 'extension'), (r'\bdb\b', 'dumbbell'), (r'\bbb\b', 'barbell'), (r'[()]', ' ')]


def _norm(name):
    s = str(name).lower()
    for a, b in _RULES: s = re.sub(a, b, s)
    return re.sub(r'\s+', ' ', s).strip()


def _key(name):
    out = []
    for t in re.findall(r'[a-z0-9]+', _norm(name).replace('&', ' and ')):
        if t in _NOISE: continue
        if t in _SYN: t = _SYN[t]
        elif len(t) > 3 and t.endswith('ies'): t = t[:-3] + 'y'
        elif len(t) > 4 and re.search(r'(ch|sh|x|ss|z)es$', t): t = t[:-2]
        elif len(t) > 3 and t.endswith('s') and not t.endswith('ss'): t = t[:-1]
        out.append(t)
    return ' '.join(sorted(out))


def app_names():
    """(names the app shows, {openGym name: the PulseTrack name it shows under})"""
    a = open(os.path.join(ROOT, 'exercises.js'), encoding='utf-8').read()
    own, exact, keyed = [], {}, {}
    for line in a.splitlines():
        m = re.match(r'\s*\{\s*name:\s*"((?:[^"\\]|\\.)*)"', line)
        if not m: continue
        n = m.group(1); own.append(n)
        aka = re.search(r'aka:\s*\[([^\]]*)\]', line)
        for x in [n] + (re.findall(r'"((?:[^"\\]|\\.)*)"', aka.group(1)) if aka else []):
            exact.setdefault(x.lower(), n); k = _key(x)
            if k: keyed.setdefault(k, n)
    shown, merged, have = list(own), {}, {n.lower() for n in own}
    for n in exercise_names()[len(own):]:
        if n.lower() in have: merged[n] = exact.get(n.lower(), n); continue
        same = exact.get(n.lower()) or keyed.get(_key(n))
        if same: merged[n] = same; continue
        shown.append(n); have.add(n.lower())
    return shown, merged


# ---- 3.8.0: the app's drawings by movement (module 137). The rules live in the module, between /*RULES*/ and /*END RULES*/,
# as plain JSON, so this file and the app use the very same rules.
FIGURE_JS = os.path.join(ROOT, 'src', 'js', '137-v3.8.0-drawings-for-every-exercise.js')


def figure_rules():
    s = open(FIGURE_JS, encoding='utf-8').read()
    m = re.search(r'/\*RULES\*/(.*?)/\*END RULES\*/', s, re.S)
    return [(pid, re.compile(rx, re.I), re.compile('^(%s)$' % cat, re.I) if cat else None) for pid, rx, cat in json.loads(m.group(1))]


def exercise_rows():
    """{name: category} for every built-in exercise (PulseTrack's own first, then openGym's)"""
    rows = {}
    for line in open(os.path.join(ROOT, 'exercises.js'), encoding='utf-8'):
        m = re.match(r'\s*\{\s*name:\s*"((?:[^"\\]|\\.)*)"', line)
        if m:
            c = re.search(r'category:\s*"([^"]*)"', line)
            rows[m.group(1)] = c.group(1) if c else ''
    for line in open(os.path.join(ROOT, 'opengym-exercises.js'), encoding='utf-8'):
        if line.startswith('{"og"'):
            o = json.loads(line.rstrip().rstrip(','))
            rows.setdefault(o['name'], o.get('category', ''))
    return rows


def figure_ids():
    """the movement ids the module defines (the keys of PATTERNS)"""
    s = open(FIGURE_JS, encoding='utf-8').read()
    body = s[s.index('const PATTERNS = {'):s.index('/*RULES*/')]
    return set(re.findall(r'^    ([a-z_]+): \{', body, re.M))


def figure_of(name, category, rules=None):
    """the movement drawing the app gives this exercise, or None ("none" in the rules means no drawing on purpose)"""
    for pid, rx, crx in rules or figure_rules():
        if rx.search(name) and (not crx or crx.search(category or '')):
            return None if pid == 'none' else pid
    return None
