-- Migration 007: Tournament External IDs
--
-- Adds external_game_id to tournament_games and external_team_id to
-- tournament_teams to support safe upserts against the Henry NCAA API.
-- Both columns are nullable TEXT — no FK constraints.

-- ─── tournament_games: external_game_id ───────────────────────────────────────

ALTER TABLE public.tournament_games
  ADD COLUMN IF NOT EXISTS external_game_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_tournament_games_external_id
  ON public.tournament_games(external_game_id);

-- ─── tournament_teams: external_team_id ───────────────────────────────────────

ALTER TABLE public.tournament_teams
  ADD COLUMN IF NOT EXISTS external_team_id TEXT;

CREATE INDEX IF NOT EXISTS idx_tournament_teams_external_id
  ON public.tournament_teams(external_team_id);
