import type { NextApiRequest, NextApiResponse } from "next";
import type { OddsGame, LeagueId } from "@/lib/sports/types";

/**
 * Odds endpoint — returns mock data until a live odds provider (e.g. The Odds API) is integrated.
 * Replace the stub below with: https://the-odds-api.com/
 */

function generateMockOdds(league: LeagueId): OddsGame[] {
  const matchups: Record<string, [string, string][]> = {
    NFL: [
      ["Kansas City Chiefs", "Buffalo Bills"],
      ["San Francisco 49ers", "Philadelphia Eagles"],
      ["Dallas Cowboys", "Miami Dolphins"],
    ],
    NBA: [
      ["Boston Celtics", "Los Angeles Lakers"],
      ["Golden State Warriors", "Phoenix Suns"],
      ["Milwaukee Bucks", "Denver Nuggets"],
    ],
    MLB: [
      ["New York Yankees", "Houston Astros"],
      ["Los Angeles Dodgers", "Atlanta Braves"],
      ["Chicago Cubs", "St. Louis Cardinals"],
    ],
    NCAAF: [
      ["Alabama", "Ohio State"],
      ["Georgia", "Michigan"],
    ],
    NCAAB_MEN: [
      ["Duke", "Kentucky"],
      ["Kansas", "Gonzaga"],
    ],
    NCAAB_WOMEN: [
      ["South Carolina", "UConn"],
      ["LSU", "Iowa"],
    ],
    NCAA_BASEBALL: [
      ["Vanderbilt", "LSU"],
      ["Florida", "Texas"],
    ],
    NCAA_SOFTBALL: [
      ["Oklahoma", "UCLA"],
      ["Florida State", "Arkansas"],
    ],
  };

  const games = matchups[league] ?? matchups.NFL;
  const books = ["DraftKings", "FanDuel", "BetMGM", "Caesars"];

  return games.map(([home, away], i) => ({
    id: `${league}-odds-${i}`,
    league,
    homeTeam: home,
    awayTeam: away,
    homeSpread: parseFloat((Math.random() * 14 - 7).toFixed(1)),
    homeMoneyline: Math.floor(Math.random() * 250) * (Math.random() > 0.5 ? 1 : -1),
    awayMoneyline: Math.floor(Math.random() * 250) * (Math.random() > 0.5 ? 1 : -1),
    total: parseFloat((40 + Math.random() * 30).toFixed(1)),
    spreadMove: parseFloat((Math.random() * 2 - 1).toFixed(1)),
    startTime: new Date(Date.now() + Math.random() * 86400000 * 3).toLocaleString(),
    book: books[Math.floor(Math.random() * books.length)],
  }));
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<OddsGame[] | { error: string }>
) {
  if (req.method !== "GET") return res.status(405).end();

  const league = (req.query.league as LeagueId) ?? "NFL";
  const odds = generateMockOdds(league);

  res.setHeader("Cache-Control", "s-maxage=120, stale-while-revalidate=240");
  return res.status(200).json(odds);
}
