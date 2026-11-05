#!/usr/bin/env python3
"""Start a release: python3 tools/bump.py 2.69.0

Sets src/VERSION, adds one to the cache number in sw.js (so phones fetch the new files), changes
"*Version X*" and "Version X · works offline" in README.md, then rebuilds index.html.
"""
import os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if len(sys.argv) != 2 or not re.fullmatch(r'\d+\.\d+\.\d+', sys.argv[1]):
    sys.exit(__doc__)
ver = sys.argv[1]


def edit(path, fn):
    p = os.path.join(ROOT, path)
    with open(p, encoding='utf-8', newline='') as f:
        s = f.read()
    t = fn(s)
    with open(p, 'w', encoding='utf-8', newline='') as f:
        f.write(t)
    return s != t


with open(os.path.join(ROOT, 'src', 'VERSION'), 'w') as f:
    f.write(ver + '\n')
edit('sw.js', lambda s: re.sub(r"(const CACHE = 'pulsetrack-offline-v)(\d+)(')", lambda m: m.group(1) + str(int(m.group(2)) + 1) + m.group(3), s, count=1))
edit('README.md', lambda s: re.sub(r'Version \d+\.\d+\.\d+ · works offline', 'Version ' + ver + ' · works offline', re.sub(r'^\*Version \d+\.\d+\.\d+\*', '*Version ' + ver + '*', s, count=1, flags=re.M)))
subprocess.check_call([sys.executable, os.path.join(ROOT, 'tools', 'build.py')])
