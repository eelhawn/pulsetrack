
/* =====================================================================
 * PulseTrack 2.65.1: a built-in program that changed its exercises reaches phones that already have it.
 *  Built-in programs are copied to a phone once (seedBuiltins), so a phone that got "Ronnie Coleman: 6-On, 1-Off Split" in 2.65.0 would keep its 41
 *  exercises. Now, when the copy on the phone is still exactly the old one (same exercises, sets and reps as 2.65.0), its days, description and tags are
 *  replaced with the new ones. The day numbers stay the same, so the week and day you are on stay valid. A copy you edited yourself is left alone.
 *  REFRESH lists, per program id, the fingerprints of old versions that may be replaced (a fingerprint is a hash of every day's exercise names, sets and reps).
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof WorkoutStorage === "undefined" || typeof WorkoutStorage.seedBuiltins !== "function") return;
  const REFRESH = { ronnie_coleman_6on1off_split: ["c887916d"] };
  const fp = p => p.days.map(d => ((d && d.exercises) || []).map(e => [e.name, e.sets, e.reps].join("|")).join(";")).join("#");
  const hash = s => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(16); };
  PT.progFingerprint = p => { try { return hash(fp(p)); } catch (e) { return ""; } };
  function refresh(data) {
    if (typeof BUILTIN_PROGRAMS === "undefined" || !Array.isArray(BUILTIN_PROGRAMS) || !data || !Array.isArray(data.programs)) return false;
    let changed = false;
    Object.keys(REFRESH).forEach(id => {
      const p = data.programs.find(x => x && x.id === id), b = BUILTIN_PROGRAMS.find(x => x && x.id === id);
      if (!p || !b || !Array.isArray(p.days) || !Array.isArray(b.days)) return;
      const mine = PT.progFingerprint(p);
      if (REFRESH[id].indexOf(mine) < 0 || mine === PT.progFingerprint(b)) return;
      if (p.days.length !== b.days.length || !b.days.every((d, i) => p.days[i] && p.days[i].dayNumber === d.dayNumber)) return;
      p.days = JSON.parse(JSON.stringify(b.days));
      if (b.description) p.description = b.description;
      if (Array.isArray(b.tags)) p.tags = b.tags.slice();
      changed = true;
    });
    return changed;
  }
  const oSeed = WorkoutStorage.seedBuiltins;
  WorkoutStorage.seedBuiltins = function (data) {
    const out = oSeed.apply(this, arguments);
    try { if (refresh(out)) this.setData(out); } catch (e) { console.warn("PulseTrack: program refresh skipped", e); }
    return out;
  };
})();
  