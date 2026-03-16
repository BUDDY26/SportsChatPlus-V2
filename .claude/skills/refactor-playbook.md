# Skill: refactor-playbook

> **Trigger:** Invoked when any change involves renaming, restructuring, moving, or
> significantly altering the design of existing code — even during a "bug fix" pass.
>
> **Rule:** No code is changed until a proposal is written and explicitly approved.
> This applies to changes the user asked for AND to any cleanup Claude wants to add.

---

## When This Playbook Applies

This playbook is required before any of the following:

- Renaming a function, variable, component, file, or directory
- Changing a function signature or hook return shape
- Moving a file to a different directory
- Adding, removing, or reordering imports in a way that changes runtime behavior
- Extracting logic into a new hook, utility, or component
- Changing a shared type in `lib/sports/types.ts`
- Touching `lib/auth.ts`, `lib/supabase.ts`, or `lib/database.types.ts`
- Any change to `pages/api/` that alters request/response shape
- Any change to `app/(auth)/` layout files

**It does NOT apply to:**
- Isolated bug fixes that change only the broken behavior (no surrounding cleanup)
- Adding new files without touching existing ones
- Documentation-only changes

If in doubt: write the proposal. A two-minute proposal is cheaper than an unasked-for
refactor that breaks a working feature.

---

## Rule: No Cleanup During Fix Passes

When executing a bug fix, the scope is the minimum change required to fix the reported
behavior. Do not:

- Rename variables or functions in files you are touching for a fix
- Reorder imports or consolidate `useState` declarations
- Add comments or docstrings to code you are not changing
- Restructure JSX or extract sub-components that were not part of the fix
- "Improve" error handling beyond what the fix requires

If cleanup is genuinely needed, note it in the fix response as a separate follow-up item.
The user will schedule it separately.

---

## Proposal Template

Write this proposal and present it before touching any code.

```
## Refactor Proposal: [component, hook, or file name]

### What
[One sentence: what will be changed]

### Why
[One paragraph: what is wrong with the current code and why it needs changing now,
not in a future cleanup pass]

### How
[Numbered steps describing the planned changes — no code yet]

### Scope

Files to be modified:
- [file path] — [what changes]

Files that must NOT be modified:
- [file path] — [reason: protected area / not part of this refactor / etc.]

### V2 Router and Architecture Constraints
- [ ] No new files will be added under app/api/
- [ ] All API handlers remain in pages/api/ with NextApiRequest/NextApiResponse signature
- [ ] No changes to components/ui/ (shadcn/ui primitives)
- [ ] No changes to lib/supabase.ts or lib/auth.ts unless this refactor explicitly requires it

### Risks
- [What could break]
- [What needs manual re-verification from docs/qa/manual-test-checklist.md]

### Verification
After the refactor:
1. npm run typecheck — must pass with 0 errors
2. npm run lint — must pass with 0 errors
3. Manual checklist sections to run: [list from docs/qa/manual-test-checklist.md]

### Reversibility
[How to undo this change if it introduces a regression — e.g., which files to restore]
```

---

## Execution Steps (post-approval only)

### Step 1 — Confirm baseline passes before touching anything

Run both gates and confirm they are green before making any change:

```bash
npm run typecheck   # must exit 0
npm run lint        # must exit 0
```

If either is failing before the refactor starts, stop and report. Never start a refactor
on a broken baseline.

### Step 2 — Make one change at a time

Do not batch unrelated changes in a single pass. Each discrete change must be small enough
to read in isolation. If a second refactor becomes apparent while executing the first, note
it as a follow-up — do not expand scope mid-execution.

### Step 3 — Keep interfaces stable

Unless the proposal explicitly says a public API or hook return shape is changing, external
interfaces must be identical after the refactor. Components that consume a hook must not need
to change.

### Step 4 — Respect the router split

Every refactor must preserve:
- All page components in `app/` (App Router)
- All API handlers in `pages/api/` (Pages Router, `NextApiRequest`/`NextApiResponse`)
- No API logic added to React Server Components
- No page rendering added to API handlers

The router split is an architectural constraint, not a convention. Violations break the app.

### Step 5 — Run verification

After completing the refactor:

```bash
npm run typecheck
npm run lint
```

Then run the manual checklist sections identified in the proposal's Verification field.

### Step 6 — Report completion

State:
- What changed and why
- Typecheck result: PASS / FAIL
- Lint result: PASS / FAIL
- Manual checklist sections run and their results
- Any follow-up items identified during the refactor (do not act on them — list them)

---

## When to Stop and Report

Stop execution and write a new proposal if:

- The scope grows beyond what was approved (more files need changing than listed)
- A type error requires changes to `lib/sports/types.ts` that were not in the proposal
- A dependency needs to be added or removed
- A shared hook or type that other components depend on needs to change signature
- Any protected file (`lib/auth.ts`, `lib/supabase.ts`, `components/ui/`, `supabase/migrations/`)
  turns out to be necessary to touch

**Do not silently expand scope.** Report the blocker and wait for explicit re-approval.

---

## SportsChatPlus-V2 Protected Areas (Quick Reference)

These files require explicit user approval before any change, even during a refactor:

| File/Directory | Why Protected |
|----------------|--------------|
| `lib/supabase.ts` | Auth + DB client — wrong changes break all DB access |
| `lib/auth.ts` | NextAuth config — wrong changes break login for all users |
| `lib/database.types.ts` | Auto-generated — hand-editing is overwritten by `supabase gen types` |
| `components/ui/` | shadcn/ui primitives — auto-generated, must not be hand-edited |
| `supabase/migrations/` | Applied DDL — irreversible without rollback scripts |
| `app/(auth)/` layouts | Session gating — changes can expose authenticated routes |
| `.env.local` | Real secrets — never read aloud, never modify |

---

*Last updated: 2026-03-16*
