import OpenAI from "openai";
import type { AIInsight, LeagueId } from "@/lib/sports/types";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateInsights(leagues: LeagueId[]): Promise<AIInsight[]> {
  const prompt = `You are a professional sports analyst. Provide one brief, insightful observation (2-3 sentences) for each of the following leagues based on current trends: ${leagues.join(", ")}.

Format your response as a JSON array:
[
  { "league": "NFL", "text": "..." },
  { "league": "NBA", "text": "..." }
]

Be specific, analytical, and engaging. Focus on current season trends, key players, or upcoming matchups.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";

  try {
    const parsed = JSON.parse(raw);
    const insights: AIInsight[] = (parsed.insights ?? parsed).map((item: { league: LeagueId; text: string }) => ({
      league: item.league,
      text: item.text,
      generatedAt: new Date().toISOString(),
    }));
    return insights;
  } catch {
    return [];
  }
}

export async function generateGamePrediction(
  homeTeam: string,
  awayTeam: string,
  league: string
): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a sharp sports analyst. Give concise, data-driven game predictions.",
      },
      {
        role: "user",
        content: `Analyze the matchup: ${awayTeam} @ ${homeTeam} (${league}). Give a 3-4 sentence prediction covering key factors and your expected outcome.`,
      },
    ],
    temperature: 0.7,
    max_tokens: 200,
  });

  return completion.choices[0]?.message?.content ?? "Unable to generate prediction.";
}
