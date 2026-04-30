# Real Product Data Guide

## Purpose

This guide explains how FitMuse should maintain the first manually curated real-product MVP data layer. These files are intentionally lightweight and manual so the team can validate real shopping flows before adding APIs, scraping, affiliate automation, login, or checkout.

## Files

- `data/realProducts.ts`
- `data/realOutfitPacks.ts`

## How to Add a Real Product

1. Open `data/realProducts.ts`.
2. Add a new object to the `realProducts` array.
3. Fill every required field:
   - `id`
   - `name`
   - `store`
   - `brand`
   - `currentPrice`
   - `currency`
   - `category`
   - `subcategory`
   - `productUrl`
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
   - `sourceType`
4. Add optional fields when relevant:
   - `originalPrice`
   - `imageUrl`
   - `affiliateUrl`
   - `notes`
5. Keep the tags practical and user-brief friendly. The data should help future outfit-board matching, not just describe the item in retail language.

## How to Add a Real Outfit Pack

1. Open `data/realOutfitPacks.ts`.
2. Add a new object to the `realOutfitPacks` array.
3. Reference products by id using `productIds`.
4. Fill the pack fields:
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
5. Keep `totalPrice` aligned with the sum of the referenced product prices.
6. Use `shopReady: false` if the pack is still incomplete or needs link validation.

## Why Placeholder Links Are Used for Now

The MVP is intentionally not using real outbound links yet. Placeholder links allow FitMuse to:

- validate the data structure first
- test pack composition safely
- avoid broken live shopping links during setup
- keep the product honest while the first manual curation workflow is being refined

Use this placeholder until a manually verified product page is ready:

- `https://example.com/replace-with-real-product-link`

## How `lastCheckedDate` Should Be Updated

- Update `lastCheckedDate` whenever a human rechecks the product page.
- Recheck stable stores at least weekly.
- Recheck faster-moving stores more often when they are featured heavily.
- If a product goes out of stock, either:
  - set `inStock` to `false`, or
  - replace it with a better active option

Do not imply that pricing or stock is live if the item has not been manually rechecked.

## How Affiliate Links Can Replace Normal Links Later

The current data model already includes:

- `affiliateReady`
- `affiliateUrl`

When affiliate programs are approved later:

1. keep `productUrl` as the clean destination page if needed
2. set `affiliateReady` to `true`
3. add the tracked link in `affiliateUrl`
4. make sure disclosure text appears near outbound shopping links in the UI

Affiliate support should be layered in after trust and maintenance quality are already strong.

## Why No Scraping or APIs Are Used Yet

FitMuse is avoiding scraping and live APIs in the first phase because the team needs:

- a simpler MVP
- lower maintenance risk
- clearer legal and operational boundaries
- tighter control over quality
- a manual trust-first curation workflow

The first goal is not scale. The first goal is proving that well-maintained, manually curated real shopping boards improve user trust and product usefulness.
