# Zen Berry MVP (v0.1.0 — Shippable)
## Product Requirement Document (PRD)

---

## 1. Executive Summary
**Zen Berry** is a minimalist daily focus tool designed to reduce cognitive load and decision fatigue. The MVP focuses on the "Top 3 MIT" (Most Important Tasks) philosophy combined with a Pomodoro technique, providing just enough structure to ensure productivity without the bloat of traditional project management tools.

---

## 2. Core Goal
To provide a distraction-free environment where users can:
1.  Identify their high-leverage tasks (MITs).
2.  Execute them in timed blocks.
3.  Receive a high-level AI insight to end their day.

---

## 3. MVP Feature Scope (Strict)

### 3.1 Authentication & Security
- **Provider:** Supabase Auth (Email/Password).
- **Session Management:** JWT stored in HTTP-only cookies for security.
- **OAuth:** Optional Google Login enabled via Supabase dashboard.
- **See:** [SCHEMA.md](SCHEMA.md) for auth route listing, [security/SKILL.md](security/SKILL.md) for security guidelines.

### 3.2 Pomodoro Timer
- **Functionality:** Start, Pause, and Reset.
- **Customization:** Minutes-only input (e.g., 25, 50). Supports custom presets via `timer_presets` table (see [SCHEMA.md](SCHEMA.md)).
- **Persistence:** State managed via **Zustand** to ensure the timer doesn't reset on internal navigation.
- **Notification:** Basic browser/toast notification on session completion.
- **Data:** Completed sessions logged to `sessions` table via `POST /sessions` (see [DESIGN.md](DESIGN.md) §3.2).

### 3.3 Top 3 MIT (Most Important Tasks)
- **The Constraint:** Maximum of 3 active tasks allowed (`is_mit=true`).
- **Behavior:** These tasks persist day-to-day until checked off as "Done."
- **Editability:** Inline editing and deletion.
- **Data:** CRUD via `tasks` table (see [SCHEMA.md](SCHEMA.md)).

### 3.4 Task List (Brain Dump)
- **Input:** Quick-add list for non-critical tasks.
- **Promotion:** A "Promote" button that moves a task from the Brain Dump to an empty MIT slot.

### 3.5 Tracking & Streaks
- **Sessions:** Count of completed Pomodoro sessions per day (tracked in `daily_stats`).
- **Streaks:** A simple integer counter.
  - *Logic:* Incremented if a session is completed or an MIT is finished.
  - *Persistence:* Tracked via `last_active_date`.
- **Analytics API:** See `GET /stats/streak/:userId` response example in [SCHEMA.md](SCHEMA.md).

### 3.6 AI Productivity Review (Gemini API)
- **Mechanism:** A single "Review My Day" button.
- **Logic:** Sends today's metrics (sessions, MITs completed) to Gemini.
- **Output:** A short, punchy, 2-sentence motivational insight.
- **Data:** Results stored in `insights` table (see [SCHEMA.md](SCHEMA.md)). Rate limited to 10/day per user (see [DESIGN.md](DESIGN.md) §5.4).

### 3.7 Progressive Web App Functionality
- **Mechanism:** Can be used offline for timer and task CRUD logic.
- **Logic:** User should be able to make custom preset time offline and add tasks.

---

## 4. Technical Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui.
- **State:** Zustand (Client State), TanStack Query (Server State).
- **Backend:** Next.js API Route Handlers (no separate backend).
- **Database:** PostgreSQL (via Supabase). Full schema in [SCHEMA.md](SCHEMA.md).
- **Validation:** Zod.
- **AI:** Gemini API (`gemini-2.0-flash`). Integration details in [DESIGN.md](DESIGN.md) §5.

---

## 5. Deployment Plan
- **Frontend & API:** Vercel (Auto-deploy from `main`).
- **Database:** Supabase (Managed Postgres).

---

## 6. Route Priority (from [SCHEMA.md](SCHEMA.md))
See [SCHEMA.md](SCHEMA.md) §Route Priority for the full implementation order:
- **🔴 MVP (Required):** Auth, Tasks (CRUD), Sessions (POST), Streak stats
- **🟡 Phase 2:** User profile, presets, session history, basic insights
- **🟢 Phase 3:** AI review, summary stats, waitlist, suggestions

## 7. Architecture Reference
For system architecture, data flow diagrams, analytics pipeline, and AI feature deep-dive, see [DESIGN.md](DESIGN.md).

For the complete database ER diagram, all API route endpoints with request/response examples, and route priority tiers, see [SCHEMA.md](SCHEMA.md).
