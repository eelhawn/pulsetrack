"""3.5.0 step by step: each sample exercise shows its steps one at a time with PulseTrack's own line drawing (licence and author shown),
the movement arrows drawn over it from the data, Back/Next. Every step of every exercise has "Add my photo"; exercises without a
guide show their form tips as steps with a placeholder. Your photos and moved arrows are kept on the phone over the built-in data
(photos in their own IndexedDB, cleared by Reset everything). The drawings work offline. Nothing is loaded from other sites."""
import io, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page
from PIL import Image

c = Checks('steps')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import guides_data as G
GUIDES = G.read_guides()
SAMPLES = ['Bench Press', 'Squat', 'Romanian Deadlift (RDL)', 'Lat Pulldown', 'Seated Cable Row', 'Push-Ups']
buf = io.BytesIO(); Image.new('RGB', (400, 300), (200, 60, 60)).save(buf, 'PNG'); PNG = buf.getvalue()

# ---- the data: local drawings with licence and author, arrows inside the picture
for n in SAMPLES:
    st = GUIDES[n].get('steps') or []
    c.ok(len(st) >= 2, '%s: has %d steps' % (n, len(st)))
    for i, s in enumerate(st, 1):
        im = s.get('image') or {}
        ok = (im.get('src', '').startswith('img/ex/') and os.path.isfile(os.path.join(ROOT, im['src'])) and im.get('license') == 'original'
              and im.get('author') == 'PulseTrack' and not re.match(r'https?:', im.get('src', '')))
        c.ok(ok, '%s step %d: a local drawing, licence original, author PulseTrack' % (n, i))
        c.ok(all(0 <= v <= 1 for a in s.get('arrows', []) for v in a['from'] + a['to']), '%s step %d: arrows are inside the picture' % (n, i))
    c.ok(any(s.get('arrows') for s in st), '%s: at least one step shows the movement with an arrow' % n)
for f in sorted(os.listdir(os.path.join(ROOT, 'img', 'ex'))):
    svg = open(os.path.join(ROOT, 'img', 'ex', f), encoding='utf-8').read()
    c.ok('viewBox="0 0 320 240"' in svg and '<script' not in svg and 'http://' not in svg.replace('http://www.w3.org/2000/svg', '') and 'https://' not in svg
         and 'PulseTrack, original work' in svg and '<line' in svg and 'marker' not in svg, 'img/ex/%s: a 4:3 original drawing, no arrows baked in, nothing from outside' % f)

with page(w=360, h=780) as p:
    p.wait_for_function('typeof EXERCISE_GUIDES !== "undefined" && !!PT.guideSteps')
    reqs = []
    p.on('request', lambda r: reqs.append(r.url))
    for n in SAMPLES:
        p.evaluate('(n) => { app.closeSheet && app.closeSheet(); app.openExerciseSheet(n); }', n); p.wait_for_timeout(350)
        g = GUIDES[n]['steps']
        st = p.evaluate('''() => { const s = document.getElementById("ex-steps"), im = s && s.querySelector(".pt-sv-img"); return s && { open: s.open, text: s.innerText,
            img: im ? [im.complete, im.naturalWidth] : null, arrows: s.querySelectorAll(".pt-sv-a").length, add: !!s.querySelector('label[for="pt-sv-file"]') }; }''')
        c.ok(st and st['open'], '%s: Step by step shows, open' % n)
        if not st: continue
        c.ok('Step 1 of %d' % len(g) in st['text'] and g[0]['text'] in st['text'], '%s: step 1 of %d with its words' % (n, len(g)))
        c.ok(st['img'] and st['img'][0] and st['img'][1] > 0, '%s: the drawing loads' % n)
        c.ok('Drawing: PulseTrack, original drawing' in st['text'], '%s: says whose picture it is and its licence' % n)
        c.ok(st['add'] and 'Add my photo' in st['text'], '%s: step 1 has Add my photo' % n)
        for i in range(1, len(g)):
            p.click('#pt-sv [data-sv="next"]'); p.wait_for_timeout(150)
            s2 = p.evaluate('''() => { const s = document.getElementById("pt-sv"); return { text: s.innerText, arrows: s.querySelectorAll(".pt-sv-a").length, labels: [...s.querySelectorAll(".pt-sv-a text")].map(t => t.textContent), add: !!s.querySelector('label[for="pt-sv-file"]') }; }''')
            c.ok('Step %d of %d' % (i + 1, len(g)) in s2['text'] and g[i]['text'] in s2['text'], '%s: Next goes to step %d' % (n, i + 1))
            c.eq(s2['arrows'], len(g[i]['arrows']), '%s step %d: %d arrows drawn over the picture' % (n, i + 1, len(g[i]['arrows'])))
            c.eq(s2['labels'], [a['label'] for a in g[i]['arrows']], '%s step %d: with their labels' % (n, i + 1))
            c.ok(s2['add'], '%s step %d: has Add my photo' % (n, i + 1))
        c.ok(p.evaluate('document.querySelector("#pt-sv [data-sv=next]").disabled'), '%s: Next stops at the last step' % n)
        p.click('#pt-sv [data-sv="prev"]'); p.wait_for_timeout(120)
        c.ok('Step %d of %d' % (len(g) - 1, len(g)) in p.evaluate('document.getElementById("pt-sv").innerText'), '%s: Back goes back' % n)
    c.eq([u for u in reqs if not u.startswith('http://localhost') and not u.startswith('http://127.0.0.1') and not u.startswith('data:') and not u.startswith('blob:')], [], 'no picture or anything else is loaded from another site')
    c.ok(p.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'no sideways scroll at 360px')

    # ---- an exercise without a guide: its tips as steps, a placeholder and Add my photo on every one
    p.evaluate('() => { app.closeSheet(); app.openExerciseSheet("Incline Bench Press"); }'); p.wait_for_timeout(300)
    tips = p.evaluate('() => PT.exCanon("Incline Bench Press").tips')
    s = p.evaluate('() => { const s = document.getElementById("ex-steps"); return { open: s.open, sum: s.querySelector("summary").innerText }; }')
    c.ok(not s['open'] and ('%d steps' % len(tips)) in s['sum'] and 'no pictures yet' in s['sum'], 'no guide: Step by step is folded and says it has no pictures yet')
    p.evaluate('() => document.getElementById("ex-steps").open = true')
    every = True
    for i in range(len(tips)):
        t = p.evaluate('document.getElementById("pt-sv").innerText')
        every = every and ('No picture yet' in t and 'Add my photo' in t and tips[i] in t)
        if i < len(tips) - 1: p.click('#pt-sv [data-sv="next"]'); p.wait_for_timeout(100)
    c.ok(every, 'no guide: every one of its %d steps has its tip, a placeholder and Add my photo' % len(tips))

    # ---- add my photo: shown instead of the placeholder, kept on the phone
    p.set_input_files('#pt-sv-file', files=[{'name': 'me.png', 'mimeType': 'image/png', 'buffer': PNG}]); p.wait_for_timeout(800)
    t = p.evaluate('() => { const im = document.querySelector("#pt-sv .pt-sv-photo"); return { src: im ? im.src : "", w: im ? im.naturalWidth : 0, text: document.getElementById("pt-sv").innerText }; }')
    c.ok(t['src'].startswith('blob:') and t['w'] > 0 and 'Your photo' in t['text'], 'no guide: my photo replaces the placeholder')
    c.ok(p.evaluate('() => !!(app.settings.exGuideLocal["Incline Bench Press"].photos[%d])' % (len(tips) - 1)), 'the photo is linked to that step on the phone')

    # ---- a sample: my photo on step 2, the arrows still on top, then move an arrow
    p.evaluate('() => { app.closeSheet(); app.openExerciseSheet("Lat Pulldown"); }'); p.wait_for_timeout(300)
    p.click('#pt-sv [data-sv="next"]'); p.wait_for_timeout(150)
    p.set_input_files('#pt-sv-file', files=[{'name': 'me.png', 'mimeType': 'image/png', 'buffer': PNG}]); p.wait_for_timeout(800)
    t = p.evaluate('() => { const s = document.getElementById("pt-sv"); return { photo: !!s.querySelector(".pt-sv-photo"), arrows: s.querySelectorAll(".pt-sv-a").length, text: s.innerText }; }')
    c.ok(t['photo'] and t['arrows'] == 2 and 'Remove my photo' in t['text'] and 'Change my photo' in t['text'], 'a sample step shows my photo with its arrows over it, and Change / Remove')
    c.ok(p.evaluate('EXERCISE_GUIDES["Lat Pulldown"].steps[1].image.src') == 'img/ex/lat-pulldown-2.svg', 'the built-in data is not changed by my photo')
    p.click('#pt-sv [data-sv="edit"]'); p.wait_for_timeout(150)
    c.eq(p.evaluate('document.querySelectorAll("#pt-sv .pt-sv-h").length'), 4, 'Move arrows shows a handle on each end')
    h = p.evaluate('() => { const r = document.querySelector(\'#pt-sv .pt-sv-h[data-a="0"][data-end="to"]\').getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }')
    box = p.evaluate('() => { const r = document.getElementById("pt-sv-box").getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; }')
    p.mouse.move(h[0], h[1]); p.mouse.down(); p.mouse.move(h[0] + 30, h[1] + 20, steps=4); p.mouse.move(box[0] + box[2] * .8, box[1] + box[3] * .6, steps=4); p.mouse.up(); p.wait_for_timeout(250)
    moved = p.evaluate('() => (app.settings.exGuideLocal["Lat Pulldown"].arrows || {})[1]')
    c.ok(moved and abs(moved[0]['to'][0] - .8) < .03 and abs(moved[0]['to'][1] - .6) < .03, 'dragging an end moves the arrow and keeps it on the phone (%s)' % (moved and moved[0]['to']))
    c.eq(p.evaluate('EXERCISE_GUIDES["Lat Pulldown"].steps[1].arrows[0].to'), [0.57, 0.32], 'the built-in arrow is not changed')

    # ---- after a reload (or an update): still there
    p.reload(); p.wait_for_function('typeof EXERCISE_GUIDES !== "undefined" && !!PT.guideSteps && window.app && app.data')
    p.evaluate('() => app.openExerciseSheet("Lat Pulldown")'); p.wait_for_timeout(300)
    p.click('#pt-sv [data-sv="next"]'); p.wait_for_timeout(600)
    t = p.evaluate('() => { const s = document.getElementById("pt-sv"), a = s.querySelector(".pt-sv-a line:nth-of-type(2)"); return { photo: !!s.querySelector(".pt-sv-photo"), text: s.innerText, x2: s.querySelector(\'.pt-sv-a[data-a="0"] path\').getAttribute("d") }; }')
    c.ok(t['photo'] and 'Reset arrows' in t['text'], 'after a reload my photo and my arrows are still there')
    p.click('#pt-sv [data-sv="resetarrows"]'); p.wait_for_timeout(200)
    c.ok(not p.evaluate('(app.settings.exGuideLocal["Lat Pulldown"].arrows || {})[1]') and 'Reset arrows' not in p.evaluate('document.getElementById("pt-sv").innerText'), 'Reset arrows puts the built-in arrows back')
    pid = p.evaluate('app.settings.exGuideLocal["Lat Pulldown"].photos[1]')
    p.click('#pt-sv [data-sv="rmphoto"]'); p.wait_for_timeout(400)
    c.ok(not p.evaluate('!!document.querySelector("#pt-sv .pt-sv-photo")') and p.evaluate('!!document.querySelector("#pt-sv .pt-sv-img")'), 'Remove my photo brings the drawing back')
    c.ok(p.evaluate('async (id) => !(await PT.guideSteps.db.get(id))', pid), 'and deletes the photo from the phone')

    # ---- Reset everything clears the guide photos too
    c.ok(p.evaluate('async () => { await PhotoDB.clear(); const db = await PT.guideSteps.db.open(); return await new Promise(r => { const q = db.transaction("photos").objectStore("photos").count(); q.onsuccess = () => r(q.result === 0); }); }'), 'Reset everything removes the guide photos')

    # ---- offline: the drawings were saved and still show
    p.reload(); p.wait_for_function('!!navigator.serviceWorker.controller', timeout=15000)
    p.evaluate('() => { try { sessionStorage.clear(); } catch (e) {} return PT.guideSteps.prefetch(); }'); p.wait_for_timeout(1500)
    p.context.set_offline(True)
    p.reload(); p.wait_for_function('window.app && app.data && !!PT.guideSteps', timeout=20000); p.wait_for_timeout(400)
    p.evaluate('() => app.openExerciseSheet("Push-Ups")'); p.wait_for_timeout(300)
    p.click('#pt-sv [data-sv="next"]'); p.wait_for_timeout(500)
    c.ok(p.evaluate('() => { const im = document.querySelector("#pt-sv .pt-sv-img"); return !!im && im.complete && im.naturalWidth > 0; }'), 'offline, the drawings still show')
    p.context.set_offline(False)

    # ---- the guide uses the guides too
    r = p.evaluate('async () => await PT.guide.answer("How do I do a Romanian deadlift?")')
    c.ok(r['kind'] == 'form' and r['text'].startswith('Works the hamstrings') and 'estimate' in r['text'] and 'barbell' in r['text'], 'the guide names the muscles and equipment from the guide (%s)' % r['text'])
    c.ok(r['actions'][0]['label'] == 'See the steps with pictures' and r['list'][0] == GUIDES['Romanian Deadlift (RDL)']['steps'][0]['text'], 'and offers the steps with pictures')
    r = p.evaluate('async () => await PT.guide.answer("How do I do push ups?")')
    c.ok('No equipment needed' in r['text'], 'push-ups: no equipment needed')
    r = p.evaluate('async () => await PT.guide.answer("where do I add my own photo to an exercise?")')
    c.eq(r['title'], 'Step-by-step pictures', 'the guide knows where "add my photo" is')

    aud = p.evaluate(open(os.path.join(ROOT, 'tests', 'fixtures', 'design_audit.js'), encoding='utf-8').read())
    c.eq({k: aud['samples'][k][:3] for k, v in aud['counts'].items() if v}, {}, 'the sheet passes the design audit')
    c.eq(p.errors, [], 'no errors')

sys.exit(c.done())
