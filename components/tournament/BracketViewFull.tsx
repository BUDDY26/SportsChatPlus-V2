"use client";

import React from "react";
import type { TournamentGame } from "@/lib/sports/types";
import { cn } from "@/lib/utils";
import { Trophy } from "lucide-react";

interface BracketViewFullProps {
  games: TournamentGame[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SLOT_H = 80;  // px per R1 game slot
const CARD_W = 180; // card width in px
const CARD_H = 52;  // approx card height in px
const GAP_W = 32;   // horizontal gap between rounds (connector zone)
const ARM_W = 4 * CARD_W + 3 * GAP_W; // 816px per region arm

// ── TeamLine ──────────────────────────────────────────────────────────────────

function TeamLine({
  name,
  seed,
  score,
  isWinner,
  isLoser,
  isTbd,
  showScore,
  alignRight,
}: {
  name: string;
  seed: number | null;
  score: number;
  isWinner: boolean;
  isLoser: boolean;
  isTbd: boolean;
  showScore: boolean;
  alignRight?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-1", alignRight && "flex-row-reverse")}>
      {seed !== null && !isTbd ? (
        <span
          className={cn(
            "flex h-4 w-4 flex-shrink-0 items-center justify-center rounded text-[9px] font-bold",
            isWinner
              ? "bg-sports-green/20 text-sports-green"
              : "bg-muted text-muted-foreground",
          )}
        >
          {seed}
        </span>
      ) : (
        <span className="h-4 w-4 flex-shrink-0" />
      )}
      <span
        className={cn(
          "flex-1 truncate text-xs leading-tight",
          isTbd && "italic text-muted-foreground",
          isWinner && "font-bold text-foreground",
          isLoser && "text-muted-foreground/60 line-through decoration-1",
          !isWinner && !isLoser && !isTbd && "text-foreground/80",
        )}
      >
        {name}
      </span>
      {showScore && !isTbd && (
        <span
          className={cn(
            "flex-shrink-0 text-xs font-bold tabular-nums",
            isWinner ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {score}
        </span>
      )}
    </div>
  );
}

// ── MiniMatchup ───────────────────────────────────────────────────────────────

function MiniMatchup({
  game,
  alignRight,
}: {
  game: TournamentGame;
  alignRight?: boolean;
}) {
  const isFinal = game.status === "final";
  const isLive = game.status === "live";
  const showScore = isFinal || isLive;

  return (
    <div
      className={cn(
        "card-float rounded border px-1.5 py-1",
        isLive && "border-sports-green/40",
        !isLive && "border-white/10",
      )}
    >
      <TeamLine
        name={game.topTeamName}
        seed={game.topTeamSeed}
        score={game.topScore}
        isWinner={game.winnerSlot === "top"}
        isLoser={isFinal && game.winnerSlot === "bottom"}
        isTbd={game.topTeamId === null}
        showScore={showScore}
        alignRight={alignRight}
      />
      <div className="my-0.5 border-t border-dashed border-border/30" />
      <TeamLine
        name={game.bottomTeamName}
        seed={game.bottomTeamSeed}
        score={game.bottomScore}
        isWinner={game.winnerSlot === "bottom"}
        isLoser={isFinal && game.winnerSlot === "top"}
        isTbd={game.bottomTeamId === null}
        showScore={showScore}
        alignRight={alignRight}
      />
    </div>
  );
}

// ── EmptySlot ─────────────────────────────────────────────────────────────────

function EmptySlot() {
  return (
    <div className="card-float rounded border border-white/10 px-1.5 py-1" style={{ width: CARD_W }}>
      <div className="flex items-center gap-1 py-0.5">
        <span className="h-4 w-4 flex-shrink-0 rounded bg-white/5" />
        <span className="text-xs italic text-foreground/30">TBD</span>
      </div>
      <div className="my-0.5 border-t border-dashed border-border/20" />
      <div className="flex items-center gap-1 py-0.5">
        <span className="h-4 w-4 flex-shrink-0 rounded bg-white/5" />
        <span className="text-xs italic text-foreground/30">TBD</span>
      </div>
    </div>
  );
}

// ── BracketArm ────────────────────────────────────────────────────────────────
//
// Left arm (flip=false): R1 at x=0 (leftmost) → R4 at x=3*(CARD_W+GAP_W) (rightmost)
// Right arm (flip=true): R1 at x=3*(CARD_W+GAP_W) (rightmost) → R4 at x=0 (leftmost)
// Connector lines bridge each game to its next-round successor.

const SLOTS_PER_ROUND: Record<number, number> = { 1: 8, 2: 4, 3: 2, 4: 1 };

function BracketArm({
  regionGames,
  flip,
}: {
  regionGames: TournamentGame[];
  flip?: boolean;
}) {
  const centerY = (round: number, idx: number) => {
    const slotsPerGame = Math.pow(2, round - 1);
    return (idx * slotsPerGame + slotsPerGame / 2) * SLOT_H;
  };

  const colX = (round: number) => {
    const col = flip ? 4 - round : round - 1;
    return col * (CARD_W + GAP_W);
  };

  return (
    <div className="relative flex-shrink-0" style={{ width: ARM_W, height: 8 * SLOT_H }}>
      {[1, 2, 3, 4].flatMap((round) => {
        const roundGames = regionGames
          .filter((g) => g.round === round)
          .sort((a, b) => a.slot - b.slot);
        const x = colX(round);
        const hasConnector = round < 4;
        const slotCount = SLOTS_PER_ROUND[round] ?? 1;

        return Array.from({ length: slotCount }, (_, idx) => {
          const game = roundGames.find((g) => g.slot === idx + 1) ?? null;
          const cy = centerY(round, idx);
          const isPairTop = idx % 2 === 0;
          const partnerCy = hasConnector
            ? centerY(round, isPairTop ? idx + 1 : idx - 1)
            : 0;
          const nextCy = hasConnector
            ? centerY(round + 1, Math.floor(idx / 2))
            : 0;
          const vTop = Math.min(cy, partnerCy);
          const vBot = Math.max(cy, partnerCy);
          const key = game ? game.id : `placeholder-r${round}-s${idx + 1}`;

          return (
            <React.Fragment key={key}>
              {/* Game card or placeholder */}
              <div
                className="absolute"
                style={{ left: x, top: cy - CARD_H / 2, width: CARD_W }}
              >
                {game ? <MiniMatchup game={game} alignRight={flip} /> : <EmptySlot />}
              </div>

              {/* Left-arm connectors (right-going) */}
              {hasConnector && !flip && (
                <>
                  <div
                    className="absolute border-t border-white/25"
                    style={{ left: x + CARD_W, top: cy, width: GAP_W / 2 }}
                  />
                  {isPairTop && (
                    <>
                      <div
                        className="absolute border-l border-white/25"
                        style={{
                          left: x + CARD_W + GAP_W / 2,
                          top: vTop,
                          height: vBot - vTop,
                        }}
                      />
                      <div
                        className="absolute border-t border-white/25"
                        style={{
                          left: x + CARD_W + GAP_W / 2,
                          top: nextCy,
                          width: GAP_W / 2,
                        }}
                      />
                    </>
                  )}
                </>
              )}

              {/* Right-arm connectors (left-going) */}
              {hasConnector && flip && (
                <>
                  <div
                    className="absolute border-t border-white/25"
                    style={{ left: x - GAP_W / 2, top: cy, width: GAP_W / 2 }}
                  />
                  {isPairTop && (
                    <>
                      <div
                        className="absolute border-l border-white/25"
                        style={{
                          left: x - GAP_W / 2,
                          top: vTop,
                          height: vBot - vTop,
                        }}
                      />
                      <div
                        className="absolute border-t border-white/25"
                        style={{
                          left: x - GAP_W,
                          top: nextCy,
                          width: GAP_W / 2,
                        }}
                      />
                    </>
                  )}
                </>
              )}
            </React.Fragment>
          );
        });
      })}
    </div>
  );
}

// ── BracketCenter ─────────────────────────────────────────────────────────────

function BracketCenter({ games }: { games: TournamentGame[] }) {
  const ff = games.filter((g) => g.round === 5).sort((a, b) => a.slot - b.slot);
  const champ = games.filter((g) => g.round === 6);

  return (
    <div
      className="flex flex-shrink-0 flex-col items-center justify-center gap-4 px-3"
      style={{ width: CARD_W + 24 }}
    >
      <div className="w-full">
        <p className="mb-2 text-center text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
          Final Four
        </p>
        <div className="space-y-3">
          {[0, 1].map((idx) => {
            const game = ff[idx] ?? null;
            return game
              ? <MiniMatchup key={game.id} game={game} />
              : <EmptySlot key={`ff-${idx}`} />;
          })}
        </div>
      </div>

      <div className="h-px w-full bg-border/30" />

      <div className="w-full">
        <p className="mb-2 flex items-center justify-center gap-1 text-[9px] font-bold uppercase tracking-widest text-amber-500">
          <Trophy className="h-3 w-3" />
          Championship
        </p>
        {champ.length > 0
          ? champ.map((g) => <MiniMatchup key={g.id} game={g} />)
          : <EmptySlot key="champ-placeholder" />
        }
      </div>
    </div>
  );
}

// ── BracketViewFull ───────────────────────────────────────────────────────────
//
// Layout: [left arm: regions[0] top + regions[1] bottom] [center] [right arm: regions[2] top + regions[3] bottom]
// Regions are sorted alphabetically then split 2/2. Left arm reads left→right; right arm reads right→left.

export function BracketViewFull({ games }: BracketViewFullProps) {
  const regions = [
    ...new Set(
      games
        .filter((g) => g.region !== null && g.round <= 4)
        .map((g) => g.region as string),
    ),
  ].sort();

  if (regions.length === 0) {
    return (
      <div className="rounded-lg border bg-muted/30 p-12 text-center">
        <p className="text-muted-foreground">No bracket data available.</p>
      </div>
    );
  }

  const leftRegions = regions.slice(0, 2);
  const rightRegions = regions.slice(2, 4);

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex min-w-max items-center gap-0">
        {/* Left arm */}
        <div className="space-y-4">
          <div className="flex" style={{ width: ARM_W }}>
            {["FIRST ROUND", "SECOND ROUND", "SWEET 16", "ELITE EIGHT"].map((label) => (
              <div
                key={label}
                className="text-[9px] font-bold uppercase tracking-widest text-foreground/50 text-center"
                style={{ width: CARD_W, flexShrink: 0 }}
              >
                {label}
              </div>
            ))}
          </div>
          {leftRegions.map((region) => (
            <div key={region}>
              <p className="mb-1.5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                {region}
              </p>
              <BracketArm
                regionGames={games.filter((g) => g.region === region)}
                flip={false}
              />
            </div>
          ))}
        </div>

        {/* Center: Final Four + Championship */}
        <BracketCenter games={games} />

        {/* Right arm */}
        <div className="space-y-4">
          <div className="flex" style={{ width: ARM_W }}>
            {["ELITE EIGHT", "SWEET 16", "SECOND ROUND", "FIRST ROUND"].map((label) => (
              <div
                key={label}
                className="text-[9px] font-bold uppercase tracking-widest text-foreground/50 text-center"
                style={{ width: CARD_W, flexShrink: 0 }}
              >
                {label}
              </div>
            ))}
          </div>
          {rightRegions.map((region) => (
            <div key={region}>
              <p className="mb-1.5 text-right text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                {region}
              </p>
              <BracketArm
                regionGames={games.filter((g) => g.region === region)}
                flip={true}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
