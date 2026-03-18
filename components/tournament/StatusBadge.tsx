import { Badge } from "@/components/ui/badge";
import type { GameStatus } from "@/lib/sports/types";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: GameStatus;
  period?: string;
  className?: string;
}

export function StatusBadge({ status, period, className }: StatusBadgeProps) {
  if (status === "live") {
    return (
      <Badge
        variant="live"
        className={cn("flex items-center gap-1 font-semibold", className)}
      >
        <span className="live-dot h-1.5 w-1.5" />
        {period ? `LIVE · ${period}` : "LIVE"}
      </Badge>
    );
  }

  if (status === "final") {
    return (
      <Badge variant="secondary" className={cn("font-semibold", className)}>
        Final
      </Badge>
    );
  }

  if (status === "postponed") {
    return (
      <Badge variant="outline" className={cn("text-muted-foreground", className)}>
        Postponed
      </Badge>
    );
  }

  // scheduled
  return (
    <Badge variant="outline" className={cn("text-muted-foreground", className)}>
      Upcoming
    </Badge>
  );
}
