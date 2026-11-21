"""3.22.0 Ilhaan's 3 Day Split uses the cable row he already does (the owner: "make sure you don't make new exercises, like the neutral
cable row: use the wide bar cable row that was already in exercises"). Day 13, 29, 45 and 61 have Cable Seated Rows (Wide Bar) instead
of Neutral-Grip Seated Cable Row, in the program and, once, in a copy already on a phone (ticked sets move with it, your swaps and
removals are kept, no second wide-bar row on a day that has one, history is left alone)."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page

c = Checks('widerow')
ID = 'my_6day_chest_back_legs_sharms'
FROM, TO = 'Neutral-Grip Seated Cable Row', 'Cable Seated Rows (Wide Bar)'
PROG = f'app.data.programs.find(x => x.id === "{ID}")'
BUILT = f'BUILTIN_PROGRAMS.find(x => x.id === "{ID}")'
DAY = lambda dn, src=PROG: f'{src}.days.find(d => d.dayNumber === {dn})'
OLD = lambda dn: f'{ID}_d{dn}_neutral-grip-seated-cable-row'
NEW = lambda dn: f'{ID}_d{dn}_cable-seated-rows-wide-bar'
LOG = lambda dn, exid, s: f'{ID}_d{dn}_{exid}_s{s}'

with page() as p:
    # ---- the program
    names = p.evaluate(f'() => [...new Set({BUILT}.days.flatMap(d => (d.exercises || []).map(e => e.name)))]')
    c.ok(FROM not in names, 'the split has no Neutral-Grip Seated Cable Row')
    rows = sorted(n for n in names if 'row' in n.lower() and 'cable' in n.lower())
    c.eq(rows, [TO], 'its one cable row is the wide-bar row')
    for dn in (13, 29, 45, 61):
        e = p.evaluate(f'() => {{ const d = {DAY(dn, BUILT)}, i = d.exercises.findIndex(e => e.name === "{TO}"), e = d.exercises[i]; return e ? [i, e.id, e.sets, e.reps, e.restSeconds] : null; }}')
        c.eq(e, [6, NEW(dn), 3, '10-12', 75], 'Day %d: the wide-bar row in the same place, 3 x 10-12, 75 s rest' % dn)
    missing = p.evaluate(f'() => [...new Set({BUILT}.days.flatMap(d => (d.exercises || []).map(e => e.name)))].filter(n => !EXERCISE_DATABASE.some(x => x.name === n))')
    c.eq(missing, [], 'every exercise in the split is one from the exercise list')
    c.ok(p.evaluate('() => BUILTIN_PROGRAMS.find(x => x.id === "larry_scott_6day").days.some(d => d.exercises.some(e => e.name === "Neutral-Grip Seated Cable Row"))'), 'other programs keep their neutral-grip rows')

    # ---- a copy already on a phone (from 2.75.0 to 3.21.1)
    p.evaluate(f'''() => {{
      const pr = {PROG};
      const back = (dn) => {{ const d = pr.days.find(x => x.dayNumber === dn), i = d.exercises.findIndex(e => e.name === "{TO}"); d.exercises[i] = {{ id: "{ID}_d" + dn + "_neutral-grip-seated-cable-row", name: "{FROM}", sets: 3, reps: "10-12", restSeconds: 75, type: "standard" }}; return d; }};
      back(13); back(45); back(61);
      const d29 = back(29), e29 = d29.exercises.find(e => e.name === "{FROM}"); e29.origName = "{FROM}"; e29.name = "Seated Cable Row";   // swapped by hand
      const d45 = pr.days.find(x => x.dayNumber === 45), i45 = d45.exercises.findIndex(e => e.name === "{FROM}");
      d45.removed = [{{ idx: i45, ex: d45.exercises[i45] }}]; d45.exercises.splice(i45, 1);   // removed by hand
      pr.days.find(x => x.dayNumber === 61).exercises.push({{ id: "custom_1", name: "{TO}", sets: 2, reps: "15", restSeconds: 60, added: true }});   // already added by hand
      app.logs["{LOG(13, OLD(13), 0)}"] = {{ reps: "12", weight: "140", completed: true }};
      app.logs["{LOG(13, OLD(13), 1)}"] = {{ reps: "11", weight: "140", completed: true }};
      app.exNotes["{FROM}"] = "seat 4";
      delete app.settings.wideRowSplit; WorkoutStorage.setData(app.data);
    }}''')
    c.ok(FROM in p.evaluate(f'() => {DAY(13)}.exercises.map(e => e.name)'), 'set up: an old copy with the neutral-grip row')
    n = p.evaluate('() => PT.wideRowSplit.run()')
    c.eq(n, 4, 'changed once on each of the four days')
    d13 = p.evaluate(f'() => {{ const d = {DAY(13)}, i = d.exercises.findIndex(e => e.name === "{TO}"); return [i, d.exercises[i] && d.exercises[i].id, d.exercises.some(e => e.name === "{FROM}")]; }}')
    c.eq(d13, [6, NEW(13), False], 'Day 13: the wide-bar row, in the same place, with the program\'s id')
    lg = p.evaluate(f'() => [app.logs["{LOG(13, NEW(13), 0)}"], app.logs["{LOG(13, NEW(13), 1)}"], "{LOG(13, OLD(13), 0)}" in app.logs]')
    c.ok(lg[0] and lg[0]['weight'] == '140' and lg[1] and lg[1]['reps'] == '11' and not lg[2], 'sets already ticked on it move with it')
    c.eq(p.evaluate(f'() => {{ const e = {DAY(29)}.exercises[6]; return [e.name, e.origName, e.id]; }}'), ['Seated Cable Row', TO, NEW(29)], 'Day 29: your swap stays, and swaps back to the wide-bar row')
    c.eq(p.evaluate(f'() => {{ const d = {DAY(45)}; return [d.exercises.some(e => e.name === "{FROM}" || e.name === "{TO}"), d.removed[0].ex.name, d.removed[0].ex.id]; }}'), [False, TO, NEW(45)], 'Day 45: still removed; putting it back gives the wide-bar row')
    c.eq(p.evaluate(f'() => {DAY(61)}.exercises.filter(e => e.name === "{TO}" || e.name === "{FROM}").map(e => [e.name, e.sets])'), [[TO, 2]], 'Day 61: already had the wide-bar row, so no second one')
    c.eq(p.evaluate(f'() => app.exNotes["{FROM}"]'), 'seat 4', 'notes and history of the neutral-grip row are left alone')
    c.eq(p.evaluate('() => PT.wideRowSplit.run()'), 0, 'it only runs once')
    saved = p.evaluate(f'() => {{ const d = WorkoutStorage.getData ? WorkoutStorage.getData() : null; const pr = d && (d.programs || []).find(x => x.id === "{ID}"); return pr ? pr.days.find(x => x.dayNumber === 13).exercises.map(e => e.name) : null; }}')
    c.ok(saved is None or (TO in saved and FROM not in saved), 'and it is saved')

    # ---- on the workout screen
    p.evaluate(f'() => {{ const pr = {PROG}; app.selectProgram(pr, pr.days.find(d => d.dayNumber === 13), true); app.showView("workout"); }}'); p.wait_for_timeout(500)
    t = p.evaluate('() => document.getElementById("exercises-list-container").innerText')
    c.ok(TO in t and FROM not in t, 'Day 13 shows Cable Seated Rows (Wide Bar)')
    c.eq(p.errors, [], 'no errors')

sys.exit(c.done())
