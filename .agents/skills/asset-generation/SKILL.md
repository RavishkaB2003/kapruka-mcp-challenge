---
name: asset-generation
description: >
  Activate when any module requires a visual asset — SVG, icon, background
  video, or 3D file (GLB/GLTF). Semi-automated: agent asks for a brief
  description then generates using the appropriate MCP. Never uses
  Antigravity's default nano banana generation for production assets.
  Universal — adapts to any project type and design direction.
  Always reads DESIGN.md and any UX research files before generating.
---

# Asset Generation Agent

## Identity
You generate production-quality visual assets using specialised MCPs.
You do NOT guess what the asset should look like — you ask first.
Every asset must match the project's confirmed design direction.

---

## Reference Files — Read Before Every Generation Session

- `@DESIGN.md` — colour palette, typography, visual style, brand personality
- `@.agents/project/PROJECT.md` — project type and target users

Then check the project root for UX research files:
```
ANALYSIS-*.md / *-NEW-DIRECTION.md / *-UX-RESEARCH.md / *-DESIGN-DIRECTION.md
```
If found, read them. Extract the visual language, animation style,
and any specific asset direction mentioned. All generated assets must
align with this research — not generic defaults.

---

## Asset Type Routing

Route every request to the correct MCP based on asset type:

| Asset Type | MCP to Use |
|---|---|
| UI icons (navigation, feature, action) | Icons8 MCP |
| Custom SVG illustrations / hero graphics | SVGMaker MCP |
| Background videos / ambient loops | mcp-video-gen (CogVideoX) |
| 3D models / objects (GLB/GLTF) | game-asset-mcp + Spline MCP |
| Optimise existing GLB/GLTF file | 3D Asset Processing MCP |
| Spline scene / interactive 3D | Spline MCP (via Spline skill) |

---

## Generation Protocol (Semi-Automated)

For every asset request, follow this exact sequence:

### Step 1 — Identify the need
Confirm:
- What module needs this asset?
- What is the asset's purpose in the UI?
- What is the asset type? (icon / SVG / video / 3D)

### Step 2 — Brief the user
Ask the user:
```
I need a brief for this asset before generating.
Please describe:
1. What should this [icon/SVG/video/3D model] show or represent?
2. What mood or feeling should it convey?
3. Any specific style notes? (e.g. minimal line art, bold filled, realistic, abstract)
4. Dimensions or format requirements? (e.g. 24x24 icon, 1920x1080 video, square 3D)
```
Wait for the user's response before proceeding.

### Step 3 — Confirm design alignment
Cross-reference the user's brief with DESIGN.md and any UX research files.
If there is a conflict (e.g. user asks for a cold blue icon but design direction
is warm terracotta), flag it:
> "Note: your brief requests [X] but the design direction in [file] specifies [Y].
> Should I follow the brief or the design direction?"

### Step 4 — Generate
Call the appropriate MCP with a well-crafted prompt.
The prompt must include:
- The user's brief
- The style from DESIGN.md (colour palette, visual language)
- The quality tier (production-ready, not placeholder)

### Step 5 — Save and reference
Save the generated asset to the correct subfolder:
```
public/assets/icons/       ← icons (PNG or SVG)
public/assets/svg/         ← custom SVG illustrations
public/assets/video/       ← background videos (MP4)
public/assets/3d/          ← 3D models (GLB/GLTF/OBJ)
public/assets/spline/      ← Spline scene exports
```

Report the saved path to the developer and show how to reference it in code.

---

## Section 1 — Icons (Icons8 MCP)

**When to use:** UI icons — navigation, feature highlights, action buttons,
category tiles, status indicators, social icons.

**MCP config (add to Antigravity MCP settings):**
```json
{
  "mcpServers": {
    "icons8mcp": {
      "command": "npx",
      "args": ["mcp-remote", "https://mcp.icons8.com/mcp/"]
    }
  }
}
```
For SVG delivery, add API key:
```json
{
  "args": [
    "mcp-remote",
    "https://mcp.icons8.com/mcp/",
    "--header",
    "Authorization:${AUTH_HEADER}"
  ],
  "env": { "AUTH_HEADER": "Bearer YOUR_ICONS8_API_KEY" }
}
```

**Generation approach:**
1. Identify the icon concept from the user brief
2. Search Icons8 for matching icons in the style that matches DESIGN.md
   (minimal, outlined, filled, coloured, etc.)
3. For prototyping: download PNG (free, no key needed, requires attribution)
4. For production: download SVG (requires Icons8 API key)
5. Save to `public/assets/icons/`

**Checklist before using a generated icon:**
- [ ] Icon style is consistent with all other icons in the project
- [ ] Icon size appropriate for its context (16px, 20px, 24px, 32px)
- [ ] SVG is clean — no unnecessary groups or hidden layers
- [ ] Colour matches DESIGN.md tokens (do not use icon's default colour if it clashes)
- [ ] Attribution added if using free PNG tier

---

## Section 2 — Custom SVG Illustrations (SVGMaker MCP)

**When to use:** Hero graphics, empty state illustrations, custom background
patterns, decorative elements, brand icons not found in icon libraries.

**MCP setup:**
```bash
npm install -g @genwave/svgmaker-mcp
```
Add to Antigravity MCP settings:
```json
{
  "mcpServers": {
    "svgmaker": {
      "command": "npx",
      "args": ["-y", "@genwave/svgmaker-mcp"],
      "env": { "SVGMAKER_API_KEY": "<your_svgmaker_api_key>" }
    }
  }
}
```
Get API key at `svgmaker.io` — free tier available.

**Generation approach:**
1. Craft a detailed prompt from the user brief + design direction:
   ```
   Generate a [style] SVG illustration of [subject].
   Style: [minimal/bold/illustrated/geometric/organic]
   Colours: use only [colours from DESIGN.md]
   Mood: [warm/energetic/calm/playful/professional]
   Output: production-ready SVG, clean paths, no raster elements
   ```
2. Generate the SVG
3. Review the output — if colours don't match DESIGN.md, edit them:
   Use `svgmaker_edit` tool: "Change all colours to match this palette: [hex values]"
4. Save to `public/assets/svg/`

**Checklist before using a generated SVG:**
- [ ] Colours match DESIGN.md palette exactly
- [ ] SVG is truly vector — no embedded raster images
- [ ] File size reasonable for web (under 100KB for most illustrations)
- [ ] SVG viewBox set correctly for responsive scaling
- [ ] No hardcoded pixel dimensions on the `<svg>` element
- [ ] Passes visual check at 1x and 2x scale

---

## Section 3 — Background Videos (mcp-video-gen)

**When to use:** Hero background videos, ambient scene loops, product
atmosphere videos, loading screen backgrounds.

**Setup:**
```bash
git clone https://github.com/kevinten-ai/mcp-video-gen.git
cd mcp-video-gen
uv sync
```

**Free provider — CogVideoX (use this first):**
- Completely free, unlimited usage
- Good quality for ambient/background videos
- Set provider to `cogvideox` in the generation call

**Generation approach:**
1. Craft a video prompt from the user brief + design direction:
   ```
   Generate a [duration]s ambient background video of [subject].
   Visual style: [cinematic/minimal/atmospheric/natural]
   Colour palette: [warm/cool/neutral — reference DESIGN.md colours]
   Motion: [slow pan/gentle drift/subtle movement/looping]
   Mood: [peaceful/energetic/luxurious/playful]
   No text, no people, no logos.
   Suitable for use as a website background with content overlaid.
   ```
2. Use CogVideoX provider (free) for first attempt
3. Video auto-downloads to local disk
4. Save to `public/assets/video/`

**Checklist before using a generated video:**
- [ ] Video loops smoothly (first and last frame are compatible)
- [ ] Motion is subtle enough not to distract from overlaid content
- [ ] No unwanted text, people, or logos in the video
- [ ] File size acceptable for web (compress with ffmpeg if over 5MB):
  ```bash
  ffmpeg -i input.mp4 -vcodec libx264 -crf 28 -preset slow output.mp4
  ```
- [ ] Video autoplay works muted (browsers require muted for autoplay)
- [ ] Poster image (first frame) extracted for preload:
  ```bash
  ffmpeg -i video.mp4 -frames:v 1 -q:v 2 poster.jpg
  ```
- [ ] Dark overlay or colour grade applied in CSS if needed for text readability

---

## Section 4 — 3D Models (game-asset-mcp + Spline MCP)

**When to use:** Decorative 3D objects, product 3D previews, ambient 3D
scene elements, interactive 3D components.

### 4A — Simple 3D Models (game-asset-mcp — Free via Hugging Face)

**Setup:**
```bash
git clone https://github.com/MubarakHAlketbi/game-asset-mcp.git
cd game-asset-mcp
npm install
# Add Hugging Face token to .env
HF_TOKEN=your_huggingface_token_here
```
Get free token at `huggingface.co/settings/tokens`

**Generation approach:**
1. Craft a 3D prompt from the user brief:
   ```
   Generate a 3D model of [object description].
   Style: [realistic/stylised/low-poly/minimal]
   Use case: web display (keep polygon count under 15,000 triangles)
   Format: GLB
   ```
2. Use `Hunyuan3D-2mini-Turbo` for fastest generation
3. Use `Hunyuan3D-2` for best quality
4. Model saves to `assets/` directory — move to `public/assets/3d/`

**After generation — always optimise:**
Run through 3D Asset Processing MCP to compress and validate:
- Validate the GLB structure is correct
- Compress geometry for web performance
- Confirm triangle count is within mobile budget

### 4B — Complex / Interactive 3D (Spline MCP)

**When to use:** Interactive Spline scenes, animated 3D elements,
event-triggered 3D animations, scenes that need to be embedded via
Spline's React component or exported as GLB for Three.js/R3F.

**Activate the globally installed Spline skill first:**
```
Use the Spline skill to create a [description] scene for [module].
```

**Spline MCP capabilities:**
- Export Spline scenes to GLB, GLTF, FBX, OBJ
- Import 3D models into existing Spline projects
- Create keyframe animations
- Create event-triggered animations (onClick, onHover)
- Manage Spline projects and scenes

**Checklist before using a generated 3D model:**
- [ ] GLB file loads in Three.js/R3F without errors
- [ ] Triangle count within budget (mobile: <15,000, desktop: <50,000)
- [ ] Textures are power-of-two dimensions (256, 512, 1024, 2048)
- [ ] Model is properly centred at origin [0,0,0]
- [ ] Scale is appropriate (not 1000x or 0.001x)
- [ ] All materials render correctly — no missing textures
- [ ] Animation data included if needed (verify in Three.js AnimationMixer)

---

## Section 5 — Automatic Asset Generation During Module Build

When the build agent creates a module that references assets
(e.g. `<img src="/assets/icons/cart.svg">` or `background-video.mp4`),
automatically trigger asset generation:

1. Detect the asset reference in the code being built
2. Identify the asset type from the file extension
3. Pause the build — announce:
   > "This module needs a [type] asset: [filename].
   > Let me generate it before continuing."
4. Run the brief → generate → save sequence
5. Resume the build with the real asset path

Never use placeholder paths that will result in broken assets at demo time.
Never use stock photos or random internet images.
Always generate assets that match the project's design direction.

---

## Issue Logging

If asset generation fails or produces unacceptable output:
```
## [ASSET-<YYYYMMDD>-<seq>] <Short title>
- **Module:** <module-name>
- **Asset type:** icon | svg | video | 3d
- **MCP used:** <mcp name>
- **Prompt used:** <the generation prompt>
- **Issue:** <what went wrong or why it's unacceptable>
- **Action taken:** retry | fallback | manual creation needed
- **Status:** OPEN | RESOLVED
```

Log to the nearest relevant issues file (ui-issues.md for visual assets).
