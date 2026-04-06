/*
  # Add boss defeats counter to player characters

  1. Modified Tables
    - `player_characters`
      - Added `boss_defeats` (integer, default 0) - tracks how many times
        this character has defeated Dr. Marcus Pivot

  2. Notes
    - Uses IF NOT EXISTS check to safely add column
    - Default value of 0 ensures existing characters start with no recorded boss defeats
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'player_characters' AND column_name = 'boss_defeats'
  ) THEN
    ALTER TABLE player_characters ADD COLUMN boss_defeats integer DEFAULT 0 NOT NULL;
  END IF;
END $$;