"""3.26.0 vertical preacher curls, bar and dumbbell apart (the owner, after 3.25.0: "for the preacher curls u added put dumbell and bar
separate breh and add vertical in the name and do the drawing correcrly"; asked: the bar on the day, the dumbbells as a swap; he does
them standing at the pad). Day 15, 31, 47 and 63 of Ilhaan's 3 Day Split have Vertical Preacher Curls (Bar); Vertical Preacher Curls
(Dumbbell) is its own exercise and the first swap offered. The drawing stands at an upright pad, chest on it, upper arms straight down its
front. A copy already on a phone is changed once (ticked sets, swaps, removals, your notes and the history from this split come along)."""
import os, sys, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page

c = Checks('verticalpreacher')
ID = 'my_6day_chest_back_legs_sharms'
BAR, DB, OLD = 'Vertical Preacher Curls (Bar)', 'Vertical Preacher Curls (Dumbbell)', 'Preacher Curls (Dumbbell/Bar)'
PROG = f'app.data.programs.find(x => x.id === "{ID}")'
BUILT = f'BUILTIN_PROGRAMS.find(x => x.id === "{ID}")'
DAY = lambda dn, src=PROG: f'{src}.days.find(d => d.dayNumber === {dn})'
EXID = lambda dn, slug: f'{ID}_d{dn}_{slug}'
LOG = lambda dn, exid, s: f'{ID}_d{dn}_{exid}_s{s}'

with page() as p:
    p.wait_for_function('() => typeof PT !== "undefined" && !!PT.figure && !!PT.equip && !!app.swapSuggestions', timeout=20000)
    # ---- the program and the exercise list
    for dn in (15, 31, 47, 63):
        r = p.evaluate(f'() => {{ const d = {DAY(dn, BUILT)}, e = d.exercises[7]; return [e.name, e.id, e.sets, e.reps, e.restSeconds, e.notes === undefined, d.exercises[6].name]; }}')
        c.eq(r, [BAR, EXID(dn, 'vertical-preacher-curls-bar'), 3, '10-12', 60, True, 'Machine Preacher Curls'], 'Day %d: Vertical Preacher Curls (Bar) 3 x 10-12, after the machine preacher curls' % dn)
    c.eq(p.evaluate(f'() => {BUILT}.days.flatMap(d => d.exercises).filter(e => /^Preacher Curls/.test(e.name)).length'), 0, 'no "Preacher Curls" or "Preacher Curls (Dumbbell/Bar)" left in the split')
    c.eq(p.evaluate(f'() => [...new Set({BUILT}.days.flatMap(d => d.exercises.map(e => e.name)))].filter(n => {{ const e = PT.exCanon(n); return !e || e.name !== n; }})'), [], 'every name in the split is an exercise-list name')
    ent = p.evaluate(f'() => ["{BAR}", "{DB}", "{OLD}"].map(n => {{ const e = EXERCISE_DATABASE.find(x => x.name === n); return e ? [e.category, /upright side/.test(e.tips[0]), /straight down/.test(e.tips[1])] : null; }})')
    c.eq(ent, [['Biceps', True, True], ['Biceps', True, True], None], 'the bar and dumbbell versions are two exercises in the list (standing at the upright pad); "Preacher Curls (Dumbbell/Bar)" is gone')
    c.eq(p.evaluate(f'() => app.swapSuggestions("{BAR}", 8)[0].name'), DB, 'the dumbbell version is the first swap offered for the bar version')
    c.ok(BAR in p.evaluate(f'() => app.swapSuggestions("{DB}", 8).slice(0, 2).map(x => x.name)'), 'and the bar version is in the first two swaps for the dumbbell version')

    # ---- the drawing
    cl = p.evaluate(f'() => ["{BAR}", "{DB}"].map(n => {{ const k = PT.figure.classify(n); return [k.id, k.kit, PT.equip.of(n).items]; }})')
    c.eq(cl, [['preacher_vertical', 'barbell', ['preacher_vertical', 'ez_bar']], ['preacher_vertical', 'dumbbell', ['preacher_vertical', 'dumbbells']]], 'both draw as a vertical preacher curl, with a bar or dumbbells, on the upright preacher pad')
    c.ok(p.evaluate('() => !!PT.figure.classify("Preacher Curls") && PT.figure.classify("Preacher Curls").id === "preacher_curl" && PT.equip.of("Preacher Curls").items[0] === "preacher_bench"'), 'plain Preacher Curls still sit at the slanted pad')
    c.eq(p.evaluate(f'() => PT.musclesOf("{BAR}").muscles.filter(m => m.role === "primary").map(m => m.muscle_id)'), ['biceps'], 'biceps are the main muscle')
    g = p.evaluate('''() => { const l = PT.figure.layout("preacher_vertical", "barbell"), F = PT.figure.FLOOR;
      return { fr: l.frames.map(f => ({ sh: f.j.shoulder, el: f.j.elbow, ha: f.j.hand, hip: f.j.hip, an: f.j.ankle })), mid: l.mid.map(s => [s.a, s.b, s.w]), F }; }''')
    ang = lambda a, b: math.degrees(math.atan2(b[1] - a[1], b[0] - a[0]))   # 90 = straight down on screen
    f0, f1 = g['fr']
    c.ok(all(abs(ang(f['sh'], f['el']) - 90) <= 6 for f in g['fr']), 'the upper arms hang straight down in both pictures (%s)' % [round(ang(f['sh'], f['el'])) for f in g['fr']])
    c.ok(f0['ha'][1] > f0['el'][1] + 20 and f1['ha'][1] < f1['el'][1] - 20, 'start: arms nearly straight below the elbow; finish: curled up above it')
    c.ok(all(abs(f['an'][1] - g['F']) < 8 and f['an'][1] - f['hip'][1] > 80 for f in g['fr']), 'standing, feet on the floor, legs nearly straight')
    pad = g['mid'][0]
    c.ok(abs(pad[0][0] - pad[1][0]) < 1 and pad[0][1] <= f0['sh'][1] + 10 and pad[1][1] >= f0['el'][1], 'the pad is upright, from the armpit to below the elbow (%s)' % pad)
    c.ok(pad[0][0] + pad[2] / 2 <= min(f0['sh'][0], f0['el'][0]) - 3 and pad[0][0] > f0['hip'][0], 'the pad sits between the body and the upper arms, against the backs of the arms')
    svg = p.evaluate('() => PT.figure.svg("preacher_vertical", 0, "barbell")')
    c.ok('stroke="#3f3f46" stroke-width="11"' in svg, 'the pad is drawn (over the chest, under the near arm)')
    d = p.evaluate(f'() => {{ const x = PT.figure.demo("{BAR}"); return [x.kind, x.frames.length, !!x.machine]; }}')
    c.eq(d, ['move', 9, False], 'Step by step plays it moving, with its own pad')
    c.ok('<svg' in (p.evaluate('() => PT.equip.svg("preacher_vertical")') or ''), 'the Equipment section has a picture of the upright pad')

    # ---- a copy already on a phone (3.25.0) and its history
    p.evaluate(f'''() => {{
      const a = app, pr = {PROG}, day = dn => pr.days.find(x => x.dayNumber === dn), now = Date.now();
      [15, 31, 47, 63].forEach(dn => {{ day(dn).exercises[7] = {{ id: "{ID}_d" + dn + "_preacher-curls-dumbbell-bar", name: "{OLD}", sets: 3, reps: "10-12", restSeconds: 60, type: "standard" }}; }});
      day(47).exercises[7].notes = "Seat 3";   // his own note
      const e63 = day(63).exercises[7]; e63.origName = "{OLD}"; e63.name = "Spider Curls";   // swapped by hand
      const d31 = day(31); d31.removed = [{{ idx: 7, ex: d31.exercises[7] }}]; d31.exercises.splice(7, 1);   // removed by hand
      a.logs["{LOG(15, EXID(15, 'preacher-curls-dumbbell-bar'), 0)}"] = {{ reps: "10", weight: "55", completed: true }};
      const ses = (id, pid, nm, w, back) => {{ const t = now - back * 86400000; return {{ id, v: 1, date: PT.ds(new Date(t)), ts: t, pid, ptitle: "P", day: 15, dtitle: "Shoulders & Arms", dur: 3000, unit: "lb",
        ex: [{{ name: nm, sets: [{{ w, r: 10, t: "R" }}] }}], vol: 0, sets: 1, prs: [], upd: t }}; }};
      a.sessions.push(ses("vp-other", "some_other_program", "Preacher Curls", 30, 1), ses("vp-mine", "{ID}", "{OLD}", 55, 2), ses("vp-older", "{ID}", "Preacher Curls", 50, 9));
      a.saveSessions(); a.recomputeSessionPRs(); a.rebuildPRs(); a.rebuildLastPerfFor(["{OLD}", "Preacher Curls"]);
      a.exNotes["{OLD}"] = "Elbows in"; a.settings.restOverrides = Object.assign({{}}, a.settings.restOverrides, {{ "{OLD}": 75 }});
      delete a.settings.verticalPreacher; WorkoutStorage.setData(a.data);
    }}''')
    c.ok(p.evaluate('() => PT.verticalPreacher.run()') >= 6, 'set up: a 3.25.0 copy with Preacher Curls (Dumbbell/Bar), changed once')
    c.eq(p.evaluate(f'() => {{ const e = {DAY(15)}.exercises[7]; return [e.name, e.id, e.sets]; }}'), [BAR, EXID(15, 'vertical-preacher-curls-bar'), 3], 'Day 15: Vertical Preacher Curls (Bar)')
    c.eq(p.evaluate(f'''() => [app.logs["{LOG(15, EXID(15, 'vertical-preacher-curls-bar'), 0)}"] && app.logs["{LOG(15, EXID(15, 'vertical-preacher-curls-bar'), 0)}"].weight, "{LOG(15, EXID(15, 'preacher-curls-dumbbell-bar'), 0)}" in app.logs]'''), ['55', False], 'a set already ticked moves with it')
    c.eq(p.evaluate(f'() => {{ const e = {DAY(47)}.exercises[7]; return [e.name, e.notes]; }}'), [BAR, 'Seat 3'], 'Day 47: a note you wrote yourself stays')
    c.eq(p.evaluate(f'() => {{ const e = {DAY(63)}.exercises[7]; return [e.name, e.origName]; }}'), ['Spider Curls', BAR], 'Day 63: your swap stays, and swaps back to the bar version')
    c.eq(p.evaluate(f'() => {DAY(31)}.removed[0].ex.name'), BAR, 'Day 31: still removed (puts back the bar version)')
    h = p.evaluate(f'''() => {{ const nm = id => app.sessions.find(s => s.id === id).ex[0].name, lp = app.lastPerf["{BAR}"];
      return [nm("vp-mine"), nm("vp-older"), nm("vp-other"), lp && String(lp[0].weight), app.exNotes["{BAR}"], app.settings.restOverrides["{BAR}"], !!app.prs["{BAR}"], app.lastPerf["{DB}"] === undefined]; }}''')
    c.eq(h, [BAR, BAR, 'Preacher Curls', '55', 'Elbows in', 75, True, True], 'history from this split moves to the bar version (last time 55, note, rest time, PR); another program keeps its own; the dumbbell version starts fresh')
    c.eq(p.evaluate('() => PT.verticalPreacher.run()'), 0, 'it only runs once')
    p.evaluate(f'() => {{ const pr = {PROG}; app.selectProgram(pr, pr.days.find(d => d.dayNumber === 15), true); app.showView("workout"); }}'); p.wait_for_timeout(500)
    t = p.evaluate('() => document.getElementById("exercises-list-container").innerText')
    c.ok(BAR in t and OLD not in t, 'Day 15 shows Vertical Preacher Curls (Bar)')
    c.eq(p.errors, [], 'no errors')

sys.exit(c.done())
