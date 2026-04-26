"use client";

import { motion } from "framer-motion";
import { Bookmark, ExternalLink } from "lucide-react";
import { formatCurrency, formatOptionLabel } from "@/lib/utils";
import type { OutfitRecommendation } from "@/types";

type RecommendationCardProps = {
  recommendation: OutfitRecommendation;
  saved: boolean;
  onToggleSave: (id: string) => void;
};

const colorMap: Record<string, string> = {
  cream: "#efe3d1",
  camel: "#be9774",
  espresso: "#5e4438",
  charcoal: "#43444a",
  stone: "#b4aa9c",
  silver: "#c8cdd6",
  taupe: "#9a8475",
  black: "#1d1919",
  white: "#f8f4ee",
  sage: "#90a393",
  oatmeal: "#d8cfbe",
  blue: "#6782a1",
  navy: "#35445d",
  slate: "#70808d",
  "soft white": "#f1ece5",
  beige: "#d9ccb7",
  tan: "#c09268",
  gold: "#d4b36b",
  plum: "#7a4e66",
  olive: "#68745d",
  bone: "#e7ddd1",
  sand: "#cab49a",
  chocolate: "#6c5244",
  ecru: "#e7dcc7",
};

function shorten(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trimEnd()}...`;
}

function getVisualColors(palette: string[]) {
  const resolved = palette
    .map((color) => colorMap[color.toLowerCase()] ?? "#ddd2bf")
    .slice(0, 4);

  while (resolved.length < 4) {
    resolved.push("#f0e9df");
  }

  return resolved;
}

export function RecommendationCard({
  recommendation,
  saved,
  onToggleSave,
}: RecommendationCardProps) {
  const visualColors = getVisualColors(recommendation.colorPalette);
  const itemRows = [
    { label: "Top", value: recommendation.items.top.name },
    { label: "Bottom", value: recommendation.items.bottom.name },
    { label: "Shoes", value: recommendation.items.shoes.name },
    { label: "Accessory", value: recommendation.items.accessory.name },
    recommendation.items.outerwear
      ? { label: "Outerwear", value: recommendation.items.outerwear.name }
      : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="hero-card hover-lift flex h-full flex-col overflow-hidden p-4"
    >
      <div className="relative overflow-hidden rounded-[2rem] p-5 text-white">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${visualColors[0]} 0%, ${visualColors[1]} 34%, ${visualColors[2]} 68%, ${visualColors[3]} 100%)`,
          }}
        />
        <div className="absolute -right-12 top-0 h-32 w-32 rounded-full bg-white/28 blur-3xl" />
        <div className="absolute bottom-0 left-8 h-20 w-20 rounded-full bg-black/10 blur-2xl" />
        <div className="relative flex min-h-72 flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-black/12 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white">
                {formatOptionLabel(recommendation.aesthetic)}
              </span>
              <span className="rounded-full bg-white/16 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white">
                {formatOptionLabel(recommendation.occasion)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => onToggleSave(recommendation.id)}
              className={`rounded-full border px-3 py-2 text-sm font-semibold backdrop-blur-sm ${
                saved
                  ? "border-white/18 bg-white/16 text-white"
                  : "border-white/18 bg-black/10 text-white"
              }`}
            >
              <span className="flex items-center gap-2">
                <Bookmark size={14} />
                {saved ? "Saved" : "Save"}
              </span>
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/68">
                FitMuse outfit
              </p>
              <h3 className="mt-3 text-4xl leading-tight text-white">{recommendation.name}</h3>
              <p className="mt-4 max-w-lg text-sm leading-6 text-white/84">
                {shorten(recommendation.fitNote, 108)}
              </p>
            </div>

            <div className="grid gap-3">
              <div className="rounded-[1.35rem] bg-white/18 px-4 py-4 backdrop-blur-md">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
                  Total price
                </p>
                <p className="mt-2 text-xl text-white">
                  {formatCurrency(recommendation.totalPrice)}
                </p>
              </div>
              <div className="rounded-[1.35rem] bg-black/12 px-4 py-4 backdrop-blur-md">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
                  Confidence
                </p>
                <p className="mt-2 text-xl text-white">{recommendation.confidenceScore}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-2 pt-5">
        <div className="flex flex-wrap gap-2">
          {recommendation.colorPalette.map((color) => (
            <span
              key={color}
              className="inline-flex items-center gap-2 rounded-full border border-line/70 bg-white/86 px-3 py-2 text-xs font-medium text-foreground"
            >
              <span
                className="h-3 w-3 rounded-full border border-black/10"
                style={{ backgroundColor: colorMap[color.toLowerCase()] ?? "#ddd2bf" }}
              />
              {formatOptionLabel(color)}
            </span>
          ))}
        </div>

        <div className="mt-5 grid gap-3">
          {itemRows.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between gap-3 rounded-[1.3rem] border border-line/70 bg-white/78 px-4 py-3"
            >
              <p className="mini-label">{item.label}</p>
              <p className="text-right text-sm text-foreground">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="rounded-[1.5rem] bg-white/74 p-5">
            <p className="mini-label">Fit note</p>
            <p className="mt-3 text-sm leading-6 text-foreground">
              {shorten(recommendation.fitNote, 120)}
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-background/80 p-5">
            <p className="mini-label">Why it works</p>
            <p className="mt-3 text-sm leading-6 text-foreground">
              {shorten(recommendation.whyItWorks, 120)}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            className="cta-secondary"
            onClick={() => onToggleSave(recommendation.id)}
          >
            {saved ? "Remove saved" : "Save"}
          </button>
          <a href={recommendation.shopUrl} target="_blank" rel="noreferrer" className="cta-primary">
            <span className="flex items-center gap-2">
              Shop look
              <ExternalLink size={14} />
            </span>
          </a>
        </div>
      </div>
    </motion.article>
  );
}
