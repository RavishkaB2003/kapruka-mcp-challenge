# /deploy Workflow
## Deployment — Vercel · Netlify · Railway

---

## Trigger
User types `/deploy`

---

## Pre-flight

Read:
- `@.agents/project/PROJECT.md`
- `@.agents/project/STACK.md`
- `@.agents/memory/issues/security-issues.md`

**Block deployment if any CRITICAL or HIGH security issues are open.**
Inform user: `"<N> critical/high security issues must be resolved before deploying.
Run /audit to review them."`

**Block deployment if any CRITICAL optimization issues are open.**
Inform user: `"<N> critical performance issues must be resolved before deploying.
Run the full optimization audit: @.agents/skills/web-optimization/SKILL.md"`

Confirm with user:
```
1. Which environment are we deploying to? (staging | production)
2. Has /audit been run since the last major change? (yes | no)
3. Has the full optimization audit been run? (yes | no)
4. Is the codebase committed and pushed to the correct branch? (yes | no)
```

---

## Activate Deployment Skill

Activate `@.agents/skills/deployment/SKILL.md`.

The deployment skill will detect the confirmed platform from `STACK.md`
and run the correct deployment checklist.

---

## Pre-deployment Optimization Audit

Before the deployment skill runs, activate the full optimization audit:

Activate `@.agents/skills/web-optimization/SKILL.md` — run the **full
pre-deployment audit** (all 12 sections across all completed modules).

**If CRITICAL issues found:** block deployment until fixed.
**If WARNINGS only:** log them, proceed with deployment, fix after.

---

## Post-deployment Verification

After deployment completes:

1. **Health check** — hit the app's root URL, confirm 200 response
2. **Auth check** — confirm login/signup flow works in production
3. **Database check** — confirm a read operation works (not just connection)
4. **Key feature check** — test the single most critical user flow end-to-end
5. **Error tracking** — confirm error tracking tool is receiving events
6. **Environment variables** — confirm all required env vars are set
   (check for missing vars by looking for 500 errors or undefined behaviour)
7. **Performance baseline** — run Lighthouse on production URL and record
   scores for Performance, Accessibility, SEO, and Best Practices.
   Compare against performance budgets in `@.agents/skills/web-optimization/SKILL.md`.

Output deployment summary:
```
# Deployment Summary — <date>
## Environment: staging | production
## Platform: <platform>
## URL: <live URL>
## Status: SUCCESS | FAILED

## Post-deployment checks
- Health check: PASS | FAIL
- Auth check: PASS | FAIL
- Database check: PASS | FAIL
- Key feature check: PASS | FAIL
- Error tracking: ACTIVE | NOT CONFIGURED
- Lighthouse Performance: <score>
- Lighthouse Accessibility: <score>
- Lighthouse SEO: <score>

## Issues found post-deployment
[list any, or "None"]
```
