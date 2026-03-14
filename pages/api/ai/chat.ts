import type { NextApiRequest, NextApiResponse } from "next";
import { getSportsAnswer } from "@/lib/ai/chat";
import { createAdminClient } from "@/lib/supabase";
import { z } from "zod";

const schema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    })
  ),
  userId: z.string().optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ content: string } | { error: string }>
) {
  if (req.method !== "POST") return res.status(405).end();

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request" });
  }

  const { messages, userId } = parsed.data;
  const lastMessage = messages[messages.length - 1];
  if (!lastMessage || lastMessage.role !== "user") {
    return res.status(400).json({ error: "Last message must be from user" });
  }

  try {
    const content = await getSportsAnswer(lastMessage.content, messages.slice(0, -1));

    // Log interaction — failure must never block the response
    if (userId) {
      try {
        await createAdminClient()
          .from("ai_interactions")
          .insert({
            user_id: userId,
            prompt: lastMessage.content,
            response: content,
            model: "gpt-4o-mini",
          });
      } catch (logError) {
        console.error("AI interaction logging failed:", logError);
      }
    }

    return res.status(200).json({ content });
  } catch (error) {
    console.error("AI chat error:", error);
    return res.status(500).json({ error: "Failed to get AI response" });
  }
}
