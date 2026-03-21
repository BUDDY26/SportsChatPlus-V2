"use client";

import type { TournamentGame, TournamentRegion } from "@/lib/sports/types";
import { MatchupNode } from "./MatchupNode";

interface BracketViewProps {
  games: TournamentGame[];
  /** Round number currently selected (1–6) */
  selectedRound: number;
}

export function BracketView({ games, selectedRound }: BracketViewProps) {
  const roundGames = games.filter((g) => g.round === selectedRound);

  if (!roundGames.length) {
    return (
      <div className="rounded-lg border bg-muted/30 p-12 text-center">
        <p className="text-muted-foreground">No games for this round.</p>
      </div>
    );
  }

  // Final Four and Championship span all regions — render flat
  const isFlatRound = selectedRound >= 5;

  if (isFlatRound) {
    return (
      <div className="grid gap-4 overflow-y-auto sm:grid-cols-2">
        {roundGames.map((game) => (
          <MatchupNode key={game.id} game={game} />
        ))}
      </div>
    );
  }

  // Rounds 1–4: group by region in the bracket order
  const regionOrder: TournamentRegion[] = ["East", "West", "South", "Midwest"];
  const regions = regionOrder.filter((r) =>
    roundGames.some((g) => g.region === r),
  );

  return (
    <div className="space-y-8 overflow-y-auto">
      {regions.map((region) => {
        const regionGames = roundGames
          .filter((g) => g.region === region)
          .sort((a, b) => a.slot - b.slot);

        return (
          <section key={region}>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              {region} Region
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
              {regionGames.map((game) => (
                <MatchupNode key={game.id} game={game} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

