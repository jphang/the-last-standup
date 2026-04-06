/*
  # Drop unused game_saves table and related references

  The `game_saves` table was part of the original schema but is not used
  anywhere in the application. Game state is persisted directly through
  `player_characters` records. The table contains 0 rows of data.

  1. Dropped Foreign Key Constraints
    - `player_characters_game_save_id_fkey` - FK from player_characters.game_save_id to game_saves.id

  2. Dropped Columns
    - `player_characters.game_save_id` (uuid, nullable) - unused reference to game_saves

  3. Dropped Indexes
    - `idx_player_characters_game_save_id` - index on the removed column

  4. Dropped RLS Policies (on game_saves)
    - "Users can view own game saves"
    - "Users can create own game saves"
    - "Users can update own game saves"
    - "Users can delete own game saves"

  5. Dropped Tables
    - `game_saves` (6 columns, 0 rows) - unused game save tracking

  6. Important Notes
    - The game_saves table contained zero rows of data
    - No application code references game_saves or game_save_id
    - Player characters are persisted directly without a separate save record
*/

-- 1. Drop the foreign key constraint from player_characters to game_saves
ALTER TABLE player_characters DROP CONSTRAINT IF EXISTS player_characters_game_save_id_fkey;

-- 2. Drop the index on the game_save_id column
DROP INDEX IF EXISTS idx_player_characters_game_save_id;

-- 3. Drop the game_save_id column from player_characters
ALTER TABLE player_characters DROP COLUMN IF EXISTS game_save_id;

-- 4. Drop the game_saves table (RLS policies are removed automatically)
DROP TABLE IF EXISTS game_saves;
