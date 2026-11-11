"""2.90.0: the 5 day weekly goal, Family → Group, dumbbells (restart at 0, half rate), loot chests, the new shop items and group rewards."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page

c = Checks('group')
SETUP = '''() => {
  PT.confirm = async () => true; PT.alert = async () => {}; PT.prompt = async () => "Me";
  window.__t = []; app.toast = m => { window.__t.push(String(m)); };
  window.MON = i => PT.famKit.wkMon(i); window.WID = i => PT.famKit.dsOf(PT.famKit.wkMon(i));
  window.day = (i, k, prs) => { const t = MON(i) + k * 86400000 + 12 * 3600000; app.sessions.push({ id: "d" + i + "_" + k + "_" + Math.random(), date: PT.ds(new Date(t)), ts: t, name: "Day", ex: [], vol: 1000, sets: 10, unit: "lb", prs: prs || [], dur: 3000 }); };
  window.restart = () => { delete app.settings.dbBase; PT.dbStart(app); PT.loot.reset(); };
}'''
TAB = '(t) => { app.showView("progress"); app._progTab = t; app.renderProgressView(); }'

# ================================================================ the weekly goal
with page() as p:
    p.evaluate(SETUP)
    p.wait_for_timeout(300)
    c.eq(p.evaluate('() => [app.settings.weeklyGoal, app.settings.weekGoal, PT.goalFor(app, MON(0))]'), [5, 5, 5], 'a new phone starts on a 5 day weekly goal (streak and rewards)')
    p.evaluate('async () => { await app.renderSettingsExtras(); }')
    c.eq(p.evaluate('() => document.getElementById("setting-weekly-goal").value'), '5', 'Settings shows 5')
    # an existing user on 3 days: past weeks keep 3, so the streak does not break
    p.evaluate('''() => { app.settings.goal5 = 0; app.settings.weeklyGoal = 3; app.settings.weekGoal = 3; app.settings.weeklyGoalLog = []; app.settings.weekGoalLog = [];
      for (let i = 1; i <= 4; i++) for (let k = 0; k < 3; k++) day(i, k); }''')
    before = p.evaluate('() => PT.rewards(app).streak.cur')
    c.eq(before, 4, 'four weeks of 3 days on a 3 day goal is a 4 week streak')
    c.eq(p.evaluate('() => PT.loot.goal5(app)'), True, 'the switch to 5 days runs once')
    c.eq(p.evaluate('() => PT.loot.goal5(app)'), False, 'and only once')
    c.eq(p.evaluate('() => PT.rewards(app).streak.cur'), before, 'the streak is still 4 weeks: past weeks keep their 3 day goal')
    c.eq(p.evaluate('() => [PT.weeklyGoalAt(app, WID(2)), PT.weeklyGoalAt(app, WID(0))]'), [3, 5], 'the Settings streak goal is per week too: 3 then, 5 now')
    c.eq(p.evaluate('() => PT.goalFor(app, MON(0))'), 5, 'this week the goal is 5')
    # changing it in Settings moves both
    p.evaluate('() => { const s = document.getElementById("setting-weekly-goal"); s.value = "4"; s.dispatchEvent(new Event("change", { bubbles: true })); }')
    c.eq(p.evaluate('() => [app.settings.weeklyGoal, PT.goalFor(app, MON(0))]'), [4, 4], 'Settings → Weekly Goal changes the streak goal and the rewards goal together')
    p.evaluate('() => PT.setWeekGoal(6)')
    c.eq(p.evaluate('() => [app.settings.weeklyGoal, PT.goalFor(app, MON(0))]'), [6, 6], 'and the rewards goal picker moves the Settings one')
    c.eq(p.evaluate('() => PT.weeklyGoalAt(app, WID(2))'), 3, 'changing it never rewrites the past')
    c.eq(p.errors, [], 'no page errors')

# ================================================================ Family is now Group
with page() as p:
    p.evaluate(SETUP)
    p.evaluate(TAB, 'social')
    txt = p.evaluate('() => document.querySelector("[data-ptab=social]").textContent')
    c.ok('Group' in txt and 'Group board' in txt, 'Social shows Group and Group board')
    c.ok('Family' not in txt and 'family' not in txt, 'and no Family anywhere on it')
    p.evaluate('() => { document.getElementById("pt-pg-fam").open = true; }')
    c.ok('Live group board' in p.evaluate('() => document.getElementById("pt-pg-fam").textContent'), 'the live board is the live group board')
    c.eq(p.errors, [], 'no page errors')

# ================================================================ dumbbells
with page() as p:
    p.evaluate(SETUP)
    p.evaluate('() => { for (let k = 0; k < 3; k++) day(2, k, ["Bench"]); app.settings.myName = "Me"; }')
    c.ok(p.evaluate('() => PT.coinIncome(app).xp + PT.coinIncome(app).bonus') > 50, 'old history is worth plenty of old coins')
    p.evaluate('() => restart()')
    c.eq(p.evaluate('() => PT.coins(app)'), 0, 'after the switch everybody starts again at 0 dumbbells')
    e0 = p.evaluate('() => { const o = PT.coinIncome(app); return o.xp + o.season + o.bonus; }')
    p.evaluate('() => { day(0, 0, ["Squat"]); }')
    e1 = p.evaluate('() => { const o = PT.coinIncome(app); return o.xp + o.season + o.bonus; }')
    got = p.evaluate('() => PT.coins(app)')
    c.ok(e1 > e0, 'a new workout earns')
    c.eq(got, (e1 - e0) // 2, 'but only half of what it used to (%d old coins → %d dumbbells)' % (e1 - e0, got))
    # buying: items owned before the switch stay owned and cost nothing now
    p.evaluate('() => { app.settings.shopOwned = ["c_neon"]; restart(); }')
    c.eq(p.evaluate('() => PT.coins(app)'), 0, 'what you owned before stays owned and is not charged again')
    p.evaluate('() => { app.settings.chests = [{ d: "2020-01-01x", tier: "common", coins: 1000, xp: 0, mult: 1 }]; }')
    c.eq(p.evaluate('() => PT.coins(app)'), 500, 'old-style income counts half (1000 → 500)')
    p.evaluate('() => { app.settings.shopOwned = app.settings.shopOwned.concat("c_ice"); }')
    c.eq(p.evaluate('() => PT.coins(app)'), 380, 'a 120 item costs 120 dumbbells')
    p.evaluate('() => { app.settings.shopGifts = ["c_ice"]; }')
    c.eq(p.evaluate('() => PT.coins(app)'), 500, 'an item won from a chest costs nothing')
    p.evaluate('() => { app.settings.shopGifts = []; app.settings.shopOwned = ["c_neon"]; }')
    # the screens say dumbbells, with the dumbbell icon
    p.evaluate(TAB, 'rewards')
    hub = p.evaluate('() => document.getElementById("pt-pg-hub").innerHTML')
    c.ok('dumbbells to spend' in hub and 'pt-dbi' in hub, 'the Rewards card shows dumbbells with the dumbbell icon')
    c.ok('How dumbbells work' in hub and 'coins' not in p.evaluate('() => document.getElementById("pt-pg-hub").textContent').replace('coins are dumbbells', ''), 'and explains dumbbells, with no coins left')
    shop = p.evaluate('() => document.getElementById("pt-pg-shop").textContent')
    c.ok('dumbbells' in shop and 'coins' not in shop, 'the shop counts in dumbbells')
    c.ok(p.evaluate('() => document.querySelectorAll("#pt-pg-shop .pt-dbi").length') > 5, 'prices carry the dumbbell icon')
    c.eq(p.errors, [], 'no page errors')

# ================================================================ loot chests
with page() as p:
    p.evaluate(SETUP)
    p.evaluate('() => { app.settings.myName = "Me"; PT.setGoalBoth(app, 3); app.settings.weekGoalLog = [{ t: 0, g: 3 }]; restart(); }')
    c.eq(p.evaluate('() => PT.loot.waiting(app).length'), 0, 'nothing to open at the start')
    # old history does not count
    p.evaluate('() => { app.settings.dbBase.t = Date.now(); for (let k = 0; k < 3; k++) day(3, k); PT.loot.reset(); }')
    c.eq(p.evaluate('() => PT.loot.earned(app).length'), 0, 'a goal week from before the switch earns nothing')
    # this week: hit the goal (3 days) -> common chest
    p.evaluate('() => { app.settings.dbBase.t = MON(0) - 1; for (let k = 0; k < 3; k++) day(0, k); PT.loot.reset(); }')
    w = p.evaluate('() => PT.loot.waiting(app)')
    c.eq([(x['id'], x['tier']) for x in w], [('g:' + p.evaluate('() => WID(0)'), 'common')], 'hitting your goal this week earns a common chest')
    # 10 records -> rare
    p.evaluate('() => { day(0, 4, ["a","b","c","d","e","f","g","h","i","j"]); PT.loot.reset(); }')
    c.ok(any(x['id'] == 'r1' and x['tier'] == 'rare' for x in p.evaluate('() => PT.loot.waiting(app)')), '10 new records earn a rare chest')
    # a boss win -> epic
    p.evaluate('() => { app.settings.bossWins = { [WID(0)]: { b: "Couch Golem", e: "🛋️", ts: Date.now(), c: 50, n: 2 } }; PT.loot.reset(); }')
    w = p.evaluate('() => PT.loot.waiting(app)')
    c.eq(w[0]['tier'], 'epic', 'beating the boss earns an epic chest, listed first (biggest first)')
    # opening
    n_own = p.evaluate('() => (app.settings.shopOwned || []).length')
    db0 = p.evaluate('() => PT.coins(app)')
    r1 = p.evaluate('(id) => PT.loot.roll(PT.loot.earned(app).find(x => x.id === id))', w[0]['id'])
    r2 = p.evaluate('(id) => PT.loot.roll(PT.loot.earned(app).find(x => x.id === id))', w[0]['id'])
    c.eq(r1, r2, 'what is in a chest is fixed (it cannot be re-rolled)')
    got = p.evaluate('(id) => PT.loot.open(id)', w[0]['id'])
    c.ok(got and got['k'] in ('db', 'item', 'shield'), 'opening gives dumbbells, an item or a shield (%s)' % (got and got['k']))
    c.eq(p.evaluate('(id) => PT.loot.open(id)', w[0]['id']), None, 'a chest opens once')
    if got['k'] == 'db':
        c.eq(p.evaluate('() => PT.coins(app)') - db0, got['v'], 'its dumbbells are added')
        c.ok(150 <= got['v'] <= 250, 'an epic chest holds 150 to 250 dumbbells')
    elif got['k'] == 'item':
        c.ok(p.evaluate('(id) => app.settings.shopOwned.includes(id) && app.settings.shopGifts.includes(id)', got['v']), 'the item is yours, as a gift')
        c.eq(p.evaluate('() => PT.coins(app)'), db0, 'and costs nothing')
    # every kind of prize, over many chests
    kinds = p.evaluate('''() => { const out = {}; ["common", "rare", "epic", "legendary"].forEach(t => { out[t] = {}; for (let i = 0; i < 300; i++) { const r = PT.loot.roll({ id: "test" + t + i, tier: t }); out[t][r.k] = (out[t][r.k] || 0) + 1; } }); return out; }''')
    c.ok(set(kinds['common']) >= {'db', 'shield', 'item'}, 'common chests hold dumbbells, shields and cheap items')
    c.ok(set(kinds['rare']) >= {'db', 'item'}, 'rare chests hold dumbbells and items')
    c.ok(set(kinds['epic']) == {'db', 'item'}, 'epic chests hold dumbbells or better items')
    c.eq(set(kinds['legendary']), {'item'}, 'a legendary chest holds a legendary item while there are some left')
    leg = p.evaluate('() => PT.loot.roll({ id: "L1", tier: "legendary" })')
    c.ok(leg['v'] in p.evaluate('() => PT.loot.LEGEND'), 'one of the legendary items')
    # the screen
    p.evaluate(TAB, 'rewards')
    c.ok(p.evaluate('() => !!document.querySelector("[data-ptab=rewards] #pt-pg-loot")'), 'Loot chests sit in Progress → Rewards')
    c.ok('to open' in p.evaluate('() => document.querySelector("#pt-pg-loot summary").textContent'), 'the heading says how many are waiting')
    p.evaluate('() => { document.getElementById("pt-pg-loot").open = true; }')
    p.click('[data-lopen]')
    p.wait_for_selector('#pt-loot-go')
    p.click('#pt-loot-go')
    p.wait_for_selector('#pt-lootprize:not([hidden])', timeout=4000)
    c.ok(len(p.evaluate('() => document.getElementById("pt-lootprize").textContent')) > 3, 'the chest opens with its prize on screen')
    c.ok(p.evaluate('() => document.documentElement.scrollWidth <= window.innerWidth + 1'), 'no sideways scroll')
    p.click('#pt-loot-go')
    c.ok(any('chest earned' in t for t in p.evaluate('() => window.__t')), 'a newly earned chest is announced')
    c.eq(p.errors, [], 'no page errors')

# ================================================================ the shop: weapons and the high end
with page() as p:
    p.evaluate(SETUP)
    c.eq(p.evaluate('() => PT.SHOP.filter(x => x.kind === "weapon").length'), 7, 'seven boss weapons')
    c.eq(p.evaluate('() => PT.weaponOf(app).icon'), '👊', 'you start with your fists')
    p.evaluate('() => { app.settings.shopOwned = ["w_axe"]; app.settings.shopGifts = ["w_axe"]; PT.shopHooks.weapon.equip(app, PT.SHOP.find(x => x.id === "w_axe")); }')
    c.eq(p.evaluate('() => PT.weaponOf(app).icon'), '🪓', 'an owned weapon can be equipped')
    p.evaluate('() => { app.settings.weapon = "w_comet"; }')
    c.eq(p.evaluate('() => PT.weaponOf(app).icon'), '👊', 'one you do not own is not used')
    c.ok(p.evaluate('() => PT.SHOP.filter(x => x.price >= 1000).length') >= 5, 'big-ticket items to save up for')
    c.eq(p.errors, [], 'no page errors')

# ================================================================ group rewards
with page() as p:
    p.evaluate(SETUP)
    p.evaluate('''() => { app.settings.myName = "Me"; PT.setGoalBoth(app, 3); app.settings.weekGoalLog = [{ t: 0, g: 3 }]; restart(); app.settings.dbBase.t = MON(0) - 1;
      for (let k = 0; k < 3; k++) day(0, k);
      app.settings.fam2 = { Dad: { n: "Dad", t: Date.now(), lv: 3, b: 1, st: 1, l: {}, wk: { [WID(0)]: { d: 2, g: 3, p: 0 } } } }; PT.loot.reset(); }''')
    g = p.evaluate('() => PT.loot.group(app).weeks[0]')
    c.eq([g['n'], g['hit'], g['days'], g['target']], [2, 1, 5, 8], 'the group this week: 2 people, 1 on goal, 5 days of 8')
    ids = [x['id'] for x in p.evaluate('() => PT.loot.earned(app)')]
    c.ok(not any(i.startswith('G') for i in ids), 'no group chest yet')
    p.evaluate('() => { app.settings.fam2.Dad.wk[WID(0)].d = 3; app.settings.fam2.Dad.t++; PT.loot.reset(); }')
    ids = [x['id'] for x in p.evaluate('() => PT.loot.earned(app)')]
    c.ok('G:' + p.evaluate('() => WID(0)') in ids, 'everybody on goal: an epic group chest')
    p.evaluate('() => { app.settings.fam2.Dad.wk[WID(0)].d = 5; app.settings.fam2.Dad.t++; PT.loot.reset(); }')
    ids = [x['id'] for x in p.evaluate('() => PT.loot.earned(app)')]
    c.ok('GT:' + p.evaluate('() => WID(0)') in ids, '8 days together: a rare group grind chest')
    p.evaluate('() => { app.sessions = app.sessions.filter(s => s.ts < MON(0)); PT.loot.reset(); }')
    ids = [x['id'] for x in p.evaluate('() => PT.loot.earned(app)')]
    c.ok(not any(i.startswith('G') for i in ids), 'you have to train that week to get a group chest')
    p.evaluate(TAB, 'social')
    c.ok(p.evaluate('() => !!document.querySelector("[data-ptab=social] #pt-pg-grprew")'), 'Group rewards sit in Social → Group')
    p.evaluate('() => { document.getElementById("pt-pg-grprew").open = true; }')
    txt = p.evaluate('() => document.getElementById("pt-pg-grprew").textContent')
    c.ok('Everybody hits their goal' in txt and 'Group grind' in txt and '3 bosses in a row' in txt, 'it shows the three group goals')
    c.eq(p.errors, [], 'no page errors')

# ================================================================ what's new, once, for people with history
with page() as p:
    p.evaluate(SETUP)
    p.evaluate('() => { day(1, 0); delete app.settings.v290Seen; PT.loot.intro(app); }')
    p.wait_for_selector('[data-v290-ok]', timeout=5000)
    txt = p.evaluate('() => document.querySelector("[data-v290-ok]").closest("div").parentElement.textContent')
    c.ok('dumbbells' in txt and 'Loot chests' in txt and 'Boss battle' in txt and '5 days' in txt and 'Group' in txt, 'a one-time sheet explains the changes')
    p.click('[data-v290-ok]')
    c.eq(p.errors, [], 'no page errors')

c.done()
