import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, MessageSquare, Star, TrendingUp, Brain } from "lucide-react";
import Link from "next/link";
import { LEAGUES } from "@/lib/sports/types";
import { LiveStatusBar } from "@/components/dashboard/LiveStatusBar";

export const metadata: Metadata = { title: "Dashboard" };

const quickLinks = [
  {
    href: "/dashboard/scores",
    icon: Trophy,
    label: "Live Scores",
    description: "See what's happening now",
    color: "text-sports-green",
  },
  {
    href: "/dashboard/chat",
    icon: MessageSquare,
    label: "Community Chat",
    description: "Talk with other fans",
    color: "text-sports-blue",
  },
  {
    href: "/dashboard/favorites",
    icon: Star,
    label: "My Teams",
    description: "Your favorite teams & alerts",
    color: "text-sports-gold",
  },
  {
    href: "/dashboard/odds",
    icon: TrendingUp,
    label: "Live Odds",
    description: "Lines and spreads",
    color: "text-sports-red",
  },
  {
    href: "/dashboard/ai-insights",
    icon: Brain,
    label: "AI Insights",
    description: "GPT-powered analysis",
    color: "text-primary",
  },
];

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const name = session?.user?.name?.split(" ")[0] ?? "Fan";

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="rounded-lg bg-card/80 backdrop-blur-sm px-5 py-4">
        <h1 className="font-display text-3xl font-bold">
          Welcome back, {name}!
        </h1>
        <p className="mt-1 text-muted-foreground">
          Here&apos;s what&apos;s happening in sports today.
        </p>
      </div>

      {/* Status bar */}
      <LiveStatusBar />

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="h-full cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md">
              <CardHeader className="pb-2">
                <link.icon className={`h-6 w-6 ${link.color}`} />
                <CardTitle className="text-base">{link.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {link.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Leagues overview */}
      <div className="space-y-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Leagues Covered
        </span>
        <div className="flex flex-wrap gap-2">
          {LEAGUES.map((league) => (
            <Link
              key={league.id}
              href={`/dashboard/scores?league=${league.id}`}
            >
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                {league.label}
              </Badge>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
