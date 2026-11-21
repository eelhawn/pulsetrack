"""3.16.0 phone shortcuts and a Today screen: manifest.json has long-press shortcuts (Start workout, Log a set, Today) that open
index.html?go=...; the app does it once it is up (after the terms on a first launch) and takes ?go= out of the address. The side menu has
Today: what you did today, your next workout with Start/Continue and Log a set, and this week."""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page, server, TERMS_OK
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

c = Checks('shortcuts')
ME = 'my_6day_chest_back_legs_sharms'
READY = '() => window.app && app.data && typeof PT !== "undefined" && !!PT.today && !!(app.settings && app.settings.coreHighRep)'
VIEW = '() => ["home", "workout", "days", "programs", "cardio"].find(v => { const e = document.getElementById("view-" + v); return e && !e.classList.contains("hidden"); })'

# ---- the manifest
m = json.load(open(os.path.join(ROOT, 'manifest.json'), encoding='utf-8'))
sc = m.get('shortcuts') or []
c.eq([s['url'] for s in sc], ['./index.html?go=start', './index.html?go=set', './index.html?go=today'], 'manifest.json has three shortcuts (Chrome on Android shows 3), most used first')
c.ok(all(s.get('name') and s.get('short_name') and s.get('icons') and s['icons'][0]['src'].startswith('data:image/png') and s['icons'][0]['sizes'] == '96x96' for s in sc), 'each has a name, a short name and the logo as its icon')
c.ok(all(len(s['icons'][0]['src']) < 2000 for s in sc) and len(json.dumps(m)) < 20000, 'the shortcut icons are small, so manifest.json stays under 20 KB (big icons once stopped Chrome installing the app)')
c.ok(all(len(s['short_name']) <= 14 for s in sc), 'short names fit under the icon')

with page(w=360) as p:
    base = p.url.split('?')[0]
    p.evaluate('() => { const pr = app.data.programs.find(x => x.id === "%s"); app.selectProgram(pr, null, true); PT.split64fix.jump(5); app.selectProgram(pr, null, true); }' % ME)

    # ---- Today in the side menu
    p.evaluate('app.openDrawer()'); p.wait_for_timeout(300)
    c.ok(p.evaluate('(() => { const t = document.getElementById("pt-drawer-today"), h = document.querySelector(".drawer-nav[data-nav=home]"); return !!t && h.nextElementSibling === t; })()'), 'the side menu has Today, under Home')
    p.click('#pt-drawer-today'); p.wait_for_timeout(500)
    t = p.evaluate('document.getElementById("pt-today-box").innerText')
    c.ok("Today's workout" in t and "Ilhaan's 3 Day Split" in t and 'Day 5 of 64' in t and 'Day 5: Chest & Back' in t and 'Start workout' in t, 'Today shows your next workout (Day 5) with Start workout')
    c.ok('9 exercises' in t and 'about' in t and 'Lat Pulldown' in t, 'how many exercises, how long and the first ones')
    c.ok('This week' in t and 'workouts' in t, 'and this week against your goal')
    c.ok('Done today' not in t, 'nothing done today yet: no Done today')
    c.ok(not p.evaluate('!!document.querySelector("#drawer-backdrop.opacity-100, #drawer-backdrop:not(.pointer-events-none)")'), 'the side menu closed')
    p.click('#pt-today-box [data-td=start]'); p.wait_for_timeout(600)
    c.eq(p.evaluate(VIEW), 'workout', 'Start workout opens the workout')
    c.eq(p.evaluate('app.activeDay && app.activeDay.dayNumber'), 5, 'on Day 5')

    # tick two sets: Today says Continue, and what is done
    p.evaluate('() => { [...document.querySelectorAll("#view-workout .btn-check-set")].slice(0, 2).forEach(b => b.click()); }'); p.wait_for_timeout(400)
    p.evaluate('() => { const t = new Date(); app.sessions.push({ id: "td1", v: 1, date: PT.ds(t), ts: t.getTime() - 9000000, pid: "x", ptitle: "P", day: 1, dtitle: "Morning cardio", dur: 2520, unit: "lb", ex: [{ name: "Crunches", sets: [{ w: 0, r: 20, t: "R" }] }], vol: 0, sets: 6, prs: [], upd: t.getTime() }); app.saveSessions(); PT.today.open(); }'); p.wait_for_timeout(500)
    t = p.evaluate('document.getElementById("pt-today-box").innerText')
    c.ok('Continue workout' in t and '2 of ' in t and 'sets done' in t, 'after two sets: Continue workout, 2 of N sets done')
    c.ok('Done today' in t and 'Morning cardio' in t and '42 min' in t and '6 sets' in t, 'a workout finished today shows under Done today')
    p.click('#pt-today-box [data-td=set]'); p.wait_for_timeout(1200)
    r = p.evaluate('() => { const h = document.querySelector(".set-row.pt-go-hi"); if (!h) return null; const b = h.querySelector(".btn-check-set"), r = h.getBoundingClientRect(); return { done: b.dataset.completed, idx: h.dataset.setIndex, ex: b.dataset.exname, seen: r.top >= 0 && r.bottom <= innerHeight }; }')
    c.ok(r and r['done'] != '1' and r['idx'] == '2' and r['ex'] == 'Lat Pulldown', 'Log a set: marks the next set to fill (Lat Pulldown, set 3)')
    c.ok(r and r['seen'], 'scrolled into view')
    c.ok('Next: Lat Pulldown, set 3' in p.evaluate('document.getElementById("pt-toast-msg").innerText'), 'and says which one')
    c.ok(not p.evaluate('document.body.classList.contains("pt-kb")'), 'without popping up the keyboard')

    # ---- the shortcuts: ?go=
    for go, want in (('start', 'workout'), ('cardio', 'cardio')):   # cardio: not in the manifest (only 3 show), still understood
        p.goto(base + '?go=' + go); p.wait_for_function(READY, timeout=20000); p.wait_for_timeout(900)
        c.eq(p.evaluate(VIEW), want, '?go=%s opens %s' % (go, want))
        c.ok('go=' not in p.url, '?go=%s is taken out of the address (so a reload does not repeat it)' % go)
    p.goto(base + '?go=today'); p.wait_for_function(READY, timeout=20000); p.wait_for_timeout(900)
    c.ok(p.evaluate('!!document.getElementById("pt-today-box") && !!document.getElementById("pt-today-box").offsetParent'), '?go=today opens Today')
    p.goto(base + '?go=set'); p.wait_for_function(READY, timeout=20000); p.wait_for_timeout(1500)
    c.ok(p.evaluate(VIEW) == 'workout' and p.evaluate('!!document.querySelector(".set-row.pt-go-hi")'), '?go=set opens the workout at the next set')
    p.goto(base); p.wait_for_function(READY, timeout=20000); p.wait_for_timeout(700)
    plain = p.evaluate(VIEW)   # with sets ticked, the app reopens the workout on its own
    p.goto(base + '?go=nonsense&x=1'); p.wait_for_function(READY, timeout=20000); p.wait_for_timeout(700)
    c.ok(p.evaluate(VIEW) == plain and not p.evaluate('!!document.getElementById("pt-today-box")') and 'x=1' in p.url and 'go=' not in p.url, 'an unknown ?go= does nothing (and other parts of the address stay)')
    p.goto(base + '?go=today'); p.wait_for_function(READY, timeout=20000); p.wait_for_timeout(700)
    p.reload(); p.wait_for_function(READY, timeout=20000); p.wait_for_timeout(700)
    c.ok(not p.evaluate('!!document.getElementById("pt-today-box") && !!document.getElementById("pt-today-box").offsetParent'), 'a reload after a shortcut does not do it again')

    # offline: the saved app answers index.html?go=... too (sw.js ignores the ?query)
    p.reload(); p.wait_for_function('!!navigator.serviceWorker.controller', timeout=15000); p.wait_for_timeout(800)
    p.context.set_offline(True)
    p.goto(base + '?go=today'); p.wait_for_function(READY, timeout=20000); p.wait_for_timeout(900)
    c.ok(p.evaluate('!!document.getElementById("pt-today-box")'), 'offline, the Today shortcut still opens Today')
    p.context.set_offline(False)
    p.evaluate('() => { const s = document.getElementById("pt-today-sheet"); if (s) PT.kit.closeSheet(s); }'); p.wait_for_timeout(300)
    p.evaluate('PT.today.open()'); p.wait_for_timeout(400)
    aud = p.evaluate(open(os.path.join(ROOT, 'tests', 'fixtures', 'design_audit.js'), encoding='utf-8').read())
    c.eq({k: aud['samples'][k][:3] for k, v in aud['counts'].items() if v}, {}, 'Today passes the design audit at 360px')
    c.ok(p.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'no sideways scroll')
    c.eq(p.errors, [], 'no errors')

# ---- first launch: the shortcut waits for the terms
with server() as url, sync_playwright() as pw:
    b = pw.chromium.launch(); ctx = b.new_context(viewport={'width': 360, 'height': 780}); p = ctx.new_page(); errs = []
    p.on('pageerror', lambda e: errs.append(str(e)))
    p.goto(url + '?go=today'); p.wait_for_function('() => window.app && app.data && typeof PT !== "undefined" && !!PT.today', timeout=20000); p.wait_for_timeout(1500)
    c.ok(p.evaluate('!!document.getElementById("pt-legal")') and not p.evaluate('!!document.getElementById("pt-today-box")'), 'first launch: the terms come first, Today waits')
    p.evaluate('localStorage.setItem("pt-terms", JSON.stringify({ v: "x", at: "2026-01-01" })); document.getElementById("pt-legal").remove()'); p.wait_for_timeout(1200)
    c.ok(p.evaluate('!!document.getElementById("pt-today-box")'), 'then Today opens')
    c.eq(errs, [], 'no errors on a first launch')
    b.close()

sys.exit(c.done())
