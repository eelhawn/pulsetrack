
/* =====================================================================
 * PulseTrack 2.47.0: Coach mode, part two. The two live screens.
 *  - Stopwatch: time many athletes at once. "Start all" (with an optional 3 or 5 second countdown), "Start next" for one runner at a
 *    time, or tap any name to start just that athlete. Tap a running name to stop it. Each tap is stamped at the moment your finger
 *    went down, not when it came up. "Undo stop" puts the last athlete back on the clock, and a finished name can be reset.
 *    Unsaved times survive the app being closed (kept on the phone for three hours).
 *  - Group timer: one interval clock for the whole group. Work and rotate times, rounds, and a Tabata preset. Name the stations and the
 *    groups are dealt out and rotate round them, with the screen showing which group is where, now and next. Beeps for the last three
 *    seconds, a voice call-out for each change, and the screen stays awake.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof PT === "undefined" || !PT.coachMode || !PT.kit) return;
  const C = PT.coachMode, K = PT.kit, esc = C.esc, $ = id => document.getElementById(id);
  const TMP = "pt_co_swtmp";           // not a pulsetrack_ key on purpose: it is scratch, not something to back up
  const now = () => performance.timeOrigin + performance.now();
  const evNow = e => { try { if (e && typeof e.timeStamp === "number" && e.timeStamp > 0) { const t = performance.timeOrigin + e.timeStamp, n = now(); if (t <= n + 5 && n - t < 2000) return Math.min(t, n); } } catch (_) { } return now(); };
  const snd = () => { try { return typeof sound !== "undefined" ? sound : window.sound; } catch (e) { return window.sound; } };
  const beep = k => { try { const s = snd(); if (s && typeof s[k] === "function") s[k](); } catch (e) { } };
  const unlockAudio = () => { try { const s = snd(); if (s && s.init) s.init(); } catch (e) { } };
  let wl = null;
  async function wake(on) {
    try {
      if (!on) { if (wl) { const w = wl; wl = null; await w.release(); } return; }
      if ("wakeLock" in navigator && !wl) { wl = await navigator.wakeLock.request("screen"); wl.addEventListener && wl.addEventListener("release", () => { wl = null; }); }
    } catch (e) { wl = null; }
  }
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && ($("pt-co-sw") || $("pt-co-ci"))) wake(true); });
  const round2 = x => Math.round(x * 100) / 100;
  const ovShell = (id, label, inner) => { const e = document.createElement("div"); e.id = id; e.className = "pt-co-ov"; e.setAttribute("role", "dialog"); e.setAttribute("aria-label", label); e.innerHTML = inner; document.body.appendChild(e); return e; };

  /* ================================================================ stopwatch */
  let W = null, raf = 0, down = null;
  const cd = () => { const v = C.db().cfg.cd; return v === 3 || v === 5 ? v : 0; };
  function persist() {
    if (!W) return;
    try { localStorage.setItem(TMP, JSON.stringify({ ts: Date.now(), team: W.team.id, drill: W.d.id, ids: W.ids, rows: W.rows })); } catch (e) { }
  }
  const clearTmp = () => { try { localStorage.removeItem(TMP); } catch (e) { } };
  const touched = () => !!W && W.ids.some(id => W.rows[id].s !== "w");
  function stopwatch(team, d, ids, restore) {
    if (!team || !d) return;
    closeSW(true);
    const list = ids.filter(id => C.athOf(team, id));
    if (!list.length) return;
    W = { team, d, ids: list, rows: {}, last: [], timer: 0, cdAt: 0, els: {} };
    list.forEach(id => { W.rows[id] = restore && restore[id] ? restore[id] : { s: "w", t0: 0, t1: 0 }; });
    const e = ovShell("pt-co-sw", "Stopwatch: " + d.name, `
      <div class="pt-co-head"><button type="button" data-sw="x" aria-label="Back">‹</button><div class="pt-co-ttl"><b>${esc((d.icon || "") + " " + d.name)}</b><span id="pt-sw-sub"></span></div><button type="button" data-sw="cd" id="pt-sw-cd" aria-label="Countdown" class="pt-sw-cdb"></button></div>
      <div class="pt-sw-bar"><button type="button" class="pt-sw-all" data-sw="all">Start all</button><button type="button" class="pt-sw-nx" data-sw="next">Start next</button><button type="button" class="pt-sw-un" data-sw="undo" aria-label="Undo the last stop">↶</button></div>
      <div class="pt-sw-list" id="pt-sw-list">${list.map(id => { const a = C.athOf(team, id); return `<div class="pt-sw-row w" data-id="${esc(id)}" role="button" tabindex="0"><span class="n">${esc(C.nm(a))}</span><b class="t"></b><span class="rk"></span><button type="button" class="rs" data-sw="reset" aria-label="Reset ${esc(a.name)}">↺</button></div>`; }).join("")}</div>
      <div class="pt-sw-foot"><button type="button" class="pt-co-go" data-sw="save" id="pt-sw-save"></button></div>
      <div class="pt-sw-cnt hidden" id="pt-sw-cnt" aria-live="assertive"><b id="pt-sw-cn">3</b><button type="button" data-sw="cdx">Cancel</button></div>`);
    e.querySelectorAll(".pt-sw-row").forEach(r => { W.els[r.dataset.id] = r; });
    e.addEventListener("pointerdown", ev => { const t = ev.target.closest("[data-id], [data-sw='all'], [data-sw='next']"); down = t ? { el: t, ts: evNow(ev) } : null; });
    e.addEventListener("pointercancel", () => { down = null; });
    e.addEventListener("click", swClick);
    e.addEventListener("keydown", ev => { if ((ev.key === "Enter" || ev.key === " ") && ev.target.classList && ev.target.classList.contains("pt-sw-row")) { ev.preventDefault(); rowTap(ev.target.dataset.id, now()); } });
    wake(true); paintAll(); loop(); persist();
  }
  function closeSW(silent) {
    if (raf) cancelAnimationFrame(raf); raf = 0; clearTimeout(W && W.timer);
    const e = $("pt-co-sw"); if (e) e.remove(); W = null; down = null; wake(false);
  }
  const loop = () => { if (!W) return; paintLive(); raf = requestAnimationFrame(loop); };
  const swCounts = () => { const c = { w: 0, r: 0, d: 0 }; W.ids.forEach(id => c[W.rows[id].s]++); return c; };
  /** ranks among the finished, best first */
  function ranks() {
    const dn = W.ids.filter(id => W.rows[id].s === "d").map(id => ({ id, v: W.rows[id].t1 - W.rows[id].t0 }));
    const low = C.kind(W.d).better === "low"; dn.sort((x, y) => (low ? x.v - y.v : y.v - x.v));
    const m = {}; dn.forEach((x, i) => { m[x.id] = i; }); return m;
  }
  const rowEl = id => (W && W.els[id]) || null;
  function paintRow(id, rk) {
    const el = rowEl(id); if (!el) return; const r = W.rows[id], t = el.querySelector(".t"), k = el.querySelector(".rk");
    const cls = "pt-sw-row " + r.s; if (el.className !== cls) el.className = cls;
    el.setAttribute("aria-label", C.nm(C.athOf(W.team, id)) + (r.s === "w" ? ", tap to start" : r.s === "r" ? ", running, tap to stop" : ", finished in " + C.fmtT((r.t1 - r.t0) / 1000)));
    if (r.s === "w") { if (t.textContent !== "Tap to start") t.textContent = "Tap to start"; k.textContent = ""; }
    else if (r.s === "d") { const s = C.fmtT(round2((r.t1 - r.t0) / 1000)); if (t.textContent !== s) t.textContent = s; const q = rk && rk[id] != null ? (rk[id] === 0 ? "🥇" : rk[id] === 1 ? "🥈" : rk[id] === 2 ? "🥉" : "#" + (rk[id] + 1)) : ""; if (k.textContent !== q) k.textContent = q; }
  }
  function paintLive() {
    const n = now(); W.ids.forEach(id => { const r = W.rows[id]; if (r.s !== "r") return; const el = rowEl(id); if (!el) return; const t = el.querySelector(".t"), s = C.fmtT(Math.max(0, (n - r.t0) / 1000)); if (t.textContent !== s) t.textContent = s; });
  }
  function paintAll() {
    if (!W) return; const rk = ranks(), c = swCounts();
    W.ids.forEach(id => paintRow(id, rk));
    $("pt-sw-sub").textContent = [c.r ? c.r + " running" : "", c.d ? c.d + " done" : "", c.w ? c.w + " waiting" : ""].filter(Boolean).join(" · ");
    const sv = $("pt-sw-save"); sv.disabled = !c.d; sv.textContent = c.d ? "Save " + C.plural(c.d, "time") : "Save times";
    const all = document.querySelector('#pt-co-sw [data-sw="all"]'), nx = document.querySelector('#pt-co-sw [data-sw="next"]');
    if (all) { all.disabled = !c.w || !!W.cdAt; all.textContent = W.cdAt ? "Starting…" : !c.w ? "All started" : c.r || c.d ? "Start the rest" : "Start all"; }
    if (nx) nx.disabled = !c.w || !!W.cdAt;
    const un = document.querySelector('#pt-co-sw [data-sw="undo"]'); if (un) un.disabled = !W.last.length;
    const cb = $("pt-sw-cd"); if (cb) { cb.textContent = cd() ? cd() + "s" : "⏱"; cb.title = cd() ? "Countdown " + cd() + " seconds" : "No countdown"; cb.setAttribute("aria-label", cd() ? "Countdown " + cd() + " seconds. Tap to change." : "No countdown. Tap to change."); }
    paintLive(); persist();
  }
  function startRow(id, t) { const r = W.rows[id]; if (!r || r.s !== "w") return false; r.s = "r"; r.t0 = t; r.t1 = 0; return true; }
  function stopRow(id, t) { const r = W.rows[id]; if (!r || r.s !== "r") return false; if (t - r.t0 < 250) return false; r.s = "d"; r.t1 = t; W.last.push(id); return true; }
  function buzz(n) { try { if (navigator.vibrate) navigator.vibrate(n); } catch (e) { } }
  function rowTap(id, t) {
    const r = W.rows[id]; if (!r || W.cdAt) return;
    if (r.s === "w") { if (startRow(id, t)) { buzz(20); paintAll(); } }
    else if (r.s === "r") { if (stopRow(id, t)) { buzz(30); try { const s = snd(); if (s && s.shortBeep) s.shortBeep(); } catch (e) { } paintAll(); } }
  }
  function startAllNow(t) { let n = 0; W.ids.forEach(id => { if (startRow(id, t)) n++; }); if (n) { buzz(40); paintAll(); } }
  function startAll(t) {
    const secs = cd(); if (!W.ids.some(id => W.rows[id].s === "w")) return;
    if (!secs) { startAllNow(t); return; }
    unlockAudio(); const go = now() + secs * 1000; W.cdAt = go; paintAll();
    const box = $("pt-sw-cnt"); box.classList.remove("hidden");
    const tick = () => {
      if (!W || !W.cdAt) return; const left = W.cdAt - now();
      if (left <= 0) { const g = W.cdAt; W.cdAt = 0; box.classList.add("hidden"); beep("highBeep"); C.say("Go"); startAllNow(now()); return; }
      const sec = Math.ceil(left / 1000); if ($("pt-sw-cn").textContent !== String(sec)) { $("pt-sw-cn").textContent = String(sec); beep("shortBeep"); if (sec === secs) C.say("Ready"); }
      W.timer = setTimeout(tick, Math.min(120, Math.max(10, left % 1000 || 100)));
    };
    $("pt-sw-cn").textContent = ""; tick();
  }
  function cancelCd() { if (!W) return; clearTimeout(W.timer); W.cdAt = 0; const b = $("pt-sw-cnt"); if (b) b.classList.add("hidden"); paintAll(); }
  async function swClick(ev) {
    if (!W) return; const b = ev.target.closest("[data-sw]"), row = ev.target.closest(".pt-sw-row");
    const ts = d => (down && down.el === d && now() - down.ts < 2000 ? down.ts : evNow(ev));
    if (b && b.dataset.sw === "reset") { const id = b.closest(".pt-sw-row").dataset.id; W.rows[id] = { s: "w", t0: 0, t1: 0 }; W.last = W.last.filter(x => x !== id); paintAll(); return; }
    if (b) {
      const k = b.dataset.sw;
      if (k === "all") { if (!W.cdAt) startAll(ts(b)); }
      else if (k === "next") { const id = W.ids.find(x => W.rows[x].s === "w"); if (id && !W.cdAt) { startRow(id, ts(b)); buzz(20); paintAll(); } }
      else if (k === "undo") { const id = W.last.pop(); if (id) { const r = W.rows[id]; r.s = "r"; r.t1 = 0; paintAll(); C.toast("Back on the clock: " + C.athOf(W.team, id).name); } }
      else if (k === "cd") { C.db().cfg.cd = cd() === 0 ? 3 : cd() === 3 ? 5 : 0; C.save(); paintAll(); C.toast(cd() ? "Start all counts down " + cd() + " seconds" : "No countdown"); }
      else if (k === "cdx") cancelCd();
      else if (k === "x") {
        if (W.cdAt) { cancelCd(); return; }
        if (touched() && !await PT.confirm("Throw away the times on this screen?", { title: "Leave the stopwatch", ok: "Throw away" })) return;
        clearTmp(); closeSW(); C.render(true);
      }
      else if (k === "save") await saveTimes();
      return;
    }
    if (row) rowTap(row.dataset.id, ts(row));
    down = null;
  }
  async function saveTimes() {
    if (!W) return; const done = W.ids.filter(id => W.rows[id].s === "d"), run = W.ids.filter(id => W.rows[id].s === "r").length; if (!done.length) return;
    if (run && !await PT.confirm(C.plural(run, "athlete") + " still running. Save the finished times and drop those?", { title: "Still running", ok: "Save finished" })) return;
    const team = W.team, d = W.d, ids = W.ids.slice();
    const runs = C.addRuns(team, d, done.map(id => ({ a: id, v: round2((W.rows[id].t1 - W.rows[id].t0) / 1000) })));
    clearTmp(); closeSW(); C.render(true); C.showResults(team, d, runs, ids);
  }
  /** pick up a drill that was being timed when the app was closed */
  async function resume() {
    let o = null; try { o = JSON.parse(localStorage.getItem(TMP) || "null"); } catch (e) { }
    if (!o || Date.now() - o.ts > 3 * 3600e3 || $("pt-co-sw")) { if (o) clearTmp(); return; }
    const team = C.db().teams.find(t => t.id === o.team), d = team && C.drillOf(o.drill);
    if (!team || !d || !o.rows || !Object.values(o.rows).some(r => r.s !== "w")) { clearTmp(); return; }
    const ok = await PT.confirm(`You were timing ${d.name} (${C.plural(o.ids.length, "athlete")}) when the app closed. Pick it up where you left off?`, { title: "Unfinished drill", ok: "Pick it up" });
    if (!ok) { clearTmp(); return; }
    stopwatch(team, d, o.ids, o.rows);
  }

  /* ================================================================ group timer */
  let R = null, ci = 0;
  const LETTERS = "ABCDEFGH";
  const PRESETS = [{ n: "Tabata", w: 20, r: 10, k: 8 }, { n: "Circuit", w: 40, r: 20, k: 6 }, { n: "Sprints", w: 30, r: 30, k: 10 }, { n: "Stations", w: 60, r: 15, k: 6 }];
  const clamp = (v, a, b, d) => { v = parseInt(v, 10); return isFinite(v) ? Math.max(a, Math.min(b, v)) : d; };
  const parseStations = txt => String(txt || "").split(/\n|,/).map(s => s.trim().slice(0, 24)).filter(Boolean).slice(0, 8);
  function deal(ids, g, shuffle) {
    const a = ids.slice(); if (shuffle) for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    g = Math.max(1, Math.min(g, a.length || 1)); const out = [], base = Math.floor(a.length / g), extra = a.length % g; let p = 0;
    for (let i = 0; i < g; i++) { const n = base + (i < extra ? 1 : 0); out.push({ name: LETTERS[i], ids: a.slice(p, p + n) }); p += n; }
    return out;
  }
  const firstNames = (team, ids, n) => { const nm = ids.map(id => (C.athOf(team, id) || {}).name || "").filter(Boolean).map(s => s.split(" ")[0]); return nm.slice(0, n).join(", ") + (nm.length > n ? " +" + (nm.length - n) : ""); };
  const totalSec = c => 5 + c.rounds * c.work + Math.max(0, c.rounds - 1) * c.rest;
  const mmss = s => { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
  function circuit() {
    const team = C.curTeam(); if (!team) return; const s0 = C.sessionFor(team, false), ids = C.present(team, s0).map(a => a.id);
    if (!ids.length) { C.toast("Mark who is here first."); return; }
    const saved = C.db().cfg.circ || {}, el = K.sheet("pt-co-cs", 80);
    const cfg = { work: clamp(saved.work, 5, 600, 20), rest: clamp(saved.rest, 0, 600, 10), rounds: clamp(saved.rounds, 1, 99, 8), stations: Array.isArray(saved.stations) ? saved.stations : [] };
    let groups = null;
    const c = K.openSheet(el, `${K.head("Group timer", "One clock for the whole group")}
      <div class="pt-co-presets">${PRESETS.map((p, i) => `<button type="button" class="pt-co-chip" data-p="${i}">${p.n} ${p.w}/${p.r}</button>`).join("")}</div>
      <div class="pt-co-fields three"><label><span>Work (seconds)</span><input data-f="work" inputmode="numeric" value="${cfg.work}" maxlength="3" autocomplete="off"></label><label><span>Rotate (seconds)</span><input data-f="rest" inputmode="numeric" value="${cfg.rest}" maxlength="3" autocomplete="off"></label><label><span>Rounds</span><input data-f="rounds" inputmode="numeric" value="${cfg.rounds}" maxlength="2" autocomplete="off"></label></div>
      <label class="pt-co-lab" for="pt-cs-st">Stations (one per line, optional)</label>
      <textarea id="pt-cs-st" class="pt-co-ta" rows="3" placeholder="Cones&#10;Ladder&#10;Wall balls">${esc(cfg.stations.join("\n"))}</textarea>
      <div id="pt-cs-g" class="pt-co-fine"></div>
      <button type="button" class="pt-co-go" data-b="go" id="pt-cs-go"></button>`);
    const read = () => ({ work: clamp(c.querySelector('[data-f="work"]').value, 5, 600, 20), rest: clamp(c.querySelector('[data-f="rest"]').value, 0, 600, 10), rounds: clamp(c.querySelector('[data-f="rounds"]').value, 1, 99, 8), stations: parseStations($("pt-cs-st").value) });
    const upd = (reshuffle) => {
      const v = read(), g = v.stations.length >= 2 ? Math.min(v.stations.length, ids.length) : 1;
      if (!groups || groups.length !== g || reshuffle !== undefined) groups = deal(ids, g, reshuffle === true);
      $("pt-cs-g").innerHTML = g > 1 ? `<b>${g} groups</b> start at different stations and move on every rotate. ${v.rounds < v.stations.length ? `With ${v.rounds} rounds each group visits ${v.rounds} of the ${v.stations.length} stations.` : v.rounds % v.stations.length ? "" : `Each group visits every station ${v.rounds / v.stations.length === 1 ? "once" : v.rounds / v.stations.length + " times"}.`}<div class="pt-cs-groups">${groups.map(x => `<div><b>${x.name}</b> ${esc(firstNames(team, x.ids, 6))}</div>`).join("")}</div><button type="button" class="pt-co-sm" data-b="shuf">Shuffle groups</button>` : (v.stations.length === 1 ? "Add a second station to split the group, or leave it as one station for everyone." : `Everyone works and rests on the same clock (${ids.length} here).`);
      const go = $("pt-cs-go"); go.textContent = `Start · ${mmss(totalSec(v))} total`;
    };
    upd();
    c.addEventListener("input", () => upd());
    c.addEventListener("click", e => {
      const p = e.target.closest("[data-p]");
      if (p) { const x = PRESETS[+p.dataset.p]; c.querySelector('[data-f="work"]').value = x.w; c.querySelector('[data-f="rest"]').value = x.r; c.querySelector('[data-f="rounds"]').value = x.k; upd(); return; }
      const b = e.target.closest("[data-b]"); if (!b) return;
      if (b.dataset.b === "shuf") { upd(true); return; }
      if (b.dataset.b === "go") { const v = read(); C.db().cfg.circ = v; C.save(); K.closeSheet(el); unlockAudio(); runCircuit(team, v, groups); }
    });
  }
  function segsOf(c) {
    const s = [{ k: "ready", dur: 5, r: 0 }];
    for (let r = 0; r < c.rounds; r++) { s.push({ k: "work", dur: c.work, r }); if (r < c.rounds - 1 && c.rest > 0) s.push({ k: "rest", dur: c.rest, r }); }
    let a = 0; s.forEach(x => { x.a = a; a += x.dur; x.b = a; }); return s;
  }
  const stationFor = (R, gi, r) => (R.cfg.stations.length ? R.cfg.stations[(gi + r) % R.cfg.stations.length] : "");
  function runCircuit(team, cfg, groups) {
    closeCI(true);
    R = { team, cfg, groups, segs: segsOf(cfg), t0: performance.now(), pausedAt: null, paused: 0, i: -1, beep: -1, done: false, workDone: 0 };
    const multi = groups.length > 1 || cfg.stations.length >= 1;
    const e = ovShell("pt-co-ci", "Group timer", `
      <div class="pt-co-head"><button type="button" data-ci="x" aria-label="End the timer">‹</button><div class="pt-co-ttl"><b>Group timer</b><span id="pt-ci-sub"></span></div><button type="button" data-ci="mute" id="pt-ci-mute" aria-label="Sound">🔊</button></div>
      <div class="pt-ci-main"><div class="pt-ci-ph" id="pt-ci-ph" aria-live="polite"></div><div class="pt-ci-clk" id="pt-ci-clk" role="timer">0</div><div class="pt-ci-rd" id="pt-ci-rd"></div><div class="pt-ci-bar"><i id="pt-ci-pr"></i></div></div>
      ${multi ? `<div class="pt-ci-gs" id="pt-ci-gs">${groups.map((g, i) => `<div class="pt-ci-g" data-g="${i}"><b>${g.name}</b><span class="m">${esc(firstNames(team, g.ids, 3))}</span><em class="st"></em></div>`).join("")}</div>` : ""}
      <div class="pt-ci-ctl"><button type="button" data-ci="pause" id="pt-ci-pause">⏸ Pause</button><button type="button" data-ci="skip">⏭ Skip</button><button type="button" data-ci="end">■ End</button></div>`);
    e.addEventListener("click", ciClick); wake(true);
    ci = setInterval(ciTick, 100); ciTick();
  }
  const ciRef = () => (R.pausedAt != null ? R.pausedAt : performance.now());
  const ciEl = () => (ciRef() - R.t0 - R.paused) / 1000;
  function sayOrBeep(kind) {
    if (R.muted) return;
    if (kind === "work") { beep("highBeep"); } else if (kind === "rest") { beep("lowBeep"); } else if (kind === "done") { beep("completeChime"); }
  }
  function ciTick() {
    if (!R || R.done) return; const el = ciEl(); let i = R.segs.findIndex(x => el < x.b);
    if (i < 0) { finishCI(true); return; }
    const sg = R.segs[i];
    if (i !== R.i) { // a new phase
      if (R.i >= 0 && R.segs[R.i].k === "work") R.workDone++;
      R.i = i; R.beep = -1; sayOrBeep(sg.k);
      if (!R.muted) {
        const last = sg.k === "work" && sg.r === R.cfg.rounds - 1, st = R.cfg.stations.length >= 2;
        C.say(sg.k === "ready" ? "Get ready" : sg.k === "work" ? (last ? "Last round. Work" : "Work") : st ? "Rotate. Move to the next station" : "Rest");
      }
      paintCI(sg);
    }
    const left = sg.b - el, whole = Math.ceil(left - 0.0001);
    if (whole <= 3 && whole >= 1 && whole !== R.beep && sg.dur > 3) { R.beep = whole; if (!R.muted) beep("shortBeep"); }
    $("pt-ci-clk").textContent = whole >= 60 ? mmss(whole) : String(Math.max(0, whole));
    const tg = mmss(Math.max(0, R.segs[R.segs.length - 1].b - el)) + " to go"; if (R.tg !== tg) { R.tg = tg; $("pt-ci-sub").textContent = tg; }
    $("pt-ci-pr").style.width = Math.max(0, Math.min(100, (el - sg.a) / sg.dur * 100)) + "%";
  }
  function paintCI(sg) {
    const e = $("pt-co-ci"); if (!e) return; e.dataset.phase = sg.k;
    $("pt-ci-ph").textContent = sg.k === "ready" ? "GET READY" : sg.k === "work" ? "WORK" : R.cfg.stations.length >= 2 ? "ROTATE" : "REST";
    $("pt-ci-rd").textContent = sg.k === "ready" ? "Starting soon" : "Round " + (sg.r + 1) + " of " + R.cfg.rounds;
    const gs = $("pt-ci-gs"); if (gs) R.groups.forEach((g, gi) => {
      const box = gs.querySelector(`[data-g="${gi}"] .st`); if (!box) return;
      const nextR = sg.k === "work" ? sg.r : sg.k === "rest" ? sg.r + 1 : 0, st = stationFor(R, gi, nextR);
      box.textContent = R.cfg.stations.length ? (sg.k === "work" ? st : "→ " + st) : "";
    });
  }
  function finishCI(natural) {
    if (!R || R.done) return; R.done = true; clearInterval(ci); ci = 0;
    if (R.i >= 0 && R.segs[R.i].k === "work" && natural) R.workDone++;
    const n = R.workDone; if (natural) { sayOrBeep("done"); if (!R.muted) C.say("Done. Nice work."); }
    const e = $("pt-co-ci"); if (e) { e.dataset.phase = "done"; $("pt-ci-ph").textContent = natural ? "DONE" : "STOPPED"; $("pt-ci-clk").textContent = "✓"; $("pt-ci-rd").textContent = C.plural(n, "round") + " done"; $("pt-ci-pr").style.width = "100%"; $("pt-ci-sub").textContent = ""; const ctl = e.querySelector(".pt-ci-ctl"); if (ctl) ctl.innerHTML = `<button type="button" data-ci="close" class="solo">Done</button><button type="button" data-ci="again">Run it again</button>`; }
    if (n >= 1) { const s = C.sessionFor(R.team, true); s.circ = s.circ || []; s.circ.push({ ts: Date.now(), work: R.cfg.work, rest: R.cfg.rest, rounds: n, stations: R.cfg.stations.slice(), groups: R.groups.length }); C.save(); }
    wake(false);
  }
  function closeCI() { clearInterval(ci); ci = 0; const e = $("pt-co-ci"); if (e) e.remove(); R = null; wake(false); }
  async function ciClick(ev) {
    const b = ev.target.closest("[data-ci]"); if (!b || !R) return; const k = b.dataset.ci;
    if (k === "pause") { if (R.pausedAt == null) { R.pausedAt = performance.now(); b.textContent = "▶ Resume"; $("pt-co-ci").classList.add("paused"); try { speechSynthesis.cancel(); } catch (e) { } } else { R.paused += performance.now() - R.pausedAt; R.pausedAt = null; b.textContent = "⏸ Pause"; $("pt-co-ci").classList.remove("paused"); } }
    else if (k === "skip") { if (R.done) return; const sg = R.segs[Math.max(0, R.i)]; R.t0 = ciRef() - R.paused - sg.b * 1000 - 1; ciTick(); }
    else if (k === "mute") { R.muted = !R.muted; b.textContent = R.muted ? "🔇" : "🔊"; if (R.muted) { try { speechSynthesis.cancel(); } catch (e) { } } }
    else if (k === "end" || k === "x") {
      if (R.done) { closeCI(); C.render(true); return; }
      const was = R.pausedAt; if (was == null) { R.pausedAt = performance.now(); }
      const ok = await PT.confirm("End the timer now?", { title: "Group timer", ok: "End it" });
      if (!R) return;
      if (!ok) { if (was == null && R.pausedAt != null) { R.paused += performance.now() - R.pausedAt; R.pausedAt = null; } return; }
      finishCI(false);
    }
    else if (k === "close") { closeCI(); C.render(true); }
    else if (k === "again") { const t = R.team, c = R.cfg, g = R.groups; closeCI(); unlockAudio(); runCircuit(t, c, g); }
  }

  setTimeout(() => {
    try {
      const o = JSON.parse(localStorage.getItem(TMP) || "null"), a = window.app;
      if (o && a && Date.now() - o.ts < 3 * 3600e3 && Object.values(o.rows || {}).some(r => r.s !== "w") && !$("pt-coach")) a.toast("A drill is still being timed.", "Open", () => C.open(), 8000);
    } catch (e) { }
  }, 2500);

  C.stopwatch = stopwatch; C.circuit = circuit; C.resume = resume; C._sw = () => W; C._ci = () => R;

  const css = document.createElement("style");
  css.id = "pt-v247-coach2-css";
  css.textContent = `
    .pt-co-ov { position: fixed; inset: 0; z-index: 76; display: flex; flex-direction: column; background: rgb(var(--z950)); color: rgb(var(--z100)); user-select: none; -webkit-user-select: none; }
    .pt-sw-bar { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 3rem; gap: .5rem; padding: 0 .8rem .6rem; }
    .pt-sw-bar button { padding: .85rem .5rem; border-radius: .9rem; font-weight: 800; font-size: .9rem; background: rgb(var(--z800)); color: rgb(var(--z50)); } .pt-sw-bar .pt-sw-all { background: rgb(var(--a600)); color: #fff; } .pt-sw-bar button:disabled { opacity: .4; }
    .pt-sw-cdb { font-size: .8rem !important; font-weight: 800 !important; }
    .pt-sw-list { flex: 1; overflow-y: auto; padding: 0 .8rem .6rem; display: grid; grid-template-columns: minmax(0, 1fr); gap: .4rem; align-content: start; }
    .pt-sw-row { display: flex; align-items: center; gap: .6rem; min-height: 3.6rem; padding: .5rem .9rem; border-radius: 1rem; background: rgb(var(--z900)); border: 2px solid rgb(var(--z800)); touch-action: manipulation; cursor: pointer; }
    .pt-sw-row .n { flex: 1; min-width: 0; font-weight: 800; font-size: 1rem; color: rgb(var(--z50)); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .pt-sw-row .t { flex: none; font-family: ui-monospace, monospace; font-size: 1.5rem; font-weight: 800; color: rgb(var(--z50)); text-align: right; font-variant-numeric: tabular-nums; } .pt-sw-row.w .t { font-size: .74rem; font-family: inherit; font-weight: 700; color: rgb(var(--z500)); }
    .pt-sw-row.r { border-color: rgb(var(--a500)); background: rgb(var(--a950)); } .pt-sw-row.r .t { color: rgb(var(--a300)); } .pt-sw-row.d { border-color: transparent; cursor: default; }
    .pt-sw-row .rk { flex: none; font-size: 1rem; font-weight: 800; min-width: 1.8rem; text-align: center; color: rgb(var(--z300)); } .pt-sw-row:not(.d) .rk, .pt-sw-row:not(.d) .rs { display: none; }
    .pt-sw-row .rs { flex: none; width: 2.2rem; height: 2.2rem; border-radius: 9999px; background: rgb(var(--z800)); color: rgb(var(--z300)); font-size: 1rem; }
    .pt-sw-foot { padding: .5rem .8rem calc(env(safe-area-inset-bottom, 0px) + .8rem); border-top: 1px solid rgb(var(--z800)); background: rgb(var(--z900)); }
    .pt-sw-cnt { position: absolute; inset: 0; z-index: 3; display: grid; place-content: center; justify-items: center; gap: 1.2rem; background: rgb(var(--z950) / .94); } .pt-sw-cnt.hidden { display: none; }
    .pt-sw-cnt b { font-size: 10rem; line-height: 1; font-weight: 900; color: rgb(var(--a400)); font-family: ui-monospace, monospace; } .pt-sw-cnt button { padding: .8rem 1.6rem; border-radius: 9999px; background: rgb(var(--z800)); color: rgb(var(--z50)); font-weight: 800; }
    .pt-co-fields.three { grid-template-columns: repeat(3, minmax(0, 1fr)); } .pt-cs-groups { display: grid; gap: .2rem; margin: .45rem 0; } .pt-cs-groups > div { font-size: .76rem; color: rgb(var(--z300)); } .pt-cs-groups b { color: rgb(var(--a400)); margin-right: .3rem; }
    #pt-co-ci { --ph: 37 99 235; color: #fff; } #pt-co-ci[data-phase="work"] { --ph: 22 163 74; } #pt-co-ci[data-phase="rest"] { --ph: 217 119 6; } #pt-co-ci[data-phase="done"] { --ph: 82 82 91; } #pt-co-ci { background: linear-gradient(rgb(var(--ph) / .30), rgb(var(--ph) / .30)), #0b0f0d; } #pt-co-ci.paused .pt-ci-clk { opacity: .45; }
    #pt-co-ci .pt-co-head > button, .pt-ci-ctl button { background: rgba(255, 255, 255, .14); color: #fff; } #pt-co-ci .pt-co-ttl b { color: #fff; } #pt-co-ci .pt-co-ttl span { color: rgba(255, 255, 255, .65); }
    .pt-ci-main { flex: 1; display: grid; align-content: center; justify-items: center; gap: .6rem; padding: 1rem; text-align: center; min-height: 0; }
    .pt-ci-ph { font-size: 1.6rem; letter-spacing: .15em; font-weight: 900; color: #fff; } .pt-ci-clk { font-size: min(34vw, 11rem); line-height: 1; font-weight: 900; color: #fff; font-family: ui-monospace, monospace; font-variant-numeric: tabular-nums; } .pt-ci-rd { font-size: 1rem; font-weight: 700; color: rgba(255, 255, 255, .8); }
    .pt-ci-bar { width: min(100%, 24rem); height: .6rem; border-radius: 9999px; background: rgba(0, 0, 0, .4); overflow: hidden; } .pt-ci-bar i { display: block; height: 100%; width: 0; background: rgb(var(--ph)); filter: brightness(1.5); }
    .pt-ci-gs { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .45rem; padding: 0 .8rem .6rem; max-height: 34vh; overflow-y: auto; } .pt-ci-g { display: grid; grid-template-columns: auto minmax(0, 1fr); column-gap: .55rem; row-gap: .1rem; align-items: center; padding: .55rem .65rem; border-radius: .9rem; background: rgba(0, 0, 0, .45); border: 1px solid rgba(255, 255, 255, .14); }
    .pt-ci-g b { grid-row: 1 / 3; width: 2rem; height: 2rem; border-radius: 9999px; background: rgb(5 150 105); display: grid; place-items: center; color: #fff; font-weight: 900; } .pt-ci-g .m { font-size: .66rem; color: rgba(255, 255, 255, .6); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } .pt-ci-g .st { font-style: normal; font-size: .95rem; font-weight: 800; color: #fff; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .pt-ci-ctl { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .5rem; padding: .5rem .8rem calc(env(safe-area-inset-bottom, 0px) + .8rem); } .pt-ci-ctl button { padding: .95rem .4rem; border-radius: 1rem; font-weight: 800; font-size: .9rem; } .pt-ci-ctl .solo { background: rgb(5 150 105); }
  `;
  document.head.appendChild(css);
})();
  