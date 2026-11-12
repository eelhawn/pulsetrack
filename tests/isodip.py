"""2.91.3: Machine Chest Dips became Iso-Lateral Plate-Loaded Machine Dip: the library, the plan, and the one-time rename of an old copy (programs, history, PRs, last-time weights)."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page

c = Checks('isodip')
OLD, NEW = 'Machine Chest Dips', 'Iso-Lateral Plate-Loaded Machine Dip'
ID = 'my_6day_chest_back_legs_sharms'
with page() as p:
    lib = p.evaluate('() => EXERCISE_DATABASE.filter(e => e.name === "%s" || e.name === "%s").map(e => [e.name, e.category, e.muscle])' % (OLD, NEW))
    c.eq(lib, [[NEW, 'Chest', 'Chest']], 'the library has the new name (Chest) and no old entry')
    c.ok(p.evaluate('() => { const e = EXERCISE_DATABASE.find(x => x.name === "%s"); return !!e.desc && e.tips.length >= 3; }' % NEW), 'with a description and form tips')
    c.eq([p.evaluate('(n) => PT.exCanon(n).name', n) for n in (OLD, 'Chest Dip Machine', 'Seated Chest Dip Machine')], [NEW] * 3, 'the old names still count as the same lift')
    c.eq(p.evaluate('() => PT.exCanon("Chest Dips").name'), 'Chest Dips', 'plain Chest Dips is a different exercise and stays')
    c.eq(p.evaluate('() => BUILTIN_PROGRAMS.flatMap(p => p.days.flatMap(d => d.exercises)).filter(e => e.name === "%s").length' % OLD), 0, 'no program ships with the old name')
    c.eq(p.evaluate('() => BUILTIN_PROGRAMS.find(p => p.id === "%s").days.filter(d => d.exercises.some(e => e.name === "%s")).map(d => d.dayNumber)' % (ID, NEW)), [4], 'My 6-Day Split Day 4 uses the new one')
    # an old copy: program days, a swapped copy, history, PRs, last-time weights, a saved day note
    p.evaluate('''() => {
      const pr = app.data.programs.find(x => x.id === "%s"), d = pr.days.find(x => x.dayNumber === 4);
      d.exercises.find(e => e.name === "%s").name = "%s";
      d.orig = JSON.parse(JSON.stringify(d.exercises));
      app.sessions.push({ id: "old1", date: PT.ds(), ts: Date.now() - 86400000, name: "Chest", ex: [{ name: "%s", sets: [{ weight: "90", reps: "10" }] }], vol: 900, sets: 1, unit: "lb", prs: ["%s"], dur: 3000 });
      app.lastPerf["%s"] = [{ weight: "90", reps: "10" }]; WorkoutStorage.saveLastPerf(app.lastPerf);
      delete app.settings.isoDip; WorkoutStorage.setData(app.data);
    }''' % (ID, NEW, OLD, OLD, OLD, OLD))
    c.eq(p.evaluate('() => PT.isoDip.run()'), 1, 'the clean-up finds the old name')
    c.eq(p.evaluate('() => { const d = app.data.programs.find(x => x.id === "%s").days.find(x => x.dayNumber === 4); return [d.exercises.map(e => e.name).includes("%s"), d.orig.map(e => e.name).includes("%s"), JSON.stringify(app.data).includes("%s")]; }' % (ID, NEW, NEW, OLD)), [True, True, False], 'the program (and its original copy) use the new name, no old name is left')
    c.eq(p.evaluate('() => app.sessions.find(s => s.id === "old1").ex[0].name'), NEW, 'saved workouts moved over')
    c.eq(p.evaluate('() => [JSON.stringify(app.sessions).includes("%s"), JSON.stringify(app.prs || {}).includes("%s")]' % (OLD, OLD)), [False, False], 'no old name is left in history or the records')
    c.eq(p.evaluate('() => [Object.keys(app.lastPerf).includes("%s"), Object.keys(app.lastPerf).includes("%s")]' % (NEW, OLD)), [True, False], 'last-time weights moved over')
    c.eq(p.evaluate('() => PT.isoDip.run()'), 0, 'and it runs once')
    p.evaluate(f'() => {{ app.selectProgram(app.data.programs.find(x => x.id === "{ID}"), null, true); app.activeDay = app.data.programs.find(x => x.id === "{ID}").days.find(d => d.dayNumber === 4); app.showView("workout"); }}')
    p.wait_for_timeout(300)
    t = p.evaluate('() => document.getElementById("view-workout").textContent')
    c.ok('%s' % NEW in t and 'Machine Chest Dips' not in t, 'Day 4 shows the new name')
    c.eq(p.errors, [], 'no page errors')
c.done()
