"use client";

import type { TournamentGame } from "@/lib/sports/types";
import { StatusBadge } from "./StatusBadge";
import { cn } from "@/lib/utils";

interface ScheduleListProps {
  games: TournamentGame[];
}

export function ScheduleList({ games }: ScheduleListProps) {
  const upcoming = games
    .filter((g) => g.status === "scheduled" && g.topTeamId !== null && g.bottomTeamId !== null)
    .sort((a, b) => a.round - b.round || a.slot - b.slot);

  if (!upcoming.length) {
    return (
      <div className="rounded-lg border bg-muted/30 p-8 text-center">
        <p className="text-muted-foreground">No upcoming games to display.</p>
      </div>
    );
  }

  return (
    <div className="divide-y rounded-lg border">
      {upcoming.map((game) => (
        <div
          key={game.id}
          className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-muted/30"
        >
          {/* Left: round + region */}
          <div className="min-w-[120px]">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {game.roundLabel}
            </p>
            <p className="text-xs text-muted-foreground">{game.region}</p>
          </div>

          {/* Center: matchup */}
          <div className="flex flex-1 items-center justify-center gap-2 text-sm">
            <TeamChip name={game.topTeamName} seed={game.topTeamSeed} />
            <span className="text-xs font-semibold text-muted-foreground">vs</span>
            <TeamChip name={game.bottomTeamName} seed={game.bottomTeamSeed} />
          </div>

          {/* Right: time + status */}
          <div className="flex flex-shrink-0 flex-col items-end gap-1">
            <StatusBadge status={game.status} />
            <span className="text-xs text-muted-foreground">{game.scheduledTime}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function TeamChip({
  name,
  seed,
}: {
  name: string;
  seed: number | null;
}) {
  return (
    <span className="flex items-center gap-1">
      {seed !== null && (
        <span className="flex h-4 w-4 items-center justify-center rounded bg-muted text-[10px] font-bold text-muted-foreground">
          {seed}
        </span>
      )}
      <span className={cn("text-sm font-medium", name === "TBD" && "italic text-muted-foreground")}>
        {name}
      </span>
    </span>
  );
}
