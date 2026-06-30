# Feature: Feedback System

- **Type:** new
- **Status:** new
- **Created:** 2026-06-30
- **Updated:** 2026-06-30

## Overview

A feedback system allowing authenticated users to submit reviews (positive testimonials shown publicly with star ratings) and reports (bug reports/suggestions visible only to the app owner). Reviews display on a public `/reviews` page. Reports go to `/report-logs` (only accessible by the user whose `auth.uid()` matches the `OWNER_USER_ID` env var). The app landing page gets a new feedback section and footer links.

---

## Database Schema

Run the following SQL in Supabase SQL Editor to create the two required tables.

### `public.reviews`

```sql
CREATE TABLE public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  struggles_solved TEXT NOT NULL,
  routine_improvement TEXT NOT NULL,
  completed_more TEXT NOT NULL,
  part_of_routine TEXT NOT NULL,
  recommend_to_others TEXT NOT NULL,
  additional_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
```

### `public.reports`

```sql
CREATE TABLE public.reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  issue TEXT NOT NULL,
  explanation TEXT NOT NULL,
  suggestions TEXT NOT NULL,
  bug_detail TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
```

### Row-Level Security (RLS) Policies

Enable RLS on both tables, then create the following policies.

#### `reviews` policies

| Operation | Policy |
|-----------|--------|
| `SELECT` | Anyone (public) — no filter needed |
| `INSERT` | `auth.uid() = user_id` |
| `UPDATE` | `auth.uid() = user_id` |
| `DELETE` | `auth.uid() = user_id` |

```sql
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are publicly viewable"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON public.reviews FOR DELETE
  USING (auth.uid() = user_id);
```

#### `reports` policies

| Operation | Policy |
|-----------|--------|
| `SELECT` | `auth.uid() = user_id` (owner bypass via service-role client in controller) |
| `INSERT` | `auth.uid() = user_id` |
| `UPDATE` | `auth.uid() = user_id` |
| `DELETE` | `auth.uid() = user_id` |

```sql
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reports"
  ON public.reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reports"
  ON public.reports FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reports"
  ON public.reports FOR DELETE
  USING (auth.uid() = user_id);
```

> **Note:** The owner fetches all reports using a service-role Supabase client (bypasses RLS), so the owner can see every report even though the SELECT policy only allows `auth.uid() = user_id`.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OWNER_USER_ID` | Yes | The app owner's Supabase auth user UUID. Used to gate the `/report-logs` page and return all reports in the API. |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key. Used in the controller to bypass RLS when fetching all reports for the owner. |

---

## API Routes

All routes follow the 3-layer pattern: `route.ts` → `controller.ts` → `service.ts`.

### `POST /api/feedback/review`

- **Auth required:** Yes (middleware sets `X-User-Id` header)
- **Request body:**
  ```json
  {
    "rating": 4,
    "struggles_solved": "text",
    "routine_improvement": "text",
    "completed_more": "text",
    "part_of_routine": "text",
    "recommend_to_others": "text",
    "additional_feedback": "optional text"
  }
  ```
- **Controller:** Parse body → Zod validate → resolve username via `auth-helpers` → call service → return `201`
- **Service:** Insert row into `public.reviews`

### `POST /api/feedback/report`

- **Auth required:** Yes
- **Request body:**
  ```json
  {
    "issue": "text",
    "explanation": "text",
    "suggestions": "text",
    "bug_detail": "optional text"
  }
  ```
- **Controller:** Parse body → Zod validate → call service → return `201`
- **Service:** Insert row into `public.reports`

### `GET /api/feedback/reports`

- **Auth required:** Yes
- **Controller logic:**
  1. Read `userId` from `X-User-Id`
  2. If `userId === process.env.OWNER_USER_ID`:
     - Create a service-role Supabase client
     - Call `fetchAllReports(supabaseAdmin)` → returns all rows
  3. Else:
     - Use the user-scoped client
     - Call `fetchUserReports(supabase, userId)` → returns only that user's rows
- **Service functions:**
  - `fetchAllReports(supabaseAdmin: SupabaseClient)` — returns all rows from `reports`
  - `fetchUserReports(supabase: SupabaseClient, userId: string)` — returns rows where `user_id = userId`
- **Helper:** Create `lib/supabase-admin.ts` that exports a function to create a Supabase client using the service role key

### File structure

```
app/api/feedback/
├── review/
│   ├── route.ts       — POST handler, delegates to controller
│   ├── controller.ts  — Zod validation, auth resolution, response
│   └── service.ts     — Supabase insert into reviews
├── report/
│   ├── route.ts       — POST handler, delegates to controller
│   ├── controller.ts  — Zod validation, auth resolution, response
│   └── service.ts     — Supabase insert into reports
└── reports/
    ├── route.ts       — GET handler, delegates to controller
    ├── controller.ts  — Owner check, chooses service function
    └── service.ts     — fetchAllReports / fetchUserReports
```

---

## Pages

### `app/feedback/page.tsx`

- **Type:** Client component (`"use client"`)
- **Auth:** Required — if not authenticated, show a login prompt or redirect
- **Layout:** Two tabs — "Send a Review" and "Report an Issue"
- **Review tab:**
  - Star rating selector (1–5, interactive clickable stars)
  - 5 textarea questions (required):
    1. What struggles did Zen Berry help you solve?
    2. How has your routine improved?
    3. What have you been able to complete more of?
    4. Has Zen Berry become part of your daily routine?
    5. Would you recommend Zen Berry to others?
  - 1 optional textarea: anything else you'd like to share?
  - Submit button → `POST /api/feedback/review`
- **Report tab:**
  - 4 textarea questions:
    1. What issue did you encounter? (required)
    2. Explain the issue in detail (required)
    3. Do you have any suggestions? (required)
    4. Additional bug details (optional)
  - Submit button → `POST /api/feedback/report`
- **On review success:** `sonner` toast + redirect to `/reviews`
- **On report success:** `sonner` toast (stay on page)

### `app/reviews/page.tsx`

- **Type:** Server component (no auth needed)
- **Data fetching:** Uses server-side Supabase client (RLS allows public SELECT on `reviews`)
- **Renders:** Grid of review cards showing username, star rating, all Q&A answers, timestamp
- **CTAs:**
  - "Back to landing" link
  - "Share your experience" link → `/feedback`

### `app/report-logs/page.tsx`

- **Type:** Server component
- **Auth check:** If not logged in → redirect to `/auth/login`
- **Owner check:** If `user.id !== process.env.OWNER_USER_ID` → `notFound()` (404)
- **Data fetching:** Fetch all reports via `GET /api/feedback/reports`
- **Renders:** Simple table or list showing issue, explanation, suggestions, bug_detail, username, timestamp

---

## Components

### `components/feedback/review-form.tsx`

- **Type:** Client component
- **Contains:**
  - Interactive star rating input (1–5, clickable stars, hover/selected states)
  - 5 required textareas with labels matching the review questions
  - 1 optional textarea
  - Submit button that POSTs to `/api/feedback/review`
- **States:** Loading spinner/disabled while submitting; error handling with toast

### `components/feedback/report-form.tsx`

- **Type:** Client component
- **Contains:**
  - 3 required textareas (issue, explanation, suggestions)
  - 1 optional textarea (bug detail)
  - Submit button that POSTs to `/api/feedback/report`
- **States:** Loading spinner/disabled while submitting; error handling with toast

### `components/feedback/review-card.tsx`

- **Type:** Presentational component (can be server or client)
- **Displays:**
  - Username
  - Star rating (rendered stars)
  - All 5 question-answer pairs
  - Additional feedback (if present)
  - Relative timestamp (e.g., "2 days ago")
- **Styling:** Consistent with app — `rounded-3xl`, strawberry-light background, etc.

### `components/feedback/reviews-list.tsx`

- **Type:** Server component
- **Data fetching:** Fetches reviews via Supabase server-side client
- **Renders:** Grid layout of `ReviewCard` components
- **Used by:** `app/reviews/page.tsx`

### `components/landing/feedback-section.tsx`

- **Type:** Client or server component
- **Content:**
  - Title: "What Our Users Say"
  - Brief description or highlight quote
  - Two CTAs:
    - "See all reviews" → `/reviews`
    - "Give feedback" → `/feedback`

---

## Landing Page Changes

### `app/page.tsx`

1. Import and add `<FeedbackSection />` between the `<About />` section and the `<Footer />` component.

### Footer changes

1. **Product column:** Add "Reviews" link → `/reviews`
2. **Resources column:** Add "Feedback" link → `/feedback`

---

## Auth Model Summary

| Page/Route | Auth Required | Notes |
|------------|---------------|-------|
| `/feedback` | Yes | Redirect to login if unauthenticated |
| `/reviews` | No | Public page, server component fetches via anon RLS |
| `/report-logs` | Yes + owner check | 404 if not the owner (`OWNER_USER_ID`) |
| `POST /api/feedback/review` | Yes | Middleware sets `X-User-Id` |
| `POST /api/feedback/report` | Yes | Middleware sets `X-User-Id` |
| `GET /api/feedback/reports` | Yes | Controller gates data by owner vs. user |

Public reviews fetch happens server-side (not via the API route), so there is no middleware issue for the `/reviews` page.

---

## Post-Build Updates

After the feature is implemented, append the new tables (`reviews`, `reports`) to `.opencode/context/SCHEMA.md` to keep the schema documentation up to date.

---

## Implementation Plan

1. **Create lib/supabase-admin.ts** — helper to create a Supabase client with the service role key
2. **Create database tables** — run the SQL for `reviews` and `reports` with RLS policies
3. **Add environment variables** — `OWNER_USER_ID` and `SUPABASE_SERVICE_ROLE_KEY` to `.env` and `.env.dev.local`
4. **Create API routes:**
   - `app/api/feedback/review/route.ts`, `controller.ts`, `service.ts`
   - `app/api/feedback/report/route.ts`, `controller.ts`, `service.ts`
   - `app/api/feedback/reports/route.ts`, `controller.ts`, `service.ts`
5. **Create components:**
   - `components/feedback/review-form.tsx`
   - `components/feedback/report-form.tsx`
   - `components/feedback/review-card.tsx`
   - `components/feedback/reviews-list.tsx`
   - `components/landing/feedback-section.tsx`
6. **Create pages:**
   - `app/feedback/page.tsx`
   - `app/reviews/page.tsx`
   - `app/report-logs/page.tsx`
7. **Update landing page:**
   - Add `<FeedbackSection />` to `app/page.tsx`
   - Add footer links for Reviews and Feedback
8. **Update SCHEMA.md** — append new table schemas

---

## Acceptance Criteria

- [ ] `POST /api/feedback/review` accepts valid review data and returns 201
- [ ] `POST /api/feedback/report` accepts valid report data and returns 201
- [ ] `GET /api/feedback/reports` returns all reports for the owner, only user's own reports for non-owners
- [ ] Unauthenticated requests to `/api/feedback/*` are rejected
- [ ] Zod validation rejects invalid/missing fields with descriptive errors
- [ ] `app/feedback/page.tsx` renders both tabs and submits correctly
- [ ] `app/reviews/page.tsx` displays all reviews publicly with star ratings and Q&A
- [ ] `app/report-logs/page.tsx` shows 404 for non-owner authenticated users
- [ ] `app/report-logs/page.tsx` shows reports table for the owner
- [ ] Landing page renders `<FeedbackSection />` between About and Footer
- [ ] Footer contains "Reviews" and "Feedback" links
- [ ] RLS policies allow public SELECT on `reviews`, restrict user access on `reports`
- [ ] Star rating input is interactive (clickable, hover states, 1–5)
- [ ] Toast notifications on success/error for both forms
- [ ] `SUPABASE_SERVICE_ROLE_KEY` usage is server-side only (never exposed to client)
