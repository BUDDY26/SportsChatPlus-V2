"use client";

import { useEffect, useRef, useState } from "react";
import type { TournamentGame, TournamentRound } from "@/lib/sports/types";
import { TOURNAMENT_ROUNDS } from "@/lib/sports/types";
import type { BracketApiResponse } from "@/pages/api/tournament/bracket";
import { createClient } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { BracketView } from "./BracketView";
import { BracketViewFull } from "./BracketViewFull";
import { LiveScoreStrip } from "./LiveScoreStrip";
import { cn } from "@/lib/utils";

export function TournamentClientWrapper() {
  const [games, setGames] = useState<TournamentGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tournamentId, setTournamentId] = useState<string | null>(null);
  const [selectedRound, setSelectedRound] = useState<TournamentRound>(1);
  const [sport, setSport] = useState<"mens" | "womens">("mens");
  const [viewMode, setViewMode] = useState<"round" | "bracket">("round");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    setSelectedRound(1 as TournamentRound);
    setGames([]);
    setIsLoading(true);
    setError(false);
    fetch(`/api/tournament/bracket?sport=${sport}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch");
        return r.json() as Promise<BracketApiResponse>;
      })
      .then((data) => {
        setGames(data.games);
        setTournamentId(data.tournamentId);
        if (data.games.some((g) => g.status === "live")) {
          pollRef.current = setInterval(() => {
            fetch(`/api/tournament/bracket?sport=${sport}`)
              .then((r) => r.ok ? r.json() as Promise<BracketApiResponse> : null)
              .then((d) => { if (d) setGames(d.games); })
              .catch(() => {});
          }, 30_000);
        }
        const liveRound = data.games.find((g) => g.status === "live")?.round;
        if (liveRound) {
          setSelectedRound(liveRound);
        } else {
          const scheduledRounds = data.games
            .filter((g) => g.status === "scheduled")
            .map((g) => g.round);
          if (scheduledRounds.length > 0) {
            setSelectedRound(Math.min(...scheduledRounds) as TournamentRound);
          } else {
            const allRounds = data.games.map((g) => g.round);
            if (allRounds.length > 0) {
              setSelectedRound(Math.max(...allRounds) as TournamentRound);
            }
          }
        }
      })
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));

    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [sport]);

  useEffect(() => {
    if (!tournamentId) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`tournament_games:${tournamentId}:${sport}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "tournament_games",
          filter: `tournament_id=eq.${tournamentId}`,
        },
        (payload) => {
          const row = payload.new as {
            id: string;
            top_score: number;
            bottom_score: number;
            status: TournamentGame["status"];
            winner_id: string | null;
            winner_slot: "top" | "bottom" | null;
          };
          setGames((prev) =>
            prev.map((g) =>
              g.id === row.id
                ? {
                    ...g,
                    topScore: row.top_score,
                    bottomScore: row.bottom_score,
                    status: row.status,
                    winnerId: row.winner_id,
                    winnerSlot: row.winner_slot,
                  }
                : g,
            ),
          );
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [tournamentId, sport]);

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
      {/* Sport toggle */}
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Select Tournament
        </p>
        <div className="flex gap-2">
          {(["mens", "womens"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSport(s)}
              className={cn(
                "rounded-md border px-4 py-2 text-sm font-semibold transition-all",
                sport === s
                  ? "border-primary bg-primary text-primary-foreground shadow"
                  : "border-border bg-background text-foreground hover:border-primary/50 hover:bg-muted",
              )}
            >
              {s === "mens" ? "Men's Basketball" : "Women's Basketball"}
            </button>
          ))}
        </div>
      </div>

      {/* Live strip — only shown when there are live games */}
      <LiveScoreStrip games={games} />

      {/* View mode toggle */}
      <div className="flex items-center gap-2">
        {(["round", "bracket"] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-xs font-semibold transition-all",
              viewMode === mode
                ? "border-primary bg-primary text-primary-foreground shadow"
                : "border-border bg-background text-foreground hover:border-primary/50 hover:bg-muted",
            )}
          >
            {mode === "round" ? "Round View" : "Full Bracket"}
          </button>
        ))}
      </div>

      {viewMode === "round" && (
        <>
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
              <h2 className="font-display text-lg sm:text-2xl font-bold">{currentRoundLabel}</h2>
              {liveCount > 0 && selectedRound === games.find((g) => g.status === "live")?.round && (
                <p className="mt-0.5 text-sm text-sports-green">
                  {liveCount} game{liveCount !== 1 ? "s" : ""} in progress
                </p>
              )}
            </div>
          </div>

          {/* Bracket grid for the selected round */}
          <BracketView games={games} selectedRound={selectedRound} />
        </>
      )}

      {viewMode === "bracket" && <BracketViewFull games={games} />}
    </div>
  );
}
