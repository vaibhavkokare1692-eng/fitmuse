import {
  getRealProductById,
  getShopReadyRealProducts,
  realProductLookup,
} from "@/data/realProducts";
import type { BudgetRange, QuizAnswers, RealOutfitPack, RealProduct } from "@/types";

// These outfit packs are manually curated MVP placeholders.
// They intentionally use placeholder product links until the team replaces them by hand.
// Pricing should be treated as manually checked, not live.

const DEFAULT_LAST_UPDATED = "2026-04-30";

type RealShoppingBrief = Partial<
  Pick<QuizAnswers, "stylePreference" | "aesthetic" | "occasion" | "budgetRange">
> & {
  stylePreference?: string;
  aesthetic?: string;
  occasion?: string;
  budgetRange?: string;
};

function sumPackPrice(productIds: string[]) {
  const total = productIds.reduce((runningTotal, productId) => {
    const product = getRealProductById(productId);
    return runningTotal + (product?.currentPrice ?? 0);
  }, 0);

  return Math.round(total * 100) / 100;
}

function normalize(value?: string | null) {
  return value?.trim().toLowerCase() ?? "";
}

function canonicalizeAesthetic(value?: string | null) {
  const normalized = normalize(value);

  if (
    normalized === "clean girl" ||
    normalized === "clean minimal" ||
    normalized === "minimalist"
  ) {
    return "clean minimal";
  }

  if (normalized === "quiet luxury" || normalized === "old money") {
    return "old money";
  }

  if (normalized === "creator/photoshoot" || normalized === "streetwear") {
    return normalized;
  }

  if (normalized === "smart casual" || normalized === "office") {
    return normalized;
  }

  return normalized;
}

function canonicalizeOccasion(value?: string | null) {
  const normalized = normalize(value);

  if (normalized === "everyday") {
    return "daily wear";
  }

  if (
    normalized === "office" ||
    normalized === "work" ||
    normalized === "interview" ||
    normalized === "meeting" ||
    normalized === "business casual"
  ) {
    return "office";
  }

  if (normalized === "brand content" || normalized === "reels") {
    return "photoshoot";
  }

  return normalized;
}

export const realOutfitPacks: RealOutfitPack[] = [
  {
    id: "real-pack-feminine-clean-minimal-date",
    name: "Classic Clean Minimal Date Look",
    targetStylePreference: "feminine",
    aesthetic: "clean minimal",
    occasion: "date",
    budgetRange: "$100-$200",
    productIds: [
      "real-target-clean-minimal-slip-dress-cream-floral",
      "real-hm-fine-knit-cardigan-light-beige",
      "real-hm-crossover-strap-sandals-beige",
      "real-hm-shoulder-bag-long-handles-beige-olive",
      "real-hm-delicate-gold-necklace-candidate",
    ],
    totalPrice: 126.46,
    budgetLabel: "Within budget",
    fitNote:
      "Soft neutral pieces with a simple slip silhouette, lightweight cardigan, walkable sandals, and compact shoulder bag.",
    whyItWorks:
      "Cream floral, beige, and gold tones create a soft clean-minimal date look. The cardigan adds comfort and temperature flexibility, sandals keep the outfit walkable, and the shoulder bag plus necklace make it feel styled without looking overdone.",
    smartSwaps: [
      {
        label: "Cheaper swap",
        note: "Swap in the H&M Ring Pendant Necklace at $6.99 if you want a lower-cost jewelry finish while keeping the overall look intact.",
      },
      {
        label: "Premium swap",
        note: "Replace the cardigan with a lightweight linen blazer when you want a sharper premium layer.",
      },
      {
        label: "Casual swap",
        note: "Replace the sandals with clean white sneakers to make the outfit feel easier for daytime plans.",
      },
      {
        label: "Dressy swap",
        note: "Replace the sandals with a low heel or slingback for a slightly dressier finish.",
      },
    ],
    notes:
      "Four of five item prices were verified from active product pages on 2026-04-30. Keep the board in needs-manual-verification mode until the Target dress price is checked one more time on the retailer site before launch.",
    lastUpdated: DEFAULT_LAST_UPDATED,
    shopReady: true,
    verificationStatus: "needs_manual_verification",
  },
  {
    id: "real-pack-feminine-everyday-clean",
    name: "Everyday Clean Target + H&M Mix",
    targetStylePreference: "feminine",
    aesthetic: "clean minimal",
    occasion: "daily wear",
    budgetRange: "$100-$200",
    productIds: [
      "real-hm-cotton-tshirt-white",
      "real-hm-wide-leg-dress-pants-light-beige",
      "real-target-julie-ballet-flats-neutral",
      "real-target-elevated-camera-crossbody-tan",
      "real-hm-delicate-gold-necklace-candidate",
      "real-hm-fine-knit-cardigan-light-beige",
    ],
    totalPrice: 101.46,
    budgetLabel: "Within budget",
    fitNote:
      "Clean white and beige pieces create a polished everyday base with comfortable wide-leg trousers, walkable flats, and a hands-free crossbody.",
    whyItWorks:
      "This outfit uses affordable neutral basics that still look intentional. The wide-leg trousers make the look more polished than jeans, the ballet flats keep it walkable, and the cardigan adds softness for coffee, errands, casual lunch, or a casual workday.",
    smartSwaps: [
      {
        label: "Cheaper swap",
        note: "Remove the cardigan or swap the flats for the H&M crossover-strap sandals when you want a lighter total or a warmer-weather finish.",
      },
      {
        label: "Premium swap",
        note: "Upgrade the tee to the Uniqlo AIRism Cotton T-Shirt when you want a stronger premium-basics feel.",
      },
      {
        label: "Casual swap",
        note: "Replace the flats with clean white sneakers to make the outfit feel even easier for errands or campus days.",
      },
      {
        label: "Dressy swap",
        note: "Replace the tee with a silk or silk-blend blouse for a more polished office-adjacent version.",
      },
    ],
    notes:
      "All listed product pages were verified on 2026-04-30, but the pack must stay in needs-manual-verification mode until launch-time price, stock, and size checks are completed on the retailer sites.",
    lastUpdated: DEFAULT_LAST_UPDATED,
    shopReady: true,
    verificationStatus: "needs_manual_verification",
  },
  {
    id: "real-pack-feminine-smart-casual-office",
    name: "Feminine Smart Casual Office",
    targetStylePreference: "feminine",
    aesthetic: "smart casual",
    occasion: "office",
    budgetRange: "$100-$200",
    productIds: [
      "real-hm-clean-blouse-cream",
      "real-hm-straight-trouser-charcoal",
      "real-target-pointed-flats-black",
      "real-target-structured-mini-tote-tan",
      "real-asos-chain-necklace-silver",
    ],
    totalPrice: 116,
    budgetLabel: "Within budget",
    fitNote: "Tailored trousers and pointed shoes keep the work silhouette sharp while the blouse softens the finish.",
    whyItWorks:
      "This board feels office-ready without going stiff: clean blouse, straight trousers, refined flats, and a structured tote do the heavy lifting.",
    smartSwaps: [
      {
        label: "Warmer layer swap",
        note: "Add the Uniqlo cardigan when the office runs cold or the commute needs a third piece.",
      },
      {
        label: "Dressier swap",
        note: "Use the slip skirt and blouse together for a more editorial office-to-dinner variation.",
      },
    ],
    lastUpdated: DEFAULT_LAST_UPDATED,
    shopReady: true,
  },
  {
    id: "real-pack-masculine-old-money-date",
    name: "Masculine Old Money Date",
    targetStylePreference: "masculine",
    aesthetic: "old money",
    occasion: "date",
    budgetRange: "$100-$200",
    productIds: [
      "real-nordstrom-rack-oxford-shirt-off-white",
      "real-nordstrom-rack-pleated-trouser-camel",
      "real-nordstrom-rack-penny-loafer-brown",
      "real-nordstrom-rack-slim-belt-brown",
    ],
    totalPrice: 160,
    budgetLabel: "Within budget",
    fitNote: "The shirt and trouser pairing keeps the line clean, while loafers and a matching belt reinforce polish without feeling formal.",
    whyItWorks:
      "This pack captures the old-money brief through soft neutrals, clean tailoring, and low-noise accessories that still feel approachable for a date.",
    smartSwaps: [
      {
        label: "Office crossover swap",
        note: "Add the navy blazer later if you want this board to stretch into meetings or dinners with stricter dress codes.",
      },
      {
        label: "Softer swap",
        note: "Swap in the Uniqlo merino quarter-zip for cooler weather or a more relaxed dinner setting.",
      },
    ],
    lastUpdated: DEFAULT_LAST_UPDATED,
    shopReady: true,
  },
  {
    id: "real-pack-streetwear-photoshoot",
    name: "Streetwear Photoshoot",
    targetStylePreference: "mixed / open to all",
    aesthetic: "streetwear",
    occasion: "photoshoot",
    budgetRange: "$100-$200",
    productIds: [
      "real-asos-boxy-tee-charcoal",
      "real-asos-utility-overshirt-sage",
      "real-asos-relaxed-cargo-pant-stone",
      "real-asos-clean-court-sneaker-white",
      "real-asos-chain-necklace-silver",
    ],
    totalPrice: 132,
    budgetLabel: "Within budget",
    fitNote: "The relaxed tee and cargo base create volume, while the overshirt and clean sneakers keep the outfit editorial instead of sloppy.",
    whyItWorks:
      "This board gives creator energy through shape and layering rather than loud graphics, making it easier to wear and easier to style on budget.",
    smartSwaps: [
      {
        label: "Cleaner swap",
        note: "Drop the chain and use the court sneaker plus overshirt combo for a quieter minimalist-streetwear version.",
      },
      {
        label: "Travel swap",
        note: "Swap the cargo for the Uniqlo smart ankle trouser when you want the same layering energy with less utility weight.",
      },
    ],
    lastUpdated: DEFAULT_LAST_UPDATED,
    shopReady: true,
  },
];

export function getRealOutfitPackById(packId: string) {
  return realOutfitPacks.find((pack) => pack.id === packId);
}

export function getRealOutfitPacksForBrief(brief?: RealShoppingBrief | null) {
  if (!brief) {
    return [];
  }

  const targetStylePreference = normalize(brief.stylePreference);
  const targetAesthetic = canonicalizeAesthetic(brief.aesthetic);
  const targetOccasion = canonicalizeOccasion(brief.occasion);
  const targetBudget = normalize(brief.budgetRange);

  return realOutfitPacks.filter((pack) => {
    const packStylePreference = normalize(pack.targetStylePreference);

    if (
      targetStylePreference &&
      packStylePreference !== targetStylePreference &&
      packStylePreference !== "mixed / open to all"
    ) {
      return false;
    }

    if (targetAesthetic && canonicalizeAesthetic(pack.aesthetic) !== targetAesthetic) {
      return false;
    }

    if (targetOccasion && canonicalizeOccasion(pack.occasion) !== targetOccasion) {
      return false;
    }

    if (targetBudget && normalize(pack.budgetRange) !== targetBudget) {
      return false;
    }

    return true;
  });
}

export function getShopReadyRealOutfitPacks() {
  const shopReadyProductIds = new Set(getShopReadyRealProducts().map((product) => product.id));

  return realOutfitPacks.filter(
    (pack) =>
      pack.shopReady && pack.productIds.every((productId) => shopReadyProductIds.has(productId)),
  );
}

export function getRealProductsForOutfitPack(productIds: string[]): RealProduct[] {
  return productIds
    .map((productId) => realProductLookup.get(productId))
    .filter((product): product is RealProduct => Boolean(product));
}

export function getRealPackBudgetSummary(totalPrice: number, budgetRange: BudgetRange) {
  if (budgetRange === "under $100") {
    if (totalPrice <= 100) {
      return "Within budget";
    }

    if (totalPrice <= 115) {
      return "Near budget";
    }

    if (totalPrice <= 130) {
      return "Stretch upgrade";
    }

    return "Over budget";
  }

  if (budgetRange === "$100-$200") {
    if (totalPrice <= 200) {
      return "Within budget";
    }

    if (totalPrice <= 230) {
      return "Near budget";
    }

    if (totalPrice <= 280) {
      return "Stretch upgrade";
    }

    return "Over budget";
  }

  if (budgetRange === "$200-$350") {
    if (totalPrice <= 350) {
      return "Within budget";
    }

    if (totalPrice <= 390) {
      return "Near budget";
    }

    if (totalPrice <= 450) {
      return "Stretch upgrade";
    }

    return "Over budget";
  }

  return totalPrice >= 0 ? "Within budget" : "Over budget";
}

export function validateRealOutfitPackTotals() {
  return realOutfitPacks.map((pack) => ({
    id: pack.id,
    matches: pack.totalPrice === sumPackPrice(pack.productIds),
  }));
}
