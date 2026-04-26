import { products } from "@/data/products";
import { splitCommaSeparated } from "@/lib/utils";
import type {
  Aesthetic,
  BudgetRange,
  FitPreference,
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
  exact: boolean;
};

const requiredCategories: ProductCategory[] = ["top", "bottom", "shoes", "accessory"];

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
  college: ["daily wear", "reels", "travel"],
  office: ["brand content", "daily wear", "travel"],
  travel: ["daily wear", "college", "reels"],
  "wedding guest": ["date", "party", "brand content"],
  "daily wear": ["college", "travel", "reels"],
  "brand content": ["photoshoot", "reels", "office"],
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

export function budgetCapFromRange(range?: string | null) {
  const normalized = normalize(range);

  if (!normalized) {
    return null;
  }

  if (normalized.includes("under $100")) {
    return 100;
  }

  if (normalized.includes("$100-$200") || normalized.includes("$100 - $200")) {
    return 200;
  }

  if (normalized.includes("$200-$350") || normalized.includes("$200 - $350")) {
    return 350;
  }

  if (normalized.includes("$350+")) {
    return 550;
  }

  if (normalized.includes("under $75")) {
    return 75;
  }

  if (normalized.includes("$75 - $150")) {
    return 150;
  }

  if (normalized.includes("$150 - $250")) {
    return 250;
  }

  if (normalized.includes("$250 - $400")) {
    return 400;
  }

  if (normalized.includes("$400+")) {
    return 600;
  }

  return null;
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

function sizeScore(product: Product, answers: QuizAnswers) {
  const requiredSize = getRequiredSize(product, answers);

  if (!requiredSize || product.category === "accessory") {
    return { score: 0, exact: true };
  }

  const available = product.availableSizes.map((size) => normalize(size));
  const matches = available.includes(requiredSize);

  return {
    score: matches ? 3 : -6,
    exact: matches,
  };
}

function getTagScore<T extends string>(selected: T | "", tags: T[], fallbacks: Record<T, T[]>) {
  if (!selected) {
    return { score: 0, exact: true };
  }

  if (tags.includes(selected)) {
    return { score: 7, exact: true };
  }

  const related = fallbacks[selected] ?? [];
  const hasRelatedMatch = tags.some((tag) => related.includes(tag));

  if (hasRelatedMatch) {
    return { score: 3, exact: false };
  }

  return { score: -3, exact: false };
}

function stylePreferenceScore(product: Product, stylePreference: StylePreference | "") {
  if (!stylePreference) {
    return 0;
  }

  if (
    product.stylePreferences.includes(stylePreference) ||
    product.stylePreferences.includes("mixed / open to all")
  ) {
    return 2;
  }

  return -1;
}

function colorScore(product: Product, preferredColors: string[], avoidColors: string[]) {
  let score = 0;

  const matchingPreferred = product.colors.filter((color) => preferredColors.includes(normalize(color)));
  const matchingAvoid = product.colors.filter((color) => avoidColors.includes(normalize(color)));

  score += matchingPreferred.length * 2;
  score -= matchingAvoid.length * 3;

  return score;
}

function fitScore(product: Product, fitPreference: FitPreference | "") {
  if (!fitPreference) {
    return 0;
  }

  return product.fitType === fitPreference ? 4 : -1;
}

function storeScore(product: Product, preferredStores: string[]) {
  if (preferredStores.length === 0) {
    return 0;
  }

  return preferredStores.includes(normalize(product.store)) ? 2 : 0;
}

function budgetScore(product: Product, budgetCap: number | null) {
  if (!budgetCap) {
    return 0;
  }

  const categoryBudget = budgetCap / 4.6;

  if (product.price <= categoryBudget) {
    return 2;
  }

  if (product.price <= categoryBudget * 1.25) {
    return 0;
  }

  return -2;
}

function scoreProduct(product: Product, answers: QuizAnswers) {
  const preferredColors = splitCommaSeparated(answers.preferredColors);
  const avoidColors = splitCommaSeparated(answers.avoidColors);
  const preferredStores = splitCommaSeparated(answers.storesLike);
  const budgetCap = budgetCapFromRange(answers.budgetRange);

  const aestheticScore = getTagScore(answers.aesthetic, product.aestheticTags, fallbackAesthetics);
  const occasionScore = getTagScore(answers.occasion, product.occasionTags, fallbackOccasions);
  const sizeMatch = sizeScore(product, answers);

  const score =
    aestheticScore.score +
    occasionScore.score +
    fitScore(product, answers.fitPreference) +
    stylePreferenceScore(product, answers.stylePreference) +
    colorScore(product, preferredColors, avoidColors) +
    storeScore(product, preferredStores) +
    budgetScore(product, budgetCap) +
    sizeMatch.score;

  return {
    product,
    score,
    exact: aestheticScore.exact && occasionScore.exact && sizeMatch.exact,
  };
}

function uniqueColors(items: Product[]) {
  return Array.from(new Set(items.flatMap((item) => item.colors))).slice(0, 4);
}

function buildName(aesthetic: Aesthetic, occasion: Occasion, index: number) {
  const exactNames: Record<string, string> = {
    "old money|date": "Old Money Dinner Look",
    "streetwear|reels": "Streetwear Reel Fit",
    "minimalist|date": "Minimalist Coffee Date",
    "clean girl|daily wear": "Clean Girl Everyday",
    "office|office": "Smart Casual Office Edit",
    "party|party": "Party Night Look",
    "travel|travel": "Airport Travel Look",
    "creator/photoshoot|brand content": "Brand Shoot Neutral Fit",
  };

  const exactKey = `${aesthetic}|${occasion}`;

  if (exactNames[exactKey]) {
    return index === 0 ? exactNames[exactKey] : `${exactNames[exactKey]} ${index + 1}`;
  }

  return `${formatLabel(aesthetic)} ${formatLabel(occasion)} Look ${index + 1}`;
}

function buildFitNote(items: Product[], answers: QuizAnswers) {
  const topFit = items[0]?.fitType ?? "regular";
  const bottomFit = items[1]?.fitType ?? "regular";
  const sizeNote = answers.topSize && answers.bottomSize ? `around your ${answers.topSize}/${answers.bottomSize} size brief` : "around your saved size brief";

  return `${formatLabel(topFit)} structure on top with ${bottomFit} balance below keeps the look polished ${sizeNote}.`;
}

function buildWhyItWorks(items: Product[], budgetCap: number | null, answers: QuizAnswers) {
  const stores = Array.from(new Set(items.map((item) => item.store)));
  const preferredColors = splitCommaSeparated(answers.preferredColors);
  const matchingColor = items
    .flatMap((item) => item.colors)
    .find((color) => preferredColors.includes(normalize(color)));

  if (matchingColor && budgetCap) {
    return `${formatLabel(matchingColor)} tones keep the outfit cohesive while the mix from ${stores.slice(0, 2).join(" and ")} stays inside your target spend.`;
  }

  if (matchingColor) {
    return `${formatLabel(matchingColor)} tones help the outfit feel intentional, with a mix that looks styled rather than random.`;
  }

  return `The mix of ${stores.slice(0, 2).join(" and ")} gives you a full look that feels balanced for ${formatLabel(answers.occasion || "daily wear")}.`;
}

function buildCreatorUseCase(occasion: Occasion) {
  const useCases: Record<Occasion, string> = {
    reels: "Best for creator reels and short-form outfit content.",
    photoshoot: "Best for styled photoshoots and brand image days.",
    date: "Best for date nights and polished evening content.",
    party: "Best for event nights and party-ready captures.",
    college: "Best for campus days, coffee runs, and casual GRWM posts.",
    office: "Best for office polish, founder meetings, and weekday content.",
    travel: "Best for airport looks and travel-day vlogs.",
    "wedding guest": "Best for elevated guest dressing with easy shopping links.",
    "daily wear": "Best for everyday styling when you still want a finished look.",
    "brand content": "Best for sponsor shoots and creator-ready brand moments.",
  };

  return useCases[occasion];
}

function confidenceFromScore(score: number, matchMode: "exact" | "closest") {
  const base = matchMode === "exact" ? 82 : 68;

  return Math.max(58, Math.min(98, base + Math.round(score)));
}

function getPoolForCategory(category: ProductCategory, answers: QuizAnswers, count: number) {
  const categoryProducts = products
    .filter((product) => product.category === category)
    .map((product) => scoreProduct(product, answers))
    .sort((left, right) => right.score - left.score || left.product.price - right.product.price);

  const exact = categoryProducts.filter((entry) => entry.exact && entry.score > 0);
  const fallback = categoryProducts.filter((entry) => entry.score > -8);

  return {
    exact,
    fallback,
    pool: (exact.length > 0 ? exact : fallback).slice(0, count),
  };
}

function sortAndTrimRecommendations(recommendations: OutfitRecommendation[], limit: number) {
  return recommendations
    .sort(
      (left, right) =>
        right.confidenceScore - left.confidenceScore || left.totalPrice - right.totalPrice,
    )
    .slice(0, limit);
}

export function buildOutfitRecommendations(answers: QuizAnswers, limit = 8) {
  const budgetCap = budgetCapFromRange(answers.budgetRange);
  const topPool = getPoolForCategory("top", answers, 5);
  const bottomPool = getPoolForCategory("bottom", answers, 5);
  const shoesPool = getPoolForCategory("shoes", answers, 4);
  const accessoryPool = getPoolForCategory("accessory", answers, 4);
  const outerwearPool = getPoolForCategory("outerwear", answers, 3);

  const allRequiredPools = [topPool, bottomPool, shoesPool, accessoryPool];
  const shouldUseFallback = allRequiredPools.some((pool) => pool.exact.length === 0);
  const recommendations: OutfitRecommendation[] = [];
  const outerwearChoices = [undefined, ...outerwearPool.pool];

  for (const top of topPool.pool) {
    for (const bottom of bottomPool.pool) {
      for (const shoes of shoesPool.pool) {
        for (const accessory of accessoryPool.pool) {
          for (const outerwear of outerwearChoices) {
            const productEntries = [top, bottom, shoes, accessory, outerwear].filter(
              Boolean,
            ) as ScoredProduct[];
            const items = productEntries.map((entry) => entry.product);
            const totalPrice = items.reduce((sum, item) => sum + item.price, 0);

            if (budgetCap && totalPrice > budgetCap * 1.35) {
              continue;
            }

            let outfitScore = productEntries.reduce((sum, entry) => sum + entry.score, 0);

            const sharedStores = new Set(items.map((item) => item.store));
            const colorPalette = uniqueColors(items);
            const matchingAestheticCount = items.filter((item) =>
              answers.aesthetic ? item.aestheticTags.includes(answers.aesthetic) : false,
            ).length;
            const matchingOccasionCount = items.filter((item) =>
              answers.occasion ? item.occasionTags.includes(answers.occasion) : false,
            ).length;

            outfitScore += matchingAestheticCount * 1.5;
            outfitScore += matchingOccasionCount * 1.2;
            outfitScore += colorPalette.length <= 4 ? 2 : 0;
            outfitScore += sharedStores.size >= 2 ? 1 : 0;

            if (budgetCap) {
              if (totalPrice <= budgetCap) {
                outfitScore += 4;
              } else {
                outfitScore -= 2;
              }
            }

            const matchMode: OutfitRecommendation["matchMode"] =
              shouldUseFallback || productEntries.some((entry) => !entry.exact)
                ? "closest"
                : "exact";
            const name = buildName(
              (answers.aesthetic || "smart casual") as Aesthetic,
              (answers.occasion || "daily wear") as Occasion,
              recommendations.length,
            );

            recommendations.push({
              id: productEntries.map((entry) => entry.product.id).join("__"),
              name,
              aesthetic: (answers.aesthetic || "smart casual") as Aesthetic,
              occasion: (answers.occasion || "daily wear") as Occasion,
              totalPrice,
              items: {
                top: top.product,
                bottom: bottom.product,
                shoes: shoes.product,
                accessory: accessory.product,
                outerwear: outerwear?.product,
              },
              colorPalette,
              fitNote: buildFitNote(items, answers),
              whyItWorks: buildWhyItWorks(items, budgetCap, answers),
              creatorUseCase: buildCreatorUseCase(
                (answers.occasion || "daily wear") as Occasion,
              ),
              confidenceScore: confidenceFromScore(outfitScore, matchMode),
              stores: Array.from(sharedStores),
              matchMode,
              shopUrl: top.product.url,
            });
          }
        }
      }
    }
  }

  const uniqueRecommendations = Array.from(
    new Map(recommendations.map((recommendation) => [recommendation.id, recommendation])).values(),
  );

  if (uniqueRecommendations.length > 0) {
    return sortAndTrimRecommendations(uniqueRecommendations, limit);
  }

  const cheapestFallback = requiredCategories.map((category) =>
    products
      .filter((product) => product.category === category)
      .sort((left, right) => left.price - right.price)[0],
  );

  const fallbackItems = cheapestFallback.filter(Boolean) as Product[];

  if (fallbackItems.length < 4) {
    return [];
  }

  return [
    {
      id: fallbackItems.map((item) => item.id).join("__"),
      name: "Closest FitMuse Look",
      aesthetic: (answers.aesthetic || "smart casual") as Aesthetic,
      occasion: (answers.occasion || "daily wear") as Occasion,
      totalPrice: fallbackItems.reduce((sum, item) => sum + item.price, 0),
      items: {
        top: fallbackItems.find((item) => item.category === "top") as Product,
        bottom: fallbackItems.find((item) => item.category === "bottom") as Product,
        shoes: fallbackItems.find((item) => item.category === "shoes") as Product,
        accessory: fallbackItems.find((item) => item.category === "accessory") as Product,
        outerwear: undefined,
      },
      colorPalette: uniqueColors(fallbackItems),
      fitNote: buildFitNote(fallbackItems, answers),
      whyItWorks: "This is the closest ready-to-buy mix available in the current MVP catalog.",
      creatorUseCase: buildCreatorUseCase((answers.occasion || "daily wear") as Occasion),
      confidenceScore: 62,
      stores: Array.from(new Set(fallbackItems.map((item) => item.store))),
      matchMode: "closest" as const,
      shopUrl: fallbackItems[0].url,
    },
  ];
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
