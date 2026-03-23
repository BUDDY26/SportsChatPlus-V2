# SportsChatPlus-V2 — Evidence Ledger

Records applied migrations, schema state, and significant implementation decisions.
Apply migrations manually via the Supabase SQL editor. Never auto-run.

---

## Migration Status

| Migration | File | Status | Summary |
|---|---|---|---|
| 001 | `001_users_profiles.sql` | Applied | Users and profiles tables |
| 002 | `002_favorites.sql` | Applied | Favorite teams table |
| 003 | `003_chat_messages.sql` | Applied | Chat messages table |
| 004 | `004_ai_interactions.sql` | Applied | AI interactions table |
| 005 | `005_chat_realtime_policy.sql` | Applied | Supabase Realtime policy for chat |
| 006 | `006_tournament.sql` | Applied | Full tournament schema (tournaments, regions, rounds, teams, games, scores, bracket entries) |
| 007 | `007_tournament_external_ids.sql` | Applied | Adds `external_game_id` to tournament_games and `external_team_id` to tournament_teams |
| 008 | `008_tournament_fills_top.sql` | **Pending** | Adds `fills_top_in_next BOOLEAN` to tournament_games |
| 009 | `009_tournament_bracket_scaffold.sql` | **Pending** | Full bracket scaffold: 63 game rows per tournament (mens + womens), all `next_game_id` and `fills_top_in_next` pre-wired |

---

## Schema Notes

### `tournament_games.next_game_id`

Type: `TEXT` (not UUID FK). Stores the UUID of the next game as a plain text string.
Reason: self-referencing FK on the same table creates insert-order constraint violations.
The `tournament_games_next_game_idx` index covers this column.

### `tournament_games.fills_top_in_next`

Type: `BOOLEAN`, nullable.
Added by Migration 008.
`true` = the winner of this game fills the **top** slot of `next_game_id`.
`false` = the winner fills the **bottom** slot.
`NULL` = Championship game (no next game).
Set at scaffold creation time. Never modified by sync.

### `tournament_games.winner_slot`

Type: `TEXT` (`'top'` | `'bottom'` | `NULL`).
Set by `sync-tournament.ts` based on whether the home team won.
Meaning: which row (top = home, bottom = away) in **this** game won.
This is NOT the same as `fills_top_in_next`, which describes the winner's position in the **next** game.

---

## Key Decisions

### 2026-03-23 — Scaffold-first design

**Decision**: Pre-create all 63 bracket slots per tournament in a migration seed. Sync updates existing rows; it never creates new game rows.

**Why**: `sync-tournament.ts` only discovers games that appear in the Henry NCAA scoreboard API. Later-round games (R4–R6) are absent until the NCAA schedules them. Without a scaffold, `next_game_id` references non-existent UUIDs and client propagation silently drops winners.

**Files**: `009_tournament_bracket_scaffold.sql`

### 2026-03-23 — `fills_top_in_next` column

**Decision**: Add a boolean column to `tournament_games` recording which slot in the next game this game's winner fills.

**Why**: The prior client-side heuristic `slot % 2 === 1` (odd = top, even = bottom) is correct for R1–R3 but fails at R4. All four Elite Eight games have `slot_number = 1` (one game per region), so parity evaluates to `true` for all four. West and Midwest winners were incorrectly placed in the top slot of their Final Four games. The correct placement (East/South → top, West/Midwest → bottom) is bracket-structure knowledge that must be stored in the DB.

**Files**: `008_tournament_fills_top.sql`, `009_tournament_bracket_scaffold.sql`

### 2026-03-23 — R4 → Final Four cross-region explicit wiring

**Decision**: Hard-code the R4 → R5 region mapping in the scaffold rather than deriving it from slot numbers.

**Why**: `Math.ceil(slot / 2)` cannot distinguish East from West (both slot=1) or South from Midwest (both slot=1). The correct mapping is fixed bracket topology, not derivable from slot numbers alone.

**Mens Final Four pairing**:
- East winner (fills top) + West winner (fills bottom) → Final Four slot 1
- South winner (fills top) + Midwest winner (fills bottom) → Final Four slot 2

**Womens Final Four pairing** (venue-based region names from live DB):
- FORT WORTH 1 winner (fills top) + SACRAMENTO 2 winner (fills bottom) → Final Four slot 1
- FORT WORTH 3 winner (fills top) + SACRAMENTO 4 winner (fills bottom) → Final Four slot 2

The numeric suffix in each women's region name encodes the pairing and slot fill: 1 and 3 are top-fillers (odd), 2 and 4 are bottom-fillers (even). Regions 1+2 meet in FF slot 1; regions 3+4 meet in FF slot 2.

### 2026-03-23 — Henry API uppercase region titles (men's)

**Decision**: Normalize Henry region title strings before scaffold-row lookup in `sync-tournament.ts`.

**Why**: Henry returns uppercase titles (`EAST`, `WEST`, `SOUTH`, `MIDWEST`) for the men's tournament. The scaffold stores Title Case names (`East`, `West`, `South`, `Midwest`). Before this fix, 51 of 51 men's games failed the `regionId` lookup and were dropped with a misleading "run Migration 009 first" message. Women's venue-based names (`FORT WORTH 1`, etc.) already matched and required no normalization.

**Implementation**: `REGION_TITLE_NORM` constant + `normalizeRegionTitle()` helper applied at `gameDataList.push()`. An explicit `regionId` null guard logs the actual region name and skips with a clear message if normalization still fails.

**Files**: `scripts/sync-tournament.ts`
