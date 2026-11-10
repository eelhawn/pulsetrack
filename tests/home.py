"""Home screen: the Pre-workout protocol row is a choice (Settings → Home screen → Shown / Hidden)."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page

c = Checks('home')
ROW = '!!document.getElementById("pt-home-fuel")'
with page() as p:
    p.evaluate('app.selectProgram(app.data.programs.find(x => x.id === "frank_zane_upper_lower_4day"), null, true)')
    p.evaluate('app.showView("home")')
    p.evaluate('() => { app.settings.fuelRow = undefined; app.renderHomeView(); }')
    p.wait_for_timeout(200)
    # an existing phone (saved layout from before this release, no "fuel" entry) gets the row as before
    p.evaluate('() => { app.settings.homeLayout = app.settings.homeLayout.filter(x => x.id !== "fuel"); PT.applyHomeLayout(); app.renderHomeView(); }')
    p.wait_for_timeout(200)
    shown = p.evaluate(ROW)
    c.ok(shown or p.evaluate('() => { const d = app.activeDay; return !!(d && app.isRestDay && app.isRestDay(d)); }'), 'the row is there by default (unless it is a rest day)')
    if not shown:
        p.evaluate('() => { PT.fuel.start(""); app.renderHomeView(); }')
        p.wait_for_timeout(200)
        c.ok(p.evaluate(ROW), 'the row shows while a protocol is running')
        p.evaluate('() => { PT.fuel.stop(); app.renderHomeView(); }')
    c.ok(p.evaluate('() => !!document.querySelector("#pt-home-layout [data-id=fuel]")') or p.evaluate('() => { PT.applyHomeLayout(); return !!document.querySelector("#pt-home-layout [data-id=fuel]"); }'), 'Settings → Home screen lists Pre-workout protocol')
    c.eq(p.evaluate('() => PT.homeShown("fuel")'), True, 'shown by default')
    c.eq(p.evaluate('() => { const l = [...document.querySelectorAll("#pt-home-layout [data-id]")].map(x => x.dataset.id); return l.indexOf("fuel") - l.indexOf("routine"); }'), 1, 'sits right after Today\'s workout in the list')

    # open the list and press Hidden
    p.evaluate('() => { PT.applyHomeLayout(); const d = document.querySelector("#pt-home-layout details"); if (d) d.open = true; }')
    p.evaluate('() => { const b = document.querySelector("#pt-home-layout [data-id=fuel] [data-act=eye]"); if (b) b.click(); }')
    p.wait_for_timeout(150)
    c.eq(p.evaluate('() => PT.homeShown("fuel")'), False, 'Hidden is saved')
    c.eq(p.evaluate(ROW), False, 'the row is gone from Home as soon as it is hidden')
    p.evaluate('() => app.renderHomeView()')
    p.wait_for_timeout(150)
    c.eq(p.evaluate(ROW), False, 'and stays gone after Home redraws')
    p.evaluate('() => { PT.fuel.start(""); app.renderHomeView(); }')
    p.wait_for_timeout(150)
    c.eq(p.evaluate(ROW), False, 'even with a protocol running')
    p.evaluate('() => PT.fuel.stop()')
    c.eq(p.evaluate('() => JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k => /settings/i.test(k)) || "") || "{}").homeLayout.find(x => x.id === "fuel").show'), False, 'the choice is kept in the saved settings')
    # the workout screen still has it
    p.evaluate('() => app.showView("workout")')
    p.wait_for_timeout(200)
    p.evaluate('() => app.showView("home")')

    # and back on
    p.evaluate('() => { const d = document.querySelector("#pt-home-layout details"); if (d) d.open = true; const b = document.querySelector("#pt-home-layout [data-id=fuel] [data-act=eye]"); if (b) b.click(); }')
    p.wait_for_timeout(150)
    c.eq(p.evaluate('() => PT.homeShown("fuel")'), True, 'Shown again')
    p.evaluate('() => { PT.fuel.start(""); app.renderHomeView(); }')
    p.wait_for_timeout(200)
    c.eq(p.evaluate(ROW), True, 'the row comes back')
    # it sits under Today's workout, not above it
    c.ok(p.evaluate('() => { const r = document.getElementById("home-routine"), f = document.getElementById("pt-home-fuel"); return !!(r && f) && Number(f.style.order) > Number(r.style.order); }'), 'it shows under Today\'s workout')
    p.evaluate('() => PT.fuel.stop()')

    # the old on/off flag still works
    p.evaluate('() => { app.settings.fuelRow = false; PT.fuel.refresh(); }')
    c.eq(p.evaluate(ROW), False, 'the older fuelRow=false flag is still honoured')
    p.evaluate('() => { app.settings.fuelRow = undefined; }')

    # "Put the cards back" restores it
    p.evaluate('() => { const l = app.settings.homeLayout; l.find(x => x.id === "fuel").show = false; PT.applyHomeLayout(); const b = document.querySelector("#pt-home-layout [data-act=reset]"); if (b) b.click(); }')
    c.eq(p.evaluate('() => PT.homeShown("fuel")'), True, 'reset puts it back')
    # on a Monday or Tuesday the family recap banner is drawn at start-up, before window.app exists: no error, and it is drawn again afterwards
    p.evaluate('() => { const a = window.app, g = Date.prototype.getDay; Date.prototype.getDay = () => 1; try { window.app = undefined; a.renderHomeBanners(); } finally { window.app = a; Date.prototype.getDay = g; } }')
    p.wait_for_timeout(100)
    c.eq(p.errors, [], 'no page errors or console errors (also for the Monday/Tuesday family recap at start-up)')
c.done()
