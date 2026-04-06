/*
  # Add profiles table and update player_characters for Hostile Takeover

  1. New Tables
    - `profiles`
      - `id` (uuid, PK, references auth.users)
      - `display_name` (text) - Player's display name
      - `avatar_url` (text) - Google avatar
      - `is_premium` (boolean) - "Paying to Win" status
      - `premium_expires_at` (timestamptz) - Subscription expiry
      - `stripe_customer_id` (text) - Stripe reference
      - `created_at` / `updated_at`

  2. Modified Tables
    - `player_characters`
      - Added `name` (text) - Custom character name
      - Added `battles_won` (integer) - Win count
      - Added `battles_lost` (integer) - Loss count
      - Made `game_save_id` nullable for standalone characters

  3. Security
    - RLS on profiles with authenticated-only policies
    - Existing RLS on player_characters preserved

  4. Functions
    - `handle_new_user()` trigger to auto-create profiles on signup
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '',
  avatar_url text DEFAULT '',
  is_premium boolean NOT NULL DEFAULT false,
  premium_expires_at timestamptz,
  stripe_customer_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'player_characters' AND column_name = 'name'
  ) THEN
    ALTER TABLE player_characters ADD COLUMN name text NOT NULL DEFAULT 'Unnamed Hero';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'player_characters' AND column_name = 'battles_won'
  ) THEN
    ALTER TABLE player_characters ADD COLUMN battles_won integer NOT NULL DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'player_characters' AND column_name = 'battles_lost'
  ) THEN
    ALTER TABLE player_characters ADD COLUMN battles_lost integer NOT NULL DEFAULT 0;
  END IF;
END $$;

ALTER TABLE player_characters ALTER COLUMN game_save_id DROP NOT NULL;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Player'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();