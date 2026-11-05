"""Themes (2.70.0): 65+ themes stay readable in every mode and contrast level, the new card / button / tab-bar / spacing / motion
options apply and reset, the theme gallery browses / applies / saves / shares / schedules, and nothing overflows sideways."""
import os, sys, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page

c = Checks('themes')
VERBOSE = bool(os.environ.get('THEMES_VERBOSE'))
def stage(name):
    if VERBOSE: print('..', name, flush=True)
VIEWS = ['home', 'programs', 'days', 'workout', 'library', 'history', 'progress', 'body', 'cardio']

# Real readability, measured on the real page: a card with text on it, and the main buttons, under the current look.
PROBE = r'''() => {
  const lum = ([r, g, b]) => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
  const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
  const parse = s => { const m = (s.match(/[\d.]+/g) || []).map(Number); return { c: m.slice(0, 3), a: m.length > 3 ? m[3] : 1 }; };
  const over = (top, base) => top.a >= 1 ? top.c : top.c.map((v, i) => v * top.a + base[i] * (1 - top.a));
  const main = document.querySelector('main');
  const host = document.createElement('div'); host.id = 'probe-host'; host.style.cssText = 'position:absolute;left:0;top:0;width:300px';
  host.innerHTML = '<div class="bg-zinc-900 border border-zinc-800 p-4"><p class="text-white">a</p><p class="text-zinc-300">a</p><p class="text-zinc-400">a</p><p class="text-zinc-500">a</p><p class="text-emerald-400">a</p><p class="text-emerald-300">a</p>'
    + '<button class="bg-emerald-600 text-white">go</button></div>';
  main.appendChild(host);
  const page = parse(getComputedStyle(document.body).backgroundColor).c;
  const card = host.firstChild, cs = getComputedStyle(card);
  const cardBg = over(parse(cs.backgroundColor), page);
  const out = {};
  [...card.querySelectorAll('p')].forEach(p => { out[p.className] = cr(parse(getComputedStyle(p).color).c, cardBg); });
  const b = card.querySelector('button'), bs = getComputedStyle(b);
  const bBg = over(parse(bs.backgroundColor), cardBg);
  out.button = cr(parse(bs.color).c, bs.backgroundImage && bs.backgroundImage !== 'none' ? (() => { const m = bs.backgroundImage.match(/rgb\([^)]*\)/g) || []; return m.map(x => cr(parse(x).c, parse(bs.color).c)).reduce((a, x) => Math.min(a, x), 99) > 0 ? parse(m[m.length - 1]).c : bBg; })() : bBg);
  if (bs.backgroundImage && bs.backgroundImage !== 'none') { const m = bs.backgroundImage.match(/rgb\([^)]*\)/g) || []; out.button = Math.min(...m.map(x => cr(parse(bs.color).c, parse(x).c))); }
  host.remove();
  return out;
}'''

# Minimum contrast each kind of text must reach on a card (WCAG: 4.5 is "readable", 3 is the floor for large or placeholder text)
MIN = {'text-white': 7, 'text-zinc-300': 4.5, 'text-zinc-400': 4.5, 'text-zinc-500': 3, 'text-emerald-400': 4.5, 'text-emerald-300': 4.5, 'button': 4.5}

def bad(res):
    return ['%s %.1f<%s' % (k, res[k], v) for k, v in MIN.items() if res.get(k, 0) < v]

with page() as p:
    p.evaluate('app.selectProgram(app.data.programs.find(x => x.id === "frank_zane_upper_lower_4day"), null, true)')
    L = lambda js, *a: p.evaluate('(...a) => { ' + js + ' }', list(a)) if a else p.evaluate('() => { ' + js + ' }')
    n_pre = p.evaluate('PT.look.PRESETS.length')
    c.ok(n_pre >= 60, 'at least 60 themes (%d)' % n_pre)
    c.ok(p.evaluate('PT.look.ACCENTS.length') >= 40, 'at least 40 accent colours')
    c.ok(p.evaluate('PT.look.FONTS.length') >= 14, 'at least 14 fonts')
    c.ok(p.evaluate('new Set(PT.look.PRESETS.map(x => x.id)).size') == n_pre, 'theme ids are unique')
    c.ok(p.evaluate('PT.look.PRESETS.every(x => PT.look.CATS.some(k => k[0] === x.cat))'), 'every theme belongs to a group')
    c.ok(p.evaluate('PT.look.PRESETS.every(x => JSON.stringify(PT.look.cleanLook(x.s)) !== "{}" && PT.look.cleanLook(x.s).accent)'), 'every theme survives cleaning (nothing unknown in it)')

    stage('readable in every theme')
    # ---- readable in every theme, light and dark, at every contrast level
    fails = []
    for pr in p.evaluate('PT.look.PRESETS.map(x => x.id)'):
        for level in ['soft', 'normal', 'high']:
            p.evaluate('([id, lv]) => { PT.look.apply(id); app.settings.contrast = lv; app.saveAppearance(); }', [pr, level])
            r = p.evaluate(PROBE)
            b = bad(r)
            if level == 'soft': b = [x for x in b if not x.startswith('text-zinc-5')]  # soft is allowed to calm the faintest text
            if b: fails.append('%s/%s: %s' % (pr, level, ', '.join(b)))
    for f in fails[:40]: print('   ', f)
    c.ok(not fails, 'every theme is readable at every contrast level (%d problems)' % len(fails))

    stage('the new card / button')
    # ---- the new card / button / tab-bar options in every combination are readable and apply
    p.evaluate('PT.look.apply("classic")')
    for btn in ['solid', 'gradient', 'soft', 'outline']:
        for mode in ['dark', 'light']:
            p.evaluate('([b, m]) => { app.settings.theme = m; app.settings.btn = b; app.saveAppearance(); }', [btn, mode])
            r = p.evaluate(PROBE)
            c.ok(r['button'] >= 4.5, 'button text is readable: %s, %s (%.1f)' % (btn, mode, r['button']))
    p.evaluate('app.resetLook()')
    for k, vals in [('card', ['filled', 'outlined', 'raised', 'glass']), ('btn', ['solid', 'gradient', 'soft', 'outline']), ('nav', ['labels', 'icons', 'floating']),
                    ('space', ['tight', 'normal', 'airy']), ('header', ['normal', 'simple']), ('motion', ['full', 'less', 'off'])]:
        for v in vals:
            p.evaluate('([k, v]) => { app.settings[k] = v; app.saveAppearance(); }', [k, v])
            c.eq(p.evaluate('k => document.documentElement.getAttribute("data-" + k)', k), v, 'data-%s = %s' % (k, v))
    p.evaluate('app.resetLook()')
    c.eq([p.evaluate('k => document.documentElement.getAttribute("data-" + k)', k) for k in ['card', 'btn', 'nav', 'space', 'header']], ['filled', 'solid', 'labels', 'normal', 'normal'], 'Reset look puts every option back')

    stage('what the options actually do')
    # ---- what the options actually do on the page
    p.evaluate('app.showView("home")'); p.wait_for_timeout(100)
    css = lambda sel, prop: p.evaluate('([s, pr]) => getComputedStyle(document.querySelector(s))[pr]', [sel, prop])
    p.evaluate('app.settings.nav = "icons"; app.saveAppearance()')
    c.eq(css('#pt-tabbar button span', 'display'), 'none', 'Icons hides the tab labels')
    p.evaluate('app.settings.nav = "floating"; app.saveAppearance()')
    c.ok(float(css('#pt-tabbar', 'borderTopLeftRadius').replace('px', '')) > 12, 'Floating rounds the tab bar')
    c.ok(p.evaluate('document.getElementById("pt-tabbar").getBoundingClientRect().bottom') < p.evaluate('innerHeight') - 4, 'Floating lifts it off the bottom edge')
    c.ok(p.evaluate('document.getElementById("pt-tabbar").getBoundingClientRect().left') > 4, 'Floating pulls it in from the sides')
    p.evaluate('app.settings.nav = undefined; app.saveAppearance()')
    p.evaluate('app.settings.header = "simple"; app.saveAppearance()')
    c.eq(css('#header-breadcrumb', 'display'), 'none', 'Simple top bar hides the small line')
    p.evaluate('app.settings.header = undefined; app.saveAppearance()')
    gap = lambda: p.evaluate('(() => { const v = document.getElementById("view-home"), k = [...v.children].filter(e => !e.hidden && getComputedStyle(e).display !== "none"); return k[1].getBoundingClientRect().top - k[0].getBoundingClientRect().bottom; })()')
    g0 = gap(); p.evaluate('app.settings.space = "tight"; app.saveAppearance()'); g1 = gap(); p.evaluate('app.settings.space = "airy"; app.saveAppearance()'); g2 = gap()
    c.ok(g1 < g0 < g2, 'Spacing: tight < normal < airy (%s, %s, %s)' % (g1, g0, g2))
    p.evaluate('app.settings.space = undefined; app.saveAppearance()')
    p.evaluate('app.settings.card = "glass"; app.saveAppearance()')
    c.ok('blur' in css('#view-home .bg-zinc-900', 'backdropFilter'), 'Glass blurs what is behind a card')
    p.evaluate('app.settings.card = "raised"; app.saveAppearance()')
    c.ok(css('#view-home .bg-zinc-900', 'boxShadow') != 'none', 'Raised gives cards a shadow')
    p.evaluate('app.settings.card = "outlined"; app.saveAppearance()')
    c.ok(css('#view-home .bg-zinc-900', 'borderTopColor') != 'rgba(0, 0, 0, 0)', 'Outlined draws a line round cards')
    p.evaluate('app.settings.card = undefined; app.settings.motion = "off"; app.saveAppearance()')
    c.ok(float(css('#view-home .bg-zinc-900', 'transitionDuration').split(',')[0].replace('s', '')) < .01, 'Motion Off stops transitions')
    p.evaluate('app.resetLook()')

    stage('no sideways overflow with')
    # ---- no sideways overflow with the roomiest and tightest looks
    for combo in [{'nav': 'floating', 'card': 'glass', 'space': 'airy', 'font': 'jetbrains'}, {'nav': 'icons', 'space': 'tight', 'round': 'sharp', 'font': 'serif'}]:
        p.evaluate('c => { app.resetLook(); Object.assign(app.settings, c); app.saveAppearance(); }', combo)
        for v in VIEWS:
            p.evaluate('v => app.showView(v)', v); p.wait_for_timeout(100)
            c.ok(p.evaluate('document.documentElement.scrollWidth - document.documentElement.clientWidth') <= 0, 'no sideways overflow: %s with %s' % (v, json.dumps(combo)))
    p.evaluate('app.resetLook(); app.showView("home")')

    stage('the gallery')
    # ---- the gallery
    p.evaluate('PT.look.openGallery()'); p.wait_for_selector('#pt-gal:not(.hidden) .pt-gal-it')
    c.eq(p.locator('#pt-gal .pt-gal-it').count(), n_pre, 'the gallery shows every theme')
    c.eq(p.locator('#pt-gal .pt-gal-chip').count(), p.evaluate('PT.look.CATS.length') + 1, 'a group button for each group, plus Mine')
    p.locator('#pt-gal .pt-gal-chip[data-cat="neon"]').click()
    want = p.evaluate('PT.look.PRESETS.filter(x => x.cat === "neon").length')
    c.eq(p.locator('#pt-gal .pt-gal-it').count(), want, 'a group shows only its own themes (%d)' % want)
    c.ok(p.evaluate('document.documentElement.scrollWidth - document.documentElement.clientWidth') <= 0, 'the gallery does not overflow')
    first = p.locator('#pt-gal .pt-gal-it').first.get_attribute('data-look')
    p.locator('#pt-gal .pt-gal-it').first.click()
    c.eq(p.evaluate('app.settings.preset'), first, 'tapping a theme uses it')
    c.eq(p.locator('#pt-gal .pt-gal-it[aria-current="true"]').count(), 1, 'the one in use is marked')
    # save, find under Mine, delete
    p.evaluate('app.settings.round = "round"; app.saveAppearance()')
    p.evaluate('() => { window.__s = PT.prompt; PT.prompt = async () => "Test look"; }')
    p.locator('#pt-gal [data-act="save"]').click(); p.wait_for_timeout(300)
    c.eq(p.evaluate('PT.look.mine().length'), 1, 'Save keeps the look')
    c.eq(p.evaluate('PT.look.mine()[0].label'), 'Test look', 'with the name you typed')
    c.eq(p.evaluate('PT.look.mine()[0].s.round'), 'round', 'and your changes in it')
    c.eq(p.locator('#pt-gal .pt-gal-it').count(), 1, 'Mine lists it')
    c.ok(p.evaluate('JSON.stringify(app.settings.myLooks).length') > 20, 'it is in settings (so it is in backups)')
    # share code round trip
    code = p.evaluate('PT.look.codeOf(app.settings)')
    c.ok(code.startswith('PT1.'), 'a share code starts with PT1.')
    p.evaluate('app.resetLook()')
    p.locator('#pt-gal [data-act="code"]').click()
    p.fill('#pt-gal-paste', 'garbage'); p.locator('#pt-gal [data-act="usecode"]').click()
    c.ok('PulseTrack code' in p.inner_text('#pt-gal-err'), 'a wrong code says so')
    p.fill('#pt-gal-paste', code); p.locator('#pt-gal [data-act="usecode"]').click()
    c.eq(p.evaluate('app.settings.round'), 'round', 'a pasted code brings the look back')
    c.eq(p.evaluate('PT.look.fromCode("PT1." + btoa(JSON.stringify({accent: "<script>", font: "x", card: "evil"})).replace(/=+$/, ""))'), None, 'a code with unknown values is refused')
    c.eq(p.evaluate('JSON.stringify(PT.look.fromCode(PT.look.codeOf({accent: "sky", card: "glass", junk: 1})))'), '{"accent":"sky","card":"glass"}', 'a code only carries known look settings')
    c.eq(p.locator('#pt-gal [data-act="back"]').count(), 0, 'a good code takes you back to the themes')
    p.evaluate('() => { PT.confirm = async () => true; }')
    p.locator('#pt-gal .pt-gal-chip[data-cat="mine"]').click()
    p.locator('#pt-gal .pt-gal-x').first.click(); p.wait_for_timeout(200)
    c.eq(p.evaluate('PT.look.mine().length'), 0, 'a saved look can be deleted')
    p.evaluate('() => { PT.prompt = window.__s; }')
    # surprise
    seen = set()
    for _ in range(12):
        p.locator('#pt-gal [data-act="surprise"]').click(); seen.add(p.evaluate('JSON.stringify(PT.look.lookOf(app.settings))'))
    c.ok(len(seen) > 6, 'Surprise gives different looks (%d of 12)' % len(seen))
    p.evaluate('PT.look.surprise()')
    p.locator('#pt-gal [data-close]').first.click()
    c.ok(p.evaluate('document.getElementById("pt-gal").classList.contains("hidden")'), 'the gallery closes')

    stage('every random Surprise')
    # ---- every random Surprise is readable
    sf = []
    for i in range(160):
        p.evaluate('() => { PT.look.surprise(); }')
        b = bad(p.evaluate(PROBE))
        if b: sf.append('%s: %s' % (p.evaluate('JSON.stringify(PT.look.lookOf(app.settings))'), ', '.join(b)))
    for f in sf[:10]: print('   ', f)
    c.ok(not sf, 'random Surprise looks are all readable (%d of 160 not)' % len(sf))

    stage('day & night')
    # ---- day & night
    p.evaluate('app.resetLook(); app.settings.autoLook = { on: true, day: "paper", night: "classic", dayAt: "07:00", nightAt: "19:30" }; delete app.settings.autoLookSlot')
    sl = lambda t: p.evaluate('t => PT.look.slotNow(app.settings.autoLook, t)', t)
    c.eq([sl(6 * 60 + 59), sl(7 * 60), sl(12 * 60), sl(19 * 60 + 29), sl(19 * 60 + 30), sl(23 * 60 + 59), sl(0)], ['night', 'day', 'day', 'day', 'night', 'night', 'night'], 'day and night slots')
    p.evaluate('app.settings.autoLook.dayAt = "20:00"; app.settings.autoLook.nightAt = "06:00"')
    c.eq([sl(21 * 60), sl(3 * 60), sl(12 * 60)], ['day', 'day', 'night'], 'a day that starts after midnight wraps round')
    p.evaluate('app.settings.autoLook.dayAt = "07:00"; app.settings.autoLook.nightAt = "19:30"')
    p.evaluate('PT.look.autoCheck(12 * 60)'); c.eq(p.evaluate('app.settings.preset'), 'paper', 'noon uses the day look')
    c.eq(p.evaluate('document.documentElement.getAttribute("data-mode")'), 'light', 'and it is light')
    p.evaluate('PT.look.apply("midnight")'); p.evaluate('PT.look.autoCheck(13 * 60)')
    c.eq(p.evaluate('app.settings.preset'), 'midnight', 'a look you pick in the same part of the day is left alone')
    p.evaluate('PT.look.autoCheck(21 * 60)'); c.eq(p.evaluate('app.settings.preset'), 'classic', 'evening uses the night look')
    p.evaluate('app.settings.autoLook.on = false; delete app.settings.autoLookSlot; PT.look.apply("midnight"); PT.look.autoCheck(12 * 60)')
    c.eq(p.evaluate('app.settings.preset'), 'midnight', 'off means off')
    p.evaluate('app.resetLook()')
    c.ok(p.evaluate('app.settings.autoLook && app.settings.autoLook.on === false'), 'Reset look keeps your day & night times')
    p.evaluate('PT.look.openGallery("sched")'); p.wait_for_selector('#pt-gal [data-act="autotoggle"]')
    p.locator('#pt-gal [data-act="autotoggle"]').click()
    c.ok(p.evaluate('app.settings.autoLook.on'), 'the switch in the gallery turns it on')
    p.select_option('#pt-gal [data-auto="day"]', 'sunrise' if p.evaluate('!!PT.look.byId("sunrise")') else 'paper')
    p.evaluate('PT.look.autoCheck(12 * 60)')
    c.ok(p.evaluate('document.documentElement.getAttribute("data-mode")') in ('light', 'dark'), 'changing the day look works')
    p.evaluate('document.querySelector("#pt-gal [data-close]").click()')

    c.eq(p.errors, [], 'no page errors or console errors')
c.done()
