import type { NextApiRequest, NextApiResponse } from "next";
import { getSportsAnswer } from "@/lib/ai/chat";
import { z } from "zod";

const schema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    })
  ),
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

  const { messages } = parsed.data;
  const lastMessage = messages[messages.length - 1];
  if (!lastMessage || lastMessage.role !== "user") {
    return res.status(400).json({ error: "Last message must be from user" });
  }

  try {
    const content = await getSportsAnswer(lastMessage.content, messages.slice(0, -1));
    return res.status(200).json({ content });
  } catch (error) {
    console.error("AI chat error:", error);
    return res.status(500).json({ error: "Failed to get AI response" });
  }
}
