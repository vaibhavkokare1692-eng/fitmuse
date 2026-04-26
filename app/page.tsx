import type { Metadata } from "next";
import Link from "next/link";
import {
  Bookmark,
  CalendarDays,
  Link2,
  Ruler,
  Search,
  Sparkles,
  Wallet,
} from "lucide-react";
import { AppPreviewTile } from "@/components/AppPreviewTile";
import { FeatureShowcaseCard } from "@/components/FeatureShowcaseCard";
import { HeroPreview } from "@/components/HeroPreview";
import { MotionReveal } from "@/components/MotionReveal";
import { OutfitCard } from "@/components/OutfitCard";
import { PricingCard } from "@/components/PricingCard";
import { creatorUseCases, outfits, pricingPlans } from "@/data/mock-data";

export const metadata: Metadata = {
  title: "Home",
};

const problemCards = [
  {
    title: "Too many tabs",
    text: "Search everywhere. Decide nowhere.",
  },
  {
    title: "Unsure about fit",
    text: "Good pieces, wrong proportions.",
  },
  {
    title: "No complete outfit plan",
    text: "Random items, no finished look.",
  },
];

const howItWorksSteps = [
  {
    label: "01",
    title: "Share your measurements",
    text: "Add sizes and body cues.",
  },
  {
    label: "02",
    title: "Choose your aesthetic",
    text: "Pick the vibe you want.",
  },
  {
    label: "03",
    title: "Pick occasion and budget",
    text: "Keep every look realistic.",
  },
  {
    label: "04",
    title: "Get complete outfit suggestions",
    text: "See the full outfit pack.",
  },
];

const featureCards = [
  {
    title: "Smart outfit matching",
    description: "Full looks ranked around your style brief.",
    icon: Sparkles,
    variant: "matching" as const,
  },
  {
    title: "Measurement-based fit notes",
    description: "Short fit guidance that feels useful fast.",
    icon: Ruler,
    variant: "fit" as const,
  },
  {
    title: "Occasion-based looks",
    description: "Looks for reels, dates, office days, and more.",
    icon: CalendarDays,
    variant: "occasion" as const,
  },
  {
    title: "Budget-aware outfit packs",
    description: "Outfit ideas that stay inside your spend range.",
    icon: Wallet,
    variant: "budget" as const,
  },
  {
    title: "Multi-store product links",
    description: "One look, multiple stores, less searching.",
    icon: Link2,
    variant: "links" as const,
  },
  {
    title: "Saved favorites",
    description: "Keep the best looks in one calmer shortlist.",
    icon: Bookmark,
    variant: "saved" as const,
  },
];

const appPreviewTiles = [
  {
    label: "Style quiz preview",
    title: "Share a clean style brief once.",
    variant: "quiz" as const,
  },
  {
    label: "Outfit result card",
    title: "See complete looks at a glance.",
    variant: "result" as const,
  },
  {
    label: "Saved looks preview",
    title: "Keep your best options in one place.",
    variant: "saved" as const,
  },
  {
    label: "Filter panel preview",
    title: "Refine by vibe, fit, and budget.",
    variant: "filters" as const,
  },
];

const whyDifferentPoints = [
  "Complete looks, not random products",
  "Built around your measurements",
  "Made for creator-ready moments",
];

export default function HomePage() {
  const featuredLooks = outfits.slice(0, 3);
  const heroChips = creatorUseCases.slice(0, 5);

  return (
    <>
      <MotionReveal>
        <section className="section-space pb-14 pt-8 sm:pb-16">
          <div className="shell">
            <div className="relative overflow-hidden rounded-[3rem] border border-white/75 bg-white/66 px-5 py-6 shadow-[0_32px_140px_rgba(27,21,19,0.11)] backdrop-blur-xl sm:px-8 sm:py-8 lg:px-10 lg:py-10">
              <div className="absolute -left-16 top-10 h-56 w-56 rounded-full bg-accent-3/30 blur-3xl" />
              <div className="absolute right-0 top-0 h-60 w-60 rounded-full bg-accent-2/10 blur-3xl" />
              <div className="absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />

              <div className="relative grid gap-12 xl:grid-cols-[0.96fr_1.04fr] xl:items-center">
                <div className="space-y-7">
                  <div className="space-y-5">
                    <span className="pill">For creators, influencers, students, and young professionals</span>
                    <div className="space-y-5">
                      <p className="eyebrow">Premium digital styling</p>
                      <h1 className="max-w-4xl text-5xl leading-[0.9] text-foreground sm:text-6xl lg:text-7xl">
                        Creator-ready outfits, styled around you.
                      </h1>
                      <p className="max-w-2xl text-lg leading-8">
                        FitMuse builds complete looks from your measurements, aesthetic, occasion, and
                        budget <span aria-hidden="true">&mdash;</span> so you can stop scrolling and
                        start showing up styled.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Link href="/quiz" className="cta-primary">
                      Take the Style Quiz
                    </Link>
                    <Link href="#sample-looks" className="cta-secondary">
                      View Sample Looks
                    </Link>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {heroChips.map((chip) => (
                      <span key={chip} className="chip">
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>

                <HeroPreview outfit={outfits[0]} />
              </div>
            </div>
          </div>
        </section>
      </MotionReveal>

      <MotionReveal delay={0.06}>
        <section className="section-space pt-0">
          <div className="shell">
            <div className="mb-10 max-w-3xl">
              <p className="eyebrow">The problem</p>
              <h2 className="section-title text-foreground">What should I wear today?</h2>
              <p className="mt-5 max-w-2xl">That question gets expensive fast when you have content, class, work, or plans.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {problemCards.map((card) => (
                <article key={card.title} className="soft-card hover-lift p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-4 text-accent-2">
                    <Search size={18} />
                  </div>
                  <h3 className="mt-5 text-3xl text-foreground">{card.title}</h3>
                  <p className="mt-3 text-sm leading-6">{card.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </MotionReveal>

      <MotionReveal delay={0.08}>
        <section className="section-space pt-0">
          <div className="shell">
            <div className="mb-10 max-w-3xl">
              <p className="eyebrow">How it works</p>
              <h2 className="section-title text-foreground">Four quick steps. One calm flow.</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {howItWorksSteps.map((step) => (
                <article key={step.title} className="hero-card hover-lift p-5 sm:p-6">
                  <p className="mini-label">Step {step.label}</p>
                  <h3 className="mt-3 text-3xl text-foreground">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6">{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </MotionReveal>

      <MotionReveal delay={0.1}>
        <section className="section-space pt-0">
          <div className="shell">
            <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="eyebrow">Feature showcase</p>
                <h2 className="section-title text-foreground">A cleaner way to discover full outfits.</h2>
              </div>
              <p className="max-w-md text-sm leading-6 text-muted">
                Each feature is designed to make the styling flow feel fast, premium, and usable.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {featureCards.map((feature) => (
                <FeatureShowcaseCard
                  key={feature.title}
                  title={feature.title}
                  description={feature.description}
                  icon={feature.icon}
                  variant={feature.variant}
                />
              ))}
            </div>
          </div>
        </section>
      </MotionReveal>

      <MotionReveal delay={0.12}>
        <section className="section-space pt-0">
          <div className="shell grid gap-8 xl:grid-cols-[0.88fr_1.12fr] xl:items-start">
            <div className="max-w-3xl">
              <p className="eyebrow">App preview</p>
              <h2 className="section-title text-foreground">See the product before you even take the quiz.</h2>
              <p className="mt-5 max-w-2xl">
                FitMuse is meant to feel like a calm fashion-tech app, not a crowded shopping page.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {appPreviewTiles.map((tile) => (
                <AppPreviewTile
                  key={tile.title}
                  label={tile.label}
                  title={tile.title}
                  variant={tile.variant}
                />
              ))}
            </div>
          </div>
        </section>
      </MotionReveal>

      <MotionReveal delay={0.14}>
        <section id="sample-looks" className="section-space pt-0">
          <div className="shell">
            <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="eyebrow">Sample looks</p>
                <h2 className="section-title text-foreground">Ready-to-buy looks, not isolated pieces.</h2>
              </div>
              <Link href="/results" className="cta-secondary">
                View all looks
              </Link>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {featuredLooks.map((look, index) => (
                <OutfitCard key={look.id} outfit={look} rank={index} compact />
              ))}
            </div>
          </div>
        </section>
      </MotionReveal>

      <MotionReveal delay={0.16}>
        <section className="section-space pt-0">
          <div className="shell">
            <div className="mb-10 max-w-3xl">
              <p className="eyebrow">Why FitMuse feels different</p>
              <h2 className="section-title text-foreground">Three reasons it lands faster.</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {whyDifferentPoints.map((point, index) => (
                <article key={point} className="soft-card hover-lift p-6">
                  <p className="mini-label">0{index + 1}</p>
                  <h3 className="mt-3 text-3xl text-foreground">{point}</h3>
                </article>
              ))}
            </div>
          </div>
        </section>
      </MotionReveal>

      <MotionReveal delay={0.18}>
        <section className="section-space pt-0">
          <div className="shell">
            <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="eyebrow">Pricing</p>
                <h2 className="section-title text-foreground">Simple plans for everyday styling and creator packs.</h2>
              </div>
              <Link href="/pricing" className="cta-secondary">
                View pricing
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {pricingPlans.map((plan) => (
                <PricingCard key={plan.name} plan={plan} />
              ))}
            </div>
          </div>
        </section>
      </MotionReveal>

      <MotionReveal delay={0.2}>
        <section className="pb-20">
          <div className="shell">
            <div className="dark-panel overflow-hidden p-8 sm:p-10">
              <p className="eyebrow !mb-0 text-accent-3">Final CTA</p>
              <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <h2 className="text-4xl leading-tight text-white sm:text-5xl">
                    Dress better with less stress.
                  </h2>
                  <p className="mt-4 max-w-2xl text-white/78">
                    Create your style brief once and get complete looks built around your body,
                    budget, and plans.
                  </p>
                </div>
                <Link
                  href="/quiz"
                  className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-foreground hover:bg-accent-3"
                >
                  Start Styling
                </Link>
              </div>
            </div>
          </div>
        </section>
      </MotionReveal>
    </>
  );
}
