"use client";

import { Layers3 } from "lucide-react";
import { formatOptionLabel } from "@/lib/utils";

type VisualCategory = "top" | "bottom" | "shoes" | "accessory" | "outerwear";

type VisualItem = {
  category: VisualCategory;
  name: string;
};

type OutfitVisualProps = {
  title?: string;
  subtitle?: string;
  palette: string[];
  items: VisualItem[];
  stores?: string[];
  className?: string;
  compact?: boolean;
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
  mocha: "#8d6e5e",
  ivory: "#f3ebdf",
  grey: "#76787f",
  graphite: "#50535a",
  pearl: "#d8d5cf",
  pink: "#d9b8bd",
};

function shorten(value: string, maxLength = 22) {
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
    resolved.push("#f1ebe3");
  }

  return resolved;
}

function getShapeClasses(category: VisualCategory, compact: boolean) {
  if (category === "top") {
    return compact ? "h-16 w-18 rounded-[1.4rem]" : "h-20 w-24 rounded-[1.6rem]";
  }

  if (category === "bottom") {
    return compact ? "h-22 w-20 rounded-[1.6rem]" : "h-28 w-26 rounded-[1.9rem]";
  }

  if (category === "shoes") {
    return compact ? "h-8 w-10 rounded-[1rem]" : "h-10 w-12 rounded-[1.1rem]";
  }

  if (category === "outerwear") {
    return compact
      ? "h-32 w-26 rounded-[2rem] opacity-74"
      : "h-40 w-32 rounded-[2.4rem] opacity-72";
  }

  return compact ? "h-9 w-9 rounded-full" : "h-11 w-11 rounded-full";
}

function getShapeOffset(category: VisualCategory) {
  if (category === "outerwear") {
    return "-translate-y-2";
  }

  if (category === "accessory") {
    return "-translate-x-8 -translate-y-6";
  }

  if (category === "shoes") {
    return "";
  }

  return "";
}

export function OutfitVisual({
  title = "Outfit preview",
  subtitle = "FitMuse styling board",
  palette,
  items,
  stores = [],
  className = "",
  compact = false,
}: OutfitVisualProps) {
  const colors = getVisualColors(palette);
  const accentItems = items.slice(0, 5);
  const top = accentItems.find((item) => item.category === "top");
  const bottom = accentItems.find((item) => item.category === "bottom");
  const shoes = accentItems.find((item) => item.category === "shoes");
  const accessory = accentItems.find((item) => item.category === "accessory");
  const outerwear = accentItems.find((item) => item.category === "outerwear");
  const wardrobe = [top, bottom, shoes, accessory].filter(Boolean) as VisualItem[];
  const containerPadding = compact ? "p-3 sm:p-4" : "p-4";
  const visualMinHeight = compact ? "min-h-44 sm:min-h-48 md:min-h-52" : "min-h-52";

  return (
    <div
      className={`relative overflow-hidden rounded-[2rem] border border-white/70 ${containerPadding} text-white shadow-[0_24px_70px_rgba(27,21,19,0.12)] ${className}`}
      style={{
        background: `linear-gradient(145deg, ${colors[0]} 0%, ${colors[1]} 34%, ${colors[2]} 68%, ${colors[3]} 100%)`,
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.48),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(17,15,14,0.12),transparent_28%)]" />
      <div className="absolute -right-10 top-4 h-28 w-28 rounded-full bg-white/22 blur-3xl" />
      <div className="absolute bottom-0 left-1/4 h-24 w-24 rounded-full bg-black/10 blur-2xl" />

      <div className="relative flex flex-col gap-3 sm:gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/66">
              {subtitle}
            </p>
            <p className={`${compact ? "hidden sm:block" : "block"} mt-2 text-base font-semibold text-white sm:text-lg`}>
              {title}
            </p>
          </div>
          <span className="rounded-full bg-white/14 p-2 text-white/88">
            <Layers3 size={compact ? 15 : 16} />
          </span>
        </div>

        <div className={`grid gap-3 sm:gap-4 ${compact ? "md:grid-cols-[0.88fr_1.12fr]" : "md:grid-cols-[0.96fr_1.04fr]"}`}>
          <div className={`relative flex ${visualMinHeight} items-end justify-center rounded-[1.7rem] border border-white/16 bg-white/10 p-4 backdrop-blur-md`}>
            <div className="absolute inset-x-4 top-4 h-px bg-white/16" />
            <div className="absolute bottom-4 left-4 right-4 flex gap-1">
              {colors.map((color, index) => (
                <span
                  key={`${color}-${index}`}
                  className="h-2 flex-1 rounded-full"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            <div className="relative flex h-full items-end gap-2 pb-5">
              {outerwear ? (
                <div
                  className={`absolute left-1/2 top-5 -translate-x-1/2 border border-white/18 bg-white/10 backdrop-blur-sm ${getShapeClasses("outerwear", compact)} ${getShapeOffset("outerwear")}`}
                />
              ) : null}

              {accessory ? (
                <div
                  className={`absolute left-1/2 top-10 border border-white/18 bg-white/18 backdrop-blur-sm ${getShapeClasses("accessory", compact)} ${getShapeOffset("accessory")}`}
                />
              ) : null}

              {top ? (
                <div
                  className={`${compact ? "mb-14 sm:mb-20" : "mb-20"} border border-white/18 bg-white/18 shadow-[0_14px_28px_rgba(0,0,0,0.08)] backdrop-blur-sm ${getShapeClasses("top", compact)}`}
                />
              ) : null}

              {bottom ? (
                <div
                  className={`absolute ${compact ? "bottom-10 sm:bottom-12" : "bottom-12"} left-1/2 -translate-x-1/2 border border-white/18 bg-black/12 shadow-[0_14px_28px_rgba(0,0,0,0.08)] backdrop-blur-sm ${getShapeClasses("bottom", compact)}`}
                />
              ) : null}

              {shoes ? (
                <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
                  <div className={`border border-white/18 bg-black/16 backdrop-blur-sm ${getShapeClasses("shoes", compact)}`} />
                  <div className={`border border-white/18 bg-black/16 backdrop-blur-sm ${getShapeClasses("shoes", compact)}`} />
                </div>
              ) : null}
            </div>
          </div>

          <div className={`${compact ? "hidden sm:grid" : "grid"} gap-3`}>
            {wardrobe.map((item) => (
              <div
                key={`${item.category}-${item.name}`}
                className="rounded-[1.3rem] border border-white/18 bg-white/14 px-4 py-3 backdrop-blur-md"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/68">
                  {formatOptionLabel(item.category)}
                </p>
                <p className="mt-2 text-sm text-white/92">{shorten(item.name, compact ? 20 : 26)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={`${compact ? "hidden sm:flex" : "flex"} flex-wrap items-center justify-between gap-3`}>
          <div className="flex flex-wrap gap-2">
            {accentItems.map((item, index) => (
              <span
                key={`${item.category}-${item.name}-${index}-label`}
                className="rounded-full bg-black/12 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/88"
              >
                {formatOptionLabel(item.category)}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {stores.slice(0, 2).map((store) => (
              <span
                key={store}
                className="rounded-full border border-white/18 bg-white/14 px-3 py-2 text-xs font-medium text-white/92"
              >
                {store}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
