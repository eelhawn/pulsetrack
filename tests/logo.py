"""The app logo (2.85.0): one source (src/logo.svg) feeds the install icons in manifest.json, the favicon, the home-screen icon and the
mark in the menu. The picture stays inside the round-icon safe zone, fills its whole square, and is the same everywhere."""
import base64, json, os, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
c = Checks('logo')
svg = open(os.path.join(ROOT, 'src', 'logo.svg'), 'rb').read()
uri = 'data:image/svg+xml;base64,' + base64.b64encode(svg).decode()
man = json.load(open(os.path.join(ROOT, 'manifest.json')))
html = open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read()

# ---------------------------------------------------------------- one logo, everywhere
c.ok(b'viewBox="0 0 512 512"' in svg and len(svg) < 2000, 'the logo is a small 512 x 512 SVG')
c.ok(b'<script' not in svg.lower() and b'<image' not in svg.lower() and b'<text' not in svg.lower(), 'it has no script, no linked picture and no text (so it looks the same on every phone, offline)')
c.eq([i['src'] for i in man['icons']], [uri, uri], 'both install icons in manifest.json are the logo')
c.eq([i['sizes'] for i in man['icons']], ['192x192', '512x512'], 'the 192 and 512 sizes are still listed')
c.ok(all(i['purpose'] == 'any maskable' for i in man['icons']), 'the icons are still allowed to be masked into a circle or squircle')
c.ok('<link rel="icon" type="image/svg+xml" href="%s">' % uri in html, 'the browser tab icon is the logo')
c.ok('<link rel="apple-touch-icon" href="%s">' % uri in html, 'the home-screen icon is the logo')
c.ok('manifest.json?v=10' in html, 'the manifest address changed so phones fetch the new icons')
r = subprocess.run([sys.executable, os.path.join(ROOT, 'tools', 'build.py'), '--check'], capture_output=True, text=True)
c.eq(r.returncode, 0, 'index.html and manifest.json match src/ (%s)' % r.stdout.strip())

# ---------------------------------------------------------------- the picture itself
with page(w=390, h=844) as p:
    px = p.evaluate('''async (u) => {
      const img = new Image(); img.src = u; await img.decode();
      const cv = document.createElement("canvas"); cv.width = cv.height = 512;
      const g = cv.getContext("2d"); g.drawImage(img, 0, 0, 512, 512);
      const d = g.getImageData(0, 0, 512, 512).data, bg = [9, 9, 11];
      let outside = 0, inside = 0, transparent = 0, ink = 0, minX = 512, maxX = 0, minY = 512, maxY = 0;
      for (let y = 0; y < 512; y++) for (let x = 0; x < 512; x++) {
        const i = (y * 512 + x) * 4, a = d[i + 3];
        if (a < 255) transparent++;
        const diff = Math.abs(d[i] - bg[0]) + Math.abs(d[i + 1] - bg[1]) + Math.abs(d[i + 2] - bg[2]);
        if (diff < 6) continue;
        ink++;
        const dist = Math.hypot(x + .5 - 256, y + .5 - 256);
        if (dist > 205) outside++; else inside++;
        if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
      return { outside, inside, transparent, ink, minX, maxX, minY, maxY };
    }''', uri)
    c.eq(px['transparent'], 0, 'the picture fills its whole square, so a phone can cut it to any shape with no see-through corners')
    c.eq(px['outside'], 0, 'nothing is drawn outside the round-icon safe zone (a circle with 80% of the width)')
    c.ok(px['inside'] > 20000, 'the mark is big enough to see (%d painted pixels)' % px['inside'])
    c.ok(abs((px['minX'] + px['maxX']) / 2 - 256) < 10 and abs((px['minY'] + px['maxY']) / 2 - 256) < 10, 'the mark is centred (%s..%s, %s..%s)' % (px['minX'], px['maxX'], px['minY'], px['maxY']))

    # ---------------------------------------------------------------- in the app
    p.wait_for_timeout(300)
    info = p.evaluate('''() => { const i = document.getElementById("pt-logo"), r = i.getBoundingClientRect(); return { w: r.width, h: r.height, nat: i.naturalWidth, src: i.src === ''' + "'" + uri + "'" + ''', alt: i.getAttribute("alt") }; }''')
    c.eq([info['w'], info['h']], [32, 32], 'the menu mark is 32 x 32 (same size as the old letter tile)')
    c.ok(info['nat'] > 0 and info['src'], 'the menu mark loads and is the logo')
    c.eq(info['alt'], '', 'the menu mark has empty alt text, since "PulseTrack Pro" is written next to it')
    p.evaluate('() => document.getElementById("btn-open-drawer").click()'); p.wait_for_timeout(400)
    vis = p.evaluate('() => { const r = document.getElementById("pt-logo").getBoundingClientRect(); return r.width > 0 && r.left >= 0 && r.right <= innerWidth; }')
    c.ok(vis, 'the mark is on screen when the menu is open')
    c.eq(p.evaluate('() => document.getElementById("view-home") ? document.documentElement.scrollWidth <= innerWidth : true'), True, 'no sideways scroll with the menu open')
    c.eq(p.errors, [], 'no page errors')

c.done()
