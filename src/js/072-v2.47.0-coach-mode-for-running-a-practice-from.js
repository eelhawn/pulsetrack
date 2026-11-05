
/* =====================================================================
 * PulseTrack 2.47.0: Coach mode, for running a practice from one phone (a team, a class, a group of friends).
 *  Open it from Cardio & Sports → "Coach mode". Everything stays on the phone and is in your backup (key pulsetrack_coach_v1).
 *  - Roster: teams and athletes (name, number, note). Add one at a time or paste a list.
 *  - Today: the practice for the team and the day. Who is here, then the tools below.
 *  - Time a drill: a stopwatch for many athletes at once. "Start all" starts everyone together, or tap a name to start only that
 *    athlete (staggered starts, one at a time). Tap a running name to stop it. Times are to a hundredth of a second, ranked on the spot,
 *    with a trophy for a new personal best. Drills you measure rather than time (jumps, reps, makes) are typed in instead.
 *    22 drills to start with, and your own. Results are kept per athlete, with their best, last and trend.
 *  - Gear: a list of the equipment you take out (cones, balls, pinnies...). Count it before practice and after: anything that did not
 *    come back is flagged, and the stock can be brought up to date.
 *  - Share a summary of the practice (who was there, the drill results, gear) as text, or export all results as a CSV.
 *  - m77b.js adds the Group timer: one interval clock for several stations with the groups rotating round them.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined" || !PT.kit) return;
  const A = () => window.app, K = PT.kit, esc = K.esc, $ = id => document.getElementById(id), proto = ApplicationUI.prototype;
  const KEY = "pulsetrack_coach_v1", MAX_TEAMS = 20, MAX_ATH = 80, MAX_SESS = 400, MAX_GEAR = 40;
  const uid = () => PT.uid();
  const snd = () => { try { return typeof sound !== "undefined" ? sound : window.sound; } catch (e) { return window.sound; } };
  const say = msg => { const a = A(); try { if (a && a.settings.voice !== false && "speechSynthesis" in window) { speechSynthesis.cancel(); speechSynthesis.speak(new SpeechSynthesisUtterance(msg)); } } catch (e) { } };

  /* ---------------------------------------------------------------- data */
  let D = null;
  const obj = x => x && typeof x === "object" && !Array.isArray(x);
  function db() {
    if (D) return D;
    D = PT.load(KEY, null);
    if (!obj(D)) D = {};
    D.v = 1; ["teams", "drills", "gear", "sessions"].forEach(k => { if (!Array.isArray(D[k])) D[k] = []; });
    if (!obj(D.cur)) D.cur = {}; if (!obj(D.cfg)) D.cfg = {};
    // a damaged or hand-edited save must not be able to break the screen
    D.teams = D.teams.filter(t => obj(t) && t.id).map(t => { t.name = String(t.name || "Team"); t.athletes = (Array.isArray(t.athletes) ? t.athletes : []).filter(a => obj(a) && a.id && typeof a.name === "string").map(a => { a.num = String(a.num || ""); return a; }); return t; });
    D.drills = D.drills.filter(d => obj(d) && d.id && d.name && KINDS[d.kind]);
    D.gear = D.gear.filter(g => obj(g) && g.id && g.name).map(g => { g.n = Math.max(0, parseInt(g.n, 10) || 0); return g; });
    D.sessions = D.sessions.filter(s => obj(s) && s.id && s.team && s.date).map(s => { s.runs = (Array.isArray(s.runs) ? s.runs : []).filter(r => obj(r) && r.id && r.d && r.a && isFinite(r.v)); s.circ = (Array.isArray(s.circ) ? s.circ : []).filter(c => obj(c) && Array.isArray(c.stations)); if (!Array.isArray(s.present)) s.present = null; return s; });
    return D;
  }
  function save() {
    const d = db(); if (d.sessions.length > MAX_SESS) d.sessions = d.sessions.sort((a, b) => a.ts - b.ts).slice(-MAX_SESS);
    let okk = false; try { okk = PT.save(KEY, d); } catch (e) { okk = false; }
    if (!okk) { const a = A(); if (a) a.toast("The phone is out of storage. Coach data could not be saved.", undefined, undefined, 5000); }
  }
  const today = () => PT.ds();
  const teamOf = id => db().teams.find(t => t.id === id) || null;
  const curTeam = () => teamOf(db().cur.team) || db().teams[0] || null;
  const sessions = t => db().sessions.filter(s => t && s.team === t.id).sort((a, b) => b.ts - a.ts);
  /** today's practice for a team; made on the spot when asked to */
  function sessionFor(t, create) {
    if (!t) return null;
    let s = sessions(t).find(x => x.date === today());
    if (!s && create) { s = { id: uid(), ts: Date.now(), date: today(), team: t.id, title: "", present: null, runs: [], before: null, after: null, circ: [], note: "" }; db().sessions.push(s); save(); }
    return s || null;
  }
  const present = (t, s) => (t ? t.athletes.filter(a => !s || !s.present || s.present.indexOf(a.id) >= 0) : []);
  const athOf = (t, id) => (t ? t.athletes.find(a => a.id === id) : null) || null;
  const nameOf = (t, r) => { const a = athOf(t, r.a); return a ? a.name : (r.n || "(removed)"); };

  /* ---------------------------------------------------------------- drills */
  const KINDS = {
    time: { stop: true, better: "low", name: "Stopwatch · fastest wins" },
    hold: { stop: true, better: "high", name: "Stopwatch · longest wins" },
    dist: { stop: false, better: "high", name: "Measured · furthest wins" },
    count: { stop: false, better: "high", name: "Count · most wins" }
  };
  const BUILTIN = [
    { id: "d40", name: "40-yard dash", kind: "time", icon: "🏃" }, { id: "d20", name: "20-yard dash", kind: "time", icon: "🏃" }, { id: "d60", name: "60-yard dash", kind: "time", icon: "🏃" },
    { id: "d100", name: "100 m sprint", kind: "time", icon: "🏃" }, { id: "d400", name: "400 m run", kind: "time", icon: "🏃" }, { id: "mile", name: "Mile run", kind: "time", icon: "🏃" },
    { id: "shut", name: "5-10-5 shuttle", kind: "time", icon: "↔️" }, { id: "cone3", name: "3-cone drill", kind: "time", icon: "🔺" }, { id: "suic", name: "Line sprints (suicides)", kind: "time", icon: "🏁" },
    { id: "lad", name: "Agility ladder", kind: "time", icon: "🪜" }, { id: "drib", name: "Dribble course", kind: "time", icon: "⚽" }, { id: "swim50", name: "50 m swim", kind: "time", icon: "🏊" },
    { id: "plank", name: "Plank hold", kind: "hold", icon: "🧘" }, { id: "wall", name: "Wall sit", kind: "hold", icon: "🧱" }, { id: "hang", name: "Dead hang", kind: "hold", icon: "🧗" },
    { id: "vert", name: "Vertical jump", kind: "dist", icon: "⬆️" }, { id: "broad", name: "Broad jump", kind: "dist", icon: "↗️" },
    { id: "ft", name: "Free throws made (of 10)", kind: "count", unit: "made", icon: "🏀" }, { id: "pu", name: "Push-ups (1 minute)", kind: "count", unit: "reps", icon: "💪" },
    { id: "su", name: "Sit-ups (1 minute)", kind: "count", unit: "reps", icon: "🔥" }, { id: "pull", name: "Pull-ups", kind: "count", unit: "reps", icon: "🧗" }, { id: "jr", name: "Jump rope (1 minute)", kind: "count", unit: "skips", icon: "💫" }
  ];
  const allDrills = () => BUILTIN.concat(db().drills);
  const drillOf = id => allDrills().find(d => d.id === id) || { id, name: "(removed drill)", kind: "time", icon: "⏱" };
  const kind = d => KINDS[d.kind] || KINDS.time;
  const isBetter = (d, a, b) => (kind(d).better === "low" ? a < b : a > b);
  const fmtT = s => { s = Math.max(0, s); if (s < 60) return s.toFixed(2); const m = Math.floor(s / 60), r = s - 60 * m; return m + ":" + (r < 10 ? "0" : "") + r.toFixed(2); };
  const lenU = () => (A().unit() === "kg" ? "cm" : "in");
  const toDisp = cm => (A().unit() === "kg" ? Math.round(cm * 10) / 10 : Math.round(cm / 2.54 * 10) / 10);
  const fromDisp = v => (A().unit() === "kg" ? v : v * 2.54);
  const fmtV = (d, v) => (d.kind === "time" || d.kind === "hold" ? fmtT(v) : d.kind === "dist" ? toDisp(v) + " " + lenU() : (Math.round(v * 10) / 10) + (d.unit ? " " + d.unit : ""));
  /** every run of one drill (optionally one athlete) from all practices, oldest first */
  function history(drillId, aid, teamId) {
    const out = [];
    db().sessions.forEach(s => { if (teamId && s.team !== teamId) return; s.runs.forEach(r => { if (r.d === drillId && (!aid || r.a === aid)) out.push(Object.assign({}, r, { date: s.date, sid: s.id })); }); });
    return out.sort((x, y) => x.ts - y.ts);
  }
  const bestOf = (d, list) => list.reduce((m, r) => (m == null || isBetter(d, r.v, m) ? r.v : m), null);
  /** best run of each athlete, ranked */
  function board(d, runs) {
    const m = new Map(); runs.forEach(r => { const c = m.get(r.a); if (!c || isBetter(d, r.v, c.v)) m.set(r.a, Object.assign({ n: 1 }, r)); else c.n++; });
    runs.forEach(r => { const c = m.get(r.a); if (c) c.tries = (c.tries || 0) + 1; });
    return [...m.values()].sort((x, y) => (isBetter(d, x.v, y.v) ? -1 : isBetter(d, y.v, x.v) ? 1 : x.ts - y.ts));
  }
  /** put results into today's practice: each gets a personal-best flag against everything before */
  function addRuns(t, d, list) {
    const s = sessionFor(t, true), flags = [];
    list.forEach(x => {
      const prev = history(d.id, x.a).filter(r => !list.some(y => y.id === r.id));
      const prevBest = bestOf(d, prev.concat(s.runs.filter(r => r.d === d.id && r.a === x.a)));
      const r = { id: uid(), ts: Date.now(), d: d.id, a: x.a, n: (athOf(t, x.a) || {}).name || "", v: x.v };
      if (prevBest == null) r.first = 1; else if (isBetter(d, x.v, prevBest)) r.pb = 1;
      s.runs.push(r); flags.push(r);
    });
    save(); return flags;
  }

  /* ---------------------------------------------------------------- small helpers */
  const toast = (m, ms) => { const a = A(); if (a) a.toast(m, undefined, undefined, ms || 3000); };
  function shareText(title, text) {
    const a = A();
    return (async () => {
      try { if (navigator.share) { await navigator.share({ title, text }); return true; } } catch (e) { if (e && e.name === "AbortError") return false; }
      try { await navigator.clipboard.writeText(text); toast("Copied. Paste it into a message."); return true; } catch (e) { }
      try { const f = new File([text], title.replace(/[^a-z0-9]+/gi, "-").toLowerCase() + ".txt", { type: "text/plain" }); return await a.shareFile(f, title); } catch (e) { return false; }
    })();
  }
  const dayTxt = ds => PT.fmtDate(ds, { weekday: "short", month: "short", day: "numeric" });
  const plural = (n, w) => n + " " + w + (n === 1 ? "" : "s");
  const rankIcon = i => (i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : String(i + 1));
  const nm = a => (a.num ? "#" + a.num + " " : "") + a.name;
  /** "12 Mia Chen", "Mia Chen #12", "Mia Chen" */
  function parseName(line) {
    let s = String(line || "").replace(/\s+/g, " ").trim(), num = "";
    let m = s.match(/^#?(\d{1,3})[\s.:)\-]+(.+)$/); if (m) { num = m[1]; s = m[2]; } else { m = s.match(/^(.+?)[\s,]+#?(\d{1,3})$/); if (m) { s = m[1]; num = m[2]; } }
    s = s.replace(/^[-•*]+\s*/, "").trim().slice(0, 40); return s ? { name: s, num } : null;
  }

  /* ---------------------------------------------------------------- the screen */
  const U = { tab: "today", open: false };
  const TABS = [["today", "Today", "📋"], ["roster", "Roster", "👥"], ["drills", "Drills", "⏱"], ["gear", "Gear", "📦"]];
  function open(tab) {
    if (tab) U.tab = tab;
    if (!$("pt-coach")) {
      const e = document.createElement("div"); e.id = "pt-coach"; e.setAttribute("role", "dialog"); e.setAttribute("aria-label", "Coach mode");
      e.innerHTML = `<div class="pt-co-head"><button type="button" data-co="x" aria-label="Back">‹</button><div class="pt-co-ttl"><b>Coach mode</b><span id="pt-co-sub"></span></div><button type="button" data-co="more" aria-label="More">⋯</button></div>
        <div class="pt-co-team" id="pt-co-team"></div><div class="pt-co-body" id="pt-co-body"></div>
        <nav class="pt-co-tabs" aria-label="Coach mode sections">${TABS.map(t => `<button type="button" data-co-tab="${t[0]}"><i aria-hidden="true">${t[2]}</i><span>${t[1]}</span></button>`).join("")}</nav>`;
      document.body.appendChild(e); document.body.classList.add("pt-co-on"); e.addEventListener("click", clicks); U.open = true;
    }
    render();
    if (!U.resumed) { U.resumed = true; setTimeout(() => { try { if (PT.coachMode.resume) PT.coachMode.resume(); } catch (e) { } }, 60); }
  }
  function close() { const e = $("pt-coach"); if (e) e.remove(); document.body.classList.remove("pt-co-on"); U.open = false; }
  function render(keepScroll) {
    const e = $("pt-coach"); if (!e) return; const body = $("pt-co-body"), sc = keepScroll ? body.scrollTop : 0, t = curTeam();
    e.querySelectorAll("[data-co-tab]").forEach(b => { const on = b.dataset.coTab === U.tab; b.classList.toggle("on", on); b.setAttribute("aria-current", on ? "page" : "false"); });
    $("pt-co-sub").textContent = t ? t.name : "Set up your team";
    $("pt-co-team").innerHTML = db().teams.length ? db().teams.map(x => `<button type="button" class="pt-co-chip${t && x.id === t.id ? " on" : ""}" data-co="team" data-id="${esc(x.id)}">${esc(x.name)}</button>`).join("") + `<button type="button" class="pt-co-chip add" data-co="newteam" aria-label="Add a team">＋ Team</button>` : "";
    body.innerHTML = U.tab === "roster" ? viewRoster(t) : U.tab === "drills" ? viewDrills(t) : U.tab === "gear" ? viewGear(t) : viewToday(t);
    body.scrollTop = sc;
  }
  const card = (inner, cls) => `<section class="pt-co-card${cls ? " " + cls : ""}">${inner}</section>`;
  const empty = (icon, h, p, btn) => card(`<div class="pt-co-empty"><div>${icon}</div><b>${h}</b><p>${p}</p>${btn || ""}</div>`);

  /* ---- Today */
  function gearLine(s) {
    const g = db().gear; if (!g.length || !s) return "";
    const miss = gearMissing(s);
    if (s.after) return miss.length ? `<p class="pt-co-warn">⚠ Not back: ${esc(miss.map(m => m.n + " " + m.name.toLowerCase()).join(", "))}</p>` : `<p class="pt-co-ok">✓ All the gear came back</p>`;
    if (s.before) return `<p class="pt-co-fine">Counted out before practice. Count it again when you pack up.</p>`;
    return "";
  }
  function viewToday(t) {
    if (!t) return empty("🧑‍🏫", "Set up your team", "Add your players, time drills for the whole group at once, run a station circuit and count the gear in and out.", `<button type="button" class="pt-co-go" data-co="newteam">Add a team</button>`);
    const s = sessionFor(t, false), pres = present(t, s), here = pres.length;
    let h = card(`<div class="pt-co-row"><div><h3>${esc(dayTxt(today()))}</h3><p class="pt-co-fine">${esc(t.name)} · ${plural(t.athletes.length, "athlete")}</p></div></div>
      ${t.athletes.length ? `<button type="button" class="pt-co-att" data-co="att"><span>👥 ${here} of ${t.athletes.length} here</span><span>${here < t.athletes.length ? esc(t.athletes.filter(a => pres.indexOf(a) < 0).map(a => a.name.split(" ")[0]).slice(0, 3).join(", ") + (t.athletes.length - here > 3 ? " +" + (t.athletes.length - here - 3) : "") + " away") : "Tap to change"} ›</span></button>` : `<button type="button" class="pt-co-go" data-co="tab" data-tab="roster">Add your athletes</button>`}
      <div class="pt-co-tools">
        <button type="button" data-co="drill" ${t.athletes.length ? "" : "disabled"}><i>⏱</i><b>Time a drill</b><span>Stopwatch for the group</span></button>
        <button type="button" data-co="circ" ${t.athletes.length ? "" : "disabled"}><i>🔁</i><b>Group timer</b><span>Stations that rotate</span></button>
        <button type="button" data-co="count"><i>📦</i><b>Count gear</b><span>${s && s.after ? "Before ✓ After ✓" : s && s.before ? "Before ✓ After ○" : "Before ○ After ○"}</span></button>
        <button type="button" data-co="share"><i>📤</i><b>Share summary</b><span>Text for the group chat</span></button></div>
      ${gearLine(s)}`);
    if (s && s.runs.length) {
      const order = []; s.runs.forEach(r => { if (order.indexOf(r.d) < 0) order.push(r.d); });
      h += order.map(id => {
        const d = drillOf(id), runs = s.runs.filter(r => r.d === id), b = board(d, runs);
        return card(`<div class="pt-co-row"><h3>${esc(d.icon || "")} ${esc(d.name)}</h3><span class="pt-co-fine">${plural(runs.length, "result")}</span></div>
          <div class="pt-co-list">${b.map((r, i) => `<button type="button" class="pt-co-li" data-co="run" data-id="${esc(r.id)}"><i>${rankIcon(i)}</i><span>${esc(nameOf(t, r))}</span><b>${esc(fmtV(d, r.v))}</b>${r.pb ? `<em title="New personal best">🏆</em>` : r.first ? `<em class="dim">new</em>` : ""}${r.tries > 1 ? `<small>×${r.tries}</small>` : ""}</button>`).join("")}</div>`);
      }).join("");
    }
    if (s && s.circ && s.circ.length) h += card(`<h3>🔁 Group timer</h3><div class="pt-co-list">${s.circ.map(c => `<div class="pt-co-li static"><span>${c.work}s work · ${c.rest}s rotate · ${plural(c.stations.length, "station")} · ${c.rounds} rounds</span></div>`).join("")}</div>`);
    h += card(`<label class="pt-co-lab" for="pt-co-note">Practice note</label><textarea id="pt-co-note" class="pt-co-ta" rows="2" maxlength="400" placeholder="What you worked on, who was hurt, what to do next time">${esc(s ? s.note : "")}</textarea>`);
    return h;
  }

  /* ---- Roster */
  function viewRoster(t) {
    if (!t) return viewToday(null);
    return card(`<div class="pt-co-row"><div><h3>${esc(t.name)}</h3><p class="pt-co-fine">${plural(t.athletes.length, "athlete")}</p></div><div class="pt-co-btns"><button type="button" class="pt-co-sm" data-co="addath">＋ Add</button><button type="button" class="pt-co-sm" data-co="bulk">Paste list</button></div></div>
      ${t.athletes.length ? `<div class="pt-co-list">${t.athletes.map(a => { const n = db().sessions.reduce((c, s) => c + s.runs.filter(r => r.a === a.id).length, 0); return `<button type="button" class="pt-co-li" data-co="ath" data-id="${esc(a.id)}"><i>${esc(a.num || "·")}</i><span>${esc(a.name)}${a.note ? `<small>${esc(a.note)}</small>` : ""}</span><small>${n ? plural(n, "result") : ""}</small></button>`; }).join("")}</div>` : `<p class="pt-co-fine">No one yet. Add players one at a time, or paste a list with one name per line (a jersey number first or last is fine: "12 Mia Chen").</p>`}
      <div class="pt-co-btns end"><button type="button" class="pt-co-sm" data-co="renteam">Rename team</button><button type="button" class="pt-co-sm danger" data-co="delteam">Delete team</button></div>`);
  }
  async function addAthlete(t) {
    const v = await PT.prompt("Athlete's name (a jersey number first is fine: 12 Mia Chen)", ""); if (v == null) return;
    const p = parseName(v); if (!p) return; if (t.athletes.length >= MAX_ATH) { toast("A team holds up to " + MAX_ATH + " athletes."); return; }
    t.athletes.push({ id: uid(), name: p.name, num: p.num, note: "" }); save(); render(true); toast("Added " + p.name);
  }
  function bulkSheet(t) {
    const el = K.sheet("pt-co-bulk", 80);
    const c = K.openSheet(el, `${K.head("Add several athletes", "One name per line")}<textarea id="pt-co-bulk-ta" class="pt-co-ta tall" rows="10" placeholder="12 Mia Chen&#10;Jo Park #7&#10;Sam Ortiz"></textarea><p class="pt-co-fine">A jersey number at the start or the end of a line is picked up. Blank lines are skipped.</p><button type="button" class="pt-co-go" data-b="add">Add them</button>`);
    c.addEventListener("click", e => {
      if (!e.target.closest('[data-b="add"]')) return;
      const lines = $("pt-co-bulk-ta").value.split(/\n|;/).map(parseName).filter(Boolean); let n = 0;
      lines.forEach(p => { if (t.athletes.length < MAX_ATH && !t.athletes.some(a => a.name.toLowerCase() === p.name.toLowerCase())) { t.athletes.push({ id: uid(), name: p.name, num: p.num, note: "" }); n++; } });
      save(); K.closeSheet(el); render(true); toast(n ? "Added " + plural(n, "athlete") : "No new names found");
    });
  }
  function athSheet(t, a) {
    const el = K.sheet("pt-co-ath", 80), ds = [...new Set(db().sessions.flatMap(s => s.runs.filter(r => r.a === a.id).map(r => r.d)))];
    const rows = ds.map(id => { const d = drillOf(id), h = history(id, a.id); return `<div class="pt-co-li static"><span>${esc(d.icon || "")} ${esc(d.name)}<small>${plural(h.length, "result")} · last ${esc(fmtV(d, h[h.length - 1].v))}</small></span><b>${esc(fmtV(d, bestOf(d, h)))}</b></div>`; }).join("");
    const c = K.openSheet(el, `${K.head(a.name, "Edit, or see their results")}
      <div class="pt-co-fields"><label><span>Name</span><input data-f="name" value="${esc(a.name)}" maxlength="40" autocomplete="off"></label><label><span>Number</span><input data-f="num" value="${esc(a.num)}" maxlength="3" inputmode="numeric" autocomplete="off"></label><label class="wide"><span>Note (position, injury, parent contact…)</span><input data-f="note" value="${esc(a.note || "")}" maxlength="80" autocomplete="off"></label></div>
      ${rows ? `<h4 class="pt-co-h4">Personal bests</h4><div class="pt-co-list">${rows}</div>` : `<p class="pt-co-fine">No drill results yet.</p>`}
      <div class="pt-co-btns"><button type="button" class="pt-co-go" data-b="save">Save</button><button type="button" class="pt-co-sm danger" data-b="del">Remove from team</button></div>`);
    c.addEventListener("click", async e => {
      const b = e.target.closest("[data-b]"); if (!b) return;
      if (b.dataset.b === "save") { const v = f => c.querySelector(`[data-f="${f}"]`).value; const nmv = v("name").trim(); if (!nmv) { toast("A name is needed."); return; } a.name = nmv.slice(0, 40); a.num = v("num").replace(/\D/g, "").slice(0, 3); a.note = v("note").trim().slice(0, 80); save(); K.closeSheet(el); render(true); }
      else if (b.dataset.b === "del") { if (!await PT.confirm(`Remove ${a.name} from ${t.name}? Their past results stay in the practice records.`, { title: "Remove athlete", ok: "Remove" })) return; t.athletes = t.athletes.filter(x => x.id !== a.id); db().sessions.forEach(s => { if (s.present) s.present = s.present.filter(x => x !== a.id); }); save(); K.closeSheet(el); render(true); }
    });
  }
  async function newTeam() {
    const d = db(); if (d.teams.length >= MAX_TEAMS) { toast("That is the most teams the app keeps."); return; }
    const v = await PT.prompt("Team or group name", ""); if (v == null) return; const name = String(v).trim().slice(0, 40); if (!name) return;
    const t = { id: uid(), name, athletes: [], created: Date.now() }; d.teams.push(t); d.cur.team = t.id; save(); U.tab = "roster"; render();
    toast("Team added. Add your athletes next.");
  }

  /* ---- Drills */
  function viewDrills(t) {
    const used = new Set(); db().sessions.forEach(s => s.runs.forEach(r => used.add(r.d)));
    const row = d => { const h = history(d.id, null, t && t.id), b = h.length ? board(d, h)[0] : null; return `<button type="button" class="pt-co-li" data-co="drillinfo" data-id="${esc(d.id)}"><i>${esc(d.icon || "⏱")}</i><span>${esc(d.name)}<small>${esc(kind(d).name)}</small></span>${b ? `<b>${esc(fmtV(d, b.v))}<small>${esc(nameOf(t, b))}</small></b>` : ""}</button>`; };
    const mine = allDrills().filter(d => used.has(d.id) || db().drills.indexOf(d) >= 0), rest = allDrills().filter(d => mine.indexOf(d) < 0);
    return card(`<div class="pt-co-row"><h3>Drills</h3><button type="button" class="pt-co-sm" data-co="newdrill">＋ Your own</button></div>${mine.length ? `<h4 class="pt-co-h4">In use</h4><div class="pt-co-list">${mine.map(row).join("")}</div>` : ""}<h4 class="pt-co-h4">${mine.length ? "More drills" : "Pick one to start"}</h4><div class="pt-co-list">${rest.map(row).join("")}</div>`);
  }
  async function newDrill(edit) {
    const el = K.sheet("pt-co-nd", 80), d0 = edit || { name: "", kind: "time", unit: "" };
    const c = K.openSheet(el, `${K.head(edit ? "Edit drill" : "Your own drill", "How it is measured decides how it is ranked")}
      <div class="pt-co-fields"><label class="wide"><span>Name</span><input data-f="name" value="${esc(d0.name)}" maxlength="40" autocomplete="off" placeholder="Pro agility"></label></div>
      <div class="pt-co-kinds">${Object.entries(KINDS).map(([k, v]) => `<button type="button" class="pt-co-kind${d0.kind === k ? " on" : ""}" data-k="${k}" aria-pressed="${d0.kind === k}">${esc(v.name)}</button>`).join("")}</div>
      <div class="pt-co-fields" id="pt-co-nd-u" style="${d0.kind === "count" ? "" : "display:none"}"><label class="wide"><span>What is counted</span><input data-f="unit" value="${esc(d0.unit || "")}" maxlength="12" placeholder="reps, makes, laps" autocomplete="off"></label></div>
      <div class="pt-co-btns"><button type="button" class="pt-co-go" data-b="save">Save</button>${edit ? `<button type="button" class="pt-co-sm danger" data-b="del">Delete</button>` : ""}</div>`);
    let k = d0.kind;
    c.addEventListener("click", async e => {
      const kb = e.target.closest("[data-k]"); if (kb) { k = kb.dataset.k; c.querySelectorAll("[data-k]").forEach(x => { x.classList.toggle("on", x === kb); x.setAttribute("aria-pressed", String(x === kb)); }); $("pt-co-nd-u").style.display = k === "count" ? "" : "none"; return; }
      const b = e.target.closest("[data-b]"); if (!b) return;
      if (b.dataset.b === "save") { const name = c.querySelector('[data-f="name"]').value.trim().slice(0, 40); if (!name) { toast("Give the drill a name."); return; } const unit = (c.querySelector('[data-f="unit"]').value || "").trim().slice(0, 12); if (edit) { edit.name = name; edit.kind = k; edit.unit = k === "count" ? unit : ""; } else db().drills.push({ id: "c" + uid(), name, kind: k, unit: k === "count" ? unit : "", icon: "⭐" }); save(); K.closeSheet(el); render(true); }
      else if (b.dataset.b === "del") { if (!await PT.confirm(`Delete the drill "${edit.name}"? Results already logged stay in your practice records.`, { title: "Delete drill", ok: "Delete" })) return; db().drills = db().drills.filter(x => x !== edit); save(); K.closeSheet(el); render(true); }
    });
  }
  function drillSheet(t, d) {
    const el = K.sheet("pt-co-dr", 80), h = history(d.id, null, t && t.id), b = board(d, h), custom = db().drills.indexOf(d) >= 0;
    // the team's average on each day, to see the group getting better
    const byDay = new Map(); h.forEach(r => { const x = byDay.get(r.date) || []; x.push(r.v); byDay.set(r.date, x); });
    const days = [...byDay.entries()].sort((x, y) => (x[0] < y[0] ? -1 : 1)).slice(-8).map(([date, v]) => [date, v.reduce((p, q) => p + q, 0) / v.length]);
    const c = K.openSheet(el, `${K.head(d.name, kind(d).name)}
      <div class="pt-co-btns"><button type="button" class="pt-co-go" data-b="run" ${t && t.athletes.length ? "" : "disabled"}>${kind(d).stop ? "Time it now" : "Enter results"}</button>${custom ? `<button type="button" class="pt-co-sm" data-b="edit">Edit</button>` : ""}</div>
      ${b.length ? `<h4 class="pt-co-h4">${esc(t ? t.name : "Team")} best</h4><div class="pt-co-list">${b.slice(0, 12).map((r, i) => `<div class="pt-co-li static"><i>${rankIcon(i)}</i><span>${esc(nameOf(t, r))}<small>${esc(dayTxt(r.date))}</small></span><b>${esc(fmtV(d, r.v))}</b></div>`).join("")}</div>${b.length > 12 ? `<p class="pt-co-fine">+${b.length - 12} more</p>` : ""}` : `<p class="pt-co-fine">No results yet for this drill.</p>`}
      ${days.length > 1 ? `<h4 class="pt-co-h4">Team average by day</h4><div class="pt-co-list">${days.map(([date, v]) => `<div class="pt-co-li static"><span>${esc(dayTxt(date))}</span><b>${esc(fmtV(d, v))}</b></div>`).join("")}</div>` : ""}`);
    c.addEventListener("click", e => { const x = e.target.closest("[data-b]"); if (!x) return; K.closeSheet(el); if (x.dataset.b === "run") pickAthletes(d); else if (x.dataset.b === "edit") newDrill(d); });
  }

  /* ---- Gear */
  function gearMissing(s) {
    if (!s || !s.after) return [];
    const out = []; const names = Object.assign({}, s.gn || {}); db().gear.forEach(g => { names[g.id] = g.name; });
    Object.keys(s.after).forEach(id => { const was = s.before && s.before[id] != null ? s.before[id] : (db().gear.find(g => g.id === id) || {}).n; if (was != null && s.after[id] < was) out.push({ id, name: names[id] || "item", n: was - s.after[id], was, now: s.after[id] }); });
    return out;
  }
  function viewGear(t) {
    const g = db().gear, last = t ? sessions(t).find(s => s.after) : null, miss = last ? gearMissing(last) : [];
    return card(`<div class="pt-co-row"><div><h3>Gear</h3><p class="pt-co-fine">What you take out to practice</p></div><button type="button" class="pt-co-sm" data-co="addgear">＋ Item</button></div>
      ${g.length ? `<div class="pt-co-list">${g.map(x => `<button type="button" class="pt-co-li" data-co="gear" data-id="${esc(x.id)}"><i>${esc(x.n)}</i><span>${esc(x.name)}</span>${miss.find(m => m.id === x.id) ? `<em class="warn">−${miss.find(m => m.id === x.id).n} last time</em>` : ""}</button>`).join("")}</div>
        <div class="pt-co-btns"><button type="button" class="pt-co-go" data-co="count" data-k="before">Count before practice</button><button type="button" class="pt-co-go alt" data-co="count" data-k="after">Count after practice</button></div>` : `<p class="pt-co-fine">Add the things you take to practice, with how many you own: cones, balls, pinnies, hurdles, ladders. Then count them out before practice and back in afterwards, and the app tells you what did not come home.</p>
        <div class="pt-co-presets">${["Cones", "Balls", "Pinnies", "Hurdles", "Agility ladders", "Water bottles", "Mini goals", "First-aid kit"].map(n => `<button type="button" class="pt-co-chip" data-co="preset" data-n="${esc(n)}">${esc(n)}</button>`).join("")}</div>`}
      ${last ? `<p class="${miss.length ? "pt-co-warn" : "pt-co-ok"}">${miss.length ? "⚠ " + esc(dayTxt(last.date)) + ": " + esc(miss.map(m => m.n + " " + m.name.toLowerCase() + " not back").join(", ")) : "✓ " + esc(dayTxt(last.date)) + ": everything came back"}</p>` : ""}`);
  }
  async function gearSheet(x) {
    const el = K.sheet("pt-co-gi", 80), isNew = !x; x = x || { id: uid(), name: "", n: 10 };
    const c = K.openSheet(el, `${K.head(isNew ? "New item" : "Edit item", "How many you own")}
      <div class="pt-co-fields"><label class="wide"><span>Name</span><input data-f="name" value="${esc(x.name)}" maxlength="30" autocomplete="off" placeholder="Cones"></label><label><span>How many</span><input data-f="n" value="${esc(x.n)}" inputmode="numeric" maxlength="4" autocomplete="off"></label></div>
      <div class="pt-co-btns"><button type="button" class="pt-co-go" data-b="save">Save</button>${isNew ? "" : `<button type="button" class="pt-co-sm danger" data-b="del">Delete</button>`}</div>`);
    c.addEventListener("click", async e => {
      const b = e.target.closest("[data-b]"); if (!b) return;
      if (b.dataset.b === "save") { const name = c.querySelector('[data-f="name"]').value.trim().slice(0, 30), n = Math.max(0, Math.min(9999, parseInt(c.querySelector('[data-f="n"]').value, 10) || 0)); if (!name) { toast("Give the item a name."); return; } x.name = name; x.n = n; if (isNew) { if (db().gear.length >= MAX_GEAR) { toast("That is the most items the app keeps."); return; } db().gear.push(x); } save(); K.closeSheet(el); render(true); }
      else if (b.dataset.b === "del") { if (!await PT.confirm(`Delete "${x.name}" from your gear?`, { title: "Delete item", ok: "Delete" })) return; db().gear = db().gear.filter(y => y.id !== x.id); save(); K.closeSheet(el); render(true); }
    });
  }
  /** count what you have: kind is "before" or "after" */
  function countSheet(k) {
    const t = curTeam(), g = db().gear; if (!g.length) { U.tab = "gear"; render(); toast("Add your gear first."); return; }
    const s = sessionFor(t, true), base = {}; g.forEach(x => { base[x.id] = k === "after" && s.before && s.before[x.id] != null ? s.before[x.id] : x.n; });
    const cur = Object.assign({}, base, s[k] || {}), el = K.sheet("pt-co-cnt", 80);
    const rows = () => g.map(x => `<div class="pt-co-cnt" data-id="${esc(x.id)}"><span>${esc(x.name)}<small>${k === "after" ? "took out " + (s.before && s.before[x.id] != null ? s.before[x.id] : "?") + " · own " + x.n : "own " + x.n}</small></span><button type="button" data-c="-" aria-label="One less ${esc(x.name)}">−</button><input inputmode="numeric" value="${cur[x.id]}" aria-label="${esc(x.name)} count" data-c="in"><button type="button" data-c="+" aria-label="One more ${esc(x.name)}">+</button></div>`).join("");
    const c = K.openSheet(el, `${K.head(k === "after" ? "Count after practice" : "Count before practice", k === "after" ? "What came back" : "What you are taking out")}<div class="pt-co-cnts">${rows()}</div><button type="button" class="pt-co-go" data-b="save">${k === "after" ? "Save the count" : "Save"}</button>`);
    const set = (id, v) => { cur[id] = Math.max(0, Math.min(9999, v)); const i = c.querySelector(`.pt-co-cnt[data-id="${id}"] input`); if (i) i.value = String(cur[id]); };
    c.addEventListener("click", e => {
      const b = e.target.closest("[data-c], [data-b]"); if (!b) return;
      if (b.dataset.c) { const id = b.closest(".pt-co-cnt").dataset.id; if (b.dataset.c === "-") set(id, cur[id] - 1); else if (b.dataset.c === "+") set(id, cur[id] + 1); return; }
      s[k] = Object.assign({}, cur); s[k + "At"] = Date.now(); s.gn = Object.assign(s.gn || {}, Object.fromEntries(g.map(x => [x.id, x.name]))); save(); K.closeSheet(el);
      if (k === "after") afterSummary(s); else { render(true); toast("Counted out"); }
    });
    c.addEventListener("input", e => { const i = e.target.closest('input[data-c="in"]'); if (i) cur[i.closest(".pt-co-cnt").dataset.id] = Math.max(0, Math.min(9999, parseInt(i.value, 10) || 0)); });
  }
  function afterSummary(s) {
    const miss = gearMissing(s), el = K.sheet("pt-co-aft", 80), g = db().gear;
    const stale = g.filter(x => s.after[x.id] != null && s.after[x.id] !== x.n);
    const c = K.openSheet(el, `${K.head(miss.length ? "Not everything came back" : "All the gear is back", miss.length ? "Worth a look before you leave" : "Counted in")}
      ${miss.length ? `<div class="pt-co-list">${miss.map(m => `<div class="pt-co-li static"><span>${esc(m.name)}<small>${m.was} out, ${m.now} back</small></span><b class="warn">−${m.n}</b></div>`).join("")}</div>` : `<p class="pt-co-ok">Everything you took out was counted back in.</p>`}
      <div class="pt-co-btns">${miss.length ? `<button type="button" class="pt-co-go" data-b="share">Share what is missing</button>` : ""}${stale.length ? `<button type="button" class="pt-co-sm" data-b="stock">Update my stock to match (${stale.map(x => x.name.toLowerCase()).slice(0, 3).join(", ")}${stale.length > 3 ? "…" : ""})</button>` : ""}<button type="button" class="pt-co-sm" data-b="done">Done</button></div>`);
    c.addEventListener("click", async e => {
      const b = e.target.closest("[data-b]"); if (!b) return;
      if (b.dataset.b === "share") { await shareText("Gear check", `Gear not back after practice (${dayTxt(s.date)}):\n` + miss.map(m => `- ${m.n} ${m.name.toLowerCase()} (took ${m.was}, back ${m.now})`).join("\n")); }
      else if (b.dataset.b === "stock") { g.forEach(x => { if (s.after[x.id] != null) x.n = s.after[x.id]; }); save(); K.closeSheet(el); render(true); toast("Stock updated"); }
      else { K.closeSheet(el); render(true); }
    });
  }

  /* ---- attendance, a run, the summary */
  function attSheet(t) {
    const s = sessionFor(t, true), el = K.sheet("pt-co-att", 80), on = new Set(present(t, s).map(a => a.id));
    const c = K.openSheet(el, `${K.head("Who is here?", dayTxt(today()))}<div class="pt-co-btns"><button type="button" class="pt-co-sm" data-b="all">Everyone</button><button type="button" class="pt-co-sm" data-b="none">No one</button><span class="pt-co-fine" id="pt-co-att-n"></span></div>
      <div class="pt-co-grid" id="pt-co-att-g">${t.athletes.map(a => `<button type="button" class="pt-co-pick${on.has(a.id) ? " on" : ""}" data-id="${esc(a.id)}" aria-pressed="${on.has(a.id)}">${esc(nm(a))}</button>`).join("")}</div>`);
    const note = () => { $("pt-co-att-n").textContent = on.size + " of " + t.athletes.length; s.present = on.size === t.athletes.length ? null : [...on]; save(); };
    note();
    c.addEventListener("click", e => {
      const b = e.target.closest("[data-id], [data-b]"); if (!b) return;
      if (b.dataset.b) { t.athletes.forEach(a => { if (b.dataset.b === "all") on.add(a.id); else on.delete(a.id); }); } else { const id = b.dataset.id; if (on.has(id)) on.delete(id); else on.add(id); }
      c.querySelectorAll(".pt-co-pick").forEach(x => { x.classList.toggle("on", on.has(x.dataset.id)); x.setAttribute("aria-pressed", String(on.has(x.dataset.id))); }); note();
    });
    el.__onClose = () => render(true);
  }
  function runSheet(t, s, r) {
    const el = K.sheet("pt-co-run", 80), d = drillOf(r.d), manual = !kind(d).stop;
    const dispV = d.kind === "dist" ? toDisp(r.v) : r.v;
    const c = K.openSheet(el, `${K.head(nameOf(t, r), d.name)}<div class="pt-co-fields"><label class="wide"><span>${d.kind === "dist" ? "Result (" + lenU() + ")" : d.kind === "count" ? "Result" : "Time in seconds"}</span><input data-f="v" value="${esc(dispV)}" inputmode="decimal" autocomplete="off"></label></div>
      <div class="pt-co-btns"><button type="button" class="pt-co-go" data-b="save">Save</button><button type="button" class="pt-co-sm danger" data-b="del">Delete this result</button></div>`);
    c.addEventListener("click", async e => {
      const b = e.target.closest("[data-b]"); if (!b) return;
      if (b.dataset.b === "save") { let v = parseFloat(String(c.querySelector('[data-f="v"]').value).replace(",", ".")); if (!(v >= 0) || !isFinite(v)) { toast("Enter a number."); return; } r.v = d.kind === "dist" ? Math.round(fromDisp(v) * 10) / 10 : Math.round(v * 100) / 100; save(); K.closeSheet(el); render(true); }
      else if (b.dataset.b === "del") { s.runs = s.runs.filter(x => x.id !== r.id); save(); K.closeSheet(el); render(true); toast("Result deleted"); }
    });
  }
  function summaryText(t, s) {
    const lines = [`${t.name} · ${dayTxt(s ? s.date : today())}`], pres = present(t, s);
    lines.push(`Here: ${pres.length} of ${t.athletes.length}` + (pres.length < t.athletes.length ? ` (away: ${t.athletes.filter(a => pres.indexOf(a) < 0).map(a => a.name).join(", ")})` : ""));
    if (s) {
      const order = []; s.runs.forEach(r => { if (order.indexOf(r.d) < 0) order.push(r.d); });
      order.forEach(id => { const d = drillOf(id), b = board(d, s.runs.filter(r => r.d === id)); lines.push("", d.name + ":"); b.forEach((r, i) => lines.push(`${i + 1}. ${nameOf(t, r)} ${fmtV(d, r.v)}${r.pb ? " 🏆" : ""}`)); });
      (s.circ || []).forEach(c => lines.push("", `Group timer: ${c.work}s work, ${c.rest}s rotate, ${c.stations.join(", ")} (${c.rounds} rounds)`));
      if (s.after) { const m = gearMissing(s); lines.push("", m.length ? "Gear not back: " + m.map(x => `${x.n} ${x.name.toLowerCase()}`).join(", ") : "Gear: all back"); }
      if (s.note) lines.push("", "Note: " + s.note);
    }
    return lines.join("\n");
  }
  function csv() {
    const rows = [["Date", "Team", "Athlete", "Number", "Drill", "Result", "Unit", "Personal best"]];
    db().sessions.slice().sort((a, b) => a.ts - b.ts).forEach(s => { const t = teamOf(s.team); s.runs.forEach(r => { const d = drillOf(r.d), a = athOf(t, r.a); rows.push([s.date, t ? t.name : "", a ? a.name : r.n || "", a ? a.num : "", d.name, d.kind === "dist" ? toDisp(r.v) : r.v, d.kind === "dist" ? lenU() : d.kind === "count" ? d.unit || "" : "s", r.pb ? "yes" : ""]); }); });
    return rows.map(r => r.map(PT.csvCell).join(",")).join("\r\n");
  }
  async function moreMenu() {
    const t = curTeam(), v = await PT.pickList("Coach mode", [{ value: "hist", label: "Practice history" }, { value: "csv", label: "Export all results (CSV)" }, { value: "wipe", label: "Erase all coach data" }], ""); if (!v) return;
    if (v === "hist") historySheet(t);
    else if (v === "csv") { if (!db().sessions.some(s => s.runs.length)) { toast("No results to export yet."); return; } const f = new File(["﻿" + csv()], `pulsetrack-coach-${today()}.csv`, { type: "text/csv" }); await A().shareFile(f, "Coach results"); }
    else if (v === "wipe") { if (!await PT.confirm("Erase every team, athlete, result and gear count in Coach mode? This cannot be undone.", { title: "Erase coach data", ok: "Erase everything" })) return; D = { v: 1, teams: [], drills: [], gear: [], sessions: [], cur: {}, cfg: {} }; save(); render(); toast("Coach data erased"); }
  }
  function historySheet(t) {
    const list = t ? sessions(t) : [], el = K.sheet("pt-co-hist", 80);
    const c = K.openSheet(el, `${K.head("Practice history", t ? t.name : "")}${list.length ? `<div class="pt-co-list">${list.slice(0, 60).map(s => `<button type="button" class="pt-co-li" data-id="${esc(s.id)}"><span>${esc(dayTxt(s.date))}<small>${plural(s.runs.length, "result")}${s.circ && s.circ.length ? " · group timer" : ""}${s.after ? (gearMissing(s).length ? " · gear missing" : " · gear ok") : ""}</small></span></button>`).join("")}</div>` : `<p class="pt-co-fine">No practices yet.</p>`}`);
    c.addEventListener("click", e => { const b = e.target.closest("[data-id]"); if (!b) return; const s = db().sessions.find(x => x.id === b.dataset.id); if (s) { K.closeSheet(el); summarySheet(t, s); } });
  }
  function summarySheet(t, s) {
    const el = K.sheet("pt-co-sum", 80), text = summaryText(t, s);
    const c = K.openSheet(el, `${K.head("Summary", dayTxt(s ? s.date : today()))}<pre class="pt-co-pre">${esc(text)}</pre><div class="pt-co-btns"><button type="button" class="pt-co-go" data-b="share">Share</button><button type="button" class="pt-co-sm" data-b="done">Done</button></div>`);
    c.addEventListener("click", async e => { const b = e.target.closest("[data-b]"); if (!b) return; if (b.dataset.b === "share") await shareText(t.name + " practice", text); else K.closeSheet(el); });
  }

  /* ---------------------------------------------------------------- picking athletes and starting a drill */
  async function chooseDrill() {
    const recent = []; db().sessions.slice().sort((a, b) => b.ts - a.ts).forEach(s => s.runs.forEach(r => { if (recent.indexOf(r.d) < 0) recent.push(r.d); }));
    const ds = allDrills(), items = recent.slice(0, 6).map(id => ds.find(d => d.id === id)).filter(Boolean).concat(ds.filter(d => recent.slice(0, 6).indexOf(d.id) < 0));
    const v = await PT.pickList("Which drill?", items.map(d => ({ value: d.id, label: (d.icon || "") + " " + d.name })), ""); return v ? drillOf(v) : null;
  }
  async function startDrill() { const d = await chooseDrill(); if (d) pickAthletes(d); }
  function pickAthletes(d) {
    const t = curTeam(); if (!t) return; const s = sessionFor(t, false), pres = present(t, s);
    const last = db().cur.sel && db().cur.sel[t.id], on = new Set(last ? pres.filter(a => last.indexOf(a.id) >= 0).map(a => a.id) : pres.map(a => a.id)); if (!on.size) pres.forEach(a => on.add(a.id));
    const el = K.sheet("pt-co-pick", 80), man = !kind(d).stop;
    const c = K.openSheet(el, `${K.head(d.name, kind(d).name)}<div class="pt-co-btns"><button type="button" class="pt-co-sm" data-b="all">All here</button><button type="button" class="pt-co-sm" data-b="none">None</button><span class="pt-co-fine" id="pt-co-pk-n"></span></div>
      <div class="pt-co-grid">${pres.map(a => `<button type="button" class="pt-co-pick${on.has(a.id) ? " on" : ""}" data-id="${esc(a.id)}" aria-pressed="${on.has(a.id)}">${esc(nm(a))}</button>`).join("")}</div>
      ${pres.length < t.athletes.length ? `<p class="pt-co-fine">Only the ${pres.length} marked as here are listed.</p>` : ""}
      <button type="button" class="pt-co-go" data-b="go" id="pt-co-pk-go"></button>
      <button type="button" class="pt-co-sm wide" data-b="drill">Choose a different drill</button>`);
    const upd = () => { $("pt-co-pk-n").textContent = on.size + " picked"; const g = $("pt-co-pk-go"); g.disabled = !on.size; g.textContent = man ? "Enter results" : "Open the stopwatch"; c.querySelectorAll(".pt-co-pick").forEach(x => { x.classList.toggle("on", on.has(x.dataset.id)); x.setAttribute("aria-pressed", String(on.has(x.dataset.id))); }); };
    upd();
    c.addEventListener("click", e => {
      const b = e.target.closest("[data-id], [data-b]"); if (!b) return;
      if (b.dataset.id) { if (on.has(b.dataset.id)) on.delete(b.dataset.id); else on.add(b.dataset.id); upd(); return; }
      const k = b.dataset.b;
      if (k === "all") { pres.forEach(a => on.add(a.id)); upd(); } else if (k === "none") { on.clear(); upd(); }
      else if (k === "drill") { K.closeSheet(el); startDrill(); }
      else if (k === "go" && on.size) { const ids = pres.filter(a => on.has(a.id)).map(a => a.id); (db().cur.sel = db().cur.sel || {})[t.id] = ids; save(); K.closeSheet(el); if (man) enterResults(t, d, ids); else PT.coachMode.stopwatch(t, d, ids); }
    });
  }
  /** results typed in: jumps, reps, makes */
  function enterResults(t, d, ids) {
    const el = K.sheet("pt-co-ent", 80), list = ids.map(id => athOf(t, id)).filter(Boolean), u = d.kind === "dist" ? lenU() : d.unit || "";
    const c = K.openSheet(el, `${K.head(d.name, "Type each result. Leave a name blank to skip it.")}<div class="pt-co-cnts">${list.map(a => `<label class="pt-co-cnt"><span>${esc(nm(a))}</span><input data-a="${esc(a.id)}" inputmode="decimal" placeholder="${esc(u)}" autocomplete="off"></label>`).join("")}</div><button type="button" class="pt-co-go" data-b="save">Save results</button>`);
    const first = c.querySelector("input"); if (first) setTimeout(() => { try { first.focus(); } catch (e) { } }, 100);
    c.addEventListener("click", e => {
      if (!e.target.closest('[data-b="save"]')) return;
      const out = []; c.querySelectorAll("input[data-a]").forEach(i => { const raw = String(i.value).replace(",", ".").trim(); if (raw === "") return; const v = parseFloat(raw); if (v >= 0 && isFinite(v)) out.push({ a: i.dataset.a, v: d.kind === "dist" ? Math.round(fromDisp(v) * 10) / 10 : Math.round(v * 10) / 10 }); });
      if (!out.length) { toast("Type at least one result."); return; }
      K.closeSheet(el); showResults(t, d, addRuns(t, d, out), ids);
    });
  }
  /** the board for the round that was just saved */
  function showResults(t, d, runs, ids) {
    const el = K.sheet("pt-co-res", 82), b = board(d, runs);
    const c = K.openSheet(el, `${K.head(d.name, plural(runs.length, "result") + " saved")}<div class="pt-co-list">${b.map((r, i) => `<div class="pt-co-li static"><i>${rankIcon(i)}</i><span>${esc(nameOf(t, r))}${r.pb ? `<small class="ok">🏆 New personal best</small>` : r.first ? `<small>First time on this drill</small>` : ""}</span><b>${esc(fmtV(d, r.v))}</b></div>`).join("")}</div>
      <div class="pt-co-btns"><button type="button" class="pt-co-go" data-b="again">Another round</button><button type="button" class="pt-co-sm" data-b="done">Done</button></div>`);
    c.addEventListener("click", e => { const x = e.target.closest("[data-b]"); if (!x) return; K.closeSheet(el); if (x.dataset.b === "again") { if (kind(d).stop) PT.coachMode.stopwatch(t, d, ids); else enterResults(t, d, ids); } else render(true); });
  }

  /* ---------------------------------------------------------------- clicks */
  async function clicks(e) {
    const tb = e.target.closest("[data-co-tab]"); if (tb) { U.tab = tb.dataset.coTab; render(); return; }
    const b = e.target.closest("[data-co]"); if (!b) return; const k = b.dataset.co, t = curTeam();
    if (k === "x") { close(); return; }
    if (k === "more") { moreMenu(); return; }
    if (k === "tab") { U.tab = b.dataset.tab; render(); return; }
    if (k === "team") { db().cur.team = b.dataset.id; save(); render(); return; }
    if (k === "newteam") { newTeam(); return; }
    if (k === "att" && t) { attSheet(t); return; }
    if (k === "drill") { startDrill(); return; }
    if (k === "circ") { if (PT.coachMode.circuit) PT.coachMode.circuit(); return; }
    if (k === "count") { if (b.dataset.k) countSheet(b.dataset.k); else { const s = sessionFor(t, false); countSheet(s && s.before && !s.after ? "after" : "before"); } return; }
    if (k === "share" && t) { summarySheet(t, sessionFor(t, false)); return; }
    if (k === "run" && t) { const s = sessionFor(t, false), r = s && s.runs.find(x => x.id === b.dataset.id); if (r) runSheet(t, s, r); return; }
    if (k === "addath" && t) { addAthlete(t); return; }
    if (k === "bulk" && t) { bulkSheet(t); return; }
    if (k === "ath" && t) { const a = athOf(t, b.dataset.id); if (a) athSheet(t, a); return; }
    if (k === "renteam" && t) { const v = await PT.prompt("Team name", t.name); if (v == null) return; const n = String(v).trim().slice(0, 40); if (n) { t.name = n; save(); render(true); } return; }
    if (k === "delteam" && t) { if (!await PT.confirm(`Delete "${t.name}" with its roster and all its practices? This cannot be undone.`, { title: "Delete team", ok: "Delete team" })) return; const d = db(); d.teams = d.teams.filter(x => x.id !== t.id); d.sessions = d.sessions.filter(s => s.team !== t.id); d.cur.team = d.teams[0] ? d.teams[0].id : null; save(); render(); return; }
    if (k === "drillinfo") { drillSheet(t, drillOf(b.dataset.id)); return; }
    if (k === "newdrill") { newDrill(null); return; }
    if (k === "addgear") { gearSheet(null); return; }
    if (k === "gear") { const g = db().gear.find(x => x.id === b.dataset.id); if (g) gearSheet(g); return; }
    if (k === "preset") { const d = db(); if (d.gear.length < MAX_GEAR && !d.gear.some(x => x.name === b.dataset.n)) { d.gear.push({ id: uid(), name: b.dataset.n, n: 10 }); save(); render(true); gearSheet(d.gear[d.gear.length - 1]); } return; }
  }
  document.addEventListener("input", e => {
    if (!e.target || e.target.id !== "pt-co-note") return; const t = curTeam(); if (!t) return; const s = sessionFor(t, true); s.note = e.target.value.slice(0, 400);
    clearTimeout(document.__coT); document.__coT = setTimeout(save, 500);
  });

  /* ---------------------------------------------------------------- a way in from Cardio & Sports */
  function addEntry() {
    const root = $("cardio-root"); if (!root || $("pt-co-entry")) return;
    const e = document.createElement("div"); e.id = "pt-co-entry"; const t = curTeam();
    e.innerHTML = `<button type="button" id="pt-co-open" class="pt-co-entry"><span class="ic">🧑‍🏫</span><span class="tx"><b>Coach mode</b><small>${t ? esc(t.name) + " · " + plural(t.athletes.length, "athlete") : "Roster, drill times, group timers, gear counts"}</small></span><span class="ch">›</span></button>`;
    root.firstElementChild ? root.firstElementChild.insertAdjacentElement("afterend", e) : root.appendChild(e);
  }
  const oCV = proto.renderCardioView;
  if (typeof oCV === "function") proto.renderCardioView = function () { const r = oCV.apply(this, arguments); try { addEntry(); } catch (e) { } return r; };
  try { const root = $("cardio-root"); if (root) new MutationObserver(() => { try { addEntry(); } catch (e) { } }).observe(root, { childList: true }); } catch (e) { }
  document.addEventListener("click", e => { if (e.target && e.target.closest && e.target.closest("#pt-co-open")) open(); });

  PT.coachMode = { open, close, db, save, curTeam, sessionFor, present, athOf, nameOf, drillOf, kind, fmtT, fmtV, history, bestOf, board, addRuns, showResults, snd, say, toast, nm, esc, plural, render, U, shareText, today };

  const css = document.createElement("style");
  css.id = "pt-v247-coach-css";
  css.textContent = `
    body.pt-co-on #floating-rest-timer { display: none; } body.pt-co-on #pt-toast { z-index: 500 !important; }
    #pt-coach { position: fixed; inset: 0; z-index: 72; display: flex; flex-direction: column; background: rgb(var(--z950)); color: rgb(var(--z100)); }
    .pt-co-head { display: flex; align-items: center; gap: .6rem; padding: calc(env(safe-area-inset-top, 0px) + .6rem) .8rem .5rem; } .pt-co-head > button { flex: none; width: 2.6rem; height: 2.6rem; border-radius: 9999px; background: rgb(var(--z800)); color: rgb(var(--z50)); font-size: 1.4rem; line-height: 1; font-weight: 700; }
    .pt-co-ttl { flex: 1; min-width: 0; display: grid; } .pt-co-ttl b { font-size: 1rem; color: rgb(var(--z50)); } .pt-co-ttl span { font-size: .72rem; color: rgb(var(--z400)); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .pt-co-team { display: flex; gap: .4rem; overflow-x: auto; padding: 0 .8rem .5rem; scrollbar-width: none; } .pt-co-team:empty { display: none; } .pt-co-team::-webkit-scrollbar { display: none; }
    .pt-co-chip { flex: none; padding: .45rem .8rem; border-radius: 9999px; font-size: .78rem; font-weight: 700; background: rgb(var(--z800)); color: rgb(var(--z200)); } .pt-co-chip.on { background: rgb(var(--a600)); color: #fff; } .pt-co-chip.add { background: transparent; border: 1px dashed rgb(var(--z700)); color: rgb(var(--z400)); }
    .pt-co-body { flex: 1; overflow-y: auto; padding: .3rem .8rem 1.2rem; display: grid; grid-template-columns: minmax(0, 1fr); gap: .7rem; align-content: start; }
    .pt-co-tabs { display: grid; grid-template-columns: repeat(4, 1fr); border-top: 1px solid rgb(var(--z800)); background: rgb(var(--z900)); padding-bottom: env(safe-area-inset-bottom, 0px); }
    .pt-co-tabs button { display: grid; justify-items: center; gap: .1rem; padding: .55rem .2rem .5rem; color: rgb(var(--z400)); font-size: .66rem; font-weight: 700; } .pt-co-tabs i { font-style: normal; font-size: 1.15rem; } .pt-co-tabs .on { color: rgb(var(--a400)); }
    .pt-co-card { display: grid; grid-template-columns: minmax(0, 1fr); gap: .6rem; padding: .9rem; border-radius: 1.1rem; background: rgb(var(--z900)); border: 1px solid rgb(var(--z800)); }
    .pt-co-card h3 { font-size: .95rem; font-weight: 800; color: rgb(var(--z50)); } .pt-co-h4 { font-size: .6rem; font-weight: 800; letter-spacing: .07em; text-transform: uppercase; color: rgb(var(--z500)); margin-top: .2rem; }
    .pt-co-row { display: flex; align-items: center; justify-content: space-between; gap: .6rem; } .pt-co-fine { font-size: .72rem; line-height: 1.4; color: rgb(var(--z400)); } .pt-co-ok { font-size: .76rem; color: rgb(var(--a400)); font-weight: 700; } .pt-co-warn { font-size: .76rem; color: #fbbf24; font-weight: 700; }
    .pt-co-empty { display: grid; gap: .4rem; justify-items: center; text-align: center; padding: .6rem .3rem; } .pt-co-empty > div { font-size: 2rem; } .pt-co-empty b { color: rgb(var(--z50)); } .pt-co-empty p { font-size: .76rem; line-height: 1.45; color: rgb(var(--z400)); }
    .pt-co-go { width: 100%; padding: .8rem 1rem; border-radius: .9rem; font-size: .88rem; font-weight: 800; background: rgb(var(--a600)); color: #fff; } .pt-co-go:disabled { opacity: .4; } .pt-co-go.alt { background: rgb(var(--z800)); color: rgb(var(--z100)); }
    .pt-co-sm { padding: .5rem .8rem; border-radius: .7rem; font-size: .74rem; font-weight: 800; background: rgb(var(--z800)); color: rgb(var(--z100)); } .pt-co-sm.danger, .pt-co-sm.danger b { color: rgb(251 113 133); } .pt-co-sm.wide { width: 100%; }
    .pt-co-btns { display: flex; flex-wrap: wrap; gap: .45rem; align-items: center; } .pt-co-btns .pt-co-go { flex: 1 1 100%; } .pt-co-btns.end { justify-content: flex-end; margin-top: .3rem; }
    .pt-co-att { display: flex; justify-content: space-between; align-items: center; gap: .6rem; padding: .7rem .85rem; border-radius: .85rem; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); font-size: .8rem; font-weight: 700; color: rgb(var(--z50)); text-align: left; } .pt-co-att span:last-child { font-size: .68rem; font-weight: 600; color: rgb(var(--z400)); text-align: right; }
    .pt-co-tools { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: .5rem; } .pt-co-tools button { display: grid; gap: .1rem; justify-items: start; text-align: left; padding: .75rem; border-radius: .9rem; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); } .pt-co-tools button:disabled { opacity: .45; }
    .pt-co-tools i { font-style: normal; font-size: 1.3rem; } .pt-co-tools b { font-size: .84rem; color: rgb(var(--z50)); } .pt-co-tools span { font-size: .66rem; color: rgb(var(--z400)); }
    .pt-co-list { display: grid; grid-template-columns: minmax(0, 1fr); gap: .35rem; } .pt-co-li { display: flex; align-items: center; gap: .6rem; padding: .6rem .7rem; border-radius: .8rem; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); text-align: left; color: rgb(var(--z100)); font-size: .82rem; } .pt-co-li.static { cursor: default; }
    .pt-co-li > i { flex: none; min-width: 1.6rem; text-align: center; font-style: normal; font-size: .95rem; color: rgb(var(--z400)); font-weight: 800; } .pt-co-li > span { flex: 1; min-width: 0; display: grid; gap: .05rem; font-weight: 700; } .pt-co-li small { display: block; font-size: .66rem; font-weight: 500; color: rgb(var(--z400)); } .pt-co-li small.ok { color: rgb(var(--a400)); }
    .pt-co-li > b { flex: none; font-family: ui-monospace, monospace; font-size: .9rem; color: rgb(var(--z50)); text-align: right; } .pt-co-li > b small { font-family: inherit; } .pt-co-li b.warn { color: #fbbf24; } .pt-co-li em { flex: none; font-style: normal; font-size: .72rem; } .pt-co-li em.dim { color: rgb(var(--z500)); font-weight: 700; } .pt-co-li em.warn { color: #fbbf24; font-weight: 800; }
    .pt-co-lab { font-size: .7rem; font-weight: 800; color: rgb(var(--z400)); } .pt-co-ta { width: 100%; padding: .7rem; border-radius: .8rem; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); color: rgb(var(--z100)); font-size: .85rem; resize: vertical; } .pt-co-ta.tall { min-height: 12rem; }
    .pt-co-fields { display: grid; grid-template-columns: minmax(0, 1fr) 5rem; gap: .5rem; } .pt-co-fields label { display: grid; gap: .25rem; } .pt-co-fields .wide { grid-column: 1 / -1; } .pt-co-fields span { font-size: .68rem; font-weight: 700; color: rgb(var(--z400)); }
    .pt-co-fields input, .pt-co-cnt input { padding: .65rem .7rem; border-radius: .7rem; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); color: rgb(var(--z100)); font-size: .9rem; min-width: 0; }
    .pt-co-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .4rem; } .pt-co-pick { padding: .7rem .6rem; border-radius: .8rem; text-align: left; font-size: .8rem; font-weight: 700; background: rgb(var(--z950)); border: 2px solid rgb(var(--z800)); color: rgb(var(--z300)); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } .pt-co-pick.on { border-color: rgb(var(--a500)); color: rgb(var(--z50)); background: rgb(var(--a950)); }
    .pt-co-kinds { display: grid; grid-template-columns: minmax(0, 1fr); gap: .4rem; } .pt-co-kind { padding: .7rem .8rem; border-radius: .8rem; text-align: left; font-size: .8rem; font-weight: 700; background: rgb(var(--z950)); border: 2px solid rgb(var(--z800)); color: rgb(var(--z300)); } .pt-co-kind.on { border-color: rgb(var(--a500)); color: rgb(var(--z50)); }
    .pt-co-cnts { display: grid; grid-template-columns: minmax(0, 1fr); gap: .4rem; } .pt-co-cnt { display: grid; grid-template-columns: minmax(0, 1fr) auto auto auto; align-items: center; gap: .4rem; padding: .45rem .55rem; border-radius: .8rem; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); } .pt-co-cnt > span { font-size: .82rem; font-weight: 700; color: rgb(var(--z50)); display: grid; min-width: 0; } .pt-co-cnt small { font-size: .62rem; font-weight: 500; color: rgb(var(--z500)); }
    .pt-co-cnt input { width: 4.2rem; text-align: center; font-family: ui-monospace, monospace; font-weight: 800; } label.pt-co-cnt { grid-template-columns: minmax(0, 1fr) 7rem; } label.pt-co-cnt input { width: 100%; }
    .pt-co-cnt button { width: 2.8rem; height: 2.8rem; border-radius: .75rem; background: rgb(var(--z800)); color: rgb(var(--z50)); font-size: 1.3rem; font-weight: 800; }
    .pt-co-presets { display: flex; flex-wrap: wrap; gap: .4rem; } .pt-co-pre, .pt-co-pre { white-space: pre-wrap; }
    .pt-co-pre { font-family: ui-monospace, monospace; font-size: .76rem; line-height: 1.5; padding: .8rem; border-radius: .8rem; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); color: rgb(var(--z200)); max-height: 50vh; overflow: auto; }
    .pt-co-entry { display: flex; align-items: center; gap: .75rem; width: 100%; text-align: left; padding: .8rem .9rem; border-radius: 1rem; background: rgb(var(--z900)); border: 1px solid rgb(var(--a800)); } .pt-co-entry .ic { font-size: 1.5rem; } .pt-co-entry .tx { flex: 1; min-width: 0; display: grid; } .pt-co-entry b { font-size: .88rem; color: rgb(var(--z50)); } .pt-co-entry small { font-size: .7rem; color: rgb(var(--z400)); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } .pt-co-entry .ch { color: rgb(var(--z500)); font-size: 1.2rem; }
    #pt-co-entry { margin: .75rem 0; }
  `;
  document.head.appendChild(css);
})();
  