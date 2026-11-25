# Security

PulseTrack has no accounts and no server of its own. Your data lives in the browser's storage on your phone. The ways in from outside
are what you open in the app: a shared program or workout link, a backup file, a code a friend sends you, the family board, the guide's
answers from an AI, and your own Mods (CSS). This page lists what protects each one (3.27.0). Read it before adding a new way in.

## The page itself
- **Content-Security-Policy** (a `<meta>` near the top of `index.html`, written by `tools/build.py`):
  - `script-src 'self' 'sha256-…'`: only the app's own files and its own inline scripts (each allowed by the SHA-256 of its exact text,
    worked out at build time) can run. Text that ends up in the page as markup (an `onerror=`, an `onload=`, a `javascript:` link, a
    `<script>` put in by `innerHTML`) is never run. This is the main protection: even if an escape is missed somewhere, a booby-trapped
    name cannot run code. Never add an inline `onclick="…"` attribute or `eval`; use `addEventListener`.
  - `img-src 'self' data: blob:` and `media-src 'self' data: blob:`: no pictures or sounds from other sites (no tracking pixels).
  - `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com` and `font-src 'self' data: https://fonts.gstatic.com`: the app's own
    styles, inline styles, and Google Fonts for a Mod. Other sites' style sheets or pictures in a Mod are blocked.
  - `connect-src 'self' https: http: data: blob:`: left open on purpose. The guide talks to Ollama at an address you type
    (`http://192.168.1.20:11434`) and to the cloud AI you choose; the family board uses `https://ntfy.sh`. Code that is not allowed to run
    cannot use this anyway.
  - `object-src 'none'`, `base-uri 'none'`, `form-action 'none'`, `frame-src 'none'`: no plug-ins, no `<base>` that redirects links, no
    form posts, no frames inside the app.
  - The hashes change whenever a script changes, so **never hand-edit `index.html`** (it would stop running). `build.py --check` and
    `tests/security.py` catch a page whose policy does not match its scripts.
- **No framing by other sites** (module 151): GitHub Pages cannot send the `frame-ancestors` header, so the page checks itself. Inside
  a frame from another site it hides and shows a link that opens PulseTrack on its own page (against clickjacking).
- **`<meta name="referrer" content="no-referrer">`**: links you open (YouTube form videos) do not learn where you came from. Links to
  other sites open with `noopener`.

## Ways in
- **Shared program (`#import=`) and shared workout (`#day=`) links**: asked before anything is added; names and notes lose `<` and `>`,
  numbers are clamped, ids and types keep only letters, digits, `_` and `-` (module 005 `importProgramObject`, 030 `cleanDay`).
- **Backup files**: checked (it must be a PulseTrack backup, only `pulsetrack_…` keys, only text values), summarised and confirmed before
  restoring, and a safety copy of the phone is made first (module 100). Everything a backup holds is shown escaped.
- **Friend codes** (PT1, PTB1, PTR1, PTW1, PTC1, PTF2): names are clipped to 24 letters, texts to 60, numbers clamped, `__proto__` and
  similar names refused (modules 041, 048, 076). All of it is shown escaped.
- **Family board**: messages are encrypted (AES-GCM) with a key made from the 16-letter family code (PBKDF2), so the relay sees only
  scrambled text; anyone with the code can read and post, so it stays in the family (module 105).
- **Guide answers from an AI**: shown as text, never as markup; buttons only move inside the app (modules 132, 135, 136). Your own AI key
  stays in this browser (`pt-cloud-keys`), is not part of backups and is only sent to the provider you picked.
- **Mods**: CSS only, never scripts. `#nomods` in the address starts the app without them if a Mod breaks the screen (module 066).

## Escaping
Anything that came from a person (names, notes, reps text, ids, set values) goes into HTML through `esc` / `PT.esc` / `this.esc`.
Tests keep the policy on: `tests/common.py` makes Playwright's `wait_for_function` poll with `page.evaluate` (Playwright's own version
builds code from text inside the page, which the policy blocks). `tests/security.py` fills every kind of text with booby traps and checks nothing becomes markup on the workout screen, and that the
policy blocks markup that does get in.
