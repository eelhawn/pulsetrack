"""2.96.0 / 2.100.0 openGym exercise library: only useful exercises are shipped (about 2,900), they load in the background and then sit in
their muscle group like PulseTrack's own (no separate chip), with Similar exercises, a description and steps under Form tips; PulseTrack's
own exercises win; your own exercises stay last; the big list still opens fast; the licence is shipped."""
import json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page

c = Checks('opengym')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHOTS = '/tmp/claude-0/-home-claude/395da5c4-9b49-54b4-93e4-f9926c59aa1c/scratchpad/'
ID = 'my_6day_chest_back_legs_sharms'

# ---------------------------------------------------------------- the file and the licence
src = open(os.path.join(ROOT, 'opengym-exercises.js'), encoding='utf-8').read()
L = json.loads(src[src.index('['):src.rindex(']') + 1])
c.ok(2500 < len(L) < 3500, 'the file has the useful part of the library (%d exercises)' % len(L))
c.eq(len({e['og'] for e in L}), len(L), 'one entry per openGym id')
c.eq(len({e['name'].lower() for e in L}), len(L), 'no name twice')
c.ok(all(e.get('desc') and e.get('tips') and e.get('muscle') and e.get('category') and e.get('eq') for e in L), 'every entry has a description, steps, muscle, category and equipment')
own = open(os.path.join(ROOT, 'exercises.js'), encoding='utf-8').read()
cats = set(re.findall(r'category: "([^"]+)"', own))
c.eq(sorted({e['category'] for e in L} - cats), [], 'every one is filed in one of PulseTrack\'s muscle groups (no "Full Body", no "openGym")')
rare = [e['name'] for e in L if re.search(r'\bV\. ?\d|\bPOV\b|\((Left|Right)\)|Pose|Asana|Towel|Chair|Bottle|Sofa', e['name']) or len(e['name']) > 40 or e['eq'] in ('tire', 'macebell', 'sandbag', 'bosu ball', 'hammer', 'massage ball')]
c.eq(rare[:5], [], 'no rare ones: yoga poses, drawing variants, left/right copies, household props, odd kit, over-long names')
c.ok(not re.search(r'\.(webp|mp4|gif|png|jpe?g)\b', src), 'no pictures or animations are referenced')
names = {m.lower() for m in re.findall(r'^\s*\{ name: "([^"]+)"', own, re.M)}
c.eq([e['name'] for e in L if e['name'].lower() in names], [], 'none of PulseTrack\'s own exercises is in it twice')
c.ok('GNU AFFERO GENERAL PUBLIC LICENSE' in open(os.path.join(ROOT, 'LICENSE')).read(), 'the AGPL licence is in the repo')
notice = open(os.path.join(ROOT, 'NOTICE.md'), encoding='utf-8').read()
c.ok('openGym' in notice and 'ExerciseDB' in notice and 'Gym visual' in notice, 'NOTICE.md credits openGym and ExerciseDB and says the media are not included')
c.ok("'./opengym-exercises.js'" in open(os.path.join(ROOT, 'sw.js')).read(), 'the service worker saves it for offline')

# ---------------------------------------------------------------- in the app
for w in (390, 360):
    with page(w=w, h=800) as p:
        c.eq(p.evaluate('() => typeof OPENGYM_EXERCISES'), 'undefined', '%dpx: not loaded at start-up (the app opens as fast as before)' % w)
        n0 = p.evaluate('() => EXERCISE_DATABASE.length')
        p.evaluate('() => EXERCISE_DATABASE.push({ name: "My Odd Lift", category: "Back", custom: true })')
        p.evaluate('() => PT.og.load()')
        p.wait_for_function('() => PT.og.list().length > 2500', timeout=15000)
        n1, merged = p.evaluate('() => [EXERCISE_DATABASE.length, PT.og.merged()]')
        c.ok(merged > 2500 and n1 == n0 + 1 + merged, '%dpx: the library joins your exercise list (%d added)' % (w, merged))
        c.eq(p.evaluate('() => EXERCISE_DATABASE[EXERCISE_DATABASE.length - 1].name'), 'My Odd Lift', '%dpx: your own exercises stay at the end' % w)
        c.eq(p.evaluate('() => EXERCISE_DATABASE.filter(e => e.og && !e.category).length'), 0, '%dpx: each one in a muscle group' % w)
        c.ok(p.evaluate('() => EXERCISE_DATABASE.filter(e => e.og).length') < len(L), '%dpx: ones PulseTrack already has under another spelling are not added twice' % w)
        p.evaluate(f'() => {{ const pr = app.data.programs.find(x => x.id === "{ID}"); app.selectProgram(pr, null, true); app.activeProgram = pr; app.activeDay = pr.days[0]; app.showView("workout"); }}')
        ms = p.evaluate('() => { const t0 = performance.now(); app.openExerciseSelector("add"); return performance.now() - t0; }')
        c.ok(ms < 400, '%dpx: the picker with %d exercises opens quickly (%d ms here)' % (w, n1, ms))
        chips = p.evaluate('() => [...document.querySelectorAll("#ex-chips .ex-chip")].map(b => b.dataset.cat)')
        c.ok('openGym' not in chips and 'Full Body' not in chips, '%dpx: no openGym chip: the muscle groups only' % w)
        c.ok(p.evaluate('() => /Search 3,\\d{3} exercises/.test(document.getElementById("ex-search-input").placeholder)'), '%dpx: the search box counts them all' % w)
        p.wait_for_timeout(600)
        c.eq(p.evaluate('() => document.querySelectorAll("#ex-list-container button").length') >= n1 - 5, True, '%dpx: All lists every exercise (the rest drawn just after the first rows)' % w)
        p.evaluate('() => document.querySelector(\'#ex-chips [data-cat="Biceps"]\').click()'); p.wait_for_timeout(300)
        bic = p.evaluate('() => [...document.querySelectorAll("#ex-list-container button")].filter(b => b.querySelector("span span")).map(b => b.querySelector("span span").textContent.trim())')
        ogb = p.evaluate('(ns) => ns.filter(n => (EXERCISE_DATABASE.find(e => e.name === n) || {}).og).length', bic)
        c.ok(ogb > 100 and 'Hammer Curls' in bic, '%dpx: the Biceps group has PulseTrack\'s curls and %d from openGym together' % (w, ogb))
        c.ok(p.evaluate('() => document.documentElement.scrollWidth <= innerWidth + 1'), '%dpx: no sideways scroll' % w)
        if w == 390: p.screenshot(path=SHOTS + 'opengym390.png')
        # search and pick one
        p.fill('#ex-search-input', 'zercher'); p.wait_for_timeout(300)
        rows = p.evaluate('() => [...document.querySelectorAll("#ex-list-container button")].filter(b => b.querySelector("span span")).map(b => b.querySelector("span span").textContent.trim())')
        ogn = [n for n in rows if p.evaluate('(n) => !!(EXERCISE_DATABASE.find(e => e.name === n) || {}).og', n)]
        c.ok(len(ogn) >= 2, '%dpx: searching "zercher" finds openGym ones in the normal results (%d)' % (w, len(ogn)))
        name = ogn[0]
        before = p.evaluate('() => app.activeDay.exercises.length')
        p.evaluate('(n) => [...document.querySelectorAll("#ex-list-container button")].find(b => b.querySelector("span span") && b.querySelector("span span").textContent.trim() === n).click()', name)
        p.wait_for_timeout(300)
        c.eq(p.evaluate('() => app.activeDay.exercises.length'), before + 1, '%dpx: picking one adds it to the workout' % w)
        sim = p.evaluate('(n) => app.swapSuggestions(n, 8).map(s => s.name)', name)
        c.ok(len(sim) >= 4, '%dpx: it has Similar exercises (%s)' % (w, ', '.join(sim[:3])))
        c.eq(p.evaluate('(n) => PT.category(n)', name), p.evaluate('(n) => PT.og.get(n).category', name), '%dpx: the app files it under its muscle group' % w)
        cue = p.evaluate('(n) => { const h = PT.cuesHtml(n, true); const d = document.createElement("div"); d.innerHTML = h; return [d.querySelectorAll("li").length, d.textContent.includes("Avoid:"), PT.cueFor(n).desc === PT.og.get(n).desc]; }', name)
        c.eq(cue, [len(p.evaluate('(n) => PT.og.get(n).tips', name)), False, True], '%dpx: Form tips has its description and steps' % w)
        sim2 = p.evaluate('() => app.swapSuggestions("Barbell Curl", 12).map(s => s.name)')
        c.ok(len(sim2) >= 6, '%dpx: Similar exercises for PulseTrack\'s own still work' % w)
        c.eq(p.errors, [], '%dpx: no page errors' % w)

c.done()
