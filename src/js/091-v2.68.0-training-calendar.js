/* =====================================================================
 * PulseTrack 2.68.0: add your training to your phone's calendar.
 *  Programs → ⋯ on a program → "Add to my calendar". One small sheet: first workout date, time, a reminder
 *  (none, at the start, 15 min, 30 min or 1 hour before), how many weeks, and which weekdays you train.
 *  It saves a calendar file (.ics) with one event per workout: the day's name as the title, the program, week and
 *  day in the notes, and the exercises with sets and reps. Open the file and your calendar adds them all.
 *  - Programs that name their weekdays ("Monday: Chest", "Mon AM: Arms") keep those weekdays; the weekday buttons
 *    are hidden for them. Other programs go on the weekdays you pick (the usual days for the number of workouts a
 *    week are already chosen).
 *  - Rest days in a program are not events; the weekdays you pick (or the program names) are the rest days.
 *  - Week plans and multi-week programs run week by week (Week 3 of 8 is in the notes); a program that repeats
 *    one week repeats it for the number of weeks you choose.
 *  - Times are "floating" (your phone's own clock), so they do not move if you travel.
 *  - Each workout has a fixed ID, so adding the same program again updates the events in most calendar apps
 *    instead of doubling them.
 *  - The last choices (time, reminder, weekdays) are remembered in settings.calendar.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined" || !PT.kit) return;
  const A = () => window.app, K = PT.kit, esc = K.esc;
  const FREE = typeof FREESTYLE_ID !== "undefined" ? FREESTYLE_ID : "freestyle";
  const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const DOW_RX = /\b(mon(?:day)?|tue(?:s|sday)?|wed(?:nesday)?|thu(?:r|rs|rsday)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?)\b/i;
  const USUAL = { 1: [2], 2: [0, 3], 3: [0, 2, 4], 4: [0, 1, 3, 4], 5: [0, 1, 2, 3, 4], 6: [0, 1, 2, 3, 4, 5], 7: [0, 1, 2, 3, 4, 5, 6] };
  const REMIND = [[-1, "No reminder"], [0, "At the start"], [15, "15 min before"], [30, "30 min before"], [60, "1 hour before"]];
  const MAX_PLAIN_WEEKS = 12, MAX_LINES = 14;
  const pad = n => String(n).padStart(2, "0");
  const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parseYmd = s => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || "")); return m ? new Date(+m[1], +m[2] - 1, +m[3], 12, 0, 0) : null; };   // noon: safe across clock changes
  const dowIdx = d => (d.getDay() + 6) % 7;                                   // Monday = 0
  const addDays = (d, n) => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate() + n, 12, 0, 0); return x; };
  const parseTime = s => { const m = /^(\d{1,2}):(\d{2})$/.exec(String(s || "")); const h = m ? +m[1] : 18, mi = m ? +m[2] : 0; return [Math.min(23, h), Math.min(59, mi)]; };

  /* ================================================================ which workouts, in order */
  function dayDow(day) {
    const m = DOW_RX.exec(String((day && day.title) || "").slice(0, 70));
    return m ? ["mon", "tue", "wed", "thu", "fri", "sat", "sun"].indexOf(m[1].slice(0, 3).toLowerCase()) : -1;
  }
  function ampm(day) { const t = String((day && day.title) || ""); return /\bAM\b/.test(t) ? "am" : /\bPM\b/.test(t) ? "pm" : ""; }
  /** short title for the calendar: "Phase 1 - Monday: Chest & Back" -> "Chest & Back" */
  function shortTitle(a, prog, day) {
    let t = String((day && day.title) || "").trim();
    try { if (a.shortDayTitle) t = a.shortDayTitle(prog, day); } catch (e) { }
    const i = t.indexOf(":");
    if (i > 0 && i < 40 && (DOW_RX.test(t.slice(0, i)) || /\b(week|phase|day|workout|w\d)/i.test(t.slice(0, i)))) t = t.slice(i + 1).trim();
    return t || "Workout";
  }
  /** { weeks: [{ n, days: [day...] }], structured } — rest days left out */
  function workoutsOf(a, prog) {
    const all = prog.days || [], work = d => !a.isRestDay(d);
    const P = PT.weeks && PT.weeks.planOf ? PT.weeks.planOf(prog) : null;
    if (P) {
      const weeks = [];
      for (let w = 1; w <= P.W; w++) weeks.push({ n: w, days: P.byWeek[w].days.map(n => all.find(d => d.dayNumber === n)).filter(d => d && work(d)) });
      return { weeks: weeks.filter(w => w.days.length), structured: true };
    }
    const W = a.progWeeks ? a.progWeeks(prog) : 0;
    if (W) {
      const weeks = [];
      for (let w = 1; w <= W; w++) weeks.push({ n: w, days: all.filter(d => work(d) && a.dayWeek(prog, d) === w) });
      return { weeks: weeks.filter(w => w.days.length), structured: true };
    }
    return { weeks: [{ n: 1, days: all.filter(work) }], structured: false };
  }
  const maxWeeks = src => (src.structured ? src.weeks.length : MAX_PLAIN_WEEKS);

  /** the saved/default choices for a program */
  function defaults(prog) {
    const a = A(), src = workoutsOf(a, prog), sv = (a.settings && a.settings.calendar) || {};
    const time = /^\d{1,2}:\d{2}$/.test(sv.time || "") ? sv.time : "18:00";
    const first = src.weeks[0] ? src.weeks[0].days.length : 0;
    const usual = USUAL[Math.max(1, Math.min(7, first || 4))];
    const days = Array.isArray(sv.days) && sv.days.length && sv.days.every(n => n >= 0 && n <= 6) && sv.days.length === usual.length ? sv.days.slice() : usual.slice();
    const [h, m] = parseTime(time), now = new Date();
    const tw = /(\d{1,2})[\s-]*(?:week|wk)s?\b/i.exec(String(prog.title || "")), named = tw ? +tw[1] : 0;   // "6-Weeks to Massive Arms" repeats for 6 weeks
    const start = now.getHours() * 60 + now.getMinutes() < h * 60 + m - 10 ? now : addDays(now, 1);
    return { start: ymd(start), time, remind: REMIND.some(r => r[0] === sv.remind) ? sv.remind : 30, weeks: src.structured ? Math.min(src.weeks.length, 16) : (named >= 2 && named <= MAX_PLAIN_WEEKS ? named : 4), days };
  }

  /* ================================================================ put them on dates */
  function plan(prog, o) {
    const a = A(), src = workoutsOf(a, prog), list = [];
    const nW = Math.max(1, Math.min(+o.weeks || 1, maxWeeks(src)));
    for (let k = 0; k < nW; k++) {
      const wk = src.structured ? src.weeks[k] : { n: k + 1, days: src.weeks[0].days };
      if (wk) wk.days.forEach(day => list.push({ day, week: wk.n }));
    }
    const named = !!list.length && list.every(x => dayDow(x.day) >= 0);
    let chosen = (Array.isArray(o.days) ? o.days : []).filter(n => n >= 0 && n <= 6);
    if (!chosen.length) chosen = USUAL[Math.max(1, Math.min(7, src.weeks[0] ? src.weeks[0].days.length : 4))];
    const picked = new Set(chosen);
    const [h0, m0] = parseTime(o.time);
    let date = parseYmd(o.start) || addDays(new Date(), 1), prev = null;
    const evs = list.map((x, i) => {
      const want = named ? dayDow(x.day) : -1, ap = ampm(x.day);
      let d;
      if (!prev) d = date;
      else if (named && prev.dow === want && ap === "pm" && prev.ap === "am") d = prev.date;          // morning + evening on one day
      else d = addDays(prev.date, 1);
      for (let g = 0; g < 8; g++) { const di = dowIdx(d); if (named ? di === want : picked.has(di)) break; d = addDays(d, 1); }
      let h = h0, m = m0;
      if (ap === "am" && h0 > 7) { h = 7; m = 0; }                      // a morning session goes at 07:00 unless you picked an earlier time
      if (ap === "pm" && h0 < 17) { h = 17; m = 0; }                    // an evening session goes at 17:00 unless you picked a later time
      const mins = Math.max(10, Math.min(240, parseInt(x.day.estimatedMinutes, 10) || 60));
      prev = { date: d, dow: dowIdx(d), ap };
      return { i, n: i + 1, date: d, h, m, mins, week: x.week, weeks: src.structured ? src.weeks.length : 0, day: x.day, title: shortTitle(a, prog, x.day) };
    });
    return { evs, named, perWeek: src.weeks[0] ? src.weeks[0].days.length : 0, max: maxWeeks(src), structured: src.structured };
  }

  /* ================================================================ the calendar file */
  const stamp = d => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
  const local = (d, h, m) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(h)}${pad(m)}00`;
  const escText = s => String(s == null ? "" : s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
  function fold(line) {
    const enc = new TextEncoder();
    if (enc.encode(line).length <= 75) return line;
    const out = []; let cur = "", bytes = 0, limit = 75;
    for (const ch of line) {
      const b = enc.encode(ch).length;
      if (bytes + b > limit) { out.push(cur); cur = ""; bytes = 0; limit = 74; }
      cur += ch; bytes += b;
    }
    out.push(cur);
    return out.join("\r\n ");
  }
  function notes(prog, e) {
    const wk = e.weeks ? `Week ${e.week} of ${e.weeks}` : `Week ${e.week}`;
    const L = [`${prog.title} · ${wk} · Day ${e.day.dayNumber}`, ""];
    const ex = (e.day.exercises || []).filter(x => x && x.name);
    ex.slice(0, MAX_LINES).forEach(x => L.push(`${x.name}${x.sets && x.reps ? "  " + x.sets + " x " + x.reps : ""}`));
    if (ex.length > MAX_LINES) L.push(`+ ${ex.length - MAX_LINES} more`);
    L.push("", "From PulseTrack");
    return L.join("\n");
  }
  function icsText(prog, evs, o) {
    const L = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//PulseTrack//Training calendar//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH"];
    const now = stamp(new Date()), id = String(prog.id || "program").replace(/[^A-Za-z0-9_-]/g, "");
    const rem = REMIND.some(r => r[0] === o.remind) ? o.remind : 30;
    evs.forEach(e => {
      const end = new Date(e.date.getFullYear(), e.date.getMonth(), e.date.getDate(), e.h, e.m + e.mins, 0);
      L.push("BEGIN:VEVENT", `UID:pt-cal-${id}-${e.n}@pulsetrack.local`, `DTSTAMP:${now}`,
        `DTSTART:${local(e.date, e.h, e.m)}`, `DTEND:${local(end, end.getHours(), end.getMinutes())}`,
        `SUMMARY:${escText(e.title)} (PulseTrack)`, `DESCRIPTION:${escText(notes(prog, e))}`, "TRANSP:OPAQUE");
      if (rem >= 0) L.push("BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${escText(e.title)}`, `TRIGGER:${rem === 0 ? "PT0S" : "-PT" + rem + "M"}`, "END:VALARM");
      L.push("END:VEVENT");
    });
    L.push("END:VCALENDAR");
    return L.map(fold).join("\r\n") + "\r\n";
  }
  async function deliver(text, name) {
    const file = new File([text], name, { type: "text/calendar" });
    try { if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: "Training calendar" }); return "shared"; } } catch (e) { if (e && e.name === "AbortError") return "cancelled"; }
    const u = URL.createObjectURL(file), x = document.createElement("a");
    x.href = u; x.download = name; document.body.appendChild(x); x.click(); x.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000);
    return "saved";
  }

  /* ================================================================ the sheet */
  let el = null, S = null;
  const when = d => d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
  const clock = (h, m) => `${pad(h)}:${pad(m)}`;
  function save(a) {
    try { a.settings.calendar = { time: S.o.time, remind: S.o.remind, days: S.o.days.slice() }; WorkoutStorage.saveSettings(a.settings); } catch (e) { }
  }
  function paint() {
    if (!el || !S) return;
    const r = S.r = plan(S.prog, S.o), o = S.o, q = s => el.querySelector(s);
    q("#pt-cal-wn").textContent = o.weeks + (o.weeks === 1 ? " week" : " weeks");
    q("[data-cal-w='-1']").disabled = o.weeks <= 1; q("[data-cal-w='1']").disabled = o.weeks >= r.max;
    q("#pt-cal-daybox").hidden = r.named; q("#pt-cal-named").hidden = !r.named;
    el.querySelectorAll("[data-cal-d]").forEach(b => b.classList.toggle("on", o.days.includes(+b.dataset.calD)));
    const n = r.evs.length, first = r.evs[0], last = r.evs[n - 1];
    let sum = n ? `<b>${n} workout${n === 1 ? "" : "s"}</b> · ${esc(when(first.date))} to ${esc(when(last.date))}` : "<b>Nothing to add</b>";
    if (n) {
      sum += `<ul>${r.evs.slice(0, 3).map(e => `<li><span>${esc(when(e.date))} · ${clock(e.h, e.m)}</span>${esc(e.title)}</li>`).join("")}${n > 3 ? `<li class="more">… and ${n - 3} more</li>` : ""}</ul>`;
      if (!r.named && r.perWeek && o.days.length !== r.perWeek) sum += `<p class="fine">This program has ${r.perWeek} workout${r.perWeek === 1 ? "" : "s"} a week and you picked ${o.days.length} day${o.days.length === 1 ? "" : "s"}, so its weeks will ${o.days.length < r.perWeek ? "take a little longer" : "come around faster"}.</p>`;
    }
    q("#pt-cal-sum").innerHTML = sum;
    q("#pt-cal-go").disabled = !n;
  }
  function open(p) {
    const a = A(); if (!a) return;
    const prog = p && typeof p === "object" ? p : (a.data.programs || []).find(x => x.id === p);
    if (!prog || prog.id === FREE) { a.toast("Freestyle has no set days to add"); return; }
    if (!workoutsOf(a, prog).weeks.length) { a.toast("This program has no workouts to add"); return; }
    const o = defaults(prog);
    S = { prog, o, r: null };
    el = K.sheet("pt-cal", 60);
    const card = K.openSheet(el, `${K.head("Add to my calendar", prog.title)}
      <div class="pt-cal-row"><span>First workout</span><input type="date" id="pt-cal-date" value="${esc(o.start)}" min="${esc(ymd(new Date()))}"></div>
      <div class="pt-cal-row"><span>Time</span><input type="time" id="pt-cal-time" value="${esc(o.time)}"></div>
      <div class="pt-cal-row"><span>Remind me</span><select id="pt-cal-rem">${REMIND.map(r => `<option value="${r[0]}"${r[0] === o.remind ? " selected" : ""}>${r[1]}</option>`).join("")}</select></div>
      <div class="pt-cal-row"><span>For</span><div class="pt-cal-step"><button type="button" data-cal-w="-1" aria-label="Fewer weeks">−</button><b id="pt-cal-wn"></b><button type="button" data-cal-w="1" aria-label="More weeks">＋</button></div></div>
      <div id="pt-cal-daybox"><span class="pt-cal-lab">Training days</span><div class="pt-cal-days">${DOW.map((d, i) => `<button type="button" data-cal-d="${i}" aria-label="${d}">${d}</button>`).join("")}</div></div>
      <p id="pt-cal-named" class="fine" hidden>This program names its days (Monday, Tuesday and so on), so the workouts go on those weekdays.</p>
      <div class="pt-cal-sum" id="pt-cal-sum"></div>
      <div class="pt-cal-btns"><button type="button" class="pt-cal-ghost tap-active" data-close>Cancel</button><button type="button" id="pt-cal-go" class="pt-cal-go tap-active">Add to calendar</button></div>
      <p class="fine">This saves a calendar file. Open it and your calendar adds every workout. Doing it again for the same program updates them instead of doubling them.</p>`);
    el.__onClose = () => { S = null; };
    const get = id => card.querySelector(id);
    get("#pt-cal-date").addEventListener("change", e => { o.start = e.target.value || ymd(addDays(new Date(), 1)); paint(); });
    get("#pt-cal-time").addEventListener("change", e => { o.time = e.target.value || "18:00"; paint(); });
    get("#pt-cal-rem").addEventListener("change", e => { o.remind = parseInt(e.target.value, 10); paint(); });
    card.addEventListener("click", e => {
      const w = e.target.closest("[data-cal-w]"), d = e.target.closest("[data-cal-d]");
      if (w && S) { o.weeks = Math.max(1, Math.min(S.r ? S.r.max : 16, o.weeks + parseInt(w.dataset.calW, 10))); paint(); }
      else if (d && S) { const n = +d.dataset.calD, i = o.days.indexOf(n); if (i >= 0) { if (o.days.length > 1) o.days.splice(i, 1); } else o.days.push(n); o.days.sort((x, y) => x - y); paint(); }
    });
    get("#pt-cal-go").addEventListener("click", async () => {
      if (!S) return;
      const { prog: pr, o: oo, r } = S; if (!r || !r.evs.length) return;
      const name = "pulsetrack-" + String(pr.title || "training").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) + ".ics";
      const how = await deliver(icsText(pr, r.evs, oo), name);
      if (how === "cancelled") return;
      save(a);
      K.closeSheet(el);
      a.toast(how === "shared" ? `${r.evs.length} workouts sent to your calendar` : `Saved ${name}. Open it to add ${r.evs.length} workouts to your calendar.`, null, null, 6000);
    });
    paint();
  }
  PT.calendar = { open, plan, defaults, ics: icsText, workoutsOf };

  const css = document.createElement("style"); css.id = "pt-v268-cal-css";
  css.textContent = `
    .pt-cal-row { display: flex; align-items: center; justify-content: space-between; gap: .75rem; }
    .pt-cal-row > span, .pt-cal-lab { font-size: .8rem; font-weight: 700; color: rgb(var(--z200)); }
    .pt-cal-lab { display: block; margin-bottom: .4rem; }
    .pt-cal-row input, .pt-cal-row select { padding: .55rem .6rem; border-radius: .7rem; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); color: rgb(var(--z100)); font-size: .85rem; min-width: 0; }
    .pt-cal-step { display: flex; align-items: center; gap: .4rem; }
    .pt-cal-step button { width: 2.2rem; height: 2.2rem; border-radius: .65rem; background: rgb(var(--z800)); color: rgb(var(--z100)); font-weight: 800; font-size: 1rem; }
    .pt-cal-step button:disabled { opacity: .35; }
    .pt-cal-step b { min-width: 4.6rem; text-align: center; font-size: .85rem; color: rgb(var(--z50)); }
    .pt-cal-days { display: flex; gap: .3rem; }
    .pt-cal-days button { flex: 1 1 0; padding: .6rem 0; border-radius: .65rem; background: rgb(var(--z800)); color: rgb(var(--z300)); font-size: .7rem; font-weight: 800; }
    .pt-cal-days button.on { background: rgb(var(--a600)); color: #fff; }
    .pt-cal-sum { padding: .75rem .85rem; border-radius: .95rem; background: rgb(var(--z900)); border: 1px solid rgb(var(--z800)); font-size: .82rem; color: rgb(var(--z100)); }
    .pt-cal-sum ul { margin-top: .4rem; display: grid; gap: .25rem; list-style: none; padding: 0; }
    .pt-cal-sum li { font-size: .75rem; color: rgb(var(--z300)); } .pt-cal-sum li span { color: rgb(var(--z500)); margin-right: .45rem; } .pt-cal-sum li.more { color: rgb(var(--z500)); }
    .pt-cal-btns { display: flex; gap: .5rem; }
    .pt-cal-go, .pt-cal-ghost { flex: 1 1 auto; padding: .75rem .9rem; border-radius: .85rem; font-size: .82rem; font-weight: 800; }
    .pt-cal-go { background: rgb(var(--a600)); color: #fff; } .pt-cal-go:disabled { opacity: .4; } .pt-cal-ghost { background: rgb(var(--z800)); color: rgb(var(--z100)); }
    #pt-cal .fine { font-size: .68rem; line-height: 1.45; color: rgb(var(--z500)); margin-top: .35rem; }
  `;
  document.head.appendChild(css);
})();
