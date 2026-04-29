import { formatAestheticLabel, getOccasionResultsDescriptor } from "../lib/utils.ts";
import {
  buildOutfitRecommendations,
  budgetCapFromRange,
  classifyBudgetMatch,
  emptyQuizAnswers,
} from "../utils/outfitMatcher.ts";
import type {
  Aesthetic,
  BudgetRange,
  FitPreference,
  Occasion,
  OutfitRecommendation,
  QuizAnswers,
  StylePreference,
} from "../types/index.ts";

type Scenario = {
  label: string;
  key?: boolean;
  brief: Partial<QuizAnswers> & {
    stylePreference: StylePreference;
    aesthetic: Aesthetic;
    occasion: Occasion;
    budgetRange: BudgetRange;
    fitPreference: FitPreference;
  };
  expectations?: {
    descriptor?: string;
    noCleanGirl?: boolean;
    mostlyWithinOrNear?: boolean;
    maxStretch?: number;
    noFallback?: boolean;
    noCreatorCopy?: boolean;
    avoidUtilitySignals?: boolean;
    requireVerticalLineSignal?: boolean;
    requireSmartSwaps?: boolean;
    requireOfficeSignals?: boolean;
    requireTravelSignals?: boolean;
    requireCreatorSignals?: boolean;
    requireOldMoneySignals?: boolean;
    avoidPetiteBagIssue?: boolean;
  };
};

type ScenarioResult = {
  scenario: Scenario;
  recommendations: OutfitRecommendation[];
  withinBudget: number;
  nearBudget: number;
  stretchUpgrade: number;
  overBudget: number;
  budgetLabelMismatchCount: number;
  averageConfidence: number;
  fallbackWarning: boolean;
  styleDnaSummary: string;
  warnings: string[];
  criticalIssues: string[];
};

const budgets: BudgetRange[] = ["under $100", "$100-$200", "$200-$350", "$350+"];
const fitRotation: FitPreference[] = ["slim", "regular", "relaxed", "oversized"];

const keyScenarios: Scenario[] = [
  {
    label: "Masculine Old Money Date $100-$200 Slim",
    key: true,
    brief: {
      stylePreference: "masculine",
      aesthetic: "old money",
      occasion: "date",
      budgetRange: "$100-$200",
      fitPreference: "slim",
      location: "United States",
      height: "5'8\"",
      topSize: "M",
      bottomSize: "M",
      shoeSize: "11",
      preferredColors: "cream, espresso, sage",
      avoidColors: "neon green",
      storesLike: "Zara, Mango, H&M, ASOS",
    },
    expectations: {
      descriptor: "date-ready",
      noCleanGirl: true,
      mostlyWithinOrNear: true,
      maxStretch: 2,
      noFallback: true,
      noCreatorCopy: true,
      requireOldMoneySignals: true,
      requireSmartSwaps: true,
    },
  },
  {
    label: "Feminine Clean Minimal Date $100-$200",
    key: true,
    brief: {
      stylePreference: "feminine",
      aesthetic: "clean girl",
      occasion: "date",
      budgetRange: "$100-$200",
      fitPreference: "regular",
      location: "United States",
      height: "5'4\"",
      topSize: "S",
      bottomSize: "S",
      shoeSize: "7",
      preferredColors: "cream, sage",
      avoidColors: "neon green",
      storesLike: "Zara, Mango, COS",
    },
    expectations: {
      descriptor: "date-ready",
      mostlyWithinOrNear: true,
      maxStretch: 2,
      noFallback: true,
      noCreatorCopy: true,
      avoidUtilitySignals: true,
      requireSmartSwaps: true,
    },
  },
  {
    label: "Feminine Petite Everyday Clean $100-$200",
    key: true,
    brief: {
      stylePreference: "feminine",
      aesthetic: "clean girl",
      occasion: "daily wear",
      budgetRange: "$100-$200",
      fitPreference: "regular",
      location: "United States",
      height: "5'2\"",
      bodyType: "Petite",
      topSize: "S",
      bottomSize: "S",
      shoeSize: "7",
      preferredColors: "cream, sage",
      avoidColors: "neon green",
      storesLike: "Zara, Mango, COS",
    },
    expectations: {
      descriptor: "everyday",
      mostlyWithinOrNear: true,
      noFallback: true,
      noCreatorCopy: true,
      requireVerticalLineSignal: true,
      requireSmartSwaps: true,
      avoidPetiteBagIssue: true,
    },
  },
  {
    label: "Masculine Office Smart Casual $200-$350",
    key: true,
    brief: {
      stylePreference: "masculine",
      aesthetic: "smart casual",
      occasion: "office",
      budgetRange: "$200-$350",
      fitPreference: "regular",
      location: "United States",
      height: "5'10\"",
      topSize: "M",
      bottomSize: "M",
      shoeSize: "11",
      preferredColors: "navy, stone, espresso",
      avoidColors: "neon green",
      storesLike: "COS, Mango, Uniqlo",
    },
    expectations: {
      descriptor: "office-ready",
      mostlyWithinOrNear: true,
      maxStretch: 2,
      noFallback: true,
      noCreatorCopy: true,
      requireOfficeSignals: true,
      requireSmartSwaps: true,
    },
  },
  {
    label: "Travel Smart Mix $100-$200",
    key: true,
    brief: {
      stylePreference: "mixed / open to all",
      aesthetic: "travel",
      occasion: "travel",
      budgetRange: "$100-$200",
      fitPreference: "relaxed",
      location: "United States",
      height: "5'8\"",
      topSize: "M",
      bottomSize: "M",
      shoeSize: "10",
      preferredColors: "stone, camel, sage",
      avoidColors: "neon green",
      storesLike: "Uniqlo, Zara, COS",
    },
    expectations: {
      descriptor: "travel-ready",
      mostlyWithinOrNear: true,
      maxStretch: 2,
      noFallback: true,
      noCreatorCopy: true,
      requireTravelSignals: true,
      requireSmartSwaps: true,
    },
  },
  {
    label: "Travel Smart Mix $200-$350",
    key: true,
    brief: {
      stylePreference: "mixed / open to all",
      aesthetic: "travel",
      occasion: "travel",
      budgetRange: "$200-$350",
      fitPreference: "relaxed",
      location: "United States",
      height: "5'8\"",
      topSize: "M",
      bottomSize: "M",
      shoeSize: "10",
      preferredColors: "stone, camel, sage",
      avoidColors: "neon green",
      storesLike: "Uniqlo, Zara, COS",
    },
    expectations: {
      descriptor: "travel-ready",
      mostlyWithinOrNear: true,
      maxStretch: 2,
      noFallback: true,
      noCreatorCopy: true,
      requireTravelSignals: true,
      requireSmartSwaps: true,
    },
  },
  {
    label: "Creator Photoshoot $200-$350",
    key: true,
    brief: {
      stylePreference: "mixed / open to all",
      aesthetic: "creator/photoshoot",
      occasion: "photoshoot",
      budgetRange: "$200-$350",
      fitPreference: "regular",
      location: "United States",
      height: "5'8\"",
      topSize: "M",
      bottomSize: "M",
      shoeSize: "10",
      preferredColors: "cream, charcoal, plum",
      avoidColors: "neon green",
      storesLike: "ASOS, Zara, Mango",
    },
    expectations: {
      descriptor: "creator-ready",
      mostlyWithinOrNear: true,
      maxStretch: 2,
      requireCreatorSignals: true,
      requireSmartSwaps: true,
    },
  },
  {
    label: "Under $100 Common Scenario",
    key: true,
    brief: {
      stylePreference: "mixed / open to all",
      aesthetic: "smart casual",
      occasion: "daily wear",
      budgetRange: "under $100",
      fitPreference: "regular",
      location: "United States",
      height: "5'7\"",
      topSize: "M",
      bottomSize: "M",
      shoeSize: "9",
      preferredColors: "stone, cream",
      avoidColors: "neon green",
      storesLike: "H&M, Target, Uniqlo",
    },
  },
];

const matrixTemplates: Array<Omit<Scenario, "brief"> & { brief: Omit<Scenario["brief"], "budgetRange" | "fitPreference"> }> = [
  {
    label: "Matrix Masculine Old Money Date",
    brief: {
      stylePreference: "masculine",
      aesthetic: "old money",
      occasion: "date",
      location: "United States",
      height: "5'9\"",
      topSize: "M",
      bottomSize: "M",
      shoeSize: "11",
      preferredColors: "cream, espresso, sage",
      avoidColors: "neon green",
      storesLike: "Zara, Mango, H&M, ASOS",
    },
  },
  {
    label: "Matrix Masculine Smart Casual Office",
    brief: {
      stylePreference: "masculine",
      aesthetic: "smart casual",
      occasion: "office",
      location: "United States",
      height: "5'10\"",
      topSize: "M",
      bottomSize: "M",
      shoeSize: "11",
      preferredColors: "navy, stone, espresso",
      avoidColors: "neon green",
      storesLike: "COS, Uniqlo, Mango",
    },
  },
  {
    label: "Matrix Masculine Streetwear Photoshoot",
    brief: {
      stylePreference: "masculine",
      aesthetic: "streetwear",
      occasion: "photoshoot",
      location: "United States",
      height: "5'10\"",
      topSize: "L",
      bottomSize: "M",
      shoeSize: "11",
      preferredColors: "charcoal, stone",
      avoidColors: "neon green",
      storesLike: "ASOS, Nike, Adidas",
    },
  },
  {
    label: "Matrix Masculine Travel",
    brief: {
      stylePreference: "masculine",
      aesthetic: "travel",
      occasion: "travel",
      location: "United States",
      height: "5'10\"",
      topSize: "M",
      bottomSize: "M",
      shoeSize: "11",
      preferredColors: "stone, camel, navy",
      avoidColors: "neon green",
      storesLike: "Uniqlo, Zara, COS",
    },
  },
  {
    label: "Matrix Feminine Clean Girl Date",
    brief: {
      stylePreference: "feminine",
      aesthetic: "clean girl",
      occasion: "date",
      location: "United States",
      height: "5'4\"",
      topSize: "S",
      bottomSize: "S",
      shoeSize: "7",
      preferredColors: "cream, sage, camel",
      avoidColors: "neon green",
      storesLike: "Zara, Mango, COS",
    },
  },
  {
    label: "Matrix Feminine Minimalist Daily Wear",
    brief: {
      stylePreference: "feminine",
      aesthetic: "minimalist",
      occasion: "daily wear",
      location: "United States",
      height: "5'4\"",
      topSize: "S",
      bottomSize: "S",
      shoeSize: "7",
      preferredColors: "cream, sage, navy",
      avoidColors: "neon green",
      storesLike: "COS, Mango, Uniqlo",
    },
  },
  {
    label: "Matrix Feminine Party",
    brief: {
      stylePreference: "feminine",
      aesthetic: "party",
      occasion: "party",
      location: "United States",
      height: "5'6\"",
      topSize: "M",
      bottomSize: "M",
      shoeSize: "8",
      preferredColors: "plum, black, gold",
      avoidColors: "neon green",
      storesLike: "ASOS, Zara, Mango",
    },
  },
  {
    label: "Matrix Feminine Smart Casual Office",
    brief: {
      stylePreference: "feminine",
      aesthetic: "smart casual",
      occasion: "office",
      location: "United States",
      height: "5'5\"",
      topSize: "M",
      bottomSize: "M",
      shoeSize: "8",
      preferredColors: "soft white, slate, camel",
      avoidColors: "neon green",
      storesLike: "COS, Mango, Zara",
    },
  },
  {
    label: "Matrix Mixed Minimalist Date",
    brief: {
      stylePreference: "mixed / open to all",
      aesthetic: "minimalist",
      occasion: "date",
      location: "United States",
      height: "5'8\"",
      topSize: "M",
      bottomSize: "M",
      shoeSize: "10",
      preferredColors: "cream, navy, stone",
      avoidColors: "neon green",
      storesLike: "COS, Uniqlo, Mango",
    },
  },
  {
    label: "Matrix Mixed Travel",
    brief: {
      stylePreference: "mixed / open to all",
      aesthetic: "travel",
      occasion: "travel",
      location: "United States",
      height: "5'8\"",
      topSize: "M",
      bottomSize: "M",
      shoeSize: "10",
      preferredColors: "stone, camel, sage",
      avoidColors: "neon green",
      storesLike: "Uniqlo, Zara, COS",
    },
  },
  {
    label: "Matrix Mixed Luxury Neutral Brand Content",
    brief: {
      stylePreference: "mixed / open to all",
      aesthetic: "luxury neutral",
      occasion: "brand content",
      location: "United States",
      height: "5'8\"",
      topSize: "M",
      bottomSize: "M",
      shoeSize: "10",
      preferredColors: "cream, taupe, stone",
      avoidColors: "neon green",
      storesLike: "COS, Mango, Zara",
    },
  },
  {
    label: "Matrix Mixed Streetwear Party",
    brief: {
      stylePreference: "mixed / open to all",
      aesthetic: "streetwear",
      occasion: "party",
      location: "United States",
      height: "5'8\"",
      topSize: "M",
      bottomSize: "M",
      shoeSize: "10",
      preferredColors: "charcoal, stone, black",
      avoidColors: "neon green",
      storesLike: "ASOS, Nike, Adidas",
    },
  },
  {
    label: "Matrix Androgynous Quiet Luxury Office",
    brief: {
      stylePreference: "androgynous",
      aesthetic: "luxury neutral",
      occasion: "office",
      location: "United States",
      height: "6'1\"",
      topSize: "M",
      bottomSize: "M",
      shoeSize: "11",
      preferredColors: "cream, charcoal, stone",
      avoidColors: "neon green",
      storesLike: "COS, Uniqlo, Mango",
    },
  },
  {
    label: "Matrix Androgynous Streetwear Reels",
    brief: {
      stylePreference: "androgynous",
      aesthetic: "streetwear",
      occasion: "reels",
      location: "United States",
      height: "5'9\"",
      topSize: "M",
      bottomSize: "M",
      shoeSize: "10",
      preferredColors: "charcoal, stone, plum",
      avoidColors: "neon green",
      storesLike: "ASOS, Adidas, Nike",
    },
  },
  {
    label: "Matrix Masculine Gym Casual College",
    brief: {
      stylePreference: "masculine",
      aesthetic: "gym casual",
      occasion: "college",
      location: "United States",
      height: "5'11\"",
      topSize: "L",
      bottomSize: "M",
      shoeSize: "11",
      preferredColors: "stone, navy, charcoal",
      avoidColors: "neon green",
      storesLike: "Nike, Adidas, Amazon Fashion",
    },
  },
  {
    label: "Matrix Mixed Creator Photoshoot",
    brief: {
      stylePreference: "mixed / open to all",
      aesthetic: "creator/photoshoot",
      occasion: "photoshoot",
      location: "United States",
      height: "5'8\"",
      topSize: "M",
      bottomSize: "M",
      shoeSize: "10",
      preferredColors: "cream, charcoal, plum",
      avoidColors: "neon green",
      storesLike: "ASOS, Zara, Mango",
    },
  },
  {
    label: "Matrix Feminine Travel",
    brief: {
      stylePreference: "feminine",
      aesthetic: "travel",
      occasion: "travel",
      location: "United States",
      height: "5'4\"",
      topSize: "S",
      bottomSize: "S",
      shoeSize: "7",
      preferredColors: "stone, camel, sage",
      avoidColors: "neon green",
      storesLike: "Uniqlo, Mango, Zara",
    },
  },
  {
    label: "Matrix Feminine Old Money Wedding Guest",
    brief: {
      stylePreference: "feminine",
      aesthetic: "old money",
      occasion: "wedding guest",
      location: "United States",
      height: "5'5\"",
      topSize: "M",
      bottomSize: "M",
      shoeSize: "8",
      preferredColors: "cream, burgundy, camel",
      avoidColors: "neon green",
      storesLike: "Mango, Zara, Nordstrom Rack",
    },
  },
  {
    label: "Matrix Mixed Office Core",
    brief: {
      stylePreference: "mixed / open to all",
      aesthetic: "office",
      occasion: "office",
      location: "United States",
      height: "5'8\"",
      topSize: "M",
      bottomSize: "M",
      shoeSize: "10",
      preferredColors: "navy, stone, camel",
      avoidColors: "neon green",
      storesLike: "COS, Mango, Zara",
    },
  },
  {
    label: "Matrix Androgynous Minimalist Daily Wear",
    brief: {
      stylePreference: "androgynous",
      aesthetic: "minimalist",
      occasion: "daily wear",
      location: "United States",
      height: "5'8\"",
      topSize: "M",
      bottomSize: "M",
      shoeSize: "10",
      preferredColors: "cream, navy, stone",
      avoidColors: "neon green",
      storesLike: "Uniqlo, COS, Mango",
    },
  },
];

const matrixScenarios: Scenario[] = matrixTemplates.flatMap((template) =>
  budgets.map((budgetRange, index) => ({
    label: `${template.label} / ${budgetRange}`,
    brief: {
      ...template.brief,
      budgetRange,
      fitPreference: fitRotation[index % fitRotation.length],
    },
  })),
);

const scenarios = [...keyScenarios, ...matrixScenarios];

function createScenarioBrief(input: Scenario["brief"]) {
  const brief = emptyQuizAnswers();

  return {
    ...brief,
    name: input.stylePreference === "feminine" ? "Ava" : input.stylePreference === "masculine" ? "Noah" : "Alex",
    location: input.location ?? "United States",
    height: input.height ?? "5'8\"",
    topSize: input.topSize ?? "M",
    bottomSize: input.bottomSize ?? "M",
    shoeSize: input.shoeSize ?? "10",
    bodyType: input.bodyType ?? "",
    stylePreference: input.stylePreference,
    aesthetic: input.aesthetic,
    occasion: input.occasion,
    budgetRange: input.budgetRange,
    fitPreference: input.fitPreference,
    preferredColors: input.preferredColors ?? "cream, sage",
    avoidColors: input.avoidColors ?? "neon green",
    storesLike: input.storesLike ?? "Zara, Mango, COS",
  } satisfies QuizAnswers;
}

function hasCreatorCopy(recommendations: OutfitRecommendation[]) {
  return recommendations.some(
    (recommendation) =>
      recommendation.creatorUseCase.toLowerCase().includes("creator-ready") ||
      recommendation.creatorUseCase.toLowerCase().includes("sponsor shoots") ||
      recommendation.creatorUseCase.toLowerCase().includes("brand moments"),
  );
}

function hasVerticalLineSignal(recommendations: OutfitRecommendation[]) {
  return recommendations.some((recommendation) => {
    const text = [
      ...recommendation.matchReasons,
      recommendation.fitNote,
      recommendation.whyItWorks,
      recommendation.items.top.name,
      recommendation.items.bottom.name,
      recommendation.items.shoes.name,
      recommendation.items.accessory?.name ?? "",
      recommendation.items.outerwear?.name ?? "",
    ]
      .join(" ")
      .toLowerCase();

    return (
      text.includes("vertical line") ||
      text.includes("high-rise") ||
      text.includes("high rise") ||
      text.includes("pointed")
    );
  });
}

function hasUtilitySignals(recommendations: OutfitRecommendation[]) {
  return recommendations.slice(0, 5).some((recommendation) => {
    const text = [
      recommendation.items.top.name,
      recommendation.items.bottom.name,
      recommendation.items.shoes.name,
      recommendation.items.accessory?.name ?? "",
      recommendation.items.outerwear?.name ?? "",
      recommendation.fitNote,
      recommendation.whyItWorks,
    ]
      .join(" ")
      .toLowerCase();

    return ["cargo", "utility", "pouch", "runner", "hiking", "panel"].some((signal) =>
      text.includes(signal),
    );
  });
}

function getBudgetCounts(recommendations: OutfitRecommendation[], budgetCap: number | null) {
  const counts = {
    withinBudget: 0,
    nearBudget: 0,
    stretchUpgrade: 0,
    overBudget: 0,
    budgetLabelMismatchCount: 0,
  };

  for (const recommendation of recommendations) {
    const label = classifyBudgetMatch(recommendation.totalPrice, budgetCap);

    if (label === "Within budget") {
      counts.withinBudget += 1;
    } else if (label === "Near budget") {
      counts.nearBudget += 1;
    } else if (label === "Stretch upgrade") {
      counts.stretchUpgrade += 1;
    } else {
      counts.overBudget += 1;
    }

    if (recommendation.budgetMatchLabel !== label) {
      counts.budgetLabelMismatchCount += 1;
    }
  }

  return counts;
}

function hasSavedSnapshotShapeIssue(recommendation?: OutfitRecommendation) {
  if (!recommendation) {
    return true;
  }

  return !(
    recommendation.id &&
    recommendation.name &&
    recommendation.items.top &&
    recommendation.items.bottom &&
    recommendation.items.shoes &&
    Array.isArray(recommendation.priceBreakdown) &&
    recommendation.priceBreakdown.length >= 3 &&
    typeof recommendation.occasionMatch === "string" &&
    typeof recommendation.styleMatch === "string" &&
    typeof recommendation.colorHarmony === "string" &&
    typeof recommendation.fitConfidence === "string" &&
    typeof recommendation.sizeCompatibility === "string" &&
    typeof recommendation.storeMatch === "string" &&
    Array.isArray(recommendation.fitTags) &&
    typeof recommendation.stylingSummary === "string" &&
    Array.isArray(recommendation.smartSwaps) &&
    recommendation.budgetMatchLabel &&
    recommendation.budgetNote &&
    Array.isArray(recommendation.matchReasons) &&
    Array.isArray(recommendation.stores)
  );
}

function buildStyleDnaSummary(brief: QuizAnswers) {
  const colorValues = brief.preferredColors
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  const storeValues = brief.storesLike
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  const aesthetic = brief.aesthetic
    ? `${formatAestheticLabel(brief.aesthetic, brief.stylePreference).toLowerCase()} base`
    : "flexible aesthetic base";
  const fit = brief.fitPreference ? `${brief.fitPreference.toLowerCase()} fit` : "open fit direction";
  const colors = colorValues.length > 0 ? `${colorValues.slice(0, 3).join(", ").toLowerCase()} colors` : "open palette";
  const stores = storeValues.length > 0 ? `${storeValues.slice(0, 2).join(" + ")} stores` : "open-store mix";
  const occasion =
    brief.occasion && brief.occasion !== "daily wear"
      ? `${getOccasionResultsDescriptor(brief.occasion)} flexibility`
      : "everyday flexibility";

  return `Your Style DNA: ${aesthetic}, ${fit}, ${colors}, ${stores}, and ${occasion}.`;
}

function hasOldMoneyMismatch(recommendations: OutfitRecommendation[]) {
  return recommendations.slice(0, 5).some((recommendation) => {
    const text = [
      recommendation.items.top.name,
      recommendation.items.bottom.name,
      recommendation.items.shoes.name,
      recommendation.items.accessory?.name ?? "",
      recommendation.items.outerwear?.name ?? "",
      recommendation.fitNote,
      recommendation.whyItWorks,
    ]
      .join(" ")
      .toLowerCase();

    return ["graphic", "logo", "chunky sneaker", "chunky", "distressed", "cargo"].some((signal) =>
      text.includes(signal),
    );
  });
}

function hasOfficeMismatch(recommendations: OutfitRecommendation[]) {
  return recommendations.slice(0, 5).some((recommendation) => {
    const text = [
      recommendation.items.top.name,
      recommendation.items.bottom.name,
      recommendation.items.shoes.name,
      recommendation.items.accessory?.name ?? "",
      recommendation.items.outerwear?.name ?? "",
      recommendation.fitNote,
      recommendation.whyItWorks,
      ...recommendation.matchReasons,
      ...recommendation.fitTags,
    ]
      .join(" ")
      .toLowerCase();

    return ["party", "club", "gym", "runner", "cargo short", "mesh"].some((signal) =>
      text.includes(signal),
    );
  });
}

function hasTravelSignal(recommendations: OutfitRecommendation[]) {
  return recommendations.some((recommendation) => {
    const text = [
      recommendation.fitNote,
      recommendation.whyItWorks,
      recommendation.creatorUseCase,
      ...recommendation.matchReasons,
      ...recommendation.fitTags,
      recommendation.items.shoes.name,
      recommendation.items.outerwear?.name ?? "",
    ]
      .join(" ")
      .toLowerCase();

    return ["travel", "comfortable", "comfort", "lightweight", "sneaker", "layer", "low-maintenance"].some(
      (signal) => text.includes(signal),
    );
  });
}

function hasCreatorSignal(recommendations: OutfitRecommendation[]) {
  return recommendations.some((recommendation) => {
    const text = [
      recommendation.creatorUseCase,
      recommendation.whyItWorks,
      ...recommendation.matchReasons,
    ]
      .join(" ")
      .toLowerCase();

    return ["creator", "photoshoot", "reels", "brand content", "on-camera", "on camera"].some(
      (signal) => text.includes(signal),
    );
  });
}

function hasPetiteBagIssue(recommendations: OutfitRecommendation[]) {
  return recommendations.some((recommendation) => {
    const text = [
      recommendation.items.accessory?.name ?? "",
      recommendation.items.outerwear?.name ?? "",
      recommendation.fitNote,
      recommendation.whyItWorks,
    ]
      .join(" ")
      .toLowerCase();

    return ["oversized tote", "huge tote", "oversized bag", "giant bag"].some((signal) =>
      text.includes(signal),
    );
  });
}

function analyzeScenario(scenario: Scenario): ScenarioResult {
  const brief = createScenarioBrief(scenario.brief);
  const recommendations = buildOutfitRecommendations(brief, 10);
  const styleDnaSummary = buildStyleDnaSummary(brief);
  const budgetCap = budgetCapFromRange(brief.budgetRange);
  const budgetCounts = getBudgetCounts(recommendations, budgetCap);
  const averageConfidence =
    recommendations.length > 0
      ? recommendations.reduce((sum, recommendation) => sum + recommendation.confidenceScore, 0) /
        recommendations.length
      : 0;
  const fallbackWarning =
    recommendations.length > 0 &&
    recommendations.filter((recommendation) => recommendation.confidenceScore < 55).length >=
      Math.ceil(recommendations.length * 0.6);
  const warnings: string[] = [];
  const criticalIssues: string[] = [];

  const descriptor = getOccasionResultsDescriptor(brief.occasion);
  const visibleText = recommendations
    .flatMap((recommendation) => [
      formatAestheticLabel(recommendation.aesthetic, brief.stylePreference),
      recommendation.name,
      recommendation.creatorUseCase,
      recommendation.fitNote,
      recommendation.whyItWorks,
      recommendation.budgetMatchLabel,
      recommendation.budgetNote,
      recommendation.occasionMatch,
      recommendation.styleMatch,
      recommendation.colorHarmony,
      recommendation.fitConfidence,
      recommendation.sizeCompatibility,
      recommendation.storeMatch,
      recommendation.stylingSummary,
      ...recommendation.matchReasons,
      ...recommendation.fitTags,
      ...recommendation.smartSwaps.flatMap((swap) => [swap.label, swap.suggestion, swap.reason]),
      recommendation.items.top.name,
      recommendation.items.bottom.name,
      recommendation.items.shoes.name,
      recommendation.items.accessory?.name ?? "",
      recommendation.items.outerwear?.name ?? "",
    ])
    .join(" ")
    .toLowerCase();

  if (recommendations.length === 0) {
    criticalIssues.push("Zero recommendations returned.");
  }

  if (budgetCounts.overBudget === recommendations.length && recommendations.length > 0) {
    if (budgetCap && budgetCap <= 100) {
      warnings.push(
        "Every recommendation is over budget for this under-$100 scenario. Review whether the catalog needs more true entry-budget outfit combinations.",
      );
    } else {
      criticalIssues.push("Every recommendation is clearly over budget.");
    }
  }

  if (
    recommendations.length > 0 &&
    budgetCounts.withinBudget === recommendations.length &&
    budgetCap &&
    budgetCap >= 200
  ) {
    warnings.push("All results landed within budget. Review whether stretch options are being suppressed too hard.");
  }

  if (budgetCounts.stretchUpgrade > Math.max(2, Math.ceil(recommendations.length * 0.25))) {
    warnings.push("Too many stretch-upgrade results are showing for this scenario.");
  }

  if (
    recommendations.length > 0 &&
    budgetCap &&
    budgetCap <= 200 &&
    budgetCounts.withinBudget === 0 &&
    budgetCounts.nearBudget === 0
  ) {
    if (budgetCap <= 100) {
      warnings.push(
        "No within-budget or near-budget options were returned here. The under-$100 catalog still needs stronger core outfit coverage.",
      );
    } else {
      criticalIssues.push("No within-budget or near-budget options were returned for a common lower-budget scenario.");
    }
  }

  if (budgetCounts.budgetLabelMismatchCount > 0) {
    criticalIssues.push("One or more recommendation budget labels do not match the computed budget classification.");
  }

  if (brief.stylePreference !== "feminine" && visibleText.includes("clean girl")) {
    criticalIssues.push("A non-feminine scenario still exposes the Clean Girl label.");
  }

  if (brief.stylePreference === "feminine" && /(gentleman|menswear)/.test(visibleText)) {
    warnings.push("Feminine results contain masculine-only copy signals.");
  }

  if (!["reels", "photoshoot", "brand content"].includes(brief.occasion) && descriptor === "creator-ready") {
    criticalIssues.push(`Occasion descriptor regressed to creator-ready for ${brief.occasion}.`);
  }

  if (["reels", "photoshoot", "brand content"].includes(brief.occasion) && descriptor !== "creator-ready") {
    criticalIssues.push("Creator-focused occasion did not use creator-ready wording.");
  }

  if (!["reels", "photoshoot", "brand content"].includes(brief.occasion) && hasCreatorCopy(recommendations)) {
    criticalIssues.push("Creator-only copy appeared in a non-creator scenario.");
  }

  if (
    fallbackWarning &&
    ["date", "office", "daily wear", "travel", "party"].includes(brief.occasion)
  ) {
    if (budgetCap && budgetCap <= 100) {
      warnings.push(
        "Fallback messaging would appear here because the current under-$100 catalog is still thin for this scenario.",
      );
    } else {
      criticalIssues.push("Fallback warning would appear for a common scenario.");
    }
  }

  if (hasSavedSnapshotShapeIssue(recommendations[0])) {
    criticalIssues.push("Recommendation shape would break saved-look snapshots.");
  }

  if (!styleDnaSummary || !styleDnaSummary.startsWith("Your Style DNA:")) {
    criticalIssues.push("Style DNA could not be generated from the brief.");
  }

  if (recommendations.some((recommendation) => recommendation.confidenceScore <= 0 || Number.isNaN(recommendation.confidenceScore))) {
    criticalIssues.push("One or more recommendations are missing a valid confidence score.");
  }

  if (recommendations.some((recommendation) => recommendation.matchReasons.length === 0)) {
    criticalIssues.push("One or more recommendations are missing match reasons.");
  }

  if (
    recommendations.some(
      (recommendation) =>
        !recommendation.items.top ||
        !recommendation.items.bottom ||
        !recommendation.items.shoes ||
        recommendation.totalPrice <= 0,
    )
  ) {
    criticalIssues.push("One or more recommendations are missing core items or valid prices.");
  }

  if (new Set(recommendations.map((recommendation) => recommendation.id)).size !== recommendations.length) {
    criticalIssues.push("Duplicate outfits were returned for the same scenario.");
  }

  if (
    scenario.expectations?.descriptor &&
    descriptor !== scenario.expectations.descriptor
  ) {
    criticalIssues.push(
      `Expected ${scenario.expectations.descriptor} wording but got ${descriptor}.`,
    );
  }

  if (
    scenario.expectations?.mostlyWithinOrNear &&
    recommendations.length > 0 &&
    budgetCounts.withinBudget + budgetCounts.nearBudget <
      Math.ceil(recommendations.length * 0.7)
  ) {
    criticalIssues.push("Too few within/near-budget results for a common scenario.");
  }

  if (
    typeof scenario.expectations?.maxStretch === "number" &&
    budgetCounts.stretchUpgrade > scenario.expectations.maxStretch
  ) {
    criticalIssues.push(
      `Expected at most ${scenario.expectations.maxStretch} stretch upgrades but found ${budgetCounts.stretchUpgrade}.`,
    );
  }

  if (scenario.expectations?.noCleanGirl && visibleText.includes("clean girl")) {
    criticalIssues.push("Clean Girl wording appeared where it should stay hidden.");
  }

  if (scenario.expectations?.noFallback && fallbackWarning) {
    criticalIssues.push("Fallback warning would appear, but this scenario should feel like a normal success case.");
  }

  if (scenario.expectations?.noCreatorCopy && hasCreatorCopy(recommendations)) {
    criticalIssues.push("Creator-only use-case copy appeared in this scenario.");
  }

  if (scenario.expectations?.avoidUtilitySignals && hasUtilitySignals(recommendations)) {
    criticalIssues.push("Utility-heavy or outdoor-coded pieces showed up in the feminine clean-minimal date mix.");
  }

  if (scenario.expectations?.requireVerticalLineSignal && !hasVerticalLineSignal(recommendations)) {
    criticalIssues.push("Petite vertical-line logic did not surface clearly in the result copy or item mix.");
  }

  if (scenario.expectations?.requireSmartSwaps && !recommendations.some((recommendation) => recommendation.smartSwaps.length > 0)) {
    criticalIssues.push("Smart swaps did not appear where they were expected.");
  }

  if (scenario.expectations?.requireOfficeSignals && hasOfficeMismatch(recommendations)) {
    criticalIssues.push("Office results include items or language that feel too party, gym, or club coded.");
  }

  if (scenario.expectations?.requireTravelSignals && !hasTravelSignal(recommendations)) {
    criticalIssues.push("Travel results did not surface comfort, layering, or low-maintenance logic clearly enough.");
  }

  if (scenario.expectations?.requireCreatorSignals && !hasCreatorSignal(recommendations)) {
    criticalIssues.push("Creator/photoshoot scenario did not surface creator-oriented reasoning.");
  }

  if (scenario.expectations?.requireOldMoneySignals && hasOldMoneyMismatch(recommendations)) {
    criticalIssues.push("Old-money results surfaced loud or off-brief style signals too often.");
  }

  if (scenario.expectations?.avoidPetiteBagIssue && hasPetiteBagIssue(recommendations)) {
    criticalIssues.push("Petite scenario surfaced oversized bag logic that could overwhelm the frame.");
  }

  return {
    scenario,
    recommendations,
    ...budgetCounts,
    averageConfidence,
    fallbackWarning,
    styleDnaSummary,
    warnings,
    criticalIssues,
  };
}

let totalWarnings = 0;
let totalCriticalIssues = 0;

console.log(`Running ${scenarios.length} recommendation scenarios...`);

const results = scenarios.map(analyzeScenario);

for (const result of results) {
  const descriptor = getOccasionResultsDescriptor(result.scenario.brief.occasion);

  console.log(`\n=== ${result.scenario.label} ===`);
  console.log(
    `Results: ${result.recommendations.length} | Within: ${result.withinBudget} | Near: ${result.nearBudget} | Stretch: ${result.stretchUpgrade} | Over: ${result.overBudget} | Label mismatches: ${result.budgetLabelMismatchCount} | Avg confidence: ${result.averageConfidence.toFixed(1)} | Fallback warning: ${result.fallbackWarning ? "yes" : "no"}`,
  );
  console.log(
    `Descriptor: ${descriptor} | Aesthetic label: ${formatAestheticLabel(
      result.scenario.brief.aesthetic,
      result.scenario.brief.stylePreference,
    )}`,
  );
  console.log(`Style DNA: ${result.styleDnaSummary}`);

  if (result.recommendations[0]) {
    console.log(
      `Top look: ${result.recommendations[0].name} | ${result.recommendations[0].budgetMatchLabel} | ${result.recommendations[0].matchQualityLabel}`,
    );
    console.log(
      `Top match reasons: ${result.recommendations[0].matchReasons.slice(0, 3).join(" | ")}`,
    );
    console.log(
      `Smart swaps: ${result.recommendations[0].smartSwaps.length} | Price breakdown rows: ${result.recommendations[0].priceBreakdown.length}`,
    );
  }

  if (result.warnings.length === 0 && result.criticalIssues.length === 0) {
    console.log("Warnings: none");
  } else {
    for (const warning of result.warnings) {
      console.log(`Warning: ${warning}`);
      totalWarnings += 1;
    }

    for (const issue of result.criticalIssues) {
      console.log(`Critical: ${issue}`);
      totalCriticalIssues += 1;
    }
  }
}

const keyResults = results.filter((result) => result.scenario.key);
const keyScenarioPassCount = keyResults.filter(
  (result) => result.criticalIssues.length === 0,
).length;

console.log(`\n=== Recommendation QA Summary ===`);
console.log(`Scenarios checked: ${results.length}`);
console.log(`Key scenarios passing: ${keyScenarioPassCount}/${keyResults.length}`);
console.log(`Warnings: ${totalWarnings}`);
console.log(`Critical issues: ${totalCriticalIssues}`);

if (totalCriticalIssues > 0) {
  process.exitCode = 1;
}
