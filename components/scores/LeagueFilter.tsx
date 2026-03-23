"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LEAGUES } from "@/lib/sports/types";

export function LeagueFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const activeLeague = useSearchParams()?.get("league") ?? "ALL";

  const handleSelect = (league: string) => {
    router.push(`${pathname}?league=${league}`);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={activeLeague === "ALL" ? "default" : "outline"}
        size="sm"
        onClick={() => handleSelect("ALL")}
      >
        All
      </Button>
      {LEAGUES.map((league) => (
        <Button
          key={league.id}
          variant={activeLeague === league.id ? "default" : "outline"}
          size="sm"
          onClick={() => handleSelect(league.id)}
        >
          {league.label}
        </Button>
      ))}
    </div>
  );
}
