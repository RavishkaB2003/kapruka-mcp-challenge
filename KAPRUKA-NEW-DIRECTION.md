# Kapruka — New Visual Direction
## Inspired by: Vol Dog Food + Beauty In Stem
## Research basis: 2026-06-14

---

## 1. The Core Problem With Generic Ecommerce
Traditional, generic e-commerce experiences feel like walking into a crowded warehouse. They are transaction-first, treating users as units of conversion rather than explorers.
Specific design decisions that kill the sense of journey include:
1. **Visual Overload**: Jamming dozens of flashing banners, discount badges, and unrelated categories into a single viewport.
2. **Generic Color Palettes**: Overusing default primary blues, oranges, and reds without a unified color theory, making the site look cheap.
3. **Rigid Grid Systems**: 4x4 or 5x5 product blocks that repeat infinitely, leading to cognitive fatigue.
4. **Lack of Typography Hierarchy**: Using standard system sans-serif fonts in uniform weights and sizes, failing to establish reading priority.
5. **No Negative Space**: Packing items closely together with tiny margins, which induces stress and clutter.
6. **Interruptive Modals**: Throwing newsletter sign-ups, exit-intent popups, and spinning reward wheels in the user's face.
7. **Jumpy Load States**: Elements popping into view late, shifting the layout, and causing scroll hijacking.
8. **Clinical Product Detail Pages**: Listing boring technical specs in a raw table rather than telling a story about why the item exists.
9. **Fragmented Cart Flow**: Redirecting users to a new page or refreshing the window just to add a single item, breaking the purchase momentum.
10. **Aesthetic Disharmony**: Combining high-resolution studio assets with low-quality user uploads, disrupting the premium look.

---

## 2. What Both Reference Sites Teach Us

### From Vol Dog Food
1. **Interactive Calculators**: Turn e-commerce into a customized diagnostic experience. Placing a utility wizard (like the daily feed calculator) on the hero container builds high user trust.
2. **Momentum Scroll Physics**: Using smooth scroll engines (like Lenis) combined with ScrollTrigger makes scrolling through long content feel silky and effortless.
3. **Sleek Cart Drawers**: Utilizing a right-aligned sliding side-cart that dynamically updates quantities via AJAX, keeping the user in the browse mindset.
4. **Aesthetic Base Tones**: Utilizing soft, tinted off-whites/greys (like `#eeeef5`) for the body background instead of pure clinical white, creating a warm, organic background.
5. **Dynamic Toggles**: Allowing users to switch parameters (like size or weight variants) directly on product grids, removing steps to add to cart.

### From Beauty In Stem
1. **Swiss / Editorial Typography**: Bold, custom typographic statements (like `Degular Demo` headings) that feel like a luxury fashion magazine rather than a store.
2. **Curated Product Pathways**: Organizing the catalog into a numbered step system (1/ Cleanse, 2/ Activate, 3/ Recovery, 4/ Maintain) to guide users through a structured routine.
3. **Asymmetric Grid Spacing**: Off-centering images, creating large side borders, and varying grid column layouts to keep the user engaged.
4. **Interactive Hover Reveals**: Hovering on product cards displays alternate images (e.g., showing product texture or packaging details) with a soft transition.
5. **Macro Texture Imagery**: Showcasing product detail shots close-up (foams, serum drops, raw material ingredients) to emphasize quality and science.

### The Synthesis Principle
**"The Curated Lifestyle Journey"**: We will combine the interactive logic and smooth scroll animations of Vol Dog Food with the high-fashion editorial styling and structured pathways of Beauty In Stem. For Kapruka's multi-category catalog, this means we will not display a chaotic department store. Instead, we will structure each category (Gifts, Groceries, Electronics, Flowers) as its own custom "sub-journey" with specialized layout styles, clear steps, and editorial typography, unified by a premium, fluid design framework.

---

## 3. Proposed Visual Identity for Kapruka

### Brand Personality Redefinition
- **Current Kapruka feels**: Chaotic, cluttered, blue/orange corporate, transactional, and dated.
- **New Kapruka should feel**: Curated, modern, premium, welcoming, culturally rich, and elegant.
- **The Emotional Shift**: From a hectic digital supermarket to an inviting, high-end Sri Lankan lifestyle gallery.

### Colour Direction
- **Primary Base**: `#16191e` (Slate Black) - Deep, elegant, and soft off-black used for primary headings, body text, and dark mode containers.
- **Secondary Background**: `#faf8f5` (Warm Alabaster) - A soft, off-white background with a hint of warm cream. It is less harsh than pure white and feels human and organic.
- **Brand Coral**: `#e25c3d` (Terracotta Accent) - Inspired by Sri Lankan clay and spices. Used for primary CTAs, active selectors, and highlight tags.
- **Natural Moss**: `#4d6b53` (Sage Accent) - Inspired by Sri Lanka's lush tea estates. Used for organic products, flowers, and fresh groceries sections.
- **Semantic Palette**:
  - Success: `#2a8754` (Emerald Green)
  - Error: `#c94b4b` (Terracotta Red)
  - Warning: `#d98c2b` (Warm Amber)
  - Info: `#3c76a6` (Deep Azure)
- **Sri Lankan Rationale**: The warm alabaster and terracotta clay colors connect deeply with Sri Lankan organic heritage, earth, and architecture, while slate black provides a luxury feel that sets Kapruka apart from default blue platforms.

### Typography Direction
- **Heading Typeface**: `Outfit` (sans-serif) - Geometric, clean, and modern, representing structure and luxury. For premium sub-brands, we will use `Syne` in heavy weights for an editorial feel.
- **Body Typeface**: `Inter` (sans-serif) - Neutral, clean, highly legible on all screen sizes, with generous line height (`leading-relaxed` or 1.62).
- **Sinhala Font**: `Noto Sans Sinhala` - A beautiful, clean, modern sans-serif that matches the geometric structure of `Inter` and `Outfit` for dual-language pages.
- **Type Scale**:
  - Hero Headline: 4.5rem (72px) / tracking-tight
  - Section Title (H1): 3rem (48px) / font-bold
  - Subheader (H2): 2rem (32px) / font-semibold
  - Product Card Title (H3): 1.25rem (20px) / font-medium
  - Body Text: 1rem (16px) / font-light
  - Caption / Details: 0.875rem (14px) / uppercase / tracking-widest

### Imagery and Visual Language
- **Style**: Soft natural lighting, subtle shadows, and raw organic backdrops. Avoid flat, over-exposed studio shots with hard shadows.
- **Product Presentation**: Items (like flowers or cakes) should be photographed in lifestyle settings showing human hands or warm home environments. Groceries should display fresh, raw ingredients alongside the packaged item.
- **Sri Lankan Focus**: Incorporate warm daylight, tropical foliage shadows, and natural textures (jute, timber, clay) in banners and backgrounds.
- **To Avoid**: Over-processed stock images, low-res user uploads on the homepage, and loud "SALE!" stickers pasted over product shots.

### Iconography and UI Elements
- **Icon Style**: `Lucide React` styled as thin-line (`stroke-width: 1.5`), minimalist, rounded outlined icons.
- **Button Style**: Pill-shaped or soft-rounded corners (`rounded-lg` / 8px). Flat colors with a slight scale-up (1.02x) on hover and dynamic terracotta fill transitions.
- **Card Style**: Pure white cards over a warm alabaster background. Subtle, diffuse box-shadows (`shadow-[0_8px_30px_rgb(0,0,0,0.04)]`) and thin borders (`border-neutral-100`).
- **Input Style**: Minimalist outline boxes with bottom-border-only focus states that shift from thin grey to solid terracotta.

---

## 4. The Journey Experience — How Kapruka Should Feel

### Landing Experience
The first 5 seconds on the new Kapruka homepage must be cinematic.
Instead of a crowded grid of grids, the user is greeted by a full-screen, high-resolution lifestyle video background showcasing the beauty of Sri Lankan gifting: a fresh bouquet of local flowers being hand-delivered, a cake being sliced at a warm family gathering. 
Overlaying this is a massive, elegant heading: "Gifting Joy, Delivered Home."
Directly in the center of the hero section sits the **Kapruka Journey Finder** — an interactive horizontal wizard asking: 
`I want to send [Gift Type] to [Recipient] in [City] on [Date].`
As the user selects their inputs, the background morphs smoothly, displaying a curated selection of suggestions.

### Navigation Philosophy
- **Split Desktop Header**: Sleek, sticky header. Left side lists key lifestyle category hubs ("FLOWERS", "CAKES", "GROCERIES", "GLOBAL"). Center holds the minimal Kapruka text logo. Right side displays icons for search, wishlist, account, and cart count.
- **The Mega-Journey Menu**: Hovering a category opens a full-width dropdown. Rather than text link lists, it features visual cards: "For Her", "For Him", "Anniversary Specials", accompanied by high-quality photography.

### Product Discovery
Discovery will be query-led and wizard-driven. Instead of scrolling through endless listing grids, the homepage features thematic sections:
- **"Step-by-Step Celebration Kits"**: Curated bundles (e.g., Cake + Flowers + Card) organized as a horizontal slider step-system.
- **"Interactive Cake Customizer"**: An in-line wizard allowing users to select flavor, weight, icing, and topper, previewing the product change dynamically.

### Product Presentation
Product listings must tell stories. Every detail page contains:
- Left-side vertical stack of high-res photos and an ingredient/material gallery.
- Right-side sticky details block with clear country of origin, freshness guarantees, and active size selectors.
- Expandable tabs detailing **Artisanal Specs** (e.g., how the chocolate was sourced locally in Sri Lanka), **Delivery Time Slot Matrix**, and **Gifting Notes**.

### Cart and Checkout Feeling
Adding to cart slides a sleek drawer from the right, blurring the background. The cart drawer displays the items, pricing in LKR/USD, and a custom greeting card text input field. 
Checkout is styled as a 3-step clean interface:
1. **Deliver To**: Simple fields with Google Maps address validation.
2. **Gifting Touch**: Select premium wrapping options, record a voice message, or upload a photo card.
3. **Secure Payment**: Simplified local Sri Lankan PayHere / Stripe forms, with reassuring locks and secure badges.

### Category Experience
Since Kapruka handles vastly different items, we will split categories into specific "Shop Styles":
- **Gifts, Flowers, & Cakes**: Editorial, fashion-style layout with large images, warm clay tones, and gift bundling options.
- **Groceries (Kapruka Fresh)**: Crisp, grid-based layout with clean green moss tones, nutrition callouts, and quick quantity increment buttons (`+` / `−`).
- **Global Shopping**: Clean, tech-focused look with dark slate containers, search filters, and import tax calculators.

---

## 5. Animations and Motion Direction

### Page Load
A 1-second elegant preloader showcasing a geometric line-art map of Sri Lanka fading out, transitioning into the hero video background fade-in.

### Scroll Behaviour
Momentum scrolling enabled via Lenis. As sections enter the viewport, they rise up (`y: 30` to `y: 0`) and fade in over 0.8s, utilizing GSAP's ease-out power.

### Product Interactions
- **Product Card Hover**: Alternates images smoothly. The price tag slides up, revealing a quick "Add to Cart" button.
- **Category Icons**: Hovering icons scales them up slightly (1.05x) and highlights them with a soft terracotta circle.

### Transitions
- **Page Transitions**: Smooth full-page fade-out/fade-in to prevent jarring white screen flashes.
- **Drawer Slide**: Sidebar cart slides in from the right over 0.4s using `cubic-bezier(0.16, 1, 0.3, 1)`.

### Micro-interactions
- **Heart Icon**: Clicking the favorite icon plays a brief popping animation.
- **Cart Count**: When an item is added, the cart icon badge scales up and pops to show the new number.

### Motion Principles
- **Speed**: Transitions must be swift (0.2s - 0.4s) to ensure the site feels responsive, not sluggish.
- **Restraint**: Never animate structural text or tables. Motion should only guide the eye to interactive elements, products, and section breaks.

---

## 6. Screen-by-Screen Proposals

### Homepage
- **Hero**: Video loop + Interactive Journey Finder.
- **Section 2**: "The Sri Lankan Artisanal Collection" - A 3-column curated grid of premium flowers, local chocolates, and cakes.
- **Section 3**: "Build Your Gifting Kit" - Interactive step-by-step bundle selector.
- **Section 4**: "Trending Gifting Stories" - Grid of social reviews showing photos of customers receiving gifts in Sri Lanka.
- **Section 5**: Expandable FAQ + footer.

### Category Page
- Left: Vertical filter menu (Price, Brand, Rating) with clean checkboxes.
- Right: Large header banner with tropical organic leaf shadows, followed by a responsive grid of product cards.

### Product Listing Page
- Minimalist card grids with 3 items per row, giving products room to breathe.
- Quick filter badges at the top ("Same Day Delivery", "Organic", "Exclusives").

### Product Detail Page
- Left: Split layout showing large lifestyle product gallery and zoomed texture shots.
- Right: Title, star reviews, detailed delivery date validator, variant circles, and black CTA button.
- Below: Double tabs (Ingredients, Care Instructions, Delivery terms).

### Cart
- Sidebar drawer sliding from the right with a dark backdrop overlay.
- Includes a progress bar showing how much more the user needs to spend to get free delivery in Colombo.

### Checkout
- Left: Minimalist white accordion steps for Shipping Address, Gift Note, and Payment.
- Right: Sticky order summary displaying final costs without hidden charges.

### Order Confirmation
- Cinematic thank-you page.
- Display a dynamic progress tracker: "Cake is being baked" -> "Out for delivery" with an interactive live delivery map link.

---

## 7. What Makes This Kapruka, Not Just Beautiful
This design direction preserves Kapruka's identity while elevating it. 
It is uniquely Sri Lankan. By replacing generic blue with terracotta clay, tea estate green, and warm alabaster, the site feels like home.
Instead of treating Sri Lanka's leading e-commerce site as a duplicate of Amazon, it becomes a celebratory platform.
gifting is an emotional act of connection, especially for Sri Lankans living abroad sending love back home.
The new Kapruka honors this emotion by turning a boring checkout form into an interactive gifting workshop where people can customize cards, write letters, and track deliveries in real time.

---

## 8. Implementation Priority
1. **Unclutter the Homepage**: Remove all generic advertising banners and replace the hero section with a clean image slider and search bar.
2. **Implement Typography Tokens**: Replace default Arial/sans-serif styles with `Outfit` for headings and `Inter` for body copy.
3. **Deploy the Warm Alabaster Theme**: Change the site background to `#faf8f5` and card backgrounds to `#ffffff`.
4. **Build the Sidebar Cart Drawer**: Replace the full-page cart redirect with a sliding side-cart.
5. **Create the Category Layout Styles**: Deploy Terracotta styling for gifts/cakes and Moss Green for groceries.
6. **Redesign Product Cards**: Apply hover image swapping and remove cluttered text.
7. **Deploy Product Tabs**: Split product descriptions on detail pages into tabs (Specs, Delivery, Care).
8. **Add Local Date Validator**: Build a clean date-picker on product pages to confirm same-day delivery slots.
9. **Implement PayHere Cleanup**: Standardize payment input containers to fit the minimalist layout.
10. **Enable Smooth Scroll**: Add Lenis smooth scrolling for a premium browsing feel.

---

## 9. What To Avoid
1. **No Pure Black Borders**: Never use `#000000` for layout borders. Use soft grey/beige `#e5e5e5` or `#f3f3f3`.
2. **No Flashing Banners**: Ban all rotating promotional carousels that flash different discounts.
3. **No Automatic Popups**: Disable newsletter overlays on site load. Use a quiet footer form.
4. **No Jumpy Loaders**: Ensure all placeholders use skeleton loader animations.
5. **No Low-Res Renders**: Require high-resolution, professionally shot images for all homepage items.
6. **No Hidden Costs**: Display delivery taxes and service charges early in the cart, not at the final checkout step.
7. **No Plain Red/Blue Accents**: Ban standard primary colors. Use Terracotta coral and Moss green.
8. **No Monotonous Lists**: Break up listing grids with brand stories or interactive banner sections.
9. **No Scroll Hijacking**: Never force user scroll positions. Let Lenis handle the physics smoothly.
10. **No Over-formatted Text**: Keep product details short and organized in lists rather than long blocks of text.
