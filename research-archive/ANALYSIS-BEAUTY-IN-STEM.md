# UI/UX Analysis — Beauty In Stem (beautyinstem.com)
## Research date: 2026-06-14

## 1. First Impression (0–5 seconds)
- **First Eye Contact**: The eye immediately goes to the large, bold, black sans-serif typography: "KOREAN FORMULAS engineered for ultimate skin fitness."
- **Hero Element**: A high-fashion, editorial-style layout displaying a minimal white aesthetic with raw product bottles and scientific textures.
- **Navigation Structure**: Modern split navigation. The left side has links for "SCIENCE", "US", and "SHOP". The center features the "Beauty In Stem" logo. The right side contains "ACCOUNT" and "SHOPPING CART" in clean, spaced uppercase characters.
- **Dominant Colors**: Crisp white background (`#ffffff`), solid deep black typography (`#000000`), and pale muted beige/skin-tone gradients or packaging renders.
- **Typography**: Editorial, high-fashion styling using `Degular Demo` (a highly stylistic, high-contrast sans-serif) for primary headings and `Metropolis` for body text and system items.
- **Motion on Load**: Clean, instantaneous loading with modern CSS transitions. No heavy animation libraries are used, giving it a light, rapid, and utility-driven feel.
- **Emotional Tone**: High-end science meets clean cosmetics. It feels medical, luxurious, clinical, and minimalist.

---

## 2. Visual Identity

### Colour Palette
- **Primary Background**: `#ffffff` - Crisp white that acts as a blank, clinical canvas.
- **Typography / Accents**: `#000000` - Absolute black for razor-sharp visual hierarchy and high readability.
- **Packaging Accent**: Soft muted sand/beige tones (`#f5ebe6` equivalent) on product labels and ingredients.

### Typography
- **Heading Font**: `Degular Demo` - Stylistic, heavy ink-traps, giving headings a bold, editorial, and unique high-fashion look.
- **Body Font**: `Metropolis` - Clean, geometric, neutral sans-serif used for descriptions, list items, and prices, spaced out generously.
- **Font Spacing**: Uppercase letter-spacing (e.g., `S C I E N C E`) is highly visible in headers and footers to create a spacious, airy look.

### Imagery Style
- **Visuals**: Clean, shadow-less or soft-shadow macro photography of white tubes/bottles. Detailed close-ups of product textures (foams, liquid drops, gels) to emphasize formulation and science.
- **Lifestyle**: Diverse model portraits showing clean, hydrated, glowing skin, without heavy makeup.

### Brand Personality
- **Clinical**: Focuses on PDRN, skin barrier, and Korean science.
- **Minimalist**: Strip away all decorations, letting the product design and typography stand out.
- **Premium**: High-end editorial formatting.

---

## 3. Layout and Structure

### Page Architecture
1. **Header**: Left navigation links, center logo image, right account/cart utilities.
2. **Hero Segment**: Large typography statement + clean product introduction.
3. **The Collection Grid**: A horizontal list of main products (Hydra-Foam Cleanser, Reset Serum, Lash and Eye Conditioner, Hydra-Nutrition Essence) with simple pricing and inline "SELECT" links.
4. **Philosophy Callout**: Editorial section explaining "Our products are designed as skin fitness tools" focusing on Recovery, Support, and Maintenance.
5. **The Skin Fitness System Guide**: Vertical step-by-step breakdown (1/ Cleanse, 2/ Activate, 3/ Recovery, 4/ Maintain) detailing each product's purpose.
6. **Detailed Footer**: Large logo, vertical navigation, social handles (Instagram, TikTok), newsletter sign-up form, currency converter, and legal links.

### Grid System
- Grid system matches Shopify standard structure with clean margins and minimal lines. Left-aligned content blocks create an asymmetric look that reads like a fashion magazine.

### Spacing Philosophy
- Airy, wide borders, generous top/bottom padding (`py-24` equivalent). Spacing communicates calm, focus, and transparency.

---

## 4. Navigation and Flow

### Desktop Navigation
- Clear desktop links with generous tracking (`letter-spacing: 0.15em`).
- Hovering links causes a smooth shift in font-weight or opacity.

### Mobile Navigation
- Hamburger menu trigger icon (`Open menu` expandable) on the top right.
- Opens a sliding side drawer or full-screen menu panel displaying categories and account access in a clean, vertical fashion.

### User Journey
- **Discovery**: Homepage introduces the concept of "skin fitness" and Korean science.
- **System**: The 4-step guide on the homepage directs users directly to the specific product matching their skin stage.
- **Explore**: Shop page features a clean grid of all products with large imagery.
- **Action**: Single-click on a product brings up a detailed page where user selects quantities and hits "ADD TO CART".

---

## 5. Animations and Interactions

### Page Load Animations
- No heavy javascript animations. Rely on standard browser rendering and lightweight CSS animations for maximum page speed.

### Scroll Behaviour
- Native scrolling with light CSS transitions for images and hover transformations.

### Hover States
- **Product Images**: Hovering on product cards displays an alternate image (e.g., showing the texture of the serum or foam) with a smooth fade-in.
- **Select Links**: Underline expands or link text shifts weight.

### Micro-interactions
- **Form Fields**: Newsletter email inputs feature a simple bottom border that darkens on active focus.
- **Product Tabs**: Accordions on the product page (How to Use, Ingredients) expand and collapse with a quick CSS transition.

---

## 6. Product Presentation

### Product Card Design
- Uses clean portrait photos of the product bottle.
- Alternate image reveal on hover.
- Displayed with minimal text: Name, sub-title ("Optimize Your Skin's Fitness"), and price.

### Product Detail Page
- Left: Vertical stack of zoomable product renders and textures.
- Right: Fixed product title, subheader detailing active ingredients (e.g., `+ 0.5% PDRN & Hyaluronic Acid`), volume detail (100 mL), quantity toggle buttons, and solid black "ADD TO CART" button.
- Clean accordion tabs below for **How To Use** and **Ingredients**.
- Section below detailing **Hero Technologies** with high-resolution scientific photography.

### Cart Experience
- Integrated shopping cart drawer. It aggregates items, shows product image, quantity controls, and subtotal.

---

## 7. Emotional Design

### What this site makes you feel
- It makes you feel that you are buying clinical-grade, premium skincare products backed by rigorous formulation. It feels modern, clean, and highly effective.

### Core design philosophy
- Skincare as a fitness system for your skin barrier, represented through clean, Swiss-minimalist typography.

### What it does that generic ecommerce does not
- Organizes its entire product line into a numbered "4-Step System" on the homepage, making product discovery logical and structured rather than overwhelming.
- Completely avoids loud discount banners, popups, and badges, which increases the brand's premium perception.

### Most impressive UX decision
- The homepage 4-Step system guide ("1/ Cleanse", "2/ Activate") which educates the buyer and structures the purchase path.

### What a user remembers 24 hours later
- The striking `Degular Demo` typography and the clean, white, magazine-like layout.

### Design risk that paid off
- Abandoning heavy web animations and loaders, choosing instead pure CSS, static layouts, and high-quality photography, which speeds up page loads.

---

## 8. Technical Observations

### Estimated CSS techniques
- Flexible CSS grid (`display: grid`) for product galleries.
- CSS transitions on hover (`transition: opacity 0.3s ease`).
- High-resolution SVG vectors for logos and icons.

### Image loading strategy
- Modern responsive source sets (`srcset`) serving optimized sizes for desktop and mobile viewports.

### Font strategy
- Custom web fonts (`Degular Demo`, `Metropolis`) loaded via CSS with standard web fallbacks (`Helvetica`, `Arial`).

---

## 9. Screenshots Reference
- [bis-01-initial-viewport.png](file:///d:/NSBM/Projects%202.0/KaprukaNewDesign2.0/ux-research-screenshots/bis-01-initial-viewport.png) - Homepage hero and typography statement.
- [bis-02-section.png](file:///d:/NSBM/Projects%202.0/KaprukaNewDesign2.0/ux-research-screenshots/bis-02-section.png) - Collection grid introduction.
- [bis-03-section.png](file:///d:/NSBM/Projects%202.0/KaprukaNewDesign2.0/ux-research-screenshots/bis-03-section.png) - First section of the product grid.
- [bis-04-section.png](file:///d:/NSBM/Projects%202.0/KaprukaNewDesign2.0/ux-research-screenshots/bis-04-section.png) - Brand philosophy statement section.
- [bis-05-section.png](file:///d:/NSBM/Projects%202.0/KaprukaNewDesign2.0/ux-research-screenshots/bis-05-section.png) - Start of the 4-step skin fitness guide.
- [bis-06-section.png](file:///d:/NSBM/Projects%202.0/KaprukaNewDesign2.0/ux-research-screenshots/bis-06-section.png) - Step 2 & 3 of the fitness system guide.
- [bis-07-section.png](file:///d:/NSBM/Projects%202.0/KaprukaNewDesign2.0/ux-research-screenshots/bis-07-section.png) - Step 4 of the system guide.
- [bis-08-section.png](file:///d:/NSBM/Projects%202.0/KaprukaNewDesign2.0/ux-research-screenshots/bis-08-section.png) - Newsletter subscribe form.
- [bis-09-section.png](file:///d:/NSBM/Projects%202.0/KaprukaNewDesign2.0/ux-research-screenshots/bis-09-section.png) - Detailed desktop footer.
- [bis-shop-01.png](file:///d:/NSBM/Projects%202.0/KaprukaNewDesign2.0/ux-research-screenshots/bis-shop-01.png) - Shop collection landing.
- [bis-product-detail.png](file:///d:/NSBM/Projects%202.0/KaprukaNewDesign2.0/ux-research-screenshots/bis-product-detail.png) - Clean product details page.
- [bis-add-to-cart-state.png](file:///d:/NSBM/Projects%202.0/KaprukaNewDesign2.0/ux-research-screenshots/bis-add-to-cart-state.png) - Add to cart action feedback.
- [bis-cart-clicked.png](file:///d:/NSBM/Projects%202.0/KaprukaNewDesign2.0/ux-research-screenshots/bis-cart-clicked.png) - Desktop cart menu state.
- [bis-mobile-viewport.png](file:///d:/NSBM/Projects%202.0/KaprukaNewDesign2.0/ux-research-screenshots/bis-mobile-viewport.png) - Mobile responsive screen.
- [bis-mobile-menu-active.png](file:///d:/NSBM/Projects%202.0/KaprukaNewDesign2.0/ux-research-screenshots/bis-mobile-menu-active.png) - Mobile responsive navigation menu.
