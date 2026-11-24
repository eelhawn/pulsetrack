"""3.25.0 Ilhaan's 3 Day Split: Cable Wrist Curls on the Week B Shoulders & Arms days, and every lift 3 sets (the owner, after 3.24.0:
"redo the ez bar curl exercise and make everything 3 sets no 4 sets"; asked which curl, "put cable wrist curls"; everything = every 4-set
exercise, the 5-set ab exercises stay). Day 15, 31, 47 and 63 end with Cable Wrist Curls 3 x 15-20 (the same as Day 3) instead of EZ-Bar
Curls, and no exercise in the split has 4 sets, in the program and, once, in a copy already on a phone (ticked sets move with the
exercise, your swaps and removals are kept, exercises you added and the weekly-reset copy get 3 sets too). Then: "the vertical preacher
thing put it in the exercise name and differ dumbbell/bar dont name it just preacher curl": Preacher Curls there is "Preacher Curls
(Dumbbell/Bar)", its own name in the exercise list, with no line under it; its history from this split comes with it. Since 3.26.0 the
program has Vertical Preacher Curls (Bar) there (tests/verticalpreacher.py); the second part still checks module 149 on its own."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page

c = Checks('threesets')
ID = 'my_6day_chest_back_legs_sharms'
TO, EZ, REV = 'Cable Wrist Curls', 'EZ-Bar Curls', 'EZ-Bar Reverse Curls'
PC, PCN = 'Preacher Curls', 'Preacher Curls (Dumbbell/Bar)'
PROG = f'app.data.programs.find(x => x.id === "{ID}")'
BUILT = f'BUILTIN_PROGRAMS.find(x => x.id === "{ID}")'
DAY = lambda dn, src=PROG: f'{src}.days.find(d => d.dayNumber === {dn})'
EXID = lambda dn, slug: f'{ID}_d{dn}_{slug}'
LOG = lambda dn, exid, s: f'{ID}_d{dn}_{exid}_s{s}'
ABS = ['Weighted Decline Sit-Ups', "Captain's Chair Leg Raises", 'Russian Twists']
SETS = '(pr) => { const o = {}; pr.days.forEach(d => (d.exercises || []).forEach(e => { const k = String(e.sets); o[k] = (o[k] || 0) + 1; })); return o; }'

with page() as p:
    # ---- the program
    d3 = p.evaluate(f'() => {{ const e = {DAY(3, BUILT)}.exercises.find(e => e.name === "{TO}"); return [e.sets, e.reps, e.restSeconds]; }}')
    c.eq(d3, [3, '15-20', 45], 'Day 3 Cable Wrist Curls: 3 x 15-20, 45 s (was 4 sets)')
    for dn in (15, 31, 47, 63):
        r = p.evaluate(f'() => {{ const d = {DAY(dn, BUILT)}, e = d.exercises[10]; return [e.name, e.id, e.sets, e.reps, e.restSeconds, d.exercises.filter(x => x.name === "{TO}").length, d.exercises.some(x => x.name === "{EZ}" || x.name === "{REV}")]; }}')
        c.eq(r, [TO, EXID(dn, 'cable-wrist-curls'), 3, '15-20', 45, 1, False], 'Day %d ends with Cable Wrist Curls 3 x 15-20 where the EZ-bar curls were' % dn)
        r = p.evaluate(f'() => {{ const e = {DAY(dn, BUILT)}.exercises[7]; return [e.name, e.id, e.sets, e.reps, e.restSeconds, e.notes === undefined]; }}')
        c.eq(r, ['Vertical Preacher Curls (Bar)', EXID(dn, 'vertical-preacher-curls-bar'), 3, '10-12', 60, True], 'Day %d: the preacher curls (Vertical Preacher Curls (Bar) since 3.26.0), no line under it' % dn)
    c.eq(p.evaluate(f'() => {BUILT}.days.flatMap(d => d.exercises).filter(e => e.name === "{PC}").length'), 0, 'no plain "Preacher Curls" left in the split')
    bad = p.evaluate(f'() => [...new Set({BUILT}.days.flatMap(d => d.exercises.map(e => e.name)))].filter(n => {{ const e = PT.exCanon(n); return !e || e.name !== n; }})')
    c.eq(bad, [], 'every name in the split is an exercise-list name')
    c.eq(p.evaluate(f'() => ({SETS})({BUILT})'), {'1': 16, '3': 440, '5': 48}, 'the whole split: every lift 3 sets; only the 3 ab exercises on the 16 Core & Cardio days have 5, the Stairmaster 1')
    c.eq(p.evaluate(f'() => [...new Set({BUILT}.days.flatMap(d => d.exercises.filter(e => e.sets === 5).map(e => e.name)))]'), ABS, 'the 5-set exercises are the ab exercises')
    c.ok(p.evaluate(f'() => EXERCISE_DATABASE.some(x => x.name === "{TO}")'), 'Cable Wrist Curls is an exercise from the exercise list')
    c.ok(p.evaluate(f'() => BUILTIN_PROGRAMS.filter(x => x.id !== "{ID}").some(x => x.days.some(d => d.exercises.some(e => e.sets === 4)))'), 'other programs keep their 4-set exercises')

    # ---- a copy already on a phone (3.24.0, and a Day 63 still from 3.23.0)
    p.evaluate(f'''() => {{
      const pr = {PROG}, day = dn => pr.days.find(x => x.dayNumber === dn);
      const ez = dn => ({{ id: "{EXID(0, '')}".replace("_d0_", "_d" + dn + "_") + "ez-bar-curls", name: "{EZ}", sets: 3, reps: "15", restSeconds: 45, type: "standard" }});
      day(15).exercises[10] = ez(15); day(31).exercises[10] = ez(31); day(47).exercises[10] = ez(47);
      day(63).exercises[10] = {{ id: "{EXID(63, 'ez-bar-reverse-curls')}", name: "{REV}", sets: 4, reps: "15", restSeconds: 45, type: "standard" }};
      const e31 = day(31).exercises[10]; e31.origName = "{EZ}"; e31.name = "Cable Curls (EZ-Bar Attachment)";   // swapped by hand
      const d47 = day(47); d47.removed = [{{ idx: 10, ex: d47.exercises[10] }}]; d47.exercises.splice(10, 1);   // removed by hand
      const lp = day(1).exercises.find(e => e.name === "Lat Pulldown"); lp.sets = 4;
      day(1).orig = JSON.parse(JSON.stringify(day(1).exercises));   // the weekly reset goes back to 4 sets
      day(2).exercises.find(e => e.name === "Leg Press").sets = 4;
      day(5).exercises.push({{ id: "{EXID(5, 'pec-deck-added')}", name: "Pec Deck", sets: 4, reps: "12", restSeconds: 60, type: "standard", added: true }});   // added by hand
      const d6 = day(6), i6 = d6.exercises.findIndex(e => e.name === "Squat"); d6.exercises[i6].sets = 4; d6.removed = [{{ idx: i6, ex: d6.exercises[i6] }}]; d6.exercises.splice(i6, 1);
      day(15).exercises[0].sets = 4;   // Dumbbell Shoulder Press
      app.logs["{LOG(15, EXID(15, 'ez-bar-curls'), 0)}"] = {{ reps: "15", weight: "40", completed: true }};
      app.logs["{LOG(15, EXID(15, 'ez-bar-curls'), 1)}"] = {{ reps: "12", weight: "40", completed: true }};
      app.logs["{ID}_d1_" + lp.id + "_s3"] = {{ reps: "8", weight: "160", completed: true }};
      app.settings.sharmsCurls = 1; delete app.settings.threeSets; WorkoutStorage.setData(app.data);
    }}''')
    c.eq(p.evaluate(f'() => ({SETS})({PROG})["4"]'), 5, 'set up: an old copy with 4-set exercises and the EZ-bar curls')
    c.ok(p.evaluate('() => PT.threeSets.run()') >= 10, 'changed once')
    d15 = p.evaluate(f'() => {{ const d = {DAY(15)}, e = d.exercises[10]; return [e.name, e.id, e.sets, e.reps, d.exercises[0].sets]; }}')
    c.eq(d15, [TO, EXID(15, 'cable-wrist-curls'), 3, '15-20', 3], 'Day 15: Cable Wrist Curls 3 x 15-20, shoulder press 3 sets')
    lg = p.evaluate(f'''() => [app.logs["{LOG(15, EXID(15, 'cable-wrist-curls'), 0)}"], app.logs["{LOG(15, EXID(15, 'cable-wrist-curls'), 1)}"], "{LOG(15, EXID(15, 'ez-bar-curls'), 0)}" in app.logs]''')
    c.ok(lg[0] and lg[0]['weight'] == '40' and lg[1] and lg[1]['reps'] == '12' and not lg[2], 'sets already ticked in that spot move with it')
    c.eq(p.evaluate(f'() => {{ const e = {DAY(31)}.exercises[10]; return [e.name, e.origName, e.id]; }}'), ['Cable Curls (EZ-Bar Attachment)', TO, EXID(31, 'cable-wrist-curls')], 'Day 31: your swap stays, and swaps back to Cable Wrist Curls')
    c.eq(p.evaluate(f'() => {{ const d = {DAY(47)}; return [d.exercises.some(e => e.name === "{EZ}" || e.name === "{TO}"), d.removed[0].ex.name, d.removed[0].ex.reps]; }}'), [False, TO, '15-20'], 'Day 47: still removed (puts back Cable Wrist Curls)')
    c.eq(p.evaluate(f'() => {{ const e = {DAY(63)}.exercises[10]; return [e.name, e.sets, e.id]; }}'), [TO, 3, EXID(63, 'cable-wrist-curls')], 'Day 63 from 3.23.0: EZ-Bar Reverse Curls 4 sets -> Cable Wrist Curls 3 sets')
    c.eq(p.evaluate(f'() => [{DAY(1)}.exercises.find(e => e.name === "Lat Pulldown").sets, {DAY(1)}.orig.find(e => e.name === "Lat Pulldown").sets, {DAY(2)}.exercises.find(e => e.name === "Leg Press").sets]'), [3, 3, 3], 'Lat Pulldown and Leg Press 3 sets, also in the copy the weekly reset goes back to')
    c.eq(p.evaluate(f'() => [{DAY(5)}.exercises.find(e => e.added).sets, {DAY(6)}.removed[0].ex.name, {DAY(6)}.removed[0].ex.sets]'), [3, 'Squat', 3], 'an exercise you added and a removed one get 3 sets too')
    c.eq(p.evaluate(f'() => ({SETS})({PROG})["4"]'), None, 'no exercise in the split has 4 sets')
    c.eq(p.evaluate(f'() => {DAY(4)}.exercises.map(e => e.sets)'), [5, 5, 5, 1], 'the ab exercises stay at 5 sets')
    c.ok(p.evaluate(f'() => !!app.logs["{ID}_d1_" + {DAY(1)}.exercises.find(e => e.name === "Lat Pulldown").id + "_s3"]'), 'a 4th set you already ticked is left in the logs')
    c.eq(p.evaluate('() => PT.threeSets.run()'), 0, 'it only runs once')

    # ---- on the workout screen
    p.evaluate(f'() => {{ const pr = {PROG}; app.selectProgram(pr, pr.days.find(d => d.dayNumber === 15), true); app.showView("workout"); }}'); p.wait_for_timeout(500)
    t = p.evaluate('() => document.getElementById("exercises-list-container").innerText')
    c.ok(TO in t and EZ not in t, 'Day 15 shows Cable Wrist Curls, no EZ-Bar Curls')
    rows = p.evaluate('() => [...document.querySelectorAll("[data-ex-card]")].map(k => k.querySelectorAll(".set-row").length)')
    c.ok(len(rows) == 11 and all(n == 3 for n in rows), 'every card on Day 15 has 3 set rows (%s)' % rows)
    c.eq(p.errors, [], 'no errors')


# ---- the preacher curls on a phone copy from 3.24.0, and their history
with page() as p:
    p.evaluate(f'''() => {{
      const a = app, pr = {PROG}, day = dn => pr.days.find(x => x.dayNumber === dn), now = Date.now();
      [15, 31, 47, 63].forEach(dn => {{ day(dn).exercises[7] = {{ id: "{ID}_d" + dn + "_preacher-curls", name: "{PC}", sets: 3, reps: "10-12", restSeconds: 60, type: "standard", notes: "Dumbbell/bar." }}; }});
      day(47).exercises[7].notes = "Seat 3, vertical pad";   // his own note
      const e63 = day(63).exercises[7]; e63.origName = "{PC}"; e63.name = "Spider Curls";   // swapped by hand
      const d31 = day(31); d31.removed = [{{ idx: 7, ex: d31.exercises[7] }}]; d31.exercises.splice(7, 1);   // removed by hand
      a.logs["{LOG(15, EXID(15, 'preacher-curls'), 0)}"] = {{ reps: "10", weight: "45", completed: true }};
      const ses = (id, pid, w, back) => {{ const t = now - back * 86400000; return {{ id, v: 1, date: PT.ds(new Date(t)), ts: t, pid, ptitle: "P", day: 15, dtitle: "Shoulders & Arms", dur: 3000, unit: "lb",
        ex: [{{ name: "{PC}", sets: [{{ w, r: 10, t: "R" }}] }}], vol: 0, sets: 1, prs: [], upd: t }}; }};
      a.sessions.push(ses("pc-other", "some_other_program", 30, 1), ses("pc-mine", "{ID}", 50, 2));
      a.saveSessions(); a.recomputeSessionPRs(); a.rebuildPRs(); a.rebuildLastPerfFor(["{PC}"]);
      a.exNotes["{PC}"] = "Elbows in"; a.settings.restOverrides = Object.assign({{}}, a.settings.restOverrides, {{ "{PC}": 75 }});
      a.settings.sharmsCurls = 1; delete a.settings.threeSets; WorkoutStorage.setData(a.data);
    }}''')
    c.ok(p.evaluate('() => PT.threeSets.run()') >= 5, 'set up: a 3.24.0 copy with Preacher Curls and "Dumbbell/bar." under it, changed once')
    c.eq(p.evaluate(f'() => {{ const e = {DAY(15)}.exercises[7]; return [e.name, e.id, e.notes === undefined, e.sets]; }}'), [PCN, EXID(15, 'preacher-curls-dumbbell-bar'), True, 3], 'Day 15: Preacher Curls (Dumbbell/Bar), the line under it is gone')
    c.eq(p.evaluate(f'''() => [app.logs["{LOG(15, EXID(15, 'preacher-curls-dumbbell-bar'), 0)}"] && app.logs["{LOG(15, EXID(15, 'preacher-curls-dumbbell-bar'), 0)}"].weight, "{LOG(15, EXID(15, 'preacher-curls'), 0)}" in app.logs]'''), ['45', False], 'a set already ticked moves with it')
    c.eq(p.evaluate(f'() => {{ const e = {DAY(47)}.exercises[7]; return [e.name, e.notes]; }}'), [PCN, 'Seat 3, vertical pad'], 'Day 47: a note you wrote yourself stays')
    c.eq(p.evaluate(f'() => {{ const e = {DAY(63)}.exercises[7]; return [e.name, e.origName, e.id]; }}'), ['Spider Curls', PCN, EXID(63, 'preacher-curls-dumbbell-bar')], 'Day 63: your swap stays, and swaps back to Preacher Curls (Dumbbell/Bar)')
    c.eq(p.evaluate(f'() => {{ const r = {DAY(31)}.removed[0].ex; return [r.name, r.notes === undefined]; }}'), [PCN, True], 'Day 31: still removed (puts back Preacher Curls (Dumbbell/Bar))')
    h = p.evaluate(f'''() => {{ const nm = id => app.sessions.find(s => s.id === id).ex[0].name, lp = app.lastPerf["{PCN}"];
      return [nm("pc-mine"), nm("pc-other"), lp && String(lp[0].weight), app.exNotes["{PCN}"], app.settings.restOverrides["{PCN}"], !!app.prs["{PCN}"]]; }}''')
    c.eq(h, [PCN, PC, '50', 'Elbows in', 75, True], 'history from this split moves to the new name (last time 50, note, rest time, PR); a workout from another program keeps "Preacher Curls"')
    c.eq(p.evaluate('() => PT.threeSets.run()'), 0, 'it only runs once')
    p.evaluate(f'() => {{ const pr = {PROG}; app.selectProgram(pr, pr.days.find(d => d.dayNumber === 15), true); app.showView("workout"); }}'); p.wait_for_timeout(500)
    t = p.evaluate('() => document.getElementById("exercises-list-container").innerText')
    c.ok(PCN in t and 'Dumbbell/bar.' not in t and 'Vertical pad' not in t, 'Day 15 shows Preacher Curls (Dumbbell/Bar) with no line under it')
    c.eq(p.errors, [], 'no errors')

sys.exit(c.done())
