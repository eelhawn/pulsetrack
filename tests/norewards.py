"""3.2.0 rewards removed, badges kept: no Rewards tab (level, XP, coins, chests, seasons, quests, challenges, check-in, shop, prizes),
no boss fight or group rewards, no reward pop-ups or toasts after a workout, no level card on Home. Badges have their own tab and
still pop up. Saved reward data is left alone. Group wording is neutral (no family / dad / mom words anywhere you can see)."""
import os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page

c = Checks('norewards')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ID = 'my_6day_chest_back_legs_sharms'
PROG = f'app.data.programs.find(x => x.id === "{ID}")'
GONE = ['hub', 'loot', 'lvl', 'season', 'qst', 'chal', 'chk', 'shop', 'wish', 'boss', 'grprew']
REWARD = r'\bXP\b|\b\d+ ?XP\b|\bLevel \d+ ·|\bcoins?\b|\bloot\b|\bchests?\b|\bquests?\b|\bSeason (tier|\d)|\bshop\b|\bboss\b|\bstreak shields?\b|\bRewards\b'
FAMILY = r'\b(famil(y|ies)|dads?|daddy|moms?|mums?|kids?|parents?)\b'
SEED = '''() => { const t0 = Date.now(); for (let i = 1; i <= 10; i++) { const d = new Date(t0 - i * 2 * 86400000); app.sessions.push({ id: "s" + i, v: 1, date: PT.ds(d), ts: d.getTime(), pid: "x", ptitle: "P", day: 1, dtitle: "Day", dur: 3600, unit: "lb",
  ex: [{ name: "Barbell Bench Press", sets: [{ w: 135 + i * 5, r: 8, t: "R" }, { w: 135 + i * 5, r: 8, t: "R" }] }], vol: 2000, sets: 2, prs: [], upd: d.getTime() }); }
  app.sessions.sort((a, b) => a.ts - b.ts); app.saveSessions(); app.rebuildPRs();
  app.settings.loot = { x1: { tier: "rare", k: "db", v: 50, ts: 1 } }; app.settings.shields = 2; app.settings.frame = "galaxy"; app.settings.bossWins = { "2026-11-02": { c: 40 } }; delete app.settings.v290Seen;
  WorkoutStorage.saveSettings(app.settings); }'''

def visible_text(p, root='document.body'):
    return p.evaluate('''(sel) => { const root = sel === "body" ? document.body : document.querySelector(sel); if (!root) return ""; const out = []; const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n;
        while ((n = w.nextNode())) { const e = n.parentElement; if (!e || !n.textContent.trim()) continue; const r = e.getBoundingClientRect(); if (r.width < 1 || r.height < 1) continue;
          let hid = false; for (let x = e; x; x = x.parentElement) { const cs = getComputedStyle(x); if (cs.display === "none" || cs.visibility === "hidden" || (x.classList && x.classList.contains("hidden"))) { hid = true; break; } }
          if (!hid) out.push(n.textContent.trim()); } return out.join("\\n"); }''', root)

with page() as p:
    p.evaluate(SEED)
    p.reload(); p.wait_for_function('typeof PT !== "undefined" && window.app && window.app.data && window.app.data.programs.length'); p.wait_for_timeout(2500)
    c.ok(p.evaluate('PT.rewardsOff === true'), 'rewards are off')
    c.ok(not p.evaluate('!!document.querySelector("#pt-kit-sheet:not(.hidden), .pt-sheet-wrap:not(.hidden)") && /Loot chests|dumbbells/.test(document.body.innerText)'), 'the old 2.90 rewards news does not pop up')

    # ---- Home
    p.evaluate('app.showView("home")'); p.wait_for_timeout(400)
    c.ok(p.evaluate('() => { const y = document.getElementById("pt-you-card"); return !y || getComputedStyle(y).display === "none"; }'), 'Home has no level card')
    c.ok(p.evaluate('!document.getElementById("pt-checkin")'), 'Home has no check-in button')
    home = visible_text(p, '#view-home')
    c.eq(re.findall(REWARD, home), [], 'Home says nothing about XP, coins, chests, quests, the shop or bosses')

    # ---- Progress
    p.evaluate('app.showView("progress")'); p.wait_for_timeout(400)
    tabs = p.evaluate('[...document.querySelectorAll("#pt-ptabs .pt-ptab")].map(b => b.textContent.trim())')
    c.eq(tabs, ['Overview', 'Muscles', 'Strength', 'History', 'Badges', 'Social'], 'the tabs are Overview, Muscles, Strength, History, Badges, Social')
    c.eq([k for k in GONE if p.evaluate('(k) => !!document.getElementById("pt-pg-" + k)', k)], [], 'no rewards, boss or group rewards cards anywhere')
    p.evaluate('document.querySelector(\'#pt-ptabs [data-tab="badges"]\').click()'); p.wait_for_timeout(200)
    c.ok(p.evaluate('() => { const d = document.getElementById("pt-pg-badges"); return !!d && !!d.offsetParent && d.open; }'), 'Badges has its own tab, open')
    c.ok(p.evaluate('document.querySelectorAll("#pt-pg-badges [data-badge], #pt-pg-badges .pt-badge, #pt-pg-badges button").length') > 5, 'the badges are all there')
    allbad = p.evaluate('PT.badges(app).filter(b => (b.series === "chal" || b.series === "seasontr") && !b.got).length')
    c.eq(allbad, 0, 'badges you can only get from challenges or seasons are hidden (unless earned)')
    c.ok(p.evaluate('PT.badges(app).length') > 30, 'every other badge stays')
    for tab in ['overview', 'muscles', 'strength', 'history', 'badges', 'social']:
        p.evaluate('(t) => document.querySelector(\'#pt-ptabs [data-tab="\' + t + \'"]\').click()', tab); p.wait_for_timeout(200)
        p.evaluate('() => document.querySelectorAll("#progress-body details").forEach(d => d.open = true)'); p.wait_for_timeout(250)
        txt = visible_text(p, '#progress-body')
        c.eq(re.findall(REWARD, txt), [], '%s says nothing about rewards' % tab)
        c.eq(re.findall(FAMILY, txt, re.I), [], '%s has neutral group wording' % tab)
    # an old link to Rewards lands on Badges
    p.evaluate('() => { app._progTab = "rewards"; app.showView("home"); app.showView("progress"); }'); p.wait_for_timeout(300)
    c.eq(p.evaluate('document.querySelector("#pt-ptabs [aria-selected=true]").dataset.tab'), 'badges', 'an old link to Rewards opens Badges')

    # ---- group flows
    p.evaluate('() => { app._progTab = "social"; app.renderProgressView(); }'); p.wait_for_timeout(300)
    for bid in ['pt-live-start', 'pt-live-join', 'pt-f2-chal-new']:
        if p.evaluate('(id) => !!document.getElementById(id)', bid):
            p.evaluate('(id) => document.getElementById(id).click()', bid); p.wait_for_timeout(400)
            txt = visible_text(p)
            c.eq(re.findall(FAMILY, txt, re.I), [], 'what %s opens uses neutral wording' % bid)
            p.keyboard.press('Escape'); p.evaluate('() => { try { app.closeSheet(); } catch (e) {} document.querySelectorAll(".pt-kit-x, [data-kit-close]").forEach(b => b.click()); }'); p.wait_for_timeout(200)

    # ---- after a workout: no XP, level, quest, chest or season pop-ups; badges still pop up
    p.evaluate('() => { window.__toasts = []; const ot = app.toast.bind(app); app.toast = function (m) { window.__toasts.push(String(m)); return ot.apply(this, arguments); }; window.__pops = []; const ob = PT.showBadgeUnlock; PT.showBadgeUnlock = items => { window.__pops.push(...items.map(i => i.label || i.name || i.id)); }; }')
    p.evaluate(f'''() => {{ const pr = {PROG}; app.selectProgram(pr, null, true); app.activeProgram = pr; app.activeDay = pr.days[0]; app.showView("workout");
        pr.days[0].exercises.slice(0, 2).forEach(ex => {{ for (let s = 0; s < ex.sets; s++) app.logs[app.getLogKey(pr.id, pr.days[0].dayNumber, ex.id, s)] = {{ completed: true, weight: "500", reps: "12", tag: "R" }}; }});
        WorkoutStorage.saveLogs(app.logs); app.renderWorkoutView(); }}''')
    p.wait_for_timeout(200)
    p.evaluate('() => { window.__f = app.finishWorkout(); }')
    try:
        p.wait_for_function('() => !!document.querySelector("#pt-fin [data-fin=yes]")', timeout=2500); p.wait_for_timeout(500)
        p.evaluate('() => document.querySelector("#pt-fin [data-fin=yes]").click()')
    except Exception:
        pass
    p.wait_for_function('() => window.__f && (window.__f.then(() => { window.__fd = 1; }), window.__fd === 1)', timeout=8000)
    p.wait_for_timeout(4000)
    c.eq(p.evaluate('app.sessions.length'), 11, 'the workout is saved')
    toasts = p.evaluate('window.__toasts'); pops = p.evaluate('window.__pops')
    c.eq([t for t in toasts if re.search(REWARD + r'|dumbbells', t)], [], 'no reward toasts after the workout (%s)' % toasts)
    c.eq([x for x in pops if re.search(r'Level up|Season|Challenge', str(x))], [], 'no level, season or challenge pop-ups (%s)' % pops)
    c.ok(not p.evaluate('() => { const l = document.getElementById("pt-xp-line"); return !!l && getComputedStyle(l).display !== "none"; }'), 'no XP line on the finish screen')

    # ---- nothing saved was deleted
    st = p.evaluate('({ loot: app.settings.loot, shields: app.settings.shields, frame: app.settings.frame, boss: app.settings.bossWins })')
    c.eq((list(st['loot'].keys()), st['shields'], st['frame'], list(st['boss'].keys())), (['x1'], 2, 'galaxy', ['2026-11-02']), 'old reward data is kept, untouched')
    c.eq(p.errors, [], 'no errors')

# ---- wording in the files people read
src = open(os.path.join(ROOT, 'src', 'js', '004-app-core.js'), encoding='utf-8').read()
c.ok("Dad's" not in src, 'the program name example is neutral')
for f in ('TERMS.md', 'PRIVACY.md'):
    c.eq(re.findall(r'\b(famil(y|ies)|dads?|moms?|mums?)\b', open(os.path.join(ROOT, f), encoding='utf-8').read(), re.I), [], '%s uses group, not family (the age rule keeps "parent or guardian")' % f)

sys.exit(c.done())
