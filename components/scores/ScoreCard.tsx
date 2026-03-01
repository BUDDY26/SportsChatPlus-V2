import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { GameScore } from "@/lib/sports/types";
import { cn } from "@/lib/utils";

interface ScoreCardProps {
  game: GameScore;
}

export function ScoreCard({ game }: ScoreCardProps) {
  const isLive = game.status === "live";
  const isFinal = game.status === "final";

  return (
    <Card className={cn("transition-all hover:shadow-md", isLive && "border-sports-green/50")}>
      <CardContent className="p-4">
        {/* Header: League + Status */}
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase">
            {game.league}
          </span>
          {isLive ? (
            <Badge variant="live" className="flex items-center gap-1">
              <span className="live-dot h-1.5 w-1.5" />
              LIVE · {game.period}
            </Badge>
          ) : isFinal ? (
            <Badge variant="secondary">Final</Badge>
          ) : (
            <Badge variant="outline">{game.startTime}</Badge>
          )}
        </div>

        {/* Teams + Scores */}
        <div className="space-y-2">
          <TeamRow
            name={game.awayTeam}
            score={game.awayScore}
            isWinning={game.awayScore > game.homeScore}
            isFinal={isFinal}
          />
          <TeamRow
            name={game.homeTeam}
            score={game.homeScore}
            isWinning={game.homeScore > game.awayScore}
            isFinal={isFinal}
          />
        </div>

        {/* Footer */}
        {game.venue && (
          <p className="mt-3 text-xs text-muted-foreground">{game.venue}</p>
        )}
      </CardContent>
    </Card>
  );
}

function TeamRow({
  name,
  score,
  isWinning,
  isFinal,
}: {
  name: string;
  score: number;
  isWinning: boolean;
  isFinal: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className={cn(
          "text-sm font-medium",
          isFinal && isWinning && "font-bold text-foreground",
          (!isFinal || !isWinning) && "text-muted-foreground"
        )}
      >
        {name}
      </span>
      <span
        className={cn(
          "text-xl font-bold tabular-nums",
          isFinal && isWinning ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {score}
      </span>
    </div>
  );
}
