import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, MessageSquare, Star, TrendingUp, Brain } from "lucide-react";
import Link from "next/link";

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
      <div>
        <h1 className="font-display text-3xl font-bold">
          Welcome back, {name}!
        </h1>
        <p className="mt-1 text-muted-foreground">
          Here&apos;s what&apos;s happening in sports today.
        </p>
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-3">
        <span className="live-dot" />
        <span className="text-sm font-medium">Live games in progress</span>
        <Badge variant="secondary" className="ml-auto">
          Updated now
        </Badge>
      </div>

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
                <p className="text-xs text-muted-foreground">
                  {link.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Leagues overview */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display">Leagues Covered</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[
              "NFL",
              "NBA",
              "MLB",
              "NCAAF",
              "NCAAB Men",
              "NCAAB Women",
              "NCAA Baseball",
              "NCAA Softball",
            ].map((league) => (
              <Badge key={league} variant="outline">
                {league}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
