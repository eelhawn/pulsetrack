"""My 6-day split: two alternating weeks, database names, same-machine order, every new week starts with the program's own exercises (2.74.0 / 2.75.0),
Switch week keeps what you finished in each week (2.87.0), and the days list shows only the week you are on (2.88.0)."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page, old8

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
    old8(p)
    # ---------------------------------------------------------------- the program itself
    c.eq(p.evaluate(f'() => {PROG}.weekReset'), True, 'the split is marked "original exercises back each week"')
    c.eq(p.evaluate(f'() => {PROG}.weeks'), 8, 'it runs 8 weeks')
    c.eq(p.evaluate(f'() => {PROG}.days.map(d => d.dayNumber)'), [1, 2, 3, 7, 4, 5, 6, 15, 8, 9, 10, 14, 11, 12, 13, 16], '16 days, in list order: Week A is days 1-7 and 15, Week B is days 8-14 and 16 (each week is 8 days with two rest days)')
    plan = p.evaluate(f'() => {{ const P = PT.weeks.planOf({PROG}); return P && [P.W, [1, 2, 3, 4, 5, 6, 7, 8].map(w => P.byWeek[w].days[0])]; }}')
    c.eq(plan, [8, [1, 8, 1, 8, 1, 8, 1, 8]], 'weeks 1, 3, 5, 7 use days 1-7 and weeks 2, 4, 6, 8 use days 8-14')
    c.eq(p.evaluate(f'() => {PROG}.weekPlan.map(g => g.weeks)'), [[1, 3, 5, 7], [2, 4, 6, 8]], 'the week plan has the two groups')
    bad = p.evaluate(f'() => [...new Set({PROG}.days.flatMap(d => d.exercises.map(e => e.name)))].filter(n => {{ const e = PT.exCanon(n); return !e || e.name !== n; }})')
    c.eq(bad, [], 'every exercise is spelled exactly like the exercise database (so last time\'s weight is found)')
    c.eq(p.evaluate(f'() => app.data.programs.filter(x => x.id !== "{ID}" && x.weekReset).length'), 0, 'no other program has the new-week reset')
    c.eq(p.evaluate(f'() => {PROG}.days.map(d => d.exercises.length)'), [8, 10, 11, 0, 9, 10, 11, 0, 8, 10, 11, 0, 9, 10, 11, 0], 'exercises per day in list order: 3 on, rest, 3 on, rest (Week B as sent)')
    c.eq(p.evaluate(f'() => {PROG}.days.map(d => d.exercises.reduce((n, e) => n + e.sets, 0))'), [26, 34, 37, 0, 29, 34, 36, 0, 27, 34, 37, 0, 31, 34, 37, 0], 'sets per day')
    c.eq(p.evaluate(f'() => new Set({PROG}.days.flatMap(d => d.exercises.map(e => e.id))).size'), 118, 'every exercise has its own id')
    # same machine / bar / bench: next to each other
    adj = lambda day, a, b: abs(p.evaluate(NAMES(day)).index(a) - p.evaluate(NAMES(day)).index(b)) == 1
    c.ok(adj(1, 'Lat Pulldown', 'Neutral-Grip (V-Bar) Lat Pulldown'), 'Week A day 1: lat pulldown and V-bar pulldown are together')
    c.eq(p.evaluate(f'() => {PROG}.days.filter(d => d.exercises.some(e => e.name === "Lat Pulldown")).map(d => [d.dayNumber, d.exercises[0].name])'), [[1, 'Lat Pulldown'], [4, 'Lat Pulldown'], [8, 'Lat Pulldown'], [11, 'Lat Pulldown']], 'every day that has a lat pulldown opens with it')
    c.eq(p.evaluate(NAMES(1))[:4], ['Lat Pulldown', 'Neutral-Grip (V-Bar) Lat Pulldown', 'Incline Bench Press', 'Decline Bench Press'], 'Week A day 1 opens with both pulldowns, then the two barbell presses')
    c.ok(adj(1, 'Incline Bench Press', 'Decline Bench Press'), 'Week A day 1: the two barbell presses are together')
    c.eq(p.evaluate(f'() => {PROG}.days.filter(d => d.exercises.some(e => e.name === "Straight-Arm Pulldown")).map(d => [d.dayNumber, d.exercises[d.exercises.length - 1].name])'), [[4, 'Straight-Arm Pulldown']], 'every day with a straight-arm pulldown ends with it')
    c.eq(p.evaluate(NAMES(4))[:2], ['Lat Pulldown', 'Incline Dumbbell Press'], 'Week A day 4 still opens with the lat pulldown, then the incline dumbbell press')
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
    p.evaluate(f'() => {{ const e = {PROG}.days.find(d => d.dayNumber === 4).exercises[0]; e.origName = e.name; e.name = "Pull-Ups"; app.getProgState({PROG}); WorkoutStorage.setData(app.data); }}')
    p.evaluate(f'() => app.jumpToWeek({PROG}, 3)'); p.evaluate(f'() => app.getProgState({PROG})')
    c.eq(p.evaluate(NAMES(4))[0], 'Pull-Ups', 'jumping to the week you are already in leaves it alone')
    p.evaluate(f'() => app.jumpToWeek({PROG}, 5)'); p.evaluate(f'() => app.getProgState({PROG})')
    c.eq(p.evaluate(STATE), [5, 1], 'jumped to week 5')
    c.eq(p.evaluate(NAMES(4)), base[4], 'Switch week to week 5: Week A is back the way the program has it')

    # ---------------------------------------------------------------- after week 6 it starts again
    p.evaluate(f'() => {{ app.jumpToWeek({PROG}, 8); app.getProgState({PROG}); const e = {PROG}.days.find(d => d.dayNumber === 11).exercises[0]; e.origName = e.name; e.name = "Pull-Ups"; const f = {PROG}.days[4].exercises[0]; f.origName = f.name; f.name = "Hack Squat"; }}')
    finish_week(p, 8)
    c.eq(p.evaluate(STATE), [1, 2], 'after week 8 it goes round again (week 1, round 2)')
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

# ---------------------------------------------------------------- 2.87.0: Switch week keeps what you finished in each week
def tap_week(p, w):                      # open the Switch week sheet and tap a week, like a finger
    p.evaluate('() => PT.weeks.openWeekSheet()'); p.wait_for_timeout(250)
    p.evaluate('(w) => document.querySelector(`#pt-wks [data-w="${w}"]`).click()', w); p.wait_for_timeout(450)
GRID = '() => Object.fromEntries([...document.querySelectorAll("#pt-wks [data-w]")].map(b => [b.dataset.w, [(b.className.match(/\\b(done|now|todo)\\b/) || [])[1], b.querySelector("small").textContent.trim()]]))'
with page() as p:
    old8(p)
    SNAP = f'() => {{ const d3 = {PROG}.days.find(d => d.dayNumber === 3), s = app.getProgState({PROG}); return {{ week: s.week, round: s.round || 1, done: s.done.slice(), d3logs: Object.keys(app.logs).filter(k => k.startsWith("{ID}_d3_")).length, d3first: d3.exercises[0].name, up: app.nextDayOf({PROG}).dayNumber, active: app.activeDay && app.activeDay.dayNumber }}; }}'
    p.evaluate(f'() => {{ app.selectProgram({PROG}, null, true); app.activeProgram = {PROG}; app.showView("days"); }}')
    # Day 1 and Day 2 are finished, Day 3 has three logged sets and a swapped exercise
    p.evaluate(f'() => {{ app.markDayDone({PROG}, 1); app.markDayDone({PROG}, 2); const d3 = {PROG}.days.find(d => d.dayNumber === 3), a = d3.exercises[0], b = d3.exercises[1]; a.name = "My Own Swap"; app.logs["{ID}_d3_" + a.id + "_s1"] = {{ weight: "100", reps: "10", done: true }}; app.logs["{ID}_d3_" + a.id + "_s2"] = {{ weight: "100", reps: "9", done: true }}; app.logs["{ID}_d3_" + b.id + "_s1"] = {{ weight: "50", reps: "12", done: true }}; WorkoutStorage.saveLogs(app.logs); WorkoutStorage.setData(app.data); }}')
    mine = {'week': 1, 'round': 1, 'done': [1, 2], 'd3logs': 3, 'd3first': 'My Own Swap', 'up': 3}
    got = lambda: {k: v for k, v in p.evaluate(SNAP).items() if k in mine}
    c.eq(got(), mine, 'start: week 1, Day 1 and Day 2 finished, Day 3 has 3 logged sets and a swap, up next is Day 3')
    tap_week(p, 1)
    c.eq(got(), mine, 'tapping the week you are on changes nothing')
    tap_week(p, 2)
    c.eq(p.evaluate(SNAP)['week'], 2, 'tapping week 2 goes to week 2')
    c.eq(p.evaluate(SNAP)['done'], [], 'week 2 starts with nothing finished')
    c.eq(p.evaluate(SNAP)['active'], 8, 'and its first workout is up next')
    p.evaluate('() => PT.weeks.openWeekSheet()'); p.wait_for_timeout(250)
    g = p.evaluate(GRID)
    c.eq(g['1'], ['todo', '2/6'], 'the grid shows week 1 as 2/6 (not as "done") while you are on week 2')
    c.eq(g['2'], ['now', 'now'], 'and week 2 as the week you are on')
    p.evaluate('() => document.querySelector("#pt-wks [data-w=\\"1\\"]").click()'); p.wait_for_timeout(450)
    c.eq(got(), mine, 'back on week 1: Day 1 and Day 2 are still finished, the 3 sets and the swap are still there, and Day 3 is up next')
    c.eq(p.evaluate(SNAP)['active'], 3, 'and Day 3 is the workout it opens')
    tap_week(p, 1); tap_week(p, 2); tap_week(p, 1); tap_week(p, 1)
    c.eq(got(), mine, 'going back and forth never skips ahead or resets anything')
    # a program you are only looking at: tapping its own week must not wipe it, and it becomes your current program
    other = p.evaluate(f'() => app.data.programs.find(x => x.id !== "{ID}" && x.id !== "freestyle").id')
    p.evaluate(f'() => {{ const o = app.data.programs.find(x => x.id === "{other}"); app.selectProgram(o, null, true); app.activeProgram = {PROG}; app.showView("days"); }}')
    c.eq(p.evaluate('() => PT.currentProgramId()'), other, 'another program is the current one, this one is only being looked at')
    tap_week(p, 1)
    c.eq(got(), mine, 'tapping the week you are on in a program you are only looking at keeps Day 1 and Day 2')
    c.eq(p.evaluate('() => PT.currentProgramId()'), ID, 'and makes it your current program')
    # a week you were already in keeps its edits; a week you never were in starts with the original exercises
    p.evaluate(f'() => {{ app.jumpToWeek({PROG}, 4); app.getProgState({PROG}); }}')
    p.evaluate(f'() => {{ const e = {PROG}.days.find(d => d.dayNumber === 11).exercises[0]; e.origName = e.name; e.name = "Week 4 Swap"; WorkoutStorage.setData(app.data); }}')
    tap_week(p, 1); tap_week(p, 4)
    c.eq(p.evaluate(f'() => {PROG}.days.find(d => d.dayNumber === 11).exercises[0].name'), 'Week 4 Swap', 'a swap made in week 4 is still there when you come back to week 4')
    c.eq(p.evaluate(SNAP)['week'], 4, 'and you are on week 4')
    p.evaluate(f'() => {{ const e = {PROG}.days.find(d => d.dayNumber === 12).exercises[0]; e.origName = e.name; e.name = "Never Visited Swap"; WorkoutStorage.setData(app.data); }}')
    tap_week(p, 8)
    c.ok(p.evaluate(f'() => {PROG}.days.find(d => d.dayNumber === 12).exercises[0].name') != 'Never Visited Swap', 'a week you were never in this round (week 8) still starts with the original exercises')
    # finishing a week clears its memory: it does not come back half done, and it does not skip on by itself
    tap_week(p, 1); tap_week(p, 2)
    p.evaluate(f'() => {{ [8, 9, 10, 11, 12, 13].forEach(n => app.markDayDone({PROG}, n)); }}')
    c.eq(p.evaluate(SNAP)['week'], 3, 'finishing all of week 2 moves on to week 3')
    tap_week(p, 2)
    c.eq([p.evaluate(SNAP)['week'], p.evaluate(SNAP)['done']], [2, []], 'going back to a week you finished starts it fresh and stays there (no skipping on)')
    # it is saved: after closing and reopening the app, each week still has its finished days
    tap_week(p, 1)
    # (weeks 1, 3 and 5 are the same seven days: going into week 3 for the first time put those days back to the original exercises, as it should)
    c.eq([p.evaluate(SNAP)['week'], p.evaluate(SNAP)['done']], [1, [1, 2]], 'week 1 again: Day 1 and Day 2 still finished')
    tap_week(p, 3)
    p.reload(); p.wait_for_timeout(1500)
    c.eq(p.evaluate(f'() => {{ const s = app.getProgState({PROG}); return [s.week, s.byWeek && s.byWeek["1"]]; }}'), [3, [1, 2]], 'after closing and reopening the app, week 1 still remembers Day 1 and Day 2')
    tap_week(p, 1)
    c.eq(p.evaluate(f'() => app.getProgState({PROG}).done'), [1, 2], 'and going back to it brings them back')
    # a new round starts clean
    p.evaluate(f'() => {{ app.jumpToWeek({PROG}, 8); app.getProgState({PROG}); [8, 9, 10, 11, 12, 13].forEach(n => app.markDayDone({PROG}, n)); }}')
    c.eq(p.evaluate(f'() => {{ const s = app.getProgState({PROG}); return [s.week, s.round, s.done, s.byWeek]; }}'), [1, 2, [], {}], 'finishing week 8 starts round 2 with nothing remembered')
    c.eq(p.errors, [], 'no page errors')

A8, B8 = [1, 2, 3, 7, 4, 5, 6, 15], [8, 9, 10, 14, 11, 12, 13, 16]
# ---------------------------------------------------------------- 2.88.0: the days list shows only the week you are on (Week A = weeks 1, 3, 5, 7; Week B = weeks 2, 4, 6, 8)
with page() as p:
    old8(p)
    VIS = '() => { const l = app.dom.daysList, shown = e => getComputedStyle(e).display !== "none"; return { days: [...l.children].filter(c => c.dataset.day && shown(c)).map(c => +c.dataset.day), headers: [...l.children].filter(c => c.dataset.weekHeader && shown(c)).map(c => c.textContent.replace(/\\s+/g, " ").trim()) }; }'
    p.evaluate(f'() => {{ app.selectProgram({PROG}, null, true); app.activeProgram = {PROG}; app.showView("days"); app.renderDaysView(); }}'); p.wait_for_timeout(400)
    v = p.evaluate(VIS)
    c.eq(v['days'], A8, 'week 1: only Week A\'s 8 days are listed in order (3 on, rest, 3 on, rest), Week B is hidden')
    c.eq(len(v['headers']), 1, 'and there is only one week heading')
    c.ok(v['headers'][0].startswith('Weeks 1, 3, 5 & 7') and 'now: week 1' in v['headers'][0], 'it is the Weeks 1, 3, 5 & 7 heading, marked as now')
    for w, days, head in [(2, B8, 'Weeks 2, 4, 6 & 8'), (3, A8, 'Weeks 1, 3, 5 & 7'), (4, B8, 'Weeks 2, 4, 6 & 8'), (5, A8, 'Weeks 1, 3, 5 & 7'), (6, B8, 'Weeks 2, 4, 6 & 8'), (7, A8, 'Weeks 1, 3, 5 & 7'), (8, B8, 'Weeks 2, 4, 6 & 8')]:
        tap_week(p, w)
        v = p.evaluate(VIS)
        c.eq(v['days'], days, 'week %d: only %s are listed' % (w, 'Week B\'s 8 days' if w % 2 == 0 else 'Week A\'s 8 days'))
        c.ok(len(v['headers']) == 1 and v['headers'][0].startswith(head) and 'now: week %d' % w in v['headers'][0], 'week %d: one heading, %s' % (w, head))
    c.eq(p.evaluate('() => document.documentElement.scrollWidth <= innerWidth'), True, 'no sideways scroll')
    # the "up next" workout is always one of the listed days, and finishing a week flips the list to the other set of days
    c.ok(p.evaluate(f'() => app.nextDayOf({PROG}).dayNumber') in p.evaluate(VIS)['days'], 'the up-next workout is one of the listed days')
    p.evaluate(f'() => {{ [8, 9, 10, 11, 12, 13].forEach(n => app.markDayDone({PROG}, n)); app.renderDaysView(); }}'); p.wait_for_timeout(300)
    c.eq(p.evaluate(VIS)['days'], A8, 'finishing week 8 starts the next round on week 1 and lists Week A again')
    # other programs with weeks keep listing every group
    other = p.evaluate('() => (app.data.programs.find(x => Array.isArray(x.weekPlan) && !x.weekReset) || {}).id')
    p.evaluate('(id) => { const o = app.data.programs.find(x => x.id === id); app.activeProgram = o; app.activeDay = o.days[0]; app.showView("days"); app.renderDaysView(); }', other); p.wait_for_timeout(400)
    c.eq(p.evaluate('() => [...app.dom.daysList.querySelectorAll("[data-pt-away]")].length'), 0, 'a program that is not the alternating split hides nothing')
    c.eq(p.evaluate('() => [...app.dom.daysList.querySelectorAll("[data-week-header]")].length'), 2, 'and still shows both of its week headings')
    c.eq(p.errors, [], 'no page errors')

c.done()
