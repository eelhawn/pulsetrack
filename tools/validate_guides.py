#!/usr/bin/env python3
"""Checks exercise-guides.js against every built-in exercise and prints a coverage report.

    python3 tools/validate_guides.py           the report, with the first 15 names of each gap
    python3 tools/validate_guides.py --full    every name

Every built-in exercise the app shows (exercises.js + opengym-exercises.js, less the openGym entries that are another spelling of a
PulseTrack exercise, which the app merges into it) is checked for: a guide entry, at least one step, an equipment entry,
at least one primary muscle, muscle ids from the list of 26, intensities from 0 to 100, and an image file that exists for every step
image (with its licence and author). Muscle values are listed as "study" only when the entry cites studies; a muscle marked
"estimate" (or an entry with no study) is listed under estimates. Nothing is "reviewed" until a person marks it on their phone.

Gaps (exercises without guides yet) are reported, not failures. Mistakes in what is there (an unknown muscle id, an intensity of 120,
a picture file that is missing, a guide for a name that isn't an exercise) make it exit with status 1.
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import guides_data as G

LICENSES = {'original', 'own-photo', 'public-domain', 'CC0-1.0', 'CC-BY-4.0', 'CC-BY-SA-4.0', 'CC-BY-3.0', 'CC-BY-SA-3.0'}


def main(full=False):
    entries = G.exercise_names()
    names, merged = G.app_names()
    guides = G.read_guides()
    ids = set(G.MUSCLES)
    print('Built-in exercises: %d entries in exercises.js + opengym-exercises.js' % len(entries))
    print('  The app shows %d of them: %d openGym entries are another spelling of a PulseTrack exercise and show under its name' % (len(names), len(merged)))
    print('  (for example %s). Coverage below is of the %d the app shows.' % (', '.join('%s -> %s' % kv for kv in list(merged.items())[:2]), len(names)))
    print('Guide entries: %d\n' % len(guides))

    gap = {k: [] for k in ('no guide', 'no steps', 'no equipment', 'no primary muscle', 'steps without a picture')}
    errors, est, study = [], [], []
    for n in names:
        g = guides.get(n)
        if not g:
            for k in ('no guide', 'no steps', 'no equipment', 'no primary muscle'): gap[k].append(n)
            continue
        steps = g.get('steps') or []
        if not steps: gap['no steps'].append(n)
        eq = g.get('equipment') or {}
        if not (isinstance(eq.get('items'), list) and eq['items'] and all(isinstance(x, str) and x.strip() for x in eq['items'])): gap['no equipment'].append(n)
        ms = g.get('muscles') or []
        if not any(x.get('role') == 'primary' for x in ms): gap['no primary muscle'].append(n)
        for x in ms:
            if x.get('muscle_id') not in ids: errors.append('%s: unknown muscle id %r' % (n, x.get('muscle_id')))
            v = x.get('intensity')
            if not isinstance(v, (int, float)) or isinstance(v, bool) or not 0 <= v <= 100: errors.append('%s: %s intensity %r is not 0-100' % (n, x.get('muscle_id'), v))
            if x.get('role') not in ('primary', 'secondary'): errors.append('%s: %s role %r is not primary or secondary' % (n, x.get('muscle_id'), x.get('role')))
        if len({x.get('muscle_id') for x in ms}) != len(ms): errors.append('%s: a muscle is listed twice' % n)
        src = g.get('muscle_source') or {}
        if src.get('type') == 'study':
            if not src.get('refs'): errors.append('%s: says "study" but cites none' % n)
            study.append(n)
            if any(x.get('source') == 'estimate' for x in ms): est.append(n + ' (some muscles)')
        elif ms:
            est.append(n)
        if 'reviewed' not in g: errors.append('%s: no reviewed flag' % n)
        elif g['reviewed'] is not False: errors.append('%s: reviewed is set in the file; only a person on their phone marks it' % n)
        for i, st in enumerate(steps, 1):
            if not (st.get('text') or '').strip(): errors.append('%s: step %d has no text' % (n, i))
            img = st.get('image')
            if not img or not img.get('src'):
                gap['steps without a picture'].append('%s (step %d)' % (n, i)); continue
            if img.get('license') not in LICENSES: errors.append('%s: step %d picture licence %r is not one of %s' % (n, i, img.get('license'), ', '.join(sorted(LICENSES))))
            if not (img.get('author') or '').strip(): errors.append('%s: step %d picture has no author' % (n, i))
            if img['src'].startswith('photo:'): continue   # a photo on someone's phone, never in the repo
            if not os.path.isfile(os.path.join(G.ROOT, img['src'])): errors.append('%s: step %d picture file %s is missing' % (n, i, img['src']))
            for a in st.get('arrows') or []:
                pts = [a.get('from'), a.get('to')]
                if not all(isinstance(p, list) and len(p) == 2 and all(isinstance(c, (int, float)) and 0 <= c <= 1 for c in p) for p in pts):
                    errors.append('%s: step %d arrow %r needs from/to as [x, y] between 0 and 1' % (n, i, a))
    known = set(names)
    for n in guides:
        if n in merged: errors.append('guide for %r, which the app shows as %r: put the guide on %r' % (n, merged[n], merged[n]))
        elif n not in known: errors.append('guide for %r, which is not a built-in exercise name' % n)

    total = len(names)
    print('Coverage')
    for k in ('no guide', 'no steps', 'no equipment', 'no primary muscle'):
        have = total - len(gap[k])
        print('  %-26s %5d of %d (%.1f%%)' % ({'no guide': 'have a guide', 'no steps': 'have steps', 'no equipment': 'have equipment',
                                               'no primary muscle': 'have a primary muscle'}[k] + ':', have, total, 100.0 * have / total))
    print('  %-26s %5d' % ('steps with no picture yet:', len(gap['steps without a picture'])))
    print('  %-26s %5d' % ('muscles from studies:', len(study)))
    print('  %-26s %5d' % ('with estimated muscles:', len(est)))
    print('  %-26s %5d (nothing is marked reviewed in the file; people mark it on their phone)' % ('reviewed:', 0))

    def show(title, items):
        if not items: return
        print('\n%s (%d)' % (title, len(items)))
        for x in (items if full else items[:15]): print('  - ' + x)
        if not full and len(items) > 15: print('  ... and %d more (--full lists them all)' % (len(items) - 15))
    show('Missing a guide', gap['no guide'])
    show('Missing steps', [x for x in gap['no steps'] if x in guides])
    show('Missing equipment', [x for x in gap['no equipment'] if x in guides])
    show('Missing a primary muscle', [x for x in gap['no primary muscle'] if x in guides])
    show('Steps with a placeholder instead of a picture', gap['steps without a picture'])
    show('Estimated muscle values, to be reviewed', est)
    if errors:
        print('\nERRORS (%d)' % len(errors))
        for e in errors: print('  ! ' + e)
        return 1
    print('\nNo errors in the guide data.')
    return 0


if __name__ == '__main__':
    sys.exit(main('--full' in sys.argv))
