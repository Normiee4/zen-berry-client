-- Required unique constraints for Zen Berry Client upserts
-- Run these in Supabase SQL Editor

ALTER TABLE daily_stats
  ADD CONSTRAINT daily_stats_user_date_unique
  UNIQUE (user_id, date);

ALTER TABLE daily_activity_log
  ADD CONSTRAINT daily_activity_log_user_date_hour_unique
  UNIQUE (user_id, date, hour_slot);

ALTER TABLE ai_insights
  ADD CONSTRAINT ai_insights_user_insight_date_unique
  UNIQUE (user_id, insight_date);
