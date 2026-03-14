import type { NextApiRequest, NextApiResponse } from "next";
import { createAdminClient } from "@/lib/supabase";
import type { ChatMessageType } from "@/lib/sports/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChatMessageType[] | { error: string }>
) {
  if (req.method !== "GET") return res.status(405).end();

  const room = (req.query.room as string) ?? "general";
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("room", room)
    .order("created_at", { ascending: true })
    .limit(100);

  if (error) return res.status(500).json({ error: error.message });

  const messages: ChatMessageType[] = (data ?? []).map((m) => ({
    id: m.id,
    userId: m.user_id,
    userName: m.user_name,
    content: m.content,
    room: m.room,
    createdAt: m.created_at,
  }));

  return res.status(200).json(messages);
}
