# Code Issues — Resolved Memory
## Agent Kit · Code Review Agent

Previously resolved code quality patterns for this project.
The Code Review agent reads this before every session.
If a pattern is listed here as resolved, do not re-flag it unless the fix has regressed.

---

<!-- Resolved entries appended below -->

## [CR-20260622-02] Missing JSDoc Comments — RESOLVED 2026-06-22
- Fix: Added detailed JSDoc documentation to `getIngredientsForProduct`, `getAllergensForProduct`, `generateGreetings`, and `performProductQuery` in `src/app/page.tsx`.

## [CR-20260622-03] Missing Server Action Rate-Limiting — RESOLVED 2026-06-22
- Fix: Implemented an in-memory sliding-window `InMemoryRateLimiter` class inside `src/app/actions.ts` with custom limits (60/min for delivery checks, 5/min for checkout actions) and applied it to client IP addresses using Next.js `headers()`.

## [CR-20260622-01] No Automated Tests — RESOLVED 2026-06-22
- Fix: Set up Vitest testing suite in the project. Added test scripts in `package.json`, created `vitest.config.ts`, extracted pure business helpers from `page.tsx` into `src/lib/gifting-helpers.ts` for clean imports, and wrote 23 unit test specs covering regex-based parsing intents, prefill data extraction, greeting note generators, rate limiters, and product ingredient specs.
