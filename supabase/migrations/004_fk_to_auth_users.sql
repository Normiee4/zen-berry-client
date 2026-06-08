-- Re-point all user_id FKs from public.users to auth.users
-- Uses dynamic naming to handle any FK constraint name (e.g. Task_user_id_fkey,
-- tasks_user_id_fkey, etc.) that PostgreSQL may auto-generate.
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT tc.table_name, tc.constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_name = kcu.table_name
      AND tc.table_schema = kcu.table_schema
    WHERE tc.table_schema = 'public'
      AND tc.table_name IN ('tasks', 'timer_presets', 'ai_insights', 'daily_stats')
      AND kcu.column_name = 'user_id'
      AND tc.constraint_type = 'FOREIGN KEY'
  LOOP
    EXECUTE format('ALTER TABLE %I DROP CONSTRAINT %I', rec.table_name, rec.constraint_name);
    EXECUTE format(
      'ALTER TABLE %I ADD CONSTRAINT %I FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE',
      rec.table_name,
      rec.table_name || '_user_id_fkey'
    );
  END LOOP;
END $$;
