"use client";

import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LEAGUES } from "@/lib/sports/types";

interface LeagueFilterProps {
  activeLeague: string;
}

export function LeagueFilter({ activeLeague }: LeagueFilterProps) {
  const router = useRouter();
  const pathname = usePathname();

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
