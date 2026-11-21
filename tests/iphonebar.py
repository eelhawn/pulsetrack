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
        # 3.13.0: the rest timer while typing
        p.evaluate('app.restTimer.start(90)'); p.wait_for_timeout(300)
        p.focus('#view-workout [data-ex-card] input[type=number]'); p.wait_for_timeout(400)
        st = p.evaluate('''() => { const t = document.getElementById("floating-rest-timer"), c = document.getElementById("pt-rest-inline");
          return { float: getComputedStyle(t).display !== "none", chip: !!c, inCard: !!(c && c.closest("[data-ex-card]") && c.closest("[data-ex-card]").contains(document.activeElement)), text: c ? c.innerText : "" }; }''')
        if ios:
            c.ok(not st['float'] and st['chip'] and st['inCard'], '%s: while you type, the rest timer shows on the exercise card you type in, not floating' % dev)
            c.ok('Rest' in st['text'] and any(ch.isdigit() for ch in st['text']), '%s: with the time left (%s)' % (dev, st['text'].replace(chr(10), ' ')))
            t1 = p.evaluate('document.getElementById("pt-rest-inline").innerText'); p.wait_for_timeout(1300)
            c.ok(p.evaluate('document.getElementById("pt-rest-inline").innerText') != t1, '%s: and it counts down' % dev)
        else:
            c.ok(st['float'] and not st['chip'], '%s: other phones keep the floating rest timer while you type' % dev)
        p.evaluate('document.activeElement.blur()'); p.wait_for_timeout(300)
        c.ok(not p.evaluate('!!document.getElementById("pt-rest-inline")') and p.evaluate('getComputedStyle(document.getElementById("floating-rest-timer")).display !== "none"'), '%s: when the keyboard closes the rest timer floats again' % dev)
        p.evaluate('app.restTimer.stop ? app.restTimer.stop() : (app.restTimer.skip && app.restTimer.skip())')
        c.eq(errs, [], '%s: no errors' % dev)
        ctx.close()
    b.close()

sys.exit(c.done())
