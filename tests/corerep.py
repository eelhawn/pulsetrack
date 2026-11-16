"""2.104.0 high-rep Core & Cardio days in Ilhaan's 3 Day Split: 200-300 reps each (5 x 40-60) of Weighted Decline Sit-Ups, Captain's Chair
Leg Raises and Russian Twists, then the StairMaster; a phone copy is changed once (a day with ticked sets stays, the StairMaster row is kept)."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page

c = Checks('corerep')
ID = 'my_6day_chest_back_legs_sharms'
PROG = f'app.data.programs.find(x => x.id === "{ID}")'
ROWS = lambda src: f'(n) => {src}.days.find(x => x.dayNumber === n).exercises.map(e => [e.name, e.sets, e.reps])'
THREE = [['Weighted Decline Sit-Ups', 5, '40-60'], ["Captain's Chair Leg Raises", 5, '40-60'], ['Russian Twists', 5, '40-60']]
SHOTS = '/tmp/claude-0/-home-claude/395da5c4-9b49-54b4-93e4-f9926c59aa1c/scratchpad/'

with page() as p:
    B = f'BUILTIN_PROGRAMS.find(x => x.id === "{ID}")'
    c.eq(p.evaluate(ROWS(B), 4), THREE + [['Stairmaster', 1, '20 min']], 'Day 4: the three ab exercises, 5 x 40-60 each, then 20 min of StairMaster')
    c.eq(p.evaluate(ROWS(B), 64), THREE + [['Stairmaster', 1, '57.5 min']], 'Day 64: the same three, then 57.5 min of StairMaster')
    c.eq(p.evaluate(f'() => {B}.days.filter(d => d.dayNumber % 4 === 0).every(d => d.exercises.length === 4)'), True, 'on all 16 Core & Cardio days')
    c.ok(p.evaluate(f'() => /200-300 reps each/.test({B}.description)'), 'the description says 200-300 reps each')
    c.eq(p.evaluate('(n) => [PT.category(n[0]), PT.category(n[1]), PT.category(n[2])]', [t[0] for t in THREE]), ['Core', 'Core', 'Core'], 'all three are Core exercises from the list')

with page(w=390, h=800) as p:
    p.wait_for_function('() => !!app.settings.coreHighRep')
    # a 2.103.0 copy: two abs from the old leg day + the StairMaster; Day 4 already has ticked sets; Day 8 has an empty box
    p.evaluate(f'''() => {{
      const pr = {PROG};
      pr.days.filter(d => d.dayNumber % 4 === 0).forEach(d => {{ const st = d.exercises.find(e => e.name === "Stairmaster");
        const HL = {{ id: "{ID}_d" + d.dayNumber + "_hanging-leg-raises", name: "Hanging Leg Raises", sets: 3, reps: "12-15", restSeconds: 60, type: "standard" }};
        const two = d.dayNumber % 8 === 4 ? {{ id: "{ID}_d" + d.dayNumber + "_decline-sit-ups", name: "Decline Sit-Ups", sets: 3, reps: "15-20", restSeconds: 45, type: "standard" }}
                                          : {{ id: "{ID}_d" + d.dayNumber + "_russian-twists", name: "Russian Twists", sets: 3, reps: "20", restSeconds: 45, type: "standard" }};
        d.exercises = [HL, two, st]; }});
      app.logs[app.getLogKey("{ID}", 4, "{ID}_d4_hanging-leg-raises", 0)] = {{ weight: "0", reps: "15", completed: true, tag: "R" }};
      app.logs[app.getLogKey("{ID}", 8, "{ID}_d8_hanging-leg-raises", 0)] = {{ weight: "", reps: "", completed: false, tag: "R" }};
      pr.description = "... Days 4 and 8 of each 8 are Core & Cardio: the ab work from the leg day before, then the StairMaster ...";
      delete app.settings.coreHighRep; WorkoutStorage.setData(app.data); WorkoutStorage.saveLogs(app.logs);
    }}''')
    c.eq(p.evaluate('() => PT.coreHighRep.run()'), 15, 'the copy is changed on 15 Core & Cardio days')
    c.eq([r[0] for r in p.evaluate(ROWS(PROG), 4)], ['Hanging Leg Raises', 'Decline Sit-Ups', 'Stairmaster'], 'Day 4, with sets you ticked, stays as it is')
    c.eq(p.evaluate(ROWS(PROG), 8), THREE + [['Stairmaster', 1, '22.5 min']], 'Day 8: the three, and its StairMaster target is kept')
    c.eq(p.evaluate(ROWS(PROG), 60), THREE + [['Stairmaster', 1, '55 min']], 'Day 60 too')
    c.eq(p.evaluate('() => Object.keys(app.logs).filter(k => k.includes("_d8_hanging-leg-raises")).length'), 0, 'an empty box of a replaced exercise is cleared')
    c.eq(p.evaluate(f'() => {PROG}.days[7].exercises[0].id'), ID + '_d8_weighted-decline-sit-ups', 'with ids of their own day')
    c.ok(p.evaluate(f'() => /200-300 reps each/.test({PROG}.description)'), 'the description is updated')
    c.eq(p.evaluate('() => PT.coreHighRep.run()'), 0, 'it only runs once')
    p.evaluate(f'() => {{ const pr = {PROG}; app.selectProgram(pr, null, true); app.activeProgram = pr; app.activeDay = pr.days[7]; app.showView("workout"); app.renderWorkoutView(); }}')
    p.wait_for_timeout(250)
    c.eq(p.evaluate('() => document.querySelector(".pt-sbar-t").textContent'), '0 / 15 sets', 'Day 8 on screen: 15 ab sets (the StairMaster goes to Cardio & Sports)')
    c.ok(p.evaluate('() => document.documentElement.scrollWidth <= innerWidth + 1'), 'no sideways scroll')
    p.screenshot(path=SHOTS + 'corerep390.png')
    c.eq(p.errors, [], 'no page errors')

c.done()
