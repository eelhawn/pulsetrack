# Where we left off (2026-11-13)

## Released
- 2.92.0 3-on-1-off (16 days, week groups); 2.93.0 8 weeks; 2.94.1 fixes the 57-days-done count (progress now comes from ticked sets) and adds Jump to day; 2.94.0 one flat program, Day 1 to Day 64, no weeks (renumbered, with a one-time migration of saved copies). See git log for push status.

## Notes
- The user asked for Day 1 to 64 "no weeks feature" and said not to rewrite the week logic: the week code (module 022, 008) is untouched; the program simply has no weekPlan. Only this program's wording (Home badge, week row) is overridden in module 114.
- Start on Saturday or Sunday so Day 64 lands on a weekend (app has no calendar anchor; a start-date feature would be new work).

## Bug found earlier
`window.PT` is undefined because `PT` is a top-level `const`; use `typeof PT !== "undefined"`.

## Unconfirmed ideas (do not start unless asked)
Strength goals, protein counter, readiness check, left/right strength check, short today view / app icon shortcuts. Real-phone verification of recent features is still not done. 2.86.1 install-icon question is open.
