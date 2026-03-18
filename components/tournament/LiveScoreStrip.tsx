"use client";

import type { TournamentGame } from "@/lib/sports/types";
import { cn } from "@/lib/utils";

interface LiveScoreStripProps {
  games: TournamentGame[];
}

export function LiveScoreStrip({ games }: LiveScoreStripProps) {
  const liveGames = games.filter((g) => g.status === "live");

  if (!liveGames.length) return null;

  return (
    <div className="rounded-lg border border-sports-green/30 bg-sports-green/5 p-3">
      <div className="mb-2 flex items-center gap-2">
        <span className="live-dot h-2 w-2" />
        <span className="text-xs font-semibold uppercase tracking-widest text-sports-green">
          Games in Progress
        </span>
      </div>
      <div className="flex flex-wrap gap-3">
        {liveGames.map((game) => (
          <LiveChip key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
}

function LiveChip({ game }: { game: TournamentGame }) {
  const topLeading =
    game.topScore > game.bottomScore
      ? "top"
      : game.bottomScore > game.topScore
        ? "bottom"
        : null;

  return (
    <div className="flex items-center gap-2 rounded-md border border-sports-green/20 bg-background px-3 py-2 text-sm shadow-sm">
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          <SeedTag seed={game.topTeamSeed} />
          <span
            className={cn(
              "font-medium",
              topLeading === "top" ? "font-bold text-foreground" : "text-muted-foreground",
            )}
          >
            {game.topTeamName}
          </span>
          <span
            className={cn(
              "ml-auto pl-4 font-bold tabular-nums",
              topLeading === "top" ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {game.topScore}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <SeedTag seed={game.bottomTeamSeed} />
          <span
            className={cn(
              "font-medium",
              topLeading === "bottom" ? "font-bold text-foreground" : "text-muted-foreground",
            )}
          >
            {game.bottomTeamName}
          </span>
          <span
            className={cn(
              "ml-auto pl-4 font-bold tabular-nums",
              topLeading === "bottom" ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {game.bottomScore}
          </span>
        </div>
      </div>
    </div>
  );
}

function SeedTag({ seed }: { seed: number | null }) {
  if (seed === null) return <span className="h-4 w-4" />;
  return (
    <span className="flex h-4 w-4 items-center justify-center rounded bg-muted text-[10px] font-bold text-muted-foreground">
      {seed}
    </span>
  );
}
