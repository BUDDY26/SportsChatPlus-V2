# QA Audit — SportsChatPlus-V2

**Audit date:** 2026-03-22 (re-audit #3 — full source re-verification)
**Live testing addendum:** 2026-03-22 — 7 additional findings from runtime observation
**Auditor:** QA Agent
**Scope:** All user-facing pages, shared layout components, navigation structure
**Method:** Static source analysis + live site testing
**Prior audits:** 2026-03-22 (partial, `app/` missing) · 2026-03-22 (full)
**Git HEAD at audit:** `2a12c3a` — fix: spotlight card text brightness matches game card style

---

## QA Framework

### Device Buckets

| Bucket | Viewport |
|---|---|
| Mobile S | 375px |
| Mobile L | 430px |
| Tablet | 768px |
| Desktop | 1280px |
| Wide | 1440px+ |

### Severity Scale

| Level | Meaning |
|---|---|
| ✅ Passed | Working correctly based on source analysis |
| ⚠️ Minor | Cosmetic or low-impact; does not break a flow |
| ❗ Medium | Affects usability but not fully blocking |
| 🚨 Major | Breaks functionality, UX, or a core user flow |

---

## Routes Inventory

| Route | File | Status |
|---|---|---|
| `/` | `app/page.tsx` | ✅ Present |
| `/about` | `app/about/page.tsx` | ✅ Present |
| `/contact` | `app/contact/page.tsx` | ✅ Present |
| `/privacy` | `app/privacy/page.tsx` | ✅ Present |
| `/terms` | `app/terms/page.tsx` | ✅ Present |
| `/login` | `app/(auth)/login/page.tsx` | ✅ Present |
| `/signup` | `app/(auth)/signup/page.tsx` | ✅ Present |
| `/dashboard` | `app/(auth)/dashboard/page.tsx` | ✅ Present |
| `/dashboard/scores` | `app/(auth)/dashboard/scores/page.tsx` | ✅ Present |
| `/dashboard/odds` | `app/(auth)/dashboard/odds/page.tsx` | ✅ Present |
| `/dashboard/chat` | `app/(auth)/dashboard/chat/page.tsx` | ✅ Present |
| `/dashboard/favorites` | `app/(auth)/dashboard/favorites/page.tsx` | ✅ Present |
| `/dashboard/ai-insights` | `app/(auth)/dashboard/ai-insights/page.tsx` | ✅ Present |
| `/dashboard/profile` | `app/(auth)/dashboard/profile/page.tsx` | ✅ Present |
| `/dashboard/tournament` | `app/(auth)/dashboard/tournament/page.tsx` | ✅ Present |
| `/dashboard/support` | — | 🚨 No source file — dead link in every dashboard navbar |

No `loading.tsx` or `error.tsx` files exist anywhere in `app/`.

---

## Layout Audit

### `app/layout.tsx` — Root Layout

- ✅ ThemeProvider wraps all children (`defaultTheme="dark"`, `enableSystem`)
- ✅ Toaster (sonner) present — `richColors`, `position="top-right"`
- ✅ Inter + Oswald loaded via `next/font` as CSS variables (`--font-inter`, `--font-oswald`)
- ✅ Material Symbols Rounded loaded via external `<link>` in `<head>` — separate from `next/font`, necessary for icon set
- ✅ Metadata complete: title template, description, OG, icons (96px favicon, 180px Apple touch, 192/512 Android)
- ⚠️ External Google Fonts stylesheet (`fonts.googleapis.com/css2?...`) is a render-blocking network request on every page load

### `app/(auth)/layout.tsx` — Auth Group Layout

- ✅ **E1 FIXED 2026-03-22** — Dead session code removed from `app/(auth)/layout.tsx`; layout is now a pure passthrough. Dashboard auth protection remains intact via `dashboard/layout.tsx`. No infinite loop possible.
- ✅ Passes children through — no layout chrome at this level

### `app/(auth)/dashboard/layout.tsx` — Dashboard Layout

- ✅ Session guard: `if (!session) redirect("/login")` — unauthenticated access blocked
- ✅ `DashboardNavbar` receives `session` prop
- ✅ `DashboardSidebar` present; hidden on mobile via `hidden md:flex` in sidebar component
- ✅ `dark` class and `tournament-rail` applied at layout root — dashboard always dark; rail CSS in scope
- ✅ `main` has `overflow-y-auto` — dashboard pages scroll within main, not the window
- ⚠️ `min-h-screen flex flex-col` on root div — on very short viewports, combined with `min-h-0` on flex children, should be monitored for vertical squeeze

---

## Page-by-Page Audit

### `/` — Landing Page

- ✅ Hero: headline, tagline, "Get Started" (`/signup`) + "Sign In" (`/login`) CTAs, 7 league pills
- ✅ Features grid: 6 feature cards, `grid-cols-1 md:grid-cols-3`, responsive
- ✅ CTA banner: "Create Free Account" → `/signup`
- ✅ Footer with correct links
- ✅ Hero background image: `aria-hidden="true"`, `pointer-events-none` — accessible and non-interactive
- ⚠️ "Instant Alerts" feature card (`description: "Never miss a big play..."`) — no notification/alert system exists in V2

### `/login`

- ✅ Centered layout with hero background
- ✅ Logo links to `/`
- ✅ "Sign up" link present (`/signup`)
- ✅ `LoginForm` rendered — Zod validation, error feedback
- ✅ Redirect to `/dashboard` on success
- ⚠️ No "Forgot password" link or flow — W10

### `/signup`

- ✅ Centered layout matching `/login`
- ✅ Logo links to `/`
- ✅ "Sign in" link present (`/login`)
- ✅ `SignupForm` rendered with server action (`signUpAction`)
- ✅ Server-side password match validation via Zod `.refine()`
- ⚠️ No client-side password match validation — mismatch only caught server-side (extra round-trip) — W6

### `/about`

- ✅ Navbar + Footer present
- ✅ Static content, correct structure
- ⚠️ Body copy: "Built with Next.js 14" — `package.json` shows `next: ^16.1.6`; stale copy — W5

### `/contact`

- ✅ Navbar + Footer present
- ✅ `ContactForm` rendered
- ✅ **E4 FIXED 2026-03-22** — Note added above submit button: "This form opens your email client to send a message."

### `/privacy` and `/terms`

- ✅ Navbar + Footer present
- ✅ Static content, correct structure
- ⚠️ "Last updated: March 1, 2026" — hardcoded dates; will not auto-update

### `/dashboard` — Main Dashboard

**Top-level structure:**
- ✅ `grid-cols-1 md:grid-cols-[1fr_1fr_18rem]` — mobile single column, desktop 3-column
- ✅ `revalidate = 0` — fresh server render on every request

**Sport Icon Strip (lines 293–320):**
- 🚨 **M2 / B4 CONFIRMED OPEN — Sport chips non-functional.** All 9 chip `<button>` elements have no `onClick` handler. NCAAF is always hardcoded `active: true` regardless of any state. Tapping any chip produces no response — no navigation, no filter, no visual state change.
- ❗ **E2 CONFIRMED OPEN — F1 is not a valid `LeagueId`.** Chip at index 8 uses `id: "F1"`. This is absent from the `LEAGUES` const and `LeagueId` type in `lib/sports/types.ts`. If chips were wired up, navigating to `/dashboard/scores?league=F1` would fail silently at the API layer.

**Favorite Teams Row (lines 325–360):**
- ✅ **M3 FIXED 2026-03-22** — All placeholder team pills and "+Add" converted to `<div>`; hover states removed; "All Teams →" `<Link>` untouched
- ✅ "All Teams →" link → `/dashboard/favorites` — valid route

**Tab Filter (lines 362–390):**
- ✅ Live / Upcoming / Recent tabs are `<Link>` elements → URL param (`?tab=`), correct
- ✅ Active tab derived from `searchParams.tab` server-side
- ✅ "All scores →" links to `/dashboard/scores`

**Live Game Cards — Columns A and B (lines 395–710):**
- ✅ Cards rendered conditionally per `activeTab`
- ✅ CARD min-height: `min-h-[240px] md:min-h-[280px]` — mobile compact, desktop full
- ✅ Key stats block: `hidden md:block` — hidden on mobile
- ✅ Cards link to `/dashboard/scores`
- ✅ **M4 FIXED 2026-03-22** — Game clock replaced with `--` at `text-on-surface/50`; misleading "12:24 · 2nd Qtr" removed from both Column A (line 416) and Column B (line 576)
- ⚠️ All game card data (teams, scores, records, venue, quarter breakdown, key stats) is static mock data — not sourced from any live API
- ⚠️ Win/loss records `(25-8)` and `(22-11)` are hardcoded for all cards

**Tournament Central Right Rail (lines 712–869):**
- ✅ Men's spotlight selection: live-first (highest round_number) → fallback to highest-round final
- ✅ Women's spotlight selection: same live-first logic with `rn` as sort key
- ✅ Men's spotlight text: winner → `font-bold text-on-surface`; loser → `text-foreground`
- ✅ Women's spotlight text: same pattern — winner bold, loser `text-foreground`
- ✅ Both spotlights have empty states: "No games available."
- ✅ Round Status section: `hidden md:flex-shrink-0 md:block` — hidden on mobile
- ✅ Other Active section: same mobile-hidden class
- ✅ "Full bracket →" → `/dashboard/tournament` — valid
- ✅ "View Tournament Center" CTA → `/dashboard/tournament` — valid
- ⚠️ Subtitle "NCAA March Madness · Elite Eight" (line 734) is hardcoded — not derived from actual round data — W1
- ⚠️ "NCAA Baseball · Regionals" and "NCAA Softball · Super Regionals" in Other Active are hardcoded strings — not from any data source

### `/dashboard/scores`

- ✅ `LeagueFilter` + `ScoresClientWrapper` rendered
- ✅ Default league: `"ALL"` from `searchParams.league ?? "ALL"`
- ✅ Responsive heading: `text-xl sm:text-2xl md:text-3xl`
- ✅ No session call at page level — layout handles auth gate

### `/dashboard/odds`

- ✅ `LeagueFilter` + `OddsClientWrapper` rendered
- ✅ Default league: `"NFL"` (differs from scores which defaults to `"ALL"`)
- ✅ Responsive heading present
- ⚠️ Odds data is mock — `pages/api/odds/by-game.ts` returns static data — W7

### `/dashboard/chat`

- ✅ Fixed height layout: `h-[calc(100vh-8rem)]`
- ✅ `ChatWindow` receives `userId` and `userName` from session with `""` / `"Fan"` fallbacks
- ✅ **B3 FIXED** — `ChatWindow` renders `error` from `useChat()` at lines 46–48
- ✅ Auto-scroll to bottom via `useEffect` + `bottomRef` in `ChatWindow`
- ✅ Realtime subscription via Supabase `postgres_changes`
- ✅ **M7 FIXED 2026-03-22** — Missing migrations 001–005 applied to Supabase; `chat_messages` table now exists. `/api/chat/messages` returning 200. Chat functional in production.

### `/dashboard/favorites`

- ✅ `FavoritesClient` receives `userId` from session
- ✅ **B2 FIXED** — `useFavorites` exits with `setIsLoading(false)` on empty `userId` — no infinite skeleton
- ✅ All CRUD states handled: loading, empty, add, remove

### `/dashboard/ai-insights`

- ✅ `InsightsPanel` + `AIChatBox` in `lg:grid-cols-2`, stacks on < lg
- ✅ **E3 FIXED 2026-03-22** — `insights.length === 0` branch added before the map; renders "No insights available." at `text-on-surface-variant/50`
- ⚠️ `AIChatBox` has no auto-scroll to bottom — messages appended to `ScrollArea` but no `useEffect` to scroll down; user may miss new AI responses — W4
- ✅ **M8 FIXED 2026-03-22** — `SessionProviderWrapper` client boundary added (`components/providers/SessionProviderWrapper.tsx`); imported into `app/(auth)/dashboard/layout.tsx` wrapping `{children}`. `useSession()` crash resolved.

### `/dashboard/profile`

- ✅ Avatar with initials fallback
- ✅ `ProfileForm` pre-populated from session
- ✅ Email field disabled with explanatory note
- ✅ `if (!user) return null` — safe null guard
- ⚠️ No email change path — no link or alternative flow — W9

### `/dashboard/tournament`

- ✅ `TournamentClientWrapper` handles all state: loading, error, sport toggle, round selection, bracket views
- ✅ Supabase Realtime + polling active for live games
- ⚠️ Page description: "NCAA Men's Basketball Tournament — bracket, scores, and results." — wrapper supports both genders; description is incomplete — W8

---

## Navigation Audit

| Link | Location | Destination | Status |
|---|---|---|---|
| `/` | Navbar, Footer | Landing page | ✅ Valid |
| `/about` | Navbar, Footer | About | ✅ Valid |
| `/contact` | Navbar, Footer | Contact | ✅ Valid |
| `/privacy` | Footer | Privacy | ✅ Valid |
| `/terms` | Footer | Terms | ✅ Valid |
| `/login` | Navbar | Login | ✅ Valid |
| `/signup` | Navbar | Signup | ✅ Valid |
| `/dashboard` | Sidebar logo | Dashboard | ✅ Valid |
| `/dashboard/scores` | Sidebar, dashboard | Scores | ✅ Valid |
| `/dashboard/odds` | Sidebar | Odds | ✅ Valid |
| `/dashboard/chat` | Sidebar | Chat | ✅ Valid |
| `/dashboard/ai-insights` | Sidebar | AI Insights | ✅ Valid |
| `/dashboard/profile` | Navbar dropdown | Profile | ✅ Valid |
| `/dashboard/favorites` | Dashboard "All Teams →" | Favorites | ✅ Valid |
| `/dashboard/tournament` | Tournament Central, sidebar | Tournament | ✅ Valid |
| `/dashboard/support` | Dashboard navbar (every page) | **Removed — link no longer exists** | ✅ Fixed |
| `/dashboard/scores?league=F1` | Sidebar Motorsport group | — | ✅ Fixed — renders as non-interactive `<span>` |

---

## Auth Audit

### `app/(auth)/actions/auth.ts`

- ✅ **B1 FIXED** — `createAdminClient()` used for profile INSERT; bypasses RLS
- ✅ `signupSchema` has `.refine()` for password match — server-level validation
- ✅ Profile insert failure logged but does not block auth account creation (intentional)
- ✅ `signOutAction` calls `supabase.auth.signOut()` then `redirect("/login")`
- ⚠️ `signUpAction` returns only `errors[0].message` — multiple validation failures show only the first error

### `hooks/useFavorites.ts`

- ✅ **B2 FIXED** — `if (!userId) { setIsLoading(false); return; }` at line 12

### `components/chat/ChatWindow.tsx`

- ✅ **B3 FIXED** — `error` destructured from `useChat()` at line 18; rendered at lines 46–48

### `components/dashboard/navbar.tsx`

- ✅ **B5 FIXED** — no bell/notification button; removed entirely
- ✅ **M1 FIXED 2026-03-22** — Support link (`/dashboard/support`) and its center wrapper `<div>` fully removed; `Link` import retained (still used for `/dashboard/profile`); no regression in layout, session handling, or dropdown
- ✅ **E2 VERIFIED 2026-03-22** — No F1 routes referenced in navbar; unaffected by E2 fix

---

## Blocker Inventory

| ID | Description | Prior status | This audit |
|---|---|---|---|
| B1 | Signup profile row not created | FIXED | ✅ **CONFIRMED FIXED** |
| B2 | Favorites infinite skeleton | FIXED | ✅ **CONFIRMED FIXED** |
| B3 | Chat send error silent | FIXED | ✅ **CONFIRMED FIXED** |
| B4 | Sport chips dead click | OPEN | ✅ **FIXED 2026-03-22** — converted to non-interactive `<div>` |
| B5 | Bell/notifications dead click | FIXED | ✅ **CONFIRMED FIXED** — button removed |

---

## Full Issue Register

### 🚨 Major Issues

| ID | File | Line(s) | Description |
|---|---|---|---|
| ~~M1~~ | ~~`components/dashboard/navbar.tsx`~~ | ~~41~~ | ~~`/dashboard/support` link → 404 on every dashboard page~~ — **FIXED 2026-03-22** |
| ~~M2~~ | ~~`app/(auth)/dashboard/page.tsx`~~ | ~~297–318~~ | ~~B4: sport chips are `<button>` with no `onClick` — non-functional~~ — **FIXED 2026-03-22** — converted to `<div>`; `hover:bg-[#24252b]` removed from inactive branch |
| ~~M3~~ | ~~`app/(auth)/dashboard/page.tsx`~~ | ~~333–352~~ | ~~"My Teams" team buttons and "+Add" button — no handlers~~ — **FIXED 2026-03-22** — both converted to non-interactive `<div>`; hover states removed |
| ~~M4~~ | ~~`app/(auth)/dashboard/page.tsx`~~ | ~~416, 576~~ | ~~Game clock hardcoded "12:24 · 2nd Qtr" for all live cards~~ — **FIXED 2026-03-22** — replaced with neutral `--` placeholder at reduced opacity |
| M5 | `components/chat/ChatWindow.tsx` / `hooks/useChat.ts` / `pages/api/chat/messages.ts` | — | **LIVE TESTING:** "Failed to load messages" on `/dashboard/chat` page load — `/api/chat/messages` returning error in production; root cause unknown without server/Supabase logs |
| M6 | Unknown — observed during navigation | — | **LIVE TESTING:** Full blank screen with "Application error: a client-side exception has occurred" — unhandled client-side throw; no `error.tsx` boundary exists anywhere in `app/`; browser console log required to identify source. **Now likely confirmed as M8 — see below.** |
| ~~M7~~ | ~~`pages/api/chat/messages.ts`~~ | ~~—~~ | ~~`/api/chat/messages` returns HTTP 500 on every request — `chat_messages` table did not exist in Supabase~~ — **FIXED 2026-03-22** — Missing migrations 001–005 applied to Supabase — `chat_messages` table now exists. Confirmed working March 22 2026 |
| ~~M8~~ | ~~`components/ai/AIChatBox.tsx`~~ | ~~—~~ | ~~`Cannot destructure property 'data' of useSession() as it is undefined` — rendered outside `SessionProvider` context; page crashed and redirected to landing page~~ — **FIXED 2026-03-22** — `SessionProviderWrapper` client boundary added; confirmed working on live site March 22 2026 |

### ❗ Medium Issues

| ID | File | Line(s) | Description |
|---|---|---|---|
| ~~E1~~ | ~~`app/(auth)/layout.tsx`~~ | ~~10~~ | ~~Session fetched but redirect reverted — infinite loop: `/dashboard` is a child of this layout. Needs route-aware fix.~~ — **FIXED 2026-03-22** — Removed dead session code from auth layout — pure passthrough, dashboard protection via `dashboard/layout.tsx` unchanged. Confirmed March 22 2026 |
| ~~E2~~ | ~~`components/dashboard/sidebar.tsx:47` / `dashboard/page.tsx:114`~~ | ~~47 / 114~~ | ~~F1 is not a valid `LeagueId` — sidebar link + chip both navigate to invalid API filter~~ — **FIXED 2026-03-22** — chip labelled "F1 Soon" with `disabled: true` + `cursor-not-allowed`; sidebar renders `<span>` with `cursor-not-allowed` instead of `<Link>` |
| ~~E3~~ | ~~`components/ai/InsightsPanel.tsx`~~ | ~~31~~ | ~~No empty state — blank panel when insights array is empty~~ — **FIXED 2026-03-22** |
| ~~E4~~ | ~~`components/contact/ContactForm.tsx`~~ | ~~21~~ | ~~`mailto:` contact form — silent failure without mail client; no in-page feedback~~ — **FIXED 2026-03-22** — note added above submit button |
| E5 | `components/dashboard/sidebar.tsx` | — | **LIVE TESTING:** Sidebar sport links navigate to correct URLs but scores page does not visibly filter by league — all selections appear to show the same result set; may be `ScoresClientWrapper` or API issue |
| E6 | `app/(auth)/dashboard/page.tsx` | 297–318 | **LIVE TESTING:** Sport chips are now non-interactive `<div>` elements — clicking a chip does not navigate to `/dashboard/scores?league=X`; conversion to `<div>` resolved the false interactivity (M2) but chips remain decorative with no filtering path |
| E7 | `app/(auth)/dashboard/page.tsx` | 45–101 | **LIVE TESTING:** Dashboard center game cards show hardcoded static arrays (`liveGames`, `upcomingGames`, `recentGames`) — team names, scores, and game data are placeholder; no real BallDontLie API data wired to this page |
| E8 | `app/(auth)/dashboard/page.tsx` | 22–31 | **LIVE TESTING:** "My Teams" pills show `placeholderTeams` static array — not connected to user favorites in Supabase; add/remove functionality absent; row is purely decorative |
| ~~E9~~ | ~~`pages/api/ai/chat.ts`, `pages/api/chat/send.ts`, `pages/api/favorites/index.ts`, `pages/api/profile/index.ts`~~ | ~~—~~ | ~~4 API routes had no session protection — unauthenticated callers could burn OpenAI credits, insert messages as any user, read/modify any user's favorites, or overwrite any user's profile~~ — **FIXED 2026-03-22** — all 4 routes now guarded with `getServerSession(req, res, authOptions)`; unauthenticated requests return HTTP 401 |

### ⚠️ Minor Issues

| ID | File | Description |
|---|---|---|
| W1 | `app/(auth)/dashboard/page.tsx:734` | "NCAA March Madness · Elite Eight" subtitle hardcoded — inaccurate outside Elite Eight |
| W2 | `app/(auth)/dashboard/page.tsx` | All game card data (scores, records, venue, quarter breakdown, key stats) is static mock data |
| W3 | `hooks/useScores.ts` | `isLoading` not reset on league change — stale data briefly visible during filter transitions |
| W4 | `components/ai/AIChatBox.tsx` | No auto-scroll to bottom — new AI responses may require manual scroll (contrast: `ChatWindow` has auto-scroll) |
| W5 | `app/about/page.tsx:28` | Body copy references "Next.js 14" — stale; project uses Next.js 16 |
| W6 | `app/(auth)/signup/page.tsx` | No client-side password match validation — mismatch requires server round-trip to surface |
| W7 | `app/(auth)/dashboard/odds/*` | Odds API returns mock data — page renders but all values are placeholder |
| W8 | `app/(auth)/dashboard/tournament/page.tsx:12` | Description says "NCAA Men's Basketball" only — tournament supports both genders |
| W9 | `app/(auth)/dashboard/profile/page.tsx` | No email change path or link |
| W10 | `app/(auth)/login/page.tsx` | No "Forgot password" link or flow |
| W11 | `app/(auth)/dashboard/scores/page.tsx` / score card components | **LIVE TESTING:** Score cards display raw league IDs (`NCAAB_WOMEN`, `NCAAB_MEN`) instead of readable display names ("NCAA Women's Basketball", "NCAA Men's Basketball") |
| W12 | `lib/supabase.ts` / client instantiation sites | **BROWSER CONSOLE CONFIRMED:** "Multiple GoTrueClient instances detected in the same browser tab" — Supabase client created in more than one place; may cause undefined auth behavior, stale sessions, or duplicate requests. Likely cause: `createClient()` called at module level in multiple files. |
| ~~W13~~ | ~~`components/chat/ChatWindow.tsx` / `hooks/useChat.ts`~~ | ~~Chat page shows "Failed to send message" error UI even when send API returns 200 successfully — frontend error state not clearing on success~~ — **FIXED 2026-03-22** — Auto-resolved after session guard added to API routes — chat send error UI no longer appears. Confirmed March 22 2026 |
| W14 | `app/(auth)/dashboard/tournament/page.tsx` / tournament game card components | Round winners are incorrectly labeled "Tournament Champion" — this badge should only display for the actual championship winner, not every round winner. Confirmed live March 22 2026 |

---

## Summary

### Pages fully functional (source-verified)

- `/`, `/about`, `/privacy`, `/terms` — static, no issues
- `/login`, `/signup` — auth forms functional; minor UX gaps only
- `/dashboard/favorites` — CRUD fully functional
- `/dashboard/profile` — session data rendering correct
- `/dashboard/tournament` — full bracket, live polling, both genders

### Pages needing fixes

- `/dashboard/chat` — M5: "Failed to load messages" error on load (live testing)
- `/dashboard` — E6 (chips decorative, no routing), E7 (hardcoded game data), E8 (placeholder team pills)
- `/dashboard/scores` — E5 (league filter may not work), W11 (raw league IDs displayed)
- `/dashboard/odds` — odds are mock data only (W7)
- `/contact` — mailto: form noted; limitation disclosed (E4 fixed)

### Unknown / needs investigation

- M6: Blank screen client error — now likely M8 (`useSession` crash on `/dashboard/ai-insights`); browser console confirmed M8 as a page-crash. M6 may be the same event.

### Cross-page issues

1. ~~`/dashboard/support` link in every dashboard navbar — 404~~ — **FIXED 2026-03-22**
2. ~~`app/(auth)/layout.tsx` — E1 redirect reverted (infinite loop); needs route-aware fix~~ — **FIXED 2026-03-22**
3. ~~F1 league ID in sidebar and dashboard chip strip — invalid for API~~ — **FIXED 2026-03-22**

### Priority fix list

| Priority | ID | Action |
|---|---|---|
| ~~1~~ | ~~M1~~ | ~~Remove or implement `/dashboard/support` in `navbar.tsx`~~ — **FIXED** |
| ~~2~~ | ~~E1~~ | ~~Fix auth layout redirect for `/login`/`/signup` without looping~~ — **FIXED 2026-03-22** |
| ~~3~~ | ~~M2~~ | ~~Wire sport chips with `onClick` → `router.push('/dashboard/scores?league={id}')`~~ — **FIXED** — chips converted to non-interactive `<div>` |
| ~~4~~ | ~~M3~~ | ~~Wire "+Add" → `/dashboard/favorites`; remove or link placeholder team buttons~~ — **FIXED** — converted to non-interactive `<div>` |
| ~~5~~ | ~~E2~~ | ~~Remove F1 from sidebar and sport chips, or add F1 to `LEAGUES` type~~ — **FIXED** |
| ~~6~~ | ~~M4~~ | ~~Remove hardcoded game clock or source it from actual game data~~ — **FIXED** |
| ~~7~~ | ~~E3~~ | ~~Add empty state message to `InsightsPanel` when `insights.length === 0`~~ — **FIXED** |
| ~~8~~ | ~~E4~~ | ~~Replace `mailto:` contact form with API endpoint or add visible limitation note~~ — **FIXED** — note added |
| ~~9~~ | ~~M7~~ | ~~Fix `/api/chat/messages` HTTP 500~~ — **FIXED 2026-03-22** |
| ~~10~~ | ~~M8~~ | ~~Fix `useSession()` crash on `/dashboard/ai-insights`~~ — **FIXED 2026-03-22** |
| 11 | E5 | Verify `ScoresClientWrapper` correctly filters by `activeLeague` prop in production |
| 12 | E6 | Implement chip navigation: convert chips back to interactive elements with `router.push` |
| 13 | E7 | Wire dashboard game cards to BallDontLie API (Phase 3) |
| 14 | E8 | Wire "My Teams" row to user favorites from Supabase |
| 15 | W11 | Map raw league IDs to display names in score card components |
| 16 | W4 | Add auto-scroll to bottom in `AIChatBox` |
| 17 | W1 | Derive Tournament Central subtitle from actual round data |
| 18 | W6 | Add client-side password match validation to `SignupForm` |

---

*Full QA audit completed: 2026-03-22 (re-audit #3)*
*Fix verification: 2026-03-22 — M1 verified resolved*
*Fix verification: 2026-03-22 — E2 verified resolved*
*Fix verification: 2026-03-22 — E1 verified resolved*
*Fix verification: 2026-03-22 — M2/B4 verified resolved*
*Fix verification: 2026-03-22 — M3 verified resolved*
*Fix verification: 2026-03-22 — M4 verified resolved*
*Fix verification: 2026-03-22 — E1 revert verified; infinite loop confirmed absent; E1 remains open (needs route-aware approach)*
*Fix verification: 2026-03-22 — E3 verified resolved*
*Fix verification: 2026-03-22 — E4 verified resolved*
*Prior blockers confirmed resolved: B1, B2, B3, B5*
*Issues resolved: M1 (support dead link removed), E2 (F1 marked Coming Soon — non-interactive), M2/B4 (sport chips converted to non-interactive div), M3 (placeholder buttons converted to div), M4 (hardcoded clock replaced with --)*
*E1 reverted — infinite redirect loop; dashboard is a child of (auth) layout*
*All original blockers resolved: B1, B2, B3, B4, B5*
*Live testing addendum: 2026-03-22 — 7 new findings added (M5, M6, E5, E6, E7, E8, W11)*
*Browser console addendum: 2026-03-22 — 3 confirmed findings added (M7, M8, W12)*
*Highest priority: M7 (chat API 500), M8 (ai-insights page crash — useSession undefined), W12 (multiple GoTrueClient instances)*
*Fix verification: 2026-03-22 — M8 verified resolved — SessionProviderWrapper client boundary added — confirmed working on live site March 22 2026*
*Fix verification: 2026-03-22 — M7 verified resolved — Missing migrations 001–005 applied to Supabase — chat_messages table now exists. Confirmed working March 22 2026*
*New finding: 2026-03-22 — W13 added — chat send error UI not clearing on successful 200 response*
*Fix verification: 2026-03-22 — W13 resolved — auto-resolved after session guard added to API routes — confirmed March 22 2026*
*Fix verification: 2026-03-22 — E9 added and immediately resolved — 4 API routes guarded with getServerSession — confirmed March 22 2026*
*Fix verification: 2026-03-22 — E1 resolved — dead session code removed from (auth)/layout.tsx — pure passthrough, dashboard/layout.tsx protection unchanged. Confirmed March 22 2026*
*New finding: 2026-03-22 — W14 added — tournament round winners incorrectly labeled Tournament Champion*
