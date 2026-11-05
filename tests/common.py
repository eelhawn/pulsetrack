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
