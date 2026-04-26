# FitMuse Project Brief

## Project name
FitMuse

## Current concept
FitMuse is an affordable digital stylist for creators, influencers, students, and young professionals. It recommends complete ready-to-buy outfits from multiple stores based on measurements, aesthetic, occasion, budget, colors, fit preference, and preferred stores.

## Target users
- Small influencers
- Content creators
- Students
- Young professionals
- Busy people who want better outfits without opening many shopping tabs

## Current design direction
- Premium, calm fashion-tech landing page
- Apple, Linear, Stripe, Notion, and Airbnb-inspired spacing and clarity
- Soft gradients, glassy cards, rounded UI, subtle depth
- Mobile-friendly, less crowded, and easy to understand quickly
- Creator-first tone rather than a generic clothing search site

## Current tech stack
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Framer Motion
- Local mock product data
- Local mock outfit matching logic
- Placeholder product links
- localStorage for quiz answers and saved looks

## Current live URL
- Public Vercel URL: [https://fitmuse-lyart.vercel.app](https://fitmuse-lyart.vercel.app)
- Local dev URL commonly used: [http://localhost:3001](http://localhost:3001)

## Main completed work so far
- Rebranded the project to `FitMuse`
- Cleaned the header branding to `FitMuse` and `Digital Styling Assistant`
- Redesigned the homepage into a premium app-style landing page
- Added a strong hero with app mockup and clear CTAs
- Added product-style sample look cards
- Added feature showcase and app preview sections
- Added pricing preview and final CTA
- Built a functional multi-step Style Quiz
- Added typed mock product catalog with 60+ products
- Added outfit matching logic using mock data
- Connected quiz answers to the Results page
- Saved quiz answers and favorites in localStorage
- Added filters on the Results page
- Added empty, loading, and fallback states
- Built and deployed the latest version to Vercel

## Current homepage structure
- Hero
- Problem section
- How it works
- Feature showcase
- App preview
- Sample looks
- Why FitMuse feels different
- Pricing
- Final CTA

## Current routes
- `/`
- `/how-it-works`
- `/quiz`
- `/results`
- `/pricing`
- `/difference`
- `/about`
- `/contact`

## Known issues
- Product links are placeholders only
- Product visuals are still gradient/mock placeholders, not real fashion imagery
- Favorites are local-only and not tied to user accounts
- Results filters do not currently sync back into the URL after changes
- Outfit matching is heuristic mock logic, not real store-feed intelligence yet
- The public demo is static and does not include auth, payments, backend storage, or real APIs
- Mobile layout is much better than before, but still needs a dedicated device QA pass

## Next steps
- Add real visual placeholders or mock product imagery for recommendation cards
- Improve mobile QA across quiz and results pages
- Decide whether results filters should update the URL for sharable filtered states
- Expand mock catalog depth for more varied outfit combinations
- Add a saved looks page or stronger saved section
- Prepare a sponsor/demo flow and redeploy after future changes

## Handoff note
Continue from the current premium MVP and functional quiz-to-results flow. Do not rebuild the website from scratch. Keep using mock data and placeholder links until the next phase adds real integrations.
