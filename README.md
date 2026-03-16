# SportsChatPlus-V2

A sports intelligence platform combining real-time scores, AI-generated analysis, live betting odds, and fan community discussion in a single dashboard.

---

## Overview

SportsChatPlus is built for fans who want more than a scoreboard. It pulls live game data across professional and NCAA leagues, generates AI-powered game analysis, surfaces betting lines from major sportsbooks, and connects fans through a real-time community chat — all behind a single authenticated dashboard.

---

## Features

- **Real-time sports scores** — Live and scheduled game data for NFL, NBA, MLB, NCAAF, NCAAB (Men & Women), NCAA Baseball, and NCAA Softball
- **Live betting odds** — Spreads, moneylines, and totals from The Odds API across supported leagues
- **AI-powered insights** — GPT-4o-mini analysis of current standings, matchups, and trends per league
- **AI chat** — Ask sports questions and get context-aware answers powered by OpenAI
- **Community chat** — Real-time fan discussion backed by Supabase Realtime subscriptions
- **User authentication** — Email/password login and signup via NextAuth and Supabase
- **Favorites tracking** — Save and manage favorite teams across any supported league
- **User profile** — Update display name with live session refresh
- **Dark/light theme** — System-aware with manual toggle

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router + Pages Router API routes) |
| Language | TypeScript (strict mode) |
| Database | Supabase (PostgreSQL + Realtime) |
| Authentication | NextAuth v4 (CredentialsProvider → Supabase) |
| Styling | Tailwind CSS + shadcn/ui |
| AI | OpenAI SDK (gpt-4o-mini) |
| Sports Data | BallDontLie API (NBA/NFL/MLB), Henry's NCAA API (NCAA) |
| Odds Data | The Odds API |
| Deployment | Vercel |

---

## Architecture

```
app/                  # App Router — all UI pages
pages/api/            # Pages Router — all API routes
lib/
  auth.ts             # NextAuth config
  supabase.ts         # Supabase client (anon + service role)
  ai/                 # OpenAI chat and insights
  sports/             # BallDontLie, Henry NCAA, shared types
components/           # React components (dashboard, scores, chat, AI, etc.)
hooks/                # useScores, useChat, useAIInsights, useFavorites
supabase/migrations/  # Applied DDL (profiles, favorites, chat, AI log)
```

API routes never appear under `app/api/` — all backend handlers live in `pages/api/`.

---

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in values:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
OPENAI_API_KEY=
BALLDONTLIE_API_KEY=
THE_ODDS_API_KEY=
```

Production values are managed in the Vercel dashboard. Never commit `.env.local`.

---

## Getting Started

```bash
npm install
npm run dev
```

Apply Supabase migrations in order (001 → 005) via the Supabase SQL editor before first run.

---

## Developer

Ruben Aleman — CSCI 6370, UTRGV
