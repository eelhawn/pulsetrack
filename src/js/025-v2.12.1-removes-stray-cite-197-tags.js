
/* =====================================================================
 * PulseTrack 2.12.1: removes stray "[cite: 197]" tags.
 *  Some program text on phones was copied in with source markers like "[cite: 197]", "[cite: 12, 13]" or "[cite_start]"
 *  at the end of exercise descriptions. This cleans them out of everything PulseTrack has saved (programs, notes, history,
 *  custom exercises and so on) the next time the app opens, and also from any program you import later.
 *  Only the marker itself (and the space before it) is removed; the rest of the text is left exactly as it was.
 * ===================================================================== */
(function () {
  "use strict";
  // [cite: 197]  [cite:12, 13]  [cite_start]  [cite_end]   and the bare form  cite: 197
  const CITE = /(?:\s|\\[nrt])*(?:\[\s*cite(?:_(?:start|end))?\s*(?::\s*[\d\s,;–-]*)?\]|\bcite\s*:\s*\d+(?:\s*[,;–-]\s*\d+)*)/gi;
  const QUICK = /cite/i;
  /** Cleans one piece of text. */
  function stripCites(s) { return typeof s === "string" && QUICK.test(s) ? s.replace(CITE, "") : s; }
  /** Cleans every piece of text inside an object (returns the same object). */
  function deepClean(o) {
    if (Array.isArray(o)) { for (let i = 0; i < o.length; i++) o[i] = typeof o[i] === "string" ? stripCites(o[i]) : deepClean(o[i]); }
    else if (o && typeof o === "object") { for (const k of Object.keys(o)) o[k] = typeof o[k] === "string" ? stripCites(o[k]) : deepClean(o[k]); }
    return o;
  }
  PT.stripCites = stripCites; PT.deepCleanCites = deepClean;

  /* ---- everything saved on the phone: cleaned the moment the app reads it, and written back clean */
  const oGet = PTLS.getItem.bind(PTLS), oSet = PTLS.setItem.bind(PTLS);
  PTLS.getItem = function (k) {
    const raw = oGet(k);
    if (typeof raw !== "string" || typeof k !== "string" || !k.startsWith("pulsetrack_") || !QUICK.test(raw)) return raw;
    const clean = raw.replace(CITE, "");
    if (clean === raw) return raw;
    try { JSON.parse(clean); } catch (e) { return raw; }           // never hand back something that is no longer valid
    try { oSet(k, clean); } catch (e) { /* the app still gets the clean copy; it will be saved again next time */ }
    return clean;
  };

  /* ---- programs you import later (file or link) */
  const proto = ApplicationUI.prototype;
  const oImp = proto.importProgramObject;
  if (typeof oImp === "function") proto.importProgramObject = function (p) { try { deepClean(p); } catch (e) { /* ignore */ } return oImp.apply(this, arguments); };
})();
  