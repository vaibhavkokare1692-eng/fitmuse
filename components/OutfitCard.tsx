"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Bookmark } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { OutfitVisual } from "@/components/OutfitVisual";
import { ShoppingLinksButton } from "@/components/ShoppingLinksButton";
import type { Outfit } from "@/types";

type OutfitCardProps = {
  outfit: Outfit;
  rank?: number;
  compact?: boolean;
};

const colorMap: Record<string, string> = {
  cream: "#eee2d0",
  camel: "#b78e67",
  espresso: "#5d4337",
  charcoal: "#3e4046",
  stone: "#b9b1a3",
  silver: "#c9ced4",
  taupe: "#957d6d",
  black: "#1f1b1a",
  white: "#f7f2eb",
  sage: "#8ca293",
  oatmeal: "#ddd2bf",
  blue: "#5c779b",
  navy: "#33445d",
  slate: "#71808e",
  "soft white": "#f4efe7",
  beige: "#d9c8ae",
};

function shortenFitNote(value: string, maxLength = 108) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trimEnd()}...`;
}

export function OutfitCard({ outfit, rank, compact = false }: OutfitCardProps) {
  const [saved, setSaved] = useState(false);
  const quickItems = [outfit.items.top, outfit.items.bottom, outfit.items.shoes].slice(0, 3);
  const palette = outfit.colors.slice(0, 3);
  const fitPreview = shortenFitNote(outfit.fitNotes, compact ? 82 : 96);
  const visualItems = [
    { category: "top" as const, name: outfit.items.top },
    { category: "bottom" as const, name: outfit.items.bottom },
    { category: "shoes" as const, name: outfit.items.shoes },
    { category: "accessory" as const, name: outfit.items.accessories },
    outfit.items.outerwear ? { category: "outerwear" as const, name: outfit.items.outerwear } : null,
  ].filter(Boolean) as Array<{
    category: "top" | "bottom" | "shoes" | "accessory" | "outerwear";
    name: string;
  }>;

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="hero-card hover-lift flex h-full flex-col overflow-hidden p-4"
    >
      <div className="flex items-start justify-between gap-3 px-2 pb-4">
        <div className="flex flex-wrap gap-2">
          {typeof rank === "number" && rank === 0 ? (
            <span className="rounded-full border border-line/70 bg-accent-4 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-2">
              Featured look
            </span>
          ) : null}
          <span className="rounded-full border border-line/70 bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground">
            {outfit.aesthetic}
          </span>
        </div>

        <button
          type="button"
          className={`rounded-full border px-3 py-2 text-sm font-semibold ${
            saved
              ? "border-accent-2 bg-accent-2 text-white"
              : "border-line/80 bg-white text-foreground"
          }`}
          onClick={() => setSaved((current) => !current)}
        >
          <span className="flex items-center gap-2">
            <Bookmark size={14} />
            {saved ? "Saved" : "Save"}
          </span>
        </button>
      </div>

      <OutfitVisual
        title={outfit.name}
        subtitle={outfit.occasion}
        palette={outfit.colors}
        items={visualItems}
        stores={outfit.stores}
        compact={compact}
      />

      <div className="flex flex-1 flex-col p-2 pt-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mini-label">{outfit.occasion}</p>
            <h3 className="mt-2 text-[2rem] leading-tight text-foreground">{outfit.name}</h3>
          </div>
          <span className="rounded-full bg-background/88 px-4 py-2 text-sm font-semibold text-foreground">
            {formatCurrency(outfit.estimatedPrice)}
          </span>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {quickItems.map((item) => (
            <span key={item} className="chip">
              {item}
            </span>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {palette.map((color) => (
            <span
              key={color}
              className="inline-flex items-center gap-2 rounded-full border border-line/70 bg-white/84 px-3 py-2 text-xs font-medium text-foreground"
            >
              <span
                className="h-3 w-3 rounded-full border border-black/10"
                style={{ backgroundColor: colorMap[color.toLowerCase()] ?? "#ddd2bf" }}
              />
              {color}
            </span>
          ))}
        </div>

        <div className="mt-5 rounded-[1.5rem] bg-white/72 p-5">
          <p className="mini-label">Fit note</p>
          <p className="mt-2 text-sm leading-6 text-foreground">{fitPreview}</p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <ShoppingLinksButton className="cta-secondary" />
        </div>
      </div>
    </motion.article>
  );
}
