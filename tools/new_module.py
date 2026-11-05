#!/usr/bin/env python3
"""Create a new script module and add it to the page, just before the last one.

  python3 tools/new_module.py 2.69.0 "short name of the feature"

Writes src/js/NNN-v2.69.0-short-name-of-the-feature.js (a header comment to fill in) and adds its
<script> line to src/index.template.html. The page ends with the 999- module, which always stays last.
"""
import os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'src')

if len(sys.argv) < 3:
    sys.exit(__doc__)
ver, title = sys.argv[1], ' '.join(sys.argv[2:])
slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
nums = [int(n.split('-')[0]) for n in os.listdir(os.path.join(SRC, 'js')) if n.split('-')[0].isdigit() and n.split('-')[0] != '999']
rel = 'js/%03d-v%s-%s.js' % (max(nums) + 1, ver, slug)
path = os.path.join(SRC, rel)
with open(path, 'w', encoding='utf-8', newline='') as f:
    f.write('/* =====================================================================\n * PulseTrack %s: %s.\n * ===================================================================== */\n(function () {\n  "use strict";\n  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;\n\n})();\n' % (ver, title))
tpl_path = os.path.join(SRC, 'index.template.html')
with open(tpl_path, encoding='utf-8', newline='') as f:
    tpl = f.read()
last = re.search(r'<script>\{\{file:js/999-[^}]+\}\}</script>', tpl)
if not last:
    sys.exit('error: the 999- script line was not found in the template')
tpl = tpl[:last.start()] + '<script>{{file:%s}}</script>\n  ' % rel + tpl[last.start():]
with open(tpl_path, 'w', encoding='utf-8', newline='') as f:
    f.write(tpl)
print('created src/' + rel)
