"""Install icons (2.85.2): the manifest lists real PNG icons (inline, no extra files) so Chrome on Android builds the installed app, and Chrome
(Chromium here) reports nothing in the way of installing it."""
import base64, io, json, os, struct, sys, threading, functools, http.server, socketserver
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
c = Checks('install')
man = json.load(open(os.path.join(ROOT, 'manifest.json')))
html = open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read()

c.eq([man['name'], man['display'], man['start_url']], ['PulseTrack', 'standalone', './index.html'], 'name, standalone display and start page')
c.eq([i['sizes'] for i in man['icons']], ['192x192', '512x512'], 'the 192 and 512 sizes are listed')
c.ok(all(i['type'] == 'image/png' and i['src'].startswith('data:image/png;base64,') for i in man['icons']), 'both icons are PNG pictures built into the manifest (no extra files to upload)')
c.ok(all('any' in i['purpose'].split() for i in man['icons']), 'both icons can be used as they are, as Chrome requires')
c.ok(all('maskable' in i['purpose'].split() for i in man['icons']), 'both icons can also be cut to a round or rounded-square shape')
for i in man['icons']:
    raw = base64.b64decode(i['src'].split(',', 1)[1])
    w, h = struct.unpack('>II', raw[16:24])
    c.ok(raw[:8] == b'\x89PNG\r\n\x1a\n' and '%dx%d' % (w, h) == i['sizes'], 'the %s icon is a real PNG of exactly that size (%dx%d, %d bytes)' % (i['sizes'], w, h, len(raw)))
c.ok(not os.path.exists(os.path.join(ROOT, 'icon-512.png')) and not os.path.exists(os.path.join(ROOT, 'icon-192.png')), 'no separate icon files were added')
mv = html.split('manifest.json?v=')[1].split('"')[0]
c.ok(mv.isdigit() and int(mv) >= 12, 'the manifest address carries a new number so phones fetch this manifest (v=%s)' % mv)

# the browser's own install check, served from localhost
from playwright.sync_api import sync_playwright
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a, **k):
        pass
h = functools.partial(Quiet, directory=ROOT)
class S(socketserver.TCPServer): allow_reuse_address = True
srv = S(('127.0.0.1', 0), h); threading.Thread(target=srv.serve_forever, daemon=True).start()
with sync_playwright() as p:
    b = p.chromium.launch(); ctx = b.new_context(viewport={'width': 390, 'height': 844}); pg = ctx.new_page(); cdp = ctx.new_cdp_session(pg)
    pg.goto('http://localhost:%d/index.html' % srv.server_address[1], wait_until='load'); pg.wait_for_timeout(2500)
    c.eq(cdp.send('Page.getInstallabilityErrors')['installabilityErrors'], [], "Chrome's install check finds nothing in the way")
    m = cdp.send('Page.getAppManifest')
    c.eq(m.get('errors', []), [], 'the manifest has no warnings')
    c.eq(pg.evaluate('async () => (await navigator.serviceWorker.getRegistration()) ? "yes" : "no"'), 'yes', 'the offline service worker is registered')
    b.close()
srv.shutdown()
c.done()
