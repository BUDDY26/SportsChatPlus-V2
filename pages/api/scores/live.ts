import type { NextApiRequest, NextApiResponse } from "next";
import { getNBALiveGames, getNFLGames, getMLBGames } from "@/lib/sports/balldontlie";
import type { GameScore, GameStatus } from "@/lib/sports/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GameScore[]>
) {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  try {
    const [nba, nfl, mlb] = await Promise.allSettled([
      getNBALiveGames(),
      getNFLGames(),
      getMLBGames(),
    ]);

    const scores: GameScore[] = [];

    // NBA
    if (nba.status === "fulfilled") {
      nba.value.data.forEach((g) => {
        const status: GameStatus =
          g.status === "Final"
            ? "final"
            : g.period > 0
            ? "live"
            : "scheduled";
        scores.push({
          id: `nba-${g.id}`,
          league: "NBA",
          homeTeam: g.home_team.full_name,
          awayTeam: g.visitor_team.full_name,
          homeScore: g.home_team_score,
          awayScore: g.visitor_team_score,
          status,
          period: g.period > 0 ? `Q${g.period}` : "",
          startTime: new Date(g.date).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        });
      });
    }

    // NFL
    if (nfl.status === "fulfilled") {
      nfl.value.data.slice(0, 16).forEach((g) => {
        const status: GameStatus =
          g.status === "Final" ? "final" : g.status === "In Progress" ? "live" : "scheduled";
        scores.push({
          id: `nfl-${g.id}`,
          league: "NFL",
          homeTeam: g.home_team,
          awayTeam: g.away_team,
          homeScore: g.home_score,
          awayScore: g.away_score,
          status,
          period: "",
          startTime: new Date(g.date).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        });
      });
    }

    // MLB
    if (mlb.status === "fulfilled") {
      mlb.value.data.forEach((g) => {
        const status: GameStatus =
          g.status === "Final" ? "final" : g.inning > 0 ? "live" : "scheduled";
        scores.push({
          id: `mlb-${g.id}`,
          league: "MLB",
          homeTeam: g.home_team.full_name,
          awayTeam: g.visitor_team.full_name,
          homeScore: g.home_team_score,
          awayScore: g.visitor_team_score,
          status,
          period: g.inning > 0 ? `${g.inning}th` : "",
          startTime: new Date(g.date).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        });
      });
    }

    // Sort: live first, then scheduled, then final
    const order: Record<string, number> = { live: 0, scheduled: 1, final: 2 };
    scores.sort((a, b) => (order[a.status] ?? 3) - (order[b.status] ?? 3));

    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=60");
    return res.status(200).json(scores);
  } catch (error) {
    console.error("Scores API error:", error);
    return res.status(500).json([]);
  }
}
