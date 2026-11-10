"""Backups: the status line, Save to Downloads, Check a backup file, the safer restore, and the reminders."""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page

c = Checks('backup')
STUB = '''() => { window.__alerts = []; window.__confirms = []; PT.alert = async m => { window.__alerts.push(String(m)); }; PT.confirm = async m => { window.__confirms.push(String(m)); return true; }; PT.backup.reload = () => { window.__reloaded = true; }; }'''


def seed(p, n=5):
    p.evaluate('''(n) => {
      const day = 86400000, now = Date.now();
      for (let i = 0; i < n; i++) { const t = now - (i * 2 + 1) * day;
        app.sessions.push({ id: "f" + i, date: PT.ds(new Date(t)), ts: t, name: "Day", ex: [{ id: "x", name: "Bench Press", sets: [{ w: 100, r: 8, t: 1 }] }], vol: 2400, sets: 3, unit: "lb", prs: [], dur: 3000 }); }
      app.saveSessions();
    }''', n)


def settings(p):
    p.evaluate('() => { app.openSettings(); }')
    p.wait_for_timeout(400)


# ---------------------------------------------------------------- the card and the status line
with page() as p:
    settings(p)
    c.ok(p.evaluate('() => !!document.getElementById("pt-bk")'), 'Data & Backup has the new card')
    c.ok('No backup yet' in p.evaluate('() => document.getElementById("backup-status").textContent'), 'a new phone says there is no backup yet')
    c.eq(p.evaluate('() => document.getElementById("btn-export-backup").textContent'), '☁ Back up to Drive / Files', 'the main button says where it goes')
    seed(p)
    settings(p)
    c.ok('5 workouts' in p.evaluate('() => document.getElementById("backup-status").textContent'), 'the status line counts the workouts')
    c.ok(p.evaluate('() => /\\d+(\\.\\d+)? MB/.test(document.getElementById("backup-status").textContent)'), 'and the size')
    s = p.evaluate('() => PT.backup.summarize(PT.backup.keysNow())')
    c.eq([s['workouts'], s['damaged'], s['bad']], [5, False, []], 'a healthy phone summarizes as healthy')
    # Save to Downloads
    with p.expect_download() as d:
        p.evaluate('() => document.getElementById("pt-bk-dl").click()')
    dl = d.value
    c.ok(dl.suggested_filename.startswith('pulsetrack-backup-') and dl.suggested_filename.endswith('.json'), 'Save to Downloads gives a dated .json file')
    data = json.loads(open(dl.path(), encoding='utf-8').read())
    c.eq([data['app'], len(json.loads(data['keys']['pulsetrack_sessions_v1']))], ['PulseTrack', 5], 'the file holds the workouts')
    c.ok(p.evaluate('() => app.settings.lastBackupAt > Date.now() - 60000'), 'it counts as a backup')
    settings(p)
    c.ok('today' in p.evaluate('() => document.getElementById("backup-status").textContent'), 'the status says today')
    c.eq(p.errors, [], 'no page errors')

# ---------------------------------------------------------------- check a file / restore a file
with page() as p:
    seed(p, 5)
    p.evaluate(STUB)
    with p.expect_download() as d:
        settings(p)
        p.evaluate('() => document.getElementById("pt-bk-dl").click()')
    good = open(d.value.path(), 'rb').read()
    # the phone moves on: two more workouts
    seed(p, 2)
    p.evaluate('() => { app.sessions.push({ id: "n1", date: PT.ds(), ts: Date.now(), name: "Day", ex: [], vol: 1, sets: 1, unit: "lb", prs: [] }); app.saveSessions(); }')
    p.evaluate(STUB)
    settings(p)
    p.set_input_files('#pt-bk-check', {'name': 'b.json', 'mimeType': 'application/json', 'buffer': good})
    p.wait_for_timeout(500)
    msg = p.evaluate('() => window.__alerts.join("|||")')
    c.ok('complete PulseTrack backup' in msg, 'a good file is called complete')
    c.ok('In the file: 5 workouts' in msg and 'On this phone: 8 workouts' in msg, 'it shows both counts')
    c.ok('This phone has 3 workouts more than the file' in msg, 'and says the phone is ahead')
    c.ok('Nothing was changed' in msg, 'it changes nothing')
    c.eq(p.evaluate('() => app.sessions.length'), 8, 'the phone still has all its workouts')
    # a damaged file
    bad = json.loads(good); bad['keys']['pulsetrack_sessions_v1'] = bad['keys']['pulsetrack_sessions_v1'][:40]
    p.evaluate(STUB)
    p.set_input_files('#pt-bk-check', {'name': 'bad.json', 'mimeType': 'application/json', 'buffer': json.dumps(bad).encode()})
    p.wait_for_timeout(500)
    c.ok('damaged' in p.evaluate('() => window.__alerts.join("|||")'), 'a cut-off file is called damaged')
    # not a backup at all
    p.evaluate(STUB)
    p.set_input_files('#pt-bk-check', {'name': 'x.json', 'mimeType': 'application/json', 'buffer': b'{"hello": 1}'})
    p.wait_for_timeout(400)
    c.ok("isn't a PulseTrack backup" in p.evaluate('() => window.__alerts.join("|||")'), 'another file is refused')
    p.evaluate(STUB)
    p.set_input_files('#pt-bk-check', {'name': 'y.json', 'mimeType': 'application/json', 'buffer': b'not json'})
    p.wait_for_timeout(400)
    c.ok('valid PulseTrack backup' in p.evaluate('() => window.__alerts.join("|||")'), 'text that is not JSON is refused')
    # restore: warns, makes a safety copy, replaces
    p.evaluate(STUB)
    n0 = p.evaluate('async () => (await PT.safety.list()).length')
    p.set_input_files('#input-import-backup', {'name': 'b.json', 'mimeType': 'application/json', 'buffer': good})
    p.wait_for_timeout(900)
    cm = p.evaluate('() => window.__confirms.join("|||")')
    c.ok('In the file: 5 workouts' in cm and 'On this phone now: 8 workouts' in cm, 'the restore question shows both counts')
    c.ok('⚠ This phone has 3 workouts more than the file' in cm, 'and warns that newer workouts would be lost')
    c.eq(p.evaluate('async () => (await PT.safety.list()).length') - n0, 1, 'a safety copy of the phone was made first')
    c.eq(p.evaluate('async () => (await PT.safety.list())[0].workouts'), 8, 'with the 8 workouts that were there')
    c.eq(p.evaluate('() => !!window.__reloaded'), True, 'then the app reloads')
    c.eq(json.loads(p.evaluate('() => localStorage.getItem("pulsetrack_sessions_v1")')).__len__(), 5, 'and the phone now has the 5 workouts of the file')
    c.eq(p.errors, [], 'no page errors')

# ---------------------------------------------------------------- reminders
with page() as p:
    seed(p)
    due = lambda: p.evaluate('() => PT.backup.due()')
    ago = lambda d: p.evaluate('(d) => { app.settings.lastBackupAt = Date.now() - d * 86400000; app.settings.backupSnoozeUntil = 0; }', d)
    c.eq(due(), True, 'no backup yet and workouts saved: due')
    ago(2); p.evaluate('() => { app.settings.backupEvery = 3; }')
    c.eq(due(), False, 'every 3 days: not due after 2 days')
    ago(4)
    c.eq(due(), True, 'every 3 days: due after 4 days')
    p.evaluate('() => { app.settings.backupEvery = 14; }')
    c.eq(due(), False, 'every 2 weeks: not due after 4 days')
    ago(20)
    c.eq(due(), True, 'every 2 weeks: due after 20 days')
    p.evaluate('() => { app.settings.backupEvery = 0; }')
    c.eq(due(), False, 'never: never due')
    p.evaluate('() => { app.settings.backupEvery = undefined; }')
    ago(8)
    c.eq(due(), True, 'default is a week')
    # the Home banner follows it
    p.evaluate('() => { app.showView("home"); app.renderHomeBanners(); }')
    c.eq(p.evaluate('() => !!document.querySelector("[data-banner=backup]")'), True, 'the Home banner shows when due')
    p.evaluate('() => { app.settings.backupEvery = 30; app.renderHomeBanners(); }')
    c.eq(p.evaluate('() => !!document.querySelector("[data-banner=backup]")'), False, 'and goes when the interval is longer')
    # the setting itself
    settings(p)
    p.evaluate('() => { const s = document.getElementById("pt-bk-every"); s.value = "3"; s.dispatchEvent(new Event("change", { bubbles: true })); }')
    c.eq(p.evaluate('() => app.settings.backupEvery'), 3, 'the choice is saved')
    # the nudge after a workout: once a day, only when due, only if switched on
    ago(10); p.evaluate('() => { app.settings.backupEvery = 7; app.settings.backupNudgeDs = undefined; }')
    c.eq(p.evaluate('() => PT.backup.nudge(app, 99999)'), True, 'a due backup gives a reminder after a workout')
    c.eq(p.evaluate('() => PT.backup.nudge(app, 99999)'), False, 'but only once a day')
    p.evaluate('() => { app.settings.backupNudgeDs = undefined; }')
    p.evaluate('() => document.getElementById("pt-bk-after").click()')
    c.eq(p.evaluate('() => app.settings.backupAfterWorkout'), False, 'the after-workout reminder can be switched off')
    c.eq(p.evaluate('() => PT.backup.nudge(app, 99999)'), False, 'and then it stays quiet')
    c.eq(p.errors, [], 'no page errors')
c.done()
