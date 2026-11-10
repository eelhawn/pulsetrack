"""My 6-day split: database names, and every new week starts with the program's own exercises (2.74.0)."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page

c = Checks('weeks')
ID = 'my_6day_chest_back_legs_sharms'
PROG = f'app.data.programs.find(x => x.id === "{ID}")'
NAMES = lambda day: f'() => {PROG}.days[{day - 1}].exercises.map(e => e.name)'
WORK = [1, 2, 3, 4, 5, 6]

def finish_week(p):
    for n in WORK:
        p.evaluate(f'() => app.markDayDone({PROG}, {n})')

with page() as p:
    c.eq(p.evaluate(f'() => {PROG}.weekReset'), True, 'the split is marked "original exercises back each week"')
    bad = p.evaluate(f'() => [...new Set({PROG}.days.flatMap(d => d.exercises.map(e => e.name)))].filter(n => {{ const e = PT.exCanon(n); return !e || e.name !== n; }})')
    c.eq(bad, [], 'every exercise is spelled exactly like the exercise database (so last time\'s weight is found)')
    c.eq(p.evaluate(f'() => app.data.programs.filter(x => x.id !== "{ID}" && x.weekReset).length'), 0, 'no other program has it switched on')
    p.evaluate(f'() => app.selectProgram({PROG}, null, true)')

    base = {n: p.evaluate(NAMES(n)) for n in range(1, 8)}
    c.eq(base[1][0], 'Incline Bench Press', 'Day 1 starts with Incline Bench Press')
    c.eq(base[5][1], 'Squat', 'Day 5 has Squat')

    # week 1: swap, delete, add, change sets on Day 1; swap on Day 3
    p.evaluate(f'''() => {{
      const d = {PROG}.days[0];
      d.exercises[0].origName = d.exercises[0].name; d.exercises[0].name = "Chest Press Machine"; d.exercises[1].sets = 9;
      const gone = d.exercises.splice(2, 1)[0]; d.removed = [{{ ex: JSON.parse(JSON.stringify(gone)), idx: 2 }}];
      d.exercises.push({{ id: "custom_1", name: "Cable Crossover", sets: 3, reps: "10", restSeconds: 60, added: true, type: "standard" }});
      const e = {PROG}.days[2].exercises[0]; e.origName = e.name; e.name = "Arnold Press";
      app.getProgState({PROG}); WorkoutStorage.setData(app.data);
    }}''')
    c.eq(p.evaluate(f'() => app.getProgState({PROG}).week'), 1, 'still week 1')
    c.eq(p.evaluate(NAMES(1))[0], 'Chest Press Machine', 'a swap stays for the rest of the week')
    p.evaluate(f'() => app.markDayDone({PROG}, 1)')
    p.evaluate(f'() => {{ app.getProgState({PROG}); app.getProgState({PROG}); }}')
    c.eq(p.evaluate(NAMES(1))[0], 'Chest Press Machine', 'finishing Day 1 does not undo the swap')
    p.evaluate(f'() => {{ app.markDayDone({PROG}, 2); app.markDayDone({PROG}, 3); app.markDayDone({PROG}, 4); app.markDayDone({PROG}, 5); }}')
    c.eq(p.evaluate(f'() => app.getProgState({PROG}).week'), 1, 'five of six done: still week 1')
    c.eq(p.evaluate(NAMES(3))[0], 'Arnold Press', 'Day 3 still swapped')
    p.evaluate(f'() => app.markDayDone({PROG}, 6)')
    c.eq(p.evaluate(f'() => app.getProgState({PROG}).week'), 2, 'finishing the last workout moves to week 2')
    for n in range(1, 8):
        c.eq(p.evaluate(NAMES(n)), base[n], f'week 2: Day {n} has the original exercises again')
    c.eq(p.evaluate(f'() => {PROG}.days[0].exercises[1].sets'), p.evaluate(f'() => app.originalExercises({PROG}, {PROG}.days[0])[1].sets'), 'edited sets are back to the program\'s')
    c.eq(p.evaluate(f'() => {PROG}.days[0].removed'), None, 'deleted exercises are back (nothing left in the deleted list)')
    c.eq(p.evaluate(f'() => {PROG}.days[0].exercises.some(e => e.added)'), False, 'added exercises are gone')
    c.eq(p.evaluate(f'() => {PROG}.days[2].exercises[0].origName'), None, 'no leftover "swapped from" note')

    # week 2: a swap made now is kept until the week ends, however often the screen redraws
    p.evaluate(f'() => {{ const e = {PROG}.days[1].exercises[0]; e.origName = e.name; e.name = "Leg Press"; app.getProgState({PROG}); app.getProgState({PROG}); WorkoutStorage.setData(app.data); }}')
    c.eq(p.evaluate(NAMES(2))[0], 'Leg Press', 'a swap in week 2 stays during week 2')

    # Switch week: going to another week starts it fresh, staying in the same week does not
    p.evaluate(f'() => app.jumpToWeek({PROG}, 2)')
    p.evaluate(f'() => app.getProgState({PROG})')
    c.eq(p.evaluate(NAMES(2))[0], 'Leg Press', 'jumping to the week you are already in leaves it alone')
    p.evaluate(f'() => app.jumpToWeek({PROG}, 4)')
    p.evaluate(f'() => app.getProgState({PROG})')
    c.eq(p.evaluate(f'() => app.getProgState({PROG}).week'), 4, 'jumped to week 4')
    c.eq(p.evaluate(NAMES(2)), base[2], 'Switch week to week 4: the originals are back')

    # after week 6 it starts again from week 1
    p.evaluate(f'() => {{ app.jumpToWeek({PROG}, 6); app.getProgState({PROG}); const e = {PROG}.days[3].exercises[0]; e.origName = e.name; e.name = "Pull-Ups"; }}')
    finish_week(p)
    st = p.evaluate(f'() => {{ const s = app.getProgState({PROG}); return [s.week, s.round]; }}')
    c.eq(st, [1, 2], 'after week 6 it goes round again (week 1, round 2)')
    c.eq(p.evaluate(NAMES(4)), base[4], 'and the originals are back')

    # the switch for "keep logged sets" is respected: logs of the new week's days are only wiped when it is on
    p.evaluate(f'() => {{ app.settings.resetAfterFinish = true; const d = {PROG}.days[0]; app.logs["{ID}_d1_" + d.exercises[0].id + "_s0"] = {{ weight: "50", reps: "8", done: true }}; }}')
    p.evaluate(f'() => app.jumpToWeek({PROG}, 3)')
    p.evaluate(f'() => app.getProgState({PROG})')
    c.eq(p.evaluate(f'() => Object.keys(app.logs).filter(k => k.startsWith("{ID}_d1_")).length'), 0, 'a new week starts with empty sets')
    p.evaluate(f'() => {{ app.settings.resetAfterFinish = false; const d = {PROG}.days[0]; app.logs["{ID}_d1_" + d.exercises[0].id + "_s0"] = {{ weight: "50", reps: "8", done: true }}; }}')
    p.evaluate(f'() => app.jumpToWeek({PROG}, 5)')
    p.evaluate(f'() => app.getProgState({PROG})')
    c.eq(p.evaluate(f'() => Object.keys(app.logs).filter(k => k.startsWith("{ID}_d1_")).length'), 1, 'with "keep logged sets" on, they stay')
    p.evaluate('() => { app.settings.resetAfterFinish = true; }')

    # a program that is not switched on is left alone
    other = 'frank_zane_upper_lower_4day'
    p.evaluate(f'() => {{ const pr = app.data.programs.find(x => x.id === "{other}"); const e = pr.days[0].exercises[0]; e.origName = e.name; e.name = "Zottman Curl"; app.getProgState(pr); }}')
    p.evaluate(f'() => {{ const pr = app.data.programs.find(x => x.id === "{other}"); app.getProgState(pr); }}')
    c.eq(p.evaluate(f'() => app.data.programs.find(x => x.id === "{other}").days[0].exercises[0].name'), 'Zottman Curl', 'other programs keep their swaps')

    c.eq(p.errors, [], 'no page errors')

# a copy of the split that is already on a phone: old spellings, no switch, weights stored under the old names
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
