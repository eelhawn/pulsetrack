/* =====================================================================
 * PulseTrack 3.15.0: a start date for the 64-day program.
 *  Ilhaan's 3 Day Split is one flat run of 64 days (one a day, no rest days). Pick the date of Day 1 and every day gets its date:
 *  Day N = start + (N - 1) days. The days list shows each day's date ("Day 5 · Today"), a box above it says when Day 64 is and whether
 *  you are on your dates, behind or ahead (with "Move the dates" to line them up with today), and Home's "Day 5 of 64" says when it is due.
 *  settings.startDates = { [programId]: "YYYY-MM-DD" } (in backups). Only this program for now (eligible()); the dates are a plan and
 *  never change what is done, your logs or History.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  const proto = ApplicationUI.prototype, A = () => window.app, $ = id => document.getElementById(id), esc = s => PT.esc(s);
  const MINE = "my_6day_chest_back_legs_sharms";
  const eligible = p => !!p && p.id === MINE && !p.weekPlan && Array.isArray(p.days) && p.days.length > 1;
  const okDs = s => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(PT.fromDs(s));
  const addDs = (s, n) => { const d = PT.fromDs(s); d.setDate(d.getDate() + n); return PT.ds(d); };
  const between = (a, b) => Math.round((PT.fromDs(b).getTime() - PT.fromDs(a).getTime()) / 86400000);   // b - a, in days
  const fmt = s => PT.fmtDate(s, { weekday: "short", month: "short", day: "numeric", year: s.slice(0, 4) === String(new Date().getFullYear()) ? undefined : "numeric" });
  const when = s => { const d = between(PT.ds(), s); return d === 0 ? "today" : d === 1 ? "tomorrow" : d === -1 ? "yesterday" : fmt(s); };
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;
  const save = a => { try { WorkoutStorage.saveSettings(a.settings); } catch (e) { } };

  function startOf(a, p) { const m = a && a.settings && a.settings.startDates; const s = m && typeof m === "object" ? m[p.id] : null; return okDs(s) ? s : null; }
  function setStart(a, p, s) {
    const m = a.settings.startDates && typeof a.settings.startDates === "object" ? a.settings.startDates : {};
    if (s) m[p.id] = s; else delete m[p.id];
    a.settings.startDates = m; save(a);
  }
  /** the date of a day (its place in the program, from the start date) */
  function dateOf(a, p, dayNumber) { const s = startOf(a, p), i = p.days.findIndex(d => d.dayNumber === dayNumber); return s && i >= 0 ? addDs(s, i) : null; }

  /** where you are against your dates: { start, end, x (today's place), y (up next's place), kind: soon|on|done|behind|ahead|round, text, move } */
  function status(a, p) {
    const s = startOf(a, p); if (!s) return null;
    const n = p.days.length, today = PT.ds(), x = between(s, today), st = a.getProgState(p), next = a.nextDayOf(p), y = next ? p.days.indexOf(next) : 0;
    const num = i => p.days[Math.max(0, Math.min(n - 1, i))].dayNumber, out = { start: s, end: addDs(s, n - 1), x, y, move: null };
    const d = y - x;
    if (st.week > 1 && y === 0) { out.kind = "round"; out.text = `You finished all ${n} days. Pick a new start date for the next round.`; }
    else if (x < 0 && y === 0) { out.kind = "soon"; out.text = `Day 1 is ${when(s)}, in ${plural(-x, "day")}.`; }
    else if (d === 0) { out.kind = "on"; out.text = `Today is Day ${num(y)}. You're on your dates.`; }
    else if (d === 1) { out.kind = "on"; out.text = `Today's workout (Day ${num(x)}) is done. Day ${num(y)} is tomorrow.`; }
    else if (d < 0) {
      out.kind = "behind"; out.move = addDs(today, -y);
      out.text = (x >= n ? `Your dates ended ${when(out.end)}.` : `Your dates say Day ${num(x)} today.`) + ` You're on Day ${num(y)}: ${plural(-d, "day")} behind.`;
    } else { out.kind = "ahead"; out.move = addDs(today, 1 - y); out.text = `You're ${plural(d - 1, "day")} ahead of your dates.`; }
    return out;
  }

  /* ================================================================ the sheet */
  function openStart(p) {
    const a = A(), K = PT.kit, el = K.sheet("pt-start-sheet", 55), cur = startOf(a, p), next = a.nextDayOf(p), y = next ? Math.max(0, p.days.indexOf(next)) : 0;
    const n = p.days.length, def = cur || addDs(PT.ds(), -y);
    const c = K.openSheet(el, `${K.head("Start date", `Day 1 is this date, then one day each, to Day ${n}.`)}
      <div>${K.lab("Day 1 was (or will be) on")}<input id="pt-start-date" type="date" value="${esc(def)}"></div>
      <p id="pt-start-end" class="text-[11px] text-zinc-300"></p>
      <div class="sticky bottom-[calc(-1.25rem-env(safe-area-inset-bottom,0px))] -mx-5 -mb-5 px-5 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] bg-zinc-900 border-t border-zinc-800 space-y-2">
        <button type="button" id="pt-start-save" class="w-full py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold tap-active">Save start date</button>
        ${cur ? `<button type="button" id="pt-start-off" class="w-full py-2.5 rounded-xl bg-zinc-800 text-zinc-200 text-xs font-bold tap-active">Remove the dates</button>` : ""}</div>`);
    const inp = c.querySelector("#pt-start-date"), endP = c.querySelector("#pt-start-end");
    const show = () => {
      if (!okDs(inp.value)) { endP.textContent = ""; return; }
      const up = next ? addDs(inp.value, y) : null;
      endP.textContent = `Day ${p.days[n - 1].dayNumber} is ${fmt(addDs(inp.value, n - 1))}.` + (up && y > 0 ? ` Up next, Day ${next.dayNumber}, is ${when(up)}.` : "");
    };
    show(); inp.addEventListener("input", show); inp.addEventListener("change", show);
    c.querySelector("#pt-start-save").addEventListener("click", () => {
      if (!okDs(inp.value)) { inp.focus(); return; }
      setStart(a, p, inp.value); K.closeSheet(el); a.toast(`Start date saved. Day ${p.days[n - 1].dayNumber} is ${fmt(addDs(inp.value, n - 1))}`);
      redraw(a);
    });
    const off = c.querySelector("#pt-start-off");
    if (off) off.addEventListener("click", () => { setStart(a, p, null); K.closeSheet(el); a.toast("Dates removed"); redraw(a); });
  }
  function redraw(a) {
    const vis = id => { const e = $(id); return e && !e.classList.contains("hidden"); };
    try { if (vis("view-days")) a.renderDaysView(); } catch (e) { }
    try { if (vis("view-home")) a.renderHomeView(); } catch (e) { }
  }

  /* ================================================================ the days list */
  function daysBox(a) {
    const p = a.activeProgram, list = $("days-list-container"); let box = $("pt-startdate");
    if (!eligible(p) || !list) { if (box) box.remove(); return; }
    if (!box) { box = document.createElement("div"); box.id = "pt-startdate"; box.className = "pt-sd"; (list.previousElementSibling || list).before(box); }
    const st = status(a, p);
    box.dataset.kind = st ? st.kind : "none";
    box.innerHTML = st
      ? `<div class="pt-sd-h"><span class="min-w-0"><b>${x0(st) ? "Started" : "Starts"} ${esc(fmt(st.start))}</b><span class="pt-sd-e">Day ${p.days[p.days.length - 1].dayNumber}: ${esc(fmt(st.end))}</span></span>
           <button type="button" class="pt-sd-b tap-active" data-start="change" aria-label="Change the start date">Change</button></div>
         <p class="pt-sd-s">${esc(st.text)}</p>${st.move ? `<button type="button" class="pt-sd-m tap-active" data-start="move">Move the dates to match</button>` : ""}`
      : `<div class="pt-sd-h"><span class="pt-sd-t">Give each day its date: pick when Day 1 was.</span><button type="button" class="pt-sd-b tap-active" data-start="set">Set a start date</button></div>`;
    // each day's date on its card
    list.querySelectorAll("[data-day]").forEach(card => {
      const lab = card.querySelector(".flex-col > span:first-child"); if (!lab) return;
      const old = lab.querySelector(".pt-sd-d"); if (old) old.remove();
      card.classList.remove("pt-sd-today");
      const ds = st ? dateOf(a, p, parseInt(card.dataset.day, 10)) : null; if (!ds) return;
      const t = ds === PT.ds();
      lab.insertAdjacentHTML("beforeend", `<span class="pt-sd-d" data-date="${ds}"> · ${t ? "Today" : esc(fmt(ds))}</span>`);
      if (t) card.classList.add("pt-sd-today");
    });
  }
  const x0 = st => st.x >= 0;
  document.addEventListener("click", e => {
    const b = e.target.closest && e.target.closest("#pt-startdate [data-start]"); if (!b) return;
    const a = A(), p = a && a.activeProgram; if (!eligible(p)) return;
    if (b.dataset.start === "move") {
      const st = status(a, p); if (!st || !st.move) return;
      setStart(a, p, st.move); redraw(a);
      const next = a.nextDayOf(p); a.toast(`Dates moved: Day ${next.dayNumber} is ${st.kind === "ahead" ? "tomorrow" : "today"}`);
    } else openStart(p);
  });
  const oDays = proto.renderDaysView;
  proto.renderDaysView = function () {
    const r = oDays.apply(this, arguments);
    try { daysBox(this); } catch (e) { console.error("PulseTrack start date", e); }
    return r;
  };

  /* ================================================================ Home: "Day 5 of 64 · today" */
  /** when a day is due: "Today", "Tomorrow", "Yesterday", "Mon, Nov 23" or "due Wed, Nov 18" (3.16.0's Today sheet uses it too) */
  function due(a, p, dayNumber) { const ds = eligible(p) ? dateOf(a, p, dayNumber) : null; if (!ds) return ""; const d = between(PT.ds(), ds); return d < -1 ? "due " + fmt(ds) : cap(when(ds)); }
  const oHome = proto.renderHomeView;
  proto.renderHomeView = function () {
    const r = oHome.apply(this, arguments);
    try {
      const b = $("home-active-day-badge"), id = PT.currentProgramId ? PT.currentProgramId() : null;
      const p = id && (this.data.programs || []).find(x => x.id === id), m = b && /^Day (\d+) of \d+$/.exec(b.textContent.trim());
      if (eligible(p) && m) {
        const t = due(this, p, parseInt(m[1], 10));
        if (t) b.textContent += " · " + t;
      }
    } catch (e) { console.error("PulseTrack start date home", e); }
    return r;
  };

  PT.startDate = { of: (p) => startOf(A(), p), set: (p, s) => setStart(A(), p, s), dateOf: (p, n) => dateOf(A(), p, n), status: p => status(A(), p), due: (p, n) => due(A(), p, n), open: openStart, eligible };

  const css = document.createElement("style"); css.id = "pt-v3150-css";
  css.textContent = `
    .pt-sd { display: flex; flex-direction: column; gap: .45rem; padding: .75rem .85rem; border-radius: .9rem; background: rgb(var(--z900)); border: 1px solid rgb(var(--z800)); }
    .pt-sd-h { display: flex; align-items: center; justify-content: space-between; gap: .6rem; font-size: .8125rem; color: rgb(var(--z200)); }
    .pt-sd-h b { display: block; color: rgb(var(--z100)); }
    .pt-sd-e { display: block; font-size: .75rem; color: rgb(var(--z300)); margin-top: .1rem; }
    .pt-sd-t { font-size: .75rem; color: rgb(var(--z300)); }
    .pt-sd-b { flex-shrink: 0; font-size: .75rem; font-weight: 600; color: rgb(var(--z200)); padding: .4rem .6rem; min-height: 2.25rem; border-radius: .6rem; background: rgb(var(--z800)); }
    .pt-sd-s { font-size: .75rem; line-height: 1.4; color: rgb(var(--z300)); }
    .pt-sd[data-kind="behind"] .pt-sd-s, .pt-sd[data-kind="ahead"] .pt-sd-s { color: rgb(252 211 77); }
    html[data-mode="light"] .pt-sd[data-kind="behind"] .pt-sd-s, html[data-mode="light"] .pt-sd[data-kind="ahead"] .pt-sd-s { color: rgb(146 64 14); }
    .pt-sd-m { align-self: flex-start; font-size: .75rem; font-weight: 700; padding: .45rem .7rem; min-height: 2.25rem; border-radius: .6rem; background: rgb(var(--z800)); color: rgb(var(--z100)); }
    .pt-sd-today { border-color: rgb(16 185 129 / .55) !important; }
    .pt-sd-today .pt-sd-d { color: rgb(52 211 153); }
  `;
  document.head.appendChild(css);
})();
