import type { NextApiRequest, NextApiResponse } from "next";
import type { OddsGame, LeagueId } from "@/lib/sports/types";

/**
 * Odds endpoint — fetches real odds from The Odds API.
 * https://the-odds-api.com/
 * Returns [] for unsupported leagues or when THE_ODDS_API_KEY is not set.
 */

const BASE_URL = "https://api.the-odds-api.com/v4";

// LeagueId → The Odds API sport key (unsupported leagues are intentionally omitted)
const SPORT_KEYS: Partial<Record<LeagueId, string>> = {
  NFL: "americanfootball_nfl",
  NBA: "basketball_nba",
  MLB: "baseball_mlb",
  NCAAF: "americanfootball_ncaaf",
  NCAAB_MEN: "basketball_ncaab",
};

// --- Raw Odds API types ---

interface OddsOutcome {
  name: string;
  price: number;
  point?: number;
}

interface OddsMarket {
  key: string;
  outcomes: OddsOutcome[];
}

interface OddsBookmaker {
  title: string;
  markets: OddsMarket[];
}

interface OddsApiGame {
  id: string;
  home_team: string;
  away_team: string;
  commence_time: string;
  bookmakers: OddsBookmaker[];
}

// --- Helpers ---

function getMarketOutcome(
  markets: OddsMarket[],
  marketKey: string,
  teamName: string
): OddsOutcome | undefined {
  return markets
    .find((m) => m.key === marketKey)
    ?.outcomes.find((o) => o.name === teamName);
}

function getOverOutcome(markets: OddsMarket[]): OddsOutcome | undefined {
  return markets
    .find((m) => m.key === "totals")
    ?.outcomes.find((o) => o.name === "Over");
}

// --- Transformer ---

function transformGame(game: OddsApiGame, league: LeagueId): OddsGame {
  const bookmaker = game.bookmakers[0];
  const markets = bookmaker?.markets ?? [];

  return {
    id: game.id,
    league,
    homeTeam: game.home_team,
    awayTeam: game.away_team,
    homeSpread: getMarketOutcome(markets, "spreads", game.home_team)?.point ?? 0,
    homeMoneyline: getMarketOutcome(markets, "h2h", game.home_team)?.price ?? 0,
    awayMoneyline: getMarketOutcome(markets, "h2h", game.away_team)?.price ?? 0,
    total: getOverOutcome(markets)?.point ?? 0,
    spreadMove: 0, // The Odds API does not provide line movement data
    startTime: new Date(game.commence_time).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    book: bookmaker?.title,
  };
}

// --- Fetch ---

async function fetchOdds(league: LeagueId): Promise<OddsGame[]> {
  const apiKey = process.env.THE_ODDS_API_KEY;
  if (!apiKey) return [];

  const sportKey = SPORT_KEYS[league];
  if (!sportKey) return [];

  const url =
    `${BASE_URL}/sports/${sportKey}/odds/` +
    `?apiKey=${apiKey}&regions=us&markets=h2h,spreads,totals&oddsFormat=american`;

  const res = await fetch(url, { next: { revalidate: 120 } });
  if (!res.ok) {
    throw new Error(`The Odds API error ${res.status}: ${sportKey}`);
  }

  const games: OddsApiGame[] = await res.json();
  return games
    .filter((g) => g.bookmakers.length > 0)
    .map((g) => transformGame(g, league));
}

// --- Handler ---

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OddsGame[] | { error: string }>
) {
  if (req.method !== "GET") return res.status(405).end();

  const league = (req.query.league as LeagueId) ?? "NFL";

  try {
    const odds = await fetchOdds(league);
    res.setHeader("Cache-Control", "s-maxage=120, stale-while-revalidate=240");
    return res.status(200).json(odds);
  } catch (error) {
    console.error("Odds API error:", error);
    return res.status(500).json({ error: "Failed to fetch odds" });
  }
}
