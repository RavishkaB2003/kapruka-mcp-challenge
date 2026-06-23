---
name: web-optimization
description: >
  Activate during module builds as a performance reference, after testing
  passes as a per-module performance check, and before /deploy as a full
  optimization audit. Covers Core Web Vitals, JS/CSS/image/font optimization,
  network and caching, rendering strategy, animation performance, accessibility,
  SEO, build optimization, and monitoring. Soft gate with exceptions — warnings
  don't block, but critical performance issues do.
  Reads optimization-issues.md and optimization-resolved.md before starting.
---

# Web Optimization Agent

## Identity
You audit code for performance, accessibility, SEO, and optimization quality.
You provide actionable checklists during module builds and comprehensive
audits before deployment.

**Activation modes:**
- **Reference mode** — during Step 2 (BUILD) of `/module-cycle`, developers
  consult this skill while writing code
- **Per-module check** — after Step 5 (TESTING) passes, run the per-module
  checklist for the completed module (soft gate with exceptions)
- **Full audit** — before `/deploy`, run all sections across all completed modules

---

## Memory — Read First
- `@.agents/memory/issues/optimization-issues.md` — active performance issues
- `@.agents/memory/resolved/optimization-resolved.md` — resolved patterns

Do not re-flag resolved patterns. Check if a previous fix is still in place.

---

## Gate Rules

This skill operates as a **soft gate with exceptions**:
- ⚠️ WARNING issues are logged but do NOT block module completion
- ❌ CRITICAL issues block module completion — must be fixed before proceeding

**Critical blockers (always block):**
- LCP element >5s on any tested viewport
- Uncompressed images shipped without lazy loading or next/image
- No `fetchpriority="high"` on hero/LCP images
- JS bundle per route exceeds 500KB (compressed)
- Missing `width`/`height` on images causing CLS >0.25
- Render-blocking resources not deferred that add >1s to load
- Accessibility violations that prevent keyboard navigation or screen reader access

Everything else is a WARNING — logged, tracked, fixed when possible.

---

## Performance Budgets

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| **LCP** | ≤2.5s | 2.5–4.0s | >4.0s |
| **INP** | ≤200ms | 200–500ms | >500ms |
| **CLS** | ≤0.1 | 0.1–0.25 | >0.25 |
| **TTFB** | ≤800ms | 800ms–1.8s | >1.8s |
| **JS per route** | ≤200KB | 200–350KB | >500KB |
| **Total page weight** | ≤1.5MB | 1.5–3MB | >5MB |
| **Lighthouse Performance** | ≥90 | 50–89 | <50 |
| **Lighthouse Accessibility** | ≥90 | 70–89 | <70 |
| **Lighthouse SEO** | ≥90 | 70–89 | <70 |

---

## Section 1 — Core Web Vitals

Mark each: ✅ PASS · ⚠️ WARNING · ❌ CRITICAL

### 1.1 — Largest Contentful Paint (LCP ≤ 2.5s)
- [ ] LCP element identified and prioritised with `fetchpriority="high"` or `priority` prop
- [ ] LCP image uses `next/image` with explicit `width` and `height`
- [ ] LCP image format is WebP or AVIF — not unoptimised PNG/JPEG
- [ ] No render-blocking CSS or JS delays LCP element rendering
- [ ] Server response time (TTFB) is under 800ms
- [ ] LCP image is preloaded if not discoverable in initial HTML
  ```html
  <link rel="preload" as="image" href="/hero.webp" fetchpriority="high">
  ```

### 1.2 — Interaction to Next Paint (INP ≤ 200ms)
- [ ] No JavaScript long tasks (>200ms) blocking the main thread
- [ ] Event handlers avoid expensive layout calculations (no forced reflows)
- [ ] Heavy computations use `requestIdleCallback` or web workers
- [ ] Third-party scripts deferred or loaded asynchronously
- [ ] DOM tree size under 1,500 elements (ideal), warning at 3,000
- [ ] Input handlers debounced where appropriate (search, resize, scroll)

### 1.3 — Cumulative Layout Shift (CLS ≤ 0.1)
- [ ] All images have explicit `width` and `height` attributes (or `fill` with container)
- [ ] All videos and embeds have reserved space (aspect-ratio or explicit dimensions)
- [ ] Web fonts use `font-display: swap` or `font-display: optional`
- [ ] No content injected above existing content after initial render
- [ ] Ad slots and dynamic banners have reserved space
- [ ] Skeleton loaders used instead of empty space for async content

---

## Section 2 — JavaScript Optimization

- [ ] Route-based code splitting in place (automatic in Next.js App Router)
- [ ] Heavy components lazy-loaded with `next/dynamic` or `React.lazy`
  ```tsx
  const HeavyChart = dynamic(() => import('@/components/Chart'), {
    loading: () => <ChartSkeleton />,
    ssr: false,
  })
  ```
- [ ] `'use client'` directive placed at the lowest possible component level
- [ ] No large libraries imported in Server Components that could be server-only
- [ ] Tree shaking effective — no barrel file re-exports of entire libraries
- [ ] Third-party scripts loaded with `next/script` strategy:
  - `afterInteractive` (default) for analytics
  - `lazyOnload` for chat widgets, social embeds
  - `beforeInteractive` only for truly critical scripts
- [ ] No `eval()`, `document.write()`, or synchronous inline scripts
- [ ] Bundle analysis run — no unexpectedly large dependencies
  ```bash
  ANALYZE=true npm run build  # with @next/bundle-analyzer
  ```

---

## Section 3 — CSS Optimization

- [ ] Critical CSS inlined or extracted for above-the-fold content
- [ ] Unused CSS purged (Tailwind purge, PurgeCSS, or framework equivalent)
- [ ] `content-visibility: auto` used for long off-screen sections
  ```css
  .below-fold-section {
    content-visibility: auto;
    contain-intrinsic-size: auto 500px;
  }
  ```
- [ ] `contain: layout paint style` used on isolated UI components
  (cards, modals, widgets that don't affect parent layout)
- [ ] `will-change` used sparingly — only on elements about to animate,
  removed after animation completes
- [ ] No `@import` in CSS files — use `<link>` tags or build tool imports
- [ ] CSS animations use GPU-accelerated properties only:
  `transform`, `opacity`, `filter` — NOT `width`, `height`, `top`, `left`
- [ ] Media queries used to conditionally load heavy styles:
  ```html
  <link rel="stylesheet" href="print.css" media="print">
  ```

---

## Section 4 — Image & Media Optimization

- [ ] All images use `next/image` component (or equivalent optimiser)
- [ ] Image formats: WebP or AVIF for photos, SVG for icons/illustrations
- [ ] Hero/LCP images have `priority` prop (Next.js) or `fetchpriority="high"`
- [ ] Below-fold images use native `loading="lazy"` (default in next/image)
- [ ] Responsive images use `srcSet` and `sizes` for correct resolution
- [ ] No images larger than necessary — max 2x display resolution
- [ ] SVGs optimised (SVGO or equivalent) — no unnecessary metadata
- [ ] Background videos:
  - Compressed with H.264/H.265, CRF 28+
  - Maximum 5MB file size for web
  - Poster frame extracted for immediate display
  - `autoplay muted loop playsinline` attributes set
  - Lazy loaded if below the fold
- [ ] No Base64-encoded images larger than 1KB — use real file references
- [ ] WebP/AVIF fallbacks with `<picture>` element for non-next/image usage:
  ```html
  <picture>
    <source srcset="image.avif" type="image/avif">
    <source srcset="image.webp" type="image/webp">
    <img src="image.jpg" alt="..." width="800" height="600">
  </picture>
  ```

---

## Section 5 — Font Optimization

- [ ] Fonts loaded via `next/font` (Next.js) for automatic optimisation
  ```tsx
  import { Inter } from 'next/font/google'
  const inter = Inter({ subsets: ['latin'], display: 'swap' })
  ```
- [ ] Font format is WOFF2 exclusively — no TTF/OTF/WOFF in production
- [ ] `font-display: swap` set to prevent Flash of Invisible Text (FOIT)
- [ ] Font subsets configured — only required character sets loaded
  (e.g. `latin` not `latin-extended` unless needed)
- [ ] Variable fonts used where multiple weights/styles needed
  (one file vs. multiple weight files)
- [ ] System font stack as fallback — font metric overrides configured
  to minimise layout shift during font swap
- [ ] No more than 2–3 font families loaded per page
- [ ] Font files preloaded if not using `next/font`:
  ```html
  <link rel="preload" as="font" type="font/woff2" href="/fonts/inter.woff2" crossorigin>
  ```

---

## Section 6 — Network & Caching

- [ ] Critical third-party origins preconnected:
  ```html
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="dns-prefetch" href="https://analytics.example.com">
  ```
- [ ] Speculation Rules API used for predictive navigation (where supported):
  ```html
  <script type="speculationrules">
  {
    "prerender": [{ "where": { "href_matches": "/product/*" } }],
    "prefetch": [{ "where": { "href_matches": "/category/*" } }]
  }
  </script>
  ```
- [ ] HTTP caching headers set correctly:
  - Static assets (JS/CSS/images): `Cache-Control: public, max-age=31536000, immutable`
  - HTML pages: `Cache-Control: public, max-age=0, must-revalidate`
  - API responses: appropriate `stale-while-revalidate` where applicable
- [ ] Brotli compression enabled (or Gzip as fallback) on server/CDN
- [ ] CDN configured for static asset delivery
- [ ] API responses paginated — no unbounded data fetches
- [ ] Service worker registered for offline support (if PWA):
  - Precache critical app shell
  - Runtime cache for API responses with stale-while-revalidate
  - Cache-first for static assets

---

## Section 7 — Rendering Strategy

*Apply based on the project's framework. Next.js-specific items marked.*

- [ ] Default to React Server Components — `'use client'` only where needed
- [ ] Server Components used for data fetching — no client-side `useEffect` fetch
  for initial page data
- [ ] Streaming enabled with `loading.tsx` and `<Suspense>` boundaries:
  ```tsx
  // app/products/page.tsx
  import { Suspense } from 'react'
  export default function ProductsPage() {
    return (
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductGrid />
      </Suspense>
    )
  }
  ```
- [ ] Rendering strategy appropriate per route:
  | Route Type | Strategy |
  |------------|----------|
  | Marketing/landing pages | SSG (Static) |
  | Product catalog | ISR (revalidate: 3600) |
  | User-specific content | SSR or Client |
  | Real-time data | Client-side with SWR/React Query |
  | Hybrid static + dynamic | Partial Prerendering (PPR) if available |
- [ ] No full-page client-side rendering for SEO-critical pages
- [ ] `generateStaticParams` used for known dynamic routes (product pages, categories)
- [ ] Metadata API used for dynamic SEO tags per route

---

## Section 8 — Animation & Runtime Performance

- [ ] All animations use GPU-accelerated CSS properties:
  ✅ `transform`, `opacity`, `filter`, `backdrop-filter`
  ❌ `width`, `height`, `top`, `left`, `margin`, `padding`, `border`
- [ ] `requestAnimationFrame` used for JavaScript animations — not `setInterval`
- [ ] Intersection Observer used for scroll-triggered animations and lazy loading
  (not scroll event listeners)
- [ ] `prefers-reduced-motion` media query respected:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
  ```
- [ ] No layout thrashing — batch DOM reads before DOM writes
- [ ] Scroll handlers throttled or use `passive: true` event listeners
- [ ] Lenis/smooth scroll configured with performance in mind:
  - `wheelMultiplier` reasonable (not causing excessive repaints)
  - Disabled on mobile if causing jank
- [ ] Heavy animations (particle systems, canvas, WebGL) have:
  - Reduced motion fallback
  - Frame rate monitoring
  - Mobile simplified version or disabled entirely
- [ ] `will-change` applied only before animation starts, removed after:
  ```javascript
  element.style.willChange = 'transform'
  element.addEventListener('transitionend', () => {
    element.style.willChange = 'auto'
  })
  ```

---

## Section 9 — Accessibility (WCAG 2.2 AA)

- [ ] Semantic HTML used — `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`
- [ ] Single `<h1>` per page, heading hierarchy sequential (no skipping h2→h4)
- [ ] All images have descriptive `alt` text (decorative images: `alt=""`)
- [ ] All form inputs have associated `<label>` elements
- [ ] All interactive elements keyboard-accessible via Tab
- [ ] Focus indicators visible and high-contrast (not removed with `outline: none`)
- [ ] Focus not obscured by sticky headers/footers (WCAG 2.4.11)
- [ ] Touch targets minimum 24×24 CSS pixels (WCAG 2.5.8), prefer 44×44
- [ ] Colour contrast ratio ≥4.5:1 for normal text, ≥3:1 for large text
- [ ] Colour is not the sole means of conveying information
  (error states use icons + text, not just red colour)
- [ ] ARIA attributes used correctly — prefer native HTML over ARIA
- [ ] `aria-live` regions for dynamic content updates (toasts, search results)
- [ ] Skip navigation link present for keyboard users
- [ ] Drag-and-drop has simple pointer alternatives (WCAG 2.5.7)
- [ ] Redundant entry avoided — previously entered info auto-filled (WCAG 3.3.7)
- [ ] Authentication doesn't require memorisation (support paste, biometrics) (WCAG 3.3.8)
- [ ] Screen reader testing verified with at least one of: NVDA, VoiceOver, JAWS

---

## Section 10 — SEO Optimization

- [ ] Every page has a unique, descriptive `<title>` tag (50–60 chars)
- [ ] Every page has a unique `<meta name="description">` (150–160 chars)
- [ ] Open Graph meta tags present for social sharing:
  ```html
  <meta property="og:title" content="...">
  <meta property="og:description" content="...">
  <meta property="og:image" content="...">
  <meta property="og:url" content="...">
  ```
- [ ] Twitter Card meta tags present
- [ ] Canonical URL set on every page:
  ```html
  <link rel="canonical" href="https://example.com/page">
  ```
- [ ] Structured data (JSON-LD) for relevant content types:
  ```html
  <script type="application/ld+json">
  { "@context": "https://schema.org", "@type": "Product", ... }
  </script>
  ```
- [ ] `robots.txt` configured correctly — not blocking important pages
- [ ] `sitemap.xml` generated and submitted to Google Search Console
- [ ] Mobile-friendly — viewport meta tag set:
  ```html
  <meta name="viewport" content="width=device-width, initial-scale=1">
  ```
- [ ] No duplicate content — canonical tags resolve duplicates
- [ ] Internal linking structure logical — important pages reachable within 3 clicks
- [ ] 404 page configured with helpful navigation
- [ ] URL structure clean and descriptive (`/products/chocolate-cake` not `/p?id=123`)

---

## Section 11 — Build & Bundle Optimization

- [ ] `@next/bundle-analyzer` configured and run regularly:
  ```javascript
  // next.config.ts
  const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
  })
  module.exports = withBundleAnalyzer(nextConfig)
  ```
- [ ] No duplicate dependencies in bundle (e.g. multiple versions of `lodash`)
- [ ] Source maps configured appropriately:
  - Development: full source maps (`eval-source-map`)
  - Production: hidden source maps or none (`hidden-source-map`)
- [ ] Production build passes without warnings:
  ```bash
  npm run build && npm run lint && npx tsc --noEmit
  ```
- [ ] `package.json` has no unnecessary dependencies — audit regularly
- [ ] Performance budgets enforced in CI/CD:
  ```json
  // Example: Next.js size limit in next.config.ts
  experimental: {
    outputFileTracingExcludes: { '*': ['./node_modules/@swc/**'] }
  }
  ```
- [ ] Dead code eliminated — no unused exports, components, or utilities
- [ ] Environment-specific code properly tree-shaken
  (dev-only code stripped in production builds)

---

## Section 12 — Monitoring & Measurement

- [ ] Lighthouse CI integrated in CI/CD pipeline:
  ```bash
  npx lhci autorun --config=lighthouserc.json
  ```
- [ ] Performance budgets defined with warning + error thresholds:
  ```json
  {
    "ci": {
      "assert": {
        "assertions": {
          "categories:performance": ["warn", { "minScore": 0.9 }],
          "categories:accessibility": ["error", { "minScore": 0.9 }],
          "categories:seo": ["warn", { "minScore": 0.9 }]
        }
      }
    }
  }
  ```
- [ ] Real User Monitoring (RUM) configured:
  - `web-vitals` library reporting to analytics
  ```tsx
  import { onLCP, onINP, onCLS } from 'web-vitals'
  onLCP(sendToAnalytics)
  onINP(sendToAnalytics)
  onCLS(sendToAnalytics)
  ```
- [ ] Chrome User Experience Report (CrUX) data reviewed monthly
- [ ] Bundle size tracked across deploys — regressions flagged
- [ ] Performance regression alerts configured (Vercel Speed Insights, or custom)
- [ ] Lighthouse scores baselined after each deployment

---

## Per-Module Quick Checklist

*Run this abbreviated checklist during the BUILD step of every module.
Full sections above are for the detailed per-module check and pre-deploy audit.*

### Frontend Module Quick Check
- [ ] Images use `next/image` with dimensions
- [ ] LCP image has `priority` prop
- [ ] `'use client'` at lowest necessary level
- [ ] Heavy components dynamically imported
- [ ] Fonts via `next/font` with `swap`
- [ ] Animations use `transform`/`opacity` only
- [ ] `prefers-reduced-motion` respected
- [ ] Skeleton/loading states for async content
- [ ] All text has sufficient colour contrast
- [ ] All interactive elements keyboard-accessible
- [ ] Page has unique `<title>` and `<meta description>`

### Backend/API Module Quick Check
- [ ] Responses paginated — no unbounded data
- [ ] Expensive operations cached
- [ ] No N+1 query patterns
- [ ] Response compression enabled
- [ ] Rate limiting applied

### Fullstack Module Quick Check
- [ ] All frontend checks above
- [ ] All backend checks above
- [ ] Data fetching in Server Components where possible
- [ ] Streaming/Suspense for slow data sources

---

## Issue Logging

Open `@.agents/memory/issues/optimization-issues.md` and append:
```
## [OPT-<YYYYMMDD>-<seq>] <Short title>
- **Module:** <module-name>
- **Severity:** CRITICAL | WARNING
- **Category:** CWV | JavaScript | CSS | Image | Font | Network | Rendering | Animation | A11y | SEO | Build | Monitoring
- **Metric affected:** LCP | INP | CLS | BundleSize | Lighthouse | None
- **File:** `<path/to/file>` line <N>
- **Current value:** <measured value if applicable>
- **Target value:** <budget target>
- **Description:** <one sentence>
- **Impact:** <user experience or performance impact>
- **Fix:** <concrete suggestion>
- **Status:** OPEN
```

When fixed, update `Status: FIXED` and copy to `optimization-resolved.md`:
```
## [OPT-<ID>] <title> — RESOLVED <date>
- Fix: <description of what was done>
- Before: <metric before>
- After: <metric after>
```

---

## Report Format

### Per-Module Performance Check
```
# Performance Check — <module-name> — <date>
Passed: N · Warnings: N · Critical: N
Verdict: PASS | PASS WITH WARNINGS | BLOCKED (critical issues found)

## Critical [must fix before proceeding]
[OPT-ID] description + metric

## Warnings [logged, fix when possible]
[OPT-ID] description

## Quick Wins [easy improvements identified]
[OPT-ID] description

## Next step
PASS → Security check (Step 6 in spiral)
BLOCKED → return to builder to fix critical issues
```

### Full Pre-deployment Audit
```
# Optimization Audit — FULL SYSTEM — <date>
## Modules audited: N

## Core Web Vitals Summary
| Metric | Score | Status |
|--------|-------|--------|
| LCP    | <Xs>  | ✅/⚠️/❌ |
| INP    | <Xms> | ✅/⚠️/❌ |
| CLS    | <X>   | ✅/⚠️/❌ |

## Lighthouse Summary
| Category | Score | Status |
|----------|-------|--------|
| Performance | <N> | ✅/⚠️/❌ |
| Accessibility | <N> | ✅/⚠️/❌ |
| SEO | <N> | ✅/⚠️/❌ |
| Best Practices | <N> | ✅/⚠️/❌ |

## Bundle Analysis
| Route | JS Size | Status |
|-------|---------|--------|
| / | <NKB> | ✅/⚠️/❌ |
| /products | <NKB> | ✅/⚠️/❌ |

## Critical Issues [block deployment]
[list with OPT IDs]

## Warnings [recommended before deploy]
[list with OPT IDs]

## Passed Areas
[summary]

## Verdict: DEPLOY | FIX CRITICAL FIRST | OPTIMISE THEN DEPLOY
```

---

## Rules
- CRITICAL performance issues block module completion — same as a FAIL in code review
- WARNING issues are logged but module can proceed
- Never skip the per-module quick checklist — it catches 80% of issues
- Always run Lighthouse before declaring a full audit complete
- Performance regressions are tracked — every deploy should maintain or improve scores
- Accessibility is non-negotiable — WCAG 2.2 AA is the minimum standard
- Measure real user data (RUM) — lab data alone is insufficient for production
