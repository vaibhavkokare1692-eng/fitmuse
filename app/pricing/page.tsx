import type { Metadata } from "next";
import Link from "next/link";
import { PricingCard } from "@/components/PricingCard";
import { pricingPlans } from "@/data/mock-data";

export const metadata: Metadata = {
  title: "Pricing",
};

export default function PricingPage() {
  const influencerPlan = pricingPlans.find((plan) => plan.highlighted) ?? pricingPlans[0];
  const standardPlans = pricingPlans.filter((plan) => !plan.highlighted);

  return (
    <div className="shell section-space">
      <section className="grid gap-8 xl:grid-cols-[1.02fr_0.98fr] xl:items-end">
        <div>
          <p className="eyebrow">Pricing</p>
          <h1 className="max-w-4xl text-5xl leading-[0.96] text-foreground sm:text-6xl">
            Affordable styling plans built for repeat outfit needs.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8">
            Start free, upgrade when you want more looks, and lean into the Influencer plan when
            content days start needing weekly outfit packs.
          </p>
        </div>

        <div className="soft-card">
          <p className="mini-label">What makes the pricing clear</p>
          <div className="mt-4 grid gap-3">
            {[
              "Free for first-time users",
              "Low-cost plans for everyday styling",
              "Creator-focused tier for recurring content outfits",
            ].map((item) => (
              <div key={item} className="note-card">
                <p className="text-sm text-foreground">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-12 grid gap-6 xl:grid-cols-[0.86fr_1.14fr]">
        <div className="grid gap-6 sm:grid-cols-3">
          {standardPlans.map((plan) => (
            <PricingCard key={plan.name} plan={plan} />
          ))}
        </div>

        <PricingCard plan={influencerPlan} />
      </section>

      <section className="mt-12">
        <div className="dark-panel grid gap-6 p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="eyebrow !mb-0 text-accent-3">Most popular for creators</p>
            <h2 className="mt-4 text-4xl text-white">Weekly packs for reels, shoots, and brand days.</h2>
            <p className="mt-4 max-w-2xl text-white/78">
              The Influencer plan makes the business case obvious: frequent outfit needs, faster
              planning, and a more polished content workflow without hiring a human stylist.
            </p>
          </div>

          <Link href="/quiz" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-foreground hover:bg-accent-3">
            Take the style quiz
          </Link>
        </div>
      </section>
    </div>
  );
}
