"use client";

import { useFavorites } from "@/hooks/useFavorites";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Trash2, Plus } from "lucide-react";
import { LEAGUES } from "@/lib/sports/types";

interface FavoritesClientProps {
  userId: string;
}

export function FavoritesClient({ userId }: FavoritesClientProps) {
  const { favorites, isLoading, removeFavorite } = useFavorites(userId);

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Supported leagues hint */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="h-4 w-4" />
            Add Favorites
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {LEAGUES.map((league) => (
              <Badge
                key={league.id}
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
              >
                {league.label}
              </Badge>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Team favoriting coming soon — you&apos;ll get alerts when your teams score.
          </p>
        </CardContent>
      </Card>

      {/* Current favorites */}
      {favorites.length === 0 ? (
        <div className="rounded-lg border bg-muted/30 p-12 text-center">
          <Star className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-muted-foreground">No favorites yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {favorites.map((fav) => (
            <Card key={fav.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-semibold">{fav.teamName}</p>
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {fav.league}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => removeFavorite(fav.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
