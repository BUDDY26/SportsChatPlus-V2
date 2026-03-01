import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  MessageSquare,
  Brain,
  TrendingUp,
  Zap,
  Shield,
} from "lucide-react";

const features = [
  {
    icon: Trophy,
    title: "Live Scores",
    description:
      "Real-time scores across NFL, NBA, MLB, NCAAF, NCAAB, and more. Never miss a play.",
  },
  {
    icon: MessageSquare,
    title: "Community Chat",
    description:
      "Talk live with other fans during games. React, debate, and celebrate together.",
  },
  {
    icon: Brain,
    title: "AI Insights",
    description:
      "GPT-powered game analysis, player breakdowns, and predictive commentary.",
  },
  {
    icon: TrendingUp,
    title: "Betting Odds",
    description:
      "Live lines and spreads from major books. Make informed decisions with AI context.",
  },
  {
    icon: Zap,
    title: "Instant Alerts",
    description:
      "Get notified the moment your favorite teams score or when lines move.",
  },
  {
    icon: Shield,
    title: "Multi-League",
    description:
      "NFL, NBA, MLB, NCAAF, NCAAB Men & Women, NCAA Baseball & Softball covered.",
  },
];

const leagues = ["NFL", "NBA", "MLB", "NCAAF", "NCAAB Men", "NCAAB Women", "NCAA Baseball", "NCAA Softball"];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <Badge variant="secondary" className="mb-4">
          Now in Beta
        </Badge>
        <h1 className="font-display text-5xl font-bold tracking-tight sm:text-7xl">
          Sports Intelligence{" "}
          <span className="text-primary">Supercharged</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Real-time scores, AI-powered insights, community chat, and live odds
          — all in one fast, beautiful dashboard.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/signup">Get Started Free</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>

        {/* League badges */}
        <div className="mt-12 flex flex-wrap justify-center gap-2">
          {leagues.map((league) => (
            <Badge key={league} variant="outline" className="text-xs">
              {league}
            </Badge>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/30 px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center font-display text-3xl font-bold sm:text-4xl">
            Everything You Need
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <feature.icon className="mb-4 h-8 w-8 text-primary" />
                <h3 className="mb-2 font-display text-lg font-semibold">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20 text-center">
        <h2 className="font-display text-3xl font-bold sm:text-4xl">
          Ready to Level Up?
        </h2>
        <p className="mt-4 text-muted-foreground">
          Join thousands of fans on SportsChatPlus.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/signup">Create Free Account</Link>
        </Button>
      </section>

      <Footer />
    </div>
  );
}
