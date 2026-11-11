#!/usr/bin/env python3
"""Draw the app icon PNGs from src/logo/icon.svg.

  python3 tools/make_logo.py

Writes src/logo/png192.b64 and src/logo/png512.b64 (the PNG pictures as base64 text, 24 colours, about 2 KB and 7 KB).
Chrome on Android builds the installed app from PNG icons, so manifest.json uses these. They are kept SMALL on purpose: with 15 KB and 56 KB
icons (2.86.0) Chrome only made a home-screen shortcut, and with 1 KB icons (2.85.2) it built the real app.
icon.svg is the logo with a flat background and no glow (it compresses well); logo.svg is the same logo with the glow, used for the tab icon
and the side-menu mark. Run this only when icon.svg changes, then run tools/build.py (it puts the PNGs into manifest.json and the
home-screen icon). Needs Playwright and Pillow.
"""
import base64, io, os
from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOGO = os.path.join(ROOT, 'src', 'logo')

svg = open(os.path.join(LOGO, 'icon.svg'), 'rb').read()
uri = 'data:image/svg+xml;base64,' + base64.b64encode(svg).decode()
with sync_playwright() as p:
    b = p.chromium.launch()
    for size in (192, 512):
        pg = b.new_page(viewport={'width': size, 'height': size}, device_scale_factor=1)
        pg.set_content('<body style="margin:0"><img src="%s" width="%d" height="%d" style="display:block">' % (uri, size, size))
        pg.wait_for_timeout(300)
        im = Image.open(io.BytesIO(pg.screenshot(clip={'x': 0, 'y': 0, 'width': size, 'height': size}))).convert('RGB')
        im = im.quantize(colors=24, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
        buf = io.BytesIO(); im.save(buf, 'PNG', optimize=True)
        open(os.path.join(LOGO, 'png%d.b64' % size), 'w').write(base64.b64encode(buf.getvalue()).decode('ascii') + '\n')
        print('png%d.b64: %d bytes of PNG' % (size, len(buf.getvalue())))
    b.close()
