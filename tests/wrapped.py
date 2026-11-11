"""2.91.0 Monthly Wrapped: the numbers for a month, which slides show, the story player (tap, back, hold, keys, close),
the summary and share picture, the recap card button and the Home banner."""
import datetime, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page

c = Checks('wrapped')
SHOTS = '/tmp/claude-0/-home-claude/395da5c4-9b49-54b4-93e4-f9926c59aa1c/scratchpad/'
# last month, with 3 weeks that start in it: 5, 5 and 2 days (goal 5), evening workouts, Bench Press going up, a group, a boss
SEED = '''() => {
  PT.confirm = async () => true; PT.alert = async () => {};
  app.sessions.length = 0; app.settings.myName = "Me"; app.settings.weekGoalLog = [{ t: 0, g: 5 }]; app.settings.weekGoal = 5;
  const now = new Date(), m0 = new Date(now.getFullYear(), now.getMonth() - 1, 1), m1 = new Date(now.getFullYear(), now.getMonth(), 1);
  const K = PT.famKit, mons = []; for (let i = 0; i < 12; i++) { const t = K.wkMon(i); if (t >= m0.getTime() && t < m1.getTime()) mons.unshift(t); }
  const per = [5, 5, 2]; let n = 0, w = 100;
  const add = (t, prs, wt) => { const d = new Date(t); d.setHours(18, 30, 0, 0); const ts = d.getTime() + 3600000;
    app.sessions.push({ id: "w" + (n++), date: PT.ds(d), ts, name: "Day", ex: [{ name: "Bench Press", sets: [{ weight: String(wt), reps: "8" }, { weight: String(wt), reps: "8" }] }, { name: "Lat Pulldown", sets: [{ weight: "90", reps: "10" }] }], vol: wt * 16 + 900, sets: 3, unit: "lb", prs: prs ? ["Bench Press"] : [], dur: 3600 }); };
  add(m0.getTime() - 20 * 86400000, false, 100);                              // the month before: one workout at 100
  mons.slice(0, 3).forEach((t, i) => { for (let k = 0; k < per[i]; k++) { w += 1; add(t + k * 86400000, k === 0, w); } });
  app.settings.fam2 = { Dad: { n: "Dad", t: Date.now(), lv: 3, b: 1, st: 1, l: {}, wk: Object.fromEntries(mons.slice(0, 3).map(t => [K.dsOf(t), { d: 4, g: 4, p: 1 }])) } };
  app.settings.bossWins = { [K.dsOf(mons[0])]: { ts: mons[0] + 5 * 86400000, b: "Iron Golem", c: 20 } };
  app.settings.bossGame = { [K.dsOf(mons[1])]: { used: 6, dmg: 120, hits: 6, crits: 4, best: 40, combo: 0, lost: {} } };
  app.settings.dbBase = Object.assign({}, app.settings.dbBase || {}, { t: m0.getTime() - 86400000 });
  try { PT.loot.reset(); PT.boss.reset(); } catch (e) { }
  window.M0 = m0; window.MONS = mons;
  return { m0: m0.getTime(), weeks: mons.length };
}'''

with page() as p:
    info = p.evaluate(SEED)
    D = p.evaluate('() => { const d = PT.wrapped.data(M0); return { w: d.S.workouts, days: d.S.days, prs: d.S.prCount, hit: d.goalHit, of: d.goalOf, style: d.style && d.style.name, at: d.style && d.style.at, top: d.topEx, wins: d.wins, bdmg: d.bdmg, crits: d.crits, chests: d.nChests, group: d.group && d.group.days, rows: d.group && d.group.rows.map(r => r.n), done: d.done }; }')
    weeks = min(info['weeks'], 3)
    days = [5, 5, 2][:weeks]
    c.eq([D['w'], D['days']], [sum(days), sum(days)], 'workouts and days for the month')
    c.eq(D['prs'], weeks, 'records counted')
    c.eq([D['hit'], D['of']], [2, info['weeks']], 'weeks on the 5 day goal (every week that starts in the month counts)')
    c.eq([D['style'], D['at']], ['Evening lifter', '6:30 pm'], 'training style from when workouts started')
    c.eq(D['top'], 'Bench Press', 'go-to lift')
    c.eq([D['wins'], D['bdmg'], D['crits']], [['Iron Golem'], 120, 4], 'boss wins and battle damage in the month')
    c.ok(D['chests'] >= 1, 'chests earned in the month (%r)' % D['chests'])
    c.eq([D['group'], sorted(D['rows'])], [sum(days) + 4 * weeks, ['Dad', 'Me']], 'the group: days together and who')
    c.eq(D['done'], True, 'last month is a finished month')
    kinds = p.evaluate('() => PT.wrapped.slides(M0).map(s => s.k)')
    c.eq(kinds, ['intro', 'showed', 'goal', 'moved', 'prs', 'lift', 'style', 'boss', 'loot', 'group', 'sum'], 'every slide with something to show')
    c.eq(p.evaluate('() => PT.wrapped.data(new Date(2001, 0, 1))'), None, 'a month with no workouts has no Wrapped')
    p.evaluate('() => { app.toast = m => { window.__t = m; }; PT.wrapped.open(new Date(2001, 0, 1)); }')
    c.eq([p.evaluate('() => !!document.getElementById("pt-wr")'), 'No workouts' in p.evaluate('() => window.__t')], [False, True], 'and says so')
    # quiet month: no group, no boss
    k2 = p.evaluate('() => { const f2 = app.settings.fam2, bw = app.settings.bossWins, bg = app.settings.bossGame; app.settings.fam2 = {}; app.settings.bossWins = {}; app.settings.bossGame = {}; PT.boss.reset(); PT.loot.reset(); const k = PT.wrapped.slides(M0).map(s => s.k); app.settings.fam2 = f2; app.settings.bossWins = bw; app.settings.bossGame = bg; PT.boss.reset(); PT.loot.reset(); return k; }')
    c.ok('group' not in k2 and 'boss' not in k2, 'slides with nothing to show are left out (%r)' % k2)

for w in (390, 360):
    with page(w=w, h=800) as p:
        p.evaluate(SEED)
        # ---------------------------------------------------------------- the recap card button
        p.evaluate('() => { app.progressMonth = new Date(M0); app.showView("progress"); const t = document.querySelector(".pt-ptab[data-tab=history]"); if (t) t.click(); }')
        p.wait_for_timeout(300)
        btn = p.evaluate('() => { const b = document.getElementById("pt-wr-play"); return b ? b.textContent.trim() : null; }')
        c.ok(btn and btn.startswith('▶ Play') and btn.endswith('Wrapped'), '%dpx: the monthly recap card has a Play Wrapped button (%r)' % (w, btn))
        p.evaluate('() => { const b = document.getElementById("pt-wr-play"); b.scrollIntoView({ block: "center" }); }')
        p.click('#pt-wr-play')
        p.wait_for_selector('#pt-wr')
        p.wait_for_timeout(200)
        n = p.evaluate('() => document.querySelectorAll(".pt-wr-bars > i").length')
        c.eq(n, 11, '%dpx: one bar per slide' % w)
        c.eq(p.evaluate('() => PT.wrapped.at()'), 0, '%dpx: starts on the first slide' % w)
        c.ok(p.evaluate('() => document.querySelector(".pt-wr-month").textContent.length > 2'), '%dpx: the month name is the title' % w)
        if w == 390: p.screenshot(path=SHOTS + 'wr0.png')
        # tap right: next, tap left: back
        p.mouse.click(w * 0.8, 400); p.wait_for_timeout(120)
        c.eq(p.evaluate('() => PT.wrapped.at()'), 1, '%dpx: tapping the right side goes on' % w)
        p.wait_for_timeout(1000)
        c.eq(p.evaluate('() => document.querySelector(".pt-wr-big .pt-wr-n").textContent'), '12', '%dpx: the number counts up to the workouts' % w)
        if w == 390: p.screenshot(path=SHOTS + 'wr1.png')
        p.mouse.click(w * 0.1, 400); p.wait_for_timeout(120)
        c.eq(p.evaluate('() => PT.wrapped.at()'), 0, '%dpx: the left side goes back' % w)
        p.keyboard.press('ArrowRight'); p.keyboard.press('ArrowRight')
        c.eq(p.evaluate('() => PT.wrapped.at()'), 2, '%dpx: arrow keys work' % w)
        c.eq(p.evaluate('() => document.querySelectorAll(".pt-wr-wk").length'), p.evaluate('() => MONS.length'), '%dpx: the goal slide shows each week' % w)
        if w == 390: p.screenshot(path=SHOTS + 'wr2.png')
        # hold to pause
        p.mouse.move(w * 0.6, 400); p.mouse.down(); p.wait_for_timeout(400)
        c.eq(p.evaluate('() => document.getElementById("pt-wr").classList.contains("paused")'), True, '%dpx: holding pauses' % w)
        p.mouse.up(); p.wait_for_timeout(80)
        c.eq([p.evaluate('() => document.getElementById("pt-wr").classList.contains("paused")'), p.evaluate('() => PT.wrapped.at()')], [False, 2], '%dpx: letting go plays on, without skipping' % w)
        # it plays on by itself
        p.evaluate('() => { document.getElementById("pt-wr").style.setProperty("--pt-wr-per", "300ms"); PT.wrapped.prev(); PT.wrapped.next(); }')
        p.wait_for_timeout(700)
        c.ok(p.evaluate('() => PT.wrapped.at()') >= 3, '%dpx: each slide moves on by itself' % w)
        # every slide fits
        bad = []
        for i in range(11):
            p.evaluate('(i) => { while (PT.wrapped.at() < i) PT.wrapped.next(); while (PT.wrapped.at() > i) PT.wrapped.prev(); document.getElementById("pt-wr").classList.add("paused"); }', i)
            p.wait_for_timeout(500)
            f = p.evaluate('() => { const s = document.querySelector(".pt-wr-slide").getBoundingClientRect(), st = document.querySelector(".pt-wr-stage").getBoundingClientRect(); return s.left >= -1 && s.right <= innerWidth + 1 && s.top >= st.top - 1 && s.bottom <= st.bottom + 1; }')
            if not f: bad.append(i)
            if w == 360 and i in (4, 7, 9, 10): p.screenshot(path=SHOTS + 'wr360-%d.png' % i)
            if w == 390 and i in (8, 10): p.screenshot(path=SHOTS + 'wr390-%d.png' % i)
        c.eq(bad, [], '%dpx: every slide fits the screen' % w)
        c.ok(p.evaluate('() => document.documentElement.scrollWidth <= innerWidth + 1'), '%dpx: no sideways scroll' % w)
        c.eq(p.evaluate('() => !!document.getElementById("pt-wr-share") && !!document.getElementById("pt-wr-done")'), True, '%dpx: the summary has Share picture and Done' % w)
        size = p.evaluate('async () => { const f = await PT.wrapped.picture(M0); const b = await createImageBitmap(f); return [f.type, b.width, b.height, f.size > 20000]; }')
        c.eq(size, ['image/png', 1080, 1920, True], '%dpx: the share picture is a story-size PNG' % w)
        p.click('#pt-wr-done'); p.wait_for_timeout(300)
        c.eq(p.evaluate('() => !!document.getElementById("pt-wr")'), False, '%dpx: Done closes it' % w)
        p.click('#pt-wr-play'); p.wait_for_selector('#pt-wr'); p.keyboard.press('Escape'); p.wait_for_timeout(300)
        c.eq(p.evaluate('() => !!document.getElementById("pt-wr") || document.body.classList.contains("pt-wr-open")'), False, '%dpx: Escape closes it too' % w)
        p.click('#pt-wr-play'); p.wait_for_selector('#pt-wr'); p.click('.pt-wr-x'); p.wait_for_timeout(300)
        c.eq(p.evaluate('() => !!document.getElementById("pt-wr")'), False, '%dpx: and the ✕' % w)
        c.eq(p.errors, [], '%dpx: no page errors' % w)

# ---------------------------------------------------------------- the Home banner, early in the month
with page() as p:
    now = datetime.datetime.now()
    p.clock.install(time=datetime.datetime(now.year, now.month, 3, 10, 0))
    p.evaluate(SEED)
    p.evaluate('() => { app.settings.recapSeen = ""; app.showView("home"); app.renderHomeBanners(); }')
    t = p.evaluate('() => { const b = document.querySelector(\'[data-banner="recap"]\'); return b ? b.textContent.replace(/\\s+/g, " ") : ""; }')
    c.ok('Wrapped is ready' in t and 'Play' in t, 'the Home banner says your Wrapped is ready, with Play (%r)' % t[:80])
    p.evaluate('() => document.querySelector(\'[data-banner="recap"] .banner-act\').click()')
    c.eq(p.evaluate('() => !!document.getElementById("pt-wr")'), True, 'Play opens the story')
    c.eq(p.evaluate('() => app.settings.recapSeen === PT.ds(M0).slice(0, 7)'), True, 'and the banner is marked as seen')
    c.eq(p.evaluate('() => !!document.querySelector(\'[data-banner="recap"]\')'), False, 'so it goes away')
    c.eq(p.errors, [], 'banner: no page errors')

c.done()
