
/* =====================================================================
 * PulseTrack 2.11.0: supersets that are simple to use, in every program.
 *  - Every superset, tri-set and circuit that used to be ONE card ("Bench Press / Dumbbell Flye") with a single weight box is now
 *    separate exercises, each with its own sets, reps and weight, linked as A1 / A2 (Super Shredded 8, Arnold Blueprint,
 *    Bulk and Shred with Buendia, Kris Gethin Legacy, FST-7). Supersets that were already separate exercises but not linked
 *    (Kris Gethin DTP, Legacy, FST-7: Big and Ripped) are now linked.
 *  - Phones that already have these programs are updated the next time the app opens: only the untouched combined cards are replaced
 *    (if you changed the sets, every part follows); exercises you swapped, your progress and your history stay as they are.
 *    Programs whose existing pairs get linked are linked once; unlink one and it stays unlinked.
 *  - The little chain icon is gone. Between two exercises there is now a plain button:
 *    "+ Superset with next" to link them, "Superset with next · Unlink" to separate them.
 * ===================================================================== */
(function () {
  "use strict";
  const proto = ApplicationUI.prototype;
  const clone = o => JSON.parse(JSON.stringify(o));

  /* ------------------------------------------- split the old combined cards, link the separate pairs */
  // OLD[programId][id of the old combined card] = [its old name, its sets, its rest seconds]. A card is only replaced while it still looks like this.
  // LINKS = programs whose already-separate supersets are linked (once).
  const TABLE = {"old":{"jim_stoppani_ss8_base_6days":{"ss8_d1_e1":["Bench Press / Dumbbell Flye",3,60],"ss8_d1_e2":["Incline Dumbbell Flye / Incline Dumbbell Press",3,60],"ss8_d1_e4":["Seated Dumbbell Shoulder Press / Dumbbell Lateral Raise",3,60],"ss8_d1_e5":["Bent-Over Lateral Raise / Dumbbell Upright Row",3,60],"ss8_d1_e7":["Close-Grip Bench Press / Lying Triceps Extension",3,60],"ss8_d1_e8":["Triceps Pressdown / Overhead Cable Triceps Extension (Low Pulley)",2,60],"ss8_d2_e1":["Jump Squat / Leg Extension",3,60],"ss8_d2_e2":["Front Squat / Squat",3,60],"ss8_d2_e3":["Lying Leg Curl / Dumbbell Romanian Deadlift",3,60],"ss8_d2_e5":["Leg Press Calf Raise / One-Leg Standing Calf Raise (Body Weight)",3,60],"ss8_d2_e7":["Hanging Leg Raise / Oblique Crunch",3,60],"ss8_d3_e1":["Bent-Over Barbell Row / Reverse-Grip Barbell Row",3,60],"ss8_d3_e2":["Straight-Arm Pulldown / Wide-Grip Lat Pulldowns",3,60],"ss8_d3_e4":["Barbell Shrug / Behind-The-Back Barbell Shrug",3,60],"ss8_d3_e6":["Seated Barbell Curl / Standing Barbell Curl",2,60],"ss8_d3_e7":["Prone Incline Dumbbell Curl / Incline Dumbbell Curl",2,60],"ss8_d3_e8":["Barbell Wrist Curl / Barbell Reverse Wrist Curl",2,60],"ss8_d4_e1":["Incline Bench Press / Incline Dumbbell Flye",3,60],"ss8_d4_e2":["Cable Crossover (Low Pulley) / Cable Crossover (High Pulley)",3,60],"ss8_d4_e4":["Smith-Machine Seated Behind-The-Neck Shoulder Press / Smith Machine Upright Row",3,60],"ss8_d4_e5":["Lying Cable Rear Delt Raise / Cable Lateral Raise",3,60],"ss8_d4_e7":["Lying Triceps Extension / Bench Dip",2,60],"ss8_d4_e8":["Reverse-Grip Triceps Pressdown / Triceps Pressdown",2,60],"ss8_d5_e1":["Squat / Barbell Lunge",3,60],"ss8_d5_e2":["One-Leg Leg Press (Alt. Legs) / Leg Press",3,60],"ss8_d5_e3":["Deadlift / Romanian Deadlift",3,60],"ss8_d5_e5":["Seated Calf Raise / One-Leg Standing Calf Raise (Body Weight)",3,60],"ss8_d5_e7":["Cable Crunch / Oblique Cable Crunch",3,60],"ss8_d6_e1":["Wide-Grip Lat Pulldowns / Reverse-Grip Lat Pulldown",3,60],"ss8_d6_e2":["Straight-Arm Pulldown / Standing Lat Pulldown",3,60],"ss8_d6_e4":["Smith Machine Behind-The-Back Barbell Shrug / Smith Machine Shrug",3,60],"ss8_d6_e6":["Standing Barbell Curl (EZ-Bar) / Preacher Curl (Also Can Use EZ-Bar)",2,60],"ss8_d6_e7":["Incline Dumbbell Curl / Alternating Dumbbell Curl",2,60],"ss8_d6_e8":["Dumbbell Reverse Wrist Curl / Dumbbell Wrist Curl",2,60]},"arnold_blueprint_mass_p1":{"arn_p1_d1_e3":["Dumbbell Flyes Superset w/ Dumbbell Pullover",5,60],"arn_p1_d1_e5":["Bent-Over Barbell Rows Superset w/ T-Bar Rows",5,75],"arn_p1_d2_e2":["Seated Dumbbell Press Superset w/ Full Frontal Raise",5,60],"arn_p1_d2_e3":["Dumbbell Lateral Raises Superset w/ Barbell Upright Rows",5,60],"arn_p1_d2_e5":["Incline DB Curls Superset w/ Concentration Curls",5,60],"arn_p1_d2_e7":["Skull-Crushers Superset w/ Overhead DB Extension",5,60],"arn_p1_d2_e8":["Barbell Wrist Curls Superset w/ Reverse Wrist Curls",5,45],"arn_p1_d3_e5":["Leg Extension Superset w/ Lying Leg Curls",5,60],"arn_p1_d3_e6":["Standing Calf Raise Superset w/ Seated Calf Raise",5,45],"arn_p1_d4_e3":["Dumbbell Flyes Superset w/ Dumbbell Pullover",5,60],"arn_p1_d4_e5":["One-Arm Dumbbell Rows Superset w/ T-Bar Rows",5,75],"arn_p1_d5_e2":["Behind-the-Neck Barbell Press Superset w/ Full Frontal Raise",5,60],"arn_p1_d5_e3":["Incline Rear Delt Flyes Superset w/ Barbell Upright Rows",5,60],"arn_p1_d5_e5":["Incline DB Curls Superset w/ Concentration Curls",5,60],"arn_p1_d5_e7":["Cable Tricep Pushdown Superset w/ Overhead DB Extension",5,60],"arn_p1_d5_e8":["Barbell Wrist Curls Superset w/ Reverse Wrist Curls",5,45],"arn_p1_d6_e4":["Leg Extension Superset w/ Lying Leg Curls",5,60],"arn_p1_d6_e5":["Standing Calf Raise Superset w/ Seated Calf Raise",5,45]},"arnold_blueprint_cuts_phase2":{"arn_p2_d1_e3":["Weighted Chin-Ups w/ Incline Barbell Bench Press",5,45],"arn_p2_d1_e4":["Bench Press w/ Chin-Ups",4,45],"arn_p2_d1_e5":["Dumbbell Flyes w/ Bent Over Rows",4,45],"arn_p2_d1_e6":["Dumbbell Pullovers, Dips & Cable Crossovers",5,45],"arn_p2_d1_e7":["Giant Abs Set (No Rest)",1,45],"arn_p2_d2_e7":["Giant Abs Set (No Rest)",1,45],"arn_p2_d2_e2":["Leg Extensions w/ Squats",5,45],"arn_p2_d2_e3":["Front Squats w/ Leg Curls",4,45],"arn_p2_d2_e4":["Leg Press w/ Leg Curls",3,45],"arn_p2_d2_e6":["Calves Tri-Set (Donkey, Standing, Seated)",3,45],"arn_p2_d3_e2":["Barbell Press, Cable Side & Lying Side Laterals",4,45],"arn_p2_d3_e3":["Front Dumbbell Raises w/ Rear Delt Raises",4,45],"arn_p2_d3_e4":["Barbell Curls w/ Close Grip Push-Downs",4,45],"arn_p2_d3_e5":["Preacher Curls, Skullcrushers & Reverse Preacher Curls",4,45],"arn_p2_d3_e6":["Concentration Curls w/ Standing One-Arm Rope Push-downs",4,45],"arn_p2_d3_e7":["Reverse Wrist Curls w/ Regular Wrist Curls",3,45]},"bulk_with_buendia":{"bwb_d4_e1":["Barbell Curl w/ Close Grip Bench Press",5,90],"bwb_d4_e2":["Single Arm DB Spider Curl w/ Overhead DB Tricep Extension",4,75],"bwb_d4_e3":["Machine Preacher Curl w/ Cable Straight Bar Pushdown",4,75],"bwb_d4_e4":["Cable Rope Hammer Curl w/ Cable Rope Overhead Tricep Extension",4,75],"bwb_d4_e5":["EZ Bar Reverse Grip Curl w/ Bar Dips",4,75],"bwb_d5_e1":["Calves & Thighs Tri-Set (Seated Calf, Leg Ext, Ham Curl)",4,75]},"shred_with_buendia_complete_v2":{"swb_p1_d1_e2":["Cable Fly (Ladders)",4,50],"swb_p1_d4_e1":["Calf Machine / Leg Extension / Lying Hamstring Curl (Tri-Set)",4,75],"swb_p2_d4_e1":["Calf Machine / Leg Extension / Lying Hamstring Curl (Tri-Set)",4,45],"swb_p1_d5_e1":["E-Z Bar Curl w/ Tricep Straight Bar Pushdown",5,30],"swb_p1_d5_e2":["DB Hammer Curl w/ Tricep Rope Pushdown",4,60],"swb_p1_d5_e3":["DB Single Arm Spider Curl w/ DB Overhead Tricep Extension",4,60],"swb_p1_d5_e4":["DB Curl (Palms Facing Forward, Both Arms) w/ Machine Dips",4,75],"swb_p1_d5_e5":["Barbell Curl w/ Close-Grip Push-Ups",3,60],"swb_p2_d1_e3":["DB Incline Close Grip Press",4,45],"swb_p2_d4_e5":["Seated Hamstring Curl Superset w/ Leg Extensions",4,45],"swb_p2_d5_e1":["Barbell Curl w/ Close-Grip Bench Press",5,30],"swb_p2_d5_e2":["Machine Preacher Curl w/ Machine Dips",4,45],"swb_p2_d5_e3":["Cable Straight Bar Curl w/ Cable Reverse Grip Pushdown",5,45],"swb_p2_d5_e4":["Reverse Grip E-Z Bar Curl w/ Cable Rope Overhead Tricep Extensions",4,45]},"kris_gethin_legacy_12wk":{"w2_d12_e1":["TRICEPS CIRCUIT: Cable Pushdowns + Skull Crushers + Rockers + Close Grip Press + Bench Dips + Overhead Tricep Extension",4,90],"w2_d12_e2":["BICEPS CIRCUIT: Alternating Dumbbell Curls + Leaning Forward Cable in Between Your Legs Curls + Preacher Curls with Barbell Plate + Drag Curls + Row Curls / Kneeling Curls",4,90],"w5_d33_e1":["TRICEPS CIRCUIT: V Bar Cable Pushdowns + Skull Crushers + Parallel bar dips (to failure) + Bench Dips (to failure) + Overhead Dumbbell Extension",4,90],"w5_d33_e2":["BICEPS CIRCUIT: High Pulley Cable Curl + Barbell Curl + Spider Curl on an Incline Bench + Single Arm Dumbbell Curl + Double Hand Hammer Curl",4,90],"w8_d54_e1":["TRICEPS CIRCUIT: Close Grip Push-ups + Rope Extension + Overhead Rope Extension + Parallel Bar Dips + Skullcrushers",4,120]},"fst7_hard_body_blueprint_lvl1":{"fst7_l1_w1_d3_e8":["Ab Circuit (No rest between exercises, 1 min rest after circuit)",4,60],"fst7_l1_w2_d3_e8":["Ab Circuit (No rest between exercises, 1 min rest after circuit)",4,60]}},"links":["kris_gethin_dtp_split","fst7_big_and_ripped_8wk","kris_gethin_legacy_12wk"]};
  const OLD = TABLE.old, LINK_PROGRAMS = TABLE.links;
  const LINK_KEY = "pulsetrack_sslink_v1";
  const LETTERS = "bcdefghi";
  const bProg = id => (typeof BUILTIN_PROGRAMS !== "undefined" && Array.isArray(BUILTIN_PROGRAMS)) ? BUILTIN_PROGRAMS.find(x => x && x.id === id) : null;
  const bDay = (bp, d) => (bp && bp.days || []).find(x => x.dayNumber === d.dayNumber);

  function splitStored(data) {
    let changed = false;
    Object.keys(OLD).forEach(pid => {
      const bp = bProg(pid), p = data.programs.find(x => x && x.id === pid);
      if (!bp || !p || !Array.isArray(p.days)) return;
      p.days.forEach(d => {
        const bd = d && Array.isArray(d.exercises) && bDay(bp, d);
        if (!bd || !Array.isArray(bd.exercises)) return;
        const out = [];
        d.exercises.forEach(e => {
          const o = e && OLD[pid][e.id];
          if (o && e.name === o[0] && !d.exercises.some(x => x && x.id === e.id + "b")) {
            const parts = [bd.exercises.find(x => x.id === e.id)];
            for (let k = 0; k < LETTERS.length; k++) { const x = bd.exercises.find(y => y.id === e.id + LETTERS[k]); if (!x) break; parts.push(x); }
            if (parts[0] && parts.length > 1) {
              const cp = parts.map(clone), last = cp[cp.length - 1];
              if (e.sets !== o[1] && e.sets > 0) cp.forEach(x => { x.sets = e.sets; });                    // you changed the number of sets: every part follows
              if (e.restSeconds !== undefined && e.restSeconds !== o[2]) last.restSeconds = e.restSeconds; // you changed the rest time: it applies after the group
              if (e.link) last.link = true;                                                               // it was linked to the exercise below: still is
              out.push(...cp); changed = true;
              return;
            }
          }
          out.push(e);
        });
        d.exercises = out;
      });
    });
    return changed;
  }
  function loadDone() { try { const l = JSON.parse(PTLS.getItem(LINK_KEY) || "[]"); return Array.isArray(l) ? l : []; } catch (e) { return []; } }
  // link the supersets of programs that already had them as separate exercises (once per program, so unlinking later sticks)
  function linkStored(data, done) {
    let changed = false; const seen = [];
    LINK_PROGRAMS.forEach(pid => {
      if (done.includes(pid)) return;
      const bp = bProg(pid), p = data.programs.find(x => x && x.id === pid);
      if (!bp || !p || !Array.isArray(p.days)) return;
      seen.push(pid);
      p.days.forEach(d => {
        const bd = d && Array.isArray(d.exercises) && bDay(bp, d);
        if (!bd || !Array.isArray(bd.exercises)) return;
        bd.exercises.forEach((be, bi) => {
          if (!be.link || !bd.exercises[bi + 1]) return;
          const i = d.exercises.findIndex(x => x && x.id === be.id);
          if (i >= 0 && d.exercises[i + 1] && d.exercises[i + 1].id === bd.exercises[bi + 1].id && !d.exercises[i].link) { d.exercises[i].link = true; changed = true; }
        });
      });
    });
    return { changed, seen };
  }
  PT.splitSupersets = { splitStored, linkStored, TABLE };
  const oSeed = WorkoutStorage.seedBuiltins;
  WorkoutStorage.seedBuiltins = function (data) {
    const out = oSeed.apply(this, arguments);
    try {
      if (!out || !Array.isArray(out.programs)) return out;
      const a = splitStored(out), done = loadDone(), b = linkStored(out, done);
      const saved = (a || b.changed) ? !!this.setData(out) : true;
      if (saved && b.seen.length) safeSetItem(LINK_KEY, JSON.stringify(done.concat(b.seen)));
    } catch (e) { console.warn("PulseTrack: superset update skipped", e); }
    return out;
  };

  /* ------------------------------------------------------------- the superset button between two exercises */
  const css = document.createElement("style");
  css.id = "pt-m30a-css";
  css.textContent = `
    .pt-ssj { display: flex; justify-content: center; margin: -.55rem 0 !important; position: relative; z-index: 2; pointer-events: none; }
    .pt-ssj button { pointer-events: auto; display: inline-flex; align-items: center; gap: .4rem; min-height: 2.25rem; padding: .35rem .95rem; border-radius: 999px; font-size: .75rem; font-weight: 800; line-height: 1.1;
      background: rgb(var(--z950)); border: 1px dashed rgb(var(--z700)); color: rgb(var(--z300)); }
    .pt-ssj button:active { transform: scale(.97); }
    .pt-ssj.on button { background: rgb(147 51 234); border: 1px solid rgb(192 132 252); color: #fff; box-shadow: 0 2px 10px rgb(147 51 234 / .35); }
    .pt-ssj button svg { width: .9rem; height: .9rem; flex: none; }
  `;
  document.head.appendChild(css);
  const LINK_SVG = '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>';

  function drawJoins(app) {
    const list = app.dom && app.dom.exercisesList; if (!list) return;
    const exs = (app.activeDay && app.activeDay.exercises) || [];
    list.querySelectorAll(".pt-ssj").forEach(x => x.remove());
    list.querySelectorAll("[data-ex-card] .btn-link-ex").forEach(b => b.remove());      // the old icon-only button
    list.querySelectorAll(":scope > [data-ex-card]").forEach(card => {
      const i = parseInt(card.getAttribute("data-ex-card"), 10);
      if (!(i >= 0 && i < exs.length - 1)) return;
      const on = !!exs[i].link;
      const j = document.createElement("div");
      j.className = "pt-ssj" + (on ? " on" : "");
      j.innerHTML = `<button type="button" class="btn-link-ex" data-exindex="${i}" aria-pressed="${on}">${LINK_SVG}<span>${on ? "Superset with next · Unlink" : "+ Superset with next"}</span></button>`;
      card.after(j);
    });
    if (!list.__ptSsj) {
      list.__ptSsj = true;
      list.addEventListener("click", e => {
        const b = e.target.closest && e.target.closest(".pt-ssj .btn-link-ex"); if (!b) return;
        const a = window.app; if (!a || !a.activeDay) return;
        const xs = a.activeDay.exercises || [], i = parseInt(b.dataset.exindex, 10), ex = xs[i], nx = xs[i + 1];
        if (!ex || !nx) return;
        if (ex.link) delete ex.link; else ex.link = true;
        WorkoutStorage.setData(a.data);
        a.renderWorkoutView();
        a.toast(ex.link ? `Superset: ${ex.name}, then straight into ${nx.name}. Rest comes after.` : "Superset removed. They are separate exercises again.");
      });
    }
  }
  const oRender = proto.renderWorkoutView;
  proto.renderWorkoutView = function () {
    const r = oRender.apply(this, arguments);
    try { drawJoins(this); } catch (e) { console.error("PulseTrack 2.10.0 superset joins", e); }
    return r;
  };
})();
  