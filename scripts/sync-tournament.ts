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

// Henry API bracketRound is offset by 1 (Henry 2=First Round, app 1=First Round)
const henryRoundToAppRound = (n: number): number => n - 1;

// ─── Tournament configs ───────────────────────────────────────────────────────

const TOURNAMENT_CONFIGS = [
  {
    sport: "basketball-men",
    supabaseSport: "basketball",
    supabaseGender: "mens",
    name: "2026 DI Men's Basketball Championship",
    season_year: 2025,
    dates: ["2026/03/19", "2026/03/20", "2026/03/21", "2026/03/22", "2026/03/27", "2026/03/28", "2026/03/29", "2026/03/30"],
  },
  {
    sport: "basketball-women",
    supabaseSport: "basketball",
    supabaseGender: "womens",
    name: "2026 DI Women's Basketball Championship",
    season_year: 2025,
    dates: ["2026/03/20", "2026/03/21", "2026/03/22", "2026/03/23", "2026/03/28", "2026/03/29", "2026/03/30", "2026/03/31"],
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
  failedFetches: [] as string[],
  failedUpserts: [] as string[],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function mapGameState(state: string): string {
  const s = state.toLowerCase();
  if (s === "f" || s === "final" || s.startsWith("f/")) return "final";
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

const REGION_TITLE_NORM: Record<string, string> = {
  EAST: "East",
  WEST: "West",
  SOUTH: "South",
  MIDWEST: "Midwest",
};

function normalizeRegionTitle(title: string): string {
  return REGION_TITLE_NORM[title] ?? title;
}

// deriveSlotFromSeeds returns the bracket slot_number for a game based on the
// standard NCAA bracket seed-pairing structure for R1–R4.
//
// R1 (8 slots): 1/16→1, 8/9→2, 5/12→3, 4/13→4, 6/11→5, 3/14→6, 7/10→7, 2/15→8
// R2 (4 slots): {1,16,8,9}→1, {5,12,4,13}→2, {6,11,3,14}→3, {7,10,2,15}→4
// R3 (2 slots): {1,16,8,9,5,12,4,13}→1, {6,11,3,14,7,10,2,15}→2
// R4 (1 slot):  always 1
//
// Returns null for R5/R6 (Final Four / Championship) or when seeds are missing
// from the team records — callers should fall back to numeric sort in those cases.
//
// Upset-safe: a 12-seed that upset a 5-seed still occupies R2 slot 2 because
// both {5,12,4,13} originate from that bracket quarter.
function deriveSlotFromSeeds(
  roundNumber: number,
  homeTeam: HenryTeam,
  awayTeam: HenryTeam
): number | null {
  if (roundNumber === 4) return 1;
  if (roundNumber >= 5) return null;

  const R1_MAP: Record<number, number> = {
     1: 1, 16: 1,  8: 2,  9: 2,
     5: 3, 12: 3,  4: 4, 13: 4,
     6: 5, 11: 5,  3: 6, 14: 6,
     7: 7, 10: 7,  2: 8, 15: 8,
  };
  const R2_MAP: Record<number, number> = {
     1: 1, 16: 1,  8: 1,  9: 1,
     5: 2, 12: 2,  4: 2, 13: 2,
     6: 3, 11: 3,  3: 3, 14: 3,
     7: 4, 10: 4,  2: 4, 15: 4,
  };
  const R3_MAP: Record<number, number> = {
     1: 1, 16: 1,  8: 1,  9: 1,  5: 1, 12: 1,  4: 1, 13: 1,
     6: 2, 11: 2,  3: 2, 14: 2,  7: 2, 10: 2,  2: 2, 15: 2,
  };

  const seedMap =
    roundNumber === 1 ? R1_MAP : roundNumber === 2 ? R2_MAP : R3_MAP;
  const seeds = [homeTeam.seed, awayTeam.seed].filter(
    (s): s is number => s != null
  );

  for (const seed of seeds) {
    const slot = seedMap[seed];
    if (slot != null) return slot;
  }
  return null;
}

// ─── Core sync function ───────────────────────────────────────────────────────

async function syncTournament(
  config: (typeof TOURNAMENT_CONFIGS)[number]
): Promise<void> {
  console.log(`\n=== Syncing: ${config.name} ===`);

  // ── Phase 1: collect bracket gameIDs from scoreboard ──────────────────────

  const gameIds = new Map<string, string>();

  for (const date of config.dates) {
    const url = `${BASE_URL}/scoreboard/${config.sport}/d1/${date}/all-conf`;
    console.log(`Fetching scoreboard: ${url}`);
    try {
      const data = await fetchJson<{ games: HenryScoreboardEntry[] }>(url);
      const bracketGames = (data.games ?? []).filter((e) =>
        hasBracketRound(e.game.bracketRound)
      );
      bracketGames.forEach((e) =>
        gameIds.set(e.game.gameID, mapGameState(e.game.gameState))
      );
      console.log(`  → ${bracketGames.length} bracket games found`);
    } catch (err) {
      console.error(`  FETCH ERROR (scoreboard ${date}):`, err);
      summary.failedFetches.push(`scoreboard-${config.sport}-${date}`);
    }
    await sleep(RATE_LIMIT_MS);
  }

  console.log(`Total bracket gameIDs collected: ${gameIds.size}`);
  if (gameIds.size === 0) {
    console.warn("No games found — skipping tournament");
    return;
  }

  // ── Phase 2: fetch individual game details ─────────────────────────────────

  const gameDataList: GameData[] = [];

  for (const gameId of gameIds.keys()) {
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

      const scoreboardStatus = gameIds.get(gameId);
      const finalStatus =
        (scoreboardStatus === "live" || scoreboardStatus === "final") &&
        status === "scheduled"
          ? scoreboardStatus
          : status;

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
        regionTitle: normalizeRegionTitle(region?.title?.trim() ?? "Unknown"),
        roundNumber: henryRoundToAppRound(round?.roundNumber ?? 2),
        homeTeam,
        awayTeam,
        status: finalStatus,
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

  // ── Step 5: Update scaffold rows with Henry game data ────────────────────
  //
  // Slot assignment: use seed-based derivation for R1–R3 (standard NCAA bracket
  // pairings); R4 is always slot 1. For R5/R6 or games with missing seeds,
  // fall back to numeric sort of Henry gameIDs within the region+round group.
  //
  // next_game_id, fills_top_in_next, and slot_number are scaffold fields —
  // they are never overwritten here.

  const groupedGames: Record<string, GameData[]> = {};
  for (const g of gameDataList) {
    const key = `${g.regionTitle}:${g.roundNumber}`;
    if (!groupedGames[key]) groupedGames[key] = [];
    groupedGames[key].push(g);
  }

  const gameSlotMap: Record<string, number> = {};
  for (const g of gameDataList) {
    const slot = deriveSlotFromSeeds(g.roundNumber, g.homeTeam, g.awayTeam);
    if (slot != null) {
      gameSlotMap[g.externalGameId] = slot;
    }
  }
  // Fallback: for any game not yet slotted (R5/R6 or missing seeds),
  // use numeric sort of Henry gameIDs within the region+round group.
  for (const key of Object.keys(groupedGames)) {
    const unslotted = groupedGames[key].filter(
      (g) => gameSlotMap[g.externalGameId] == null
    );
    if (unslotted.length === 0) continue;
    const usedSlots = new Set(
      groupedGames[key]
        .filter((g) => gameSlotMap[g.externalGameId] != null)
        .map((g) => gameSlotMap[g.externalGameId])
    );
    unslotted.sort((a, b) => parseInt(a.externalGameId) - parseInt(b.externalGameId));
    let next = 1;
    for (const g of unslotted) {
      while (usedSlots.has(next)) next++;
      gameSlotMap[g.externalGameId] = next;
      usedSlots.add(next);
      next++;
    }
  }

  const gameDbIdMap: Record<string, string> = {}; // externalGameId → supabase UUID

  for (const g of gameDataList) {
    const roundId = roundIdMap[g.roundNumber];
    const regionId = regionIdMap[g.regionTitle] ?? null;

    if (!regionId) {
      console.warn(
        `Region "${g.regionTitle}" not found in tournament_regions ` +
        `(tournament ${tournamentId}) — skipping game ${g.externalGameId}`
      );
      summary.failedUpserts.push(`game-${g.externalGameId}`);
      continue;
    }

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

    if (!roundId) {
      console.warn(
        `No round ID for round ${g.roundNumber} — skipping game ${g.externalGameId}`
      );
      summary.failedUpserts.push(`game-${g.externalGameId}`);
      continue;
    }

    // Find the matching scaffold row by tournament + round + region + slot.
    const { data: scaffoldRow } = await supabase
      .from("tournament_games")
      .select("id")
      .eq("tournament_id", tournamentId)
      .eq("round_id", roundId)
      .eq("region_id", regionId)
      .eq("slot_number", slotNumber)
      .maybeSingle();

    if (!scaffoldRow) {
      console.warn(
        `No scaffold row for ${g.regionTitle} R${g.roundNumber} slot ${slotNumber}` +
        ` (game ${g.externalGameId}) — run Migration 009 first`
      );
      summary.failedUpserts.push(`game-${g.externalGameId}`);
      continue;
    }

    gameDbIdMap[g.externalGameId] = scaffoldRow.id;

    const { error } = await supabase
      .from("tournament_games")
      .update({
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
        upset: g.isUpset,
        upset_seed_diff: g.upsetSeedDiff,
      })
      .eq("id", scaffoldRow.id);

    if (error) {
      console.error(`UPDATE ERROR (game ${g.externalGameId}):`, error);
      summary.failedUpserts.push(`game-${g.externalGameId}`);
    } else {
      summary.gamesUpserted++;
    }
  }

  console.log(`Games updated: ${Object.keys(gameDbIdMap).length}`);

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
  console.log(`Games updated        :  ${summary.gamesUpserted}`);
  console.log(`Scores upserted      :  ${summary.scoresUpserted}`);

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
