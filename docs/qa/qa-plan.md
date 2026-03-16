# QA Plan — SportsChatPlus-V2

**Project:** SportsChatPlus-V2
**Last updated:** 2026-03-16
**Test framework:** None configured yet (see Section 4)
**CI gates:** `npm run lint` + `npm run typecheck`

---

## 1. Test Strategy

SportsChatPlus-V2 has no automated test suite as of the initial scaffold. CI enforces lint and
TypeScript compilation only. Until a test framework is added, the quality gate for every change
is:

1. `npm run typecheck` — zero TS errors
2. `npm run lint` — zero ESLint errors
3. Manual verification against `docs/qa/manual-test-checklist.md`

**Confidence target:** Every blocker fix must be manually verified through the full affected
user flow before being considered complete. Partial flows (e.g., "the hook is fixed in
isolation") are not sufficient.

**Explicitly out of scope for now:**
- Automated browser testing (Playwright, Cypress)
- Unit tests for hooks and utilities
- API route integration tests
- Visual regression testing

These become in-scope when a test framework is added. See Section 4 for the plan.

---

## 2. Current Blocker Inventory

This table was populated from the functional QA audit conducted on 2026-03-16.
Update it as blockers are fixed. Never mark a blocker fixed without manual verification.

| ID | Location | Description | Root Cause | Status |
|----|----------|-------------|------------|--------|
| B1 | `app/(auth)/actions/auth.ts` | Signup profile row silently not created; new users display as email or "Fan" everywhere | `createClient()` (anon) used for `profiles` INSERT with no session; result not checked | **OPEN** |
| B2 | `hooks/useFavorites.ts` | Favorites page hangs in infinite skeleton when `userId` is empty | Early return does not set `isLoading: false` | **OPEN** |
| B3 | `components/chat/ChatWindow.tsx` | Chat send failures are completely silent — no visible error to user | `error` from `useChat()` is not destructured or rendered in `ChatWindow` | **OPEN** |
| B4 | `app/(auth)/dashboard/page.tsx` | "Leagues Covered" badges look interactive but do nothing on click | Rendered as `<Badge>` with no `onClick` or `<Link>` wrapper | **OPEN** |
| B5 | `components/dashboard/navbar.tsx` | Bell/notifications button is a dead click target | No handler, no panel; button is purely decorative chrome | **OPEN** |

### Severity Definitions

| Severity | Meaning |
|----------|---------|
| **Blocker** | Prevents a core user flow or produces incorrect data; must fix before any new features |
| **Placeholder** | Confusing UX but does not break a flow; can be deferred |

B1–B3 are **Blockers**. B4–B5 are **Placeholders** — confusing but not flow-breaking.

---

## 3. Lower-Priority Issue Log

These were identified in the same audit but are not blockers.

| Issue | File | Description |
|-------|------|-------------|
| Dead import | `app/(auth)/actions/auth.ts:4` | `import { signIn } from "next-auth/react"` in a `"use server"` file; unused; latent bundling hazard |
| Stale scores on filter | `hooks/useScores.ts` | `isLoading` not reset to `true` on league change; stale data visible briefly |
| Odds empty state | `pages/api/odds/by-game.ts` | Returns `[]` when `THE_ODDS_API_KEY` is unset; UI shows "No odds" with no explanation |
| Navbar Settings icon | `components/dashboard/navbar.tsx` | `Settings` imported from lucide-react but not rendered anywhere |

---

## 4. Verification Commands

Run these after every change before marking any fix complete:

```bash
# TypeScript strict compilation — must exit with 0 errors
npm run typecheck

# ESLint — must exit with 0 errors, 0 warnings
npm run lint
```

Neither command starts the dev server. Both run in under 30 seconds.

If either command fails after a fix, the fix is not complete regardless of whether the
intended behavior looks correct.

---

## 5. Manual Testing Expectations

Because there is no automated test suite, manual testing is the only regression safety net.
The full manual test procedure is in `docs/qa/manual-test-checklist.md`.

**Minimum manual test scope per fix:**

| Fix target | Minimum manual test scope |
|------------|--------------------------|
| B1 (signup profile) | Complete signup → email verify → login → dashboard name check |
| B2 (favorites loading) | Load Favorites page as authenticated user; no infinite skeleton |
| B3 (chat error) | Send a chat message; attempt a send that fails; error must be visible |
| B4 (leagues badges) | Click every league badge on dashboard; navigation must occur |
| B5 (bell button) | Fix = remove or disable button; confirm no dead click target |
| Any auth change | Full login + logout cycle |
| Any API route change | Affected feature end-to-end in browser |
| Any hook change | Full feature flow that uses the hook |

---

## 6. When to Add a Test Framework

Trigger: when the first API route integration test or hook unit test would catch a regression
that manual testing missed.

When added:
1. Add test script to `package.json`
2. Update `.github/workflows/ci.yml` to add `npm test` step after `typecheck`
3. Update this file: fill in Sections 6.1–6.3 below
4. Update `CLAUDE.md` and `docs/tooling.md`

```
6.1 Framework: {{TEST_FRAMEWORK}}
6.2 Test command: {{TEST_COMMAND}}
6.3 Coverage target: 80% minimum per source file in lib/ and pages/api/
```

---

## 7. Known Gaps (Deliberate)

The following areas have no automated test coverage and are known to be untested:

| Area | Reason not tested |
|------|------------------|
| All `pages/api/` routes | No test framework configured yet |
| `hooks/useScores.ts`, `useChat.ts`, `useFavorites.ts`, `useAIInsights.ts` | No test framework; client hooks require browser env |
| `lib/ai/chat.ts`, `lib/ai/predictions.ts` | OpenAI calls would require mocking or live keys |
| `lib/sports/balldontlie.ts`, `lib/sports/ncaa.ts` | External API calls; require mocking |
| Auth flow (`lib/auth.ts`) | NextAuth + Supabase integration; requires live Supabase project |
| Supabase migrations | Applied manually; not testable in CI without a test DB |

---

## 8. CI Integration

Current CI (`.github/workflows/ci.yml`) runs on every push and PR to `main`:

| Step | Command | Must pass? |
|------|---------|-----------|
| Install | `npm ci` | Yes |
| Lint | `npm run lint` | Yes — blocks merge |
| Type check | `npm run typecheck` | Yes — blocks merge |
| Tests | *(not configured)* | N/A |

CI does **not** deploy. Vercel handles deployment automatically on push to `main`.

---

*QA plan established: 2026-03-16*
*Next review: when a test framework is added, or when a new feature category is complete*
