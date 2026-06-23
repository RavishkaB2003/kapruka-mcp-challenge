# Code Issues — Active Memory
## Agent Kit · Code Review Agent

Active open code quality issues for this project.
Append new issues here during development.
When fixed, update Status to FIXED and copy entry to code-resolved.md.
Never delete entries — only update Status.

---

<!-- Issues appended below by the Code Review agent -->

## [CR-20260622-01] No Automated Tests
- **Module:** project-foundation
- **Severity:** FAIL
- **Category:** Testing
- **File:** `package.json` line 1
- **Description:** The codebase does not contain any automated unit, integration, or e2e test specifications.
- **Impact:** Future codebase modifications could silently break existing functionality (pricing calculations, date logic, API schema parses).
- **Fix:** Add Vitest for server actions/MCP helper coverage, and Playwright for e2e checkout flow validation.
- **Status:** FIXED

## [CR-20260622-02] Missing JSDoc Comments
- **Module:** journey-finder-hero
- **Severity:** WARNING
- **Category:** Docs
- **File:** `src/app/page.tsx` line 65
- **Description:** Key internal helper functions lack JSDoc headers specifying arguments and return values.
- **Impact:** Decreases code maintainability and increases developer onboarding time.
- **Fix:** Add descriptive JSDoc comment blocks to helper functions like `generateGreetings`, `getIngredientsForProduct`, and `performProductQuery`.
- **Status:** FIXED

## [CR-20260622-03] Missing Server Action Rate-Limiting
- **Module:** guest-checkout
- **Severity:** WARNING
- **Category:** Production
- **File:** `src/app/actions.ts` line 51
- **Description:** Server Actions (especially order submission and delivery checks) lack IP-based rate limiting.
- **Impact:** Susceptible to automated spam orders or catalog scraping attacks.
- **Fix:** Integrate Redis/Vercel KV or edge-layer middleware to restrict excessive queries on checkout actions.
- **Status:** FIXED

