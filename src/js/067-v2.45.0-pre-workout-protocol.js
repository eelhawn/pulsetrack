
/* =====================================================================
 * PulseTrack 2.45.0: pre-workout protocol.
 *  Before you leave for the gym, tap the protocol on Home (or Workout → ⋯ More). Each step is something you take or eat and how long it
 *  needs: by default "Eggs + bananas" (60 min to settle) and "Creatine + caffeine" (45 min to peak). Tap Taken when you have had one;
 *  its countdown starts, and when it ends you get a chime, a buzz, a spoken line and a message (and a notification if the app is in the
 *  background and notifications are allowed). Steps and times are yours to change.
 *  - Optional lift time: set when you want to be under the bar and every step shows when to take it ("Take at 5:30 PM"), with a reminder
 *    when that time comes.
 *  - Everything is worked out from the clock, so the countdowns are right whenever you open the app, even if the phone slept. A web app
 *    cannot ring while it is closed, so "Phone alerts" saves a small calendar file whose alarms do.
 *  - Saved in settings.fuel (the steps) and settings.fuelRun (the run in progress), so it is in backups.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined" || !PT.kit) return;
  const proto = ApplicationUI.prototype, A = () => window.app, K = PT.kit, esc = K.esc, $ = id => document.getElementById(id);
  const MIN = 60000, EXPIRE = 4 * 3600000, MAX_STEPS = 8;
  const save = a => { try { WorkoutStorage.saveSettings(a.settings); } catch (e) { } };
  const snd = () => { try { return typeof sound !== "undefined" ? sound : window.sound; } catch (e) { return window.sound; } };
  const uid = () => "f" + Math.random().toString(36).slice(2, 7);
  const DEFAULT = () => [
    { id: "meal", icon: "🍳", name: "Eggs + bananas", wait: 60, msg: "Your meal has settled. Good to lift." },
    { id: "supp", icon: "⚡", name: "Creatine + caffeine", wait: 45, msg: "Creatine and caffeine are kicking in. Head in and warm up." }
  ];
  const ADDABLE = [
    { icon: "🥤", name: "Pre-workout drink", wait: 30, msg: "Your pre-workout is kicking in." },
    { icon: "💧", name: "Water (500 ml)", wait: 15, msg: "Hydrated. You are good to go." },
    { icon: "🍌", name: "Quick carbs", wait: 30, msg: "Carbs are on board." },
    { icon: "☕", name: "Coffee", wait: 30, msg: "Caffeine is peaking." }
  ];
  const steps = a => {
    const f = a.settings.fuel;
    return f && Array.isArray(f.items) && f.items.length ? f.items : DEFAULT();
  };
  const cfg = a => (a.settings.fuel && typeof a.settings.fuel === "object" ? a.settings.fuel : (a.settings.fuel = { items: DEFAULT(), target: "" }));
  const run = a => { const r = a.settings.fuelRun; return r && typeof r === "object" && r.t0 && Date.now() - r.t0 < EXPIRE ? r : null; };
  const mmss = ms => { const s = Math.max(0, Math.ceil(ms / 1000)), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; return h ? `${h}:${String(m).padStart(2, "0")}:${String(x).padStart(2, "0")}` : `${m}:${String(x).padStart(2, "0")}`; };
  const clock = t => new Date(t).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  /** today (or the next day) at HH:MM */
  const targetTs = hhmm => {
    const m = /^(\d{1,2}):(\d{2})$/.exec(String(hhmm || "")); if (!m) return 0;
    const d = new Date(); d.setHours(+m[1], +m[2], 0, 0); if (d.getTime() < Date.now() - 30 * MIN) d.setDate(d.getDate() + 1); return d.getTime();
  };

  /* ---------------------------------------------------------------- state of every step */
  /** { it, taken, readyAt, left, state: "wait"|"due"|"settling"|"ready", takeAt } */
  function status(a, now) {
    now = now || Date.now(); const r = run(a), tg = r && r.target ? r.target : 0;
    return steps(a).map(it => {
      const taken = r && r.taken && r.taken[it.id] || 0, readyAt = taken ? taken + it.wait * MIN : 0, takeAt = tg ? tg - it.wait * MIN : 0;
      let state = "wait";
      if (taken) state = now >= readyAt ? "ready" : "settling"; else if (takeAt && now >= takeAt) state = "due";
      return { it, taken, readyAt, left: taken ? Math.max(0, readyAt - now) : 0, state, takeAt };
    });
  }
  /** when everything has had its time, or 0 if some step has not been taken */
  function readyTime(a) {
    const s = status(a); if (!s.length || s.some(x => !x.taken)) return 0;
    return Math.max(...s.map(x => x.readyAt));
  }

  /* ---------------------------------------------------------------- pings */
  function say(msg) {
    const a = A(); try { if (a && a.settings.voice !== false && "speechSynthesis" in window) { speechSynthesis.cancel(); speechSynthesis.speak(new SpeechSynthesisUtterance(msg)); } } catch (e) { }
  }
  function ping(a, title, body, tag) {
    try { const s = snd(); s && s.completeChime && s.completeChime(); } catch (e) { }
    try { navigator.vibrate && navigator.vibrate([250, 120, 250, 120, 500]); } catch (e) { }
    try { a.toast(body, undefined, undefined, 9000); } catch (e) { }
    say(body);
    try {
      if (document.visibilityState !== "visible" && "Notification" in window && Notification.permission === "granted" && "serviceWorker" in navigator)
        navigator.serviceWorker.ready.then(reg => reg.showNotification(title, { body, tag: "pulsetrack-fuel-" + tag, renotify: true, vibrate: [250, 120, 250] })).catch(() => { });
    } catch (e) { }
  }
  /** look at the clock: fire what is due. Returns how many pings went out. */
  function tick(a) {
    a = a || A(); if (!a) return 0;
    const r = a.settings.fuelRun; if (!r) return 0;
    if (!run(a)) { delete a.settings.fuelRun; save(a); paint(a); return 0; }
    const now = Date.now(); let n = 0; r.fired = r.fired || {}; r.cued = r.cued || {};
    status(a, now).forEach(x => {
      const id = x.it.id;
      if (x.state === "ready" && !r.fired[id]) {
        r.fired[id] = now; n++; const late = Math.round((now - x.readyAt) / MIN);
        ping(a, x.it.name + " is ready", (late >= 2 ? x.it.msg + " (" + late + " min ago)" : x.it.msg), id);
      } else if (x.state === "due" && !r.cued[id]) {
        r.cued[id] = now; n++; ping(a, "Time to take " + x.it.name, "Time to take: " + x.it.name + ". Tap Taken when you have.", "t" + id);
      }
    });
    if (n) {
      save(a);
      const rt = readyTime(a); if (rt && now >= rt && !r.allDone) { r.allDone = now; save(a); }
    }
    paint(a); return n;
  }

  /* ---------------------------------------------------------------- actions */
  function start(a, target) {
    const tg = target ? targetTs(target) : 0;
    a.settings.fuelRun = { t0: Date.now(), taken: {}, fired: {}, cued: {}, target: tg };
    save(a); try { if ("Notification" in window && Notification.permission === "default" && !a.settings.fuelAsked) { a.settings.fuelAsked = 1; save(a); Notification.requestPermission().catch(() => { }); } } catch (e) { }
    schedule(a); paint(a);
  }
  function stop(a) { delete a.settings.fuelRun; save(a); schedule(a); paint(a); }
  function take(a, id, agoMin) {
    const r = run(a); if (!r) return; const it = steps(a).find(x => x.id === id); if (!it) return;
    r.taken = r.taken || {}; r.taken[id] = Date.now() - (agoMin || 0) * MIN;
    if (r.fired) delete r.fired[id]; save(a); tick(a); paint(a);
  }
  function untake(a, id) { const r = run(a); if (!r) return; delete r.taken[id]; if (r.fired) delete r.fired[id]; save(a); paint(a); }

  let timer = null;
  function schedule(a) {
    clearInterval(timer); timer = null;
    if (run(a)) timer = setInterval(() => { const b = A(); if (b) tick(b); }, 1000);
  }

  /* ---------------------------------------------------------------- calendar file with real alarms */
  function icsStamp(t) { const d = new Date(t); const p = n => String(n).padStart(2, "0"); return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}T${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}Z`; }
  function icsText(a) {
    const r = run(a); if (!r) return "";
    const ev = []; const now = Date.now();
    status(a).forEach(x => {
      if (x.taken && x.readyAt > now) ev.push([x.readyAt, x.it.name + " ready", x.it.msg]);
      else if (!x.taken && x.takeAt && x.takeAt > now) ev.push([x.takeAt, "Take " + x.it.name, "Time to take " + x.it.name + " for your " + clock(r.target) + " lift."]);
    });
    if (r.target && r.target > now) ev.push([r.target, "Lift time", "Time to train."]);
    if (!ev.length) return "";
    const L = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//PulseTrack//Pre-workout//EN", "CALSCALE:GREGORIAN"];
    ev.forEach((e, i) => {
      L.push("BEGIN:VEVENT", "UID:pulsetrack-fuel-" + r.t0 + "-" + i + "@pulsetrack.local", "DTSTAMP:" + icsStamp(now), "DTSTART:" + icsStamp(e[0]), "DTEND:" + icsStamp(e[0] + 5 * MIN),
        "SUMMARY:" + e[1].replace(/[,;\n]/g, " "), "DESCRIPTION:" + e[2].replace(/[,;\n]/g, " "), "BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:" + e[1].replace(/[,;\n]/g, " "), "TRIGGER:PT0S", "END:VALARM", "END:VEVENT");
    });
    L.push("END:VCALENDAR"); return L.join("\r\n");
  }
  async function phoneAlerts(a) {
    const txt = icsText(a); if (!txt) { a.toast("Mark what you have taken first, or set a lift time"); return; }
    const file = new File([txt], "pulsetrack-prelift.ics", { type: "text/calendar" });
    try { if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: "Pre-workout alerts" }); return; } } catch (e) { if (e && e.name === "AbortError") return; }
    const u = URL.createObjectURL(file), x = document.createElement("a"); x.href = u; x.download = file.name; document.body.appendChild(x); x.click(); x.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000);
    a.toast("Saved pulsetrack-prelift.ics. Open it to add the alarms to your calendar.");
  }

  /* ---------------------------------------------------------------- the sheet */
  let el = null, mode = "run", draft = null;
  function stepRow(a, x, r) {
    const it = x.it; let right, sub;
    if (x.state === "ready") { right = `<span class="pt-fu-ok">Ready ✓</span>`; sub = "Taken " + clock(x.taken) + " · ready since " + clock(x.readyAt); }
    else if (x.state === "settling") { right = `<b class="pt-fu-cd" data-fu-cd="${esc(it.id)}">${mmss(x.left)}</b>`; sub = "Taken " + clock(x.taken) + " · ready at " + clock(x.readyAt); }
    else if (x.state === "due") { right = `<button type="button" class="pt-fu-take tap-active" data-fu-take="${esc(it.id)}">Taken</button>`; sub = "Take it now to be ready on time"; }
    else { right = `<button type="button" class="pt-fu-take tap-active" data-fu-take="${esc(it.id)}">Taken</button>`; sub = x.takeAt ? "Take at " + clock(x.takeAt) : it.wait + " min to " + (/meal|egg|carb|banana|food/i.test(it.name) ? "settle" : "kick in"); }
    const frac = x.state === "ready" ? 100 : x.state === "settling" ? Math.round((1 - x.left / (it.wait * MIN)) * 100) : 0;
    return `<div class="pt-fu-step ${x.state}" data-fu-step="${esc(it.id)}"><span class="pt-fu-ic" aria-hidden="true">${esc(it.icon || "•")}</span>
      <div class="pt-fu-mid"><b>${esc(it.name)}</b><span>${esc(sub)}</span><i class="pt-fu-bar"><u data-fu-bar="${esc(it.id)}" style="width:${frac}%"></u></i></div>
      <div class="pt-fu-right">${right}${x.taken ? `<button type="button" class="pt-fu-undo tap-active" data-fu-untake="${esc(it.id)}" aria-label="Undo ${esc(it.name)}">undo</button>` : (r ? `<button type="button" class="pt-fu-ago tap-active" data-fu-ago="${esc(it.id)}">earlier…</button>` : "")}</div></div>`;
  }
  function renderSheet(a) {
    if (!el) return;
    const r = run(a);
    let html;
    if (mode === "edit") {
      const d = draft || (draft = { items: steps(a).map(x => Object.assign({}, x)), target: (a.settings.fuel && a.settings.fuel.target) || "" });
      html = `${K.head("Edit protocol", "What you take, and how long each one needs")}
        <div class="pt-fu-edit">${d.items.map((it, i) => `<div class="pt-fu-er" data-fu-er="${i}">
          <input class="pt-fu-ei" data-fu-f="icon" value="${esc(it.icon)}" maxlength="2" aria-label="Icon">
          <input class="pt-fu-en" data-fu-f="name" value="${esc(it.name)}" maxlength="32" placeholder="Name" aria-label="Name">
          <input class="pt-fu-ew" data-fu-f="wait" type="number" inputmode="numeric" min="1" max="240" value="${it.wait}" aria-label="Minutes"><em>min</em>
          <button type="button" class="pt-fu-rm tap-active" data-fu-rm="${i}" aria-label="Remove ${esc(it.name)}">✕</button></div>`).join("")}</div>
        <div class="pt-fu-adds">${d.items.length < MAX_STEPS ? ADDABLE.map((x, i) => `<button type="button" class="pt-fu-add tap-active" data-fu-addi="${i}">＋ ${esc(x.name)}</button>`).join("") + `<button type="button" class="pt-fu-add tap-active" data-fu-addi="c">＋ Your own</button>` : ""}</div>
        <label class="pt-fu-lt"><span>Lift at (optional)</span><input id="pt-fu-target" type="time" value="${esc(d.target || "")}"></label>
        <p class="pt-fu-fine">With a lift time, each step shows when to take it so it is ready by then. Leave it empty to just count down from when you take each one.</p>
        <div class="pt-fu-btns"><button type="button" class="pt-fu-ghost tap-active" data-fu-reset="1">Back to the usual</button><button type="button" id="pt-fu-save" class="pt-fu-go tap-active">Save</button></div>`;
    } else if (!r) {
      const tg = (a.settings.fuel && a.settings.fuel.target) || "";
      html = `${K.head("Pre-workout protocol", "Know when your food has settled and your supplements have kicked in")}
        <div class="pt-fu-list">${steps(a).map(it => `<div class="pt-fu-step"><span class="pt-fu-ic">${esc(it.icon)}</span><div class="pt-fu-mid"><b>${esc(it.name)}</b><span>${it.wait} min</span></div></div>`).join("")}</div>
        <label class="pt-fu-lt"><span>Lift at (optional)</span><input id="pt-fu-target0" type="time" value="${esc(tg)}"></label>
        <p class="pt-fu-fine">Start it before you leave. Tap Taken as you have each one, and you get a ping when each is ready. Set a lift time to see when to take them.</p>
        <div class="pt-fu-btns"><button type="button" class="pt-fu-ghost tap-active" data-fu-edit="1">Edit steps</button><button type="button" id="pt-fu-start" class="pt-fu-go tap-active">Start</button></div>`;
    } else {
      const st = status(a), rt = readyTime(a), allReady = rt && Date.now() >= rt;
      html = `${K.head("Pre-workout protocol", r.target ? "Lifting at " + clock(r.target) : "Running")}
        <div class="pt-fu-sum" id="pt-fu-sum">${fuelSummary(a)}</div>
        <div class="pt-fu-list">${st.map(x => stepRow(a, x, r)).join("")}</div>
        <div class="pt-fu-btns"><button type="button" class="pt-fu-ghost tap-active" data-fu-phone="1">Phone alerts</button><button type="button" class="pt-fu-ghost tap-active" data-fu-edit="1">Edit</button><button type="button" class="pt-fu-ghost danger tap-active" data-fu-stop="1">Stop</button></div>
        <p class="pt-fu-fine">Countdowns follow the clock, so they are right whenever you open the app. A web app cannot ring while it is closed or the phone is asleep. “Phone alerts” saves a calendar file whose alarms do.</p>`;
    }
    K.openSheet(el, html);
  }
  function fuelSummary(a) {
    const r = run(a); if (!r) return "";
    const st = status(a), rt = readyTime(a), now = Date.now();
    if (rt && now >= rt) return `<b>Ready to lift.</b> Everything has had its time.`;
    if (rt) return `<b>Ready at ${esc(clock(rt))}</b> <span>(${mmss(rt - now)} to go)</span>`;
    const left = st.filter(x => !x.taken).length;
    return `<b>${left} step${left === 1 ? "" : "s"} still to take.</b> <span>Tap Taken as you go.</span>`;
  }
  function open(m) {
    const a = A(); if (!a) return;
    mode = m || "run"; draft = null; el = K.sheet("pt-fuel", 60);
    renderSheet(a); el.__onClose = () => { draft = null; };
  }

  /* ---------------------------------------------------------------- live updates (no re-render, so taps never get lost) */
  function paint(a) {
    a = a || A(); if (!a) return;
    const r = run(a);
    // sheet
    if (el && !el.classList.contains("hidden") && mode === "run" && r) {
      const st = status(a); let structural = false;
      st.forEach(x => {
        const row = el.querySelector(`[data-fu-step="${CSS.escape(x.it.id)}"]`); if (!row) { structural = true; return; }
        if (!row.classList.contains(x.state)) structural = true;
        const cd = row.querySelector("[data-fu-cd]"); if (cd) cd.textContent = mmss(x.left);
        const bar = row.querySelector("[data-fu-bar]"); if (bar) bar.style.width = (x.state === "ready" ? 100 : x.state === "settling" ? Math.round((1 - x.left / (x.it.wait * MIN)) * 100) : 0) + "%";
      });
      if (structural) renderSheet(a);
      const sum = el.querySelector("#pt-fu-sum"); if (sum) sum.innerHTML = fuelSummary(a);
    } else if (el && !el.classList.contains("hidden") && mode === "run" && !r) renderSheet(a);
    homeRow(a);
  }
  function homeText(a) {
    const r = run(a); if (!r) return null;
    const st = status(a), rt = readyTime(a), now = Date.now();
    if (rt && now >= rt) return ["Ready to lift", "everything has settled"];
    const nxt = st.filter(x => x.state === "settling").sort((x, y) => x.left - y.left)[0];
    const due = st.find(x => x.state === "due");
    if (due) return ["Take " + due.it.name, "now"];
    if (nxt) return [nxt.it.name + " ready in", mmss(nxt.left)];
    const left = st.filter(x => !x.taken).length;
    return ["Pre-workout running", left + " to take"];
  }
  function showIdleRow(a) {
    if (a.settings.fuelRow === false) return false;
    try { if ((a.sessions || []).some(s => s.date === PT.ds())) return false; } catch (e) { }
    const d = a.activeDay; if (d && a.isRestDay && a.isRestDay(d)) return false;
    return true;
  }
  function homeRow(a) {
    const host = $("home-routine") || $("home-work"); let b = $("pt-home-fuel");     // right under today's workout, where you are about to start
    if (!host) { if (b) b.remove(); return; }
    const t = homeText(a), idle = !t && showIdleRow(a);
    if (!t && !idle) { if (b) b.remove(); return; }
    if (!b) { b = document.createElement("button"); b.type = "button"; b.id = "pt-home-fuel"; b.className = "tap-active"; b.dataset.fuOpen = "1"; }
    const html = t ? `<span>🍌 ${esc(t[0])}</span><b>${esc(t[1])}</b>` : `<span>🍌 Pre-workout protocol</span><b>Start</b>`;
    if (b.innerHTML !== html) b.innerHTML = html;
    b.classList.toggle("run", !!t);
    if (host.nextElementSibling !== b) host.insertAdjacentElement("afterend", b);
  }
  let started = false;
  const boot = () => { const a = A(); if (a && a.settings && !started) { started = true; schedule(a); tick(a); } };
  const oHome = proto.renderHomeView;
  proto.renderHomeView = function () { const r = oHome.apply(this, arguments); try { boot(); homeRow(this); } catch (e) { console.error("PulseTrack fuel row", e); } return r; };

  /* ---------------------------------------------------------------- clicks */
  document.addEventListener("click", async e => {
    const a = A(); if (!a || !e.target || !e.target.closest) return;
    const g = s => e.target.closest(s);
    if (g("[data-fu-open], #pt-fuel-open")) { open("run"); return; }
    if (!el || el.classList.contains("hidden")) return;
    const tk = g("[data-fu-take]"); if (tk) { take(a, tk.dataset.fuTake, 0); return; }
    const ut = g("[data-fu-untake]"); if (ut) { untake(a, ut.dataset.fuUntake); renderSheet(a); return; }
    const ag = g("[data-fu-ago]");
    if (ag) {
      const v = await PT.pickList("Taken how long ago?", [5, 10, 15, 20, 30, 45].map(n => ({ value: String(n), label: n + " minutes ago" })), "");
      if (v) { take(a, ag.dataset.fuAgo, parseInt(v, 10)); renderSheet(a); }
      return;
    }
    if (g("#pt-fu-start")) { const t = ($("pt-fu-target0") || {}).value || ""; const c = cfg(a); c.target = t; if (!a.settings.fuel.items) c.items = steps(a); save(a); start(a, t); renderSheet(a); return; }
    if (g("[data-fu-stop]")) { if (!(await PT.confirm("Stop the protocol?", { title: "Stop?", body: "The countdowns are cleared.", ok: "Stop" }))) return; stop(a); mode = "run"; renderSheet(a); return; }
    if (g("[data-fu-phone]")) { phoneAlerts(a); return; }
    if (g("[data-fu-edit]")) { mode = "edit"; draft = null; renderSheet(a); return; }
    if (mode !== "edit") return;
    if (g("[data-fu-reset]")) { draft = { items: DEFAULT(), target: (draft && draft.target) || "" }; renderSheet(a); return; }
    const rm = g("[data-fu-rm]"); if (rm && draft) { if (draft.items.length <= 1) { a.toast("Keep at least one step"); return; } draft.items.splice(parseInt(rm.dataset.fuRm, 10), 1); renderSheet(a); return; }
    const ad = g("[data-fu-addi]");
    if (ad && draft) {
      const k = ad.dataset.fuAddi, base = k === "c" ? { icon: "⏱", name: "My step", wait: 30, msg: "Your step is ready." } : ADDABLE[parseInt(k, 10)];
      draft.items.push(Object.assign({ id: uid() }, base)); renderSheet(a); return;
    }
    if (g("#pt-fu-save") && draft) {
      const items = draft.items.map(it => ({ id: it.id || uid(), icon: String(it.icon || "•").slice(0, 2), name: String(it.name || "Step").trim().slice(0, 32) || "Step", wait: Math.min(240, Math.max(1, parseInt(it.wait, 10) || 30)), msg: it.msg || (String(it.name || "Step") + " is ready.") }));
      const c = cfg(a); c.items = items; c.target = ($("pt-fu-target") || {}).value || "";
      const r = run(a); if (r) { r.target = c.target ? targetTs(c.target) : 0; }
      save(a); mode = "run"; draft = null; renderSheet(a); paint(a); return;
    }
  });
  document.addEventListener("input", e => {
    const f = e.target && e.target.dataset && e.target.dataset.fuF; if (!f || !draft) return;
    const row = e.target.closest("[data-fu-er]"); if (!row) return; const it = draft.items[parseInt(row.dataset.fuEr, 10)]; if (!it) return;
    it[f] = f === "wait" ? (parseInt(e.target.value, 10) || 0) : e.target.value;
    if (f === "name") it.msg = it.msg && !/ is ready\.$/.test(it.msg) ? it.msg : e.target.value + " is ready.";
  });
  document.addEventListener("visibilitychange", () => { const a = A(); if (a && document.visibilityState === "visible") { schedule(a); tick(a); } });

  /* ---------------------------------------------------------------- the real button the More sheet clicks */
  function ensureReal() {
    const box = $("pt-wk-actions"); if (!box || $("pt-fuel-open")) return;
    const b = document.createElement("button"); b.type = "button"; b.id = "pt-fuel-open"; b.className = "tap-active"; b.textContent = "Pre-workout protocol"; box.appendChild(b);
  }
  const oRW = proto.renderWorkoutView;
  proto.renderWorkoutView = function () { const r = oRW.apply(this, arguments); try { ensureReal(); } catch (e) { } return r; };

  PT.fuel = { status: () => status(A()), start: t => start(A(), t), stop: () => stop(A()), take: (id, ago) => take(A(), id, ago), tick: () => tick(A()), steps: () => steps(A()), run: () => run(A()), ics: () => icsText(A()), open, targetTs, readyTime: () => readyTime(A()) };

  const css = document.createElement("style");
  css.id = "pt-v245-fuel-css";
  css.textContent = `
    #pt-home-fuel { display: flex; align-items: center; justify-content: space-between; gap: .6rem; width: 100%; padding: .4rem .8rem; border-radius: .8rem; font-size: .75rem; font-weight: 700; background: rgb(var(--z900)); border: 1px solid rgb(var(--z800)); color: rgb(var(--z300)); text-align: left; }
    #home-routine + #pt-home-fuel { margin-top: .6rem; }
    #pt-home-fuel b { font-size: .75rem; font-weight: 800; color: rgb(var(--a400)); font-family: ui-monospace, Menlo, monospace; }
    #pt-home-fuel.run { background: rgb(var(--a950) / .55); border-color: rgb(var(--a500) / .55); }
    .pt-fu-list { display: grid; gap: .5rem; }
    .pt-fu-step { display: flex; align-items: center; gap: .7rem; padding: .7rem .8rem; border-radius: .95rem; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); }
    .pt-fu-step.settling { border-color: rgb(251 191 36 / .45); } .pt-fu-step.due { border-color: rgb(251 113 133 / .6); } .pt-fu-step.ready { border-color: rgb(var(--a500) / .6); }
    .pt-fu-ic { font-size: 1.5rem; width: 2rem; text-align: center; flex: none; }
    .pt-fu-mid { flex: 1 1 auto; min-width: 0; display: grid; gap: .15rem; } .pt-fu-mid b { font-size: .88rem; color: rgb(var(--z50)); } .pt-fu-mid > span { font-size: .68rem; color: rgb(var(--z400)); }
    .pt-fu-bar { display: block; height: .3rem; border-radius: 999px; background: rgb(var(--z800)); overflow: hidden; margin-top: .2rem; } .pt-fu-bar u { display: block; height: 100%; background: rgb(var(--a500)); transition: width .8s linear; text-decoration: none; }
    .pt-fu-step:not(.settling):not(.ready) .pt-fu-bar { display: none; }
    .pt-fu-right { display: grid; justify-items: end; gap: .25rem; flex: none; }
    .pt-fu-cd { font-family: ui-monospace, Menlo, monospace; font-size: 1.05rem; font-weight: 800; color: rgb(252 211 77); } .pt-fu-ok { font-size: .8rem; font-weight: 800; color: rgb(var(--a400)); }
    .pt-fu-take { padding: .55rem .85rem; border-radius: .7rem; background: rgb(var(--a600)); color: #fff; font-size: .8rem; font-weight: 800; }
    .pt-fu-undo, .pt-fu-ago { font-size: .62rem; font-weight: 700; color: rgb(var(--z500)); text-decoration: underline; }
    .pt-fu-sum { padding: .75rem .85rem; border-radius: .95rem; background: rgb(var(--z900)); border: 1px solid rgb(var(--z800)); font-size: .85rem; color: rgb(var(--z100)); } .pt-fu-sum span { color: rgb(var(--z400)); font-size: .75rem; }
    .pt-fu-btns { display: flex; gap: .5rem; flex-wrap: wrap; }
    .pt-fu-go, .pt-fu-ghost { flex: 1 1 auto; padding: .75rem .9rem; border-radius: .85rem; font-size: .82rem; font-weight: 800; }
    .pt-fu-go { background: rgb(var(--a600)); color: #fff; } .pt-fu-ghost { background: rgb(var(--z800)); color: rgb(var(--z100)); } .pt-fu-ghost.danger { color: rgb(251 113 133); }
    .pt-fu-fine { font-size: .68rem; line-height: 1.45; color: rgb(var(--z500)); }
    .pt-fu-edit { display: grid; gap: .45rem; } .pt-fu-er { display: flex; align-items: center; gap: .4rem; }
    .pt-fu-er input, .pt-fu-lt input { padding: .6rem .6rem; border-radius: .7rem; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); color: rgb(var(--z100)); font-size: .85rem; min-width: 0; }
    .pt-fu-ei { width: 2.8rem; text-align: center; } .pt-fu-en { flex: 1 1 auto; } .pt-fu-ew { width: 3.6rem; text-align: center; } .pt-fu-er em { font-style: normal; font-size: .7rem; color: rgb(var(--z500)); }
    .pt-fu-rm { width: 2rem; height: 2rem; border-radius: .6rem; background: rgb(var(--z800)); color: rgb(var(--z300)); flex: none; }
    .pt-fu-adds { display: flex; flex-wrap: wrap; gap: .4rem; } .pt-fu-add { padding: .45rem .7rem; border-radius: 999px; background: rgb(var(--z800)); color: rgb(var(--z100)); font-size: .72rem; font-weight: 700; }
    .pt-fu-lt { display: flex; align-items: center; justify-content: space-between; gap: .75rem; } .pt-fu-lt span { font-size: .8rem; font-weight: 700; color: rgb(var(--z200)); }
  `;
  document.head.appendChild(css);
})();
  