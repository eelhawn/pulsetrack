"""2.68.0 training calendar: dates, weekdays, the .ics file, and the sheet from Programs -> ... -> Add to my calendar."""
import os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page

c = Checks('calendar')

def unfold(text):
    return re.sub(r'\r\n[ \t]', '', text)

def events(text):
    out = []
    for blk in re.findall(r'BEGIN:VEVENT\r\n(.*?)\r\nEND:VEVENT', unfold(text), re.S):
        d = {}
        for line in blk.split('\r\n'):
            if ':' in line and not line.startswith(('BEGIN', 'END', 'ACTION', 'TRIGGER', 'DESCRIPTION:' + 'x')):
                k, v = line.split(':', 1)
                d.setdefault(k, v)
        out.append((d, blk))
    return out

WD = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
def dow(stamp):
    import datetime
    return datetime.date(int(stamp[0:4]), int(stamp[4:6]), int(stamp[6:8])).weekday()

with page() as p:
    # ---- every program makes a sensible plan and a valid file
    res = p.evaluate('''() => app.data.programs.map(prog => {
      try {
        const d = PT.calendar.defaults(prog), pl = PT.calendar.plan(prog, d), txt = PT.calendar.ics(prog, pl.evs, d);
        return { id: prog.id, n: pl.evs.length, text: txt, named: pl.named, weeks: d.weeks, max: pl.max,
                 dates: pl.evs.map(e => e.date.getFullYear() * 10000 + (e.date.getMonth() + 1) * 100 + e.date.getDate()) };
      } catch (e) { return { id: prog.id, err: String(e) }; }
    })''')
    c.eq(len(res), 59, 'every program was planned')
    for r in res:
        if 'err' in r:
            c.ok(False, '%s: %s' % (r['id'], r['err'])); continue
        t = r['text']
        c.ok(r['n'] > 0, '%s has workouts to add' % r['id'])
        c.ok(t.startswith('BEGIN:VCALENDAR\r\n') and t.endswith('END:VCALENDAR\r\n'), '%s: calendar wrapper' % r['id'])
        c.ok('\n' not in t.replace('\r\n', ''), '%s: only CRLF line ends' % r['id'])
        c.ok(all(len(l.encode('utf-8')) <= 75 for l in t.split('\r\n')), '%s: lines folded to 75 bytes' % r['id'])
        ev = events(t)
        c.eq(len(ev), r['n'], '%s: one event per workout' % r['id'])
        c.eq(len({d['UID'] for d, _ in ev}), r['n'], '%s: unique UIDs' % r['id'])
        c.ok(all(re.fullmatch(r'\d{8}T\d{6}', d['DTSTART']) and re.fullmatch(r'\d{8}T\d{6}', d['DTEND']) and d['DTEND'] > d['DTSTART'] for d, _ in ev), '%s: times well formed' % r['id'])
        c.ok(all(re.fullmatch(r'\d{8}T\d{6}Z', d['DTSTAMP']) for d, _ in ev), '%s: DTSTAMP in UTC' % r['id'])
        c.eq(t.count('BEGIN:VALARM'), r['n'], '%s: a reminder on each' % r['id'])
        ds = r['dates']
        c.ok(all(ds[i] <= ds[i + 1] for i in range(len(ds) - 1)), '%s: dates never go backwards' % r['id'])
        c.ok(all(ds.count(x) <= 2 for x in set(ds)), '%s: at most two workouts on a day' % r['id'])

    # ---- weekdays: a program that names them keeps them; others follow the chosen days
    r = p.evaluate('''() => { const prog = app.data.programs.find(x => x.id === "frank_zane_beginner_full_body");
      const pl = PT.calendar.plan(prog, { start: "2026-11-04", time: "18:00", remind: 30, weeks: 2, days: [1, 3] });   // wrong days on purpose
      return { named: pl.named, wd: pl.evs.map(e => (e.date.getDay() + 6) % 7), n: pl.evs.length, titles: pl.evs.slice(0, 3).map(e => e.title) }; }''')
    c.ok(r['named'], 'Frank Zane names its weekdays')
    c.eq(r['wd'], [0, 2, 4, 0, 2, 4], 'named weekdays win over the chosen ones (Mon Wed Fri)')
    c.ok(all(t == 'Full Body' for t in r['titles']), 'titles lose the weekday prefix: %r' % r['titles'])
    r = p.evaluate('''() => { const prog = app.data.programs.find(x => x.id === "kai_greene_beast_beach_6wk");
      const pl = PT.calendar.plan(prog, { start: "2026-11-04", time: "07:30", remind: 0, weeks: 1, days: [1, 3, 5] });
      return { named: pl.named, wd: pl.evs.map(e => (e.date.getDay() + 6) % 7), first: pl.evs[0].date.toDateString(), n: pl.evs.length, perWeek: pl.perWeek, t: PT.calendar.ics(prog, pl.evs, { remind: 0 }) }; }''')
    c.ok(not r['named'], 'Kai Greene does not name weekdays')
    c.eq(r['wd'][:6], [3, 5, 1, 3, 5, 1], 'unnamed programs follow the chosen days (Tue Thu Sat), starting on the first one on or after the start date')
    c.eq(r['first'], 'Thu Nov 05 2026', 'first workout is the first chosen day on or after the start date')
    c.ok('TRIGGER:PT0S' in r['t'], 'reminder at the start')
    c.ok('DTSTART:20261105T073000' in r['t'], 'time is kept as floating local time')
    # ---- two sessions in a day (AM then PM) land on one date, morning earlier
    r = p.evaluate('''() => { const prog = app.data.programs.find(x => x.id === "arnold_double_split_6day");
      const pl = PT.calendar.plan(prog, { start: "2026-11-09", time: "18:00", remind: 15, weeks: 1, days: [0, 1, 2, 3, 4, 5] });
      return pl.evs.slice(0, 4).map(e => [e.date.toDateString().slice(0, 10), e.h + ":" + e.m, e.title]); }''')
    c.eq(r[0][0], r[1][0], 'AM and PM sessions share a day')
    c.eq(r[0][1], '7:0', 'AM session at 07:00')
    c.eq(r[1][1], '18:0', 'PM session at the chosen time')
    # ---- special characters survive: commas, semicolons, backslashes, accents, emoji
    t = p.evaluate('''() => { const prog = { id: "x y", title: "Push; Pull, Legs \\\\ é 💪", days: [{ dayNumber: 1, title: "Monday: A, B; C", estimatedMinutes: 45, exercises: [{ name: "Curl; hammer, \\\\ ü", sets: 3, reps: "8-10" }] }] };
      const evs = [{ n: 1, date: new Date(2026, 10, 9, 12), h: 18, m: 0, mins: 45, week: 1, weeks: 0, day: prog.days[0], title: "A, B; C" }];
      return PT.calendar.ics(prog, evs, { remind: -1 }); }''')
    u = unfold(t)
    c.ok(r'SUMMARY:A\, B\; C (PulseTrack)' in u, 'SUMMARY escapes , and ;')
    c.ok(r'Curl\; hammer\, \\ ü' in u, 'DESCRIPTION escapes ; , and backslash and keeps accents')
    c.ok('VALARM' not in t, 'no reminder when None is chosen')
    c.ok('UID:pt-cal-xy-1@pulsetrack.local' in t, 'UID is made of safe characters')

    # ---- the sheet itself
    p.evaluate('app.showView("programs")')
    p.wait_for_selector('.pgx-pr[data-pid="frank_zane_beginner_full_body"]')
    p.click('.pgx-pr[data-pid="frank_zane_beginner_full_body"] .pgx-more')
    p.wait_for_selector('[data-act="calendar"]')
    c.ok(p.locator('[data-act="calendar"]').inner_text().strip().endswith('Add to my calendar'), 'menu row says Add to my calendar')
    p.click('[data-act="calendar"]')
    p.wait_for_selector('#pt-cal:not(.hidden) #pt-cal-go')
    c.ok(p.locator('#pt-cal-daybox').is_hidden(), 'weekday buttons hidden for a program that names its days')
    c.ok(p.locator('#pt-cal-named').is_visible(), 'note about named days shown')
    p.fill('#pt-cal-date', '2026-11-09')
    p.fill('#pt-cal-time', '06:15')
    p.select_option('#pt-cal-rem', '60')
    c.eq(p.inner_text('#pt-cal-wn'), '8 weeks', 'a program with 8 weeks starts at all 8')
    c.ok(p.locator('[data-cal-w="1"]').is_disabled(), 'plus is disabled at the last week')
    for _ in range(9):
        if p.locator('[data-cal-w="-1"]').is_enabled():
            p.click('[data-cal-w="-1"]')
    c.eq(p.inner_text('#pt-cal-wn'), '1 week', 'weeks stop at one')
    p.click('[data-cal-w="1"]')
    c.eq(p.inner_text('#pt-cal-wn'), '2 weeks', 'plus adds a week')
    summary = p.inner_text('#pt-cal-sum')
    c.ok('6 workouts' in summary, 'summary counts 6 workouts for 2 weeks of 3: %r' % summary)
    c.ok('Mon' in summary and '06:15' in summary, 'summary lists the first workouts with the time')
    with p.expect_download() as dl:
        p.click('#pt-cal-go')
    d = dl.value
    c.eq(d.suggested_filename, 'pulsetrack-frank-zane-beginner-full-body.ics', 'file name')
    text = open(d.path(), encoding='utf-8', newline='').read()
    ev = events(text)
    c.eq(len(ev), 6, 'file has 6 events')
    c.eq([dow(e['DTSTART']) for e, _ in ev], [0, 2, 4, 0, 2, 4], 'events on Mon Wed Fri')
    c.ok(all(e['DTSTART'].endswith('T061500') for e, _ in ev), 'events at 06:15')
    c.ok('TRIGGER:-PT60M' in text, '1 hour reminder')
    c.ok('Week 1' in unfold(text) and 'Frank Zane' in unfold(text), 'notes name the program and week')
    p.wait_for_timeout(300)
    c.ok(p.locator('#pt-cal').evaluate('e => e.classList.contains("hidden")'), 'sheet closes after saving')
    c.ok('.ics' in p.inner_text('#pt-toast-msg'), 'a toast says what was saved')
    saved = p.evaluate('app.settings.calendar')
    c.eq((saved['time'], saved['remind']), ('06:15', 60), 'time and reminder are remembered')
    # ---- an unnamed program shows the weekday buttons and the mismatch note
    p.click('.pgx-pr[data-pid="kai_greene_beast_beach_6wk"] .pgx-more') if p.locator('.pgx-pr[data-pid="kai_greene_beast_beach_6wk"] .pgx-more').count() else p.evaluate('PT.calendar.open("kai_greene_beast_beach_6wk")')
    if p.locator('[data-act="calendar"]').count():
        p.click('[data-act="calendar"]')
    p.wait_for_selector('#pt-cal:not(.hidden) #pt-cal-go')
    c.ok(p.locator('#pt-cal-daybox').is_visible(), 'weekday buttons shown for a program without weekdays')
    on = p.evaluate('[...document.querySelectorAll("#pt-cal [data-cal-d].on")].length')
    c.eq(on, 6, 'six usual days are pre-picked for a six-workout week')
    p.click('#pt-cal [data-cal-d="5"]')
    c.ok('you picked 5' in p.inner_text('#pt-cal-sum'), 'the note appears when the days do not match')
    for i in range(7):
        p.click('#pt-cal [data-cal-d="%d"]' % i) if p.evaluate('document.querySelectorAll("#pt-cal [data-cal-d].on").length') > 1 else None
    c.eq(p.evaluate('document.querySelectorAll("#pt-cal [data-cal-d].on").length'), 1, 'at least one day always stays picked')
    p.click('#pt-cal [data-close]')
    p.wait_for_timeout(200)
    # ---- Freestyle has nothing to add
    p.evaluate('PT.calendar.open(app.data.programs.find(x => x.id === "freestyle") || { id: "freestyle", days: [] })')
    c.ok(p.locator('#pt-cal').evaluate('e => e.classList.contains("hidden")'), 'Freestyle does not open the sheet')
    c.eq(p.errors, [], 'no page errors or console errors')
c.done()
