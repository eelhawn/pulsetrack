# PulseTrack Privacy Policy

**Effective date: November 16, 2026. Updated November 17, 2026** (added "Guide answers from your own computer" and "Guide answers from a cloud AI service").

This policy explains how the PulseTrack web application published at https://eelhawn.github.io/pulsetrack (the "App") handles your information. "Developer", "we" and "us" mean the developer of PulseTrack.

## In short

**The Developer collects no data about you.** The App has no accounts, no sign-in, no analytics, no advertising, no tracking and no cookies. It has no server of its own. Nothing you enter in the App is ever sent to the Developer. The Developer cannot see what you log, when you train or how you use the App. A few optional features that you turn on yourself send specific data to services you choose. Each one is listed under 'What leaves your device, and when'.

## Where your data lives

Everything you enter is stored only on your own device, inside your browser. This includes workouts, sets, programs, body measurements, photos, notes, settings and backups. The App keeps this data in your browser's local storage and IndexedDB, and it keeps the App's own files in an offline cache so it works without a connection. This data stays on your device and is not uploaded anywhere. The Developer has no copy of it and cannot access, recover or delete it for you.

## What leaves your device, and when

The App works offline. A few things can involve a network connection, and you should know about each one:

- **Downloading and updating the App.** The App is hosted on GitHub Pages. When your device downloads the App or checks for an update, GitHub receives the standard information any website receives, such as your IP address, browser type and the time of the request. GitHub's privacy statement governs that information. GitHub Pages does not give the Developer access to visitor logs.
- **Group board (optional, off unless you turn it on).** If you start or join a group board, the App sends small updates through ntfy.sh, a free public relay. An update holds the name you chose, your level, your streak, a summary of your last four weeks and your lift bests. Each update is encrypted on your device with a key made from your group code before it is sent. The relay sees only scrambled text, a mailbox name and your device's IP address, and it keeps messages for about 12 hours. Anyone who has your group code can read the updates. Choosing Leave stops it. The Developer does not run ntfy.sh and does not receive these messages.
- **Guide answers from your own computer (optional, off unless you turn it on).** If you set Settings > Guide to use Ollama on your own computer, each question you ask the guide is sent to the address you enter, which is your computer, not the Developer's, together with the facts the guide found for it: the guide's own answer (the matching screen, setting or exercise; for a question about an exercise you have done, that answer can include your last sets of it, the date, how many workouts you have done it in and your best estimated one-rep max), your current program and the workout in progress (exercise names, sets done and planned, target reps), your last five workouts (date, name, number of sets and up to six exercise names each, without weights), and whether you use kg or lb. Your notes, body measurements, photos, form clips and the rest of your history are not sent. Nothing is sent anywhere else. Questions about pain, injuries, medicine or doses are never sent.
- **Guide answers from a cloud AI service, with your own key (optional, off unless you turn it on).** The guide can send your questions to a cloud AI service you choose (Anthropic, OpenAI or Google), using an API key from your own account with that service. It is off by default. Before it can be turned on, the App shows you this section and you must tick "I have read this and agree".

  **What is sent.** Only when you press Enter or tap a suggested question in the guide, never while you type, the App sends one request, straight from your device to the service you chose. The request holds:
  - your question, exactly as you typed it;
  - instructions telling the service how to answer (the same for everyone; they contain nothing about you);
  - the facts the guide found for that question:
    - the guide's own answer: the matching screen, setting or exercise. For a question about an exercise you have done, this can include your last sets of it (weights and reps), their date, how many workouts you have done it in, and your best estimated one-rep max;
    - your current program and the workout in progress: exercise names, sets done and planned, target reps;
    - your last five workouts: date, name, number of sets and up to six exercise names each, without weights;
    - whether you use kg or lb;
  - your API key, which the service needs to accept the request and charge your account.

  Under every answer, **What was sent** shows the exact text that went to the service.

  **What is never sent.** Questions about pain, injuries, medicine or doses: the App answers those itself and suggests a professional. Your notes, body measurements, photos, form clips, the rest of your history, your backups, and your group board name or code. Nothing goes to the Developer: the request does not pass through any server of ours.

  **What the service does with it.** The service receives the request the way any website receives a visit, including your IP address and browser type. What it then does with your question and the facts is decided by the service's own terms and privacy policy and by the settings of your account with it, not by PulseTrack. That includes how long it keeps them, whether its staff can read them, and whether they are used to train or improve its models. Read those terms before you turn this on. The Developer has no agreement with these services, never sees what you send, and cannot delete it for you.

  **Your API key.** The key is stored only on this device, in the App's storage in your browser. It is not included in backup files or shares, and it is sent only to the service it belongs to. Anyone who can open the App on this device, or read this browser's storage, could find it, so use a key you can revoke and set a spending limit with the service. The service charges the cost of each request to your account.

  **Turning it off.** Choose "On this phone" in Settings > Guide, or tap "Forget key". Nothing more is sent from that moment, and Forget key deletes the key from this device. Anything already sent stays with the service under its terms; to have it deleted, ask the service.

  **Age.** Do not turn this on if you are younger than the minimum age in the service's terms.

  If this section changes, the App turns the cloud option off until you read and agree to the new version.
- **Sharing, exporting and backups.** When you tap share, export or back up, the App gives the text or file to your device's share sheet or downloads it. Where it goes from there is your choice.
- **Links to other sites.** Buttons such as the form-video search open YouTube or other sites in your browser. Those sites have their own privacy policies.
- **Your own add-ons.** If you write custom styles (Mods) that load files from the internet, such as web fonts, your browser fetches them from the address you entered.

## Health information

Workout and body data can count as health information under laws such as Washington's My Health My Data Act. The Developer does not collect, receive, share or sell any of it. It stays on your device unless you choose to share it as described above. If you turn on guide answers from a cloud AI service, the facts described above go to that service each time you ask a question.

## Children

The App does not collect personal information from anyone, including children under 13. The App is not directed to children under 13, and the Terms of Service require users to be at least 13.

## Deleting your data

You can delete everything the App has stored on your device at any time. To do so, clear this site's data in your browser settings or uninstall the App. Because the Developer never has a copy, nothing needs to be deleted anywhere else, except any group board update still waiting on the ntfy.sh relay, which it removes after about 12 hours, and anything you sent to a cloud AI service, which you can ask that service to delete.

## Changes

If this policy changes, the effective date at the top will change and the App may ask you to accept the new version.

## Contact

Questions about this policy can be raised at https://github.com/eelhawn/pulsetrack/issues.
