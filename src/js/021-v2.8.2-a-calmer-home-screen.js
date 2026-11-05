
/* =====================================================================
 * PulseTrack 2.8.2: a calmer Home screen.
 *  - 1RM Trophy Room: one quiet line per lift (name, thin bar, best / goal).
 *    Tap a lift for the details (who holds it, % of goal, next milestone) and to set a goal.
 *  - small caps "eyebrow" headings, soft neutral tile icons, a slimmer Consistency card
 * ===================================================================== */
(function () {
  "use strict";
  const proto = ApplicationUI.prototype;
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const css = document.createElement("style");
  css.id = "pt-v28d-css";
  css.textContent = `
    .pt-eyebrow { display: block; font-size: .65rem; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: rgb(var(--z500)); }
    .pt-chev { color: rgb(var(--z600)); font-size: 1.2rem; line-height: 1; flex: none; }
    /* tiles: one soft colour instead of six */
    html #view-home .grid.grid-cols-3 > button > span:first-child { background: rgb(var(--z800)) !important; border-color: transparent !important; }
    /* routine card: no glow, no paragraph (the title and "Up next" say it) */
    #home-program-desc { display: none; }
    #btn-home-resume { box-shadow: none; }
    #view-home > .shadow-xl { box-shadow: none; }
    /* Consistency: one line, no flame box */
    #home-streak-card { padding: .65rem 1rem; }
    #home-streak-card > div:first-child > div:first-child { display: none; }
    #home-streak-card > div:first-child > div:last-child { margin-left: 0; }
    #home-streak-card #home-streak-title { font-size: .65rem; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: rgb(var(--z500)); }
    #home-streak-card #home-monthly-streak { font-size: .75rem; color: rgb(var(--z300)); margin-top: .15rem; }
    /* Trophy Room */
    #trophy-card { padding: .8rem 1rem .5rem; }
    #trophy-room { display: block; }
    .pt-tr { display: grid; grid-template-columns: 6.6rem minmax(0, 1fr) auto; align-items: center; gap: .65rem; width: 100%; text-align: left; padding: .55rem 0; border: 0; background: transparent; }
    .pt-tr + .pt-tr { border-top: 1px solid rgb(var(--z800) / .7); }
    .pt-tr-n { font-size: .78rem; font-weight: 700; color: rgb(var(--z200)); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .pt-tr-bar { height: .25rem; border-radius: 999px; background: rgb(var(--z800)); overflow: hidden; }
    .pt-tr-bar > i { display: block; height: 100%; border-radius: 999px; background: rgb(var(--a500) / .75); }
    .pt-tr-v { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .74rem; color: rgb(var(--z200)); white-space: nowrap; font-variant-numeric: tabular-nums; }
    .pt-tr-v small { font-size: inherit; color: rgb(var(--z500)); }
    .pt-tr.none .pt-tr-n, .pt-tr.none .pt-tr-v { color: rgb(var(--z600)); }
  `;
  document.head.appendChild(css);

  /** The exercise sheet's Back button can say where it goes (a back function may carry a ptLabel) */
  const oEx = proto.openExerciseSheet;
  proto.openExerciseSheet = function (name, back) {
    const r = oEx.apply(this, arguments);
    try { const b = back && back.ptLabel && document.getElementById("ex-back"); if (b) b.textContent = "\u2039 " + back.ptLabel; } catch (e) { }
    return r;
  };

  /** Best PR for a big lift, with the exercise that holds it */
  function bestFor(app, l) {
    let best = 0, holder = "";
    Object.keys(app.prs || {}).forEach(n => {
      if (l.match.test(n) && !(l.exclude && l.exclude.test(n)) && app.prs[n] > best) { best = app.prs[n]; holder = n; }
    });
    return { best, holder };
  }

  proto.renderTrophyRoom = function () {
    const box = document.getElementById("trophy-room");
    if (!box) return;
    const app = this;
    const goals = app.settings.goals || {};
    const kg = app.unit() === "kg", u = kg ? "kg" : "lb";
    box.innerHTML = "";
    BIG_LIFTS.forEach(l => {
      const { best, holder } = bestFor(app, l);
      const goal = goals[l.key] || (kg ? Math.round((l.goal * KG_PER_LB) / 5) * 5 : l.goal);
      const pct = Math.min(100, Math.round((best / goal) * 100));
      const steps = kg ? [60, 100, 140, 180, 220, 260, 300] : [135, 225, 315, 405, 495, 585, 675];
      const next = steps.find(m => m > best);
      const plates = next ? (kg ? (next - 20) / 40 : (next - 45) / 90) : 0;
      const row = document.createElement("button");
      row.type = "button";
      row.className = "pt-tr tap-active" + (best ? "" : " none");
      row.dataset.lift = l.key;
      row.innerHTML = `<span class="pt-tr-n">${esc(l.key)}</span>
        <span class="pt-tr-bar"><i style="width:${best ? Math.max(pct, 3) : 0}%"></i></span>
        <span class="pt-tr-v">${best ? esc(PT.num(best, best % 1 ? 1 : 0)) + " <small>/ " + esc(PT.num(goal, goal % 1 ? 1 : 0)) + "</small>" : "<small>no PR yet</small>"}</span>`;
      row.addEventListener("click", async () => {
        const lines = [];
        if (best) lines.push(`Best: ${PT.num(best, best % 1 ? 1 : 0)} ${u} estimated 1RM (${holder}), ${pct}% of your goal.`);
        else lines.push("No PR logged for this lift yet.");
        if (next) lines.push(`Next milestone: ${next} ${u} (${plates}-plate).`);
        lines.push(`Goal in ${u}:`);
        const v = parseFloat(await PT.prompt("Goal 1RM for " + l.key + " (" + app.wLabel() + ")?", goal, { type: "number", title: l.key + " goal", body: lines.join("\n"), ok: "Save goal" }));
        if (v > 0) {
          app.settings.goals = Object.assign({}, app.settings.goals, { [l.key]: v });
          WorkoutStorage.saveSettings(app.settings);
          app.renderTrophyRoom();
        }
      });
      box.appendChild(row);
    });
  };
})();
  