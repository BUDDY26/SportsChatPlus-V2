# Visual Recovery Audit — SportsChatPlus-V2

**Reference images:** `docs/visuals/legacy-ui/`
**Audit date:** 2026-03-16
**Scope:** Authenticated dashboard shell (navbar + sidebar). Content pages are secondary.

---

## Reference Image Index

| File | Shows |
|------|-------|
| `image.PNG` | Desktop browser — full dashboard layout, sidebar, navbar, content area watermark |
| `IMG_7891.PNG` | Mobile — navbar + sidebar + Live Games Recent tab with scores |
| `IMG_7892.PNG` | Mobile — Teams detail, tournament games list (scrolled, no navbar) |
| `IMG_7893.PNG` | Mobile — Teams detail, Auburn roster + seed badge |
| `IMG_7894.PNG` | Mobile — navbar + sidebar + Live Games with LIVE badges |
| `IMG_7941.JPG` | Laptop — browser + VS Code; shows logo512.png (blue "SC+" circle icon) |

---

## Legacy Visual Specification (extracted from screenshots)

### Navbar (top bar)

| Element | Legacy value |
|---------|-------------|
| Background | Solid dark navy — approximately `#1a2035` |
| Height | ~56px |
| Left slot | Bold white wordmark **"SportsChat+"** only — no icon |
| Center slot | "Welcome, [username]" in white text |
| Right slot | Solid red **"Log Out"** button — filled, rounded, ~`#dc3545` |
| Theme toggle | Absent |
| Avatar dropdown | Absent — logout is a top-level button |

### Sidebar

| Element | Legacy value |
|---------|-------------|
| Background | Dark navy — same family as navbar, slightly lighter |
| Width | ~180px |
| Brand treatment | None — the brand appears only in the navbar, not repeated in the sidebar |
| Nav icons | Emoji-based: 🏀 Live Games, 👥 Teams, 🔄 Bracket, 💰 My Bets, 🌐 Global Chat, 📊 Stats |
| Active item | Dark red/crimson left-border highlight + slightly lighter navy background |
| Footer | None |

### Content area background

| Element | Legacy value |
|---------|-------------|
| Background | Full-bleed sports collage watermark — basketball, soccer ball, football silhouettes with "SPORTSCHAT+" text overlay, low opacity |
| Cards/rows | White/light surface layered over the watermark |

### Brand / Logo

| Element | Legacy value |
|---------|-------------|
| Wordmark | **"SportsChat+"** — bold white, sans-serif, navbar only |
| App icon | Blue circle with white "SC+" text (seen in `IMG_7941.JPG` as `logo512.png`) |
| Sidebar logo | None — sidebar has no separate logo lockup |

### Color palette (legacy)

| Token | Value |
|-------|-------|
| Sidebar/navbar bg | Dark navy ~`#1a2035`–`#1e2d4e` |
| Active sidebar | Crimson/dark red left border ~`#8B0000` |
| Primary action | Blue ~`#0d6efd` (Refresh button) |
| Danger/logout | Red ~`#dc3545` |
| Live badge | Blue filled pill |
| Content rows | White background, black text |

---

## V2 Current State (from code)

### Navbar
- Background: `bg-background/80` with `backdrop-blur-sm` — translucent, inherits light/dark theme
- Left: live green dot + "Live" label
- Right: theme toggle button + avatar dropdown (user name hidden inside dropdown)
- No "Welcome, [name]" display
- No visible Log Out button at top level

### Sidebar
- Background: `bg-muted/30` — subtle light gray, not dark
- Brand lockup: Trophy icon + "SportsChatPlus" text (different name and icon treatment)
- Nav icons: lucide-react SVG icons (no emoji)
- Active state: `bg-primary text-primary-foreground` (filled blue, no left border accent)
- Footer: copyright line

### Content area
- No background watermark image
- Standard card surfaces only

---

## Gap Analysis

Priority scale: **H** = high visual impact, **M** = medium, **L** = low / cosmetic

| # | Area | Legacy | V2 current | Priority | Notes |
|---|------|--------|------------|----------|-------|
| V1 | Sidebar background | Solid dark navy | `bg-muted/30` (light gray) | **H** | Most visible departure — the whole shell feels wrong |
| V2 | Navbar background | Solid dark navy | Translucent light/dark | **H** | Header has no weight; feels unanchored |
| V3 | Navbar welcome text | "Welcome, [username]" visible in header | Hidden inside avatar dropdown | **M** | Legacy prominently greets the user in the header |
| V4 | Navbar Log Out | Top-level red filled button | Hidden inside dropdown | **M** | Acceptable UX trade-off for V2 dropdown; lower priority |
| V5 | Sidebar brand | No brand in sidebar | Trophy + "SportsChatPlus" lockup | **M** | Legacy sidebar was unbranded; brand lived only in navbar |
| V6 | Sidebar active state | Dark red/crimson left-border + navy bg | Filled blue block | **M** | Left-border accent is more subtle and fits the dark sidebar |
| V7 | Nav icon style | Emoji | lucide-react SVG | **L** | Emoji added personality; SVG is more consistent — keep SVG |
| V8 | Content watermark | Sports collage watermark full-bleed | None | **L** | Decorative; adds identity but hurts readability |
| V9 | App name | "SportsChat+" | "SportsChatPlus" | **L** | Intentional V2 rename — confirm with owner before changing |

---

## Recommended Implementation Order

These are observations only — no code has been changed in this audit. Each item below requires a separate approved prompt before implementation.

### Tier 1 — Shell identity (highest impact, small scope)

1. **V1 + V2 — Darken sidebar and navbar**
   File: `components/dashboard/sidebar.tsx`, `components/dashboard/navbar.tsx`
   Change: sidebar `bg-muted/30` → solid dark color (new CSS variable or inline Tailwind); navbar `bg-background/80` → same dark value.
   Risk: affects all authenticated pages.

2. **V3 — Add welcome text to navbar**
   File: `components/dashboard/navbar.tsx`
   Change: render `Welcome, [firstName]` in the center or left of the header using `session.user.name`.
   Risk: low — additive only.

### Tier 2 — Active state and sidebar polish

3. **V6 — Sidebar active: left-border accent instead of filled block**
   File: `styles/globals.css` (`.sidebar-link-active`)
   Change: replace `bg-primary text-primary-foreground` with left-border treatment + dark navy active background.
   Risk: low — CSS class only.

4. **V5 — Remove Trophy icon from sidebar brand; align with navbar wordmark**
   File: `components/dashboard/sidebar.tsx`
   Change: remove icon, keep wordmark. Or remove sidebar brand entirely to match legacy.
   Risk: low — visual only.

### Tier 3 — Deferred / owner decision

5. **V8 — Background watermark** — Decorative; deferred until Tier 1 is complete and approved.
6. **V4 — Log Out button** — V2 dropdown is acceptable UX; only change if owner wants it.
7. **V9 — App name** — Owner decision required before changing.

---

*Audit based on `docs/visuals/legacy-ui/` screenshots. No application code was modified during this audit.*
