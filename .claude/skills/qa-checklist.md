# Skill: qa-checklist

A pre-commit / pre-PR quality gate for SportsChatPlus-V2. Run through every item before marking any task complete. Do not skip items because a change "seems small."

---

## Run This Checklist

Work through each section in order. For each item: PASS, FAIL (with detail), or N/A (with reason).

---

### 1. TypeScript

```bash
npm run typecheck
```

- [ ] Zero type errors
- [ ] No `@ts-ignore` or `as any` added without a documented reason

Note: Next.js `next build` may suppress TS errors — always run `tsc --noEmit` explicitly.

---

### 2. Lint

```bash
npm run lint
```

- [ ] Zero ESLint errors
- [ ] No new lint disable comments added without reason

---

### 3. Tests

No test suite is configured yet. When one is added, this section becomes:

```bash
npm test
```

- [ ] All tests pass
- [ ] Suite and test counts have not decreased
- [ ] New routes and lib functions have corresponding tests

Until then: N/A — skip this section.

---

### 4. Auth guards

For every new or modified file in `src/pages/api/` that accesses user data:

- [ ] Session or token validated before any DB operation
- [ ] `401` returned if session/token is absent or invalid
- [ ] No DB reads or writes occur before the auth check

---

### 5. Environment variables

- [ ] No new server-only env vars referenced in client-side code
- [ ] If a new env var was added, `.env.local.example` has been updated with the key (empty value)

---

### 6. Migration hygiene

For any new file in `supabase/migrations/`:

- [ ] Matching `_rollback.sql` exists
- [ ] DDL uses `IF NOT EXISTS` / `IF EXISTS` guards
- [ ] FKs use `ON DELETE RESTRICT` (or deviation is documented)
- [ ] `CLAUDE.md` migration status table updated
- [ ] Migration has NOT been auto-applied — user was asked first

---

### 7. Router placement

- [ ] No new files added under `app/api/`
- [ ] All new API handlers follow Pages Router pattern (`(req: NextApiRequest, res: NextApiResponse)`)
- [ ] All new pages follow App Router pattern under `app/`

---

### 8. Protected areas

- [ ] `components/ui/` files untouched
- [ ] `lib/supabase.ts` untouched (unless explicitly requested)
- [ ] `lib/auth.ts` untouched (unless explicitly requested)
- [ ] `app/(auth)/` layout untouched (unless explicitly requested)

---

### 9. V2 cleanliness

- [ ] No patterns copied blindly from the old team SportsChatPlus repo
- [ ] New code follows V2 conventions established in `CLAUDE.md`

---

### 10. Commit hygiene

- [ ] Only files relevant to the task are staged
- [ ] No `.env`, `.env.local`, or secret files staged
- [ ] Commit message describes the "why", not just the "what"

---

## Summary Output

```
## QA Checklist — [date] — [task description]

1. TypeScript:   PASS / FAIL
2. Lint:         PASS / FAIL
3. Tests:        N/A (no suite yet)
4. Auth guards:  PASS / N/A
5. Env vars:     PASS / N/A
6. Migrations:   PASS / N/A
7. Router:       PASS / PASS
8. Protected:    PASS / PASS
9. V2 clean:     PASS / FLAG
10. Commit:      PASS / FAIL

Overall: READY TO COMMIT / BLOCKED (items N, N)
```
