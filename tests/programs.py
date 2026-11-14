"""Programs: the 6-day personal split (2.73.0); delete asks in the app's own dialog (2.67.0) and Undo brings it back; the merged Arnold and Ronnie Coleman programs (2.66.0)."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page

c = Checks('programs')
with page() as p:
    ids = p.evaluate('app.data.programs.map(x => x.id)')
    for pid in ['arnold_blueprint_8wk', 'ronnie_coleman_olympia_4day', 'ronnie_coleman_highrep_6day', 'ronnie_coleman_inspired_upper_lower_4day', 'ronnie_coleman_6on1off_split']:
        c.ok(pid in ids, 'program %s is on a fresh phone' % pid)
    c.ok('arnold_blueprint_mass_p1' not in ids and 'arnold_blueprint_cuts_phase2' not in ids, 'the two old Arnold phases are gone')
    c.eq(p.evaluate('app.data.programs.find(x => x.id === "arnold_blueprint_8wk").days.length'), 12, 'Arnold Blueprint has 12 days')
    c.eq(p.evaluate('PT.weeks.planOf(app.data.programs.find(x => x.id === "arnold_blueprint_8wk")).W'), 8, 'Arnold Blueprint runs 8 weeks')
    c.eq(p.evaluate('app.data.programs.find(x => x.id === "ronnie_coleman_6on1off_split").days.reduce((n, d) => n + d.exercises.length, 0)'), 54, 'Ronnie 6-on-1-off has 54 exercises')

    # ---- my own 6-day split (2.73.0): 6 weeks, 7 days, exactly the exercises and sets and reps given, every name known to the library
    mine = 'my_6day_chest_back_legs_sharms'
    c.ok(mine in ids, 'my 6-day split is on a fresh phone')
    prog = p.evaluate('(id) => app.data.programs.find(x => x.id === id)', mine)
    c.ok('weeks' not in prog and 'weekPlan' not in prog, 'it has no weeks: one long program')
    c.eq(p.evaluate('(id) => PT.weeks.planOf(app.data.programs.find(x => x.id === id))', mine), None, 'and no week plan')
    c.eq([d['dayNumber'] for d in prog['days']], list(range(1, 65)), 'Day 1 to Day 64, counted straight through')
    c.eq([d['title'].split(':')[0] for d in prog['days']][:9], ['Day %d' % i for i in range(1, 10)], 'the names count Day 1, 2, 3 ... too')
    c.eq(len(prog['days']), 64, '64 days: 8 blocks of 8, each 3 on, rest, 3 on, rest')
    c.eq([bool(d['exercises']) for d in prog['days']], ([True] * 3 + [False] + [True] * 3 + [False]) * 8, 'rest on the 4th and 8th day of every block')
    c.eq(len({e['id'] for d in prog['days'] for e in d['exercises']}), 480, 'every one of the 480 exercise ids is unique')
    c.ok(all(e['id'].startswith('%s_d%d_' % (mine, d['dayNumber'])) for d in prog['days'] for e in d['exercises']), 'each id carries its own day number')
    blocks = [[[e['name'] for e in d['exercises']] for d in prog['days'][8 * k:8 * k + 8]] for k in range(8)]
    c.ok(all(blocks[k] == blocks[k % 2] for k in range(8)), 'the odd blocks repeat the free-weight days and the even blocks the machine days')
    c.ok('64 days' in prog['description'] and 'Saturday or Sunday' in prog['description'], 'the description says 64 days and to start on a Saturday or Sunday')
    prog['days'] = prog['days'][:16]
    W = [d for d in prog['days'] if d['exercises']]
    c.eq([len(d['exercises']) for d in prog['days']][3::4], [0, 0, 0, 0], 'the 4th and 8th day of each week are rest days')
    c.eq([len(d['exercises']) for d in prog['days']], [9, 10, 11, 0, 10, 10, 11, 0, 8, 10, 11, 0, 9, 10, 11, 0], 'exercises per day')
    c.eq([sum(e['sets'] for e in d['exercises']) for d in prog['days']], [29, 34, 37, 0, 32, 34, 36, 0, 27, 34, 37, 0, 31, 34, 37, 0], 'sets per day')
    c.eq([[e['name'] for e in d['exercises']][i] for d, i in zip(W[:6], [0, 0, 0, 0, 0, 0])], ['Lat Pulldown', 'Seated Leg Curls', 'Dumbbell Shoulder Press', 'Lat Pulldown', 'Leg Extension', 'Smith Machine Overhead Press'], 'each day opens with the right lift')
    c.eq([[e['name'] for e in d['exercises']][-1] for d in W[:6]], ['Pec Deck', 'Decline Sit-Ups', 'Cable Wrist Curls', 'Straight-Arm Pulldown', 'Russian Twists', 'Behind-The-Back Barbell Wrist Curls'], 'each day ends with the right lift')
    c.eq(W[4]['exercises'][1]['reps'], '6-8', 'back squats are 6-8')
    c.eq([e['reps'] for e in W[3]['exercises'] if e['name'] == 'Deadlift'], ['5-6'], 'deadlift is 5-6')
    known = p.evaluate('() => { const m = new Set(); EXERCISE_DATABASE.forEach(e => { m.add(e.name.toLowerCase()); (e.aka || []).forEach(a => m.add(a.toLowerCase())); }); return [...m]; }')
    known = set(known)
    miss = sorted({e['name'] for d in prog['days'] for e in d['exercises'] if e['name'].lower() not in known})
    c.eq(miss, [], 'every exercise is in the library (by name or other name)')
    c.ok('Iso-Lateral Plate-Loaded Machine Dip' in p.evaluate('EXERCISE_DATABASE.map(e => e.name)'), 'the machine dip is in the library under its new name')
    

    # ---- delete: Keep it leaves everything; Delete removes, with an Undo toast that puts it back in the same place
    target = 'ronnie_coleman_highrep_6day'
    idx = ids.index(target)
    p.evaluate('app.showView("programs")')
    sel = '.pgx-pr[data-pid="%s"] .pgx-more' % target
    p.wait_for_selector(sel)
    p.click(sel); p.wait_for_selector('[data-act="delete"]'); p.click('[data-act="delete"]')
    p.wait_for_selector('#pt-dlg:not(.hidden)')
    txt = p.inner_text('#pt-dlg')
    c.ok('Delete this program?' in txt and 'Keep it' in txt and 'Delete' in txt, 'the delete question uses the app dialog: %r' % txt[:80])
    c.ok('add it back' in txt.lower(), 'a built-in says it can be added back')
    p.get_by_role('button', name='Keep it').click(); p.wait_for_timeout(250)
    c.ok(target in p.evaluate('app.data.programs.map(x => x.id)'), 'Keep it leaves the program')
    p.click(sel); p.wait_for_selector('[data-act="delete"]'); p.click('[data-act="delete"]')
    p.wait_for_selector('#pt-dlg:not(.hidden)')
    p.locator('#pt-dlg').get_by_role('button', name='Delete', exact=True).click(); p.wait_for_timeout(350)
    c.ok(target not in p.evaluate('app.data.programs.map(x => x.id)'), 'Delete removes it')
    c.ok(p.locator('#pt-toast-action').is_visible() and p.inner_text('#pt-toast-action').strip() == 'Undo', 'an Undo button is offered')
    p.click('#pt-toast-action'); p.wait_for_timeout(350)
    now = p.evaluate('app.data.programs.map(x => x.id)')
    c.eq(now.index(target) if target in now else -1, idx, 'Undo puts it back in the same place')
    c.eq(len(now), len(ids), 'nothing else changed')
    c.eq(p.errors, [], 'no page errors or console errors')
c.done()
