"""3.22.1 the Bench Press and Squat counters use whichever is stronger, the normal lift or its Smith machine version (the owner: "for the
bench press counter use bench press not Smith flat press", then "for both bench and squats use whichever is stronger between normal and
Smith machine"). The Home trophy room counts the flat barbell bench press or the Smith Machine Flat Press, the barbell back squat or the
Smith machine squat, and nothing else (it used to count decline and close-grip bench, front and hack squats). The same lifts as the
Strength level card, lift ranks and Bench badges."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page

c = Checks('benchcount')
SEED = '''(lifts) => { const a = app, now = Date.now();
  a.sessions = a.sessions.filter(s => !String(s.id).startsWith("bc"));
  lifts.forEach(([n, w], i) => { const t = now - (i + 1) * 86400000;
    a.sessions.push({ id: "bc" + i, v: 1, date: PT.ds(new Date(t)), ts: t, pid: "x", ptitle: "P", day: 1, dtitle: "Push", dur: 3000, unit: "lb",
      ex: [{ name: n, sets: [{ w, r: 1, t: "R" }] }], vol: 0, sets: 1, prs: [], upd: t }); });
  a.prs = {}; a.saveSessions(); a.rebuildPRs(); }'''
ROW = '''(k) => { app.showView("home"); app.renderTrophyRoom(); const r = document.querySelector(`#trophy-room [data-lift="${k}"] .pt-tr-v`); return r ? r.innerText.replace(/\\s+/g, " ").trim() : null; }'''
BADGE = '''(k) => { const b = (PT.badges(app) || []).find(x => x.series === k); return b ? Math.round(b.cur) : null; }'''
OTHERS = [["Decline Bench Press", 295], ["Close-Grip Bench Press", 290], ["Hack Squat", 455], ["Front Squat", 345]]

with page(w=360) as p:
    p.wait_for_function('() => typeof PT !== "undefined" && !!PT.badges && !!PT.bigBest', timeout=20000)
    # the Smith versions are stronger
    p.evaluate(SEED, [["Smith Machine Flat Press", 275], ["Barbell Bench Press", 205], ["Smith Machine Squats", 315], ["Barbell Squat", 285]] + OTHERS)
    t = p.evaluate(ROW, 'Bench Press')
    c.ok(t is not None and t.startswith('275'), 'Smith flat press 275 beats bench press 205: the Bench Press counter shows 275 (got %s)' % t)
    t = p.evaluate(ROW, 'Squat')
    c.ok(t is not None and t.startswith('315'), 'Smith squat 315 beats back squat 285: the Squat counter shows 315 (got %s)' % t)
    c.eq([round(p.evaluate('PT.bigBest(app, "bench")')), round(p.evaluate('PT.bigBest(app, "squat")'))], [275, 315], 'the Strength level card and lift ranks agree')
    c.eq([p.evaluate(BADGE, 'bench'), p.evaluate(BADGE, 'squat')], [275, 315], 'and the Bench and Squat badges')
    # the normal lifts are stronger
    p.evaluate(SEED, [["Smith Machine Flat Press", 275], ["Barbell Bench Press", 300], ["Smith Machine Squats", 315], ["Barbell Squat", 335]] + OTHERS)
    t = p.evaluate(ROW, 'Bench Press')
    c.ok(t is not None and t.startswith('300'), 'bench press 300 beats the Smith: the counter shows 300 (got %s)' % t)
    t = p.evaluate(ROW, 'Squat')
    c.ok(t is not None and t.startswith('335'), 'back squat 335 beats the Smith: the counter shows 335 (got %s)' % t)
    c.eq([round(p.evaluate('PT.bigBest(app, "bench")')), round(p.evaluate('PT.bigBest(app, "squat")'))], [300, 335], 'the Strength level card and lift ranks agree')
    # neither: decline / close-grip bench, hack / front squats do not count
    p.evaluate(SEED, OTHERS)
    c.ok('no PR' in (p.evaluate(ROW, 'Bench Press') or '') and 'no PR' in (p.evaluate(ROW, 'Squat') or ''), 'decline or close-grip bench and hack or front squats do not count for either counter')
    c.eq(p.errors, [], 'no errors')

sys.exit(c.done())
