import { Metadata } from "next";
import { Trophy, Zap, Circle, Gauge } from "lucide-react";
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
  { label: "Lakers",  abbr: "LAL", bg: "rgba(85,37,130,0.5)",  color: "#c084fc" },
  { label: "Chiefs",  abbr: "KC",  bg: "rgba(180,30,30,0.5)",  color: "#f87171" },
  { label: "Yankees", abbr: "NYY", bg: "rgba(20,40,120,0.5)",  color: "#93c5fd" },
  { label: "Auburn",  abbr: "AU",  bg: "rgba(0,90,50,0.5)",    color: "#6ee7b7" },
  { label: "Heat",    abbr: "MIA", bg: "rgba(180,20,80,0.5)",  color: "#f9a8d4" },
  { label: "Eagles",  abbr: "PHI", bg: "rgba(0,60,120,0.5)",   color: "#7dd3fc" },
  { label: "Celtics", abbr: "BOS", bg: "rgba(0,100,40,0.5)",   color: "#86efac" },
  { label: "Cowboys", abbr: "DAL", bg: "rgba(0,50,100,0.5)",   color: "#67e8f9" },
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

// ─── Sport chips ─────────────────────────────────────────────────────────────

const sportChips = [
  { id: "NCAAF",         label: "NCAA FB",      icon: Zap,    count: 0, active: true  },
  { id: "NFL",           label: "NFL",           icon: Zap,    count: 1, active: false },
  { id: "NCAAB_MEN",    label: "NCAAB",         icon: Trophy, count: 1, active: false },
  { id: "NCAAB_WOMEN",  label: "NCAAW",         icon: Trophy, count: 1, active: false },
  { id: "NBA",           label: "NBA",           icon: Trophy, count: 1, active: false },
  { id: "NCAA_BASEBALL", label: "NCAA Baseball", icon: Circle, count: 0, active: false },
  { id: "MLB",           label: "MLB",           icon: Circle, count: 0, active: false },
  { id: "NCAA_SOFTBALL", label: "NCAA Softball", icon: Circle, count: 0, active: false },
  { id: "F1",            label: "F1",            icon: Gauge,  count: 0, active: false },
];

// ─── Shared card class ───────────────────────────────────────────────────────

const CARD =
  "flex flex-1 flex-col rounded-xl card-float p-3 transition-colors hover:bg-white/[0.03]";

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
    <div className="grid h-full overflow-hidden grid-cols-[1fr_1fr_18rem] grid-rows-[auto_auto_auto_1fr]">

      {/* ── Row 1, Cols 1-2: Sport Icon Strip ────────────────────────────────
          col-span-2 → occupies columns 1 and 2 only.
          Tournament Central (col-start-3) is unaffected.           ────── */}
      <div
        className="col-span-2 flex justify-start gap-2 overflow-x-auto px-4 py-3 border-b border-white/[0.06]"
        style={{ scrollbarWidth: "none" }}
      >
        {sportChips.map((chip) => (
          <button
            key={chip.id}
            className={`flex-shrink-0 flex flex-col items-center justify-center gap-1.5 h-[64px] w-[72px] rounded-xl border transition-all relative ${
              chip.active
                ? "bg-[linear-gradient(135deg,rgba(100,50,180,0.5),rgba(60,30,140,0.4))] border-[rgba(130,80,220,0.4)]"
                : "border-white/[0.08] bg-[#1e1f25] hover:bg-[#24252b]"
            }`}
          >
            <chip.icon
              className={`h-4 w-4 ${chip.active ? "text-[#c084fc]" : "text-on-surface-variant/50"}`}
            />
            <span className={`text-[10px] leading-none ${chip.active ? "text-[#c084fc]" : "text-on-surface-variant/50"}`}>
              {chip.label}
            </span>
            {chip.count > 0 && (
              <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-sports-gold text-[8px] font-bold leading-none text-black">
                {chip.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Row 2, Cols 1-2: Favorite Teams Row ─────────────────────────────
          col-span-2 → occupies columns 1 and 2 only.
          Tournament Central (col-start-3) is unaffected.           ────── */}
      <div className="col-span-2 px-4 py-2 border-b border-white/[0.06]">
        <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant/50">
          My Teams
        </p>
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {placeholderTeams.map((team) => (
            <div
              key={team.abbr}
              className="flex flex-shrink-0 flex-col items-center gap-1 cursor-pointer"
            >
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-[10px] font-bold border border-white/[0.1] transition-colors hover:border-primary/40"
                style={{ background: team.bg, color: team.color }}
              >
                {team.abbr}
              </div>
              <span className="text-[9px] text-on-surface-variant/60">{team.label}</span>
            </div>
          ))}
          <div className="flex flex-shrink-0 flex-col items-center gap-1 cursor-pointer">
            <div className="w-10 h-10 rounded-full flex items-center justify-center border border-dashed border-white/[0.12] text-on-surface-variant/40 transition-colors hover:border-primary/40 hover:text-primary">
              <span className="text-base font-light leading-none">+</span>
            </div>
            <span className="text-[9px] text-on-surface-variant/40">Add</span>
          </div>
        </div>
      </div>

      {/* ── Col 3, Rows 1-3: Tournament Central ─────────────────────────────
          col-start-3 row-start-1 row-span-3 → independent right rail.
          Does not sit under the Teams Row or Tab Filter bands.      ────── */}
      <div className="col-start-3 row-start-1 row-span-4 flex flex-col overflow-y-auto card-float border-l border-white/[0.06]">

        {/* Spotlight header */}
        <div className="flex-shrink-0 border-b border-white/[0.06] px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 flex-shrink-0 text-sports-gold" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-on-surface">
                Tournament Central
              </span>
            </div>
            <Link
              href="/dashboard/tournament"
              className="flex-shrink-0 text-[10px] text-primary/70 transition-colors hover:text-primary"
            >
              Full bracket →
            </Link>
          </div>
          <p className="mt-1 text-[10px] text-on-surface-variant/60">
            NCAA March Madness · Elite Eight
          </p>
        </div>

        {/* Tournament Spotlight */}
        <div className="flex-shrink-0 border-b border-white/[0.06] px-4 py-3">
          <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant/50">
            Tournament Spotlight
          </p>
          <p className="mb-2.5 text-[10px] text-on-surface-variant/60">
            NCAA Men&apos;s Basketball · 3/29/2025
          </p>
          <div className="rounded-xl card-float p-3 border border-white/[0.05]">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-wide text-on-surface-variant/50">Featured</span>
              <span className="text-[9px] font-medium text-on-surface-variant">Elite Eight</span>
            </div>
            <div className="mb-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-on-surface">Auburn (1)</span>
                <span className="text-sm font-bold tabular-nums text-on-surface">70</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-on-surface-variant">Michigan State</span>
                <span className="text-sm tabular-nums text-on-surface-variant">64</span>
              </div>
            </div>
            <div className="border-t border-white/[0.06] pt-2">
              <span className="text-[9px] text-on-surface-variant/50">Final</span>
            </div>
          </div>
        </div>

        {/* Round Status */}
        <div className="flex-shrink-0 border-b border-white/[0.06] px-4 py-3">
          <p className="mb-2.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant/50">
            Round Status
          </p>
          <div className="space-y-2">
            {[
              { round: "Elite Eight",  status: "In Progress", active: true  },
              { round: "Final Four",   status: "Apr 5",       active: false },
              { round: "Championship", status: "Apr 7",       active: false },
            ].map((r) => (
              <div key={r.round} className="flex items-center justify-between py-0.5">
                <span className={`text-[11px] ${r.active ? "font-semibold text-on-surface" : "text-on-surface-variant/60"}`}>
                  {r.round}
                </span>
                <span className={`text-[10px] ${r.active ? "font-semibold text-sports-green" : "text-on-surface-variant/40"}`}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Other Active */}
        <div className="flex-shrink-0 border-b border-white/[0.06] px-4 py-3">
          <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant/50">
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
                className="-mx-1.5 flex items-center justify-between rounded-lg px-1.5 py-1.5 transition-colors hover:bg-white/[0.05]"
              >
                <span className="text-[11px] text-on-surface-variant/70">{t.name}</span>
                <span className="text-[10px] text-on-surface-variant/40">{t.round}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="flex-shrink-0 px-4 py-3">
          <Link
            href="/dashboard/tournament"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-primary/25 bg-primary/10 px-3 py-2.5 text-[11px] font-medium text-primary transition-colors hover:bg-primary/20"
          >
            <Trophy className="h-3.5 w-3.5" />
            View Tournament Center
          </Link>
        </div>

      </div>

      {/* ── Row 2, Cols 1-2: Tab Filter Row ─────────────────────────────────
          col-span-2 → spans columns 1 and 2 only.
          Sits directly below Favorite Teams Row.                    ────── */}
      <div className="col-span-2 flex items-center justify-between px-4 py-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-1">
          {(["live", "upcoming", "recent"] as Tab[]).map((tab) => (
            <Link
              key={tab}
              href={`/dashboard?tab=${tab}`}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors ${
                activeTab === tab
                  ? "bg-primary text-primary-foreground"
                  : "text-on-surface-variant/60 hover:bg-white/[0.06] hover:text-on-surface"
              }`}
            >
              {tab === "live" && (
                <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-sports-green animate-pulse" />
              )}
              {TAB_LABELS[tab]}
            </Link>
          ))}
        </div>
        <Link
          href="/dashboard/scores"
          className="text-[11px] text-on-surface-variant/50 transition-colors hover:text-primary"
        >
          All scores →
        </Link>
      </div>

      {/* ── Row 3, Col 1: Column A ───────────────────────────────────────────
          Auto-placed by CSS grid into row 3, column 1.
          Direct grid child — no parent/child relationship with Col B. ───── */}
      <div className="flex flex-col gap-4 overflow-hidden min-h-0 h-full p-3 bg-white/[0.04]">

        {activeTab === "live" && liveGames.slice(0, 2).map((game) => (
          <Link key={game.id} href="/dashboard/scores" className={CARD}>
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-[9px] font-semibold uppercase tracking-wider text-on-surface-variant/60">
                {game.league} · {game.competition}
              </span>
              {game.live ? (
                <span className="flex items-center gap-1">
                  <span className="live-dot" />
                  <span className="text-[9px] font-semibold text-sports-green">LIVE</span>
                </span>
              ) : (
                <span className="text-[9px] font-medium text-on-surface-variant">{game.period}</span>
              )}
            </div>
            <div className="flex-1 flex flex-col justify-center gap-1.5">
              <div className="flex items-center justify-between">
                <span className="truncate pr-2 text-sm font-semibold text-on-surface">{game.home}</span>
                <span className="flex-shrink-0 text-sm font-bold tabular-nums">{game.homeScore}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="truncate pr-2 text-sm text-on-surface-variant">{game.away}</span>
                <span className="flex-shrink-0 text-sm tabular-nums text-on-surface-variant">{game.awayScore}</span>
              </div>
            </div>
            <div className="mt-2.5 border-t border-white/[0.06] pt-2">
              <span className="text-[10px] text-on-surface-variant/50">
                {game.live ? game.period : "Final"}
              </span>
            </div>
          </Link>
        ))}

        {activeTab === "upcoming" && upcomingGames.slice(0, 2).map((game) => (
          <Link key={game.id} href="/dashboard/scores" className={CARD}>
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-[9px] font-semibold uppercase tracking-wider text-on-surface-variant/60">
                {game.league}
              </span>
              <span className="text-[9px] text-on-surface-variant/70">{game.time}</span>
            </div>
            <div className="flex-1 flex flex-col justify-center gap-1.5">
              <p className="text-sm font-semibold text-on-surface">{game.home}</p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant/30">vs</p>
              <p className="text-sm text-on-surface-variant">{game.away}</p>
            </div>
          </Link>
        ))}

        {activeTab === "recent" && recentGames.slice(0, 2).map((game) => (
          <Link key={game.id} href="/dashboard/scores" className={CARD}>
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-[9px] font-semibold uppercase tracking-wider text-on-surface-variant/60">
                {game.league}
              </span>
              <span className="text-[9px] text-on-surface-variant/60">Final</span>
            </div>
            <div className="flex-1 flex flex-col justify-center gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-on-surface">{game.home}</span>
                <span className="text-sm font-bold tabular-nums">{game.homeScore}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-on-surface-variant">{game.away}</span>
                <span className="text-sm tabular-nums text-on-surface-variant">{game.awayScore}</span>
              </div>
            </div>
          </Link>
        ))}

      </div>

      {/* ── Row 3, Col 2: Column B ───────────────────────────────────────────
          Auto-placed by CSS grid into row 3, column 2.
          Direct grid child — no parent/child relationship with Col A. ───── */}
      <div className="flex flex-col gap-4 overflow-hidden min-h-0 h-full p-3 bg-white/[0.04]">

        {activeTab === "live" && liveGames.slice(2, 4).map((game) => (
          <Link key={game.id} href="/dashboard/scores" className={CARD}>
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-[9px] font-semibold uppercase tracking-wider text-on-surface-variant/60">
                {game.league} · {game.competition}
              </span>
              {game.live ? (
                <span className="flex items-center gap-1">
                  <span className="live-dot" />
                  <span className="text-[9px] font-semibold text-sports-green">LIVE</span>
                </span>
              ) : (
                <span className="text-[9px] font-medium text-on-surface-variant">{game.period}</span>
              )}
            </div>
            <div className="flex-1 flex flex-col justify-center gap-1.5">
              <div className="flex items-center justify-between">
                <span className="truncate pr-2 text-sm font-semibold text-on-surface">{game.home}</span>
                <span className="flex-shrink-0 text-sm font-bold tabular-nums">{game.homeScore}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="truncate pr-2 text-sm text-on-surface-variant">{game.away}</span>
                <span className="flex-shrink-0 text-sm tabular-nums text-on-surface-variant">{game.awayScore}</span>
              </div>
            </div>
            <div className="mt-2.5 border-t border-white/[0.06] pt-2">
              <span className="text-[10px] text-on-surface-variant/50">
                {game.live ? game.period : "Final"}
              </span>
            </div>
          </Link>
        ))}

        {activeTab === "upcoming" && upcomingGames.slice(2, 4).map((game) => (
          <Link key={game.id} href="/dashboard/scores" className={CARD}>
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-[9px] font-semibold uppercase tracking-wider text-on-surface-variant/60">
                {game.league}
              </span>
              <span className="text-[9px] text-on-surface-variant/70">{game.time}</span>
            </div>
            <div className="flex-1 flex flex-col justify-center gap-1.5">
              <p className="text-sm font-semibold text-on-surface">{game.home}</p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant/30">vs</p>
              <p className="text-sm text-on-surface-variant">{game.away}</p>
            </div>
          </Link>
        ))}

        {activeTab === "recent" && recentGames.slice(2, 4).map((game) => (
          <Link key={game.id} href="/dashboard/scores" className={CARD}>
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-[9px] font-semibold uppercase tracking-wider text-on-surface-variant/60">
                {game.league}
              </span>
              <span className="text-[9px] text-on-surface-variant/60">Final</span>
            </div>
            <div className="flex-1 flex flex-col justify-center gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-on-surface">{game.home}</span>
                <span className="text-sm font-bold tabular-nums">{game.homeScore}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-on-surface-variant">{game.away}</span>
                <span className="text-sm tabular-nums text-on-surface-variant">{game.awayScore}</span>
              </div>
            </div>
          </Link>
        ))}

      </div>

    </div>
  );
}
