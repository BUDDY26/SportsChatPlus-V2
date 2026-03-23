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

// --- Raw response types (reflect actual Henry API shapes) ---

interface HenryScoreboardGame {
  gameID: string;
  gameState: string; // "pre" | "live" | "final"
  startTime?: string;
  startTimeEpoch?: string;
  startDate?: string;
  currentPeriod?: string;
}

interface HenryScoreboardResponse {
  games?: Array<{ game: HenryScoreboardGame }>;
}

interface HenryContestTeam {
  nameFull: string;
  nameShort?: string;
  score?: string;
  isHome: boolean;
}

interface HenryContest {
  teams: HenryContestTeam[];
  gameState: string;
  currentPeriod?: string;
}

interface HenryContestResponse {
  contests?: HenryContest[];
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

// --- Public fetch function ---

export async function getNCAAScorebord(league: LeagueId): Promise<GameScore[]> {
  const path = NCAA_PATHS[league];
  if (!path) return [];

  // Phase 1: fetch scoreboard to get gameIDs and basic metadata
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  const res = await fetch(`${BASE_URL}${path}`, {
    next: { revalidate: 30 },
    signal: controller.signal,
  }).finally(() => clearTimeout(timer));

  if (!res.ok) {
    throw new Error(`Henry NCAA API error ${res.status}: ${path}`);
  }

  const data: HenryScoreboardResponse = await res.json();

  if (!data.games?.length) return [];

  const scoreboardGames = data.games.map(({ game }) => game);

  // Filter, sort, and cap before Phase 2 to prevent Vercel timeout on high-volume leagues
  const activeGames = scoreboardGames.filter((g) => g.gameState.toLowerCase() !== "final");
  const sorted = activeGames.sort((a, b) => {
    const order: Record<string, number> = { live: 0, pre: 1 };
    return (order[a.gameState.toLowerCase()] ?? 2) - (order[b.gameState.toLowerCase()] ?? 2);
  });
  const capped = sorted.slice(0, 25);

  // Phase 2: fetch individual game detail for each gameID in parallel
  const detailResults = await Promise.allSettled(
    capped.map((g) => {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 5000);
      return fetch(`${BASE_URL}/game/${g.gameID}`, { next: { revalidate: 30 }, signal: ctrl.signal })
        .finally(() => clearTimeout(timer))
        .then((r) => {
          if (!r.ok) throw new Error(`Henry game error ${r.status}: ${g.gameID}`);
          return r.json() as Promise<HenryContestResponse>;
        });
    })
  );

  const scores: GameScore[] = [];

  for (let i = 0; i < capped.length; i++) {
    const sbGame = capped[i];
    const result = detailResults[i];

    if (result.status === "rejected") continue;

    const contest = result.value.contests?.[0];
    if (!contest) continue;

    const homeTeam = contest.teams.find((t) => t.isHome);
    const awayTeam = contest.teams.find((t) => !t.isHome);

    const homeScore = parseInt(homeTeam?.score ?? "0", 10);
    const awayScore = parseInt(awayTeam?.score ?? "0", 10);

    scores.push({
      id: `ncaa-${league}-${sbGame.gameID}`,
      league,
      homeTeam: homeTeam?.nameFull ?? "",
      awayTeam: awayTeam?.nameFull ?? "",
      homeScore: isNaN(homeScore) ? 0 : homeScore,
      awayScore: isNaN(awayScore) ? 0 : awayScore,
      status: toGameStatus(sbGame.gameState),
      period: sbGame.currentPeriod ?? "",
      startTime: sbGame.startTimeEpoch
        ? new Date(Number(sbGame.startTimeEpoch) * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZone: "America/New_York" })
        : (sbGame.startTime ?? ""),
    });
  }

  return scores;
}
