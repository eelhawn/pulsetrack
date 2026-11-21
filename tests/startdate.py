"""3.15.0 a start date for the 64-day program: on Ilhaan's 3 Day Split's list of days, Set a start date gives every day its date (Day N =
start + N - 1 days). A box says when it started, Day 64's date and whether you are on your dates, behind or ahead, with Move the dates to
match. Home's "Day 5 of 64" says when that day is due. Kept in settings.startDates (in backups); other programs get nothing."""
import os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page
ROOT = os.path.dirname(os.path.abspath(__file__))

c = Checks('startdate')
ME = 'my_6day_chest_back_legs_sharms'
DS = "(n => { const d = new Date(); d.setDate(d.getDate() + n); return PT.ds(d); })(%d)"
OPEN = '() => { const pr = app.data.programs.find(x => x.id === "%s"); app.selectProgram(pr, null, true); PT.split64fix.jump(5); app.showView("days"); app.renderDaysView(); }' % ME
BOX = '() => { const b = document.getElementById("pt-startdate"); return b && { kind: b.dataset.kind, text: b.innerText, move: !!b.querySelector("[data-start=move]") }; }'
CARD = '(n) => { const s = document.querySelector("#days-list-container [data-day=\\"" + n + "\\"] .pt-sd-d"); return s ? { ds: s.dataset.date, t: s.textContent } : null; }'

with page(w=360) as p:
    p.wait_for_function('() => typeof PT !== "undefined" && !!PT.startDate && !!PT.split64fix', timeout=20000)
    p.evaluate(OPEN); p.wait_for_timeout(400)
    b = p.evaluate(BOX)
    c.ok(b and b['kind'] == 'none' and 'Set a start date' in b['text'], 'the 64-day list of days offers Set a start date')
    c.ok(p.evaluate(CARD, 1) is None, 'no dates on the days until you set one')

    # ---- set it: the sheet starts on the date that makes Up next (Day 5) today
    p.click('#pt-startdate [data-start=set]'); p.wait_for_timeout(400)
    c.eq(p.evaluate('document.getElementById("pt-start-date").value'), p.evaluate(DS % -4), 'the date picker starts so that Up next (Day 5) is today')
    c.ok('Day 64 is' in p.evaluate('document.getElementById("pt-start-end").textContent') and 'is today' in p.evaluate('document.getElementById("pt-start-end").textContent'), 'it says when Day 64 is and that Day 5 is today')
    p.click('#pt-start-save'); p.wait_for_timeout(400)
    c.eq(p.evaluate('app.settings.startDates'), {ME: p.evaluate(DS % -4)}, 'saved in settings.startDates')
    b = p.evaluate(BOX)
    c.ok(b['kind'] == 'on' and 'Today is Day 5' in b['text'] and 'Day 64:' in b['text'], 'the box: started, Day 64, today is Day 5 (%s)' % b['text'].replace('\n', ' | ')[:120])
    c.ok(not b['move'], 'on your dates: nothing to move')
    c.eq([p.evaluate(CARD, 1)['ds'], p.evaluate(CARD, 64)['ds']], [p.evaluate(DS % -4), p.evaluate(DS % 59)], 'Day 1 has the start date, Day 64 the start + 63 days')
    c.ok(p.evaluate(CARD, 5)['t'].strip() == '· Today' and p.evaluate('document.querySelector("[data-day=\\"5\\"]").classList.contains("pt-sd-today")'), "today's day says Today and is marked")
    c.ok(not p.evaluate('JSON.stringify(app.settings.schedule || null)').startswith('[null'), 'the buttons do not touch the training days setting')

    # ---- behind: started 7 days ago, on Day 5
    p.evaluate('(v) => { PT.startDate.set(app.activeProgram, v); app.renderDaysView(); }', p.evaluate(DS % -7)); p.wait_for_timeout(200)
    b = p.evaluate(BOX)
    c.ok(b['kind'] == 'behind' and 'Day 8 today' in b['text'] and '3 days behind' in b['text'] and b['move'], 'three days late: says Day 8 is today, you are on Day 5, 3 days behind, and offers Move')
    p.click('#pt-startdate [data-start=move]'); p.wait_for_timeout(300)
    c.eq(p.evaluate('app.settings.startDates["%s"]' % ME), p.evaluate(DS % -4), 'Move the dates makes Day 5 today')
    c.eq(p.evaluate(BOX)['kind'], 'on', 'and you are on your dates again')
    c.eq(p.evaluate('(app.nextDayOf(app.activeProgram) || {}).dayNumber'), 5, 'moving dates never changes which days are done')

    # ---- ahead, done today, not started yet
    p.evaluate('(v) => { PT.startDate.set(app.activeProgram, v); app.renderDaysView(); }', p.evaluate(DS % -1)); p.wait_for_timeout(200)
    b = p.evaluate(BOX)
    c.ok(b['kind'] == 'ahead' and '2 days ahead' in b['text'], 'started yesterday and already on Day 5: 2 days ahead')
    p.click('#pt-startdate [data-start=move]'); p.wait_for_timeout(300)
    c.eq(p.evaluate('app.settings.startDates["%s"]' % ME), p.evaluate(DS % -3), 'Move makes Day 5 tomorrow (today counts as done)')
    c.ok("Today's workout (Day 4) is done" in p.evaluate(BOX)['text'], 'then: today\'s workout (Day 4) is done, Day 5 is tomorrow')
    p.evaluate('(v) => { PT.split64fix.jump(1); PT.startDate.set(app.activeProgram, v); app.renderDaysView(); }', p.evaluate(DS % 3)); p.wait_for_timeout(200)
    b = p.evaluate(BOX)
    c.ok(b['kind'] == 'soon' and 'in 3 days' in b['text'] and 'Starts' in b['text'], 'a date ahead: Starts ..., Day 1 is in 3 days')

    # ---- change and remove
    p.click('#pt-startdate [data-start=change]'); p.wait_for_timeout(400)
    c.eq(p.evaluate('document.getElementById("pt-start-date").value'), p.evaluate(DS % 3), 'Change opens on the saved date')
    p.click('#pt-start-off'); p.wait_for_timeout(300)
    c.ok(p.evaluate('!("%s" in (app.settings.startDates || {}))' % ME) and p.evaluate(BOX)['kind'] == 'none' and p.evaluate(CARD, 1) is None, 'Remove the dates takes them off')

    # ---- Home
    p.evaluate('(v) => { PT.split64fix.jump(5); PT.startDate.set(app.activeProgram, v); app.showView("home"); app.renderHomeView(); }', p.evaluate(DS % -4)); p.wait_for_timeout(300)
    c.eq(p.evaluate('document.getElementById("home-active-day-badge").textContent'), 'Day 5 of 64 · Today', 'Home says Day 5 of 64 · Today')
    p.evaluate('(v) => { PT.startDate.set(app.activeProgram, v); app.renderHomeView(); }', p.evaluate(DS % -6)); p.wait_for_timeout(200)
    c.ok(p.evaluate('document.getElementById("home-active-day-badge").textContent').startswith('Day 5 of 64 · due '), 'and when you are behind, the date it was due')

    # ---- other programs
    p.evaluate('() => { const pr = app.data.programs.find(x => x.id === "frank_zane_beginner_full_body"); app.selectProgram(pr, null, true); app.showView("days"); app.renderDaysView(); }'); p.wait_for_timeout(300)
    c.ok(not p.evaluate('!!document.getElementById("pt-startdate")') and not p.evaluate('!!document.querySelector(".pt-sd-d")'), 'other programs get no start date box or dates')
    p.evaluate('() => { app.showView("home"); app.renderHomeView(); }'); p.wait_for_timeout(200)
    c.ok(not re.search(r'· (Today|Tomorrow|Yesterday|due )', p.evaluate('document.getElementById("home-active-day-badge").textContent')), 'or dates on Home')

    # ---- fits, survives a reload
    p.evaluate('() => { const pr = app.data.programs.find(x => x.id === "%s"); app.selectProgram(pr, null, true); app.showView("days"); app.renderDaysView(); }' % ME); p.wait_for_timeout(300)
    aud = p.evaluate(open(os.path.join(ROOT, 'fixtures', 'design_audit.js'), encoding='utf-8').read())
    c.eq({k: aud['samples'][k][:3] for k, v in aud['counts'].items() if v}, {}, 'the days list with dates passes the design audit at 360px')
    c.ok(p.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'no sideways scroll')
    p.reload(); p.wait_for_function('() => window.app && app.data && typeof PT !== "undefined" && !!PT.startDate', timeout=20000)
    c.eq(p.evaluate('(app.settings.startDates || {})["%s"]' % ME), p.evaluate(DS % -6), 'the start date is still there after a reload')
    c.eq(p.errors, [], 'no errors')

sys.exit(c.done())
