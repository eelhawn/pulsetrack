"""3.17.0 a rep counter for abs: every ab exercise done for reps has "Count reps" on its workout card. The sheet shows the moving
drawing and a big number: tap it for each rep, or "Pace me" counts the reps at a steady speed with the drawing. "Save set" puts the
count in the next set that is not ticked and ticks it. Holds, cardio and other muscles get no counter."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

c = Checks('repcounter')
ME = 'my_6day_chest_back_legs_sharms'
CORE = '() => { const pr = app.data.programs.find(x => x.id === "%s"); app.selectProgram(pr, pr.days[3], true); app.showView("workout"); }' % ME
LOG = '(n) => { const k = Object.keys(app.logs).filter(k => k.startsWith("%s_d4_") && k.includes("weighted-decline") && k.endsWith("_s" + n)); return k.length ? app.logs[k[0]] : null; }' % ME

with page(w=360, h=780) as p:
    p.wait_for_function('() => typeof PT !== "undefined" && !!PT.repCounter', timeout=20000)
    # ---- which exercises
    got = p.evaluate('''() => ["Weighted Decline Sit-Ups", "Captain's Chair Leg Raises", "Russian Twists", "Crunches", "Hanging Leg Raises", "Cable Crunch",
        "Plank", "Side Plank", "Bench Press", "Barbell Curls", "Back Extension"].map(n => [n, PT.repCounter.isAbs(n, { name: n, reps: "12" })])''')
    c.eq([n for n, v in got if v], ["Weighted Decline Sit-Ups", "Captain's Chair Leg Raises", "Russian Twists", "Crunches", "Hanging Leg Raises", "Cable Crunch"],
         'ab exercises done for reps get a counter; holds (planks), chest, arms and lower back do not')
    c.ok(not p.evaluate('PT.repCounter.isAbs("Crunches", { name: "Crunches", reps: "45 sec" })'), 'an ab exercise done for time gets none')
    c.eq(p.evaluate('[PT.repCounter.goalOf("40-60"), PT.repCounter.goalOf("15"), PT.repCounter.goalOf("AMRAP")]'), [{'lo': 40, 'hi': 60}, {'lo': 15, 'hi': 15}, None], 'the goal comes from the reps')

    # ---- on the Core & Cardio day
    p.evaluate(CORE); p.wait_for_timeout(600)
    names = p.evaluate('[...document.querySelectorAll(".pt-rc-btn")].map(b => b.closest("[data-ex-card]").querySelector(".btn-check-set").dataset.exname)')
    c.eq(names, ["Weighted Decline Sit-Ups", "Captain's Chair Leg Raises", "Russian Twists"], 'Day 4: the three ab exercises have Count reps, the StairMaster does not')
    c.ok(p.evaluate('(() => { const b = document.querySelector(".pt-rc-btn"), l = b.previousElementSibling; return l && l.innerText.includes("5 Sets") && l.getBoundingClientRect().height < 40; })()'), 'the button sits under the sets line without squeezing it')
    p.click('.pt-rc-btn'); p.wait_for_timeout(500)
    st = p.evaluate('() => ({ sub: document.querySelector("#pt-rc-sheet h3").parentElement.innerText, img: (document.getElementById("pt-rc-img") || {}).src || "", n: document.getElementById("pt-rc-n").textContent, goal: document.getElementById("pt-rc-sub").textContent, save: document.getElementById("pt-rc-save").disabled })')
    c.ok('Weighted Decline Sit-Ups' in st['sub'] and 'set 1 of 5' in st['sub'], 'the sheet says the exercise and set 1 of 5')
    c.ok(st['img'].startswith('data:image/svg+xml'), 'with the drawing of the exercise')
    c.ok(st['n'] == '0' and 'Goal 40-60' in st['goal'] and '40 to go' in st['goal'] and st['save'], 'starts at 0, goal 40-60, nothing to save yet')

    # tap
    for _ in range(5): p.click('#pt-rc-tap'); p.wait_for_timeout(110)
    p.click('#pt-rc-tap')
    n_src = p.evaluate('async () => { const seen = new Set(); for (let i = 0; i < 10; i++) { seen.add(document.getElementById("pt-rc-img").src); await new Promise(r => setTimeout(r, 60)); } return seen.size; }')
    p.click('[data-rc=minus]'); p.wait_for_timeout(100)
    c.eq(p.evaluate('document.getElementById("pt-rc-n").textContent'), '5', 'six taps and −1 make 5')
    c.ok(n_src >= 4, 'each tap plays a rep of the drawing (%d pictures in 0.6 s)' % n_src)
    c.eq(p.evaluate('document.getElementById("pt-rc-save").textContent'), 'Save set 1: 5 reps', 'Save says which set and how many')

    # pace
    p.click('[data-rcp="1500"]'); p.wait_for_timeout(100)
    c.eq(p.evaluate('app.settings.rcPace'), 1500, 'the pace choice is kept')
    p.click('[data-rc=reset]'); p.click('#pt-rc-pace'); p.wait_for_timeout(4200)
    s = p.evaluate('PT.repCounter.state()')
    c.ok(s['pacing'] and 2 <= s['n'] <= 3, 'Pace me at 1.5 s counts by itself (%d reps in 4.2 s, after "Go")' % s['n'])
    c.ok(p.evaluate('document.getElementById("pt-rc-pace").getAttribute("aria-pressed")') == 'true' and p.evaluate('document.getElementById("pt-rc-pace").textContent') == 'Stop', 'its button turns into Stop')
    n0 = s['n']; p.click('#pt-rc-tap'); p.wait_for_timeout(50)
    c.ok(p.evaluate('PT.repCounter.state().n') <= n0 + 1, 'tapping while it paces does not add extra reps')
    p.click('#pt-rc-pace'); p.wait_for_timeout(1700)
    n1 = p.evaluate('PT.repCounter.state().n'); p.wait_for_timeout(1700)
    c.eq(p.evaluate('PT.repCounter.state().n'), n1, 'Stop stops counting')

    # the goal
    p.evaluate('() => { for (let i = 0; i < 45; i++) document.getElementById("pt-rc-tap").click(); }'); p.wait_for_timeout(150)
    c.ok(p.evaluate('document.getElementById("pt-rc-tap").classList.contains("pt-rc-ok")') and 'In your goal' in p.evaluate('document.getElementById("pt-rc-sub").textContent'), 'at 40 it shows the goal is reached')
    p.click('#pt-rc-voice'); p.wait_for_timeout(100)
    c.eq(p.evaluate('app.settings.rcVoice'), False, 'Say the count can be turned off, and is kept')

    # save
    n = p.evaluate('PT.repCounter.state().n')
    p.click('#pt-rc-save'); p.wait_for_timeout(600)
    lg = p.evaluate(LOG, 0)
    c.ok(lg and lg['completed'] and lg['reps'] == str(n), 'Save set fills set 1 with %d reps and ticks it' % n)
    c.ok(p.evaluate('!document.getElementById("pt-rc-sheet") || document.getElementById("pt-rc-sheet").classList.contains("hidden")'), 'and closes the sheet')
    c.ok(('Set 1 of Weighted Decline Sit-Ups: %d reps saved' % n) in p.evaluate('document.getElementById("pt-toast-msg").innerText'), 'and says so')
    c.ok(p.evaluate('!!document.querySelector("#rest-timer-display, #floating-rest-timer")'), 'the rest timer starts as after any set')
    p.click('.pt-rc-btn'); p.wait_for_timeout(400)
    c.ok('set 2 of 5' in p.evaluate('document.querySelector("#pt-rc-sheet h3").parentElement.innerText') and p.evaluate('PT.repCounter.state().n') == 0, 'opening it again goes to set 2, from 0')
    for _ in range(3): p.click('#pt-rc-tap')
    p.click('#pt-rc-save'); p.wait_for_timeout(500)
    c.ok(p.evaluate(LOG, 1)['completed'] and p.evaluate(LOG, 1)['reps'] == '3', 'set 2 saved with 3 reps')

    aud = p.evaluate(open(os.path.join(ROOT, 'tests', 'fixtures', 'design_audit.js'), encoding='utf-8').read())
    c.eq({k: aud['samples'][k][:3] for k, v in aud['counts'].items() if v}, {}, 'the workout with Count reps passes the design audit at 360px')
    p.click('.pt-rc-btn'); p.wait_for_timeout(400)
    aud = p.evaluate(open(os.path.join(ROOT, 'tests', 'fixtures', 'design_audit.js'), encoding='utf-8').read())
    c.eq({k: aud['samples'][k][:3] for k, v in aud['counts'].items() if v}, {}, 'the counter sheet passes too')
    c.ok(p.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'no sideways scroll')

    # other days: no counter
    p.evaluate('() => { PT.repCounter.close(); const pr = app.data.programs.find(x => x.id === "%s"); app.selectProgram(pr, pr.days[0], true); app.showView("workout"); }' % ME); p.wait_for_timeout(500)
    c.eq(p.evaluate('document.querySelectorAll(".pt-rc-btn").length'), 0, 'Chest & Back day: no counters')
    c.eq(p.errors, [], 'no errors')

sys.exit(c.done())
