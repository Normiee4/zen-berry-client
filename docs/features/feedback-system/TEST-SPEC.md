# Test Spec: Feedback System

## Test Strategy Overview

The feedback system comprises three API routes, four UI components, three pages, and auth-sensitive access control. The testing strategy follows a layered approach:

1. **Service Layer** — Unit tests for data access functions (Supabase query construction, data transformation/formatting). These mock the Supabase client.
2. **Controller Layer** — Unit tests for request handling (auth resolution, Zod validation, response formatting). These mock `resolveUser`, `supabase`, and service functions.
3. **Component Layer** — Render tests for UI components (form rendering, star rating interaction, submit behavior, loading/empty states). These mock hooks, fetch, and navigation.
4. **Page Layer** — Integration-adjacent tests covering page-level concerns (auth gating, tab switching, data fetching from Supabase).
5. **Auth/Access Control** — Cross-cutting tests verifying that auth requirements are enforced for each protected route and that public routes are accessible.

### Testing Tools
- **Vitest** — Test runner (following project convention from `docs/features/timer-alarms/tests/`)
- **@testing-library/react** — Component rendering and interaction
- **vi.mock / vi.hoisted** — Module mocking strategy
- **sonner** mock — For toast assertions
- **next/navigation** mock — For router/redirect assertions

---

## Scope

### What to Test
| Area | Coverage |
|------|----------|
| `POST /api/feedback/review` | Valid body → 201, invalid/missing fields → 400, unauthenticated → 401, rating out of range → 400 |
| `POST /api/feedback/report` | Valid body → 201, missing required fields → 400, unauthenticated → 401 |
| `GET /api/feedback/reports` | Owner returns all reports, non-owner returns own reports, unauthenticated → 401 |
| `review service` | `insertReview` query construction, `formatReview` field mapping |
| `report service` | `insertReport` query construction, `formatReport` field mapping |
| `reports service` | `fetchAllReports`, `fetchUserReports` query construction |
| `ReviewForm` component | Renders 5 questions + star rating + textbox, submit validation, star interaction, fetch call |
| `ReportForm` component | Renders 3 required + 1 optional fields, submit behavior |
| `ReviewCard` component | Renders username/rating/Q&A, handles null `additionalFeedback` |
| `ReviewsList` component | Renders grid, empty state, correct count |
| `/feedback` page | Auth check (login prompt), tab switching, loading state |
| `/reviews` page | Fetches from Supabase, renders reviews list, empty state |
| `/report-logs` page | Auth redirect, owner 404, renders report table |
| Access control | All protected routes reject unauthenticated; public routes accessible |

### What NOT to Test
- **Database behavior** — RLS policies are tested at the integration/e2e level, not in unit tests
- **Actual Supabase connections** — All Supabase clients are mocked
- **Landing page changes** — `FeedbackSection` component and footer links are external to the core feedback system
- **Environment variable presence** — Assumed present in production; tests mock `process.env` as needed
- **E2E user flows** — Not in scope for unit tests (future Playwright tests would cover these)

---

## Test Categories

### API Route Tests (3 files)
| File | What It Tests |
|------|--------------|
| `tests/api/feedback/review/controller.test.ts` | `handleCreateReview` — Zod schema, auth guard, success path |
| `tests/api/feedback/report/controller.test.ts` | `handleCreateReport` — Zod schema, auth guard, success path |
| `tests/api/feedback/reports/controller.test.ts` | `handleGetReports` — Owner vs non-owner branching, auth guard |

### Service Tests (2 files)
| File | What It Tests |
|------|--------------|
| `tests/api/feedback/review/service.test.ts` | `insertReview`, `formatReview` |
| `tests/api/feedback/report/service.test.ts` | `insertReport`, `formatReport` |

(Note: `reports` service tests are included in `report/service.test.ts` as they share types)

### Component Tests (4 files)
| File | What It Tests |
|------|--------------|
| `tests/components/feedback/review-form.test.tsx` | Rendering, interaction, validation, submission |
| `tests/components/feedback/report-form.test.tsx` | Rendering, submission |
| `tests/components/feedback/review-card.test.tsx` | Display, null optional field |
| `tests/components/feedback/reviews-list.test.tsx` | Grid rendering, empty state |

### Page Tests (3 files)
| File | What It Tests |
|------|--------------|
| `tests/app/feedback/page.test.tsx` | Auth states, tab switching |
| `tests/app/reviews/page.test.tsx` | Data fetching, list rendering, empty state |
| `tests/app/report-logs/page.test.tsx` | Auth redirect, owner gate, report table |

### Auth Tests (1 file)
| File | What It Tests |
|------|--------------|
| `tests/auth/access-control.test.ts` | Auth requirements for all routes and pages |

---

## Acceptance Criteria Coverage

| AC | Description | Test File(s) | Test(s) |
|----|-------------|--------------|---------|
| AC1 | `POST /api/feedback/review` returns 201 | `controller.test.ts` (review) | "returns 201 for valid review body" |
| AC2 | `POST /api/feedback/report` returns 201 | `controller.test.ts` (report) | "returns 201 for valid report body" |
| AC3 | `GET /api/feedback/reports` returns all/own reports | `controller.test.ts` (reports) | "returns all reports for owner user", "returns only own reports for non-owner user" |
| AC4 | Unauthenticated requests rejected | `controller.test.ts` (all), `access-control.test.ts` | All "returns 401" tests |
| AC5 | Zod validation rejects invalid/missing fields | `controller.test.ts` (review, report) | All "missing required fields" and "rating out of range" tests |
| AC6 | `/feedback` page renders both tabs | `page.test.tsx` (feedback) | "shows review tab by default", "can switch to report tab" |
| AC7 | `/reviews` page displays reviews publicly | `page.test.tsx` (reviews) | "fetches reviews from supabase", "renders reviews list" |
| AC8 | `/report-logs` shows 404 for non-owner | `page.test.tsx` (report-logs) | "shows 404 if user is not owner" |
| AC9 | `/report-logs` shows reports for owner | `page.test.tsx` (report-logs) | "fetches and renders all reports for owner" |
| AC10 | Landing page FeedbackSection | (Not tested — external to core system) | — |
| AC11 | Footer links | (Not tested — external to core system) | — |
| AC12 | RLS policies | (Not tested — integration/e2e scope) | — |
| AC13 | Star rating interaction | `review-form.test.tsx` | "renders interactive star rating", "click updates selection" |
| AC14 | Toast notifications | `review-form.test.tsx`, `report-form.test.tsx` | "shows toast on success" |
| AC15 | Service role key server-side only | (Architectural — verified in code review) | — |

---

## Test Cases Summary

### API: Review Controller (4-5 tests)
1. Valid review body → 201
2. Missing required fields → 400
3. Rating out of range (0 or 6) → 400
4. Unauthenticated → 401

### API: Report Controller (3-4 tests)
1. Valid report body → 201
2. Missing required fields → 400
3. Unauthenticated → 401

### API: Reports Controller (3-4 tests)
1. Owner user returns all reports
2. Non-owner returns own reports
3. Unauthenticated → 401

### Service: Review (4-5 tests)
1. `insertReview` inserts with correct data
2. `formatReview` transforms snake_case to camelCase
3. `insertReview` handles additional_feedback as optional
4. `formatReview` handles null additional_feedback

### Service: Report (4-5 tests)
1. `insertReport` inserts with correct data
2. `formatReport` transforms correctly
3. `fetchAllReports` selects all without filter
4. `fetchUserReports` filters by userId

### Components (12-14 tests)
1. ReviewForm renders all 5 questions + star rating + optional textarea
2. Submit disabled when required fields empty
3. Star rating click updates selection
4. Submit calls POST /api/feedback/review
5. Shows loading state while submitting
6. ReportForm renders all 4 questions (3 required + 1 optional)
7. ReportForm submit calls POST /api/feedback/report
8. ReviewCard renders username and avatar initial
9. ReviewCard renders correct number of filled stars based on rating
10. ReviewCard renders all 5 Q&A pairs
11. ReviewCard renders additional_feedback section when present
12. ReviewCard does not render additional_feedback section when null
13. ReviewsList renders grid of ReviewCard components
14. ReviewsList shows empty state message when no reviews

### Pages (8-10 tests)
1. Feedback page shows loading spinner initially
2. Feedback page shows login prompt when not authenticated
3. Feedback page shows review form by default
4. Feedback page switches to report form on tab click
5. Reviews page fetches from supabase on render
6. Reviews page renders reviews list with formatted data
7. Reviews page shows empty state when no reviews
8. Report-logs page redirects to login if unauthenticated
9. Report-logs page calls notFound for non-owner
10. Report-logs page renders report table for owner

### Access Control (6 tests)
1. Unauthenticated → 401 for POST /api/feedback/review
2. Unauthenticated → 401 for POST /api/feedback/report
3. Unauthenticated → 401 for GET /api/feedback/reports
4. /reviews page accessible without auth
5. /feedback page shows login prompt when not authenticated
6. /report-logs shows 404 for non-owner users

---

**Total: ~40-45 test cases across 14 test files**
