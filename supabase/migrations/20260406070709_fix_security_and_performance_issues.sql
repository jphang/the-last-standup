/*
  # Fix security and performance issues

  1. Indexes
    - Add index on `player_characters.user_id` (unindexed foreign key)
    - Add index on `player_characters.game_save_id` (unindexed foreign key)

  2. RLS Policy Optimization (all three tables)
    - Replace `auth.uid()` with `(select auth.uid())` in all RLS policies
    - This prevents re-evaluation of the auth function for each row, improving query performance
    - Affected tables: `game_saves`, `player_characters`, `profiles`

  3. Notes
    - Policies are dropped and recreated with the optimized pattern
    - No data is modified
    - No columns or tables are dropped
*/

-- 1. Add missing indexes on foreign keys
CREATE INDEX IF NOT EXISTS idx_player_characters_user_id ON player_characters (user_id);
CREATE INDEX IF NOT EXISTS idx_player_characters_game_save_id ON player_characters (game_save_id);

-- 2. Optimize game_saves RLS policies
DROP POLICY IF EXISTS "Users can view own game saves" ON game_saves;
CREATE POLICY "Users can view own game saves"
  ON game_saves FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can create own game saves" ON game_saves;
CREATE POLICY "Users can create own game saves"
  ON game_saves FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own game saves" ON game_saves;
CREATE POLICY "Users can update own game saves"
  ON game_saves FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own game saves" ON game_saves;
CREATE POLICY "Users can delete own game saves"
  ON game_saves FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- 3. Optimize player_characters RLS policies
DROP POLICY IF EXISTS "Users can view own characters" ON player_characters;
CREATE POLICY "Users can view own characters"
  ON player_characters FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can create own characters" ON player_characters;
CREATE POLICY "Users can create own characters"
  ON player_characters FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own characters" ON player_characters;
CREATE POLICY "Users can update own characters"
  ON player_characters FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own characters" ON player_characters;
CREATE POLICY "Users can delete own characters"
  ON player_characters FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- 4. Optimize profiles RLS policies
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));
