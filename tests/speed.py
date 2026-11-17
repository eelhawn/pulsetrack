"""2.106.0 speed-ups: remembered answers about an exercise are dropped when they could change (your own exercise edited, the openGym
library arriving, settings restored, the accent colour changed), and the Progress page and Home draw well within a time budget."""
import os, sys, statistics
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page

c = Checks('speed')
ID = 'my_6day_chest_back_legs_sharms'

with page() as p:
    # your own exercise: kind changes are seen at once
    c.eq(p.evaluate('() => [PT.isBodyweightEx("Zed Lift"), PT.category("Zed Lift")]'), [False, p.evaluate('() => PT.category("Zed Lift")')], 'set up: an unknown name')
    p.evaluate('''() => { app.settings.customEx = [{ name: "Zed Lift", m: "chest", k: "b" }]; WorkoutStorage.saveSettings(app.settings); app.reloadCustomExercises ? app.reloadCustomExercises() : null; }''')
    p.reload(); p.wait_for_function('window.app && app.data && app.data.programs.length')
    c.eq(p.evaluate('() => [PT.isBodyweightEx("Zed Lift"), PT.category("Zed Lift")]'), [True, 'Chest'], 'your own exercise: bodyweight, Chest')
    p.evaluate('''() => { app.settings.customEx = [{ name: "Zed Lift", m: "back", k: "d" }]; }''')   # settings swapped in (like a restore), not yet saved
    p.reload(); p.wait_for_function('window.app && app.data && app.data.programs.length')
    c.eq(p.evaluate('() => PT.isBodyweightEx("Zed Lift")'), True, 'set up: unsaved changes are not kept over a reload')
    k1 = p.evaluate('() => PT.isBodyweightEx("Zed Lift")')
    p.evaluate('''() => { app.settings.customEx = [{ name: "Zed Lift", m: "back", k: "d" }]; WorkoutStorage.saveSettings(app.settings); }''')
    p.reload(); p.wait_for_function('window.app && app.data && app.data.programs.length')
    c.eq([k1, p.evaluate('() => PT.isBodyweightEx("Zed Lift")'), p.evaluate('() => PT.category("Zed Lift")')], [True, False, 'Back'], 'changing its kind and muscle is seen straight away')
    # the openGym library arriving changes what an openGym name is
    name = p.evaluate('async () => { await PT.og.load(); return PT.og.list().find(e => e.eq === "kettlebell" && !EXERCISE_DATABASE.some(x => x.name === e.name && !x.og)).name; }')
    c.eq(p.evaluate('(n) => PT.equipKey(n)', name), 'kettlebell', 'an openGym exercise is known by its equipment once the library is in')
    # the same question asked again gives the same answer, from memory
    c.eq(p.evaluate('() => { const a = []; for (let i = 0; i < 3; i++) a.push(PT.isBwMove("Push-ups"), PT.equipKey("Push-ups")); return [...new Set(a.map(String))].length; }'), 2, 'answers are stable')
    # the accent colour follows the settings
    a1 = p.evaluate('() => PT.accent()')
    p.evaluate('() => { app.settings.accent = "custom"; app.settings.accentHex = "#ff0000"; WorkoutStorage.saveSettings(app.settings); app.applyTheme(); }')
    a2 = p.evaluate('() => PT.accent()')
    c.ok(a1 != a2 and a2.startswith('rgb('), 'the chart colour follows a new accent colour (%s, then %s)' % (a1, a2))
    c.eq(p.errors, [], 'no page errors')

# a time budget: 300 workouts, the slowest screens
SEED = '''() => { const pr = app.data.programs.find(x => x.id === "%s"); app.selectProgram(pr, null, true);
  const names = pr.days.slice(0, 7).flatMap(d => d.exercises.map(e => e.name));
  for (let i = 0; i < 300; i++) { const t = Date.now() - i * 86400000 * 1.3; app.sessions.push({ id: "s" + i, v: 1, date: PT.ds(new Date(t)), ts: t, pid: pr.id, day: 1, dtitle: "Day", unit: "lb",
    ex: names.slice((i * 3) %% 40, (i * 3) %% 40 + 8).map((n, k) => ({ name: n, sets: [{ w: 100 + k * 5, r: 8, t: "R" }, { w: 105, r: 7, t: "R" }, { w: 110, r: 6, t: "R" }] })), vol: 9000, sets: 24, prs: [] }); }
  app.sessions.sort((a, b) => a.ts - b.ts); app.rebuildPRs(); }''' % ID
with page() as p:
    p.evaluate(SEED)
    t = {}
    for k, js in [('home', 'app.showView("home"); app.renderHomeView()'), ('progress', 'app._progTab = "overview"; app.showView("progress")'), ('strength', 'app._progTab = "strength"; app.renderProgressView()')]:
        p.evaluate('() => { %s; }' % js)
        t[k] = statistics.median([p.evaluate('() => { const t0 = performance.now(); %s; return performance.now() - t0; }' % js) for _ in range(3)])
    c.ok(t['progress'] < 250 and t['strength'] < 200 and t['home'] < 150, 'with 300 workouts: Progress %d ms, Strength %d ms, Home %d ms (before 2.106.0 about 2-3x that)' % (t['progress'], t['strength'], t['home']))
    c.eq(p.errors, [], 'no page errors')

c.done()
