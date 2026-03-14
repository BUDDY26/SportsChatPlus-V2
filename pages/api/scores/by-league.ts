import type { NextApiRequest, NextApiResponse } from "next";
import { getNBALiveGames, getNFLGames, getMLBGames } from "@/lib/sports/balldontlie";
import type { GameScore, LeagueId } from "@/lib/sports/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GameScore[] | { error: string }>
) {
  if (req.method !== "GET") return res.status(405).end();

  const league = (req.query.league as LeagueId) ?? "NBA";

  try {
    let scores: GameScore[] = [];

    if (league === "NBA") {
      const { data } = await getNBALiveGames();
      scores = data.map((g) => ({
        id: `nba-${g.id}`,
        league: "NBA",
        homeTeam: g.home_team.full_name,
        awayTeam: g.visitor_team.full_name,
        homeScore: g.home_team_score,
        awayScore: g.visitor_team_score,
        status: g.status === "Final" ? "final" : g.period > 0 ? "live" : "scheduled",
        period: g.period > 0 ? `Q${g.period}` : "",
        startTime: new Date(g.date).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));
    } else if (league === "NFL") {
      const { data } = await getNFLGames();
      scores = data.slice(0, 16).map((g) => ({
        id: `nfl-${g.id}`,
        league: "NFL",
        homeTeam: g.home_team,
        awayTeam: g.away_team,
        homeScore: g.home_score,
        awayScore: g.away_score,
        status:
          g.status === "Final" ? "final" : g.status === "In Progress" ? "live" : "scheduled",
        period: "",
        startTime: new Date(g.date).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));
    } else if (league === "MLB") {
      const { data } = await getMLBGames();
      scores = data.map((g) => ({
        id: `mlb-${g.id}`,
        league: "MLB",
        homeTeam: g.home_team.full_name,
        awayTeam: g.visitor_team.full_name,
        homeScore: g.home_team_score,
        awayScore: g.visitor_team_score,
        status: g.status === "Final" ? "final" : g.inning > 0 ? "live" : "scheduled",
        period: g.inning > 0 ? `${g.inning}th` : "",
        startTime: new Date(g.date).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));
    } else {
      // NCAA leagues — placeholder (integrate a dedicated NCAA data source)
      scores = [];
    }

    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=60");
    return res.status(200).json(scores);
  } catch (error) {
    console.error("by-league scores error:", error);
    return res.status(500).json({ error: "Failed to fetch scores" });
  }
}
