// Runs in the page: scans what is visible now for the listed design tells. Returns { counts, samples }.
(() => {
  const out = { contrast: [], blur: [], leftBorder: [], emojiHead: [], emDash: [], clipText: [], purpleBlue: [], eyebrow: [], hoverFade: [] };
  const vis = el => { const r = el.getBoundingClientRect(); if (r.width < 1 || r.height < 1 || r.right <= 1 || r.left >= innerWidth - 1) return false; for (let e = el; e; e = e.parentElement) { const t = getComputedStyle(e).transform; if (e.id === "sidebar" && t && t !== "none" && /-/.test(t)) return false; } const s = getComputedStyle(el); return s.visibility !== "hidden" && s.display !== "none" && +s.opacity > 0.05 && !el.closest(".hidden,[hidden]"); };
  const rgb = s => { const m = String(s).match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const lum = c => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(c.r) + .7152 * f(c.g) + .0722 * f(c.b); };
  const mix = (top, under) => ({ r: top.r * top.a + under.r * (1 - top.a), g: top.g * top.a + under.g * (1 - top.a), b: top.b * top.a + under.b * (1 - top.a), a: 1 });
  const bgOf = el => { const stack = []; for (let e = el; e; e = e.parentElement) { const c = rgb(getComputedStyle(e).backgroundColor); if (c && c.a > 0) { stack.push(c); if (c.a >= 0.99) break; } } let b = rgb(getComputedStyle(document.body).backgroundColor) || { r: 0, g: 0, b: 0, a: 1 }; b.a = 1; for (let i = stack.length - 1; i >= 0; i--) b = mix(stack[i], b); return b; };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
  const label = el => (el.id ? "#" + el.id : el.tagName.toLowerCase()) + " '" + (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 40) + "'";
  const EMOJI = /^\s*(\p{Extended_Pictographic}|\p{Regional_Indicator})/u;
  const all = [...document.querySelectorAll("body *")].filter(vis);
  all.forEach(el => {
    const s = getComputedStyle(el);
    const own = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join("").trim();
    if (own) {
      const fg = rgb(s.color); if (fg && !el.closest("svg")) { const fgm = mix(fg, bgOf(el)); const r = ratio(fgm, bgOf(el)); const big = parseFloat(s.fontSize) >= 24 || (parseFloat(s.fontSize) >= 18.66 && +s.fontWeight >= 700); if (r < (big ? 3 : 4.5)) out.contrast.push(label(el) + " " + r.toFixed(2)); }
      if (/—/.test(own)) out.emDash.push(label(el));
      const head = /^H[1-6]$/.test(el.tagName) || +s.fontWeight >= 700 && parseFloat(s.fontSize) >= 13 || /eyebrow|kicker|title/i.test(el.className);
      if (head && EMOJI.test(own)) out.emojiHead.push(label(el));
      if (s.textTransform === "uppercase" && parseFloat(s.letterSpacing) > 0.5 && parseFloat(s.fontSize) <= 12) out.eyebrow.push(label(el));
    }
    if ((s.backdropFilter && s.backdropFilter !== "none") || (s.webkitBackdropFilter && s.webkitBackdropFilter !== "none")) out.blur.push(label(el));
    const bl = parseFloat(s.borderLeftWidth), bt = parseFloat(s.borderTopWidth);
    { const lc = rgb(s.borderLeftColor); if (bl >= 2 && lc && lc.a > 0.05 && s.borderLeftStyle !== "none" && (bl > bt + 0.5 || s.borderLeftColor !== s.borderTopColor) && el.getBoundingClientRect().height > 24) out.leftBorder.push(label(el)); }
    if (/text/.test(s.webkitBackgroundClip || s.backgroundClip || "")) out.clipText.push(label(el));
    const gi = s.backgroundImage; if (/gradient/.test(gi) && !el.closest(".pt-ftile, .pt-fgrid, [data-frame], [data-item], .pt-sw, .pt-shop-it, .pt-swatch")) { const cs = (gi.match(/rgba?\([^)]+\)/g) || []).map(rgb).filter(Boolean); const purple = cs.some(c => c.b > 150 && c.r > 100 && c.g < 120); const blue = cs.some(c => c.b > 150 && c.r < 120); if (purple && blue) out.purpleBlue.push(label(el)); }
  });
  document.querySelectorAll("svg text").forEach(t => { if (!vis(t) || !t.textContent.trim() || /^[\p{Extended_Pictographic}\uFE0F\u200D\s]+$/u.test(t.textContent)) return; const s = getComputedStyle(t); const fg = rgb(s.fill); if (!fg) return; const host = t.closest("svg"); const bg = bgOf(host); const r = ratio(mix(fg, bg), bg); if (r < 3) out.contrast.push("svgtext '" + t.textContent.trim().slice(0, 20) + "' " + r.toFixed(2)); });
  for (const sh of document.styleSheets) { let rules; try { rules = sh.cssRules; } catch (e) { continue; } for (const r of rules || []) { if (r.selectorText && /:hover/.test(r.selectorText) && r.style && r.style.opacity && +r.style.opacity < 1) out.hoverFade.push(r.selectorText.slice(0, 60)); } }
  const counts = {}; for (const k in out) counts[k] = out[k].length;
  return { counts, samples: Object.fromEntries(Object.entries(out).map(([k, v]) => [k, [...new Set(v)].slice(0, 40)])) };
})()
