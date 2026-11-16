"""2.101.0 Ilhaan's 3 Day Split: the renamed program with Core & Cardio days (the leg days' abs + an incline treadmill walk on Day 4, 8 ...),
and the one-time change of a copy already on a phone (name, abs moved, ticked work kept, past days stay ticked, days ahead come up)."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page

c = Checks('corecardio')
ID = 'my_6day_chest_back_legs_sharms'
PROG = f'app.data.programs.find(x => x.id === "{ID}")'
NAMES = lambda dn: f'{PROG}.days.find(d => d.dayNumber === {dn}).exercises.map(e => e.name)'
SHOTS = '/tmp/claude-0/-home-claude/395da5c4-9b49-54b4-93e4-f9926c59aa1c/scratchpad/'

# a copy from 2.94.0-2.100.0: abs at the end of the leg days, Day 4, 8 ... empty rest days
OLD = f'''(title) => {{
  const b = BUILTIN_PROGRAMS.find(x => x.id === "{ID}"), pr = {PROG};
  pr.days = JSON.parse(JSON.stringify(b.days));
  for (let k = 0; k < 8; k++) [[8 * k + 2, 8 * k + 4], [8 * k + 6, 8 * k + 8]].forEach(([ln, cn]) => {{
    const L = pr.days[ln - 1], C = pr.days[cn - 1];
    const HL = {{ name: "Hanging Leg Raises", sets: 3, reps: "12-15", restSeconds: 60, type: "standard" }};
    const abs = cn % 8 === 4 ? [HL, {{ name: "Decline Sit-Ups", sets: 3, reps: "15-20", restSeconds: 45, type: "standard" }}] : [HL, {{ name: "Russian Twists", sets: 3, reps: "20", restSeconds: 45, type: "standard" }}];
    abs.forEach(e => {{ e.id = "{ID}_d" + ln + "_" + e.name.toLowerCase().replace(/[^a-z]+/g, "-"); L.exercises.push(e); }});   // the leg days' abs before 2.101.0
    C.exercises = []; C.title = "Day " + cn + ": Rest Day (Full Recovery)"; C.estimatedMinutes = 0;
    L.title = L.title.replace("Legs & Calves", "Legs, Abs & Calves");
  }});
  pr.title = title; pr.tags = ["My Program", "6 Training Days", "3 On 1 Off", "64 Days"];
  pr.description = "A six-day bodybuilding split run as one long program of 64 days, Day 1 to Day 64, with no weeks.";
  delete app.settings.coreCardio; WorkoutStorage.setData(app.data);
}}'''

with page() as p:
    b = f'BUILTIN_PROGRAMS.find(x => x.id === "{ID}")'
    c.eq(p.evaluate(f'() => {b}.title'), "Ilhaan's 3 Day Split", "the program is called Ilhaan's 3 Day Split")
    c.eq(p.evaluate(f'() => {b}.days.filter(d => /Core & Cardio/.test(d.title)).map(d => d.dayNumber)'), list(range(4, 65, 4)), 'Day 4, 8, 12 ... 64 are Core & Cardio days')
    c.eq(p.evaluate(f'() => {b}.days.filter(d => !d.exercises.length).length'), 0, 'no plain rest days left')
    c.eq(p.evaluate(f'() => {b}.days.find(d => d.dayNumber === 8).exercises.map(e => [e.name, e.sets, e.reps])'), [['Weighted Decline Sit-Ups', 5, '40-60'], ["Captain's Chair Leg Raises", 5, '40-60'], ['Russian Twists', 5, '40-60'], ['Stairmaster', 1, '22.5 min']], 'Day 8 (since 2.104.0): 200-300 reps each of three ab exercises, then the StairMaster')
    c.eq(p.evaluate(f'() => {b}.days.filter(d => /Legs/.test(d.title)).every(d => /Legs & Calves/.test(d.title) && d.exercises.every(e => PT.category(e.name) !== "Core"))'), True, 'the leg days are "Legs & Calves", with no ab work')
    c.eq(p.evaluate(f'() => {{ const k = app.exKind({b}.days[3].exercises[3]); return !!(k.cardio || k.dist); }}'), True, 'the StairMaster is a cardio row')

with page(w=390, h=800) as p:
    p.wait_for_function('() => !!app.settings.coreCardio')   # the app's own one-time change has run at start-up
    p.evaluate(OLD, 'My 6-Day Split: Chest & Back, Legs, Sharms')
    p.evaluate(f'''() => {{
      const pr = {PROG}; app.selectProgram(pr, null, true); app.activeProgram = pr;
      const d2 = pr.days[1], hl = d2.exercises.find(e => e.name === "Hanging Leg Raises");
      for (let s = 0; s < hl.sets; s++) app.logs[app.getLogKey("{ID}", 2, hl.id, s)] = {{ weight: "0", reps: "12", completed: true, tag: "R" }};
      const h6 = pr.days[5].exercises.find(e => e.name === "Hanging Leg Raises");
      app.logs[app.getLogKey("{ID}", 6, h6.id, 0)] = {{ weight: "", reps: "", completed: false, tag: "R" }};
      const st = app.getProgState(pr); st.done = [1, 2, 3, 4, 5]; app.saveProgState(); WorkoutStorage.saveLogs(app.logs);
    }}''')
    c.eq(p.evaluate('() => ' + NAMES(4)), [], 'set up: Day 4 is a rest day')
    r = p.evaluate('() => PT.coreCardio.upgrade()')
    c.eq(r['done'], True, 'the copy is changed')
    c.eq(p.evaluate(f'() => {PROG}.title'), "Ilhaan's 3 Day Split", 'renamed')
    c.ok(p.evaluate(f'() => {PROG}.tags.includes("3 Day Split") && !{PROG}.tags.includes("6 Training Days")'), 'with the new tags')
    c.eq(p.evaluate('() => ' + NAMES(2))[-2:], ['Seated Calf Raises', 'Hanging Leg Raises'], 'Day 2 keeps the Hanging Leg Raises you ticked; its other ab exercise moves')
    c.eq(p.evaluate('() => ' + NAMES(4)), ['Decline Sit-Ups', 'Stairmaster'], 'Day 4: Decline Sit-Ups and the cardio')
    c.eq(p.evaluate('() => ' + NAMES(8)), ['Hanging Leg Raises', 'Russian Twists', 'Stairmaster'], 'Day 8: both of Day 6\'s ab exercises and the cardio')
    c.eq(p.evaluate(f'() => {PROG}.days[7].exercises[0].id'), ID + '_d8_hanging-leg-raises', 'moved exercises get ids of their new day')
    c.eq(p.evaluate(f'() => [{PROG}.days[3].title, {PROG}.days[5].title.split(" (")[0]]'), ['Day 4: Core & Cardio', 'Day 6: Legs & Calves'], 'the day names follow')
    c.eq(p.evaluate('() => Object.keys(app.logs).filter(k => k.startsWith("%s_d6_") && k.includes("hanging-leg-raises")).length' % ID), 0, 'the empty box of a moved exercise is cleared')
    c.eq(p.evaluate('() => Object.keys(app.logs).filter(k => k.startsWith("%s_d2_") && k.includes("hanging-leg-raises") && app.logs[k].completed).length' % ID), 3, 'your ticked sets are untouched')
    c.eq(p.evaluate(f'() => app.getProgState({PROG}).done.slice().sort((a, b) => a - b)'), [1, 2, 3, 4, 5], 'Day 4, which you are past, stays ticked')
    c.eq(p.evaluate(f'() => app.nextDayOf({PROG}).dayNumber'), 6, 'up next is Day 6')
    c.eq(p.evaluate(f'() => app.nextDayOf({PROG}, 7) && app.getProgState({PROG}).done.includes(8)'), False, 'Day 8, still ahead, is not ticked')
    c.eq(p.evaluate('() => PT.coreCardio.upgrade().done !== undefined && !!app.settings.coreCardio'), True, 'it remembers it ran')
    p.evaluate(f'() => {{ app.activeDay = {PROG}.days[3]; app.showView("workout"); app.renderWorkoutView(); }}'); p.wait_for_timeout(300)
    c.ok(p.evaluate('() => document.documentElement.scrollWidth <= innerWidth + 1'), 'Day 4 on screen: no sideways scroll')
    p.screenshot(path=SHOTS + 'corecardio390.png')
    c.eq(p.errors, [], 'no page errors')

with page() as p:   # a name you gave it stays
    p.wait_for_function('() => !!app.settings.coreCardio')   # the app's own one-time change has run at start-up
    p.evaluate(OLD, 'My Split')
    p.evaluate('() => PT.coreCardio.upgrade()')
    c.eq(p.evaluate(f'() => {PROG}.title'), 'My Split', 'a name you gave the program stays')
    c.eq(p.evaluate('() => ' + NAMES(4)), ['Hanging Leg Raises', 'Decline Sit-Ups', 'Stairmaster'], 'Day 4 gets both of Day 2\'s ab exercises and the cardio')
    c.eq(p.errors, [], 'no page errors')

c.done()
