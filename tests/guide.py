"""3.3.0 the guide (search-based): ask in the Search box. Form questions answer from the exercise list with a safety line;
"where is X" answers from the help index and Take me there opens the screen, the Progress tab, or Settings at the right control;
"what's next" reads the workout in progress; "when did I last ..." reads history; pain, injury and dose questions are referred to a
professional. Fuzzy matching copes with slips and short names. Nothing touches the network."""
import json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page, old8

c = Checks('guide')
ROOT = os.path.dirname(os.path.abspath(__file__))
AUD = open(os.path.join(ROOT, 'fixtures', 'design_audit.js'), encoding='utf-8').read()
ASK = 'async (q) => { const r = await PT.guide.answer(q); return r && { kind: r.kind, title: r.title, nav: (r.actions || []).map(a => a.nav), text: r.text || "", list: r.list || [], note: r.note || "", backend: r.backend, score: r.score }; }'

with page() as p:
    reqs = []
    p.on('request', lambda r: reqs.append(r.url) if not r.url.startswith('http://127.0.0.1') and not r.url.startswith('data:') else None)
    p.wait_for_function('typeof EXERCISE_DATABASE !== "undefined" && EXERCISE_DATABASE.length > 3000', timeout=20000)

    # ---- fuzzy matching
    f = p.evaluate('() => [PT.fuzzy.lev("pulldown", "pulldwn"), PT.fuzzy.wsim("pulld", "pulldown") > .8, PT.fuzzy.toks("How do I do an RDL?").join(" "), PT.fuzzy.toks("DB bench").join(" ")]')
    c.eq(f, [1, True, 'romanian deadlift', 'dumbbell bench'], 'fuzzy basics: one slip, a typed start, short names')

    # ---- answers
    want = [
        ('how do I do a Romanian deadlift?', 'form', 'Romanian Deadlift (RDL)', 'ex:Romanian Deadlift (RDL)'),
        ('how to do rdl', 'form', 'Romanian Deadlift (RDL)', None),
        ('form for lat pulldwn', 'form', 'Lat Pulldown', None),
        ('how to do a pushup', 'form', 'Push-Ups', None),
        ('squat form', 'form', 'Squat', None),
        ('good morning form', 'form', 'Good Mornings', None),
        ('where do I change my rest timer?', 'help', 'Rest timer', 'set:#rest-mode-hint'),
        ('restt timer', 'help', 'Rest timer', None),
        ('where is the plate calculator', 'help', 'Plate calculator', 'click:#btn-drawer-plate-calc'),
        ('change to kg', 'help', 'Units (lb or kg)', None),
        ('how do I back up my data?', 'help', 'Backup and restore', 'set:#btn-export-backup'),
        ('where are my badges', 'help', 'Badges', 'progress:badges'),
        ('how do i add a workout i forgot', 'help', 'Add a past workout', 'view:history#btn-history-add'),
        ('how do I edit an old workout', 'help', 'Edit a past workout', None),
        ('how do i change my weekly goal', 'help', 'Weekly goal', 'set:#setting-weekly-goal'),
        ('dark mode', 'help', 'Appearance', None),
        ('export to excel', 'help', 'Export to a spreadsheet', None),
        ('my knee hurts when I squat', 'safety', None, None),
        ('how much creatine should I take', 'safety', None, None),
        ('can I train with a torn muscle?', 'safety', None, None),
        ('xyzzy plugh', 'none', None, None),
    ]
    for q, kind, title, nav in want:
        r = p.evaluate(ASK, q)
        ok = r and r['kind'] == kind and (title is None or r['title'] == title) and (nav is None or nav in r['nav'])
        c.ok(ok, '"%s" -> %s %s (got %s)' % (q, kind, title or '', r and (r['kind'], r['title'], r['nav'])))
    r = p.evaluate(ASK, 'how do I do a Romanian deadlift?')
    c.ok(len(r['list']) >= 3 and 'doctor' in r['note'] and 'not medical advice' in r['note'], 'a form answer has the steps and the safety line')
    r = p.evaluate(ASK, 'my back hurts')
    c.ok('doctor' in r['text'] and not r['nav'], 'pain gets "see a doctor or a trainer", nothing else')
    c.eq(r['backend'], 'search', 'the answer comes from the phone (search)')

    # ---- history
    p.evaluate('''() => { const d = new Date(Date.now() - 3 * 86400000); app.sessions.push({ id: "g1", v: 1, date: PT.ds(d), ts: d.getTime(), pid: "x", ptitle: "P", day: 1, dtitle: "Push", dur: 3000, unit: "lb",
        ex: [{ name: "Bench Press", sets: [{ w: 185, r: 8, t: "R" }, { w: 185, r: 7, t: "R" }] }], vol: 2775, sets: 2, prs: [], upd: d.getTime() }); app.saveSessions(); app.rebuildPRs(); app.rebuildLastPerfFor(["Bench Press"]); }''')
    r = p.evaluate(ASK, 'when did I last bench?')
    c.ok(r['kind'] == 'history' and r['title'] == 'Bench Press' and '2 sets' in r['text'] and any('185' in x for x in r['list']), 'when did I last bench: the date and the sets (%s)' % r['text'])
    r = p.evaluate(ASK, 'what is my best bench')
    c.ok('Best estimated 1RM' in r['text'], 'my best: the estimated 1RM')

    # ---- what's next
    r = p.evaluate(ASK, "what's next in today's workout?")
    c.eq((r['kind'], r['title']), ('next', 'No program picked'), 'what is next with no program: says so and points to Programs')
    old8(p)
    p.evaluate('''() => { const pr = app.data.programs.find(x => x.id === "my_6day_chest_back_legs_sharms"); app.selectProgram(pr, null, true); app.activeProgram = pr; app.activeDay = pr.days[0]; app.showView("workout");
        const ex = pr.days[0].exercises[0]; for (let s = 0; s < ex.sets; s++) app.logs[app.getLogKey(pr.id, pr.days[0].dayNumber, ex.id, s)] = { completed: true, weight: "100", reps: "10", tag: "R" };
        const e2 = pr.days[0].exercises[1]; app.logs[app.getLogKey(pr.id, pr.days[0].dayNumber, e2.id, 0)] = { completed: true, weight: "80", reps: "10", tag: "R" }; WorkoutStorage.saveLogs(app.logs); }''')
    nx = p.evaluate('() => app.activeDay.exercises[1].name')
    r = p.evaluate(ASK, "what's next?")
    c.ok(r['kind'] == 'next' and r['title'] == 'Up next: ' + nx and r['text'].startswith('Set 2 of'), 'what is next in a workout: the next unfinished set (%s, %s)' % (r['title'], r['text']))

    # ---- every help entry: its own words find it, and Take me there works
    helps = p.evaluate('PT.guide.help().map(h => ({ id: h.id, title: h.title, nav: h.nav }))')
    c.ok(len(helps) >= 70, '%d screens and settings in the help index' % len(helps))
    miss = [h['id'] for h in helps if p.evaluate(ASK, 'where is ' + h['title'])['title'] != h['title'] and h['id'] not in ('guide', 'workout')]   # "where is Today's workout" rightly answers what's next
    c.eq(miss, [], 'asking "where is <name>" finds each help entry')
    bad = []
    for h in helps:
        if not h['nav']: continue
        p.evaluate('() => { document.querySelectorAll("#modal-settings").forEach(m => m.classList.add("hidden")); document.querySelectorAll("[id^=pt-]").forEach(e => { if (e.classList && e.classList.contains("fixed") && !e.classList.contains("hidden") && e.id !== "pt-tabbar") e.classList.add("hidden"); }); try { app.closeSheet(); } catch (e) {} }')
        okk = p.evaluate('(n) => PT.guide.go(n)', h['nav']); p.wait_for_timeout(420)
        kind, arg = h['nav'].split(':', 1)
        if kind == 'set' and arg != '#modal-settings':
            vis = p.evaluate('(s) => { const m = document.getElementById("modal-settings"); const e = m.querySelector(s); if (m.classList.contains("hidden") || !e) return false; for (let d = e.parentElement; d; d = d.parentElement) if (d.tagName === "DETAILS" && !d.open) return false; return true; }', arg)
            if not vis: bad.append(h['id'])
        elif kind == 'view':
            v = arg.split('#')[0]
            shown = p.evaluate('(v) => !document.getElementById("view-" + v).classList.contains("hidden")', v)
            if not shown and not p.evaluate('() => !document.getElementById("view-programs").classList.contains("hidden")'): bad.append(h['id'])
        elif kind == 'progress':
            if p.evaluate('() => (document.querySelector("#pt-ptabs [aria-selected=true]") || {}).dataset?.tab') != arg: bad.append(h['id'])
        elif not okk:
            bad.append(h['id'])
    c.eq(bad, [], 'Take me there opens the right place for every entry')
    c.eq(p.errors, [], 'no errors going everywhere')

    # ---- in the Search sheet
    p.evaluate('() => { document.getElementById("modal-settings").classList.add("hidden"); app.showView("home"); }')
    p.evaluate('PT.guide.open()'); p.wait_for_timeout(300)
    c.ok(p.evaluate('document.querySelectorAll("#pt-gans [data-gex]").length') >= 4, 'the empty Search shows example questions')
    c.ok('Ask' in p.evaluate('document.getElementById("pt-sq").placeholder'), 'the guide opens with an Ask placeholder')
    p.click('#pt-gans [data-gex]'); p.wait_for_timeout(400)
    c.ok(p.evaluate('!!document.querySelector("#pt-gans .pt-ga-card")'), 'tapping an example asks it')
    p.fill('#pt-sq', 'where do I change my rest timer?'); p.press('#pt-sq', 'Enter'); p.wait_for_timeout(400)
    c.eq(p.evaluate('document.querySelector("#pt-gans .pt-ga-t").textContent'), 'Rest timer', 'a question gets an answer card above the results')
    c.ok(p.evaluate('() => { const n = [...document.querySelectorAll("#pt-sout div.text-center")]; return n.every(e => !e.offsetParent); }'), 'no "Nothing found" under an answer')
    for w in (360,):
        c.ok(p.evaluate('() => document.querySelector("#pt-find [data-card]").scrollWidth <= document.querySelector("#pt-find [data-card]").clientWidth + 1'), 'the answer fits')
    r = p.evaluate(AUD); bad = {k: r['samples'][k][:3] for k, v in r['counts'].items() if v}
    c.eq(bad, {}, 'the answer card passes the design audit')
    p.click('#pt-gans [data-gnav="0"]'); p.wait_for_timeout(700)
    c.ok(p.evaluate('() => !document.getElementById("modal-settings").classList.contains("hidden") && !!document.querySelector("#modal-settings .pt-gflash")'), 'Take me there opens Settings and lights up Rest Times')
    p.evaluate('() => document.getElementById("modal-settings").classList.add("hidden")')
    p.evaluate('PT.search.open("bench")'); p.wait_for_timeout(400)
    c.ok(p.evaluate('document.getElementById("pt-gans").innerHTML.trim() === ""'), 'a plain search ("bench") stays a plain search')
    p.evaluate('() => PT.kit.closeSheet(document.getElementById("pt-find"))')
    # the side menu
    p.evaluate('() => app.renderHomeView()')
    c.ok(p.evaluate('!!document.getElementById("pt-drawer-guide")'), 'the side menu has Guide')
    p.evaluate('document.getElementById("pt-drawer-guide").click()'); p.wait_for_timeout(300)
    c.ok(p.evaluate('() => !document.getElementById("pt-find").classList.contains("hidden")'), 'Guide opens the ask box')
    c.eq(reqs, [], 'nothing is fetched from the network')
    c.eq(p.errors, [], 'no errors')

with page(w=360) as p:
    p.evaluate('PT.guide.open()'); p.wait_for_timeout(200)
    p.fill('#pt-sq', 'how do I do a Romanian deadlift?'); p.press('#pt-sq', 'Enter'); p.wait_for_timeout(400)
    c.ok(p.evaluate('() => { const k = document.querySelector("#pt-gans .pt-ga-card"); return !!k && k.getBoundingClientRect().right <= innerWidth + .5; }'), '360px: the answer fits')
    c.eq(p.errors, [], '360px: no errors')

sys.exit(c.done())
