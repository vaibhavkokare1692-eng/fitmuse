import { realProductLookup } from "@/data/realProducts";
import type { BudgetRange, QuizAnswers, RealOutfitPack, RealProduct } from "@/types";

export const realOutfitPacks: RealOutfitPack[] = [
  {
    id: "real-pack-oxford-date",
    name: "Old Money Date Night Pack",
    stylePreference: "masculine",
    aesthetic: "old money",
    occasion: "date",
    budgetRange: "$100-$200",
    totalPrice: 176,
    productIds: [
      "real-oxford-white-zara",
      "real-chinos-beige-mango",
      "real-loafer-brown-asos",
      "real-belt-slim-hm",
    ],
    fitNote:
      "Keeps the silhouette slim through the shirt and chinos, then grounds it with classic loafers.",
    whyItWorks:
      "This pack hits the old-money brief with crisp tailoring, soft neutrals, and a low-noise accessory mix.",
    shopReady: true,
  },
  {
    id: "real-pack-knit-date",
    name: "Polished Dinner Knit Pack",
    stylePreference: "masculine",
    aesthetic: "old money",
    occasion: "date",
    budgetRange: "$100-$200",
    totalPrice: 192,
    productIds: [
      "real-knit-polo-uniqlo",
      "real-pleated-trouser-cos",
      "real-sneaker-white-adidas",
      "real-watch-minimal-amazon-fashion",
    ],
    fitNote:
      "Uses a slimmer knit up top with refined pleated trousers so the outfit still feels put together on a lower budget.",
    whyItWorks:
      "This pack keeps the brief polished but a little softer, which works well for low-key dinner dates or coffee-to-dinner plans.",
    shopReady: true,
  },
];

type RealBrief = Pick<
  QuizAnswers,
  "stylePreference" | "aesthetic" | "occasion" | "budgetRange"
>;

export function getRealOutfitPacksForBrief(brief?: Partial<RealBrief> | null) {
  if (!brief) {
    return [];
  }

  return realOutfitPacks.filter((pack) => {
    if (brief.stylePreference && pack.stylePreference !== brief.stylePreference) {
      return false;
    }

    if (brief.aesthetic && pack.aesthetic !== brief.aesthetic) {
      return false;
    }

    if (brief.occasion && pack.occasion !== brief.occasion) {
      return false;
    }

    if (brief.budgetRange && pack.budgetRange !== brief.budgetRange) {
      return false;
    }

    return true;
  });
}

export function getRealProductsForOutfitPack(productIds: string[]): RealProduct[] {
  return productIds
    .map((productId) => realProductLookup.get(productId))
    .filter((product): product is RealProduct => Boolean(product));
}

export function getRealPackBudgetSummary(totalPrice: number, budgetRange: BudgetRange) {
  if (budgetRange === "under $100") {
    return totalPrice <= 100 ? "Within target budget" : "Over target budget";
  }

  if (budgetRange === "$100-$200") {
    return totalPrice <= 200 ? "Within target budget" : "Over target budget";
  }

  if (budgetRange === "$200-$350") {
    return totalPrice <= 350 ? "Within target budget" : "Over target budget";
  }

  return "Open budget";
}
