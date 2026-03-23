-- Migration 009: NCAA Tournament Bracket Scaffold
--
-- Pre-creates all 63 game placeholder rows per tournament (mens + womens = 126
-- total), with next_game_id and fills_top_in_next fully wired.
--
-- Bracket topology (per gender, 64-team single elimination):
--   R1  First Round    32 games  (8 per region × 4 regions)
--   R2  Second Round   16 games  (4 per region × 4 regions)
--   R3  Sweet 16        8 games  (2 per region × 4 regions)
--   R4  Elite Eight     4 games  (1 per region × 4 regions)
--   R5  Final Four      2 games  (Final Four region)
--   R6  Championship    1 game   (Final Four region)
--   ────────────────────────────────────────────
--   Total               63 games per tournament
--
-- Mens regions  : East, West, South, Midwest
-- Womens regions: FORT WORTH 1, SACRAMENTO 2, FORT WORTH 3, SACRAMENTO 4
--
-- Progression rules baked into the scaffold:
--   Mens:
--     East    R4 → Final Four R5 slot 1, fills_top = true
--     West    R4 → Final Four R5 slot 1, fills_top = false
--     South   R4 → Final Four R5 slot 2, fills_top = true
--     Midwest R4 → Final Four R5 slot 2, fills_top = false
--   Womens:
--     FORT WORTH 1  R4 → Final Four R5 slot 1, fills_top = true
--     SACRAMENTO 2  R4 → Final Four R5 slot 1, fills_top = false
--     FORT WORTH 3  R4 → Final Four R5 slot 2, fills_top = true
--     SACRAMENTO 4  R4 → Final Four R5 slot 2, fills_top = false
--   Both:
--     Odd slot (R1–R3) → fills_top_in_next = true
--     Even slot (R1–R3) → fills_top_in_next = false
--     FF R5 slot 1 → Championship, fills_top = true
--     FF R5 slot 2 → Championship, fills_top = false
--     Championship → next_game_id = NULL, fills_top_in_next = NULL
--
-- Scaffold rows have:
--   external_game_id = NULL   (sync-tournament.ts sets this when Henry data arrives)
--   top_team_id / bottom_team_id = NULL   (TBD until bracket is announced)
--   status = 'scheduled'
--
-- Additive behaviour:
--   Tournaments, rounds, and regions are created if absent; existing rows reused.
--   tournament_games for the target tournaments are deleted and reseeded.
--   tournament_game_scores cascade-delete automatically.
--   tournament_teams are NOT touched.
--
-- Depends on:
--   006_tournament.sql              — base schema
--   007_tournament_external_ids.sql — external_game_id column
--   008_tournament_fills_top.sql    — fills_top_in_next column

DO $$
DECLARE
  v_mens_id   UUID;
  v_womens_id UUID;
  v_t_id      UUID;
  v_gender    TEXT;
  v_round_num INTEGER;
  v_round_nm  TEXT;
  v_region_id UUID;
  v_round_id  UUID;
  r_reg       RECORD;
  r_game      RECORD;
  r_wire      RECORD;
BEGIN

  -- ─── Scaffold definition ─────────────────────────────────────────────────
  --
  -- _sc defines the complete bracket graph for one tournament.
  --
  --   gender      : 'mens' | 'womens'
  --   region      : region name (differs by gender — see header)
  --   round_num   : 1–6
  --   slot        : 1-based position within the round+region group
  --   fills_top   : true  → winner fills top slot of next game
  --                 false → winner fills bottom slot of next game
  --                 NULL  → Championship (no next game)
  --   next_region : region of the destination game; NULL for Championship
  --   next_round  : round_num of the destination game; NULL for Championship
  --   next_slot   : slot of the destination game; NULL for Championship
  --   gid         : pre-assigned UUID used as tournament_games.id

  CREATE TEMP TABLE _sc (
    gender      TEXT    NOT NULL,
    region      TEXT    NOT NULL,
    round_num   INTEGER NOT NULL,
    slot        INTEGER NOT NULL,
    fills_top   BOOLEAN,
    next_region TEXT,
    next_round  INTEGER,
    next_slot   INTEGER,
    gid         UUID    NOT NULL DEFAULT gen_random_uuid()
  ) ON COMMIT DROP;

  INSERT INTO _sc
    (gender, region, round_num, slot, fills_top, next_region, next_round, next_slot)
  VALUES
    -- ── MENS · EAST ──────────────────────────────────────────────────────────
    ('mens','East',1,1,true, 'East',2,1), ('mens','East',1,2,false,'East',2,1),
    ('mens','East',1,3,true, 'East',2,2), ('mens','East',1,4,false,'East',2,2),
    ('mens','East',1,5,true, 'East',2,3), ('mens','East',1,6,false,'East',2,3),
    ('mens','East',1,7,true, 'East',2,4), ('mens','East',1,8,false,'East',2,4),
    ('mens','East',2,1,true, 'East',3,1), ('mens','East',2,2,false,'East',3,1),
    ('mens','East',2,3,true, 'East',3,2), ('mens','East',2,4,false,'East',3,2),
    ('mens','East',3,1,true, 'East',4,1), ('mens','East',3,2,false,'East',4,1),
    ('mens','East',4,1,true, 'Final Four',5,1),

    -- ── MENS · WEST ──────────────────────────────────────────────────────────
    ('mens','West',1,1,true, 'West',2,1), ('mens','West',1,2,false,'West',2,1),
    ('mens','West',1,3,true, 'West',2,2), ('mens','West',1,4,false,'West',2,2),
    ('mens','West',1,5,true, 'West',2,3), ('mens','West',1,6,false,'West',2,3),
    ('mens','West',1,7,true, 'West',2,4), ('mens','West',1,8,false,'West',2,4),
    ('mens','West',2,1,true, 'West',3,1), ('mens','West',2,2,false,'West',3,1),
    ('mens','West',2,3,true, 'West',3,2), ('mens','West',2,4,false,'West',3,2),
    ('mens','West',3,1,true, 'West',4,1), ('mens','West',3,2,false,'West',4,1),
    ('mens','West',4,1,false,'Final Four',5,1),

    -- ── MENS · SOUTH ─────────────────────────────────────────────────────────
    ('mens','South',1,1,true, 'South',2,1), ('mens','South',1,2,false,'South',2,1),
    ('mens','South',1,3,true, 'South',2,2), ('mens','South',1,4,false,'South',2,2),
    ('mens','South',1,5,true, 'South',2,3), ('mens','South',1,6,false,'South',2,3),
    ('mens','South',1,7,true, 'South',2,4), ('mens','South',1,8,false,'South',2,4),
    ('mens','South',2,1,true, 'South',3,1), ('mens','South',2,2,false,'South',3,1),
    ('mens','South',2,3,true, 'South',3,2), ('mens','South',2,4,false,'South',3,2),
    ('mens','South',3,1,true, 'South',4,1), ('mens','South',3,2,false,'South',4,1),
    ('mens','South',4,1,true, 'Final Four',5,2),

    -- ── MENS · MIDWEST ───────────────────────────────────────────────────────
    ('mens','Midwest',1,1,true, 'Midwest',2,1), ('mens','Midwest',1,2,false,'Midwest',2,1),
    ('mens','Midwest',1,3,true, 'Midwest',2,2), ('mens','Midwest',1,4,false,'Midwest',2,2),
    ('mens','Midwest',1,5,true, 'Midwest',2,3), ('mens','Midwest',1,6,false,'Midwest',2,3),
    ('mens','Midwest',1,7,true, 'Midwest',2,4), ('mens','Midwest',1,8,false,'Midwest',2,4),
    ('mens','Midwest',2,1,true, 'Midwest',3,1), ('mens','Midwest',2,2,false,'Midwest',3,1),
    ('mens','Midwest',2,3,true, 'Midwest',3,2), ('mens','Midwest',2,4,false,'Midwest',3,2),
    ('mens','Midwest',3,1,true, 'Midwest',4,1), ('mens','Midwest',3,2,false,'Midwest',4,1),
    ('mens','Midwest',4,1,false,'Final Four',5,2),

    -- ── MENS · FINAL FOUR ────────────────────────────────────────────────────
    ('mens','Final Four',5,1,true, 'Final Four',6,1),
    ('mens','Final Four',5,2,false,'Final Four',6,1),
    ('mens','Final Four',6,1,NULL, NULL,NULL,NULL),

    -- ── WOMENS · FORT WORTH 1 → Final Four slot 1 top ────────────────────────
    ('womens','FORT WORTH 1',1,1,true, 'FORT WORTH 1',2,1),
    ('womens','FORT WORTH 1',1,2,false,'FORT WORTH 1',2,1),
    ('womens','FORT WORTH 1',1,3,true, 'FORT WORTH 1',2,2),
    ('womens','FORT WORTH 1',1,4,false,'FORT WORTH 1',2,2),
    ('womens','FORT WORTH 1',1,5,true, 'FORT WORTH 1',2,3),
    ('womens','FORT WORTH 1',1,6,false,'FORT WORTH 1',2,3),
    ('womens','FORT WORTH 1',1,7,true, 'FORT WORTH 1',2,4),
    ('womens','FORT WORTH 1',1,8,false,'FORT WORTH 1',2,4),
    ('womens','FORT WORTH 1',2,1,true, 'FORT WORTH 1',3,1),
    ('womens','FORT WORTH 1',2,2,false,'FORT WORTH 1',3,1),
    ('womens','FORT WORTH 1',2,3,true, 'FORT WORTH 1',3,2),
    ('womens','FORT WORTH 1',2,4,false,'FORT WORTH 1',3,2),
    ('womens','FORT WORTH 1',3,1,true, 'FORT WORTH 1',4,1),
    ('womens','FORT WORTH 1',3,2,false,'FORT WORTH 1',4,1),
    ('womens','FORT WORTH 1',4,1,true, 'Final Four',5,1),

    -- ── WOMENS · SACRAMENTO 2 → Final Four slot 1 bottom ─────────────────────
    ('womens','SACRAMENTO 2',1,1,true, 'SACRAMENTO 2',2,1),
    ('womens','SACRAMENTO 2',1,2,false,'SACRAMENTO 2',2,1),
    ('womens','SACRAMENTO 2',1,3,true, 'SACRAMENTO 2',2,2),
    ('womens','SACRAMENTO 2',1,4,false,'SACRAMENTO 2',2,2),
    ('womens','SACRAMENTO 2',1,5,true, 'SACRAMENTO 2',2,3),
    ('womens','SACRAMENTO 2',1,6,false,'SACRAMENTO 2',2,3),
    ('womens','SACRAMENTO 2',1,7,true, 'SACRAMENTO 2',2,4),
    ('womens','SACRAMENTO 2',1,8,false,'SACRAMENTO 2',2,4),
    ('womens','SACRAMENTO 2',2,1,true, 'SACRAMENTO 2',3,1),
    ('womens','SACRAMENTO 2',2,2,false,'SACRAMENTO 2',3,1),
    ('womens','SACRAMENTO 2',2,3,true, 'SACRAMENTO 2',3,2),
    ('womens','SACRAMENTO 2',2,4,false,'SACRAMENTO 2',3,2),
    ('womens','SACRAMENTO 2',3,1,true, 'SACRAMENTO 2',4,1),
    ('womens','SACRAMENTO 2',3,2,false,'SACRAMENTO 2',4,1),
    ('womens','SACRAMENTO 2',4,1,false,'Final Four',5,1),

    -- ── WOMENS · FORT WORTH 3 → Final Four slot 2 top ────────────────────────
    ('womens','FORT WORTH 3',1,1,true, 'FORT WORTH 3',2,1),
    ('womens','FORT WORTH 3',1,2,false,'FORT WORTH 3',2,1),
    ('womens','FORT WORTH 3',1,3,true, 'FORT WORTH 3',2,2),
    ('womens','FORT WORTH 3',1,4,false,'FORT WORTH 3',2,2),
    ('womens','FORT WORTH 3',1,5,true, 'FORT WORTH 3',2,3),
    ('womens','FORT WORTH 3',1,6,false,'FORT WORTH 3',2,3),
    ('womens','FORT WORTH 3',1,7,true, 'FORT WORTH 3',2,4),
    ('womens','FORT WORTH 3',1,8,false,'FORT WORTH 3',2,4),
    ('womens','FORT WORTH 3',2,1,true, 'FORT WORTH 3',3,1),
    ('womens','FORT WORTH 3',2,2,false,'FORT WORTH 3',3,1),
    ('womens','FORT WORTH 3',2,3,true, 'FORT WORTH 3',3,2),
    ('womens','FORT WORTH 3',2,4,false,'FORT WORTH 3',3,2),
    ('womens','FORT WORTH 3',3,1,true, 'FORT WORTH 3',4,1),
    ('womens','FORT WORTH 3',3,2,false,'FORT WORTH 3',4,1),
    ('womens','FORT WORTH 3',4,1,true, 'Final Four',5,2),

    -- ── WOMENS · SACRAMENTO 4 → Final Four slot 2 bottom ─────────────────────
    ('womens','SACRAMENTO 4',1,1,true, 'SACRAMENTO 4',2,1),
    ('womens','SACRAMENTO 4',1,2,false,'SACRAMENTO 4',2,1),
    ('womens','SACRAMENTO 4',1,3,true, 'SACRAMENTO 4',2,2),
    ('womens','SACRAMENTO 4',1,4,false,'SACRAMENTO 4',2,2),
    ('womens','SACRAMENTO 4',1,5,true, 'SACRAMENTO 4',2,3),
    ('womens','SACRAMENTO 4',1,6,false,'SACRAMENTO 4',2,3),
    ('womens','SACRAMENTO 4',1,7,true, 'SACRAMENTO 4',2,4),
    ('womens','SACRAMENTO 4',1,8,false,'SACRAMENTO 4',2,4),
    ('womens','SACRAMENTO 4',2,1,true, 'SACRAMENTO 4',3,1),
    ('womens','SACRAMENTO 4',2,2,false,'SACRAMENTO 4',3,1),
    ('womens','SACRAMENTO 4',2,3,true, 'SACRAMENTO 4',3,2),
    ('womens','SACRAMENTO 4',2,4,false,'SACRAMENTO 4',3,2),
    ('womens','SACRAMENTO 4',3,1,true, 'SACRAMENTO 4',4,1),
    ('womens','SACRAMENTO 4',3,2,false,'SACRAMENTO 4',4,1),
    ('womens','SACRAMENTO 4',4,1,false,'Final Four',5,2),

    -- ── WOMENS · FINAL FOUR ──────────────────────────────────────────────────
    ('womens','Final Four',5,1,true, 'Final Four',6,1),
    ('womens','Final Four',5,2,false,'Final Four',6,1),
    ('womens','Final Four',6,1,NULL, NULL,NULL,NULL);

  -- ─── Tournaments (additive — reuse existing rows) ────────────────────────

  INSERT INTO public.tournaments (name, sport, gender, season_year, format, status)
  SELECT '2026 DI Men''s Basketball Championship', 'basketball', 'mens', 2025,
         'single_elimination', 'active'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.tournaments
    WHERE sport = 'basketball' AND gender = 'mens' AND season_year = 2025
  );
  SELECT id INTO v_mens_id FROM public.tournaments
  WHERE sport = 'basketball' AND gender = 'mens' AND season_year = 2025;

  INSERT INTO public.tournaments (name, sport, gender, season_year, format, status)
  SELECT '2026 DI Women''s Basketball Championship', 'basketball', 'womens', 2025,
         'single_elimination', 'active'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.tournaments
    WHERE sport = 'basketball' AND gender = 'womens' AND season_year = 2025
  );
  SELECT id INTO v_womens_id FROM public.tournaments
  WHERE sport = 'basketball' AND gender = 'womens' AND season_year = 2025;

  -- ─── Per-gender: clear games, seed regions/rounds/scaffold ───────────────

  FOREACH v_gender IN ARRAY ARRAY['mens', 'womens'] LOOP

    v_t_id := CASE v_gender WHEN 'mens' THEN v_mens_id ELSE v_womens_id END;

    -- Delete all existing game rows for this tournament.
    -- tournament_game_scores cascade-delete automatically (ON DELETE CASCADE).
    -- tournament_teams are NOT touched.
    DELETE FROM public.tournament_games WHERE tournament_id = v_t_id;
    RAISE NOTICE 'Cleared tournament_games for % tournament (%).', v_gender, v_t_id;

    -- ── Regions (additive — create only if name is absent) ───────────────────

    FOR r_reg IN
      SELECT DISTINCT region,
        CASE region
          WHEN 'East'         THEN 1
          WHEN 'FORT WORTH 1' THEN 1
          WHEN 'West'         THEN 2
          WHEN 'SACRAMENTO 2' THEN 2
          WHEN 'South'        THEN 3
          WHEN 'FORT WORTH 3' THEN 3
          WHEN 'Midwest'      THEN 4
          WHEN 'SACRAMENTO 4' THEN 4
          ELSE 5  -- Final Four
        END AS dord
      FROM _sc
      WHERE gender = v_gender
    LOOP
      SELECT id INTO v_region_id
      FROM public.tournament_regions
      WHERE tournament_id = v_t_id AND name = r_reg.region;

      IF v_region_id IS NULL THEN
        INSERT INTO public.tournament_regions (tournament_id, name, display_order)
        VALUES (v_t_id, r_reg.region, r_reg.dord);
      END IF;
    END LOOP;

    -- ── Rounds (additive — create only if round_number is absent) ────────────

    FOR v_round_num IN 1..6 LOOP
      v_round_nm := CASE v_round_num
        WHEN 1 THEN 'First Round'
        WHEN 2 THEN 'Second Round'
        WHEN 3 THEN 'Sweet 16'
        WHEN 4 THEN 'Elite Eight'
        WHEN 5 THEN 'Final Four'
        WHEN 6 THEN 'Championship'
      END;

      SELECT id INTO v_round_id
      FROM public.tournament_rounds
      WHERE tournament_id = v_t_id AND round_number = v_round_num;

      IF v_round_id IS NULL THEN
        INSERT INTO public.tournament_rounds
          (tournament_id, name, round_number, status)
        VALUES (v_t_id, v_round_nm, v_round_num, 'upcoming');
      END IF;
    END LOOP;

    -- ── Games pass 1: insert scaffold rows (next_game_id = NULL) ─────────────

    FOR r_game IN SELECT * FROM _sc WHERE gender = v_gender LOOP

      SELECT id INTO v_region_id
      FROM public.tournament_regions
      WHERE tournament_id = v_t_id AND name = r_game.region;

      SELECT id INTO v_round_id
      FROM public.tournament_rounds
      WHERE tournament_id = v_t_id AND round_number = r_game.round_num;

      INSERT INTO public.tournament_games (
        id,
        tournament_id,
        round_id,
        region_id,
        slot_number,
        fills_top_in_next,
        top_team_id,
        bottom_team_id,
        winner_id,
        loser_id,
        winner_slot,
        top_score,
        bottom_score,
        status,
        next_game_id,
        season_year,
        sport,
        tournament_name
      ) VALUES (
        r_game.gid,
        v_t_id,
        v_round_id,
        v_region_id,
        r_game.slot,
        r_game.fills_top,
        NULL, NULL, NULL, NULL, NULL,
        0, 0, 'scheduled',
        NULL,
        2025,
        'basketball',
        CASE v_gender
          WHEN 'mens' THEN '2026 DI Men''s Basketball Championship'
          ELSE             '2026 DI Women''s Basketball Championship'
        END
      );
    END LOOP;

    -- ── Games pass 2: wire next_game_id ──────────────────────────────────────
    --
    -- Self-join _sc on (gender, next_region, next_round, next_slot) to
    -- find each game's destination UUID, then UPDATE tournament_games.
    -- Championship rows have NULL next_* and are excluded by the WHERE clause.

    FOR r_wire IN
      SELECT src.gid AS src_id, dst.gid AS dst_id
      FROM _sc src
      JOIN _sc dst
        ON  dst.gender    = src.gender
        AND dst.region    = src.next_region
        AND dst.round_num = src.next_round
        AND dst.slot      = src.next_slot
      WHERE src.gender      = v_gender
        AND src.next_region IS NOT NULL
    LOOP
      UPDATE public.tournament_games
      SET next_game_id = r_wire.dst_id::text
      WHERE id = r_wire.src_id;
    END LOOP;

    RAISE NOTICE 'Scaffold seeded for % tournament (%).', v_gender, v_t_id;

  END LOOP; -- gender

END;
$$;
