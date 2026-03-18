import { Metadata } from "next";
import { TournamentClientWrapper } from "@/components/tournament/TournamentClientWrapper";

export const metadata: Metadata = { title: "Tournament Center" };

export default function TournamentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Tournament Center</h1>
        <p className="mt-1 text-muted-foreground">
          NCAA Men&apos;s Basketball Tournament — bracket, scores, and results.
        </p>
      </div>
      <TournamentClientWrapper />
    </div>
  );
}
