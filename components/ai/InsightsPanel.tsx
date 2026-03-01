"use client";

import { useAIInsights } from "@/hooks/useAIInsights";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain, TrendingUp, AlertCircle } from "lucide-react";

export function InsightsPanel() {
  const { insights, isLoading, error } = useAIInsights();

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))
        ) : error ? (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            Failed to load insights.
          </div>
        ) : (
          insights.map((insight, i) => (
            <div key={i} className="rounded-lg border bg-muted/30 p-4">
              <div className="mb-2 flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  {insight.league}
                </Badge>
                <TrendingUp className="h-3 w-3 text-muted-foreground" />
              </div>
              <p className="text-sm leading-relaxed">{insight.text}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
