
/* =====================================================================
 * PulseTrack 2.52.0: simpler screens, so there is less to read.
 * One switch (Settings -> Simpler screens, on by default) turns three things on:
 *   - Home: when more than one reminder is waiting (backup, easy week, report card), only the most important one shows.
 *     A small "+ 2 more reminders" line shows the rest when you tap it.
 *   - Workout: an exercise whose sets are all done folds up into one line (name, sets, best set). Tap the line to open it
 *     again. It folds a moment after the last set, so you can still add a set. Timed (tabata) exercises never fold.
 *     (2.55.0) An exercise you opened keeps a slim "Minimize" bar on top, so you can fold it up again with one tap.
 *     (2.56.0) A superset or giant set folds as ONE block once every exercise in it is done (names, rounds), with the same tap to open and Minimize.
 *   - Day list: only this week is open. The other weeks are one line each (tap to open).
 * Nothing is removed and nothing is saved differently: it is only what is shown. Switch it off and the screens look as before.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined") return;
  const proto = ApplicationUI.prototype;
  const $ = id => document.getElementById(id);
  const A = () => window.app;
  const on = () => { const a = A(); return !(a && a.settings && a.settings.simple === false); };
  const unit = () => { try { return A().unit() === "kg" ? "kg" : "lb"; } catch (e) { return "lb"; } };
  const num = v => { const n = parseFloat(String(v == null ? "" : v).replace(",", ".")); return isFinite(n) ? n : 0; };
  const escH = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ============================================================ Home: one reminder at a time */
  let homeOpen = false, homeBusy = false, homeTimer = 0, homeObs = null;
  const shown = el => !!el && getComputedStyle(el).display !== "none";
  const BANNER_RANK = { dbpair: -1, fixold: -1, "fixold-ask": 0.5, famrecap: 0.8 };
  function tidyHome() {
    const v = $("view-home"); if (!v) return;
    homeBusy = true;
    try {
      const ban = $("home-banners"), dl = $("pt-home-deload"), nd = $("pt-nudge");
      if (ban && ban.children.length > 1) {   // 2.63.0: the most useful reminder goes first (a backup nudge beats a one-time question)
        const kids = Array.prototype.slice.call(ban.children);
        const rk = el => { const t = el.getAttribute("data-banner"); return BANNER_RANK[t] != null ? BANNER_RANK[t] : /back\s*up/i.test(el.textContent || "") ? 0 : 3; };
        const sorted = kids.map((el, i) => [el, i, rk(el)]).sort((x, y) => x[2] - y[2] || x[1] - y[1]).map(x => x[0]);
        if (sorted.some((el, i) => el !== kids[i])) sorted.forEach(el => ban.appendChild(el));
      }
      const b0 = ban && ban.firstElementChild;
      [b0, dl, nd].forEach(e => { if (e) e.classList.remove("pt-tidy-off"); });
      let chip = $("pt-tidy-chip");
      const items = [];
      if (shown(ban) && shown(b0)) items.push({ el: b0, rank: BANNER_RANK[b0.getAttribute("data-banner")] != null ? BANNER_RANK[b0.getAttribute("data-banner")] : /back\s*up/i.test(b0.textContent || "") ? 0 : 3 });   // the one-time "volume fixed" / "old workouts updated" notes come first
      if (shown(dl)) items.push({ el: dl, rank: 1 });
      if (shown(nd)) items.push({ el: nd, rank: 2 });
      items.sort((x, y) => x.rank - y.rank);
      if (!on() || items.length < 2) { if (chip) chip.remove(); return; }
      const extra = items.slice(1);
      if (!homeOpen) extra.forEach(i => i.el.classList.add("pt-tidy-off"));
      if (!chip) {
        chip = document.createElement("button"); chip.type = "button"; chip.id = "pt-tidy-chip"; chip.className = "tap-active";
        chip.addEventListener("click", () => { homeOpen = !homeOpen; tidyHome(); });
      }
      chip.textContent = homeOpen ? "Show fewer reminders ▴" : `+ ${extra.length} more reminder${extra.length === 1 ? "" : "s"} ▾`;
      chip.setAttribute("aria-expanded", homeOpen ? "true" : "false");
      const anchor = ban && ban.parentNode === v ? ban : $("pt-home-extra");
      if (anchor && chip.previousElementSibling !== anchor) anchor.insertAdjacentElement("afterend", chip);
    } catch (e) { console.error("PulseTrack simpler Home", e); }
    finally { homeBusy = false; if (homeObs) homeObs.takeRecords(); }
  }
  const schedHome = () => { if (homeBusy) return; clearTimeout(homeTimer); homeTimer = setTimeout(tidyHome, 60); };
  const oRH = proto.renderHomeView;
  if (typeof oRH === "function") proto.renderHomeView = function () { const r = oRH.apply(this, arguments); schedHome(); return r; };
  const v0 = $("view-home");
  if (v0 && typeof MutationObserver !== "undefined") { homeObs = new MutationObserver(schedHome); homeObs.observe(v0, { childList: true, subtree: true }); }

  /* ============================================================ Workout: finished exercises fold up */
  const pinned = new Set(), prevDone = {};
  let ctx = "", firstRender = true;
  function summary(card) {
    let n = 0, top = null;
    card.querySelectorAll(".set-row").forEach(row => {
      const b = row.querySelector(".btn-check-set"); if (!b || b.dataset.completed !== "1") return;
      n++;
      const w = num((row.querySelector('input[data-field="weight"]') || {}).value), r = num((row.querySelector('input[data-field="reps"]') || {}).value);
      if (!top || w > top.w || (w === top.w && r > top.r)) top = { w, r };
    });
    let t = `${n} set${n === 1 ? "" : "s"}`;
    if (top && top.w > 0) t += ` · top ${top.w} ${unit()}${top.r ? " × " + top.r : ""}`;
    else if (top && top.r > 0) t += ` · ${top.r} reps`;
    return t;
  }
  /** the bar on top of a finished exercise: folded = one line with the best set; open = a slim "Minimize" bar (the full card is under it) */
  function setBar(card, name, open) {
    let bar = card.querySelector(":scope > .pt-fold-bar");
    if (!bar) { bar = document.createElement("button"); bar.type = "button"; bar.className = "pt-fold-bar tap-active"; card.insertBefore(bar, card.firstChild); }
    bar.classList.toggle("pt-open", open);
    bar.setAttribute("aria-expanded", open ? "true" : "false");
    bar.setAttribute("aria-label", (open ? "Minimize " : "Open ") + name);
    bar.innerHTML = open
      ? `<span class="pt-fb-ck" aria-hidden="true">✓</span><span class="pt-fb-d">Exercise done</span><span class="pt-fb-m">Minimize <span aria-hidden="true">▴</span></span>`
      : `<span class="pt-fb-ck" aria-hidden="true">✓</span><span class="pt-fb-n">${escH(name)}</span><span class="pt-fb-s">${escH(summary(card))}</span><span class="pt-fb-c" aria-hidden="true">▾</span>`;
    card.classList.toggle("pt-folded", !open);
  }
  function applyFold(card, name) {
    if (!card || card.classList.contains("pt-folded")) return;
    setBar(card, name, false);
  }
  /** the blocks of a day: [first, last] index of each single exercise or superset / giant set (every one but the last is linked to the next) */
  function blocksOf(exs) {
    const out = []; let st = 0;
    for (let i = 0; i < exs.length; i++) if (!(exs[i] && exs[i].link) || i === exs.length - 1) { out.push([st, i]); st = i + 1; }
    return out;
  }
  const doneAll = card => { const b = card.querySelectorAll(".btn-check-set"); return b.length > 0 && [...b].every(x => x.dataset.completed === "1"); };
  /** a superset / giant set: one bar on the first card, the other cards (and the joiners between them) tucked away */
  function setGroup(app, s, e, open) {
    const exs = (app.activeDay && app.activeDay.exercises) || [], cards = [];
    for (let i = s; i <= e; i++) { const c = app.dom.exercisesList.querySelector(`[data-ex-card="${i}"]`); if (!c) return; cards.push(c); }
    const head = cards[0], n = e - s + 1, label = n > 2 ? "Giant set" : "Superset";
    let bar = head.querySelector(":scope > .pt-fold-bar");
    if (!bar) { bar = document.createElement("button"); bar.type = "button"; bar.className = "pt-fold-bar tap-active"; head.insertBefore(bar, head.firstChild); }
    bar.dataset.gs = String(s); bar.dataset.ge = String(e);
    const names = exs.slice(s, e + 1).map(x => x.name).join(" + ");
    const counts = cards.map(c => [...c.querySelectorAll(".btn-check-set")].filter(x => x.dataset.completed === "1").length);
    const lo = Math.min(...counts), hi = Math.max(...counts);
    const rounds = lo === hi ? `${hi} round${hi === 1 ? "" : "s"}` : `${lo}–${hi} sets`;
    bar.classList.toggle("pt-open", open);
    bar.setAttribute("aria-expanded", open ? "true" : "false");
    bar.setAttribute("aria-label", (open ? "Minimize " : "Open ") + label.toLowerCase() + ": " + names);
    bar.innerHTML = open
      ? `<span class="pt-fb-ck" aria-hidden="true">✓</span><span class="pt-fb-d">${label} done</span><span class="pt-fb-m">Minimize <span aria-hidden="true">▴</span></span>`
      : `<span class="pt-fb-ck" aria-hidden="true">✓</span><span class="pt-fb-g"><span class="pt-fb-gn">${escH(names)}</span><span class="pt-fb-g2">${label} · ${escH(rounds)}</span></span><span class="pt-fb-c" aria-hidden="true">▾</span>`;
    head.classList.toggle("pt-folded", !open);
    head.classList.toggle("pt-gfold-head", !open);
    cards.slice(1).forEach(c => c.classList.toggle("pt-gfold-hide", !open));
  }
  function foldWorkout(app) {
    if (!app || !app.dom || !app.dom.exercisesList) return;
    const day = app.activeDay, prog = app.activeProgram; if (!day || !prog) return;
    const c = prog.id + "|" + day.dayNumber;
    if (c !== ctx) { ctx = c; pinned.clear(); Object.keys(prevDone).forEach(k => delete prevDone[k]); firstRender = true; }
    const first = firstRender; firstRender = false;
    const exs = day.exercises || [], list = app.dom.exercisesList;
    const grace = (key, check, apply) => setTimeout(() => {
      try {
        const a = A(); if (!a || !on() || ctx !== c || pinned.has(key)) return;
        if (check(a)) apply(a);
      } catch (e) { }
    }, 2500);   // it was finished just now: give a moment to add a set or fix a number before it folds
    blocksOf(exs).forEach(([s, e]) => {
      if (s !== e) {
        /* ---- a superset or giant set: folds as one block when every exercise in it is done */
        if (exs.slice(s, e + 1).some(x => !x || x.type === "tabata")) return;
        const cards = []; for (let i = s; i <= e; i++) { const cd = list.querySelector(`[data-ex-card="${i}"]`); if (!cd) return; cards.push(cd); }
        if (!cards.every(cd => cd.querySelector(".btn-check-set"))) return;
        const key = "g" + s, done = cards.every(doneAll), was = prevDone[key]; prevDone[key] = done;
        if (!done || !on()) return;
        if (pinned.has(key)) { setGroup(app, s, e, true); return; }   // one you opened: it keeps a Minimize bar
        if (!first && was === false) { grace(key, a => { const cs = []; for (let i = s; i <= e; i++) { const cd = a.dom.exercisesList.querySelector(`[data-ex-card="${i}"]`); if (!cd) return false; cs.push(cd); } return cs.every(doneAll); }, a => setGroup(a, s, e, false)); return; }
        setGroup(app, s, e, false);
        return;
      }
      const i = s, ex = exs[i], card = list.querySelector(`[data-ex-card="${i}"]`);
      if (!card || !ex || ex.type === "tabata" || ex.link) return;
      const btns = card.querySelectorAll(".btn-check-set"); if (!btns.length) return;
      const done = [...btns].every(b => b.dataset.completed === "1");
      const was = prevDone[i]; prevDone[i] = done;
      if (!done || !on()) return;
      if (pinned.has(i)) { setBar(card, ex.name, true); return; }   // one you opened: it keeps a Minimize bar
      if (!first && was === false) { grace(i, a => { const cd = a.dom.exercisesList.querySelector(`[data-ex-card="${i}"]`); return !!cd && doneAll(cd); }, a => { const cd = a.dom.exercisesList.querySelector(`[data-ex-card="${i}"]`); if (cd) applyFold(cd, ex.name); }); return; }
      applyFold(card, ex.name);
    });
  }
  const oRW = proto.renderWorkoutView;
  if (typeof oRW === "function") proto.renderWorkoutView = function () {
    const r = oRW.apply(this, arguments);
    try { foldWorkout(this); } catch (e) { console.error("PulseTrack simpler workout", e); }
    return r;
  };
  document.addEventListener("click", e => {
    const b = e.target.closest && e.target.closest(".pt-fold-bar"); if (!b) return;
    const card = b.closest("[data-ex-card]"); if (!card) return;
    const a = A();
    if (b.dataset.gs !== undefined) {                                   // a superset or giant set
      const s = parseInt(b.dataset.gs, 10), en = parseInt(b.dataset.ge, 10), key = "g" + s;
      if (card.classList.contains("pt-folded")) { pinned.add(key); setGroup(a, s, en, true); }
      else { pinned.delete(key); setGroup(a, s, en, false); }
      return;
    }
    const i = parseInt(card.getAttribute("data-ex-card"), 10);
    const ex = a && a.activeDay && (a.activeDay.exercises || [])[i], name = (ex && ex.name) || "";
    if (card.classList.contains("pt-folded")) { pinned.add(i); setBar(card, name, true); }   // open it, with a way to fold it again
    else { pinned.delete(i); setBar(card, name, false); }                                      // minimize it again
  });

  /* ============================================================ Day list: only this week is open */
  const openWk = new Set(), closedWk = new Set();
  function foldDays(app) {
    const list = app && app.dom && app.dom.daysList, prog = app && app.activeProgram; if (!list || !prog) return;
    const heads = [...list.querySelectorAll(":scope > [data-week-header]")];
    list.querySelectorAll(".pt-fold-off").forEach(e => e.classList.remove("pt-fold-off"));
    if (!on() || heads.length < 2) { heads.forEach(h => { h.removeAttribute("role"); h.removeAttribute("aria-expanded"); const ch = h.querySelector(".pt-wk-chev"); if (ch) ch.remove(); }); return; }
    heads.forEach(hd => {
      const cards = [];
      for (let n = hd.nextElementSibling; n && !n.hasAttribute("data-week-header"); n = n.nextElementSibling) cards.push(n);
      const key = prog.id + "|" + hd.dataset.weekHeader;
      const right = hd.lastElementChild;
      if (right && hd.dataset.orig === undefined) hd.dataset.orig = right.textContent;
      const cur = /now:/.test(hd.dataset.orig || "");
      const open = closedWk.has(key) ? false : (cur || openWk.has(key));
      const count = cards.filter(x => x.hasAttribute("data-day")).length;
      hd.setAttribute("role", "button"); hd.tabIndex = 0; hd.setAttribute("aria-expanded", open ? "true" : "false");
      if (!hd.querySelector(".pt-wk-chev")) { const ch = document.createElement("i"); ch.className = "pt-wk-chev"; ch.setAttribute("aria-hidden", "true"); hd.firstElementChild.insertBefore(ch, hd.firstElementChild.firstChild); }
      if (right) right.textContent = open ? (hd.dataset.orig || "") : `${count} day${count === 1 ? "" : "s"}`;
      if (!open) cards.forEach(x => x.classList.add("pt-fold-off"));
    });
  }
  const toggleWeek = hd => {
    const a = A(); if (!a || !a.activeProgram) return;
    const key = a.activeProgram.id + "|" + hd.dataset.weekHeader, was = hd.getAttribute("aria-expanded") === "true";
    if (was) { closedWk.add(key); openWk.delete(key); } else { openWk.add(key); closedWk.delete(key); }
    foldDays(a);
  };
  document.addEventListener("click", e => { const hd = e.target.closest && e.target.closest("[data-week-header]"); if (hd && hd.getAttribute("role") === "button") toggleWeek(hd); });
  document.addEventListener("keydown", e => { if ((e.key === "Enter" || e.key === " ") && e.target && e.target.matches && e.target.matches("[data-week-header][role=button]")) { e.preventDefault(); toggleWeek(e.target); } });
  const oDec = proto.decorateDaysList;
  proto.decorateDaysList = function () {
    const r = typeof oDec === "function" ? oDec.apply(this, arguments) : undefined;
    try { foldDays(this); } catch (e) { console.error("PulseTrack simpler day list", e); }
    return r;
  };

  /* ============================================================ the switch in Settings */
  const oEx = proto.renderSettingsExtras;
  proto.renderSettingsExtras = async function () {
    const r = oEx ? await oEx.apply(this, arguments) : undefined;
    try {
      if (!$("pt-simple-row")) {
        const ref = $("pt-resume-row") || $("pt-tabs-row") || $("pt-gym-row") || $("pt-textsize");
        if (ref) {
          const row = document.createElement("label");
          row.id = "pt-simple-row"; row.className = "flex items-center justify-between gap-3 mt-3 cursor-pointer";
          row.innerHTML = '<span><span class="block text-xs font-bold text-zinc-100">Simpler screens</span><span class="block text-[11px] text-zinc-400">Home shows one reminder at a time, finished exercises fold into one line, and the day list opens only this week. Tap to open anything that is folded.</span></span><input type="checkbox" id="setting-toggle-simple" class="accent-emerald-500 w-5 h-5 shrink-0">';
          ref.insertAdjacentElement("afterend", row);
          row.querySelector("input").addEventListener("change", ev => {
            const a = A(); a.settings.simple = ev.target.checked; WorkoutStorage.saveSettings(a.settings);
            homeOpen = false; tidyHome();
            try { a.renderWorkoutView && a.renderWorkoutView(); } catch (e) { }
            try { a.renderDaysView && a.activeProgram && a.renderDaysView(); } catch (e) { }
          });
        }
      }
      const t = $("setting-toggle-simple"); if (t) t.checked = on();
    } catch (e) { console.error("PulseTrack simpler screens setting", e); }
    return r;
  };

  const css = document.createElement("style"); css.id = "pt-v252-simple-css";
  css.textContent = `
    .pt-tidy-off { display: none !important; }
    #pt-tidy-chip { display: block; width: 100%; margin-top: .5rem; padding: .55rem .8rem; border-radius: .85rem; border: 1px dashed rgb(var(--z700)); background: transparent; color: rgb(var(--z400)); font-size: .72rem; font-weight: 700; text-align: center; }
    [data-ex-card].pt-folded > :not(.pt-fold-bar) { display: none !important; }
    [data-ex-card].pt-folded { padding: 0 0 .9rem 0 !important; border-color: rgb(var(--a500) / .35); }   /* the room underneath is for the 'Superset with next' pill that sits on the edge */
    .pt-fold-bar { display: flex; align-items: center; gap: .6rem; width: 100%; min-height: 3rem; padding: .7rem .9rem; text-align: left; border-radius: inherit; }
    .pt-fb-ck { flex: none; color: rgb(var(--a500)); font-weight: 900; }
    .pt-fb-n { flex: 0 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: .82rem; font-weight: 800; color: rgb(var(--z100)); }
    .pt-fb-s { margin-left: auto; flex: none; font-size: .7rem; color: rgb(var(--z400)); white-space: nowrap; }
    .pt-fb-c { flex: none; color: rgb(var(--z500)); }
    .pt-fold-bar.pt-open { min-height: 2.75rem; padding: .45rem .75rem; margin: 0 0 .65rem; border-radius: .7rem; background: rgb(var(--z950) / .7); border: 1px solid rgb(var(--z800)); }
    [data-ex-card].pt-gfold-hide, [data-ex-card].pt-gfold-hide + .pt-ssj, [data-ex-card].pt-gfold-head + .pt-ssj { display: none !important; }
    [data-ex-card].pt-gfold-head { padding-bottom: 0 !important; border-left-color: #a855f7 !important; }
    .pt-fb-g { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: .1rem; }
    .pt-fb-gn { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-size: .82rem; font-weight: 800; line-height: 1.25; color: rgb(var(--z100)); }
    .pt-fb-g2 { font-size: .68rem; font-weight: 700; color: rgb(var(--z400)); }
    .pt-fb-d { flex: 0 1 auto; font-size: .75rem; font-weight: 700; color: rgb(var(--z300)); }
    .pt-fb-m { margin-left: auto; flex: none; font-size: .72rem; font-weight: 800; color: rgb(var(--a400)); white-space: nowrap; }
    html[data-mode="light"] .pt-fb-ck, html[data-mode="light"] .pt-fb-m { color: rgb(4 120 87); }
    .pt-fold-off { display: none !important; }
    [data-week-header][role="button"] { cursor: pointer; user-select: none; -webkit-user-select: none; align-items: center !important; min-height: 2.75rem; }
    [data-week-header] .pt-wk-chev { display: inline-block; width: 1.1em; font-style: normal; }
    [data-week-header] .pt-wk-chev::before { content: "▸"; }
    [data-week-header][aria-expanded="true"] .pt-wk-chev::before { content: "▾"; }
  `;
  document.head.appendChild(css);
  schedHome();
})();
  