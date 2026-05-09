import type { Metadata } from "next";
import {
  Bookmark,
  CalendarDays,
  Link2,
  Ruler,
  Search,
  Sparkles,
  Wallet,
} from "lucide-react";
import { TrackedLink } from "@/components/AnalyticsEvents";
import { AppPreviewTile } from "@/components/AppPreviewTile";
import { FeatureShowcaseCard } from "@/components/FeatureShowcaseCard";
import { HeroPreview } from "@/components/HeroPreview";
import { MotionReveal } from "@/components/MotionReveal";
import { OutfitCard } from "@/components/OutfitCard";
import { PricingCard } from "@/components/PricingCard";
import { outfits, pricingPlans } from "@/data/mock-data";

export const metadata: Metadata = {
  title: "Home",
};

const problemCards = [
  {
    title: "Too many tabs",
    text: "You know the vibe. The shopping journey still gets messy fast.",
  },
  {
    title: "Unclear fit reality",
    text: "The item looks good alone, but the full outfit still feels off.",
  },
  {
    title: "No finished board",
    text: "Plenty of inspiration, not enough believable complete looks.",
  },
];

const howItWorksSteps = [
  {
    label: "01",
    title: "Describe your style brief",
    text: "Set the vibe, occasion, fit, and budget first.",
  },
  {
    label: "02",
    title: "Choose stores and colors",
    text: "Tell FitMuse what feels buyable and what to avoid.",
  },
  {
    label: "03",
    title: "Lock the spend range",
    text: "Keep each outfit board grounded in a real budget.",
  },
  {
    label: "04",
    title: "Get full outfit boards",
    text: "See complete looks with reasoning, swaps, and store context.",
  },
];

const featureCards = [
  {
    title: "Complete outfit boards",
    description: "FitMuse builds full looks, not disconnected product suggestions.",
    icon: Sparkles,
    variant: "matching" as const,
  },
  {
    title: "Fit + size-aware guidance",
    description: "Quick size cues and fit notes keep the styling grounded in reality.",
    icon: Ruler,
    variant: "fit" as const,
  },
  {
    title: "Occasion-based styling",
    description: "Date night, office day, travel, creator shoot, and more.",
    icon: CalendarDays,
    variant: "occasion" as const,
  },
  {
    title: "Budget-first outfit logic",
    description: "Most looks stay within budget, with a few smart stretch upgrades.",
    icon: Wallet,
    variant: "budget" as const,
  },
  {
    title: "Preferred-store matching",
    description: "Boards prioritize stores you already trust and actually shop from.",
    icon: Link2,
    variant: "links" as const,
  },
  {
    title: "Saved favorites",
    description: "Keep your best boards in a shortlist without rebuilding the search.",
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
  "No mandatory closet upload",
  "Budget-aware from the first click",
  "Built around stores, fit, and real-life occasions",
];

export default function HomePage() {
  const featuredLooks = outfits.slice(0, 3);
  const heroChips = [
    "Brief-to-board planning",
    "Complete outfit boards",
    "No closet upload",
    "Budget-aware planning",
    "Preferred stores",
    "Color avoid logic",
    "Retailer candidates where available",
  ];

  return (
    <>
      <MotionReveal>
        <section className="section-space pb-10 pt-6 sm:pb-14 sm:pt-8">
          <div className="shell">
            <div className="relative overflow-hidden rounded-[3rem] border border-white/75 bg-white/66 px-4 py-5 shadow-[0_32px_140px_rgba(27,21,19,0.11)] backdrop-blur-xl sm:px-8 sm:py-8 lg:px-10 lg:py-10">
              <div className="absolute -left-16 top-10 h-56 w-56 rounded-full bg-accent-3/30 blur-3xl" />
              <div className="absolute right-0 top-0 h-60 w-60 rounded-full bg-accent-2/10 blur-3xl" />
              <div className="absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />

              <div className="relative grid gap-8 lg:gap-10 xl:grid-cols-[0.96fr_1.04fr] xl:items-center xl:gap-12">
                <div className="space-y-5 sm:space-y-6">
                  <div className="space-y-4 sm:space-y-5">
                    <span className="pill">For shoppers who want full looks without the closet-upload chore</span>
                    <div className="space-y-4 sm:space-y-5">
                      <p className="eyebrow">Brief-to-board outfit planning</p>
                      <h1 className="max-w-4xl text-[2.9rem] leading-[0.92] text-foreground sm:text-6xl lg:text-7xl">
                        Turn a style brief into ready-to-shop outfit boards, no closet upload required.
                      </h1>
                      <p className="max-w-2xl text-base leading-7 sm:text-lg sm:leading-8">
                        Describe the vibe, budget, occasion, preferred stores, colors, and fit you
                        want the board to solve. FitMuse turns that brief into styled outfit boards
                        and, where available, carefully labeled retailer candidates.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <TrackedLink
                      href="/quiz"
                      className="cta-primary"
                      analyticsEvent="homepage_cta_clicked"
                      analyticsProperties={{ source: "hero_primary", destination: "/quiz" }}
                    >
                      Take the Style Quiz
                    </TrackedLink>
                    <TrackedLink
                      href="#sample-looks"
                      className="inline-flex items-center justify-center px-1 py-2 text-sm font-semibold text-accent-2 underline-offset-4 hover:text-accent hover:underline"
                      analyticsEvent="homepage_cta_clicked"
                      analyticsProperties={{
                        source: "hero_sample_looks",
                        destination: "#sample-looks",
                      }}
                    >
                      View Sample Looks
                    </TrackedLink>
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
              <p className="mt-5 max-w-2xl">
                Most wardrobe apps start with cataloging. FitMuse starts with the brief behind the
                outfit you need right now: your plan, budget, stores, colors, and fit.
              </p>
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
              <h2 className="section-title text-foreground">Four quick steps. Full boards, fast.</h2>
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
                <h2 className="section-title text-foreground">A faster, more practical alternative to closet-heavy styling apps.</h2>
              </div>
              <p className="max-w-md text-sm leading-6 text-muted">
                FitMuse is built to feel useful early: clear brief inputs, complete outfit boards,
                and honest shopping context.
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
              <h2 className="section-title text-foreground">See how FitMuse turns a brief into a board.</h2>
              <p className="mt-5 max-w-2xl">
                The flow is built for believable outfit boards, not a noisy e-commerce grid or a closet catalog.
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
                <h2 className="section-title text-foreground">
                  Complete boards, not random product picks.
                </h2>
              </div>
              <TrackedLink
                href="/results"
                className="cta-secondary"
                analyticsEvent="homepage_cta_clicked"
                analyticsProperties={{ source: "sample_looks", destination: "/results" }}
              >
                View all looks
              </TrackedLink>
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
              <h2 className="section-title text-foreground">Why FitMuse feels more practical than a closet-first app.</h2>
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
                <h2 className="section-title text-foreground">
                  Current access now, future packaging later.
                </h2>
              </div>
              <TrackedLink
                href="/pricing"
                className="cta-secondary"
                analyticsEvent="homepage_cta_clicked"
                analyticsProperties={{ source: "pricing_section", destination: "/pricing" }}
              >
                View access details
              </TrackedLink>
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
                    Start with the brief, then compare the boards.
                  </h2>
                  <p className="mt-4 max-w-2xl text-white/78">
                    Create your style brief once and get complete outfit boards built around your
                    fit, budget, stores, and plans.
                  </p>
                </div>
                <TrackedLink
                  href="/quiz"
                  className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-foreground hover:bg-accent-3"
                  analyticsEvent="homepage_cta_clicked"
                  analyticsProperties={{ source: "final_cta", destination: "/quiz" }}
                >
                  Start Styling
                </TrackedLink>
              </div>
            </div>
          </div>
        </section>
      </MotionReveal>
    </>
  );
}
