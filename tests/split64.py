"""2.94.0 My 6-Day Split as one 64-day program (Day 1 to Day 64, no weeks): walking through it, and the one-time update of a copy already on a phone
(2.93.0 and older: 16 days or 7 days in two week groups, renumbered, logs / notes / progress moved with the days)."""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page

c = Checks('split64')
ID = 'my_6day_chest_back_legs_sharms'
PROG = f'app.data.programs.find(x => x.id === "{ID}")'
SHOTS = '/tmp/claude-0/-home-claude/395da5c4-9b49-54b4-93e4-f9926c59aa1c/scratchpad/'
ORDER = [1, 2, 3, 7, 4, 5, 6, 15, 8, 9, 10, 14, 11, 12, 13, 16]

# ---------------------------------------------------------------- the program itself
for w in (390, 360):
    with page(w=w, h=800) as p:
        c.eq(p.evaluate(f'() => PT.weeks.planOf({PROG})'), None, '%dpx: no week plan' % w)
        p.evaluate(f'() => {{ app.selectProgram({PROG}, null, true); app.activeProgram = {PROG}; }}')
        seq = []
        for i in range(48):
            d = p.evaluate(f'() => app.nextDayOf({PROG}).dayNumber')
            seq.append(d)
            p.evaluate(f'(n) => app.markDayDone({PROG}, n)', d)
        want = [n for n in range(1, 65) if n % 4]
        c.eq(seq, want, '%dpx: up next goes down the list: the 48 workouts in order, rest days are skipped over' % w)
        c.eq(p.evaluate(f'() => {{ const s = app.getProgState({PROG}); return [s.week, s.done.length]; }}'), [2, 0], '%dpx: after Day 63 the round is done and a new one starts' % w)
        c.eq(p.evaluate(f'() => app.nextDayOf({PROG}).dayNumber'), 1, '%dpx: back to Day 1' % w)
        p.evaluate(f'() => {{ app.activeDay = {PROG}.days[4]; app.showView("home"); app.renderHomeView(); }}')
        c.eq(p.evaluate('() => app.dom.homeActiveDayBadge.innerText'), 'Day 5 of 64', '%dpx: the Home card says Day 5 of 64' % w)
        p.evaluate(f'() => {{ app.showView("days"); app.renderDaysView(); }}'); p.wait_for_timeout(300)
        v = p.evaluate('() => [...app.dom.daysList.children].filter(c => c.dataset.day).map(c => [+c.dataset.day, (c.querySelector(".uppercase") || {}).textContent && c.querySelector(".uppercase").textContent.trim()])')
        c.eq(len(v), 64, '%dpx: the days list has all 64 days' % w)
        c.eq([x[0] for x in v], list(range(1, 65)), '%dpx: in order, Day 1 to Day 64' % w)
        c.ok(all(x[1] == 'Day %d' % x[0] for x in v if x[1]), '%dpx: the small label on each card is its own day number' % w)
        c.ok(p.evaluate('() => !/week/i.test(document.getElementById("days-week-row").innerText) && !document.getElementById("btn-set-week")'), '%dpx: the row under the title says workouts done, no week and no Switch week' % w)
        c.ok(p.evaluate('() => document.documentElement.scrollWidth <= innerWidth + 1'), '%dpx: no sideways scroll' % w)
        if w == 390: p.screenshot(path=SHOTS + 'split64.png')
        c.eq(p.errors, [], '%dpx: no page errors' % w)

# ---------------------------------------------------------------- a copy already on a phone
def old_copy(p, n_days=16, desc=None):
    p.evaluate(f'''() => {{
      const ID = "{ID}", O = {ORDER}, b = BUILTIN_PROGRAMS.find(x => x.id === ID), pr = {PROG};
      pr.days = JSON.parse(JSON.stringify(b.days.slice(0, 16))).map((d, i) => {{
        const n = d.dayNumber; d.dayNumber = O[i];
        d.exercises.forEach(e => {{ e.id = e.id.replace("_d" + n + "_", "_d" + O[i] + "_"); }});
        d.title = (i < 8 ? "W1 & W3 & W5 & W7" : "W2 & W4 & W6 & W8") + " - " + d.title.replace(/^Day \\d+:/, "Day " + (i + 1) + ":"); return d; }});
      if ({n_days} < 16) pr.days = pr.days.filter(d => d.dayNumber <= 7).map(d => d);
      pr.weekPlan = [{{ weeks: [1, 3, 5, 7], days: O.slice(0, 8), name: "Week A" }}, {{ weeks: [2, 4, 6, 8], days: O.slice(8), name: "Week B" }}];
      pr.weeks = 8; pr.baseDays = 8; pr.weekReset = true; pr.dayLabels = "week"; pr.tags = ["My Program", "8 Weeks"];
      pr.description = {json.dumps(desc)} || "A six-day split over 8 weeks of 8 days.";
      delete app.progState[ID]; delete app.settings.split64;
      app.selectProgram(pr, null, true); app.activeProgram = pr;
    }}''')

def exid(old, name):
    return f'{PROG}.days.find(d => d.dayNumber === {old}).exercises.find(e => e.name === "{name}").id'

with page() as p:
    old_copy(p)
    # old Day 4 (the 5th place: Chest & Back, Day 5 in the new list) with a ticked set, a swap on old Day 3, a note on old Day 5, progress in week 1
    p.evaluate(f'''() => {{
      const pr = {PROG}, d4 = pr.days.find(d => d.dayNumber === 4), e = d4.exercises[0];
      app.logs["{ID}_d4_" + e.id + "_s0"] = {{ weight: "120", reps: "8", completed: true }};
      app.logs["{ID}_d15_nothing_s0"] = {{ weight: "1", reps: "1", completed: false }};
      const sw = pr.days.find(d => d.dayNumber === 3).exercises[0]; sw.origName = sw.name; sw.name = "Arnold Press";
      app.dayNotes["{ID}_d5"] = "felt strong";
      const st = app.getProgState(pr); st.week = 1; st.done = [1, 2, 3]; st.skipped = [2];
      WorkoutStorage.setData(app.data); WorkoutStorage.saveLogs(app.logs); app.saveProgState();
    }}''')
    c.eq(p.evaluate(f'() => {PROG}.days.length'), 16, 'set up: the 16-day copy with two week groups')
    r = p.evaluate('() => PT.split64.upgrade()')
    c.eq(r['done'], True, 'it is brought up to date')
    c.eq(p.evaluate(f'() => {PROG}.days.map(d => d.dayNumber)'), list(range(1, 65)), 'the days are Day 1 to Day 64')
    c.ok(p.evaluate(f'() => !{PROG}.weekPlan && {PROG}.weeks === undefined && !{PROG}.dayLabels && {PROG}.weekReset === false'), 'the weeks are gone')
    c.eq(p.evaluate(f'() => {PROG}.days.map(d => d.exercises.length > 0)'), ([True] * 3 + [False] + [True] * 3 + [False]) * 8, '3 on, rest, 3 on, rest all the way')
    c.eq(p.evaluate(f'() => {PROG}.days.find(d => d.dayNumber === 3).exercises[0].name'), 'Arnold Press', 'a swap stays on its day')
    c.eq(p.evaluate(f'() => {PROG}.days.find(d => d.dayNumber === 5).exercises[0].id.startsWith("{ID}_d5_")'), True, 'old Day 4 is now Day 5 and its exercise ids say so')
    k = p.evaluate(f'() => Object.keys(app.logs).filter(k => k.startsWith("{ID}_d5_"))')
    c.eq(len(k), 1, 'the ticked set moved to Day 5')
    c.eq(p.evaluate(f'() => {{ const e = app.logs["{ID}_d5_" + {PROG}.days.find(d => d.dayNumber === 5).exercises[0].id + "_s0"]; return e && [e.weight, e.reps, e.completed]; }}'), ['120', '8', True], 'with its weight and reps')
    c.eq(p.evaluate(f'() => Object.keys(app.logs).filter(k => k.startsWith("{ID}_d4_")).length'), 0, 'and nothing is left under the old number')
    c.eq(p.evaluate('() => app.dayNotes["%s_d6"]' % ID), 'felt strong', 'the note on old Day 5 is now on Day 6')
    c.eq(p.evaluate(f'() => {{ const s = app.getProgState({PROG}); return [s.week, s.done.slice().sort((a, b) => a - b), (s.skipped || []).length]; }}'), [1, [1, 2, 3], 0], 'progress: Day 1-3 finished (the skipped list of a week group is cleared)')
    c.eq(p.evaluate(f'() => app.nextDayOf({PROG}).dayNumber'), 5, 'up next is Day 5')
    c.eq(len(set(p.evaluate(f'() => {PROG}.days.flatMap(d => d.exercises.map(e => e.id))'))), 472, 'all 472 exercise ids are unique')
    c.eq(p.evaluate('() => PT.split64.upgrade().done'), False, 'running it again changes nothing')
    c.ok(p.evaluate('() => !!app.settings.split64'), 'and it remembers it ran')
    c.ok(p.evaluate(f'() => /64 days/.test({PROG}.description)'), 'the description that came with the program is replaced')
    c.eq(p.errors, [], 'no page errors')

with page() as p:   # week 3 of the old program: the first 16 days are behind you
    old_copy(p)
    p.evaluate(f'''() => {{ const pr = {PROG}, st = app.getProgState(pr); st.week = 3; st.done = [1, 2]; app.saveProgState(); }}''')
    p.evaluate('() => PT.split64.upgrade()')
    c.eq(p.evaluate(f'() => app.getProgState({PROG}).done.slice().sort((a, b) => a - b)'), list(range(1, 17)) + [17, 18], 'week 3 with Day 1-2 done: Days 1-16 and 17, 18 are ticked')
    c.eq(p.evaluate(f'() => app.nextDayOf({PROG}).dayNumber'), 19, 'up next is Day 19 (the 3rd workout of the third block)')

with page() as p:   # a copy with a description and tags of its own, and the 7-day copy
    old_copy(p, 7, 'My own words about this split.')
    c.eq(p.evaluate(f'() => {PROG}.days.length'), 7, 'set up: a 7-day copy (no Week B)')
    p.evaluate('() => PT.split64.upgrade()')
    c.eq(p.evaluate(f'() => {PROG}.days.length'), 64, 'the 7-day copy gets all 64 days')
    c.eq(p.evaluate(f'() => {PROG}.description'), 'My own words about this split.', 'a description you wrote stays')
    c.eq(p.evaluate(f'() => {PROG}.days.slice(8, 16).map(d => d.exercises.length > 0)'), [True] * 3 + [False] + [True] * 3 + [False], 'the machine days (Week B) came from the program')
    c.eq(p.errors, [], 'no page errors')

with page() as p:   # a fresh phone: nothing to do; no program: nothing to do
    c.eq(p.evaluate('() => PT.split64.upgrade().done'), False, 'a fresh phone is already the 64-day program')
    p.evaluate('() => { app.data.programs = app.data.programs.filter(x => x.id !== "%s"); }' % ID)
    c.eq(p.evaluate('() => PT.split64.upgrade().done'), False, 'without the program it does nothing')
    c.eq(p.errors, [], 'no page errors')

c.done()
