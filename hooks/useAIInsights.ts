"use client";

import { useState, useEffect } from "react";
import type { AIInsight } from "@/lib/sports/types";

export function useAIInsights() {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/ai/insights")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load insights");
        return r.json();
      })
      .then(setInsights)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  return { insights, isLoading, error };
}
