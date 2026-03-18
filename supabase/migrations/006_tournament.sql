-- Migration 006: Tournament Schema
--
-- Creates the full tournament bracket schema supporting multi-sport NCAA
-- tournaments (NCAAB Men/Women, NCAA Baseball, NCAA Softball, etc.).
-- Covers: tournaments, regions, teams, rounds, games, per-period scores,
-- and bracket entries with team progression tracking.
--
-- next_game_id on tournament_games is plain TEXT (no FK) to avoid
-- self-referencing insert-order constraint violations.
-- Reuses set_updated_at() trigger function defined in migration 001.
-- tournament_games is added to supabase_realtime for live score pushes.

-- ─── tournaments ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.tournaments (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT        NOT NULL,
  sport        TEXT        NOT NULL,
  gender       TEXT        NOT NULL,
  season_year  INTEGER     NOT NULL,
  format       TEXT        NOT NULL DEFAULT 'single_elimination',
  status       TEXT        NOT NULL DEFAULT 'upcoming',
  start_date   DATE,
  end_date     DATE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX tournaments_sport_season_idx ON public.tournaments(sport, season_year);

ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view tournaments"
  ON public.tournaments FOR SELECT
  TO authenticated
  USING (true);

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.tournaments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── tournament_regions ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.tournament_regions (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id   UUID        NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  name            TEXT        NOT NULL,
  display_order   INTEGER     NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.tournament_regions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view tournament_regions"
  ON public.tournament_regions FOR SELECT
  TO authenticated
  USING (true);

-- ─── tournament_teams ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.tournament_teams (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id     UUID        NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  region_id         UUID        NOT NULL REFERENCES public.tournament_regions(id) ON DELETE CASCADE,
  name              TEXT        NOT NULL,
  short_name        TEXT,
  seed              INTEGER,
  logo_url          TEXT,
  is_eliminated     BOOLEAN     DEFAULT false,
  eliminated_round  INTEGER,
  current_round     INTEGER     DEFAULT 1,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.tournament_teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view tournament_teams"
  ON public.tournament_teams FOR SELECT
  TO authenticated
  USING (true);

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.tournament_teams
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── tournament_rounds ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.tournament_rounds (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id   UUID        NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  name            TEXT        NOT NULL,
  round_number    INTEGER     NOT NULL,
  status          TEXT        NOT NULL DEFAULT 'upcoming',
  start_date      DATE,
  end_date        DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX tournament_rounds_tournament_round_idx ON public.tournament_rounds(tournament_id, round_number);

ALTER TABLE public.tournament_rounds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view tournament_rounds"
  ON public.tournament_rounds FOR SELECT
  TO authenticated
  USING (true);

-- ─── tournament_games ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.tournament_games (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id    UUID        NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  round_id         UUID        NOT NULL REFERENCES public.tournament_rounds(id) ON DELETE CASCADE,
  region_id        UUID        REFERENCES public.tournament_regions(id),
  top_team_id      UUID        REFERENCES public.tournament_teams(id),
  bottom_team_id   UUID        REFERENCES public.tournament_teams(id),
  winner_id        UUID        REFERENCES public.tournament_teams(id),
  loser_id         UUID        REFERENCES public.tournament_teams(id),
  winner_slot      TEXT,
  top_score        INTEGER     DEFAULT 0,
  bottom_score     INTEGER     DEFAULT 0,
  status           TEXT        NOT NULL DEFAULT 'scheduled',
  scheduled_time   TIMESTAMPTZ,
  actual_start_time TIMESTAMPTZ,
  period           INTEGER     DEFAULT 0,
  game_clock       TEXT,
  slot_number      INTEGER     NOT NULL,
  next_game_id     TEXT,
  is_play_in       BOOLEAN     DEFAULT false,
  venue_name       TEXT,
  venue_city       TEXT,
  tv_channel       TEXT,
  stream_url       TEXT,
  upset            BOOLEAN     DEFAULT false,
  upset_seed_diff  INTEGER,
  season_year      INTEGER     NOT NULL,
  sport            TEXT        NOT NULL,
  tournament_name  TEXT        NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX tournament_games_tournament_status_idx       ON public.tournament_games(tournament_id, status);
CREATE INDEX tournament_games_tournament_round_region_idx ON public.tournament_games(tournament_id, round_id, region_id);
CREATE INDEX tournament_games_next_game_idx               ON public.tournament_games(next_game_id);
CREATE INDEX tournament_games_winner_idx                  ON public.tournament_games(winner_id);

ALTER TABLE public.tournament_games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view tournament_games"
  ON public.tournament_games FOR SELECT
  TO authenticated
  USING (true);

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.tournament_games
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Enable Supabase Realtime for live score pushes
ALTER PUBLICATION supabase_realtime ADD TABLE public.tournament_games;

-- ─── tournament_game_scores ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.tournament_game_scores (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id    UUID        NOT NULL REFERENCES public.tournament_games(id) ON DELETE CASCADE,
  team_id    UUID        NOT NULL REFERENCES public.tournament_teams(id) ON DELETE CASCADE,
  period     INTEGER     NOT NULL,
  score      INTEGER     NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.tournament_game_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view tournament_game_scores"
  ON public.tournament_game_scores FOR SELECT
  TO authenticated
  USING (true);

-- ─── tournament_bracket_entries ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.tournament_bracket_entries (
  id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id       UUID        NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  team_id             UUID        NOT NULL REFERENCES public.tournament_teams(id) ON DELETE CASCADE,
  region_id           UUID        NOT NULL REFERENCES public.tournament_regions(id) ON DELETE CASCADE,
  seed                INTEGER     NOT NULL,
  current_round       INTEGER     NOT NULL DEFAULT 1,
  is_eliminated       BOOLEAN     NOT NULL DEFAULT false,
  eliminated_in_round INTEGER,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX tournament_bracket_entries_team_tournament_idx ON public.tournament_bracket_entries(team_id, tournament_id);

ALTER TABLE public.tournament_bracket_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view tournament_bracket_entries"
  ON public.tournament_bracket_entries FOR SELECT
  TO authenticated
  USING (true);

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.tournament_bracket_entries
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
