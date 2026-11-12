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
    c.eq(prog['weeks'], 6, 'it runs 6 weeks')
    c.eq(p.evaluate('(id) => PT.weeks.planOf(app.data.programs.find(x => x.id === id)).W', mine), 6, 'the week plan says 6 weeks')
    c.eq(len(prog['days']), 14, '14 days: Week A (1-7) and Week B (8-14), each ending in a rest day')
    c.eq([len(d['exercises']) for d in prog['days']], [9, 10, 11, 10, 10, 11, 0, 8, 10, 11, 9, 10, 11, 0], 'exercises per day')
    c.eq([sum(e['sets'] for e in d['exercises']) for d in prog['days']], [29, 34, 37, 32, 34, 36, 0, 27, 34, 37, 31, 34, 37, 0], 'sets per day')
    c.eq([[e['name'] for e in d['exercises']][i] for d, i in zip(prog['days'][:6], [0, 0, 0, 0, 0, 0])], ['Lat Pulldown', 'Seated Leg Curls', 'Dumbbell Shoulder Press', 'Lat Pulldown', 'Leg Extension', 'Smith Machine Overhead Press'], 'each day opens with the right lift')
    c.eq([[e['name'] for e in d['exercises']][-1] for d in prog['days'][:6]], ['Pec Deck', 'Decline Sit-Ups', 'Cable Wrist Curls', 'Straight-Arm Pulldown', 'Russian Twists', 'Behind-The-Back Barbell Wrist Curls'], 'each day ends with the right lift')
    c.eq(prog['days'][4]['exercises'][1]['reps'], '6-8', 'back squats are 6-8')
    c.eq([e['reps'] for e in prog['days'][3]['exercises'] if e['name'] == 'Deadlift'], ['5-6'], 'deadlift is 5-6')
    known = p.evaluate('() => { const m = new Set(); EXERCISE_DATABASE.forEach(e => { m.add(e.name.toLowerCase()); (e.aka || []).forEach(a => m.add(a.toLowerCase())); }); return [...m]; }')
    known = set(known)
    miss = sorted({e['name'] for d in prog['days'] for e in d['exercises'] if e['name'].lower() not in known})
    c.eq(miss, [], 'every exercise is in the library (by name or other name)')
    c.ok('Iso-Lateral Plate-Loaded Machine Dip' in p.evaluate('EXERCISE_DATABASE.map(e => e.name)'), 'the machine dip is in the library under its new name')
    c.eq(len({e['id'] for d in prog['days'] for e in d['exercises']}), 120, 'every exercise id is unique')

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
