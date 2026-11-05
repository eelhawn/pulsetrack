/* =====================================================================
 * PulseTrack 2.71.0: many more looks.
 *   - 66 more accent colours, 39 dark and 24 light backgrounds, 14 more background effects
 *   - 26 more fonts (built in, they work offline; the font files are in css/14-pt-fonts-more.css)
 *   - about 170 more themes in ten new groups
 * Everything is added to the lists that module 009 owns (PT.look.*), so the gallery, Appearance,
 * theme codes and the tests see it like any other theme.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof PT === "undefined" || !PT.look || !PT.look.util || !PT.look.FX_EXT) return;
  const L = PT.look, U = L.util, has = (arr, id) => arr.some(x => x.id === id);
  const hex = (h, s, l) => U.toHex(U.hsl2rgb([h, s, l]));

  /* ------------------------------------------------------------ accent colours: [id, name, the main shade] */
  function acc(id, label, base) {
    if (has(L.ACCENTS, id)) return;
    const [h, s, l] = U.rgb2hsl(U.hx(base)), mk = d => U.hsl2rgb([h, s, Math.max(4, Math.min(94, l + d))]);
    L.ACCENTS.push({ id, label, s: [U.toHex(mk(+22)), U.toHex(mk(+11)), U.toHex(U.hx(base)), U.toHex(mk(-9)), U.toHex(U.hsl2rgb([h, Math.min(s, 85), Math.max(10, Math.min(l - 26, 32))])), U.toHex(U.hsl2rgb([h, Math.min(s, 60), 11]))] });
  }
  [
    ["scarlet", "Scarlet", "#e5322d"], ["cherry", "Cherry", "#d6204f"], ["raspberry", "Raspberry", "#d81b78"], ["hotpink", "Hot pink", "#ff2d95"], ["flamingo", "Flamingo", "#ff6f91"],
    ["salmon", "Salmon", "#fa7268"], ["melon", "Watermelon", "#fc4a6d"], ["burgundy", "Burgundy", "#a8324d"], ["bloodorange", "Blood orange", "#e8481c"], ["pumpkin", "Pumpkin", "#f2760f"],
    ["apricot", "Apricot", "#fb9d52"], ["mango", "Mango", "#ffa41b"], ["honey", "Honey", "#e8b020"], ["lemon", "Lemon", "#f3e11e"], ["banana", "Banana", "#ffe14d"],
    ["mustard", "Mustard", "#d9a521"], ["bronze", "Bronze", "#b8814a"], ["kelly", "Kelly green", "#2eb82e"], ["shamrock", "Shamrock", "#1fae6e"], ["jade", "Jade", "#00a878"],
    ["spearmint", "Spearmint", "#3fe0a0"], ["pistachio", "Pistachio", "#93c572"], ["fern", "Fern", "#5a9e4b"], ["avocado", "Avocado", "#7a9a2f"], ["neongreen", "Neon green", "#39ff6a"],
    ["acid", "Acid", "#b5ff2e"], ["hunter", "Hunter", "#2f7d4f"], ["jungle", "Jungle", "#29a35e"], ["turquoise", "Turquoise", "#1fc8c0"], ["lagoonc", "Lagoon", "#12b5cb"],
    ["cerulean", "Cerulean", "#2a9df4"], ["arctic", "Arctic", "#7fd8ff"], ["peacock", "Peacock", "#0e8a9b"], ["glacierc", "Glacier", "#8fd6e8"], ["royalblue", "Royal blue", "#3a5bd9"],
    ["denim", "Denim", "#3d6fb4"], ["ultra", "Ultramarine", "#3b3bd1"], ["periwinkle", "Periwinkle", "#8a96f5"], ["navyblue", "Navy", "#2b4a9f"], ["neonblue", "Neon blue", "#1e90ff"],
    ["grape", "Grape", "#8b3fd0"], ["plumc", "Plum", "#9c3f9c"], ["iris", "Iris", "#6d5bd0"], ["mauvec", "Mauve", "#b07aa1"], ["eggplant", "Eggplant", "#7b3b7b"],
    ["neonpurple", "Neon purple", "#b026ff"], ["heliotrope", "Heliotrope", "#d46bff"], ["thistle", "Thistle", "#c9a0dc"], ["graphitec", "Graphite", "#8a8f98"], ["pewter", "Pewter", "#9aa3ad"],
    ["silver", "Silver", "#c0c5cc"], ["platinum", "Platinum", "#dfe3e8"], ["bone", "Bone", "#e8dfd0"], ["cream", "Cream", "#f1e7cf"], ["terracotta", "Terracotta", "#c8643c"],
    ["clay", "Clay", "#b5714f"], ["rustc", "Rust", "#b7410e"], ["cinnamon", "Cinnamon", "#b85c2e"], ["coffee", "Coffee", "#8b5e3c"], ["mochac", "Mocha", "#a47551"],
    ["sienna", "Sienna", "#c0612b"], ["sandstone", "Sandstone", "#d2a679"], ["ultraviolet2", "Ultra violet", "#7c4dff"], ["sunset2", "Dusk pink", "#ff7eb6"], ["seaweed", "Seaweed", "#3d9970"],
    ["ocean2", "Deep blue", "#1f6fd1"], ["limeade", "Limeade", "#9be15d"], ["tangelo", "Tangelo", "#ff8c1a"]
  ].forEach(a => acc(a[0], a[1], a[2]));

  /* ------------------------------------------------------------ dark backgrounds: page, card, raised card, line, stronger line */
  function dbg(id, label, h, s, v) {
    if (has(L.BGS, id)) return;
    const ls = v === "deep" ? [2.5, 5.5, 8, 13.5, 22] : v === "lift" ? [7, 11, 14, 20, 30] : [4, 7.5, 10, 16, 25];
    L.BGS.push({ id, label, s: ls.map(l => hex(h, s, l)) });
  }
  [
    ["coal", "Coal", 0, 0, "deep"], ["smoke", "Smoke", 240, 6, "lift"], ["ash", "Ash", 0, 0, "lift"], ["dim", "Dim grey", 220, 8, "lift"], ["gunmetal", "Gunmetal", 210, 12],
    ["steelblue", "Steel blue", 210, 28], ["abyss", "Abyss", 220, 55, "deep"], ["trench", "Trench", 200, 55, "deep"], ["arcticnight", "Arctic night", 195, 35], ["evergreen", "Evergreen", 150, 32, "deep"],
    ["spruce", "Spruce", 165, 28], ["swamp", "Swamp", 95, 25], ["olivenight", "Olive night", 75, 22], ["chocolate", "Chocolate", 20, 30], ["coffeebg", "Coffee", 25, 28],
    ["sepia", "Sepia", 35, 22], ["tobacco", "Tobacco", 32, 30], ["burnt", "Burnt", 15, 40, "deep"], ["maroonnight", "Maroon night", 350, 40, "deep"], ["raspnight", "Raspberry night", 335, 35],
    ["magentanight", "Magenta night", 310, 35, "deep"], ["orchidnight", "Orchid night", 290, 28], ["grapenight", "Grape night", 270, 35], ["twilight", "Twilight", 250, 35], ["cobaltnight", "Cobalt night", 230, 45, "deep"],
    ["denimnight", "Denim night", 218, 32], ["lagoonnight", "Lagoon night", 188, 40, "deep"], ["jadenight", "Jade night", 160, 40, "deep"], ["fernnight", "Fern night", 120, 22], ["slategreen", "Slate green", 140, 12],
    ["eclipse", "Eclipse", 270, 15, "deep"], ["cosmos", "Cosmos", 260, 45, "deep"], ["nebula", "Nebula", 285, 40], ["deepteal", "Deep teal", 175, 60, "deep"], ["navyink", "Navy ink", 225, 60, "deep"],
    ["hotcoal", "Hot coal", 5, 28], ["bluesmoke", "Blue smoke", 215, 14, "lift"], ["mud", "Mud", 28, 14, "lift"], ["purplesmoke", "Purple smoke", 270, 12, "lift"]
  ].forEach(b => dbg(b[0], b[1], b[2], b[3], b[4]));

  /* ------------------------------------------------------------ light backgrounds */
  function lbg(id, label, h, s) {
    if (has(L.LBGS, id)) return;
    L.LBGS.push({ id, label, s: [95, 99.4, 97.4, 90, 83].map(l => hex(h, s, l)) });
  }
  [
    ["pearl", "Pearl", 220, 10], ["porcelain", "Porcelain", 200, 15], ["oat", "Oat", 40, 25], ["almond", "Almond", 30, 30], ["creaml", "Cream", 45, 40], ["vanilla", "Vanilla", 50, 50],
    ["lemonice", "Lemon ice", 60, 60], ["pistachiol", "Pistachio", 95, 30], ["celadon", "Celadon", 140, 25], ["aquamist", "Aqua mist", 180, 35], ["powder", "Powder", 205, 45],
    ["periwinklemist", "Periwinkle mist", 230, 45], ["irismist", "Iris mist", 255, 40], ["wisteria", "Wisteria", 275, 35], ["orchidmist", "Orchid mist", 300, 30], ["rosepetal", "Rose petal", 345, 45],
    ["coralmist", "Coral mist", 10, 55], ["apricotl", "Apricot", 28, 60], ["claylight", "Clay light", 20, 25], ["fog", "Fog", 210, 6], ["chalk", "Chalk", 45, 12],
    ["bubblegumL", "Bubblegum", 330, 45], ["limeadel", "Limeade", 80, 50], ["seaglass", "Sea glass", 165, 30]
  ].forEach(b => lbg(b[0], b[1], b[2], b[3]));

  /* ------------------------------------------------------------ more background effects */
  const X = L.FX_EXT, FX = L.FX;
  const alt = (ac, d) => { const [h, s, l] = U.rgb2hsl(ac.sh[2]); return U.hsl2rgb([(h + d) % 360, Math.max(45, Math.min(s, 90)), Math.max(38, Math.min(l, 62))]).map(Math.round).join(" "); };
  const FXN = [
    ["rings", "Rings", (lt, t, c) => `repeating-radial-gradient(circle at 50% -8%, rgb(${c} / ${lt ? .16 : .11}) 0 1.5px, transparent 1.5px 30px)`],
    ["checker", "Checker", (lt, t, c) => `conic-gradient(rgb(${c} / ${lt ? .1 : .07}) 25%, transparent 0 50%, rgb(${c} / ${lt ? .1 : .07}) 0 75%, transparent 0) 0 0 / 44px 44px`],
    ["sunburst", "Sunburst", (lt, t, c) => `repeating-conic-gradient(from 0deg at 50% -6%, rgb(${c} / ${lt ? .12 : .1}) 0 5deg, transparent 5deg 10deg)`],
    ["plaid", "Plaid", (lt, t, c, ac) => `repeating-linear-gradient(0deg, rgb(${c} / ${lt ? .09 : .07}) 0 16px, transparent 16px 40px), repeating-linear-gradient(90deg, rgb(${alt(ac, 40)} / ${lt ? .09 : .07}) 0 16px, transparent 16px 40px)`],
    ["corners", "Corners", (lt, t, c, ac) => { const o = alt(ac, 60); return `radial-gradient(55% 32% at 0 0, rgb(${c} / ${lt ? .26 : .32}), transparent 70%), radial-gradient(55% 32% at 100% 0, rgb(${o} / ${lt ? .2 : .26}), transparent 70%), radial-gradient(55% 32% at 100% 100%, rgb(${c} / ${lt ? .26 : .32}), transparent 70%), radial-gradient(55% 32% at 0 100%, rgb(${o} / ${lt ? .2 : .26}), transparent 70%)`; }],
    ["sunrise", "Sunrise", (lt, t, c) => `radial-gradient(105% 46% at 50% 106%, rgb(${c} / ${lt ? .36 : .42}), transparent 70%), linear-gradient(180deg, transparent 55%, rgb(${c} / ${lt ? .08 : .1}))`],
    ["beams", "Beams", (lt, t, c) => `repeating-linear-gradient(105deg, transparent 0 46px, rgb(${c} / ${lt ? .09 : .07}) 46px 92px), radial-gradient(110% 40% at 50% -10%, rgb(${c} / ${lt ? .16 : .2}), transparent 70%)`],
    ["diamonds", "Diamonds", (lt, t, c) => { const k = `rgb(${c} / ${lt ? .1 : .075})`; return `linear-gradient(135deg, ${k} 25%, transparent 25%) -22px 0 / 44px 44px, linear-gradient(225deg, ${k} 25%, transparent 25%) -22px 0 / 44px 44px, linear-gradient(315deg, ${k} 25%, transparent 25%) 0 0 / 44px 44px, linear-gradient(45deg, ${k} 25%, transparent 25%) 0 0 / 44px 44px`; }],
    ["confetti", "Confetti", (lt, t, c, ac) => {
      const cols = [c, alt(ac, 70), alt(ac, 150), alt(ac, 220)], at = [[8, 6], [26, 14], [45, 5], [63, 12], [84, 7], [94, 20], [14, 30], [37, 36], [58, 28], [79, 38], [6, 52], [30, 58], [52, 48], [72, 60], [91, 54], [18, 78], [42, 84], [66, 76], [88, 86], [10, 94], [55, 95]];
      return at.map((p, i) => `radial-gradient(${2 + (i % 3)}px ${2 + (i % 3)}px at ${p[0]}% ${p[1]}%, rgb(${cols[i % 4]} / ${lt ? .75 : .8}), transparent)`).join(", ");
    }],
    ["scanlines", "Scanlines", (lt, t, c) => `repeating-linear-gradient(0deg, rgb(${lt ? "0 0 0 / .04" : "255 255 255 / .035"}) 0 1px, transparent 1px 4px), radial-gradient(110% 50% at 50% -10%, rgb(${c} / ${lt ? .14 : .2}), transparent 70%)`],
    ["grain", "Grain", (lt, t, c) => {
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 ${lt ? 0 : 1} 0 0 0 0 ${lt ? 0 : 1} 0 0 0 0 ${lt ? 0 : 1} 0 0 0 .9 -.3'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='${lt ? .16 : .1}'/></svg>`;
      return `radial-gradient(110% 50% at 50% -10%, rgb(${c} / ${lt ? .14 : .2}), transparent 70%), url("data:image/svg+xml,${svg.replace(/</g, "%3C").replace(/>/g, "%3E").replace(/"/g, "'")}") 0 0 / 160px 160px`;
    }],
    ["twin", "Twin glow", (lt, t, c, ac) => `radial-gradient(62% 40% at 12% 0%, rgb(${c} / ${lt ? .26 : .34}), transparent 70%), radial-gradient(62% 40% at 88% 100%, rgb(${alt(ac, 80)} / ${lt ? .22 : .3}), transparent 70%)`],
    ["waves", "Waves", (lt, t, c, ac) => `radial-gradient(130% 28% at 20% 108%, rgb(${c} / ${lt ? .3 : .38}), transparent 68%), radial-gradient(130% 28% at 80% 100%, rgb(${alt(ac, 40)} / ${lt ? .24 : .3}), transparent 68%), radial-gradient(110% 25% at 40% 115%, rgb(${c} / ${lt ? .2 : .26}), transparent 68%)`],
    ["prism", "Prism", (lt, t, c, ac) => `conic-gradient(from 210deg at 50% -25%, rgb(${c} / 0), rgb(${alt(ac, 60)} / ${lt ? .2 : .24}), rgb(${alt(ac, 120)} / ${lt ? .18 : .22}), rgb(${alt(ac, 200)} / ${lt ? .18 : .22}), rgb(${c} / ${lt ? .2 : .24}), rgb(${c} / 0))`]
  ];
  FXN.forEach(f => { if (!has(FX, f[0])) { FX.push({ id: f[0], label: f[1] }); X[f[0]] = f[2]; } });

  /* ------------------------------------------------------------ fonts (files are embedded in css/14-pt-fonts-more.css) */
  const SANS = U.SYS, SERIF = 'Georgia, "Times New Roman", serif', MONO = 'ui-monospace, Menlo, Consolas, monospace';
  [
    ["inter", "Inter", "PT Inter", SANS], ["bricolage", "Bricolage", "PT Bricolage", SANS], ["instsans", "Instrument Sans", "PT Instrument Sans", SANS], ["carlito", "Carlito", "PT Carlito", SANS],
    ["nationalpark", "National Park", "PT National Park", SANS], ["jura", "Jura", "PT Jura", SANS], ["smooch", "Smooch Sans", "PT Smooch Sans", '"Arial Narrow", sans-serif'], ["poiret", "Poiret One", "PT Poiret One", SANS],
    ["arsenal", "Arsenal SC", "PT Arsenal SC", SANS], ["erica", "Erica One", "PT Erica One", SANS], ["boldonse", "Boldonse", "PT Boldonse", SANS],
    ["plexserif", "Plex Serif", "PT Plex Serif", SERIF], ["crimson", "Crimson", "PT Crimson", SERIF], ["caladea", "Caladea", "PT Caladea", SERIF], ["baskerville", "Baskerville", "PT Baskerville", SERIF],
    ["youngserif", "Young Serif", "PT Young Serif", SERIF], ["gloock", "Gloock", "PT Gloock", SERIF], ["instserif", "Instrument Serif", "PT Instrument Serif", SERIF], ["italiana", "Italiana", "PT Italiana", SERIF],
    ["plexmono", "Plex Mono", "PT Plex Mono", MONO], ["geistmono", "Geist Mono", "PT Geist Mono", MONO], ["redhatmono", "Red Hat Mono", "PT Red Hat Mono", MONO], ["dmmono", "DM Mono", "PT DM Mono", MONO],
    ["pixelify", "Pixelify", "PT Pixelify", SANS], ["silkscreen", "Silkscreen", "PT Silkscreen", MONO], ["handwriting", "Handwriting", "PT Handwriting", '"Comic Sans MS", cursive']
  ].forEach(f => { if (!has(L.FONTS, f[0])) L.FONTS.push({ id: f[0], label: f[1], stack: `"${f[2]}", ${f[3]}` }); });

  /* ------------------------------------------------------------ themes */
  L.CATS.push(["gym", "Gym"], ["pastel", "Pastel"], ["sweet", "Sweet"], ["gem", "Gems"], ["metal", "Metal"], ["space", "Space"], ["mood", "Mood"], ["type", "Fonts"], ["pure", "Pure dark"], ["purel", "Pure light"]);
  const T = (id, label, cat, o) => { if (!has(L.PRESETS, id)) L.PRESETS.push({ id, label, cat, s: Object.assign({ font: "system", bgfx: "solid" }, o) }); };
  const D = (id, label, cat, accent, bg, o) => T(id, label, cat, Object.assign({ theme: "dark", accent, bg }, o));
  const Lt = (id, label, cat, accent, bgL, o) => T(id, label, cat, Object.assign({ theme: "light", accent, bgL }, o));

  // Gym
  D("gym-pump", "Pump day", "gym", "scarlet", "hotcoal", { bgfx: "glow", font: "bigshoulders", round: "sharp" });
  D("gym-legs", "Leg day", "gym", "pumpkin", "burnt", { bgfx: "sunrise", font: "smooch", round: "sharp", btn: "gradient" });
  D("gym-pr", "PR day", "gym", "gold", "coal", { bgfx: "sunburst", font: "bigshoulders", round: "sharp", btn: "gradient" });
  D("gym-deadlift", "Deadlift", "gym", "pewter", "gunmetal", { bgfx: "stripes", font: "bigshoulders", round: "sharp", card: "outlined" });
  D("gym-barbell", "Barbell", "gym", "silver", "ash", { bgfx: "vignette", font: "arsenal", round: "sharp" });
  D("gym-beast", "Beast mode", "gym", "neongreen", "coal", { bgfx: "scanlines", font: "smooch", round: "sharp", btn: "gradient" });
  D("gym-cardio", "Cardio", "gym", "hotpink", "raspnight", { bgfx: "waves", font: "outfit", round: "round" });
  Lt("gym-rest", "Rest day", "gym", "iris", "irismist", { bgfx: "fade", font: "instsans", round: "round" });
  Lt("gym-chalk", "Chalk bag", "gym", "rustc", "chalk", { bgfx: "grain", font: "bigshoulders", round: "sharp", card: "outlined" });
  Lt("gym-morning", "Morning lift", "gym", "mango", "vanilla", { bgfx: "sunrise", font: "poppins", round: "round" });
  D("gym-night", "Night session", "gym", "arctic", "navyink", { bgfx: "stars", font: "jura" });
  D("gym-rubber", "Rubber floor", "gym", "acid", "coal", { bgfx: "checker", font: "bigshoulders", round: "sharp" });
  D("gym-platform", "Platform", "gym", "scarlet", "coal", { bgfx: "vignette", font: "arsenal", round: "sharp", card: "outlined" });
  D("gym-stage", "Stage lights", "gym", "gold", "obsidian", { bgfx: "spotlight", font: "gloock", round: "round", btn: "gradient" });
  D("gym-wod", "WOD", "gym", "acid", "ash", { bgfx: "beams", font: "smooch", round: "sharp" });
  D("gym-track", "Track", "gym", "pumpkin", "burnt", { bgfx: "beams", font: "outfit", round: "round" });
  Lt("gym-stretch", "Stretch", "gym", "sage", "sagelight", { bgfx: "glow", font: "instserif", round: "round" });
  D("gym-iron", "Iron paradise", "gym", "graphitec", "smoke", { bgfx: "grid", font: "bigshoulders", round: "sharp", card: "outlined" });
  D("gym-bulk", "Bulk season", "gym", "bloodorange", "chocolate", { bgfx: "glow", font: "bricolage", btn: "gradient" });
  D("gym-cut", "Cut season", "gym", "cerulean", "steelblue", { bgfx: "fade", font: "inter" });
  D("gym-heavy", "Heavy day", "gym", "mustard", "mud", { bgfx: "stripes", font: "erica", round: "sharp" });
  D("gym-sweat", "Sweat", "gym", "turquoise", "lagoonnight", { bgfx: "waves", font: "outfit", round: "round" });

  // Pastel
  Lt("pastel-cotton", "Cotton candy", "pastel", "hotpink", "bubblegumL", { bgfx: "confetti", font: "rounded", round: "round", btn: "soft" });
  Lt("pastel-marshmallow", "Marshmallow", "pastel", "periwinkle", "pearl", { bgfx: "glow", font: "carlito", round: "pill", btn: "soft" });
  Lt("pastel-haze", "Lavender haze", "pastel", "grape", "wisteria", { bgfx: "fade", font: "outfit", round: "round" });
  Lt("pastel-peach", "Peach fuzz", "pastel", "apricot", "apricotl", { bgfx: "glow", font: "poppins", round: "round", btn: "gradient" });
  Lt("pastel-mintcream", "Mint ice cream", "pastel", "spearmint", "aquamist", { bgfx: "dots", font: "rounded", round: "round" });
  Lt("pastel-baby", "Baby blue", "pastel", "cerulean", "powder", { bgfx: "fade", font: "instsans", round: "round" });
  Lt("pastel-buttercup", "Buttercup", "pastel", "honey", "vanilla", { bgfx: "horizon", font: "poppins", round: "round" });
  Lt("pastel-rosemilk", "Rose milk", "pastel", "flamingo", "rosepetal", { bgfx: "dots", font: "carlito", round: "pill" });
  Lt("pastel-lilac", "Lilac dream", "pastel", "heliotrope", "orchidmist", { bgfx: "mesh", font: "outfit", round: "round" });
  Lt("pastel-sorbet", "Sorbet", "pastel", "melon", "coralmist", { bgfx: "aurora", font: "poppins", round: "round", btn: "gradient" });
  Lt("pastel-pistachio", "Pistachio cream", "pastel", "pistachio", "pistachiol", { bgfx: "glow", font: "instsans", round: "round" });
  Lt("pastel-seaglass", "Sea glass", "pastel", "jade", "seaglass", { bgfx: "fade", font: "inter", round: "round" });
  Lt("pastel-limeade", "Limeade", "pastel", "kelly", "limeadel", { bgfx: "dots", font: "rounded", round: "round" });
  Lt("pastel-cloud", "Cloud nine", "pastel", "cerulean", "cloud", { bgfx: "mesh", font: "poppins", round: "round" });
  Lt("pastel-powder", "Powder room", "pastel", "mauvec", "blush", { bgfx: "glow", font: "instserif", round: "round" });
  Lt("pastel-sherbet", "Sherbet", "pastel", "tangelo", "peach", { bgfx: "twin", font: "outfit", round: "round" });

  // Sweet
  Lt("sweet-strawberry", "Strawberry milk", "sweet", "melon", "rosewater", { bgfx: "dots", font: "poppins", round: "pill" });
  D("sweet-blueberry", "Blueberry", "sweet", "ultra", "cobaltnight", { bgfx: "glow", font: "outfit", round: "round" });
  D("sweet-cola", "Cola", "sweet", "scarlet", "chocolate", { bgfx: "sunrise", font: "bricolage" });
  D("sweet-latte", "Mocha latte", "sweet", "mochac", "coffeebg", { bgfx: "glow", font: "instserif", round: "round" });
  D("sweet-matcha", "Matcha", "sweet", "pistachio", "evergreen", { bgfx: "fade", font: "carlito", round: "round" });
  Lt("sweet-lemonade", "Lemonade", "sweet", "lemon", "vanilla", { bgfx: "dots", font: "rounded", round: "round", btn: "gradient" });
  D("sweet-cherrypie", "Cherry pie", "sweet", "cherry", "maroonnight", { bgfx: "plaid", font: "crimson", round: "round" });
  Lt("sweet-bubbletea", "Bubble tea", "sweet", "mauvec", "creaml", { bgfx: "confetti", font: "rounded", round: "pill" });
  Lt("sweet-cinnamon", "Cinnamon roll", "sweet", "cinnamon", "creaml", { bgfx: "rings", font: "instserif", round: "round" });
  D("sweet-cookies", "Cookies & cream", "sweet", "bone", "coal", { bgfx: "checker", font: "bricolage", round: "round" });
  Lt("sweet-mango", "Mango lassi", "sweet", "mango", "apricotl", { bgfx: "sunrise", font: "poppins", round: "round" });
  Lt("sweet-peppermint", "Peppermint", "sweet", "scarlet", "chalk", { bgfx: "stripes", font: "bricolage", round: "round" });
  D("sweet-caramel", "Caramel", "sweet", "honey", "tobacco", { bgfx: "glow", font: "plexserif", round: "round", btn: "gradient" });
  D("sweet-mintchip", "Mint chip", "sweet", "spearmint", "chocolate", { bgfx: "dots", font: "outfit", round: "round" });
  D("sweet-grape", "Grape soda", "sweet", "grape", "grapenight", { bgfx: "mesh", font: "poppins", round: "round" });
  Lt("sweet-honeycomb", "Honeycomb", "sweet", "honey", "almond", { bgfx: "diamonds", font: "bricolage", round: "round" });
  D("sweet-licorice", "Licorice", "sweet", "hotpink", "coal", { bgfx: "stripes", font: "bricolage", round: "pill" });
  Lt("sweet-gelato", "Gelato", "sweet", "pistachio", "oat", { bgfx: "twin", font: "carlito", round: "round" });

  // Gems
  D("gem-ruby", "Ruby", "gem", "scarlet", "maroonnight", { bgfx: "glow", font: "gloock", round: "round", btn: "gradient" });
  D("gem-emerald", "Emerald city", "gem", "shamrock", "evergreen", { bgfx: "glow", font: "crimson", round: "round", btn: "gradient" });
  D("gem-sapphire", "Sapphire", "gem", "royalblue", "cobaltnight", { bgfx: "glow", font: "plexserif", round: "round", btn: "gradient" });
  D("gem-amethyst", "Amethyst", "gem", "grape", "grapenight", { bgfx: "prism", font: "instserif", round: "round", btn: "gradient" });
  D("gem-topaz", "Topaz", "gem", "mango", "burnt", { bgfx: "glow", font: "baskerville", round: "round", btn: "gradient" });
  D("gem-opal", "Opal", "gem", "turquoise", "twilight", { bgfx: "prism", font: "outfit", round: "round" });
  D("gem-onyx", "Onyx", "gem", "silver", "coal", { bgfx: "vignette", font: "plexserif", card: "glass" });
  D("gem-jade", "Jade temple", "gem", "jade", "jadenight", { bgfx: "fade", font: "crimson", round: "round" });
  D("gem-garnet", "Garnet", "gem", "burgundy", "maroonnight", { bgfx: "vignette", font: "gloock", round: "round" });
  D("gem-citrine", "Citrine", "gem", "honey", "tobacco", { bgfx: "spotlight", font: "baskerville", round: "round" });
  D("gem-aquamarine", "Aquamarine", "gem", "turquoise", "lagoonnight", { bgfx: "waves", font: "outfit", round: "round" });
  D("gem-fire", "Fire opal", "gem", "bloodorange", "obsidian", { bgfx: "corners", font: "bricolage", round: "round", card: "glass" });
  Lt("gem-pearl", "Pearl", "gem", "platinum", "pearl", { bgfx: "glow", font: "instserif", round: "round" });
  Lt("gem-moonstone", "Moonstone", "gem", "periwinkle", "fog", { bgfx: "mesh", font: "instsans", round: "round" });
  D("gem-tanzanite", "Tanzanite", "gem", "iris", "twilight", { bgfx: "glow", font: "plexserif", round: "round", btn: "gradient" });
  D("gem-peridot", "Peridot", "gem", "acid", "olivenight", { bgfx: "glow", font: "bricolage", round: "round" });
  D("gem-rhodonite", "Rhodonite", "gem", "flamingo", "raspnight", { bgfx: "twin", font: "instserif", round: "round" });
  D("gem-lapis", "Lapis lazuli", "gem", "navyblue", "abyss", { bgfx: "stars", font: "baskerville", round: "round" });

  // Metal
  D("metal-gold", "Gold bar", "metal", "gold", "coal", { bgfx: "spotlight", font: "gloock", round: "round", btn: "gradient" });
  D("metal-silver", "Silver", "metal", "silver", "ash", { bgfx: "grain", font: "inter", round: "round" });
  D("metal-platinum", "Platinum", "metal", "platinum", "gunmetal", { bgfx: "glow", font: "jura", round: "sharp" });
  D("metal-copper", "Copper pot", "metal", "copper", "chocolate", { bgfx: "glow", font: "plexserif", round: "round", btn: "gradient" });
  D("metal-bronze", "Bronze age", "metal", "bronze", "coffeebg", { bgfx: "vignette", font: "baskerville", round: "round" });
  D("metal-chrome", "Chrome", "metal", "pewter", "smoke", { bgfx: "scanlines", font: "jura", round: "sharp" });
  D("metal-rosegold", "Rose gold", "metal", "rosegold", "maroonnight", { bgfx: "glow", font: "instserif", round: "round", btn: "gradient" });
  D("metal-titanium", "Titanium", "metal", "graphitec", "dim", { bgfx: "stripes", font: "geistmono", round: "sharp" });
  D("metal-steel", "Steel mill", "metal", "steel", "steelblue", { bgfx: "grid", font: "bigshoulders", round: "sharp", card: "outlined" });
  D("metal-mercury", "Mercury", "metal", "silver", "bluesmoke", { bgfx: "mesh", font: "outfit", round: "round" });
  D("metal-brass", "Brass", "metal", "mustard", "tobacco", { bgfx: "diamonds", font: "plexserif", round: "round" });
  D("metal-gunmetal", "Gunmetal", "metal", "pewter", "gunmetal", { bgfx: "vignette", font: "arsenal", round: "sharp", card: "outlined" });
  Lt("metal-aluminium", "Aluminium", "metal", "graphitec", "fog", { bgfx: "grain", font: "inter", round: "round" });

  // Space
  D("space-nebula", "Nebula", "space", "neonpurple", "nebula", { bgfx: "prism", font: "outfit", round: "round" });
  D("space-cosmos", "Cosmos", "space", "heliotrope", "cosmos", { bgfx: "stars", font: "outfit", round: "round" });
  D("space-mars", "Mars", "space", "sienna", "burnt", { bgfx: "dusk", font: "jura", round: "sharp" });
  D("space-saturn", "Saturn", "space", "honey", "twilight", { bgfx: "rings", font: "instsans", round: "round" });
  D("space-jupiter", "Jupiter", "space", "apricot", "chocolate", { bgfx: "stripes", font: "instsans", round: "round" });
  D("space-moon", "Moon", "space", "platinum", "ash", { bgfx: "dots", font: "geistmono", round: "round" });
  D("space-galaxy", "Galaxy", "space", "iris", "abyss", { bgfx: "prism", font: "jura", round: "round" });
  D("space-comet", "Comet", "space", "arctic", "navyink", { bgfx: "beams", font: "jura", round: "round" });
  D("space-eclipse", "Eclipse", "space", "mango", "eclipse", { bgfx: "corners", font: "instsans", round: "round" });
  D("space-aurora", "Northern lights", "space", "spearmint", "deepteal", { bgfx: "aurora", font: "outfit", round: "round" });
  D("space-blackhole", "Black hole", "space", "neonpurple", "coal", { bgfx: "vignette", font: "jura", round: "round" });
  D("space-starship", "Starship", "space", "neonblue", "coal", { bgfx: "grid", font: "jura", round: "sharp" });
  D("space-orbit", "Orbit", "space", "cerulean", "cosmos", { bgfx: "rings", font: "outfit", round: "round" });
  D("space-supernova", "Supernova", "space", "bloodorange", "hotcoal", { bgfx: "sunburst", font: "bigshoulders", round: "round" });
  D("space-deepspace", "Deep space", "space", "ultraviolet2", "abyss", { bgfx: "stars", font: "jura", round: "round" });

  // Mood
  D("mood-calm", "Calm", "mood", "jade", "slategreen", { bgfx: "fade", font: "carlito", round: "round" });
  D("mood-focus", "Focus", "mood", "cerulean", "navyink", { bgfx: "vignette", font: "inter", round: "normal" });
  D("mood-energy", "Energy", "mood", "mango", "burnt", { bgfx: "beams", font: "outfit", round: "round", btn: "gradient" });
  D("mood-rage", "Rage", "mood", "scarlet", "hotcoal", { bgfx: "vignette", font: "bigshoulders", round: "sharp", btn: "gradient" });
  Lt("mood-zen", "Zen", "mood", "pistachio", "oat", { bgfx: "fade", font: "instserif", round: "round" });
  D("mood-cozy", "Cozy", "mood", "cinnamon", "chocolate", { bgfx: "glow", font: "instserif", round: "round" });
  D("mood-dreamy", "Dreamy", "mood", "heliotrope", "nebula", { bgfx: "mesh", font: "outfit", round: "round" });
  D("mood-chill", "Chill", "mood", "arctic", "bluesmoke", { bgfx: "dusk", font: "inter", round: "round" });
  Lt("mood-sunday", "Slow Sunday", "mood", "apricot", "oat", { bgfx: "sunrise", font: "instserif", round: "round" });
  D("mood-hype", "Hype", "mood", "hotpink", "magentanight", { bgfx: "confetti", font: "poppins", round: "round", btn: "gradient" });
  D("mood-moody", "Moody", "mood", "mauvec", "eclipse", { bgfx: "vignette", font: "instserif", round: "round" });
  Lt("mood-fresh", "Fresh", "mood", "spearmint", "porcelain", { bgfx: "glow", font: "inter", round: "round" });
  D("mood-serious", "Serious", "mood", "pewter", "coal", { bgfx: "solid", font: "plexmono", round: "sharp", card: "outlined" });
  Lt("mood-playful", "Playful", "mood", "hotpink", "chalk", { bgfx: "confetti", font: "rounded", round: "pill", btn: "gradient" });
  D("mood-brave", "Brave", "mood", "bloodorange", "coal", { bgfx: "sunrise", font: "bricolage", round: "round" });
  Lt("mood-clean", "Clean", "mood", "cerulean", "snow", { bgfx: "solid", font: "inter", round: "round" });
  Lt("mood-warm", "Warm hug", "mood", "terracotta", "claylight", { bgfx: "glow", font: "carlito", round: "round" });
  D("mood-lonely", "Lonely road", "mood", "sandstone", "sepia", { bgfx: "dusk", font: "baskerville", round: "round" });

  // Fonts (a theme to show off each new font)
  Lt("type-inter", "Inter", "type", "royalblue", "snow", { font: "inter", round: "round" });
  D("type-bricolage", "Bricolage", "type", "hotpink", "coal", { font: "bricolage", bgfx: "glow", round: "round" });
  Lt("type-instrument", "Instrument", "type", "cinnamon", "oat", { font: "instsans", round: "round" });
  D("type-carlito", "Friendly", "type", "turquoise", "gunmetal", { font: "carlito", round: "round" });
  Lt("type-library", "Library", "type", "burgundy", "creaml", { font: "plexserif", round: "sharp", card: "outlined" });
  D("type-dev", "Dev", "type", "spearmint", "coal", { font: "plexmono", bgfx: "grid", round: "sharp" });
  Lt("type-novel", "Novel", "type", "sienna", "sand", { font: "crimson", round: "round" });
  Lt("type-memo", "Memo", "type", "navyblue", "paper", { font: "caladea", round: "sharp" });
  D("type-trailhead", "Trailhead", "type", "fern", "evergreen", { font: "nationalpark", bgfx: "fade", round: "round" });
  D("type-geist", "Geist", "type", "platinum", "smoke", { font: "geistmono", round: "sharp" });
  D("type-console", "Console", "type", "acid", "coal", { font: "redhatmono", bgfx: "scanlines", round: "sharp" });
  Lt("type-notebook", "Notebook", "type", "iris", "paper", { font: "dmmono", round: "sharp", card: "outlined" });
  Lt("type-press", "The Press", "type", "scarlet", "ivory", { font: "baskerville", round: "sharp", card: "outlined" });
  Lt("type-magazine", "Magazine", "type", "hotpink", "snow", { font: "youngserif", round: "sharp" });
  D("type-opera", "Opera", "type", "burgundy", "maroonnight", { font: "gloock", bgfx: "spotlight", round: "round", btn: "gradient" });
  Lt("type-gallery", "Gallery", "type", "graphitec", "snow", { font: "instserif", round: "sharp", card: "outlined" });
  Lt("type-boutique", "Boutique", "type", "rosegold", "blush", { font: "italiana", round: "round" });
  D("type-deco", "Art deco", "type", "gold", "obsidian", { font: "poiret", bgfx: "diamonds", round: "sharp", card: "outlined" });
  D("type-scifi", "Sci-fi", "type", "arctic", "abyss", { font: "jura", bgfx: "grid", round: "sharp" });
  D("type-poster", "Poster", "type", "bloodorange", "coal", { font: "smooch", bgfx: "stripes", round: "sharp" });
  D("type-military", "Military", "type", "olive", "olivenight", { font: "arsenal", bgfx: "stripes", round: "sharp", card: "outlined" });
  D("type-8bit", "8-bit", "type", "neongreen", "coal", { font: "pixelify", bgfx: "dots", round: "square" });
  D("type-arcade2", "Pixel arcade", "type", "hotpink", "twilight", { font: "silkscreen", bgfx: "grid", round: "square" });
  D("type-bold", "Bold print", "type", "mango", "burnt", { font: "erica", round: "round" });
  D("type-mega", "Mega", "type", "neonblue", "coal", { font: "boldonse", round: "round" });
  Lt("type-hand", "Handwritten", "type", "cerulean", "vanilla", { font: "handwriting", round: "round" });

  /* ------------------------------------------------------------ "pure" themes: one colour each, with the background of the nearest hue */
  const hueOf = h => U.rgb2hsl(U.hx(h))[0], satOf = h => U.rgb2hsl(U.hx(h))[1];
  const nearest = (list, hue, minSat) => { let best = null, bd = 999; list.forEach(b => { if (satOf(b.s[1]) < minSat) return; const d = Math.abs(((hueOf(b.s[1]) - hue + 540) % 360) - 180); if (d < bd) { bd = d; best = b; } }); return best; };
  const PURE = ["scarlet", "cherry", "raspberry", "hotpink", "flamingo", "salmon", "melon", "burgundy", "bloodorange", "pumpkin", "apricot", "mango", "honey", "lemon", "banana", "mustard", "bronze",
    "kelly", "shamrock", "jade", "spearmint", "pistachio", "fern", "avocado", "neongreen", "acid", "hunter", "jungle", "turquoise", "lagoonc", "cerulean", "arctic", "peacock", "glacierc", "royalblue", "denim",
    "ultra", "periwinkle", "navyblue", "neonblue", "grape", "plumc", "iris", "mauvec", "eggplant", "neonpurple", "heliotrope", "thistle", "terracotta", "clay", "rustc", "cinnamon", "coffee", "mochac", "sienna",
    "sandstone", "ultraviolet2", "sunset2", "seaweed", "ocean2", "limeade", "tangelo"];
  const FONT_CYCLE = ["system", "outfit", "inter", "poppins", "instsans", "bricolage", "carlito"], FX_CYCLE = ["glow", "fade", "mesh", "twin", "horizon", "spotlight", "aurora", "waves"];
  PURE.forEach((id, i) => {
    const a = L.ACCENTS.find(x => x.id === id); if (!a) return;
    const h = hueOf(a.s[2]), dk = nearest(L.BGS, h, 12), lg = nearest(L.LBGS, h, 18), font = FONT_CYCLE[i % FONT_CYCLE.length], fx = FX_CYCLE[i % FX_CYCLE.length], round = i % 3 === 1 ? "round" : "normal";
    if (dk) T("pure-" + id, a.label + " dark", "pure", { theme: "dark", accent: id, bg: dk.id, bgfx: fx, font, round });
    if (lg && i % 2 === 0) T("purel-" + id, a.label + " light", "purel", { theme: "light", accent: id, bgL: lg.id, bgfx: FX_CYCLE[(i + 3) % FX_CYCLE.length], font: FONT_CYCLE[(i + 2) % FONT_CYCLE.length], round: "round" });
  });
})();
