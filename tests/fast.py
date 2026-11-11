"""2.91.0 faster set entry: one-tap log of an empty set from last time, the quick +/- buttons while typing, and their switches."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page

c = Checks('fast')
ID = 'my_6day_chest_back_legs_sharms'
PROG = f'app.data.programs.find(x => x.id === "{ID}")'
DAY1 = f'{PROG}.days.find(d => d.dayNumber === 1)'
EXID = lambda name: f'{DAY1}.exercises.find(e => e.name === "{name}").id'
KEY = lambda name, s: f'"{ID}_d1_" + {EXID(name)} + "_s{s}"'
LP = 'Lat Pulldown'
ROW = lambda s: f'document.querySelector(\'[data-ex-card="\' + {DAY1}.exercises.findIndex(e => e.name === "{LP}") + \'"] .set-row[data-set-index="{s}"]\')'


def log(p, s, name=LP):
    return p.evaluate(f'() => {{ const e = app.logs[{KEY(name, s)}]; return e ? [e.weight, e.reps, !!e.completed] : null; }}')


def check(p, s):
    p.evaluate(f'() => {ROW(s)}.querySelector(".btn-check-set").scrollIntoView({{ block: "center" }})')
    p.click(f'[data-key="{p.evaluate("() => " + KEY(LP, s))}"].btn-check-set')
    p.wait_for_timeout(150)


for w in (390, 360):
    with page(w=w, h=800) as p:
        p.evaluate(f'''() => {{
          app.selectProgram({PROG}, null, true); PT.setOpt("autoPrefill", false); PT.setOpt("autoFill", false);
          app.lastPerf["{LP}"] = [{{ weight: "100", reps: "10" }}, {{ weight: "100", reps: "9" }}, {{ weight: "95", reps: "8" }}];
          app.lastPerf["Pull-ups"] = [{{ weight: "0", reps: "12", bz: 1 }}];
          WorkoutStorage.saveLastPerf(app.lastPerf);
          app.activeDay = {DAY1}; app.showView("workout");
        }}''')
        p.wait_for_timeout(300)
        # ---------------------------------------------------------------- one-tap log
        check(p, 0)
        c.eq(log(p, 0), ['100', '10', True], '%dpx: ✓ on an empty set logs last time\'s numbers' % w)
        c.eq(p.evaluate(f'() => {ROW(0)}.querySelector(\'input[data-field="weight"]\').value'), '100', '%dpx: and the box shows them' % w)
        p.evaluate(f'() => {{ app.logs[{KEY(LP, 1)}] = {{ completed: false, weight: "110", reps: "", tag: "R" }}; app.renderWorkoutView(); }}')
        check(p, 1)
        c.eq(log(p, 1), ['110', '9', True], '%dpx: a box you typed in keeps your number, the empty one gets last time\'s' % w)
        check(p, 3)
        c.eq(log(p, 3), ['95', '8', True], '%dpx: a set past last time\'s count uses last time\'s last set' % w)
        check(p, 3)
        c.eq(log(p, 3), ['95', '8', False], '%dpx: unticking keeps the numbers' % w)
        c.ok(p.evaluate('() => (app.settings.oneTapTold || 0) >= 1'), '%dpx: it says what it did (the first times)' % w)
        # no history: as before
        other = p.evaluate(f'() => {DAY1}.exercises.find(e => !app.lastPerf[e.name] && !app.exKind(e).cardio).name')
        okey = p.evaluate(f'(n) => "{ID}_d1_" + {DAY1}.exercises.find(e => e.name === n).id + "_s0"', other)
        p.evaluate('(k) => { const b = document.querySelector(`.btn-check-set[data-key="${k}"]`); b.scrollIntoView({ block: "center" }); b.click(); }', okey)
        p.wait_for_timeout(150)
        c.eq(p.evaluate('(k) => { const e = app.logs[k]; return [e.weight, e.reps]; }', okey), ['', ''], '%dpx: no last time: nothing is made up' % w)
        # the switch
        p.evaluate(f'() => {{ PT.setOpt("oneTap", false); delete app.logs[{KEY(LP, 2)}]; app.renderWorkoutView(); }}')
        check(p, 2)
        c.eq(log(p, 2), ['', '', True], '%dpx: with One-tap log off, an empty ✓ works as before' % w)
        p.evaluate('() => PT.setOpt("oneTap", true)')
        # warm-up and bodyweight
        r = p.evaluate('''() => { const ex = { id: "x", name: "Pull-ups", sets: 2, reps: "8-12" }; const k = "kx";
          app.logs[k] = { completed: false, weight: "", reps: "", tag: "W" }; const w = PT.fastEntry.fill(k, ex, 0);
          app.logs.k2 = { completed: false, weight: "", reps: "", tag: "R" }; const r = PT.fastEntry.fill("k2", ex, 0); return [w, app.logs.k2.weight, app.logs.k2.reps]; }''')
        c.eq(r, [None, '0', '12'], '%dpx: a warm-up only copies a warm-up; a bodyweight set copies BW (0) and the reps' % w)
        # ---------------------------------------------------------------- quick +/- buttons
        p.evaluate(f'() => {{ delete app.logs[{KEY(LP, 2)}]; app.renderWorkoutView(); }}')
        sel = f'() => {ROW(2)}.querySelector(\'input[data-field="weight"]\')'
        p.evaluate(f'() => {{ const i = ({sel})(); i.scrollIntoView({{ block: "center" }}); }}')
        p.evaluate(f'() => ({sel})().focus()')
        p.wait_for_timeout(80)
        c.eq(p.evaluate(f'() => !!{ROW(2)}.querySelector(".pt-qa")'), True, '%dpx: typing in a box shows the quick buttons under that set' % w)
        c.eq(p.evaluate('() => document.querySelectorAll(".pt-qa").length'), 1, '%dpx: only under that set' % w)
        p.click('.pt-qa [data-qa="w"][data-d="1"]')
        c.eq(log(p, 2)[:2], ['100', ''], '%dpx: +5 starts from the grey number (95) and saves it' % w)
        c.eq(p.evaluate('() => document.activeElement && document.activeElement.dataset.field'), 'weight', '%dpx: the box keeps the focus (keyboard stays up)' % w)
        p.click('.pt-qa [data-qa="w"][data-d="-1"]'); p.click('.pt-qa [data-qa="w"][data-d="-1"]')
        c.eq(log(p, 2)[0], '90', '%dpx: −5 twice' % w)
        p.click('.pt-qa [data-qa="r"][data-d="1"]')
        c.eq(log(p, 2)[1], '9', '%dpx: +1 rep starts from the grey reps (8)' % w)
        c.eq(p.evaluate(f'() => {ROW(2)}.querySelector(\'input[data-field="reps"]\').value'), '9', '%dpx: and shows it' % w)
        bar = p.evaluate('() => { const b = document.querySelector(".pt-qa").getBoundingClientRect(); return [b.left >= 0, b.right <= innerWidth + 1, b.height < 48]; }')
        c.eq(bar, [True, True, True], '%dpx: the row fits and stays slim' % w)
        c.ok(p.evaluate('() => document.documentElement.scrollWidth <= innerWidth + 1'), '%dpx: no sideways scroll' % w)
        if w == 390:
            p.screenshot(path='/tmp/claude-0/-home-claude/395da5c4-9b49-54b4-93e4-f9926c59aa1c/scratchpad/fast390.png')
        p.evaluate('() => document.activeElement.blur()')
        p.wait_for_timeout(50)
        c.eq(p.evaluate('() => document.querySelectorAll(".pt-qa").length'), 0, '%dpx: it goes away when you leave the box' % w)
        p.evaluate('() => PT.setOpt("quickAdj", false)')
        p.evaluate(f'() => ({sel})().focus()')
        c.eq(p.evaluate('() => document.querySelectorAll(".pt-qa").length'), 0, '%dpx: switched off, no buttons' % w)
        p.evaluate('() => { document.activeElement.blur(); PT.setOpt("quickAdj", true); }')
        # ---------------------------------------------------------------- Settings
        p.evaluate('() => app.openSettings()')
        p.wait_for_timeout(250)
        c.eq(p.evaluate('() => [...document.querySelectorAll("#pt-wscreen [data-v291]")].map(x => x.dataset.v291)'), ['oneTap', 'quickAdj'], '%dpx: both switches are in Settings → Workout screen' % w)
        p.evaluate('() => { const i = document.querySelector(\'#pt-wscreen input[data-opt="oneTap"]\'); i.click(); }')
        c.eq(p.evaluate('() => app.settings.oneTap'), False, '%dpx: and they work' % w)
        c.eq(p.errors, [], '%dpx: no page errors' % w)

c.done()
