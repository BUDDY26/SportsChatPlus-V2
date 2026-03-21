import { Card, CardContent } from "@/components/ui/card";
import type { TournamentGame } from "@/lib/sports/types";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import { ArrowRight, Trophy } from "lucide-react";

interface MatchupNodeProps {
  game: TournamentGame;
}

export function MatchupNode({ game }: MatchupNodeProps) {
  const isLive = game.status === "live";
  const isFinal = game.status === "final";
  const isScheduled = game.status === "scheduled";
  const showScores = isLive || isFinal;

  return (
    <Card
      className={cn(
        "card-float transition-all hover:shadow-md",
        isLive && "border-sports-green/50 shadow-sm shadow-sports-green/10",
      )}
    >
      <CardContent className="p-4">
        {/* Header: region label + status */}
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {game.region} · Game {game.slot}
          </span>
          <StatusBadge status={game.status} />
        </div>

        {/* Teams */}
        <div className="space-y-2">
          <TeamRow
            teamName={game.topTeamName}
            seed={game.topTeamSeed}
            score={game.topScore}
            isWinner={game.winnerSlot === "top"}
            isLoser={isFinal && game.winnerSlot === "bottom"}
            showScore={showScores}
            isTbd={game.topTeamId === null}
          />
          <div className="border-t border-dashed" />
          <TeamRow
            teamName={game.bottomTeamName}
            seed={game.bottomTeamSeed}
            score={game.bottomScore}
            isWinner={game.winnerSlot === "bottom"}
            isLoser={isFinal && game.winnerSlot === "top"}
            showScore={showScores}
            isTbd={game.bottomTeamId === null}
          />
        </div>

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between gap-2">
          {isScheduled && (
            <span className="text-xs text-muted-foreground">
              {game.scheduledTime}
            </span>
          )}
          {isFinal && game.nextMatchupId && (
            <span className="flex items-center gap-1 text-xs font-medium text-sports-green">
              <ArrowRight className="h-3 w-3" />
              Advances to next round
            </span>
          )}
          {isFinal && !game.nextMatchupId && (
            <span className="flex items-center gap-1 text-xs font-medium text-amber-500">
              <Trophy className="h-3 w-3" />
              Tournament Champion
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function TeamRow({
  teamName,
  seed,
  score,
  isWinner,
  isLoser,
  showScore,
  isTbd,
}: {
  teamName: string;
  seed: number | null;
  score: number;
  isWinner: boolean;
  isLoser: boolean;
  showScore: boolean;
  isTbd: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        {/* Seed badge */}
        {seed !== null && !isTbd ? (
          <span
            className={cn(
              "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded text-xs font-bold",
              isWinner
                ? "bg-sports-green/20 text-sports-green"
                : "bg-muted text-muted-foreground",
            )}
          >
            {seed}
          </span>
        ) : (
          <span className="h-5 w-5 flex-shrink-0" />
        )}

        {/* Team name */}
        <span
          className={cn(
            "truncate text-sm",
            isTbd && "italic text-muted-foreground",
            isWinner && "font-bold text-foreground",
            isLoser && "text-muted-foreground line-through decoration-1",
            !isWinner && !isLoser && !isTbd && "font-medium text-foreground",
          )}
        >
          {teamName}
        </span>

        {/* Winner check */}
        {isWinner && (
          <Trophy className="h-3.5 w-3.5 flex-shrink-0 text-amber-500" />
        )}
      </div>

      {/* Score */}
      {showScore && !isTbd && (
        <span
          className={cn(
            "flex-shrink-0 text-2xl font-bold tabular-nums",
            isWinner ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {score}
        </span>
      )}
    </div>
  );
}
