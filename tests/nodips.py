"""2.95.0 one of dips / decline on every Chest & Back day of My 6-Day Split: the program, and the one-time clean-up of a copy on a phone."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page

c = Checks('nodips')
ID = 'my_6day_chest_back_legs_sharms'
PROG = f'app.data.programs.find(x => x.id === "{ID}")'
HAS = lambda p, dn, name: p.evaluate(f'() => {PROG}.days.find(d => d.dayNumber === {dn}).exercises.some(e => e.name === "{name}")')
BUILT = lambda dn, name: f'BUILTIN_PROGRAMS.find(x => x.id === "{ID}").days.find(d => d.dayNumber === {dn}).exercises.some(e => e.name === "{name}")'

with page() as p:
    for k in (0, 2, 4, 6):
        c.eq([p.evaluate('() => ' + BUILT(8 * k + 1, 'Chest Dips')), p.evaluate('() => ' + BUILT(8 * k + 1, 'Decline Bench Press'))], [False, True], 'Day %d: no dips, keeps the decline' % (8 * k + 1))
        c.eq([p.evaluate('() => ' + BUILT(8 * k + 5, 'Decline Bench Press')), p.evaluate('() => ' + BUILT(8 * k + 5, 'Iso-Lateral Plate-Loaded Machine Dip'))], [False, True], 'Day %d: no decline, keeps the dip' % (8 * k + 5))
    for k in (1, 3, 5, 7):
        c.eq(p.evaluate('() => ' + BUILT(8 * k + 1, 'Iso-Lateral Plate-Loaded Decline Press')), True, 'Day %d (machine block): keeps its decline press' % (8 * k + 1))
        c.eq(p.evaluate('() => ' + BUILT(8 * k + 5, 'Smith Machine Decline Press')), False, 'Day %d: the Smith decline press is gone' % (8 * k + 5))
    c.eq(p.evaluate(f'() => BUILTIN_PROGRAMS.find(x => x.id === "{ID}").days.reduce((n, d) => n + d.exercises.length, 0)'), 480 - 12, 'twelve exercises fewer in all')

def old(p):
    p.evaluate(f'''() => {{
      const pr = {PROG}, b = BUILTIN_PROGRAMS.find(x => x.id === "{ID}");
      pr.days = JSON.parse(JSON.stringify(b.days));
      const add = (dn, name, after) => {{ const d = pr.days.find(x => x.dayNumber === dn), ex = {{ id: "{ID}_d" + dn + "_" + name.toLowerCase().replace(/ /g, "-"), name, sets: 3, reps: "8-12", rest: 90 }}; d.exercises.splice(after, 0, ex); return ex; }};
      add(1, "Chest Dips", 6); add(5, "Decline Bench Press", 5); add(13, "Smith Machine Decline Press", 5);
      const d17 = add(17, "Chest Dips", 6);                                   // Day 17 already has ticked sets of its dips: it stays
      app.logs["{ID}_d17_" + d17.id + "_s0"] = {{ weight: "100", reps: "8", completed: true }};
      const d1 = pr.days.find(x => x.dayNumber === 1); d1.orig = JSON.parse(JSON.stringify(d1.exercises));
      app.logs["{ID}_d1_{ID}_d1_chest-dips_s0"] = {{ weight: "", reps: "", completed: false }};
      delete app.settings.noDipsDecline; WorkoutStorage.setData(app.data); WorkoutStorage.saveLogs(app.logs);
    }}''')

with page() as p:
    old(p)
    c.ok(HAS(p, 1, 'Chest Dips') and HAS(p, 5, 'Decline Bench Press') and HAS(p, 13, 'Smith Machine Decline Press'), 'set up: a copy that still has them')
    c.eq(p.evaluate('() => PT.noDips.run()'), 3, 'the clean-up takes out 3 (not the one with ticked sets)')
    c.eq([HAS(p, 1, 'Chest Dips'), HAS(p, 5, 'Decline Bench Press'), HAS(p, 13, 'Smith Machine Decline Press')], [False, False, False], 'gone from Day 1, 5 and 13')
    c.eq(HAS(p, 17, 'Chest Dips'), True, 'Day 17 keeps its dips: you ticked sets of them')
    c.eq(p.evaluate(f'() => {PROG}.days.find(d => d.dayNumber === 1).orig.some(e => e.name === "Chest Dips")'), False, 'and out of the put-it-back copy')
    c.eq(p.evaluate('() => Object.keys(app.logs).filter(k => k.includes("chest-dips") && k.startsWith("%s_d1_")).length' % ID), 0, 'an unticked empty box of a removed dip is cleaned up')
    c.eq(p.evaluate('() => PT.noDips.run()'), 0, 'it only runs once')
    c.eq(p.evaluate(f'() => {PROG}.days.find(d => d.dayNumber === 1).exercises.length'), 8, 'Day 1 has 8 exercises')
    c.eq(p.errors, [], 'no page errors')

c.done()
