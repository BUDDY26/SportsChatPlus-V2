MODE: EXECUTE

AGENT: QA

Follow AI-WORKFLOW/agents/QA-AGENT.md strictly.

TASK:
Perform a full QA audit of SportsChatPlus-V2 and populate /docs/QA.md.

SCOPE:
- All user-facing pages
- Shared layout components
- Navigation structure

DO NOT:
- Act as a coding agent
- Redesign UI
- Expand scope
- Make unapproved changes

---

STEPS:

1. Identify all routes/pages in:
   - app/
   - pages/

2. Create /docs/QA.md if it does not exist

3. Build QA.md with:
   - QA framework
   - Device buckets
   - Page audit template
   - Global checklist

4. Audit each page:
   - Layout
   - Responsive behavior
   - Data states
   - Navigation
   - UX states

5. Record findings per page using severity:
   - Passed
   - Minor
   - Medium
   - Major

6. Add final summary:
   - Pages OK
   - Pages needing fixes
   - Cross-page issues
   - Priority ranking

---

OUTPUT:
- QA.md created/updated
- Pages audited list
- High-level findings summary
- Priority fix list

No fixes unless explicitly requested.