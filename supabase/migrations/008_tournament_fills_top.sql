-- Migration 008: Tournament fills_top_in_next
--
-- Adds fills_top_in_next to tournament_games to record whether the winner
-- of this game fills the top or bottom slot of the next game in the bracket.
-- Nullable — Championship game has no next game (NULL).
-- No default — value is set explicitly at scaffold creation time.

ALTER TABLE public.tournament_games
  ADD COLUMN IF NOT EXISTS fills_top_in_next BOOLEAN;
