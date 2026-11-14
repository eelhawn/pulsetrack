"""2.94.1 days done: a copy that says 57 days done when 4 were done is repaired from the ticked sets; Jump to day."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page

c = Checks('daysdone')
ID = 'my_6day_chest_back_legs_sharms'
PROG = f'app.data.programs.find(x => x.id === "{ID}")'

def tick(p, n):
    p.evaluate(f'''(n) => {{ const d = {PROG}.days.find(x => x.dayNumber === n);
      d.exercises.forEach(ex => {{ for (let s = 0; s < ex.sets; s++) app.logs[app.getLogKey("{ID}", n, ex.id, s)] = {{ weight: "50", reps: "8", completed: true, tag: "R" }}; }}); }}''', n)

with page() as p:
    p.evaluate(f'() => {{ app.selectProgram({PROG}, null, true); app.activeProgram = {PROG}; }}')
    for n in (1, 2, 3, 5): tick(p, n)
    # a half-done day 6 does not count
    p.evaluate(f'''() => {{ const d = {PROG}.days.find(x => x.dayNumber === 6), ex = d.exercises[0]; app.logs[app.getLogKey("{ID}", 6, ex.id, 0)] = {{ weight: "50", reps: "8", completed: true, tag: "R" }}; }}''')
    p.evaluate(f'() => {{ const st = app.getProgState({PROG}); st.week = 1; st.done = Array.from({{ length: 57 }}, (_, i) => i + 1); delete app.settings.split64fix; app.saveProgState(); }}')
    r = p.evaluate('() => PT.split64fix.repair()')
    c.eq([r['done'], r['was'], r['now']], [True, 57, 5], '57 "done" becomes the 4 workouts really finished plus the rest day between them (5 days)')
    c.eq(p.evaluate(f'() => app.getProgState({PROG}).done.slice().sort((a, b) => a - b)'), [1, 2, 3, 4, 5], 'Days 1, 2, 3, 5 and the Day 4 rest day')
    c.eq(p.evaluate(f'() => app.nextDayOf({PROG}).dayNumber'), 6, 'up next is Day 6 (it has only one set ticked)')
    c.eq(p.evaluate('() => PT.split64fix.repair().done'), True, 'it can be run again (same answer)')
    c.ok(p.evaluate('() => !!app.settings.split64fix'), 'and it remembers it ran')
    # jump to day
    p.evaluate(f'() => {{ app.showView("days"); app.renderDaysView(); }}'); p.wait_for_timeout(300)
    c.ok(p.evaluate('() => !!document.getElementById("btn-jump-day") && !document.getElementById("btn-set-week")'), 'the days list has Jump to day and no Switch week')
    c.eq(p.evaluate('() => document.getElementById("days-week-row").innerText.replace(/\\s+/g, " ")').startswith('4/48 workouts done'), True, 'and says 4/48 workouts done')
    p.evaluate('() => PT.split64fix.jump(20)')
    c.eq(p.evaluate(f'() => [app.getProgState({PROG}).done.length, app.nextDayOf({PROG}).dayNumber]'), [19, 21], 'Jump to day 20: Days 1-19 done, up next is Day 21 (Day 20 is a rest day)')
    p.evaluate('() => PT.split64fix.jump(1)')
    c.eq(p.evaluate(f'() => [app.getProgState({PROG}).done.length, app.nextDayOf({PROG}).dayNumber]'), [0, 1], 'Jump to day 1 starts over')
    c.eq(p.errors, [], 'no page errors')

with page(w=360, h=800) as p:   # the button through the screen
    p.evaluate(f'() => {{ app.selectProgram({PROG}, null, true); app.activeProgram = {PROG}; app.showView("days"); app.renderDaysView(); }}'); p.wait_for_timeout(300)
    p.answers = [] if hasattr(p, 'answers') else None
    c.ok(p.evaluate('() => document.documentElement.scrollWidth <= innerWidth + 1'), '360px: no sideways scroll')
    bt = p.evaluate('() => { const r = document.getElementById("btn-jump-day").getBoundingClientRect(); return [r.right <= innerWidth, r.height >= 20]; }')
    c.eq(bt, [True, True], '360px: the button fits')
    c.eq(p.evaluate('() => PT.split64fix.repair().done'), True, 'a fresh copy: nothing is made up (0 days done)')
    c.eq(p.evaluate(f'() => app.getProgState({PROG}).done.length'), 0, 'and it stays 0')
    c.eq(p.errors, [], 'no page errors')

c.done()
