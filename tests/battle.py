"""2.90.0 boss battle: swings from workouts, perfect/good/miss, combos, the charge counter, hearts per day, the cap of half your workout
damage, the damage reaching the boss and the group (update code), and the battle screen."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page

c = Checks('battle')
SETUP = '''() => {
  PT.confirm = async () => true; PT.alert = async () => {}; PT.prompt = async () => "Me";
  app.settings.myName = "Me"; app.settings.fam2 = {}; app.settings.bossWins = {}; app.settings.bossGame = {}; app.sessions.length = 0;
  PT.setGoalBoth(app, 3); app.settings.weekGoalLog = [{ t: 0, g: 3 }];
  window.__t = []; app.toast = m => { window.__t.push(String(m)); };
  window.WID = i => PT.famKit.dsOf(PT.famKit.wkMon(i));
  window.day = (k, prs) => { const t = PT.famKit.wkMon(0) + k * 86400000 + 12 * 3600000; app.sessions.push({ id: "b" + k + Math.random(), date: PT.ds(new Date(t)), ts: Math.min(t, Date.now() - 1000), name: "Day", ex: [], vol: 1000, sets: 3, unit: "lb", prs: prs || [], dur: 3000 }); PT.boss.reset(); };
  window.F = (o) => Object.assign({ perfect: 0.13, good: 0.4, speed: 1, rage: false, charge: false }, o || {});
}'''
S = '() => PT.battle.swings(app)'

with page() as p:
    p.evaluate(SETUP)
    # ------------------------------------------------------------ swings come from training
    c.eq(p.evaluate(S)['total'], 0, 'no training this week, no swings')
    r = p.evaluate('() => PT.battle.strike(0.5, app, F())')
    c.eq([r['ok'], r['why']], [False, 'swings'], 'and no hits')
    p.evaluate('() => { day(0); day(1, ["Bench"]); }')
    s = p.evaluate(S)
    c.eq([s['total'], s['left'], s['cap']], [3 + 3 + 2, 8, (200 + 50) // 2], '2 training days and a record: 3 + 3 + 2 swings, bonus up to half of 250')
    # ------------------------------------------------------------ the three outcomes
    r = p.evaluate('() => PT.battle.strike(0.5, app, F())')
    c.eq([r['kind'], r['dmg'], r['combo']], ['perfect', 20, 1], 'the middle is a PERFECT: 20')
    r = p.evaluate('() => PT.battle.strike(0.52, app, F())')
    c.eq([r['kind'], r['dmg'], r['combo']], ['perfect', 25, 2], 'two in a row: combo ×1.25')
    r = p.evaluate('() => PT.battle.strike(0.5 + 0.15, app, F())')
    c.eq([r['kind'], r['dmg'], r['combo']], ['good', 10, 0], 'the yellow is GOOD: 10, and the combo is gone')
    h0 = p.evaluate('() => PT.battle.hearts(app)')
    r = p.evaluate('() => PT.battle.strike(0.98, app, F())')
    c.eq([r['kind'], r['dmg'], r['hearts']], ['miss', 0, h0 - 1], 'the red is a MISS: the boss hits back and you lose a heart')
    r = p.evaluate('() => PT.battle.strike(0.5, app, F({ charge: true }))')
    c.eq([r['kind'], r['dmg']], ['counter', 40], 'a perfect hit on a charging boss is a COUNTER for double')
    c.eq(p.evaluate('() => PT.battle.game(app).dmg'), 20 + 25 + 10 + 40, 'the damage adds up')
    c.eq(p.evaluate(S)['left'], 8 - 5, 'every swing is used up, hit or miss')
    # ------------------------------------------------------------ every 4th swing the boss charges; enraged under 30%
    p.evaluate('() => { PT.battle.game(app).used = 3; }')
    c.eq(p.evaluate('() => PT.battle.feel(app).charge'), True, 'the 4th swing is a charge')
    p.evaluate('() => { PT.battle.game(app).used = 4; }')
    c.eq(p.evaluate('() => PT.battle.feel(app).charge'), False, 'the 5th is not')
    p.evaluate('() => { PT.battle.game(app).used = 5; }')
    # ------------------------------------------------------------ the cap: half your workout damage
    r = p.evaluate('() => PT.battle.strike(0.5, app, F({ charge: true }))')
    c.eq([r['dmg'], r['counted'], r['capped']], [50, 125 - 95, True], 'a counter on a ×1.25 combo is 50, but past the cap only the rest counts (125 max)')
    r = p.evaluate('() => PT.battle.strike(0.5, app, F())')
    c.eq([r['ok'], r['why']], [False, 'cap'], 'at the cap: train again to raise it')
    # ------------------------------------------------------------ it hurts the boss
    st = p.evaluate('() => { const s = PT.boss.state(); const me = s.rows.find(r => r.me); return { dmg: s.dmg, bx: me.bx }; }')
    c.eq(st, {'dmg': 250 + 125, 'bx': 125}, 'the boss takes your workout damage plus the battle bonus')
    # ------------------------------------------------------------ hearts: 3 a day
    p.evaluate('() => { day(2); const g = PT.battle.game(app); g.lost[PT.ds()] = 3; }')
    r = p.evaluate('() => PT.battle.strike(0.5, app, F())')
    c.eq([r['ok'], r['why']], [False, 'hearts'], 'with no hearts left you are knocked down for the day')
    p.evaluate('() => { const g = PT.battle.game(app); g.lost = {}; }')
    c.eq(p.evaluate('() => PT.battle.hearts(app)'), 3, 'a new day: 3 hearts')
    # ------------------------------------------------------------ the group sees it: the update code carries it
    code = p.evaluate('() => PT.famUpdateCode(app)')
    o = p.evaluate('(c) => JSON.parse(decodeURIComponent(escape(atob(c.split(".")[1]))))', code)
    c.eq(o.get('bx'), [[p.evaluate('() => WID(0)'), 125]], 'your update carries your battle damage for the week')
    p.evaluate('''(code) => { app.settings.myName = "Dad"; app.settings.fam2 = {}; PT.famReceive(code.replace(/PTF2\\.[^\\s]+/, (t) => t), app); }''', code)
    got = p.evaluate('() => app.settings.fam2.Me && app.settings.fam2.Me.bx')
    c.eq(got, {p.evaluate('() => WID(0)'): 125}, 'and another phone keeps it')
    st = p.evaluate('() => { PT.boss.reset(); const s = PT.boss.state(); const r = s.rows.find(x => x.n === "Me"); return r && r.bx; }')
    c.eq(st, 125, "so it counts in Me's damage on Dad's phone")
    p.evaluate('() => { app.settings.fam2.Me.bx[WID(0)] = 99999; PT.boss.reset(); }')
    c.ok(p.evaluate('() => { const r = PT.boss.state().rows.find(x => x.n === "Me"); return r.bx === Math.floor((r.hits * 100 + r.crits * 50) / 2); }'), "nobody can send more than half their workout damage")
    c.eq(p.errors, [], 'no page errors')

# ================================================================ the battle screen
for w in (390, 360):
    with page(w=w, h=800) as p:
        p.evaluate(SETUP)
        p.evaluate('() => { day(0); day(1); app.settings.battleSound = false; app.showView("progress"); app._progTab = "social"; app.renderProgressView(); document.getElementById("pt-pg-boss").open = true; }')
        c.ok('swings ready' in p.evaluate('() => document.getElementById("pt-pg-boss").textContent'), '%dpx: the boss card shows swings ready' % w)
        p.click('#pt-boss-battle')
        p.wait_for_selector('#pt-bb-hit')
        p.wait_for_timeout(200)
        c.eq(p.inner_text('#pt-bb-sw'), '⚔️ 6', '%dpx: the battle shows 6 swings' % w)
        hp0 = p.evaluate('() => PT.boss.state().left')
        p.evaluate('() => PT.battle.setPos(0.5)')
        p.click('#pt-bb-hit')
        p.wait_for_timeout(100)
        c.eq(p.evaluate('() => PT.boss.state().left'), hp0 - 20, '%dpx: tapping HIT in the green takes 20 off' % w)
        c.ok(p.evaluate('() => document.querySelectorAll(".pt-bbfloat").length') >= 1, '%dpx: a damage number pops up' % w)
        c.eq(p.inner_text('#pt-bb-sw'), '⚔️ 5', '%dpx: one swing used' % w)
        p.evaluate('() => PT.battle.setPos(0.01)')
        p.click('#pt-bb-hit')
        p.wait_for_timeout(100)
        c.eq(p.inner_text('#pt-bb-hearts'), '❤️❤️🖤', '%dpx: a miss costs a heart' % w)
        c.ok(p.evaluate('() => { const m = document.getElementById("pt-bb-mark"); const a = m.style.left; return new Promise(r => setTimeout(() => r(a !== m.style.left), 200)); }'), '%dpx: the marker moves' % w)
        c.ok(p.evaluate('() => document.documentElement.scrollWidth <= window.innerWidth + 1'), '%dpx: no sideways scroll' % w)
        for _ in range(6):
            if p.evaluate('() => document.getElementById("pt-bb-hit").disabled'): break
            p.evaluate('() => PT.battle.setPos(0.5)'); p.click('#pt-bb-hit'); p.wait_for_timeout(60)
        c.ok(p.evaluate('() => document.getElementById("pt-bb-hit").disabled'), '%dpx: out of swings (or at the cap), HIT is off' % w)
        c.ok(len(p.inner_text('#pt-bb-hit')) > 5, '%dpx: and says why' % w)
        p.click('#pt-bb-mute')
        c.eq(p.evaluate('() => app.settings.battleSound'), True, '%dpx: the sound can be turned on and off' % w)
        p.keyboard.press('Escape')
        p.evaluate('() => { const el = document.getElementById("pt-battle"); if (el && !el.classList.contains("hidden")) PT.kit.closeSheet(el); }')
        p.wait_for_timeout(400)
        c.ok('+' in p.evaluate('() => document.querySelector(".pt-bbline").textContent'), '%dpx: back on the card, the battle bonus shows' % w)
        c.eq(p.errors, [], '%dpx: no page errors' % w)

c.done()
