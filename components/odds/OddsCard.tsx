import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { OddsGame } from "@/lib/sports/types";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface OddsCardProps {
  game: OddsGame;
}

export function OddsCard({ game }: OddsCardProps) {
  const spreadTrend =
    game.spreadMove > 0 ? "up" : game.spreadMove < 0 ? "down" : "flat";

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            {game.league}
          </Badge>
          <span className="text-xs text-muted-foreground">{game.startTime}</span>
        </div>

        {/* Matchup */}
        <div className="mb-4 text-center">
          <p className="font-semibold">
            {game.awayTeam} @ {game.homeTeam}
          </p>
        </div>

        {/* Odds grid */}
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase">Spread</p>
            <p className="font-mono font-semibold">
              {game.homeSpread > 0 ? "+" : ""}
              {game.homeSpread}
            </p>
            <div className="flex justify-center">
              {spreadTrend === "up" ? (
                <TrendingUp className="h-3 w-3 text-sports-green" />
              ) : spreadTrend === "down" ? (
                <TrendingDown className="h-3 w-3 text-sports-red" />
              ) : (
                <Minus className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase">Total</p>
            <p className="font-mono font-semibold">
              O/U {game.total}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase">ML</p>
            <p
              className={cn(
                "font-mono font-semibold",
                game.homeMoneyline > 0 ? "text-sports-green" : "text-muted-foreground"
              )}
            >
              {game.homeMoneyline > 0 ? "+" : ""}
              {game.homeMoneyline}
            </p>
          </div>
        </div>

        {game.book && (
          <p className="mt-3 text-center text-xs text-muted-foreground">
            via {game.book}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
