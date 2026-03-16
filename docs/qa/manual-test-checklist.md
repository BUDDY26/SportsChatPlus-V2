# Manual Test Checklist — SportsChatPlus-V2

**Purpose:** Regression verification for every fix and feature pass.
Because there is no automated test suite, this checklist is the only safety net against
regressions. Work through every section that is relevant to the change. Never skip a section
because a change "seems small."

**Prerequisites before running:**
- `npm run typecheck` passes (0 errors)
- `npm run lint` passes (0 errors)
- `.env.local` is populated with real values
- Supabase project is reachable
- Dev server is running: `npm run dev` → `http://localhost:3000`

**Result notation:**
- `PASS` — behavior matches expectation exactly
- `FAIL` — behavior differs; note what happened
- `SKIP` — section not applicable to this change (document why)

---

## Section 1 — Signup Flow (relates to B1)

Tests that new user registration creates a valid account and profile row.

**Setup:** Use a fresh email address not previously registered. Supabase email confirmation
may be enabled — check Supabase Auth settings before running. If confirmation is required,
use a real inbox you can access.

| # | Step | Expected result | Result |
|---|------|-----------------|--------|
| 1.1 | Navigate to `http://localhost:3000/signup` | Signup page renders with Name, Email, Password, Confirm Password fields | |
| 1.2 | Leave Name blank; submit | Validation error: "Name must be at least 2 characters" | |
| 1.3 | Enter mismatched passwords; submit | Validation error: "Passwords do not match" | |
| 1.4 | Enter valid Name, Email, Password, Confirm Password; submit | Toast: "Account created! Please check your email to verify." Redirect to `/login` | |
| 1.5 | *(If email confirmation required)* Open confirmation email and click verify link | Browser redirects to app or confirmation page | |
| 1.6 | Log in with the new credentials | Successful login; redirect to `/dashboard` | |
| 1.7 | Check dashboard welcome header | Shows `Welcome back, [First Name]!` — NOT the user's email address and NOT "Welcome back, Fan!" | |
| 1.8 | Navigate to `/dashboard/profile` | Name field shows the full name entered at signup | |
| 1.9 | *(Supabase check)* In Supabase dashboard → Table Editor → `profiles` table | Row exists for new user with correct `full_name` value | |

**Pass criteria for B1:** Steps 1.7 and 1.9 must both PASS. If either shows email address or
null, B1 is not fixed.

---

## Section 2 — Login and Session

Tests that authentication persists correctly across pages.

| # | Step | Expected result | Result |
|---|------|-----------------|--------|
| 2.1 | Navigate to `http://localhost:3000/login` | Login page renders | |
| 2.2 | Submit incorrect password | Toast: "Invalid email or password"; stays on login page | |
| 2.3 | Submit correct credentials | Redirect to `/dashboard` | |
| 2.4 | Directly navigate to `/dashboard` while logged in | Dashboard loads without redirect | |
| 2.5 | Open a new tab to `http://localhost:3000/dashboard/scores` | Scores page loads; no redirect to login | |
| 2.6 | Click Sign Out from navbar dropdown | Redirect to `/` (landing page) | |
| 2.7 | Attempt to navigate to `/dashboard` after signing out | Redirect to `/login` | |

---

## Section 3 — Dashboard Overview

Tests the main dashboard page including all interactive elements.

| # | Step | Expected result | Result |
|---|------|-----------------|--------|
| 3.1 | Load `/dashboard` as authenticated user | Welcome header shows user's first name | |
| 3.2 | LiveStatusBar renders | Shows either "X live games in progress" (with green dot) or "No live games right now" — never a crash or blank | |
| 3.3 | Click "Live Scores" quick link card | Navigates to `/dashboard/scores` | |
| 3.4 | Click "Community Chat" quick link card | Navigates to `/dashboard/chat` | |
| 3.5 | Click "My Teams" quick link card | Navigates to `/dashboard/favorites` | |
| 3.6 | Click "Live Odds" quick link card | Navigates to `/dashboard/odds` | |
| 3.7 | Click "AI Insights" quick link card | Navigates to `/dashboard/ai-insights` | |
| 3.8 | "Leagues Covered" section is visible | All 8 league badges render | |

**Note on B4 (Leagues Covered badges):** Until B4 is fixed, steps 3.8 does not include
navigation testing. After B4 is fixed, add: click each badge → verify navigation to
`/dashboard/scores?league=X`.

---

## Section 4 — Live Scores and League Filter

Tests score display and the league selector behavior.

| # | Step | Expected result | Result |
|---|------|-----------------|--------|
| 4.1 | Navigate to `/dashboard/scores` | Scores page loads; "All" filter button is active (filled style) | |
| 4.2 | API returns data | ScoreCards render, OR empty state "No games scheduled right now" — never an error banner unless the API is down | |
| 4.3 | Click "NFL" filter button | URL updates to `?league=NFL`; NFL button becomes active; scores update | |
| 4.4 | Click "NBA" filter button | URL updates to `?league=NBA`; NBA button becomes active | |
| 4.5 | Click "All" filter button | URL updates to `?league=ALL`; All button becomes active; all scores shown | |
| 4.6 | Reload the page with `?league=NBA` in the URL | NBA filter is pre-selected on load | |
| 4.7 | Navigate away to `/dashboard` and back to `/dashboard/scores` | Default "ALL" filter is active | |

---

## Section 5 — Favorites Add and Remove (relates to B2)

Tests the full favorites workflow including the loading state fix.

**Setup:** Be logged in as a user with a valid session (non-empty `user.id`).

| # | Step | Expected result | Result |
|---|------|-----------------|--------|
| 5.1 | Navigate to `/dashboard/favorites` | Page loads without infinite skeleton; shows either existing favorites or empty state | |
| 5.2 | In "Add Favorites" section, click a league badge (e.g., "NBA") | Badge becomes selected (filled style); team name input appears | |
| 5.3 | Click a different league badge | Selection switches to the new league | |
| 5.4 | Click the already-selected league badge | Selection is cleared; team name input disappears | |
| 5.5 | With a league selected, type a team name in the input | Text appears in the input | |
| 5.6 | Press Enter with a team name typed | Team is added; toast "X added to favorites!"; input clears; league selection resets | |
| 5.7 | Click the "Add" button with a team name typed | Same as step 5.6 | |
| 5.8 | Leave team name blank; click "Add" | Button is disabled (not clickable) | |
| 5.9 | Reload the page | Added favorites persist | |
| 5.10 | Click the trash icon on a favorite | Toast "Removed from favorites."; card disappears immediately | |
| 5.11 | Reload the page after removal | Removed favorite is gone | |

**B2 verification:** Step 5.1 must PASS — no infinite skeleton. If skeleton never resolves,
B2 is not fixed.

---

## Section 6 — Community Chat (relates to B3)

Tests message sending, display, and error visibility.

**Setup:** Two different browser sessions (or incognito window) logged in as different users
will demonstrate real-time delivery. Single-user testing still validates send/display.

| # | Step | Expected result | Result |
|---|------|-----------------|--------|
| 6.1 | Navigate to `/dashboard/chat` | Chat page loads; message history renders (may be empty) | |
| 6.2 | Type a message in the input | Text appears in the input field | |
| 6.3 | Click the Send button (or press Enter) | Message appears in the chat immediately; input clears | |
| 6.4 | Message is attributed correctly | Sent message shows "You" as sender label; bubble is right-aligned | |
| 6.5 | Reload the page | Sent message persists in history | |
| 6.6 | *(Two browsers)* Send from browser A | Message appears in browser B within ~2 seconds via Realtime | |
| 6.7 | Send an empty message | Send button is disabled; nothing happens | |
| 6.8 | **Error visibility test (B3):** With network DevTools offline, attempt to send | An error message is visible in the chat UI — not silence | |

**B3 verification:** Step 6.8 must PASS. "Visible error" means the user sees a message in
the UI — not just a console log, not silence.

**How to simulate a send failure for step 6.8:**
- Open browser DevTools → Network tab → select "Offline" from the throttling dropdown
- Type a message and click Send
- Re-enable network after the test

---

## Section 7 — Profile Update

Tests that the profile name can be saved and persists.

| # | Step | Expected result | Result |
|---|------|-----------------|--------|
| 7.1 | Navigate to `/dashboard/profile` | Profile page loads; name and email fields pre-filled from session | |
| 7.2 | Email field | Is disabled (read-only); "Email cannot be changed here" note visible | |
| 7.3 | Clear the Name field; try to save | Validation error: "Name must be at least 2 characters" | |
| 7.4 | Change the Name to a new value; click "Save Changes" | Spinner appears; toast "Profile updated!" | |
| 7.5 | Navigate to `/dashboard` | Welcome header shows the updated first name | |
| 7.6 | Reload the page | Updated name persists; no revert to old name | |
| 7.7 | *(Supabase check)* `profiles` table | `full_name` column updated for the user's row | |

---

## Section 8 — Navbar and Navigation

Tests the top navigation controls.

| # | Step | Expected result | Result |
|---|------|-----------------|--------|
| 8.1 | Dashboard header is visible | Shows green live dot, theme toggle, and user avatar button | |
| 8.2 | Click the user avatar button | Dropdown opens showing user name, email, "Profile" link, "Sign Out" option | |
| 8.3 | Click "Profile" in dropdown | Navigates to `/dashboard/profile` | |
| 8.4 | Open dropdown again; click "Sign Out" | Signed out; redirect to `/` | |
| 8.5 | Theme toggle button | Clicking switches between light and dark mode | |
| 8.6 | Bell/notifications button *(if present)* | Button should either be absent, visually disabled, or open a panel — never a silent dead click | |

**B5 verification (Bell button):** Step 8.6 verifies the fix. A dead click target that does
nothing is a FAIL. Acceptable outcomes: button is removed, button is visually disabled with
`disabled` attribute, or button opens a "Notifications coming soon" panel.

---

## Section 9 — Sidebar Navigation

Tests that every sidebar link resolves to a real page.

| # | Step | Expected result | Result |
|---|------|-----------------|--------|
| 9.1 | Click "Overview" | `/dashboard` loads | |
| 9.2 | Click "Live Scores" | `/dashboard/scores` loads | |
| 9.3 | Click "Chat" | `/dashboard/chat` loads | |
| 9.4 | Click "Favorites" | `/dashboard/favorites` loads | |
| 9.5 | Click "AI Insights" | `/dashboard/ai-insights` loads | |
| 9.6 | Click "Odds" | `/dashboard/odds` loads | |
| 9.7 | Click "Tournament Center" | `/dashboard/tournament` loads | |
| 9.8 | Click "Profile" | `/dashboard/profile` loads | |
| 9.9 | Active state highlight | The sidebar item for the current page is visually highlighted | |
| 9.10 | Sidebar on mobile (< 768px viewport) | Sidebar is hidden (uses `md:flex`); navigation still accessible via other means | |

---

## Section 10 — AI Insights

Tests the AI Insights page (requires `OPENAI_API_KEY` to be set).

| # | Step | Expected result | Result |
|---|------|-----------------|--------|
| 10.1 | Navigate to `/dashboard/ai-insights` | Page loads with InsightsPanel and AIChatBox side by side | |
| 10.2 | *(With API key set)* InsightsPanel loads | After a few seconds, insights render for NFL, NBA, MLB, NCAAF | |
| 10.3 | *(Without API key)* InsightsPanel | Shows "Failed to load insights." — not a crash, not a blank | |
| 10.4 | Type a question in AIChatBox | Text appears in input | |
| 10.5 | Submit the question | Loading dots appear; AI response appears after a few seconds | |
| 10.6 | *(Without API key)* Submit a question | "Sorry, I couldn't process that. Please try again." appears | |

---

## Section 11 — Tournament Center

Tests the Phase 1 Tournament Center scaffold (mock data only).

| # | Step | Expected result | Result |
|---|------|-----------------|--------|
| 11.1 | Navigate to `/dashboard/tournament` | Page loads with "Tournament Center" heading | |
| 11.2 | Round selector buttons render | Six buttons: First Round, Second Round, Sweet 16, Elite Eight, Final Four, Championship | |
| 11.3 | "First Round" is the default selected round | First Round button is highlighted; bracket grid shows matchups | |
| 11.4 | East Region games show varied statuses | Some Final, one Live (Saint Mary's vs VCU), some Upcoming | |
| 11.5 | Final games show scores | Kansas 79–44 Howard shows correct scores and "Final" badge | |
| 11.6 | Live game shows live badge | Saint Mary's vs VCU shows green "LIVE" badge with dot | |
| 11.7 | Winner is highlighted | In a Final game, winning team name is bold with trophy icon | |
| 11.8 | "Advances to next round" label | Visible on Final games with a `nextMatchupId` | |
| 11.9 | UNC Asheville upset is visible | (15) UNC Asheville listed as winner over (2) UCLA; UCLA name struck through | |
| 11.10 | Click "Second Round" button | Grid updates; East Region shows Kansas vs Arkansas (both seeded) and TBD matchups | |
| 11.11 | Click "Sweet 16" through "Championship" | Each round renders without crash; TBD matchups show correctly | |
| 11.12 | Live game strip at top | Green "Games in Progress" strip visible showing Saint Mary's vs VCU live | |

---

## How to Use This Checklist

**Before a fix pass:** Note the current state of relevant sections (what PASSes and FAILs
before the fix).

**After a fix pass:**
1. Run `npm run typecheck` and `npm run lint` — both must pass
2. Run all sections relevant to the changed files
3. If fixing B1, also run Section 2 (login) to verify auth is not broken
4. Record results in this table or in the fix session notes

**When a fix is complete:** The fix session response should include which checklist sections
were verified and their results.

---

*Last updated: 2026-03-16*
*Update this file whenever a new feature is added or a blocker is fixed and verification
steps change.*
