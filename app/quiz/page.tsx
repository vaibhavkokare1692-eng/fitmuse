import type { Metadata } from "next";
import { QuizForm } from "@/components/QuizForm";

export const metadata: Metadata = {
  title: "Style Quiz",
};

export default function QuizPage() {
  return (
    <div className="shell section-space">
      <section className="mb-6 grid gap-5 xl:mb-10 xl:grid-cols-[1.02fr_0.98fr] xl:items-end">
        <div>
          <p className="eyebrow">Style quiz</p>
          <h1 className="max-w-4xl text-4xl leading-[0.98] text-foreground sm:text-6xl">
            Tell FitMuse your vibe, your fit, and your budget.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 sm:text-lg sm:leading-8">
            Build a personalized style brief so FitMuse can recommend complete looks for your body,
            occasion, budget, and aesthetic.
          </p>
        </div>

        <div className="hidden gap-4 xl:grid xl:grid-cols-3">
          {[
            { label: "Fast to finish", value: "6 steps" },
            { label: "Inputs covered", value: "Budget + fit + stores" },
            { label: "Output", value: "Complete outfit boards" },
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
