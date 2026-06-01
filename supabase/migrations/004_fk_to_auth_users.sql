-- Change tasks.user_id FK from public.users to auth.users
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS Tasks_user_id_fkey;
ALTER TABLE tasks ADD CONSTRAINT Tasks_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
