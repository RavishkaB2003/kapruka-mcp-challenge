# /module-cycle Workflow
## Evolutionary Spiral Model — One Full Turn Per Module

---

## Trigger
User types `/module-cycle <module-name>`
Example: `/module-cycle user-auth`

---

## Pre-flight Check

Before starting, read:
- `@.agents/project/PROJECT.md`
- `@.agents/project/STACK.md`
- `@.agents/project/MODULES.md`
- `@DESIGN.md`
- `@.agents/memory/issues/code-issues.md`
- `@.agents/memory/resolved/code-resolved.md`
- `@.agents/memory/issues/optimization-issues.md`
- `@.agents/memory/resolved/optimization-resolved.md`

Confirm the requested module exists in `MODULES.md`.
Confirm all dependencies of this module are marked COMPLETE in `MODULES.md`.
If a dependency is not complete, stop and inform the user:
> "`<dependency-module>` must be completed before `<this-module>` can be built."

---

## The Spiral

```
1. PLAN     → Define scope, acceptance criteria, risks
2. BUILD    → Write all code for the module
3. REVIEW   → Code Review agent runs
4. UI       → UI Review agent runs (if module has UI)
5. TEST     → Testing agent runs
6. PERF     → Performance check runs (soft gate with exceptions)
7. SECURE   → Lightweight security check runs
8. COMPLETE → Log completion, update MODULES.md
```

---

## Step 1 — Plan

Output a Module Scope Document:

```markdown
# Module Scope: <module-name>
**Date:** <today>
**Type:** frontend | backend | fullstack | infrastructure

## What this module does
<2–3 sentences>

## Acceptance criteria
- [ ] <specific, testable criterion>
- [ ] <specific, testable criterion>
- [ ] ...

## Files to be created
<list all files with paths>

## API contracts (if applicable)
<endpoints, request/response shapes>

## Database changes (if applicable)
<schema additions, migrations needed>

## Environment variables needed
<any new env vars this module requires>

## Dependencies on other modules
<list>

## Risk assessment
| Risk | Likelihood | Mitigation |
|------|-----------|-----------|
| <risk> | Low/Med/High | <how to handle it> |

## Production considerations
- Auth/permissions: <how this module handles access control>
- Rate limiting: <if this module has endpoints>
- Caching: <what can be cached>
- Error handling: <key error scenarios>
```

**PAUSE — wait for developer approval before building.**

---

## Step 2 — Build

After scope approval, build the module.

### Universal build order (always follow this sequence):

1. **Types/interfaces/schemas first**
   Define all data shapes before writing any logic.
   Backend: database schemas + API types
   Frontend: component props + state types

2. **Database layer** (if applicable)
   Migrations, schema definitions, seed data if needed.

3. **Backend/API layer** (if applicable)
   Server routes, controllers, service functions.
   Every endpoint must have: input validation, auth check, error handling, typed response.

4. **Business logic layer**
   Pure functions, utilities, transformers.
   No framework dependencies — easily unit testable.

5. **Frontend components** (if applicable)
   Build shared/reusable components first, then composites.
   Every component uses design tokens from `DESIGN.md` — never hardcoded values.

6. **Integration layer**
   Wire frontend to backend. Wire backend to database.

7. **Public exports**
   Index files, API route registrations, module exports.

8. **Tests**
   Unit tests for business logic.
   Integration tests for API endpoints.
   Component tests for UI.

### At each file: confirm it compiles/lints without errors before moving on.

---

## Step 3 — Code Review

Announce: `"Build complete. Running Code Review."`

Activate `@.agents/skills/code-review/SKILL.md`.

**If FAIL:**
- Fix all blocking issues
- Update `code-issues.md` — mark fixed items as `Status: FIXED`
- Append to `code-resolved.md`
- Re-run only the failed sections

**If PASS or PASS WITH WARNINGS:** → Step 4

---

## Step 4 — UI Review

*Skip this step if the module has no UI (pure backend/infrastructure modules).*

Announce: `"Code Review passed. Running UI Review."`

Activate `@.agents/skills/ui-review/SKILL.md`.

**If FAIL:**
- Fix all blocking issues
- Update `ui-issues.md` and `ui-resolved.md`
- Re-run failed sections

**If PASS:** → Step 5

---

## Step 5 — Testing

Announce: `"Running Testing agent."`

Activate `@.agents/skills/testing/SKILL.md`.

Testing approach depends on module type:
- **Backend module:** run unit + integration tests in terminal
- **Frontend module:** open application in browser, run visual + interaction tests,
  take screenshots of key states
- **Fullstack module:** both of the above
- **Infrastructure module:** verify configuration, run health checks

**If BLOCKER failures:**
- Fix all blockers
- Update `test-issues.md` and `test-resolved.md`
- Re-run failed tests only

**If PASS:** → Step 6

---

## Step 6 — Performance Check

Announce: `"Running Performance Check."`

Activate `@.agents/skills/web-optimization/SKILL.md` — run the per-module
checklist for the completed module.

This is a **soft gate with exceptions:**
- ⚠️ WARNING issues are logged but do NOT block module completion
- ❌ CRITICAL issues block module completion (see the optimization skill
  for the full list of critical blockers)

**If CRITICAL issues found:**
- Fix all critical issues
- Update `optimization-issues.md` — mark fixed items as `Status: FIXED`
- Append to `optimization-resolved.md`
- Re-run only the failed sections

**If PASS or PASS WITH WARNINGS:** → Step 7

---

## Step 7 — Security Check (lightweight, per module)

For every module that has any of the following, run a lightweight security check:
- User input (any form, search, upload)
- Authentication or authorisation logic
- Database queries
- External API calls
- File handling
- Environment variable access

Activate `@.agents/skills/security/SKILL.md` — run only the sections
relevant to what this module does. Not the full audit (that is `/audit`).

**If CRITICAL or HIGH:** fix immediately before completing.

---

## Step 8 — Module Complete

Announce: `"✅ Module <module-name> COMPLETE."`

1. Update `MODULES.md` — change module status to `COMPLETE`
2. Append to `test-resolved.md`:
```
## MODULE COMPLETE: <module-name> — <date>
- Type: frontend | backend | fullstack | infrastructure
- Code Review: PASS
- UI Review: PASS | N/A
- Testing: PASS
- Performance Check: PASS | PASS WITH WARNINGS | N/A
- Security check: PASS | WARNINGS ACCEPTED
- Notes: <any accepted warnings>
```

3. Output next step:
```
## Next module
<next-module-name> — <description>

Run: /module-cycle <next-module-name>
Or run /status to see full build progress.
```

---

## Testing Approach by Platform

### Web (Next.js, Nuxt, SvelteKit etc.)
- Run dev server: `npm run dev` (or equivalent)
- Open browser at `localhost:<port>`
- Navigate to the module's route
- Test all acceptance criteria interactively
- Check browser console for errors
- Resize to mobile (375px) and tablet (768px)
- Take screenshots of: default state, loading state, error state, success state

### Backend API (Express, FastAPI, Django, Laravel etc.)
- Run server in dev mode
- Use terminal or built-in HTTP client to hit each endpoint
- Test: happy path, missing fields, invalid input, unauthorised access
- Verify response shapes match API contracts in scope document
- Check logs for unhandled errors

### Mobile (React Native, Flutter)
- Run on simulator/emulator
- Test on both iOS and Android profiles if applicable
- Check layout on small (375px) and large (414px) screen sizes

### Full-stack
- Run both frontend and backend
- Test the complete user flow end-to-end
- Verify data flows correctly from UI → API → database → back to UI

---

## Systemic Issue Protocol

If any agent discovers an issue that affects multiple modules
(wrong config, broken shared utility, schema error, missing env var):

1. STOP the current module cycle
2. Fix the root cause
3. Tag the fix as `SYSTEMIC` in the relevant resolved file
4. List which already-completed modules may be affected
5. Re-test those modules' relevant sections
6. Resume the current module cycle
