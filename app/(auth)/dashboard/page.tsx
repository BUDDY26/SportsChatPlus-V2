import { Metadata } from "next";
import { ChevronRight, Trophy } from "lucide-react";
import Link from "next/link";
import { LiveStatusBar } from "@/components/dashboard/LiveStatusBar";

export const metadata: Metadata = { title: "Dashboard" };

// ─── Placeholder team tiles ────────────────────────────────────────────────────

const placeholderTeams = [
  { label: "Lakers",  abbr: "LAL" },
  { label: "Chiefs",  abbr: "KC"  },
  { label: "Yankees", abbr: "NYY" },
  { label: "Auburn",  abbr: "AU"  },
  { label: "Heat",    abbr: "MIA" },
  { label: "Eagles",  abbr: "PHI" },
  { label: "Celtics", abbr: "BOS" },
  { label: "Cowboys", abbr: "DAL" },
];

// ─── Placeholder match data ────────────────────────────────────────────────────

const placeholderLive = [
  { league: "NCAAB Men", home: "Auburn",   away: "Michigan State", homeScore: 70,  awayScore: 64,  period: "Final"     },
  { league: "NBA",       home: "Lakers",   away: "Celtics",        homeScore: 98,  awayScore: 102, period: "OT · 4:02" },
  { league: "NFL",       home: "Chiefs",   away: "Bills",          homeScore: 24,  awayScore: 17,  period: "Q4 · 2:15" },
];

const placeholderUpcoming = [
  { league: "NCAAF",     home: "Alabama",  away: "Georgia",  time: "Sat · 7:00 PM ET"      },
  { league: "NBA",       home: "Warriors", away: "Nuggets",  time: "Tonight · 9:30 PM ET"  },
  { league: "MLB",       home: "Yankees",  away: "Red Sox",  time: "Tomorrow · 1:05 PM ET" },
  { league: "NCAAB Men", home: "Duke",     away: "UNC",      time: "Sat · 2:00 PM ET"      },
];

const placeholderRecent = [
  { league: "NCAAB Men", home: "Auburn",  away: "Florida", homeScore: 79,  awayScore: 73  },
  { league: "NFL",       home: "Eagles",  away: "Cowboys", homeScore: 34,  awayScore: 17  },
  { league: "NBA",       home: "Heat",    away: "Bulls",   homeScore: 112, awayScore: 105 },
  { league: "MLB",       home: "Dodgers", away: "Padres",  homeScore: 5,   awayScore: 3   },
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
    <div className="flex h-full">

      {/* ── Center: primary live workspace ─────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* Live status bar */}
        <div className="flex-shrink-0 border-b border-border/30 px-4 py-2">
          <LiveStatusBar />
        </div>

        {/* Teams strip */}
        <div className="flex-shrink-0 border-b border-border/30 px-4 py-2.5">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            My Teams
          </p>
          <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
            {placeholderTeams.map((team) => (
              <Link
                key={team.abbr}
                href="/dashboard/favorites"
                className="flex-shrink-0 flex flex-col items-center justify-center rounded-sm bg-secondary border border-border/50 hover:bg-accent hover:border-primary/40 transition-colors w-14 h-12 gap-0.5"
              >
                <span className="text-[11px] font-bold tabular-nums text-foreground">{team.abbr}</span>
                <span className="text-[9px] text-muted-foreground truncate w-full text-center px-1">{team.label}</span>
              </Link>
            ))}
            <Link
              href="/dashboard/favorites"
              className="flex-shrink-0 flex flex-col items-center justify-center rounded-sm border border-dashed border-border/50 hover:border-primary/40 text-muted-foreground hover:text-primary transition-colors w-14 h-12"
            >
              <span className="text-base leading-none font-light">+</span>
              <span className="text-[9px]">Add</span>
            </Link>
          </div>
        </div>

        {/* Tabbed content — scrollable */}
        <div className="flex-1 overflow-y-auto p-4">

          {/* Tab header */}
          <div className="flex items-center gap-1 mb-3">
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
            <div className="rounded-sm bg-card border border-border/50 overflow-hidden divide-y divide-border/40">
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
                    className="flex items-start gap-3 px-4 py-2.5 hover:bg-accent/40 transition-colors"
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
            <div className="rounded-sm bg-card border border-border/50 overflow-hidden divide-y divide-border/40">
              {placeholderUpcoming.map((match, i) => (
                <Link
                  key={i}
                  href="/dashboard/scores"
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent/40 transition-colors"
                >
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
            <div className="rounded-sm bg-card border border-border/50 overflow-hidden divide-y divide-border/40">
              {placeholderRecent.map((match, i) => (
                <Link
                  key={i}
                  href="/dashboard/scores"
                  className="flex items-start gap-3 px-4 py-2.5 hover:bg-accent/40 transition-colors"
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

      {/* ── Right rail: Tournament Central ─────────────────────────────────── */}
      <div className="hidden lg:flex w-72 flex-shrink-0 flex-col border-l border-border/50 bg-card overflow-y-auto">

        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-border/30">
          <div className="flex items-center gap-2">
            <Trophy className="h-3.5 w-3.5 text-sports-gold" />
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Tournament Central
            </p>
          </div>
          <Link href="/dashboard/tournament" className="text-xs text-primary hover:underline">
            Full bracket →
          </Link>
        </div>

        {/* Featured matchup */}
        <div className="px-4 py-3 border-b border-border/30">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
            NCAA Men&apos;s Basketball
          </p>
          <p className="text-[10px] text-muted-foreground/70 mb-3">Elite Eight · 3/29/2025</p>

          <div className="rounded-sm bg-secondary border border-border/50 p-3 mb-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Featured</p>
              <span className="text-[10px] text-sports-green font-semibold">Final</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Auburn (1)</span>
                <span className="text-sm font-bold tabular-nums">70</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Michigan State</span>
                <span className="text-sm tabular-nums text-muted-foreground">64</span>
              </div>
            </div>
          </div>

          <Link
            href="/dashboard/tournament"
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            View full bracket <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Round status */}
        <div className="px-4 py-3 border-b border-border/30">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Round Status
          </p>
          <div className="space-y-2">
            {[
              { round: "Elite Eight",  status: "In Progress", active: true  },
              { round: "Final Four",   status: "Apr 5",       active: false },
              { round: "Championship", status: "Apr 7",       active: false },
            ].map((r) => (
              <div key={r.round} className="flex items-center justify-between">
                <span className={`text-xs ${r.active ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                  {r.round}
                </span>
                <span className={`text-[10px] ${r.active ? "text-sports-green font-semibold" : "text-muted-foreground"}`}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Other active tournaments */}
        <div className="px-4 py-3 border-b border-border/30">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Other Active
          </p>
          <div className="space-y-1.5">
            {[
              { name: "NCAA Women's Basketball", round: "Elite Eight"    },
              { name: "NCAA Baseball",           round: "Regionals"      },
              { name: "NCAA Softball",           round: "Super Regionals"},
            ].map((t) => (
              <Link
                key={t.name}
                href="/dashboard/tournament"
                className="flex items-center justify-between hover:bg-accent/40 rounded px-1 py-0.5 -mx-1 transition-colors"
              >
                <span className="text-xs text-muted-foreground">{t.name}</span>
                <span className="text-[10px] text-muted-foreground/60">{t.round}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="px-4 py-3">
          <Link
            href="/dashboard/tournament"
            className="flex items-center justify-center gap-1.5 w-full rounded-md bg-primary/10 border border-primary/30 px-3 py-2 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
          >
            <Trophy className="h-3 w-3" />
            Tournament Center
          </Link>
        </div>

      </div>

    </div>
  );
}
