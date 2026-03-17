import { Metadata } from "next";
import { Star, Brain, ChevronRight, Zap, Trophy, Clock } from "lucide-react";
import Link from "next/link";
import { LiveStatusBar } from "@/components/dashboard/LiveStatusBar";

export const metadata: Metadata = { title: "Dashboard" };

// ─── Competition hierarchy — NCAA leads per product identity ──────────────────

const competitionGroups = [
  {
    label: "NCAA",
    items: [
      { label: "Football",           href: "/dashboard/scores?league=NCAAF" },
      { label: "Men's Basketball",   href: "/dashboard/scores?league=NCAAB_MEN" },
      { label: "Women's Basketball", href: "/dashboard/scores?league=NCAAB_WOMEN" },
      { label: "Baseball",           href: "/dashboard/scores?league=NCAA_BASEBALL" },
      { label: "Softball",           href: "/dashboard/scores?league=NCAA_SOFTBALL" },
    ],
  },
  {
    label: "Major Leagues",
    items: [
      { label: "NFL", href: "/dashboard/scores?league=NFL" },
      { label: "NBA", href: "/dashboard/scores?league=NBA" },
      { label: "MLB", href: "/dashboard/scores?league=MLB" },
    ],
  },
];

// ─── Placeholder match data (Phase 3 will wire real useScores() output) ───────

const placeholderLive = [
  { league: "NCAAB Men",  home: "Auburn",   away: "Michigan State", homeScore: 70,  awayScore: 64,  period: "Final"      },
  { league: "NBA",        home: "Lakers",   away: "Celtics",        homeScore: 98,  awayScore: 102, period: "OT · 4:02"  },
  { league: "NFL",        home: "Chiefs",   away: "Bills",          homeScore: 24,  awayScore: 17,  period: "Q4 · 2:15"  },
];

const placeholderUpcoming = [
  { league: "NCAAF",      home: "Alabama",  away: "Georgia",    time: "Sat · 7:00 PM ET"      },
  { league: "NBA",        home: "Warriors", away: "Nuggets",    time: "Tonight · 9:30 PM ET"  },
  { league: "MLB",        home: "Yankees",  away: "Red Sox",    time: "Tomorrow · 1:05 PM ET" },
  { league: "NCAAB Men",  home: "Duke",     away: "UNC",        time: "Sat · 2:00 PM ET"      },
];

const placeholderRecent = [
  { league: "NCAAB Men",  home: "Auburn",   away: "Florida",  homeScore: 79,  awayScore: 73  },
  { league: "NFL",        home: "Eagles",   away: "Cowboys",  homeScore: 34,  awayScore: 17  },
  { league: "NBA",        home: "Heat",     away: "Bulls",    homeScore: 112, awayScore: 105 },
  { league: "MLB",        home: "Dodgers",  away: "Padres",   homeScore: 5,   awayScore: 3   },
];

// ─── Tab types ─────────────────────────────────────────────────────────────────

type Tab = "live" | "upcoming" | "recent";

const TAB_LABELS: Record<Tab, string> = {
  live:     "Live",
  upcoming: "Upcoming",
  recent:   "Recent",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const raw = searchParams?.tab;
  const activeTab: Tab =
    raw === "upcoming" || raw === "recent" ? raw : "live";

  return (
    <div className="grid grid-cols-12 gap-3">

      {/* ── Left — sports & competition browser ───────────────────────────── */}
      {/* order-2 on mobile: center (live data) renders first */}
      <div className="col-span-12 md:col-span-3 order-2 md:order-1 h-full">
        <div className="rounded-xl bg-card/80 backdrop-blur-sm border border-border/40 overflow-hidden h-full">
          <div className="px-4 py-2.5 border-b border-border/40">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Sports &amp; Competitions
            </p>
          </div>
          <div>
            {competitionGroups.map((group) => (
              <div key={group.label}>
                <p className="px-4 pt-2 pb-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                  {group.label}
                </p>
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-between px-4 py-1.5 text-sm text-foreground/80 hover:bg-muted/40 hover:text-foreground transition-colors group"
                  >
                    <span>{item.label}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Center — live data (primary) ──────────────────────────────────── */}
      {/* order-1 on mobile: always renders first */}
      <div className="col-span-12 md:col-span-6 order-1 md:order-2 space-y-3">

        {/* Live status summary — real data via useScores */}
        <LiveStatusBar />

        {/* Tabbed match panel */}
        <div className="rounded-xl bg-card/80 backdrop-blur-sm border border-border/40 overflow-hidden">

          {/* Tab header */}
          <div className="flex items-center gap-1 px-4 py-2.5 border-b border-border/40">
            {(["live", "upcoming", "recent"] as Tab[]).map((tab) => (
              <Link
                key={tab}
                href={`/dashboard?tab=${tab}`}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                {TAB_LABELS[tab]}
                {tab === "live" && (
                  <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-sports-green align-middle" />
                )}
              </Link>
            ))}
            <Link
              href="/dashboard/scores"
              className="ml-auto text-xs text-primary hover:underline"
            >
              View all
            </Link>
          </div>

          {/* Live tab */}
          {activeTab === "live" && (
            <div className="divide-y divide-border/30">
              {placeholderLive.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No live games right now.{" "}
                  <Link href="/dashboard?tab=upcoming" className="text-primary hover:underline">
                    View upcoming →
                  </Link>
                </div>
              ) : (
                placeholderLive.map((match, i) => (
                  <Link
                    key={i}
                    href="/dashboard/scores"
                    className="flex items-start gap-3 px-4 py-2 hover:bg-accent/40 transition-colors"
                  >
                    <span className="live-dot mt-1.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">
                        {match.league}
                      </p>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{match.home}</p>
                          <p className="text-sm text-muted-foreground truncate">{match.away}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold tabular-nums">{match.homeScore}</p>
                          <p className="text-sm tabular-nums text-muted-foreground">{match.awayScore}</p>
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0 text-right w-16 mt-0.5">
                      {match.period}
                    </span>
                  </Link>
                ))
              )}
            </div>
          )}

          {/* Upcoming tab */}
          {activeTab === "upcoming" && (
            <div className="divide-y divide-border/30">
              {placeholderUpcoming.map((match, i) => (
                <Link
                  key={i}
                  href="/dashboard/scores"
                  className="flex items-center gap-3 px-4 py-2 hover:bg-accent/40 transition-colors"
                >
                  <Clock className="h-3.5 w-3.5 text-muted-foreground/50 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">
                      {match.league}
                    </p>
                    <p className="text-sm font-medium truncate">
                      {match.home}{" "}
                      <span className="font-normal text-muted-foreground">vs</span>{" "}
                      {match.away}
                    </p>
                  </div>
                  <span className="text-[10px] text-muted-foreground flex-shrink-0 text-right">
                    {match.time}
                  </span>
                </Link>
              ))}
            </div>
          )}

          {/* Recent tab */}
          {activeTab === "recent" && (
            <div className="divide-y divide-border/30">
              {placeholderRecent.map((match, i) => (
                <Link
                  key={i}
                  href="/dashboard/scores"
                  className="flex items-start gap-3 px-4 py-2 hover:bg-accent/40 transition-colors"
                >
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-muted-foreground/30 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">
                      {match.league}
                    </p>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{match.home}</p>
                        <p className="text-sm text-muted-foreground truncate">{match.away}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold tabular-nums">{match.homeScore}</p>
                        <p className="text-sm tabular-nums text-muted-foreground">{match.awayScore}</p>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground flex-shrink-0 w-10 text-right mt-0.5">
                    Final
                  </span>
                </Link>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* ── Right — supporting panels ──────────────────────────────────────── */}
      <div className="col-span-12 md:col-span-3 order-3 space-y-3">

        {/* Tournament Spotlight — always first, core feature */}
        <div className="rounded-xl bg-gradient-to-br from-purple-500/10 to-transparent bg-card/80 backdrop-blur-sm border border-border/40 overflow-hidden">
          <div className="px-4 py-3 border-b border-border/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-3.5 w-3.5 text-sports-gold" />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tournament
              </p>
            </div>
            <Link href="/dashboard/tournament" className="text-xs text-primary hover:underline">
              Bracket →
            </Link>
          </div>
          <div className="px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              NCAA Men&apos;s Basketball
            </p>
            <p className="text-sm font-semibold leading-snug">Auburn (1)</p>
            <p className="text-sm text-muted-foreground leading-snug">Michigan State</p>
            <p className="text-[10px] text-muted-foreground mt-1">Elite Eight · 3/29/2025</p>
            <p className="text-lg font-bold mt-0.5 tabular-nums tracking-tight">70 – 64</p>
            <Link
              href="/dashboard/tournament"
              className="mt-2 flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              View full bracket <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* My Teams */}
        <div className="rounded-xl bg-card/80 backdrop-blur-sm border border-border/40 overflow-hidden">
          <div className="px-4 py-3 border-b border-border/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="h-3.5 w-3.5 text-sports-gold" />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                My Teams
              </p>
            </div>
            <Link href="/dashboard/favorites" className="text-xs text-primary hover:underline">
              Manage
            </Link>
          </div>
          <div className="px-4 py-3 text-center">
            <Star className="h-6 w-6 text-sports-gold mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium">No favorites yet</p>
            <p className="text-xs text-muted-foreground mt-0.5 mb-3 leading-relaxed">
              Follow teams for live alerts
            </p>
            <Link
              href="/dashboard/favorites"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Add teams <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* AI Insights — teaser only */}
        <div className="rounded-xl bg-gradient-to-br from-blue-500/10 to-transparent bg-card/80 backdrop-blur-sm border border-border/40 overflow-hidden">
          <div className="px-4 py-3 border-b border-border/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-3.5 w-3.5 text-primary" />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                AI Insights
              </p>
            </div>
            <Link href="/dashboard/ai-insights" className="text-xs text-primary hover:underline">
              Open
            </Link>
          </div>
          <div className="px-4 py-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              GPT-powered predictions and analysis across all leagues.
            </p>
            <Link
              href="/dashboard/ai-insights"
              className="mt-2 flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              <Zap className="h-3 w-3" />
              Explore insights
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
