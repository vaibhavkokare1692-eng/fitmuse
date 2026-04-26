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
            description="This page holds the fuller comparison so the homepage can stay cleaner and more visual."
          />
          <div className="soft-card">
            <h2 className="text-2xl text-foreground">Complete outfit discovery</h2>
            <p className="mt-4">FitMuse is built around full looks, not closet storage or single-brand selling.</p>
          </div>
        </div>
      </section>
      <ComparisonSection showIntro={false} />
    </>
  );
}
