-- Zen Berry Database Migration
-- Phase 1: Tasks and Session Logging

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TASKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
  task_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  is_mit BOOLEAN DEFAULT FALSE,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_type ON tasks(user_id, is_mit);
CREATE INDEX IF NOT EXISTS idx_tasks_user_completed ON tasks(user_id, completed);

-- RLS Policies
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own tasks" ON tasks;
CREATE POLICY "Users can manage own tasks" ON tasks
  FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- SESSION LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS session_logs (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INT NOT NULL,
  was_break BOOLEAN DEFAULT FALSE,
  preset_used TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for analytics queries
CREATE INDEX IF NOT EXISTS idx_session_logs_user_date ON session_logs(user_id, date(completed_at));
CREATE INDEX IF NOT EXISTS idx_session_logs_user ON session_logs(user_id);

-- RLS Policies
ALTER TABLE session_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can see own sessions" ON session_logs;
CREATE POLICY "Users can see own sessions" ON session_logs
  FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- DAILY ACTIVITY LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS daily_activity_log (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  hour_slot INT NOT NULL CHECK (hour_slot >= 0 AND hour_slot <= 23),
  pomodoros_completed INT DEFAULT 0,
  tasks_completed INT DEFAULT 0,
  UNIQUE(user_id, date, hour_slot)
);

-- Index for peak hours calculation
CREATE INDEX IF NOT EXISTS idx_activity_log_user_date ON daily_activity_log(user_id, date);

-- RLS Policies
ALTER TABLE daily_activity_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can see own activity" ON daily_activity_log;
CREATE POLICY "Users can see own activity" ON daily_activity_log
  FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- ENHANCE DAILY_STATS TABLE (if needed)
-- ============================================
-- Add ai_review_count for rate limiting
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'daily_stats' AND column_name = 'ai_review_count'
  ) THEN
    ALTER TABLE daily_stats ADD COLUMN ai_review_count INT DEFAULT 0;
  END IF;
END $$;

-- ============================================
-- SQL FUNCTIONS FOR ATOMIC OPERATIONS
-- ============================================

-- Function to increment pomodoro in daily_activity_log
CREATE OR REPLACE FUNCTION increment_pomodoro(
  p_user_id UUID,
  p_date DATE,
  p_hour_slot INT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO daily_activity_log (user_id, date, hour_slot, pomodoros_completed)
  VALUES (p_user_id, p_date, p_hour_slot, 1)
  ON CONFLICT (user_id, date, hour_slot)
  DO UPDATE SET
    pomodoros_completed = daily_activity_log.pomodoros_completed + 1;
END;
$$;

-- Function to increment tasks completed in daily_activity_log
CREATE OR REPLACE FUNCTION increment_task_completed(
  p_user_id UUID,
  p_date DATE,
  p_hour_slot INT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO daily_activity_log (user_id, date, hour_slot, tasks_completed)
  VALUES (p_user_id, p_date, p_hour_slot, 1)
  ON CONFLICT (user_id, date, hour_slot)
  DO UPDATE SET
    tasks_completed = daily_activity_log.tasks_completed + 1;
END;
$$;