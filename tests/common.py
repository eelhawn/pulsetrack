"""Shared helpers for the PulseTrack tests (Playwright, Python).

Run any test with:  python3 tests/<name>.py      or all of them:  python3 tests/run_all.py
Each test serves the repo folder on a free local port and drives the real page in Chromium.
"""
import contextlib, functools, http.server, os, socketserver, sys, threading
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class _Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


@contextlib.contextmanager
def server():
    handler = functools.partial(_Quiet, directory=ROOT)
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('127.0.0.1', 0), handler) as httpd:
        t = threading.Thread(target=httpd.serve_forever, daemon=True)
        t.start()
        try:
            yield 'http://127.0.0.1:%d/index.html' % httpd.server_address[1]
        finally:
            httpd.shutdown()


@contextlib.contextmanager
def page(w=390, h=844, accept_downloads=True):
    """A phone-size page with errors collected in p.errors. Dialogs: PT.confirm answers are scripted via p.answers."""
    with server() as url, sync_playwright() as pw:
        b = pw.chromium.launch()
        ctx = b.new_context(viewport={'width': w, 'height': h}, accept_downloads=accept_downloads, device_scale_factor=1)
        ctx.add_init_script("try { navigator.canShare = undefined; navigator.share = undefined; } catch (e) {}")
        p = ctx.new_page()
        p.errors = []
        p.on('pageerror', lambda e: p.errors.append('pageerror: %s' % e))
        p.on('console', lambda m: p.errors.append('console.error: %s' % m.text) if m.type == 'error' else None)
        p.goto(url)
        p.wait_for_function('typeof PT !== "undefined" && window.app && window.app.data && window.app.data.programs && window.app.data.programs.length')
        yield p
        b.close()


class Checks:
    def __init__(self, name):
        self.name, self.failed, self.n = name, [], 0

    def ok(self, cond, label):
        self.n += 1
        if not cond:
            self.failed.append(label)
            print('  FAIL', label)

    def eq(self, got, want, label):
        self.ok(got == want, '%s (got %r, want %r)' % (label, got, want))

    def done(self):
        print('%s: %d checks, %d failed' % (self.name, self.n, len(self.failed)))
        if self.failed:
            sys.exit(1)


OLD8_ID = 'my_6day_chest_back_legs_sharms'


def old8(p):
    """Reshape My 6-Day Split into the 8-week, two-group week-plan program it was in 2.93.0 (16 days with the old day numbers, Week A / Week B),
    so the tests of the week-plan machinery (Switch week, headings, week reset) keep a fixture that has weeks. Since 2.94.0 the real program
    is 64 plain days. The built-in copy is reshaped too: the week reset and the tests read the original days from it."""
    p.evaluate('''() => {
      const ID = "%s", O = [1, 2, 3, 7, 4, 5, 6, 15, 8, 9, 10, 14, 11, 12, 13, 16];
      const shape = src => {
        const pr = JSON.parse(JSON.stringify(src));
        pr.days = pr.days.slice(0, 16);
        pr.days.forEach((d, i) => {
          const n = d.dayNumber; d.dayNumber = O[i];
          d.exercises.forEach(e => { e.id = e.id.replace("_d" + n + "_", "_d" + O[i] + "_"); });
          d.title = (i < 8 ? "W1 & W3 & W5 & W7" : "W2 & W4 & W6 & W8") + " - " + d.title;
        });
        pr.weekPlan = [{ weeks: [1, 3, 5, 7], days: O.slice(0, 8), name: "Week A" }, { weeks: [2, 4, 6, 8], days: O.slice(8), name: "Week B" }];
        pr.weeks = 8; pr.baseDays = 8; pr.weekReset = true; pr.dayLabels = "week";
        return pr;
      };
      const bi = BUILTIN_PROGRAMS.findIndex(x => x.id === ID), di = app.data.programs.findIndex(x => x.id === ID);
      const b = shape(BUILTIN_PROGRAMS[bi]);
      BUILTIN_PROGRAMS[bi] = b; app.data.programs[di] = JSON.parse(JSON.stringify(b));
      delete app.progState[ID];
      app.settings.split64 = 1; app.settings.split3on1 = 1; app.settings.split8wk = 1; WorkoutStorage.saveSettings(app.settings);
      WorkoutStorage.setData(app.data);
    }''' % OLD8_ID)
