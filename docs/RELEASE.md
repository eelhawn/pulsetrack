# Release procedure (every release)

1. Change `src/` (and `programs.js` / `exercises.js` if needed). New modules: `python3 tools/new_module.py VER "name"`.
2. Add/adjust tests. A new test must fail without the fix.
3. README.md: version line (top, `*Version X.Y.Z*`), a version-history entry (newest first, under "## Version history"), feature text, script count (`its N scripts`), and the Tests list (line starting `- **Tests:**`).
4. `python3 tools/bump.py X.Y.Z`
5. `python3 tools/build.py` then `python3 tests/run_all.py` -> must print `ALL PASS`; then `python3 tools/build.py --check`.
6. Copy `index.html exercises.js opengym-exercises.js programs.js sw.js README.md manifest.json LICENSE NOTICE.md` to the outputs folder if the session uses one (`/mnt/user-data/outputs/`).
7. `git add -A .`, commit with trailers, `git push -q origin HEAD:main`, verify `git rev-parse HEAD origin/main` match.
8. Tell the user which files changed, and to open the app online once, then fully close and reopen.
Do NOT add `icon-512.png` / `icon-192.png`.
