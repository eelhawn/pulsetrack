"""3.18.0 total reps for abs (in place of 3.17.0's counting sheet): every ab exercise done for reps shows the reps logged so far against
what its sets add up to ("Total: 95 of 200-300 reps · 2 of 5 sets"), on its workout card and at the top of Guided mode."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

c = Checks('abtotal')
ME = 'my_6day_chest_back_legs_sharms'
CORE = '() => { const pr = app.data.programs.find(x => x.id === "%s"); app.selectProgram(pr, pr.days[3], true); app.showView("workout"); }' % ME
LINE = '(i) => { const l = document.querySelector(`[data-ex-card="${i}"] .pt-abt`); return l ? l.innerText.replace(/\\s+/g, " ").trim() : null; }'
def log_set(p, card, s, reps):
    p.evaluate('''([i, s, r]) => { const row = document.querySelector(`[data-ex-card="${i}"] .set-row[data-set-index="${s}"]`), inp = row.querySelector('.input-set-field[data-field="reps"]');
      inp.value = String(r); inp.dispatchEvent(new Event("input", { bubbles: true })); row.querySelector(".btn-check-set").click(); }''', [card, s, reps])
    p.wait_for_timeout(250)

with page(w=360, h=780) as p:
    p.wait_for_function('() => typeof PT !== "undefined" && !!PT.abTotals', timeout=20000)
    got = p.evaluate('''() => ["Weighted Decline Sit-Ups", "Captain's Chair Leg Raises", "Russian Twists", "Crunches", "Cable Crunch", "Plank", "Side Plank", "Bench Press", "Back Extension"]
        .filter(n => PT.abTotals.isAbs(n, { name: n, reps: "12" }))''')
    c.eq(got, ["Weighted Decline Sit-Ups", "Captain's Chair Leg Raises", "Russian Twists", "Crunches", "Cable Crunch"], 'ab exercises done for reps; not planks, chest or lower back')

    p.evaluate(CORE); p.wait_for_timeout(600)
    c.eq(p.evaluate('document.querySelectorAll(".pt-rc-btn").length'), 0, 'no counting button any more')
    c.eq([p.evaluate(LINE, i) for i in range(4)], ['Total: 0 of 200-300 reps'] * 3 + [None], 'Day 4: the three ab exercises show Total: 0 of 200-300 reps (5 sets of 40-60), the StairMaster nothing')
    c.ok(p.evaluate('(() => { const l = document.querySelector(\'[data-ex-card="0"] .pt-abt\'), n = l.previousElementSibling; return n && n.innerText.includes("5 Sets"); })()'), 'right under the name and sets')
    log_set(p, 0, 0, 45); log_set(p, 0, 1, 50)
    c.eq(p.evaluate(LINE, 0), 'Total: 95 of 200-300 reps · 2 of 5 sets', 'two sets of 45 and 50: Total 95, 2 of 5 sets')
    c.eq(p.evaluate('document.querySelector(\'[data-ex-card="0"] .pt-abt-bar\').getAttribute("aria-valuenow")'), '95', 'with a bar to the top of the range')
    p.evaluate('''() => { const row = document.querySelector('[data-ex-card="0"] .set-row[data-set-index="1"]'); row.querySelector(".btn-check-set").click(); }'''); p.wait_for_timeout(250)
    c.eq(p.evaluate(LINE, 0), 'Total: 45 of 200-300 reps · 1 of 5 sets', 'unticking a set takes it off the total')
    for s, r in ((1, 50), (2, 55), (3, 52)): log_set(p, 0, s, r)
    c.ok('Total: 202 of 200-300' in p.evaluate(LINE, 0) and p.evaluate('document.querySelector(\'[data-ex-card="0"] .pt-abt\').classList.contains("pt-abt-ok")'), 'past 200 the total shows as reached')

    # ---- Guided mode
    p.evaluate('() => { const b = document.getElementById("pt-guided-open"); if (b) b.click(); }'); p.wait_for_timeout(600)
    g = p.evaluate('() => { const o = document.getElementById("pt-guided"), l = o && o.querySelector(".pt-abt"); return o && { title: o.querySelector(".pt-g-title").textContent, line: l ? l.innerText.replace(/\\s+/g, " ").trim() : null, below: !!(l && l.previousElementSibling && l.previousElementSibling.classList.contains("pt-g-sub")) }; }')
    c.ok(g and g['title'] == 'Weighted Decline Sit-Ups' and g['line'] == 'Total: 202 of 200-300 reps · 4 of 5 sets', 'Guided mode shows the total at the top (%s)' % (g and g['line']))
    c.ok(g and g['below'], 'under the sets line')
    p.evaluate('() => { const r = document.getElementById("pt-g-r"); r.value = "48"; r.dispatchEvent(new Event("input", { bubbles: true })); document.getElementById("pt-g-log").click(); }'); p.wait_for_timeout(800)
    t = p.evaluate('() => { const o = document.getElementById("pt-guided"); return [o.querySelector(".pt-g-title").textContent, (o.querySelector(".pt-abt") || {}).innerText]; }')
    c.ok(p.evaluate(LINE, 0).startswith('Total: 250 of 200-300 reps · 5 of 5 sets'), 'logging the last set in Guided mode adds it (250)')
    c.ok(t[0] == "Captain's Chair Leg Raises" and 'Total: 0 of 200-300 reps' in (t[1] or ''), 'and the next ab exercise shows its own total (%s)' % t[0])
    p.evaluate('() => { const x = document.getElementById("pt-g-close"); if (x) x.click(); }'); p.wait_for_timeout(300)

    aud = p.evaluate(open(os.path.join(ROOT, 'tests', 'fixtures', 'design_audit.js'), encoding='utf-8').read())
    c.eq({k: aud['samples'][k][:3] for k, v in aud['counts'].items() if v}, {}, 'the workout passes the design audit at 360px')
    c.ok(p.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'no sideways scroll')
    p.evaluate('() => { const pr = app.data.programs.find(x => x.id === "%s"); app.selectProgram(pr, pr.days[0], true); app.showView("workout"); }' % ME); p.wait_for_timeout(500)
    c.eq(p.evaluate('document.querySelectorAll(".pt-abt").length'), 0, 'Chest & Back day: no totals')
    c.eq(p.errors, [], 'no errors')

sys.exit(c.done())
