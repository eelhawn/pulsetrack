"""2.97.0 equipment filter: more kit per gym (bench, pull-up bar, TRX, stability ball, medicine ball, foam roller, sled), exercises that need
a bench or a bar, openGym's exact equipment, the picker leaving them out (Show all brings them back) and the workout card saying what is missing."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page

c = Checks('equipment')
ID = 'my_6day_chest_back_legs_sharms'
SHOTS = '/tmp/claude-0/-home-claude/395da5c4-9b49-54b4-93e4-f9926c59aa1c/scratchpad/'

def classify(p, names):
    return p.evaluate('(ns) => ns.map(n => [PT.equipKey(n), PT.equipNeeds(n).sort().join("+")])', names)

def visible(p):
    return p.evaluate('() => [...document.querySelectorAll("#ex-list-container button")].map(b => (b.querySelector("span span") || b).textContent.trim())')

with page() as p:
    c.eq(p.evaluate('() => PT.EQUIP.map(x => x[0]).slice(9)'), ['bench', 'pullup', 'suspension', 'ball', 'medball', 'roller', 'sled'], 'seven more kinds of kit')
    got = classify(p, ['Dumbbell Bench Press', 'Incline Dumbbell Press', 'Hammer Strength Incline Press', 'Smith Machine Incline Press', 'Pull-ups', 'Hanging Leg Raise', 'Assisted Pull-up Machine', 'Push-ups', 'Lat Pulldown', 'Bench Dips'])
    c.eq(got, [['dumbbell', 'bench'], ['dumbbell', 'bench'], ['machine', ''], ['smith', 'bench'], ['bodyweight', 'pullup'], ['bodyweight', 'pullup'], ['machine', ''], ['bodyweight', ''], ['cable', ''], ['bodyweight', '']],
         'what each exercise needs: a bench for bench and incline work (not on a machine), a bar for pull-ups and hanging')
    p.evaluate('() => PT.og.load()'); p.wait_for_function('() => PT.og.list().length > 5000', timeout=15000)
    og = p.evaluate('() => { const f = k => PT.og.list().find(e => e.eq === k).name; return ["suspension trainer", "stability ball", "medicine ball", "resistance band", "sled machine", "leverage machine"].map(f); }')
    c.eq([x[0] for x in classify(p, og)], ['suspension', 'ball', 'medball', 'band', 'sled', 'machine'], 'openGym exercises use openGym\'s own equipment')
    c.eq(p.evaluate('() => PT.gymLacks("Dumbbell Bench Press")'), '', 'a gym with everything lacks nothing')

for w in (390, 360):
    with page(w=w, h=800) as p:
        p.evaluate('() => PT.og.load()'); p.wait_for_function('() => PT.og.list().length > 5000', timeout=15000)
        # the gym editor shows the new kit; untick bench and suspension trainer and save
        p.evaluate('() => PT.openGyms()'); p.wait_for_timeout(250)
        p.click('#pt-gmg [data-ed]'); p.wait_for_timeout(300)
        chips = p.evaluate('() => [...document.querySelectorAll("#pg-eq [data-eq]")].map(b => b.dataset.eq)')
        c.ok(all(k in chips for k in ['bench', 'pullup', 'suspension', 'ball', 'medball', 'roller', 'sled']), '%dpx: the gym editor lists the new kit' % w)
        c.ok(p.evaluate('() => [...document.querySelectorAll("#pg-eq [data-eq]")].every(b => b.getAttribute("aria-pressed") === "true")'), '%dpx: all ticked to start with (nothing is switched off by itself)' % w)
        c.ok(p.evaluate('() => document.documentElement.scrollWidth <= innerWidth + 1'), '%dpx: no sideways scroll' % w)
        p.click('#pg-eq [data-eq="bench"]'); p.click('#pg-eq [data-eq="suspension"]')
        if w == 390:
            p.evaluate('() => document.getElementById("pg-eq").scrollIntoView({ block: "center" })'); p.screenshot(path=SHOTS + 'equip390.png')
        p.click('#pg-save'); p.wait_for_timeout(300)
        c.eq(p.evaluate('() => [PT.gym().equip.bench, PT.gym().equip.suspension, PT.gym().equip.dumbbell]'), [False, False, None], '%dpx: saved: no bench, no TRX, dumbbells still there' % w)
        c.eq(p.evaluate('() => [PT.gymAllows("Dumbbell Bench Press"), PT.gymAllows("Dumbbell Curl"), PT.gymAllows("Hammer Strength Incline Press")]'), [False, True, True], '%dpx: a bench press is out, a curl and a machine press are in' % w)
        # the picker
        p.evaluate(f'() => {{ const pr = app.data.programs.find(x => x.id === "{ID}"); app.selectProgram(pr, null, true); app.activeDay = pr.days[0]; app.showView("workout"); app.openExerciseSelector("add"); }}')
        p.wait_for_timeout(200)
        p.fill('#ex-search-input', 'bench press'); p.wait_for_timeout(250)
        names = visible(p)
        c.ok('Dumbbell Bench Press' not in names and 'Bench Press' not in names, '%dpx: searching "bench press" leaves the bench presses out' % w)
        c.ok(p.evaluate('() => /bench/i.test((document.querySelector("[data-pt-gymbar]") || {}).textContent || "")'), '%dpx: and the bar says it is leaving out what needs a bench' % w)
        p.fill('#ex-search-input', 'suspension'); p.wait_for_timeout(250)
        c.eq(p.evaluate('() => [...document.querySelectorAll(".pt-og-results [data-og]")].filter(b => PT.og.list().find(e => e.og === b.dataset.og).eq === "suspension trainer").length'), 0, '%dpx: no TRX exercises from the openGym library (a cable "suspension" stretch can stay)' % w)
        p.fill('#ex-search-input', 'bench press'); p.wait_for_timeout(200)
        p.evaluate('() => document.querySelector("[data-pt-gymbar] button").click()'); p.wait_for_timeout(250)
        c.ok('Bench Press' in visible(p), '%dpx: Show all brings them back' % w)
        p.fill('#ex-search-input', 'suspension'); p.wait_for_timeout(250)
        c.ok(p.evaluate('() => [...document.querySelectorAll(".pt-og-results [data-og]")].filter(b => PT.og.list().find(e => e.og === b.dataset.og).eq === "suspension trainer").length') > 5, '%dpx: the openGym TRX ones too' % w)
        p.evaluate('() => document.getElementById("modal-ex-selector").classList.add("hidden")')
        # the workout card
        p.evaluate(f'() => {{ const pr = app.data.programs.find(x => x.id === "{ID}"); app.activeDay = pr.days[0]; app.renderWorkoutView(); }}'); p.wait_for_timeout(200)
        txt = p.evaluate('() => [...document.querySelectorAll(".pt-tip-warn")].map(x => x.textContent.trim())')
        c.ok(any(t.startswith('No bench at') for t in txt), '%dpx: a workout card says "No bench at ..." (%s)' % (w, txt[:1]))
        c.eq(p.errors, [], '%dpx: no page errors' % w)

c.done()
