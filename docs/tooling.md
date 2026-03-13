# SportsChatPlus-V2 — Tooling and Automation

This document covers developer tooling, CI setup, and Claude Code configuration for this repository.

---

## Commands

| Script | Command | Purpose |
|---|---|---|
| `dev` | `npm run dev` | Start Next.js dev server on localhost:3000 |
| `build` | `npm run build` | Production build |
| `start` | `npm run start` | Serve production build locally |
| `lint` | `npm run lint` | ESLint via `eslint-config-next` |
| `typecheck` | `npm run typecheck` | `tsc --noEmit` — explicit type check (Next.js build suppresses TS errors by default) |

Package manager: **npm**. Lock file: `package-lock.json`. Do not use bun, pnpm, or yarn.

---

## Test Suite

**No test suite is configured in V2 yet.**

CI does not run `npm test`. When a test framework is introduced:
1. Add the test script to `package.json`
2. Update `.github/workflows/ci.yml` to add the test step
3. Update this file and `CLAUDE.md`

---

## CI — GitHub Actions

File: `.github/workflows/ci.yml`

Trigger: every push and pull request to `main`.

Steps:
1. `actions/checkout@v4`
2. `actions/setup-node@v4` — Node 20, npm cache
3. `npm ci` — clean install from lock file
4. `npm run lint`
5. `npm run typecheck`

Vercel handles deployment automatically on push to `main` via its own GitHub integration. CI does not deploy.

---

## Deployment

Platform: **Vercel**
- Production deploys on push to `main` via Vercel GitHub integration
- Environment variables are set in the Vercel dashboard — never in committed files
- `next.config.js` configures allowed image hostnames (Supabase, Google, GitHub avatars)

---

## Database

Platform: **Supabase**
- Migrations live in `supabase/migrations/` — applied manually via the Supabase SQL editor
- Each migration should have a matching `_rollback.sql`
- Never auto-apply migrations; always confirm with user first

---

## Claude Code Configuration

### CLAUDE.md

`CLAUDE.md` at the repository root is loaded automatically at the start of every Claude Code session. It contains:
- Project identity and rebuild context (V2 is a clean rebuild — old team version is reference-only)
- Architecture summary and router split
- Protected areas
- Coding conventions
- Migration status table

### .claude/ directory

`.claude/` is tracked in git (not gitignored). Contents are version-controlled and portable.

Current contents:
```
.claude/
├── skills/
│   ├── entry-protocol.md    ← session entry scan
│   ├── code-review.md       ← structured code review checklist
│   └── qa-checklist.md      ← pre-commit quality gate
└── hooks/
    └── hooks.md             ← hook strategy and candidates
```

`settings.local.json` — Bash permission allow-list. Add this file locally; it is safe to commit (no secrets).

---

## Portfolio Automation Structure — Phase 1 (2026-03-13)

First migration phase. No application code was changed.

### Files Added

| File | Purpose |
|---|---|
| `CLAUDE.md` | Root Claude Code instructions — auto-loaded each session |
| `docs/tooling.md` | This file — tooling and automation reference |
| `.github/workflows/ci.yml` | Minimal CI — lint + typecheck on push/PR to main |
| `.claude/skills/entry-protocol.md` | Session entry scan skill |
| `.claude/skills/code-review.md` | Code review checklist skill |
| `.claude/skills/qa-checklist.md` | Pre-commit quality gate skill |
| `.claude/hooks/hooks.md` | Hook strategy and candidates |

### Files Left Unchanged

All existing application code, migrations, configuration, and assets were left untouched.
