import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <div className="shell section-space">
      <section className="grid gap-8 xl:grid-cols-[1.02fr_0.98fr] xl:items-start">
        <div>
          <p className="eyebrow">About FitMuse</p>
          <h1 className="max-w-4xl text-5xl leading-[0.96] text-foreground sm:text-6xl">
            Personal styling should feel useful, modern, and affordable.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8">
            FitMuse was created to help creators, influencers, students, and young professionals
            find outfits faster, feel more confident, and stop wasting time on endless product
            searches.
          </p>
        </div>

        <div className="hero-card p-6 sm:p-8">
          <p className="mini-label">Mission</p>
          <blockquote className="mt-4 text-2xl leading-9 text-foreground sm:text-3xl">
            &ldquo;We created this platform to make personal styling affordable and accessible.&rdquo;
          </blockquote>
          <p className="mt-4">
            The goal is simple: help people show up styled without needing a personal stylist or
            spending hours building a full look alone.
          </p>
        </div>
      </section>

      <section className="mt-12 grid gap-6 md:grid-cols-3">
        {[
          {
            title: "Accessible styling",
            text: "Good styling should not be locked behind expensive services or confusing shopping experiences.",
          },
          {
            title: "Creator-first utility",
            text: "Small creators need fresh outfits often, especially for reels, shoots, collabs, events, and content days.",
          },
          {
            title: "Faster confidence",
            text: "FitMuse reduces decision fatigue by turning a short style brief into a complete outfit plan.",
          },
        ].map((item) => (
          <article key={item.title} className="soft-card">
            <p className="mini-label">{item.title}</p>
            <h2 className="mt-3 text-3xl text-foreground">{item.title}</h2>
            <p className="mt-4">{item.text}</p>
          </article>
        ))}
      </section>

      <section className="mt-12">
        <div className="dark-panel grid gap-6 p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="eyebrow !mb-0 text-accent-3">Next step</p>
            <h2 className="mt-4 text-4xl text-white">See how the styling brief actually works.</h2>
            <p className="mt-4 max-w-2xl text-white/76">
              The quiz is the clearest way to understand the product: measurements, aesthetic,
              occasion, budget, then a creator-ready outfit pack.
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
