"""3.7.0 the guide from a cloud AI service with your own key (Anthropic, OpenAI, Google): off by default (nothing is sent).
Picking it in Settings > Guide first shows the Privacy Policy's cloud section, word for word, with "I have read this and agree";
Cancel leaves it off. Keys stay in localStorage "pt-cloud-keys" (never in a backup), Forget key deletes them and turns it off.
A question goes out only on Enter / a tapped question, straight to the service, with the same instructions and facts as Ollama,
and every such answer shows "What was sent" (without the key). Pain, injury, medicine and dose questions are never sent. Errors
fall back to the phone's answer with the reason. If the policy section changes, the option is off until agreed again.
Stand-ins replace the three services."""
import json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page

c = Checks('cloud')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KEY_A, KEY_O, KEY_G = 'sk-ant-TEST-aaaa1234', 'sk-TEST-oooo5678', 'AIzaTEST-gggg9012'
REPLY = 'The rest timer is on each exercise card: tap Rest. Defaults are in Settings > Workout > Rest Times.'
HOSTS = ('api.anthropic.com', 'api.openai.com', 'generativelanguage.googleapis.com')

# the approved section, as it is in PRIVACY.md
pv = open(os.path.join(ROOT, 'PRIVACY.md'), encoding='utf-8').read()
sec_md = pv[pv.index('- **Guide answers from a cloud AI service'):pv.index('- **Sharing, exporting and backups.**')]
plain = lambda t: re.sub(r'\s+', ' ', re.sub(r'\*\*|^\s*- ', '', t, flags=re.M)).strip()

with page() as p:
    sent, mode = [], {'v': 'ok'}
    def handle(route):
        req = route.request
        cors = {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'GET, POST'}
        if req.method == 'OPTIONS': route.fulfill(status=204, headers=cors); return
        body = json.loads(req.post_data or '{}')
        sent.append({'url': req.url, 'headers': req.headers, 'body': body})
        J = lambda st, o: route.fulfill(status=st, content_type='application/json', headers=cors, body=json.dumps(o))
        if mode['v'] == 'down': route.abort('connectionrefused'); return
        if mode['v'] == 'badkey':
            if 'googleapis' in req.url: return J(400, {'error': {'code': 400, 'message': 'API key not valid. Please pass a valid API key.', 'status': 'INVALID_ARGUMENT'}})
            return J(401, {'error': {'type': 'authentication_error', 'message': 'invalid x-api-key'}})
        if 'api.anthropic.com' in req.url:
            return J(200, {'content': [{'type': 'thinking', 'thinking': 'secret'}, {'type': 'text', 'text': '**' + REPLY + '**'}], 'stop_reason': 'end_turn'})
        if 'api.openai.com' in req.url:
            if body.get('model') == 'gpt-4o-mini' and 'reasoning_effort' in body:
                return J(400, {'error': {'message': "Unrecognized request argument supplied: reasoning_effort", 'type': 'invalid_request_error'}})
            if body.get('model') == 'nope':
                return J(404, {'error': {'message': 'The model `nope` does not exist or you do not have access to it.'}})
            return J(200, {'choices': [{'message': {'role': 'assistant', 'content': REPLY}}]})
        if 'googleapis' in req.url:
            return J(200, {'candidates': [{'content': {'parts': [{'text': 'thinking...', 'thought': True}, {'text': REPLY}]}}]})
        route.fulfill(status=404, headers=cors, body='')
    for h in HOSTS: p.route('https://%s/**' % h, handle)
    ASK = '''async (q) => { const i = document.getElementById("pt-sq"); i.value = q; i.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })); }'''
    def ask(q, wait=900):
        p.evaluate('() => { if (!document.getElementById("pt-sq")) PT.search.open(""); }'); p.wait_for_timeout(250)
        p.evaluate(ASK, q); p.wait_for_timeout(wait)
        return p.evaluate('() => { const g = document.getElementById("pt-gans"); return g ? g.textContent.replace(/\\s+/g, " ") : ""; }')
    def settings():
        p.evaluate('() => { const f = document.getElementById("pt-find"); if (f && PT.kit) PT.kit.closeSheet(f); document.getElementById("btn-open-settings").click(); }'); p.wait_for_timeout(300)
        p.evaluate('() => { const d = document.querySelector("[data-acc=guide]"); d.open = true; }'); p.wait_for_timeout(100)
    def close_settings():
        p.evaluate('document.getElementById("btn-close-settings").click()'); p.wait_for_timeout(200)
    backup_has = lambda k: p.evaluate('(k) => { for (let i = 0; i < PTLS.length; i++) { const n = PTLS.key(i); if (n && n.startsWith("pulsetrack_") && String(PTLS.getItem(n)).includes(k)) return n; } return ""; }', k)

    # ---- off by default
    c.eq(p.evaluate('app.settings.guideBackend || "search"'), 'search', 'the guide answers on the phone by default')
    t = ask('Where do I change my rest timer?')
    c.ok('Rest timer' in t and 'What was sent' not in t, 'by default the phone answers')
    c.eq(sent, [], 'by default nothing goes to any cloud service')

    # ---- consent first
    settings()
    labels = p.evaluate('[...document.querySelectorAll("#pt-guide-box [data-gb]")].map(b => b.textContent)')
    c.eq(labels, ['On this phone', 'My computer (Ollama)', 'Cloud AI (your key)'], 'Settings > Guide has the three choices')
    p.click('[data-gb="cloud"]'); p.wait_for_timeout(300)
    sheet = p.evaluate('() => { const s = document.getElementById("pt-cloud-sheet"); return s && !s.classList.contains("hidden") ? s.querySelector(".pt-cc-text").innerText : ""; }')
    c.ok(plain(sheet) == plain(sec_md), 'picking it shows the Privacy Policy section, word for word')
    c.ok(p.evaluate('document.querySelector("#pt-cloud-sheet .pt-cc-ok").textContent.trim()') == 'I have read this and agree', 'with "I have read this and agree"')
    c.ok(p.evaluate('document.getElementById("pt-cc-go").disabled'), 'Turn on is off until the box is ticked')
    c.ok(p.evaluate('!!document.querySelector("#pt-cloud-sheet .pt-cc-text ul ul")'), 'the list inside the section keeps its shape')
    p.click('#pt-cloud-sheet .pt-cc-no'); p.wait_for_timeout(250)
    c.ok(p.evaluate('(app.settings.guideBackend || "search") === "search" && !localStorage.getItem("pt-cloud-ok")'), 'Cancel leaves it off and saves nothing')
    c.ok(p.evaluate('!!document.querySelector("#pt-guide-box [data-gb=search][aria-pressed=true]")'), 'and On this phone stays picked')
    p.click('[data-gb="cloud"]'); p.wait_for_timeout(300)
    p.check('#pt-cc-check'); p.click('#pt-cc-go'); p.wait_for_timeout(300)
    c.eq(p.evaluate('app.settings.guideBackend'), 'cloud', 'agreeing turns it on')
    c.ok(p.evaluate('(() => { const o = JSON.parse(localStorage.getItem("pt-cloud-ok")); return o.h === PT.guideCloud.fingerprint() && !!o.at; })()'), 'the agreement is kept with a fingerprint of the text')
    c.ok(p.evaluate('!!document.querySelector("#pt-gcl [data-gcp=anthropic][aria-pressed=true]")') and p.evaluate('document.getElementById("pt-gcl-model").value') == 'claude-haiku-5-5', 'Anthropic first, with claude-haiku-5-5')
    c.ok(p.evaluate('!document.querySelector("[data-gcl=forget]")') and 'platform.claude.com/settings/keys' in p.evaluate('document.getElementById("pt-gcl-has").textContent'), 'no key yet: it says where to make one')
    c.eq(sent, [], 'turning it on sends nothing')

    # ---- a key, kept out of backups
    p.fill('#pt-gcl-key', '  ' + KEY_A + ' '); p.dispatch_event('#pt-gcl-key', 'change'); p.wait_for_timeout(150)
    c.eq(p.evaluate('JSON.parse(localStorage.getItem("pt-cloud-keys"))'), {'anthropic': KEY_A}, 'the key is saved on the phone')
    c.ok('ending in 1234' in p.evaluate('document.getElementById("pt-gcl-has").textContent') and p.evaluate('document.getElementById("pt-gcl-key").value') == '', 'it shows only the last 4 characters')
    c.eq(backup_has(KEY_A), '', 'the key is in nothing a backup holds')
    c.eq(sent, [], 'saving the key sends nothing')
    close_settings()

    # ---- an answer from Anthropic
    p.evaluate('() => PT.search.open("")'); p.wait_for_timeout(250)
    p.fill('#pt-sq', 'Where do I change my rest timer?'); p.wait_for_timeout(600)
    c.eq(sent, [], 'typing sends nothing')
    t = ask('Where do I change my rest timer?')
    c.eq(len(sent), 1, 'Enter sends one request')
    if sent:
        r = sent[0]; h = r['headers']; b = r['body']
        c.ok(r['url'] == 'https://api.anthropic.com/v1/messages', 'straight to Anthropic')
        c.ok(h.get('x-api-key') == KEY_A and h.get('anthropic-version') == '2023-06-01' and h.get('anthropic-dangerous-direct-browser-access') == 'true', 'with the key and the browser header')
        c.ok(b['model'] == 'claude-haiku-5-5' and b.get('output_config') == {'effort': 'low'} and 'PulseTrack' in b['system'], 'the model, low effort, the guide instructions')
        u = b['messages'][0]['content']
        c.ok('Question: Where do I change my rest timer?' in u and 'Best match in the app: Rest timer.' in u, 'the question and the facts')
        c.ok(b['system'] == p.evaluate('PT.guideOllama.SYSTEM'), 'the same instructions for everyone')
    c.ok(REPLY in t and '**' not in t and 'secret' not in t, 'the answer is the text, without thinking or formatting')
    c.ok('Take me there' in t and 'Written by claude-haiku-5-5 (Anthropic) with your key' in t, 'it keeps Take me there and says who wrote it')
    ws = p.evaluate('document.querySelector("#pt-gans .pt-ga-sent pre").textContent')
    c.ok('Question: Where do I change my rest timer?' in ws and 'Instructions:' in ws and KEY_A not in ws and 'To Anthropic, model claude-haiku-5-5.' in ws, 'What was sent shows the exact text, never the key')
    c.ok(sent and sent[0]['body']['messages'][0]['content'] in ws, 'and it is exactly what went out')

    # ---- never sent
    sent.clear()
    t = ask('My shoulder hurts, how much ibuprofen should I take?')
    c.eq(sent, [], 'a pain or medicine question is never sent')
    c.ok('doctor' in t and 'What was sent' not in t, 'the phone answers it')

    # ---- OpenAI
    settings()
    p.click('#pt-gcl [data-gcp="openai"]'); p.wait_for_timeout(150)
    c.ok(p.evaluate('document.getElementById("pt-gcl-model").value') == 'gpt-5-mini', 'OpenAI starts with gpt-5-mini')
    p.fill('#pt-gcl-key', KEY_O); p.dispatch_event('#pt-gcl-key', 'change'); p.wait_for_timeout(150)
    c.eq(p.evaluate('JSON.parse(localStorage.getItem("pt-cloud-keys"))'), {'anthropic': KEY_A, 'openai': KEY_O}, 'each service keeps its own key')
    close_settings(); sent.clear()
    t = ask('Where do I change my rest timer?')
    if sent:
        r = sent[0]
        c.ok(r['url'] == 'https://api.openai.com/v1/chat/completions' and r['headers'].get('authorization') == 'Bearer ' + KEY_O, 'straight to OpenAI with that key')
        c.ok(r['body']['model'] == 'gpt-5-mini' and r['body']['messages'][0]['role'] == 'system' and 'Question:' in r['body']['messages'][1]['content'], 'the model, instructions and question')
    c.ok(REPLY in t and 'Written by gpt-5-mini (OpenAI)' in t, 'OpenAI\'s answer')
    p.evaluate('() => { app.settings.guideCloud.models.openai = "gpt-4o-mini"; }'); sent.clear()
    t = ask('Where do I change my rest timer?', 1200)
    c.ok(len(sent) == 2 and 'reasoning_effort' not in sent[1]['body'] and REPLY in t, 'a model without reasoning effort is asked again without it')
    p.evaluate('() => { app.settings.guideCloud.models.openai = "nope"; }'); sent.clear()
    t = ask('Where do I change my rest timer?')
    c.ok("OpenAI didn't answer (it has no model called nope" in t and 'Rest timer' in t and 'What was sent' in t, 'a wrong model: the phone answers, says why, shows what was sent')
    p.evaluate('() => { app.settings.guideCloud.models.openai = "gpt-5-mini"; }')

    # ---- Google
    p.evaluate('() => { app.settings.guideCloud.provider = "google"; }')
    sent.clear(); t = ask('Where do I change my rest timer?')
    c.ok("Google didn't answer (no API key is saved" in t and sent == [], 'no Google key yet: nothing sent, the phone says why')
    p.evaluate('(k) => { const o = JSON.parse(localStorage.getItem("pt-cloud-keys")); o.google = k; localStorage.setItem("pt-cloud-keys", JSON.stringify(o)); }', KEY_G)
    sent.clear(); t = ask('Where do I change my rest timer?')
    if sent:
        r = sent[0]
        c.ok(r['url'] == 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent' and r['headers'].get('x-goog-api-key') == KEY_G, 'straight to Google with that key')
        c.ok('Question:' in r['body']['contents'][0]['parts'][0]['text'] and 'PulseTrack' in r['body']['systemInstruction']['parts'][0]['text'], 'the question and the instructions')
        c.ok('key=' not in r['url'], 'the key is never in the address')
    c.ok(REPLY in t and 'thinking...' not in t and 'Written by gemini-3.5-flash-lite (Google)' in t, 'Google\'s answer, without its thinking')

    # ---- failures fall back to the phone
    mode['v'] = 'badkey'; t = ask('Where do I change my rest timer?')
    c.ok("Google didn't answer (it refused the API key), so this answer is from the phone." in t and 'Take me there' in t, 'a refused key: the phone answers and says why')
    mode['v'] = 'down'; t = ask('Where do I change my rest timer?')
    c.ok("couldn't reach it" in t and 'Rest timer' in t, 'no connection: the phone answers')
    mode['v'] = 'ok'
    r = p.evaluate('async () => { const b = PT.guide.backends.cloud, o = b.ask; b.ask = () => new Promise(() => {}); const x = await Promise.race([PT.guide.answer("Where is the rest timer?", null, { local: true }), new Promise(r => setTimeout(() => r(null), 3000))]); b.ask = o; return x && x.backend; }')
    c.eq(r, 'search', 'the on-phone path never waits for the cloud')

    # ---- a changed policy section turns it off until agreed again
    p.evaluate('() => { const o = JSON.parse(localStorage.getItem("pt-cloud-ok")); o.h = "older-text"; localStorage.setItem("pt-cloud-ok", JSON.stringify(o)); }')
    sent.clear(); t = ask('Where do I change my rest timer?')
    c.ok(sent == [] and 'Cloud answers are off until you read and agree' in t and p.evaluate('app.settings.guideBackend') == 'search', 'a changed section: nothing sent, switched off, it says why')
    settings()
    p.click('[data-gb="cloud"]'); p.wait_for_timeout(300)
    c.ok(p.evaluate('!document.getElementById("pt-cloud-sheet").classList.contains("hidden")'), 'turning it back on asks again')
    p.check('#pt-cc-check'); p.click('#pt-cc-go'); p.wait_for_timeout(300)
    c.eq(p.evaluate('app.settings.guideBackend'), 'cloud', 'and agreeing turns it on again')
    p.click('#pt-gcl [data-gcl="policy"]'); p.wait_for_timeout(250)
    c.ok(p.evaluate('!document.getElementById("pt-cloud-sheet").classList.contains("hidden") && !document.getElementById("pt-cc-check")'), 'What is sent shows the section again to read')
    p.evaluate('() => PT.kit.closeSheet(document.getElementById("pt-cloud-sheet"))'); p.wait_for_timeout(150)

    # ---- design rules
    p.evaluate('() => { const h = document.querySelector("#pt-gcl .pt-gol-help"); if (h) h.open = true; }'); p.wait_for_timeout(100)
    AUD = open(os.path.join(ROOT, 'tests', 'fixtures', 'design_audit.js'), encoding='utf-8').read()
    aud = p.evaluate(AUD)
    c.eq({k: aud['samples'][k][:3] for k, v in aud['counts'].items() if v}, {}, 'the cloud settings pass the design audit')
    c.ok(p.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'no sideways scroll')

    # ---- Forget key
    p.click('#pt-gcl [data-gcl="forget"]'); p.wait_for_timeout(250)
    c.ok(p.evaluate('localStorage.getItem("pt-cloud-keys") === null && app.settings.guideBackend === "search"'), 'Forget key deletes every key and turns it off')
    close_settings(); sent.clear()
    t = ask('Where do I change my rest timer?')
    c.ok(sent == [] and 'Rest timer' in t and 'What was sent' not in t, 'after Forget key nothing is sent')

    # ---- the Privacy Policy sheet shows the new section properly
    p.evaluate('() => PT.legal.show(true)'); p.wait_for_timeout(300)
    c.ok(p.evaluate('[...document.querySelectorAll("#pt-legal li")].some(li => li.textContent.includes("Guide answers from a cloud AI service") && li.querySelector("ul ul"))'), 'the Privacy Policy shows the cloud section with its lists')
    p.evaluate('() => { const s = document.getElementById("pt-legal"); if (s) s.querySelector("#pt-legal-go").click(); }'); p.wait_for_timeout(200)

    c.eq([e for e in p.errors if 'Failed to load resource' not in e], [], 'no errors (the network failures the test causes on purpose aside)')

# the consent sheet at 360px
with page(360, 760) as p:
    p.evaluate('() => { document.getElementById("btn-open-settings").click(); }'); p.wait_for_timeout(300)
    p.evaluate('() => { document.querySelector("[data-acc=guide]").open = true; }')
    p.click('[data-gb="cloud"]'); p.wait_for_timeout(300)
    aud = p.evaluate(open(os.path.join(ROOT, 'tests', 'fixtures', 'design_audit.js'), encoding='utf-8').read())
    c.eq({k: aud['samples'][k][:3] for k, v in aud['counts'].items() if v}, {}, '360px: the consent sheet passes the design audit')
    c.ok(p.evaluate('document.documentElement.scrollWidth <= innerWidth'), '360px: no sideways scroll')
    c.eq(p.errors, [], '360px: no errors')

sys.exit(c.done())
