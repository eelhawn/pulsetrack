# Programs, week plans, logs

- Programs live in `app.data.programs` (copied from `BUILTIN_PROGRAMS` on first run). A copy already saved on a phone does not update from `programs.js`; it needs a migration module.
- Log key: `${programId}_d${dayNumber}_${exerciseId}_s${n}`. Progress state (`done`, `byWeek`) is keyed by `dayNumber`. Never renumber days of an existing program.
- Week plans (module 022): `prog.weekPlan = [{ weeks: [...], days: [dayNumbers], name }]`; `planOf(prog)` returns `{ W, byWeek, groups }`. "Week" can be any set of days (Lee Haney 3-on-1-off has an 8-day block).
- `decorateDaysList` renders cards in `prog.days` ARRAY order, grouped by group membership, so the array must be in plan order with each group contiguous.
- Rest days = empty `exercises` (`app.isRestDay`). They are listed but never "up next" and do not count toward week completion.
- `prog.dayLabels = "week"` makes the UI show positional Day 1..8 per week instead of stored dayNumbers.

## Ilhaan's 3 Day Split (`my_6day_chest_back_legs_sharms`, was My 6-Day Split), as of 2.101.0
- One flat program of 64 days numbered 1..64, no `weekPlan`, no `weeks`, no `dayLabels`. Blocks of 8: Chest & Back, Legs & Calves, Sharms, Core & Cardio, x2 (since 2.101.0 the old rest days are Core & Cardio; since 2.104.0 they are Weighted Decline Sit-Ups, Captain's Chair Leg Raises and Russian Twists, 5 x 40-60 each, + Stairmaster, 20 min on Day 4 rising 2.5 min per Core & Cardio day to 57.5 min on Day 64 (2.103.0); there are no rest days). The id stays `my_6day_chest_back_legs_sharms`. Odd blocks = free-weight days, even blocks = machine days. Exercise ids are `<id>_d<dayNumber>_<slug>`.
- Exercises: only ones he already does (CLAUDE.md rule 9). 3.22.0 (module 147) put Cable Seated Rows (Wide Bar) on Day 13/29/45/61 instead of Neutral-Grip Seated Cable Row (2.75.0 had matched his Week B wording to it); the split's one cable row is the wide-bar row (tests/widerow.py).
- Wording for this program only (module 114): Home badge "Day N of 64", the week row says "n/48 workouts done", no "Switch week".
- The old weekend rule (start Sat/Sun so the last rest day is a weekend) no longer applies: Day 64 is a Core & Cardio day.
- History: 2.92.0 made it 16 days in two week groups (old day numbers `[1,2,3,7,4,5,6,15, 8,9,10,14,11,12,13,16]` by position), 2.93.0 made that 8 weeks. Module 114 renumbers a saved copy to 1..64 (`PT.split64.ORDER` maps position to old number) and moves logs, day notes, done/skipped with it. Modules 096/112/113 (the week-plan migrations) were deleted in 2.106.0: they could only act when the built-in program had a `weekPlan`.
- Tests: `tests/common.py` `old8(p)` rebuilds the old 16-day, 8-week shape (abs back on the leg days, empty rest days) (and patches BUILTIN_PROGRAMS) so the week-plan tests (weeks.py, fill.py, nofront.py) still have a fixture with weeks.
