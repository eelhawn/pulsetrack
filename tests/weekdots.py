"""2.107.0 the This week strip on Home: the lifting / cardio dots under each date are small, side by side and centred in the day
(another card's .pt-dot styles used to leak in, making them bigger and pushing them to the left edge)."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page

c = Checks('weekdots')
SHOTS = '/tmp/claude-0/-home-claude/395da5c4-9b49-54b4-93e4-f9926c59aa1c/scratchpad/'
for w in (390, 360):
    with page(w=w, h=900) as p:
        p.evaluate('() => { const t = Date.now(); app.sessions.push({ id: "x", date: PT.ds(), ts: t, ex: [{ name: "Bench Press", sets: [{ w: 100, r: 5, t: "R" }] }], vol: 500, sets: 1, unit: "lb" }); PT.cardio.addLog({ id: "c1", date: PT.ds(), ts: t, act: "run", name: "Run", cat: "cardio", sec: 1200, int: 2 }); app.saveSessions(); app.showView("home"); app.renderHomeView(); }')
        p.wait_for_timeout(300)
        r = p.evaluate('''() => [...document.querySelectorAll("#home-week .pt-wd")].map(d => { const b = d.getBoundingClientRect(), ds = [...d.querySelectorAll(".pt-dot")].map(x => x.getBoundingClientRect());
          return { n: ds.length, off: Math.abs((ds[0].left + ds[ds.length - 1].right) / 2 - (b.left + b.right) / 2), round: ds.every(x => Math.abs(x.width - x.height) < 0.5), w: ds[0].width, gap: ds.length > 1 ? ds[1].left - ds[0].right : 3, inside: ds.every(x => x.bottom <= b.bottom - 3 && x.left >= b.left + 3) }; })''')
        c.eq({x['n'] for x in r}, {2}, '%dpx: two dots per day (lifting and cardio)' % w)
        c.ok(all(x['off'] < 1 for x in r), '%dpx: centred under the date' % w)
        c.ok(all(x['round'] and 6 <= x['w'] <= 9 for x in r), '%dpx: small round dots' % w)
        c.ok(all(2 <= x['gap'] <= 6 for x in r), '%dpx: side by side with a small gap' % w)
        c.ok(all(x['inside'] for x in r), '%dpx: well inside the day\'s box' % w)
        c.eq(p.evaluate('() => [...document.querySelectorAll("#home-week .pt-wd .pt-dot.on")].length'), 2, '%dpx: today shows both dots filled' % w)
        if w == 390:
            p.evaluate('() => document.getElementById("home-week").scrollIntoView({ block: "center" })'); p.screenshot(path=SHOTS + 'weekdots390.png')
        c.eq(p.errors, [], '%dpx: no page errors' % w)
c.done()
