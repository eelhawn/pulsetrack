"""My 6-day split: two alternating weeks, database names, same-machine order, and every new week starts with the program's own exercises (2.74.0 / 2.75.0)."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page

c = Checks('weeks')
ID = 'my_6day_chest_back_legs_sharms'
PROG = f'app.data.programs.find(x => x.id === "{ID}")'
NAMES = lambda day: f'() => {PROG}.days.find(d => d.dayNumber === {day}).exercises.map(e => e.name)'
STATE = f'() => {{ const s = app.getProgState({PROG}); return [s.week, s.round || 1]; }}'

def work(week):          # the six workouts of a week: Week A = days 1-6, Week B = days 8-13
    return list(range(1, 7)) if week % 2 else list(range(8, 14))

def finish_week(p, week):
    for n in work(week):
        p.evaluate(f'() => app.markDayDone({PROG}, {n})')

with page() as p:
    # ---------------------------------------------------------------- the program itself
    c.eq(p.evaluate(f'() => {PROG}.weekReset'), True, 'the split is marked "original exercises back each week"')
    c.eq(p.evaluate(f'() => {PROG}.weeks'), 6, 'it runs 6 weeks')
    c.eq(p.evaluate(f'() => {PROG}.days.map(d => d.dayNumber)'), list(range(1, 15)), '14 days: Week A is days 1-7, Week B is days 8-14')
    plan = p.evaluate(f'() => {{ const P = PT.weeks.planOf({PROG}); return P && [P.W, [1, 2, 3, 4, 5, 6].map(w => P.byWeek[w].days[0])]; }}')
    c.eq(plan, [6, [1, 8, 1, 8, 1, 8]], 'weeks 1, 3, 5 use days 1-7 and weeks 2, 4, 6 use days 8-14')
    c.eq(p.evaluate(f'() => {PROG}.weekPlan.map(g => g.weeks)'), [[1, 3, 5], [2, 4, 6]], 'the week plan has the two groups')
    bad = p.evaluate(f'() => [...new Set({PROG}.days.flatMap(d => d.exercises.map(e => e.name)))].filter(n => {{ const e = PT.exCanon(n); return !e || e.name !== n; }})')
    c.eq(bad, [], 'every exercise is spelled exactly like the exercise database (so last time\'s weight is found)')
    c.eq(p.evaluate(f'() => app.data.programs.filter(x => x.id !== "{ID}" && x.weekReset).length'), 0, 'no other program has the new-week reset')
    c.eq(p.evaluate(f'() => {PROG}.days.map(d => d.exercises.length)'), [9, 10, 12, 10, 10, 12, 0, 8, 10, 12, 9, 10, 11, 0], 'exercises per day (Week B as sent)')
    c.eq(p.evaluate(f'() => {PROG}.days.map(d => d.exercises.reduce((n, e) => n + e.sets, 0))'), [29, 34, 40, 32, 34, 39, 0, 27, 34, 40, 31, 34, 37, 0], 'sets per day')
    c.eq(p.evaluate(f'() => new Set({PROG}.days.flatMap(d => d.exercises.map(e => e.id))).size'), 123, 'every exercise has its own id')
    # same machine / bar / bench: next to each other
    adj = lambda day, a, b: abs(p.evaluate(NAMES(day)).index(a) - p.evaluate(NAMES(day)).index(b)) == 1
    c.ok(adj(1, 'Lat Pulldown', 'Neutral-Grip (V-Bar) Lat Pulldown'), 'Week A day 1: lat pulldown and V-bar pulldown are together')
    c.ok(adj(1, 'Incline Bench Press', 'Decline Bench Press'), 'Week A day 1: the two barbell presses are together')
    c.ok(adj(4, 'Lat Pulldown', 'Straight-Arm Pulldown'), 'Week A day 4: lat pulldown and straight-arm pulldown are together')
    c.ok(adj(8, 'Lat Pulldown', 'Reverse-Grip Lat Pulldown'), 'Week B day 1: lat pulldown and reverse-grip pulldown are together')
    c.ok(adj(11, 'Deadlift', 'Barbell Row') and adj(11, 'Incline Dumbbell Press', 'Dumbbell Bench Press'), 'Week B day 4: deadlift next to barbell row, the two dumbbell presses together')
    c.ok(adj(10, 'V-Bar Pushdown', 'Cable Overhead Extension') and adj(10, 'Cable Curls (EZ-Bar Attachment)', 'V-Bar Pushdown'), 'Week B day 3: the cable arm exercises are together')
    c.ok(adj(13, 'Machine Preacher Curls', 'Preacher Curls') and adj(13, 'Close-Grip Bench Press', 'Skull Crushers'), 'Week B day 6: both preacher curls together, close-grip bench next to skull crushers')
    c.eq(p.evaluate(NAMES(11))[0], 'Lat Pulldown', 'Week B day 4 still opens with the lat pulldown')
    c.eq(p.evaluate(f'() => {PROG}.days.find(d => d.dayNumber === 13).exercises.find(e => e.name === "Preacher Curls").notes'), 'Vertical pad.', 'the vertical pad preacher curl keeps its note')
    c.eq(p.evaluate(f'() => {PROG}.days.find(d => d.dayNumber === 10).exercises.slice(-1)[0].notes'), 'Palms up (supinated) and palms down (pronated).', 'wrist curls keep supinated / pronated')
    p.evaluate(f'() => app.selectProgram({PROG}, null, true)')

    base = {n: p.evaluate(NAMES(n)) for n in range(1, 15)}

    # ---------------------------------------------------------------- week 1: swap, delete, add, change sets
    p.evaluate(f'''() => {{
      const d = {PROG}.days[0];
      d.exercises[0].origName = d.exercises[0].name; d.exercises[0].name = "Chest Press Machine"; d.exercises[1].sets = 9;
      const gone = d.exercises.splice(2, 1)[0]; d.removed = [{{ ex: JSON.parse(JSON.stringify(gone)), idx: 2 }}];
      d.exercises.push({{ id: "custom_1", name: "Cable Crossover", sets: 3, reps: "10", restSeconds: 60, added: true, type: "standard" }});
      const e = {PROG}.days[2].exercises[0]; e.origName = e.name; e.name = "Arnold Press";
      app.getProgState({PROG}); WorkoutStorage.setData(app.data);
    }}''')
    c.eq(p.evaluate(STATE), [1, 1], 'week 1')
    c.eq(p.evaluate(NAMES(1))[0], 'Chest Press Machine', 'a swap stays for the rest of the week')
    p.evaluate(f'() => {{ app.markDayDone({PROG}, 1); app.getProgState({PROG}); app.getProgState({PROG}); }}')
    c.eq(p.evaluate(NAMES(1))[0], 'Chest Press Machine', 'finishing Day 1 does not undo the swap')
    for n in (2, 3, 4, 5): p.evaluate(f'() => app.markDayDone({PROG}, {n})')
    c.eq(p.evaluate(STATE), [1, 1], 'five of six done: still week 1')
    p.evaluate(f'() => app.markDayDone({PROG}, 6)')
    c.eq(p.evaluate(STATE), [2, 1], 'finishing the last workout moves to week 2')
    c.eq(p.evaluate(f'() => app.nextDayOf({PROG}).dayNumber'), 8, 'week 2 is Week B: up next is day 8')
    for n in range(8, 15):
        c.eq(p.evaluate(NAMES(n)), base[n], f'week 2: Week B day {n} is as the program has it')
    # a swap in week 2 stays during week 2
    p.evaluate(f'() => {{ const e = {PROG}.days.find(d => d.dayNumber === 9).exercises[0]; e.origName = e.name; e.name = "Leg Press"; app.getProgState({PROG}); app.getProgState({PROG}); WorkoutStorage.setData(app.data); }}')
    c.eq(p.evaluate(NAMES(9))[0], 'Leg Press', 'a swap in week 2 stays during week 2')
    c.eq(p.evaluate(NAMES(1))[0], 'Chest Press Machine', 'Week A is not touched while you are in Week B')
    finish_week(p, 2)
    c.eq(p.evaluate(STATE), [3, 1], 'week 3')
    c.eq(p.evaluate(f'() => app.nextDayOf({PROG}).dayNumber'), 1, 'week 3 is Week A again: up next is day 1')
    for n in range(1, 8):
        c.eq(p.evaluate(NAMES(n)), base[n], f'week 3: Week A day {n} has the original exercises again')
    c.eq(p.evaluate(f'() => {PROG}.days[0].exercises[1].sets'), p.evaluate(f'() => app.originalExercises({PROG}, {PROG}.days[0])[1].sets'), 'edited sets are back to the program\'s')
    c.eq(p.evaluate(f'() => {PROG}.days[0].removed'), None, 'deleted exercises are back (nothing left in the deleted list)')
    c.eq(p.evaluate(f'() => {PROG}.days[0].exercises.some(e => e.added)'), False, 'added exercises are gone')
    c.eq(p.evaluate(f'() => {PROG}.days[2].exercises[0].origName'), None, 'no leftover "swapped from" note')

    # ---------------------------------------------------------------- Switch week
    p.evaluate(f'() => {{ const e = {PROG}.days[3].exercises[0]; e.origName = e.name; e.name = "Pull-Ups"; app.getProgState({PROG}); WorkoutStorage.setData(app.data); }}')
    p.evaluate(f'() => app.jumpToWeek({PROG}, 3)'); p.evaluate(f'() => app.getProgState({PROG})')
    c.eq(p.evaluate(NAMES(4))[0], 'Pull-Ups', 'jumping to the week you are already in leaves it alone')
    p.evaluate(f'() => app.jumpToWeek({PROG}, 5)'); p.evaluate(f'() => app.getProgState({PROG})')
    c.eq(p.evaluate(STATE), [5, 1], 'jumped to week 5')
    c.eq(p.evaluate(NAMES(4)), base[4], 'Switch week to week 5: Week A is back the way the program has it')

    # ---------------------------------------------------------------- after week 6 it starts again
    p.evaluate(f'() => {{ app.jumpToWeek({PROG}, 6); app.getProgState({PROG}); const e = {PROG}.days.find(d => d.dayNumber === 11).exercises[0]; e.origName = e.name; e.name = "Pull-Ups"; const f = {PROG}.days[4].exercises[0]; f.origName = f.name; f.name = "Hack Squat"; }}')
    finish_week(p, 6)
    c.eq(p.evaluate(STATE), [1, 2], 'after week 6 it goes round again (week 1, round 2)')
    c.eq(p.evaluate(NAMES(5)), base[5], 'and the originals are back')
    c.eq(p.evaluate(NAMES(11))[0], 'Pull-Ups', 'Week B keeps its swap until it comes round again')

    # ---------------------------------------------------------------- "Finish keeps logged sets"
    p.evaluate(f'() => {{ app.settings.resetAfterFinish = true; const d = {PROG}.days[0]; app.logs["{ID}_d1_" + d.exercises[0].id + "_s0"] = {{ weight: "50", reps: "8", completed: true }}; }}')
    p.evaluate(f'() => app.jumpToWeek({PROG}, 3)'); p.evaluate(f'() => app.getProgState({PROG})')
    c.eq(p.evaluate(f'() => Object.keys(app.logs).filter(k => k.startsWith("{ID}_d1_")).length'), 0, 'a new week starts with empty sets')
    p.evaluate(f'() => {{ app.settings.resetAfterFinish = false; const d = {PROG}.days[0]; app.logs["{ID}_d1_" + d.exercises[0].id + "_s0"] = {{ weight: "50", reps: "8", completed: true }}; }}')
    p.evaluate(f'() => app.jumpToWeek({PROG}, 5)'); p.evaluate(f'() => app.getProgState({PROG})')
    c.eq(p.evaluate(f'() => Object.keys(app.logs).filter(k => k.startsWith("{ID}_d1_")).length'), 1, 'with "keep logged sets" on, they stay')
    p.evaluate('() => { app.settings.resetAfterFinish = true; }')

    # ---------------------------------------------------------------- other programs
    other = 'frank_zane_upper_lower_4day'
    p.evaluate(f'() => {{ const pr = app.data.programs.find(x => x.id === "{other}"); const e = pr.days[0].exercises[0]; e.origName = e.name; e.name = "Zottman Curl"; app.getProgState(pr); app.getProgState(pr); }}')
    c.eq(p.evaluate(f'() => app.data.programs.find(x => x.id === "{other}").days[0].exercises[0].name'), 'Zottman Curl', 'other programs keep their swaps')
    c.eq(p.errors, [], 'no page errors')

# ---------------------------------------------------------------- a copy already on a phone (2.73.0 / 2.74.0): 7 days, old order, old names, one week group
OLD1 = ['Incline Bench Press', 'Lat Pulldown', 'Dumbbell Bench Press', 'Dumbbell Row', 'Decline Bench Press', 'Neutral-Grip (V-Bar) Lat Pulldown', 'Chest Dips', 'Barbell Row', 'Pec Deck']
OLD4 = ['Lat Pulldown', 'Incline Dumbbell Press', 'Deadlift', 'Smith Machine Flat Press', 'Iso-Lateral Plate-Loaded Low Row', 'Decline Bench Press', 'Cable Seated Rows (Wide Bar)', 'Machine Chest Dips', 'Straight-Arm Pulldown', 'Incline Dumbbell Flyes']
with page() as p:
    p.evaluate(f'''() => {{
      const pr = {PROG}, b = JSON.parse(JSON.stringify(pr));
      const old = (n, order) => {{ const d = b.days.find(x => x.dayNumber === n); const by = new Map(d.exercises.map(e => [e.name, e])); return order.map((nm, i) => Object.assign({{}}, by.get(nm), {{ id: "{ID}_d" + n + "_e" + (i + 1) }})); }};
      pr.days = b.days.filter(d => d.dayNumber <= 7).map(d => JSON.parse(JSON.stringify(d)));
      pr.days[0].exercises = old(1, {OLD1}); pr.days[3].exercises = old(4, {OLD4});
      pr.days.forEach(d => {{ if (d.dayNumber !== 1 && d.dayNumber !== 4) d.exercises.forEach((e, i) => {{ e.id = "{ID}_d" + d.dayNumber + "_e" + (i + 1); }}); d.title = d.title.replace(/^W\\d( & W\\d)* - /, ""); }});
      pr.weekPlan = [{{ weeks: [1, 2, 3, 4, 5, 6], days: [1, 2, 3, 4, 5, 6, 7] }}];
      pr.description = "A six-day split. It runs 6 weeks: the same workouts every week, adding weight.";
      // a set already ticked on Day 1's second exercise (Lat Pulldown) and on Day 4's first (Lat Pulldown); Day 3 has a swap
      app.logs["{ID}_d1_{ID}_d1_e2_s0"] = {{ weight: "100", reps: "9", completed: true }};
      app.logs["{ID}_d4_{ID}_d4_e1_s1"] = {{ weight: "110", reps: "11", completed: true }};
      app.logs["{ID}_d1_{ID}_d1_e1_s0"] = {{ weight: "60", reps: "7", completed: true }};
      pr.days[2].exercises[0].origName = pr.days[2].exercises[0].name; pr.days[2].exercises[0].name = "Arnold Press";
      WorkoutStorage.setData(app.data); WorkoutStorage.saveLogs(app.logs);
    }}''')
    c.eq(p.evaluate(f'() => {PROG}.days.length'), 7, 'set up: the old 7-day copy')
    res = p.evaluate('() => PT.split2.upgrade()')
    c.eq(res['done'], True, 'the old copy is brought up to date')
    c.eq(p.evaluate(f'() => {PROG}.days.length'), 14, 'Week B was added: 14 days')
    c.eq(p.evaluate(f'() => {PROG}.weekPlan.map(g => g.weeks)'), [[1, 3, 5], [2, 4, 6]], 'with the two-group week plan')
    c.eq(p.evaluate(NAMES(1)), p.evaluate(f'() => BUILTIN_PROGRAMS.find(x => x.id === "{ID}").days[0].exercises.map(e => e.name)'), 'day 1 (never changed) takes the new order')
    c.eq(p.evaluate(NAMES(4)), p.evaluate(f'() => BUILTIN_PROGRAMS.find(x => x.id === "{ID}").days[3].exercises.map(e => e.name)'), 'day 4 (never changed) takes the new order')
    c.eq(p.evaluate(NAMES(3))[0], 'Arnold Press', 'day 3 (swapped) is left exactly as it was')
    c.eq(res['kept'], 1, 'one day was left alone')
    c.eq(p.evaluate(f'() => Object.keys(app.logs).filter(k => k.startsWith("{ID}_d1_")).sort()'), [f'{ID}_d1_{ID}_d1_incline-bench-press_s0', f'{ID}_d1_{ID}_d1_lat-pulldown_s0'], 'ticked sets followed their exercise to its new place')
    c.eq(p.evaluate(f'() => app.logs["{ID}_d1_{ID}_d1_lat-pulldown_s0"].weight'), '100', 'with their numbers')
    c.eq(p.evaluate(f'() => app.logs["{ID}_d4_{ID}_d4_lat-pulldown_s1"].weight'), '110', 'on day 4 too')
    c.ok(p.evaluate(f'() => /^W1 & W3 & W5 - /.test({PROG}.days[0].title)'), 'day titles say which weeks they are for')
    c.ok(p.evaluate(f'() => /Week A/.test(BUILTIN_PROGRAMS.find(x => x.id === "{ID}").description) && {PROG}.description.includes("two alternating weeks")'), 'the description is the new one')
    c.eq(p.evaluate('() => PT.split2.upgrade().done'), False, 'and it only happens once')
    # the swapped day heals itself when its week comes round
    p.evaluate(f'() => {{ app.jumpToWeek({PROG}, 2); app.getProgState({PROG}); app.jumpToWeek({PROG}, 3); app.getProgState({PROG}); }}')
    c.eq(p.evaluate(NAMES(3)), p.evaluate(f'() => BUILTIN_PROGRAMS.find(x => x.id === "{ID}").days[2].exercises.map(e => e.name)'), 'at week 3 the swapped day is back to the program\'s')
    c.eq(p.errors, [], 'no page errors')

# ---------------------------------------------------------------- 2.74.0: an even older copy: old spellings, no switch, weights stored under the old names
with page() as p:
    p.evaluate(f'''() => {{
      const pr = {PROG};
      const alias = {{ "Incline Bench Press": "Incline Barbell Press", "Leg Extension": "Leg Extensions", "Triceps Pushdown": "Tricep Pushdown", "Squat": "Barbell Back Squats" }};
      pr.days.forEach(d => d.exercises.forEach(e => {{ if (alias[e.name]) e.name = alias[e.name]; }}));
      delete pr.weekReset;
      app.lastPerf["Incline Barbell Press"] = [{{ weight: "80", reps: "8" }}, {{ weight: "80", reps: "7" }}];
      app.lastPerf["Barbell Back Squats"] = [{{ weight: "100", reps: "6" }}];
      app.lastPerf["Squat"] = [{{ weight: "90", reps: "5" }}];
      app.sessions.push({{ id: "t1", date: "2026-11-08", ts: Date.parse("2026-11-08T12:00:00"), ex: [{{ id: "x", name: "Incline Barbell Press", sets: [{{ w: 80, r: 8 }}, {{ w: 80, r: 7 }}] }}] }});
      WorkoutStorage.saveLastPerf(app.lastPerf); WorkoutStorage.setData(app.data); app.saveSessions();
    }}''')
    res = p.evaluate('() => PT.split.upgrade()')
    c.ok(res['renamed'] >= 4, 'the old spellings are found and renamed')
    c.eq(res['flag'], True, 'the switch is turned on for the copy that was already there')
    c.eq(p.evaluate(f'() => {PROG}.weekReset'), True, 'and kept')
    c.eq(p.evaluate(NAMES(1))[0], 'Incline Bench Press', 'Incline Barbell Press is now Incline Bench Press')
    c.eq(p.evaluate('() => (app.lastPerf["Incline Bench Press"] || []).map(x => [String(x.weight), String(x.reps)])'), [['80', '8'], ['80', '7']], 'last time\'s weights followed the rename')
    c.eq(p.evaluate('() => app.lastPerf["Incline Barbell Press"]'), None, 'and the old name is gone')
    c.eq(p.evaluate('() => app.lastPerf["Squat"][0].weight'), '90', 'a weight already stored under the new name is not overwritten')
    c.eq(p.evaluate('() => app.sessions.find(s => s.id === "t1").ex[0].name'), 'Incline Bench Press', 'saved workouts follow too')
    c.eq(p.evaluate('() => PT.split.upgrade().renamed'), 0, 'and it only happens once')
    c.eq(p.errors, [], 'no page errors')
c.done()
