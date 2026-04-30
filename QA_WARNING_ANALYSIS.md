# QA Warning Analysis

## Snapshot

- Recommendation QA run: `npm run check:recommendations`
- Date reviewed: `2026-04-30`
- Production currently live: [https://fitmuse-lyart.vercel.app](https://fitmuse-lyart.vercel.app)
- Commit under analysis: `4a8bccfb2f03619e90b0dd47539d3effc96d3478`
- Total scenarios checked: `88`
- Total warnings: `15`
- Critical issues: `0`
- Key scenarios passing: `8/8`

## Overall Read

The remaining warning set is much narrower now than earlier QA passes.

- `13` warnings are the same high-budget distribution warning:
  - `All results landed within budget. Review whether stretch options are being suppressed too hard.`
- `2` warnings are low-budget mix warnings:
  - `Too many stretch-upgrade results are showing for this scenario.`

There are no remaining warnings caused by:

- copy/label mismatch
- style-rule coverage gaps
- broken matcher output shape
- missing match reasons
- missing prices
- fallback warning regressions

## Warning-by-Warning Breakdown

| Scenario | Warning | Primary cause | Critical? | Recommended fix | Fix now or later? |
|---|---|---|---|---|---|
| `Matrix Masculine Smart Casual Office / $350+` | All results landed within budget. Review whether stretch options are being suppressed too hard. | Budget distribution | Non-critical | Add 1-2 premium office stretch candidates or allow one blazer/bag/shoe upgrade to surface in the top 10 for high budgets. | Later |
| `Matrix Masculine Streetwear Photoshoot / under $100` | Too many stretch-upgrade results are showing for this scenario. | Thin product catalog | Non-critical | Add more true under-$100 streetwear/photoshoot bundles or loosen the low-budget bundle logic for creator streetwear so cheaper 3-piece looks rank higher. | Later |
| `Matrix Masculine Streetwear Photoshoot / $350+` | All results landed within budget. Review whether stretch options are being suppressed too hard. | Budget distribution | Non-critical | Add a few premium streetwear shoes/layers/accessories or explicitly reserve one premium stretch slot when the budget is `$350+`. | Later |
| `Matrix Masculine Travel / $350+` | All results landed within budget. Review whether stretch options are being suppressed too hard. | Acceptable edge case | Non-critical | Optional only: add premium travel layers/bags/shoes if we want more “upgrade” variety. Current output is still believable. | Later |
| `Matrix Feminine Minimalist Daily Wear / $350+` | All results landed within budget. Review whether stretch options are being suppressed too hard. | Budget distribution | Non-critical | Add premium minimalist bags/shoes/outerwear or allow one higher-end material upgrade to show. | Later |
| `Matrix Feminine Party / $350+` | All results landed within budget. Review whether stretch options are being suppressed too hard. | Budget distribution | Non-critical | Add more premium party heels, bags, and layers so higher-budget party users see a few aspirational options. | Later |
| `Matrix Feminine Smart Casual Office / under $100` | Too many stretch-upgrade results are showing for this scenario. | Thin product catalog | Non-critical | Add stronger under-$100 feminine office basics, especially cheaper blouse + trouser + flat combinations, and reduce stretch ranking when all selected stores skew mid-priced. | Fix soon |
| `Matrix Mixed Travel / $350+` | All results landed within budget. Review whether stretch options are being suppressed too hard. | Acceptable edge case | Non-critical | Optional only: add a premium travel layer/bag/shoe path if we want more high-budget variation. | Later |
| `Matrix Mixed Streetwear Party / $350+` | All results landed within budget. Review whether stretch options are being suppressed too hard. | Budget distribution | Non-critical | Add premium party-streetwear shoes, layers, and accessories, or allow one premium expressive piece to surface for `$350+`. | Later |
| `Matrix Androgynous Quiet Luxury Office / $200-$350` | All results landed within budget. Review whether stretch options are being suppressed too hard. | Budget distribution | Non-critical | Add more premium androgynous/quiet-luxury office pieces or allow a structured bag/shoe/blazer upgrade to appear in this mid-premium range. | Fix soon |
| `Matrix Androgynous Streetwear Reels / $350+` | All results landed within budget. Review whether stretch options are being suppressed too hard. | Budget distribution | Non-critical | Add premium androgynous creator pieces or preserve one visually stronger stretch option for reels at higher budgets. | Later |
| `Matrix Masculine Gym Casual College / $350+` | All results landed within budget. Review whether stretch options are being suppressed too hard. | Acceptable edge case | Non-critical | Likely okay as-is. College/gym-casual users do not need forced premium stretch looks just because budget is high. | Later |
| `Matrix Mixed Creator Photoshoot / $350+` | All results landed within budget. Review whether stretch options are being suppressed too hard. | Budget distribution | Non-critical | Add premium creator layers, bags, and shoes or reserve one stylistically stronger stretch option in high-budget creator briefs. | Later |
| `Matrix Mixed Office Core / $350+` | All results landed within budget. Review whether stretch options are being suppressed too hard. | Budget distribution | Non-critical | Add premium office core pieces or allow one blazer/bag/shoe upgrade to survive ranking in the top result set. | Later |
| `Matrix Androgynous Minimalist Daily Wear / $350+` | All results landed within budget. Review whether stretch options are being suppressed too hard. | Acceptable edge case | Non-critical | Optional only: add premium minimalist knitwear, outerwear, and leather goods if we want a more aspirational high-budget lane. | Later |

## Per-Warning Notes

### 1. Matrix Masculine Smart Casual Office / $350+

- Scenario counts: `10 within / 0 near / 0 stretch / 0 over`
- What this means:
  - FitMuse is still giving believable office looks.
  - The warning exists because the QA script expects at least some premium variation once budget is high.
- Real-user risk:
  - low

### 2. Matrix Masculine Streetwear Photoshoot / under $100

- Scenario counts: `1 within / 5 near / 4 stretch / 0 over`
- What this means:
  - the scenario works and does not crash
  - but too many results are only achievable by stretching the under-$100 cap
- Real-user risk:
  - moderate for bargain-focused users

### 3. Matrix Masculine Streetwear Photoshoot / $350+

- Scenario counts: `10 within / 0 near / 0 stretch / 0 over`
- What this means:
  - we do not yet have enough premium streetwear/photoshoot step-up variety in the top mix
- Real-user risk:
  - low

### 4. Matrix Masculine Travel / $350+

- Scenario counts: `10 within / 0 near / 0 stretch / 0 over`
- What this means:
  - travel can reasonably stay practical even when the user has a higher budget
- Real-user risk:
  - low

### 5. Matrix Feminine Minimalist Daily Wear / $350+

- Scenario counts: `10 within / 0 near / 0 stretch / 0 over`
- What this means:
  - the affordable minimalist catalog is strong
  - but there are not enough higher-end minimalist upgrades surfacing
- Real-user risk:
  - low

### 6. Matrix Feminine Party / $350+

- Scenario counts: `10 within / 0 near / 0 stretch / 0 over`
- What this means:
  - party results are fine, but high-budget party shoppers are not seeing enough premium variation
- Real-user risk:
  - low to moderate

### 7. Matrix Feminine Smart Casual Office / under $100

- Scenario counts: `0 within / 3 near / 7 stretch / 0 over`
- What this means:
  - this is the weakest remaining practical scenario
  - the system is still usable, but it is asking the user to stretch too often for an under-$100 office brief
- Real-user risk:
  - moderate

### 8. Matrix Mixed Travel / $350+

- Scenario counts: `10 within / 0 near / 0 stretch / 0 over`
- What this means:
  - mixed/open travel stays realistic and practical
  - the warning is mostly about premium option variety, not broken recommendations
- Real-user risk:
  - low

### 9. Matrix Mixed Streetwear Party / $350+

- Scenario counts: `10 within / 0 near / 0 stretch / 0 over`
- What this means:
  - the results are coherent, but the high-budget range is not differentiated enough
- Real-user risk:
  - low

### 10. Matrix Androgynous Quiet Luxury Office / $200-$350

- Scenario counts: `10 within / 0 near / 0 stretch / 0 over`
- What this means:
  - even before `$350+`, the androgynous quiet-luxury office lane is too flat in its pricing spread
  - this suggests both premium office catalog depth and ranking variety can improve here
- Real-user risk:
  - moderate for higher-intent office users

### 11. Matrix Androgynous Streetwear Reels / $350+

- Scenario counts: `10 within / 0 near / 0 stretch / 0 over`
- What this means:
  - creator-facing streetwear results are working, but premium expressive options are underrepresented
- Real-user risk:
  - low

### 12. Matrix Masculine Gym Casual College / $350+

- Scenario counts: `10 within / 0 near / 0 stretch / 0 over`
- What this means:
  - likely acceptable, because this category does not need to push premium upgrades to feel useful
- Real-user risk:
  - very low

### 13. Matrix Mixed Creator Photoshoot / $350+

- Scenario counts: `10 within / 0 near / 0 stretch / 0 over`
- What this means:
  - creator styling is working, but a premium photoshoot lane is still underpowered
- Real-user risk:
  - low to moderate

### 14. Matrix Mixed Office Core / $350+

- Scenario counts: `10 within / 0 near / 0 stretch / 0 over`
- What this means:
  - office basics are solid, but the premium office story is not yet varied enough
- Real-user risk:
  - low to moderate

### 15. Matrix Androgynous Minimalist Daily Wear / $350+

- Scenario counts: `10 within / 0 near / 0 stretch / 0 over`
- What this means:
  - minimalist daily wear stays believable
  - the warning is about missing high-budget range nuance, not recommendation failure
- Real-user risk:
  - low

## Warnings by Category

- Thin product catalog: `2`
  - `Matrix Masculine Streetwear Photoshoot / under $100`
  - `Matrix Feminine Smart Casual Office / under $100`
- Budget distribution / suppressed stretch options: `9`
  - Masculine Smart Casual Office `$350+`
  - Masculine Streetwear Photoshoot `$350+`
  - Feminine Minimalist Daily Wear `$350+`
  - Feminine Party `$350+`
  - Mixed Streetwear Party `$350+`
  - Androgynous Quiet Luxury Office `$200-$350`
  - Androgynous Streetwear Reels `$350+`
  - Mixed Creator Photoshoot `$350+`
  - Mixed Office Core `$350+`
- Acceptable edge case: `4`
  - Masculine Travel `$350+`
  - Mixed Travel `$350+`
  - Masculine Gym Casual College `$350+`
  - Androgynous Minimalist Daily Wear `$350+`
- Style rule coverage: `0`
- Matcher logic failures: `0`
- Copy/label mismatch: `0`

## Top 3 Fixes That Would Remove the Most Warnings

### 1. Add a premium stretch lane for higher-budget scenarios

This would reduce the largest block of warnings.

- Best target areas:
  - office
  - quiet luxury
  - streetwear creator
  - party
  - minimalist
- Likely impact:
  - removes most of the `all within budget` warnings

### 2. Improve under-$100 office and streetwear creator coverage

This would address the two remaining practically important low-budget warnings.

- Best target areas:
  - feminine smart-casual office basics
  - masculine streetwear/photoshoot low-cost pieces
- Likely impact:
  - reduces the only warnings that can noticeably frustrate bargain shoppers

### 3. Tune high-budget result mixing so one premium upgrade can survive ranking

This is a matcher-side distribution improvement, not a scoring rewrite.

- Goal:
  - keep most results within budget
  - allow `1-2` near/stretch options in higher-budget scenarios
- Likely impact:
  - removes several premium-range warnings even before more catalog expansion

## Could These Warnings Hurt Real Users?

Yes, but only a small subset.

Most warnings are non-critical and reflect a healthy MVP bias toward affordable, believable outfits.

The only warnings with meaningful user-risk today are:

- `Matrix Feminine Smart Casual Office / under $100`
- `Matrix Masculine Streetwear Photoshoot / under $100`

Why these matter:

- users with tight budgets may feel the app is nudging them above budget too often
- this can weaken trust if repeated in real browsing sessions

The high-budget warnings are much less harmful because:

- the app still returns strong, valid, on-brief looks
- users are not being shown broken, mislabeled, or irrelevant results
- the only missing behavior is premium variety

## Do Any Warnings Affect the Key Scenarios?

- No
- All `8/8` key scenarios pass
- None of the remaining warnings are attached to the mandatory key-scenario set

## Is It Safe To Keep The Site Live?

- Yes

Reason:

- `0` critical issues remain
- key scenarios are healthy
- no warning indicates a crash, mismatch, wrong label, broken saved snapshot shape, or invalid budget labeling
- the current warning set is mainly about:
  - premium budget variety
  - two lower-budget edge cases that should be improved next

## Recommended Priority Order

1. Fix `Feminine Smart Casual Office / under $100`
2. Fix `Masculine Streetwear Photoshoot / under $100`
3. Add premium stretch variety for office, quiet luxury, creator, and party scenarios
4. Leave travel, gym casual, and minimalist high-budget “all within budget” cases for later unless user feedback says otherwise
