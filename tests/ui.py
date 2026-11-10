"""UI polish (2.84.0): the short workout header, the split day title, Up next on Home, the Taken? chip in the top row, one footer row,
no sideways scroll on a small phone, and Gym mode keeps its big buttons."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page

c = Checks('ui')
ID = 'my_6day_chest_back_legs_sharms'
PROG = f'app.data.programs.find(x => x.id === "{ID}")'
SEED = '''() => {
  app.selectProgram(__PROG__, null, true);
  const now = Date.now(), D = 86400000;
  for (let i = 1; i <= 6; i++) { const t = now - i * D * 1.3; app.sessions.push({ id: "a" + i, date: PT.ds(new Date(t)), ts: t, name: "Day " + (i % 6 + 1), ex: [{ name: "Lat Pulldown", sets: [{ weight: "100", reps: "10" }] }], vol: 8000, sets: 18, unit: "lb", prs: [], dur: 4200 }); }
  app.settings.lastBackupAt = 0; app.settings.backupSnoozeUntil = 0;
}'''.replace('__PROG__', PROG)
OPEN_DAY = f'() => {{ app.activeDay = {PROG}.days.find(d => d.dayNumber === 1); app.showView("workout"); }}'
q = lambda p, js: p.evaluate(js)

# ---------------------------------------------------------------- the title helper
with page(w=390, h=844) as p:
    P = lambda t: p.evaluate('(t) => PT.dayTitleParts(t)', t)
    r = P('Day 1: Chest & Back (Antagonist Power & Volume)')
    c.eq([r['main'], r['sub'], r['bare']], ['Day 1: Chest & Back', 'Antagonist Power & Volume', 'Chest & Back'], 'a bracket part is split off, and "Day 1:" is dropped for the top bar')
    r = P('Legs & Calves')
    c.eq([r['main'], r['sub'], r['bare']], ['Legs & Calves', '', 'Legs & Calves'], 'a plain title is left alone')
    r = P('Day 3')
    c.eq(r['bare'], 'Day 3', 'a title that is only "Day 3" is not emptied')
    r = P('(Rest)')
    c.eq([r['main'], r['sub']], ['(Rest)', ''], 'a title that is only a bracket is not split')
    r = P('Push (Heavy) Day (Week A)')
    c.eq([r['main'], r['sub']], ['Push (Heavy) Day', 'Week A'], 'only the last bracket is split off')
    r = P('Pull — Back & Biceps')
    c.eq(r['bare'], 'Pull — Back & Biceps', 'a dash inside the name is kept')

# ---------------------------------------------------------------- Home, workout screen, both themes and two phone widths
for mode in ('dark', 'light'):
    for w, h in ((390, 844), (360, 780)):
        tag = f'{mode} {w}px'
        with page(w=w, h=h) as p:
            p.evaluate(SEED)
            if mode == 'light':
                p.evaluate('() => { app.settings.theme = "light"; app.saveAppearance(); }')
            # ------------------------------------------------ Home
            p.evaluate('() => { app.showView("home"); app.renderHomeView(); }'); p.wait_for_timeout(300)
            un = p.evaluate('''() => { const b = document.getElementById("home-up-next"); const t = b.querySelector(".pt-un-top"), n = b.querySelector(".pt-un-name"), s = b.querySelector(".pt-un-sub");
              return { top: t && t.textContent.trim(), name: n && n.textContent.trim(), sub: s && s.textContent.trim(), txt: b.textContent.replace(/\\s+/g, " ").trim() }; }''')
            c.ok(un['top'] and un['top'].startswith('Up next') and 'exercises' in un['top'], f'{tag}: Up next shows the exercise count on its own line ({un["top"]})')
            c.eq(un['name'], 'Day 1: Chest & Back', f'{tag}: Up next shows the day name without the bracket')
            c.eq(un['sub'], 'Antagonist Power & Volume', f'{tag}: and the bracket part under it')
            c.ok(not un['txt'].rstrip().endswith('·'), f'{tag}: no stray dot at the end of Up next')
            t = p.evaluate('() => { const e = document.getElementById("home-program-title"); const lh = parseFloat(getComputedStyle(e).lineHeight) || 24; return { nb: e.textContent.includes("\\u00a0&\\u00a0"), lines: Math.round(e.getBoundingClientRect().height / lh) }; }')
            c.ok(t['nb'], f'{tag}: "Chest & Back" in the program name stays together')
            c.ok(t['lines'] <= 2, f'{tag}: the program name is at most 2 lines ({t["lines"]})')
            c.ok('Saved only on this phone' in p.evaluate('() => document.body.innerText'), f'{tag}: the backup reminder is the short one')
            c.eq(p.evaluate('() => document.documentElement.scrollWidth <= window.innerWidth'), True, f'{tag}: Home does not scroll sideways')
            # ------------------------------------------------ the workout screen
            p.evaluate(OPEN_DAY); p.wait_for_timeout(400)
            hd = p.evaluate('''() => { const t = document.getElementById("header-title"), b = document.getElementById("header-breadcrumb");
              return { title: t.textContent, crumb: b.textContent, tCut: t.scrollWidth > t.clientWidth + 1, bCut: b.scrollWidth > b.clientWidth + 1, tAttr: t.title }; }''')
            c.eq(hd['title'], 'Chest & Back', f'{tag}: the top bar shows the short name')
            c.eq(hd['crumb'], 'Week 1 · Day 1', f'{tag}: and the week and day under it')
            c.ok(not hd['tCut'] and not hd['bCut'], f'{tag}: neither line of the top bar is cut off ({hd})')
            c.ok('Antagonist' in hd['tAttr'], f'{tag}: the full name is still the tooltip')
            dc = p.evaluate('''() => { const h = document.getElementById("workout-day-title"), card = h.parentElement.parentElement, s = h.querySelector(".pt-daysub");
              return { cls: card.classList.contains("pt-daycard"), main: h.firstChild.textContent.trim(), sub: s && s.textContent, h: Math.round(card.getBoundingClientRect().height) }; }''')
            c.ok(dc['cls'], f'{tag}: the day card is the compact one')
            c.eq([dc['main'], dc['sub']], ['Day 1: Chest & Back', 'Antagonist Power & Volume'], f'{tag}: the day card has the name and the bracket part under it')
            c.ok(dc['h'] <= 90, f'{tag}: the day card is short ({dc["h"]}px)')
            ex = p.evaluate('''() => { const card = document.querySelector('[data-ex-card="0"]'), rest = card.querySelector(".btn-rest-edit"), taken = card.querySelector(".pt-taken"), add = card.querySelector(".btn-add-set"), tm = card.querySelector(".btn-rest-ex");
              return { chipThere: !!taken, sameRow: !!taken && taken.parentElement === rest.parentElement, inFooter: !!taken && !!add && add.parentElement.contains(taken), taken: taken && taken.getBoundingClientRect().top, rest: rest.getBoundingClientRect().top,
                addTop: add.getBoundingClientRect().top, tmTop: tm.getBoundingClientRect().top, rowH: [...card.querySelectorAll(".set-row")].map(r => Math.round(r.getBoundingClientRect().height)) }; }''')
            c.ok(ex['chipThere'], f'{tag}: the Taken? button is on the lat pulldown')
            c.ok(ex['sameRow'] and not ex['inFooter'], f'{tag}: it is in the row with the rest time, not in the bottom row')
            c.ok(abs(ex['taken'] - ex['rest']) < 6, f'{tag}: the two sit on one line')
            if w >= 390:
                c.ok(abs(ex['addTop'] - ex['tmTop']) < 6, f'{tag}: the bottom row (timer, Last, note, − Set, + Set) is one line')
            c.ok(ex['rowH'] and min(ex['rowH']) >= 44, f'{tag}: set rows are still big enough to tap ({min(ex["rowH"]) if ex["rowH"] else None}px)')
            c.eq(p.evaluate('() => document.documentElement.scrollWidth <= window.innerWidth'), True, f'{tag}: the workout screen does not scroll sideways')
            # a swap keeps the chip in the top row, in its "back" form
            p.evaluate('() => PT.taken.swap(0)'); p.wait_for_timeout(300)
            sw = p.evaluate('''() => { const card = document.querySelector('[data-ex-card="0"]'), rest = card.querySelector(".btn-rest-edit"), back = card.querySelector(".pt-taken-back");
              return { back: !!back, row: !!back && back.parentElement === rest.parentElement, title: document.getElementById("header-title").textContent }; }''')
            c.ok(sw['back'] and sw['row'], f'{tag}: after a swap, "back to the original" is in the top row too')
            c.eq(sw['title'], 'Chest & Back', f'{tag}: the top bar title survives a redraw')
            if w == 390 and mode == 'dark':
                # Gym mode keeps its big buttons
                p.evaluate('() => { document.body.classList.add("pt-gym"); }')
                pad = p.evaluate('() => parseFloat(getComputedStyle(document.querySelector("[data-ex-card] .btn-add-set")).paddingLeft)')
                c.ok(pad >= 14, f'{tag}: Gym mode keeps its large + Set button ({pad}px of side padding)')
                p.evaluate('() => { document.body.classList.remove("pt-gym"); }')
            c.eq(p.errors, [], f'{tag}: no page errors')

# ---------------------------------------------------------------- Freestyle and a program without a bracket
with page(w=390, h=844) as p:
    p.evaluate(SEED)
    p.evaluate('() => { const d = ' + PROG + '.days.find(x => x.dayNumber === 2); d.title = "Day 2: Legs"; app.activeDay = d; app.showView("workout"); }'); p.wait_for_timeout(300)
    c.eq(p.evaluate('() => [document.getElementById("header-title").textContent, !!document.querySelector("#workout-day-title .pt-daysub")]'), ['Legs', False], 'a day with no bracket: short name in the bar, no second line on the card')
    p.evaluate('async () => { await app.startEmptyWorkout(); }'); p.wait_for_timeout(500)
    c.eq(p.evaluate('() => [document.getElementById("header-title").textContent, document.getElementById("header-breadcrumb").textContent]'), ['Freestyle', 'Freestyle'], 'Freestyle keeps its own name in the top bar and under it')
    c.eq(p.errors, [], 'no page errors')

c.done()
