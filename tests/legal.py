"""2.109.0 terms and privacy: the first launch shows the Terms of Service and Privacy Policy (from TERMS.md and PRIVACY.md) in one
scrolling box. It cannot be closed or skipped: Enter App is disabled until the agree box is ticked, Escape does nothing and the
page behind is inert. Agreeing is saved, so a reload goes straight in. A new TERMS_V asks again. Settings can show it again to read.
It fits at 390px and 360px, in dark and light mode, and passes the design audit."""
import json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page, TERMS_V

c = Checks('legal')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUD = open(os.path.join(ROOT, 'tests', 'fixtures', 'design_audit.js'), encoding='utf-8').read()
TERMS = open(os.path.join(ROOT, 'TERMS.md'), encoding='utf-8').read()
PRIV = open(os.path.join(ROOT, 'PRIVACY.md'), encoding='utf-8').read()

# ---- the documents have every clause that was asked for
for need in ['Medical and physical liability disclaimer', 'Assumption of risk', 'Indemnification', 'Limitation of liability',
             '"As is" and no warranty', 'Governing law and jurisdiction', 'Severability', 'Age requirement']:
    c.ok(re.search(r'^## \d+\. ' + re.escape(need), TERMS, re.M), 'TERMS.md has a section: ' + need)
for need in ['ZERO U.S. DOLLARS (US $0.00)', 'MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE', 'State of Washington', 'King County, Washington',
             'at least 13 years old', 'defend, indemnify and hold harmless', 'claims, damages, obligations, losses, liabilities, costs or debt',
             'injury', 'death', 'heavy barbell lifts']:
    c.ok(need in TERMS, 'TERMS.md says: ' + need)
for need in ['collects no data', 'local storage', 'IndexedDB', 'GitHub Pages', 'ntfy.sh', 'children under 13']:
    c.ok(need in PRIV, 'PRIVACY.md says: ' + need)
c.ok('—' not in TERMS + PRIV, 'no em dashes in the legal text')

OPEN = 'document.getElementById("pt-legal") !== null'
for w in (390, 360):
    with page(w=w, terms=False) as p:
        p.wait_for_timeout(300)
        c.ok(p.evaluate(OPEN), '%dpx: the first launch shows the terms' % w)
        c.eq(p.evaluate('localStorage.getItem("pt-terms")'), None, '%dpx: nothing is saved before agreeing' % w)
        st = p.evaluate('''() => { const w = document.getElementById("pt-legal"), b = document.getElementById("pt-legal-box"), card = w.firstElementChild, r = card.getBoundingClientRect();
            return { go: document.getElementById("pt-legal-go").disabled, label: document.getElementById("pt-legal-go").textContent.trim(),
              agree: w.querySelector(".lg-agree").textContent.trim(), scroll: b.scrollHeight > b.clientHeight, oy: getComputedStyle(b).overflowY,
              terms: b.querySelector("#lg-terms h2").textContent, priv: b.querySelector("#lg-privacy h2").textContent,
              h3: b.querySelectorAll("h3").length, fits: r.left >= 0 && r.right <= innerWidth + 0.5 && r.bottom <= innerHeight + 0.5,
              wide: document.documentElement.scrollWidth <= innerWidth, modal: w.getAttribute("aria-modal"), role: w.getAttribute("role"),
              inert: [...document.body.children].filter(e => e !== w && e.tagName === "DIV").every(e => e.inert),
              goBottom: document.getElementById("pt-legal-go").getBoundingClientRect().bottom <= innerHeight + 0.5 }; }''')
        c.ok(st['go'], '%dpx: Enter App starts disabled' % w)
        c.eq(st['label'], 'Enter App', '%dpx: the button says Enter App' % w)
        c.eq(st['agree'], 'I have read and agree to the Terms of Service and Privacy Policy', '%dpx: the agree box wording' % w)
        c.ok(st['scroll'] and st['oy'] == 'auto', '%dpx: the text is in a scrolling box' % w)
        c.eq((st['terms'], st['priv']), ('PulseTrack Terms of Service', 'PulseTrack Privacy Policy'), '%dpx: both documents are in the box' % w)
        c.ok(st['h3'] >= 20, '%dpx: the full documents are there, not a summary (%d sections)' % (w, st['h3']))
        c.ok(st['fits'] and st['wide'] and st['goBottom'], '%dpx: the sheet and its button fit the screen' % w)
        c.eq((st['role'], st['modal']), ('dialog', 'true'), '%dpx: it is a modal dialog for screen readers' % w)
        c.ok(st['inert'], '%dpx: the app behind it is inert' % w)

        # cannot be skipped
        p.keyboard.press('Escape'); p.wait_for_timeout(100)
        c.ok(p.evaluate(OPEN), '%dpx: Escape does not close it' % w)
        p.click('#pt-legal-go', force=True); p.wait_for_timeout(100)
        c.ok(p.evaluate(OPEN), '%dpx: tapping the disabled button does nothing' % w)
        p.mouse.click(5, 5); p.wait_for_timeout(100)
        c.ok(p.evaluate(OPEN), '%dpx: tapping outside does nothing' % w)
        c.ok(p.evaluate('() => { const e = document.elementFromPoint(innerWidth / 2, innerHeight / 2); return !!e && !!e.closest("#pt-legal"); }'), '%dpx: nothing in the app can be reached' % w)

        # the jump buttons move the box
        p.click('#pt-legal [data-j="lg-privacy"]'); p.wait_for_timeout(100)
        c.ok(p.evaluate('document.getElementById("pt-legal-box").scrollTop > 200'), '%dpx: Privacy Policy jumps down the box' % w)

        # tick, untick, tick, enter
        p.check('#pt-legal-ok'); c.ok(not p.evaluate('document.getElementById("pt-legal-go").disabled'), '%dpx: ticking enables Enter App' % w)
        p.uncheck('#pt-legal-ok'); c.ok(p.evaluate('document.getElementById("pt-legal-go").disabled'), '%dpx: unticking disables it again' % w)
        p.check('#pt-legal-ok'); p.click('#pt-legal-go'); p.wait_for_timeout(100)
        c.ok(not p.evaluate(OPEN), '%dpx: Enter App closes it' % w)
        sv = p.evaluate('JSON.parse(localStorage.getItem("pt-terms"))')
        c.ok(sv and sv['v'] == TERMS_V and sv.get('at'), '%dpx: agreeing is saved with the terms version and time' % w)
        c.ok(p.evaluate('[...document.body.children].every(e => !e.inert)'), '%dpx: the app works again' % w)

        p.reload(); p.wait_for_function('typeof PT !== "undefined" && window.app && window.app.data'); p.wait_for_timeout(300)
        c.ok(not p.evaluate(OPEN), '%dpx: after agreeing, a reload goes straight in' % w)
        c.eq(p.errors, [], '%dpx: no errors' % w)

# ---- new terms version asks again, old acceptance does not count
with page(terms=False) as p:
    p.evaluate('localStorage.setItem("pt-terms", JSON.stringify({ v: "2000-01-01", at: "2000-01-01T00:00:00Z" }))')
    p.reload(); p.wait_for_function('typeof PT !== "undefined"'); p.wait_for_timeout(300)
    c.ok(p.evaluate(OPEN), 'agreeing to an older version of the terms asks again')

# ---- Settings shows it again to read, with a Close button; design audit in dark and light
with page() as p:
    c.ok(not p.evaluate(OPEN), 'someone who already agreed is not asked')
    p.evaluate('document.getElementById("btn-legal").click()'); p.wait_for_timeout(100)
    c.ok(p.evaluate(OPEN), 'Settings > Terms and Privacy opens it')
    c.eq(p.evaluate('document.getElementById("pt-legal-go").textContent.trim()'), 'Close', 'read again: the button is Close')
    c.ok(p.evaluate('!document.getElementById("pt-legal-ok")'), 'read again: no agree box')
    c.ok('agreed on' in p.evaluate('document.getElementById("pt-legal").textContent'), 'read again: shows when you agreed')
    for mode in ('dark', 'light'):
        if mode == 'light': p.evaluate('() => { app.settings.theme = "light"; WorkoutStorage.saveSettings(app.settings); app.applyTheme(); }')
        p.wait_for_timeout(200)
        r = p.evaluate(AUD)
        bad = {k: r['samples'][k][:3] for k, v in r['counts'].items() if v}
        c.eq(bad, {}, 'the sheet passes the design audit in %s mode' % mode)
    p.keyboard.press('Escape'); p.wait_for_timeout(100)
    c.ok(not p.evaluate(OPEN), 'read again: Escape closes it')
    c.eq(p.errors, [], 'no errors')

sys.exit(c.done())
