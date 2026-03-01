-- Migration 002: Favorite Teams

CREATE TABLE IF NOT EXISTS public.favorites (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_name   TEXT NOT NULL,
  league      TEXT NOT NULL,
  team_id     TEXT,                    -- external team ID (from BallDontLie etc.)
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id, team_name, league)   -- prevent duplicate favorites
);

CREATE INDEX favorites_user_id_idx ON public.favorites(user_id);

-- Row Level Security
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own favorites"
  ON public.favorites
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
