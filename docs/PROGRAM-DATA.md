# Programs, week plans, logs

- Programs live in `app.data.programs` (copied from `BUILTIN_PROGRAMS` on first run). A copy already saved on a phone does not update from `programs.js`; it needs a migration module.
- Log key: `${programId}_d${dayNumber}_${exerciseId}_s${n}`. Progress state (`done`, `byWeek`) is keyed by `dayNumber`. Never renumber days of an existing program.
- Week plans (module 022): `prog.weekPlan = [{ weeks: [...], days: [dayNumbers], name }]`; `planOf(prog)` returns `{ W, byWeek, groups }`. "Week" can be any set of days (Lee Haney 3-on-1-off has an 8-day block).
- `decorateDaysList` renders cards in `prog.days` ARRAY order, grouped by group membership, so the array must be in plan order with each group contiguous.
- Rest days = empty `exercises` (`app.isRestDay`). They are listed but never "up next" and do not count toward week completion.
- `prog.dayLabels = "week"` makes the UI show positional Day 1..8 per week instead of stored dayNumbers.

## My 6-Day Split (`my_6day_chest_back_legs_sharms`), as of 2.93.0
- 16 days in plan order `[1,2,3,7,4,5,6,15, 8,9,10,14,11,12,13,16]`; days 7, 14, 15, 16 are rest days.
- weekPlan: Week A = `[1,2,3,7,4,5,6,15]` (weeks 1,3,5,7), Week B = `[8,9,10,14,11,12,13,16]` (weeks 2,4,6,8); `baseDays: 8`; 8 weeks total as of 2.93.0 (module 113 migrates saved 6-week copies). 64 days = 9 weeks + 1 day, so the program ends on the weekday it started: start on Sat/Sun to end on Sat/Sun (the app does not follow the calendar).
- Shoulder days (3, 6, 10) have no front raises (2.91.2). Machine dips are "Iso-Lateral Plate-Loaded Machine Dip" (2.91.3).
- Migration 112 skips if weekPlan has fewer than 2 groups (module 096 upgrades first) or if day 15 already exists with matching baseDays.
