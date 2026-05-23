# 🚀 Zen Berry MVP (v0.1.0 — Shippable)
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
* **Provider:** Supabase Auth (Email/Password).
* **Session Management:** JWT stored in HTTP-only cookies for security.
* **OAuth:** Optional Google Login enabled via Supabase dashboard.

### 3.2 Pomodoro Timer
* **Functionality:** Start, Pause, and Reset.
* **Customization:** Minutes-only input (e.g., 25, 50).
* **Persistence:** State managed via **Zustand** to ensure the timer doesn't reset on internal navigation.
* **Notification:** Basic browser/toast notification on session completion.

### 3.3 Top 3 MIT (Most Important Tasks)
* **The Constraint:** Maximum of 3 active tasks allowed in this section.
* **Behavior:** These tasks persist day-to-day until checked off as "Done."
* **Editability:** Inline editing and deletion.

### 3.4 Task List (Brain Dump)
* **Input:** Quick-add list for non-critical tasks.
* **Promotion:** A "Promote" button that moves a task from the Brain Dump to an empty MIT slot.

### 3.5 Tracking & Streaks
* **Sessions:** Count of completed Pomodoro sessions per day.
* **Streaks:** A simple integer counter.
    * *Logic:* Incremented if a session is completed or an MIT is finished.
    * *Persistence:* Tracked via `last_active_date`.

### 3.6 AI Productivity Review (Gemini API)
* **Mechanism:** A single "Review My Day" button.
* **Logic:** Sends today's metrics (sessions, MITs completed) to Gemini.
* **Output:** A short, punchy, 2-sentence motivational insight.

### 3.7 Progressive Web App Functionality 
* **Mechanism:** Can be used offline of timer and task crud logic.
* **Logic:** User should be able to make custom preset time offline and add tasks.

---

## 4. Technical Stack

* **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui.
* **State:** Zustand (Timer), TanStack Query (Server State).
* **Backend:** Express.js (on Render).
* **Database:** PostgreSQL (via Supabase).
* **Validation:** Zod.
* **AI:** Gemini API.

---

## 7. Deployment Plan
* **Frontend:** Vercel (Auto-deploy from `main`).
* **Backend:** Render (Web Service).
* **Database:** Supabase (Managed Postgres).