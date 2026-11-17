"""2.90.0: the 5 day weekly goal and Family → Group. (Its dumbbell, loot chest, shop, group rewards and news checks were retired in 3.2.0
with the rewards; tests/norewards.py checks they stay gone.)"""
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
    c.eq(p.evaluate('() => [app.settings.weeklyGoal, app.settings.weekGoal, PT.goalFor(app, MON(0))]'), [5, 5, 5], 'a new phone starts on a 5 day weekly goal (streak and weekly goal)')
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

c.done()
