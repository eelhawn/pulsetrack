"""Fill in the whole workout: the first open of a day each week pre-fills the suggested weights; the button does it on demand; Undo; the switch."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page, old8

c = Checks('fill')
ID = 'my_6day_chest_back_legs_sharms'
PROG = f'app.data.programs.find(x => x.id === "{ID}")'
DAY = lambda n: f'{PROG}.days.find(d => d.dayNumber === {n})'
KEY = lambda day, exid, s: f'"{ID}_d{day}_" + {DAY(day)}.exercises.find(e => e.name === "{exid}").id + "_s{s}"'


def setup(p, auto=True):
    p.evaluate(f'() => app.selectProgram({PROG}, null, true)')
    p.evaluate(f'() => PT.setOpt("autoPrefill", {"true" if auto else "false"})')
    p.evaluate('''() => {
      app.lastPerf["Lat Pulldown"] = [1, 2, 3, 4].map(() => ({ weight: "100", reps: "10" }));      // hit the top of 8-10 on every set
      app.lastPerf["Neutral-Grip (V-Bar) Lat Pulldown"] = [1, 2, 3].map(() => ({ weight: "80", reps: "10" }));   // 10-12: one more rep
      WorkoutStorage.saveLastPerf(app.lastPerf);
    }''')


def open_day(p, n):
    p.evaluate(f'() => {{ app.activeDay = {DAY(n)}; app.showView("workout"); }}')
    p.wait_for_timeout(350)


with page() as p:
    old8(p)
    setup(p)
    open_day(p, 1)
    log = lambda day, name, s: p.evaluate(f'() => {{ const e = app.logs[{KEY(day, name, s)}]; return e ? [e.weight, e.reps, !!e.completed] : null; }}')
    c.eq(log(1, 'Lat Pulldown', 0), ['105', '8', False], 'first open: the lat pulldown is filled in (top of the range last time, so 5 more, back to 8 reps)')
    c.eq(log(1, 'Lat Pulldown', 3), ['105', '8', False], 'all four sets')
    c.eq(log(1, 'Neutral-Grip (V-Bar) Lat Pulldown', 0), ['80', '11', False], 'same weight, one more rep when you were inside the range')
    c.eq(log(1, 'Incline Bench Press', 0), None, 'an exercise with no history is left empty')
    c.eq(p.evaluate('() => !!document.getElementById("pt-fillall")'), False, 'nothing left to fill: no button')
    c.eq(p.evaluate('() => document.querySelectorAll("#exercises-list .set-row, [data-ex-card] .set-row").length > 0'), True, 'the workout still draws')
    # your numbers are never changed
    p.evaluate(f'() => {{ app.logs[{KEY(1, "Lat Pulldown", 1)}].weight = "110"; app.renderWorkoutView(); app.renderWorkoutView(); }}')
    c.eq(log(1, 'Lat Pulldown', 1)[0], '110', 'a number you typed stays')
    # a set that is checked off is never changed, even after a clear
    p.evaluate(f'() => {{ const k = {KEY(1, "Lat Pulldown", 2)}; app.logs[k].completed = true; app.logs[k].weight = "107"; }}')
    p.evaluate(f'() => {{ {DAY(1)}.exercises.forEach(ex => {{ for (let s = 0; s < ex.sets; s++) {{ const k = "{ID}_d1_" + ex.id + "_s" + s; if (!(app.logs[k] && app.logs[k].completed)) delete app.logs[k]; }} }}); app.renderWorkoutView(); }}')
    c.eq(log(1, 'Lat Pulldown', 2), ['107', '8', True], 'a checked set is not touched')
    c.eq(log(1, 'Lat Pulldown', 0), None, 'a day you cleared is not pre-filled again the same week')
    c.eq(p.evaluate('() => !!document.getElementById("pt-fillall")'), True, 'but the button is there')
    c.eq(p.evaluate('() => document.getElementById("pt-fillall").textContent.includes("2 exercises")'), True, 'it says how many exercises')
    p.evaluate('() => document.getElementById("pt-fillall").click()')
    p.wait_for_timeout(300)
    c.eq(log(1, 'Lat Pulldown', 0), ['105', '8', False], 'the button fills the empty sets')
    c.eq(log(1, 'Lat Pulldown', 2), ['107', '8', True], 'and still leaves the checked one')
    c.eq(p.evaluate('() => !!document.getElementById("pt-fillall")'), False, 'then the button goes')
    # Undo (the toast action)
    p.evaluate(f'() => {{ {DAY(1)}.exercises.forEach(ex => {{ for (let s = 0; s < ex.sets; s++) {{ const k = "{ID}_d1_" + ex.id + "_s" + s; if (!(app.logs[k] && app.logs[k].completed)) delete app.logs[k]; }} }}); app.renderWorkoutView(); }}')
    p.evaluate('() => document.getElementById("pt-fillall").click()')
    p.wait_for_timeout(200)
    c.eq(log(1, 'Neutral-Grip (V-Bar) Lat Pulldown', 1), ['80', '11', False], 'filled before undo')
    p.evaluate('() => { const b = [...document.querySelectorAll("button")].find(x => x.textContent.trim() === "Undo"); if (b) b.click(); }')
    p.wait_for_timeout(300)
    c.eq(log(1, 'Neutral-Grip (V-Bar) Lat Pulldown', 1), None, 'Undo takes it back')
    # a new week pre-fills again
    p.evaluate(f'() => {{ {DAY(1)}.exercises.forEach(ex => {{ for (let s = 0; s < ex.sets; s++) delete app.logs["{ID}_d1_" + ex.id + "_s" + s]; }}); app.jumpToWeek({PROG}, 3); app.getProgState({PROG}); }}')
    open_day(p, 1)
    c.eq(log(1, 'Lat Pulldown', 0), ['105', '8', False], 'week 3 pre-fills Week A again')
    c.eq(p.errors, [], 'no page errors')

with page() as p:
    old8(p)
    # the default: off (since 2.83.1), so nothing is filled until you tap the button
    p.evaluate(f'() => app.selectProgram({PROG}, null, true)')
    p.evaluate("""() => { app.lastPerf["Lat Pulldown"] = [1, 2, 3, 4].map(() => ({ weight: "100", reps: "10" })); WorkoutStorage.saveLastPerf(app.lastPerf); }""")
    c.eq(p.evaluate('() => PT.opt("autoPrefill")'), False, 'the automatic fill is off by default')
    open_day(p, 1)
    c.eq(p.evaluate(f'() => app.logs[{KEY(1, "Lat Pulldown", 0)}] || null'), None, 'by default nothing is filled on its own')
    c.eq(p.evaluate('() => !!document.getElementById("pt-fillall")'), True, 'and the button is there')
    p.evaluate('() => document.getElementById("pt-fillall").click()')
    p.wait_for_timeout(300)
    c.eq(p.evaluate(f'() => app.logs[{KEY(1, "Lat Pulldown", 0)}].weight'), '105', 'the button fills it when you ask')
    c.eq(p.errors, [], 'no page errors')

with page() as p:
    old8(p)
    setup(p, False)
    open_day(p, 1)
    c.eq(p.evaluate(f'() => app.logs[{KEY(1, "Lat Pulldown", 0)}] || null'), None, 'with the switch off nothing is filled on its own')
    c.eq(p.evaluate('() => !!document.getElementById("pt-fillall")'), True, 'the button is still there')
    c.eq(p.evaluate('() => (app.settings.prefilled || {})["' + ID + '_d1"] || null'), None, 'and no stamp is left')
    p.evaluate("() => { app.openSettings(); }")
    p.wait_for_timeout(300)
    c.ok(p.evaluate('() => !!document.querySelector("[data-opt=autoPrefill]")'), 'Settings → Workout screen has the switch')
    c.eq(p.errors, [], 'no page errors')

with page() as p:
    old8(p)
    # a program with no history at all, and a rest day: nothing happens, nothing breaks
    p.evaluate(f'() => app.selectProgram({PROG}, null, true)')
    p.evaluate('() => PT.setOpt("autoPrefill", true)')
    open_day(p, 1)
    c.eq(p.evaluate('() => !!document.getElementById("pt-fillall")'), False, 'no history: no button')
    c.eq(p.evaluate('() => Object.keys(app.settings.prefilled || {}).length'), 0, 'and no stamp (it tries again once there is history)')
    open_day(p, 7)
    c.eq(p.evaluate('() => !!document.getElementById("pt-fillall")'), False, 'a rest day has no button')
    c.eq(p.errors, [], 'no page errors')
c.done()
