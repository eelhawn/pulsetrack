"""The app icon and installing (2.86.0): one logo (src/logo/) feeds the PNG icons in manifest.json (Chrome on Android builds the installed app from
PNG), the tab icon, the home-screen icon and the mark in the side menu. The picture fills its whole square, keeps inside the round-icon safe zone,
is centred, and Chrome (Chromium here) finds nothing in the way of installing the app."""
import base64, functools, http.server, json, os, socketserver, struct, subprocess, sys, threading
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
c = Checks('install')
man = json.load(open(os.path.join(ROOT, 'manifest.json')))
html = open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read()
svg = open(os.path.join(ROOT, 'src', 'logo', 'logo.svg'), 'rb').read()
svg_uri = 'data:image/svg+xml;base64,' + base64.b64encode(svg).decode()
b64 = {s: open(os.path.join(ROOT, 'src', 'logo', 'png%d.b64' % s)).read().strip() for s in (192, 512)}

# ---------------------------------------------------------------- the manifest
c.eq([man['name'], man['display'], man['start_url']], ['PulseTrack', 'standalone', './index.html'], 'name, standalone display and start page')
c.eq([i['sizes'] for i in man['icons']], ['192x192', '512x512'], 'the 192 and 512 sizes are listed')
c.ok(all(i['type'] == 'image/png' and i['src'].startswith('data:image/png;base64,') for i in man['icons']), 'both icons are PNG pictures built into the manifest (no extra files to upload)')
c.ok(all(i['purpose'] == 'any maskable' for i in man['icons']), 'both icons can be used as they are, as Chrome requires, and cut to a round shape')
c.eq([i['src'].split(',', 1)[1] for i in man['icons']], [b64[192], b64[512]], 'the manifest icons are the logo from src/logo/')
for i in man['icons']:
    raw = base64.b64decode(i['src'].split(',', 1)[1])
    w, h = struct.unpack('>II', raw[16:24])
    c.ok(raw[:8] == b'\x89PNG\r\n\x1a\n' and '%dx%d' % (w, h) == i['sizes'], 'the %s icon is a real PNG of exactly that size (%d bytes)' % (i['sizes'], len(raw)))
c.ok(not any(os.path.exists(os.path.join(ROOT, n)) for n in ('icon-512.png', 'icon-192.png')), 'no separate icon files were added')
c.ok(b'viewBox="0 0 512 512"' in svg and len(svg) < 3000 and not any(t in svg.lower() for t in (b'<script', b'<image', b'<text')), 'the master drawing is a small 512 x 512 SVG with no script, picture or text')
c.ok('<link rel="icon" type="image/svg+xml" href="%s">' % svg_uri in html, 'the browser tab icon is the logo')
c.ok('<link rel="apple-touch-icon" href="data:image/png;base64,%s">' % b64[192] in html, 'the home-screen icon is the logo')
mv = html.split('manifest.json?v=')[1].split('"')[0]
c.eq(mv, '12', 'the manifest address is the one the app installed from')
r = subprocess.run([sys.executable, os.path.join(ROOT, 'tools', 'build.py'), '--check'], capture_output=True, text=True)
c.eq(r.returncode, 0, 'index.html and manifest.json match src/ (%s)' % r.stdout.strip())

# ---------------------------------------------------------------- the picture itself, as the phone gets it
PIX = '''async (u) => {
  const img = new Image(); img.src = u; await img.decode();
  const n = img.naturalWidth, cv = document.createElement("canvas"); cv.width = cv.height = n;
  const g = cv.getContext("2d"); g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, n, n).data, k = n / 512;
  let outside = 0, inside = 0, clear = 0, minX = n, maxX = 0, minY = n, maxY = 0, corner = 0;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const i = (y * n + x) * 4;
    if (d[i + 3] < 255) clear++;
    const m = Math.max(d[i], d[i + 1], d[i + 2]);
    if ((x < 6 || x >= n - 6) && (y < 6 || y >= n - 6)) corner = Math.max(corner, m);
    if (m <= 100) continue;
    if (Math.hypot(x + .5 - n / 2, y + .5 - n / 2) > 205 * k) outside++; else inside++;
    if (m > 140) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
  }
  return { n, outside, inside, clear, corner, cx: (minX + maxX) / 2 / k, cy: (minY + maxY) / 2 / k };
}'''
with page(w=390, h=844) as p:
    for i in man['icons']:
        r = p.evaluate(PIX, i['src'])
        s = i['sizes']
        c.eq(r['clear'], 0, 'the %s picture fills its whole square, so a phone can cut it to any shape with no see-through corners' % s)
        c.ok(r['corner'] < 70, 'the corners are the dark background (%d)' % r['corner'])
        c.eq(r['outside'], 0, 'nothing bright is drawn outside the round-icon safe zone (a circle with 80%% of the width) in the %s picture' % s)
        c.ok(r['inside'] > 0.12 * r['n'] * r['n'], 'the mark is big enough to see in the %s picture (%d painted pixels)' % (s, r['inside']))
        c.ok(abs(r['cx'] - 256) < 8 and abs(r['cy'] - 256) < 8, 'the mark is centred in the %s picture (%.0f, %.0f)' % (s, r['cx'], r['cy']))

    # ---------------------------------------------------------------- in the app
    p.wait_for_timeout(300)
    info = p.evaluate('''() => { const i = document.getElementById("pt-logo"), r = i.getBoundingClientRect(); return { w: r.width, h: r.height, nat: i.naturalWidth, src: i.getAttribute("src"), alt: i.getAttribute("alt") }; }''')
    c.eq([info['w'], info['h']], [32, 32], 'the menu mark is 32 x 32 (same size as the old letter tile)')
    c.ok(info['nat'] > 0 and info['src'] == svg_uri, 'the menu mark loads and is the logo')
    c.eq(info['alt'], '', 'the menu mark has empty alt text, since "PulseTrack Pro" is written next to it')
    p.evaluate('() => document.getElementById("btn-open-drawer").click()'); p.wait_for_timeout(400)
    c.ok(p.evaluate('() => { const r = document.getElementById("pt-logo").getBoundingClientRect(); return r.width > 0 && r.left >= 0 && r.right <= innerWidth; }'), 'the mark is on screen when the menu is open')
    c.eq(p.errors, [], 'no page errors')

# ---------------------------------------------------------------- the browser's own install check, served from localhost
from playwright.sync_api import sync_playwright
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a, **k):
        pass
class S(socketserver.TCPServer):
    allow_reuse_address = True
srv = S(('127.0.0.1', 0), functools.partial(Quiet, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start()
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
