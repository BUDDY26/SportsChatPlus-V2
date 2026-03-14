-- Rollback for Migration 005: Restore authenticated-only SELECT policy

DROP POLICY IF EXISTS "Anyone can read chat messages" ON public.chat_messages;

CREATE POLICY "Authenticated users can read messages"
  ON public.chat_messages FOR SELECT
  TO authenticated
  USING (true);
