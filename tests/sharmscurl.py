"""3.24.0 the Week B Shoulders & Arms curls in Ilhaan's 3 Day Split (the owner: "day 15 sharms: change the preacher curl vertical pad into
a name like dumbbell/bar, and sub ez bar reverse curl for standard ez bar curl and make it 3 sets"). Day 15, 31, 47 and 63: Preacher Curls
says "Dumbbell/bar." under it, and EZ-Bar Reverse Curls is EZ-Bar Curls for 3 sets, in the program and, once, in a copy already on a
phone (ticked sets move with it, your swaps, removals, notes and set counts are kept). Since 3.25.0 the program has "Preacher Curls
(Dumbbell/Bar)" with no line under it and Cable Wrist Curls in the last spot (tests/threesets.py), and since 3.26.0 "Vertical Preacher
Curls (Bar)" (tests/verticalpreacher.py); this file still checks module 148's
change of an old copy."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page

c = Checks('sharmscurl')
ID = 'my_6day_chest_back_legs_sharms'
FROM, TO = 'EZ-Bar Reverse Curls', 'EZ-Bar Curls'
PROG = f'app.data.programs.find(x => x.id === "{ID}")'
BUILT = f'BUILTIN_PROGRAMS.find(x => x.id === "{ID}")'
DAY = lambda dn, src=PROG: f'{src}.days.find(d => d.dayNumber === {dn})'
OLD = lambda dn: f'{ID}_d{dn}_ez-bar-reverse-curls'
NEW = lambda dn: f'{ID}_d{dn}_ez-bar-curls'
LOG = lambda dn, exid, s: f'{ID}_d{dn}_{exid}_s{s}'

with page() as p:
    # ---- the program
    for dn in (15, 31, 47, 63):
        r = p.evaluate(f'() => {{ const d = {DAY(dn, BUILT)}; return [d.exercises[7].name, d.exercises.some(x => x.name === "{FROM}")]; }}')
        c.eq(r, ['Vertical Preacher Curls (Bar)', False], 'Day %d: Vertical Preacher Curls (Bar) (3.26.0), no reverse curls' % dn)
    left = p.evaluate(f'() => {BUILT}.days.flatMap(d => d.exercises).filter(e => e.name === "{FROM}" || e.notes === "Vertical pad.").length')
    c.eq(left, 0, 'no EZ-Bar Reverse Curls or "Vertical pad." left in the split')
    c.ok(p.evaluate(f'() => EXERCISE_DATABASE.some(x => x.name === "{TO}")'), 'EZ-Bar Curls is an exercise from the exercise list')
    c.eq(p.evaluate(f'() => {DAY(3, BUILT)}.exercises.map(e => e.name).filter(n => /curl/i.test(n))'), ['Machine Preacher Curls', 'Incline Dumbbell Curls', 'Hammer Curls', 'Cable Wrist Curls'], 'other days are unchanged')

    # ---- a copy already on a phone (up to 3.23.0)
    p.evaluate(f'''() => {{
      const pr = {PROG};
      const back = (dn) => {{ const d = pr.days.find(x => x.dayNumber === dn), i = 10;
        d.exercises[i] = {{ id: "{ID}_d" + dn + "_ez-bar-reverse-curls", name: "{FROM}", sets: 4, reps: "15", restSeconds: 45, type: "standard" }};
        d.exercises[7] = {{ id: "{ID}_d" + dn + "_preacher-curls", name: "Preacher Curls", sets: 3, reps: "10-12", restSeconds: 60, type: "standard", notes: "Vertical pad." }}; return d; }};
      back(15); back(31); back(47); back(63);
      const e31 = pr.days.find(x => x.dayNumber === 31).exercises.find(e => e.name === "{FROM}"); e31.origName = "{FROM}"; e31.name = "Cable Curls (EZ-Bar Attachment)";   // swapped by hand
      const d47 = pr.days.find(x => x.dayNumber === 47), i47 = d47.exercises.findIndex(e => e.name === "{FROM}");
      d47.removed = [{{ idx: i47, ex: d47.exercises[i47] }}]; d47.exercises.splice(i47, 1);   // removed by hand
      d47.exercises.find(e => e.name === "Preacher Curls").notes = "Seat 3, vertical pad";   // his own note
      pr.days.find(x => x.dayNumber === 63).exercises.find(e => e.name === "{FROM}").sets = 5;   // his own set count
      app.logs["{LOG(15, OLD(15), 0)}"] = {{ reps: "15", weight: "50", completed: true }};
      app.logs["{LOG(15, OLD(15), 1)}"] = {{ reps: "14", weight: "50", completed: true }};
      delete app.settings.sharmsCurls; WorkoutStorage.setData(app.data);
    }}''')
    c.ok(FROM in p.evaluate(f'() => {DAY(15)}.exercises.map(e => e.name)'), 'set up: an old copy with the reverse curls')
    c.ok(p.evaluate('() => PT.sharmsCurls.run()') >= 7, 'changed once')
    d15 = p.evaluate(f'() => {{ const d = {DAY(15)}, e = d.exercises[10]; return [e.name, e.id, e.sets, d.exercises.find(x => x.name === "Preacher Curls").notes]; }}')
    c.eq(d15, [TO, NEW(15), 3, 'Dumbbell/bar.'], 'Day 15: EZ-Bar Curls for 3 sets, Preacher Curls says Dumbbell/bar.')
    lg = p.evaluate(f'() => [app.logs["{LOG(15, NEW(15), 0)}"], app.logs["{LOG(15, NEW(15), 1)}"], "{LOG(15, OLD(15), 0)}" in app.logs]')
    c.ok(lg[0] and lg[0]['weight'] == '50' and lg[1] and lg[1]['reps'] == '14' and not lg[2], 'sets already ticked on it move with it')
    c.eq(p.evaluate(f'() => {{ const e = {DAY(31)}.exercises[10]; return [e.name, e.origName, e.id, e.sets]; }}'), ['Cable Curls (EZ-Bar Attachment)', TO, NEW(31), 3], 'Day 31: your swap stays, and swaps back to EZ-Bar Curls')
    c.eq(p.evaluate(f'() => {{ const d = {DAY(47)}; return [d.exercises.some(e => e.name === "{FROM}" || e.name === "{TO}"), d.removed[0].ex.name, d.removed[0].ex.sets, d.exercises.find(e => e.name === "Preacher Curls").notes]; }}'),
         [False, TO, 3, 'Seat 3, vertical pad'], 'Day 47: still removed (puts back as EZ-Bar Curls, 3 sets); your own note is kept')
    c.eq(p.evaluate(f'() => {{ const e = {DAY(63)}.exercises[10]; return [e.name, e.sets]; }}'), [TO, 5], 'Day 63: a set count you changed yourself is kept')
    c.eq(p.evaluate('() => PT.sharmsCurls.run()'), 0, 'it only runs once')

    # ---- on the workout screen
    p.evaluate(f'() => {{ const pr = {PROG}; app.selectProgram(pr, pr.days.find(d => d.dayNumber === 15), true); app.showView("workout"); }}'); p.wait_for_timeout(500)
    t = p.evaluate('() => document.getElementById("exercises-list-container").innerText')
    c.ok(TO in t and 'Dumbbell/bar.' in t and FROM not in t and 'Vertical pad' not in t, 'Day 15 shows EZ-Bar Curls and Dumbbell/bar.')
    c.eq(p.errors, [], 'no errors')

sys.exit(c.done())
