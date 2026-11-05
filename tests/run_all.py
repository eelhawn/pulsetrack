"""Run every test file in this folder; exit 1 if any fails.   python3 tests/run_all.py"""
import glob, os, subprocess, sys

here = os.path.dirname(os.path.abspath(__file__))
bad = []
for f in sorted(glob.glob(os.path.join(here, '*.py'))):
    name = os.path.basename(f)
    if name in ('common.py', 'run_all.py'):
        continue
    r = subprocess.run([sys.executable, f], capture_output=True, text=True)
    out = (r.stdout + r.stderr).strip().splitlines()
    print(name + ':', out[-1] if out else '(no output)')
    if r.returncode:
        bad.append(name)
        print('\n'.join('   ' + l for l in out[-15:]))
print('ALL PASS' if not bad else 'FAILED: ' + ', '.join(bad))
sys.exit(1 if bad else 0)
