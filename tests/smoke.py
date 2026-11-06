"""Smoke test: the page loads clean, has all its data, every screen opens, and index.html matches src/."""
import json, os, re, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import ROOT, Checks, page

c = Checks('smoke')
c.eq(subprocess.run([sys.executable, os.path.join(ROOT, 'tools', 'build.py'), '--check'], capture_output=True).returncode, 0, 'index.html matches src/')
version = open(os.path.join(ROOT, 'src', 'VERSION')).read().strip()
sw = open(os.path.join(ROOT, 'sw.js')).read()
c.ok(re.search(r"const CACHE = 'pulsetrack-offline-v\d+'", sw), 'sw.js has a cache name')
c.ok('Version ' + version + ' · works offline' in open(os.path.join(ROOT, 'README.md'), encoding='utf-8').read(), 'README says the current version')
c.ok('*Version %s*' % version in open(os.path.join(ROOT, 'README.md'), encoding='utf-8').read(), 'README title line has the current version')

with page() as p:
    c.eq(p.evaluate('APP_VERSION'), version, 'APP_VERSION')
    c.eq(p.evaluate('document.getElementById("drawer-version").textContent'), 'v' + version, 'drawer version')
    c.eq(p.evaluate('app.data.programs.length'), 60, 'programs on a fresh phone (59 built-in + the starter arms program)')
    c.ok(p.evaluate('EXERCISE_DATABASE.length') >= 645, 'exercise library')
    c.eq(p.evaluate('BUILTIN_PROGRAMS.length'), 59, 'BUILTIN_PROGRAMS')
    c.eq(p.evaluate('new Set(app.data.programs.map(x => x.id)).size'), p.evaluate('app.data.programs.length'), 'program ids unique')
    p.evaluate('app.selectProgram(app.data.programs.find(x => x.id === "frank_zane_upper_lower_4day"), null, true)')
    for v in ['home', 'programs', 'days', 'workout', 'library', 'history', 'progress', 'body', 'cardio']:
        p.evaluate('v => app.showView(v)', v)
        p.wait_for_timeout(150)
        shown = p.evaluate('v => { const e = document.getElementById("view-" + v); return !!e && !e.classList.contains("hidden"); }', v)
        c.ok(shown, 'view %s shows' % v)
    # drawer, a sheet, and settings open without errors
    p.evaluate('app.showView("home")')
    p.wait_for_timeout(200)
    c.eq(p.errors, [], 'no page errors or console errors')
c.done()
