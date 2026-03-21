import { Metadata } from "next";
import { Trophy, Zap, Circle, Gauge } from "lucide-react";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase";

export const revalidate = 0;

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
  "flex h-[340px] flex-shrink-0 flex-col overflow-hidden rounded-xl card-float p-3 transition-colors hover:bg-white/[0.03]";

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const raw = searchParams?.tab;
  const activeTab: Tab =
    raw === "upcoming" || raw === "recent" ? raw : "live";

  // ─── Tournament Central data ────────────────────────────────────────────────

  type SpotlightGame = {
    topTeamName: string; topTeamSeed: number | null; topScore: number;
    bottomTeamName: string; bottomTeamSeed: number | null; bottomScore: number;
    roundLabel: string; status: string; winnerSlot: string | null;
  };
  type RoundStatus = { label: string; status: "complete" | "active" | "upcoming" };

  let spotlight: SpotlightGame | null = null;
  let roundStatuses: RoundStatus[] = [];
  let womensRoundLabel = "First Round";

  try {
    const supabase = createAdminClient() as any;

    // Men's
    const { data: mensTournament } = await supabase
      .from("tournaments").select("id")
      .eq("sport", "basketball").eq("gender", "mens").eq("season_year", 2025)
      .single();

    if (mensTournament) {
      const { data: mensGames } = await supabase
        .from("tournament_games")
        .select(`status, top_score, bottom_score, winner_slot,
          top_team:tournament_teams!top_team_id(name, seed),
          bottom_team:tournament_teams!bottom_team_id(name, seed),
          round:tournament_rounds!round_id(round_number, name)`)
        .eq("tournament_id", mensTournament.id)
        .order("slot_number");

      if (mensGames?.length > 0) {
        const resolved = mensGames.map((g: any) => ({
          status: g.status as string,
          topScore: g.top_score as number,
          bottomScore: g.bottom_score as number,
          winnerSlot: g.winner_slot as string | null,
          top: (Array.isArray(g.top_team) ? g.top_team[0] : g.top_team) as { name: string; seed: number | null } | null,
          bottom: (Array.isArray(g.bottom_team) ? g.bottom_team[0] : g.bottom_team) as { name: string; seed: number | null } | null,
          round: (Array.isArray(g.round) ? g.round[0] : g.round) as { round_number: number; name: string } | null,
        }));

        const spotlightRaw = resolved
          .filter((g: any) => g.status === "final" || g.status === "live")
          .sort((a: any, b: any) => (b.round?.round_number ?? 0) - (a.round?.round_number ?? 0))[0];

        if (spotlightRaw) {
          spotlight = {
            topTeamName: spotlightRaw.top?.name ?? "TBD",
            topTeamSeed: spotlightRaw.top?.seed ?? null,
            topScore: spotlightRaw.topScore,
            bottomTeamName: spotlightRaw.bottom?.name ?? "TBD",
            bottomTeamSeed: spotlightRaw.bottom?.seed ?? null,
            bottomScore: spotlightRaw.bottomScore,
            roundLabel: spotlightRaw.round?.name ?? "",
            status: spotlightRaw.status,
            winnerSlot: spotlightRaw.winnerSlot,
          };
        }

        const roundMap: Record<number, { label: string; total: number; final: number; live: number }> = {};
        for (const g of resolved) {
          const rn = g.round?.round_number ?? 0;
          if (!roundMap[rn]) roundMap[rn] = { label: g.round?.name ?? "", total: 0, final: 0, live: 0 };
          roundMap[rn].total++;
          if (g.status === "final") roundMap[rn].final++;
          if (g.status === "live") roundMap[rn].live++;
        }
        roundStatuses = Object.entries(roundMap)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([, v]) => ({
            label: v.label,
            status: v.live > 0 ? "active" : v.final === v.total ? "complete" : "upcoming",
          }));
      }
    }

    // Women's
    const { data: womensTournament } = await supabase
      .from("tournaments").select("id")
      .eq("sport", "basketball").eq("gender", "womens").eq("season_year", 2025)
      .single();

    if (womensTournament) {
      const { data: womensGames } = await supabase
        .from("tournament_games")
        .select(`status, round:tournament_rounds!round_id(round_number, name)`)
        .eq("tournament_id", womensTournament.id);

      if (womensGames?.length > 0) {
        const wr = womensGames.map((g: any) => {
          const r = Array.isArray(g.round) ? g.round[0] : g.round;
          return { status: g.status as string, rn: r?.round_number ?? 0, name: r?.name ?? "" };
        });
        const activeLow = wr.filter((g: any) => g.status === "scheduled" || g.status === "live")
          .sort((a: any, b: any) => a.rn - b.rn)[0];
        if (activeLow) {
          womensRoundLabel = activeLow.name;
        } else {
          const highFinal = wr.filter((g: any) => g.status === "final").sort((a: any, b: any) => b.rn - a.rn)[0];
          if (highFinal) womensRoundLabel = highFinal.name;
        }
      }
    }
  } catch {}

  return (
    <div className="grid h-full overflow-hidden grid-cols-[1fr_1fr_18rem] grid-rows-[auto_auto_auto_1fr]">

      {/* ── Row 1, Cols 1-2: Sport Icon Strip ────────────────────────────────
          col-span-2 → occupies columns 1 and 2 only.
          Tournament Central (col-start-3) is unaffected.           ────── */}
      <div
        className="col-span-2 flex gap-2 overflow-x-auto px-4 py-3 border-b border-white/[0.06]"
        style={{ scrollbarWidth: "none" }}
      >
        {sportChips.map((chip) => (
          <button
            key={chip.id}
            className={`flex-1 min-w-[60px] flex flex-col items-center justify-center gap-1.5 h-[64px] rounded-xl border transition-all relative ${
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
      <div className="col-span-2 flex items-center gap-2 px-4 py-2 border-b border-white/[0.06]">
        <span className="flex-shrink-0 text-[9px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant/40">
          My Teams
        </span>
        <div
          className="flex flex-1 items-center gap-1.5 overflow-x-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {placeholderTeams.map((team) => (
            <button
              key={team.abbr}
              className="flex-1 min-w-[72px] flex items-center gap-1.5 rounded-full bg-white/[0.05] px-2 py-1 transition-colors hover:bg-white/[0.09]"
            >
              <div
                className="w-5 h-5 flex-shrink-0 rounded-full flex items-center justify-center text-[8px] font-bold"
                style={{ background: team.bg, color: team.color }}
              >
                {team.abbr}
              </div>
              <span className="truncate text-[10px] font-medium text-on-surface-variant/80">
                {team.label}
              </span>
            </button>
          ))}
          <button className="flex-shrink-0 flex items-center gap-1 rounded-full border border-dashed border-white/[0.12] px-2.5 py-1 text-[10px] text-on-surface-variant/40 transition-colors hover:border-primary/40 hover:text-primary">
            <span className="text-sm font-light leading-none">+</span>
            Add
          </button>
        </div>
        <Link
          href="/dashboard/favorites"
          className="flex-shrink-0 text-[10px] text-primary/60 transition-colors hover:text-primary"
        >
          All Teams →
        </Link>
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
          {spotlight ? (
            <>
              <p className="mb-2.5 text-[10px] text-on-surface-variant/60">
                NCAA Men&apos;s Basketball · {spotlight.roundLabel}
              </p>
              <div className="rounded-xl card-float p-3 border border-white/[0.05]">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-wide text-on-surface-variant/50">Featured</span>
                  <span className="text-[9px] font-medium text-on-surface-variant">{spotlight.roundLabel}</span>
                </div>
                <div className="mb-2 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${spotlight.winnerSlot === "top" ? "font-bold text-on-surface" : "text-on-surface-variant"}`}>
                      {spotlight.topTeamName}{spotlight.topTeamSeed != null ? ` (${spotlight.topTeamSeed})` : ""}
                    </span>
                    <span className={`text-sm tabular-nums ${spotlight.winnerSlot === "top" ? "font-bold text-on-surface" : "text-on-surface-variant"}`}>{spotlight.topScore}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${spotlight.winnerSlot === "bottom" ? "font-bold text-on-surface" : "text-on-surface-variant"}`}>
                      {spotlight.bottomTeamName}{spotlight.bottomTeamSeed != null ? ` (${spotlight.bottomTeamSeed})` : ""}
                    </span>
                    <span className={`text-sm tabular-nums ${spotlight.winnerSlot === "bottom" ? "font-bold text-on-surface" : "text-on-surface-variant"}`}>{spotlight.bottomScore}</span>
                  </div>
                </div>
                <div className="border-t border-white/[0.06] pt-2">
                  <span className="text-[9px] text-on-surface-variant/50 capitalize">{spotlight.status}</span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-[10px] text-on-surface-variant/50">No games available.</p>
          )}
        </div>

        {/* Round Status */}
        <div className="flex-shrink-0 border-b border-white/[0.06] px-4 py-3">
          <p className="mb-2.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant/50">
            Round Status
          </p>
          <div className="space-y-2">
            {roundStatuses.length > 0 ? roundStatuses.map((r) => (
              <div key={r.label} className="flex items-center justify-between py-0.5">
                <span className={`text-[11px] ${r.status === "active" ? "font-semibold text-on-surface" : "text-foreground/70"}`}>
                  {r.label}
                </span>
                <span className={`text-[10px] ${r.status === "active" ? "font-semibold text-sports-green" : r.status === "complete" ? "text-foreground/70" : "text-foreground/70"}`}>
                  {r.status === "active" ? "In Progress" : r.status === "complete" ? "Complete" : "Upcoming"}
                </span>
              </div>
            )) : <p className="text-[10px] text-on-surface-variant/40">No data</p>}
          </div>
        </div>

        {/* Other Active */}
        <div className="flex-shrink-0 border-b border-white/[0.06] px-4 py-3">
          <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant/50">
            Other Active
          </p>
          <div className="space-y-0.5">
            {[
              { name: "NCAA Women's Basketball", round: womensRoundLabel  },
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
      <div className="flex flex-col gap-4 overflow-y-auto p-3 bg-white/[0.04]">

        {activeTab === "live" && liveGames.slice(0, 2).map((game) => (
          <Link key={game.id} href="/dashboard/scores" className={CARD}>
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-[9px] font-semibold uppercase tracking-wider text-on-surface-variant/80">
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
            <div className="my-auto flex flex-col gap-1.5">

              {/* Game clock */}
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-[11px] font-bold tabular-nums text-on-surface">12:24</span>
                <span className="text-xs text-foreground/70">·</span>
                <span className="text-xs text-foreground/70">2nd Qtr</span>
              </div>

              {/* Team rows with inline records */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 flex-shrink-0 rounded-full bg-white/[0.08] border border-white/[0.1]" />
                    <span className="truncate pr-2 text-base font-bold text-foreground">
                      {game.home}
                      <span className="ml-1 text-[9px] font-normal text-on-surface-variant/40">(25-8)</span>
                    </span>
                  </div>
                  <span className="flex-shrink-0 text-2xl font-bold tabular-nums text-foreground">{game.homeScore}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 flex-shrink-0 rounded-full bg-white/[0.08] border border-white/[0.1]" />
                    <span className="truncate pr-2 text-base font-semibold text-foreground">
                      {game.away}
                      <span className="ml-1 text-[9px] text-on-surface-variant/30">(22-11)</span>
                    </span>
                  </div>
                  <span className="flex-shrink-0 text-2xl font-bold tabular-nums text-foreground">{game.awayScore}</span>
                </div>
              </div>

              {/* Quarter breakdown */}
              <div className="rounded-lg bg-white/[0.03] px-2 py-1.5">
                <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr] text-center text-xs">
                  <span className="text-on-surface-variant/30" />
                  <span className="text-foreground/70">Q1</span>
                  <span className="text-foreground/70">Q2</span>
                  <span className="text-foreground/70">Q3</span>
                  <span className="text-foreground/70">Q4</span>
                  <span className="text-foreground/70">T</span>

                  <span className="text-[9px] font-medium text-foreground">AUB</span>
                  <span className="tabular-nums text-foreground">18</span>
                  <span className="tabular-nums text-foreground">21</span>
                  <span className="tabular-nums text-foreground">16</span>
                  <span className="tabular-nums text-foreground">15</span>
                  <span className="tabular-nums font-bold text-on-surface">70</span>

                  <span className="text-[9px] font-medium text-foreground">MSU</span>
                  <span className="tabular-nums text-foreground">14</span>
                  <span className="tabular-nums text-foreground">18</span>
                  <span className="tabular-nums text-foreground">17</span>
                  <span className="tabular-nums text-foreground">15</span>
                  <span className="tabular-nums font-bold text-foreground">64</span>
                </div>
              </div>

              {/* Venue + broadcast */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground/70">Viejas Arena · San Diego, CA</span>
                <span className="rounded px-1.5 py-0.5 text-[8px] font-bold bg-sports-blue/20 text-sports-blue">
                  ESPN
                </span>
              </div>

              {/* Key stats */}
              <div className="rounded-lg bg-white/[0.03] px-2 py-1.5">
                <div className="mb-1 grid grid-cols-[auto_1fr_1fr_1fr_1fr] text-xs text-foreground/70">
                  <span />
                  <span className="text-center">FG%</span>
                  <span className="text-center">3P%</span>
                  <span className="text-center">REB</span>
                  <span className="text-center">TO</span>
                </div>
                <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr] text-xs">
                  <span className="text-foreground">AUB</span>
                  <span className="tabular-nums text-center text-foreground">48.2</span>
                  <span className="tabular-nums text-center text-foreground">38.5</span>
                  <span className="tabular-nums text-center text-foreground">32</span>
                  <span className="tabular-nums text-center text-foreground">11</span>
                </div>
                <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr] text-xs">
                  <span className="text-foreground">MSU</span>
                  <span className="tabular-nums text-center text-foreground">41.7</span>
                  <span className="tabular-nums text-center text-foreground">32.1</span>
                  <span className="tabular-nums text-center text-foreground">28</span>
                  <span className="tabular-nums text-center text-foreground">14</span>
                </div>
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
              <span className="text-[9px] font-semibold uppercase tracking-wider text-on-surface-variant/80">
                {game.league}
              </span>
              <span className="text-[9px] text-on-surface-variant/70">{game.time}</span>
            </div>
            <div className="my-auto flex flex-col gap-1.5">
              <p className="text-sm font-semibold text-on-surface">{game.home}</p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant/30">vs</p>
              <p className="text-sm text-on-surface-variant">{game.away}</p>
            </div>
          </Link>
        ))}

        {activeTab === "recent" && recentGames.slice(0, 2).map((game) => (
          <Link key={game.id} href="/dashboard/scores" className={CARD}>
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-[9px] font-semibold uppercase tracking-wider text-on-surface-variant/80">
                {game.league}
              </span>
              <span className="text-xs text-foreground/70">Final</span>
            </div>
            <div className="my-auto flex flex-col gap-1.5">
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
      <div className="flex flex-col gap-4 overflow-y-auto p-3 bg-white/[0.04]">

        {activeTab === "live" && liveGames.slice(2, 4).map((game) => (
          <Link key={game.id} href="/dashboard/scores" className={CARD}>
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-[9px] font-semibold uppercase tracking-wider text-on-surface-variant/80">
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
            <div className="my-auto flex flex-col gap-1.5">

              {/* Game clock */}
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-[11px] font-bold tabular-nums text-on-surface">12:24</span>
                <span className="text-xs text-foreground/70">·</span>
                <span className="text-xs text-foreground/70">2nd Qtr</span>
              </div>

              {/* Team rows with inline records */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 flex-shrink-0 rounded-full bg-white/[0.08] border border-white/[0.1]" />
                    <span className="truncate pr-2 text-base font-bold text-foreground">
                      {game.home}
                      <span className="ml-1 text-[9px] font-normal text-on-surface-variant/40">(25-8)</span>
                    </span>
                  </div>
                  <span className="flex-shrink-0 text-2xl font-bold tabular-nums text-foreground">{game.homeScore}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 flex-shrink-0 rounded-full bg-white/[0.08] border border-white/[0.1]" />
                    <span className="truncate pr-2 text-base font-semibold text-foreground">
                      {game.away}
                      <span className="ml-1 text-[9px] text-on-surface-variant/30">(22-11)</span>
                    </span>
                  </div>
                  <span className="flex-shrink-0 text-2xl font-bold tabular-nums text-foreground">{game.awayScore}</span>
                </div>
              </div>

              {/* Quarter breakdown */}
              <div className="rounded-lg bg-white/[0.03] px-2 py-1.5">
                <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr] text-center text-xs">
                  <span className="text-on-surface-variant/30" />
                  <span className="text-foreground/70">Q1</span>
                  <span className="text-foreground/70">Q2</span>
                  <span className="text-foreground/70">Q3</span>
                  <span className="text-foreground/70">Q4</span>
                  <span className="text-foreground/70">T</span>

                  <span className="text-[9px] font-medium text-foreground">AUB</span>
                  <span className="tabular-nums text-foreground">18</span>
                  <span className="tabular-nums text-foreground">21</span>
                  <span className="tabular-nums text-foreground">16</span>
                  <span className="tabular-nums text-foreground">15</span>
                  <span className="tabular-nums font-bold text-on-surface">70</span>

                  <span className="text-[9px] font-medium text-foreground">MSU</span>
                  <span className="tabular-nums text-foreground">14</span>
                  <span className="tabular-nums text-foreground">18</span>
                  <span className="tabular-nums text-foreground">17</span>
                  <span className="tabular-nums text-foreground">15</span>
                  <span className="tabular-nums font-bold text-foreground">64</span>
                </div>
              </div>

              {/* Venue + broadcast */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground/70">Viejas Arena · San Diego, CA</span>
                <span className="rounded px-1.5 py-0.5 text-[8px] font-bold bg-sports-blue/20 text-sports-blue">
                  ESPN
                </span>
              </div>

              {/* Key stats */}
              <div className="rounded-lg bg-white/[0.03] px-2 py-1.5">
                <div className="mb-1 grid grid-cols-[auto_1fr_1fr_1fr_1fr] text-xs text-foreground/70">
                  <span />
                  <span className="text-center">FG%</span>
                  <span className="text-center">3P%</span>
                  <span className="text-center">REB</span>
                  <span className="text-center">TO</span>
                </div>
                <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr] text-xs">
                  <span className="text-foreground">AUB</span>
                  <span className="tabular-nums text-center text-foreground">48.2</span>
                  <span className="tabular-nums text-center text-foreground">38.5</span>
                  <span className="tabular-nums text-center text-foreground">32</span>
                  <span className="tabular-nums text-center text-foreground">11</span>
                </div>
                <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr] text-xs">
                  <span className="text-foreground">MSU</span>
                  <span className="tabular-nums text-center text-foreground">41.7</span>
                  <span className="tabular-nums text-center text-foreground">32.1</span>
                  <span className="tabular-nums text-center text-foreground">28</span>
                  <span className="tabular-nums text-center text-foreground">14</span>
                </div>
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
              <span className="text-[9px] font-semibold uppercase tracking-wider text-on-surface-variant/80">
                {game.league}
              </span>
              <span className="text-[9px] text-on-surface-variant/70">{game.time}</span>
            </div>
            <div className="my-auto flex flex-col gap-1.5">
              <p className="text-sm font-semibold text-on-surface">{game.home}</p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant/30">vs</p>
              <p className="text-sm text-on-surface-variant">{game.away}</p>
            </div>
          </Link>
        ))}

        {activeTab === "recent" && recentGames.slice(2, 4).map((game) => (
          <Link key={game.id} href="/dashboard/scores" className={CARD}>
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-[9px] font-semibold uppercase tracking-wider text-on-surface-variant/80">
                {game.league}
              </span>
              <span className="text-xs text-foreground/70">Final</span>
            </div>
            <div className="my-auto flex flex-col gap-1.5">
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
