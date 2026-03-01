"use client";

import { useState, useEffect, useCallback } from "react";
import type { GameScore } from "@/lib/sports/types";

const REFRESH_INTERVAL = 30_000; // 30 seconds

export function useScores(league: string = "ALL") {
  const [scores, setScores] = useState<GameScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchScores = useCallback(async () => {
    try {
      const url =
        league === "ALL"
          ? "/api/scores/live"
          : `/api/scores/by-league?league=${league}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch scores");
      const data = await res.json();
      setScores(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [league]);

  useEffect(() => {
    fetchScores();
    const interval = setInterval(fetchScores, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchScores]);

  return { scores, isLoading, error, refetch: fetchScores };
}
