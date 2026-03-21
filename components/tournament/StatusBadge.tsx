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
      <span className={cn("text-xs font-medium text-on-surface-variant/60", className)}>
        Final
      </span>
    );
  }

  if (status === "postponed") {
    return (
      <span className={cn("text-xs font-medium text-on-surface-variant/40", className)}>
        Postponed
      </span>
    );
  }

  // scheduled
  return (
    <span className={cn("text-xs font-medium text-on-surface-variant/50", className)}>
      Upcoming
    </span>
  );
}
