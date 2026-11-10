"""Family boss fight: damage and health from the family updates, boss level, kept wins, coins, titles, the card, and Rally."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page

c = Checks('boss')
TAB = '() => { app.showView("progress"); app._progTab = "social"; app.renderProgressView(); }'

SETUP = '''() => {
  PT.confirm = async () => true; PT.alert = async () => {}; PT.prompt = async () => "Me";
  app.settings.myName = "Me"; app.settings.fam2 = {}; app.settings.bossWins = {}; app.sessions.length = 0;
  window.__t = []; app.toast = m => { window.__t.push(String(m)); };
  window.WID = i => PT.famKit.dsOf(PT.famKit.wkMon(i));
  window.addDay = (i, k) => { const t = PT.famKit.wkMon(i) + k * 86400000 + 12 * 3600000; app.sessions.push({ id: "b" + i + "_" + k, date: PT.ds(new Date(t)), ts: t, name: "Day", ex: [], vol: 1000, sets: 3, unit: "lb", prs: [], dur: 3000 }); };
  window.addToday = () => { const t = Date.now(); app.sessions.push({ id: "bt" + t, date: PT.ds(new Date(t)), ts: t, name: "Day", ex: [], vol: 1000, sets: 3, unit: "lb", prs: [], dur: 3000 }); };
  window.fam = (name, wks) => { const f = app.settings.fam2; const wk = {}; Object.keys(wks).forEach(i => { wk[WID(+i)] = wks[i]; }); f[name] = { n: name, t: Date.now(), rx: Date.now(), lv: 3, b: 2, st: 1, l: { bench: 0, squat: 0, dead: 0, ohp: 0 }, sr: null, sl: null, pg: null, wk }; PT.boss.reset(); };
}'''

with page() as p:
    p.evaluate(SETUP)
    # ------------------------------------------------------------ the boss of a week
    b0 = p.evaluate('() => PT.boss.bossOf(WID(0)).n')
    c.eq(p.evaluate('() => PT.boss.bossOf(WID(12)).n'), p.evaluate('() => PT.boss.bossOf(WID(0)).n'), 'bosses rotate: 12 weeks later is the same one')
    c.ok(p.evaluate('() => PT.boss.bossOf(WID(0)).n !== PT.boss.bossOf(WID(1)).n'), 'and every week has a new one')
    c.eq(len(p.evaluate('() => PT.boss.BOSSES')), 12, '12 bosses')
    # ------------------------------------------------------------ alone
    p.evaluate('() => { addToday(); PT.boss.reset(); }')
    st = p.evaluate('() => { const s = PT.boss.state(); return { n: s.rows.length, hp: s.hp, dmg: s.dmg, won: s.won, lvl: s.lvl, left: s.left }; }')
    c.eq(st['n'], 1, 'alone: just you')
    c.eq(st['hp'], 300, 'health = 100 for every day of your weekly goal (3)')
    c.eq(st['dmg'], 100, 'one day trained = 100 damage')
    c.eq(st['left'], 200, 'so 200 to go')
    c.eq(st['lvl'], 0, 'a first boss is level 1 (no wins in a row yet)')
    # ------------------------------------------------------------ the family
    p.evaluate('() => { fam("Dad", { 0: { d: 3, g: 3, p: 1 } }); fam("Bro", { 0: { d: 0, g: 4, p: 0 } }); }')
    st = p.evaluate('() => { const s = PT.boss.state(); return { n: s.rows.length, hp: s.hp, dmg: s.dmg, won: s.won, dads: s.rows.find(r => r.n === "Dad").dmg, bro: s.rows.find(r => r.n === "Bro").dmg }; }')
    c.eq(st['n'], 3, 'three in the fight')
    c.eq(st['hp'], 300 + 300 + 400, 'health adds everyone\'s own weekly goal (3 + 3 + 4 days)')
    c.eq(st['dads'], 350, 'Dad: 3 days (300) and a record (a 50 critical hit)')
    c.eq(st['dmg'], 100 + 350 + 0, 'the damage adds up')
    c.eq(st['won'], False, 'not yet')
    # somebody who has not sent an update this week counts in the health and shows as waiting
    p.evaluate('() => { fam("Mom", {}); }')
    c.eq(p.evaluate('() => PT.boss.state().hp'), 1300, 'someone with no update this week still counts in the health')
    c.eq(p.evaluate('() => PT.boss.state().rows.find(r => r.n === "Mom").wait'), True, 'and shows as waiting')
    p.evaluate('() => { delete app.settings.fam2.Mom; PT.boss.reset(); }')
    # one day over the goal counts, two do not
    p.evaluate('() => { fam("Bro", { 0: { d: 7, g: 4, p: 9 } }); }')
    c.eq(p.evaluate('() => PT.boss.state().rows.find(r => r.n === "Bro").dmg'), 500 + 150, 'a day over your goal counts (5 days), more does not, and records stop at 3')
    c.eq(p.evaluate('() => PT.boss.state().rows.find(r => r.n === "Bro").hits'), 5, 'five hits')
    # ------------------------------------------------------------ carrying: one person trains more, the family wins
    p.evaluate('() => { fam("Dad", { 0: { d: 4, g: 3, p: 3 } }); delete app.settings.fam2.Bro; PT.boss.reset(); }')
    st = p.evaluate('() => { const s = PT.boss.state(); return { hp: s.hp, dmg: s.dmg, won: s.won }; }')
    c.eq(st, {'hp': 600, 'dmg': 100 + 400 + 150, 'won': True}, 'Dad doing a day over his goal and 3 records carries the family')
    wins = p.evaluate('() => { const r = PT.boss.record(); return r.map(x => ({ c: x.c, n: x.n })); }')
    c.eq(wins, [{'c': 50, 'n': 2}], 'the win is kept: 40 coins and 10 for the one other person who landed a hit')
    c.eq(p.evaluate('() => PT.bossWins(app)'), 1, 'one boss beaten')
    c.eq(p.evaluate('() => PT.bossCoins(app)'), 50, 'worth 50 coins')
    c.eq(p.evaluate('() => PT.boss.record().length'), 0, 'it is only counted once')
    c.eq(p.evaluate('() => PT.coinIncome(app).boss'), 50, 'it is in where the coins come from')
    c.eq(p.evaluate('() => PT.coinIncome(app).bonus >= 50'), True, 'and in the total')
    c.ok(p.evaluate('() => { const e = PT.rw2.titleEntries(app, 1).find(x => x.text === "Boss Slayer"); return !!e && e.have; }'), 'Boss Slayer unlocks')
    c.ok(p.evaluate('() => { const e = PT.rw2.titleEntries(app, 1).find(x => x.text === "Boss Hunter"); return !!e && !e.have; }'), 'Boss Hunter needs 5')
    # you have to take part
    p.evaluate('() => { app.settings.bossWins = {}; app.sessions.length = 0; fam("Bro", { 0: { d: 4, g: 3, p: 3 } }); }')
    c.eq(p.evaluate('() => PT.boss.state().won'), True, 'the family can win without you...')
    c.eq(p.evaluate('() => PT.boss.record().length'), 0, '...but a win you did not land a hit on is not yours')
    # ------------------------------------------------------------ the celebration (once)
    p.evaluate('() => { addToday(); app.settings.bossWins = {}; window.__t.length = 0; PT.boss.reset(); PT.boss.check(); }')
    p.wait_for_timeout(700)
    c.ok(any('beat the' in m and 'coins' in m for m in p.evaluate('() => window.__t')), 'a toast says you beat it together and what it paid')
    p.evaluate('() => { window.__t.length = 0; PT.boss.check(); }')
    p.wait_for_timeout(600)
    c.eq(p.evaluate('() => window.__t.length'), 0, 'and it does not say it again')
    # ------------------------------------------------------------ boss level: wins in a row make the next one tougher
    p.evaluate('() => { app.settings.bossWins = {}; app.settings.fam2 = {}; app.sessions.length = 0; for (const i of [1, 2]) for (const k of [0, 1, 2]) addDay(i, k); fam("Dad", { 1: { d: 4, g: 3, p: 3 }, 2: { d: 4, g: 3, p: 3 }, 0: { d: 1, g: 3, p: 0 } }); }')
    st = p.evaluate('() => { const s = PT.boss.state(); return { lvl: s.lvl, hp: s.hp, past: s.past.slice(0, 2).map(x => [x.won, x.hp]) }; }')
    c.eq(st['past'], [[True, 660], [True, 600]], 'two weeks won in a row; the second boss was 10% tougher')
    c.eq(st['lvl'], 2, 'two in a row')
    c.eq(st['hp'], 720, 'so this week\'s boss is 20% tougher (600 → 720)')
    c.eq(p.evaluate('() => PT.boss.mult(9)'), 1.5, 'it stops at +50%')
    p.evaluate('() => { fam("Dad", { 1: { d: 0, g: 3, p: 0 }, 2: { d: 4, g: 3, p: 3 }, 0: { d: 1, g: 3, p: 0 } }); }')
    c.eq(p.evaluate('() => PT.boss.state().lvl'), 0, 'a missed week resets it')
    c.eq(p.evaluate('() => PT.boss.state().hp'), 600, 'back to the base')
    c.eq(p.errors, [], 'no page errors')

with page() as p:
    p.evaluate(SETUP)
    p.evaluate('() => { addToday(); fam("Dad", { 0: { d: 2, g: 3, p: 0 } }); }')
    p.evaluate(TAB)
    p.wait_for_timeout(400)
    c.ok(p.evaluate('() => !!document.querySelector("[data-ptab=social] #pt-pg-boss")'), 'the boss fight is in Progress → Social')
    c.eq(p.evaluate('() => document.querySelector("#pt-pg-boss").closest(".pt-grpbox").querySelector(".pt-grp").textContent.trim()'), 'Family', 'under Family')
    c.eq(p.evaluate('() => document.querySelector("#pt-pg-boss").closest(".pt-grpbox").children[1].id'), 'pt-pg-boss', 'and first in it')
    p.evaluate('() => { document.getElementById("pt-pg-boss").open = true; }')
    txt = p.evaluate('() => document.getElementById("pt-pg-boss").textContent')
    boss = p.evaluate('() => PT.boss.state().boss')
    c.ok(boss['n'] in txt, 'the boss is named')
    c.ok('HP' in txt and 'Dad' in txt and '(you)' in txt, 'health and both people show')
    c.ok('Rally the family' in txt, 'the Rally button')
    c.eq(p.evaluate('() => document.querySelectorAll("#pt-pg-boss .pt-bossrow").length'), 2, 'one row each')
    c.eq(p.evaluate('() => !!document.querySelector("#pt-pg-boss .pt-bosshp span")'), True, 'a health bar')
    # Rally sends the health and my update
    p.evaluate('() => { window.__shared = null; Object.defineProperty(navigator, "share", { value: async d => { window.__shared = d; }, configurable: true }); }')
    p.evaluate('() => document.getElementById("pt-boss-rally").click()')
    p.wait_for_timeout(500)
    sh = p.evaluate('() => window.__shared && window.__shared.text')
    c.ok(bool(sh) and boss['n'] in sh and 'HP left' in sh, 'Rally shares the boss and its health')
    c.ok('PTF2.' in (sh or ''), 'with my update, so the family board refreshes too')
    # a defeated boss shows as defeated and the button changes
    p.evaluate('() => { fam("Dad", { 0: { d: 4, g: 3, p: 3 } }); app.renderProgressView(); document.getElementById("pt-pg-boss").open = true; }')
    p.wait_for_timeout(300)
    txt = p.evaluate('() => document.getElementById("pt-pg-boss").textContent')
    c.ok('Defeated' in txt and 'Share the win' in txt, 'a beaten boss says so and offers to share the win')
    # it is a ranked part of the Rewards screens: the coin breakdown has it
    p.evaluate('() => { app._progTab = "rewards"; app.renderProgressView(); }')
    p.wait_for_timeout(300)
    c.ok('Family boss wins' in p.evaluate('() => document.getElementById("pt-pg-hub").textContent'), 'How coins work lists boss wins')
    c.eq(p.errors, [], 'no page errors')

with page(w=360, h=740) as p:
    p.evaluate(SETUP)
    p.evaluate('() => { addToday(); fam("Dad", { 0: { d: 2, g: 3, p: 0 } }); fam("Brother With A Long Name", { 0: { d: 1, g: 4, p: 0 } }); }')
    p.evaluate(TAB)
    p.wait_for_timeout(400)
    p.evaluate('() => { document.getElementById("pt-pg-boss").open = true; }')
    c.eq(p.evaluate('() => document.documentElement.scrollWidth <= window.innerWidth + 1'), True, 'no sideways scroll on a small phone')
    c.eq(p.errors, [], 'no page errors')
c.done()
