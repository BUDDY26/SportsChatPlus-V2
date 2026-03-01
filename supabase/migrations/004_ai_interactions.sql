-- Migration 004: AI Interactions Log

CREATE TABLE IF NOT EXISTS public.ai_interactions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt      TEXT NOT NULL,
  response    TEXT NOT NULL,
  model       TEXT NOT NULL DEFAULT 'gpt-4o-mini',
  tokens_used INTEGER,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX ai_interactions_user_idx ON public.ai_interactions(user_id, created_at DESC);

-- Row Level Security
ALTER TABLE public.ai_interactions ENABLE ROW LEVEL SECURITY;

-- Users can only read their own interactions
CREATE POLICY "Users can read their own AI interactions"
  ON public.ai_interactions FOR SELECT
  USING (auth.uid() = user_id);

-- Service role inserts (via API)
CREATE POLICY "Service role can insert AI interactions"
  ON public.ai_interactions FOR INSERT
  TO service_role
  WITH CHECK (true);
