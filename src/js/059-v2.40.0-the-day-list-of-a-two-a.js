
/* =====================================================================
 * PulseTrack 2.40.0: the day list of a two-a-day program.
 *  Days titled like "Mon AM: Chest" and "Mon PM: Arms" (or "Chest (AM) + Arms (PM)") now show what they are:
 *   - a sun or moon tag and the weekday above the exercise name, a gold bar for the morning session and an indigo bar for the evening one
 *   - the morning and evening session of the same day sit together as one joined pair
 *   - a short note above the list says how a two-a-day program runs (a few hours between sessions, each session counts as a workout)
 *  Nothing about how the sessions are logged or counted changes: each one is still its own day.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  const proto = ApplicationUI.prototype;
  const esc = s => PT.esc(s);

  const SUN = '<svg class="pt-sico2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4" fill="currentColor"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6"/></svg>';
  const MOON = '<svg class="pt-sico2" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.5 14.6A8.5 8.5 0 019.4 3.5a.6.6 0 00-.8-.7A9.5 9.5 0 1021.2 15.4a.6.6 0 00-.7-.8z"/></svg>';
  const FULL = { mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday" };
  const dayName = d => FULL[String(d || "").slice(0, 3).toLowerCase()] || String(d || "");

  function decorate(app) {
    const prog = app.activeProgram, list = app.dom && app.dom.daysList; if (!prog || !list) return;
    const old = document.getElementById("pt-dbl-note"); if (old) old.remove();
    const info = PT.programsScreen && PT.programsScreen.two ? PT.programsScreen.two(prog) : null;
    const sesOf = PT.sessionOf; if (!sesOf) return;
    let prev = null;
    [...list.children].forEach(card => {
      const dn = card.dataset ? card.dataset.day : null;
      if (dn == null || dn === "") { prev = null; return; }
      const day = (prog.days || []).find(d => String(d.dayNumber) === String(dn));
      const cnt = card.querySelector(".text-xs.text-zinc-400"); if (cnt && /^1 Exercises$/.test(cnt.textContent.trim())) cnt.textContent = "1 Exercise";
      const s = day ? sesOf(day.title) : null;
      if (!s) { prev = null; return; }
      const lab = card.querySelector(".uppercase"), h4 = card.querySelector("h4");
      if (s.time === "both") {
        card.classList.add("pt-ses-card", "pt-ses-both");
        if (h4) h4.innerHTML = `<span class="pt-ses-line"><i class="am">${SUN}AM</i> <span>${esc(s.am)}</span></span><span class="pt-ses-line"><i class="pm">${MOON}PM</i> <span>${esc(s.pm)}</span></span>`;
        prev = null; return;
      }
      const am = s.time === "AM";
      card.classList.add("pt-ses-card", am ? "pt-ses-am" : "pt-ses-pm");
      if (lab) lab.innerHTML = `<span class="pt-ses-tag ${am ? "am" : "pm"}">${am ? SUN : MOON}${esc(dayName(s.day))} · ${am ? "Morning" : "Evening"}</span>`;
      if (h4) h4.textContent = s.topic;
      if (am) { prev = { card, day: s.day.toLowerCase() }; return; }
      if (prev && prev.day === s.day.toLowerCase() && prev.card.nextElementSibling === card) { prev.card.classList.add("pt-pair-t"); card.classList.add("pt-pair-b"); }
      prev = null;
    });
    if (!info) return;
    const note = document.createElement("div"); note.id = "pt-dbl-note";
    const where = info.partial && info.weeks ? `Weeks ${info.weeks[0]}–${info.weeks[1]} of this program train twice a day.` : "This program trains twice a day.";
    note.innerHTML = `<span class="pt-dbl-ic">${SUN}${MOON}</span><span><b>${where}</b> Do the morning session, eat and rest, then the evening session a few hours later. Each session is its own workout and counts when you finish it.</span>`;
    list.insertAdjacentElement("beforebegin", note);
  }

  /** "0/10 days done" counts sessions here, so say so */
  const oRow = proto.renderDaysWeekRow;
  if (typeof oRow === "function") proto.renderDaysWeekRow = function () {
    const r = oRow.apply(this, arguments);
    try {
      const prog = this.activeProgram, row = document.getElementById("days-week-row");
      const info = prog && PT.programsScreen && PT.programsScreen.two ? PT.programsScreen.two(prog) : null;
      if (info && !info.partial && row) {
        const d = row.firstElementChild;
        if (d && /\d+\/\d+ (?:days )?done/.test(d.textContent)) d.innerHTML = d.innerHTML.replace(/(\d+\/\d+) (?:days )?done/, "$1 sessions done");
      }
    } catch (e) { console.error("PulseTrack two-a-day week row", e); }
    return r;
  };

  const oDec = proto.decorateDaysList;
  proto.decorateDaysList = function () {
    const r = typeof oDec === "function" ? oDec.apply(this, arguments) : undefined;
    try { decorate(this); } catch (e) { console.error("PulseTrack two-a-day list", e); }
    return r;
  };

  const css = document.createElement("style"); css.id = "pt-v240-two-css";
  css.textContent = `
    .pt-sico2 { width: .85em; height: .85em; flex: none; }
    #pt-dbl-note { display: flex; gap: .7rem; align-items: flex-start; padding: .75rem .85rem; border-radius: .95rem; font-size: .74rem; line-height: 1.4; color: rgb(var(--z300)); border: 1px solid rgb(251 191 36 / .28); background: linear-gradient(100deg, rgb(251 191 36 / .1), rgb(129 140 248 / .12)); }
    #pt-dbl-note b { color: rgb(var(--z100)); font-weight: 800; }
    .pt-dbl-ic { flex: none; display: inline-flex; flex-direction: column; gap: .2rem; padding-top: .1rem; font-size: 1rem; color: rgb(251 191 36); }
    .pt-dbl-ic .pt-sico2:nth-child(2) { color: rgb(165 180 252); }
    html[data-mode="light"] .pt-dbl-ic { color: rgb(180 83 9); }
    html[data-mode="light"] .pt-dbl-ic .pt-sico2:nth-child(2) { color: rgb(67 56 202); }

    #days-list-container > .pt-ses-card { border-left-width: 4px; }
    #days-list-container > .pt-ses-am { border-left-color: rgb(245 158 11 / .85); }
    #days-list-container > .pt-ses-pm { border-left-color: rgb(129 140 248 / .85); }
    #days-list-container > .pt-ses-both { border-left-color: rgb(251 146 60 / .8); }
    #days-list-container > .pt-pair-t { border-bottom-left-radius: .4rem; border-bottom-right-radius: .4rem; }
    #days-list-container > .pt-pair-b { margin-top: .2rem !important; border-top-left-radius: .4rem; border-top-right-radius: .4rem; }
    .pt-ses-tag { display: inline-flex; align-items: center; gap: .3rem; font-weight: 800; }
    .pt-ses-tag.am { color: rgb(252 211 77); }
    .pt-ses-tag.pm { color: rgb(165 180 252); }
    html[data-mode="light"] .pt-ses-tag.am { color: rgb(180 83 9); }
    html[data-mode="light"] .pt-ses-tag.pm { color: rgb(67 56 202); }
    .pt-ses-line { display: flex; align-items: center; gap: .45rem; font-size: .8rem; font-weight: 700; line-height: 1.3; }
    .pt-ses-line + .pt-ses-line { margin-top: .22rem; }
    .pt-ses-line i { flex: none; display: inline-flex; align-items: center; gap: .22rem; min-width: 2.8rem; padding: .1rem .42rem; border-radius: 999px; font-style: normal; font-size: .6rem; font-weight: 800; letter-spacing: .06em; }
    .pt-ses-line i.am { color: rgb(252 211 77); background: rgb(251 191 36 / .14); }
    .pt-ses-line i.pm { color: rgb(165 180 252); background: rgb(129 140 248 / .17); }
    html[data-mode="light"] .pt-ses-line i.am { color: rgb(146 64 14); background: rgb(251 191 36 / .3); }
    html[data-mode="light"] .pt-ses-line i.pm { color: rgb(55 48 163); background: rgb(129 140 248 / .22); }
  `;
  document.head.appendChild(css);
})();
  