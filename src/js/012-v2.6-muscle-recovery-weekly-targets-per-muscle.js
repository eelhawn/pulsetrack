
    /* =====================================================================
     * PulseTrack 2.6 (part 1): muscle recovery, weekly targets per muscle,
     * plateau tips, balance check, Progress tabs.
     * ===================================================================== */
    (function () {
      "use strict";
      const A = () => window.app;
      const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
      const DAY = 86400000, HR = 3600000;
      const proto = ApplicationUI.prototype;
      const regLabel = r => (typeof MAP_REGIONS !== "undefined" && MAP_REGIONS[r]) || r;
      const SHORT = { back: "Back", abs: "Abs & core", lowerback: "Lower back" };
      const rowLabel = r => SHORT[r] || regLabel(r);
      const num = (v, d) => PT.num(v, d == null ? (v % 1 ? 1 : 0) : d);
      const sessionTime = s => s.ts || (PT.fromDs(s.date).getTime() + 12 * HR);
      const card = "bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3";

      /* ---------------------------------------------------------------- recovery */
      const SIZE = { chest: "big", back: "big", quads: "big", hamstrings: "big", glutes: "big", lowerback: "big", shoulders: "mid", traps: "mid", biceps: "small", triceps: "small", forearms: "small", calves: "small", abs: "small" };
      const REC = { big: [36, 4, 84], mid: [30, 4, 72], small: [24, 4, 60] };   // base hours, hours per set, cap
      const needHours = (r, sets) => { const [b, k, cap] = REC[SIZE[r] || "mid"]; return Math.min(cap, b + k * sets); };

      /** For every muscle trained in the last 14 days: how recovered it is (0-100) and when it will be ready. */
      PT.recovery = function (now, appArg) {
        now = now || Date.now();
        const app = appArg || A() || {}, per = {};
        (app.sessions || []).concat(PT.workSessions ? PT.workSessions(now, app) : []).forEach(s => {
          const t = sessionTime(s);
          if (!(t > now - 14 * DAY) || t > now + HR) return;
          const acc = {};
          if (s.regs) Object.keys(s.regs).forEach(r => { acc[r] = (acc[r] || 0) + s.regs[r]; });
          (s.ex || []).forEach(e => {
            const n = (e.sets || []).filter(st => st.t !== "W").length; if (!n) return;
            const regs = PT.regionsFor(e.name, true);
            Object.keys(regs).forEach(r => { acc[r] = (acc[r] || 0) + n * regs[r]; });
          });
          Object.keys(acc).forEach(r => { (per[r] = per[r] || []).push({ t, sets: acc[r], work: !!s.work }); });
        });
        const out = {};
        Object.keys(per).forEach(r => {
          const arr = per[r].sort((a, b) => b.t - a.t), last = arr[0], prev = arr[1];
          let sets = last.sets;
          if (prev && last.t - prev.t < 2 * DAY) sets += 0.5 * prev.sets;     // trained twice in a row: needs longer
          const need = needHours(r, sets), since = Math.max(0, (now - last.t) / HR);
          out[r] = { pct: Math.max(0, Math.min(100, Math.round(since / need * 100))), since, need, left: Math.max(0, need - since), sets: Math.round(last.sets * 10) / 10, last: last.t, work: !!last.work };
        });
        return out;
      };
      const rstat = pct => pct < 35 ? { k: "fatigued", label: "Just trained", color: "#f43f5e" } : pct < 90 ? { k: "recovering", label: "Recovering", color: "#f59e0b" } : { k: "ready", label: "Ready", color: PT.accent() };
      const fmtLeft = h => h < 1 ? "under an hour" : h < 36 ? "about " + Math.round(h) + " h" : "about " + (Math.round(h / 24 * 2) / 2) + " days";
      const ago = h => h < 1 ? "just now" : h < 36 ? Math.round(h) + " h ago" : Math.round(h / 24) + " days ago";
      PT.rstat = rstat;

      /** Muscles an upcoming day will hit hardest, and how recovered each one is. */
      PT.dayReadiness = function (day, appArg) {
        const rec = PT.recovery(null, appArg), want = {};
        ((day && day.exercises) || []).forEach(ex => {
          const regs = PT.regionsFor(ex.name, false), n = parseInt(ex.sets, 10) || 0;
          Object.keys(regs).forEach(r => { want[r] = (want[r] || 0) + n * regs[r]; });
        });
        const main = Object.keys(want).filter(r => want[r] >= 3);
        const tired = main.filter(r => rec[r] && rec[r].pct < 60).sort((a, b) => rec[a].pct - rec[b].pct);
        const known = main.filter(r => rec[r]);
        return { tired: tired.map(r => ({ r, pct: rec[r].pct, left: rec[r].left })), known: known.length, main: main.length, rec };
      };

      /* ---------------------------------------------------------------- weekly targets */
      const ORDER = ["chest", "back", "shoulders", "biceps", "triceps", "forearms", "abs", "traps", "lowerback", "quads", "hamstrings", "glutes", "calves"];
      const DEF = { chest: [8, 20], back: [8, 22], shoulders: [8, 22], biceps: [6, 20], triceps: [6, 18], forearms: [0, 12], abs: [4, 20], traps: [4, 16], lowerback: [0, 10], quads: [6, 18], hamstrings: [4, 14], glutes: [4, 14], calves: [6, 16] };
      PT.targetDefaults = DEF;
      PT.targetFor = r => {
        const o = (((A() || {}).settings || {}).setTargets || {})[r];
        if (Array.isArray(o) && o.length === 2 && o[0] >= 0 && o[1] > o[0]) return [o[0], o[1]];
        return DEF[r] || [6, 20];
      };
      const tstat = (v, r) => { const [lo, hi] = PT.targetFor(r); return v > hi ? "high" : (lo > 0 && v < lo) ? "under" : v > 0 || lo === 0 ? "ok" : "under"; };
      const TCOL = { under: "bg-amber-500", ok: "bg-emerald-500", high: "bg-rose-500" };

      const segBtn = (cls, k, t, cur) => `<button type="button" class="${cls} px-2.5 py-1 rounded-lg text-[11px] font-bold tap-active ${cur === k ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-400"}" data-k="${k}">${t}</button>`;
      const dot = (col, t) => `<span class="inline-flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full inline-block" style="background:${col}"></span>${t}</span>`;

      /* the old handler finds this button by id; it lives under the list in Sets view and stays hidden in Recovery view */
      function helpersBtn(hidden) {
        const on = !!((A() || {}).settings || {}).helperSets;
        return `<button id="prog-helpers" class="${hidden ? "hidden " : ""}shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-bold tap-active ${on ? "bg-purple-600 text-white" : "bg-zinc-800 text-zinc-400"}" aria-pressed="${on}">½ Helpers ${on ? "on" : "off"}</button>`;
      }
      proto.regionTargetsHtml = function (vals, prev) {
        const max = Math.max(24, ...ORDER.map(r => Math.max(PT.targetFor(r)[1], vals[r] || 0)));
        const rows = ORDER.map(r => {
          const v = vals[r] || 0, [lo, hi] = PT.targetFor(r), st = tstat(v, r);
          const d = prev ? Math.round((v - (prev[r] || 0)) * 10) / 10 : null;
          return `<button type="button" class="pt-tg-row w-full flex items-center gap-2 text-xs tap-active" data-r="${r}" aria-label="${esc(regLabel(r))}: ${num(v)} sets, target ${lo} to ${hi}. Tap to change.">
            <span class="w-[5.6rem] shrink-0 text-left text-zinc-300 font-semibold truncate">${esc(rowLabel(r))}</span>
            <span class="relative flex-grow h-3.5 bg-zinc-800 rounded-full overflow-hidden">
              <span class="absolute inset-y-0 bg-zinc-600/40" style="left:${lo / max * 100}%;width:${(hi - lo) / max * 100}%"></span>
              <span class="absolute inset-y-0 left-0 rounded-full ${v ? TCOL[st] : ""}" style="width:${Math.min(100, v / max * 100)}%"></span>
            </span>
            <span class="w-7 text-right font-mono ${v ? "text-zinc-100" : "text-zinc-600"}">${num(v)}</span>
            ${d === null ? "" : `<span class="w-7 text-right font-mono text-[10px] ${d > 0 ? "text-emerald-400" : d < 0 ? "text-rose-400" : "text-zinc-600"}">${d > 0 ? "+" : ""}${num(d)}</span>`}
          </button>`;
        }).join("");
        const mode = this.progressWeekMode;
        const behind = ORDER.filter(r => PT.targetFor(r)[0] > 0 && (vals[r] || 0) < PT.targetFor(r)[0]).sort((a, b) => (PT.targetFor(b)[0] - (vals[b] || 0)) - (PT.targetFor(a)[0] - (vals[a] || 0)));
        const over = ORDER.filter(r => (vals[r] || 0) > PT.targetFor(r)[1]);
        const onN = ORDER.filter(r => tstat(vals[r] || 0, r) === "ok" && (vals[r] || 0) > 0).length;
        let msg = "";
        if (this.sessions.length) {
          msg = `<span class="text-zinc-100 font-semibold">${onN} of ${ORDER.length} muscles in their target range${mode === "this" ? " so far this week" : mode === "avg" ? " on average" : ""}.</span>`;
          if (behind.length) msg += ` <span class="text-amber-300">${behind.length > 3 ? "Furthest from target" : "Below target"}: ${behind.slice(0, 3).map(r => esc(regLabel(r))).join(", ")}.</span>`;
          if (over.length) msg += ` <span class="text-rose-300">Above range: ${over.map(r => esc(regLabel(r))).join(", ")}.</span>`;
        }
        return `<div class="space-y-1.5" id="pt-targets">${rows}</div>
          ${msg ? `<p class="text-[11px] leading-relaxed text-zinc-300 bg-zinc-950 border border-zinc-800 rounded-xl p-2.5">${msg}${prev ? ` <span class="text-zinc-500">Small +/− numbers compare with last week.</span>` : ""}</p>` : ""}
          <div class="flex items-start gap-2"><p class="flex-1 text-[10px] text-zinc-500 leading-relaxed">Hard sets per week (warm-ups left out). The grey zone on each bar is a typical range for that muscle, based on common training-volume guidelines. It is a starting point, not a rule. Tap a muscle to set your own range. ${this.settings.helperSets ? "Helpers on: assisting muscles get ½ a set." : "Each lift counts for its main muscle."}</p>${helpersBtn(false)}</div>`;
      };

      proto.muscleCardHtml = function (seg, label) {
        const mode = this._mapMode === "recovery" ? "recovery" : "sets";
        const pm = this.progressWeekMode;
        const vals = this.regionSetsForMode(pm);
        const prev = pm === "this" ? this.regionSetsForMode("last") : null;
        const toggle = `<div class="flex gap-1">${segBtn("mm-mode", "sets", "Sets", mode)}${segBtn("mm-mode", "recovery", "Recovery", mode)}</div>`;
        const helpers = helpersBtn(true);
        let inner;
        if (mode === "sets") {
          inner = `<div class="flex flex-wrap items-center gap-1.5">${seg("this", "This week")}${seg("last", "Last week")}${seg("avg", "4-wk avg")}</div>
            <p id="pt-week-range" class="text-[11px] text-zinc-500 -mt-1">${PT.weekRangeText(pm)}</p>
            ${this.muscleMapHtml()}${this.regionTargetsHtml(vals, prev)}`;
        } else {
          inner = `<div class="hidden">${seg("this", "")}${helpers}</div>${this.muscleMapHtml()}${this.recoveryListHtml()}`;
        }
        return `<div class="${card}" id="pt-muscle-card" data-mm="${mode}">
          <div class="flex items-center justify-between gap-2"><h3 class="text-xs font-bold text-white">${mode === "sets" ? "Weekly sets per muscle" : "Muscle recovery"}</h3>${toggle}</div>
          ${inner}</div>`;
      };

      proto.recoveryListHtml = function () {
        const rec = PT.recovery(), keys = Object.keys(rec);
        if (!keys.length) return `<p class="text-xs text-zinc-400 bg-zinc-950 border border-zinc-800 rounded-xl p-3">Finish a workout and this map shows which muscles are fresh and which are still recovering. It looks at the last two weeks.</p>`;
        const tired = keys.filter(r => rec[r].pct < 90).sort((a, b) => rec[a].pct - rec[b].pct);
        const ready = keys.filter(r => rec[r].pct >= 90).sort((a, b) => rec[b].since - rec[a].since);
        const untouched = ORDER.filter(r => !rec[r] && r !== "lowerback" && r !== "forearms");
        const row = r => { const x = rec[r], s = rstat(x.pct);
          return `<div class="flex items-center gap-2 text-xs"><span class="w-[5.6rem] shrink-0 text-zinc-300 font-semibold truncate">${esc(rowLabel(r))}</span>
            <span class="flex-grow h-2.5 rounded-full bg-zinc-800 overflow-hidden"><span class="block h-2.5 rounded-full" style="width:${Math.max(4, x.pct)}%;background:${s.color}"></span></span>
            <span class="w-24 text-right text-[10px] text-zinc-400">${x.pct}% · ${fmtLeft(x.left)}</span></div>`; };
        return `<div class="space-y-3">
          ${tired.length ? `<div class="space-y-1.5"><span class="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Still recovering</span>${tired.map(row).join("")}</div>` : `<p class="text-xs text-emerald-300 bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-2.5">Everything you trained recently is recovered. Good to go.</p>`}
          ${ready.length ? `<div class="space-y-1.5"><span class="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Ready to train</span><div class="flex flex-wrap gap-1.5">${ready.map(r => `<span class="px-2 py-1 rounded-lg text-[11px] font-semibold bg-zinc-950 border border-zinc-800 text-zinc-200">${esc(regLabel(r))} <span class="text-zinc-500">· ${ago(rec[r].since)}</span></span>`).join("")}</div></div>` : ""}
          ${untouched.length ? `<p class="text-[11px] text-zinc-500">Not trained in 2 weeks: ${untouched.map(r => esc(regLabel(r))).join(", ")}.</p>` : ""}
          <p class="text-[10px] text-zinc-500 leading-relaxed">An estimate from how many hard sets each muscle got and when. More sets take longer to recover from (about 1 to 3.5 days), and small muscles recover faster than big ones. Everyone is different, so use it as a guide, not a rule.</p></div>`;
      };

      /* map: the Sets view colours by each muscle's own target; the Recovery view colours by readiness */
      const oMapHtml = proto.muscleMapHtml, oBindMap = proto.bindMuscleMap, oRegionColor = proto.regionColor;
      proto.regionColor = function (v) {
        if (this._mapMode === "recovery" && this._mapDrawing) {
          if (!(v > 0)) return "#3f3f46";
          return rstat(v - 1).color;
        }
        return oRegionColor.call(this, v);
      };
      proto.muscleMapHtml = function () {
        const mode = this._mapMode === "recovery" ? "recovery" : "sets";
        if (mode === "recovery") {
          const rec = PT.recovery(), vals = {};
          Object.keys(rec).forEach(r => { vals[r] = rec[r].pct + 1; });
          this._mapVals = vals; this._recInfo = rec;
          this._mapDrawing = true;
          const svg = this.muscleMapSvg(vals);
          this._mapDrawing = false;
          return `<div class="space-y-2">${svg}<div id="mm-info" class="text-center text-[11px] text-zinc-400 min-h-[1rem]">Tap a muscle to see how recovered it is</div>
            <div class="flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] text-zinc-400">${dot("#3f3f46", "not trained lately")}${dot("#f43f5e", "just trained")}${dot("#f59e0b", "recovering")}${dot(PT.accent(), "ready")}</div></div>`;
        }
        const real = this.regionSetsForMode(this.progressWeekMode), norm = {};
        Object.keys(real).forEach(r => { const v = real[r]; if (!(v > 0)) return; const [lo, hi] = PT.targetFor(r); norm[r] = (lo > 0 && v < lo) ? 5 : v > hi ? 25 : 15; });
        this._mapVals = real;
        return `<div class="space-y-2">${this.muscleMapSvg(norm)}<div id="mm-info" class="text-center text-[11px] text-zinc-400 min-h-[1rem]">Tap a muscle to see its sets</div>
          <div class="flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] text-zinc-400">${dot("#3f3f46", "none")}${dot("#f59e0b", "below target")}${dot(PT.accent(), "on target")}${dot("#f43f5e", "above range")}</div></div>`;
      };
      proto.bindMuscleMap = function (root) {
        const info = root.querySelector("#mm-info");
        if (this._mapMode === "recovery") {
          if (!info) return;
          root.querySelectorAll(".mm-r").forEach(el => el.addEventListener("click", () => {
            const r = el.dataset.r, x = (this._recInfo || {})[r];
            root.querySelectorAll(".mm-r").forEach(y => y.setAttribute("stroke", y.dataset.r === r ? "#ffffff" : "#09090b"));
            info.innerHTML = x ? `<b class="text-white">${esc(regLabel(r))}</b> · ${x.pct}% recovered · ${x.work ? "heavy work day" : num(x.sets) + " set" + (x.sets === 1 ? "" : "s")} ${ago(x.since)}${x.left > 0 ? ` · ready in ${fmtLeft(x.left)}` : " · ready"}`
              : `<b class="text-white">${esc(regLabel(r))}</b> · not trained in the last 2 weeks`;
          }));
          return;
        }
        oBindMap.call(this, root);
        if (!info) return;
        root.querySelectorAll(".mm-r").forEach(el => el.addEventListener("click", () => { const [lo, hi] = PT.targetFor(el.dataset.r); info.innerHTML += ` <span class="text-zinc-500">· target ${lo}–${hi}</span>`; }));
      };

      /* Edit one muscle's weekly range */
      function openTargetSheet(r) {
        const K = PT.kit, el = K.sheet("pt-tg", 70), [lo, hi] = PT.targetFor(r), def = DEF[r] || [6, 20];
        const card = K.openSheet(el, `${K.head("Weekly target: " + regLabel(r), "Hard sets per week you want this muscle to get.")}
          <div class="grid grid-cols-2 gap-3">
            <label class="block">${K.lab("At least")}<input id="pt-tg-lo" type="number" inputmode="numeric" min="0" max="60" value="${lo}" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-3 text-base font-mono font-bold text-white text-center focus:outline-none focus:border-emerald-500"></label>
            <label class="block">${K.lab("No more than")}<input id="pt-tg-hi" type="number" inputmode="numeric" min="1" max="80" value="${hi}" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-3 text-base font-mono font-bold text-white text-center focus:outline-none focus:border-emerald-500"></label>
          </div>
          <p id="pt-tg-err" class="hidden text-xs font-semibold text-rose-400"></p>
          <p class="text-[11px] text-zinc-500">Typical for this muscle: ${def[0]}–${def[1]} sets.</p>
          <div class="grid grid-cols-3 gap-2"><button type="button" data-close class="py-3 rounded-xl bg-zinc-800 text-zinc-200 text-sm font-bold tap-active">Cancel</button>
            <button type="button" id="pt-tg-def" class="py-3 rounded-xl bg-zinc-800 text-zinc-200 text-sm font-bold tap-active">Default</button>
            <button type="button" id="pt-tg-save" class="py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold tap-active">Save</button></div>`);
        const app = A(), done = () => { K.closeSheet(el); if (!document.getElementById("view-progress").classList.contains("hidden")) app.renderProgressView(); };
        card.querySelector("#pt-tg-def").addEventListener("click", () => { const t = Object.assign({}, app.settings.setTargets); delete t[r]; app.settings.setTargets = t; WorkoutStorage.saveSettings(app.settings); done(); });
        card.querySelector("#pt-tg-save").addEventListener("click", () => {
          const a = parseInt(card.querySelector("#pt-tg-lo").value, 10), b = parseInt(card.querySelector("#pt-tg-hi").value, 10);
          const err = card.querySelector("#pt-tg-err");
          if (!(a >= 0) || !(b > a)) { err.textContent = "The top number has to be bigger than the bottom one."; err.classList.remove("hidden"); return; }
          app.settings.setTargets = Object.assign({}, app.settings.setTargets, { [r]: [a, b] });
          WorkoutStorage.saveSettings(app.settings); done();
        });
      }

      /* ---------------------------------------------------------------- plateau tips */
      const jump = () => (A().unit() === "kg" ? "1 kg" : "2.5 lb");
      /** null when the lift is moving; otherwise how long it has been stuck and what to try. */
      PT.plateau = function (name) {
        const app = A();
        const s = app.exerciseSeries(name).filter(p => p.best > 0);
        if (s.length < 4 || !app.isStalled(name)) return null;
        const recent = s.slice(-3), before = s.slice(0, -3);
        const bestBefore = Math.max(...before.map(p => p.best));
        let idx = -1; s.forEach((p, i) => { if (p.best >= bestBefore - 1e-9) idx = i; });
        const stuck = s.length - 1 - idx;
        const last = recent[2], drop = last.best < bestBefore * 0.95;
        const tw = recent.map(p => p.topW), twMax = Math.max(...tw), sameW = twMax > 0 && (twMax - Math.min(...tw)) <= twMax * 0.01;
        const repsAt = p => Math.max(0, ...(p.sets || []).filter(st => st.t !== "W" && (parseFloat(st.w) || 0) >= twMax * 0.97).map(st => parseFloat(st.r) || 0));
        const reps = recent.map(repsAt);
        let kind, tip;
        if (drop) { kind = "drop"; tip = `Down ${Math.round((1 - last.best / bestBefore) * 100)}% from your best. Check sleep and food, and consider a lighter week.`; }
        else if (sameW && reps[2] > reps[0]) { kind = "reps"; tip = "Same weight, but reps are climbing. Keep going, then add weight when you reach the top of the rep range."; }
        else if (sameW) { kind = "same"; tip = `Same weight for 3 sessions. Add a rep to every set before adding weight, or try a smaller jump (${jump()}).`; }
        else if (tw[2] > tw[0] && reps[2] < reps[0]) { kind = "heavier"; tip = "You added weight but lost reps. Stay at this weight until the reps come back."; }
        else { kind = "flat"; tip = "Try a small weight drop, a different rep range, or a similar exercise for a few weeks."; }
        return { kind, tip, stuck: Math.max(3, stuck), best: bestBefore, now: last.best };
      };
      PT.plateauTip = name => { const p = PT.plateau(name); return p ? p.tip : "No strength gain in your last 3 sessions. Consider a lighter week or a variation."; };

      proto.plateauCardHtml = function (stalled) {
        const u = this.wLabel();
        const items = stalled.map(n => ({ n, p: PT.plateau(n) })).filter(x => x.p);
        let body;
        if (!items.length) body = `<p class="text-xs text-zinc-400">Nothing is stuck right now. Lifts need 4 or more saved sessions before they are checked.</p>`;
        else body = `<div class="space-y-2">${items.map(({ n, p }) => `<button type="button" class="pr-ex w-full text-left rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2.5 tap-active" data-name="${esc(n)}">
            <span class="flex items-center justify-between gap-2"><span class="text-xs font-bold text-amber-300 truncate">⚠ ${esc(n)}</span><span class="text-[10px] font-mono text-zinc-500 shrink-0">${p.stuck} sessions</span></span>
            <span class="block text-[11px] text-zinc-400 mt-1 leading-snug">${esc(p.tip)}</span>
            <span class="block text-[10px] text-zinc-500 mt-1 font-mono">best est. 1RM ${num(p.best)} ${u} · last ${num(p.now)} ${u}</span></button>`).join("")}</div>
          ${items.length >= 3 ? `<p class="text-xs text-zinc-300 bg-zinc-950 border border-zinc-800 rounded-xl p-2.5">Several lifts are stuck at once. A <b>deload week</b> (same exercises, about half the sets, lighter weights) often helps you come back stronger.</p>` : ""}`;
        return `<div class="${card}" id="pt-plateau-card"><h3 class="text-xs font-bold text-white">Plateau check</h3>${body}</div>`;
      };

      /* ---------------------------------------------------------------- balance check */
      function mainSets(days) {
        const app = A(), now = Date.now(), from = now - days * DAY, out = {};
        (app.sessions || []).forEach(s => {
          const t = sessionTime(s); if (t < from || t > now + DAY) return;
          (s.ex || []).forEach(e => {
            const n = (e.sets || []).filter(st => st.t !== "W").length; if (!n) return;
            const regs = PT.regionsFor(e.name, false);
            Object.keys(regs).forEach(r => { out[r] = (out[r] || 0) + n * regs[r]; });
          });
        });
        return out;
      }
      const sum = (o, rs) => rs.reduce((a, r) => a + (o[r] || 0), 0);
      const PAIRS = [
        { id: "pushpull", a: ["Push", ["chest", "shoulders", "triceps"]], b: ["Pull", ["back", "biceps", "traps"]], lo: 0.75, hi: 1.7, lowMsg: "You are doing a lot more pushing than pulling. Add rows, pulldowns or rear-delt work to protect your shoulders.", highMsg: "Pulling is far ahead of pressing. Add a little chest, shoulder or triceps work." },
        { id: "legs", a: ["Quads", ["quads"]], b: ["Hams + glutes", ["hamstrings", "glutes"]], lo: 0.45, hi: 1.4, lowMsg: "Your quads get much more work than your hamstrings and glutes. Add curls, RDLs or hip thrusts.", highMsg: "Hamstrings and glutes get far more work than quads. Add squats, leg press or extensions." },
        { id: "updown", a: ["Upper body", ["chest", "back", "shoulders", "biceps", "triceps", "traps", "forearms"]], b: ["Lower body", ["quads", "hamstrings", "glutes", "calves"]], lo: 0.35, hi: 1.3, lowMsg: "Your lower body is getting very little compared with your upper body. Don't skip leg day.", highMsg: "Your lower body is getting far more than your upper body. Add some upper-body work." }
      ];
      PT.balance = function () {
        const d = mainSets(28), total = sum(d, Object.keys(d));
        return { total, rows: PAIRS.map(p => { const a = sum(d, p.a[1]) / 4, b = sum(d, p.b[1]) / 4; return { p, a, b, ratio: a > 0 ? b / a : (b > 0 ? 99 : 1) }; }) };
      };
      proto.balanceCardHtml = function () {
        const bal = PT.balance();
        let body;
        if (bal.total < 12) body = `<p class="text-xs text-zinc-400">Log a couple of weeks of workouts and this compares pushing with pulling, front of the legs with the back, and upper body with lower body.</p>`;
        else {
          body = `<div class="space-y-3">${bal.rows.map(({ p, a, b, ratio }) => {
            // for the "a vs b" bar, ratio = b / a (pull per push, hams per quad, lower per upper)
            const ok = ratio >= p.lo && ratio <= p.hi, pa = a + b ? a / (a + b) * 100 : 50;
            const msg = ok ? "Balanced" : ratio < p.lo ? p.a[0] + " ahead" : p.b[0] + " ahead";
            return `<div class="space-y-1.5"><div class="flex items-center justify-between text-[11px]"><span class="font-bold text-zinc-100">${p.a[0]} <span class="font-mono text-zinc-400">${num(a)}</span></span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${ok ? "bg-emerald-950 text-emerald-300 border border-emerald-800/50" : "bg-amber-950/60 text-amber-300 border border-amber-800/50"}">${msg}</span>
              <span class="font-bold text-zinc-100"><span class="font-mono text-zinc-400">${num(b)}</span> ${p.b[0]}</span></div>
              <div class="flex h-2.5 rounded-full overflow-hidden bg-zinc-800"><span style="width:${pa}%;background:${ok ? PT.accent() : "#f59e0b"}"></span><span class="opacity-45" style="width:${100 - pa}%;background:${ok ? PT.accent() : "#f59e0b"}"></span></div>
              ${ok ? "" : `<p class="text-[11px] text-zinc-400 leading-snug">${ratio < p.lo ? p.lowMsg : p.highMsg}</p>`}</div>`;
          }).join("")}</div><p class="text-[10px] text-zinc-500 leading-relaxed">Average hard sets per week over the last 4 weeks (main muscle for each lift). A mismatch isn't automatically bad, but it's worth knowing about.</p>`;
        }
        return `<div class="${card}" id="pt-balance-card"><h3 class="text-xs font-bold text-white">Balance check</h3>${body}</div>`;
      };

      /* ---------------------------------------------------------------- Progress tabs */
      const TABS = [["overview", "Overview"], ["muscles", "Muscles"], ["strength", "Strength"]];
      function tabify(app) {
        const root = document.getElementById("progress-body"); if (!root || root.querySelector("[data-ptab]")) return;
        const kids = [...root.children];
        const panels = {}; TABS.forEach(([k]) => { const d = document.createElement("div"); d.dataset.ptab = k; d.className = "space-y-4"; panels[k] = d; });
        const title = el => ((el.querySelector("h3") || {}).textContent || "").trim();
        const balance = document.createElement("div"); balance.innerHTML = app.balanceCardHtml();
        kids.forEach(el => {
          const t = title(el);
          const k = el.id === "pt-muscle-card" ? "muscles" : el.id === "strength-card" || /^Recent PRs/.test(t) ? "strength" : "overview";
          panels[k].appendChild(el);
        });
        panels.muscles.appendChild(balance.firstElementChild);
        // plateau check goes right after the stat row on Overview
        const pl = [...panels.overview.children].find(e => e.id === "pt-plateau-card" || e.classList.contains("pt-pcfold")), stats = panels.overview.firstElementChild;
        if (pl && stats && stats !== pl) stats.after(pl);
        const cur = TABS.some(([k]) => k === app._progTab) ? app._progTab : "overview";
        const bar = document.createElement("div");
        bar.id = "pt-ptabs"; bar.className = "grid grid-cols-3 gap-1 p-1 rounded-2xl bg-zinc-900 border border-zinc-800";
        bar.innerHTML = TABS.map(([k, t]) => `<button type="button" data-tab="${k}" class="pt-ptab py-2 rounded-xl text-xs font-bold tap-active">${t}</button>`).join("");
        root.appendChild(bar); TABS.forEach(([k]) => root.appendChild(panels[k]));
        const show = k => {
          app._progTab = k;
          bar.querySelectorAll(".pt-ptab").forEach(b => { const on = b.dataset.tab === k; b.classList.toggle("bg-emerald-600", on); b.classList.toggle("text-white", on); b.classList.toggle("text-zinc-400", !on); });
          TABS.forEach(([x]) => panels[x].classList.toggle("hidden", x !== k));
        };
        bar.addEventListener("click", e => { const b = e.target.closest(".pt-ptab"); if (b) { show(b.dataset.tab); window.scrollTo({ top: 0 }); } });
        show(cur);
        // Recent PRs: show 5, expand on tap
        const prCard = [...root.querySelectorAll("[data-ptab=strength] > div")].find(el => /^Recent PRs/.test(title(el)));
        if (prCard) {
          const rows = [...prCard.querySelectorAll(".pr-ex")];
          if (rows.length > 5) {
            rows.slice(5).forEach(r => r.classList.add("hidden"));
            const more = document.createElement("button"); more.type = "button"; more.className = "w-full py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] font-bold text-zinc-300 tap-active"; more.textContent = `Show all ${rows.length}`;
            more.addEventListener("click", () => { const open = more.dataset.open !== "1"; rows.slice(5).forEach(r => r.classList.toggle("hidden", !open)); more.dataset.open = open ? "1" : "0"; more.textContent = open ? "Show fewer" : `Show all ${rows.length}`; });
            prCard.appendChild(more);
          }
        }
        // Strength tab: all the rows already work; nothing else to wire
      }
      const oProgress = proto.renderProgressView;
      proto.renderProgressView = function () {
        const r = oProgress.apply(this, arguments);
        try { tabify(this); } catch (e) { console.error("PulseTrack 2.6 tabs", e); }
        return r;
      };

      document.addEventListener("click", e => {
        const app = A(); if (!app) return;
        const m = e.target.closest("#pt-muscle-card .mm-mode");
        if (m) { app._mapMode = m.dataset.k === "recovery" ? "recovery" : "sets"; app.renderProgressView(); return; }
        const t = e.target.closest("#pt-targets .pt-tg-row");
        if (t) openTargetSheet(t.dataset.r);
      });

      /* ---------------------------------------------------------------- Home: are today's muscles ready? */
      const oHomeExtras = proto.renderHomeExtras;
      proto.renderHomeExtras = function () {
        const r = oHomeExtras.apply(this, arguments);
        try {
          const box = document.getElementById("home-up-next");
          if (box && this.activeDay && !box.classList.contains("hidden") && (this.sessions || []).length) {
            const rd = PT.dayReadiness(this.activeDay, this);
            let html = "";
            if (rd.tired.length) html = `<span class="block mt-1.5 text-[11px] font-semibold text-amber-300">${rd.tired.slice(0, 3).map(t => esc(regLabel(t.r))).join(", ")} still recovering (ready in ${fmtLeft(Math.max(...rd.tired.map(t => t.left)))})</span>`;
            else if (rd.known >= 2) html = `<span class="block mt-1.5 text-[11px] font-semibold text-emerald-300">✓ Muscles are rested for this day</span>`;
            if (html) box.insertAdjacentHTML("beforeend", html);
          }
        } catch (e) { console.error("PulseTrack 2.6 readiness", e); }
        return r;
      };
    })();
  