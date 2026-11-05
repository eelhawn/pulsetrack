
/* =====================================================================
 * PulseTrack 2.46.0: Studio mode for progress photos.
 *  In the guided camera (Body → Progress photos → Guided camera) a new 🎬 Studio button opens a set of studio tools over the preview:
 *  - Composition: a full rule-of-thirds grid with the four power points, an optional centre line, and head and feet marks. A level shows
 *    how far the phone is tipped forward, back or sideways (where the phone can report it).
 *  - Light meter: samples the live picture and reports brightness, blown highlights, crushed shadows and which side the light comes from,
 *    and compares them with your last photo ("Light match 94%") with a plain hint when they differ, so a step closer to the window or a
 *    lamp turned off shows up before you press the button.
 *  - Lock look: asks the camera to hold exposure, white balance and focus where they are now (phones whose browser exposes those
 *    controls, mostly Android Chrome), and remembers those values. "Saved look" puts them back next month.
 *  - Checklist: the room, the spot, the phone and you, ticked off for the day, plus a note of height, distance and light position.
 *  Photos taken in Studio mode carry their light readings, so the next session has something exact to match. Everything stays on the phone;
 *  settings.studio holds the choices (in backups). Nothing here changes photos taken without Studio mode.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined" || !PT.kit) return;
  const A = () => window.app, K = PT.kit, esc = K.esc, $ = id => document.getElementById(id);
  const save = a => { try { WorkoutStorage.saveSettings(a.settings); } catch (e) { } };
  const st = a => (a.settings.studio && typeof a.settings.studio === "object" ? a.settings.studio : (a.settings.studio = {}));
  const GUIDES = { thirds: true, center: false, marks: true, level: true };
  const guides = a => Object.assign({}, GUIDES, st(a).guides || {});
  const SW = 48, SH = 64;

  /* ---------------------------------------------------------------- reading the light */
  let cv = null, cx = null;
  function stats(d) {
    const n = SW * SH; let sum = 0, hi = 0, lo = 0, L = 0, R = 0, T = 0, B = 0, nl = 0, nt = 0;
    for (let y = 0, i = 0; y < SH; y++) for (let x = 0; x < SW; x++, i += 4) {
      const Y = (d[i] * 77 + d[i + 1] * 150 + d[i + 2] * 29) >> 8; sum += Y;
      if (Y >= 250) hi++; if (Y <= 8) lo++;
      if (x < SW / 2) L += Y; else R += Y; if (y < SH / 2) T += Y; else B += Y;
    }
    const half = n / 2, m = v => Math.round(v * 10) / 10;
    return { lum: m(sum / n / 2.55), hi: m(hi / n * 100), lo: m(lo / n * 100), lr: m((L - R) / Math.max(1, L + R) * 100), tb: m((T - B) / Math.max(1, T + B) * 100), l: m(L / half / 2.55), r: m(R / half / 2.55) };
  }
  function draw(src, sw, sh, mirror) {
    cv = cv || document.createElement("canvas"); cv.width = SW; cv.height = SH; cx = cx || cv.getContext("2d", { willReadFrequently: true });
    const ar = SW / SH; let w = sw, h = sh, x = 0, y = 0;     // the same centre crop the screen shows (object-fit: cover)
    if (sw / sh > ar) { w = sh * ar; x = (sw - w) / 2; } else { h = sw / ar; y = (sh - h) / 2; }
    cx.save(); if (mirror) { cx.translate(SW, 0); cx.scale(-1, 1); } cx.drawImage(src, x, y, w, h, 0, 0, SW, SH); cx.restore();
    return stats(cx.getImageData(0, 0, SW, SH).data);
  }
  const frameStats = v => (v && v.videoWidth ? draw(v, v.videoWidth, v.videoHeight, /scaleX\(-1\)/.test(v.style.transform || "")) : null);
  async function blobStats(blob) {
    try { const bm = await createImageBitmap(blob); const s = draw(bm, bm.width, bm.height, false); if (bm.close) bm.close(); return s; } catch (e) { return null; }
  }
  /** how alike two readings are, 0 to 100, and what to do about it */
  function match(now, ref) {
    if (!now || !ref) return null;
    const dl = now.lum - ref.lum, db = now.lr - ref.lr;
    const score = Math.max(0, Math.min(100, Math.round(100 - 2.2 * Math.abs(dl) - 1.2 * Math.abs(db) - 2 * Math.max(0, now.hi - ref.hi - 1))));
    const tips = [];
    if (dl > 4) tips.push("Brighter than last time. Turn a light off or step back from the window."); else if (dl < -4) tips.push("Darker than last time. Turn another light on or open the curtains.");
    if (db > 7) tips.push("More light on the left half than last time. Check where the lamp or window is."); else if (db < -7) tips.push("More light on the right half than last time. Check where the lamp or window is.");
    if (now.hi > 3 && now.hi > ref.hi + 1.5) tips.push("Bright spots are washing out. Soften or move the light.");
    if (now.lo > 25 && now.lo > ref.lo + 8) tips.push("Heavy shadows. Add a little light from the front.");
    return { score, dl, db, tips, verdict: score >= 90 ? "Matches last time" : score >= 75 ? "Close" : "Different light" };
  }
  PT.studio = { stats, match, blobStats };

  /* ---------------------------------------------------------------- the camera controls (exposure, white balance, focus) */
  const track = () => { const v = $("pt-cam-video"); const s = v && v.srcObject; return s && s.getVideoTracks ? s.getVideoTracks()[0] || null : null; };
  const facing = () => { const v = $("pt-cam-video"); return v && /scaleX\(-1\)/.test(v.style.transform || "") ? "user" : "environment"; };
  const caps = t => { try { return t.getCapabilities ? t.getCapabilities() : {}; } catch (e) { return {}; } };
  const has = (c, key, mode) => Array.isArray(c[key]) && c[key].indexOf(mode) >= 0;
  const clamp = (c, k, v) => { const r = c[k]; return r && typeof r.min === "number" && typeof r.max === "number" ? Math.min(r.max, Math.max(r.min, v)) : v; };
  /** hold what the camera is doing now: { ok, locked: [..], values } */
  async function lockLook() {
    const t = track(); if (!t) return { ok: false, locked: [], why: "no camera" };
    const c = caps(t), s = (t.getSettings && t.getSettings()) || {}, adv = {}, locked = [], vals = {};
    if (has(c, "exposureMode", "manual")) { adv.exposureMode = "manual"; if (s.exposureTime) { adv.exposureTime = s.exposureTime; vals.exposureTime = s.exposureTime; } if (s.iso) { adv.iso = s.iso; vals.iso = s.iso; } locked.push("exposure"); }
    if (has(c, "whiteBalanceMode", "manual")) { adv.whiteBalanceMode = "manual"; if (s.colorTemperature) { adv.colorTemperature = s.colorTemperature; vals.colorTemperature = s.colorTemperature; } locked.push("white balance"); }
    if (has(c, "focusMode", "manual")) { adv.focusMode = "manual"; if (s.focusDistance) { adv.focusDistance = s.focusDistance; vals.focusDistance = s.focusDistance; } locked.push("focus"); }
    if (!locked.length) return { ok: false, locked: [], why: "unsupported" };
    try { await t.applyConstraints({ advanced: [adv] }); } catch (e) { return { ok: false, locked: [], why: "refused" }; }
    const after = (t.getSettings && t.getSettings()) || {};
    return { ok: true, locked, values: vals, mode: { exposure: after.exposureMode, wb: after.whiteBalanceMode, focus: after.focusMode } };
  }
  async function unlockLook() {
    const t = track(); if (!t) return;
    const c = caps(t), adv = {};
    if (has(c, "exposureMode", "continuous")) adv.exposureMode = "continuous"; if (has(c, "whiteBalanceMode", "continuous")) adv.whiteBalanceMode = "continuous"; if (has(c, "focusMode", "continuous")) adv.focusMode = "continuous";
    try { await t.applyConstraints({ advanced: [adv] }); } catch (e) { }
  }
  /** put a saved look back, within what this camera allows */
  async function applyLook(look) {
    const t = track(); if (!t || !look) return { ok: false, locked: [], why: "no camera" };
    const c = caps(t), adv = {}, locked = [], v = look.values || {};
    if (has(c, "exposureMode", "manual") && (v.exposureTime || v.iso)) { adv.exposureMode = "manual"; if (v.exposureTime) adv.exposureTime = clamp(c, "exposureTime", v.exposureTime); if (v.iso) adv.iso = clamp(c, "iso", v.iso); locked.push("exposure"); }
    if (has(c, "whiteBalanceMode", "manual") && v.colorTemperature) { adv.whiteBalanceMode = "manual"; adv.colorTemperature = clamp(c, "colorTemperature", v.colorTemperature); locked.push("white balance"); }
    if (has(c, "focusMode", "manual") && v.focusDistance) { adv.focusMode = "manual"; adv.focusDistance = clamp(c, "focusDistance", v.focusDistance); locked.push("focus"); }
    if (!locked.length) return { ok: false, locked: [], why: "unsupported" };
    try { await t.applyConstraints({ advanced: [adv] }); } catch (e) { return { ok: false, locked: [], why: "refused" }; }
    return { ok: true, locked };
  }
  PT.studioCam = { lockLook, unlockLook, applyLook };

  /* ---------------------------------------------------------------- the overlay inside #pt-cam */
  let S = { on: false, now: null, ref: null, refSrc: "", lock: [], timer: null, tilt: null, track: null, orient: null };
  const dock = `<button type="button" data-st="lock" class="pt-st-chip">🔒 Lock look</button><button type="button" data-st="saved" class="pt-st-chip">↺ Saved look</button><button type="button" data-st="list" class="pt-st-chip">✓ Checklist</button><button type="button" data-st="guides" class="pt-st-chip">☰ Guides</button>`;
  function mount(o) {
    const a = A(); if (!a) return;
    const sp = o.querySelector(".pt-cam-spacer");
    const b = document.createElement("button"); b.type = "button"; b.id = "pt-st-btn"; b.setAttribute("aria-pressed", "false"); b.textContent = "🎬 Studio";
    if (sp) sp.replaceWith(b); else (o.querySelector(".pt-cam-bot") || o).appendChild(b);
    const p = document.createElement("div"); p.id = "pt-st"; p.className = "pt-st hidden";
    p.innerHTML = `<div class="pt-st-lines" aria-hidden="true"><i class="h1"></i><i class="h2"></i><i class="c"></i><i class="m1"></i><i class="m2"></i><b class="p1"></b><b class="p2"></b><b class="p3"></b><b class="p4"></b></div>
      <div class="pt-st-level" id="pt-st-level"></div>
      <div class="pt-st-panel"><div class="pt-st-meter" id="pt-st-meter"></div><div class="pt-st-note" id="pt-st-note"></div><div class="pt-st-dock">${dock}</div></div>`;
    o.appendChild(p);
    S = { on: false, now: null, ref: null, refSrc: "", lock: [], timer: null, tilt: null, track: null, orient: null };
    loadRef(a);
    if (st(a).on) toggle(true);
  }
  function unmount() {
    clearInterval(S.timer); S.timer = null; S.on = false;
    if (S.orient) { window.removeEventListener("deviceorientation", S.orient); S.orient = null; }
  }
  async function loadRef(a) {
    S.ref = null; S.refSrc = "";
    try {
      const ps = (await PhotoDB.all()).sort((x, y) => (x.ts || 0) - (y.ts || 0)), last = ps[ps.length - 1];
      if (last) { S.ref = (last.studio && typeof last.studio.lum === "number") ? last.studio : await blobStats(last.blob); S.refSrc = "last photo"; }
    } catch (e) { }
    if (!S.ref && st(a).target) { S.ref = st(a).target; S.refSrc = "your saved target"; }
    paint();
  }
  function toggle(on) {
    const a = A(), o = $("pt-cam"), p = $("pt-st"), b = $("pt-st-btn"); if (!o || !p) return;
    S.on = on === undefined ? !S.on : !!on; st(a).on = S.on; save(a);
    o.classList.toggle("pt-studio-on", S.on); p.classList.toggle("hidden", !S.on); b.setAttribute("aria-pressed", String(S.on));
    clearInterval(S.timer); S.timer = null;
    if (S.on) { applyGuides(); S.timer = setInterval(sampleTick, 400); sampleTick(); startLevel(); }
    else if (S.orient) { window.removeEventListener("deviceorientation", S.orient); S.orient = null; }
  }
  function applyGuides() {
    const a = A(), g = guides(a), p = $("pt-st"); if (!p) return;
    p.classList.toggle("no-thirds", !g.thirds); p.classList.toggle("no-center", !g.center); p.classList.toggle("no-marks", !g.marks); p.classList.toggle("no-level", !g.level);
  }
  function sampleTick() {
    const v = $("pt-cam-video"); if (!v || !S.on) return;
    const t = track(); if (t !== S.track) { S.track = t; S.lock = []; }     // a new camera has forgotten the lock
    S.now = frameStats(v); paint();
  }
  function paint() {
    const m = $("pt-st-meter"), n = $("pt-st-note"); if (!m || !n) return;
    const d = S.now;
    if (!d) { m.textContent = "Waiting for the camera…"; n.textContent = ""; return; }
    const mt = S.ref ? match(d, S.ref) : null;
    const side = d.lr > 6 ? "light from the left" : d.lr < -6 ? "light from the right" : "even left and right";
    m.innerHTML = `<span><b>${Math.round(d.lum)}%</b> bright</span><span>${esc(side)}</span><span class="${d.hi > 3 ? "warn" : ""}">${d.hi > 3 ? "blown " + d.hi.toFixed(0) + "%" : "no glare"}</span>${mt ? `<span class="pt-st-score ${mt.score >= 90 ? "good" : mt.score >= 75 ? "mid" : "bad"}">Match ${mt.score}%</span>` : ""}`;
    const lockTxt = S.lock.length ? "🔒 Locked: " + S.lock.join(", ") + ". " : "";
    n.textContent = lockTxt + (mt ? (mt.score >= 90 ? "Looks like your " + S.refSrc + "." : mt.tips[0] || "A little different from your " + S.refSrc + ".") : (S.ref ? "" : "No earlier photo to match yet. This one will be your reference."));
  }

  /* ---------------------------------------------------------------- the level */
  function startLevel() {
    const a = A(); if (!guides(a).level) return;
    const go = () => {
      if (S.orient) return;
      S.orient = e => { if (e.beta == null) return; S.tilt = { pitch: Math.round((e.beta - 90) * 10) / 10, roll: Math.round((e.gamma || 0) * 10) / 10 }; levelPaint(); };
      window.addEventListener("deviceorientation", S.orient);
    };
    try {
      if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") DeviceOrientationEvent.requestPermission().then(r => { if (r === "granted") go(); }).catch(() => { });
      else go();
    } catch (e) { }
  }
  function levelPaint() {
    const el = $("pt-st-level"), t = S.tilt; if (!el || !t) return;
    const ok = Math.abs(t.pitch) <= 1.5 && Math.abs(t.roll) <= 1.5;
    el.className = "pt-st-level" + (ok ? " ok" : "");
    const dirP = t.pitch > 0 ? "tipped back" : "tipped forward", dirR = t.roll > 0 ? "right" : "left";
    el.textContent = ok ? "Level ✓" : (Math.abs(t.pitch) > 1.5 ? dirP + " " + Math.abs(t.pitch).toFixed(0) + "°" : "") + (Math.abs(t.pitch) > 1.5 && Math.abs(t.roll) > 1.5 ? " · " : "") + (Math.abs(t.roll) > 1.5 ? "leaning " + dirR + " " + Math.abs(t.roll).toFixed(0) + "°" : "");
  }

  /* ---------------------------------------------------------------- what Studio saves with a photo */
  PT.studio.meta = function () {
    const a = A(), d = S.now; if (!d) return null;
    return Object.assign({}, d, { locked: S.lock.slice(), date: PT.ds(), guides: Object.keys(guides(a)).filter(k => guides(a)[k]) });
  };
  try {
    if (typeof PhotoDB !== "undefined" && PhotoDB && typeof PhotoDB.put === "function") {
      const oPut = PhotoDB.put;
      PhotoDB.put = function (rec) {
        try { const o = $("pt-cam"); if (rec && !rec.studio && o && o.classList.contains("pt-studio-on")) { const m = PT.studio.meta(); if (m) rec.studio = m; } } catch (e) { }
        return oPut.apply(this, arguments);
      };
    }
  } catch (e) { }

  /* ---------------------------------------------------------------- the checklist sheet */
  const LIST = [
    ["Light", [["l1", "The same lights are on and off as last time (window, ceiling light, lamp)"], ["l2", "Curtains or blinds are in the same position"], ["l3", "The light is on the same side of me and the same distance away"], ["l4", "Nothing else changed: TV, a door, a new lamp"]]],
    ["Spot and background", [["s1", "I am standing on the same mark (tape on the floor helps)"], ["s2", "Plain wall behind me and nothing new in the picture"]]],
    ["Phone", [["p1", "Same height and distance. Chest height and about 2 m (6 ft) is a good start"], ["p2", "Same camera, lens wiped and no zoom"], ["p3", "Exposure and white balance locked (🔒 Lock look in the camera)"]]],
    ["Me", [["m1", "Same time of day and the same food and water state"], ["m2", "Same pump: before training or after, every time"], ["m3", "Same pose order: relaxed front, side, back"]]]
  ];
  const today = () => PT.ds();
  const checks = a => { const s = st(a); if (!s.checks || s.checks.ds !== today()) s.checks = { ds: today(), done: {} }; return s.checks; };
  const listCount = a => { const c = checks(a); return Object.keys(c.done).filter(k => c.done[k]).length + " of " + LIST.reduce((n, g) => n + g[1].length, 0) + " ticked today"; };
  function openList() {
    const a = A(), s = st(a), c = checks(a), r = s.recipe || {}, el = K.sheet("pt-studio", 120);
    const total = LIST.reduce((n, g) => n + g[1].length, 0), done = Object.keys(c.done).filter(k => c.done[k]).length;
    const look = s.look ? `Saved ${PT.fmtDate(s.look.ds, { month: "short", day: "numeric" })}: ${esc((s.look.locked || []).join(", ") || "nothing locked")} (${s.look.facing === "user" ? "front" : "rear"} camera)` : "No saved look yet. Open the camera, choose Studio and tap Lock look.";
    K.openSheet(el, `${K.head("Studio setup", "Same room, same light, same photo")}
      <div class="pt-stl-bar"><span id="pt-stl-count">${done} of ${total} ticked today</span><button type="button" data-stl="clear" class="pt-stl-link">Clear ticks</button></div>
      ${LIST.map(([t, items]) => `<div class="pt-stl-g"><span class="pt-stl-h">${t}</span>${items.map(([id, txt]) => `<button type="button" class="pt-stl-i${c.done[id] ? " on" : ""}" data-stl-i="${id}" aria-pressed="${!!c.done[id]}"><i>${c.done[id] ? "✓" : ""}</i><span>${esc(txt)}</span></button>`).join("")}</div>`).join("")}
      <div class="pt-stl-g"><span class="pt-stl-h">My setup (so you can repeat it)</span>
        <label class="pt-stl-f"><span>Phone height</span><input data-stl-f="height" value="${esc(r.height || "")}" placeholder="chest height, on a shelf" maxlength="60"></label>
        <label class="pt-stl-f"><span>Distance to me</span><input data-stl-f="dist" value="${esc(r.dist || "")}" placeholder="2 m / 6 ft" maxlength="40"></label>
        <label class="pt-stl-f"><span>Light</span><input data-stl-f="light" value="${esc(r.light || "")}" placeholder="window on my left, ceiling light off" maxlength="80"></label></div>
      <div class="pt-stl-g"><span class="pt-stl-h">Saved look</span><p class="pt-stl-p">${look}</p>${s.look ? `<button type="button" data-stl="forget" class="pt-stl-link">Forget the saved look</button>` : ""}</div>
      <p class="pt-stl-p">The camera's light meter compares each shot with your last photo. Lock look asks the phone to hold exposure, white balance and focus; not every phone lets a web page do that, and the camera says so when it cannot.</p>`);
  }
  const guidesSheet = () => {
    const a = A(), g = guides(a), el = K.sheet("pt-studio-g", 121);
    K.openSheet(el, `${K.head("Guides", "What shows over the preview")}
      <div class="pt-stl-g">${[["thirds", "Rule-of-thirds grid and power points"], ["center", "Centre line (for lining up your spine)"], ["marks", "Head and feet marks"], ["level", "Level (phone tilt)"]].map(([k, t]) => `<button type="button" class="pt-stl-i${g[k] ? " on" : ""}" data-stg="${k}" aria-pressed="${!!g[k]}"><i>${g[k] ? "✓" : ""}</i><span>${t}</span></button>`).join("")}</div>`);
  };

  /* ---------------------------------------------------------------- clicks */
  document.addEventListener("click", async e => {
    const a = A(); if (!a || !e.target || !e.target.closest) return;
    const g = s => e.target.closest(s);
    if (g("#pt-st-btn")) { toggle(); return; }
    if (g("#pt-studio-open")) { openList(); return; }
    const b = g("[data-st]");
    if (b) {
      const k = b.dataset.st;
      if (k === "list") { openList(); return; }
      if (k === "guides") { guidesSheet(); return; }
      if (k === "lock") {
        if (S.lock.length) { await unlockLook(); S.lock = []; paint(); a.toast("Unlocked: the camera adjusts by itself again"); return; }
        const r = await lockLook();
        if (!r.ok) { a.toast(r.why === "unsupported" ? "This phone's browser can't lock exposure. The meter and checklist still work." : "The camera would not hold the look.", undefined, undefined, 4500); return; }
        S.lock = r.locked; st(a).look = { ds: today(), facing: facing(), locked: r.locked, values: r.values }; save(a); paint();
        a.toast("Locked: " + r.locked.join(", ") + ". Saved for next time.", undefined, undefined, 3500); return;
      }
      if (k === "saved") {
        const look = st(a).look; if (!look) { a.toast("No saved look yet. Tap Lock look once to save one."); return; }
        if (look.facing !== facing()) { a.toast("Your saved look is for the " + (look.facing === "user" ? "front" : "rear") + " camera. Flip the camera first."); return; }
        const r = await applyLook(look); if (!r.ok) { a.toast("This camera would not take the saved look."); return; }
        S.lock = r.locked; paint(); a.toast("Saved look is back: " + r.locked.join(", ")); return;
      }
    }
    const li = g("[data-stl-i]");
    if (li) {     // ticked in place, so the sheet does not jump
      const c = checks(a), id = li.dataset.stlI; c.done[id] = !c.done[id]; save(a);
      li.classList.toggle("on", !!c.done[id]); li.setAttribute("aria-pressed", String(!!c.done[id])); li.firstElementChild.textContent = c.done[id] ? "✓" : "";
      const bar = $("pt-stl-count"); if (bar) bar.textContent = listCount(a); return;
    }
    const sl = g("[data-stl]"); if (sl) { if (sl.dataset.stl === "clear") { checks(a).done = {}; save(a); openList(); } else if (sl.dataset.stl === "forget") { delete st(a).look; S.lock = []; save(a); openList(); } return; }
    const gg = g("[data-stg]"); if (gg) { const k = gg.dataset.stg, s = st(a); s.guides = Object.assign({}, guides(a)); s.guides[k] = !s.guides[k]; save(a); applyGuides(); if (k === "level") { if (s.guides.level && S.on) startLevel(); else { if (S.orient) window.removeEventListener("deviceorientation", S.orient); S.orient = null; const l = $("pt-st-level"); if (l) l.textContent = ""; } } gg.classList.toggle("on", !!s.guides[k]); gg.setAttribute("aria-pressed", String(!!s.guides[k])); gg.firstElementChild.textContent = s.guides[k] ? "✓" : ""; return; }
  });
  document.addEventListener("input", e => {
    const f = e.target && e.target.dataset && e.target.dataset.stlF; if (!f) return; const a = A(); if (!a) return;
    const s = st(a); s.recipe = Object.assign({}, s.recipe || {}); s.recipe[f] = e.target.value.slice(0, 80);
    clearTimeout(document.__stT); document.__stT = setTimeout(() => save(a), 400);
  });

  /* ---------------------------------------------------------------- watch for the camera */
  new MutationObserver(() => {
    const o = $("pt-cam");
    if (o && !o.__st) { o.__st = true; try { mount(o); } catch (e) { console.error("PulseTrack studio", e); } }
    else if (!o && (S.timer || S.orient || S.on)) unmount();
  }).observe(document.body, { childList: true });

  /* ---------------------------------------------------------------- Body: a way in without the camera */
  const proto = ApplicationUI.prototype, oBody = proto.renderBodyView;
  if (typeof oBody === "function") proto.renderBodyView = function () {
    const r = oBody.apply(this, arguments);
    try {
      const tools = document.querySelector("#body-root .pt-ptools");
      if (tools && !$("pt-studio-open")) { const b = document.createElement("button"); b.type = "button"; b.id = "pt-studio-open"; b.className = "pt-b"; b.textContent = "🎬 Studio setup"; tools.appendChild(b); }
    } catch (e) { console.error("PulseTrack studio", e); }
    return r;
  };

  const css = document.createElement("style");
  css.id = "pt-v246-studio-css";
  css.textContent = `
    #pt-cam .pt-cam-bot { display: grid; grid-template-columns: 1fr auto 1fr; } #pt-cam-timer { justify-self: start; } #pt-st-btn { justify-self: end; }
    #pt-cam #pt-st-btn[aria-pressed=true] { background: rgb(var(--a600)); }
    body.pt-cam-on #pt-toast { z-index: 500 !important; }
    .pt-st { position: absolute; inset: 0; pointer-events: none; }
    .pt-st.hidden { display: none; }
    .pt-st-lines i, .pt-st-lines b { position: absolute; display: block; }
    .pt-st-lines .h1, .pt-st-lines .h2 { left: 0; right: 0; height: 1px; background: rgb(255 255 255 / .45); } .pt-st-lines .h1 { top: 33.3%; } .pt-st-lines .h2 { top: 66.6%; }
    .pt-st-lines .c { top: 0; bottom: 0; left: 50%; width: 0; border-left: 1px dashed rgb(var(--a400)); }
    .pt-st-lines .m1, .pt-st-lines .m2 { left: 30%; right: 30%; height: 0; border-top: 2px solid rgb(var(--a400)); } .pt-st-lines .m1 { top: calc(env(safe-area-inset-top, 0px) + 4.5rem); } .pt-st-lines .m2 { bottom: calc(env(safe-area-inset-bottom, 0px) + 6.95rem); }
    .pt-st-lines b { width: .55rem; height: .55rem; margin: -.275rem 0 0 -.275rem; border-radius: 50%; border: 2px solid rgb(var(--a400)); }
    .pt-st-lines .p1 { left: 33.3%; top: 33.3%; } .pt-st-lines .p2 { left: 66.6%; top: 33.3%; } .pt-st-lines .p3 { left: 33.3%; top: 66.6%; } .pt-st-lines .p4 { left: 66.6%; top: 66.6%; }
    .pt-st.no-thirds .h1, .pt-st.no-thirds .h2, .pt-st.no-thirds .p1, .pt-st.no-thirds .p2, .pt-st.no-thirds .p3, .pt-st.no-thirds .p4 { display: none; }
    .pt-st.no-center .c, .pt-st.no-marks .m1, .pt-st.no-marks .m2, .pt-st.no-level .pt-st-level { display: none; }
    #pt-cam.pt-studio-on .pt-cam-grid { display: none; }
    .pt-st-level { position: absolute; top: calc(env(safe-area-inset-top, 0px) + 5.1rem); left: 50%; transform: translateX(-50%); padding: .3rem .7rem; border-radius: 999px; background: rgb(0 0 0 / .55); color: #fbbf24; font-size: .72rem; font-weight: 800; white-space: nowrap; }
    .pt-st-level:empty { display: none; } .pt-st-level.ok { color: rgb(var(--a400)); }
    .pt-st-panel { position: absolute; left: .6rem; right: .6rem; bottom: calc(env(safe-area-inset-bottom, 0px) + 7.6rem); display: grid; gap: .4rem; pointer-events: auto; }
    .pt-st-meter { display: flex; flex-wrap: wrap; gap: .35rem; font-size: .7rem; color: #fff; } .pt-st-meter span { padding: .25rem .55rem; border-radius: 999px; background: rgb(0 0 0 / .6); } .pt-st-meter .warn { color: #fbbf24; }
    .pt-st-score.good { background: rgb(var(--a600)); } .pt-st-score.mid { background: #b45309; } .pt-st-score.bad { background: #be123c; }
    .pt-st-note { font-size: .72rem; line-height: 1.35; color: #fff; text-shadow: 0 1px 4px #000; min-height: 1rem; }
    .pt-st-dock { display: flex; gap: .35rem; overflow-x: auto; } #pt-cam .pt-st-chip { flex: none; font-size: .72rem; padding: .5rem .7rem; min-height: 2.4rem; }
    .pt-stl-bar { display: flex; justify-content: space-between; align-items: center; font-size: .75rem; color: rgb(var(--z400)); } .pt-stl-link { font-size: .72rem; font-weight: 700; text-decoration: underline; color: rgb(var(--z400)); }
    .pt-stl-g { display: grid; gap: .4rem; } .pt-stl-h { font-size: .6rem; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: rgb(var(--z500)); }
    .pt-stl-i { display: flex; align-items: center; gap: .7rem; text-align: left; padding: .6rem .75rem; border-radius: .85rem; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); }
    .pt-stl-i i { flex: none; width: 1.4rem; height: 1.4rem; border-radius: 50%; border: 2px solid rgb(var(--z600)); display: grid; place-items: center; font-style: normal; font-size: .75rem; font-weight: 900; color: #fff; }
    .pt-stl-i.on i { background: rgb(var(--a600)); border-color: transparent; } .pt-stl-i span { font-size: .78rem; line-height: 1.35; color: rgb(var(--z200)); } .pt-stl-i.on span { color: rgb(var(--z400)); }
    .pt-stl-f { display: grid; gap: .25rem; } .pt-stl-f span { font-size: .68rem; color: rgb(var(--z400)); font-weight: 700; }
    .pt-stl-f input { padding: .6rem .7rem; border-radius: .7rem; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); color: rgb(var(--z100)); font-size: .82rem; }
    .pt-stl-p { font-size: .72rem; line-height: 1.45; color: rgb(var(--z400)); }
  `;
  document.head.appendChild(css);
})();
  