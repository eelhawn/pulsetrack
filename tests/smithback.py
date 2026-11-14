"""2.99.0 the Smith Machine Decline Press is back on Day 13, 29, 45 and 61 of My 6-Day Split: in the program, and put back once on a phone copy."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page

c = Checks('smithback')
ID = 'my_6day_chest_back_legs_sharms'
PROG = f'app.data.programs.find(x => x.id === "{ID}")'
NAMES = lambda dn: f'{PROG}.days.find(d => d.dayNumber === {dn}).exercises.map(e => e.name)'

with page() as p:
    for dn in (13, 29, 45, 61):
        n = p.evaluate('() => ' + NAMES(dn).replace(PROG, f'BUILTIN_PROGRAMS.find(x => x.id === "{ID}")'))
        c.ok('Smith Machine Decline Press' in n and n.index('Smith Machine Decline Press') == n.index('Barbell Row') + 1, 'Day %d has it again, right after the Barbell Row' % dn)
    # a phone copy from 2.95.0-2.98.0: taken out of the four days; Day 45 got it back by hand at the end
    p.evaluate(f'''() => {{
      const pr = {PROG};
      [13, 29, 45, 61].forEach(dn => {{ const d = pr.days.find(x => x.dayNumber === dn); d.exercises = d.exercises.filter(e => e.name !== "Smith Machine Decline Press"); }});
      const d45 = pr.days.find(x => x.dayNumber === 45); d45.exercises.push({{ id: "mine1", name: "Smith Machine Decline Press", sets: 4, reps: "6", restSeconds: 120 }});
      const d13 = pr.days.find(x => x.dayNumber === 13); d13.orig = JSON.parse(JSON.stringify(d13.exercises));
      delete app.settings.smithDeclineBack; WorkoutStorage.setData(app.data);
    }}''')
    c.ok('Smith Machine Decline Press' not in p.evaluate('() => ' + NAMES(13)), 'set up: a copy without it')
    c.eq(p.evaluate('() => PT.smithBack.run()'), 3, 'put back on 3 days (Day 45 already had it)')
    n13 = p.evaluate('() => ' + NAMES(13))
    c.eq(n13.index('Smith Machine Decline Press'), n13.index('Barbell Row') + 1, 'in its old place, after the Barbell Row')
    c.eq(p.evaluate(f'() => {{ const e = {PROG}.days.find(d => d.dayNumber === 13).exercises.find(e => e.name === "Smith Machine Decline Press"); return [e.sets, e.reps, e.id]; }}'), [3, '8-10', ID + '_d13_smith-machine-decline-press'], '3 sets of 8-10, with its own id')
    c.ok('Smith Machine Decline Press' in p.evaluate(f'() => {PROG}.days.find(d => d.dayNumber === 13).orig.map(e => e.name)'), 'and in the put-it-back copy')
    c.eq(p.evaluate(f'() => {PROG}.days.find(d => d.dayNumber === 45).exercises.filter(e => e.name === "Smith Machine Decline Press").map(e => e.sets)'), [4], 'Day 45 keeps the one you added (once, your sets)')
    c.eq(p.evaluate('() => PT.smithBack.run()'), 0, 'it only runs once')
    c.eq(p.errors, [], 'no page errors')

c.done()
