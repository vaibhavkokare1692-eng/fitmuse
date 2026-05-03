# Real Shopping UX Review

Reviewed against production on May 1, 2026:
- Production: https://fitmuse-lyart.vercel.app
- Stable tag: `fitmuse-third-real-candidate-board-v1`
- Deployed commit under review: `97c50e95d4a9940560b3fa5a9162e5a51a1be394`

## Checks Status

- `npm run check:style-rules`: pass
- `npm run check:recommendations`: pass
- `npm run lint`: pass
- `npm run typecheck`: pass
- `npm run build`: pass
- Recommendation QA summary: `88` scenarios checked, `8/8` key scenarios passing, `13` warnings, `0` critical issues

## What Works Well

- The `Curated real shopping looks` section is placed after the main mock recommendation grid, so it feels additive rather than disruptive.
- The section copy clearly frames these packs as an MVP layer sitting beside the mock engine, which helps protect trust.
- Matching behavior is working well for the reviewed briefs:
  - feminine + clean minimal + date + `$100-$200` shows `Classic Clean Minimal Date Look`
  - feminine + clean minimal + daily wear/everyday + `$100-$200` shows `Everyday Clean Target + H&M Mix`
  - feminine + smart casual + office + `$100-$200` shows `Polished Office Professional`
  - masculine + old money + date + `$100-$200` does not show the feminine boards
- Candidate-board cards are already clear on the essentials:
  - `Candidate board`
  - `Needs manual verification`
  - total estimated price
  - budget label
  - store chips
  - `Price last checked`
  - short explanation of why the pack works
- Modal copy is honest without sounding alarmist. It clearly says the pack needs manual verification and that commissions may come later.
- Link safety is good:
  - real candidate links are labeled `Open retailer candidate`
  - placeholder links are rendered as non-clickable `Replace with real link`
- Saved Looks appears isolated from the real-shopping section. The saved-only branch is still separate from the all-results branch, which reduces interference risk.

## Confusing Parts

- The live experience is broader than the current product summary suggests. Production still surfaces at least one older real-shopping pack, `Masculine Old Money Date`, for a matching masculine brief.
- Because the section header is generic, users may not immediately understand whether these boards are experiments, handpicked recommendations, or fully maintained shopping looks until they read the supporting copy.
- The manual-verification language appears both on the card and in the modal. This is honest, but it creates slight repetition.
- `Shop Full Look` is a strong CTA for an MVP candidate board. The disclaimer offsets this, but the action still reads slightly more final than the current verification status.

## Risks

- Scope clarity risk: if the team intends only the three newer candidate boards to be considered "live," the production experience is currently wider than that framing.
- Trust risk is low, but there is still a small expectation gap between `Shop Full Look` and the underlying candidate-board status.
- Maintenance risk grows as more curated packs are added. The current UX is still manageable, but it will benefit from tighter rules around which boards are considered verified, candidate, or draft.
- Mobile risk appears low from the current responsive structure, but this review did not include a full live browser tap-through on a mobile viewport, so there is still some unverified presentation risk.

## Recommended Small Improvements

### Later, not urgent

- Clarify scope in product documentation and team language so it matches what is actually live in production.
- Consider slightly softer CTA copy later if the team wants the action to better match the candidate-board status.
- Consider a small sublabel or helper line that distinguishes "real candidate boards" from the main mock recommendation engine even faster at scan speed.
- Consider reducing copy repetition between the card and modal once more boards are live.

### Worth monitoring

- Keep an eye on how many curated boards are visible per brief. The current UX works because the section is still small.
- Recheck mobile modal density once more boards and longer notes are added.

## Urgency

- No urgent UX blocker found.
- No immediate trust/safety issue found.
- No deployment rollback or hotfix recommendation.

## Safe To Keep Live

Yes.

The current real-shopping candidate-board UX is safe to keep live. It reads as a cautious MVP, the matching behavior is sensible for the tested briefs, the disclaimer language is honest, and the link handling is safe. The main follow-up need is scope clarity, not a production blocker.
