"use client";

import { useScores } from "@/hooks/useScores";
import { Badge } from "@/components/ui/badge";

export function LiveStatusBar() {
  const { scores, isLoading } = useScores("ALL");
  const liveCount = scores.filter((g) => g.status === "live").length;

  return (
    <div className="flex items-center gap-2">
      <span
        className={
          liveCount > 0
            ? "live-dot"
            : "h-2 w-2 rounded-full bg-muted-foreground/40"
        }
      />
      <span className="text-sm font-medium">
        {isLoading
          ? "Checking live games…"
          : liveCount > 0
          ? `${liveCount} live game${liveCount === 1 ? "" : "s"} in progress`
          : "No live games right now"}
      </span>
      <Badge variant="secondary" className="ml-auto">
        {isLoading ? "Loading" : "Live"}
      </Badge>
    </div>
  );
}
