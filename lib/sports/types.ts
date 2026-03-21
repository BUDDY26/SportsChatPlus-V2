export const LEAGUES = [
  { id: "NFL", label: "NFL" },
  { id: "NBA", label: "NBA" },
  { id: "MLB", label: "MLB" },
  { id: "NCAAF", label: "NCAAF" },
  { id: "NCAAB_MEN", label: "NCAAB Men" },
  { id: "NCAAB_WOMEN", label: "NCAAB Women" },
  { id: "NCAA_BASEBALL", label: "NCAA Baseball" },
  { id: "NCAA_SOFTBALL", label: "NCAA Softball" },
] as const;

export type LeagueId = (typeof LEAGUES)[number]["id"];

export type GameStatus = "scheduled" | "live" | "final" | "postponed";

export interface GameScore {
  id: string;
  league: LeagueId;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: GameStatus;
  period: string;       // e.g. "Q3", "7th", "H2"
  startTime: string;    // ISO string or formatted time
  venue?: string;
}

export interface OddsGame {
  id: string;
  league: LeagueId;
  homeTeam: string;
  awayTeam: string;
  homeSpread: number;   // positive = home dog
  homeMoneyline: number;
  awayMoneyline: number;
  total: number;
  spreadMove: number;   // direction change
  startTime: string;
  book?: string;        // sportsbook name
}

export interface ChatMessageType {
  id: string;
  userId: string;
  userName: string;
  content: string;
  room: string;
  createdAt: string;
}

export interface AIInsight {
  league: LeagueId;
  text: string;
  generatedAt: string;
}

export interface FavoriteTeam {
  id: string;
  userId: string;
  teamName: string;
  league: LeagueId;
  teamId?: string;
}

// ─── Tournament ───────────────────────────────────────────────────────────────

export const TOURNAMENT_ROUNDS = [
  { round: 1, label: "First Round" },
  { round: 2, label: "Second Round" },
  { round: 3, label: "Sweet 16" },
  { round: 4, label: "Elite Eight" },
  { round: 5, label: "Final Four" },
  { round: 6, label: "Championship" },
] as const;

export type TournamentRound = (typeof TOURNAMENT_ROUNDS)[number]["round"];

export type TournamentRegion = string;

/**
 * A single matchup in the bracket.
 * score-driven: winnerId is derived from scores once status === "final".
 * progression-aware: nextMatchupId links this game to the game the winner advances to.
 */
export interface TournamentGame {
  id: string;
  round: TournamentRound;
  roundLabel: string;
  region: string | null;
  /** 1-based position within this round+region */
  slot: number;
  topTeamId: string | null;    // null = TBD (winner not yet determined)
  topTeamName: string;         // "TBD" when not yet known
  topTeamSeed: number | null;
  topScore: number;
  bottomTeamId: string | null;
  bottomTeamName: string;
  bottomTeamSeed: number | null;
  bottomScore: number;
  status: GameStatus;
  /** Team id of the winner; null while game is scheduled or live */
  winnerId: string | null;
  /** Which slot the winner occupied */
  winnerSlot: "top" | "bottom" | null;
  /** Id of the next TournamentGame the winner advances into */
  nextMatchupId: string | null;
  scheduledTime: string;
}

/**
 * A team's tournament entry — tracks seed, region, and current standing.
 */
export interface BracketEntry {
  teamId: string;
  teamName: string;
  seed: number;
  region: string | null;
  isEliminated: boolean;
  currentRound: TournamentRound;
}
