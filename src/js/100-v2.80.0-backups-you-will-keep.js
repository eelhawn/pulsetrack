/* =====================================================================
 * PulseTrack 2.80.0: backups you will actually keep.
 *  A backup file is the only copy that survives a lost phone, and the app is offline, so it cannot upload to Google Drive by itself.
 *  What it can do is make the file as easy to save as possible and make sure it is a good one:
 *  - Settings → Data & Backup: "Back up to Drive / Files" opens the phone's share sheet (pick Drive or Files), "Save to Downloads"
 *    puts the file straight in the Downloads folder, and the status line says when, how many workouts and how big.
 *  - "Check a backup file": opens a file without changing anything and says whether it is complete and how it compares with this phone.
 *  - Restoring a file now shows that comparison first, warns when this phone has newer workouts than the file, and keeps a safety copy
 *    of how things are right now (so a wrong file can be undone from the safety copies).
 *  - How often to be reminded (every 3 days, week, 2 weeks, month or never), and a reminder right after a workout when one is due.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  const proto = ApplicationUI.prototype;
  const A = () => window.app;
  const $ = id => document.getElementById(id);
  const esc = s => PT.esc(s);
  const DAY = 86400000;
  const SKIP = () => ["pulsetrack_cardio_timer_v1", "pulsetrack_cleanup_undo_v1", typeof STORAGE_KEY_SESSION_START !== "undefined" ? STORAGE_KEY_SESSION_START : ""];
  const save = () => { try { WorkoutStorage.saveSettings(A().settings); } catch (e) { } };
  const mb = n => (n / 1048576).toFixed(n < 1048576 ? 2 : 1) + " MB";
  const plural = (n, w) => `${n.toLocaleString()} ${w}${n === 1 ? "" : "s"}`;

  /* ============================================================== what is in a set of saved keys */
  const keysNow = () => {
    const out = {}, skip = SKIP();
    for (let i = 0; i < PTLS.length; i++) { const k = PTLS.key(i); if (k && k.startsWith("pulsetrack_") && !skip.includes(k)) out[k] = PTLS.getItem(k); }
    return out;
  };
  /** counts and a health check, from the saved keys of a backup file or of this phone */
  function summarize(keys) {
    const j = k => { try { return JSON.parse(keys[k]); } catch (e) { return undefined; } };
    const bad = [];
    Object.keys(keys).forEach(k => { const v = keys[k]; if (typeof v === "string" && /^\s*[\[{]/.test(v)) { try { JSON.parse(v); } catch (e) { bad.push(k); } } });
    const sessions = j("pulsetrack_sessions_v1"), data = j("pulsetrack_data_v1");
    const list = Array.isArray(sessions) ? sessions : [];
    const last = list.reduce((m, s) => (s && s.date && s.date > m ? s.date : m), "");
    return {
      workouts: list.length, last, programs: data && Array.isArray(data.programs) ? data.programs.length : 0,
      size: Object.values(keys).reduce((n, v) => n + (typeof v === "string" ? v.length : 0), 0),
      bad, damaged: bad.includes("pulsetrack_sessions_v1") || bad.includes("pulsetrack_data_v1") || bad.includes("pulsetrack_settings_v1")
    };
  }
  const fdate = ds => { const d = PT.fromDs ? PT.fromDs(ds) : null; return d ? d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : ds || "no workouts"; };
  /** "the file is 12 workouts ahead", "this phone is 6 ahead", "the same" */
  function compare(file, phone) {
    const d = file.workouts - phone.workouts;
    if (!d && file.last === phone.last) return { ok: true, text: "The file and this phone match." };
    if (d > 0) return { ok: true, text: `The file has ${plural(d, "workout")} more than this phone.` };
    if (d < 0) return { ok: false, text: `This phone has ${plural(-d, "workout")} more than the file. Restoring would lose them.` };
    return { ok: file.last >= phone.last, text: file.last < phone.last ? "This phone has a newer workout than the file." : "Same number of workouts." };
  }
  const lines = (title, s) => `${title}: ${plural(s.workouts, "workout")}${s.last ? " (latest " + fdate(s.last) + ")" : ""}, ${plural(s.programs, "program")}, ${mb(s.size)}`;

  /* ============================================================== make a backup */
  function build(app) {
    const keys = keysNow();
    const payload = { app: "PulseTrack", schemaVersion: typeof BACKUP_SCHEMA !== "undefined" ? BACKUP_SCHEMA : 2, appVersion: typeof APP_VERSION !== "undefined" ? APP_VERSION : "", exportedAt: new Date().toISOString(), keys };
    return new File([JSON.stringify(payload)], `pulsetrack-backup-${PT.ds()}.json`, { type: "application/json" });
  }
  function done(app, how) {
    app.settings.lastBackupAt = Date.now(); save();
    try { app.renderHomeBanners(); } catch (e) { }
    try { app.renderSettingsExtras(); } catch (e) { }
    app.toast(how === "download" ? "Saved to this phone's Downloads. Copy it to Drive or Files too." : "Backup created. Keep the file somewhere safe (Files, iCloud, Drive).", null, null, 5000);
  }
  proto.exportBackup = async function () {
    const file = build(this), ok = await this.shareFile(file, "PulseTrack backup");
    if (ok) done(this, "share");
  };
  function download(app) {
    const file = build(app), url = URL.createObjectURL(file), a = document.createElement("a");
    a.href = url; a.download = file.name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 8000);
    done(app, "download");
  }

  /* ============================================================== read a file, check it, restore it */
  const readText = file => new Promise((res, rej) => { const r = new FileReader(); r.onerror = () => rej(r.error); r.onload = () => res(String(r.result)); r.readAsText(file); });
  async function open(file) {
    let payload; try { payload = JSON.parse(await readText(file)); } catch (e) { await PT.alert("That file isn't a valid PulseTrack backup."); return null; }
    if (payload && payload.pulsetrackProgram) return { program: payload };
    if (!payload || payload.app !== "PulseTrack" || !payload.keys || typeof payload.keys !== "object") { await PT.alert("That file isn't a PulseTrack backup."); return null; }
    const entries = Object.entries(payload.keys).filter(([k, v]) => k.startsWith("pulsetrack_") && typeof v === "string");
    if (!entries.length) { await PT.alert("The backup is empty."); return null; }
    const keys = {}; entries.forEach(([k, v]) => { keys[k] = v; });
    return { payload, entries, keys, sum: summarize(keys), phone: summarize(keysNow()), when: payload.exportedAt ? new Date(payload.exportedAt).toLocaleString() : "an unknown date" };
  }
  async function check(app, file) {
    const o = await open(file); if (!o) return;
    if (o.program) { await PT.alert("That is a shared program, not a backup. Use Programs → Import to add it."); return; }
    const c = compare(o.sum, o.phone);
    const head = o.sum.damaged ? "⚠ This file is damaged: part of it cannot be read." : o.sum.bad.length ? `✓ Readable, but ${o.sum.bad.length} small part${o.sum.bad.length === 1 ? "" : "s"} could not be read.` : "✓ This is a complete PulseTrack backup.";
    await PT.alert(`${head}\n\nMade ${o.when}${o.payload.appVersion ? " (app v" + o.payload.appVersion + ")" : ""}.\n${lines("In the file", o.sum)}\n${lines("On this phone", o.phone)}\n\n${c.text}\nNothing was changed.`);
  }
  PT.backup = { summarize, compare, build: () => build(A()), keysNow, reload: () => location.reload(), due: a => due(a || A()) };
  proto.importBackup = async function (file) {
    const app = this, o = await open(file); if (!o) return;
    if (o.program) { app.importProgramObject(o.program.program); return; }
    if (o.sum.damaged && !await PT.confirm("This file looks damaged: part of it cannot be read. Restoring it could leave the app broken.\n\nRestore anyway? (A safety copy of this phone is made first.)")) return;
    const c = compare(o.sum, o.phone);
    const msg = `Restore the backup from ${o.when}?\n\n${lines("In the file", o.sum)}\n${lines("On this phone now", o.phone)}\n\n${c.ok ? "" : "⚠ " + c.text + "\n\n"}This REPLACES all PulseTrack data on this phone (programs, history, PRs, settings). A safety copy of how things are now is saved first, so you can go back. Progress photos are not affected.`;
    if (!await PT.confirm(msg)) return;
    try { if (PT.safety && PT.safety.take) await PT.safety.take("before restoring a file", true); } catch (e) { console.error("PulseTrack safety copy before restore", e); }
    const old = [], skip = SKIP();
    for (let i = 0; i < PTLS.length; i++) { const k = PTLS.key(i); if (k && k.startsWith("pulsetrack_") && !skip.includes(k)) old.push(k); }
    old.forEach(k => PTLS.removeItem(k));
    let failed = 0;
    o.entries.forEach(([k, v]) => { if (!safeSetItem(k, v)) failed++; });
    await PT.alert(failed ? `Restored with ${failed} item(s) that did not fit in storage.` : "Backup restored. The app will reload.");
    PT.backup.reload();
  };

  /* ============================================================== reminders */
  const everyDays = a => { const v = a && a.settings ? a.settings.backupEvery : undefined; return v === undefined || v === null || v === "" ? 7 : Math.max(0, parseInt(v, 10) || 0); };
  PT.backupEveryDays = everyDays;
  function due(a) {
    const days = everyDays(a), last = a.settings.lastBackupAt;
    return days > 0 && (a.sessions || []).length >= 1 && Date.now() > (a.settings.backupSnoozeUntil || 0) && (!last || Date.now() - last > days * DAY);
  }
  /** after a workout: if a backup is due, remind once a day, with a button that opens the share sheet */
  function nudge(a, delay) {
    if (a.settings.backupAfterWorkout === false || !due(a) || a.settings.backupNudgeDs === PT.ds()) return false;
    a.settings.backupNudgeDs = PT.ds(); save();
    const last = a.settings.lastBackupAt, age = last ? Math.floor((Date.now() - last) / DAY) + " days ago" : "never";
    setTimeout(() => { try { a.toast(`Back up your data? Last backup: ${age}.`, "Back up", () => a.exportBackup(), 9000); } catch (e) { } }, delay == null ? 8000 : delay);
    return true;
  }
  PT.backup.nudge = (a, d) => nudge(a || A(), d);
  const oFin = proto.finishWorkoutV2;
  if (oFin) proto.finishWorkoutV2 = async function () {
    const n0 = (this.sessions || []).length, r = await oFin.apply(this, arguments);
    try { if ((this.sessions || []).length > n0) nudge(this); } catch (e) { console.error("PulseTrack backup nudge", e); }
    return r;
  };

  /* ============================================================== Settings → Data & Backup */
  function draw(a) {
    const st = $("backup-status"); if (!st) return;
    const last = a.settings.lastBackupAt, days = last ? Math.floor((Date.now() - last) / DAY) : null, s = summarize(keysNow());
    const dot = last == null ? "#ef4444" : days <= 7 ? "#34d399" : days <= 30 ? "#fbbf24" : "#ef4444";
    st.innerHTML = `<span style="display:inline-block;width:.55rem;height:.55rem;border-radius:50%;background:${dot};margin-right:.4rem"></span>${last == null ? "No backup yet. Make one now." : `Last backup: ${esc(new Date(last).toLocaleDateString())} (${days === 0 ? "today" : days + " day" + (days === 1 ? "" : "s") + " ago"})`}<span class="block text-[11px] font-normal text-zinc-400 mt-1">${esc(plural(s.workouts, "workout"))} · ${esc(plural(s.programs, "program"))} · ${esc(mb(s.size))} to back up</span>`;
    const b = $("btn-export-backup"); if (b) b.textContent = "☁ Back up to Drive / Files";
    let box = $("pt-bk");
    if (!box) {
      box = document.createElement("div"); box.id = "pt-bk"; box.className = "space-y-2.5 pt-1";
      const grid = $("btn-export-backup") && $("btn-export-backup").parentElement; if (grid) grid.insertAdjacentElement("afterend", box); else st.insertAdjacentElement("afterend", box);
    }
    const ev = String(everyDays(a));
    box.innerHTML = `<p class="text-[11px] text-zinc-400 leading-snug">The button above opens your phone's share sheet: pick <b class="text-zinc-200">Drive</b> (or <b class="text-zinc-200">Files</b>) and tap Save. PulseTrack works offline, so it cannot upload by itself. Photos and clips stay on the phone and are not in the file.</p>
      <div class="grid grid-cols-2 gap-2"><button type="button" id="pt-bk-dl" class="py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold text-xs rounded-xl tap-active">Save to Downloads</button>
        <button type="button" id="pt-bk-check-btn" class="py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold text-xs rounded-xl tap-active">Check a backup file</button></div>
      <input id="pt-bk-check" type="file" accept=".json,application/json" class="hidden">
      <div class="flex items-center justify-between gap-3"><label for="pt-bk-every" class="text-xs font-semibold text-zinc-200">Remind me to back up</label>
        <select id="pt-bk-every" class="bg-zinc-800 text-zinc-100 text-xs font-semibold rounded-lg px-2 py-2 border border-zinc-700">${[["3", "Every 3 days"], ["7", "Every week"], ["14", "Every 2 weeks"], ["30", "Every month"], ["0", "Never"]].map(([v, t]) => `<option value="${v}" ${v === ev ? "selected" : ""}>${t}</option>`).join("")}</select></div>
      <label class="flex items-center justify-between gap-3 text-xs font-semibold text-zinc-200"><span>Also remind me after a workout<span class="block text-[11px] font-normal text-zinc-400">Once a day at most, only when a backup is due.</span></span><input id="pt-bk-after" type="checkbox" class="h-5 w-5 shrink-0" ${a.settings.backupAfterWorkout === false ? "" : "checked"}></label>`;
  }
  const oExtras = proto.renderSettingsExtras;
  proto.renderSettingsExtras = async function () {
    const r = await oExtras.apply(this, arguments);
    try { draw(this); } catch (e) { console.error("PulseTrack backup card", e); }
    return r;
  };
  document.addEventListener("click", e => {
    const a = A(); if (!a || !e.target.closest) return;
    if (e.target.closest("#pt-bk-dl")) { download(a); return; }
    if (e.target.closest("#pt-bk-check-btn")) { const i = $("pt-bk-check"); if (i) { i.value = ""; i.click(); } }
  });
  document.addEventListener("change", e => {
    const a = A(); if (!a || !e.target) return;
    if (e.target.id === "pt-bk-check" && e.target.files && e.target.files[0]) { check(a, e.target.files[0]).catch(err => console.error("PulseTrack check backup", err)); return; }
    if (e.target.id === "pt-bk-every") { a.settings.backupEvery = parseInt(e.target.value, 10) || 0; a.settings.backupSnoozeUntil = 0; save(); try { a.renderHomeBanners(); } catch (x) { } return; }
    if (e.target.id === "pt-bk-after") { a.settings.backupAfterWorkout = !!e.target.checked; save(); }
  });
})();
