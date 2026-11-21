"""3.21.0 the machines match the figure (the owner: "lat pulldown and stuff, leg press and others just look weird, fix them up to match
the machine", and the LA Fitness glute kickback machine). Checked on the joints of every picture of a demo, in the machine's own
coordinates (PT.machineDemo.posesOf): you sit facing the lat pulldown's stack with the roller pads on your thighs; the 45-degree leg
press moves along a 45-degree rail with the feet flat on the plate; plate-loaded presses keep their plates off your head; the
chest-supported rows have the pad on your chest; the assisted pull-up kneels on its pad; the calf machine keeps the balls of your feet
on the block; glute kickbacks play on a glute kickback machine."""
import math, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

c = Checks('machinefit')
P = 'n => PT.machineDemo.posesOf(n)'
# parts of a machine drawing: the weight stack, padded rects, chest pads (wide pad lines), blocks
PARTS = '''(eq) => { const ps = PT.equip.EQUIP[eq].draw();
  return { stack: ps.filter(q => q.k === "r" && q.fill === "#27272a").map(q => [q.x, q.y, q.w, q.h]),
    rects: ps.filter(q => q.k === "r").map(q => [q.x, q.y, q.w, q.h, q.fill]),
    pads: ps.filter(q => q.k === "l" && q.c === "#3f3f46" && q.w >= 12).map(q => [q.a, q.b]) }; }'''
d = math.dist
def seg(p, a, b):
    """distance from point p to segment ab"""
    ax, ay, bx, by = a[0], a[1], b[0], b[1]; t = ((p[0] - ax) * (bx - ax) + (p[1] - ay) * (by - ay)) / (((bx - ax) ** 2 + (by - ay) ** 2) or 1)
    t = max(0, min(1, t)); return d(p, (ax + t * (bx - ax), ay + t * (by - ay)))
def ang(a, b):
    return math.degrees(math.atan2(-(b[1] - a[1]), b[0] - a[0]))
def qat(a, q, b, u):
    return ((1 - u) ** 2 * a[0] + 2 * u * (1 - u) * q[0] + u * u * b[0], (1 - u) ** 2 * a[1] + 2 * u * (1 - u) * q[1] + u * u * b[1])

with page(360, 780) as p:
    p.wait_for_function('() => typeof EXERCISE_DATABASE !== "undefined" && EXERCISE_DATABASE.length > 3000 && !!PT.machineDemo', timeout=30000)
    ok = p.evaluate('() => !!PT.machineDemo.posesOf')
    c.ok(ok, 'the demos can say where each joint is on the machine')
    if not ok:
        sys.exit(c.done())

    # ---- lat pulldown: facing the stack, rollers on the thighs, the bar to the upper chest
    for n in ('Lat Pulldown', 'Wide-Grip Lat Pulldown', 'Neutral-Grip (V-Bar) Lat Pulldown'):
        r = p.evaluate(P, n); f0, f1 = r['frames'][0], r['frames'][-1]
        st = p.evaluate(PARTS, r['machine'])['stack']
        c.ok(r['machine'] == 'lat_pulldown_machine' and st and st[0][0] > f0['toe'][0] > f0['hip'][0], '%s: sits facing the weight stack' % n)
        g = [seg((176, 140), f['hip'], f['knee']) for f in (f0, f1)]
        c.ok(all(12 <= x <= 20 for x in g), '%s: the roller pads rest on the thighs (%s)' % (n, [round(x, 1) for x in g]))
    r = p.evaluate(P, 'Lat Pulldown'); f0, f1 = r['frames'][0], r['frames'][-1]
    c.ok(f0['hand'][1] < f0['head'][1] - 10 and f1['hand'][1] > f1['shoulder'][1], 'the bar starts above the head and comes down to the upper chest')

    # ---- 45-degree leg press: along the rail, feet flat on the plate, knees towards the chest
    r = p.evaluate(P, 'Leg Press'); fs = r['frames']; f0, f1 = fs[0], fs[-1]
    a = ang(f0['ankle'], f1['ankle'])
    c.ok(r['machine'] == 'leg_press_45' and abs(a - 45) < 4, 'Leg Press: the feet travel up a 45-degree rail (%.1f)' % a)
    ft = [ang(f['ankle'], f['toe']) for f in fs]
    c.ok(all(abs(x - 135) < 8 for x in ft), 'the feet stay flat on the foot plate, square to the rail (%s)' % [round(x) for x in ft[::4]])
    side = (f0['knee'][0] - f0['hip'][0]) * (f0['ankle'][1] - f0['hip'][1]) - (f0['knee'][1] - f0['hip'][1]) * (f0['ankle'][0] - f0['hip'][0])
    c.ok(side > 0 and d(f0['hip'], f0['ankle']) < 70 < d(f1['hip'], f1['ankle']), 'knees bent towards the chest at the bottom, legs long at the top')

    # ---- seated leg press: soles on the upright plate
    r = p.evaluate(P, 'Seated Leg Press'); fs = r['frames']
    pl = [q for q in p.evaluate(PARTS, 'leg_press_seated')['rects'] if q[3] > 60 and q[4] == '#3f3f46']
    c.ok(r['machine'] == 'leg_press_seated' and all(abs(f['toe'][0] - f['ankle'][0]) < 2 and f['toe'][1] < f['ankle'][1] for f in fs), 'Seated Leg Press: the soles stay flat on the upright plate')
    c.ok(pl and abs(pl[0][0] - (fs[0]['ankle'][0] + 4.5)) < 3, 'and reach it at the start (plate %s, soles %.1f)' % (pl and pl[0][0], fs[0]['ankle'][0] + 4.5))

    # ---- plate-loaded presses: the plates never cover the head
    for n in ('Hammer Strength Flat Press', 'Hammer Strength Incline Press', 'Iso-Lateral Plate-Loaded Decline Press', 'Lever Seated Shoulder Press'):
        r = p.evaluate(P, n); L = r['fe']['lever']; k = r['fe']['k']
        gaps = []
        for f in r['frames']:
            tip = f['grip']; q = L.get('ctrl'); a = L['from']
            if not q:   # a bow of L.curve px off the straight line (3.20.0)
                l = d(a, tip) or 1; q = ((a[0] + tip[0]) / 2 + (tip[1] - a[1]) / l * L['curve'], (a[1] + tip[1]) / 2 - (tip[0] - a[0]) / l * L['curve'])
            pc = qat(L['from'], q, tip, L['at']); gaps.append(d(pc, f['head']) - L['plates'] - 11 * k)
        c.ok(gaps and min(gaps) > 0, '%s: the plates stay clear of the head (%s)' % (n, round(min(gaps), 1)))

    # ---- chest-supported rows: the pad on the chest
    for n in ('Hammer Strength Row', 'Machine Row'):
        r = p.evaluate(P, n); f0 = r['frames'][0]; pads = p.evaluate(PARTS, r['machine'])['pads']
        g = min(seg(((a[0] + b[0]) / 2, (a[1] + b[1]) / 2), f0['hip'], f0['shoulder']) for a, b in pads if (a[0] + b[0]) / 2 > f0['hip'][0] + 10)
        c.ok(g < 20, '%s: the chest pad is against the chest (%.1f)' % (n, g))

    # ---- assisted pull-up: kneeling on the pad
    r = p.evaluate(P, 'Machine Assisted Pull-Ups'); fs = r['frames']
    c.ok(all(abs(f['ankle'][1] - f['knee'][1]) < 5 for f in fs) and fs[-1]['knee'][1] < fs[0]['knee'][1] - 30, 'Assisted pull-up: kneels on the pad (shins flat on it) and the pad pushes up')

    # ---- standing calf machine: the balls of the feet stay on the block
    r = p.evaluate(P, 'Standing Machine Calf Raises'); fs = r['frames']
    bl = [q for q in p.evaluate(PARTS, r['machine'])['rects'] if q[4] == '#8f8f99' and q[2] > 40][0]
    c.ok(abs(fs[0]['toe'][1] + 4 - bl[1]) < 3 and bl[0] < fs[0]['toe'][0] < bl[0] + 20 and fs[0]['ankle'][0] < bl[0], 'Calf machine: the balls of the feet on the edge of the block, heels off it (block %s, toe %s)' % (bl[:2], [round(x) for x in fs[0]['toe']]))
    c.ok(d(fs[0]['toe'], fs[-1]['toe']) < 1.5 and fs[0]['ankle'][1] > fs[0]['toe'][1] and fs[-1]['ankle'][1] < fs[-1]['toe'][1] - 4, 'Calf machine: toes stay on the block, heels drop below it and rise above')

    # ---- the glute kickback machine
    eq = p.evaluate('() => ["Glute Kickbacks", "Standing Machine Glute Kickbacks", "Cable Glute Kickbacks"].map(n => (PT.equip.of(n) || {}).items[0] + "/" + (PT.figure.demo(n).machine || "-"))')
    c.eq(eq, ['glute_machine/glute_machine', 'glute_machine/glute_machine', 'cable_station/-'], 'glute kickbacks play on the glute kickback machine (the cable ones at the cable station)')
    r = p.evaluate(P, 'Glute Kickbacks'); fs = r['frames']; f0, f1 = fs[0], fs[-1]; k = r['fe']['k']
    c.ok(all(188 <= f['ankle2'][1] <= 197 for f in fs) and f0['shoulder'][0] - f0['hip'][0] > 25, 'standing on the platform, leaning forward on the pads')
    c.ok(f0['knee'][0] > f0['hip'][0] and f1['knee'][0] < f1['hip'][0] - 20, 'the working leg starts forward and kicks back')
    piv = (f0['hip'][0] - 18 * k, f0['hip'][1] + 2 * k); ls = [d(piv, f['ankle']) for f in fs]
    c.ok(max(ls) - min(ls) < 3, 'the foot plate lever keeps its length as it swings (%.1f-%.1f)' % (min(ls), max(ls)))
    c.eq(p.evaluate('PT.figure.classify("Glute Kickbacks").kit'), 'machine', "your Glute Kickbacks are done on the machine")
    c.ok(p.evaluate('(PT.equip.of("Jacob\'s Ladder") || {}).items[0] !== "treadmill"'), "Jacob's Ladder is not drawn on a treadmill")

    # ---- on the exercise sheet
    p.evaluate('() => { localStorage.removeItem("pt-sv-play"); PT.guideSteps.setPlay(true); app.openExerciseSheet("Glute Kickbacks"); }'); p.wait_for_timeout(800)
    t = p.evaluate('() => [decodeURIComponent((document.getElementById("pt-sv-anim") || {}).src || ""), (document.getElementById("ex-equip") || {}).innerText || ""]')
    c.ok('aria-label="Glute kickback machine"' in t[0] and 'Glute kickback machine' in t[1], 'the sheet shows the machine in Equipment and plays the demo on it')
    aud = p.evaluate(open(os.path.join(ROOT, 'tests', 'fixtures', 'design_audit.js'), encoding='utf-8').read())
    c.eq({k: aud['samples'][k][:3] for k, v in aud['counts'].items() if v}, {}, 'passes the design audit at 360px')
    c.eq(p.errors, [], 'no errors')

sys.exit(c.done())
