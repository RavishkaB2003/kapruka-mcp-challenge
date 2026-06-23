# Kapruka UX Research Prompt
## Use this prompt verbatim inside Google Antigravity

---

## THE PROMPT (copy everything below this line)

---

You are a senior UI/UX researcher and design strategist. Your task is to conduct
a deep, thorough, visual analysis of two reference ecommerce websites and produce
three detailed markdown analysis files that will be used to design a completely new
visual direction for Kapruka — Sri Lanka's leading ecommerce platform.

Do not summarise. Do not skip steps. Do not work in the background.
Every browser action must be visible — open the browser visually, navigate visually,
scroll visually, interact visually. I need to watch everything you do in real time.

---

## PART 1 — ANALYSIS OF SITE 1: VOL DOG FOOD

### Step 1.1 — Open the site visually
Open Antigravity's built-in Chromium browser.
Navigate to: https://www.voldogfood.com/
Wait for the page to fully load including all animations, images, and fonts.
Do not proceed until the page is fully rendered.

### Step 1.2 — Initial viewport capture
Before scrolling, document exactly what is visible in the initial viewport:
- What is the first thing the eye goes to?
- What is the hero element? (image, video, text, animation?)
- What is the navigation structure?
- What colours dominate the first screen?
- What typography is used for the headline?
- Is there any motion or animation on load?
- What is the emotional tone of the landing?
Take a screenshot of the initial viewport. Label it: `vol-01-initial-viewport.png`

### Step 1.3 — Full page slow scroll
Scroll down the page slowly in sections.
Pause for 3 seconds at each distinct section before continuing.
At each section document:
- Section purpose (hero / feature / product / testimonial / CTA / footer etc.)
- Layout structure (full-width / grid / split / asymmetric / centred)
- Background treatment (colour / image / video / gradient / texture)
- Typography hierarchy (sizes, weights, spacing, line height feel)
- Imagery style (photography, illustration, 3D, flat, lifestyle, product-only)
- Animation or scroll behaviour (parallax, fade-in, slide, pin, sticky)
- Colour palette used in this section
- Spacing and whitespace use (tight / airy / generous)
- Any micro-interactions visible
Take a screenshot at each section pause.
Label screenshots sequentially: `vol-02-section.png`, `vol-03-section.png` etc.

### Step 1.4 — Interact with every clickable element
After completing the full scroll, return to the top.
Now interact with every clickable element on the page one by one:

Navigation:
- Hover over each navigation item — document hover state (colour change, underline,
  dropdown appearance, animation)
- Click each navigation item — document the page transition (instant, fade, slide,
  page reload) and what the destination page looks like
- Return to homepage after each navigation click

Product elements:
- Hover over each product card — document hover state (image zoom, overlay appearance,
  button reveal, shadow change, scale effect)
- Click on a product — document the product detail page layout, image gallery behaviour,
  add to cart interaction, quantity selector, and any upsell elements
- If there is an Add to Cart button — click it — document the cart interaction
  (sidebar slide, modal, inline confirmation, counter update on nav)

Interactive UI elements:
- Open any mobile menu if visible (resize browser to 375px width first)
- Document mobile menu animation (slide, fade, full-screen overlay)
- Interact with any filters, sliders, or selectors
- Interact with any accordions or expandable content
- Interact with any modals or popups
- Hover over any buttons — document all hover/active states
- Interact with the footer — document link states and layout

Take a screenshot of every distinct interaction state.
Label: `vol-[number]-[element-description].png`

### Step 1.5 — Technical observation
While interacting, observe and note:
- What CSS transitions are used? (ease, duration, transform type)
- What scroll behaviour is implemented? (native smooth, library-driven, parallax ratio)
- What loading technique is used for images? (lazy load, blur-up, skeleton)
- What font loading strategy? (system fonts, Google Fonts, custom hosted)
- Are there any scroll-triggered animations? (what triggers them, what they do)
- Is the layout CSS Grid, Flexbox, or mixed?
- What is the approximate colour palette? (extract hex values if visible)
- What is the primary typeface for headings and body?

### Step 1.6 — Site 1 emotional audit
Answer these questions based on your full observation:
- What does this site make you feel in the first 5 seconds?
- What is the site's core design philosophy in one sentence?
- What does this site do that generic ecommerce sites do NOT do?
- What is the single most impressive UX decision on this site?
- What would a user remember about this site 24 hours later?
- What design risk did this site take that paid off?

### Step 1.7 — Generate Site 1 analysis file
Save a file named `ANALYSIS-VOL-DOG-FOOD.md` to the project root.
Structure it as follows:

```
# UI/UX Analysis — Vol Dog Food (voldogfood.com)
## Research date: <today>

## 1. First Impression (0–5 seconds)
[detailed description]

## 2. Visual Identity
### Colour Palette
[list all identified colours with approximate hex values and their usage]
### Typography
[heading font, body font, sizes, weights, line heights, letter spacing]
### Imagery Style
[describe the visual language of the photography/illustration]
### Brand Personality
[adjectives that describe the visual tone]

## 3. Layout and Structure
### Page Architecture
[describe the overall page structure section by section]
### Grid System
[what grid/layout system is used]
### Spacing Philosophy
[tight/airy, what the whitespace communicates]

## 4. Navigation and Flow
### Desktop Navigation
[structure, hover states, behaviour]
### Mobile Navigation
[structure, animation, behaviour]
### User Journey
[how the site guides a user from landing to purchase]

## 5. Animations and Interactions
### Page Load Animations
[what animates on load, timing, easing]
### Scroll Behaviour
[parallax, scroll-triggered reveals, pinned elements]
### Hover States
[every hover state observed and its effect]
### Micro-interactions
[small feedback moments — button clicks, cart add, form focus etc.]
### Transitions
[page transitions, section transitions, modal/drawer animations]

## 6. Product Presentation
### Product Card Design
[layout, information hierarchy, hover behaviour]
### Product Detail Page
[image gallery, information layout, CTA placement, upsell approach]
### Cart Experience
[how cart interaction feels, drawer/modal/page]

## 7. Emotional Design
### What this site makes you feel
[honest emotional audit]
### Core design philosophy
[one sentence]
### What it does that generic ecommerce does not
[specific list]
### Most impressive UX decision
[single most notable choice]
### What a user remembers 24 hours later
[the lasting impression]
### Design risk that paid off
[the bold choice]

## 8. Technical Observations
### Estimated CSS techniques
[transitions, transforms, grid/flex, scroll libraries]
### Image loading strategy
[lazy load, blur-up, skeleton etc.]
### Font strategy
[hosting, loading, fallbacks]
### Scroll animation approach
[library or native, trigger points]

## 9. Screenshots Reference
[list all screenshots taken with their labels and what they show]
```

---

## PART 2 — ANALYSIS OF SITE 2: BEAUTY IN STEM

### Step 2.1 — Open the site visually
In the same Chromium browser, open a new tab.
Navigate to: https://beautyinstem.com/pages/shop
Wait for the page to fully load including all animations, images, and fonts.
Do not proceed until the page is fully rendered.

### Step 2.2 — Initial viewport capture
Before scrolling, document exactly what is visible in the initial viewport
using the same questions as Step 1.2.
Take a screenshot. Label it: `bis-01-initial-viewport.png`

### Step 2.3 — Full page slow scroll
Follow the exact same process as Step 1.3.
Label screenshots: `bis-02-section.png`, `bis-03-section.png` etc.

### Step 2.4 — Interact with every clickable element
Follow the exact same process as Step 1.4.
Cover all navigation, product cards, product detail, cart, mobile menu,
filters, modals, accordions, buttons, and footer.
Label screenshots: `bis-[number]-[element-description].png`

### Step 2.5 — Technical observation
Follow the exact same process as Step 1.5.

### Step 2.6 — Site 2 emotional audit
Answer the same six emotional audit questions as Step 1.6.

### Step 2.7 — Generate Site 2 analysis file
Save a file named `ANALYSIS-BEAUTY-IN-STEM.md` to the project root.
Use the exact same structure as the Site 1 analysis file.

---

## PART 3 — KAPRUKA ADAPTATION MASTER FILE

After completing both site analyses, generate a third file.
Save it as `KAPRUKA-NEW-DIRECTION.md` to the project root.

This file proposes a completely new visual direction for Kapruka
inspired by both reference sites — not a copy of either, but a synthesis
that fits Kapruka's context: a multi-category Sri Lankan ecommerce platform
that sells everything from groceries to electronics to gifts.

Structure the file as follows:

```
# Kapruka — New Visual Direction
## Inspired by: Vol Dog Food + Beauty In Stem
## Research basis: [date of analysis]

---

## 1. The Core Problem With Generic Ecommerce
[Based on your analysis of what both reference sites do differently,
articulate exactly what makes a generic ecommerce experience feel lifeless.
Be specific — list the design decisions that kill the feeling of journey.]

## 2. What Both Reference Sites Teach Us
### From Vol Dog Food
[Top 5 specific design decisions that Kapruka should adapt — not copy]
### From Beauty In Stem
[Top 5 specific design decisions that Kapruka should adapt — not copy]
### The synthesis principle
[One overarching design philosophy that combines the best of both sites
and applies to Kapruka's multi-category context]

## 3. Proposed Visual Identity for Kapruka

### Brand personality redefinition
[Current Kapruka feels: ___]
[New Kapruka should feel: ___]
[The emotional shift: from ___ to ___]

### Colour Direction
[Proposed primary palette — name each colour, give approximate hex,
explain what emotion it carries and where it is used]
[Proposed secondary palette]
[Proposed semantic colours — success, error, warning, info]
[Rationale: why these colours work for Sri Lanka's market]

### Typography Direction
[Proposed heading typeface — name, weight, why it fits]
[Proposed body typeface — name, weight, why it fits]
[Type scale proposal — sizes for hero, h1, h2, h3, body, caption]
[Letter spacing and line height philosophy]
[If Sinhala support is needed — which font handles both scripts]

### Imagery and Visual Language
[What kind of photography/illustration style fits the new direction]
[How products should be shot or presented]
[What the visual language communicates about Sri Lanka and the brand]
[What to avoid]

### Iconography and UI elements
[Icon style — outline, filled, illustrated, custom]
[Button style — shape, weight, hover behaviour]
[Card style — shadow, border, radius philosophy]
[Input style — minimal, outlined, filled]

## 4. The Journey Experience — How Kapruka Should Feel

### Landing experience
[Describe the first 5 seconds of the new Kapruka homepage in detail —
what the user sees, feels, and does. Be cinematic in description.]

### Navigation philosophy
[How should navigation work in the new direction —
mega menu, sidebar, bottom bar, gesture-based, category-first]

### Product discovery
[How should products be discovered — not just a grid.
Describe the journey from landing to finding a product.]

### Product presentation
[How should a product be presented to make it feel premium —
image treatment, information hierarchy, storytelling approach]

### Cart and checkout feeling
[How should the cart and checkout feel — what emotion should it carry]

### Category experience
[Since Kapruka has many categories unlike the reference sites,
how should categories be handled to maintain the journey feel
instead of feeling like a department store]

## 5. Animations and Motion Direction

### Page load
[What should happen in the first 1 second of loading]

### Scroll behaviour
[What scroll interactions bring the page to life]

### Product interactions
[How products respond to hover, click, and selection]

### Transitions
[How the user moves between pages/states]

### Micro-interactions
[Small moments of delight — what they are and when they appear]

### Motion principles
[Speed, easing, and restraint guidelines —
what to animate, what NOT to animate, and why]

## 6. Screen-by-Screen Proposals

For each key screen, describe the new layout in detail:

### Homepage
[Full description of the new homepage layout section by section]

### Category Page
[Full description]

### Product Listing Page
[Full description]

### Product Detail Page
[Full description]

### Cart
[Full description]

### Checkout
[Full description]

### Order Confirmation
[Full description]

## 7. What Makes This Kapruka, Not Just Beautiful
[This is the most important section.
Explain how this new direction stays true to Kapruka's Sri Lankan identity,
its multi-category nature, and its existing user base — while elevating
the experience to feel like a journey rather than a transaction.
This should read like a design manifesto.]

## 8. Implementation Priority
[Given that this is a significant redesign, what should be built first
to have the maximum impact with the minimum effort?
List 10 specific UI/UX changes in order of impact.]

## 9. What To Avoid
[Specific anti-patterns — things that would undermine the new direction.
Be blunt. List at least 10 specific things NOT to do.]
```

---

## FINAL INSTRUCTIONS TO THE AGENT

After generating all three files, output a summary:
```
## Research Complete

Files generated:
- ANALYSIS-VOL-DOG-FOOD.md
- ANALYSIS-BEAUTY-IN-STEM.md
- KAPRUKA-NEW-DIRECTION.md

Screenshots taken: N total
  - Vol Dog Food: N screenshots
  - Beauty In Stem: N screenshots

## Key insight in one sentence
[The single most important design lesson from this research]

## Recommended first step for Kapruka
[The single most impactful change to make immediately]
```

Do not close the browser until all three files are saved and confirmed.
Do not compress or summarise the analysis files — they must be comprehensive.
Every section in every file must be fully written — no placeholders, no TODOs.
