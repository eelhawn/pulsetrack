"""3.1.0 what Fill in puts in: Settings > Workout screen > Fill in uses: Suggested (default), Last time (the grey numbers, set by
set), Heaviest set, Most reps. It applies to the exercise's Fill in button, the Fill in button at the top and Pre-fill. Warm-ups
are left out of Heaviest and Most reps; typed sets are never changed."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page, old8

c = Checks('fillmode')
ID = 'my_6day_chest_back_legs_sharms'
PROG = f'app.data.programs.find(x => x.id === "{ID}")'
DAY = f'{PROG}.days.find(d => d.dayNumber === 1)'
LAST = '''() => { app.lastPerf["Lat Pulldown"] = [{ weight: "150", reps: "3", tag: "W" }, { weight: "100", reps: "10" }, { weight: "110", reps: "8" }, { weight: "110", reps: "9" }, { weight: "90", reps: "12" }]; WorkoutStorage.saveLastPerf(app.lastPerf); }'''
SETS = '() => { const ex = ' + DAY + '.exercises.find(e => e.name === "Lat Pulldown"); return [0, 1, 2, 3].map(s => { const e = app.logs["' + ID + '_d1_" + ex.id + "_s" + s]; return e && (e.weight || e.reps) ? e.weight + "x" + e.reps : null; }); }'
CLEAR = '() => { const ex = ' + DAY + '.exercises.find(e => e.name === "Lat Pulldown"); [0, 1, 2, 3, 4].forEach(s => delete app.logs["' + ID + '_d1_" + ex.id + "_s" + s]); WorkoutStorage.saveLogs(app.logs); app.renderWorkoutView(); }'

with page() as p:
    old8(p)
    p.evaluate(f'() => app.selectProgram({PROG}, null, true)')
    p.evaluate('() => PT.setOpt("autoPrefill", false)')
    p.evaluate(LAST)
    p.evaluate(f'() => {{ app.activeDay = {DAY}; app.showView("workout"); }}'); p.wait_for_timeout(300)
    c.eq(p.evaluate('app.settings.fillMode || "suggest"'), 'suggest', 'Suggested is the default')

    # ---- settings row
    p.evaluate('document.getElementById("btn-open-settings").click()'); p.wait_for_timeout(300)
    c.ok(p.evaluate('!!document.querySelector("#pt-fillmode [data-fillmode]")'), 'Settings has "Fill in uses"')
    c.eq(p.evaluate('[...document.querySelectorAll("#pt-fillmode [data-fillmode]")].map(b => b.textContent)'), ['Suggested', 'Last time', 'Heaviest set', 'Most reps'], 'four choices')
    c.eq(p.evaluate('document.querySelector("#pt-fillmode [aria-pressed=true]").dataset.fillmode'), 'suggest', 'Suggested is picked')
    # Last time: set by set, the grey numbers (the first one was a warm-up last time). Heaviest and Most reps leave the warm-up out.
    want = {'last': ['150x3', '100x10', '110x8', '110x9'], 'heaviest': ['110x9'] * 4, 'reps': ['90x12'] * 4}
    for m, label in (('last', "Fill in last time's numbers"), ('heaviest', 'Fill in your heaviest set'), ('reps', 'Fill in your most-reps set')):
        p.evaluate('document.getElementById("btn-open-settings").click()'); p.wait_for_timeout(150)
        p.evaluate('(m) => document.querySelector(\'#pt-fillmode [data-fillmode="\' + m + \'"]\').click()', m); p.wait_for_timeout(150)
        c.eq(p.evaluate('app.settings.fillMode'), m, '%s: saved' % m)
        c.eq(p.evaluate('document.querySelector("#pt-fillmode [aria-pressed=true]").dataset.fillmode'), m, '%s: shows as picked' % m)
        p.evaluate('document.getElementById("btn-close-settings").click()'); p.evaluate(CLEAR); p.wait_for_timeout(150)
        # the button at the top
        btn = p.evaluate('document.getElementById("pt-fillall") && document.getElementById("pt-fillall").textContent')
        c.ok(btn and label in btn, '%s: the top button says "%s" (%s)' % (m, label, btn))
        p.click('#pt-fillall'); p.wait_for_timeout(150)
        c.eq(p.evaluate(SETS), want[m], '%s: the top button fills %s' % (m, want[m]))
        toast = p.evaluate('document.getElementById("pt-toast-msg").textContent')
        c.ok(label.split(' ', 2)[-1].replace('your ', "") in toast or 'last time' in toast, '%s: the toast says what it used (%s)' % (m, toast))
        # the exercise's own button
        p.evaluate(CLEAR); p.wait_for_timeout(100)
        idx = p.evaluate('() => ' + DAY + '.exercises.findIndex(e => e.name === "Lat Pulldown")')
        p.evaluate('(i) => { const b = document.querySelector(\'.pt-next-use[data-exindex="\' + i + \'"]\'); b.click(); }', idx); p.wait_for_timeout(150)
        c.eq(p.evaluate(SETS), want[m], '%s: the exercise\'s Fill in does the same' % m)

    # ---- typed numbers stay
    p.evaluate(CLEAR)
    p.evaluate('() => { const ex = ' + DAY + '.exercises.find(e => e.name === "Lat Pulldown"); app.logs["' + ID + '_d1_" + ex.id + "_s1"] = { completed: false, weight: "77", reps: "7", tag: "R" }; WorkoutStorage.saveLogs(app.logs); app.renderWorkoutView(); }')
    p.click('#pt-fillall'); p.wait_for_timeout(150)
    c.eq(p.evaluate(SETS), ['90x12', '77x7', '90x12', '90x12'], 'a set you typed is left alone')

    # ---- pre-fill follows the choice
    p.evaluate(CLEAR)
    p.evaluate('() => { app.settings.fillMode = "heaviest"; app.settings.prefilled = {}; WorkoutStorage.saveSettings(app.settings); PT.setOpt("autoPrefill", true); }')
    p.evaluate(f'() => {{ app.activeDay = {DAY}; app.renderWorkoutView(); }}'); p.wait_for_timeout(300)
    c.eq(p.evaluate(SETS), ['110x9'] * 4, 'Pre-fill the whole workout uses the choice too')

    # ---- back to Suggested: the old behaviour
    p.evaluate(CLEAR)
    p.evaluate('() => { app.settings.fillMode = "suggest"; WorkoutStorage.saveSettings(app.settings); app.renderWorkoutView(); }'); p.wait_for_timeout(150)
    p.click('#pt-fillall'); p.wait_for_timeout(150)
    c.ok(p.evaluate(SETS)[0] is not None and 'suggested' in p.evaluate('document.getElementById("pt-toast-msg").textContent'), 'Suggested still fills the suggestion')
    c.eq(p.errors, [], 'no errors')

sys.exit(c.done())
