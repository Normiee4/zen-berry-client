# Zen Berry Design Document

## System Architecture & AI Feature Specification

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js 16)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────┐  │
│  │  Zustand    │  │ TanStack    │  │   shadcn    │  │  Recharts  │  │
│  │  (Timer)    │  │   Query     │  │    (UI)     │  │  (Charts) │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └───────────┘  │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     Next.js API Routes                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │ /api/tasks  │  │ /api/session│  │/api/analytics│  │  /api/ai   │  │
│  │             │  │             │  │             │  │  /review   │  │
│  │ Controller  │  │ Controller  │  │ Controller  │  │ Controller  │  │
│  │      ▼      │  │      ▼      │  │      ▼      │  │      ▼      │  │
│  │ Service     │  │ Service     │  │ Service     │  │  Gemini    │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Supabase (PostgreSQL)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │    users    │  │   tasks    │  │daily_stats  │  │session_logs │  │
│  │  (auth)     │  │  (MIT/Brain)│  │ (aggregated)│  │ (timestamp) │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │              daily_activity_log (hourly analytics)              │   │
│  └────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Database Schema

### 2.1 Existing Tables

**users** (managed by Supabase Auth)
- `id` UUID (PK)
- `email` TEXT

**daily_stats** (existing)
- `stat_id` UUID (PK)
- `user_id` UUID (FK → users.id)
- `date` DATE
- `daily_pomodoro` INT
- `daily_task_completed` INT
- `streak_maintained` INT
- UNIQUE(user_id, date)

**timer_presets** (existing)
- `preset_id` UUID (PK)
- `user_id` UUID (FK → users.id)
- `preset_name` TEXT
- `focus_duration` INT
- `break_duration` INT
- `is_default` BOOLEAN
- `created_at` TIMESTAMP

### 2.2 New Tables Required

**tasks**
```sql
CREATE TABLE tasks (
  task_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_mit BOOLEAN DEFAULT FALSE,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RLS: Users can only see their own tasks
CREATE POLICY "Users can manage own tasks" ON tasks
  FOR ALL USING (auth.uid() = user_id);
```

**session_logs** (individual Pomodoro tracking for analytics)
```sql
CREATE TABLE session_logs (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  duration_minutes INT NOT NULL,
  was_break BOOLEAN DEFAULT FALSE,
  preset_used TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_session_logs_user_date ON session_logs(user_id, date(completed_at));

-- RLS
CREATE POLICY "Users can see own sessions" ON session_logs
  FOR ALL USING (auth.uid() = user_id);
```

**daily_activity_log** (hourly tracking for AI peak hours analysis)
```sql
CREATE TABLE daily_activity_log (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  hour_slot INT NOT NULL CHECK (hour_slot >= 0 AND hour_slot <= 23),
  pomodoros_completed INT DEFAULT 0,
  tasks_completed INT DEFAULT 0,
  UNIQUE(user_id, date, hour_slot)
);

CREATE INDEX idx_activity_log_user_date ON daily_activity_log(user_id, date);

-- RLS
CREATE POLICY "Users can see own activity" ON daily_activity_log
  FOR ALL USING (auth.uid() = user_id);
```

---

## 3. API Endpoints

### 3.1 Task Management (`/api/tasks`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/tasks` | Fetch tasks (filter by `?type=mit&completed=false`) |
| POST | `/api/tasks` | Create new task (enforce MIT limit) |
| PATCH | `/api/tasks` | Update task (toggle completion, promote to MIT) |
| DELETE | `/api/tasks` | Delete task |

**GET Request:**
```
GET /api/tasks?type=mit&completed=false
```

**Response:**
```typescript
{
  tasks: Task[],
  mitCount: number,
  mitLimit: 3
}
```

**POST Request:**
```typescript
{
  title: string,
  type: 'mit' | 'braindump'
}
```

**MIT Enforced:**
- If `type === 'mit'` and `mitCount >= 3`: Return 400 error

### 3.2 Session Management (`/api/sessions`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/sessions` | Log completed Pomodoro (creates session_log, updates daily_stats, updates activity_log) |

**POST Request:**
```typescript
{
  action: 'recordCompletion',
  durationMinutes: number,
  wasBreak: boolean,
  presetUsed: string
}
```

**Side Effects:**
1. Insert into `session_logs`
2. Upsert `daily_stats` (increment daily_pomodoro)
3. Upsert `daily_activity_log` (increment hour slot)
4. Update streak logic

### 3.3 Analytics (`/api/analytics`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/analytics/summary` | Today's stats + streak |
| GET | `/api/analytics/history` | Weekly/monthly data for charts |
| GET | `/api/analytics/insights` | AI-generated insights (cached) |

**GET /api/analytics/summary:**
```typescript
{
  today: {
    pomodorosCompleted: number,
    tasksCompleted: number,
    mitsCompleted: number,
    streak: number,
    totalFocusMinutes: number,
    breakCount: number
  },
  peakHours: {
    start: number, // e.g., 10
    end: number   // e.g., 12
  } | null
}
```

**GET /api/analytics/history?period=week:**
```typescript
{
  data: [
    { date: '2024-01-15', pomodoros: 4, tasks: 2, mits: 1 },
    { date: '2024-01-16', pomodoros: 6, tasks: 3, mits: 2 },
    // ...
  ],
  weeklyTotals: {
    pomodoros: number,
    tasks: number,
    focusMinutes: number
  },
  nextCursor: string | null
}
```

### 3.4 AI Review (`/api/ai/review`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/ai/review` | Generate daily AI insight |

**POST Request:**
```typescript
{
  date?: string // defaults to today
}
```

**Response:**
```typescript
{
  insight: string,        // 2-sentence motivational message
  suggestion: string,    // 1 actionable suggestion
  stats: {
    pomodoros: number,
    tasks: number,
    peakHours: string,
    restAnalysis: string  // e.g., "No break taken for 4+ hours"
  }
}
```

---

## 4. Analytics Data Flow

### 4.1 Data Collection Pipeline

```
User completes Pomodoro timer
        │
        ▼
┌────────────────────────────────────────────────────────────┐
│ Frontend: useTimerStore tick() detects timeLeft <= 0      │
│           + mode === 'focus'                               │
│           → call POST /api/sessions                        │
└────────────────────────────────────────────────────────────┘
        │
        ▼
┌────────────────────────────────────────────────────────────┐
│ /api/sessions (POST)                                       │
│ 1. recordPomodoro() service → update daily_stats          │
│ 2. createSessionLog() → insert session_logs               │
│ 3. updateHourlyActivity() → upsert daily_activity_log    │
└────────────────────────────────────────────────────────────┘
        │
        ▼
TanStack Query onUseSuccess → invalidates analytics queries
        │
        ▼
Dashboard charts re-fetch and update automatically
```

### 4.2 Hourly Activity Tracking

```typescript
// When recording Pomodoro completion:
const hourSlot = new Date().getHours();

await supabase.from('daily_activity_log').upsert({
  user_id: user.id,
  date: getToday(),
  hour_slot: hourSlot,
  pomodoros_completed: 1, // SQL: pomodoros_completed + 1
}, { onConflict: 'user_id,date,hour_slot' });
```

### 4.3 Peak Hours Calculation

```sql
-- Query to find peak 2-hour window across last 7 days
SELECT 
  hour_slot as start_hour,
  hour_slot + 1 as end_hour,
  AVG(pomodoros_completed) as avg_pomodoros
FROM daily_activity_log
WHERE user_id = :userId
  AND date >= CURRENT_DATE - 7
GROUP BY hour_slot
ORDER BY avg_pomodoros DESC
LIMIT 1;
```

---

## 5. AI Feature Deep Dive

### 5.1 Smart Detection Logic

**Rest Reminder Detection:**
```typescript
const lastBreak = await supabase
  .from('session_logs')
  .select('completed_at')
  .eq('user_id', user.id)
  .eq('was_break', true)
  .not('completed_at', 'is', null)
  .order('completed_at', { ascending: false })
  .limit(1)
  .single();

const hoursSinceBreak = lastBreak?.completed_at
  ? (Date.now() - new Date(lastBreak.completed_at).getTime()) / (1000 * 60 * 60)
  : null;

const needsRestReminder = hoursSinceBreak !== null && hoursSinceBreak > 3;
```

**Low Activity Detection:**
```typescript
const todayPomodoros = await supabase
  .from('daily_stats')
  .select('daily_pomodoro')
  .eq('user_id', user.id)
  .eq('date', getToday())
  .single();

if (todayPomodoros?.daily_pomodoro === 0) {
  // No activity - encourage start
}
```

### 5.2 Gemini API Integration

**Environment Variables Required:**
```
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.0-flash
```

**Prompt Engineering:**
```typescript
const generatePrompt = (data: DailyStats): string => `
You are Zen Berry, a friendly and encouraging productivity assistant. 
Analyze the user's productivity data and provide a short, punchy insight.

Today's Stats:
- Focus sessions completed: ${data.pomodoros}
- Total focus time: ${data.totalFocusMinutes} minutes
- Tasks completed: ${data.tasksCompleted}
- Breaks taken: ${data.breaksTaken}
- Peak productivity hours: ${data.peakHours || 'Not enough data'}
- Hours since last break: ${data.hoursSinceBreak || 'N/A'}

${data.needsRestReminder ? '⚠️ Note: User has not taken a break in over 3 hours.' : ''}

Response format (JSON):
{
  "insight": "2 sentences max, motivational and warm",
  "suggestion": "1 specific, actionable recommendation"
}
`;
```

**API Call:**
```typescript
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
const result = await model.generateContent(prompt);
const response = JSON.parse(result.response.text());
```

### 5.3 Fallback Behavior

| Failure Scenario | Fallback Response |
|-----------------|-------------------|
| Gemini API error | `insight: "Every focus session counts! Keep the momentum going."` |
| Rate limited | `{ error: "Please wait X minutes for next review" }` |
| No data for day | `insight: "Start a focus session to unlock your daily insights!"` |
| Network timeout | Cache last successful response, show with "Last updated: [time]" |

### 5.4 Rate Limiting

- **User limit**: 10 AI reviews per day (tracked in `daily_stats.ai_review_count`)
- **Implementation**: Check before calling Gemini, increment after success

---

## 6. Frontend Integration

### 6.1 TanStack Query Keys

```typescript
export const queryKeys = {
  tasks: {
    all: ['tasks'] as const,
    lists: () => [...queryKeys.tasks.all, 'list'] as const,
    list: (filters: TaskFilters) => [...queryKeys.tasks.lists(), filters] as const,
  },
  analytics: {
    summary: ['analytics', 'summary'] as const,
    history: (period: string, cursor?: string) => ['analytics', 'history', period, cursor] as const,
    insights: ['analytics', 'insights'] as const,
  },
  sessions: {
    all: ['sessions'] as const,
  }
};
```

### 6.2 React Components Structure

```
components/dashboard/
├── Timer-card.tsx        (existing)
├── Streak-card.tsx       (existing)
├── MIT-card.tsx          (existing, needs API integration)
├── Brain-dump-card.tsx  (existing, needs API integration)
├── AI-insights-card.tsx (needs backend integration)
├── Matcha-progress-card.tsx (needs analytics data)
├── Analytics-chart.tsx  (NEW - Recharts wrapper)
└── Hourly-heatmap.tsx   (NEW - optional visualization)
```

### 6.3 Zustand Store Updates

```typescript
// Current timer-store already tracks streak
// Need to add:
// - loadTasksFromServer()
// - loadAnalyticsFromServer()
// - invalidateOnSessionComplete()
```

---

## 7. Implementation Phases

### Phase 1: Database & Task API
- [ ] Create SQL migration for new tables
- [ ] Create `/api/tasks` route (GET, POST, PATCH, DELETE)
- [ ] Update MIT component to use API instead of localStorage
- [ ] Update Brain Dump component to use API

### Phase 2: Session Logging
- [ ] Add session_logs table
- [ ] Add daily_activity_log table
- [ ] Modify timer-service to call session logging on completion
- [ ] Add `was_break` handling

### Phase 3: Analytics Endpoints
- [ ] Create `/api/analytics/summary`
- [ ] Create `/api/analytics/history`
- [ ] Add peak hours calculation
- [ ] Implement caching with stale-while-revalidate

### Phase 4: Chart Components
- [ ] Create Analytics-chart component using Recharts
- [ ] Update Matcha-progress-card with real data
- [ ] Add weekly progress bar chart
- [ ] Optional: Hourly heatmap

### Phase 5: AI Integration
- [ ] Create `/api/ai/review` endpoint
- [ ] Integrate Gemini API
- [ ] Implement smart detection (rest, peak hours)
- [ ] Add fallback handling
- [ ] Implement rate limiting
- [ ] Update AI-insights-card to fetch from API

---

## 8. Visual Theme Reference

**Color Palette (from globals.css):**
- `--color-cream`: #FFFDEC (background)
- `--color-strawberry`: #FFCFCF (primary accent)
- `--color-strawberry-light`: #FFE2E2 (secondary)
- `--color-matcha`: #86A788 (success/active)
- `--color-matcha-light`: #B8D4B8 (highlights)

**Design System:**
- shadcn/ui with `radix-nova` style
- Tailwind CSS v4
- Rounded corners (`radius-xl`: 0.625rem * 1.4)

---

## 9. Environment Variables

```bash
# Supabase (existing)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Gemini AI (new)
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.0-flash

# Optional: Analytics cache duration
ANALYTICS_CACHE_SECONDS=300
AI_REVIEW_RATE_LIMIT=10
```

---

## 10. Security & Performance

### Security
- All endpoints require authentication (via middleware)
- RLS policies on all tables
- Input validation with Zod
- Rate limiting on AI endpoint

### Performance
- Parallel data fetching with Promise.all
- Cursor-based pagination for history
- Server-side aggregation (not client)
- Analytics caching (5 min default)