/* =====================================================================
 * PulseTrack 3.2.0: a lot more themes.
 *   - Six new groups in the theme gallery: Games, Sports, Sky, Places, Food and Music (104 themes)
 *   - 9 new background patterns made for them: Pixels, Blocks, Court, Flag, Speed, Pitch, Rain, Net and Snow
 *   - 30 new colours and 21 new backgrounds they use (all made the same way as the others, so text stays readable)
 * Everything goes into the lists module 009 owns (PT.look.*), so the gallery, Appearance, Surprise me, theme codes and the
 * readability test treat them like any other theme. Names are plain descriptions, not games, teams or brands.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof PT === "undefined" || !PT.look || !PT.look.util || !PT.look.FX_EXT) return;
  const L = PT.look, U = L.util, has = (arr, id) => arr.some(x => x.id === id);
  const hex = (h, s, l) => U.toHex(U.hsl2rgb([h, s, l]));

  /* ------------------------------------------------------------ colours: [id, name, main shade] (same recipe as 2.71.0) */
  function acc(id, label, base) {
    if (has(L.ACCENTS, id)) return;
    const [h, s, l] = U.rgb2hsl(U.hx(base)), mk = d => U.hsl2rgb([h, s, Math.max(4, Math.min(94, l + d))]);
    L.ACCENTS.push({ id, label, s: [U.toHex(mk(+22)), U.toHex(mk(+11)), U.toHex(U.hx(base)), U.toHex(mk(-9)), U.toHex(U.hsl2rgb([h, Math.min(s, 85), Math.max(10, Math.min(l - 26, 32))])), U.toHex(U.hsl2rgb([h, Math.min(s, 60), 11]))] });
  }
  [
    ["grassc", "Grass", "#5dab3c"], ["dirtc", "Dirt", "#a8743f"], ["lava", "Lava", "#ff5a1f"], ["diamondc", "Diamond", "#4fe3d6"], ["pixelpink", "Pixel pink", "#ff4fa3"],
    ["handheldc", "Handheld green", "#8bac0f"], ["coinc", "Coin", "#ffcc1a"], ["plasma", "Plasma", "#7d5cff"], ["racered", "Race red", "#e10600"], ["papaya", "Papaya", "#ff8000"],
    ["racinggreen", "Racing green", "#14a06a"], ["ballorange", "Ball orange", "#ee6730"], ["hardwoodc", "Hardwood", "#c8925a"], ["turfc", "Turf", "#3fa34d"], ["tennisc", "Tennis ball", "#d4f230"],
    ["stitch", "Stitch red", "#d2232a"], ["poolc", "Pool", "#1ca3ec"], ["rinkc", "Rink", "#7cc8ff"], ["sunsetpink", "Sunset pink", "#ff5e78"], ["goldenhour", "Golden hour", "#ffad42"],
    ["skyc", "Sky", "#4fb3ff"], ["stormc", "Storm", "#8b9db5"], ["auroragreen", "Aurora green", "#3dfc9a"], ["neonsign", "Neon sign", "#ff2bd6"], ["tacoc", "Taco", "#f2b134"],
    ["avocadoc", "Avocado", "#7fb239"], ["salmonroe", "Sushi", "#ff7a59"], ["vinylc", "Vinyl", "#e4572e"], ["jazzc", "Jazz", "#c9a227"], ["reggaec", "Reggae", "#2fb344"]
  ].forEach(a => acc(a[0], a[1], a[2]));

  /* ------------------------------------------------------------ backgrounds */
  function dbg(id, label, h, s, v) {
    if (has(L.BGS, id)) return;
    const ls = v === "deep" ? [2.5, 5.5, 8, 13.5, 22] : v === "lift" ? [7, 11, 14, 20, 30] : [4, 7.5, 10, 16, 25];
    L.BGS.push({ id, label, s: ls.map(l => hex(h, s, l)) });
  }
  function lbg(id, label, h, s) {
    if (has(L.LBGS, id)) return;
    L.LBGS.push({ id, label, s: [95, 99.4, 97.4, 90, 83].map(l => hex(h, s, l)) });
  }
  [
    ["pixelnight", "Pixel night", 235, 45, "deep"], ["dirtnight", "Dirt", 28, 35], ["cave", "Cave", 210, 6], ["handheldnight", "Handheld", 85, 40, "deep"], ["asphalt", "Asphalt", 220, 6, "deep"],
    ["hardwoodnight", "Hardwood night", 28, 45], ["turfnight", "Turf night", 135, 40, "deep"], ["rinknight", "Rink night", 205, 45, "deep"], ["sunsetnight", "Sunset night", 335, 40],
    ["stormnight", "Storm night", 215, 22], ["desertnight", "Desert night", 25, 40], ["neoncity", "Neon city", 285, 45, "deep"], ["rainforest", "Rainforest", 150, 45, "deep"],
    ["espressonight", "Espresso", 20, 35, "deep"], ["vinylnight", "Vinyl", 0, 0, "deep"]
  ].forEach(b => dbg(b[0], b[1], b[2], b[3], b[4]));
  [["courtl", "Court", 33, 60], ["snowl", "Snow", 205, 40], ["sunsetl", "Sunset", 15, 85], ["handheldl", "Handheld screen", 75, 45], ["sandl", "Beach sand", 40, 55], ["paperl", "Sheet music", 45, 30]]
    .forEach(b => lbg(b[0], b[1], b[2], b[3]));

  /* ------------------------------------------------------------ background patterns */
  const X = L.FX_EXT, FX = L.FX;
  const alt = (ac, d) => { const [h, s, l] = U.rgb2hsl(ac.sh[2]); return U.hsl2rgb([(h + d + 360) % 360, Math.max(45, Math.min(s, 90)), Math.max(38, Math.min(l, 62))]).map(Math.round).join(" "); };
  const svgUrl = svg => `url("data:image/svg+xml,${svg.replace(/</g, "%3C").replace(/>/g, "%3E").replace(/#/g, "%23").replace(/"/g, "'")}")`;
  const comma = c => c.split(" ").join(",");
  const FXN = [
    ["pixels", "Pixels", (lt, t, c) => {
      const cells = [[0, 0, .9], [2, 0, .5], [1, 1, .7], [3, 1, .35], [0, 2, .45], [2, 2, .8], [1, 3, .3], [3, 3, .6]];
      const op = lt ? .1 : .085;
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'>${cells.map(([x, y, o]) => `<rect x='${x * 16}' y='${y * 16}' width='16' height='16' fill='rgb(${comma(c)})' fill-opacity='${(o * op).toFixed(3)}'/>`).join("")}</svg>`;
      return `radial-gradient(110% 45% at 50% -10%, rgb(${c} / ${lt ? .16 : .2}), transparent 70%), ${svgUrl(svg)} 0 0 / 64px 64px`;
    }],
    ["blocks", "Blocks", (lt, t, c, ac) => {
      const o = alt(ac, -95), a = lt ? .14 : .2, b = lt ? .1 : .14;
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'><rect width='48' height='48' fill='rgb(${comma(c)})' fill-opacity='${a}'/><rect x='48' y='48' width='48' height='48' fill='rgb(${comma(o)})' fill-opacity='${b}'/><rect x='48' width='48' height='48' fill='rgb(${comma(c)})' fill-opacity='${(a / 3).toFixed(3)}'/></svg>`;
      return `linear-gradient(180deg, transparent 0 55%, rgb(${c} / ${lt ? .08 : .1}) 100%), ${svgUrl(svg)} 0 100% / 96px 96px`;
    }],
    ["court", "Court", (lt, t, c) => {
      const line = `rgb(${c} / ${lt ? .3 : .28})`;
      return `radial-gradient(circle at 50% 0, transparent 0 104px, ${line} 104px 106px, transparent 106px), radial-gradient(circle at 50% 0, ${line} 0 18px, transparent 19px), repeating-linear-gradient(90deg, rgb(${c} / ${lt ? .05 : .045}) 0 2px, transparent 2px 38px)`;
    }],
    ["flag", "Flag", (lt, t, c, ac, bg) => {
      const k = lt ? "rgb(0 0 0 / .09)" : "rgb(255 255 255 / .075)";
      return `linear-gradient(180deg, transparent 0, ${bg[0]} 190px), conic-gradient(${k} 25%, transparent 0 50%, ${k} 0 75%, transparent 0) 0 0 / 28px 28px, radial-gradient(110% 40% at 50% -5%, rgb(${c} / ${lt ? .16 : .22}), transparent 70%)`;
    }],
    ["speed", "Speed", (lt, t, c, ac) => `repeating-linear-gradient(112deg, transparent 0 58px, rgb(${c} / ${lt ? .1 : .08}) 58px 60px, transparent 60px 96px, rgb(${alt(ac, 20)} / ${lt ? .07 : .06}) 96px 97px), radial-gradient(90% 40% at 100% 0, rgb(${c} / ${lt ? .2 : .26}), transparent 70%)`],
    ["pitch", "Pitch", (lt, t, c) => `radial-gradient(circle at 50% 210px, transparent 0 70px, rgb(255 255 255 / ${lt ? .5 : .1}) 70px 72px, transparent 72px), repeating-linear-gradient(180deg, rgb(${c} / ${lt ? .09 : .07}) 0 52px, transparent 52px 104px)`],
    ["rain", "Rain", (lt, t, c) => `repeating-linear-gradient(104deg, transparent 0 21px, rgb(${lt ? "40 60 90 / .07" : "180 200 230 / .06"}) 21px 22px), linear-gradient(180deg, rgb(${c} / ${lt ? .12 : .14}), transparent 55%)`],
    ["net", "Net", (lt, t, c) => { const k = `rgb(${c} / ${lt ? .09 : .07})`; return `repeating-linear-gradient(45deg, ${k} 0 1px, transparent 1px 26px), repeating-linear-gradient(-45deg, ${k} 0 1px, transparent 1px 26px), radial-gradient(110% 40% at 50% -10%, rgb(${c} / ${lt ? .14 : .18}), transparent 70%)`; }],
    ["snow", "Snow", (lt, t, c) => {
      const at = [[6, 8], [19, 3], [33, 11], [47, 5], [61, 14], [75, 4], [89, 10], [12, 26], [27, 33], [41, 24], [56, 31], [70, 27], [84, 36], [96, 22], [4, 47], [22, 54], [38, 45], [52, 58], [67, 49], [81, 56], [93, 44], [10, 72], [30, 78], [46, 69], [63, 81], [78, 71], [90, 84], [17, 93], [55, 95], [72, 97]];
      const col = lt ? `rgb(${c} / .35)` : "rgb(255 255 255 / .55)";
      return at.map((p, i) => `radial-gradient(${1 + (i % 3) * .7}px ${1 + (i % 3) * .7}px at ${p[0]}% ${p[1]}%, ${col}, transparent)`).join(", ");
    }]
  ];
  FXN.forEach(f => { if (!has(FX, f[0])) { FX.push({ id: f[0], label: f[1] }); X[f[0]] = f[2]; } });

  /* ------------------------------------------------------------ groups, before the long "Pure" lists */
  const NEW = [["games", "Games"], ["sports", "Sports"], ["sky", "Sky"], ["places", "Places"], ["food", "Food"], ["music", "Music"]].filter(c => !L.CATS.some(x => x[0] === c[0]));
  const at = L.CATS.findIndex(c => c[0] === "pure");
  L.CATS.splice(at < 0 ? L.CATS.length : at, 0, ...NEW);

  const T = (id, label, cat, o) => { if (!has(L.PRESETS, id)) L.PRESETS.push({ id, label, cat, s: Object.assign({ font: "system", bgfx: "solid" }, o) }); };
  const D = (id, label, cat, accent, bg, o) => T(id, label, cat, Object.assign({ theme: "dark", accent, bg }, o));
  const Lt = (id, label, cat, accent, bgL, o) => T(id, label, cat, Object.assign({ theme: "light", accent, bgL }, o));

  // Games
  D("game-8bit", "8-bit hero", "games", "pixelpink", "pixelnight", { bgfx: "pixels", font: "silkscreen", round: "square", card: "outlined" });
  D("game-16bit", "16-bit", "games", "plasma", "twilight", { bgfx: "pixels", font: "pixelify", round: "sharp" });
  D("game-blocky", "Blocky world", "games", "grassc", "dirtnight", { bgfx: "blocks", font: "pixelify", round: "square", card: "outlined" });
  D("game-cave", "Cave", "games", "diamondc", "cave", { bgfx: "blocks", font: "pixelify", round: "square" });
  D("game-lava", "Lava cave", "games", "lava", "hotcoal", { bgfx: "blocks", font: "pixelify", round: "square", btn: "gradient" });
  D("game-diamond", "Diamond", "games", "diamondc", "deepteal", { bgfx: "pixels", font: "silkscreen", round: "square" });
  Lt("game-handheld", "Pocket screen", "games", "handheldc", "handheldl", { bgfx: "pixels", font: "pixelify", round: "sharp", card: "outlined" });
  D("game-handheldnight", "Pocket night", "games", "handheldc", "handheldnight", { bgfx: "scanlines", font: "silkscreen", round: "square" });
  D("game-coin", "Coin rush", "games", "coinc", "pixelnight", { bgfx: "pixels", font: "pixelify", round: "round", btn: "gradient" });
  D("game-shooter", "Space shooter", "games", "neonblue", "cosmos", { bgfx: "stars", font: "silkscreen", round: "square" });
  D("game-platformer", "Platformer", "games", "skyc", "navyink", { bgfx: "blocks", font: "pixelify", round: "sharp" });
  D("game-dungeon", "Dungeon", "games", "mango", "cave", { bgfx: "vignette", font: "pixelify", round: "square", card: "outlined" });
  D("game-highscore", "High score", "games", "neonsign", "obsidian", { bgfx: "scanlines", font: "silkscreen", round: "square", btn: "gradient" });
  D("game-pinball", "Pinball", "games", "hotpink", "neoncity", { bgfx: "confetti", font: "tektur", round: "pill" });
  D("game-puzzle", "Falling blocks", "games", "coinc", "pixelnight", { bgfx: "blocks", font: "silkscreen", round: "square" });
  D("game-glitch", "Glitch", "games", "electric", "coal", { bgfx: "scanlines", font: "geistmono", round: "square" });
  D("game-respawn", "Respawn", "games", "auroragreen", "cosmos", { bgfx: "grid", font: "tektur", round: "sharp" });
  D("game-cartridge", "Cartridge", "games", "stormc", "ash", { bgfx: "pixels", font: "pixelify", round: "sharp", card: "raised" });
  D("game-racer", "Arcade racer", "games", "papaya", "pixelnight", { bgfx: "speed", font: "tektur", round: "sharp", btn: "gradient" });

  // Sports
  D("sport-basketball", "Basketball", "sports", "ballorange", "hardwoodnight", { bgfx: "court", font: "bigshoulders", round: "round" });
  Lt("sport-hardwood", "Hardwood", "sports", "ballorange", "courtl", { bgfx: "court", font: "bigshoulders", round: "round" });
  D("sport-streetball", "Streetball", "sports", "ballorange", "asphalt", { bgfx: "net", font: "smooch", round: "sharp" });
  D("sport-raceday", "Race day", "sports", "racered", "asphalt", { bgfx: "flag", font: "tektur", round: "sharp", btn: "gradient" });
  D("sport-pitlane", "Pit lane", "sports", "papaya", "coal", { bgfx: "speed", font: "tektur", round: "sharp" });
  D("sport-grandprix", "Grand Prix night", "sports", "racered", "pixelnight", { bgfx: "speed", font: "tektur", round: "sharp" });
  D("sport-checkered", "Checkered flag", "sports", "silver", "coal", { bgfx: "flag", font: "bigshoulders", round: "sharp", card: "outlined" });
  D("sport-racinggreen", "Racing green", "sports", "racinggreen", "evergreen", { bgfx: "speed", font: "tektur", round: "sharp" });
  D("sport-football", "Football pitch", "sports", "turfc", "turfnight", { bgfx: "pitch", font: "bigshoulders", round: "round" });
  D("sport-stadium", "Stadium lights", "sports", "silver", "turfnight", { bgfx: "spotlight", font: "bigshoulders", round: "round" });
  Lt("sport-tennis", "Tennis", "sports", "racinggreen", "snowl", { bgfx: "net", font: "outfit", round: "round" });
  Lt("sport-claycourt", "Clay court", "sports", "terracotta", "claylight", { bgfx: "net", font: "outfit", round: "round" });
  D("sport-tennisnight", "Night match", "sports", "tennisc", "rinknight", { bgfx: "net", font: "outfit", round: "round" });
  Lt("sport-baseball", "Baseball", "sports", "stitch", "pearl", { bgfx: "dots", font: "arsenal", round: "round" });
  D("sport-hockey", "Hockey", "sports", "rinkc", "rinknight", { bgfx: "snow", font: "bigshoulders", round: "sharp" });
  Lt("sport-golf", "Golf", "sports", "turfc", "sagelight", { bgfx: "pitch", font: "instserif", round: "round" });
  D("sport-boxing", "Boxing", "sports", "stitch", "maroonnight", { bgfx: "spotlight", font: "erica", round: "round" });
  D("sport-swim", "Swim", "sports", "poolc", "lagoonnight", { bgfx: "waves", font: "outfit", round: "round" });
  D("sport-cycling", "Cycling", "sports", "coinc", "asphalt", { bgfx: "speed", font: "outfit", round: "pill" });
  Lt("sport-surf", "Surf", "sports", "poolc", "sandl", { bgfx: "waves", font: "rounded", round: "round" });
  Lt("sport-snowboard", "Snowboard", "sports", "neonblue", "snowl", { bgfx: "snow", font: "smooch", round: "round" });
  D("sport-climbing", "Climbing", "sports", "tennisc", "mud", { bgfx: "dots", font: "bricolage", round: "round" });
  Lt("sport-volleyball", "Beach volleyball", "sports", "goldenhour", "sandl", { bgfx: "net", font: "rounded", round: "round" });
  D("sport-marathon", "Marathon", "sports", "skyc", "stormnight", { bgfx: "beams", font: "outfit", round: "pill" });
  D("sport-skate", "Skate park", "sports", "neonsign", "asphalt", { bgfx: "grain", font: "smooch", round: "sharp" });

  // Sky
  D("sky-goldenhour", "Golden hour", "sky", "goldenhour", "desertnight", { bgfx: "sunrise", font: "poppins", round: "round" });
  D("sky-pinksunset", "Pink sunset", "sky", "sunsetpink", "sunsetnight", { bgfx: "horizon", font: "outfit", round: "round", btn: "gradient" });
  Lt("sky-sunsetbeach", "Sunset beach", "sky", "bloodorange", "sunsetl", { bgfx: "sunrise", font: "poppins", round: "round" });
  D("sky-desertsunset", "Desert sunset", "sky", "papaya", "desertnight", { bgfx: "dusk", font: "bricolage", round: "round" });
  D("sky-sunsetdrive", "Sunset drive", "sky", "sunsetpink", "neoncity", { bgfx: "sunrise", font: "tektur", round: "sharp" });
  D("sky-afterglow", "Afterglow", "sky", "goldenhour", "twilight", { bgfx: "horizon", font: "instserif", round: "round" });
  Lt("sky-sunriserun", "Sunrise run", "sky", "goldenhour", "creaml", { bgfx: "sunrise", font: "outfit", round: "round" });
  D("sky-bluehour", "Blue hour", "sky", "skyc", "navyink", { bgfx: "horizon", font: "inter", round: "round" });
  D("sky-storm", "Thunderstorm", "sky", "coinc", "stormnight", { bgfx: "rain", font: "bigshoulders", round: "sharp" });
  D("sky-rainy", "Rainy day", "sky", "stormc", "bluesmoke", { bgfx: "rain", font: "inter", round: "round" });
  Lt("sky-fog", "Morning fog", "sky", "stormc", "fog", { bgfx: "fade", font: "instsans", round: "round" });
  D("sky-snowfall", "Snowfall", "sky", "rinkc", "stormnight", { bgfx: "snow", font: "outfit", round: "round" });
  Lt("sky-snowday", "Snow day", "sky", "skyc", "snowl", { bgfx: "snow", font: "rounded", round: "round" });
  D("sky-rainbow", "After the rain", "sky", "skyc", "twilight", { bgfx: "prism", font: "poppins", round: "round" });
  D("sky-starry", "Starry night", "sky", "coinc", "navyink", { bgfx: "stars", font: "baskerville", round: "round" });
  D("sky-heatwave", "Heatwave", "sky", "lava", "burnt", { bgfx: "sunrise", font: "smooch", round: "sharp" });
  D("sky-aurora", "Aurora sky", "sky", "auroragreen", "cosmos", { bgfx: "aurora", font: "outfit", round: "round" });

  // Places
  D("place-tokyo", "Tokyo nights", "places", "neonsign", "neoncity", { bgfx: "rain", font: "inter", round: "sharp" });
  D("place-neoncity", "Neon city", "places", "electric", "neoncity", { bgfx: "beams", font: "tektur", round: "sharp" });
  D("place-miami", "Miami", "places", "hotpink", "lagoonnight", { bgfx: "sunrise", font: "poppins", round: "pill" });
  Lt("place-paris", "Paris", "places", "navyblue", "linen", { bgfx: "fade", font: "italiana", round: "round" });
  D("place-newyork", "New York", "places", "coinc", "asphalt", { bgfx: "grid", font: "bigshoulders", round: "sharp" });
  D("place-london", "London fog", "places", "stitch", "bluesmoke", { bgfx: "rain", font: "baskerville", round: "round" });
  D("place-desertroad", "Desert road", "places", "papaya", "desertnight", { bgfx: "speed", font: "bricolage", round: "round" });
  D("place-rainforest", "Rainforest", "places", "auroragreen", "rainforest", { bgfx: "rain", font: "outfit", round: "round" });
  Lt("place-alps", "Alps", "places", "royalblue", "snowl", { bgfx: "snow", font: "jura", round: "round" });
  Lt("place-beachclub", "Beach club", "places", "poolc", "sandl", { bgfx: "waves", font: "poppins", round: "pill" });
  D("place-iceland", "Iceland", "places", "auroragreen", "arcticnight", { bgfx: "aurora", font: "jura", round: "round" });
  D("place-sahara", "Sahara", "places", "goldenhour", "dirtnight", { bgfx: "dusk", font: "instserif", round: "round" });
  D("place-havana", "Havana", "places", "turquoise", "hardwoodnight", { bgfx: "sunrise", font: "youngserif", round: "round" });
  D("place-seoul", "Seoul", "places", "pixelpink", "pixelnight", { bgfx: "beams", font: "outfit", round: "round" });

  // Food
  D("food-espresso", "Espresso", "food", "hardwoodc", "espressonight", { bgfx: "glow", font: "instserif", round: "round" });
  Lt("food-avocado", "Avocado toast", "food", "avocadoc", "creaml", { bgfx: "dots", font: "rounded", round: "round" });
  D("food-watermelon", "Watermelon", "food", "melon", "turfnight", { bgfx: "dots", font: "poppins", round: "round" });
  D("food-pancakes", "Blueberry pancakes", "food", "royalblue", "tobacco", { bgfx: "glow", font: "rounded", round: "round" });
  D("food-pizza", "Pizza night", "food", "tacoc", "hotcoal", { bgfx: "checker", font: "bricolage", round: "round" });
  D("food-sushi", "Sushi", "food", "salmonroe", "coal", { bgfx: "dots", font: "inter", round: "round" });
  D("food-taco", "Taco Tuesday", "food", "tacoc", "burnt", { bgfx: "confetti", font: "bricolage", round: "round" });
  Lt("food-pb", "Peanut butter", "food", "hardwoodc", "almond", { bgfx: "glow", font: "bricolage", round: "round" });
  Lt("food-shake", "Protein shake", "food", "mochac", "oat", { bgfx: "rings", font: "outfit", round: "pill" });
  D("food-darkchoc", "Dark chocolate", "food", "hardwoodc", "chocolate", { bgfx: "checker", font: "gloock", round: "round" });
  D("food-limesoda", "Lime soda", "food", "acid", "jadenight", { bgfx: "confetti", font: "rounded", round: "round" });
  D("food-hotsauce", "Hot sauce", "food", "lava", "maroonnight", { bgfx: "sunrise", font: "erica", round: "round" });
  Lt("food-oatmeal", "Oatmeal", "food", "cinnamon", "oat", { bgfx: "grain", font: "carlito", round: "round" });
  D("food-berrybowl", "Berry bowl", "food", "raspberry", "grapenight", { bgfx: "dots", font: "poppins", round: "round" });

  // Music
  D("music-lofi", "Lo-fi", "music", "thistle", "purplesmoke", { bgfx: "grain", font: "dmmono", round: "round" });
  D("music-vinyl", "Vinyl", "music", "vinylc", "vinylnight", { bgfx: "rings", font: "youngserif", round: "round" });
  D("music-jazz", "Jazz club", "music", "jazzc", "espressonight", { bgfx: "spotlight", font: "gloock", round: "round" });
  D("music-rock", "Rock", "music", "racered", "coal", { bgfx: "grain", font: "erica", round: "sharp" });
  D("music-metal", "Heavy metal", "music", "silver", "vinylnight", { bgfx: "vignette", font: "bigshoulders", round: "square", card: "outlined" });
  D("music-disco", "Disco", "music", "neonsign", "neoncity", { bgfx: "confetti", font: "poppins", round: "pill", btn: "gradient" });
  D("music-techno", "Techno", "music", "electric", "coal", { bgfx: "grid", font: "geistmono", round: "square" });
  D("music-hiphop", "Hip-hop", "music", "coinc", "asphalt", { bgfx: "grain", font: "bigshoulders", round: "sharp" });
  D("music-reggae", "Reggae", "music", "reggaec", "turfnight", { bgfx: "sunrise", font: "rounded", round: "round" });
  Lt("music-country", "Country", "music", "hardwoodc", "linen", { bgfx: "grain", font: "youngserif", round: "round" });
  Lt("music-pop", "Pop", "music", "pixelpink", "bubblegumL", { bgfx: "confetti", font: "poppins", round: "pill" });
  D("music-kpop", "K-pop", "music", "hotpink", "twilight", { bgfx: "prism", font: "outfit", round: "pill", btn: "gradient" });
  D("music-punk", "Punk", "music", "acid", "coal", { bgfx: "stripes", font: "smooch", round: "square" });
  Lt("music-classical", "Classical", "music", "burgundy", "paperl", { bgfx: "fade", font: "baskerville", round: "round" });
  D("music-synth", "Synth", "music", "plasma", "neoncity", { bgfx: "sunrise", font: "tektur", round: "sharp" });
})();
