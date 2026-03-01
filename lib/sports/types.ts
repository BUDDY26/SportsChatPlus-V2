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
