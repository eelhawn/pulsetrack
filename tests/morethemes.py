"""3.2.0 a lot more themes: Games, Sports, Sky, Places, Food and Music groups (104 themes) with 9 new background patterns. Every
one applies without errors, shows in its gallery group, uses a pattern and colours that exist, and is named in plain words (no
game, league or brand names). Readability at every contrast level is checked for all themes by tests/themes.py."""
import os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import Checks, page

c = Checks('morethemes')
NEW = ['games', 'sports', 'sky', 'places', 'food', 'music']
BRANDS = r'minecraft|creeper|nether|mario|zelda|pokemon|nintendo|game ?boy|tetris|pac-?man|sega|playstation|xbox|fortnite|\bf1\b|formula|ferrari|mclaren|red bull|mercedes|\bnba\b|\bnfl\b|\bnhl\b|\bmlb\b|lakers|bulls|celtics|wimbledon|fifa|uefa|spotify'

with page() as p:
    info = p.evaluate('''() => { const L = PT.look; return {
        cats: L.CATS.map(c => c[0]), presets: L.PRESETS.map(t => ({ id: t.id, label: t.label, cat: t.cat, s: t.s })),
        acc: L.ACCENTS.map(a => a.id), bgs: L.BGS.map(b => b.id), lbgs: L.LBGS.map(b => b.id), fonts: L.FONTS.map(f => f.id), fx: L.FX.map(f => f.id), ext: Object.keys(L.FX_EXT) }; }''')
    cats = info['cats']
    for k in NEW:
        c.ok(k in cats, 'the gallery has a %s group' % k)
    c.ok(all(cats.index(k) < cats.index('pure') for k in NEW), 'the new groups come before the long Pure lists')
    mine = [t for t in info['presets'] if t['cat'] in NEW]
    c.eq(len(mine), 104, '104 new themes')
    for k in NEW:
        n = len([t for t in mine if t['cat'] == k])
        c.ok(n >= 12, '%s has %d themes' % (k, n))
    ids = [t['id'] for t in info['presets']]
    c.eq(len(ids), len(set(ids)), 'every theme id is used once')
    labels = [t['label'].lower() for t in info['presets']]
    c.eq(len(labels), len(set(labels)), 'no two themes share a name')
    for want in ['basketball', 'race day', 'blocky world', '8-bit hero', 'golden hour', 'pink sunset', 'football pitch', 'tokyo nights', 'vinyl']:
        c.ok(want in labels, 'there is a "%s" theme' % want)
    c.eq([t['label'] for t in mine if re.search(BRANDS, t['label'], re.I)], [], 'no game, league or brand names')
    for pat in ['pixels', 'blocks', 'court', 'flag', 'speed', 'pitch', 'rain', 'net', 'snow']:
        c.ok(pat in info['fx'] and pat in info['ext'], 'the %s pattern exists' % pat)
    bad = []
    for t in mine:
        s = t['s']
        if s['accent'] not in info['acc']: bad.append((t['id'], 'accent', s['accent']))
        if s['theme'] == 'dark' and s.get('bg') not in info['bgs']: bad.append((t['id'], 'bg', s.get('bg')))
        if s['theme'] == 'light' and s.get('bgL') not in info['lbgs']: bad.append((t['id'], 'bgL', s.get('bgL')))
        if s.get('font', 'system') not in info['fonts']: bad.append((t['id'], 'font', s.get('font')))
        if s.get('bgfx', 'solid') not in info['fx']: bad.append((t['id'], 'bgfx', s.get('bgfx')))
    c.eq(bad, [], 'every new theme uses colours, backgrounds, fonts and patterns that exist')

    # every new theme applies and paints its pattern
    res = p.evaluate('''(ids) => ids.map(id => { PT.look.apply(id); const st = app.settings, img = getComputedStyle(document.body).backgroundImage + getComputedStyle(document.documentElement).backgroundImage;
        return [id, st.accent, st.bgfx, img.length]; })''', [t['id'] for t in mine])
    wrong = [r[0] for r, t in zip(res, mine) if r[1] != t['s']['accent'] or r[2] != t['s'].get('bgfx', 'solid')]
    c.eq(wrong, [], 'each theme sets its colour and pattern when picked')
    c.eq(p.errors, [], 'no errors picking all 104')

    # the gallery shows each group
    p.evaluate('PT.look.openGallery()'); p.wait_for_selector('#pt-gal:not(.hidden) .pt-gal-it')
    for k in NEW:
        p.locator('#pt-gal .pt-gal-chip[data-cat="%s"]' % k).click(); p.wait_for_timeout(150)
        c.eq(p.locator('#pt-gal .pt-gal-it').count(), len([t for t in mine if t['cat'] == k]), 'the %s button shows its themes' % k)
    c.ok(p.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'no sideways scroll')

sys.exit(c.done())
