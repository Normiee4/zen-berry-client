# Database Schema & API Design

## Tables

### `ai_insights`

| Name | Type | Constraints |
|------|------|-------------|
| `insight_id` | `int8` | Primary Identity |
| `user_id` | `uuid` |  |
| `insight_date` | `timestamp` | Unique |
| `productivity_level` | `float8` | Nullable |
| `consistency_rate` | `float8` | Nullable |
| `cycles_total` | `numeric` |  |
| `peak_hours` | `numeric` |  |
| `peak_days` | `_text` |  |
| `insight_message` | `text` | Nullable |
| `recommendation` | `text` | Nullable |
| `milestone` | `text` | Nullable |
| `created_at` | `timestamptz` |  |
| `models_used` | `json` | Nullable |
| `most_used_preset_timer` | `int8` | Nullable |

> **Unique constraint**: `(user_id, insight_date)` — used by upsert in AI review.

### `daily_activity_log`

| Name | Type | Constraints |
|------|------|-------------|
| `log_id` | `uuid` | Primary |
| `user_id` | `uuid` | Nullable |
| `date` | `date` | Unique (composite) |
| `hour_slot` | `int4` | Unique (composite) |
| `pomodoros_completed` | `int4` | Nullable |
| `tasks_completed` | `int4` | Nullable |

> **Unique constraint**: `(user_id, date, hour_slot)` — used by upsert in session logging.

### `daily_stats`

| Name | Type | Constraints |
|------|------|-------------|
| `stat_id` | `uuid` | Primary |
| `user_id` | `uuid` | Nullable |
| `date` | `timestamp` | Nullable |
| `daily_pomodoro` | `numeric` | Nullable |
| `daily_task_completed` | `numeric` | Nullable |
| `streak_maintained` | `int4` | Nullable |
| `break_count` | `int4` | Nullable |
| `break_duration` | `int4` | Nullable |
| `created_at` | `timestamptz` |  |
| `ai_review_count` | `int4` | Nullable |

> - **Unique constraint**: `(user_id, date)` — used by upsert in session completion.
> - `created_at` relies on DB default `now()` (not provided in code upserts).

### `session_logs`

| Name | Type | Constraints |
|------|------|-------------|
| `session_id` | `uuid` | Primary |
| `user_id` | `uuid` | Nullable |
| `started_at` | `timestamptz` | Nullable |
| `completed_at` | `timestamptz` | Nullable |
| `duration_minutes` | `int4` |  |
| `was_break` | `bool` | Nullable |
| `preset_used` | `text` | Nullable |
| `created_at` | `timestamptz` | Nullable |

### `tasks`

| Name | Type | Constraints |
|------|------|-------------|
| `task_id` | `int8` | Primary Identity |
| `user_id` | `uuid` |  |
| `title` | `text` |  |
| `description` | `text` | Nullable |
| `type` | `task_types` |  |
| `created_at` | `timestamptz` |  |
| `complete_at` | `timestamp` | Nullable |

### `timer_presets`

| Name | Type | Constraints |
|------|------|-------------|
| `preset_id` | `int8` | Primary Identity |
| `user_id` | `uuid` |  |
| `preset_name` | `text` | Nullable |
| `focus_duration` | `int8` | Nullable |
| `break_duration` | `int8` | Nullable |
| `is_default` | `bool` | Nullable |
| `created_at` | `timestamptz` |  |

### `users`

| Name | Type | Constraints |
|------|------|-------------|
| `user_id` | `uuid` | Primary |
| `username` | `varchar` |  |
| `email` | `varchar` | Unique |
| `created_at` | `timestamptz` |  |

### `pins`

| Name | Type | Constraints |
|------|------|-------------|
| `pin_id` | `uuid` | Primary |
| `user_id` | `uuid` | FK → auth.users.id |
| `heading` | `text` | NOT NULL |
| `content` | `text` | Nullable (plain text; URLs auto-link on display) |
| `color` | `text` | NOT NULL DEFAULT '#FFD1D1' |
| `position` | `int4` | NOT NULL DEFAULT 0 |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | |

> **Indexes**: `(user_id)`, `(user_id, position)`.

### `waitlist`

| Name | Type | Constraints |
|------|------|-------------|
| `registration_id` | `uuid` | Primary |
| `email` | `varchar` | Unique |
| `name` | `text` | Nullable |
| `created_at` | `timestamptz` |  |

### `reviews`

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary (default: `gen_random_uuid()`) |
| `user_id` | `uuid` | NOT NULL, FK → `auth.users.id` ON DELETE CASCADE |
| `username` | `text` | NOT NULL |
| `rating` | `smallint` | NOT NULL, CHECK (1–5) |
| `struggles_solved` | `text` | NOT NULL |
| `routine_improvement` | `text` | NOT NULL |
| `completed_more` | `text` | NOT NULL |
| `part_of_routine` | `text` | NOT NULL |
| `recommend_to_others` | `text` | NOT NULL |
| `additional_feedback` | `text` | Nullable |
| `created_at` | `timestamptz` | NOT NULL, default `now()` |

> **RLS**: Public SELECT; INSERT/UPDATE/DELETE restricted to own `user_id`.

### `reports`

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary (default: `gen_random_uuid()`) |
| `user_id` | `uuid` | NOT NULL, FK → `auth.users.id` ON DELETE CASCADE |
| `issue` | `text` | NOT NULL |
| `explanation` | `text` | NOT NULL |
| `suggestions` | `text` | NOT NULL |
| `bug_detail` | `text` | Nullable |
| `created_at` | `timestamptz` | NOT NULL, default `now()` |

> **RLS**: SELECT/INSERT/UPDATE/DELETE restricted to own `user_id`. Owner bypasses via service-role client.

## API Routes

### Authentication

```
POST   /auth/register
POST   /auth/login
POST   /auth/logout
GET    /auth/verify
POST   /auth/refresh-token
POST   /auth/forgot-password
POST   /auth/reset-password
```

### Users

```
GET    /users/me
PATCH  /users/me
DELETE /users/me
GET    /users/:id/stats
```

### Tasks

```
GET    /tasks
GET    /tasks/today
GET    /tasks/upcoming
GET    /tasks/completed
GET    /tasks/:id
POST   /tasks
PATCH  /tasks/:id
PATCH  /tasks/:id/complete
DELETE /tasks/:id
```

### Sessions (Timer)

```
POST   /sessions          (on timer complete)
GET    /sessions
GET    /sessions/daily
GET    /sessions/weekly
GET    /sessions/task/:taskId
GET    /sessions/latest
```

### Timer Presets

```
GET    /presets
GET    /presets/default
POST   /presets
PATCH  /presets/:id
DELETE /presets/:id
PATCH  /presets/:id/default
```

### Stats & Insights

```
GET    /stats/daily
GET    /stats/weekly
GET    /stats/monthly
GET    /stats/streak/:userId
GET    /stats/overview
GET    /insights/latest
GET    /insights/history
GET    /insights/summary
GET    /insights/milestones
```

### AI Features

```
POST   /ai/review
POST   /ai/analyze
GET    /ai/suggestions
GET    /ai/predictions/:userId
POST   /ai/insights/generate
```

### Pins

```
GET    /pins                  List user's pins (ordered by position)
POST   /pins                  Create a pin
PATCH  /pins                  Update a pin (body: id, heading?, content?, color?)
DELETE /pins                  Delete a pin (query: ?id=xxx)
POST   /pins/reorder          Batch reorder pins (body: { items: [{ pin_id, position }] })
```

### Waitlist

```
POST   /waitlist/join
GET    /waitlist/status/:email
DELETE /waitlist/:registrationId (admin)
```

### Feedback

```
POST   /api/feedback/review       Submit a review (auth required)
POST   /api/feedback/report        Submit a bug report or suggestion (auth required)
GET    /api/feedback/reports       Fetch reports — all (owner) or own (user)
```

## Route Priority
🔴 MVP (Required)
POST /auth/register, /login, /logout

GET /tasks/today, POST /tasks, PATCH /tasks/:id, DELETE /tasks/:id

POST /sessions

GET /stats/streak/:userId

🟡 Phase 2
GET /users/me, PATCH /users/me

GET /tasks, GET /tasks/:id

GET /sessions, GET /sessions/daily

GET /presets, POST /presets

GET /insights/latest

🟢 Phase 3
POST /ai/review

GET /insights/summary

GET /stats/weekly, /monthly

GET /ai/suggestions

POST /waitlist/join

## API Response Examples

### GET /stats/streak/:userId

```json
{
  "current_streak": 7,
  "longest_streak": 14,
  "last_active": "2026-05-23",
  "streak_history": [true, true, true, false, true]
}
```

### POST /sessions

```json
{
  "task_id": "123",
  "preset_id": 1,
  "duration_seconds": 1500,
  "session_type": "focus",
  "completed": true
}
```

### GET /insights/summary

```json
{
  "productivity_level": 0.85,
  "consistency_rate": 0.92,
  "total_cycles": 47,
  "peak_hours": [9, 14, 19],
  "peak_days": ["Monday", "Wednesday"],
  "latest_message": "Great progress this week!",
  "recommendation": "Try longer focus sessions on Monday",
  "milestone_unlocked": "7 Day Streak"
```