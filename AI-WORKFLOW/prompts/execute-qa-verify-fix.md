MODE: EXECUTE

AGENT: QA

Follow AI-WORKFLOW/agents/QA-AGENT.md strictly.

TASK:
Verify that previously identified QA issues have been correctly fixed.

INPUT:
Use /docs/QA.md as baseline.

---

STEPS:

1. Re-audit ONLY:
   - Pages previously flagged
   - Components that were modified

2. Validate:
   - Issue is fully resolved
   - No regression introduced
   - No new layout/responsive issues

3. Update QA.md:
   - Mark issues as resolved
   - Note any partial fixes
   - Add regression findings if any

---

OUTPUT:

### Fix Verification Summary
- Fixed correctly
- Partially fixed
- Still broken
- New issues introduced

DO NOT:
- Perform new feature work
- Expand audit scope unnecessarily
```

Once that is saved all three files are in place. Go to Claude Code and paste exactly this:
```
Follow /AI-WORKFLOW/agents/QA-AGENT.md strictly.
Then execute /AI-WORKFLOW/prompts/execute-qa-audit.md.