"""2.93.0 My 6-Day Split runs 8 weeks: the program, the one-time update of a 6-week copy on a phone, progress kept, a description you wrote kept."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page

c = Checks('split8')
ID = 'my_6day_chest_back_legs_sharms'
PROG = f'app.data.programs.find(x => x.id === "{ID}")'

with page() as p:
    c.eq(p.evaluate(f'() => [{PROG}.weeks, PT.weeks.planOf({PROG}).W, {PROG}.weekPlan.map(g => g.weeks)]'), [8, 8, [[1, 3, 5, 7], [2, 4, 6, 8]]], 'the built-in program runs 8 weeks: Week A is 1, 3, 5, 7 and Week B 2, 4, 6, 8')
    c.ok(p.evaluate(f'() => {PROG}.tags.includes("8 Weeks") && !{PROG}.tags.includes("6 Weeks")'), 'the tag says 8 Weeks')
    c.ok(p.evaluate(f'() => /Saturday or Sunday/.test({PROG}.description) && /8 weeks of 8 days/.test({PROG}.description)'), 'the description says 8 weeks and to start on a Saturday or Sunday')
    c.eq(p.evaluate(f'() => {PROG}.days.filter(d => d.exercises.length).length * 4'), 48, '48 workouts over the 8 weeks')
    c.eq(p.evaluate(f'() => {{ const P = PT.weeks.planOf({PROG}); return P.byWeek[8].days.length && P.byWeek[8].days[P.byWeek[8].days.length - 1]; }}'), 16, 'the last day of week 8 is the Day 8 rest day')
    c.eq((8 * 8) % 7, 1, '64 days is 9 weeks and 1 day: the last day falls on the weekday you started')

def old_copy(p, desc):
    p.evaluate(f'''() => {{
      const pr = {PROG};
      pr.weeks = 6; pr.weekPlan[0].weeks = [1, 3, 5]; pr.weekPlan[1].weeks = [2, 4, 6];
      pr.tags = pr.tags.map(t => t === "8 Weeks" ? "6 Weeks" : t);
      pr.description = {desc!r};
      app.selectProgram(pr, null, true); app.activeProgram = pr;
      app.jumpToWeek(pr, 3); app.markDayDone(pr, 1);
      const sw = pr.days.find(d => d.dayNumber === 3).exercises[0]; sw.origName = sw.name; sw.name = "Arnold Press";
      delete app.settings.split8wk; WorkoutStorage.setData(app.data);
    }}''')

with page() as p:
    old_copy(p, 'A six-day split run as one program, over 6 weeks of 8 days, with two alternating weeks.')
    c.eq(p.evaluate(f'() => PT.weeks.planOf({PROG}).W'), 6, 'set up: the 6-week copy')
    r = p.evaluate('() => PT.split8.upgrade()')
    c.eq(r['done'], True, 'it is brought up to date')
    c.eq(p.evaluate(f'() => [{PROG}.weeks, PT.weeks.planOf({PROG}).W, {PROG}.weekPlan.map(g => g.weeks)]'), [8, 8, [[1, 3, 5, 7], [2, 4, 6, 8]]], 'now 8 weeks with the two groups')
    c.ok(p.evaluate(f'() => {PROG}.tags.includes("8 Weeks")'), 'the tag changed')
    c.ok(p.evaluate(f'() => /8 weeks of 8 days/.test({PROG}.description)'), 'the description that came with the program is replaced')
    c.eq(p.evaluate(f'() => {PROG}.days.find(d => d.dayNumber === 3).exercises[0].name'), 'Arnold Press', 'swaps are not touched')
    c.eq(p.evaluate(f'() => {{ const s = app.getProgState({PROG}); return [s.week, s.round || 1, s.done.slice()]; }}'), [3, 1, [1]], 'your progress (week 3, day 1 done) carries on')
    c.eq(p.evaluate('() => PT.split8.upgrade().done'), False, 'running it again changes nothing')
    c.ok(p.evaluate('() => !!app.settings.split8wk'), 'and it remembers it ran')
    c.eq(p.errors, [], 'no page errors')

with page() as p:
    old_copy(p, 'My own words about this split.')
    p.evaluate('() => PT.split8.upgrade()')
    c.eq(p.evaluate(f'() => {PROG}.description'), 'My own words about this split.', 'a description you wrote stays')
    c.eq(p.evaluate(f'() => {PROG}.weeks'), 8, 'but it still runs 8 weeks')
    c.eq(p.errors, [], 'no page errors')

with page() as p:
    p.evaluate('() => { app.data.programs = app.data.programs.filter(x => x.id !== "' + ID + '"); }')
    c.eq(p.evaluate('() => PT.split8.upgrade().done'), False, 'without the program it does nothing')
    c.eq(p.errors, [], 'no page errors')

c.done()
