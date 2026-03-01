"use client";

import { useEffect, useState } from "react";
import { OddsCard } from "./OddsCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { OddsGame } from "@/lib/sports/types";

interface OddsClientWrapperProps {
  activeLeague: string;
}

export function OddsClientWrapper({ activeLeague }: OddsClientWrapperProps) {
  const [odds, setOdds] = useState<OddsGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setError(false);
    fetch(`/api/odds/by-game?league=${activeLeague}`)
      .then((r) => r.json())
      .then(setOdds)
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, [activeLeague]);

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-center text-sm text-destructive">
        Failed to load odds. Please try again.
      </p>
    );
  }

  if (!odds.length) {
    return (
      <p className="text-center text-muted-foreground">
        No odds available right now.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {odds.map((game) => (
        <OddsCard key={game.id} game={game} />
      ))}
    </div>
  );
}
