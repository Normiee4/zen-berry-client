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

### `daily_activity_log`

| Name | Type | Constraints |
|------|------|-------------|
| `log_id` | `uuid` | Primary |
| `user_id` | `uuid` | Nullable |
| `date` | `date` |  |
| `hour_slot` | `int4` |  |
| `pomodoros_completed` | `int4` | Nullable |
| `tasks_completed` | `int4` | Nullable |

### `daily_stats`

| Name | Type | Constraints |
|------|------|-------------|
| `stat_id` | `uuid` | Primary |
| `user_id` | `uuid` | Nullable |
| `date` | `timestamp` | Nullable |
| `daily_pomodoro` | `numeric` | Nullable |
| `daily_task_completed` | `numeric` | Nullable |
| `streak_maintained` | `int4` | Nullable |
| `created_at` | `timestamptz` |  |
| `ai_review_count` | `int4` | Nullable |

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

### `waitlist`

| Name | Type | Constraints |
|------|------|-------------|
| `registration_id` | `uuid` | Primary |
| `email` | `varchar` | Unique |
| `name` | `text` | Nullable |
| `created_at` | `timestamptz` |  |

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

### Waitlist

```
POST   /waitlist/join
GET    /waitlist/status/:email
DELETE /waitlist/:registrationId (admin)
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