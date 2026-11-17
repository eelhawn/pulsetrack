# Where we left off (2026-11-13)

## Released
- 3.3.0 guide, search backend (module 132; 020's Search sheet has a #pt-gans slot). PT.guide.answer(q, ctx) -> {backend, kind, title, text, list, avoid, note, actions:[{label, nav}], score}; BACKENDS registry (only "search" so far; settings.guideBackend picks; must fall back to search). HELP index of 75 entries with nav strings (view:/progress:/set:/click:/fn:/ex:/day:). PT.fuzzy. Plan from the owner (approved): 3.4.0 26-region body figure + exercise-guides.js (6 samples: Bench Press, Squat, Romanian Deadlift (RDL), Lat Pulldown, Seated Cable Row, Push-Ups), 3.5.0 step viewer + arrows + add my photo, 3.6.0 Ollama (off by default), then STOP and show the cloud Privacy Policy draft before 3.7.0. Validation script reports coverage.
- 3.2.0 104 themes in Games/Sports/Sky/Places/Food/Music + 9 patterns (module 130); rewards removed via PT.rewardsOff (module 131 + guards in 044, 046, 049, 098, 102, 103, 106; 999 Badges tab replaces Rewards, DROP list removes reward/boss cards; Home level card hidden but kept as the nudge anchor). Reward data in settings is untouched. Group wording neutral.
- 3.1.0 history editing (module 128: openSessionSheet(id, true) is a full editor; + Add a past workout; s.durEst = estimated length, follows set changes; s.man/pid "manual" for hand-added) and Fill in uses (module 129: settings.fillMode suggest/last/heaviest/reps, PT.fillTarget used by 018 fillNext and 099 plan).
- 3.0.0 version numbering moved to 3.x (no 2.110). Programs list grouped (057 drawList): Group by days/athlete/goal (localStorage `pgx-by`, default days), collapsible groups (ST.open), current program's group opens, search/filter opens all, split preview line (splitOf/cleanDay). Tests reaching a row call `PT.progList.reveal(id)` first.
- 2.109.0 Terms of Service + Privacy Policy (TERMS.md, PRIVACY.md at repo root, built into index.html via {{md:PATH}} slots in build.py; module 127 shows an un-skippable first-launch sheet; acceptance in localStorage `pt-terms` = {v: TERMS_V, at}). Bump TERMS_V in module 127 when the documents change in a way people must re-accept. Tests pre-accept via common.TERMS_OK; `page(terms=False)` for first launch. Licence stays AGPL (owner asked for MIT; not possible while openGym's AGPL text is bundled).
- 2.108.0 plainer design (module 126 + text edits): no glass, no left stripes, no eyebrow badge, Home quick actions as one bar, normal-case labels, contrast >= 4.5 (light z500 now 100 100 110), no em dashes, no heading emoji, no purple/teal gradients. `tests/plain.py` + `tests/fixtures/design_audit.js` guard it; keep new UI passing that audit.
- 2.107.0 week strip dots centred again (`.pt-dot` is used by 019, 046, 009 and css/07: scope new dot styles to their container).
- 2.106.0 speed-ups (memo of name-only exercise answers, cached accent colour, month names), openGym library loads when idle, removed no-op modules 096/112/113. Perf scripts used: a 4x CPU-throttled Playwright run with 300 seeded workouts.
- 2.105.0 cleaner level card: frame grid (owned first, locked behind a toggle), shop Aurora renamed Borealis, XP breakdown grid.
- 2.104.0 Core & Cardio days: 200-300 reps each (5 x 40-60) of Weighted Decline Sit-Ups, Captain's Chair Leg Raises, Russian Twists + StairMaster; weekly goal fix for late-week changes.
- 2.103.0 StairMaster on Core & Cardio days: 20 min Day 4, +2.5 per Core & Cardio day, 57.5 min Day 64 (read as every cardio day, not every day: every day would reach 177.5 min).
- 2.102.0 cardio rows in a workout go to Cardio & Sports on finish and are left out of the workout's sets (setting cardioApart, on).
- 2.101.0 renamed to Ilhaan's 3 Day Split; abs moved from leg days to Core & Cardio days (old rest days) + Incline Treadmill Walk; band exercises removed (openGym ones + Band Curls / Band Chest Press).
- 2.100.0 openGym exercises merged into the muscle groups (no openGym chip), trimmed to ~2,860 useful ones; picker draws in chunks.
- 2.96.0 openGym exercise library (5,520 exercises, text only) in the picker; PulseTrack is now AGPL-3.0. User asked for "all the features" of openGym too; they chose Equipment filter (2.97.0) and Hevy/FitNotes import (2.98.0, Strong added too). Hevy column names were written from memory of its export format and tested with a hand-made sample; check against a real Hevy export if the user reports a problem. Not wanted: smarter progression, strength ratios.
- 2.95.0 one of dips/decline per Chest & Back day; 2.99.0 put the Smith Machine Decline Press back on Day 13, 29, 45, 61 (user asked).
- 2.92.0 3-on-1-off (16 days, week groups); 2.93.0 8 weeks; 2.94.1 fixes the 57-days-done count (progress now comes from ticked sets) and adds Jump to day; 2.94.0 one flat program, Day 1 to Day 64, no weeks (renumbered, with a one-time migration of saved copies). See git log for push status.

## Notes
- The user asked for Day 1 to 64 "no weeks feature" and said not to rewrite the week logic: the week code (module 022, 008) is untouched; the program simply has no weekPlan. Only this program's wording (Home badge, week row) is overridden in module 114.
- Start on Saturday or Sunday so Day 64 lands on a weekend (app has no calendar anchor; a start-date feature would be new work).

## Bug found earlier
`window.PT` is undefined because `PT` is a top-level `const`; use `typeof PT !== "undefined"`.

## Unconfirmed ideas (do not start unless asked)
Strength goals, protein counter, readiness check, left/right strength check, short today view / app icon shortcuts. Real-phone verification of recent features is still not done. 2.86.1 install-icon question is open.
