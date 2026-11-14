# Licence and credits

PulseTrack is free software: you can redistribute it and/or modify it under the terms of the **GNU Affero General Public License
version 3** (see [LICENSE](LICENSE)). It became AGPL-3.0 in version 2.96.0, when it took in the openGym exercise library below.

## openGym exercise library (`opengym-exercises.js`)

The 2,863 extra exercises in the exercise list come from the catalogue of **openGym**
(<https://github.com/DuarteSantos8/openGym>, `catalogue/exercises/`), converted by `tools/opengym_import.py`.
Only the text is used: names, body part, equipment, muscles, descriptions and steps. Names were capitalised and the body part and
muscle were mapped to PulseTrack's own categories; nothing else was changed. Exercises PulseTrack already had were left out, and so
were rare or niche ones (see `rare()` in the tool).

> openGym, Copyright (C) 2026 Duarte Santos and the openGym contributors. Licensed under the GNU AGPL v3.0.

Entries marked `"mit": 1` (openGym's `"textSource": "exercisedb"`) keep names, muscles and steps that originate from
[ExerciseDB v1](https://exercisedb.dev/) by AscendAPI, which reached openGym through
[hasaneyldrm/exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset) under the MIT licence:

```
MIT License

Copyright (c) 2026 Hasan Emir Yıldırım

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation and data files (the "Software"),
to deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### Not included: exercise pictures and animations

openGym's exercise stills and animations are licensed to openGym by Gym visual (© Aliaksandr Makatserchyk, gymvisual.com) and are
**not** covered by the AGPL. They may not be copied into other apps, so PulseTrack contains none of them and does not link to them.

## Other parts

The fonts built into PulseTrack are open-licence (SIL Open Font License), as listed in the README.
