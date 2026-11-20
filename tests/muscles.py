"""3.4.0 muscles worked: the body figure is 26 muscles (every one has a shape, front or back), each exercise with a guide shows its
muscles on it in one colour (primary strong, secondary light, untouched neutral) with a legend, its equipment (Push-Ups: bodyweight),
where the values come from, and "I've checked these" kept on the phone over the built-in data. The sets-per-muscle map still works
(13 groups, now naming the muscle you tap). The colours stand out in every theme. tools/validate_guides.py passes."""
import json, os, re, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page

c = Checks('muscles')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import guides_data as G
GUIDES = G.read_guides()
SAMPLES = ['Bench Press', 'Squat', 'Romanian Deadlift (RDL)', 'Lat Pulldown', 'Seated Cable Row', 'Push-Ups']   # openGym's Push-Up shows as Push-Ups in the app
LUM = '''(css) => { const m = css.match(/[\\d.]+/g).map(Number).slice(0, 3); const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); };
  return .2126 * f(m[0]) + .7152 * f(m[1]) + .0722 * f(m[2]); }'''
CR = lambda a, b: (max(a, b) + .05) / (min(a, b) + .05)

# ---- the data and the validator
c.ok(all(n in GUIDES for n in SAMPLES), 'exercise-guides.js has the six samples')
r = subprocess.run([sys.executable, os.path.join(ROOT, 'tools', 'validate_guides.py')], capture_output=True, text=True)
c.eq(r.returncode, 0, 'tools/validate_guides.py finds no errors (%s)' % r.stdout[-300:])
c.ok(re.search(r'Built-in exercises: \d{4}', r.stdout) and 'Coverage' in r.stdout and 'Missing a guide' in r.stdout, 'it reports the count, coverage and the gaps')
c.ok(all(g['reviewed'] is False for g in GUIDES.values()), 'nothing is marked reviewed in the built-in file')
for n in SAMPLES:
    g = GUIDES[n]
    if g['muscle_source']['type'] == 'study':
        c.ok(g['muscle_source']['refs'] and all(re.search(r'\d{4}', x) for x in g['muscle_source']['refs']), '%s: "study" values cite dated studies' % n)

with page() as p:
    p.wait_for_function('typeof EXERCISE_GUIDES !== "undefined"')
    info = p.evaluate('''() => { const ids = PT.MUSCLES.map(m => m[0]); const box = document.createElement("div"); box.innerHTML = app.muscleMapSvg({}, { fine: Object.fromEntries(ids.map(i => [i, 50])) });
        const shapes = [...box.querySelectorAll("[data-m]")]; return { ids, n: ids.length, have: [...new Set(shapes.map(e => e.dataset.m))], shapes: shapes.length,
          unlabeled: ids.filter(i => !PT.muscleLabel(i)) }; }''')
    c.eq(info['n'], 26, '26 muscle ids')
    c.eq(sorted(info['ids']), sorted(G.MUSCLES), 'the app and tools/guides_data.py use the same 26 ids')
    c.eq(sorted(set(info['ids']) - set(info['have'])), [], 'every muscle id has a shape on the figure')
    c.eq(sorted(set(info['have']) - set(info['ids'])), [], 'no shape has an unknown id')
    c.eq(info['unlabeled'], [], 'every muscle has a name')
    names = p.evaluate('() => EXERCISE_DATABASE.map(e => e.name)')
    p.wait_for_function('() => EXERCISE_DATABASE.length > 3000', timeout=20000)
    names = set(p.evaluate('() => EXERCISE_DATABASE.map(e => e.name)'))
    c.eq([n for n in GUIDES if n not in names], [], 'every guide is for an exact exercise name in the app')

    # ---- the sets map still works: 13 groups, colours from sets, taps name the muscle
    p.evaluate('''() => { const t0 = Date.now(); for (let i = 1; i <= 3; i++) { const d = new Date(t0 - i * 86400000); app.sessions.push({ id: "m" + i, v: 1, date: PT.ds(d), ts: d.getTime(), pid: "x", ptitle: "P", day: 1, dtitle: "Day", dur: 3600, unit: "lb",
        ex: [{ name: "Bench Press", sets: [{ w: 135, r: 8, t: "R" }, { w: 135, r: 8, t: "R" }, { w: 135, r: 8, t: "R" }] }, { name: "Lateral Raises", sets: [{ w: 20, r: 12, t: "R" }, { w: 20, r: 12, t: "R" }] }], vol: 3000, sets: 5, prs: [], upd: d.getTime() }); }
        app.sessions.sort((a, b) => a.ts - b.ts); app.saveSessions(); app.rebuildPRs(); }''')
    p.evaluate('() => { app._progTab = "muscles"; app.progressWeekMode = "this"; app.showView("progress"); }'); p.wait_for_timeout(400)
    p.evaluate('() => document.querySelectorAll("#progress-body details").forEach(d => d.open = true)'); p.wait_for_timeout(300)
    mp = p.evaluate('''() => { const svg = [...document.querySelectorAll("#progress-body svg")].find(s => /sets per muscle/.test(s.getAttribute("aria-label") || "")); if (!svg) return null;
        const r = [...svg.querySelectorAll(".mm-r")]; return { regions: [...new Set(r.map(e => e.dataset.r))].sort(), fills: Object.fromEntries(r.map(e => [e.dataset.r, e.getAttribute("fill")])), muscles: new Set(r.map(e => e.dataset.m)).size }; }''')
    c.ok(mp is not None, 'Progress > Muscles still draws the sets map')
    if mp:
        c.eq(mp['regions'], sorted(['chest', 'shoulders', 'biceps', 'triceps', 'forearms', 'abs', 'back', 'lowerback', 'traps', 'glutes', 'quads', 'hamstrings', 'calves']), 'it still counts the same 13 groups')
        c.ok(mp['fills']['chest'] != mp['fills']['calves'], 'trained groups are coloured differently from untrained ones')
        c.ok(mp['muscles'] >= 25, 'its shapes carry the finer muscle ids (%d)' % mp['muscles'])
        p.evaluate('''() => { const svg = [...document.querySelectorAll("#progress-body svg")].find(s => /sets per muscle/.test(s.getAttribute("aria-label") || "")); svg.querySelector('[data-m="front_delts"]').dispatchEvent(new MouseEvent("click", { bubbles: true })); }''')
        p.wait_for_timeout(150)
        tip = p.evaluate('() => document.body.innerText')
        c.ok(re.search(r'Front delts \(counted in Shoulders\) · \d+(\.\d)? sets?', tip), 'tapping a shape names the muscle and the group its sets count in')

    # ---- each sample's sheet
    want_eq = {'Push-Ups': 'Bodyweight, no equipment needed', 'Seated Cable Row': 'Cable row machine, V-bar attachment · seated, feet on the platform'}
    for n in SAMPLES:
        p.evaluate('(n) => { app.closeSheet && app.closeSheet(); app.openExerciseSheet(n); }', n); p.wait_for_timeout(250)
        s = p.evaluate('''() => { const d = document.getElementById("ex-muscles"); if (!d) return null; const fig = d.querySelector("svg");
            const fill = id => { const e = fig.querySelector('[data-m="' + id + '"]'); return e ? e.getAttribute("fill") : null; };
            return { open: d.open, text: d.innerText, ids: PT.MUSCLES.map(m => m[0]), fills: Object.fromEntries(PT.MUSCLES.map(m => [m[0], fill(m[0])])), legend: !!d.querySelector(".pt-mw-leg .pt-mw-bar"),
              prim: [...d.querySelectorAll(".pt-mw-g")][0].innerText }; }''')
        c.ok(s and s['open'], '%s: Muscles worked shows, open' % n)
        if not s: continue
        g = GUIDES[n]
        eqt = want_eq.get(n)
        if eqt: c.ok('Equipment: ' + eqt in s['text'], '%s: equipment says "%s"' % (n, eqt))
        else: c.ok('Equipment: ' in s['text'], '%s: shows its equipment' % n)
        c.ok(s['legend'] and 'Not worked' in s['text'] and 'Works hardest' in s['text'], '%s: has the legend' % n)
        prim = [m for m in g['muscles'] if m['role'] == 'primary']; sec = [m for m in g['muscles'] if m['role'] != 'primary']
        lum = {k: p.evaluate(LUM, v) for k, v in s['fills'].items() if v}
        worked = {m['muscle_id'] for m in g['muscles']}
        neutral = [lum[k] for k in s['ids'] if k not in worked and k in lum]
        c.ok(len(set(round(x, 6) for x in neutral)) == 1, '%s: muscles it doesn\'t work are all one neutral colour' % n)
        c.ok(all(lum[m['muscle_id']] > neutral[0] for m in g['muscles']), '%s: every worked muscle stands out from neutral' % n)
        c.ok(min(lum[m['muscle_id']] for m in prim) >= max([lum[m['muscle_id']] for m in sec] or [0]), '%s: primary muscles are stronger than secondary ones' % n)
        c.ok(all(PT_label in s['prim'] for PT_label in [p.evaluate('(i) => PT.muscleLabel(i)', m['muscle_id']) for m in prim]), '%s: lists its main muscles' % n)
        if g['muscle_source']['type'] == 'study':
            c.ok(re.search(r'From \d EMG stud', s['text']), '%s: says its values come from studies' % n)
        if any(m.get('source') == 'estimate' for m in g['muscles']):
            c.ok('est.' in s['text'], '%s: marks the estimated muscles' % n)
        c.ok("I've checked these muscles" in s['text'], '%s: has "I\'ve checked these"' % n)
    c.ok(p.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'no sideways scroll')

    # ---- an exercise with no guide: 3.12.0 shows the estimate from how the movement works (tests/allmuscles.py checks every exercise)
    p.evaluate('() => { app.closeSheet(); app.openExerciseSheet("Incline Bench Press"); }'); p.wait_for_timeout(250)
    t = p.evaluate('document.getElementById("ex-muscles").textContent')
    c.ok('Not added yet' not in t and 'Upper chest' in t and 'Estimated from how the movement works' in t, 'an exercise without a guide shows the estimated muscles and says they are an estimate')
    c.ok(p.evaluate('!!document.querySelector("#ex-muscles svg")'), 'with the figure')

    # ---- checked on this phone, laid over the built-in data
    p.evaluate('() => { app.closeSheet(); app.openExerciseSheet("Bench Press"); }'); p.wait_for_timeout(250)
    p.check('#pt-mw-rev'); p.wait_for_timeout(100)
    c.ok(p.evaluate('app.settings.exGuideLocal["Bench Press"].reviewed === true'), 'ticking it saves "checked" on the phone')
    c.ok(p.evaluate('EXERCISE_GUIDES["Bench Press"].reviewed === false'), 'the built-in data is not changed')
    p.reload(); p.wait_for_function('typeof EXERCISE_GUIDES !== "undefined" && window.app && app.data')
    c.ok(p.evaluate('PT.exGuide("Bench Press").reviewed === true'), 'after a reload (or an update) it is still checked')
    p.evaluate('() => app.openExerciseSheet("Bench Press")'); p.wait_for_timeout(250)
    c.ok(p.evaluate('document.getElementById("pt-mw-rev").checked') and re.search(r'\(\w{3} \d+, \d{4}\)', p.evaluate('document.querySelector(".pt-mw-chk").innerText')), 'the box shows checked, with the date')
    p.uncheck('#pt-mw-rev'); p.wait_for_timeout(100)
    c.ok(p.evaluate('!(app.settings.exGuideLocal || {})["Bench Press"]'), 'unticking removes it')

    # ---- offline: once the app is saved, the guides load with no connection (sw.js keeps the small file)
    p.reload(); p.wait_for_function('!!navigator.serviceWorker.controller', timeout=15000); p.wait_for_timeout(800)
    p.context.set_offline(True)
    p.reload(); p.wait_for_function('window.app && app.data', timeout=20000); p.wait_for_timeout(500)
    c.ok(p.evaluate('typeof EXERCISE_GUIDES === "object" && !!EXERCISE_GUIDES["Bench Press"]'), 'offline, the guides still load')
    p.evaluate('() => app.openExerciseSheet("Squat")'); p.wait_for_timeout(250)
    c.ok(p.evaluate('!!document.querySelector("#ex-muscles svg")'), 'offline, an exercise sheet still shows its muscles')
    p.context.set_offline(False)
    p.evaluate('() => { app.closeSheet(); app.openExerciseSheet("Bench Press"); }'); p.wait_for_timeout(250)

    # ---- the design rules hold on the sheet
    aud = p.evaluate(open(os.path.join(ROOT, 'tests', 'fixtures', 'design_audit.js'), encoding='utf-8').read())
    bad = {k: aud['samples'][k][:3] for k, v in aud['counts'].items() if v}
    c.eq(bad, {}, 'the sheet passes the design audit')

    # ---- every theme: the strong end stands out, primary vs secondary can be told apart
    worst = p.evaluate('''() => { const L = c => { const m = c.match(/[\\d.]+/g).map(Number).slice(0, 3); const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(m[0]) + .7152 * f(m[1]) + .0722 * f(m[2]); };
        const cr = (a, b) => (Math.max(a, b) + .05) / (Math.min(a, b) + .05); let w = { strong: 99, light: 99, gap: 99 }, who = {};
        PT.look.PRESETS.forEach(t => { PT.look.apply(t.id); const n = L(PT.muscleFill(0)), s = L(PT.muscleFill(95)), l = L(PT.muscleFill(40));
          const v = { strong: cr(s, n), light: cr(l, n), gap: cr(s, l) }; Object.keys(v).forEach(k => { if (v[k] < w[k]) { w[k] = v[k]; who[k] = t.id; } }); });
        return { w, who, n: PT.look.PRESETS.length }; }''')
    c.ok(worst['w']['strong'] >= 3, 'in all %d themes the strongest shade stands out from neutral (worst %.2f, %s)' % (worst['n'], worst['w']['strong'], worst['who']['strong']))
    c.ok(worst['w']['light'] >= 1.5, 'a helping muscle (40) still shows against neutral (worst %.2f, %s)' % (worst['w']['light'], worst['who']['light']))
    c.ok(worst['w']['gap'] >= 1.5, 'primary (95) and secondary (40) can be told apart (worst %.2f, %s)' % (worst['w']['gap'], worst['who']['gap']))
    c.eq(p.errors, [], 'no errors')

sys.exit(c.done())
