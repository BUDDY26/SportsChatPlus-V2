/**
 * scripts/sync-tournament.ts
 *
 * Fetches live NCAA tournament data from the Henry NCAA API and upserts
 * it into Supabase tournament tables.
 *
 * Run: npx ts-node -r dotenv/config scripts/sync-tournament.ts
 *   or: npm run sync:tournament
 */

import * as dotenv from "dotenv";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// ─── Environment check ────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("ERROR: Missing required environment variables:");
  if (!SUPABASE_URL) console.error("  - NEXT_PUBLIC_SUPABASE_URL");
  if (!SUPABASE_SERVICE_KEY) console.error("  - SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE_URL = "https://ncaa-api.henrygd.me";
const RATE_LIMIT_MS = 200;

const ROUND_LABELS: Record<number, string> = {
  1: "First Round",
  2: "Second Round",
  3: "Sweet 16",
  4: "Elite Eight",
  5: "Final Four",
  6: "Championship",
};

// ─── Tournament configs ───────────────────────────────────────────────────────

const TOURNAMENT_CONFIGS = [
  {
    sport: "basketball-men",
    supabaseSport: "basketball",
    supabaseGender: "mens",
    name: "2026 DI Men's Basketball Championship",
    season_year: 2025,
    dates: ["2026/03/19", "2026/03/20", "2026/03/21", "2026/03/22"],
  },
  {
    sport: "basketball-women",
    supabaseSport: "basketball",
    supabaseGender: "womens",
    name: "2026 DI Women's Basketball Championship",
    season_year: 2025,
    dates: ["2026/03/20", "2026/03/21", "2026/03/22", "2026/03/23"],
  },
] as const;

// ─── Henry API types ──────────────────────────────────────────────────────────

interface HenryScoreboardEntry {
  game: {
    gameID: string;
    bracketRound: number | string | null | undefined;
    gameState: string;
  };
}

interface HenryTeam {
  teamId: string;
  isHome: boolean;
  nameShort: string;
  nameFull: string;
  name6Char: string;
  seoname: string;
  seed: number | null;
  score: number;
  isWinner: boolean;
  record?: string;
  color?: string;
}

interface HenryLinescore {
  period: string;
  home: string;
  visit: string;
}

interface HenryContest {
  id: string;
  gameState: string;
  network: string;
  startTimeEpoch: number;
  teams: HenryTeam[];
  linescores: HenryLinescore[];
  championshipGame: {
    round: {
      roundNumber: number;
      title: string;
    };
    region: {
      title: string;
      abbreviation: string;
    };
  };
  location: {
    venue: string;
    city: string;
    stateUsps: string;
  };
}

interface HenryGameDetail {
  contests: HenryContest[];
}

// ─── Processed game data ──────────────────────────────────────────────────────

interface GameData {
  externalGameId: string;
  regionTitle: string;
  roundNumber: number;
  homeTeam: HenryTeam;
  awayTeam: HenryTeam;
  status: string;
  tvChannel: string;
  venueName: string;
  venueCity: string;
  scheduledTime: string | null;
  linescores: HenryLinescore[];
  isUpset: boolean;
  upsetSeedDiff: number | null;
}

// ─── Summary tracking ─────────────────────────────────────────────────────────

const summary = {
  tournamentsUpserted: 0,
  regionsUpserted: 0,
  roundsUpserted: 0,
  teamsUpserted: 0,
  gamesUpserted: 0,
  scoresUpserted: 0,
  nextGameIdsUpdated: 0,
  failedFetches: [] as string[],
  failedUpserts: [] as string[],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function mapGameState(state: string): string {
  const s = state.toLowerCase();
  if (s === "f" || s === "final") return "final";
  if (s === "l" || s === "live" || s === "in_progress") return "live";
  return "scheduled";
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.json() as Promise<T>;
}

function hasBracketRound(val: number | string | null | undefined): boolean {
  return val !== null && val !== undefined && val !== "";
}

// ─── Core sync function ───────────────────────────────────────────────────────

async function syncTournament(
  config: (typeof TOURNAMENT_CONFIGS)[number]
): Promise<void> {
  console.log(`\n=== Syncing: ${config.name} ===`);

  // ── Phase 1: collect bracket gameIDs from scoreboard ──────────────────────

  const gameIds: string[] = [];

  for (const date of config.dates) {
    const url = `${BASE_URL}/scoreboard/${config.sport}/d1/${date}/all-conf`;
    console.log(`Fetching scoreboard: ${url}`);
    try {
      const data = await fetchJson<{ games: HenryScoreboardEntry[] }>(url);
      const bracketGames = (data.games ?? []).filter((e) =>
        hasBracketRound(e.game.bracketRound)
      );
      bracketGames.forEach((e) => gameIds.push(e.game.gameID));
      console.log(`  → ${bracketGames.length} bracket games found`);
    } catch (err) {
      console.error(`  FETCH ERROR (scoreboard ${date}):`, err);
      summary.failedFetches.push(`scoreboard-${config.sport}-${date}`);
    }
    await sleep(RATE_LIMIT_MS);
  }

  console.log(`Total bracket gameIDs collected: ${gameIds.length}`);
  if (gameIds.length === 0) {
    console.warn("No games found — skipping tournament");
    return;
  }

  // ── Phase 2: fetch individual game details ─────────────────────────────────

  const gameDataList: GameData[] = [];

  for (const gameId of gameIds) {
    const url = `${BASE_URL}/game/${gameId}`;
    console.log(`Fetching game: ${url}`);
    try {
      const data = await fetchJson<HenryGameDetail>(url);
      const contest = data.contests?.[0];
      if (!contest) throw new Error("No contest in response");

      const homeTeam = contest.teams.find((t) => t.isHome);
      const awayTeam = contest.teams.find((t) => !t.isHome);
      if (!homeTeam || !awayTeam) throw new Error("Missing home or away team");

      const region = contest.championshipGame?.region;
      const round = contest.championshipGame?.round;
      const loc = contest.location;

      const status = mapGameState(contest.gameState);

      let isUpset = false;
      let upsetSeedDiff: number | null = null;
      if (status === "final") {
        const winner = contest.teams.find((t) => t.isWinner);
        const loser = contest.teams.find((t) => !t.isWinner);
        if (
          winner?.seed != null &&
          loser?.seed != null &&
          winner.seed > loser.seed
        ) {
          isUpset = true;
          upsetSeedDiff = winner.seed - loser.seed;
        }
      }

      gameDataList.push({
        externalGameId: gameId,
        regionTitle: region?.title?.trim() ?? "Unknown",
        roundNumber: round?.roundNumber ?? 2,
        homeTeam,
        awayTeam,
        status,
        tvChannel: contest.network ?? "",
        venueName: loc?.venue ?? "",
        venueCity: loc ? `${loc.city}, ${loc.stateUsps}` : "",
        scheduledTime: contest.startTimeEpoch
          ? new Date(contest.startTimeEpoch * 1000).toISOString()
          : null,
        linescores: contest.linescores ?? [],
        isUpset,
        upsetSeedDiff,
      });
    } catch (err) {
      console.error(`  FETCH ERROR (game ${gameId}):`, err);
      summary.failedFetches.push(`game-${gameId}`);
    }
    await sleep(RATE_LIMIT_MS);
  }

  if (gameDataList.length === 0) {
    console.warn("No game details fetched — skipping upserts");
    return;
  }

  // ── Step 1: Upsert tournament ──────────────────────────────────────────────

  let tournamentId: string;

  const { data: existingTournament } = await supabase
    .from("tournaments")
    .select("id")
    .eq("sport", config.supabaseSport)
    .eq("gender", config.supabaseGender)
    .eq("season_year", config.season_year)
    .maybeSingle();

  if (existingTournament) {
    tournamentId = existingTournament.id;
    console.log(`Tournament exists: ${tournamentId}`);
  } else {
    const { data, error } = await supabase
      .from("tournaments")
      .insert({
        name: config.name,
        sport: config.supabaseSport,
        gender: config.supabaseGender,
        season_year: config.season_year,
        format: "single_elimination",
        status: "active",
      })
      .select("id")
      .single();
    if (error || !data) {
      console.error("UPSERT ERROR (tournaments):", error);
      summary.failedUpserts.push(`tournament-${config.name}`);
      return;
    }
    tournamentId = data.id;
    summary.tournamentsUpserted++;
    console.log(`Tournament inserted: ${tournamentId}`);
  }

  // ── Step 2: Upsert regions ─────────────────────────────────────────────────

  const regionTitles = [
    ...new Set(gameDataList.map((g) => g.regionTitle)),
  ];
  if (!regionTitles.includes("Final Four")) regionTitles.push("Final Four");

  const regionIdMap: Record<string, string> = {};

  for (let i = 0; i < regionTitles.length; i++) {
    const name = regionTitles[i];
    const { data: existingRegion } = await supabase
      .from("tournament_regions")
      .select("id")
      .eq("tournament_id", tournamentId)
      .eq("name", name)
      .maybeSingle();

    if (existingRegion) {
      regionIdMap[name] = existingRegion.id;
    } else {
      const { data, error } = await supabase
        .from("tournament_regions")
        .insert({ tournament_id: tournamentId, name, display_order: i + 1 })
        .select("id")
        .single();
      if (error || !data) {
        console.error(`UPSERT ERROR (region ${name}):`, error);
        summary.failedUpserts.push(`region-${name}`);
        continue;
      }
      regionIdMap[name] = data.id;
      summary.regionsUpserted++;
    }
  }

  console.log(`Regions ready: ${Object.keys(regionIdMap).join(", ")}`);

  // ── Step 3: Upsert rounds ──────────────────────────────────────────────────

  const roundIdMap: Record<number, string> = {};

  for (let roundNum = 1; roundNum <= 6; roundNum++) {
    const { data: existingRound } = await supabase
      .from("tournament_rounds")
      .select("id")
      .eq("tournament_id", tournamentId)
      .eq("round_number", roundNum)
      .maybeSingle();

    if (existingRound) {
      roundIdMap[roundNum] = existingRound.id;
    } else {
      const { data, error } = await supabase
        .from("tournament_rounds")
        .insert({
          tournament_id: tournamentId,
          name: ROUND_LABELS[roundNum],
          round_number: roundNum,
          status: "upcoming",
        })
        .select("id")
        .single();
      if (error || !data) {
        console.error(`UPSERT ERROR (round ${roundNum}):`, error);
        summary.failedUpserts.push(`round-${roundNum}`);
        continue;
      }
      roundIdMap[roundNum] = data.id;
      summary.roundsUpserted++;
    }
  }

  console.log(`Rounds ready: ${Object.keys(roundIdMap).length} rounds`);

  // ── Step 4: Upsert teams ───────────────────────────────────────────────────

  // Deduplicate by external teamId
  const teamMap = new Map<string, { team: HenryTeam; regionTitle: string }>();
  for (const g of gameDataList) {
    if (!teamMap.has(g.homeTeam.teamId)) {
      teamMap.set(g.homeTeam.teamId, {
        team: g.homeTeam,
        regionTitle: g.regionTitle,
      });
    }
    if (!teamMap.has(g.awayTeam.teamId)) {
      teamMap.set(g.awayTeam.teamId, {
        team: g.awayTeam,
        regionTitle: g.regionTitle,
      });
    }
  }

  const teamIdMap: Record<string, string> = {}; // externalTeamId → supabase UUID

  for (const [externalTeamId, { team, regionTitle }] of teamMap.entries()) {
    const regionId = regionIdMap[regionTitle];
    if (!regionId) {
      console.warn(
        `No region ID for "${regionTitle}" — skipping team ${team.nameShort}`
      );
      continue;
    }

    const { data: existingTeam } = await supabase
      .from("tournament_teams")
      .select("id")
      .eq("tournament_id", tournamentId)
      .eq("external_team_id", externalTeamId)
      .maybeSingle();

    if (existingTeam) {
      teamIdMap[externalTeamId] = existingTeam.id;
      await supabase
        .from("tournament_teams")
        .update({
          name: team.nameFull || team.nameShort,
          short_name: team.nameShort,
          seed: team.seed,
        })
        .eq("id", existingTeam.id);
    } else {
      const { data, error } = await supabase
        .from("tournament_teams")
        .insert({
          tournament_id: tournamentId,
          region_id: regionId,
          external_team_id: externalTeamId,
          name: team.nameFull || team.nameShort,
          short_name: team.nameShort,
          seed: team.seed,
        })
        .select("id")
        .single();
      if (error || !data) {
        console.error(`UPSERT ERROR (team ${team.nameShort}):`, error);
        summary.failedUpserts.push(`team-${team.nameShort}`);
        continue;
      }
      teamIdMap[externalTeamId] = data.id;
      summary.teamsUpserted++;
    }
  }

  console.log(`Teams ready: ${Object.keys(teamIdMap).length}`);

  // ── Step 5: Upsert games ───────────────────────────────────────────────────

  // Assign slot numbers: sort by gameID (numeric) within each region+round group
  const groupedGames: Record<string, GameData[]> = {};
  for (const g of gameDataList) {
    const key = `${g.regionTitle}:${g.roundNumber}`;
    if (!groupedGames[key]) groupedGames[key] = [];
    groupedGames[key].push(g);
  }
  for (const key of Object.keys(groupedGames)) {
    groupedGames[key].sort(
      (a, b) => parseInt(a.externalGameId) - parseInt(b.externalGameId)
    );
  }

  const gameSlotMap: Record<string, number> = {};
  for (const games of Object.values(groupedGames)) {
    games.forEach((g, idx) => {
      gameSlotMap[g.externalGameId] = idx + 1;
    });
  }

  const gameDbIdMap: Record<string, string> = {}; // externalGameId → supabase UUID

  for (const g of gameDataList) {
    const roundId = roundIdMap[g.roundNumber];
    const regionId = regionIdMap[g.regionTitle] ?? null;
    const topTeamId = teamIdMap[g.homeTeam.teamId] ?? null;
    const bottomTeamId = teamIdMap[g.awayTeam.teamId] ?? null;

    const winnerId =
      g.status === "final"
        ? g.homeTeam.isWinner
          ? (teamIdMap[g.homeTeam.teamId] ?? null)
          : (teamIdMap[g.awayTeam.teamId] ?? null)
        : null;

    const loserId =
      g.status === "final"
        ? g.homeTeam.isWinner
          ? (teamIdMap[g.awayTeam.teamId] ?? null)
          : (teamIdMap[g.homeTeam.teamId] ?? null)
        : null;

    const winnerSlot =
      g.status === "final"
        ? g.homeTeam.isWinner
          ? "top"
          : "bottom"
        : null;

    const slotNumber = gameSlotMap[g.externalGameId] ?? 1;

    const gameRow = {
      tournament_id: tournamentId,
      round_id: roundId,
      region_id: regionId,
      external_game_id: g.externalGameId,
      top_team_id: topTeamId,
      bottom_team_id: bottomTeamId,
      winner_id: winnerId,
      loser_id: loserId,
      winner_slot: winnerSlot,
      top_score: g.homeTeam.score ?? 0,
      bottom_score: g.awayTeam.score ?? 0,
      status: g.status,
      scheduled_time: g.scheduledTime,
      tv_channel: g.tvChannel,
      venue_name: g.venueName,
      venue_city: g.venueCity,
      slot_number: slotNumber,
      next_game_id: null,
      season_year: config.season_year,
      sport: config.supabaseSport,
      tournament_name: config.name,
      upset: g.isUpset,
      upset_seed_diff: g.upsetSeedDiff,
    };

    const { data: existingGame } = await supabase
      .from("tournament_games")
      .select("id")
      .eq("external_game_id", g.externalGameId)
      .maybeSingle();

    if (existingGame) {
      gameDbIdMap[g.externalGameId] = existingGame.id;
      const { error } = await supabase
        .from("tournament_games")
        .update(gameRow)
        .eq("id", existingGame.id);
      if (error) {
        console.error(`UPSERT ERROR (game ${g.externalGameId}):`, error);
        summary.failedUpserts.push(`game-${g.externalGameId}`);
      } else {
        summary.gamesUpserted++;
      }
    } else {
      const { data, error } = await supabase
        .from("tournament_games")
        .insert(gameRow)
        .select("id")
        .single();
      if (error || !data) {
        console.error(`UPSERT ERROR (game ${g.externalGameId}):`, error);
        summary.failedUpserts.push(`game-${g.externalGameId}`);
      } else {
        gameDbIdMap[g.externalGameId] = data.id;
        summary.gamesUpserted++;
      }
    }
  }

  console.log(`Games upserted: ${Object.keys(gameDbIdMap).length}`);

  // ── Step 6: tournament_game_scores ────────────────────────────────────────

  for (const g of gameDataList) {
    if (g.status !== "final" && g.status !== "live") continue;
    if (g.linescores.length === 0) continue;

    const gameDbId = gameDbIdMap[g.externalGameId];
    if (!gameDbId) continue;

    const topTeamDbId = teamIdMap[g.homeTeam.teamId];
    const bottomTeamDbId = teamIdMap[g.awayTeam.teamId];
    if (!topTeamDbId || !bottomTeamDbId) continue;

    // Delete existing scores then re-insert
    const { error: deleteError } = await supabase
      .from("tournament_game_scores")
      .delete()
      .eq("game_id", gameDbId);
    if (deleteError) {
      console.error(
        `DELETE ERROR (scores for game ${g.externalGameId}):`,
        deleteError
      );
    }

    for (let i = 0; i < g.linescores.length; i++) {
      const ls = g.linescores[i];
      const period = parseInt(ls.period) || i + 1;
      const { error } = await supabase.from("tournament_game_scores").insert([
        {
          game_id: gameDbId,
          team_id: topTeamDbId,
          period,
          score: parseInt(ls.home) || 0,
        },
        {
          game_id: gameDbId,
          team_id: bottomTeamDbId,
          period,
          score: parseInt(ls.visit) || 0,
        },
      ]);
      if (error) {
        console.error(
          `INSERT ERROR (score p${period} game ${g.externalGameId}):`,
          error
        );
        summary.failedUpserts.push(
          `score-${g.externalGameId}-p${period}`
        );
      } else {
        summary.scoresUpserted += 2;
      }
    }
  }

  // ── Pass 2: next_game_id ───────────────────────────────────────────────────

  console.log("Running pass 2: next_game_id...");

  for (const g of gameDataList) {
    if (g.roundNumber >= 5) continue;

    const currentGameDbId = gameDbIdMap[g.externalGameId];
    if (!currentGameDbId) continue;

    const currentSlot = gameSlotMap[g.externalGameId];
    const nextSlot = Math.ceil(currentSlot / 2);
    const nextRound = g.roundNumber + 1;

    // Rounds 1–3: same region. Round 4 → Final Four region.
    const nextRegionTitle =
      g.roundNumber === 4 ? "Final Four" : g.regionTitle;
    const nextRegionId = regionIdMap[nextRegionTitle];
    const nextRoundId = roundIdMap[nextRound];

    if (!nextRegionId || !nextRoundId) continue;

    const { data: nextGame } = await supabase
      .from("tournament_games")
      .select("id")
      .eq("tournament_id", tournamentId)
      .eq("round_id", nextRoundId)
      .eq("region_id", nextRegionId)
      .eq("slot_number", nextSlot)
      .maybeSingle();

    if (!nextGame) continue; // Next round game not yet in DB

    const { error } = await supabase
      .from("tournament_games")
      .update({ next_game_id: nextGame.id })
      .eq("id", currentGameDbId);

    if (error) {
      console.error(
        `UPDATE ERROR (next_game_id for ${g.externalGameId}):`,
        error
      );
      summary.failedUpserts.push(`next_game_id-${g.externalGameId}`);
    } else {
      summary.nextGameIdsUpdated++;
    }
  }
}

// ─── Entry point ─────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log("=== NCAA Tournament Sync ===");
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  for (const config of TOURNAMENT_CONFIGS) {
    try {
      await syncTournament(config);
    } catch (err) {
      console.error(`FATAL ERROR syncing ${config.name}:`, err);
      summary.failedUpserts.push(`tournament-fatal-${config.name}`);
    }
  }

  // ── Summary report ─────────────────────────────────────────────────────────
  console.log("\n=== SYNC COMPLETE — SUMMARY ===");
  console.log(`Tournaments upserted :  ${summary.tournamentsUpserted}`);
  console.log(`Regions upserted     :  ${summary.regionsUpserted}`);
  console.log(`Rounds upserted      :  ${summary.roundsUpserted}`);
  console.log(`Teams upserted       :  ${summary.teamsUpserted}`);
  console.log(`Games upserted       :  ${summary.gamesUpserted}`);
  console.log(`Scores upserted      :  ${summary.scoresUpserted}`);
  console.log(`next_game_id updated :  ${summary.nextGameIdsUpdated}`);

  if (summary.failedFetches.length > 0) {
    console.log(`\nFailed fetches (${summary.failedFetches.length}):`);
    summary.failedFetches.forEach((id) => console.log(`  - ${id}`));
  }
  if (summary.failedUpserts.length > 0) {
    console.log(`\nFailed upserts (${summary.failedUpserts.length}):`);
    summary.failedUpserts.forEach((id) => console.log(`  - ${id}`));
  }
  if (
    summary.failedFetches.length === 0 &&
    summary.failedUpserts.length === 0
  ) {
    console.log("\nAll operations completed successfully.");
  }
}

main().catch((err) => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
