"""3.18.0 no broken elbows or knees: for every movement and kit an exercise is drawn with, in both pictures and in the in-between poses
of the moving drawing, an elbow or knee never bends backwards (side views; seen from the side an elbow bends with the forearm coming up
in front, a knee with the shin going back). A limb folded all the way (over 150 degrees) is left alone: from the side it can stand for an
elbow out to the side (hands behind the head, the end of a face pull)."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page

c = Checks('joints')
JS = r'''() => {
  const F = PT.figure, out = [], D = 180 / Math.PI, seen = new Set();
  const ang = (p, q) => Math.atan2(-(q[1] - p[1]), q[0] - p[0]) * D, norm = a => { while (a > 180) a -= 360; while (a <= -180) a += 360; return a; };
  const bend = (a, b, c) => norm(ang(b, c) - ang(a, b));
  let pairs = 0, poses = 0;
  EXERCISE_DATABASE.forEach(e => {
    const c = F.classify(e.name); if (!c) return; const id = c.draw || c.id, key = id + "|" + c.kit; if (seen.has(key)) return; seen.add(key);
    const pat = F.PATTERNS[id], lay = F.layout(id, c.kit), fr = lay.frames.map(f => f.j), ps = fr.slice(); pairs++;
    // lin movements (face pull) slide the elbow out to the side, which from the side is not a bend: only their two pictures count
    if (fr.length > 1 && !pat.hold && !pat.lin) for (let t = 1; t < 8; t++) ps.push(F.tween(fr[0], fr[1], t / 8));
    ps.forEach(j => {
      if (j.view !== "side") return; poses++; const s = j.mirror ? -1 : 1;
      [["shoulder", "elbow", "hand", s], ["shoulder", "elbow2", "hand2", s], ["hip", "knee", "ankle", -s], ["hip", "knee2", "ankle2", -s]].forEach(([a, b, cc, sg]) => {
        if (!j[a] || !j[b] || !j[cc]) return; const f = sg * bend(j[a], j[b], j[cc]);
        if (f < -12 && f > -149.5) out.push(`${e.name} (${id}, ${c.kit}): ${b} ${Math.round(f)}`);
      });
    });
  });
  return { out, pairs, poses };
}'''
with page(w=360, h=780) as p:
    p.wait_for_function('() => typeof EXERCISE_DATABASE !== "undefined" && EXERCISE_DATABASE.length > 3000 && typeof PT !== "undefined" && !!PT.figure', timeout=30000)
    r = p.evaluate(JS)
    c.ok(r['pairs'] > 300 and r['poses'] > 2000, 'checked %d movement and kit pairs, %d side-view poses' % (r['pairs'], r['poses']))
    c.eq(r['out'][:8], [], 'no elbow or knee bends backwards (%d found)' % len(r['out']))
    # a few by name, the ones that looked broken before 3.18.0
    D = r'''(n) => { const c = PT.figure.classify(n), id = c.draw || c.id, j = PT.figure.layout(id, c.kit).frames[0].j, D = 180 / Math.PI;
      const ang = (p, q) => Math.atan2(-(q[1] - p[1]), q[0] - p[0]) * D, norm = a => { while (a > 180) a -= 360; while (a <= -180) a += 360; return a; };
      return Math.round((j.mirror ? -1 : 1) * norm(ang(j.elbow, j.hand) - ang(j.shoulder, j.elbow))); }'''
    for n in ('Push-Up', 'Mountain Climbers', 'Barbell Bench Press'):
        try: f = p.evaluate(D, n)
        except Exception as e: f = None
        c.ok(f is not None and f >= -6, '%s: the elbow at the start bends the right way or is straight (%s)' % (n, f))
    lg = p.evaluate(r'''() => { const L = PT.figure.layout("lunge", null), j = L.frames[1].j, D = 180 / Math.PI;
      const ang = (p, q) => Math.atan2(-(q[1] - p[1]), q[0] - p[0]) * D, norm = a => { while (a > 180) a -= 360; while (a <= -180) a += 360; return a; };
      return Math.round(-norm(ang(j.knee2, j.ankle2) - ang(j.hip, j.knee2))); }''')
    c.ok(lg > 45, 'the back knee of a lunge bends the right way at the bottom (%d)' % lg)
    cu = p.evaluate('''() => { const F = PT.figure, L = F.layout("spider_curl", "dumbbell"), a = L.frames[0].j, b = L.frames[1].j, D = 180 / Math.PI;
      const ang = (p, q) => Math.atan2(-(q[1] - p[1]), q[0] - p[0]) * D, norm = x => { while (x > 180) x -= 360; while (x <= -180) x += 360; return x; };
      return [0.25, 0.5, 0.75].map(t => { const j = F.tween(a, b, t); return Math.round(norm(ang(j.elbow, j.hand) - ang(j.shoulder, j.elbow))); }); }''')
    c.ok(all(x > 0 for x in cu), 'a curl folds the forearm forward all the way up, never back through a kink (%s)' % cu)
    c.eq(p.errors, [], 'no errors')

sys.exit(c.done())
