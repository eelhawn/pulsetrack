
/* =====================================================================
 * PulseTrack 2.44.0: physique blueprint.
 *  Body screen → Physique blueprint. From your height, wrist and ankle it shows the natural ceiling for chest, arm, forearm, neck,
 *  thigh and calf, and for lean bodyweight, using Casey Butt's formulas (from his article "Your Maximum Muscular Bodyweight and
 *  Measurements" and book "Your Muscular Potential"). It puts your own numbers next to them, names the part that is furthest behind,
 *  and opens Steal a day on a day for it.
 *  - Chest, arm and thigh come from your Body log (Body → More: measurements). Forearm, neck and calf are typed in the blueprint,
 *    because the Body log does not track them. Everything typed here is saved in settings (so it is in backups).
 *  - The formulas work in inches and pounds, with the numbers for lean condition (about 8 to 10% body fat). cm and kg are converted.
 *  - It is a rough ceiling from one author's formulas, not a promise or a standard.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined" || !PT.kit) return;
  const proto = ApplicationUI.prototype, A = () => window.app, K = PT.kit, esc = K.esc, $ = id => document.getElementById(id);
  const IN = 2.54, LB = 2.20462;

  /* Casey Butt, in inches: H height, W wrist (hand side of the bony bump), A ankle (narrowest point) */
  const FORM = {
    chest: (W, A, H) => 1.6817 * W + 1.3759 * A + 0.3314 * H,
    biceps: (W, A, H) => 1.2033 * W + 0.1236 * H,
    forearms: (W, A, H) => 0.9626 * W + 0.0989 * H,
    neck: (W, A, H) => 1.1424 * W + 0.1236 * H,
    thighs: (W, A, H) => 1.3868 * A + 0.1805 * H,
    calves: (W, A, H) => 0.9298 * A + 0.1210 * H
  };
  /** maximum lean body mass in pounds at a body fat percentage */
  const leanMax = (H, W, A, bf) => Math.pow(H, 1.5) * (Math.sqrt(W) / 22.667 + Math.sqrt(A) / 17.0104) * (bf / 224 + 1);
  // the six rows: where "yours" comes from (log = the Body log entry of that name, typed = typed in here), and which Steal a day chip helps
  const ROWS = [
    { k: "chest", label: "Chest", src: "log", logKey: "chest", chip: "chest" },
    { k: "biceps", label: "Arm (flexed)", src: "log", logKey: "arms", chip: "arms" },
    { k: "forearms", label: "Forearm", src: "typed", chip: "arms" },
    { k: "neck", label: "Neck", src: "typed", chip: "shoulders" },
    { k: "thighs", label: "Thigh", src: "log", logKey: "thighs", chip: "quads" },
    { k: "calves", label: "Calf", src: "typed", chip: "calves" }
  ];
  const RANGE = { h: [48, 90], w: [4.5, 10], a: [6, 13] };       // inches, to catch typos

  const bp = a => (a.settings.blueprint && typeof a.settings.blueprint === "object" ? a.settings.blueprint : (a.settings.blueprint = {}));
  const cm = a => a.lenLabel() === "cm";
  const toIn = (a, v) => (cm(a) ? v / IN : v);          // display unit → inches
  const fromIn = (a, v) => (cm(a) ? v * IN : v);        // inches → display unit
  const r1 = v => Math.round(v * 10) / 10;
  const num = v => { const x = parseFloat(v); return x > 0 ? x : 0; };
  const fixedStore = a => WorkoutStorage.saveSettings(a.settings);

  /** latest Body log value of a length key (stored in the unit the app shows) */
  function logged(a, key) {
    const list = (a.body || []).slice().sort((x, y) => (x.date < y.date ? -1 : x.date > y.date ? 1 : 0));
    for (let i = list.length - 1; i >= 0; i--) { const v = parseFloat(list[i][key]); if (v > 0) return { v, date: list[i].date }; }
    return null;
  }
  function latestBodyNum(a, key) { const x = logged(a, key); return x ? x.v : 0; }

  /** everything the blueprint shows, in inches and pounds, or { ok:false, why } while the frame is missing or looks wrong */
  PT.blueprint = function (a) {
    a = a || A(); const b = bp(a);
    const H = num(b.h), W = num(b.w), An = num(b.a);
    if (!(H && W && An)) return { ok: false, why: "need" };
    if (H < RANGE.h[0] || H > RANGE.h[1] || W < RANGE.w[0] || W > RANGE.w[1] || An < RANGE.a[0] || An > RANGE.a[1]) return { ok: false, why: "range" };
    const bf = Math.min(20, Math.max(5, num(b.bf) || 10));
    const rows = ROWS.map(r => {
      const ceil = FORM[r.k](W, An, H); let mine = 0, date = null;
      if (r.src === "log") { const l = logged(a, r.logKey); if (l) { mine = toIn(a, l.v); date = l.date; } }
      else { const m = b.m && b.m[r.k]; if (m > 0) mine = m; }
      return { ...r, ceil, mine, date, pct: mine ? mine / ceil : null, gap: mine ? ceil - mine : null };
    });
    const have = rows.filter(r => r.pct !== null).sort((x, y) => x.pct - y.pct);
    const lean = leanMax(H, W, An, bf), full = lean / (100 - bf) * 100;
    let now = null; const bw = latestBodyNum(a, "bw"), bfNow = latestBodyNum(a, "bf");
    if (bw && bfNow) { const lbNow = (a.unit() === "kg" ? bw * LB : bw) * (1 - bfNow / 100); now = { lean: lbNow, pct: lbNow / lean }; }
    return { ok: true, H, W, A: An, bf, rows, behind: have.length >= 2 ? have[0] : (have.length === 1 ? have[0] : null), measured: have.length, leanMax: lean, fullMax: full, now };
  };
  PT.blueprint.formulas = FORM; PT.blueprint.leanMax = leanMax;

  /* ---------------------------------------------------------------- the sheet */
  let el = null;
  const u = a => a.lenLabel();
  const wShow = (a, lb) => (a.unit() === "kg" ? lb / LB : lb);
  const fmtW = (a, lb) => Math.round(wShow(a, lb)).toLocaleString() + " " + a.wLabel();

  function outHtml(a) {
    const r = PT.blueprint(a), b = bp(a);
    if (!r.ok) return `<p class="pt-bp-p">${r.why === "range" ? "Those numbers look off. Check the units and the tape: height, wrist and ankle should each be a real body measurement." : "Enter your height, wrist and ankle above and the ceilings show here."}</p>`;
    const rows = r.rows.map(x => {
      const pct = x.pct === null ? null : Math.round(x.pct * 100);
      const mineTxt = x.mine ? `${r1(fromIn(a, x.mine))} ${u(a)}` : (x.src === "log" ? "not logged" : "");
      return `<div class="pt-bp-row${r.behind && r.behind.k === x.k && r.measured >= 2 ? " low" : ""}">
        <div class="pt-bp-h"><b>${esc(x.label)}</b><span>${x.mine ? `<em>${esc(mineTxt)}</em> of ` : ""}<i>${r1(fromIn(a, x.ceil))} ${u(a)}</i></span></div>
        <div class="pt-bp-bar" role="img" aria-label="${pct === null ? "no measurement yet" : pct + " percent of the ceiling"}"><span style="width:${pct === null ? 0 : Math.min(100, pct)}%"></span></div>
        <div class="pt-bp-s">${x.src === "typed"
          ? `<label>Yours <input type="number" inputmode="decimal" step="0.1" min="0" data-bpm="${x.k}" value="${b.m && b.m[x.k] ? r1(fromIn(a, b.m[x.k])) : ""}" aria-label="${esc(x.label)} (${u(a)})"> ${u(a)}</label>`
          : `<span>${x.mine ? `From your Body log, ${esc(PT.fmtDate(x.date, { month: "short", day: "numeric" }))}` : "Not in your Body log yet"}</span>`}
          <strong>${pct === null ? "" : pct + "%"}</strong></div></div>`;
    }).join("");
    let behind = "";
    if (r.behind) {
      const x = r.behind, pct = Math.round(x.pct * 100);
      behind = r.measured >= 2
        ? `<div class="pt-bp-behind"><p><b>${esc(x.label)}</b> is furthest behind: ${pct}% of its ceiling, ${r1(fromIn(a, x.gap))} ${u(a)} to go.</p><button type="button" class="pt-st-b" data-bp="find" data-chip="${x.chip}">Find a day for ${esc(x.label.toLowerCase().replace(/ \(.*/, ""))}</button></div>`
        : `<p class="pt-bp-p">Add one more measurement and it can tell you which part is furthest behind.</p>`;
    } else behind = `<p class="pt-bp-p">Log chest, arm and thigh in <button type="button" class="pt-bp-link" data-bp="body">Body → More: measurements</button>, and type forearm, neck and calf here, to see where you stand.</p>`;
    const wt = `<div class="pt-bp-wt"><div><span>Ceiling, lean</span><b>${fmtW(a, r.leanMax)}</b><em>muscle and bone, no fat</em></div>
      <div><span>Ceiling at ${r.bf}% fat</span><b>${fmtW(a, r.fullMax)}</b><em>bodyweight</em></div>
      ${r.now ? `<div><span>You now</span><b>${fmtW(a, r.now.lean)}</b><em>lean, ${Math.round(r.now.pct * 100)}% of it</em></div>` : ""}</div>`;
    return `${rows}${behind}${wt}`;
  }

  function open() {
    const a = A(); el = K.sheet("pt-bp", 58); const b = bp(a), L = u(a);
    const fld = (id, label, val, step) => `<label class="pt-bp-f"><span>${label} (${L})</span><input id="${id}" type="number" inputmode="decimal" step="${step}" min="0" value="${val ? r1(fromIn(a, val)) : ""}"></label>`;
    const c = K.openSheet(el, `${K.head("Physique blueprint", "A natural ceiling for your frame")}
      <p class="pt-bp-p">Your bones set how much muscle you can carry. Casey Butt's formulas turn your height, wrist and ankle into the biggest chest, arm, forearm, neck, thigh and calf a natural lifter could reasonably build, at about 8 to 10% body fat.</p>
      <div class="pt-bp-frame">${fld("pt-bp-h", "Height", b.h, "0.1")}${fld("pt-bp-w", "Wrist", b.w, "0.1")}${fld("pt-bp-a", "Ankle", b.a, "0.1")}</div>
      <p class="pt-bp-tip">Wrist: around the wrist on the hand side of the bony bump. Ankle: the narrowest point above the foot. Arm: flexed biceps, at its biggest.</p>
      <div id="pt-bp-out">${outHtml(a)}</div>
      <p class="pt-bp-fine">Source: Casey Butt, "Your Maximum Muscular Bodyweight and Measurements" (weightrainer.net), and his book Your Muscular Potential. Built from drug-free competitors. A rough guide, not a promise: bones, muscle shape and genetics vary a lot, and few people reach every number.</p>`);
    c.addEventListener("click", clicks);
    c.addEventListener("input", e => { const t = e.target; if (!t || !t.id && !t.dataset.bpm) return; save(t); });
  }
  let timer = null;
  function save(t) {
    const a = A(), b = bp(a), v = parseFloat(t.value), inches = v > 0 ? toIn(a, v) : 0;
    if (t.id === "pt-bp-h") b.h = inches ? r1(inches * 100) / 100 : 0;
    else if (t.id === "pt-bp-w") b.w = inches ? r1(inches * 100) / 100 : 0;
    else if (t.id === "pt-bp-a") b.a = inches ? r1(inches * 100) / 100 : 0;
    else if (t.dataset.bpm) { b.m = b.m || {}; if (inches) b.m[t.dataset.bpm] = inches; else delete b.m[t.dataset.bpm]; }
    else return;
    clearTimeout(timer); timer = setTimeout(() => fixedStore(a), 300);
    redrawOut(t);
  }
  /** redraw the table without touching the field you are typing in (they are re-attached by value) */
  function redrawOut(active) {
    const box = $("pt-bp-out"); if (!box) return;
    const keep = active && active.dataset && active.dataset.bpm ? active.dataset.bpm : null, pos = keep ? active.selectionStart : null;
    box.innerHTML = outHtml(A());
    if (keep) { const n = box.querySelector(`[data-bpm="${keep}"]`); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch (e) { } } }
  }
  function clicks(e) {
    const a = A(), b = e.target.closest("[data-bp]"); if (!b) return;
    if (b.dataset.bp === "find") { K.closeSheet(el); if (PT.steal) PT.steal.open({ chip: b.dataset.chip }); }
    else if (b.dataset.bp === "body") { K.closeSheet(el); a.showView("body"); }
  }
  PT.blueprint.open = open;

  /* ---------------------------------------------------------------- the card on the Body screen */
  function addCard(a) {
    const root = $("body-root"); if (!root || $("pt-bp-card")) return;
    const h = [...root.querySelectorAll("h3")].find(x => /^Latest measurements/.test(x.textContent.trim()));
    const after = h ? h.closest("div.bg-zinc-900, div") : null;
    const r = PT.blueprint(a);
    const card = document.createElement("div"); card.id = "pt-bp-card"; card.className = "bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-2";
    const line = r.ok
      ? (r.behind && r.measured >= 2 ? `Furthest behind: <b class="text-white">${esc(r.behind.label)}</b>, ${Math.round(r.behind.pct * 100)}% of its ceiling.` : `Ceiling set from your frame. Add measurements to compare.`)
      : "Find the natural ceiling for your chest, arms, thighs and calves from your height, wrist and ankle.";
    card.innerHTML = `<h3 class="text-xs font-bold text-white">Physique blueprint</h3><p class="text-[11px] leading-relaxed text-zinc-400">${line}</p>
      <button type="button" id="pt-bp-open" class="w-full py-2.5 bg-zinc-800 text-zinc-100 text-xs font-bold rounded-xl tap-active">${r.ok ? "Open blueprint" : "Set up blueprint"}</button>`;
    if (after && after.parentElement === root) after.insertAdjacentElement("afterend", card); else root.appendChild(card);
  }
  const oBody = proto.renderBodyView;
  proto.renderBodyView = function () {
    const r = oBody.apply(this, arguments);
    try { addCard(this); } catch (e) { console.error("PulseTrack blueprint card", e); }
    return r;
  };
  document.addEventListener("click", e => { if (e.target && e.target.closest && e.target.closest("#pt-bp-open")) open(); });

  const css = document.createElement("style");
  css.id = "pt-v244-bp-css";
  css.textContent = `
    .pt-bp-p { font-size: .78rem; line-height: 1.45; color: rgb(var(--z400)); }
    .pt-bp-tip, .pt-bp-fine { font-size: .68rem; line-height: 1.4; color: rgb(var(--z500)); }
    .pt-bp-link { text-decoration: underline; color: rgb(var(--a400)); font-weight: 700; }
    .pt-bp-frame { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .5rem; }
    .pt-bp-f { display: grid; gap: .25rem; } .pt-bp-f span { font-size: .6rem; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: rgb(var(--z500)); }
    .pt-bp-f input, .pt-bp-s input { width: 100%; min-width: 0; padding: .6rem .65rem; border-radius: .7rem; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); color: rgb(var(--z100)); font-family: ui-monospace, monospace; font-size: .85rem; }
    .pt-bp-f input:focus, .pt-bp-s input:focus { outline: none; border-color: rgb(var(--a500)); }
    #pt-bp-out { display: grid; gap: .55rem; }
    .pt-bp-row { padding: .65rem .75rem; border-radius: .85rem; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); display: grid; gap: .4rem; }
    .pt-bp-row.low { border-color: rgb(251 191 36 / .5); }
    .pt-bp-h { display: flex; justify-content: space-between; align-items: baseline; gap: .5rem; font-size: .8rem; color: rgb(var(--z100)); }
    .pt-bp-h b { font-weight: 800; } .pt-bp-h span { font-size: .72rem; color: rgb(var(--z400)); } .pt-bp-h em { font-style: normal; color: rgb(var(--z100)); font-weight: 700; } .pt-bp-h i { font-style: normal; color: rgb(var(--a400)); font-weight: 800; }
    .pt-bp-bar { height: .5rem; border-radius: 999px; background: rgb(var(--z800)); overflow: hidden; } .pt-bp-bar span { display: block; height: 100%; border-radius: 999px; background: rgb(var(--a500)); }
    .pt-bp-row.low .pt-bp-bar span { background: rgb(251 191 36); }
    .pt-bp-s { display: flex; justify-content: space-between; align-items: center; gap: .5rem; font-size: .68rem; color: rgb(var(--z500)); }
    .pt-bp-s label { display: flex; align-items: center; gap: .4rem; } .pt-bp-s input { width: 5.5rem; padding: .4rem .5rem; }
    .pt-bp-s strong { font-size: .8rem; color: rgb(var(--z200)); }
    .pt-bp-behind { padding: .75rem; border-radius: .85rem; background: rgb(var(--z950)); border: 1px solid rgb(251 191 36 / .35); display: grid; gap: .55rem; }
    .pt-bp-behind p { font-size: .8rem; color: rgb(var(--z200)); } .pt-bp-behind b { color: rgb(var(--z50)); }
    .pt-bp-wt { display: grid; grid-template-columns: repeat(auto-fit, minmax(7rem, 1fr)); gap: .5rem; }
    .pt-bp-wt > div { padding: .6rem .7rem; border-radius: .85rem; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); display: grid; gap: .15rem; }
    .pt-bp-wt span { font-size: .58rem; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: rgb(var(--z500)); } .pt-bp-wt b { font-size: 1rem; color: rgb(var(--z50)); } .pt-bp-wt em { font-style: normal; font-size: .62rem; color: rgb(var(--z500)); }
    html[data-mode="light"] .pt-bp-h i, html[data-mode="light"] .pt-bp-link { color: rgb(var(--a600)); }
  `;
  document.head.appendChild(css);
})();
  