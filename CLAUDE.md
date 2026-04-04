# SportsChatPlus-V2 — Claude Code Instructions

## Project Identity

**SportsChatPlus-V2** is the clean rebuild of the original SportsChatPlus team project.
Developer: Ruben Aleman (@BUDDY26). Course: CSCI 6370 — UTRGV.
Deployed at Vercel. Database/backend: Supabase.

**The old team version is reference-only.** Do not copy patterns, structure, or decisions from the old version unless explicitly instructed. V2 is the source of truth. When in doubt, follow the architecture established here.

---

## External Orchestration Boundary

Claude Cowork is the orchestration layer and controls:

- **WHAT** tasks are executed
- **WHEN** tasks are executed
- Project selection and workflow state

This repository controls:

- **HOW** tasks are implemented
- Local architecture, constraints, and rules

Claude must follow:

- Cowork for execution flow and task control
- Repo CLAUDE.md for implementation constraints

Cowork does NOT override repository implementation rules.

---

## Package Manager

**npm only.** `package-lock.json` is the lock file. Do not use bun, pnpm, or yarn.

---

## Architecture — Router Split

This project uses **two routers simultaneously**:

| Router | Location | Purpose |
|---|---|---|
| App Router | `app/` | All pages (RSC + client components) |
| Pages Router | `pages/api/` | All API routes — never move these |

Never create API routes under `app/api/`. All backend handlers live in `pages/api/`.

---

## Key Files

| File | Role |
|---|---|
| `lib/supabase.ts` | Supabase client (anon + service role) — do not restructure |
| `lib/auth.ts` | NextAuth v4 config — CredentialsProvider → Supabase |
| `lib/sports/types.ts` | All TypeScript interfaces: GameScore, OddsGame, ChatMessageType, AIInsight, FavoriteTeam |
| `lib/sports/balldontlie.ts` | BallDontLie API client — NBA/NFL/MLB live data |
| `lib/ai/chat.ts` | OpenAI-powered chat |
| `lib/ai/predictions.ts` | OpenAI-powered AI predictions |
| `lib/database.types.ts` | Supabase DB types — regenerate with Supabase CLI, do not hand-edit |
| `types/next-auth.d.ts` | Session type extension — adds `id` to session.user and JWT |
| `supabase/migrations/` | DDL only — irreversible, apply manually in Supabase dashboard |
| `.env.local.example` | Environment variable template |

---

## Protected Areas — Ask Before Touching

| Area | Why |
|---|---|
| `lib/supabase.ts` | Auth + DB client |
| `lib/auth.ts` | NextAuth config — auth flow |
| `pages/api/` | All API handlers |
| `components/ui/` | shadcn/ui primitives — auto-generated, never hand-edit |
| `supabase/migrations/` | Applied DDL cannot be rolled back safely without rollback scripts |
| `app/(auth)/` | Auth group layout and session gate |
| `.env.local` | Real secrets — never read aloud, never commit |

---

## Leagues

Defined in `lib/sports/types.ts` as `LEAGUES` const array and `LeagueId` type.

```
NFL, NBA, MLB, NCAAF, NCAAB_MEN, NCAAB_WOMEN, NCAA_BASEBALL, NCAA_SOFTBALL
```

NCAA data source: TODO — not yet implemented. BallDontLie covers NBA/NFL/MLB only.

---

## Odds

`pages/api/odds/by-game.ts` currently returns mock data.
Swap for The Odds API when ready — do not break the response shape.

---

## Environment Variables

Template: `.env.local.example` — copy to `.env.local` for local dev.
Vercel dashboard holds production values. Never commit `.env` or `.env.local`.

Required keys:
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — admin operations only (bypasses RLS)
- `NEXTAUTH_SECRET` / `NEXTAUTH_URL`
- `OPENAI_API_KEY` — AI chat and predictions

---

## Database Migrations

Migrations live in `supabase/migrations/` — applied manually via the Supabase SQL editor.
Never auto-run migrations. Always confirm with user before applying SQL to Supabase.

| Migration | Status |
|---|---|
| `001_*` | Applied |
| `002_*` | Applied |
| `003_*` | Applied |
| `004_*` | Applied |

---

## Coding Conventions

- TypeScript strict — no `any` without justification
- API routes: Pages Router pattern — `(req: NextApiRequest, res: NextApiResponse)` signature
- No API routes under `app/api/`
- Client components use `'use client'` directive; server-only env vars never in client files
- `NEXT_PUBLIC_` variables are intentionally public — all others are server-only

---

## No Test Suite

There is no test suite configured in V2 yet. Do not assume tests exist.
CI gates on `npm run lint` and `npm run typecheck` only.
When a test framework is added, update `CLAUDE.md`, `docs/tooling.md`, and `.github/workflows/ci.yml`.

---

## Project Documentation

The `docs/` folder contains the original SportsChat+ team deliverables. Use these as reference material when rebuilding features in V2 — they describe intended behavior, data models, and architecture decisions from the original project.

| File | Contents |
|---|---|
| `Sports Chat Plus Proposal Working Copy .pdf` | Original project proposal — feature scope, goals, team responsibilities |
| `Sports Chat Plus Final Report .pdf` | Final report — full feature description, implementation summary |
| `SportsChatPlus Logical Design.docx` | Logical data model — entity relationships, schema decisions |
| `SportsChatPlus_Tech_FAQ_and_Architecture.pdf` | Architecture notes and technical Q&A from the original build |
| `SportsChatPlus_Tech_QA_Summary.pdf` | Technical QA summary from the original project |
| `SportsChat_Presentation_Talking_Points.pdf` | Presentation talking points — high-level feature walkthrough |

These are read-only reference documents. Do not modify them.
The old team codebase is **not** the source of truth for V2 implementation — use these documents for feature intent and data design only, then implement cleanly in V2.

---

## What Not To Do

- Do not copy patterns from the old team SportsChatPlus repo — V2 is a clean rebuild
- Do not refactor application code unless explicitly asked
- Do not add features beyond what is requested
- Do not rename files or move directories without explicit instruction
- Do not modify `components/ui/` files
- Do not run migration scripts or DB-writing scripts without explicit user approval
- Do not push to remote or create PRs without explicit user instruction
- Do not add docstrings or comments to code you did not change
- Do not create API routes under `app/api/`
- Do not switch package managers

---

<!-- TEMPLATE-MIRROR:SECTION12:START -->
## 12. Agent Operating Constraints

These are mandatory operating constraints for Claude Code to prevent context loss, silent truncation errors, incorrect edits, incomplete search results, and unsafe multi-file execution. They apply to **all repositories** instantiated from this template.

### 12.1 Dead Code First

Before any structural refactor on large files:

- Remove unused imports, exports, props, and debug logs
- Perform cleanup as a separate change set
- Do NOT combine cleanup and refactor in the same pass

### 12.2 Batched Execution

For tasks touching multiple files:

- Break work into small batches (max ~5 files per batch)
- Complete and verify each batch before continuing
- State the batch plan before starting so the user can confirm grouping

### 12.3 Context Decay Awareness

- Do NOT rely on memory of file contents after long conversations
- Re-read files before editing when uncertain
- If context compaction may have fired, say so explicitly

### 12.4 File Read Limits

- Large files may be silently truncated when read
- Read files in chunks when necessary (state chunk boundaries explicitly)
- Never assume full file visibility from a single read

### 12.5 Tool Result Awareness

- Search results may be incomplete due to truncation
- Re-run searches with narrower scope if results look suspiciously small
- Never treat a small result set as definitively complete without scoped verification

### 12.6 Edit Integrity

For every edit:

1. Read the file immediately before editing
2. Apply the change
3. Re-read the file after editing to confirm the change applied correctly

If a re-read reveals the edit did not apply, diagnose the mismatch before retrying.

### 12.7 No Semantic Assumptions

- Search tools perform text matching only — not semantic code understanding
- Do NOT assume a single search caught all references
- On any rename, signature change, or symbol deletion: check direct calls, type references, string literals, dynamic imports, re-exports, test files, and config files separately

### 12.8 Rule Suspension

If the user explicitly states **"suspend rule X for this session"**, that rule is temporarily inactive until the user says **"restore rules"** or a new session begins. Rules may only be suspended by the user — do not self-suspend a rule because it is inconvenient.

<!-- TEMPLATE-MIRROR:SECTION12:END -->

---

<!-- TEMPLATE-MIRROR:FOOTER:START -->
*Last updated by Claude: `2026-04-01`*
*Entry protocol completed: `no`*
<!-- TEMPLATE-MIRROR:FOOTER:END -->
