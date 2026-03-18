"use client";

import { useEffect, useState } from "react";
import type { TournamentGame, TournamentRound } from "@/lib/sports/types";
import { TOURNAMENT_ROUNDS } from "@/lib/sports/types";
import type { BracketApiResponse } from "@/pages/api/tournament/bracket";
import { Skeleton } from "@/components/ui/skeleton";
import { BracketView } from "./BracketView";
import { LiveScoreStrip } from "./LiveScoreStrip";
import { cn } from "@/lib/utils";

export function TournamentClientWrapper() {
  const [games, setGames] = useState<TournamentGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedRound, setSelectedRound] = useState<TournamentRound>(1);

  useEffect(() => {
    setIsLoading(true);
    setError(false);
    fetch("/api/tournament/bracket")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch");
        return r.json() as Promise<BracketApiResponse>;
      })
      .then((data) => {
        setGames(data.games);
        // Auto-select the earliest round that has live or upcoming games
        const liveRound = data.games.find((g) => g.status === "live")?.round;
        if (liveRound) setSelectedRound(liveRound);
      })
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          {TOURNAMENT_ROUNDS.map((r) => (
            <Skeleton key={r.round} className="h-9 w-28 rounded-md" />
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center">
        <p className="text-sm text-destructive">
          Unable to load bracket data. Please try again later.
        </p>
      </div>
    );
  }

  const currentRoundLabel =
    TOURNAMENT_ROUNDS.find((r) => r.round === selectedRound)?.label ?? "Round";

  const liveCount = games.filter((g) => g.status === "live").length;

  return (
    <div className="space-y-6">
      {/* Live strip — only shown when there are live games */}
      <LiveScoreStrip games={games} />

      {/* Round selector */}
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Select Round
        </p>
        <div className="flex flex-wrap gap-2">
          {TOURNAMENT_ROUNDS.map(({ round, label }) => {
            const hasLive = games.some(
              (g) => g.round === round && g.status === "live",
            );
            return (
              <button
                key={round}
                onClick={() => setSelectedRound(round as TournamentRound)}
                className={cn(
                  "relative rounded-md border px-4 py-2 text-sm font-semibold transition-all",
                  selectedRound === round
                    ? "border-primary bg-primary text-primary-foreground shadow"
                    : "border-border bg-background text-foreground hover:border-primary/50 hover:bg-muted",
                )}
              >
                {label}
                {hasLive && (
                  <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-sports-green ring-2 ring-background" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Current round heading */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold">{currentRoundLabel}</h2>
          {liveCount > 0 && selectedRound === games.find((g) => g.status === "live")?.round && (
            <p className="mt-0.5 text-sm text-sports-green">
              {liveCount} game{liveCount !== 1 ? "s" : ""} in progress
            </p>
          )}
        </div>
      </div>

      {/* Bracket grid for the selected round */}
      <BracketView games={games} selectedRound={selectedRound} />
    </div>
  );
}
