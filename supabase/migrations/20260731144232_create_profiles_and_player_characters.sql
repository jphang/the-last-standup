/*
# Create profiles and player_characters tables

## Overview
Sets up the full database schema for "The Last Standup" game. This is a
multi-user app with a sign-in screen, so every table is owner-scoped using
`auth.uid()` and policies are restricted to `authenticated` users.

## 1. New Tables

### profiles
One row per registered user, created automatically on signup via a trigger.
- `id` (uuid, primary key) -- matches the user's id in `auth.users`.
- `display_name` (text) -- name shown in the UI; defaults to the user's email
  local-part until they set one.
- `avatar_url` (text) -- reserved for a future avatar image URL.
- `is_premium` (boolean, default false) -- whether the user has the "Paying to
  Win" premium tier active.
- `premium_expires_at` (timestamptz, nullable) -- when the premium
  subscription expires / renews.
- `stripe_customer_id` (text, nullable) -- Stripe customer id used by the
  checkout / webhook / verify edge functions.
- `subscription_status` (text, default 'free') -- one of 'free', 'active', or
  'cancelling'. Constrained by a CHECK.
- `created_at` / `updated_at` (timestamptz) -- audit timestamps.

### player_characters
The game agents a user recruits. A user can have many.
- `id` (uuid, primary key).
- `user_id` (uuid, not null, defaults to `auth.uid()`) -- owner. Foreign key
  to `auth.users` with `ON DELETE CASCADE` so characters are removed when the
  user is deleted.
- `name` (text, not null) -- agent name chosen by the player.
- `character_key` (text, not null) -- one of the class keys (ceo, devops,
  fullstack, designer, qa, intern, support, pm, sales, recruiter).
- `level` (int, default 1).
- `exp` (int, default 0) -- experience points, 0-100 per level.
- `max_hp` / `current_hp` (int) -- hit points.
- `attack` / `defense` (int) -- combat stats.
- `battles_won` / `battles_lost` / `boss_defeats` (int, default 0) -- records.
- `created_at` / `updated_at` (timestamptz).

## 2. Trigger: auto-create profile on signup
A `handle_new_user` PL/pgSQL function (SECURITY DEFINER) inserts a row into
`profiles` whenever a new row is added to `auth.users`. It pulls the display
name from the user's `raw_user_meta_data->>'full_name'` (set during email
sign-up) and falls back to the email local-part. A trigger fires this
function `AFTER INSERT ON auth.users`.

## 3. Security (Row Level Security)
- RLS is enabled on both `profiles` and `player_characters`.
- `profiles`: a user can SELECT and UPDATE only their own row (id = auth.uid()).
  INSERT is handled by the SECURITY DEFINER trigger, so no direct INSERT
  policy is granted to `authenticated`. DELETE is not exposed.
- `player_characters`: full owner-scoped CRUD. `user_id` defaults to
  `auth.uid()` so inserts that omit `user_id` (as the frontend does) still
  satisfy the INSERT policy's `WITH CHECK (auth.uid() = user_id)`.
- The Stripe edge functions operate with the service role key, which bypasses
  RLS, so they can read and update `profiles` freely.

## 4. Indexes
- `player_characters(user_id)` for fast per-user listing.
- `profiles(stripe_customer_id)` for webhook lookups by Stripe customer id.

## 5. Important notes
1. This migration is idempotent: tables, indexes, policies, and the trigger
   use `IF NOT EXISTS` / drop-before-create so it is safe to re-run after a
   timeout.
2. `subscription_status` is constrained to the three valid values; any other
   value will be rejected at the database level.
3. The `handle_new_user` function is `SECURITY DEFINER` so it can insert into
   `profiles` even though RLS blocks direct `authenticated` inserts. Its
   `search_path` is locked to `public` to prevent schema-injection.
*/

-- =========================================================
-- profiles
-- =========================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '',
  avatar_url text NOT NULL DEFAULT '',
  is_premium boolean NOT NULL DEFAULT false,
  premium_expires_at timestamptz,
  stripe_customer_id text,
  subscription_status text NOT NULL DEFAULT 'free'
    CHECK (subscription_status IN ('free', 'active', 'cancelling')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON public.profiles;
CREATE POLICY "select_own_profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON public.profiles;
CREATE POLICY "update_own_profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE INDEX IF NOT EXISTS profiles_stripe_customer_id_idx
  ON public.profiles (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- =========================================================
-- player_characters
-- =========================================================
CREATE TABLE IF NOT EXISTS public.player_characters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid()
    REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  character_key text NOT NULL,
  level integer NOT NULL DEFAULT 1,
  exp integer NOT NULL DEFAULT 0,
  max_hp integer NOT NULL,
  current_hp integer NOT NULL,
  attack integer NOT NULL,
  defense integer NOT NULL,
  battles_won integer NOT NULL DEFAULT 0,
  battles_lost integer NOT NULL DEFAULT 0,
  boss_defeats integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.player_characters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_characters" ON public.player_characters;
CREATE POLICY "select_own_characters"
  ON public.player_characters FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_characters" ON public.player_characters;
CREATE POLICY "insert_own_characters"
  ON public.player_characters FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_characters" ON public.player_characters;
CREATE POLICY "update_own_characters"
  ON public.player_characters FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_characters" ON public.player_characters;
CREATE POLICY "delete_own_characters"
  ON public.player_characters FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS player_characters_user_id_idx
  ON public.player_characters (user_id);

-- =========================================================
-- Auto-create profile on signup
-- =========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
