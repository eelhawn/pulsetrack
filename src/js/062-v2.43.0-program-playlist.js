
/* =====================================================================
 * PulseTrack 2.43.0: program playlist.
 *  - Programs screen → "Playlist": line up programs and deload weeks, each with a number of weeks, for example 8 weeks of Chris
 *    Bumstead's push/pull/legs, 1 deload week, then 8 weeks of Arnold's double split. Start it and the first program becomes
 *    your current program, starting at Day 1.
 *  - When a stage's weeks are up the next program becomes your current program by itself (checked whenever you open the app), and
 *    its progress starts from Day 1. A deload stage keeps your current program and tells you to run it with about half the sets.
 *  - Home shows a slim row (stage, week, what is next). Tap it for the whole line-up, with Skip to next stage, +1 week and Stop.
 *  - Progress → Training year shows the whole chain with dates above the calendar.
 *  - Stored in settings.playlist, so it is in backups. Nothing is changed in the programs themselves.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined" || !PT.kit) return;
  const proto = ApplicationUI.prototype, A = () => window.app, K = PT.kit, esc = K.esc, $ = id => document.getElementById(id);
  const DAY = 86400000, FREESTYLE = "freestyle";
  const PRESETS = [
    { name: "Mass cycle", sub: "12 weeks of Chris Bumstead's push / pull / legs, 1 week off, 12 weeks of Arnold's double split", items: [["p", "cbum_ppl_2019_6day", 12], ["r", null, 1], ["p", "arnold_double_split_6day", 12]] },
    { name: "Base then size", sub: "6 weeks of Reg Park's full-body 5x5, 1 deload week, 12 weeks of Frank Zane's upper / lower", items: [["p", "reg_park_beginner_5x5", 6], ["r", null, 1], ["p", "frank_zane_upper_lower_4day", 12]] }
  ];

  /* ---------------------------------------------------------------- data */
  const save = a => WorkoutStorage.saveSettings(a.settings);
  const get = a => (a && a.settings && a.settings.playlist && typeof a.settings.playlist === "object" && Array.isArray(a.settings.playlist.items) ? a.settings.playlist : null);
  const today = () => PT.ds();
  const addDays = (ds, n) => { const d = PT.fromDs(ds); d.setDate(d.getDate() + n); return PT.ds(d); };
  const between = (a, b) => Math.round((PT.fromDs(b) - PT.fromDs(a)) / DAY);
  const fmt = ds => PT.fmtDate(ds, { month: "short", day: "numeric" });
  const builtin = id => (typeof BUILTIN_PROGRAMS !== "undefined" ? BUILTIN_PROGRAMS : []).find(p => p.id === id) || null;
  const progOf = (a, id) => (a.data.programs || []).find(p => p.id === id) || builtin(id);
  const titleOf = (a, it) => it.k === "r" ? "Deload week" : ((progOf(a, it.id) || {}).title || "A program that is no longer here");
  const stageEnd = pl => addDays(pl.started, Math.max(1, pl.items[pl.idx].weeks | 0) * 7);
  const defaultWeeks = p => { const w = parseInt(p && p.weeks, 10); return w >= 1 && w <= 52 ? w : 8; };
  const totalWeeks = items => items.reduce((n, it) => n + (it.weeks | 0), 0);

  /** the program on this phone, added back from the built-in list when it was deleted */
  function ensureProgram(a, id) {
    let p = (a.data.programs || []).find(x => x.id === id);
    if (p) return p;
    const b = a.missingBuiltins ? a.missingBuiltins().find(x => x.id === id) : null; if (!b) return null;
    p = JSON.parse(JSON.stringify(b)); a.data.programs.push(p);
    if (!WorkoutStorage.setData(a.data)) { a.data.programs.pop(); return null; }
    return p;
  }
  function resetProgress(a, p) {
    const st = a.getProgState(p); st.week = 1; st.round = 1; st.done = [];
    (p.days || []).forEach(d => { try { a.clearDayLogs(p, d); } catch (e) { } });
    a.saveProgState(); WorkoutStorage.saveLogs(a.logs);
  }
  function openProgramDays(a, p) {
    a.activeProgram = p; a.activeDay = a.nextDayOf ? (a.nextDayOf(p) || p.days[0]) : p.days[0];
    if (a.activeDay) AppStateMemory.saveActive(p.id, a.activeDay.dayNumber);
    a.showView("days");
  }
  /** begin the stage at pl.idx: a program becomes the current one at Day 1, a deload keeps whatever you have */
  function begin(a, it, quiet) {
    if (it.k === "r") { if (!quiet) a.toast(`Deload week. Run your usual days with the same weights and about half the sets.`, undefined, undefined, 6000); return true; }
    const p = ensureProgram(a, it.id); if (!p) return false;
    resetProgress(a, p); a.selectProgram(p, null, true);
    if (!quiet) a.toast(`Playlist: now on ${p.title} (${it.weeks} week${it.weeks === 1 ? "" : "s"})`, "Open", () => openProgramDays(a, p), 6000);
    return true;
  }

  function start(a, items) {
    const clean = items.filter(it => it && (it.k === "r" || it.k === "p")).map(it => ({ k: it.k, id: it.k === "p" ? it.id : null, weeks: Math.max(1, Math.min(52, it.weeks | 0 || 1)) }));
    let i = clean.findIndex(it => it.k === "p"); if (i < 0) return false;
    a.settings.playlist = { items: clean, idx: 0, started: today(), on: true, log: [] };
    const pl = a.settings.playlist;
    while (pl.idx < pl.items.length && !begin(a, pl.items[pl.idx], pl.idx !== 0 ? false : false)) pl.idx++;
    if (pl.idx >= pl.items.length) { delete a.settings.playlist; return false; }
    save(a); return true;
  }
  function advance(a) {
    const pl = get(a); if (!pl || !pl.on) return false;
    pl.log = (pl.log || []).concat([{ i: pl.idx, from: pl.started, to: today() }]);
    pl.idx++;
    while (pl.idx < pl.items.length) { const it = pl.items[pl.idx]; if (it.k === "r" || ensureProgram(a, it.id)) break; pl.idx++; }
    if (pl.idx >= pl.items.length) { pl.on = false; pl.done = true; save(a); a.toast("Playlist finished. Nice work. Pick a new one any time.", undefined, undefined, 6000); return true; }
    pl.started = today(); begin(a, pl.items[pl.idx]); save(a); return true;
  }
  /** once a day, when the current stage's weeks are up, move on (one stage at a time, so a long break never skips a program) */
  function tick(a) {
    const pl = get(a); if (!pl || !pl.on || pl.idx >= pl.items.length) return false;
    if (today() >= stageEnd(pl)) return advance(a);
    return false;
  }
  PT.playlist = { get: () => get(A()), start: items => start(A(), items), tick: () => tick(A()), advance: () => advance(A()), stageEnd };

  /* ---------------------------------------------------------------- Home row */
  function stageLine(a, pl) {
    const it = pl.items[pl.idx], wk = Math.min(it.weeks, Math.floor(between(pl.started, today()) / 7) + 1), left = Math.max(0, between(today(), stageEnd(pl)));
    const next = pl.items[pl.idx + 1];
    return { it, wk, left, next, nextTxt: next ? `Next: ${titleOf(a, next)} on ${fmt(stageEnd(pl))}` : `Last stage, ends ${fmt(stageEnd(pl))}` };
  }
  function homeRow(a) {
    let box = $("pt-home-plist");
    const pl = get(a);
    if (!pl || (!pl.on && (!pl.done || pl.hide))) { if (box) box.remove(); return; }
    if (!box) {
      box = document.createElement("div"); box.id = "pt-home-plist";
      const anchor = $("home-work"); if (!anchor || !anchor.parentElement) return;
      anchor.insertAdjacentElement("beforebegin", box);
    }
    if (!pl.on) { box.innerHTML = `<button type="button" class="pt-pl-row" data-pl="open"><span class="pt-pl-i">🏁</span><span class="pt-pl-m"><b>Playlist finished</b><em>Tap to start a new one</em></span></button><button type="button" class="pt-pl-x" data-pl="hide" aria-label="Hide">×</button>`; return; }
    const s = stageLine(a, pl), it = s.it;
    box.innerHTML = `<button type="button" class="pt-pl-row" data-pl="open"><span class="pt-pl-i">🔁</span><span class="pt-pl-m">
      <b>Week ${s.wk} of ${it.weeks} · ${esc(titleOf(a, it))}</b>
      <em>${it.k === "r" ? "Same weights, about half the sets. " : ""}${esc(s.nextTxt)}</em></span><span class="pt-pl-c">›</span></button>`;
  }
  const oHome = proto.renderHomeView;
  proto.renderHomeView = function () {
    const r = oHome.apply(this, arguments);
    try { if (tick(this)) oHome.apply(this, arguments); homeRow(this); } catch (e) { console.error("PulseTrack playlist home", e); }
    return r;
  };
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") { try { const a = A(); if (a && tick(a)) { if (a.renderProgramsView) a.renderProgramsView(); if (a.renderHomeView) a.renderHomeView(); } } catch (e) { } } });
  setTimeout(() => { try { const a = A(); if (a && a.settings && tick(a) && a.renderHomeView) a.renderHomeView(); } catch (e) { } }, 1500);

  /* ---------------------------------------------------------------- the sheet */
  let el = null, view = "", draft = [], pickQ = "";

  function open() {
    el = K.sheet("pt-plist", 58);
    const pl = get(A()); draft = [];
    if (pl && pl.on) showActive(); else showEmpty();
  }
  function paint(html, onBind) { const c = K.openSheet(el, html); c.addEventListener("click", clicks); if (onBind) onBind(c); return c; }

  function showEmpty() {
    view = "empty";
    const a = A(), ok = PRESETS.filter(p => p.items.every(x => x[0] === "r" || builtin(x[1])));
    const pl = get(a);
    paint(`${K.head("Program playlist", "Run programs one after another")}
      <p class="pt-pl-p">Line up programs and deload weeks, each with its own number of weeks. When a stage's weeks are up, the next program becomes your current program by itself and starts at Day 1.</p>
      ${pl && pl.done ? `<p class="pt-pl-p pt-pl-ok">Your last playlist finished. Start a new one below.</p>` : ""}
      <button type="button" class="pt-morerow pt-pl-go" data-pl="new"><span>＋</span><span class="pt-pl-gt"><b>Build a playlist</b><em>Pick the programs and how many weeks each runs</em></span></button>
      ${ok.length ? `<div class="pt-pl-lab">Or start from one of these</div>${ok.map((p, i) => `<button type="button" class="pt-morerow pt-pl-go" data-pl="preset" data-i="${PRESETS.indexOf(p)}"><span>📋</span><span class="pt-pl-gt"><b>${esc(p.name)}</b><em>${esc(p.sub)}</em></span></button>`).join("")}` : ""}`);
  }

  function editHtml() {
    const a = A(), n = totalWeeks(draft);
    return `${K.head("Build a playlist", "Stage by stage, in order")}
      ${draft.length ? `<ol class="pt-pl-list">${draft.map((it, i) => `<li><span class="pt-pl-n">${i + 1}</span>
        <span class="pt-pl-w"><b>${esc(titleOf(a, it))}</b><em>${it.k === "r" ? "Keeps your current program" : "Starts at Day 1"}</em></span>
        <span class="pt-pl-ctl"><button type="button" data-pl="wm" data-i="${i}" aria-label="One week less">−</button><span>${it.weeks} wk</span><button type="button" data-pl="wp" data-i="${i}" aria-label="One week more">+</button></span>
        <span class="pt-pl-mv"><button type="button" data-pl="up" data-i="${i}" aria-label="Move up" ${i === 0 ? "disabled" : ""}>↑</button><button type="button" data-pl="dn" data-i="${i}" aria-label="Move down" ${i === draft.length - 1 ? "disabled" : ""}>↓</button><button type="button" data-pl="rm" data-i="${i}" aria-label="Remove">✕</button></span></li>`).join("")}</ol>
        <p class="pt-pl-p">${n} week${n === 1 ? "" : "s"} in all, about ${Math.max(1, Math.round(n / 4.345))} month${Math.round(n / 4.345) <= 1 ? "" : "s"}.</p>` : `<p class="pt-pl-p">Nothing here yet. Add a program to begin.</p>`}
      <div class="pt-pl-add"><button type="button" data-pl="addp">＋ Add a program</button><button type="button" data-pl="addr">＋ Deload week</button></div>
      <div class="pt-pl-foot"><button type="button" class="pt-st-b" data-pl="go" ${draft.some(x => x.k === "p") ? "" : "disabled"}>Start today</button><button type="button" class="pt-st-b ghost" data-pl="cancel">Cancel</button></div>
      <p class="pt-pl-p">Starting resets the first program to Day 1 and makes it your current program.</p>`;
  }
  function showEdit() { view = "edit"; paint(editHtml()); }

  function pickList() {
    const a = A(), toks = String(pickQ || "").toLowerCase().split(/\s+/).filter(Boolean), seen = new Set(), out = [];
    ((a.data.programs || []).concat(typeof BUILTIN_PROGRAMS !== "undefined" ? BUILTIN_PROGRAMS : [])).forEach(p => { if (!p || p.id === FREESTYLE || seen.has(p.id)) return; seen.add(p.id); out.push(p); });
    out.sort((x, y) => String(x.title).localeCompare(String(y.title), undefined, { sensitivity: "base", numeric: true }));
    return out.filter(p => { const blob = (p.title + " " + (p.pro || "") + " " + (p.tags || []).join(" ")).toLowerCase(); return toks.every(t => blob.includes(t)); });
  }
  function pickHtml() {
    const rows = pickList().slice(0, 40);
    return rows.length ? rows.map(p => `<button type="button" class="pt-st-row" data-pl="pick" data-id="${esc(p.id)}"><span class="pt-st-t">${esc(p.title)}</span><span class="pt-st-s">${esc(PT.programsScreen && PT.programsScreen.facts ? PT.programsScreen.facts(p) : "")}${p.weeks ? " · " + esc(String(p.weeks)) + " weeks" : ""}</span></button>`).join("")
      : `<p class="pt-st-hint">No program matches.</p>`;
  }
  function showPick() {
    view = "pick"; pickQ = "";
    const c = paint(`${K.head("Add a program", "It runs for the weeks you choose")}
      <div class="pt-st-find"><input id="pt-pl-q" type="search" enterkeyhint="search" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Search programs or athletes" aria-label="Search programs"></div>
      <div class="pt-st-rows" id="pt-pl-rows">${pickHtml()}</div><button type="button" class="pt-st-back" data-pl="edit">‹ Back</button>`);
    const q = c.querySelector("#pt-pl-q"); q.addEventListener("input", () => { pickQ = q.value; c.querySelector("#pt-pl-rows").innerHTML = pickHtml(); });
  }

  /** every stage with its state (done / now / next) and its dates, shared by the playlist sheet and the Progress calendar strip */
  function timeline(a, pl) {
    let cursor = pl.started;
    return pl.items.map((it, i) => {
      let state, dates;
      if (i < pl.idx || !pl.on) { const lg = (pl.log || []).find(l => l.i === i); state = "done"; dates = lg ? `${fmt(lg.from)} to ${fmt(lg.to)}` : "Done"; }
      else if (i === pl.idx) { state = "now"; const s = stageLine(a, pl); dates = `Week ${s.wk} of ${it.weeks} · ends ${fmt(stageEnd(pl))}`; cursor = stageEnd(pl); }
      else { state = "next"; const e = addDays(cursor, it.weeks * 7); dates = `${fmt(cursor)} to ${fmt(e)} · ${it.weeks} wk`; cursor = e; }
      return { i, it, state, dates, title: titleOf(a, it) };
    });
  }
  function showActive() {
    view = "active";
    const a = A(), pl = get(a); if (!pl) { showEmpty(); return; }
    const rows = timeline(a, pl).map(r => `<li class="pt-pl-s ${r.state}"><span class="pt-pl-n">${r.state === "done" ? "✓" : r.i + 1}</span><span class="pt-pl-w"><b>${esc(r.title)}</b><em>${esc(r.dates)}</em></span></li>`).join("");
    const it = pl.items[pl.idx], cur = (() => { try { return PT.currentProgramId && PT.currentProgramId(); } catch (e) { return null; } })();
    const mismatch = pl.on && it && it.k === "p" && cur !== it.id;
    paint(`${K.head("Program playlist", pl.on ? `Stage ${pl.idx + 1} of ${pl.items.length}` : "Finished")}
      <ol class="pt-pl-list pt-pl-tl">${rows}</ol>
      ${mismatch ? `<p class="pt-pl-p pt-pl-warn">Your current program is not ${esc(titleOf(a, it))}.</p><button type="button" class="pt-morerow pt-pl-go" data-pl="cur"><span>⭐</span><span class="pt-pl-gt"><b>Make it my current program</b><em>Keeps your progress in it</em></span></button>` : ""}
      ${pl.on ? `<div class="pt-pl-foot3"><button type="button" class="pt-st-b ghost" data-pl="skip">Skip to next stage</button><button type="button" class="pt-st-b ghost" data-pl="plus">＋1 week</button><button type="button" class="pt-st-b ghost danger" data-pl="stop">Stop playlist</button></div>` : `<button type="button" class="pt-st-b" data-pl="new">Start a new playlist</button>`}`);
  }

  async function clicks(e) {
    const b = e.target.closest("[data-pl]"); if (!b) return;
    const a = A(), act = b.dataset.pl, i = parseInt(b.dataset.i, 10);
    if (act === "new") { draft = []; showEdit(); return; }
    if (act === "preset") { const p = PRESETS[i]; draft = p.items.map(x => ({ k: x[0], id: x[1], weeks: x[2] })); showEdit(); return; }
    if (act === "wm") { draft[i].weeks = Math.max(1, draft[i].weeks - 1); showEdit(); return; }
    if (act === "wp") { draft[i].weeks = Math.min(52, draft[i].weeks + 1); showEdit(); return; }
    if (act === "up" && i > 0) { [draft[i - 1], draft[i]] = [draft[i], draft[i - 1]]; showEdit(); return; }
    if (act === "dn" && i < draft.length - 1) { [draft[i + 1], draft[i]] = [draft[i], draft[i + 1]]; showEdit(); return; }
    if (act === "rm") { draft.splice(i, 1); showEdit(); return; }
    if (act === "addr") { draft.push({ k: "r", id: null, weeks: 1 }); showEdit(); return; }
    if (act === "addp") { showPick(); return; }
    if (act === "edit") { showEdit(); return; }
    if (act === "pick") { const p = progOf(a, b.dataset.id); if (p) draft.push({ k: "p", id: p.id, weeks: defaultWeeks(p) }); showEdit(); return; }
    if (act === "cancel") { K.closeSheet(el); return; }
    if (act === "go") {
      if (!start(a, draft)) { a.toast("Add at least one program first."); return; }
      K.closeSheet(el); homeRow(a);
      try { if (a.renderProgramsView) a.renderProgramsView(); } catch (x) { }
      return;
    }
    if (act === "cur") { const pl = get(a), p = pl && ensureProgram(a, pl.items[pl.idx].id); if (p) { a.selectProgram(p, null, true); a.toast(`"${p.title}" is now your current program`); showActive(); } return; }
    if (act === "skip") { if (await PT.confirm("Move on to the next stage now?")) { advance(a); homeRow(a); try { a.renderProgramsView && a.renderProgramsView(); } catch (x) { } if (get(a) && get(a).on) showActive(); else showEmpty(); } return; }
    if (act === "plus") { const pl = get(a); if (pl && pl.on) { pl.items[pl.idx].weeks++; save(a); homeRow(a); showActive(); } return; }
    if (act === "stop") { if (await PT.confirm("Stop the playlist? Your current program stays as it is.")) { delete a.settings.playlist; save(a); homeRow(a); K.closeSheet(el); a.toast("Playlist stopped"); } return; }
  }
  document.addEventListener("click", e => {
    const t = e.target && e.target.closest ? e.target : null; if (!t) return;
    if (t.closest("#pt-prog-plist") || t.closest("#pt-home-plist [data-pl=open]")) { open(); return; }
    const h = t.closest("#pt-home-plist [data-pl=hide]"); if (h) { const a = A(), pl = get(a); if (pl) { pl.hide = true; save(a); homeRow(a); } }
  });

  /* ---------------------------------------------------------------- Progress → Training year: the whole chain, with dates */
  function addStrip(a) {
    const pl = get(a), host = $("pt-pg-heat"); if (!host) return;
    const old = host.querySelector("#pt-pl-strip"); if (old) old.remove();
    if (!pl || !pl.on) return;
    const rows = timeline(a, pl).map(r => `<li class="${r.state}"><span class="pt-pl-sd">${r.state === "done" ? "✓" : r.state === "now" ? "●" : "○"}</span><span><b>${esc(r.title)}</b><em>${esc(r.dates)}</em></span></li>`).join("");
    const box = document.createElement("div"); box.id = "pt-pl-strip";
    box.innerHTML = `<div class="pt-pl-sh">🔁 Program playlist</div><ol>${rows}</ol>`;
    const body = host.querySelector("summary") ? host.querySelector("summary").nextElementSibling : null;
    if (body) body.insertAdjacentElement("afterbegin", box); else host.appendChild(box);
  }
  const oPV = proto.renderProgressView;
  proto.renderProgressView = function () {
    const r = oPV.apply(this, arguments);
    try { addStrip(this); } catch (e) { console.error("PulseTrack playlist strip", e); }
    return r;
  };

  /* ---------------------------------------------------------------- the Programs tile */
  function ensureTool() {
    const box = $("pt-prog-tools"); if (!box || $("pt-prog-plist")) return;
    const b = document.createElement("button"); b.type = "button"; b.id = "pt-prog-plist"; b.title = "Chain programs one after another"; b.setAttribute("aria-label", "Program playlist"); b.dataset.pgx = "Playlist";
    b.innerHTML = '<span class="pgx-ti">🔁</span><span class="pgx-tl">Playlist</span>';
    box.appendChild(b);
  }
  const oRP = proto.renderProgramsView;
  proto.renderProgramsView = function () {
    const r = oRP.apply(this, arguments);
    try { ensureTool(); if (PT.programsScreen && PT.programsScreen.tools) PT.programsScreen.tools(); } catch (e) { console.error("PulseTrack playlist tool", e); }
    return r;
  };

  /* ---------------------------------------------------------------- styles */
  const css = document.createElement("style");
  css.id = "pt-v243-plist-css";
  css.textContent = `
    #pt-home-plist { position: relative; }
    .pt-pl-row { display: flex; align-items: center; gap: .7rem; width: 100%; text-align: left; padding: .6rem .8rem; border-radius: 1rem; background: rgb(var(--z900)); border: 1px solid rgb(var(--z800)); }
    .pt-pl-i { flex: none; width: 2rem; height: 2rem; border-radius: .7rem; display: grid; place-items: center; background: rgb(var(--z800)); font-size: 1rem; }
    .pt-pl-m { display: grid; gap: .1rem; min-width: 0; flex: 1; }
    .pt-pl-m b { font-size: .78rem; font-weight: 800; color: rgb(var(--z100)); line-height: 1.25; }
    .pt-pl-m em { font-style: normal; font-size: .68rem; color: rgb(var(--z400)); line-height: 1.3; }
    .pt-pl-c { flex: none; color: rgb(var(--z500)); font-size: 1.2rem; }
    .pt-pl-x { position: absolute; top: .35rem; right: .5rem; width: 1.8rem; height: 1.8rem; font-size: 1.1rem; color: rgb(var(--z500)); }
    .pt-pl-p { font-size: .78rem; line-height: 1.45; color: rgb(var(--z400)); }
    .pt-pl-ok { color: rgb(var(--a400)); font-weight: 700; }
    .pt-pl-warn { color: rgb(253 230 138); }
    .pt-pl-lab { font-size: .68rem; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: rgb(var(--z500)); }
    .pt-pl-go { align-items: flex-start !important; text-align: left; }
    .pt-pl-gt { display: grid; gap: .1rem; } .pt-pl-gt b { font-size: .85rem; font-weight: 800; } .pt-pl-gt em { font-style: normal; font-size: .7rem; font-weight: 500; color: rgb(var(--z400)); }
    .pt-pl-list { display: grid; gap: .45rem; list-style: none; padding: 0; margin: 0; }
    .pt-pl-list > li { display: grid; grid-template-columns: 1.7rem 1fr auto; align-items: center; gap: .3rem .6rem; padding: .6rem .7rem; border-radius: .85rem; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); }
    .pt-pl-n { width: 1.7rem; height: 1.7rem; border-radius: 999px; display: grid; place-items: center; font-size: .72rem; font-weight: 800; background: rgb(var(--z800)); color: rgb(var(--z200)); }
    .pt-pl-w { display: grid; gap: .1rem; min-width: 0; } .pt-pl-w b { font-size: .8rem; font-weight: 800; color: rgb(var(--z50)); } .pt-pl-w em { font-style: normal; font-size: .68rem; color: rgb(var(--z400)); }
    .pt-pl-ctl { display: flex; align-items: center; gap: .3rem; font-size: .72rem; font-weight: 700; color: rgb(var(--z200)); white-space: nowrap; }
    .pt-pl-ctl button, .pt-pl-mv button { width: 1.8rem; height: 1.8rem; border-radius: .55rem; background: rgb(var(--z800)); color: rgb(var(--z100)); font-weight: 800; }
    .pt-pl-mv { grid-column: 2 / -1; display: flex; gap: .3rem; justify-content: flex-end; }
    .pt-pl-mv button:disabled { opacity: .3; }
    .pt-pl-add { display: flex; gap: .5rem; } .pt-pl-add button { flex: 1; padding: .65rem .5rem; border-radius: .8rem; font-size: .78rem; font-weight: 700; background: rgb(var(--z800)); color: rgb(var(--z100)); }
    .pt-pl-foot, .pt-pl-foot3 { display: flex; gap: .5rem; flex-wrap: wrap; } .pt-pl-foot3 button { flex: 1 1 30%; font-size: .72rem; }
    .pt-st-b:disabled { opacity: .4; } .pt-st-b.danger { color: rgb(251 113 133); }
    .pt-pl-tl > li.done { opacity: .6; } .pt-pl-tl > li.now { border-color: rgb(var(--a600) / .7); } .pt-pl-tl > li.now .pt-pl-n { background: rgb(var(--a600)); color: #fff; }
    .pt-pl-tl > li { grid-template-columns: 1.7rem 1fr; }
    #pt-pl-strip { margin-bottom: .75rem; padding: .7rem .8rem; border-radius: .9rem; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); }
    .pt-pl-sh { font-size: .68rem; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: rgb(var(--z400)); margin-bottom: .45rem; }
    #pt-pl-strip ol { list-style: none; margin: 0; padding: 0; display: grid; gap: .4rem; }
    #pt-pl-strip li { display: flex; gap: .55rem; align-items: baseline; font-size: .74rem; color: rgb(var(--z300)); }
    #pt-pl-strip li b { display: block; font-weight: 700; color: rgb(var(--z100)); } #pt-pl-strip li em { display: block; font-style: normal; font-size: .66rem; color: rgb(var(--z500)); }
    #pt-pl-strip li.done { opacity: .6; } #pt-pl-strip li.now .pt-pl-sd { color: rgb(var(--a400)); }
    .pt-pl-sd { flex: none; width: 1rem; text-align: center; }
    html[data-mode="light"] .pt-pl-warn { color: rgb(146 64 14); }
  `;
  document.head.appendChild(css);
})();
  