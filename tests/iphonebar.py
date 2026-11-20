"""3.11.1 on an iPhone the Finish Workout bar used to slide up the screen while you scrolled with the keyboard open (an iPhone does not
make the page shorter for the keyboard, so a bar fixed to the bottom moves with the page). Now, on iPhone and iPad, the bar hides while
you type a set and comes back when the keyboard closes. Other phones keep it."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, server, TERMS_OK
from playwright.sync_api import sync_playwright

c = Checks('iphonebar')
OPEN = '''() => { const pr = app.data.programs.find(x => x.id === "my_6day_chest_back_legs_sharms"); app.selectProgram(pr, null, true);
  app.activeProgram = pr; app.activeDay = pr.days[0]; app.showView("workout"); }'''
BAR = '() => { const b = document.getElementById("finish-bar"); return !b.classList.contains("hidden") && getComputedStyle(b).display !== "none" && b.getBoundingClientRect().height > 0; }'

with server() as url, sync_playwright() as pw:
    b = pw.chromium.launch()
    for dev, ios in (('iPhone 13', True), ('Pixel 7', False)):
        ctx = b.new_context(**pw.devices[dev])
        ctx.add_init_script(TERMS_OK)
        p = ctx.new_page(); errs = []
        p.on('pageerror', lambda e: errs.append(str(e)))
        p.goto(url)
        p.wait_for_function('typeof PT !== "undefined" && window.app && app.data && app.data.programs.length')
        p.wait_for_function('() => !!app.settings.coreHighRep', timeout=5000)
        c.eq(p.evaluate('document.documentElement.classList.contains("pt-ios")'), ios, '%s: %s' % (dev, 'marked as an iPhone' if ios else 'not marked as an iPhone'))
        p.evaluate(OPEN); p.wait_for_timeout(500)
        c.ok(p.evaluate(BAR), '%s: mid-workout the Finish Workout bar is at the bottom' % dev)
        p.focus('#view-workout input[type=number]'); p.wait_for_timeout(200)
        c.ok(p.evaluate('document.body.classList.contains("pt-kb")'), '%s: typing a set counts as the keyboard being up' % dev)
        if ios:
            c.ok(not p.evaluate(BAR), '%s: while you type, the bar is hidden so it cannot slide up the screen' % dev)
            p.mouse.wheel(0, 600); p.wait_for_timeout(200)
            c.ok(not p.evaluate(BAR), '%s: and stays hidden while you scroll' % dev)
        else:
            c.ok(p.evaluate(BAR), '%s: other phones keep the bar while you type (their page gets shorter for the keyboard)' % dev)
        p.evaluate('document.activeElement.blur()'); p.wait_for_timeout(250)
        c.ok(p.evaluate(BAR) and not p.evaluate('document.body.classList.contains("pt-kb")'), '%s: when the keyboard closes the bar is back' % dev)
        c.eq(errs, [], '%s: no errors' % dev)
        ctx.close()
    b.close()

sys.exit(c.done())
