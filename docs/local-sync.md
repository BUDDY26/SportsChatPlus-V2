# Local Tournament Sync

## Running the sync manually

```powershell
cd C:\Users\ruben\LLM6370\SportsChatPlus-V2
npm run sync:tournament
```

Or via the runner script (logs timestamps, exits with error code on failure):

```powershell
powershell -ExecutionPolicy Bypass -File scripts\run-sync-tournament.ps1
```

---

## Required environment variables

These must be present in `.env.local` before running the sync:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key — bypasses RLS for writes |

Do not commit `.env.local`. The sync script reads these automatically via `dotenv`.

---

## Setting up Windows Task Scheduler (every 30 minutes)

1. Open **Task Scheduler** → **Create Task**
2. **General** tab:
   - Name: `SportsChatPlus Tournament Sync`
   - Run whether user is logged on or not
3. **Triggers** tab → New:
   - Begin the task: On a schedule
   - Settings: Daily, repeat every **30 minutes** for a duration of **1 day**
4. **Actions** tab → New:
   - Action: Start a program
   - Program/script: `powershell.exe`
   - Add arguments:
     ```
     -ExecutionPolicy Bypass -NonInteractive -File "C:\Users\ruben\LLM6370\SportsChatPlus-V2\scripts\run-sync-tournament.ps1"
     ```
   - Start in: `C:\Users\ruben\LLM6370\SportsChatPlus-V2`
5. **Conditions** tab: uncheck "Start only if the computer is on AC power" if on a laptop
6. **Settings** tab: check "If the task fails, restart every 5 minutes" (optional)

---

## Verifying the sync worked

After running, check the Supabase dashboard:

1. Open **Table Editor** → `tournament_games`
2. Confirm `updated_at` timestamps are recent
3. Confirm `top_score` / `bottom_score` / `status` reflect current game state

Or query directly in the Supabase SQL editor:

```sql
SELECT id, status, top_score, bottom_score, updated_at
FROM tournament_games
ORDER BY updated_at DESC
LIMIT 10;
```
