"""3.14.0 lift goals with a date: a goal is a weight for some reps ("225 lb x 1", "185 x 5") with an optional date. Progress > Strength >
Lift goals shows the progress bar, the pace you need a week to make the date and the pace you are on (last 12 weeks): on track,
behind, or the date has passed. Goals can be changed; an exercise's own sheet shows its goal (or Set a goal); switching lb/kg
converts them. Old goals ({ name, target }) still work."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page
ROOT = os.path.dirname(os.path.abspath(__file__))

c = Checks('goals')
# ten weeks of bench, the top set going up 4 lb a week (est. 1RM about +4.7 a week): 150x5 ... 186x5
SEED = '''() => { const a = app, W = 7 * 86400000, now = Date.now();
  for (let k = 9; k >= 0; k--) { const t = now - k * W - 86400000, d = new Date(t);
    a.sessions.push({ id: "gb" + k, v: 1, date: PT.ds(d), ts: t, pid: "x", ptitle: "P", day: 1, dtitle: "Push", dur: 3000, unit: "lb",
      ex: [{ name: "Bench Press", sets: [{ w: 150 + (9 - k) * 4, r: 5, t: "R" }] }], vol: 0, sets: 1, prs: [], upd: t }); }
  a.saveSessions(); a.rebuildPRs(); }'''
ST = lambda i: '(() => { const s = PT.goalStatus(app, app.settings.liftGoals[%d]); return { state: s.state, text: s.text, need: s.need, pc: s.pc, slope: s.p && s.p.slope }; })()' % i
IN = lambda days: "(() => { const d = new Date(Date.now() + %d * 86400000); return PT.ds(d); })()" % days

with page(w=360) as p:
    p.wait_for_function('() => typeof PT !== "undefined" && !!PT.goalRow && !!PT.goalStatus', timeout=20000)
    p.evaluate(SEED)
    best = p.evaluate('app.prs["Bench Press"]')
    c.ok(200 <= best <= 220, 'set-up: a best bench of %s lb est. 1RM' % best)

    # ---- set a goal from Progress > Strength
    p.evaluate('() => { app.showView("progress"); }'); p.wait_for_timeout(300)
    p.evaluate('() => { const t = document.querySelector("[data-ptab-btn=strength], #pt-ptabs [data-k=strength], #pt-ptabs button:nth-child(3)"); if (t) t.click(); }'); p.wait_for_timeout(300)
    p.evaluate('() => { const d = document.getElementById("pt-pg-goals"); if (d) d.open = true; }'); p.wait_for_timeout(100)
    c.ok(p.evaluate('!!document.getElementById("pt-goal-add")'), 'Progress > Strength > Lift goals has Add a goal')
    p.evaluate('document.getElementById("pt-goal-add").click()'); p.wait_for_timeout(400)
    c.ok(p.evaluate('!!document.getElementById("pt-goal-by") && document.getElementById("pt-goal-by").type === "date" && !!document.getElementById("pt-goal-r")'), 'the goal has a weight, reps and an optional date')
    p.evaluate('() => { const s = document.getElementById("pt-goal-name"); s.value = "Bench Press"; s.dispatchEvent(new Event("change")); }')
    p.fill('#pt-goal-w', '225'); p.fill('#pt-goal-r', '3'); p.wait_for_timeout(100)
    c.ok('About 248 lb for 1' in p.evaluate('document.getElementById("pt-goal-e1").textContent'), 'for more than one rep it says the estimated 1RM it counts')
    p.evaluate('(v) => { const i = document.getElementById("pt-goal-by"); i.value = v; }', p.evaluate(IN(70)))
    p.click('#pt-goal-save'); p.wait_for_timeout(400)
    g = p.evaluate('app.settings.liftGoals')
    c.ok(len(g) == 1 and g[0]['name'] == 'Bench Press' and g[0]['w'] == 225 and g[0]['r'] == 3 and g[0]['target'] == 248 and g[0]['by'] == p.evaluate(IN(70)), 'saved: Bench Press, 225 lb x 3 (248 est. 1RM) by a date')

    # ---- the status: pace needed against pace on
    st = p.evaluate(ST(0))
    c.ok(st['need'] and 3 < st['need'] < 6 and st['slope'] > 4, 'pace needed %.1f lb a week, pace on %.1f' % (st['need'] or 0, st['slope']))
    c.eq(st['state'], 'on', 'adding about 4.7 a week, needing about 4: on track')
    t = p.evaluate('(document.querySelector("[data-goal-row] [data-goal-state]") || {}).textContent || ""')
    c.ok('To make it by' in t and 'a week' in t and 'on track' in t, 'Lift goals says it (%s)' % t[:80])
    c.ok('225 lb × 3 by' in p.evaluate('document.querySelector("[data-goal-row]").innerText'), 'and shows the goal as you set it')
    # a nearer date: behind
    p.evaluate('(v) => { app.settings.liftGoals[0].by = v; }', p.evaluate(IN(21)))
    st = p.evaluate(ST(0))
    c.ok(st['state'] == 'behind' and 'behind' in st['text'] and 'at this pace' in st['text'], 'three weeks away: behind, with when you would get there (%s)' % st['text'][-60:])
    p.evaluate('(v) => { app.settings.liftGoals[0].by = v; }', p.evaluate(IN(-3)))
    c.eq(p.evaluate(ST(0))['state'], 'late', 'a date in the past says it has passed')
    p.evaluate('() => { delete app.settings.liftGoals[0].by; }')
    c.ok('On your pace' in p.evaluate(ST(0))['text'], 'no date: when you will get there on your pace')
    p.evaluate('() => { app.settings.liftGoals.push({ name: "Bench Press", target: 180 }); }')
    c.eq(p.evaluate(ST(1))['state'], 'done', 'an old goal (just a target 1RM) still works, and is reached')
    p.evaluate('() => { app.settings.liftGoals.pop(); }')

    # ---- change it
    p.evaluate('() => { app.renderProgressView(); const d = document.getElementById("pt-pg-goals"); if (d) d.open = true; }'); p.wait_for_timeout(300)
    p.evaluate('document.querySelector("[data-goal-edit]").click()'); p.wait_for_timeout(300)
    c.eq(p.evaluate('[document.getElementById("pt-goal-w").value, document.getElementById("pt-goal-r").value, document.getElementById("pt-goal-name").value]'), ['225', '3', 'Bench Press'], 'Edit opens the goal as it is')
    p.fill('#pt-goal-w', '235'); p.click('#pt-goal-save'); p.wait_for_timeout(300)
    c.eq([p.evaluate('app.settings.liftGoals.length'), p.evaluate('app.settings.liftGoals[0].w')], [1, 235], 'saving changes it, no second goal')

    # ---- on the exercise's own sheet
    p.evaluate('() => { app.showView("home"); app.openExerciseSheet("Bench Press"); }'); p.wait_for_timeout(500)
    r = p.evaluate('() => { const g = document.getElementById("pt-exgoal"), e = document.getElementById("ex-equip"); return g && { t: g.innerText, before: !!(e && (g.compareDocumentPosition(e) & 4)) }; }')
    c.ok(r and 'Goal: 235 lb × 3' in r['t'] and '%' in r['t'], 'the exercise sheet shows its goal and progress')
    c.ok(r and r['before'], 'above Equipment')
    p.evaluate('() => { app.closeSheet(); app.openExerciseSheet("Barbell Rows"); }'); p.wait_for_timeout(400)
    c.ok(not p.evaluate('!!document.getElementById("pt-exgoal")'), 'an exercise you have not logged shows nothing')
    p.evaluate('''() => { const d = new Date(Date.now() - 86400000); app.sessions.push({ id: "gr1", v: 1, date: PT.ds(d), ts: d.getTime(), pid: "x", ptitle: "P", day: 1, dtitle: "Pull", dur: 3000, unit: "lb",
      ex: [{ name: "Barbell Rows", sets: [{ w: 135, r: 8, t: "R" }] }], vol: 0, sets: 1, prs: [], upd: d.getTime() }); app.saveSessions(); app.rebuildPRs(); app.closeSheet(); app.openExerciseSheet("Barbell Rows"); }'''); p.wait_for_timeout(400)
    c.ok('Set a goal' in p.evaluate('(document.getElementById("pt-exgoal") || {}).innerText || ""'), 'one you have logged offers Set a goal')
    p.click('#pt-exgoal [data-exgoal=add]'); p.wait_for_timeout(300)
    c.eq(p.evaluate('document.getElementById("pt-goal-name").value'), 'Barbell Rows', 'which opens with that lift')
    p.click('#pt-goal-save'); p.wait_for_timeout(400)
    c.ok('Goal:' in p.evaluate('(document.getElementById("pt-exgoal") || {}).innerText || ""'), 'and the sheet shows the new goal straight away')

    # ---- lb to kg
    p.evaluate('() => app.convertAllWeights(1 / 2.2046226, 1 / 2.54)')
    g = p.evaluate('app.settings.liftGoals[0]')
    c.ok(abs(g['w'] - 106.5) < 1 and abs(g['target'] - 259 / 2.2046) < 1.5, 'switching to kg converts the goals (235 lb -> %s kg)' % g['w'])

    # ---- remove
    p.evaluate('() => { app.closeSheet(); const s = document.getElementById("pt-goal-sheet"); if (s) s.remove(); app.showView("progress"); app.renderProgressView(); const d = document.getElementById("pt-pg-goals"); if (d) d.open = true; }'); p.wait_for_timeout(300)
    p.evaluate('document.querySelector("[data-goal-del=\\"1\\"]").click()'); p.wait_for_timeout(300)
    c.eq(p.evaluate('app.settings.liftGoals.map(g => g.name)'), ['Bench Press'], 'Remove takes that goal off')

    aud = p.evaluate(open(os.path.join(ROOT, 'fixtures', 'design_audit.js'), encoding='utf-8').read())
    c.eq({k: aud['samples'][k][:3] for k, v in aud['counts'].items() if v}, {}, 'passes the design audit at 360px')
    c.ok(p.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'no sideways scroll')
    c.eq(p.errors, [], 'no errors')

sys.exit(c.done())
