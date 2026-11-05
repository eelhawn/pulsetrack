
/* =====================================================================
 * PulseTrack 2.42.0: what you have moved.
 *  - The Lifetime card on Progress → Overview gets a "What you've moved" block: your lifetime volume turned into things a landscaper
 *    actually hauls (bags of topsoil and concrete, yards of mulch, pallets of sod, pickup trucks, mini excavators, semi loads),
 *    with a Share button that makes a picture for the group chat. Weights are typical round numbers, not exact.
 *  - (The 40-second set timer lives in m43a.js.)
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  const proto = ApplicationUI.prototype, A = () => window.app;
  const LB = 2.20462;

  /* typical weights, in pounds: a 40 lb bag of topsoil, an 80 lb bag of concrete mix, about 700 lb in a yard of shredded mulch,
     about 2,000 lb on a pallet of sod, a half-ton pickup (about 5,000 lb), a mini excavator (about 8,000 lb), a legal semi load (80,000 lb) */
  const ITEMS = [
    { k: "topsoil", w: 40, one: "40-lb bag of topsoil", many: "40-lb bags of topsoil", ico: "🌱" },
    { k: "concrete", w: 80, one: "80-lb bag of concrete mix", many: "80-lb bags of concrete mix", ico: "🧱" },
    { k: "mulch", w: 700, one: "yard of mulch", many: "yards of mulch", ico: "🪵" },
    { k: "sod", w: 2000, one: "pallet of sod", many: "pallets of sod", ico: "🟩" },
    { k: "truck", w: 5000, one: "pickup truck", many: "pickup trucks", ico: "🛻" },
    { k: "excavator", w: 8000, one: "mini excavator", many: "mini excavators", ico: "🚜" },
    { k: "semi", w: 80000, one: "fully loaded semi", many: "fully loaded semis", ico: "🚛" }
  ];

  /** n as a short friendly number: 1.4, 12, 1,250 */
  function short(n) { return n < 10 ? String(Math.round(n * 10) / 10).replace(/\.0$/, "") : Math.round(n).toLocaleString(); }
  function label(it, n) { const r = n < 10 ? Math.round(n * 10) / 10 : Math.round(n); return r === 1 ? it.one : it.many; }

  /** Lifetime volume in pounds, and the haul list: the biggest thing that fits at least once, then up to three smaller things. */
  PT.haul = function (a) {
    a = a || A();
    const vol = (a.sessions || []).reduce((s, x) => s + (parseFloat(x.vol) || 0), 0);
    const lb = a.unit && a.unit() === "kg" ? vol * LB : vol;
    const fit = ITEMS.filter(i => lb / i.w >= 1);
    if (!fit.length) return { lb, big: null, rows: [] };
    const big = fit[fit.length - 1], rows = fit.slice(0, -1).slice(-3).reverse();
    const mk = it => ({ it, n: lb / it.w, text: short(lb / it.w) + " " + label(it, lb / it.w) });
    return { lb, big: mk(big), rows: rows.map(mk) };
  };

  function html(h, a) {
    if (!h.big) {
      return `<div class="pt-haul" id="pt-haul"><div class="pt-haul-h">🚚 What you've moved</div><p class="pt-haul-s">Log a few workouts and your lifting shows up here as things you haul on the job.</p></div>`;
    }
    const u = a.wLabel();
    return `<div class="pt-haul" id="pt-haul">
      <div class="pt-haul-h">🚚 What you've moved</div>
      <div class="pt-haul-big"><span class="pt-haul-i" aria-hidden="true">${h.big.it.ico}</span><span>About <b>${PT.esc(h.big.text)}</b></span></div>
      <p class="pt-haul-s">Your lifetime lifting volume, in things you load and unload for work.</p>
      ${h.rows.length ? `<div class="pt-haul-rows">${h.rows.map(r => `<div><span aria-hidden="true">${r.it.ico}</span><span>${PT.esc(r.text)}</span></div>`).join("")}</div>` : ""}
      <button type="button" class="pt-haul-share tap-active" id="pt-haul-share">Share this</button>
      <p class="pt-haul-f">Typical weights, rounded. Volume is weight × reps over every saved workout (${PT.esc(Math.round(a.unit && a.unit() === "kg" ? h.lb / LB : h.lb).toLocaleString())} ${u}).</p>
    </div>`;
  }

  function add(a) {
    const root = document.getElementById("progress-body");
    if (!root) return;
    const card = [...root.querySelectorAll("[data-ptab] > div, div")].find(e => { const t = e.querySelector(":scope > h3"); return t && /^Lifetime/.test(t.textContent.trim()); });
    if (!card || card.querySelector("#pt-haul")) return;
    card.insertAdjacentHTML("beforeend", html(PT.haul(a), a));
  }

  const oP = proto.renderProgressView;
  proto.renderProgressView = function () {
    const r = oP.apply(this, arguments);
    try { add(this); } catch (e) { console.error("PulseTrack haul", e); }
    return r;
  };

  document.addEventListener("click", e => {
    if (!e.target.closest || !e.target.closest("#pt-haul-share")) return;
    const a = A(), h = PT.haul(a); if (!h.big) return;
    const first = (a.sessions || []).reduce((m, s) => (!m || s.date < m ? s.date : m), null);
    PT.shareCard({
      icon: h.big.it.ico, kicker: "What I've moved", title: h.big.text.replace(/^(\S+) /, "$1 "), sub: "My lifetime lifting volume, in things I haul for work. Typical weights, rounded.",
      lines: [["Volume", Math.round(a.unit() === "kg" ? h.lb / LB : h.lb).toLocaleString() + " " + a.wLabel()], ["Workouts", String((a.sessions || []).length)], ["Since", first ? PT.fmtDate(first, { month: "short", year: "numeric" }) : "-"]],
      c: ["#bef264", "#16a34a"]
    });
  });

  const css = document.createElement("style");
  css.id = "pt-v242-css";
  css.textContent = `
    .pt-haul { margin-top: .85rem; padding-top: .85rem; border-top: 1px solid rgb(var(--z800)); }
    .pt-haul-h { font-size: .68rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: rgb(var(--z400)); }
    .pt-haul-big { display: flex; align-items: center; gap: .65rem; margin-top: .5rem; font-size: 1.05rem; line-height: 1.25; color: rgb(var(--z100)); }
    .pt-haul-big b { color: rgb(var(--a400)); font-weight: 900; }
    .pt-haul-i { flex: none; width: 2.6rem; height: 2.6rem; border-radius: .9rem; display: grid; place-items: center; font-size: 1.5rem; background: rgb(var(--z800)); }
    .pt-haul-s { margin-top: .4rem; font-size: .72rem; color: rgb(var(--z400)); }
    .pt-haul-rows { display: grid; gap: .3rem; margin-top: .6rem; }
    .pt-haul-rows > div { display: flex; align-items: center; gap: .5rem; font-size: .78rem; color: rgb(var(--z200)); }
    .pt-haul-rows > div > span:first-child { width: 1.4rem; text-align: center; }
    .pt-haul-share { margin-top: .75rem; padding: .5rem .9rem; border-radius: .7rem; font-size: .75rem; font-weight: 700; background: rgb(var(--z800)); color: rgb(var(--z100)); }
    .pt-haul-f { margin-top: .6rem; font-size: .62rem; color: rgb(var(--z500)); }
    html[data-mode="light"] .pt-haul-big b { color: rgb(var(--a600)); }
  `;
  document.head.appendChild(css);
})();
  