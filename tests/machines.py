"""3.10.0 what the equipment looks like: every exercise sheet has an Equipment section with an original drawing (made by the app, no
photos or logos) of the machine, bench, rack, bar or cardio machine it uses, its name and how to spot it. Settings > Gyms & Equipment >
Machine notes for: LA Fitness adds a note on what that machine usually is there (also on by itself when the gym you train at is named
"LA Fitness"). "Add a photo of it at your gym" keeps your own photo on this phone, per machine, so it shows for every exercise on that
machine. Nothing is downloaded."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

c = Checks('machines')
PNG = bytes.fromhex('89504e470d0a1a0a0000000d4948445200000001000000010806000000') + bytes.fromhex('1f15c4890000000d49444154789c6360f8cfc0f01f0005000201') + bytes.fromhex('5a4f0b8b0000000049454e44ae426082')

# what a few exercises should show (first item, then the rest)
WANT = [('Bench Press', ['bench_station']), ('Incline Bench Press', ['incline_station']), ('Decline Bench Press', ['decline_station']),
        ('Dumbbell Bench Press', ['flat_bench', 'dumbbells']), ('Incline Dumbbell Press', ['adjustable_bench', 'dumbbells']),
        ('Machine Chest Press', ['chest_press_machine']), ('Hammer Strength Chest Press', ['plate_chest_press']), ('Hammer Strength Incline Press', ['plate_incline_press']),
        ('Pec Deck', ['pec_deck']), ('Reverse Pec Deck', ['pec_deck']), ('Cable Crossover', ['cable_crossover']), ('Chest Dips', ['dip_station']),
        ('Overhead Press', ['squat_rack', 'barbell']), ('Seated Dumbbell Press', ['adjustable_bench', 'dumbbells']), ('Machine Shoulder Press', ['shoulder_press_machine']),
        ('Machine Lateral Raise', ['lateral_raise_machine']), ('Face Pulls', ['cable_station']), ('EZ-Bar Curl', ['ez_bar']),
        ('Preacher Curls (Dumbbell)', ['preacher_bench', 'dumbbells']), ('Preacher Curl Machine', ['biceps_curl_machine']), ('Rope Pushdown', ['cable_station']),
        ('Skull Crushers', ['flat_bench', 'barbell']), ('Lat Pulldown', ['lat_pulldown_machine']), ('Pull-Ups', ['pullup_bar']), ('Assisted Pull-Up Machine', ['assisted_pullup']),
        ('Seated Cable Row', ['seated_row_cable']), ('Machine Row', ['row_machine']), ('Hammer Strength High Row', ['plate_high_row']), ('Iso-Lateral Low Row', ['plate_low_row']),
        ('T-Bar Row', ['landmine', 'barbell']), ('Chest-Supported T-Bar Row', ['plate_tbar_row']), ('Deadlift', ['barbell']), ('Squat', ['squat_rack', 'barbell']),
        ('Smith Machine Squat', ['smith_machine']), ('Hack Squat', ['plate_squat']), ('Leg Press', ['leg_press_45']), ('Leg Extension', ['leg_extension_machine']),
        ('Leg Curls', ['lying_leg_curl_machine']), ('Seated Leg Curls', ['seated_leg_curl_machine']), ('Hip Abductor Machine', ['hip_machine']),
        ('Seated Calf Raises', ['seated_calf_machine']), ('Leg Press Calf Raise', ['leg_press_45']), ('Bulgarian Split Squats', ['flat_bench', 'dumbbells']),
        ('Captain\'s Chair Knee Raise', ['captains_chair']), ('Hanging Leg Raises', ['pullup_bar']), ('Ab Crunch Machine', ['ab_crunch_machine']), ('Cable Crunches', ['cable_station']),
        ('Ab Wheel Rollouts', ['ab_wheel']), ('Back Extension', ['hyper_bench']), ('Kettlebell Swing', ['kettlebell']), ('Medicine Ball Slams', ['medicine_ball']),
        ('Landmine Press', ['landmine', 'barbell']), ('Incline Treadmill Walk', ['treadmill']), ('Stairmaster', ['stair_climber']), ('Elliptical', ['elliptical']),
        ('Stationary Bike', ['upright_bike']), ('Rowing Machine', ['rower']), ('SkiErg', ['skierg']), ('Box Jumps', ['box']), ('Plank', ['mat']), ('Push-Ups', ['mat']),
        ('Front Lever', ['pullup_bar']), ('Barbell Hack Squat', ['barbell']), ('Sled Push', ['sled']), ('Battle Ropes', ['battle_ropes'])]

with page(360, 780) as p:
    reqs = []
    p.on('request', lambda r: reqs.append(r.url))
    p.wait_for_function('() => EXERCISE_DATABASE.length > 3000 && typeof PT !== "undefined" && !!PT.equip', timeout=20000)
    ids = p.evaluate('Object.keys(PT.equip.EQUIP)')
    c.ok(len(ids) >= 70, '%d kinds of equipment drawn' % len(ids))
    # ---- every drawing is a valid picture that stays inside its frame, with a name, how to spot it and a group with an LA Fitness note
    bad = p.evaluate('''() => { const out = [], box = document.createElement("div"); box.style.cssText = "position:fixed;left:0;top:0;width:320px;height:240px"; document.body.appendChild(box);
      for (const id of Object.keys(PT.equip.EQUIP)) {
        const e = PT.equip.EQUIP[id], s = PT.equip.svg(id), doc = new DOMParser().parseFromString(s, "image/svg+xml");
        if (doc.querySelector("parsererror") || !/viewBox="0 0 320 240"/.test(s)) { out.push(id + ": not a valid picture"); continue; }
        if (!e.label || !e.look || e.look.length < 20 || !PT.equip.lafNote(id)) out.push(id + ": missing name, look or note");
        box.innerHTML = s; const r = box.querySelector("svg > g").getBoundingClientRect();
        if (r.left < 4 || r.top < 4 || r.right > 316 || r.bottom > 236 || Math.max(r.width, r.height) < 150) out.push(id + ": " + [r.left, r.top, r.right, r.bottom].map(Math.round));
        if (/<image|href=|https?:/.test(s.replace('xmlns="http://www.w3.org/2000/svg"', ""))) out.push(id + ": links something");
      }
      box.remove(); return out; }''')
    c.eq(bad, [], 'every equipment drawing is a valid picture, inside its frame, drawn by the app (no images or links)')
    # ---- every exercise in the app maps to equipment ("No equipment" for floor work)
    miss = p.evaluate('() => EXERCISE_DATABASE.filter(e => { const r = PT.equip.of(e.name); return !r || !r.items.length || r.items.some(x => !PT.equip.EQUIP[x]); }).map(e => e.name)')
    c.eq(miss[:10], [], 'all %d exercises show their equipment' % p.evaluate('EXERCISE_DATABASE.length'))
    got = p.evaluate('(w) => w.map(([n]) => { const r = PT.equip.of(n); return r ? r.items : null; })', WANT)
    wrong = [(n, g, w) for (n, w), g in zip(WANT, got) if g != w]
    c.eq(wrong, [], '%d exercises show the right equipment' % len(WANT))
    c.eq(p.evaluate('PT.equip.of("My Hammer Strength Chest Press").items'), ['plate_chest_press'], 'a machine name of your own gets its equipment from its words')
    # 3.10.1: Machine Bicep Curl is its own exercise (the seated bicep curl machine), found by "seated machine bicep curl"
    mb = p.evaluate('''() => { const e = EXERCISE_DATABASE.find(x => x.name === "Machine Bicep Curl"), pr = EXERCISE_DATABASE.find(x => x.name === "Machine Preacher Curls");
      const top = q => (EXERCISE_DATABASE.filter(x => PT.exMatch(x, q)).sort((a, b) => PT.exRank(a, q) - PT.exRank(b, q))[0] || {}).name;
      return e && [e.category, e.tips.length, (PT.equip.of(e.name) || {}).items, PT.figure.classify(e.name).id, top("seated machine bicep curl"), top("bicep curl machine"), (pr.aka || []).some(a => /bicep/i.test(a) && !/insignia/i.test(a))]; }''')
    c.eq(mb, ['Biceps', 4, ['biceps_curl_machine'], 'preacher_curl', 'Machine Bicep Curl', 'Machine Bicep Curl', False],
         'Machine Bicep Curl is in the exercise list, with tips, the biceps curl machine and a seated drawing; searching "seated machine bicep curl" finds it first')

    # ---- the Equipment section in the exercise sheet
    p.evaluate('() => app.openExerciseSheet("Leg Press")'); p.wait_for_timeout(500)
    s = p.evaluate('''() => { const d = document.getElementById("ex-equip"), st = document.getElementById("ex-steps"), im = d && d.querySelector(".pt-eq-img");
      return d && { open: d.open, before: !!st && !!(d.compareDocumentPosition(st) & Node.DOCUMENT_POSITION_FOLLOWING), svg: im && im.getAttribute("src").startsWith("data:image/svg+xml"),
        w: im && im.naturalWidth, alt: im && im.alt, text: d.innerText, laf: !!d.querySelector(".pt-eq-laf") }; }''')
    c.ok(s and s['open'] and s['before'], 'the exercise sheet opens with an Equipment section, above Step by step')
    c.ok(s and s['svg'] and s['w'] > 0 and 'leg press' in s['alt'].lower(), 'it shows the drawing of the 45° leg press (%s)' % (s and s['alt']))
    c.ok(s and '45° leg press' in s['text'] and 'foot plate' in s['text'] and 'not a photo of a real machine' in s['text'], 'with its name, how to spot it and the drawing credit')
    c.ok(s and not s['laf'] and 'Pick it in Settings' in s['text'], 'no LA Fitness note until you pick LA Fitness, and it says where to pick it')
    c.ok(p.evaluate('() => /with dumbbells/.test((app.closeSheet(), app.openExerciseSheet("Incline Dumbbell Press"), document.getElementById("ex-equip").innerText))'),
         'a bench exercise names the bench and says "with dumbbells"')

    # ---- Settings > Gyms & Equipment > Machine notes for: LA Fitness
    p.evaluate('() => { app.closeSheet(); app.openSettings(); document.querySelector("[data-acc=gyms]").open = true; }'); p.wait_for_timeout(300)
    c.ok(p.evaluate('!!document.querySelector("#pt-gym-box [data-gymchain=lafitness]") && document.querySelector("#pt-gym-box [data-gymchain=any]").getAttribute("aria-pressed") === "true"'),
         'Settings > Gyms & Equipment has Machine notes for: Any gym (on) / LA Fitness')
    p.click('#pt-gym-box [data-gymchain=lafitness]'); p.wait_for_timeout(200)
    c.eq(p.evaluate('app.settings.gymChain'), 'lafitness', 'picking LA Fitness is saved')
    p.evaluate('() => { document.getElementById("modal-settings").classList.add("hidden"); app.openExerciseSheet("Hammer Strength High Row"); }'); p.wait_for_timeout(500)
    t = p.evaluate('(document.querySelector("#ex-equip .pt-eq-laf") || {}).innerText || ""')
    c.ok('At LA Fitness:' in t and 'Hammer Strength' in t and 'Clubs differ' in t, 'a plate-loaded machine gets the LA Fitness note (%s)' % t[:60])
    t = p.evaluate('() => { app.closeSheet(); app.openExerciseSheet("Machine Shoulder Press"); return (document.querySelector("#ex-equip .pt-eq-laf") || {}).innerText || ""; }')
    c.ok('Life Fitness, Matrix or Star Trac' in t, 'a pin-loaded machine gets its own note')
    t = p.evaluate('() => { app.closeSheet(); app.openExerciseSheet("Rowing Machine"); return (document.querySelector("#ex-equip .pt-eq-laf") || {}).innerText || ""; }')
    c.ok('Concept2' in t, 'the rower note names Concept2')
    p.evaluate('() => { app.settings.gymChain = "any"; app.closeSheet(); app.openExerciseSheet("Rowing Machine"); }'); p.wait_for_timeout(300)
    c.ok(p.evaluate('!document.querySelector("#ex-equip .pt-eq-laf")'), 'Any gym turns the note off')
    on = p.evaluate('''() => { const s = app.settings, keep = [s.gyms, s.gymId, s.gymChain];
      s.gyms = [{ id: "g1", name: "LA Fitness Downtown" }]; s.gymId = "g1"; delete s.gymChain; const a = PT.equip.chain(app);
      s.gymChain = "any"; const b = PT.equip.chain(app); [s.gyms, s.gymId, s.gymChain] = keep; if (keep[0] === undefined) delete s.gyms; return [a, b]; }''')
    c.eq(on, ['lafitness', ''], 'before you choose, a gym named "LA Fitness" turns the notes on; choosing Any gym wins')

    # ---- your own photo of the machine, shared by every exercise on it
    p.evaluate('() => { app.closeSheet(); app.openExerciseSheet("Leg Press"); }'); p.wait_for_timeout(400)
    p.set_input_files('#pt-eq-file', files=[{'name': 'press.png', 'mimeType': 'image/png', 'buffer': PNG}]); p.wait_for_timeout(900)
    ph = p.evaluate('(app.settings.equipPhotos || {}).leg_press_45 || ""')
    c.ok(ph.startswith('q'), 'the photo is saved for the 45° leg press (%s)' % ph)
    c.ok(p.evaluate('!!document.querySelector("#pt-eq .pt-eq-photo") && document.querySelector("#pt-eq .pt-eq-photo").src.startsWith("blob:")'), 'your photo replaces the drawing')
    rec = p.evaluate('async (id) => { const r = await PT.guideSteps.db.get(id); return r && [r.equip, r.blob.type, r.license, r.author]; }', ph)
    c.eq(rec, ['leg_press_45', 'image/jpeg', 'own-photo', 'you'], 'it is kept on this phone as a small JPEG, marked as your own photo')
    p.evaluate('() => { app.closeSheet(); app.openExerciseSheet("Leg Press Calf Raise"); }'); p.wait_for_timeout(500)
    c.ok(p.evaluate('!!document.querySelector("#pt-eq .pt-eq-photo")'), 'another exercise on the same machine shows your photo too')
    p.click('#pt-eq [data-eq=drawing]'); p.wait_for_timeout(300)
    c.ok(p.evaluate('document.querySelector("#pt-eq .pt-eq-img").getAttribute("src").startsWith("data:image/svg+xml")'), 'Drawing shows the drawing again')
    p.click('#pt-eq [data-eq=rm]'); p.wait_for_timeout(500)
    c.ok(p.evaluate('!(app.settings.equipPhotos || {}).leg_press_45 && !document.querySelector("#pt-eq .pt-eq-photo")'), 'Remove my photo takes it off')
    c.ok(p.evaluate('async (id) => !(await PT.guideSteps.db.get(id))', ph), 'and deletes it from the phone')

    # ---- 3.13.0: the name on the machine at your gym
    p.evaluate('() => { app.closeSheet(); app.openExerciseSheet("Leg Press"); }'); p.wait_for_timeout(400)
    p.click('#pt-eq [data-eq=name]'); p.wait_for_timeout(200)
    c.ok(p.evaluate('document.activeElement && document.activeElement.id === "pt-eq-nm" && parseFloat(getComputedStyle(document.activeElement).fontSize) >= 16'), 'Add the name on the machine opens a box (16px, so an iPhone does not zoom)')
    p.fill('#pt-eq-nm', '  Hammer Strength   Iso-Lateral Leg Press '); p.press('#pt-eq-nm', 'Enter'); p.wait_for_timeout(300)
    c.eq(p.evaluate('app.settings.equipNames'), {'leg_press_45': 'Hammer Strength Iso-Lateral Leg Press'}, 'Enter saves it, tidied, for that machine')
    t = p.evaluate('document.getElementById("ex-equip").innerText')
    c.ok('On the machine: Hammer Strength Iso-Lateral Leg Press' in t and p.evaluate('document.querySelector("#ex-equip .pt-mw-s").textContent') == 'Hammer Strength Iso-Lateral Leg Press', 'it shows under the drawing and in the section title')
    p.evaluate('() => { app.closeSheet(); app.openExerciseSheet("Leg Press Calf Raise"); }'); p.wait_for_timeout(400)
    c.ok('Hammer Strength Iso-Lateral Leg Press' in p.evaluate('document.getElementById("ex-equip").innerText'), 'every exercise on that machine shows it')
    found = p.evaluate('() => EXERCISE_DATABASE.filter(e => PT.exMatch(e, "iso-lateral leg")).map(e => e.name)')
    c.ok('Leg Press' in found and 'Leg Press Calf Raises' in found and 'Squat' not in found, 'searching for the name finds the exercises on that machine (%d)' % len(found))
    p.click('#pt-eq [data-eq=name]'); p.wait_for_timeout(200); p.click('#pt-eq [data-eq=nameclear]'); p.wait_for_timeout(300)
    c.ok(not p.evaluate('app.settings.equipNames.leg_press_45') and 'On the machine' not in p.evaluate('document.getElementById("ex-equip").innerText'), 'Remove the name takes it off')

    # ---- the guide knows, and it all fits a small phone
    c.ok(p.evaluate('PT.guide.help().some(h => (h.id || h[0]) === "equippics" || JSON.stringify(h).includes("equippics"))'), 'the guide has a help entry for machine pictures')
    p.evaluate('() => { app.closeSheet(); app.settings.gymChain = "lafitness"; app.openExerciseSheet("Hammer Strength Chest Press"); }'); p.wait_for_timeout(400)
    aud = p.evaluate(open(os.path.join(ROOT, 'tests', 'fixtures', 'design_audit.js'), encoding='utf-8').read())
    c.eq({k: aud['samples'][k][:3] for k, v in aud['counts'].items() if v}, {}, 'the exercise sheet with the Equipment section passes the design audit')
    c.ok(p.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'no sideways scroll at 360px')
    t0 = p.evaluate('() => { const t = performance.now(); EXERCISE_DATABASE.slice(0, 600).forEach(e => PT.equip.of(e.name)); return performance.now() - t; }')
    c.ok(t0 < 3000, 'matching 600 exercises takes %.0f ms' % t0)
    c.eq([u for u in reqs if not u.startswith(('http://localhost', 'http://127.0.0.1', 'data:', 'blob:'))], [], 'nothing is downloaded from another site')
    c.eq(p.errors, [], 'no errors')

sys.exit(c.done())
