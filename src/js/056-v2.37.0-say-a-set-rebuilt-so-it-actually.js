
/* =====================================================================
 * PulseTrack 2.37.0: "Say a set", rebuilt so it actually works.
 *  - Understands how people really talk in a gym: "bench 185 for 8", "one eighty five for eight", "two plates for five",
 *    "8 reps at 135", "225 x 5", "pull ups 12", "curl forty five pounds ten reps". Phones often write "for" as "4", so
 *    "185 4 8" is read as 185 for 8.
 *  - Never fills a set blind: a small panel shows what it heard, with the exercise, weight and reps ready to fix, and a
 *    Log set button. Settings can switch it to "log right away" (with Undo) or off.
 *  - If the phone can't listen (no internet, mic blocked, home-screen app on an iPhone) it says why and offers to type the
 *    set in the same panel.
 * Settings: settings.voiceSet = "ask" (default) | "auto" | "off".
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  const proto = ApplicationUI.prototype;
  const A = () => window.app;
  const $ = id => document.getElementById(id);
  const esc = s => PT.esc(s);
  const SRC = () => window.SpeechRecognition || window.webkitSpeechRecognition;
  const mode = a => { const m = a && a.settings && a.settings.voiceSet; return m === "off" || m === "auto" ? m : "ask"; };

  /* ================================================================ the parser */
  const ONES = Object.assign(Object.create(null), { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19 });
  const TENS = Object.assign(Object.create(null), { twenty: 20, thirty: 30, forty: 40, fourty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 });
  const isNumWord = w => w in ONES || w in TENS || w === "hundred" || w === "oh";

  /** Turn runs of spoken number words into digits: "one eighty five" -> "185". */
  function wordsToDigits(text) {
    const tok = text.split(/\s+/).filter(Boolean), out = [];
    for (let i = 0; i < tok.length;) {
      if (!isNumWord(tok[i]) || tok[i] === "oh") { out.push(tok[i]); i++; continue; }
      let j = i; while (j < tok.length && (isNumWord(tok[j]) || (tok[j] === "and" && j + 1 < tok.length && isNumWord(tok[j + 1]) && /hundred/.test(tok.slice(i, j).join(" "))))) j++;
      const run = tok.slice(i, j).filter(w => w !== "and"); i = j;
      let k = 0;
      while (k < run.length) {
        const w = run[k], n1 = run[k + 1], n2 = run[k + 2], n3 = run[k + 3];
        if (w === "oh") { out.push("0"); k++; continue; }
        if (w in ONES && ONES[w] >= 1 && ONES[w] <= 9 && n1 === "hundred") {          // one hundred [and] eighty [five]
          let v = ONES[w] * 100, used = 2;
          if (n2 in TENS) { v += TENS[n2]; used = 3; if (n3 in ONES && ONES[n3] >= 1 && ONES[n3] <= 9) { v += ONES[n3]; used = 4; } }
          else if (n2 in ONES) { v += ONES[n2]; used = 3; }
          out.push(String(v)); k += used; continue;
        }
        if (w in ONES && ONES[w] >= 1 && ONES[w] <= 9 && n1 === "oh" && n2 in ONES && ONES[n2] >= 1 && ONES[n2] <= 9) {   // two oh five
          out.push(String(ONES[w] * 100 + ONES[n2])); k += 3; continue;
        }
        if (w in ONES && ONES[w] >= 1 && ONES[w] <= 9 && n1 in TENS) {                   // one eighty [five]
          let v = ONES[w] * 100 + TENS[n1], used = 2;
          if (n2 in ONES && ONES[n2] >= 1 && ONES[n2] <= 9) { v += ONES[n2]; used = 3; }
          out.push(String(v)); k += used; continue;
        }
        if (w in ONES && ONES[w] >= 1 && ONES[w] <= 9 && n1 in ONES && ONES[n1] >= 10 && ONES[n1] <= 19) {   // three fifteen
          out.push(String(ONES[w] * 100 + ONES[n1])); k += 2; continue;
        }
        if (w in TENS) {                                                                   // eighty [five]
          let v = TENS[w], used = 1;
          if (n1 in ONES && ONES[n1] >= 1 && ONES[n1] <= 9) { v += ONES[n1]; used = 2; }
          out.push(String(v)); k += used; continue;
        }
        if (w === "hundred") { out.push("100"); k++; continue; }
        out.push(String(ONES[w])); k++;
      }
    }
    return out.join(" ");
  }

  const UNIT_W = /^(lb|lbs|pound|pounds|kg|kgs|kilo|kilos|kilogram|kilograms)$/;
  const UNIT_R = /^(rep|reps|repetition|repetitions)$/;
  const FILLER = new Set(["log", "set", "sets", "i", "did", "do", "add", "put", "record", "enter", "my", "the", "a", "an", "and", "for", "on", "with", "of", "at", "by", "x", "times", "time", "each", "per", "then", "it", "was", "is", "got", "hit", "just", "please", "uh", "um", "pounds", "pound", "lbs", "lb", "kg", "kgs", "kilo", "kilos", "reps", "rep", "plate", "plates", "to", "point", "next", "weight", "bodyweight"]);

  /**
   * "bench 185 for 8" -> { name: "bench", w: 185, r: 8 }
   * Also returns { single } when only one number was said, { bw: true } for bodyweight, { unit } when a unit was said.
   * opts.kg = true when plates are kilos (a "plate" then means 60 kg instead of 135 lb).
   */
  PT.parseVoiceSet = function (text, opts) {
    opts = opts || {};
    let t = " " + String(text || "").toLowerCase() + " ";
    t = t.replace(/[,!?]/g, " ").replace(/@/g, " at ").replace(/[×✕✖]/g, " x ").replace(/(\d)\s*x\s*(\d)/g, "$1 x $2").replace(/(\d)x\b/g, "$1 x").replace(/\bx(\d)/g, "x $1");
    t = t.replace(/\b(one|single)[ -](arm|leg|hand)\b/g, "$1$2").replace(/\b(\d+)[ -]?(degree)\b/g, "$1degree");
    t = t.replace(/-/g, " ").replace(/\ba hundred\b/g, "one hundred").replace(/\ba plate\b/g, "one plate").replace(/\bbody ?weight\b/g, " bodyweight ").replace(/\bno weight\b/g, " bodyweight ").replace(/\bunweighted\b/g, " bodyweight ");
    t = t.replace(/\.(?=\s|$)/g, " ").replace(/\s+/g, " ");
    t = wordsToDigits(t.trim());
    t = t.replace(/(\d+)\s+and a half\b/g, "$1.5").replace(/(\d+)\s+point\s+(\d)\b/g, "$1.$2");
    const tok = t.split(" ").filter(Boolean), isNum = s => /^\d+(?:\.\d+)?$/.test(s);
    let wt = null, rp = null, unit = null, plates = null, bw = tok.indexOf("bodyweight") >= 0;
    const used = new Array(tok.length).fill(false), un = [];
    tok.forEach((s, i) => {
      if (!isNum(s)) return;
      const nx = tok[i + 1], v = parseFloat(s);
      if (nx && /^plates?$/.test(nx)) { if (plates === null) plates = v; used[i] = true; return; }
      if (nx && UNIT_W.test(nx)) { if (wt === null) { wt = v; unit = /^(kg|kgs|kilo|kilos|kilogram|kilograms)$/.test(nx) ? "kg" : "lb"; } used[i] = true; return; }
      if (nx && UNIT_R.test(nx)) { if (rp === null) rp = v; used[i] = true; return; }
      if (nx && /^times?$/.test(nx) && !(tok[i + 2] && isNum(tok[i + 2]))) { if (rp === null) rp = v; used[i] = true; return; }   // "8 times" is reps, "185 times 8" is a separator
      un.push({ v, i });
    });
    let single = null;
    if (wt === null && rp === null) {
      let u = un.map(x => x.v);
      if (u.length >= 3 && u[1] === 4) u = [u[0], u[u.length - 1]];     // "185 4 8": the phone wrote "for" as 4
      if (u.length >= 2) { wt = u[0]; rp = u[1]; } else if (u.length === 1) single = u[0];
    } else if (wt === null && un.length) { wt = un[0].v; }
    else if (rp === null && un.length) { rp = un[un.length - 1].v; }
    if (plates !== null && wt === null) {
      const n = Math.round(plates); wt = opts.kg ? 20 + 40 * n : 45 + 90 * n; if (single !== null && rp === null) { rp = single; single = null; }
    }
    if (bw && wt === null) { wt = 0; if (rp === null && single !== null) { rp = single; single = null; } }
    if (wt === null && rp === null && single === null && !bw) return null;
    let name = tok.filter((s, i) => !isNum(s) && !used[i] && !FILLER.has(s)).join(" ").replace(/\b(onearm)\b/g, "one arm").replace(/\b(oneleg)\b/g, "one leg").replace(/\b(singlearm)\b/g, "single arm").replace(/\b(singleleg)\b/g, "single leg").replace(/\b(\d+)degree\b/g, "$1 degree").replace(/\s+/g, " ").trim();
    // numbers that belong to a name (45 degree, 21s) were glued above; anything left is a number we kept
    return { name, w: wt, r: rp, single, bw, unit, plates };
  };

  /* ================================================================ finding the exercise */
  const ALIAS = [[/\brdls?\b/g, "romanian deadlift"], [/\bsldls?\b/g, "stiff leg deadlift"], [/\bohp\b/g, "overhead press"], [/\bmilitary press\b/g, "overhead press"], [/\bdbs?\b/g, "dumbbell"], [/\bbbs?\b/g, "barbell"], [/\bdeads\b/g, "deadlift"], [/\bdead lifts?\b/g, "deadlift"], [/\blat pull downs?\b/g, "lat pulldown"], [/\btricep pushdowns?\b/g, "tricep pushdown"], [/\bchins?\b/g, "chin up"], [/\bpress ups?\b/g, "push up"], [/\bsit ups?\b/g, "sit up"], [/\bflyes\b/g, "fly"], [/\bcalves\b/g, "calf"]];
  const stem = w => w.length > 3 && /ies$/.test(w) ? w.slice(0, -3) + "y" : /sses$/.test(w) ? w.slice(0, -2) : /[^s]s$/.test(w) && w.length > 3 ? w.slice(0, -1) : w;
  const words = s => String(s || "").toLowerCase().replace(/[-/]/g, " ").replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter(Boolean).map(stem);
  const tokMatch = (a, b) => a === b || (a.length >= 4 && b.startsWith(a)) || (b.length >= 4 && a.startsWith(b));
  const STOP = new Set(["the", "a", "an", "of", "on", "with", "and", "to", "in", "my"]);
  /** how well a spoken name fits an exercise name, 0 to 1 */
  function fit(spoken, exName) {
    let t = " " + String(spoken || "").toLowerCase() + " ";
    ALIAS.forEach(([re, to]) => { t = t.replace(re, to); });
    const sp = words(t).filter(w => !STOP.has(w)), nm = words(exName);
    if (!sp.length) return 0;
    const joined = nm.join(""), hit = new Array(sp.length).fill(false);
    sp.forEach((w, i) => { if (nm.some(n => tokMatch(w, n))) hit[i] = true; });
    for (let i = 0; i + 1 < sp.length; i++) if (!(hit[i] && hit[i + 1]) && joined.indexOf(sp[i] + sp[i + 1]) >= 0) { hit[i] = hit[i + 1] = true; }   // "pull down" = pulldown
    const got = hit.filter(Boolean).length;
    return got / sp.length;
  }
  function openIndex(a, ex) {
    for (let s = 0; s < (ex.sets || 0); s++) { const e = a.logs[a.getLogKey(a.activeProgram.id, a.activeDay.dayNumber, ex.id, s)]; if (!(e && e.completed)) return s; }
    return -1;
  }
  const keyFor = (a, ex, s) => a.getLogKey(a.activeProgram.id, a.activeDay.dayNumber, ex.id, s);
  /** exercises of today's workout that fit the spoken name, best first. No name = the one you are on. */
  PT.voiceMatch = function (a, name) {
    a = a || A(); const exs = (a.activeDay && a.activeDay.exercises) || [], list = [];
    exs.forEach((ex, i) => {
      if (ex.type === "tabata" || (a.exKind && a.exKind(ex).cardio)) return;
      const f = name ? fit(name, ex.name) : 0;
      if (name && f < 0.5) return;
      list.push({ ex, i, score: f, open: openIndex(a, ex) });
    });
    if (name) list.sort((x, y) => (y.score - x.score) || ((y.open >= 0) - (x.open >= 0)) || (words(x.ex.name).length - words(y.ex.name).length) || (x.i - y.i));
    return list;
  };
  /** the exercise you are on: first one with an open set, or the last one when everything is done */
  function currentEx(a) {
    const exs = ((a.activeDay && a.activeDay.exercises) || []).filter(ex => ex.type !== "tabata" && !(a.exKind && a.exKind(ex).cardio));
    return exs.find(ex => openIndex(a, ex) >= 0) || exs[exs.length - 1] || null;
  }

  /* ================================================================ the panel */
  const V = { rec: null, st: "idle", text: "", ex: null, parsed: null, lastKey: null };
  const unitLabel = a => { try { return a.wLabel(); } catch (e) { return "lbs"; } };
  const kgOn = a => { try { return a.unit() === "kg"; } catch (e) { return false; } };
  const HINT = "Say it like “bench 185 for 8”, “two plates for 5” or “8 reps at 135”. Just “185 for 8” fills the set you are on.";

  function stopRec() { try { if (V.rec) { V.rec.onend = V.rec.onerror = V.rec.onresult = null; V.rec.abort ? V.rec.abort() : V.rec.stop(); } } catch (e) { } V.rec = null; }
  function sheetOpen() { const m = $("modal-sheet"); return !!(m && !m.classList.contains("hidden") && $("pt-vs")); }
  function showListening(a) {
    V.st = "listen";
    a.openSheet("Say a set", "Speak when the mic is on", `<div id="pt-vs" class="text-center space-y-3 py-2">
        <div class="pt-vs-mic" aria-hidden="true">🎤</div>
        <p id="pt-vs-live" class="text-sm font-bold text-white" aria-live="polite">Listening…</p>
        <p class="text-[11px] text-zinc-400 leading-snug">${esc(HINT)}</p></div>`,
      `<div class="flex gap-2"><button type="button" id="pt-vs-type" class="px-4 py-3 rounded-xl bg-zinc-800 text-zinc-200 font-bold text-sm tap-active">Type it</button><button type="button" id="pt-vs-cancel" class="flex-1 py-3 rounded-xl bg-zinc-700 text-white font-bold text-sm tap-active">Cancel</button></div>`);
  }
  function showError(a, msg, canRetry) {
    V.st = "error";
    a.openSheet("Say a set", "", `<div id="pt-vs" class="space-y-3"><p class="text-sm text-zinc-200 leading-snug">${msg}</p><p class="text-[11px] text-zinc-500 leading-snug">${esc(HINT)}</p></div>`,
      `<div class="flex gap-2"><button type="button" id="pt-vs-type" class="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm tap-active">Type the set instead</button>${canRetry ? `<button type="button" id="pt-vs-again" class="px-4 py-3 rounded-xl bg-zinc-800 text-zinc-200 font-bold text-sm tap-active">🎤 Again</button>` : ""}</div>`);
  }
  /** the confirm / type panel. p = parsed speech (may be null for typing) */
  function showConfirm(a, p, heard) {
    V.st = "confirm"; V.parsed = p;
    const exs = ((a.activeDay && a.activeDay.exercises) || []).map((ex, i) => ({ ex, i })).filter(o => o.ex.type !== "tabata" && !(a.exKind && a.exKind(o.ex).cardio));
    if (!exs.length) { a.toast("Open a workout with exercises first"); return; }
    let pick = null;
    if (p && p.name) { const m = PT.voiceMatch(a, p.name); if (m.length) pick = m[0].ex; }
    if (!pick) pick = currentEx(a) || exs[0].ex;
    V.ex = pick;
    const body = `<div id="pt-vs" class="space-y-3">
      ${heard ? `<p class="text-[11px] text-zinc-500">Heard: <i>“${esc(heard)}”</i></p>` : `<p class="text-[11px] text-zinc-400">Type the set. It goes into the next open set of the exercise.</p>`}
      ${p && p.name && !PT.voiceMatch(a, p.name).length ? `<p class="text-[12px] text-amber-300 leading-snug">No exercise in today's workout sounded like “${esc(p.name)}”. Pick it below.</p>` : ""}
      <label class="block"><span class="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Exercise</span>
        <select id="pt-vs-ex" class="w-full px-3 py-3 bg-zinc-950 border border-zinc-700 rounded-xl text-white text-sm">${exs.map(o => `<option value="${o.i}"${o.ex === pick ? " selected" : ""}>${esc(o.ex.name)}</option>`).join("")}</select></label>
      <div class="grid grid-cols-2 gap-2">
        <label class="block"><span class="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1" id="pt-vs-wl">Weight (${esc(unitLabel(a))})</span><input id="pt-vs-w" type="text" inputmode="decimal" autocomplete="off" class="w-full px-3 py-3 bg-zinc-950 border border-zinc-700 rounded-xl text-white text-lg font-bold text-center focus:outline-none focus:border-emerald-500"></label>
        <label class="block"><span class="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Reps</span><input id="pt-vs-r" type="text" inputmode="numeric" autocomplete="off" class="w-full px-3 py-3 bg-zinc-950 border border-zinc-700 rounded-xl text-white text-lg font-bold text-center focus:outline-none focus:border-emerald-500"></label>
      </div><p id="pt-vs-set" class="text-[11px] text-zinc-400"></p></div>`;
    a.openSheet("Say a set", "Check it, then log", body,
      `<div class="flex gap-2"><button type="button" id="pt-vs-again" class="px-4 py-3 rounded-xl bg-zinc-800 text-zinc-200 font-bold text-sm tap-active">🎤</button><button type="button" id="pt-vs-fill" class="px-4 py-3 rounded-xl bg-zinc-800 text-zinc-200 font-bold text-sm tap-active">Fill only</button><button type="button" id="pt-vs-log" class="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm tap-active">Log set ✓</button></div>`);
    fillFields(a, p);
  }
  /** weight and reps that go in the boxes: what was said, else what is already in the set, else the last set or last time */
  function defaults(a, ex) {
    const si = openIndex(a, ex), at = si < 0 ? (ex.sets || 0) : si;
    const cur = a.logs[keyFor(a, ex, at)] || {};
    let w = cur.weight, r = cur.reps;
    if (w === undefined || w === "") {
      for (let s = at - 1; s >= 0; s--) { const e = a.logs[keyFor(a, ex, s)]; if (e && e.weight !== undefined && e.weight !== "") { w = e.weight; if (r === undefined || r === "") r = e.reps; break; } }
    }
    if (w === undefined || w === "") { const lp = (a.lastPerf && a.lastPerf[ex.name] || [])[Math.min(at, 99)] || (a.lastPerf && a.lastPerf[ex.name] || []).slice(-1)[0]; if (lp) { w = lp.weight; if (r === undefined || r === "") r = lp.reps; } }
    return { w: w === undefined ? "" : String(w), r: r === undefined ? "" : String(r), si: at, isNew: si < 0 };
  }
  function fillFields(a, p) {
    const ex = V.ex, d = defaults(a, ex), wI = $("pt-vs-w"), rI = $("pt-vs-r"); if (!wI || !rI) return;
    let w = d.w, r = d.r;
    if (p) {
      if (p.w !== null && p.w !== undefined) w = String(p.w);
      if (p.r !== null && p.r !== undefined) r = String(p.r);
      if (p.single !== null && p.single !== undefined) {
        const bwEx = a.exKind && a.exKind(ex).bw;
        if (bwEx || (p.single <= 30 && d.w !== "")) r = String(p.single); else w = String(p.single);
      }
    }
    wI.value = w; rI.value = r;
    const done = ((a.activeDay.exercises || []).indexOf(ex)); void done;
    const s = $("pt-vs-set"); if (s) s.textContent = d.isNew ? "All sets are done, so this adds an extra set." : "This goes in set " + (d.si + 1) + " of " + ex.sets + ".";
    setTimeout(() => { const f = !wI.value ? wI : (!rI.value ? rI : null); if (f) f.focus(); }, 200);
  }
  const clean = v => String(v || "").replace(",", ".").replace(/[^\d.]/g, "");

  /** write the set; complete = also tick it (starts the rest timer, checks PRs) */
  function commit(a, ex, w, r, complete) {
    w = clean(w); r = clean(r);
    if (!r) { a.toast("Add the reps first"); return false; }
    let si = openIndex(a, ex);
    if (si < 0) si = a.changeSets(ex, 1) - 1;
    const key = keyFor(a, ex, si);
    a.logs[key] = Object.assign({ completed: false, tag: "R" }, a.logs[key], { weight: w, reps: r });
    WorkoutStorage.saveLogs(a.logs); WorkoutStorage.setData(a.data);
    a.renderWorkoutView();
    V.lastKey = key;
    if (complete) {
      const btn = document.querySelector('.btn-check-set[data-key="' + key + '"]');
      if (btn && btn.dataset.completed !== "1") btn.click();
    }
    return { key, si };
  }
  function doLog(complete) {
    const a = A(), exs = (a.activeDay && a.activeDay.exercises) || [], ex = exs[parseInt(($("pt-vs-ex") || {}).value, 10)] || V.ex; if (!ex) return;
    const w = ($("pt-vs-w") || {}).value, r = ($("pt-vs-r") || {}).value;
    const res = commit(a, ex, w, r, complete); if (!res) return;
    a.closeSheet(); V.st = "idle";
    a.toast(ex.name + ": " + (clean(w) || "0") + " × " + clean(r) + (complete ? " logged" : " filled in. Tap ✓ to finish it."));
  }

  /* ================================================================ listening */
  function friendlyError(code) {
    const ios = /iP(hone|ad|od)/.test(navigator.userAgent) && (navigator.standalone || (window.matchMedia && matchMedia("(display-mode: standalone)").matches));
    if (code === "not-allowed" || code === "service-not-allowed") return ios
      ? "iPhone home-screen apps can't use the microphone for this. Open PulseTrack in Safari to talk to it, or type the set."
      : "The microphone is blocked for PulseTrack. Allow it in your browser's site settings, or type the set.";
    if (code === "network") return "Voice needs internet on most phones, because the phone sends the sound to its speech service. You're offline or the signal is weak. You can type the set instead.";
    if (code === "no-speech") return "I didn't hear anything. Tap 🎤 and say it right after it starts listening.";
    if (code === "audio-capture") return "I can't find a microphone on this device.";
    if (code === "language-not-supported") return "This phone has no offline speech pack for English. Type the set instead.";
    return "Voice didn't work this time. You can try again or type the set.";
  }
  function handleText(a, text, alts) {
    const kg = kgOn(a);
    let p = null, heard = text;
    for (const t of [text].concat(alts || [])) { const q = PT.parseVoiceSet(t, { kg }); if (q && (q.w !== null || q.r !== null || q.single !== null)) { p = q; heard = t; break; } }
    if (!p) { showError(a, text ? "I heard “" + esc(text) + "” but couldn't find a weight and reps in it." : "I didn't catch that.", true); return; }
    // log right away when it is a clean, complete set for one exercise
    if (mode(a) === "auto" && p.w !== null && p.r !== null) {
      const m = p.name ? PT.voiceMatch(a, p.name) : [];
      const ex = p.name ? (m.length && (m.length === 1 || m[0].score > m[1].score) ? m[0].ex : null) : currentEx(a);
      if (ex) {
        const res = commit(a, ex, p.w, p.r, true);
        if (res) { a.closeSheet(); V.st = "idle"; const k = res.key; a.toast(ex.name + ": " + p.w + " × " + p.r + " logged", "Undo", () => { const b = document.querySelector('.btn-check-set[data-key="' + k + '"]'); if (b && b.dataset.completed === "1") b.click(); }, 6000); return; }
      }
    }
    showConfirm(a, p, heard);
  }
  async function startListening() {
    const a = A(), SR = SRC(); if (!a) return;
    if (!a.activeDay || !((a.activeDay.exercises || []).length)) { a.toast("Open a workout first"); return; }
    if (!SR) { showConfirm(a, null, ""); return; }
    stopRec();
    if (navigator.onLine === false && !(SR.available)) { showError(a, friendlyError("network"), false); return; }
    let rec;
    try { rec = new SR(); } catch (e) { showError(a, friendlyError(""), false); return; }
    V.rec = rec; V.text = ""; let done = false, alts = [];
    rec.lang = /^en/i.test(navigator.language || "") ? navigator.language : "en-US";
    rec.continuous = false; rec.interimResults = true; rec.maxAlternatives = 4;
    // newer phones can listen on the device itself, which also works with no signal
    try {
      if (SR.available && "processLocally" in rec) { const st = await SR.available({ langs: [rec.lang], processLocally: true }); if (st === "available") rec.processLocally = true; }
    } catch (e) { }
    const finish = (code) => {
      if (done) return; done = true; clearTimeout(V.timer); V.rec = null;
      if (!sheetOpen() || V.st !== "listen") return;
      if (code && !V.text) { showError(a, friendlyError(code), code !== "not-allowed" && code !== "service-not-allowed" && code !== "audio-capture"); return; }
      handleText(a, V.text, alts);
    };
    rec.onstart = () => { const el = $("pt-vs-live"); if (el) el.textContent = "Listening…"; };
    rec.onresult = e => {
      try {
        const r = e.results[e.results.length - 1]; V.text = r[0].transcript.trim();
        alts = []; for (let i = 1; i < r.length; i++) alts.push(r[i].transcript.trim());
        const el = $("pt-vs-live"); if (el) el.textContent = "“" + V.text + "”";
        if (r.isFinal) { try { rec.stop(); } catch (er) { } }
      } catch (er) { console.error("PulseTrack voice", er); }
    };
    rec.onspeechend = () => { try { rec.stop(); } catch (e) { } };
    rec.onerror = e => { finish(e && e.error); };
    rec.onend = () => { finish(""); };
    V.timer = setTimeout(() => { try { rec.stop(); } catch (e) { } setTimeout(() => finish(""), 1500); }, 12000);
    showListening(a);
    try { rec.start(); } catch (e) { finish("audio-capture"); }
  }

  /* ================================================================ wiring */
  document.addEventListener("click", e => {
    const a = A(); if (!a || !e.target.closest) return;
    if (e.target.closest("#pt-voice-btn")) { startListening(); return; }
    if (e.target.closest("#pt-vs-cancel")) { stopRec(); V.st = "idle"; a.closeSheet(); return; }
    if (e.target.closest("#pt-vs-type")) { stopRec(); showConfirm(a, null, ""); return; }
    if (e.target.closest("#pt-vs-again")) { startListening(); return; }
    if (e.target.closest("#pt-vs-log")) { doLog(true); return; }
    if (e.target.closest("#pt-vs-fill")) { doLog(false); return; }
    const s = e.target.closest("[data-vs-mode]"); if (s) { a.settings.voiceSet = s.dataset.vsMode; try { WorkoutStorage.saveSettings(a.settings); } catch (er) { } drawSettings(); decorate(a); return; }
  });
  document.addEventListener("change", e => {
    const a = A(); if (!a || !e.target || e.target.id !== "pt-vs-ex") return;
    const ex = (a.activeDay.exercises || [])[parseInt(e.target.value, 10)]; if (!ex) return;
    V.ex = ex; const w = ($("pt-vs-w") || {}).value, r = ($("pt-vs-r") || {}).value;
    fillFields(a, { w: w === "" ? null : w, r: r === "" ? null : r, single: null });
  });
  document.addEventListener("keydown", e => { if (e.key === "Enter" && e.target && (e.target.id === "pt-vs-w" || e.target.id === "pt-vs-r")) { e.preventDefault(); doLog(true); } });
  document.addEventListener("visibilitychange", () => { if (document.hidden && V.st === "listen") { stopRec(); V.st = "idle"; const a = A(); if (a) a.closeSheet(); } });

  /** the mic button on the workout screen */
  function decorate(a) {
    const bar = $("pt-wtools"); if (!bar) return;
    let b = $("pt-voice-btn");
    const show = !!SRC() && mode(a) !== "off";
    if (!show) { if (b) b.remove(); return; }
    if (!b) { b = document.createElement("button"); b.type = "button"; b.id = "pt-voice-btn"; b.textContent = "🎤 Say a set"; b.setAttribute("aria-label", "Say a set out loud"); bar.appendChild(b); }
  }
  const oRW = proto.renderWorkoutView;
  proto.renderWorkoutView = function () { const r = oRW.apply(this, arguments); try { decorate(this); } catch (e) { console.error("PulseTrack voice", e); } return r; };

  /* ================================================================ Settings */
  function drawSettings() {
    const a = A(); if (!a) return; let box = $("pt-voiceset-set");
    if (!box) { const ref = $("pt-gym-row") || $("pt-textsize"); if (!ref) return; box = document.createElement("div"); box.id = "pt-voiceset-set"; box.className = "mt-3"; ref.insertAdjacentElement("afterend", box); }
    const m = mode(a), has = !!SRC();
    box.innerHTML = `<span class="block text-xs font-bold text-zinc-100">Say a set (mic button)</span>
      <span class="block text-[11px] text-zinc-400 mb-1.5">${has ? "Talk instead of typing: “bench 185 for 8”. Most phones need internet for it, so it can fail in a basement gym. You can always type the set in the same panel." : "This browser has no speech input, so the mic button stays hidden."}</span>
      ${has ? `<div class="flex flex-wrap gap-1.5"><button type="button" class="pt-opt tap-active" data-vs-mode="ask" aria-pressed="${m === "ask"}">Ask first</button><button type="button" class="pt-opt tap-active" data-vs-mode="auto" aria-pressed="${m === "auto"}">Log right away</button><button type="button" class="pt-opt tap-active" data-vs-mode="off" aria-pressed="${m === "off"}">Off</button></div>` : ""}`;
  }
  const oEx = proto.renderSettingsExtras;
  proto.renderSettingsExtras = async function () { const r = oEx ? await oEx.apply(this, arguments) : undefined; try { drawSettings(); } catch (e) { console.error("PulseTrack voice settings", e); } return r; };

  const css = document.createElement("style"); css.id = "pt-v237-voice-css";
  css.textContent = `
    .pt-vs-mic { width: 4.5rem; height: 4.5rem; margin: .25rem auto; border-radius: 9999px; display: flex; align-items: center; justify-content: center; font-size: 2rem; background: rgb(var(--a600)); animation: pt-vs-pulse 1.4s ease-out infinite; }
    @keyframes pt-vs-pulse { 0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, .55); } 100% { box-shadow: 0 0 0 1.4rem rgba(16, 185, 129, 0); } }
    @media (prefers-reduced-motion: reduce) { .pt-vs-mic { animation: none; } }
  `;
  document.head.appendChild(css);
  PT.voiceState = () => ({ st: V.st, ex: V.ex && V.ex.name, key: V.lastKey });
})();
  