import { Metadata } from "next";
import { OddsClientWrapper } from "@/components/odds/OddsClientWrapper";
import { LeagueFilter } from "@/components/scores/LeagueFilter";

export const metadata: Metadata = { title: "Live Odds" };

export default function OddsPage({
  searchParams,
}: {
  searchParams: { league?: string };
}) {
  const activeLeague = searchParams.league ?? "NFL";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Live Odds</h1>
        <p className="mt-1 text-muted-foreground">
          Current betting lines, spreads, and totals from major sportsbooks.
        </p>
      </div>
      <LeagueFilter activeLeague={activeLeague} />
      <OddsClientWrapper activeLeague={activeLeague} />
    </div>
  );
}
