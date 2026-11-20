"""3.11.0 star programs: each row in the Programs list has a star. Starred programs move to a "Starred" group at the top (open from
the start), a "Starred" filter chip shows only them, and the row's ... sheet has Star it / Remove star. Kept in settings.starredPrograms,
so it survives a reload and is in backups. Tapping the star never opens the program."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

c = Checks('starred')
FZ, ME = 'frank_zane_beginner_full_body', 'my_6day_chest_back_legs_sharms'
STATE = '''() => { const gs = [...document.querySelectorAll("#programs-list-container .pgx-grp")];
  return { groups: gs.map(g => ({ k: g.querySelector(".pgx-g").dataset.g, t: g.querySelector(".pgx-t").textContent, open: !g.querySelector(".pgx-gb").hidden,
             ids: [...g.querySelectorAll(".pgx-pr")].map(r => r.dataset.pid) })),
    total: app.data.programs.length, view: document.querySelector("#view-programs") && !document.querySelector("#view-programs").classList.contains("hidden"),
    sheet: !!document.querySelector("#sheet:not(.hidden), .pt-sheet.open") }; }'''

with page(w=360) as p:
    p.evaluate('app.showView("programs")'); p.wait_for_timeout(300)
    st = p.evaluate(STATE)
    c.ok(st['groups'] and st['groups'][0]['k'] != 'star', 'no Starred group until you star a program')
    c.eq(p.evaluate('document.querySelectorAll(".pgx-pr").length'), p.evaluate('document.querySelectorAll(".pgx-pr .pgx-star[aria-pressed=false]").length'), 'every program row has a star, none on yet')
    c.eq(p.evaluate('(document.querySelector("#pgx-chips [data-f=star]") || {}).textContent'), 'Starred 0', 'a Starred filter chip, with 0')

    # ---- star one from its row
    p.evaluate('PT.progList.reveal("%s")' % FZ); p.wait_for_timeout(150)
    p.click('.pgx-pr[data-pid="%s"] .pgx-star' % FZ); p.wait_for_timeout(300)
    st = p.evaluate(STATE)
    c.eq(p.evaluate('app.settings.starredPrograms'), [FZ], 'tapping the star saves it')
    c.ok(st['groups'][0]['k'] == 'star' and st['groups'][0]['t'] == 'Starred' and st['groups'][0]['open'] and st['groups'][0]['ids'] == [FZ], 'a Starred group at the top, open, with that program')
    ids = [i for g in st['groups'] for i in g['ids']]
    c.ok(len(ids) == st['total'] and ids.count(FZ) == 1, 'it moved there: every program is still in exactly one group')
    c.ok(st['view'] and not p.evaluate('!!document.querySelector("#view-program-detail:not(.hidden)")'), 'tapping the star does not open the program')
    c.eq(p.evaluate('document.querySelector(".pgx-pr[data-pid=\\"%s\\"] .pgx-star").getAttribute("aria-pressed")' % FZ), 'true', 'its star shows as on')
    c.ok('Remove star from' in p.evaluate('document.querySelector(".pgx-pr[data-pid=\\"%s\\"] .pgx-star").getAttribute("aria-label")' % FZ), 'and says what tapping it again does')
    c.ok(p.evaluate('document.activeElement && document.activeElement.classList.contains("pgx-star")'), 'focus stays on the star')

    # ---- the current program, starred from the ... sheet
    p.evaluate('app.selectProgram(app.data.programs.find(x => x.id === "%s"))' % ME); p.wait_for_timeout(200)
    p.evaluate('app.showView("programs")'); p.wait_for_timeout(300)
    p.evaluate('PT.progList.reveal("%s")' % ME); p.wait_for_timeout(150)
    p.click('.pgx-pr[data-pid="%s"] .pgx-more' % ME); p.wait_for_timeout(300)
    c.ok(p.evaluate('!!document.querySelector("[data-act=star]") && document.querySelector("[data-act=star]").textContent.includes("Star it")'), 'the ... sheet has Star it')
    p.click('[data-act=star]'); p.wait_for_timeout(400)
    st = p.evaluate(STATE)
    c.eq(sorted(st['groups'][0]['ids']), sorted([FZ, ME]), 'Star it adds it to Starred')
    c.ok(p.evaluate('!!document.querySelector(".pgx-grp .pgx-pr.pgx-cur[data-pid=\\"%s\\"] .pgx-pill")' % ME) and 'Current' in p.evaluate('document.querySelector(".pgx-grp .pgx-g[data-g=star]").textContent'), 'the current program shows as Current inside Starred')

    # ---- the Starred filter
    p.click('#pgx-chips [data-f="star"]'); p.wait_for_timeout(200)
    c.eq(sorted(p.evaluate('[...document.querySelectorAll(".pgx-pr")].map(r => r.dataset.pid)')), sorted([FZ, ME]), 'the Starred chip shows only starred programs')
    c.eq(p.evaluate('document.querySelector("#pgx-chips [data-f=star]").textContent'), 'Starred 2', 'with the count')

    # ---- it fits and stays after a reload
    aud = p.evaluate(open(os.path.join(ROOT, 'tests', 'fixtures', 'design_audit.js'), encoding='utf-8').read())
    c.eq({k: aud['samples'][k][:3] for k, v in aud['counts'].items() if v}, {}, 'the Programs list with stars passes the design audit at 360px')
    c.ok(p.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'no sideways scroll at 360px')
    c.ok('starredPrograms' in p.evaluate('Object.keys(localStorage).filter(k => k.startsWith("pulsetrack_")).map(k => localStorage.getItem(k)).join(" ")'), 'saved in the app\'s settings, so backups include it')
    p.reload(); p.wait_for_function('() => window.app && app.data && typeof PT !== "undefined" && !!PT.progList')
    p.evaluate('app.showView("programs")'); p.wait_for_timeout(300)
    st = p.evaluate(STATE)
    c.eq(sorted(st['groups'][0]['ids']), sorted([FZ, ME]), 'after a reload they are still starred, at the top')

    # ---- unstar both
    p.evaluate('PT.progList.star("%s")' % ME); p.wait_for_timeout(100)
    p.click('.pgx-pr[data-pid="%s"] .pgx-star' % FZ); p.wait_for_timeout(300)
    st = p.evaluate(STATE)
    c.ok(p.evaluate('app.settings.starredPrograms').__len__() == 0 and all(g['k'] != 'star' for g in st['groups']), 'taking both stars off removes the Starred group')
    ids = [i for g in st['groups'] for i in g['ids']]
    c.eq(len(ids), st['total'], 'and they are back in their usual groups')
    p.click('#pgx-chips [data-f="star"]'); p.wait_for_timeout(200)
    c.ok('No starred programs yet' in p.evaluate('document.getElementById("programs-list-container").innerText'), 'an empty Starred filter says how to star one')
    c.eq(p.errors, [], 'no errors')

sys.exit(c.done())
