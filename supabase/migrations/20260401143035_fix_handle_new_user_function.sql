/*
  # Fix handle_new_user trigger function

  The function was failing because it lacked an explicit search_path,
  causing the `profiles` table reference to fail in certain Supabase
  configurations. This fix:
  - Sets search_path explicitly to public
  - Uses fully qualified table name
  - Adds exception handling to prevent signup failures
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Player'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
EXCEPTION WHEN unique_violation THEN
  RETURN NEW;
END;
$$;