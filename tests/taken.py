"""Machine's taken: the one-tap swap, Another, back, Undo, the switch back the next day, and the switch."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page

c = Checks('taken')
ID = 'my_6day_chest_back_legs_sharms'
PROG = f'app.data.programs.find(x => x.id === "{ID}")'
DAY = lambda n: f'{PROG}.days.find(d => d.dayNumber === {n})'
EX = lambda n, name: f'{DAY(n)}.exercises.find(e => e.name === "{name}" || e.origName === "{name}")'


def open_day(p, n):
    p.evaluate(f'() => {{ app.activeDay = {DAY(n)}; app.showView("workout"); }}')
    p.wait_for_timeout(350)


def chips(p):
    return p.evaluate('() => [...document.querySelectorAll(".pt-taken")].map(b => b.textContent.trim())')


def names(p, n=1):
    return p.evaluate(f'() => {DAY(n)}.exercises.map(e => e.name)')


def setup(p):
    p.evaluate(f'() => app.selectProgram({PROG}, null, true)')
    open_day(p, 1)


with page() as p:
    setup(p)
    p.evaluate('() => PT.setOpt("autoPrefill", true)')       # the swap refills the card only when the automatic fill is on
    before = names(p)
    c.eq(before[0], 'Lat Pulldown', 'day 1 starts with the lat pulldown')
    c.ok(len(chips(p)) >= 5, 'the button shows on machines, cables and barbells (%d)' % len(chips(p)))
    c.eq(p.evaluate('() => document.querySelectorAll(".pt-taken").length'), p.evaluate(f'() => {DAY(1)}.exercises.filter(e => ["machine","cable","barbell","ezbar","smith"].includes(PT.equipKey(e.name))).length'), 'exactly on the gear exercises')
    c.eq(p.evaluate(f'() => document.querySelectorAll(".pt-taken").length < {DAY(1)}.exercises.length'), True, 'not on dumbbell or bodyweight ones (dips, dumbbell press)')
    c.ok(all(x == '🔁 Taken?' for x in chips(p)), 'the label is short')
    # history for the likely swap targets, so numbers can be filled in
    cands = p.evaluate(f'() => PT.taken.candidates({EX(1, "Lat Pulldown")}).map(s => s.name)')
    c.ok(len(cands) >= 3, 'there are ideas to swap in (%r)' % cands[:4])
    c.ok('Lat Pulldown' not in cands, 'the original is not offered')
    c.ok(not set(cands) & set(before), 'nothing already in the day is offered')
    first = cands[0]
    c.eq(p.evaluate(f'() => PT.equipKey("{first}") !== "cable"'), True, 'different equipment comes first (the machine you wanted is taken)')
    p.evaluate(f'() => {{ app.lastPerf["{first}"] = [1, 2, 3, 4].map(() => ({{ weight: "60", reps: "10" }})); WorkoutStorage.saveLastPerf(app.lastPerf); }}')
    # numbers on the old exercise (pre-filled or typed) belong to it
    lat = EX(1, 'Lat Pulldown')
    oid = p.evaluate(f'() => {lat}.id')
    osets = p.evaluate(f'() => {lat}.sets')
    p.evaluate(f'() => {{ app.logs["{ID}_d1_" + {lat}.id + "_s0"] = {{ completed: false, weight: "140", reps: "9", tag: "R" }}; }}')
    p.evaluate('() => document.querySelector(".pt-taken").click()')
    p.wait_for_timeout(400)
    after = names(p)
    c.eq(after[0], first, 'one tap swaps in the closest match, in the same spot')
    c.eq(after[1:], before[1:], 'the rest of the day is untouched')
    ex0 = p.evaluate(f'() => {DAY(1)}.exercises[0]')
    c.eq(ex0['origName'], 'Lat Pulldown', 'the original is remembered')
    c.eq(ex0['id'], oid, 'same id, so the day keeps its place')
    c.eq(ex0['sets'], osets, 'same sets')
    c.ok(bool(ex0.get('takenOn')), 'and it is marked as a loan')
    w0 = p.evaluate(f'() => (app.logs["{ID}_d1_" + {DAY(1)}.exercises[0].id + "_s0"] || {{}}).weight')
    c.ok(w0 in ('60', '65', '62.5'), 'the old 140 is gone and the new exercise has its own numbers (%r)' % w0)
    ch = chips(p)
    c.ok(any(x.startswith('↩ Lat Pulldown') for x in ch), 'the card offers a way back: %r' % ch[:3])
    c.ok('🔁' in ch, 'and one for trying another')
    # Undo
    p.evaluate('() => { const b = [...document.querySelectorAll("button")].find(x => x.textContent.trim() === "Undo"); if (b) b.click(); }')
    p.wait_for_timeout(300)
    c.eq(names(p)[0], 'Lat Pulldown', 'Undo puts it back')
    c.eq(p.evaluate(f'() => {DAY(1)}.exercises[0].takenOn || null'), None, 'with no loan marker')
    c.eq(p.evaluate(f'() => app.logs["{ID}_d1_" + {DAY(1)}.exercises[0].id + "_s0"].weight'), '140', 'and the number you had typed')
    # Another cycles, Back returns
    p.evaluate('() => document.querySelector(".pt-taken").click()')
    p.wait_for_timeout(300)
    one = names(p)[0]
    p.evaluate('() => document.querySelector(".pt-taken[data-act=taken]").click()')
    p.wait_for_timeout(300)
    two = names(p)[0]
    c.ok(one != two and two != 'Lat Pulldown', 'Another tries the next closest (%s then %s)' % (one, two))
    c.eq(p.evaluate(f'() => {DAY(1)}.exercises[0].origName'), 'Lat Pulldown', 'and still remembers the program\'s exercise')
    p.evaluate('() => [...document.querySelectorAll(".pt-taken")].find(b => b.dataset.act === "back").click()')
    p.wait_for_timeout(300)
    c.eq(names(p), before, 'Back returns the day exactly as it was')
    c.eq(p.evaluate(f'() => ({DAY(1)}.exercises[0].origName || null) + "/" + ({DAY(1)}.exercises[0].takenOn || null)'), 'null/null', 'with no markers left')
    c.eq(p.errors, [], 'no page errors')

with page() as p:
    # the next day it goes back by itself, unless a set was ticked
    setup(p)
    p.evaluate('() => document.querySelector(".pt-taken").click()')
    p.wait_for_timeout(300)
    swapped = names(p)[0]
    c.ok(swapped != 'Lat Pulldown', 'swapped (%s)' % swapped)
    c.eq(p.evaluate('() => PT.taken.sweep().length'), 0, 'the same day it stays')
    p.evaluate(f'() => {{ {DAY(1)}.exercises[0].takenOn = "2000-01-01"; }}')
    c.eq(p.evaluate('() => PT.taken.sweep()'), ['Lat Pulldown'], 'a later day: it comes back by itself')
    c.eq(names(p)[0], 'Lat Pulldown', 'as the program has it')
    p.evaluate('() => app.renderWorkoutView()')
    p.wait_for_timeout(200)
    # ticked set: the record is not rewritten
    p.evaluate('() => document.querySelector(".pt-taken").click()')
    p.wait_for_timeout(300)
    p.evaluate(f'() => {{ const e = {DAY(1)}.exercises[0]; app.logs["{ID}_d1_" + e.id + "_s0"] = {{ completed: true, weight: "50", reps: "10", tag: "R" }}; e.takenOn = "2000-01-01"; app.renderWorkoutView(); }}')
    p.wait_for_timeout(300)
    c.ok(names(p)[0] != 'Lat Pulldown', 'with a ticked set it stays')
    c.eq(p.evaluate('() => document.querySelectorAll(".pt-taken[data-exindex=\\"0\\"]").length'), 0, 'and that card offers no swap or way back once it is under way')
    # a normal swap is on purpose
    p.evaluate(f'() => {{ app.logs = {{}}; WorkoutStorage.saveLogs(app.logs); {DAY(1)}.exercises[0].takenOn = "2000-01-01"; {DAY(1)}.exercises[0].name = "Lat Pulldown"; app.renderWorkoutView(); }}')
    p.wait_for_timeout(200)
    p.evaluate('() => document.querySelector(".pt-taken").click()')
    p.wait_for_timeout(300)
    p.evaluate(f'() => {{ app.exerciseModalTarget = {{ action: "swap", index: 0 }}; app.handleExerciseSelection("Pull-Ups"); }}')
    p.wait_for_timeout(300)
    c.eq(p.evaluate(f'() => {DAY(1)}.exercises[0].takenOn || null'), None, 'swapping with the normal button cancels the switch back')
    c.eq(p.evaluate(f'() => {DAY(1)}.exercises[0].origName'), 'Lat Pulldown', 'but the original is still remembered for Reset')
    c.eq(p.errors, [], 'no page errors')

with page() as p:
    # the switch, free-style workouts, and the program reset
    setup(p)
    p.evaluate('() => PT.setOpt("takenBtn", false)')
    open_day(p, 1)
    c.eq(chips(p), [], 'with the switch off there is no button')
    p.evaluate('() => PT.setOpt("takenBtn", true)')
    open_day(p, 1)
    p.evaluate('() => document.querySelector(".pt-taken").click()')
    p.wait_for_timeout(300)
    c.ok(names(p)[0] != 'Lat Pulldown', 'swapped')
    p.evaluate(f'() => {{ app.restoreDay({PROG}, {DAY(1)}); app.activeDay = {DAY(1)}; app.renderWorkoutView(); }}')
    p.wait_for_timeout(200)
    c.eq(names(p)[0], 'Lat Pulldown', 'resetting the day brings the original back')
    c.eq(p.evaluate(f'() => {DAY(1)}.exercises[0].takenOn || null'), None, 'with no marker')
    # an exercise with nothing to swap in does not break
    p.evaluate('() => { app.swapSuggestions = () => []; }')
    p.evaluate('() => document.querySelector(".pt-taken").click()')
    p.wait_for_timeout(200)
    c.eq(names(p)[0], 'Lat Pulldown', 'no ideas: nothing changes')
    p.evaluate("() => { app.openSettings(); }")
    p.wait_for_timeout(300)
    c.ok(p.evaluate('() => !!document.querySelector("[data-opt=takenBtn]")'), 'Settings → Workout screen has the switch')
    c.eq(p.errors, [], 'no page errors')
with page() as p:
    # the automatic fill is off by default: the swap clears the old exercise's numbers and leaves the card empty
    setup(p)
    first = p.evaluate(f'() => PT.taken.candidates({EX(1, "Lat Pulldown")}).map(s => s.name)[0]')
    p.evaluate(f'() => {{ app.lastPerf["{first}"] = [1, 2, 3, 4].map(() => ({{ weight: "60", reps: "10" }})); WorkoutStorage.saveLastPerf(app.lastPerf); app.logs["{ID}_d1_" + {EX(1, "Lat Pulldown")}.id + "_s0"] = {{ completed: false, weight: "140", reps: "9", tag: "R" }}; }}')
    p.evaluate('() => document.querySelector(".pt-taken").click()')
    p.wait_for_timeout(400)
    c.eq(p.evaluate(f'() => app.logs["{ID}_d1_" + {DAY(1)}.exercises[0].id + "_s0"] || null'), None, 'with the automatic fill off the old numbers are cleared and nothing is filled in')
    c.eq(p.errors, [], 'no page errors')
c.done()
