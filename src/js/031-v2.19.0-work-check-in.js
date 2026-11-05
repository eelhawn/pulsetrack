
/* =====================================================================
 * PulseTrack 2.19.0 (part 2): work check-in.
 *  A Home card asks how hard work was today (Light or off / Normal / Heavy) and remembers it per day (settings.workLoad, in backups).
 *  - A HEAVY day counts in the recovery map as extra sets for lower back, grip, legs, shoulders and traps, so the Muscles tab,
 *    the "still recovering" hint on a workout and "Build me a workout" all know that your back is tired.
 *  - On a heavy day the suggested weight for those muscles stays where it was instead of going up (switch: Settings -> Workout Screen).
 *  - Light and Normal days are only a record; nothing changes.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  const proto = ApplicationUI.prototype;
  const A = () => window.app;
  const DAY = 86400000;
  const SLIM = "bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3";
  const LEVELS = [{ v: 1, label: "Light or off" }, { v: 2, label: "Normal" }, { v: 3, label: "Heavy" }];
  // what one heavy day counts as, in hard sets, for the recovery map
  const HEAVY = { lowerback: 4, forearms: 4, quads: 3, hamstrings: 3, glutes: 3, shoulders: 2, traps: 2, back: 2 };
  const EASE = new Set(Object.keys(HEAVY));
  PT.workWeights = HEAVY;     // read by the week reshuffle (m69a.js)
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

  const store = a => (a.settings.workLoad && typeof a.settings.workLoad === "object" ? a.settings.workLoad : (a.settings.workLoad = {}));
  PT.workLevel = (ds, a) => { a = a || A(); const v = a && a.settings && a.settings.workLoad ? a.settings.workLoad[ds] : 0; return v === 1 || v === 2 || v === 3 ? v : 0; };
  PT.setWorkLevel = (ds, v, a) => {
    a = a || A(); if (!a) return;
    const s = store(a);
    if (v === 1 || v === 2 || v === 3) s[ds] = v; else delete s[ds];
    WorkoutStorage.saveSettings(a.settings);
  };
  PT.workHeavyToday = a => PT.workLevel(PT.ds(), a) === 3;
  /** True when this lift should not go up in weight today: a heavy work day, and a muscle that work beats up. */
  PT.workEaseFor = name => {
    const a = A(); if (!a || !PT.opt || !PT.opt("workEase")) return false;
    if (!PT.workHeavyToday(a)) return false;
    let regs = {};
    try { regs = PT.regionsFor(name, false) || {}; } catch (e) { regs = {}; }
    return Object.keys(regs).some(r => EASE.has(r));
  };
  /** Heavy work days of the last 14 days as pretend sessions for PT.recovery. */
  PT.workSessions = (now, app) => {
    const a = app || A(); if (!a || !a.settings || !a.settings.workLoad) return [];
    now = now || Date.now();
    const out = [];
    Object.keys(a.settings.workLoad).forEach(ds => {
      if (a.settings.workLoad[ds] !== 3) return;
      const d = PT.fromDs(ds); if (!d || isNaN(d.getTime())) return;
      let t = d.getTime() + 17 * 3600000;        // work ends about 5 pm; marked earlier than that, it counts from now
      if (t > now) t = now;
      if (t < now - 14 * DAY) return;
      out.push({ ts: t, regs: Object.assign({}, HEAVY), work: true });
    });
    return out;
  };

  /* ------------------------------------------------------------------ the Home card */
  let off = 0;     // 0 = today, 1 = yesterday
  function workCard(a) {
    const box = document.getElementById("home-work"); if (!box) return;
    const ds = PT.ds(addDays(new Date(), -off)), cur = PT.workLevel(ds, a), ease = PT.opt("workEase");
    const note = cur === 3
      ? (ease ? "Heavy day. Your back, legs and grip count as worked in the recovery map, and lifts for them keep their weight today."
        : "Heavy day. Your back, legs and grip count as worked in the recovery map.")
      : "";
    box.className = SLIM + " space-y-2";
    box.innerHTML = `<div class="flex items-center gap-3"><div class="shrink-0 leading-tight"><h4 class="pt-eyebrow">Work ${off ? "yesterday" : "today"}</h4>
      <button type="button" id="pt-work-day" class="text-[10px] font-semibold text-zinc-500 underline tap-active mt-1">${off ? "Back to today" : "Yesterday?"}</button></div>
      <div class="grid grid-cols-3 gap-1.5 flex-1 min-w-0">${LEVELS.map(l => `<button type="button" data-wl="${l.v}" aria-pressed="${cur === l.v}" class="pt-opt tap-active text-center">${l.label}</button>`).join("")}</div></div>
      ${note ? `<p class="text-[11px] leading-relaxed text-zinc-400">${note}</p>` : ""}`;
  }
  const oHome = proto.renderHomeView;
  proto.renderHomeView = function () {
    const r = oHome.apply(this, arguments);
    try { workCard(this); } catch (e) { console.error("PulseTrack work card", e); }
    return r;
  };
  document.addEventListener("click", e => {
    const a = A(); if (!a || !e.target.closest) return;
    const chip = e.target.closest("#home-work [data-wl]");
    if (chip) {
      const v = parseInt(chip.dataset.wl, 10), ds = PT.ds(addDays(new Date(), -off));
      PT.setWorkLevel(ds, PT.workLevel(ds, a) === v ? 0 : v, a);     // tap the same one again to clear it
      workCard(a);
      return;
    }
    if (e.target.closest("#pt-work-day")) { off = off ? 0 : 1; workCard(a); }
  });

  // the recovery list says where the extra load comes from
  const oList = proto.recoveryListHtml;
  if (typeof oList === "function") {
    proto.recoveryListHtml = function () {
      const html = oList.apply(this, arguments);
      try {
        if (PT.workSessions(Date.now(), this).length) return html + `<p class="text-[10px] text-zinc-500 leading-relaxed">Your heavy work days count here as extra sets for back, legs and grip.</p>`;
      } catch (e) { }
      return html;
    };
  }
})();
  