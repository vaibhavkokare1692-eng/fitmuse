# FitMuse Phase 2 Notes

## What changed in product data

- The mock catalog was expanded into a larger multi-store product dataset in [data/products.ts](C:/Users/vaibh/Documents/Codex/2026-04-24/i-want-you-to-build-a/data/products.ts).
- The catalog now includes 140 mock products with:
  - `id`
  - `name`
  - `brand`
  - `store`
  - `category`
  - `price`
  - `aestheticTags`
  - `occasionTags`
  - `colors`
  - `primaryColor`
  - `colorFamily`
  - `availableSizes`
  - `fitType`
  - `stylePreferences`
  - `styleNotes`
  - `image`
  - `visualType`
  - `url`
  - `affiliateReady`
- Products cover the Phase 2 aesthetics:
  - old money
  - streetwear
  - minimalist
  - clean girl
  - smart casual
  - office
  - party
  - date night
  - travel
  - creator/photoshoot
  - luxury neutral
  - gym casual

## How recommendation matching works

The recommendation logic lives in [utils/outfitMatcher.ts](C:/Users/vaibh/Documents/Codex/2026-04-24/i-want-you-to-build-a/utils/outfitMatcher.ts).

For each product, FitMuse scores:

- aesthetic match
- occasion match
- size availability
- fit preference match
- style preference match
- preferred color overlap
- avoided color conflicts
- liked-store overlap
- budget alignment
- creator-content alignment

Then it builds complete outfits from:

- top
- bottom
- shoes
- accessory
- optional outerwear

Each recommendation includes:

- total price
- confidence score
- match quality label
- budget match label
- budget note
- match reasons
- creator use case
- fit note
- why-it-works summary

## How fallback logic works

- If strong exact combinations are available, FitMuse returns those first.
- If the best combinations are only approximate, the results are marked as `Closest match`.
- If the recommendation pool becomes too narrow, FitMuse still returns a complete fallback look instead of a blank screen.
- The results page also shows a clear message:
  - `No perfect match yet, but these looks are closest to your style brief.`

## How saved looks work

- Saved look ids are stored in browser `localStorage`.
- The storage helpers live in [lib/local-storage.ts](C:/Users/vaibh/Documents/Codex/2026-04-24/i-want-you-to-build-a/lib/local-storage.ts).
- On the results page:
  - clicking `Save look` stores the recommendation id
  - a saved look snapshot is stored alongside the id so it can still be shown after refresh
  - clicking `Saved` removes it
  - saved ids and saved look cards are restored on refresh
  - the `Saved Looks` section prefers current recommendation data when a saved id is still in the active result set

## What should be added later with real APIs

- real product feeds from retailers or affiliate networks
- live product imagery
- stock and size availability checks
- true shopping links
- store-specific commissions and affiliate tracking
- smarter deduping across stores
- better personalization from behavior history
- recommendation analytics and click tracking
- account sync so saved looks persist across devices
