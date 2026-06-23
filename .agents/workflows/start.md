# /start Workflow
## Project Onboarding — Initialises a new project from scratch

---

## Trigger
User types `/start` or any equivalent like "lets start building", "start a new project",
"lets build", or "initialise project".

---

## Overview
This workflow gathers everything needed to understand the project, proposes
a complete architecture and design plan, and waits for approval before
any code is written. At the end of this workflow four files are generated:
`PROJECT.md`, `STACK.md`, `MODULES.md`, and `DESIGN.md`.

---

## Phase 1 — Project Discovery

Ask the following questions. Ask them conversationally — not all at once.
Group them naturally. Wait for answers before moving to the next group.

### Group A — Project Identity
```
1. What type of project is this?
   (e.g. ecommerce store, SaaS dashboard, inventory system, booking platform,
    mobile app, REST API, internal tool, portfolio, social platform, other)

2. What is the core purpose of this application in one or two sentences?

3. Who are the end users? (e.g. customers, staff, admins, general public)

4. Do you have any existing documents, briefs, or URLs that describe
   the project? If yes, share them now — upload files or paste links.
```

After receiving answers to Group A, read any uploaded documents or fetch
any provided URLs before continuing. Extract all relevant requirements.

### Group B — Features and Requirements
```
5. List the core features this application must have.
   (take as many as the user provides — do not limit)

6. Are there any features that are explicitly OUT of scope for now?

7. Does the application need user authentication?
   If yes — what types? (email/password, Google OAuth, magic link, SSO, other)

8. Does the application need a database?
   If yes — what kind of data will be stored?
   (user data, products, orders, files, real-time data, etc.)

9. Does the application need to integrate with any external services?
   (payment gateways, email providers, SMS, maps, AI APIs, etc.)

10. Are there any performance requirements?
    (expected concurrent users, response time targets, uptime SLA)
```

### Group C — Tech Stack Preferences
```
11. Do you have a preferred frontend framework?
    (Next.js, React, Vue, Nuxt, SvelteKit, Flutter, React Native, other, no preference)

12. Do you have a preferred backend/API approach?
    (Next.js API routes, Express, FastAPI, Django, Laravel, Supabase, Firebase, other)

13. Do you have a preferred database?
    (PostgreSQL, MySQL, MongoDB, SQLite, Supabase, PlanetScale, Firebase, other)

14. Do you have a preferred deployment platform?
    (Vercel, Netlify, Railway, other, not sure yet)

15. Any other tools or services already decided?
    (e.g. Stripe for payments, Resend for email, Cloudinary for images, etc.)
```

### Group D — Design Direction
```
16. What visual style do you want?
    (minimal, bold, professional, playful, luxury, dark, light, other)

17. Do you have any brand colours, fonts, or a logo?
    If yes — share them now.

18. Are there any websites or apps whose design you admire?
    Share URLs or names for reference.

19. What level of animation do you want?
    (none, subtle micro-interactions, moderate, rich/immersive)

20. Is there a specific design system or component library you want to use?
    (shadcn/ui, Material UI, Chakra, Tailwind only, Ant Design, other, no preference)
```

---

## Phase 2 — UI/UX Skill Cross-Reference

After collecting all answers, announce:
> "Checking the UI/UX skill against your requirements..."

Check if `ui-ux-pro-max-skill` is installed globally:
```bash
# Check for global installation
ls ~/.antigravity/skills/ | grep ui-ux-pro-max || \
ls /usr/local/share/antigravity/skills/ | grep ui-ux-pro-max || \
echo "NOT_FOUND"
```

**If found:**
Activate the skill and cross-reference:
- The project type against the skill's recommended design patterns
- The visual style preference against the skill's style library
- The animation level against the skill's interaction patterns
- The component library choice against the skill's component recommendations
Output a design direction summary based on the cross-reference.

**If NOT found:**
Inform the user:
> "`ui-ux-pro-max-skill` is not installed globally. Install it with:
> `antigravity skill install https://github.com/nextlevelbuilder/ui-ux-pro-max-skill --global`
> Continuing with built-in design reasoning."

Then proceed using built-in design reasoning based on the user's answers.

---

## Phase 3 — Architecture Planning

Based on all gathered information, produce the following plan:

### 3A — Tech Stack Recommendation
If the user had no preference on some choices, recommend the best fit based on:
- Project type and scale
- Other chosen technologies (avoid mixing incompatible stacks)
- Production-readiness and deployment platform
- Developer experience and community support

Present the full confirmed stack clearly in a table.

### 3B — Production Layer Plan
For every applicable layer from the list below, state what tool/approach
will be used and why. Skip layers that genuinely don't apply.

```
Frontend:              [framework + component library + styling]
API & Backend Logic:   [approach + key patterns]
Database & Storage:    [database + ORM/client + file storage]
Auth & Permissions:    [auth provider + session strategy + RBAC approach]
Hosting & Deployment:  [platform + environment strategy]
Cloud & Compute:       [if applicable]
CI/CD & Version Control: [branch strategy + automated checks]
Security & RLS:        [key security measures + row-level security if DB supports it]
Rate Limiting:         [strategy + tool]
Caching & CDN:         [what gets cached + CDN approach]
Error Tracking & Logs: [error tracking tool + logging approach]
Availability & Recovery: [health checks + backup strategy]
```

### 3C — Module Plan
Break the entire application into modules. For each module:
- Name (kebab-case)
- Type (frontend | backend | fullstack | infrastructure)
- Description (one sentence)
- Dependencies (which other modules it needs)
- Priority (P1 = must have MVP | P2 = important | P3 = nice to have)

Present the modules in build order (dependencies first).
Group into phases:
- Phase 1: Foundation (auth, database, core layout, routing)
- Phase 2: Core Features (the main functionality)
- Phase 3: Enhancement (secondary features, optimisation)

### 3D — Design Proposal
Propose the visual design system:
- Colour palette (primary, secondary, accent, background, text, border, semantic)
- Typography (font family, scale, weights)
- Spacing scale
- Border radius tokens
- Component style direction
- Animation level and approach
- Key screen layouts (describe the main screens at a high level)

---

## Phase 4 — Full Plan Presentation

Present everything from Phase 3 in a single clear output:

```
# Project Plan: <Project Name>
## Ready for your approval

### Confirmed Tech Stack
[table]

### Production Layer Plan
[all applicable layers]

### Module Plan — <N> modules across <N> phases
[module list with phases]

### Design System
[design tokens and direction]

### What happens after you approve:
- DESIGN.md will be generated with the full design system
- PROJECT.md, STACK.md, and MODULES.md will be generated
- You can then run /module-cycle <first-module-name> to start building

---
Type APPROVE to confirm and generate all context files.
Type CHANGE followed by what you want to adjust to modify the plan.
```

---

## Phase 5 — Generate Context Files (only after APPROVE)

After the user types APPROVE (or equivalent confirmation):

### Generate PROJECT.md
Save to `.agents/project/PROJECT.md`:
```markdown
# PROJECT.md — <Project Name>
## Generated by /start on <date>

## Project Identity
- **Name:** <name>
- **Type:** <type>
- **Purpose:** <core purpose>
- **Users:** <target users>

## Core Features
[numbered list of all confirmed features]

## Out of Scope
[list]

## External Integrations
[list with purpose of each]

## Performance Requirements
[targets if specified]

## Design References
[URLs or names provided]

## Notes
[anything else gathered during onboarding]
```

### Generate STACK.md
Save to `.agents/project/STACK.md`:
```markdown
# STACK.md — <Project Name>
## Generated by /start on <date>

## Full Tech Stack
[complete table: Layer | Technology | Version/Notes]

## Production Layer Decisions
[full layer plan from Phase 3B]

## Environment Variables Required
[list all env vars the stack will need — values left blank]

## Key Dependencies
[list npm/pip/composer packages that are confirmed]
```

### Generate MODULES.md
Save to `.agents/project/MODULES.md`:
```markdown
# MODULES.md — <Project Name>
## Generated by /start on <date>

## Build Status
- Total modules: N
- Completed: 0
- In progress: 0
- Not started: N

## Phase 1 — Foundation
| # | Module | Type | Description | Dependencies | Priority | Status |
|---|--------|------|-------------|--------------|----------|--------|
[rows]

## Phase 2 — Core Features
[rows]

## Phase 3 — Enhancement
[rows]

## Module Detail
[one section per module with full description, acceptance criteria, and API contracts if applicable]
```

### Generate DESIGN.md
Save to `DESIGN.md` at project root:
```markdown
# DESIGN.md — <Project Name>
## Generated by /start on <date>

[Full design system based on Phase 3D proposal]
[Include: colour tokens, typography, spacing, radius, component specs,
 animation config, screen layout map, Tailwind config if applicable]
```

---

## Phase 6 — Kickoff

After all four files are generated, output:

```
✅ Project initialised successfully.

Files generated:
- DESIGN.md
- .agents/project/PROJECT.md
- .agents/project/STACK.md
- .agents/project/MODULES.md

## Your first module is: `<first-module-name>`

Run: /module-cycle <first-module-name>

Or run /status at any time to see the full build plan.
```
