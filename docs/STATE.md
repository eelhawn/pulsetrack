# Where we left off (2026-11-13)

## In progress: release 2.92.0 (NOT yet committed or pushed)
User request: "my own program make it 3 days on 1 day off and repeat for 6 weeks so js make it 1 big program" (read as My 6-Day Split).
Done in the working tree: `programs.js` restructured, `src/js/112-v2.92.0-3-on-1-off-split.js` (migration), `PT.dayNo` + positional labels (modules 004, 022, 030, 091), 096 `base = 7`, tests updated, `tests/split3.py` (44 checks), README edited (version, history entry, 112 scripts, tests list), `bump.py 2.92.0` run (src/VERSION = 2.92.0).
Last full run was `ALL PASS` (live.py flaked once, passed on rerun).
The final chained command (bump, rebuild, tests, build --check, copy to outputs, commit, push) was interrupted by the user, so it may be partial. HEAD and origin/main were both still at 117b70f (2.91.3).

### Next steps
1. `git status`; `python3 tools/build.py`; `python3 tests/run_all.py` (expect ALL PASS); `python3 tools/build.py --check`.
2. Commit "2.92.0: My 6-Day Split as one 6-week program, 3 days on / 1 off", push, verify hashes.
3. Tell the user which files changed and the open-online-then-reopen step.
Open question: the interpretation (8-day weeks, 6 weeks, Week A/B alternation kept) was assumed; the user did not confirm.

## Recent releases
- 2.91.0 Monthly Wrapped + faster set entry; 2.91.1 Wrapped text fits; 2.91.2 no front raises on shoulder days; 2.91.3 Iso-Lateral Plate-Loaded Machine Dip; 2.92.0 3-on-1-off (pending).

## Bug found this session
`window.PT` is undefined because `PT` is a top-level `const`; guards must use `typeof PT !== "undefined"`.

## Unconfirmed ideas (do not start unless asked)
Strength goals, protein counter, readiness check, left/right strength check, short today view / app icon shortcuts. Real-phone verification of recent features is still not done. 2.86.1 install-icon question is open.
