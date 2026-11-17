"""2.105.0 the profile frame picker: a tidy grid of same-size tiles, your frames first, the rest behind "N more to unlock" with a short
price or level, tapping works as before, no two frames share a name, the XP breakdown is a small grid."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page

c = Checks('frames')
SETUP = '() => { for (let i = 0; i < 300; i++) app.sessions.push({ id: "s" + i, date: PT.ds(new Date(Date.now() - i * 86400000)), ts: Date.now() - i * 86400000, ex: [], vol: 1000, sets: 12, unit: "lb" }); app.settings.frame = "aurora"; window.__t = []; app.toast = m => window.__t.push(String(m)); app.showView("progress"); app._progTab = "rewards"; app.renderProgressView(); const d = document.getElementById("pt-pg-lvl"); d.open = true; }'

for w in (390, 360):
    with page(w=w, h=900) as p:
        p.evaluate(SETUP); p.wait_for_timeout(300)
        g = p.evaluate('() => { const g = document.querySelector("#pt-pg-lvl .pt-fgrid"); return getComputedStyle(g).gridTemplateColumns.split(" ").length; }')
        c.eq(g, 4 if w == 390 else 3, '%dpx: frames sit in a grid of %d columns' % (w, 4 if w == 390 else 3))
        sizes = p.evaluate('() => [...document.querySelector("#pt-pg-lvl .pt-fgrid").querySelectorAll(".pt-ftile")].map(t => Math.round(t.getBoundingClientRect().width))')
        c.eq(len(set(sizes)), 1, '%dpx: every tile is the same width' % w)
        mine = p.evaluate('() => [...document.querySelectorAll("#pt-pg-lvl > div .pt-fgrid")][0] ? [...document.querySelector("#pt-pg-lvl .pt-fgrid").querySelectorAll(".pt-ftile")].map(t => t.classList.contains("lock")) : null')
        c.ok(mine and not any(mine), '%dpx: the first grid only has frames you have' % w)
        c.eq(p.evaluate('() => document.querySelector(".pt-flock").open'), False, '%dpx: the locked ones are tucked away' % w)
        c.ok(p.evaluate('() => /^\\d+ more to unlock/.test(document.querySelector(".pt-flock > summary").textContent.trim())'), '%dpx: behind "N more to unlock"' % w)
        p.evaluate('() => document.querySelector(".pt-flock > summary").click()'); p.wait_for_timeout(150)
        lab = p.evaluate('() => [...document.querySelectorAll(".pt-flock .pt-ftile s")].map(s => s.textContent.trim())')
        c.ok(lab and all(len(x) <= 7 for x in lab), '%dpx: each locked tile has a short price or level (%s)' % (w, ', '.join(lab[:4])))
        c.ok(p.evaluate('() => document.documentElement.scrollWidth <= innerWidth + 1'), '%dpx: no sideways scroll' % w)
        over = p.evaluate('() => [...document.querySelectorAll(".pt-ftile")].filter(t => t.scrollWidth > t.clientWidth + 1).length')
        c.eq(over, 0, '%dpx: nothing spills out of a tile' % w)
        names = p.evaluate('() => [...document.querySelectorAll(".pt-ftile b")].map(b => b.textContent)')
        c.eq(len(names), len(set(names)), '%dpx: no two frames share a name (the shop\'s Aurora is Borealis)' % w)
        # tapping
        p.evaluate('() => document.querySelector(".pt-flock .pt-ftile").click()'); p.wait_for_timeout(100)
        c.ok(p.evaluate('() => window.__t.some(m => /^Unlocks:/.test(m))') and p.evaluate('() => app.settings.frame') == 'aurora', '%dpx: a locked frame says how to unlock it' % w)
        c.eq(p.evaluate('() => document.querySelector(".pt-flock").open'), True, '%dpx: and the list stays open' % w)
        p.evaluate('() => document.querySelector(\'#pt-pg-lvl .pt-ftile[data-frame="gold"]\').click()'); p.wait_for_timeout(150)
        c.eq(p.evaluate('() => [app.settings.frame, document.querySelector(\'.pt-ftile[aria-pressed="true"]\').dataset.frame]'), ['gold', 'gold'], '%dpx: tapping one of yours wears it' % w)
        c.ok(p.evaluate('() => document.querySelectorAll("#pt-pg-lvl .pt-xpg span").length') >= 3, '%dpx: the XP breakdown is a small grid' % w)
        c.eq(p.errors, [], '%dpx: no page errors' % w)

c.done()
