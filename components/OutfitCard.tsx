"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Bookmark, ExternalLink } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
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

function getVisualTheme(outfitId: string) {
  switch (outfitId) {
    case "old-money-dinner-look":
      return "from-[#203138] via-[#576d63] to-[#e8d2b5]";
    case "streetwear-reel-outfit":
      return "from-[#23252c] via-[#4f5967] to-[#bbb5a7]";
    case "minimalist-coffee-date-look":
      return "from-[#3a302d] via-[#847269] to-[#efe2d7]";
    case "clean-girl-everyday-look":
      return "from-[#355f58] via-[#87a59a] to-[#f4efe7]";
    case "college-casual-fit":
      return "from-[#31455d] via-[#7182a1] to-[#f2ece2]";
    case "office-smart-casual":
      return "from-[#2c3948] via-[#6d7887] to-[#ede6dc]";
    case "party-night-outfit":
      return "from-[#171218] via-[#57344f] to-[#d1b1bb]";
    default:
      return "from-[#3a403f] via-[#81826f] to-[#eee0ce]";
  }
}

function shortenFitNote(value: string, maxLength = 108) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trimEnd()}...`;
}

export function OutfitCard({ outfit, rank, compact = false }: OutfitCardProps) {
  const [saved, setSaved] = useState(false);
  const visualTheme = getVisualTheme(outfit.id);
  const quickItems = [outfit.items.top, outfit.items.bottom, outfit.items.shoes].slice(0, 3);
  const palette = outfit.colors.slice(0, 3);
  const fitPreview = shortenFitNote(outfit.fitNotes, compact ? 82 : 96);

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="hero-card hover-lift flex h-full flex-col overflow-hidden p-4"
    >
      <div
        className={`relative h-64 overflow-hidden rounded-[1.9rem] bg-gradient-to-br ${visualTheme} p-5 text-white`}
      >
        <div className="absolute -right-6 top-6 h-24 w-24 rounded-full bg-white/18 blur-2xl" />
        <div className="absolute bottom-0 right-0 h-32 w-32 rounded-full bg-black/12 blur-2xl" />
        <div className="absolute left-10 top-18 h-28 w-28 rounded-full border border-white/12 bg-white/8 blur-[1px]" />
        <div className="absolute left-24 top-10 h-18 w-18 rounded-full border border-white/12 bg-black/8" />

        <div className="relative flex h-full flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {typeof rank === "number" && rank === 0 ? (
                <span className="rounded-full bg-white/16 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white">
                  Featured look
                </span>
              ) : null}
              <span className="rounded-full bg-white/16 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/90">
                {outfit.aesthetic}
              </span>
            </div>

            <button
              type="button"
              className={`rounded-full border px-3 py-2 text-sm font-semibold backdrop-blur-sm ${
                saved
                  ? "border-white/20 bg-white/16 text-white"
                  : "border-white/20 bg-black/10 text-white"
              }`}
              onClick={() => setSaved((current) => !current)}
            >
              <span className="flex items-center gap-2">
                <Bookmark size={14} />
                {saved ? "Saved" : "Save"}
              </span>
            </button>
          </div>

          <div className="flex items-end justify-between gap-4">
            <span className="rounded-full bg-white/14 px-3 py-2 text-xs font-medium text-white/92">
              {outfit.occasion}
            </span>
            <span className="rounded-full bg-black/12 px-3 py-2 text-xs font-medium text-white/86">
              Ready-to-buy
            </span>
          </div>
        </div>
      </div>

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
          <button
            type="button"
            className="cta-secondary"
            onClick={() => setSaved((current) => !current)}
          >
            {saved ? "Saved" : "Save"}
          </button>
          <a href={outfit.links.top} target="_blank" rel="noreferrer" className="cta-primary">
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
