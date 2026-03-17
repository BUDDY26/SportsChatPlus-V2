import { Metadata } from "next";
import { Trophy } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = { title: "Dashboard" };

// ─── Types ──────────────────────────────────────────────────────────────────

type Tab = "live" | "upcoming" | "recent";

const TAB_LABELS: Record<Tab, string> = {
  live:     "Live",
  upcoming: "Upcoming",
  recent:   "Recent",
};

// ─── Placeholder data ────────────────────────────────────────────────────────

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

type LiveGame = {
  id: number;
  league: string;
  competition: string;
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
  period: string;
  live: boolean;
};

const liveGames: LiveGame[] = [
  {
    id: 1, league: "NCAAB", competition: "Elite Eight",
    home: "Auburn",      away: "Michigan St.",
    homeScore: 70,       awayScore: 64,
    period: "Final",     live: false,
  },
  {
    id: 2, league: "NBA",   competition: "Regular Season",
    home: "Lakers",      away: "Celtics",
    homeScore: 98,       awayScore: 102,
    period: "OT · 4:02", live: true,
  },
  {
    id: 3, league: "NFL",   competition: "Playoffs",
    home: "Chiefs",      away: "Bills",
    homeScore: 24,       awayScore: 17,
    period: "Q4 · 2:15", live: true,
  },
  {
    id: 4, league: "NCAAW", competition: "Elite Eight",
    home: "S. Carolina", away: "Iowa",
    homeScore: 78,       awayScore: 73,
    period: "Final",     live: false,
  },
];

type UpcomingGame = {
  id: number;
  league: string;
  home: string;
  away: string;
  time: string;
};

const upcomingGames: UpcomingGame[] = [
  { id: 1, league: "NCAAF", home: "Alabama",  away: "Georgia",  time: "Sat · 7:00 PM ET"      },
  { id: 2, league: "NBA",   home: "Warriors", away: "Nuggets",  time: "Tonight · 9:30 PM ET"  },
  { id: 3, league: "MLB",   home: "Yankees",  away: "Red Sox",  time: "Tomorrow · 1:05 PM ET" },
  { id: 4, league: "NCAAB", home: "Duke",     away: "UNC",      time: "Sat · 2:00 PM ET"      },
];

type RecentGame = {
  id: number;
  league: string;
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
};

const recentGames: RecentGame[] = [
  { id: 1, league: "NCAAB", home: "Auburn",  away: "Florida", homeScore: 79,  awayScore: 73  },
  { id: 2, league: "NFL",   home: "Eagles",  away: "Cowboys", homeScore: 34,  awayScore: 17  },
  { id: 3, league: "NBA",   home: "Heat",    away: "Bulls",   homeScore: 112, awayScore: 105 },
  { id: 4, league: "MLB",   home: "Dodgers", away: "Padres",  homeScore: 5,   awayScore: 3   },
];

// ─── Shared card class ───────────────────────────────────────────────────────

const CARD =
  "flex flex-1 flex-col rounded border border-border/50 bg-card p-3 transition-colors hover:border-primary/30 hover:bg-accent";

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const raw = searchParams?.tab;
  const activeTab: Tab =
    raw === "upcoming" || raw === "recent" ? raw : "live";

  return (
    <div className="grid h-full overflow-hidden grid-cols-[1fr_1fr_18rem] grid-rows-[auto_auto_1fr]">

      {/* ── Row 1, Cols 1-2: Favorite Teams Row ─────────────────────────────
          col-span-2 → occupies columns 1 and 2 only.
          Tournament Central (col-start-3) is unaffected.           ────── */}
      <div className="col-span-2 border-b border-border/40 bg-background px-4 py-2">
        <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/50">
          My Teams
        </p>
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {placeholderTeams.map((team) => (
            <Link
              key={team.abbr}
              href="/dashboard/favorites"
              className="flex h-11 w-12 flex-shrink-0 flex-col items-center justify-center gap-0.5 rounded border border-border/50 bg-card transition-colors hover:border-primary/40 hover:bg-accent"
            >
              <span className="text-[11px] font-bold leading-none tabular-nums text-foreground">
                {team.abbr}
              </span>
              <span className="w-full truncate px-0.5 text-center text-[9px] leading-none text-muted-foreground">
                {team.label}
              </span>
            </Link>
          ))}
          <Link
            href="/dashboard/favorites"
            className="flex h-11 w-12 flex-shrink-0 flex-col items-center justify-center gap-0.5 rounded border border-dashed border-border/40 text-muted-foreground/50 transition-colors hover:border-primary/40 hover:text-primary"
          >
            <span className="text-base font-light leading-none">+</span>
            <span className="text-[9px] leading-none">Add</span>
          </Link>
        </div>
      </div>

      {/* ── Col 3, Rows 1-3: Tournament Central ─────────────────────────────
          col-start-3 row-start-1 row-span-3 → independent right rail.
          Does not sit under the Teams Row or Tab Filter bands.      ────── */}
      <div className="col-start-3 row-start-1 row-span-3 flex flex-col border-l border-border/40 bg-card overflow-y-auto">

        {/* Spotlight header */}
        <div className="flex-shrink-0 border-b border-border/40 bg-[hsl(var(--shell-bg))] px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-3.5 w-3.5 flex-shrink-0 text-sports-gold" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-foreground">
                Tournament Central
              </span>
            </div>
            <Link
              href="/dashboard/tournament"
              className="flex-shrink-0 text-[10px] text-primary transition-colors hover:underline"
            >
              Full bracket →
            </Link>
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground/50">
            NCAA March Madness · Elite Eight
          </p>
        </div>

        {/* Tournament Spotlight */}
        <div className="flex-shrink-0 border-b border-border/40 px-4 py-3">
          <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/40">
            Tournament Spotlight
          </p>
          <p className="mb-2.5 text-[10px] text-muted-foreground/60">
            NCAA Men&apos;s Basketball · 3/29/2025
          </p>
          <div className="rounded border border-border/50 bg-secondary p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-wide text-muted-foreground/50">Featured</span>
              <span className="text-[9px] font-medium text-muted-foreground">Elite Eight</span>
            </div>
            <div className="mb-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">Auburn (1)</span>
                <span className="text-sm font-bold tabular-nums text-foreground">70</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Michigan State</span>
                <span className="text-sm tabular-nums text-muted-foreground">64</span>
              </div>
            </div>
            <div className="border-t border-border/30 pt-2">
              <span className="text-[9px] text-muted-foreground/50">Final</span>
            </div>
          </div>
        </div>

        {/* Round Status */}
        <div className="flex-shrink-0 border-b border-border/40 px-4 py-3">
          <p className="mb-2.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/40">
            Round Status
          </p>
          <div className="space-y-2">
            {[
              { round: "Elite Eight",  status: "In Progress", active: true  },
              { round: "Final Four",   status: "Apr 5",       active: false },
              { round: "Championship", status: "Apr 7",       active: false },
            ].map((r) => (
              <div key={r.round} className="flex items-center justify-between py-0.5">
                <span className={`text-[11px] ${r.active ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                  {r.round}
                </span>
                <span className={`text-[10px] ${r.active ? "font-semibold text-sports-green" : "text-muted-foreground/50"}`}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Other Active */}
        <div className="flex-shrink-0 border-b border-border/40 px-4 py-3">
          <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/40">
            Other Active
          </p>
          <div className="space-y-0.5">
            {[
              { name: "NCAA Women's Basketball", round: "Elite Eight"     },
              { name: "NCAA Baseball",           round: "Regionals"       },
              { name: "NCAA Softball",           round: "Super Regionals" },
            ].map((t) => (
              <Link
                key={t.name}
                href="/dashboard/tournament"
                className="-mx-1.5 flex items-center justify-between rounded px-1.5 py-1.5 transition-colors hover:bg-accent/30"
              >
                <span className="text-[11px] text-muted-foreground/70">{t.name}</span>
                <span className="text-[10px] text-muted-foreground/40">{t.round}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="flex-shrink-0 px-4 py-3">
          <Link
            href="/dashboard/tournament"
            className="flex w-full items-center justify-center gap-2 rounded border border-primary/25 bg-primary/10 px-3 py-2.5 text-[11px] font-medium text-primary transition-colors hover:bg-primary/20"
          >
            <Trophy className="h-3.5 w-3.5" />
            View Tournament Center
          </Link>
        </div>

      </div>

      {/* ── Row 2, Cols 1-2: Tab Filter Row ─────────────────────────────────
          col-span-2 → spans columns 1 and 2 only.
          Sits directly below Favorite Teams Row.                    ────── */}
      <div className="col-span-2 flex items-center justify-between border-b border-border/40 px-4 py-2">
        <div className="flex items-center gap-1">
          {(["live", "upcoming", "recent"] as Tab[]).map((tab) => (
            <Link
              key={tab}
              href={`/dashboard?tab=${tab}`}
              className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-[11px] font-medium transition-colors ${
                activeTab === tab
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {tab === "live" && (
                <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-sports-green" />
              )}
              {TAB_LABELS[tab]}
            </Link>
          ))}
        </div>
        <Link
          href="/dashboard/scores"
          className="text-[11px] text-primary/60 transition-colors hover:text-primary"
        >
          All scores →
        </Link>
      </div>

      {/* ── Row 3, Col 1: Column A ───────────────────────────────────────────
          Auto-placed by CSS grid into row 3, column 1.
          Direct grid child — no parent/child relationship with Col B. ───── */}
      <div className="flex flex-col gap-2 overflow-hidden border-r border-border/40 p-3">

        {activeTab === "live" && liveGames.slice(0, 2).map((game) => (
          <Link key={game.id} href="/dashboard/scores" className={CARD}>
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                {game.league} · {game.competition}
              </span>
              {game.live ? (
                <span className="flex items-center gap-1">
                  <span className="live-dot" />
                  <span className="text-[9px] font-semibold text-sports-green">Live</span>
                </span>
              ) : (
                <span className="text-[9px] font-medium text-muted-foreground">{game.period}</span>
              )}
            </div>
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="truncate pr-2 text-sm font-semibold text-foreground">{game.home}</span>
                <span className="flex-shrink-0 text-sm font-bold tabular-nums">{game.homeScore}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="truncate pr-2 text-sm text-muted-foreground">{game.away}</span>
                <span className="flex-shrink-0 text-sm tabular-nums text-muted-foreground">{game.awayScore}</span>
              </div>
            </div>
            <div className="mt-2.5 border-t border-border/30 pt-2">
              <span className="text-[10px] text-muted-foreground/50">
                {game.live ? game.period : "Final"}
              </span>
            </div>
          </Link>
        ))}

        {activeTab === "upcoming" && upcomingGames.slice(0, 2).map((game) => (
          <Link key={game.id} href="/dashboard/scores" className={CARD}>
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                {game.league}
              </span>
              <span className="text-[9px] text-muted-foreground">{game.time}</span>
            </div>
            <div className="flex-1 space-y-1.5">
              <p className="text-sm font-semibold text-foreground">{game.home}</p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">vs</p>
              <p className="text-sm text-muted-foreground">{game.away}</p>
            </div>
          </Link>
        ))}

        {activeTab === "recent" && recentGames.slice(0, 2).map((game) => (
          <Link key={game.id} href="/dashboard/scores" className={CARD}>
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                {game.league}
              </span>
              <span className="text-[9px] text-muted-foreground">Final</span>
            </div>
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">{game.home}</span>
                <span className="text-sm font-bold tabular-nums">{game.homeScore}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{game.away}</span>
                <span className="text-sm tabular-nums text-muted-foreground">{game.awayScore}</span>
              </div>
            </div>
          </Link>
        ))}

      </div>

      {/* ── Row 3, Col 2: Column B ───────────────────────────────────────────
          Auto-placed by CSS grid into row 3, column 2.
          Direct grid child — no parent/child relationship with Col A. ───── */}
      <div className="flex flex-col gap-2 overflow-hidden p-3">

        {activeTab === "live" && liveGames.slice(2, 4).map((game) => (
          <Link key={game.id} href="/dashboard/scores" className={CARD}>
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                {game.league} · {game.competition}
              </span>
              {game.live ? (
                <span className="flex items-center gap-1">
                  <span className="live-dot" />
                  <span className="text-[9px] font-semibold text-sports-green">Live</span>
                </span>
              ) : (
                <span className="text-[9px] font-medium text-muted-foreground">{game.period}</span>
              )}
            </div>
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="truncate pr-2 text-sm font-semibold text-foreground">{game.home}</span>
                <span className="flex-shrink-0 text-sm font-bold tabular-nums">{game.homeScore}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="truncate pr-2 text-sm text-muted-foreground">{game.away}</span>
                <span className="flex-shrink-0 text-sm tabular-nums text-muted-foreground">{game.awayScore}</span>
              </div>
            </div>
            <div className="mt-2.5 border-t border-border/30 pt-2">
              <span className="text-[10px] text-muted-foreground/50">
                {game.live ? game.period : "Final"}
              </span>
            </div>
          </Link>
        ))}

        {activeTab === "upcoming" && upcomingGames.slice(2, 4).map((game) => (
          <Link key={game.id} href="/dashboard/scores" className={CARD}>
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                {game.league}
              </span>
              <span className="text-[9px] text-muted-foreground">{game.time}</span>
            </div>
            <div className="flex-1 space-y-1.5">
              <p className="text-sm font-semibold text-foreground">{game.home}</p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">vs</p>
              <p className="text-sm text-muted-foreground">{game.away}</p>
            </div>
          </Link>
        ))}

        {activeTab === "recent" && recentGames.slice(2, 4).map((game) => (
          <Link key={game.id} href="/dashboard/scores" className={CARD}>
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                {game.league}
              </span>
              <span className="text-[9px] text-muted-foreground">Final</span>
            </div>
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">{game.home}</span>
                <span className="text-sm font-bold tabular-nums">{game.homeScore}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{game.away}</span>
                <span className="text-sm tabular-nums text-muted-foreground">{game.awayScore}</span>
              </div>
            </div>
          </Link>
        ))}

      </div>

    </div>
  );
}
