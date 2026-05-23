# Database Schema & API Design

## Entity Relationship Diagram

```mermaid
erDiagram
  users ||--o{ daily_stats : has
  users ||--o{ insights : generates
  users ||--o{ tasks : owns
  timer_presets ||--o{ tasks : uses
  tasks ||--o{ sessions : tracks

  users {
    uuid user_id PK
    varchar username
    varchar email
    timestamp created_at
  }

  tasks {
    int8 task_id PK
    uuid user_id FK
    text title
    text description
    boolean is_mit DEFAULT FALSE
    boolean completed DEFAULT FALSE
    timestamp created_at
    timestamp completed_at
    timestamp updated_at
  }

  sessions {
    uuid session_id PK
    uuid user_id FK
    int8 task_id FK
    int8 preset_id FK
    timestamp start_time
    timestamp end_time
    int8 duration_seconds
    text session_type
  }

  daily_stats {
    int8 stat_id PK
    uuid user_id FK
    timestamp date
    numeric daily_pomodoro
    numeric daily_task_completed
    bool streak_maintained
  }

  timer_presets {
    int8 preset_id PK
    text preset_name
    int8 focus_duration
    int8 break_duration
    bool is_default
  }

  insights {
    int8 insight_id PK
    uuid user_id FK
    float4 productivity_level
    float4 consistency_rate
    numeric cycles_total
    numeric peak_hours
    text[] peak_days
    text insight_message
    text recommendation
    text milestone
    json models_used
    int8 most_used_preset_timer FK
  }

  waitlist {
    uuid registration_id PK
    varchar email
    text name
    timestamp created_at
  }
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