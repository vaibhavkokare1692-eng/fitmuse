import {
  getRealProductById,
  getShopReadyRealProducts,
  hasRealRetailerCandidateProductLink,
  realProductLookup,
} from "@/data/realProducts";
import type { BudgetRange, QuizAnswers, RealOutfitPack, RealProduct } from "@/types";

// These outfit packs are manually curated MVP placeholders.
// They intentionally use placeholder product links until the team replaces them by hand.
// Pricing should be treated as manually checked, not live.

const DEFAULT_LAST_UPDATED = "2026-04-30";
const MAY_1_LAST_UPDATED = "2026-05-01";
const MAY_2_LAST_UPDATED = "2026-05-02";
const MAY_6_LAST_UPDATED = "2026-05-06";
const MAY_8_LAST_UPDATED = "2026-05-08";

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

  if (normalized === "airport") {
    return "travel";
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

function hasPackVerificationStatus(pack: RealOutfitPack) {
  return (
    pack.verificationStatus === "needs_manual_verification" ||
    pack.verificationStatus === "manually_verified"
  );
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
    name: "Polished Office Professional",
    targetStylePreference: "feminine",
    aesthetic: "smart casual",
    aestheticAliases: ["clean minimal"],
    occasion: "office",
    budgetRange: "$100-$200",
    productIds: [
      "real-hm-fitted-blazer-light-beige",
      "real-hm-wide-leg-dress-pants-light-beige",
      "real-uniqlo-rayon-blouse-neutral",
      "real-target-julie-ballet-flats-neutral",
      "real-hm-delicate-gold-necklace-candidate",
    ],
    totalPrice: 149.87,
    budgetLabel: "Within budget",
    fitNote:
      "Structured beige blazer, wide-leg trousers, and pointed flats create a polished office look that stays comfortable and approachable.",
    whyItWorks:
      "This outfit keeps office polish without feeling overly formal. The blazer gives structure, the wide-leg trousers keep the silhouette comfortable, the Uniqlo blouse elevates the base, and the pointed flats make the look work-ready while staying walkable.",
    smartSwaps: [
      {
        label: "Cheaper swap",
        note: "Replace the Uniqlo blouse with the H&M Cotton T-Shirt when you want a more casual office version at a lower total.",
      },
      {
        label: "Premium swap",
        note: "Upgrade the flats to Nordstrom Rack leather flats when you want a slightly sharper office finish.",
      },
      {
        label: "Casual swap",
        note: "Replace the blazer with the H&M Fine-Knit Cardigan when you want a softer office layer.",
      },
      {
        label: "Bag add-on",
        note: "Add the H&M Shoulder Bag with Long Handles or the Target Elevated Camera Crossbody when you want extra room for work essentials.",
      },
    ],
    notes:
      "All main product pages were verified on 2026-05-01, but the pack must stay in needs-manual-verification mode until launch-time price, stock, size, and final color checks are completed on the retailer sites.",
    lastUpdated: MAY_1_LAST_UPDATED,
    shopReady: true,
    verificationStatus: "needs_manual_verification",
  },
  {
    id: "real-pack-feminine-travel-airport",
    name: "Polished Travel Ready",
    targetStylePreference: "feminine",
    aesthetic: "clean minimal",
    aestheticAliases: ["travel"],
    occasion: "travel",
    budgetRange: "$100-$200",
    productIds: [
      "real-uniqlo-ultra-stretch-active-jogger-pants-neutral",
      "real-uniqlo-airism-cotton-tshirt-white",
      "real-target-spencer-fashion-sneakers-white",
      "real-hm-crossbody-bag-beige",
      "real-hm-fine-knit-cardigan-light-beige",
      "real-hm-delicate-gold-necklace-candidate",
    ],
    totalPrice: 150.27,
    budgetLabel: "Within budget",
    fitNote:
      "Breathable tee, stretch joggers, walkable sneakers, and a compact crossbody create a polished airport outfit that stays comfortable through long travel days.",
    whyItWorks:
      "This look keeps travel comfort without looking sloppy. The AIRism tee and stretch joggers handle long wear, the cardigan gives an easy airplane layer, the sneakers support walking, and the crossbody keeps essentials secure and hands-free.",
    smartSwaps: [
      {
        label: "Cheaper swap",
        note: "Replace the AIRism tee with the H&M Cotton T-Shirt when you want to trim the total without changing the overall silhouette.",
      },
      {
        label: "Premium swap",
        note: "Upgrade the sneakers to Nordstrom Rack leather sneakers when you want a sharper premium-travel finish.",
      },
      {
        label: "Functional swap",
        note: "Replace the joggers with the H&M Four-Way Stretch Wide-Cut Pants when you want a more structured functional-travel trouser.",
      },
      {
        label: "Slip-on swap",
        note: "Replace the sneakers with the Target Julie Ballet Flats when you want an easier TSA or quick-security shoe option.",
      },
      {
        label: "Bag swap",
        note: "Replace the H&M Crossbody Bag with the H&M Shoulder Bag with Long Handles when you want more carrying capacity.",
      },
    ],
    notes:
      "All main product pages were verified on 2026-05-02, but the pack must stay in needs-manual-verification mode until launch-time price, stock, size, and final color checks are completed on the retailer sites. Per research, use the itemized total of $150.27 rather than the inconsistent $159.27 header value.",
    lastUpdated: MAY_2_LAST_UPDATED,
    shopReady: true,
    verificationStatus: "needs_manual_verification",
  },
  {
    id: "real-pack-masculine-old-money-date",
    name: "Classic Old Money Date",
    targetStylePreference: "masculine",
    aesthetic: "old money",
    aestheticAliases: ["quiet luxury"],
    occasion: "date",
    budgetRange: "$100-$200",
    productIds: [
      "real-uniqlo-oxford-slim-shirt-neutral",
      "real-hm-relaxed-fit-cotton-chinos-beige",
      "real-target-alfred-slip-on-loafers-neutral",
      "real-hm-leather-belt-brown",
    ],
    totalPrice: 149.88,
    budgetLabel: "Within budget",
    fitNote:
      "An oxford shirt, beige chinos, loafers, and leather belt create a clean masculine date look that feels polished without looking overdone.",
    whyItWorks:
      "This is the classic old-money date formula: a crisp oxford shirt, relaxed beige chinos, minimal loafers, and a leather belt. The outfit stays neutral, logo-free, and approachable while still feeling intentional for dinner, coffee, brunch, or a casual classy date.",
    smartSwaps: [
      {
        label: "Cheaper swap",
        note: "Skip the leather belt or use an owned belt or loafers when you want to reduce the total without changing the overall formula.",
      },
      {
        label: "Premium swap",
        note: "Add the Uniqlo Premium Lambswool Sweater as a stretch layer when you want a richer old-money finish for a cooler date night.",
      },
      {
        label: "Casual swap",
        note: "Replace the loafers with minimal leather sneakers when you want the same clean look in a more relaxed direction.",
      },
      {
        label: "Cooler evening swap",
        note: "Layer the Uniqlo Premium Lambswool Sweater over the oxford shirt when you want more warmth without losing the old-money feel.",
      },
    ],
    notes:
      "All main product pages were verified on 2026-05-06, but the pack must stay in needs-manual-verification mode until launch-time price, stock, size, final shirt color, and loafers color checks are completed on the retailer sites.",
    lastUpdated: MAY_6_LAST_UPDATED,
    shopReady: true,
    verificationStatus: "needs_manual_verification",
  },
  {
    id: "real-pack-masculine-clean-airport-fit",
    name: "Clean Airport Fit",
    targetStylePreference: "masculine",
    aesthetic: "clean minimal",
    aestheticAliases: ["travel"],
    occasion: "travel",
    budgetRange: "$100-$200",
    productIds: [
      "real-uniqlo-airism-cotton-tshirt-airport-neutral",
      "real-uniqlo-ultra-stretch-active-jogger-pants-airport-neutral",
      "real-hm-loose-fit-hoodie-basics-dark-gray",
      "real-target-billy-lace-up-sneakers-white",
    ],
    totalPrice: 110.79,
    budgetLabel: "Within budget",
    fitNote:
      "A breathable tee, stretch joggers, dark gray hoodie, and clean white sneakers build a polished airport outfit that stays comfortable through a long travel day.",
    whyItWorks:
      "This board keeps airport dressing comfortable without looking sloppy. The AIRism tee and stretch joggers keep the base breathable and easy to move in, the hoodie adds a soft travel layer, and the clean sneakers keep the overall look minimal, neutral, and modern.",
    smartSwaps: [
      {
        label: "Cap add-on",
        note: "Add the Uniqlo UV Protection Cap as an optional travel accessory when you want a more functional airport finish; it lifts the estimated total to $140.69.",
      },
      {
        label: "Lighter layer",
        note: "Skip the hoodie when you want the leanest warm-weather version of the same clean airport formula.",
      },
      {
        label: "Cooler flight swap",
        note: "Keep the hoodie on hand as your airplane layer and wear the tee-and-jogger base through check-in, security, and boarding.",
      },
    ],
    notes:
      "All main product pages were verified on 2026-05-08, but the board must stay in needs-manual-verification mode until launch-time price, stock, size, and final color checks are completed on the retailer sites. The H&M hoodie uses a researched sale price, so treat it as a retailer candidate price that still requires manual verification before purchase. The optional Uniqlo cap is a stretch accessory only and is not included in the main $110.79 total.",
    lastUpdated: MAY_8_LAST_UPDATED,
    shopReady: true,
    verificationStatus: "needs_manual_verification",
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
    notes:
      "This is still a placeholder-only future candidate pack. Keep it hidden from the live curated real-shopping section until real retailer candidate products and manual verification status are added.",
    lastUpdated: DEFAULT_LAST_UPDATED,
    shopReady: false,
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

  return getShopReadyRealOutfitPacks().filter((pack) => {
    const packStylePreference = normalize(pack.targetStylePreference);
    const packAesthetics = [pack.aesthetic, ...(pack.aestheticAliases ?? [])].map(
      canonicalizeAesthetic,
    );

    if (
      targetStylePreference &&
      packStylePreference !== targetStylePreference &&
      packStylePreference !== "mixed / open to all"
    ) {
      return false;
    }

    if (targetAesthetic && !packAesthetics.includes(targetAesthetic)) {
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
      pack.shopReady &&
      hasPackVerificationStatus(pack) &&
      pack.productIds.some((productId) => shopReadyProductIds.has(productId)) &&
      pack.productIds
        .map((productId) => getRealProductById(productId))
        .some((product) => hasRealRetailerCandidateProductLink(product)),
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
