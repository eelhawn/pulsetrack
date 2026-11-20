/* =====================================================================
 * PulseTrack 3.3.0: the guide (search-based answers).
 *  Ask in the Search box, or open the side menu > Guide: "how do I do a Romanian deadlift?", "where do I change my rest timer?",
 *  "what's next in today's workout?", "when did I last bench?". Answers come from the app's own data, worked out on the phone:
 *    - a help index of every screen and setting (HELP below), each with a "Take me there" that opens the screen, the tab, or
 *      Settings with the right section opened and the setting lit up;
 *    - the exercise list (form cues, the common mistake, what it trains) with a plain safety line;
 *    - your workout in progress and your current program (what's next);
 *    - your history ("last time", best estimated 1RM).
 *  Questions about pain, injuries, medicine or doses get a short "see a doctor or a qualified trainer" answer, never advice.
 *  Fuzzy matching is done here in plain JavaScript (words, spelling slips, short names like RDL, OHP, DB): PT.fuzzy.
 *  One way in for every backend: PT.guide.answer(question, context) -> Promise<{ backend, kind, title, text, list, avoid, note,
 *  actions: [{ label, nav }], score }>. "search" is the only backend in 3.3.0 and it always works offline; later backends must fall
 *  back to it. PT.guide.go(nav) does the "Take me there". Nothing is sent anywhere.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  const A = () => window.app, $ = id => document.getElementById(id), esc = s => PT.esc(s);

  /* ================================================================ fuzzy matching */
  const SYN = { rdl: "romanian deadlift", rdls: "romanian deadlift", ohp: "overhead press", db: "dumbbell", dbs: "dumbbell", bb: "barbell", kb: "kettlebell",
    pullup: "pull up", pullups: "pull up", pushup: "push up", pushups: "push up", chinup: "chin up", chinups: "chin up", situp: "sit up", situps: "sit up",
    bench: "bench", squats: "squat", lbs: "lb", kgs: "kg", colour: "color", colours: "color", favourite: "favorite", tricep: "triceps", bicep: "biceps",
    abs: "abs", lat: "lat", lats: "lat", delts: "delt", glute: "glute", glutes: "glute", hammy: "hamstring", hammies: "hamstring", "1rm": "one rep max", orm: "one rep max" };
  const STOP = new Set(("a an the to of on in for at by with and or is are am be do does did doing can could should would will i me my mine you your it its this that " +
    "there here how what whats where wheres when which who why please pls tell show find get see want need know about into from up out just also").split(" "));
  const norm = s => String(s == null ? "" : s).toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9+]+/g, " ").trim();
  const stem = w => w.length > 4 && /[^s]s$/.test(w) ? w.slice(0, -1) : w;
  function toks(s, keepStop) {
    const out = [];
    norm(s).split(" ").forEach(w => { if (!w) return; const r = SYN[w]; (r ? r.split(" ") : [w]).forEach(x => { if (keepStop || !STOP.has(x)) out.push(stem(x)); }); });
    return out;
  }
  function lev(a, b) {
    if (a === b) return 0;
    if (!a.length) return b.length; if (!b.length) return a.length;
    let prev = Array.from({ length: b.length + 1 }, (_, i) => i), cur = new Array(b.length + 1);
    for (let i = 1; i <= a.length; i++) {
      cur[0] = i;
      for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      [prev, cur] = [cur, prev];
    }
    return prev[b.length];
  }
  /** how alike two single words are, 0..1 (a typed start of a word counts, so "pulld" finds "pulldown") */
  function wsim(q, t) {
    if (q === t) return 1;
    if (q.length >= 3 && t.startsWith(q)) return 0.9;
    if (t.length >= 4 && q.startsWith(t)) return 0.85;
    const d = lev(q, t), m = Math.max(q.length, t.length);
    if (m <= 3) return d === 0 ? 1 : 0;
    const r = 1 - d / m;
    return r >= 0.72 ? r : 0;
  }
  /** how well the words of a question cover the words of a target, 0..1 (a bit like rapidfuzz's token set ratio) */
  function score(qt, tt) {
    if (!qt.length || !tt.length) return 0;
    let sum = 0, hit = 0;
    qt.forEach(q => { let b = 0; tt.forEach(t => { const s = wsim(q, t); if (s > b) b = s; }); sum += b; if (b > 0) hit++; });
    const cover = sum / qt.length;
    // reward targets whose own words are all present (an exact short name beats a long name that contains it)
    let back = 0; tt.forEach(t => { let b = 0; qt.forEach(q => { const s = wsim(q, t); if (s > b) b = s; }); back += b; });
    const precision = back / tt.length;
    return hit ? cover * 0.75 + precision * 0.25 : 0;
  }
  PT.fuzzy = { norm, toks, lev, wsim, score };

  /* ================================================================ help index: every screen and setting */
  // nav: "view:NAME[#selector]" a screen (and light up a control on it), "progress:TAB", "set:SELECTOR" Settings opened at that control,
  //      "click:SELECTOR" press a control (side menu tools), "fn:NAME" an action below
  const HELP = [
    ["home", "Home", "home, start screen, main screen, dashboard, front page", "Home shows today's plan, this week, and quick ways to start. Tap Home in the tab bar.", "view:home"],
    ["programs", "Programs", "programs, routine, routines, plan, split, pick a program, change program, switch program, choose program, new program", "Programs is where you pick, build or import a program. Open the side menu and tap Programs.", "view:programs"],
    ["days", "Pick a day", "jump to day, change day, pick a day, choose day, other day, skip ahead", "Open your program's day list and tap any day to train it. In Programs, open the program, then pick a day.", "view:days"],
    ["workout", "Today's workout", "workout, todays workout, current workout, log sets, log a set, start workout, train", "Your workout in progress is on the Workout tab.", "view:workout"],
    ["history", "History", "history, past workouts, previous workouts, workout log, saved workouts, old workouts", "History lists every saved workout. Tap one to see it, edit it, share it or do it again.", "view:history"],
    ["addpast", "Add a past workout", "add past workout, forgot to log, log old workout, add workout to history, missed logging, add a workout i did", "In History, tap + Add a past workout. Add exercises and sets, the day and the start time. If you don't know how long it took, leave \"I don't know\" ticked and the time is worked out from the sets.", "view:history#btn-history-add"],
    ["editpast", "Edit a past workout", "edit workout, edit old workout, edit past workout, change workout time, fix workout, edit history, change date, wrong time, add set to old workout, change duration, workout length", "In History, open the workout and tap Edit. You can change its name, day, start time and length, any set, and add or remove sets and exercises.", "view:history"],
    ["delpast", "Delete a workout", "delete workout, remove workout, delete history", "In History, open the workout and tap Delete Workout at the bottom. Records are worked out again.", "view:history"],
    ["sharepast", "Share a workout", "share workout, send workout, share a day", "In History, open the workout and tap Share. On the workout screen, More > Share day sends today's plan.", "view:history"],
    ["progress", "Progress", "progress, stats, statistics, analytics, charts, graphs, trends", "Progress has Overview, Muscles, Strength, History, Badges and Social tabs.", "progress:overview"],
    ["records", "Records", "records, prs, pr, personal best, personal record, best lift, max", "Your latest records are in Progress > Overview, and every record over time in Progress > History. Each exercise's sheet shows its own best.", "progress:overview"],
    ["strength", "Strength levels", "strength level, strength levels, ranks, rank, standards, how strong am i, strength standards", "Progress > Strength compares your lifts with people of your body weight. Log your body weight first.", "progress:strength"],
    ["muscles", "Muscle map", "muscle map, sets per muscle, body map, volume per muscle, weekly targets, muscles worked, muscle balance", "Progress > Muscles shows your sets per muscle on a body map, and your weekly targets per muscle.", "progress:muscles"],
    ["badges", "Badges", "badges, achievements, milestones, medals", "Progress > Badges shows every badge, what you have earned and how close you are to the rest.", "progress:badges"],
    ["group", "Group board", "group, friends, group board, compete, buddy, leaderboard, train together, share with friends", "Progress > Social has the group board (start one or join with a code) and ways to share with friends.", "progress:social"],
    ["recap", "Recaps", "monthly recap, wrapped, year in review, report, month, weekly report, recap", "Progress > History has your weekly report, monthly report card, monthly recap and year in review.", "progress:history"],
    ["deload", "Deload and plateaus", "deload, plateau, stuck, stalled, not progressing", "Progress > Overview has the deload check and the plateau check (lifts that stopped climbing).", "progress:overview"],
    ["library", "Exercise library", "exercise library, exercise list, all exercises, find exercise, browse exercises", "Open the side menu and tap Exercise Library to browse every exercise by muscle.", "view:library"],
    ["myex", "My exercises", "my exercises, custom exercise, create exercise, new exercise, add my own exercise", "Open the side menu and tap My Exercises, or + Create your own exercise in the Exercise Library.", "click:#pt-drawer-myex"],
    ["body", "Body weight", "body weight, weigh in, weight log, bodyweight log, log my weight, scale", "Body & Photos (side menu) logs your body weight and shows the trend.", "view:body"],
    ["measure", "Measurements", "measurements, waist, body fat, nutrition, calories, protein, chest measurement, arms measurement", "Body & Photos > Log today > More: measurements and nutrition.", "view:body"],
    ["photos", "Progress photos", "progress photos, photos, pictures, camera, before and after", "Body & Photos has progress photos with a guided camera and a before and after slider.", "view:body"],
    ["clips", "Form clips", "form clips, video, film, record my set, film my lift, form video", "Film a set with Form clips: the 🎥 Clips button on an exercise card, or Body & Photos > Form clips.", "view:body"],
    ["cardio", "Cardio & Sports", "cardio, running, run, walk, walking, bike, cycling, sports, steps, treadmill log, swim", "Cardio & Sports (Home or the side menu) logs runs, walks, rides and sports, apart from your lifting.", "view:cardio"],
    ["settings", "Settings", "settings, options, preferences, setup", "Settings is the gear at the top right.", "set:#modal-settings"],
    ["rest", "Rest timer", "rest timer, rest time, rest between sets, change rest, rest length, timer, rest period, how long to rest", "Each exercise card has a Rest button (for example \"Rest 1:30 ✎\") that changes the rest for that exercise. The default rest for each kind of lift is in Settings > Workout > Rest Times.", "set:#rest-mode-hint"],
    ["autorest", "Auto-start rest timer", "auto start rest, rest timer starts automatically, auto rest, start timer automatically", "Settings > Workout > Auto-start Rest Timer starts the rest when you check off a set.", "set:#setting-toggle-autorest"],
    ["restnotify", "Rest timer notification", "rest notification, timer notification, alert when rest is over, notify", "Settings > Sound, Voice & Feel > Rest Timer Notification.", "set:#setting-toggle-restnotify"],
    ["units", "Units (lb or kg)", "units, kg, kilograms, pounds, lb, metric, imperial, switch to kg", "Settings > Workout > Units switches between lb and kg.", "set:[data-unit=\"kg\"]"],
    ["increment", "Weight jump", "weight jump, increment, step up, how much to add, smallest plate, weight increase", "Settings > Workout > Weight Jump sets how much the suggestions add.", "set:#setting-increment"],
    ["goal", "Weekly goal", "weekly goal, days per week, goal, how many days, training days", "Settings > Workout > Weekly Goal. Your streak counts weeks you hit it.", "set:#setting-weekly-goal"],
    ["weekstart", "Week starts on", "week starts, start of week, monday, sunday, first day of week", "Settings > Workout > Week Starts On.", "set:#setting-week-start"],
    ["plates", "Bar and plates", "plates, bar weight, barbell weight, gym plates, my plates", "Settings > Workout > Gym Plates & Bar sets your bar and the plates you have.", "set:#btn-edit-gym-plates"],
    ["platecalc", "Plate calculator", "plate calculator, what plates, load the bar, plates per side", "Open the side menu and tap Plate Calculator.", "click:#btn-drawer-plate-calc"],
    ["rm", "1RM calculator", "1rm, one rep max, max calculator, estimate max, one rep max calculator", "Open the side menu and tap 1RM Calculator.", "click:#pt-drawer-1rm"],
    ["tabata", "Interval timer", "tabata, interval timer, hiit timer, intervals", "Open the side menu and tap Tabata Timer.", "click:#btn-drawer-quick-tabata"],
    ["gyms", "Gyms and equipment", "gyms, equipment, my gym, home gym, dumbbells i have, machines, kit, what equipment", "Settings > Gyms & Equipment: each gym has its own bar, plates, dumbbells and equipment, and the exercise list leaves out what it can't do.", "set:#pt-gyms-box"],
    ["equippics", "Machine pictures and LA Fitness notes", "machine picture, what machine, which machine, equipment picture, what does the machine look like, la fitness, hammer strength, life fitness, photo of the machine, gym chain", "Open any exercise: its Equipment section shows a drawing of the machine and how to spot it, and you can add your own photo of it. Settings > Gyms & Equipment > Machine notes for: pick LA Fitness for notes on their machines.", "set:#pt-gym-box"],   // 3.10.0
    ["timeoff", "Sick days and trips", "sick day, trip, vacation, holiday, time off, protect streak, streak, injured break", "Settings > Streaks & Time Off: sick and trip days don't break your streak.", "set:#pt-streak-box"],
    ["sound", "Sounds", "sound, sounds, beep, mute, quiet", "Settings > Sound, Voice & Feel > Sound Effects.", "set:#setting-toggle-sound"],
    ["voice", "Voice coaching", "voice, voice coaching, speak, spoken cues", "Settings > Sound, Voice & Feel > Voice Coaching.", "set:#setting-toggle-voice"],
    ["vibrate", "Vibration", "vibration, vibrate, haptics, buzz", "Settings > Sound, Voice & Feel > Vibration.", "set:#setting-toggle-vibrate"],
    ["themes", "Themes", "themes, theme, colors, look, skin, change color, change theme, style", "Settings > Themes opens the theme gallery: over 400 looks in groups, Surprise me, and Day & night.", "fn:themes"],
    ["appearance", "Appearance", "appearance, dark mode, light mode, accent color, font, corners, card style, contrast", "Settings > Appearance has mode, accent colour, background, font, corners, contrast and more.", "set:#pt-appearance"],
    ["largetext", "Text size", "large text, bigger text, font size, text size, small text, cant read", "Settings > Appearance > Large Text, and the text size next to it.", "set:#setting-toggle-largetext"],
    ["homelayout", "Home screen", "home screen, home layout, hide cards, home cards, remove from home", "Settings > Appearance > Home screen picks which cards Home shows.", "set:#pt-home-layout"],
    ["wscreen", "Workout screen", "workout screen, set rows, suggested weight, left hand, left handed, last time column, est 1rm column", "Settings > Workout Screen: suggestions, what each set row shows, left-hand mode and more.", "set:#pt-wscreen"],
    ["fillmode", "Fill in uses", "fill in, fill in weights, prefill, pre fill, ghost weights, heaviest set, most reps, last time numbers", "Settings > Workout Screen > Fill in uses: Suggested, Last time, Heaviest set or Most reps.", "set:#pt-fillmode"],
    ["typo", "Typo check", "typo check, did you mean, wrong weight, fat finger", "Settings > Appearance > Typo check asks before saving a weight far from last time.", "set:#setting-toggle-typo"],
    ["backup", "Backup and restore", "backup, back up, export data, save my data, restore, transfer phone, new phone, move data", "Settings > Data & Backup: Export Backup saves a file, Import Backup brings it back on any phone.", "set:#btn-export-backup"],
    ["csv", "Export to a spreadsheet", "csv, spreadsheet, excel, export history", "Settings > Data & Backup > Export CSV.", "set:#btn-export-csv"],
    ["importapps", "Import from another app", "import, hevy, strong, fitnotes, import from another app, bring my history", "Settings > Data & Backup > Import from Hevy, Strong or FitNotes.", "set:#btn-import-apps"],
    ["cleannames", "Clean up exercise names", "clean up names, rename exercises, merge exercises, duplicate names, same exercise twice", "Settings > Data & Backup > Clean Up Exercise Names merges other spellings of the same exercise.", "set:#btn-clean-names"],
    ["mods", "Mods and custom CSS", "mods, custom css, reskin, css", "Settings > Mods & Custom CSS.", "set:#pt-mods-box"],
    ["update", "Updates and installing", "update, check for updates, new version, install app, add to home screen, install", "Settings > App > Check for Updates. Install App shows when your phone can add it to the home screen.", "set:#btn-check-update"],
    ["legal", "Terms and privacy", "terms, privacy, privacy policy, terms of service, data collected", "Settings > App > Terms and Privacy.", "set:#btn-legal"],
    ["swap", "Swap an exercise", "swap exercise, replace exercise, machine taken, busy machine, change exercise, substitute", "On the workout screen, tap the swap button (two arrows) on the exercise card, or 🔁 Taken? when a machine is busy.", "view:workout"],
    ["addex", "Add an exercise", "add exercise, extra exercise, add exercise to workout, another exercise", "At the bottom of the workout, tap Add Exercise.", "view:workout"],
    ["superset", "Supersets", "superset, supersets, pair exercises, circuit", "On the workout screen, tap + Superset with next under an exercise.", "view:workout"],
    ["tags", "Warm-up and drop sets", "warm up set, warmup, drop set, tag set, mark warm up", "Tap the R next to a set to mark it W (warm-up) or D (drop set). Warm-ups don't count toward records or volume.", "view:workout"],
    ["sets", "Add or remove sets", "add set, remove set, more sets, fewer sets, extra set", "Under each exercise, tap + Set or − Set.", "view:workout"],
    ["note", "Exercise notes", "note, exercise note, notes, seat setting, machine settings", "Tap 📝 on an exercise card for a note, or ⚙ Setup for machine settings.", "view:workout"],
    ["finish", "Finish a workout", "finish workout, save workout, end workout, done with workout", "Tap Finish Workout at the bottom of the workout screen.", "view:workout"],
    ["skip", "Skip a day", "skip day, skip workout, skip today", "On the workout screen, tap ⋯ More > Skip day.", "view:workout"],
    ["guided", "Guided mode", "guided mode, one exercise at a time, guided", "On the workout screen, tap 🎯 Guided to go one exercise at a time.", "view:workout"],
    ["sayset", "Say a set", "say a set, voice logging, log by voice, speak sets", "On the workout screen, tap 🎤 Say a set and say the weight and reps.", "view:workout"],
    ["gymmode", "Gym mode", "gym mode, big buttons, bigger buttons", "On the workout screen, tap 🏋️ Gym mode for bigger buttons.", "view:workout"],
    ["build", "Build a workout", "build a workout, make me a workout, generate workout, quick workout, suggested workout", "Home > Build a Workout makes one from what you want to train and the time you have.", "view:home#pt-build-open"],
    ["empty", "Empty workout", "empty workout, freestyle, blank workout, start from scratch", "Home > Empty Workout, then add exercises as you go.", "view:home#tile-empty"],
    ["buildprogram", "Build a program", "build a program, create program, make a program, custom program, design program", "Programs > Build me a program, or Create your own.", "view:programs#pt-prog-build"],
    ["importprogram", "Import a program", "import program, paste program, share link, program file", "Programs has Paste a program, Import a file and Share link.", "view:programs"],
    ["starprog", "Star a program", "star, starred, star a program, favorite program, favourite program, save a program, pin a program, keep a program at the top", "Programs: tap the star on a program. Starred programs sit together at the top of the list, and the Starred chip shows only them. Tap the star again to take it off.", "view:programs"],   // 3.11.0
    ["calendar", "Training calendar", "calendar, schedule, plan workouts, add to calendar, phone calendar", "Home > This week > Calendar.", "view:home#pt-week-cal"],
    ["mobility", "Mobility and stretching", "mobility, stretch, stretching, warm up routine, cool down, flexibility", "Programs > Guided mobility or Stretch routine.", "fn:mobility"],
    ["preworkout", "Pre-workout protocol", "pre workout, protocol, supplements timing, caffeine timing, meal timing", "Home > Pre-workout protocol times what you eat or take before training. It only uses the times you enter.", "view:home#pt-home-fuel"],
    ["search", "Search", "search, look up, find a workout", "Search looks through exercises, programs, workouts, notes and cardio. It is the bar on Home and in the side menu.", "fn:search"],
    ["exsteps", "Step-by-step pictures", "step by step, exercise pictures, exercise photos, how to do it pictures, add my photo, add my own photo, add my own photo to an exercise, add photo to exercise, photo of an exercise, arrows, move arrows, exercise drawings", "Open an exercise (tap its name on a workout card, or in the Exercise Library): Step by step shows each step with a picture and arrows. Every step has Add my photo, and Move arrows fits the arrows to your photo.", "view:library"],
    ["exmuscles", "Muscles an exercise works", "muscles worked, what muscles, which muscles, body figure, primary muscles, secondary muscles, equipment needed, what equipment do i need", "Open an exercise: Muscles worked shows them on the body figure (strong for the main ones, light for the helping ones), the equipment, and where the values come from.", "view:library"],
    ["guidesrc", "Where the guide's answers come from", "guide answers, ai, ollama, local ai, local model, my computer, language model, llm, chatbot, cloud ai, claude, chatgpt, openai, gemini, anthropic, api key, where answers come from, use my computer for answers, guide settings", "Settings > Guide > Where answers come from. On this phone (the default) works answers out on the phone and sends nothing. My computer (Ollama) sends your question and the facts the guide found to Ollama on your own computer. Cloud AI (your key) sends them to Anthropic, OpenAI or Google with your own API key, after you agree to that part of the Privacy Policy. If either doesn't answer, the phone does.", "set:#pt-guide-box"],
    ["guide", "This guide", "help, guide, ask, how does this work, what can you do", "Ask how to do an exercise, where a setting is, what's next in your workout, or about your history.", ""]
  ].map(r => ({ id: r[0], title: r[1], keys: r[2].split(",").map(s => s.trim()), text: r[3], nav: r[4] }));
  let helpTok = null;
  const helpIndex = () => helpTok || (helpTok = HELP.map(h => ({ h, sets: [toks(h.title)].concat(h.keys.map(k => toks(k))) })));
  function helpMatch(q) {
    const qt = toks(q); if (!qt.length) return [];
    const nq = " " + norm(q) + " ";
    return helpIndex().map(x => ({ h: x.h, s: Math.max(...x.sets.map(t => score(qt, t))) + (nq.includes(" " + norm(x.h.title) + " ") ? 0.05 : 0) })).filter(x => x.s > 0.5).sort((a, b) => b.s - a.s);
  }

  /* ================================================================ exercises */
  let exIx = null, exLen = -1;
  function exIndex() {
    const db = (typeof EXERCISE_DATABASE !== "undefined" && Array.isArray(EXERCISE_DATABASE)) ? EXERCISE_DATABASE : [];
    if (exIx && exLen === db.length) return exIx;
    exLen = db.length;
    exIx = [];
    db.forEach((e, i) => { if (!e || !e.name) return; [e.name].concat(e.aka || []).forEach((n, k) => exIx.push({ e, i, t: toks(n), main: k === 0, og: !!e.og })); });
    return exIx;
  }
  // words that say what you want to know, not which exercise ("good" stays: Good Mornings)
  const EXSTOP = new Set(["last", "best", "time", "form", "technique", "tip", "cue", "proper", "correct", "today", "record", "pr", "max", "heaviest", "top", "history", "doing", "did", "lift", "lifted", "much", "heavy", "many", "ever", "work", "done", "doe", "again", "exercise"]);
  // one-word nicknames for the big lifts
  const NICK = { bench: "bench press", squat: "squat", deadlift: "deadlift", row: "barbell row", ohp: "overhead press", "overhead press": "overhead press", pullup: "pull up", "pull up": "pull up", pushup: "push up", "push up": "push up", "leg press": "leg press", "lat pulldown": "lat pulldown", pulldown: "lat pulldown" };
  function exMatch(q) {
    let qt = toks(q).filter(t => !EXSTOP.has(t)); if (!qt.length) return null;
    const nick = NICK[qt.join(" ")]; if (nick) qt = toks(nick);
    const qkey = qt.join(" ");
    const a = A(), used = new Map();
    try { (a.sessions || []).forEach(s => (s.ex || []).forEach(x => used.set(x.name, (used.get(x.name) || 0) + 1))); } catch (e) { }
    let best = null;
    exIndex().forEach(x => {
      let s = score(qt, x.t); if (s < 0.6) return;
      s += (x.main ? 0.01 : 0) + (x.og ? 0 : 0.02) + Math.min(0.03, (used.get(x.e.name) || 0) * 0.005) + (x.t.join(" ") === qkey ? 0.1 : 0);
      if (!best || s > best.s || (s === best.s && x.e.name.length < best.e.name.length)) best = { e: x.e, s };
    });
    return best && best.s >= 0.7 ? { e: best.e, s: Math.min(1, best.s) } : null;
  }

  /* ================================================================ intents */
  const RX = {
    safety: /\b(pain|painful|hurts?|hurting|injur(y|ies|ed)|sprain|strain(ed)?|torn|tear|swollen|swelling|numb|tingl|dizz|chest pain|doctor|physio|medic(ine|ation)|dose|dosage|dosing|mg\b|how much (creatine|caffeine|protein powder)|steroid|sarm|painkiller|ibuprofen)/i,
    next: /\b(what'?s|what is|whats)\s+(next|left|up next|on today|today)|\bnext (exercise|set|workout|day|up)\b|today'?s workout|what (do|should) i (do|train) (today|next)|what am i (doing|training) today/i,
    hist: /\b(last time|when did i|how (much|heavy|many) did i|my (best|pr|record|max|top set|heaviest)|personal (best|record)|how am i doing on|history (of|for))\b/i,
    nav: /\b(where|how (do|can) i (change|turn|set|find|open|get to|go to|add|edit|delete|remove|export|import|back ?up|switch|use|log|share|skip|swap|see|make|build|start|pick|hide|mute)|how to (change|turn|set|find|open|add|edit|delete|remove|export|import|switch|use|log|share|skip|swap|see|make|build|start|pick|hide)|settings? for|turn (on|off)|go to|take me to|open the)\b/i,
    form: /\b(how (do|to|should|can) (i|you|we)?\s*(do|perform|execute)|how to do|form (for|on|of)|form tips|technique|tips? (for|on)|cues? for|proper form|correct form|good form|teach me|show me how)\b|\bform\b/i
  };
  const SAFE = "These are general cues, not medical advice. If you have pain or an injury, check with a doctor or a qualified trainer before doing it.";
  const stripIntent = q => q.replace(/[?!.]+$/, "").replace(/\b(how (do|to|should|can) (i|you|we)?\s*(do|perform|execute)?|how to do|what'?s the|proper|correct|good form|form( (for|on|of))?|form tips|technique|tips?( (for|on))?|cues?( (for|on))?|teach me|show me how( to)?|properly|correctly|with good form|when did i( last)?|last time( i did)?|how (much|heavy|many) did i|my (best|pr|record|max|top set|heaviest)( on| for| in)?|personal (best|record)( on| for)?|what('?s| is| was)|history (of|for)|how am i doing on|where (is|are|do i find)( the)?|a|an|the)\b/gi, " ");

  function context() {
    const a = A(); if (!a) return {};
    const prog = a.activeProgram, day = a.activeDay;
    const c = { view: a._view || null, unit: a.unit && a.unit(), program: prog ? { id: prog.id, title: prog.title } : null, day: null, recent: [] };
    if (prog && day) {
      c.day = { title: (a.shortDayTitle && a.shortDayTitle(prog, day)) || ("Day " + day.dayNumber), exercises: (day.exercises || []).map(ex => {
        let done = 0; for (let s = 0; s < (ex.sets || 0); s++) { const e = a.logs[a.getLogKey(prog.id, day.dayNumber, ex.id, s)]; if (e && e.completed) done++; }
        return { name: ex.name, sets: ex.sets || 0, reps: ex.reps || "", done };
      }) };
    }
    c.recent = (a.sessions || []).slice().sort((x, y) => (y.ts || 0) - (x.ts || 0)).slice(0, 5).map(s => ({ date: s.date, title: s.dtitle, sets: s.sets, ex: (s.ex || []).map(e => e.name) }));
    return c;
  }

  function lastText(a, name) {
    const lp = a.lastPerf && a.lastPerf[name]; if (!lp || !lp.length) return "";
    const W = lp.filter(x => x && x.tag !== "W");
    return (W.length ? W : lp).slice(0, 6).map(x => (parseFloat(x.weight) > 0 ? PT.num(parseFloat(x.weight)) + "×" : x.bz ? "BW×" : "") + (x.reps || x.min + " min")).join(", ");
  }

  function nextAnswer(a, c) {
    const d = c.day;
    if (d && d.exercises.length && d.exercises.some(x => x.done > 0)) {
      const nx = d.exercises.find(x => x.done < x.sets);
      if (!nx) return { kind: "next", title: "All done", text: `Everything in ${d.title} is checked off. Tap Finish Workout to save it.`, actions: [{ label: "Go to my workout", nav: "view:workout" }] };
      const lt = lastText(a, nx.name);
      return { kind: "next", title: "Up next: " + nx.name, text: `Set ${nx.done + 1} of ${nx.sets}${nx.reps ? ", " + nx.reps + " reps" : ""}.${lt ? " Last time: " + lt + "." : ""}`, actions: [{ label: "Go to my workout", nav: "view:workout" }] };
    }
    if (d && d.exercises.length) {
      const first = d.exercises[0], lt = lastText(a, first.name);
      return { kind: "next", title: "Today: " + d.title, text: `You haven't logged a set yet. First up is ${first.name} (${first.sets} × ${first.reps || "?"})${lt ? ". Last time: " + lt : ""}.`, list: d.exercises.map(x => `${x.name}: ${x.sets} × ${x.reps || "?"}`), actions: [{ label: "Go to my workout", nav: "view:workout" }] };
    }
    const pid = PT.currentProgramId && PT.currentProgramId(), p = pid && (a.data.programs || []).find(x => x.id === pid);
    if (p) {
      const nd = a.nextDayOf(p);
      if (nd) return { kind: "next", title: "Next: " + ((a.shortDayTitle && a.shortDayTitle(p, nd)) || "Day " + nd.dayNumber), text: `Your next workout in ${p.title}.`, list: (nd.exercises || []).map(x => `${x.name}: ${x.sets} × ${x.reps || "?"}`), actions: [{ label: "Open that workout", nav: "day:" + p.id + ":" + nd.dayNumber }] };
    }
    return { kind: "next", title: "No program picked", text: "Pick a program, or start an empty workout, and I can tell you what's next.", actions: [{ label: "Open Programs", nav: "view:programs" }] };
  }

  function histAnswer(a, ex) {
    const name = ex.e.name;
    const canon = n => (PT.exName ? PT.exName(n) : n);
    const ses = (a.sessions || []).filter(s => (s.ex || []).some(e => canon(e.name) === name)).sort((x, y) => (y.ts || 0) - (x.ts || 0));
    if (!ses.length) return { kind: "history", title: name, text: "You haven't saved a workout with this exercise yet.", actions: [{ label: "Open " + name, nav: "ex:" + name }] };
    const s = ses[0], e = s.ex.find(x => canon(x.name) === name), u = s.unit === "kg" ? "kg" : "lbs";
    const sets = (e.sets || []).map(st => { try { return a.setText(e.name, st, u, s.unit); } catch (er) { return (st.w || "BW") + "×" + st.r; } });
    const pr = a.prs && a.prs[name];
    return { kind: "history", title: name, text: `Last time: ${PT.fmtDate(s.date, { weekday: "short", month: "short", day: "numeric" })}, ${sets.length} set${sets.length === 1 ? "" : "s"}. You've done it in ${ses.length} workout${ses.length === 1 ? "" : "s"}.${pr ? " Best estimated 1RM: " + PT.num(Math.round(pr)) + " " + a.wLabel() + "." : ""}`, list: sets, actions: [{ label: "Open " + name, nav: "ex:" + name }] };
  }

  function formAnswer(ex) {
    const e = ex.e, g = PT.exGuide ? PT.exGuide(e.name) : null;
    const steps = g && g.steps && g.steps.length ? g.steps.map(s => s.text) : (Array.isArray(e.tips) ? e.tips : []);
    let text = e.desc || (e.muscle ? `Mainly works the ${String(e.muscle).toLowerCase()}.` : "");
    // 3.5.0: with a guide, the muscles and the equipment from it
    if (g && (g.muscles || []).length && PT.muscleLabel) {
      const nm = m => PT.muscleLabel(m.muscle_id).toLowerCase() + (m.source === "estimate" ? " (estimate)" : "");
      const P = g.muscles.filter(m => m.role === "primary").map(nm), S = g.muscles.filter(m => m.role !== "primary").map(nm);
      text = `Works the ${P.join(" and ")}${S.length ? ", helped by the " + S.join(", ") : ""}.`;
      const it = (g.equipment && g.equipment.items) || [];
      if (it.length) text += /^body ?weight$/i.test(it[0]) && it.length === 1 ? " No equipment needed." : ` You need: ${it.join(", ")}.`;
    }
    return { kind: "form", title: e.name, text, list: steps.slice(0, 8), avoid: e.avoid || "", note: SAFE, actions: [{ label: (g && g.steps && g.steps.length) || (PT.figure && PT.figure.classify(e.name)) ? "See the steps with pictures" : "Open " + e.name, nav: "ex:" + e.name }] };
  }
  function helpAnswer(h, more) {
    const r = { kind: "help", title: h.title, text: h.text, actions: h.nav ? [{ label: "Take me there", nav: h.nav }] : [] };
    if (more && more.length) r.also = more.map(x => ({ label: x.h.title, nav: x.h.nav, text: x.h.text }));
    return r;
  }

  /** the search backend: the app's own data, no model, no network */
  function searchAnswer(question, c) {
    const a = A(), q = String(question || "").trim();
    if (!q) return null;
    if (RX.safety.test(q)) return { kind: "safety", title: "Talk to a professional", text: "I can't help with pain, injuries, medicine or doses. Please see a doctor, a physiotherapist or a qualified trainer. If something hurts during an exercise, stop.", actions: [], score: 1 };
    if (RX.next.test(q)) return Object.assign(nextAnswer(a, c), { score: 1 });
    const hm = helpMatch(q), em = exMatch(stripIntent(q)) || null;
    if (RX.hist.test(q) && em) return Object.assign(histAnswer(a, em), { score: em.s });
    if (RX.form.test(q) && !RX.nav.test(q) && em) return Object.assign(formAnswer(em), { score: em.s });
    if (RX.nav.test(q) && hm.length) return Object.assign(helpAnswer(hm[0].h, hm.slice(1, 3)), { score: hm[0].s });
    if (RX.nav.test(q) && em && /\bwhere\b/i.test(q)) return Object.assign(formAnswer(em), { kind: "form", score: em.s });
    // no clear intent: the stronger of the two
    const hs = hm.length ? hm[0].s : 0, es = em ? em.s : 0;
    if (hs >= 0.62 && hs >= es) return Object.assign(helpAnswer(hm[0].h, hm.slice(1, 3)), { score: hs });
    if (es >= 0.8) return Object.assign(formAnswer(em), { score: es });
    if (hs > 0) return Object.assign(helpAnswer(hm[0].h, hm.slice(1, 3)), { score: hs, weak: true });
    return { kind: "none", title: "No answer yet", text: "I couldn't match that to a screen, a setting or an exercise. Try other words, like \"rest timer\", \"export\", or an exercise name.", actions: [], score: 0 };
  }

  /* ================================================================ one way in for every backend */
  const BACKENDS = { search: { label: "On this phone", ask: (q, c) => Promise.resolve(searchAnswer(q, c)) } };
  async function answer(question, ctx, opts) {
    const c = ctx || context();
    const a = A(), want = (a && a.settings && a.settings.guideBackend) || "search", b = BACKENDS[want];
    let fell = "", why = "", sent = "";
    if (b && want !== "search" && !(opts && opts.local)) {
      try { const r = await b.ask(question, c); if (r && r.text) return Object.assign({ backend: want }, r); fell = b.label; }
      catch (e) {
        console.warn("PulseTrack guide backend", want, e && e.why ? e.why : e); fell = b.label;
        try { why = b.explain ? b.explain(e) : ""; } catch (er) { }
        sent = (e && e.sent) || "";   // 3.7.0: a request that went out and failed still shows what was sent
      }
    }
    const r = searchAnswer(question, c);   // always there: no model, no network
    return r ? Object.assign({ backend: "search" }, r, fell ? { fellBack: fell, fellWhy: why, sent } : {}) : null;
  }

  /* ================================================================ Take me there */
  function reveal(el) {
    if (!el) return false;
    for (let d = el.parentElement; d; d = d.parentElement) if (d.tagName === "DETAILS" && !d.open) d.open = true;
    setTimeout(() => {
      try { el.scrollIntoView({ block: "center", behavior: "smooth" }); } catch (e) { el.scrollIntoView(); }
      const t = el.closest(".flex, .p-3\\.5, label, button, details") || el;
      t.classList.remove("pt-gflash"); void t.offsetWidth; t.classList.add("pt-gflash");
      setTimeout(() => t.classList.remove("pt-gflash"), 2400);
    }, 120);
    return true;
  }
  function closeFind() { const f = $("pt-find"); if (f && PT.kit) PT.kit.closeSheet(f); }
  function go(nav) {
    const a = A(); if (!a || !nav) return false;
    closeFind();
    try { a.closeDrawer && a.closeDrawer(); } catch (e) { }
    const [kind, ...rest] = nav.split(":"), arg = rest.join(":");
    if (kind === "view") {
      const [v, sel] = arg.split("#");
      if ((v === "workout" || v === "days") && !(a.activeProgram && (v === "days" || a.activeDay))) {
        a.showView("programs"); a.toast(v === "workout" ? "No workout is open. Pick a program or a day first." : "Pick a program first."); return true;
      }
      a.showView(v);
      if (sel) setTimeout(() => reveal(document.getElementById(sel)), 250);
      return true;
    }
    if (kind === "progress") { a._progTab = arg; a.showView("progress"); return true; }
    if (kind === "set") {
      const btn = $("btn-open-settings"); if (btn) btn.click();
      setTimeout(() => { const el = arg === "#modal-settings" ? null : document.querySelector("#modal-settings " + arg); if (el) reveal(el); }, 200);
      return true;
    }
    if (kind === "click") { const el = document.querySelector(arg); if (el) { el.click(); return true; } return false; }
    if (kind === "ex") { a.openExerciseSheet(arg); return true; }
    if (kind === "day") {
      const [pid, dn] = arg.split(":"), p = (a.data.programs || []).find(x => x.id === pid), d = p && (p.days || []).find(x => String(x.dayNumber) === dn);
      if (!p || !d) return false;
      a.activeProgram = p; a.activeDay = d; try { AppStateMemory.saveActive(p.id, d.dayNumber); } catch (e) { }
      a.showView("workout"); return true;
    }
    if (kind === "fn") {
      if (arg === "themes" && PT.look && PT.look.openGallery) { PT.look.openGallery(); return true; }
      if (arg === "mobility" && PT.openMobility) { PT.openMobility(); return true; }
      if (arg === "search" && PT.search) { PT.search.open(""); return true; }
    }
    return false;
  }

  /* ================================================================ in the Search sheet */
  const EXAMPLES = ["How do I do a Romanian deadlift?", "Where do I change my rest timer?", "What's next in today's workout?", "When did I last bench?", "How do I back up my data?"];
  const QUESTION = /\?\s*$|^\s*(how|where|what|whats|what's|when|why|which|can|do|does|is|should|help)\b/i;
  let last = null, seq = 0, submitted = false;
  // Enter in the Search box (or a tapped example) counts as asking; the capture listener runs before Search's own handler
  document.addEventListener("keydown", e => { if (e.key === "Enter" && e.target && e.target.id === "pt-sq") submitted = true; }, true);
  function cardHtml(r) {
    if (!r) return "";
    const acts = (r.actions || []).map((x, i) => `<button type="button" class="pt-ga-go tap-active" data-gnav="${i}">${esc(x.label)}</button>`).join("");
    const also = (r.also || []).map((x, i) => `<button type="button" class="pt-ga-also tap-active" data-galso="${i}"><b>${esc(x.label)}</b><span>${esc(x.text)}</span></button>`).join("");
    return `<div class="pt-ga-card" data-kind="${esc(r.kind)}"><p class="pt-ga-k">Answer</p><p class="pt-ga-t">${esc(r.title)}</p>
      ${r.text ? `<p class="pt-ga-x">${esc(r.text)}</p>` : ""}
      ${r.list && r.list.length ? `<ol class="pt-ga-l">${r.list.map(t => `<li>${esc(t)}</li>`).join("")}</ol>` : ""}
      ${r.avoid ? `<p class="pt-ga-x"><b>Avoid:</b> ${esc(r.avoid)}</p>` : ""}
      ${r.note ? `<p class="pt-ga-n">${esc(r.note)}</p>` : ""}
      ${acts ? `<div class="pt-ga-acts">${acts}</div>` : ""}
      ${also ? `<p class="pt-ga-k pt-ga-k2">Also</p><div class="pt-ga-alsos">${also}</div>` : ""}
      ${r.by ? `<p class="pt-ga-by">${esc(r.by)}</p>` : r.fellBack ? `<p class="pt-ga-by">${esc(r.fellBack)} didn't answer${r.fellWhy ? " (" + esc(r.fellWhy) + ")" : ""}, so this answer is from the phone.</p>` : ""}
      ${r.sent ? `<details class="pt-ga-sent"><summary>What was sent</summary><pre>${esc(r.sent)}</pre></details>` : ""}</div>`;
  }
  async function show(q, card) {
    const box = card && card.querySelector("#pt-gans"); if (!box) return;
    const my = ++seq;
    q = String(q || "").trim();
    if (!q) {
      last = null;
      box.innerHTML = `<div class="pt-ga-ex"><p class="pt-ga-k">Ask a question</p><div class="pt-ga-chips">${EXAMPLES.map(x => `<button type="button" class="pt-ga-chip tap-active" data-gex="${esc(x)}">${esc(x)}</button>`).join("")}</div></div>`;
      return;
    }
    // a model is asked only when you press Enter or tap a question, never on every letter you type
    const a = A(), viaModel = a && a.settings && a.settings.guideBackend && a.settings.guideBackend !== "search" && submitted && QUESTION.test(q);
    submitted = false;
    if (viaModel) { const b = BACKENDS[a.settings.guideBackend]; box.innerHTML = `<div class="pt-ga-card"><p class="pt-ga-k">Answer</p><p class="pt-ga-x">Asking ${esc(b ? b.label : "the guide")}…</p></div>`; }
    const r = await answer(q, null, viaModel ? null : { local: true });
    if (my !== seq) return;
    const strong = r && r.kind !== "none" && !r.weak && (r.score >= 0.62 || r.kind === "next" || r.kind === "safety");
    if (!r || (!QUESTION.test(q) && !strong) || (r.kind === "form" && !QUESTION.test(q) && !RX.form.test(q))) { last = null; box.innerHTML = ""; return; }
    last = r;
    box.innerHTML = cardHtml(r);
  }
  PT.guide = { answer, context, go, show, help: () => HELP.slice(), backends: BACKENDS, searchAnswer, open: () => { if (PT.search) PT.search.open(""); setTimeout(() => { const i = $("pt-sq"); if (i) i.placeholder = "Ask: where is my rest timer?"; }, 30); } };

  document.addEventListener("click", e => {
    const t = e.target; if (!t || !t.closest) return;
    const ex = t.closest("[data-gex]");
    if (ex) { const i = $("pt-sq"); if (i) { i.value = ex.dataset.gex; i.dispatchEvent(new Event("input", { bubbles: true })); i.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })); } return; }
    const g = t.closest("[data-gnav]"); if (g && last) { const x = last.actions[+g.dataset.gnav]; if (x) go(x.nav); return; }
    const al = t.closest("[data-galso]"); if (al && last && last.also) { const x = last.also[+al.dataset.galso]; if (x && x.nav) go(x.nav); return; }
    const dg = t.closest("#pt-drawer-guide"); if (dg) { try { A().closeDrawer(); } catch (er) { } PT.guide.open(); }
  });

  // a way in from the side menu, next to Search
  function drawerItem() {
    if ($("pt-drawer-guide")) return;
    const s = $("pt-drawer-search"); if (!s) return;
    const b = s.cloneNode(true); b.id = "pt-drawer-guide";
    const ic = b.querySelector(".pt-dq-i"), lb = b.querySelector("span:last-child");
    if (ic && lb && ic !== lb) { ic.textContent = "💬"; lb.textContent = "Guide"; } else b.textContent = "💬 Guide";
    b.setAttribute("aria-label", "Guide: ask a question");
    s.insertAdjacentElement("afterend", b);
  }
  const proto = ApplicationUI.prototype, oHome = proto.renderHomeView;
  proto.renderHomeView = function () { const r = oHome.apply(this, arguments); try { drawerItem(); const sb = document.querySelector("#pt-home-search span"); if (sb && !/ask/.test(sb.textContent)) sb.textContent = "Search or ask a question"; } catch (e) { } return r; };

  const css = document.createElement("style"); css.id = "pt-v330-css";
  css.textContent = `
    .pt-ga-card, .pt-ga-ex { border-radius: 1rem; background: rgb(var(--z950)); border: 1px solid rgb(var(--a600) / .45); padding: .85rem .9rem; display: flex; flex-direction: column; gap: .45rem; }
    .pt-ga-ex { border-color: rgb(var(--z800)); }
    .pt-ga-k { font-size: .72rem; font-weight: 700; color: rgb(var(--z400)); margin: 0; }
    .pt-ga-k2 { margin-top: .2rem; }
    .pt-ga-t { font-size: .95rem; font-weight: 800; color: rgb(var(--z100)); margin: 0; overflow-wrap: anywhere; }
    .pt-ga-x { font-size: .8rem; line-height: 1.45; color: rgb(var(--z200)); margin: 0; }
    .pt-ga-x b { color: rgb(var(--z100)); }
    .pt-ga-l { margin: 0; padding-left: 1.2rem; list-style: decimal; display: flex; flex-direction: column; gap: .25rem; font-size: .8rem; line-height: 1.4; color: rgb(var(--z200)); }
    .pt-ga-n { font-size: .72rem; line-height: 1.4; color: rgb(var(--z300)); margin: 0; padding: .45rem .6rem; border-radius: .6rem; background: rgb(var(--z900)); }
    .pt-ga-acts { display: flex; flex-wrap: wrap; gap: .4rem; }
    .pt-ga-go { padding: .5rem .85rem; border-radius: .7rem; background: rgb(var(--a600)); color: #fff; font-size: .78rem; font-weight: 800; }
    .pt-ga-alsos { display: flex; flex-direction: column; gap: .35rem; }
    .pt-ga-also { text-align: left; padding: .5rem .65rem; border-radius: .7rem; background: rgb(var(--z900)); border: 1px solid rgb(var(--z800)); display: flex; flex-direction: column; gap: .1rem; }
    .pt-ga-also b { font-size: .78rem; color: rgb(var(--z100)); }
    .pt-ga-also span { font-size: .72rem; color: rgb(var(--z400)); line-height: 1.35; }
    .pt-ga-chips { display: flex; flex-wrap: wrap; gap: .35rem; }
    .pt-ga-by { font-size: .68rem; color: rgb(var(--z400)); margin: .1rem 0 0; }
    .pt-ga-sent > summary { font-size: .7rem; font-weight: 700; color: rgb(var(--z200)); cursor: pointer; margin-top: .2rem; }
    .pt-ga-sent pre { margin: .35rem 0 0; padding: .5rem .6rem; border-radius: .6rem; background: rgb(var(--z900)); border: 1px solid rgb(var(--z800)); color: rgb(var(--z300));
      font: 400 .68rem/1.45 ui-monospace, monospace; white-space: pre-wrap; overflow-wrap: anywhere; max-height: 16rem; overflow-y: auto; }
    .pt-ga-chip { padding: .45rem .7rem; border-radius: 999px; background: rgb(var(--z900)); border: 1px solid rgb(var(--z800)); color: rgb(var(--z200)); font-size: .75rem; font-weight: 600; text-align: left; }
    #pt-gans:not(:empty) { margin-bottom: .25rem; }
    #pt-gans:not(:empty) + #pt-sout > div.text-center { display: none; }   /* an answer is showing: no "Nothing found" under it */
    .pt-gflash { animation: ptGflash 2.2s ease-out 1; border-radius: .75rem; }
    @keyframes ptGflash { 0%, 40% { box-shadow: 0 0 0 3px rgb(var(--a500)); } 100% { box-shadow: 0 0 0 3px rgb(var(--a500) / 0); } }
    @media (prefers-reduced-motion: reduce) { .pt-gflash { animation: none; outline: 3px solid rgb(var(--a500)); outline-offset: 2px; } }
  `;
  document.head.appendChild(css);
})();
