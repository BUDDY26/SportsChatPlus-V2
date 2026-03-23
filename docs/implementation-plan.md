# Tournament Bracket Fix — Implementation Plan

## Root cause

`sync-tournament.ts` only writes rows for games present in the Henry NCAA scoreboard API. Later-round games (R4–R6) have no scoreboard entries until they are actually scheduled. This means the DB never contains a complete bracket — `next_game_id` pointers reference UUIDs that don't exist, and client-side winner propagation silently drops.

Secondary causes:
- All four R4 (Elite Eight) games are assigned `slot_number = 1` by the sync script (one game per region). The client-side `fills_top = slot % 2 === 1` parity heuristic evaluates to `true` for all four, incorrectly sending West and Midwest winners to the top slot of their Final Four games.
- `next_game_id` for all four R4 games points to Final Four slot 1 (via `Math.ceil(1/2) = 1`) — South and Midwest winners can never reach Final Four slot 2.

## Fix strategy

**Scaffold the full bracket in the DB before any sync runs.** All 63 game slots per tournament exist as placeholder rows. Sync UPDATEs existing rows rather than INSERTing new ones. `next_game_id` and `fills_top_in_next` are baked into the scaffold and never touched by sync.

---

## Phases

### Phase 1 — Schema (complete)

**Migration 008** (`008_tournament_fills_top.sql`)
- Adds `fills_top_in_next BOOLEAN` column to `tournament_games`
- Nullable — Championship row has NULL
- No default — value set at scaffold time

### Phase 2 — Scaffold (complete)

**Migration 009** (`009_tournament_bracket_scaffold.sql`)
- Creates tournament rows for mens and womens (2025 season) if absent
- Creates 5 regions per tournament (East, West, South, Midwest, Final Four)
- Creates 6 rounds per tournament (R1–R6)
- Inserts 63 scaffold game rows per tournament, all with:
  - `external_game_id = NULL`
  - `top_team_id = NULL`, `bottom_team_id = NULL`
  - `status = 'scheduled'`
  - `next_game_id` — pre-wired in pass 2
  - `fills_top_in_next` — hardcoded per slot

### Phase 3 — Sync update (complete)

**`scripts/sync-tournament.ts`**
- Step 5 (game INSERT): replaced with UPDATE by `tournament_id + round_id + region_id + slot_number` match
- Pass 2 (`next_game_id` update loop): removed — superseded by scaffold
- Preserves slot assignment logic (sort Henry gameIDs numerically within region+round group)
- Never inserts new `tournament_games` rows
- `REGION_TITLE_NORM` constant + `normalizeRegionTitle()` helper normalizes Henry uppercase region titles (`EAST` → `East`) before scaffold lookup
- Explicit `regionId` null guard logs the unresolved region name and skips with a clear warning

### Phase 4 — API update (pending)

**`pages/api/tournament/bracket.ts`**
- Add `fills_top_in_next` to the `.select()` query
- Map to `fillsTop` in the `TournamentGame` response shape

### Phase 5 — Type update (pending)

**`lib/sports/types.ts`**
- Add `fillsTop: boolean | null` to `TournamentGame` interface

### Phase 6 — Client update (pending)

**`components/tournament/TournamentClientWrapper.tsx`**
- In `propagateWinners`: replace `game.slot % 2 === 1` with `game.fillsTop ?? (game.slot % 2 === 1)`
- The `??` fallback preserves compatibility with mock data (which has no `fillsTop`)

---

## Verification queries

After applying Migrations 008 and 009, confirm in the Supabase SQL editor:

```sql
-- 1. Confirm game counts
SELECT t.gender, COUNT(tg.id) AS total_games
FROM tournament_games tg
JOIN tournaments t ON tg.tournament_id = t.id
GROUP BY t.gender;
-- Expected: mens=63, womens=63

-- 2. Confirm next_game_id wiring is complete
SELECT COUNT(*) FROM tournament_games tg
JOIN tournament_rounds tr ON tg.round_id = tr.id
WHERE tr.round_number < 6 AND tg.next_game_id IS NULL;
-- Expected: 0

-- 3. Confirm fills_top_in_next is set for all non-championship rows
SELECT COUNT(*) FROM tournament_games tg
JOIN tournament_rounds tr ON tg.round_id = tr.id
WHERE tr.round_number < 6 AND tg.fills_top_in_next IS NULL;
-- Expected: 0

-- 4. Confirm R4 → FF wiring (all four R4 rows must point to different FF UUIDs)
SELECT reg.name AS region, tg.slot_number, tg.fills_top_in_next,
       tg.next_game_id, ng.slot_number AS ff_slot
FROM tournament_games tg
JOIN tournament_rounds tr   ON tg.round_id   = tr.id
JOIN tournament_regions reg ON tg.region_id  = reg.id
JOIN tournaments t          ON tg.tournament_id = t.id
LEFT JOIN tournament_games ng ON tg.next_game_id = ng.id::text
WHERE tr.round_number = 4 AND t.gender = 'mens'
ORDER BY reg.name;
-- Expected: East/South → ff_slot=1 or 2 correctly, West/Midwest → opposite
```
