import type { Metadata } from "next";
import { ComparisonSection } from "@/components/ComparisonSection";
import { SectionHeading } from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "Competitor Difference",
};

export default function DifferencePage() {
  return (
    <>
      <section className="section-space">
        <div className="shell grid gap-8 lg:grid-cols-[1fr_0.85fr]">
          <SectionHeading
            eyebrow="Competitor difference"
            title="Why FitMuse feels different from typical fashion tools"
            description="FitMuse is built around brief-to-board outfit planning, not closet management or broad styling claims without clear shopping context."
          />
          <div className="soft-card">
            <h2 className="text-2xl text-foreground">Brief first. Board second.</h2>
            <p className="mt-4">
              FitMuse starts with the look you need for a real plan, then builds the board around
              budget, stores, colors, and fit.
            </p>
          </div>
        </div>
      </section>
      <ComparisonSection showIntro={false} />
    </>
  );
}
