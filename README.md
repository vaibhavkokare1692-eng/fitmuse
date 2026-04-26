# Fitmuse MVP

A polished MVP website for a fashion outfit recommendation startup focused on being an affordable digital stylist for creators, influencers, students, and young professionals.

## Tech stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Local mock data only for the MVP

## How to run the project

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)

4. Create a production build when needed:

```bash
npm run build
```

## Pages included

- Home page
- How It Works page
- Style Quiz / Onboarding page
- Outfit Results page
- Pricing page
- Competitor Difference page
- About page
- Contact page

## Folder structure

```text
.
|-- app
|   |-- about
|   |-- contact
|   |-- difference
|   |-- how-it-works
|   |-- pricing
|   |-- quiz
|   |-- results
|   |-- globals.css
|   `-- layout.tsx
|-- components
|   |-- ComparisonSection.tsx
|   |-- ContactForm.tsx
|   |-- FeatureCard.tsx
|   |-- Footer.tsx
|   |-- Navbar.tsx
|   |-- OutfitCard.tsx
|   |-- PricingCard.tsx
|   |-- QuizForm.tsx
|   |-- ResultsView.tsx
|   `-- SectionHeading.tsx
|-- data
|   `-- mock-data.ts
|-- lib
|   |-- recommendations.ts
|   `-- utils.ts
|-- types
|   `-- index.ts
`-- README.md
```

## Project structure notes

- `data/mock-data.ts` holds all mock outfits, pricing plans, quiz options, and comparison copy.
- `lib/recommendations.ts` ranks outfit cards using simple local logic based on quiz answers.
- `components/` contains reusable UI pieces so real APIs or auth can be added without rewriting page layouts.
- `app/results/page.tsx` uses the query string from the quiz so the MVP stays stateless and demo-friendly.

## Reusable components included

- `Navbar`
- `Footer`
- `OutfitCard`
- `PricingCard`
- `QuizForm`
- `FeatureCard`
- `ComparisonSection`

## Future improvements

- AI body-shape analysis
- Upload photo for outfit suggestions
- Virtual try-on
- Creator outfit calendar
- Saved wardrobe
- Affiliate shopping links
- Brand collaboration dashboard
- Personalized weekly outfit packs
- User accounts and saved favorites
- Real product availability and size matching

## How to connect affiliate APIs or real product feeds later

1. Replace the mock outfits in `data/mock-data.ts` with a database-backed product catalog or a normalized product service.
2. Add a product ingestion layer that stores store name, SKU, product URL, image URL, price, size data, and affiliate tracking parameters.
3. Move recommendation logic from `lib/recommendations.ts` into a server action, route handler, or backend service so scoring can combine user profile data with live inventory.
4. Store user quiz answers in a database such as PostgreSQL, Supabase, or Firebase to enable saved profiles and recurring recommendations.
5. Add affiliate tracking by appending network-specific parameters before redirecting users to retailer product pages.
6. Introduce size-matching rules per retailer to compare a user profile with brand-specific sizing tables.

## Suggestions for turning this into a real business

- Start with a creator-first niche instead of a broad fashion marketplace.
- Offer weekly creator outfit packs as a subscription product.
- Monetize through affiliate revenue plus premium personalization plans.
- Build a waitlist around content creators, college students, and young professionals.
- Partner with mid-market fashion retailers that want creator-friendly conversion channels.
- Use saved favorites, repeat quiz sessions, and creator calendars as retention levers.

## MVP notes

- This project intentionally uses placeholder product links and local mock data.
- The goal is to communicate the product idea clearly before spending time on API integrations.
- The code is organized so real feeds, user accounts, and recommendation models can be added later with minimal restructuring.
