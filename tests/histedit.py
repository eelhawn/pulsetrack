"""3.1.0 history editing: add a past workout from History (with exercises from the usual list and sets), change a workout's day,
start time and length, add and remove sets and exercises, and the length worked out from the sets when it isn't known (and it
follows along when sets are added later, but a typed or timed length never moves on its own). Records and "last time" follow."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page

c = Checks('histedit')
STUB = '''() => { window.__alerts = []; PT.alert = async m => { window.__alerts.push(String(m)); }; }'''
LAST = 'JSON.parse(JSON.stringify(app.sessions.find(s => s.dtitle === "Forgot to log") || null))'

def pick(p, name):
    p.click('#he-addex'); p.wait_for_timeout(200)
    c.ok(p.evaluate('() => { const m = document.getElementById("modal-ex-selector"); return !m.classList.contains("hidden") && +getComputedStyle(m).zIndex > +getComputedStyle(document.getElementById("modal-sheet")).zIndex; }'), 'the exercise list opens above the editor (%s)' % name)
    p.evaluate('(n) => app.handleExerciseSelection(n)', name); p.wait_for_timeout(150)

for w in (390, 360):
    with page(w=w) as p:
        p.evaluate(STUB)
        # ---- estimate
        est = p.evaluate('''() => [PT.histEdit.estimate([]), PT.histEdit.estimate([{ name: "Barbell Bench Press", sets: [{ w: 100, r: 5, t: "R" }] }]),
            PT.histEdit.estimate([{ name: "Barbell Bench Press", sets: [{ w: 100, r: 5, t: "R" }, { w: 100, r: 5, t: "R" }, { w: 100, r: 5, t: "R" }] }, { name: "Barbell Row", sets: [{ w: 100, r: 5, t: "R" }, { w: 100, r: 5, t: "R" }] }]),
            PT.histEdit.estimate([{ name: "StairMaster", k: "c", sets: [{ w: 0, r: 0, t: "R", min: 20 }] }])]''')
        c.eq(est[0], 0, '%dpx: nothing logged, no estimate' % w)
        c.ok(60 <= est[1] < est[2] and est[2] >= 8 * 60, '%dpx: more sets, longer estimate (%s)' % (w, est))
        c.eq(est[3], 20 * 60, '%dpx: cardio counts its own minutes' % w)

        # ---- add a past workout
        p.evaluate('app.showView("history")'); p.wait_for_timeout(200)
        c.ok(p.is_visible('#btn-history-add'), '%dpx: History has + Add a past workout' % w)
        p.click('#btn-history-add'); p.wait_for_timeout(200)
        c.ok(p.evaluate('document.getElementById("sheet-title").textContent') == 'Add a past workout', '%dpx: the editor opens' % w)
        c.ok(p.evaluate('document.getElementById("he-auto").checked'), '%dpx: a new workout starts with "work it out from the sets" on' % w)
        p.click('#he-save'); p.wait_for_timeout(150)
        c.ok(p.evaluate('window.__alerts.length') == 1 and p.evaluate('app.sessions.length') == 0, '%dpx: an empty workout is not saved' % w)
        p.fill('#he-title', 'Forgot to log')
        pick(p, 'Barbell Bench Press')
        p.fill('[data-he="0:0:w"]', '185'); p.fill('[data-he="0:0:r"]', '8')
        p.click('[data-he-addset="0"]'); p.click('[data-he-addset="0"]'); p.wait_for_timeout(100)
        c.eq(p.evaluate('[...document.querySelectorAll("[data-he$=\':w\']")].map(i => i.value)'), ['185', '185', '185'], '%dpx: + Add set copies the set above' % w)
        pick(p, 'StairMaster')
        p.fill('[data-he="1:0:min"]', '20'); p.dispatch_event('[data-he="1:0:min"]', 'change'); p.wait_for_timeout(100)
        lab = p.inner_text('.pt-he-ck span')
        c.ok('about' in lab, '%dpx: the estimate shows while editing (%s)' % (w, lab))
        p.fill('#he-date', '2026-11-10'); p.fill('#he-time', '17:30')
        p.fill('#he-date', '2099-01-01'); p.click('#he-save'); p.wait_for_timeout(150)
        c.ok(p.evaluate('app.sessions.length') == 0 and 'yet' in p.evaluate('window.__alerts.slice(-1)[0]'), '%dpx: a day in the future is refused' % w)
        p.fill('#he-date', '2026-11-10'); p.click('#he-save'); p.wait_for_timeout(300)
        s = p.evaluate(LAST)
        c.ok(s is not None, '%dpx: the workout is saved' % w)
        exp = p.evaluate('PT.histEdit.estimate(app.sessions[0].ex)')
        c.eq((s['date'], s['sets'], s['dur'], s.get('durEst')), ('2026-11-10', 4, exp, 1), '%dpx: day, sets and estimated length are saved' % w)
        c.ok(s['dur'] >= 20 * 60 + 60, '%dpx: the estimate includes the 20 cardio minutes' % w)
        c.ok(p.evaluate('() => { const s = app.sessions[0], d = new Date(s.ts - s.dur * 1000); return d.getHours() === 17 && d.getMinutes() === 30 && PT.ds(d) === "2026-11-10"; }'), '%dpx: it started at 5:30 PM that day' % w)
        c.eq(s['vol'], 185 * 8 * 3, '%dpx: volume is worked out' % w)
        c.eq(s['ex'][1].get('k'), 'c', '%dpx: cardio stays cardio' % w)
        c.ok('Barbell Bench Press' in s['prs'], '%dpx: records are worked out' % w)
        c.eq(p.evaluate('app.lastPerf["Barbell Bench Press"].map(x => x.weight + "x" + x.reps)'), ['185x8'] * 3, '%dpx: "last time" follows the new workout' % w)
        c.ok(p.evaluate('document.querySelectorAll("#history-list .hist-item").length') == 1, '%dpx: it shows in History' % w)
        when = p.evaluate('document.getElementById("pt-he-when") && document.getElementById("pt-he-when").textContent')
        c.ok(when and '5:30' in when and 'about' in when, '%dpx: the sheet says when it was (%s)' % (w, when))

        # ---- edit it: add a set, the estimate follows
        p.click('#ss-edit'); p.wait_for_timeout(200)
        c.ok(p.evaluate('document.getElementById("he-auto").checked'), '%dpx: an estimated length stays estimated' % w)
        p.click('[data-he-addset="0"]'); p.click('#he-save'); p.wait_for_timeout(300)
        s2 = p.evaluate(LAST)
        c.ok(s2['sets'] == 5 and s2['dur'] > s['dur'], '%dpx: adding a set moves an estimated length (%d -> %d)' % (w, s['dur'], s2['dur']))
        c.eq(s2['id'], s['id'], '%dpx: the same workout is changed, not copied' % w)

        # ---- edit: type the length, change day and time, remove the cardio
        p.click('#ss-edit'); p.wait_for_timeout(200)
        p.uncheck('#he-auto'); p.wait_for_timeout(100)
        p.fill('#he-dur', '75'); p.fill('#he-date', '2026-11-08'); p.fill('#he-time', '06:15')
        p.click('[data-he-rmex="1"]'); p.wait_for_timeout(100)
        p.fill('[data-he="0:0:w"]', '195')
        p.click('#he-save'); p.wait_for_timeout(300)
        s3 = p.evaluate(LAST)
        c.eq((s3['date'], s3['dur'], 'durEst' in s3, len(s3['ex']), s3['ex'][0]['sets'][0]['w']), ('2026-11-08', 4500, False, 1, 195), '%dpx: day, typed length, removed exercise and a changed weight are saved' % w)
        c.ok(p.evaluate('() => { const s = app.sessions[0], d = new Date(s.ts - s.dur * 1000); return d.getHours() === 6 && d.getMinutes() === 15; }'), '%dpx: the new start time is kept' % w)
        p.click('#ss-edit'); p.wait_for_timeout(200)
        c.ok(not p.evaluate('document.getElementById("he-auto").checked'), '%dpx: a typed length is not estimated' % w)
        p.click('[data-he-addset="0"]'); p.click('#he-save'); p.wait_for_timeout(300)
        c.eq(p.evaluate(LAST)['dur'], 4500, '%dpx: adding a set leaves a typed length alone' % w)
        c.eq(str(p.evaluate('app.lastPerf["Barbell Bench Press"][0].weight')), '195', '%dpx: "last time" follows the edit' % w)

        # ---- a timed workout: its time tile still works, and Cancel changes nothing
        p.click('#ss-edit'); p.wait_for_timeout(200)
        p.fill('#he-title', 'Changed my mind'); p.click('#he-cancel'); p.wait_for_timeout(200)
        c.ok(p.evaluate(LAST) is not None, '%dpx: Cancel keeps the workout as it was' % w)
        c.ok(p.evaluate('document.documentElement.scrollWidth <= innerWidth'), '%dpx: no sideways scroll' % w)
        p.click('#ss-edit'); p.wait_for_timeout(200)
        c.ok(p.evaluate('() => [...document.querySelectorAll("#sheet-body .pt-he-set")].every(r => r.getBoundingClientRect().right <= innerWidth + .5)'), '%dpx: set rows fit the editor' % w)
        c.eq(p.errors, [], '%dpx: no errors' % w)

sys.exit(c.done())
