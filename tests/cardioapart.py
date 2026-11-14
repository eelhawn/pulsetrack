"""2.102.0 cardio in a workout counts as cardio: a treadmill row is left out of the set bar, the days list and the Ready to save count;
finishing sends it to Cardio & Sports (activity, minutes, distance, a note) and takes it out of the workout; a cardio-only workout is only
cardio; no minutes means nothing is sent; the Settings switch turns it off."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page

c = Checks('cardioapart')
ID = 'my_6day_chest_back_legs_sharms'
PROG = f'app.data.programs.find(x => x.id === "{ID}")'
SHOTS = '/tmp/claude-0/-home-claude/395da5c4-9b49-54b4-93e4-f9926c59aa1c/scratchpad/'

def setup(p, lifts=True, walk='25', dist='1.2'):
    p.evaluate(f'''([lifts, walk, dist]) => {{ const pr = {PROG}; app.selectProgram(pr, null, true); app.activeProgram = pr; app.activeDay = pr.days[3]; app.showView("workout");
      pr.days[3].exercises.forEach(ex => {{ for (let s = 0; s < ex.sets; s++) {{ const k = app.getLogKey(pr.id, 4, ex.id, s);
        if (app.exKind(ex).cardio) {{ if (walk !== null) app.logs[k] = {{ completed: true, min: walk, dist, tag: "R" }}; }}
        else if (lifts) app.logs[k] = {{ completed: true, weight: "0", reps: "15", tag: "R" }}; }} }});
      WorkoutStorage.saveLogs(app.logs); app.renderWorkoutView(); }}''', [lifts, walk, dist])
    p.wait_for_timeout(250)

def finish(p):
    """Finish Workout; when the Ready to save sheet comes up (there are lifting sets), tap Save workout. Returns the sheet's text or ''."""
    p.evaluate('() => { window.__f = app.finishWorkout(); }')
    txt = ''
    try:
        p.wait_for_function('() => !!document.querySelector("#pt-fin [data-fin=yes]")', timeout=2500)
        p.wait_for_timeout(800)
        txt = p.evaluate('() => document.getElementById("pt-fin").innerText.replace(/\\s+/g, " ")')
        p.evaluate('() => document.querySelector("#pt-fin [data-fin=yes]").click()')
    except Exception:
        pass
    p.wait_for_function('() => window.__f && (window.__f.then(() => { window.__fd = 1; }), window.__fd === 1)', timeout=8000)
    p.wait_for_timeout(300)
    return txt

LAST = '() => { const s = app.sessions[app.sessions.length - 1]; return s ? { n: app.sessions.length, sets: s.sets, ex: s.ex.map(e => e.name), cardio: s.cardio || null, id: s.id } : { n: 0 }; }'
LOGS = '() => PT.cardio.data().logs.map(l => ({ act: l.act, name: l.name, sec: l.sec, dist: l.dist || 0, note: l.note || "", wid: l.wid || null }))'

for w in (390, 360):
    with page(w=w, h=800) as p:
        setup(p)
        c.eq(p.evaluate('() => document.querySelector(".pt-sbar-t").textContent'), '6 / 6 sets', '%dpx: the set bar counts the 6 ab sets, not the StairMaster' % w)
        c.ok(p.evaluate('() => /Goes to Cardio & Sports/.test(document.querySelector(".pt-cardio-apart").textContent)'), '%dpx: the StairMaster card says it goes to Cardio & Sports' % w)
        c.ok(p.evaluate('() => document.documentElement.scrollWidth <= innerWidth + 1'), '%dpx: no sideways scroll' % w)
        if w == 390:
            p.evaluate('() => document.querySelector(".pt-cardio-apart").scrollIntoView({ block: "center" })'); p.screenshot(path=SHOTS + 'cardioapart390.png')
        p.evaluate('() => { app.showView("days"); app.renderDaysView(); }'); p.wait_for_timeout(250)
        c.ok(p.evaluate('() => /COMPLETED/.test(app.dom.daysList.querySelector(\'[data-day="4"]\').textContent)'), '%dpx: on the days list Day 4 is COMPLETED with the abs done' % w)
        p.evaluate('() => { app.showView("workout"); app.renderWorkoutView(); }')
        n0 = p.evaluate('() => app.sessions.length')
        txt = finish(p)
        c.ok('6/6' in txt.replace(' ', ''), '%dpx: Ready to save counts 6/6 sets' % w)
        s = p.evaluate(LAST)
        c.eq([s['n'], s['sets'], s['ex']], [n0 + 1, 6, ['Hanging Leg Raises', 'Decline Sit-Ups']], '%dpx: the workout in History has the 6 ab sets and no StairMaster' % w)
        logs = p.evaluate(LOGS)
        c.eq(len(logs), 1, '%dpx: one Cardio & Sports session' % w)
        c.eq([logs[0]['act'], logs[0]['name'], logs[0]['sec'], logs[0]['dist']], ['stairs', 'StairMaster / Stair Climber', 1500, 0], '%dpx: StairMaster, 25 min' % w)
        c.eq([logs[0]['note'], logs[0]['wid'] == s['id'], s['cardio'] and len(s['cardio'])], ['From your workout: Day 4: Core & Cardio', True, 1], '%dpx: it says which workout it came from, and the workout knows it' % w)
        c.eq(p.errors, [], '%dpx: no page errors' % w)

with page() as p:   # only cardio: only a cardio session
    setup(p, lifts=False, walk='30', dist='')
    n0 = p.evaluate('() => app.sessions.length')
    finish(p)
    c.eq(p.evaluate('() => app.sessions.length'), n0, 'a workout that was only cardio adds nothing to History')
    c.eq([(l['act'], l['sec']) for l in p.evaluate(LOGS)], [('stairs', 1800)], 'it is a 30-minute Cardio & Sports session')
    c.eq(p.errors, [], 'no page errors')

with page() as p:   # no minutes: nothing sent
    setup(p, walk='')
    finish(p)
    c.eq(p.evaluate(LOGS), [], 'a StairMaster row with no minutes sends nothing')
    c.eq(p.evaluate(LAST)['ex'], ['Hanging Leg Raises', 'Decline Sit-Ups'], 'and is still not part of the workout')
    c.eq(p.errors, [], 'no page errors')

with page() as p:   # switched off: as before
    p.evaluate('() => app.openSettings()'); p.wait_for_timeout(250)
    c.ok(p.evaluate('() => !!document.querySelector(\'#pt-wscreen [data-v2102="cardioApart"] input[data-opt="cardioApart"]\')'), 'Settings → Workout screen has the switch')
    p.evaluate('() => document.querySelector(\'#pt-wscreen input[data-opt="cardioApart"]\').click()')
    c.eq(p.evaluate('() => app.settings.cardioApart'), False, 'and it turns it off')
    p.evaluate('() => app.closeSettings ? app.closeSettings() : null')
    setup(p)
    c.eq(p.evaluate('() => document.querySelector(".pt-sbar-t").textContent'), '7 / 7 sets', 'off: the StairMaster counts as a set again')
    finish(p)
    s = p.evaluate(LAST)
    c.eq([s['sets'], 'Stairmaster' in s['ex'], p.evaluate(LOGS)], [7, True, []], 'off: it stays in the workout and nothing goes to Cardio & Sports')
    c.eq(p.errors, [], 'no page errors')

c.done()
