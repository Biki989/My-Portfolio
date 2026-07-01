# Alex Rivera — HyperFrames Hero Intro

A **10-second hero intro video** for the portfolio, built with
[HyperFrames](https://github.com/heygen-com/hyperframes) (HTML → video).
It reproduces the live site's matrix code-rain hero as an exportable MP4:
name + role type in over falling code glyphs, an accent rule draws across,
and the handle settles in — all in 10 seconds.

This pairs with the live website in the parent folder (`../index.html`).

---

## What's here

```
hyperframes/
├── index.html   ← the composition (HTML + CSS + a deterministic JS timeline)
└── meta.json    ← project metadata (duration, resolution, fps, output)
```

## How it works (the important part)

HyperFrames renders video **frame-by-frame** by *scrubbing* a timeline, not
by playing it in real time. That means **every frame must be a pure function
of time** — otherwise re-renders produce flickering or different pixels.

This composition follows the determinism contract:

| Rule | How it's met here |
|------|-------------------|
| No `Math.random()` / `Date.now()` in the draw path | All randomness comes from a seeded `mulberry32` PRNG (`const rng = mulberry32(20260618)`) |
| Per-column state is fixed, not regenerated per frame | Columns (offset, speed, glyph seed) are built once at load |
| Glyph at a position is deterministic | `glyphFor(streamSeed, step)` hashes seed+step → same glyph every time |
| Canvas reflects the scrubbed time exactly | `tl.eventCallback("onUpdate", () => drawRain(tl.time()))` |
| Composition duration = timeline duration | The single paused GSAP timeline is exactly 10s |
| Timed elements are marked | Hero elements carry `class="clip"`; root carries `data-composition-id` |

The timeline is `paused: true` and pushed onto `window.__timelines`, which is
the hook HyperFrames uses to drive the seek.

---

## Quick start

> **Prerequisites on this machine:**
> - ✅ Node 24 + npm 11 — installed
> - ✅ Chrome — installed at `C:\Program Files (x86)\Google\Chrome\Application\chrome.exe`
> - ❌ **FFmpeg — NOT installed.** Required only for final MP4 muxing (lint + preview work without it).

### 1. Lint the composition (no rendering needed)

```bash
npx hyperframes@latest lint ./index.html
```

This validates the composition structure, timeline determinism, and clip markers.

### 2. Preview interactively (opens a browser, scrubs in real time)

```bash
npx hyperframes@latest preview ./index.html
```

### 3. Render to MP4 — needs FFmpeg

Install FFmpeg first (one-time, needs an elevated/Admin terminal):

```powershell
winget install Gyan.FFmpeg
```

Then close and reopen the terminal so `ffmpeg` is on your PATH, verify:

```bash
ffmpeg -version
```

Finally render:

```bash
npx hyperframes@latest render ./index.html --output alex-rivera-hero.mp4
```

Output: `alex-rivera-hero.mp4` (1920×1080, 30fps, 10s).

> If `npx hyperframes` can't find Chrome, point it at the installed binary:
> ```bash
> npx hyperframes@latest render ./index.html --browser "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
> ```

---

## Editing the content

All copy lives at the top of `index.html`:

- **Name** — `.name .first` / `.name .last`
- **Role line** (typed out) — `const roleFull = "..."` in the `<script>`
- **Tagline** — `.tagline`
- **Handle** — `.handle`

To change the rain density/speed, adjust `FONT_SIZE` and the column `speed`
range in `drawRain`. Keep `class="clip"` on anything you animate so the
linter and renderer track it.
