# Kapruka Conversational Gifting Concierge

A next-generation conversational gifting application for sending cakes, flowers, chocolates, and groceries to loved ones in Sri Lanka. It combines a conversational AI chatbot with an immersive visual shopping workspace, integrating directly with official Kapruka delivery and order APIs.

---

## 🌟 Key Features

1. **Preloader & Curtain Reveal**: Interactive SVG Sri Lanka district network drawing animation, which fades and splits open via GSAP to reveal the main screen without visual flash.
2. **Scrubbable Video Timeline**: Parallax scroll-snapping layout where scrolling drives background video playback and panel slides.
3. **Conversational AI (English & Sinhala/Tanglish)**: Uses Gemini AI models to parse inputs like *"check delivery to Negombo"* or *"Galle search cakes"* in English, Sinhala Unicode, and Tanglish (e.g. *"delivery Galle wala keeyada"*).
4. **Dynamic Cake Customizer**: Allows users to specify cake weight, flavor, and frosting icing text in real-time, instantly checking pricing and delivery availability.
5. **Dynamic Catalog Discovery**: High-contrast, premium asymmetric card grids mapped to categories (groceries in moss-green, cakes/flowers in terracotta) showing products fetched directly from the backend.
6. **Guest Checkout**: A 3-step shipping form supporting address checking, wrapping selections, greeting card notes, and generating click-to-pay checkout links.
7. **Animated Lorry Delivery Tracker**: Visual SVG delivery lorry animation showing current order status (Baking, Dispatched, Out for Delivery) driven by real tracking states.

---

## 🛠️ Technology Stack

* **Framework**: Next.js 15 (App Router, Client/Server Components)
* **Language**: TypeScript (Strict typing, Union types)
* **Styling**: Tailwind CSS (PostCSS)
* **Animations**: GSAP (GreenSock Animation Platform), Framer Motion
* **Libraries**: Cobe (WebGL Globe, helper references), Lucide Icons, Lenis
* **Testing**: Vitest (Unit testing suite)

---

## 📦 MCP Integration (Model Context Protocol)

This application communicates with the Kapruka Model Context Protocol server (`https://mcp.kapruka.com/mcp`) via SSE (Server-Sent Events) to expose the following endpoints as JSON-RPC methods:
* `kapruka_list_categories`: List store categories.
* `kapruka_search_products`: Search product catalogues.
* `kapruka_list_delivery_cities`: Fetch deliverable cities in Sri Lanka.
* `kapruka_check_delivery`: Validate delivery slot rates and dates.
* `kapruka_create_order`: Submit shopping payloads and retrieve gateways.
* `kapruka_track_order`: Monitor delivery milestones.

---

## 🚀 Setup & Installation

### Prerequisites
* Node.js 18.0.0 or higher
* npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/RavishkaB2003/kapruka-mcp-challenge.git
   cd kapruka-mcp-challenge
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment Variables:
   Create a `.env` file in the root directory and add your credentials (see `.env.example`):
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   KAPRUKA_MCP_ENDPOINT=https://mcp.kapruka.com/mcp
   ```

---

## ⚙️ Available Scripts

Run the following scripts in the project directory:

### Development Mode
Runs the local Next.js development server:
```bash
npm run dev
```

### Production Build
Compiles and generates the optimized production build:
```bash
npm run build
```

### Run Tests
Runs the Vitest unit tests:
```bash
npm run test
```

---

## 📄 License
This project is proprietary and confidential. All rights reserved.
