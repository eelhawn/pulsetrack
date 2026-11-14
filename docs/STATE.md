# Where we left off (2026-11-13)

## Released
- 2.92.0: My 6-Day Split as one program, 3 days on / 1 off (8-day weeks, Week A/B alternating). Pushed.
- 2.93.0: runs 8 weeks (A = weeks 1,3,5,7; B = 2,4,6,8); description tells the user to start on Sat/Sun so the last rest day is a weekend day. Module 113 migrates saved copies; `tests/split8.py`. See git log for push status.

## Recent releases
2.91.0 Monthly Wrapped + faster set entry; 2.91.1 Wrapped text fits; 2.91.2 no front raises on shoulder days; 2.91.3 Iso-Lateral Plate-Loaded Machine Dip; 2.92.0 3-on-1-off; 2.93.0 8 weeks.

## Open question
"Final rest day on Saturday or Sunday" was read as: the program's last day lands on a weekend if the user starts on one (the app has no calendar anchor). If the user wants the app to enforce or show real dates, that needs a start-date feature (not built).

## Bug found earlier
`window.PT` is undefined because `PT` is a top-level `const`; use `typeof PT !== "undefined"`.

## Unconfirmed ideas (do not start unless asked)
Strength goals, protein counter, readiness check, left/right strength check, short today view / app icon shortcuts. Real-phone verification of recent features is still not done. 2.86.1 install-icon question is open.
