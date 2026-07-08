-- Add theme preference column to users table
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS theme_preference TEXT NOT NULL DEFAULT 'light-zen'
  CHECK (theme_preference IN ('light-zen', 'warm-earth', 'cozy-dark'));
