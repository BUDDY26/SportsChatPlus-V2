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

### 2026-03-27 — Slot assignment: numeric Henry gameID sort is the authoritative rule (FINAL)

**Decision**: Slot assignment uses numeric sort of Henry external game IDs within each `region:round` group, assigning `slot_number = idx + 1` (lowest Henry gameID = slot 1). This is the sole slot assignment rule for all rounds.

**History**:
- *Phase 3 (2026-03-23)*: Numeric sort was the original rule. Described as "preserves slot assignment logic." Seemed valid — the scaffold was new and no slot collisions were observable.
- *Superseded attempt (2026-03-27 AM)*: Replaced with seed-based `deriveSlotFromSeeds` after UT Austin (2-seed, Midwest) remained `status = "scheduled"` post-sync. Root cause was diagnosed as numeric sort ordering mismatch. Seed-based rule implemented as primary with numeric sort as R5/R6 fallback.
- *Reverted (2026-03-27 PM)*: Seed-based rule was incorrect. The scaffold's actual slot convention WAS established by the initial numeric sort — the scaffold is the source of truth, not standard NCAA bracket seeding. Seed-based rule correctly placed UT Austin's game in East+Midwest (where Henry ID order happened to match seed order) but placed South+West games in wrong scaffold rows (where Henry ID order differs from seed order). South+West Sweet 16 remained `status = "scheduled"` after the seed-based fix.

**Root cause of the UT Austin incident (retrospective)**: The slot collision was not caused by numeric sort being wrong — it was caused by something upstream (likely the scaffold initial population or a prior sync that ran before all Sweet 16 games were present). Numeric sort is self-consistent: as long as the same set of Henry game IDs arrives in the same sort order each sync, the assignment is stable and matches scaffold.

**Correct rule**: Within each `region:round` group, sort Henry game IDs numerically (`parseInt(a.externalGameId) - parseInt(b.externalGameId)`) and assign `slot_number = idx + 1`. No seed lookup. No fallback paths. Applies to all rounds (R1–R6).

**Files**: `scripts/sync-tournament.ts`

### 2026-03-27 — `mapGameState`: add overtime final-state variants

**Decision**: Add `s.startsWith("f/")` to the final-state branch of `mapGameState` in `scripts/sync-tournament.ts`.

**Prior state (Phase 3, 2026-03-23)**: `mapGameState` matched only `"f"` and `"final"` as final states. Henry returns `"F/OT"`, `"F/2OT"`, `"F/3OT"`, etc. for overtime endings. These fell through to `return "scheduled"`, leaving overtime-completed games as `status = "scheduled"` in the DB.

**Why it wasn't caught**: Phase 3 testing predated any overtime games in the 2026 tournament. The `finalStatus` override codepath (which compares scoreboard status against game-detail status) was also silently broken by this — both sides of the condition used `mapGameState`, so both returned "scheduled" for the same overtime string; the override could never fire.

**Corrected rule**: `if (s === "f" || s === "final" || s.startsWith("f/")) return "final"`. This covers all `F/OT`, `F/2OT`, `F/3OT` variants and any future Henry overtime suffixes. The `finalStatus` override becomes a live, effective codepath once both sides can return the correct status.

**Files**: `scripts/sync-tournament.ts`
