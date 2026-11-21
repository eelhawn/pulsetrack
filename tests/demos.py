"""3.19.0 a moving demo for every exercise: Step by step plays every exercise (PT.figure.demo). Two-pose moves go Start to Halfway and
back; running, walking, bikes, the stair climber, swimming, sled pushes, bear crawls and jump rope loop; held positions (planks, wall
sits, stretches) stay still with a Hold timer counting the seconds. Exercises with their own pictures (bench press, squat ...) play the
drawn figure too, and Pause shows their own pictures."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

c = Checks('demos')
SRCS = '''async () => { const seen = new Set(); for (let i = 0; i < 18; i++) { const im = document.getElementById("pt-sv-anim"); if (im) seen.add(im.getAttribute("src")); await new Promise(r => setTimeout(r, 90)); } return seen.size; }'''
with page(360, 780) as p:
    p.wait_for_function('() => typeof EXERCISE_DATABASE !== "undefined" && EXERCISE_DATABASE.length > 3000 && !!PT.figure && !!PT.figure.demo', timeout=30000)
    p.evaluate('() => { localStorage.removeItem("pt-sv-play"); PT.guideSteps.setPlay(true); }')
    r = p.evaluate('''() => { const k = {}, none = [];
      EXERCISE_DATABASE.forEach(e => { const d = PT.figure.demo(e.name); if (!d || !d.frames.length || !d.seq.length) none.push(e.name); else k[d.kind] = (k[d.kind] || 0) + 1; });
      return { k, none: none.slice(0, 5), n: EXERCISE_DATABASE.length }; }''')
    c.eq(r['none'], [], 'every one of the %d exercises has a demo' % r['n'])
    c.ok(r['k'].get('move', 0) > 2500 and r['k'].get('cycle', 0) >= 30 and r['k'].get('hold', 0) >= 100, 'moves, loops and holds (%s)' % r['k'])
    kinds = p.evaluate('''() => ["Treadmill", "Stationary Bike", "Arm Bike", "Stairmaster", "Walking", "Jump Rope", "Plank", "Wall Sit", "Barbell Curls", "Bench Press"].map(n => [n, PT.figure.demo(n).kind, PT.figure.demo(n).frames.length])''')
    c.eq([k for _, k, _ in kinds], ['cycle'] * 6 + ['hold'] * 2 + ['move'] * 2, 'running, bikes, stairs, walking and jump rope loop; plank and wall sit hold; curls and bench press move')
    c.ok(all(n >= 6 for _, k, n in kinds if k != 'hold'), 'each loop or move has several pictures')
    c.ok(p.evaluate('(() => { const f = PT.figure.demo("Stationary Bike").frames; return new Set(f).size === f.length; })()'), 'the bike pedals go round (12 different pictures)')

    # ---- in Step by step
    def open_ex(n):
        p.evaluate('(n) => { app.closeSheet(); app.openExerciseSheet(n); }', n); p.wait_for_timeout(500)
    open_ex('Treadmill')
    c.ok(p.evaluate('!!document.getElementById("pt-sv-anim")') and p.evaluate(SRCS) >= 4, 'Treadmill: the running plays')
    open_ex('Plank')
    p.wait_for_timeout(2300)
    h = p.evaluate('(document.getElementById("pt-sv-hold") || {}).textContent || ""')
    c.ok(h.startswith('Hold · 0:0') and h != 'Hold · 0:00', 'Plank: the picture holds still and a Hold timer counts the seconds (%s)' % h)
    c.ok('position to hold' in p.evaluate('document.getElementById("pt-sv-anim").alt'), 'and says it is a position to hold')
    open_ex('Bench Press')
    st = p.evaluate('() => ({ anim: !!document.getElementById("pt-sv-anim"), cr: (document.querySelector("#pt-sv .pt-sv-cr") || {}).textContent || "" })')
    c.ok(st['anim'] and p.evaluate(SRCS) >= 4, 'Bench Press (it has its own pictures) plays the drawn move')
    c.ok('Moving drawing: PulseTrack' in st['cr'], 'and the credit says the moving drawing is PulseTrack\'s')
    p.click('#pt-sv [data-sv=play]'); p.wait_for_timeout(250)
    own = p.evaluate('(document.querySelector("#pt-sv .pt-sv-img") || {}).getAttribute ? document.querySelector("#pt-sv .pt-sv-img").getAttribute("src") : ""')
    c.ok(not p.evaluate('!!document.getElementById("pt-sv-anim")') and own and not own.startswith('data:'), 'Pause shows its own step picture (%s)' % own[:40])
    p.click('#pt-sv [data-sv=play]'); p.wait_for_timeout(200)
    aud = p.evaluate(open(os.path.join(ROOT, 'tests', 'fixtures', 'design_audit.js'), encoding='utf-8').read())
    c.eq({k: aud['samples'][k][:3] for k, v in aud['counts'].items() if v}, {}, 'the exercise sheet passes the design audit at 360px')
    open_ex('Plank')
    aud = p.evaluate(open(os.path.join(ROOT, 'tests', 'fixtures', 'design_audit.js'), encoding='utf-8').read())
    c.eq({k: aud['samples'][k][:3] for k, v in aud['counts'].items() if v}, {}, 'with the Hold timer too')
    c.eq(p.errors, [], 'no errors')

sys.exit(c.done())
