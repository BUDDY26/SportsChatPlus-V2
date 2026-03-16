/**
 * Henry's NCAA API client
 * Docs: https://ncaa-api.henrygd.me
 * Public API — no authentication required.
 * Supports: NCAAF, NCAAB_MEN, NCAAB_WOMEN, NCAA_BASEBALL, NCAA_SOFTBALL
 */

import type { GameScore, GameStatus, LeagueId } from "./types";

const BASE_URL = "https://ncaa-api.henrygd.me";

// --- League → API path map ---

const NCAA_PATHS: Partial<Record<LeagueId, string>> = {
  NCAAF: "/scoreboard/football/fbs",
  NCAAB_MEN: "/scoreboard/basketball-men/d1",
  NCAAB_WOMEN: "/scoreboard/basketball-women/d1",
  NCAA_BASEBALL: "/scoreboard/baseball/d1",
  NCAA_SOFTBALL: "/scoreboard/softball/d1",
};

// --- Raw response types ---

interface HenryTeam {
  names: { full: string; short?: string };
  score?: string;
}

interface HenryGame {
  gameID: string;
  away: HenryTeam;
  home: HenryTeam;
  gameState: string; // "pre" | "live" | "final"
  startTime?: string;
  startDate?: string;
  currentPeriod?: string;
}

interface HenryScoreboardResponse {
  games?: Array<{ game: HenryGame }>;
}

// --- Status mapping ---

function toGameStatus(gameState: string): GameStatus {
  switch (gameState.toLowerCase()) {
    case "live":
      return "live";
    case "final":
      return "final";
    default:
      return "scheduled";
  }
}

// --- Transformer ---

function transformGame(game: HenryGame, league: LeagueId): GameScore {
  const homeScore = parseInt(game.home.score ?? "", 10);
  const awayScore = parseInt(game.away.score ?? "", 10);

  return {
    id: `ncaa-${league}-${game.gameID}`,
    league,
    homeTeam: game.home.names.full,
    awayTeam: game.away.names.full,
    homeScore: isNaN(homeScore) ? 0 : homeScore,
    awayScore: isNaN(awayScore) ? 0 : awayScore,
    status: toGameStatus(game.gameState),
    period: game.currentPeriod ?? "",
    startTime: game.startTime ?? "",
  };
}

// --- Public fetch function ---

export async function getNCAAScorebord(league: LeagueId): Promise<GameScore[]> {
  const path = NCAA_PATHS[league];
  if (!path) return [];

  const res = await fetch(`${BASE_URL}${path}`, {
    next: { revalidate: 30 },
  });

  if (!res.ok) {
    throw new Error(`Henry NCAA API error ${res.status}: ${path}`);
  }

  const data: HenryScoreboardResponse = await res.json();

  if (!data.games?.length) return [];

  return data.games.map(({ game }) => transformGame(game, league));
}
