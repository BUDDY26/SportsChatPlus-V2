import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function streamSportsChat(messages: ChatMessage[]) {
  return openai.chat.completions.create({
    model: "gpt-4o-mini",
    stream: true,
    messages: [
      {
        role: "system",
        content: `You are SportsChatPlus AI, an expert sports analyst covering NFL, NBA, MLB, NCAAF, NCAAB, NCAA Baseball, and NCAA Softball.
You provide:
- Game analysis and predictions
- Player performance breakdowns
- Injury impact assessments
- Betting insights (educational, not financial advice)
- Historical context and stats

Be concise, engaging, and opinionated while staying factual. Today's date: ${new Date().toLocaleDateString()}.`,
      },
      ...messages,
    ],
    temperature: 0.8,
    max_tokens: 500,
  });
}

export async function getSportsAnswer(
  userMessage: string,
  history: ChatMessage[] = []
): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are SportsChatPlus AI, an expert sports analyst. Be concise and insightful.`,
      },
      ...history,
      { role: "user", content: userMessage },
    ],
    temperature: 0.8,
    max_tokens: 400,
  });

  return completion.choices[0]?.message?.content ?? "I couldn't generate a response.";
}
