"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { PricingPlan } from "@/types";

type PricingCardProps = {
  plan: PricingPlan;
};

export function PricingCard({ plan }: PricingCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={`relative h-full overflow-hidden rounded-[2rem] border p-7 shadow-[0_18px_50px_rgba(57,38,28,0.07)] ${
        plan.highlighted
          ? "border-foreground bg-foreground text-white"
          : "border-line/70 bg-white/80 text-foreground"
      }`}
    >
      <div
        className={`absolute right-0 top-0 h-28 w-28 rounded-full blur-3xl ${
          plan.highlighted ? "bg-accent/30" : "bg-accent-3/35"
        }`}
      />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className={`text-sm font-semibold uppercase tracking-[0.24em] ${
              plan.highlighted ? "text-accent-3" : "text-muted"
            }`}
          >
            {plan.highlighted ? "Best for creators" : "Plan"}
          </p>
          <h3 className="mt-3 text-3xl">{plan.name}</h3>
        </div>
        <span
          className={`rounded-full px-4 py-2 text-sm font-medium ${
            plan.highlighted ? "bg-white/10 text-white" : "bg-background/90 text-foreground"
          }`}
        >
          {plan.price}
        </span>
      </div>

      <p className={`mt-5 ${plan.highlighted ? "text-white/80" : "text-muted"}`}>
        {plan.description}
      </p>

      <ul className="mt-6 grid gap-3">
        {plan.features.map((feature) => (
          <li
            key={feature}
            className={`rounded-2xl px-4 py-3 text-sm ${
              plan.highlighted ? "bg-white/10 text-white/90" : "bg-background/85 text-foreground"
            }`}
          >
            {feature}
          </li>
        ))}
      </ul>

      <Link
        href="/quiz"
        className={`mt-8 inline-flex rounded-full px-5 py-3 text-sm font-semibold ${
          plan.highlighted
            ? "bg-white text-foreground hover:bg-accent-3"
            : "bg-foreground text-white hover:bg-accent"
        }`}
      >
        Take quiz
      </Link>
    </motion.article>
  );
}
