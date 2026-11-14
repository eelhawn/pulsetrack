"""2.98.0 import from Hevy, Strong and FitNotes: each export is recognised, workouts / sets / tags / cardio / units come across, names are
matched to PulseTrack's, records and last-time weights are worked out again, a second import adds nothing, and the Settings flow works."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page

c = Checks('importapps')
FX = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fixtures')
SHOTS = '/tmp/claude-0/-home-claude/395da5c4-9b49-54b4-93e4-f9926c59aa1c/scratchpad/'
txt = lambda n: open(os.path.join(FX, n), encoding='utf-8').read()

with page() as p:
    # ------------------------------------------------ reading the three files
    r = p.evaluate('(t) => { const r = PT.importApps.read(t); return [r.app, r.unit, r.workouts.length, r.workouts.map(w => [w.title, w.ex.map(e => e.name + ":" + e.sets.map(s => s.t + (s.cardio ? "c" : "")).join("")).join("/"), w.dur])]; }', txt('hevy.csv'))
    c.eq(r[:3], ['Hevy', 'kg', 2], 'Hevy: recognised, weights in kg, 2 workouts')
    c.eq(r[3][0], ['Push Day', 'Bench Press (Barbell):WRF/Triceps Rope Pushdown:D/Treadmill:Rc', 3300], 'Hevy: warm-up, failure and drop sets keep their tags; the treadmill is cardio; 55 minutes')
    c.eq(r[3][1][0], 'Legs, heavy', 'Hevy: a title with a comma in quotes is read whole')
    r = p.evaluate('(t) => { const r = PT.importApps.read(t); return [r.app, r.unit, r.workouts.length, r.workouts.map(w => [w.title, w.ex.map(e => e.name + ":" + e.sets.map(s => s.t + (s.cardio ? "c" : "")).join("")).join("/"), w.dur])]; }', txt('strong.csv'))
    c.eq(r[:3], ['Strong', None, 2], 'Strong: recognised (semicolons), the file does not say the unit, 2 workouts')
    c.eq(r[3][0], ['Morning Pull', 'Deadlift (Barbell):WRR/Pull Up:R/Plank:Rc', 3900], 'Strong: W = warm-up, the plank (seconds only) is a timed set, "1h 5m" = 65 minutes')
    c.eq(r[3][1][0], 'Arms; quick', 'Strong: a quoted name with a semicolon')
    r = p.evaluate('(t) => { const r = PT.importApps.read(t); return [r.app, r.unit, r.workouts.length, r.workouts.map(w => w.ex.map(e => e.name + ":" + e.sets.length).join("/"))]; }', txt('fitnotes.csv'))
    c.eq(r, ['FitNotes', 'lb', 2, ['Flat Barbell Bench Press:2/Cable Crunch:1/Running (Treadmill):1', 'Deadlift:1']], 'FitNotes: recognised, lb, one workout per date')
    c.eq(p.evaluate('() => PT.importApps.read("a,b,c\\n1,2,3").app'), None, 'some other CSV is not mistaken for one of them')
    c.eq(p.evaluate('() => ["1h 5m", "45m", "0:28:00", "90", "1:30"].map(PT.importApps.secs)'), [3900, 2700, 1680, 90, 90], 'durations in all their spellings')

    # ------------------------------------------------ into History (app in lb)
    p.evaluate('() => { app.settings.unit = "lb"; app.sessions = []; app.prs = {}; app.lastPerf = {}; }')
    s = p.evaluate('(t) => { const r = PT.importApps.read(t); const s = PT.importApps.toSessions(r, "kg"); return s; }', txt('hevy.csv'))
    bench = [e for e in s[0]['ex'] if e['name'] == 'Bench Press']
    c.eq(len(bench), 1, 'Hevy "Bench Press (Barbell)" becomes PulseTrack\'s Bench Press')
    c.eq([x['w'] for x in bench[0]['sets']], [88.18, 220.46, 220.46], '100 kg comes in as 220.46 lb')
    tm = [e for e in s[0]['ex'] if e.get('k') == 'c'][0]
    c.eq([tm['sets'][0]['min'], tm['sets'][0]['dist']], [15, 1.55], 'the treadmill: 15 minutes, 2.5 km = 1.55 mi')
    c.eq([s[0]['date'], s[0]['pid'], s[0]['ptitle'], s[0]['dtitle']], ['2024-03-15', 'import', 'Hevy', 'Push Day'], 'dated by the workout, filed as imported from Hevy')
    c.ok(any(e['name'] == 'Zercher Squat Made Up Name' for e in s[1]['ex']), 'a name PulseTrack doesn\'t know keeps its own name')
    out = p.evaluate('(t) => { const r = PT.importApps.read(t); return PT.importApps.save(PT.importApps.toSessions(r, "kg")); }', txt('hevy.csv'))
    c.eq(out, {'added': 2, 'skipped': 0}, 'saved: 2 workouts')
    c.ok(p.evaluate('() => (app.prs["Bench Press"] || 0) > 220'), 'records are worked out again (Bench Press e1RM)')
    c.eq(p.evaluate('() => (app.lastPerf["Bench Press"] || []).length'), 3, 'last-time weights come from the newest imported workout')
    out = p.evaluate('(t) => { const r = PT.importApps.read(t); return PT.importApps.save(PT.importApps.toSessions(r, "kg")); }', txt('hevy.csv'))
    c.eq(out, {'added': 0, 'skipped': 2}, 'importing the same file again adds nothing')
    c.eq(p.evaluate('() => app.sessions.length'), 2, 'still 2 workouts in History')
    c.eq(p.errors, [], 'no page errors')

for w in (390, 360):
    with page(w=w, h=800) as p:
        p.evaluate('() => { app.settings.unit = "kg"; app.sessions = []; app.saveSessions(); app.openSettings(); }')
        p.wait_for_timeout(250)
        c.ok(p.evaluate('() => !!document.getElementById("btn-import-apps")'), '%dpx: Settings → Data & Backup has the import button' % w)
        p.set_input_files('#input-import-apps', os.path.join(FX, 'strong.csv'))
        p.wait_for_selector('#pt-imp-sum', timeout=5000)
        sm = p.evaluate('() => document.getElementById("pt-imp-sum").innerText')
        c.ok('2 workouts' in sm and '6 sets' in sm, '%dpx: the preview counts 2 workouts and 6 sets (%s)' % (w, sm.splitlines()[0]))
        c.ok(p.evaluate('() => /doesn.t say/.test(document.getElementById("pt-impapp").innerText)'), '%dpx: it says the file does not give the unit' % w)
        c.eq(p.evaluate('() => document.querySelector("#pt-imp-unit [aria-pressed=true]").dataset.u'), 'kg', '%dpx: and starts with your unit' % w)
        p.click('#pt-imp-unit [data-u="lb"]')
        c.eq(p.evaluate('() => document.querySelector("#pt-imp-unit [aria-pressed=true]").dataset.u'), 'lb', '%dpx: you can say it is pounds' % w)
        c.ok(p.evaluate('() => document.documentElement.scrollWidth <= innerWidth + 1'), '%dpx: no sideways scroll' % w)
        if w == 390: p.screenshot(path=SHOTS + 'import390.png')
        p.click('#pt-imp-go'); p.wait_for_timeout(300)
        c.eq(p.evaluate('() => app.sessions.length'), 2, '%dpx: Import saves the 2 workouts' % w)
        c.eq(p.evaluate('() => app.sessions[0].ex.find(e => /deadlift/i.test(e.name)).sets[1].w'), 142.88, '%dpx: 315 lb is saved as 142.88 kg' % w)
        c.eq(p.evaluate('() => app.sessions[0].ex.find(e => /deadlift/i.test(e.name)).name'), 'Deadlift', '%dpx: "Deadlift (Barbell)" is PulseTrack\'s Deadlift' % w)
        # again: all already there
        p.set_input_files('#input-import-apps', os.path.join(FX, 'strong.csv'))
        p.wait_for_selector('#pt-imp-sum', timeout=5000); p.wait_for_timeout(100)
        c.ok(p.evaluate('() => /All of these are already in your History/.test(document.getElementById("pt-imp-sum").innerText) && document.getElementById("pt-imp-go").disabled'), '%dpx: a second time it says they are all there and Import is off' % w)
        c.eq(p.errors, [], '%dpx: no page errors' % w)

c.done()
