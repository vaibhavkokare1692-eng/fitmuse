import type { Metadata } from "next";
import Link from "next/link";
import { howItWorksSteps } from "@/data/mock-data";

export const metadata: Metadata = {
  title: "How It Works",
};

export default function HowItWorksPage() {
  return (
    <div className="shell section-space">
      <section className="grid gap-8 xl:grid-cols-[1.02fr_0.98fr] xl:items-end">
        <div>
          <p className="eyebrow">How it works</p>
          <h1 className="max-w-4xl text-5xl leading-[0.96] text-foreground sm:text-6xl">
            Four quick steps from brief to full look.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8">
            FitMuse starts with the person, not the product.
          </p>
        </div>

        <div className="soft-card">
          <p className="mini-label">The flow</p>
          <h2 className="mt-3 text-3xl text-foreground">Short inputs. Clear output.</h2>
          <p className="mt-4">Measurements, aesthetic, occasion, and budget become one style brief.</p>
        </div>
      </section>

      <section className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {howItWorksSteps.map((step, index) => (
          <article key={step.title} className="hero-card h-full p-5">
            <p className="mini-label">Step {index + 1}</p>
            <h2 className="mt-3 text-3xl text-foreground">{step.title}</h2>
            <p className="mt-4">{step.description}</p>
          </article>
        ))}
      </section>

      <section className="mt-12 grid gap-6 md:grid-cols-3">
        {[
          {
            title: "Input layer",
            text: "Body data, sizes, colors, stores, budget, and aesthetic all become part of the recommendation brief.",
          },
          {
            title: "Recommendation layer",
            text: "The MVP uses local mock data now, but it is already structured for live feeds, AI scoring, and size logic later.",
          },
          {
            title: "Shopping layer",
            text: "Each look is presented as a complete pack with notes, creator use cases, and placeholder shopping links.",
          },
        ].map((item) => (
          <article key={item.title} className="soft-card">
            <p className="mini-label">{item.title}</p>
            <h3 className="mt-3 text-3xl text-foreground">{item.title}</h3>
            <p className="mt-4">{item.text}</p>
          </article>
        ))}
      </section>

      <section className="mt-12">
        <div className="dark-panel grid gap-6 p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="eyebrow !mb-0 text-accent-3">Try it live</p>
            <h2 className="mt-4 text-4xl text-white">See the flow with realistic sample data.</h2>
            <p className="mt-4 max-w-2xl text-white/76">
              The quiz is the fastest way to show how FitMuse turns a short brief into a polished
              outfit pack.
            </p>
          </div>

          <Link href="/quiz" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-foreground hover:bg-accent-3">
            Open the style quiz
          </Link>
        </div>
      </section>
    </div>
  );
}
