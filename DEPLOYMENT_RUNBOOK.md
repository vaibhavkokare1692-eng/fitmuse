# FitMuse Deployment Runbook

FitMuse production should deploy from GitHub `master` through the connected Vercel project. Manual CLI deploys are a fallback, not the normal release path.

## Production Reference

- Production URL: https://fitmuse-lyart.vercel.app
- GitHub repo: https://github.com/vaibhavkokare1692-eng/fitmuse
- Production branch: `master`
- Current stable tag pattern: `fitmuse-phase-<phase>-<description>-v1`
- Stable Phase 2E tag: `fitmuse-phase-2e-product-freshness-security-v1`

## Stable Tag Rule

Only create a stable tag after:

1. The intended commit is pushed to `origin/master`.
2. Vercel production deployment status is `Ready`.
3. The production deployment source commit matches the intended commit.
4. https://fitmuse-lyart.vercel.app opens successfully.
5. The required checks for that phase have passed.

Never tag based only on a local commit or a successful GitHub push. Production must be verified first.

## Pre-Deploy Checks

Run the checks that match the scope of the change. For normal product work, use:

```bash
npm run check:real-products
npm run check:style-rules
npm run check:recommendations
npm run lint
npm run typecheck
npm run build
```

For docs-only deployment verification commits, the minimum gate is:

```bash
npm run check:real-products
npm run lint
npm run typecheck
npm run build
```

If `npm audit --omit=dev` is part of the phase, do not run `npm audit fix --force` unless a separate task explicitly approves the breaking-change risk.

## Normal Production Deploy

Expected path:

1. Commit locally.
2. Push `master` to GitHub.
3. Let Vercel auto-deploy from the connected GitHub integration.
4. Verify the latest production deployment is `Ready`.
5. Confirm the source commit matches the pushed commit.
6. Confirm the production URL opens.
7. Create and push the stable tag.

## Manual Deploy Fallback

Use the CLI fallback only when Git integration is unavailable, delayed, or explicitly approved:

```bash
npx vercel@latest --prod
```

Before using the fallback, confirm:

- `git status` is clean.
- `git rev-parse HEAD` is the intended production commit.
- The required checks passed.
- The local project is already linked through `.vercel/project.json`.

Do not add `vercel` back to `package.json` for a one-off manual deploy.

## Production Verification

After any deployment, verify:

- Vercel deployment status is `Ready`.
- Production alias includes https://fitmuse-lyart.vercel.app.
- The source commit is the intended commit, when visible.
- The production URL returns `200`.
- No rollback is needed.

If the source commit is not visible in CLI output, use the Vercel dashboard before creating a stable tag.

## Rollback Rule

Rollback only to the most recent known-good production deployment or stable tag. Prefer Vercel's dashboard/CLI rollback for urgent production issues, then follow with a Git revert if the bad commit is already on `master`.

Do not rewrite history or force-push `master` as a rollback strategy.
