/**
 * BallDontLie API client
 * Docs: https://www.balldontlie.io/
 * Supports: NBA, NFL, MLB
 */

const BASE_URL = "https://api.balldontlie.io/v1";
const API_KEY = process.env.BALLDONTLIE_API_KEY ?? "";

const headers = {
  Authorization: API_KEY,
  "Content-Type": "application/json",
};

async function fetchBDL<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, { headers, next: { revalidate: 60 } });
  if (!res.ok) {
    throw new Error(`BallDontLie API error ${res.status}: ${path}`);
  }
  return res.json();
}

// --- NBA ---

export async function getNBAGames(date?: string) {
  const dateParam = date ?? new Date().toISOString().split("T")[0];
  return fetchBDL<{ data: BDLGame[] }>(`/games?dates[]=${dateParam}&per_page=100`);
}

export async function getNBALiveGames() {
  return fetchBDL<{ data: BDLGame[] }>("/games/live");
}

// --- NFL ---

export async function getNFLGames(season?: number) {
  const yr = season ?? new Date().getFullYear();
  return fetchBDL<{ data: BDLNFLGame[] }>(`/nfl/games?seasons[]=${yr}&per_page=100`);
}

// --- MLB ---

export async function getMLBGames(date?: string) {
  const dateParam = date ?? new Date().toISOString().split("T")[0];
  return fetchBDL<{ data: BDLMLBGame[] }>(`/mlb/games?dates[]=${dateParam}&per_page=100`);
}

// --- Types ---

export interface BDLGame {
  id: number;
  date: string;
  home_team: { full_name: string };
  visitor_team: { full_name: string };
  home_team_score: number;
  visitor_team_score: number;
  status: string;
  period: number;
  time: string;
}

export interface BDLNFLGame {
  id: number;
  date: string;
  home_team: string;
  away_team: string;
  home_score: number;
  away_score: number;
  status: string;
}

export interface BDLMLBGame {
  id: number;
  date: string;
  home_team: { full_name: string };
  visitor_team: { full_name: string };
  home_team_score: number;
  visitor_team_score: number;
  status: string;
  inning: number;
}
