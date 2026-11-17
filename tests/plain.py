"""2.108.0 a plainer design: on every main screen, in dark and light mode, none of the stock "generated app" tells: low-contrast text,
frosted glass, coloured left stripes on cards, emoji in headings, em dashes, gradient text, purple-to-blue gradients, small tracked
capital labels, buttons that fade on hover. Plus: Home's quick actions are one plain bar, no badge above the program name, a real
subtitle instead of "Dashboard", and no em dash left in the app's text or the programs. The scan is tests/fixtures/design_audit.js."""
import glob, json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page

c = Checks('plain')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUD = open(os.path.join(ROOT, 'tests', 'fixtures', 'design_audit.js'), encoding='utf-8').read()
ID = 'my_6day_chest_back_legs_sharms'
SHOTS = '/tmp/claude-0/-home-claude/395da5c4-9b49-54b4-93e4-f9926c59aa1c/scratchpad/'
SEED = '''() => { const pr = app.data.programs.find(x => x.id === "%s"); app.selectProgram(pr, null, true); app.activeProgram = pr; app.activeDay = pr.days[0];
  const t = Date.now(); for (let i = 0; i < 40; i++) app.sessions.push({ id: "s" + i, date: PT.ds(new Date(t - i * 2 * 86400000)), ts: t - i * 2 * 86400000, pid: pr.id, day: 1, dtitle: "Day 1: Chest & Back", unit: "lb", dur: 3600,
   ex: [{ name: "Bench Press", sets: [{ w: 185 + i, r: 8, t: "R" }, { w: 185, r: 7, t: "R" }] }, { name: "Lat Pulldown", sets: [{ w: 150, r: 10, t: "R" }] }], vol: 4000, sets: 3, prs: [] });
  app.sessions.sort((a, b) => a.ts - b.ts); app.saveSessions(); app.rebuildPRs(); PT.cardio.addLog({ id: "c1", date: PT.ds(), ts: t, act: "run", name: "Run", cat: "cardio", sec: 1200, int: 2 }); }''' % ID
VIEWS = [('Home', 'app.showView("home"); app.renderHomeView()'), ('Workout', 'app.activeDay = app.activeProgram.days[0]; app.showView("workout"); app.renderWorkoutView()'),
         ('Days', 'app.showView("days"); app.renderDaysView()'), ('History', 'app.showView("history")'),
         ('Progress', 'app._progTab = "overview"; app.showView("progress")'), ('Strength', 'app._progTab = "strength"; app.renderProgressView()'),
         ('Rewards', 'app._progTab = "rewards"; app.renderProgressView()'), ('Muscles', 'app._progTab = "muscles"; app.renderProgressView()'),
         ('Settings', 'app.openSettings()'), ('Picker', 'app.closeSettings && app.closeSettings(); app.activeDay = app.activeProgram.days[0]; app.showView("workout"); app.openExerciseSelector("add")'),
         ('Programs', 'document.getElementById("modal-ex-selector").classList.add("hidden"); app.showView("programs")')]
NAMES = {'contrast': 'text below 4.5:1 (3:1 large)', 'blur': 'frosted glass', 'leftBorder': 'coloured left stripe', 'emojiHead': 'emoji in a heading', 'emDash': 'em dash',
         'clipText': 'gradient text', 'purpleBlue': 'purple-to-blue gradient', 'eyebrow': 'small tracked capitals', 'hoverFade': 'button fading on hover'}

for mode in ('dark', 'light'):
    with page(w=390, h=844) as p:
        p.evaluate(SEED)
        if mode == 'light': p.evaluate('() => { app.settings.theme = "light"; WorkoutStorage.saveSettings(app.settings); app.applyTheme(); }')
        p.wait_for_timeout(300)
        for name, js in VIEWS:
            p.evaluate('() => { %s; }' % js); p.wait_for_timeout(300)
            r = p.evaluate(AUD)
            bad = {NAMES[k]: r['samples'][k][:3] for k, v in r['counts'].items() if v}
            c.eq(bad, {}, '%s, %s mode: none of the listed tells' % (name, mode))
            if name == 'Home':
                c.ok(p.evaluate('() => /\\w+day, \\w+ \\d+/.test(document.getElementById("header-breadcrumb").innerText)'), '%s mode: Home\'s subtitle is the date, not "Dashboard"' % mode)
                q = p.evaluate('''() => { const g = document.getElementById("pt-hg-quick"), bs = [...g.children]; const tops = new Set(bs.map(b => Math.round(b.getBoundingClientRect().top)));
                  return [bs.length, tops.size, bs.every(b => [...b.children].filter(x => getComputedStyle(x).display !== "none").length === 1), getComputedStyle(g).borderTopWidth]; }''')
                c.eq(q, [3, 1, True, '1px'], '%s mode: the quick actions are one plain bar of three buttons, no icon boxes' % mode)
                c.ok(p.evaluate('() => { const t = document.getElementById("home-program-title"), b = document.getElementById("home-active-day-badge"); return b.getBoundingClientRect().top > t.getBoundingClientRect().top && !!document.getElementById("home-chip").hidden; }'), '%s mode: no badge above the program name, the day count is under it' % mode)
                c.ok(p.evaluate('() => !/[⚡🏆]/.test(document.getElementById("btn-home-resume").textContent + document.getElementById("finish-bar").textContent)'), '%s mode: Start and Finish have no emoji' % mode)
                c.ok(p.evaluate('() => document.documentElement.scrollWidth <= innerWidth + 1'), '%s mode: no sideways scroll' % mode)
                p.screenshot(path=SHOTS + 'plain-%s-home.png' % mode)
        c.eq(p.errors, [], '%s mode: no page errors' % mode)

with page(w=360, h=800) as p:
    p.evaluate(SEED); p.evaluate('() => { app.showView("home"); app.renderHomeView(); }'); p.wait_for_timeout(300)
    c.ok(p.evaluate('() => [...document.getElementById("pt-hg-quick").children].every(b => b.scrollWidth <= b.clientWidth + 1)'), '360px: the three labels fit')
    c.ok(p.evaluate('() => document.documentElement.scrollWidth <= innerWidth + 1'), '360px: no sideways scroll')

# the text itself: no em dash outside comments, none in the programs
left = []
for f in sorted(glob.glob(os.path.join(ROOT, 'src', 'js', '*.js'))) + [os.path.join(ROOT, 'src', 'index.template.html')]:
    for i, l in enumerate(open(f, encoding='utf-8'), 1):
        if '—' in l and not re.match(r'\s*(//|\*|/\*|<!--)', l) and 'replace(/^' not in l:
            left.append('%s:%d' % (os.path.basename(f)[:3], i))
c.eq(left, [], 'no em dash in the app\'s text')
c.eq(open(os.path.join(ROOT, 'programs.js'), encoding='utf-8').read().count('—'), 0, 'none in the programs either')
c.done()
