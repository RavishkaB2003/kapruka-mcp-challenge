# /audit Workflow
## Full Security Audit — Run at Major Milestones

---

## Trigger
User types `/audit`
Recommended at: end of Phase 1, end of Phase 2, before any production deployment.

---

## What This Does
A full cross-module security sweep. Unlike the lightweight per-module security
check in the spiral, this audit looks at the entire system holistically —
finding issues that only appear when modules interact with each other.

---

## Pre-flight

Read:
- `@.agents/project/PROJECT.md`
- `@.agents/project/STACK.md`
- `@.agents/project/MODULES.md`
- `@.agents/memory/issues/security-issues.md`
- `@.agents/memory/resolved/security-resolved.md`

List all modules currently marked COMPLETE in `MODULES.md`.
The audit covers only completed modules.

---

## Audit Steps

### Step 1 — Dependency Audit
```bash
# Node.js projects
npm audit --audit-level=high

# Python projects
pip-audit

# PHP projects
composer audit
```
Log any HIGH or CRITICAL findings to `security-issues.md`.

### Step 2 — Activate Full Security Skill
Activate `@.agents/skills/security/SKILL.md`.
Run the complete checklist — all sections.

### Step 3 — Cross-module Review
Check for issues that span modules:
- [ ] Auth tokens generated in one module — correctly validated in all other modules
- [ ] Database queries across modules — all use parameterised queries, none raw string concat
- [ ] Shared utilities — no security-sensitive logic duplicated inconsistently
- [ ] Environment variables — all secrets server-side only, none leaked to client bundles
- [ ] API endpoints across all modules — all have auth checks where required
- [ ] Rate limiting — applied consistently, not just on some endpoints
- [ ] CORS configuration — correctly scoped, no wildcard `*` in production
- [ ] Error messages — none leak stack traces, database names, or internal paths to client

### Step 4 — Report
Output:
```
# Security Audit Report — <date>
## Modules audited: N
## Critical: N · High: N · Medium: N · Low: N

## Blocking Issues (must fix before deployment)
[list with SEC issue IDs]

## Recommended Fixes
[list with SEC issue IDs]

## Passed
[summary of clean areas]
```

### Step 5 — Log Issues
All findings → `security-issues.md`
After fixes → move to `security-resolved.md`
