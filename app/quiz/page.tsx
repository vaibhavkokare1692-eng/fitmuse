import type { Metadata } from "next";
import { QuizForm } from "@/components/QuizForm";

export const metadata: Metadata = {
  title: "Style Quiz",
};

export default function QuizPage() {
  return (
    <div className="shell section-space pt-6 sm:pt-8">
      <section className="mb-5 grid gap-4 xl:mb-8 xl:grid-cols-[1.02fr_0.98fr] xl:items-end">
        <div>
          <p className="eyebrow">Style quiz</p>
          <h1 className="max-w-4xl text-[2.7rem] leading-[0.98] text-foreground sm:text-6xl">
            Tell FitMuse your vibe, your fit, and your budget.
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 sm:mt-4 sm:text-lg sm:leading-8">
            Build a personalized style brief so FitMuse can recommend complete looks for your body,
            occasion, budget, and aesthetic.
          </p>

          <div className="mt-4 flex flex-wrap gap-2 xl:hidden">
            {["6 quick steps", "Save your brief", "Complete outfit boards"].map((item) => (
              <span key={item} className="chip text-xs sm:text-sm">
                {item}
              </span>
            ))}
          </div>
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
