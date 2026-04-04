# SportsChatPlus-V2

A sports intelligence platform combining real-time scores, AI-generated analysis, live betting odds, and fan community discussion in a single authenticated dashboard.

---

## Overview

SportsChatPlus is built for fans who want more than a scoreboard. It pulls live game data across professional and NCAA leagues, generates AI-powered game analysis, surfaces betting lines from major sportsbooks, and connects fans through a real-time community chat — all behind a single authenticated dashboard.

The platform uses a hybrid Next.js router architecture: App Router for all UI pages, Pages Router for all API route handlers. The backend is Supabase (PostgreSQL + Realtime). AI features are powered by OpenAI GPT-4o-mini.

---

## Features

- **Real-time sports scores** — Live and scheduled game data for NFL, NBA, MLB, NCAAF, NCAAB (Men & Women), NCAA Baseball, and NCAA Softball
- **Live betting odds** — Spreads, moneylines, and totals from The Odds API
- **AI-powered insights** — GPT-4o-mini analysis of standings, matchups, and trends per league
- **AI chat** — Context-aware sports Q&A powered by OpenAI
- **Community chat** — Real-time fan discussion via Supabase Realtime subscriptions
- **NCAA tournament bracket** — Visual bracket with client-side winner propagation; live data synced from the Henry NCAA API via `scripts/sync-tournament.ts`
- **User authentication** — Email/password login and signup via NextAuth and Supabase
- **Favorites tracking** — Save and manage favorite teams across any supported league
- **User profile** — Update display name with live session refresh
- **Dark/light theme** — System-aware with manual toggle

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router + Pages Router) |
| Language | TypeScript (strict mode) |
| Database | Supabase (PostgreSQL + Realtime) |
| Authentication | NextAuth v4 (CredentialsProvider → Supabase) |
| Styling | Tailwind CSS + shadcn/ui |
| AI | OpenAI SDK (gpt-4o-mini) |
| Sports Data | BallDontLie API (NBA/NFL/MLB), Henry NCAA API (NCAA) |
| Odds Data | The Odds API |
| Deployment | Vercel |

---

## Architecture

### Router Split

App Router (`app/`) handles all UI pages and layouts. Pages Router (`pages/api/`) handles all API route handlers. These never mix — no routes exist under `app/api/`.

### External Data Flow

External sports data is fetched server-side in API route handlers. Client components consume data through custom hooks (`useScores`, `useAIInsights`, `useFavorites`, `useChat`). All Supabase reads use the anon client; writes requiring elevated permissions use the service role client. All external fetches apply AbortController with a 5-second timeout. All `by-league` API calls catch upstream failures and return HTTP 200 with an empty array rather than 500.

### Tournament Bracket System

The bracket stores all 63 game slots per tournament as scaffold rows in `tournament_games`. The sync script (`scripts/sync-tournament.ts`) matches each incoming Henry NCAA API game to an existing scaffold row by `tournament_id + round_id + region_id + slot_number` and UPDATEs it with live data. It never inserts new game rows.

Bracket progression is encoded in two columns:

- `next_game_id` — UUID of the game this game's winner advances to (stored as TEXT to avoid self-referencing FK constraint violations)
- `fills_top_in_next` — `true` if this winner fills the top slot in the next game; `false` for bottom; `NULL` for the Championship

Client-side winner propagation (`TournamentClientWrapper.tsx`) traverses the `next_game_id` graph, using `fills_top_in_next` to place winners in the correct bracket slot.

### Supabase Realtime

`tournament_games` is published to `supabase_realtime` (Migration 006). The client subscribes to `postgres_changes` on `UPDATE` events filtered by `tournament_id`. A 30-second polling interval runs as a fallback when live games are detected.

---

## Repository Structure

```text
SportsChatPlus-V2/
├── app/                             # App Router — all UI pages
│   ├── (auth)/
│   │   ├── dashboard/               # Authenticated dashboard pages
│   │   │   ├── ai-insights/         # AI insights page
│   │   │   ├── chat/                # Community chat page
│   │   │   ├── favorites/           # Favorites page
│   │   │   ├── odds/                # Odds page
│   │   │   ├── scores/              # Scores page
│   │   │   ├── tournament/          # Tournament bracket page
│   │   │   └── profile/             # User profile page
│   │   ├── login/                   # Login page
│   │   └── signup/                  # Signup page
│   ├── about/, contact/, privacy/, terms/  # Public pages
│   └── page.tsx                     # Landing page
├── pages/api/                       # Pages Router — all API routes
│   ├── ai/                          # chat.ts, insights.ts
│   ├── auth/                        # [...nextauth].ts
│   ├── chat/                        # messages.ts, send.ts
│   ├── favorites/                   # index.ts
│   ├── odds/                        # by-game.ts
│   ├── profile/                     # index.ts
│   ├── scores/                      # by-league.ts, live.ts
│   └── tournament/                  # bracket.ts
├── components/                      # React components by domain
├── hooks/                           # useScores, useChat, useAIInsights, useFavorites
├── lib/
│   ├── auth.ts                      # NextAuth config
│   ├── supabase.ts                  # Supabase client (anon + service role)
│   ├── ai/                          # OpenAI chat and insights
│   └── sports/                      # BallDontLie, Henry NCAA, shared types
├── scripts/
│   ├── sync-tournament.ts           # Tournament sync (Henry NCAA API → Supabase)
│   └── run-sync-tournament.ps1      # PowerShell wrapper for sync script
├── supabase/
│   ├── migrations/                  # DDL files 001–009
│   └── seeds/                       # seed_001_tournaments.sql
├── AI-WORKFLOW/                     # Structured QA workflow using AI prompts
│   ├── agents/QA-AGENT.md           # QA agent role definition
│   └── prompts/                     # Audit and fix-verification prompt files
└── docs/                            # Architecture, implementation plan, QA, evidence ledger
```

---

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in values:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# NextAuth
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

# OpenAI
OPENAI_API_KEY=

# Sports Data APIs
BALLDONTLIE_API_KEY=
THE_ODDS_API_KEY=

# Optional: OAuth Providers
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

Production values are managed in the Vercel dashboard. Never commit `.env.local`.

---

## Setup

```bash
npm install
npm run dev
```

All environment variables must be configured and Supabase migrations applied before the app will function correctly. See the Database Migrations section below.

---

## Database Migrations

Apply migrations manually via the Supabase SQL editor in the order listed. Never auto-run.

| Migration | File | Status |
|---|---|---|
| 001 | `001_users_profiles.sql` | Applied |
| 002 | `002_favorites.sql` | Applied |
| 003 | `003_chat_messages.sql` | Applied |
| 004 | `004_ai_interactions.sql` | Applied |
| 005 | `005_chat_realtime_policy.sql` | Applied |
| 006 | `006_tournament.sql` | Applied |
| 007 | `007_tournament_external_ids.sql` | Applied |
| 008 | `008_tournament_fills_top.sql` | Pending |
| 009 | `009_tournament_bracket_scaffold.sql` | Pending |

`005_chat_realtime_policy_rollback.sql` is a rollback file for Migration 005. Do not run it during normal setup.

Migrations 008 and 009 must be applied before running `scripts/sync-tournament.ts`. Without them, the `fills_top_in_next` column does not exist and the bracket scaffold is absent.

---

## Running the App

```bash
# Development server
npm run dev

# Production build
npm run build

# Type check
npm run typecheck

# Lint
npm run lint
```

### Tournament Sync

To sync live NCAA tournament data from the Henry NCAA API into Supabase:

```bash
npm run sync:tournament
```

Migrations 008 and 009 must be applied first. The script updates existing scaffold rows only — it never creates new game rows.

---

## API Surface

All API routes live under `pages/api/`. No routes exist under `app/api/`.

| Route | Method | Description |
|---|---|---|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth authentication handler |
| `/api/ai/chat` | POST | AI sports chat (OpenAI gpt-4o-mini) |
| `/api/ai/insights` | GET | AI-generated league insights |
| `/api/chat/messages` | GET | Fetch community chat messages |
| `/api/chat/send` | POST | Send a community chat message |
| `/api/favorites` | GET/POST/DELETE | Manage user favorite teams |
| `/api/odds/by-game` | GET | Betting odds for a specific game |
| `/api/profile` | GET/PATCH | User profile read and update |
| `/api/scores/by-league` | GET | Game scores filtered by league |
| `/api/scores/live` | GET | Live game scores |
| `/api/tournament/bracket` | GET | Tournament bracket data |

---

## Current Constraints

- **Tournament bracket API serves static mock data.** `pages/api/tournament/bracket.ts` returns hardcoded mock game data. The Supabase query pathway that replaces it is a pending implementation phase.
- **The Odds API is not fully wired.** The `THE_ODDS_API_KEY` environment variable is required, but odds data integration is noted in `docs/architecture.md` as planned rather than complete.
- **Migrations 008 and 009 are pending.** The `fills_top_in_next` column and the full bracket scaffold do not exist in Supabase until these migrations are applied manually.
- **Client-side bracket propagation uses a mock-data fallback.** `propagateWinners()` in `TournamentClientWrapper.tsx` falls back to `game.slot % 2 === 1` when `fillsTop` is null. This fallback is only valid for mock data and is structurally incorrect for R4 games in live data.

---

## Documentation

| File | Description |
|---|---|
| `docs/architecture.md` | Router split, bracket data model, external data sources, Supabase Realtime |
| `docs/implementation-plan.md` | Tournament bracket fix — phases, verification queries |
| `docs/evidence-ledger.md` | Migration status, schema notes, key implementation decisions |
