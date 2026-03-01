import { Metadata } from "next";
import { InsightsPanel } from "@/components/ai/InsightsPanel";
import { AIChatBox } from "@/components/ai/AIChatBox";

export const metadata: Metadata = { title: "AI Insights" };

export default function AIInsightsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">AI Insights</h1>
        <p className="mt-1 text-muted-foreground">
          GPT-powered sports analysis, predictions, and answers to your questions.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <InsightsPanel />
        <AIChatBox />
      </div>
    </div>
  );
}
