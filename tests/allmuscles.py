"""3.12.0 muscles worked for every exercise, and clearer drawings.
Muscles: every exercise in the app has its main and helping muscles (PT.musclesOf: from the kind of movement, words in the name and the
exercise's main muscle; stretches list the muscles they stretch), shown in "Muscles worked" with the body figure and marked as an estimate.
Drawings: every exercise has one; the figure is a body (tapered limbs, a torso, a face, hands and shoes, outlined), the worked muscles
are filled in the theme's colour, and the pictures say Start / Halfway / Hold."""
import os, sys, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

c = Checks('allmuscles')
# exercise -> muscles that must be among the main ones
SPOT = [('Bench Press', ['chest']), ('Close-Grip Bench Press', ['triceps']), ('Incline Dumbbell Press', ['upper_chest']), ('Push-Ups', ['chest']),
        ('Overhead Press', ['front_delts']), ('Lateral Raises', ['side_delts']), ('Face Pulls', ['rear_delts']), ('Barbell Shrugs', ['traps']),
        ('Barbell Curls', ['biceps']), ('Hammer Curls', ['brachialis']), ('Rope Pushdown', ['triceps']), ('Skull Crushers', ['triceps']),
        ('Pull-Ups', ['lats']), ('Chin-Ups', ['lats', 'biceps']), ('Seated Cable Row', ['mid_back']), ('Barbell Row', ['mid_back', 'lats']),
        ('Deadlift', ['glutes', 'hamstrings', 'lower_back']), ('Romanian Deadlift (RDL)', ['hamstrings']), ('Sumo Deadlift', ['adductors']),
        ('Squat', ['quads', 'glutes']), ('Leg Press', ['quads']), ('Leg Extension', ['quads']), ('Leg Curls', ['hamstrings']), ('Hip Thrusts', ['glutes']),
        ('Hip Abductor Machine', ['glute_med']), ('Hip Adductor Machine', ['adductors']), ('Standing Calf Raises', ['calves']), ('Tibialis Raises', ['tibialis']),
        ('Crunches', ['abs']), ('Bicycle Crunches', ['obliques']), ('Side Plank', ['obliques']), ('Hanging Leg Raises', ['abs']), ('Back Extensions', ['lower_back']),
        ('Farmer\'s Walk', ['forearm_flexors']), ('Suitcase Carry', ['obliques']), ('Reverse Wrist Curls', ['forearm_extensors']), ('Neck Crunches', ['neck']),
        ('Battle Ropes', ['front_delts']), ('Swimming', ['lats']), ('Sled Push', ['quads']), ('Rowing Machine', ['lats', 'quads']), ('Machine Bicep Curl', ['biceps'])]
# the exercises that had no drawing before 3.12.0, and what they get now
NEWLY = [('Hand Gripper Squeezes', 'grip'), ('Plate Pinches (Time)', 'carry'), ('Dumbbell Pronation and Supination', 'wrist_curl'), ('Ab Coaster Machine', 'knee_tuck'),
         ('Sled Push', 'sled_push'), ('Sled Pull', 'sled_pull'), ('Battle Ropes', 'battle_ropes'), ('Swimming', 'swim'), ('Shadow Boxing', 'boxing'), ('Heavy Bag Work', 'bag_work'),
         ('Crucifix Extension', 'crucifix'), ('Dumbbell Kick Outs', 'kickback'), ('Prone Around The World', 'superman'), ('90/90 Hip Switches', 'pigeon'), ('Bottoms Up', 'leg_raise'),
         ('Triceps Rockers', 'skull_crusher'), ('Neck Crunches', 'neck_flexion'), ('Neck Crunches with Plate', 'neck_flexion'), ('Lying Neck Extension', 'neck_extension'),
         ('Weighted Lying Side Neck Raise', 'neck_side'), ('Battling Ropes Russian Twist', 'russian_twist'), ('Jack Press', 'jumping_jack'), ('Lying Ab Press', 'dead_bug'),
         ('Sitting Scapular Adduction', 'reverse_fly'), ('Body Extension', 'reverse_nordic'), ('Arm Raise Step In Place', 'walk')]

with page(360, 780) as p:
    reqs = []
    p.on('request', lambda r: reqs.append(r.url))
    p.wait_for_function('() => EXERCISE_DATABASE.length > 3000 && typeof PT !== "undefined" && !!PT.musclesOf && !!PT.figure', timeout=20000)
    n_all = p.evaluate('EXERCISE_DATABASE.length')

    # ---- muscles for every exercise
    bad = p.evaluate('''() => { const ids = new Set(PT.MUSCLES.map(m => m[0])), MAIN = PT.musclesOf.MAIN, out = [];
      for (const e of EXERCISE_DATABASE) { const r = PT.musclesOf(e.name);
        if (!r || !r.muscles.length) { out.push(e.name + ": none"); continue; }
        const P = r.muscles.filter(m => m.role === "primary");
        if (!P.length) out.push(e.name + ": no main muscle");
        if (r.muscles.some(m => !ids.has(m.muscle_id) || !(m.intensity >= 1 && m.intensity <= 100))) out.push(e.name + ": bad muscle");
        const want = MAIN[e.muscle] && MAIN[e.muscle][1];
        if (r.kind === "worked" && want && !want.split(" ").some(w => P.some(m => m.muscle_id === w))) out.push(e.name + ": main muscle " + e.muscle + " missing");
      } return out; }''')
    c.eq(bad[:10], [], 'all %d exercises have their muscles, with a main one that matches the exercise list' % n_all)
    got = p.evaluate('(w) => w.map(([n]) => { const r = PT.musclesOf(n); return r ? r.muscles.filter(m => m.role === "primary").map(m => m.muscle_id) : []; })', SPOT)
    wrong = [(n, g) for (n, want), g in zip(SPOT, got) if not all(x in g for x in want)]
    c.eq(wrong, [], '%d exercises have the right main muscles' % len(SPOT))
    k = p.evaluate('() => ["Calf Stretch", "Hamstring Stretch", "Lower Body Foam Rolling", "Bench Press"].map(n => PT.musclesOf(n).kind)')
    c.eq(k, ['stretched', 'stretched', 'rolled', 'worked'], 'stretches list the muscles they stretch, foam rolling the ones it works on')
    c.ok(p.evaluate('PT.musclesOf("Bench Press").muscles.some(m => m.muscle_id === "triceps" && m.role === "secondary")'), 'helping muscles too (bench press: triceps)')
    c.ok(p.evaluate('(() => { const r = PT.musclesOf("My Hammer Strength Chest Press"); return !!r && r.muscles[0].muscle_id === "chest"; })()'), 'an exercise of your own gets muscles from its name')

    # ---- the section in the exercise sheet
    p.evaluate('() => app.openExerciseSheet("Hammer Curls")'); p.wait_for_timeout(400)
    s = p.evaluate('''() => { const d = document.getElementById("ex-muscles"); return { open: d.open, text: d.innerText, sum: d.querySelector("summary").innerText,
        fig: !!d.querySelector(".pt-mw-fig svg"), lit: [...d.querySelectorAll(".mm-r")].filter(x => x.getAttribute("fill") !== PT.muscleFill(0)).length }; }''')
    c.ok(s['open'] and 'Muscles worked' in s['sum'] and 'Brachialis' in s['sum'] and s['fig'] and s['lit'] >= 4, 'Hammer Curls: Muscles worked, open, with the figure lit up (%d muscle shapes)' % s['lit'])
    c.ok('Main muscles' in s['text'] and 'Helping muscles' in s['text'] and 'Estimated from how the movement works' in s['text'], 'main and helping muscles, marked as an estimate')
    c.ok('est.' not in s['text'], 'no "est." on every chip when the whole list is an estimate')
    p.click('#ex-muscles [data-mw="brachialis"]'); p.wait_for_timeout(150)
    c.ok('a main muscle' in p.evaluate('document.getElementById("pt-mw-tap").innerText'), 'tapping a muscle names it')
    p.evaluate('() => { app.closeSheet(); app.openExerciseSheet("Calf Stretch"); }'); p.wait_for_timeout(400)
    t = p.evaluate('document.getElementById("ex-muscles").innerText')
    c.ok('Muscles stretched' in t and 'Stretched most' in t and 'Calves' in t and 'Not stretched' in t, 'a stretch says Muscles stretched')
    c.eq(p.evaluate('document.querySelectorAll("#ex-muscles").length'), 1, 'one section')

    # ---- drawings for every exercise
    nodraw = p.evaluate('() => EXERCISE_DATABASE.filter(e => !PT.figure.classify(e.name)).map(e => e.name)')
    c.eq(nodraw[:10], [], 'all %d exercises have a drawing' % n_all)
    got = p.evaluate('(w) => w.map(([n]) => { const c = PT.figure.classify(n); return c ? (c.draw || c.id) : null; })', NEWLY)
    c.eq([(n, g, w) for (n, w), g in zip(NEWLY, got) if g != w], [], 'the %d exercises that had no drawing get the right one' % len(NEWLY))
    bad = p.evaluate('''() => { const out = [], box = document.createElement("div"); box.style.cssText = "position:fixed;left:0;top:0;width:320px;height:240px"; document.body.appendChild(box);
      for (const id of Object.keys(PT.figure.PATTERNS)) { const pat = PT.figure.PATTERNS[id];
        const kits = [...new Set([pat.kit || "none"].concat(Array.isArray(pat.kits) ? pat.kits : []))];
        for (const kit of kits) for (let f = 0; f < pat.frames.length; f++) {
          const s = PT.figure.svg(id, f, kit, { hi: { chest: 100, quads: 100, armF: 100, delts: 60 } });
          if (new DOMParser().parseFromString(s, "image/svg+xml").querySelector("parsererror")) { out.push(id + "/" + kit + ": not valid"); continue; }
          if (/<image|href=|https?:\\/\\/(?!www\\.w3\\.org)/.test(s)) out.push(id + "/" + kit + ": links something");
          box.innerHTML = s; const r = box.querySelector("svg > g").getBoundingClientRect();
          if (r.left < 2 || r.top < 2 || r.right > 318 || r.bottom > 238) out.push(id + "/" + kit + "/" + f + ": outside " + [r.left, r.top, r.right, r.bottom].map(Math.round));
          const body = box.querySelectorAll('polygon[fill="#e4e4e7"][stroke="#18181b"], path[fill="#e4e4e7"][stroke="#18181b"]').length;
          if (body < 8) out.push(id + "/" + kit + ": figure has " + body + " outlined parts");
        } }
      box.remove(); return out; }''')
    c.eq(bad[:10], [], 'every movement with every kit draws a valid, outlined figure inside its frame')
    lab = p.evaluate('''() => { const t = s => (s.match(/<text[^>]*>([^<]*)<\\/text>/) || [])[1] || "";
      return [t(PT.figure.svg("bench_press", 0, "barbell")), t(PT.figure.svg("bench_press", 1, "barbell")), t(PT.figure.svg("plank", 0, "none")), t(PT.figure.svg("run", 0, "none"))]; }''')
    c.eq(lab, ['Start', 'Halfway', 'Hold', ''], 'the pictures say Start, Halfway (then back) or Hold; running says nothing')
    c.ok(p.evaluate('(() => { const s = PT.figure.svg("curl", 0, "dumbbell"); return /<circle[^>]*r="1.7"[^>]*fill="#18181b"/.test(s); })()'), 'the head has an eye, so you can see which way the figure faces')
    hi = p.evaluate('() => [PT.figure.hiOf("Barbell Curls").armF, PT.figure.hiOf("Bench Press").chest, PT.figure.hiOf("Calf Stretch").shinB, PT.figure.hiOf("Squat").thighF]')
    c.eq(hi, [100, 100, 100, 100], 'the worked muscles are filled on the drawing (curl: upper arm, bench: chest, calf stretch: calf, squat: thigh)')
    col = p.evaluate('''() => { const m = String(PT.muscleFill(100)).match(/\\d+/g).slice(0, 3).map(Number), hex = "#" + m.map(v => v.toString(16).padStart(2, "0")).join("");
      const st = PT.figure.forSteps("Bench Press", [{ text: "Set up." }, { text: "Lower it." }]); return [hex, decodeURIComponent(st[0].image.src).includes(hex), decodeURIComponent(st[1].image.src).includes(hex)]; }''')
    c.ok(col[1] and col[2], "Step by step pictures fill the muscles in the theme's colour (%s)" % col[0])
    pos = p.evaluate('''() => { const L = id => PT.figure.layout(id, PT.figure.PATTERNS[id].kit || "none").frames;
      const dl = L("deadlift")[0].j, cs = L("calf_stretch")[0].j, qs = L("quad_stretch")[0].j, ur = PT.figure.layout("upright_row", "barbell").frames[1].j;
      return [dl.hip[1] < dl.knee[1], cs.ankle[0] < cs.ankle2[0], qs.ankle[1] < qs.ankle2[1] - 40, ur.elR[1] < ur.haR[1]]; }''')
    c.eq(pos, [True, True, True, True], 'deadlift starts with the hips above the knees; stretches show the stretched leg in front; upright row lifts the elbows above the hands')

    # ---- the guide, the screen, nothing downloaded
    a = p.evaluate('async () => { const r = await PT.guide.answer("how do I do hammer curls", PT.guide.context()); return r.text || ""; }')
    c.ok('brachialis' in a.lower() and 'biceps' in a.lower(), 'the guide says which muscles an exercise works (%s)' % a[:60])
    p.evaluate('() => { app.closeSheet(); app.openExerciseSheet("Incline Dumbbell Press"); }'); p.wait_for_timeout(500)
    aud = p.evaluate(open(os.path.join(ROOT, 'tests', 'fixtures', 'design_audit.js'), encoding='utf-8').read())
    c.eq({k: aud['samples'][k][:3] for k, v in aud['counts'].items() if v}, {}, 'the exercise sheet passes the design audit at 360px')
    c.ok(p.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'no sideways scroll')
    c.eq([u for u in reqs if not u.startswith(('http://localhost', 'http://127.0.0.1', 'data:', 'blob:'))], [], 'nothing is downloaded')
    c.eq(p.errors, [], 'no errors')

sys.exit(c.done())
