# SportsChatPlus-V2 — Architecture Notes

## Router Split

App Router (`app/`) for all pages. Pages Router (`pages/api/`) for all API routes. Never mix.

---

## Tournament Bracket System

### Data model

The tournament bracket is stored across five tables:

| Table | Role |
|---|---|
| `tournaments` | One row per gender per season (`sport`, `gender`, `season_year`) |
| `tournament_regions` | East, West, South, Midwest, Final Four — per tournament |
| `tournament_rounds` | R1–R6 per tournament |
| `tournament_teams` | Populated by sync when bracket is announced |
| `tournament_games` | 63 scaffold rows per tournament; team/score fields filled by sync |
| `tournament_game_scores` | Per-period linescore rows for finished/live games |

### Bracket graph

Each `tournament_games` row carries two fields that encode the bracket progression graph:

| Column | Type | Meaning |
|---|---|---|
| `next_game_id` | `TEXT` (UUID as text, no FK) | UUID of the game this winner advances to; NULL for Championship |
| `fills_top_in_next` | `BOOLEAN` | `true` = winner fills the top slot of the next game; `false` = bottom; NULL for Championship |

Both fields are set at scaffold creation time (Migration 009) and never overwritten by sync.

`next_game_id` is TEXT to avoid self-referencing FK insert-order constraint violations.

### Scaffold-first design

All 63 game slots per tournament are pre-created by Migration 009 before any live data is synced. Scaffold rows have:
- `external_game_id = NULL`
- `top_team_id = NULL`, `bottom_team_id = NULL`
- `status = 'scheduled'`

`sync-tournament.ts` locates the matching scaffold row by `tournament_id + round_id + region_id + slot_number` and UPDATEs it with Henry API data. It never INSERTs new game rows.

### Cross-region Final Four wiring

The bracket links four independent regional brackets (East, West, South, Midwest) into two Final Four games, then to the Championship. The mapping is explicit in the scaffold:

| R4 source | FF game | fills_top |
|---|---|---|
| East R4 slot 1 | Final Four R5 slot 1 | true |
| West R4 slot 1 | Final Four R5 slot 1 | false |
| South R4 slot 1 | Final Four R5 slot 2 | true |
| Midwest R4 slot 1 | Final Four R5 slot 2 | false |

This mapping cannot be derived from slot parity (all four R4 games have `slot=1`) — it must be stored explicitly.

### Client-side propagation

`components/tournament/TournamentClientWrapper.tsx` runs `propagateWinners()` on every state update. The function traverses the `nextMatchupId` graph and fills TBD team slots using the winner of each completed game.

`propagateWinners` uses `game.fillsTop` (sourced from `fills_top_in_next` in the DB) to determine whether the winner fills the top or bottom slot of the next game. When `fillsTop` is null (mock data path), it falls back to `game.slot % 2 === 1`.

---

## External Data Sources

| Source | Leagues | Auth |
|---|---|---|
| BallDontLie API | NBA, NFL, MLB | `BALLDONTLIE_API_KEY` |
| Henry NCAA API | NCAAB Men/Women, NCAAF, Baseball, Softball | None — public |
| OpenAI | AI chat, predictions | `OPENAI_API_KEY` |
| The Odds API | Odds (not yet wired) | planned |

All external fetches use AbortController with 5-second timeouts. All `by-league` API calls catch upstream failures and return 200 with empty array rather than 500.

---

## Supabase Realtime

`tournament_games` is added to the `supabase_realtime` publication (Migration 006). The client subscribes to `postgres_changes` on `UPDATE` events filtered by `tournament_id`. Score and status changes push to the client without polling.

Polling (30-second interval) is also active when live games are detected, as a fallback if the Realtime subscription drops.
