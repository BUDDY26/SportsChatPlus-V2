"use client";

import { useState } from "react";
import { useFavorites } from "@/hooks/useFavorites";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Trash2, Plus } from "lucide-react";
import { LEAGUES, type LeagueId } from "@/lib/sports/types";
import { cn } from "@/lib/utils";

interface FavoritesClientProps {
  userId: string;
}

export function FavoritesClient({ userId }: FavoritesClientProps) {
  const { favorites, isLoading, addFavorite, removeFavorite } = useFavorites(userId);
  const [selectedLeague, setSelectedLeague] = useState<LeagueId | null>(null);
  const [teamName, setTeamName] = useState("");

  const handleAdd = async () => {
    if (!selectedLeague || !teamName.trim()) return;
    await addFavorite({ teamName: teamName.trim(), league: selectedLeague });
    setTeamName("");
    setSelectedLeague(null);
  };

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
      {/* Add favorites */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="h-4 w-4" />
            Add Favorites
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {LEAGUES.map((league) => (
              <Badge
                key={league.id}
                variant={selectedLeague === league.id ? "default" : "outline"}
                className={cn(
                  "cursor-pointer",
                  selectedLeague !== league.id &&
                    "hover:bg-primary hover:text-primary-foreground"
                )}
                onClick={() =>
                  setSelectedLeague((prev) =>
                    prev === league.id ? null : league.id
                  )
                }
              >
                {league.label}
              </Badge>
            ))}
          </div>
          {selectedLeague && (
            <div className="flex gap-2">
              <Input
                placeholder="Team name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAdd();
                  }
                }}
                className="flex-1"
              />
              <Button onClick={handleAdd} disabled={!teamName.trim()}>
                Add
              </Button>
            </div>
          )}
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
