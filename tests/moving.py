"""3.13.0 moving drawings: Step by step plays a drawn exercise's move, from Start to Halfway and back, in a loop (poses in between, every
bone keeps its length). Pause shows the step's own picture with its arrows; the choice is kept on the phone; a phone that asks for
less motion starts paused. Exercises with their own pictures (the built-in guides) and held positions don't move."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

c = Checks('moving')
SRCS = '''async () => { const seen = new Set(); for (let i = 0; i < 16; i++) { const im = document.getElementById("pt-sv-anim"); if (im) seen.add(im.getAttribute("src")); await new Promise(r => setTimeout(r, 90)); } return seen.size; }'''

with page(360, 780) as p:
    p.wait_for_function('() => typeof PT !== "undefined" && !!PT.figure && !!PT.figure.motion && !!PT.guideSteps', timeout=20000)
    # ---- the poses in between
    fr = p.evaluate('() => (PT.figure.motion("Barbell Curls") || []).length')
    c.eq(fr, 9, 'a curl gets 9 pictures from Start to Halfway')
    c.ok(p.evaluate('(() => { const f = PT.figure.motion("Barbell Curls"); return new Set(f).size === f.length; })()'), 'all different')
    ln = p.evaluate('''() => { const L = PT.figure.layout("curl", "barbell"), a = L.frames[0].j, b = L.frames[1].j, d = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
      return [0.25, 0.5, 0.75].map(t => { const j = PT.figure.tween(a, b, t); return [d(j.shoulder, j.elbow) - d(a.shoulder, a.elbow), d(j.elbow, j.hand) - d(a.elbow, a.hand)].map(v => Math.abs(v) < 0.6); }).flat(); }''')
    c.ok(all(ln), 'in between, the upper arm and forearm keep their length (the elbow bends, the arm does not shrink)')
    gr = p.evaluate('''() => { const L = PT.figure.layout("curl", "barbell"), j = PT.figure.tween(L.frames[0].j, L.frames[1].j, 0.5); return Math.hypot(j.grip[0] - j.hand[0], j.grip[1] - j.hand[1]); }''')
    c.ok(gr < 12, 'the bar stays in the hands halfway through (%.1f px)' % gr)
    c.eq(p.evaluate('() => [PT.figure.motion("Plank"), PT.figure.motion("Bench Press"), PT.figure.motion("Treadmill")]'), [None, None, None],
         'a held position, a running machine and an exercise with its own pictures (bench press) do not move')

    # ---- in Step by step
    p.evaluate('() => app.openExerciseSheet("Barbell Curls")'); p.wait_for_timeout(500)
    s = p.evaluate('''() => { const b = document.querySelector("#pt-sv [data-sv=play]"); return { btn: !!b, on: b && b.getAttribute("aria-pressed"), label: b && b.textContent.trim(),
        anim: !!document.getElementById("pt-sv-anim"), arrows: document.querySelectorAll("#pt-sv .pt-sv-a").length }; }''')
    c.ok(s['btn'] and s['on'] == 'true' and 'Pause' in s['label'] and s['anim'], 'a drawn exercise opens playing its move, with a Pause button')
    c.eq(s['arrows'], 0, 'no arrows over the moving picture')
    n = p.evaluate(SRCS)
    c.ok(n >= 4, 'the picture moves (%d different pictures in 1.4 s)' % n)
    p.click('#pt-sv [data-sv=next]'); p.wait_for_timeout(200)
    c.ok(p.evaluate('!!document.getElementById("pt-sv-anim")'), 'it keeps playing on the next step')
    p.click('#pt-sv [data-sv=play]'); p.wait_for_timeout(250)
    s = p.evaluate('''() => ({ anim: !!document.getElementById("pt-sv-anim"), img: (document.querySelector("#pt-sv .pt-sv-img") || {}).getAttribute ? document.querySelector("#pt-sv .pt-sv-img").getAttribute("src").slice(0, 26) : "",
        arrows: document.querySelectorAll("#pt-sv .pt-sv-a").length, label: document.querySelector("#pt-sv [data-sv=play]").textContent.trim(), store: localStorage.getItem("pt-sv-play"),
        focus: document.activeElement && document.activeElement.dataset.sv }) ''')
    c.ok(not s['anim'] and s['img'].startswith('data:image/svg+xml') and s['arrows'] >= 1 and 'Play the move' in s['label'], 'Pause shows the step\'s picture with its arrows, and Play the move')
    c.ok(s['store'] == '0' and s['focus'] == 'play', 'paused is kept on this phone, and focus stays on the button')
    p.evaluate('() => { app.closeSheet(); app.openExerciseSheet("Lateral Raises"); }'); p.wait_for_timeout(400)
    c.ok(not p.evaluate('!!document.getElementById("pt-sv-anim")') and p.evaluate('!!document.querySelector("#pt-sv [data-sv=play]")'), 'another exercise opens paused too, with Play the move')
    p.click('#pt-sv [data-sv=play]'); p.wait_for_timeout(200)
    c.ok(p.evaluate('!!document.getElementById("pt-sv-anim")') and p.evaluate('localStorage.getItem("pt-sv-play")') == '1', 'Play the move starts it again')
    p.click('#pt-sv [data-sv=edit]'); p.wait_for_timeout(200)
    c.ok(not p.evaluate('!!document.getElementById("pt-sv-anim")') and p.evaluate('document.querySelectorAll("#pt-sv .pt-sv-h").length') >= 2, 'Move arrows stops it to show the arrows to drag')
    p.click('#pt-sv [data-sv=edit]'); p.wait_for_timeout(200)
    p.evaluate('() => { app.closeSheet(); app.openExerciseSheet("Bench Press"); }'); p.wait_for_timeout(400)
    c.ok(p.evaluate('!!document.querySelector("#pt-sv [data-sv=play]")'), 'since 3.19.0 an exercise with its own pictures has a Play button too (tests/demos.py)')

    # ---- a phone that asks for less motion
    p.evaluate('() => { app.closeSheet(); localStorage.removeItem("pt-sv-play"); }')
    p.emulate_media(reduced_motion='reduce'); p.reload()
    p.wait_for_function('() => typeof PT !== "undefined" && !!PT.guideSteps && window.app && app.data', timeout=20000)
    p.evaluate('() => app.openExerciseSheet("Barbell Curls")'); p.wait_for_timeout(500)
    c.ok(not p.evaluate('!!document.getElementById("pt-sv-anim")') and 'Play the move' in p.evaluate('document.querySelector("#pt-sv [data-sv=play]").textContent'),
         'with "reduce motion" on, it starts paused')
    p.emulate_media(reduced_motion='no-preference')

    aud = p.evaluate(open(os.path.join(ROOT, 'tests', 'fixtures', 'design_audit.js'), encoding='utf-8').read())
    c.eq({k: aud['samples'][k][:3] for k, v in aud['counts'].items() if v}, {}, 'the exercise sheet passes the design audit at 360px')
    c.eq(p.errors, [], 'no errors')

sys.exit(c.done())
