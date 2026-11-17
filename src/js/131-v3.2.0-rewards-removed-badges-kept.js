/* =====================================================================
 * PulseTrack 3.2.0: the rewards are gone, the badges stay.
 *  Taken out: the Rewards tab (level and XP, profile frames and titles, coins/dumbbells, the daily chest and loot chests, seasons,
 *  weekly quests, challenges, the daily check-in, the shop, your own prizes, streak shields), the boss fight and boss battle, and the
 *  group rewards card. Nothing about them pops up after a workout any more ("+XP", level up, quest done, chest ready, season tier,
 *  boss beaten), and the Home card with the level is gone.
 *  Kept: badges (their own tab in Progress, and the pop-up when you earn one), strength ranks, the weekly goal and its streak, the
 *  group board and weekly recap, records and everything else. Badges that only came from challenges or seasons are hidden unless you
 *  already earned them.
 *  Nothing saved is deleted (settings keep the old XP, coins, chests and so on), so turning this back on later would lose nothing.
 *  How: PT.rewardsOff = true. Modules 044, 046, 049, 098, 102, 103 and 106 check it before showing anything; module 999 drops their
 *  Progress cards; the Home card stays in the page but hidden, because the nudge line is placed after it.
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof ApplicationUI === "undefined" || typeof PT === "undefined") return;
  PT.rewardsOff = true;

  // badges that can only be earned through removed features: shown only if already earned
  const GONE = new Set(["chal", "seasontr"]);
  if (typeof PT.badges === "function") {
    const oB = PT.badges;
    PT.badges = function () { const list = oB.apply(this, arguments) || []; return list.filter(b => !(b && GONE.has(b.series) && !b.got)); };
  }

  const css = document.createElement("style"); css.id = "pt-v330-css";
  css.textContent = `
    #pt-you-card, #pt-checkin, #pt-xp-line { display: none !important; }
  `;
  document.head.appendChild(css);
})();
