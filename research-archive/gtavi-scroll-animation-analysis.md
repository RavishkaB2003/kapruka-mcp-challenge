# GTA VI Website — Scroll Animation Architecture Analysis

> Senior Engineering breakdown of how Rockstar's `rockstargames.com/VI` achieves smooth scroll-driven video and what you need to replicate it.

---

## Table of Contents

1. [Tech Stack Overview](#tech-stack-overview)
2. [The Animation Pipeline](#the-animation-pipeline)
3. [Layer 1 — Lenis Smooth Scroll](#layer-1--lenis-smooth-scroll)
4. [Layer 2 — GSAP Ticker Bridge](#layer-2--gsap-ticker-bridge)
5. [Layer 3 — ScrollTrigger Scrubbing](#layer-3--scrolltrigger-scrubbing)
6. [Layer 4 — Video currentTime Scrubbing](#layer-4--video-currenttime-scrubbing)
7. [Video Encoding — The Most Overlooked Part](#video-encoding--the-most-overlooked-part)
8. [DOM Thrashing — Why Your Init is Slow](#dom-thrashing--why-your-init-is-slow)
9. [Pinning — Do Less, Not More](#pinning--do-less-not-more)
10. [UI Animations — GPU-Safe Properties Only](#ui-animations--gpu-safe-properties-only)
11. [Full Implementation Reference](#full-implementation-reference)
12. [FFmpeg Encoding Commands](#ffmpeg-encoding-commands)
13. [Root Cause Summary](#root-cause-summary)
14. [Performance Checklist](#performance-checklist)

---

## Tech Stack Overview

| Layer | Technology | Purpose |
|---|---|---|
| Framework | Next.js | SSR, routing, asset pipeline |
| Animation engine | GSAP + ScrollTrigger | Scroll-linked animation orchestration |
| Smooth scroll | Lenis | Lerp-based scroll interpolation |
| Video delivery | MP4 / H.264 via CDN | Frame-accurate seeking |
| Pinning | `position: sticky` + GSAP pin | Section locking during scroll |
| Text animations | GSAP SplitText | Character/word reveal on scroll |

Rockstar did **not** use Framer Motion, CSS scroll-driven animations, or the native Web Animations API for the main scroll effects. GSAP was chosen for its fine-grained timeline control and the `scrub` feature of ScrollTrigger.

---

## The Animation Pipeline

```
User scroll event
      │
      ▼
Lenis (lerp interpolation)        ← smooths raw scroll delta over multiple frames
      │
      ▼
GSAP ticker (rAF loop)            ← lenis.raf(time × 1000) inside gsap.ticker.add()
      │
      ▼
ScrollTrigger.update()            ← receives smoothed scroll position
      │
      ├──► video.currentTime      ← scrubs video frame-by-frame (no play/pause)
      │
      └──► opacity / transform    ← parallax, text reveals, image masking
```

Every component in this chain is necessary. Remove any one of them and the experience breaks in a specific, observable way.

---

## Layer 1 — Lenis Smooth Scroll

### What it does

Lenis intercepts the native `wheel` and `touch` events and applies **lerp (linear interpolation)** to the scroll position. Instead of jumping to the target scroll value immediately, it eases toward it over multiple animation frames.

Without this, the browser fires scroll events in bursts — not at a clean 60fps cadence. When you map those raw, jagged values directly to `video.currentTime`, the video appears to jump rather than flow.

### Installation

```bash
npm install lenis
```

### Configuration

```js
import Lenis from 'lenis';

const lenis = new Lenis({
  smoothWheel: true,      // smooth mouse wheel (desktop)
  // lerp: 0.1,           // optional: lower = smoother but more lag
});
```

**Key properties:**
- `smoothWheel: true` — the minimum config for desktop
- `lerp` — controls the interpolation factor (default ~0.1). Lower values feel more floaty; higher values feel snappier. Leave at default unless you have a specific reason to change it.
- Do **not** enable `smoothTouch: true` for scroll-scrubbed videos — touch devices handle seeking differently and this often makes things worse on iOS.

---

## Layer 2 — GSAP Ticker Bridge

### Why this matters

Lenis runs its own `requestAnimationFrame` loop. GSAP's ScrollTrigger also uses its own rAF loop. If they run independently, they can be out of phase by one frame, causing micro-stutters. The fix is to **make Lenis drive its updates through GSAP's ticker** so everything fires in the same frame.

### The bridge

```js
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({ smoothWheel: true });

// Feed Lenis's smoothed scroll position into ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);

// Drive Lenis from GSAP's rAF instead of its own loop
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

// Prevent GSAP from compensating for dropped frames in a way
// that makes scroll feel uneven
gsap.ticker.lagSmoothing(0);
```

**What `lagSmoothing(0)` does:** GSAP by default tries to smooth over frames that took too long (e.g. 200ms tab switch) by slowing down animations. For scroll-scrubbed video this is wrong — you want the video to jump to the correct position immediately when the user scrolls, not ease there from a stale position.

---

## Layer 3 — ScrollTrigger Scrubbing

### `scrub: true` vs `scrub: number`

```js
scrollTrigger: {
  scrub: true,    // video.currentTime snaps to exact scroll position each frame
  scrub: 0.5,     // video lags behind scroll by ~0.5s of easing — adds extra smoothness
}
```

For video scrubbing, `scrub: true` (or `scrub: 0`) is almost always the right choice. The smoothness should come from Lenis, not from GSAP's scrub lag — if you add both you get double-lag which makes fast scrolls feel disconnected.

### Scroll container setup

```html
<div class="scroll-container" style="height: 500vh;">
  <div style="position: sticky; top: 0; height: 100vh;">
    <video id="scrollVideo" muted playsinline preload="metadata"></video>
  </div>
</div>
```

- The outer container is tall (`500vh` or whatever you need) to give the scroll room to progress
- The inner container is `position: sticky` so the video stays on screen while the user scrolls through the outer container's height
- `muted` and `playsinline` are required attributes — without them, autoplay and seeking are blocked on mobile

---

## Layer 4 — Video currentTime Scrubbing

### The core technique

```js
const video = document.getElementById('scrollVideo');

const initScrub = () => {
  gsap.to(video, {
    currentTime: video.duration,
    ease: 'none',
    scrollTrigger: {
      trigger: '.scroll-container',
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
    },
  });
};

// Wait for metadata before reading duration
if (video.readyState >= 1) {
  initScrub();
} else {
  video.addEventListener('loadedmetadata', initScrub);
}
```

**Why `ease: 'none'`:** The scroll-to-time mapping must be linear. If you add easing here, the video will appear to accelerate or decelerate mid-scroll in a way that feels unnatural and disconnected from the user's finger/wheel movement. All easing should be handled by Lenis.

### The iOS/Safari priming trick

Safari and iOS WebKit will not allow you to set `video.currentTime` until the video has played at least one frame. If you skip this, seeking will silently fail on Apple devices.

```js
const primeVideo = async () => {
  try {
    await video.play();
    video.pause();
    video.currentTime = 0;
  } catch (e) {
    // Autoplay blocked — user interaction required
    // Add a click handler to trigger this on first interaction
  }
};

primeVideo();
```

This does not actually play the video visually — it runs for a single frame and pauses. But it unlocks the seeking API for the rest of the session.

### Handling mobile fallback

For touch devices where scroll-scrubbed video is impractical, detect and fall back to auto-play:

```js
const isTouchDevice = () =>
  'ontouchstart' in window ||
  navigator.maxTouchPoints > 0;

if (isTouchDevice()) {
  video.autoplay = true;
  video.loop = true;
  video.play();
} else {
  // set up GSAP scrub
  initScrub();
}
```

---

## Video Encoding — The Most Overlooked Part

This is where most developers lose quality and smoothness, and it has nothing to do with JavaScript.

### The `moov` atom problem

An MP4 file has two critical sections:
- `mdat` — the actual video/audio data
- `moov` — the index (frame positions, timestamps, codec info)

By default, most encoders write `moov` at the **end** of the file. When you call `video.currentTime = 4.3`, the browser needs the `moov` atom to find frame 4.3. If it hasn't downloaded yet, the browser issues an HTTP range request to the end of the file, waits for it to return, then seeks. You see a stall or flash.

`-movflags faststart` moves `moov` to the **beginning** of the file. The browser can seek to any position immediately, even before the full file is downloaded.

### The GOP (Group of Pictures) problem

H.264 compresses video by only storing complete "keyframes" every N frames, and storing delta data for the frames in between. This is called GOP size. The default is often 250 frames (about 8 seconds at 30fps).

When you seek to a non-keyframe position, the decoder has to:
1. Find the nearest preceding keyframe
2. Decode every frame from there to your target position
3. Show you the result

With a large GOP, seeking to frame 100 when the nearest keyframe is frame 0 means decoding 100 frames of work just to display one. This causes the visible stutter during scroll scrubbing.

`-g 1` makes every frame a keyframe. Seeking is instant at the cost of file size.

### The ffmpeg command

```bash
ffmpeg -i input.mp4 \
  -vf scale=1280:-1 \
  -movflags faststart \
  -vcodec libx264 \
  -crf 23 \
  -g 1 \
  -pix_fmt yuv420p \
  output.mp4
```

| Flag | Value | Explanation |
|---|---|---|
| `-vf scale=1280:-1` | 1280px wide | Match your layout width. Never serve 4K for a 960px container |
| `-movflags faststart` | — | Move `moov` atom to file start for instant seeking |
| `-vcodec libx264` | H.264 | Maximum browser compatibility |
| `-crf 23` | 0–51 scale | 18 = near lossless, 28 = low quality. 20–24 is the sweet spot |
| `-g 1` | Every frame = keyframe | Enables instant seeking at any position |
| `-pix_fmt yuv420p` | 4:2:0 chroma | Required for compatibility with all browsers/devices |

### Quality vs file size trade-off for scroll videos

Since the video is never played at real-time speed (it's scrubbed), you can afford to be more aggressive with compression than you would for a normally-played video. Artifacts that are invisible at 30fps become visible during slow scrubbing. Prioritise:

- **Higher bitrate at the cost of file size** — `-crf 18` to `-crf 22`
- **Full keyframes** — `-g 1`, non-negotiable
- **Appropriate resolution** — match your CSS container width, not the original source resolution

---

## DOM Thrashing — Why Your Init is Slow

### What thrashing is

DOM thrashing happens when JavaScript alternates between reading and writing DOM properties in the same frame. Each read after a write forces the browser to flush all pending style/layout work before it can return the measurement. On a complex page this can trigger hundreds of forced reflows per second.

```js
// Bad — thrashing
element.style.width = '50%';              // write
const width = element.getBoundingClientRect().width;  // read → forces reflow
element.style.height = width + 'px';     // write
const height = element.getBoundingClientRect().height; // read → forces reflow again
```

```js
// Good — batched
element.style.width = '50%';
otherElement.style.height = '100px';
// All writes first

const width = element.getBoundingClientRect().width;   // one reflow
const height = otherElement.getBoundingClientRect().height; // already computed
```

### How GSAP ScrollTrigger causes thrashing on init

When ScrollTrigger initialises all animations at once (on page load), it needs to:
- Read initial styles for every animated element
- Measure viewport height
- Measure total scrollable area
- Measure element positions for trigger points
- Reset and re-measure elements to handle `transform`-based positioning
- Convert between `px` and `%` units for some properties

Each of these mixes reads and writes. With dozens of animated elements, this causes hundreds of forced reflows during the loading phase, which is why Rockstar's site shows a visible pause on their loading screen.

### Fix: lazy-init with IntersectionObserver

Don't register all ScrollTrigger instances on page load. Register them only when the element enters the viewport:

```js
const sections = document.querySelectorAll('[data-animate]');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      gsap.fromTo(el,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: el,
            start: 'top 80%',
            end: 'top 40%',
            scrub: false,
          }
        }
      );
      observer.unobserve(el); // only init once
    }
  });
}, { threshold: 0.1 });

sections.forEach(el => observer.observe(el));
```

This defers all the measurement work until it's actually needed.

---

## Pinning — Do Less, Not More

### The GSAP `pin: true` cost

GSAP's `pin: true` in ScrollTrigger works by:
1. Measuring the element's position
2. Setting `position: fixed` with exact coordinates
3. Adding spacer divs to preserve document flow
4. Re-measuring on every scroll event to keep coordinates accurate

This is expensive — it contributes significantly to the layout thrashing problem above.

### Use `position: sticky` instead

For most pinning use cases, the browser can do it natively for free:

```css
.pinned-section {
  position: sticky;
  top: 0;
  height: 100vh;
}
```

```html
<div style="height: 400vh;">         <!-- scroll height -->
  <div class="pinned-section">      <!-- stays on screen -->
    <video id="scrollVideo"></video>
  </div>
</div>
```

`position: sticky` is GPU-composited in all modern browsers. It runs off the main thread, costs zero JS, and causes zero thrashing. Use GSAP `pin: true` only for cases where `sticky` genuinely can't handle it (e.g. cross-section pinning where the trigger and the pinned element are in different DOM branches).

---

## UI Animations — GPU-Safe Properties Only

### Properties that do NOT trigger layout

These are composited by the GPU and can animate at 60fps without touching the main thread:

```js
// Safe to animate
gsap.to(element, {
  opacity: 0.5,
  x: 100,           // translates, not left/right
  y: 50,
  scale: 1.2,
  rotation: 45,
  filter: 'blur(4px)',
});
```

### Properties that ALWAYS trigger layout (avoid animating)

```js
// Never animate these in a scroll-linked context
gsap.to(element, {
  width: '50%',     // layout
  height: '200px',  // layout
  top: '100px',     // layout
  left: '50px',     // layout
  margin: '20px',   // layout
  padding: '10px',  // layout
});
```

Every animation of a layout property forces a reflow for every element that depends on the animated element's size or position. In a scroll context where animations are updated every frame, this is catastrophic for performance.

### The `will-change` hint

For elements that will animate, tell the browser ahead of time:

```css
.animated-element {
  will-change: transform, opacity;
}
```

This promotes the element to its own compositor layer before the animation starts, preventing the browser from having to re-composite its parent when it animates. Remove `will-change` after animation completes to free GPU memory.

---

## Full Implementation Reference

### React / Next.js component

```jsx
'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export default function ScrollVideo({ src }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    // Smooth scroll setup
    const lenis = new Lenis({ smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);

    const tickerId = gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // Video priming (required for iOS/Safari seeking)
    const prime = async () => {
      try {
        await video.play();
        video.pause();
        video.currentTime = 0;
      } catch (_) {}
    };

    // Scroll scrub setup
    const initScrub = () => {
      gsap.to(video, {
        currentTime: video.duration || 1,
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
        },
      });
    };

    prime();

    if (video.readyState >= 1) {
      initScrub();
    } else {
      video.addEventListener('loadedmetadata', initScrub, { once: true });
    }

    return () => {
      lenis.destroy();
      gsap.ticker.remove(tickerId);
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div ref={containerRef} style={{ height: '500vh' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>
        <video
          ref={videoRef}
          src={src}
          muted
          playsInline
          preload="metadata"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
    </div>
  );
}
```

### Vanilla JS implementation

```js
import Lenis from 'lenis';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('scrollVideo');
  const container = document.querySelector('.scroll-container');

  // Lenis + GSAP bridge
  const lenis = new Lenis({ smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // iOS/Safari prime
  video.play().then(() => {
    video.pause();
    video.currentTime = 0;
  }).catch(() => {});

  // Init scroll scrub
  const onMetadata = () => {
    gsap.to(video, {
      currentTime: video.duration,
      ease: 'none',
      scrollTrigger: {
        trigger: container,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
      },
    });
  };

  video.readyState >= 1 ? onMetadata() :
    video.addEventListener('loadedmetadata', onMetadata, { once: true });
});
```

---

## FFmpeg Encoding Commands

### Standard scroll video (recommended starting point)

```bash
ffmpeg -i input.mp4 \
  -vf scale=1280:-1 \
  -movflags faststart \
  -vcodec libx264 \
  -crf 22 \
  -g 1 \
  -pix_fmt yuv420p \
  output_scroll.mp4
```

### High quality (larger file, better for hero sections)

```bash
ffmpeg -i input.mp4 \
  -vf scale=1920:-1 \
  -movflags faststart \
  -vcodec libx264 \
  -crf 18 \
  -g 1 \
  -preset slow \
  -pix_fmt yuv420p \
  output_hq.mp4
```

### Mobile version (smaller file, lower resolution)

```bash
ffmpeg -i input.mp4 \
  -vf scale=768:-1 \
  -movflags faststart \
  -vcodec libx264 \
  -crf 26 \
  -g 1 \
  -pix_fmt yuv420p \
  output_mobile.mp4
```

### Verify moov atom placement (should say "moov" before "mdat")

```bash
ffprobe -v quiet -show_entries format_tags -of json input.mp4
# Or use mp4info tool:
mp4info output.mp4 | head -20
```

You can also verify in Chrome DevTools → Network tab: if the video makes two requests to the same URL (a range request to the end), `faststart` wasn't applied.

---

## Root Cause Summary

| Symptom | Root cause | Fix |
|---|---|---|
| Video jumps during scroll | Raw scroll delta → `currentTime` with no interpolation | Add Lenis with lerp |
| Video stalls / flashes when seeking | `moov` atom at end of file | `ffmpeg -movflags faststart` |
| Seeking is slow mid-scroll | Large GOP size requires decoding many frames per seek | `ffmpeg -g 1` |
| Video looks compressed | Wrong output resolution or CRF too high | Match container width, use `-crf 18–22` |
| Scroll feels sluggish on init | DOM thrashing from GSAP measuring all elements at once | Lazy-init with `IntersectionObserver` |
| Pinning causes scroll lag | GSAP `pin: true` measures on every scroll event | Replace with `position: sticky` |
| Frame drops during animation | Animating layout properties (`width`, `top`, `left`) | Animate only `transform` and `opacity` |
| iOS video won't seek | Safari requires play() before `currentTime` is settable | Add the video priming async call |

---

## Performance Checklist

Before shipping a scroll-driven video experience, verify each of these:

### Video encoding
- [ ] `-movflags faststart` applied (moov atom is first in file)
- [ ] `-g 1` applied (every frame is a keyframe)
- [ ] Output resolution matches CSS container width (not source resolution)
- [ ] CRF is between 18–24 depending on quality requirements
- [ ] File served from a CDN with appropriate `Cache-Control` headers
- [ ] Separate mobile/desktop video sources via `<source>` or JS detection

### JavaScript setup
- [ ] Lenis initialised and driving scroll smoothing
- [ ] Lenis wired into GSAP ticker (`gsap.ticker.add`)
- [ ] `lenis.on('scroll', ScrollTrigger.update)` connected
- [ ] `gsap.ticker.lagSmoothing(0)` set
- [ ] Video primed with `play().then(pause)` before scrub init
- [ ] `loadedmetadata` event used (not `canplay` or `load`) to read `duration`
- [ ] `ease: 'none'` on the `currentTime` tween
- [ ] `scrub: true` (not a number) for tight video sync

### CSS / layout
- [ ] Video container uses `position: sticky` for pinning (not GSAP `pin`)
- [ ] Animated elements use only `transform` and `opacity`
- [ ] `will-change: transform, opacity` on elements that animate frequently
- [ ] `video` element has `muted`, `playsinline`, and `preload="metadata"`

### DevTools verification
- [ ] Network tab shows single request to video (no duplicate range requests)
- [ ] Performance panel shows no red/pink blocks during scroll
- [ ] FPS stays above 55fps during scroll (check in Rendering tab)
- [ ] No `Forced reflow` warnings in Console during init

---

*Analysis based on profiling of `rockstargames.com/VI` — May 2025. Stack: Next.js, GSAP 3, Lenis, H.264 MP4.*
