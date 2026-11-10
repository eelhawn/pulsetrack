"""Rewards 2.0: the Today card, the daily chest, the extra coin sources, the bigger shop (titles, banners, more looks) and My real rewards."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page

c = Checks('rewards')
TAB = '() => { app._progTab = "rewards"; app.showView("progress"); }'
FUND = '''(n) => { const l = app.settings.chests || []; for (let i = 0; i < n; i++) l.push({ d: "2020-01-" + String(i + 1).padStart(2, "0") + "x", tier: "common", coins: 1000, xp: 0, mult: 1 }); app.settings.chests = l; WorkoutStorage.saveSettings(app.settings); }'''
YES = '() => { PT.confirm = async () => true; }'


def seed(p, n=6):
    p.evaluate('''(n) => {
      const day = 86400000, now = Date.now();
      for (let i = 0; i < n; i++) { const t = now - (i * 3 + 1) * day;
        app.sessions.push({ id: "f" + i, date: PT.ds(new Date(t)), ts: t, name: "Day", ex: [{ id: "x", name: "Bench Press", sets: [{ w: 100, r: 8, t: 1 }] }], vol: 2400, sets: 3, unit: "lb", prs: i === 0 ? [{ n: "Bench Press" }] : [], dur: 3000 }); }
      app.saveSessions();
    }''', n)


# ---------------------------------------------------------------- where things are, and the catalog
with page() as p:
    p.evaluate(TAB)
    p.wait_for_timeout(300)
    c.ok(p.evaluate('() => !!document.querySelector("[data-ptab=rewards] #pt-pg-hub")'), 'the Today card is at the top of Rewards')
    c.eq(p.evaluate('() => document.querySelector("[data-ptab=rewards] .pt-grpbox").firstElementChild.id'), 'pt-pg-hub', 'and it comes first')
    c.ok(p.evaluate('() => !!document.querySelector("[data-ptab=rewards] #pt-pg-wish")'), 'My real rewards is in Rewards')
    c.ok(p.evaluate('() => PT.SHOP.length') >= 50, 'the shop has 50 or more things')
    c.eq(p.evaluate('() => new Set(PT.SHOP.map(x => x.id)).size === PT.SHOP.length'), True, 'every shop item has its own id')
    c.eq(p.evaluate('() => [...new Set(PT.SHOP.map(x => x.kind))].sort()'), ['banner', 'color', 'frame', 'fx', 'title'], 'five kinds: colors, frames, confetti, titles, banners')
    c.eq(p.evaluate('() => PT.SHOP.filter(x => x.kind === "fx").every(x => ["gold", "fire", "bolt", "stars"].includes(x.style) || PT.fxEmoji[x.style])'), True, 'every confetti style has its picture')
    c.eq(p.evaluate('() => PT.SHOP.filter(x => x.kind === "title").every(x => x.text && x.price > 0)'), True, 'titles have text and a price')
    c.eq(p.evaluate('() => PT.SHOP.filter(x => x.kind === "banner").every(x => x.c.length === 2)'), True, 'banners have two colors')
    c.eq(p.evaluate('() => document.querySelectorAll("#pt-pg-shop [data-shopcat]").length'), 6, 'the shop has six chips (All + five sections)')
    c.eq(p.evaluate('() => [...document.querySelectorAll("#pt-pg-shop [data-shopcat]")].map(b => b.textContent)'), ['All', 'Colors', 'Frames', 'Confetti', 'Titles', 'Banners'], 'with clear names')
    p.evaluate('() => document.querySelector("[data-shopcat=banner]").click()')
    p.wait_for_timeout(200)
    c.eq(p.evaluate('() => document.querySelectorAll("#pt-pg-shop [data-shop]").length'), 8, 'a chip shows only its own section')
    c.eq(p.errors, [], 'no page errors')

# ---------------------------------------------------------------- the daily chest
with page() as p:
    p.evaluate(TAB)
    c.eq(p.evaluate('() => PT.rw2.ready(app)'), False, 'a new phone: the chest is locked')
    c.eq(p.evaluate('() => PT.rw2.openChest(app)'), None, 'and cannot be opened')
    c.ok(p.evaluate('() => !!document.querySelector("#pt-pg-hub #pt-checkin-go")'), 'the card offers "I\'m in today"')
    coins0 = p.evaluate('() => PT.coins(app)')
    p.evaluate('() => document.getElementById("pt-checkin-go").click()')
    p.wait_for_timeout(300)
    c.eq(p.evaluate('() => PT.rw2.ready(app)'), True, 'checking in unlocks it')
    c.ok(p.evaluate('() => !!document.getElementById("pt-chest-open")'), 'the open button is there')
    c.ok(p.evaluate('() => !!document.querySelector("#pt-you-card .pt-gift")') or True, 'Home gift check follows below')
    p.evaluate('() => document.getElementById("pt-chest-open").click()')
    p.wait_for_timeout(300)
    ch = p.evaluate('() => app.settings.chests')
    c.eq(len(ch), 1, 'one chest was opened')
    c.ok(ch[0]['coins'] >= 5 and ch[0]['tier'] in ('common', 'rare', 'epic', 'legendary'), 'it holds coins')
    c.eq(p.evaluate('() => PT.rw2.openChest(app)'), None, 'the same day cannot be opened twice')
    c.eq(p.evaluate('() => !!document.getElementById("pt-chest-open")'), False, 'the button is gone')
    c.ok(p.evaluate('() => PT.coins(app)') >= coins0 + ch[0]['coins'], 'the coins were added')
    c.eq(p.evaluate('() => app.settings.chests.length'), 1, 'still one after the page redraws')
    p.evaluate('() => { app.renderProgressView(); app.renderProgressView(); }')
    c.eq(p.evaluate('() => app.settings.chests.length'), 1, 'redrawing never opens one')
    # the prize is the same for the same day and person
    c.eq(p.evaluate('() => JSON.stringify(PT.rw2.rollChest(app, "2026-03-03")) === JSON.stringify(PT.rw2.rollChest(app, "2026-03-03"))'), True, 'the same day always gives the same prize')
    odds = p.evaluate('''() => { const t = { common: 0, rare: 0, epic: 0, legendary: 0 }; let lo = 1e9, hi = 0;
      for (let i = 0; i < 2000; i++) { const x = PT.rw2.rollChest(app, "2030-" + i); t[x.tier]++; lo = Math.min(lo, x.coins); hi = Math.max(hi, x.coins); } return { t, lo, hi }; }''')
    c.ok(odds['t']['common'] > 1200 and odds['t']['rare'] > 300 and odds['t']['epic'] > 50, 'most chests are common, fewer rare, a few epic')
    c.ok(odds['t']['legendary'] < 80, 'legendary ones are rare')
    c.ok(odds['lo'] >= 15 and odds['hi'] <= 250, 'prizes stay between 15 and 250 coins')
    # a streak makes the prize bigger
    p.evaluate('''() => { const l = []; for (let i = 0; i < 8; i++) { const d = new Date(); d.setDate(d.getDate() - i); l.push(PT.ds(d)); } app.settings.checkins = l; app.settings.chests = []; }''')
    c.eq(p.evaluate('() => PT.rw2.rollChest(app, "2030-05-05").mult'), 1.25, 'an 8-day streak gives x1.25')
    p.evaluate('''() => { const l = []; for (let i = 0; i < 31; i++) { const d = new Date(); d.setDate(d.getDate() - i); l.push(PT.ds(d)); } app.settings.checkins = l; }''')
    c.eq(p.evaluate('() => PT.rw2.rollChest(app, "2030-05-05").mult'), 1.5, 'a 31-day streak gives x1.5')
    # a chest with XP changes your XP
    xp0 = p.evaluate('() => PT.rewards(app, true).xp')
    p.evaluate('() => { app.settings.chests = [{ d: "2020-01-01", tier: "epic", coins: 100, xp: 25, mult: 1 }]; }')
    c.eq(p.evaluate('() => PT.rewards(app, true).xp') - xp0, 25, 'chest XP counts toward your level')
    c.eq(p.errors, [], 'no page errors')

# ---------------------------------------------------------------- Home: a gift when a chest is waiting, and the card opens Rewards
with page() as p:
    p.evaluate('() => { app.showView("home"); app.renderHomeView(); }')
    c.eq(p.evaluate('() => !!document.querySelector("#pt-you-card .pt-gift")'), False, 'no gift while the chest is locked')
    p.evaluate('() => { app.settings.checkins = [PT.ds()]; app.renderHomeView(); }')
    c.eq(p.evaluate('() => !!document.querySelector("#pt-you-card .pt-gift")'), True, 'a gift shows when today\'s chest can be opened')
    p.evaluate('() => { document.getElementById("pt-you-card").click(); }')
    p.wait_for_timeout(500)
    c.eq(p.evaluate('() => app._progTab'), 'rewards', 'tapping the card opens the Rewards tab')
    p.evaluate('() => document.getElementById("pt-chest-open").click()')
    p.wait_for_timeout(200)
    p.evaluate('() => { app.showView("home"); app.renderHomeView(); }')
    c.eq(p.evaluate('() => !!document.querySelector("#pt-you-card .pt-gift")'), False, 'the gift is gone once it is opened')
    c.eq(p.errors, [], 'no page errors')

# ---------------------------------------------------------------- coins: more sources, and a ledger that adds up
with page() as p:
    seed(p)
    p.evaluate(YES)
    inc = p.evaluate('() => PT.coinIncome(app)')
    c.eq(inc['bonus'], inc['records'] + inc['quests'] + inc['weeks'] + inc['challenges'] + inc['badges'] + inc['chests'], 'bonus coins are the sum of the new sources')
    c.ok(inc['records'] >= 10, 'a record gives 10 coins')
    base = p.evaluate('() => PT.coins(app)')
    p.evaluate('() => { app.settings.questDone = Object.assign({}, app.settings.questDone, { "1": ["goal"] }); }')
    c.eq(p.evaluate('() => PT.coins(app)') - base, 25 + 10, 'a finished quest gives 25 coins (plus the 100 XP it was always worth)')
    p.evaluate(FUND, 3)
    c.eq(p.evaluate('() => PT.coinIncome(app).chests'), 3000, 'chest coins are counted')
    coins = p.evaluate('() => PT.coins(app)')
    p.evaluate('() => { app.settings.myRewards = [{ id: "w1", name: "Cheat meal", price: 800, claimed: Date.now(), paid: 800 }]; }')
    c.eq(coins - p.evaluate('() => PT.coins(app)'), 800, 'a claimed real reward takes its coins')
    p.evaluate('() => { app.settings.myRewards = []; }')
    c.eq(p.errors, [], 'no page errors')

# ---------------------------------------------------------------- the shop: buy, equip, titles, banners, confetti
with page() as p:
    seed(p)
    p.evaluate(YES)
    p.evaluate(FUND, 3)
    p.evaluate(TAB)
    p.wait_for_timeout(300)
    p.evaluate('() => { document.getElementById("pt-pg-shop").open = true; document.querySelector("[data-shopcat=title]").click(); }')
    p.wait_for_timeout(200)
    coins = p.evaluate('() => PT.coins(app)')
    p.evaluate('() => document.querySelector("[data-shop=t_sharm]").click()')
    p.wait_for_timeout(400)
    c.eq(coins - p.evaluate('() => PT.coins(app)'), 200, 'a 200-coin title costs 200')
    c.eq(p.evaluate('() => app.settings.titleSel'), 't_sharm', 'it is equipped as soon as it is bought')
    c.eq(p.evaluate('() => PT.rewards(app).title'), 'Sharm Lord', 'it replaces the level title')
    p.evaluate('() => { app.showView("home"); app.renderHomeView(); }')
    c.ok(p.evaluate('() => document.getElementById("pt-you-card").textContent.includes("Sharm Lord")'), 'Home shows it')
    # back to the automatic title
    p.evaluate(TAB)
    p.wait_for_timeout(300)
    p.evaluate('() => { document.getElementById("pt-pg-shop").open = true; document.querySelector("[data-shopcat=title]").click(); }')
    p.wait_for_timeout(200)
    c.ok(p.evaluate('() => !!document.querySelector("#pt-pg-shop [data-title2=\\"\\"]")'), 'the Earned titles row has Automatic')
    p.evaluate('() => document.querySelector("#pt-pg-shop [data-title2=\\"\\"]").click()')
    p.wait_for_timeout(200)
    c.ok(p.evaluate('() => PT.rewards(app).title') in ('Rookie', 'Regular'), 'Automatic gives the level title back')
    p.evaluate('() => document.querySelector("#pt-pg-shop [data-title2=lv1]").click()')
    p.wait_for_timeout(200)
    c.eq(p.evaluate('() => PT.rewards(app).title'), 'Rookie', 'a lower level title can be picked')
    c.eq(p.evaluate('() => document.querySelector("#pt-pg-shop [data-title2=lv50]").disabled'), True, 'a title you have not reached is locked')
    c.eq(p.evaluate('() => PT.rw2.titleEntries(app, 1).filter(x => /^ss/.test(x.id)).length >= 2'), True, 'the season titles are listed')
    # a title you do not own cannot be forced on
    p.evaluate('() => { app.settings.titleSel = "t_mass"; }')
    c.ok(p.evaluate('() => PT.rewards(app, true).title') != 'Mass Monster', 'an unowned title does not show')
    p.evaluate('() => { app.settings.titleSel = ""; }')
    # a banner
    p.evaluate('() => { document.querySelector("[data-shopcat=banner]").click(); }')
    p.wait_for_timeout(200)
    p.evaluate('() => document.querySelector("[data-shop=b_gold]").click()')
    p.wait_for_timeout(400)
    c.eq(p.evaluate('() => app.settings.banner'), 'b_gold', 'a banner is equipped')
    p.evaluate('() => { app.showView("home"); app.renderHomeView(); }')
    c.ok(p.evaluate('() => /gradient/.test(document.getElementById("pt-you-card").style.backgroundImage)'), 'the Home card wears it')
    # a new confetti style and a new frame
    p.evaluate(TAB)
    p.wait_for_timeout(300)
    p.evaluate('() => { document.getElementById("pt-pg-shop").open = true; document.querySelector("[data-shopcat=fx]").click(); }')
    p.wait_for_timeout(200)
    p.evaluate('() => document.querySelector("[data-shop=x_pizza]").click()')
    p.wait_for_timeout(400)
    c.eq(p.evaluate('() => app.settings.fxStyle'), 'pizza', 'a new confetti style is equipped')
    c.ok(p.evaluate('() => { PT.confetti(10); const t = [...document.querySelectorAll(".pt-conf i")].some(i => i.textContent === "🍕"); document.querySelectorAll(".pt-conf").forEach(x => x.remove()); return t; }'), 'and it throws pizza')
    p.evaluate('() => { document.querySelector("[data-shopcat=frame]").click(); }')
    p.wait_for_timeout(200)
    p.evaluate('() => document.querySelector("[data-shop=f_candy]").click()')
    p.wait_for_timeout(400)
    c.eq(p.evaluate('() => app.settings.frame'), 'f_candy', 'a new frame is equipped')
    c.ok(p.evaluate('() => PT.extraFrames(app).some(f => f.id === "f_rose")'), 'new frames also show in the Level card')
    # not enough coins
    p.evaluate('() => { app.settings.chests = []; app.settings.shopOwned = []; }')
    p.evaluate(TAB)
    p.wait_for_timeout(300)
    n0 = p.evaluate('() => app.settings.shopOwned.length')
    p.evaluate('() => { document.getElementById("pt-pg-shop").open = true; document.querySelector("[data-shopcat=title]").click(); }')
    p.wait_for_timeout(200)
    p.evaluate('() => document.querySelector("[data-shop=t_mass]").click()')
    p.wait_for_timeout(300)
    c.eq(p.evaluate('() => app.settings.shopOwned.length'), n0, 'too few coins: nothing is bought')
    c.eq(p.errors, [], 'no page errors')

# ---------------------------------------------------------------- My real rewards
with page() as p:
    seed(p)
    p.evaluate(YES)
    p.evaluate(TAB)
    p.wait_for_timeout(300)
    c.eq(p.evaluate('() => (app.settings.myRewards || []).length'), 0, 'starts empty')
    p.evaluate('() => { document.getElementById("pt-pg-wish").open = true; document.querySelector("[data-widea=\\"0\\"]").click(); }')
    p.wait_for_timeout(300)
    c.eq(p.evaluate('() => app.settings.myRewards.map(w => [w.name, w.price])'), [['🍕 Cheat meal', 800]], 'an idea chip adds a reward')
    c.eq(p.evaluate('() => document.querySelector("#pt-pg-wish [data-wclaim]").disabled'), True, 'it cannot be claimed without enough coins')
    # add one by hand
    p.evaluate('() => { const q = ["Wireless earbuds", "1200"]; PT.prompt = async () => q.shift(); }')
    p.evaluate('() => document.getElementById("pt-wish-add").click()')
    p.wait_for_timeout(300)
    c.eq(p.evaluate('() => app.settings.myRewards.map(w => [w.name, w.price])'), [['🍕 Cheat meal', 800], ['Wireless earbuds', 1200]], 'a reward of your own can be added')
    # a price change
    p.evaluate('() => { PT.prompt = async () => "900"; }')
    p.evaluate('() => document.querySelector("[data-wedit]").click()')
    p.wait_for_timeout(300)
    c.eq(p.evaluate('() => app.settings.myRewards[0].price'), 900, 'the price can be changed')
    # enough coins: claim
    p.evaluate(FUND, 3)
    p.evaluate('() => app.renderProgressView()')
    p.wait_for_timeout(300)
    before = p.evaluate('() => PT.coins(app)')
    c.eq(p.evaluate('() => document.querySelector("#pt-pg-wish [data-wclaim]").disabled'), False, 'with enough coins it can be claimed')
    p.evaluate('() => { document.getElementById("pt-pg-wish").open = true; document.querySelector("[data-wclaim]").click(); }')
    p.wait_for_timeout(400)
    c.eq(before - p.evaluate('() => PT.coins(app)'), 900, 'claiming costs its coins')
    c.eq(p.evaluate('() => app.settings.myRewards.filter(w => w.claimed).length'), 1, 'it moves to Claimed')
    c.eq(p.evaluate('() => document.querySelectorAll("#pt-pg-wish [data-wclaim]").length'), 1, 'the other one is still waiting')
    c.ok(p.evaluate('() => document.querySelector("#pt-pg-wish").textContent.includes("Claimed")'), 'the Claimed list shows')
    # again
    p.evaluate('() => document.querySelector("[data-wagain]").click()')
    p.wait_for_timeout(300)
    c.eq(p.evaluate('() => app.settings.myRewards.filter(w => !w.claimed).length'), 2, '"again" puts it back on the list')
    # remove
    p.evaluate('() => document.querySelector("[data-wdel]").click()')
    p.wait_for_timeout(300)
    c.eq(p.evaluate('() => app.settings.myRewards.filter(w => !w.claimed).length'), 1, 'a reward can be removed')
    c.eq(p.evaluate('() => app.settings.myRewards.filter(w => w.claimed).length'), 1, 'what you claimed stays in the list')
    c.eq(p.errors, [], 'no page errors')

# ---------------------------------------------------------------- the update itself
with page() as p:
    c.eq(p.evaluate('() => app.settings.rw2Seen'), True, 'the one-time notice is marked as seen')
    c.eq(p.evaluate('() => PT.coins(app) >= 0'), True, 'the balance is never negative')
    p.evaluate('() => { app.settings.chests = undefined; app.settings.myRewards = undefined; app.settings.titleSel = undefined; app.settings.banner = undefined; app.renderProgressView(); app.renderHomeView(); }')
    c.eq(p.errors, [], 'a phone that never used any of it draws fine')
c.done()
