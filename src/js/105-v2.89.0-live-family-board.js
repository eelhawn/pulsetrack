/* =====================================================================
 * PulseTrack 2.89.0: a live family board.
 *
 * Before, the board only moved when somebody pasted a code. Now one person starts a family board, shares ONE family code, and everyone
 * who types it in once sees everybody's updates arrive on their own (Progress > Social > Family board).
 *
 *  - It is opt-in and off until somebody starts or joins a board. With it off nothing here touches the network. The app still works
 *    offline; a failed request is just a grey "trying again" line and the old paste codes keep working next to it.
 *  - There are no accounts and no server of ours. Phones swap small messages through the free public relay ntfy.sh.
 *  - Privacy: the family code (16 letters and numbers, 80 bits) is never sent. Two things are worked out from it on the phone
 *    (PBKDF2): a hard-to-guess topic name (the "mailbox") and an AES-GCM key. Every message is encrypted with that key before it leaves
 *    the phone, so the relay only sees scrambled text, a mailbox name and a phone's network address. Anybody who has the code can read
 *    and post, so the code is for the family only. "Leave" forgets it.
 *  - What is sent is the same update code the board already used (PTF2: name, level, streak, the last 4 weeks, lift bests), so the
 *    receiving side is the existing receive() and the boss fight, weekly recap and rankings follow without changes.
 *  - Sending: when something changed since the last send (or about every 6 hours), at most once a minute, and after a workout.
 *    Receiving: on opening the app, when you come back to it, every ~40 s while the family board is on screen and every ~4 minutes
 *    otherwise. The relay keeps messages about 12 hours, so each phone keeps what it has seen (settings.fam2) and the board shows
 *    "updated 3 days ago" for people who have not opened the app lately.
 *  settings.live = { code, last (newest relay time seen), pub (when I last sent), fp (what I last sent) }.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined" || !PT.famKit || !PT.famReceive || !PT.famUpdateCode) return;
  const proto = ApplicationUI.prototype;
  const A = () => window.app;
  const $ = id => document.getElementById(id);
  const esc = s => PT.esc(s);
  const K = PT.famKit;
  const RELAY = "https://ntfy.sh/";
  const ALPHA = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";   // 32 symbols with no 0 O 1 I, so a code read out loud or typed on a phone is hard to get wrong
  const CODE_LEN = 16, HOUR = 3600000, MIN = 60000;
  const RESEND = 6 * HOUR, MIN_GAP = MIN, GAP_OPEN = 40 * 1000, GAP_AWAY = 4 * MIN, MAX_LINES = 300, MAX_MSG = 4096;
  const save = a => { try { WorkoutStorage.saveSettings((a || A()).settings); } catch (e) { } };
  const num = v => { const n = parseFloat(v); return isFinite(n) ? n : 0; };
  const te = new TextEncoder(), td = new TextDecoder();

  /* ============================================================== the family code */
  const pretty = c => c.replace(/(.{4})(?=.)/g, "$1-");
  const valid = c => typeof c === "string" && c.length === CODE_LEN && [...c].every(ch => ALPHA.indexOf(ch) >= 0);
  function newCode() {
    const out = []; const buf = new Uint8Array(64); let i = 64;
    while (out.length < CODE_LEN) {
      if (i >= buf.length) { crypto.getRandomValues(buf); i = 0; }
      const b = buf[i++] & 31; out.push(ALPHA[b]);     // 32 symbols and 8 bits: taking the low 5 bits is exactly even
    }
    return out.join("");
  }
  /** a typed or pasted code (any case, with or without dashes or spaces, or inside a message) as 16 clean letters, or "" */
  function parseCode(text) {
    const s = String(text || "").toUpperCase(), re = /(?:^|[^A-Z0-9])([A-Z0-9]{4}(?:[\s-]+[A-Z0-9]{4}){3})(?![A-Z0-9])/g; let m;
    while ((m = re.exec(s))) { const c = m[1].replace(/[^A-Z0-9]/g, ""); if (valid(c)) return c; re.lastIndex = m.index + 1; }   // a message with other words: take the first group of four that is a real code
    const c = s.replace(/[^A-Z0-9]/g, ""); return valid(c) ? c : "";
  }

  /* ============================================================== scrambling */
  const hex = u8 => [...u8].map(b => b.toString(16).padStart(2, "0")).join("");
  const b64 = u8 => { let s = ""; for (let i = 0; i < u8.length; i += 4096) s += String.fromCharCode.apply(null, u8.subarray(i, i + 4096)); return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); };
  const unb64 = t => { const s = atob(String(t).replace(/-/g, "+").replace(/_/g, "/")); const u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u; };
  const supported = () => !!(window.crypto && crypto.subtle && crypto.getRandomValues && typeof fetch === "function");
  let ctxMemo = null;
  /** the mailbox name and the key, both worked out from the code (cached for the session) */
  async function derive(code) {
    if (ctxMemo && ctxMemo.code === code) return ctxMemo.p;
    const p = (async () => {
      const base = await crypto.subtle.importKey("raw", te.encode(code), "PBKDF2", false, ["deriveBits"]);
      const bits = async (salt, n) => new Uint8Array(await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: te.encode(salt), iterations: 100000 }, base, n));
      const [t, k] = await Promise.all([bits("pulsetrack/mailbox/1", 128), bits("pulsetrack/key/1", 256)]);
      return { topic: "pt-" + hex(t), key: await crypto.subtle.importKey("raw", k, "AES-GCM", false, ["encrypt", "decrypt"]) };
    })();
    ctxMemo = { code, p }; p.catch(() => { if (ctxMemo && ctxMemo.p === p) ctxMemo = null; });
    return p;
  }
  async function encrypt(key, text) {
    const iv = crypto.getRandomValues(new Uint8Array(12)), ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, te.encode(text)));
    const all = new Uint8Array(iv.length + ct.length); all.set(iv, 0); all.set(ct, iv.length);
    return "PTL1." + b64(all);
  }
  /** the text, or null when this is not a message made with this key (another family, rubbish, tampered) */
  async function decrypt(key, msg) {
    try {
      const m = String(msg || "").match(/^PTL1\.([A-Za-z0-9_-]+)$/); if (!m) return null;
      const all = unb64(m[1]); if (all.length < 12 + 17) return null;
      return td.decode(await crypto.subtle.decrypt({ name: "AES-GCM", iv: all.subarray(0, 12) }, key, all.subarray(12)));
    } catch (e) { return null; }
  }

  /* ============================================================== the relay */
  async function http(url, opt) {
    const ac = new AbortController(), t = setTimeout(() => ac.abort(), 12000);
    try { return await fetch(url, Object.assign({ signal: ac.signal, cache: "no-store", credentials: "omit", referrerPolicy: "no-referrer" }, opt || {})); }
    finally { clearTimeout(t); }
  }
  /** my update without its time stamp, so "nothing changed" can be told apart from "newer" */
  function fingerprint(tok) {
    try { const o = JSON.parse(decodeURIComponent(escape(atob(String(tok).split(".")[1])))); delete o.t; return JSON.stringify(o); } catch (e) { return String(tok); }
  }
  const live = a => { const s = a && a.settings && a.settings.live; return s && typeof s === "object" && valid(s.code) ? s : null; };

  const S = { busy: false, last: 0, ok: 0, err: "", found: [] };     // this session only: the status line
  const famVisible = () => { const e = $("pt-pg-fam"); return !!(e && e.open !== false && e.getClientRects().length && !document.hidden); };

  async function publish(a, L, c, force) {
    if (!a.settings.myName) return false;
    const tok = PT.famUpdateCode(a), fp = fingerprint(tok), now = Date.now();
    if (fp === L.fp && now - num(L.pub) < RESEND) return false;     // nothing new (a Refresh does not send the same thing again)
    if (!force && now - num(L.pub) < MIN_GAP) return false;         // at most once a minute on its own
    const msg = await encrypt(c.key, tok);
    if (msg.length > MAX_MSG) return false;
    const res = await http(RELAY + c.topic, { method: "POST", body: msg });
    if (!res.ok) throw new Error("relay " + res.status);
    L.pub = now; L.fp = fp; try { PT.famMarkSent(); } catch (e) { }
    return true;
  }
  /** read what arrived since last time and feed it to the same receiver the pasted codes use */
  async function pull(a, L, c) {
    const since = num(L.last) ? Math.max(1, Math.floor(num(L.last)) - 60) : "all";   // a minute of overlap is harmless: the receiver keeps only the newest
    const res = await http(RELAY + c.topic + "/json?poll=1&since=" + since);
    if (!res.ok) throw new Error("relay " + res.status);
    const lines = (await res.text()).split("\n").slice(-MAX_LINES), names = []; let max = num(L.last);
    for (const line of lines) {
      if (!line || line.length > MAX_MSG * 2) continue;
      let m; try { m = JSON.parse(line); } catch (e) { continue; }
      if (!m || m.event !== "message" || typeof m.message !== "string" || m.message.length > MAX_MSG) continue;
      max = Math.max(max, Math.min(num(m.time), Date.now() / 1000 + 3600));
      const plain = await decrypt(c.key, m.message); if (!plain) continue;
      const r = PT.famReceive(plain, a); (r.names || []).forEach(n => { if (names.indexOf(n) < 0) names.push(n); });
    }
    if (max !== num(L.last)) { L.last = max; save(a); }
    return names;
  }

  /** one round: read, then send if there is something new. Never throws. */
  async function sync(a, opt) {
    opt = opt || {}; a = a || A(); const L = live(a); if (!a || !L) return { ok: false, names: [] };
    if (S.busy) return { ok: false, names: [] };
    if (!supported()) { S.err = "old"; paint(a); return { ok: false, names: [] }; }
    if (navigator.onLine === false) { S.err = "offline"; paint(a); return { ok: false, names: [] }; }
    S.busy = true; S.last = Date.now(); let names = [], ok = false;
    try {
      const c = await derive(L.code);
      names = await pull(a, L, c);
      await publish(a, L, c, !!opt.force); save(a);
      S.ok = Date.now(); S.err = ""; ok = true;
    } catch (e) { S.err = e && e.name === "AbortError" ? "slow" : "net"; }
    S.busy = false;
    if (names.length) { S.found = names; redraw(a); } else paint(a);
    if (opt.announce && ok) a.toast(names.length ? `Found ${names.join(", ")} 💪` : "Joined. People show up here when they open PulseTrack");
    return { ok, names };
  }

  /* ============================================================== the card on the board */
  const statusOf = () => {
    if (S.err === "offline") return ["○ Offline", "text-zinc-400"];
    if (S.err === "old") return ["○ Not supported here", "text-amber-300"];
    if (S.err) return ["○ Can't connect · retrying", "text-amber-300"];
    if (!S.ok) return ["○ Connecting…", "text-zinc-400"];
    return ["● Live · " + (K.ago(S.ok) || "just now"), "text-emerald-400"];
  };
  function cardHtml(a) {
    const L = live(a);
    if (!L) return `<span class="pt-f2h">Live family board</span>
      <p class="text-[11px] text-zinc-400 leading-snug">Scores update on their own. One of you starts a board and shares the family code. Everyone else types it in once.</p>
      <div class="flex flex-wrap gap-2"><button type="button" class="pt-b go" id="pt-live-start">Start a board</button><button type="button" class="pt-b" id="pt-live-join">Join with a code</button></div>
      <p class="text-[10px] text-zinc-500 leading-snug">Needs internet. Updates are scrambled on your phone before they are sent, so only people with the code can read them.</p>`;
    const [txt, cls] = statusOf();
    return `<div class="flex items-center justify-between gap-2"><span class="pt-f2h">Live family board</span><span id="pt-live-st" class="text-[11px] font-bold whitespace-nowrap ${cls}">${esc(txt)}</span></div>
      <div class="flex flex-wrap gap-2"><button type="button" class="pt-b" id="pt-live-now">Refresh</button><button type="button" class="pt-b" id="pt-live-code">Family code</button><button type="button" class="pt-b" id="pt-live-leave">Leave</button></div>`;
  }
  /** only the status line, in place */
  function paint(a) {
    const el = $("pt-live-st"); if (!el || !live(a || A())) return;
    const [txt, cls] = statusOf(); el.textContent = txt; el.className = "text-[11px] font-bold whitespace-nowrap " + cls;
  }
  function scroller(el) {
    for (let p = el && el.parentElement; p; p = p.parentElement) { const o = getComputedStyle(p).overflowY; if ((o === "auto" || o === "scroll") && p.scrollHeight > p.clientHeight) return p; }
    return document.scrollingElement;
  }
  /** the board again, when it is on screen and you are not typing in it, keeping your place on the page */
  function redraw(a) {
    const root = $("pt-pg-fam"); if (!root || !root.getClientRects().length) { paint(a); return; }
    const f = document.activeElement; if (f && root.contains(f) && /^(INPUT|TEXTAREA)$/.test(f.tagName)) { paint(a); return; }
    const sc = scroller(root), y = sc ? sc.scrollTop : 0;
    try { a.renderProgressView(); } catch (e) { console.error("PulseTrack live board", e); }
    if (sc) sc.scrollTop = y;
  }
  /** put the card at the top of the family board, and say plainly that the manual buttons below are the backup */
  function decorate() {
    const a = A(), box = document.querySelector("#pt-pg-fam > div"); if (!a || !box) return;
    let card = $("pt-live-card");
    if (!card) { card = document.createElement("div"); card.id = "pt-live-card"; card.className = "pt-f2box"; box.insertAdjacentElement("afterbegin", card); }
    card.innerHTML = cardHtml(a);
    const send = $("pt-f2-send"), kf = send && send.closest(".pt-f2box");
    if (kf && live(a)) {
      const h = kf.querySelector(".pt-f2h"), p = kf.querySelector("p");
      if (h) h.textContent = "Or send by message";
      if (p) p.textContent = "The live board sends your update for you. These are for someone who is not on it.";
    }
  }
  const oPV = proto.renderProgressView;
  proto.renderProgressView = function () {
    const r = oPV.apply(this, arguments);
    try { decorate(); } catch (e) { console.error("PulseTrack live board", e); }
    try { if (live(this)) setTimeout(() => { if (!S.busy && Date.now() - S.last > 20000) sync(A()); }, 50); } catch (e) { }
    return r;
  };

  /* ============================================================== start, join, show the code, leave */
  async function needName(a) {
    if (a.settings.myName) return a.settings.myName;
    const v = await PT.prompt("What name should your family see?", "", { title: "Your name", ok: "Save", maxlength: 24 });
    const n = String(v || "").trim().slice(0, 24); if (!n) return ""; a.settings.myName = n; save(a); return n;
  }
  const shareText = code => `Join my PulseTrack family board 💪 In PulseTrack open Progress > Social > Family board and tap "Join with a code". Code: ${pretty(code)}`;
  function showCode(a, fresh) {
    const L = live(a); if (!L) return;
    const kit = PT.kit, el = kit.sheet("pt-live", 70);
    const card = kit.openSheet(el, `${kit.head(fresh ? "Your family code" : "Family code", fresh ? "Send it to everyone. They tap Join with a code and type it once." : "Anyone with this code sees everybody's updates.")}
      <div class="pt-livecode" id="pt-live-codebox" aria-label="Family code">${esc(pretty(L.code))}</div>
      <div class="space-y-2 pt-3"><button type="button" id="pt-live-share" class="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl tap-active text-sm">Send to the family</button>
        <div class="grid grid-cols-2 gap-2"><button type="button" id="pt-live-copy" class="py-2.5 rounded-xl bg-zinc-800/70 text-zinc-300 text-xs font-bold tap-active">Copy code</button><button type="button" data-live-close="1" class="py-2.5 rounded-xl bg-zinc-800/70 text-zinc-300 text-xs font-bold tap-active">Done</button></div></div>
      <p class="text-[10px] text-zinc-500 leading-snug pt-3">Only share it with people you want on the board. Anyone who has it can read and post updates.</p>`);
    card.addEventListener("click", async e => {
      if (e.target.closest("[data-live-close]")) { kit.closeSheet(el); return; }
      if (e.target.closest("#pt-live-copy")) { try { await navigator.clipboard.writeText(pretty(L.code)); a.toast("Code copied"); } catch (er) { await PT.alert("Your code:\n\n" + pretty(L.code)); } return; }
      if (e.target.closest("#pt-live-share")) {
        const text = shareText(L.code);
        try { if (navigator.share) { await navigator.share({ title: "PulseTrack family board", text }); return; } } catch (er) { if (er && er.name === "AbortError") return; }
        try { await navigator.clipboard.writeText(text); a.toast("Copied. Paste it in your family chat"); } catch (er) { await PT.alert("Send this:\n\n" + text); }
      }
    });
  }
  async function start(a) {
    if (live(a)) return;
    if (!supported()) { await PT.alert("This browser can't make a live board. Update Chrome, or keep using the update codes."); return; }
    if (!(await needName(a))) return;
    a.settings.live = { code: newCode(), last: 0, pub: 0, fp: "" }; save(a);
    S.ok = 0; S.err = ""; S.found = [];
    a.renderProgressView(); showCode(a, true); sync(a, { force: true });
  }
  async function join(a, typed) {
    if (live(a)) return;
    if (!supported()) { await PT.alert("This browser can't join a live board. Update Chrome, or keep using the update codes."); return; }
    if (!(await needName(a))) return;
    const raw = typed != null ? typed : await PT.prompt("Type the family code", "", { title: "Join the family board", ok: "Join", maxlength: 80 });
    if (raw == null || !String(raw).trim()) return;
    const code = parseCode(raw);
    if (!code) { a.toast("That code doesn't look right. It is 16 letters and numbers, like ABCD-EFGH-JKLM-NPQR"); return; }
    a.settings.live = { code, last: 0, pub: 0, fp: "" }; save(a);
    S.ok = 0; S.err = ""; S.found = [];
    a.renderProgressView(); sync(a, { force: true, announce: true });
  }
  async function leave(a) {
    if (!live(a)) return;
    if (!(await PT.confirm("Leave the live family board? This phone stops sending and receiving. The people already on your board stay until you remove them."))) return;
    delete a.settings.live; save(a); ctxMemo = null; S.ok = 0; S.err = ""; S.found = [];
    a.toast("Left the live board"); a.renderProgressView();
  }
  document.addEventListener("click", e => {
    const a = A(); if (!a || !e.target.closest) return; const t = id => e.target.closest("#" + id);
    if (t("pt-live-start")) { start(a); return; }
    if (t("pt-live-join")) { join(a); return; }
    if (t("pt-live-code")) { showCode(a, false); return; }
    if (t("pt-live-leave")) { leave(a); return; }
    if (t("pt-live-now")) { sync(a, { force: true }); a.toast("Checking…"); }
  }, false);

  /* ============================================================== when it runs on its own */
  function tick() {
    const a = A(); if (!a || !live(a) || document.hidden || S.busy) return;
    if (Date.now() - S.last >= (famVisible() ? GAP_OPEN : GAP_AWAY)) sync(a);
  }
  setInterval(tick, 20000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) { const a = A(); if (a && live(a) && Date.now() - S.last > 15000) sync(a); } });
  window.addEventListener("online", () => { const a = A(); if (a && live(a)) sync(a); });
  setTimeout(function first(n) { const a = A(); if (a && a.settings) { if (live(a)) sync(a); } else if ((n || 0) < 20) setTimeout(() => first((n || 0) + 1), 500); }, 2500);
  /* after a workout: send the new numbers (it is also sent a little later if you are offline right now) */
  const oFin = proto.finishWorkoutV2;
  if (oFin) proto.finishWorkoutV2 = async function () {
    const r = await oFin.apply(this, arguments);
    try { if (live(this)) setTimeout(() => sync(A()), 1500); } catch (e) { }
    return r;
  };

  PT.live = { newCode, parseCode, valid, derive, encrypt, decrypt, sync, start, join, leave, isOn: a => !!live(a || A()), status: () => Object.assign({}, S), relay: RELAY };

  const css = document.createElement("style"); css.id = "pt-v289-live-css";
  css.textContent = `
    .pt-livecode { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-weight: 800; font-size: 1.3rem; letter-spacing: .06em; text-align: center; padding: .85rem .5rem; border-radius: .9rem; background: rgb(var(--z950)); border: 1px solid rgb(var(--z800)); color: rgb(var(--z100)); user-select: all; -webkit-user-select: all; word-break: break-all; }
    html[data-mode="light"] #pt-live-st.text-amber-300 { color: #b45309; }
    html[data-mode="light"] #pt-live-st.text-emerald-400 { color: #047857; }
  `;
  document.head.appendChild(css);
})();
