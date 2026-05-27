-- RLS policies for daily_stats table
-- Required for timer-service and tasks API to record pomodoro/task completions

ALTER TABLE public.daily_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily stats"
  ON public.daily_stats
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily stats"
  ON public.daily_stats
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily stats"
  ON public.daily_stats
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS policies for session_logs (used by timer-service and sessions API)

ALTER TABLE public.session_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
  ON public.session_logs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON public.session_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS policies for daily_activity_log (used by analytics)

ALTER TABLE public.daily_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity"
  ON public.daily_activity_log
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity"
  ON public.daily_activity_log
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activity"
  ON public.daily_activity_log
  FOR UPDATE
  USING (auth.uid() = user_id);
