# Vercel Deploy Guide

How Zen Berry is deployed from GitHub to Vercel with CI/CD automation.

---

## Prerequisites

- GitHub repository with `main`/`master` branch
- Vercel account (connected to GitHub)
- Node.js 20 (used in CI pipelines)

---

## One-Time Vercel Setup

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import the GitHub repository
3. Configure **Environment Variables** (must match CI secrets):

   | Variable | Source |
   |----------|--------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase project settings |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project settings |
   | `GEMINI_API_KEY` | Google AI Studio |

4. Deploy once manually to seed the Vercel project

---

## GitHub Secrets

Add these to GitHub **Settings → Secrets and variables → Actions**:

| Secret | Purpose |
|--------|---------|
| `VERCEL_TOKEN` | Vercel API token (generate in Vercel Account → Tokens) |
| `VERCEL_ORG_ID` | Vercel team ID (found in project Settings) |
| `VERCEL_PROJECT_ID` | Vercel project ID (found in project Settings) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL (for build step) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (for build step) |
| `GEMINI_API_KEY` | Gemini API key (for build step) |

---

## CI/CD Pipelines

Zen Berry uses **3 GitHub Actions workflows** in `.github/workflows/`:

### 1. Frontend CI (`frontend-ci.yml`)

**Triggers:** PR or push to `main`, `master`, `develop`

```
Pull Request / Push
        │
        ▼
┌───────────────────────┐
│  lint-and-typecheck   │
│  ───────────────────  │
│  • ESLint (continue   │
│    on error)          │
│  • tsc --noEmit       │
└──────────┬────────────┘
           │ (needs)
           ▼
┌───────────────────────┐
│  build                │
│  ───────────────────  │
│  • npm run build      │
│    (with env vars)    │
└───────────────────────┘
```

### 2. Backend CI (`backend-ci.yml`)

**Triggers:** PR or push to `main`, `master`, `develop` **only when `app/api/**`, `lib/**`, or `features/**` change**

Runs 3 parallel jobs:
- **validate-api** — checks API route structure, typecheck, lint
- **validate-services** — confirms every `app/api/*/` has `service.ts` and `controller.ts`
- **static-analysis** — full typecheck + build

### 3. Deploy (`deploy.yml`)

**Triggers:** Push to `main`/`master` or tag `v*`

This is the production pipeline — runs **sequentially**, one job at a time:

```
Push to main/master or v* tag
        │
        ▼
┌───────────────────────┐
│  lint                 │
│  ───────────────────  │
│  • ESLint             │
│  • tsc --noEmit       │
└──────────┬────────────┘
           │ (needs)
           ▼
┌───────────────────────┐
│  build                │
│  ───────────────────  │
│  • npm run build      │
│  • env vars injected  │
└──────────┬────────────┘
           │ (needs)
           ▼
┌───────────────────────┐
│  deploy               │
│  ───────────────────  │
│  • amondnet/vercel-   │
│    action@v25         │
│  • --prod flag        │
│  • uses VERCEL_TOKEN, │
│    VERCEL_ORG_ID,     │
│    VERCEL_PROJECT_ID  │
└───────────────────────┘
```

The deploy step uses [amondnet/vercel-action@v25](https://github.com/amondnet/vercel-action) with `--prod` to deploy to production.

---

## Summary

| Event | Workflow | Deploys? |
|-------|----------|----------|
| PR to `main`/`develop` | Frontend CI + Backend CI | No |
| Push to `develop` | Frontend CI + Backend CI | No |
| Push to `main`/`master` | Frontend CI + Backend CI + Deploy | **Yes** |
| Tag `v*` | Deploy only | **Yes** |

First-time Vercel setup is manual (import project, set env vars). After that, every push to `main`/`master` runs lint → typecheck → build → auto-deploy to production.
