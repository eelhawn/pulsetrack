"""3.20.0 the machines in the demos: an exercise done on a machine, bench, cable station or cardio machine that the Equipment section
draws plays its demo on that drawing (the figure placed on the seat, bench or platform; the handles, levers, pads, cables and sleds
that move follow the hands or feet). All the pictures of one demo share one zoom. Machines not in the list (and the Smith machine and
squat rack, drawn from the front) keep the plain demo."""
import os, re, sys, urllib.parse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

c = Checks('machinedemo')
ALL = r'''() => {
  const F = PT.figure, E = PT.equip, FIT = PT.machineDemo.FIT, out = [], names = EXERCISE_DATABASE.map(e => e.name);
  Object.keys(FIT).forEach(eq => Object.keys(FIT[eq]).forEach(mv => {
    const n = names.find(x => { const q = E.of(x), cl = F.classify(x); return q && q.items[0] === eq && cl && (cl.draw || cl.id) === mv; });
    if (!n) { out.push({ eq, mv, none: true }); return; }
    const d = F.demo(n), dec = (d && d.frames || []).map(u => decodeURIComponent(String(u).replace(/^data:image\/svg\+xml;charset=utf-8,/, "")));
    out.push({ eq, mv, n, machine: d && d.machine, kind: d && d.kind, frames: dec.length, distinct: new Set(dec).size,
      label: dec.length > 0 && dec[0].includes('aria-label="' + PT.esc(E.EQUIP[eq].label) + '"'),
      zoom: new Set(dec.map(s => (s.match(/<g transform="(translate\([^)]*\) scale\([^)]*\))">/) || [])[1])).size, svg: dec.every(s => s.startsWith("<svg") && s.endsWith("</svg>")) });
  }));
  return out;
}'''
with page(360, 780) as p:
    p.wait_for_function('() => typeof EXERCISE_DATABASE !== "undefined" && EXERCISE_DATABASE.length > 3000 && !!PT.machineDemo', timeout=30000)
    r = p.evaluate(ALL)
    used = [x for x in r if not x.get('none')]
    c.ok(len(used) >= 50, '%d machine and movement pairs have an exercise to show' % len(used))
    c.eq([x['n'] for x in used if x['machine'] != x['eq']], [], 'each plays on its machine')
    c.eq([x['n'] for x in used if not (x['svg'] and x['label'])], [], 'every picture is a whole drawing of that machine')
    c.eq([x['n'] for x in used if x['kind'] != 'hold' and x['distinct'] < 4], [], 'and moves (several different pictures)')
    c.eq([x['n'] for x in used if x['zoom'] != 1], [], 'with one zoom for the whole demo (the machine does not grow or shrink)')

    # ---- a few by name
    d = p.evaluate('''() => { const n = "Machine Chest Press", d = PT.figure.demo(n); return { m: d.machine, k: d.kind, f: d.frames.length }; }''')
    c.eq([d['m'], d['k'], d['f']], ['chest_press_machine', 'move', 9], 'Machine Chest Press plays on the chest press machine')
    handle = p.evaluate(r'''() => { const d = PT.figure.demo("Machine Chest Press"), get = u => decodeURIComponent(u.split(",").slice(1).join(","));
      const tip = s => { const m = [...s.matchAll(/<line x1="([\d.-]+)" y1="([\d.-]+)" x2="([\d.-]+)" y2="([\d.-]+)" stroke="#e4e4e7" stroke-width="6"/g)]; return m.length ? m[m.length - 1].slice(1).map(Number) : null; };
      const a = tip(get(d.frames[0])), b = tip(get(d.frames[8])); return a && b ? b[0] - a[0] : null; }''')
    c.ok(handle is not None and handle > 20, 'its handle moves forward with the hands (%s)' % handle)
    c.eq(p.evaluate('PT.figure.demo("Lat Pulldown").machine'), 'lat_pulldown_machine', 'Lat Pulldown on the lat pulldown')
    c.eq(p.evaluate('PT.figure.demo("Leg Press").machine'), 'leg_press_45', 'Leg Press on the 45-degree leg press')
    c.eq(p.evaluate('[PT.figure.demo("Stationary Bike").machine, PT.figure.demo("Stationary Bike").kind]'), ['upright_bike', 'cycle'], 'the bike pedals go round on the drawn bike')
    c.eq(p.evaluate('PT.figure.demo("Triceps Pushdown").machine'), 'cable_station', 'cable pushdowns at the cable station')
    st = p.evaluate(r'''() => { const d = PT.figure.demo("Cable Curls (Straight Bar)"), s = decodeURIComponent(d.frames[0].split(",").slice(1).join(","));
      const m = [...s.matchAll(/<line x1="([\d.]+)" y1="([\d.]+)" x2="[\d.]+" y2="[\d.]+" stroke="#a1a1aa" stroke-width="2"/g)].map(x => +x[2]); return m; }''')
    c.ok(st and max(st) > 170, 'a cable curl has the cable coming from a pulley down low (y %s)' % st)
    c.eq(p.evaluate('[PT.figure.demo("Barbell Curls").machine, PT.figure.demo("Barbell High-Bar Back Squat").machine, PT.figure.demo("Plank").machine]'), [None, None, None],
         'free weights, the squat rack and the floor keep the plain demo')

    # ---- in Step by step
    p.evaluate('() => { localStorage.removeItem("pt-sv-play"); PT.guideSteps.setPlay(true); app.openExerciseSheet("Lat Pulldown"); }'); p.wait_for_timeout(700)
    a = p.evaluate('() => decodeURIComponent((document.getElementById("pt-sv-anim") || {}).src || "")')
    c.ok('aria-label="Lat pulldown"' in a, 'the exercise sheet plays it on the machine')
    aud = p.evaluate(open(os.path.join(ROOT, 'tests', 'fixtures', 'design_audit.js'), encoding='utf-8').read())
    c.eq({k: aud['samples'][k][:3] for k, v in aud['counts'].items() if v}, {}, 'passes the design audit at 360px')
    c.eq(p.errors, [], 'no errors')

sys.exit(c.done())
