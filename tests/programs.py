"""Programs: delete asks in the app's own dialog (2.67.0) and Undo brings it back; the merged Arnold and Ronnie Coleman programs (2.66.0)."""
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
