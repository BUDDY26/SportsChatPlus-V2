# Skill: entry-protocol

Perform a structured repository entry scan at the start of a new session or when re-orienting after a long break. Do not modify any code. Output a structured report only.

---

## Steps

### 1. Git state
- Run `git status` and `git log --oneline -10`.
- Note current branch, any uncommitted changes, and the shape of recent commits.
- Flag anything unexpected (untracked migration files, staged changes, detached HEAD).

### 2. Router split integrity check
- Confirm API routes exist only under `pages/api/` — not under `app/api/`.
- Confirm `app/(auth)/dashboard/` exists (primary authenticated section).
- Confirm `components/ui/` is present and untouched (shadcn/ui primitives).

### 3. Migration status check
- List all files under `supabase/migrations/`.
- Cross-reference against the migration status table in `CLAUDE.md`.
- Flag any migration files not reflected in `CLAUDE.md`.

### 4. Environment template check
- Confirm `.env.local.example` is present.
- Do NOT read or output the contents of `.env`, `.env.local`, or any real secret file.

### 5. Protected files presence check
Confirm these files exist (do not read contents unless the task requires it):
- `lib/supabase.ts`
- `lib/auth.ts`
- `lib/sports/types.ts`
- `lib/database.types.ts`
- `types/next-auth.d.ts`

### 6. Odds / NCAA stub check
- Confirm `pages/api/odds/by-game.ts` exists (mock odds — not yet wired to The Odds API).
- Note that NCAA data source is TODO — BallDontLie covers NBA/NFL/MLB only.
- Do not flag these as bugs; they are known stubs.

### 7. Summary report

Output the following sections:

- **Git state**: branch, clean/dirty, last commit
- **Open tasks from MEMORY.md**: list any items marked as not yet applied or not yet done
- **Flags**: anything unexpected found in steps 1–6
- **Known stubs**: mock odds, NCAA data — present, expected
- **Ready to proceed**: yes/no, and why if no

---

## What Not To Do
- Do not run the dev server.
- Do not run migration scripts.
- Do not modify any file.
- Do not copy patterns from the old team SportsChatPlus repo — V2 is the source of truth.
