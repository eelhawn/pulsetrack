"""2.91.2: no front raises on the shoulder days (3, 6, 10) of My 6-Day Split: the shipped plan, the one-time clean-up of a saved copy, and the week reset."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page, old8

c = Checks('nofront')
ID = 'my_6day_chest_back_legs_sharms'
P = f'app.data.programs.find(x => x.id === "{ID}")'
FR = '(e => /front[\\s-]*raise/i.test(e.name))'
COUNT = f'() => {P}.days.map(d => [d.dayNumber, d.exercises.filter({FR}).length, (d.orig || []).filter({FR}).length, (d.removed || []).filter(r => {FR}(r.ex)).length]).filter(x => x[1] + x[2] + x[3])'

with page() as p:
    old8(p)
    c.eq(p.evaluate(f'() => BUILTIN_PROGRAMS.find(x => x.id === "{ID}").days.filter(d => d.exercises.some({FR})).map(d => d.dayNumber)'), [], 'the shipped plan has no front raises on any day')
    c.eq(p.evaluate(f'() => BUILTIN_PROGRAMS.find(x => x.id === "{ID}").days.filter(d => [3, 6, 10, 13].includes(d.dayNumber)).map(d => d.exercises.length)'), [11, 11, 11, 11], 'the four shoulder days have 11 exercises each')
    c.eq(p.evaluate(COUNT), [], 'a fresh copy has none')
    # an old copy on a phone: front raises in the days, in the "original" copy and in the deleted list, plus one more exercise to keep
    p.evaluate(f'''() => {{
      const pr = {P}, mk = (d, id, name) => ({{ id: "{ID}_d" + d + "_" + id, name, sets: 3, reps: "12-15", restSeconds: 60, type: "standard" }});
      [[3, "front-raises", "Front Raises"], [6, "chest-supported-dumbbell-front-raises", "Chest-Supported Dumbbell Front Raises"], [10, "front-raises", "Front Raises"]].forEach(([n, id, name]) => {{
        const d = pr.days.find(x => x.dayNumber === n);
        d.exercises.splice(3, 0, mk(n, id, name)); d.orig = JSON.parse(JSON.stringify(d.exercises));
      }});
      pr.days.find(x => x.dayNumber === 10).removed = [{{ ex: mk(10, "front-raises", "Front Raises"), idx: 3 }}];
      pr.days.find(x => x.dayNumber === 13).exercises.push({{ id: "{ID}_d13_my-front-raise", name: "Cable Front Raise", sets: 3, reps: "12", type: "standard" }});
      app.logs["{ID}_d3_front-raises_s0"] = {{ completed: true, weight: "15", reps: "12", tag: "R" }};
      app.logs["{ID}_d3_front-raises_s1"] = {{ completed: false, weight: "", reps: "", tag: "R" }};
      delete app.settings.noFrontRaises; WorkoutStorage.setData(app.data);
    }}''')
    c.eq(p.evaluate(COUNT), [[3, 1, 1, 0], [6, 1, 1, 0], [10, 1, 1, 1], [13, 1, 0, 0]], 'an old copy has them in the days, the originals and the deleted list')
    n = p.evaluate('() => PT.noFront.run()')
    c.eq(n, 7, 'the clean-up removes 7 entries (3 days + 3 originals + 1 deleted)')
    c.eq(p.evaluate(COUNT), [[13, 1, 0, 0]], 'days 3, 6 and 10 are clean; a front raise you added yourself elsewhere stays')
    c.eq(p.evaluate(f'() => {P}.days.filter(d => [3, 6, 10].includes(d.dayNumber)).map(d => d.exercises.length)'), [11, 11, 11], 'the days have 11 exercises again, nothing else lost')
    c.eq(p.evaluate(f'() => [app.logs["{ID}_d3_front-raises_s0"] && app.logs["{ID}_d3_front-raises_s0"].completed, "{ID}_d3_front-raises_s1" in app.logs]'), [True, False], 'a logged set is kept, an empty one goes')
    c.eq(p.evaluate('() => !!app.settings.noFrontRaises'), True, 'and it does not run again')
    p.evaluate(f'() => {{ {P}.days.find(x => x.dayNumber === 3).exercises.push({{ id: "x", name: "Front Raises", sets: 3, reps: "12", type: "standard" }}); }}')
    c.eq(p.evaluate('() => PT.noFront.run()'), 0, 'run once: a front raise added by hand later is left alone')
    c.eq(p.evaluate(f'() => JSON.parse(localStorage.getItem(STORAGE_KEY_DATA) || "{{}}").programs.find(x => x.id === "{ID}").days.every(d => d.dayNumber !== 6 || !d.exercises.some({FR}))'), True, 'the clean copy is saved')
    # the week reset puts the program's own days back: still no front raises
    r = p.evaluate(f'''() => {{ const pr = {P}; [3, 6, 10].forEach(n => {{ const d = pr.days.find(x => x.dayNumber === n); d.exercises = d.exercises.filter(e => !{FR}(e)); app.restoreDay(pr, d); }});
      return pr.days.filter(d => [3, 6, 10].includes(d.dayNumber)).map(d => d.exercises.some({FR})); }}''')
    c.eq(r, [False, False, False], 'restoring the days to the program (week change) does not bring them back')
    c.eq(p.errors, [], 'no page errors')

with page() as p:
    old8(p)
    # the shoulder day shows up without front raises on the Workout screen
    p.evaluate(f'() => {{ app.selectProgram({P}, null, true); app.activeDay = {P}.days.find(d => d.dayNumber === 3); app.showView("workout"); }}')
    p.wait_for_timeout(300)
    t = p.evaluate('() => document.getElementById("view-workout").textContent')
    c.ok('Lateral Raises' in t and 'Front Raises' not in t, 'Day 3 on screen: lateral raises, no front raises')
    c.eq(p.errors, [], 'screen: no page errors')

c.done()
