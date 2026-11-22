"""3.23.0 the weight is a ghost value in Guided mode (the owner: "you should make the weight a ghost value in guided mode"). Like the
workout cards: the weight box starts empty with a grey number (your last set today, or this set last time); typing replaces it; −/+ start
from it; Log uses it while the box is still empty (with One-tap log on). A weight you already typed for the set shows as a real number.
The same on the superset screen."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page

c = Checks('ghostweight')
ID = 'my_6day_chest_back_legs_sharms'
PROG = f'app.data.programs.find(x => x.id === "{ID}")'
DAY1 = f'{PROG}.days.find(d => d.dayNumber === 1)'
KEY = lambda i, s: f'"{ID}_d1_" + {DAY1}.exercises[{i}].id + "_s{s}"'
LOG = lambda i, s: f'() => {{ const e = app.logs[{KEY(i, s)}]; return e ? [e.weight, e.reps, !!e.completed] : null; }}'
BOX = '() => { const w = document.getElementById("pt-g-w"); return w ? [w.value, w.placeholder] : null; }'
OPEN = '() => { if (PT.closeGuided) PT.closeGuided(); PT.openGuided(); }'
LOGBTN = 'document.getElementById("pt-g-log").click()'

with page(w=390, h=844) as p:
    p.wait_for_function('() => typeof PT !== "undefined" && !!PT.openGuided', timeout=20000)
    name = p.evaluate(f'''() => {{
      app.selectProgram({PROG}, null, true); PT.setOpt("autoPrefill", false); PT.setOpt("autoFill", false); PT.setOpt("oneTap", true);
      const ex = {DAY1}.exercises[0];
      app.lastPerf[ex.name] = [{{ weight: "100", reps: "10" }}, {{ weight: "105", reps: "8" }}, {{ weight: "105", reps: "8" }}];
      WorkoutStorage.saveLastPerf(app.lastPerf); app.activeDay = {DAY1}; app.showView("workout"); return ex.name; }}''')
    p.wait_for_timeout(300)
    p.evaluate(OPEN); p.wait_for_timeout(400)
    c.eq(p.evaluate('document.querySelector("#pt-guided .pt-g-title").textContent'), name, 'Guided mode opens on %s' % name)
    c.eq(p.evaluate(BOX), ['', '100'], 'the weight box is empty with last time\'s 100 as a grey ghost')
    c.eq(p.evaluate('document.getElementById("pt-g-r").value'), '10', 'reps are filled in as before')
    col = p.evaluate('() => { const w = document.getElementById("pt-g-w"); return [getComputedStyle(w).color, getComputedStyle(w, "::placeholder").color]; }')
    c.ok(col[0] != col[1], 'the ghost is grey, not the colour of a typed number (%s vs %s)' % (col[1], col[0]))

    # ---- Log with the box empty logs the ghost
    p.evaluate(LOGBTN); p.wait_for_timeout(400)
    c.eq(p.evaluate(LOG(0, 0)), ['100', '10', True], 'Log with the box still empty logs the grey 100 x 10')
    c.eq(p.evaluate(BOX), ['', '100'], 'set 2: empty again, ghost = your last set today (100)')
    # ---- typing replaces it
    p.fill('#pt-g-w', '110'); p.wait_for_timeout(100)
    p.evaluate(LOGBTN); p.wait_for_timeout(400)
    c.eq(p.evaluate(LOG(0, 1))[0], '110', 'a typed weight is what gets logged (110)')
    # ---- −/+ start from the ghost
    c.eq(p.evaluate(BOX), ['', '110'], 'set 3: ghost 110')
    p.evaluate('document.querySelector(\'#pt-guided [data-gs="w"][data-d^="-"]\').click()'); p.wait_for_timeout(100)
    v = p.evaluate(BOX)[0]
    c.ok(v != '' and 100 <= float(v) < 110, '− starts from the grey number (110 -> %s)' % v)
    p.evaluate('() => { const w = document.getElementById("pt-g-w"); w.value = ""; w.dispatchEvent(new Event("input", { bubbles: true })); }')
    p.evaluate(OPEN); p.wait_for_timeout(300)
    c.eq(p.evaluate(BOX), ['', '110'], 'emptying the box brings the ghost back')

    # ---- a weight you already typed shows as a real number
    p.evaluate(f'() => {{ app.logs[{KEY(0, 2)}] = {{ completed: false, weight: "120", reps: "", tag: "R" }}; app.renderWorkoutView(); }}')
    p.evaluate(OPEN); p.wait_for_timeout(300)
    c.eq(p.evaluate(BOX)[0], '120', 'a weight already typed for the set shows as a real number')
    p.evaluate(f'() => {{ delete app.logs[{KEY(0, 2)}]; app.renderWorkoutView(); }}')

    # ---- One-tap log off: an empty box logs no weight, like ✓ on the cards
    p.evaluate('() => PT.setOpt("oneTap", false)'); p.evaluate(OPEN); p.wait_for_timeout(300)
    p.evaluate(LOGBTN); p.wait_for_timeout(400)
    c.eq(p.evaluate(LOG(0, 2))[0], '', 'with One-tap log off, an empty box logs no weight')
    p.evaluate('() => PT.setOpt("oneTap", true)')

    # ---- superset screen
    n2 = p.evaluate(f'''() => {{ const d = {DAY1}; d.exercises[1].link = true; const ex = d.exercises[2];
      app.lastPerf[ex.name] = [{{ weight: "60", reps: "12" }}]; app.lastPerf[d.exercises[1].name] = [{{ weight: "80", reps: "10" }}]; WorkoutStorage.saveLastPerf(app.lastPerf);
      for (let s = 0; s < (d.exercises[0].sets || 0); s++) app.logs["{ID}_d1_" + d.exercises[0].id + "_s" + s] = {{ completed: true, weight: "100", reps: "10", tag: "R" }};
      app.renderWorkoutView(); return ex.name; }}''')
    p.evaluate(OPEN); p.wait_for_timeout(400)
    g = p.evaluate('() => ["pt-g-w-1", "pt-g-w-2"].map(id => { const w = document.getElementById(id); return w ? [w.value, w.placeholder] : null; })')
    c.eq(g, [['', '80'], ['', '60']], 'on the superset screen each weight box has its ghost (80 and 60)')
    p.evaluate('document.getElementById("pt-g-log").click()'); p.wait_for_timeout(500)
    c.eq([p.evaluate(LOG(1, 0))[0], p.evaluate(LOG(2, 0))[0]], ['80', '60'], 'Log round logs the ghosts')
    p.evaluate('() => PT.closeGuided()')
    c.eq(p.errors, [], 'no errors')

sys.exit(c.done())
