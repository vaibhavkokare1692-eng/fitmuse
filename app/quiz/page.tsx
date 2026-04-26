import type { Metadata } from "next";
import { QuizForm } from "@/components/QuizForm";

export const metadata: Metadata = {
  title: "Style Quiz",
};

export default function QuizPage() {
  return (
    <div className="shell section-space">
      <section className="mb-10 grid gap-6 xl:grid-cols-[1.02fr_0.98fr] xl:items-end">
        <div>
          <p className="eyebrow">Style quiz</p>
          <h1 className="max-w-4xl text-5xl leading-[0.96] text-foreground sm:text-6xl">
            Tell FitMuse your vibe, your fit, and your budget.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8">
            A premium multi-step brief that turns body data, aesthetics, occasions, and budget into
            creator-ready outfit recommendations.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Fast to finish", value: "6 steps" },
            { label: "Inputs covered", value: "Measurements + style" },
            { label: "Output", value: "Complete outfit pack" },
          ].map((item) => (
            <div key={item.label} className="metric-card">
              <p className="mini-label">{item.label}</p>
              <p className="mt-3 text-2xl text-foreground">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <QuizForm />
    </div>
  );
}
