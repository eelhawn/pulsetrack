#!/usr/bin/env python3
"""Build index.html from src/.

  python3 tools/build.py            write index.html
  python3 tools/build.py --check    build in memory and compare with index.html (exit 1 if different)

src/index.template.html holds the page. Every {{file:PATH}} in it is replaced by the
contents of src/PATH, so the <script>/<style> tags stay visible in the template and the
order of the files is the order in the template. {{VERSION}} comes from src/VERSION.
Every {{md:PATH}} is replaced by the Markdown file ROOT/PATH turned into HTML (TERMS.md and PRIVACY.md, so the
legal text lives in one place and the app shows exactly what the repo shows).
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
    # 3.16.0: the long-press shortcuts show the logo too, as a 1 KB 96 px PNG so manifest.json stays small (big icons once stopped
    # Chrome from building the installed app, see tests/install.py)
    for sc in data.get('shortcuts', []):
        sc['icons'] = [{'src': logo_png(96), 'sizes': '96x96', 'type': 'image/png'}]
    return json.dumps(data, indent=2) + '\n'


def md_html(text):
    """The small Markdown subset the legal pages use: # headings, paragraphs, - lists, **bold**, bare https links.
    A list item can hold more: lines indented by 2 spaces under it are its own paragraphs (after a blank line) and its own - list
    (3.7.0, for the cloud guide section). An item with only one paragraph renders as before, without a <p>."""
    import html as H
    def inline(t):
        t = H.escape(t, quote=False)
        t = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', t)
        return re.sub(r'(https://[^\s<]+[^\s<.,;:)])', r'<a href="\1" target="_blank" rel="noopener noreferrer">\1</a>', t)
    ind = lambda l: len(l) - len(l.lstrip(' '))
    head = lambda s: re.match(r'(#{1,3}) (.+)', s)

    def item(body):
        lines = [body[0]] + [l[2:] if ind(l) >= 2 else l for l in body[1:]]
        if all(l.strip() for l in lines) and not any(l.strip().startswith('- ') or ind(l) for l in lines[1:]):
            return inline(' '.join(l.strip() for l in lines))
        return ''.join(blocks(lines))

    def blocks(ls):
        out, i, n = [], 0, len(ls)
        while i < n:
            s = ls[i].strip()
            if not s: i += 1; continue
            m = head(s)
            if m:
                k = len(m.group(1)) + 1; out.append('<h%d>%s</h%d>' % (k, inline(m.group(2)), k)); i += 1; continue
            if s.startswith('- '):
                items = []
                while i < n and ls[i].strip().startswith('- ') and ind(ls[i]) == 0:
                    body = [ls[i].strip()[2:]]; i += 1
                    while i < n:
                        l = ls[i]
                        if not l.strip():
                            j = i
                            while j < n and not ls[j].strip(): j += 1
                            if j < n and ind(ls[j]) >= 2: body.extend(ls[i:j]); i = j; continue
                            break
                        if ind(l) >= 2: body.append(l); i += 1; continue
                        if l.strip().startswith('- ') or head(l.strip()): break
                        body.append('  ' + l.strip()); i += 1      # a wrapped line of the same item
                    items.append(item(body))
                out.append('<ul>%s</ul>' % ''.join('<li>%s</li>' % x for x in items)); continue
            para = []
            while i < n and ls[i].strip() and not ls[i].strip().startswith('- ') and not head(ls[i].strip()):
                para.append(ls[i].strip()); i += 1
            out.append('<p>%s</p>' % inline(' '.join(para)))
        return out

    return '\n'.join(blocks(text.splitlines()))


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

    # md slots first, from the template itself, so text inside the scripts can never be mistaken for one
    tpl = re.sub(r'\{\{md:([^}]+)\}\}', lambda m: md_html(read(os.path.join(ROOT, m.group(1)))), tpl)
    html = re.sub(r'\{\{file:([^}]+)\}\}', put, tpl)
    html = html.replace('{{VERSION}}', version)
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
