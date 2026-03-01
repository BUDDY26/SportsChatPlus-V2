-- Migration 003: Community Chat Messages

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name   TEXT NOT NULL,
  content     TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 500),
  room        TEXT NOT NULL DEFAULT 'general',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX chat_messages_room_idx ON public.chat_messages(room, created_at DESC);
CREATE INDEX chat_messages_user_idx ON public.chat_messages(user_id);

-- Row Level Security
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read messages
CREATE POLICY "Authenticated users can read messages"
  ON public.chat_messages FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can insert their own messages
CREATE POLICY "Authenticated users can send messages"
  ON public.chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own messages (moderation)
CREATE POLICY "Users can delete their own messages"
  ON public.chat_messages FOR DELETE
  USING (auth.uid() = user_id);

-- Enable Supabase Realtime for live chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
