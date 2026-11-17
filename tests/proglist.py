"""3.0.0 the Programs list is grouped instead of one long column: Group by Days a week (default), Athlete or Goal. Each group is one
row that opens and closes; the group with the current program starts open; search and filters open every group; each program row
shows its split from week 1 (each name once, no "Day 1:" or weekday prefixes); the choice is remembered; it fits at 360px."""
import os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page

c = Checks('proglist')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VER = open(os.path.join(ROOT, 'src', 'VERSION')).read().strip()
c.ok(re.fullmatch(r'([3-9]|[1-9]\d+)\.\d{1,2}\.\d+', VER), 'the version is 3.x or later with a middle number under 100, not 2.110.0 (%s)' % VER)

STATE = '''() => {
  const gs = [...document.querySelectorAll("#programs-list-container .pgx-grp")];
  return { groups: gs.map(g => { const b = g.querySelector(".pgx-g"), body = g.querySelector(".pgx-gb");
      return { k: b.dataset.g, t: b.querySelector(".pgx-t").textContent, s: b.querySelector(".pgx-s").textContent, exp: b.getAttribute("aria-expanded"),
               hidden: body.hidden, rows: body.querySelectorAll(".pgx-pr").length, shown: [...body.querySelectorAll(".pgx-pr")].filter(r => r.offsetParent).length }; }),
    total: app.data.programs.length, visibleRows: [...document.querySelectorAll(".pgx-pr")].filter(r => r.offsetParent).length,
    by: [...document.querySelectorAll("#pgx-by [aria-pressed=true]")].map(b => b.textContent) };
}'''

for w in (390, 360):
    with page(w=w) as p:
        p.evaluate('app.showView("programs")'); p.wait_for_timeout(300)
        st = p.evaluate(STATE)
        c.eq(st['by'], ['Days a week'], '%dpx: grouped by days a week by default' % w)
        c.eq([g['t'] for g in st['groups']][:4], ['3 days a week', '4 days a week', '5 days a week', '6 days a week'], '%dpx: groups go 3, 4, 5, 6 days a week' % w)
        c.eq(sum(g['rows'] for g in st['groups']), st['total'], '%dpx: every program is in exactly one group' % w)
        c.ok(all(re.match(r'^\d+ programs?\b', g['s']) and int(g['s'].split()[0]) == g['rows'] for g in st['groups']), '%dpx: each group says how many programs it has' % w)
        c.eq(len([g for g in st['groups'] if not g['hidden']]), 1, '%dpx: one group starts open' % w)
        c.ok(p.evaluate('document.querySelectorAll(".pgx-pr:not(.pgx-noav)").length') == st['total'], '%dpx: rows keep the athlete badge when not grouped by athlete' % w)

        # by athlete, with a current program
        p.evaluate('app.selectProgram(app.data.programs.find(x => x.id === "frank_zane_beginner_full_body"))'); p.wait_for_timeout(200)
        p.evaluate('app.showView("programs")'); p.wait_for_timeout(200)
        p.click('#pgx-by [data-by="pro"]'); p.wait_for_timeout(200)
        st = p.evaluate(STATE)
        G = st['groups']
        c.eq(st['by'], ['Athlete'], '%dpx: Athlete is picked' % w)
        c.ok(len(G) <= st['total'] / 2, '%dpx: %d athlete groups instead of %d rows' % (w, len(G), st['total']))
        c.eq(sum(g['rows'] for g in G), st['total'], '%dpx: still every program once' % w)
        names = [g['t'] for g in G]
        c.ok('Ronnie Coleman' in names and 'Arnold Schwarzenegger' in names, '%dpx: groups are named after the athlete' % w)
        mid = [g['t'] for g in G if g['k'] not in ('mine', 'pmore')]
        c.eq(mid, sorted(mid, key=str.lower), '%dpx: athletes in A to Z order' % w)
        c.eq([g['t'] for g in G if not g['hidden']], ['Frank Zane'], '%dpx: the current program\'s group starts open' % w)
        fz = [g for g in G if g['t'] == 'Frank Zane'][0]
        c.ok('Current' in fz['s'] and fz['exp'] == 'true', '%dpx: its header says Current and is marked open' % w)
        c.eq(st['visibleRows'], fz['rows'], '%dpx: rows of closed groups are hidden' % w)
        c.ok(p.evaluate('document.querySelectorAll(".pgx-gb .pgx-pr.pgx-noav").length') >= st['total'] - 8, '%dpx: no repeated athlete badge inside an athlete group' % w)

        # open and close a group
        p.click('.pgx-g[data-g="pRonnie Coleman"]'); p.wait_for_timeout(100)
        st = p.evaluate(STATE); rc = [g for g in st['groups'] if g['t'] == 'Ronnie Coleman'][0]
        c.ok(not rc['hidden'] and rc['exp'] == 'true' and rc['shown'] == rc['rows'] == 6, '%dpx: tapping a group opens it (6 Ronnie Coleman programs)' % w)
        c.ok(p.evaluate('document.activeElement && document.activeElement.dataset.g') == 'pRonnie Coleman', '%dpx: focus stays on the group header' % w)
        p.click('.pgx-g[data-g="pRonnie Coleman"]'); p.wait_for_timeout(100)
        rc = [g for g in p.evaluate(STATE)['groups'] if g['t'] == 'Ronnie Coleman'][0]
        c.ok(rc['hidden'] and rc['exp'] == 'false', '%dpx: tapping again closes it' % w)

        # the split line
        sp = p.evaluate('() => Object.fromEntries([...document.querySelectorAll(".pgx-pr")].map(r => [r.dataset.pid, (r.querySelector(".pgx-sp") || {}).textContent || ""]))')
        c.eq(sp.get('frank_zane_beginner_full_body'), 'Full Body', '%dpx: a split name shows once ("Full Body", not three times)' % w)
        c.ok(sum(1 for v in sp.values() if v) >= len(sp) - 3, '%dpx: nearly every program shows its split' % w)
        c.ok(not any(re.search(r'\b(Day \d+|Monday|Tuesday|Phase \d|\[W)', v) for v in sp.values()), '%dpx: no "Day 1:", weekday or week prefixes in the split' % w)
        c.ok(all(len(set(x.lower() for x in v.split(' · '))) == len(v.split(' · ')) for v in sp.values() if v), '%dpx: no name repeats inside a split' % w)
        rc6 = sp.get('ronnie_coleman_highrep_6day', '')
        c.ok('Legs' in rc6 and 'Back' in rc6, '%dpx: Ronnie\'s 6-day split names its days (%s)' % (w, rc6))

        # search and filters open every group
        p.fill('#pgx-q', 'golden six'); p.wait_for_timeout(200)
        st = p.evaluate(STATE)
        c.ok(st['groups'] and all(not g['hidden'] for g in st['groups']) and st['visibleRows'] >= 1, '%dpx: searching shows every match, no closed groups' % w)
        p.click('#pgx-clear'); p.wait_for_timeout(100)
        p.click('#pgx-chips [data-f="beginner"]'); p.wait_for_timeout(200)
        st = p.evaluate(STATE)
        c.ok(all(not g['hidden'] for g in st['groups']) and st['visibleRows'] == sum(g['rows'] for g in st['groups']), '%dpx: a filter shows all its programs' % w)
        p.click('#pgx-chips [data-f="all"]'); p.wait_for_timeout(100)

        p.click('#pgx-by [data-by="goal"]'); p.wait_for_timeout(200)
        c.eq(p.evaluate(STATE)['groups'][0]['t'], 'Mass', '%dpx: Goal groups start with Mass' % w)
        c.ok(p.evaluate('document.documentElement.scrollWidth <= innerWidth'), '%dpx: no sideways scroll' % w)
        bar = p.evaluate('() => { const r = document.getElementById("pgx-by").getBoundingClientRect(); return r.right <= innerWidth - 8 && r.left >= 8; }')
        c.ok(bar, '%dpx: the Group by control fits' % w)

        # remembered
        p.reload(); p.wait_for_function('typeof PT !== "undefined" && window.app && window.app.data && window.app.data.programs.length')
        p.evaluate('app.showView("programs")'); p.wait_for_timeout(300)
        c.eq(p.evaluate(STATE)['by'], ['Goal'], '%dpx: the grouping is remembered' % w)

        # keyboard
        p.evaluate('PT.progList.groupBy("pro")'); p.wait_for_timeout(100)
        p.focus('.pgx-g[data-g="pKai Greene"]'); p.keyboard.press('Enter'); p.wait_for_timeout(100)
        c.ok(p.evaluate('document.querySelector(\'.pgx-g[data-g="pKai Greene"]\').getAttribute("aria-expanded")') == 'true', '%dpx: Enter on a group header opens it' % w)
        c.eq(p.errors, [], '%dpx: no errors' % w)

sys.exit(c.done())
