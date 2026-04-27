"use client";

import { motion } from "framer-motion";
import { Bookmark, ChevronDown } from "lucide-react";
import { formatCurrency, formatOptionLabel } from "@/lib/utils";
import { OutfitVisual } from "@/components/OutfitVisual";
import { ShoppingLinksButton } from "@/components/ShoppingLinksButton";
import type { OutfitRecommendation } from "@/types";

type RecommendationCardProps = {
  recommendation: OutfitRecommendation;
  saved: boolean;
  onToggleSave: (id: string) => void;
  cardId?: string;
  highlighted?: boolean;
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

function getMatchBadgeClasses(label: OutfitRecommendation["matchQualityLabel"]) {
  if (label === "Best match") {
    return "bg-[#17363d] text-white";
  }

  if (label === "Creator-ready") {
    return "bg-foreground text-white";
  }

  if (label === "Closest match") {
    return "bg-accent-3 text-foreground";
  }

  return "bg-white text-foreground";
}

function getBudgetBadgeClasses(label: OutfitRecommendation["budgetMatchLabel"]) {
  if (label === "Under budget") {
    return "border-emerald-200/80 bg-emerald-50 text-emerald-900";
  }

  if (label === "Over budget but strong match") {
    return "border-amber-200/90 bg-amber-50 text-amber-900";
  }

  return "border-line/70 bg-white/82 text-foreground";
}

export function RecommendationCard({
  recommendation,
  saved,
  onToggleSave,
  cardId,
  highlighted = false,
}: RecommendationCardProps) {
  const topReasons = recommendation.matchReasons.slice(0, 2);
  const itemRows = [
    { label: "Top", value: recommendation.items.top.name },
    { label: "Bottom", value: recommendation.items.bottom.name },
    { label: "Shoes", value: recommendation.items.shoes.name },
    { label: "Accessory", value: recommendation.items.accessory.name },
    recommendation.items.outerwear
      ? { label: "Outerwear", value: recommendation.items.outerwear.name }
      : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;
  const visualItems = [
    { category: "top", name: recommendation.items.top.name },
    { category: "bottom", name: recommendation.items.bottom.name },
    { category: "shoes", name: recommendation.items.shoes.name },
    { category: "accessory", name: recommendation.items.accessory.name },
    recommendation.items.outerwear
      ? { category: "outerwear", name: recommendation.items.outerwear.name }
      : null,
  ].filter(Boolean) as Array<{
    category: "top" | "bottom" | "shoes" | "accessory" | "outerwear";
    name: string;
  }>;

  return (
    <motion.article
      id={cardId}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      data-testid={`look-card-${recommendation.id}`}
      className={`hero-card hover-lift scroll-mt-24 flex h-full flex-col overflow-hidden p-4 transition-[box-shadow,border-color,background-color] duration-500 ${
        highlighted
          ? "ring-2 ring-accent-2/70 shadow-[0_24px_55px_rgba(35,79,94,0.20)] bg-accent-4/45"
          : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3 px-2 pb-4">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-line/70 bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground">
            {formatOptionLabel(recommendation.aesthetic)}
          </span>
          <span className="rounded-full border border-line/70 bg-background/86 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground">
            {formatOptionLabel(recommendation.occasion)}
          </span>
          <span
            className={`rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] ${getMatchBadgeClasses(recommendation.matchQualityLabel)}`}
          >
            {recommendation.matchQualityLabel}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onToggleSave(recommendation.id)}
          aria-pressed={saved}
          data-testid={`save-look-${recommendation.id}`}
          className={`rounded-full border px-3 py-2 text-sm font-semibold ${
            saved
              ? "border-accent-2 bg-accent-2 text-white"
              : "border-line/80 bg-white text-foreground"
          }`}
        >
          <span className="flex items-center gap-2">
            <Bookmark size={14} />
            {saved ? "Saved" : "Save look"}
          </span>
        </button>
      </div>

      <OutfitVisual
        title={recommendation.name}
        subtitle={`${recommendation.confidenceScore}% confidence`}
        palette={recommendation.colorPalette}
        items={visualItems}
        stores={recommendation.stores}
      />

      <div className="mt-4 grid gap-3 px-2 sm:grid-cols-3">
        <div className="rounded-[1.35rem] border border-line/70 bg-white/86 px-4 py-4">
          <p className="mini-label">Total price</p>
          <p className="mt-2 text-xl text-foreground">{formatCurrency(recommendation.totalPrice)}</p>
        </div>
        <div className="rounded-[1.35rem] border border-line/70 bg-background/84 px-4 py-4">
          <p className="mini-label">Confidence</p>
          <p className="mt-2 text-xl text-foreground">{recommendation.confidenceScore}%</p>
        </div>
        <div className="rounded-[1.35rem] border border-line/70 bg-background/84 px-4 py-4">
          <p className="mini-label">Budget match</p>
          <p className="mt-2 text-base text-foreground">{recommendation.budgetMatchLabel}</p>
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

        <div className="mt-5 flex flex-wrap gap-2">
          <span
            className={`inline-flex items-center rounded-full border px-3 py-2 text-xs font-semibold ${getBudgetBadgeClasses(recommendation.budgetMatchLabel)}`}
          >
            {recommendation.budgetMatchLabel}
          </span>
          <span className="inline-flex items-center rounded-full border border-line/70 bg-white/82 px-3 py-2 text-xs font-semibold text-foreground">
            {recommendation.matchQualityLabel}
          </span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {topReasons.map((reason) => (
            <div key={reason} className="rounded-[1.35rem] border border-line/70 bg-white/80 p-4">
              <p className="mini-label">Match reason</p>
              <p className="mt-3 text-sm leading-6 text-foreground">{reason}</p>
            </div>
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

        <div className="mt-5 rounded-[1.5rem] bg-background/80 p-5">
          <p className="mini-label">Fit note</p>
          <p className="mt-3 text-sm leading-6 text-foreground">
            {shorten(recommendation.fitNote, 120)}
          </p>
        </div>

        <details className="mt-5 rounded-[1.5rem] border border-line/70 bg-white/74 p-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-foreground">
            Why this look?
            <ChevronDown size={16} />
          </summary>
          <div className="mt-4 grid gap-4">
            <div>
              <p className="mini-label">Full match reasons</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {recommendation.matchReasons.map((reason) => (
                  <span key={reason} className="chip">
                    {reason}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="note-card">
                <p className="mini-label">Creator use case</p>
                <p className="mt-2 text-sm leading-6 text-foreground">{recommendation.creatorUseCase}</p>
              </div>
              <div className="note-card">
                <p className="mini-label">Budget note</p>
                <p className="mt-2 text-sm leading-6 text-foreground">{recommendation.budgetNote}</p>
              </div>
            </div>
            <div className="note-card">
              <p className="mini-label">Why it works</p>
              <p className="mt-2 text-sm leading-6 text-foreground">{recommendation.whyItWorks}</p>
            </div>
          </div>
        </details>

        <div className="mt-6 flex flex-wrap gap-3">
          <ShoppingLinksButton className="cta-secondary" testId={`shop-look-${recommendation.id}`} />
        </div>

        <div aria-live="polite" data-testid={`save-status-${recommendation.id}`} className="mt-3 min-h-6">
          {saved ? (
            <p className="text-sm font-medium text-accent-2">Saved to your looks</p>
          ) : null}
        </div>
      </div>
    </motion.article>
  );
}
