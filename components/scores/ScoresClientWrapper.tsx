"use client";

import { useScores } from "@/hooks/useScores";
import { ScoreCard } from "@/components/scores/ScoreCard";
import { Skeleton } from "@/components/ui/skeleton";

interface ScoresClientWrapperProps {
  activeLeague: string;
}

export function ScoresClientWrapper({ activeLeague }: ScoresClientWrapperProps) {
  const { scores, isLoading, error } = useScores(activeLeague);

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
        <p className="text-sm text-destructive">
          Failed to load scores. Please try again.
        </p>
      </div>
    );
  }

  if (!scores?.length) {
    return (
      <div className="rounded-lg border bg-muted/30 p-12 text-center">
        <p className="text-muted-foreground">No games scheduled right now.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {scores.map((game) => (
        <ScoreCard key={game.id} game={game} />
      ))}
    </div>
  );
}
