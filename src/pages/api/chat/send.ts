import type { NextApiRequest, NextApiResponse } from "next";
import { createAdminClient } from "@/lib/supabase";
import { z } from "zod";
import type { ChatMessageType } from "@/lib/sports/types";

const schema = z.object({
  userId: z.string().min(1),
  userName: z.string().min(1),
  content: z.string().min(1).max(500),
  room: z.string().default("general"),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChatMessageType | { error: string }>
) {
  if (req.method !== "POST") return res.status(405).end();

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message });
  }

  const { userId, userName, content, room } = parsed.data;
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("chat_messages")
    .insert({ user_id: userId, user_name: userName, content, room })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  const msg: ChatMessageType = {
    id: data.id,
    userId: data.user_id,
    userName: data.user_name,
    content: data.content,
    room: data.room,
    createdAt: data.created_at,
  };

  return res.status(201).json(msg);
}
