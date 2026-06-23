---
name: deployment
description: >
  Activate during /deploy workflow. Covers Vercel, Netlify, and Railway.
  Detects the confirmed platform from STACK.md and runs the correct
  deployment checklist. Covers environment setup, build verification,
  domain configuration, and post-deployment checks.
---

# Deployment Agent

## Identity
You guide the deployment of the application to the confirmed platform.
You run commands, verify configuration, and confirm the deployment is live and healthy.

---

## Pre-deployment — Read First
- `@.agents/project/STACK.md` — confirmed deployment platform and stack
- `@.agents/project/PROJECT.md` — project name and type
- `@.agents/memory/issues/security-issues.md` — confirm no CRITICAL/HIGH open

**Block if any CRITICAL or HIGH security issues are open.**

---

## Step 1 — Build Verification

Before deploying anywhere, verify the build passes locally:

```bash
# Web projects
npm run build        # Next.js, Nuxt, SvelteKit, Vite
npm run typecheck    # TypeScript projects
npm run lint         # ESLint/Biome

# Python projects
python -m pytest
pip install -r requirements.txt

# Laravel
composer install --no-dev
php artisan config:cache
```

Fix any build errors before proceeding. A broken build must never be deployed.

---

## Step 2 — Environment Variables Checklist

Read `STACK.md` for the list of required environment variables.

For EVERY required variable:
- [ ] Confirmed set in the deployment platform's environment settings
- [ ] Value is the production value — not dev/local value
- [ ] No trailing spaces or quotes accidentally included

Common variables to always check:
- Database connection string
- Auth secret / JWT secret
- API keys for external services
- Public app URL (must match actual domain)
- Node environment: `NODE_ENV=production`

---

## VERCEL DEPLOYMENT

*Run this section if STACK.md confirms Vercel as the deployment platform.*

### Vercel Setup (first deployment)
```bash
# Install Vercel CLI if not present
npm install -g vercel

# Login
vercel login

# Link project (run from project root)
vercel link
```

### Vercel Environment Variables
```bash
# Set each variable for production
vercel env add <VARIABLE_NAME> production

# Or pull existing and verify
vercel env pull .env.production.local
```

### Vercel Deployment
```bash
# Deploy to preview (staging)
vercel

# Deploy to production
vercel --prod
```

### Vercel Configuration Checklist
- [ ] `vercel.json` present if custom routes/rewrites needed
- [ ] Build command correct in Vercel dashboard (or `vercel.json`)
- [ ] Output directory correct (`.next` for Next.js, `dist` for Vite etc.)
- [ ] Node.js version pinned in `vercel.json` or `package.json` engines field
- [ ] Serverless function regions set appropriately for target users
- [ ] Custom domain configured if applicable
- [ ] `www` redirect configured (www → apex or apex → www, consistent)

### Vercel Post-deployment
```bash
# Verify deployment
vercel ls          # list deployments
vercel inspect     # inspect latest deployment
```
Open the deployment URL and run post-deployment checks.

---

## NETLIFY DEPLOYMENT

*Run this section if STACK.md confirms Netlify as the deployment platform.*

### Netlify Setup (first deployment)
```bash
# Install Netlify CLI if not present
npm install -g netlify-cli

# Login
netlify login

# Initialise (run from project root)
netlify init
```

### Netlify Environment Variables
```bash
# Set via CLI
netlify env:set <VARIABLE_NAME> <value>

# Or verify via dashboard: Site settings → Environment variables
```

### Netlify Configuration
Create `netlify.toml` at project root:
```toml
[build]
  command = "npm run build"
  publish = ".next"           # or "dist", "out", "build" depending on framework

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200               # for SPA routing — remove for SSR apps

[functions]
  directory = "netlify/functions"   # if using Netlify Functions
```

### Netlify Deployment
```bash
# Deploy to draft URL (staging)
netlify deploy

# Deploy to production
netlify deploy --prod
```

### Netlify Checklist
- [ ] `netlify.toml` build command and publish directory correct
- [ ] Node version pinned
- [ ] Redirect rules configured for routing (SPA vs SSR)
- [ ] Form handling configured if using Netlify Forms
- [ ] Custom domain configured and DNS verified
- [ ] HTTPS forced (Netlify → Domain management → Force HTTPS)

---

## RAILWAY DEPLOYMENT

*Run this section if STACK.md confirms Railway as the deployment platform.*

### Railway Setup (first deployment)
```bash
# Install Railway CLI if not present
npm install -g @railway/cli

# Login
railway login

# Initialise (run from project root)
railway init
```

### Railway Environment Variables
```bash
# Set variable
railway variables set <VARIABLE_NAME>=<value>

# List all variables
railway variables
```

### Railway Services Configuration
Railway deploys each service (web, database, worker) separately.

**Web service:**
```bash
# Link to existing service or create new
railway service

# Deploy
railway up
```

**Database service (if using Railway PostgreSQL/MySQL):**
- Create database service in Railway dashboard
- Copy `DATABASE_URL` from Railway into web service variables

### Railway Configuration Checklist
- [ ] `Procfile` or `railway.json` present with correct start command
- [ ] `PORT` environment variable used in application (Railway assigns port dynamically)
  ```javascript
  const port = process.env.PORT || 3000
  ```
- [ ] Health check path configured in Railway service settings
- [ ] Database service created and `DATABASE_URL` linked to web service
- [ ] Custom domain configured if applicable
- [ ] Auto-deploy from git branch configured (main → production)
- [ ] Restart policy set to `always` for production services

### Railway Deployment
```bash
# Deploy current directory
railway up

# View logs
railway logs

# Open deployed app
railway open
```

---

## Post-deployment Verification (all platforms)

After deployment completes, run these checks regardless of platform:

```
1. Health check
   GET <production-url>/                    → expect 200

2. Auth check
   Attempt login with a test account        → expect successful session

3. Database check
   Trigger a read operation in the UI       → expect data to load

4. Key feature check
   Complete the most critical user flow     → expect success end-to-end

5. Error tracking
   Confirm your error tracking tool         → expect it shows the deployment
   (Sentry, LogRocket, etc.)

6. Environment check
   Confirm NODE_ENV=production              → no dev tools, no debug output

7. HTTPS check
   Confirm site loads on https://           → no mixed content warnings

8. Performance baseline
   Run Lighthouse on production URL         → note scores for future reference
   Compare against budgets in @.agents/skills/web-optimization/SKILL.md
```

---

## Rollback Procedure

If the deployment is broken:

**Vercel:**
```bash
vercel rollback     # rolls back to previous deployment
```

**Netlify:**
```bash
netlify deploy --restore  # or restore from Netlify dashboard → Deploys tab
```

**Railway:**
```bash
# Redeploy a previous commit
git revert HEAD
git push
# Railway auto-deploys on push
```

---

## Report Format
```
# Deployment Report — <date>
## Platform: Vercel | Netlify | Railway
## Environment: staging | production
## URL: <live URL>
## Status: SUCCESS | FAILED | ROLLED BACK

## Environment Variables: N/N confirmed
## Build: PASS | FAIL
## Post-deployment checks:
- Health check: PASS | FAIL
- Auth check: PASS | FAIL
- Database check: PASS | FAIL
- Key feature: PASS | FAIL
- HTTPS: PASS | FAIL
- Error tracking: ACTIVE | NOT CONFIGURED

## Issues found
[list or "None"]

## Next steps
[any follow-up actions needed]
```
