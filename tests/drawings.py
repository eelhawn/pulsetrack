"""3.8.0 drawings for (nearly) every exercise, made by the app: one line figure posed for a kind of movement, holding the right kit,
a start and a finish picture with the movement arrow. Exercises without guide pictures get them in Step by step (each step the start
or the finish), with the credit "made by the app", Add my photo and Move arrows as before. The app's matching rules are the same
ones tools/guides_data.py reads, so the app and the coverage report agree name by name. Nothing is downloaded.
3.9.0: PulseTrack's own exercises are looked up by exact name first (EXACT), many more movements (seated calf raise, Nordic, wall sit,
handstand push-up, stretches ...), kit limits per movement (a pushdown is always on a cable) and kit poses (a barbell lunge carries
the bar on the back, a bodyweight squat reaches forward)."""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import guides_data as G

c = Checks('drawings')
names, merged = G.app_names()
rules, rows = G.figure_rules(), G.exercise_rows()
py = {n: G.figure_of(n, rows.get(n, ''), rules) for n in names}
PNG = bytes.fromhex('89504e470d0a1a0a0000000d4948445200000001000000010806000000') + bytes.fromhex('1f15c4890000000d49444154789c6360f8cfc0f01f0005000201') + bytes.fromhex('5a4f0b8b0000000049454e44ae426082')

# what a few exercises should get: (name, movement, kit)
WANT = [('Bench Press', 'bench_press', 'barbell'), ('Incline Dumbbell Press', 'incline_press', 'dumbbell'), ('Decline Bench Press', 'decline_press', 'barbell'),
        ('Machine Chest Press', 'machine_chest_press', 'machine'), ('Push-Ups', 'push_up', 'none'), ('Chest Dips', 'dip', 'none'),
        ('Cable Crossover', 'cable_fly', 'cable'), ('Pec Deck', 'pec_deck', 'machine'), ('Dumbbell Flyes', 'fly_lying', 'dumbbell'),
        ('Overhead Press', 'overhead_press', 'barbell'), ('Seated Dumbbell Press', 'overhead_press_seated', 'dumbbell'), ('Lateral Raises', 'lateral_raise', 'dumbbell'),
        ('Cable Lateral Raises', 'lateral_raise', 'cable'), ('Face Pulls', 'face_pull', 'cable'), ('Upright Rows', 'upright_row', 'barbell'),
        ('Barbell Curl', 'curl', 'barbell'), ('Hammer Curls', 'curl', 'dumbbell'), ('Preacher Curls (Dumbbell)', 'preacher_curl', 'dumbbell'),
        ('Vertical Preacher Curls (Bar)', 'preacher_vertical', 'barbell'), ('Vertical Preacher Curls (Dumbbell)', 'preacher_vertical', 'dumbbell'),
        ('Rope Pushdown', 'pushdown', 'cable'), ('Overhead Triceps Extension', 'overhead_triceps', 'dumbbell'), ('Dumbbell Skull Crushers', 'skull_crusher', 'dumbbell'),
        ('Lat Pulldown', 'lat_pulldown', 'cable'), ('Pull-Ups', 'pull_up', 'none'), ('Seated Cable Row', 'seated_row', 'cable'), ('Inverted Rows', 'inverted_row', 'none'),
        ('Barbell Rows', 'bent_row', 'barbell'), ('Deadlift', 'deadlift', 'barbell'), ('Barbell Romanian Deadlift', 'rdl', 'barbell'), ('Hip Thrusts', 'hip_thrust', 'barbell'),
        ('Glute Bridges', 'glute_bridge', 'none'), ('Squat', 'squat', 'barbell'), ('Goblet Squat', 'goblet_squat', 'kettlebell'), ('Dumbbell Goblet Squat', 'goblet_squat', 'dumbbell'), ('Front Squat', 'front_squat', 'barbell'),
        ('Smith Machine Squat', 'squat', 'smith'), ('Leg Press', 'leg_press', 'machine'), ('Leg Extension', 'leg_extension', 'machine'), ('Leg Curls', 'leg_curl', 'machine'),
        ('Seated Leg Curls', 'leg_curl_seated', 'machine'), ('Bulgarian Split Squats', 'split_squat_rear', 'dumbbell'), ('Walking Lunges', 'lunge', 'dumbbell'),
        ('Hip Abductor Machine', 'hip_abduction_seated', 'machine'), ('Hip Adductor Machine', 'hip_adduction_seated', 'machine'), ('Glute Kickbacks', 'hip_extension', 'machine'),
        ('Standing Calf Raises', 'calf_raise', 'none'), ('Kettlebell Swing', 'swing', 'kettlebell'), ('Plank', 'plank', 'none'), ('Side Plank', 'side_plank', 'none'),
        ('Hanging Leg Raises', 'hanging_leg_raise', 'none'), ('Crunches', 'crunch', 'none'), ('Russian Twist', 'russian_twist', 'none'), ('Cable Crunches', 'cable_crunch', 'cable'),
        ('Ab Wheel Rollouts', 'ab_wheel', 'none'), ('Jump Rope', 'jump_rope', 'none'), ('Cable Rope Hammer Curl', 'curl', 'cable'), ('Box Jumps', 'jump', 'none'), ('Leg Swings', 'leg_swing', 'none'),
        ('Medicine Ball Slams', 'slam', 'ball'), ('Dumbbell Pullover', 'pullover', 'dumbbell'), ('Landmine Press', 'overhead_press', 'landmine'),
        ('Hand Gripper Squeezes', 'grip', 'none'), ('Lying Neck Extension', 'neck_extension', 'none'), ('Battle Ropes', 'battle_ropes', 'none'),   # 3.12.0: drawn now
        # 3.9.0: PulseTrack's own exercises, by exact name
        ('Wall Sit', 'wall_sit', 'none'), ('Seated Calf Raises', 'seated_calf_raise', 'machine'), ('V-Bar Pushdown', 'pushdown', 'cable'),
        ('Straight Bar Pushdown', 'pushdown', 'cable'), ('Cable Curls (Straight Bar)', 'curl', 'cable'), ('Nordic Hamstring Curls', 'nordic', 'none'),
        ('Handstand Push-Ups', 'handstand_pushup', 'none'), ('Pike Push-Ups', 'pike_pushup', 'none'), ('Dead Hangs', 'dead_hang', 'none'), ('Floor Press', 'floor_press', 'barbell'),
        ('Neck Crunches', 'neck_flexion', 'none'), ('Waiter Curls', 'curl', 'dumbbell'), ('Snatch-Grip Deadlift', 'deadlift', 'barbell'), ('Toes-to-Bar', 'hanging_leg_raise', 'none'),
        ('Incline Push-Ups', 'push_up_incline', 'none'), ('Decline Push-Ups', 'push_up_decline', 'none'), ('Knee Push-Ups', 'push_up_knee', 'none'),
        ('Concentration Curls', 'concentration_curl', 'dumbbell'), ('Incline Dumbbell Curls', 'incline_curl', 'dumbbell'), ('Chest-Supported Row', 'chest_supported_row', 'dumbbell'),
        ('Dumbbell Row', 'one_arm_row', 'dumbbell'), ('Reverse Hyperextensions', 'reverse_hyper', 'none'), ('Slider Leg Curls', 'supine_leg_curl', 'none'),
        ('Standing Leg Curls', 'standing_leg_curl', 'machine'), ('Cable Pull-Throughs', 'pull_through', 'cable'), ('Pallof Press', 'pallof', 'cable'),
        ('Hollow Body Hold (Time)', 'hollow_hold', 'none'), ('Child\'s Pose', 'child_pose', 'none'), ('Hamstring Stretch', 'toe_reach', 'none'),
        ('Standing Quad Stretch', 'quad_stretch', 'none'), ('Stairmaster', 'stairs', 'none'), ('SkiErg', 'straight_arm_pulldown', 'cable'), ('Jumping Jacks', 'jumping_jack', 'none'),
        ('Neutral-Grip (V-Bar) Lat Pulldown', 'lat_pulldown', 'cable'), ('Seated Overhead Dumbbell Extension', 'overhead_triceps_seated', 'dumbbell')]

with page(360, 780) as p:
    reqs = []
    p.on('request', lambda r: reqs.append(r.url))
    p.wait_for_function('() => EXERCISE_DATABASE.length > 3000 && typeof PT !== "undefined" && !!PT.figure', timeout=20000)
    p.evaluate('PT.guideSteps.setPlay(false)')   # 3.13.0: these checks are about each step's own picture and arrows; tests/moving.py checks the moving drawing
    ids = p.evaluate('Object.keys(PT.figure.PATTERNS)')
    c.ok(len(ids) >= 80, '%d kinds of movement' % len(ids))
    c.eq(sorted(G.figure_ids() ^ set(ids)), [], 'Python reads the same movement list as the app')

    # ---- every movement draws, start and finish, inside the picture
    bad = p.evaluate('''() => { const out = [];
      for (const id of Object.keys(PT.figure.PATTERNS)) { const P = PT.figure.PATTERNS[id];
        for (let f = 0; f < P.frames.length; f++) {
          const s = PT.figure.svg(id, f, P.kit);
          if (!s || /NaN|undefined|Infinity/.test(s)) { out.push(id + " " + f + ": bad numbers"); continue; }
          const doc = new DOMParser().parseFromString(s, "image/svg+xml");
          if (doc.querySelector("parsererror")) { out.push(id + " " + f + ": not valid SVG"); continue; }
          const host = document.createElement("div"); host.style.cssText = "position:absolute;left:0;top:0;width:320px;height:240px"; host.innerHTML = s; document.body.appendChild(host);
          const sv = host.querySelector("svg").getBoundingClientRect(), g = host.querySelector("g").getBoundingClientRect();
          if (g.left < sv.left - 2 || g.top < sv.top - 2 || g.right > sv.right + 2 || g.bottom > sv.bottom + 2 || Math.max(g.width, g.height) < 88) out.push(id + " " + f + ": outside or tiny " + [g.left, g.top, g.right, g.bottom].map(Math.round));
          host.remove();
        } }
      return out; }''')
    c.eq(bad, [], 'every movement draws both pictures, valid, inside the frame and not tiny')
    sizes = p.evaluate('() => Object.keys(PT.figure.PATTERNS).map(id => PT.figure.layout(id, PT.figure.PATTERNS[id].kit).s)')
    c.ok(min(sizes) > 0.55, 'figures are drawn at much the same size (smallest scale %.2f)' % min(sizes))
    kits = p.evaluate('''() => { const out = []; for (const k of ["barbell","dumbbell","kettlebell","cable","band","trx","smith","machine","ball","plate","landmine","none"])
      for (const id of ["bench_press","curl","lateral_raise","squat","bent_row"]) { const s = PT.figure.svg(id, 1, k); if (!s || /NaN/.test(s)) out.push(id + " " + k); } return out; }''')
    c.eq(kits, [], 'every kind of kit draws on side and front views')

    # ---- the app and the Python report agree, name by name
    js = p.evaluate('(names) => names.map(n => { const r = PT.figure.classify(n); return r ? r.id : null; })', names)
    diff = [(n, a, b) for n, a, b in zip(names, js, [py[n] for n in names]) if a != b]
    c.eq(diff[:5], [], 'the app and tools/guides_data.py give every exercise the same drawing')
    have = sum(1 for x in js if x)
    c.ok(have >= 0.97 * len(names), '%d of %d exercises the app shows get a drawing (%.1f%%)' % (have, len(names), 100.0 * have / len(names)))

    got = p.evaluate('(w) => w.map(([n]) => { const r = PT.figure.classify(n); return r ? [r.id, r.kit] : [null, null]; })', WANT)
    wrong = [(w[0], tuple(g), w[1:]) for w, g in zip(WANT, got) if tuple(g) != tuple(w[1:])]
    c.eq(wrong, [], 'spot checks: %d exercises get the right movement and kit' % len(WANT))
    c.eq(p.evaluate('(() => { const r = PT.figure.classify("My Cable Curl"); return r && [r.id, r.kit]; })()'), ['curl', 'cable'], 'a name of your own gets a drawing from its words too')

    # ---- 3.9.0: PulseTrack's own exercises
    own = G.exercise_rows(); own_names = [n for n in own if n in set(names)]
    ex = G.figure_exact()
    import re as _re
    pt_own = _re.findall(r'^\s*\{\s*name:\s*"((?:[^"\\]|\\.)*)"', open(os.path.join(ROOT, 'exercises.js'), encoding='utf-8').read(), _re.M)
    c.eq(sorted(k for k in ex if k not in {n.lower() for n in pt_own}), [], 'every exact name is one of PulseTrack\'s own exercises')
    drawn_own = p.evaluate('(n) => n.filter(x => PT.figure.classify(x)).length', pt_own)
    c.ok(drawn_own >= len(pt_own) - 20, '%d of PulseTrack\'s %d own exercises have a drawing' % (drawn_own, len(pt_own)))
    c.eq(p.evaluate('(() => { const r = PT.figure.classify("Squat (Bodyweight)"), b = PT.figure.classify("Bodyweight Squats"); return [r.id, r.kit, r.draw, b.draw]; })()'), ['squat', 'none', 'air_squat', 'air_squat'], 'a squat with no kit is drawn reaching forward, with no bar')
    on_back = p.evaluate("""() => { const L = PT.figure.layout("lunge", "barbell"), j = L.frames[0].j; return Math.hypot(j.grip[0] - j.shoulder[0], j.grip[1] - j.shoulder[1]); }""")
    c.ok(on_back < 20, 'a barbell lunge carries the bar on the back (%.0f px from the shoulder)' % on_back)
    hang = p.evaluate("""() => { const L = PT.figure.layout("squat", "dumbbell"), j = L.frames[1].j; return j.grip[1] - j.shoulder[1]; }""")
    c.ok(hang > 40, 'a dumbbell squat holds the weights at the sides (%.0f px below the shoulder)' % hang)
    fr = p.evaluate("""() => ["Nordic Hamstring Curls", "Bench Press", "Barbell Curls"].map(n => { const st = PT.figure.forSteps(n, [{ text: "Set up." }, { text: "Lower slowly." }]); return st[0].image.src !== st[1].image.src; })""")
    c.eq(fr, [True, True, False], 'a step starting "Lower" shows the finish when lowering is the movement (Nordic, bench press) and the start for a curl')
    rail = p.evaluate("""() => { const s = PT.figure.svg("squat", 0, "smith"); return s.indexOf('stroke-width="4"') < s.indexOf('fill="#e4e4e7"'); }""")
    c.ok(rail, 'the Smith machine rail is drawn behind the body')

    # ---- Step by step with the drawings
    p.evaluate('() => app.openExerciseSheet("Incline Bench Press")'); p.wait_for_timeout(400)
    tips = p.evaluate('() => PT.exCanon("Incline Bench Press").tips')
    s = p.evaluate('() => { const s = document.getElementById("ex-steps"); return { open: s.open, sum: s.querySelector("summary").innerText }; }')
    c.ok(s['open'] and ('%d steps' % len(tips)) in s['sum'] and 'no pictures' not in s['sum'], 'an exercise without a guide: Step by step opens with pictures')
    seen, ok_all, frames = [], True, []
    for i in range(len(tips)):
        t = p.evaluate('''() => { const v = document.getElementById("pt-sv"), im = v.querySelector(".pt-sv-img"); return { src: im ? im.getAttribute("src") : "", w: im ? im.naturalWidth : 0,
          text: v.innerText, arrows: v.querySelectorAll(".pt-sv-a").length, add: !!v.querySelector("label[for=pt-sv-file]"), cr: (v.querySelector(".pt-sv-cr") || {}).textContent || "" }; }''')
        ok_all = ok_all and t['src'].startswith('data:image/svg+xml') and t['w'] > 0 and tips[i] in t['text'] and t['add'] and 'made by the app for this kind of movement (incline press)' in t['cr']
        frames.append(t['src']); seen.append(t['arrows'])
        if i < len(tips) - 1: p.click('#pt-sv [data-sv="next"]'); p.wait_for_timeout(120)
    c.ok(ok_all, 'every step: its tip, the drawing, the credit and Add my photo')
    c.ok(len(set(frames)) == 2 and frames[0] != frames[1], 'the first step shows the start, the next the finish')
    c.ok(seen[0] >= 1, 'the start picture has the movement arrow')
    p.click('#pt-sv [data-sv="edit"]'); p.wait_for_timeout(150)
    c.ok(p.evaluate('document.querySelectorAll("#pt-sv .pt-sv-h").length') >= 2, 'Move arrows works on a drawn picture')
    p.click('#pt-sv [data-sv="edit"]'); p.wait_for_timeout(100)
    p.set_input_files('#pt-sv-file', files=[{'name': 'me.png', 'mimeType': 'image/png', 'buffer': PNG}]); p.wait_for_timeout(800)
    c.ok(p.evaluate('!!document.querySelector("#pt-sv .pt-sv-photo")'), 'my photo replaces the drawing')
    p.click('#pt-sv [data-sv="rmphoto"]'); p.wait_for_timeout(400)
    c.ok(p.evaluate('() => (document.querySelector("#pt-sv .pt-sv-img") || {}).getAttribute && document.querySelector("#pt-sv .pt-sv-img").getAttribute("src").startsWith("data:image/svg+xml")'), 'Remove my photo brings the drawing back')

    # ---- the six guides keep their own drawings
    p.evaluate('() => { app.closeSheet(); app.openExerciseSheet("Squat"); }'); p.wait_for_timeout(400)
    c.ok(p.evaluate('document.querySelector("#pt-sv .pt-sv-img").getAttribute("src")').startswith('img/ex/squat-'), 'a hand-made guide keeps its own drawing')
    # ---- no tips and no guide: the movement's own two steps
    st = p.evaluate('() => PT.figure.forSteps("Leg Press", []).map(s => [s.text, !!s.image, s.image.generated])')
    c.ok(len(st) == 2 and all(x[1] and x[2] for x in st) and 'platform' in st[0][0], 'with no tips at all it still gives a start and a finish step')
    # ---- the guide points to the pictures
    r = p.evaluate('async () => { const r = await PT.guide.answer("how do I do an incline dumbbell press"); return r && (r.actions || []).map(a => a.label); }')
    c.ok(r and 'See the steps with pictures' in r, 'the guide offers "See the steps with pictures" for a drawn exercise (%s)' % r)

    p.evaluate('() => { app.closeSheet(); app.openExerciseSheet("Lateral Raises"); }'); p.wait_for_timeout(400)
    aud = p.evaluate(open(os.path.join(ROOT, 'tests', 'fixtures', 'design_audit.js'), encoding='utf-8').read())
    c.eq({k: aud['samples'][k][:3] for k, v in aud['counts'].items() if v}, {}, 'the exercise sheet with a drawing passes the design audit')
    c.ok(p.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'no sideways scroll at 360px')
    t0 = p.evaluate('() => { const n = EXERCISE_DATABASE.slice(0, 400).map(e => e.name), t = performance.now(); n.forEach(x => PT.figure.forSteps(x, [{ text: "a" }, { text: "b" }])); return performance.now() - t; }')
    c.ok(t0 < 4000, 'drawing 400 exercises takes %.0f ms' % t0)
    c.eq([u for u in reqs if not u.startswith(('http://localhost', 'http://127.0.0.1', 'data:', 'blob:'))], [], 'nothing is downloaded from another site')
    c.eq(p.errors, [], 'no errors')

sys.exit(c.done())
