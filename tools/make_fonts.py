#!/usr/bin/env python3
"""Builds src/css/14-pt-fonts-more.css: extra open-licence (OFL) fonts, cut down to Latin letters, digits and the
punctuation the app uses, as base64 WOFF, so they work offline with no download. Needs fonttools (pyftsubset).
Run it only when the font list changes:   python3 tools/make_fonts.py
Source folders are the ones on the build machine; the finished CSS is committed, so nobody else needs the fonts."""
import base64, io, os, sys
from fontTools import subset
from fontTools.ttLib import TTFont

CF = '/mnt/skills/examples/canvas-design/canvas-fonts/'
INTER, CROS = '/usr/share/fonts/opentype/inter/', '/usr/share/fonts/truetype/crosextra/'
# family, [(weight range, file)]   one file given for 400 and 700 is used for the whole 400-700 range (no faked bold)
FONTS = [
    ('PT Inter', [('400', INTER + 'Inter-Regular.otf'), ('700', INTER + 'Inter-Bold.otf')]),
    ('PT Bricolage', [('400', CF + 'BricolageGrotesque-Regular.ttf'), ('700', CF + 'BricolageGrotesque-Bold.ttf')]),
    ('PT Instrument Sans', [('400', CF + 'InstrumentSans-Regular.ttf'), ('700', CF + 'InstrumentSans-Bold.ttf')]),
    ('PT Carlito', [('400', CROS + 'Carlito-Regular.ttf'), ('700', CROS + 'Carlito-Bold.ttf')]),
    ('PT Plex Serif', [('400', CF + 'IBMPlexSerif-Regular.ttf'), ('700', CF + 'IBMPlexSerif-Bold.ttf')]),
    ('PT Plex Mono', [('400', CF + 'IBMPlexMono-Regular.ttf'), ('700', CF + 'IBMPlexMono-Bold.ttf')]),
    ('PT Crimson', [('400', CF + 'CrimsonPro-Regular.ttf'), ('700', CF + 'CrimsonPro-Bold.ttf')]),
    ('PT Caladea', [('400', CROS + 'Caladea-Regular.ttf'), ('700', CROS + 'Caladea-Bold.ttf')]),
    ('PT National Park', [('400', CF + 'NationalPark-Regular.ttf'), ('700', CF + 'NationalPark-Bold.ttf')]),
    ('PT Geist Mono', [('400', CF + 'GeistMono-Regular.ttf'), ('700', CF + 'GeistMono-Bold.ttf')]),
    ('PT Red Hat Mono', [('400', CF + 'RedHatMono-Regular.ttf'), ('700', CF + 'RedHatMono-Bold.ttf')]),
    ('PT DM Mono', [('400 700', CF + 'DMMono-Regular.ttf')]),
    ('PT Baskerville', [('400 700', CF + 'LibreBaskerville-Regular.ttf')]),
    ('PT Young Serif', [('400 700', CF + 'YoungSerif-Regular.ttf')]),
    ('PT Gloock', [('400 700', CF + 'Gloock-Regular.ttf')]),
    ('PT Instrument Serif', [('400 700', CF + 'InstrumentSerif-Regular.ttf')]),
    ('PT Italiana', [('400 700', CF + 'Italiana-Regular.ttf')]),
    ('PT Poiret One', [('400 700', CF + 'PoiretOne-Regular.ttf')]),
    ('PT Jura', [('400 700', CF + 'Jura-Medium.ttf')]),
    ('PT Smooch Sans', [('400 700', CF + 'SmoochSans-Medium.ttf')]),
    ('PT Arsenal SC', [('400 700', CF + 'ArsenalSC-Regular.ttf')]),
    ('PT Pixelify', [('400 700', CF + 'PixelifySans-Medium.ttf')]),
    ('PT Silkscreen', [('400 700', CF + 'Silkscreen-Regular.ttf')]),
    ('PT Erica One', [('400 700', CF + 'EricaOne-Regular.ttf')]),
    ('PT Boldonse', [('400 700', CF + 'Boldonse-Regular.ttf')]),
    ('PT Handwriting', [('400 700', CF + 'NothingYouCouldDo-Regular.ttf')]),
]
# the same glyphs the first eight fonts carry: basic Latin plus a few signs
UNICODES = list(range(0x20, 0x7f)) + [0xb0, 0xb7, 0xbd, 0xd7, 0x2013, 0x2014, 0x2018, 0x2019, 0x201c, 0x201d, 0x2022, 0x2026, 0x2212]

def cut(path):
    opts = subset.Options()
    opts.flavor = 'woff'; opts.layout_features = ['kern']; opts.hinting = False; opts.desubroutinize = True
    opts.notdef_outline = True; opts.name_IDs = [1, 2]; opts.drop_tables += ['DSIG', 'STAT', 'MVAR', 'HVAR', 'avar', 'fvar', 'gvar', 'cvar']
    f = TTFont(path)
    if 'fvar' in f:   # a variable font: fix it at its default weight
        from fontTools.varLib import instancer
        f = instancer.instantiateVariableFont(f, {a.axisTag: a.defaultValue for a in f['fvar'].axes})
    s = subset.Subsetter(opts); s.populate(unicodes=UNICODES); s.subset(f)
    out = io.BytesIO(); f.flavor = 'woff'; f.save(out)
    return out.getvalue()

css, total = [], 0
for fam, files in FONTS:
    for wt, path in files:
        if not os.path.exists(path): sys.exit('missing ' + path)
        b = cut(path); total += len(b)
        css.append("@font-face{font-family:'%s';font-weight:%s;font-style:normal;font-display:swap;src:url(data:font/woff;base64,%s) format('woff')}" % (fam, wt, base64.b64encode(b).decode()))
        print('%-22s %-8s %6.1f KB' % (fam, wt, len(b) / 1024))
here = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
open(os.path.join(here, 'src', 'css', '14-pt-fonts-more.css'), 'w').write('/* 2.71.0: extra fonts (all SIL Open Font License), cut to Latin. Made by tools/make_fonts.py */\n' + '\n'.join(css) + '\n')
print('total %.0f KB (+33%% as base64)' % (total / 1024))
