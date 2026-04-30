# Real Product-Link MVP Plan

## 1. Purpose

FitMuse should add manually curated real product links before adding APIs, scraping, affiliate automation, login, checkout, or other heavy platform features. The goal is to prove that FitMuse can show believable, budget-aware, style-aware, store-aware outfit boards using a small maintained set of real products. This keeps the MVP practical, lower risk, and easier to maintain while preserving trust.

## 2. First 5 Stores

### Target

- Why useful for FitMuse: strong entry-level pricing, broad category coverage, easy for users to recognize and buy from.
- Best categories: basics, tees, trousers, casual shoes, bags, travel basics.
- Strengths: accessible pricing, broad size range, useful for under-$100 and $100-$200 scenarios.
- Weaknesses: less premium polish for quiet luxury or elevated office looks.
- Best style fits: smart casual, travel, everyday clean, budget office, casual weekend.

### H&M

- Why useful for FitMuse: strong volume of trend-aware basics and budget-friendly fashion pieces.
- Best categories: tops, trousers, skirts, knitwear, blazers, dresses.
- Strengths: good coverage for feminine clean minimal, office basics, and trend-aware casual looks.
- Weaknesses: some products can feel inconsistent in quality or sizing.
- Best style fits: feminine clean minimal, smart casual office, date looks, travel basics.

### Uniqlo

- Why useful for FitMuse: dependable basics, clean silhouettes, easy layering, strong travel/office crossover.
- Best categories: tees, button-downs, knitwear, trousers, lightweight outer layers.
- Strengths: strong fit-and-function basics, low visual noise, strong travel and minimalist alignment.
- Weaknesses: less expressive for party or creator-heavy styling.
- Best style fits: minimalist, clean minimal, office, travel, masculine smart casual.

### ASOS

- Why useful for FitMuse: broad style range, good for trend coverage, creator looks, and mixed/open styling.
- Best categories: trend tops, trousers, outer layers, occasion wear, footwear, streetwear pieces.
- Strengths: range across feminine, masculine, mixed/open, creator, party, and streetwear briefs.
- Weaknesses: product churn can be high, making maintenance harder.
- Best style fits: creator/photoshoot, streetwear, party, elevated casual, fashion-forward date looks.

### Nordstrom Rack

- Why useful for FitMuse: helps bridge value and premium, especially for shoes, bags, layers, and office polish.
- Best categories: loafers, boots, pointed flats, structured bags, blazers, coats, premium basics.
- Strengths: stronger stretch-upgrade and premium-smart-casual coverage without full luxury pricing.
- Weaknesses: inventory can rotate quickly and size availability can vary.
- Best style fits: office, old money, quiet luxury, elevated date looks, premium travel layers.

## 3. Stores to Postpone

### Zara

Useful later for trend-forward styling and elevated visual appeal, but not first priority because stock turns quickly and upkeep can become noisy for an MVP.

### Amazon Fashion

Useful later for breadth and price access, but first-pass curation is harder because assortment quality varies widely and consistent brand filtering matters for trust.

### Nike

Useful later for gym casual, sporty travel, and sneaker-heavy scenarios, but too specialized for the first balanced real-link MVP.

### Adidas

Useful later for sneakers, sporty streetwear, and travel basics, but not as important as broader wardrobe stores for the first board-based rollout.

### Thrift/secondhand

Useful later for uniqueness, sustainability, and budget value, but much harder to maintain because listings change quickly and item availability is unstable.

## 4. Affiliate Strategy

Affiliate revenue should be treated as a later layer, not the first implementation goal. FitMuse can start with normal outbound product links and add affiliate links once store program approvals, tracking structure, and disclosure patterns are ready.

Key rules:

- Outbound shopping links can ship before affiliate monetization.
- Store affiliate programs vary in approval rules, link formats, and commission structures.
- Affiliate-related fields should exist in the data model now so the system does not need a structural rewrite later.
- Affiliate disclosures should appear clearly near shopping links and never be hidden.
- Product selection should stay tied to user brief quality, not payout incentives.

## 5. First 10 Real Outfit Boards

The first real shopping boards should stay narrow and maintainable:

1. Feminine clean minimal date
2. Feminine everyday clean
3. Feminine smart casual office
4. Feminine travel
5. Feminine neutral brunch/date
6. Masculine old money date
7. Masculine smart casual office
8. Masculine travel
9. Masculine elevated casual weekend
10. Streetwear/photoshoot

## 6. Starting Product Count

Recommended starting size:

- `120-180` real products total
- about `20-35` products per store
- roughly `10` outfit boards first
- expand only after maintenance feels stable and manageable

This keeps manual upkeep realistic while still supporting variety across core briefs.

## 7. Product Categories

Use these MVP categories:

- top
- bottom
- dress/one-piece
- outer layer
- shoes
- bag
- accessory

## 8. Real Product Data Fields

Each real product record should include:

- `id`
- `name`
- `store`
- `brand`
- `currentPrice`
- `originalPrice`
- `currency`
- `category`
- `subcategory`
- `productUrl`
- `imageUrl`
- `colors`
- `sizes`
- `fitTags`
- `occasionTags`
- `aestheticTags`
- `stylePreferenceTags`
- `region`
- `lastCheckedDate`
- `inStock`
- `affiliateReady`
- `affiliateUrl`
- `sourceType`
- `notes`

## 9. Outfit Pack Data Fields

Each outfit pack should include:

- `id`
- `name`
- `targetStylePreference`
- `aesthetic`
- `occasion`
- `budgetRange`
- `productIds`
- `totalPrice`
- `budgetLabel`
- `fitNote`
- `whyItWorks`
- `smartSwaps`
- `lastUpdated`
- `shopReady`

## 10. Manual Curation Workflow

FitMuse should use a manual-first workflow:

- pick products manually
- do not scrape
- recheck links weekly
- recheck fast-moving stores twice weekly when needed
- mark stale or out-of-stock products quickly
- swap dead links quickly
- show `lastCheckedDate`
- do not claim live pricing unless the data is actually refreshed

This keeps the product honest and operationally manageable.

## 11. Disclaimer

Recommended MVP disclosure text:

> Product availability, sizes, and prices can change after we last checked. FitMuse may earn a commission from some links, but products are selected to match your stated budget, style, and needs.

## 12. Risks to Avoid

- hidden affiliate disclosures
- outdated prices
- broken links
- biased recommendations toward commission
- copying creator outfit boards too closely
- using product images incorrectly
- scraping without permission
- scaling too many unstable links too early

## 13. Implementation Phases

### Phase A

Documentation and data model.

### Phase B

Create `data/realProducts.ts` and `data/realOutfitPacks.ts` with placeholder examples only.

### Phase C

Add a Real Shopping Looks section behind safe mock or placeholder links.

### Phase D

Replace placeholders with manually curated real links.

### Phase E

Add affiliate links only after program approval.

## 14. QA Plan

- check broken links manually
- check `lastCheckedDate`
- check price totals
- check missing product URLs
- check missing image URLs
- check out-of-stock flags
- check affiliate disclosure
- check `Shop Full Look` behavior

## 15. Key Principle

Curate trust before scale. Ten high-quality maintained boards are better than hundreds of unstable links.

## Assumptions

- The first real-link MVP should optimize for maintainability over assortment size.
- Store choice should support budget realism and core outfit-board scenarios before edge-case fashion coverage.
- FitMuse should remain recommendation-first and trust-first, not affiliate-first.
- Real links will begin as manually curated outbound links, with affiliate support layered on only after the core workflow proves valuable.
