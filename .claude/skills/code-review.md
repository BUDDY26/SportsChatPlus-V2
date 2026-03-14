# Skill: code-review

Review staged or specified changes for correctness, security, and consistency with SportsChatPlus-V2 conventions. Do not modify any code. Output a structured review report.

---

## Invocation

If the user specifies files or a diff, review those. Otherwise review all staged changes via `git diff --cached` and unstaged changes via `git diff`.

---

## Review Checklist

### Router placement
- API handlers belong in `pages/api/` — Pages Router pattern with `(req: NextApiRequest, res: NextApiResponse)` signature
- Page components belong in `app/` — App Router pattern
- Flag any new file in `app/api/` or any RSC being used as an API handler

### Auth guard (API routes)
Every handler in `pages/api/` that accesses user data must:
- Validate the user session via NextAuth (`getServerSession`) or Supabase token before any DB operation
- Return `401` if the session or token is absent or invalid
- Perform no DB operations before the auth check passes

Flag any route that reads `req.body` or queries Supabase before verifying auth.

### Environment variable access
- Server-only keys (`OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXTAUTH_SECRET`, etc.) must never appear in client-side code (`'use client'` components, hooks, or files under `app/` that are not Server Components)
- `NEXT_PUBLIC_` variables are intentionally public — no flag needed
- Flag any non-public env var referenced in a client-side file

### Protected area guards
Flag any changes to:
- `components/ui/` — shadcn/ui primitives, never hand-edit
- `lib/supabase.ts` — only touch if explicitly asked
- `lib/auth.ts` — only touch if explicitly asked
- `supabase/migrations/` — DDL changes must be confirmed by user before applying

### TypeScript hygiene
- No `any` without a documented reason
- No `@ts-ignore` without a documented reason
- New interfaces and types belong in `lib/sports/types.ts` or a clearly scoped types file

### Migration safety
For any new file in `supabase/migrations/`:
- A matching `_rollback.sql` should exist
- DDL should use `IF NOT EXISTS` / `IF EXISTS` guards
- FKs should use `ON DELETE RESTRICT` unless there is a documented reason otherwise
- Flag any migration without a rollback file

### Odds and NCAA stubs
- `pages/api/odds/by-game.ts` returns mock data — changes here should not be flagged as bugs
- NCAA routes returning empty or stub data are expected — flag only if a stub breaks the response shape contract

### Old team codebase contamination
Flag any pattern, file name, or structure that appears to have been copied from the old team SportsChatPlus repo rather than developed cleanly for V2. V2 is a clean rebuild; the old version is reference-only.

---

## Output Format

```
## Code Review — [date]

### Router placement
[PASS / FLAG: description]

### Auth guards
[PASS / FLAG: description]

### Environment variable access
[PASS / FLAG: description]

### Protected area guards
[PASS / FLAG: description]

### TypeScript hygiene
[PASS / FLAG: description]

### Migration safety
[PASS / N/A / FLAG: description]

### Stubs (odds, NCAA)
[PASS / FLAG: description]

### V2 cleanliness
[PASS / FLAG: description]

### Summary
[Overall: PASS / NEEDS ATTENTION]
[List of flags, if any]
```
