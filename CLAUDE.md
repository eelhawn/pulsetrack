# PulseTrack: project guide for Claude Code

PulseTrack is an offline-first workout-tracker PWA, shipped as ONE self-contained `index.html`.
Repo: `eelhawn/pulsetrack`, branch `main`. Live: https://eelhawn.github.io/pulsetrack (GitHub Pages).
The owner uses it on a phone; keep the UI compact and phone-first (390px and 360px widths).

## Read first
- `docs/ARCHITECTURE.md`: how the code is organised and the helpers you will reuse.
- `docs/RELEASE.md`: the release procedure you must follow every time.
- `docs/STATE.md`: where work stopped, recent history, pending ideas.
- `docs/PROGRAM-DATA.md`: how programs, week plans and logs work (easy to break).

## Hard rules
1. Never hand-edit `index.html` or `sw.js`. Edit `src/` and run `python3 tools/build.py`.
2. Every change is a numbered release: update README, bump, run all tests, build `--check`, commit, push. See `docs/RELEASE.md`.
3. Do NOT add `icon-512.png` or `icon-192.png`.
4. Always upload (push) the files to the repo after every release. The owner said this explicitly.
5. Do not renumber `dayNumber`s of existing programs: logs and progress are keyed by them (see PROGRAM-DATA).
6. Anything that changes a program already saved on a user's phone needs a one-time migration module, not just a `programs.js` edit.
7. After a release, tell the user which files changed (no placeholder hashes) and to open the app online once, then fully close and reopen it (service worker update).
8. New tests go in `tests/`; `run_all.py` auto-discovers them. Verify a new test fails without the fix.

## Commands
- Build: `python3 tools/build.py` (`--check` verifies index.html matches src/)
- New module: `python3 tools/new_module.py VER "name"` (module 999 always stays last)
- Version bump: `python3 tools/bump.py X.Y.Z` (writes src/VERSION, sw.js cache name, etc.)
- All tests: `python3 tests/run_all.py` must end with `ALL PASS`. One file: `python3 tests/split3.py`.
  Tests need Python + Playwright + Chromium. `live.py` flaked once under load and passed on rerun; rerun before investigating.

## Commit trailers
End commit messages with the attribution lines the Claude Code session asks for (for example `Co-Authored-By: Claude ... <noreply@anthropic.com>`).

## Style of work the owner likes
Short replies, result first. Small safe changes. Say what files changed. Ask only when truly ambiguous; otherwise pick the sensible reading and state it.
