"""Looks: the Neater look (2.69.0) is on by default, can be switched off and reset, and no screen overflows sideways in any mode."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page

c = Checks('looks')
VIEWS = ['home', 'programs', 'days', 'workout', 'library', 'history', 'progress', 'body', 'cardio']
LIGHT = {'theme': 'light', 'accent': 'emerald', 'bgL': 'paper', 'font': 'system', 'bgfx': 'solid'}

def overflow(p):
    return p.evaluate('document.documentElement.scrollWidth - document.documentElement.clientWidth')

with page() as p:
    p.evaluate('app.selectProgram(app.data.programs.find(x => x.id === "frank_zane_upper_lower_4day"), null, true)')
    attr = lambda: p.evaluate('document.documentElement.getAttribute("data-neat")')
    z900 = lambda: p.evaluate('getComputedStyle(document.documentElement).getPropertyValue("--z900").trim()')
    z850 = lambda: p.evaluate('getComputedStyle(document.documentElement).getPropertyValue("--z850").trim()')
    border = lambda sel: p.evaluate('s => getComputedStyle(document.querySelector(s)).borderTopColor', sel)

    c.eq(attr(), '1', 'Neater look is on by default')
    c.eq(z900(), z850(), 'dark cards take the lighter shade')
    p.evaluate('app.showView("programs")'); p.wait_for_selector('.pgx-pr')
    c.eq(border('.pgx-pr'), 'rgba(0, 0, 0, 0)', 'a program row has no outline')
    c.ok(border('#pgx-q') != 'rgba(0, 0, 0, 0)', 'the search box keeps a soft outline')
    c.eq(p.evaluate('getComputedStyle(document.querySelector("#pt-prog-tools > #btn-import-program")).backgroundColor'), 'rgba(0, 0, 0, 0)', 'tool buttons are quiet')

    # ---- the switch in Settings -> Appearance
    p.evaluate('app.buildAppearanceUI && app.buildAppearanceUI()')
    row = '#pt-appearance [data-sec="neat"]'
    c.ok(p.locator(row).count() == 1, 'Appearance has a Neater look row')
    c.eq(p.inner_text(row + ' .pt-sum').strip(), 'On', 'the row says On')
    p.evaluate('s => { document.querySelector(s).open = true; }', row)
    p.locator(row + ' [data-seg="neat"][data-id="off"]').dispatch_event('click')
    p.wait_for_timeout(200)
    c.eq(attr(), '0', 'Off turns it off')
    c.ok(z900() != z850(), 'cards go back to their old shade')
    c.ok(border('.pgx-pr') != 'rgba(0, 0, 0, 0)', 'program rows have their outline back')
    c.eq(p.inner_text(row + ' .pt-sum').strip(), 'Off', 'the row says Off')
    c.eq(p.evaluate('app.settings.neat'), 'off', 'saved in settings')
    # a theme change keeps the choice
    p.evaluate('app.applyPreset({ id: "midnight", s: { theme: "dark", accent: "sapphire", bg: "midnight", font: "system", bgfx: "glow" } })')
    c.eq(attr(), '0', 'choosing a theme does not turn it back on')
    p.evaluate('app.resetLook()')
    c.eq(attr(), '1', 'Reset look turns it back on')
    c.eq(p.evaluate('app.settings.neat'), None, 'and clears the saved choice')

    # ---- the long day-list description
    p.evaluate('app.showView("days")'); p.wait_for_timeout(500)
    c.ok(p.locator('#pt-desc-more').is_visible(), 'a long description has a More button')
    h0 = p.evaluate('document.getElementById("days-view-program-desc").getBoundingClientRect().height')
    p.click('#pt-desc-more')
    c.ok(p.evaluate('document.getElementById("days-view-program-desc").getBoundingClientRect().height') > h0 * 1.5, 'More shows the whole description')
    c.ok('Less' in p.inner_text('#pt-desc-more'), 'the button turns into Less')
    p.click('#pt-desc-more')
    c.ok(abs(p.evaluate('document.getElementById("days-view-program-desc").getBoundingClientRect().height') - h0) < 2, 'Less folds it again')

    # ---- no sideways overflow on any screen, in dark and light, neat on and off
    for mode, preset in [('dark', None), ('light', LIGHT)]:
        for neat in ['on', 'off']:
            if preset: p.evaluate('s => app.applyPreset({ id: "t", s })', preset)
            else: p.evaluate('app.resetLook()')
            p.evaluate('n => { app.settings.neat = n === "off" ? "off" : undefined; app.saveAppearance(); }', neat)
            for v in VIEWS:
                p.evaluate('v => app.showView(v)', v); p.wait_for_timeout(120)
                c.ok(overflow(p) <= 0, 'no sideways overflow: %s, %s, neat %s' % (v, mode, neat))
    c.eq(p.errors, [], 'no page errors or console errors')
c.done()
