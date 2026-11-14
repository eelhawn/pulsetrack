"""2.103.0 StairMaster climb on Ilhaan's 3 Day Split: 20 min on Day 4, +2.5 min every Core & Cardio day, 57.5 min on Day 64; the minutes box
shows that day's target; a phone copy with the treadmill walk is changed once (a ticked row stays)."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page

c = Checks('stairs')
ID = 'my_6day_chest_back_legs_sharms'
PROG = f'app.data.programs.find(x => x.id === "{ID}")'
SHOTS = '/tmp/claude-0/-home-claude/395da5c4-9b49-54b4-93e4-f9926c59aa1c/scratchpad/'
CARDIO = lambda src: f'(n) => {{ const d = {src}.days.find(x => x.dayNumber === n); const e = d.exercises.find(e => e.type === "cardio"); return e ? [e.name, e.reps] : null; }}'

with page() as p:
    B = f'BUILTIN_PROGRAMS.find(x => x.id === "{ID}")'
    c.eq([p.evaluate(CARDIO(B), n) for n in (4, 8, 12, 64)], [['Stairmaster', '20 min'], ['Stairmaster', '22.5 min'], ['Stairmaster', '25 min'], ['Stairmaster', '57.5 min']], 'Day 4: 20 min, Day 8: 22.5, Day 12: 25 ... Day 64: 57.5')
    c.eq(p.evaluate(f'() => {B}.days.filter(d => d.exercises.some(e => e.name === "Stairmaster")).length'), 16, 'on all 16 Core & Cardio days')
    c.eq(p.evaluate(f'() => {B}.days.filter(d => d.exercises.some(e => e.name === "Incline Treadmill Walk")).length'), 0, 'the treadmill walk is gone')
    c.ok(p.evaluate(f'() => /StairMaster: 20 minutes on Day 4/.test({B}.description)'), 'the description says so')

with page(w=390, h=800) as p:
    p.wait_for_function('() => !!app.settings.stairClimb')
    # a copy from 2.101.0 / 2.102.0: the treadmill walk on every Core & Cardio day; Day 4's already ticked
    p.evaluate(f'''() => {{
      const pr = {PROG};
      pr.days.filter(d => d.dayNumber % 4 === 0).forEach(d => {{ const i = d.exercises.findIndex(e => e.name === "Stairmaster");
        d.exercises[i] = {{ id: "{ID}_d" + d.dayNumber + "_incline-treadmill-walk", name: "Incline Treadmill Walk", sets: 1, reps: "20-30 min", restSeconds: 60, type: "cardio" }}; }});
      app.logs[app.getLogKey("{ID}", 4, "{ID}_d4_incline-treadmill-walk", 0)] = {{ completed: true, min: "25", tag: "R" }};
      app.logs[app.getLogKey("{ID}", 8, "{ID}_d8_incline-treadmill-walk", 0)] = {{ completed: false, min: "", tag: "R" }};
      pr.description = pr.description.replace(/then the StairMaster:.*Day 64\\./, "then 20-30 minutes on the incline treadmill.");
      delete app.settings.stairClimb; WorkoutStorage.setData(app.data); WorkoutStorage.saveLogs(app.logs);
    }}''')
    c.eq(p.evaluate('() => PT.stairClimb.run()'), 15, 'the copy is changed on 15 Core & Cardio days')
    c.eq(p.evaluate(CARDIO(PROG), 4), ['Incline Treadmill Walk', '20-30 min'], 'Day 4, whose walk you ticked, stays as it is')
    c.eq([p.evaluate(CARDIO(PROG), n) for n in (8, 36, 64)], [['Stairmaster', '22.5 min'], ['Stairmaster', '40 min'], ['Stairmaster', '57.5 min']], 'the others get their StairMaster target')
    c.eq(p.evaluate('() => Object.keys(app.logs).filter(k => k.includes("_d8_incline-treadmill-walk")).length'), 0, 'an empty box of the old walk is cleared')
    c.ok(p.evaluate(f'() => /StairMaster: 20 minutes/.test({PROG}.description)'), 'the description is updated')
    c.eq(p.evaluate('() => PT.stairClimb.run()'), 0, 'it only runs once')
    # the minutes box shows the day's target
    p.evaluate(f'() => {{ const pr = {PROG}; app.selectProgram(pr, null, true); app.activeProgram = pr; app.lastPerf["Stairmaster"] = [{{ min: "20" }}]; app.activeDay = pr.days[11]; app.showView("workout"); app.renderWorkoutView(); }}')
    p.wait_for_timeout(250)
    c.eq(p.evaluate('() => document.querySelector(\'input[data-field="min"]\').placeholder'), '25', 'Day 12: the minutes box shows 25 (the target), not last time\'s 20')
    p.evaluate('() => document.querySelector(\'input[data-field="min"]\').scrollIntoView({ block: "center" })')
    p.evaluate('() => document.querySelector(\'input[data-field="min"]\').closest(".set-row").querySelector(".btn-check-set").click()')
    p.wait_for_timeout(200)
    c.eq(p.evaluate(f'() => {{ const pr = {PROG}, ex = pr.days[11].exercises.find(e => e.name === "Stairmaster"), e = app.logs[app.getLogKey(pr.id, 12, ex.id, 0)]; return e && [e.min, e.completed]; }}'), ['25', True], '✓ on the empty box logs the 25 minutes it asks for')
    p.screenshot(path=SHOTS + 'stairs390.png')
    c.ok(p.evaluate('() => document.documentElement.scrollWidth <= innerWidth + 1'), 'no sideways scroll')
    c.eq(p.errors, [], 'no page errors')

c.done()
