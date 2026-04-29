# QA Recommendation Scenarios

FitMuse includes a lightweight recommendation QA script to sanity-check common styling briefs before we ship matcher changes.

## Run the check

```bash
npm run check:recommendations
```

## What it checks

The script generates recommendations across a broad set of combinations and prints:

- scenario name
- result count
- number of `Within budget` looks
- number of `Near budget` looks
- number of `Stretch upgrade` looks
- number of `Over budget` looks
- average confidence score
- whether the fallback warning would appear
- warnings and critical issues

It also includes key product-quality scenarios such as:

- Masculine Old Money Date `$100-$200`
- Feminine Clean Minimal Date `$100-$200`
- Feminine Petite Everyday Clean `$100-$200`
- Masculine Office Smart Casual `$200-$350`
- Travel briefs across multiple budgets

## What warnings mean

Warnings do not always mean the matcher is broken. They flag cases worth reviewing, such as:

- every recommendation landing `Within budget`
- too many `Stretch upgrade` results
- suspicious copy or label mismatches
- utility-heavy pieces surfacing in clean-minimal feminine scenarios

Critical issues are stronger signals that a release should be reviewed before shipping. Examples include:

- zero recommendations
- all results clearly over budget
- creator-only copy in non-creator scenarios
- fallback messaging on common, well-supported briefs
- recommendation shape issues that could break Saved Looks snapshots

## How to interpret budget distribution

FitMuse is intentionally trying to feel like a real stylist, not a rigid price filter.

The current target behavior is:

- most looks should be `Within budget`
- some looks can be `Near budget`
- a small number can be `Stretch upgrade` when the style match is stronger
- `Over budget` should stay rare

This helps users see trustworthy options first while still surfacing a few smarter upgrades when they improve the silhouette, materials, or overall styling outcome.

## Why we show mostly within-budget plus a few stretch options

Real styling decisions are not binary. A slightly better shoe, blazer, or trouser can materially improve the outfit. The goal is to keep budget trust high while still offering a few clearly labeled step-up options:

- `Within budget` means the look respects the stated cap.
- `Near budget` means the look is just above the cap, usually within about 10-15%.
- `Stretch upgrade` means the look is intentionally above budget because one higher-value piece materially improves the result.
- `Over budget` should normally appear only when the catalog does not provide enough strong alternatives.
