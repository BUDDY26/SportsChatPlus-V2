import type { NextApiRequest, NextApiResponse } from "next";
import type { TournamentGame } from "@/lib/sports/types";
import { createAdminClient } from "@/lib/supabase";

export interface BracketApiResponse {
  tournamentName: string;
  season: string;
  lastUpdated: string;
  games: TournamentGame[];
}

// ─── Mock bracket data ────────────────────────────────────────────────────────
// Phase 1: static mock only. Swap for live API in Phase 3.
//
// ID scheme: {region}-r{round}-{slot}
//   region: east | west | south | midwest | ff
//   round:  1-6
//   slot:   1-8 (r1), 1-4 (r2), 1-2 (r3), 1 (r4), 1-2 (r5/ff), 1 (r6/champ)

const MOCK_BRACKET: TournamentGame[] = [
  // ── EAST  —  First Round ──────────────────────────────────────────────────
  {
    id: "east-r1-1", round: 1, roundLabel: "First Round", region: "East", slot: 1,
    topTeamId: "east-1-kansas", topTeamName: "Kansas", topTeamSeed: 1, topScore: 79,
    bottomTeamId: "east-16-howard", bottomTeamName: "Howard", bottomTeamSeed: 16, bottomScore: 44,
    status: "final", winnerId: "east-1-kansas", winnerSlot: "top",
    nextMatchupId: "east-r2-1", scheduledTime: "Mar 21, 12:15 PM ET",
  },
  {
    id: "east-r1-2", round: 1, roundLabel: "First Round", region: "East", slot: 2,
    topTeamId: "east-8-arkansas", topTeamName: "Arkansas", topTeamSeed: 8, topScore: 73,
    bottomTeamId: "east-9-illinois", bottomTeamName: "Illinois", bottomTeamSeed: 9, bottomScore: 71,
    status: "final", winnerId: "east-8-arkansas", winnerSlot: "top",
    nextMatchupId: "east-r2-1", scheduledTime: "Mar 21, 2:45 PM ET",
  },
  {
    id: "east-r1-3", round: 1, roundLabel: "First Round", region: "East", slot: 3,
    topTeamId: "east-5-saint-marys", topTeamName: "Saint Mary's", topTeamSeed: 5, topScore: 42,
    bottomTeamId: "east-12-vcu", bottomTeamName: "VCU", bottomTeamSeed: 12, bottomScore: 38,
    status: "live", winnerId: null, winnerSlot: null,
    nextMatchupId: "east-r2-2", scheduledTime: "Mar 21, 7:10 PM ET",
  },
  {
    id: "east-r1-4", round: 1, roundLabel: "First Round", region: "East", slot: 4,
    topTeamId: "east-4-uconn", topTeamName: "UConn", topTeamSeed: 4, topScore: 0,
    bottomTeamId: "east-13-iona", bottomTeamName: "Iona", bottomTeamSeed: 13, bottomScore: 0,
    status: "scheduled", winnerId: null, winnerSlot: null,
    nextMatchupId: "east-r2-2", scheduledTime: "Mar 21, 9:40 PM ET",
  },
  {
    id: "east-r1-5", round: 1, roundLabel: "First Round", region: "East", slot: 5,
    topTeamId: "east-6-tcu", topTeamName: "TCU", topTeamSeed: 6, topScore: 72,
    bottomTeamId: "east-11-az-state", bottomTeamName: "Arizona State", bottomTeamSeed: 11, bottomScore: 70,
    status: "final", winnerId: "east-6-tcu", winnerSlot: "top",
    nextMatchupId: "east-r2-3", scheduledTime: "Mar 22, 12:15 PM ET",
  },
  {
    id: "east-r1-6", round: 1, roundLabel: "First Round", region: "East", slot: 6,
    topTeamId: "east-3-gonzaga", topTeamName: "Gonzaga", topTeamSeed: 3, topScore: 84,
    bottomTeamId: "east-14-grand-canyon", bottomTeamName: "Grand Canyon", bottomTeamSeed: 14, bottomScore: 59,
    status: "final", winnerId: "east-3-gonzaga", winnerSlot: "top",
    nextMatchupId: "east-r2-3", scheduledTime: "Mar 22, 2:45 PM ET",
  },
  {
    id: "east-r1-7", round: 1, roundLabel: "First Round", region: "East", slot: 7,
    topTeamId: "east-7-northwestern", topTeamName: "Northwestern", topTeamSeed: 7, topScore: 0,
    bottomTeamId: "east-10-boise-state", bottomTeamName: "Boise State", bottomTeamSeed: 10, bottomScore: 0,
    status: "scheduled", winnerId: null, winnerSlot: null,
    nextMatchupId: "east-r2-4", scheduledTime: "Mar 22, 7:10 PM ET",
  },
  {
    id: "east-r1-8", round: 1, roundLabel: "First Round", region: "East", slot: 8,
    topTeamId: "east-2-ucla", topTeamName: "UCLA", topTeamSeed: 2, topScore: 63,
    bottomTeamId: "east-15-unc-asheville", bottomTeamName: "UNC Asheville", bottomTeamSeed: 15, bottomScore: 79,
    status: "final", winnerId: "east-15-unc-asheville", winnerSlot: "bottom",
    nextMatchupId: "east-r2-4", scheduledTime: "Mar 22, 9:40 PM ET",
  },

  // ── WEST  —  First Round ──────────────────────────────────────────────────
  {
    id: "west-r1-1", round: 1, roundLabel: "First Round", region: "West", slot: 1,
    topTeamId: "west-1-alabama", topTeamName: "Alabama", topTeamSeed: 1, topScore: 0,
    bottomTeamId: "west-16-tamu-cc", bottomTeamName: "TAMU-CC", bottomTeamSeed: 16, bottomScore: 0,
    status: "scheduled", winnerId: null, winnerSlot: null,
    nextMatchupId: "west-r2-1", scheduledTime: "Mar 23, 12:15 PM ET",
  },
  {
    id: "west-r1-2", round: 1, roundLabel: "First Round", region: "West", slot: 2,
    topTeamId: "west-8-maryland", topTeamName: "Maryland", topTeamSeed: 8, topScore: 0,
    bottomTeamId: "west-9-west-virginia", bottomTeamName: "West Virginia", bottomTeamSeed: 9, bottomScore: 0,
    status: "scheduled", winnerId: null, winnerSlot: null,
    nextMatchupId: "west-r2-1", scheduledTime: "Mar 23, 2:45 PM ET",
  },
  {
    id: "west-r1-3", round: 1, roundLabel: "First Round", region: "West", slot: 3,
    topTeamId: "west-5-san-diego-state", topTeamName: "San Diego State", topTeamSeed: 5, topScore: 0,
    bottomTeamId: "west-12-charleston", bottomTeamName: "Charleston", bottomTeamSeed: 12, bottomScore: 0,
    status: "scheduled", winnerId: null, winnerSlot: null,
    nextMatchupId: "west-r2-2", scheduledTime: "Mar 23, 7:10 PM ET",
  },
  {
    id: "west-r1-4", round: 1, roundLabel: "First Round", region: "West", slot: 4,
    topTeamId: "west-4-virginia", topTeamName: "Virginia", topTeamSeed: 4, topScore: 0,
    bottomTeamId: "west-13-furman", bottomTeamName: "Furman", bottomTeamSeed: 13, bottomScore: 0,
    status: "scheduled", winnerId: null, winnerSlot: null,
    nextMatchupId: "west-r2-2", scheduledTime: "Mar 23, 9:40 PM ET",
  },
  {
    id: "west-r1-5", round: 1, roundLabel: "First Round", region: "West", slot: 5,
    topTeamId: "west-6-creighton", topTeamName: "Creighton", topTeamSeed: 6, topScore: 0,
    bottomTeamId: "west-11-nc-state", bottomTeamName: "NC State", bottomTeamSeed: 11, bottomScore: 0,
    status: "scheduled", winnerId: null, winnerSlot: null,
    nextMatchupId: "west-r2-3", scheduledTime: "Mar 24, 12:15 PM ET",
  },
  {
    id: "west-r1-6", round: 1, roundLabel: "First Round", region: "West", slot: 6,
    topTeamId: "west-3-baylor", topTeamName: "Baylor", topTeamSeed: 3, topScore: 0,
    bottomTeamId: "west-14-ucal-santa-barbara", bottomTeamName: "UC Santa Barbara", bottomTeamSeed: 14, bottomScore: 0,
    status: "scheduled", winnerId: null, winnerSlot: null,
    nextMatchupId: "west-r2-3", scheduledTime: "Mar 24, 2:45 PM ET",
  },
  {
    id: "west-r1-7", round: 1, roundLabel: "First Round", region: "West", slot: 7,
    topTeamId: "west-7-missouri", topTeamName: "Missouri", topTeamSeed: 7, topScore: 0,
    bottomTeamId: "west-10-utah-state", bottomTeamName: "Utah State", bottomTeamSeed: 10, bottomScore: 0,
    status: "scheduled", winnerId: null, winnerSlot: null,
    nextMatchupId: "west-r2-4", scheduledTime: "Mar 24, 7:10 PM ET",
  },
  {
    id: "west-r1-8", round: 1, roundLabel: "First Round", region: "West", slot: 8,
    topTeamId: "west-2-arizona", topTeamName: "Arizona", topTeamSeed: 2, topScore: 0,
    bottomTeamId: "west-15-princeton", bottomTeamName: "Princeton", bottomTeamSeed: 15, bottomScore: 0,
    status: "scheduled", winnerId: null, winnerSlot: null,
    nextMatchupId: "west-r2-4", scheduledTime: "Mar 24, 9:40 PM ET",
  },

  // ── SOUTH  —  First Round ─────────────────────────────────────────────────
  {
    id: "south-r1-1", round: 1, roundLabel: "First Round", region: "South", slot: 1,
    topTeamId: "south-1-purdue", topTeamName: "Purdue", topTeamSeed: 1, topScore: 0,
    bottomTeamId: "south-16-farleigh-dickinson", bottomTeamName: "FDU", bottomTeamSeed: 16, bottomScore: 0,
    status: "scheduled", winnerId: null, winnerSlot: null,
    nextMatchupId: "south-r2-1", scheduledTime: "Mar 25, 12:15 PM ET",
  },
  {
    id: "south-r1-2", round: 1, roundLabel: "First Round", region: "South", slot: 2,
    topTeamId: "south-8-memphis", topTeamName: "Memphis", topTeamSeed: 8, topScore: 0,
    bottomTeamId: "south-9-florida-atlantic", bottomTeamName: "Florida Atlantic", bottomTeamSeed: 9, bottomScore: 0,
    status: "scheduled", winnerId: null, winnerSlot: null,
    nextMatchupId: "south-r2-1", scheduledTime: "Mar 25, 2:45 PM ET",
  },
  {
    id: "south-r1-3", round: 1, roundLabel: "First Round", region: "South", slot: 3,
    topTeamId: "south-5-duke", topTeamName: "Duke", topTeamSeed: 5, topScore: 0,
    bottomTeamId: "south-12-oral-roberts", bottomTeamName: "Oral Roberts", bottomTeamSeed: 12, bottomScore: 0,
    status: "scheduled", winnerId: null, winnerSlot: null,
    nextMatchupId: "south-r2-2", scheduledTime: "Mar 25, 7:10 PM ET",
  },
  {
    id: "south-r1-4", round: 1, roundLabel: "First Round", region: "South", slot: 4,
    topTeamId: "south-4-tennessee", topTeamName: "Tennessee", topTeamSeed: 4, topScore: 0,
    bottomTeamId: "south-13-louisiana-lafayette", bottomTeamName: "Louisiana", bottomTeamSeed: 13, bottomScore: 0,
    status: "scheduled", winnerId: null, winnerSlot: null,
    nextMatchupId: "south-r2-2", scheduledTime: "Mar 25, 9:40 PM ET",
  },
  {
    id: "south-r1-5", round: 1, roundLabel: "First Round", region: "South", slot: 5,
    topTeamId: "south-6-kentucky", topTeamName: "Kentucky", topTeamSeed: 6, topScore: 0,
    bottomTeamId: "south-11-providence", bottomTeamName: "Providence", bottomTeamSeed: 11, bottomScore: 0,
    status: "scheduled", winnerId: null, winnerSlot: null,
    nextMatchupId: "south-r2-3", scheduledTime: "Mar 26, 12:15 PM ET",
  },
  {
    id: "south-r1-6", round: 1, roundLabel: "First Round", region: "South", slot: 6,
    topTeamId: "south-3-kansas-state", topTeamName: "Kansas State", topTeamSeed: 3, topScore: 0,
    bottomTeamId: "south-14-montana-state", bottomTeamName: "Montana State", bottomTeamSeed: 14, bottomScore: 0,
    status: "scheduled", winnerId: null, winnerSlot: null,
    nextMatchupId: "south-r2-3", scheduledTime: "Mar 26, 2:45 PM ET",
  },
  {
    id: "south-r1-7", round: 1, roundLabel: "First Round", region: "South", slot: 7,
    topTeamId: "south-7-michigan-state", topTeamName: "Michigan State", topTeamSeed: 7, topScore: 0,
    bottomTeamId: "south-10-southern-cal", bottomTeamName: "USC", bottomTeamSeed: 10, bottomScore: 0,
    status: "scheduled", winnerId: null, winnerSlot: null,
    nextMatchupId: "south-r2-4", scheduledTime: "Mar 26, 7:10 PM ET",
  },
  {
    id: "south-r1-8", round: 1, roundLabel: "First Round", region: "South", slot: 8,
    topTeamId: "south-2-marquette", topTeamName: "Marquette", topTeamSeed: 2, topScore: 0,
    bottomTeamId: "south-15-vermont", bottomTeamName: "Vermont", bottomTeamSeed: 15, bottomScore: 0,
    status: "scheduled", winnerId: null, winnerSlot: null,
    nextMatchupId: "south-r2-4", scheduledTime: "Mar 26, 9:40 PM ET",
  },

  // ── MIDWEST  —  First Round ───────────────────────────────────────────────
  {
    id: "midwest-r1-1", round: 1, roundLabel: "First Round", region: "Midwest", slot: 1,
    topTeamId: "midwest-1-houston", topTeamName: "Houston", topTeamSeed: 1, topScore: 0,
    bottomTeamId: "midwest-16-northern-kentucky", bottomTeamName: "N. Kentucky", bottomTeamSeed: 16, bottomScore: 0,
    status: "scheduled", winnerId: null, winnerSlot: null,
    nextMatchupId: "midwest-r2-1", scheduledTime: "Mar 27, 12:15 PM ET",
  },
  {
    id: "midwest-r1-2", round: 1, roundLabel: "First Round", region: "Midwest", slot: 2,
    topTeamId: "midwest-8-iowa", topTeamName: "Iowa", topTeamSeed: 8, topScore: 0,
    bottomTeamId: "midwest-9-auburn", bottomTeamName: "Auburn", bottomTeamSeed: 9, bottomScore: 0,
    status: "scheduled", winnerId: null, winnerSlot: null,
    nextMatchupId: "midwest-r2-1", scheduledTime: "Mar 27, 2:45 PM ET",
  },
  {
    id: "midwest-r1-3", round: 1, roundLabel: "First Round", region: "Midwest", slot: 3,
    topTeamId: "midwest-5-miami-fl", topTeamName: "Miami (FL)", topTeamSeed: 5, topScore: 0,
    bottomTeamId: "midwest-12-drake", bottomTeamName: "Drake", bottomTeamSeed: 12, bottomScore: 0,
    status: "scheduled", winnerId: null, winnerSlot: null,
    nextMatchupId: "midwest-r2-2", scheduledTime: "Mar 27, 7:10 PM ET",
  },
  {
    id: "midwest-r1-4", round: 1, roundLabel: "First Round", region: "Midwest", slot: 4,
    topTeamId: "midwest-4-indiana", topTeamName: "Indiana", topTeamSeed: 4, topScore: 0,
    bottomTeamId: "midwest-13-kent-state", bottomTeamName: "Kent State", bottomTeamSeed: 13, bottomScore: 0,
    status: "scheduled", winnerId: null, winnerSlot: null,
    nextMatchupId: "midwest-r2-2", scheduledTime: "Mar 27, 9:40 PM ET",
  },
  {
    id: "midwest-r1-5", round: 1, roundLabel: "First Round", region: "Midwest", slot: 5,
    topTeamId: "midwest-6-iowa-state", topTeamName: "Iowa State", topTeamSeed: 6, topScore: 0,
    bottomTeamId: "midwest-11-pitt", bottomTeamName: "Pittsburgh", bottomTeamSeed: 11, bottomScore: 0,
    status: "scheduled", winnerId: null, winnerSlot: null,
    nextMatchupId: "midwest-r2-3", scheduledTime: "Mar 28, 12:15 PM ET",
  },
  {
    id: "midwest-r1-6", round: 1, roundLabel: "First Round", region: "Midwest", slot: 6,
    topTeamId: "midwest-3-xavier", topTeamName: "Xavier", topTeamSeed: 3, topScore: 0,
    bottomTeamId: "midwest-14-kennesaw-state", bottomTeamName: "Kennesaw State", bottomTeamSeed: 14, bottomScore: 0,
    status: "scheduled", winnerId: null, winnerSlot: null,
    nextMatchupId: "midwest-r2-3", scheduledTime: "Mar 28, 2:45 PM ET",
  },
  {
    id: "midwest-r1-7", round: 1, roundLabel: "First Round", region: "Midwest", slot: 7,
    topTeamId: "midwest-7-texas-am", topTeamName: "Texas A&M", topTeamSeed: 7, topScore: 0,
    bottomTeamId: "midwest-10-penn-state", bottomTeamName: "Penn State", bottomTeamSeed: 10, bottomScore: 0,
    status: "scheduled", winnerId: null, winnerSlot: null,
    nextMatchupId: "midwest-r2-4", scheduledTime: "Mar 28, 7:10 PM ET",
  },
  {
    id: "midwest-r1-8", round: 1, roundLabel: "First Round", region: "Midwest", slot: 8,
    topTeamId: "midwest-2-texas", topTeamName: "Texas", topTeamSeed: 2, topScore: 0,
    bottomTeamId: "midwest-15-colgate", bottomTeamName: "Colgate", bottomTeamSeed: 15, bottomScore: 0,
    status: "scheduled", winnerId: null, winnerSlot: null,
    nextMatchupId: "midwest-r2-4", scheduledTime: "Mar 28, 9:40 PM ET",
  },

  // ── EAST  —  Second Round ─────────────────────────────────────────────────
  // east-r1-1 winner (Kansas) vs east-r1-2 winner (Arkansas) — both final
  {
    id: "east-r2-1", round: 2, roundLabel: "Second Round", region: "East", slot: 1,
    topTeamId: "east-1-kansas", topTeamName: "Kansas", topTeamSeed: 1, topScore: 0,
    bottomTeamId: "east-8-arkansas", bottomTeamName: "Arkansas", bottomTeamSeed: 8, bottomScore: 0,
    status: "scheduled", winnerId: null, winnerSlot: null,
    nextMatchupId: "east-r3-1", scheduledTime: "Mar 23, 2:00 PM ET",
  },
  // east-r1-3 winner (TBD—live) vs east-r1-4 winner (TBD—scheduled)
  {
    id: "east-r2-2", round: 2, roundLabel: "Second Round", region: "East", slot: 2,
    topTeamId: null, topTeamName: "TBD", topTeamSeed: null, topScore: 0,
    bottomTeamId: null, bottomTeamName: "TBD", bottomTeamSeed: null, bottomScore: 0,
    status: "scheduled", winnerId: null, winnerSlot: null,
    nextMatchupId: "east-r3-1", scheduledTime: "Mar 23, 4:30 PM ET",
  },
  // east-r1-5 winner (TCU) vs east-r1-6 winner (Gonzaga) — both final
  {
    id: "east-r2-3", round: 2, roundLabel: "Second Round", region: "East", slot: 3,
    topTeamId: "east-6-tcu", topTeamName: "TCU", topTeamSeed: 6, topScore: 0,
    bottomTeamId: "east-3-gonzaga", bottomTeamName: "Gonzaga", bottomTeamSeed: 3, bottomScore: 0,
    status: "scheduled", winnerId: null, winnerSlot: null,
    nextMatchupId: "east-r3-2", scheduledTime: "Mar 23, 7:10 PM ET",
  },
  // east-r1-7 winner (TBD) vs east-r1-8 winner (UNC Asheville—upset)
  {
    id: "east-r2-4", round: 2, roundLabel: "Second Round", region: "East", slot: 4,
    topTeamId: null, topTeamName: "TBD", topTeamSeed: null, topScore: 0,
    bottomTeamId: "east-15-unc-asheville", bottomTeamName: "UNC Asheville", bottomTeamSeed: 15, bottomScore: 0,
    status: "scheduled", winnerId: null, winnerSlot: null,
    nextMatchupId: "east-r3-2", scheduledTime: "Mar 23, 9:40 PM ET",
  },

  // ── WEST  —  Second Round (all TBD) ──────────────────────────────────────
  {
    id: "west-r2-1", round: 2, roundLabel: "Second Round", region: "West", slot: 1,
    topTeamId: null, topTeamName: "TBD", topTeamSeed: null, topScore: 0,
    bottomTeamId: null, bottomTeamName: "TBD", bottomTeamSeed: null, bottomScore: 0,
    status: "scheduled", winnerId: null, winnerSlot: null,
    nextMatchupId: "west-r3-1", scheduledTime: "Mar 25, 2:00 PM ET",
  },
  {
    id: "west-r2-2", round: 2, roundLabel: "Second Round", region: "West", slot: 2,
    topTeamId: null, topTeamName: "TBD", topTeamSeed: null, topScore: 0,
    bottomTeamId: null, bottomTeamName: "TBD", bottomTeamSeed: null, bottomScore: 0,
    status: "scheduled", winnerId: null, winnerSlot: null,
    nextMatchupId: "west-r3-1", scheduledTime: "Mar 25, 4:30 PM ET",
  },
  {
    id: "west-r2-3", round: 2, roundLabel: "Second Round", region: "West", slot: 3,
    topTeamId: null, topTeamName: "TBD", topTeamSeed: null, topScore: 0,
    bottomTeamId: null, bottomTeamName: "TBD", bottomTeamSeed: null, bottomScore: 0,
    status: "scheduled", winnerId: null, winnerSlot: null,
    nextMatchupId: "west-r3-2", scheduledTime: "Mar 25, 7:10 PM ET",
  },
  {
    id: "west-r2-4", round: 2, roundLabel: "Second Round", region: "West", slot: 4,
    topTeamId: null, topTeamName: "TBD", topTeamSeed: null, topScore: 0,
    bottomTeamId: null, bottomTeamName: "TBD", bottomTeamSeed: null, bottomScore: 0,
    status: "scheduled", winnerId: null, winnerSlot: null,
    nextMatchupId: "west-r3-2", scheduledTime: "Mar 25, 9:40 PM ET",
  },

  // ── SOUTH  —  Second Round (all TBD) ─────────────────────────────────────
  {
    id: "south-r2-1", round: 2, roundLabel: "Second Round", region: "South", slot: 1,
    topTeamId: null, topTeamName: "TBD", topTeamSeed: null, topScore: 0,
    bottomTeamId: null, bottomTeamName: "TBD", bottomTeamSeed: null, bottomScore: 0,
    status: "scheduled", winnerId: null, winnerSlot: null,
    nextMatchupId: "south-r3-1", scheduledTime: "Mar 26, 2:00 PM ET",
  },
  {
    id: "south-r2-2", round: 2, roundLabel: "Second Round", region: "South", slot: 2,
    topTeamId: null, topTeamName: "TBD", topTeamSeed: null, topScore: 0,
    bottomTeamId: null, bottomTeamName: "TBD", bottomTeamSeed: null, bottomScore: 0,
    status: "scheduled", winnerId: null, winnerSlot: null,
    nextMatchupId: "south-r3-1", scheduledTime: "Mar 26, 4:30 PM ET",
  },
  {
    id: "south-r2-3", round: 2, roundLabel: "Second Round", region: "South", slot: 3,
    topTeamId: null, topTeamName: "TBD", topTeamSeed: null, topScore: 0,
    bottomTeamId: null, bottomTeamName: "TBD", bottomTeamSeed: null, bottomScore: 0,
    status: "scheduled", winnerId: null, winnerSlot: null,
    nextMatchupId: "south-r3-2", scheduledTime: "Mar 26, 7:10 PM ET",
  },
  {
    id: "south-r2-4", round: 2, roundLabel: "Second Round", region: "South", slot: 4,
    topTeamId: null, topTeamName: "TBD", topTeamSeed: null, topScore: 0,
    bottomTeamId: null, bottomTeamName: "TBD", bottomTeamSeed: null, bottomScore: 0,
    status: "scheduled", winnerId: null, winnerSlot: null,
    nextMatchupId: "south-r3-2", scheduledTime: "Mar 26, 9:40 PM ET",
  },

  // ── MIDWEST  —  Second Round (all TBD) ───────────────────────────────────
  {
    id: "midwest-r2-1", round: 2, roundLabel: "Second Round", region: "Midwest", slot: 1,
    topTeamId: null, topTeamName: "TBD", topTeamSeed: null, topScore: 0,
    bottomTeamId: null, bottomTeamName: "TBD", bottomTeamSeed: null, bottomScore: 0,
    status: "scheduled", winnerId: null, winnerSlot: null,
    nextMatchupId: "midwest-r3-1", scheduledTime: "Mar 27, 2:00 PM ET",
  },
  {
    id: "midwest-r2-2", round: 2, roundLabel: "Second Round", region: "Midwest", slot: 2,
    topTeamId: null, topTeamName: "TBD", topTeamSeed: null, topScore: 0,
    bottomTeamId: null, bottomTeamName: "TBD", bottomTeamSeed: null, bottomScore: 0,
    status: "scheduled", winnerId: null, winnerSlot: null,
    nextMatchupId: "midwest-r3-1", scheduledTime: "Mar 27, 4:30 PM ET",
  },
  {
    id: "midwest-r2-3", round: 2, roundLabel: "Second Round", region: "Midwest", slot: 3,
    topTeamId: null, topTeamName: "TBD", topTeamSeed: null, topScore: 0,
    bottomTeamId: null, bottomTeamName: "TBD", bottomTeamSeed: null, bottomScore: 0,
    status: "scheduled", winnerId: null, winnerSlot: null,
    nextMatchupId: "midwest-r3-2", scheduledTime: "Mar 27, 7:10 PM ET",
  },
  {
    id: "midwest-r2-4", round: 2, roundLabel: "Second Round", region: "Midwest", slot: 4,
    topTeamId: null, topTeamName: "TBD", topTeamSeed: null, topScore: 0,
    bottomTeamId: null, bottomTeamName: "TBD", bottomTeamSeed: null, bottomScore: 0,
    status: "scheduled", winnerId: null, winnerSlot: null,
    nextMatchupId: "midwest-r3-2", scheduledTime: "Mar 27, 9:40 PM ET",
  },

  // ── SWEET 16 (all TBD) ────────────────────────────────────────────────────
  { id: "east-r3-1", round: 3, roundLabel: "Sweet 16", region: "East", slot: 1, topTeamId: null, topTeamName: "TBD", topTeamSeed: null, topScore: 0, bottomTeamId: null, bottomTeamName: "TBD", bottomTeamSeed: null, bottomScore: 0, status: "scheduled", winnerId: null, winnerSlot: null, nextMatchupId: "east-r4-1", scheduledTime: "Mar 30, TBD" },
  { id: "east-r3-2", round: 3, roundLabel: "Sweet 16", region: "East", slot: 2, topTeamId: null, topTeamName: "TBD", topTeamSeed: null, topScore: 0, bottomTeamId: null, bottomTeamName: "TBD", bottomTeamSeed: null, bottomScore: 0, status: "scheduled", winnerId: null, winnerSlot: null, nextMatchupId: "east-r4-1", scheduledTime: "Mar 30, TBD" },
  { id: "west-r3-1", round: 3, roundLabel: "Sweet 16", region: "West", slot: 1, topTeamId: null, topTeamName: "TBD", topTeamSeed: null, topScore: 0, bottomTeamId: null, bottomTeamName: "TBD", bottomTeamSeed: null, bottomScore: 0, status: "scheduled", winnerId: null, winnerSlot: null, nextMatchupId: "west-r4-1", scheduledTime: "Mar 30, TBD" },
  { id: "west-r3-2", round: 3, roundLabel: "Sweet 16", region: "West", slot: 2, topTeamId: null, topTeamName: "TBD", topTeamSeed: null, topScore: 0, bottomTeamId: null, bottomTeamName: "TBD", bottomTeamSeed: null, bottomScore: 0, status: "scheduled", winnerId: null, winnerSlot: null, nextMatchupId: "west-r4-1", scheduledTime: "Mar 30, TBD" },
  { id: "south-r3-1", round: 3, roundLabel: "Sweet 16", region: "South", slot: 1, topTeamId: null, topTeamName: "TBD", topTeamSeed: null, topScore: 0, bottomTeamId: null, bottomTeamName: "TBD", bottomTeamSeed: null, bottomScore: 0, status: "scheduled", winnerId: null, winnerSlot: null, nextMatchupId: "south-r4-1", scheduledTime: "Mar 31, TBD" },
  { id: "south-r3-2", round: 3, roundLabel: "Sweet 16", region: "South", slot: 2, topTeamId: null, topTeamName: "TBD", topTeamSeed: null, topScore: 0, bottomTeamId: null, bottomTeamName: "TBD", bottomTeamSeed: null, bottomScore: 0, status: "scheduled", winnerId: null, winnerSlot: null, nextMatchupId: "south-r4-1", scheduledTime: "Mar 31, TBD" },
  { id: "midwest-r3-1", round: 3, roundLabel: "Sweet 16", region: "Midwest", slot: 1, topTeamId: null, topTeamName: "TBD", topTeamSeed: null, topScore: 0, bottomTeamId: null, bottomTeamName: "TBD", bottomTeamSeed: null, bottomScore: 0, status: "scheduled", winnerId: null, winnerSlot: null, nextMatchupId: "midwest-r4-1", scheduledTime: "Mar 31, TBD" },
  { id: "midwest-r3-2", round: 3, roundLabel: "Sweet 16", region: "Midwest", slot: 2, topTeamId: null, topTeamName: "TBD", topTeamSeed: null, topScore: 0, bottomTeamId: null, bottomTeamName: "TBD", bottomTeamSeed: null, bottomScore: 0, status: "scheduled", winnerId: null, winnerSlot: null, nextMatchupId: "midwest-r4-1", scheduledTime: "Mar 31, TBD" },

  // ── ELITE EIGHT (all TBD) ─────────────────────────────────────────────────
  { id: "east-r4-1", round: 4, roundLabel: "Elite Eight", region: "East", slot: 1, topTeamId: null, topTeamName: "TBD", topTeamSeed: null, topScore: 0, bottomTeamId: null, bottomTeamName: "TBD", bottomTeamSeed: null, bottomScore: 0, status: "scheduled", winnerId: null, winnerSlot: null, nextMatchupId: "ff-r5-1", scheduledTime: "Apr 1, TBD" },
  { id: "west-r4-1", round: 4, roundLabel: "Elite Eight", region: "West", slot: 1, topTeamId: null, topTeamName: "TBD", topTeamSeed: null, topScore: 0, bottomTeamId: null, bottomTeamName: "TBD", bottomTeamSeed: null, bottomScore: 0, status: "scheduled", winnerId: null, winnerSlot: null, nextMatchupId: "ff-r5-1", scheduledTime: "Apr 1, TBD" },
  { id: "south-r4-1", round: 4, roundLabel: "Elite Eight", region: "South", slot: 1, topTeamId: null, topTeamName: "TBD", topTeamSeed: null, topScore: 0, bottomTeamId: null, bottomTeamName: "TBD", bottomTeamSeed: null, bottomScore: 0, status: "scheduled", winnerId: null, winnerSlot: null, nextMatchupId: "ff-r5-2", scheduledTime: "Apr 2, TBD" },
  { id: "midwest-r4-1", round: 4, roundLabel: "Elite Eight", region: "Midwest", slot: 1, topTeamId: null, topTeamName: "TBD", topTeamSeed: null, topScore: 0, bottomTeamId: null, bottomTeamName: "TBD", bottomTeamSeed: null, bottomScore: 0, status: "scheduled", winnerId: null, winnerSlot: null, nextMatchupId: "ff-r5-2", scheduledTime: "Apr 2, TBD" },

  // ── FINAL FOUR (all TBD) ──────────────────────────────────────────────────
  { id: "ff-r5-1", round: 5, roundLabel: "Final Four", region: "Final Four", slot: 1, topTeamId: null, topTeamName: "East Winner", topTeamSeed: null, topScore: 0, bottomTeamId: null, bottomTeamName: "West Winner", bottomTeamSeed: null, bottomScore: 0, status: "scheduled", winnerId: null, winnerSlot: null, nextMatchupId: "champ-r6-1", scheduledTime: "Apr 5, TBD" },
  { id: "ff-r5-2", round: 5, roundLabel: "Final Four", region: "Final Four", slot: 2, topTeamId: null, topTeamName: "South Winner", topTeamSeed: null, topScore: 0, bottomTeamId: null, bottomTeamName: "Midwest Winner", bottomTeamSeed: null, bottomScore: 0, status: "scheduled", winnerId: null, winnerSlot: null, nextMatchupId: "champ-r6-1", scheduledTime: "Apr 5, TBD" },

  // ── CHAMPIONSHIP ──────────────────────────────────────────────────────────
  { id: "champ-r6-1", round: 6, roundLabel: "Championship", region: "Final Four", slot: 1, topTeamId: null, topTeamName: "TBD", topTeamSeed: null, topScore: 0, bottomTeamId: null, bottomTeamName: "TBD", bottomTeamSeed: null, bottomScore: 0, status: "scheduled", winnerId: null, winnerSlot: null, nextMatchupId: null, scheduledTime: "Apr 7, TBD" },
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BracketApiResponse>
) {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  const sportParam =
    typeof req.query.sport === "string" ? req.query.sport : "mens";
  const gender = sportParam === "womens" ? "womens" : "mens";
  const fallbackName =
    gender === "womens"
      ? "NCAA Women's Basketball Tournament"
      : "NCAA Men's Basketball Tournament";

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const supabase = createAdminClient() as any;

      const { data: tournament } = await supabase
        .from("tournaments")
        .select("id, name")
        .eq("sport", "basketball")
        .eq("gender", gender)
        .eq("season_year", 2025)
        .single();

      if (tournament) {
        const { data: rows } = await supabase
          .from("tournament_games")
          .select(`
            id,
            slot_number,
            top_score,
            bottom_score,
            status,
            winner_id,
            winner_slot,
            next_game_id,
            scheduled_time,
            top_team:tournament_teams!top_team_id(id, name, seed),
            bottom_team:tournament_teams!bottom_team_id(id, name, seed),
            round:tournament_rounds!round_id(round_number, name),
            region:tournament_regions!region_id(name)
          `)
          .eq("tournament_id", tournament.id)
          .order("slot_number");

        if (rows && rows.length > 0) {
          const games: TournamentGame[] = rows.map((r: any) => {
            const top = Array.isArray(r.top_team) ? r.top_team[0] : r.top_team;
            const bottom = Array.isArray(r.bottom_team) ? r.bottom_team[0] : r.bottom_team;
            const round = Array.isArray(r.round) ? r.round[0] : r.round;
            const region = Array.isArray(r.region) ? r.region[0] : r.region;
            return {
              id: r.id as string,
              round: ((round as { round_number: number } | null)?.round_number ?? 1) as TournamentGame["round"],
              roundLabel: (round as { name: string } | null)?.name ?? "",
              region: (() => { const n = (region as { name: string } | null)?.name; return n ? n.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') : null; })(),
              slot: r.slot_number as number,
              topTeamId: (top as { id: string } | null)?.id ?? null,
              topTeamName: (top as { name: string } | null)?.name ?? "TBD",
              topTeamSeed: (top as { seed: number | null } | null)?.seed ?? null,
              topScore: r.top_score as number,
              bottomTeamId: (bottom as { id: string } | null)?.id ?? null,
              bottomTeamName: (bottom as { name: string } | null)?.name ?? "TBD",
              bottomTeamSeed: (bottom as { seed: number | null } | null)?.seed ?? null,
              bottomScore: r.bottom_score as number,
              status: (r.status ?? "scheduled") as TournamentGame["status"],
              winnerId: (r.winner_id as string | null) ?? null,
              winnerSlot: (r.winner_slot as "top" | "bottom" | null) ?? null,
              nextMatchupId: (r.next_game_id as string | null) ?? null,
              scheduledTime: r.scheduled_time
                ? new Date(r.scheduled_time as string).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    timeZone: "America/New_York",
                    timeZoneName: "short",
                  })
                : "TBD",
            };
          });

          res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");
          return res.status(200).json({
            tournamentName: tournament.name,
            season: "2025",
            lastUpdated: new Date().toISOString(),
            games,
          });
        }
      }
    } catch {
      // fall through to mock
    }
  }

  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");
  return res.status(200).json({
    tournamentName: fallbackName,
    season: "2025",
    lastUpdated: new Date().toISOString(),
    games: MOCK_BRACKET,
  });
}
