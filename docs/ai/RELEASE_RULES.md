# Release Rules

- No direct `master` work unless explicitly approved.
- Every experiment gets its own branch.
- No manual Vercel deploy unless explicitly approved.
- No stable tag until production is verified.
- Screenshots are required for UI work.
- Do not commit screenshots unless explicitly approved.
- Do not use destructive filesystem commands.
- No broad refactors without approval.
- No paid-service, domain, brand, or rebrand changes without approval.

## Stable Tag Flow

1. Push approved commit.
2. Confirm Vercel production is `Ready`.
3. Confirm production commit matches pushed commit.
4. Verify public production URL.
5. Create and push stable tag only after approval.
