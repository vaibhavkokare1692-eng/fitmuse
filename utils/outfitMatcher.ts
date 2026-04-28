import { getStyleRulesForBrief, type StyleRule } from "@/data/styleRules";
import { products } from "@/data/products";
import {
  formatAestheticLabel,
  isCreatorOccasion,
  splitCommaSeparated,
} from "@/lib/utils";
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
  styleRuleBoost: number;
  exactAesthetic: boolean;
  fallbackAesthetic: boolean;
  exactOccasion: boolean;
  fallbackOccasion: boolean;
  sizeExact: boolean;
  fitExact: boolean;
  fitAligned: boolean;
  matchedPreferredColors: string[];
  matchedPreferredFamily: boolean;
  matchedStores: string[];
  matchReasons: string[];
  matchedStyleRuleNames: string[];
  styleRuleReasons: string[];
  styleRuleAvoidHits: string[];
  creatorAlignmentScore: number;
};

type StyleRuleProductSignal = {
  score: number;
  matchedRuleNames: string[];
  matchReasons: string[];
  avoidHits: string[];
};

const coreCategories: ProductCategory[] = ["top", "bottom", "shoes"];
const poolSizes: Record<ProductCategory, number> = {
  top: 9,
  bottom: 9,
  shoes: 7,
  accessory: 6,
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

const quietLuxuryPalette = new Set([
  "cream",
  "navy",
  "camel",
  "forest green",
  "burgundy",
  "charcoal",
  "stone",
  "white",
  "off-white",
  "ivory",
  "taupe",
  "espresso",
  "chocolate",
  "tan",
  "beige",
  "maroon",
  "rust",
]);

const neutralBaseColors = new Set([
  "cream",
  "white",
  "off-white",
  "ivory",
  "stone",
  "charcoal",
  "camel",
  "beige",
  "taupe",
  "navy",
  "ecru",
  "oatmeal",
]);

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

function buildProductSearchText(product: Product) {
  return normalize(
    [
      product.name,
      product.styleNotes,
      product.primaryColor,
      ...product.colors,
      product.category,
      product.visualType,
      product.store,
    ].join(" "),
  );
}

function keywordMatches(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(normalize(keyword)));
}

function itemSignalKeywords(signal: string) {
  const normalized = normalize(signal);
  const keywords: Record<string, string[]> = {
    "oxford shirt": ["oxford"],
    "button-down shirt": ["button-down", "button down", "oxford"],
    "knit polo": ["knit polo", "knitted polo", "polo"],
    "knitted polo": ["knit polo", "knitted polo", "polo"],
    "quarter-zip": ["quarter-zip", "quarter zip", "half-zip", "half zip"],
    "textured cardigan": ["cardigan"],
    cardigan: ["cardigan"],
    "unstructured navy blazer": ["blazer"],
    blazer: ["blazer"],
    "suede layer": ["suede"],
    "textured jacket": ["textured", "jacket", "overshirt", "suede"],
    "crewneck": ["crewneck"],
    "tailored trousers": ["trouser", "trousers", "pleated", "front-crease", "front crease"],
    "flannel trousers": ["flannel", "trouser", "trousers"],
    chinos: ["chino", "chinos"],
    "dark trousers": ["trouser", "trousers"],
    "grey flannel trousers": ["flannel", "trouser", "trousers"],
    "dark clean denim": ["denim", "jeans"],
    "penny loafers": ["loafer", "loafers"],
    "tassel loafers": ["loafer", "loafers"],
    loafers: ["loafer", "loafers"],
    "chelsea boots": ["chelsea", "boot", "boots"],
    "minimal leather sneakers": ["minimal", "sneaker", "sneakers", "court sneakers", "leather sneakers"],
    "minimal sneakers": ["minimal", "sneaker", "sneakers", "court sneakers"],
    "slim leather belt": ["belt"],
    "simple analog watch": ["watch"],
    "simple dress watch": ["watch"],
    "subtle fragrance": ["fragrance"],
    "clean bag": ["bag", "tote", "sling", "crossbody", "weekender", "laptop bag"],
    "clean clothing": [],
    "coordinated accessories": ["watch", "belt", "bag"],
  };

  return keywords[normalized] ?? [normalized];
}

function matchesPrioritySignal(product: Product, signal: string) {
  const text = buildProductSearchText(product);
  const normalizedSignal = normalize(signal);

  if (normalizedSignal === "top") {
    return product.category === "top";
  }

  if (normalizedSignal === "bottom") {
    return product.category === "bottom";
  }

  if (normalizedSignal === "shoes") {
    return product.category === "shoes";
  }

  if (normalizedSignal === "accessory" || normalizedSignal === "accessories") {
    return product.category === "accessory";
  }

  if (normalizedSignal === "outerwear") {
    return product.category === "outerwear";
  }

  return keywordMatches(text, itemSignalKeywords(signal));
}

function matchesPriorityColor(product: Product, color: string) {
  const normalizedColor = normalize(color);
  const normalizedProductColors = product.colors.map(normalize);

  if (normalizedColor === "quiet palette") {
    return normalizedProductColors.some((entry) => quietLuxuryPalette.has(entry));
  }

  if (normalizedColor === "neutral base" || normalizedColor === "monochrome neutrals") {
    return normalizedProductColors.some((entry) => neutralBaseColors.has(entry));
  }

  if (normalizedColor === "low-contrast neutrals" || normalizedColor === "soft neutrals") {
    return (
      normalizedProductColors.some((entry) => neutralBaseColors.has(entry)) ||
      product.colorFamily === "neutral" ||
      product.colorFamily === "earth"
    );
  }

  if (normalizedColor === "muted accent" || normalizedColor === "muted premium tones") {
    return (
      normalizedProductColors.some((entry) => quietLuxuryPalette.has(entry)) &&
      !["neon", "electric blue", "royal blue"].includes(product.primaryColor)
    );
  }

  if (normalizedColor === "same quiet-luxury palette") {
    return normalizedProductColors.some((entry) => quietLuxuryPalette.has(entry));
  }

  return normalizedProductColors.includes(normalizedColor) || normalize(product.primaryColor) === normalizedColor;
}

function matchesPriorityFit(product: Product, fitSignal: string) {
  const normalizedFit = normalize(fitSignal);
  const productText = buildProductSearchText(product);

  if (!normalizedFit) {
    return false;
  }

  if (
    normalizedFit === normalize(product.fitType) ||
    (normalizedFit === "slim-straight" && ["slim", "regular"].includes(product.fitType)) ||
    (normalizedFit === "clean tailoring" && ["classy", "regular", "slim"].includes(product.fitType)) ||
    (normalizedFit === "soft structure" &&
      (product.visualType === "soft-structure" || product.visualType === "tailored")) ||
    (normalizedFit === "clean shoulder" && keywordMatches(productText, ["shoulder", "structured", "tailored"])) ||
    (normalizedFit === "controlled drape" && keywordMatches(productText, ["drape", "soft", "tailored"])) ||
    (normalizedFit === "skim fit" && ["slim", "regular", "classy"].includes(product.fitType)) ||
    (normalizedFit === "neat layering" && keywordMatches(productText, ["layer", "cardigan", "zip", "blazer"])) ||
    (normalizedFit === "pressed finish" && ["classy", "regular"].includes(product.fitType))
  ) {
    return true;
  }

  return false;
}

function matchesPriorityMaterial(product: Product, materialSignal: string) {
  const text = buildProductSearchText(product);
  const normalizedMaterial = normalize(materialSignal);

  const materialKeywords: Record<string, string[]> = {
    "oxford cotton": ["oxford"],
    merino: ["merino"],
    cashmere: ["cashmere"],
    "wool blend": ["wool", "flannel"],
    suede: ["suede"],
    linen: ["linen"],
    cotton: ["cotton", "oxford"],
    "cotton-linen blend": ["linen", "cotton"],
    "fine gauge knit": ["knit"],
    "cotton knit": ["knit"],
    "soft wool blend": ["wool", "merino", "flannel"],
    flannel: ["flannel"],
    "clean denim": ["denim", "jeans"],
    leather: ["leather"],
    "smooth leather": ["leather"],
    "soft tailoring": ["tailored", "blazer"],
    "structured cotton": ["cotton", "structured"],
    "polished natural textures": ["leather", "merino", "wool", "cotton", "suede"],
    "budget-friendly natural feel": ["cotton", "merino", "oxford"],
  };

  return keywordMatches(text, materialKeywords[normalizedMaterial] ?? [normalizedMaterial]);
}

function matchesAvoidSignal(product: Product, signal: string) {
  const normalizedSignal = normalize(signal);
  const text = buildProductSearchText(product);
  const normalizedColors = product.colors.map(normalize);

  const avoidKeywords: Record<string, string[]> = {
    "visible logos": ["logo", "logos"],
    "loud branding": ["logo", "branding", "monogram"],
    "loud monograms": ["monogram"],
    "oversized branding": ["logo", "branding"],
    "brand-led statement pieces": ["logo", "graphic", "monogram"],
    "graphic tee": ["graphic"],
    "chunky sneakers": ["chunky", "skate", "runner"],
    "chunky loud sneakers": ["chunky", "skate", "runner"],
    "patent leather shoes": ["patent", "glossy"],
    "patent finish": ["patent", "glossy"],
    "glossy synthetic": ["glossy", "synthetic", "nylon"],
    "shiny synthetic": ["synthetic", "glossy", "nylon"],
    "high-shine suiting": ["high-shine", "glossy"],
    "sport polo styling": ["sport"],
    "technical sportswear": ["technical", "sport"],
    "technical-looking fabric noise": ["technical", "nylon"],
    "sport-golf styling": ["sport", "golf"],
    "hype-sneaker energy": ["chunky", "skate", "runner"],
    "distressed denim": ["distress", "rips", "whisker", "faded"],
    "heavy fading": ["faded"],
    "skinny jeans": ["skinny"],
    "extra slim pants": ["extra slim"],
    "trend-heavy leg shape": ["skinny"],
    "shiny faux leather": ["glossy", "patent"],
    "loud rocker styling": ["studded", "graphic"],
    "over-layered costume energy": ["graphic", "contrast"],
    "costume energy": ["graphic", "contrast"],
    "over-matching": [],
    "over-accessorizing": [],
    "sloppy wrinkled garment": [],
    "messy presentation": [],
    "too many themed pieces": [],
    "too many matching signals": [],
  };

  if (
    normalizedSignal === "more than 3 colors" ||
    normalizedSignal === "overly bright saturated shirt colors"
  ) {
    return normalizedColors.length > 3;
  }

  if (normalizedSignal === "clashing leather tones") {
    return product.category === "accessory" && !keywordMatches(text, ["belt", "watch", "bag"]);
  }

  return keywordMatches(text, avoidKeywords[normalizedSignal] ?? [normalizedSignal]);
}

function scoreProductAgainstStyleRules(
  product: Product,
  rules: StyleRule[],
  budgetCap: number | null,
) {
  if (rules.length === 0) {
    return {
      score: 0,
      matchedRuleNames: [],
      matchReasons: [],
      avoidHits: [],
    } satisfies StyleRuleProductSignal;
  }

  const matchedRuleNames = new Set<string>();
  const matchReasons = new Set<string>();
  const avoidHits = new Set<string>();
  let score = 0;
  const categoryTarget = budgetTargetForCategory(product.category, budgetCap);

  for (const rule of rules) {
    let localScore = 0;

    const prioritizedItemHit = rule.prioritize.items.some((signal) =>
      matchesPrioritySignal(product, signal),
    );
    const prioritizedColorHit = rule.prioritize.colors.some((signal) =>
      matchesPriorityColor(product, signal),
    );
    const prioritizedFitHit = rule.prioritize.fits.some((signal) =>
      matchesPriorityFit(product, signal),
    );
    const prioritizedMaterialHit = rule.prioritize.materials.some((signal) =>
      matchesPriorityMaterial(product, signal),
    );
    const prioritizedShoeHit = rule.prioritize.shoes.some((signal) =>
      matchesPrioritySignal(product, signal),
    );
    const prioritizedAccessoryHit = rule.prioritize.accessories.some((signal) =>
      matchesPrioritySignal(product, signal),
    );

    if (prioritizedItemHit) {
      localScore += 2;
    }

    if (prioritizedColorHit) {
      localScore += 1;
    }

    if (prioritizedFitHit) {
      localScore += 1;
    }

    if (prioritizedMaterialHit) {
      localScore += 1;
    }

    if (prioritizedShoeHit) {
      localScore += product.category === "shoes" ? 2 : 1;
    }

    if (prioritizedAccessoryHit) {
      localScore += product.category === "accessory" ? 2 : 1;
    }

    if (
      rule.id === "budget-100-200-core-outfit" &&
      budgetCap &&
      coreCategories.includes(product.category) &&
      categoryTarget &&
      product.price <= categoryTarget * 1.03
    ) {
      localScore += 2;
    }

    const localAvoidHits = [
      ...rule.avoid.items,
      ...rule.avoid.colors,
      ...rule.avoid.fits,
      ...rule.avoid.materials,
      ...rule.avoid.styleSignals,
    ].filter((signal) => matchesAvoidSignal(product, signal));

    if (localAvoidHits.length > 0) {
      localScore -= Math.min(4, localAvoidHits.length * 2);
      localAvoidHits.forEach((signal) => avoidHits.add(signal));
    }

    if (localScore > 0) {
      matchedRuleNames.add(rule.name);
      matchReasons.add(rule.matchReason);
    }

    score += Math.max(-4, Math.min(4, localScore));
  }

  return {
    score: Math.max(-12, Math.min(16, score)),
    matchedRuleNames: Array.from(matchedRuleNames),
    matchReasons: Array.from(matchReasons).slice(0, 4),
    avoidHits: Array.from(avoidHits),
  } satisfies StyleRuleProductSignal;
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
    return budgetCap <= 200 ? budgetCap * 0.24 : budgetCap * 0.3;
  }

  if (category === "accessory") {
    return budgetCap <= 200 ? budgetCap * 0.1 : budgetCap * 0.16;
  }

  if (category === "shoes") {
    return budgetCap <= 200 ? budgetCap * 0.32 : budgetCap * 0.24;
  }

  return budgetCap <= 200 ? budgetCap * 0.28 : budgetCap * 0.22;
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
      score: 16,
      exact: true,
      matchedExact: true,
      matchedFallback: false,
      reason: exactReason,
    };
  }

  const related = fallbacks[selected] ?? [];

  if (tags.some((tag) => related.includes(tag))) {
    return {
      score: 6,
      exact: false,
      matchedExact: false,
      matchedFallback: true,
      reason: fallbackReason,
    };
  }

  return {
    score: -8,
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

  const explicitMatch = product.stylePreferences.includes(preference);
  const openToAll = product.stylePreferences.includes("mixed / open to all");

  if (explicitMatch) {
    return {
      score: preference === "mixed / open to all" ? 2 : 7,
      reason: "Supports your style preference",
    };
  }

  if (openToAll) {
    return {
      score:
        preference === "mixed / open to all" || preference === "androgynous" ? 2 : -8,
      reason:
        preference === "mixed / open to all" || preference === "androgynous"
          ? "Keeps the styling open and flexible"
          : "",
    };
  }

  return {
    score:
      preference === "mixed / open to all" || preference === "androgynous" ? -1 : -10,
    reason: "",
  };
}

function fitScore(product: Product, fitPreference: FitPreference | "") {
  if (!fitPreference) {
    return { score: 0, reason: "", exact: true, aligned: true };
  }

  if (product.fitType === fitPreference) {
    return {
      score: 6,
      reason: `Leans ${formatLabel(fitPreference)} like you asked`,
      exact: true,
      aligned: true,
    };
  }

  if (relatedFits[fitPreference]?.includes(product.fitType)) {
    return {
      score: 3,
      reason: `Keeps a ${formatLabel(product.fitType)} silhouette close to your ${formatLabel(fitPreference)} preference`,
      exact: false,
      aligned: true,
    };
  }

  return { score: -3, reason: "", exact: false, aligned: false };
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

  let score = matchedPreferredColors.length * 5 - matchedAvoidColors.length * 10;

  if (matchedPreferredColors.length === 0 && matchedPreferredFamily) {
    score += 3;
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
    matchedPreferredFamily,
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
    score: matchedStores.length > 0 ? 5 : preferredStores.length > 0 ? -2 : 0,
    matchedStores,
    reason: matchedStores.length > 0 ? `Pulls from a store you already like: ${product.store}` : "",
  };
}

function budgetScore(product: Product, budgetCap: number | null) {
  const target = budgetTargetForCategory(product.category, budgetCap);

  if (!target) {
    return { score: 0, reason: "" };
  }

  if (product.price >= target * 0.45 && product.price <= target * 0.95) {
    return { score: 7, reason: "Lands close to the ideal spend for this category" };
  }

  if (product.price <= target) {
    return { score: 5, reason: "Keeps the outfit budget realistic" };
  }

  if (product.price <= target * 1.08) {
    return { score: 2, reason: "Still sits close to the spend target" };
  }

  if (product.price <= target * 1.18) {
    return { score: -2, reason: "" };
  }

  return { score: -10, reason: "" };
}

function scoreProduct(
  product: Product,
  answers: QuizAnswers,
  matchedStyleRules: StyleRule[],
): ScoredProduct {
  const preferredColors = splitCommaSeparated(answers.preferredColors);
  const avoidedColors = splitCommaSeparated(answers.avoidColors);
  const preferredStores = splitCommaSeparated(answers.storesLike);
  const budgetCap = budgetCapFromRange(answers.budgetRange);
  const aestheticLabel = formatAestheticLabel(answers.aesthetic, answers.stylePreference);

  const aestheticSignal = getTagSignal(
    answers.aesthetic,
    product.aestheticTags,
    fallbackAesthetics,
    `Matches your ${aestheticLabel} aesthetic`,
    `Leans close to your ${aestheticLabel} aesthetic`,
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
  const styleRuleSignal = scoreProductAgainstStyleRules(product, matchedStyleRules, budgetCap);

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
    ...styleRuleSignal.matchReasons,
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
      styleRuleSignal.score +
      creatorAlignmentScore,
    styleRuleBoost: styleRuleSignal.score,
    exactAesthetic: aestheticSignal.matchedExact,
    exactOccasion: occasionSignal.matchedExact,
    fallbackAesthetic: aestheticSignal.matchedFallback,
    fallbackOccasion: occasionSignal.matchedFallback,
    sizeExact: sizeSignal.exact,
    fitExact: fitSignal.exact,
    fitAligned: fitSignal.aligned,
    matchedPreferredColors: colorSignal.matchedPreferredColors,
    matchedPreferredFamily: colorSignal.matchedPreferredFamily,
    matchedStores: storeSignal.matchedStores,
    matchReasons,
    matchedStyleRuleNames: styleRuleSignal.matchedRuleNames,
    styleRuleReasons: styleRuleSignal.matchReasons,
    styleRuleAvoidHits: styleRuleSignal.avoidHits,
    creatorAlignmentScore,
  };
}

function pickPool(category: ProductCategory, answers: QuizAnswers, matchedStyleRules: StyleRule[]) {
  return products
    .filter((product) => product.category === category)
    .map((product) => scoreProduct(product, answers, matchedStyleRules))
    .sort((left, right) => right.score - left.score || left.product.price - right.product.price)
    .slice(0, poolSizes[category]);
}

function uniqueColors(items: Product[]) {
  return Array.from(new Set(items.flatMap((item) => item.colors))).slice(0, 5);
}

function uniqueColorFamilies(items: Product[]) {
  return Array.from(new Set(items.map((item) => item.colorFamily)));
}

function buildName(
  aesthetic: Aesthetic,
  occasion: Occasion,
  stylePreference: StylePreference | "",
  index: number,
) {
  const key = `${aesthetic}|${occasion}`;
  const names: Record<string, string> = {
    "old money|date": "Old Money Dinner Look",
    "streetwear|reels": "Streetwear Reel Fit",
    "minimalist|date": "Minimalist Coffee Date",
    "clean girl|daily wear":
      stylePreference === "feminine" ? "Clean Girl Everyday" : "Clean Minimal Everyday",
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

  const baseAestheticLabel = formatAestheticLabel(aesthetic, stylePreference);
  const baseName = names[key] ?? `${baseAestheticLabel} ${formatLabel(occasion)} Look`;

  return index === 0 ? baseName : `${baseName} ${index + 1}`;
}

function buildBudgetMatch(totalPrice: number, budgetCap: number | null) {
  if (!budgetCap) {
    return {
      label: "Near budget" as BudgetMatchLabel,
      note: "You left the budget flexible, so FitMuse prioritized overall match quality.",
    };
  }

  if (totalPrice <= budgetCap) {
    return {
      label: "Within budget" as BudgetMatchLabel,
      note: `This look stays inside your ${formatLabel(budgetLabelFromCap(budgetCap))} budget target.`,
    };
  }

  if (totalPrice <= budgetCap * 1.08) {
    return {
      label: "Near budget" as BudgetMatchLabel,
      note: `This look lands close to your ${formatLabel(budgetLabelFromCap(budgetCap))} budget target.`,
    };
  }

  return {
    label: "Over budget but strong style match" as BudgetMatchLabel,
    note: `This look runs over your ${formatLabel(budgetLabelFromCap(budgetCap))} target, but the styling match scored strongly enough to keep it in the mix.`,
  };
}

function buildCreatorUseCase(occasion: Occasion) {
  const labels: Record<Occasion, string> = {
    reels: "Best for creator reels, transitions, and fast-turn content days.",
    photoshoot: "Best for styled photoshoots, editorial sets, and campaign content.",
    date: "Best for dinner dates, rooftop drinks, and polished evening plans.",
    party: "Best for event nights, nightlife plans, and sharper going-out looks.",
    college: "Best for campus days, coffee runs, and everyday student styling.",
    office: "Works well for office days, client meetings, and smart casual work settings.",
    travel: "Useful for airport days, travel transfers, and easy arrival looks.",
    "wedding guest": "Best for guest dressing that still feels realistic to shop.",
    "daily wear": "Best for everyday styling when you still want the look to feel complete.",
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

  return `${palette.slice(0, 3).map(formatLabel).join(", ")} tones keep the outfit cohesive while ${leadStores.join(" + ")} gives it a polished multi-store finish.`;
}

function getStyleIntelligenceReasons(productEntries: ScoredProduct[], answers: QuizAnswers) {
  const reasons = new Set<string>();
  const matchedRuleNames = Array.from(
    new Set(productEntries.flatMap((entry) => entry.matchedStyleRuleNames)),
  );
  const styleRuleReasons = Array.from(
    new Set(productEntries.flatMap((entry) => entry.styleRuleReasons)),
  );
  const avoidHits = productEntries.flatMap((entry) => entry.styleRuleAvoidHits);
  const itemText = normalize(productEntries.map((entry) => entry.product.name).join(" "));

  if (matchedRuleNames.length > 0 && answers.aesthetic) {
    const aestheticLabel = formatAestheticLabel(answers.aesthetic, answers.stylePreference);
    const occasionLabel =
      answers.occasion === "date"
        ? "date-night"
        : normalize(formatLabel(answers.occasion || "")).replace(/\s+/g, "-");

    reasons.add(
      `Matches ${aestheticLabel} ${occasionLabel || "style"} rules from FitMuse's style intelligence.`,
    );
  }

  if (
    keywordMatches(itemText, ["trouser", "trousers", "chino"]) &&
    keywordMatches(itemText, ["loafer", "sneaker", "boot"])
  ) {
    reasons.add("Prioritizes tailored trousers, clean shoes, and quiet-luxury colors.");
  }

  if (avoidHits.length === 0 || matchedRuleNames.includes("Avoid Logos")) {
    reasons.add("Keeps the look polished by avoiding loud logos and overdesigned pieces.");
  }

  for (const reason of styleRuleReasons) {
    reasons.add(reason);

    if (reasons.size >= 3) {
      break;
    }
  }

  return Array.from(reasons).slice(0, 3);
}

function buildMatchReasons(
  productEntries: ScoredProduct[],
  answers: QuizAnswers,
  totalPrice: number,
  budgetLabel: BudgetMatchLabel,
) {
  const reasons = new Set<string>();
  const styleIntelligenceReasons = getStyleIntelligenceReasons(productEntries, answers);
  const aestheticLabel = formatAestheticLabel(answers.aesthetic, answers.stylePreference);
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

  styleIntelligenceReasons.forEach((reason) => reasons.add(reason));

  if (answers.aesthetic) {
    const exactCount = productEntries.filter((entry) => entry.exactAesthetic).length;
    reasons.add(
      exactCount >= 2
        ? `Matches your ${aestheticLabel} aesthetic`
        : `Leans close to your ${aestheticLabel} aesthetic`,
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

  if (budgetLabel === "Within budget") {
    reasons.add(`Keeps the look within ${formatLabel(answers.budgetRange || "your target budget")}`);
  } else if (budgetLabel === "Near budget") {
    reasons.add("Keeps the full outfit close to your budget range");
  } else {
    reasons.add(`Pushes past ${formatLabel(answers.budgetRange || "budget")} only because the overall match is stronger`);
  }

  if (productEntries.every((entry) => entry.sizeExact)) {
    reasons.add("Available in the sizes saved in your style brief");
  }

  return Array.from(reasons);
}

function matchQualityLabel(confidenceScore: number) {
  if (confidenceScore >= 75) {
    return "Best match" as MatchQualityLabel;
  }

  if (confidenceScore >= 55) {
    return "Strong match" as MatchQualityLabel;
  }

  return "Closest match" as MatchQualityLabel;
}

function buildConfidenceScore(
  productEntries: ScoredProduct[],
  budgetCap: number | null,
  totalPrice: number,
  creatorAlignmentScore: number,
  occasion: Occasion,
) {
  const items = productEntries.map((entry) => entry.product);
  const exactAestheticCount = productEntries.filter((entry) => entry.exactAesthetic).length;
  const fallbackAestheticCount = productEntries.filter((entry) => entry.fallbackAesthetic).length;
  const exactOccasionCount = productEntries.filter((entry) => entry.exactOccasion).length;
  const fallbackOccasionCount = productEntries.filter((entry) => entry.fallbackOccasion).length;
  const sizeExactCount = productEntries.filter((entry) => entry.sizeExact).length;
  const fitExactCount = productEntries.filter((entry) => entry.fitExact).length;
  const fitAlignedCount = productEntries.filter((entry) => entry.fitAligned).length;
  const matchedColorCount = Array.from(
    new Set(productEntries.flatMap((entry) => entry.matchedPreferredColors)),
  ).length;
  const matchedPreferredFamilyCount = productEntries.filter(
    (entry) => entry.matchedPreferredFamily,
  ).length;
  const matchedStoreCount = Array.from(
    new Set(productEntries.flatMap((entry) => entry.matchedStores)),
  ).length;
  const styleRuleCoverage = productEntries.filter(
    (entry) => entry.matchedStyleRuleNames.length > 0,
  ).length;
  const totalStyleRuleBoost = productEntries.reduce(
    (sum, entry) => sum + Math.max(0, entry.styleRuleBoost),
    0,
  );
  const allSizeMatched = sizeExactCount === productEntries.length;
  const paletteTight = new Set(items.map((item) => item.colorFamily)).size <= 3;
  const withinBudget = budgetCap ? totalPrice <= budgetCap : false;
  const nearBudget = budgetCap ? totalPrice <= budgetCap * 1.08 : false;

  let confidence = 28;

  if (exactAestheticCount >= 2) {
    confidence += 20;
  } else if (exactAestheticCount === 1) {
    confidence += 14;
  } else if (fallbackAestheticCount >= 2) {
    confidence += 10;
  } else if (fallbackAestheticCount === 1) {
    confidence += 6;
  } else {
    confidence -= 4;
  }

  if (exactOccasionCount >= 2) {
    confidence += 20;
  } else if (exactOccasionCount === 1) {
    confidence += 14;
  } else if (fallbackOccasionCount >= 2) {
    confidence += 10;
  } else if (fallbackOccasionCount === 1) {
    confidence += 6;
  } else {
    confidence -= 4;
  }

  if (!budgetCap) {
    confidence += 10;
  } else if (withinBudget) {
    confidence += 18;
  } else if (nearBudget) {
    confidence += 10;
  } else if (totalPrice <= budgetCap * 1.16) {
    confidence += 3;
  } else {
    confidence -= 8;
  }

  if (allSizeMatched) {
    confidence += 10;
  } else if (sizeExactCount >= Math.max(2, productEntries.length - 1)) {
    confidence += 5;
  } else {
    confidence -= 6;
  }

  if (fitExactCount >= 2) {
    confidence += 8;
  } else if (fitAlignedCount >= 2) {
    confidence += 5;
  } else if (fitAlignedCount >= 1) {
    confidence += 2;
  }

  if (matchedColorCount > 0) {
    confidence += 6;
  } else if (matchedPreferredFamilyCount > 0) {
    confidence += 3;
  }

  if (matchedStoreCount > 0) {
    confidence += 4;
  }

  if (styleRuleCoverage >= 2) {
    confidence += Math.min(8, Math.round(totalStyleRuleBoost / 4));
  } else if (styleRuleCoverage === 1) {
    confidence += Math.min(4, Math.round(totalStyleRuleBoost / 6));
  }

  if (paletteTight) {
    confidence += 4;
  }

  if (isCreatorOccasion(occasion) && creatorAlignmentScore >= 4) {
    confidence += 4;
  }

  if (budgetCap && totalPrice <= budgetCap && productEntries.length <= 4) {
    confidence += 2;
  }

  return Math.max(35, Math.min(96, confidence));
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
  const confidenceScore = buildConfidenceScore(
    productEntries,
    budgetCap,
    totalPrice,
    creatorAlignmentScore,
    (answers.occasion || "daily wear") as Occasion,
  );
  const matchMode: OutfitRecommendation["matchMode"] =
    confidenceScore >= 55 ? "exact" : "closest";
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
      answers.stylePreference,
      index,
    ),
    aesthetic: (answers.aesthetic || "smart casual") as Aesthetic,
    occasion: (answers.occasion || "daily wear") as Occasion,
    totalPrice,
    items: {
      top: productEntries.find((entry) => entry.product.category === "top")!.product,
      bottom: productEntries.find((entry) => entry.product.category === "bottom")!.product,
      shoes: productEntries.find((entry) => entry.product.category === "shoes")!.product,
      accessory: productEntries.find((entry) => entry.product.category === "accessory")?.product,
      outerwear: productEntries.find((entry) => entry.product.category === "outerwear")?.product,
    },
    colorPalette,
    colorFamilies: uniqueColorFamilies(items),
    fitNote: buildFitNote(items, answers),
    whyItWorks: buildWhyItWorks(items, answers, matchedColors),
    creatorUseCase: buildCreatorUseCase((answers.occasion || "daily wear") as Occasion),
    confidenceScore,
    matchQualityLabel: matchQualityLabel(confidenceScore),
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
  const matchedStyleRules = getStyleRulesForBrief({
    aesthetic: answers.aesthetic,
    occasion: answers.occasion,
    stylePreference: answers.stylePreference,
    budget: answers.budgetRange,
    fitPreference: answers.fitPreference,
    region: answers.location,
  });
  const topPool = pickPool("top", answers, matchedStyleRules);
  const bottomPool = pickPool("bottom", answers, matchedStyleRules);
  const shoesPool = pickPool("shoes", answers, matchedStyleRules);
  const accessoryPool = pickPool("accessory", answers, matchedStyleRules);
  const outerwearPool = pickPool("outerwear", answers, matchedStyleRules);
  const budgetCap = budgetCapFromRange(answers.budgetRange);
  const recommendations: OutfitRecommendation[] = [];
  const accessoryChoices = [undefined, ...accessoryPool];
  const outerwearChoices = [undefined, ...outerwearPool];

  for (const top of topPool) {
    for (const bottom of bottomPool) {
      for (const shoes of shoesPool) {
        for (const accessory of accessoryChoices) {
          for (const outerwear of outerwearChoices) {
            const productEntries = [top, bottom, shoes, accessory, outerwear].filter(Boolean) as ScoredProduct[];
            const items = productEntries.map((entry) => entry.product);
            const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
            const coreTotal = [top, bottom, shoes].reduce(
              (sum, entry) => sum + entry.product.price,
              0,
            );

            if (budgetCap && coreTotal > budgetCap * 1.08) {
              continue;
            }

            if (budgetCap && budgetCap <= 200 && totalPrice > budgetCap * 1.1) {
              continue;
            }

            if (budgetCap && budgetCap > 200 && totalPrice > budgetCap * 1.16) {
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

  const budgetPriority = (label: BudgetMatchLabel) => {
    if (label === "Within budget") {
      return 0;
    }

    if (label === "Near budget") {
      return 1;
    }

    return 2;
  };

  const sorted = uniqueRecommendations.sort(
    (left, right) =>
      budgetPriority(left.budgetMatchLabel) - budgetPriority(right.budgetMatchLabel) ||
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
        answers.stylePreference,
        index,
      ),
    }));
  }

  const fallbackItems = [...coreCategories, "accessory" as const]
    .map((category) =>
      products
        .filter((product) => product.category === category)
        .sort((left, right) => left.price - right.price)[0],
    )
    .filter(Boolean) as Product[];

  if (fallbackItems.length < 3) {
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
        accessory: fallbackItems.find((item) => item.category === "accessory"),
        outerwear: undefined,
      },
      colorPalette: uniqueColors(fallbackItems),
      colorFamilies: uniqueColorFamilies(fallbackItems),
      fitNote: buildFitNote(fallbackItems, answers),
      whyItWorks: "This is the closest ready-to-buy outfit mix available in the current mock catalog.",
      creatorUseCase: buildCreatorUseCase((answers.occasion || "daily wear") as Occasion),
      confidenceScore: 49,
      matchQualityLabel: "Closest match",
      budgetMatchLabel: "Near budget",
      budgetNote: "This fallback prioritizes showing a complete outfit over a blank page.",
      matchReasons: [
        "No perfect match yet, but this is the closest full outfit in the current mock catalog",
        answers.aesthetic
          ? `Still leans toward your ${formatAestheticLabel(answers.aesthetic, answers.stylePreference)} aesthetic`
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
