"""Streak shield: the streak maths, using one by itself or by hand, getting it back, buying, the coin balance, the screen, and Home."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page

c = Checks('shield')
SETUP = '''() => {
  PT.confirm = async () => true; PT.alert = async () => {};
  app.sessions.length = 0; app.settings.checkins = []; app.settings.shielded = []; app.settings.shields = 0; app.settings.shieldBuys = 0;
  window.__t = []; app.toast = m => { window.__t.push(String(m)); };
  window.ds = o => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + o); return PT.ds(d); };
  window.days = (...os) => { app.settings.checkins = os.map(ds); };
  window.reset = () => { app.sessions.length = 0; app.settings.checkins = []; app.settings.shielded = []; app.settings.shields = 0; app.settings.shieldBuys = 0; window.__t.length = 0; };
}'''
FUND = '''() => { const l = app.settings.chests || []; for (let i = 0; i < 10; i++) l.push({ d: "2020-01-" + String(i + 1).padStart(2, "0") + "x", tier: "common", coins: 1000, xp: 0, mult: 1 }); app.settings.chests = l; WorkoutStorage.saveSettings(app.settings); }'''
streak = lambda p: p.evaluate('() => PT.dayStreak(app)')
sh = lambda p: p.evaluate('() => [app.settings.shields, app.settings.shielded.length]')

with page() as p:
    p.evaluate(SETUP)
    # ------------------------------------------------------------ the maths: a shield bridges, never adds
    p.evaluate('() => days(-5, -4, -3, -1, 0)')
    c.eq(streak(p), 2, 'a missed day breaks the streak (2 days: yesterday and today)')
    p.evaluate('() => { app.settings.shielded = [ds(-2)]; }')
    c.eq(streak(p), 5, 'a shielded day keeps it going: 3 + yesterday + today = 5, and the shield itself adds nothing')
    p.evaluate('() => { days(-5, -4, -3, -1); app.settings.shielded = [ds(-2)]; }')
    c.eq(streak(p), 4, 'today not done yet: the streak is still 4 from yesterday')
    p.evaluate('() => { days(-3, -2, -1); app.settings.shielded = [ds(0)]; }')
    c.eq(streak(p), 3, 'a shield on today does not count a day either')
    # ------------------------------------------------------------ using one on its own
    p.evaluate('() => { reset(); days(-4, -3, -2); app.settings.shields = 1; }')
    r = p.evaluate('() => PT.shield.auto()')
    c.eq(r['used'], [p.evaluate('() => ds(-1)')], 'a missed yesterday after a 3 day streak: a shield is used')
    c.eq(r['kept'], 3, 'it says which streak it saved')
    c.eq(sh(p), [0, 1], 'one shield gone, one day covered')
    c.eq(streak(p), 3, 'the streak is still 3')
    c.eq(p.evaluate('() => PT.shield.auto().used.length'), 0, 'and it is not used twice for the same day')
    # two missed days, one shield: not wasted
    p.evaluate('() => { reset(); days(-5, -4, -3); app.settings.shields = 1; }')
    c.eq(p.evaluate('() => PT.shield.auto().used.length'), 0, 'two missed days and one shield: nothing is used (it could not save the streak)')
    c.eq(sh(p), [1, 0], 'and the shield is still there')
    p.evaluate('() => { app.settings.shields = 2; }')
    c.eq(p.evaluate('() => PT.shield.auto().used.length'), 2, 'with two shields both days are covered')
    c.eq(streak(p), 3, 'and the streak is 3')
    # not worth it for a short streak, or a long absence
    p.evaluate('() => { reset(); days(-3, -2); app.settings.shields = 1; }')
    c.eq(p.evaluate('() => PT.shield.auto().used.length'), 0, 'a 2 day streak is not worth a shield')
    p.evaluate('() => { reset(); days(-9, -8, -7, -6, -5); app.settings.shields = 3; }')
    c.eq(p.evaluate('() => PT.shield.auto().used.length'), 0, 'four missed days in a row is too many')
    p.evaluate('() => { reset(); days(-4, -3, -2, -1); app.settings.shields = 1; }')
    c.eq(p.evaluate('() => PT.shield.auto().used.length'), 0, 'a streak that is alive needs none')
    c.eq(sh(p), [1, 0], 'so the shield stays')
    # ------------------------------------------------------------ by hand, and back again
    p.evaluate('() => { reset(); days(-3, -2, -1); app.settings.shields = 2; }')
    c.eq(p.evaluate('() => PT.shield.protect()'), True, 'Protect today (a sick day)')
    c.eq(sh(p), [1, 1], 'one shield used')
    c.eq(p.evaluate('() => PT.shield.protect()'), False, 'it does not use a second one for the same day')
    p.evaluate('() => { app.settings.checkins.push(ds(0)); }')
    c.eq(p.evaluate('() => PT.shield.auto().back'), 1, 'you showed up after all: the shield comes back')
    c.eq(sh(p), [2, 0], 'and the day is no longer marked')
    p.evaluate('() => { reset(); }')
    c.eq(p.evaluate('() => PT.shield.protect()'), False, 'no shield, nothing to use')
    # ------------------------------------------------------------ buying, the coin balance, the cap
    p.evaluate(FUND)
    coins0 = p.evaluate('() => PT.coins(app)')
    c.ok(coins0 >= 400, 'funded (%d)' % coins0)
    c.eq(p.evaluate('() => PT.shield.buy()'), True, 'buy a shield')
    c.eq(sh(p), [1, 0], 'now holding one')
    c.eq(p.evaluate('() => PT.coins(app)'), coins0 - 150, 'it cost 150 coins')
    c.eq(p.evaluate('() => PT.shieldSpent(app)'), 150, 'spent is tracked')
    p.evaluate('() => PT.shield.buy()'); p.evaluate('() => PT.shield.buy()')
    c.eq(sh(p)[0], 3, 'three held')
    c.eq(p.evaluate('() => PT.shield.buy()'), False, 'at three it will not sell another')
    c.eq(p.evaluate('() => PT.coins(app)'), coins0 - 450, 'and no coins are taken')
    p.evaluate('() => { reset(); app.settings.chests = []; app.settings.myRewards = []; app.settings.shopOwned = []; WorkoutStorage.saveSettings(app.settings); }')
    c.eq(p.evaluate('() => PT.shield.buy()'), False, 'without the coins it will not sell')
    c.ok(any('more coins' in m for m in p.evaluate('() => window.__t')), 'and says how many more are needed')
    c.eq(p.errors, [], 'no page errors')

with page() as p:
    p.evaluate(SETUP)
    p.evaluate(FUND)
    # ------------------------------------------------------------ the screen
    p.evaluate('() => { days(-4, -3, -2); app.settings.shields = 1; app.settings.shieldBuys = 1; }')
    p.evaluate('() => { app._progTab = "rewards"; app.showView("progress"); app.renderProgressView(); }')
    p.wait_for_timeout(500)
    c.eq(p.evaluate('() => app.settings.shielded.length'), 1, 'opening Progress after a missed day uses the shield')
    c.ok(any('kept your 3-day streak' in m for m in p.evaluate('() => window.__t')), 'and says so')
    p.evaluate('() => { document.querySelectorAll("#pt-pg-chk, #pt-pg-hub").forEach(d => { d.open = true; }); }')
    txt = p.evaluate('() => document.getElementById("pt-pg-chk").textContent')
    c.ok('Streak shields' in txt and '0 of 3' in txt, 'the check-in card shows the shields (0 left)')
    c.ok('Buy' in txt and '150' in txt, 'with a Buy button and its price')
    c.eq(p.evaluate('() => document.querySelectorAll("#pt-pg-chk .pt-dot.sh").length'), 1, 'the covered day is amber in the strip')
    c.eq(p.evaluate('() => document.getElementById("pt-shield-use") === null'), True, 'no "protect today" without a shield')
    p.evaluate('() => document.getElementById("pt-shield-buy").click()')
    p.wait_for_timeout(400)
    c.eq(p.evaluate('() => app.settings.shields'), 1, 'the Buy button buys one')
    c.ok('1 of 3' in p.evaluate('() => document.getElementById("pt-pg-chk").textContent'), 'and the card updates')
    c.ok('🛡 1' in p.evaluate('() => document.getElementById("pt-pg-hub").textContent'), 'the Rewards card shows the shield next to the streak')
    c.ok('Spent on streak shields' in p.evaluate('() => document.getElementById("pt-pg-hub").textContent'), 'How coins work lists the spend')
    c.eq(p.evaluate('() => document.getElementById("pt-shield-use") !== null'), True, 'now there is a "protect today" button')
    p.evaluate('() => document.getElementById("pt-shield-use").click()')
    p.wait_for_timeout(400)
    c.eq(p.evaluate('() => app.settings.shielded.includes(ds(0))'), True, 'it protects today')
    c.ok('Protected' in p.evaluate('() => document.getElementById("pt-pg-chk").textContent'), 'and the card says Protected')
    # Home: the prompt goes away while today is protected, and comes back when it is not
    p.evaluate('() => { app.showView("home"); app.renderHomeView(); }')
    p.wait_for_timeout(300)
    c.eq(p.evaluate('() => document.getElementById("pt-checkin") === null'), True, 'Home does not ask you to check in on a protected day')
    p.evaluate('() => { app.settings.shielded = app.settings.shielded.filter(k => k !== ds(0)); app.settings.shields = 1; app.renderHomeView(); }')
    p.wait_for_timeout(300)
    chip = p.evaluate('() => (document.getElementById("pt-checkin") || {}).textContent || ""')
    c.ok("I'm in today" in chip and '🛡 1' in chip, 'otherwise the chip is there and shows the shield you hold (%r)' % chip)
    c.eq(p.errors, [], 'no page errors')

with page(w=360, h=740) as p:
    p.evaluate(SETUP)
    p.evaluate('() => { days(-4, -3, -2); app.settings.shields = 2; app._progTab = "rewards"; app.showView("progress"); app.renderProgressView(); }')
    p.wait_for_timeout(400)
    p.evaluate('() => { document.getElementById("pt-pg-chk").open = true; }')
    c.eq(p.evaluate('() => document.documentElement.scrollWidth <= window.innerWidth + 1'), True, 'no sideways scroll on a small phone')
    c.eq(p.errors, [], 'no page errors')
c.done()
