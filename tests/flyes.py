"""3.21.1 flyes seen from the right angle (the owner: "the motion for flyes is incorrect, show it from a different angle"). From the side a
lying or incline fly swung the arm down past the bench towards the head, like a pullover. Now they are seen from above, lying on the
bench: arms out wide, then together over the chest, the hands moving straight across the body. Reverse flyes on cables or the reverse
pec deck start with the hands in front at shoulder height and open out at that height (they used to swing up over the head); on the
cable crossover the cables are crossed, and the reverse pec deck plays on the pec deck."""
import math, os, re, sys, urllib.parse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

c = Checks('flyes')
d = math.dist
# every pose of an exercise's demo (the figure's own coordinates)
POSES = r'''(n) => { const out = []; PT.figure.demoWith(n, j => { out.push(JSON.parse(JSON.stringify(j))); return "x"; }); return out; }'''

with page(360, 780) as p:
    p.wait_for_function('() => typeof EXERCISE_DATABASE !== "undefined" && EXERCISE_DATABASE.length > 3000 && !!PT.figure', timeout=30000)

    # ---- lying and incline flyes: from above
    for n in ('Dumbbell Flyes', 'Incline Dumbbell Flyes', 'Flat Cable Flyes (Bench)', 'Incline Cable Flyes (Bench)'):
        fs = p.evaluate(POSES, n); a, b = fs[0], fs[-1]
        lying = a.get('view') == 'front' and a['head'][0] < a['pel'][0] - 40 and abs(a['head'][1] - a['pel'][1]) < 10
        c.ok(lying, '%s: seen from above, lying along the bench' % n)
        if not lying:
            continue
        c.ok(abs(a['haR'][1] - a['haL'][1]) > 120 and d(b['haR'], b['haL']) < 16, '%s: arms out wide, then the hands together' % n)
        drift = max(max(abs(f['haR'][0] - f['shR'][0]), abs(f['haL'][0] - f['shL'][0])) for f in fs)
        c.ok(drift < 16, '%s: the hands move straight across the body, never down towards the head or feet (%.1f)' % (n, drift))
    cab = p.evaluate('''() => { const P = PT.figure.PATTERNS.fly_lying, j = PT.figure.layout("fly_lying", "cable").frames[0].j, q = P.cable(j); return [q, j.pel]; }''')
    two = isinstance(cab[0], list) and len(cab[0]) == 2 and all(isinstance(q, list) for q in cab[0])
    c.ok(two and (cab[0][0][1] - cab[1][1]) * (cab[0][1][1] - cab[1][1]) < 0, 'bench cable flyes: the cables come from each side')

    # ---- reverse flyes
    for n in ('Cable Rear Delt Flyes', 'Reverse Pec Deck', 'Lever Seated Reverse Fly'):
        fs = p.evaluate(POSES, n); a, b = fs[0], fs[-1]
        c.ok(abs(a['haR'][1] - a['shR'][1]) < 10 and abs(b['haR'][1] - b['shR'][1]) < 10 and b['haR'][0] - b['shR'][0] > 50, '%s: hands in front at shoulder height, then out wide at that height' % n)
        top = min(min(f['haR'][1], f['haL'][1]) for f in fs)
        c.ok(top > a['head'][1], '%s: the hands never swing up over the head (%.0f vs head %.0f)' % (n, top, a['head'][1]))
    fs = p.evaluate(POSES, 'Dumbbell Reverse Flyes')
    c.ok(fs[0]['head'][1] >= fs[0]['shR'][1] - 4, 'Dumbbell Reverse Flyes: still bent over')
    m = p.evaluate('["Reverse Pec Deck", "Cable Rear Delt Flyes"].map(n => PT.figure.demo(n).machine)')
    c.eq(m, ['pec_deck', 'cable_crossover'], 'the reverse pec deck plays on the pec deck, the rear delt flyes on the cable crossover')
    s = p.evaluate('() => decodeURIComponent(PT.figure.demo("Cable Rear Delt Flyes").frames[0].split(",").slice(1).join(","))')
    cab = [tuple(map(float, x)) for x in re.findall(r'<line x1="([\d.]+)" y1="([\d.]+)" x2="([\d.]+)" y2="([\d.]+)" stroke="#a1a1aa" stroke-width="2"', s)]
    cab = [q for q in cab if q[1] == 34 and q[0] in (70, 250)]   # the cables leave the high pulleys (the stack's guide rods are lines too)
    c.ok(len(cab) == 2 and all((x1 - 160) * (x2 - 160) < 0 for x1, y1, x2, y2 in cab), 'on the cable crossover the cables are crossed (%s)' % [(round(x1), round(x2)) for x1, y1, x2, y2 in cab])

    # ---- on the exercise sheet
    p.evaluate('() => { localStorage.removeItem("pt-sv-play"); PT.guideSteps.setPlay(true); app.openExerciseSheet("Incline Dumbbell Flyes"); }'); p.wait_for_timeout(800)
    t = p.evaluate('() => decodeURIComponent((document.getElementById("pt-sv-anim") || {}).src || "")')
    c.ok(t.startswith('data:image/svg+xml') and '<svg' in t, 'Incline Dumbbell Flyes plays in Step by step')
    aud = p.evaluate(open(os.path.join(ROOT, 'tests', 'fixtures', 'design_audit.js'), encoding='utf-8').read())
    c.eq({k: aud['samples'][k][:3] for k, v in aud['counts'].items() if v}, {}, 'passes the design audit at 360px')
    c.eq(p.errors, [], 'no errors')

sys.exit(c.done())
