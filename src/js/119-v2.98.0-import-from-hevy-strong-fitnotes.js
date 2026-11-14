/* =====================================================================
 * PulseTrack 2.98.0: import your history from Hevy, Strong or FitNotes.
 *  Settings → Data & Backup → "Import From Hevy, Strong or FitNotes": pick the CSV file the other app exported
 *   (Hevy: Profile → Settings → Export & Import Data → Export workouts; Strong: Settings → Export Strong Data;
 *    FitNotes: Settings → Data → Spreadsheet Export → Workout Data).
 *  The app is recognised from the column names. Before anything is saved you see how many workouts and sets were found, from when to when,
 *  and the weight unit (when the file doesn't say, you choose). Each workout becomes a History entry on its own date: warm-up, drop and
 *  failure sets keep their tags, runs and other distance/time rows become cardio, weights are converted to your unit. Exercise names are
 *  matched to PulseTrack's (and the openGym library's) where they are the same exercise; anything else keeps its own name.
 *  Records and last-time weights are worked out again afterwards. Importing the same file twice adds nothing the second time.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined" || !PT.kit) return;
  const proto = ApplicationUI.prototype;
  const A = () => window.app;
  const LB = 0.45359237, MI = 1.609344;
  const num = v => { const n = parseFloat(String(v == null ? "" : v).replace(",", ".")); return isFinite(n) ? n : 0; };
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------------------------------------------------------------- CSV */
  function parseCsv(text) {
    text = String(text || "").replace(/^﻿/, "");
    const first = text.split(/\r?\n/, 1)[0] || "";
    const sep = (first.match(/;/g) || []).length > (first.match(/,/g) || []).length ? ";" : (first.includes("\t") && !first.includes(",") ? "\t" : ",");
    const rows = []; let row = [], cell = "", q = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (q) {
        if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; }
        else cell += ch;
      } else if (ch === '"') q = true;
      else if (ch === sep) { row.push(cell); cell = ""; }
      else if (ch === "\n" || ch === "\r") { if (ch === "\r" && text[i + 1] === "\n") i++; row.push(cell); cell = ""; if (row.some(c => c !== "")) rows.push(row); row = []; }
      else cell += ch;
    }
    row.push(cell); if (row.some(c => c !== "")) rows.push(row);
    if (!rows.length) return { head: [], rows: [] };
    const head = rows[0].map(h => h.trim());
    return { head, rows: rows.slice(1).map(r => { const o = {}; head.forEach((h, i) => { o[h] = (r[i] || "").trim(); }); return o; }) };
  }

  /* ---------------------------------------------------------------- dates */
  const MON = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
  function when(s) {
    s = String(s || "").trim(); let m;
    if ((m = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?/.exec(s))) return new Date(+m[1], +m[2] - 1, +m[3], +(m[4] || 12), +(m[5] || 0), +(m[6] || 0));
    if ((m = /^(\d{1,2})\s+([A-Za-z]{3})[a-z]*\.?\s+(\d{4}),?\s*(?:(\d{1,2}):(\d{2}))?/.exec(s)) && MON[m[2].toLowerCase()] !== undefined) return new Date(+m[3], MON[m[2].toLowerCase()], +m[1], +(m[4] || 12), +(m[5] || 0));
    if ((m = /^([A-Za-z]{3})[a-z]*\.?\s+(\d{1,2}),?\s+(\d{4}),?\s*(?:(\d{1,2}):(\d{2}))?/.exec(s)) && MON[m[1].toLowerCase()] !== undefined) return new Date(+m[3], MON[m[1].toLowerCase()], +m[2], +(m[4] || 12), +(m[5] || 0));
    const t = Date.parse(s); return isFinite(t) ? new Date(t) : null;
  }
  const ds = d => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  /** "1h 5m", "45m", "0:45:00", "2700" → seconds */
  function secs(v) {
    const s = String(v || "").trim(); if (!s) return 0; let m;
    if ((m = /^(\d+):(\d{1,2}):(\d{1,2})$/.exec(s))) return +m[1] * 3600 + +m[2] * 60 + +m[3];
    if ((m = /^(\d+):(\d{1,2})$/.exec(s))) return +m[1] * 60 + +m[2];
    if (/[hms]/i.test(s)) { let t = 0; (s.match(/(\d+(?:\.\d+)?)\s*([hms])/gi) || []).forEach(p => { const x = /(\d+(?:\.\d+)?)\s*([hms])/i.exec(p); t += parseFloat(x[1]) * ({ h: 3600, m: 60, s: 1 })[x[2].toLowerCase()]; }); return Math.round(t); }
    return Math.round(num(s));
  }

  /* ---------------------------------------------------------------- the three apps */
  const has = (head, re) => head.find(h => re.test(h)) || null;
  function detect(head) {
    if (has(head, /^exercise_title$/i) && has(head, /^start_time$/i)) return "Hevy";
    if (has(head, /^exercise name$/i) && has(head, /^set order$/i)) return "Strong";
    if (has(head, /^exercise$/i) && has(head, /^date$/i) && has(head, /^category$/i)) return "FitNotes";
    return null;
  }
  /** the unit a weight column says it is in, or null */
  const unitOfCol = h => !h ? null : /kg/i.test(h) ? "kg" : /lb/i.test(h) ? "lb" : null;

  /** rows → { app, unit (or null: file doesn't say), workouts: [{ key, title, start (Date), dur, note, ex: [{ name, sets: [{ w, r, t, min, dist }] }] }] } */
  function read(text) {
    const { head, rows } = parseCsv(text);
    const app = detect(head);
    if (!app) return { app: null, head };
    const W = new Map(), order = [];
    let unit = null, distU = null;
    const add = (key, mk) => { let w = W.get(key); if (!w) { w = mk(); w.ex = []; W.set(key, w); order.push(w); } return w; };
    const exOf = (w, name) => { let e = w.ex[w.ex.length - 1]; if (!e || e.name !== name) { e = w.ex.find(x => x.name === name) || null; if (!e) { e = { name, sets: [] }; w.ex.push(e); } } return e; };
    const setOf = (kg, lb, reps, dist, sec, t) => {
      const w = kg !== null ? num(kg) : num(lb), r = num(reps), d = num(dist), m = num(sec) / 60;
      if (!(r > 0) && (d > 0 || m > 0) && !(w > 0)) return { cardio: 1, w: 0, r: 0, t, min: Math.round(m * 10) / 10, dist: d > 0 ? d : 0 };
      if (!(r > 0) && !(w > 0) && !(m > 0)) return null;
      return { w, r, t };
    };
    if (app === "Hevy") {
      const wKg = has(head, /^weight_kg$/i), wLb = has(head, /^weight_lbs?$/i), dKm = has(head, /^distance_km$/i), dMi = has(head, /^distance_miles$/i);
      unit = wKg ? "kg" : wLb ? "lb" : null; distU = dKm ? "km" : dMi ? "mi" : null;
      const T = { warmup: "W", dropset: "D", failure: "F" };
      rows.forEach(r => {
        const start = when(r.start_time); if (!start || !r.exercise_title) return;
        const w = add(r.title + "|" + r.start_time, () => { const end = when(r.end_time); return { key: ds(start) + "|" + r.title + "|" + r.start_time, title: r.title || "Workout", start, dur: end ? Math.max(0, Math.round((end - start) / 1000)) : 0, note: r.description || "" }; });
        const st = setOf(wKg ? r[wKg] : null, wLb ? r[wLb] : "", r.reps, dKm ? r[dKm] : dMi ? r[dMi] : "", r.duration_seconds, T[String(r.set_type || "").toLowerCase()] || "R");
        if (st) exOf(w, r.exercise_title).sets.push(st);
      });
    } else if (app === "Strong") {
      const wc = has(head, /^weight/i), dc = has(head, /^distance/i);
      unit = unitOfCol(wc); distU = dc && /km|kilomet/i.test(dc) ? "km" : dc && /mi/i.test(dc) ? "mi" : dc && /\bm\b|meter/i.test(dc) ? "m" : null;
      rows.forEach(r => {
        const start = when(r["Date"]); if (!start || !r["Exercise Name"]) return;
        const name = r["Workout Name"] || "Workout";
        const w = add(r["Date"] + "|" + name, () => ({ key: ds(start) + "|" + name + "|" + r["Date"], title: name, start, dur: secs(r["Duration"] || r["Workout Duration"]), note: r["Workout Notes"] || "" }));
        const so = String(r["Set Order"] || "").trim().toUpperCase();
        if (so === "REST TIMER" || so === "NOTE") return;
        const st = setOf(null, wc ? r[wc] : "", r["Reps"], dc ? r[dc] : "", r["Seconds"], so === "W" ? "W" : so === "D" ? "D" : so === "F" ? "F" : "R");
        if (st) exOf(w, r["Exercise Name"]).sets.push(st);
      });
    } else {
      const wc = has(head, /^weight/i), wu = has(head, /^weight unit$/i), dc = has(head, /^distance$/i), du = has(head, /^distance unit$/i), tc = has(head, /^time$/i), cc = has(head, /^comment$/i);
      unit = unitOfCol(wc && wc !== wu ? wc : null);
      rows.forEach(r => {
        const start = when(r["Date"]); if (!start || !r["Exercise"]) return;
        if (!unit && wu && r[wu]) unit = /kg/i.test(r[wu]) ? "kg" : /lb/i.test(r[wu]) ? "lb" : unit;
        const w = add(r["Date"], () => ({ key: ds(start) + "|FitNotes", title: "Workout", start, dur: 0, note: "" }));
        let d = dc ? num(r[dc]) : 0;
        const u = du ? String(r[du] || "").toLowerCase() : "";
        if (d > 0 && u) { if (/mile|^mi/.test(u)) d = d * MI; else if (/^m$|metre|meter/.test(u)) d = d / 1000; else if (/ft|feet/.test(u)) d = d * 0.0003048; else if (/yd|yard/.test(u)) d = d * 0.0009144; }
        const st = setOf(null, wc ? r[wc] : "", r["Reps"], d > 0 ? String(d) : "", tc ? secs(r[tc]) : 0, "R");
        if (st) { if (st.cardio && d > 0) st.distKm = 1; exOf(w, r["Exercise"]).sets.push(st); if (cc && r[cc]) w.note = (w.note ? w.note + " · " : "") + r[cc]; }
      });
      distU = "km";
    }
    const workouts = order.filter(w => w.ex.some(e => e.sets.length));
    workouts.forEach(w => { w.ex = w.ex.filter(e => e.sets.length); });
    workouts.sort((a, b) => a.start - b.start);
    return { app, unit, distU, workouts };
  }

  /* ---------------------------------------------------------------- into PulseTrack */
  function nameFor(n) {
    const raw = String(n || "").trim();
    try { const e = PT.exCanon && PT.exCanon(raw); if (e) return e.name; } catch (err) { }
    try { if (PT.og && PT.og.get && PT.og.get(raw)) { PT.og.promote(raw); return PT.og.get(raw).name; } } catch (err) { }
    return raw;
  }
  function toSessions(a, res, fileUnit) {
    const my = a.unit(), conv = w => (fileUnit === my || !(w > 0)) ? w : (fileUnit === "lb" ? w * LB : w / LB);
    const r2 = n => Math.round(n * 100) / 100;
    const myDist = my === "kg" ? "km" : "mi";
    const distTo = (d, from) => { if (!(d > 0)) return 0; let km = from === "mi" ? d * MI : from === "m" ? d / 1000 : d; return r2(myDist === "mi" ? km / MI : km); };
    return res.workouts.map(w => {
      const ex = w.ex.map(e => {
        const name = nameFor(e.name), rec = { name, sets: [] };
        let cardio = false;
        e.sets.forEach(s => {
          if (s.cardio) { cardio = true; const st = { w: 0, r: 0, t: s.t, min: s.min }; const d = distTo(s.dist, s.distKm ? "km" : res.distU); if (d > 0) st.dist = d; rec.sets.push(st); }
          else rec.sets.push({ w: r2(conv(s.w)), r: s.r, t: s.t });
        });
        if (cardio) rec.k = "c";
        return rec;
      });
      const date = ds(w.start), sets = ex.reduce((n, e) => n + e.sets.length, 0);
      let vol = 0; ex.forEach(e => e.sets.forEach(st => { try { vol += a.setVolume(e.name, st, date, e.dbn); } catch (err) { } }));
      return { id: PT.uid(), v: 1, date, ts: w.start.getTime(), pid: "import", ptitle: res.app, day: 0, dtitle: w.title || "Workout", week: null,
        dur: w.dur || 0, unit: my, note: w.note || "", ex, vol: Math.round(vol), sets, prs: [], upd: Date.now(), imp: res.app + "|" + w.key };
    });
  }
  function save(a, sessions) {
    const seen = new Set((a.sessions || []).map(s => s && s.imp).filter(Boolean));
    const fresh = sessions.filter(s => !seen.has(s.imp));
    if (!fresh.length) return { added: 0, skipped: sessions.length };
    fresh.forEach(s => a.sessions.push(s));
    a.sessions.sort((x, y) => (x.ts || 0) - (y.ts || 0));
    a.saveSessions();
    const names = new Set(); fresh.forEach(s => s.ex.forEach(e => names.add(e.name)));
    try { a.rebuildLastPerfFor([...names]); } catch (e) { }
    try { a.rebuildPRs(); } catch (e) { }
    PT._catMap = null;
    return { added: fresh.length, skipped: sessions.length - fresh.length };
  }

  /* ---------------------------------------------------------------- the sheet */
  const fmtD = d => d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  async function openFile(file) {
    const a = A(); if (!a || !file) return;
    let text = "";
    try { text = await file.text(); } catch (e) { await PT.alert("That file could not be read."); return; }
    const res = read(text);
    if (!res.app) { await PT.alert("This doesn't look like a Hevy, Strong or FitNotes export. Export the workout data from that app as CSV and pick that file."); return; }
    if (!res.workouts.length) { await PT.alert(`This ${res.app} file has no workouts with sets in it.`); return; }
    preview(a, res);
  }
  function preview(a, res) {
    const K = PT.kit, el = K.sheet("pt-impapp", 70);
    let unit = res.unit || a.unit();
    const sets = res.workouts.reduce((n, w) => n + w.ex.reduce((m, e) => m + e.sets.length, 0), 0);
    const names = new Set(); res.workouts.forEach(w => w.ex.forEach(e => names.add(e.name)));
    const first = res.workouts[0].start, last = res.workouts[res.workouts.length - 1].start;
    const seen = new Set((a.sessions || []).map(s => s && s.imp).filter(Boolean));
    const dup = res.workouts.filter(w => seen.has(res.app + "|" + w.key)).length;
    const matched = [...names].filter(n => nameFor(n) !== n || (PT.exCanon && PT.exCanon(n))).length;
    const draw = () => {
      const card = K.openSheet(el, `${K.head("Import from " + res.app, "Nothing is saved until you tap Import.")}
        <div class="rounded-xl bg-zinc-950 border border-zinc-800 p-3.5 space-y-1.5 text-xs text-zinc-300" id="pt-imp-sum">
          <p><b class="text-white">${res.workouts.length}</b> workouts, <b class="text-white">${sets}</b> sets, <b class="text-white">${names.size}</b> exercises</p>
          <p>${esc(fmtD(first))} to ${esc(fmtD(last))}</p>
          <p class="text-zinc-400">${matched} of the exercise names match PulseTrack's; the others keep their own name.</p>
          ${dup ? `<p class="text-amber-300">${dup === res.workouts.length ? "All of these are" : dup + " of these are"} already in your History (imported before) and will be skipped.</p>` : ""}
        </div>
        <div>${K.lab("Weights in this file are in")}<div class="flex gap-1.5" id="pt-imp-unit">
          <button type="button" data-u="lb" aria-pressed="${unit === "lb"}" class="pt-opt tap-active">Pounds (lb)</button>
          <button type="button" data-u="kg" aria-pressed="${unit === "kg"}" class="pt-opt tap-active">Kilograms (kg)</button></div>
          <p class="text-[11px] text-zinc-500 mt-1.5">${res.unit ? "The file says " + (res.unit === "kg" ? "kilograms" : "pounds") + "." : "The file doesn't say, so check this."} They are converted to ${a.unit() === "kg" ? "kilograms" : "pounds"}, your unit.</p></div>
        <button type="button" id="pt-imp-go" class="w-full py-3 rounded-xl bg-emerald-600 text-white text-sm font-extrabold tap-active"${dup === res.workouts.length ? " disabled" : ""}>Import ${res.workouts.length - dup} workout${res.workouts.length - dup === 1 ? "" : "s"}</button>`);
      card.addEventListener("click", e => {
        const u = e.target.closest("[data-u]"); if (u) { unit = u.dataset.u; draw(); return; }
        if (e.target.closest("#pt-imp-go")) {
          const out = save(a, toSessions(a, res, unit));
          K.closeSheet(el);
          try { a.renderHistoryView && a.renderHistoryView(); } catch (err) { }
          a.toast(out.added ? `Imported ${out.added} workout${out.added === 1 ? "" : "s"} from ${res.app}${out.skipped ? ` (${out.skipped} already there)` : ""}` : "Nothing new: these workouts are already in your History");
        }
      });
    };
    draw();
  }

  document.addEventListener("click", e => {
    if (e.target.closest && e.target.closest("#btn-import-apps")) { const i = document.getElementById("input-import-apps"); if (i) { i.value = ""; i.click(); } }
  });
  document.addEventListener("change", e => {
    if (e.target && e.target.id === "input-import-apps") { const f = e.target.files && e.target.files[0]; e.target.value = ""; if (f) openFile(f); }   // cleared so the same file can be picked again
  });

  PT.importApps = { parseCsv, read, when, secs, toSessions: (res, unit) => toSessions(A(), res, unit || res.unit || A().unit()), save: s => save(A(), s), openFile, preview: res => preview(A(), res) };
})();
