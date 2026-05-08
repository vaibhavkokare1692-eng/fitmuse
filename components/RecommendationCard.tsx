"use client";

import { motion } from "framer-motion";
import { Bookmark, ChevronDown } from "lucide-react";
import {
  formatAestheticLabel,
  formatCurrency,
  formatOptionLabel,
  getUseCaseLabel,
} from "@/lib/utils";
import { OutfitVisual } from "@/components/OutfitVisual";
import { ShoppingLinksButton } from "@/components/ShoppingLinksButton";
import type { OutfitRecommendation, StylePreference } from "@/types";

type RecommendationCardProps = {
  recommendation: OutfitRecommendation;
  saved: boolean;
  onToggleSave: (id: string) => void;
  cardId?: string;
  highlighted?: boolean;
  stylePreference?: StylePreference | "";
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

  if (label === "Closest match") {
    return "bg-accent-3 text-foreground";
  }

  return "bg-white text-foreground";
}

function getBudgetBadgeClasses(label: OutfitRecommendation["budgetMatchLabel"]) {
  if (label === "Within budget") {
    return "border-emerald-200/80 bg-emerald-50 text-emerald-900";
  }

  if (label === "Stretch upgrade") {
    return "border-amber-200/90 bg-amber-50 text-amber-900";
  }

  if (label === "Over budget") {
    return "border-rose-200/90 bg-rose-50 text-rose-900";
  }

  return "border-line/70 bg-white/82 text-foreground";
}

export function RecommendationCard({
  recommendation,
  saved,
  onToggleSave,
  cardId,
  highlighted = false,
  stylePreference = "",
}: RecommendationCardProps) {
  const topReasons = recommendation.matchReasons.slice(0, 2);
  const itemRows = [
    { label: "Top", value: recommendation.items.top.name },
    { label: "Bottom", value: recommendation.items.bottom.name },
    { label: "Shoes", value: recommendation.items.shoes.name },
    recommendation.items.accessory
      ? { label: "Accessory", value: recommendation.items.accessory.name }
      : null,
    recommendation.items.outerwear
      ? { label: "Outerwear", value: recommendation.items.outerwear.name }
      : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;
  const visualItems = [
    { category: "top", name: recommendation.items.top.name },
    { category: "bottom", name: recommendation.items.bottom.name },
    { category: "shoes", name: recommendation.items.shoes.name },
    recommendation.items.accessory
      ? { category: "accessory", name: recommendation.items.accessory.name }
      : null,
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
      <div className="px-2 pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-line/70 bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground">
                {formatAestheticLabel(recommendation.aesthetic, stylePreference)}
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
            <div>
              <p className="mini-label">FitMuse recommendation</p>
              <p className="mt-2 text-sm leading-6 text-muted">
                {recommendation.creatorUseCase}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start gap-2 sm:items-end">
            <button
              type="button"
              onClick={() => onToggleSave(recommendation.id)}
              aria-pressed={saved}
              data-testid={`save-look-${recommendation.id}`}
              className={`rounded-full border px-4 py-2.5 text-sm font-semibold ${
                saved
                  ? "border-accent-2 bg-accent-2 text-white"
                  : "border-line/80 bg-white text-foreground"
              }`}
            >
              <span className="flex items-center gap-2">
                <Bookmark size={14} />
                {saved ? "Saved look" : "Save look"}
              </span>
            </button>
            <div
              aria-live="polite"
              data-testid={`save-status-${recommendation.id}`}
              className="min-h-5 text-sm font-medium text-accent-2"
            >
              {saved ? "Saved to your looks" : null}
            </div>
          </div>
        </div>
      </div>

      <OutfitVisual
        title={recommendation.name}
        subtitle={`${recommendation.confidenceScore}% confidence`}
        palette={recommendation.colorPalette}
        items={visualItems}
        stores={recommendation.stores}
      />

      <div className="mt-4 grid gap-2 px-2 sm:grid-cols-3">
        <div className="metric-card p-4">
          <p className="mini-label">Total price</p>
          <p className="mt-2 text-xl text-foreground">{formatCurrency(recommendation.totalPrice)}</p>
        </div>
        <div className="metric-card p-4">
          <p className="mini-label">Confidence</p>
          <p className="mt-2 text-xl text-foreground">{recommendation.confidenceScore}%</p>
        </div>
        <div className="metric-card p-4">
          <p className="mini-label">Budget match</p>
          <span
            className={`mt-3 inline-flex items-center rounded-full border px-3 py-2 text-xs font-semibold ${getBudgetBadgeClasses(recommendation.budgetMatchLabel)}`}
          >
            {recommendation.budgetMatchLabel}
          </span>
        </div>
      </div>

      <div className="mt-3 grid gap-2 px-2 sm:grid-cols-2">
        {[
          { label: "Occasion match", value: recommendation.occasionMatch },
          { label: "Style match", value: recommendation.styleMatch },
          { label: "Fit confidence", value: recommendation.fitConfidence },
          { label: "Store match", value: recommendation.storeMatch },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-[1.2rem] border border-line/70 bg-background/78 px-4 py-3"
          >
            <p className="mini-label">{item.label}</p>
            <p className="mt-2 text-sm text-foreground">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-1 flex-col p-2 pt-4">
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

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-full border border-line/70 bg-white/82 px-3 py-2 text-xs font-semibold text-foreground">
            {recommendation.colorHarmony}
          </span>
          <span className="inline-flex items-center rounded-full border border-line/70 bg-white/82 px-3 py-2 text-xs font-semibold text-foreground">
            {recommendation.sizeCompatibility}
          </span>
          <span className="inline-flex items-center rounded-full border border-line/70 bg-white/82 px-3 py-2 text-xs font-semibold text-foreground">
            {recommendation.matchQualityLabel}
          </span>
        </div>

        {recommendation.fitTags.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {recommendation.fitTags.map((tag) => (
              <span key={tag} className="chip text-sm">
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="trust-panel">
            <p className="mini-label">Why this outfit works</p>
            <p className="mt-3 text-sm leading-6 text-foreground">{recommendation.stylingSummary}</p>

            {topReasons.length > 0 ? (
              <div className="mt-4 grid gap-2">
                {topReasons.map((reason) => (
                  <div key={reason} className="rounded-[1.2rem] border border-white/65 bg-white/72 px-4 py-3">
                    <p className="mini-label">Match reason</p>
                    <p className="mt-2 text-sm leading-6 text-foreground">{reason}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="rounded-[1.5rem] border border-line/70 bg-white/80 p-5">
            <p className="mini-label">Core pieces</p>
            <div className="mt-4 grid gap-2">
              {itemRows.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-3 rounded-[1.2rem] border border-line/70 bg-background/70 px-4 py-3"
                >
                  <p className="mini-label">{item.label}</p>
                  <p className="text-right text-sm text-foreground">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-[1.5rem] bg-background/80 p-5">
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
            <div className="grid gap-3 md:grid-cols-2">
              {recommendation.priceBreakdown.map((lineItem) => (
                <div key={`${recommendation.id}-${lineItem.label}`} className="note-card">
                  <p className="mini-label">{lineItem.label}</p>
                  <div className="mt-2 flex items-start justify-between gap-3">
                    <p className="text-sm leading-6 text-foreground">{lineItem.itemName}</p>
                    <p className="text-sm font-semibold text-foreground">
                      {formatCurrency(lineItem.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
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
                <p className="mini-label">{getUseCaseLabel(recommendation.occasion)}</p>
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

        {recommendation.smartSwaps.length > 0 ? (
          <div className="mt-5 rounded-[1.5rem] border border-line/70 bg-white/78 p-5">
            <p className="mini-label">Smart swaps</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {recommendation.smartSwaps.map((swap) => (
                <div key={`${recommendation.id}-${swap.type}`} className="note-card">
                  <p className="mini-label">{swap.label}</p>
                  <p className="mt-2 text-sm font-medium text-foreground">{swap.suggestion}</p>
                  <p className="mt-2 text-sm leading-6 text-foreground">{swap.reason}</p>
                  {typeof swap.priceDelta === "number" ? (
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                      {swap.priceDelta > 0
                        ? `+${formatCurrency(swap.priceDelta)}`
                        : `-${formatCurrency(Math.abs(swap.priceDelta))}`}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-5 rounded-[1.5rem] border border-line/70 bg-white/78 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-xl">
              <p className="mini-label">Shopping links</p>
              <p className="mt-2 text-sm leading-6 text-muted">
                Use this to preview the MVP shopping flow. These links are still mock
                data while FitMuse prepares real retailer connections.
              </p>
            </div>
            <ShoppingLinksButton
              className="cta-secondary w-full sm:w-auto"
              testId={`shop-look-${recommendation.id}`}
            />
          </div>
        </div>
      </div>
    </motion.article>
  );
}
