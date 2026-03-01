import { Metadata } from "next";
import { LeagueFilter } from "@/components/scores/LeagueFilter";
import { ScoresClientWrapper } from "@/components/scores/ScoresClientWrapper";

export const metadata: Metadata = { title: "Live Scores" };

export default function ScoresPage({
  searchParams,
}: {
  searchParams: { league?: string };
}) {
  const activeLeague = searchParams.league ?? "ALL";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Live Scores</h1>
        <p className="mt-1 text-muted-foreground">
          Real-time scores across all supported leagues.
        </p>
      </div>
      <LeagueFilter activeLeague={activeLeague} />
      <ScoresClientWrapper activeLeague={activeLeague} />
    </div>
  );
}
