# Real Shopping Pack Audit

Reviewed on May 2, 2026.

Scope reviewed:
- [data/realOutfitPacks.ts](C:/Users/vaibh/Documents/Codex/2026-04-24/i-want-you-to-build-a/data/realOutfitPacks.ts)
- [data/realProducts.ts](C:/Users/vaibh/Documents/Codex/2026-04-24/i-want-you-to-build-a/data/realProducts.ts)
- [components/ResultsView.tsx](C:/Users/vaibh/Documents/Codex/2026-04-24/i-want-you-to-build-a/components/ResultsView.tsx)
- [REAL_PRODUCT_DATA_GUIDE.md](C:/Users/vaibh/Documents/Codex/2026-04-24/i-want-you-to-build-a/REAL_PRODUCT_DATA_GUIDE.md)
- [REAL_PRODUCT_LINK_MVP_PLAN.md](C:/Users/vaibh/Documents/Codex/2026-04-24/i-want-you-to-build-a/REAL_PRODUCT_LINK_MVP_PLAN.md)
- [REAL_SHOPPING_UX_REVIEW.md](C:/Users/vaibh/Documents/Codex/2026-04-24/i-want-you-to-build-a/REAL_SHOPPING_UX_REVIEW.md)

## Checks Status

- `npm run check:style-rules`: pass
- `npm run check:recommendations`: pass
- `npm run lint`: pass
- `npm run typecheck`: pass
- `npm run build`: pass
- Recommendation QA summary: `88` scenarios checked, `8/8` key scenarios passing, `13` warnings, `0` critical issues

## Pack Audit Matrix

| Pack ID | Pack Name | Style Preference | Aesthetic | Occasion | Budget Range | Total Price | Budget Label | Verification Status | Last Updated | Products | Placeholder Products | Real Retailer Candidate Links | Candidate / Manual Verification Wording | Clickable Placeholder Link Risk | Could Appear For Incorrect Brief | Safe To Keep Live | Classification |
|---|---|---|---|---|---|---:|---|---|---|---:|---:|---:|---|---|---|---|---|
| `real-pack-feminine-clean-minimal-date` | Classic Clean Minimal Date Look | feminine | clean minimal | date | `$100-$200` | `126.46` | Within budget | `needs_manual_verification` | `2026-04-30` | `5` | `0` | `5` | Yes | No | No obvious mismatch risk | Yes | safe candidate |
| `real-pack-feminine-everyday-clean` | Everyday Clean Target + H&M Mix | feminine | clean minimal | daily wear | `$100-$200` | `101.46` | Within budget | `needs_manual_verification` | `2026-04-30` | `6` | `0` | `6` | Yes | No | No. `everyday` alias support is intentional. | Yes | safe candidate |
| `real-pack-feminine-smart-casual-office` | Polished Office Professional | feminine | smart casual | office | `$100-$200` | `149.87` | Within budget | `needs_manual_verification` | `2026-05-01` | `5` | `0` | `5` | Yes | No | No. `clean minimal` office matching comes from explicit aesthetic alias support. | Yes | safe candidate |
| `real-pack-masculine-old-money-date` | Masculine Old Money Date | masculine | old money | date | `$100-$200` | `160.00` | Within budget | Missing | `2026-04-30` | `4` | `4` | `0` | No pack-level candidate wording | No | No obvious mismatch risk; it appears only for its direct masculine old-money date brief. | Technically yes, but trust consistency is weak. | should be hidden for now |
| `real-pack-streetwear-photoshoot` | Streetwear Photoshoot | mixed / open to all | streetwear | photoshoot | `$100-$200` | `132.00` | Within budget | Missing | `2026-04-30` | `5` | `5` | `0` | No pack-level candidate wording | No | Broad by design because mixed/open packs can match any style preference if the rest of the brief matches. | Technically yes, but trust consistency is weak. | should be hidden for now |

## What Is Consistent

- The three newer feminine boards are aligned with the current MVP-safe pattern:
  - they have real retailer candidate links
  - they have pack-level `needs_manual_verification`
  - they show `Candidate board`
  - they show `Needs manual verification`
  - they show `Price last checked`
  - they do not claim live pricing or active affiliate behavior
- Placeholder links are still safe in the UI.
  - [components/ResultsView.tsx](C:/Users/vaibh/Documents/Codex/2026-04-24/i-want-you-to-build-a/components/ResultsView.tsx) renders placeholder URLs as a disabled `Replace with real link` label, not a clickable outbound link.
- No pack in the current set creates a clickable placeholder-link risk.

## Inconsistencies Found

### 1. Older placeholder-only packs are still live

`Masculine Old Money Date` and `Streetwear Photoshoot` are still eligible to surface in production even though:

- all of their products are `manual-placeholder`
- they have `0` real retailer candidate links
- they have no pack-level `verificationStatus`
- they therefore do not show the stronger candidate/manual-verification wording used by the newer boards

This is the main live consistency issue.

### 2. `shopReady` semantics are currently looser than the product guide implies

[REAL_PRODUCT_DATA_GUIDE.md](C:/Users/vaibh/Documents/Codex/2026-04-24/i-want-you-to-build-a/REAL_PRODUCT_DATA_GUIDE.md) says:

- use `shopReady: false` if a pack is still incomplete or needs link validation

But the two older placeholder-only packs are:

- `shopReady: true`
- fully placeholder-based
- still in need of basic link replacement before they match the newer candidate-board standard

This makes the live status harder to reason about.

### 3. Helper-level "shop ready" logic does not exclude placeholder URLs

[data/realProducts.ts](C:/Users/vaibh/Documents/Codex/2026-04-24/i-want-you-to-build-a/data/realProducts.ts) currently treats a product as shop-ready if it has:

- `inStock`
- any truthy `productUrl`
- `lastCheckedDate`

That means the placeholder URL counts as shop-ready at the helper level. This is not causing the current UI issue by itself, but it is a structural consistency gap.

## Recommended Fixes

### Urgent-ish cleanup, not a production emergency

1. Hide `Masculine Old Money Date` and `Streetwear Photoshoot` until they meet the same candidate-board standard as the newer feminine boards.
2. Alternatively, if they must stay live, give them pack-level `verificationStatus: "needs_manual_verification"` and clearer candidate wording immediately.

### Next cleanup pass

1. Tighten the surfacing rule so a pack cannot appear as a real-shopping board when all linked products are placeholders.
2. Clarify `shopReady` semantics in either code or docs:
   - `shopReady` means "eligible to surface in MVP"
   - `verificationStatus` means "still needs manual verification"
3. Consider requiring at least one real retailer candidate link, or ideally a full pack of real candidate links, before a pack can surface in the live candidate-board section.

## Summary

- Total real-shopping packs: `5`
- Safe packs: `3`
- Packs needing cleanup: `2`
- Packs that should be hidden: `2`
- Unsafe / blocker packs: `0`

Safe packs:
- `Classic Clean Minimal Date Look`
- `Everyday Clean Target + H&M Mix`
- `Polished Office Professional`

Packs that should be hidden for now:
- `Masculine Old Money Date`
- `Streetwear Photoshoot`

## Safe To Keep Live

Yes, with follow-up cleanup recommended.

The site is still safe to keep live because:

- placeholder links are not clickable
- candidate/manual-verification language is strong on the newer real boards
- no pack is pretending to have live prices or active affiliate links

But the older placeholder-only packs should not stay in the same live real-shopping surface indefinitely. They are not a blocker today, but they weaken trust consistency and should be hidden or downgraded before the real-shopping layer expands further.
