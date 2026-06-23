# Scroll Animation Implementation Plan

_Based on: gtavi-scroll-animation-analysis.md_
_Issues addressed: SCROLL_ISSUES.md_

---

## Pre-conditions

1.  **Video re-encoding completed**: The asset `public/assets/video/heroScreen.mp4` has been re-encoded with `-g 1` (all keyframes), `-movflags faststart` (moov atom first), and audio removed.
2.  **Dependencies to install**:
    *   `cobe` (WebGL 3D Globe library)
    *   `gsap` (GreenSock Animation Platform)

---

## Phase 1 — Layout & Foundation

### Task 1.1 — Install Dependencies
*   **Addresses:** FINDING-2, FINDING-3
*   **File(s) to change:** `package.json`
*   **What to do:** Install `gsap` and `cobe` to support WebGL globe preloading and ScrollTrigger scrubbing.
*   **Execution:** Propose terminal installation of `cobe` and `gsap`.

### Task 1.2 — Refactor Layout to Window/Document Scrolling
*   **Addresses:** FINDING-1
*   **File(s) to change:** [src/app/page.tsx](file:///d:/NSBM/Projects%202.0/KaprukaNewDesign2.0/src/app/page.tsx)
*   **What to do:** 
    *   Remove `overflow-y-auto` and `h-screen` from the main container `#main-scroll-container` to let scrolling propagate naturally to the window/document level.
    *   Set container height to a static scale or flow (e.g., body scrolling naturally over 4 viewport sections).
    *   Modify section wrappers from fixed positioning or absolute offsets to allow normal layout flow.
*   **Code change preview:**
    ```diff
    - <div ref={containerRef} className="h-screen w-screen overflow-y-auto relative" id="main-scroll-container">
    + <div ref={containerRef} className="relative w-full min-h-screen" id="main-scroll-container">
    ```

### Task 1.3 — Configure Lenis + GSAP Ticker Bridge
*   **Addresses:** FINDING-1
*   **File(s) to change:** [src/app/page.tsx](file:///d:/NSBM/Projects%202.0/KaprukaNewDesign2.0/src/app/page.tsx)
*   **What to do:**
    *   Import `Lenis` and `gsap`. Register `ScrollTrigger`.
    *   Initialize Lenis on the global window.
    *   Configure GSAP ticker to drive Lenis updates: `gsap.ticker.add((time) => lenis.raf(time * 1000))` and set `gsap.ticker.lagSmoothing(0)`.
    *   Start Lenis in a stopped state (`lenis.stop()`) on mount, to be unlocked by the Preloader complete callback.
*   **Test:** Scroll is locked during loading, and scrolls smoothly once unlocked.

---

## Phase 2 — Premium 3D Globe Preloader

### Task 2.1 — Refactor `Preloader.tsx` to utilize WebGL Globe (Cobe)
*   **Addresses:** FINDING-3
*   **File(s) to change:** [src/components/Preloader.tsx](file:///d:/NSBM/Projects%202.0/KaprukaNewDesign2.0/src/components/Preloader.tsx)
*   **What to do:**
    *   Import `createGlobe` from `cobe` and Framer Motion spring utilities.
    *   Initialize the WebGL canvas. Configure `baseColor` to Warm Sand `[0.93, 0.91, 0.88]`, `markerColor` to Terracotta Clay `[226/255, 92/255, 61/255]`, and coordinate focus markers for Sri Lanka `[7.8731, 80.7718]`.
    *   Set up three transition phases based on preloader `progress`:
        *   **Spinning (0% - 90%):** Auto-rotate (`phi += 0.008` per frame).
        *   **Focusing (90% - 95%):** Stop spin, interpolate `phi`/`theta` to center Sri Lanka (`TARGET_PHI = 4.8738`, `TARGET_THETA = 0.1374`).
        *   **Morphing (95% - 100%):** Scale canvas scale up to `4.5` (zoom), fade out canvas, fade in SVG teardrop outline.
*   **Test:** Confirm 3D globe rotates, centers Sri Lanka at 90%, zooms and fades out, morphing into the outline path drawing.

### Task 2.2 — Integrate GSAP Typographic Stagger and Curtain Reveal
*   **Addresses:** FINDING-3, FINDING-7
*   **File(s) to change:** [src/components/Preloader.tsx](file:///d:/NSBM/Projects%202.0/KaprukaNewDesign2.0/src/components/Preloader.tsx)
*   **What to do:**
    *   Modify typography elements to support individual letter splitting.
    *   Replace Framer Motion curtain wrappers with left and right split-panel curtains.
    *   Build a GSAP exit timeline that executes the letter popups using `back.out(1.7)` and triggers the curtain slides to `xPercent: -100` and `xPercent: 100` using `expo.inOut` easing.
*   **Test:** Curtain split reveal triggers smoothly, displaying the main dashboard.

---

## Phase 3 — Video Scrubbing & Layout Setup

### Task 3.1 — Replace Canvas with `<video>` element
*   **Addresses:** FINDING-3
*   **File(s) to change:** [src/app/page.tsx](file:///d:/NSBM/Projects%202.0/KaprukaNewDesign2.0/src/app/page.tsx)
*   **What to do:**
    *   Remove `<canvas>` element ref and resize listeners.
    *   Render a `<video>` element with attributes: `muted`, `playsinline`, `preload="metadata"`, and styling `fixed inset-0 w-full h-full object-cover pointer-events-none z-0`.
    *   Set source to `/assets/video/heroScreen.mp4`.
*   **Test:** Background video displays correctly as a static frame at 0.

### Task 3.2 — Bind Video `currentTime` to ScrollTrigger
*   **Addresses:** FINDING-2, FINDING-3
*   **File(s) to change:** [src/app/page.tsx](file:///d:/NSBM/Projects%202.0/KaprukaNewDesign2.0/src/app/page.tsx)
*   **What to do:**
    *   Implement the iOS/Safari video priming trick: `video.play().then(() => video.pause())` inside a user-interaction handler or on loader exit.
    *   Set up a ScrollTrigger instance on the scroll container.
    *   Create a linear GSAP tween:
        ```javascript
        gsap.to(videoRef.current, {
          currentTime: videoRef.current.duration || 10,
          ease: 'none',
          scrollTrigger: {
            trigger: "#main-scroll-container",
            start: "top top",
            end: "bottom bottom",
            scrub: true,
          }
        });
        ```
*   **Test:** Scroll scrubs the video smoothly and linearly. iOS devices scrub without freeze frames.

---

## Phase 4 — CSS & Layout

### Task 4.1 — Structure Section Heights
*   **Addresses:** FINDING-4
*   **File(s) to change:** [src/app/page.tsx](file:///d:/NSBM/Projects%202.0/KaprukaNewDesign2.0/src/app/page.tsx), [src/app/globals.css](file:///d:/NSBM/Projects%202.0/KaprukaNewDesign2.0/src/app/globals.css)
*   **What to do:**
    *   Configure 4 sections to stack vertically in normal flow, each spanning exactly `100vh`.
    *   Define container scroll limits: total height of the outer scrolling container should naturally compute to `400vh` (4 sections * 100vh).
*   **Test:** Layout heights computed correctly on resize.

### Task 4.2 — Apply Will-Change Hints
*   **Addresses:** FINDING-5
*   **File(s) to change:** [src/app/globals.css](file:///d:/NSBM/Projects%202.0/KaprukaNewDesign2.0/src/app/globals.css)
*   **What to do:**
    *   Remove `will-change: contents` on canvas.
    *   Add `will-change: transform, opacity` class definition in CSS for the overlay panels that animate on scroll.

---

## Phase 5 — Performance & Cleanup

### Task 5.1 — Remove Legacy Canvas Frame Fetching
*   **Addresses:** FINDING-3
*   **File(s) to change:** [src/components/Preloader.tsx](file:///d:/NSBM/Projects%202.0/KaprukaNewDesign2.0/src/components/Preloader.tsx), [src/app/page.tsx](file:///d:/NSBM/Projects%202.0/KaprukaNewDesign2.0/src/app/page.tsx)
*   **What to do:**
    *   Remove `loadAndDecode` and the batch-fetching of 300 JPG frames from `Preloader.tsx`.
    *   Update loading indicators to track video metadata preloading status (wait for `loadedmetadata` event of the background video or simulate a loading bar).
    *   Delete the unused `scroll_compressed` JPEG directory if desired.
*   **Test:** Loading is extremely fast, and memory usage remains below 20MB.

### Task 5.2 — Migrate Panel Animations to ScrollTrigger Timeline
*   **Addresses:** FINDING-8
*   **File(s) to change:** [src/app/page.tsx](file:///d:/NSBM/Projects%202.0/KaprukaNewDesign2.0/src/app/page.tsx)
*   **What to do:**
    *   Delete scroll-linked Framer Motion hooks: `useTransform(scrollYProgress, ...)`, `heroY`, `sec2LeftY`, etc.
    *   Replace `<motion.div>` overlays with normal `<div>` tags containing classes (e.g., `.sec-panel-left`, `.sec-panel-right`).
    *   In corporate the panel entries and exits directly inside the master ScrollTrigger timeline:
        ```javascript
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: "#main-scroll-container",
            start: "top top",
            end: "bottom bottom",
            scrub: true,
          }
        });
        
        timeline
          .to(video, { currentTime: video.duration, ease: 'none' })
          .to('.hero-text', { y: -100, opacity: 0 }, 0)
          .fromTo('.sec2-left-panel', { y: 150, opacity: 0 }, { y: 0, opacity: 1 }, 0.15)
          .fromTo('.sec2-right-panel', { y: 200, opacity: 0 }, { y: 0, opacity: 1 }, 0.18)
          // Add other sections staggered in sync with video currentTime segments
        ```
*   **Test:** Floating panels move in absolute sync with background video frames. Stuttering disappears.

---

## Compatibility Notes

*   **Lenis vs Next.js SSR:**  
    Lenis requires references to the client-side `window` object. To prevent build errors, Lenis is initialized inside a `useEffect` wrapper, and components utilizing WebGL or GSAP triggers are dynamically loaded with SSR disabled:
    ```tsx
    const Preloader = dynamic(() => import('@/components/Preloader'), { ssr: false });
    ```
*   **Tailwind v4 theme variables:**  
    To fetch Alabaster and Terracotta color arrays in `Preloader.tsx` for the WebGL canvas context, we read theme color values as direct float array mappings, keeping styling consistent with `globals.css` theme configuration.

---

## What We Are NOT Doing (and why)

1.  **Using GSAP `pin: true` for the background video:**  
    *Reason:* GSAP pins elements by inserting spacer wrappers. This interferes with modern CSS flex layouts and causes minor layout calculation jumps. A `fixed inset-0` background layout achieves the same effect natively with zero rendering cost.
2.  **Maintaining the image frame preloading queue:**  
    *Reason:* The previous 300-image caching queue consumes high network bandwidth (approx. 45MB) and locks up browser memory. Migrating to the optimized `<video>` element resolves this completely.
