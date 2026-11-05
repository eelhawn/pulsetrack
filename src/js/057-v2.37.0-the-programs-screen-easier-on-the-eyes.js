
/* =====================================================================
 * PulseTrack 2.37.0: the Programs screen, easier on the eyes.
 *  - Your current program sits on top in one card (week, next workout, Open).
 *  - The tools (Build, Create, Paste, Import, Share link, Mobility, Stretch) are a compact grid instead of a tall stack.
 *  - Search (title, athlete, tags, day names, even exercise names) and filter chips: Pro plans, Mass, Cutting, Strength,
 *    Beginner, Mine.
 *  - One slim row per program: athlete badge, title, one line of facts (goal, days a week, weeks, level). Programs are
 *    grouped as Your programs, Pro programs and More programs.
 *  - Share, Make current and Delete moved behind one "..." button per row, so the list is not a wall of buttons.
 * 2.40.0: Two-a-day programs (AM + PM sessions) get a "Two-a-day" chip, a sunrise-to-night shelf of cards right under the
 *  current program, and a small AM+PM tag on their rows. Any program whose days are titled like "Mon AM: Chest" and
 *  "Mon PM: Arms" (or "Chest (AM) + Arms (PM)") counts, including your own.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  const proto = ApplicationUI.prototype;
  const A = () => window.app;
  const $ = id => document.getElementById(id);
  const esc = s => PT.esc(s);

  const GOALS = { mass: "Mass", cutting: "Cutting", strength: "Strength", balanced: "All-round" };
  const LEVELS = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" };
  const FILTERS = [["all", "All"], ["pro", "Pro plans"], ["two", "Two-a-day"], ["mass", "Mass"], ["cutting", "Cutting"], ["strength", "Strength"], ["beginner", "Beginner"], ["mine", "Mine"]];
  const ST = { q: "", f: "all" };
  const APP_DEFAULTS = { kaged_massive_arms_6wk: { pro: "", goal: "mass", level: "intermediate", perWeek: 6 } };   // ships inside the app, not in programs.js

  /* ================================================================ facts about each program */
  const builtinMap = () => {
    const m = new Map();
    try { if (typeof BUILTIN_PROGRAMS !== "undefined" && Array.isArray(BUILTIN_PROGRAMS)) BUILTIN_PROGRAMS.forEach(b => b && b.id && m.set(b.id, b)); } catch (e) { }
    return m;
  };
  let BM = null;
  const workoutDays = p => (p.days || []).filter(d => (d.exercises || []).length).length;
  const weeksOf = p => { const a = A(); try { return (PT.weeks && PT.weeks.weeksOf ? PT.weeks.weeksOf(a, p) : a.progWeeks(p)) || 0; } catch (e) { return 0; } };

  function guess(p) {
    const t = ((p.title || "") + " " + (p.tags || []).join(" ") + " " + (p.description || "")).toLowerCase();
    let goal = "mass";
    if (/\b(cut|cuts|cutting|shred|shredded|fat loss|lean|diet)\b/.test(t)) goal = "cutting";
    else if (/\b(strength|5x5|powerlifting|power)\b/.test(t)) goal = "strength";
    const level = /\bbeginner\b/.test(t) ? "beginner" : /\badvanced\b/.test(t) ? "advanced" : "";
    const n = workoutDays(p);
    return { goal, level, perWeek: (p.days || []).length <= 7 && n ? n : null };
  }
  /** pro, goal, level, perWeek, mine for one program */
  function metaOf(p) {
    if (!BM) BM = builtinMap();
    const b = BM.get(p.id) || APP_DEFAULTS[p.id];
    if (b) return { pro: b.pro || "", goal: b.goal || "mass", level: b.level || "", perWeek: b.perWeek || null, mine: false };
    const g = guess(p);
    return { pro: "", goal: g.goal, level: g.level, perWeek: g.perWeek, mine: true };
  }

  /* ================================================================ two-a-day */
  const SES1 = /^\s*(?:Day\s+\d+\s*[:\-–]\s*)?([A-Za-z]{3,9})\s+(AM|PM)\s*[:\-–]\s*(.+?)\s*$/;
  const SES2 = /^\s*(?:Day\s+\d+\s*[:\-–]\s*)?(.+?)\s*\(AM\)\s*\+\s*(.+?)\s*\(PM\)\s*$/;
  const stripWeek = t => String(t == null ? "" : t).replace(/^\s*\[W[\d\s\-–&,]+\]\s*/i, "").replace(/^\s*(?:Week|Wk)\s+\d+\s*[·:\-–]\s*/i, "");   // "[W5-8] Mon AM: Chest" (a progressed copy in a longer program) is still Mon AM
  /** "Mon AM: Chest" -> { day, time: "AM", topic }; "Chest (AM) + Arms (PM)" -> { time: "both", am, pm }; anything else -> null */
  function sessionOf(title) {
    const t = stripWeek(title); let m;
    if ((m = SES1.exec(t))) return { day: m[1], time: m[2], topic: m[3] };
    if ((m = SES2.exec(t))) return { day: "", time: "both", am: m[1], pm: m[2] };
    return null;
  }
  const twoCache = new Map();
  /** null when the program has no morning/evening sessions; otherwise { sessions, training, pairs, first, partial, weeks } */
  function twoInfo(p) {
    const days = p.days || [];
    const sig = p.id + "|" + days.length + "|" + (days[0] ? days[0].title : "") + "|" + (days.length ? days[days.length - 1].title : "") + "|" + (p.tags || []).join(",");
    const c = twoCache.get(p.id); if (c && c.sig === sig) return c.v;
    let sessions = 0, training = 0, pairs = 0, first = null, wMin = 0, wMax = 0, lastAM = null;
    days.forEach(d => {
      if (!(d.exercises || []).length) { lastAM = null; return; }
      training++;
      const s = sessionOf(d.title); if (!s) { lastAM = null; return; }
      sessions++;
      const w = parseInt(d.week, 10) || 0; if (w) { wMin = wMin ? Math.min(wMin, w) : w; wMax = Math.max(wMax, w); }
      if (s.time === "both") { pairs++; if (!first) first = { day: "", am: s.am, pm: s.pm }; lastAM = null; }
      else if (s.time === "AM") lastAM = s;
      else {
        if (lastAM && lastAM.day.toLowerCase() === s.day.toLowerCase()) { pairs++; if (!first) first = { day: s.day, am: lastAM.topic, pm: s.topic }; }
        lastAM = null;
      }
    });
    const tagged = (p.tags || []).some(t => /two.?a.?days?|twice.a.day/i.test(t));
    const v = (pairs || tagged) ? { sessions, training, pairs, first, partial: training > 0 && sessions / training < 0.5, weeks: wMin ? [wMin, wMax] : null } : null;
    twoCache.set(p.id, { sig, v });
    return v;
  }

  /* ================================================================ search text, built once per program */
  const blobs = new Map();
  function blobOf(p, m) {
    const sig = (p.days || []).length + "|" + (p.days || []).reduce((n, d) => n + (d.exercises || []).length, 0) + "|" + p.title;
    const c = blobs.get(p.id);
    if (c && c.sig === sig) return c.text;
    const parts = [p.title, m.pro, (p.tags || []).join(" "), GOALS[m.goal] || "", LEVELS[m.level] || "", m.mine ? "mine custom" : "", p.description];
    if (twoInfo(p)) parts.push("two-a-day twice a day two a day double split am pm morning evening");
    (p.days || []).forEach(d => { parts.push(d.title); (d.exercises || []).forEach(e => parts.push(e.name)); });
    const text = parts.join(" \n ").toLowerCase();
    blobs.set(p.id, { sig, text });
    return text;
  }
  const tokensOf = q => String(q || "").toLowerCase().split(/\s+/).map(t => t.replace(/[^\p{L}\p{N}+'\-]/gu, "")).filter(Boolean);
  function hl(text, toks) {
    const s = String(text == null ? "" : text);
    if (!toks.length) return esc(s);
    const re = new RegExp("(" + toks.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") + ")", "ig");
    return s.split(re).map((part, i) => i % 2 ? `<mark class="pt-mk">${esc(part)}</mark>` : esc(part)).join("");
  }

  function passes(p, m, f) {
    if (f === "all") return true;
    if (f === "pro") return !!m.pro;
    if (f === "mine") return m.mine;
    if (f === "two") return !!twoInfo(p);
    if (f === "beginner") return m.level === "beginner";
    return m.goal === f;
  }

  /* ================================================================ look of a row */
  const HUES = [155, 200, 265, 335, 28, 46, 182, 232, 12, 100];
  const hueOf = s => { let h = 0; s = String(s || ""); for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return HUES[h % HUES.length]; };
  function badge(p, m) {
    if (m.pro === "Pro Collection") return { t: "★", h: 46 };
    if (m.pro) { const w = m.pro.split(/\s+/).filter(Boolean); return { t: (w[0][0] + (w.length > 1 ? w[w.length - 1][0] : "")).toUpperCase(), h: hueOf(m.pro) }; }
    if (m.mine) return { t: "✎", h: 200 };
    return { t: "◎", h: 215 };
  }
  function titleHasPro(p, m) {
    if (!m.pro || m.pro === "Pro Collection") return true;
    const t = (p.title || "").toLowerCase(), w = m.pro.toLowerCase().split(/\s+/);
    return w.some(x => x.length > 2 && t.includes(x));
  }
  function facts(p, m, noLevel) {
    const bits = [];
    if (!titleHasPro(p, m)) bits.push(m.pro);
    if (m.pro === "Pro Collection") bits.push("Signature workouts");
    else bits.push(GOALS[m.goal] || "");
    const W = weeksOf(p), n = workoutDays(p);
    if (m.perWeek) bits.push(m.perWeek + (m.perWeek === 1 ? " day/wk" : " days/wk"));
    else bits.push(n + (n === 1 ? " workout" : " workouts"));
    if (W > 1) bits.push(W + " weeks");
    if (m.level && !noLevel) bits.push(LEVELS[m.level]);
    return bits.filter(Boolean).slice(0, 4).join(" · ");
  }

  /* ================================================================ screen pieces */
  const SUN = '<svg class="pgx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4" fill="currentColor"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6"/></svg>';
  const MOON = '<svg class="pgx-ico" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.5 14.6A8.5 8.5 0 019.4 3.5a.6.6 0 00-.8-.7A9.5 9.5 0 1021.2 15.4a.6.6 0 00-.7-.8z"/></svg>';
  const SEARCH_SVG = '<svg class="pt-sico" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 110-15 7.5 7.5 0 010 15z"/></svg>';
  const TOOLS = [
    ["pt-prog-build", "🛠", "Build me a program", ""],
    ["btn-create-program", "＋", "Create your own", ""],
    ["pt-prog-paste", "📋", "Paste a program", ""],
    ["btn-import-program", "⤓", "Import a file", ""],
    ["btn-paste-share", "🔗", "Share link", "Paste a Share Link (workout day or program)"],
    ["pt-prog-mob", "⏱", "Guided mobility", "Guided mobility (hands-free)"],
    ["pt-prog-stretch", "🧘", "Stretch routine", "Stretch & mobility routine"],
    ["pt-prog-steal", "🧩", "Steal a day", "Take one day from any program"],      // 2.43.0 (made by m67a.js)
    ["pt-prog-plist", "🔁", "Playlist", "Chain programs one after another"],      // 2.43.0 (made by m68a.js)
  ];

  function scaffold() {
    const view = $("view-programs"); if (!view) return false;
    if ($("pgx-find")) return true;
    const lab = $("program-count-label"), list = $("programs-list-container"), tools = $("pt-prog-tools");
    if (!lab || !list || !tools) return false;
    if (lab.parentElement && lab.parentElement !== view) lab.parentElement.classList.add("pgx-oldhead");
    const hero = document.createElement("div"); hero.id = "pgx-hero"; hero.setAttribute("role", "button"); hero.tabIndex = 0;
    tools.insertAdjacentElement("beforebegin", hero);
    const two = document.createElement("div"); two.id = "pgx-two"; two.hidden = true;
    hero.insertAdjacentElement("afterend", two);
    two.addEventListener("click", e => {
      const all = e.target.closest("[data-f]"); if (all) { ST.f = all.dataset.f; ST.q = ""; const qq = $("pgx-q"); if (qq) qq.value = ""; drawList(); return; }
      const c = e.target.closest(".pgx-tc"); if (c) openProgram(c.dataset.pid);
    });
    const find = document.createElement("div"); find.id = "pgx-find";
    find.innerHTML = `<div class="relative">${SEARCH_SVG}<input id="pgx-q" type="search" enterkeyhint="search" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Search programs" class="pt-sin" aria-label="Search programs"><button type="button" id="pgx-clear" class="pgx-clear hidden" aria-label="Clear search">✕</button></div>
      <div class="pgx-row"><div id="pgx-chips" class="pgx-chips" role="group" aria-label="Filter programs"></div></div>
      <div class="pgx-count"></div>`;
    list.insertAdjacentElement("beforebegin", find);
    find.querySelector(".pgx-count").appendChild(lab);
    list.classList.add("pgx-list");
    const q = $("pgx-q");
    q.addEventListener("input", () => { ST.q = q.value; drawList(); });
    q.addEventListener("keydown", e => { if (e.key === "Enter") q.blur(); });
    $("pgx-clear").addEventListener("click", () => { ST.q = ""; q.value = ""; drawList(); q.focus(); });
    $("pgx-chips").addEventListener("click", e => { const b = e.target.closest("[data-f]"); if (!b) return; ST.f = b.dataset.f; drawList(); });
    hero.addEventListener("click", () => { const id = hero.dataset.pid; if (id) openProgram(id); });
    hero.addEventListener("keydown", e => { if ((e.key === "Enter" || e.key === " ") && hero.dataset.pid) { e.preventDefault(); openProgram(hero.dataset.pid); } });
    list.addEventListener("click", e => {
      const more = e.target.closest(".pgx-more"), row = e.target.closest(".pgx-pr");
      if (more && row) { e.stopPropagation(); openOptions(row.dataset.pid); return; }
      if (row) openProgram(row.dataset.pid);
      const clr = e.target.closest("#pgx-empty-clear"); if (clr) { ST.q = ""; ST.f = "all"; q.value = ""; drawList(); }
    });
    list.addEventListener("keydown", e => { const row = e.target.closest && e.target.closest(".pgx-pr"); if (row && e.target === row && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openProgram(row.dataset.pid); } });
    return true;
  }

  function decorateTools() {
    const box = $("pt-prog-tools"); if (!box) return;
    TOOLS.forEach(t => {
      const el = $(t[0]); if (!el) return;
      if (el.parentElement !== box) box.appendChild(el);
      if (el.dataset.pgx !== t[2]) {
        el.dataset.pgx = t[2];
        el.innerHTML = `<span class="pgx-ti">${t[1]}</span><span class="pgx-tl">${t[2]}</span>`;
        if (t[3]) { el.title = t[3]; el.setAttribute("aria-label", t[3]); }
      }
      el.classList.remove("w-full"); el.style.gridColumn = "";
    });
    TOOLS.forEach(t => { const el = $(t[0]); if (el) box.appendChild(el); });          // settle the order
  }

  function drawHero(a) {
    const hero = $("pgx-hero"); if (!hero) return;
    let cur = null;
    try { const id = PT.currentProgramId && PT.currentProgramId(); cur = id ? (a.data.programs || []).find(p => p.id === id) : null; } catch (e) { }
    if (!cur) {
      hero.dataset.pid = ""; hero.className = "pgx-none"; hero.removeAttribute("aria-label");
      hero.innerHTML = `<div class="pgx-hm"><span class="pgx-lab">No current program</span><span class="pgx-hs">Open any program below and tap Select, or build one to start.</span></div>`;
      return;
    }
    let sub = "";
    try {
      const day = a.nextDayOf(cur);
      const wk = (a.weekBadge ? String(a.weekBadge(cur, day) || "") : "").replace(/\s*·?\s*Day\s+\d+\s*$/i, "").trim();
      const dt = a.shortDayTitle && day ? a.shortDayTitle(cur, day) : (day && day.title) || "";
      sub = [wk, dt].filter(Boolean).join(" · ");
    } catch (e) { }
    hero.dataset.pid = cur.id; hero.className = "pgx-has"; hero.setAttribute("aria-label", "Open your current program, " + cur.title);
    hero.innerHTML = `<div class="pgx-hm"><span class="pgx-lab">Current program</span><span class="pgx-ht">${esc(cur.title)}</span>${sub ? `<span class="pgx-hs">Next: ${esc(sub)}</span>` : ""}</div><span class="pgx-go">Open</span>`;
  }

  function drawChips(counts) {
    const el = $("pgx-chips"); if (!el) return;
    el.innerHTML = FILTERS.map(f => `<button type="button" class="pgx-chip" data-f="${f[0]}" aria-pressed="${ST.f === f[0]}">${f[1]}${f[0] !== "all" && counts[f[0]] != null ? ` <i>${counts[f[0]]}</i>` : ""}</button>`).join("");
  }

  /** small "sun + moon" tag at the start of a row's facts line */
  function apTag(p) {
    const t = twoInfo(p); if (!t) return "";
    const txt = t.partial && t.weeks ? `wk ${t.weeks[0]}–${t.weeks[1]}` : "AM+PM";
    return `<b class="pgx-ap${t.partial ? " part" : ""}" title="${t.partial ? "Some weeks train twice a day" : "Trains twice a day"}">${SUN}${t.partial ? "" : MOON}${txt}</b>`;
  }

  /** the "Two-a-day" shelf: sunrise-to-night cards under the current program, only on the plain all-programs view */
  function drawShelf(rows, show) {
    const el = $("pgx-two"); if (!el) return;
    const list = rows.filter(r => twoInfo(r.p)).sort((x, y) => (twoInfo(x.p).partial - twoInfo(y.p).partial) || String(x.m.pro).localeCompare(String(y.m.pro)) || String(x.p.title).localeCompare(String(y.p.title)));
    if (!show || !list.length) { el.hidden = true; el.innerHTML = ""; return; }
    const curId = (PT.currentProgramId && PT.currentProgramId()) || null;
    el.innerHTML = `<div class="pgx-sh"><span class="pgx-sh-t">Two-a-day training</span><span class="pgx-sh-s">Morning and evening sessions, the way the pros split it</span><button type="button" class="pgx-sh-all" data-f="two">See all <i>${list.length}</i></button></div>
      <div class="pgx-rail" role="list">${list.map(r => {
        const p = r.p, m = r.m, t = twoInfo(p), b = badge(p, m), f = t.first;
        const am = f ? f.am : "Morning session", pm = f ? f.pm : "Evening session";
        const tail = t.partial && t.weeks ? `Two-a-day in weeks ${t.weeks[0]}–${t.weeks[1]}` : [m.perWeek ? m.perWeek + (m.perWeek === 1 ? " day/wk" : " days/wk") : "", LEVELS[m.level] || ""].filter(Boolean).join(" · ");
        const cur = p.id === curId;
        return `<button type="button" class="pgx-tc" role="listitem" data-pid="${esc(p.id)}" aria-label="${esc(p.title)}, two-a-day. Morning: ${esc(am)}. Evening: ${esc(pm)}${cur ? ". Current program" : ""}">
          <span class="pgx-sky" aria-hidden="true"><span class="pgx-sun"></span><span class="pgx-moon">${MOON}</span>${cur ? '<span class="pgx-cur-pill">✓ Current</span>' : ""}</span>
          <span class="pgx-tb">
            <span class="pgx-trow"><span class="pgx-av" style="--h:${b.h}" aria-hidden="true">${esc(b.t)}</span><span class="pgx-tm"><span class="pgx-tc-t">${esc(p.title)}</span>${m.pro && m.pro !== "Pro Collection" ? `<span class="pgx-tc-a">${esc(m.pro)}</span>` : ""}</span></span>
            <span class="pgx-ses"><i class="am">${SUN}AM</i> <span>${esc(am)}</span></span>
            <span class="pgx-ses"><i class="pm">${MOON}PM</i> <span>${esc(pm)}</span></span>
            <span class="pgx-tf">${esc(tail)}</span>
          </span></button>`;
      }).join("")}</div>`;
    el.hidden = false;
  }

  function drawList() {
    const a = A(), list = $("programs-list-container"); if (!a || !list || !$("pgx-find")) return;
    const all = (a.data.programs || []).filter(Boolean);
    const toks = tokensOf(ST.q);
    const rows = all.map(p => ({ p, m: metaOf(p) }));
    const counts = {}; FILTERS.forEach(f => { if (f[0] !== "all") counts[f[0]] = rows.filter(r => passes(r.p, r.m, f[0])).length; });
    drawChips(counts);
    const shown = rows.filter(r => passes(r.p, r.m, ST.f) && toks.every(t => blobOf(r.p, r.m).includes(t)));
    drawShelf(rows, !toks.length && ST.f === "all");
    const lab = $("program-count-label");
    if (lab) lab.textContent = shown.length === all.length ? `${all.length} programs` : `${shown.length} of ${all.length} programs`;
    const q = $("pgx-q"); if (q && q.value !== ST.q) q.value = ST.q;
    const clr = $("pgx-clear"); if (clr) clr.classList.toggle("hidden", !ST.q);
    const curId = (PT.currentProgramId && PT.currentProgramId()) || null;
    const byTitle = (x, y) => String(x.p.title || "").localeCompare(String(y.p.title || ""), undefined, { sensitivity: "base", numeric: true });
    const proKey = r => r.m.pro === "Pro Collection" ? "￿" : r.m.pro.toLowerCase();
    const groups = [
      ["Your programs", shown.filter(r => r.m.mine).sort(byTitle)],
      ["Pro programs", shown.filter(r => !r.m.mine && r.m.pro).sort((x, y) => proKey(x).localeCompare(proKey(y)) || byTitle(x, y))],
      ["More programs", shown.filter(r => !r.m.mine && !r.m.pro).sort(byTitle)],
    ].filter(g => g[1].length);
    if (!shown.length) {
      list.innerHTML = `<div class="pgx-empty"><p>${toks.length ? `No programs match “${esc(ST.q.trim())}”` : "No programs in this filter yet"}</p><button type="button" id="pgx-empty-clear">Show all programs</button></div>`;
      return;
    }
    list.innerHTML = groups.map(g => `<p class="pgx-h">${g[0]}<span>${g[1].length}</span></p>` + g[1].map(r => {
      const p = r.p, m = r.m, b = badge(p, m), cur = p.id === curId;
      return `<div class="pgx-pr${cur ? " pgx-cur" : ""}" data-pid="${esc(p.id)}" role="button" tabindex="0" aria-label="${esc(p.title)}${cur ? ", current program" : ""}">
        <span class="pgx-av" style="--h:${b.h}" aria-hidden="true">${esc(b.t)}</span>
        <span class="pgx-main"><span class="pgx-t">${hl(p.title, toks)}</span><span class="pgx-s">${apTag(p)}${hl(facts(p, m, !!twoInfo(p)), toks)}</span></span>
        ${cur ? '<span class="pgx-pill">✓ Current</span>' : ""}
        <button type="button" class="pgx-more" aria-label="Options for ${esc(p.title)}">⋯</button>
      </div>`;
    }).join("")).join("");
  }

  /* ================================================================ actions */
  function openProgram(id) {
    const a = A(), p = (a.data.programs || []).find(x => x.id === id); if (!p) return;
    a.activeProgram = p;
    a.activeDay = a.nextDayOf(p) || (p.days ? p.days[0] : null);
    AppStateMemory.saveActive(p.id, a.activeDay ? a.activeDay.dayNumber : null);
    a.showView("days");
  }
  function openOptions(id) {
    const a = A(), p = (a.data.programs || []).find(x => x.id === id); if (!p) return;
    const m = metaOf(p), cur = !!(PT.isCurrentProgram && PT.isCurrentProgram(p.id));
    const el = a.openSheet(p.title, facts(p, m), `<div class="space-y-2">
      <button type="button" class="pt-morerow" data-act="open"><span>▶</span><span>Open program</span></button>
      <button type="button" class="pt-morerow" data-act="steal"><span>🧩</span><span>Steal a day from it</span></button>
      ${cur ? `<div class="pt-morerow" style="opacity:.75"><span>✓</span><span>This is your current program</span></div>` : `<button type="button" class="pt-morerow" data-act="select"><span>⭐</span><span>Make it my current program</span></button>`}
      <button type="button" class="pt-morerow" data-act="calendar"><span>📅</span><span>Add to my calendar</span></button>
      <button type="button" class="pt-morerow" data-act="share"><span>📤</span><span>Share</span></button>
      <button type="button" class="pt-morerow danger" data-act="delete"><span>🗑</span><span>Delete from this phone</span></button></div>`, "");
    // the sheet body is one element that every sheet reuses, so the handlers go on these fresh buttons, not on the body
    el.querySelectorAll("[data-act]").forEach(b => b.addEventListener("click", () => {
      const act = b.dataset.act; a.closeSheet();
      setTimeout(() => {
        if (act === "open") openProgram(id);
        else if (act === "steal") { if (PT.steal) PT.steal.open({ program: p }); }
        else if (act === "select") a.selectProgram(p);
        else if (act === "calendar") { if (PT.calendar) PT.calendar.open(p); }
        else if (act === "share") a.shareProgram(p);
        else if (act === "delete") askDelete(a, p);
      }, 120);
    }));
  }
  const builtinMapHas = id => { if (!BM) BM = builtinMap(); return BM.has(id); };
  /** 2.67.0: "Delete from this phone" asks in the app's own dialog (it used to be the grey browser pop-up) and says what happens to this kind of program. */
  async function askDelete(a, p) {
    const own = !builtinMapHas(p.id);
    const body = `"${p.title}" goes off this phone. ${own ? "It is one you made or imported, so it cannot be added back later." : 'You can add it back any time with "Add Back a Built-in Program".'} Saved workouts in History are kept.`;
    if (await PT.confirm("Delete this program?\n\n" + body, { title: "Delete this program?", body, ok: "Delete", cancel: "Keep it", danger: true })) a.deleteProgram(p.id);
  }

  /* ================================================================ styles */
  const css = document.createElement("style"); css.id = "pt-v237-prog-css";
  css.textContent = `
    .pgx-oldhead { display: none !important; }
    #pgx-hero { display: flex; align-items: center; gap: .8rem; padding: .85rem .95rem; border-radius: 1.05rem; }
    #pgx-hero.pgx-has { cursor: pointer; background: rgb(var(--z900)); border: 1px solid rgb(var(--a600) / .6); }
    #pgx-hero.pgx-none { background: transparent; border: 1px dashed rgb(var(--z700)); }
    #pgx-hero:focus-visible, .pgx-pr:focus-visible { outline: 2px solid rgb(var(--a500)); outline-offset: 2px; }
    .pgx-hm { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: .15rem; }
    .pgx-lab { font-size: .62rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: rgb(var(--a400)); }
    .pgx-none .pgx-lab { color: rgb(var(--z400)); }
    .pgx-ht { font-size: 1rem; font-weight: 800; line-height: 1.2; color: rgb(var(--z100)); overflow-wrap: anywhere; }
    .pgx-hs { font-size: .74rem; color: rgb(var(--z400)); line-height: 1.3; }
    .pgx-go { flex: none; padding: .55rem .95rem; border-radius: .8rem; background: rgb(var(--a600)); color: #fff; font-weight: 800; font-size: .78rem; }

    #view-programs #pt-prog-tools { display: grid !important; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: .45rem; }
    #view-programs #pt-prog-tools > button { grid-column: span 2 !important; margin: 0 !important; width: 100% !important; min-height: 3.15rem !important; padding: .45rem .2rem !important; border-radius: .85rem !important; background: rgb(var(--z900)) !important; border: 1px solid rgb(var(--z800)) !important; color: rgb(var(--z100)) !important; box-shadow: none !important; font-size: .68rem !important; font-weight: 700 !important; line-height: 1.15 !important; display: flex !important; flex-direction: column; align-items: center; justify-content: center; gap: .18rem; text-align: center; }
    #view-programs #pt-prog-tools > button:active { background: rgb(var(--z850)) !important; }
    #view-programs #pt-prog-tools > #pt-prog-steal, #view-programs #pt-prog-tools > #pt-prog-plist { grid-column: span 3 !important; flex-direction: row; gap: .5rem; }
    #view-programs #pt-prog-tools .pgx-ti { font-size: 1.05rem; line-height: 1; }
    #view-programs #pt-prog-tools > #pt-prog-build { grid-column: 1 / -1 !important; flex-direction: row; gap: .5rem; min-height: 2.9rem !important; font-size: .88rem !important; background: rgb(var(--a600)) !important; border-color: transparent !important; color: #fff !important; }
    #view-programs #pt-prog-tools > #pt-prog-build .pgx-ti { font-size: 1rem; }

    #pgx-find { display: flex; flex-direction: column; gap: .55rem; }
    #pgx-find .relative { position: relative; }
    #pgx-find .pt-sin { padding-right: 2.4rem; }
    .pgx-clear { position: absolute; right: .35rem; top: 50%; transform: translateY(-50%); width: 1.9rem; height: 1.9rem; border-radius: 999px; font-size: .8rem; color: rgb(var(--z400)); }
    .pgx-row { margin: 0 -1rem; padding: 0 1rem; }
    .pgx-chips { display: flex; gap: .4rem; overflow-x: auto; padding: .1rem 1rem .2rem; margin: 0 -1rem; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
    .pgx-chips::-webkit-scrollbar { display: none; }
    .pgx-chip { flex: none; padding: .42rem .8rem; border-radius: 999px; font-size: .75rem; font-weight: 700; background: rgb(var(--z900)); border: 1px solid rgb(var(--z800)); color: rgb(var(--z300)); white-space: nowrap; }
    .pgx-chip i { font-style: normal; font-weight: 600; opacity: .6; margin-left: .1rem; }
    .pgx-chip[aria-pressed="true"] { background: rgb(var(--a600)); border-color: transparent; color: #fff; }
    .pgx-count { font-size: .7rem; font-weight: 600; color: rgb(var(--z500)); padding: 0 .15rem; }
    .pgx-count #program-count-label { font-size: .7rem; }

    #programs-list-container.pgx-list > * + * { margin-top: .4rem !important; }
    #programs-list-container.pgx-list > .pgx-h { margin-top: 1.05rem !important; margin-bottom: .1rem; }
    #programs-list-container.pgx-list > .pgx-h:first-child { margin-top: .2rem !important; }
    .pgx-h { display: flex; align-items: center; justify-content: space-between; font-size: .68rem; font-weight: 800; letter-spacing: .09em; text-transform: uppercase; color: rgb(var(--z500)); padding: 0 .2rem; }
    .pgx-h span { font-weight: 700; letter-spacing: 0; }
    .pgx-pr { display: flex; align-items: center; gap: .7rem; padding: .6rem .5rem .6rem .65rem; border-radius: .95rem; background: rgb(var(--z900)); border: 1px solid rgb(var(--z800)); cursor: pointer; -webkit-tap-highlight-color: transparent; }
    .pgx-pr:active { background: rgb(var(--z850)); }
    .pgx-pr.pgx-cur { border-color: rgb(var(--a600) / .65); }
    .pgx-av { flex: none; width: 2.5rem; height: 2.5rem; border-radius: .8rem; display: grid; place-items: center; font-size: .78rem; font-weight: 800; letter-spacing: .02em; background: hsl(var(--h) 38% 19%); color: hsl(var(--h) 72% 78%); }
    html[data-mode="light"] .pgx-av { background: hsl(var(--h) 62% 90%); color: hsl(var(--h) 55% 28%); }
    .pgx-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: .12rem; }
    .pgx-t { font-size: .88rem; font-weight: 700; line-height: 1.22; color: rgb(var(--z100)); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; overflow-wrap: anywhere; }
    .pgx-s { font-size: .7rem; font-weight: 500; color: rgb(var(--z400)); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .pgx-pill { flex: none; font-size: .62rem; font-weight: 800; letter-spacing: .03em; padding: .2rem .5rem; border-radius: 999px; background: rgb(var(--a600) / .16); color: rgb(var(--a400)); border: 1px solid rgb(var(--a600) / .5); white-space: nowrap; }
    .pgx-more { flex: none; width: 2.2rem; height: 2.2rem; border-radius: .7rem; font-size: 1.15rem; font-weight: 800; line-height: 1; color: rgb(var(--z400)); letter-spacing: .02em; }
    .pgx-more:active { background: rgb(var(--z800)); }
    .pgx-ico { width: .8rem; height: .8rem; flex: none; }
    .pgx-ap { display: inline-flex; align-items: center; gap: .15rem; margin-right: .4rem; padding: .04rem .38rem; border-radius: 999px; font-size: .6rem; font-weight: 800; letter-spacing: .03em; vertical-align: .05em; color: rgb(251 191 36); background: linear-gradient(100deg, rgb(251 191 36 / .16), rgb(129 140 248 / .2)); border: 1px solid rgb(251 191 36 / .28); }
    .pgx-ap .pgx-ico { width: .62rem; height: .62rem; }
    .pgx-ap .pgx-ico:nth-child(2) { color: rgb(165 180 252); margin-right: .08rem; }
    .pgx-ap.part { color: rgb(253 186 116); background: rgb(251 191 36 / .12); }
    html[data-mode="light"] .pgx-ap { color: rgb(180 83 9); border-color: rgb(217 119 6 / .35); background: linear-gradient(100deg, rgb(251 191 36 / .25), rgb(129 140 248 / .22)); }
    html[data-mode="light"] .pgx-ap .pgx-ico:nth-child(2) { color: rgb(67 56 202); }

    #pgx-two { display: flex; flex-direction: column; gap: .5rem; }
    #pgx-two[hidden] { display: none; }
    .pgx-sh { display: grid; grid-template-columns: 1fr auto; column-gap: .6rem; align-items: baseline; padding: 0 .15rem; }
    .pgx-sh-t { font-size: .95rem; font-weight: 800; color: rgb(var(--z100)); }
    .pgx-sh-s { grid-column: 1; grid-row: 2; font-size: .72rem; color: rgb(var(--z400)); line-height: 1.3; }
    .pgx-sh-all { grid-column: 2; grid-row: 1 / 3; align-self: center; padding: .38rem .7rem; border-radius: 999px; font-size: .72rem; font-weight: 800; color: rgb(var(--a400)); border: 1px solid rgb(var(--a600) / .45); background: rgb(var(--a600) / .1); white-space: nowrap; }
    .pgx-sh-all i { font-style: normal; font-weight: 700; opacity: .7; margin-left: .1rem; }
    .pgx-rail { display: flex; gap: .65rem; overflow-x: auto; margin: 0 -1rem; padding: .15rem 1rem .5rem; scroll-snap-type: x mandatory; scroll-padding-left: 1rem; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
    .pgx-rail::-webkit-scrollbar { display: none; }
    .pgx-tc { flex: none; width: min(16.75rem, 78vw); scroll-snap-align: start; display: flex; flex-direction: column; text-align: left; border-radius: 1.15rem; overflow: hidden; background: rgb(var(--z900)); border: 1px solid rgb(var(--z800)); -webkit-tap-highlight-color: transparent; }
    .pgx-tc:active { transform: scale(.985); }
    .pgx-tc:focus-visible { outline: 2px solid rgb(var(--a500)); outline-offset: 2px; }
    .pgx-sky { position: relative; height: 3.5rem; background: radial-gradient(circle at 88% 30%, rgb(255 255 255 / .9) 0 1px, transparent 1.6px), radial-gradient(circle at 74% 62%, rgb(255 255 255 / .75) 0 1px, transparent 1.6px), radial-gradient(circle at 60% 24%, rgb(255 255 255 / .6) 0 1px, transparent 1.6px), linear-gradient(100deg, hsl(41 96% 62%) 0%, hsl(24 92% 60%) 24%, hsl(338 62% 52%) 46%, hsl(262 52% 38%) 70%, hsl(234 55% 20%) 100%); }
    .pgx-sun { position: absolute; left: .95rem; top: .75rem; width: 2rem; height: 2rem; border-radius: 50%; background: radial-gradient(circle at 38% 35%, #fff7c2, #ffd23f 55%, #ffb01f); box-shadow: 0 0 0 .38rem rgb(255 221 100 / .28), 0 0 1.4rem .3rem rgb(255 200 80 / .55); }
    .pgx-moon { position: absolute; right: 1rem; top: .85rem; width: 1.75rem; height: 1.75rem; color: #e8ecff; filter: drop-shadow(0 0 .4rem rgb(190 205 255 / .6)); }
    .pgx-moon .pgx-ico { width: 100%; height: 100%; }
    .pgx-cur-pill { position: absolute; left: 50%; top: .5rem; transform: translateX(-50%); font-size: .6rem; font-weight: 800; letter-spacing: .03em; padding: .18rem .5rem; border-radius: 999px; background: rgb(0 0 0 / .42); color: #fff; white-space: nowrap; }
    .pgx-tb { display: flex; flex-direction: column; gap: .42rem; padding: .7rem .8rem .8rem; flex: 1; }
    .pgx-trow { display: flex; align-items: center; gap: .6rem; min-height: 2.5rem; }
    .pgx-trow .pgx-av { width: 2.2rem; height: 2.2rem; border-radius: .7rem; font-size: .7rem; }
    .pgx-tm { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: .08rem; }
    .pgx-tc-t { font-size: .84rem; font-weight: 800; line-height: 1.2; color: rgb(var(--z100)); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; overflow-wrap: anywhere; }
    .pgx-tc-a { font-size: .68rem; font-weight: 600; color: rgb(var(--z400)); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .pgx-ses { display: flex; align-items: center; gap: .45rem; font-size: .74rem; font-weight: 600; color: rgb(var(--z200)); min-width: 0; }
    .pgx-ses > span { min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .pgx-ses i { flex: none; display: inline-flex; align-items: center; gap: .22rem; min-width: 2.7rem; padding: .14rem .45rem; border-radius: 999px; font-style: normal; font-size: .62rem; font-weight: 800; letter-spacing: .06em; }
    .pgx-ses i.am { color: rgb(252 211 77); background: rgb(251 191 36 / .14); }
    .pgx-ses i.pm { color: rgb(165 180 252); background: rgb(129 140 248 / .17); }
    html[data-mode="light"] .pgx-ses i.am { color: rgb(146 64 14); background: rgb(251 191 36 / .3); }
    html[data-mode="light"] .pgx-ses i.pm { color: rgb(55 48 163); background: rgb(129 140 248 / .22); }
    .pgx-tf { margin-top: auto; padding-top: .1rem; font-size: .68rem; font-weight: 600; color: rgb(var(--z500)); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    @media (prefers-reduced-motion: reduce) { .pgx-tc:active { transform: none; } }

    .pgx-empty { text-align: center; padding: 1.6rem 1rem; border-radius: 1rem; border: 1px dashed rgb(var(--z700)); color: rgb(var(--z400)); font-size: .85rem; }
    .pgx-empty button { margin-top: .7rem; padding: .5rem .95rem; border-radius: .75rem; font-size: .78rem; font-weight: 700; background: rgb(var(--z800)); color: rgb(var(--z100)); }
  `;
  document.head.appendChild(css);

  /* ================================================================ wiring */
  function refresh(a) {
    if (!a || !scaffold()) return;
    const list = (a.data && a.data.programs) || [];
    const has = list.length > 0;
    ["pgx-hero", "pgx-find"].forEach(id => { const e = $(id); if (e) e.classList.toggle("hidden", !has); });
    if (!has) { const t = $("pgx-two"); if (t) t.hidden = true; return; }                                  // the original "No programs" message stays
    decorateTools(); drawHero(a); drawList();
  }
  const oRP = proto.renderProgramsView;
  proto.renderProgramsView = function () {
    const r = oRP.apply(this, arguments);
    try { BM = null; refresh(this); } catch (e) { console.error("PulseTrack programs screen", e); }
    return r;
  };
  const oShow = proto.showView;
  proto.showView = function (v) {
    try { const vw = $("view-programs"); if (v === "programs" && vw && vw.classList.contains("hidden")) { ST.q = ""; const q = $("pgx-q"); if (q) q.value = ""; } } catch (e) { }
    return oShow.apply(this, arguments);
  };

  PT.sessionOf = sessionOf;
  PT.programsScreen = { state: ST, meta: metaOf, facts: p => facts(p, metaOf(p)), redraw: () => refresh(A()), two: twoInfo, sessionOf, tools: decorateTools };
})();
  