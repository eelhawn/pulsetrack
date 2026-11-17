"""3.6.0 the guide on your own computer (Ollama): off by default (nothing is sent), Settings > Guide turns it on with an address and a
model (Find models, Test connection with plain reasons when it fails). Answers come from Ollama's /api/chat with the question and the
on-phone facts, keep "Take me there", and are asked only on Enter / a tapped question. Pain, injury, medicine and dose questions are
never sent. Unreachable, refused, missing model or turned off: the phone's own answer, with a line saying so. A fake Ollama stands in
for the computer."""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page

c = Checks('ollama')
URL = 'http://192.168.1.50:11434'
REPLY = 'Your rest timer is per exercise: tap Rest on the exercise card. The defaults are in Settings > Workout > Rest Times.'

with page() as p:
    sent, mode = [], {'v': 'ok'}
    def handle(route):
        req = route.request
        cors = {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'content-type', 'Access-Control-Allow-Methods': 'GET, POST'}
        if req.method == 'OPTIONS': route.fulfill(status=204, headers=cors); return
        sent.append((req.url, req.post_data))
        if mode['v'] == 'down': route.abort('connectionrefused'); return
        if mode['v'] == 'origin': route.fulfill(status=403, headers=cors, body=''); return
        if req.url.endswith('/api/tags'): route.fulfill(status=200, content_type='application/json', headers=cors, body=json.dumps({'models': [{'name': 'llama3.2:latest'}, {'name': 'qwen2.5:7b'}]}))
        elif req.url.endswith('/api/chat'):
            body = json.loads(req.post_data)
            if body['model'] not in ('llama3.2:latest', 'qwen2.5:7b'): route.fulfill(status=404, content_type='application/json', headers=cors, body=json.dumps({'error': 'model not found'}))
            else: route.fulfill(status=200, content_type='application/json', headers=cors, body=json.dumps({'message': {'role': 'assistant', 'content': '**' + REPLY + '**'}}))
        else: route.fulfill(status=404, headers=cors, body='')
    p.route('http://192.168.1.50:11434/**', handle)
    ASK = '''async (q) => { const i = document.getElementById("pt-sq"); i.value = q; i.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })); }'''
    def ask(q, wait=900):
        p.evaluate('() => { if (!document.getElementById("pt-sq")) PT.search.open(""); }'); p.wait_for_timeout(250)
        p.evaluate(ASK, q); p.wait_for_timeout(wait)
        return p.evaluate('() => { const g = document.getElementById("pt-gans"); return g ? g.innerText : ""; }')

    # ---- off by default: nothing goes out
    c.eq(p.evaluate('app.settings.guideBackend || "search"'), 'search', 'the guide answers on the phone by default')
    r = p.evaluate('async () => { const r = await PT.guide.answer("can the guide use ollama on my computer?"); return r && [r.title, (r.actions || []).map(a => a.nav)]; }')
    c.ok(r and r[0] == "Where the guide's answers come from" and 'set:#pt-guide-box' in r[1], 'the guide knows where its own setting is (%s)' % (r,))
    t = ask('Where do I change my rest timer?')
    c.ok('Rest timer' in t and 'Take me there' in t and 'Ollama' not in t, 'by default the phone answers')
    c.eq(sent, [], 'by default nothing is sent to any computer')

    # ---- Settings > Guide
    p.evaluate('() => { const f = document.getElementById("pt-find"); if (f && PT.kit) PT.kit.closeSheet(f); document.getElementById("btn-open-settings").click(); }'); p.wait_for_timeout(300)
    c.ok(p.evaluate('!!document.querySelector("[data-acc=guide] #pt-guide-box [data-gb=search][aria-pressed=true]")'), 'Settings has a Guide group, "On this phone" picked')
    p.evaluate('() => document.querySelector("[data-acc=guide]").open = true')
    p.click('[data-gb="ollama"]'); p.wait_for_timeout(150)
    c.eq(p.evaluate('app.settings.guideBackend'), 'ollama', 'picking My computer (Ollama) is saved')
    help_t = p.evaluate('document.querySelector(".pt-gol-help").textContent')
    c.ok('OLLAMA_ORIGINS=' in help_t and 'OLLAMA_HOST=0.0.0.0' in help_t and 'What is sent' in help_t and 'never sent' in help_t, 'it explains the setup and exactly what is sent')
    p.click('[data-gol="test"]'); p.wait_for_timeout(200)
    c.ok('Type the address' in p.evaluate('document.getElementById("pt-gol-st").textContent'), 'Test with no address says to type one')
    p.fill('#pt-gol-url', URL + '/'); p.dispatch_event('#pt-gol-url', 'change')
    p.click('[data-gol="models"]'); p.wait_for_timeout(400)
    st = p.evaluate('document.getElementById("pt-gol-st").textContent')
    c.ok('Found 2 models' in st and 'llama3.2:latest' in st, 'Find models lists what Ollama has (%s)' % st)
    c.eq(p.evaluate('app.settings.guideOllama'), {'url': URL + '/', 'model': 'llama3.2:latest'}, 'the address and the first model are kept')
    p.click('[data-gol="test"]'); p.wait_for_timeout(400)
    c.ok('Connected to %s. llama3.2:latest is ready.' % URL in p.evaluate('document.getElementById("pt-gol-st").textContent'), 'Test connection says it is ready')
    mode['v'] = 'origin'; p.click('[data-gol="test"]'); p.wait_for_timeout(400)
    c.ok('OLLAMA_ORIGINS=' in p.evaluate('document.getElementById("pt-gol-st").textContent'), 'a refused app is told to set OLLAMA_ORIGINS')
    mode['v'] = 'down'; p.click('[data-gol="test"]'); p.wait_for_timeout(400)
    c.ok("Couldn't reach %s" % URL in p.evaluate('document.getElementById("pt-gol-st").textContent'), 'an unreachable computer is explained')
    mode['v'] = 'ok'
    p.evaluate('document.getElementById("btn-close-settings").click()'); p.wait_for_timeout(200)

    # ---- answers from Ollama, with the phone's buttons
    sent.clear()
    p.evaluate('() => { app.settings.guideBackend = "ollama"; }')
    p.evaluate('() => PT.search.open("")'); p.wait_for_timeout(250)
    p.fill('#pt-sq', 'Where do I change my rest timer?'); p.wait_for_timeout(600)
    c.eq([u for u, _ in sent], [], 'typing does not send anything; only Enter or a tapped question does')
    t = ask('Where do I change my rest timer?')
    chats = [json.loads(b) for u, b in sent if u.endswith('/api/chat')]
    c.eq(len(chats), 1, 'Enter sends one question to Ollama')
    if chats:
        m = chats[0]
        c.ok(m['model'] == 'llama3.2:latest' and m['stream'] is False and m['messages'][0]['role'] == 'system', 'it asks the picked model, not streaming, with the guide\'s instructions')
        u = m['messages'][1]['content']
        c.ok('Question: Where do I change my rest timer?' in u and 'Best match in the app: Rest timer.' in u and 'Rest Times' in u, 'with the question and the facts the phone found')
        c.ok('pain or an injury' in m['messages'][0]['content'] and 'dosing' in m['messages'][0]['content'], 'the instructions keep the safety rules')
    c.ok(REPLY in t and '**' not in t, 'the answer is Ollama\'s words (formatting stripped)')
    c.ok('Take me there' in t and 'Written by llama3.2:latest on your computer (Ollama)' in t, 'it keeps Take me there and says who wrote it')
    p.click('#pt-gans [data-gnav="0"]'); p.wait_for_timeout(600)
    c.ok(p.evaluate('!document.getElementById("modal-settings").classList.contains("hidden")'), 'Take me there still opens Settings')
    p.evaluate('document.getElementById("btn-close-settings").click()'); p.wait_for_timeout(200)

    # ---- never sent: pain, injury, medicine, doses
    sent.clear()
    t = ask('My knee hurts when I squat, what should I take?')
    c.eq([u for u, _ in sent], [], 'a pain or medicine question is never sent to the model')
    c.ok('doctor' in t and 'Ollama' not in t, 'the phone answers it: see a professional')

    # ---- it falls back to the phone
    mode['v'] = 'down'; sent.clear()
    t = ask('Where do I change my rest timer?')
    c.ok('Rest timer' in t and 'Take me there' in t and "Ollama on your computer didn't answer, so this answer is from the phone." in t, 'unreachable: the phone answers and says so')
    mode['v'] = 'ok'
    p.evaluate('() => { app.settings.guideOllama.model = "nope:1b"; }')
    t = ask('Where do I change my rest timer?')
    c.ok("didn't answer, so this answer is from the phone" in t, 'a missing model: the phone answers')
    p.evaluate('() => { app.settings.guideOllama.model = "llama3.2:latest"; }')
    r = p.evaluate('async () => { const b = PT.guide.backends.ollama, o = b.ask; b.ask = () => new Promise(() => {}); const t0 = Date.now(); const x = await Promise.race([PT.guide.answer("Where is the rest timer?", null, { local: true }), new Promise(r => setTimeout(() => r(null), 3000))]); b.ask = o; return x && x.backend; }')
    c.eq(r, 'search', 'the on-phone path never waits for the computer')

    # ---- turned off again: nothing sent
    p.evaluate('() => { const f = document.getElementById("pt-find"); if (f && PT.kit) PT.kit.closeSheet(f); document.getElementById("btn-open-settings").click(); }'); p.wait_for_timeout(300)
    p.evaluate('() => document.querySelector("[data-acc=guide]").open = true')
    p.click('[data-gb="search"]'); p.wait_for_timeout(150)
    p.evaluate('document.getElementById("btn-close-settings").click()'); p.wait_for_timeout(200)
    sent.clear()
    t = ask('Where do I change my rest timer?')
    c.ok(sent == [] and 'Rest timer' in t and 'Ollama' not in t, 'switched back to On this phone: nothing is sent')
    c.eq(p.evaluate('app.settings.guideOllama.url').rstrip('/'), URL, 'the address is kept for next time')

    # ---- design rules on the Settings box
    p.evaluate('() => { document.getElementById("btn-open-settings").click(); }'); p.wait_for_timeout(300)
    p.evaluate('() => { const d = document.querySelector("[data-acc=guide]"); d.open = true; }')
    p.click('[data-gb="ollama"]'); p.wait_for_timeout(150)
    p.evaluate('() => document.querySelector(".pt-gol-help").open = true'); p.wait_for_timeout(100)
    aud = p.evaluate(open(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'tests', 'fixtures', 'design_audit.js'), encoding='utf-8').read())
    c.eq({k: aud['samples'][k][:3] for k, v in aud['counts'].items() if v}, {}, 'the Guide settings pass the design audit')
    c.ok(p.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'no sideways scroll')
    c.eq([e for e in p.errors if 'Failed to load resource' not in e], [], 'no errors (the network failures the test causes on purpose aside)')

sys.exit(c.done())
