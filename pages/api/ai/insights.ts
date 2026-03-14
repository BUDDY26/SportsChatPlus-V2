import type { NextApiRequest, NextApiResponse } from "next";
import { generateInsights } from "@/lib/ai/predictions";
import type { AIInsight, LeagueId } from "@/lib/sports/types";

const DEFAULT_LEAGUES: LeagueId[] = ["NFL", "NBA", "MLB", "NCAAF"];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AIInsight[] | { error: string }>
) {
  if (req.method !== "GET") return res.status(405).end();

  try {
    const insights = await generateInsights(DEFAULT_LEAGUES);
    // Cache for 10 minutes to save OpenAI costs
    res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate=120");
    return res.status(200).json(insights);
  } catch (error) {
    console.error("AI insights error:", error);
    return res.status(500).json({ error: "Failed to generate insights" });
  }
}
