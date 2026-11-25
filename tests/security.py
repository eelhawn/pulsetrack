"""3.27.0 security (the owner: "add stuff so i cant get hacked like protection and stuff and find bugs and fix em up"). docs/SECURITY.md.
  - The page has a Content-Security-Policy: only its own scripts (each inline one by its SHA-256) may run, no pictures from other sites,
    no plug-ins, no <base>, no form posts. Markup that gets into the page (an onerror=, a javascript: link) never runs.
  - Opening every screen breaks nothing under the policy (no blocked script, style, picture or font).
  - Text from a shared program, a backup or a friend's code stays text on the workout screen: the reps text, a typed weight, last time's
    numbers and the log key (3.26.0 put a reps text in the page as markup).
  - A shared program link keeps only safe characters in ids and types.
  - Inside another website's frame PulseTrack hides itself and shows a link instead (clickjacking).
  - Small layout fixes found on the way: the "3 Sets × 6-8" line no longer squeezes into a narrow column next to Form tips / Clips /
    Bar path, a "10-12" reps target fits in the reps box, and a very long word in a name no longer pushes the screen sideways."""
import base64, hashlib, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page, ROOT

c = Checks('security')
ID = 'my_6day_chest_back_legs_sharms'
PROG = f'app.data.programs.find(x => x.id === "{ID}")'
WATCH = "window.__csp = []; document.addEventListener('securitypolicyviolation', e => window.__csp.push(e.violatedDirective + ' ' + String(e.blockedURI).slice(0, 60)));"

# ---- the policy in index.html
html = open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read()
m = re.search(r'<meta http-equiv="Content-Security-Policy" content="([^"]+)">', html)
c.ok(m is not None and html.index(m.group(0)) < html.index('<script'), 'the page has a Content-Security-Policy, before its first script')
pol = dict((d.strip().split(' ', 1) + [''])[:2] for d in (m.group(1) if m else '').split(';') if d.strip())
inline = re.findall(r'<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>', html, re.S | re.I)
hashes = ["'sha256-%s'" % base64.b64encode(hashlib.sha256(s.encode('utf-8')).digest()).decode() for s in inline]
ss = pol.get('script-src', '')
c.ok(len(inline) > 100 and all(h in ss for h in hashes), 'every inline script (%d) is allowed by its own SHA-256' % len(inline))
c.ok('unsafe-inline' not in ss and 'unsafe-eval' not in ss and 'http' not in ss and '*' not in ss, 'scripts: only these and the app\'s own files, nothing inline or from other sites')
c.eq([pol.get('object-src'), pol.get('base-uri'), pol.get('form-action'), pol.get('frame-src')], ["'none'"] * 4, 'no plug-ins, <base>, form posts or frames')
c.eq(pol.get('img-src'), "'self' data: blob:", 'pictures only from the app itself')
c.ok('<meta name="referrer" content="no-referrer">' in html, 'links do not tell other sites where you came from')

with page(w=360) as p:
    p.context.add_init_script(WATCH)
    p.reload()
    p.wait_for_function('typeof PT !== "undefined" && window.app && window.app.data && window.app.data.programs && window.app.data.programs.length')
    p.wait_for_timeout(600)
    # ---- every screen under the policy
    p.evaluate(f'() => {{ app.selectProgram({PROG}, null, true); app.activeDay = {PROG}.days.find(d => d.dayNumber === 1); }}')
    for v in ['home', 'programs', 'days', 'workout', 'progress', 'history', 'body', 'cardio', 'library']:
        p.evaluate('(v) => app.showView(v)', v); p.wait_for_timeout(250)
    p.evaluate('() => { PT.guide && PT.guide.open && PT.guide.open(); }'); p.wait_for_timeout(300)
    c.eq(p.evaluate('() => window.__csp.slice()'), [], 'opening every screen breaks nothing under the policy')
    c.eq(p.errors, [], 'and no errors')
    c.eq(p.evaluate('() => !!PT.security && PT.security.foreign'), False, 'on its own page the app runs normally')

    # ---- markup that gets in does not run
    p.evaluate('''() => { const d = document.createElement("div"); d.id = "pt-sec-test";
      d.innerHTML = '<img src="x-missing.png" onerror="window.__ran = 1"><a id="pt-sec-a" href="javascript:window.__ran2 = 1">x</a>'; document.body.appendChild(d); }''')
    p.wait_for_timeout(300)
    p.evaluate('() => document.getElementById("pt-sec-a").click()'); p.wait_for_timeout(200)
    c.eq(p.evaluate('() => [window.__ran, window.__ran2]'), [None, None], 'an onerror= and a javascript: link put in by innerHTML never run')
    c.ok(any('script-src' in v for v in p.evaluate('() => window.__csp.slice()')), 'the policy blocked them (and said so)')
    p.evaluate('() => { document.getElementById("pt-sec-test").remove(); window.__csp.length = 0; }')
    del p.errors[:]

    # ---- text stays text on the workout screen
    TRAP = '<img src=x id=pwn-{0} onerror=window.__pwn=1>'
    p.evaluate(f'''() => {{ const pr = {PROG}, d = pr.days.find(x => x.dayNumber === 1), e = d.exercises[0], e2 = d.exercises[1];
      e.reps = "{TRAP.format('reps')}"; e2.reps = "8\\" data-pwn=\\"1";
      app.lastPerf[e.name] = [{{ weight: "{TRAP.format('lw')}", reps: "{TRAP.format('lr')}" }}];
      app.logs[app.getLogKey(pr.id, 1, e.id, 1)] = {{ weight: "1\\"><img src=x id=pwn-w>", reps: "2", completed: false, tag: "<img src=x id=pwn-tag>" }};
      app.settings.showLogger = true; app.activeDay = d; app.showView("workout"); }}''')
    p.wait_for_timeout(500)
    got = p.evaluate('() => [...document.querySelectorAll("#exercises-list-container [id^=pwn-], #exercises-list-container [data-pwn]")].map(x => x.id || "data-pwn")')
    c.eq(got, [], 'reps text, last time\'s numbers, a typed weight and a set tag from a backup stay text (no markup)')
    t = p.evaluate('() => document.getElementById("exercises-list-container").innerText')
    c.ok('<img src=x id=pwn-reps' in t, 'the odd reps text is shown as it is')
    c.eq(p.evaluate('() => window.__pwn'), None, 'nothing ran')

    # ---- a shared program keeps only safe characters in ids and types
    p.evaluate('() => { window.__ptDialogHook = (t) => t === "confirm" ? true : undefined; }')
    r = p.evaluate('''async () => { const ok = await app.importProgramObject({ id: 'x" onfocus="y', title: "Link program", days: [{ dayNumber: 1, title: "A",
        exercises: [{ id: 'e1" autofocus onfocus="z', name: "Bench Press", sets: 3, reps: "8", type: 'standard" x="' }] }] });
      const pr = app.data.programs[app.data.programs.length - 1]; return [ok, pr.id, pr.days[0].exercises[0].id, pr.days[0].exercises[0].type]; }''')
    c.eq(r, [True, 'xonfocusy', 'e1autofocusonfocusz', 'standardx'], 'ids and types from a shared program keep only letters, digits, _ and -')
    p.evaluate('() => { window.__ptDialogHook = null; }')

    # ---- inside another website's frame
    url = p.url.split('#')[0]
    f = p.context.new_page()
    f.set_content('<iframe id="pt" src="%s" width="390" height="700"></iframe>' % url)
    f.wait_for_timeout(2500)
    fr = [x for x in f.frames if x.url.startswith(url)]
    txt = fr[0].evaluate('() => document.body.innerText') if fr else ''
    c.ok('only runs on its own page' in txt and 'Start Workout' not in txt, 'inside another site\'s frame the app hides and says why')
    c.ok(fr and fr[0].evaluate('() => { const a = document.querySelector("a"); return !!a && a.target === "_blank" && /noopener/.test(a.rel) && a.href.startsWith(location.origin); }'), 'with a link that opens PulseTrack on its own')
    f.close()

with page(w=360) as p:
    # ---- the sets line and the reps box (360 px)
    p.evaluate(f'() => {{ app.selectProgram({PROG}, null, true); app.settings.showLogger = true; app.activeDay = {PROG}.days.find(d => d.dayNumber === 1); app.showView("workout"); }}')
    p.wait_for_timeout(600)
    lines = p.evaluate('''() => [...document.querySelectorAll("#exercises-list-container .btn-ex-info p.text-xs, #exercises-list-container p.text-xs.text-zinc-400.font-medium")]
      .filter(x => /Sets? ×/.test(x.textContent)).map(x => { const lh = parseFloat(getComputedStyle(x).lineHeight) || 16; return [x.textContent.trim(), Math.round(x.getBoundingClientRect().height / lh)]; })''')
    c.ok(len(lines) >= 6 and all(n == 1 for _, n in lines), 'every "3 Sets × …" line is one line at 360 px (%s)' % [x for x in lines if x[1] != 1][:3])
    fits = p.evaluate('''() => [...document.querySelectorAll('#exercises-list-container input[data-field="reps"]')].map(i => { const cs = getComputedStyle(i), c = document.createElement("canvas").getContext("2d");
      c.font = cs.font; const room = i.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight); return [i.placeholder, Math.round(c.measureText(i.placeholder).width), Math.round(room)]; })''')
    bad = [x for x in fits if x[1] > x[2]]
    c.ok(fits and not bad, 'a reps target like "10-12" fits in the reps box (%s)' % bad[:3])
    c.ok(p.evaluate('() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) <= innerWidth'), 'no sideways scroll')
    # ---- a very long word (no spaces) in a name
    L = 'Supercalifragilisticexpialidocious' * 2
    p.evaluate(f'''(L) => {{ const d = {PROG}.days.find(x => x.dayNumber === 1); d.title = L; d.exercises[0].name = L; d.exercises[0].notes = L; d.exercises[1].reps = L; app.renderWorkoutView(); }}''', L)
    wide = {}
    for v in ('workout', 'days'):
        p.evaluate('(v) => app.showView(v)', v); p.wait_for_timeout(400)
        wide[v] = p.evaluate('() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth')
    c.eq(wide, {'workout': 0, 'days': 0}, 'a 68-letter word in a name breaks onto the next line instead of pushing the screen sideways')
    c.eq(p.errors, [], 'no errors')

with page(w=360) as p:
    # ---- the workout screen with nothing picked (a fresh app, or a coach nudge's Start button)
    vis = '() => [...document.querySelectorAll("[id^=view-]")].filter(v => !v.classList.contains("hidden") && /^view-[a-z]+$/.test(v.id)).map(v => v.id)'
    p.evaluate('() => { app.activeProgram = null; app.activeDay = null; app.showView("workout"); }'); p.wait_for_timeout(400)
    c.eq(p.evaluate(vis), ['view-programs'], 'with no program picked, the workout screen goes to the program list instead of a blank screen')
    p.evaluate(f'() => {{ app.activeProgram = {PROG}; app.activeDay = null; app.showView("workout"); app.renderWorkoutView(); }}'); p.wait_for_timeout(400)
    c.eq(p.evaluate(vis), ['view-days'], 'with a program but no day, it goes to the day list')
    p.evaluate('() => { app.activeDay = null; app.exerciseModalTarget = { action: "add" }; app.handleExerciseSelection("Bench Press"); }'); p.wait_for_timeout(200)
    c.eq(p.errors, [], 'picking an exercise with no day open says so instead of an error')
    # ---- the Goal physique form fits (its Age and Height boxes ran off the sheet)
    p.evaluate('() => app.showView("body")'); p.wait_for_timeout(300)
    p.evaluate('() => document.getElementById("pt-phys-edit").click()'); p.wait_for_timeout(500)
    r = p.evaluate('() => ["pt-pg-age", "pt-pg-h"].map(id => { const r = document.getElementById(id).getBoundingClientRect(); return [Math.round(r.left), Math.round(r.right)]; })')
    c.ok(len(r) == 2 and all(0 <= x[0] and x[1] <= 360 for x in r) and r[0][1] < r[1][0], 'Goal physique: Age and Height sit side by side inside the screen (%s)' % r)
    c.eq(p.errors, [], 'no errors')

sys.exit(c.done())
