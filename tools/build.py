#!/usr/bin/env python3
"""Build index.html from src/.

  python3 tools/build.py            write index.html
  python3 tools/build.py --check    build in memory and compare with index.html (exit 1 if different)

src/index.template.html holds the page. Every {{file:PATH}} in it is replaced by the
contents of src/PATH, so the <script>/<style> tags stay visible in the template and the
order of the files is the order in the template. {{VERSION}} comes from src/VERSION.
The logo lives in src/logo/ (logo.svg, plus png192.b64 and png512.b64 made by tools/make_logo.py). {{logo_svg}} and {{logo_png192}} in the
template become data addresses of it, and the icons in manifest.json are set from it too, so the logo is in one place.
"""
import base64, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'src')


def read(path):
    with open(path, encoding='utf-8', newline='') as f:
        return f.read()


def logo_svg():
    with open(os.path.join(SRC, 'logo', 'logo.svg'), 'rb') as f:
        return 'data:image/svg+xml;base64,' + base64.b64encode(f.read()).decode('ascii')


def logo_png(size):
    return 'data:image/png;base64,' + read(os.path.join(SRC, 'logo', 'png%d.b64' % size)).strip()


def manifest():
    """manifest.json with its icons set to the logo PNGs."""
    data = json.loads(read(os.path.join(ROOT, 'manifest.json')))
    data['icons'] = [{'src': logo_png(s), 'sizes': '%dx%d' % (s, s), 'type': 'image/png', 'purpose': 'any maskable'} for s in (192, 512)]
    return json.dumps(data, indent=2) + '\n'


def build():
    version = read(os.path.join(SRC, 'VERSION')).strip()
    tpl = read(os.path.join(SRC, 'index.template.html'))
    used = []

    def put(m):
        rel = m.group(1)
        used.append(rel)
        body = read(os.path.join(SRC, rel))
        if '</script' in body.lower() and rel.startswith('js/'):
            sys.exit('error: %s contains a closing script tag' % rel)
        return body.replace('{{VERSION}}', version)

    html = re.sub(r'\{\{file:([^}]+)\}\}', put, tpl).replace('{{VERSION}}', version)
    html = html.replace('{{logo_svg}}', logo_svg()).replace('{{logo_png192}}', logo_png(192))
    # every file under src/js and src/css must be used exactly once
    for d in ('js', 'css'):
        for name in sorted(os.listdir(os.path.join(SRC, d))):
            rel = d + '/' + name
            if used.count(rel) != 1:
                sys.exit('error: %s is used %d times in the template (needs exactly 1)' % (rel, used.count(rel)))
    return html


if __name__ == '__main__':
    html = build()
    out = os.path.join(ROOT, 'index.html')
    man_out, man = os.path.join(ROOT, 'manifest.json'), manifest()
    if '--check' in sys.argv:
        same = os.path.exists(out) and read(out) == html and read(man_out) == man
        print('index.html and manifest.json are up to date' if same else 'index.html or manifest.json differs from src/')
        sys.exit(0 if same else 1)
    with open(out, 'w', encoding='utf-8', newline='') as f:
        f.write(html)
    with open(man_out, 'w', encoding='utf-8', newline='') as f:
        f.write(man)
    print('wrote index.html (%d bytes, version %s)' % (len(html.encode('utf-8')), read(os.path.join(SRC, 'VERSION')).strip()))
