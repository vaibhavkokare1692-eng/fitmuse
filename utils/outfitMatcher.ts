import { products } from "@/data/products";
import { splitCommaSeparated } from "@/lib/utils";
import type {
  Aesthetic,
  BudgetMatchLabel,
  BudgetRange,
  ColorFamily,
  FitPreference,
  MatchQualityLabel,
  Occasion,
  OutfitRecommendation,
  Product,
  ProductCategory,
  QuizAnswers,
  StylePreference,
} from "@/types";

type ScoredProduct = {
  product: Product;
  score: number;
  exactAesthetic: boolean;
  exactOccasion: boolean;
  sizeExact: boolean;
  matchedPreferredColors: string[];
  matchedStores: string[];
  matchReasons: string[];
  creatorAlignmentScore: number;
};

const requiredCategories: ProductCategory[] = ["top", "bottom", "shoes", "accessory"];
const poolSizes: Record<ProductCategory, number> = {
  top: 7,
  bottom: 7,
  shoes: 5,
  accessory: 5,
  outerwear: 4,
};

const creatorMoments: Occasion[] = ["reels", "photoshoot", "brand content"];
const creatorMomentSet = new Set<Occasion>(creatorMoments);

const fallbackAesthetics: Record<Aesthetic, Aesthetic[]> = {
  "old money": ["luxury neutral", "smart casual", "date night"],
  streetwear: ["creator/photoshoot", "gym casual", "travel"],
  minimalist: ["clean girl", "smart casual", "luxury neutral"],
  "clean girl": ["minimalist", "travel", "luxury neutral"],
  "smart casual": ["office", "minimalist", "travel"],
  office: ["smart casual", "luxury neutral", "minimalist"],
  party: ["date night", "creator/photoshoot", "streetwear"],
  "date night": ["old money", "party", "minimalist"],
  travel: ["luxury neutral", "smart casual", "gym casual"],
  "creator/photoshoot": ["streetwear", "luxury neutral", "party"],
  "luxury neutral": ["old money", "minimalist", "office"],
  "gym casual": ["streetwear", "travel", "clean girl"],
};

const fallbackOccasions: Record<Occasion, Occasion[]> = {
  reels: ["photoshoot", "brand content", "daily wear"],
  photoshoot: ["brand content", "reels", "party"],
  date: ["party", "brand content", "daily wear"],
  party: ["photoshoot", "date", "brand content"],
  college: ["daily wear", "travel", "reels"],
  office: ["brand content", "daily wear", "travel"],
  travel: ["daily wear", "college", "reels"],
  "wedding guest": ["date", "party", "brand content"],
  "daily wear": ["college", "travel", "reels"],
  "brand content": ["photoshoot", "reels", "office"],
};

const relatedFits: Record<FitPreference, FitPreference[]> = {
  slim: ["classy", "regular"],
  regular: ["slim", "relaxed", "classy"],
  relaxed: ["regular", "oversized", "modest"],
  oversized: ["relaxed", "trendy"],
  modest: ["relaxed", "classy"],
  classy: ["slim", "regular", "modest"],
  trendy: ["oversized", "slim"],
};

const colorFamilyMap: Record<string, ColorFamily> = {
  black: "monochrome",
  white: "neutral",
  cream: "neutral",
  bone: "neutral",
  ivory: "neutral",
  ecru: "neutral",
  oatmeal: "neutral",
  stone: "neutral",
  softwhite: "neutral",
  "soft white": "neutral",
  beige: "earth",
  camel: "earth",
  tan: "earth",
  sand: "earth",
  taupe: "earth",
  mocha: "earth",
  espresso: "earth",
  chocolate: "earth",
  sage: "earth",
  olive: "earth",
  blue: "cool",
  slate: "cool",
  navy: "cool",
  charcoal: "cool",
  silver: "metallic",
  gold: "metallic",
  pearl: "metallic",
  pink: "pastel",
  plum: "warm",
  graphite: "monochrome",
  grey: "monochrome",
  gray: "monochrome",
};

function normalize(value?: string | null) {
  return value?.trim().toLowerCase() ?? "";
}

function formatLabel(value?: string) {
  if (!value) {
    return "";
  }

  return value
    .split("/")
    .map((part) =>
      part
        .split(" ")
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
    )
    .join(" / ");
}

function getPreferredColorFamilies(preferredColors: string[]) {
  return Array.from(
    new Set(
      preferredColors
        .map((color) => colorFamilyMap[normalize(color)])
        .filter(Boolean) as ColorFamily[],
    ),
  );
}

export function budgetCapFromRange(range?: string | null) {
  const normalized = normalize(range);

  if (!normalized) {
    return null;
  }

  if (normalized === "under $100") {
    return 100;
  }

  if (normalized === "$100-$200") {
    return 200;
  }

  if (normalized === "$200-$350") {
    return 350;
  }

  if (normalized === "$350+") {
    return 550;
  }

  return null;
}

function budgetTargetForCategory(category: ProductCategory, budgetCap: number | null) {
  if (!budgetCap) {
    return null;
  }

  if (category === "outerwear") {
    return budgetCap * 0.3;
  }

  if (category === "accessory") {
    return budgetCap * 0.16;
  }

  if (category === "shoes") {
    return budgetCap * 0.24;
  }

  return budgetCap * 0.22;
}

function getRequiredSize(product: Product, answers: QuizAnswers) {
  if (product.category === "top" || product.category === "outerwear") {
    return normalize(answers.topSize);
  }

  if (product.category === "bottom") {
    return normalize(answers.bottomSize);
  }

  if (product.category === "shoes") {
    return normalize(answers.shoeSize);
  }

  return "";
}

function getSizeSignal(product: Product, answers: QuizAnswers) {
  if (product.category === "accessory") {
    return { score: 0, exact: true, reason: "" };
  }

  const requestedSize = getRequiredSize(product, answers);

  if (!requestedSize) {
    return { score: 0, exact: true, reason: "" };
  }

  const hasSize = product.availableSizes.map((size) => normalize(size)).includes(requestedSize);

  return {
    score: hasSize ? 5 : -10,
    exact: hasSize,
    reason: hasSize ? "Available in your saved size range" : "",
  };
}

function getTagSignal<T extends string>(
  selected: T | "",
  tags: T[],
  fallbacks: Record<T, T[]>,
  exactReason: string,
  fallbackReason: string,
) {
  if (!selected) {
    return {
      score: 0,
      exact: true,
      matchedExact: false,
      matchedFallback: false,
      reason: "",
    };
  }

  if (tags.includes(selected)) {
    return {
      score: 13,
      exact: true,
      matchedExact: true,
      matchedFallback: false,
      reason: exactReason,
    };
  }

  const related = fallbacks[selected] ?? [];

  if (tags.some((tag) => related.includes(tag))) {
    return {
      score: 7,
      exact: false,
      matchedExact: false,
      matchedFallback: true,
      reason: fallbackReason,
    };
  }

  return {
    score: -4,
    exact: false,
    matchedExact: false,
    matchedFallback: false,
    reason: "",
  };
}

function stylePreferenceScore(product: Product, preference: StylePreference | "") {
  if (!preference) {
    return { score: 0, reason: "" };
  }

  const matches =
    product.stylePreferences.includes(preference) ||
    product.stylePreferences.includes("mixed / open to all");

  return {
    score: matches ? 3 : -2,
    reason: matches ? "Supports your style preference" : "",
  };
}

function fitScore(product: Product, fitPreference: FitPreference | "") {
  if (!fitPreference) {
    return { score: 0, reason: "" };
  }

  if (product.fitType === fitPreference) {
    return {
      score: 5,
      reason: product.fitType === fitPreference ? `Leans ${formatLabel(fitPreference)} like you asked` : "",
    };
  }

  if (relatedFits[fitPreference]?.includes(product.fitType)) {
    return {
      score: 2,
      reason: `Keeps a ${formatLabel(product.fitType)} silhouette close to your ${formatLabel(fitPreference)} preference`,
    };
  }

  return {
    score: -2,
    reason: "",
  };
}

function colorScore(product: Product, preferredColors: string[], avoidedColors: string[]) {
  const preferredFamilies = getPreferredColorFamilies(preferredColors);
  const matchedPreferredColors = product.colors.filter((color) =>
    preferredColors.includes(normalize(color)),
  );
  const matchedAvoidColors = product.colors.filter((color) =>
    avoidedColors.includes(normalize(color)),
  );
  const matchedPreferredFamily = preferredFamilies.includes(product.colorFamily);

  let score = matchedPreferredColors.length * 4 - matchedAvoidColors.length * 7;

  if (matchedPreferredColors.length === 0 && matchedPreferredFamily) {
    score += 2;
  }

  if (
    preferredColors.length > 0 &&
    matchedPreferredColors.length === 0 &&
    !matchedPreferredFamily &&
    product.colorFamily === "neutral"
  ) {
    score += 1;
  }

  if (avoidedColors.length > 0 && matchedAvoidColors.length === 0) {
    score += 1;
  }

  return {
    score,
    matchedPreferredColors,
    matchedAvoidColors,
    reason:
      matchedPreferredColors.length > 0
        ? `Uses your preferred ${formatLabel(matchedPreferredColors[0])} palette`
        : matchedPreferredFamily
          ? `Stays inside your preferred ${formatLabel(product.colorFamily)} palette family`
        : "",
  };
}

function storeScore(product: Product, preferredStores: string[]) {
  const matchedStores = preferredStores.filter((store) => normalize(product.store) === store);

  return {
    score: matchedStores.length > 0 ? 4 : preferredStores.length > 0 ? -1 : 0,
    matchedStores,
    reason: matchedStores.length > 0 ? `Pulls from a store you already like: ${product.store}` : "",
  };
}

function budgetScore(product: Product, budgetCap: number | null) {
  const target = budgetTargetForCategory(product.category, budgetCap);

  if (!target) {
    return { score: 0, reason: "" };
  }

  if (product.price >= target * 0.55 && product.price <= target * 0.95) {
    return { score: 5, reason: "Lands close to the ideal spend for this category" };
  }

  if (product.price <= target) {
    return { score: 3, reason: "Keeps the outfit budget realistic" };
  }

  if (product.price <= target * 1.12) {
    return { score: 2, reason: "Still sits close to the spend target" };
  }

  if (product.price <= target * 1.28) {
    return { score: -1, reason: "" };
  }

  return { score: -6, reason: "" };
}

function scoreProduct(product: Product, answers: QuizAnswers): ScoredProduct {
  const preferredColors = splitCommaSeparated(answers.preferredColors);
  const avoidedColors = splitCommaSeparated(answers.avoidColors);
  const preferredStores = splitCommaSeparated(answers.storesLike);
  const budgetCap = budgetCapFromRange(answers.budgetRange);

  const aestheticSignal = getTagSignal(
    answers.aesthetic,
    product.aestheticTags,
    fallbackAesthetics,
    `Matches your ${formatLabel(answers.aesthetic)} aesthetic`,
    `Leans close to your ${formatLabel(answers.aesthetic)} aesthetic`,
  );
  const occasionSignal = getTagSignal(
    answers.occasion,
    product.occasionTags,
    fallbackOccasions,
    `Fits your ${formatLabel(answers.occasion)} occasion`,
    `Works as a close fit for your ${formatLabel(answers.occasion)} moment`,
  );
  const sizeSignal = getSizeSignal(product, answers);
  const fitSignal = fitScore(product, answers.fitPreference);
  const styleSignal = stylePreferenceScore(product, answers.stylePreference);
  const colorSignal = colorScore(product, preferredColors, avoidedColors);
  const storeSignal = storeScore(product, preferredStores);
  const budgetSignal = budgetScore(product, budgetCap);

  const creatorAlignmentScore =
    (product.aestheticTags.includes("creator/photoshoot") ? 3 : 0) +
    product.occasionTags.filter((tag) => creatorMomentSet.has(tag)).length;

  const matchReasons = [
    aestheticSignal.reason,
    occasionSignal.reason,
    fitSignal.reason,
    styleSignal.reason,
    colorSignal.reason,
    storeSignal.reason,
    sizeSignal.reason,
    budgetSignal.reason,
  ].filter(Boolean);

  return {
    product,
    score:
      aestheticSignal.score +
      occasionSignal.score +
      sizeSignal.score +
      fitSignal.score +
      styleSignal.score +
      colorSignal.score +
      storeSignal.score +
      budgetSignal.score +
      creatorAlignmentScore,
    exactAesthetic: aestheticSignal.matchedExact,
    exactOccasion: occasionSignal.matchedExact,
    sizeExact: sizeSignal.exact,
    matchedPreferredColors: colorSignal.matchedPreferredColors,
    matchedStores: storeSignal.matchedStores,
    matchReasons,
    creatorAlignmentScore,
  };
}

function pickPool(category: ProductCategory, answers: QuizAnswers) {
  return products
    .filter((product) => product.category === category)
    .map((product) => scoreProduct(product, answers))
    .sort((left, right) => right.score - left.score || left.product.price - right.product.price)
    .slice(0, poolSizes[category]);
}

function uniqueColors(items: Product[]) {
  return Array.from(new Set(items.flatMap((item) => item.colors))).slice(0, 5);
}

function uniqueColorFamilies(items: Product[]) {
  return Array.from(new Set(items.map((item) => item.colorFamily)));
}

function buildName(aesthetic: Aesthetic, occasion: Occasion, index: number) {
  const key = `${aesthetic}|${occasion}`;
  const names: Record<string, string> = {
    "old money|date": "Old Money Dinner Look",
    "streetwear|reels": "Streetwear Reel Fit",
    "minimalist|date": "Minimalist Coffee Date",
    "clean girl|daily wear": "Clean Girl Everyday",
    "smart casual|college": "College Smart Casual Edit",
    "office|office": "Office Smart Casual",
    "party|party": "Party Night Outfit",
    "date night|date": "Date Night Espresso Edit",
    "travel|travel": "Airport Travel Look",
    "creator/photoshoot|brand content": "Brand Shoot Neutral Fit",
    "creator/photoshoot|photoshoot": "Creator Shoot Outfit Pack",
    "luxury neutral|wedding guest": "Luxury Neutral Event Look",
    "gym casual|daily wear": "Gym Casual Everyday Set",
  };

  const baseName = names[key] ?? `${formatLabel(aesthetic)} ${formatLabel(occasion)} Look`;

  return index === 0 ? baseName : `${baseName} ${index + 1}`;
}

function buildBudgetMatch(totalPrice: number, budgetCap: number | null) {
  if (!budgetCap) {
    return {
      label: "Close to budget" as BudgetMatchLabel,
      note: "You left the budget flexible, so FitMuse prioritized overall match quality.",
    };
  }

  if (totalPrice <= budgetCap * 0.92) {
    return {
      label: "Under budget" as BudgetMatchLabel,
      note: `This look stays under your ${formatLabel(budgetLabelFromCap(budgetCap))} target.`,
    };
  }

  if (totalPrice <= budgetCap * 1.05) {
    return {
      label: "Close to budget" as BudgetMatchLabel,
      note: `This look lands close to your ${formatLabel(budgetLabelFromCap(budgetCap))} budget target.`,
    };
  }

  return {
    label: "Over budget but strong match" as BudgetMatchLabel,
    note: `This look runs slightly over your ${formatLabel(budgetLabelFromCap(budgetCap))} target but scored as a stronger overall match.`,
  };
}

function buildCreatorUseCase(occasion: Occasion) {
  const labels: Record<Occasion, string> = {
    reels: "Best for creator reels and quick outfit content.",
    photoshoot: "Best for styled photoshoots and editorial content days.",
    date: "Best for dinner plans, soft-date content, and polished evenings.",
    party: "Best for event nights, nightlife posts, and higher-energy content.",
    college: "Best for campus days, coffee runs, and casual GRWM posts.",
    office: "Best for polished office days and founder-style weekday content.",
    travel: "Best for airport fits, city travel days, and transit vlogs.",
    "wedding guest": "Best for elevated guest dressing with a realistic shopping path.",
    "daily wear": "Best for everyday styling when you still want a complete look.",
    "brand content": "Best for sponsor shoots, product seeding, and creator-ready brand moments.",
  };

  return labels[occasion];
}

function buildFitNote(items: Product[], answers: QuizAnswers) {
  const topFit = items.find((item) => item.category === "top")?.fitType ?? "regular";
  const bottomFit = items.find((item) => item.category === "bottom")?.fitType ?? "regular";
  const sizeSummary =
    answers.topSize && answers.bottomSize
      ? `around your ${answers.topSize}/${answers.bottomSize} saved sizes`
      : "around your saved size brief";

  return `${formatLabel(topFit)} volume on top with ${formatLabel(bottomFit)} balance below keeps the silhouette camera-friendly ${sizeSummary}.`;
}

function buildWhyItWorks(items: Product[], answers: QuizAnswers, matchedColors: string[]) {
  const palette = uniqueColors(items);
  const leadStores = Array.from(new Set(items.map((item) => item.store))).slice(0, 2);

  if (matchedColors.length > 0) {
    return `${formatLabel(matchedColors[0])} tones keep the outfit aligned to your brief while ${leadStores.join(" + ")} adds a multi-store styled feel.`;
  }

  return `${palette.slice(0, 3).map(formatLabel).join(", ")} tones keep the outfit cohesive while ${leadStores.join(" + ")} gives it a creator-styled mix.`;
}

function buildMatchReasons(
  productEntries: ScoredProduct[],
  answers: QuizAnswers,
  totalPrice: number,
  budgetLabel: BudgetMatchLabel,
) {
  const reasons = new Set<string>();
  const matchedColors = Array.from(
    new Set(productEntries.flatMap((entry) => entry.matchedPreferredColors)),
  );
  const matchedStores = Array.from(
    new Set(productEntries.flatMap((entry) => entry.matchedStores)),
  );
  const avoidedColors = splitCommaSeparated(answers.avoidColors);
  const usesAvoidedColor = productEntries.some((entry) =>
    entry.product.colors.some((color) => avoidedColors.includes(normalize(color))),
  );

  if (answers.aesthetic) {
    const exactCount = productEntries.filter((entry) => entry.exactAesthetic).length;
    reasons.add(
      exactCount >= 2
        ? `Matches your ${formatLabel(answers.aesthetic)} aesthetic`
        : `Leans close to your ${formatLabel(answers.aesthetic)} aesthetic`,
    );
  }

  if (answers.occasion) {
    const exactCount = productEntries.filter((entry) => entry.exactOccasion).length;
    reasons.add(
      exactCount >= 2
        ? `Fits your ${formatLabel(answers.occasion)} occasion`
        : `Still supports your ${formatLabel(answers.occasion)} moment`,
    );
  }

  if (matchedColors.length > 0) {
    reasons.add(`Uses your preferred ${formatLabel(matchedColors[0])} colors`);
  }

  if (avoidedColors.length > 0 && !usesAvoidedColor) {
    reasons.add("Avoids the colors you wanted to skip");
  }

  if (matchedStores.length > 0) {
    reasons.add(`Includes stores you already like: ${matchedStores.slice(0, 2).join(" + ")}`);
  }

  if (answers.fitPreference) {
    reasons.add(`Stays close to your ${formatLabel(answers.fitPreference)} fit preference`);
  }

  if (budgetLabel === "Under budget") {
    reasons.add(`Keeps the look under ${formatLabel(answers.budgetRange || "your target budget")}`);
  } else if (budgetLabel === "Close to budget") {
    reasons.add("Keeps the full outfit close to your budget range");
  } else {
    reasons.add(`Pushes past ${formatLabel(answers.budgetRange || "budget")} only because the overall match is stronger`);
  }

  if (productEntries.every((entry) => entry.sizeExact)) {
    reasons.add("Available in the sizes saved in your style brief");
  }

  return Array.from(reasons);
}

function matchQualityLabel(
  matchMode: OutfitRecommendation["matchMode"],
  confidenceScore: number,
  creatorAlignmentScore: number,
) {
  if (matchMode === "closest") {
    return "Closest match" as MatchQualityLabel;
  }

  if (creatorAlignmentScore >= 6) {
    return "Creator-ready" as MatchQualityLabel;
  }

  if (confidenceScore >= 90) {
    return "Best match" as MatchQualityLabel;
  }

  return "Strong match" as MatchQualityLabel;
}

function confidenceFromScore(score: number, matchMode: OutfitRecommendation["matchMode"]) {
  const base = matchMode === "exact" ? 76 : 64;
  return Math.max(58, Math.min(98, base + Math.round(score / 4)));
}

function buildOutfitRecommendation(
  productEntries: ScoredProduct[],
  answers: QuizAnswers,
  index: number,
): OutfitRecommendation {
  const items = productEntries.map((entry) => entry.product);
  const budgetCap = budgetCapFromRange(answers.budgetRange);
  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
  const colorPalette = uniqueColors(items);
  const creatorAlignmentScore = productEntries.reduce(
    (sum, entry) => sum + entry.creatorAlignmentScore,
    0,
  );
  const exactCount = productEntries.filter(
    (entry) => entry.exactAesthetic && entry.exactOccasion && entry.sizeExact,
  ).length;
  const matchMode: OutfitRecommendation["matchMode"] = exactCount >= 3 ? "exact" : "closest";
  const allSizeMatched = productEntries.every((entry) => entry.sizeExact);
  const exactAestheticCount = productEntries.filter((entry) => entry.exactAesthetic).length;
  const exactOccasionCount = productEntries.filter((entry) => entry.exactOccasion).length;
  const priceBufferScore =
    budgetCap && totalPrice <= budgetCap
      ? 3
      : budgetCap && totalPrice <= budgetCap * 1.06
        ? 1
        : 0;
  const synergyScore =
    (new Set(items.map((item) => item.colorFamily)).size <= 3 ? 4 : 0) +
    (new Set(items.map((item) => item.store)).size >= 2 ? 2 : 0) +
    (allSizeMatched ? 4 : 0) +
    (exactAestheticCount >= 2 ? 4 : 0) +
    (exactOccasionCount >= 2 ? 4 : 0) +
    priceBufferScore +
    creatorAlignmentScore;
  const rawScore =
    productEntries.reduce((sum, entry) => sum + entry.score, 0) + synergyScore;
  const confidenceScore = confidenceFromScore(rawScore, matchMode);
  const budgetMatch = buildBudgetMatch(totalPrice, budgetCap);
  const matchReasons = buildMatchReasons(productEntries, answers, totalPrice, budgetMatch.label);
  const matchedColors = Array.from(
    new Set(productEntries.flatMap((entry) => entry.matchedPreferredColors)),
  );

  return {
    id: productEntries.map((entry) => entry.product.id).join("__"),
    name: buildName(
      (answers.aesthetic || "smart casual") as Aesthetic,
      (answers.occasion || "daily wear") as Occasion,
      index,
    ),
    aesthetic: (answers.aesthetic || "smart casual") as Aesthetic,
    occasion: (answers.occasion || "daily wear") as Occasion,
    totalPrice,
    items: {
      top: productEntries.find((entry) => entry.product.category === "top")!.product,
      bottom: productEntries.find((entry) => entry.product.category === "bottom")!.product,
      shoes: productEntries.find((entry) => entry.product.category === "shoes")!.product,
      accessory: productEntries.find((entry) => entry.product.category === "accessory")!.product,
      outerwear: productEntries.find((entry) => entry.product.category === "outerwear")?.product,
    },
    colorPalette,
    colorFamilies: uniqueColorFamilies(items),
    fitNote: buildFitNote(items, answers),
    whyItWorks: buildWhyItWorks(items, answers, matchedColors),
    creatorUseCase: buildCreatorUseCase((answers.occasion || "daily wear") as Occasion),
    confidenceScore,
    matchQualityLabel: matchQualityLabel(matchMode, confidenceScore, creatorAlignmentScore),
    budgetMatchLabel: budgetMatch.label,
    budgetNote: budgetMatch.note,
    matchReasons,
    creatorAlignmentScore,
    stores: Array.from(new Set(items.map((item) => item.store))),
    matchMode,
    shopUrl: `/mock-look/${productEntries[0].product.id}`,
  };
}

export function buildOutfitRecommendations(answers: QuizAnswers, limit = 8) {
  const topPool = pickPool("top", answers);
  const bottomPool = pickPool("bottom", answers);
  const shoesPool = pickPool("shoes", answers);
  const accessoryPool = pickPool("accessory", answers);
  const outerwearPool = pickPool("outerwear", answers);
  const budgetCap = budgetCapFromRange(answers.budgetRange);
  const recommendations: OutfitRecommendation[] = [];
  const outerwearChoices = [undefined, ...outerwearPool];

  for (const top of topPool) {
    for (const bottom of bottomPool) {
      for (const shoes of shoesPool) {
        for (const accessory of accessoryPool) {
          for (const outerwear of outerwearChoices) {
            const productEntries = [top, bottom, shoes, accessory, outerwear].filter(
              Boolean,
            ) as ScoredProduct[];
            const items = productEntries.map((entry) => entry.product);
            const totalPrice = items.reduce((sum, item) => sum + item.price, 0);

            if (budgetCap && totalPrice > budgetCap * 1.28) {
              continue;
            }

            const recommendation = buildOutfitRecommendation(
              productEntries,
              answers,
              recommendations.length,
            );

            recommendations.push(recommendation);
          }
        }
      }
    }
  }

  const uniqueRecommendations = Array.from(
    new Map(recommendations.map((recommendation) => [recommendation.id, recommendation])).values(),
  );

  const sorted = uniqueRecommendations.sort(
    (left, right) =>
      right.confidenceScore - left.confidenceScore ||
      right.creatorAlignmentScore - left.creatorAlignmentScore ||
      left.totalPrice - right.totalPrice,
  );

  if (sorted.length > 0) {
    return sorted.slice(0, limit).map((recommendation, index) => ({
      ...recommendation,
      name: buildName(
        (answers.aesthetic || "smart casual") as Aesthetic,
        (answers.occasion || "daily wear") as Occasion,
        index,
      ),
    }));
  }

  const fallbackItems = requiredCategories
    .map((category) =>
      products
        .filter((product) => product.category === category)
        .sort((left, right) => left.price - right.price)[0],
    )
    .filter(Boolean) as Product[];

  if (fallbackItems.length < 4) {
    return [];
  }

  const fallbackRecommendation: OutfitRecommendation = {
      id: fallbackItems.map((item) => item.id).join("__"),
      name: "Closest FitMuse Look",
      aesthetic: (answers.aesthetic || "smart casual") as Aesthetic,
      occasion: (answers.occasion || "daily wear") as Occasion,
      totalPrice: fallbackItems.reduce((sum, item) => sum + item.price, 0),
      items: {
        top: fallbackItems.find((item) => item.category === "top")!,
        bottom: fallbackItems.find((item) => item.category === "bottom")!,
        shoes: fallbackItems.find((item) => item.category === "shoes")!,
        accessory: fallbackItems.find((item) => item.category === "accessory")!,
        outerwear: undefined,
      },
      colorPalette: uniqueColors(fallbackItems),
      colorFamilies: uniqueColorFamilies(fallbackItems),
      fitNote: buildFitNote(fallbackItems, answers),
      whyItWorks: "This is the closest ready-to-buy outfit mix available in the current mock catalog.",
      creatorUseCase: buildCreatorUseCase((answers.occasion || "daily wear") as Occasion),
      confidenceScore: 61,
      matchQualityLabel: "Closest match",
      budgetMatchLabel: "Close to budget",
      budgetNote: "This fallback prioritizes showing a complete outfit over a blank page.",
      matchReasons: [
        "No perfect match yet, but this is the closest full outfit in the current mock catalog",
        answers.aesthetic
          ? `Still leans toward your ${formatLabel(answers.aesthetic)} aesthetic`
          : "Still keeps the outfit visually cohesive",
      ],
      creatorAlignmentScore: 2,
      stores: Array.from(new Set(fallbackItems.map((item) => item.store))),
      matchMode: "closest",
      shopUrl: `/mock-look/${fallbackItems[0].id}`,
  };

  return [fallbackRecommendation];
}

export function hasQuizAnswers(answers?: Partial<QuizAnswers> | null) {
  if (!answers) {
    return false;
  }

  return Boolean(
    answers.name ||
      answers.aesthetic ||
      answers.occasion ||
      answers.budgetRange ||
      answers.fitPreference ||
      answers.topSize ||
      answers.bottomSize,
  );
}

export function emptyQuizAnswers(): QuizAnswers {
  return {
    name: "",
    stylePreference: "",
    location: "",
    height: "",
    weight: "",
    chestBust: "",
    waist: "",
    hips: "",
    topSize: "",
    bottomSize: "",
    shoeSize: "",
    bodyType: "",
    aesthetic: "",
    occasion: "",
    budgetRange: "",
    fitPreference: "",
    preferredColors: "",
    avoidColors: "",
    storesLike: "",
  };
}

export function budgetLabelFromCap(cap: string | number) {
  const value = typeof cap === "string" ? budgetCapFromRange(cap as BudgetRange) : cap;

  if (!value) {
    return "Flexible";
  }

  if (value <= 100) {
    return "Under $100";
  }

  if (value <= 200) {
    return "Up to $200";
  }

  if (value <= 350) {
    return "Up to $350";
  }

  return "$350+";
}
