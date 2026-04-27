# Stage 2 Real Products

FitMuse still runs on the mock recommendation engine first. This stage adds a small manual layer for testing real shopping behavior before we connect any APIs, affiliate feeds, or retailer catalogs.

## Why manual curation first

- It lets us test real shopping flows with a small, controlled scenario.
- It keeps the MVP beginner-friendly and easy to debug.
- It avoids API, scraping, inventory-sync, and affiliate-network complexity too early.
- It gives us a clean structure that real links can plug into later.

## Real product file

File: `data/realProducts.ts`

Each product entry should include:

- `id`: stable unique id
- `name`: product title shown to users
- `store`: retailer name
- `category`: `top`, `bottom`, `shoes`, `accessory`, or `outerwear`
- `price`: numeric price
- `currency`: usually `USD`
- `colors`: list of visible colors
- `sizes`: list of supported sizes
- `aestheticTags`: matching aesthetics
- `occasionTags`: matching occasions
- `fitTags`: matching fit preferences
- `stylePreferenceTags`: masculine, feminine, and/or open
- `productUrl`: current product link or placeholder
- `imageUrl`: optional future product image
- `affiliateReady`: `true` once the link is ready for affiliate tracking
- `notes`: optional curation notes

## Real outfit pack file

File: `data/realOutfitPacks.ts`

Each pack groups manually curated products into one shoppable look:

- `id`
- `name`
- `stylePreference`
- `aesthetic`
- `occasion`
- `budgetRange`
- `totalPrice`
- `productIds`
- `fitNote`
- `whyItWorks`
- `shopReady`

## Matching helper

The helper `getRealOutfitPacksForBrief` currently matches packs by:

- `stylePreference`
- `aesthetic`
- `occasion`
- `budgetRange`

This keeps the first version intentionally simple and predictable.

## How to add more real products later

1. Add a new product object to `data/realProducts.ts`.
2. Reuse the correct `category`, `aestheticTags`, `occasionTags`, and `fitTags`.
3. Replace the placeholder `productUrl` with a real PDP link when ready.
4. Set `affiliateReady` to `true` once the final tracked link exists.

## How to add more outfit packs later

1. Create a new pack in `data/realOutfitPacks.ts`.
2. Reference product ids that already exist in `realProducts`.
3. Fill in `fitNote` and `whyItWorks` with short, user-facing reasoning.
4. Set `shopReady` to `true` only when the product list is reviewable.

## Replacing normal links with affiliate links later

When FitMuse is ready for affiliate testing, the simplest upgrade path is:

- keep the same `productUrl` field
- replace plain PDP links with tracked affiliate links
- flip `affiliateReady` to `true`
- optionally add future metadata like `merchantId`, `campaignId`, or `lastCheckedAt`

This avoids changing the UI contract later.

## Region-Aware Styling Foundation

FitMuse should eventually adapt outfit recommendations based on where the user actually lives, shops, and styles themselves. That future version should consider:

- country or region
- city and climate
- local store availability
- culture and style preference
- modesty preference
- occasion norms
- budget in the local market
- seasonal and weather needs

### Product principle

FitMuse should never assume someone’s religion, culture, or clothing preference only from their country. Region-aware styling should always be guided by optional user-selected style questions instead of hardcoded assumptions.

### Future quiz fields

When the manual real-product layer expands, the quiz can add optional fields like:

- `country/region`
- `city` (optional)
- `climate/season`
- `preferred style: Western, traditional/ethnic, fusion, modest, no preference`
- `local store preference`
- `currency/market`

### First target regions

The first regions worth planning around are:

- USA
- India
- Romania
- Indonesia

### Why this matters

Most fashion apps still recommend generic outfits without considering where the user lives. FitMuse can become much more useful by ranking looks that make sense for the user’s climate, stores, budget reality, and social context while still leaving style choices in the user’s control.
