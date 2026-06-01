-- RLS: allow authenticated users to read/insert their own row
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own user row"
  ON public.users
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own user row"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Auto-create public.users row when a new auth.users sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.users (user_id, email, username, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)),
    NOW()
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
