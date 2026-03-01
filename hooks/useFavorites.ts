"use client";

import { useState, useEffect, useCallback } from "react";
import type { FavoriteTeam } from "@/lib/sports/types";
import { toast } from "sonner";

export function useFavorites(userId: string) {
  const [favorites, setFavorites] = useState<FavoriteTeam[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/favorites?userId=${userId}`);
      if (!res.ok) throw new Error("Failed to fetch favorites");
      const data = await res.json();
      setFavorites(data);
    } catch {
      toast.error("Could not load favorites.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const addFavorite = useCallback(
    async (team: Omit<FavoriteTeam, "id" | "userId">) => {
      try {
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...team, userId }),
        });
        if (!res.ok) throw new Error();
        const newFav = await res.json();
        setFavorites((prev) => [...prev, newFav]);
        toast.success(`${team.teamName} added to favorites!`);
      } catch {
        toast.error("Could not add favorite.");
      }
    },
    [userId]
  );

  const removeFavorite = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/favorites?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setFavorites((prev) => prev.filter((f) => f.id !== id));
      toast.success("Removed from favorites.");
    } catch {
      toast.error("Could not remove favorite.");
    }
  }, []);

  return { favorites, isLoading, addFavorite, removeFavorite, refetch: fetchFavorites };
}
