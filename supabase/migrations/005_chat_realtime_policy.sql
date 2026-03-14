-- Migration 005: Relax chat_messages SELECT policy for Supabase Realtime
--
-- Context: V2 uses NextAuth for authentication, not Supabase Auth directly.
-- The browser Supabase client (anon key) never holds a Supabase JWT, so the
-- existing TO authenticated SELECT policy blocks Realtime subscriptions from
-- the browser. Chat messages are non-PII social data visible to all dashboard
-- users. The anon key is already public (NEXT_PUBLIC_SUPABASE_ANON_KEY).
-- INSERT and DELETE policies remain strictly auth-gated.
--
-- Rollback: 005_chat_realtime_policy_rollback.sql

DROP POLICY IF EXISTS "Authenticated users can read messages" ON public.chat_messages;

CREATE POLICY "Anyone can read chat messages"
  ON public.chat_messages FOR SELECT
  TO anon, authenticated
  USING (true);
