
/* =====================================================================
 * PulseTrack 2.34.0: Progress page, organised.
 * Overview, Muscles and Strength used to share the page with about 18 collapsed sections that sat
 * under every tab. Now there are six tabs (Overview, Muscles, Strength, History, Rewards, Social) and
 * every section lives under the tab it belongs to, in labelled groups. Section rows get an icon tile
 * and a one-line description. The cards themselves are unchanged; they are only moved.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined") return;
  const proto = ApplicationUI.prototype;
  const A = () => window.app;
  const $ = id => document.getElementById(id);

  const ICON = {
    overview: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
    muscles: '<circle cx="12" cy="5" r="2.5"/><path d="M12 8v7M6.5 10.5 12 8l5.5 2.5M9 21l3-6 3 6"/>',
    strength: '<path d="M6 7v10M18 7v10M3 9.5v5M21 9.5v5M6 12h12"/>',
    history: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/>',
    rewards: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3"/>',
    social: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.3"/><path d="M17 14c2.8 0 5 2 5 5"/>'
  };
  const TABS = [["overview", "Overview"], ["muscles", "Muscles"], ["strength", "Strength"], ["history", "History"], ["rewards", "Rewards"], ["social", "Social"]];

  /* What goes where. Each item is a key that find() knows how to locate. A null label means no heading. */
  const LAYOUT = {
    overview: [[null, ["stat"]], ["This week", ["wk", "deload", "plateau"]], ["Latest records", ["recentprs"]], ["All time", ["life"]]],
    muscles: [[null, ["muscle", "balance", "pmap"]]],
    strength: [[null, ["big3", "next", "lvls"]], ["Find your gaps", ["weak"]], ["Ranks and goals", ["rank", "goals", "attempt"]]],
    history: [["Recaps", ["recap", "report", "month", "year"]], ["Over time", ["heat", "prs"]]],
    rewards: [[null, ["hub"]], ["Level and season", ["lvl", "season"]], ["Challenges", ["qst", "chal", "chk"]], ["Collection", ["badges", "shop", "wish"]]],
    social: [["Friends", ["buddy", "wall"]], ["Family", ["boss", "famrecap", "fam"]]]
  };
  const ID = { hub: "pt-pg-hub", wish: "pt-pg-wish", wk: "pt-pg-wk", report: "pt-pg-report", month: "pt-pg-month", year: "pt-pg-recap", heat: "pt-pg-heat", prs: "pt-pg-prs", pmap: "pt-pg-pmap", rank: "pt-pg-rank", goals: "pt-pg-goals", lvl: "pt-pg-lvl", season: "pt-pg-season", qst: "pt-pg-qst", chal: "pt-pg-chal", chk: "pt-pg-chk", badges: "pt-pg-badges", shop: "pt-pg-shop", buddy: "pt-pg-buddy", boss: "pt-pg-boss", wall: "pt-pg-wall", fam: "pt-pg-fam", famrecap: "pt-pg-famrecap", muscle: "pt-muscle-card", next: "pt-next-card", weak: "pt-weak-card", deload: "pt-dlcheck-card", attempt: "pt-attempt-card", balance: "pt-balance-card", big3: "strength-card", lvls: "pt-lvls-card", recap: "recap-card" };
  const SUB = {
    lvl: "XP, level and profile frames", wk: "Your goal and your streak", qst: "New quests every week", rank: "Where your big lifts rank", recap: "Your year in numbers",
    season: "Tiers and rewards", chal: "Take on a challenge", chk: "A quick daily check-in", shop: "Colors, frames, titles and more", wish: "Set your own prizes", pmap: "What you train, on a body map",
    buddy: "Share workouts with friends", wall: "Best lifts on the board", month: "Your month, graded", report: "Last 7 days vs the week before",
    badges: "Milestones you have earned", goals: "Targets for your lifts", heat: "Every day you trained", prs: "Your records over time", fam: "Compare with family", boss: "Beat the weekly boss together", famrecap: "Who won the week, and how"
  };
  const EMOJI = /^(?:\p{Extended_Pictographic}️?(?:‍\p{Extended_Pictographic}️?)*)\s*/u;

  function find(root, key) {
    if (ID[key]) return root.querySelector("#" + ID[key]);
    if (key === "stat") return [...root.querySelectorAll("[data-ptab=overview] > *")].find(e => /^Streak/.test(e.textContent.trim()) && !e.id);
    if (key === "plateau") return root.querySelector(".pt-pcfold") || root.querySelector("#pt-plateau-card");
    const byTitle = re => [...root.querySelectorAll("[data-ptab] > div")].find(e => { const h = e.querySelector("h3"); return h && re.test(h.textContent.trim()); });
    if (key === "life") return byTitle(/^Lifetime/);
    if (key === "recentprs") return byTitle(/^Recent PRs/);
    return null;
  }

  /* Turn "⚡ Level 7" into an icon tile + title + one-line description. Safe to run twice. */
  function decorate(d) {
    const s = d.querySelector(":scope > summary"); if (!s || s.dataset.pt === "1") return; s.dataset.pt = "1";
    const title = s.firstElementChild; if (!title) return;
    const m = EMOJI.exec(title.textContent.trim());
    const ico = document.createElement("span"); ico.className = "pt-ico"; ico.setAttribute("aria-hidden", "true");
    if (m && !title.children.length) { ico.textContent = m[0].trim(); title.textContent = title.textContent.trim().slice(m[0].length); } else if (m) return;
    const id = d.id.replace("pt-pg-", "");
    let sub = SUB[id] || "";
    if (id === "badges") { const n = d.querySelector(".pt-bhead .text-sm"); if (n) sub = n.textContent.replace(/\s+/g, " ").trim() + " earned"; }
    const wrap = document.createElement("span"); wrap.className = "pt-ttl";
    s.insertBefore(wrap, title); wrap.appendChild(title);
    if (sub) { const e = document.createElement("span"); e.className = "pt-sub"; e.textContent = sub; wrap.appendChild(e); }
    s.insertBefore(ico, wrap);
  }

  /* the "Plateau check · nothing is stuck" fold gets the same icon tile as the other rows */
  function decorateFold(f) {
    const s = f.querySelector(":scope > summary"); if (!s || s.dataset.pt === "1") return; s.dataset.pt = "1";
    const note = s.querySelector("span"), stuck = note ? note.textContent.replace(/^\s*·\s*/, "").trim() : "";
    f.addEventListener("toggle", () => { const a = A(); if (a) a.__plOpen = f.open; });
    if (A() && A().__plOpen) f.open = true;
    s.innerHTML = '<span class="pt-ico" aria-hidden="true">🧱</span><span class="pt-ttl"><span class="font-bold text-white">Plateau check</span><span class="pt-sub">' + (stuck ? stuck.charAt(0).toUpperCase() + stuck.slice(1) : "Lifts that have stopped climbing") + '</span></span><span class="pt-chev">›</span>';
  }

  let inited = false;
  function organize(app, want) {
    const root = $("progress-body"); if (!root || root.querySelector("[data-ptab=history]")) return;
    const bar = $("pt-ptabs"); if (!bar) return;
    // find everything before anything moves
    const found = {}, used = new Set();
    Object.values(LAYOUT).forEach(gs => gs.forEach(([, keys]) => keys.forEach(k => { const e = find(root, k); if (e) { found[k] = e; used.add(e); } })));
    // the original three panels
    const panels = {}, leftover = [];
    TABS.forEach(([k]) => {
      let p = root.querySelector(`[data-ptab=${k}]`);
      if (!p) { p = document.createElement("div"); p.dataset.ptab = k; }
      [...p.children].forEach(c => { if (!used.has(c)) leftover.push(c); });
      p.className = "pt-panel"; p.innerHTML = ""; panels[k] = p;
    });
    TABS.forEach(([k, t]) => {
      const groups = LAYOUT[k]; let any = false;
      groups.forEach(([label, keys]) => {
        const els = keys.map(x => found[x]).filter(Boolean); if (!els.length) return; any = true;
        const sec = document.createElement("section"); sec.className = "pt-grpbox";
        if (label) { const h = document.createElement("div"); h.className = "pt-grp"; h.innerHTML = `<span>${label}</span>`; sec.appendChild(h); }
        els.forEach(e => { if (e.tagName === "DETAILS" && e.classList.contains("pt-pg")) decorate(e); else if (e.classList.contains("pt-pcfold")) decorateFold(e); sec.appendChild(e); });
        panels[k].appendChild(sec);
      });
      if (!any) panels[k].innerHTML = '<p class="pt-empty">Nothing here yet.</p>';
    });
    // anything the layout does not know about (a future card) goes to the end of Overview rather than vanishing
    leftover.forEach(e => panels.overview.appendChild(e));
    [...root.children].forEach(e => {
      if (e === bar || e.dataset.ptab || used.has(e)) return;
      if (/^pt-pg-rew\d?$|^pt-pg-extra$/.test(e.id)) { [...e.children].forEach(c => { if (!used.has(c)) { if (c.tagName === "DETAILS") decorate(c); panels.overview.appendChild(c); } }); e.remove(); return; }
      panels.overview.appendChild(e);
    });
    root.querySelectorAll("[data-ptab]").forEach(p => { if (!Object.values(panels).includes(p)) p.remove(); });
    TABS.forEach(([k]) => root.appendChild(panels[k]));
    // first visit: Season starts closed (Level stays open at the top of Rewards), so Rewards is not a wall of cards
    if (!inited) { inited = true; const d = $("pt-pg-season"); if (d && d.open) d.open = false; }
    // tab bar
    const nb = bar.cloneNode(false); nb.id = "pt-ptabs"; nb.className = "pt-tabbar";
    nb.innerHTML = TABS.map(([k, t]) => `<button type="button" data-tab="${k}" class="pt-ptab tap-active"><svg viewBox="0 0 24 24" aria-hidden="true">${ICON[k]}</svg><span>${t}</span></button>`).join("");
    bar.replaceWith(nb);
    const cur = TABS.some(([k]) => k === want) ? want : "overview";
    const show = k => {
      app._progTab = k;
      nb.querySelectorAll(".pt-ptab").forEach(b => { const on = b.dataset.tab === k; b.classList.toggle("bg-emerald-600", on); b.classList.toggle("text-white", on); b.classList.toggle("text-zinc-400", !on); b.setAttribute("aria-selected", on ? "true" : "false"); });
      TABS.forEach(([x]) => panels[x].classList.toggle("hidden", x !== k));
    };
    nb.addEventListener("click", e => { const b = e.target.closest(".pt-ptab"); if (b) { show(b.dataset.tab); window.scrollTo({ top: 0 }); } });
    show(cur);
  }

  // picking a week count keeps the Plateau check open, so you can keep adjusting it
  document.addEventListener("click", e => { if (e.target.closest && e.target.closest(".pt-plw")) { const a = A(); if (a) a.__plOpen = true; } }, true);

  const oPV = proto.renderProgressView;
  proto.renderProgressView = function () {
    const want = this._progTab;
    const r = oPV.apply(this, arguments);
    try { organize(this, want); } catch (e) { console.error("PulseTrack progress tabs", e); }
    return r;
  };

  const css = document.createElement("style"); css.id = "pt-v234-css";
  css.textContent = `
    #pt-ptabs.pt-tabbar { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: .15rem; padding: .25rem; border-radius: 1.1rem; background: rgb(var(--z900)); border: 1px solid rgb(var(--z800)); margin-bottom: .5rem; }
    .pt-tabbar .pt-ptab { display: flex; flex-direction: column; align-items: center; gap: .22rem; padding: .5rem 0 .42rem; border-radius: .85rem; font-size: .625rem; font-weight: 700; letter-spacing: .01em; line-height: 1; min-width: 0; }
    .pt-tabbar .pt-ptab svg { width: 1.2rem; height: 1.2rem; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
    .pt-tabbar .pt-ptab span { max-width: 100%; overflow: hidden; text-overflow: ellipsis; }
    .pt-panel:not(.hidden) { display: flex; flex-direction: column; gap: 1.4rem; }
    .pt-panel > * { margin: 0 !important; }
    .pt-grpbox { display: flex; flex-direction: column; gap: .6rem; }
    .pt-grpbox > * { margin: 0 !important; }
    .pt-grp { display: flex; align-items: center; gap: .6rem; padding: 0 .25rem; font-size: .625rem; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; color: rgb(var(--z500)); }
    .pt-grp::after { content: ""; flex: 1; height: 1px; background: rgb(var(--z800)); }
    .pt-empty { padding: 2rem 1rem; text-align: center; font-size: .8rem; color: rgb(var(--z500)); }
    #progress-body .pt-pg { border-radius: 1.1rem; overflow: hidden; transition: border-color .15s ease; }
    #progress-body .pt-pg[open] { border-color: rgb(var(--a600) / .4); }
    #progress-body .pt-pg > summary { list-style: none; gap: .75rem; padding: .7rem .9rem; min-height: 3.5rem; }
    #progress-body .pt-pg > summary::-webkit-details-marker { display: none; }
    #progress-body .pt-pg[open] > summary { border-bottom: 1px solid rgb(var(--z800)); margin-bottom: .9rem; }
    .pt-ico { flex: none; width: 2.3rem; height: 2.3rem; border-radius: .8rem; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; line-height: 1; background: rgb(var(--a600) / .13); border: 1px solid rgb(var(--a600) / .26); }
    .pt-ttl { flex: 1; min-width: 0; display: block; }
    .pt-ttl > span:first-child { display: block; font-size: .8125rem; line-height: 1.2; }
    span.pt-sub { display: block; margin-top: .18rem; font-size: .6875rem; line-height: 1.2; color: rgb(var(--z500)); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    #progress-body .pt-pg > summary > .pt-chev { margin-left: .1rem; }
    #progress-body .pt-pcfold { border-radius: 1.1rem; padding: 0 .9rem; }
    #progress-body .pt-pcfold > summary { display: flex; align-items: center; gap: .75rem; padding: .7rem 0; min-height: 3.5rem; }
    #progress-body .pt-pcfold > summary::after { content: none; }
    #progress-body .pt-pcfold > summary .pt-ttl > span:first-child { color: #fff; font-weight: 700; font-size: .8125rem; }
    #progress-body .pt-pcfold > summary .pt-sub { color: rgb(var(--z500)); font-weight: 500; font-size: .6875rem; }
    #progress-body .pt-pcfold > summary .pt-chev { color: rgb(var(--z500)); font-weight: 400; }
    #progress-body .pt-pcfold[open] > summary { border-bottom: 1px solid rgb(var(--z800)); margin-bottom: .6rem; }
    #progress-body .pt-pcfold[open] > #pt-plateau-card { border: 0; background: transparent; padding: 0 0 .9rem; }
    #progress-body .pt-pcfold[open] > #pt-plateau-card > h3 { display: none; }
    @media (min-width: 1024px) {
      #progress-body { display: block; }
      #pt-ptabs.pt-tabbar { max-width: 34rem; }
      #progress-body > .pt-panel { margin-top: 1rem !important; }
      .pt-panel:not(.hidden) { display: grid; grid-template-columns: 1fr 1fr; gap: 1.4rem 1rem; align-items: start; }
      .pt-panel > .pt-grpbox:only-child { grid-column: 1 / -1; }
    }
  `;
  document.head.appendChild(css);
})();
  