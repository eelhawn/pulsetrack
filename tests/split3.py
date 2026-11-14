"""2.92.0 My 6-Day Split as 3 days on, 1 day off: the program, the one-time update of a copy already on a phone, the order of the days, and walking through a week."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page

c = Checks('split3')
ID = 'my_6day_chest_back_legs_sharms'
PROG = f'app.data.programs.find(x => x.id === "{ID}")'
SHOTS = '/tmp/claude-0/-home-claude/395da5c4-9b49-54b4-93e4-f9926c59aa1c/scratchpad/'
A8, B8 = [1, 2, 3, 7, 4, 5, 6, 15], [8, 9, 10, 14, 11, 12, 13, 16]

with page() as p:
    c.eq(p.evaluate(f'() => {PROG}.weekPlan.map(g => [g.weeks, g.days])'), [[[1, 3, 5, 7], A8], [[2, 4, 6, 8], B8]], 'Week A and Week B are 8 days: 3 on, rest, 3 on, rest')
    c.eq(p.evaluate(f'() => {PROG}.days.map(d => d.dayNumber)'), A8 + B8, 'the days are stored in that order')
    c.eq(p.evaluate(f'() => {PROG}.days.map(d => d.exercises.length > 0)'), ([True] * 3 + [False] + [True] * 3 + [False]) * 2, 'rest on the 4th and 8th day of both weeks')
    c.eq(p.evaluate(f'() => [{PROG}.weeks, {PROG}.baseDays, PT.weeks.planOf({PROG}).W]'), [8, 8, 8], 'runs 8 weeks')
    c.eq(p.evaluate(f'() => {PROG}.days.filter(d => d.exercises.length).length * 4'), 48, '12 workouts x 4 = 48 workouts over the 8 weeks')
    t = p.evaluate(f'() => {PROG}.days.map(d => (d.title.match(/ - Day (\\d+): /) || [])[1])')
    c.eq(t, [str(i) for i in range(1, 9)] * 2, 'the day names count Day 1 to Day 8 in each week')
    c.ok(p.evaluate(f'() => {PROG}.days.filter(d => !d.exercises.length).every(d => /Rest/.test(d.title))'), 'rest days are named as rest days')
    c.ok(p.evaluate(f'() => /three training days, one rest day/.test({PROG}.description)'), 'the description says 3 on, 1 off')
    # ---------------------------------------------------------------- walking through week 1
    p.evaluate(f'() => {{ app.selectProgram({PROG}, null, true); app.activeProgram = {PROG}; }}')
    seq = []
    for i in range(6):
        d = p.evaluate(f'() => app.nextDayOf({PROG}).dayNumber')
        seq.append(d)
        p.evaluate(f'(n) => app.markDayDone({PROG}, n)', d)
    c.eq(seq, [1, 2, 3, 4, 5, 6], 'up next goes through the 6 workouts in order (rest days are in the list but never "up next")')
    c.eq(p.evaluate(f'() => {{ const s = app.getProgState({PROG}); return [s.week, s.round || 1]; }}'), [2, 1], 'and the 6 workouts finish week 1, which moves to week 2')
    c.eq(p.evaluate(f'() => app.nextDayOf({PROG}).dayNumber'), 8, 'week 2 starts with Week B\'s first day')
    p.evaluate(f'() => {{ app.showView("days"); app.renderDaysView(); }}'); p.wait_for_timeout(300)
    c.eq(p.evaluate('() => [...app.dom.daysList.children].filter(c => c.dataset.day && getComputedStyle(c).display !== "none").map(c => +c.dataset.day)'), B8, 'the days list shows Week B in order')
    c.eq(p.errors, [], 'no page errors')

# ---------------------------------------------------------------- a copy already on a phone (2.75.0 to 2.91.x): 14 days, old names, Day 7 / 14 at the end
OLDDESC = "A six-day bodybuilding split that runs 6 weeks with two alternating weeks: Week A (weeks 1, 3 and 5) and Week B (weeks 2, 4 and 6), Day 7 off. Every muscle group is trained twice a week."
with page() as p:
    p.evaluate(f'''() => {{
      const pr = {PROG}, b = JSON.parse(JSON.stringify(pr));
      const old = {{}}; b.days.forEach(d => {{ old[d.dayNumber] = d; }});
      const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
      pr.days = nums.map(n => {{ const d = JSON.parse(JSON.stringify(old[n])); d.title = d.title.replace(/ - Day \\d+: /, " - Day " + n + ": "); return d; }});
      pr.weekPlan = [{{ weeks: [1, 3, 5], days: [1, 2, 3, 4, 5, 6, 7], name: "Week A" }}, {{ weeks: [2, 4, 6], days: [8, 9, 10, 11, 12, 13, 14], name: "Week B" }}];
      pr.baseDays = 7; pr.description = "{OLDDESC}"; pr.tags = ["My Program", "6 Days"];
      pr.days.find(d => d.dayNumber === 5).title = "My own leg day";
      const sw = pr.days.find(d => d.dayNumber === 3).exercises[0]; sw.origName = sw.name; sw.name = "Arnold Press";
      app.logs["{ID}_d2_" + pr.days.find(d => d.dayNumber === 2).exercises[0].id + "_s0"] = {{ weight: "80", reps: "10", completed: true }};
      app.selectProgram(pr, null, true); app.activeProgram = pr; app.markDayDone(pr, 1); app.markDayDone(pr, 2);
      delete app.settings.split3on1; WorkoutStorage.setData(app.data); WorkoutStorage.saveLogs(app.logs);
    }}''')
    c.eq(p.evaluate(f'() => {PROG}.days.length'), 14, 'set up: the 14-day copy')
    r = p.evaluate('() => PT.split3.upgrade()')
    c.eq(r['done'], True, 'it is brought up to date')
    c.eq(p.evaluate(f'() => {PROG}.days.map(d => d.dayNumber)'), A8 + B8, 'the days are in the new order, with the two new rest days')
    c.eq(p.evaluate(f'() => [{PROG}.weekPlan.map(g => g.days), {PROG}.baseDays]'), [[A8, B8], 8], 'with the new week plan')
    c.eq(p.evaluate(f'() => {PROG}.days.find(d => d.dayNumber === 4).title.includes("Day 5: ")'), True, 'a day name moves to its new number (old Day 4 is now Day 5)')
    c.eq(p.evaluate(f'() => {PROG}.days.find(d => d.dayNumber === 5).title'), 'My own leg day', 'a name you wrote yourself stays')
    c.eq(p.evaluate(f'() => {PROG}.days.find(d => d.dayNumber === 3).exercises[0].name'), 'Arnold Press', 'swaps are not touched')
    c.eq(p.evaluate(f'() => Object.keys(app.logs).filter(k => k.startsWith("{ID}_d2_")).length'), 1, 'ticked sets are not touched')
    c.eq(p.evaluate(f'() => app.getProgState({PROG}).done'), [1, 2], 'and progress carries on: Day 1 and 2 are done')
    c.eq(p.evaluate(f'() => app.nextDayOf({PROG}).dayNumber'), 3, 'so Day 3 is next')
    c.ok(p.evaluate(f'() => /three training days, one rest day/.test({PROG}.description)'), 'the description is the new one')
    c.eq(p.evaluate('() => PT.split3.upgrade().done'), False, 'and it only happens once')
    c.eq(p.errors, [], 'no page errors')

# ---------------------------------------------------------------- the screen
for w in (390, 360):
    with page(w=w, h=800) as p:
        p.evaluate(f'() => {{ app.selectProgram({PROG}, null, true); app.activeProgram = {PROG}; app.showView("days"); app.renderDaysView(); }}')
        p.wait_for_timeout(400)
        v = p.evaluate('''() => [...app.dom.daysList.children].filter(c => c.dataset.day && getComputedStyle(c).display !== "none").map(c => ({ n: +c.dataset.day, t: c.textContent.replace(/\\s+/g, " ").trim().slice(0, 70) }))''')
        c.eq([x['n'] for x in v], A8, '%dpx: the days list shows Day 1-3, rest, Day 5-7, rest' % w)
        c.ok(all(('Rest' in x['t']) == (x['n'] in (7, 15)) for x in v), '%dpx: only the 4th and 8th are rest days' % w)
        k = p.evaluate('() => [...app.dom.daysList.children].filter(c => c.dataset.day && getComputedStyle(c).display !== "none" && !c.textContent.includes("Rest")).map(c => c.querySelector(".uppercase").textContent.trim())')
        c.eq(k, ['Day 1', 'Day 2', 'Day 3', 'Day 5', 'Day 6', 'Day 7'], '%dpx: the small DAY label matches the day name (Day 5, not Day 4)' % w)
        c.eq(p.evaluate(f'() => [PT.dayNo({PROG}, {PROG}.days.find(d => d.dayNumber === 4)), PT.dayNo({PROG}, {PROG}.days.find(d => d.dayNumber === 7)), PT.dayNo({PROG}, {PROG}.days.find(d => d.dayNumber === 11)), PT.dayNo({PROG}, {PROG}.days.find(d => d.dayNumber === 16))]'), [5, 4, 5, 8], '%dpx: Day numbers by position: 4 is Day 5, 7 is the rest Day 4, 11 is Day 5, 16 is Day 8' % w)
        c.eq(p.evaluate('() => PT.dayNo(app.data.programs.find(x => x.id === "frank_zane_upper_lower_4day"), { dayNumber: 3 })'), 3, '%dpx: other programs keep their own day numbers' % w)
        p.evaluate(f'() => {{ app.activeDay = {PROG}.days.find(d => d.dayNumber === 4); app.showView("home"); app.renderHomeView(); }}')
        c.eq(p.evaluate('() => app.dom.homeActiveDayBadge.innerText'), 'Week 1 of 8 · Day 5', '%dpx: the Home card says Day 5 for it' % w)
        c.ok(p.evaluate(f'() => app.weekBadge({PROG}, {PROG}.days.find(d => d.dayNumber === 4))').endswith('Day 5'), '%dpx: and so does the week badge' % w)
        c.ok(p.evaluate('() => document.documentElement.scrollWidth <= innerWidth + 1'), '%dpx: no sideways scroll' % w)
        if w == 390: p.screenshot(path=SHOTS + 'split3.png', full_page=True)
        c.eq(p.errors, [], '%dpx: no page errors' % w)

c.done()
