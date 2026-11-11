"""Live family board (2.89.0): one shared family code, scrambled messages through a public relay (ntfy.sh, faked here), updates that arrive
on their own, and nothing at all when it is off or the phone is offline.

The real relay cannot be reached from the test machine, so every request to https://ntfy.sh/ is answered by FakeRelay below, which follows
the documented behaviour: POST /<topic> stores a message, GET /<topic>/json?poll=1&since=all|<unix time> lists newline separated JSON.
A request that needs a CORS preflight (extra headers, JSON body type) is refused, so the test also proves the app only makes simple requests."""
import contextlib, json, os, random, string, sys, time
from urllib.parse import urlparse, parse_qs
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, server
from playwright.sync_api import sync_playwright

c = Checks('live')


class FakeRelay:
    def __init__(self):
        self.topics, self.log, self.down = {}, [], False

    def handle(self, route):
        req = route.request
        u = urlparse(req.url)
        self.log.append((req.method, u.path, u.query))
        cors = {'access-control-allow-origin': '*'}
        if self.down:
            return route.abort('internetdisconnected')
        if req.method == 'OPTIONS':
            return route.fulfill(status=404, headers=cors, body='no preflight here')
        parts = [x for x in u.path.split('/') if x]
        topic = parts[0] if parts else ''
        if req.method == 'POST':
            msg = {'id': ''.join(random.choices(string.ascii_letters + string.digits, k=12)), 'time': int(time.time()), 'event': 'message', 'topic': topic, 'message': req.post_data or ''}
            self.topics.setdefault(topic, []).append(msg)
            return route.fulfill(status=200, headers=dict(cors, **{'content-type': 'application/json'}), body=json.dumps(msg))
        if req.method == 'GET' and len(parts) == 2 and parts[1] == 'json':
            since = parse_qs(u.query).get('since', ['all'])[0]
            msgs = self.topics.get(topic, [])
            if since != 'all':
                msgs = [m for m in msgs if m['time'] >= int(since)]
            return route.fulfill(status=200, headers=dict(cors, **{'content-type': 'application/x-ndjson'}), body=''.join(json.dumps(m) + '\n' for m in msgs))
        return route.fulfill(status=404, headers=cors, body='')

    def posts(self):
        return [x for x in self.log if x[0] == 'POST']

    def gets(self):
        return [x for x in self.log if x[0] == 'GET']

    def all_text(self):
        return json.dumps(self.topics) + json.dumps(self.log)


NOISE = ('Failed to load resource', 'net::ERR')


@contextlib.contextmanager
def phones(n, relay, w=390, h=844):
    """n separate phones (each its own storage), all talking to the same fake relay"""
    with server() as url, sync_playwright() as pw:
        b = pw.chromium.launch()
        out = []
        for _ in range(n):
            ctx = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=1)
            ctx.add_init_script("try { navigator.canShare = undefined; navigator.share = undefined; } catch (e) {}")
            ctx.route('https://ntfy.sh/**', relay.handle)
            p = ctx.new_page()
            p.errors = []
            p.on('pageerror', lambda e, p=p: p.errors.append('pageerror: %s' % e))
            p.on('console', lambda m, p=p: p.errors.append('console.error: %s' % m.text) if m.type == 'error' and not any(x in m.text for x in NOISE) else None)
            p.goto(url)
            p.wait_for_function('typeof PT !== "undefined" && window.app && window.app.data && window.app.data.programs && window.app.data.programs.length')
            out.append(p)
        yield out
        b.close()


SETUP = '''(name) => {
  PT.confirm = async () => true; PT.alert = async () => {};
  app.settings.myName = name; app.settings.fam2 = {}; app.sessions.length = 0;
  window.__t = []; app.toast = m => { window.__t.push(String(m)); };
  window.__k = 0;   // every call is a new day (today, yesterday, ...), so every call really changes the update
  window.addToday = () => { const t = Date.now() - (window.__k++) * 86400000; app.sessions.push({ id: "s" + t + Math.random(), date: PT.ds(new Date(t)), ts: t, name: "Day", ex: [], vol: 1000, sets: 3, unit: "lb", prs: [], dur: 3000 }); };
}'''
BOARD = '() => { app.showView("progress"); app._progTab = "social"; app.renderProgressView(); const d = document.getElementById("pt-pg-fam"); if (d) d.open = true; }'
WAIT_OK = 'PT.live.status().ok > 0'
# waits for a round that is already running (the start-up look, the timer), then makes its own
SYNC = '''async () => { for (let i = 0; i < 200 && PT.live.status().busy; i++) await new Promise(r => setTimeout(r, 20)); return PT.live.sync(app, { force: true }); }'''
SYNC_PLAIN = '''async () => { for (let i = 0; i < 200 && PT.live.status().busy; i++) await new Promise(r => setTimeout(r, 20)); return PT.live.sync(app); }'''
FAM = '() => Object.keys(app.settings.fam2 || {}).sort()'

# ============================================================== the code and the scrambling (no network)
relay = FakeRelay()
with phones(1, relay) as (p,):
    p.evaluate(SETUP, 'Ilhaan')
    codes = [p.evaluate('() => PT.live.newCode()') for _ in range(40)]
    c.ok(all(len(x) == 16 for x in codes), 'a family code is 16 characters')
    c.ok(all(all(ch in 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' for ch in x) for x in codes), 'made only of letters and numbers that cannot be mixed up (no 0 O 1 I)')
    c.eq(len(set(codes)), 40, 'and every one is different')
    code = codes[0]
    dashed = '-'.join(code[i:i + 4] for i in range(0, 16, 4))
    parse = lambda t: p.evaluate('(t) => PT.live.parseCode(t)', t)
    c.eq(parse(dashed), code, 'a code with dashes is understood')
    c.eq(parse(dashed.lower()), code, 'in small letters too')
    c.eq(parse(' ' + dashed.replace('-', ' ') + ' '), code, 'with spaces instead of dashes')
    c.eq(parse(code), code, 'or typed in one go')
    c.eq(parse('Join my PulseTrack family board 💪 In PulseTrack open Progress > Social > Family board and tap "Join with a code". Code: ' + dashed), code, 'a whole message from the chat: the code is found in it')
    c.eq(parse('JOIN WITH CODE FROM ' + dashed), code, 'even when ordinary words of four letters come first')
    c.eq(parse(dashed[:-1]), '', 'a code that is one character short is refused')
    c.eq(parse('hello there'), '', 'words are not a code')
    c.eq(parse(dashed.replace(code[0], '0', 1)), '', 'a 0 or O (which a code never has) is refused')
    c.eq(parse(''), '', 'an empty box is refused')

    r = p.evaluate('''async (code) => {
      const a = await PT.live.derive(code), b = await PT.live.derive(code), o = await PT.live.derive("ABCD-EFGH-JKLM-NPQR".replace(/-/g, ""));
      const x = await PT.live.encrypt(a.key, "PTF2.hello 💪 Sam"), y = await PT.live.encrypt(a.key, "PTF2.hello 💪 Sam");
      const back = await PT.live.decrypt(a.key, x), other = await PT.live.decrypt(o.key, x);
      const flip = x.slice(0, -3) + (x.slice(-3) === "AAA" ? "BBB" : "AAA");
      return { topic: a.topic, same: a.topic === b.topic, other: o.topic !== a.topic, x, differ: x !== y, back, otherKey: other,
        tamper: await PT.live.decrypt(a.key, flip), junk: await PT.live.decrypt(a.key, "PTL1.abcd"), plain: await PT.live.decrypt(a.key, "PTF2.abc"), empty: await PT.live.decrypt(a.key, "") };
    }''', code)
    c.ok(r['topic'].startswith('pt-') and len(r['topic']) == 35, 'the mailbox name is "pt-" and 32 hex characters')
    c.ok(code not in r['topic'] and code.lower() not in r['topic'], 'and the code is not in it')
    c.ok(r['same'] and r['other'], 'the same code gives the same mailbox, another code a different one')
    c.eq(r['back'], 'PTF2.hello 💪 Sam', 'a message comes back the same after scrambling and unscrambling')
    c.ok(r['x'].startswith('PTL1.') and 'hello' not in r['x'] and 'Sam' not in r['x'], 'the scrambled text shows nothing')
    c.ok(r['differ'], 'sending the same text twice gives different scrambles')
    c.eq(r['otherKey'], None, 'another family\'s key cannot read it')
    c.eq([r['tamper'], r['junk'], r['plain'], r['empty']], [None, None, None, None], 'a changed, broken, unscrambled or empty message is refused, not an error')
    c.eq(p.errors, [], 'no page errors')

# ============================================================== it is off until somebody starts or joins
relay = FakeRelay()
with phones(1, relay) as (p,):
    p.evaluate(SETUP, 'Ilhaan')
    p.evaluate('() => { addToday(); }')
    p.wait_for_timeout(3600)   # longer than the start-up check
    p.evaluate(BOARD)
    p.wait_for_timeout(400)
    c.eq(relay.log, [], 'off by default: nothing is sent or asked for, ever')
    c.eq(p.evaluate('() => PT.live.isOn()'), False, 'not on')
    c.ok(p.evaluate('() => !!document.querySelector("#pt-pg-fam #pt-live-card #pt-live-start")'), 'the board offers Start a board')
    c.ok(p.evaluate('() => !!document.querySelector("#pt-pg-fam #pt-live-card #pt-live-join")'), 'and Join with a code')
    c.ok(p.evaluate('() => document.querySelector("#pt-live-card").getBoundingClientRect().top < document.querySelector("#pt-f2-send").getBoundingClientRect().top'), 'the card sits above the paste-a-code box')
    c.ok(p.evaluate('() => document.documentElement.scrollWidth <= window.innerWidth + 1'), 'no sideways scroll on a phone')
    c.eq(p.errors, [], 'no page errors')

# ============================================================== start, join, update on their own
relay = FakeRelay()
with phones(3, relay) as (A, B, C):
    A.evaluate(SETUP, 'Ilhaan'); B.evaluate(SETUP, 'Sam'); C.evaluate(SETUP, 'Stranger')
    A.evaluate('() => { addToday(); addToday(); }')
    B.evaluate('() => { addToday(); }')

    # ---- A starts a board
    A.evaluate(BOARD)
    A.click('#pt-live-start')
    A.wait_for_function('PT.live.isOn()')
    code = A.evaluate('() => app.settings.live.code')
    c.ok(A.evaluate('(c) => PT.live.valid(c)', code), 'starting makes a valid family code')
    A.wait_for_selector('#pt-live-codebox')
    shown = A.inner_text('#pt-live-codebox')
    c.eq(shown, '-'.join(code[i:i + 4] for i in range(0, 16, 4)), 'and shows it in groups of four to send to the family')
    c.ok(A.evaluate('() => !!document.querySelector("#pt-live-share") && !!document.querySelector("#pt-live-copy")'), 'with a Send and a Copy button')
    c.ok(A.evaluate('() => document.documentElement.scrollWidth <= window.innerWidth + 1'), 'the code sheet fits a phone')
    A.click('[data-live-close]')
    A.wait_for_function(WAIT_OK)
    c.eq(len(relay.posts()), 1, 'A sent its own update once')
    c.eq(len(relay.topics), 1, 'into one mailbox')
    topic = list(relay.topics)[0]
    c.ok(topic.startswith('pt-') and code not in topic, 'named from the code but not containing it')
    c.eq(relay.gets()[0][2].split('since=')[1], 'all', 'the first look at the mailbox asks for everything it still holds')
    A.wait_for_selector('#pt-live-st')
    c.ok('Live' in A.inner_text('#pt-live-st'), 'the card says Live')
    c.eq(A.evaluate('() => app.settings.live.code'), code, 'the code is kept')

    # ---- what the relay can see
    wire = relay.all_text()
    c.ok(all(x not in wire for x in ['Ilhaan', 'PTF2', code, 'bench', '"lv"']), 'the relay sees no name, no update text and not the code')
    c.ok(relay.topics[topic][0]['message'].startswith('PTL1.'), 'only scrambled messages')
    c.ok(len(relay.topics[topic][0]['message']) < 1200, 'and small ones (the relay allows 4096)')
    c.ok(all(x[0] in ('POST', 'GET') for x in relay.log), 'only plain POST and GET requests, no preflight needed')

    # ---- B joins by typing the code
    B.evaluate(BOARD)
    B.evaluate('() => { PT.prompt = async () => null; }')
    B.evaluate('() => { PT.prompt = async () => "nope"; }')
    B.click('#pt-live-join')
    B.wait_for_timeout(300)
    c.eq(B.evaluate('() => PT.live.isOn()'), False, 'a wrong code does not join')
    c.ok(any("doesn't look right" in t for t in B.evaluate('() => window.__t')), 'and says so')
    B.evaluate('(c) => { PT.prompt = async () => c.toLowerCase().replace(/(.{4})(?=.)/g, "$1 "); }', code)
    B.click('#pt-live-join')
    B.wait_for_function(WAIT_OK)
    c.eq(B.evaluate('() => app.settings.live.code'), code, 'typing the same code (in small letters, with spaces) joins the board')
    c.eq(B.evaluate(FAM), ['Ilhaan'], 'B sees A on the board straight away')
    c.ok(any('Ilhaan' in t for t in B.evaluate('() => window.__t')), 'and is told who it found')
    row = B.evaluate('() => app.settings.fam2.Ilhaan')
    c.eq(sum(w['d'] for w in row['wk'].values()), 2, "A's two days of training came across")
    c.eq(len(relay.posts()), 2, 'B sent its own update too')
    c.eq(len(relay.topics), 1, 'both in the same mailbox')

    # ---- A sees B without doing anything but opening the board
    A.evaluate(SYNC_PLAIN)
    c.eq(A.evaluate(FAM), ['Sam'], 'A gets B on the next look')
    c.ok('since=all' not in relay.gets()[-1][2], 'later looks only ask for what is new')
    A.evaluate(BOARD)
    A.wait_for_selector('#pt-pg-fam')
    c.ok('Sam' in A.inner_text('#pt-pg-fam'), 'and Sam is on the board')
    c.ok('Ilhaan' in A.inner_text('#pt-pg-fam'), 'next to Ilhaan')
    c.eq(A.evaluate('() => document.querySelector("#pt-pg-fam #pt-f2-send").closest(".pt-f2box").querySelector(".pt-f2h").textContent'), 'Or send by message', 'the paste-a-code box is now the backup')

    # ---- an update arrives while the board is open, and nothing has to be tapped
    n_before = len(relay.posts())
    B.evaluate('() => { addToday(); }')
    B.evaluate(SYNC)
    c.eq(len(relay.posts()), n_before + 1, 'B sends again after a workout changed its numbers')
    A.evaluate(BOARD)
    A.evaluate(SYNC_PLAIN)
    A.wait_for_function('() => PT.live.status().ok > 0')
    A.wait_for_timeout(400)
    c.eq(A.evaluate('() => Object.values(app.settings.fam2.Sam.wk).reduce((n, w) => n + w.d, 0)'), 2, 'the new numbers are there (Sam has trained two days now)')
    # nothing changed -> nothing is sent again
    n_before = len(relay.posts())
    B.evaluate(SYNC_PLAIN)
    B.evaluate(SYNC_PLAIN)
    c.eq(len(relay.posts()), n_before, 'with nothing new, a phone does not send again')

    # ---- the board redraws itself when it is on screen
    A.evaluate(BOARD)
    A.wait_for_selector('#pt-live-st')
    shot = A.inner_html('#pt-pg-fam')
    B.evaluate('() => { addToday(); }')
    B.evaluate(SYNC)
    A.evaluate(SYNC_PLAIN)
    A.wait_for_timeout(500)
    c.ok(A.inner_html('#pt-pg-fam') != shot, 'the board on screen redrew by itself with the new numbers (nobody tapped anything)')
    c.ok(A.evaluate('() => !!document.querySelector("#pt-live-card #pt-live-st")'), 'the live line is still on the board after it redrew')
    c.eq(A.evaluate('() => document.querySelectorAll("#pt-live-card").length'), 1, 'and there is only one card')
    c.ok(A.evaluate('() => document.getElementById("pt-pg-fam").open'), 'the section stayed open')

    # ---- the code can be shown again, and a stranger with another code sees nobody
    A.click('#pt-live-code')
    A.wait_for_selector('#pt-live-codebox')
    c.eq(A.inner_text('#pt-live-codebox').replace('-', ''), code, 'Family code shows the code again')
    A.click('[data-live-close]')
    C.evaluate(BOARD)
    other = C.evaluate('() => PT.live.newCode()')
    C.evaluate('(c) => { PT.prompt = async () => c; }', other)
    C.click('#pt-live-join')
    C.wait_for_function(WAIT_OK)
    c.eq(C.evaluate(FAM), [], 'another code is another mailbox: C sees none of them')
    c.eq(len(relay.topics), 2, 'two mailboxes')
    # rubbish in A's mailbox: another family\'s key, plain text, junk, and a forged update with a harmful name
    forged = C.evaluate('''async (code) => {
      const d = await PT.live.derive(code), tok = (n) => "PTF2." + btoa(unescape(encodeURIComponent(JSON.stringify({ v: 2, n, t: Date.now(), lv: 9, b: 1, st: 1, l: {}, wk: [] }))));
      const mine = await PT.live.derive(app.settings.live.code);
      return [await PT.live.encrypt(d.key, tok("Intruder")), "PTF2." + btoa('{"v":2,"n":"Plain"}'), "PTL1.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", "hello",
        await PT.live.encrypt(mine.key, tok("__proto__")), await PT.live.encrypt(mine.key, "no update inside")];
    }''', other)
    for m in forged:
        relay.topics[topic].append({'id': 'x', 'time': int(time.time()), 'event': 'message', 'topic': topic, 'message': m})
    A.evaluate(SYNC_PLAIN)
    c.eq(A.evaluate(FAM), ['Sam'], 'rubbish and other families\' messages are ignored')
    c.eq(A.evaluate('() => ({}).lv === undefined && Object.getPrototypeOf(app.settings.fam2) === Object.prototype'), True, 'a forged update called __proto__ does nothing')
    c.eq(A.errors + B.errors + C.errors, [], 'no page errors')

    # ---- offline: nothing breaks, and what changed while offline goes out afterwards
    B.evaluate('() => { addToday(); }')
    relay.down = True
    r = B.evaluate(SYNC)
    c.eq(r['ok'], False, 'with the relay unreachable a look fails quietly')
    B.evaluate(BOARD)
    B.wait_for_selector('#pt-live-st')
    c.ok("Can't connect" in B.inner_text('#pt-live-st') and 'retrying' in B.inner_text('#pt-live-st'), 'the card says it cannot connect and will try again')
    c.eq(B.evaluate('() => PT.live.isOn()'), True, 'and stays on')
    n_before = len(relay.posts())
    relay.down = False
    r = B.evaluate(SYNC)
    c.eq(r['ok'], True, 'back online it works again')
    c.eq(len(relay.posts()), n_before + 1, 'and the workout done meanwhile is sent')
    B.wait_for_function('() => PT.live.status().err === ""')
    B.evaluate(BOARD)
    c.ok('Live' in B.inner_text('#pt-live-st'), 'the card is Live again')
    B.context.set_offline(True)
    c.eq(B.evaluate(SYNC)['ok'], False, 'a phone that is offline does not even try')
    B.evaluate(BOARD)
    c.ok('Offline' in B.inner_text('#pt-live-st'), 'and says Offline')
    B.context.set_offline(False)

    # ---- leaving
    A.evaluate(BOARD)
    A.click('#pt-live-leave')
    A.wait_for_function('() => !PT.live.isOn()')
    c.eq(A.evaluate('() => app.settings.live'), None, 'leaving forgets the code')
    c.eq(A.evaluate(FAM), ['Sam'], 'the people already on the board stay')
    n_before = len(relay.log)
    A.evaluate(SYNC_PLAIN)
    A.wait_for_timeout(200)
    c.eq(len(relay.log), n_before, 'and the phone no longer talks to the relay')
    c.ok(A.evaluate('() => !!document.querySelector("#pt-live-start")'), 'the card offers Start again')
    c.eq(A.errors + B.errors + C.errors, [], 'no page errors at the end')

# ============================================================== on its own: the timer, coming back to the app, the finished workout
relay = FakeRelay()
with phones(2, relay) as (A, B):
    A.evaluate(SETUP, 'Ilhaan'); B.evaluate(SETUP, 'Sam')
    A.evaluate('() => { addToday(); }'); B.evaluate('() => { addToday(); }')
    A.evaluate('() => { PT.live.start(app); }')
    A.wait_for_function(WAIT_OK)
    code = A.evaluate('() => app.settings.live.code')
    B.evaluate('(c) => { PT.live.join(app, c); }', code)
    B.wait_for_function(WAIT_OK)
    A.evaluate(BOARD)
    A.wait_for_selector('#pt-live-st')
    n0 = len(relay.gets())
    # the page's own timer notices a new message without any tap: shorten the waits by jumping the clock
    A.clock.install()
    A.reload()
    A.wait_for_function('typeof PT !== "undefined" && window.app && window.app.data && window.app.data.programs && window.app.data.programs.length')
    c.eq(A.evaluate('() => PT.live.isOn()'), True, 'the code survives a reload of the app')
    A.evaluate(BOARD)
    B.evaluate('() => { addToday(); }')
    B.evaluate(SYNC)
    before = A.evaluate('() => JSON.stringify(app.settings.fam2.Sam && app.settings.fam2.Sam.t)')
    A.clock.run_for(120000)
    A.wait_for_function('(b) => JSON.stringify(app.settings.fam2.Sam && app.settings.fam2.Sam.t) !== b', arg=before, timeout=8000)
    c.ok(True, 'A picked up Sam\'s newer update by itself after a couple of minutes, with no tap')
    c.ok(len(relay.gets()) > n0, 'by looking at the mailbox')
    # the app opened with a board already set up looks by itself
    c.ok(A.evaluate('() => PT.live.status().ok > 0'), 'it looked by itself when the app opened')
    # finishing a workout sends
    posts = len(relay.posts())
    B.evaluate('() => { addToday(); }')
    B.evaluate(SYNC_PLAIN)
    c.eq(len(relay.posts()), posts, 'a plain look does not send within the minute (a phone sends at most once a minute)')
    B.evaluate(SYNC)
    c.eq(len(relay.posts()), posts + 1, 'a forced one does')
    c.eq(A.errors + B.errors, [], 'no page errors')

# ============================================================== the relay forgets after 12 hours: the phones carry the memory
relay = FakeRelay()
with phones(3, relay) as (A, B, C):
    A.evaluate(SETUP, 'Ilhaan'); B.evaluate(SETUP, 'Sam'); C.evaluate(SETUP, 'Dad')
    A.evaluate('() => { addToday(); addToday(); }'); B.evaluate('() => { addToday(); }'); C.evaluate('() => { addToday(); }')
    A.evaluate('() => { PT.live.start(app); }')
    A.wait_for_function(WAIT_OK)
    code = A.evaluate('() => app.settings.live.code')
    B.evaluate('(c) => { PT.live.join(app, c); }', code)
    B.wait_for_function(WAIT_OK)
    topic = list(relay.topics)[0]
    A.evaluate(SYNC_PLAIN)   # A has seen Sam too
    ta = B.evaluate('() => app.settings.fam2.Ilhaan.t')
    c.eq(B.evaluate('() => Object.keys(app.settings.live.mb)'), ['ilhaan'], 'a phone remembers when it last saw each person in the mailbox')
    # 7 hours go by for B and the relay has dropped everything (it keeps messages 12 hours, and A only posted 13 hours ago)
    relay.topics[topic] = []
    B.evaluate('() => { const mb = app.settings.live.mb; Object.keys(mb).forEach(k => { mb[k] -= 7 * 3600; }); }')
    n = len(relay.posts())
    B.evaluate(SYNC_PLAIN)
    c.eq(len(relay.posts()), n + 1, 'B puts the latest it has of Ilhaan back in the mailbox (nothing recent there)')
    B.evaluate(SYNC_PLAIN)
    c.eq(len(relay.posts()), n + 1, 'and only once: the mailbox has a recent copy now')
    c.ok('Ilhaan' not in json.dumps(relay.topics) and 'PTF2' not in json.dumps(relay.topics), 'it is scrambled like everything else')
    # D joins later and sees Ilhaan although Ilhaan has not opened the app since
    C.evaluate('(c) => { PT.live.join(app, c); }', code)
    C.wait_for_function(WAIT_OK)
    c.eq(C.evaluate(FAM), ['Ilhaan'], 'a newcomer sees Ilhaan, whose own phone has been closed')
    c.eq(C.evaluate('() => app.settings.fam2.Ilhaan.t'), ta, 'with the original time stamp, so it never pretends to be newer than the real thing')
    c.eq(C.evaluate('() => app.settings.fam2.Ilhaan.lv'), B.evaluate('() => app.settings.fam2.Ilhaan.lv'), 'and the same numbers')
    # a phone that sees a new name sends its own update again, so the newcomer gets it
    A.evaluate(SYNC_PLAIN)   # A sees Dad appear (this may already have happened by itself: it is remembered until sent)
    c.ok(A.evaluate('() => app.settings.live.hello === 1 || (Date.now() - app.settings.live.pub) < 5000'), 'Ilhaan has noticed a newcomer')
    A.evaluate('() => { app.settings.live.pub -= 120000; app.settings.live.mb.sam -= 7 * 3600; }')   # a minute has passed, and Sam has been quiet in the mailbox for 7 hours
    n = len(relay.posts())
    A.evaluate(SYNC_PLAIN)
    c.eq(len(relay.posts()), n + 2, 'Ilhaan sends Ilhaan\'s update again although nothing changed, and puts Sam back (7 quiet hours)')
    c.eq(A.evaluate('() => app.settings.live.hello'), 0, 'and that is done')
    A.evaluate('() => { app.settings.live.pub -= 120000; }')
    A.evaluate(SYNC_PLAIN)
    c.eq(len(relay.posts()), n + 2, 'but not again: only a newcomer causes it')
    C.evaluate(SYNC_PLAIN)
    c.eq(sorted(C.evaluate(FAM)), ['Ilhaan', 'Sam'], 'and now Dad sees Sam too')
    # somebody who has not been seen for 50 days is not carried around any more
    B.evaluate('() => { app.settings.fam2.Ilhaan.t = Date.now() - 50 * 86400000; const mb = app.settings.live.mb; Object.keys(mb).forEach(k => { mb[k] -= 8 * 3600; }); }')
    n = len(relay.posts())
    B.evaluate(SYNC_PLAIN)
    c.eq(len(relay.posts()), n, 'an update older than 45 days is not put back')
    c.eq(A.errors + B.errors + C.errors, [], 'no page errors')

# ============================================================== light theme and a small phone
relay = FakeRelay()
with phones(1, relay, w=360, h=740) as (p,):
    p.evaluate(SETUP, 'Ilhaan')
    p.evaluate('() => { document.documentElement.dataset.mode = "light"; }')
    p.evaluate(BOARD)
    p.click('#pt-live-start')
    p.wait_for_selector('#pt-live-codebox')
    c.ok(p.evaluate('() => { const r = document.querySelector("#pt-live-codebox").getBoundingClientRect(); return r.left >= 0 && r.right <= window.innerWidth; }'), 'the code fits a 360 px wide phone in the light theme')
    c.ok(p.evaluate('() => document.documentElement.scrollWidth <= window.innerWidth + 1'), 'no sideways scroll')
    p.click('[data-live-close]')
    p.wait_for_function(WAIT_OK)
    c.ok(p.evaluate('() => document.documentElement.scrollWidth <= window.innerWidth + 1'), 'none on the board either')
    c.eq(p.errors, [], 'no page errors')

c.done()
