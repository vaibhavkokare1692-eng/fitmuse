import type { Metadata } from "next";
import Link from "next/link";
import { TrackEventOnMount } from "@/components/AnalyticsEvents";
import { PricingCard } from "@/components/PricingCard";
import { pricingPlans } from "@/data/mock-data";

export const metadata: Metadata = {
  title: "Pricing",
};

export default function PricingPage() {
  const highlightedFuturePlan = pricingPlans.find((plan) => plan.highlighted) ?? pricingPlans[0];
  const standardPlans = pricingPlans.filter((plan) => !plan.highlighted);

  return (
    <div className="shell section-space">
      <TrackEventOnMount
        eventName="pricing_page_viewed"
        properties={{ source: "pricing_page" }}
      />
      <section className="grid gap-8 xl:grid-cols-[1.02fr_0.98fr] xl:items-end">
        <div>
          <p className="eyebrow">Access + packaging</p>
          <h1 className="max-w-4xl text-5xl leading-[0.96] text-foreground sm:text-6xl">
            Current access first. Paid packaging later.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8">
            FitMuse is currently an early product you can explore while the team validates repeat
            use, board coverage, and trust. The cards below show product-stage direction, not
            active subscriptions.
          </p>
        </div>

        <div className="soft-card">
          <p className="mini-label">What is true today</p>
          <div className="mt-4 grid gap-3">
            {[
              "The current live product is free to explore",
              "Paid plans are directional, not fully launched subscriptions",
              "Retailer-candidate boards still use manual verification before purchase",
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

        <PricingCard plan={highlightedFuturePlan} />
      </section>

      <section className="mt-12">
        <div className="dark-panel grid gap-6 p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="eyebrow !mb-0 text-accent-3">Before paid plans</p>
            <h2 className="mt-4 text-4xl text-white">FitMuse is still proving the repeat-use loop before serious paid plans.</h2>
            <p className="mt-4 max-w-2xl text-white/78">
              The next job is sharpening the brief-to-board loop, expanding board coverage, and
              keeping the mock-versus-retailer-candidate boundary clear. Pricing should follow real
              product trust, not get ahead of it.
            </p>
          </div>

          <Link href="/quiz" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-foreground hover:bg-accent-3">
            Try the style quiz
          </Link>
        </div>
      </section>
    </div>
  );
}
